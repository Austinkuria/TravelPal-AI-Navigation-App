import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, 
  ScrollView, Image, Dimensions, RefreshControl, Animated, 
  Alert, Modal, PanResponder, FlatList, Pressable 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Search, MapPin, Star, Clock, Filter, Coffee, UtensilsCrossed, 
  Car, Fuel, Heart, Navigation2, Phone, ArrowRight, Eye, Info, 
  Map, ChevronDown, X, Share2, Bookmark, Camera, BookOpen,
  Mic 
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import Voice from '@react-native-voice/voice';
import { Audio } from 'expo-av';
import VoiceHelper from '../../utils/voiceHelper';
import Reanimated, { 
  useSharedValue, useAnimatedStyle, withSpring,  
  withTiming, interpolate, Extrapolate, SlideInUp, FadeIn,
  ZoomIn, ZoomOut, withDelay, runOnJS
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import GlassCard from '../../components/GlassCard';
import InteractiveButton from '../../components/InteractiveButton';
import StatusIndicator from '../../components/StatusIndicator';
import PulseAnimation from '../../components/PulseAnimation';
import AnimatedButton from '../../components/AnimatedButton';
import { useTheme } from '../../contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Import MapView based on platform
import MapView from '../../components/MapView.native';

const { width } = Dimensions.get('window');

const NEARBY_PLACES = [
  {
    id: 1,
    name: 'Bella Vista Café',
    type: 'Restaurant',
    rating: 4.8,
    reviewCount: 324,
    distance: '0.3 km',
    estimatedTime: '2 min',
    category: 'Italian',
    image: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: '$$',
    isOpen: true,
    specialOffer: '20% off lunch menu',
    phone: '+1 (555) 123-4567',
    description: 'Authentic Italian cuisine with a modern twist',
  },
  {
    id: 2,
    name: 'Highway Rest Stop',
    type: 'Rest Area',
    rating: 4.2,
    reviewCount: 156,
    distance: '1.2 km',
    estimatedTime: '5 min',
    category: 'Rest Stop',
    image: 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: '$',
    isOpen: true,
    amenities: ['WiFi', 'Restrooms', 'Parking'],
    description: 'Clean facilities with 24/7 access',
  },
  {
    id: 3,
    name: 'Shell Gas Station',
    type: 'Gas Station',
    rating: 4.0,
    reviewCount: 89,
    distance: '0.8 km',
    estimatedTime: '3 min',
    category: 'Fuel',
    image: 'https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: '$',
    isOpen: true,
    fuelPrice: '$3.45/gal',
    description: 'Premium fuel with convenience store',
  },
  {
    id: 4,
    name: 'Ocean View Restaurant',
    type: 'Restaurant',
    rating: 4.9,
    reviewCount: 567,
    distance: '2.1 km',
    estimatedTime: '8 min',
    category: 'Seafood',
    image: 'https://images.pexels.com/photos/696218/pexels-photo-696218.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: '$$$',
    isOpen: true,
    specialOffer: 'Happy hour 3-6 PM',
    description: 'Fresh seafood with stunning ocean views',
  },
];

const CATEGORIES = [
  { id: 'all', name: 'All', icon: Search, color: '#6B7280' },
  { id: 'restaurants', name: 'Restaurants', icon: UtensilsCrossed, color: '#00D4FF' },
  { id: 'gas', name: 'Gas Stations', icon: Fuel, color: '#FF6B6B' },
  { id: 'rest', name: 'Rest Areas', icon: Car, color: '#4F46E5' },
  { id: 'coffee', name: 'Coffee', icon: Coffee, color: '#F59E0B' },
];

// AnimatedPlaceCard component to replace standard place cards
interface Place {
  id: number;
  name: string;
  type: string;
  rating: number;
  reviewCount: number;
  distance: string;
  estimatedTime: string;
  category: string;
  image: string;
  price: string;
  isOpen: boolean;
  description: string;
  specialOffer?: string;
  phone?: string;
  amenities?: string[];
  fuelPrice?: string;
}

interface AnimatedPlaceCardProps {
  place: Place;
  onOpen: (place: Place) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  colors: any;
  isDark: boolean;
}

const AnimatedPlaceCard = ({ place, onOpen, isFavorite, onToggleFavorite, colors, isDark }: AnimatedPlaceCardProps) => {
  // Access styles from the ExploreScreen component
  const styles = createStyles(colors, { top: 0, bottom: 0, left: 0, right: 0 }, isDark);
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(0);
  const cardOpacity = useSharedValue(1);
  const cardScale = useSharedValue(1);
  const actionOpacity = useSharedValue(0);
  const zoomValue = useSharedValue(1);
  
  // Enhanced multi-directional gesture support
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      'worklet';
      actionOpacity.value = withTiming(1, { duration: 100 });
      runOnJS(Haptics.selectionAsync)();
    })
    .onUpdate((event) => {
      'worklet';
      translateX.value = Math.max(-150, Math.min(150, event.translationX));
      
      // Enhanced zoom effect based on swipe distance
      zoomValue.value = interpolate(
        Math.abs(translateX.value),
        [0, 50, 100, 150],
        [1, 0.98, 0.95, 0.92],
        Extrapolate.CLAMP
      );
      
      // Color feedback during swipe
      cardOpacity.value = interpolate(
        Math.abs(translateX.value),
        [0, 150],
        [1, 0.8],
        Extrapolate.CLAMP
      );
    })
    .onEnd((event) => {
      'worklet';
      const velocity = event.velocityX;
      const distance = translateX.value;
      
      if (distance < -100 || (distance < -50 && velocity < -500)) {
        // Strong left swipe - Quick view action
        translateX.value = withSpring(-30, { damping: 15 });
        zoomValue.value = withSpring(1.05, { damping: 15 });
        cardOpacity.value = withTiming(1);
        translateX.value = withDelay(300, withSpring(0));
        zoomValue.value = withDelay(300, withSpring(1));
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        runOnJS(onOpen)(place);
      } else if (distance > 100 || (distance > 50 && velocity > 500)) {
        // Strong right swipe - Favorite action
        translateX.value = withSpring(30, { damping: 15 });
        zoomValue.value = withSpring(1.05, { damping: 15 });
        cardOpacity.value = withTiming(1);
        translateX.value = withDelay(300, withSpring(0));
        zoomValue.value = withDelay(300, withSpring(1));
        runOnJS(Haptics.notificationAsync)(
          isFavorite ? Haptics.NotificationFeedbackType.Warning : Haptics.NotificationFeedbackType.Success
        );
        runOnJS(onToggleFavorite)(place.id);
      } else if (distance < -50) {
        // Medium left swipe - Navigate action
        translateX.value = withSpring(-15);
        zoomValue.value = withSpring(1);
        cardOpacity.value = withTiming(1);
        translateX.value = withDelay(400, withSpring(0));
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        // Could trigger navigation to the place
      } else {
        // Reset position with bounce effect
        translateX.value = withSpring(0, { damping: 12, stiffness: 100 });
        zoomValue.value = withSpring(1, { damping: 12 });
        cardOpacity.value = withTiming(1);
      }
      actionOpacity.value = withTiming(0, { duration: 300 });
    });

  const pressGesture = Gesture.Tap()
    .onBegin(() => {
      'worklet';
      cardScale.value = withTiming(0.98, { duration: 100 });
    })
    .onFinalize(() => {
      'worklet';
      cardScale.value = withTiming(1, { duration: 200 });
      runOnJS(onOpen)(place);
    });

  const composedGesture = Gesture.Simultaneous(panGesture, pressGesture);

  const animatedCardStyle = useAnimatedStyle(() => {
    return {      transform: [
        { translateX: translateX.value },
        { scale: cardScale.value },
        { scale: zoomValue.value }
      ],
      opacity: cardOpacity.value,
      shadowOpacity: interpolate(
        Math.abs(translateX.value),
        [0, 100],
        [0.1, 0.3],
        Extrapolate.CLAMP
      ),
    };
  });
  
  const rightActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, 80],
      [0, 1],
      Extrapolate.CLAMP
    );
    
    return {
      opacity: opacity,
      right: 20,
    };
  });
  
  const leftActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, -80],
      [0, 1],
      Extrapolate.CLAMP
    );
    
    return {
      opacity: opacity,
      left: 20,
    };
  });

  return (    <View style={{ marginBottom: 16, paddingHorizontal: 16 }}>
      {/* Background action indicators with enhanced styling */}
      <Reanimated.View style={[
        styles.actionIndicator, 
        rightActionStyle, 
        { 
          backgroundColor: `${colors.accent}20`,
          borderWidth: 1,
          borderColor: `${colors.accent}40`,
        }
      ]}>
        <Reanimated.View
          style={[
            useAnimatedStyle(() => ({
              transform: [{ scale: interpolate(translateX.value, [0, 80], [0.8, 1.2], Extrapolate.CLAMP) }],
            })),
          ]}
        >
          <Heart size={24} color={colors.accent} fill={colors.accent} strokeWidth={2} />
        </Reanimated.View>
        <Text style={{ 
          color: colors.accent, 
          fontFamily: 'Inter-Medium', 
          marginTop: 4,
          fontSize: 12
        }}>
          Favorite
        </Text>
      </Reanimated.View>
      
      <Reanimated.View style={[
        styles.actionIndicator, 
        leftActionStyle, 
        { 
          backgroundColor: `${colors.primary}20`,
          borderWidth: 1,
          borderColor: `${colors.primary}40`,
        }
      ]}>
        <Reanimated.View
          style={[
            useAnimatedStyle(() => ({
              transform: [{ scale: interpolate(translateX.value, [0, -80], [0.8, 1.2], Extrapolate.CLAMP) }],
            })),
          ]}
        >
          <Navigation2 size={24} color={colors.primary} strokeWidth={2} />
        </Reanimated.View>
        <Text style={{ 
          color: colors.primary, 
          fontFamily: 'Inter-Medium',          marginTop: 4,
          fontSize: 12
        }}>
          View Details
        </Text>
      </Reanimated.View>
      
      {/* Card */}
      <GestureDetector gesture={composedGesture}>
        <Reanimated.View style={[animatedCardStyle]}>
          <GlassCard style={styles.placeCard}>
            <View style={styles.placeImageContainer}>
              <Image source={{ uri: place.image }} style={styles.placeImage} />
              
              {/* Special Offer Badge */}
              {place.specialOffer && (
                <LinearGradient
                  colors={['#FF6B6B', '#FF8E8E']}
                  style={styles.offerBadge}
                >
                  <Text style={styles.offerText}>🎉 {place.specialOffer}</Text>
                </LinearGradient>
              )}
              
              {/* View Details Button */}
              <TouchableOpacity 
                style={styles.viewButton}
                onPress={() => {
                  onOpen(place);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Eye size={16} color="#FFFFFF" strokeWidth={2} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.placeInfo}>
              <View style={styles.placeHeader}>
                <Text style={[styles.placeName, { color: colors.text }]}>{place.name}</Text>
                <TouchableOpacity 
                  onPress={() => {
                    onToggleFavorite(place.id);
                    Haptics.impactAsync(
                      isFavorite 
                        ? Haptics.ImpactFeedbackStyle.Light 
                        : Haptics.ImpactFeedbackStyle.Medium
                    );
                  }}
                  style={styles.favoriteButton}
                >
                  <Heart 
                    size={20} 
                    color={isFavorite ? "#FF6B6B" : colors.textTertiary} 
                    fill={isFavorite ? "#FF6B6B" : "transparent"}
                    strokeWidth={2} 
                  />
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.placeDescription, { color: colors.textSecondary }]}>{place.description}</Text>
              
              <View style={styles.ratingContainer}>
                <Star size={16} color="#F59E0B" fill="#F59E0B" strokeWidth={2} />
                <Text style={[styles.ratingText, { color: colors.text }]}>{place.rating}</Text>
                <Text style={[styles.reviewCount, { color: colors.textTertiary }]}>({place.reviewCount})</Text>                <StatusIndicator 
                  type={place.isOpen ? "success" : "warning"} 
                  text={place.isOpen ? "Open" : "Closed"} 
                  size="small" 
                />
              </View>
                <View style={styles.placeDetails}>
                {(() => {
                  switch (place.type) {
                    case 'Restaurant':
                      return <UtensilsCrossed size={20} color={colors.secondary} strokeWidth={2} />;
                    case 'Gas Station':
                      return <Fuel size={20} color="#FF6B6B" strokeWidth={2} />;
                    case 'Rest Area':
                      return <Car size={20} color="#4F46E5" strokeWidth={2} />;
                    default:
                      return <MapPin size={20} color={colors.textTertiary} strokeWidth={2} />;
                  }
                })()}
                <Text style={[styles.placeType, { color: colors.textSecondary }]}>{place.type} • {place.category}</Text>
                <Text style={[styles.placePrice, { color: colors.secondary }]}>{place.price}</Text>
              </View>
              
              {/* Additional Info */}
              {place.fuelPrice && (
                <Text style={[styles.fuelPrice, { color: colors.error }]}>⛽ {place.fuelPrice}</Text>
              )}
              
              {place.amenities && Array.isArray(place.amenities) && (
                <View style={styles.amenities}>
                  {place.amenities.map((amenity, index) => (
                    <View key={index} style={[styles.amenityTag, { backgroundColor: `${colors.accent}20` }]}>
                      <Text style={[styles.amenityText, { color: colors.accent }]}>{amenity}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              <View style={styles.placeActions}>
                <View style={styles.placeDistance}>
                  <MapPin size={14} color={colors.textTertiary} strokeWidth={2} />
                  <Text style={[styles.distanceText, { color: colors.textTertiary }]}>{place.distance}</Text>
                  <Clock size={14} color={colors.textTertiary} strokeWidth={2} />
                  <Text style={[styles.timeText, { color: colors.textTertiary }]}>{place.estimatedTime}</Text>
                </View>
              </View>
            </View>          </GlassCard>
        </Reanimated.View>
      </GestureDetector>
    </View>
  );
};

interface PlaceDetailsModalProps {
  isVisible: boolean;
  place: Place | null;
  onClose: () => void;
  colors: any;
  insets: any;
  isDark: boolean;
}

const PlaceDetailsModal = ({ isVisible, place, onClose, colors, insets, isDark }: PlaceDetailsModalProps) => {
  // Create styles for the component
  const styles = createStyles(colors, insets, isDark);
  const translateY = useSharedValue(500);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);
  
  useEffect(() => {
    if (isVisible) {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
      scale.value = withSpring(1, { damping: 20 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withSpring(500, { damping: 20, stiffness: 90 });
    }
  }, [isVisible]);
  
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > 100) {
        onClose();
      } else {
        translateY.value = withSpring(0);
      }
    });
    
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { scale: interpolate(
            translateY.value, 
            [0, 200], 
            [1, 0.95], 
            Extrapolate.CLAMP
          )}
      ]
    };
  });
  
  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value
    };
  });
  
  if (!place) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      statusBarTranslucent
      animationType="none"
    >
      <Reanimated.View style={[styles.modalOverlay, overlayStyle]}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />
        <TouchableOpacity style={styles.closeArea} onPress={onClose} activeOpacity={1} />
        <GestureDetector gesture={pan}>
          <Reanimated.View style={[styles.modalContent, animatedStyle, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{place.name}</Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <X size={24} color={colors.text} strokeWidth={2} />
                </TouchableOpacity>
              </View>
              
              <Image source={{ uri: place.image }} style={styles.modalImage} />
              
              <View style={styles.modalBody}>
                <Text style={[styles.modalDescription, { color: colors.text }]}>{place.description}</Text>
                
                <View style={styles.modalStats}>
                  <View style={styles.modalStat}>
                    <Star size={18} color="#F59E0B" fill="#F59E0B" strokeWidth={2} />
                    <Text style={[styles.modalStatValue, { color: colors.text }]}>{place.rating}</Text>
                    <Text style={[styles.modalStatLabel, { color: colors.textTertiary }]}>Rating</Text>
                  </View>
                  <View style={styles.modalDivider} />
                  <View style={styles.modalStat}>
                    <Clock size={18} color={colors.secondary} strokeWidth={2} />
                    <Text style={[styles.modalStatValue, { color: colors.text }]}>{place.estimatedTime}</Text>
                    <Text style={[styles.modalStatLabel, { color: colors.textTertiary }]}>Drive</Text>
                  </View>
                  <View style={styles.modalDivider} />
                  <View style={styles.modalStat}>
                    <MapPin size={18} color={colors.primary} strokeWidth={2} />
                    <Text style={[styles.modalStatValue, { color: colors.text }]}>{place.distance}</Text>
                    <Text style={[styles.modalStatLabel, { color: colors.textTertiary }]}>Distance</Text>
                  </View>
                </View>
                
                {place.specialOffer && (
                  <View style={[styles.modalPromotion, { backgroundColor: `${colors.error}15` }]}>
                    <Text style={[styles.modalPromotionText, { color: colors.error }]}>
                      🎉 Special offer: {place.specialOffer}
                    </Text>
                  </View>
                )}
                
                <View style={styles.modalSection}>
                  <Text style={[styles.modalSectionTitle, { color: colors.text }]}>Details</Text>
                  <View style={styles.modalDetailRow}>
                    <Text style={[styles.modalDetailLabel, { color: colors.textSecondary }]}>Type:</Text>
                    <Text style={[styles.modalDetailValue, { color: colors.text }]}>{place.type}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={[styles.modalDetailLabel, { color: colors.textSecondary }]}>Category:</Text>
                    <Text style={[styles.modalDetailValue, { color: colors.text }]}>{place.category}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={[styles.modalDetailLabel, { color: colors.textSecondary }]}>Price Range:</Text>
                    <Text style={[styles.modalDetailValue, { color: colors.secondary }]}>{place.price}</Text>
                  </View>
                  {place.phone && (
                    <View style={styles.modalDetailRow}>
                      <Text style={[styles.modalDetailLabel, { color: colors.textSecondary }]}>Contact:</Text>
                      <Text style={[styles.modalDetailValue, { color: colors.text }]}>{place.phone}</Text>
                    </View>
                  )}
                  {place.fuelPrice && (
                    <View style={styles.modalDetailRow}>
                      <Text style={[styles.modalDetailLabel, { color: colors.textSecondary }]}>Fuel Price:</Text>
                      <Text style={[styles.modalDetailValue, { color: colors.error }]}>{place.fuelPrice}</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.modalActionsRow}>
                  <TouchableOpacity 
                    style={[styles.modalActionButton, { backgroundColor: `${colors.primary}15` }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);                      onClose();
                      setTimeout(() => {
                        Alert.alert(
                          "Navigate to " + place.name,
                          `Starting navigation to ${place.name}, ${place.distance} away.`
                        );
                      }, 300);
                    }}
                  >
                    <Navigation2 size={20} color={colors.primary} strokeWidth={2} />
                    <Text style={[styles.modalActionText, { color: colors.primary }]}>Navigate</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalActionButton, { backgroundColor: `${colors.secondary}15` }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onClose();
                      setTimeout(() => {
                        Alert.alert("Share", `Share ${place.name} with friends?`);
                      }, 300);
                    }}
                  >
                    <Share2 size={20} color={colors.secondary} strokeWidth={2} />
                    <Text style={[styles.modalActionText, { color: colors.secondary }]}>Share</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalActionButton, { backgroundColor: `${colors.accent}15` }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);                      onClose();
                      setTimeout(() => {
                        Alert.alert("Favorite", `${place.name} has been added to your favorites.`);
                      }, 300);
                    }}
                  >
                    <Heart 
                      size={20} 
                      color="#FF6B6B" 
                      fill="transparent"
                      strokeWidth={2} 
                    />
                    <Text style={[styles.modalActionText, { color: colors.accent }]}>
                      Save
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </Reanimated.View>
        </GestureDetector>
      </Reanimated.View>
    </Modal>
  );
};

