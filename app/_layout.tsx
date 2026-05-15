import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message'; // 1. Imports do Toast

import "../global.css";

// 2. Configuração Visual Premium para o Toast
const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#4f46e5', backgroundColor: '#ffffff', borderRadius: 24, height: 70, width: '90%' }}
      contentContainerStyle={{ paddingHorizontal: 20 }}
      text1Style={{ fontSize: 16, fontWeight: '900', color: '#0f172a' }}
      text2Style={{ fontSize: 13, fontWeight: '500', color: '#64748b' }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#ef4444', backgroundColor: '#ffffff', borderRadius: 24, height: 70, width: '90%' }}
      text1Style={{ fontSize: 16, fontWeight: '900', color: '#0f172a' }}
      text2Style={{ fontSize: 13, fontWeight: '500', color: '#64748b' }}
    />
  )
};

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    const inAuthGroup = segments[0] === "login";

    if (isSignedIn && inAuthGroup) {
      router.replace("/(tabs)");
    } else if (!isSignedIn && !inAuthGroup) {
      router.replace("/login");
    }
  }, [isLoaded, isSignedIn, segments]);

  if (!isLoaded) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="ticker/[id]" options={{ presentation: 'card' }} />
    </Stack>
  );
}

export default function RootLayout() {
  if (!publishableKey) return null;

return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        {/* 2. Envolva o layout principal com o GestureHandlerRootView */}
        <GestureHandlerRootView style={{ flex: 1 }}>
          
          <InitialLayout />
          
          {/* O Toast pode ficar dentro ou fora, mas o layout do app PRECISA estar dentro */}
          <Toast config={toastConfig} topOffset={60} /> 
          
        </GestureHandlerRootView>
      </ClerkLoaded>
    </ClerkProvider>
  );
}