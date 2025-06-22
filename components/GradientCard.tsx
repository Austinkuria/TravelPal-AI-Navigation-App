import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientCardProps {
  children: React.ReactNode;
  colors: string[];
  style?: ViewStyle;
  borderRadius?: number;
}

export default function GradientCard({ 
  children, 
  colors, 
  style, 
  borderRadius = 16 
}: GradientCardProps) {
  return (
    <LinearGradient
      colors={colors}
      style={[styles.container, { borderRadius }, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});