import { useAuth, useUser } from '@clerk/clerk-expo'; // Puxa hooks do Clerk
import { useRouter } from 'expo-router';
import { ChevronRight, LogOut, ShieldCheck, User } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { registerForPushNotificationsAsync } from '../../../services/notifications'; // Seu arquivo de push

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useUser();       // Dados do usuário logado (Nome, e-mail, etc)
  const { signOut } = useAuth();    // Função de logout nativa do Clerk

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    async function inicializarE_Sincronizar() {
      // Só roda se o Clerk já tiver carregado o usuário e a API_URL estiver configurada
      if (!user?.id || !API_URL) return;

      let token = null;
      try {
        // 1. Pede permissão e busca o token único do dispositivo do usuário
        token = await registerForPushNotificationsAsync(user.id, API_URL);
      } catch (err) {
        console.log("⚠️ Rodando em emulador ou permissão de push negada.");
      }

      // 2. Dispara a sincronização pesada com o MongoDB do Python
      try {
        const userEmail = user.primaryEmailAddress?.emailAddress || '';
        
        await fetch(`${API_URL}/api/user/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            email: userEmail,
            pushToken: token // Se for nulo (emulador), o Python trata sem quebrar
          })
        });
        console.log("✅ Usuário sincronizado com o ecossistema H3B3!");
      } catch (error) {
        console.error("❌ Falha ao enviar dados de sincronização para o servidor:", error);
      }
    }

    inicializarE_Sincronizar();
  }, [user]);

  // Função de segurança do botão preto de Admin
  const acessarPainelAdmin = () => {
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    // Hardcoded temporário para o seu MVP avançar rápido
    if (userEmail === 'luciano.auad@gmail.com') { 
      router.push("./profile/dashboard" as any);
    } else {
      Alert.alert("Área Restrita", "Seu usuário não possui permissão de administrador.");
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <View className="pt-16 pb-6 px-6 bg-white border-b border-slate-100">
        <Text className="text-2xl font-black text-slate-900">Meu Perfil</Text>
        <Text className="text-xs font-bold text-slate-400 tracking-wider uppercase mt-1">Configurações</Text>
      </View>

      {/* Dados Dinâmicos do Google/Clerk */}
      <View className="bg-white m-4 p-4 rounded-3xl border border-slate-100 flex-row items-center">
        <View className="p-4 bg-indigo-50 rounded-full mr-4">
          <User size={24} color="#4f46e5" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-black text-slate-900">{user?.fullName || 'Usuário Investidor'}</Text>
          <Text className="text-xs font-medium text-slate-400">{user?.primaryEmailAddress?.emailAddress}</Text>
        </View>
      </View>

      {/* Menu de Opções */}
      <View className="bg-white mx-4 rounded-3xl border border-slate-100 overflow-hidden">
        <TouchableOpacity className="p-4 border-b border-slate-50 flex-row justify-between items-center">
          <Text className="text-sm font-bold text-slate-700">Minha Conta</Text>
          <ChevronRight size={16} color="#cbd5e1" />
        </TouchableOpacity>
      </View>

      {/* Botão de Acesso ao Painel Admin */}
      <View className="mt-6 mx-4">
        <TouchableOpacity 
          onPress={acessarPainelAdmin} 
          className="p-4 bg-slate-900 rounded-2xl flex-row justify-center items-center shadow-sm"
        >
          <ShieldCheck size={18} color="#ffffff" />
          <Text className="text-white font-black text-center ml-2">Acessar Backoffice</Text>
        </TouchableOpacity>
      </View>

      {/* Botão de Logout Real */}
      <TouchableOpacity 
        onPress={() => signOut()}
        className="mt-4 mx-4 p-4 bg-red-50 rounded-2xl flex-row justify-center items-center mb-10"
      >
        <LogOut size={16} color="#ef4444" />
        <Text className="text-red-500 font-bold text-center ml-2">Sair do Aplicativo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}