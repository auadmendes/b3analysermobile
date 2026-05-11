import { Text, View } from 'react-native';

interface Props {
  title: string;
  value: string;
  label: string;
}

export default function IndicatorCard({ title, value, label }: Props) {
  return (
    <View className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm w-full h-28 justify-center">
      <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter" numberOfLines={1}>
        {title}
      </Text>
      <Text className="text-xl font-black text-slate-900 my-0.5" numberOfLines={1}>
        {value}
      </Text>
      <Text className="text-[10px] text-indigo-600 font-bold" numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}