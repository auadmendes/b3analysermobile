import { Infinity, Wallet } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

interface MagicNumberProps {
  ticker: string;
  currentPrice: number;
  lastDividend: number;
}

export function MagicNumberCard({ ticker, currentPrice, lastDividend }: MagicNumberProps) {
  // 1. Cálculo do número de cotas
  const magicNumber = Math.ceil(currentPrice / lastDividend);
  
  // 2. Cálculo do investimento total necessário
  const totalInvestment = magicNumber * currentPrice;
  
  if (!lastDividend || lastDividend <= 0) return null;

  return (
    <View className="bg-indigo-600 p-6 rounded-[32px] mb-4 shadow-xl shadow-indigo-200">
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <Infinity size={20} color="white" />
        <Text className="text-white/70 text-[10px] font-black uppercase ml-2 tracking-widest">
          Magic Number - {ticker}
        </Text>
      </View>

      {/* Quantidade de Cotas */}
      <View className="mb-4">
        <Text className="text-white text-4xl font-black mb-1">
          {magicNumber} <Text className="text-lg">cotas</Text>
        </Text>
        <Text className="text-indigo-100 text-[11px] leading-5 font-medium">
          Com essa quantidade, o dividendo de <Text className="font-black">R$ {(magicNumber * lastDividend).toFixed(2)}</Text> compra uma nova cota mensalmente.
        </Text>
      </View>

      {/* Divisor sutil */}
      <View className="h-[1px] bg-white/10 w-full mb-4" />

      {/* Investimento Necessário */}
      <View className="flex-row items-center justify-between bg-black/10 p-4 rounded-2xl">
        <View className="flex-row items-center">
          <Wallet size={16} color="#c7d2fe" />
          <Text className="text-indigo-100 text-[10px] font-bold uppercase ml-2">Custo do Objetivo</Text>
        </View>
        <Text className="text-white font-black text-base">
          R$ {totalInvestment.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      </View>

      <Text className="text-indigo-200/50 text-[9px] mt-3 italic text-center">
        * Baseado no último dividendo pago e preço atual de mercado.
      </Text>
    </View>
  );
}