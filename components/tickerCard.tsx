import { useRouter } from 'expo-router';
import { ChevronRight, TrendingDown, TrendingUp, Wallet } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';

interface TickerCardProps {
  ticker: string;
  name?: string;
  quantity?: number;
  price?: number;
  variation?: number; // Ex: 1.5 para +1.5%
}

export default function TickerCard({ ticker, name, quantity, price, variation = 0 }: TickerCardProps) {
  const router = useRouter();
  const isPositive = variation >= 0;
  const isFII = ticker.includes('11');

  return (
    <TouchableOpacity
      onPress={() => 
        router.push({
            pathname: "/ticker/[id]",
            params: { id: ticker }
        })
      }
      activeOpacity={0.7}
      className="bg-white p-4 rounded-3xl flex-row justify-between items-center shadow-sm border border-slate-100 mb-3"
    >
      <View className="flex-row items-center flex-1">
        {/* Ícone Lateral */}
        <View className={`p-3 rounded-2xl mr-4 ${isFII ? 'bg-orange-100' : 'bg-indigo-100'}`}>
          <Wallet size={20} color={isFII ? '#f97316' : '#4f46e5'} />
        </View>

        {/* Textos Principais */}
        <View className="flex-1">
          <Text className="text-xl font-black text-slate-900">{ticker}</Text>
          <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest" numberOfLines={1}>
            {isFII ? 'Fundo Imobiliário' : 'Ação B3'}
          </Text>
        </View>
      </View>

      {/* Valores e Indicador de Tendência */}
      <View className="flex-row items-center">
        <View className="items-end mr-3">
          <Text className="text-lg font-bold text-slate-900">
            {quantity ? `${quantity} un.` : `R$ ${price?.toFixed(2)}`}
          </Text>
          
          <View className="flex-row items-center">
            {isPositive ? (
              <TrendingUp size={12} color="#10b981" />
            ) : (
              <TrendingDown size={12} color="#ef4444" />
            )}
            <Text className={`text-xs font-bold ml-1 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{variation}%
            </Text>
          </View>
        </View>
        
        <ChevronRight size={18} color="#cbd5e1" />
      </View>
    </TouchableOpacity>
  );
}