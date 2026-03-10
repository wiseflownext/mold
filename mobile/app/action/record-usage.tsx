import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { recordUsage, getMoldDetail } from '../../src/api/client';
import MoldPicker from '../../src/components/MoldPicker';
import { Colors } from '../../src/theme/colors';

export default function RecordUsageScreen() {
  const router = useRouter();
  const { moldId } = useLocalSearchParams<{ moldId?: string }>();
  const [mold, setMold] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (moldId) getMoldDetail(Number(moldId)).then(setMold).catch(() => {});
  }, [moldId]);

  const submit = async () => {
    if (!mold) { Alert.alert('', '请选择模具'); return; }
    if (!amount || isNaN(Number(amount))) { Alert.alert('', '请输入有效用量'); return; }
    setLoading(true);
    try {
      await recordUsage({ moldId: mold.id, amount: Number(amount), remark: remark || undefined });
      Alert.alert('成功', '使用记录已提交', [{ text: '确定', onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert('失败', e.response?.data?.message || '提交失败');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <Text style={s.label}>选择模具</Text>
        <MoldPicker value={mold} onChange={setMold} />

        <Text style={s.label}>使用量 ({mold?.lifeUnit || '米'})</Text>
        <TextInput style={s.input} placeholder="输入使用量" keyboardType="numeric" value={amount} onChangeText={setAmount} />

        <Text style={s.label}>备注</Text>
        <TextInput style={[s.input, { height: 80 }]} placeholder="选填" multiline value={remark} onChangeText={setRemark} />

        <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={submit} disabled={loading} activeOpacity={0.7}>
          <Text style={s.btnText}>{loading ? '提交中...' : '提交'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginTop: 16, marginBottom: 6 },
  input: { height: 44, backgroundColor: Colors.white, borderRadius: 8, paddingHorizontal: 14, fontSize: 15, borderWidth: 1, borderColor: Colors.border, textAlignVertical: 'top' },
  btn: { marginTop: 30, height: 48, backgroundColor: Colors.primary, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
