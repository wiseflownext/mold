import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://121.40.172.33/api/mold';

const client = axios.create({ baseURL: API_BASE, timeout: 15000 });

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      AsyncStorage.removeItem('token');
    }
    return Promise.reject(err);
  },
);

export default client;

export async function login(username: string, password: string) {
  const res: any = await client.post('/auth/login', { username, password });
  return res;
}

export async function getMoldList(params: Record<string, any>) {
  return client.get('/molds', { params }) as any;
}

export async function getMoldDetail(id: number) {
  return client.get(`/molds/${id}`) as any;
}

export async function getMoldStats() {
  return client.get('/molds/stats') as any;
}

export async function getCustomers() {
  return client.get('/customers') as any;
}

export async function recordUsage(data: { moldId: number; amount: number; productId?: number; remark?: string }) {
  return client.post('/molds/record-usage', data) as any;
}

export async function borrowMold(data: { moldId: number; workshop?: string; machine?: string }) {
  return client.post('/molds/borrow', data) as any;
}

export async function returnMold(data: { moldId: number }) {
  return client.post('/molds/return', data) as any;
}

export async function reportRepair(data: { moldId: number; description: string }) {
  return client.post('/molds/report-repair', data) as any;
}

export async function uploadPhoto(formData: FormData) {
  return client.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }) as any;
}
