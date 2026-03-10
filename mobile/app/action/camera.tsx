import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { uploadPhoto, getMoldDetail } from '../../src/api/client';
import MoldPicker from '../../src/components/MoldPicker';
import { Colors } from '../../src/theme/colors';

export default function CameraScreen() {
  const router = useRouter();
  const { moldId } = useLocalSearchParams<{ moldId?: string }>();
  const [mold, setMold] = useState<any>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (moldId) getMoldDetail(Number(moldId)).then(setMold).catch(() => {});
  }, [moldId]);

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert('', '需要相机权限'); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsMultipleSelection: true });
    if (!result.canceled) {
      setPhotos((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
    }
  };

  const submit = async () => {
    if (!mold) { Alert.alert('', '请选择模具'); return; }
    if (!photos.length) { Alert.alert('', '请拍照或选择照片'); return; }
    setLoading(true);
    try {
      for (const uri of photos) {
        const fd = new FormData();
        fd.append('file', { uri, name: `mold_${mold.id}_${Date.now()}.jpg`, type: 'image/jpeg' } as any);
        fd.append('moldId', String(mold.id));
        await uploadPhoto(fd);
      }
      Alert.alert('成功', `${photos.length}张照片已上传`, [{ text: '确定', onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert('失败', e.response?.data?.message || '上传失败');
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.label}>选择模具</Text>
      <MoldPicker value={mold} onChange={setMold} />

      <Text style={s.label}>照片</Text>
      <View style={s.photoRow}>
        {photos.map((uri, i) => (
          <TouchableOpacity key={i} onPress={() => setPhotos((p) => p.filter((_, j) => j !== i))} activeOpacity={0.7}>
            <Image source={{ uri }} style={s.photo} />
            <View style={s.delBadge}><Text style={s.delText}>x</Text></View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={s.addBtn} onPress={takePhoto} activeOpacity={0.7}>
          <Text style={s.addIcon}>+</Text>
          <Text style={s.addLabel}>拍照</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.addBtn} onPress={pickPhoto} activeOpacity={0.7}>
          <Text style={s.addIcon}>+</Text>
          <Text style={s.addLabel}>相册</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={submit} disabled={loading} activeOpacity={0.7}>
        <Text style={s.btnText}>{loading ? '上传中...' : `上传 (${photos.length})`}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginTop: 16, marginBottom: 6 },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photo: { width: 90, height: 90, borderRadius: 8 },
  delBadge: { position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.danger, justifyContent: 'center', alignItems: 'center' },
  delText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  addBtn: { width: 90, height: 90, borderRadius: 8, borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.border, justifyContent: 'center', alignItems: 'center' },
  addIcon: { fontSize: 28, color: Colors.textSecondary },
  addLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  btn: { marginTop: 30, height: 48, backgroundColor: Colors.warning, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
