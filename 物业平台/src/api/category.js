import request from '@/utils/request'

export function getChargeByList(query) {
  return request({
    url: '/Charge/getChargeByList',
    method: 'get',
    params: query
  })
}

export function getDataByDelete(id) {
  return request({
    url: '/Charge/getDataByDelete',
    method: 'get',
    params: { id }
  })
}

export function postDataByAdd(data) {
  return request({
    url: '/Charge/PostDataByAdd',
    method: 'post',
    data
  })
}

export function getCategoryBychild(e) {
  return request({
    url: '/Charge/getCategoryBychild',
    method: 'get'
  })
}
/**
 * 获取所有的配置项
 */
export function getChargeByall() {
  return request({
    url: '/Charge/getChargeByall',
    method: 'get'
  })
}
