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
  Bot,
  Truck,
  Users,
  Briefcase,
  TrendingUp,
  ShoppingBag,
  Camera,
  Layers,
  CheckCircle2
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../shared/theme';

export default function OurStoryScreen({ navigation }: any) {
  const opportunityPillars = [
    {
      num: '01',
      title: 'Digital Sellers',
      desc: 'Local shop owners take their businesses online, reaching customers far beyond their physical neighborhood.',
      icon: Store,
      color: '#7C3AED',
      bgColor: '#F3E8FF'
    },
    {
      num: '02',
      title: 'Delivery Riders',
      desc: 'Increased online orders generate steady, dignified earning opportunities for local logistics and delivery workers.',
      icon: Truck,
      color: '#0284C7',
      bgColor: '#E0F2FE'
    },
    {
      num: '03',
      title: 'Digital Catalog Managers',
      desc: 'Sellers hire young professionals to manage their digital inventory, product photos, and order fulfillment.',
      icon: Layers,
      color: '#059669',
      bgColor: '#ECFDF5'
    },
    {
      num: '04',
      title: 'Digital Marketers',
      desc: 'Emerging stores create demand for social media management, creative promotions, and digital campaigns.',
      icon: TrendingUp,
      color: '#D97706',
      bgColor: '#FEF3C7'
    },
    {
      num: '05',
      title: 'AI-Assisted Services',
      desc: 'Skilled individuals provide services around AI copywriting, product photography, and customer support.',
      icon: Bot,
      color: '#9333EA',
      bgColor: '#FAF5FF'
    },
    {
      num: '06',
      title: 'New Online Entrepreneurs',
      desc: 'Lower technical barriers empower students, home businesses, and aspiring founders to start selling immediately.',
      icon: Briefcase,
      color: '#E11D48',
      bgColor: '#FFE4E6'
    }
  ];

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
          colors={['#161226', '#2E1065', '#1E1B4B']}
          style={styles.heroCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.badge}>
            <Sparkles color="#45E3FF" size={13} />
            <Text style={styles.badgeText}>The Story of AI Plaza</Text>
          </View>
          <Text style={styles.heroTitle}>
            From a Simple Marketplace to an AI-Powered Opportunity Platform
          </Text>
          <Text style={styles.heroSubtitle}>
            "I built AI Plaza to give local businesses and ordinary customers a simple bridge into digital commerce—and to create new opportunities around that digital ecosystem."
          </Text>
        </LinearGradient>

        {/* Founder Bio Card */}
        <View style={styles.founderCard}>
          <View style={styles.founderHeader}>
            <View style={styles.avatarGlow}>
              <View style={styles.avatarInner}>
                <Text style={styles.avatarText}>AR</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.founderName}>Abdul Rafay</Text>
              <Text style={styles.founderRole}>Founder & Solo Creator of AI Plaza</Text>
              <View style={styles.ageTag}>
                <Award color="#A163F7" size={12} />
                <Text style={styles.ageText}>20 Years Old • Karachi, Pakistan</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.bodyParagraph}>
            At just <Text style={styles.boldText}>20 years old</Text>, <Text style={styles.boldText}>Abdul Rafay (abdulrafay)</Text> decided not to build another ordinary online shopping app.
          </Text>

          <Text style={styles.bodyParagraph}>
            In Pakistan, SMEs and MSMEs already provide a massive portion of national employment. With the rapid acceleration of digital transformation and AI-enabled business growth in 2026, Abdul Rafay wanted to create a platform that could help local sellers reach more customers, make digital commerce frictionless, and create real economic opportunities.
          </Text>

          <Text style={styles.bodyParagraph}>
            Many small businesses have good products but struggle with the digital side of selling—creating listings, writing product descriptions, reaching buyers, and understanding what customers want. At the same time, customers often know what they want, but don't know the exact product names or keywords to search for.
          </Text>

          <View style={styles.highlightPill}>
            <CheckCircle2 color="#7C3AED" size={16} />
            <Text style={styles.highlightPillText}>
              Abdul Rafay designed AI Plaza to solve both sides of this equation with one intelligent platform.
            </Text>
          </View>
        </View>

        {/* Section 1: AI for the Customer */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
              <Bot color="#7C3AED" size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardSectionLabel}>FOR SHOPPERS</Text>
              <Text style={styles.cardSectionTitle}>🤖 AI for the Customer</Text>
            </View>
          </View>

          <Text style={styles.bodyParagraph}>
            AI Plaza includes a conversational AI Shopping Assistant that lets customers interact naturally instead of forcing them to scroll through endless categories.
          </Text>

          {/* Prompt Example Box */}
          <View style={styles.promptBubble}>
            <Text style={styles.promptLabel}>A customer can simply say:</Text>
            <Text style={styles.promptQuote}>“Mere paas red shirt hai, iske saath konsi pant achi lagegi?”</Text>
          </View>

          <Text style={styles.bodyParagraph}>
            The AI understands the conversation, remembers context, analyzes uploaded photos for visual matching, and searches the real marketplace for matching items. This transforms shopping from tedious "search and scroll" into natural, conversational discovery.
          </Text>
        </View>

        {/* Section 2: AI for Sellers */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
              <Store color="#059669" size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardSectionLabel}>FOR MERCHANTS</Text>
              <Text style={styles.cardSectionTitle}>🏪 AI for Sellers</Text>
            </View>
          </View>

          <Text style={styles.bodyParagraph}>
            The bigger vision is empowering local shop owners. A merchant should not need advanced technical skills or expensive digital marketing teams to start selling online.
          </Text>

          <View style={styles.sellerPerksGrid}>
            {[
              'Product Titles',
              'Marketing Descriptions',
              'Categories & Tags',
              'Product Information',
              'Better Listings',
              'Zero Code Simplicity'
            ].map((perk, i) => (
              <View key={i} style={styles.perkBadge}>
                <Sparkles color="#059669" size={12} />
                <Text style={styles.perkBadgeText}>{perk}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.bodyParagraph}>
            A seller simply provides basic details, and AI assists with the digital workload—while keeping the seller in complete control. This dramatically lowers the barrier for local businesses to thrive in Pakistan’s digital economy.
          </Text>
        </View>

        {/* Section 3: How AI Plaza Creates Employment */}
        <View style={styles.ecosystemCard}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Users color="#D97706" size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardSectionLabel}>ECONOMIC IMPACT</Text>
              <Text style={styles.cardSectionTitle}>👨‍💼 Creating Digital Employment</Text>
            </View>
          </View>

          <Text style={styles.bodyParagraph}>
            AI Plaza does not claim that an app alone will magically create jobs. Instead, the platform creates a thriving <Text style={styles.boldText}>digital commerce ecosystem</Text>:
          </Text>

          {/* Formula banner */}
          <View style={styles.formulaBox}>
            <Text style={styles.formulaText}>
              Seller → AI Plaza → More Customers → More Orders → Operational Demand → Real Earning Opportunities
            </Text>
          </View>

          {/* 6 Pillars */}
          <View style={styles.pillarsGrid}>
            {opportunityPillars.map((item, idx) => {
              const Icon = item.icon;
              return (
                <View key={idx} style={styles.opportunityItem}>
                  <View style={[styles.oppIconBox, { backgroundColor: item.bgColor }]}>
                    <Icon color={item.color} size={18} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.oppTitle}>{item.num}. {item.title}</Text>
                    <Text style={styles.oppDesc}>{item.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Section 4: The Bigger Vision (Founder Quotes) */}
        <View style={styles.visionQuoteCard}>
          <Heart color="#EC4899" size={24} style={{ marginBottom: 10 }} />
          <Text style={styles.visionHeading}>🇵🇰 The Bigger Vision</Text>

          <Text style={styles.quoteBlock}>
            “My vision for AI Plaza is not simply to build an online marketplace. I want to build a digital ecosystem where technology helps local businesses grow, AI makes commerce easier, and that growth creates opportunities for people.”
          </Text>

          <View style={styles.quoteDivider} />

          <Text style={styles.quoteBlock}>
            “If a small seller can reach more customers, if a customer can find the right product more easily, and if that additional business creates work for sellers, riders, digital marketers and other service providers, then technology is doing more than making shopping convenient—it is creating economic opportunity.”
          </Text>

          <Text style={styles.founderSignature}>— Abdul Rafay (abdulrafay)</Text>
          <Text style={styles.founderAgeSub}>20-Year-Old Founder & Creator, AI Plaza</Text>
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
    padding: 22,
    marginBottom: 20,
    ...Theme.shadows.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
    marginBottom: 12,
  },
  badgeText: {
    color: '#45E3FF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 28,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#DDD6FE',
    lineHeight: 20,
    marginTop: 10,
    fontStyle: 'italic',
  },
  founderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
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
    marginVertical: 14,
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
  highlightPill: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderRadius: 14,
    padding: 12,
    gap: 10,
    marginTop: 6,
  },
  highlightPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#581C87',
    flex: 1,
    lineHeight: 18,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    ...Theme.shadows.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  cardSectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 1,
  },
  promptBubble: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#7C3AED',
    marginVertical: 10,
  },
  promptLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  promptQuote: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    fontStyle: 'italic',
  },
  sellerPerksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 12,
  },
  perkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  perkBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  ecosystemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    ...Theme.shadows.sm,
  },
  formulaBox: {
    backgroundColor: '#1E1B4B',
    borderRadius: 14,
    padding: 14,
    marginVertical: 12,
  },
  formulaText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#45E3FF',
    lineHeight: 18,
    textAlign: 'center',
  },
  pillarsGrid: {
    gap: 12,
    marginTop: 6,
  },
  opportunityItem: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 12,
  },
  oppIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oppTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
  },
  oppDesc: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
  visionQuoteCard: {
    backgroundColor: '#FDF2F8',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: '#FCE7F3',
    alignItems: 'center',
    marginTop: 6,
  },
  visionHeading: {
    fontSize: 16,
    fontWeight: '900',
    color: '#831843',
    marginBottom: 12,
  },
  quoteBlock: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#4A044E',
    textAlign: 'center',
    lineHeight: 21,
  },
  quoteDivider: {
    width: 60,
    height: 2,
    backgroundColor: '#F472B6',
    marginVertical: 14,
    borderRadius: 2,
  },
  founderSignature: {
    fontSize: 14,
    fontWeight: '900',
    color: '#831843',
    marginTop: 14,
  },
  founderAgeSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#BE185D',
    marginTop: 2,
  },
});
