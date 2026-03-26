<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item, index) in levelList" :key="item.path">
        <span class="no-redirect">{{ item.meta.title }}</span>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script setup>
import usePermissionStore from '@/store/modules/permission'

const route = useRoute()
const permissionStore = usePermissionStore()
const levelList = ref([])

function getBreadcrumb() {
  let matched = []
  const pathNum = findPathNum(route.path)

  if (pathNum > 2) {
    const reg = /\/\w+/gi
    const pathList = route.path.match(reg).map((item, index) => {
      if (index !== 0) item = item.slice(1)
      return item
    })
    getMatched(pathList, permissionStore.defaultRoutes, matched)
  } else {
    matched = route.matched.filter((item) => item.meta && item.meta.title)
  }

  levelList.value = dedupeBreadcrumb(
    matched.filter(item => item.meta && item.meta.title && item.meta.breadcrumb !== false)
  )
}

function findPathNum(str, char = '/') {
  let index = str.indexOf(char)
  let num = 0
  while (index !== -1) {
    num++
    index = str.indexOf(char, index + 1)
  }
  return num
}

function getMatched(pathList, routeList, matched) {
  const data = routeList.find(item => item.path == pathList[0] || String(item.name).toLowerCase() == pathList[0])
  if (data) {
    matched.push(data)
    if (data.children && pathList.length) {
      pathList.shift()
      getMatched(pathList, data.children, matched)
    }
  }
}

function dedupeBreadcrumb(list) {
  return list.filter((item, index) => {
    const prev = list[index - 1]
    if (!prev) {
      return true
    }
    return prev.meta?.title !== item.meta?.title
  })
}

watchEffect(() => {
  if (route.path.startsWith('/redirect/')) {
    return
  }
  getBreadcrumb()
})

getBreadcrumb()
</script>

<style lang='scss' scoped>
.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 13px;
  line-height: 50px;
  color: #8fa1bf;

  :deep(.el-breadcrumb__item) {
    display: inline-flex;
    align-items: center;
  }

  :deep(.el-breadcrumb__inner) {
    color: #8fa1bf;
    font-weight: 400;
  }

  :deep(.el-breadcrumb__inner.is-link),
  :deep(.el-breadcrumb__inner a) {
    color: #8fa1bf;
    font-weight: 400;
  }

  :deep(.el-breadcrumb__separator) {
    margin: 0 10px;
    color: #c6d2e6;
    font-weight: 500;
  }

  .no-redirect {
    color: #8fa1bf;
    cursor: text;
    font-weight: 400;
  }
}
</style>