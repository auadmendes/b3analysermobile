import { useUser } from '@clerk/clerk-expo';
import { Stack, useRouter } from 'expo-router';
import { BrainCircuit, ChevronLeft, ChevronRight, History, Sparkles } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';

export default function AnalysisScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [tab, setTab] = useState<'new' | 'history'>('new');

  // 1. Buscar Histórico do Banco (MongoDB)
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/analysis/history?userId=${user?.id}`);
      const json = await response.json();
      setHistory(json);
    } catch (e) { console.error(e); }
  };

  // 2. Gerar Nova Análise com a IA
  const generateAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/analysis/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });
      const json = await response.json();
      setResult(json.analysis);
      fetchHistory(); // Atualiza a lista após gerar
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
        <Text className="text-xl font-black text-slate-900">Análise de Carteira</Text>
        <View className="w-10" />
      </View>

      {/* Selector de Abas */}
      <View className="flex-row p-2 bg-slate-50 mx-6 mt-6 rounded-2xl">
        <TouchableOpacity 
          onPress={() => setTab('new')}
          className={`flex-1 py-3 rounded-xl items-center ${tab === 'new' ? 'bg-white shadow-sm' : ''}`}
        >
          <Text className={`font-bold ${tab === 'new' ? 'text-indigo-600' : 'text-slate-400'}`}>Nova</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setTab('history')}
          className={`flex-1 py-3 rounded-xl items-center ${tab === 'history' ? 'bg-white shadow-sm' : ''}`}
        >
          <Text className={`font-bold ${tab === 'history' ? 'text-indigo-600' : 'text-slate-400'}`}>Histórico</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        {tab === 'new' ? (
          <View>
            {!result ? (
              <View className="items-center py-10">
                <View className="bg-indigo-50 p-8 rounded-full mb-6">
                  <BrainCircuit size={48} color="#4f46e5" />
                </View>
                <Text className="text-center text-slate-900 font-black text-2xl px-10">
                  Sua IA está pronta para analisar sua carteira
                </Text>
                <Text className="text-center text-slate-400 mt-3 px-10 font-medium">
                  Vamos avaliar diversificação, riscos e oportunidades com base nos seus ativos atuais.
                </Text>
                
                <TouchableOpacity 
                  onPress={generateAnalysis}
                  disabled={loading}
                  className="bg-indigo-600 w-full mt-10 p-5 rounded-[32px] flex-row justify-center items-center"
                >
                  {loading ? <ActivityIndicator color="white" /> : (
                    <>
                      <Sparkles size={20} color="white" className="mr-2" />
                      <Text className="text-white font-black text-lg ml-2">Iniciar Análise agora</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View className="bg-slate-50 p-6 rounded-[32px] border border-indigo-100">
                <Markdown>{result}</Markdown>
              </View>
            )}
          </View>
        ) : (
          <View>
            {history.map((item, i) => (
              <TouchableOpacity 
                key={i}
                onPress={() => setResult(item.content)} // Ao clicar, mostra o conteúdo na aba 'Nova'
                className="bg-white border border-slate-100 p-5 rounded-3xl mb-4 flex-row items-center"
              >
                <View className="bg-slate-100 p-3 rounded-2xl mr-4">
                  <History size={20} color="#64748b" />
                </View>
                <View className="flex-1">
                  <Text className="font-black text-slate-900">Análise de {new Date(item.createdAt).toLocaleDateString()}</Text>
                  <Text className="text-slate-400 text-xs font-bold uppercase">{item.summary || 'Check-up Geral'}</Text>
                </View>
                <ChevronRight size={16} color="#cbd5e1" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}