import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, ExternalLink, RefreshCw, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Linking, Text, TouchableOpacity, View } from 'react-native';

export default function AdminReportsScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const fetchReports = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/reports`);
      const json = await response.json();
      if (json.success) {
        setReports(json.reports);
      }
    } catch (error) {
      console.error("Erro ao buscar relatórios:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = (id: string, ticker: string) => {
    Alert.alert(
      "Excluir Relatório",
      `Tem certeza que deseja apagar o resumo de ${ticker}? A IA precisará ler o documento novamente na próxima varredura.`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/api/admin/reports/${id}`, {
                method: 'DELETE'
              });
              const json = await response.json();
              if (json.success) {
                // Remove o item da lista visual local imediatamente
                setReports(prev => prev.filter(item => item.id !== id));
              }
            } catch (error) {
              Alert.alert("Erro", "Não foi possível deletar o relatório.");
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header Admin */}
      <View className="pt-14 pb-4 px-6 border-b border-slate-100 flex-row items-center justify-between bg-white shadow-sm">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-50 rounded-full mr-3">
            <ChevronLeft size={20} color="#0f172a" />
          </TouchableOpacity>
          <View>
            <Text className="text-lg font-black text-slate-900">Painel de Controle</Text>
            <Text className="text-xs font-bold text-red-600 tracking-wider">GERENCIAR RELATÓRIOS</Text>
          </View>
        </View>
        
        <TouchableOpacity onPress={() => { setLoading(true); fetchReports(); }} className="p-2">
          <RefreshCw size={18} color="#4f46e5" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#4f46e5" className="mt-12" />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          onRefresh={() => fetchReports()}
          refreshing={refreshing}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text className="text-center text-slate-400 mt-10 font-medium">
              Nenhum relatório processado globalmente no banco.
            </Text>
          }
          renderItem={({ item }) => (
            <View className="bg-white p-4 rounded-2xl mb-3 border border-slate-100 shadow-xs flex-row justify-between items-center">
              <View className="flex-1 pr-4">
                <View className="flex-row items-center mb-1">
                  <Text className="text-base font-black text-slate-900 mr-2">{item.ticker}</Text>
                  <Text className="text-[10px] text-slate-400 font-medium">
                    {item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString('pt-BR') : ''}
                  </Text>
                </View>
                <Text className="text-slate-500 font-medium text-xs truncate" numberOfLines={1}>
                  {item.sourceDocument}
                </Text>
                
                {item.sourceUrl ? (
                  <TouchableOpacity 
                    onPress={() => Linking.openURL(item.sourceUrl)}
                    className="flex-row items-center mt-2"
                  >
                    <Text className="text-indigo-600 font-bold text-[11px] mr-1">Ver Link Original</Text>
                    <ExternalLink size={10} color="#4f46e5" />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Botão de Excluir */}
              <TouchableOpacity 
                onPress={() => handleDelete(item.id, item.ticker)}
                className="p-3 bg-red-50 rounded-xl"
              >
                <Trash2 size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}