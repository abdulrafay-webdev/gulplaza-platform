import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  Settings,
  Store
} from 'lucide-react-native';

import SellerDashboardScreen from '../screens/SellerDashboardScreen';
import SellerProductsScreen from '../screens/SellerProductsScreen';
import AddProductScreen from '../screens/AddProductScreen';
import EditProductScreen from '../screens/EditProductScreen';
import SellerOrdersScreen from '../screens/SellerOrdersScreen';
import ShopSettingsScreen from '../screens/ShopSettingsScreen';
import PendingApprovalScreen from '../screens/PendingApprovalScreen';
import SellerLoginScreen from '../screens/SellerLoginScreen';

import { Theme } from '../../../../mobile-shared/src/theme';
import { useSellerAuth } from '../context/SellerAuthContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function SellerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          height: Platform.OS === 'ios' ? 84 : 68,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Theme.colors.primaryPurple,
        tabBarInactiveTintColor: Theme.colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={SellerDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={20} />,
        }}
      />
      <Tab.Screen
        name="ProductsTab"
        component={SellerProductsScreen}
        options={{
          tabBarLabel: 'Products',
          tabBarIcon: ({ color }) => <Package color={color} size={20} />,
        }}
      />
      <Tab.Screen
        name="AddProductTab"
        component={AddProductScreen}
        options={{
          tabBarLabel: 'Add Item',
          tabBarIcon: ({ color }) => <PlusCircle color={color} size={22} />,
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={SellerOrdersScreen}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color }) => <ShoppingBag color={color} size={20} />,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={ShopSettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => <Settings color={color} size={20} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function SellerAppNavigator() {
  const { token, shop, isLoading } = useSellerAuth();

  if (isLoading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <Stack.Screen name="SellerLogin" component={SellerLoginScreen} />
        ) : shop && !shop.is_approved ? (
          <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
        ) : (
          <>
            <Stack.Screen name="SellerTabs" component={SellerTabNavigator} />
            <Stack.Screen name="AddProduct" component={AddProductScreen} />
            <Stack.Screen name="EditProduct" component={EditProductScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
