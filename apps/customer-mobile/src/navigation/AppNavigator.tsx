import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  Home, 
  Store, 
  Bot, 
  ShoppingBag, 
  User as UserIcon,
  Sparkles 
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import HomeScreen from '../screens/HomeScreen';
import ShopsScreen from '../screens/ShopsScreen';
import AIChatScreen from '../screens/AIChatScreen';
import CartScreen from '../screens/CartScreen';
import AccountScreen from '../screens/AccountScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ShopDetailScreen from '../screens/ShopDetailScreen';
import SearchScreen from '../screens/SearchScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrdersScreen from '../screens/OrdersScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

import { Theme } from '../../../../mobile-shared/src/theme';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CustomTabBar({ state, descriptors, navigation }: any) {
  const { cartCount } = useCart();
  const { user, token } = useAuth();

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const isAI = route.name === 'AITab';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              if (isAI) {
                if (!user && !token) {
                  navigation.navigate('Login');
                  return;
                }
                navigation.navigate('AIChat');
                return;
              }
              navigation.navigate(route.name);
            }
          };

          if (isAI) {
            return (
              <TouchableOpacity
                key={route.key}
                activeOpacity={0.85}
                onPress={onPress}
                style={styles.floatingAIBtnWrapper}
              >
                <LinearGradient
                  colors={Theme.gradients.aiGlow as any}
                  style={styles.floatingAIBtn}
                >
                  <Bot color="#FFFFFF" size={28} />
                  <Sparkles
                    color="#FFD700"
                    size={12}
                    style={styles.aiSparkleIcon}
                  />
                </LinearGradient>
                <Text style={styles.floatingAILabel}>AI Advisor</Text>
              </TouchableOpacity>
            );
          }

          let IconComponent = Home;
          let label = 'Home';

          if (route.name === 'HomeTab') {
            IconComponent = Home;
            label = 'Home';
          } else if (route.name === 'ShopsTab') {
            IconComponent = Store;
            label = 'Shops';
          } else if (route.name === 'CartTab') {
            IconComponent = ShoppingBag;
            label = 'Cart';
          } else if (route.name === 'AccountTab') {
            IconComponent = UserIcon;
            label = 'Account';
          }

          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.7}
              onPress={onPress}
              style={styles.tabItem}
            >
              <View style={styles.iconWrapper}>
                <IconComponent
                  color={isFocused ? Theme.colors.primaryPurple : Theme.colors.textMuted}
                  size={20}
                />
                {route.name === 'CartTab' && cartCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{cartCount}</Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? Theme.colors.primaryPurple : Theme.colors.textMuted },
                  isFocused && { fontWeight: '800' }
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="ShopsTab" component={ShopsScreen} />
      <Tab.Screen name="AITab" component={AIChatScreen} />
      <Tab.Screen name="CartTab" component={CartScreen} />
      <Tab.Screen name="AccountTab" component={AccountScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="AIChat" component={AIChatScreen} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="ShopDetail" component={ShopDetailScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="Orders" component={OrdersScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    height: Platform.OS === 'ios' ? 84 : 68,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    ...Theme.shadows.md,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  iconWrapper: {
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  floatingAIBtnWrapper: {
    top: -22,
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
  },
  floatingAIBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    position: 'relative',
    ...Theme.shadows.aiFloating,
  },
  aiSparkleIcon: {
    position: 'absolute',
    top: 8,
    right: 10,
  },
  floatingAILabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A163F7',
    marginTop: 2,
  },
});
