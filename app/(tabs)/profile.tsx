import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Settings, MapPin, Clock, Car, Bell, Shield, CircleHelp as HelpCircle, LogOut, ChevronRight, Award, Target, Trophy, Zap, Star } from 'lucide-react-native';
import GradientCard from '@/components/GradientCard';
import AnimatedButton from '@/components/AnimatedButton';
import StatusIndicator from '@/components/StatusIndicator';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TRIP_STATS = [
  { label: 'Total Distance', value: '12,345 km', icon: Target, color: '#2563EB' },
  { label: 'Trip Hours', value: '89.5 hrs', icon: Clock, color: '#059669' },
  { label: 'Routes Saved', value: '23', icon: MapPin, color: '#F59E0B' },
  { label: 'AI Suggestions Used', value: '156', icon: Award, color: '#7C3AED' },
];

const ACHIEVEMENTS = [
  { id: 1, title: 'Road Warrior', description: 'Completed 50+ trips', icon: Trophy, earned: true },
  { id: 2, title: 'Eco Driver', description: 'Used eco routes 20 times', icon: Target, earned: true },
  { id: 3, title: 'Explorer', description: 'Visited 10+ new places', icon: MapPin, earned: false },
  { id: 4, title: 'AI Partner', description: 'Used voice commands 100 times', icon: Zap, earned: true },
];

