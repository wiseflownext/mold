import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { getMoldList } from '../../src/api/client';
import { Colors, StatusColors } from '../../src/theme/colors';

const TYPES = ['全部', '模压', '口型', '接角'];
const STATUSES = ['在库', '在用', '保养中', '维修中', '封存', '待鉴定'];

export default function MoldListScreen() {
  const router = useRouter();
  const [list, setList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('全部');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (p = 1, append = false) => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page: p, pageSize: 20 };
      if (search) params.moldNo = search;
      if (type !== '全部') params.type = type;
      const res = await getMoldList(params);
      setList(append ? (prev) => [...prev, ...(res.list || [])] : res.list || []);
      setTotal(res.total || 0);
      setPage(p);
    } catch {} finally { setLoading(false); }
  }, [search, type]);

  useEffect(() => { fetchData(1); }, [type]);

  const onRefresh = async () => { setRefreshing(true); await fetchData(1); setRefreshing(false); };
  const onEndReached = () => { if (!loading && list.length < total) fetchData(page + 1, true); };

  function lifeColor(r: number) {
    if (r > 100) return Colors.danger;
    if (r >= 90) return Colors.orange;
    if (r >= 80) return Colors.warning;
    if (r >= 50) return Colors.primary;
    return Colors.success;
  }

  const renderItem = ({ item: m }: any) => (
    <TouchableOpacity style={s.card} onPress={() => router.push(`/mold/${m.id}`)} activeOpacity={0.7}>
      <View style={s.cardHeader}>
        <Text style={s.moldNo}>{m.moldNo}</Text>
        <View style={[s.statusTag, { backgroundColor: (StatusColors[m.status] || '#999') + '20' }]}>
          <Text style={[s.statusText, { color: StatusColors[m.status] || '#999' }]}>{m.status}</Text>
        </View>
      </View>
      <Text style={s.sub} numberOfLines={1}>
        {m.moldProducts?.[0]?.product?.customer?.name || '-'} · {m.moldProducts?.[0]?.product?.name || '-'}
      </Text>
      <View style={s.cardFooter}>
        <Text style={s.typeTag}>{m.type}</Text>
        <Text style={s.locText}>{m.location}</Text>
        {m.lifeRate !== null && (
          <View style={s.miniProgress}>
            <View style={[s.miniFill, { width: `${Math.min(m.lifeRate, 100)}%`, backgroundColor: lifeColor(m.lifeRate) }]} />
          </View>
        )}
        {m.lifeRate !== null && <Text style={[s.rateText, { color: lifeColor(m.lifeRate) }]}>{m.lifeRate}%</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      <View style={s.searchRow}>
        <TextInput style={s.searchInput} placeholder="搜索模具编号" value={search} onChangeText={setSearch}
          onSubmitEditing={() => fetchData(1)} returnKeyType="search" />
      </View>
      <View style={s.filterRow}>
        {TYPES.map((t) => (
          <TouchableOpacity key={t} style={[s.filterBtn, type === t && s.filterActive]} onPress={() => setType(t)}>
            <Text style={[s.filterText, type === t && s.filterActiveText]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList data={list} renderItem={renderItem} keyExtractor={(m) => String(m.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={onEndReached} onEndReachedThreshold={0.3}
        ListHeaderComponent={<Text style={s.totalText}>共 {total} 条</Text>}
        ListEmptyComponent={!loading ? <Text style={s.emptyText}>暂无数据</Text> : null}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  searchRow: { padding: 12, paddingBottom: 4 },
  searchInput: { height: 40, backgroundColor: Colors.white, borderRadius: 8, paddingHorizontal: 14, fontSize: 15, borderWidth: 1, borderColor: Colors.border },
  filterRow: { flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 8, gap: 8 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: Colors.white },
  filterActive: { backgroundColor: Colors.primary },
  filterText: { fontSize: 13, color: Colors.textSecondary },
  filterActiveText: { color: '#fff' },
  totalText: { fontSize: 12, color: Colors.textSecondary, paddingHorizontal: 16, paddingVertical: 4 },
  emptyText: { textAlign: 'center', color: Colors.textSecondary, marginTop: 60, fontSize: 15 },
  card: { marginHorizontal: 12, marginBottom: 8, backgroundColor: Colors.white, borderRadius: 10, padding: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  moldNo: { fontSize: 16, fontWeight: '600', color: Colors.text },
  statusTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '500' },
  sub: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  typeTag: { fontSize: 12, color: Colors.primary, backgroundColor: Colors.primaryLight, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  locText: { fontSize: 12, color: Colors.textSecondary },
  miniProgress: { flex: 1, height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, overflow: 'hidden' },
  miniFill: { height: 6, borderRadius: 3 },
  rateText: { fontSize: 12, fontWeight: '600', width: 40, textAlign: 'right' },
});
