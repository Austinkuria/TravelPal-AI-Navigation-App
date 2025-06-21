import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  border: string;
  shadow: string;
  overlay: string;
  gradientStart: string;
  gradientEnd: string;
  tabBar: string;
  headerGradient: string[];
  glassBackground: string;
  glassBorder: string;
}

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
}

const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F8FAFC',
  card: '#FFFFFF',
  text: '#1E293B',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  primary: '#2563EB',
  secondary: '#00D4FF',
  accent: '#7C3AED',
  success: '#059669',
  warning: '#F59E0B',
  error: '#DC2626',
  border: '#E2E8F0',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  gradientStart: '#EFF6FF',
  gradientEnd: '#DBEAFE',
  tabBar: '#FFFFFF',
  headerGradient: ['#2563EB', '#3B82F6', '#60A5FA'],
  glassBackground: 'rgba(255, 255, 255, 0.95)',
  glassBorder: 'rgba(37, 99, 235, 0.2)',
};

const darkColors: ThemeColors = {
  background: '#0F1419',
  surface: '#1A1D29',
  card: '#252A3A',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  primary: '#3B82F6',
  secondary: '#00D4FF',
  accent: '#8B5CF6',
  success: '#10B981',
  warning: '#FBBF24',
  error: '#EF4444',
  border: '#374151',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.7)',
  gradientStart: '#0F1419',
  gradientEnd: '#1A1D29',
  tabBar: '#1A1D29',
  headerGradient: ['#0F1419', '#1A1D29', '#252A3A'],
  glassBackground: 'rgba(255, 255, 255, 0.1)',
  glassBorder: 'rgba(255, 255, 255, 0.2)',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>('light');

  const isDark = theme === 'system' 
    ? systemColorScheme === 'dark' 
    : theme === 'dark';

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}