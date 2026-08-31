import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  FlatList
} from 'react-native';
import {
  Bot,
  Send,
  Image as ImageIcon,
  Sparkles,
  Plus,
  Trash2,
  X,
  ShoppingBag,
  Store,
  ChevronLeft,
  ArrowRight,
  ShieldCheck
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { AIChat, AIMessage, Product } from '../shared/types';
import { Theme } from '../shared/theme';
import { formatCurrency } from '../shared/formatters';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function AIChatScreen({ route, navigation }: any) {
  const { user, token } = useAuth();
  const { addToCart } = useCart();
  const initialMessage = route?.params?.initialMessage;

  const [chats, setChats] = useState<AIChat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState(initialMessage || '');
  const [isThinking, setIsThinking] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  // Authentication Guard
  useEffect(() => {
    if (!user && !token) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to access your AI Shopping Advisor and save your conversation history.',
        [
          { text: 'Cancel', onPress: () => navigation.goBack() },
          { text: 'Sign In', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }
    loadChats();
  }, [user, token]);

  // Handle initial message if passed from HomeScreen
  useEffect(() => {
    if (initialMessage && user) {
      handleSendMessage(initialMessage);
    }
  }, [initialMessage, user]);

  const loadChats = async () => {
    try {
      const res = await api.ai.listChats();
      const chatList = res.data || [];
      setChats(chatList);
      if (chatList.length > 0 && !currentChatId) {
        loadChatDetail(chatList[0].id);
      }
    } catch (err) {
      console.error('Failed to load chats:', err);
    }
  };

  const loadChatDetail = async (chatId: number) => {
    try {
      setCurrentChatId(chatId);
      setHistoryModalVisible(false);
      const res = await api.ai.getChat(chatId);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Failed to load chat details:', err);
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setInputText('');
    setSelectedImage(null);
    setHistoryModalVisible(false);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera roll permission is required to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const mime = asset.mimeType || 'image/jpeg';
      const b64Uri = asset.base64 ? `data:${mime};base64,${asset.base64}` : asset.uri;
      setSelectedImage(b64Uri);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText !== undefined ? customText : inputText;
    if (!textToSend.trim() && !selectedImage) return;

    setIsThinking(true);
    setInputText('');
    const imageToSend = selectedImage;
    setSelectedImage(null);

    // Optimistic user message preview
    const tempMsg: AIMessage = {
      id: Date.now(),
      chat_id: currentChatId || 0,
      role: 'user',
      content: textToSend,
      image_url: imageToSend || undefined,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      if (!currentChatId) {
        // Create new chat
        const createRes = await api.ai.createChat({
          initial_message: textToSend,
          image_url: imageToSend || undefined
        });

        if (createRes.data.chat) {
          const newChatId = createRes.data.chat.id;
          setCurrentChatId(newChatId);
          if (createRes.data.assistant_message && createRes.data.user_message) {
            setMessages([createRes.data.user_message, createRes.data.assistant_message]);
          }
          loadChats();
        }
      } else {
        // Existing chat
        const res = await api.ai.sendMessage(currentChatId, {
          content: textToSend,
          image_url: imageToSend || undefined
        });

        if (res.data.assistant_message) {
          setMessages(prev => {
            const filtered = prev.filter(m => m.id !== tempMsg.id);
            return [...filtered, res.data.user_message, res.data.assistant_message];
          });
        }
        loadChats();
      }
    } catch (err) {
      console.error('AI chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          chat_id: currentChatId || 0,
          role: 'assistant',
          content: 'Maaf kijiye, response process karne mein issue aaya hai. Baraye meharbani dobara try karein.',
          created_at: new Date().toISOString(),
          products: []
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const sampleStarters = [
    'Mere paas red shirt hai, iske saath konsi pant achi lagegi?',
    '5000 ke andar best formal shoes dikhao',
    'Kitchen ke liye fast electric kettle chahiye',
    'Kisi ko gift dena hai, luxury perfume suggest karo'
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#0F172A" size={24} />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <View style={styles.aiBadge}>
            <Bot color="#FFF" size={14} />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Personal Advisor</Text>
            <Text style={styles.headerSubtitle}>Powered by Gemini</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.historyBtn} 
            onPress={() => setHistoryModalVisible(true)}
          >
            <Text style={styles.historyBtnText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.newChatBtn} onPress={handleNewChat}>
            <Plus color="#A163F7" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Messages List */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={Theme.gradients.aiGlow as any}
                style={styles.emptyIcon}
              >
                <Bot color="#FFF" size={36} />
              </LinearGradient>
              <Text style={styles.emptyTitle}>How can I help you shop today?</Text>
              <Text style={styles.emptySubtitle}>
                Ask for matching outfits, gift ideas, specific products, or upload photos in Roman Urdu!
              </Text>

              <View style={styles.startersGrid}>
                {sampleStarters.map((s, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.starterPill}
                    onPress={() => handleSendMessage(s)}
                  >
                    <Sparkles color="#A163F7" size={14} />
                    <Text style={styles.starterText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <View
                  key={m.id}
                  style={[
                    styles.messageRow,
                    isUser ? styles.userRow : styles.assistantRow
                  ]}
                >
                  {!isUser && (
                    <LinearGradient
                      colors={Theme.gradients.primary as any}
                      style={styles.avatarMini}
                    >
                      <Bot color="#FFF" size={14} />
                    </LinearGradient>
                  )}

                  <View
                    style={[
                      styles.messageBubble,
                      isUser ? styles.userBubble : styles.assistantBubble
                    ]}
                  >
                    {/* Uploaded Image in Message */}
                    {m.image_url && (
                      <Image source={{ uri: m.image_url }} style={styles.msgImage} />
                    )}

                    <Text
                      style={[
                        styles.messageText,
                        isUser ? styles.userText : styles.assistantText
                      ]}
                    >
                      {m.content}
                    </Text>

                    {/* Recommended Product Cards Carousel/List */}
                    {m.products && m.products.length > 0 && (
                      <View style={styles.productsContainer}>
                        <Text style={styles.prodsHeader}>
                          Recommended Marketplace Items ({m.products.length})
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          {m.products.map((p) => {
                            const thumb = p.image_url || (p.images && p.images[0]?.url) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';
                            return (
                              <View key={p.id} style={styles.chatProdCard}>
                                <Image source={{ uri: thumb }} style={styles.chatProdThumb} />
                                <View style={styles.chatProdBody}>
                                  <Text style={styles.chatProdShop} numberOfLines={1}>
                                    {p.shop?.name || p.shop_name || 'Plaza Store'}
                                  </Text>
                                  <Text style={styles.chatProdTitle} numberOfLines={2}>
                                    {p.name}
                                  </Text>
                                  <Text style={styles.chatProdPrice}>
                                    {formatCurrency(p.price)}
                                  </Text>

                                  <View style={styles.chatProdActions}>
                                    <TouchableOpacity
                                      style={styles.chatAddBtn}
                                      onPress={() => addToCart(p, 1)}
                                    >
                                      <ShoppingBag color="#FFF" size={12} />
                                      <Text style={styles.chatAddBtnText}>Add Cart</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                      style={styles.chatDetailsBtn}
                                      onPress={() => navigation.navigate('ProductDetail', { productId: p.id })}
                                    >
                                      <Text style={styles.chatDetailsText}>View</Text>
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              </View>
                            );
                          })}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}

          {isThinking && (
            <View style={[styles.messageRow, styles.assistantRow]}>
              <LinearGradient colors={Theme.gradients.primary as any} style={styles.avatarMini}>
                <Bot color="#FFF" size={14} />
              </LinearGradient>
              <View style={[styles.messageBubble, styles.assistantBubble, styles.thinkingBubble]}>
                <ActivityIndicator size="small" color="#A163F7" />
                <Text style={styles.thinkingText}>AI Advisor is thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Selected Image Preview Pill */}
        {selectedImage && (
          <View style={styles.imagePreviewPill}>
            <Image source={{ uri: selectedImage }} style={styles.previewThumb} />
            <Text style={styles.previewText} numberOfLines={1}>Photo attached for visual analysis</Text>
            <TouchableOpacity onPress={() => setSelectedImage(null)}>
              <X color="#EF4444" size={18} />
            </TouchableOpacity>
          </View>
        )}

        {/* Chat Input Bar */}
        <View style={styles.inputContainer}>
          <View style={styles.inputPill}>
            <TouchableOpacity style={styles.cameraBtn} onPress={pickImage}>
              <ImageIcon color="#A163F7" size={20} />
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask for clothes, shoes, gifts in Roman Urdu..."
              placeholderTextColor="#94A3B8"
              multiline
              maxLength={400}
            />

            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!inputText.trim() && !selectedImage) || isThinking ? styles.sendBtnDisabled : null
              ]}
              disabled={(!inputText.trim() && !selectedImage) || isThinking}
              onPress={() => handleSendMessage()}
            >
              <LinearGradient
                colors={Theme.gradients.primary as any}
                style={styles.sendBtnGrad}
              >
                <Send color="#FFF" size={16} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <Text style={styles.disclaimerText}>
            AI Plaza Assistant matches real marketplace products. Prices confirmed at checkout.
          </Text>
        </View>
      </KeyboardAvoidingView>

      {/* Chat History Modal */}
      <Modal visible={historyModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your AI Conversations</Text>
              <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
                <X color="#0F172A" size={22} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={chats}
              keyExtractor={(c) => c.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.historyItem,
                    item.id === currentChatId ? styles.activeHistoryItem : null
                  ]}
                  onPress={() => loadChatDetail(item.id)}
                >
                  <Bot color="#A163F7" size={18} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.historyMeta}>{item.messages_count || 0} messages</Text>
                  </View>
                  <ArrowRight color="#94A3B8" size={16} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyHistoryText}>No past conversations yet.</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    padding: 4,
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiBadge: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#A163F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 9,
    color: '#10B981',
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  historyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  newChatBtn: {
    padding: 6,
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Theme.shadows.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  startersGrid: {
    width: '100%',
    gap: 8,
  },
  starterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Theme.shadows.sm,
  },
  starterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 8,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  assistantRow: {
    justifyContent: 'flex-start',
  },
  avatarMini: {
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#A163F7',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Theme.shadows.sm,
  },
  msgImage: {
    width: 200,
    height: 140,
    borderRadius: 12,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
  },
  userText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  assistantText: {
    color: '#1E293B',
  },
  thinkingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  thinkingText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  productsContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  prodsHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A163F7',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  chatProdCard: {
    width: 170,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
    marginRight: 10,
  },
  chatProdThumb: {
    width: '100%',
    height: 90,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  chatProdBody: {
    marginTop: 6,
  },
  chatProdShop: {
    fontSize: 8,
    fontWeight: '700',
    color: '#A163F7',
    textTransform: 'uppercase',
  },
  chatProdTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    height: 28,
    marginVertical: 2,
  },
  chatProdPrice: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
  },
  chatProdActions: {
    flexDirection: 'row',
    gap: 4,
  },
  chatAddBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#A163F7',
    paddingVertical: 5,
    borderRadius: 8,
  },
  chatAddBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  chatDetailsBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
  },
  chatDetailsText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  imagePreviewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 6,
  },
  previewThumb: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  previewText: {
    fontSize: 11,
    color: '#7E22CE',
    fontWeight: '600',
    flex: 1,
  },
  inputContainer: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  inputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cameraBtn: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    maxHeight: 80,
    paddingHorizontal: 8,
  },
  sendBtn: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendBtnGrad: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disclaimerText: {
    fontSize: 9,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  activeHistoryItem: {
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  historyMeta: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  emptyHistoryText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    marginVertical: 20,
  },
});