export default function ProfileScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoRestAlerts, setAutoRestAlerts] = useState(true);
  const [locationSharing, setLocationSharing] = useState(false);

  const SettingItem = ({ icon: Icon, title, subtitle, onPress, rightComponent, iconColor = colors.primary }: any) => (
    <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]} onPress={onPress}>
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

  const styles = createStyles(colors, insets);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={colors.headerGradient}
        style={styles.header}
      >
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <User size={32} color="#FFFFFF" strokeWidth={2} />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>John Traveler</Text>
            <Text style={styles.userEmail}>john.traveler@email.com</Text>
            <View style={styles.userBadges}>
              <StatusIndicator type="success" text="Expert Navigator" size="small" />
              <StatusIndicator type="active" text="Premium" size="small" />
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={[styles.content, { backgroundColor: colors.surface }]} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Theme Toggle Section */}
        <View style={styles.section}>
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
        </View>

        {/* Trip Statistics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📊 Your Journey Stats</Text>
          <View style={styles.statsGrid}>
            {TRIP_STATS.map((stat, index) => (
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
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🏆 Achievements</Text>
          <View style={styles.achievementsGrid}>
            {ACHIEVEMENTS.map((achievement) => (
              <View 
                key={achievement.id} 
                style={[
                  styles.achievementCard,
                  { 
                    backgroundColor: colors.card,
                    shadowColor: colors.shadow,
                    opacity: achievement.earned ? 1 : 0.6 
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
                {achievement.earned && (
                  <View style={styles.earnedBadge}>
                    <Star size={10} color="#F59E0B" fill="#F59E0B" strokeWidth={2} />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* AI Assistant Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🤖 AI Assistant</Text>
          <View style={[styles.settingsContainer, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
            <SettingItem
              icon={Bell}
              iconColor={colors.warning}
              title="Voice Notifications"
              subtitle="Let TravelPal speak route updates"
              rightComponent={
                <Switch
                  value={voiceEnabled}
                  onValueChange={setVoiceEnabled}
                  trackColor={{ false: colors.border, true: `${colors.primary}50` }}
                  thumbColor={voiceEnabled ? colors.primary : colors.textTertiary}
                />
              }
            />
            <SettingItem
              icon={Clock}
              iconColor={colors.success}
              title="Auto Rest Alerts"
              subtitle="Remind me to take breaks every 3-4 hours"
              rightComponent={
                <Switch
                  value={autoRestAlerts}
                  onValueChange={setAutoRestAlerts}
                  trackColor={{ false: colors.border, true: `${colors.primary}50` }}
                  thumbColor={autoRestAlerts ? colors.primary : colors.textTertiary}
                />
              }
            />
            <SettingItem
              icon={Zap}
              iconColor={colors.accent}
              title="Smart Suggestions"
              subtitle="AI-powered route and stop recommendations"
            />
          </View>
        </View>

        {/* Navigation Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🧭 Navigation</Text>
          <View style={[styles.settingsContainer, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
            <SettingItem
              icon={Car}
              iconColor={colors.primary}
              title="Vehicle Type"
              subtitle="Car • Sedan • Fuel Efficient"
            />
            <SettingItem
              icon={MapPin}
              iconColor={colors.error}
              title="Favorite Places"
              subtitle="Manage your saved locations (12 saved)"
            />
            <SettingItem
              icon={Target}
              iconColor={colors.success}
              title="Route Preferences"
              subtitle="Fastest routes with traffic avoidance"
            />
          </View>
        </View>

        {/* Privacy & Security */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🔒 Privacy & Security</Text>
          <View style={[styles.settingsContainer, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
            <SettingItem
              icon={Bell}
              iconColor={colors.warning}
              title="Push Notifications"
              subtitle="Traffic alerts and trip updates"
              rightComponent={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: colors.border, true: `${colors.primary}50` }}
                  thumbColor={notificationsEnabled ? colors.primary : colors.textTertiary}
                />
              }
            />
            <SettingItem
              icon={Shield}
              iconColor={colors.success}
              title="Location Sharing"
              subtitle="Share location with emergency contacts"
              rightComponent={
                <Switch
                  value={locationSharing}
                  onValueChange={setLocationSharing}
                  trackColor={{ false: colors.border, true: `${colors.primary}50` }}
                  thumbColor={locationSharing ? colors.primary : colors.textTertiary}
                />
              }
            />
            <SettingItem
              icon={Settings}
              iconColor={colors.textTertiary}
              title="Data & Privacy"
              subtitle="Manage your data and privacy settings"
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>💬 Support</Text>
          <View style={[styles.settingsContainer, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
            <SettingItem
              icon={HelpCircle}
              iconColor={colors.primary}
              title="Help & FAQ"
              subtitle="Get help with TravelPal features"
            />
            <SettingItem
              icon={Settings}
              iconColor={colors.success}
              title="Contact Support"
              subtitle="24/7 customer support available"
            />
            <SettingItem
              icon={Star}
              iconColor={colors.warning}
              title="Rate TravelPal"
              subtitle="Share your experience with others"
            />
          </View>
        </View>

        {/* Premium Features */}
        <View style={styles.section}>
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
              <AnimatedButton onPress={() => {}}>
                <View style={styles.upgradeButton}>
                  <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
                </View>
              </AnimatedButton>
            </View>
          </GradientCard>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.card, borderColor: colors.error, shadowColor: colors.shadow }]}>
            <LogOut size={20} color={colors.error} strokeWidth={2} />
            <Text style={[styles.logoutText, { color: colors.error }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.appVersion}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>TravelPal v2.1.0</Text>
          <Text style={[styles.versionSubtext, { color: colors.textTertiary }]}>Made with ❤️ for travelers worldwide</Text>
          <Text style={[styles.versionSubtext, { color: colors.textTertiary }]}>Last updated: December 2024</Text>
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
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#CBD5E1',
    marginBottom: 10,
  },
  userBadges: {
    flexDirection: 'row',
    gap: 8,
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '47%',
    marginBottom: 12,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginVertical: 6,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    textAlign: 'center',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '47%',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    minHeight: 100,
  },
  achievementIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    marginBottom: 4,
    textAlign: 'center',
  },
  achievementDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  earnedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  settingsContainer: {
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
  },
  premiumCard: {
    marginBottom: 0,
  },
  premiumContent: {
    alignItems: 'center',
  },
  premiumTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  premiumDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#E9D5FF',
    textAlign: 'center',
    marginBottom: 16,
  },
  premiumFeatures: {
    alignSelf: 'stretch',
    marginBottom: 20,
  },
  premiumFeature: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  upgradeButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  upgradeButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#7C3AED',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    marginLeft: 8,
  },
  appVersion: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 20,
  },
  versionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    marginBottom: 4,
  },
  versionSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    marginBottom: 2,
  },
});