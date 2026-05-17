import { useUser } from '@clerk/clerk-expo';
import * as Clipboard from 'expo-clipboard';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Bot, ChevronLeft, History, PlusCircle, Send } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import Toast from 'react-native-toast-message';

export default function ChatScreen() {
  const { ticker, sessionId: paramSessionId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUser();
  
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState<{ role: 'user' | 'assistant', text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const handleNewChat = () => {
    setMessage('');
    setSessionId(null);
    router.setParams({ sessionId: '' });

    const initialText = ticker 
      ? `Olá! Notei que você está analisando **${ticker}**. Como posso te ajudar hoje?` 
      : "Olá! Sou seu assistente **B3 Analyser**. No que posso ajudar?";
    setChatLog([{ role: 'assistant', text: initialText }]);
    
    Toast.show({ type: 'info', text1: 'Nova conversa iniciada' });
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Toast.show({ type: 'success', text1: 'Copiado!', position: 'bottom', bottomOffset: 120 });
  };

  const loadHistory = async (id: string) => {
    if (!id) return;
    setFetchingHistory(true);
    try {
      const response = await fetch(`${API_URL}/chat/history/${id}`);
      const json = await response.json();
      if (json.success && json.history) {
        setChatLog(json.history.map((m: any) => ({ 
          role: m.role, 
          text: typeof m.content === 'string' ? m.content : "Conteúdo inválido." 
        })));
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Erro ao carregar histórico' });
    } finally {
      setFetchingHistory(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setChatLog([]);
      
      if (paramSessionId) {
        setSessionId(paramSessionId as string);
        loadHistory(paramSessionId as string);
      } else {
        setSessionId(null);
        const initialText = ticker 
          ? `Olá! Notei que você está analisando **${ticker}**. Como posso te ajudar hoje?` 
          : "Olá! Sou seu assistente **B3 Analyser**. No que posso ajudar?";
        setChatLog([{ role: 'assistant', text: initialText }]);
      }
    }, [paramSessionId, ticker])
  );

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

  const sendMessage = async () => {
    if (!message.trim() || loading) return;
    
    const userMsg = message;
    setChatLog(prev => [...prev, { role: 'user', text: userMsg }]);
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: ticker && chatLog.length < 2 ? `[CONTEXTO: ${ticker}] ${userMsg}` : userMsg,
          user_id: user?.id || "anonimo",
          session_id: sessionId || null
        })
      });

      if (!response.ok) {
        throw new Error("Resposta do servidor com erro 500 ou 404.");
      }

      const json = await response.json();
      if (json.session_id && !sessionId) setSessionId(json.session_id);
      
      // Garante que o texto injetado seja uma string válida
      const aiResponseText = json.response && typeof json.response === 'string' 
        ? json.response 
        : "Não consegui processar essa análise. Tente novamente.";

      setChatLog(prev => [...prev, { role: 'assistant', text: aiResponseText }]);
    } catch (error) {
      setChatLog(prev => [...prev, { role: 'assistant', text: "Erro ao conectar com o analista. Verifique seu servidor Python." }]);
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
        <View className="flex-1">
          <Text className="text-xl font-black text-slate-900">Chat Inteligente</Text>
          {ticker && <Text className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">{ticker}</Text>}
        </View>
        
        <TouchableOpacity onPress={handleNewChat} className="p-2 mr-2">
           <PlusCircle size={22} color="#4f46e5" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/chat/sessions')} className="p-2">
           <History size={22} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 px-4" 
        contentContainerStyle={{ paddingVertical: 20 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {fetchingHistory ? (
          <ActivityIndicator color="#4f46e5" className="mt-10" />
        ) : (
          chatLog.map((msg, i) => (
            <View key={i} className={`mb-6 flex-row ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <View className="bg-indigo-600 w-8 h-8 rounded-full items-center justify-center mr-2 mt-1">
                  <Bot size={16} color="white" />
                </View>
              )}
              <TouchableOpacity 
                activeOpacity={0.8}
                onLongPress={() => copyToClipboard(msg.text)}
                className={`max-w-[85%] p-4 rounded-3xl ${
                  msg.role === 'user' ? 'bg-indigo-600 rounded-tr-none' : 'bg-slate-100 rounded-tl-none border border-slate-200'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <Markdown style={markdownStyles}>
                    {typeof msg.text === 'string' ? msg.text : "Erro visual de dados."}
                  </Markdown>
                ) : (
                  <Text className="text-white leading-5 font-medium">
                    {typeof msg.text === 'string' ? msg.text : ""}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ))
        )}
        {loading && <ActivityIndicator size="small" color="#4f46e5" className="ml-10 mb-6" />}
      </ScrollView>

      <View style={{ marginBottom: Platform.OS === 'android' ? keyboardHeight : 0 }}>
        <View className="p-4 flex-row items-end border-t border-slate-100 bg-white">
          <TextInput
            className="flex-1 bg-slate-50 p-4 rounded-2xl text-slate-900 max-h-32"
            placeholder="Digite aqui..."
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity onPress={sendMessage} className="ml-3 p-4 bg-indigo-600 rounded-2xl shadow-md">
            <Send size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const markdownStyles = StyleSheet.create({
  body: { color: '#334155', fontSize: 15, lineHeight: 22 },
  strong: { fontWeight: 'bold', color: '#0f172a' },
  heading3: { fontSize: 17, fontWeight: '800', marginTop: 10, color: '#4f46e5' },
});