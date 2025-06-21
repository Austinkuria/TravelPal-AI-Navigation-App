import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Alert, Text, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { Navigation, MapPin, Target, Crosshair, Route, Zap, Clock, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import AnimatedButton from './AnimatedButton';
import StatusIndicator from './StatusIndicator';

const { width, height } = Dimensions.get('window');

interface MapViewComponentProps {
  destination?: string;
  onLocationUpdate?: (location: Location.LocationObject) => void;
  showRoute?: boolean;
}

interface RouteStep {
  instruction: string;
  distance: string;
  duration: string;
  maneuver: string;
}

const MOCK_ROUTE_STEPS: RouteStep[] = [
  { instruction: "Head north on Main St", distance: "0.5 km", duration: "2 min", maneuver: "straight" },
  { instruction: "Turn right onto Highway 101", distance: "2.3 km", duration: "3 min", maneuver: "turn-right" },
  { instruction: "Continue straight for 5.2 km", distance: "5.2 km", duration: "6 min", maneuver: "straight" },
  { instruction: "Take exit 15 toward Downtown", distance: "1.1 km", duration: "2 min", maneuver: "exit-right" },
  { instruction: "Turn left onto Business Ave", distance: "0.8 km", duration: "1 min", maneuver: "turn-left" },
  { instruction: "Arrive at destination on the right", distance: "0.1 km", duration: "1 min", maneuver: "arrive" },
];

export default function MapViewComponent({ 
  destination, 
  onLocationUpdate, 
  showRoute = false 
}: MapViewComponentProps) {
  const { colors, isDark } = useTheme();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [estimatedArrival, setEstimatedArrival] = useState('3:45 PM');
  const [remainingTime, setRemainingTime] = useState('23 min');
  const [remainingDistance, setRemainingDistance] = useState('12.5 km');
  const mapRef = useRef<MapView>(null);

  // Mock destination coordinates (Downtown Office)
  const destinationCoords = {
    latitude: 37.7849,
    longitude: -122.4094,
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      onLocationUpdate?.(currentLocation);

      // Generate mock route coordinates
      if (showRoute && currentLocation) {
        generateMockRoute(currentLocation.coords, destinationCoords);
      }
    })();
  }, [showRoute]);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    if (isTracking) {
      (async () => {
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 10,
          },
          (newLocation) => {
            setLocation(newLocation);
            onLocationUpdate?.(newLocation);
            
            // Simulate step progression
            if (Math.random() > 0.95 && currentStepIndex < MOCK_ROUTE_STEPS.length - 1) {
              setCurrentStepIndex(prev => prev + 1);
            }
          }
        );
      })();
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [isTracking, currentStepIndex]);

  const generateMockRoute = (start: any, end: any) => {
    // Generate a realistic route with multiple waypoints
    const waypoints = [
      start,
      { latitude: start.latitude + 0.01, longitude: start.longitude + 0.005 },
      { latitude: start.latitude + 0.02, longitude: start.longitude + 0.015 },
      { latitude: end.latitude - 0.01, longitude: end.longitude - 0.005 },
      end,
    ];
    setRouteCoordinates(waypoints);
  };

  const centerOnUser = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };

  const getMapStyle = () => {
    return isDark ? [
      {
        "elementType": "geometry",
        "stylers": [{ "color": "#1a1a1a" }]
      },
      {
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#8a8a8a" }]
      },
      {
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#1a1a1a" }]
      },
      {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [{ "color": "#2c2c2c" }]
      },
      {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{ "color": "#0f1419" }]
      }
    ] : [];
  };

  if (errorMsg) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.surface }]}>
        <AlertTriangle size={48} color={colors.error} strokeWidth={2} />
        <Text style={[styles.errorText, { color: colors.error }]}>{errorMsg}</Text>
        <Text style={[styles.errorSubtext, { color: colors.textSecondary }]}>
          Please enable location permissions to use navigation features
        </Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.surface }]}>
        <View style={[styles.loadingSpinner, { borderColor: colors.primary }]} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Getting your location...</Text>
      </View>
    );
  }

  const currentStep = MOCK_ROUTE_STEPS[currentStepIndex];

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        customMapStyle={getMapStyle()}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        followsUserLocation={isTracking}
        showsCompass={true}
        showsScale={true}
        showsTraffic={true}
      >
        {/* User Location Marker */}
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="Your Location"
          description="Current position"
        >
          <View style={[styles.userMarker, { backgroundColor: colors.secondary }]}>
            <Navigation size={16} color="#FFFFFF" strokeWidth={2} />
          </View>
        </Marker>

        {/* Destination Marker */}
        {showRoute && (
          <Marker
            coordinate={destinationCoords}
            title="Destination"
            description={destination || "Your destination"}
          >
            <View style={[styles.destinationMarker, { backgroundColor: colors.error }]}>
              <MapPin size={16} color="#FFFFFF" strokeWidth={2} />
            </View>
          </Marker>
        )}

        {/* Route Polyline */}
        {showRoute && routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={colors.secondary}
            strokeWidth={4}
            lineDashPattern={[0]}
          />
        )}
      </MapView>

      {/* Navigation Instructions Overlay */}
      {showRoute && (
        <View style={[styles.instructionsOverlay, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.instructionHeader}
          >
            <View style={styles.instructionContent}>
              <Route size={20} color="#FFFFFF" strokeWidth={2} />
              <View style={styles.instructionText}>
                <Text style={styles.instructionTitle}>{currentStep.instruction}</Text>
                <Text style={styles.instructionDistance}>
                  {currentStep.distance} • {currentStep.duration}
                </Text>
              </View>
              <View style={styles.stepIndicator}>
                <Text style={styles.stepText}>{currentStepIndex + 1}/{MOCK_ROUTE_STEPS.length}</Text>
              </View>
            </View>
          </LinearGradient>
          
          {/* Trip Info */}
          <View style={styles.tripInfo}>
            <View style={styles.tripStat}>
              <Clock size={16} color={colors.textSecondary} strokeWidth={2} />
              <Text style={[styles.tripStatText, { color: colors.text }]}>{remainingTime}</Text>
            </View>
            <View style={styles.tripStat}>
              <Target size={16} color={colors.textSecondary} strokeWidth={2} />
              <Text style={[styles.tripStatText, { color: colors.text }]}>{remainingDistance}</Text>
            </View>
            <View style={styles.tripStat}>
              <Text style={[styles.etaLabel, { color: colors.textSecondary }]}>ETA:</Text>
              <Text style={[styles.etaTime, { color: colors.secondary }]}>{estimatedArrival}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Map Controls */}
      <View style={styles.mapControls}>
        {/* Center on User Button */}
        <AnimatedButton onPress={centerOnUser}>
          <View style={[styles.controlButton, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
            <Crosshair size={24} color={colors.primary} strokeWidth={2} />
          </View>
        </AnimatedButton>

        {/* Live Tracking Toggle */}
        <AnimatedButton onPress={toggleTracking}>
          <LinearGradient
            colors={isTracking ? [colors.secondary, colors.primary] : [colors.card, colors.border]}
            style={[styles.trackingButton, { shadowColor: colors.shadow }]}
          >
            <Zap size={20} color={isTracking ? "#FFFFFF" : colors.text} strokeWidth={2} />
            <Text style={[styles.trackingText, { color: isTracking ? "#FFFFFF" : colors.text }]}>
              {isTracking ? 'Live' : 'Track'}
            </Text>
          </LinearGradient>
        </AnimatedButton>
      </View>

      {/* Status Indicators */}
      <View style={styles.statusContainer}>
        <StatusIndicator 
          type={isTracking ? "active" : "info"} 
          text={isTracking ? "Live Tracking" : "GPS Ready"} 
          size="small" 
        />
        {showRoute && (
          <StatusIndicator type="success" text="Navigation Active" size="small" />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderWidth: 3,
    borderRadius: 20,
    borderTopColor: 'transparent',
    marginBottom: 16,
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  userMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  destinationMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  instructionsOverlay: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  instructionHeader: {
    padding: 16,
  },
  instructionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructionText: {
    flex: 1,
    marginLeft: 12,
  },
  instructionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  instructionDistance: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  stepIndicator: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  tripInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tripStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripStatText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginLeft: 6,
  },
  etaLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginRight: 4,
  },
  etaTime: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
  },
  mapControls: {
    position: 'absolute',
    right: 20,
    bottom: 120,
    gap: 12,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  trackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  trackingText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginLeft: 6,
  },
  statusContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    gap: 8,
  },
});