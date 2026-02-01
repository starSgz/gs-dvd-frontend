import request from '@/utils/request'

// 查询配置菜单列表
export function listConfigMenu(query) {
  return request({
    url: '/dvd/config-menu/list',
    method: 'get',
    params: query
  })
}

// 查询配置菜单详细
export function getConfigMenu(menuId) {
  return request({
    url: '/dvd/config-menu/' + menuId,
    method: 'get'
  })
}

// 查询配置菜单下拉树结构
export function treeselect() {
  return request({
    url: '/dvd/config-menu/treeselect',
    method: 'get'
  })
}

// 新增配置菜单
export function addConfigMenu(data) {
  return request({
    url: '/dvd/config-menu',
    method: 'post',
    data: data
  })
}

// 修改配置菜单
export function updateConfigMenu(data) {
  return request({
    url: '/dvd/config-menu',
    method: 'put',
    data: data
  })
}

// 删除配置菜单
export function delConfigMenu(menuId) {
  return request({
    url: '/dvd/config-menu/' + menuId,
    method: 'delete'
  })
}
