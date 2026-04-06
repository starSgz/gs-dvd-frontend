<template>
   <div class="app-container" style="padding: 20px; background: #faf9f5;">
      <SystemPageLayout title="菜单管理" :show-filter="showSearch" :show-summary="false">
      <template #filter>
      <el-form :model="queryParams" ref="queryRef" class="system-filter-form">
         <div class="system-filter-grid">
         <el-form-item label="菜单名称" prop="dvdConfigMenuName">
            <el-input
               v-model="queryParams.dvdConfigMenuName"
               placeholder="请输入菜单名称"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="菜单状态" clearable style="width: 200px">
               <el-option
                  v-for="dict in sys_normal_disable"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
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
               type="info"
               plain
               icon="Sort"
               @click="toggleExpandAll"
            >展开/折叠</el-button>
         </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
       </el-row>
      </div>
      </template>

      <div class="system-table-wrap">
       <el-table
          v-if="refreshTable"
          v-loading="loading"
          :data="menuList"
          class="system-data-table"
          border
          row-key="dvdConfigMenuId"
          :default-expand-all="isExpandAll"
          :default-expanded-keys="expandedKeys"
         :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
         :indent="20"
      >
         <el-table-column label="菜单名称" :show-overflow-tooltip="true" width="800">
            <template #default="scope">
               <span class="menu-name-content">
                  <!-- F类型：显示爬虫图标 -->
                  <span v-if="scope.row.dvdConfigMenuType === 'F'" class="config-menu-icon-wrapper">
                     <svg-icon icon-class="crawl_logo" class="config-menu-svg-icon" />
                  </span>
                  <!-- C类型：不显示图标 -->
                  <span v-else-if="scope.row.dvdConfigMenuType === 'C'"></span>
                  <!-- P/D类型：显示Logo或默认图标 -->
                  <template v-else>
                     <el-avatar 
                        v-if="scope.row.logo || scope.row.screenshotUrl" 
                        :src="getLogoUrl(scope.row.logo || scope.row.screenshotUrl)" 
                        :size="32"
                        class="config-menu-logo"
                     />
                     <el-avatar 
                        v-else
                        :size="32"
                        class="config-menu-logo"
                     >
                        <el-icon :size="18"><Menu /></el-icon>
                     </el-avatar>
                  </template>
                  <span class="menu-name-text">{{ scope.row.dvdConfigMenuName }}</span>
               </span>
            </template>
         </el-table-column>
         <el-table-column prop="orderNum" label="优先级" width="200" align="center">
            <template #default="scope">
               <span v-if="scope.row.dvdConfigMenuType === 'F'">{{ scope.row.orderNum }}</span>
               <span v-else>-</span>
            </template>
         </el-table-column>
         <el-table-column label="映射方法" width="400" align="center" :show-overflow-tooltip="true">
            <template #default="scope">
               <span v-if="scope.row.dvdConfigMenuType === 'F'">{{ scope.row.dvdConfigMenuName }}</span>
               <span v-else>-</span>
            </template>
         </el-table-column>
         
         <el-table-column prop="remark" label="备注" :show-overflow-tooltip="true"></el-table-column>
         <el-table-column prop="status" label="状态" width="80">
            <template #default="scope">
               <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column label="创建时间" align="center" width="160" prop="createTime">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" width="210" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
               <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)">新增</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
            </template>
         </el-table-column>
       </el-table>
      </div>
      </SystemPageLayout>

      <!-- 添加或修改菜单对话框 -->
      <el-dialog :title="title" v-model="open" width="680px" append-to-body>
         <el-form ref="menuRef" :model="form" :rules="rules" label-width="100px">
            <el-row>
               <el-col :span="24">
                  <el-form-item label="上级菜单">
                     <el-tree-select
                        v-model="form.dvdConfigParentId"
                        :data="menuOptions"
                        :props="{ value: 'id', label: 'label', children: 'children' }"
                        value-key="id"
                        placeholder="选择上级菜单"
                        check-strictly
                     />
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="菜单类型" prop="dvdConfigMenuType">
                     <el-radio-group v-model="form.dvdConfigMenuType">
                        <el-radio value="P">平台口径</el-radio>
                        <el-radio value="D">产品口径</el-radio>
                        <el-radio value="C">数据口径</el-radio>
                        <el-radio value="F">映射方法</el-radio>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
               <el-col :span="24" v-if="form.dvdConfigMenuType === 'P' || form.dvdConfigMenuType === 'D'">
                  <el-form-item label="Logo图标">
                     <image-upload 
                        v-model="form.logo" 
                        :limit="1"
                        :file-size="2"
                        :file-type="['png', 'jpg', 'jpeg']"
                     />
                  </el-form-item>
               </el-col>
               <el-col :span="24" v-if="form.dvdConfigMenuType === 'F'">
                  <el-form-item label="功能截图">
                     <image-upload 
                        v-model="form.screenshotUrl" 
                        :limit="1"
                        :file-size="5"
                        :file-type="['png', 'jpg', 'jpeg']"
                     />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="菜单名称" prop="dvdConfigMenuName">
                     <el-input v-model="form.dvdConfigMenuName" placeholder="请输入菜单名称" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="显示排序" prop="orderNum">
                     <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="菜单状态">
                     <el-radio-group v-model="form.status">
                        <el-radio
                           v-for="dict in sys_normal_disable"
                           :key="dict.value"
                           :value="dict.value"
                        >{{ dict.label }}</el-radio>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="备注">
                     <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" :rows="3" />
                  </el-form-item>
               </el-col>
            </el-row>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">确 定</el-button>
               <el-button @click="cancel">取 消</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="ConfigMenu">
