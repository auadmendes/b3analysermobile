// import { Stack, Redirect } from 'expo-router';
// import { ActivityIndicator, View } from 'react-native';
// import { useUser } from '@/hooks/useUser'; // Importando o seu hook exatamente como você mandou

// export default function AdminLayout() {
//   // Puxa os dados do usuário e o estado de carregamento do seu hook
//   const { user, loading } = useUser();

//   // 1. Se o hook ainda estiver buscando os dados da sessão, mostra um loading na tela
//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
//         <ActivityIndicator color="#4f46e5" size="large" />
//       </View>
//     );
//   }

//   // 2. REGRA DE SEGURANÇA CRÍTICA:
//   // Se não houver usuário logado OU se o usuário não for administrador, barra o acesso.
//   // Dica para o MVP: Você pode validar pelo seu e-mail cadastrado ou pela propriedade role
//   const isUserAdmin = user?.role === 'admin' || user?.email === 'luciano.horta@seuemail.com';

//   if (!user || !isUserAdmin) {
//     // Redireciona o engraçadinho de volta para as abas principais se ele tentar chutar a rota
//     return <Redirect href="/(tabs)" />;
//   }

//   // 3. Se passou pela segurança, renderiza as telas do grupo admin com navegação em Stack
//   return (
//     <Stack>
//       <Stack.Screen 
//         name="reports" 
//         options={{ 
//           title: "Gerenciar Relatórios",
//           headerShown: false # Deixamos false porque criamos nosso próprio header customizado na UI
//         }} 
//       />
//     </Stack>
//   );
// }