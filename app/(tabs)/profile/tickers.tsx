import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AdminTickersScreen() {
  const router = useRouter();
  const [tickerInput, setTickerInput] = useState('');
  const [monitoredList, setMonitoredList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  // Carrega os tickers monitorados gravados no banco
  const fetchTickers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/tickers`);
      const json = await response.json();
      if (json.success) setMonitoredList(json.tickers);
    } catch (e) {
      console.error("Erro ao carregar lista de monitoramento", e);
    } finally {
      setLoading(false);
    }
  };

  // Adiciona um novo ativo na lista do banco
  const handleAddTicker = async () => {
    const formatted = tickerInput.trim().toUpperCase();
    if (!formatted) return;

    if (monitoredList.includes(formatted)) {
      Alert.alert("Aviso", "Este ativo já está na lista de monitoramento.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/admin/tickers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: formatted })
      });
      const json = await response.json();
      if (json.success) {
        setMonitoredList(prev => [...prev, formatted]);
        setTickerInput('');
      }
    } catch (e) {
      Alert.alert("Erro", "Falha ao salvar ativo.");
    }
  };

  // Remove um ativo do monitoramento
  const handleRemoveTicker = async (ticker: string) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/tickers/${ticker}`, {
        method: 'DELETE'
      });
      const json = await response.json();
      if (json.success) {
        setMonitoredList(prev => prev.filter(item => item !== ticker));
      }
    } catch (e) {
      Alert.alert("Erro", "Não foi possível remover o ativo.");
    }
  };

  useEffect(() => { fetchTickers(); }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <View className="pt-14 pb-4 px-6 border-b border-slate-100 flex-row items-center bg-white shadow-xs">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-50 rounded-full mr-4">
          <ChevronLeft size={20} color="#0f172a" />
        </TouchableOpacity>
        <View>
          <Text className="text-xl font-black text-slate-900">Lista do Robô</Text>
          <Text className="text-[11px] text-indigo-600 font-bold uppercase tracking-widest">Fila do cvm_monitor</Text>
        </View>
      </View>

      <View className="p-6 flex-1">
        {/* Input de Busca/Adição */}
        <Text className="text-sm font-black text-slate-700 mb-2">Adicionar Novo Ativo</Text>
        <View className="flex-row gap-x-2 mb-6">
          <TextInput
            value={tickerInput}
            onChangeText={setTickerInput}
            placeholder="Ex: WEGE3, CPTS11..."
            autoCapitalize="characters"
            className="flex-1 bg-white border border-slate-200 p-4 rounded-2xl font-bold text-slate-800"
          />
          <TouchableOpacity 
            onPress={handleAddTicker}
            className="bg-indigo-600 p-4 rounded-2xl justify-center items-center px-5"
          >
            <Plus size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Ativos Monitorados Atualmente</Text>

        {loading ? (
          <ActivityIndicator color="#4f46e5" className="mt-6" />
        ) : (
          <FlatList
            data={monitoredList}
            keyExtractor={(item) => item}
            numColumns={3}
            columnWrapperStyle={{ gap: 8 }}
            contentContainerStyle={{ gap: 8 }}
            ListEmptyComponent={
              <Text className="text-center text-slate-400 mt-6 font-medium">Nenhum ativo configurado para varredura.</Text>
            }
            renderItem={({ item }) => (
              <View className="bg-white border border-slate-100 p-3 rounded-2xl flex-row items-center justify-between flex-1 max-w-[31%] shadow-2xs">
                <Text className="font-black text-slate-800 text-sm">{item}</Text>
                <TouchableOpacity onPress={() => handleRemoveTicker(item)} className="p-1 bg-slate-50 rounded-full">
                  <X size={12} color="#64748b" />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}