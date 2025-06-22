import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Pause, SkipForward, SkipBack, Volume2, Headphones, Video, Music, Radio, Mic, Heart, Download, Share } from 'lucide-react-native';
import GradientCard from '@/components/GradientCard';
import AnimatedButton from '@/components/AnimatedButton';
import StatusIndicator from '@/components/StatusIndicator';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MUSIC_RECOMMENDATIONS = [
  {
    id: 1,
    title: 'Road Trip Vibes',
    artist: 'Various Artists',
    duration: '2:15:30',
    image: 'https://images.pexels.com/photos/210922/pexels-photo-210922.jpeg?auto=compress&cs=tinysrgb&w=400',
    type: 'playlist',
    platform: 'Spotify',
    isLiked: false,
    isDownloaded: true,
  },
  {
    id: 2,
    title: 'Chill Highway',
    artist: 'Lo-Fi Collection',
    duration: '1:45:20',
    image: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=400',
    type: 'playlist',
    platform: 'Apple Music',
    isLiked: true,
    isDownloaded: false,
  },
  {
    id: 3,
    title: 'Drive Time Podcasts',
    artist: 'TED Talks & More',
    duration: '3:20:15',
    image: 'https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg?auto=compress&cs=tinysrgb&w=400',
    type: 'podcast',
    platform: 'Spotify',
    isLiked: false,
    isDownloaded: true,
  },
];

const VIDEO_RECOMMENDATIONS = [
  {
    id: 1,
    title: 'Netflix: Travel Documentaries',
    description: 'Perfect for traffic jams and long waits',
    duration: '45-90 min episodes',
    image: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400',
    platform: 'Netflix',
    genre: 'Documentary',
    rating: 4.8,
  },
  {
    id: 2,
    title: 'YouTube: Travel Vlogs',
    description: 'Inspiring travel content from creators',
    duration: '10-30 min videos',
    image: 'https://images.pexels.com/photos/3532557/pexels-photo-3532557.jpeg?auto=compress&cs=tinysrgb&w=400',
    platform: 'YouTube',
    genre: 'Travel',
    rating: 4.6,
  },
];

const VOICE_COMMANDS = [
  { id: 1, command: '"Play my road trip playlist"', category: 'Music' },
  { id: 2, command: '"Start a podcast about technology"', category: 'Podcast' },
  { id: 3, command: '"Play relaxing music for driving"', category: 'Music' },
  { id: 4, command: '"Show me travel documentaries"', category: 'Video' },
  { id: 5, command: '"Skip to next song"', category: 'Control' },
];

