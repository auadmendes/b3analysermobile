import { useUser } from '@clerk/clerk-expo'; // Importar o user do Clerk
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, DollarSign, Sparkles, TrendingUp } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react'; // Adicionado useEffect
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';

dayjs.locale('pt-br');

export default function DividendsScreen() {
  const router = useRouter();
  const { user } = useUser(); // Pegar o usuário logado
  
  const [dividends, setDividends] = useState<any[]>([]); // Estado para os dados reais
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Busca os dados da sua nova rota Python
  const fetchDividends = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      // Chamada para a sua API Python
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/dividends/${user.id}`);
      const json = await response.json();
      
      if (json.success) {
        setDividends(json.dividends);
      }
    } catch (error) {
      console.error("Erro ao carregar dividendos:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Dispara a busca quando a tela monta ou o usuário muda
  useEffect(() => {
    fetchDividends();
  }, [user?.id]);

  // Gera os meses para o seletor
  const months = useMemo(() => {
    const list = [];
    for (let i = -2; i <= 3; i++) {
      list.push(dayjs().add(i, 'month'));
    }
    return list;
  }, []);

  // Filtra os dividendos vindos do Python pelo mês selecionado na UI
  const filteredDividends = useMemo(() => {
    return dividends.filter(d => dayjs(d.date).format('YYYY-MM') === selectedMonth);
  }, [selectedMonth, dividends]);

  const totalMonth = useMemo(() => {
    return filteredDividends.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredDividends]);

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="pt-14 pb-4 px-6 border-b border-slate-50 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-50 rounded-xl">
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="ml-4 text-xl font-black text-slate-900">Agenda de Proventos</Text>
      </View>

      {/* Seletor de Meses */}
      <View className="py-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6">
          {months.map((month) => {
            const isSelected = month.format('YYYY-MM') === selectedMonth;
            return (
              <TouchableOpacity
                key={month.format('YYYY-MM')}
                onPress={() => setSelectedMonth(month.format('YYYY-MM'))}
                className={`mr-3 px-6 py-3 rounded-full border ${
                  isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-50 border-slate-100'
                }`}
              >
                <Text className={`font-bold capitalize ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                  {month.format('MMM YYYY')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView 
        className="flex-1 px-6" 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchDividends} tintColor="#4f46e5" />
        }
      >
        
        {/* Card de Resumo */}
        <View className="bg-emerald-500 p-8 rounded-[40px] mb-8 shadow-lg shadow-emerald-100">
          <View className="flex-row items-center mb-2">
            <TrendingUp size={16} color="rgba(255,255,255,0.7)" />
            <Text className="text-white/70 text-[10px] font-black uppercase ml-2 tracking-widest">Expectativa de Recebimento</Text>
          </View>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-4xl font-black">
              R$ {totalMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
          )}
        </View>

        {/* IA INSIGHT */}
        {!loading && totalMonth > 0 && (
          <View className="bg-indigo-50 p-6 rounded-[32px] mb-8 border border-indigo-100 flex-row items-start">
            <View className="bg-indigo-600 p-2 rounded-xl mr-4">
              <Sparkles size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-indigo-900 font-black text-sm mb-1">Dica de Reinvestimento IA</Text>
              <Text className="text-indigo-600/80 text-xs leading-5">
                Com o valor de {dayjs(selectedMonth).format('MMMM')}, você pode potencializar seu patrimônio comprando novos ativos e acelerando o efeito bola de neve.
              </Text>
            </View>
          </View>
        )}

        <Text className="text-slate-900 font-black text-lg mb-6">Linha do Tempo</Text>

        {loading ? (
          <ActivityIndicator color="#4f46e5" size="large" className="mt-10" />
        ) : filteredDividends.length === 0 ? (
          <View className="items-center py-10 border-2 border-dashed border-slate-100 rounded-[32px]">
            <Text className="text-slate-400 font-bold text-center px-10">
              Nenhum provento identificado para este mês.
            </Text>
          </View>
        ) : (
          filteredDividends.sort((a,b) => dayjs(a.date).diff(dayjs(b.date))).map((item, index) => (
            <View key={index} className="flex-row mb-6">
              <View className="items-center mr-4 w-12">
                <Text className="text-slate-900 font-black text-xl">{dayjs(item.date).format('DD')}</Text>
                <Text className="text-slate-400 text-[10px] font-bold uppercase">{dayjs(item.date).format('ddd')}</Text>
              </View>

              <View className="flex-1 bg-white border border-slate-100 p-5 rounded-[28px] shadow-sm flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className={`p-3 rounded-2xl mr-4 ${item.type === 'FII' ? 'bg-amber-50' : 'bg-blue-50'}`}>
                    <DollarSign size={18} color={item.type === 'FII' ? '#d97706' : '#2563eb'} />
                  </View>
                  <View>
                    <Text className="font-black text-slate-900 text-lg">{item.ticker}</Text>
                    <Text className={`text-[10px] font-black uppercase ${
  item.status === 'pago' ? 'text-emerald-500' : 
  item.status === 'confirmado' ? 'text-blue-500' : 
  'text-slate-400 italic' // Cinza e itálico para 'estimado'
}`}>
  {item.status}
</Text>
                  </View>
                </View>
                <Text className="text-slate-900 font-black text-base">R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}