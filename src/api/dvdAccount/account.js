import request from '@/utils/request'

// 查询账号列表
export function listAccount(query) {
  return request({
    url: '/dvd/account/list',
    method: 'get',
    params: query
  })
}

// 查询账号详细
export function getAccount(accountId) {
  return request({
    url: '/dvd/account/' + accountId,
    method: 'get'
  })
}

// 新增账号
export function addAccount(data) {
  return request({
    url: '/dvd/account',
    method: 'post',
    data: data
  })
}

// 修改账号
export function updateAccount(data) {
  return request({
    url: '/dvd/account',
    method: 'put',
    data: data
  })
}

// 删除账号
export function delAccount(accountIds) {
  return request({
    url: '/dvd/account/' + accountIds,
    method: 'delete'
  })
}

// 获取登录二维码
export function getQRCode(data) {
  return request({
    url: '/dvd/account/qrcode/get',
    method: 'post',
    data: data
  })
}

// 检查二维码状态
export function checkQRCodeStatus(data) {
  return request({
    url: '/dvd/account/qrcode/status',
    method: 'post',
    data: data
  })
}

// 获取当前用户信息（昵称、卡密、到期时间）
export function getDvdUserInfo() {
  return request({
    url: '/dvd/account/dvd_user_info',
    method: 'get'
  })
}

// 发送身份验证码（短信/邮箱）
export function sendVerifyCode(data) {
  return request({
    url: '/dvd/account/qrcode/send_code',
    method: 'post',
    data: data
  })
}

// 提交身份验证码
export function submitVerifyCode(data) {
  return request({
    url: '/dvd/account/qrcode/submit_code',
    method: 'post',
    data: data
  })
}