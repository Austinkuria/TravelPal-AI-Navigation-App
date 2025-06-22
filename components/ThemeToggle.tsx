import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, setTheme, colors, isDark } = useTheme();

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.iconContainer}>
        <Sun size={16} color={!isDark ? colors.primary : colors.textTertiary} strokeWidth={2} />
      </View>
      
      <Switch
        value={isDark}
        onValueChange={toggleTheme}
        trackColor={{ 
          false: colors.border, 
          true: colors.primary 
        }}
        thumbColor={isDark ? '#FFFFFF' : colors.background}
        style={styles.switch}
      />
      
      <View style={styles.iconContainer}>
        <Moon size={16} color={isDark ? colors.primary : colors.textTertiary} strokeWidth={2} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    padding: 4,
  },
  switch: {
    marginHorizontal: 8,
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
});