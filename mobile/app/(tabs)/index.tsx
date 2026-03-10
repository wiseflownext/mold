import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/stores/auth';
import { getMoldList } from '../../src/api/client';
import { Colors, StatusColors } from '../../src/theme/colors';

export default function WorkerHome() {
  const router = useRouter();
  const { user } = useAuth();
  const [recent, setRecent] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await getMoldList({ page: 1, pageSize: 5, sortBy: 'updatedAt', sortOrder: 'desc' });
      setRecent(res.list || []);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const actions = [
    { label: '记录使用', color: Colors.primary, onPress: () => router.push('/action/record-usage') },
    { label: '领用归还', color: '#13C2C2', onPress: () => router.push('/action/borrow') },
    { label: '报修', color: Colors.danger, onPress: () => router.push('/action/repair') },
    { label: '拍照', color: Colors.warning, onPress: () => router.push('/action/camera') },
  ];

  return (
    <ScrollView style={s.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={s.welcome}>
        <Text style={s.welcomeText}>你好，{user?.name || '用户'}</Text>
        <Text style={s.roleTag}>{user?.role || '操作工'}</Text>
      </View>

      <View style={s.actions}>
        {actions.map((a, i) => (
          <TouchableOpacity key={i} style={[s.actionBtn, { backgroundColor: a.color }]} onPress={a.onPress} activeOpacity={0.7}>
            <Text style={s.actionText}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.sectionTitle}>最近模具</Text>
      {recent.map((m) => (
        <TouchableOpacity key={m.id} style={s.card} onPress={() => router.push(`/mold/${m.id}`)} activeOpacity={0.7}>
          <View style={s.cardRow}>
            <Text style={s.moldNo}>{m.moldNo}</Text>
            <View style={[s.statusTag, { backgroundColor: (StatusColors[m.status] || '#999') + '20' }]}>
              <Text style={[s.statusText, { color: StatusColors[m.status] || '#999' }]}>{m.status}</Text>
            </View>
          </View>
          <Text style={s.cardSub} numberOfLines={1}>
            {m.moldProducts?.[0]?.product?.customer?.name || '-'} · {m.moldProducts?.[0]?.product?.name || '-'}
          </Text>
          {m.lifeRate !== null && (
            <View style={s.progressBg}>
              <View style={[s.progressFill, { width: `${Math.min(m.lifeRate, 100)}%`, backgroundColor: lifeColor(m.lifeRate) }]} />
              <Text style={s.progressText}>{m.lifeRate}%</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

function lifeColor(r: number) {
  if (r > 100) return Colors.danger;
  if (r >= 90) return Colors.orange;
  if (r >= 80) return Colors.warning;
  if (r >= 50) return Colors.primary;
  return Colors.success;
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  welcome: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 8 },
  welcomeText: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  roleTag: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: Colors.primaryLight, borderRadius: 4, fontSize: 12, color: Colors.primary },
  actions: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 12 },
  actionBtn: { width: '47%', height: 80, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  actionText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.text, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },
  card: { marginHorizontal: 16, marginBottom: 10, backgroundColor: Colors.white, borderRadius: 10, padding: 14 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  moldNo: { fontSize: 16, fontWeight: '600', color: Colors.text },
  statusTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '500' },
  cardSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  progressBg: { height: 16, backgroundColor: '#F0F0F0', borderRadius: 8, marginTop: 8, overflow: 'hidden', justifyContent: 'center' },
  progressFill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 8 },
  progressText: { fontSize: 11, color: Colors.text, textAlign: 'center', fontWeight: '500' },
});
