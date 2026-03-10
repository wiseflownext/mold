import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { login } from '../src/api/client';
import { useAuth } from '../src/stores/auth';
import { Colors } from '../src/theme/colors';

export default function Login() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) return Alert.alert('提示', '请输入账号和密码');
    setLoading(true);
    try {
      const res = await login(username, password);
      await setAuth(res.token, res.user);
      const isWorker = res.user.appMode === 'worker' || res.user.roleCode === 'worker';
      router.replace(isWorker ? '/(tabs)' : '/(manager-tabs)');
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || '网络错误';
      Alert.alert('登录失败', `${msg}\n${e.config?.baseURL || ''}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.card}>
        <Text style={s.title}>模具管家</Text>
        <Text style={s.subtitle}>工厂模具智能管理系统</Text>
        <TextInput style={s.input} placeholder="账号" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <TextInput style={s.input} placeholder="密码" value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleLogin} disabled={loading} activeOpacity={0.7}>
          <Text style={s.btnText}>{loading ? '登录中...' : '登 录'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  card: { width: '85%', backgroundColor: Colors.white, borderRadius: 16, padding: 32, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 32 },
  input: { width: '100%', height: 48, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 16, fontSize: 16, marginBottom: 16 },
  btn: { width: '100%', height: 48, backgroundColor: Colors.primary, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: Colors.white, fontSize: 18, fontWeight: '600' },
});
