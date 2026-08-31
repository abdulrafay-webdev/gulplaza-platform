import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { registerRootComponent } from 'expo';
import { ClerkAuthProvider } from './src/lib/ClerkAuthContext';
import { AdminAuthProvider } from './src/context/AdminAuthContext';
import AdminAppNavigator from './src/navigation/AdminAppNavigator';

function App() {
  return (
    <ClerkAuthProvider>
      <SafeAreaProvider>
        <AdminAuthProvider>
          <StatusBar style="dark" />
          <AdminAppNavigator />
        </AdminAuthProvider>
      </SafeAreaProvider>
    </ClerkAuthProvider>
  );
}

registerRootComponent(App);
