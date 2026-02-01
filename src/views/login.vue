<template>
  <div class="login">
    <!-- 左侧轮播图 -->
    <div class="login-left">
      <el-carousel height="100vh" :interval="5000" arrow="never">
        <el-carousel-item v-for="(image, index) in carouselImages" :key="index">
          <div class="carousel-content">
            <img :src="image.src" :alt="image.alt" class="carousel-image" />
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>
    
    <!-- 右侧登录/注册表单 -->
    <div class="login-right">
      <div class="form-container">
        <div class="title-container">
          <img src="@/assets/logo/logo.png" class="title-logo" alt="Logo" />
          <h3 class="title">{{ title }}</h3>
        </div>
        <div class="title-tip">专业智能数字化营销数据分析平台</div>
        <!-- 切换按钮 -->
        <div class="form-switch">
          <div 
            class="switch-item" 
            :class="{ active: isLogin }"
            @click="switchForm(true)"
          >
            登录
          </div>
          <div 
            class="switch-item" 
            :class="{ active: !isLogin }"
            @click="switchForm(false)"
          >
            注册
          </div>
        </div>

        <!-- 登录表单 -->
        <el-form 
          v-if="isLogin"
          ref="loginRef" 
          :model="loginForm" 
          :rules="loginRules" 
          class="login-form form-transition"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              type="text"
              size="large"
              auto-complete="off"
              placeholder="账号"
            >
              <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              size="large"
              auto-complete="off"
              placeholder="密码"
              @keyup.enter="handleLogin"
            >
              <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="code" v-if="captchaEnabled">
            <div class="code-container">
              <el-input
                v-model="loginForm.code"
                size="large"
                auto-complete="off"
                placeholder="验证码"
                @keyup.enter="handleLogin"
              >
                <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
              </el-input>
              <img :src="codeUrl" @click="getCode" class="code-image"/>
            </div>
          </el-form-item>
          <el-checkbox v-model="loginForm.rememberMe" style="margin:0px 0px 25px 0px;">记住密码</el-checkbox>
          <el-form-item style="width:100%;">
            <el-button
              :loading="loading"
              size="large"
              type="primary"
              style="width:100%;"
              @click.prevent="handleLogin"
            >
              <span v-if="!loading">登 录</span>
              <span v-else>登 录 中...</span>
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 注册表单 -->
        <el-form 
          v-else
          ref="registerRef" 
          :model="registerForm" 
          :rules="registerRules" 
          class="login-form form-transition"
        >
          <el-form-item prop="username">
            <el-input 
              v-model="registerForm.username" 
              type="text" 
              size="large" 
              auto-complete="off" 
              placeholder="账号"
            >
              <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              size="large" 
              auto-complete="off"
              placeholder="密码"
            >
              <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              size="large" 
              auto-complete="off"
              placeholder="确认密码"
              @keyup.enter="handleRegister"
            >
              <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="code" v-if="captchaEnabled">
            <div class="code-container">
              <el-input
                size="large" 
                v-model="registerForm.code"
                auto-complete="off"
                placeholder="验证码"
                @keyup.enter="handleRegister"
              >
                <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
              </el-input>
              <img :src="codeUrl" @click="getCode" class="code-image"/>
            </div>
          </el-form-item>
          <el-form-item style="width:100%;">
            <el-button
              :loading="loading"
              size="large" 
              type="primary"
              style="width:100%;"
              @click.prevent="handleRegister"
            >
              <span v-if="!loading">注 册</span>
              <span v-else>注 册 中...</span>
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      <!--  底部  -->
      <div class="el-login-footer">
        <span>{{ footerContent }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElMessageBox } from "element-plus";
import { getCodeImg, register } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";
import useUserStore from '@/store/modules/user'
import defaultSettings from '@/settings'

const title = import.meta.env.VITE_APP_TITLE;
const footerContent = defaultSettings.footerContent
const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance();

// 控制显示登录还是注册表单
const isLogin = ref(true);

const loginForm = ref({
  username: "",
  password: "",
  rememberMe: false,
  code: "",
  uuid: ""
});

