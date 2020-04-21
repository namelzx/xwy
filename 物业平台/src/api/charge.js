import request from '@/utils/request'

export function getChargeByList(query) {
    return request({
        url: '/Charge/getLChargeByList',
        method: 'get',
        params: query
    })
}


export function getLIChargeByList(query) {
    return request({
        url: '/Charge/getLIChargeByList',
        method: 'get',
        params: query
    })
}



export function getDataByDelete(id) {
    return request({
        url: '/Charge/getLDataByDelete',
        method: 'get',
        params: { id }
    })
}


export function getLIDataByDelete(id) {
    return request({
        url: '/Charge/getLIDataByDelete',
        method: 'get',
        params: { id }
    })
}



export function getChargeByFind(id){
    return request({
        url: '/Charge/getChargeByFind',
        method: 'get',
        params: { id }
    })
}

export function postDataByAdd(data) {
    return request({
        url: '/Charge/PostLDataByData',
        method: 'post',
        data
    })
}



export function PostLIDataByData(data) {
    return request({
        url: '/Charge/PostLIDataByData',
        method: 'post',
        data
    })
}


/**
 * 修改数据
 */
export function postLDataByUpdate(data) {
    return request({
        url: '/Charge/postLDataByUpdate',
        method: 'post',
        data
    })
}

/**
 * 获取所有的配置项
 */
export function getChargeByall() {
    return request({
        url: '/Charge/getChargeByall',
        method: 'get'
    })
}

/**
 * 根据收费类型获取收费项
 */
export function getLChargeByCategory(data) {
    return request({
        url: '/Charge/getLChargeByCategory',
        method: 'post',
        data
    })
}
