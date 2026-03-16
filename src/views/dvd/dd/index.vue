<template>
  <div class="dvd-wrapper">
    <div class="head clearfix">
      <h1 class="">抖店数据大屏</h1>
      <div class="head-controls">
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
          <el-select
            v-model="selectedStore"
            placeholder="选择店铺"
            size="small"
            clearable
            style="width: 160px"
            @change="handleFilterChange"
          >
            <el-option label="全部店铺" :value="null" />
            <el-option
              v-for="(store, index) in storeList"
              :key="index"
              :label="store.storeName"
              :value="store.storeId"
            />
          </el-select>
        </div>
      </div>
    </div>
    <div class="mainbox">
      <ul class="clearfix nav1">
        <li style="width: 26%" class="col-left">
          <div class="box overview-box">
            <div class="tit"><span>当日情况</span><p></p></div>
            <div class="boxnav">
              <ul class="drqk clearfix">
                <li>
                  <div class="icon"><img src="./images/icona.png"></div>
                  <div>
                    <span>用户支付金额</span>
                    <p><em>{{ fmtNum(overviewMetrics.payAmt, 2) }}</em><i>元</i></p>
                  </div>
                </li>
                <li>
                  <div class="icon"><img src="./images/iconb.png"></div>
                  <div>
                    <span>成交订单数</span>
                    <p><em>{{ fmtNum(overviewMetrics.payCnt) }}</em><i>单</i></p>
                  </div>
                </li>
                <li>
                  <div class="icon"><img src="./images/iconc.png"></div>
                  <div>
                    <span>商品曝光人数</span>
                    <p><em>{{ fmtNum(overviewMetrics.productShowUcnt) }}</em><i>人次</i></p>
                  </div>
                </li>
                <li>
                  <div class="icon"><img src="./images/icond.png"></div>
                  <div>
                    <span>退款订单数</span>
                    <p><em>{{ fmtNum(overviewMetrics.refundOrderCntPayTime) }}</em><i>单</i></p>
                  </div>
                </li>
                <li>
                  <div class="icon"><img src="./images/icone.png"></div>
                  <div>
                    <span>客单价</span>
                    <p><em>{{ fmtNum(overviewMetrics.perUsrPayAmt, 2) }}</em><i>元</i></p>
                  </div>
                </li>
                <li>
                  <div class="icon"><img src="./images/iconf.png"></div>
                  <div>
                    <span>转化率</span>
                    <p><em>{{ overviewMetrics.conversionRate ?? '0.00' }}</em><i>%</i></p>
                  </div>
                </li>

                <li>
                  <div class="icon"><img src="./images/iconf.png"></div>
                  <div>
                    <span>保证金</span>
                    <p><em>{{ fmtNum(accountBalance.marginAmount, 2) }}</em><i>元</i></p>
                  </div>
                </li>
                <li>
                  <div class="icon"><img src="./images/iconf.png"></div>
                  <div>
                    <span>总金额</span>
                    <p><em>{{ fmtNum(accountBalance.balance, 2) }}</em><i>元</i></p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div class="box rose-box">
            <div class="tit"><span>类目销售占比</span><p></p></div>
            <div class="rose-charts-wrap">
              <div class="rose-item">
                <div id="roseChart1" class="rose-chart-dom"></div>
              </div>
              <div class="rose-item">
                <div id="roseChart2" class="rose-chart-dom"></div>
              </div>
            </div>
          </div>

        </li>
        <li style="width:48%" class="traffic-col">
          <div class="box map-box" style="position: relative">
            <div class="" id="map" style="width: 100%; position: relative; z-index: 100">
              
            </div>
            <div class="back-btn" v-show="parentInfo.length > 1" @click="goBack">返 回</div>
            <div class="toggle-btn" @click="toggleMapMode">
              {{ mapMode === 'amount' ? '销售额(元)' : '订单数(条)' }}
            </div>
            <div class="map">
              <div class="map1"><img src="./images/lbx.png"></div>
              <div class="map2"><img src="./images/jt.png"></div>
              <div class="map3"><img src="./images/map.png"></div>

            </div>
          </div>
            <div class="box traffic-box">
              <div class="tit"><span>流量趋势</span><p></p></div>
              <div id="trafficTrendChart" class="traffic-chart-dom"></div>
            </div>
        </li>
        <li style="width: 26%" class="order-col">
          <div class="box order-box">
            <div class="tit"><span>订单信息</span><p></p></div>
            <div class="order-scroll-wrap" @scroll="handleOrderScroll">
              <div
                v-for="order in orderList"
                :key="order.id"
                class="order-card"
                @click="openOrderDetail(order.orderDetailUrl)"
              >
                <!-- 第一行：订单号 + 状态 -->
                <div class="order-card-row order-card-top">
                  <span class="order-no">{{ order.shopOrderId }}</span>
                  <span :class="['order-status', getOrderStatusClass(order.orderStatusText)]">
                    {{ order.orderStatusText || '—' }}
                  </span>
                </div>
                <!-- 第二行：店铺名 -->
                <div class="order-card-row">
                  <span class="order-store-name">{{ order.storeName || '—' }}</span>
                </div>
                <!-- 第三行：商品名称 -->
                <div class="order-card-row">
                  <span class="order-product" :title="order.productName">
                    {{ order.productName || '—' }}
                  </span>
                </div>
                <!-- 第四行：规格 + 数量 -->
                <div class="order-card-row order-card-sku">
                  <span class="order-sku" :title="order.skuSpec">{{ order.skuSpec || '—' }}</span>
                  <span class="order-count">×{{ order.totalProductCount ?? 1 }}</span>
                </div>
                <!-- 第五行：金额 + 下单时间 -->
                <div class="order-card-row order-card-bottom">
                  <span class="order-amount">¥{{ Number(order.actualPayAmount ?? 0).toFixed(2) }}</span>
                  <span class="order-time">{{ formatOrderTime(order.createTime) }}</span>
                </div>
              </div>
              <div v-if="orderLoading" class="order-tip">加载中...</div>
              <div v-else-if="orderNoMore && orderList.length > 0" class="order-tip">— 已加载全部 —</div>
              <div v-else-if="!orderLoading && orderList.length === 0" class="order-tip">暂无订单数据</div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import mapJson from './js/china.json';
import * as echarts from 'echarts';
import { getDdGeoOrderStats, getDdStoreList, getDdDailyOrderList, getDdDailyOverviewMetrics, getDdCategoryStats, getDdTrafficTrend, getDdAccountBalance } from '@/api/dvd';
let timer = null;
let charts = [];

// 地图下钻状态
// let parentInfo = [{ cityName: '全国', code: 100000 }];
const parentInfo = ref([{ cityName: '全国', code: 100000 }]);
let geoJson = {};
let mapChart = null;

// 地图展示模式：'amount' 销售额(元) | 'orders' 订单数(条)
const mapMode = ref('amount');
// 地理统计数据缓存（以地区名为 key）
let geoStatsMap = {};

// 切换地图展示模式并重新渲染
const toggleMapMode = () => {
  mapMode.value = mapMode.value === 'amount' ? 'orders' : 'amount';
  renderMap();
};

