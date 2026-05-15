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
      // Ajuste para bater com sua rota do backend
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/reports/history?userId=${user?.id}`);
      const json = await response.json();
      
      // Se o seu backend retorna { history: [...] }, use json.history
      // Se retorna a lista direto, mantenha setHistory(json)
      setHistory(Array.isArray(json) ? json : json.history || []);
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

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingHorizontal: 24, 
          paddingTop: 24, 
          paddingBottom: 100 // Espaço extra no final para não grudar
        }}
      >
        {loading ? (
          <ActivityIndicator color="#4f46e5" size="large" className="mt-10" />
        ) : (
          history.map((item, index) => {
            // LÓGICA DO PRIMEIRO ITEM
            const isFirst = index === 0;

            return (
              <TouchableOpacity 
                key={item._id || item.id || index} 
                onPress={() => router.push({ pathname: "/analysis", params: { content: item.content } })} 
                className={`p-5 rounded-[32px] mb-4 flex-row items-center shadow-sm border ${
                  isFirst 
                    ? 'bg-emerald-50 border-emerald-100' // Verde Aesthetic para o mais recente
                    : 'bg-white border-slate-100'
                }`}
              >
                {/* Ícone Lateral */}
                <View className={`p-3 rounded-2xl mr-4 ${isFirst ? 'bg-emerald-500' : 'bg-slate-50'}`}>
                  <History size={20} color={isFirst ? '#fff' : '#64748b'} />
                </View>

                {/* Textos */}
                <View className="flex-1">
                  <Text className={`font-black ${isFirst ? 'text-emerald-900' : 'text-slate-900'}`}>
                    {item.title || `Análise ${new Date(item.createdAt).toLocaleDateString('pt-BR')}`}
                  </Text>
                  <Text 
                    numberOfLines={1} 
                    className={`${isFirst ? 'text-emerald-600' : 'text-slate-400'} text-xs font-bold uppercase mt-1`}
                  >
                    {item.summary || "Ver detalhes da análise"}
                  </Text>
                </View>

                {/* Seta indicativa */}
                <ChevronRight size={16} color={isFirst ? '#10b981' : '#cbd5e1'} />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}