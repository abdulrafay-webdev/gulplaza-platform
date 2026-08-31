import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { registerRootComponent } from 'expo';
import { ClerkAuthProvider } from './src/lib/ClerkAuthContext';
import { SellerAuthProvider } from './src/context/SellerAuthContext';
import SellerAppNavigator from './src/navigation/SellerAppNavigator';

function App() {
  return (
    <ClerkAuthProvider>
      <SafeAreaProvider>
        <SellerAuthProvider>
          <StatusBar style="dark" />
          <SellerAppNavigator />
        </SellerAuthProvider>
      </SafeAreaProvider>
    </ClerkAuthProvider>
  );
}

registerRootComponent(App);