// ==================== 筛选条件 ====================
// 日期范围：[startDate, endDate]，格式 'YYYY-MM-DD'
const initDate = () => {
  const dt = new Date();
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};
const todayStr = initDate();
const selectedDateRange = ref([todayStr, todayStr]);
// 当前选中的店铺 ID
const selectedStore = ref(null);
// 店铺列表
const storeList = ref([]);

// 加载店铺列表
const loadStoreList = async () => {
  try {
    const res = await getDdStoreList();
    if (res && res.data && Array.isArray(res.data)) {
      storeList.value = res.data;
    }
  } catch (e) {
    console.warn('加载店铺列表失败', e);
  }
};

// 筛选条件变化时重新拉取地图数据 + 订单列表 + 概览指标 + 类目占比
const handleFilterChange = () => {
  // 下钻状态重置到全国，避免筛选后层级混乱
  parentInfo.value = [{ cityName: '全国', code: 100000 }];
  init(100000);
  loadOrderList(true);
  loadOverviewMetrics();
  loadAccountBalance();
  loadCategoryStats();
  loadTrafficTrend();
};

// ==================== 当日情况概览指标 ====================
const overviewMetrics = ref({});

// 格式化大数字（千分位）
const fmtNum = (val, decimals = 0) => {
  const n = Number(val ?? 0);
  return n.toLocaleString('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

// 获取概览指标数据；接口 start_date/end_date 必填，未选日期默认传今天
const loadOverviewMetrics = async () => {
  try {
    let startDate, endDate;
    if (selectedDateRange.value && selectedDateRange.value.length === 2) {
      startDate = selectedDateRange.value[0];
      endDate = selectedDateRange.value[1];
    }
    const params = {};
    if (startDate && endDate) {
      params.start_date = startDate;
      params.end_date = endDate;
    }
    if (selectedStore.value) params.store_id = selectedStore.value;

    const res = await getDdDailyOverviewMetrics(params);
    if (res && res.data) {
      const d = res.data;
      // 转化率：前端自算 = 成交订单数 / 点击人数 × 100，后端无此直接字段
      const conversionRate = d.productClickUcnt > 0
        ? ((d.payCnt / d.productClickUcnt) * 100).toFixed(2)
        : '0.00';
      overviewMetrics.value = { ...d, conversionRate };
    }
  } catch (e) {
    console.warn('加载概览指标失败', e);
  }
};

// ==================== 账户余额与保证金 ====================
const accountBalance = ref({});

const loadAccountBalance = async () => {
  try {
    const params = {};
    if (selectedStore.value) params.store_id = selectedStore.value;
    const res = await getDdAccountBalance(params);
    if (res && res.data) {
      accountBalance.value = res.data;
    }
  } catch (e) {
    console.warn('加载账户余额与保证金失败', e);
  }
};

// ==================== 流量趋势柱线混合图 ====================
let trafficChart = null;

const initTrafficChart = (rows) => {
  const dom = document.getElementById('trafficTrendChart');
  if (!dom) return;
  if (!trafficChart) {
    trafficChart = echarts.init(dom);
  }
  trafficChart.resize();

  const dates          = rows.map(r => r.date);
  const showUcnt       = rows.map(r => r.productShowUcnt);
  const showCnt        = rows.map(r => r.productShowCnt);
  const clickUcnt      = rows.map(r => r.productClickUcnt);
  const clickCnt       = rows.map(r => r.productClickCnt);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,30,60,0.88)',
      borderColor: '#00c6fb',
      textStyle: { color: '#e0f4ff', fontSize: 12 },
      axisPointer: { type: 'cross', crossStyle: { color: '#00c6fb' } },
    },
    legend: {
      top: 6,
      itemWidth: 12,
      itemHeight: 8,
      textStyle: { color: '#b3d4f5', fontSize: 11 },
      data: ['曝光人数', '曝光次数', '点击人数', '点击次数'],
    },
    grid: { left: '2%', right: '4%', bottom: '8%', top: '52px', containLabel: true },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#1a5080' } },
      axisLabel: {
        color: '#7ec4ff',
        fontSize: 10,
        rotate: dates.length > 10 ? 30 : 0,
        formatter: v => v.slice(5), // 只显示 MM-DD
      },
      axisTick: { show: false },
    },
    yAxis: [
      {
        // 左轴：人数（柱）
        type: 'value',
        name: '人数',
        nameTextStyle: { color: '#7ec4ff', fontSize: 11 },
        axisLabel: { color: '#7ec4ff', fontSize: 10 },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: 'rgba(0,100,160,0.25)' } },
      },
      {
        // 右轴：次数（线）
        type: 'value',
        name: '次数',
        nameTextStyle: { color: '#54b0fe', fontSize: 11 },
        axisLabel: { color: '#54b0fe', fontSize: 10 },
        axisLine: { show: false },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '曝光人数',
        type: 'bar',
        yAxisIndex: 0,
        barMaxWidth: 14,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#24CFF4' },
            { offset: 1, color: '#0059a6' },
          ]),
          borderRadius: [3, 3, 0, 0],
        },
        data: showUcnt,
      },
      {
        name: '点击人数',
        type: 'bar',
        yAxisIndex: 0,
        barMaxWidth: 14,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#00c6fb' },
            { offset: 1, color: '#003d7a' },
          ]),
          borderRadius: [3, 3, 0, 0],
        },
        data: clickUcnt,
      },
      {
        name: '曝光次数',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { color: '#7ec4ff', width: 2 },
        itemStyle: { color: '#7ec4ff' },
        areaStyle: { color: 'rgba(126,196,255,0.08)' },
        data: showCnt,
      },
      {
        name: '点击次数',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { color: '#54b0fe', width: 2, type: 'dashed' },
        itemStyle: { color: '#54b0fe' },
        data: clickCnt,
      },
    ],
  };
  trafficChart.setOption(option, true);
};

const loadTrafficTrend = async () => {
  try {
    let startDate, endDate;
    if (selectedDateRange.value && selectedDateRange.value.length === 2) {
      startDate = selectedDateRange.value[0];
      endDate   = selectedDateRange.value[1];
    }
    const params = {};
    if (startDate && endDate) {
      params.start_date = startDate;
      params.end_date = endDate;
    }
    if (selectedStore.value) params.store_id = selectedStore.value;

    const res = await getDdTrafficTrend(params);
    if (res && res.data) {
      initTrafficChart(res.data);
    }
  } catch (e) {
    console.warn('加载流量趋势失败', e);
  }
};

// ==================== 类目销售占比玫瑰图 ====================
let roseChart1 = null;
let roseChart2 = null;

// 玫瑰图通用配色（深蓝科技风）
const ROSE_COLORS = [
  '#00c6fb', '#005bea', '#2a9bfd', '#7ec4ff',
  '#54b0fe', '#0087fa', '#0059a6', '#003d7a',
  '#24CFF4', '#1a8fd1'
];

