import { useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { Heart, TrendingDown, TrendingUp } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function FavoritesScreen() {
  const { user } = useUser();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/favorites/${user.id}`);
      const json = await response.json();
      if (json.success) setFavorites(json.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchFavorites(); }, [user?.id]);

  if (loading) return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator color="#4f46e5" size="large" />
    </View>
  );

  return (
    <ScrollView 
      className="flex-1 bg-slate-50" 
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 64, paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchFavorites();}} />}
    >
      {/* Header Refinado */}
      <View className="flex-row justify-between items-end mb-8">
        <View>
          <Text className="text-slate-400 font-bold uppercase text-[10px] tracking-[2px] mb-1">Market Watch</Text>
          <Text className="text-4xl font-black text-slate-900">Favoritos</Text>
        </View>
        <View className="bg-rose-100 p-3 rounded-2xl">
          <Heart size={24} color="#ef4444" fill="#ef4444" />
        </View>
      </View>

      {favorites.length === 0 ? (
        <View className="items-center mt-20 bg-white p-8 rounded-[32px] border border-slate-100">
          <Text className="text-slate-400 text-center font-medium leading-5">
            Sua lista está vazia. Comece a monitorar ativos na aba Explorar.
          </Text>
        </View>
      ) : (
        favorites.map((item, i) => {
          const isPositive = item.change >= 0;
          return (
            <TouchableOpacity 
              key={i}
              activeOpacity={0.7}
              onPress={() => router.push({ pathname: "/explore", params: { ticker: item.ticker } })}
              className="bg-white p-5 rounded-[28px] mb-4 flex-row items-center justify-between border border-slate-100 shadow-sm shadow-slate-200"
            >
              <View className="flex-row items-center flex-1 mr-4">
                {/* Badge do Ticker */}
                <View className={`w-12 h-12 rounded-2xl items-center justify-center ${isPositive ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                  <Text className={`font-black text-[10px] ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {item.ticker.slice(0, 4)}
                  </Text>
                </View>
                
                <View className="ml-4 flex-1">
                  <Text className="text-xl font-black text-slate-900">{item.ticker}</Text>
                  <Text className="text-slate-400 text-[10px] font-bold uppercase" numberOfLines={1}>
                    {item.name || 'Ativo B3'}
                  </Text>
                </View>
              </View>

              <View className="items-end">
                <Text className="text-lg font-black text-slate-900">
                  R$ {item.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Text>
                
                <View className={`flex-row items-center px-2 py-1 rounded-lg ${isPositive ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                  {isPositive ? <TrendingUp size={10} color="#059669" /> : <TrendingDown size={10} color="#e11d48" />}
                  <Text className={`text-[10px] font-black ml-1 ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {isPositive ? '+' : ''}{item.change?.toFixed(2)}%
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}