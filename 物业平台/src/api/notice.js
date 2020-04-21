import request from '@/utils/request'

export function GetDataByList(data) {
  return request({
    url: '/notice/GetDataByList',
    method: 'get',
    params: data
  })
}

export function GetDataByStatus(data) {
  return request({
    url: '/notice/GetDataByStatus',
    method: 'post',
    data
  })
}

export function GetDataByDelete(id) {
  return request({
    url: '/notice/GetDataByDelete',
    method: 'get',
    params: { id }
  })
}

export function GetDataBydetailed(id) {
  return request({
    url: '/notice/GetDataBydetailed',
    method: 'get',
    params: { id }
  })
}

export function PostDataByAdd(data) {
  return request({
    url: '/notice/PostDataByAdd',
    method: 'post',
    data
  })
}
export function PostDataByUpdate(data) {
  return request({
    url: '/notice/PostDataByUpdate',
    method: 'post',
    data
  })
}

