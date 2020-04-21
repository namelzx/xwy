import request from '@/utils/request'

export function GetDataByList(data) {
  return request({
    url: '/spending/GetDataByList', // 假地址 自行替换
    method: 'get',
    params: data,
  })
}

/**
 * 
 * @param {获取用户列表} data 
 */
export function getUserByList(data) {
  return request({
    url: 'spending/getUserByList', // 假地址 自行替换
    method: 'get',
    params: data,
  })
}

export function DataStatus(data) {
  return request({
    url: 'spending/DataStatus',
    method: 'post',
    params: data
  })
}
export function postDataedit(data) {
  return request({
    url: 'spending/postUserByUpdate',
    method: 'post',
    data
  })
}

export function DataDelete(id) {
  return request({
    url: 'spending/getUserByDelete',
    method: 'get',
    params: { id }
  })
}


export function PostDataAdd(data) {
  return request({
    url: '/spending/postUserByAdd',
    method: 'post',
    data
  })
}