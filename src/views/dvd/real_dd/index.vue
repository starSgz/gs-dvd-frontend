<template>
  <div class="dvd-screen">
    <!-- 头部模块 -->
    <header>
      <div class="header-title">
        <h1>抖店实时数据大屏</h1>
        <!-- <div class="header-time">{{ currentTime }}</div> -->
      </div>
      
      <!-- 右上角控件组 -->
      <div class="header-controls">
        <div class="store-select-wrapper">
          <el-select v-model="selectedStore" placeholder="选择店铺" size="small" clearable @change="handleStoreChange">
            <el-option label="全部店铺" :value="null" />
            <el-option v-for="store in storeList" :key="store.id" :label="store.name" :value="store.id" />
          </el-select>
        </div>
        <span class="control-item">CNY</span>
        <div class="screenfull-wrapper">
          <screenfull />
        </div>
      </div>
    </header>

    <div class="main">
      <!-- top5 -->
      <div class="top5">
        <div class="top5-title">
          <span>店铺</span>
          <div class="sort-switch">
            <el-radio-group v-model="sortBy" size="small" @change="loadStoreTop5">
              <el-radio-button label="amount">成交金额</el-radio-button>
              <el-radio-button label="orders">订单数</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div class="top5-content">
          <ul ref="top5ListRef">
            <li v-for="(item, index) in brandTop5" :key="index">
              <div class="cicle"></div>
              <div class="li-content">
                <span>{{ item.name }}</span>
                <span>{{ item.sales }}</span>
                <!-- <span>{{ item.rate }}%</span> -->
                <!-- <span><img :src="item.trend === 'up' ? upIcon : downIcon" alt="趋势图标"></span> -->
              </div>
            </li>
          </ul>
        </div>
        <div class="top5-title">
          <span>退款&投比</span>
        </div>
      </div>
      <!-- 销售总额 -->
      <div class="total" ref="totalRef">
        <div class="data1">
          <span>用户支付金额</span>
          <p>{{ salesMetrics.payAmt }}</p>
        </div>
        <div class="data2">
          <span>成交订单数</span>
          <p>{{ salesMetrics.payCnt }}</p>
        </div>
        <div class="data3">
          <span>商品曝光人数</span>
          <p>{{ salesMetrics.productShowUcnt }}</p>
        </div>
        <div class="data4">
          <span>退款金额(支付时间)</span>
          <p>{{ salesMetrics.refundAmtPayTime }}</p>
        </div>

        <div class="data5">
          <span>待发货</span>
          <p>{{ salesMetrics.unsend }}</p>
        </div>

        <div class="data6">
          <span>退款订单数</span>
          <p>{{ salesMetrics.refundOrderCnt }}</p>
        </div>

        <canvas class="rain" ref="rainRef"></canvas>
        <canvas class="dashed" ref="dashedRef"></canvas>
        <div class="sphere">
          <div class="sphere-bg"></div>
          <div class="sum">
            <span>成交金额</span>
            <p>{{ salesMetrics.incomeAmt }}</p>
          </div>
        </div>
        <div class="cicle3"></div>
        <div class="cicle4"></div>
        <div class="cicle5"></div>
        <div class="cicle6"></div>
        <div class="cicle7"></div>
        <div class="cicle8">
          <span>{{ salesMetrics.metrics?.adCost }}</span>
          <p>投放消耗</p>
        </div>
        <div class="cicle9">
          <span>{{ salesMetrics.metrics?.perUsrPayAmt }}</span>
          <p>客单价</p>
        </div>
        <div class="cicle10">
          <span>{{ salesMetrics.metrics?.conversionRate }}%</span>
          <p>转化率</p>
        </div>

      </div>
      <!-- 销售分析 -->
      <div class="analyse">
        <div class="analyse-title">
          <span>销售分析</span>
        </div>
        
        <!-- <ul>
          <li>
            <img src="./images/s1.png" alt="会销目标">
            <h5>会销目标</h5><br>
            <span>Marketing Target</span><br>
            <em>￥{{ meetingMetrics.target?.toLocaleString() }}</em>
          </li>
          <li>
            <img src="./images/s3.png" alt="会销实际">
            <h5>会销实际</h5><br>
            <span>Marketing Actual</span><br>
            <em>￥{{ meetingMetrics.actual?.toLocaleString() }}</em>
          </li>
          <li>
            <img src="./images/s2.png" alt="会销占比">
            <h5>会销占比</h5><br>
            <span>Marketing Ratio</span><br>
            <em>￥{{ meetingMetrics.ratio?.toLocaleString() }}</em>
          </li> -->
        <!-- </ul> -->
        <div class="execution">
          <div class="title">核心转化</div>
          <div class="cicle1"></div>
          <div class="cicle2"></div>
          <div class="waterChart1">
            <div class="chart-title">商品点击(成交转化率(次数))</div>
            <div class="chart1" ref="chart1Ref"></div>
          </div>
          <div class="waterChart2">
            <div class="chart-title">商品曝光(点击转化率)</div>
            <div class="chart2" ref="chart2Ref"></div>
          </div>
        </div>
      </div>
      <div class="sale">
        <ul>
          <li>
            <div class="showImg">
              <img src="./images/shoe.png" alt="鞋类">
            </div>
            <div class="data">
              <span>退款率</span>
            </div>
            <div class="shoeChart" ref="shoeChartRef"></div>
          </li>
          <li>
            <div class="showImg">
              <img src="./images/clothes.png" alt="服装">
            </div>
            <div class="data">
              <span>投放费比</span>
            </div>
            <div class="clothesChart" ref="clothesChartRef"></div>
          </li>
          <!-- <li>
            <div class="showImg">
              <img src="./images/mz.png" alt="配饰">
            </div>
            <div class="data">
              <span>配饰</span>
              <span>{{ categoryMetrics.accessories?.count }}</span>
            </div>
            <div class="mzChart" ref="mzChartRef"></div>
          </li> -->
        </ul>
      </div>
      <!-- 柱状图 - 支出金额 -->
      <div class="barChart" ref="barChartRef"></div>
      <!-- 折线图 -->
      <div class="lineChart" ref="lineChartRef"></div>
    </div>

    <!-- 底部模块 -->
    <!-- <div class="bottom">
      <h5><span>数据状况</span></h5>
      <p>Data Status</p>
    </div> -->
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import * as echarts from 'echarts';
import 'echarts-liquidfill';
import Screenfull from '@/components/Screenfull';
import { getDdStoreList, getDdStore, getDdOverviewMetrics, getDdHourlyTrend } from '@/api/dvd';
// 导入图片
import upIcon from './images/up.png';
import downIcon from './images/down.png';

