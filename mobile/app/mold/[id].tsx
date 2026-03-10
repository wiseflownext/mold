import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getMoldDetail } from '../../src/api/client';
import { Colors, StatusColors } from '../../src/theme/colors';

export default function MoldDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [mold, setMold] = useState<any>(null);
  const [tab, setTab] = useState('products');

  useEffect(() => {
    getMoldDetail(Number(id)).then(setMold).catch(() => {});
  }, [id]);

  if (!mold) return <View style={s.loading}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  const lifeRate = mold.lifeRate;
  const lc = lifeRate !== null ? lifeColor(lifeRate) : Colors.textSecondary;

  const tabs = [
    { key: 'products', label: '关联产品' },
    { key: 'usage', label: '使用记录' },
    { key: 'maintenance', label: '保养记录' },
    { key: 'repair', label: '维修记录' },
  ];

  return (
    <>
    <ScrollView style={s.container}>
      <View style={s.infoCard}>
        <View style={s.row}>
          <Text style={s.moldNo}>{mold.moldNo}</Text>
          <View style={[s.tag, { backgroundColor: (StatusColors[mold.status] || '#999') + '20' }]}>
            <Text style={{ color: StatusColors[mold.status] || '#999', fontSize: 13, fontWeight: '500' }}>{mold.status}</Text>
          </View>
        </View>
        <View style={s.infoGrid}>
          <InfoItem label="类型" value={mold.type} />
          <InfoItem label="位置" value={mold.location} />
          <InfoItem label="寿命单位" value={mold.lifeUnit} />
          <InfoItem label="首次使用" value={fmtDate(mold.firstUseDate)} />
        </View>
        {lifeRate !== null && (
          <View style={s.lifeSection}>
            <Text style={s.lifeLabel}>寿命使用率</Text>
            <View style={s.progressBg}>
              <View style={[s.progressFill, { width: `${Math.min(lifeRate, 100)}%`, backgroundColor: lc }]} />
            </View>
            <View style={s.lifeRow}>
              <Text style={s.lifeText}>{mold.totalUsage} / {mold.designLife} {mold.lifeUnit}</Text>
              <Text style={[s.lifeRate, { color: lc }]}>{lifeRate}%</Text>
            </View>
          </View>
        )}
        <View style={s.infoGrid}>
          <InfoItem label="保养周期" value={mold.maintenanceCycle ? `${mold.maintenanceCycle}天` : '-'} />
          <InfoItem label="下次保养" value={fmtDate(mold.nextMaintenanceDate)} />
          <InfoItem label="鉴定周期" value={mold.inspectionCycle ? `${mold.inspectionCycle}天` : '-'} />
          <InfoItem label="下次鉴定" value={fmtDate(mold.nextInspectionDate)} />
        </View>
      </View>

      <View style={s.tabRow}>
        {tabs.map((t) => (
          <Text key={t.key} style={[s.tabItem, tab === t.key && s.tabActive]} onPress={() => setTab(t.key)}>{t.label}</Text>
        ))}
      </View>

      <View style={s.tabContent}>
        {tab === 'products' && (
          mold.moldProducts?.length ? mold.moldProducts.map((mp: any, i: number) => (
            <View key={i} style={s.recordCard}>
              <Text style={s.recordTitle}>{mp.product?.customer?.name}</Text>
              <Text style={s.recordSub}>{mp.product?.name} {mp.product?.model ? `(${mp.product.model})` : ''}</Text>
              <Text style={s.recordMeta}>零件号: {mp.product?.partNo || '-'}</Text>
            </View>
          )) : <Text style={s.emptyText}>暂无关联产品</Text>
        )}
        {tab === 'usage' && (
          mold.usageRecords?.length ? mold.usageRecords.map((r: any) => (
            <View key={r.id} style={s.recordCard}>
              <View style={s.row}><Text style={s.recordTitle}>{fmtDate(r.useDate)}</Text><Text style={s.recordMeta}>用量: {r.amount}</Text></View>
              <Text style={s.recordSub}>{r.product?.name || '-'} · {r.user?.name || '-'}</Text>
            </View>
          )) : <Text style={s.emptyText}>暂无使用记录</Text>
        )}
        {tab === 'maintenance' && (
          mold.maintenanceRecords?.length ? mold.maintenanceRecords.map((r: any) => (
            <View key={r.id} style={s.recordCard}>
              <View style={s.row}><Text style={s.recordTitle}>{fmtDate(r.date)}</Text><Text style={s.recordMeta}>{r.user?.name}</Text></View>
              <Text style={s.recordSub}>{r.content}</Text>
            </View>
          )) : <Text style={s.emptyText}>暂无保养记录</Text>
        )}
        {tab === 'repair' && (
          mold.repairOrders?.length ? mold.repairOrders.map((r: any) => (
            <View key={r.id} style={s.recordCard}>
              <View style={s.row}><Text style={s.recordTitle}>{fmtDateTime(r.createdAt)}</Text><Text style={{ color: StatusColors[r.status] || '#999', fontSize: 12 }}>{r.status}</Text></View>
              <Text style={s.recordSub}>{r.description}</Text>
            </View>
          )) : <Text style={s.emptyText}>暂无维修记录</Text>
        )}
      </View>
      <View style={{ height: 80 }} />
    </ScrollView>
    <View style={s.actionBar}>
      {[
        { label: '记录使用', color: Colors.primary, route: '/action/record-usage' },
        { label: '领用归还', color: '#13C2C2', route: '/action/borrow' },
        { label: '报修', color: Colors.danger, route: '/action/repair' },
        { label: '拍照', color: Colors.warning, route: '/action/camera' },
      ].map((a, i) => (
        <TouchableOpacity key={i} style={[s.actionItem, { backgroundColor: a.color }]}
          onPress={() => router.push(`${a.route}?moldId=${id}`)} activeOpacity={0.7}>
          <Text style={s.actionItemText}>{a.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ width: '48%', marginBottom: 10 }}>
      <Text style={{ fontSize: 12, color: Colors.textSecondary }}>{label}</Text>
      <Text style={{ fontSize: 14, color: Colors.text, marginTop: 2 }}>{value || '-'}</Text>
    </View>
  );
}

function lifeColor(r: number) {
  if (r > 100) return Colors.danger;
  if (r >= 90) return Colors.orange;
  if (r >= 80) return Colors.warning;
  if (r >= 50) return Colors.primary;
  return Colors.success;
}

function fmtDate(d: string | null) { return d ? new Date(d).toLocaleDateString('zh-CN') : '-'; }
function fmtDateTime(d: string | null) { return d ? new Date(d).toLocaleString('zh-CN') : '-'; }

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  infoCard: { margin: 12, backgroundColor: Colors.white, borderRadius: 12, padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  moldNo: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  tag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14 },
  lifeSection: { marginTop: 12, marginBottom: 4 },
  lifeLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6 },
  progressBg: { height: 12, backgroundColor: '#F0F0F0', borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: 12, borderRadius: 6 },
  lifeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  lifeText: { fontSize: 12, color: Colors.textSecondary },
  lifeRate: { fontSize: 14, fontWeight: '600' },
  tabRow: { flexDirection: 'row', marginHorizontal: 12, backgroundColor: Colors.white, borderRadius: 8, overflow: 'hidden' },
  tabItem: { flex: 1, textAlign: 'center', paddingVertical: 10, fontSize: 13, color: Colors.textSecondary },
  tabActive: { color: Colors.primary, fontWeight: '600', borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabContent: { margin: 12 },
  recordCard: { backgroundColor: Colors.white, borderRadius: 8, padding: 12, marginBottom: 8 },
  recordTitle: { fontSize: 14, fontWeight: '600', color: Colors.text },
  recordSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  recordMeta: { fontSize: 12, color: Colors.textSecondary },
  emptyText: { textAlign: 'center', color: Colors.textSecondary, paddingVertical: 40, fontSize: 15 },
  actionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 8, padding: 12, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },
  actionItem: { flex: 1, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  actionItemText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
