<template>
  <div class="dashboard-container">
    <!-- 头部 -->
    <div class="header">
      <div class="header-title">
        <h1>实时数据大屏</h1>
        <div class="header-time">{{ currentTime }}</div>
      </div>
      <div class="header-controls">
        <span class="control-item">UTC+8</span>
        <span class="control-item">CNY</span>
        <span class="control-item">全部订单</span>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="main-content">
      <!-- 左侧 -->
      <div class="column col-left">
        <!-- 热销店铺 -->
        <div class="panel">
          <div class="panel-header">
            <span class="panel-title">热销店铺 TOP10</span>
            <div class="tabs">
              <span :class="{ active: storeTab === 'orders' }" @click="storeTab = 'orders'">按订单量</span>
              <span :class="{ active: storeTab === 'sales' }" @click="storeTab = 'sales'">按销售额</span>
            </div>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>排名</th>
                  <th>店铺</th>
                  <th>订单量</th>
                  <th>销售额(¥)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in sortedStoreRank" :key="item.rank">
                  <td><span :class="{ 'rank-top': item.rank <= 3 }">{{ item.rank }}</span></td>
                  <td>{{ item.storeName }}</td>
                  <td>{{ item.orderCount }}</td>
                  <td>{{ formatNumber(item.salesAmount) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 渠道商品 -->
        <div class="panel">
          <div class="panel-header">
            <span class="panel-title">渠道商品数据</span>
            <div class="tabs">
              <span :class="{ active: channelTab === 'sales' }" @click="channelTab = 'sales'">按销量</span>
              <span :class="{ active: channelTab === 'amount' }" @click="channelTab = 'amount'">按销售额</span>
            </div>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>渠道</th>
                  <th>销量</th>
                  <th>销售额(¥)</th>
                  <th>均价(¥)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in sortedChannelData" :key="item.channelName">
                  <td>{{ item.channelName }}</td>
                  <td>{{ item.salesCount }}</td>
                  <td>{{ formatNumber(item.salesAmount) }}</td>
                  <td>{{ formatNumber(item.avgPrice) }}</td>
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
          <div class="metric-item">
            <div class="metric-label">订单量</div>
            <div class="metric-value">{{ dashboardMetrics.totalOrders || 0 }}</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">销售额 (¥)</div>
            <div class="metric-value">
              {{ formatMetricValue(dashboardMetrics.totalGmv).integer
              }}<span class="metric-unit">.{{ formatMetricValue(dashboardMetrics.totalGmv).decimal }}</span>
            </div>
          </div>
        </div>

        <!-- 地图容器 (暂不处理) -->
        <div id="map-container" class="map-placeholder">
          <div class="map-tip">地图功能开发中...</div>
        </div>

        <!-- 底部订单 -->
        <div class="panel bottom-orders">
          <div class="panel-header">
            <span class="panel-title">实时订单</span>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>店铺名称</th>
                  <th>渠道</th>
                  <th>下单金额(¥)</th>
                  <th>下单时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(order, index) in recentOrders" :key="index">
                  <td>{{ order.storeName }}</td>
                  <td>{{ order.channel }}</td>
                  <td style="color: #00c2c2">{{ formatNumber(order.orderAmount) }}</td>
                  <td>{{ order.orderTime }}</td>
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
          <div class="panel-header"><span class="panel-title">GMV 走势图 (¥)</span></div>
          <div ref="chartGmv" class="chart-box"></div>
        </div>

        <!-- 订单量走势图 -->
        <div class="panel">
          <div class="panel-header"><span class="panel-title">订单量走势图</span></div>
          <div ref="chartOrders" class="chart-box"></div>
        </div>

        <!-- 渠道走势图 -->
        <div class="panel">
          <div class="panel-header"><span class="panel-title">渠道走势图</span></div>
          <div ref="chartPlatform" class="chart-box"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getAllDashboardData } from '@/api/dvd'

export default {
  name: 'DvdDashboard',
  data() {
    return {
      currentTime: '',
      dashboardMetrics: {},
      storeRank: [],
      channelData: [],
      recentOrders: [],
      trendData: {},
      storeTab: 'orders',
      channelTab: 'sales',
      chartGmvInstance: null,
      chartOrdersInstance: null,
      chartPlatformInstance: null,
      refreshTimer: null,
    }
  },
  computed: {
    sortedStoreRank() {
      const data = [...this.storeRank]
      if (this.storeTab === 'orders') {
        return data.sort((a, b) => b.orderCount - a.orderCount).map((item, index) => ({
          ...item,
          rank: index + 1,
        }))
      } else {
        return data.sort((a, b) => b.salesAmount - a.salesAmount).map((item, index) => ({
          ...item,
          rank: index + 1,
        }))
      }
    },
    sortedChannelData() {
      const data = [...this.channelData]
      if (this.channelTab === 'sales') {
        return data.sort((a, b) => b.salesCount - a.salesCount)
      } else {
        return data.sort((a, b) => b.salesAmount - a.salesAmount)
      }
    },
  },
  mounted() {
    this.updateTime()
    setInterval(this.updateTime, 1000)

    // 初始化图表
    this.initCharts()

    // 加载数据
    this.loadAllData()

    // 定时刷新数据（每30秒）
    this.refreshTimer = setInterval(() => {
      this.loadAllData()
    }, 30000)

    // 窗口大小改变自适应
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
    window.removeEventListener('resize', this.handleResize)
    if (this.chartGmvInstance) this.chartGmvInstance.dispose()
    if (this.chartOrdersInstance) this.chartOrdersInstance.dispose()
    if (this.chartPlatformInstance) this.chartPlatformInstance.dispose()
  },
  methods: {
    updateTime() {
      const now = new Date()
      this.currentTime = now.toLocaleString('zh-CN', { hour12: false })
    },
    async loadAllData() {
      try {
        const { data } = await getAllDashboardData()
        if (data && data.code === 200) {
          this.dashboardMetrics = data.data.metrics || {}
          this.storeRank = data.data.storeRank || []
          this.channelData = data.data.channelData || []
          this.recentOrders = data.data.recentOrders || []
          this.trendData = data.data.trendData || {}

          // 更新图表
          this.updateCharts()
        }
      } catch (error) {
        console.error('加载数据失败:', error)
      }
    },
    initCharts() {
      this.chartGmvInstance = echarts.init(this.$refs.chartGmv)
      this.chartOrdersInstance = echarts.init(this.$refs.chartOrders)
      this.chartPlatformInstance = echarts.init(this.$refs.chartPlatform)
    },
    updateCharts() {
      if (!this.trendData.timeLabels || this.trendData.timeLabels.length === 0) {
        return
      }

      const commonOption = {
        grid: { top: 30, right: 10, bottom: 20, left: 40 },
        tooltip: { trigger: 'axis' },
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

      // GMV 图表
      const optGMV = {
        ...commonOption,
        series: [
          {
            type: 'line',
            smooth: true,
            symbol: 'none',
            itemStyle: { color: '#00C2C2' },
            lineStyle: { width: 2 },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(0, 194, 194, 0.5)' },
                { offset: 1, color: 'rgba(0, 194, 194, 0.01)' },
              ]),
            },
            data: this.trendData.gmvData || [],
          },
        ],
      }
      this.chartGmvInstance.setOption(optGMV)

      // 订单量图表
      const optOrders = {
        ...commonOption,
        series: [
          {
            type: 'line',
            smooth: true,
            symbol: 'none',
            itemStyle: { color: '#00C2C2' },
            lineStyle: { width: 2 },
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
      this.chartOrdersInstance.setOption(optOrders)

      // 渠道走势图
      const optPlatform = {
        ...commonOption,
        legend: {
          data: ['笔记', '直播', '商卡'],
          right: 0,
          textStyle: { color: '#fff' },
        },
        series: [
          {
            name: '笔记',
            type: 'line',
            smooth: true,
            symbol: 'none',
            itemStyle: { color: '#00C2C2' },
            lineStyle: { width: 2 },
            data: this.trendData.noteData || [],
          },
          {
            name: '直播',
            type: 'line',
            smooth: true,
            symbol: 'none',
            itemStyle: { color: '#ff6b6b' },
            lineStyle: { width: 2 },
            data: this.trendData.liveData || [],
          },
          {
            name: '商卡',
            type: 'line',
            smooth: true,
            symbol: 'none',
            itemStyle: { color: '#ffd93d' },
            lineStyle: { width: 2 },
            data: this.trendData.cardData || [],
          },
        ],
      }
      this.chartPlatformInstance.setOption(optPlatform)
    },
    handleResize() {
      if (this.chartGmvInstance) this.chartGmvInstance.resize()
      if (this.chartOrdersInstance) this.chartOrdersInstance.resize()
      if (this.chartPlatformInstance) this.chartPlatformInstance.resize()
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
  },
}
</script>

<style scoped>
/* --- 全局样式 --- */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dashboard-container {
  background-color: #060b18;
  color: #fff;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0 10px 10px 10px;
  /* 背景网格纹理 */
  background-image: linear-gradient(rgba(0, 194, 194, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 194, 194, 0.05) 1px, transparent 1px);
  background-size: 30px 30px;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
::-webkit-scrollbar-thumb {
  background: #00c2c2;
  border-radius: 2px;
}
::-webkit-scrollbar-track {
  background: transparent;
}

/* --- 头部 --- */
.header {
  height: 80px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  background: rgba(0, 194, 194, 0.1);
  border: 1px solid rgba(0, 194, 194, 0.3);
}

.header-title {
  text-align: center;
}

.header-title h1 {
  font-size: 32px;
  letter-spacing: 5px;
  text-shadow: 0 0 10px #00c2c2;
  color: #fff;
}

.header-time {
  font-size: 14px;
  color: #00c2c2;
  margin-top: 5px;
}

.header-controls {
  position: absolute;
  right: 20px;
  top: 30px;
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #aebfd6;
}

.control-item {
  cursor: pointer;
  display: flex;
  align-items: center;
}
.control-item::after {
  content: '▼';
  font-size: 8px;
  margin-left: 4px;
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
}
.col-right {
  width: 25%;
}

/* --- 模块通用样式 --- */
.panel {
  background: rgba(6, 17, 39, 0.7);
  border: 1px solid rgba(0, 194, 194, 0.3);
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-shadow: inset 0 0 20px rgba(0, 194, 194, 0.1);
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
  border-left: 4px solid #00c2c2;
  padding-left: 10px;
  margin-bottom: 10px;
  height: 30px;
  background: linear-gradient(90deg, rgba(0, 194, 194, 0.2) 0%, transparent 100%);
}

.panel-title {
  font-size: 16px;
  font-weight: bold;
  font-style: italic;
  color: #fff;
}

.tabs span {
  font-size: 12px;
  padding: 2px 8px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.6);
}
.tabs span.active {
  background: #00c2c2;
  color: #000;
  border-radius: 2px;
}

/* --- 表格样式 --- */
.table-container {
  overflow-y: auto;
  flex: 1;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  color: #ccc;
}
.data-table th {
  text-align: left;
  padding: 8px 5px;
  color: #00c2c2;
  border-bottom: 1px solid rgba(0, 194, 194, 0.3);
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
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 10px 0;
  background: rgba(0, 194, 194, 0.05);
  border: 1px solid rgba(0, 194, 194, 0.2);
}
.metric-item {
  text-align: center;
}
.metric-label {
  font-size: 14px;
  color: #aebfd6;
}
.metric-value {
  font-size: 36px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 10px #00c2c2;
}
.metric-unit {
  font-size: 14px;
  color: #00c2c2;
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
  flex: 1;
  overflow-y: auto;
}

/* --- 右侧图表 --- */
.chart-box {
  flex: 1;
  width: 100%;
  min-height: 150px;
}
</style>
