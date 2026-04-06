<template>
   <div class="app-container" style="padding: 20px; background: #faf9f5;">
      <SystemPageLayout title="卡密管理" :total="total" :show-filter="showSearch">
      <template #filter>
      <!-- 搜索表单 -->
      <el-form :model="queryParams" ref="queryRef" label-width="80px" class="system-filter-form search-form">
         <div class="system-filter-grid">
         <el-form-item label="卡密" prop="accessKey">
            <el-input
               v-model="queryParams.accessKey"
               placeholder="请输入卡密"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="状态" prop="flag">
            <el-select
               v-model="queryParams.flag"
               placeholder="有效状态"
               clearable
               style="width: 140px"
            >
               <el-option label="有效" value="0" />
               <el-option label="过期" value="1" />
            </el-select>
         </el-form-item>
         <el-form-item label="使用状态" prop="isUsed">
            <el-select
               v-model="queryParams.isUsed"
               placeholder="使用状态"
               clearable
               style="width: 140px"
            >
               <el-option label="未使用" value="0" />
               <el-option label="已使用" value="1" />
            </el-select>
         </el-form-item>
         <el-form-item label="创建时间" style="width: 308px">
            <el-date-picker
               v-model="dateRange"
               value-format="YYYY-MM-DD"
               type="daterange"
               range-separator="-"
               start-placeholder="开始日期"
               end-placeholder="结束日期"
            />
         </el-form-item>
         <el-form-item class="system-filter-actions">
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
         </div>
      </el-form>
      </template>

      <template #toolbar>
      <div class="system-toolbar-row">

      <!-- 操作按钮 -->
      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="primary"
               plain
               icon="Plus"
               @click="handleAdd"
               v-hasPermi="['dvd:accessKey:add']"
            >新增卡密</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['dvd:accessKey:remove']"
            >批量删除</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>
      </div>
      </template>

      <!-- 数据表格 -->
      <div class="system-table-wrap">
      <el-table v-loading="loading" :data="accessKeyList" class="system-data-table" @selection-change="handleSelectionChange" border stripe>
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="卡密" align="center" prop="accessKey" min-width="80" show-overflow-tooltip>
            <template #default="scope">
               <div class="key-cell">
                  <span class="key-text">{{ scope.row.accessKey }}</span>
                  <el-button link type="primary" icon="CopyDocument" @click="copyKey(scope.row.accessKey)" />
               </div>
            </template>
         </el-table-column>
         <el-table-column label="可激活时长" align="center" min-width="150">
            <template #default="scope">
               <span class="duration-text">{{ formatDuration(scope.row.durationHours) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="可绑定店铺数" align="center" prop="bindStoreNum" width="120">
            <template #default="scope">
               <el-tag type="warning">{{ scope.row.bindStoreNum }}</el-tag>
            </template>
         </el-table-column>
         <el-table-column label="状态" align="center" prop="flag" width="90">
            <template #default="scope">
               <el-tag :type="scope.row.flag === '0' ? 'success' : 'danger'">
                  {{ scope.row.flag === '0' ? '有效' : '过期' }}
               </el-tag>
            </template>
         </el-table-column>
         <el-table-column label="使用状态" align="center" prop="isUsed" width="100">
            <template #default="scope">
               <el-tag :type="scope.row.isUsed === '0' ? 'info' : 'success'" effect="plain">
                  {{ scope.row.isUsed === '0' ? '未使用' : '已使用' }}
               </el-tag>
            </template>
         </el-table-column>
         <el-table-column label="被激活时间" align="center" prop="usedTime" width="170">
            <template #default="scope">
               <span v-if="scope.row.usedTime">{{ parseTime(scope.row.usedTime) }}</span>
               <span v-else class="text-muted">-</span>
            </template>
         </el-table-column>
         <el-table-column label="到期时间" align="center" width="170">
            <template #default="scope">
               <span v-if="scope.row.isUsed === '1' && scope.row.usedTime" class="expire-time">
                  {{ getExpireTime(scope.row.usedTime, scope.row.durationHours) }}
               </span>
               <span v-else-if="scope.row.isUsed === '0'" class="text-muted">未激活</span>
               <span v-else class="text-muted">-</span>
            </template>
         </el-table-column>
         <el-table-column label="使用截止日期" align="center" width="170">
            <template #default="scope">
               <!-- <span v-if="scope.row.useDeadline" :class="scope.row.isUsed === '0' ? 'expire-time' : ''">{{ parseTime(scope.row.useDeadline) }}</span> -->
               <span v-if="scope.row.useDeadline" class="expire-time">{{ parseTime(scope.row.useDeadline) }}</span>
               <span v-else class="text-muted">不限</span>
            </template>
         </el-table-column>
         <el-table-column label="创建时间" align="center" prop="createTime" width="170">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" width="150" fixed="right">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['dvd:accessKey:edit']">编辑</el-button>
               <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['dvd:accessKey:remove']">删除</el-button>
            </template>
         </el-table-column>
      </el-table>
      </div>

      <!-- 分页 -->
      <template #footer>
      <pagination
         v-show="total > 0"
         :total="total"
         v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize"
         @pagination="getList"
      />
      </template>
      </SystemPageLayout>

      <!-- 新增卡密对话框 -->
      <el-dialog :title="title" v-model="open" width="580px" append-to-body destroy-on-close>
         <el-form ref="accessKeyRef" :model="form" :rules="rules" label-width="110px">
            <el-form-item label="有效时长" required>
               <div class="duration-inputs">
                  <div class="duration-item">
                     <el-input-number v-model="form.years" :min="0" :max="99" controls-position="right" />
                     <span class="duration-label">年</span>
                  </div>
                  <div class="duration-item">
                     <el-input-number v-model="form.months" :min="0" :max="11" controls-position="right" />
                     <span class="duration-label">月</span>
                  </div>
                  <div class="duration-item">
                     <el-input-number v-model="form.days" :min="0" :max="30" controls-position="right" />
                     <span class="duration-label">天</span>
                  </div>
                  <div class="duration-item">
                     <el-input-number v-model="form.hours" :min="0" :max="23" controls-position="right" />
                     <span class="duration-label">时</span>
                  </div>
               </div>
               <div class="duration-preview" v-if="getTotalHours(form) > 0">
                  预计时长：{{ formatDuration(getTotalHours(form)) }}
               </div>
            </el-form-item>
            <el-form-item label="使用截止日期">
               <div class="duration-inputs">
                  <div class="duration-item">
                     <el-input-number v-model="form.deadlineYears" :min="0" :max="99" controls-position="right" />
                     <span class="duration-label">年</span>
                  </div>
                  <div class="duration-item">
                     <el-input-number v-model="form.deadlineMonths" :min="0" :max="11" controls-position="right" />
                     <span class="duration-label">月</span>
                  </div>
                  <div class="duration-item">
                     <el-input-number v-model="form.deadlineDays" :min="0" :max="30" controls-position="right" />
                     <span class="duration-label">天</span>
                  </div>
                  <div class="duration-item">
                     <el-input-number v-model="form.deadlineHours" :min="0" :max="23" controls-position="right" />
                     <span class="duration-label">时</span>
                  </div>
               </div>
               <div class="duration-preview" v-if="getDeadlineTotal(form) > 0">
                  截止于：{{ getDeadlinePreview(form) }}
               </div>
               <div class="duration-tip">不填写则表示不限制截止日期</div>
            </el-form-item>
            <el-form-item label="可绑定店铺数" prop="bindStoreNum">
               <el-input-number 
                  v-model="form.bindStoreNum" 
                  :min="1" 
                  :max="999" 
                  controls-position="right"
                  style="width: 100%"
               />
            </el-form-item>
            <el-form-item label="备注" prop="remark">
               <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" :rows="3" />
            </el-form-item>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm" :loading="submitLoading">确 定</el-button>
               <el-button @click="cancel">取 消</el-button>
            </div>
         </template>
      </el-dialog>

      <!-- 编辑卡密对话框 -->
      <el-dialog title="编辑卡密" v-model="editOpen" width="580px" append-to-body destroy-on-close>
         <el-form ref="editRef" :model="editForm" :rules="editRules" label-width="110px">
            <el-form-item label="卡密">
               <el-input v-model="editForm.accessKey" disabled />
            </el-form-item>
            <el-form-item label="有效时长">
               <div class="duration-inputs">
                  <div class="duration-item">
                     <el-input-number v-model="editForm.years" :min="0" :max="99" controls-position="right" />
                     <span class="duration-label">年</span>
                  </div>
                  <div class="duration-item">
                     <el-input-number v-model="editForm.months" :min="0" :max="11" controls-position="right" />
                     <span class="duration-label">月</span>
                  </div>
                  <div class="duration-item">
                     <el-input-number v-model="editForm.days" :min="0" :max="30" controls-position="right" />
                     <span class="duration-label">天</span>
                  </div>
                  <div class="duration-item">
                     <el-input-number v-model="editForm.hours" :min="0" :max="23" controls-position="right" />
                     <span class="duration-label">时</span>
                  </div>
               </div>
               <div class="duration-preview" v-if="getTotalHours(editForm) > 0">
                  预计时长：{{ formatDuration(getTotalHours(editForm)) }}
               </div>
            </el-form-item>
            <el-form-item label="使用截止日期">
               <el-date-picker
                  v-model="editForm.useDeadline"
                  type="datetime"
                  placeholder="选择截止日期"
                  style="width: 100%"
                  value-format="YYYY-MM-DD HH:mm:ss"
               />
               <div class="duration-tip">不填写则表示不限制截止日期</div>
            </el-form-item>
            <el-form-item label="可绑定店铺数" prop="bindStoreNum">
               <el-input-number 
                  v-model="editForm.bindStoreNum" 
                  :min="1" 
                  :max="999" 
                  controls-position="right"
                  style="width: 100%"
               />
            </el-form-item>
            <el-form-item label="有效状态" prop="flag">
               <el-radio-group v-model="editForm.flag">
                  <el-radio label="0">有效</el-radio>
                  <el-radio label="1">过期</el-radio>
               </el-radio-group>
            </el-form-item>
            <el-form-item label="备注" prop="remark">
               <el-input v-model="editForm.remark" type="textarea" placeholder="请输入备注" :rows="3" />
            </el-form-item>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitEditForm" :loading="submitLoading">确 定</el-button>
               <el-button @click="editOpen = false">取 消</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="ManageKey">
import { listAccessKey, addAccessKey, updateAccessKey, delAccessKey, getAccessKey } from "@/api/dvdConfig/accessKey";
import SystemPageLayout from "@/components/SystemPageLayout";

const { proxy } = getCurrentInstance();

const accessKeyList = ref([]);
const open = ref(false);
const editOpen = ref(false);
const loading = ref(true);
const submitLoading = ref(false);
const showSearch = ref(true);
const ids = ref([]);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);

const data = reactive({
   form: {
      years: 0,
      months: 1,
      days: 0,
      hours: 0,
      deadlineYears: 0,
      deadlineMonths: 0,
      deadlineDays: 0,
      deadlineHours: 0,
      bindStoreNum: 5,
      remark: ''
   },
   editForm: {
      years: 0,
      months: 1,
      days: 0,
      hours: 0,
      useDeadline: null
   },
   queryParams: {
      pageNum: 1,
      pageSize: 10,
      accessKey: undefined,
      flag: undefined,
      isUsed: undefined
   },
   rules: {
      bindStoreNum: [{ required: true, message: "请输入可绑定店铺数", trigger: "blur" }]
   },
   editRules: {
      bindStoreNum: [{ required: true, message: "请输入可绑定店铺数", trigger: "blur" }]
   }
});

const { queryParams, form, editForm, rules, editRules } = toRefs(data);

// 计算总小时数
function getTotalHours(formData) {
   const years = formData.years || 0;
   const months = formData.months || 0;
   const days = formData.days || 0;
   const hours = formData.hours || 0;
   return years * 365 * 24 + months * 30 * 24 + days * 24 + hours;
}

// 计算截止日期总数（用于判断是否设置了截止日期）
function getDeadlineTotal(formData) {
   const years = formData.deadlineYears || 0;
   const months = formData.deadlineMonths || 0;
   const days = formData.deadlineDays || 0;
   const hours = formData.deadlineHours || 0;
   return years + months + days + hours;
}

// 获取截止日期预览
function getDeadlinePreview(formData) {
   const years = formData.deadlineYears || 0;
   const months = formData.deadlineMonths || 0;
   const days = formData.deadlineDays || 0;
   const hours = formData.deadlineHours || 0;
   
   const now = new Date();
   now.setFullYear(now.getFullYear() + years);
   now.setMonth(now.getMonth() + months);
   now.setDate(now.getDate() + days);
   now.setHours(now.getHours() + hours);
   
   return now.toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
   });
}

