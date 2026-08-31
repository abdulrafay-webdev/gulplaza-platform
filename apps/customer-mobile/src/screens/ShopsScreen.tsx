import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { Store, Search, ShieldCheck, ChevronRight, MapPin } from 'lucide-react-native';
import { Shop } from '../shared/types';
import { Theme } from '../shared/theme';
import { api } from '../services/api';

export default function ShopsScreen({ navigation }: any) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      setLoading(true);
      const res = await api.shops.list();
      setShops((res.data || []).filter(s => s.is_approved));
    } catch (err) {
      console.error('Failed to load shops:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = shops.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gul Plaza Verified Shops</Text>
        <Text style={styles.headerSubtitle}>Direct authentic stores with fast delivery</Text>
      </View>

      <View style={styles.searchBox}>
        <Search color="#94A3B8" size={18} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by store name or specialty..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Theme.colors.primaryPurple} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredShops}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const logo = item.logo_url || item.cover_image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&q=80';
            return (
              <TouchableOpacity
                style={styles.shopCard}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('ShopDetail', { shopId: item.id, shopName: item.name })}
              >
                <Image source={{ uri: logo }} style={styles.shopThumb} />
                <View style={styles.shopDetails}>
                  <View style={styles.shopNameRow}>
                    <Text style={styles.shopName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.badge}>
                      <ShieldCheck color="#10B981" size={13} />
                      <Text style={styles.badgeText}>Verified</Text>
                    </View>
                  </View>
                  <Text style={styles.shopDesc} numberOfLines={2}>
                    {item.description || 'Authentic multi-category store at Gul Plaza Karachi.'}
                  </Text>
                  <View style={styles.shopFooter}>
                    <View style={styles.locationRow}>
                      <MapPin color="#94A3B8" size={12} />
                      <Text style={styles.locationText}>Gul Plaza, Karachi</Text>
                    </View>
                    <ChevronRight color="#A163F7" size={18} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No matching shops found.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  shopCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    ...Theme.shadows.sm,
  },
  shopThumb: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  shopDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  shopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  shopName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
  },
  shopDesc: {
    fontSize: 11,
    color: '#64748B',
    marginVertical: 4,
    lineHeight: 16,
  },
  shopFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    marginTop: 40,
    fontSize: 13,
  },
});
