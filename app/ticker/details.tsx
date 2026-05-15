import AISummary from '@/components/aISummary';
import dayjs from 'dayjs';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { BarChart3, Calendar, ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function TickerHistoryDetails() {
  const { ticker, insight, name, priceAtTime, date } = useLocalSearchParams();
  const router = useRouter();

  return (
    // SafeAreaView garante que não fique embaixo da hora/bateria no iOS
    <SafeAreaView className="flex-1 mt-10 bg-slate-50">
      <Stack.Screen options={{ 
        headerShown: false // Vamos usar um header customizado para ter mais controle
      }} />

      {/* Header Customizado com Espaçamento */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-slate-100">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="p-2 bg-slate-50 rounded-xl"
        >
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-black text-slate-900">Histórico de Insight</Text>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ 
            paddingHorizontal: 24, 
            paddingTop: 20, // Espaçamento extra no topo
            paddingBottom: 40 
        }}
      >
        {/* Card do Ativo Refinado */}
        <View className="mb-8 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
           <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-3xl font-black text-slate-900 leading-tight">{ticker}</Text>
                <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-tighter" numberOfLines={2}>
                    {name}
                </Text>
              </View>
              <View className="bg-indigo-50 px-3 py-2 rounded-2xl flex-row items-center">
                 <Calendar size={12} color="#4f46e5" />
                 <Text className="text-indigo-600 font-bold text-[10px] ml-1 uppercase">
                    {dayjs(date as string).format('DD/MM/YY')}
                 </Text>
              </View>
           </View>

           <View className="flex-row items-center border-t border-slate-50 pt-4">
              <BarChart3 size={14} color="#94a3b8" />
              <Text className="text-slate-400 text-xs ml-2 font-medium">Preço na época: </Text>
              <Text className="text-slate-950 font-black text-xs">R$ {priceAtTime}</Text>
           </View>
        </View>

        {/* Componente de Análise */}
        <AISummary 
          ticker={ticker as string}
          onGenerate={() => {}} 
          result={insight as string}
          loading={false}
        />

        <View className="mt-2 px-4 opacity-50">
            <Text className="text-slate-400 text-[10px] text-center leading-4 font-bold uppercase tracking-widest">
                Arquivo Histórico • B3 AI Analyser
            </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}