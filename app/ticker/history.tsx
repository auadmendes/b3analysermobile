import { useUser } from '@clerk/clerk-expo';
import dayjs from 'dayjs';
import { Stack, useRouter } from 'expo-router';
import { Calendar, ChevronLeft, FileText } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function AnalysisHistoryScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/analysis/history/${user?.id}`);
      const json = await response.json();
      if (json.success) setHistory(json.history);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  return (
    <View className="flex-1 bg-slate-50">
      <Stack.Screen options={{ 
        headerTitle: "Histórico de Insights",
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
        )
      }} />

      {/* Header Customizado com Espaçamento */}
      <View className="flex-row items-center px-6 py-4 mt-10 bg-white border-b border-slate-100">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="p-2 bg-slate-50 rounded-xl"
        >
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-black text-slate-900">Lista de Insights</Text>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#4f46e5" className="mt-10" />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
          {history.length === 0 ? (
            <Text className="text-center text-slate-400 mt-10">Nenhuma análise salva ainda.</Text>
          ) : (
            history.map((item: any, index: number) => {
              // LÓGICA DE COR: Identifica o primeiro item
              const isFirst = index === 0;

              return (
                <TouchableOpacity 
                  key={item._id}
                  className={`p-5 rounded-[32px] mb-4 border shadow-sm ${
                    isFirst 
                      ? 'bg-emerald-50 border-emerald-100' 
                      : 'bg-white border-slate-100'
                  }`}
                  onPress={() => {
                      router.push({
                        pathname: "/ticker/details",
                        params: { 
                          ticker: item.ticker, 
                          insight: item.insight,
                          name: item.name,
                          priceAtTime: item.priceAtTime,
                          date: item.createdAt 
                        }
                      });
                    }}
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center">
                      <View className={`p-2 rounded-lg ${isFirst ? 'bg-emerald-500' : 'bg-indigo-50'}`}>
                        <FileText size={18} color={isFirst ? '#fff' : '#4f46e5'} />
                      </View>
                      <Text className={`text-lg font-black ml-3 ${isFirst ? 'text-emerald-900' : 'text-slate-900'}`}>
                        {item.ticker}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Calendar size={12} color={isFirst ? '#10b981' : '#94a3b8'} />
                      <Text className={`text-[10px] ml-1 ${isFirst ? 'text-emerald-600' : 'text-slate-400'}`}>
                         {dayjs(item.createdAt).format('DD/MM/YY')}
                      </Text>
                    </View>
                  </View>
                  
                  <Text className={`text-xs mb-2 ${isFirst ? 'text-emerald-700/70' : 'text-slate-500'}`} numberOfLines={1}>
                    {item.name}
                  </Text>
                  
                  <View className={`flex-row border-t pt-2 ${isFirst ? 'border-emerald-100' : 'border-slate-50'}`}>
                    <Text className={`text-[10px] mr-3 ${isFirst ? 'text-emerald-600' : 'text-slate-400'}`}>
                      Preço: <Text className={`${isFirst ? 'text-emerald-900' : 'text-slate-900'} font-bold`}>R$ {item.priceAtTime}</Text>
                    </Text>
                    <Text className={`text-[10px] ${isFirst ? 'text-emerald-600' : 'text-slate-400'}`}>
                      P/VP: <Text className={`${isFirst ? 'text-emerald-900' : 'text-slate-900'} font-bold`}>{item.pvpAtTime}</Text>
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}