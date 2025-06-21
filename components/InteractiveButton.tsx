import React, { useRef } from 'react';
import { TouchableOpacity, Animated, ViewStyle, Platform } from 'react-native';

interface InteractiveButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  hapticFeedback?: boolean;
  scaleValue?: number;
}

export default function InteractiveButton({ 
  children, 
  onPress, 
  style, 
  disabled = false,
  hapticFeedback = true,
  scaleValue = 0.95
}: InteractiveButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!disabled) {
      // Haptic feedback for non-web platforms
      if (Platform.OS !== 'web' && hapticFeedback) {
        // Would use Haptics.impactAsync() here in a real app
      }
      
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: scaleValue,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}