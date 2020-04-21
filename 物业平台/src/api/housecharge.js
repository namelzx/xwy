import request from '@/utils/request'

export function getByList(query) {
  return request({
    url: '/housing/getAssociated',
    method: 'get',
    params: query
  })
}

export function getSelectedCharge(id) {
  return request({
    url: '/housing/getSelectedCharge',
    method: 'get',
    params: { id }
  })
}
export function postSelectedCharge(data) {
  return request({
    url: '/housing/postSelectedCharge',
    method: 'post',
    data
  })
  
}
