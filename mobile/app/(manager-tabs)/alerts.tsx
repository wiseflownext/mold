import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../src/theme/colors';

export default function Alerts() {
  return (
    <View style={s.container}>
      <Text style={s.empty}>暂无告警</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' },
  empty: { fontSize: 16, color: Colors.textSecondary },
});
