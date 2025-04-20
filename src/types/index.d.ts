interface IStringKeyMap {
  [propName: string]: any
}

type supportedPlatforms = 'gemini' | 'ollama' | 'groq' | 'together' | 'openrouter'

type insertTypes = 'replace' |  'append' |  'newLine' | 'NoAction'