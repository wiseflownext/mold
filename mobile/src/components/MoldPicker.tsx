import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { getMoldList } from '../api/client';
import { Colors, StatusColors } from '../theme/colors';

interface Props {
  value?: any;
  onChange: (mold: any) => void;
}

export default function MoldPicker({ value, onChange }: Props) {
  const [keyword, setKeyword] = useState('');
  const [list, setList] = useState<any[]>([]);
  const [show, setShow] = useState(!value);

  const search = useCallback(async (q: string) => {
    if (!q) { setList([]); return; }
    try {
      const res = await getMoldList({ page: 1, pageSize: 10, moldNo: q });
      setList(res.list || []);
    } catch {}
  }, []);

  useEffect(() => { const t = setTimeout(() => search(keyword), 300); return () => clearTimeout(t); }, [keyword]);

  if (value && !show) {
    return (
      <TouchableOpacity style={s.selected} onPress={() => { setShow(true); setKeyword(''); }} activeOpacity={0.7}>
        <Text style={s.selectedNo}>{value.moldNo}</Text>
        <View style={[s.tag, { backgroundColor: (StatusColors[value.status] || '#999') + '20' }]}>
          <Text style={{ color: StatusColors[value.status] || '#999', fontSize: 12 }}>{value.status}</Text>
        </View>
        <Text style={s.changeBtn}>更换</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View>
      <TextInput style={s.input} placeholder="输入模具编号搜索" value={keyword} onChangeText={setKeyword} autoFocus />
      <FlatList data={list} keyExtractor={(m) => String(m.id)} style={s.list}
        ListEmptyComponent={keyword ? <Text style={s.empty}>无结果</Text> : null}
        renderItem={({ item: m }) => (
          <TouchableOpacity style={s.item} onPress={() => { onChange(m); setShow(false); }} activeOpacity={0.7}>
            <Text style={s.itemNo}>{m.moldNo}</Text>
            <Text style={s.itemSub}>{m.type} · {m.status} · {m.location}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  input: { height: 44, backgroundColor: Colors.white, borderRadius: 8, paddingHorizontal: 14, fontSize: 15, borderWidth: 1, borderColor: Colors.border },
  list: { maxHeight: 200, marginTop: 4 },
  item: { paddingVertical: 10, paddingHorizontal: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  itemNo: { fontSize: 15, fontWeight: '600', color: Colors.text },
  itemSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  empty: { textAlign: 'center', color: Colors.textSecondary, paddingVertical: 20 },
  selected: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: Colors.border },
  selectedNo: { fontSize: 16, fontWeight: '600', color: Colors.text, flex: 1 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
  changeBtn: { fontSize: 13, color: Colors.primary },
});