const ExploreScreen = () => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showMap, setShowMap] = useState(false);  const [isListening, setIsListening] = useState(false);
  const [voiceSearchResults, setVoiceSearchResults] = useState('');
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState(true); // Default to enabled
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [speechResults, setSpeechResults] = useState<string[]>([]);
  const [speechError, setSpeechError] = useState('');
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [voiceTimeout, setVoiceTimeout] = useState<NodeJS.Timeout | null>(null);
  const [debugMode, setDebugMode] = useState(true); // For testing voice input
  const quickActionsOpacity = useSharedValue(0);
  const quickActionsScale = useSharedValue(0.8);
  const mapHeight = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const searchBarOpacity = useRef(new Animated.Value(1)).current;
  const voiceButtonScale = useSharedValue(1);
  const mapRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Reset component state when theme changes
  useEffect(() => {
    // This ensures the component re-renders properly when theme changes
  }, [isDark]);
  
  // Setup voice recognition with helper
  useEffect(() => {
    const voiceHelper = VoiceHelper.getInstance();
    
    // Cleanup on unmount
    return () => {
      voiceHelper.destroy();
    };
  }, []);
  
  // Process voice recognition results
  const processVoiceResults = (result: string) => {
    if (!result) return;
    
    console.log('Processing voice result:', result);
    
    // Clear any existing timeout since we got results
    if (voiceTimeout) {
      clearTimeout(voiceTimeout);
      setVoiceTimeout(null);
    }
    
    const lowerResult = result.toLowerCase();
    setVoiceSearchResults(`Searching for ${result}...`);
    
    // Provide audible feedback based on what was recognized
    if (voiceFeedbackEnabled) {
      Speech.speak(`Looking for ${result}`, {
        language: 'en',
        pitch: 1.0,
        rate: 0.9
      });
    }
    
    // Update search query with voice results after a short delay
    setTimeout(() => {
      setSearchQuery(lowerResult);
      setVoiceSearchResults('');
      
      // Check if we'll actually get results
      const willHaveResults = NEARBY_PLACES.some(place => 
        place.name.toLowerCase().includes(lowerResult) || 
        place.category.toLowerCase().includes(lowerResult) ||
        place.type.toLowerCase().includes(lowerResult)
      );
      
      // Provide feedback if no results will be found
      if (!willHaveResults) {
        setNoResultsFound(true);
        if (voiceFeedbackEnabled) {
          Speech.speak(`I couldn't find any results for ${result}. Try something else like 'restaurant' or 'gas station'.`, {
            language: 'en',
            pitch: 1.0,
            rate: 0.9
          });
        }
      } else {
        setNoResultsFound(false);
      }
    }, 1500);
  };
  
  const toggleMapView = () => {
    if (showMap) {
      Animated.parallel([
        Animated.timing(mapHeight, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false
        }),
        Animated.timing(searchBarOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(mapHeight, {
          toValue: 200,
          duration: 300,
          useNativeDriver: false
        }),
        Animated.timing(searchBarOpacity, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: false
        })
      ]).start();
    }
    setShowMap(!showMap);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate fetching new data
    setTimeout(() => {
      setRefreshing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500);
  }, []);

  const navigateToPlace = (place: any) => {
    // In a real app, this would navigate to directions
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "Navigate to " + place.name,
      `Starting navigation to ${place.name}, ${place.distance} away.`,
      [{ text: "OK", onPress: () => console.log("OK Pressed") }]
    );
  };

  const callPlace = (place: any) => {
    if (place.phone) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Alert.alert(
        "Call " + place.name,
        `Call ${place.phone}?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Call", onPress: () => console.log("Call Pressed") }
        ]
      );
    }
  };
  const getPlaceIcon = (type: string) => {
    switch (type) {
      case 'Restaurant':
        return <UtensilsCrossed size={20} color={colors.secondary} strokeWidth={2} />;
      case 'Gas Station':
        return <Fuel size={20} color="#FF6B6B" strokeWidth={2} />;
      case 'Rest Area':
        return <Car size={20} color="#4F46E5" strokeWidth={2} />;
      default:
        return <MapPin size={20} color={colors.textTertiary} strokeWidth={2} />;
    }
  };

  const toggleFavorite = (placeId: number) => {
    setFavorites(prev => 
      prev.includes(placeId) 
        ? prev.filter(id => id !== placeId)
        : [...prev, placeId]
    );
  };
    // Voice search functionality  // Start voice recognition
  const startVoiceSearch = useCallback(async () => {
    console.log('🎤 Starting voice search...');
    setIsListening(true);
    setNoResultsFound(false);
    setSpeechError('');
    setSpeechResults([]);
    setVoiceSearchResults('Listening...');
    voiceButtonScale.value = withSpring(1.2);
    
    // More natural conversational prompts
    const listeningPrompts = [
      "I'm listening... What are you looking for?",
      "Go ahead, tell me what you need",
      "I'm ready to help you find something",
      "What can I help you discover today?"
    ];
    
    const randomPrompt = listeningPrompts[Math.floor(Math.random() * listeningPrompts.length)];
    
    // Provide audible feedback that listening has started (if enabled)
    if (voiceFeedbackEnabled) {
      Speech.speak(randomPrompt, {
        language: 'en',
        pitch: 1.0,
        rate: 0.9
      });
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const voiceHelper = VoiceHelper.getInstance();
      console.log('🎤 Voice helper instance obtained');
      
      const success = await voiceHelper.startListening(
        (results) => {
          // Handle voice results
          console.log('🎤 Voice results received:', results);
          if (results.length > 0) {
            console.log('🎤 Processing first result:', results[0].text);
            setSpeechResults([results[0].text]);
            processVoiceResults(results[0].text);
          }
        },
        (error) => {
          // Handle voice errors
          console.error('🎤 Voice error:', error);
          setSpeechError(error);
          setIsListening(false);
          voiceButtonScale.value = withSpring(1);
          setVoiceSearchResults('');
          
          if (voiceFeedbackEnabled) {
            Speech.speak("Sorry, I couldn't hear you clearly. Please try again.", {
              language: 'en',
              pitch: 1.0,
              rate: 0.9
            });
          }
        },
        () => {
          // Voice started
          console.log('Voice recognition started');
        },
        () => {
          // Voice ended
          console.log('Voice recognition ended');
          setIsListening(false);
          voiceButtonScale.value = withSpring(1);
        }
      );
      
      if (!success && debugMode) {
        // Fallback for testing - simulate voice input after 3 seconds
        console.log('Using debug mode for voice input');
        setTimeout(() => {
          // Simulate different voice inputs for testing
          const testInputs = ['restaurant', 'gas station', 'coffee', 'kenya', 'hotel'];
          const randomInput = testInputs[Math.floor(Math.random() * testInputs.length)];
          console.log(`Simulating voice input: ${randomInput}`);
          processVoiceResults(randomInput);
          setIsListening(false);
          voiceButtonScale.value = withSpring(1);
        }, 3000);
      }
      
      // Set a timeout to stop listening after 10 seconds
      const timeout = setTimeout(async () => {
        if (speechResults.length === 0) {
          console.log('Voice recognition timeout');
          await stopVoiceSearch();
          if (voiceFeedbackEnabled) {
            Speech.speak("I didn't hear anything. Please try again.", {
              language: 'en',
              pitch: 1.0,
              rate: 0.9
            });
          }
        }
      }, 10000);
      
      setVoiceTimeout(timeout as unknown as NodeJS.Timeout);
      
    } catch (err) {
      console.error('Voice start error:', err);
      setIsListening(false);
      setSpeechError('Error starting voice recognition: ' + (err as Error).message);
      voiceButtonScale.value = withSpring(1);
      
      if (voiceFeedbackEnabled) {
        Speech.speak("Sorry, I'm having trouble starting voice recognition. Please try again.", {
          language: 'en',
          pitch: 1.0,
          rate: 0.9
        });
      }
    }
  }, [voiceFeedbackEnabled, debugMode, speechResults]);

  // Stop voice recognition
  const stopVoiceSearch = useCallback(async () => {
    setIsListening(false);
    voiceButtonScale.value = withSpring(1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Clear any existing timeout
    if (voiceTimeout) {
      clearTimeout(voiceTimeout);
      setVoiceTimeout(null);
    }
    
    // Stop any ongoing speech
    Speech.stop();
    
    try {
      const voiceHelper = VoiceHelper.getInstance();
      await voiceHelper.stopListening();
      console.log('Voice recognition stopped');
    } catch (err) {
      console.error('Voice stop error:', err);
    }

    // Only provide cancellation feedback if no results were recognized
    if (speechResults.length === 0 && !speechError) {
      // More conversational cancellation feedback (if enabled)
      const cancelMessages = [
        "No problem, let me know if you need help later",
        "Okay, I'm here when you're ready to search",
        "Voice search canceled. Feel free to try again anytime",
        "Got it, I'll wait for your next request"
      ];
        if (voiceFeedbackEnabled) {
        const randomMessage = cancelMessages[Math.floor(Math.random() * cancelMessages.length)];
        Speech.speak(randomMessage, {
          language: 'en',
          pitch: 1.0,
          rate: 0.9
        });
      }
    }
  }, [voiceFeedbackEnabled, speechResults, speechError, voiceTimeout]);

  // Quick actions functionality
  const toggleQuickActions = useCallback(() => {
    setShowQuickActions(!showQuickActions);
    if (!showQuickActions) {
      quickActionsOpacity.value = withSpring(1, { damping: 15 });
      quickActionsScale.value = withSpring(1, { damping: 15 });
    } else {
      quickActionsOpacity.value = withSpring(0, { damping: 15 });
      quickActionsScale.value = withSpring(0.8, { damping: 15 });
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [showQuickActions]);

  const quickActionMenuItems = [
    {
      icon: Search,
      label: "Search",
      action: () => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
        toggleQuickActions();
      }
    },
    {
      icon: Heart,
      label: "Favorites",
      action: () => {
        Alert.alert("Favorites", `You have ${favorites.length} favorite places`);
        toggleQuickActions();
      }
    },
    {
      icon: Navigation2,
      label: "Navigate",
      action: () => {
        if (filteredPlaces.length > 0) {
          navigateToPlace(filteredPlaces[0]);
        }
        toggleQuickActions();
      }
    },
    {
      icon: Map,
      label: showMap ? "Hide Map" : "Show Map",
      action: () => {
        toggleMapView();
        toggleQuickActions();
      }
    }
  ];
  const filteredPlaces = NEARBY_PLACES.filter(place => {
    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'restaurants' && place.type === 'Restaurant') ||
      (selectedCategory === 'gas' && place.type === 'Gas Station') ||
      (selectedCategory === 'rest' && place.type === 'Rest Area') ||
      (selectedCategory === 'coffee' && place.category.toLowerCase().includes('coffee'));
    
    const matchesSearch = searchQuery === '' || 
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const styles = createStyles(colors, insets, isDark);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>      <LinearGradient
        colors={['#2563EB', '#4F46E5']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Explore Nearby</Text>
          <Text style={styles.subtitle}>Discover amazing places along your route</Text>
          
          <TouchableOpacity 
            style={styles.mapToggleButton} 
            onPress={toggleMapView}
            activeOpacity={0.8}
          >
            <Map size={16} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.mapToggleText}>
              {showMap ? "Hide Map" : "Show Map"}
            </Text>
            <ChevronDown size={16} color="#FFFFFF" strokeWidth={2} style={{
              transform: [{ rotate: showMap ? '180deg' : '0deg' }]
            }} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>        <View style={styles.map}>
          {/* MapView component - You'll need to check the actual props your MapView.native accepts */}
          {/* This is a placeholder that should be replaced with the proper MapView implementation */}
          <Text style={{ color: colors.text }}>Map View</Text>
        </View>
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0)']}
          style={styles.mapGradientOverlay}
        />
      </Animated.View>

      <ScrollView 
        ref={scrollRef}
        style={[styles.content, { backgroundColor: colors.surface }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={colors.secondary}
            colors={[colors.secondary, colors.primary]}
          />
        }
      >
        {/* Enhanced Search Bar */}
        <Animated.View style={[styles.searchSection, {
          opacity: searchBarOpacity,
          transform: [{
            translateY: searchBarOpacity.interpolate({
              inputRange: [0.8, 1],
              outputRange: [-20, 0],
              extrapolate: 'clamp'
            })
          }]
        }]}>
          <Reanimated.View 
            entering={FadeIn.duration(300)}
            style={[styles.searchContainer, { 
              backgroundColor: colors.card,
              borderColor: searchQuery.length > 0 ? colors.primary : colors.border,
              shadowColor: colors.shadow,
            }]}
          >            <View style={styles.searchIconWrapper}>
              <PulseAnimation 
                isActive={searchQuery.length > 0} 
                color={colors.primary}
                size={32}
              >              <Search 
                size={20} 
                color={searchQuery.length > 0 ? colors.primary : colors.textTertiary} 
                strokeWidth={2}
              />
              </PulseAnimation>
            </View>
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={isListening ? "Listening..." : "Search restaurants, gas stations..."}
              placeholderTextColor={isListening ? colors.primary : colors.textTertiary}
              value={voiceSearchResults || searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (text.length > 0) {
                  Haptics.selectionAsync();
                }
              }}
              onFocus={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              returnKeyType="search"
              editable={!isListening} // Disable editing while listening
            />
            {searchQuery.length > 0 && !isListening && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => {
                  setSearchQuery('');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <X size={16} color={colors.textTertiary} strokeWidth={2} />
              </TouchableOpacity>
            )}
            
            {/* Voice Search Button */}
            <Reanimated.View
              style={[
                useAnimatedStyle(() => ({
                  transform: [{ scale: voiceButtonScale.value }],
                })),
              ]}
            >
              <TouchableOpacity 
                style={[
                  styles.voiceButton, 
                  isListening && { 
                    backgroundColor: `${colors.error}30`, 
                    borderColor: colors.error,
                    borderWidth: 1,
                  },
                  voiceFeedbackEnabled && {
                    borderWidth: 1,
                    borderColor: 'rgba(138, 92, 246, 0.3)'
                  }
                ]}
                onPress={isListening ? stopVoiceSearch : startVoiceSearch}
                onLongPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setVoiceFeedbackEnabled(!voiceFeedbackEnabled);
                  
                  // Provide feedback about the setting change
                  if (!voiceFeedbackEnabled) {
                    // If we're enabling it, use voice feedback to confirm
                    Speech.speak("Voice feedback enabled", {
                      language: 'en',
                      pitch: 1.0,
                      rate: 0.9
                    });
                  } else {
                    // If we're disabling it, just show a toast or alert
                    Alert.alert("Voice Feedback Disabled", "Voice feedback is now off.");
                  }
                }}
                activeOpacity={0.7}
                delayLongPress={500}
              >
                <Mic 
                  size={18} 
                  color={isListening ? colors.error : (voiceFeedbackEnabled ? colors.accent : colors.textSecondary)} 
                  strokeWidth={2} 
                />
                {isListening && (
                  <Reanimated.View style={styles.listeningIndicator}>              <PulseAnimation 
                  isActive={isListening} 
                  color={colors.error}
                  size={36}
                >
                  <View />
                </PulseAnimation>
                  </Reanimated.View>
                )}
                {voiceFeedbackEnabled && !isListening && (
                  <View style={styles.voiceFeedbackIndicator} />
                )}
              </TouchableOpacity>
            </Reanimated.View>
              <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                Alert.alert("Filters", "Filter options coming soon!");
              }}
            >              <Filter size={20} color={colors.secondary} strokeWidth={2} />
            </TouchableOpacity>
          </Reanimated.View>
          
          {searchQuery.length > 0 && filteredPlaces.length > 0 && (
            <Reanimated.View 
              entering={SlideInUp.duration(200)}
              style={styles.searchSuggestionsContainer}
            >
              {filteredPlaces.slice(0, 3).map((place) => (
                <TouchableOpacity 
                  key={`suggestion-${place.id}`}
                  style={styles.searchSuggestion}
                  onPress={() => {
                    setSearchQuery(place.name);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedPlace(place);
                  }}
                >
                  {getPlaceIcon(place.type)}
                  <View style={styles.suggestionTextContainer}>
                    <Text style={[styles.suggestionTitle, {color: colors.text}]}>{place.name}</Text>
                    <Text style={[styles.suggestionSubtitle, {color: colors.textSecondary}]}>
                      {place.category} • {place.distance}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </Reanimated.View>
          )}
        </Animated.View>

        {/* Category Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((category) => (
            <InteractiveButton
              key={category.id}
              onPress={() => {
                setSelectedCategory(category.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <View style={[
                styles.categoryButton,
                {
                  backgroundColor: selectedCategory === category.id ? colors.primary : colors.card,
                  borderColor: selectedCategory === category.id ? colors.primary : colors.border,
                }
              ]}>
                <category.icon 
                  size={18} 
                  color={selectedCategory === category.id ? '#FFFFFF' : category.color} 
                  strokeWidth={2} 
                />
                <Text style={[
                  styles.categoryText,
                  { color: selectedCategory === category.id ? '#FFFFFF' : colors.textSecondary }
                ]}>
                  {category.name}
                </Text>
              </View>
            </InteractiveButton>
          ))}
        </ScrollView>

        {/* AI Recommendation */}
        <View style={styles.aiSection}>
          <GlassCard style={styles.aiCard}>
            <LinearGradient
              colors={['#FF6B6B', '#FF8E8E']}
              style={styles.aiRecommendationGradient}
            >
              <View style={styles.aiRecommendationContent}>
                <View style={styles.aiHeaderRow}>
                  <Text style={styles.aiRecommendationTitle}>🤖 AI Recommendation</Text>
                  <PulseAnimation isActive={true} size={8} color="#FFFFFF"><View /></PulseAnimation>
                </View>
                <Text style={styles.aiRecommendationText}>
                  Based on your route and driving time, I suggest stopping at Bella Vista Café in 15 minutes for a coffee break. 
                  You've been driving for 2.5 hours and they have excellent reviews!
                </Text>
                <TouchableOpacity style={styles.aiActionButton}>
                  <Text style={styles.aiActionText}>View Details</Text>
                  <ArrowRight size={16} color="#FFFFFF" strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </GlassCard>
        </View>

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {filteredPlaces.length} places nearby
          </Text>
          <StatusIndicator type="success" text="Live data" size="small" />
        </View>
        
        {/* Animated Places List with Gestures */}
        {filteredPlaces.map((place, index) => (
          <AnimatedPlaceCard 
            key={place.id}
            place={place}
            onOpen={setSelectedPlace}
            isFavorite={favorites.includes(place.id)}
            onToggleFavorite={toggleFavorite}
            colors={colors}
            isDark={isDark}
          />
        ))}
        
        {/* Empty state if no places */}        {filteredPlaces.length === 0 && (
          <View style={styles.emptyState}>
            <Info size={40} color={colors.textTertiary} strokeWidth={1.5} />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
              No places found
            </Text>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              {noResultsFound 
                ? "We couldn't find results for your search. Try something like 'restaurant' or 'gas station'."
                : "Try changing your search or filters"}
            </Text>
            {noResultsFound && (
              <TouchableOpacity 
                style={[styles.clearSearchButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setNoResultsFound(false);
                }}
              >
                <Text style={styles.clearSearchButtonText}>Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        )}</ScrollView>

      {/* Enhanced Quick Action Button with Menu */}
      {showQuickActions && (
        <Reanimated.View 
          style={[
            styles.actionsMenu, 
            { backgroundColor: isDark ? 'rgba(37, 42, 58, 0.95)' : 'rgba(255, 255, 255, 0.95)' },
            {
              opacity: quickActionsOpacity,
              transform: [{ scale: quickActionsScale }]
            }
          ]}
        >
          {quickActionMenuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.actionMenuItem,
                index < quickActionMenuItems.length - 1 && {
                  borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                }
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                item.action();
              }}
            >
              <item.icon size={18} color={colors.primary} strokeWidth={2} />
              <Text style={[styles.actionMenuItemText, { color: colors.text }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </Reanimated.View>
      )}      <Reanimated.View 
        entering={ZoomIn.duration(500).delay(300)}
        style={[styles.quickActionButton, { backgroundColor: colors.primary }]}
      >
        <TouchableOpacity 
          onPress={toggleQuickActions}
          onLongPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            scrollRef.current?.scrollTo({ y: 0, animated: true });
          }}
          style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
          delayLongPress={500}
        >
          <Reanimated.View
            style={[
              useAnimatedStyle(() => ({
                transform: [{ rotate: showQuickActions ? '45deg' : '0deg' }],
              })),
            ]}
          >
            {showQuickActions ? (
              <X size={24} color="#FFFFFF" strokeWidth={2} />
            ) : (
              <Map size={24} color="#FFFFFF" strokeWidth={2} />
            )}
          </Reanimated.View>
        </TouchableOpacity>
      </Reanimated.View>
      {/* Place Details Modal */}
      <PlaceDetailsModal 
        isVisible={selectedPlace !== null}
        place={selectedPlace}
        onClose={() => setSelectedPlace(null)}
        colors={colors}
        insets={insets}
        isDark={isDark}
      />

      {/* Swipeable Cards - Uncomment to enable swipeable cards */}
      {/* <View style={styles.swipeableContainer}>
        {filteredPlaces.map((place) => (
          <SwipeableCard 
            key={place.id}
            place={place}
            onOpen={setSelectedPlace}
            onNavigate={navigateToPlace}
            onCall={callPlace}
            onFavorite={toggleFavorite}
            isFavorite={favorites.includes(place.id)}
            colors={colors}
          />
        ))}
      </View> */}
    </View>
  );
}

// Component was fully moved to the top of the file

const createStyles = (colors: any, insets: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: insets.top + 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
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
    marginBottom: 12,
  },
  mapToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 8,
  },
  mapToggleText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FFFFFF',
    marginHorizontal: 6,
  },
  mapContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: Math.max(insets.bottom + 120, 140),
  },
  searchSection: {
    marginBottom: 16,
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    marginHorizontal: 16,
  },
  searchInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
    paddingHorizontal: 4,
    paddingVertical: 6,
    height: 40,
  },
  searchIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  filterButton: {
    padding: 8,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    padding: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  voiceButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  listeningIndicator: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceFeedbackIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B5CF6', // Purple dot to indicate voice feedback is on
  },
  actionIndicator: {
    position: 'absolute',
    top: '40%',
    width: 70,
    height: 70,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  cardPlaceholder: {
    height: 0,
    marginBottom: 16,
    overflow: 'hidden',
  },
  quickActionButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 100,
  },
  actionsMenu: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  actionMenuItemText: {
    marginLeft: 12,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  searchSuggestionsContainer: {
    backgroundColor: isDark ? 'rgba(37, 42, 58, 0.97)' : 'rgba(255, 255, 255, 0.97)',
    marginHorizontal: 16,
    marginTop: 4,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  searchSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  suggestionTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  suggestionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    marginBottom: 2,
  },
  suggestionSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  categoriesContainer: {
    marginBottom: 20,
    maxHeight: 50,
  },
  categoriesContent: {
    paddingRight: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
  },
  categoryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 6,
  },
  placeCard: {
    marginBottom: 16,
    overflow: 'hidden',
    padding: 0,
  },
  placeImageContainer: {
    position: 'relative',
  },
  placeImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  offerBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  offerText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  viewButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeInfo: {
    padding: 16,
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  placeName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    flex: 1,
    marginRight: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  placeDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginLeft: 4,
    marginRight: 4,
  },
  reviewCount: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginRight: 12,
  },
  placeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  placeType: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  placePrice: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  fuelPrice: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginBottom: 8,
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  amenityTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  amenityText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  placeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeDistance: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginLeft: 4,
    marginRight: 12,
  },
  timeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginLeft: 4,
  },
  aiSection: {
    marginBottom: 20,
  },
  aiCard: {
    padding: 0,
  },
  aiRecommendationGradient: {
    borderRadius: 16,
    padding: 20,
  },
  aiRecommendationContent: {
    alignItems: 'flex-start',
  },
  aiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  aiRecommendationTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  aiRecommendationText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
    marginBottom: 16,
  },
  aiActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  aiActionText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    marginRight: 8,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  clearSearchButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  clearSearchButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: insets.bottom,
  },
  closeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    paddingTop: 16,
    paddingBottom: insets.bottom + 16,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalScroll: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  closeButton: {
    padding: 8,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
  },
  modalBody: {
    paddingHorizontal: 20,
  },
  modalDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 22,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalStat: {
    flex: 1,
    alignItems: 'center',
  },
  modalStatValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginTop: 4,
  },
  modalStatLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#9CA3AF',
  },
  modalDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  modalPromotion: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  modalPromotionText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 8,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  modalDetailLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#9CA3AF',
  },
  modalDetailValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#111827',
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    flex: 1,
    marginRight: 8,
  },
  modalActionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 8,
  },
  swipeableContainer: {
    flex: 1,
  },
  swipeableCardContainer: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 16,
    marginBottom: 16,
  },
  swipeActionLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 100,
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 16,
  },
  swipeActionRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 100,
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 16,
  },
  swipeActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    width: '100%',
  },
  swipeActionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  swipeHintText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ExploreScreen;