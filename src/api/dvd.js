import request from '@/utils/request'

// 获取大屏所有数据
export function getAllDashboardData(query) {
  return request({
    url: '/dvd/dashboard/all',
    method: 'get',
    params: query
  })
}

// 获取大屏核心指标
export function getDashboardMetrics(query) {
  return request({
    url: '/dvd/dashboard/metrics',
    method: 'get',
    params: query
  })
}

// 获取店铺销售排行
export function getStoreSalesRank(query) {
  return request({
    url: '/dvd/dashboard/store-rank',
    method: 'get',
    params: query
  })
}

// 获取渠道销售数据
export function getChannelSalesData(query) {
  return request({
    url: '/dvd/dashboard/channel-data',
    method: 'get',
    params: query
  })
}

// 获取最近订单
export function getRecentOrders(query) {
  return request({
    url: '/dvd/dashboard/recent-orders',
    method: 'get',
    params: query
  })
}

// 获取趋势数据
export function getTrendData(query) {
  return request({
    url: '/dvd/dashboard/trend-data',
    method: 'get',
    params: query
  })
}

// 获取店铺列表
export function getStoreList() {
  return request({
    url: '/dvd/qf/dashboard/store-list',
    method: 'get'
  })
}

// 获取实时指标
export function getRealtimeMetrics(query) {
  return request({
    url: '/dvd/qf/dashboard/realtime-metrics',
    method: 'get',
    params: query
  })
}

// 获取实时 GMV 趋势
export function getRealtimeTrend(query) {
  return request({
    url: '/dvd/qf/dashboard/realtime-trend',
    method: 'get',
    params: query
  })
}

// 获取热销店铺 TOP10
export function getTopStores(query) {
  return request({
    url: '/dvd/qf/dashboard/top-stores',
    method: 'get',
    params: query
  })
}

// 获取实时订单
export function getRealtimeOrders(query) {
  return request({
    url: '/dvd/qf/dashboard/realtime-orders',
    method: 'get',
    params: query
  })
}

// 获取 SKU 销售数据
export function getSkuSalesData(query) {
  return request({
    url: '/dvd/qf/dashboard/sku-sales-data',
    method: 'get',
    params: query
  })
}

// ========== 抖店相关接口 ==========

// 获取抖店店铺列表
export function getDdStoreList() {
  return request({
    url: '/dvd/dd/dashboard/store-list',
    method: 'get'
  })
}

// 获取抖店店铺
export function getDdStore(query) {
  return request({
    url: '/dvd/dd/dashboard/real-time/store',
    method: 'get',
    params: query
  })
}

// 获取抖店概览指标
export function getDdOverviewMetrics(query) {
  return request({
    url: '/dvd/dd/dashboard/real-time/overview-metrics',
    method: 'get',
    params: query
  })
}

// 获取抖店今日小时趋势
export function getDdHourlyTrend(query) {
  return request({
    url: '/dvd/dd/dashboard/real-time/hourly-trend',
    method: 'get',
    params: query
  })
}

// 获取地图地理聚合订单数据
export function getDdGeoOrderStats(query) {
  return request({
    url: '/dvd/dd/dashboard/geo-order-stats',
    method: 'get',
    params: query
  })
}

// 获取抖店每日概览指标
export function getDdDailyOverviewMetrics(query) {
  return request({
    url: '/dvd/dd/dashboard/daily/overview-metrics',
    method: 'get',
    params: query
  })
}

// 获取抖店每日订单列表
export function getDdDailyOrderList(query) {
  return request({
    url: '/dvd/dd/dashboard/daily/order-list',
    method: 'get',
    params: query
  })
}

// 获取商品曝光点击流量每日趋势
export function getDdTrafficTrend(query) {
  return request({
    url: '/dvd/dd/dashboard/daily/traffic-trend',
    method: 'get',
    params: query
  })
}

// 获取账户余额与保证金数据
export function getDdAccountBalance(query) {
  return request({
    url: '/dvd/dd/dashboard/account-balance',
    method: 'get',
    params: query
  })
}

// 获取商品类目销售占比
export function getDdCategoryStats(query) {
  return request({
    url: '/dvd/dd/dashboard/category-stats',
    method: 'get',
    params: query
  })
}

// ========== 闲鱼相关接口 ==========

// 获取闲鱼店铺列表
export function getXgjStoreList() {
  return request({
    url: '/dvd/xgj/dashboard/store-list',
    method: 'get'
  })
}

// 获取闲鱼经营核心指标
export function getXgjOverviewMetrics(query) {
  return request({
    url: '/dvd/xgj/dashboard/overview-metrics',
    method: 'get',
    params: query
  })
}

// 获取闲鱼支付订单数小时走势图
export function getXgjPayOrderTrend(query) {
  return request({
    url: '/dvd/xgj/dashboard/pay-order-trend',
    method: 'get',
    params: query
  })
}

// 获取闲鱼经营数据日维度分析
export function getXgjDailyOrderAnalysis(query) {
  return request({
    url: '/dvd/xgj/dashboard/daily-order-analysis',
    method: 'get',
    params: query
  })
}

// 获取闲鱼商品状态分布
export function getXgjProductStatusDistribution(query) {
  return request({
    url: '/dvd/xgj/dashboard/product-status-distribution',
    method: 'get',
    params: query
  })
}

// 获取闲鱼 Top 店铺排行
export function getXgjTopStoreRanking(query) {
  return request({
    url: '/dvd/xgj/dashboard/top-store-ranking',
    method: 'get',
    params: query
  })
}

// 获取闲鱼售后预警与监控摘要
export function getXgjOrderRiskSummary(query) {
  return request({
    url: '/dvd/xgj/dashboard/order-risk-summary',
    method: 'get',
    params: query
  })
}

// 获取闲鱼店铺订单流转数据
export function getXgjShopOrderFlow(query) {
  return request({
    url: '/dvd/xgj/dashboard/shop-order-flow',
    method: 'get',
    params: query
  })
}