const registerForm = ref({
  username: "",
  password: "",
  confirmPassword: "",
  code: "",
  uuid: ""
});

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
};

const equalToPassword = (rule, value, callback) => {
  if (registerForm.value.password !== value) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const registerRules = {
  username: [
    { required: true, trigger: "blur", message: "请输入您的账号" },
    { min: 2, max: 20, message: "用户账号长度必须介于 2 和 20 之间", trigger: "blur" }
  ],
  password: [
    { required: true, trigger: "blur", message: "请输入您的密码" },
    { min: 5, max: 20, message: "用户密码长度必须介于 5 和 20 之间", trigger: "blur" },
    { pattern: /^[^<>"'|\\]+$/, message: "不能包含非法字符：< > \" ' \\ |", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, trigger: "blur", message: "请再次输入您的密码" },
    { required: true, validator: equalToPassword, trigger: "blur" }
  ],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
};

// 轮播图数据
const carouselImages = ref([
  {
    src: new URL('@/assets/images/index_page_1.png', import.meta.url).href,
    alt: '欢迎使用',
    title: '欢迎使用管理系统',
    description: '高效、安全、智能的企业管理平台'
  },
  {
    src: new URL('@/assets/images/index_page_2.png', import.meta.url).href,
    alt: '欢迎使用',
    title: '欢迎使用管理系统',
    description: '高效、安全、智能的企业管理平台'
  },
  {
    src: new URL('@/assets/images/profile.jpg', import.meta.url).href,
    alt: '品牌形象',
    title: '专业的解决方案',
    description: '为您提供一站式的管理服务'
  },


]);

const codeUrl = ref("");
const loading = ref(false);
// 验证码开关
const captchaEnabled = ref(true);
const redirect = ref(undefined);

watch(route, (newRoute) => {
    redirect.value = newRoute.query && newRoute.query.redirect;
}, { immediate: true });

function handleLogin() {
  proxy.$refs.loginRef.validate(valid => {
    if (valid) {
      loading.value = true;
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 });
        Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 });
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 });
      } else {
        // 否则移除
        Cookies.remove("username");
        Cookies.remove("password");
        Cookies.remove("rememberMe");
      }
      // 调用action的登录方法
      userStore.login(loginForm.value).then(() => {
        const query = route.query;
        const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
          if (cur !== "redirect") {
            acc[cur] = query[cur];
          }
          return acc;
        }, {});
        router.push({ path: redirect.value || "/", query: otherQueryParams });
      }).catch(() => {
        loading.value = false;
        // 重新获取验证码
        if (captchaEnabled.value) {
          getCode();
        }
      });
    }
  });
}

function getCode() {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled;
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img;
      loginForm.value.uuid = res.uuid;
      registerForm.value.uuid = res.uuid;
    }
  });
}

function getCookie() {
  const username = Cookies.get("username");
  const password = Cookies.get("password");
  const rememberMe = Cookies.get("rememberMe");
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
  };
}

function handleRegister() {
  proxy.$refs.registerRef.validate(valid => {
    if (valid) {
      loading.value = true;
      register(registerForm.value).then(res => {
        const username = registerForm.value.username;
        ElMessageBox.alert("<font color='red'>恭喜你，您的账号 " + username + " 注册成功！</font>", "系统提示", {
          dangerouslyUseHTMLString: true,
          type: "success",
        }).then(() => {
          isLogin.value = true;
          // 清空注册表单
          registerForm.value = {
            username: "",
            password: "",
            confirmPassword: "",
            code: "",
            uuid: ""
          };
          // 重新获取验证码
          getCode();
        }).catch(() => {});
      }).catch(() => {
        loading.value = false;
        if (captchaEnabled.value) {
          getCode();
        }
      });
    }
  });
}

function switchForm(toLogin) {
  isLogin.value = toLogin;
  // 清空表单验证状态
  if (toLogin && proxy.$refs.registerRef) {
    proxy.$refs.registerRef.clearValidate();
  } else if (!toLogin && proxy.$refs.loginRef) {
    proxy.$refs.loginRef.clearValidate();
  }
  // 重新获取验证码
  getCode();
}

