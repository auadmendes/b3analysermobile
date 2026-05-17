import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { AlertCircle, Calendar, ChevronLeft, Compass, ExternalLink, FileText, Share2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
// Importamos o Share nativo aqui
import { ActivityIndicator, Alert, Linking, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';

export default function TickerSummaryScreen() {
  const { ticker } = useLocalSearchParams();
  const router = useRouter();
  const tickerUpper = String(ticker).toUpperCase().trim();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const fetchSummary = async () => {
    try {
      const response = await fetch(`${API_URL}/api/ticker/${ticker}/summary`);
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error("Erro ao buscar resumo:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticker) fetchSummary();
  }, [ticker]);

  // 🌟 Função de Compartilhamento Nativa
  const handleShare = async () => {
    try {
      if (!data) return;

      // Remove caracteres especiais de markdown que possam poluir o texto puro no WhatsApp
      const limparMarkdown = (texto: string) => {
        if (!texto) return '';
        return texto
          .replace(/###\s+/g, '') // Remove títulos ###
          .replace(/-\s+/g, '• ') // Padroniza marcadores de lista
          .replace(/`+/g, '');    // Remove blocos de código
      };

      const visaoCritica = data.aiAnalysis 
        ? `📝 *VISÃO ESTRATÉGICA H3B3:*\n${limparMarkdown(data.aiAnalysis)}\n\n` 
        : '';
        
      const resumoEstruturado = data.summary 
        ? `📋 *RESUMO DOS FUNDAMENTOS:*\n${limparMarkdown(data.summary)}\n\n` 
        : '';

      const mensagemWhatsApp = 
        `📊 *Relatório de Fundamentos por IA: ${tickerUpper}* \n\n` +
        `📄 Documento: ${data.sourceDocument || 'Comunicado'}\n` +
        `📅 Data: ${data.lastUpdated ? new Date(data.lastUpdated).toLocaleDateString('pt-BR') : ''}\n\n` +
        `-----------------------------------------\n\n` +
        visaoCritica +
        resumoEstruturado +
        `📱 _Enviado via H3B3 Inteligência Financeira. Acompanhe assimetrias de mercado em tempo real._`;

      await Share.share({
        message: mensagemWhatsApp,
        title: `Relatório H3B3 - ${tickerUpper}`,
      });
    } catch (error: any) {
      Alert.alert("Erro", "Não foi possível abrir o compartilhamento.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header Fixo */}
      <View className="pt-14 pb-4 px-6 border-b border-slate-100 flex-row items-center justify-between bg-white shadow-xs">
        <View className="flex-row items-center flex-1 mr-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-50 rounded-full mr-4">
            <ChevronLeft size={20} color="#0f172a" />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-black text-slate-900">Insights do Analista</Text>
            <Text className="text-[11px] text-indigo-600 font-black uppercase tracking-widest">{tickerUpper}</Text>
          </View>
        </View>

        {/* 🌟 Botão de Compartilhar: Só renderiza se a busca deu certo e os dados existem */}
        {!loading && data && data.success !== false && (
          <TouchableOpacity 
            onPress={handleShare} 
            activeOpacity={0.7}
            className="p-2.5 bg-slate-50 rounded-full border border-slate-100"
          >
            <Share2 size={18} color="#4f46e5" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color="#4f46e5" className="mt-12" />
        ) : data?.success === false ? (
          /* Estado vazio caso o robô não tenha lido o PDF ainda */
          <View className="items-center justify-center mt-20 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <AlertCircle size={40} color="#64748b" className="opacity-60" />
            <Text className="text-slate-600 font-medium text-center mt-4 leading-5">
              {data.message}
            </Text>
          </View>
        ) : (
          /* Conteúdo do Relatório */
          <View style={{ paddingBottom: 40 }}>
            
            {/* Metadados do documento */}
            <View className="bg-white p-4 rounded-2xl mb-4 border border-slate-100 shadow-xs flex-row justify-between items-center gap-x-2">
              <View className="flex-row items-center flex-1 min-w-0">
                <FileText size={14} color="#64748b" />
                <Text 
                  className="text-slate-500 font-black text-xs ml-2 flex-1" 
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {data?.sourceDocument}
                </Text>
              </View>
              <View className="flex-row items-center shrink-0">
                <Calendar size={14} color="#94a3b8" />
                <Text className="text-slate-400 font-bold text-xs ml-1.5">
                  {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleDateString('pt-BR') : ''}
                </Text>
              </View>
            </View>

            {/* Bloco de Análise Crítica da IA (Visão Estratégica) */}
            {data?.aiAnalysis ? (
              <View className="bg-indigo-50/70 p-5 rounded-3xl border border-indigo-100/60 mb-4">
                <View className="flex-row items-center mb-2 gap-x-2">
                  <Compass size={18} color="#312e81" />
                  <Text className="text-indigo-950 font-black text-base">Visão Estratégica H3B3</Text>
                </View>
                <Markdown style={criticalMarkdownStyles}>{data?.aiAnalysis}</Markdown>
              </View>
            ) : null}

            {/* Bloco do Resumo Estruturado */}
            <View className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs mb-4">
              <Markdown style={markdownStyles}>{data?.summary}</Markdown>
            </View>

            {/* Botão para abrir Documento Original */}
            {data?.sourceUrl ? (
              <TouchableOpacity 
                onPress={() => {
                  if (typeof data.sourceUrl === 'string' && data.sourceUrl.trim() !== '') {
                    Linking.openURL(data.sourceUrl);
                  } else {
                    Alert.alert("Aviso", "O link original deste documento não está disponível.");
                  }
                }}
                className="bg-slate-950 p-4 rounded-2xl flex-row justify-center items-center mt-2 shadow-xs"
              >
                <ExternalLink size={16} color="#ffffff" />
                <Text className="text-white font-black text-center ml-2 text-sm">
                  Ler Documento Original
                </Text>
              </TouchableOpacity>
            ) : null}
            
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const markdownStyles = StyleSheet.create({
  body: { color: '#334155', fontSize: 14, lineHeight: 22 },
  strong: { fontWeight: '900', color: '#0f172a' },
  heading3: { fontSize: 15, fontWeight: '900', marginTop: 16, marginBottom: 8, color: '#4f46e5' },
  paragraph: { marginTop: 0, marginBottom: 10 },
  list_item: { marginBottom: 6, color: '#334155' },
  bullet_list: { marginBottom: 10 }
});

const criticalMarkdownStyles = StyleSheet.create({
  body: { color: '#1e1b4b', fontSize: 14, lineHeight: 22, fontWeight: '500' },
  strong: { fontWeight: '900', color: '#312e81' },
  heading3: { fontSize: 15, fontWeight: '900', marginTop: 12, marginBottom: 6, color: '#3730a3' },
  paragraph: { marginTop: 0, marginBottom: 6 },
});