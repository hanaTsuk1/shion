<script  lang="ts" setup>
import type { main } from '../../wailsjs/go/models'
import type { RawLabel } from '../interfaces'

const {
  title,
  data = {
    recordID: 0,
    name: '',
  },
} = defineProps<{
  title: string
  data?: RawLabel
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'submit', data: RawLabel): void
}>()

const { t } = useI18n()

const form = $ref<any>()
let list = $ref<main.Record[]>([])

const name = $ref(data.name)
const nameRules = [v => !!v || t('input.required')]
const record = $ref({ id: data.recordID, name: data.name })
const recordRules = [v => !!v.name || t('input.required')]

async function getList() {
  list = await QueryAllRecord()
}

getList()

function close() {
  emit('close')
}

async function confirm() {
  const { valid } = await form.validate()
  if (valid) {
    close()
    emit('submit', {
      name,
      recordID: record.id,
    })
  }
}
</script>

<template>
  <v-card>
    <v-card-title> {{ title }} </v-card-title>
    <v-card-text>
      <v-form ref="form">
        <v-text-field
          v-model="name"
          variant="solo"
          :label="$t('time.prop.name')"
          :rules="nameRules"
        />
        <v-select
          v-model="record"
          return-object
          variant="solo"
          :items="list"
          item-title="name"
          item-value="id"
          :label="t('time.prop.record')"
          :rules="recordRules"
        />
      </v-form>
    </v-card-text>

    <v-divider />

    <v-card-actions>
      <div flex-grow />
      <v-btn color="primary" text @click="confirm">
        {{ $t("dialog.confirm") }}
      </v-btn>
      <v-btn color="error" text @click="close">
        {{ $t("dialog.cancel") }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
