<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="平台" prop="platformId">
        <el-select v-model="queryParams.platformId" placeholder="请选择平台" clearable style="width: 200px">
          <el-option
            v-for="platform in platformOptions"
            :key="platform.id"
            :label="platform.label"
            :value="String(platform.id)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="产品" prop="productId">
        <el-select v-model="queryParams.productId" placeholder="请选择产品" clearable style="width: 200px">
          <el-option
            v-for="product in productOptions"
            :key="product.id"
            :label="product.label"
            :value="String(product.id)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="账号" prop="account">
        <el-input
          v-model="queryParams.account"
          placeholder="请输入账号"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="账号状态" clearable style="width: 200px">
          <el-option label="正常" :value="1" />
          <el-option label="过期" :value="2" />
          <el-option label="异常" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="accountList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="账号ID" align="center" prop="id" width="100" />
      <el-table-column label="平台" align="center" prop="platformId" width="150">
        <template #default="scope">
          {{ getPlatformName(scope.row.platformId) }}
        </template>
      </el-table-column>
      <el-table-column label="产品" align="center" prop="productId" width="120">
        <template #default="scope">
          {{ getProductName(scope.row.productId) }}
        </template>
      </el-table-column>
      <el-table-column label="账号" align="center" prop="account"  />
      <el-table-column label="店铺" align="center" prop="storeNames" width="200">
        <template #default="scope">
          <div v-if="scope.row.storeNames && scope.row.storeNames.length > 0">
            <el-tag 
              v-for="(store, index) in scope.row.storeNames" 
              :key="index" 
              type="info" 
              size="small"
              style="margin: 2px;"
            >
              {{ store }}
            </el-tag>
          </div>
          <span v-else style="color: #909399;">未绑定</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="200">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 1" type="success">正常</el-tag>
          <el-tag v-else-if="scope.row.status === 2" type="warning">过期</el-tag>
          <el-tag v-else-if="scope.row.status === 3" type="danger">异常</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
      <template #default="scope">
        <span>{{ parseTime(scope.row.updateTime) }}</span>
      </template>
    </el-table-column>

      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="500" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button link type="primary" icon="View" @click="handleLogin(scope.row)">登录</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改账号对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="accountRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="平台" prop="platformId">
          <el-select 
            v-model="form.platformId" 
            placeholder="请选择平台" 
            style="width: 100%"
            clearable
            @change="handlePlatformChange"
            @clear="handlePlatformClear"
          >
            <el-option
              v-for="platform in platformOptions"
              :key="platform.id"
              :label="platform.label"
              :value="String(platform.id)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="产品" prop="productId">
          <el-select 
            v-model="form.productId" 
            placeholder="请选择产品" 
            style="width: 100%"
            clearable
            @change="handleProductChange"
            @clear="handleProductClear"
          >
            <el-option
              v-for="product in filteredProductOptions"
              :key="product.id"
              :label="product.label"
              :value="String(product.id)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="账号" prop="account">
          <el-input v-model="form.account" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 二维码登录对话框 -->
    <el-dialog title="扫码登录" v-model="qrcodeOpen" width="400px" append-to-body @close="handleQRCodeCancel">
      <div style="text-align: center;">
        <div v-if="qrcodeLoading" style="padding: 50px;">
          <el-icon class="is-loading" :size="40">
            <Loading />
          </el-icon>
          <div style="margin-top: 10px;">加载中...</div>
        </div>
        <div v-else-if="qrcodeBase64" style="padding: 20px;">
          <img :src="'data:image/png;base64,' + qrcodeBase64" alt="二维码" style="width: 250px; height: 250px;" />
          <div style="margin-top: 15px; color: #606266;">
            <el-icon><InfoFilled /></el-icon>
            请使用{{ currentAccount ? getProductName(currentAccount.productId) : '' }}APP扫描二维码登录
          </div>
          <div style="margin-top: 10px; color: #909399; font-size: 12px;">
            等待扫码中...（{{ countdown }}秒后超时）
          </div>
        </div>
        <div v-else style="padding: 50px; color: #f56c6c;">
          获取二维码失败，请重试
        </div>
        
        <!-- 验证码输入区域 -->
        <div v-if="needVerify" style="margin-top: 20px;">
          <el-alert type="warning" :closable="false" style="margin-bottom: 15px;">
            <template #title>需要身份验证</template>
          </el-alert>
          <el-button 
            type="primary" 
            @click="handleSendVerifyCode" 
            :loading="verifySending"
            :disabled="verifyButtonDisabled"
            style="width: 100%; margin-bottom: 10px;"
          >
            {{ verifyButtonDisabled ? '验证码已发送' : '发送验证码' }}
          </el-button>
          <el-input 
            v-model="verifyCode" 
            placeholder="请输入验证码"
            maxlength="8"
            style="margin-bottom: 10px;"
          />
          <el-button 
            type="success" 
            @click="handleSubmitVerifyCode"
            style="width: 100%;"
          >
            提交验证码
          </el-button>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleQRCodeCancel">取 消</el-button>
          <el-button type="primary" @click="handleLogin(currentAccount)">重新获取</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="DvdAccount">
