import { AiOptionsModal } from '@/components/aiOptionsModal';
import { useUser } from '@clerk/clerk-expo';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { BrainCircuit, ChevronLeft, History } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Markdown from 'react-native-markdown-display';

export default function AnalysisScreen() {
  const { user } = useUser();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);

  // Se vier um conteúdo via parâmetro (do histórico), exibe ele direto
  useEffect(() => {
    if (params.content) {
      setResult(params.content as string);
    }
  }, [params.content]);

const generateAnalysis = async (focus: string, message: string) => {    
  setModalVisible(false);
  setLoading(true);

  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/reports/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // 2. AGORA ENVIAMOS O FOCO E A MENSAGEM NO BODY
      body: JSON.stringify({ 
        userId: user?.id,
        focus: focus,      // Envia o foco selecionado (Ex: Dividendos)
        message: message   // Envia o que foi escrito no textarea
      })
    });
    
    const json = await response.json();
    setResult(json.analysis);
  } catch (e) { 
    console.error(e); 
  } finally {
    setLoading(false);
  }
};

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="pt-14 pb-4 px-6 border-b border-slate-50 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-50 rounded-xl">
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-slate-900">Análise IA</Text>
        <TouchableOpacity onPress={() => router.push("/analysis/history")} className="p-2 bg-indigo-50 rounded-xl">
          <History size={22} color="#4f46e5" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-6 pt-24" showsVerticalScrollIndicator={false}>
        {!result ? (
          <View className="items-center py-10">
            <View className="bg-indigo-50 p-8 rounded-full mb-6">
              <BrainCircuit size={48} color="#4f46e5" />
            </View>
            <Text className="text-center text-slate-900 font-black text-2xl px-10">Check-up Inteligente</Text>
            <TouchableOpacity 
              onPress={() => setModalVisible(true)}
              disabled={loading}
              className="bg-indigo-600 w-full mt-10 p-5 rounded-[32px] flex-row justify-center items-center shadow-lg shadow-indigo-200"
            >
              {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-black text-lg">Iniciar Análise</Text>}
            </TouchableOpacity>

            <AiOptionsModal 
              isVisible={modalVisible}
              onClose={() => setModalVisible(false)}
              onConfirm={generateAnalysis}
              title="Análise de Carteira"
              loading={loading}
            />

          </View>
        ) : (
          <View className="pb-10">
            <View className="bg-slate-50 p-6 rounded-[32px] border border-indigo-100">
              <Markdown style={markdownStyles}>{result}</Markdown>
            </View>
            <TouchableOpacity onPress={() => setResult(null)} className="mt-6">
              <Text className="text-center text-indigo-600 font-bold">Nova Consulta</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const markdownStyles = StyleSheet.create({
  body: { color: '#334155', fontSize: 16, lineHeight: 24 },
  heading3: { color: '#4f46e5', fontWeight: '800', marginTop: 15 },
});