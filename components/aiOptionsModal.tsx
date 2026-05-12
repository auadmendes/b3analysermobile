import { Sparkles, X } from 'lucide-react-native';
import React from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

interface AiOptionsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (focus: string, message: string) => void;
  title: string;
  loading?: boolean;
}

const FOCUS_OPTIONS = ['Dividendos', 'Crescimento', 'Diversificação', 'Riscos', 'Geral'];

export function AiOptionsModal({ isVisible, onClose, onConfirm, title, loading }: AiOptionsModalProps) {
  const [focus, setFocus] = React.useState('Geral');
  const [message, setMessage] = React.useState('');

  const handleConfirm = () => {
    onConfirm(focus, message);
    setMessage(''); // Limpa para a próxima vez
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white p-8 rounded-t-[48px] shadow-2xl">
              <View className="w-12 h-1.5 bg-slate-200 rounded-full self-center mb-6" />
              
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-black text-slate-900">{title}</Text>
                <TouchableOpacity onPress={onClose} className="p-2 bg-slate-100 rounded-full">
                  <X size={20} color="#64748b" />
                </TouchableOpacity>
              </View>

              <Text className="text-slate-400 font-black text-[10px] uppercase mb-3 ml-1 tracking-widest">
                Selecione o Foco
              </Text>
              
              <View className="flex-row flex-wrap mb-6">
                {FOCUS_OPTIONS.map((opt) => (
                  <TouchableOpacity 
                    key={opt}
                    onPress={() => setFocus(opt)}
                    className={`mr-2 mb-2 px-5 py-2.5 rounded-full border ${
                      focus === opt ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'
                    }`}
                  >
                    <Text className={`font-bold text-sm ${focus === opt ? 'text-white' : 'text-slate-500'}`}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="text-slate-400 font-black text-[10px] uppercase mb-2 ml-1 tracking-widest">
                Instruções para a IA (Opcional)
              </Text>
              <TextInput 
                placeholder="Ex: Vale a pena investir mais neste setor?"
                placeholderTextColor="#94a3b8" // Cor do placeholder mais suave (slate-400)
                className="bg-slate-50 p-5 rounded-3xl border border-slate-100 text-slate-900 mb-8"
                
                // Propriedades que transformam em Textarea:
                multiline={true} 
                numberOfLines={4} // Aumentei para 4 para dar mais área visual
                textAlignVertical="top" // Garante que o texto comece no topo (essencial no Android)
                
                // Melhorias de UX:
                blurOnSubmit={true} // Fecha o teclado ao dar "Enter" (opcional)
                style={{ minHeight: 120 }} // Garante uma altura mínima fixa independente do número de linhas
                
                value={message}
                onChangeText={setMessage}
              />

              <TouchableOpacity 
                onPress={handleConfirm}
                disabled={loading}
                className="bg-indigo-600 p-6 rounded-[28px] flex-row justify-center items-center shadow-lg shadow-indigo-100"
              >
                <Sparkles size={20} color="white" />
                <Text className="text-white font-black text-lg ml-3">
                  {loading ? 'Processando...' : 'Gerar Análise'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={onClose} className="mt-4 pb-4">
                <Text className="text-slate-400 text-center font-bold">Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}