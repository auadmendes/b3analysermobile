import { useUser } from '@clerk/clerk-expo';
import { router, useLocalSearchParams } from 'expo-router';
import { Heart, History, Plus, Search, TrendingUp } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

// Componentes
import { AddAssetModal } from '@/components/AddAssetModal';
import AISummary from '@/components/aISummary';
import { AiOptionsModal } from '@/components/aiOptionsModal';
import IndicatorCard from '@/components/indicatorCard';
import { PriceChart } from '@/components/priceChart';

export default function AnalysisScreen() {
  const { user } = useUser();
  const { id } = useLocalSearchParams();
  const params = useLocalSearchParams();
  const screenWidth = Dimensions.get('window').width - 48;

  // Estados
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  
  // Estados IA
  const [aiOptionsVisible, setAiOptionsVisible] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  // Estados Modais
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [isSavingAsset, setIsSavingAsset] = useState(false);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL;

  // 1. Carregamento Automático
  useEffect(() => {
    if (params.ticker) {
      const t = params.ticker as string;
      setTicker(t);
      fetchAnalysis(t);
    }
  }, [params.ticker]);

  // 1. Criamos a lógica de cálculo (useMemo para performance)
  const simulacaoCalculada = useMemo(() => {
    if (!data?.chart_data || data.chart_data.length < 2) return null;

    const valorInicialInvestido = 1000; // Valor base para o exemplo
    const precoInicial = data.chart_data[0].value;
    const precoAtual = data.price;

    const quantidadeCotas = valorInicialInvestido / precoInicial;
    const valorFinal = quantidadeCotas * precoAtual;
    const lucroAbsoluto = valorFinal - valorInicialInvestido;
    const rendimentoPercentual = ((valorFinal - valorInicialInvestido) / valorInicialInvestido) * 100;

    return {
      total: valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      lucro: lucroAbsoluto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      percentual: rendimentoPercentual.toFixed(2),
      isPositivo: rendimentoPercentual >= 0
    };
  }, [data]);

  // 2. Busca Principal
const fetchAnalysis = async (symbol?: string) => {
  const target = symbol || ticker;
  if (!target) return;

  setLoading(true);
  try {
    const response = await fetch(`${API_URL}/api/analyze?ticker=${target}`);
    const json = await response.json();

    if (json.success) {
      setData({ ...json.data }); 
      
      // ✅ ADICIONE ESTA LINHA AQUI:
      // Sincroniza o estado do coração com o banco de dados
      checkIfIsFavorited(json.data.ticker); 

      console.log("Pontos recebidos:", json.data.chart_data?.length);
    }
  } catch (error) {
    Toast.show({ type: 'error', text1: 'Erro na busca' });
  } finally {
    setLoading(false);
  }
};

  // 3. FUNÇÃO PREMIUM RESTAURADA
  const handleAISynthesis = async (focus: string, message: string) => {
    if (!data?.ticker) return;
    setAiOptionsVisible(false);
    setAiLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/analyze/premium`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: data.ticker,
          focus: focus,
          message: message,
          user_id: user?.id
        })
      });

      const json = await response.json();
      if (json.success) {
        setAiResult(json.insight);
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Erro no Insight', text2: 'Tente novamente.' });
    } finally {
      setAiLoading(false);
    }
  };

  // 4. Salvar Carteira
  const handleConfirmAddAsset = async (qty: number, avgPrice: number) => {
    if (!user?.id || !data) return;
    setIsSavingAsset(true);
    try {
      const response = await fetch(`${API_URL}/api/portfolio/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: data.ticker,
          user_id: user.id,
          quantity: qty,
          average_price: avgPrice,
          type: data.ticker.includes('11') ? 'FII' : 'ACAO'
        })
      });
      const json = await response.json();
      if (json.success) {
        setAddModalVisible(false);
        Toast.show({ type: 'success', text1: 'Ativo adicionado!' });
      }
    } catch (e) {
      Alert.alert("Erro", "Falha ao salvar.");
    } finally { setIsSavingAsset(false); }
  };

  const handleFavorite = async () => {
      // 1. Verificação de segurança: Só favorita se houver dados carregados
      if (!data?.ticker || !user?.id) {
          Toast.show({ 
              type: 'info', 
              text1: 'Aguarde', 
              text2: 'Carregando dados do ativo...' 
          });
          return;
      }

      try {
          // Usamos o ticker que veio da API (data.ticker) para garantir que é o ativo correto
          const response = await fetch(`${API_URL}/api/favorites`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  ticker: data.ticker,
                  user_id: user.id
              })
          });

          const json = await response.json();

          if (json.success) {
              // Inverte o estado visual
              const newFavoriteStatus = !isFavorited;
              setIsFavorited(newFavoriteStatus);
              
            Toast.show({ 
                type: 'success', 
                text1: newFavoriteStatus ? 'Adicionado' : 'Removido', 
                text2: newFavoriteStatus 
                    ? `${data.ticker} adicionado aos favoritos!` 
                    : `${data.ticker} removido dos favoritos` 
            });
        }
      } catch (error) {
          console.error("Erro ao favoritar:", error);
          Toast.show({ 
              type: 'error', 
              text1: 'Erro', 
              text2: 'Não foi possível processar o favorito.' 
          });
      }
  };