// 导入边框图片
import borderImg from './images/border.png';
import border2Img from './images/border2.png';
import orangeImg from './images/orange.png';
import greenImg from './images/green.png';


// Refs
const top5ListRef = ref(null);
const totalRef = ref(null);
const rainRef = ref(null);
const dashedRef = ref(null);
const chart1Ref = ref(null);
const chart2Ref = ref(null);
const shoeChartRef = ref(null);
const clothesChartRef = ref(null);
const mzChartRef = ref(null);
const barChartRef = ref(null);
const lineChartRef = ref(null);

// State for cleanup
let intervalId = null;
let lineChartIntervalId = null;
let rainAnimId = null;
let resizeObserver = null;
let resizeTimeout = null;
const charts = [];

// 响应式数据
const selectedStore = ref(null);
const sortBy = ref('amount'); // 排序方式：'amount'-成交金额，'orders'-订单数

// 店铺列表
const storeList = ref([]);

// 数据状态
const brandTop5 = ref([]);
const salesMetrics = ref({
  payAmt: 0,
  payCnt: 0,
  productShowUcnt: 0,
  refundAmtPayTime: 0,
  incomeAmt: 0,
  metrics: { adCost: 0, perUsrPayAmt: 0, conversionRate: 0 },
  refundOrderCnt: 0,
  unsend: 0,
});
const meetingMetrics = ref({
  target: 0,
  actual: 0,
  ratio: 0,
  productClickPayCntRatio: 0,
  productShowClickCntRatio: 0
});
const categoryMetrics = ref({
  refundAmtRate: { count: 52563, max: 65000 },
  adExpenseRatioWithRefund: { count: 32563, max: 45000 },
  accessories: { count: 12563, max: 35000 }
});

// TOP5 Color Loop
const topColor = () => {
  if (!top5ListRef.value) return;
  const lis = top5ListRef.value.querySelectorAll('li');
  const length = lis.length;
  let i = 1;

  // Initial state setup (match CSS/JS logic)
  const updateStyles = (index) => {
    lis.forEach((li, j) => {
      const circle = li.querySelector('.cicle');
      const content = li.querySelector('.li-content');
      if (j === index) {
        // 高亮项：使用 border2.png 和 orange.png
        circle.style.background = `url(${orangeImg}) no-repeat center`;
        circle.style.backgroundSize = '100%';
        content.style.background = `url(${border2Img}) no-repeat center`;
        content.style.backgroundSize = 'contain';
      } else {
        // 普通项：使用 border.png 和 green.png
        circle.style.background = `url(${greenImg}) no-repeat center`;
        circle.style.backgroundSize = '100%';
        content.style.background = `url(${borderImg}) no-repeat center`;
        content.style.backgroundSize = 'contain';
      }
    });
  };

  // Set initial
  updateStyles(0);
  
  intervalId = setInterval(() => {
    if (!top5ListRef.value) return; 
    updateStyles(i);
    i++;
    if (i === length) {
      i = 0;
    }
  }, 3000); // 每3秒切换
};

// Water Chart
const initWaterChart = (dom, value) => {
  if (!dom) return;
  const myChart = echarts.init(dom);
  charts.push(myChart);
  
  const option = {
    series: [{
      color: ['#09828e', '#09c2c8'],
      type: 'liquidFill',
      data: [value, value],
      radius: '90%',
      outline: {
        show: false
      },
      backgroundStyle: {
        color: 'transparent',
        borderColor: '#0ac1c7',
        borderWidth: 1,
        shadowColor: 'rgba(0, 0, 0, 0.4)',
        shadowBlur: 20
      },
      shape: 'path://"M61.3,2c6.2,0,12.1,1.1,17.5,3.4C84.3,7.7,89,10.8,93,14.6c4.1,4,7.3,8.6,9.7,13.8c2.4,5.2,3.5,10.9,3.5,16.9c0,8.1-2.4,16.9-7.1,26.4c-4.7,9.4-9.9,18.2-15.5,26.2c-5.6,8-13.1,17.4-22.4,28.1c-9.3-10.7-16.8-20-22.4-28.1c-5.6-8-10.8-16.8-15.5-26.2c-4.7-9.4-7.1-18.2-7.1-26.4c0-6,1.2-11.6,3.5-16.9c2.4-5.2,5.6-9.8,9.7-13.8c4-3.9,8.8-7,14.2-9.2C49.2,3.1,55,2,61.3,2L61.3,2z"',
      label: {
        normal: {
          position: ['50%', '50%'],
          formatter: function () {
            return (value * 100) + '%';
          },
          textStyle: {
            fontSize: 14,
            color: '#D94854'
          }
        }
      }
    }]
  };
  myChart.setOption(option);
};

