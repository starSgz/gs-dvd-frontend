<template>
  <div :key="userStore.accessKey || 'dashboard-root'" class="dashboardPage">
    <div class="pageHeaderContent">
      <div class="avatar">
        <el-avatar :size="72" :src="currentUser.avatar" />
      </div>
      <div class="content">
        <div class="contentTitle">
          {{ getGreeting }}，
          {{ currentUser.name }}
          ，祝你开心每一天！
        </div>
      </div>
      <div class="extraContent">
        <div class="statItem">
          <div style="text-align: center;">
            <div style="color: rgba(0, 0, 0, 0.45); font-size: 14px; margin-bottom: 4px;">卡密</div>
            <div style="font-size: 16px; font-weight: 500; word-break: break-all;">
              {{ userInfo.accessKey || '未激活' }}
            </div>
          </div>
        </div>
        <div class="statItem">
          <div style="text-align: center;">
            <div style="color: rgba(0, 0, 0, 0.45); font-size: 14px; margin-bottom: 4px;">到期时间</div>
            <div style="font-size: 16px; font-weight: 500;">
              {{ formatExpireTime }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 卡密激活提示卡片 -->
    <div v-if="!isActivated" key="not-activated" class="dashboardMainContent">
      <el-card 
        style="margin-bottom: 24px"
        shadow="always"
      >
        <div style="display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 20px;">
          <div style="font-size: 18px; font-weight: 500; margin-bottom: 20px; color: #d46b08;">
            📢 您还未激活卡密，请先激活后使用完整功能
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <el-input
              v-model="accessKeyInput"
              placeholder="请输入卡密"
              clearable
              style="width: 300px"
              @keyup.enter="handleActivate"
            />
            <el-button 
              type="primary" 
              @click="handleActivate"
              :loading="activating"
            >
              确定
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 主内容区域 - 仅激活用户或 admin 可见 -->
    <div v-if="isActivated" key="activated" class="dashboardMainContent">
      <el-row :gutter="24" class="dashboardContentRow">
        <el-col :xl="14" :lg="14" :md="24" :sm="24" :xs="24" class="dashboardStretchCol">
          <el-card
            class="projectList"
            style="margin-bottom: 24px"
            shadow="never"
            :body-style="{ padding: 0 }"
          >
            <template #header>
              <div class="card-header">
                <span>持有中的项目</span>
                <el-link type="primary" :underline="false" href="">全部项目</el-link>
              </div>
            </template>
            <div class="projectListBody">
            <el-row>
              <el-col
                v-for="item in projectNotice"
                :key="item.id"
                :xl="8" :lg="8" :md="12" :sm="12" :xs="24"
                class="projectGrid"
              >
                <div class="project-item">
                  <div class="cardTitle">
                    <el-avatar :size="24" :src="item.logo" />
                    <a :href="item.href">{{ item.title }}</a>
                  </div>
                  <div class="project-description">{{ item.description }}</div>
                  <div class="projectItemContent">
                    <a :href="item.memberLink">{{ item.member || "" }}</a>
                    <span class="datetime" :title="item.updatedAt">{{ item.updatedAt }}</span>
                  </div>
                </div>
              </el-col>
            </el-row>
            </div>
          </el-card>
        </el-col>

        <el-col :xl="10" :lg="10" :md="24" :sm="24" :xs="24" class="dashboardStretchCol">
          <el-card
            class="activeCard"
            shadow="never"
            :body-style="{ padding: 0 }"
          >
            <template #header>
              <span>动态</span>
            </template>
            <div class="activitiesList" @scroll="handleScroll">
              <div v-for="item in noticeList" :key="item.noticeId" class="activity-item">
                <div class="activity-avatar">
                  <el-avatar :size="32">
                    {{ item.createBy === 'admin' ? '系统' : (item.createBy ? item.createBy.charAt(0).toUpperCase() : '系统') }}
                  </el-avatar>
                </div>
                  <div class="activity-content">
                    <div class="activity-title">
                      <a class="username">{{ item.createBy === 'admin' ? '系统' : (item.createBy || '系统') }}</a>
                      &nbsp;
                    <span class="event">
                      <span>发布了公告</span>
                      &nbsp;
                      <a class="notice-title">{{ item.noticeTitle }}</a>
                    </span>
                  </div>
                  <div class="datetime" :title="item.createTime">{{ formatTime(item.createTime) }}</div>
                </div>
              </div>
              
              <!-- 加载状态提示 -->
              <div v-if="noticeLoading" class="loading-tip">
                <span>加载中...</span>
              </div>
              <div v-if="!hasMore && noticeList.length > 0" class="no-more-tip">
                <span>没有更多了</span>
              </div>
              <div v-if="!noticeLoading && noticeList.length === 0" class="empty-tip">
                <span>暂无动态</span>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- <el-col :xl="8" :lg="24" :md="24" :sm="24" :xs="24">
          <el-card
            style="margin-bottom: 24px"
            shadow="never"
            :body-style="{ padding: 0 }"
          >
            <template #header>
              <span>快速开始 / 便捷导航</span>
            </template>
            <EditableLinkGroup />
          </el-card>

          <el-card
            shadow="never"
            :body-style="{ paddingTop: '12px', paddingBottom: '12px' }"
          >
            <template #header>
              <span>团队</span>
            </template>
            <div class="members">
              <el-row :gutter="48">
                <el-col
                  v-for="item in projectNotice"
                  :key="`members-item-${item.id}`"
                  :span="12"
                >
                  <a :href="item.href">
                    <el-avatar :src="item.logo" :size="24" />
                    <span class="member">{{ item.member }}</span>
                  </a>
                </el-col>
              </el-row>
            </div>
          </el-card>
        </el-col> -->
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import EditableLinkGroup from "./editable-link-group.vue";
import useUserStore from '@/store/modules/user';
import usePermissionStore from '@/store/modules/permission';
import { activateAccessKey } from '@/api/dvdConfig/accessKey';
import { getDvdUserInfo } from '@/api/dvdAccount/account';
import { listNotice } from '@/api/system/notice';
import { ElMessage } from 'element-plus';
import { isHttp } from '@/utils/validate';

defineOptions({
  name: "DashBoard",
});

const router = useRouter();
const userStore = useUserStore();
const permissionStore = usePermissionStore();
const { name, accessKey, expireTime } = storeToRefs(userStore);
const accessKeyInput = ref('');
const activating = ref(false);

// 用户信息数据
const userInfo = ref({
  nickName: '',
  accessKey: '',
  expireTime: null
});

// 公告列表相关数据
const noticeList = ref([]);
const noticeLoading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const hasMore = ref(true);
const totalCount = ref(0);

// 判断用户是否已激活（admin 始终激活；有 accessKey 且未过期才算激活）
const isActivated = computed(() => {
  if (userStore.name === 'admin') return true;
  if (!userStore.accessKey) return false;
  // 有过期时间则判断是否已过期
  if (userInfo.value.expireTime) {
    return new Date(userInfo.value.expireTime) > new Date();
  }
  // userInfo 尚未加载完成时，先按有 accessKey 处理
  return true;
});

// 动态问候语
const getGreeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return '凌晨好';
  if (hour < 9) return '早安';
  if (hour < 12) return '上午好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
});

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const response = await getDvdUserInfo();
    if (response && response.data) {
      console.log(response.data);
      userInfo.value = response.data;
    }
  } catch (error) {
    console.error('加载用户信息失败：', error);
  }
};

