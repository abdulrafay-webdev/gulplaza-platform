import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Sparkles,
  Heart,
  Award,
  Store,
  Lightbulb,
  Rocket
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../shared/theme';

export default function OurStoryScreen({ navigation }: any) {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#0F172A" size={24} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Our Story</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Banner */}
        <LinearGradient
          colors={['#7C3AED', '#4F46E5', '#2563EB']}
          style={styles.heroCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.badge}>
            <Sparkles color="#FDE047" size={14} />
            <Text style={styles.badgeText}>The Vision Behind AI Plaza</Text>
          </View>
          <Text style={styles.heroTitle}>Conceived & Built by a 20-Year-Old Visionary</Text>
          <Text style={styles.heroSubtitle}>
            How one passionate Pakistani student engineered an entire AI-powered multi-vendor eCommerce ecosystem from scratch.
          </Text>
        </LinearGradient>

        {/* Founder Highlight Card */}
        <View style={styles.founderCard}>
          <View style={styles.founderHeader}>
            <View style={styles.avatarGlow}>
              <View style={styles.avatarInner}>
                <Text style={styles.avatarText}>AR</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.founderName}>Abdul Rafay</Text>
              <Text style={styles.founderRole}>Founder, Solo Architect & Lead Developer</Text>
              <View style={styles.ageTag}>
                <Award color="#A163F7" size={12} />
                <Text style={styles.ageText}>20 Years Old • Karachi, Pakistan</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.bodyParagraph}>
            At just <Text style={styles.boldText}>20 years of age</Text>, <Text style={styles.boldText}>Abdul Rafay</Text> had an ambitious dream: to bridge the gap between Karachi’s legendary physical shopping hub—<Text style={styles.boldText}>Gul Plaza</Text>—and the modern era of Generative Artificial Intelligence.
          </Text>

          <Text style={styles.bodyParagraph}>
            Rather than relying on large venture studios or external development agencies, Abdul Rafay architected, coded, and deployed the entire multi-tenant platform <Text style={styles.boldText}>single-handedly</Text>—spanning backend micro-services, Next.js web portals, and 3 cross-platform React Native mobile applications.
          </Text>
        </View>

        {/* Key Pillars */}
        <Text style={styles.sectionHeading}>Why AI Plaza Was Created</Text>

        <View style={styles.pillarCard}>
          <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
            <Store color="#7C3AED" size={20} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.pillarTitle}>Empowering Local Merchants</Text>
            <Text style={styles.pillarDesc}>
              Gul Plaza is home to thousands of hardworking shopkeepers. Abdul Rafay built an intuitive mobile platform so vendors can easily upload items, receive orders, and use AI copywriting with zero technical friction.
            </Text>
          </View>
        </View>

        <View style={styles.pillarCard}>
          <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
            <Lightbulb color="#2563EB" size={20} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.pillarTitle}>Revolutionary AI Shopping</Text>
            <Text style={styles.pillarDesc}>
              Tired of boring product filters? Our proprietary conversational AI Assistant understands Urdu & English, suggests matching outfits, finds gifts within your budget, and scans visual images to find exact products.
            </Text>
          </View>
        </View>

        <View style={styles.pillarCard}>
          <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
            <Rocket color="#059669" size={20} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.pillarTitle}>Nationwide Pakistan Delivery</Text>
            <Text style={styles.pillarDesc}>
              Bringing wholesale prices and unique Gul Plaza varieties directly to doorstep delivery across all Pakistani cities with trusted Cash on Delivery (COD).
            </Text>
          </View>
        </View>

        {/* Quote Card */}
        <View style={styles.quoteCard}>
          <Heart color="#EC4899" size={22} style={{ marginBottom: 8 }} />
          <Text style={styles.quoteText}>
            "I wanted to prove that a passionate young student from Pakistan can build a world-class, AI-first platform capable of transforming traditional retail into an intelligent digital marketplace."
          </Text>
          <Text style={styles.quoteAuthor}>— Abdul Rafay (abdulrafay)</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
  },
  heroCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    ...Theme.shadows.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
    marginBottom: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 28,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#E0E7FF',
    lineHeight: 19,
    marginTop: 8,
  },
  founderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    ...Theme.shadows.sm,
  },
  founderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarGlow: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  founderName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  founderRole: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  ageTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ageText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  bodyParagraph: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 21,
    marginBottom: 10,
  },
  boldText: {
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  pillarCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
    marginBottom: 12,
    ...Theme.shadows.sm,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  pillarDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  quoteCard: {
    backgroundColor: '#FDF2F8',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FCE7F3',
    alignItems: 'center',
    marginTop: 12,
  },
  quoteText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#831843',
    textAlign: 'center',
    lineHeight: 20,
  },
  quoteAuthor: {
    fontSize: 12,
    fontWeight: '800',
    color: '#BE185D',
    marginTop: 8,
  },
});
