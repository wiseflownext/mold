import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/stores/auth';
import { Colors } from '../../src/theme/colors';

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('确认', '确定退出登录？', [
      { text: '取消' },
      { text: '确定', style: 'destructive', onPress: async () => { await logout(); router.replace('/login'); } },
    ]);
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.avatar}><Text style={s.avatarText}>{user?.name?.[0] || 'U'}</Text></View>
        <Text style={s.name}>{user?.name}</Text>
        <Text style={s.role}>{user?.role}</Text>
      </View>
      <View style={s.section}>
        <View style={s.row}><Text style={s.label}>账号</Text><Text style={s.value}>{user?.name}</Text></View>
        <View style={s.row}><Text style={s.label}>角色</Text><Text style={s.value}>{user?.role}</Text></View>
        <View style={s.row}><Text style={s.label}>版本</Text><Text style={s.value}>1.0.0</Text></View>
      </View>
      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
        <Text style={s.logoutText}>退出登录</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { alignItems: 'center', paddingVertical: 32, backgroundColor: Colors.white },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: '600', color: Colors.text, marginTop: 12 },
  role: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  section: { backgroundColor: Colors.white, marginTop: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  label: { fontSize: 15, color: Colors.text },
  value: { fontSize: 15, color: Colors.textSecondary },
  logoutBtn: { marginTop: 32, marginHorizontal: 16, height: 48, backgroundColor: Colors.white, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.danger },
  logoutText: { color: Colors.danger, fontSize: 16, fontWeight: '500' },
});
