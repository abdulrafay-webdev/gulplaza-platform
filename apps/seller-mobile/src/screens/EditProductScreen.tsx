import React, { useState } from 'react';
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
import { ChevronLeft, Camera, Image as ImageIcon, Plus, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Product } from '../shared/types';
import { Theme } from '../shared/theme';
import { api } from '../services/api';

export default function EditProductScreen({ route, navigation }: any) {
  const { product }: { product: Product } = route.params;

  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price.toString());
  const [stock, setStock] = useState(product.stock_quantity.toString());
  const [shortDesc, setShortDesc] = useState(product.short_description || '');
  const [longDesc, setLongDesc] = useState(product.long_description || '');
  const [selectedImage, setSelectedImage] = useState<string | null>(
    product.image_url || (product.images && product.images[0]?.url) || null
  );
  const [selectedBase64, setSelectedBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Variant States
  const [hasVariants, setHasVariants] = useState(Boolean(product.variants && product.variants.length > 0));
  const [variantsList, setVariantsList] = useState<{ name: string; price: string; stock: string }[]>(
    product.variants && product.variants.length > 0
      ? product.variants.map(v => ({ name: v.name, price: v.price.toString(), stock: v.stock_quantity.toString() }))
      : [{ name: '', price: product.price.toString(), stock: product.stock_quantity.toString() }]
  );

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

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Fields', 'Please provide a product name.');
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
      if (isNaN(priceNum) || priceNum <= 0) {
        priceNum = minVarPrice;
      }
    } else {
      if (isNaN(priceNum) || priceNum <= 0) {
        Alert.alert('Invalid Price', 'Please enter a valid price in PKR.');
        return;
      }
    }

    try {
      setLoading(true);
      let uploadedUrl = selectedImage;

      if (selectedImage && (selectedImage.startsWith('file:') || selectedImage.startsWith('content:'))) {
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
          console.warn('Image upload fallback during edit:', imgErr);
          if (selectedBase64) {
            uploadedUrl = selectedBase64;
          }
        }
      }

      if (!uploadedUrl && selectedBase64) {
        uploadedUrl = selectedBase64;
      }

      const payload: any = {
        name: name.trim(),
        price: priceNum,
        stock_quantity: stockNum,
        short_description: shortDesc.trim() || undefined,
        long_description: longDesc.trim() || undefined,
        image_url: uploadedUrl || undefined,
        variants: hasVariants ? validVariants : [],
      };

      await api.products.update(product.id, payload);
      Alert.alert('Success', 'Product updated successfully!');
      navigation.goBack();
    } catch (err) {
      console.error('Failed to update product:', err);
      Alert.alert('Error', 'Failed to update product.');
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
        <Text style={styles.navTitle}>Edit Product</Text>
        <TouchableOpacity onPress={handleUpdate} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#A163F7" />
          ) : (
            <Text style={styles.saveNavText}>Save</Text>
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
        {/* Photo view */}
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
              <Text style={styles.uploadTitle}>Change Product Image</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Title</Text>
            <TextInput
              style={styles.textInput}
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

          <View style={styles.rowTwo}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>{hasVariants ? "Base / Min Price *" : "Price (PKR) *"}</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Stock Quantity</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={stock}
                onChangeText={setStock}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Short Summary</Text>
            <TextInput
              style={styles.textInput}
              value={shortDesc}
              onChangeText={setShortDesc}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Description</Text>
            <TextInput
              style={[styles.textInput, { height: 100, textAlignVertical: 'top' }]}
              multiline
              value={longDesc}
              onChangeText={setLongDesc}
            />
          </View>
        </View>

        <View style={{ height: 60 }} />
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
    height: 180,
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
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 6,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    ...Theme.shadows.sm,
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
  variantToggleCard: {
    backgroundColor: '#FAF5FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    marginBottom: 6,
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
