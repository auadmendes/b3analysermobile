import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export function CustomSplashScreen() {
  return (
    <View className="flex-1 bg-slate-50 justify-center items-center">
      <Text className="text-5xl font-black text-indigo-600 tracking-tighter">H3B3</Text>
      <ActivityIndicator size="small" color="#4f46e5" className="mt-4" />
      <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-[4px] mt-4">
        Carregando sua liberdade
      </Text>
    </View>
  );
}