import React, { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

interface WalletChartProps {
  assets: any[];
  totalInvested: number;
}

export function WalletChart({ assets, totalInvested }: WalletChartProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const chartData = useMemo(() => {
    if (!assets || assets.length === 0) return [];

    const grouped = assets.reduce((acc: any, asset: any) => {
      const isFII = asset.type === 'FII' || asset.type === 'FUNDO_IMOBILIARIO';
      const label = isFII ? 'FIIs' : 'Ações';
      const value = (Number(asset.quantity) || 0) * (Number(asset.averagePrice) || 0);
      
      acc[label] = (acc[label] || 0) + value;
      return acc;
    }, {});

    const data = [];
    
    if (grouped['Ações']) {
      data.push({ 
        value: grouped['Ações'], 
        color: '#4f46e5', // Indigo 600 (Cor principal)
        gradientCenterColor: '#818cf8', // Indigo 400 (Cor do centro/brilho)
        label: 'Ações',
        focused: selectedIndex === 0,
      });
    }

    if (grouped['FIIs']) {
      data.push({ 
        value: grouped['FIIs'], 
        color: '#10b981', // Emerald 500
        gradientCenterColor: '#6ee7b7', // Emerald 300
        label: 'FIIs',
        focused: selectedIndex === (grouped['Ações'] ? 1 : 0),
      });
    }

    return data;
  }, [assets, selectedIndex]);

  if (assets.length === 0) return null;

  return (
    <View className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 mb-8 items-center shadow-sm">
      <View className="flex-row justify-between w-full mb-8 items-center">
        <Text className="text-slate-900 font-black text-[10px] uppercase tracking-[2px]">Alocação por Classe</Text>
        <View className="flex-row">
          {chartData.map((item, index) => (
            <View key={index} className="flex-row items-center ml-3">
              <View className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: item.color }} />
              <Text className="text-slate-500 text-[10px] font-bold">{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <PieChart
        data={chartData}
        donut
        //showGradient // Ativa o suporte a gradiente
        sectionAutoFocus
        radius={85}
        innerRadius={65}
        innerCircleColor={'#f8fafc'} 
        onPress={(_item: any, index: number) => {
          setSelectedIndex(index);
        }}
        centerLabelComponent={() => {
          const selectedItem = chartData[selectedIndex] || chartData[0];
          const percentage = totalInvested > 0 
            ? ((selectedItem.value / totalInvested) * 100).toFixed(0) 
            : 0;

          return (
            <View className="justify-center items-center">
              <Text className="text-slate-900 font-black text-2xl">{percentage}%</Text>
              <Text className="text-slate-400 text-[10px] font-black uppercase tracking-tighter">
                {selectedItem?.label}
              </Text>
            </View>
          );
        }}
      />

      <View className="flex-row justify-around mt-8 w-full border-t border-slate-200/50 pt-6">
        {chartData.map((item, index) => {
          const isSelected = selectedIndex === index;
          const percentage = totalInvested > 0 ? ((item.value / totalInvested) * 100).toFixed(1) : 0;
          
          return (
            <TouchableOpacity 
              key={index} 
              onPress={() => {
                requestAnimationFrame(() => {
                  setSelectedIndex(index);
                });
              }}
              className="flex-row items-center px-4 py-2 rounded-2xl"
              style={isSelected ? { 
                backgroundColor: 'white', 
                elevation: 2, 
                shadowColor: '#000', 
                shadowOffset: { width: 0, height: 1 }, 
                shadowOpacity: 0.1, 
                shadowRadius: 2 
              } : {}}
            >
              <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
              <View>
                <Text 
                  className="text-[10px] font-black" 
                  style={{ color: isSelected ? '#0f172a' : '#94a3b8' }}
                >
                  {item.label}
                </Text>
                <Text className="text-[10px] font-bold text-slate-400">{percentage}%</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}