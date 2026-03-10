import { Redirect } from 'expo-router';
import { useAuth } from '../src/stores/auth';

export default function Index() {
  const { token, isWorker } = useAuth();
  if (!token) return <Redirect href="/login" />;
  if (isWorker) return <Redirect href="/(tabs)" />;
  return <Redirect href="/(manager-tabs)" />;
}
