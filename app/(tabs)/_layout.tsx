import { Tabs } from 'expo-router';
import { Heart, Home, MessageSquare, Search } from 'lucide-react-native'; // Importamos Heart

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        tabBarActiveTintColor: '#4f46e5', 
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          height: 60,
          paddingBottom: 10,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Carteira',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color }) => <Search size={24} color={color} />,
        }}
      />

      {/* Nova Aba de Favoritos */}
      <Tabs.Screen
        name="favorites" 
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color }) => <Heart size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="chat/index"
        options={{
          title: 'Chat IA',
          tabBarIcon: ({ color }) => <MessageSquare size={24} color={color} />,
        }}
      />


    </Tabs>
  );
}