// Bar Chart (Shoe, Clothes, etc.)
const initBarChart = (dom, val, con, max, color) => {
  if (!dom) return;
  const chart = echarts.init(dom);
  charts.push(chart);
  
  const option = {
    grid: {
      left: '20%',
      top: '0',
      right: '20%',
      bottom: '0'
    },
    xAxis: {
      type: 'value',
      splitLine: { show: false },
      axisLine: { show: false },
      axisLabel: { show: false },
      axisTick: { show: false }
    },
    yAxis: [{
      type: "category",
      inverse: false,
      data: [],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false }
    }],
    series: [
      {
        type: 'pictorialBar',
        data: [val],
        itemStyle: {
          normal: {
            color: color
          }
        },
        symbolRepeat: 'fixed',
        symbolClip: true,
        symbolSize: [12, 24],
        symbol: 'roundRect',
        label: {
          show: true,
          position: 'left',
          formatter: function () {
            return con;
          },
          color: '#fff',
          fontSize: 16,
        },
        z: 1000
      },
      {
        type: 'pictorialBar',
        itemStyle: {
          normal: {
            color: '#193040'
          }
        },
        data: [max],
        animationDuration: 0,
        symbolRepeat: 'fixed',
        symbol: 'roundRect',
        symbolSize: [12, 24],
        label: {
          show: true,
          position: 'right',
          formatter: function () {
            return Math.floor(val * 100 / max) + '%';
          },
          color: '#fff',
          fontSize: 16,
        }
      }
    ]
  };
  chart.setOption(option);
};

// Bar Chart - 支出金额
const initBarChartHourly = (dom, hourlyData = []) => {
  if (!dom) return;
  const chart = echarts.init(dom);
  charts.push(chart);

  // 如果没有数据，生成空数据
  const xdata = hourlyData.length > 0 
    ? hourlyData.map(item => item.hour) 
    : Array.from({ length: 24 }, (_, i) => i);
  
  const dataArr = hourlyData.length > 0 
    ? hourlyData.map(item => item.value) 
    : Array(24).fill(0);

  // 计算合适的 y 轴最大值
  const maxValue = Math.max(...dataArr, 0);
  const yAxisMax = maxValue > 0 ? Math.ceil(maxValue * 1.2) : 100;

  const option = {
    title: {
      text: '今日支出金额趋势',
      left: 'center',
      top: 10,
      textStyle: {
        color: '#fff',
        fontSize: 16
      }
    },
    grid: {
      left: "8%",
      bottom: "8%",
      top: "20%",
      right: "5%",
      containLabel: true
    },
    xAxis: {
      type: "category",
      data: xdata,
      name: '小时',
      nameTextStyle: {
        color: '#fff'
      },
      axisLabel: {
        show: true,
        interval: 2,  // 每隔2个小时显示一个标签
        formatter: '{value}时',
        textStyle: {
          color: "#fff",
          fontSize: 11
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255,255,255,0.3)',
          width: 1
        }
      }
    },
    tooltip: {
      show: true,
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderColor: '#f29701',
      textStyle: {
        color: '#fff'
      },
      formatter: function(params) {
        const item = params[0];
        return `${item.axisValue}时<br/>支出金额: ¥${item.value.toLocaleString()}`;
      }
    },
    yAxis: [{
      type: 'value',
      name: '金额(元)',
      nameTextStyle: {
        color: '#fff'
      },
      min: 0,
      max: yAxisMax,
      axisLabel: {
        formatter: function(value) {
          if (value >= 10000) {
            return (value / 10000).toFixed(1) + '万';
          }
          return value;
        },
        textStyle: {
          color: '#fff',
          fontSize: 11
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255,255,255,0.3)',
          width: 1
        }
      },
      axisTick: { show: false },
      splitLine: { 
        show: true,
        lineStyle: {
          color: 'rgba(255,255,255,0.1)',
          type: 'dashed'
        }
      }
    }],
    series: [{
      type: 'bar',
      name: '支出金额',
      barWidth: '60%',
      itemStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#f29701' },
            { offset: 1, color: '#e08d03' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#ffa500' },
            { offset: 1, color: '#f29701' }
          ])
        }
      },
      data: dataArr
    }]
  };

  chart.setOption(option);
};

// Line Chart
const initLineChart = (dom, hourlyData = []) => {
  if (!dom) return;
  const chart = echarts.init(dom);
  charts.push(chart);

  // 如果没有数据，生成空数据
  const xdata = hourlyData.length > 0 
    ? hourlyData.map(item => item.hour) 
    : Array.from({ length: 24 }, (_, i) => i);
  
  const dataArr = hourlyData.length > 0 
    ? hourlyData.map(item => item.value) 
    : Array(24).fill(0);

  // 计算合适的 y 轴最大值
  const maxValue = Math.max(...dataArr, 0);
  const yAxisMax = maxValue > 0 ? Math.ceil(maxValue * 1.2) : 100;

  const option = {
    title: {
      text: '今日用户支付金额趋势',
      left: 'center',
      top: 10,
      textStyle: {
        color: '#fff',
        fontSize: 16
      }
    },
    grid: {
      left: "8%",
      bottom: "8%",
      top: "20%",
      right: "5%",
      containLabel: true
    },
    xAxis: {
      type: "category",
      data: xdata,
      name: '小时',
      nameTextStyle: {
        color: '#fff'
      },
      axisLabel: {
        show: true,
        interval: 2,  // 每隔2个小时显示一个标签
        formatter: '{value}时',
        textStyle: {
          color: "#fff",
          fontSize: 11
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255,255,255,0.3)',
          width: 1
        }
      }
    },
    tooltip: {
      show: true,
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderColor: '#00c2c2',
      textStyle: {
        color: '#fff'
      },
      formatter: function(params) {
        const item = params[0];
        return `${item.axisValue}时<br/>支付金额: ¥${item.value.toLocaleString()}`;
      }
    },
    yAxis: [{
      type: 'value',
      name: '金额(元)',
      nameTextStyle: {
        color: '#fff'
      },
      min: 0,
      max: yAxisMax,
      axisLabel: {
        formatter: function(value) {
          if (value >= 10000) {
            return (value / 10000).toFixed(1) + '万';
          }
          return value;
        },
        textStyle: {
          color: '#fff',
          fontSize: 11
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255,255,255,0.3)',
          width: 1
        }
      },
      axisTick: { show: false },
      splitLine: { 
        show: true,
        lineStyle: {
          color: 'rgba(255,255,255,0.1)',
          type: 'dashed'
        }
      }
    }],
    series: [{
      type: 'line',
      name: '用户支付金额',
      smooth: true,
      symbol: "circle",
      symbolSize: 6,
      itemStyle: {
        normal: {
          color: '#34a39a',
          lineStyle: {
            color: "#34a39a",
            width: 2
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: "#08808b"
            },
            {
              offset: 1,
              color: 'rgba(0,0,0,0.2)',
            }
            ])
          }
        }
      },
      data: dataArr
    }]
  };

  // 清除之前的定时器
  if (lineChartIntervalId) {
    clearInterval(lineChartIntervalId);
  }

  // 自动轮播 tooltip
  let index = 0;
  lineChartIntervalId = setInterval(() => {
    chart.dispatchAction({
      type: 'showTip',
      seriesIndex: 0,
      dataIndex: index
    });
    index++;
    if (index >= xdata.length) {
      index = 0;
    }
  }, 2000);

  chart.setOption(option);
};

