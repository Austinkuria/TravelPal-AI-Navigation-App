import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'strong';
}

export default function GlassCard({ 
  children, 
  style, 
  intensity = 'medium' 
}: GlassCardProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={[
      styles.container, 
      {
        backgroundColor: colors.card,
        borderColor: colors.border,
        shadowColor: colors.shadow,
      },
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    padding: 20,
  },
});