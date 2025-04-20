import { GoogleGenerativeAI } from '@google/generative-ai'
import { BaseChatCompletionOptions } from './types'
import { updateResult, handleError, finishLoading } from './utils'

function setConfig(apiKey: string): GoogleGenerativeAI {
  return new GoogleGenerativeAI(apiKey)
}

interface ChatCompletionStreamOptions extends BaseChatCompletionOptions {
  config: GoogleGenerativeAI
  model?: string
}

async function createChatCompletionStream(
  options: ChatCompletionStreamOptions
): Promise<void> {
  try {
    const genAI = options.config

    const geminiConfig = {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 800
    }

    const modelName = options.model ?? 'gemini-1.5-flash'
    const model = genAI.getGenerativeModel({ model: modelName })

    // Convertir les messages au format Gemini
    const contents = Array.isArray(options.messages)
      ? options.messages.map((msg: any) => ({
          role: msg.role === 'assistant' ? 'model' : msg.role,
          parts: [{ text: msg.content }]
        }))
      : [{ role: 'user', parts: [{ text: options.messages as string }] }]

    let fullResponse = ''
    const responseStream = await model.generateContentStream({
      contents,
      generationConfig: geminiConfig
    })

    for await (const chunk of responseStream.stream) {
      const chunkText = chunk.text()
      fullResponse += chunkText
    }

    updateResult(
      {
        content: fullResponse
      },
      options.result,
      options.historyDialog
    )
  } catch (error) {
    const message = String(error)
    handleError(new Error(message), options.result, options.errorIssue)
  } finally {
    finishLoading(options.loading)
  }
}

export default {
  setConfig,
  createChatCompletionStream
}
