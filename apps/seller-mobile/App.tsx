import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SellerAuthProvider } from './src/context/SellerAuthContext';
import SellerAppNavigator from './src/navigation/SellerAppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <SellerAuthProvider>
        <StatusBar style="dark" />
        <SellerAppNavigator />
      </SellerAuthProvider>
    </SafeAreaProvider>
  );
}
