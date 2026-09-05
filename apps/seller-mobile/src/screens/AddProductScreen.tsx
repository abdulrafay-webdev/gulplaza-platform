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
  Alert,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Image as ImageIcon,
  Sparkles,
  Check,
  Camera,
  Plus,
  Trash2
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
  const [selectedBase64, setSelectedBase64] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Variants State
  const [hasVariants, setHasVariants] = useState(false);
  const [variantsList, setVariantsList] = useState<{ name: string; price: string; stock: string }[]>([
    { name: '', price: '', stock: '10' }
  ]);

  const handleAddVariant = () => {
    setVariantsList(prev => [...prev, { name: '', price: price || '', stock: '10' }]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variantsList.length <= 1) return;
    setVariantsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: 'name' | 'price' | 'stock', val: string) => {
    setVariantsList(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

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
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        if (result.assets[0].base64) {
          setSelectedBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
      }
    } catch (err) {
      console.error('Image picker error:', err);
      Alert.alert('Error', 'Failed to select image.');
    }
  };

  const toSafeString = (v: any): string => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'string') return v;
    if (Array.isArray(v)) {
      return v.map(item => {
        if (typeof item === 'string') return item;
        try { return JSON.stringify(item); } catch { return String(item); }
      }).join('\n');
    }
    if (typeof v === 'object') {
      return Object.entries(v).map(([k, val]) => `${k}: ${val}`).join('\n');
    }
    return String(v);
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
        setShortDesc(toSafeString(res.data.short_description));
        setLongDesc(toSafeString(res.data.long_description));
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
    if (!name.trim() || !selectedCatId) {
      Alert.alert('Missing Required Fields', 'Please provide Product Name and select a Main Category.');
      return;
    }

    let priceNum = parseFloat(price);
    const stockNum = parseInt(stock, 10) || 0;

    let validVariants: { name: string; price: number; stock_quantity: number }[] = [];
    if (hasVariants) {
      for (let i = 0; i < variantsList.length; i++) {
        const v = variantsList[i];
        if (!v.name.trim()) {
          Alert.alert('Variant Name Required', `Please enter a name for Variant #${i + 1}.`);
          return;
        }
        const vPrice = parseFloat(v.price);
        if (isNaN(vPrice) || vPrice < 0) {
          Alert.alert('Invalid Variant Price', `Please enter a valid price for variant "${v.name}".`);
          return;
        }
        validVariants.push({
          name: v.name.trim(),
          price: vPrice,
          stock_quantity: parseInt(v.stock, 10) || 0,
        });
      }

      if (validVariants.length === 0) {
        Alert.alert('Variants Error', 'Please add at least one valid variant or turn off the variants switch.');
        return;
      }

      const minVarPrice = Math.min(...validVariants.map(v => v.price));
      priceNum = minVarPrice;
      const totalVarStock = validVariants.reduce((sum, v) => sum + v.stock_quantity, 0);
      stockNum = totalVarStock;
    } else {
      if (isNaN(priceNum) || priceNum <= 0) {
        Alert.alert('Invalid Price', 'Please enter a valid price in PKR.');
        return;
      }
    }

    try {
      setLoading(true);
      let uploadedUrl: string | undefined = undefined;

      if (selectedImage) {
        try {
          const formData = new FormData();
          const filename = selectedImage.split('/').pop() || 'product_image.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';

          formData.append('file', {
            uri: selectedImage,
            name: filename,
            type: type,
          } as any);

          const uploadRes = await api.products.uploadImage(formData);
          if (uploadRes.data && uploadRes.data.url) {
            uploadedUrl = uploadRes.data.url;
          }
        } catch (imgErr) {
          console.warn('Image upload fallback to data URI:', imgErr);
          if (selectedBase64) {
            uploadedUrl = selectedBase64;
          }
        }
      }

      if (!uploadedUrl && selectedBase64) {
        uploadedUrl = selectedBase64;
      }

      const targetShopId = shop?.id || 1;
      await api.products.create(targetShopId, {
        name: name.trim(),
        price: priceNum,
        stock_quantity: stockNum,
        short_description: toSafeString(shortDesc).trim() || "No short description",
        long_description: toSafeString(longDesc).trim() || "No long description",
        main_category_id: selectedCatId,
        image_url: uploadedUrl || null,
        variants: hasVariants ? validVariants : [],
      });

      Alert.alert('Product Published! 🎉', 'Your product is now live on AI Plaza marketplace.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      console.error('Failed to create product:', err);
      const detail = err.response?.data?.detail;
      let errorMsg = 'Could not create product. Please check your data.';
      if (Array.isArray(detail)) {
        errorMsg = detail.map((d: any) => `${d.loc?.slice(-1)[0] || 'field'}: ${d.msg}`).join(', ');
      } else if (typeof detail === 'string') {
        errorMsg = detail;
      }
      Alert.alert('Failed to Publish', errorMsg);
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
        <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.publishHeaderBtn}>
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
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

          {/* Variants Toggle Card */}
          <View style={styles.variantToggleCard}>
            <View style={styles.variantToggleRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.variantToggleTitle}>Product has Variants</Text>
                <Text style={styles.variantToggleDesc}>
                  Enable if this product has multiple sizes, colors, weights, or options with different prices.
                </Text>
              </View>
              <Switch
                value={hasVariants}
                onValueChange={(val) => {
                  setHasVariants(val);
                  if (val && variantsList.length === 0) {
                    setVariantsList([{ name: '', price: price || '', stock: stock || '10' }]);
                  }
                }}
                trackColor={{ false: '#E2E8F0', true: '#C084FC' }}
                thumbColor={hasVariants ? '#A163F7' : '#FFFFFF'}
              />
            </View>

            {hasVariants && (
              <View style={styles.variantsContainer}>
                <View style={styles.variantsHeader}>
                  <Text style={styles.variantsHeaderTitle}>Variants ({variantsList.length})</Text>
                  <TouchableOpacity style={styles.addVariantBtn} onPress={handleAddVariant}>
                    <Plus color="#FFFFFF" size={14} />
                    <Text style={styles.addVariantBtnText}>Add Variant</Text>
                  </TouchableOpacity>
                </View>

                {variantsList.map((variant, index) => (
                  <View key={index} style={styles.variantItemCard}>
                    <View style={styles.variantTopRow}>
                      <Text style={styles.variantBadge}>Option #{index + 1}</Text>
                      {variantsList.length > 1 && (
                        <TouchableOpacity onPress={() => handleRemoveVariant(index)} style={styles.removeVariantBtn}>
                          <Trash2 color="#EF4444" size={16} />
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Option Name *</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g. Small, 500g, Red, XL"
                        placeholderTextColor="#94A3B8"
                        value={variant.name}
                        onChangeText={(val) => handleVariantChange(index, 'name', val)}
                      />
                    </View>

                    <View style={styles.rowTwo}>
                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Price (PKR) *</Text>
                        <TextInput
                          style={styles.textInput}
                          placeholder="Rs. 150"
                          placeholderTextColor="#94A3B8"
                          keyboardType="numeric"
                          value={variant.price}
                          onChangeText={(val) => handleVariantChange(index, 'price', val)}
                        />
                      </View>
                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Stock</Text>
                        <TextInput
                          style={styles.textInput}
                          placeholder="10"
                          placeholderTextColor="#94A3B8"
                          keyboardType="numeric"
                          value={variant.stock}
                          onChangeText={(val) => handleVariantChange(index, 'stock', val)}
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {!hasVariants && (
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
          )}

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
  publishHeaderBtn: {
    backgroundColor: '#A163F7',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 12,
    shadowColor: '#A163F7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  saveNavText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
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
  variantToggleCard: {
    backgroundColor: '#FAF5FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    marginBottom: 14,
  },
  variantToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  variantToggleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#581C87',
  },
  variantToggleDesc: {
    fontSize: 11,
    color: '#7E22CE',
    lineHeight: 15,
    marginTop: 2,
  },
  variantsContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E9D5FF',
  },
  variantsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  variantsHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4C1D95',
    textTransform: 'uppercase',
  },
  addVariantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#A163F7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addVariantBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  variantItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  variantTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  variantBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A163F7',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  removeVariantBtn: {
    padding: 4,
  },
});