// 格式化到期时间
const formatExpireTime = computed(() => {
  if (!userInfo.value.expireTime) return '未激活';
  const expireDate = new Date(userInfo.value.expireTime);
  const now = new Date();
  const diffTime = expireDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return '已过期';
  } else if (diffDays === 0) {
    return '今天到期';
  } else if (diffDays <= 7) {
    return `${diffDays}天后到期`;
  } else {
    return expireDate.toLocaleDateString('zh-CN');
  }
});

// 当前用户信息（用于头部显示）
const currentUser = computed(() => ({
  avatar: "https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png",
  name: userInfo.value.nickName || userStore.name || "用户",
  title: "系统用户"
}));

// 项目列表（示例数据）
const projectNotice = [
  {
    id: "xxx1",
    title: "Alipay",
    logo: "https://gw.alipayobjects.com/zos/rmsportal/WdGqmHpayyMjiEhcKoVE.png",
    description: "那是一种内在的东西，他们到达不了，也无法触及的",
    updatedAt: "几秒前",
    member: "科学搬砖组",
    href: "",
    memberLink: "",
  },
  {
    id: "xxx2",
    title: "Angular",
    logo: "https://gw.alipayobjects.com/zos/rmsportal/zOsKZmFRdUtvpqCImOVY.png",
    description: "希望是一个好东西，也许是最好的，好东西是不会消亡的",
    updatedAt: "6 年前",
    member: "全组都是吴彦祖",
    href: "",
    memberLink: "",
  },
  {
    id: "xxx3",
    title: "Ant Design",
    logo: "https://gw.alipayobjects.com/zos/rmsportal/dURIMkkrRFpPgTuzkwnB.png",
    description: "城镇中有那么多的酒馆，她却偏偏走进了我的酒馆",
    updatedAt: "几秒前",
    member: "中二少女团",
    href: "",
    memberLink: "",
  },
  {
    id: "xxx4",
    title: "Ant Design Pro",
    logo: "https://gw.alipayobjects.com/zos/rmsportal/sfjbOqnsXXJgNCjCzDBL.png",
    description: "那时候我只会想自己想要什么，从不想自己拥有什么",
    updatedAt: "6 年前",
    member: "程序员日常",
    href: "",
    memberLink: "",
  },
  {
    id: "xxx5",
    title: "Bootstrap",
    logo: "https://gw.alipayobjects.com/zos/rmsportal/siCrBXXhmvTQGWPNLBow.png",
    description: "凛冬将至",
    updatedAt: "6 年前",
    member: "高逼格设计天团",
    href: "",
    memberLink: "",
  },
  {
    id: "xxx6",
    title: "React",
    logo: "https://gw.alipayobjects.com/zos/rmsportal/kZzEzemZyKLKFsojXItE.png",
    description: "生命就像一盒巧克力，结果往往出人意料",
    updatedAt: "6 年前",
    member: "骗你来学计算机",
    href: "",
    memberLink: "",
  },
];

