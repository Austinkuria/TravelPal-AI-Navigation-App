import { Tabs } from 'expo-router';
import { Map, Search, Headphones, User } from 'lucide-react-native';
import { StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar, 
          { 
            backgroundColor: colors.tabBar, 
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, 8),
            height: Platform.OS === 'ios' ? 70 + insets.bottom : 60 + insets.bottom,
          }
        ],
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarShowLabel: false,
        tabBarItemStyle: styles.tabBarItem,
        tabBarHideOnKeyboard: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Navigate',
          tabBarIcon: ({ size, color, focused }) => (
            <Map 
              size={focused ? size + 4 : size} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ size, color, focused }) => (
            <Search 
              size={focused ? size + 4 : size} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="entertainment"
        options={{
          title: 'Entertainment',
          tabBarIcon: ({ size, color, focused }) => (
            <Headphones 
              size={focused ? size + 4 : size} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color, focused }) => (
            <User 
              size={focused ? size + 4 : size} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2} 
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabBarItem: {
    paddingTop: 8,
    paddingBottom: 4,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});