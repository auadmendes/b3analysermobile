import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { ChevronRight, LogOut, Sparkles, User as UserIcon, Wallet } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function PortfolioScreen() {
  const { user, isLoaded: userLoaded } = useUser();
  const { signOut, isLoaded: authLoaded } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);

  useEffect(() => {
    if (userLoaded && user?.id) {
      fetchPortfolio();
    }
  }, [userLoaded, user?.id]);

  const fetchPortfolio = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/portfolio?userId=${user?.id}`
      );
      const json = await response.json();
      setAssets(json);
    } catch (error) {
      console.error("Erro ao buscar carteira:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPortfolio();
  };

  if (!userLoaded || !authLoaded) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="text-slate-400 mt-4 font-medium">Sincronizando ativos...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header Fixo */}
      <View className="pt-16 px-6 pb-4 flex-row justify-between items-center border-b border-slate-50 bg-white">
        <View className="flex-row items-center">
          {user?.imageUrl ? (
            <Image source={{ uri: user.imageUrl }} className="w-10 h-10 rounded-full border border-slate-100" />
          ) : (
            <View className="bg-slate-100 p-2 rounded-full">
              <UserIcon size={20} color="#64748b" />
            </View>
          )}
          <View className="ml-3">
            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Olá, {user?.firstName}</Text>
            <Text className="text-slate-900 text-xl font-black">Minha Carteira</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => signOut()} className="p-2 bg-red-50 rounded-2xl">
          <LogOut size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* ScrollView com Refresh Control */}
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f46e5" />
        }
      >
        {/* CARD DE ANÁLISE IA */}
        <TouchableOpacity 
          onPress={() => router.push("/analysis")}
          className="bg-indigo-600 p-6 rounded-[32px] mb-8 shadow-xl shadow-indigo-200 flex-row items-center justify-between"
        >
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <Sparkles size={18} color="white" />
              <Text className="text-indigo-100 text-[10px] font-black ml-2 uppercase tracking-widest">Premium AI</Text>
            </View>
            <Text className="text-white text-xl font-black">Análise da Carteira</Text>
            <Text className="text-indigo-100 text-xs mt-1 opacity-80">Verifique a saúde dos seus investimentos</Text>
          </View>
          <View className="bg-indigo-500 p-3 rounded-2xl">
            <ChevronRight size={24} color="white" />
          </View>
        </TouchableOpacity> 

        {/* LISTAGEM DE ATIVOS */}
        {assets.length === 0 ? (
          <View className="items-center mt-20">
            <Text className="text-slate-400 font-medium">Nenhum ativo na carteira.</Text>
          </View>
          
        ) : (
          assets.map((item, index) => {
            // Lógica de Cores Condicional
            const isFII = item.type === 'FII' || item.type === 'FUNDO_IMOBILIARIO';
            const iconBgColor = isFII ? 'bg-amber-100' : 'bg-indigo-50';
            const iconColor = isFII ? '#d97706' : '#4f46e5';

            return (
              <TouchableOpacity 
                key={index}
                onPress={() => router.push(`/ticker/${item.ticker}`)}
                activeOpacity={0.7}
                className="bg-white border border-slate-100 p-5 rounded-[32px] mb-4 flex-row items-center justify-between shadow-sm shadow-slate-200"
              >
                <View className="flex-row items-center">
                  <View className={`${iconBgColor} p-4 rounded-2xl mr-4`}>
                    <Wallet size={20} color={iconColor} />
                  </View>
                  <View>
                    <Text className="font-black text-slate-950 text-lg tracking-tight">{item.ticker}</Text>
                    <Text className="text-slate-400 text-[9px] font-black uppercase tracking-tighter">
                      {isFII ? 'Fundo Imobiliário' : 'Ação B3'}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <View className="items-end mr-3">
                    <Text className="font-black text-slate-900 text-base">{item.quantity} un.</Text>
                    <View className="flex-row items-center">
                       <Text className="text-emerald-500 text-[10px] font-bold">↗ +2.5%</Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color="#cbd5e1" />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
      
    </View>
  );
}