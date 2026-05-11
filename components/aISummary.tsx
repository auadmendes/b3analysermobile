import { BrainCircuit, Sparkles } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Markdown from 'react-native-markdown-display';

interface Props {
  ticker: string;
  onGenerate: () => Promise<string | null>;
}

export default function AISummary({ ticker, onGenerate }: Props) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const handlePress = async () => {
    setLoading(true);
    const result = await onGenerate();
    setSummary(result);
    setLoading(false);
  };


  return (
    <View className="mb-8">
      {summary ? (
        // Visual de quando a análise JÁ FOI gerada
        <View className="bg-white border border-indigo-100 p-6 rounded-[32px] shadow-sm">
          <View className="flex-row items-center mb-4">
            <View className="bg-indigo-600 p-2 rounded-xl">
              <BrainCircuit size={18} color="white" />
            </View>
            <Text className="text-indigo-600 font-black ml-3 uppercase text-[10px] tracking-[2px]">
              Sintese da Inteligência
            </Text>
          </View>
          
          <Markdown style={markdownStyles}>
            {summary}
          </Markdown>
          
          <View className="mt-4 pt-4 border-t border-slate-50">
            <Text className="text-slate-400 text-[9px] font-bold uppercase text-center">
              Análise baseada em dados atuais de mercado
            </Text>
          </View>
        </View>
      ) : (
        // Visual do BOTÃO PREMIUM (O que você achou bonito)
        <TouchableOpacity 
          onPress={handlePress}
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
  body: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 22,
  },
  strong: {
    fontWeight: 'bold', // 'bold' é um valor literal aceito
    color: '#1e1b4b',
  },
  heading3: {
    fontSize: 18,
    fontWeight: '800', // Certifique-se de que está entre aspas e é um valor válido (ex: '700', '800')
    marginTop: 10,
    marginBottom: 5,
    color: '#4f46e5',
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 10,
  },
  bullet_list: {
    marginBottom: 10,
  },
  list_item: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
});