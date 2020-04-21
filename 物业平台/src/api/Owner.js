import request from '@/utils/request'

export function getByList(query) {
  return request({
    url: '/owner',
    method: 'get',
    params: query
  })
}

export function getDataByDelete(id) {
  return request({
    url: '/owner/delete',
    method: 'get',
    params: { id }
  })
}
export function postDataByAdd(data) {
  return request({
    url: '/owner',
    method: 'POST',
    data
  })
}

export function getHousingByAll(community_id) {
  return request({
    url: '/housing/getHousingByAll',
    method: 'get',
    params: { community_id }
  })
}