// 激活卡密
const handleActivate = async () => {
  if (!accessKeyInput.value || !accessKeyInput.value.trim()) {
    ElMessage.warning('请输入卡密');
    return;
  }
  
  activating.value = true;
  try {
    const result = await activateAccessKey(accessKeyInput.value.trim());
    // ElMessage.success('卡密激活成功！');
    accessKeyInput.value = '';
    // 重新获取用户信息以更新激活状态
    await userStore.getInfo();
    // 先刷新 userInfo（含最新 expireTime），再判断激活状态，避免旧过期时间干扰
    await loadUserInfo();

    // 激活成功后，动态生成并添加路由，实现响应式切换
    if (isActivated.value) {
      const accessRoutes = await permissionStore.generateRoutes();
      accessRoutes.forEach(route => {
        if (!isHttp(route.path)) {
          router.addRoute(route);
        }
      });
      ElMessage.success('激活成功');
    }
  } catch (error) {
    console.error('激活失败：', error);
    const errorMsg = error.message || (typeof error === 'string' ? error : '操作失败');
    if (errorMsg !== 'error') {
      console.log(errorMsg);
    }
  } finally {
    activating.value = false;
  }
};



// 加载公告列表
const loadNoticeList = async () => {
  if (noticeLoading.value || !hasMore.value) return;
  
  noticeLoading.value = true;
  try {
    const response = await listNotice({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      noticeType: '2',
      status: '0'
    });
    
    if (response.rows && response.rows.length > 0) {
      noticeList.value = [...noticeList.value, ...response.rows];
      totalCount.value = response.total;
      
      // 判断是否还有更多数据
      if (noticeList.value.length >= response.total) {
        hasMore.value = false;
      }
    } else {
      hasMore.value = false;
    }
  } catch (error) {
    console.error('加载公告失败：', error);
    ElMessage.error('加载公告失败');
  } finally {
    noticeLoading.value = false;
  }
};

// 处理滚动事件
const handleScroll = (event) => {
  const { scrollTop, scrollHeight, clientHeight } = event.target;
  // 距离底部50px时触发加载
  if (scrollHeight - scrollTop - clientHeight < 50) {
    if (!noticeLoading.value && hasMore.value) {
      currentPage.value++;
      loadNoticeList();
    }
  }
};

// 格式化时间显示
const formatTime = (dateTime) => {
  if (!dateTime) return '';
  const date = new Date(dateTime);
  const now = new Date();
  const diff = now - date;
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  
  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前';
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前';
  } else if (diff < 7 * day) {
    return Math.floor(diff / day) + '天前';
  } else {
    return date.toLocaleDateString();
  }
};

// 组件挂载时加载数据
onMounted(async () => {
  // 无论是否激活都先加载用户信息，以便正确判断过期状态
  await loadUserInfo();
  if (isActivated.value) {
    loadNoticeList();
  }
});
</script>

<style scoped lang="less">
.textOverflow() {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  word-break: break-all;
}

