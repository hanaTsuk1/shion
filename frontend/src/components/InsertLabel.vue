<script  lang="ts" setup>
import type { RawLabel } from '../interfaces'

const { message } = useDialog()

let isShow = $ref(false)

function close() {
  isShow = false
}

async function submit(data: RawLabel) {
  const { recordID, name } = data
  const process = InsertLabel(recordID, name)
  await message.loading({
    process,
  })
}
</script>

<template>
  <v-dialog v-model="isShow" width="500" activator="parent">
    <label-form :title="$t('input.add')" @close="close" @submit="submit" />
  </v-dialog>
</template>
