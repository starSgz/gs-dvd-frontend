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
                    <span :class="projectMetric.trend === 'up' ? 'metric-up' : projectMetric.trend === 'down' ? 'metric-down' : 'metric-neutral'">
                      {{ projectMetric.trend === 'up' ? '↑' : projectMetric.trend === 'down' ? '↓' : '' }}{{ projectMetric.rate }}
                    </span>
                  </div>
                  <div class="project-mode-note">{{ projectMetric.note }}</div>
                </div>
              </div>
            </article>
          </section>

          <section class="center-column">
            <article class="panel overview-panel workflow-panel">
              <div class="panel-title-row panel-title-row--workflow">
                <div class="panel-title">店铺订单</div>
                <div class="workflow-time-group">
                  <!-- <span class="workflow-time-badge">订单快照 {{ shopOrderFlow.todayLatestCollectTime || '--' }}</span>
                  <span class="workflow-time-badge">退款快照 {{ shopOrderFlow.refundLatestCollectTime || '--' }}</span> -->
                </div>
              </div>
              <div class="shop-flow-board">
                <div class="shop-flow-section shop-flow-section--primary">
                  <div class="shop-flow-section-title">订单主链路</div>
                  <div class="shop-flow-track">
                    <template v-for="(node, index) in shopOrderPrimaryNodes" :key="node.key">
                      <div class="shop-flow-card" :class="`shop-flow-card--${node.tone}`">
                        <div class="shop-flow-card-head">
                          <span class="shop-flow-card-icon">{{ node.icon }}</span>
                          <span>{{ node.label }}</span>
                        </div>
                        <div class="shop-flow-card-value">{{ node.value }}</div>
                        <div class="shop-flow-card-desc">{{ node.desc }}</div>
                      </div>
                      <div v-if="index < shopOrderPrimaryNodes.length - 1" :key="`${node.key}-arrow`" class="shop-flow-arrow"></div>
                    </template>
                  </div>
                </div>

                <div class="shop-flow-section shop-flow-section--secondary">
                  <div class="shop-flow-section-title">退款处理链路</div>
                  <div class="shop-flow-track shop-flow-track--secondary">
                    <template v-for="(node, index) in shopOrderRefundNodes" :key="node.key">
                      <div class="shop-flow-card" :class="`shop-flow-card--${node.tone}`">
                        <div class="shop-flow-card-head">
                          <span class="shop-flow-card-icon">{{ node.icon }}</span>
                          <span>{{ node.label }}</span>
                        </div>
                        <div class="shop-flow-card-value">{{ node.value }}</div>
                        <div class="shop-flow-card-desc">{{ node.desc }}</div>
                      </div>
                      <div v-if="index < shopOrderRefundNodes.length - 1" :key="`${node.key}-arrow`" class="shop-flow-arrow shop-flow-arrow--secondary"></div>
                    </template>
                  </div>
                </div>
              </div>
            </article>

            <article class="panel overview-panel rights-panel">
              <div class="panel-title-row">
                <div class="panel-title">经营数据日维度分析</div>
                <div class="chart-filter-row chart-filter-row--panel">
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
                    v-model="analysisStartDate"
                    class="chart-filter"
                    type="date"
                  />
                  <input
                    v-model="analysisEndDate"
                    class="chart-filter"
                    type="date"
                  />
                  <button class="chart-filter-button" type="button" @click="handleRightsFilterChange">查询</button>
                </div>
              </div>
              <div class="chart-monitor-panel">
                <div class="chart-monitor-block chart-monitor-block--top">
                  <div class="chart-block-head">
                      <div class="chart-block-title">订单数量与支付金额趋势</div>
                  </div>
                  <div ref="rightsBarChartRef" class="chart-canvas chart-canvas--bar"></div>
                </div>

                <div class="chart-monitor-block chart-monitor-block--bottom">
                  <div class="chart-block-head">
                    <div class="chart-block-title">退款与关闭趋势</div>
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
import { getXgjDailyOrderAnalysis, getXgjOrderRiskSummary, getXgjOverviewMetrics, getXgjPayOrderTrend, getXgjProductStatusDistribution, getXgjShopOrderFlow, getXgjStoreList, getXgjTopStoreRanking } from '@/api/dvd'

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

