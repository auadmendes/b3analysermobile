import { useAuth, useUser } from '@clerk/clerk-expo';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import {
  ChevronRight,
  LogOut,
  PieChart,
  Save,
  Sparkles,
  Trash2,
  TrendingUp,
  User as UserIcon,
  Wallet
} from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function PortfolioScreen() {
  const { user, isLoaded: userLoaded } = useUser();
  const { signOut, isLoaded: authLoaded } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  // --- CÁLCULOS DE PATRIMÔNIO ---
  // useMemo evita que o cálculo seja refeito desnecessariamente a cada render
  const totals = useMemo(() => {
    const totalValue = assets.reduce((acc, asset) => {
      return acc + (Number(asset.quantity) * Number(asset.averagePrice));
    }, 0);

    return {
      totalInvested: totalValue,
      assetCount: assets.length
    };
  }, [assets]);

  useEffect(() => {
    if (userLoaded && user?.id) fetchPortfolio();
  }, [userLoaded, user?.id]);

  const fetchPortfolio = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/portfolio?userId=${user?.id}`);
      const json = await response.json();
      setAssets(json);
    } catch (error) {
      console.error("Erro ao carregar carteira:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleEdit = (asset: any) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedAsset({ ...asset });
    setModalVisible(true);
  };

  const saveEdit = async () => {
    try {
      const assetId = selectedAsset.id || selectedAsset._id;
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/portfolio/edit/${assetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: selectedAsset.quantity,
          averagePrice: selectedAsset.averagePrice
        })
      });

      if (response.ok) {
        setModalVisible(false);
        fetchPortfolio();
      }
    } catch (e) {
      console.error("Erro ao salvar:", e);
    }
  };

  const deleteAsset = async () => {
    Alert.alert(
      "Excluir Ativo",
      `Tem certeza que deseja remover ${selectedAsset?.ticker} da sua carteira?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const assetId = selectedAsset.id || selectedAsset._id;
              await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/portfolio/delete/${assetId}`, {
                method: 'DELETE'
              });
              setModalVisible(false);
              fetchPortfolio();
            } catch (e) { console.error(e); }
          }
        }
      ]
    );
  };

  if (!userLoaded || !authLoaded) return null;

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" backgroundColor="#000" translucent={true} />
      
      {/* Header */}
      <View className="pt-16 px-6 pb-4 flex-row justify-between items-center bg-white border-b border-slate-50">
        <View className="flex-row items-center">
          {user?.imageUrl ? (
            <Image source={{ uri: user.imageUrl }} className="w-10 h-10 rounded-full border border-slate-100" />
          ) : (
            <View className="bg-slate-100 p-2 rounded-full"><UserIcon size={20} color="#64748b" /></View>
          )}
          <View className="ml-3">
            <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Patrimônio</Text>
            <Text className="text-slate-900 text-xl font-black italic">Minha Carteira</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => signOut()} className="p-2 bg-slate-50 rounded-2xl">
          <LogOut size={18} color="#0f172a" />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchPortfolio} tintColor="#4f46e5" />}
      >
        {/* --- DASHBOARD DE RESUMO --- */}
        <View className="flex-row justify-between mb-8">
          <View className="bg-slate-50 p-5 rounded-[28px] border border-slate-100 flex-1 mr-2">
             <View className="bg-indigo-100 w-8 h-8 rounded-full items-center justify-center mb-3">
                <TrendingUp size={16} color="#4f46e5" />
             </View>
             <Text className="text-slate-400 text-[10px] font-black uppercase mb-1">Total Investido</Text>
             <Text className="text-slate-900 text-lg font-black">
                R$ {totals.totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
             </Text>
          </View>

          <View className="bg-slate-50 p-5 rounded-[28px] border border-slate-100 flex-1 ml-2">
             <View className="bg-amber-100 w-8 h-8 rounded-full items-center justify-center mb-3">
                <PieChart size={16} color="#d97706" />
             </View>
             <Text className="text-slate-400 text-[10px] font-black uppercase mb-1">Ativos</Text>
             <Text className="text-slate-900 text-lg font-black">{totals.assetCount} Tickers</Text>
          </View>
        </View>

        {/* Card IA Analyser */}
        <TouchableOpacity
          onPress={() => router.push("/analysis")}
          activeOpacity={0.8}
          className="bg-indigo-600 p-6 rounded-[32px] mb-8 shadow-xl shadow-indigo-200 flex-row items-center justify-between"
        >
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Sparkles size={14} color="white" />
              <Text className="text-indigo-100 text-[9px] font-black ml-2 uppercase tracking-[2px]">Smart Analysis</Text>
            </View>
            <Text className="text-white text-xl font-black">Análise da Carteira</Text>
          </View>
          <View className="bg-white/20 p-2 rounded-full">
            <ChevronRight size={20} color="white" />
          </View>
        </TouchableOpacity>

        <Text className="text-slate-900 font-black text-lg mb-5 ml-1">Seus Ativos</Text>

        {loading ? (
          <ActivityIndicator color="#4f46e5" className="mt-10" />
        ) : assets.length === 0 ? (
          <View className="items-center mt-10 p-10 border-2 border-dashed border-slate-100 rounded-[32px]">
            <Text className="text-slate-400 font-bold text-center">Nenhum ativo encontrado. Adicione ativos pesquisando por tickers!</Text>
          </View>
        ) : (
          assets.map((item, index) => {
            const isFII = item.type === 'FII' || item.type === 'FUNDO_IMOBILIARIO';
            
            // Cálculo da porcentagem de alocação deste ativo no montante total
            const assetValue = Number(item.quantity) * Number(item.averagePrice);
            const allocationPercent = totals.totalInvested > 0 
                ? ((assetValue / totals.totalInvested) * 100).toFixed(1) 
                : 0;

            return (
              <TouchableOpacity
                key={index}
                onPress={() => router.push(`/ticker/${item.ticker}`)}
                onLongPress={() => handleEdit(item)}
                delayLongPress={350}
                activeOpacity={0.7}
                className="bg-white border border-slate-100 p-5 rounded-[28px] mb-4 flex-row items-center justify-between shadow-sm"
              >
                <View className="flex-row items-center flex-1">
                  <View className={`${isFII ? 'bg-amber-100' : 'bg-indigo-50'} p-4 rounded-2xl mr-4`}>
                    <Wallet size={20} color={isFII ? '#d97706' : '#4f46e5'} />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                        <Text className="font-black text-slate-950 text-lg tracking-tight mr-2">{item.ticker}</Text>
                        <View className="bg-slate-100 px-2 py-0.5 rounded-lg">
                            <Text className="text-slate-500 text-[10px] font-black">{allocationPercent}%</Text>
                        </View>
                    </View>
                    <Text className="text-slate-400 text-[9px] font-black uppercase tracking-tighter">
                       {isFII ? 'Fundo Imobiliário' : 'Ação B3'}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <View className="items-end mr-3">
                    <Text className="font-black text-slate-900 text-base">{item.quantity} un.</Text>
                    <Text className="text-slate-300 text-[8px] font-bold uppercase">R$ {assetValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                  </View>
                  <ChevronRight size={16} color="#cbd5e1" />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* MODAL DE EDIÇÃO */}
      <Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end bg-black/50">
          <View className="bg-white p-8 rounded-t-[48px] shadow-2xl">
            <View className="w-12 h-1.5 bg-slate-200 rounded-full self-center mb-8" />
            
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Editando Ativo</Text>
                <Text className="text-4xl font-black text-slate-900">{selectedAsset?.ticker}</Text>
              </View>
              <TouchableOpacity onPress={deleteAsset} className="bg-red-50 p-4 rounded-2xl">
                <Trash2 size={22} color="#ef4444" />
              </TouchableOpacity>
            </View>

            <View className="space-y-5">
              <View>
                <Text className="text-slate-400 font-black text-[10px] uppercase mb-2 ml-1">Quantidade</Text>
                <TextInput 
                  className="bg-slate-50 p-5 rounded-2xl text-xl font-bold border border-slate-100 text-slate-900"
                  keyboardType="numeric"
                  value={String(selectedAsset?.quantity || '')}
                  onChangeText={(val) => setSelectedAsset({...selectedAsset, quantity: val})}
                />
              </View>
              
              <View className="mt-4">
                <Text className="text-slate-400 font-black text-[10px] uppercase mb-2 ml-1">Preço Médio (R$)</Text>
                <TextInput 
                  className="bg-slate-50 p-5 rounded-2xl text-xl font-bold border border-slate-100 text-slate-900"
                  keyboardType="numeric"
                  placeholder="0,00"
                  value={String(selectedAsset?.averagePrice || '')}
                  onChangeText={(val) => setSelectedAsset({...selectedAsset, averagePrice: val})}
                />
              </View>
            </View>

            <View className="flex-row mt-10 mb-4">
              <TouchableOpacity 
                onPress={saveEdit}
                className="flex-1 bg-indigo-600 p-6 rounded-[28px] flex-row justify-center items-center shadow-lg shadow-indigo-100"
              >
                <Save size={20} color="white" />
                <Text className="text-white font-black text-lg ml-3">Salvar Alterações</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setModalVisible(false)} className="mb-4">
              <Text className="text-slate-400 text-center font-bold">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}