export interface BaseChatCompletionOptions {
  messages: any[] | string
  result: { value: string }
  historyDialog: { value: any[] }
  errorIssue: { value: boolean }
  loading: { value: boolean }
  maxTokens?: number
  temperature?: number
}

export interface CompletionResponse {
  content: string
  role?: string
}
