import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AdminAuthProvider } from './src/context/AdminAuthContext';
import AdminAppNavigator from './src/navigation/AdminAppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AdminAuthProvider>
        <StatusBar style="dark" />
        <AdminAppNavigator />
      </AdminAuthProvider>
    </SafeAreaProvider>
  );
}
