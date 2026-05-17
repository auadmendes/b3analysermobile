import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react"; // Adicionado useState
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

// Importe o seu componente personalizado
import { CustomSplashScreen } from '@/components/SplashScreen';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

import "../global.css";

// Configuração Visual do Toast
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
  
  // Estado para garantir que a Splash H3B3 apareça por um tempo mínimo
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Força a exibição da Splash por 2 segundos para dar branding
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Só executa o redirecionamento quando o Clerk carregar E o tempo mínimo passar
    if (!isLoaded || !isReady) return;

    const inAuthGroup = segments[0] === "login";

    if (isSignedIn && inAuthGroup) {
      router.replace("/(tabs)");
    } else if (!isSignedIn && !inAuthGroup) {
      router.replace("/login");
    }
  }, [isLoaded, isSignedIn, segments, isReady]);

  // Enquanto o Clerk ou o timer não estiverem prontos, mostra H3B3
  if (!isLoaded || !isReady) {
    return <CustomSplashScreen />;
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
  if (!publishableKey) {
    return null; // Ou uma mensagem de erro avisando que falta a chave do Clerk
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <InitialLayout />
          <Toast config={toastConfig} topOffset={60} /> 
        </GestureHandlerRootView>
      </ClerkLoaded>
    </ClerkProvider>
  );
}