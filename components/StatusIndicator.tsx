import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CircleCheck as CheckCircle, CircleAlert as AlertCircle, Clock, Zap } from 'lucide-react-native';

interface StatusIndicatorProps {
  type: 'success' | 'warning' | 'info' | 'active';
  text: string;
  size?: 'small' | 'medium' | 'large';
}

export default function StatusIndicator({ 
  type, 
  text, 
  size = 'medium' 
}: StatusIndicatorProps) {
  const getIcon = () => {
    const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
    
    switch (type) {
      case 'success':
        return <CheckCircle size={iconSize} color="#059669" strokeWidth={2} />;
      case 'warning':
        return <AlertCircle size={iconSize} color="#F59E0B" strokeWidth={2} />;
      case 'info':
        return <Clock size={iconSize} color="#2563EB" strokeWidth={2} />;
      case 'active':
        return <Zap size={iconSize} color="#DC2626" strokeWidth={2} />;
      default:
        return null;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return { bg: '#ECFDF5', border: '#059669', text: '#065F46' };
      case 'warning':
        return { bg: '#FFFBEB', border: '#F59E0B', text: '#92400E' };
      case 'info':
        return { bg: '#EFF6FF', border: '#2563EB', text: '#1E40AF' };
      case 'active':
        return { bg: '#FEF2F2', border: '#DC2626', text: '#991B1B' };
      default:
        return { bg: '#F8FAFC', border: '#E2E8F0', text: '#475569' };
    }
  };

  const colors = getColors();
  const textSize = size === 'small' ? 12 : size === 'large' ? 16 : 14;

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: colors.bg,
        borderColor: colors.border,
        paddingHorizontal: size === 'small' ? 8 : size === 'large' ? 16 : 12,
        paddingVertical: size === 'small' ? 4 : size === 'large' ? 8 : 6,
      }
    ]}>
      {getIcon()}
      <Text style={[
        styles.text,
        { 
          color: colors.text, 
          fontSize: textSize,
          marginLeft: size === 'small' ? 6 : 8,
        }
      ]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: 'Inter-Medium',
  },
});