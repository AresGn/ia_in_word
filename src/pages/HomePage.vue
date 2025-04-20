<template>
  <div class="container">
    <el-form label-position="left" label-width="70px">
      <el-form-item>
        <template #label>
          <span>{{ $t('homeSystem') }}</span>
        </template>
        <el-input
          v-model="systemPrompt"
          clearable
          size="small"
          :placeholder="$t('homeSystemDescription')"
          @blur="handelSystemPromptChange(systemPrompt)"
        />
        <div class="select-with-icons">
          <el-select
            v-model="systemPromptSelected"
            size="small"
            placeholder="Select a system prompt"
            @change="handelSystemPromptChange"
          >
            <el-option
              v-for="item in systemPromptList"
              :key="item.value"
              :label="item.key"
              :value="item.value"
            />
          </el-select>
          <el-icon
            color="#409EFF"
            class="action-icon"
            size="15px"
            @click="addSystemPromptVisible = true"
          >
            <CirclePlus />
          </el-icon>
          <el-icon
            color="red"
            class="action-icon"
            size="15px"
            @click="removeSystemPromptVisible = true"
          >
            <Remove />
          </el-icon>
        </div>
      </el-form-item>
      <el-form-item>
        <template #label>
          <span>{{ $t('homePrompt') }}</span>
        </template>
        <el-input
          v-model="prompt"
          autofocus
          clearable
          size="small"
          :placeholder="$t('homePromptDescription')"
          @blur="handelPromptChange(prompt)"
        />
        <div class="select-with-icons">
          <el-select
            v-model="promptSelected"
            size="small"
            placeholder="Select a prompt"
            @change="handelPromptChange"
          >
            <el-option
              v-for="item in promptList"
              :key="item.value"
              :label="item.key"
              :value="item.value"
            />
          </el-select>
          <el-icon
            color="#409EFF"
            class="action-icon"
            size="15px"
            @click="addPromptVisible = true"
          >
            <CirclePlus />
          </el-icon>
          <el-icon
            color="red"
            class="action-icon"
            size="15px"
            @click="removePromptVisible = true"
          >
            <Remove />
          </el-icon>
        </div>
      </el-form-item>
      <SelectItem
        v-model="settingForm.replyLanguage"
        label="replyLanguageLabel"
        :option-list="settingPreset.replyLanguage.optionList"
        placeholder="replyLanguagePlaceholder"
      />
      <SelectItem
        v-model="insertType"
        label="insertType"
        :option-list="insertTypeList"
        placeholder="insertTypePlaceholder"
        @change="handelInsertTypeChange"
      />
    </el-form>
    <div style="width: 100%">
      <el-progress
        v-if="loading"
        :percentage="50"
        indeterminate
        :duration="5"
        status="warning"
        style="widows: 100%"
      />
    </div>
    <el-button-group class="input-group" style="margin-top: 5px">
      <el-button
        v-for="item in actionList"
        :key="item"
        class="api-button"
        type="primary"
        size="small"
        :disabled="loading"
        @click="performAction(item)"
      >
        {{ $t(item) }}
      </el-button>

      <el-button
        class="api-button"
        type="warning"
        size="small"
        @click="settings"
      >
        {{ $t('settings') }}
      </el-button>
    </el-button-group>
    <div
      style="
        margin-top: 5px;
        align-items: center;
        display: flex;
        margin-bottom: 5px;
      "
    >
      <el-button-group>
        <el-button
          class="api-button"
          type="success"
          size="default"
          :disabled="loading"
          @click="StartChat"
        >
          {{ $t('start') }}
        </el-button>
        <el-button
          v-if="
            ['gemini', 'ollama', 'groq', 'together', 'openrouter'].includes(
              settingForm.api
            )
          "
          class="api-button"
          type="success"
          size="default"
          :disabled="loading"
          @click="continueChat"
        >
          {{ $t('continue') }}
        </el-button>
      </el-button-group>
    </div>
    <div class="result-group">
      <el-input
        v-model="result"
        type="textarea"
        autosize
        :row="5"
        :aria-placeholder="$t('result')"
      />
    </div>
    <HomePageAddDialog
      v-model:add-visible="addSystemPromptVisible"
      v-model:add-alias="addSystemPromptAlias"
      v-model:add-value="addSystemPromptValue"
      title="addSystemPrompt"
      alias-label="addSystemPromptAlias"
      alias-placeholder="addSystemPromptAliasDescription"
      prompt-label="homeSystem"
      prompt-placeholder="addSystemPromptDescription"
      @add="addSystemPrompt"
    />
    <HomePageAddDialog
      v-model:add-visible="addPromptVisible"
      v-model:add-alias="addPromptAlias"
      v-model:add-value="addPromptValue"
      title="addPrompt"
      alias-label="addPromptAlias"
      alias-placeholder="addPromptAliasDescription"
      prompt-label="homePrompt"
      prompt-placeholder="homePromptDescription"
      @add="addPrompt"
    />
    <HomePageDialog
      v-model:remove-visible="removeSystemPromptVisible"
      v-model:remove-value="removeSystemPromptValue"
      title="removeSystemPrompt"
      :option-list="systemPromptList"
      @remove="removeSystemPrompt"
    />
    <HomePageDialog
      v-model:remove-visible="removePromptVisible"
      v-model:remove-value="removePromptValue"
      title="removePrompt"
      :option-list="promptList"
      @remove="removePrompt"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { CirclePlus, Remove } from '@element-plus/icons-vue'
