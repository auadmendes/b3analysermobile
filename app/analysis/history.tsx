import { useUser } from '@clerk/clerk-expo';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, History } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function AnalysisHistoryScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchHistory();
  }, [user?.id]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/reports/history?userId=${user?.id}`);
      const json = await response.json();
      setHistory(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View className="pt-14 pb-4 px-6 border-b border-slate-50 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-50 rounded-xl">
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-slate-900">Histórico</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color="#4f46e5" size="large" className="mt-10" />
        ) : (
          history.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              onPress={() => router.push({ pathname: "/analysis", params: { content: item.content } })} 
              className="bg-white border border-slate-100 p-5 rounded-3xl mb-4 flex-row items-center shadow-sm"
            >
              <View className="bg-slate-50 p-3 rounded-2xl mr-4">
                <History size={20} color="#64748b" />
              </View>
              <View className="flex-1">
                <Text className="font-black text-slate-900">Análise {new Date(item.createdAt).toLocaleDateString('pt-BR')}</Text>
                <Text className="text-slate-400 text-xs font-bold uppercase">{item.summary}</Text>
              </View>
              <ChevronRight size={16} color="#cbd5e1" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}