// 将小时数转换为年月日时格式显示
function formatDuration(totalHours) {
   if (!totalHours || totalHours <= 0) return '-';
   
   const years = Math.floor(totalHours / (365 * 24));
   let remaining = totalHours % (365 * 24);
   
   const months = Math.floor(remaining / (30 * 24));
   remaining = remaining % (30 * 24);
   
   const days = Math.floor(remaining / 24);
   const hours = remaining % 24;
   
   const parts = [];
   if (years > 0) parts.push(`${years}年`);
   if (months > 0) parts.push(`${months}月`);
   if (days > 0) parts.push(`${days}天`);
   if (hours > 0) parts.push(`${hours}小时`);
   
   return parts.length > 0 ? parts.join('') : '0小时';
}

// 将小时数解析为年月日时对象
function parseHoursToForm(totalHours) {
   if (!totalHours || totalHours <= 0) {
      return { years: 0, months: 0, days: 0, hours: 0 };
   }
   
   const years = Math.floor(totalHours / (365 * 24));
   let remaining = totalHours % (365 * 24);
   
   const months = Math.floor(remaining / (30 * 24));
   remaining = remaining % (30 * 24);
   
   const days = Math.floor(remaining / 24);
   const hours = remaining % 24;
   
   return { years, months, days, hours };
}

