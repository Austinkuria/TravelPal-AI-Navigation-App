import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Animated, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Navigation, MapPin, Clock, Zap, Mic, MicOff, Route, TriangleAlert as AlertTriangle, Car, Fuel, Coffee, Star, ArrowRight, Target, Chrome as Home, Briefcase, UtensilsCrossed, Map } from 'lucide-react-native';
import GlassCard from '@/components/GlassCard';
import InteractiveButton from '@/components/InteractiveButton';
import PulseAnimation from '@/components/PulseAnimation';
import StatusIndicator from '@/components/StatusIndicator';
import LoadingSpinner from '@/components/LoadingSpinner';
import ThemeToggle from '@/components/ThemeToggle';
import MapViewComponent from '@/components/MapView';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const RECENT_DESTINATIONS = [
  { id: 1, name: 'Downtown Office', address: '123 Business St', time: '25 min', distance: '12.5 km' },
  { id: 2, name: 'Central Mall', address: '456 Shopping Ave', time: '18 min', distance: '8.2 km' },
  { id: 3, name: 'Airport Terminal', address: '789 Flight Rd', time: '45 min', distance: '32.1 km' },
];

const LIVE_TRAFFIC_ALERTS = [
  { id: 1, type: 'warning', message: 'Heavy traffic on Highway 101 - 15 min delay', severity: 'medium', icon: AlertTriangle },
  { id: 2, type: 'info', message: 'Construction on Main St - Use alternate route', severity: 'low', icon: Route },
];

const QUICK_ACTIONS = [
  {
    id: 'home',
    title: 'Home',
    subtitle: 'Go to home',
    icon: Home,
    colors: ['#4F46E5', '#6366F1'],
    destination: 'Home'
  },
  {
    id: 'work',
    title: 'Work',
    subtitle: 'Office location',
    icon: Briefcase,
    colors: ['#059669', '#10B981'],
    destination: 'Work'
  },
  {
    id: 'gas',
    title: 'Gas Station',
    subtitle: 'Find fuel nearby',
    icon: Fuel,
    colors: ['#DC2626', '#EF4444'],
    destination: 'Gas Station'
  },
  {
    id: 'food',
    title: 'Restaurant',
    subtitle: 'Find food nearby',
    icon: UtensilsCrossed,
    colors: ['#F59E0B', '#FBBF24'],
    destination: 'Restaurant'
  },
];

