import { useUser } from '@clerk/clerk-expo';
import { router, useLocalSearchParams } from 'expo-router';
import { History, Plus, Search, StarIcon, TrendingUp } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';

// Componentes
import { AddAssetModal } from '@/components/AddAssetModal';
import { InsightButton } from '@/components/InsightButton';
import AISummary from '@/components/aISummary';
import { AiOptionsModal } from '@/components/aiOptionsModal';
import { DividendHistoryCard } from '@/components/dividendHistoryCard'; // Novo
import IndicatorCard from '@/components/indicatorCard';
import { PriceChart } from '@/components/priceChart';
import { useTicker } from '@/hooks/useTicker';
import { FairValueCard } from '../analysis/fairValueCard';
import { MagicNumberCard } from '../analysis/magicNumberCard';

export default function AnalysisScreen() {
  const { user } = useUser();
  const params = useLocalSearchParams();
  const screenWidth = Dimensions.get('window').width - 48;

  // Estados da Busca Principal
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [isFavorited, setIsFavorited] = useState(false);

  // Chamada do hook useTicker (Renomeando loading para tickerLoading para evitar conflito)
  const { tickerData, loading: tickerLoading } = useTicker(data?.ticker || "");

  // Estados IA
  const [aiOptionsVisible, setAiOptionsVisible] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  // Estados Modais
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [isSavingAsset, setIsSavingAsset] = useState(false);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  // 1. Carregamento Automático via Params
  useEffect(() => {
    if (params.ticker) {
      const t = params.ticker as string;
      setTicker(t);
      fetchAnalysis(t);
    }
  }, [params.ticker]);

  // 2. Lógica de cálculo da simulação histórica
  const simulacaoCalculada = useMemo(() => {
    if (!data?.chart_data || data.chart_data.length < 2) return null;

    const valorInicialInvestido = 1000; 
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

  // 3. Busca de Análise Principal
  const fetchAnalysis = async (symbol?: string) => {
    const target = symbol || ticker;
    if (!target) return;

    setLoading(true);
    setAiResult(null);
    try {
      const response = await fetch(`${API_URL}/api/analyze?ticker=${target}`);
      const json = await response.json();

      if (json.success) {
        setData({ ...json.data }); 
        checkIfIsFavorited(json.data.ticker); 
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Erro na busca' });
    } finally {
      setLoading(false);
    }
  };

  // 4. Síntese IA
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
      Toast.show({ type: 'error', text1: 'Erro no Insight' });
    } finally {
      setAiLoading(false);
    }
  };

  // 5. Salvar na Carteira
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

  // 6. Lógica de Favoritos
  const handleFavorite = async () => {
    if (!data?.ticker || !user?.id) return;
    try {
      const response = await fetch(`${API_URL}/api/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: data.ticker, user_id: user.id })
      });
      const json = await response.json();
      if (json.success) {
        setIsFavorited(!isFavorited);
        Toast.show({ type: 'success', text1: isFavorited ? 'Removido' : 'Adicionado, Você receberá notificações para esse ticker' });
      }
    } catch (error) { console.error(error); }
  };

  const checkIfIsFavorited = async (tickerToCheck: string) => {
    if (!user?.id || !tickerToCheck) return;
    try {
      const res = await fetch(`${API_URL}/api/favorites/check/${user.id}/${tickerToCheck}`);
      const json = await res.json();
      setIsFavorited(json.isFavorited);
    } catch (e) { console.error(e); }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 100 }}>
      <View className="p-6 pt-16">
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-black text-slate-900">Explorar</Text>
          <TouchableOpacity onPress={() => router.push("/ticker/history")} className="p-3 bg-white border border-slate-200 rounded-2xl">
            <History size={22} color="#4f46e5" />
          </TouchableOpacity>
        </View>

        {/* Busca */}
        <View className="flex-row bg-white rounded-2xl border border-slate-200 items-center px-4 mb-8 shadow-sm">
          <Search size={18} color="#64748b" />
          <TextInput 
            className="flex-1 h-14 ml-3 text-slate-900 font-bold" 
            placeholder="Ex: PETR4, MXRF11..." 
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
            {/* Ticker e Preço */}
            <View className="flex-row justify-between items-start mb-6">
              <View>
                <Text className="text-4xl font-black text-slate-900">{data.ticker}</Text>
                <Text className="text-3xl font-black text-indigo-600">R$ {data.price?.toFixed(2)}</Text>
              </View>

            {/* Substitua o bloco do botão da estrela por este corrigido: */}
            <View className="flex-row items-center">
              <TouchableOpacity onPress={handleFavorite} className="mr-2 p-2">
                <StarIcon 
                  size={32} 
                  // 🌟 Amarelo ouro (#eab308) se estiver ativo, cinza/slate escuro (#334155) se estiver apagado
                  color={isFavorited ? "#eab308" : "#334155"} 
                  // 🌟 Preenche o fundo com amarelo se estiver ativo, senão fica transparente ("none")
                  fill={isFavorited ? "#eab308" : "none"} 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAddModalVisible(true)} className="p-3 bg-indigo-600 rounded-2xl shadow-sm">
                <Plus size={22} color="white" />
              </TouchableOpacity>
            </View>
            </View>

            {/* Gráfico */}
            {data?.chart_data && <PriceChart data={data.chart_data} />}

            {/* Simulação */}
            {simulacaoCalculada && (
              <View className="bg-slate-900 rounded-[32px] p-6 mb-6">
                <View className="flex-row items-center mb-4">
                  <TrendingUp size={20} color="#818cf8" />
                  <Text className="text-indigo-300 text-[10px] font-bold ml-3 uppercase tracking-widest">Simulador</Text>
                </View>
                <Text className="text-slate-400 text-xs mb-1">Investindo R$ 1.000,00 há 12 meses:</Text>
                <View className="flex-row items-end justify-between">
                  <Text className="text-white text-3xl font-black">R$ {simulacaoCalculada.total}</Text>
                  <View className={`px-3 py-1 rounded-full ${simulacaoCalculada.isPositivo ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                    <Text className={`font-bold text-xs ${simulacaoCalculada.isPositivo ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {simulacaoCalculada.isPositivo ? '+' : ''}{simulacaoCalculada.percentual}%
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* IA */}
            <AISummary ticker={data.ticker} onGenerate={() => setAiOptionsVisible(true)} result={aiResult} loading={aiLoading} />

            {/* Indicadores */}
            <View className="flex-row flex-wrap justify-between mt-6">
              {data.indicators?.map((ind: any, i: number) => (
                <View key={i} style={{ width: '48%' }} className="mb-3">
                  <IndicatorCard title={ind.title} value={`${ind.value}${ind.suffix}`} label={ind.text} />
                </View>
              ))}
            </View>

            {/* Cards de Análise Extra */}
            {tickerData && !tickerLoading && (
              <View className="mt-4">
                <MagicNumberCard 
                  ticker={tickerData.symbol}
                  currentPrice={tickerData.currentPrice}
                  lastDividend={tickerData.lastDividend} 
                />
                <FairValueCard 
                  ticker={tickerData.symbol}
                  vpa={tickerData.vpa} 
                  lpa={tickerData.lpa} 
                  currentPrice={tickerData.currentPrice} 
                />
              </View>
            )}

            {/* Histórico de Proventos (PROTEGIDO) */}
            <View className="mt-4">
              <DividendHistoryCard ticker={data.ticker} />
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
        onConfirm={handleAISynthesis} 
      />
      {data?.ticker && (
        <InsightButton 
          ticker={data.ticker as string} 
          analysisText={aiResult} // 🌟 Injeta o texto completo da análise aqui!
        />
      )}

    </ScrollView>
  );
}