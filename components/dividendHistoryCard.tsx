import { Landmark } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

interface DividendHistoryCardProps {
  ticker: string;
}

export function DividendHistoryCard({ ticker }: DividendHistoryCardProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/ticker/${ticker}/dividends`);
        const json = await response.json();
        if (json.success) setHistory(json.history.reverse()); // Recentes primeiro
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [ticker]);

  if (loading) return <ActivityIndicator color="#4f46e5" />;
  if (history.length === 0) return null;

  return (
    <View className="bg-white p-6 rounded-[32px] mb-4 border border-slate-100 shadow-sm">
      <View className="flex-row items-center mb-4">
        <View className="bg-emerald-100 p-2 rounded-xl">
          <Landmark size={18} color="#10b981" />
        </View>
        <Text className="text-slate-900 font-black text-[10px] uppercase ml-3 tracking-widest">
          Histórico de Proventos
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
        {history.map((item, index) => (
          <View key={index} className="mr-6 items-center">
            <Text className="text-slate-400 text-[9px] font-bold uppercase mb-1">{item.month}</Text>
            <View className="bg-slate-50 px-3 py-2 rounded-2xl border border-slate-100">
              <Text className="text-slate-900 font-black text-xs">
                R$ {item.value.toFixed(2)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <Text className="text-slate-400 text-[9px] mt-4 italic">
        * Valores brutos por cota (DY médio dos últimos 12 meses).
      </Text>
    </View>
  );
}