import { useUser } from '@clerk/clerk-expo';
import * as Clipboard from 'expo-clipboard'; // Importação do Clipboard
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Bot, ChevronLeft, Copy, Send } from 'lucide-react-native'; // Importei o ícone Copy
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import Toast from 'react-native-toast-message'; // Para avisar que copiou

export default function ChatScreen() {
  const { ticker } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUser();
  
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState<{ role: 'user' | 'assistant', text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // --- FUNÇÃO PARA COPIAR ---
  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Toast.show({
      type: 'success',
      text1: 'Copiado!',
      text2: 'Mensagem copiada para a área de transferência.',
      position: 'bottom',
      bottomOffset: 120
    });
  };

  // Listeners do teclado (Mantidos)
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    const initialText = ticker 
      ? `Olá! Notei que você está analisando **${ticker}**. Como posso te ajudar hoje?` 
      : "Olá! Sou seu assistente **B3 Analyser**. No que posso ajudar?";
    setChatLog([{ role: 'assistant', text: initialText }]);
  }, [ticker]);

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

const sendMessage = async () => {
    if (!message.trim() || loading) return;
    
    const userMsg = message;
    setChatLog(prev => [...prev, { role: 'user', text: userMsg }]);
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: ticker ? `[CONTEXTO: ${ticker}] ${userMsg}` : userMsg,
          // ALTERAÇÃO AQUI: Usando o ID real do usuário logado no Clerk
          user_id: user?.id || "anonimo" 
        })
      });

      const json = await response.json();
      setChatLog(prev => [...prev, { role: 'assistant', text: json.response }]);
    } catch (error) {
      setChatLog(prev => [...prev, { role: 'assistant', text: "Erro na conexão. Tente novamente." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="pt-14 pb-4 px-6 border-b border-slate-100 flex-row items-center bg-white shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-50 rounded-full mr-4">
          <ChevronLeft size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-slate-900">Chat B3</Text>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 px-4" 
        contentContainerStyle={{ paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
      >
        {chatLog.map((msg, i) => (
          <View key={i} className={`mb-6 flex-row ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <View className="bg-indigo-600 w-8 h-8 rounded-full items-center justify-center mr-2 mt-1">
                <Bot size={16} color="white" />
              </View>
            )}
            
            {/* TouchableOpacity para permitir clicar e copiar */}
            <TouchableOpacity 
              activeOpacity={0.8}
              onLongPress={() => copyToClipboard(msg.text)} // COPIA NO CLIQUE LONGO
              className={`max-w-[85%] p-4 rounded-3xl ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 rounded-tr-none' 
                  : 'bg-slate-100 rounded-tl-none border border-slate-200'
              }`}
            >
              {msg.role === 'assistant' ? (
                <Markdown style={markdownStyles}>{msg.text}</Markdown>
              ) : (
                <Text className="text-white leading-5 font-medium">{msg.text}</Text>
              )}
              
              {/* Indicador discreto de que é possível copiar */}
              {msg.role === 'assistant' && (
                <View className="flex-row justify-end mt-2 opacity-20">
                  <Copy size={10} color="#64748b" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        ))}

        {loading && (
          <View className="flex-row items-center ml-10 mb-6">
            <ActivityIndicator size="small" color="#4f46e5" />
            <Text className="text-slate-400 italic text-xs ml-3 font-medium">Analisando...</Text>
          </View>
        )}
      </ScrollView>

      <View style={{ 
          marginBottom: Platform.OS === 'android' ? keyboardHeight : 0,
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9'
      }}>
        <View className="p-4 flex-row items-end">
          <TextInput
            className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 mr-3 text-slate-900 max-h-32"
            placeholder="Digite sua dúvida..."
            placeholderTextColor="#94a3b8"
            value={message}
            onChangeText={setMessage}
            multiline
            onFocus={() => setTimeout(scrollToBottom, 200)}
          />
          <TouchableOpacity 
            onPress={sendMessage} 
            disabled={loading || !message.trim()}
            className={`p-4 rounded-2xl shadow-md ${message.trim() ? 'bg-indigo-600' : 'bg-slate-200'}`}
          >
            <Send size={20} color={message.trim() ? 'white' : '#94a3b8'} />
          </TouchableOpacity>
        </View>
        {keyboardHeight === 0 && <View style={{ height: Platform.OS === 'ios' ? 30 : 10 }} />}
      </View>
    </View>
  );
}

const markdownStyles = StyleSheet.create({
  body: { color: '#334155', fontSize: 15, lineHeight: 22 },
  strong: { fontWeight: 'bold', color: '#0f172a' },
  heading3: { fontSize: 17, fontWeight: '800', marginTop: 10, marginBottom: 5, color: '#4f46e5' },
  paragraph: { marginTop: 0, marginBottom: 8 },
  bullet_list: { marginBottom: 8 },
  list_item: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 4 },
});