// 初始化/更新商品名称玫瑰图
const initRoseChart1 = (data) => {
  const dom = document.getElementById('roseChart1');
  if (!dom) return;
  if (!roseChart1) {
    roseChart1 = echarts.init(dom);
  }
  roseChart1.resize();
  const option = {
    backgroundColor: 'transparent',
    color: ROSE_COLORS,
    title: {
      text: '商品名称',
      left: 'center',
      top: 4,
      textStyle: { color: '#7ec4ff', fontSize: 12, fontWeight: 'normal' }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}<br/>订单数：{c} ({d}%)',
      backgroundColor: 'rgba(0,30,60,0.85)',
      borderColor: '#00c6fb',
      textStyle: { color: '#e0f4ff', fontSize: 12 }
    },
    legend: {
      type: 'scroll',
      orient: 'horizontal',
      bottom: 4,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: '#b3d4f5', fontSize: 10 },
      pageTextStyle: { color: '#b3d4f5' },
      pageIconColor: '#00c6fb',
      pageIconInactiveColor: '#334a60',
    },
    series: [{
      name: '商品名称',
      type: 'pie',
      radius: ['20%', '56%'],
      center: ['50%', '50%'],
      roseType: 'area',
      itemStyle: {
        borderRadius: 4,
        borderColor: 'rgba(0,20,50,0.6)',
        borderWidth: 1
      },
      label: {
        show: true,
        color: '#b3d4f5',
        fontSize: 10,
        formatter: '{d}%'
      },
      labelLine: { length: 6, length2: 8, lineStyle: { color: '#4a7fa5' } },
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,198,251,0.5)' }
      },
      data: data || []
    }]
  };
  roseChart1.setOption(option, true);
};

// 初始化/更新商品规格玫瑰图
const initRoseChart2 = (data) => {
  const dom = document.getElementById('roseChart2');
  if (!dom) return;
  if (!roseChart2) {
    roseChart2 = echarts.init(dom);
  }
  roseChart2.resize();
  const option = {
    backgroundColor: 'transparent',
    color: ROSE_COLORS,
    title: {
      text: '商品规格',
      left: 'center',
      top: 4,
      textStyle: { color: '#7ec4ff', fontSize: 12, fontWeight: 'normal' }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}<br/>订单数：{c} ({d}%)',
      backgroundColor: 'rgba(0,30,60,0.85)',
      borderColor: '#00c6fb',
      textStyle: { color: '#e0f4ff', fontSize: 12 }
    },
    legend: {
      type: 'scroll',
      orient: 'horizontal',
      bottom: 4,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: '#b3d4f5', fontSize: 10 },
      pageTextStyle: { color: '#b3d4f5' },
      pageIconColor: '#00c6fb',
      pageIconInactiveColor: '#334a60',
    },
    series: [{
      name: '商品规格',
      type: 'pie',
      radius: ['20%', '56%'],
      center: ['50%', '50%'],
      roseType: 'area',
      itemStyle: {
        borderRadius: 4,
        borderColor: 'rgba(0,20,50,0.6)',
        borderWidth: 1
      },
      label: {
        show: true,
        color: '#b3d4f5',
        fontSize: 10,
        formatter: '{d}%'
      },
      labelLine: { length: 6, length2: 8, lineStyle: { color: '#4a7fa5' } },
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,198,251,0.5)' }
      },
      data: data || []
    }]
  };
  roseChart2.setOption(option, true);
};

// 获取类目占比数据并渲染玫瑰图
const loadCategoryStats = async () => {
  try {
    const params = {};
    if (selectedDateRange.value && selectedDateRange.value.length === 2) {
      params.start_date = selectedDateRange.value[0];
      params.end_date = selectedDateRange.value[1];
    }
    if (selectedStore.value) params.store_id = selectedStore.value;

    const res = await getDdCategoryStats(params);
    if (res && res.data) {
      initRoseChart1(res.data.productStats || []);
      initRoseChart2(res.data.skuStats || []);
    }
  } catch (e) {
    console.warn('加载类目占比失败', e);
  }
};

// ==================== 订单信息滚动列表 ====================
const orderList = ref([]);
const orderPageNum = ref(1);
const orderLoading = ref(false);
const orderNoMore = ref(false);
const ORDER_PAGE_SIZE = 20;

// 格式化日期为 YYYY-MM-DD
const formatDate = (d) => {
  const dt = d instanceof Date ? d : new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// 加载订单列表；reset=true 时清空列表从第1页开始
const loadOrderList = async (reset = false) => {
  if (orderLoading.value) return;
  if (!reset && orderNoMore.value) return;

  if (reset) {
    orderList.value = [];
    orderPageNum.value = 1;
    orderNoMore.value = false;
  }

  orderLoading.value = true;
  try {
    const params = {
      page_num: orderPageNum.value,
      page_size: ORDER_PAGE_SIZE,
    };
    // 仅在用户手动选择日期后才传日期参数
    if (selectedDateRange.value && selectedDateRange.value.length === 2) {
      params.start_date = selectedDateRange.value[0];
      params.end_date = selectedDateRange.value[1];
    }
    if (selectedStore.value) params.store_id = selectedStore.value;

    const res = await getDdDailyOrderList(params);
    if (res && res.code === 200) {
      // model_content 响应：rows/total 直接在顶层
      const rows = res.rows || [];
      const total = res.total || 0;
      orderList.value = reset ? rows : [...orderList.value, ...rows];
      if (orderList.value.length >= total || rows.length < ORDER_PAGE_SIZE) {
        orderNoMore.value = true;
      } else {
        orderPageNum.value += 1;
      }
    }
  } catch (e) {
    console.warn('加载订单列表失败', e);
  } finally {
    orderLoading.value = false;
  }
};

// 滚动到底部时加载下一页
const handleOrderScroll = (e) => {
  const el = e.target;
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 30) {
    loadOrderList(false);
  }
};

// 根据订单状态返回对应 CSS class
const getOrderStatusClass = (status) => {
  if (!status) return '';
  if (status.includes('完成') || status.includes('成功')) return 'status-done';
  if (status.includes('退款') || status.includes('退货') || status.includes('取消')) return 'status-refund';
  return 'status-pending';
};

// 点击订单卡片跳转到订单详情页
const openOrderDetail = (url) => {
  if (url) window.open(url, '_blank');
};