export default function NavigateScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [isListening, setIsListening] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Current Location');
  const [destination, setDestination] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tripTime, setTripTime] = useState('0:00');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [routeOptions, setRouteOptions] = useState<any[]>([]);
  const [selectedQuickAction, setSelectedQuickAction] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState<any>(null);

  // Reset animations when theme changes
  useEffect(() => {
    // This ensures the component re-renders properly when theme changes
  }, [isDark]);

  const toggleVoiceAssistant = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setAiSuggestion('🎯 I found 3 optimal routes to your destination. The fastest route saves 12 minutes!');
      setRouteOptions([
        { name: 'Fastest Route', time: '23 min', distance: '15.2 km', traffic: 'light', savings: '12 min faster' },
        { name: 'Scenic Route', time: '28 min', distance: '18.7 km', traffic: 'moderate', savings: 'Most beautiful' },
        { name: 'Eco Route', time: '26 min', distance: '16.1 km', traffic: 'light', savings: '15% less fuel' },
      ]);
    } else {
      setAiSuggestion('');
      setRouteOptions([]);
    }
  };

  const startNavigation = () => {
    if (destination.trim()) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsNavigating(true);
        setShowMap(true);
        setTripTime('0:35');
        setAiSuggestion('🚗 Navigation started! I\'ll monitor traffic and suggest rest stops after 3 hours of driving.');
      }, 2000);
    }
  };

  const selectDestination = (dest: any) => {
    setDestination(dest.name);
  };

  const handleQuickAction = (action: any) => {
    setSelectedQuickAction(action.id);
    setDestination(action.destination);
    
    // Reset selection after animation
    setTimeout(() => {
      setSelectedQuickAction(null);
    }, 200);
  };

  const handleLocationUpdate = (location: any) => {
    setUserLocation(location);
    setCurrentLocation(`${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`);
  };

  const toggleMapView = () => {
    setShowMap(!showMap);
  };

  const styles = createStyles(colors, insets);

  if (showMap) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Map Header */}
        <View style={[styles.mapHeader, { backgroundColor: colors.background }]}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: colors.card }]}
            onPress={() => setShowMap(false)}
          >
            <ArrowRight size={20} color={colors.text} strokeWidth={2} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <View style={styles.mapHeaderContent}>
            <Text style={[styles.mapHeaderTitle, { color: colors.text }]}>Navigation</Text>
            <Text style={[styles.mapHeaderSubtitle, { color: colors.textSecondary }]}>
              {destination || 'Select destination'}
            </Text>
          </View>
          <TouchableOpacity style={[styles.mapToggleButton, { backgroundColor: colors.card }]}>
            <Map size={20} color={colors.primary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Full Screen Map */}
        <MapViewComponent 
          destination={destination}
          onLocationUpdate={handleLocationUpdate}
          showRoute={isNavigating}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={colors.headerGradient}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.headerText}>
              <Text style={styles.title}>TravelPal</Text>
              <Text style={styles.subtitle}>Your AI Navigation Partner</Text>
            </View>
            <ThemeToggle />
          </View>
          <View style={styles.statusContainer}>
            <StatusIndicator 
              type="active" 
              text="AI Assistant Ready" 
              size="small" 
            />
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView 
        style={[styles.content, { backgroundColor: colors.surface }]} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Map Preview Card */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🗺️ Live Map View</Text>
          <InteractiveButton onPress={toggleMapView}>
            <GlassCard style={styles.mapPreviewCard}>
              <View style={styles.mapPreviewContent}>
                <View style={[styles.mapPreviewIcon, { backgroundColor: `${colors.secondary}20` }]}>
                  <Map size={32} color={colors.secondary} strokeWidth={2} />
                </View>
                <View style={styles.mapPreviewText}>
                  <Text style={[styles.mapPreviewTitle, { color: colors.text }]}>Open Interactive Map</Text>
                  <Text style={[styles.mapPreviewSubtitle, { color: colors.textSecondary }]}>
                    Real-time location tracking with turn-by-turn navigation
                  </Text>
                  <View style={styles.mapFeatures}>
                    <StatusIndicator type="success" text="GPS Ready" size="small" />
                    <StatusIndicator type="info" text="Live Traffic" size="small" />
                  </View>
                </View>
                <ArrowRight size={24} color={colors.textTertiary} strokeWidth={2} />
              </View>
            </GlassCard>
          </InteractiveButton>
        </View>

        {/* Live Traffic Alerts */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🚨 Live Traffic Updates</Text>
          <View style={styles.alertsContainer}>
            {LIVE_TRAFFIC_ALERTS.map((alert, index) => (
              <InteractiveButton key={alert.id} onPress={() => {}}>
                <GlassCard style={styles.trafficAlert}>
                  <View style={styles.alertContent}>
                    <alert.icon size={20} color={colors.secondary} strokeWidth={2} />
                    <Text style={[styles.alertText, { color: colors.textSecondary }]}>{alert.message}</Text>
                    <ArrowRight size={16} color={colors.textTertiary} strokeWidth={2} />
                  </View>
                </GlassCard>
              </InteractiveButton>
            ))}
          </View>
        </View>

        {/* Location Input Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📍 Plan Your Journey</Text>
          
          <GlassCard style={styles.inputCard}>
            <View style={styles.inputContainer}>
              <View style={[styles.locationDot, { backgroundColor: colors.secondary }]} />
              <Text style={[styles.currentLocation, { color: colors.textSecondary }]}>{currentLocation}</Text>
            </View>
            
            <View style={[styles.inputSeparator, { backgroundColor: colors.border }]} />
            
            <View style={styles.inputContainer}>
              <View style={[styles.locationDot, { backgroundColor: colors.error }]} />
              <TextInput
                style={[styles.destinationInput, { color: colors.text }]}
                placeholder="Where would you like to go?"
                placeholderTextColor={colors.textTertiary}
                value={destination}
                onChangeText={setDestination}
              />
            </View>
          </GlassCard>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>⚡ Quick Destinations</Text>
          <View style={styles.quickActionsContainer}>
            {QUICK_ACTIONS.map((action) => (
              <InteractiveButton 
                key={action.id}
                onPress={() => handleQuickAction(action)}
                scaleValue={0.96}
              >
                <View style={[
                  styles.quickActionCard,
                  selectedQuickAction === action.id && styles.quickActionCardSelected
                ]}>
                  <LinearGradient
                    colors={action.colors}
                    style={styles.quickActionGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <View style={styles.quickActionContent}>
                      <View style={styles.quickActionIconContainer}>
                        <action.icon size={20} color="#FFFFFF" strokeWidth={2} />
                      </View>
                      <View style={styles.quickActionTextContainer}>
                        <Text style={styles.quickActionTitle} numberOfLines={1}>{action.title}</Text>
                        <Text style={styles.quickActionSubtitle} numberOfLines={1}>{action.subtitle}</Text>
                      </View>
                      <ArrowRight size={16} color="rgba(255,255,255,0.7)" strokeWidth={2} />
                    </View>
                  </LinearGradient>
                </View>
              </InteractiveButton>
            ))}
          </View>
        </View>

        {/* Recent Destinations */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🕒 Recent Destinations</Text>
          <View style={styles.recentContainer}>
            {RECENT_DESTINATIONS.map((dest, index) => (
              <InteractiveButton 
                key={dest.id} 
                onPress={() => selectDestination(dest)}
              >
                <GlassCard style={styles.recentDestination}>
                  <View style={styles.destContent}>
                    <View style={[styles.destIcon, { backgroundColor: `${colors.secondary}20` }]}>
                      <MapPin size={20} color={colors.secondary} strokeWidth={2} />
                    </View>
                    <View style={styles.destInfo}>
                      <Text style={[styles.destName, { color: colors.text }]}>{dest.name}</Text>
                      <Text style={[styles.destAddress, { color: colors.textSecondary }]}>{dest.address}</Text>
                      <View style={styles.destMeta}>
                        <Text style={[styles.destDistance, { color: colors.secondary }]}>{dest.distance}</Text>
                        <Text style={[styles.destTime, { color: colors.textTertiary }]}>{dest.time}</Text>
                      </View>
                    </View>
                    <ArrowRight size={20} color={colors.textTertiary} strokeWidth={2} />
                  </View>
                </GlassCard>
              </InteractiveButton>
            ))}
          </View>
        </View>

        {/* AI Voice Assistant */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🤖 AI Voice Assistant</Text>
          <View style={styles.voiceSection}>
            <PulseAnimation isActive={isListening} color={colors.secondary} size={120}>
              <InteractiveButton onPress={toggleVoiceAssistant} scaleValue={0.9}>
                <LinearGradient
                  colors={isListening ? [colors.secondary, colors.primary] : [colors.card, colors.border]}
                  style={styles.voiceButton}
                >
                  {isListening ? (
                    <Mic size={32} color="#FFFFFF" strokeWidth={2} />
                  ) : (
                    <MicOff size={32} color={colors.text} strokeWidth={2} />
                  )}
                </LinearGradient>
              </InteractiveButton>
            </PulseAnimation>
            <Text style={[styles.voiceButtonText, { color: colors.textSecondary }]}>
              {isListening ? '🎤 Listening for commands...' : '🗣️ Tap to speak with AI'}
            </Text>
          </View>
        </View>

        {/* AI Suggestion */}
        {aiSuggestion ? (
          <View style={styles.aiSuggestionContainer}>
            <GlassCard style={styles.aiSuggestionCard}>
              <LinearGradient
                colors={['#FF6B6B', '#FF8E8E']}
                style={styles.aiSuggestionGradient}
              >
                <View style={styles.aiSuggestionContent}>
                  <Zap size={24} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.aiSuggestionText}>{aiSuggestion}</Text>
                </View>
              </LinearGradient>
            </GlassCard>
          </View>
        ) : null}

        {/* Route Options */}
        {routeOptions.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>🛣️ Route Options</Text>
            <View style={styles.routeContainer}>
              {routeOptions.map((route, index) => (
                <InteractiveButton key={index} onPress={() => {}}>
                  <GlassCard style={styles.routeOption}>
                    <View style={styles.routeHeader}>
                      <View style={[styles.routeIconContainer, { backgroundColor: `${colors.secondary}20` }]}>
                        <Route size={20} color={colors.secondary} strokeWidth={2} />
                      </View>
                      <View style={styles.routeInfo}>
                        <Text style={[styles.routeName, { color: colors.text }]}>{route.name}</Text>
                        <Text style={[styles.routeSavings, { color: colors.secondary }]}>{route.savings}</Text>
                      </View>
                      <View style={styles.routeStats}>
                        <Text style={[styles.routeTime, { color: colors.secondary }]}>{route.time}</Text>
                        <Text style={[styles.routeDistance, { color: colors.textSecondary }]}>{route.distance}</Text>
                      </View>
                    </View>
                    <StatusIndicator 
                      type={route.traffic === 'light' ? 'success' : 'warning'} 
                      text={`${route.traffic} traffic`} 
                      size="small" 
                    />
                  </GlassCard>
                </InteractiveButton>
              ))}
            </View>
          </View>
        )}

        {/* Navigation Status */}
        {isNavigating && (
          <View style={styles.section}>
            <GlassCard style={styles.navigationCard}>
              <LinearGradient
                colors={[colors.secondary, colors.primary]}
                style={styles.navigationGradient}
              >
                <View style={styles.navigationHeader}>
                  <Navigation size={24} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.navigationTitle}>🎯 Navigation Active</Text>
                </View>
                <View style={styles.navigationDetails}>
                  <View style={styles.navigationStat}>
                    <Clock size={16} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.navigationStatText}>{tripTime} elapsed</Text>
                  </View>
                  <View style={styles.navigationStat}>
                    <Target size={16} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.navigationStatText}>12.5 km remaining</Text>
                  </View>
                </View>
                <View style={styles.etaContainer}>
                  <Text style={styles.etaText}>ETA: 3:45 PM</Text>
                  <Text style={styles.etaSubtext}>On time arrival</Text>
                </View>
              </LinearGradient>
            </GlassCard>
          </View>
        )}

        {/* Start Navigation Button */}
        <View style={styles.buttonContainer}>
          <InteractiveButton 
            onPress={startNavigation}
            disabled={!destination.trim() || isLoading}
          >
            <LinearGradient
              colors={destination.trim() && !isLoading ? [colors.secondary, colors.primary] : [colors.border, colors.textTertiary]}
              style={styles.startButtonGradient}
            >
              {isLoading ? (
                <LoadingSpinner size={24} color="#FFFFFF" />
              ) : (
                <Navigation size={24} color="#FFFFFF" strokeWidth={2} />
              )}
              <Text style={styles.startButtonText}>
                {isLoading ? 'Finding Best Route...' : '🚀 Start Navigation'}
              </Text>
            </LinearGradient>
          </InteractiveButton>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any, insets: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: insets.top + 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0,212,255,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#9CA3AF',
  },
  statusContainer: {
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: Math.max(insets.bottom + 120, 140),
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 16,
  },
  mapPreviewCard: {
    padding: 20,
  },
  mapPreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapPreviewIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  mapPreviewText: {
    flex: 1,
  },
  mapPreviewTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 4,
  },
  mapPreviewSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  mapFeatures: {
    flexDirection: 'row',
    gap: 8,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: insets.top + 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  mapHeaderContent: {
    flex: 1,
  },
  mapHeaderTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 2,
  },
  mapHeaderSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  mapToggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertsContainer: {
    gap: 12,
  },
  trafficAlert: {
    padding: 16,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    flex: 1,
    marginLeft: 12,
  },
  inputCard: {
    padding: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  inputSeparator: {
    height: 1,
    marginHorizontal: 20,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
  },
  currentLocation: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  destinationInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    flex: 1,
  },
  quickActionsContainer: {
    gap: 12,
  },
  quickActionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionCardSelected: {
    transform: [{ scale: 0.98 }],
  },
  quickActionGradient: {
    borderRadius: 16,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  quickActionIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quickActionTextContainer: {
    flex: 1,
  },
  quickActionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  recentContainer: {
    gap: 12,
  },
  recentDestination: {
    padding: 16,
  },
  destContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  destIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  destInfo: {
    flex: 1,
  },
  destName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  destAddress: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 4,
  },
  destMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  destDistance: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  destTime: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  voiceSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  voiceButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  voiceButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
  aiSuggestionContainer: {
    marginBottom: 24,
  },
  aiSuggestionCard: {
    padding: 0,
  },
  aiSuggestionGradient: {
    borderRadius: 16,
    padding: 20,
  },
  aiSuggestionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  aiSuggestionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  routeContainer: {
    gap: 12,
  },
  routeOption: {
    padding: 16,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  routeSavings: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  routeStats: {
    alignItems: 'flex-end',
  },
  routeTime: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
  routeDistance: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  navigationCard: {
    padding: 0,
  },
  navigationGradient: {
    borderRadius: 16,
    padding: 20,
  },
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  navigationTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  navigationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navigationStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navigationStatText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  etaContainer: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  etaText: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFFFFF',
  },
  etaSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  buttonContainer: {
    marginBottom: 30,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  startButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginLeft: 12,
  },
});