import { Tabs } from 'expo-router';
import { Home, MessageSquare, Search, StarIcon } from 'lucide-react-native'; // Importamos Heart

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
          title: "Favoritos",
          tabBarActiveTintColor: "#eab308",
          tabBarInactiveTintColor: "#9ca3af",

          tabBarIcon: ({ focused, color }) => (
            <StarIcon
              size={24}
              color={focused ? "#eab308" : "#9ca3af"}
              fill={focused ? "#eab308" : "transparent"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="chat/index"
        options={{
          title: 'Chat IA',
          tabBarIcon: ({ color }) => <MessageSquare size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat/sessions"        
        options={{
          href: null, // Esconde esta aba da barra de navegação
        }}
      />
      <Tabs.Screen
        name="profile/dashboard"        
        options={{
          href: null, // Esconde esta aba da barra de navegação
        }}
      />
      <Tabs.Screen
        name="profile/reports"        
        options={{
          href: null, // Esconde esta aba da barra de navegação
        }}
      />
      <Tabs.Screen
        name="profile/tickers"        
        options={{
          href: null, // Esconde esta aba da barra de navegação
        }}
      />
      <Tabs.Screen
        name="profile/index"        
        options={{
          href: null, // Esconde esta aba da barra de navegação
        }}
      />


    </Tabs>
  );
}