getCode();
getCookie();
</script>

<style lang='scss' scoped>
.login {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

// 左侧轮播图区域
.login-left {
  width: 50%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  
  :deep(.el-carousel) {
    height: 100%;
    
    .el-carousel__container {
      height: 100%;
    }
    
    .el-carousel__indicators {
      bottom: 30px;
      
      .el-carousel__indicator {
        .el-carousel__button {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.5);
        }
        
        &.is-active {
          .el-carousel__button {
            background-color: #fff;
          }
        }
      }
    }
  }
  
  .carousel-content {
    width: 100%;
    height: 100%;
    position: relative;
  }
  
  .carousel-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

// 右侧登录表单区域
.login-right {
  width: 50%;
  height: 100%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 40px;
}

.form-container {
  width: 550px;
  max-width: 100%;
}

.title-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
}

.title-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom:10px;
  font-size: 16px;
  color: #909399;
}

.title-logo {
  width: 120px;
  height: 120px;
  margin-right: 10px;
  object-fit: contain;
   /* 设置动画：名称 时长 线性 无限循环 */
  animation: rotate 3s linear infinite;
}
/* 定义旋转关键帧 */
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.title {
  margin: 0;
  text-align: center;
  color: #303133;
  font-size: 60px;
  font-weight: 100;
}

// 表单切换按钮 - Tab 样式
.form-switch {
  display: flex;
  justify-content: center;
  margin-bottom: 35px;
  gap: 40px;
  
  .switch-item {
    position: relative;
    padding: 12px 8px;
    font-size: 16px;
    font-weight: 500;
    color: #909399;
    cursor: pointer;
    transition: all 0.3s ease;
    background: transparent;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 2px;
      background: #409EFF;
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }
    
    &:hover {
      color: #409EFF;
    }
    
    &.active {
      color: #409EFF;
      font-weight: 600;
      
      &::after {
        transform: scaleX(1);
      }
    }
  }
}

// 表单过渡动画
.form-transition {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-form {
  background: transparent;
  width: 100%;
  max-width: 100%;
  padding: 0;
  
  .el-input {
    height: 40px;
    input {
      height: 50px;
      font-size: 16px;
    }
  }
  .input-icon {
    height: 49px;
    width: 16px;
    margin-left: 0px;
  }
  
  :deep(.el-button--large) {
    height: 52px;
    font-size: 18px;
  }
  
  :deep(.el-checkbox__label) {
    font-size: 15px;
  }
}

.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}

.code-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  width: 100%;
  
  .el-input {
    flex: 1;
  }
}

.code-image {
  height: 40px;
  width: auto;
  cursor: pointer;
  flex-shrink: 0;
}

.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: absolute;
  bottom: 20px;
  width: auto;
  text-align: center;
  color: #909399;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
  z-index: 10;
}

// 响应式适配
@media (max-width: 992px) {
  .login-left {
    width: 45%;
  }
  
  .login-right {
    width: 55%;
  }
  
  .form-container {
    width: 480px;
  }
  
  .title {
    font-size: 32px;
    font-weight: 100;
  }
  
  .title-logo {
    width: 42px;
    height: 42px;
  }
}

@media (max-width: 768px) {
  .login {
    flex-direction: column;
  }
  
  .login-left {
    width: 100%;
    height: 35vh;
    
    :deep(.el-carousel) {
      height: 100%;
    }
  }
  
  .login-right {
    width: 100%;
    height: 65vh;
    padding: 20px;
  }
  
  .form-container {
    width: 100%;
    max-width: 400px;
  }
  
  .login-form {
    .el-input {
      height: 44px;
      input {
        height: 44px;
        font-size: 15px;
      }
    }
  }
  
  .title-container {
    margin-bottom: 25px;
  }
  
  .title {
    font-size: 24px;
    font-weight: 100;
  }
  
  .title-logo {
    width: 36px;
    height: 36px;
    margin-right: 10px;
  }
  
  .form-switch {
    margin-bottom: 25px;
    gap: 30px;
    
    .switch-item {
      font-size: 15px;
      padding: 10px 6px;
    }
  }
}
</style>
