import Together from 'together-ai'
import { BaseChatCompletionOptions } from './types'
import { updateResult, handleError, finishLoading } from './utils'

function setConfig(apiKey: string): Together {
  return new Together({
    apiKey
  })
}

interface ChatCompletionStreamOptions extends BaseChatCompletionOptions {
  config: Together
  model?: string
}

async function createChatCompletionStream(
  options: ChatCompletionStreamOptions
): Promise<void> {
  try {
    const together = options.config

    const response = await together.chat.completions.create({
      model: options.model ?? 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free',
      messages: options.messages as any[],
      temperature: 0.7,
      max_tokens: 800
    })

    updateResult(
      {
        content:
          response.choices[0].message?.content?.replace(/\\n/g, '\n') ?? ''
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
