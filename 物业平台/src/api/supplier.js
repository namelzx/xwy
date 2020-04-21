import request from '@/utils/request'

export function GetDataByList(data) {
  return request({
    url: '/supplier/GetDataByList', // 假地址 自行替换
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
    url: '/supplier/getUserByList', // 假地址 自行替换
    method: 'get',
    params: data,
  })
}

export function DataStatus(data) {
  return request({
    url: '/supplier/DataStatus',
    method: 'post',
    params: data
  })
}
/**
 *获取所有小区 
 */
export function GetDataTypeByList() {
  return request({
    url: '/supplier/getCommunityBylist', // 假地址 自行替换
    method: 'get'
  })
}
export function postDataedit(data) {
  return request({
    url: '/supplier/postUserByUpdate',
    method: 'post',
    data
  })
}

export function DataDelete(id) {
  return request({
    url: '/supplier/getUserByDelete',
    method: 'get',
    params: { id }
  })
}


export function PostDataAdd(data) {
  return request({
    url: '/supplier/postUserByAdd',
    method: 'post',
    data
  })
}