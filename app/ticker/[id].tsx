import { AiOptionsModal } from '@/components/aiOptionsModal';
import AISummary from '@/components/aISummary';
import { DividendHistoryCard } from '@/components/dividendHistoryCard';
import { InsightButton } from '@/components/InsightButton';
import { PriceChart } from '@/components/priceChart';
import { useTicker } from '@/hooks/useTicker';
import { useUser } from '@clerk/clerk-expo';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
    AlertTriangle,
    BrainCircuit,
    ChevronLeft,
    Info,
    MessageSquareText,
    StarIcon,
    Target,
    TrendingUp
} from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { FairValueCard } from '../analysis/fairValueCard';
import { MagicNumberCard } from '../analysis/magicNumberCard';

export default function TickerDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useUser();

    // 1. Estados da aplicação (Sempre no topo)
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState<string | null>(null);
    const [isFavorited, setIsFavorited] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [isSavingAsset, setIsSavingAsset] = useState(false);

    const { tickerData, loading: tickerLoading } = useTicker(data?.ticker || "");
    const EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL;

    // 2. Effects (Sempre no topo, após os estados)
    useEffect(() => {
        fetchTickerData();
    }, [id]);

    useEffect(() => {
        if (user?.id && id) {
            checkIfIsFavorited();
        }
    }, [id, user?.id]);

    // 3. Funções de Busca e Ação
    const fetchTickerData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${EXPO_PUBLIC_API_URL}/api/analyze?ticker=${id}`);
            if (!response.ok) throw new Error("Erro na rede");
            const json = await response.json();
            
            setData(json.data);
            if (!json.success) {
                Toast.show({
                    type: 'info',
                    text1: 'Limite de API atingido',
                    text2: 'Os dados podem estar desatualizados.'
                });
            }
        } catch (error) {
            console.error("Erro ao carregar detalhes:", error);
        } finally {
            setLoading(false);
        }
    };

    const checkIfIsFavorited = async () => {
        try {
            const response = await fetch(
                `${EXPO_PUBLIC_API_URL}/api/favorites/check/${user?.id}/${id}`
            );
            const json = await response.json();
            setIsFavorited(json.isFavorited);
        } catch (error) {
            console.error("Erro ao verificar favorito:", error);
        }
    };

    const handleFavorite = async () => {
        try {
            const response = await fetch(`${EXPO_PUBLIC_API_URL}/api/favorites`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticker: id,
                    user_id: user?.id
                })
            });
            const json = await response.json();
            if (json.success) {
                setIsFavorited(!isFavorited);
                Toast.show({ 
                    type: 'success', 
                    text1: isFavorited ? 'Removido' : 'Adicionado', 
                    text2: isFavorited ? 'Removido dos favoritos' : 'Adicionado aos favoritos!' 
                });
            }
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível favoritar.' });
        }
    };

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

    // const handleConfirmAddAsset = async (qty: number, avgPrice: number) => {
    // if (!qty || !avgPrice) {
    //     Alert.alert("Erro", "Preencha todos os campos.");
    //     return;
    // }

    // try {
    //     setIsSavingAsset(true);
    //     const response = await fetch(`${EXPO_PUBLIC_API_URL}/api/portfolio/add`, {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({
    //             ticker: id,
    //             user_id: user?.id,
    //             quantity: qty,
    //             average_price: avgPrice,
    //             type: id.toString().includes('11') ? 'FII' : 'ACAO' // Lógica simples para detectar tipo
    //         })
    //     });

    //     const json = await response.json();
    //     if (json.success) {
    //         setAddModalVisible(false);
    //         Toast.show({ type: 'success', text1: 'Sucesso!', text2: `${id} adicionado à sua carteira.` });
    //     }
    // } catch (error) {
    //     Alert.alert("Erro", "Não foi possível salvar o ativo.");
    // } finally {
    //     setIsSavingAsset(false);
    // }
    // };

    // const handleAddToPortfolio = () => {
    //     setAddModalVisible(true);
    // };

    const handleAISynthesis = async (focus: string, message: string) => {
        setModalVisible(false);
        setAiLoading(true);
    
        try {
        const response = await fetch(`${EXPO_PUBLIC_API_URL}/api/analyze/premium`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            ticker: data.ticker, // Passamos o ticker isolado
            focus: focus,        // Foco escolhido no modal (Dividendos, etc)
            message: message,    // Mensagem customizada
            user_id: user?.id
            })
        });

        const json = await response.json();
        
        if (json.success) {
            setAiResult(json.insight); // Atualiza o card AISummary com o texto técnico
        }
        } catch (error) {
        Toast.show({ type: 'error', text1: 'Erro no Insight', text2: 'Tente novamente.' });
        } finally {
        setAiLoading(false);
        }
    };

    const getIndicatorIcon = (title: string) => {
        const props = { size: 14, color: "#94a3b8" };
        if (title === "P/VP") return <Target {...props} />;
        if (title === "DY") return <TrendingUp {...props} />;
        return <Info {...props} />;
    };

    

    // 4. Renderizações de Estado (Loading / Error)
    if (loading) {
        return (
            <View className="flex-1 bg-white justify-center items-center">
                <Stack.Screen options={{ headerShown: false }} />
                <View className="bg-indigo-50 p-6 rounded-full mb-4">
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
                <Text className="text-slate-900 font-black text-xl">Analisando {id}</Text>
                <Text className="text-slate-400 font-medium mt-1">Sincronizando dados...</Text>
            </View>
        );
    }

    if (!data) {
        return (
            <View className="flex-1 bg-white p-6 justify-center items-center">
                <Stack.Screen options={{ headerShown: false }} />
                <AlertTriangle size={48} color="#ef4444" />
                <Text className="text-slate-900 font-bold text-lg mt-4 text-center">
                    Não foi possível carregar os dados de {id}
                </Text>
                <TouchableOpacity onPress={() => router.back()} className="bg-indigo-600 px-8 py-3 rounded-2xl mt-6">
                    <Text className="text-white font-bold">Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // 5. Renderização Principal
    return (
        <View className="flex-1 bg-slate-50">
            <StatusBar barStyle="dark-content" />
            <Stack.Screen options={{ headerShown: false }} />
            
            {/* Header com Botões de Ação */}
            <View className="bg-white px-6 pt-14 pb-4 flex-row items-center justify-between border-b border-slate-100 shadow-sm">
                <TouchableOpacity 
                    onPress={() => router.back()} 
                    className="p-2 bg-slate-50 rounded-xl border border-slate-100"
                >
                    <ChevronLeft size={24} color="#0f172a" />
                </TouchableOpacity>
                
                <View className="items-center">
                    <Text className="text-xl font-black text-slate-950">{data.ticker}</Text>
                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        {data.name}
                    </Text>
                </View>

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
                    {/* <TouchableOpacity onPress={handleAddToPortfolio} className="p-2 bg-indigo-600 rounded-lg">
                        <Plus size={20} color="white" />
                    </TouchableOpacity> */}
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
                
                {/* Card de Estratégia */}
                <View className="bg-indigo-600 p-6 rounded-[32px] mb-6 shadow-xl shadow-indigo-100">
                    <View className="flex-row items-center mb-4">
                        <View className="bg-indigo-500 p-2 rounded-lg">
                            <BrainCircuit size={20} color="white" />
                        </View>
                        <Text className="text-indigo-100 text-[10px] font-bold ml-3 uppercase tracking-widest">IA B3 Analyser</Text>
                    </View>
                    
                    <Text className="text-white text-2xl font-black mb-2">
                        {data?.strategy?.fit || "Estratégia sob análise"}
                    </Text>
                    
                    <Text className="text-indigo-100 text-xs leading-5 opacity-90">
                        {data.trend?.momentum === "Forte Alta" 
                            ? "Ativo apresenta excelente momentum técnico e fundamentos robustos."
                            : "Cuidado: Indicadores sugerem volatilidade ou instabilidade técnica."}
                    </Text>
                </View>

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
                    ticker={id as string} 
                    onGenerate={() => setModalVisible(true)} 
                    result={aiResult}
                    loading={aiLoading}
                />

                {/* Métricas */}
                <View className="flex-row items-center justify-between mb-4 px-1">
                    <Text className="text-slate-900 font-black text-lg">Métricas Chave</Text>
                    <View className="bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                        <Text className="text-emerald-700 font-bold text-xs">R$ {data.price?.toFixed(2)}</Text>
                    </View>
                </View>

                <View className="flex-row flex-wrap justify-between">
                    {data.indicators?.map((ind: any, i: number) => (
                        <View key={i} style={{ width: '48%' }} className="mb-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                            <View className="flex-row items-center justify-between mb-2">
                                <Text className="text-slate-400 font-bold text-[10px] uppercase">{ind.title}</Text>
                                {getIndicatorIcon(ind.title)}
                            </View>
                            <Text className="text-2xl font-black text-slate-900 mb-1">
                                {ind.value}{ind.suffix}
                            </Text>
                            <Text className="text-[9px] text-slate-500 font-medium leading-3" numberOfLines={2}>
                                {ind.text}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Novos Cards: Preço Justo e Número Mágico */}
                {tickerData && !tickerLoading && (
                    <View className="mt-4">
                        <MagicNumberCard 
                            ticker={tickerData.symbol}
                            currentPrice={tickerData.currentPrice}
                            lastDividend={tickerData.lastDividend} 
                        />
        
                        <FairValueCard 
                            vpa={tickerData.vpa} 
                            lpa={tickerData.lpa} 
                            currentPrice={tickerData.currentPrice} 
                        />
                        <View className="px-1">
                            {/* Seus cards anteriores (Magic Number, Graham...) */}                
                            <DividendHistoryCard ticker={data.ticker} />
                        </View>
                    </View>
                    
                )}

                {/* Riscos */}
                <View className="bg-red-50/30 p-6 rounded-[32px] border border-red-100 mt-2 mb-4">
                    <View className="flex-row items-center mb-4">
                        <View className="bg-red-100 p-2 rounded-xl">
                            <AlertTriangle size={18} color="#ef4444" />
                        </View>
                        <Text className="text-slate-900 font-black text-lg ml-3">Pontos de Atenção</Text>
                    </View>
                    
                    {data.strategy?.risks?.map((risk: string, i: number) => (
                        <View key={i} className="flex-row items-center mb-2">
                            <View className="w-1.5 h-1.5 rounded-full bg-red-400 mr-3" />
                            <Text className="text-slate-600 font-semibold text-xs leading-4">{risk}</Text>
                        </View>
                    ))}
                </View>

                <TouchableOpacity 
                    onPress={() => router.push({ pathname: "/chat" as any, params: { ticker: id } })}
                    className="bg-slate-900 p-5 rounded-3xl flex-row items-center justify-center mt-4 mb-10 shadow-lg shadow-slate-300"
                >
                    <MessageSquareText size={20} color="white" />
                    <Text className="text-white font-black text-lg ml-3">Tirar dúvidas sobre {id}</Text>
                </TouchableOpacity>
                <InsightButton ticker={id as string} />
            </ScrollView>

            <AiOptionsModal 
                isVisible={modalVisible}
                onClose={() => setModalVisible(false)}
                onConfirm={handleAISynthesis}
                title={`Insight Premium: ${id}`}
                loading={aiLoading}
            />

            {/* <AddAssetModal 
                isVisible={addModalVisible}
                onClose={() => setAddModalVisible(false)}
                onConfirm={handleConfirmAddAsset}
                ticker={id as string}
                loading={isSavingAsset}
            /> */}
            
        </View>
    );
}