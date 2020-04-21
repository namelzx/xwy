import request from '@/utils/request'

export function getByList(query) {
  return request({
    url: '/unit',
    method: 'get',
    params: query
  })
}

export function getDataByDelete(id) {
  return request({
    url: '/unit/delete',
    method: 'get',
    params: { id }
  })
}
export function postDataByAdd(data) {
  return request({
    url: '/unit',
    method: 'POST',
    data
  })
}
