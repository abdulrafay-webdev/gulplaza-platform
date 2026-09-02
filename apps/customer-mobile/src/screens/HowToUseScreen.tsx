import React, { useState } from 'react';
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
  Bot,
  Camera,
  Store,
  Truck,
  Star,
  Sparkles,
  ShoppingBag,
  CheckCircle,
  HelpCircle
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../shared/theme';

export default function HowToUseScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'shopper' | 'seller'>('shopper');

  const shopperSteps = [
    {
      step: '01',
      title: 'Chat with AI Shopping Assistant',
      desc: 'Ask anything in English or Roman Urdu! "5000 ke andar gift dikhao" or "Mere paas black suit hai matching tie dikhao". AI gives instant curated recommendations.',
      icon: Bot,
      color: '#7C3AED',
      bgColor: '#F3E8FF'
    },
    {
      step: '02',
      title: 'Visual Photo Search',
      desc: 'Have a photo of a dress, watch, or kitchen gadget? Upload or snap a picture in the AI Chat. AI Plaza scans thousands of Gul Plaza items to find exact or similar matches.',
      icon: Camera,
      color: '#2563EB',
      bgColor: '#EFF6FF'
    },
    {
      step: '03',
      title: 'Browse Verified Gul Plaza Stores',
      desc: 'Explore genuine shops across Gul Plaza. View live inventory, wholesale prices, and verified merchant credentials with 100% price transparency.',
      icon: Store,
      color: '#059669',
      bgColor: '#ECFDF5'
    },
    {
      step: '04',
      title: 'Easy Cash on Delivery (COD)',
      desc: 'Add items to your cart from one or multiple stores. Enjoy safe nationwide Cash on Delivery with no credit card required.',
      icon: Truck,
      color: '#D97706',
      bgColor: '#FFFBEB'
    },
    {
      step: '05',
      title: 'Real-Time Order Tracking & Reviews',
      desc: 'Track your package progress (Pending → Confirmed → Shipped → Delivered) and leave authentic star ratings to support local sellers.',
      icon: Star,
      color: '#E11D48',
      bgColor: '#FFE4E6'
    }
  ];

  const sellerSteps = [
    {
      step: '01',
      title: 'Register Your Shop',
      desc: 'Sign up via the Seller Mobile App or Web Portal with your store name, category, and Gul Plaza floor/shop number.',
      icon: Store,
      color: '#7C3AED',
      bgColor: '#F3E8FF'
    },
    {
      step: '02',
      title: 'Add Products with AI Copilot',
      desc: 'Simply enter a title and select a photo from your gallery. Click "Generate with AI" to auto-write high-converting marketing descriptions while keeping your original photo untouched.',
      icon: Sparkles,
      color: '#2563EB',
      bgColor: '#EFF6FF'
    },
    {
      step: '03',
      title: 'Manage Incoming Orders',
      desc: 'Receive live customer orders, view ordered item breakdowns with customer phone numbers and addresses, and update status from Confirmed to Shipped.',
      icon: ShoppingBag,
      color: '#059669',
      bgColor: '#ECFDF5'
    },
    {
      step: '04',
      title: 'Approve & Moderate Reviews',
      desc: 'Build trust by moderating genuine customer ratings and approving reviews to display publicly on your product pages.',
      icon: CheckCircle,
      color: '#D97706',
      bgColor: '#FFFBEB'
    }
  ];

  const currentSteps = activeTab === 'shopper' ? shopperSteps : sellerSteps;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#0F172A" size={24} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>How to Use AI Plaza</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Intro */}
        <View style={styles.introHeader}>
          <HelpCircle color="#A163F7" size={28} />
          <Text style={styles.introTitle}>Complete Platform Guide</Text>
          <Text style={styles.introSubtitle}>
            Learn how shoppers find the best deals and how shop owners manage orders effortlessly on AI Plaza.
          </Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'shopper' && styles.activeTabBtn]}
            onPress={() => setActiveTab('shopper')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'shopper' && styles.activeTabText]}>
              🛍️ For Shoppers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'seller' && styles.activeTabBtn]}
            onPress={() => setActiveTab('seller')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'seller' && styles.activeTabText]}>
              🏪 For Shopkeepers
            </Text>
          </TouchableOpacity>
        </View>

        {/* Step-by-Step Cards */}
        <View style={styles.stepsList}>
          {currentSteps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <View key={idx} style={styles.stepCard}>
                <View style={[styles.stepIconBox, { backgroundColor: item.bgColor }]}>
                  <Icon color={item.color} size={22} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.stepHeaderRow}>
                    <Text style={[styles.stepBadge, { color: item.color }]}>STEP {item.step}</Text>
                  </View>
                  <Text style={styles.stepTitle}>{item.title}</Text>
                  <Text style={styles.stepDesc}>{item.desc}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Quick Actions Footer */}
        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>Ready to Experience AI Shopping?</Text>
          <Text style={styles.actionDesc}>Try asking our AI Shopping Assistant for your favorite products right now.</Text>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('AIChat')}
          >
            <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.actionGrad}>
              <Bot color="#FFF" size={16} />
              <Text style={styles.actionBtnText}>Launch AI Shopping Advisor</Text>
            </LinearGradient>
          </TouchableOpacity>
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
  introHeader: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 6,
  },
  introSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
    lineHeight: 18,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
    marginVertical: 14,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTabBtn: {
    backgroundColor: '#FFFFFF',
    ...Theme.shadows.sm,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  activeTabText: {
    color: '#7C3AED',
    fontWeight: '800',
  },
  stepsList: {
    gap: 12,
    marginTop: 6,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
    ...Theme.shadows.sm,
  },
  stepIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  stepBadge: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  actionCard: {
    backgroundColor: '#F3E8FF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    alignItems: 'center',
    marginTop: 24,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#581C87',
    textAlign: 'center',
  },
  actionDesc: {
    fontSize: 12,
    color: '#7E22CE',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  actionBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  actionGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