// Rain Background
const initRainBg = () => {
  const c = rainRef.value;
  if (!c || !totalRef.value) return;
  
  const ctx = c.getContext("2d");
  let w = c.width = totalRef.value.clientWidth;
  let h = c.height = totalRef.value.clientHeight;

  const random = (min, max) => Math.random() * (max - min) + min;

  class RainDrop {
    constructor() {
      this.init();
    }
    init() {
      this.x = random(0, w);
      this.y = h;
      this.color = 'hsl(180, 100%, 50%)';
      this.vy = random(4, 5);
      this.hit = 0;
      this.size = 2;
    }
    draw() {
      if (this.y > this.hit) {
        const linearGradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.size * 30);
        linearGradient.addColorStop(0, '#14789c');
        linearGradient.addColorStop(1, '#090723');
        ctx.fillStyle = linearGradient;
        ctx.fillRect(this.x, this.y, this.size, this.size * 50);
      }
      this.update();
    }
    update() {
      if (this.y > this.hit) {
        this.y -= this.vy;
      } else {
        this.init();
      }
    }
  }

  const rs = [];
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      const r = new RainDrop();
      rs.push(r);
    }, i * 300);
  }

  const anim = () => {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < rs.length; i++) {
      rs[i].draw();
    }
    rainAnimId = requestAnimationFrame(anim);
  };

  anim();
};

// Dashed Line
const initDashed = () => {
  const canvas = dashedRef.value;
  if (!canvas || !totalRef.value) return;
  
  const ctx = canvas.getContext('2d');
  const w = canvas.width = totalRef.value.clientWidth;
  const h = canvas.height = totalRef.value.clientHeight / 3 * 2;
  
  ctx.lineWidth = 3;
  ctx.setLineDash([3, 3]);
  ctx.fillStyle = '#93f8fb';
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowColor = '#93f8fb';
  ctx.shadowBlur = 15;

  const drawCurve = (x1, y1, cp1x, cp1y, x2, y2, gradientStops) => {
    ctx.save();
    ctx.beginPath();
    const grd = ctx.createLinearGradient(x1, y1, x2, y2);
    gradientStops.forEach(stop => grd.addColorStop(stop[0], stop[1]));
    ctx.strokeStyle = grd;
    ctx.moveTo(x2, y2);
    ctx.quadraticCurveTo(cp1x, cp1y, x1, y1);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.arc(x1, y1, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // 1
  drawCurve(w / 11 * 2, h / 3, w / 5, h / 6 * 5, w / 5 * 2, h, [[0, "#54e2e6"], [1, "#065261"]]);
  // 2
  drawCurve(w / 11 * 3.3, h / 2, w / 5 * 1.5, h / 6 * 4.2, w / 3 * 1.1, h / 6 * 5, [[0, "#e08d03"], [1, "#2e6a5c"]]);
  // 3
  drawCurve(w / 3 * 1.4, h / 5, w / 3 * 1.2, h / 4 * 1.4, w / 5 * 2, h / 2, [[0, "#e08d03"], [1, "#2e6a5c"]]);
  // 4
  drawCurve(w / 5 * 3.1, h / 3 * 1.2, w / 5 * 3.35, h / 2 * 1.2, w / 5 * 3.2, h / 2 * 1.5, [[0, "#e08d03"], [1, "#2e6a5c"]]);
  // 5
  drawCurve(w / 5 * 3.3, h / 4, w / 5 * 3.8, h / 2 * 1.2, w / 5 * 3.03, h / 2 * 1.9, [[0, "#e08d03"], [1, "#2e6a5c"]]);
  // 6
  drawCurve(w / 5 * 3.8, h / 2 * 1.2, w / 5 * 3.7, h / 2 * 1.6, w / 5 * 2.9, h, [[0, "#e08d03"], [1, "#2e6a5c"]]);
};

const handleResize = () => {
  charts.forEach(chart => chart.resize());
  // Re-init canvas if needed
  if (rainRef.value && totalRef.value) {
    rainRef.value.width = totalRef.value.clientWidth;
    rainRef.value.height = totalRef.value.clientHeight;
  }
  if (dashedRef.value && totalRef.value) {
    dashedRef.value.width = totalRef.value.clientWidth;
    dashedRef.value.height = totalRef.value.clientHeight / 3 * 2;
    initDashed(); // Redraw dashed lines
  }
};

// 初始化 ResizeObserver
const initResizeObserver = () => {
  resizeObserver = new ResizeObserver(() => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      handleResize();
    }, 100);
  });
  
  const container = document.querySelector('.dvd-screen');
  if (container) {
    resizeObserver.observe(container);
  }
};

// 加载店铺列表
const loadStoreList = async () => {
  try {
    const response = await getDdStoreList();
    if (response.code === 200 && response.data) {
      storeList.value = response.data.map(item => ({
        id: item.storeId,
        name: item.storeName
      }));
    }
  } catch (error) {
    console.error('加载店铺列表失败:', error);
  }
};

