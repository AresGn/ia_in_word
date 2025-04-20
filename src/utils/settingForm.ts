import { ref } from 'vue'
import { SettingNames, settingPreset } from './settingPreset'

function useSettingForm() {
  // Créer d'abord l'objet initial
  const initialSettings = Object.keys(settingPreset).reduce(
    (acc, key) => {
      const presetKey = key as SettingNames
      acc[presetKey] = settingPreset[presetKey].defaultValue
      return acc
    },
    {} as { [key in SettingNames]: any }
  )

  // Ensuite utiliser ref sans arguments de type
  const settingForm = ref(initialSettings)

  // Load values from storage
  Object.keys(settingForm.value).forEach(key => {
    const typedKey = key as SettingNames
    if (settingPreset[typedKey].getFunc) {
      settingForm.value[typedKey] = settingPreset[typedKey].getFunc!()
      return
    }

    const storageKey = settingPreset[typedKey].saveKey || key
    const savedValue = localStorage.getItem(storageKey)

    // S'assurer que les valeurs sont correctement chargées, en particulier pour les clés API
    if (savedValue !== null && savedValue !== undefined && savedValue !== '') {
      settingForm.value[typedKey] = savedValue
    }
  })

  // Special case for legacy support
  if (settingForm.value.api === 'palm') {
    settingForm.value.api = 'gemini'
    localStorage.setItem('api', 'gemini')
  }

  return {
    settingForm,
    settingFormKeys: Object.keys(settingForm.value) as SettingNames[]
  }
}

export default useSettingForm
