import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { registerRootComponent } from 'expo';
import { AdminAuthProvider } from './src/context/AdminAuthContext';
import AdminAppNavigator from './src/navigation/AdminAppNavigator';

function App() {
  return (
    <SafeAreaProvider>
      <AdminAuthProvider>
        <StatusBar style="dark" />
        <AdminAppNavigator />
      </AdminAuthProvider>
    </SafeAreaProvider>
  );
}

registerRootComponent(App);
