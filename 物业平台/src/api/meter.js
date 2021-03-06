import request from '@/utils/request'

/**
 * 获取所有的房屋
 */

export function getHousingitem() {
  return request({
    url: '/getHousingitem',
    method: 'get'
  })
}
export function getByList(query) {
  return request({
    url: '/bill/getMeterByData',
    method: 'get',
    params: query
  })
}

export function getDataByDelete(id) {
  return request({
    url: '/Charge/getLDataByDelete',
    method: 'get',
    params: { id }
  })
}

export function postDataByAdd(data) {
  return request({
    url: '/bill/postMeterByData',
    method: 'post',
    data
  })
}

export function postDataByUpdate(data) {
  return request({
    url: '/bill/postDataByUpdate',
    method: 'post',
    data
  })
}
/**
 * 修改数据
 */
export function postLDataByUpdate(data) {
  return request({
    url: '/Charge/postLDataByUpdate',
    method: 'post',
    data
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

/**
 * 根据收费类型获取收费项
 */
export function getLChargeByCategory(data) {
  return request({
    url: '/Charge/getLChargeByCategory',
    method: 'post',
    data
  })
}


export function getLastmonthMeter(community_id) {
  return request({
    url: '/bill/getLastmonthMeter',
    method: 'get',
    params: { community_id}
  })
}
