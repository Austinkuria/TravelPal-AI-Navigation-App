import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapPin, Globe, CircleAlert as AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

interface MapViewComponentProps {
  destination?: string;
  onLocationUpdate?: (location: any) => void;
  showRoute?: boolean;
}

export default function MapViewComponent({ 
  destination, 
  onLocationUpdate, 
  showRoute = false 
}: MapViewComponentProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <LinearGradient
        colors={[colors.primary + '20', colors.secondary + '20']}
        style={styles.gradientBackground}
      />
      
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
          <Globe size={48} color={colors.primary} strokeWidth={2} />
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>
          Map View
        </Text>
        
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Interactive maps are not available on web
        </Text>
        
        {destination && (
          <View style={[styles.destinationCard, { backgroundColor: colors.card }]}>
            <MapPin size={20} color={colors.secondary} strokeWidth={2} />
            <Text style={[styles.destinationText, { color: colors.text }]}>
              Destination: {destination}
            </Text>
          </View>
        )}
        
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <AlertCircle size={16} color={colors.warning} strokeWidth={2} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            To use full navigation features, please use the mobile app
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  destinationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  destinationText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 8,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginLeft: 8,
    textAlign: 'center',
    lineHeight: 16,
  },
});