import { onBeforeMount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import API from '@/api'

import { buildInPrompt, characterPrompts } from '@/utils/constant'
import { promptDbInstance } from '@/store/promtStore'

import { checkAuth } from '@/utils/common'
import { localStorageKey } from '@/utils/enum'
import useSettingForm from '@/utils/settingForm'
import { settingPreset } from '@/utils/settingPreset'

import SelectItem from '@/components/SelectItem.vue'
import HomePageDialog from '@/components/HomePageDialog.vue'
import HomePageAddDialog from '@/components/HomePageAddDialog.vue'

// Define types
interface IStringKeyMap {
  key: string
  value: string
}

type insertTypes = 'replace' | 'append' | 'newLine' | 'NoAction'

const { t } = useI18n()
const { settingForm } = useSettingForm()

// system prompt
const systemPrompt = ref('')
const systemPromptSelected = ref('')
const systemPromptList = ref([])
const addSystemPromptVisible = ref(false)
const addSystemPromptAlias = ref('')
const addSystemPromptValue = ref('')
const removeSystemPromptVisible = ref(false)
const removeSystemPromptValue = ref([])

// user prompt
const prompt = ref('')
const promptSelected = ref('')
const promptList = ref([])
const addPromptVisible = ref(false)
const addPromptAlias = ref('')
const addPromptValue = ref('')
const removePromptVisible = ref(false)
const removePromptValue = ref([])

// result
const result = ref('res')
const loading = ref(false)
const router = useRouter()
const historyDialog = ref([])

const jsonIssue = ref(false)
const errorIssue = ref(false)

// insert type
const insertType = ref('replace')
const insertTypeList = ['replace', 'append', 'newLine', 'NoAction'].map(
  item => ({
    label: t(item),
    value: item
  })
)

async function getSystemPromptList() {
  const table = promptDbInstance.table('systemPrompt')
  const list = (await table.toArray()) as unknown as IStringKeyMap[]
  systemPromptList.value = list
}

async function addSystemPrompt() {
  const table = promptDbInstance.table('systemPrompt')
  await table.put({
    key: addSystemPromptAlias.value,
    value: addSystemPromptValue.value
  })
  addSystemPromptVisible.value = false
  getSystemPromptList()
}

async function removeSystemPrompt() {
  removeSystemPromptVisible.value = false
  const table = promptDbInstance.table('systemPrompt')
  for (const value of removeSystemPromptValue.value) {
    await table.delete(value)
  }
  removeSystemPromptValue.value = []
  getSystemPromptList()
}

async function removePrompt() {
  removePromptVisible.value = false
  const table = promptDbInstance.table('userPrompt')
  for (const value of removePromptValue.value) {
    await table.delete(value)
  }
  removePromptValue.value = []
  getPromptList()
}

function handelSystemPromptChange(val: string) {
  systemPrompt.value = val
  localStorage.setItem(localStorageKey.defaultSystemPrompt, val)
}

async function getPromptList() {
  const table = promptDbInstance.table('userPrompt')
  const list = (await table.toArray()) as unknown as IStringKeyMap[]
  promptList.value = list
}

async function addPrompt() {
  const table = promptDbInstance.table('userPrompt')
  await table.put({
    key: addPromptAlias.value,
    value: addPromptValue.value
  })
  addPromptVisible.value = false
  getPromptList()
}

function handelPromptChange(val: string) {
  prompt.value = val
  localStorage.setItem(localStorageKey.defaultPrompt, val)
}

const addWatch = () => {
  watch(
    () => settingForm.value.replyLanguage,
    () => {
      localStorage.setItem('replyLanguage', settingForm.value.replyLanguage)
    }
  )
}

async function initData() {
  insertType.value =
    (localStorage.getItem(localStorageKey.insertType) as insertTypes) ||
    'replace'
  systemPrompt.value =
    localStorage.getItem(localStorageKey.defaultSystemPrompt) ||
    'Act like a personal assistant.'
  await getSystemPromptList()

  // Ajout des personnages prédéfinis s'ils n'existent pas
  await initPredefinedCharacters()

  // S'assurer que les clés API sont correctement chargées depuis localStorage
  if (settingForm.value.api === 'gemini') {
    const savedKey = localStorage.getItem('geminiAPIKey')
    if (savedKey && savedKey !== settingForm.value.geminiAPIKey) {
      settingForm.value.geminiAPIKey = savedKey
    }
  } else if (settingForm.value.api === 'together') {
    const savedKey = localStorage.getItem('togetherAPIKey')
    if (savedKey && savedKey !== settingForm.value.togetherAPIKey) {
      settingForm.value.togetherAPIKey = savedKey
    }
  } else if (settingForm.value.api === 'openrouter') {
    const savedKey = localStorage.getItem('openrouterAPIKey')
    if (savedKey && savedKey !== settingForm.value.openrouterAPIKey) {
      settingForm.value.openrouterAPIKey = savedKey
    }
  }

  if (
    systemPromptList.value.find(
      (item: IStringKeyMap) => item.value === systemPrompt.value
    )
  ) {
    systemPromptSelected.value = systemPrompt.value
  }
  prompt.value = localStorage.getItem(localStorageKey.defaultPrompt) || ''
  await getPromptList()
  if (
    promptList.value.find((item: IStringKeyMap) => item.value === prompt.value)
  ) {
    promptSelected.value = prompt.value
  }
}

// Fonction pour ajouter les personnages prédéfinis
async function initPredefinedCharacters() {
  const table = promptDbInstance.table('systemPrompt')
  const existingPrompts = await table.toArray()
  const existingKeys = existingPrompts.map((item: IStringKeyMap) => item.key)

  for (const [key, value] of Object.entries(characterPrompts)) {
    const characterName = key.charAt(0).toUpperCase() + key.slice(1)
    if (!existingKeys.includes(characterName)) {
      await table.put({
        key: characterName,
        value
      })
    }
  }

  // Rafraîchir la liste des prompts système
  await getSystemPromptList()
}

function handelInsertTypeChange(val: insertTypes) {
  insertType.value = val
  localStorage.setItem(localStorageKey.insertType, val)
}

async function template(taskType: keyof typeof buildInPrompt | 'custom') {
  loading.value = true
  let systemMessage
  let userMessage = ''
  const getSeletedText = async () => {
    return Word.run(async context => {
      const range = context.document.getSelection()
      range.load('text')
      await context.sync()
      return range.text
    })
  }
  const selectedText = await getSeletedText()
  if (taskType === 'custom') {
    if (systemPrompt.value.includes('{language}')) {
      systemMessage = systemPrompt.value.replace(
        '{language}',
        settingForm.value.replyLanguage
      )
    } else {
      systemMessage = systemPrompt.value
    }
    if (userMessage.includes('{text}')) {
      userMessage = userMessage.replace('{text}', selectedText)
    } else {
      userMessage = `Reply in ${settingForm.value.replyLanguage} ${prompt.value} ${selectedText}`
    }
  } else {
    systemMessage = buildInPrompt[taskType].system(
      settingForm.value.replyLanguage
    )
    userMessage = buildInPrompt[taskType].user(
      selectedText,
      settingForm.value.replyLanguage
    )
  }

  // Préparation des messages en fonction du modèle
  if (settingForm.value.api === 'gemini' && settingForm.value.geminiAPIKey) {
    // Format spécial pour Gemini
    historyDialog.value = [
      {
        role: 'user',
        parts: [
          {
            text: systemMessage + '\n' + userMessage
          }
        ]
      },
      {
        role: 'model',
        parts: [
          {
            text: 'Je suis prêt à vous aider.'
          }
        ]
      }
    ]

    const config = API.gemini.setConfig(settingForm.value.geminiAPIKey)

    await API.gemini.createChatCompletionStream({
      config,
      messages: userMessage,
      result,
      historyDialog,
      errorIssue,
      loading,
      temperature: 0.7,
      maxTokens: 800,
      model: settingForm.value.geminiModelSelect
    })
  } else if (
    settingForm.value.api === 'together' &&
    settingForm.value.togetherAPIKey
  ) {
    historyDialog.value = [
      {
        role: 'system',
        content: systemMessage
      },
      {
        role: 'user',
        content: userMessage
      }
    ]

    const config = API.together.setConfig(settingForm.value.togetherAPIKey)

    await API.together.createChatCompletionStream({
      config,
      messages: historyDialog.value,
      model: settingForm.value.togetherModelSelect,
      result,
      historyDialog,
      loading,
      errorIssue
    })
  } else if (
    settingForm.value.api === 'openrouter' &&
    settingForm.value.openrouterAPIKey
  ) {
    historyDialog.value = [
      {
        role: 'system',
        content: systemMessage
      },
      {
        role: 'user',
        content: userMessage
      }
    ]

    const config = API.openrouter.setConfig(
      settingForm.value.openrouterAPIKey,
      '', // Site URL vide
      '' // Site Name vide
    )

    await API.openrouter.createChatCompletionStream({
      config,
      messages: historyDialog.value,
      model: settingForm.value.openrouterModelSelect,
      result,
      historyDialog,
      loading,
      errorIssue,
      temperature: 0.7,
      maxTokens: 800
    })
  } else {
    ElMessage.error('Set API Key or Access Token first')
    return
  }

  if (errorIssue.value === true) {
    errorIssue.value = false
    ElMessage.error('Something is wrong')
    return
  }

  if (!jsonIssue.value) {
    API.common.insertResult(result, insertType)
  }
}

function checkApiKey() {
  const auth = {
    type: settingForm.value.api,
    geminiAPIKey: settingForm.value.geminiAPIKey,
    togetherAPIKey: settingForm.value.togetherAPIKey,
    openrouterAPIKey: settingForm.value.openrouterAPIKey
  }

  // Afficher un message plus descriptif en fonction de l'API sélectionnée
  if (!checkAuth(auth)) {
    let apiName = ''
    switch (settingForm.value.api) {
      case 'gemini':
        apiName = 'Gemini'
        break
      case 'together':
        apiName = 'Together'
        break
      case 'openrouter':
        apiName = 'OpenRouter'
        break
      default:
        apiName = settingForm.value.api
    }

    ElMessage({
      message: `${t('emptyAPIKey')} (${apiName})`,
      type: 'error',
      duration: 5000,
      showClose: true,
      onClose: () => {
        // Rediriger vers les paramètres après 1 seconde
        setTimeout(() => {
          router.push('/settings')
        }, 1000)
      }
    })
    return false
  }
  return true
}

const actionList = Object.keys(buildInPrompt) as (keyof typeof buildInPrompt)[]

async function performAction(action: keyof typeof buildInPrompt) {
  if (!checkApiKey()) return
  template(action)
}

function settings() {
  router.push('/settings')
}

function StartChat() {
  if (!checkApiKey()) return
  template('custom')
}

async function continueChat() {
  if (!checkApiKey()) return
  loading.value = true
  try {
    let geminiConfig
    let togetherConfig
    let openrouterConfig

    switch (settingForm.value.api) {
      case 'gemini':
        historyDialog.value.push({
          role: 'user',
          parts: [
            {
              text: 'continue'
            }
          ]
        })

        geminiConfig = API.gemini.setConfig(settingForm.value.geminiAPIKey)

        await API.gemini.createChatCompletionStream({
          config: geminiConfig,
          messages: 'continue',
          result,
          historyDialog,
          errorIssue,
          loading,
          temperature: 0.7,
          maxTokens: 800,
          model: settingForm.value.geminiModelSelect
        })
        break
      case 'together':
        historyDialog.value.push({
          role: 'user',
          content: 'continue'
        })
        togetherConfig = API.together.setConfig(
          settingForm.value.togetherAPIKey
        )

        await API.together.createChatCompletionStream({
          config: togetherConfig,
          messages: historyDialog.value,
          model: settingForm.value.togetherModelSelect,
          result,
          historyDialog,
          loading,
          errorIssue
        })
        break
      case 'openrouter':
        historyDialog.value.push({
          role: 'user',
          content: 'continue'
        })
        openrouterConfig = API.openrouter.setConfig(
          settingForm.value.openrouterAPIKey,
          '', // Site URL vide
          '' // Site Name vide
        )

        await API.openrouter.createChatCompletionStream({
          config: openrouterConfig,
          messages: historyDialog.value,
          model: settingForm.value.openrouterModelSelect,
          result,
          historyDialog,
          loading,
          errorIssue,
          temperature: 0.7,
          maxTokens: 800
        })
        break
      default:
        break
    }
  } catch (error) {
    result.value = String(error)
    errorIssue.value = true
    console.error(error)
  }
  if (errorIssue.value === true) {
    errorIssue.value = false
    ElMessage.error('Something is wrong')
    return
  }
  API.common.insertResult(result, insertType)
}

onBeforeMount(() => {
  addWatch()
  initData()
})
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
}

.input-group {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.api-button {
  margin-left: 10px;
  border-radius: 10px;
}

.select-with-icons {
  display: flex;
  align-items: center;
  margin-top: 5px;
}

.action-icon {
  cursor: pointer;
  margin-left: 5px;
  vertical-align: middle;
}

.result-group {
  width: 100%;
}
</style>
