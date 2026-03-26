<template>
  <div id="tags-view-container" class="tags-view-container">
    <scroll-pane ref="scrollPaneRef" class="tags-view-wrapper" @scroll="handleScroll">
      <router-link
        v-for="tag in visitedViews"
        :key="tag.path"
        :data-path="tag.path"
        :class="{ active: isActive(tag), 'has-icon': !!getTagIcon(tag) }"
        :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"
        class="tags-view-item"
        :style="activeStyle(tag)"
        @click.middle="!isAffix(tag) ? closeSelectedTag(tag) : ''"
      >
        <svg-icon v-if="getTagIcon(tag)" :icon-class="getTagIcon(tag)" class="tag-icon" />
        <span class="tag-title">{{ tag.title }}</span>
        <span v-if="!isAffix(tag)" @click.prevent.stop="closeSelectedTag(tag)">
          <close class="el-icon-close" style="width: 1em; height: 1em; vertical-align: middle;" />
        </span>
      </router-link>
    </scroll-pane>

    <div class="tags-actions">
      <el-dropdown trigger="click" @visible-change="handleDropdownVisibleChange" @command="handleDropdownCommand">
        <span class="tags-actions-trigger">
          <arrow-down class="tags-actions-icon" />
        </span>
        <template #dropdown>
          <el-dropdown-menu class="tags-actions-menu">
            <el-dropdown-item command="refresh">
              <refresh-right style="width: 1em; height: 1em;" /> &#21047;&#26032;&#39029;&#38754;
            </el-dropdown-item>
            <el-dropdown-item command="closeCurrent" :disabled="isAffix(selectedTag)">
              <close style="width: 1em; height: 1em;" /> &#20851;&#38381;&#24403;&#21069;
            </el-dropdown-item>
            <el-dropdown-item command="closeOthers">
              <circle-close style="width: 1em; height: 1em;" /> &#20851;&#38381;&#20854;&#20182;
            </el-dropdown-item>
            <el-dropdown-item command="closeLeft" :disabled="isFirstView()">
              <back style="width: 1em; height: 1em;" /> &#20851;&#38381;&#24038;&#20391;
            </el-dropdown-item>
            <el-dropdown-item command="closeRight" :disabled="isLastView()">
              <right style="width: 1em; height: 1em;" /> &#20851;&#38381;&#21491;&#20391;
            </el-dropdown-item>
            <el-dropdown-item command="closeAll">
              <circle-close style="width: 1em; height: 1em;" /> &#20840;&#37096;&#20851;&#38381;
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import ScrollPane from './ScrollPane'
import { getNormalPath } from '@/utils/ruoyi'
import useTagsViewStore from '@/store/modules/tagsView'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

const selectedTag = ref({})
const affixTags = ref([])
const scrollPaneRef = ref(null)

const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()

const visitedViews = computed(() => useTagsViewStore().visitedViews)
const routes = computed(() => usePermissionStore().routes)
const theme = computed(() => useSettingsStore().theme)

watch(route, () => {
  addTags()
  moveToCurrentTag()
  syncSelectedTag()
})

onMounted(() => {
  initTags()
  addTags()
  syncSelectedTag()
})

function isActive(r) {
  return r.path === route.path
}

function activeStyle(tag) {
  if (!isActive(tag)) return {}
  return {
    'background-color': theme.value,
    'border-color': theme.value,
    color: '#ffffff'
  }
}

function getTagIcon(tag) {
  const topLevelIcon = findTopLevelIcon(tag.path, routes.value)
  if (topLevelIcon) {
    return topLevelIcon
  }
  if (tag.meta && tag.meta.icon && tag.meta.icon !== '#') {
    return tag.meta.icon
  }
  return ''
}

function findTopLevelIcon(path, routeList) {
  for (const item of routeList) {
    if (isTopLevelRouteMatch(path, item)) {
      return item.meta?.icon || ''
    }
  }
  return ''
}

