import AISummary from '@/components/aISummary';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
    AlertTriangle,
    BrainCircuit,
    ChevronLeft,
    Info,
    MessageSquareText,
    Target,
    TrendingUp
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function TickerDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    
    // Estados da aplicação
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [aiSummary, setAiSummary] = useState<string | null>(null);

    const EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL;

    useEffect(() => {
        fetchTickerData();
    }, [id]);

    const fetchTickerData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${EXPO_PUBLIC_API_URL}/api/analyze?ticker=${id}`);
            
            if (!response.ok) throw new Error("Erro na rede");

            const json = await response.json();
            
            if (json.success) {
                setData(json.data);
            } else {
                // Fallback para Rate Limit ou erro controlado do Python
                setData(json.data); 
                Alert.alert("Aviso", "Os dados podem estar desatualizados devido a limites da API.");
            }
        } catch (error) {
            console.error("Erro ao carregar detalhes:", error);
        } finally {
            setLoading(false);
        }
    };

    // Função para o componente AISummary chamar o Agente de IA
    const handleAISynthesis = async () => {
        try {
            const response = await fetch(`${EXPO_PUBLIC_API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Gere uma análise fundamentada sobre o ticker ${id}. Vale a pena investir agora?`,
                    user_id: "user_luciano_horta" 
                })
            });
            
            const json = await response.json();
            return json.response; 
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    const getIndicatorIcon = (title: string) => {
        const props = { size: 14, color: "#94a3b8" };
        if (title === "P/VP") return <Target {...props} />;
        if (title === "DY") return <TrendingUp {...props} />;
        return <Info {...props} />;
    };

    // --- RENDERIZAÇÃO DE CARREGAMENTO (SKELETON/SPINNER) ---
    if (loading) {
        return (
            <View className="flex-1 bg-white justify-center items-center">
                <Stack.Screen options={{ headerShown: false }} />
                <View className="bg-indigo-50 p-6 rounded-full mb-4">
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
                <Text className="text-slate-900 font-black text-xl">Analisando {id}</Text>
                <Text className="text-slate-400 font-medium mt-1">Sincronizando dados fundamentais...</Text>
            </View>
        );
    }

    // --- RENDERIZAÇÃO DE ERRO ---
    if (!data) {
        return (
            <View className="flex-1 bg-white p-6 justify-center items-center">
                <Stack.Screen options={{ headerShown: false }} />
                <AlertTriangle size={48} color="#ef4444" />
                <Text className="text-slate-900 font-bold text-lg mt-4 text-center">
                    Não foi possível carregar os dados de {id}
                </Text>
                <TouchableOpacity 
                    onPress={() => router.back()} 
                    className="bg-indigo-600 px-8 py-3 rounded-2xl mt-6 shadow-md"
                >
                    <Text className="text-white font-bold">Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // --- RENDERIZAÇÃO PRINCIPAL ---
    return (
        <View className="flex-1 bg-slate-50">
            <StatusBar barStyle="dark-content" />
            <Stack.Screen options={{ headerShown: false }} />
            
            {/* Header Customizado */}
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

                <View className="w-10" />
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
                
                {/* 1. Card de Estratégia (Veredito IA) */}
                <View className="bg-indigo-600 p-6 rounded-[32px] mb-6 shadow-xl shadow-indigo-100">
                    <View className="flex-row items-center mb-4">
                        <View className="bg-indigo-500 p-2 rounded-lg">
                            <BrainCircuit size={20} color="white" />
                        </View>
                        <Text className="text-indigo-100 text-[10px] font-bold ml-3 uppercase tracking-widest">IA B3 Analyser</Text>
                    </View>
                    
                    <Text className="text-white text-2xl font-black mb-2">
                        {data.strategy?.fit || "Análise Indisponível"}
                    </Text>
                    
                    <Text className="text-indigo-100 text-xs leading-5 opacity-90">
                        {data.trend?.momentum === "Forte Alta" 
                            ? "Ativo apresenta excelente momentum técnico e fundamentos robustos."
                            : "Cuidado: Indicadores sugerem volatilidade ou instabilidade técnica."}
                    </Text>
                </View>

                {/* 2. Componente de Síntese Inteligente (Modular) */}
                <AISummary 
                    ticker={id as string} 
                    onGenerate={handleAISynthesis} 
                />

                {/* 3. Métricas Chave */}
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

                {/* 4. Riscos e Alertas */}
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

                {/* 5. Botão de Chat Direto */}
                <TouchableOpacity 
                    onPress={() => router.push({ pathname: "/chat/index" as any, params: { ticker: id } })}
                    className="bg-slate-900 p-5 rounded-3xl flex-row items-center justify-center mt-4 mb-10 shadow-lg shadow-slate-300"
                >
                    <MessageSquareText size={20} color="white" />
                    <Text className="text-white font-black text-lg ml-3">Tirar dúvidas sobre {id}</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}