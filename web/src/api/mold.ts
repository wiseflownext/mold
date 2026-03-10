import request from '@/utils/request'

export const getMoldList = (params: any) => request.get('/molds', { params })
export const getMoldDetail = (id: number) => request.get(`/molds/${id}`)
export const getMoldStats = () => request.get('/molds/stats')
export const createMold = (data: any) => request.post('/molds', data)
export const updateMold = (id: number, data: any) => request.put(`/molds/${id}`, data)
export const deleteMold = (id: number) => request.delete(`/molds/${id}`)

export const getCustomers = (params?: any) => request.get('/customers', { params })
export const getCustomerDetail = (id: number) => request.get(`/customers/${id}`)
export const createCustomer = (data: any) => request.post('/customers', data)
export const updateCustomer = (id: number, data: any) => request.put(`/customers/${id}`, data)
export const deleteCustomer = (id: number) => request.delete(`/customers/${id}`)

export const getProducts = (params?: any) => request.get('/customers/products/all', { params })
export const createProduct = (data: any) => request.post('/customers/products', data)
export const updateProduct = (id: number, data: any) => request.put(`/customers/products/${id}`, data)
export const deleteProduct = (id: number) => request.delete(`/customers/products/${id}`)

export const getDict = (code: string) => request.get(`/dict/${code}`)

export const getUsageRecords = (params: any) => request.get('/usage-records', { params })
export const getBorrowRecords = (params: any) => request.get('/borrow-records', { params })
export const getBorrowDistribution = () => request.get('/borrow-records/distribution')
export const getMaintenanceRecords = (params: any) => request.get('/maintenance-records', { params })
export const createMaintenance = (data: any) => request.post('/maintenance-records', data)
export const getMaintenancePlan = () => request.get('/maintenance-records/plan')
export const getRepairOrders = (params: any) => request.get('/repair-orders', { params })
export const updateRepairOrder = (id: number, data: any) => request.put(`/repair-orders/${id}`, data)
export const getRepairStats = () => request.get('/repair-orders/stats')
export const getInspections = (params: any) => request.get('/inspections', { params })
export const createInspection = (data: any) => request.post('/inspections', data)

export const getAlerts = (params: any) => request.get('/alerts', { params })
export const handleAlert = (id: number) => request.put(`/alerts/${id}/handle`)
export const getAlertRules = () => request.get('/alert-rules')
export const updateAlertRule = (id: number, data: any) => request.put(`/alert-rules/${id}`, data)

export const getUsers = (params: any) => request.get('/users', { params })
export const createUser = (data: any) => request.post('/users', data)
export const updateUser = (id: number, data: any) => request.put(`/users/${id}`, data)
export const deleteUser = (id: number) => request.delete(`/users/${id}`)
export const getRoles = () => request.get('/roles')
export const createRole = (data: any) => request.post('/roles', data)
export const updateRole = (id: number, data: any) => request.put(`/roles/${id}`, data)

export const getReport = () => request.get('/report')
