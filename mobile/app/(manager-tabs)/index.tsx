import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { getMoldStats } from '../../src/api/client';
import { Colors } from '../../src/theme/colors';

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => { try { setStats(await getMoldStats()); } catch {} };
  useEffect(() => { load(); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (!stats) return <View style={s.loading}><Text>加载中...</Text></View>;

  const cards = [
    { label: '模具总数', value: stats.total, color: Colors.text },
    { label: '在用数', value: stats.inUse, color: Colors.primary },
    { label: '在用率', value: `${stats.useRate}%`, color: Colors.success },
    { label: '在库数', value: stats.inStock, color: Colors.textSecondary },
  ];

  const dist = stats.lifeDistribution || {};
  const bars = [
    { label: '0-50%', value: dist.low, color: Colors.success },
    { label: '50-80%', value: dist.mid, color: Colors.primary },
    { label: '80-90%', value: dist.high, color: Colors.warning },
    { label: '90-100%', value: dist.critical, color: Colors.orange },
    { label: '超期', value: dist.over, color: Colors.danger },
  ];
  const maxBar = Math.max(...bars.map((b) => b.value), 1);

  return (
    <ScrollView style={s.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={s.cardGrid}>
        {cards.map((c, i) => (
          <View key={i} style={s.statCard}>
            <Text style={[s.statValue, { color: c.color }]}>{c.value}</Text>
            <Text style={s.statLabel}>{c.label}</Text>
          </View>
        ))}
      </View>

      <View style={s.quickActions}>
        {[
          { label: '记录使用', color: Colors.primary, route: '/action/record-usage' },
          { label: '领用归还', color: '#13C2C2', route: '/action/borrow' },
          { label: '报修', color: Colors.danger, route: '/action/repair' },
          { label: '拍照', color: Colors.warning, route: '/action/camera' },
        ].map((a, i) => (
          <TouchableOpacity key={i} style={[s.quickBtn, { backgroundColor: a.color }]}
            onPress={() => router.push(a.route)} activeOpacity={0.7}>
            <Text style={s.quickBtnText}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>寿命分布</Text>
        {bars.map((b, i) => (
          <View key={i} style={s.barRow}>
            <Text style={s.barLabel}>{b.label}</Text>
            <View style={s.barTrack}>
              <View style={[s.barFill, { width: `${(b.value / maxBar) * 100}%`, backgroundColor: b.color }]} />
            </View>
            <Text style={s.barCount}>{b.value}</Text>
          </View>
        ))}
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>客户模具分布</Text>
        {(stats.customerMoldCount || []).map((c: any, i: number) => {
          const cmax = Math.max(...(stats.customerMoldCount || []).map((x: any) => x.count), 1);
          return (
            <View key={i} style={s.barRow}>
              <Text style={[s.barLabel, { width: 100 }]} numberOfLines={1}>{c.name}</Text>
              <View style={s.barTrack}>
                <View style={[s.barFill, { width: `${(c.count / cmax) * 100}%`, backgroundColor: Colors.primary }]} />
              </View>
              <Text style={s.barCount}>{c.count}</Text>
            </View>
          );
        })}
      </View>

      <View style={s.rowSection}>
        <View style={s.miniCard}>
          <Text style={[s.miniValue, { color: Colors.danger }]}>{stats.alertCount}</Text>
          <Text style={s.miniLabel}>未处理告警</Text>
        </View>
        <View style={s.miniCard}>
          <Text style={[s.miniValue, { color: Colors.orange }]}>{stats.repairCount}</Text>
          <Text style={s.miniLabel}>本月维修</Text>
        </View>
        <View style={s.miniCard}>
          <Text style={[s.miniValue, { color: Colors.success }]}>{stats.maintenanceDone}</Text>
          <Text style={s.miniLabel}>本月保养</Text>
        </View>
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8, gap: 8 },
  statCard: { width: '47%', backgroundColor: Colors.white, borderRadius: 10, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  section: { margin: 12, backgroundColor: Colors.white, borderRadius: 10, padding: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 12 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  barLabel: { width: 56, fontSize: 12, color: Colors.textSecondary, textAlign: 'right', marginRight: 8 },
  barTrack: { flex: 1, height: 16, backgroundColor: '#F5F5F5', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 16, borderRadius: 4 },
  barCount: { width: 30, fontSize: 12, color: Colors.text, textAlign: 'right', marginLeft: 6 },
  rowSection: { flexDirection: 'row', marginHorizontal: 12, gap: 8 },
  miniCard: { flex: 1, backgroundColor: Colors.white, borderRadius: 10, padding: 16, alignItems: 'center' },
  miniValue: { fontSize: 24, fontWeight: 'bold' },
  miniLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  quickActions: { flexDirection: 'row', paddingHorizontal: 8, gap: 8, marginTop: 4 },
  quickBtn: { flex: 1, height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  quickBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
