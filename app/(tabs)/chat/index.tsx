import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Bot, ChevronLeft, Send } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Markdown from 'react-native-markdown-display';

export default function ChatScreen() {
  const { ticker } = useLocalSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState<{ role: 'user' | 'assistant', text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ticker) {
      setChatLog([{ 
        role: 'assistant', 
        text: `Olá! Notei que você está analisando **${ticker}**. Como posso te ajudar com este ativo hoje?` 
      }]);
    } else {
      setChatLog([{ role: 'assistant', text: "Olá! Sou seu assistente **B3 Analyser**. Sobre qual ativo ou estratégia quer conversar?" }]);
    }
  }, [ticker]);

  const sendMessage = async () => {
    if (!message.trim()) return;

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
          user_id: "user_3D02q..." 
        })
      });
      const json = await response.json();
      setChatLog(prev => [...prev, { role: 'assistant', text: json.response }]);
    } catch (error) {
      setChatLog(prev => [...prev, { role: 'assistant', text: "Erro ao conectar. Tente novamente." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-white"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View className="pt-14 pb-4 px-6 border-b border-slate-100 flex-row items-center bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-50 rounded-full mr-4">
          <ChevronLeft size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-slate-900">Chat IA</Text>
      </View>

      <ScrollView 
        className="flex-1 p-4" 
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {chatLog.map((msg, i) => (
          <View key={i} className={`mb-6 flex-row ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <View className="bg-indigo-600 w-8 h-8 rounded-full items-center justify-center mr-2 mt-1">
                <Bot size={16} color="white" />
              </View>
            )}
            
            <View className={`max-w-[85%] p-4 rounded-3xl ${
              msg.role === 'user' 
                ? 'bg-indigo-600 rounded-tr-none' 
                : 'bg-slate-100 rounded-tl-none border border-slate-200'
            }`}>
              {msg.role === 'assistant' ? (
                <Markdown style={markdownStyles}>
                  {msg.text}
                </Markdown>
              ) : (
                <Text className="text-white leading-5 font-medium">
                  {msg.text}
                </Text>
              )}
            </View>
          </View>
        ))}
        {loading && (
           <View className="flex-row items-center ml-10 mb-4">
              <Text className="text-slate-400 italic text-xs">O agente está analisando...</Text>
           </View>
        )}
      </ScrollView>

      {/* Input Section */}
      <View className="p-4 border-t border-slate-100 flex-row items-center bg-white pb-8">
        <TextInput
          className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 mr-3 text-slate-900"
          placeholder="Digite sua dúvida..."
          placeholderTextColor="#94a3b8"
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity 
          onPress={sendMessage} 
          className="bg-indigo-600 p-4 rounded-2xl shadow-md shadow-indigo-200"
        >
          <Send size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// Estilos do Markdown corrigidos para TypeScript
const markdownStyles = StyleSheet.create({
  body: {
    color: '#334155',
    fontSize: 15,
    lineHeight: 22,
  },
  strong: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  heading3: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 5,
    color: '#4f46e5',
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 8,
  },
  bullet_list: {
    marginBottom: 8,
  },
  list_item: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 4,
  },
  bullet_list_icon: {
    color: '#4f46e5',
    fontSize: 15,
    fontWeight: 'bold',
  }
});