function isTopLevelRouteMatch(path, routeItem) {
  if (!routeItem) {
    return false
  }
  if (routeItem.path === path) {
    return true
  }
  if (routeItem.children && routeItem.children.length) {
    return routeItem.children.some(child => {
      const childPath = getNormalPath(routeItem.path + '/' + child.path)
      return childPath === path
    })
  }
  return false
}

function isAffix(tag) {
  return tag.meta && tag.meta.affix
}

function isFirstView() {
  try {
    return selectedTag.value.fullPath === '/index' || selectedTag.value.fullPath === visitedViews.value[1].fullPath
  } catch (err) {
    return false
  }
}

function isLastView() {
  try {
    return selectedTag.value.fullPath === visitedViews.value[visitedViews.value.length - 1].fullPath
  } catch (err) {
    return false
  }
}

function filterAffixTags(routeList, basePath = '') {
  let tags = []
  routeList.forEach(routeItem => {
    if (routeItem.meta && routeItem.meta.affix) {
      const tagPath = getNormalPath(basePath + '/' + routeItem.path)
      tags.push({
        fullPath: tagPath,
        path: tagPath,
        name: routeItem.name,
        meta: { ...routeItem.meta }
      })
    }
    if (routeItem.children) {
      const tempTags = filterAffixTags(routeItem.children, routeItem.path)
      if (tempTags.length >= 1) {
        tags = [...tags, ...tempTags]
      }
    }
  })
  return tags
}

function initTags() {
  const res = filterAffixTags(routes.value)
  affixTags.value = res
  for (const tag of res) {
    if (tag.name) {
      useTagsViewStore().addVisitedView(tag)
    }
  }
}

function addTags() {
  const { name } = route
  if (name) {
    useTagsViewStore().addView(route)
  }
}

function moveToCurrentTag() {
  nextTick(() => {
    for (const item of visitedViews.value) {
      if (item.path === route.path) {
        scrollPaneRef.value.moveToTarget(item)
        if (item.fullPath !== route.fullPath) {
          useTagsViewStore().updateVisitedView(route)
        }
      }
    }
  })
}

function refreshSelectedTag(view) {
  proxy.$tab.refreshPage(view)
  if (route.meta.link) {
    useTagsViewStore().delIframeView(route)
  }
}

function closeSelectedTag(view) {
  proxy.$tab.closePage(view).then(({ visitedViews }) => {
    if (isActive(view)) {
      toLastView(visitedViews, view)
    }
  })
}

function closeRightTags() {
  proxy.$tab.closeRightPage(selectedTag.value).then(views => {
    if (!views.find(item => item.fullPath === route.fullPath)) {
      toLastView(views)
    }
  })
}

function closeLeftTags() {
  proxy.$tab.closeLeftPage(selectedTag.value).then(views => {
    if (!views.find(item => item.fullPath === route.fullPath)) {
      toLastView(views)
    }
  })
}

function closeOthersTags() {
  router.push(selectedTag.value).catch(() => {})
  proxy.$tab.closeOtherPage(selectedTag.value).then(() => {
    moveToCurrentTag()
  })
}

function closeAllTags(view) {
  proxy.$tab.closeAllPage().then(({ visitedViews }) => {
    if (affixTags.value.some(tag => tag.path === route.path)) {
      return
    }
    toLastView(visitedViews, view)
  })
}

function syncSelectedTag() {
  selectedTag.value = visitedViews.value.find(item => item.path === route.path) || route
}

function handleDropdownVisibleChange(visible) {
  if (visible) {
    syncSelectedTag()
  }
}

function handleDropdownCommand(command) {
  switch (command) {
    case 'refresh':
      refreshSelectedTag(selectedTag.value)
      break
    case 'closeCurrent':
      if (!isAffix(selectedTag.value)) {
        closeSelectedTag(selectedTag.value)
      }
      break
    case 'closeOthers':
      closeOthersTags()
      break
    case 'closeLeft':
      closeLeftTags()
      break
    case 'closeRight':
      closeRightTags()
      break
    case 'closeAll':
      closeAllTags(selectedTag.value)
      break
    default:
      break
  }
}

