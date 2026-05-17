import { useUser } from '@clerk/clerk-expo';
import { Stack, useRouter } from 'expo-router';
import { Calendar, ChevronLeft, ChevronRight, MessageSquare, Plus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ChatSessionsScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSessions = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/chat/sessions/${user.id}`);
      const json = await res.json();
      if (json.success) setSessions(json.sessions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSessions();
  };

  return (
    <View className="flex-1 bg-slate-50">
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View className="pt-14 pb-6 px-6 bg-white border-b border-slate-100 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-50 rounded-full mr-4">
            <ChevronLeft size={20} color="#0f172a" />
          </TouchableOpacity>
          <Text className="text-2xl font-black text-slate-900">Conversas</Text>
        </View>
        
        <TouchableOpacity 
          onPress={() => router.push('/chat')}
          className="bg-indigo-600 p-3 rounded-2xl"
        >
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1 px-6 pt-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator color="#4f46e5" className="mt-10" />
        ) : sessions.length === 0 ? (
          <View className="items-center justify-center mt-20 opacity-40">
            <MessageSquare size={48} color="#64748b" />
            <Text className="text-slate-500 font-bold mt-4">Nenhuma conversa iniciada</Text>
          </View>
        ) : (
          sessions.map((session) => (
            <TouchableOpacity 
              key={session._id}
              onPress={() => {
                // Navega para o chat passando o ID da sessão
                router.push({ 
                  pathname: '/chat', 
                  params: { sessionId: session._id }
                });
              }}
              className="bg-white p-5 rounded-[24px] mb-3 flex-row items-center border border-slate-100 shadow-sm"
            >
              <View className="bg-indigo-100 p-3 rounded-xl mr-4">
                <MessageSquare size={18} color="#4f46e5" />
              </View>
              
              <View className="flex-1">
                <Text className="text-slate-900 font-bold text-base" numberOfLines={1}>
                  {session.title || "Conversa sem título"}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Calendar size={10} color="#94a3b8" />
                  <Text className="text-slate-400 text-[10px] ml-1">
                    {new Date(session.createdAt).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
              </View>
              
              <ChevronRight size={16} color="#cbd5e1" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}