<template>
  <div>
    <svg-icon :icon-class="isFullscreen ? 'exit-fullscreen' : 'fullscreen'" @click="handleToggle" />
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useFullscreen } from '@vueuse/core'

const emit = defineEmits(['change'])

const { isFullscreen, toggle } = useFullscreen()

watch(isFullscreen, value => {
  emit('change', value)
})

const handleToggle = async () => {
  await toggle()
}
</script>

<style lang='scss' scoped>
.screenfull-svg {
  display: inline-block;
  cursor: pointer;
  fill: #5a5e66;
  width: 20px;
  height: 20px;
  vertical-align: 10px;
}
</style>