function toLastView(views, view) {
  const latestView = views.slice(-1)[0]
  if (latestView) {
    router.push(latestView.fullPath)
  } else if (view.name === 'Dashboard') {
    router.replace({ path: '/redirect' + view.fullPath })
  } else {
    router.push('/')
  }
}

function handleScroll() {
  return
}
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: 40px;
  width: 100%;
  background: var(--tags-bg, #fff);
  border-bottom: none;
  box-shadow: none;
  display: flex;
  align-items: center;
  padding: 0 24px 0 24px;
  box-sizing: border-box;

  .tags-view-wrapper {
    flex: 1;
    min-width: 0;

    .tags-view-item {
      display: inline-flex;
      align-items: center;
      vertical-align: top;
      gap: 6px;
      position: relative;
      cursor: pointer;
      height: 28px;
      line-height: 28px;
      border: 1px solid #dbe5f2;
      border-radius: 8px;
      color: #6b7a90;
      background: #ffffff;
      padding: 0 10px;
      font-size: 12px;
      font-weight: 500;
      margin-left: 8px;
      margin-top: 6px;
      transition: all .2s ease;

      &:hover {
        color: v-bind(theme);
        border-color: #d6e4f5;
        background: #f8fbff;
      }

      &:first-of-type {
        margin-left: 0;
      }

      &:last-of-type {
        margin-right: 0;
      }

      &.active {
        background-color: #eef5ff;
        color: #ffffff;
        border-color: #cfe0fb;
        box-shadow: none;
      }

      &.active .tag-icon,
      &.active .tag-title,
      &.active .el-icon-close {
        color: #ffffff;
      }

      .tag-icon {
        font-size: 13px;
        color: inherit;
        flex: 0 0 auto;
      }

      .tag-title {
        display: inline-block;
        color: inherit;
      }
    }
  }

    .tags-actions {
      width: 40px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 40px;
      margin-left: 10px;
      margin-right: 0;
      background: var(--tags-bg, #fff);
    }

  .tags-actions-trigger {
    width: 30px;
    height: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    border: 1px solid #e6e1d4;
    background: #ffffff;
    color: #8e98a8;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    transition: all .2s ease;

    &:hover {
      color: #667085;
      border-color: #dcd3bf;
      background: #fffdfa;
      box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08);
    }

    .tags-actions-icon {
      width: 10px;
      height: 10px;
    }
  }
}
</style>

<style lang="scss">
.tags-view-wrapper {
  .tags-view-item {
    .el-icon-close {
      width: 14px;
      height: 14px;
      vertical-align: middle;
      border-radius: 50%;
      text-align: center;
      transition: all .3s cubic-bezier(.645, .045, .355, 1);
      transform-origin: 100% 50%;
      color: #94a3b8;

      &:before {
        transform: scale(.6);
        display: inline-block;
        vertical-align: -2px;
      }

      &:hover {
        background-color: v-bind(theme);
        color: #fff;
        width: 12px !important;
        height: 12px !important;
      }
    }
  }
}

.tags-actions-menu {
  padding: 8px !important;
  min-width: 142px;
  border-radius: 12px !important;
  border: 1px solid #ebe5d8 !important;
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.12) !important;

  .el-dropdown-menu__item {
    height: 36px;
    line-height: 36px;
    padding: 0 12px !important;
    margin: 2px 0;
    border-radius: 8px;
    font-size: 13px;
    color: #344054;
    display: flex;
    align-items: center;
    gap: 10px;

    .el-icon,
    svg {
      color: #667085;
      flex: 0 0 auto;
    }

    &:not(.is-disabled):hover,
    &:not(.is-disabled):focus {
      background: #f8f5ee !important;
      color: #1f2937 !important;
    }
  }

  .el-dropdown-menu__item.is-disabled {
    color: #b7bfcc !important;
  }

  .el-dropdown-menu__item--divided {
    margin-top: 10px !important;
    border-top: 1px solid #eee7d9 !important;
    padding-top: 10px !important;

    &:before {
      display: none !important;
    }
  }
}
</style>
