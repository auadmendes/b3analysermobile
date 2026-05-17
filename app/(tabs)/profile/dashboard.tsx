import { useUser } from '@clerk/clerk-expo'; // Puxa o seu userId para enviar na simulação
import { useRouter } from 'expo-router';
import { BellRing, ChevronLeft, FileText, PlusCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [simulating, setSimulating] = useState(false);
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  // Função que chama a nossa nova rota de simulação do Python
  const handleSimulatePush = async () => {
    if (!user?.id || !API_URL) return;
    setSimulating(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/simulate-push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ticker: 'VALE3' // Simula o push para VALE3
        })
      });
      const json = await response.json();
      
      if (json.success) {
        Alert.alert("Sucesso", "Simulação enviada! Olhe o terminal do seu Backend Python.");
      } else {
        Alert.alert("Erro", json.message || "Falha na simulação.");
      }
    } catch (e) {
      Alert.alert("Erro", "Não foi possível conectar ao servidor backend.");
    } finally {
      setSimulating(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <View className="pt-14 pb-4 px-6 border-b border-slate-100 flex-row items-center bg-white shadow-xs">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-50 rounded-full mr-4">
          <ChevronLeft size={20} color="#0f172a" />
        </TouchableOpacity>
        <View>
          <Text className="text-xl font-black text-slate-900">Hub Admin</Text>
          <Text className="text-[11px] text-indigo-600 font-bold uppercase tracking-widest">Painel de Controle</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-6">
        <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Selecione uma Ferramenta</Text>

        {/* TILES EXISTENTES */}
        <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
          <TouchableOpacity 
            onPress={() => router.push("./reports" as any)}
            className="w-[48%] bg-white p-5 rounded-3xl border border-slate-100 shadow-xs justify-between"
            style={{ height: 150 }}
          >
            <View className="p-3 bg-red-50 rounded-2xl align-self-start">
              <FileText size={22} color="#ef4444" />
            </View>
            <View>
              <Text className="text-sm font-black text-slate-800">Relatórios Gerados</Text>
              <Text className="text-[11px] text-slate-400 font-medium mt-1">Excluir e limpar banco</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push("./tickers" as any)}
            className="w-[48%] bg-white p-5 rounded-3xl border border-slate-100 shadow-xs justify-between"
            style={{ height: 150 }}
          >
            <View className="p-3 bg-indigo-50 rounded-2xl align-self-start">
              <PlusCircle size={22} color="#4f46e5" />
            </View>
            <View>
              <Text className="text-sm font-black text-slate-800">Lista de Tickers</Text>
              <Text className="text-[11px] text-slate-400 font-medium mt-1">Adicionar alvos do robô</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 🚨 NOVO: Botão de Simulação de Alerta de IA */}
        <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Laboratório de Testes</Text>
        <TouchableOpacity
          onPress={handleSimulatePush}
          disabled={simulating}
          className="bg-indigo-600 p-4 rounded-2xl flex-row justify-center items-center shadow-xs"
        >
          {simulating ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <BellRing size={18} color="#ffffff" />
              <Text className="text-white font-black ml-2 text-sm">Disparar Alerta IA Simulado</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}