import request from '@/utils/request'

export function getByList(query) {
  return request({
    url: '/statistical/getYears',
    method: 'get',
    params: query
  })
}

export function getCuntslist(community_id) {
  return request({
    url: '/count/getToday',
    method: 'get',
    params: { community_id}
  })
}

export function getCunpay() {
  return request({
    url: '/count/pay',
    method: 'get'
  })
}