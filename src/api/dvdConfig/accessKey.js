import request from '@/utils/request'

// 查询卡密列表
export function listAccessKey(query) {
  return request({
    url: '/dvd/access-key/list',
    method: 'get',
    params: query
  })
}

// 查询卡密详细
export function getAccessKey(accessKey) {
  return request({
    url: '/dvd/access-key/' + accessKey,
    method: 'get'
  })
}

// 新增卡密
export function addAccessKey(data) {
  return request({
    url: '/dvd/access-key',
    method: 'post',
    data: data
  })
}

// 修改卡密
export function updateAccessKey(data) {
  return request({
    url: '/dvd/access-key',
    method: 'put',
    data: data
  })
}

// 删除卡密
export function delAccessKey(accessKeys) {
  return request({
    url: '/dvd/access-key/' + accessKeys,
    method: 'delete'
  })
}

// 激活卡密
export function activateAccessKey(accessKey) {
  return request({
    url: '/dvd/access-key/activate',
    method: 'post',
    data: { accessKey: accessKey }
  })
}