import { addConfigMenu, delConfigMenu, getConfigMenu, listConfigMenu, updateConfigMenu, treeselect } from "@/api/dvdConfig/configMenu";
import ImageUpload from "@/components/ImageUpload";
import SvgIcon from "@/components/SvgIcon";
import SystemPageLayout from "@/components/SystemPageLayout";

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");

const menuList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const title = ref("");
const menuOptions = ref([]);
const isExpandAll = ref(false);
const refreshTable = ref(true);
const expandedKeys = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    dvdConfigMenuName: undefined,
    status: undefined
  },
  rules: {
    dvdConfigMenuName: [{ required: true, message: "菜单名称不能为空", trigger: "blur" }],
    orderNum: [{ required: true, message: "显示顺序不能为空", trigger: "blur" }],
    dvdConfigMenuType: [{ required: true, message: "菜单类型不能为空", trigger: "change" }]
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 获取Logo完整URL */
function getLogoUrl(logo) {
  if (!logo) return '';
  const baseUrl = import.meta.env.VITE_APP_BASE_API;
  if (logo.startsWith('http')) {
    return logo;
  }
  return baseUrl + logo;
}

/** 获取菜单类型标签文本 */
function getMenuTypeLabel(type) {
  const typeMap = {
    'P': '平台口径',
    'D': '产品口径',
    'C': '数据口径',
    'F': '映射方法'
  };
  return typeMap[type] || '未知';
}

/** 获取菜单类型标签颜色 */
function getMenuTypeTagType(type) {
  const typeMap = {
    'P': 'primary',
    'D': 'success',
    'C': 'info',
    'F': 'warning'
  };
  return typeMap[type] || '';
}

/** 获取从根节点到指定节点的所有父节点ID路径 */
function getParentPath(menuId, menuData) {
  const path = [];
  
  function findPath(id, data, currentPath = []) {
    for (const item of data) {
      if (item.dvdConfigMenuId === id) {
        // 找到目标节点，返回当前路径
        path.push(...currentPath);
        return true;
      }
      if (item.children && item.children.length > 0) {
        // 将当前节点加入路径继续查找
        if (findPath(id, item.children, [...currentPath, item.dvdConfigMenuId])) {
          return true;
        }
      }
    }
    return false;
  }
  
  findPath(menuId, menuData);
  console.log('getParentPath - menuId:', menuId, 'path:', path);
  return path;
}

/** 查询菜单列表 */
function getList(keepExpanded = false) {
  loading.value = true;
  listConfigMenu(queryParams.value).then(response => {
    menuList.value = proxy.handleTree(response.data, "dvdConfigMenuId", "dvdConfigParentId");
    // 如果不保持展开状态，则重置展开的keys
    if (!keepExpanded) {
      expandedKeys.value = [];
    }
    loading.value = false;
  });
}

/** 查询菜单下拉树结构 */
function getTreeselect() {
  menuOptions.value = [];
  treeselect().then(response => {
    const menu = { id: 0, label: "主类目", children: [] };
    menu.children = response.data;
    menuOptions.value.push(menu);
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
    dvdConfigMenuId: undefined,
    dvdConfigParentId: 0,
    dvdConfigMenuName: undefined,
    dvdConfigMenuType: "P",
    orderNum: 0,
    logo: undefined,
    screenshotUrl: undefined,
    status: "0",
    remark: null
  };
  proxy.resetForm("menuRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 新增按钮操作 */
function handleAdd(row) {
  reset();
  getTreeselect();
  if (row != null && row.dvdConfigMenuId) {
    form.value.dvdConfigParentId = row.dvdConfigMenuId;
  } else {
    form.value.dvdConfigParentId = 0;
  }
  open.value = true;
  title.value = "添加配置菜单";
}

/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false;
  isExpandAll.value = !isExpandAll.value;
  // 切换全部展开时清空手动展开的keys
  if (!isExpandAll.value) {
    expandedKeys.value = [];
  }
  nextTick(() => {
    refreshTable.value = true;
  });
}

/** 修改按钮操作 */
async function handleUpdate(row) {
  reset();
  await getTreeselect();
  getConfigMenu(row.dvdConfigMenuId).then(response => {
    form.value = response.data; 
    open.value = true;
    title.value = "修改配置菜单";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["menuRef"].validate(valid => {
    if (valid) {
      const parentId = form.value.dvdConfigParentId;
      const menuId = form.value.dvdConfigMenuId;
      const isEdit = menuId != undefined;
      
      const savePromise = isEdit ? updateConfigMenu(form.value) : addConfigMenu(form.value);
      
      savePromise.then(response => {
        proxy.$modal.msgSuccess(isEdit ? "修改成功" : "新增成功");
        open.value = false;
        
        // 重新加载列表数据
        loading.value = true;
        listConfigMenu(queryParams.value).then(res => {
          const treeData = proxy.handleTree(res.data, "dvdConfigMenuId", "dvdConfigParentId");
          
          // 计算需要展开的路径
          let keysToExpand = [];
          if (isEdit && menuId) {
            // 编辑时：展开被编辑项的完整路径
            keysToExpand = getParentPath(menuId, treeData);
            console.log('编辑模式 - expandedKeys:', keysToExpand);
          } else if (parentId && parentId !== 0) {
            // 新增时：展开父级的完整路径（包括父级本身）
            keysToExpand = getParentPath(parentId, treeData);
            keysToExpand.push(parentId);
            console.log('新增模式 - parentId:', parentId, 'expandedKeys:', keysToExpand);
          } else {
            // 在根目录新增
            keysToExpand = [];
            console.log('根目录新增 - expandedKeys:', keysToExpand);
          }
          
          // 刷新表格以应用新的展开状态
          refreshTable.value = false;
          nextTick(() => {
            // 先更新数据，再设置展开的keys，确保同步
            menuList.value = treeData;
            expandedKeys.value = keysToExpand;
            refreshTable.value = true;
            loading.value = false;
          });
        });
      });
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  proxy.$modal.confirm('是否确认删除名称为"' + row.dvdConfigMenuName + '"的数据项?').then(function() {
    return delConfigMenu(row.dvdConfigMenuId);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

getList();
</script>

<style scoped lang="scss">
.menu-name-content {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  vertical-align: middle;
}

.config-menu-logo {
  flex-shrink: 0;
  vertical-align: middle;
}

.config-menu-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.config-menu-svg-icon {
  font-size: 24px;
  width: 24px;
  height: 24px;
}

.menu-name-text {
  vertical-align: middle;
  line-height: 32px;
}

// 调整树形表格的展开图标大小
:deep(.el-table__expand-icon) {
  font-size: 16px !important;
  width: 20px;
  height: 20px;
  line-height: 20px;
  vertical-align: middle;
  margin-right: 4px;
}

// 确保表格单元格内容对齐
:deep(.el-table .cell) {
  display: flex;
  align-items: center;
}

// 确保展开图标在左侧
:deep(.el-table__indent) {
  padding-left: 0;
}
</style>
