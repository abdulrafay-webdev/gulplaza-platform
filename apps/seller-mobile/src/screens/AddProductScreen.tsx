import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Image as ImageIcon,
  Sparkles,
  Check,
  Camera,
  Plus
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Category, SubCategory } from '../shared/types';
import { Theme } from '../shared/theme';
import { api } from '../services/api';
import { useSellerAuth } from '../context/SellerAuthContext';

export default function AddProductScreen({ navigation }: any) {
  const { shop } = useSellerAuth();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [shortDesc, setShortDesc] = useState('');
  const [longDesc, setLongDesc] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await api.categories.list();
      setCategories(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedCatId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Image picker error:', err);
      Alert.alert('Error', 'Failed to select image.');
    }
  };

  const handleGenerateAI = async () => {
    if (!name.trim()) {
      Alert.alert('Product Title Needed', 'Please enter a product title first so AI can generate descriptions.');
      return;
    }

    try {
      setIsAiGenerating(true);
      const res = await api.ai.generateDescription(name.trim(), selectedCatId || undefined);
      if (res.data) {
        setShortDesc(res.data.short_description || '');
        setLongDesc(res.data.long_description || '');
        Alert.alert('AI Generated! ✨', 'High-converting descriptions have been auto-generated for your product.');
      }
    } catch (err) {
      console.error('AI generation error:', err);
      Alert.alert('AI Unavailable', 'Could not generate descriptions automatically. You can write them manually.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !price || !selectedCatId) {
      Alert.alert('Missing Required Fields', 'Please provide Product Name, Price, and select a Main Category.');
      return;
    }

    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock, 10) || 0;

    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price in PKR.');
      return;
    }

    try {
      setLoading(true);
      let uploadedUrl: string | undefined = undefined;

      if (selectedImage) {
        try {
          const uploadRes = await api.ai.uploadImage(selectedImage);
          uploadedUrl = uploadRes.data.url;
        } catch (imgErr) {
          console.warn('Image upload failed, creating without image:', imgErr);
        }
      }

      const targetShopId = shop?.id || 1;
      await api.products.create(targetShopId, {
        name: name.trim(),
        price: priceNum,
        stock_quantity: stockNum,
        short_description: shortDesc.trim() || undefined,
        long_description: longDesc.trim() || undefined,
        main_category_id: selectedCatId,
        image_url: uploadedUrl,
      });

      Alert.alert('Product Published! 🎉', 'Your product is now live on AI Plaza marketplace.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      console.error('Failed to create product:', err);
      Alert.alert('Failed to Publish', 'Could not create product. Please check your data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#0F172A" size={24} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Add New Product</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#A163F7" />
          ) : (
            <Text style={styles.saveNavText}>Publish</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        {/* Product Photo Upload */}
        <View style={styles.photoCard}>
          {selectedImage ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.uploadedPhoto} />
              <TouchableOpacity style={styles.changePhotoBtn} onPress={pickImage}>
                <Camera color="#FFF" size={16} />
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadPlaceholder} onPress={pickImage}>
              <ImageIcon color="#A163F7" size={36} />
              <Text style={styles.uploadTitle}>Upload Product Image</Text>
              <Text style={styles.uploadSub}>Tap to select from gallery or capture with camera</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Basic Information */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Product Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Name / Title *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Stainless Steel Electric Kettle 2.0L"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.rowTwo}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Price (PKR) *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Rs. 3499"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Stock Quantity</Text>
              <TextInput
                style={styles.textInput}
                placeholder="10"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={stock}
                onChangeText={setStock}
              />
            </View>
          </View>

          {/* Category Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {categories.map((c) => {
                const isSelected = selectedCatId === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.catPill, isSelected ? styles.activeCatPill : null]}
                    onPress={() => setSelectedCatId(c.id)}
                  >
                    <Text style={[styles.catPillText, isSelected ? styles.activeCatPillText : null]}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* AI Product Copilot Card */}
        <View style={styles.aiCopilotCard}>
          <View style={styles.aiCopilotHeader}>
            <Sparkles color="#A163F7" size={18} />
            <Text style={styles.aiCopilotTitle}>Seller AI Product Copilot</Text>
          </View>
          <Text style={styles.aiCopilotDesc}>
            Let our AI generate high-converting title suggestions & marketing descriptions for your item!
          </Text>
          <TouchableOpacity
            style={styles.generateBtn}
            onPress={handleGenerateAI}
            disabled={isAiGenerating}
          >
            <LinearGradient colors={Theme.gradients.primary as any} style={styles.generateGrad}>
              {isAiGenerating ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Sparkles color="#FFF" size={14} />
                  <Text style={styles.generateBtnText}>Generate with AI</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Descriptions */}
        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Short Summary Description</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Brief product highlight for cards..."
              placeholderTextColor="#94A3B8"
              value={shortDesc}
              onChangeText={setShortDesc}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Detailed Description</Text>
            <TextInput
              style={[styles.textInput, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Full specifications, material details, dimensions..."
              placeholderTextColor="#94A3B8"
              multiline
              value={longDesc}
              onChangeText={setLongDesc}
            />
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    padding: 4,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  saveNavText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#A163F7',
  },
  scrollContent: {
    padding: 16,
  },
  photoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 14,
    ...Theme.shadows.sm,
  },
  previewContainer: {
    position: 'relative',
    height: 200,
  },
  uploadedPhoto: {
    width: '100%',
    height: '100%',
  },
  changePhotoBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  changePhotoText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  uploadPlaceholder: {
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
  },
  uploadSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    gap: 12,
    ...Theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  inputGroup: {},
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 12,
  },
  catScroll: {
    flexDirection: 'row',
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  activeCatPill: {
    backgroundColor: '#A163F7',
  },
  catPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  activeCatPillText: {
    color: '#FFFFFF',
  },
  aiCopilotCard: {
    backgroundColor: '#F3E8FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    marginBottom: 14,
  },
  aiCopilotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  aiCopilotTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7E22CE',
  },
  aiCopilotDesc: {
    fontSize: 11,
    color: '#6B21A8',
    lineHeight: 16,
    marginBottom: 12,
  },
  generateBtn: {
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  generateGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  generateBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