const checkIfIsFavorited = async (tickerToCheck: string) => {
    if (!user?.id || !tickerToCheck) return;
    try {
        const res = await fetch(`${API_URL}/api/favorites/check/${user.id}/${tickerToCheck}`);
        const json = await res.json();
        setIsFavorited(json.isFavorited);
    } catch (e) {
        console.error("Erro check favorite:", e);
    }
};

  const simulação = useMemo(() => {
    const taxa = data?.change_1y || 0;
    return { total: 1000 * (1 + (taxa / 100)), percent: taxa.toFixed(2), positivo: taxa >= 0 };
  }, [data]);

  return (
    <ScrollView className="flex-1 mt-10 bg-slate-50" contentContainerStyle={{ paddingBottom: 100 }}>
      <View className="p-6 pt-16">
        
        {/* Header e Busca sempre visíveis */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-black text-slate-900">Explorar</Text>
          <TouchableOpacity onPress={() => router.push("/ticker/history")} className="p-3 bg-white border border-slate-200 rounded-2xl">
            <History size={22} color="#4f46e5" />
          </TouchableOpacity>
        </View>

        <View className="flex-row bg-white rounded-2xl border border-slate-200 items-center px-4 mb-8 shadow-sm">
          <Search size={18} color="#64748b" />
          <TextInput 
            className="flex-1 h-14 ml-3 text-slate-900 font-bold" 
            placeholder="Ticker..." 
            value={ticker} 
            onChangeText={setTicker} 
            autoCapitalize="characters" 
          />
          <TouchableOpacity onPress={() => fetchAnalysis()} className="bg-indigo-600 px-5 py-2.5 rounded-xl">
            <Text className="text-white font-bold text-xs">ANALISAR</Text>
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator size="large" color="#4f46e5" className="mt-10" />}

        {data && !loading && (
          <View>
            {/* Preço e Ações */}
            <View className="flex-row justify-between items-start mb-6">
              <View>
                <Text className="text-4xl font-black text-slate-900">{data.ticker}</Text>
                <Text className="text-3xl font-black text-indigo-600">R$ {data.price?.toFixed(2)}</Text>
              </View>

                <View className="flex-row items-center">
                    <TouchableOpacity onPress={handleFavorite} className="mr-2 p-2">
                        <Heart 
                            size={32} 
                            color={isFavorited ? "#ef4444" : "#0f172a"} 
                            fill={isFavorited ? "#ef4444" : "none"} 
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setAddModalVisible(true)} className="p-3 bg-indigo-600 rounded-2xl shadow-sm">
                      <Plus size={22} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Gráfico de Preço */}
            {data?.chart_data && <PriceChart data={data.chart_data} />}

            {simulacaoCalculada && (
              <View className="bg-slate-900 rounded-[32px] p-6 mb-6 shadow-xl shadow-slate-300">
                <View className="flex-row items-center mb-4">
                  <View className="bg-indigo-500/20 p-2 rounded-xl">
                    <TrendingUp size={20} color="#818cf8" />
                  </View>
                  <Text className="text-indigo-300 text-[10px] font-bold ml-3 uppercase tracking-widest">
                    Simulador de Retorno
                  </Text>
                </View>

                {/* Corrigido: O texto deve estar todo dentro de um componente Text */}
                <Text className="text-slate-400 text-xs mb-1">
                  Se você tivesse investido{" "}
                  <Text className="text-white font-bold text-xs">R$ 1.000,00</Text> há 12 meses
                  em {data.ticker}, hoje você teria:
                </Text>

                <View className="flex-row items-end justify-between mt-2">
                  <Text className="text-white text-3xl font-black">
                    R$ {simulacaoCalculada.total}
                  </Text>
                  
                  <View className={`px-3 py-1 rounded-full ${simulacaoCalculada.isPositivo ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                    <Text className={`font-bold text-xs ${simulacaoCalculada.isPositivo ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {simulacaoCalculada.isPositivo ? '+' : ''}{simulacaoCalculada.percentual}%
                    </Text>
                  </View>
                </View>

                <View className="mt-4 pt-4 border-t border-slate-800">
                  <Text className="text-slate-500 text-[10px]">
                    * Considera apenas a valorização da cota no período.
                  </Text>
                </View>
              </View>
            )}


            <AISummary 
              ticker={data.ticker} 
              onGenerate={() => setAiOptionsVisible(true)} 
              result={aiResult} 
              loading={aiLoading} 
            />

            <View className="flex-row flex-wrap justify-between mt-6">
              {data.indicators?.map((ind: any, i: number) => (
                <View key={i} style={{ width: '48%' }} className="mb-3">
                  <IndicatorCard title={ind.title} value={`${ind.value}${ind.suffix}`} label={ind.text} />
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* MODAIS */}
      <AddAssetModal 
        isVisible={addModalVisible} 
        onClose={() => setAddModalVisible(false)} 
        onConfirm={handleConfirmAddAsset} 
        ticker={data?.ticker}
        loading={isSavingAsset}
      />

      <AiOptionsModal 
        isVisible={aiOptionsVisible} 
        onClose={() => setAiOptionsVisible(false)} 
        title={`Análise IA: ${data?.ticker}`} 
        onConfirm={handleAISynthesis} // <--- CHAMA A FUNÇÃO CORRETA
      />
    </ScrollView>
  );
}