// 计算到期时间（被激活时间 + 可激活时长）
function getExpireTime(usedTime, durationHours) {
   if (!usedTime || !durationHours) return '-';
   
   const usedDate = new Date(usedTime);
   const expireDate = new Date(usedDate.getTime() + durationHours * 60 * 60 * 1000);
   
   return expireDate.toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
   });
}

// 复制卡密
async function copyKey(key) {
   try {
      if (navigator.clipboard) {
         await navigator.clipboard.writeText(key);
      } else {
         const textArea = document.createElement('textarea');
         textArea.value = key;
         textArea.style.position = 'fixed';
         textArea.style.opacity = '0';
         document.body.appendChild(textArea);
         textArea.select();
         document.execCommand('copy');
         document.body.removeChild(textArea);
      }
      proxy.$modal.msgSuccess("卡密已复制到剪贴板");
   } catch (e) {
      proxy.$modal.msgError("复制失败");
   }
}

/** 查询卡密列表 */
function getList() {
   loading.value = true;
   listAccessKey(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
      accessKeyList.value = response.rows;
      total.value = response.total;
      loading.value = false;
   });
}

/** 取消按钮 */
function cancel() {
   open.value = false;
   reset();
}

/** 表单重置 */
function reset() {
   form.value = {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      deadlineYears: 0,
      deadlineMonths: 0,
      deadlineDays: 0,
      deadlineHours: 0,
      bindStoreNum: 5,
      remark: ''
   };
   proxy.resetForm("accessKeyRef");
}

