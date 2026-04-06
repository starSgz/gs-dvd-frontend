<template>
  <div class="system-page-layout">
    <section v-if="$slots.filter && showFilter" class="notice-panel filter-panel">
      <slot name="filter" />
    </section>

    <section class="notice-panel content-panel">
      <div v-if="title || $slots['header-extra'] || showSummary" class="panel-heading">
        <h2 v-if="title" class="panel-title">{{ title }}</h2>
        <slot name="header-extra">
          <div v-if="showSummary" class="summary-chip">共 <strong>{{ total }}</strong> {{ summaryUnit }}</div>
        </slot>
      </div>

      <slot name="toolbar" />
      <slot />
      <slot name="footer" />
    </section>
  </div>
</template>

<script setup name="SystemPageLayout">
defineProps({
  title: {
    type: String,
    default: ''
  },
  total: {
    type: [Number, String],
    default: 0
  },
  summaryUnit: {
    type: String,
    default: '条'
  },
  showSummary: {
    type: Boolean,
    default: true
  },
  showFilter: {
    type: Boolean,
    default: true
  }
})
</script>

<style lang="scss" scoped>
.system-page-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
}

.notice-panel {
  background: #fff;
  border: 1px solid #ece6db;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(33, 24, 4, 0.04);
  padding: 18px;
}

.content-panel {
  overflow: hidden;
}

.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.panel-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #2f2a3a;
}

.summary-chip {
  padding: 10px 14px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--el-color-primary) 10%, white);
  color: var(--el-color-primary);
  font-size: 14px;
  white-space: nowrap;
}

.system-page-layout :deep(.system-filter-form .el-form-item) {
  margin-bottom: 0;
}

.system-page-layout :deep(.system-filter-form .el-form-item__label) {
  height: 24px;
  line-height: 24px;
  font-size: 13px;
  color: #524d5f;
  font-weight: 500;
  padding-bottom: 6px;
}

.system-page-layout :deep(.system-filter-form .el-input),
.system-page-layout :deep(.system-filter-form .el-select),
.system-page-layout :deep(.system-filter-form .el-date-editor) {
  width: 100%;
}

.system-page-layout :deep(.system-filter-form .el-input__wrapper),
.system-page-layout :deep(.system-filter-form .el-select__wrapper),
.system-page-layout :deep(.system-filter-form .el-date-editor.el-input__wrapper) {
  min-height: 36px;
  height: 36px;
  border-radius: 8px;
  box-shadow: 0 0 0 1px #ebe5da inset;
}

.system-page-layout :deep(.system-filter-form .el-range-editor.el-input__wrapper) {
  padding-left: 11px;
  padding-right: 11px;
}

.system-page-layout :deep(.system-filter-form .el-input__inner) {
  height: 36px;
  font-size: 13px;
}

.system-page-layout :deep(.system-filter-grid) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--system-grid-min, 220px), 1fr));
  column-gap: 16px;
  row-gap: 12px;
  align-items: start;
}

.system-page-layout :deep(.system-filter-span-2) {
  grid-column: span 2;
}

.system-page-layout :deep(.system-filter-actions) {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 30px;
}

.system-page-layout :deep(.system-ghost-button),
.system-page-layout :deep(.system-query-button) {
  min-width: 72px;
  height: 36px;
  border-radius: 8px;
  font-size: 13px;
  padding: 0 14px;
}

.system-page-layout :deep(.system-ghost-button) {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
  background: #fff;
}

.system-page-layout :deep(.system-query-button) {
  --el-button-bg-color: var(--el-color-primary);
  --el-button-border-color: var(--el-color-primary);
  --el-button-hover-bg-color: var(--el-color-primary);
  --el-button-hover-border-color: var(--el-color-primary);
  --el-button-active-bg-color: var(--el-color-primary);
  --el-button-active-border-color: var(--el-color-primary);
}

.system-page-layout :deep(.system-toolbar-row) {
  margin-bottom: 14px;
}

.system-page-layout :deep(.system-toolbar-row .right-toolbar) {
  margin-left: auto;
}

.system-page-layout :deep(.system-table-wrap) {
  width: 100%;
  overflow-x: auto;
  margin-bottom: 8px;
}

.system-page-layout :deep(.system-data-table) {
  width: 100%;
}

.system-page-layout :deep(.system-data-table .el-table__inner-wrapper::before) {
  height: 0;
}

.system-page-layout :deep(.system-data-table .el-table__header-wrapper th) {
  background: #fcfaf6;
  color: #5a5567;
  font-weight: 600;
}

.system-page-layout :deep(.system-data-table .el-table__row td) {
  padding: 12px 0;
}

@media (max-width: 768px) {
  .panel-heading {
    flex-direction: column;
    align-items: stretch;
  }

  .system-page-layout :deep(.system-filter-span-2) {
    grid-column: span 1;
  }

  .system-page-layout :deep(.system-filter-actions) {
    justify-content: flex-start;
    padding-top: 0;
  }

  .system-page-layout :deep(.system-toolbar-row .right-toolbar) {
    margin-left: 0;
  }
}
</style>
