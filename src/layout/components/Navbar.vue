<template>
  <div class="navbar" :class="'nav' + settingsStore.navType">
    <hamburger id="hamburger-container" :is-active="appStore.sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    <div v-if="settingsStore.navType == 1" class="refresh-container hover-effect" @click="refreshPage">
      <svg-icon icon-class="refresh" />
    </div>
    <breadcrumb v-if="settingsStore.navType == 1" id="breadcrumb-container" class="breadcrumb-container" />
    <top-nav v-if="settingsStore.navType == 2" id="topmenu-container" class="topmenu-container" />

    <template v-if="settingsStore.navType == 3">c:\Users\Administrator\Desktop\oc-frontend\src\assets\icons\svg\refresh.svgc:\Users\Administrator\Desktop\oc-frontend\src\assets\icons\svg\refresh.svg
      <logo v-show="settingsStore.sidebarLogo" :collapse="false" />
      <top-bar id="topbar-container" class="topbar-container" />
    </template>

    <div class="right-menu">
      <header-search ref="headerSearchRef" class="hidden-header-search" />

      <el-dropdown @command="handleCommand" class="avatar-container right-menu-item hover-effect" trigger="hover">
        <div class="avatar-wrapper">
          <img :src="userStore.avatar" class="user-avatar" />
          <span class="user-nickname">{{ userStore.nickName }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="search" v-if="appStore.device !== 'mobile'">&#33756;&#21333;&#25628;&#32034;</el-dropdown-item>
            <el-dropdown-item command="screenfull" v-if="appStore.device !== 'mobile'">&#20840;&#23631;&#20999;&#25442;</el-dropdown-item>
            <el-dropdown-item command="theme" v-if="appStore.device !== 'mobile'">&#20027;&#39064;&#27169;&#24335;</el-dropdown-item>
            <el-dropdown-item divided />
            <router-link to="/user/profile">
              <el-dropdown-item>&#20010;&#20154;&#20013;&#24515;</el-dropdown-item>
            </router-link>
            <el-dropdown-item command="setLayout" v-if="settingsStore.showSettings">
              <span>&#24067;&#23616;&#35774;&#32622;</span>
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <span>&#36864;&#20986;&#30331;&#24405;</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ElMessageBox } from 'element-plus'
import { useFullscreen } from '@vueuse/core'
import Breadcrumb from '@/components/Breadcrumb'
import TopNav from '@/components/TopNav'
import TopBar from './TopBar'
import Logo from './Sidebar/Logo'
import Hamburger from '@/components/Hamburger'
import HeaderSearch from '@/components/HeaderSearch'
import useAppStore from '@/store/modules/app'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'

const appStore = useAppStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const headerSearchRef = ref(null)
const { toggle } = useFullscreen()
const router = useRouter()

function toggleSideBar() {
  appStore.toggleSideBar()
}

function handleCommand(command) {
  switch (command) {
    case 'search':
      headerSearchRef.value?.click()
      break
    case 'screenfull':
      toggle()
      break
    case 'theme':
      toggleTheme()
      break
    case 'setLayout':
      setLayout()
      break
    case 'logout':
      logout()
      break
    default:
      break
  }
}

function logout() {
  ElMessageBox.confirm('\u786e\u5b9a\u6ce8\u9500\u5e76\u9000\u51fa\u7cfb\u7edf\u5417\uff1f', '\u63d0\u793a', {
    confirmButtonText: '\u786e\u5b9a',
    cancelButtonText: '\u53d6\u6d88',
    type: 'warning'
  }).then(() => {
    userStore.logOut().then(() => {
      location.href = '/index'
    })
  }).catch(() => {})
}

const emits = defineEmits(['setLayout'])

function setLayout() {
  emits('setLayout')
}

function toggleTheme() {
  settingsStore.toggleTheme()
}

function refreshPage() {
  router.go(0)
}
</script>

<style lang='scss' scoped>
.navbar.nav3 {
  .hamburger-container {
    display: none !important;
  }
}

.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: var(--navbar-bg);
  border-bottom: none;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 24px 0 24px;
  box-sizing: border-box;

  .hamburger-container {
    line-height: 50px;
    height: 100%;
    cursor: pointer;
    transition: color 0.2s ease, background 0.2s ease;
    -webkit-tap-highlight-color: transparent;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    border-radius: 6px;
    color: #8ea0bf;

    &:hover {
      color: #6f82a6;
      background: #f5f8fe;
    }
  }

  .refresh-container {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 30px;
    padding: 0 4px;
    font-size: 15px;
    color: #8ea0bf;
    cursor: pointer;
    transition: color 0.2s ease, background 0.2s ease;
    flex-shrink: 0;
    border-radius: 6px;

    &:hover {
      color: #6f82a6;
      background: #f5f8fe;
    }

    .svg-icon {
      font-size: 15px;
      transition: transform 0.35s ease;
    }

    &:hover .svg-icon {
      transform: rotate(180deg);
    }
  }

  .breadcrumb-container {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    min-width: 0;
  }

  .topmenu-container {
    position: absolute;
    left: 58px;
  }

  .topbar-container {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  .right-menu {
    height: 100%;
    line-height: 50px;
    display: flex;
    align-items: center;
    margin-left: auto;
    gap: 4px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 10px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .hidden-header-search {
      display: none;
    }

    .avatar-container {
      padding-right: 0;

      .avatar-wrapper {
        margin-top: 10px;
        position: relative;
        left: -3px;

        .user-avatar {
          cursor: pointer;
          width: 30px;
          height: 30px;
          margin-right: 8px;
          border-radius: 50%;
          vertical-align: middle;
          border-style: none;
        }

        .user-nickname {
          position: relative;
          left: 0;
          font-size: 14px;
          font-weight: bold;
        }

        i {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
