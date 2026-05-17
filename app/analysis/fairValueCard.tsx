import { AlertCircle, Scale } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

interface FairValueProps {
  ticker?: string;    // O '?' evita o erro se o ticker demorar a carregar
  vpa: number; 
  lpa: number; 
  currentPrice: number;
}

export function FairValueCard({ ticker = "", vpa, lpa, currentPrice }: FairValueProps) {
  // 1. Proteção: Detecta se é FII (se ticker for undefined, vira string vazia)
  const safeTicker = ticker || "";
  const isFII = safeTicker.toUpperCase().endsWith('11');

  // 2. Define a lógica de cálculo
  // Para FIIs: Preço Justo = VPA (Patrimonial)
  // Para Ações: Graham = sqrt(22.5 * vpa * lpa)
  const fairValue = isFII 
    ? vpa 
    : Math.sqrt(22.5 * vpa * lpa);

  // 3. Validação de dados (Se for FII, não trava se o LPA for zero)
  const hasMinData = isFII ? vpa > 0 : (vpa > 0 && lpa > 0);

  if (!hasMinData || isNaN(fairValue) || fairValue === 0) {
    return (
      <View className="bg-slate-50 p-6 rounded-[32px] mb-4 border border-dashed border-slate-200 items-center justify-center">
        <View className="flex-row items-center opacity-40">
          <AlertCircle size={14} color="#64748b" />
          <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-2">
            Preço Justo Indisponível
          </Text>
        </View>
        <Text className="text-slate-400 text-[9px] mt-2 text-center px-4">
          {isFII 
            ? "Valor Patrimonial (VP) não encontrado para este fundo." 
            : "Dados de VPA ou LPA insuficientes para calcular Graham."}
        </Text>
      </View>
    );
  }

  const discount = ((fairValue - currentPrice) / fairValue) * 100;
  const isCheap = currentPrice < fairValue;

  return (
    <View className="bg-slate-900 p-6 rounded-[32px] mb-4 shadow-xl shadow-slate-200">
      <View className="flex-row justify-between items-center mb-4">
        <View className="bg-indigo-500/20 p-2 rounded-xl">
          <Scale size={20} color="#818cf8" />
        </View>
        <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
          {isFII ? 'Preço Justo (Patrimonial)' : 'Preço Justo (Graham)'}
        </Text>
      </View>

      <View className="flex-row items-baseline justify-between">
        <Text className="text-white text-3xl font-black">
          R$ {fairValue.toFixed(2)}
        </Text>
        <View className={`px-3 py-1 rounded-full ${isCheap ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
          <Text className={`font-bold text-[10px] ${isCheap ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isCheap ? 'DESCONTO' : 'ÁGIO'} {Math.abs(discount).toFixed(1)}%
          </Text>
        </View>
      </View>

      <Text className="text-slate-500 text-[10px] mt-4 leading-4">
        {isFII 
          ? "* Para FIIs, consideramos o Valor Patrimonial (P/VP = 1.0) como referência justa."
          : "* Fórmula de Graham: sqrt(22,5 × VPA × LPA). Considera P/L até 15 e P/VP até 1,5."}
      </Text>
    </View>
  );
}