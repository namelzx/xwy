import Cookies from 'js-cookie'

const Community_id = '设置小区'
export function getCommunity() {
  return Cookies.get(Community_id)
}
export function setCommunity(id) {
  console.log('设置小区信息成功')
  return Cookies.set(Community_id, id)
}

export function removeCommunity() {
  return Cookies.remove(Community_id)
}
