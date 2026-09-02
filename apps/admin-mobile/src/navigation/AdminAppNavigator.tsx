import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingBag,
  Layers
} from 'lucide-react-native';

import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminShopsScreen from '../screens/AdminShopsScreen';
import AdminProductsScreen from '../screens/AdminProductsScreen';
import AdminOrdersScreen from '../screens/AdminOrdersScreen';
import AdminCategoriesScreen from '../screens/AdminCategoriesScreen';
import AdminReviewsScreen from '../screens/AdminReviewsScreen';
import AdminUsersScreen from '../screens/AdminUsersScreen';
import AdminLoginScreen from '../screens/AdminLoginScreen';

import { Theme } from '../shared/theme';
import { useAdminAuth } from '../context/AdminAuthContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AdminTabNavigator() {
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
        component={AdminDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={20} />,
        }}
      />
      <Tab.Screen
        name="ShopsTab"
        component={AdminShopsScreen}
        options={{
          tabBarLabel: 'Shops',
          tabBarIcon: ({ color }) => <Store color={color} size={20} />,
        }}
      />
      <Tab.Screen
        name="ProductsTab"
        component={AdminProductsScreen}
        options={{
          tabBarLabel: 'Products',
          tabBarIcon: ({ color }) => <Package color={color} size={20} />,
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={AdminOrdersScreen}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color }) => <ShoppingBag color={color} size={20} />,
        }}
      />
      <Tab.Screen
        name="CategoriesTab"
        component={AdminCategoriesScreen}
        options={{
          tabBarLabel: 'Categories',
          tabBarIcon: ({ color }) => <Layers color={color} size={20} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AdminAppNavigator() {
  const { token, isLoading } = useAdminAuth();

  if (isLoading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
        ) : (
          <>
            <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
            <Stack.Screen name="AdminReviews" component={AdminReviewsScreen} />
            <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
