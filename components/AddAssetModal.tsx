import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

// 1. Definindo a Interface para as Props
interface AddAssetModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (quantity: number, price: number) => void;
  ticker: string;
  loading: boolean;
}

// 2. Aplicando a interface ao componente
export function AddAssetModal({ 
  isVisible, 
  onClose, 
  onConfirm, 
  ticker, 
  loading 
}: AddAssetModalProps) {
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  // Função interna para validar antes de confirmar
  const handlePress = () => {
    const qtyNum = parseFloat(quantity.replace(',', '.'));
    const priceNum = parseFloat(price.replace(',', '.'));

    if (isNaN(qtyNum) || isNaN(priceNum)) {
      // Você pode adicionar um aviso aqui se quiser
      return;
    }

    onConfirm(qtyNum, priceNum);
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-[40px] p-8 pb-12 shadow-2xl">
          {/* Header do Modal */}
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-2xl font-black text-slate-900">Adicionar à Carteira</Text>
              <Text className="text-indigo-600 font-bold">{ticker}</Text>
            </View>
            <TouchableOpacity 
              onPress={onClose} 
              className="p-2 bg-slate-100 rounded-full"
            >
              <X size={20} color="#0f172a" />
            </TouchableOpacity>
          </View>

          {/* Campo Quantidade */}
          <Text className="text-slate-500 font-bold mb-2 ml-1">Quantidade</Text>
          <TextInput
            className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4 text-lg font-bold text-slate-900"
            placeholder="Ex: 100"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />

          {/* Campo Preço */}
          <Text className="text-slate-500 font-bold mb-2 ml-1">Preço Médio (R$)</Text>
          <TextInput
            className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-8 text-lg font-bold text-slate-900"
            placeholder="Ex: 12.50"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />

          {/* Botão de Confirmação */}
          <TouchableOpacity 
            onPress={handlePress}
            disabled={loading || !quantity || !price}
            className={`p-5 rounded-2xl flex-row justify-center items-center ${
              loading || !quantity || !price ? 'bg-slate-300' : 'bg-indigo-600'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-black text-lg">Confirmar Lançamento</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}