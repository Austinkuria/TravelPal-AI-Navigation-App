import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Switch, Platform, Linking, Animated, Share, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Settings, MapPin, Clock, Car, Bell, Shield, CircleHelp, LogOut, ChevronRight, Award, Target, Trophy, Zap, Star, Share2, Users, TrendingUp, BarChart3 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import Voice from '@react-native-voice/voice';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GradientCard from '@/components/GradientCard';
import AnimatedButton from '@/components/AnimatedButton';
import StatusIndicator from '@/components/StatusIndicator';
import ThemeToggle from '@/components/ThemeToggle';

const TRIP_STATS = [
  { label: 'Total Distance', value: '12345 km', icon: Target, color: '#2563EB' },
  { label: 'Trip Hours', value: '89.5 hrs', icon: Clock, color: '#059669' },
  { label: 'Routes Saved', value: '23', icon: MapPin, color: '#F59E0B' },
  { label: 'AI Suggestions Used', value: '156', icon: Award, color: '#7C3AED' },
];

const LIVE_STATS = [
  { label: 'CO2 Saved', value: '45.2 kg', trend: '+12%', icon: '🌱', color: '#22C55E' },
  { label: 'Money Saved', value: '$234', trend: '+8%', icon: '💰', color: '#F59E0B' },
  { label: 'Time Optimized', value: '2.3 hrs', trend: '+15%', icon: '⚡', color: '#8B5CF6' },
  { label: 'Stress Level', value: 'Low', trend: '-20%', icon: '😌', color: '#06B6D4' }
];

const ACHIEVEMENTS = [
  { id: 1, title: 'Carbon Hero', description: 'Saved 100kg CO2', icon: Trophy, earned: true, progress: 85, maxProgress: 100 },
  { id: 2, title: 'Speed Demon', description: 'Fastest route finder', icon: Target, earned: true, progress: 60, maxProgress: 100 },
  { id: 3, title: 'Night Owl', description: 'Night driving expert', icon: MapPin, earned: false, progress: 30, maxProgress: 100 },
  { id: 4, title: 'Social Navigator', description: 'Helped 50 other drivers', icon: Zap, earned: false, progress: 25, maxProgress: 50 },
];

const AI_INSIGHTS = [
  { type: 'warning', icon: '⚠️', message: 'Heavy traffic expected on your usual route tomorrow 8-9 AM' },
  { type: 'tip', icon: '💡', message: 'Taking Route B saves 15 min and 0.5L fuel based on your driving style' },
  { type: 'achievement', icon: '🏆', message: 'You\'re 3 trips away from unlocking "Eco Master" badge!' }
];

const MOOD_OPTIONS = [
  { emoji: '😊', label: 'Happy', route: 'Scenic route with beautiful views' },
  { emoji: '😤', label: 'Stressed', route: 'Calm route with less traffic' },
  { emoji: '😴', label: 'Tired', route: 'Simple route with fewer turns' },
  { emoji: '🎉', label: 'Excited', route: 'Fast route to get there quickly' }
];

