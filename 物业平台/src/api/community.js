import request from '@/utils/request'

export function getDataBylist(e) {
  return request({
    url: '/community/getDataBylist',
    method: 'get'
  })
}

export function getByFind(id) {
  return request({
    url: '/community/getDataBydetail',
    method: 'get',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function postDataByData(data) {
  return request({
    url: '/community/PostDataByData',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/article/update',
    method: 'post',
    data
  })
}
