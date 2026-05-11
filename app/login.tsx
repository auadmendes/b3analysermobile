import { useSSO } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback } from "react";
import { Text, TouchableOpacity, View } from "react-native";

// Importante para fechar o navegador após o login
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const onGooglePress = useCallback(async () => {
    try {
      // Inicia o fluxo de login com Google
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err) {
      console.error("Erro no login social:", err);
    }
  }, []);

  return (
    <View className="flex-1 bg-white p-8 justify-center items-center">
      <Text className="text-4xl font-black text-slate-900 mb-2">Bem-vindo</Text>
      <Text className="text-slate-500 mb-10 text-center">
        Analise sua carteira da B3 com inteligência artificial.
      </Text>

      {/* Botão Estilo Google */}
      <TouchableOpacity 
        onPress={onGooglePress}
        className="flex-row items-center justify-center bg-white border border-slate-200 w-full p-4 rounded-2xl shadow-sm mb-4"
      >
        {/* Aqui você pode colocar um ícone do Google */}
        <Text className="text-slate-700 font-bold text-lg ml-2">
          Continuar com Google
        </Text>
      </TouchableOpacity>

      {/* Seu formulário de email/senha antigo pode continuar aqui embaixo */}
    </View>
  );
}