const formatDateInputValue = dateValue => {
  const current = new Date(dateValue)
  const year = current.getFullYear()
  const month = String(current.getMonth() + 1).padStart(2, '0')
  const day = String(current.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getRelativeDateValue = offsetDays => {
  const current = new Date()
  current.setDate(current.getDate() + offsetDays)
  return formatDateInputValue(current)
}

const createEmptyDailyOrderAnalysis = () => ({
  dates: [],
  orderNumSeries: [],
  payAmountSeries: [],
  refundOrderNumSeries: [],
  refundAmountSeries: [],
  closedOrderNumSeries: [],
  closedAmountSeries: []
})

const PROJECT_METRIC = {
  label: '商品动销效率',
  value: '0%',
  previous: '快照: --',
  trend: 'flat',
  rate: '实时指标',
  note: '按销售中 / (销售中 + 在售库存数) 计算。'
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

const createEmptyShopOrderFlow = () => ({
  pendingPaymentNum: 0,
  waitSendNum: 0,
  shippedNum: 0,
  pendingAfterSaleNum: 0,
  aboutToTimeoutNum: 0,
  sellerPendingNum: 0,
  buyerPendingNum: 0,
  todayLatestCollectTime: '',
  refundLatestCollectTime: ''
})

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

const formatFlowNumber = value => Number(value || 0).toLocaleString('zh-CN')

const buildProjectMetric = payload => ({
  label: '商品动销效率',
  value: payload?.sellingEfficiency || '0%',
  previous: `快照: ${payload?.latestCollectTime || '--'}`,
  trend: 'flat',
  rate: '实时指标',
  note: '按销售中 / (销售中 + 在售库存数) 计算。'
})

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
        analysisStartDate: getRelativeDateValue(-6),
        analysisEndDate: getRelativeDateValue(0),
        storeList: [],
        overviewMetrics: OVERVIEW_METRICS,
        payOrderTrend: createEmptyPayOrderTrend(),
        dailyOrderAnalysis: createEmptyDailyOrderAnalysis(),
      projectMetric: PROJECT_METRIC,
      rightsShopData: RIGHTS_SHOP_DATA,
      productDistribution: createEmptyProductDistribution(),
        shopOrderFlow: createEmptyShopOrderFlow(),
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
    totalProducts() {
      return this.productDistribution.reduce((total, item) => total + item.value, 0)
    },
    shopOrderPrimaryNodes() {
      return [
        {
          key: 'pendingPaymentNum',
          label: '待付款',
          icon: '付',
          value: formatFlowNumber(this.shopOrderFlow.pendingPaymentNum),
          desc: '待完成支付',
          tone: 'warning'
        },
        {
          key: 'waitSendNum',
          label: '待发货',
          icon: '发',
          value: formatFlowNumber(this.shopOrderFlow.waitSendNum),
          desc: '待商家发货',
          tone: 'gold'
        },
        {
          key: 'shippedNum',
          label: '已发货',
          icon: '货',
          value: formatFlowNumber(this.shopOrderFlow.shippedNum),
          desc: '订单已发出',
          tone: 'cyan'
        },
        {
          key: 'pendingAfterSaleNum',
          label: '待售后',
          icon: '后',
          value: formatFlowNumber(this.shopOrderFlow.pendingAfterSaleNum),
          desc: '待处理售后',
          tone: 'accent'
        }
      ]
    },
    shopOrderRefundNodes() {
      return [
        {
          key: 'aboutToTimeoutNum',
          label: '24小时内即将超时',
          icon: '时',
          value: formatFlowNumber(this.shopOrderFlow.aboutToTimeoutNum),
          desc: '需优先关注',
          tone: 'warning'
        },
        {
          key: 'sellerPendingNum',
          label: '待商家处理',
          icon: '商',
          value: formatFlowNumber(this.shopOrderFlow.sellerPendingNum),
          desc: '等待商家响应',
          tone: 'accent'
        },
        {
          key: 'buyerPendingNum',
          label: '待买家处理',
          icon: '买',
          value: formatFlowNumber(this.shopOrderFlow.buyerPendingNum),
          desc: '等待买家确认',
          tone: 'cyan'
        }
      ]
    }
  },
  mounted() {
      this.updateTime()
      this.clockTimer = setInterval(this.updateTime, 1000)
      this.fetchStoreList()
      this.fetchOverviewMetrics()
      this.fetchPayOrderTrend()
      this.fetchDailyOrderAnalysis()
      this.fetchProductStatusDistribution()
      this.fetchShopOrderFlow()
      this.fetchTopStoreRanking()
      this.fetchOrderRiskSummary()
      this.$nextTick(() => {
        this.initCharts()
        this.handleResize()
      this.initResizeObserver()
    })
    window.addEventListener('resize', this.handleResize)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.handleResize)
    }
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
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.handleResize)
    }
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
    getDailyOrderAnalysisQuery() {
      const query = this.getProductStatusQuery()
      let startDate = this.analysisStartDate
      let endDate = this.analysisEndDate

      if (startDate && endDate && startDate > endDate) {
        const tempDate = startDate
        startDate = endDate
        endDate = tempDate
        this.analysisStartDate = startDate
        this.analysisEndDate = endDate
      }

      if (startDate) query.start_date = startDate
      if (endDate) query.end_date = endDate
      return query
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
    async fetchDailyOrderAnalysis() {
      try {
        const res = await getXgjDailyOrderAnalysis(this.getDailyOrderAnalysisQuery())
        this.dailyOrderAnalysis = {
          ...createEmptyDailyOrderAnalysis(),
          ...(res.data || {})
        }
      } catch (e) {
        console.error('获取闲鱼经营数据日维度分析失败', e)
        this.dailyOrderAnalysis = createEmptyDailyOrderAnalysis()
      }

      this.$nextTick(() => {
        this.renderRightsBarChart()
        this.renderRightsLineChart()
      })
    },
    async fetchProductStatusDistribution() {
      try {
        const res = await getXgjProductStatusDistribution(this.getProductStatusQuery())
        this.productDistribution = buildProductDistributionFromStats(res.data?.stats || [])
        this.projectMetric = buildProjectMetric(res.data || {})
      } catch (e) {
        console.error('获取闲鱼商品状态分布失败', e)
        this.productDistribution = createEmptyProductDistribution()
        this.projectMetric = PROJECT_METRIC
      }

      this.$nextTick(() => {
        this.renderPieChart()
      })
    },
    async fetchShopOrderFlow() {
      try {
        const res = await getXgjShopOrderFlow(this.getProductStatusQuery())
        this.shopOrderFlow = {
          ...createEmptyShopOrderFlow(),
          ...(res.data || {})
        }
      } catch (e) {
        console.error('获取闲鱼店铺订单流转数据失败', e)
        this.shopOrderFlow = createEmptyShopOrderFlow()
      }
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
    getBrowserZoomFactor() {
      if (window.visualViewport && Number(window.visualViewport.scale) > 0) {
        return Number(window.visualViewport.scale)
      }

      if (window.outerWidth && window.innerWidth) {
        const outerZoomFactor = Number((window.outerWidth / window.innerWidth).toFixed(4))
        if (outerZoomFactor > 0) {
          return outerZoomFactor
        }
      }

      return 1
    },
    updateScreenScale() {
      const container = this.$refs.screenStageRef
      if (!container) return
      const { clientWidth, clientHeight } = container
      if (!clientWidth || !clientHeight) return
      const browserZoomFactor = this.getBrowserZoomFactor()
      const effectiveClientWidth = clientWidth * browserZoomFactor
      const effectiveClientHeight = clientHeight * browserZoomFactor
      const widthScale = effectiveClientWidth / SCREEN_DESIGN_WIDTH
      const heightScale = effectiveClientHeight / SCREEN_DESIGN_HEIGHT
      this.screenScale = Math.min(widthScale, heightScale)

      this.viewportHeight = SCREEN_DESIGN_HEIGHT
      this.viewportWidth = SCREEN_DESIGN_WIDTH

      if (widthScale > heightScale) {
        this.viewportWidth = Math.round(effectiveClientWidth / this.screenScale)
      }

      if (widthScale > heightScale) {
        this.viewportWidth = Math.round(effectiveClientWidth / this.screenScale)
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
      this.fetchDailyOrderAnalysis()
      this.fetchProductStatusDistribution()
      this.fetchShopOrderFlow()
      this.fetchTopStoreRanking()
      this.fetchOrderRiskSummary()
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
      this.renderRightsBarChart()
    },
    renderRightsBarChart() {
      if (!this.rightsBarInstance) return
      this.rightsBarInstance.setOption({
        backgroundColor: 'transparent',
        grid: { left: 38, right: 52, top: 16, bottom: 28, containLabel: true },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross' },
          backgroundColor: 'rgba(8, 18, 38, 0.95)',
          borderColor: 'rgba(245, 199, 103, 0.25)',
          textStyle: { color: '#f7f1d2' },
          formatter: params => {
            const rows = params || []
            const dateLabel = rows[0]?.axisValue || ''
            const lines = rows.map(item => `${item.marker}${item.seriesName}：${Number(item.data || 0).toLocaleString('zh-CN')}`)
            return [dateLabel].concat(lines).join('<br/>')
          }
        },
        xAxis: {
          type: 'category',
          data: this.dailyOrderAnalysis.dates,
          axisLine: { lineStyle: { color: 'rgba(245, 199, 103, 0.24)' } },
          axisTick: { show: false },
          axisLabel: {
            color: '#cfc6a5',
            fontSize: 10,
            interval: 0,
            rotate: this.dailyOrderAnalysis.dates.length > 7 ? 25 : 0
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '订单数量',
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#a9a086', fontSize: 10 }
          },
          {
            type: 'value',
            name: '支付金额',
            splitLine: { show: false },
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
              color: '#a9a086',
              fontSize: 10,
              formatter: value => `¥${Number(value || 0).toLocaleString('zh-CN')}`
            }
          }
        ],
        series: [
          {
            name: '订单数量',
            type: 'bar',
            data: this.dailyOrderAnalysis.orderNumSeries,
            barWidth: 18,
            itemStyle: {
              borderRadius: [6, 6, 0, 0],
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#ffd95d' },
                { offset: 1, color: '#8fd8d8' }
              ])
            }
          },
          {
            name: '支付金额',
            type: 'line',
            yAxisIndex: 1,
            smooth: true,
            data: this.dailyOrderAnalysis.payAmountSeries,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { width: 3, color: '#6bd8ff' },
            itemStyle: { color: '#6bd8ff', borderColor: '#0b1830', borderWidth: 2 }
          }
        ]
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
      this.rightsLineInstance.setOption({
        backgroundColor: 'transparent',
        grid: { left: 34, right: 52, top: 16, bottom: 28, containLabel: true },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(8, 18, 38, 0.95)',
          borderColor: 'rgba(245, 199, 103, 0.25)',
          textStyle: { color: '#f7f1d2' },
          formatter: params => {
            const rows = params || []
            const dateLabel = rows[0]?.axisValue || ''
            const lines = rows.map(item => `${item.marker}${item.seriesName}：${Number(item.data || 0).toLocaleString('zh-CN')}`)
            return [dateLabel].concat(lines).join('<br/>')
          }
        },
        xAxis: {
          type: 'category',
          data: this.dailyOrderAnalysis.dates,
          axisLine: { lineStyle: { color: 'rgba(245, 199, 103, 0.24)' } },
          axisTick: { show: false },
          axisLabel: {
            color: '#cfc6a5',
            fontSize: 10,
            interval: 0,
            rotate: this.dailyOrderAnalysis.dates.length > 7 ? 25 : 0
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '数量',
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#a9a086', fontSize: 10 }
          },
          {
            type: 'value',
            name: '金额',
            splitLine: { show: false },
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
              color: '#a9a086',
              fontSize: 10,
              formatter: value => `¥${Number(value || 0).toLocaleString('zh-CN')}`
            }
          }
        ],
        series: [
          {
            name: '已经退款数量',
            type: 'bar',
            data: this.dailyOrderAnalysis.refundOrderNumSeries,
            barMaxWidth: 14,
            itemStyle: { color: '#ffb85c', borderRadius: [5, 5, 0, 0] }
          },
          {
            name: '交易关闭数量',
            type: 'bar',
            data: this.dailyOrderAnalysis.closedOrderNumSeries,
            barMaxWidth: 14,
            itemStyle: { color: '#ff7e79', borderRadius: [5, 5, 0, 0] }
          },
          {
            name: '已经退款金额',
            type: 'line',
            yAxisIndex: 1,
            smooth: true,
            data: this.dailyOrderAnalysis.refundAmountSeries,
            symbol: 'circle',
            symbolSize: 5,
            lineStyle: { width: 2.5, color: '#7fe1ff' },
            itemStyle: { color: '#7fe1ff', borderColor: '#0b1830', borderWidth: 2 }
          },
          {
            name: '交易关闭金额',
            type: 'line',
            yAxisIndex: 1,
            smooth: true,
            data: this.dailyOrderAnalysis.closedAmountSeries,
            symbol: 'circle',
            symbolSize: 5,
            lineStyle: { width: 2.5, color: '#ffd95d' },
            itemStyle: { color: '#ffd95d', borderColor: '#0b1830', borderWidth: 2 }
          }
        ]
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
  padding: 10px 32px 18px;
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
  top: 4px;
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
  top: 10px;
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
  grid-template-rows: minmax(0, 4fr) minmax(0, 6fr);
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

.rights-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.workflow-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  container-type: inline-size;
  --workflow-board-gap: 14px;
  --workflow-board-tail-gap: 3px;
  --workflow-section-radius: 16px;
  --workflow-section-padding-y: 12px;
  --workflow-section-padding-x: 12px;
  --workflow-section-secondary-padding-top: 10px;
  --workflow-section-secondary-padding-bottom: 8px;
  --workflow-section-title-gap: 12px;
  --workflow-section-title-gap-secondary: 8px;
  --workflow-arrow-width-primary: 20px;
  --workflow-arrow-width-secondary: 26px;
  --workflow-arrow-margin: 4px;
  --workflow-card-radius: 16px;
  --workflow-card-padding-y: 10px;
  --workflow-card-padding-x: 12px;
  --workflow-card-padding-x-primary: 10px;
  --workflow-card-padding-y-secondary: 8px;
  --workflow-card-padding-x-secondary: 10px;
  --workflow-card-min-height-primary: 84px;
  --workflow-card-min-height-secondary: 84px;
  --workflow-title-font-size: 12px;
  --workflow-head-font-size: 12px;
  --workflow-head-font-size-primary: 11px;
  --workflow-icon-size: 24px;
  --workflow-value-size-primary: 22px;
  --workflow-value-size-secondary: 23px;
  --workflow-desc-font-size: 11px;
  --workflow-desc-font-size-secondary: 11px;
  padding-bottom: 14px;
  overflow: hidden;
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

.panel-title-row {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 12px;
  min-width: 0;
}

.panel-title-row .panel-title {
  margin-bottom: 0;
  min-width: 0;
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

.metric-neutral {
  color: #d7c98b;
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

.panel-title-row--workflow {
  align-items: flex-start;
}

.workflow-time-group {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

.workflow-time-badge {
  padding: 4px 9px;
  border: 1px solid rgba(245, 199, 103, 0.2);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(247, 239, 203, 0.72);
  font-size: 10px;
  line-height: 1;
  white-space: nowrap;
}

.shop-flow-board {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: var(--workflow-board-gap);
  flex: 1;
  min-height: 0;
  min-width: 0;
  width: 100%;
  justify-content: flex-start;
  box-sizing: border-box;
  overflow: hidden;
}

.shop-flow-board::after {
  content: '';
  display: block;
  height: var(--workflow-board-tail-gap);
  flex-shrink: 0;
}

.shop-flow-section {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  padding: var(--workflow-section-padding-y) var(--workflow-section-padding-x);
  border-radius: var(--workflow-section-radius);
  border: 1px solid rgba(245, 199, 103, 0.14);
  background:
    linear-gradient(180deg, rgba(255, 247, 215, 0.05) 0%, rgba(255, 247, 215, 0) 24%),
    linear-gradient(180deg, rgba(10, 23, 44, 0.86) 0%, rgba(7, 18, 36, 0.92) 100%);
  box-shadow:
    inset 0 0 18px rgba(255, 215, 0, 0.04),
    0 12px 28px rgba(0, 0, 0, 0.16);
  min-height: 0;
  overflow: hidden;
}

.shop-flow-section--secondary {
  flex: 1 0 auto;
  border-color: rgba(113, 204, 255, 0.14);
  padding:
    var(--workflow-section-secondary-padding-top)
    var(--workflow-section-padding-x)
    var(--workflow-section-secondary-padding-bottom);
}

.shop-flow-section--secondary .shop-flow-track {
  flex: 1;
  min-height: 0;
  min-width: 0;
  align-items: center;
}

.shop-flow-section--primary {
  padding: 10px var(--workflow-section-padding-x);
}

.shop-flow-section--primary .shop-flow-section-title {
  margin-bottom: calc(var(--workflow-section-title-gap) - 2px);
}

.shop-flow-section--primary .shop-flow-card {
  min-height: var(--workflow-card-min-height-primary);
  padding: 8px var(--workflow-card-padding-x-primary);
}

.shop-flow-section--primary .shop-flow-card-head {
  font-size: var(--workflow-head-font-size-primary);
}

.shop-flow-section--primary .shop-flow-card-value {
  margin-top: 10px;
  font-size: var(--workflow-value-size-primary);
}

.shop-flow-section--primary .shop-flow-card-desc {
  margin-top: 6px;
}

.shop-flow-section--secondary .shop-flow-section-title {
  margin-bottom: var(--workflow-section-title-gap-secondary);
}

.shop-flow-section--secondary .shop-flow-card {
  min-height: var(--workflow-card-min-height-secondary);
  padding: var(--workflow-card-padding-y-secondary) var(--workflow-card-padding-x-secondary);
}

.shop-flow-section--secondary .shop-flow-card-value {
  margin-top: 8px;
  font-size: var(--workflow-value-size-secondary);
}

.shop-flow-section--secondary .shop-flow-card-desc {
  margin-top: 4px;
  font-size: var(--workflow-desc-font-size-secondary);
}

.shop-flow-section-title {
  margin-bottom: var(--workflow-section-title-gap);
  color: #f5e7ad;
  font-size: var(--workflow-title-font-size);
  font-weight: 600;
  letter-spacing: 0.08em;
  line-height: 1.2;
}

.shop-flow-track {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr) var(--workflow-arrow-width-primary)
    minmax(0, 1fr) var(--workflow-arrow-width-primary)
    minmax(0, 1fr) var(--workflow-arrow-width-primary)
    minmax(0, 1fr);
  align-items: center;
  gap: 0;
  min-width: 0;
  width: 100%;
}

.shop-flow-track--secondary {
  grid-template-columns:
    minmax(0, 1fr) var(--workflow-arrow-width-secondary)
    minmax(0, 1fr) var(--workflow-arrow-width-secondary)
    minmax(0, 1fr);
}

.shop-flow-arrow {
  position: relative;
  height: 2px;
  margin: 0 var(--workflow-arrow-margin);
  align-self: center;
  background: linear-gradient(90deg, rgba(255, 218, 0, 0.12) 0%, rgba(255, 218, 0, 0.72) 100%);
}

.shop-flow-arrow::after {
  content: '';
  position: absolute;
  top: 50%;
  right: -1px;
  width: 9px;
  height: 9px;
  border-top: 2px solid rgba(255, 218, 0, 0.88);
  border-right: 2px solid rgba(255, 218, 0, 0.88);
  transform: translateY(-50%) rotate(45deg);
}

.shop-flow-arrow--secondary {
  background: linear-gradient(90deg, rgba(113, 204, 255, 0.12) 0%, rgba(113, 204, 255, 0.72) 100%);
}

.shop-flow-arrow--secondary::after {
  border-top-color: rgba(113, 204, 255, 0.88);
  border-right-color: rgba(113, 204, 255, 0.88);
}

.shop-flow-card {
  min-height: 98px;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  padding: var(--workflow-card-padding-y) var(--workflow-card-padding-x);
  border-radius: var(--workflow-card-radius);
  border: 1px solid rgba(255, 255, 255, 0.06);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 100%),
    rgba(8, 18, 38, 0.9);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 10px 20px rgba(0, 0, 0, 0.18);
}

.shop-flow-card--gold {
  border-color: rgba(255, 218, 0, 0.24);
}

.shop-flow-card--warning {
  border-color: rgba(255, 150, 92, 0.28);
}

.shop-flow-card--cyan {
  border-color: rgba(113, 204, 255, 0.24);
}

.shop-flow-card--accent {
  border-color: rgba(194, 143, 27, 0.28);
}

.shop-flow-card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  color: #f6edcc;
  font-size: var(--workflow-head-font-size);
  font-weight: 600;
  line-height: 1.2;
}

.shop-flow-card-icon {
  width: var(--workflow-icon-size);
  height: var(--workflow-icon-size);
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  color: #ffde72;
  font-size: var(--workflow-head-font-size);
  font-weight: 700;
}

.shop-flow-card-head > span:last-child {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shop-flow-card-value {
  margin-top: 12px;
  color: #fff0a6;
  font-size: var(--workflow-value-size-primary);
  font-weight: 700;
  line-height: 1;
}

.shop-flow-card-desc {
  margin-top: 8px;
  color: rgba(242, 231, 187, 0.7);
  font-size: var(--workflow-desc-font-size);
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@container (max-width: 880px) {
  .workflow-panel {
    --workflow-board-gap: 12px;
    --workflow-section-radius: 14px;
    --workflow-section-padding-y: 10px;
    --workflow-section-padding-x: 10px;
    --workflow-section-secondary-padding-top: 9px;
    --workflow-section-secondary-padding-bottom: 7px;
    --workflow-section-title-gap: 10px;
    --workflow-section-title-gap-secondary: 7px;
    --workflow-arrow-width-primary: 16px;
    --workflow-arrow-width-secondary: 22px;
    --workflow-arrow-margin: 3px;
    --workflow-card-radius: 14px;
    --workflow-card-padding-y: 8px;
    --workflow-card-padding-x: 10px;
    --workflow-card-padding-x-primary: 8px;
    --workflow-card-padding-y-secondary: 7px;
    --workflow-card-padding-x-secondary: 9px;
    --workflow-card-min-height-primary: 76px;
    --workflow-card-min-height-secondary: 76px;
    --workflow-title-font-size: 11px;
    --workflow-head-font-size: 11px;
    --workflow-head-font-size-primary: 10px;
    --workflow-icon-size: 22px;
    --workflow-value-size-primary: 19px;
    --workflow-value-size-secondary: 20px;
    --workflow-desc-font-size: 11px;
    --workflow-desc-font-size-secondary: 10px;
  }
}

@container (max-width: 760px) {
  .workflow-panel {
    --workflow-board-gap: 10px;
    --workflow-section-radius: 12px;
    --workflow-section-padding-y: 8px;
    --workflow-section-padding-x: 8px;
    --workflow-section-secondary-padding-top: 8px;
    --workflow-section-secondary-padding-bottom: 6px;
    --workflow-section-title-gap: 8px;
    --workflow-section-title-gap-secondary: 6px;
    --workflow-arrow-width-primary: 12px;
    --workflow-arrow-width-secondary: 18px;
    --workflow-arrow-margin: 2px;
    --workflow-card-radius: 12px;
    --workflow-card-padding-y: 7px;
    --workflow-card-padding-x: 8px;
    --workflow-card-padding-x-primary: 6px;
    --workflow-card-padding-y-secondary: 6px;
    --workflow-card-padding-x-secondary: 8px;
    --workflow-card-min-height-primary: 64px;
    --workflow-card-min-height-secondary: 68px;
    --workflow-title-font-size: 10px;
    --workflow-head-font-size: 10px;
    --workflow-head-font-size-primary: 9px;
    --workflow-icon-size: 20px;
    --workflow-value-size-primary: 16px;
    --workflow-value-size-secondary: 17px;
    --workflow-desc-font-size: 9px;
    --workflow-desc-font-size-secondary: 9px;
  }
}

.chart-monitor-panel {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 14px;
  flex: 1;
  min-height: 0;
  min-width: 0;
  width: 100%;
  overflow: hidden;
}

.chart-monitor-block {
  min-height: 0;
  min-width: 0;
  border-radius: 14px;
  border: 1px solid rgba(245, 199, 103, 0.16);
  background:
    linear-gradient(180deg, rgba(255, 249, 216, 0.04) 0%, transparent 18%),
    linear-gradient(180deg, rgba(12, 24, 46, 0.82) 0%, rgba(7, 18, 36, 0.88) 100%);
  padding: 12px;
  overflow: hidden;
  box-sizing: border-box;
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
  min-width: 0;
}

.chart-filter-row--panel {
  flex-wrap: wrap;
  justify-content: flex-end;
  max-width: 100%;
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

.chart-filter-button {
  height: 32px;
  padding: 0 14px;
  border: 1px solid rgba(245, 199, 103, 0.28);
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(255, 217, 93, 0.2) 0%, rgba(194, 143, 27, 0.2) 100%);
  color: #fff3c4;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chart-filter-button:hover {
  border-color: rgba(245, 199, 103, 0.45);
  box-shadow: 0 0 12px rgba(245, 199, 103, 0.14);
}

.chart-canvas {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.chart-canvas--bar {
  height: calc(100% - 40px);
  min-height: 124px;
}

.chart-canvas--line {
  height: calc(100% - 40px);
  min-height: 124px;
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
  padding: 18px 20px 22px;
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
  line-height: 1.5;
  padding-left: 2px;
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
  padding-right: 12px;
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
