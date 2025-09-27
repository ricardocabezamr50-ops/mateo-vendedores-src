import { View, Text } from "react-native";
import Constants from "expo-constants";
export default function Screen() {
  return (
    <View style={{ flex:1, backgroundColor:"#fff", padding:16 }}>
      <Text style={{ fontSize:22, fontWeight:"800", marginBottom:8 }}>Datos personales</Text>
      <Text>Usuario logueado: (pendiente Auth)</Text>
      <Text style={{ marginTop:12, color:"#777" }}>App ID: {Constants.expoConfig?.slug}</Text>
    </View>
  );
}
