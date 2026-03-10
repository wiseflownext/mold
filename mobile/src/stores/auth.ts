import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserInfo {
  id: number;
  name: string;
  role: string;
  roleCode: string;
  appMode?: string;
}

let _user: UserInfo | null = null;
let _token: string | null = null;
const _listeners = new Set<() => void>();

function notify() { _listeners.forEach((fn) => fn()); }

export function useAuth() {
  const [, setState] = useState(0);
  useEffect(() => {
    const fn = () => setState((s) => s + 1);
    _listeners.add(fn);
    return () => { _listeners.delete(fn); };
  }, []);

  const setAuth = useCallback(async (token: string, user: UserInfo) => {
    _token = token;
    _user = user;
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    notify();
  }, []);

  const logout = useCallback(async () => {
    _token = null;
    _user = null;
    await AsyncStorage.multiRemove(['token', 'user']);
    notify();
  }, []);

  const restore = useCallback(async () => {
    const t = await AsyncStorage.getItem('token');
    const u = await AsyncStorage.getItem('user');
    if (t && u) {
      _token = t;
      _user = JSON.parse(u);
      notify();
    }
  }, []);

  return {
    token: _token,
    user: _user,
    isWorker: _user?.appMode === 'worker' || _user?.roleCode === 'worker',
    isManager: _user?.appMode === 'manager' || _user?.roleCode === 'admin' || _user?.roleCode === 'manager',
    setAuth,
    logout,
    restore,
  };
}