import { listAccount, getAccount, addAccount, updateAccount, delAccount, getQRCode, checkQRCodeStatus, sendVerifyCode, submitVerifyCode } from "@/api/dvdAccount/account";
import { treeselect } from "@/api/dvdConfig/configMenu";

const { proxy } = getCurrentInstance();

const accountList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

// 平台和产品选项
const platformOptions = ref([]);
const productOptions = ref([]);
const filteredProductOptions = ref([]);
const menuTree = ref([]);

// 二维码登录相关
const qrcodeOpen = ref(false);
const qrcodeLoading = ref(false);
const qrcodeBase64 = ref("");
const qrcodeToken = ref("");
const qrcodePollingTimer = ref(null);
const countdown = ref(120);
const countdownTimer = ref(null);
const currentAccount = ref(null);

// 验证码相关
const needVerify = ref(false);
const verifyTicket = ref("");
const verifyCookies = ref(null);
const verifyCode = ref("");
const verifySending = ref(false);
const verifyButtonDisabled = ref(false);
const verifyWays = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    platformId: undefined,
    productId: undefined,
    account: undefined,
    status: undefined
  },
  rules: {
    platformId: [{ required: true, message: "平台不能为空", trigger: "change" }],
    productId: [{ required: true, message: "产品不能为空", trigger: "change" }],
    account: [{ required: true, message: "账号不能为空", trigger: "blur" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询账号列表 */
function getList() {
  loading.value = true;
  listAccount(queryParams.value).then(response => {
    accountList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 获取平台和产品选项 */
function getMenuOptions() {
  treeselect().then(response => {
    menuTree.value = response.data;
    // 提取平台（一级菜单）
    platformOptions.value = response.data.map(item => ({
      id: item.id,
      label: item.label
    }));
    // 提取所有产品（二级菜单）
    productOptions.value = [];
    response.data.forEach(platform => {
      if (platform.children && platform.children.length > 0) {
        platform.children.forEach(product => {
          productOptions.value.push({
            id: product.id,
            label: product.label,
            parentId: platform.id
          });
        });
      }
    });
  });
}

/** 根据ID获取平台名称 */
function getPlatformName(id) {
  const platform = platformOptions.value.find(item => String(item.id) === String(id));
  return platform ? platform.label : id;
}

/** 根据ID获取产品名称 */
function getProductName(id) {
  const product = productOptions.value.find(item => String(item.id) === String(id));
  return product ? product.label : id;
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    id: undefined,
    platformId: undefined,
    productId: undefined,
    account: undefined,
    password: undefined
  };
  proxy.resetForm("accountRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  // 初始化时显示所有产品选项
  filteredProductOptions.value = productOptions.value;
  open.value = true;
  title.value = "添加账号";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const accountId = row.id || ids.value[0];
  getAccount(accountId).then(response => {
    form.value = response.data;
    // 根据已选择的平台或产品过滤选项
    if (form.value.platformId) {
      filterProductsByPlatform(form.value.platformId);
    } else if (form.value.productId) {
      filterPlatformByProduct(form.value.productId);
    } else {
      filteredProductOptions.value = productOptions.value;
    }
    open.value = true;
    title.value = "修改账号";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["accountRef"].validate(valid => {
    if (valid) {
      if (form.value.id != undefined) {
        updateAccount(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addAccount(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const accountIds = row.id || ids.value.join(',');
  proxy.$modal.confirm('是否确认删除账号编号为"' + accountIds + '"的数据项？').then(function() {
    return delAccount(accountIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 登录按钮操作 */
function handleLogin(row) {
  currentAccount.value = row;
  qrcodeOpen.value = true;
  qrcodeLoading.value = true;
  qrcodeBase64.value = "";
  qrcodeToken.value = "";
  countdown.value = 120;

  // 获取二维码（传递平台ID和产品ID）
  getQRCode({
    platformId: row.platformId,
    productId: row.productId
  }).then(response => {
    qrcodeBase64.value = response.data.qrcodeBase64;
    qrcodeToken.value = response.data.token;
    qrcodeLoading.value = false;

    // 开始轮询检查扫码状态
    startQRCodePolling(row.id);
  }).catch(() => {
    qrcodeLoading.value = false;
    proxy.$modal.msgError("获取二维码失败");
  });
}

/** 开始轮询检查二维码状态 */
function startQRCodePolling(accountId) {
  // 清除旧的定时器
  stopQRCodePolling();

  // 开始倒计时
  countdownTimer.value = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      stopQRCodePolling();
      // 2分钟超时，标记账号状态为异常
      updateAccount({
        id: accountId,
        status: 3
      }).then(() => {
        proxy.$modal.msgWarning("二维码已过期，请重新获取");
        qrcodeOpen.value = false;
        getList();
      });
    }
  }, 1000);

  // 每2秒检查一次
  qrcodePollingTimer.value = setInterval(() => {
    checkQRCodeStatus({
      token: qrcodeToken.value,
      accountId: accountId
    }).then(response => {
      if (response.data.status === 'success') {
        stopQRCodePolling();
        proxy.$modal.msgSuccess("登录成功");
        qrcodeOpen.value = false;
        getList();
      } else if (response.data.status === 'verify_code') {
        // 需要身份验证
        stopQRCodePolling();
        needVerify.value = true;
        verifyTicket.value = response.data.verifyTicket;
        verifyCookies.value = response.data.cookies;
        verifyWays.value = response.data.verifyWays || [];
      }
    }).catch(() => {
      // 检查失败，继续轮询
    });
  }, 2000);
}

/** 停止轮询 */
function stopQRCodePolling() {
  if (qrcodePollingTimer.value) {
    clearInterval(qrcodePollingTimer.value);
    qrcodePollingTimer.value = null;
  }
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
    countdownTimer.value = null;
  }
}

/** 取消二维码登录 */
function handleQRCodeCancel() {
  stopQRCodePolling();
  qrcodeOpen.value = false;
  qrcodeBase64.value = "";
  qrcodeToken.value = "";
  countdown.value = 120;
  currentAccount.value = null;
  resetVerifyState();
}

/** 发送验证码 */
function handleSendVerifyCode() {
  verifySending.value = true;
  sendVerifyCode({
    verifyTicket: verifyTicket.value,
    cookies: verifyCookies.value,
    accountId: currentAccount.value.id
  }).then(response => {
    proxy.$modal.msgSuccess("验证码已发送");
    verifyButtonDisabled.value = true;
  }).catch(() => {
    proxy.$modal.msgError("发送验证码失败");
  }).finally(() => {
    verifySending.value = false;
  });
}

/** 提交验证码 */
function handleSubmitVerifyCode() {
  if (!verifyCode.value) {
    proxy.$modal.msgWarning("请输入验证码");
    return;
  }
  
  submitVerifyCode({
    verifyCode: verifyCode.value,
    verifyTicket: verifyTicket.value,
    cookies: verifyCookies.value,
    token: qrcodeToken.value,
    accountId: currentAccount.value.id
  }).then(response => {
    if (response.data.status === 'success') {
      proxy.$modal.msgSuccess("登录成功");
      qrcodeOpen.value = false;
      resetVerifyState();
      getList();
    }
  }).catch(() => {
    proxy.$modal.msgError("验证码错误或已失效");
  });
}

/** 重置验证码状态 */
function resetVerifyState() {
  needVerify.value = false;
  verifyTicket.value = "";
  verifyCookies.value = null;
  verifyCode.value = "";
  verifyButtonDisabled.value = false;
  verifySending.value = false;
  verifyWays.value = [];
}

/** 平台改变时，过滤产品选项 */
function handlePlatformChange(platformId) {
  if (platformId) {
    filterProductsByPlatform(platformId);
    // 如果当前选择的产品不在过滤后的列表中，清空产品选择
    if (form.value.productId) {
      const productExists = filteredProductOptions.value.some(
        product => String(product.id) === String(form.value.productId)
      );
      if (!productExists) {
        form.value.productId = undefined;
      }
    }
  } else {
    // 如果清空平台，显示所有产品
    filteredProductOptions.value = productOptions.value;
  }
}

/** 产品改变时，自动设置平台 */
function handleProductChange(productId) {
  if (productId) {
    filterPlatformByProduct(productId);
  }
}

/** 根据平台ID过滤产品 */
function filterProductsByPlatform(platformId) {
  filteredProductOptions.value = productOptions.value.filter(
    product => String(product.parentId) === String(platformId)
  );
}

/** 根据产品ID自动设置平台 */
function filterPlatformByProduct(productId) {
  const product = productOptions.value.find(
    item => String(item.id) === String(productId)
  );
  if (product && product.parentId) {
    form.value.platformId = String(product.parentId);
    filterProductsByPlatform(product.parentId);
  }
}

/** 清空平台选择 */
function handlePlatformClear() {
  form.value.platformId = undefined;
  // 清空平台时，显示所有产品供选择
  filteredProductOptions.value = productOptions.value;
}

/** 清空产品选择 */
function handleProductClear() {
  form.value.productId = undefined;
  // 清空产品时，如果有选择平台，则保持该平台下的产品列表
  // 如果没有选择平台，则显示所有产品
  if (form.value.platformId) {
    filterProductsByPlatform(form.value.platformId);
  } else {
    filteredProductOptions.value = productOptions.value;
  }
}

// 组件卸载时清除定时器
onUnmounted(() => {
  stopQRCodePolling();
});

// 初始化
getMenuOptions();
getList();
</script>

<style scoped>
</style>
