import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-wagmi-charts';

interface PriceChartProps {
  data: { timestamp: number; value: number }[];
}

export function PriceChart({ data }: PriceChartProps) {
  const screenWidth = Dimensions.get('window').width - 48;

  if (!data || data.length === 0) return null;

  // Lógica de cores e performance
  const firstPrice = data[0].value;
  const lastPrice = data[data.length - 1].value;
  const isPositive = lastPrice >= firstPrice;
  const chartColor = isPositive ? '#10b981' : '#ef4444'; // Verde ou Vermelho

  const values = data.map(d => d.value);
  const minPrice = Math.min(...values);
  const maxPrice = Math.max(...values);
  const variation = (((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2);

  return (
    <View className="bg-white rounded-[32px] p-5 mb-6 border border-slate-100 shadow-sm">
      {/* Header do Gráfico */}
      <View className="flex-row justify-between items-start mb-4">
        <View>
          <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">
            Performance 12M
          </Text>
          <LineChart.PriceText
            style={styles.priceText}
            format={(d) => {
              'worklet';
              return d.value ? `R$ ${parseFloat(d.value).toFixed(2)}` : '';
            }}
          />
        </View>
        
        {/* Badge de Variação */}
        <View style={[styles.badge, { backgroundColor: isPositive ? '#ecfdf5' : '#fef2f2' }]}>
          <Text style={{ color: chartColor, fontWeight: 'bold', fontSize: 10 }}>
            {isPositive ? '▲' : '▼'} {variation}%
          </Text>
        </View>
      </View>

      {/* Gráfico */}
      <LineChart.Provider data={data}>
        <LineChart height={160} width={screenWidth}>
          <LineChart.Path color={chartColor} width={3}>
            <LineChart.Gradient color={chartColor} opacity={0.15} />
          </LineChart.Path>
          
        <LineChart.CursorCrosshair color={chartColor}>
        <LineChart.Tooltip 
            style={{ 
            backgroundColor: chartColor, 
            borderRadius: 12,
            padding: 10,
            // Usamos posicionamento para subir o Tooltip sem precisar da prop yOffset
            top: -80, 
            // Sombras para dar profundidade (ajuste conforme o gosto)
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            elevation: 5, // Importante para Android
            }}
            textStyle={styles.tooltipText}
        />
        </LineChart.CursorCrosshair>
        </LineChart>
      </LineChart.Provider>

      {/* Rodapé com Mín/Máx */}
      <View className="flex-row justify-between mt-4 border-t border-slate-50 pt-4">
        <View>
          <Text className="text-[9px] text-slate-300 font-bold uppercase">Mínima</Text>
          <Text className="text-slate-600 font-bold text-xs">R$ {minPrice.toFixed(2)}</Text>
        </View>
        <View className="items-end">
          <Text className="text-[9px] text-slate-300 font-bold uppercase">Máxima</Text>
          <Text className="text-slate-600 font-bold text-xs">R$ {maxPrice.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  priceText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
  },
  tooltipText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4
  }
});