export default function EntertainmentScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('No track selected');
  const [currentPlatform, setCurrentPlatform] = useState('');
  const [likedItems, setLikedItems] = useState<number[]>([2]);
  const [volume, setVolume] = useState(75);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying && currentTrack === 'No track selected') {
      setCurrentTrack('Road Trip Vibes');
      setCurrentPlatform('Spotify');
    }
  };

  const playTrack = (track: any) => {
    setCurrentTrack(track.title);
    setCurrentPlatform(track.platform);
    setIsPlaying(true);
  };

  const toggleLike = (itemId: number) => {
    setLikedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const styles = createStyles(colors, insets);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['#7C3AED', '#8B5CF6', '#A78BFA']}
        style={styles.header}
      >
        <Text style={styles.title}>Entertainment</Text>
        <Text style={styles.subtitle}>Music & Videos for your journey</Text>
        <StatusIndicator type="active" text="AI Assistant Active" size="small" />
      </LinearGradient>

      <ScrollView 
        style={[styles.content, { backgroundColor: colors.surface }]} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* AI Smart Suggestions */}
        <View style={styles.section}>
          <GradientCard colors={['#EA580C', '#FB923C']}>
            <View style={styles.aiSuggestionContent}>
              <Text style={styles.aiSuggestionTitle}>🎵 AI Music Assistant</Text>
              <Text style={styles.aiSuggestionText}>
                I noticed you're in traffic! Would you like me to play some relaxing music or start a podcast? 
                You have 25 minutes until traffic clears - perfect time for a TED talk!
              </Text>
              <View style={styles.suggestionActions}>
                <TouchableOpacity style={styles.suggestionButton}>
                  <Text style={styles.suggestionButtonText}>🎧 Play Podcast</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.suggestionButton}>
                  <Text style={styles.suggestionButtonText}>🎵 Relaxing Music</Text>
                </TouchableOpacity>
              </View>
            </View>
          </GradientCard>
        </View>

        {/* Now Playing */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🎵 Now Playing</Text>
          <View style={[styles.nowPlaying, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
            <View style={styles.trackInfo}>
              <View style={[styles.trackIcon, { backgroundColor: `${colors.primary}15` }]}>
                <Music size={24} color={colors.primary} strokeWidth={2} />
              </View>
              <View style={styles.trackDetails}>
                <Text style={[styles.trackTitle, { color: colors.text }]}>{currentTrack}</Text>
                <Text style={[styles.trackSubtitle, { color: colors.textSecondary }]}>
                  {isPlaying ? `Playing via ${currentPlatform || 'Spotify'}` : 'Ready to play'}
                </Text>
                {isPlaying && (
                  <StatusIndicator type="success" text="High Quality" size="small" />
                )}
              </View>
              <TouchableOpacity onPress={() => toggleLike(1)}>
                <Heart 
                  size={20} 
                  color={likedItems.includes(1) ? "#DC2626" : colors.textTertiary} 
                  fill={likedItems.includes(1) ? "#DC2626" : "transparent"}
                  strokeWidth={2} 
                />
              </TouchableOpacity>
            </View>
            
            {/* Volume Control */}
            <View style={styles.volumeControl}>
              <Volume2 size={16} color={colors.textSecondary} strokeWidth={2} />
              <View style={[styles.volumeSlider, { backgroundColor: colors.border }]}>
                <View style={[styles.volumeFill, { width: `${volume}%`, backgroundColor: colors.primary }]} />
              </View>
              <Text style={[styles.volumeText, { color: colors.textSecondary }]}>{volume}%</Text>
            </View>
            
            <View style={styles.playerControls}>
              <TouchableOpacity style={styles.controlButton}>
                <SkipBack size={24} color={colors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
              <AnimatedButton onPress={togglePlayback}>
                <View style={[styles.playButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
                  {isPlaying ? (
                    <Pause size={32} color="#FFFFFF" strokeWidth={2} />
                  ) : (
                    <Play size={32} color="#FFFFFF" strokeWidth={2} />
                  )}
                </View>
              </AnimatedButton>
              <TouchableOpacity style={styles.controlButton}>
                <SkipForward size={24} color={colors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Music Recommendations */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🎧 Recommended for Driving</Text>
          {MUSIC_RECOMMENDATIONS.map((item) => (
            <View key={item.id} style={[styles.mediaCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
              <Image source={{ uri: item.image }} style={styles.mediaImage} />
              <View style={styles.mediaInfo}>
                <View style={styles.mediaHeader}>
                  <Text style={[styles.mediaTitle, { color: colors.text }]}>{item.title}</Text>
                  <View style={styles.mediaActions}>
                    <TouchableOpacity onPress={() => toggleLike(item.id)}>
                      <Heart 
                        size={16} 
                        color={item.isLiked ? "#DC2626" : colors.textTertiary} 
                        fill={item.isLiked ? "#DC2626" : "transparent"}
                        strokeWidth={2} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionIcon}>
                      <Share size={16} color={colors.textSecondary} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={[styles.mediaArtist, { color: colors.textSecondary }]}>{item.artist}</Text>
                <View style={styles.mediaDetails}>
                  <Headphones size={14} color={colors.textTertiary} strokeWidth={2} />
                  <Text style={[styles.mediaDuration, { color: colors.textTertiary }]}>{item.duration}</Text>
                  <View style={[styles.mediaType, { backgroundColor: `${colors.primary}15` }]}>
                    <Text style={[styles.mediaTypeText, { color: colors.primary }]}>{item.type}</Text>
                  </View>
                  <Text style={[styles.platformText, { color: colors.success }]}>{item.platform}</Text>
                  {item.isDownloaded && (
                    <Download size={14} color={colors.success} strokeWidth={2} />
                  )}
                </View>
              </View>
              <AnimatedButton onPress={() => playTrack(item)}>
                <View style={[styles.playButtonSmall, { backgroundColor: `${colors.primary}15` }]}>
                  <Play size={20} color={colors.primary} strokeWidth={2} />
                </View>
              </AnimatedButton>
            </View>
          ))}
        </View>

        {/* Video Entertainment */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📺 Video Entertainment</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Perfect for traffic or passenger entertainment</Text>
          
          {VIDEO_RECOMMENDATIONS.map((video) => (
            <TouchableOpacity key={video.id} style={[styles.videoCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
              <Image source={{ uri: video.image }} style={styles.videoImage} />
              <View style={styles.videoOverlay}>
                <Video size={32} color="#FFFFFF" strokeWidth={2} />
              </View>
              <View style={styles.videoInfo}>
                <View style={styles.videoHeader}>
                  <Text style={[styles.videoTitle, { color: colors.text }]}>{video.title}</Text>
                  <View style={styles.videoRating}>
                    <Text style={styles.ratingText}>⭐ {video.rating}</Text>
                  </View>
                </View>
                <Text style={[styles.videoDescription, { color: colors.textSecondary }]}>{video.description}</Text>
                <View style={styles.videoDetails}>
                  <StatusIndicator type="info" text={video.platform} size="small" />
                  <Text style={[styles.videoDuration, { color: colors.textTertiary }]}>{video.duration}</Text>
                  <Text style={[styles.videoGenre, { color: colors.accent }]}>{video.genre}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Voice Commands */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🎤 Voice Commands</Text>
          <View style={[styles.voiceCommands, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
            {VOICE_COMMANDS.map((cmd) => (
              <TouchableOpacity key={cmd.id} style={[styles.voiceCommand, { borderBottomColor: colors.border }]}>
                <Mic size={20} color={colors.primary} strokeWidth={2} />
                <View style={styles.commandContent}>
                  <Text style={[styles.voiceCommandText, { color: colors.textSecondary }]}>{cmd.command}</Text>
                  <Text style={[styles.commandCategory, { color: colors.primary }]}>{cmd.category}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Access */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>⚡ Quick Access</Text>
          <View style={styles.quickAccess}>
            <AnimatedButton onPress={() => {}}>
              <View style={styles.quickAccessCard}>
                <LinearGradient
                  colors={['#059669', '#10B981']}
                  style={styles.quickAccessGradient}
                >
                  <View style={styles.quickAccessContent}>
                    <View style={styles.quickAccessIconContainer}>
                      <Music size={28} color="#FFFFFF" strokeWidth={2} />
                    </View>
                    <View style={styles.quickAccessTextContainer}>
                      <Text style={styles.quickAccessText}>Spotify</Text>
                      <Text style={styles.quickAccessSubtext}>Premium</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </AnimatedButton>
            
            <AnimatedButton onPress={() => {}}>
              <View style={styles.quickAccessCard}>
                <LinearGradient
                  colors={['#DC2626', '#EF4444']}
                  style={styles.quickAccessGradient}
                >
                  <View style={styles.quickAccessContent}>
                    <View style={styles.quickAccessIconContainer}>
                      <Video size={28} color="#FFFFFF" strokeWidth={2} />
                    </View>
                    <View style={styles.quickAccessTextContainer}>
                      <Text style={styles.quickAccessText}>Netflix</Text>
                      <Text style={styles.quickAccessSubtext}>HD Ready</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </AnimatedButton>
            
            <AnimatedButton onPress={() => {}}>
              <View style={styles.quickAccessCard}>
                <LinearGradient
                  colors={['#7C3AED', '#8B5CF6']}
                  style={styles.quickAccessGradient}
                >
                  <View style={styles.quickAccessContent}>
                    <View style={styles.quickAccessIconContainer}>
                      <Radio size={28} color="#FFFFFF" strokeWidth={2} />
                    </View>
                    <View style={styles.quickAccessTextContainer}>
                      <Text style={styles.quickAccessText}>Radio</Text>
                      <Text style={styles.quickAccessSubtext}>Live FM</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </AnimatedButton>
            
            <AnimatedButton onPress={() => {}}>
              <View style={styles.quickAccessCard}>
                <LinearGradient
                  colors={['#EA580C', '#FB923C']}
                  style={styles.quickAccessGradient}
                >
                  <View style={styles.quickAccessContent}>
                    <View style={styles.quickAccessIconContainer}>
                      <Headphones size={28} color="#FFFFFF" strokeWidth={2} />
                    </View>
                    <View style={styles.quickAccessTextContainer}>
                      <Text style={styles.quickAccessText}>Podcasts</Text>
                      <Text style={styles.quickAccessSubtext}>Latest</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </AnimatedButton>
          </View>
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
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#E9D5FF',
    marginBottom: 12,
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
  sectionSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 16,
  },
  aiSuggestionContent: {
    alignItems: 'flex-start',
  },
  aiSuggestionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  aiSuggestionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#FED7AA',
    lineHeight: 20,
    marginBottom: 16,
  },
  suggestionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  suggestionButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  suggestionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  nowPlaying: {
    borderRadius: 16,
    padding: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  trackIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  trackDetails: {
    flex: 1,
  },
  trackTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  trackSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 8,
  },
  volumeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  volumeSlider: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 12,
  },
  volumeFill: {
    height: '100%',
    borderRadius: 2,
  },
  volumeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    minWidth: 32,
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    padding: 12,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mediaCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  mediaImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  mediaInfo: {
    flex: 1,
    marginLeft: 16,
  },
  mediaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  mediaTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  mediaActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIcon: {
    padding: 2,
  },
  mediaArtist: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 8,
  },
  mediaDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  mediaDuration: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  mediaType: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  mediaTypeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
  },
  platformText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  playButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoCard: {
    borderRadius: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  videoImage: {
    width: '100%',
    height: 180,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 180 - 120,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    padding: 16,
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  videoTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  videoRating: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#92400E',
  },
  videoDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 12,
  },
  videoDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  videoDuration: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  videoGenre: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  voiceCommands: {
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  voiceCommand: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  commandContent: {
    marginLeft: 12,
    flex: 1,
  },
  voiceCommandText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  commandCategory: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  quickAccess: {
    gap: 16,
  },
  quickAccessCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 4,
  },
  quickAccessGradient: {
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  quickAccessContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  quickAccessIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  quickAccessTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  quickAccessText: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  quickAccessSubtext: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
});