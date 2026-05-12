import IndicatorCard from '@/components/indicatorCard';
import { AlertTriangle, Info, Search } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function AnalysisScreen() {
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL;

  if (!EXPO_PUBLIC_API_URL) {
    throw new Error("Faltando EXPO_PUBLIC_API_URL no arquivo .env");
  }

const fetchAnalysis = async () => {
    if (!ticker) return;
    setLoading(true);
    
    try {
      const response = await fetch(`${EXPO_PUBLIC_API_URL}/api/analyze?ticker=${ticker}`);
      
      // IMPORTANTE: O fetch não joga para o catch em erros 401, 429, 500, etc.
      if (!response.ok) {
        throw new Error('Falha na resposta do servidor');
      }

      const json = await response.json();

      // Verifica se a API retornou sucesso ou se caiu no Rate Limit (sucesso=false)
      if (json.success) {
        setData(json.data);
      } else {
        // Aqui é onde sua API avisa que deu erro, mas respondeu 200 OK (Cache)
        setData(json.data); // Seta os dados antigos/cache
        Toast.show({
          type: 'info', // 'info' é o que criamos com o botão OK
          text1: 'Dados de Cache',
          text2: 'Limite atingido. Exibindo dados desatualizados.',
          visibilityTime: 8000,
        });
      }

    } catch (error) {
      // Aqui cai apenas se o servidor estiver OFF ou se você deu "throw Error" acima
      Toast.show({
        type: 'error',
        text1: 'Erro de Conexão',
        text2: 'Não foi possível conectar ao servidor.'
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 100 }}>
      <View className="p-6 pt-16">
        <Text className="text-3xl font-black text-slate-900 mb-6">Análise B3</Text>

        {/* Input de Busca Refinado */}
        <View className="flex-row bg-white rounded-2xl border border-slate-200 items-center px-4 mb-8 shadow-sm">
          <Search size={18} color="#64748b" />
          <TextInput
            className="flex-1 h-14 ml-3 text-slate-900 font-bold"
            placeholder="Ex: BBAS3"
            placeholderTextColor="#94a3b8"
            value={ticker}
            onChangeText={setTicker}
            autoCapitalize="characters"
          />
          <TouchableOpacity 
            onPress={fetchAnalysis}
            className="bg-indigo-600 px-5 py-2.5 rounded-xl"
          >
            <Text className="text-white font-bold">Analisar</Text>
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator size="large" color="#4f46e5" className="mt-10" />}

        {data && !loading && (
          <View>
            {/* Header: Nome em cima, Preço grande embaixo */}
            <View className="mb-6">
              <Text className="text-4xl font-black text-slate-900 leading-none">{data.ticker}</Text>
              <Text className="text-slate-500 font-medium text-lg mt-1" numberOfLines={2}>
                {data.name}
              </Text>
              <View className="flex-row items-baseline mt-2">
                <Text className="text-3xl font-black text-indigo-600">R$ {data.price.toFixed(2)}</Text>
              </View>
            </View>

            {/* Banner de Estratégia */}
            <View className="bg-indigo-900 p-6 rounded-3xl mb-6 shadow-md">
              <View className="flex-row items-center mb-1">
                <Info size={14} color="#c7d2fe" />
                <Text className="text-indigo-200 text-xs font-bold uppercase tracking-widest ml-2">Sugestão Técnica</Text>
              </View>
              <Text className="text-white text-xl font-bold">{data.strategy.fit}</Text>
            </View>

            {/* Grid de Indicadores: 2 por linha */}
            <Text className="text-slate-400 font-bold uppercase text-[10px] mb-3 tracking-widest ml-1">Indicadores Chave</Text>
            <View className="flex-row flex-wrap justify-between">
              {data.indicators.map((ind: any, i: number) => (
                <View key={i} style={{ width: '48%' }} className="mb-3">
                   <IndicatorCard 
                    title={ind.title} 
                    value={`${ind.value}${ind.suffix}`} 
                    label={ind.text} 
                  />
                </View>
              ))}
            </View>

            {/* Seção de Riscos com visual de "Card" */}
            <View className="bg-red-50 p-6 rounded-3xl border border-red-100 mt-4">
              <View className="flex-row items-center mb-4">
                <View className="bg-red-500 p-1.5 rounded-lg">
                  <AlertTriangle size={16} color="white" />
                </View>
                <Text className="text-red-900 font-black text-lg ml-3">Pontos de Atenção</Text>
              </View>
              {data.strategy.risks.map((risk: string, i: number) => (
                <View key={i} className="flex-row mb-2">
                  <Text className="text-red-400 mr-2">•</Text>
                  <Text className="text-red-800 font-medium flex-1 text-sm leading-5">{risk}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}