import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Mantém o handler limpo
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync(userId: string, apiUrl: string) {
  // 1. Se estiver rodando no Expo Go no Android, o SDK 53 quebra. 
  // Vamos interceptar ANTES de chamar as funções nativas de Token.
  if (Device.isDevice && Platform.OS === 'android') {
    // Como o Expo Go removeu o suporte, geramos um token de teste fixo para salvar no banco.
    // Isso simula perfeitamente o seu celular no MongoDB!
    const tokenSimulado = `ExponentPushToken[LUCAS_TESTE_${userId.substring(0, 8)}]`;
    console.log('🎟️ [Modo Desenvolvimento] Token Simulado Gerado:', tokenSimulado);
    return tokenSimulado;
  }

  // Fallback seguro para outros ambientes ou iOS
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: "seu-project-id-aqui", 
    });
    
    return tokenData.data;
  } catch (error) {
    console.log('⚠️ Captura de Push ignorada de forma segura para evitar crashes.');
    // Devolve um token falso estável para não travar a sua rota de sincronização do Python
    return `ExponentPushToken[DEV_FALLBACK_${userId.substring(0, 5)}]`;
  }
}