// 加载店铺TOP5数据
const loadStoreTop5 = async () => {
  try {
    const params = {
      sort_by: sortBy.value,
      limit: 100
    };
    
    // 添加店铺筛选
    if (selectedStore.value) {
      params.store_id = selectedStore.value;
    }
    
    const response = await getDdStore(params);
    if (response.code === 200 && response.data) {
      brandTop5.value = response.data;
    }
  } catch (error) {
    console.error('加载店铺TOP5失败:', error);
    // 失败时使用空数组
    brandTop5.value = [];
  }
};

// 加载概览指标数据
const loadOverviewMetrics = async () => {
  try {
    const params = {};
    
    // 添加店铺筛选
    if (selectedStore.value) {
      params.store_id = selectedStore.value;
    }
    
    const response = await getDdOverviewMetrics(params);
    if (response.code === 200 && response.data) {
      const data = response.data;
      
      // 填充销售指标数据
      salesMetrics.value = {
        payAmt: data.payAmt || 0,  // 用户支付金额
        payCnt: data.payCnt || 0,  // 成交订单数
        productShowUcnt: data.productShowUcnt || 0,  // 商品曝光人数
        refundAmtPayTime: data.refundAmtPayTime || 0,  // 退款金额(支付时间)
        incomeAmt: data.incomeAmt || 0,  // 成交金额
        metrics: {
          adCost: data.adCost || 0,  // 投放消耗
          perUsrPayAmt: data.perUsrPayAmt || 0,  // 客单价
          conversionRate: data.conversionRate || 0  // 转化率
        },
        refundOrderCnt:data.refundOrderCnt, // 退款数
        unsend:data.unsend // 代发货数据
      };
      
      // 填充会销指标数据（水球图）
      meetingMetrics.value = {
        target: 0,
        actual: 0,
        ratio: 0,
        productClickPayCntRatio: data.productClickPayCntRatio ? data.productClickPayCntRatio / 100 : 0,  // 商品点击-成交转化率
        productShowClickCntRatio: data.productShowClickCntRatio ? data.productShowClickCntRatio / 100 : 0  // 商品曝光-点击转化率
      };
      
      // 填充分类指标（退款率、投放费比）
      categoryMetrics.value = {
        refundAmtRate: { count: data.refundAmtRate || 0, max: 100 },  // 退款率
        adExpenseRatioWithRefund: { count: data.adExpenseRatioWithRefund || 0, max: 100 },  // 投放费比
        accessories: { count: 0, max: 100 }
      };
      
      // 更新图表
      nextTick(() => {
        updateAllCharts();
      });
    }
  } catch (error) {
    console.error('加载概览指标失败:', error);
  }
};

// 加载小时趋势数据（支付金额）
const loadHourlyTrend = async () => {
  try {
    const params = {
      index_display: '今日用户支付金额'  // 指定查询的指标
    };
    
    // 添加店铺筛选
    if (selectedStore.value) {
      params.store_id = selectedStore.value;
    }
    
    const response = await getDdHourlyTrend(params);
    console.log('小时趋势数据（支付金额）:', response.data);  // 调试日志
    if (response.code === 200 && response.data) {
      // 更新折线图
      nextTick(() => {
        initLineChart(lineChartRef.value, response.data);
      });
    }
  } catch (error) {
    console.error('加载小时趋势失败:', error);
    // 失败时使用空数据
    nextTick(() => {
      initLineChart(lineChartRef.value, []);
    });
  }
};

// 加载小时支出金额数据（柱状图）
const loadHourlyExpense = async () => {
  try {
    const params = {
      index_display: '今日支出金额'  // 指定查询支出金额指标
    };
    
    // 添加店铺筛选
    if (selectedStore.value) {
      params.store_id = selectedStore.value;
    }
    
    const response = await getDdHourlyTrend(params);
    console.log('小时趋势数据（支出金额）:', response.data);  // 调试日志
    if (response.code === 200 && response.data) {
      // 更新柱状图
      nextTick(() => {
        initBarChartHourly(barChartRef.value, response.data);
      });
    }
  } catch (error) {
    console.error('加载小时支出金额失败:', error);
    // 失败时使用空数据
    nextTick(() => {
      initBarChartHourly(barChartRef.value, []);
    });
  }
};

// 店铺变化处理
const handleStoreChange = () => {
  console.log('店铺变化:', selectedStore.value);
  loadStoreTop5();
  loadOverviewMetrics();
  loadHourlyTrend();
  loadHourlyExpense();
};

// 更新所有图表
const updateAllCharts = () => {
  initWaterChart(chart1Ref.value, meetingMetrics.value.productClickPayCntRatio);
  initWaterChart(chart2Ref.value, meetingMetrics.value.productShowClickCntRatio);
  initBarChart(shoeChartRef.value, categoryMetrics.value.refundAmtRate.count, '', categoryMetrics.value.refundAmtRate.max, '#09c4ca');
  initBarChart(clothesChartRef.value, categoryMetrics.value.adExpenseRatioWithRefund.count, '', categoryMetrics.value.adExpenseRatioWithRefund.max, '#09c4ca');
  initBarChart(mzChartRef.value, categoryMetrics.value.accessories.count, '', categoryMetrics.value.accessories.max, '#09c4ca');
};

