import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

export default function EmptyState() {
  const { id } = useLocalSearchParams(); // Pega o ticker da URL (ex: BBAS3)

  return (
    <View className="flex-1 bg-white p-6 pt-12">
      <Text className="text-slate-500">Empty.</Text>
    </View>
  );
}