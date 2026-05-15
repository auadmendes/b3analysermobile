import * as Clipboard from 'expo-clipboard';
import { BrainCircuit, Copy, Share2, Sparkles } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import Toast from 'react-native-toast-message';

interface Props {
  ticker: string;
  onGenerate: () => void;
  result: string | null;
  loading: boolean;
}

export default function AISummary({ ticker, onGenerate, result, loading }: Props) {
  
  // Função para Copiar o texto limpo
  const copyToClipboard = async () => {
    if (!result) return;
    await Clipboard.setStringAsync(result);
    Toast.show({
      type: 'success',
      text1: 'Copiado!',
      text2: 'Análise copiada para a área de transferência.',
    });
  };

  // Função para Compartilhar
  const shareAnalysis = async () => {
    if (!result) return;
    try {
      await Share.share({
        message: `*Análise Premium: ${ticker}* 📊\n\n${result}\n\n_Gerado por B3 AI Analyser_`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View className="mb-8">
      {result ? (
        // --- VISUAL COM RESULTADO (Markdown + Ações) ---
        <View className="bg-white border border-indigo-100 p-6 rounded-[32px] shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="bg-indigo-600 p-2 rounded-xl">
                <BrainCircuit size={18} color="white" />
              </View>
              <Text className="text-indigo-600 font-black ml-3 uppercase text-[10px] tracking-[2px]">
                Síntese da Inteligência
              </Text>
            </View>
          </View>
          
          <Markdown style={markdownStyles}>
            {result}
          </Markdown>
          
          {/* BOTÕES DE AÇÃO NO RODAPÉ DO CARD */}
          <View className="flex-row justify-end mt-4 pt-4 border-t border-slate-50 space-x-3">
            <TouchableOpacity 
              onPress={copyToClipboard}
              className="flex-row items-center bg-slate-50 px-4 py-2 rounded-xl"
            >
              <Copy size={14} color="#64748b" />
              <Text className="text-slate-500 font-bold ml-2 text-[10px] uppercase">Copiar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={shareAnalysis}
              className="flex-row items-center bg-indigo-50 px-4 py-2 rounded-xl"
            >
              <Share2 size={14} color="#4f46e5" />
              <Text className="text-indigo-600 font-bold ml-2 text-[10px] uppercase">Compartilhar</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-4">
            <Text className="text-slate-400 text-[9px] font-bold uppercase text-center">
              Análise baseada em dados atuais de mercado
            </Text>
          </View>
        </View>
      ) : (
        // --- VISUAL DO BOTÃO DE GERAR ---
        <TouchableOpacity 
          onPress={onGenerate}
          disabled={loading}
          activeOpacity={0.7}
          className="bg-white border-2 border-indigo-50 p-5 rounded-[32px] flex-row items-center shadow-sm"
        >
          <View className="bg-indigo-100 p-4 rounded-2xl mr-4">
            {loading ? (
              <ActivityIndicator color="#4f46e5" size="small" />
            ) : (
              <Sparkles size={24} color="#4f46e5" />
            )}
          </View>
          
          <View className="flex-1">
            <Text className="text-slate-900 font-black text-lg tracking-tight">
              Gerar Insight Premium
            </Text>
            <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              Análise profunda sobre {ticker}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const markdownStyles = StyleSheet.create({
  body: { color: '#334155', fontSize: 14, lineHeight: 22 },
  strong: { fontWeight: 'bold', color: '#1e1b4b' },
  heading3: { fontSize: 18, fontWeight: '800', marginTop: 12, marginBottom: 8, color: '#4f4eea' },
  paragraph: { marginTop: 0, marginBottom: 10 },
  bullet_list: { marginBottom: 10 },
  list_item: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 4 },
});