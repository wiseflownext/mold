import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { borrowMold, returnMold, getMoldDetail } from '../../src/api/client';
import MoldPicker from '../../src/components/MoldPicker';
import { Colors } from '../../src/theme/colors';

export default function BorrowScreen() {
  const router = useRouter();
  const { moldId } = useLocalSearchParams<{ moldId?: string }>();
  const [mold, setMold] = useState<any>(null);
  const [mode, setMode] = useState<'borrow' | 'return'>('borrow');
  const [workshop, setWorkshop] = useState('');
  const [machine, setMachine] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (moldId) getMoldDetail(Number(moldId)).then((m) => {
      setMold(m);
      if (m.status === '在用') setMode('return');
    }).catch(() => {});
  }, [moldId]);

  const submit = async () => {
    if (!mold) { Alert.alert('', '请选择模具'); return; }
    setLoading(true);
    try {
      if (mode === 'borrow') {
        await borrowMold({ moldId: mold.id, workshop: workshop || undefined, machine: machine || undefined });
      } else {
        await returnMold({ moldId: mold.id });
      }
      Alert.alert('成功', mode === 'borrow' ? '领用成功' : '归还成功', [{ text: '确定', onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert('失败', e.response?.data?.message || '操作失败');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <View style={s.modeRow}>
          {(['borrow', 'return'] as const).map((m) => (
            <TouchableOpacity key={m} style={[s.modeBtn, mode === m && s.modeActive]} onPress={() => setMode(m)} activeOpacity={0.7}>
              <Text style={[s.modeText, mode === m && s.modeActiveText]}>{m === 'borrow' ? '领用' : '归还'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>选择模具</Text>
        <MoldPicker value={mold} onChange={(m) => { setMold(m); if (m.status === '在用') setMode('return'); }} />

        {mode === 'borrow' && (
          <>
            <Text style={s.label}>车间</Text>
            <TextInput style={s.input} placeholder="选填" value={workshop} onChangeText={setWorkshop} />
            <Text style={s.label}>机台</Text>
            <TextInput style={s.input} placeholder="选填" value={machine} onChangeText={setMachine} />
          </>
        )}

        <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }, mode === 'return' && { backgroundColor: '#13C2C2' }]} onPress={submit} disabled={loading} activeOpacity={0.7}>
          <Text style={s.btnText}>{loading ? '提交中...' : mode === 'borrow' ? '确认领用' : '确认归还'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 16 },
  modeRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  modeBtn: { flex: 1, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  modeActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  modeText: { fontSize: 15, color: Colors.textSecondary },
  modeActiveText: { color: '#fff', fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginTop: 16, marginBottom: 6 },
  input: { height: 44, backgroundColor: Colors.white, borderRadius: 8, paddingHorizontal: 14, fontSize: 15, borderWidth: 1, borderColor: Colors.border },
  btn: { marginTop: 30, height: 48, backgroundColor: Colors.primary, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
