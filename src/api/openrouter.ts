import axios from 'axios'
import { BaseChatCompletionOptions } from './types'
import { updateResult, handleError, finishLoading } from './utils'

interface OpenRouterConfig {
  apiKey: string
  siteUrl?: string
  siteName?: string
}

function setConfig(
  apiKey: string,
  siteUrl: string = '',
  siteName: string = ''
): OpenRouterConfig {
  return {
    apiKey,
    siteUrl,
    siteName
  }
}

interface ChatCompletionStreamOptions extends BaseChatCompletionOptions {
  config: OpenRouterConfig
  model?: string
}

async function createChatCompletionStream(
  options: ChatCompletionStreamOptions
): Promise<void> {
  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${options.config.apiKey}`,
      'Content-Type': 'application/json'
    }

    if (options.config.siteUrl) {
      headers['HTTP-Referer'] = options.config.siteUrl
    }

    if (options.config.siteName) {
      headers['X-Title'] = options.config.siteName
    }

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: options.model ?? 'deepseek/deepseek-chat',
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 800
      },
      { headers }
    )

    updateResult(
      {
        content:
          response.data.choices[0].message?.content?.replace(/\\n/g, '\n') ?? ''
      },
      options.result,
      options.historyDialog
    )
  } catch (error: unknown) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.error?.message || error.message
      : String(error)
    handleError(new Error(message), options.result, options.errorIssue)
  } finally {
    finishLoading(options.loading)
  }
}

export default {
  setConfig,
  createChatCompletionStream
}
