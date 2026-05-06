import { Tabs } from 'expo-router';
import { Home, BarChart3, Trophy, MessageCircle } from 'lucide-react-native';
import { View, StyleSheet } from 'react-native';

const ACCENT = '#22d3ee';

function TabIcon({ icon: Icon, color, focused }: { icon: any; color: string; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && { backgroundColor: `${ACCENT}18`, borderColor: `${ACCENT}44` }]}>
      <Icon size={20} color={focused ? ACCENT : color} strokeWidth={focused ? 2.5 : 2} />
    </View>
  );
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: '#475569',
        tabBarLabelStyle: styles.tabLabel,
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => <TabIcon icon={Home} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groupes',
          tabBarIcon: ({ color, focused }) => <TabIcon icon={Trophy} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, focused }) => <TabIcon icon={BarChart3} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => <TabIcon icon={MessageCircle} color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    height: 80,
    paddingBottom: 16,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  iconWrap: {
    width: 40,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
