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

// 获取实时指标 (GMV, 订单量, 商品访问量等)
export function getRealtimeMetrics(query) {
  return request({
    url: '/dvd/qf/dashboard/realtime-metrics',
    method: 'get',
    params: query
  })
}

// 获取实时GMV走势
export function getRealtimeTrend(query) {
  return request({
    url: '/dvd/qf/dashboard/realtime-trend',
    method: 'get',
    params: query
  })
}

// 获取热销店铺TOP10
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

// 获取SKU销售数据
export function getSkuSalesData(query) {
  return request({
    url: '/dvd/qf/dashboard/sku-sales-data',
    method: 'get',
    params: query
  })
}

