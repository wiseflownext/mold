import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { Colors } from '../../src/theme/colors';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return <Text style={{ fontSize: 20, color: focused ? Colors.primary : Colors.textSecondary }}>{label}</Text>;
}

export default function WorkerLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: Colors.primary, headerStyle: { backgroundColor: Colors.primary }, headerTintColor: '#fff' }}>
      <Tabs.Screen name="index" options={{ title: '首页', tabBarIcon: ({ focused }) => <TabIcon label="H" focused={focused} /> }} />
      <Tabs.Screen name="molds" options={{ title: '模具', tabBarIcon: ({ focused }) => <TabIcon label="M" focused={focused} /> }} />
      <Tabs.Screen name="messages" options={{ title: '消息', tabBarIcon: ({ focused }) => <TabIcon label="N" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: '我的', tabBarIcon: ({ focused }) => <TabIcon label="U" focused={focused} /> }} />
    </Tabs>
  );
}