.clearfix() {
  zoom: 1;
  &::before,
  &::after {
    display: table;
    content: " ";
  }
  &::after {
    clear: both;
    height: 0;
    font-size: 0;
    visibility: hidden;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboardPage {
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.activitiesList {
  padding: 0 24px 8px 24px;
  max-height: none;
  height: 100%;
  max-height: 760px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.3);
    }
  }
  
  .activity-item {
    display: flex;
    padding: 16px 0;
    border-bottom: 1px solid #f0f0f0;
    &:last-child {
      border-bottom: none;
    }
    .activity-avatar {
      margin-right: 16px;
    }
    .activity-content {
      flex: 1;
      .activity-title {
        margin-bottom: 4px;
        color: rgba(0, 0, 0, 0.65);
        .username {
          color: rgba(0, 0, 0, 0.85);
          font-weight: 500;
        }
        .notice-title {
          color: var(--current-color);
          cursor: pointer;
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }
  
  .loading-tip,
  .no-more-tip,
  .empty-tip {
    text-align: center;
    padding: 16px 0;
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
  }
}

.pageHeaderContent {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  margin-bottom: 24px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  .avatar {
    flex: 0 1 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    & > span {
      display: block;
      width: 72px;
      height: 72px;
      border-radius: 72px;
    }
  }
  .content {
    flex: 1 1 auto;
    margin-left: 18px;
    padding: 0 12px 0 0;
    color: rgba(0, 0, 0, 0.45);
    line-height: 22px;
    text-align: left;
    .contentTitle {
      margin-bottom: 0;
      color: rgba(0, 0, 0, 0.85);
      font-weight: 600;
      font-size: 18px;
      line-height: 30px;
      letter-spacing: 0.02em;
    }
  }
}

.dashboardMainContent {
  height: 100%;
  padding: 0;
  padding-bottom: clamp(8px, 1vh, 16px);
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  box-sizing: border-box;
}

.dashboardContentRow {
  flex: 1;
  align-items: stretch;
  min-height: 0;
}

.dashboardStretchCol {
  display: flex;
  min-height: 0;
}

.extraContent {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  white-space: nowrap;
  gap: 4px;
  .statItem {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 132px;
    padding: 0 24px;
    text-align: center;
    &::after {
      position: absolute;
      top: 50%;
      right: 0;
      width: 1px;
      height: 36px;
      background-color: #ebe5d8;
      content: "";
      transform: translateY(-50%);
    }
    &:last-child {
      padding-right: 0;
      &::after {
        display: none;
      }
    }
  }
}

.members {
  a {
    display: block;
    height: 24px;
    margin: 12px 0;
    color: rgba(0, 0, 0, 0.65);
    transition: all 0.3s;
    .textOverflow();
    .member {
      margin-left: 12px;
      font-size: 14px;
      line-height: 24px;
      vertical-align: top;
    }
    &:hover {
      color: #1890ff;
    }
  }
}

.projectList {
  width: 100%;
  height: 100%;

  .projectListBody {
    max-height: 760px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.18);
      border-radius: 3px;
    }
  }

  .projectGrid {
    display: flex;
    padding: 24px;
    border: 1px solid #f0f0f0;
    margin: -1px 0 0 -1px;
    transition: all 0.3s;
    &:hover {
      position: relative;
      z-index: 1;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    .project-item {
      width: 100%;
      min-height: 104px;
      .cardTitle {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        a {
          margin-left: 12px;
          color: rgba(0, 0, 0, 0.85);
          font-weight: 500;
          font-size: 14px;
          &:hover {
            color: #1890ff;
          }
        }
      }
      .project-description {
        height: 44px;
        margin-bottom: 8px;
        overflow: hidden;
        color: rgba(0, 0, 0, 0.45);
        font-size: 14px;
        line-height: 22px;
      }
      .projectItemContent {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        a {
          color: rgba(0, 0, 0, 0.45);
          &:hover {
            color: #1890ff;
          }
        }
        .datetime {
          color: rgba(0, 0, 0, 0.25);
        }
      }
    }
  }
}

.activeCard {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.activeCard :deep(.el-card__body) {
  flex: 1;
  min-height: 0;
}

.datetime {
  color: rgba(0, 0, 0, 0.25);
}

@media screen and (max-width: 1200px) and (min-width: 992px) {
  .activeCard {
    margin-bottom: 24px;
  }
  .members {
    margin-bottom: 0;
  }
  .extraContent {
    margin-left: -44px;
    .statItem {
      padding: 0 16px;
    }
  }
}

@media screen and (max-width: 992px) {
  .dashboardPage {
    min-height: auto;
  }

  .dashboardMainContent,
  .dashboardContentRow,
  .dashboardStretchCol,
  .projectList,
  .activeCard,
  .activitiesList,
  .projectList .projectListBody {
    height: auto;
    max-height: none;
    min-height: auto;
  }

  .activeCard {
    margin-bottom: 24px;
  }
  .members {
    margin-bottom: 0;
  }
  .extraContent {
    margin-top: 18px;
    width: 100%;
    .statItem {
      padding: 0 16px;
      &::after {
        display: none;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .extraContent {
    margin-left: -16px;
  }
}

@media screen and (max-width: 576px) {
  .pageHeaderContent {
    display: block;
    padding: 18px;
    .avatar {
      margin-bottom: 14px;
    }
    .content {
      margin-left: 0;
      padding: 0;
    }
  }
  .extraContent {
    display: block;
    margin-top: 16px;
    .statItem {
      width: 100%;
      min-width: 0;
      padding: 10px 0;
    }
  }
}
</style>
