import { CompletionResponse } from './types'

export function updateResult(
  response: CompletionResponse,
  result: { value: string },
  historyDialog: { value: any[] }
): void {
  result.value = response.content

  historyDialog.value.push({
    role: response.role || 'assistant',
    content: response.content
  })
}

export function handleError(
  error: Error,
  result: { value: string },
  errorIssue: { value: boolean }
): void {
  result.value = String(error)
  errorIssue.value = true
  console.error(error)
}

export function finishLoading(loading: { value: boolean }): void {
  loading.value = false
}
