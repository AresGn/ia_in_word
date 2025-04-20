import {
  availableAPIs,
  availableModels,
  availableModelsForGemini,
  availableModelsForGroq,
  availableModelsForOllama,
  availableModelsForTogether,
  availableModelsForOpenRouter,
  languageMap
} from './constant'

export interface Auth {
  type: supportedPlatforms
  [propName: string]: any
}

export function checkAuth(auth: {
  type: string
  geminiAPIKey: string
  togetherAPIKey: string
  openrouterAPIKey: string
}) {
  if (auth.type === 'gemini') {
    return !!auth.geminiAPIKey && auth.geminiAPIKey.trim().length > 0
  } else if (auth.type === 'together') {
    return !!auth.togetherAPIKey && auth.togetherAPIKey.trim().length > 0
  } else if (auth.type === 'openrouter') {
    return !!auth.openrouterAPIKey && auth.openrouterAPIKey.trim().length > 0
  }
  return false
}

export function forceNumber(val: any): number {
  return Number(val) || 0
}

export function getOptionList(
  map: Record<string, string>,
  from: 'key' | 'value' = 'key',
  isUseValueAsLabel = false
) {
  return from === 'key'
    ? Object.keys(map).map(key => ({
        label: isUseValueAsLabel ? map[key] : key,
        value: map[key]
      }))
    : Object.values(map).map(key => ({
        label: key,
        value: key
      }))
}

const localLanguageList = [
  { label: 'English', value: 'en' },
  { label: '简体中文', value: 'zh-cn' },
  { label: 'Français', value: 'fr' }
]

export const optionLists = {
  localLanguageList,
  apiList: getOptionList(availableAPIs),
  replyLanguageList: getOptionList(languageMap, 'value'),
  officialModelList: getOptionList(availableModels),
  geminiModelList: getOptionList(availableModelsForGemini),
  ollamaModelList: getOptionList(availableModelsForOllama),
  groqModelList: getOptionList(availableModelsForGroq),
  togetherModelList: getOptionList(availableModelsForTogether, 'key', true),
  openrouterModelList: getOptionList(availableModelsForOpenRouter, 'key', true)
}

export const getLabel = (key: string) => `${key}Label`
export const getPlaceholder = (key: string) => `${key}Placeholder`
