import * as Haptics from 'expo-haptics';
import { ArrowRight, Coins, Sparkles } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface SmartInvestmentCardProps {
  userId: string;
  apiUrl: string;
  onSuccess?: () => void; // Caso queira rodar um refresh na carteira depois
}

export function SmartInvestmentCard({ userId, apiUrl, onSuccess }: SmartInvestmentCardProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSimulate = async () => {
    if (!amount || Number(amount) <= 0) {
      alert('Por favor, insira um valor válido para o aporte.');
      return;
    }

    Keyboard.dismiss();
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${apiUrl}/api/portfolio/where-to-invest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          amount: Number(amount)
        })
      });

      const json = await response.json();
      
      if (json.success) {
        setResult(json);
        if (onSuccess) onSuccess();
      } else {
        alert(json.message || 'Não foi possível calcular o aporte no momento.');
      }
    } catch (error) {
      console.error('Erro ao simular aporte:', error);
      alert('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="bg-slate-900 p-6 rounded-[32px] mb-8 shadow-xl shadow-slate-900/20 border border-slate-800">
      {/* Header do Card */}
      <View className="flex-row items-center mb-4">
        <View className="bg-indigo-500/20 p-2 rounded-xl">
          <Sparkles size={18} color="#818cf8" />
        </View>
        <Text className="text-indigo-300 text-[10px] font-black ml-3 uppercase tracking-widest">
          Aportador Inteligente H3B3
        </Text>
      </View>

      <Text className="text-white text-xl font-black mb-2">Onde aportar hoje?</Text>
      <Text className="text-slate-400 text-xs mb-4 leading-4">
        Insira o valor que você tem disponível. Nosso algoritmo cruzará a Fórmula de Graham, o P/VP e o efeito bola de neve para indicar a melhor alocação.
      </Text>

      {/* Input de Valor e Botão */}
      <View className="flex-row items-center bg-slate-800/60 p-2 rounded-2xl border border-slate-700/50 mb-4">
        <View className="pl-3 pr-1 flex-row items-center">
          <Text className="text-slate-400 font-bold text-base">R$</Text>
        </View>
        <TextInput
          className="flex-1 text-white font-black text-lg py-2 px-2"
          placeholder="0,00"
          placeholderTextColor="#64748b"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          editable={!loading}
        />
        <TouchableOpacity 
          onPress={handleSimulate}
          disabled={loading}
          className="bg-indigo-600 p-4 rounded-xl flex-row items-center justify-center"
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <ArrowRight size={18} color="white" />
          )}
        </TouchableOpacity>
      </View>

      {/* --- PAINEL DE RESULTADOS (AGORA COM MAP PARA LISTA DE COMPRAS EM CASCATA) --- */}
      {result && result.allocatedAssets && (
        <View className="mt-4 pt-4 border-t border-slate-800 space-y-4">
          
          <Text className="text-indigo-400 font-bold text-xs px-1 mb-2">
            Sugestão de Distribuição do Aporte:
          </Text>

          {/* Iteração segura sobre o array retornado pelo Python */}
          {(result.allocatedAssets || []).map((asset: any, index: number) => (
            <View key={index} className="bg-slate-800/20 p-4 rounded-2xl border border-slate-800/80 mb-3">
              
              {/* Linha Principal do Ativo */}
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1 mr-2">
                  <View className={`p-2.5 rounded-xl ${asset.type === 'FII' ? 'bg-amber-500/10' : 'bg-indigo-500/10'}`}>
                    <Coins size={16} color={asset.type === 'FII' ? '#fbbf24' : '#818cf8'} />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-white font-black text-lg tracking-tight" numberOfLines={1}>
                      {asset.ticker}
                    </Text>
                    <Text className="text-slate-500 text-[8px] font-bold uppercase tracking-tight">
                      {asset.type === 'FII' ? 'FII' : 'AÇÃO'} • R$ {(asset.totalAllocated || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                </View>

                <View className="items-end">
                  <Text className="text-emerald-400 font-black text-lg">Compre {asset.quantityToBuy} un.</Text>
                  <Text className="text-slate-400 text-[9px] font-medium">
                    {/* 🌟 Corrigido com a propriedade CamelCase do Python e fallback de segurança */}
                    Cotação: R$ {(asset.currentPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>

              {/* Justificativa Humana do Gemini para este Ativo */}
              <View className="bg-slate-800/40 p-3 rounded-xl mt-1">
                <Text className="text-slate-300 text-[11px] italic font-medium leading-4">
                  💡 "{asset.justification}"
                </Text>
              </View>
            </View>
          ))}

          {/* Resumo Geral de Caixa da Operação Completa */}
          <View className="flex-row justify-between px-2 pt-2 border-t border-slate-800/60">
            <View>
              <Text className="text-slate-500 text-[9px] font-bold uppercase">Total Alocado</Text>
              <Text className="text-slate-300 font-bold text-sm">
                R$ {(result.totalAllocated || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-slate-500 text-[9px] font-bold uppercase">Troco Restante</Text>
              <Text className="text-slate-400 font-medium text-sm">
                R$ {(result.leftoverChange || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>

        </View>
      )}
    </View>
  );
}