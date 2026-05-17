import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface InsightButtonProps {
  ticker: string;
  analysisText?: string | null; // 🌟 Nova propriedade para receber a análise completa
}

export function InsightButton({ ticker, analysisText }: InsightButtonProps) {
  const router = useRouter();
  const tickerUpper = String(ticker).toUpperCase().trim();

  const handlePress = () => {
    if (!ticker) return;
    router.push({
      pathname: "/ticker/summary",
      params: { ticker: tickerUpper }
    });
  };

  // const handleShare = async () => {
  //   try {
  //     if (!analysisText) {
  //       Alert.alert("Aviso", "A análise ainda não foi carregada para compartilhamento.");
  //       return;
  //     }

  //     // Monta a estrutura da mensagem com quebras de linha e negritos para o WhatsApp
  //     const mensagemWhatsApp = 
  //       `📊 *H3B3 - Insights de Fundamentos: ${tickerUpper}*\n\n` +
  //       `${analysisText}\n\n` +
  //       `📌 _Gerado via Inteligência Financeira H3B3. Baixe o app para monitorar seus ativos._`;

  //     await Share.share({
  //       message: mensagemWhatsApp,
  //       // No iOS, o title ajuda a definir o cabeçalho da folha de compartilhamento
  //       title: `Análise Avançada ${tickerUpper}`, 
  //     });
  //   } catch (error: any) {
  //     Alert.alert("Erro", "Não foi possível abrir o compartilhamento.");
  //   }
  // };

  return (
    <TouchableOpacity 
      activeOpacity={0.85}
      onPress={handlePress}
      className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-5 rounded-[24px] flex-row items-center justify-between shadow-md shadow-indigo-200/50 my-3 mx-1"
      style={{ backgroundColor: '#4f46e5' }}
    >
      <View className="flex-row items-center flex-1 pr-2">
        <View className="bg-white/20 p-2.5 rounded-xl mr-4">
          <Sparkles size={18} color="white" />
        </View>
        <View className="flex-1">
          <Text className="text-white font-black text-base">
            Insights de Fundamentos
          </Text>
          <Text className="text-indigo-100/80 text-xs font-medium mt-0.5">
            Veja o resumo do último relatório de {tickerUpper} por IA
          </Text>
        </View>
      </View>
      
      {/* <View className="flex-row items-center gap-x-2">
        <TouchableOpacity 
          onPress={handleShare}
          activeOpacity={0.7}
          className="p-2 bg-white/10 rounded-xl mr-1"
        >
          <Share2 size={18} color="white" />
        </TouchableOpacity>
        <ChevronRight size={18} color="white" className="opacity-80" />
      </View> */}
    </TouchableOpacity>
  );
}