const LEADERBOARD_DATA = [
  { rank: 1, name: 'Sarah Chen', score: 2847, avatar: '👩‍💼', badge: '🏆' },
  { rank: 2, name: 'Mike Johnson', score: 2634, avatar: '👨‍🚀', badge: '🥈' },
  { rank: 3, name: 'You', score: 2456, avatar: '🧑‍💻', badge: '🥉' },
  { rank: 4, name: 'Alex Rivera', score: 2234, avatar: '👩‍🎨', badge: '⭐' },
  { rank: 5, name: 'David Kim', score: 2123, avatar: '👨‍🔬', badge: '⭐' }
];

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ProfileScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const chartAnimation = useRef(new Animated.Value(0)).current;
  
  const [user, setUser] = useState({
    name: 'John Traveler',
    email: 'john.traveler@email.com',
    badges: ['Expert Navigator', 'Premium'],
  });
  const [tripStats, setTripStats] = useState(TRIP_STATS);
  const [liveStats, setLiveStats] = useState(LIVE_STATS);
  const [achievements, setAchievements] = useState(ACHIEVEMENTS);
  const [currentMood, setCurrentMood] = useState(MOOD_OPTIONS[0]);
  const [aiInsights, setAiInsights] = useState(AI_INSIGHTS);
  const [leaderboard, setLeaderboard] = useState(LEADERBOARD_DATA);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoRestAlerts, setAutoRestAlerts] = useState(true);
  const [locationSharing, setLocationSharing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Persist settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [voice, rest, notif, loc] = await Promise.all([
          AsyncStorage.getItem('voiceEnabled'),
          AsyncStorage.getItem('autoRestAlerts'),
          AsyncStorage.getItem('notificationsEnabled'),
          AsyncStorage.getItem('locationSharing'),
        ]);
        if (voice) setVoiceEnabled(JSON.parse(voice));
        if (rest) setAutoRestAlerts(JSON.parse(rest));
        if (notif) setNotificationsEnabled(JSON.parse(notif));
        if (loc) setLocationSharing(JSON.parse(loc));
      } catch (error) {
        Toast.show({ type: 'error', text1: 'Failed to load settings' });
      }
    };
    loadSettings();

    // Start animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(chartAnimation, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('voiceEnabled', JSON.stringify(voiceEnabled));
  }, [voiceEnabled]);
  useEffect(() => {
    AsyncStorage.setItem('autoRestAlerts', JSON.stringify(autoRestAlerts));
  }, [autoRestAlerts]);
  useEffect(() => {
    AsyncStorage.setItem('notificationsEnabled', JSON.stringify(notificationsEnabled));
  }, [notificationsEnabled]);
  useEffect(() => {
    AsyncStorage.setItem('locationSharing', JSON.stringify(locationSharing));
  }, [locationSharing]);

  // Update achievements based on stats
  useEffect(() => {
    const distance = parseInt(tripStats[0].value);
    const aiSuggestions = parseInt(tripStats[3].value);
    if (distance >= 50000) {
      setAchievements(prev => prev.map(a => 
        a.title === 'Road Warrior' ? { ...a, earned: true } : a
      ));
    }
    if (aiSuggestions >= 200) {
      setAchievements(prev => prev.map(a => 
        a.title === 'AI Partner' ? { ...a, earned: true } : a
      ));
    }
  }, [tripStats]);

  // Voice recognition setup
  useEffect(() => {
    if (Platform.OS === 'web') {
      setVoiceError('Voice recognition not supported on web. Use a mobile device.');
      return;
    }
    
    Voice.onSpeechResults = (e: any) => {
      const newTranscript = e.value?.[0] || '';
      setTranscript(newTranscript);
      if (newTranscript.toLowerCase().includes('navigate to')) {
        const location = newTranscript.split('navigate to')[1]?.trim() || 'unknown';
        speakResponse(`Starting navigation to ${location}`);
        router.push(`/(tabs)/explore` as any);
      } else if (newTranscript.toLowerCase().includes('find')) {
        const query = newTranscript.split('find')[1]?.trim() || 'unknown';
        speakResponse(`Searching for ${query}`);
        router.push(`/(tabs)/explore` as any);
      } else {
        speakResponse(`I heard you say: ${newTranscript}`);
      }
    };
    
    Voice.onSpeechError = (e: any) => {
      setVoiceError(e.error?.message || 'Voice recognition error');
      Toast.show({ type: 'error', text1: 'Voice recognition error' });
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startVoiceRecognition = async () => {
    if (!voiceEnabled || Platform.OS === 'web') {
      Toast.show({ type: 'error', text1: voiceEnabled ? 'Voice not supported on web' : 'Enable Voice Notifications first' });
      return;
    }
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await Voice.start('en-US');
      setIsListening(true);
      setVoiceError('');
      setTranscript('');
      Toast.show({ type: 'info', text1: 'Listening... Speak now' });
      
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      setTimeout(() => Toast.show({ type: 'info', text1: 'Listening... Tap to stop' }), 1000);
    } catch (error) {
      setVoiceError('Failed to start voice recognition');
      Toast.show({ type: 'error', text1: 'Failed to start voice recognition' });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const stopVoiceRecognition = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
      animatedValue.stopAnimation();
      animatedValue.setValue(0);
      Toast.show({ type: 'info', text1: 'Stopped listening' });
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      setVoiceError('Failed to stop voice recognition');
      Toast.show({ type: 'error', text1: 'Failed to stop voice recognition' });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const speakResponse = async (text: string) => {
    if (!voiceEnabled) return;
    try {
      const response = await axios.post(
        'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM',
        { text, model_id: 'eleven_monolingual_v1', voice_settings: { stability: 0.5, similarity_boost: 0.5 } },
        { headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY, 'Content-Type': 'application/json' }, responseType: 'arraybuffer' }
      );
      const audioPath = `${FileSystem.documentDirectory}response.mp3`;
      await FileSystem.writeAsStringAsync(audioPath, Buffer.from(response.data).toString('base64'), {
        encoding: FileSystem.EncodingType.Base64,
      });
      const { sound } = await Audio.Sound.createAsync({ uri: audioPath });
      await sound.playAsync();
    } catch (e) {
      setVoiceError('Failed to generate speech');
      Toast.show({ type: 'error', text1: 'Failed to generate speech' });
    }
  };

  const toggleLocationSharing = async (value: boolean) => {
    if (value) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({ type: 'error', text1: 'Location permission denied' });
        return;
      }
    }
    setLocationSharing(value);
    Toast.show({ type: 'success', text1: `Location sharing ${value ? 'enabled' : 'disabled'}` });
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      router.replace('/(tabs)' as any);
      Toast.show({ type: 'success', text1: 'Signed out successfully' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to sign out' });
    }
  };

  const startAIDemo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTranscript('Find me the fastest route to downtown');
    setTimeout(() => {
      setTranscript('AI: I found 3 routes. The fastest saves 12 minutes and avoids construction on Main St.');
      Toast.show({ type: 'success', text1: 'AI Demo completed!' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 2000);
  };

  const simulateLiveUpdate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLiveStats(prev => prev.map(stat => ({
      ...stat,
      value: stat.label === 'CO2 Saved' ? `${(parseFloat(stat.value) + Math.random() * 5).toFixed(1)} kg` :
             stat.label === 'Money Saved' ? `$${(parseInt(stat.value.slice(1)) + Math.floor(Math.random() * 10))}` :
             stat.label === 'Time Optimized' ? `${(parseFloat(stat.value) + Math.random() * 0.5).toFixed(1)} hrs` :
             stat.value
    })));
    Toast.show({ type: 'info', text1: 'Live stats updated!' });
  };

  const shareAchievements = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const earnedCount = achievements.filter(a => a.earned).length;
      const message = `🏆 I've earned ${earnedCount} achievements in TravelPal! Join me on my eco-friendly travel journey and save money while reducing carbon footprint! 🌱💰 #TravelPal #EcoTravel`;
      
      await Share.share({
        message,
        title: 'My TravelPal Achievements',
        url: 'https://travelpal.app/achievements',
      });
      
      Toast.show({ type: 'success', text1: 'Achievements shared!' });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to share achievements' });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const challengeFriend = () => {
    Alert.alert(
      '🎯 Challenge Friend',
      'Invite a friend to compete in eco-travel goals!',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Invite', 
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const message = '🚗 Join me on TravelPal and let\'s compete to see who can save more CO2 and money on our travels! Download: https://travelpal.app';
            await Share.share({ message });
            Toast.show({ type: 'success', text1: 'Challenge sent!' });
          }
        }
      ]
    );
  };

  interface SettingItemProps {
    icon: any;
    title: string;
    subtitle: string;
    onPress?: () => void;
    rightComponent?: React.ReactElement;
    iconColor?: string;
  }

  const SettingItem = ({ icon: Icon, title, subtitle, onPress, rightComponent, iconColor = colors.primary }: SettingItemProps) => (
    <TouchableOpacity 
      style={[styles.settingItem, { borderBottomColor: colors.border }]} 
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={[styles.settingIcon, { backgroundColor: `${iconColor}15` }]}>
        <Icon size={20} color={iconColor} strokeWidth={2} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      {rightComponent || <ChevronRight size={20} color={colors.textTertiary} strokeWidth={2} />}
    </TouchableOpacity>
  );

  const AIAssistantDemo = () => (
    <View style={[styles.aiDemo, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
      <Text style={[styles.demoTitle, { color: colors.text }]}>🎙️ AI Assistant Demo</Text>
      <TouchableOpacity 
        style={[styles.demoButton, { backgroundColor: colors.primary }]} 
        onPress={startAIDemo}
      >
        <Text style={styles.demoButtonText}>Try: "Find me the fastest route to downtown"</Text>
      </TouchableOpacity>
      {transcript && (
        <View style={[styles.demoResponse, { backgroundColor: colors.background }]}>
          <Text style={[styles.demoResponseText, { color: colors.text }]}>{transcript}</Text>
        </View>
      )}
    </View>
  );

  const MoodTracker = () => (
    <View style={[styles.moodSection, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
      <Text style={[styles.moodTitle, { color: colors.text }]}>🧠 Mood-Based Navigation</Text>
      <View style={styles.moodOptions}>
        {MOOD_OPTIONS.map(mood => (
          <TouchableOpacity 
            key={mood.label}
            style={[
              styles.moodButton, 
              { backgroundColor: currentMood.label === mood.label ? colors.primary : colors.border },
              currentMood.label === mood.label && styles.activeMood
            ]}
            onPress={() => {
              setCurrentMood(mood);
              Toast.show({ type: 'success', text1: `Mood set to ${mood.label}` });
            }}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            <Text style={[styles.moodLabel, { 
              color: currentMood.label === mood.label ? '#FFFFFF' : colors.text 
            }]}>{mood.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={[styles.moodRecommendation, { backgroundColor: colors.background }]}>
        <Text style={[styles.moodRecommendationText, { color: colors.textSecondary }]}>
          💡 Recommended: {currentMood.route}
        </Text>
      </View>
    </View>
  );

  const EnvironmentalImpact = () => (
    <View style={[styles.environmentSection, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
      <Text style={[styles.environmentTitle, { color: colors.text }]}>🌍 Environmental Impact</Text>
      <View style={styles.impactGrid}>
        {liveStats.map((stat, index) => (
          <View key={index} style={[styles.impactCard, { backgroundColor: colors.background }]}>
            <View style={styles.impactHeader}>
              <Text style={styles.impactIcon}>{stat.icon}</Text>
              <Text style={[styles.impactTrend, { color: stat.color }]}>{stat.trend}</Text>
            </View>
            <Text style={[styles.impactValue, { color: colors.text }]}>{stat.value}</Text>
            <Text style={[styles.impactLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity 
        style={[styles.updateButton, { backgroundColor: colors.success }]}
        onPress={simulateLiveUpdate}
      >
        <Text style={styles.updateButtonText}>🔄 Update Live Stats</Text>
      </TouchableOpacity>
    </View>
  );

  const AIInsightsSection = () => (
    <View style={[styles.insightsSection, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
      <Text style={[styles.insightsTitle, { color: colors.text }]}>🔮 AI Insights</Text>
      {aiInsights.map((insight, index) => (
        <View 
          key={index} 
          style={[
            styles.insightCard, 
            { 
              backgroundColor: insight.type === 'warning' ? '#FEF3C7' :
                              insight.type === 'tip' ? '#DBEAFE' : '#F3E8FF',
              borderLeftColor: insight.type === 'warning' ? '#F59E0B' :
                              insight.type === 'tip' ? '#3B82F6' : '#8B5CF6'
            }
          ]}
        >
          <View style={styles.insightHeader}>
            <Text style={styles.insightIcon}>{insight.icon}</Text>
            <Text style={[styles.insightType, { 
              color: insight.type === 'warning' ? '#92400E' :
                     insight.type === 'tip' ? '#1E40AF' : '#5B21B6'
            }]}>
              {insight.type.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.insightMessage, { 
            color: insight.type === 'warning' ? '#92400E' :
                   insight.type === 'tip' ? '#1E40AF' : '#5B21B6'
          }]}>
            {insight.message}
          </Text>
        </View>
      ))}
    </View>
  );

  const SocialLeaderboard = () => (
    <View style={[styles.leaderboardSection, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
      <View style={styles.leaderboardHeader}>
        <Text style={[styles.leaderboardTitle, { color: colors.text }]}>🏅 Eco-Travel Leaderboard</Text>
        <TouchableOpacity 
          style={[styles.challengeButton, { backgroundColor: colors.primary }]}
          onPress={challengeFriend}
        >
          <Users size={16} color="#FFFFFF" />
          <Text style={styles.challengeButtonText}>Challenge</Text>
        </TouchableOpacity>
      </View>
      
      {leaderboard.map((user, index) => (
        <Animated.View 
          key={user.rank}
          style={[
            styles.leaderboardItem,
            { 
              backgroundColor: user.name === 'You' ? colors.primary + '15' : colors.background,
              borderColor: user.name === 'You' ? colors.primary : 'transparent',
              borderWidth: user.name === 'You' ? 2 : 0,
              transform: [{ 
                scale: chartAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                })
              }]
            }
          ]}
        >
          <View style={styles.leaderboardRank}>
            <Text style={styles.rankBadge}>{user.badge}</Text>
            <Text style={[styles.rankNumber, { color: colors.textSecondary }]}>#{user.rank}</Text>
          </View>
          
          <View style={styles.leaderboardUser}>
            <Text style={styles.userAvatar}>{user.avatar}</Text>
            <View>
              <Text style={[styles.leaderboardName, { 
                color: user.name === 'You' ? colors.primary : colors.text,
                fontWeight: user.name === 'You' ? 'bold' : 'normal'
              }]}>{user.name}</Text>
              <Text style={[styles.leaderboardScore, { color: colors.textSecondary }]}>
                {user.score} eco-points
              </Text>
            </View>
          </View>
          
          <View style={styles.leaderboardStats}>
            <TrendingUp size={16} color={colors.success} />
            <Text style={[styles.trendText, { color: colors.success }]}>+{Math.floor(Math.random() * 50)}%</Text>
          </View>
        </Animated.View>
      ))}
      
      <TouchableOpacity 
        style={[styles.viewFullButton, { backgroundColor: colors.border }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          Toast.show({ type: 'info', text1: 'Opening full leaderboard...' });
        }}
      >
        <Text style={[styles.viewFullText, { color: colors.text }]}>View Full Leaderboard</Text>
        <ChevronRight size={16} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  const EnhancedAIAssistant = () => (
    <View style={[styles.aiDemo, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
      <Text style={[styles.demoTitle, { color: colors.text }]}>🎙️ Advanced AI Assistant</Text>
      
      <View style={styles.voiceCommands}>
        <Text style={[styles.commandsTitle, { color: colors.textSecondary }]}>Try these commands:</Text>
        {[
          '"Navigate to downtown"',
          '"Find gas stations nearby"',
          '"Show eco-friendly routes"',
          '"What\'s my carbon savings?"'
        ].map((command, index) => (
          <TouchableOpacity 
            key={index}
            style={[styles.commandChip, { backgroundColor: colors.border }]}
            onPress={() => {
              setTranscript(command.replace(/"/g, ''));
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text style={[styles.commandText, { color: colors.text }]}>{command}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.voiceButtonContainer}>
        <Animated.View
          style={[
            styles.pulseCircle,
            {
              backgroundColor: colors.primary + '30',
              transform: [{ scale: isListening ? pulseAnimation : 1 }],
            }
          ]}
        >
          <TouchableOpacity 
            style={[
              styles.voiceButton, 
              { 
                backgroundColor: isListening ? colors.error : colors.primary,
              }
            ]} 
            onPress={isListening ? stopVoiceRecognition : startVoiceRecognition}
          >
            <Text style={styles.voiceButtonEmoji}>{isListening ? '🛑' : '🎤'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
      
      {transcript && (
        <View style={[styles.demoResponse, { backgroundColor: colors.background }]}>
          <Text style={[styles.demoResponseText, { color: colors.text }]}>{transcript}</Text>
        </View>
      )}
      
      {voiceError && (
        <View style={[styles.errorContainer, { backgroundColor: colors.error + '15' }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>{voiceError}</Text>
        </View>
      )}
    </View>
  );

  const styles = createStyles(colors, insets);

  const sections = [
    // Enhanced AI Assistant
    <View key="ai-enhanced" style={styles.section}>
      <EnhancedAIAssistant />
    </View>,
    // Social Leaderboard
    <View key="leaderboard" style={styles.section}>
      <SocialLeaderboard />
    </View>,
    // Mood-Based Navigation
    <View key="mood" style={styles.section}>
      <MoodTracker />
    </View>,
    // Environmental Impact
    <View key="environment" style={styles.section}>
      <EnvironmentalImpact />
    </View>,
    // AI Insights
    <View key="insights" style={styles.section}>
      <AIInsightsSection />
    </View>,
    // Theme Toggle
    <View key="theme" style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>🎨 Appearance</Text>
      <View style={[styles.settingsContainer, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <View style={[styles.settingIcon, { backgroundColor: `${colors.accent}15` }]}>
            <Settings size={20} color={colors.accent} strokeWidth={2} />
          </View>
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>Theme</Text>
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>Choose your preferred theme</Text>
          </View>
          <ThemeToggle />
        </View>
      </View>
    </View>,
    // Trip Stats
    <View key="stats" style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>📊 Your Journey Stats</Text>
      <View style={styles.statsGrid}>
        {tripStats.map((stat, index) => (
          <GradientCard 
            key={index} 
            colors={[`${stat.color}15`, `${stat.color}25`]} 
            style={styles.statCard}
          >
            <stat.icon size={20} color={stat.color} strokeWidth={2} />
            <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
          </GradientCard>
        ))}
      </View>
      <AnimatedButton onPress={() => {
        setTripStats(prev => {
          const newStats = [...prev];
          newStats[0].value = `${parseInt(newStats[0].value) + 10} km`;
          newStats[3].value = `${parseInt(newStats[3].value) + 1}`;
          return newStats;
        });
        Toast.show({ type: 'success', text1: 'Stats updated' });
      }}>
        <View style={styles.upgradeButton}>
          <Text style={styles.upgradeButtonText}>Simulate Trip</Text>
        </View>
      </AnimatedButton>
    </View>,
    // Achievements
    <View key="achievements" style={styles.section}>
      <View style={styles.achievementsHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>🏆 Enhanced Achievements</Text>
        <TouchableOpacity 
          style={[styles.shareButton, { backgroundColor: colors.primary }]}
          onPress={shareAchievements}
        >
          <Share2 size={16} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.achievementsGrid}>
        {achievements.map((achievement) => (
          <Animated.View 
            key={achievement.id} 
            style={[
              styles.achievementCard,
              { 
                backgroundColor: colors.card, 
                shadowColor: colors.shadow, 
                opacity: achievement.earned ? 1 : 0.8,
                transform: [{ 
                  scale: chartAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  })
                }]
              }
            ]}
          >
            <View style={[
              styles.achievementIcon,
              { backgroundColor: achievement.earned ? colors.success : colors.border }
            ]}>
              <achievement.icon 
                size={16} 
                color={achievement.earned ? '#FFFFFF' : colors.textTertiary} 
                strokeWidth={2} 
              />
            </View>
            <Text style={[styles.achievementTitle, { color: colors.text }]}>{achievement.title}</Text>
            <Text style={[styles.achievementDescription, { color: colors.textSecondary }]}>{achievement.description}</Text>
            
            {/* Animated Progress Bar */}
            <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
              <Animated.View 
                style={[
                  styles.progressBar, 
                  { 
                    backgroundColor: achievement.earned ? colors.success : colors.primary,
                    width: chartAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', `${(achievement.progress / achievement.maxProgress) * 100}%`],
                    })
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              {achievement.progress}/{achievement.maxProgress}
            </Text>
            
            {achievement.earned && (
              <View style={styles.earnedBadge}>
                <Star size={10} color="#F59E0B" fill="#F59E0B" strokeWidth={2} />
              </View>
            )}
          </Animated.View>
        ))}
      </View>
    </View>,
    // AI Assistant
    <View key="ai" style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>🤖 AI Assistant</Text>
      <View style={[styles.settingsContainer, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
        <SettingItem
          icon={Bell}
          iconColor={colors.warning}
          title="Voice Notifications"
          subtitle="Let TravelPal speak route updates"
          onPress={() => {}}
          rightComponent={
            <Switch
              value={voiceEnabled}
              onValueChange={(value) => {
                setVoiceEnabled(value);
                Toast.show({ type: 'success', text1: `Voice notifications ${value ? 'enabled' : 'disabled'}` });
              }}
              trackColor={{ false: colors.border, true: `${colors.primary}50` }}
              thumbColor={voiceEnabled ? colors.primary : colors.textTertiary}
              accessibilityLabel="Toggle voice notifications"
            />
          }
        />
        <SettingItem
          icon={Clock}
          iconColor={colors.success}
          title="Auto Rest Alerts"
          subtitle="Remind me to take breaks every 3-4 hours"
          onPress={() => {}}
          rightComponent={
            <Switch
              value={autoRestAlerts}
              onValueChange={(value) => {
                setAutoRestAlerts(value);
                Toast.show({ type: 'success', text1: `Auto rest alerts ${value ? 'enabled' : 'disabled'}` });
              }}
              trackColor={{ false: colors.border, true: `${colors.primary}50` }}
              thumbColor={autoRestAlerts ? colors.primary : colors.textTertiary}
              accessibilityLabel="Toggle auto rest alerts"
            />
          }
        />
        <SettingItem
          icon={Zap}
          iconColor={colors.accent}
          title="Smart Suggestions"
          subtitle="AI-powered route and stop recommendations"
          onPress={voiceEnabled ? startVoiceRecognition : () => Toast.show({ type: 'error', text1: 'Enable Voice Notifications first' })}
        />
        {transcript ? <Text style={[styles.settingSubtitle, { color: colors.text }]}>Heard: {transcript}</Text> : null}
        {voiceError ? <Text style={[styles.errorText, { color: colors.error }]}>{voiceError}</Text> : null}
      </View>
    </View>,
    // Navigation Preferences
    <View key="navigation" style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>🧭 Navigation</Text>
      <View style={[styles.settingsContainer, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
        <SettingItem
          icon={Car}
          title="Vehicle Type"
          subtitle="Car • Sedan • Fuel Efficient"
          onPress={() => router.push('/(tabs)/profile' as any)}
          rightComponent={<ChevronRight size={20} color={colors.textTertiary} strokeWidth={2} />}
        />
        <SettingItem
          icon={MapPin}
          title="Favorite Places"
          subtitle="Manage your saved locations (12 saved)"
          onPress={() => router.push('/(tabs)/profile' as any)}
          rightComponent={<ChevronRight size={20} color={colors.textTertiary} strokeWidth={2} />}
        />
        <SettingItem
          icon={Target}
          title="Route Preferences"
          subtitle="Fastest routes with traffic avoidance"
          onPress={() => router.push('/(tabs)/profile' as any)}
          rightComponent={<ChevronRight size={20} color={colors.textTertiary} strokeWidth={2} />}
        />
      </View>
    </View>,
    // Privacy & Security
    <View key="privacy" style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>🔒 Privacy & Security</Text>
      <View style={[styles.settingsContainer, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
        <SettingItem
          icon={Bell}
          title="Push Notifications"
          subtitle="Traffic alerts and trip updates"
          onPress={() => {}}
          rightComponent={
            <Switch
              value={notificationsEnabled}
              onValueChange={(value) => {
                setNotificationsEnabled(value);
                Toast.show({ type: 'success', text1: `Push notifications ${value ? 'enabled' : 'disabled'}` });
              }}
              trackColor={{ false: colors.border, true: `${colors.primary}50` }}
              thumbColor={notificationsEnabled ? colors.primary : colors.textTertiary}
              accessibilityLabel="Toggle push notifications"
            />
          }
        />
        <SettingItem
          icon={Shield}
          title="Location Sharing"
          subtitle="Share location with emergency contacts"
          onPress={() => {}}
          rightComponent={
            <Switch
              value={locationSharing}
              onValueChange={toggleLocationSharing}
              trackColor={{ false: colors.border, true: `${colors.primary}50` }}
              thumbColor={locationSharing ? colors.primary : colors.textTertiary}
              accessibilityLabel="Toggle location sharing"
            />
          }
        />
        <SettingItem
          icon={Settings}
          title="Data & Privacy"
          subtitle="Manage your data and privacy settings"
          onPress={() => router.push('/(tabs)/profile' as any)}
          rightComponent={<ChevronRight size={20} color={colors.textTertiary} strokeWidth={2} />}
        />
      </View>
    </View>,
    // Support
    <View key="support" style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>💬 Support</Text>
      <View style={[styles.settingsContainer, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
        <SettingItem
          icon={CircleHelp}
          title="Help & FAQ"
          subtitle="Get help with TravelPal features"
          onPress={() => router.push('/(tabs)/profile' as any)}
          rightComponent={<ChevronRight size={20} color={colors.textTertiary} strokeWidth={2} />}
        />
        <SettingItem
          icon={Settings}
          title="Contact Support"
          subtitle="24/7 customer support available"
          onPress={() => router.push('/(tabs)/profile' as any)}
          rightComponent={<ChevronRight size={20} color={colors.textTertiary} strokeWidth={2} />}
        />
        <SettingItem
          icon={Star}
          title="Rate TravelPal"
          subtitle="Share your experience with others"
          onPress={() => Linking.openURL('https://example.com/rate')}
        />
      </View>
    </View>,
    // Premium Features
    <View key="premium" style={styles.section}>
      <GradientCard colors={['#7C3AED', '#8B5CF6']} style={styles.premiumCard}>
        <View style={styles.premiumContent}>
          <Text style={styles.premiumTitle}>🚀 TravelPal Premium</Text>
          <Text style={styles.premiumDescription}>
            Unlock advanced AI features, offline maps, and priority support
          </Text>
          <View style={styles.premiumFeatures}>
            <Text style={styles.premiumFeature}>✓ Advanced AI Route Optimization</Text>
            <Text style={styles.premiumFeature}>✓ Offline Maps & Navigation</Text>
            <Text style={styles.premiumFeature}>✓ Real-time Weather Integration</Text>
            <Text style={styles.premiumFeature}>✓ Priority Customer Support</Text>
          </View>
          <AnimatedButton onPress={() => {
            router.push('/(tabs)/profile' as any);
            Toast.show({ type: 'info', text1: 'Opening Premium subscription' });
          }}>
            <View style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </View>
          </AnimatedButton>
        </View>
      </GradientCard>
    </View>,
    // Account Actions
    <View key="account" style={styles.section}>
      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: colors.card, borderColor: colors.error, shadowColor: colors.shadow }]} 
        onPress={handleLogout}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
      >
        <LogOut size={20} color={colors.error} strokeWidth={2} />
        <Text style={[styles.logoutText, { color: colors.error }]}>Sign Out</Text>
      </TouchableOpacity>
    </View>,
    // App Version
    <View key="version" style={styles.section}>
      <View style={styles.appVersion}>
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>TravelPal v2.1.0</Text>
        <Text style={[styles.versionSubtext, { color: colors.textTertiary }]}>Made with ❤️ for travelers worldwide</Text>
        <Text style={[styles.versionSubtext, { color: colors.textTertiary }]}>Last updated: December 2024</Text>
      </View>
    </View>,
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={colors.headerGradient as any}
        style={styles.header}
      >
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <User size={32} color="#FFFFFF" strokeWidth={2} />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.userBadges}>
              {user.badges.map((badge, index) => (
                <StatusIndicator key={index} type={index === 0 ? 'success' : 'active'} text={badge} size="small" />
              ))}
            </View>
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => router.push('/(tabs)/profile' as any)}
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
            >
              <Text style={styles.editText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
      <FlatList
        data={sections}
        renderItem={({ item }) => item}
        keyExtractor={(_, index) => index.toString()}
        style={[styles.content, { backgroundColor: colors.surface }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      />
      <Toast />
    </SafeAreaView>
  );
}

const createStyles = (colors: any, insets: any) => StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: insets.top + 20, paddingBottom: 30, paddingHorizontal: 20 },
  profileInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 70, height: 70, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  userDetails: { flex: 1 },
  userName: { fontFamily: 'Inter-Bold', fontSize: 22, color: '#FFFFFF', marginBottom: 4 },
  userEmail: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#CBD5E1', marginBottom: 10 },
  userBadges: { flexDirection: 'row', gap: 8 },
  editButton: { padding: 8, backgroundColor: '#FFFFFF20', borderRadius: 8, marginTop: 8 },
  editText: { color: '#FFFFFF', fontFamily: 'Inter-SemiBold', fontSize: 14 },
  content: { flex: 1, paddingHorizontal: 20 },
  scrollContent: { paddingTop: 20, paddingBottom: Math.max(insets.bottom + 120, 140) },
  section: { marginBottom: 24 },
  sectionTitle: { fontFamily: 'Inter-SemiBold', fontSize: 18, marginBottom: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '47%', marginBottom: 12, alignItems: 'center', paddingVertical: 16, paddingHorizontal: 12 },
  statValue: { fontFamily: 'Inter-Bold', fontSize: 18, marginVertical: 6 },
  statLabel: { fontFamily: 'Inter-Regular', fontSize: 12, textAlign: 'center' },
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  achievementCard: { width: '47%', borderRadius: 12, padding: 12, marginBottom: 12, alignItems: 'center', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, position: 'relative', minHeight: 100 },
  achievementIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  achievementTitle: { fontFamily: 'Inter-SemiBold', fontSize: 13, marginBottom: 4, textAlign: 'center' },
  achievementDescription: { fontFamily: 'Inter-Regular', fontSize: 11, textAlign: 'center', lineHeight: 14 },
  earnedBadge: { position: 'absolute', top: 8, right: 8 },
  settingsContainer: { borderRadius: 16, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  settingItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  settingIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  settingContent: { flex: 1 },
  settingTitle: { fontFamily: 'Inter-SemiBold', fontSize: 15, marginBottom: 2 },
  settingSubtitle: { fontFamily: 'Inter-Regular', fontSize: 13 },
  errorText: { fontFamily: 'Inter-Regular', fontSize: 13, margin: 10 },
  premiumCard: { marginBottom: 0 },
  premiumContent: { alignItems: 'center' },
  premiumTitle: { fontFamily: 'Inter-Bold', fontSize: 18, color: '#FFFFFF', marginBottom: 8 },
  premiumDescription: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#E9D5FF', textAlign: 'center', marginBottom: 16 },
  premiumFeatures: { alignSelf: 'stretch', marginBottom: 20 },
  premiumFeature: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#FFFFFF', marginBottom: 6 },
  upgradeButton: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  upgradeButtonText: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#7C3AED' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingVertical: 14, borderWidth: 1, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  logoutText: { fontFamily: 'Inter-SemiBold', fontSize: 15, marginLeft: 8 },
  appVersion: { alignItems: 'center', paddingVertical: 16, marginBottom: 20 },
  versionText: { fontFamily: 'Inter-Medium', fontSize: 13, marginBottom: 4 },
  versionSubtext: { fontFamily: 'Inter-Regular', fontSize: 11, marginBottom: 2 },
  // New AI Demo Styles
  aiDemo: { padding: 20, borderRadius: 16, marginBottom: 16, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  demoTitle: { fontFamily: 'Inter-Bold', fontSize: 18, marginBottom: 12, textAlign: 'center' },
  demoButton: { padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  demoButtonText: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#FFFFFF' },
  demoResponse: { padding: 12, borderRadius: 8, marginTop: 8 },
  demoResponseText: { fontFamily: 'Inter-Regular', fontSize: 14, lineHeight: 20 },
  // Mood Tracker Styles
  moodSection: { padding: 20, borderRadius: 16, marginBottom: 16, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  moodTitle: { fontFamily: 'Inter-Bold', fontSize: 18, marginBottom: 16, textAlign: 'center' },
  moodOptions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  moodButton: { width: '48%', padding: 12, borderRadius: 12, alignItems: 'center', marginBottom: 8 },
  activeMood: { transform: [{ scale: 1.05 }] },
  moodEmoji: { fontSize: 24, marginBottom: 4 },
  moodLabel: { fontFamily: 'Inter-Medium', fontSize: 14 },
  moodRecommendation: { padding: 12, borderRadius: 8, alignItems: 'center' },
  moodRecommendationText: { fontFamily: 'Inter-Regular', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  // Environmental Impact Styles
  environmentSection: { padding: 20, borderRadius: 16, marginBottom: 16, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  environmentTitle: { fontFamily: 'Inter-Bold', fontSize: 18, marginBottom: 16, textAlign: 'center' },
  impactGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  impactCard: { width: '48%', padding: 12, borderRadius: 12, marginBottom: 8, alignItems: 'center' },
  impactHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  impactIcon: { fontSize: 20 },
  impactTrend: { fontFamily: 'Inter-SemiBold', fontSize: 12 },
  impactValue: { fontFamily: 'Inter-Bold', fontSize: 18, marginBottom: 4 },
  impactLabel: { fontFamily: 'Inter-Regular', fontSize: 12, textAlign: 'center' },
  updateButton: { padding: 12, borderRadius: 8, alignItems: 'center' },
  updateButtonText: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#FFFFFF' },
  // AI Insights Styles
  insightsSection: { padding: 20, borderRadius: 16, marginBottom: 16, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  insightsTitle: { fontFamily: 'Inter-Bold', fontSize: 18, marginBottom: 16, textAlign: 'center' },
  insightCard: { padding: 12, borderRadius: 8, marginBottom: 12, borderLeftWidth: 4 },
  insightHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  insightIcon: { fontSize: 16, marginRight: 8 },
  insightType: { fontFamily: 'Inter-Bold', fontSize: 12 },
  insightMessage: { fontFamily: 'Inter-Regular', fontSize: 14, lineHeight: 20 },
  // Progress Bar Styles
  progressContainer: { width: '100%', height: 6, borderRadius: 3, marginTop: 8, marginBottom: 4 },
  progressBar: { height: '100%', borderRadius: 3 },
  progressText: { fontFamily: 'Inter-Regular', fontSize: 10, textAlign: 'center' },
  // Enhanced AI Assistant Styles
  voiceCommands: { marginBottom: 16 },
  commandsTitle: { fontFamily: 'Inter-Medium', fontSize: 14, marginBottom: 8, textAlign: 'center' },
  commandChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginBottom: 6, alignSelf: 'center' },
  commandText: { fontFamily: 'Inter-Regular', fontSize: 12 },
  voiceButtonContainer: { alignItems: 'center', marginBottom: 16 },
  pulseCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  voiceButton: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  voiceButtonEmoji: { fontSize: 24 },
  errorContainer: { padding: 8, borderRadius: 8, marginTop: 8 },
  // Social Leaderboard Styles
  leaderboardSection: { padding: 20, borderRadius: 16, marginBottom: 16, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  leaderboardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  leaderboardTitle: { fontFamily: 'Inter-Bold', fontSize: 18 },
  challengeButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  challengeButtonText: { fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#FFFFFF', marginLeft: 4 },
  leaderboardItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 8 },
  leaderboardRank: { alignItems: 'center', marginRight: 12, minWidth: 40 },
  rankBadge: { fontSize: 20, marginBottom: 2 },
  rankNumber: { fontFamily: 'Inter-Medium', fontSize: 12 },
  leaderboardUser: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  userAvatar: { fontSize: 20, marginRight: 12 },
  leaderboardName: { fontFamily: 'Inter-SemiBold', fontSize: 14 },
  leaderboardScore: { fontFamily: 'Inter-Regular', fontSize: 12 },
  leaderboardStats: { flexDirection: 'row', alignItems: 'center' },
  trendText: { fontFamily: 'Inter-SemiBold', fontSize: 12, marginLeft: 4 },
  viewFullButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, marginTop: 8 },
  viewFullText: { fontFamily: 'Inter-SemiBold', fontSize: 14, marginRight: 4 },
  // Achievements Header Styles
  achievementsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  shareButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  shareButtonText: { fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#FFFFFF', marginLeft: 4 },
});