// import { useRouter } from 'expo-router';
// import React from 'react';
// import { Alert, Text, TouchableOpacity } from 'react-native';

// export default function AdminAccessButton() {
//   const router = useRouter();

//   const acessarPainelAdmin = () => {
//     Alert.prompt(
//       "Área Restrita",
//       "Digite a senha master de administrador:",
//       [
//         { text: "Cancelar", style: "cancel" },
//         {
//           text: "Entrar",
//           onPress: (senha) => {
//             if (senha === "luciano123") {
//               router.push("/admin/reports");
//             } else {
//               Alert.alert("Erro", "Senha incorreta. Acesso negado!");
//             }
//           }
//         }
//       ],
//       "secure-text"
//     );
//   };

//   return (
//     <TouchableOpacity 
//       onPress={acessarPainelAdmin} 
//       className="p-4 bg-slate-100 rounded-2xl mt-4 border border-slate-200"
//     >
//       <Text className="text-slate-700 font-black text-center">Acessar Backoffice</Text>
//     </TouchableOpacity>
//   );
// }