// 格式化订单时间，只显示 MM-DD HH:mm
const formatOrderTime = (val) => {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val).substring(5, 16);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${m}-${day} ${h}:${min}`;
};

const time = () => {
  clearTimeout(timer);
  const dt = new Date();
  const y = dt.getFullYear();
  const mt = dt.getMonth() + 1;
  const day = dt.getDate();
  const h = dt.getHours();
  const m = dt.getMinutes();
  const s = dt.getSeconds();
  const showTime = document.getElementById("showTime");
  if (showTime) {
    showTime.innerHTML = y + "/" + mt + "/" + day + " " + h + ":" + m + ":" + s + "";
  }
  timer = setTimeout(time, 1000);
}

const echarts_1 = () => {
  const dom = document.getElementById('echart1');
  if (!dom) return;
  const myChart = echarts.init(dom);
  charts.push(myChart);
  const option = {
    title: {
      text: '14%',
      x: 'center',
      y: 'center',
      textStyle: {
        fontWeight: 'normal',
        color: '#0580f2',
        fontSize: '24'
      }
    },
    color: ['rgba(176, 212, 251, .1)'],
    series: [{
      name: 'Line 1',
      type: 'pie',
      clockWise: true,
      radius: ['75%', '85%'],
      itemStyle: {
        normal: {
          label: { show: false },
          labelLine: { show: false },
        }
      },
      hoverAnimation: false,
      data: [{
        value: 14,
        name: '01',
        itemStyle: {
          normal: {
            color: {
              colorStops: [{
                offset: 0,
                color: '#005bea'
              }, {
                offset: 1,
                color: '#00c6fb'
              }]
            },
            label: { show: false },
            labelLine: { show: false }
          }
        }
      }, {
        name: '86',
        value: 20
      }]
    }]
  };
  myChart.setOption(option);
}

const echarts_2 = () => {
  const dom = document.getElementById('echart2');
  if (!dom) return;
  const myChart = echarts.init(dom);
  charts.push(myChart);
  const option = {
    title: {
      text: '22%',
      x: 'center',
      y: 'center',
      textStyle: {
        fontWeight: 'normal',
        color: '#0580f2',
        fontSize: '24'
      }
    },
    color: ['rgba(176, 212, 251, .1)'],
    series: [{
      name: 'Line 1',
      type: 'pie',
      clockWise: true,
      radius: ['75%', '85%'],
      itemStyle: {
        normal: {
          label: { show: false },
          labelLine: { show: false },
        }
      },
      hoverAnimation: false,
      data: [{
        value: 22,
        name: '01',
        itemStyle: {
          normal: {
            color: {
              colorStops: [{
                offset: 0,
                color: '#005bea'
              }, {
                offset: 1,
                color: '#00c6fb'
              }]
            },
            label: { show: false },
            labelLine: { show: false }
          }
        }
      }, {
        name: '78',
        value: 20
      }]
    }]
  };
  myChart.setOption(option);
}

const echarts_3 = () => {
  const dom = document.getElementById('echart3');
  if (!dom) return;
  const myChart = echarts.init(dom);
  charts.push(myChart);
  const option = {
    title: {
      text: '10%',
      x: 'center',
      y: 'center',
      textStyle: {
        fontWeight: 'normal',
        color: '#0580f2',
        fontSize: '24'
      }
    },
    color: ['rgba(176, 212, 251, .1)'],
    series: [{
      name: 'Line 1',
      type: 'pie',
      clockWise: true,
      radius: ['75%', '85%'],
      itemStyle: {
        normal: {
          label: { show: false },
          labelLine: { show: false },
        }
      },
      hoverAnimation: false,
      data: [{
        value: 10,
        name: '01',
        itemStyle: {
          normal: {
            color: {
              colorStops: [{
                offset: 0,
                color: '#005bea'
              }, {
                offset: 1,
                color: '#00c6fb'
              }]
            },
            label: { show: false },
            labelLine: { show: false }
          }
        }
      }, {
        name: '02',
        value: 90
      }]
    }]
  };
  myChart.setOption(option);
}

const echarts_4 = () => {
  const dom = document.getElementById('echart4');
  if (!dom) return;
  const myChart = echarts.init(dom);
  charts.push(myChart);
  const option = {
    title: {
      text: '30%',
      x: 'center',
      y: 'center',
      textStyle: {
        fontWeight: 'normal',
        color: '#0580f2',
        fontSize: '24'
      }
    },
    color: ['rgba(176, 212, 251, .1)'],
    series: [{
      name: 'Line 1',
      type: 'pie',
      clockWise: true,
      radius: ['75%', '85%'],
      itemStyle: {
        normal: {
          label: { show: false },
          labelLine: { show: false },
        }
      },
      hoverAnimation: false,
      data: [{
        value: 30,
        name: '01',
        itemStyle: {
          normal: {
            color: {
              colorStops: [{
                offset: 0,
                color: '#005bea'
              }, {
                offset: 1,
                color: '#00c6fb'
              }]
            },
            label: { show: false },
            labelLine: { show: false }
          }
        }
      }, {
        name: '02',
        value: 70
      }]
    }]
  };
  myChart.setOption(option);
}

const echarts_5 = () => {
  const dom = document.getElementById('echart5');
  if (!dom) return;
  const myChart = echarts.init(dom);
  charts.push(myChart);
  const option = {
    title: {
      text: '12%',
      x: 'center',
      y: 'center',
      textStyle: {
        fontWeight: 'normal',
        color: '#0580f2',
        fontSize: '24'
      }
    },
    color: ['rgba(176, 212, 251, .1)'],
    series: [{
      name: 'Line 1',
      type: 'pie',
      clockWise: true,
      radius: ['75%', '85%'],
      itemStyle: {
        normal: {
          label: { show: false },
          labelLine: { show: false },
        }
      },
      hoverAnimation: false,
      data: [{
        value: 12,
        name: '01',
        itemStyle: {
          normal: {
            color: {
              colorStops: [{
                offset: 0,
                color: '#005bea'
              }, {
                offset: 1,
                color: '#00c6fb'
              }]
            },
            label: { show: false },
            labelLine: { show: false }
          }
        }
      }, {
        name: '02',
        value: 88
      }]
    }]
  };
  myChart.setOption(option);
}

const echarts_6 = () => {
  const dom = document.getElementById('echart6');
  if (!dom) return;
  const myChart = echarts.init(dom);
  charts.push(myChart);
  const option = {
    title: {
      text: '80%',
      x: 'center',
      y: 'center',
      textStyle: {
        fontWeight: 'normal',
        color: '#0580f2',
        fontSize: '24'
      }
    },
    color: ['rgba(176, 212, 251, .1)'],
    series: [{
      name: 'Line 1',
      type: 'pie',
      clockWise: true,
      radius: ['75%', '85%'],
      itemStyle: {
        normal: {
          label: { show: false },
          labelLine: { show: false },
        }
      },
      hoverAnimation: false,
      data: [{
        value: 80,
        name: '01',
        itemStyle: {
          normal: {
            color: {
              colorStops: [{
                offset: 0,
                color: '#005bea'
              }, {
                offset: 1,
                color: '#00c6fb'
              }]
            },
            label: { show: false },
            labelLine: { show: false }
          }
        }
      }, {
        name: '02',
        value: 20
      }]
    }]
  };
  myChart.setOption(option);
}

const echarts_7 = () => {
  const dom = document.getElementById('echart7');
  if (!dom) return;
  const myChart = echarts.init(dom);
  charts.push(myChart);
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '0%',
      top: '15px',
      right: '0%',
      bottom: '0%',
      containLabel: true
    },
    xAxis: {
      data: ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
      axisLine: { show: false },
      axisLabel: {
        color: '#fff',
        fontSize: 12
      }
    },
    yAxis: {
      name: "（人）",
      nameTextStyle: {
        color: '#fff',
        fontSize: 14
      },
      axisLine: { show: false },
      axisLabel: {
        color: '#fff',
        fontSize: 12
      },
      splitLine: { show: false },
      interval: 100,
      max: 500
    },
    series: [{
      type: 'bar',
      barWidth: '30%',
      itemStyle: {
        normal: {
          barBorderRadius: 50,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: '#00c6fb'
          }, {
            offset: 0.8,
            color: '#005bea'
          }], false)
        }
      },
      data: [25, 325, 164, 245, 475, 201, 121]
    }]
  };
  myChart.setOption(option);
}

const echarts_8 = () => {
  const dom = document.getElementById('echart8');
  if (!dom) return;
  const myChart = echarts.init(dom);
  charts.push(myChart);
  const option = {
    color: ['#002c53', '#00427c', '#0059a6', '#0070d0', '#0087fa', '#2a9bfd', '#54b0fe', '#7ec4ff'],
    tooltip: {
      trigger: 'item',
      formatter: "{a} <br/>{b}: {c} ({d}%)"
    },
    legend: {
      orient: 'vertical',
      right: 0,
      y: 'center',
      itemWidth: 12,
      itemHeight: 12,
      align: 'left',
      textStyle: {
        fontSize: 12,
        color: '#fff'
      },
      data: ['test1', 'test2', 'test3', 'test4', 'test5'],
    },
    series: [
      {
        name: '访问来源',
        type: 'pie',
        center: ['50%', '50%'],
        radius: ['20%', '50%'],
        label: {
          normal: {
            formatter: '{c|{d}%}',
            rich: {
              c: {
                fontSize: 12,
                color: '#fff',
              }
            }
          }
        },
        labelLine: {
          normal: {
            show: true,
            length: 2,
            length2: 5,
            lineStyle: {
              width: 1
            }
          }
        },
        roseType: 'area',
        data: [{
          value: 10,
          name: 'test1'
        },
        {
          value: 20,
          name: 'test2'
        },
        {
          value: 5,
          name: 'test3'
        },
        {
          value: 15,
          name: 'test4'
        },
        {
          value: 15,
          name: 'test5'
        }
        ]
      }
    ]
  };
  myChart.setOption(option);
}

// ==================== 新地图函数组 ====================

// 获取 GeoJSON：统一从 DataV API 获取（保证 ECharts5 GeoJSON 格式一致），失败则回退本地 china.json
// 注意：本地 china.json 的 coordinates 均为空数组，无法渲染省份边界，因此全国地图也必须走 API
const getGeoJson = (adcode) => {
  return new Promise((resolve) => {
    fetch(`https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`)
      .then(res => res.json())
      .then(data => resolve(data))
      .catch(() => {
        console.warn('DataV 获取失败，回退本地 china.json');
        resolve(mapJson);
      });
  });
};




// 根据缓存的统计数据 + 当前模式，构建 mapData/pointData 并渲染
const renderMap = () => {
  if (!geoJson || !geoJson.features || geoJson.features.length === 0) return;

  const isAmount = mapMode.value === 'amount';
  let mapData = [], pointData = [];

  geoJson.features.forEach(item => {
    // 跳过 name 或 center 缺失的异常条目（如全国GeoJSON中的南海诸岛特殊要素）
    if (!item.properties || !item.properties.name || !item.properties.center) return;
    const cityName = item.properties.name;
    const stat = geoStatsMap[cityName] || { payAmount: 0, orderCount: 0 };
    // 根据模式取对应展示值
    const value = isAmount ? stat.payAmount : stat.orderCount;

    mapData.push({
      name: cityName,
      value: value,
      payAmount: stat.payAmount,
      orderCount: stat.orderCount,
      cityCode: item.properties.adcode,
    });

    // 只有有实际数据（value > 0）的地区才显示散点
    if (value > 0) {
      pointData.push({
        name: cityName,
        value: [item.properties.center[0], item.properties.center[1], value],
        payAmount: stat.payAmount,
        orderCount: stat.orderCount,
        cityCode: item.properties.adcode,
      });
    }
  });

  mapData = mapData.sort((a, b) => b.value - a.value);
  initEchartMap(mapData, pointData);
};

// 根据当前下钻层级从接口获取真实数据，缓存后调用 renderMap
const getMapData = async () => {
  // 【修复1】严格校验 GeoJSON 数据完整性
  if (!geoJson || !geoJson.features || geoJson.features.length === 0) {
    console.error('GeoJSON 数据未加载或格式错误');
    return;
  }

  // 根据下钻深度确定聚合层级和父级筛选参数
  const depth = parentInfo.value.length;
  let level = 'province';
  let parentProvince = null;
  let parentCity = null;

  if (depth === 2) {
    // 下钻到省级 → 按城市聚合
    level = 'city';
    parentProvince = parentInfo.value[1].cityName;
  } else if (depth >= 3) {
    // 下钻到市级 → 按区县聚合
    level = 'town';
    parentProvince = parentInfo.value[1].cityName;
    parentCity = parentInfo.value[2].cityName;
  }

  // 调用后端接口获取真实聚合数据，更新缓存
  geoStatsMap = {};
  try {
    const params = { level };
    if (parentProvince) params.parent_province = parentProvince;
    if (parentCity) params.parent_city = parentCity;
    if (selectedStore.value) params.store_id = selectedStore.value;
    if (selectedDateRange.value && selectedDateRange.value.length === 2) {
      params.start_date = selectedDateRange.value[0];
      params.end_date = selectedDateRange.value[1];
    }
    const res = await getDdGeoOrderStats(params);
    if (res && res.data && Array.isArray(res.data)) {
      res.data.forEach(item => {
        geoStatsMap[item.name] = item;
      });
    }
  } catch (e) {
    console.warn('获取地图统计数据失败，将使用零值填充', e);
  }

  renderMap();
};

// 渲染 echarts 地图（geo + effectScatter）
const initEchartMap = (mapData, pointData) => {
  
  const dom = document.getElementById('map');
  if (!dom) {
    console.error('地图容器不存在');
    return;
  }

  // 初始化或复用地图实例
  if (!mapChart) {
    mapChart = echarts.init(dom);
  }

  // 有效数据的最小/最大值（排除 value=0 的区域对 visualMap 范围的干扰）
  const validData = mapData.filter(d => d.value > 0);
  const min = validData.length === 0 ? 0 : validData[validData.length - 1].value;
  const max = validData.length === 0 ? 0 : validData[0].value;

  const isAmount = mapMode.value === 'amount';
  const seriesLabel = isAmount ? '销售额' : '订单数';
  const unit = isAmount ? '元' : '条';

  // 全国时注册为 'china'，下钻时注册为 'map'
  const mapName = parentInfo.value.length === 1 ? 'china' : 'map';
  // 每次都重新注册（ECharts 5 支持重复注册，直接覆盖，不会抛出异常）
  echarts.registerMap(mapName, geoJson);

  const option = {
    backgroundColor: 'transparent',
    title: [
      
    ],
    tooltip: {
      trigger: 'item'
    },
    geo: {
      map: mapName,
      zoom: parentInfo.value.length === 1 ? 1.5 : (parentInfo.value[1].cityName === '海南省' ? 4.0 : 0.9),
      roam: true,
      top: parentInfo.value.length === 1 ? '25%' : (parentInfo.value[1].cityName === '海南省' ? '150%' : '3%'),
      left: parentInfo.value.length === 1 ? '21%' : (parentInfo.value[1].cityName === '海南省' ? '70%' : '23%'),
      label: {
        show: true,
        color: 'rgb(249, 249, 249)',
        formatter: p => {
          const nameMap = {
            '内蒙古自治区': '内蒙古',
            '西藏自治区': '西藏',
            '新疆维吾尔自治区': '新疆',
            '宁夏回族自治区': '宁夏',
            '广西壮族自治区': '广西',
            '香港特别行政区': '香港',
            '澳门特别行政区': '澳门'
          };
          return nameMap[p.name] || p.name;
        }
      },
      emphasis: {
        label: { show: true, color: '#f75a00' },
        itemStyle: { areaColor: '#8dd7fc', borderWidth: 1.6, shadowBlur: 25 }
      },
      // 【修复3】移除 geo 组件的固定 areaColor，避免覆盖 map 系列的着色
      itemStyle: {
        areaColor: 'rgba(13, 36, 81, 0.8)',
        borderColor: '#1E90FF',
        borderWidth: 2,
        shadowBlur: 15,
        shadowColor: 'rgb(58,115,192)',
        shadowOffsetX: 7,
        shadowOffsetY: 6
      }
    },
    visualMap: {
      min: min,
      max: max,
      left: '3%',
      bottom: '5%',
      calculable: true,
      // 仅关联 map 系列（索引0），散点不需要着色关联
      seriesIndex: [0],
      inRange: { color: ['#0A2E5D', '#2E98CA', '#24CFF4'] },
      textStyle: { color: '#24CFF4' },
      // 数值标签附加单位
      formatter: v => `${isAmount ? Number(v).toFixed(2) : Math.round(v)}${unit}`,
      show: true
    },
    series: [
      {
        name: seriesLabel,
        type: 'map',
        geoIndex: 0,
        map: mapName,
        roam: true,
        visualMap: true,
        data: mapData,
        itemStyle: {
          areaColor: 'rgba(20, 41, 87, 0.8)',
          borderColor: '#53D9FF',
          borderWidth: 1
        },
        emphasis: {
          itemStyle: { areaColor: '#F4E925' }
        },
        tooltip: {
          trigger: 'item',
          formatter: p => {
            if (p.name === '南海诸岛') return;
            const d = p.data || {};
            const pay = d.payAmount != null ? d.payAmount : (isAmount ? (p.value || 0) : 0);
            const cnt = d.orderCount != null ? d.orderCount : (!isAmount ? (p.value || 0) : 0);
            return `<div style='text-align:left'>${p.name}:<br/>销售额：${Number(pay).toFixed(2)}元<br/>订单数：${cnt}条</div>`;
          }
        },
        label: { show: false }
      },
      {
        name: seriesLabel,
        type: 'effectScatter',
        coordinateSystem: 'geo',
        rippleEffect: { brushType: 'fill' },
        itemStyle: {
          color: '#F4E925', shadowBlur: 10, shadowColor: '#333'
        },
        data: pointData,
        symbolSize: val => val[2] === max ? 17 : 7,
        showEffectOn: 'render',
        tooltip: {
          trigger: 'item',
          formatter: p => {
            if (!p.data) return;
            const d = p.data;
            const pay = d.payAmount != null ? d.payAmount : 0;
            const cnt = d.orderCount != null ? d.orderCount : 0;
            return `<div style='text-align:left'>${p.name}:<br/>销售额：${Number(pay).toFixed(2)}元<br/>订单数：${cnt}条</div>`;
          }
        }
      }
    ]
  };

  // 【修复8】先清空原有配置，再重新设置，避免初始化缓存问题
  mapChart.clear();
  mapChart.setOption(option, true);

  // 【修复9】强制触发渲染，解决初始化时渲染延迟问题
  mapChart.resize();

  // 点击下钻事件（先解绑防止重复）
  mapChart.off('click');
  mapChart.on('click', params => {
    let cityCode, cityName;

    if (params.data && params.data.cityCode) {
      // map 系列点击：params.data 包含完整数据
      cityCode = params.data.cityCode;
      cityName = params.data.name;
    } else if (params.name) {
      // geo 组件点击：通过 params.name 从当前 geoJson 中查找 adcode
      const feature = geoJson.features.find(f => f.properties && f.properties.name === params.name);
      if (!feature) return;
      cityCode = feature.properties.adcode;
      cityName = params.name;
    } else {
      return;
    }

    if (!cityCode) return;
    if (parentInfo.value[parentInfo.value.length - 1].code == cityCode) return;
    parentInfo.value.push({ cityName, code: cityCode });
    console.log("parentInfo",parentInfo);
    init(cityCode);
  });
};

// 【修复10】确保 GeoJSON 加载完成后再初始化地图
// 替换为你实际的 GeoJSON 加载逻辑
const loadGeoJson = () => {
  // 本地测试：假设 geoJson 已存在，直接执行
  getMapData();
};

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
  loadGeoJson();
});


// // 根据 geoJs

// 返回上一级
const goBack = () => {
  if (parentInfo.value.length <= 1) return;
  parentInfo.value.pop();
  init(parentInfo.value[parentInfo.value.length - 1].code);
};

// 初始化：加载 GeoJSON 后渲染地图
const init = async (adcode) => {
  const data = await getGeoJson(adcode);
  geoJson = data;
  await getMapData();
};

const resizeCharts = () => {
  charts.forEach(chart => {
    chart.resize();
  });
  if (mapChart) mapChart.resize();
  if (roseChart1) roseChart1.resize();
  if (roseChart2) roseChart2.resize();
  if (trafficChart) trafficChart.resize();
};

onMounted(() => {
  time();
  echarts_1();
  echarts_2();
  echarts_3();
  echarts_4();
  echarts_5();
  echarts_6();
  echarts_7();
  echarts_8();
  loadStoreList();
  init(100000);
  loadOrderList(true);
  loadOverviewMetrics();
  loadAccountBalance();
  loadCategoryStats();
  loadTrafficTrend();
  window.addEventListener("resize", resizeCharts);
});

onUnmounted(() => {
  if (timer) clearTimeout(timer);
  window.removeEventListener("resize", resizeCharts);
  charts.forEach(chart => chart.dispose());
  charts = [];
  if (mapChart) {
    mapChart.dispose();
    mapChart = null;
  }
  if (roseChart1) {
    roseChart1.dispose();
    roseChart1 = null;
  }
  if (roseChart2) {
    roseChart2.dispose();
    roseChart2 = null;
  }
  if (trafficChart) {
    trafficChart.dispose();
    trafficChart = null;
  }
  parentInfo.value = [{ cityName: '全国', code: 100000 }];
});
</script>

<style scoped>
@font-face {
  font-family: electronicFont;
  src: url(./font/DS-DIGIT.TTF)
}

.dvd-wrapper {
  color: #fff;
  font-size: 16px;
  background: url(./images/53bg.png) no-repeat;
  background-size: 100% 100%;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: "微软雅黑";
  box-sizing: border-box;
  padding: 0 10px 10px 10px;
}

.dvd-wrapper * {
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box
}

/* Reset styles scoped to wrapper */
.dvd-wrapper ul,
.dvd-wrapper li,
.dvd-wrapper p,
.dvd-wrapper h1,
.dvd-wrapper h2,
.dvd-wrapper h3,
.dvd-wrapper h4,
.dvd-wrapper h5,
.dvd-wrapper h6 {
  padding: 0;
  margin: 0
}

.dvd-wrapper li {
  list-style-type: none;
}

.dvd-wrapper i {
  margin: 0px;
  padding: 0px;
  text-indent: 0px;
  font-style: normal;
}

.dvd-wrapper img {
  border: none;
  max-width: 100%;
}

.dvd-wrapper a {
  text-decoration: none;
  color: #fff;
}

.dvd-wrapper a.active,
.dvd-wrapper a:focus {
  outline: none !important;
  text-decoration: none;
}

.dvd-wrapper a:hover {
  color: #06c;
  text-decoration: none !important
}

.clearfix:after,
.clearfix:before {
  display: table;
  content: " "
}

.clearfix:after {
  clear: both
}

.pulll_left {
  float: left;
}

.pulll_right {
  float: right;
}

.text-w {
  color: #ffe400
}

.text-d {
  color: #ff0000
}

.text-s {
  color: #14e144
}

.text-b {
  color: #00deff
}

.head {
  position: relative;
  height: 80px;
  background: url(./images/topbg.png) center bottom no-repeat;
  background-size: 100% 100%;
  margin-bottom: 10px;
}

/* 筛选控件：绝对定位到 head 右侧，垂直居中偏下（往上稍移） */
.head-controls {
  position: absolute;
  right: 24px;
  bottom: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 10;
}

/* Element Plus 日期/选择器在深色背景下的适配 */
.head-controls :deep(.el-input__wrapper) {
  background-color: rgba(0, 30, 70, 0.75);
  box-shadow: 0 0 0 1px rgba(100, 210, 255, 0.4) inset;
}
.head-controls :deep(.el-input__inner),
.head-controls :deep(.el-range-input) {
  color: #a8d8ff;
}
.head-controls :deep(.el-range-separator) {
  color: #a8d8ff;
}
.head-controls :deep(.el-input__prefix-icon),
.head-controls :deep(.el-range__icon) {
  color: #64d2ff;
}

/* 标题：绝对居中，不受筛选控件影响，完全自适应 */
.head h1 {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  white-space: nowrap;
  font-size: 52px;
  letter-spacing: 12px;
  font-weight: 900;
  font-style: italic;
  color: #ffffff;
  text-transform: uppercase;
  background: linear-gradient(180deg, #ffffff 40%, #2b86ff 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 12px rgba(43, 134, 255, 0.6));
  animation: titleGlow 3s ease-in-out infinite;
  margin: 0;
  line-height: 1.2;
}

@keyframes titleGlow {
  0%, 100% {
    filter: drop-shadow(0 0 12px rgba(0, 242, 255, 0.6));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(0, 242, 255, 0.9));
  }
}

.head .time {
  position: absolute;
  left: 40px;
  line-height: 40px;
  top: 0;
  opacity: .7;
  background-image: -webkit-linear-gradient(bottom, #2b86ff, #fff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.head .name {
  position: absolute;
  right: 40px;
  line-height: 40px;
  top: 0;
  opacity: .7;
  background-image: -webkit-linear-gradient(bottom, #2b86ff, #fff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.mainbox {
  /* 占满 wrapper 中 head 以外的剩余空间 */
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.nav1 {
  display: flex;
  align-items: stretch;
  /* 占满 mainbox 全部高度 */
  flex: 1;
  min-height: 0;
  padding-bottom: 0;
  gap: 10px;
}

.nav1>li {
  /* 每列撑满 nav1 高度，溢出内容隐藏（左/中列固定高内容正常展示） */
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav1>li>.box {
  margin-bottom: 0;
}

/* ==================== 左侧列 ==================== */
/* .col-left flex 布局由 li 统一定义 */

.overview-box {
  flex: 4; /* 约占 40% */
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.overview-box .boxnav {
  flex: 1;
  min-height: 0;
  height: auto !important;
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.overview-box .drqk {
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  align-content: space-around;
}

.overview-box .drqk li {
  height: 25%;
  width: 50%;
  float: none;
  display: flex;
  align-items: center;
}

/* ==================== 流量趋势柱线混合图 ==================== */
/* 中间列：flex 纵向排列，撑满 nav1 高度 */
/* .traffic-col flex 布局由 li 统一定义 */

/* 地图 box：高度自适应内容（557px map + tit），不参与 flex 伸缩 */
.map-box {
  flex: 2; /* 约占 66% */
  min-height: 0;
  display: flex;
  flex-direction: column;
}

#map {
  flex: 1;
  min-height: 0;
  height: auto !important;
}

/* 流量图 box：占满地图以下所有剩余空间 */
.traffic-box {
  flex: 1; /* 约占 33% */
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
  min-height: 0;
}

.traffic-chart-dom {
  flex: 1;
  min-height: 0;
}

/* ==================== 类目销售玫瑰图 ==================== */
.rose-box {
  flex: 6; /* 约占 60% */
  display: flex;
  flex-direction: column;
  min-height: 0;
  margin-top: 8px;
  overflow: hidden;
}

.rose-charts-wrap {
  display: flex;
  flex-direction: row;
  flex: 1;
  gap: 10px;
  padding: 4px 6px 8px;
  min-height: 0;
  overflow: hidden;
}

.rose-item {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}


.rose-chart-dom {
  flex: 1;
  min-height: 0;
  width: 100%;
}

/* 右侧订单列：纵向 flex，撑满 nav1 高度（即 mainbox 高度） */
/* .order-col flex 布局由 li 统一定义 */

/* 右侧订单面板：占满剩余高度 */
.order-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
  min-height: 0;
}

/* 滚动容器：flex 自动占满 .order-box 内除 .tit 以外的所有空间，并支持纵向滚动 */
.order-scroll-wrap {
  flex: 1;
  min-height: 0; /* 关键：防止 flex 子元素撑破父容器 */
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px 6px;
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 200, 255, 0.35) transparent;
}
.order-scroll-wrap::-webkit-scrollbar {
  width: 4px;
}
.order-scroll-wrap::-webkit-scrollbar-thumb {
  background: rgba(100, 200, 255, 0.35);
  border-radius: 2px;
}

.box {
  margin-bottom: 0;
  position: relative;
}

.map {
  position: absolute;
  z-index: 10;
  opacity: .8;
  top: 10%;
  width: 70%;
  height: 80%;
  left: 15%;
}

.map1,
.map2,
.map3 {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.map1 {
  z-index: 2;
  animation: myfirst2 15s infinite linear;
  display: flex;
}

.map2 {
  z-index: 3;
  opacity: 0.2;
  animation: myfirst 10s infinite linear;
}

.map3 {
  z-index: 1;
}

.map1 img {
  width: 100%
}

.map2 img {
  width: 82%
}

.map3 img {
  width: 80%
}

.tit {
  display: flex;
  align-items: flex-end;
}

.tit span {
  background: url(./images/line1.png) no-repeat bottom right;
  font-size: 20px;
  white-space: nowrap;
  padding-bottom: 10px;
  padding-right: 20px;
  background-image: -webkit-linear-gradient(bottom, #2b86ff, #fff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.tit p {
  background: url(./images/line2.png) no-repeat bottom right;
  width: 100%;
  height: 13px;
  margin-bottom: 5px;
  opacity: .5
}

.boxnav {
  padding: 10px 0;
}

.anchorBL,
.BMap_cpyCtrl {
  display: none;
}

#lg-counter {
  display: none;
}

.table1 th {
  border-bottom: 1px solid #407abd;
  font-size: 14px;
  padding: 10px 0;
  color: rgba(255, 255, 255, .8)
}

.table1 td {
  border-bottom: 1px dotted#407abd;
  font-size: 14px;
  padding: 10px 0;
  color: rgba(255, 255, 255, 1)
}

.table1 tr:last-child td {
  border: none;
}

.table1 td span {
  font-size: 12px;
  transform: scale(.8);
  display: inline-block;
}

.tqdb {
  height: 100%;
}

.tqdb li {
  height: 50%;
  float: left;
  width: 33.333%;
  text-align: center;
}

.tqdb li div {
  height: calc(100% - 25px);
}

.tqdb li h3 {
  font-size: 13px;
  color: #fff;
}

.jbgc {
  height: 100%;
  position: relative
}

.jbgc li {
  height: 100%;
  float: right;
}

.jbgc li:nth-child(1) {
  height: 30%;
  position: absolute;
  left: 0;
}

.jztxt div {
  padding: 20px 0 0 0;
  line-height: 120%;
}

.jztxt div i {
  font-size: 12px;
  color: #fff;
}

.jztxt div h3 {
  font-size: 20px;
  color: #00deff;
  font-family: electronicFont;
}

.jztxt div span {
  font-size: 13px;
  opacity: .5
}

.jcjg {
  height: 100%;
  margin-left: -10px;
  margin-right: -10px;
}

.jcjg li {
  width: 33.33333%;
  height: 100%;
  float: left;
  height: 100%;
  padding: 0 10px;
}

.jcjg h3 {
  background: url(./images/tit1.png) center right no-repeat;
  margin-bottom: 15px;
  font-weight: normal;
  font-size: 15px;
}

.jcnav {
  position: relative;
  background: url(./images/bg1.png) no-repeat left center;
  height: 160px;
  width: 100%;
}

.jcnav2 {
  background: url(./images/bg2.png) no-repeat left center;
  height: 200px;
}

.jcnav img {
  position: absolute;
  left: 14px;
  top: 50%;
  margin-top: -24px;
}

.jcnav2 img {
  left: 16px;
  margin-top: -30px;
}

.jcnavp {
  padding-left: 98px;
}

.jcnavp>div {
  border: 1px solid #1070aa;
  display: flex;
  font-size: 14px;
  align-items: center;
  padding: 5px 10px;
  margin-bottom: 26px;
  height: 36px;
}

.jcnav2 .jcnavp>div {
  margin-bottom: 17px;
}

.jcnavp>div ol {
  white-space: nowrap;
}

.jcnavp>div span {
  padding-left: 10px;
  color: #00e4ff;
  white-space: nowrap;
}

.jcnavp>div i {
  font-size: 12px;
  padding-left: 5px;
}

.ylfw {
  height: 100%;
  margin-left: -5px;
  margin-right: -5px;
}

.ylfw li {
  width: 50%;
  height: 33.33333%;
  float: left;
  padding: 0 5px;
}

.ylfwbox {
  height: 85%;
  border: 1px solid #1070aa;
  padding: 10px 15px;
  position: relative;
}

.fora {
  position: relative;
}

.forb {
  position: absolute;
  width: 100%;
  left: 0;
  bottom: 0;
}

.fora:before,
.fora:after,
.forb:before,
.forb:after {
  position: absolute;
  content: "";
  width: 2px;
  height: 2px;
  border: 1px solid #00deff;
  opacity: .8;
  box-shadow: 0 0 5px #00deff;
}

.fora:before,
.forb:before {
  left: -2px;
  top: -2px;
}

.fora:after,
.forb:after {
  right: -2px;
  top: -2px;
}

.ylfwbox p {
  font-size: 13px;
}

.ylfwbox ol i {
  font-size: 12px;
}

.ylfwbox ol em {
  font-size: 14px;
  font-style: normal;
  padding: 0 5px;
}

.ylfwbox ol span {
  font-size: 24px;
  color: #00deff;
  text-shadow: 0 0 5px #00deff;
  font-family: electronicFont;
}

.drqk {
  height: 100%;
}

.drqk li {
  height: 33.33333333%;
  width: 50%;
  float: left;
  display: flex;
  align-items: center;
}

.icon {
  background: url(./images/iconbg.png);
  width: 63px;
  height: 63px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
}

.drqk li span {
  opacity: .5;
  font-size: 15px;
}

.drqk li i {
  padding-left: 10px;
}

.drqk li em {
  background: linear-gradient(0deg, #45d3fd, #45d3fd, #61ddb1, #61ddb1);
  font-style: normal;
  background-size: cover;
  font-family: electronicFont;
  font-size: 30px;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

@keyframes myfirst2 {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(359deg);
  }
}

@keyframes myfirst {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(-359deg);
  }
}

.back-btn {
  position: absolute;
  left: 13%;
  bottom: 12%;
  color: rgb(100, 210, 255);
  background: rgba(0, 60, 120, 0.6);
  border: 1px solid rgba(100, 210, 255, 0.5);
  padding: 3px 27px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  z-index: 1200;
}

/* ===== 订单信息滚动列表 ===== */

.order-card {
  background: rgba(0, 40, 90, 0.55);
  border: 1px solid rgba(100, 180, 255, 0.18);
  border-radius: 4px;
  padding: 6px 8px;
  margin-bottom: 6px;
  transition: background 0.2s;
  cursor: pointer;
}
.order-card:hover {
  background: rgba(0, 60, 120, 0.7);
  border-color: rgba(100, 200, 255, 0.4);
}

.order-card-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  line-height: 1.6;
}
.order-card-top {
  justify-content: space-between;
  margin-bottom: 2px;
}
.order-card-bottom {
  justify-content: space-between;
  margin-top: 2px;
  color: rgba(180, 210, 255, 0.75);
}

.order-no {
  font-size: 11px;
  color: rgba(140, 190, 255, 0.8);
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.order-product {
  color: #c8e0ff;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}
.order-amount {
  color: #ffe066;
  font-weight: bold;
  font-size: 13px;
  min-width: 60px;
}
.order-store-name {
  color: rgba(160, 200, 255, 0.9);
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.order-card-sku {
  justify-content: space-between;
  color: rgba(160, 190, 240, 0.65);
}

.order-sku {
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.order-count {
  font-size: 11px;
  white-space: nowrap;
  margin-left: 6px;
  color: rgba(200, 220, 255, 0.7);
}
.order-time {
  font-size: 11px;
  white-space: nowrap;
}

/* 订单状态标签 */
.order-status {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 10px;
  white-space: nowrap;
}
.status-done {
  color: #52e5a0;
  background: rgba(82, 229, 160, 0.12);
  border: 1px solid rgba(82, 229, 160, 0.35);
}
.status-refund {
  color: #ff7875;
  background: rgba(255, 120, 117, 0.12);
  border: 1px solid rgba(255, 120, 117, 0.35);
}
.status-pending {
  color: #64d2ff;
  background: rgba(100, 210, 255, 0.12);
  border: 1px solid rgba(100, 210, 255, 0.3);
}

/* 加载/无更多提示 */
.order-tip {
  text-align: center;
  font-size: 12px;
  color: rgba(150, 190, 255, 0.5);
  padding: 8px 0;
}

.toggle-btn {
  position: absolute;
  left: 13%;
  bottom: calc(5% + 0px);
  color: rgb(100, 210, 255);
  font-size: 16px;
  cursor: pointer;
  z-index: 1200;
  background: rgba(0, 60, 120, 0.6);
  border: 1px solid rgba(100, 210, 255, 0.5);
  padding: 3px 10px;
  border-radius: 4px;
  user-select: none;
  transition: background 0.2s;
}

.toggle-btn:hover {
  background: rgba(0, 100, 180, 0.8);
}
</style>