/** 搜索按钮操作 */
function handleQuery() {
   queryParams.value.pageNum = 1;
   getList();
}

/** 重置按钮操作 */
function resetQuery() {
   dateRange.value = [];
   proxy.resetForm("queryRef");
   handleQuery();
}

/** 新增按钮操作 */
function handleAdd() {
   reset();
   open.value = true;
   title.value = "新增卡密";
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
   ids.value = selection.map(item => item.accessKey);
   multiple.value = !selection.length;
}

/** 修改按钮操作 */
function handleUpdate(row) {
   const accessKey = row.accessKey || ids.value[0];
   getAccessKey(accessKey).then(response => {
      const data = response.data;
      // 将小时数解析为年月日时
      const duration = parseHoursToForm(data.durationHours);
      editForm.value = {
         ...data,
         years: duration.years,
         months: duration.months,
         days: duration.days,
         hours: duration.hours
      };
      editOpen.value = true;
   });
}

/** 提交新增按钮 */
function submitForm() {
   proxy.$refs["accessKeyRef"].validate(valid => {
      if (valid) {
         const totalHours = getTotalHours(form.value);
         if (totalHours <= 0) {
            proxy.$modal.msgWarning("请设置有效时长");
            return;
         }
         submitLoading.value = true;
         addAccessKey(form.value).then(response => {
            proxy.$modal.msgSuccess("新增成功，卡密：" + response.data.accessKey);
            open.value = false;
            getList();
         }).finally(() => {
            submitLoading.value = false;
         });
      }
   });
}

