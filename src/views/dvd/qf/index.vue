<template>
  <div ref="screenStageRef" class="screen-stage">
    <div class="screen-stage__viewport" :style="screenScaleStyle">
      <div class="dashboard-container">
    <!-- 头部 -->
    <div class="header">
      <!-- 头部主体背景形状 -->
      <div class="header-bg"></div>
      <!-- 头部装饰线条 -->
      <div class="header-line-top"></div>
      <div class="header-line-bottom"></div>
      <div class="header-glow"></div>
      
      <div class="header-title">
        <h1>千帆实时数据大屏</h1>
        <!-- <div class="header-time">{{ currentTime }}</div> -->
      </div>
      <div class="header-controls">
        <div class="date-range-wrapper">
          <el-date-picker
            v-model="selectedDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            size="small"
            clearable
            value-format="YYYY-MM-DD"
            style="width: 240px"
            @change="handleFilterChange"
          />
        </div>

        <div class="store-select-wrapper">
          <el-select v-model="selectedStore" placeholder="选择店铺" size="small" clearable @change="handleStoreChange">
            <el-option label="全部店铺" :value="null" />
            <el-option v-for="(store, index) in storeList" :key="index" :label="store.storeName"
              :value="store.storeName" />
          </el-select>
        </div>
        <span class="control-item">CNY</span>
        <div class="screenfull-wrapper">
          <screenfull @change="setImmersiveMode" />
        </div>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="main-content">
      <!-- 左侧 -->
      <div class="column col-left">
        <!-- 热销店铺 -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title-wrapper">
              <i class="panel-icon"></i>
              <span class="panel-title">热销店铺 TOP10</span>
            </div>
            <div class="button-group">
              <button :class="{ active: storeTab === 'orders' }" @click.stop="handleStoreTabChange('orders')">按订单量</button>
              <button :class="{ active: storeTab === 'sales' }" @click.stop="handleStoreTabChange('sales')">按销售额</button>
            </div>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>排名</th>
                  <th>店铺</th>
                  <th v-if="storeTab === 'orders'">订单量</th>
                  <th v-if="storeTab === 'sales'">销售额(¥)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in topStores" :key="item.rank">
                  <td><span :class="{ 'rank-top': item.rank <= 3 }">{{ item.rank }}</span></td>
                  <td>{{ item.storeName }}</td>
                  <td v-if="storeTab === 'orders'">{{ item.orderCount }}</td>
                  <td v-if="storeTab === 'sales'">{{ formatNumber(item.salesAmount) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- SKU销售数据 -->
        <div class="panel sku-sales-panel">
          <div class="panel-header">
            <div class="panel-title-wrapper">
              <i class="panel-icon"></i>
              <span class="panel-title">SKU销售数据</span>
            </div>
            <div class="button-group">
              <button :class="{ active: channelTab === 'sales' }" @click.stop="handleChannelTabChange('sales')">按销量</button>
              <button :class="{ active: channelTab === 'amount' }" @click.stop="handleChannelTabChange('amount')">按销售额</button>
            </div>
          </div>
          <div class="table-container sku-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 35%">商品名称</th>
                  <th style="width: 30%">SKU-ID</th>
                  <th v-if="channelTab === 'sales'" style="width: 35%; text-align: right; padding-right: 20px;">销量</th>
                  <th v-if="channelTab === 'amount'" style="width: 35%; text-align: right; padding-right: 20px;">销售额(¥)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in sortedChannelData" :key="item.skuId">
                  <td :title="item.skuName" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ item.skuName }}</td>
                  <td :title="item.skuId" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ item.skuId }}</td>
                  <td v-if="channelTab === 'sales'" style="text-align: right; padding-right: 20px;">{{ item.salesCount }}</td>
                  <td v-if="channelTab === 'amount'" style="text-align: right; padding-right: 20px;">{{ formatNumber(item.salesAmount) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 中间 -->
      <div class="column col-center">
        <!-- 核心指标 -->
        <div class="key-metrics">
          <div class="metrics-layout">
            <!-- 左侧大卡片：订单量 & 平均单价 -->
            <div class="metric-card large-card">
              <div class="card-corner tl"></div>
              <div class="card-corner tr"></div>
              <div class="card-corner bl"></div>
              <div class="card-corner br"></div>
              
              <div class="metric-label">订单量</div>
              <div class="metric-value-main">{{ realtimeMetrics.totalOrders || 0 }}</div>
              <div class="metric-glow-bar"></div>
              <div class="metric-label sub-label">平均单价</div>
              <div class="metric-value-sub">
                <span class="currency">¥</span>
                <span class="amount">{{ averageOrderPrice.integer }}</span>
                <span class="decimal">.{{ averageOrderPrice.decimal }}</span>
              </div>
              <div class="metric-glow-bar"></div>
            </div>

            <!-- 右侧区域 -->
            <div class="metrics-right-panel">
              <div class="metrics-header-info">
                <div class="datetime-display">
                  <span class="date">{{ currentDate }}</span>
                  <span class="time">{{ currentTimeOnly }}</span>
                </div>
              </div>
              
              <div class="small-cards-container">
                <!-- 销售额 -->
                <div class="metric-card small-card">
                  <div class="card-corner tl"></div>
                  <div class="card-corner tr"></div>
                  <div class="card-corner bl"></div>
                  <div class="card-corner br"></div>
                  <div class="metric-label">销售额(¥)</div>
                  <div class="metric-value-main">
                    {{ formatMetricValue(realtimeMetrics.totalGmv).integer }}<span class="decimal">.{{ formatMetricValue(realtimeMetrics.totalGmv).decimal }}</span>
                  </div>
                  <div class="metric-glow-bar"></div>
                </div>

                <!-- 商品访问量 -->
                <div class="metric-card small-card">
                  <div class="card-corner tl"></div>
                  <div class="card-corner tr"></div>
                  <div class="card-corner bl"></div>
                  <div class="card-corner br"></div>
                  <div class="metric-label">商品访问量</div>
                  <div class="metric-value-main">{{ realtimeMetrics.totalGoodsVisits || 0 }}</div>
                  <div class="metric-glow-bar"></div>
                </div>

                <!-- 店铺访问量 -->
                <div class="metric-card small-card">
                  <div class="card-corner tl"></div>
                  <div class="card-corner tr"></div>
                  <div class="card-corner bl"></div>
                  <div class="card-corner br"></div>
                  <div class="metric-label">店铺访问量</div>
                  <div class="metric-value-main">{{ realtimeMetrics.totalShopVisits || 0 }}</div>
                  <div class="metric-glow-bar"></div>
                </div>

                <!-- 广告支付额 -->
                <div class="metric-card small-card">
                  <div class="card-corner tl"></div>
                  <div class="card-corner tr"></div>
                  <div class="card-corner bl"></div>
                  <div class="card-corner br"></div>
                  <div class="metric-label">广告支付额(¥)</div>
                  <div class="metric-value-main">
                    {{ formatMetricValue(realtimeMetrics.totalAdAmount).integer }}<span class="decimal">.{{ formatMetricValue(realtimeMetrics.totalAdAmount).decimal }}</span>
                  </div>
                  <div class="metric-glow-bar"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 地图容器 (暂不处理)
        <div id="map-container" class="map-placeholder">
          <div class="map-tip">地图功能开发中...</div>
        </div> -->

        <!-- 底部订单 -->
        <div class="panel bottom-orders">
          <div class="panel-header">
            <span class="panel-title">实时订单</span>
          </div>
          <div 
            class="table-container order-table-wrapper" 
            ref="orderTableContainer"
            @mouseenter="handleOrderTableMouseEnter"
            @wheel="handleOrderTableWheel">
            <table class="data-table">
              <thead>
                <tr>
                  <th>店铺名称</th>
                  <th>订单号</th>
                  <th>下单时间</th>
                  <th>实际付款金额(¥)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in recentOrders" :key="order.orderNo">
                  <td>{{ order.storeName }}</td>
                  <td>{{ order.orderNo }}</td>
                  <td>{{ order.orderTime }}</td>
                  <td style="color: #00c2c2">{{ formatNumber(order.orderAmount) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 右侧 -->
      <div class="column col-right">
        <!-- GMV 走势图 -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title-wrapper">
              <i class="panel-icon"></i>
              <span class="panel-title">GMV 走势图 (¥)</span>
              <el-tooltip content="统计当日实时成交总额趋势" placement="top">
                <i class="info-icon">?</i>
              </el-tooltip>
            </div>
          </div>
          <div ref="chartGmv" class="chart-box"></div>
        </div>

        <!-- 订单量走势图 -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title-wrapper">
              <i class="panel-icon"></i>
              <span class="panel-title">订单量走势图</span>
              <el-tooltip content="统计当日实时订单量增长趋势" placement="top">
                <i class="info-icon">?</i>
              </el-tooltip>
            </div>
          </div>
          <div ref="chartOrders" class="chart-box"></div>
        </div>

        <!-- 商品卡片点击次数走势图 -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title-wrapper">
              <i class="panel-icon"></i>
              <span class="panel-title">商品卡片点击次数走势图</span>
              <el-tooltip content="统计当日各时段商品曝光后的点击次数" placement="top">
                <i class="info-icon">?</i>
              </el-tooltip>
            </div>
          </div>
          <div ref="chartPlatform" class="chart-box"></div>
        </div>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { markRaw } from 'vue'
import { getAllDashboardData, getStoreList, getRealtimeMetrics, getRealtimeTrend, getTopStores, getRealtimeOrders, getSkuSalesData } from '@/api/dvd'
import Screenfull from '@/components/Screenfull'

const SCREEN_DESIGN_WIDTH = 1920
const SCREEN_DESIGN_HEIGHT = 1080

export default {
  name: 'DvdQfDashboard',
  components: {
    Screenfull
  },
  // 在 beforeCreate 钩子中定义非响应式属性，避免 Vue 将其转为响应式
  beforeCreate() {
    // echarts 实例必须是非响应式的，否则 tooltip 无法正常工作
    this.chartGmvInstance = null
    this.chartOrdersInstance = null
    this.chartPlatformInstance = null
  },
  data() {
    return {
      currentTime: '',
      currentDate: '',
      currentTimeOnly: '',
      dashboardMetrics: {},
      storeRank: [],
      channelData: [],
      recentOrders: [],
      trendData: {},
      storeList: [],
      selectedStore: null,
      selectedDate: null, // 选中的日期
      realtimeTrendData: {},
      realtimeMetrics: { totalOrders: 0, totalGmv: 0, totalGoodsVisits: 0, totalShopVisits: 0, totalAdAmount: 0 },
      topStores: [],
      storeTab: 'orders',
      channelTab: 'sales',
      skuSalesData: [],
      refreshTimer: null,
      isImmersiveMode: false,
      screenScale: 1,
      resizeObserver: null, // ResizeObserver 实例
      resizeTimeout: null, // 防抖定时器
    }
  },
  computed: {
    sortedChannelData() {
      // 直接返回 skuSalesData，因为后端已经按照 sort_by 排序了
      return this.skuSalesData
    },
    averageOrderPrice() {
      const totalGmv = this.realtimeMetrics.totalGmv || 0
      const totalOrders = this.realtimeMetrics.totalOrders || 0
      if (totalOrders === 0) {
        return { integer: '0', decimal: '00' }
      }
      const avg = totalGmv / totalOrders
      const str = avg.toFixed(2)
      const parts = str.split('.')
      return {
        integer: parseFloat(parts[0]).toLocaleString('zh-CN'),
        decimal: parts[1] || '00'
      }
    },
    screenScaleStyle() {
      return {
        transform: `scale(${this.screenScale})`
      }
    },
  },
  mounted() {
    this.updateTime()
    setInterval(this.updateTime, 1000)

    // 初始化图表
    this.initCharts()

    // 加载店铺列表
    this.loadStoreList()

    // 加载数据
    this.loadAllData()
    this.loadRealtimeMetrics()
    this.loadRealtimeTrend()
    this.loadTopStores()
    this.loadRealtimeOrders()
    this.loadSkuSalesData()

    // 定时刷新数据（每30秒）
    this.refreshTimer = setInterval(() => {
      this.loadAllData()
      this.loadRealtimeMetrics()
      this.loadRealtimeTrend()
      this.loadTopStores()
      this.loadRealtimeOrders()
      this.loadSkuSalesData()
    }, 30000)

    // 窗口大小改变自适应
    window.addEventListener('resize', this.handleResize)

    // 使用 ResizeObserver 监听容器尺寸变化（响应侧边栏收缩/展开）
    this.initResizeObserver()

    // 添加双击事件监听器，实现双击任意位置全屏
    document.addEventListener('dblclick', this.handleDoubleClick)
  },
  beforeUnmount() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
    // 清理防抖定时器
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout)
    }
    // 断开 ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
    // 移除双击事件监听器
    document.removeEventListener('dblclick', this.handleDoubleClick)
    window.removeEventListener('resize', this.handleResize)
    this.setImmersiveMode(false)
    const instances = ['chartGmvInstance', 'chartOrdersInstance', 'chartPlatformInstance']
    instances.forEach(name => {
      if (this[name]) {
        this[name].dispose()
        this[name] = null
      }
    })
  },
  methods: {
    handleDoubleClick() {
      // 双击任意位置切换全屏
      const nextMode = !this.isImmersiveMode
      this.setImmersiveMode(nextMode)
    },
    setImmersiveMode(enabled) {
      this.isImmersiveMode = enabled
      document.body.classList.toggle('qf-immersive-mode', enabled)
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

      this.screenScale = Math.min(
        clientWidth / SCREEN_DESIGN_WIDTH,
        clientHeight / SCREEN_DESIGN_HEIGHT
      )
    },
    updateTime() {
      const now = new Date()
      this.currentTime = now.toLocaleString('zh-CN', { hour12: false })
      this.currentDate = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`
      this.currentTimeOnly = now.toLocaleTimeString('zh-CN', { hour12: false })
    },
    async loadStoreList() {
      try {
        const response = await getStoreList()
        if (response && response.code === 200 && response.data) {
          this.storeList = response.data
        }
      } catch (error) {
        console.error('加载店铺列表失败:', error)
      }
    },
    async loadRealtimeMetrics() {
      try {
        const params = {}
        if (this.selectedStore) {
          params.store_name = this.selectedStore
        }
        if (this.selectedDate) {
          params.target_date = this.formatDateToString(this.selectedDate)
        }
        const response = await getRealtimeMetrics(params)
        if (response && response.code === 200 && response.data) {
          // 使用后端返回的汇总指标
          if (response.data.metrics) {
            this.realtimeMetrics = {
              totalOrders: response.data.metrics.totalOrders || 0,
              totalGmv: response.data.metrics.totalGmv || 0,
              totalGoodsVisits: response.data.metrics.totalGoodsVisits || 0,
              totalShopVisits: response.data.metrics.totalShopVisits || 0,
              totalAdAmount: response.data.metrics.totalAdAmount || 0
            }
          }
        }
      } catch (error) {
        console.error('加载实时指标数据失败:', error)
      }
    },
    async loadRealtimeTrend() {
      try {
        const params = {}
        if (this.selectedStore) {
          params.store_name = this.selectedStore
        }
        if (this.selectedDate) {
          params.target_date = this.formatDateToString(this.selectedDate)
        }
        const response = await getRealtimeTrend(params)
        if (response && response.code === 200 && response.data) {
          this.realtimeTrendData = response.data
          
          this.updateGmvChart()
          this.updateOrdersChart()
          this.updateCardClickChart()
        }
      } catch (error) {
        console.error('加载实时走势数据失败:', error)
      }
    },
    handleStoreChange() {
      this.loadRealtimeMetrics()
      this.loadRealtimeTrend()
      this.loadRealtimeOrders()
    },
    handleDateChange() {
      // 日期变化时，重新加载所有数据
      console.log('日期变化:', this.selectedDate)
      this.loadRealtimeMetrics()
      this.loadRealtimeTrend()
      this.loadTopStores()
      this.loadRealtimeOrders()
      this.loadSkuSalesData()
    },
    handleStoreTabChange(tab) {
      console.log('切换店铺排序:', tab)
      this.storeTab = tab
      this.loadTopStores()
    },
    handleChannelTabChange(tab) {
      console.log('切换SKU排序:', tab)
      this.channelTab = tab
      this.loadSkuSalesData()
    },
    async loadSkuSalesData() {
      try {
        const params = {
          sort_by: this.channelTab === 'sales' ? 'sales' : 'amount'
        }
        if (this.selectedDate) {
          params.target_date = this.formatDateToString(this.selectedDate)
        }
        console.log('请求SKU销售数据参数:', params)
        const response = await getSkuSalesData(params)
        console.log('SKU销售数据返回:', response)
        if (response && response.code === 200 && response.data) {
          this.skuSalesData = response.data
          console.log('SKU销售数据已更新，数量:', this.skuSalesData.length)
        }
      } catch (error) {
        console.error('加载SKU销售数据失败:', error)
      }
    },
    async loadTopStores() {
      try {
        const params = {
          sort_by: this.storeTab,
          limit: 10
        }
        if (this.selectedDate) {
          params.target_date = this.formatDateToString(this.selectedDate)
        }
        const response = await getTopStores(params)
        if (response && response.code === 200 && response.data) {
          this.topStores = response.data
        }
      } catch (error) {
        console.error('加载热销店铺失败:', error)
      }
    },
    async loadRealtimeOrders() {
      try {
        const params = {
          limit: 20
        }
        if (this.selectedStore) {
          params.store_name = this.selectedStore
        }
        if (this.selectedDate) {
          params.target_date = this.formatDateToString(this.selectedDate)
        }
        console.log('请求实时订单参数:', params)
        const response = await getRealtimeOrders(params)
        console.log('实时订单返回数据:', response)
        if (response && response.code === 200 && response.data) {
          this.recentOrders = response.data
          console.log('实时订单已更新，数量:', this.recentOrders.length)
          
          // 检查滚动容器状态
          this.$nextTick(() => {
            this.checkScrollContainer()
          })
        }
      } catch (error) {
        console.error('加载实时订单失败:', error)
      }
    },
    checkScrollContainer() {
      if (this.$refs.orderTableContainer) {
        const container = this.$refs.orderTableContainer
        console.log('=== 订单表格容器状态 ===')
        console.log('容器高度:', container.clientHeight)
        console.log('滚动高度:', container.scrollHeight)
        console.log('是否可滚动:', container.scrollHeight > container.clientHeight)
        console.log('overflow-y样式:', window.getComputedStyle(container).overflowY)
        console.log('表格行数:', this.recentOrders.length)
        
        const computedStyle = window.getComputedStyle(container)
        console.log('pointer-events:', computedStyle.pointerEvents)
        console.log('z-index:', computedStyle.zIndex)
        console.log('position:', computedStyle.position)
        
        // 检查表格元素
        const table = container.querySelector('table')
        if (table) {
          console.log('表格实际高度:', table.offsetHeight)
          console.log('表格tbody行数:', table.querySelectorAll('tbody tr').length)
        }
      } else {
        console.warn('订单表格容器ref未找到')
      }
    },
    handleOrderTableMouseEnter() {
      console.log('鼠标进入订单表格区域')
    },
    handleOrderTableWheel(event) {
      console.log('检测到滚轮事件:', event.deltaY)
      const container = this.$refs.orderTableContainer
      if (container) {
        console.log('当前scrollTop:', container.scrollTop)
        console.log('最大可滚动距离:', container.scrollHeight - container.clientHeight)
      }
    },
    async loadAllData() {
      try {
        const response = await getAllDashboardData()
        if (response && response.code === 200 && response.data) {
          this.dashboardMetrics = response.data.metrics || {}
          this.storeRank = response.data.storeRank || []
          this.channelData = response.data.channelData || []
          // 注释掉这行，不从 getAllDashboardData 中获取订单数据
          // this.recentOrders = response.data.recentOrders || []
          this.trendData = response.data.trendData || {}
          this.updateCharts()
        }
      } catch (error) {
        console.error('加载数据失败:', error)
      }
    },
    initCharts() {
      // 确保完全销毁旧实例再重新创建
      const instances = ['chartGmvInstance', 'chartOrdersInstance', 'chartPlatformInstance']
      instances.forEach(name => {
        if (this[name]) {
          this[name].dispose()
        }
      })
      
      // 使用 markRaw 防止 Vue 将 echarts 实例转为响应式
      this.chartGmvInstance = markRaw(echarts.init(this.$refs.chartGmv))
      this.chartOrdersInstance = markRaw(echarts.init(this.$refs.chartOrders))
      this.chartPlatformInstance = markRaw(echarts.init(this.$refs.chartPlatform))
    },
    updateGmvChart() {
      if (!this.chartGmvInstance) {
        console.warn('GMV图表实例未初始化')
        return
      }
      if (!this.realtimeTrendData.timeLabels || this.realtimeTrendData.timeLabels.length === 0) {
        console.warn('GMV图表数据为空')
        return
      }
      
      console.log('更新GMV图表，数据点数:', this.realtimeTrendData.gmvData?.length)

      const optGMV = {
        grid: { top: 30, right: 10, bottom: 20, left: 60 },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: '#00c2c2',
          borderWidth: 1,
          textStyle: { color: '#fff' },
          axisPointer: {
            type: 'line',
            lineStyle: { color: '#00c2c2', width: 1 },
          },
          formatter: (params) => {
            if (!params || params.length === 0) return ''
            const param = params[0]
            const value = parseFloat(param.value || 0).toLocaleString('zh-CN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
            return `${param.name}<br/>GMV: <span style="color:#00c2c2;">¥${value}</span>`
          },
        },
        xAxis: {
          type: 'category',
          data: this.realtimeTrendData.timeLabels,
          axisLine: { lineStyle: { color: '#555' } },
          axisLabel: { color: '#aaa' },
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: '#333', type: 'dashed' } },
          axisLabel: { color: '#aaa' },
        },
        series: [
          {
            name: 'GMV',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            showSymbol: true,
            itemStyle: {
              color: '#00C2C2',
            },
            lineStyle: {
              width: 2,
              color: '#00C2C2',
            },
            emphasis: {
              itemStyle: {
                color: '#00C2C2',
                borderColor: '#fff',
                borderWidth: 2,
              },
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(0, 194, 194, 0.5)' },
                { offset: 1, color: 'rgba(0, 194, 194, 0.01)' },
              ]),
            },
            data: this.realtimeTrendData.gmvData || [],
          },
        ],
      }
      // notMerge: true 强制完全替换配置，不与旧配置合并
      this.chartGmvInstance.setOption(optGMV, { notMerge: true })
    },
    updateOrdersChart() {
      if (!this.chartOrdersInstance) {
        console.warn('订单量图表实例未初始化')
        return
      }
      if (!this.realtimeTrendData.timeLabels || this.realtimeTrendData.timeLabels.length === 0) {
        console.warn('订单量图表数据为空')
        return
      }
      
      console.log('更新订单量图表，数据点数:', this.realtimeTrendData.orderData?.length)

      const optOrders = {
        grid: { top: 30, right: 10, bottom: 20, left: 60 },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: '#00c2c2',
          borderWidth: 1,
          textStyle: { color: '#fff' },
          axisPointer: {
            type: 'line',
            lineStyle: { color: '#00c2c2', width: 1 },
          },
          formatter: (params) => {
            if (!params || params.length === 0) return ''
            const param = params[0]
            const value = parseInt(param.value || 0).toLocaleString('zh-CN')
            return `${param.name}<br/>订单量: <span style="color:#00c2c2;font-weight:bold;">${value} 单</span>`
          },
        },
        xAxis: {
          type: 'category',
          data: this.realtimeTrendData.timeLabels,
          axisLine: { lineStyle: { color: '#555' } },
          axisLabel: { color: '#aaa' },
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: '#333', type: 'dashed' } },
          axisLabel: { color: '#aaa' },
        },
        series: [
          {
            name: '订单量',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            showSymbol: true,
            itemStyle: {
              color: '#00C2C2',
            },
            lineStyle: {
              width: 2,
              color: '#00C2C2',
            },
            emphasis: {
              itemStyle: {
                color: '#00C2C2',
                borderColor: '#fff',
                borderWidth: 2,
              },
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(0, 194, 194, 0.5)' },
                { offset: 1, color: 'rgba(0, 194, 194, 0.01)' },
              ]),
            },
            data: this.realtimeTrendData.orderData || [],
          },
        ],
      }
      this.chartOrdersInstance.setOption(optOrders, { notMerge: true })
    },
    updateCharts() {
      if (!this.trendData.timeLabels || this.trendData.timeLabels.length === 0) {
        return
      }

      const commonOption = {
        grid: { top: 30, right: 10, bottom: 20, left: 60 },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: '#00c2c2',
          borderWidth: 1,
          textStyle: { color: '#fff' },
          axisPointer: {
            type: 'line',
            lineStyle: { color: '#00c2c2', width: 1 },
          },
        },
        xAxis: {
          type: 'category',
          data: this.trendData.timeLabels,
          axisLine: { lineStyle: { color: '#555' } },
          axisLabel: { color: '#aaa' },
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: '#333', type: 'dashed' } },
          axisLabel: { color: '#aaa' },
        },
      }

      // 订单量图表
      const optOrders = {
        ...commonOption,
        tooltip: {
          ...commonOption.tooltip,
          formatter: (params) => {
            if (!params || params.length === 0) return ''
            const param = params[0]
            const value = parseInt(param.value || 0).toLocaleString('zh-CN')
            return `<div style="font-weight:bold;margin-bottom:4px;">${param.name}</div>订单量: <span style="color:#00c2c2;font-weight:bold;">${value} 单</span>`
          },
        },
        series: [
          {
            name: '订单量',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            showSymbol: true,
            itemStyle: {
              color: '#00C2C2',
            },
            lineStyle: {
              width: 2,
              color: '#00C2C2',
            },
            emphasis: {
              itemStyle: {
                color: '#00C2C2',
                borderColor: '#fff',
                borderWidth: 2,
              },
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(0, 194, 194, 0.5)' },
                { offset: 1, color: 'rgba(0, 194, 194, 0.01)' },
              ]),
            },
            data: this.trendData.orderData || [],
          },
        ],
      }
      this.chartOrdersInstance.setOption(optOrders, { notMerge: true })
    },
    updateCardClickChart() {
      if (!this.chartPlatformInstance) {
        console.warn('商品卡片点击次数图表实例未初始化')
        return
      }
      if (!this.realtimeTrendData.timeLabels || this.realtimeTrendData.timeLabels.length === 0) {
        console.warn('商品卡片点击次数图表数据为空')
        return
      }
      
      console.log('更新商品卡片点击次数图表，数据点数:', this.realtimeTrendData.cardClickData?.length)

      const optCardClick = {
        grid: { top: 30, right: 10, bottom: 20, left: 60 },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: '#00c2c2',
          borderWidth: 1,
          textStyle: { color: '#fff' },
          axisPointer: {
            type: 'line',
            lineStyle: { color: '#00c2c2', width: 1 },
          },
          formatter: (params) => {
            if (!params || params.length === 0) return ''
            const param = params[0]
            const value = parseInt(param.value || 0).toLocaleString('zh-CN')
            return `${param.name}<br/>点击次数: <span style="color:#00c2c2;font-weight:bold;">${value} 次</span>`
          },
        },
        xAxis: {
          type: 'category',
          data: this.realtimeTrendData.timeLabels,
          axisLine: { lineStyle: { color: '#555' } },
          axisLabel: { color: '#aaa' },
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: '#333', type: 'dashed' } },
          axisLabel: { color: '#aaa' },
        },
        series: [
          {
            name: '点击次数',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            showSymbol: true,
            itemStyle: {
              color: '#00C2C2',
            },
            lineStyle: {
              width: 2,
              color: '#00C2C2',
            },
            emphasis: {
              itemStyle: {
                color: '#00C2C2',
                borderColor: '#fff',
                borderWidth: 2,
              },
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(0, 194, 194, 0.5)' },
                { offset: 1, color: 'rgba(0, 194, 194, 0.01)' },
              ]),
            },
            data: this.realtimeTrendData.cardClickData || [],
          },
        ],
      }
      this.chartPlatformInstance.setOption(optCardClick, { notMerge: true })
    },
    initResizeObserver() {
      // 创建 ResizeObserver 监听容器尺寸变化
      this.resizeObserver = new ResizeObserver((entries) => {
        // 使用防抖，避免频繁触发 resize
        if (this.resizeTimeout) {
          clearTimeout(this.resizeTimeout)
        }
        this.resizeTimeout = setTimeout(() => {
          this.handleResize()
        }, 100) // 100ms 防抖延迟
      })
      
      // 监听 dashboard-container 元素
      const container = this.$refs.screenStageRef
      if (container) {
        this.resizeObserver.observe(container)
      }
    },
    handleResize() {
      this.updateScreenScale()
      const instances = ['chartGmvInstance', 'chartOrdersInstance', 'chartPlatformInstance']
      instances.forEach(name => {
        if (this[name]) this[name].resize()
      })
    },
    formatNumber(num) {
      if (num === null || num === undefined) return '0.00'
      return parseFloat(num).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    },
    formatMetricValue(num) {
      if (num === null || num === undefined) return { integer: '0', decimal: '00' }
      const str = parseFloat(num).toFixed(2)
      const parts = str.split('.')
      return {
        integer: parseFloat(parts[0]).toLocaleString('zh-CN'),
        decimal: parts[1] || '00',
      }
    },
    formatDateToString(date) {
      // 将日期对象转换为 YYYY-MM-DD 格式字符串
      if (!date) return null
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
  },
}
</script>

<style scoped>
.screen-stage {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #031B18 url('@/assets/bg/dvd-bg.png') no-repeat center center;
  background-size: cover;
}

.screen-stage__viewport {
  width: 1920px;
  height: 1080px;
  flex-shrink: 0;
  transform-origin: center center;
  will-change: transform;
}

/* --- 全局样式 --- */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dashboard-container {
  background: #031B18 url('@/assets/bg/dvd-bg.png') no-repeat center center;
  background-size: cover;
  color: #fff;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0 10px 10px 10px;
  position: relative;
}

.dashboard-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 50% 0%, rgba(2, 94, 101, 0.2) 0%, transparent 50%),
    linear-gradient(rgba(2, 94, 101, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(2, 94, 101, 0.05) 1px, transparent 1px);
  background-size: 100% 100%, 40px 40px, 40px 40px;
  pointer-events: none;
  z-index: 0;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-thumb {
  background: #00c2c2;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #00e5e5;
}

::-webkit-scrollbar-track {
  background: rgba(0, 194, 194, 0.1);
  border-radius: 4px;
}

/* --- 头部 --- */
.header {
  height: 100px; /* 增加头部高度以容纳更大的标题 */
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 5px;
  background: transparent;
  overflow: visible;
}

/* 头部主体背景 (带异形轮廓) */
.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* 增强的深蓝到青绿渐变 */
  background: linear-gradient(180deg, 
    rgba(4, 13, 26, 0.9) 0%, 
    rgba(2, 94, 101, 0.7) 60%, 
    rgba(0, 242, 255, 0.2) 100%);
  /* 模拟图中复杂的梯形+横条结构 */
  clip-path: polygon(
    0 0, 100% 0, 
    100% 40%, 80% 40%, 75% 100%, 25% 100%, 20% 40%, 0 40%
  );
  border-top: 1px solid rgba(0, 242, 255, 0.4);
  box-shadow: inset 0 20px 30px rgba(4, 13, 26, 0.8);
  z-index: 1;
}


/* 两侧的连接线 */
.header-line-bottom::before,
.header-line-bottom::after {
  content: '';
  position: absolute;
  top: -24px;
  width: 60px;
  height: 2px;
  background: #00e5e5;
  box-shadow: 0 0 10px rgba(0, 229, 229, 0.5);
}

.header-line-bottom::before {
  left: -55px;
  transform: rotate(-50deg);
}

.header-line-bottom::after {
  right: -55px;
  transform: rotate(50deg);
}

/* 头部中央高亮光晕 */
.header-glow {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40%;
  height: 60px;
  background: radial-gradient(ellipse at center, 
    rgba(0, 229, 229, 0.15) 0%, 
    transparent 70%);
  pointer-events: none;
  z-index: 2;
}

.header-title {
  text-align: center;
  position: relative;
  z-index: 5;
  margin-top: -10px;
}

.header-title h1 {
  font-size: 52px; /* 增大标题字号 */
  letter-spacing: 12px;
  font-weight: 900;
  font-style: italic; /* 字体倾斜 */
  color: #ffffff;
  text-transform: uppercase;
  background: linear-gradient(180deg, #ffffff 40%, #00f2ff 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 12px rgba(0, 242, 255, 0.6));
  animation: titleGlow 3s ease-in-out infinite;
}

@keyframes titleGlow {
  0%, 100% { filter: drop-shadow(0 0 12px rgba(0, 242, 255, 0.6)); opacity: 1; }
  50% { filter: drop-shadow(0 0 25px rgba(0, 242, 255, 0.9)); opacity: 0.8; }
}

.header-time {
  font-size: 16px; /* 调大 */
  color: rgba(0, 242, 255, 0.9);
  margin-top: 5px;
  font-family: 'Courier New', Courier, monospace;
  font-style: italic; /* 字体倾斜 */
  letter-spacing: 2px;
}

.header-controls {
  position: absolute;
  right: 2%;
  top: 10px;
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 5;
}

.control-item {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  cursor: pointer;
}

.control-item::after {
  content: ' \2304';
  font-size: 14px;
}

/* 全屏按钮容器样式 */
.screenfull-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  padding: 4px 4px;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 3px;
  background: rgba(0, 194, 194, 0.1);
  border: 1px solid rgba(0, 194, 194, 0.3);
}

.screenfull-wrapper:hover {
  background: rgba(0, 194, 194, 0.2);
  border-color: rgba(0, 194, 194, 0.6);
  box-shadow: 0 0 8px rgba(0, 194, 194, 0.3);
}

.screenfull-wrapper :deep(svg) {
  fill: #00c2c2 !important;
  color: #00c2c2 !important;
  width: 16px;
  height: 16px;
  transition: all 0.3s;
}

.screenfull-wrapper:hover :deep(svg) {
  fill: #00e5e5 !important;
  color: #00e5e5 !important;
  transform: scale(1.05);
}

/* 时间选择器样式 */
.time-select-wrapper {
  margin: 0 10px;
}

.time-select-wrapper :deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(0, 194, 194, 0.5) !important;
  box-shadow: 0 0 8px rgba(0, 194, 194, 0.2) !important;
  transition: all 0.3s;
}

.time-select-wrapper :deep(.el-input__wrapper:hover) {
  border-color: #00c2c2 !important;
  box-shadow: 0 0 12px rgba(0, 194, 194, 0.4) !important;
  background-color: #ffffff !important;
}

.time-select-wrapper :deep(.el-input__inner) {
  color: #333 !important;
  font-size: 13px;
  font-weight: 500;
}

.time-select-wrapper :deep(.el-input__inner::placeholder) {
  color: #999 !important;
}

.time-select-wrapper :deep(.el-icon) {
  color: #00c2c2 !important;
}

/* 店铺选择器样式 */
.store-select-wrapper {
  width: 160px;
  margin: 0 10px;
}

.store-select-wrapper :deep(.el-select) {
  width: 100%;
}

.store-select-wrapper :deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(0, 194, 194, 0.5) !important;
  box-shadow: 0 0 8px rgba(0, 194, 194, 0.2) !important;
  transition: all 0.3s;
}

.store-select-wrapper :deep(.el-input__wrapper:hover) {
  border-color: #00c2c2 !important;
  box-shadow: 0 0 12px rgba(0, 194, 194, 0.4) !important;
  background-color: #ffffff !important;
}

.store-select-wrapper :deep(.el-input__inner) {
  color: #333 !important;
  font-size: 13px;
  font-weight: 500;
}

.store-select-wrapper :deep(.el-input__inner::placeholder) {
  color: #999 !important;
}

.store-select-wrapper :deep(.el-select__caret) {
  color: #00c2c2 !important;
}

/* 下拉面板样式 */
:deep(.el-select-dropdown) {
  background: linear-gradient(135deg, #034a4e 0%, #031B18 100%) !important;
  border: 1px solid #025E65 !important;
  box-shadow: 0 4px 20px rgba(2, 94, 101, 0.5) !important;
}

:deep(.el-select-dropdown__item) {
  color: #00c2c2 !important;
  font-size: 13px;
  transition: all 0.3s;
}

:deep(.el-select-dropdown__item:hover) {
  background-color: rgba(2, 94, 101, 0.4) !important;
  color: #00e5e5 !important;
}

:deep(.el-select-dropdown__item.selected) {
  color: #00e5e5 !important;
  font-weight: bold;
  background-color: rgba(2, 94, 101, 0.3) !important;
}

/* 日期选择器下拉面板样式 */
:deep(.el-picker-panel) {
  background: linear-gradient(135deg, #034a4e 0%, #031B18 100%) !important;
  border: 1px solid #025E65 !important;
  box-shadow: 0 4px 20px rgba(2, 94, 101, 0.5) !important;
}

:deep(.el-date-picker__header-label) {
  color: #00e5e5 !important;
}

:deep(.el-picker-panel__icon-btn) {
  color: #00c2c2 !important;
}

:deep(.el-picker-panel__icon-btn:hover) {
  color: #00e5e5 !important;
}

:deep(.el-date-table th) {
  color: #00c2c2 !important;
  border-bottom: 1px solid rgba(0, 194, 194, 0.2);
}

:deep(.el-date-table td) {
  color: #00c2c2 !important;
}

:deep(.el-date-table td.available:hover) {
  color: #00e5e5 !important;
  background-color: rgba(2, 94, 101, 0.3) !important;
}

:deep(.el-date-table td.current:not(.disabled)) {
  color: #000 !important;
  background-color: #00c2c2 !important;
  font-weight: bold;
}

:deep(.el-date-table td.today span) {
  color: #00e5e5 !important;
  font-weight: bold;
}

:deep(.el-date-table td.disabled) {
  color: rgba(255, 255, 255, 0.2) !important;
}

/* --- 主体内容 --- */
.main-content {
  flex: 1;
  display: flex;
  gap: 15px;
  overflow: hidden;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.col-left {
  width: 25%;
}

.col-center {
  width: 50%;
  gap: 10px; /* 减小中间列的垂直间距 */
}

.col-right {
  width: 25%;
}

/* --- 模块通用样式 --- */
.panel {
  background: linear-gradient(135deg, rgba(3, 27, 24, 0.8) 0%, rgba(3, 74, 78, 0.4) 100%);
  border: 1px solid rgba(2, 94, 101, 0.5);
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-shadow: 
    inset 0 0 20px rgba(2, 94, 101, 0.15),
    0 2px 10px rgba(0, 0, 0, 0.3);
}

/* 四角边框装饰 */
.panel::before,
.panel::after {
  content: '';
  position: absolute;
  width: 10px;
  height: 10px;
  border-color: #00c2c2;
  border-style: solid;
  transition: all 0.5s;
  pointer-events: none;
}

.panel::before {
  top: 0;
  left: 0;
  border-width: 2px 0 0 2px;
}

.panel::after {
  bottom: 0;
  right: 0;
  border-width: 0 2px 2px 0;
}

.panel:hover::before,
.panel:hover::after {
  width: 100%;
  height: 100%;
  opacity: 0.1;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  margin-bottom: 15px;
  height: 34px;
  /* 深蓝色渐变背景 + 细微拉丝纹理感 */
  background: linear-gradient(90deg, 
    rgba(2, 94, 101, 0.4) 0%, 
    rgba(2, 94, 101, 0.1) 80%,
    transparent 100%);
  position: relative;
  border-left: none; /* 移除之前的实线 */
}

/* 底部细线条装饰 */
.panel-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, rgba(0, 229, 229, 0.5), transparent);
}

.panel-title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 左侧蓝白渐变图标 (两个叠层条形块) */
.panel-icon {
  display: flex;
  align-items: center;
  gap: 3px;
}

.panel-icon::before,
.panel-icon::after {
  content: '';
  width: 4px;
  height: 14px;
  background: linear-gradient(180deg, #50c1ff 0%, #00e5e5 100%);
  transform: skewX(-20deg);
  display: block;
}

.panel-icon::after {
  opacity: 0.6;
  height: 10px;
}

.panel-title {
  font-size: 17px; /* 调大标题 */
  font-weight: 600;
  color: #fff;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  letter-spacing: 1px;
  font-style: normal; /* 保持稳重，不倾斜 */
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
}

/* 右侧信息提示图标 */
.info-icon {
  width: 16px; /* 稍微调大 */
  height: 16px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  cursor: help;
  margin-left: 4px;
  transition: all 0.3s;
}

.info-icon:hover {
  border-color: #00e5e5;
  color: #00e5e5;
  box-shadow: 0 0 8px rgba(0, 229, 229, 0.5);
}

/* 按钮组样式 */
.button-group {
  display: flex;
  gap: 8px;
  z-index: 10;
  position: relative;
}

.button-group button {
  font-size: 12px;
  padding: 4px 12px;
  cursor: pointer;
  background: rgba(0, 194, 194, 0.2);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 194, 194, 0.4);
  border-radius: 3px;
  transition: all 0.3s;
  outline: none;
  user-select: none;
  pointer-events: auto;
}

.button-group button:hover:not(.active) {
  background: rgba(0, 194, 194, 0.3);
  color: #fff;
  border-color: rgba(0, 194, 194, 0.6);
}

.button-group button.active {
  background: #00c2c2;
  color: #000;
  border-color: #00c2c2;
  font-weight: bold;
  box-shadow: 0 0 10px rgba(0, 194, 194, 0.5);
  pointer-events: auto;
  cursor: pointer;
}

.button-group button:active {
  transform: scale(0.95);
}

/* --- 表格样式 --- */
.table-container {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px; /* 整体调大表格字体，更易读 */
  color: #ccc;
}

.data-table th {
  text-align: left;
  padding: 10px 5px; /* 增加间距 */
  color: #00f2ff; /* 统一为亮青色 */
  border-bottom: 1px solid rgba(0, 242, 255, 0.3);
}

.data-table td {
  padding: 8px 5px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
}

.data-table tr:hover {
  background: rgba(0, 194, 194, 0.1);
}

.rank-top {
  color: #ffeb3b;
  font-weight: bold;
}

/* --- 中间区域 --- */
/* 核心指标 */
.key-metrics {
  width: 100%;
  height: 380px; /* 增加高度，使指标框更大 */
  margin-bottom: 10px;
  padding: 15px 20px;
  position: relative;
  display: flex;
  align-items: center;
}

.metrics-layout {
  display: flex;
  width: 100%;
  height: 100%;
  gap: 15px;
}

/* 通用指标卡片样式 */
.metric-card {
  background: rgba(4, 30, 46, 0.4);
  border: 1px solid rgba(0, 242, 255, 0.3);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 15px;
  backdrop-filter: blur(4px);
}

/* 四角装饰 */
.card-corner {
  position: absolute;
  width: 10px; /* 调大一点 */
  height: 10px;
  border-color: #00f2ff;
  border-style: solid;
}

.card-corner.tl { top: -1px; left: -1px; border-width: 3px 0 0 3px; }
.card-corner.tr { top: -1px; right: -1px; border-width: 3px 3px 0 0; }
.card-corner.bl { bottom: -1px; left: -1px; border-width: 0 0 3px 3px; }
.card-corner.br { bottom: -1px; right: -1px; border-width: 0 3px 3px 0; }

/* 左侧大卡片 */
.large-card {
  width: 32%;
  height: 100%;
  padding: 30px 20px;
  border-radius: 4px;
  justify-content: space-evenly; /* 改为均匀分布，更对称 */
  gap: 0; /* 去掉固定间距，让 space-evenly 自动处理 */
}

.large-card .metric-label {
  font-size: 24px;
  color: #fff;
  font-weight: bold;
  text-align: center;
  margin-bottom: 8px;
}

.large-card .metric-value-main {
  font-size: 78px;
  font-weight: 900;
  font-style: italic;
  text-align: center;
  line-height: 1;
  background: linear-gradient(180deg, #ffffff 40%, #00f2ff 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 15px rgba(0, 242, 255, 0.6));
  animation: valueGlow 2s ease-in-out infinite;
  margin-bottom: 8px;
}

/* 大卡片专用光条间距 */
.large-card .metric-glow-bar {
  margin: 12px auto;
  width: 85%;
  height: 3px; /* 加粗光条，使其更明显 */
}

.large-card .metric-label.sub-label {
  font-size: 18px;
  margin-top: 0;
  margin-bottom: 8px;
  opacity: 0.9;
  text-align: center;
}

.large-card .metric-value-sub {
  font-size: 42px;
  font-weight: bold;
  text-align: center;
  color: #fff;
  background: linear-gradient(180deg, #ffffff 40%, #00f2ff 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  justify-content: center;
  align-items: baseline;
  animation: valueGlow 2s ease-in-out infinite;
  margin-bottom: 8px;
}

.large-card .metric-value-sub .currency {
  font-size: 20px;
  margin-right: 5px;
}

.large-card .metric-value-sub .decimal {
  font-size: 26px;
}

@keyframes valueGlow {
  0%, 100% { filter: drop-shadow(0 0 10px rgba(0, 242, 255, 0.4)); opacity: 1; }
  50% { filter: drop-shadow(0 0 20px rgba(0, 242, 255, 0.8)); opacity: 0.85; }
}

/* 右侧面板 */
.metrics-right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.metrics-header-info {
  display: flex;
  justify-content: flex-end;
  padding-bottom: 5px;
}

.datetime-display {
  text-align: right;
  font-family: 'Arial', sans-serif;
}

.datetime-display .date {
  font-size: 32px;
  font-weight: bold;
  color: #fff;
}

.datetime-display .time {
  font-size: 20px;
  color: #fff;
  opacity: 0.9;
}

.small-cards-container {
  display: flex;
  gap: 12px;
  flex: 1;
}

/* 小卡片 */
.small-card {
  flex: 1;
  height: 100%;
  padding: 15px 5px;
  text-align: center;
}

.small-card .metric-label {
  font-size: 18px;
  color: #fff;
  font-weight: bold;
  opacity: 1;
}

.small-card .metric-value-main {
  font-size: 42px;
  font-weight: 900;
  font-style: italic;
  background: linear-gradient(180deg, #ffffff 40%, #00f2ff 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 10px rgba(0, 242, 255, 0.4));
  margin: 12px 0;
  animation: valueGlow 2s ease-in-out infinite;
}

.small-card .metric-value-main .decimal {
  font-size: 24px;
}

/* 闪动光条效果 */
.metric-glow-bar {
  width: 90%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00f2ff, transparent);
  box-shadow: 0 0 15px #00f2ff, 0 0 30px rgba(0, 242, 255, 0.6);
  margin: 10px auto;
  opacity: 0.9;
  position: relative;
  overflow: hidden;
  border-radius: 2px;
  animation: barPulse 2s ease-in-out infinite;
}

@keyframes barPulse {
  0%, 100% { opacity: 0.7; transform: scaleX(0.95); box-shadow: 0 0 10px #00f2ff, 0 0 20px rgba(0, 242, 255, 0.4); }
  50% { opacity: 1; transform: scaleX(1); box-shadow: 0 0 20px #00f2ff, 0 0 40px rgba(0, 242, 255, 0.8); }
}

.metric-glow-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.9), transparent);
  animation: barScan 2.5s ease-in-out infinite;
}

@keyframes barScan {
  0% { left: -100%; }
  50% { left: 100%; }
  100% { left: 100%; }
}

.metric-footer {
  font-size: 12px;
  color: rgba(0, 242, 255, 0.8);
  text-align: center;
}

/* 地图容器 */
#map-container {
  flex: 2;
  width: 100%;
  position: relative;
  background: rgba(6, 17, 39, 0.5);
  border: 1px solid rgba(0, 194, 194, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
}

.map-placeholder {
  color: #666;
  font-size: 18px;
}

.map-tip {
  text-align: center;
}

/* 底部订单 */
.bottom-orders {
  flex: 1; /* 进一步缩小订单区域空间 */
  min-height: 0;
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow: hidden;
}

.bottom-orders .table-container {
  flex: 1;
  overflow-y: auto !important;
  overflow-x: hidden;
  min-height: 0;
  max-height: 100%;
  position: relative;
  z-index: 1;
}

.bottom-orders .order-table-wrapper {
  pointer-events: auto !important;
  touch-action: pan-y;
}

.bottom-orders .data-table {
  table-layout: fixed;
  pointer-events: auto;
}

/* SKU销售数据 */
.sku-sales-panel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow: hidden;
}

.sku-sales-panel .table-container {
  flex: 1;
  overflow-y: auto !important;
  overflow-x: hidden;
  min-height: 0;
  max-height: 100%;
  position: relative;
  z-index: 1;
}

.sku-sales-panel .sku-table-wrapper {
  pointer-events: auto !important;
  touch-action: pan-y;
}

.sku-sales-panel .data-table {
  table-layout: fixed;
  pointer-events: auto;
}

/* --- 右侧图表 --- */
.chart-box {
  flex: 1;
  width: 100%;
  min-height: 150px;
  position: relative;
  z-index: 1;
}
</style>

<style>
body.qf-immersive-mode .sidebar-container,
body.qf-immersive-mode .fixed-header,
body.qf-immersive-mode .copyright {
  display: none !important;
}

body.qf-immersive-mode .main-container {
  margin-left: 0 !important;
}

body.qf-immersive-mode .app-main,
body.qf-immersive-mode .fixed-header + .app-main {
  margin-top: 0 !important;
  height: 100vh !important;
  min-height: 100vh !important;
  padding: 0 !important;
}

body.qf-immersive-mode .screen-stage {
  height: 100vh !important;
}

body.qf-immersive-mode .dashboard-container {
  height: 1080px !important;
}

</style>
