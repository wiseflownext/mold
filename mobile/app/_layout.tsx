import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../src/stores/auth';

export default function RootLayout() {
  const { restore } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    restore().then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(manager-tabs)" />
        <Stack.Screen name="mold/[id]" options={{ headerShown: true, title: '模具详情', headerTintColor: '#1677FF' }} />
        <Stack.Screen name="action/record-usage" options={{ headerShown: true, title: '记录使用', headerTintColor: '#1677FF' }} />
        <Stack.Screen name="action/borrow" options={{ headerShown: true, title: '领用归还', headerTintColor: '#1677FF' }} />
        <Stack.Screen name="action/repair" options={{ headerShown: true, title: '报修', headerTintColor: '#1677FF' }} />
        <Stack.Screen name="action/camera" options={{ headerShown: true, title: '拍照', headerTintColor: '#1677FF' }} />
      </Stack>
    </>
  );
}
