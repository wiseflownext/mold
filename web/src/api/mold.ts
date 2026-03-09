import request from '@/utils/request'

export function getMoldList(params: Record<string, any>) {
  return request.get('/molds', { params })
}

export function getMoldDetail(id: number) {
  return request.get(`/molds/${id}`)
}

export function getMoldStats() {
  return request.get('/molds/stats')
}

export function createMold(data: Record<string, any>) {
  return request.post('/molds', data)
}

export function updateMold(id: number, data: Record<string, any>) {
  return request.put(`/molds/${id}`, data)
}

export function deleteMold(id: number) {
  return request.delete(`/molds/${id}`)
}

export function getCustomers() {
  return request.get('/customers')
}

export function getProducts(params?: Record<string, any>) {
  return request.get('/customers/products/all', { params })
}

export function getDict(code: string) {
  return request.get(`/dict/${code}`)
}
