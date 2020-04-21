import request from '@/utils/request'

export function getByList(query) {
  return request({
    url: '/housing/getDataByList',
    method: 'get',
    params: query
  })
}

export function getDataByDelete(id) {
  return request({
    url: '/housing/delete',
    method: 'get',
    params: { id }
  })
}
export function postDataByAdd(data) {
  return request({
    url: '/housing/postDataByAdd',
    method: 'POST',
    data
  })
}
export function postLDataByUpdate(data) {
  return request({
    url: '/housing/postLDataByUpdate',
    method: 'POST',
    data
  })
}


export function getUnitByAll() {
  return request({
    url: '/unit/getUnitByAll',
    method: 'get'
  })
}