onMounted(async () => {
  window.addEventListener('resize', handleResize);
  initResizeObserver();
  
  // 加载店铺列表和数据
  await loadStoreList();
  await loadStoreTop5();
  await loadOverviewMetrics();
  await loadHourlyTrend();
  await loadHourlyExpense();
  
  nextTick(() => {
    topColor();
    initRainBg();
    initDashed();
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  
  if (resizeTimeout) clearTimeout(resizeTimeout);
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  
  if (intervalId) clearInterval(intervalId);
  if (lineChartIntervalId) clearInterval(lineChartIntervalId);
  if (rainAnimId) cancelAnimationFrame(rainAnimId);
  
  charts.forEach(chart => chart.dispose());
});
</script>

<style scoped>
/* Scoped styles based on original CSS */
.dvd-screen {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: url(./images/53bg.png) no-repeat;
  background-size: 100% 100%;
  font-family: 'Microsoft YaHei', sans-serif;
  display: flex;
  flex-direction: column;
}

ul,
li {
  list-style: none;
  margin: 0;
  padding: 0;
}

@font-face {
  font-family: 'LCdd';
  src: url('./fonts/LCdd.TTF');
}

header {
  height: 100px;
  width: 100%;
  background-color: transparent;
  background: url(./images/53titlebg.png) no-repeat top center;
  background-size: 100%;
  text-align: center;
  position: relative;
  flex-shrink: 0;
}

header h1 {
  font-size: 42px;
  height: 50%;
  margin: auto;
  display: table;
  font-weight: 500;
  background-image: -webkit-linear-gradient(bottom, #86919e, #fff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

header h1 span {
  display: table-cell;
  vertical-align: middle;
}

header p {
  font-size: 18px;
  background-image: -webkit-linear-gradient(bottom, #86919e, #fff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 右上角控件组样式 */
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

.main {
  width: 100%;
  flex: 1;
  padding: 0 2.5%;
  box-sizing: border-box;
  position: relative;
  min-height: 0;
}

.main .top5 {
  width: 17.5%;
  height: 70%;
  float: left;
}

.main .top5 .top5-title {
  width: 100%;
  height: 10%;
  background: url(./images/title.png) no-repeat center;
  background-size: 100%;
  color: #fff;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 25px;
  padding: 10px 0;
}

.main .top5 .top5-title > span {
  margin-bottom: 8px;
}

.main .top5 .top5-title .sort-switch {
  margin-top: 5px;
}

.main .top5 .top5-title .sort-switch :deep(.el-radio-group) {
  display: flex;
}

.main .top5 .top5-title .sort-switch :deep(.el-radio-button__inner) {
  background-color: rgba(0, 194, 194, 0.1);
  border-color: rgba(0, 194, 194, 0.3);
  color: #00c2c2;
  font-size: 12px;
  padding: 6px 12px;
  transition: all 0.3s;
}

.main .top5 .top5-title .sort-switch :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #00c2c2;
  border-color: #00c2c2;
  color: #fff;
  box-shadow: 0 0 8px rgba(0, 194, 194, 0.5);
}

.main .top5 .top5-title .sort-switch :deep(.el-radio-button__inner:hover) {
  color: #00e5e5;
  border-color: rgba(0, 194, 194, 0.6);
}

.main .top5 .top5-content {
  width: 100%;
  height: 80%;
}

.main .top5 .top5-content ul {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.main .top5 .top5-content ul::-webkit-scrollbar {
  display: none;
}

.main .top5 .top5-content ul li {
  width: 100%;
  height: 15%;
  margin-top: 5%;
  position: relative;
}

.main .top5 .top5-content ul li .li-content {
  width: 90%;
  height: 100%;
  margin-left: 5%;
  background: url(./images/border.png) no-repeat center;
  background-size: contain;
  font-size: 14px;
  padding-left: 15%;
  padding-top: 6%;
  color: #fff;
  box-sizing: border-box;
}

.main .top5 .top5-content ul li .li-content span {
  margin-right: 2%;
}

.main .top5 .top5-content ul li .cicle {
  content: '';
  display: block;
  position: absolute;
  width: 35px;
  height: 35px;
  background: url(./images/green.png) no-repeat center;
  background-size: 100%;
  left: 0;
  bottom: 0;
}

/* Initial state for first item, though JS will override */
.main .top5 .top5-content ul li:nth-of-type(1) .li-content {
  background: url(./images/border2.png) no-repeat center;
  background-size: contain;
}

.main .top5 .top5-content ul li:nth-of-type(1) .cicle {
  background: url(./images/orange.png) no-repeat center;
  background-size: 100%;
}

.main .total {
  width: 65%;
  height: 100%;
  float: left;
  position: relative;
}

.main .total .rain {
  position: absolute;
  left: 0;
  top: 0;
  z-index: -1;
}

.main .total .data1,
.main .total .data2,
.main .total .data3,
.main .total .data4,
.main .total .data5,
.main .total .data6 {
  width: 160px;
  height: 80px;
  position: absolute;
}

.main .total .data1 span,
.main .total .data2 span,
.main .total .data3 span,
.main .total .data4 span,
.main .total .data5 span,
.main .total .data6 span {
  color: #0ac1c7;
  font-size: 16px;
  font-family: '宋体';
}

.main .total .data1 p,
.main .total .data2 p,
.main .total .data3 p,
.main .total .data4 p,
.main .total .data5 p,
.main .total .data6 p {
  font-family: 'LCdd';
  font-size: 28px;
  color: #f29701;
}

.main .total .data1 {
  left: 10%;
  top: 12%;
}

.main .total .data2 {
  left: 42%;
  top: 3%;
}

.main .total .data3 {
  left: 62%;
  top: 5%;
}

.main .total .data4 {
  left: 73%;
  top: 28%;
}
.main .total .data5 {
  left: 28%;
  top: 25%;
}
.main .total .data6 {
  left: 58%;
  top: 18%;
}

.main .total .dashed {
  position: absolute;
  left: 0;
  top: 0;
}

.main .total .sphere {
  width: 400px;
  height: 400px;
  position: relative;
  margin: 14% auto 0;
}

.main .total .sphere .sphere-bg {
  position: absolute;
  z-index: 100;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: url(./images/53earth.png) no-repeat center;
  background-size: contain;
}

.main .total .sphere .sum {
  position: absolute;
  z-index: 100;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: url(./images/53cloud.png) no-repeat center;
  background-size: 55%;
}

.main .total .sphere .sum span {
  display: block;
  margin-top: 30%;
  padding-left: 32%;
  color: #005a79;
  font-size: 18px;
}

.main .total .sphere .sum p {
  margin-top: 2%;
  text-align: center;
  color: #003c63;
  font-family: 'LCdd';
  font-size: 36px;
}

.main .total .cicle3 {
  width: 700px;
  height: 700px;
  background: url(./images/circle.png) no-repeat center;
  background-size: 100%;
  position: absolute;
  top: 20%;
  left: 50%;
  transform-style: preserve-3d;
  transform: translateX(-50%) rotateX(75deg);
  animation: rotate3 20s linear infinite;
}

.main .total .cicle4 {
  width: 300px;
  height: 300px;
  position: absolute;
  top: 60%;
  left: 50%;
  transform-style: preserve-3d;
  background: url(./images/53gqright.png) no-repeat center;
  background-size: 100%;
  transform: translateX(-50%) rotateX(75deg);
  animation: rotate3 2s linear infinite;
}

.main .total .cicle5 {
  width: 300px;
  height: 300px;
  position: absolute;
  top: 62%;
  left: 50%;
  transform-style: preserve-3d;
  background: url(./images/53gqleft.png) no-repeat center;
  background-size: 100%;
  transform: translateX(-50%) rotateX(75deg);
  animation: rotate4 2s linear infinite;
}

.main .total .cicle6 {
  width: 240px;
  height: 240px;
  position: absolute;
  top: 70%;
  left: 50%;
  transform-style: preserve-3d;
  background: url(./images/535gqbottomright.png) no-repeat center;
  background-size: 100%;
  transform: translateX(-50%) rotateX(75deg);
  animation: rotate3 2s linear infinite;
}

.main .total .cicle7 {
  width: 240px;
  height: 240px;
  position: absolute;
  top: 72%;
  left: 50%;
  transform-style: preserve-3d;
  background: url(./images/53gqbottomleft.png) no-repeat center;
  background-size: 100%;
  transform: translateX(-50%) rotateX(75deg);
  animation: rotate4 2s linear infinite;
}

.main .total .cicle8,
.main .total .cicle9,
.main .total .cicle10 {
  width: 100px;
  height: 100px;
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 100;
  margin-left: -50px;
  border-radius: 50%;
}

.main .total .cicle8 span,
.main .total .cicle9 span,
.main .total .cicle10 span {
  font-family: 'LCdd';
  display: block;
  margin-left: 25%;
  font-size: 28px;
  margin-top: 20%;
}

.main .total .cicle8 p,
.main .total .cicle9 p,
.main .total .cicle10  p {
  text-align: center;
  font-size: 14px;
}

.main .total .cicle8 {
  background: url(./images/circle1.png) no-repeat;
  background-size: 100%;
  animation: rotate5 20s linear infinite;
  color: #f29701;
}

.main .total .cicle9 {
  background: url(./images/circle2.png) no-repeat;
  background-size: 100%;
  animation: rotate6 20s linear infinite;
  color: #0ac1c7;
}

.main .total .cicle10 {
  background: url(./images/circle1.png) no-repeat;
  background-size: 100%;
  animation: rotate7 20s linear infinite;
  color: #f29701;
}



.main .analyse {
  width: 17.5%;
  height: 70%;
  float: left;
}

.main .analyse .analyse-title {
  width: 100%;
  height: 10%;
  background: url(./images/title.png) no-repeat center;
  background-size: 100%;
  color: #fff;
  text-align: center;
  display: table;
  font-size: 25px;
}

.main .analyse .analyse-title span {
  display: table-cell;
  vertical-align: middle;
}

.main .analyse ul {
  width: 100%;
  height: 60%;
}

.main .analyse ul li {
  width: 100%;
  height: 30%;
  margin: 3%;
}

.main .analyse ul li img {
  height: 80%;
  float: left;
  vertical-align: 0%;
}

.main .analyse ul li h5 {
  float: left;
  color: #fff;
  margin-left: 5%;
}

.main .analyse ul li span {
  font-size: 20px;
  float: left;
  color: #fff;
  margin-left: 5%;
}

.main .analyse ul li em {
  font-style: normal;
  font-size: 24px;
  margin-left: 5%;
  color: #0ac1c7;
}

.main .analyse ul li:nth-of-type(1) em {
  color: #f29701;
}

.main .analyse .execution {
  width: 100%;
  height: 30%;
  background: url(./images/execution.png) no-repeat;
  background-size: contain;
  overflow: hidden;
  position: relative;
}

.main .analyse .execution .title {
  writing-mode: vertical-lr;
  font-size: 20px;
  margin-left: 3%;
  margin-top: 3%;
  color: #fff;
}

.main .analyse .execution .cicle1,
.main .analyse .execution .cicle2 {
  position: absolute;
  width: 80px;
  height: 80px;
  background: url(./images/2222.png) no-repeat center;
  background-size: 100%;
  transform-style: preserve-3d;
  transform: rotateX(75deg);
  animation: rotate2 1s linear infinite;
}

.main .analyse .execution .cicle1 {
  top: 47%;
  left: 20%;
}

.main .analyse .execution .cicle2 {
  top: 47%;
  left: 63%;
}

.main .analyse .execution .waterChart1,
.main .analyse .execution .waterChart2 {
  position: absolute;
  width: 80px;
  height: 100px;
}

.main .analyse .execution .waterChart1 .chart-title,
.main .analyse .execution .waterChart2 .chart-title {
  height: 20%;
  font-size: 12px;
  text-align: center;
  color: #fff;
}

.main .analyse .execution .waterChart1 .chart1,
.main .analyse .execution .waterChart2 .chart1,
.main .analyse .execution .waterChart1 .chart2,
.main .analyse .execution .waterChart2 .chart2 {
  width: 100%;
  height: 80%;
}

.main .analyse .execution .waterChart1 {
  top: 0%;
  left: 20%;
}

.main .analyse .execution .waterChart2 {
  top: 0%;
  left: 63%;
}

.main .sale {
  width: 27.5%;
  height: 30%;
  position: absolute;
  bottom: 0;
  left: 2.5%;
}

.main .sale ul {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.main .sale ul li {
  width: 100%;
  height: 30%;
  margin-top: 1%;
}

.main .sale ul li .showImg {
  float: left;
  width: 10%;
  height: 100%;
  text-align: center;
}

.main .sale ul li .showImg img {
  vertical-align: 0%;
  width: 70%;
  margin-top: 30%;
}

.main .sale ul li .data {
  float: left;
  width: 10%;
  height: 100%;
  text-align: center;
}

.main .sale ul li .data span {
  color: #fff;
  font-size: 13px;
}

.main .sale ul li .data span:nth-of-type(2) {
  color: #0ac1c7;
}

.main .sale ul li .shoeChart,
.main .sale ul li .clothesChart,
.main .sale ul li .mzChart {
  height: 100%;
  width: 75%;
  float: left;
}

.main .barChart {
  width: 27.5%;
  height: 30%;
  position: absolute;
  bottom: 32%;
  right: 2.5%;
}

.main .lineChart {
  width: 27.5%;
  height: 30%;
  position: absolute;
  bottom: 0;
  right: 2.5%;
}

.bottom {
  width: 100%;
  height: 10%;
  background: url(./images/53bottomsjbg.png) no-repeat bottom center;
  background-size: 100%;
  text-align: center;
}

.bottom h5 {
  background-image: -webkit-linear-gradient(bottom, #86919e, #fff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  height: 40%;
  display: table;
  margin: auto;
}

.bottom h5 span {
  display: table-cell;
  vertical-align: middle;
}

.bottom {
  flex-shrink: 0;
}

.bottom p {
  color: #0ac1c7;
  font-size: 13px;
}
header {
  height: 100px;
  width: 100%;
  background-color: transparent;
  background: url(./images/53titlebg.png) no-repeat top center;
  background-size: 100%;
  text-align: center;
  position: relative;
  flex-shrink: 0;
  display: flex; /* 新增 */
  align-items: center; /* 新增：垂直居中 */
  justify-content: center; /* 新增：水平居中 */
}
.header-title {
  text-align: center;
  position: relative;
  z-index: 5;
  margin-top: 0; /* 改为 0，原来是 -10px */
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
  margin: 0 auto; /* 新增：自动左右边距，实现居中 */
  display: block; /* 新增 */
}
@keyframes rotate {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes rotate2 {
  0% {
    transform: rotateX(75deg) rotateZ(0);
  }
  100% {
    transform: rotateX(75deg) rotateZ(360deg);
  }
}

@keyframes rotate3 {
  0% {
    transform: translateX(-50%) rotateX(75deg) rotateZ(0);
  }
  100% {
    transform: translateX(-50%) rotateX(75deg) rotateZ(360deg);
  }
}

@keyframes rotate4 {
  0% {
    transform: translateX(-50%) rotateX(75deg) rotateZ(0);
  }
  100% {
    transform: translateX(-50%) rotateX(75deg) rotateZ(-360deg);
  }
}

@keyframes rotate5 {
  0% {
    transform: matrix3d(0.9, 0, 0, 0, 0, 0.9, 0, 0, 0, 0, 1, 0, 270, 0, 0, 1);
    z-index: 100;
  }
  50% {
    transform: matrix3d(0.9, 0, 0, 0, 0, 0.9, 0, 0, 0, 0, 1, 0, -270, 0, 0, 1);
    z-index: 100;
  }
  100% {
    transform: matrix3d(0.9, 0, 0, 0, 0, 0.9, 0, 0, 0, 0, 1, 0, 270, 0, 0, 1);
    z-index: 100;
  }
}

@keyframes rotate6 {
  0% {
    transform: matrix3d(1.23268, 0, 0, 0, 0, 1.23268, 0, 0, 0, 0, 1, 0, -16.95344, 99.80267, 0, 1);
    z-index: 100.99803;
  }
  50% {
    transform: matrix3d(1.23268, 0, 0, 0, 0, 1.23268, 0, 0, 0, 0, 1, 0, 16.95344, 99.80267, 0, 1);
    z-index: 100.99803;
  }
  100% {
    transform: matrix3d(1.23268, 0, 0, 0, 0, 1.23268, 0, 0, 0, 0, 1, 0, -16.95344, 99.80267, 0, 1);
    z-index: 100.99803;
  }
}

@keyframes rotate7 {
  0% {
    transform: matrix3d(0.85822, 0, 0, 0, 0, 0.85822, 0, 0, 0, 0, 1, 0, -267.87097, -12.53332, 0, 1);
    z-index: 99.87467;
  }
  50% {
     transform: matrix3d(0.85822, 0, 0, 0, 0, 0.85822, 0, 0, 0, 0, 1, 0, 267.87097, -12.53332, 0, 1);
    z-index: 99.87467;
  }
  100% {
    transform: matrix3d(0.85822, 0, 0, 0, 0, 0.85822, 0, 0, 0, 0, 1, 0, -267.87097, -12.53332, 0, 1);
    z-index: 99.87467;
  }
}

@keyframes rotate8 {
  0% {
    transform: matrix3d(0.57257, 0, 0, 0, 0, 0.57257, 0, 0, 0, 0, 1, 0, 50.59331, -98.2287, 0, 1);
    z-index: 99.01771;
  }
  50% {
    transform: matrix3d(0.57257, 0, 0, 0, 0, 0.57257, 0, 0, 0, 0, 1, 0, -50.59331, -98.2287, 0, 1);
    z-index: 99.01771;
  }
  100% {
    transform: matrix3d(0.57257, 0, 0, 0, 0, 0.57257, 0, 0, 0, 0, 1, 0, 50.59331, -98.2287, 0, 1);
    z-index: 99.01771;
  }
}
</style>