/** 提交编辑按钮 */
function submitEditForm() {
   proxy.$refs["editRef"].validate(valid => {
      if (valid) {
         submitLoading.value = true;
         // 计算总小时数并更新
         const totalHours = getTotalHours(editForm.value);
         const submitData = {
            accessKey: editForm.value.accessKey,
            bindStoreNum: editForm.value.bindStoreNum,
            durationHours: totalHours,
            useDeadline: editForm.value.useDeadline || null,
            flag: editForm.value.flag,
            remark: editForm.value.remark
         };
         updateAccessKey(submitData).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            editOpen.value = false;
            getList();
         }).finally(() => {
            submitLoading.value = false;
         });
      }
   });
}

/** 删除按钮操作 */
function handleDelete(row) {
   const accessKeys = row.accessKey || ids.value.join(',');
   proxy.$modal.confirm('是否确认删除选中的卡密？').then(function() {
      return delAccessKey(accessKeys);
   }).then(() => {
      getList();
      proxy.$modal.msgSuccess("删除成功");
   }).catch(() => {});
}

getList();
</script>

<style scoped>
.search-form {
   padding: 0;
   background: transparent;
   border-radius: 0;
   margin-bottom: 0;
}

.key-cell {
   display: flex;
   align-items: center;
   justify-content: space-between;
}

.key-text {
   font-family: 'Courier New', Consolas, monospace;
   font-size: 13px;
   letter-spacing: 0.5px;
}

.duration-text {
   color: #409eff;
   font-weight: 500;
}

.duration-inputs {
   display: flex;
   gap: 8px;
   flex-wrap: wrap;
}

.duration-item {
   display: flex;
   align-items: center;
   gap: 4px;
}

.duration-item .el-input-number {
   width: 90px;
}

.duration-label {
   color: #606266;
   font-size: 14px;
}

.duration-preview {
   margin-top: 8px;
   font-size: 13px;
   color: #909399;
}

.duration-tip {
   margin-top: 4px;
   font-size: 12px;
   color: #c0c4cc;
}

.text-muted {
   color: #909399;
}

.text-danger {
   color: #f56c6c;
   font-weight: 500;
}

.expire-time {
   color: #f56c6c;
   font-weight: 500;
}

.text-warning {
   color: #e6a23c;
   font-weight: 500;
}

.text-success {
   color: #67c23a;
   font-weight: 500;
}

:deep(.el-table) {
   --el-table-border-color: #ebeef5;
}

:deep(.el-table th.el-table__cell) {
   background-color: #f5f7fa;
   color: #606266;
   font-weight: 600;
}

:deep(.el-dialog__header) {
   border-bottom: 1px solid #ebeef5;
   padding-bottom: 15px;
   margin-bottom: 0;
}

:deep(.el-dialog__body) {
   padding: 30px 20px;
}

:deep(.el-dialog__footer) {
   border-top: 1px solid #ebeef5;
   padding-top: 15px;
}
</style>
