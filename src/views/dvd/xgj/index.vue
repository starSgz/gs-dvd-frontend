<template>
  <div ref="screenStageRef" class="screen-stage">
    <div class="screen-stage__viewport" :style="screenScaleStyle">
      <div class="dashboard-container">
        <header class="dashboard-header">
          <svg class="header-svg-canvas" viewBox="0 0 1920 110" preserveAspectRatio="none">
            <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:transparent" />
                    <stop offset="35%" style="stop-color:var(--xy-yellow);stop-opacity:0.2" />
                    <stop offset="50%" style="stop-color:var(--xy-yellow);stop-opacity:1" />
                    <stop offset="65%" style="stop-color:var(--xy-yellow);stop-opacity:0.2" />
                    <stop offset="100%" style="stop-color:transparent" />
                </linearGradient>
            </defs>
        
            <!-- 主线框：两侧平稳过渡，中部下沉包裹标题 -->
            <path d="M 0 8 
                     L 430 8
                     C 515 8, 562 22, 618 50
                     L 694 89
                     C 715 99, 737 104, 760 104
                     L 1160 104
                     C 1183 104, 1205 99, 1226 89
                     L 1302 50
                     C 1358 22, 1405 8, 1490 8
                     L 1920 8" 
                  stroke="url(#lineGrad)" 
                 stroke-width="2.5"
                 stroke-linejoin="round"
                 stroke-linecap="round"
                  fill="none" />
            
            <!-- 阴影辅助线：贴近主线，增强层次 -->
            <path d="M 82 18
                     L 458 18
                     C 536 18, 581 31, 635 57
                     L 704 89
                     C 721 97, 740 101, 760 101
                     L 1160 101
                     C 1180 101, 1199 97, 1216 89
                     L 1285 57
                     C 1339 31, 1384 18, 1462 18
                     L 1838 18" 
                  stroke="rgba(255,218,0,0.1)" 
                  stroke-width="1" 
                 stroke-linejoin="round"
                 stroke-linecap="round"
                  fill="none" />

            <!-- 中央压边线：让标题区域更像独立载体 -->
            <path d="M 752 103 L 782 84 L 1138 84 L 1168 103"
                 stroke="rgba(255,218,0,0.28)"
                 stroke-width="1.2"
                 stroke-linejoin="round"
                 stroke-linecap="round"
                 fill="none" />
        </svg>


          <div class="title-wrapper">
            <div class="header-kicker">XIAN YU OPERATIONS COMMAND CENTER</div>
            <h1 class="main-title">
              <span class="main-title-icon">X</span>
              闲鱼实时经营分析大屏
            </h1>
            <!-- <div class="header-subtitle">XGJ CHANNEL 路 {{ currentDateText }} 路 {{ currentTimeText }}</div> -->
          </div>

          <div class="header-controls">
            <div class="store-select-wrapper">
              <el-select
                v-model="selectedShop"
                placeholder="筛选店铺"
                size="small"
                clearable
                @change="handleHeaderStoreChange"
              >
                <el-option
                  v-for="option in shopOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </div>

            <div class="screenfull-wrapper">
              <screenfull @change="setImmersiveMode" />
            </div>
          </div>
        </header>

        <main class="dashboard-main">
          <section class="left-column">
            <article class="panel mobile-panel">
              <div class="section-title">经营核心指标</div>
              <div class="mobile-metric-stack">
                <div
                  v-for="metric in overviewMetrics"
                  :key="metric.label"
                  class="mobile-metric-card"
                >
                  <div class="mobile-metric-head">
                    <span class="mobile-metric-icon">{{ metric.symbol }}</span>
                    <span>{{ metric.label }}</span>
                  </div>
                  <div class="mobile-metric-value" :class="{ 'with-unit': Boolean(metric.unit) }">
                    <span v-if="metric.unit" class="mobile-metric-unit">{{ metric.unit }}</span>
                    <span>{{ metric.value }}</span>
                  </div>
                  <div class="mobile-metric-compare">
                    <span class="mobile-metric-prev">{{ metric.previous }}</span>
                    <span class="mobile-metric-divider">|</span>
                    <span :class="metric.trend === 'up' ? 'metric-up' : 'metric-down'">
                      {{ metric.trend === 'up' ? '↑' : '↓' }}{{ metric.rate }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="mobile-trend-card">
                <div class="mobile-trend-head">
                  <div class="mobile-trend-title">支付订单数走势</div>
                  <div class="mobile-trend-note">当日 0-23 点支付订单趋势</div>
                </div>
                <div ref="payOrderTrendChartRef" class="mobile-trend-chart"></div>
              </div>
            </article>

            <article class="panel mobile-panel stacked-panel project-mode-panel">
              <!-- <div class="stacked-panel-layers" aria-hidden="true"></div> -->
              <div class="section-title">专项项目监控</div>
              <div class="mobile-metric-stack">
                <div class="mobile-metric-card highlight project-mode-card">
                  <div class="mobile-metric-head">
                    <span class="mobile-metric-icon">专</span>
                    <span>{{ projectMetric.label }}</span>
                  </div>
                  <div class="mobile-metric-value project-mode-value">{{ projectMetric.value }}</div>
                  <div class="mobile-metric-compare">
                    <span class="mobile-metric-prev">{{ projectMetric.previous }}</span>
                    <span class="mobile-metric-divider">|</span>
                    <span :class="projectMetric.trend === 'up' ? 'metric-up' : 'metric-down'">
                      {{ projectMetric.trend === 'up' ? '↑' : '↓' }}{{ projectMetric.rate }}
                    </span>
                  </div>
                  <div class="project-mode-note">{{ projectMetric.note }}</div>
                </div>
              </div>
            </article>
          </section>

          <section class="center-column">
            <article class="panel overview-panel workflow-panel">
              <div class="panel-title">订单流转概览</div>
              <div class="workflow-board">
                <svg class="workflow-svg" viewBox="0 0 760 170" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <marker
                      id="workflowArrow"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="5"
                      markerHeight="5"
                      orient="auto-start-reverse"
                    >
                      <path d="M0 0L10 5L0 10Z" fill="#ffda00" />
                    </marker>
                  </defs>
                  <path d="M140 42 H188" class="workflow-link" marker-end="url(#workflowArrow)" />
                  <path d="M330 42 H378" class="workflow-link" marker-end="url(#workflowArrow)" />
                  <path d="M520 42 H568" class="workflow-link" marker-end="url(#workflowArrow)" />
                  <path d="M640 72 V120 H575" class="workflow-link" marker-end="url(#workflowArrow)" />
                </svg>

                <div
                  v-for="node in workflowNodes"
                  :key="node.label"
                  class="workflow-node"
                  :class="{ 'workflow-node--accent': node.accent }"
                  :style="{ left: node.left, top: node.top, width: node.width || '140px' }"
                >
                  <div class="workflow-node-head">
                    <span class="workflow-node-icon">{{ node.icon }}</span>
                    <span>{{ node.label }}</span>
                  </div>
                  <div class="workflow-node-count">{{ node.count }}</div>
                  <div class="workflow-node-value">| {{ node.amount }}</div>
                </div>
              </div>
            </article>

            <article class="panel overview-panel rights-panel">
              <div class="panel-title">维权监控分析</div>
              <div class="chart-monitor-panel">
                <div class="chart-monitor-block chart-monitor-block--top">
                  <div class="chart-block-head">
                      <div class="chart-block-title">店铺维权量对比</div>
                  </div>
                  <div ref="rightsBarChartRef" class="chart-canvas chart-canvas--bar"></div>
                </div>

                <div class="chart-monitor-block chart-monitor-block--bottom">
                  <div class="chart-block-head">
                    <div class="chart-block-title">维权趋势走势</div>
                    <div class="chart-filter-row">
                      <select v-model="selectedShop" class="chart-filter" @change="handleRightsFilterChange">
                        <option
                          v-for="option in shopOptions"
                          :key="option.value"
                          :value="option.value"
                        >
                          {{ option.label }}
                        </option>
                      </select>
                      <input
                        v-model="selectedDate"
                        class="chart-filter"
                        type="date"
                        :min="availableDates[0]"
                        :max="availableDates[availableDates.length - 1]"
                        @change="handleRightsFilterChange"
                      />
                    </div>
                  </div>
                  <div ref="rightsLineChartRef" class="chart-canvas chart-canvas--line"></div>
                </div>
              </div>
            </article>
          </section>

          <section class="right-column">
            <article class="panel insight-panel distribution-panel">
              <div class="panel-title">商品状态分布</div>
              <div class="distribution-layout">
                <div class="donut-wrap">
                  <div ref="pieChartRef" class="donut-chart"></div>
                  <div class="donut-center">
                    <div class="donut-center-label">全部商品</div>
                    <div class="donut-center-value">{{ totalProducts }}件</div>
                  </div>
                </div>

                <div class="distribution-legend">
                  <div
                    v-for="item in productDistribution"
                    :key="item.name"
                    class="distribution-item"
                  >
                    <span class="distribution-dot" :style="{ backgroundColor: item.color, color: item.color }"></span>
                    <span class="distribution-text">
                      <strong>{{ item.name }}:</strong>
                      {{ item.percent }} ({{ item.value }}件)
                    </span>
                  </div>
                </div>
              </div>
            </article>

            <article class="panel insight-panel risk-insight-panel">
              <div class="panel-title">售后预警与监控</div>
              <div class="risk-card-wrapper">
                <div class="risk-number-new">{{ riskMetric.value }}</div>
                <div class="risk-label-new">
                  <span class="risk-icon-new">!</span>
                  <span>{{ riskMetric.label }}</span>
                </div>
                <div class="risk-trend-new">{{ riskMetric.trend }}</div>
              </div>
            </article>

            <article class="panel insight-panel ranking-panel">
              <div class="panel-title ranking-panel-title">
                <span>Top 店铺</span>
                <div class="ranking-sort-switch">
                  <button
                    type="button"
                    class="ranking-sort-button"
                    :class="{ 'is-active': selectedRankingSort === 'amount' }"
                    @click="handleRankingSortChange('amount')"
                  >
                    今日支付金额
                  </button>
                  <button
                    type="button"
                    class="ranking-sort-button"
                    :class="{ 'is-active': selectedRankingSort === 'orders' }"
                    @click="handleRankingSortChange('orders')"
                  >
                    今日支付订单
                  </button>
                </div>
              </div>
              <div class="ranking-list">
                <div v-if="!rankingList.length" class="ranking-empty">暂无店铺数据</div>
                <div
                  v-for="(item, index) in rankingList"
                  :key="item.storeId || item.name || index"
                  class="ranking-row"
                >
                  <span class="ranking-badge" :class="rankBadgeClass(index)">
                    {{ index + 1 }}
                  </span>
                  <div class="ranking-content">
                    <div class="ranking-name">{{ item.name }}</div>
                    <div class="ranking-meta">
                      <span>今日支付金额：{{ formatRankingAmount(item.payAmountToday) }}</span>
                      <span>今日支付订单：{{ item.payOrderNumToday }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </section>
        </main>

        <!-- <footer class="dashboard-footer">
          <span>Channel: XGJ_REALTIME_01</span>
          <span>漏 2026 XIANYU DATA OPERATIONS CENTER</span>
          <span>Build: v1.0.0-screen</span>
        </footer> -->
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { markRaw } from 'vue'
import Screenfull from '@/components/Screenfull'
import { getXgjOrderRiskSummary, getXgjOverviewMetrics, getXgjPayOrderTrend, getXgjProductStatusDistribution, getXgjStoreList, getXgjTopStoreRanking } from '@/api/dvd'

const SCREEN_DESIGN_WIDTH = 1920
const SCREEN_DESIGN_HEIGHT = 1080

const OVERVIEW_METRICS = [
  { label: '支付金额', symbol: '¥', unit: '¥', value: '0.00', previous: '昨日: ¥0.00', trend: 'flat', rate: '0%' },
  { label: '支付订单数', symbol: '单', value: '0', previous: '昨日: 0', trend: 'flat', rate: '0%' },
  { label: '支付客单价', symbol: '均', unit: '¥', value: '0.00', previous: '昨日: ¥0.00', trend: 'flat', rate: '0%' },
  { label: '新发布商品', symbol: '新', value: '0', previous: '昨日: 0', trend: 'flat', rate: '0%' }
]

const createEmptyPayOrderTrend = () => ({
  labels: Array.from({ length: 24 }, (_item, hour) => `${String(hour).padStart(2, '0')}:00`),
  values: Array.from({ length: 24 }, () => 0)
})

const PROJECT_METRIC = {
  label: '项目进行中',
  value: '95',
  previous: '昨日: 105',
  trend: 'down',
  rate: '9.5%',
  note: '重点项目仍在推进，处理效率保持稳定。'
}

const RIGHTS_SHOP_DATA = [
  { name: '店铺A', count: 18 },
  { name: '店铺B', count: 14 },
  { name: '店铺C', count: 11 },
  { name: '店铺D', count: 9 },
  { name: '店铺E', count: 7 }
]

const RIGHTS_TREND_DATA = {
  '2026-03-30': {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    series: {
      all: [6, 9, 13, 11, 15, 18],
      店铺A: [2, 3, 5, 4, 6, 7],
      店铺B: [1, 2, 3, 3, 4, 5],
      店铺C: [1, 1, 2, 2, 3, 3],
      店铺D: [1, 1, 2, 2, 2, 3],
      店铺E: [1, 2, 1, 1, 2, 2]
    }
  },
  '2026-03-31': {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    series: {
      all: [7, 10, 12, 14, 16, 21],
      店铺A: [2, 4, 4, 5, 6, 8],
      店铺B: [2, 2, 3, 4, 4, 5],
      店铺C: [1, 2, 2, 2, 3, 4],
      店铺D: [1, 2, 3, 3, 3, 4],
      店铺E: [1, 1, 1, 2, 2, 3]
    }
  },
  '2026-04-01': {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    series: {
      all: [8, 12, 15, 14, 19, 24],
      店铺A: [3, 4, 6, 5, 7, 9],
      店铺B: [2, 3, 4, 4, 5, 6],
      店铺C: [1, 2, 2, 3, 3, 4],
      店铺D: [1, 2, 3, 2, 4, 5],
      店铺E: [1, 1, 2, 2, 3, 3]
    }
  }
}

const AVAILABLE_DATES = Object.keys(RIGHTS_TREND_DATA).sort()

const PRODUCT_DISTRIBUTION = [
  { name: '销售中', value: 312, percent: '60%', color: '#ffd53f' },
  { name: '售出下架', value: 130, percent: '25%', color: '#f3edd8' },
  { name: '拍卖中', value: 52, percent: '10%', color: '#89d9db' },
  { name: '处理中', value: 26, percent: '5%', color: '#3d6f77' }
]

const PRODUCT_STATUS_META = [
  { key: 'waitPublishNum', name: '\u5f85\u53d1\u5e03', color: '#ffd53f' },
  { key: 'sellingNum', name: '\u9500\u552e\u4e2d', color: '#f3edd8' },
  { key: 'auctioningNum', name: '\u62cd\u5356\u4e2d', color: '#89d9db' },
  { key: 'onSaleStockNum', name: '\u5728\u552e\u5e93\u5b58\u6570', color: '#4cb7ff' },
  { key: 'soldOffShelfNum', name: '\u552e\u51fa\u4e0b\u67b6', color: '#5a8dee' },
  { key: 'auctionOffShelfNum', name: '\u62cd\u5356\u4e0b\u67b6', color: '#6f7bf7' },
  { key: 'afterSaleRestoreNum', name: '\u552e\u540e\u5f85\u6062\u590d', color: '#ff9b6b' },
  { key: 'processingNum', name: '\u5904\u7406\u4e2d', color: '#3d6f77' }
]

const formatDistributionPercent = (value, total) => {
  if (!total) return '0%'
  const percent = (value / total) * 100
  const precision = percent >= 10 ? 0 : 1
  return `${percent.toFixed(precision).replace(/\.0$/, '')}%`
}

const createEmptyProductDistribution = () =>
  PRODUCT_STATUS_META.map(item => ({
    ...item,
    value: 0,
    percent: '0%'
  }))

const buildProductDistributionFromStats = (stats = []) => {
  const valueMap = stats.reduce((accumulator, item) => {
    if (!item || !item.key) return accumulator
    accumulator[item.key] = Number(item.value || 0)
    return accumulator
  }, {})

  const total = PRODUCT_STATUS_META.reduce((sum, item) => sum + Math.round(valueMap[item.key] || 0), 0)

  return PRODUCT_STATUS_META.map(item => {
    const value = Math.round(valueMap[item.key] || 0)
    return {
      ...item,
      value,
      percent: formatDistributionPercent(value, total)
    }
  })
}

const WORKFLOW_NODES = [
  { label: '线索发现', icon: '线', count: 50, amount: '¥25k', left: '0px', top: '0px' },
  { label: '咨询沟通', icon: '询', count: 300, amount: '¥150k', left: '190px', top: '0px', accent: true },
  { label: '下单支付', icon: '单', count: 800, amount: '¥400k', left: '380px', top: '0px', accent: true },
  { label: '发货签收', icon: '货', count: 700, amount: '¥350k', left: '570px', top: '0px' },
  { label: '交易关闭/退款', icon: '退', count: 100, amount: '¥50k', left: '500px', top: '92px', width: '152px', accent: true }
]

const RISK_METRIC = {
  value: '0%',
  label: '预警指数',
  trend: '交易关闭数量/所有订单数量'
}

const formatRankingAmount = value => `¥${Number(value || 0).toLocaleString('zh-CN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})}`

const formatWarningIndex = (closedOrderNum, allOrderNum) => {
  const closed = Number(closedOrderNum || 0)
  const total = Number(allOrderNum || 0)
  if (!total) return '0%'
  return `${((closed / total) * 100).toFixed(2).replace(/\.?0+$/, '')}%`
}

export default {
  name: 'DvdXgjDashboard',
  components: { Screenfull },
  beforeCreate() {
    this.payOrderTrendInstance = null
    this.rightsBarInstance = null
    this.rightsLineInstance = null
    this.pieInstance = null
  },
  data() {
    return {
      currentDateText: '',
      currentTimeText: '',
      screenScale: 1,
      viewportWidth: SCREEN_DESIGN_WIDTH,
      viewportHeight: SCREEN_DESIGN_HEIGHT,
        isImmersiveMode: false,
        clockTimer: null,
        resizeObserver: null,
        resizeTimeout: null,
        selectedShop: 'all',
        selectedRankingSort: 'amount',
        selectedDate: AVAILABLE_DATES[AVAILABLE_DATES.length - 1],
        storeList: [],
        overviewMetrics: OVERVIEW_METRICS,
        payOrderTrend: createEmptyPayOrderTrend(),
      projectMetric: PROJECT_METRIC,
      rightsShopData: RIGHTS_SHOP_DATA,
      productDistribution: createEmptyProductDistribution(),
        workflowNodes: WORKFLOW_NODES,
        rankingList: [],
        riskMetric: RISK_METRIC,
        availableDates: AVAILABLE_DATES
      }
  },
  computed: {
    screenScaleStyle() {
      return {
        width: `${this.viewportWidth}px`,
        height: `${this.viewportHeight}px`,
        transform: `scale(${this.screenScale})`
      }
    },
    shopOptions() {
      return [{ label: '全部店铺', value: 'all' }].concat(
        this.storeList.map(item => ({ label: item.storeName, value: item.storeName }))
      )
    },
    currentTrendPayload() {
      const fallbackDate = this.availableDates.includes(this.selectedDate)
        ? this.selectedDate
        : this.availableDates[this.availableDates.length - 1]
      const current = RIGHTS_TREND_DATA[fallbackDate]
      const seriesName = this.selectedShop !== 'all' && current.series[this.selectedShop]
        ? this.selectedShop
        : 'all'

      return {
        labels: current.labels,
        seriesName: seriesName === 'all' ? '全部店铺' : seriesName,
        values: current.series[seriesName]
      }
    },
    totalProducts() {
      return this.productDistribution.reduce((total, item) => total + item.value, 0)
    }
  },
  mounted() {
      this.updateTime()
      this.clockTimer = setInterval(this.updateTime, 1000)
      this.fetchStoreList()
      this.fetchOverviewMetrics()
      this.fetchPayOrderTrend()
      this.fetchProductStatusDistribution()
      this.fetchTopStoreRanking()
      this.fetchOrderRiskSummary()
      this.$nextTick(() => {
        this.initCharts()
        this.handleResize()
      this.initResizeObserver()
    })
    window.addEventListener('resize', this.handleResize)
    document.addEventListener('dblclick', this.handleDoubleClick)
    document.addEventListener('keydown', this.handleEscapeKey)
  },
  beforeUnmount() {
    if (this.clockTimer) clearInterval(this.clockTimer)
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout)
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
    window.removeEventListener('resize', this.handleResize)
    document.removeEventListener('dblclick', this.handleDoubleClick)
    document.removeEventListener('keydown', this.handleEscapeKey)
    document.body.classList.remove('xgj-immersive-mode')
    this.disposeCharts()
  },
  methods: {
    async fetchStoreList() {
      try {
        const res = await getXgjStoreList()
        this.storeList = res.data || []
      } catch (e) {
        console.error('获取闲鱼店铺列表失败', e)
      }
    },
    getProductStatusQuery() {
      if (this.selectedShop && this.selectedShop !== 'all') {
        return { store_name: this.selectedShop }
      }
      return {}
    },
    async fetchOverviewMetrics() {
      try {
        const res = await getXgjOverviewMetrics(this.getProductStatusQuery())
        this.overviewMetrics = res.data?.metrics || OVERVIEW_METRICS
      } catch (e) {
        console.error('获取闲鱼经营核心指标失败', e)
        this.overviewMetrics = OVERVIEW_METRICS
      }
    },
    async fetchPayOrderTrend() {
      try {
        const res = await getXgjPayOrderTrend(this.getProductStatusQuery())
        this.payOrderTrend = {
          labels: res.data?.labels || createEmptyPayOrderTrend().labels,
          values: res.data?.values || createEmptyPayOrderTrend().values
        }
      } catch (e) {
        console.error('获取闲鱼支付订单数小时走势图失败', e)
        this.payOrderTrend = createEmptyPayOrderTrend()
      }

      this.$nextTick(() => {
        this.renderPayOrderTrendChart()
      })
    },
    async fetchProductStatusDistribution() {
      try {
        const res = await getXgjProductStatusDistribution(this.getProductStatusQuery())
        this.productDistribution = buildProductDistributionFromStats(res.data?.stats || [])
      } catch (e) {
        console.error('获取闲鱼商品状态分布失败', e)
        this.productDistribution = createEmptyProductDistribution()
      }

      this.$nextTick(() => {
        this.renderPieChart()
      })
    },
    async fetchTopStoreRanking() {
      try {
        const res = await getXgjTopStoreRanking({
          ...this.getProductStatusQuery(),
          sort_by: this.selectedRankingSort,
          limit: 100
        })
        this.rankingList = res.data?.items || []
      } catch (e) {
        console.error('获取闲鱼Top店铺排行失败', e)
        this.rankingList = []
      }
    },
    async fetchOrderRiskSummary() {
      try {
        const res = await getXgjOrderRiskSummary(this.getProductStatusQuery())
        const data = res.data || {}
        const allOrderNum = Number(data.allOrderNum || 0)
        const closedOrderNum = Number(data.closedOrderNum || 0)
        this.riskMetric = {
          value: formatWarningIndex(closedOrderNum, allOrderNum),
          label: '预警指数',
          trend: `交易关闭数量/所有订单数量`
        }
      } catch (e) {
        console.error('获取闲鱼售后预警与监控摘要失败', e)
        this.riskMetric = { ...RISK_METRIC }
      }
    },
    formatRankingAmount,
    updateTime() {
      const now = new Date()
      this.currentDateText = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`
      this.currentTimeText = now.toLocaleTimeString('zh-CN', { hour12: false })
    },
    handleDoubleClick() {
      this.setImmersiveMode(!this.isImmersiveMode)
    },
    async handleEscapeKey(event) {
      if (event.key !== 'Escape' && event.key !== 'Esc') return

      if (document.fullscreenElement && document.exitFullscreen) {
        try {
          await document.exitFullscreen()
        } catch (error) {
          // Ignore fullscreen exit failures and still restore immersive mode.
        }
      }

      if (this.isImmersiveMode) {
        this.setImmersiveMode(false)
      }
    },
    setImmersiveMode(enabled) {
      this.isImmersiveMode = enabled
      document.body.classList.toggle('xgj-immersive-mode', enabled)
      requestAnimationFrame(() => {
        this.updateScreenScale()
        this.handleResize()
      })
    },
    updateScreenScale() {
      const container = this.$refs.screenStageRef
      if (!container) return
      const { clientWidth, clientHeight } = container
      if (!clientWidth || !clientHeight) return
      const widthScale = clientWidth / SCREEN_DESIGN_WIDTH
      const heightScale = clientHeight / SCREEN_DESIGN_HEIGHT
      this.screenScale = Math.min(widthScale, heightScale)

      this.viewportHeight = SCREEN_DESIGN_HEIGHT
      this.viewportWidth = SCREEN_DESIGN_WIDTH

      if (widthScale > heightScale) {
        this.viewportWidth = Math.round(clientWidth / this.screenScale)
      }
    },
    initResizeObserver() {
      if (typeof ResizeObserver === 'undefined') return
      this.resizeObserver = new ResizeObserver(() => {
        if (this.resizeTimeout) clearTimeout(this.resizeTimeout)
        this.resizeTimeout = setTimeout(() => {
          this.handleResize()
        }, 100)
      })
      const container = this.$refs.screenStageRef
      if (container) this.resizeObserver.observe(container)
    },
    handleResize() {
      this.updateScreenScale()
      ;['payOrderTrendInstance', 'rightsBarInstance', 'rightsLineInstance', 'pieInstance'].forEach(name => {
        if (this[name]) this[name].resize()
      })
    },
    handleHeaderStoreChange(value) {
      this.selectedShop = value || 'all'
      this.handleRightsFilterChange()
    },
    handleRightsFilterChange() {
      if (!this.selectedShop) {
        this.selectedShop = 'all'
      }
      this.fetchOverviewMetrics()
      this.fetchPayOrderTrend()
      this.fetchProductStatusDistribution()
      this.fetchTopStoreRanking()
      this.fetchOrderRiskSummary()
      this.renderRightsLineChart()
    },
    handleRankingSortChange(sortBy) {
      if (this.selectedRankingSort === sortBy) return
      this.selectedRankingSort = sortBy
      this.fetchTopStoreRanking()
    },
    rankBadgeClass(index) {
      if (index === 0) return 'gold'
      if (index === 1) return 'silver'
      if (index === 2) return 'bronze'
      return 'rank-number'
    },
    disposeCharts() {
      ;['payOrderTrendInstance', 'rightsBarInstance', 'rightsLineInstance', 'pieInstance'].forEach(name => {
        if (this[name]) {
          this[name].dispose()
          this[name] = null
        }
      })
    },
    initCharts() {
      this.initPayOrderTrendChart()
      this.initRightsBarChart()
      this.initRightsLineChart()
      this.initPieChart()
    },
    initPayOrderTrendChart() {
      const chartDom = this.$refs.payOrderTrendChartRef
      if (!chartDom) return
      if (this.payOrderTrendInstance) this.payOrderTrendInstance.dispose()
      this.payOrderTrendInstance = markRaw(echarts.init(chartDom))
      this.renderPayOrderTrendChart()
    },
    renderPayOrderTrendChart() {
      if (!this.payOrderTrendInstance) return
      this.payOrderTrendInstance.setOption({
        backgroundColor: 'transparent',
        grid: { left: 24, right: 12, top: 10, bottom: 22 },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(8, 18, 38, 0.95)',
          borderColor: 'rgba(245, 199, 103, 0.25)',
          textStyle: { color: '#f7f1d2' },
          formatter: params => {
            const current = params?.[0]
            if (!current) return ''
            return `${current.axisValue}<br/>支付订单数：${Number(current.data || 0).toLocaleString('zh-CN')}`
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.payOrderTrend.labels,
          axisLine: { lineStyle: { color: 'rgba(245, 199, 103, 0.2)' } },
          axisTick: { show: false },
          axisLabel: {
            color: '#a9a086',
            fontSize: 10,
            interval: 2
          }
        },
        yAxis: {
          type: 'value',
          splitNumber: 4,
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#a9a086', fontSize: 10 }
        },
        series: [{
          type: 'line',
          smooth: true,
          data: this.payOrderTrend.values,
          symbol: 'circle',
          symbolSize: 5,
          lineStyle: { width: 3, color: '#ffd95d' },
          itemStyle: { color: '#ffd95d', borderColor: '#0b1830', borderWidth: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(255, 217, 93, 0.24)' },
              { offset: 1, color: 'rgba(255, 217, 93, 0.02)' }
            ])
          }
        }]
      })
    },
    initRightsBarChart() {
      const chartDom = this.$refs.rightsBarChartRef
      if (!chartDom) return
      if (this.rightsBarInstance) this.rightsBarInstance.dispose()
      this.rightsBarInstance = markRaw(echarts.init(chartDom))
      this.rightsBarInstance.setOption({
        backgroundColor: 'transparent',
        grid: { left: 38, right: 14, top: 16, bottom: 28 },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: 'rgba(8, 18, 38, 0.95)',
          borderColor: 'rgba(245, 199, 103, 0.25)',
          textStyle: { color: '#f7f1d2' }
        },
        xAxis: {
          type: 'category',
          data: this.rightsShopData.map(item => item.name),
          axisLine: { lineStyle: { color: 'rgba(245, 199, 103, 0.24)' } },
          axisTick: { show: false },
          axisLabel: { color: '#cfc6a5', fontSize: 10, interval: 0 }
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#a9a086', fontSize: 10 }
        },
        series: [{
          type: 'bar',
          data: this.rightsShopData.map(item => item.count),
          barWidth: 18,
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#ffd95d' },
              { offset: 1, color: '#8fd8d8' }
            ])
          }
        }]
      })
    },
    initRightsLineChart() {
      const chartDom = this.$refs.rightsLineChartRef
      if (!chartDom) return
      if (this.rightsLineInstance) this.rightsLineInstance.dispose()
      this.rightsLineInstance = markRaw(echarts.init(chartDom))
      this.renderRightsLineChart()
    },
    renderRightsLineChart() {
      if (!this.rightsLineInstance) return
      const current = this.currentTrendPayload
      this.rightsLineInstance.setOption({
        backgroundColor: 'transparent',
        grid: { left: 34, right: 18, top: 16, bottom: 28 },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(8, 18, 38, 0.95)',
          borderColor: 'rgba(245, 199, 103, 0.25)',
          textStyle: { color: '#f7f1d2' }
        },
        xAxis: {
          type: 'category',
          data: current.labels,
          boundaryGap: false,
          axisLine: { lineStyle: { color: 'rgba(245, 199, 103, 0.24)' } },
          axisTick: { show: false },
          axisLabel: { color: '#cfc6a5', fontSize: 10 }
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#a9a086', fontSize: 10 }
        },
        series: [{
          name: current.seriesName,
          type: 'line',
          smooth: true,
          data: current.values,
          symbol: 'circle',
          symbolSize: 7,
          lineStyle: { width: 3, color: '#ffd95d' },
          itemStyle: { color: '#ffd95d', borderColor: '#0b1830', borderWidth: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(255, 217, 93, 0.28)' },
              { offset: 1, color: 'rgba(255, 217, 93, 0.02)' }
            ])
          }
        }]
      })
    },
    initPieChart() {
      const chartDom = this.$refs.pieChartRef
      if (!chartDom) return
      if (this.pieInstance) this.pieInstance.dispose()
      this.pieInstance = markRaw(echarts.init(chartDom))
      this.renderPieChart()
    },
    renderPieChart() {
      if (!this.pieInstance) return
      this.pieInstance.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          appendToBody: true,
          confine: false,
          backgroundColor: 'rgba(8, 18, 38, 0.95)',
          borderColor: 'rgba(245, 199, 103, 0.25)',
          textStyle: { color: '#f7f1d2' },
          extraCssText: 'z-index: 99999; pointer-events: none;'
        },
        series: [{
          type: 'pie',
          radius: ['58%', '78%'],
          center: ['50%', '50%'],
          itemStyle: { borderRadius: 2, borderColor: '#07142c', borderWidth: 2 },
          label: { show: false },
          emphasis: { scale: false },
          data: this.productDistribution.map(item => ({
            value: item.value,
            name: item.name,
            itemStyle: { color: item.color }
          }))
        }]
      })
    }
  }
}
</script>

<style scoped>
.screen-stage {
  --xy-yellow: #ffda00;
  --xy-bg: #030816;
  --card-border: rgba(255, 218, 0, 0.25);
  
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 50% 0%, rgba(255, 218, 0, 0.16) 0%, transparent 30%),
    linear-gradient(rgba(18, 24, 41, 0.45) 1px, transparent 1px),
    linear-gradient(90deg, rgba(18, 24, 41, 0.45) 1px, transparent 1px),
    #030816;
  background-size: 100% 100%, 35px 35px, 35px 35px, auto;
}

.screen-stage__viewport {
  width: 1920px;
  height: 1080px;
  flex-shrink: 0;
  transform-origin: center center;
  will-change: transform;
}

.dashboard-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 28px 32px 18px;
  color: #fff;
  background:
    radial-gradient(circle at 50% -10%, rgba(255, 218, 0, 0.15) 0%, transparent 40%),
    linear-gradient(rgba(18, 24, 41, 0.5) 1px, transparent 1px),
    linear-gradient(90deg, rgba(18, 24, 41, 0.5) 1px, transparent 1px),
    linear-gradient(180deg, rgba(2, 6, 20, 0.98) 0%, rgba(4, 10, 28, 0.98) 100%);
  background-size: 100% 100%, 35px 35px, 35px 35px, auto;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.dashboard-header {
  position: relative;
  height: 110px;
  flex-shrink: 0;
}

.header-svg-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.header-side {
  position: absolute;
  top: 0;
  left: 0;
  width: 180px;
  height: 100%;
  display: flex;
  align-items: flex-start;
  z-index: 2;
}

.header-side.right {
  left: auto;
  right: 0;
  justify-content: flex-end;
}

.side-hazard-lines {
  position: relative;
  width: 148px;
  height: 14px;
  margin-top: 41px;
  background: repeating-linear-gradient(
    -45deg,
    rgba(255, 218, 0, 0.95) 0,
    rgba(255, 218, 0, 0.95) 9px,
    transparent 9px,
    transparent 13px
  );
  clip-path: polygon(10px 0, 100% 0, calc(100% - 12px) 100%, 0 100%);
  border-top: 1px solid rgba(255, 218, 0, 0.65);
  border-bottom: 1px solid rgba(255, 218, 0, 0.28);
  box-shadow:
    0 0 12px rgba(255, 218, 0, 0.22),
    inset 0 0 12px rgba(255, 218, 0, 0.08);
}

.side-hazard-lines::before,
.side-hazard-lines::after {
  content: '';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.side-hazard-lines::before {
  left: -28px;
  width: 34px;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 218, 0, 0.85) 100%);
  box-shadow: 0 0 10px rgba(255, 218, 0, 0.3);
}

.side-hazard-lines::after {
  left: -36px;
  width: 8px;
  height: 8px;
  border: 1px solid rgba(255, 218, 0, 0.85);
  background: rgba(255, 218, 0, 0.18);
  box-shadow: 0 0 10px rgba(255, 218, 0, 0.35);
}

.header-side.right .side-hazard-lines {
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 100%, 12px 100%);
}

.header-side.right .side-hazard-lines::before {
  left: auto;
  right: -28px;
  background: linear-gradient(90deg, rgba(255, 218, 0, 0.85) 0%, transparent 100%);
}

.header-side.right .side-hazard-lines::after {
  left: auto;
  right: -36px;
}

.title-wrapper {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-kicker {
  color: rgba(255, 218, 0, 0.72);
  font-size: 12px;
  letter-spacing: 0.48em;
  text-transform: uppercase;
}

.main-title {
  position: relative;
  margin: 8px 0 6px;
  padding-left: 8px;
  font-size: 40px;
  font-weight: 900;
  letter-spacing: 8px;
  background: linear-gradient(180deg, #fff 30%, #ffda00 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 15px rgba(255, 218, 0, 0.4));
}

.main-title-icon {
  position: absolute;
  left: -45px;
  top: 1px;
  font-size: 36px;
  -webkit-text-fill-color: initial;
}

.header-subtitle {
  color: rgba(242, 231, 187, 0.86);
  font-size: 13px;
  letter-spacing: 0.22em;
}

.header-controls {
  position: absolute;
  top: 14px;
  right: 0;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 10px;
}

.store-select-wrapper {
  width: 170px;
}

.store-select-wrapper :deep(.el-select) {
  width: 100%;
}

.store-select-wrapper :deep(.el-input__wrapper) {
  background: rgba(8, 18, 38, 0.9) !important;
  border: 1px solid rgba(245, 199, 103, 0.28) !important;
  box-shadow: none !important;
}

.store-select-wrapper :deep(.el-input__wrapper:hover) {
  border-color: rgba(255, 218, 0, 0.56) !important;
}

.store-select-wrapper :deep(.el-input__inner) {
  color: #f7efcb !important;
  font-size: 12px;
}

.store-select-wrapper :deep(.el-input__inner::placeholder) {
  color: rgba(247, 239, 203, 0.48) !important;
}

.store-select-wrapper :deep(.el-select__caret) {
  color: #ffda00 !important;
}

.header-chip {
  padding: 6px 12px;
  border: 1px solid rgba(255, 218, 0, 0.35);
  border-radius: 999px;
  background: rgba(255, 218, 0, 0.08);
  color: #ffda00;
  font-size: 12px;
  letter-spacing: 0.12em;
}

.header-chip--muted {
  color: #f0e8bc;
  border-color: rgba(240, 232, 188, 0.2);
  background: rgba(240, 232, 188, 0.06);
}

.screenfull-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  min-height: 34px;
  padding: 6px;
  border: 1px solid rgba(255, 218, 0, 0.3);
  border-radius: 10px;
  background: rgba(255, 218, 0, 0.08);
  transition: all 0.3s ease;
}

.screenfull-wrapper:hover {
  border-color: rgba(255, 218, 0, 0.56);
  box-shadow: 0 0 14px rgba(255, 218, 0, 0.18);
}

.screenfull-wrapper :deep(svg) {
  width: 16px;
  height: 16px;
  fill: #ffda00 !important;
  color: #ffda00 !important;
}

.dashboard-main {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 372px minmax(0, 1fr) 348px;
  gap: 18px;
  margin-top: 8px;
}

.left-column,
.center-column,
.right-column {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.left-column {
  display: grid;
  grid-template-rows: minmax(0, 1.4fr) 210px;
}

.center-column {
  display: grid;
  grid-template-rows: 260px minmax(0, 1fr);
}

.right-column {
  display: grid;
  grid-template-rows: 250px 180px minmax(0, 1fr);
}

.panel {
  position: relative;
  overflow: hidden;
  min-height: 0;
}

.mobile-panel,
.overview-panel,
.insight-panel {
  background: linear-gradient(180deg, rgba(8, 22, 46, 0.96) 0%, rgba(3, 13, 33, 0.98) 100%);
  border: 1px solid rgba(245, 199, 103, 0.22);
  border-radius: 16px;
  box-shadow:
    inset 0 0 0 1px rgba(255, 215, 0, 0.04),
    inset 0 1px 18px rgba(255, 215, 0, 0.06),
    0 10px 28px rgba(0, 0, 0, 0.35);
}

.mobile-panel,
.overview-panel,
.insight-panel,
.workflow-panel,
.rights-panel {
  padding: 14px 14px 12px;
}

.mobile-panel::before,
.insight-panel::before,
.overview-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top left, rgba(255, 215, 0, 0.12), transparent 32%),
    radial-gradient(circle at bottom right, rgba(255, 215, 0, 0.08), transparent 30%);
  pointer-events: none;
}

.section-title,
.panel-title {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #f8f2d0;
  font-size: 15px;
  font-weight: 700;
}

.section-title::before,
.panel-title::before {
  content: '';
  width: 4px;
  height: 18px;
  border-radius: 999px;
  background: linear-gradient(180deg, #f8dc79 0%, #c89118 100%);
  box-shadow: 0 0 10px rgba(245, 199, 103, 0.55);
}

.mobile-metric-stack {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-metric-card {
  background: linear-gradient(180deg, rgba(63, 49, 11, 0.5) 0%, rgba(38, 31, 10, 0.22) 100%);
  border: 1px solid rgba(245, 199, 103, 0.42);
  border-radius: 14px;
  padding: 12px 14px;
  box-shadow:
    inset 0 0 18px rgba(255, 215, 0, 0.12),
    inset 0 1px 0 rgba(255, 245, 197, 0.2),
    0 0 10px rgba(245, 199, 103, 0.18);
}

.mobile-metric-card.highlight,
.project-mode-card {
  background: linear-gradient(180deg, rgba(117, 87, 12, 0.52) 0%, rgba(78, 58, 12, 0.3) 100%);
}

.mobile-metric-head {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff7d6;
  font-size: 14px;
  font-weight: 600;
}

.mobile-metric-icon {
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(255, 226, 133, 0.18) 0%, rgba(255, 215, 0, 0.08) 100%);
  color: #f5c767;
  font-size: 13px;
  font-weight: 700;
}

.mobile-metric-value {
  margin-top: 8px;
  color: #ffd86d;
  font-family: 'Bahnschrift', 'DIN Alternate', 'Arial Narrow', sans-serif;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: 0.5px;
  text-shadow: 0 0 12px rgba(245, 199, 103, 0.22);
}

.mobile-metric-value.with-unit {
  display: flex;
  align-items: baseline;
  gap: 3px;
}

.mobile-metric-unit {
  font-size: 20px;
}

.mobile-metric-compare {
  margin-top: 7px;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  font-size: 11px;
  line-height: 1.2;
}

.mobile-metric-prev {
  color: #b8b8b8;
}

.mobile-metric-divider {
  color: rgba(255, 255, 255, 0.3);
}

.metric-up {
  color: #ff6b6b;
}

.metric-down {
  color: #70d46c;
}

.mobile-trend-card {
  position: relative;
  z-index: 1;
  margin-top: 14px;
  padding: 12px 12px 10px;
  border-radius: 14px;
  border: 1px solid rgba(245, 199, 103, 0.2);
  background:
    linear-gradient(180deg, rgba(255, 249, 216, 0.04) 0%, transparent 18%),
    linear-gradient(180deg, rgba(12, 24, 46, 0.82) 0%, rgba(7, 18, 36, 0.88) 100%);
}

.mobile-trend-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}

.mobile-trend-title {
  color: #f7efcb;
  font-size: 12px;
  font-weight: 700;
}

.mobile-trend-note {
  color: #a9a086;
  font-size: 10px;
}

.mobile-trend-chart {
  width: 100%;
  height: 128px;
}

.stacked-panel {
  isolation: isolate;
}

.stacked-panel-layers,
.stacked-panel-layers::before,
.stacked-panel-layers::after {
  position: absolute;
  left: 10px;
  right: 10px;
  border-radius: 15px;
  pointer-events: none;
  content: '';
}

.stacked-panel-layers {
  inset: auto 10px -7px;
  height: 22px;
  z-index: 0;
}

.stacked-panel-layers::before {
  bottom: 0;
  height: 14px;
  background: linear-gradient(180deg, rgba(245, 199, 103, 0.16) 0%, rgba(245, 199, 103, 0.05) 100%);
  border: 1px solid rgba(245, 199, 103, 0.18);
}

.stacked-panel-layers::after {
  bottom: -8px;
  left: 16px;
  right: 16px;
  height: 12px;
  background: linear-gradient(180deg, rgba(245, 199, 103, 0.1) 0%, rgba(245, 199, 103, 0.03) 100%);
  border: 1px solid rgba(245, 199, 103, 0.12);
}

.project-mode-card {
  position: relative;
  overflow: hidden;
}

.project-mode-value {
  margin-top: 8px;
  font-size: 46px;
  line-height: 0.95;
  color: #ffe27e;
  text-shadow: 0 0 24px rgba(245, 199, 103, 0.12);
}

.project-mode-note {
  margin-top: 12px;
  color: rgba(242, 231, 187, 0.78);
  font-size: 12px;
  line-height: 1.5;
}

.workflow-board {
  position: relative;
  height: 196px;
}

.workflow-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.workflow-link {
  fill: none;
  stroke: rgba(255, 218, 0, 0.6);
  stroke-width: 2.4;
}

.workflow-node {
  position: absolute;
  padding: 12px 12px 10px;
  border: 1px solid rgba(255, 218, 0, 0.2);
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(9, 23, 48, 0.92) 0%, rgba(6, 17, 39, 0.95) 100%);
  box-shadow:
    inset 0 0 18px rgba(255, 215, 0, 0.04),
    0 10px 24px rgba(0, 0, 0, 0.24);
}

.workflow-node--accent {
  border-color: rgba(255, 218, 0, 0.4);
  box-shadow:
    inset 0 0 22px rgba(255, 215, 0, 0.08),
    0 0 18px rgba(245, 199, 103, 0.1);
}

.workflow-node-head {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f6edcc;
  font-size: 12px;
  font-weight: 600;
}

.workflow-node-icon {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  background: rgba(255, 218, 0, 0.12);
  color: #ffda00;
  font-size: 12px;
  font-weight: 700;
}

.workflow-node-count {
  margin-top: 10px;
  color: #ffe27e;
  font-size: 26px;
  font-weight: 700;
  line-height: 1;
}

.workflow-node-value {
  margin-top: 6px;
  color: rgba(242, 231, 187, 0.72);
  font-size: 12px;
}

.chart-monitor-panel {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-rows: 184px minmax(0, 1fr);
  gap: 14px;
  height: calc(100% - 34px);
}

.chart-monitor-block {
  min-height: 0;
  border-radius: 14px;
  border: 1px solid rgba(245, 199, 103, 0.16);
  background:
    linear-gradient(180deg, rgba(255, 249, 216, 0.04) 0%, transparent 18%),
    linear-gradient(180deg, rgba(12, 24, 46, 0.82) 0%, rgba(7, 18, 36, 0.88) 100%);
  padding: 12px;
}

.chart-block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.chart-block-title {
  color: #f7efcb;
  font-size: 13px;
  font-weight: 700;
}

.chart-filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-filter {
  min-width: 118px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid rgba(245, 199, 103, 0.22);
  border-radius: 8px;
  background: rgba(8, 18, 38, 0.9);
  color: #f7efcb;
  outline: none;
}

.chart-canvas {
  width: 100%;
}

.chart-canvas--bar {
  height: 136px;
}

.chart-canvas--line {
  height: calc(100% - 40px);
  min-height: 220px;
}

.distribution-layout {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
}

.distribution-panel {
  overflow: visible;
  z-index: 3;
}

.donut-wrap {
  position: relative;
  width: 120px;
  height: 120px;
  z-index: 4;
}

.donut-chart {
  width: 100%;
  height: 100%;
}

.donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  pointer-events: none;
}

.donut-center-label {
  color: #f2e7bb;
  font-size: 11px;
}

.donut-center-value {
  color: #ffd95d;
  font-size: 18px;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(245, 199, 103, 0.18);
}

.distribution-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.distribution-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: #e7e0c5;
  font-size: 11px;
  line-height: 1.3;
}

.distribution-dot {
  width: 8px;
  height: 8px;
  margin-top: 4px;
  border-radius: 2px;
  box-shadow: 0 0 8px currentColor;
}

.distribution-text strong {
  color: #ffd95d;
}

.risk-card-wrapper {
  position: relative;
  z-index: 1;
  height: calc(100% - 34px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 18px 20px;
  border-radius: 18px;
  border: 1px solid rgba(255, 118, 118, 0.18);
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 119, 119, 0.18), transparent 35%),
    linear-gradient(180deg, rgba(40, 12, 18, 0.92) 0%, rgba(23, 10, 18, 0.96) 100%);
}

.risk-number-new {
  color: #ff8f8f;
  font-size: 54px;
  font-weight: 800;
  line-height: 1;
  text-shadow: 0 0 20px rgba(255, 97, 97, 0.18);
}

.risk-label-new {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #f7e4dc;
  font-size: 14px;
  font-weight: 600;
}

.risk-icon-new {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 107, 107, 0.14);
  color: #ff7878;
}

.risk-trend-new {
  margin-top: 10px;
  color: #ff9b9b;
  font-size: 12px;
  letter-spacing: 0.08em;
}

.ranking-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.ranking-panel-title {
  justify-content: space-between;
}

.ranking-sort-switch {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ranking-sort-button {
  height: 28px;
  padding: 0 10px;
  border: 1px solid rgba(255, 218, 0, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.03);
  color: rgba(247, 239, 203, 0.78);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ranking-sort-button:hover {
  border-color: rgba(255, 218, 0, 0.42);
  color: #ffda00;
}

.ranking-sort-button.is-active {
  border-color: rgba(255, 218, 0, 0.48);
  background: rgba(255, 218, 0, 0.12);
  color: #ffda00;
  box-shadow: 0 0 10px rgba(255, 218, 0, 0.14);
}

.ranking-list {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 6px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 218, 0, 0.45) transparent;
}

.ranking-list::-webkit-scrollbar {
  width: 6px;
}

.ranking-list::-webkit-scrollbar-track {
  background: transparent;
}

.ranking-list::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(255, 218, 0, 0.45);
}

.ranking-empty {
  padding: 14px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  color: rgba(239, 230, 196, 0.65);
  font-size: 12px;
  text-align: center;
}

.ranking-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  color: #efe6c4;
  font-size: 13px;
}

.ranking-badge {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
}

.gold {
  background: linear-gradient(180deg, #ffd95d 0%, #c8921b 100%);
  color: #362200;
}

.silver {
  background: linear-gradient(180deg, #f0f1f8 0%, #a2adcb 100%);
  color: #1f2640;
}

.bronze {
  background: linear-gradient(180deg, #f0bc8e 0%, #a15a28 100%);
  color: #2f1400;
}

.rank-number {
  background: rgba(255, 218, 0, 0.12);
  color: #ffda00;
}

.ranking-content {
  flex: 1;
  min-width: 0;
}

.ranking-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
}

.ranking-meta {
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  color: rgba(239, 230, 196, 0.78);
  font-size: 11px;
  line-height: 1.4;
}

.ranking-meta span {
  overflow: hidden;
  text-overflow: ellipsis;
}

.dashboard-footer {
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  color: #68708b;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

:deep(.el-select-dropdown) {
  background: linear-gradient(180deg, rgba(8, 22, 46, 0.98) 0%, rgba(3, 13, 33, 0.98) 100%) !important;
  border: 1px solid rgba(245, 199, 103, 0.24) !important;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.38) !important;
}

:deep(.el-select-dropdown__item) {
  color: #f7efcb !important;
}

:deep(.el-select-dropdown__item.hover),
:deep(.el-select-dropdown__item:hover) {
  background: rgba(255, 218, 0, 0.08) !important;
  color: #ffda00 !important;
}

:deep(.el-select-dropdown__item.selected) {
  color: #ffda00 !important;
  font-weight: 700;
}
</style>

<style>
body.xgj-immersive-mode .sidebar-container,
body.xgj-immersive-mode .fixed-header,
body.xgj-immersive-mode .copyright {
  display: none !important;
}

body.xgj-immersive-mode .main-container {
  margin-left: 0 !important;
}

body.xgj-immersive-mode .app-main,
body.xgj-immersive-mode .fixed-header + .app-main {
  margin-top: 0 !important;
  height: 100vh !important;
  min-height: 100vh !important;
  padding: 0 !important;
}

body.xgj-immersive-mode .screen-stage {
  height: 100vh !important;
}

body.xgj-immersive-mode .dashboard-container {
  height: 1080px !important;
}
</style>
