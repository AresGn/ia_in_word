<template>
  <div id="setting">
    <el-row
      class="view-title"
      align="middle"
      justify="center"
      style="font-size: 20px; color: black"
    >
      {{ $t('settings') }}
    </el-row>
    <el-row class="setting-list" style="margin-top: 20px">
      <el-col :span="20" :offset="2" />
      <el-row
        style="
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
        "
      >
        <el-form label-position="left" size="default" label-width="50%">
          <SelectItem
            v-for="item in commonSettingList"
            :key="item"
            v-model="settingForm[item as SettingNames]"
            :label="getLabel(item)"
            :option-list="settingPreset[item as SettingNames].optionList"
            :placeholder="getPlaceholder(item)"
          />
          <template
            v-for="platform in Object.keys(availableAPIs)"
            :key="platform"
          >
            <template v-if="settingForm.api === platform">
              <InputItem
                v-for="item in Object.keys(settingForm).filter(
                  key =>
                    key.startsWith(platform) &&
                    settingPreset[key as SettingNames].type === 'input'
                )"
                :key="item"
                v-model="settingForm[item as SettingNames]"
                :label="getLabel(item)"
                :placeholder="getPlaceholder(item)"
              />
              <InputNumItem
                v-for="item in Object.keys(settingForm).filter(
                  key =>
                    key.startsWith(platform) &&
                    settingPreset[key as SettingNames].type === 'inputNum'
                )"
                :key="item"
                v-model="settingForm[item as SettingNames]"
                :step-style="settingPreset[item as SettingNames].stepStyle"
                :label="getLabel(item)"
              />
              <SelectItem
                v-for="item in Object.keys(settingForm).filter(
                  key =>
                    key.startsWith(platform) &&
                    settingPreset[key as SettingNames].type === 'select'
                )"
                :key="item"
                v-model="settingForm[item as SettingNames]"
                :label="getLabel(item)"
                :option-list="settingPreset[item as SettingNames].optionList"
                :placeholder="getPlaceholder(item)"
              />
            </template>
          </template>
        </el-form>

        <div class="button-container">
          <el-button
            type="success"
            round
            style="margin-top: 15px; width: 100%"
            @click="confirmSettings"
          >
            {{ $t('confirm') }}
          </el-button>

          <el-button
            type="primary"
            round
            plain
            style="margin-top: 10px; width: 100%"
            @click="backToHome"
          >
            {{ $t('backToHome') }}
          </el-button>
        </div>
      </el-row>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

import { getLabel, getPlaceholder, checkAuth } from '@/utils/common'
import { availableAPIs } from '@/utils/constant'
import { SettingNames, settingPreset } from '@/utils/settingPreset'

import InputItem from '@/components/InputItem.vue'
import InputNumItem from '@/components/InputNumItem.vue'
import SelectItem from '@/components/SelectItem.vue'
import useSettingForm from '@/utils/settingForm'

const router = useRouter()
const { t } = useI18n()
const { settingForm, settingFormKeys } = useSettingForm()

const commonSettingList = ['localLanguage', 'replyLanguage', 'api']

// Explicitement forcer l'enregistrement des valeurs dans le localStorage
const saveAllSettings = () => {
  settingFormKeys.forEach(key => {
    if (settingPreset[key].saveFunc) {
      settingPreset[key].saveFunc!(settingForm.value[key])
    } else {
      localStorage.setItem(
        settingPreset[key].saveKey || key,
        settingForm.value[key]
      )
    }
  })
}

const confirmSettings = () => {
  // Enregistrer explicitement tous les paramètres
  saveAllSettings()

  // Vérifier si la clé API est valide
  const auth = {
    type: settingForm.value.api,
    geminiAPIKey: settingForm.value.geminiAPIKey,
    togetherAPIKey: settingForm.value.togetherAPIKey,
    openrouterAPIKey: settingForm.value.openrouterAPIKey
  }

  if (checkAuth(auth)) {
    ElMessage.success(t('apiKeySuccess'))
    router.push('/')
  } else {
    ElMessage.error(t('apiKeyError'))
  }
}

const addWatch = () => {
  settingFormKeys.forEach(key => {
    watch(
      () => settingForm.value[key],
      () => {
        if (settingPreset[key].saveFunc) {
          settingPreset[key].saveFunc!(settingForm.value[key])
          return
        }
        localStorage.setItem(
          settingPreset[key].saveKey || key,
          settingForm.value[key]
        )
      }
    )
  })
}

onBeforeMount(() => {
  addWatch()
})

function backToHome() {
  router.push('/')
}
</script>

<style lang="stylus">
#setting
  height 100%
  overflow-y auto

.button-container
  width 100%
  display flex
  flex-direction column
  align-items center
  margin-top 20px
</style>
