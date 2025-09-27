import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Image, View } from "react-native";
import { useAuth } from "../../src/providers/AuthProvider";

export default function Layout(){
  const { signOut } = useAuth();
  const onLogout = async () => { try{ await signOut(); } finally { router.replace("/"); } };

  return (
    <Tabs initialRouteName="inicio" screenOptions={{
      headerStyle:{ backgroundColor:"#fff" },
      headerTitle: () => null,
      headerTitleContainerStyle:{ width: 0 },
      headerLeftContainerStyle:{ paddingLeft: 0, marginLeft: 0 }, // sin margen
      headerLeft:() => (
        <View style={{ transform:[{ translateX:-64 }] }}>
          <Image
            source={require("../../assets/mateo-logo.png")}
            style={{ width:270, height:60, resizeMode:"contain" }}
          />
        </View>
      ),
      headerRight:() => (
        <Pressable onPress={onLogout} style={{paddingHorizontal:12}}>
          <Ionicons name="log-out-outline" size={22}/>
        </Pressable>
      ),
      tabBarActiveTintColor:"#111",
      tabBarInactiveTintColor:"#888"
    }}>
      <Tabs.Screen name="inicio"     options={{ title:"Inicio",     tabBarIcon:({color,size})=> <Ionicons name="home-outline"          color={color} size={size}/> }} />
      <Tabs.Screen name="fichas"     options={{ title:"Fichas",     tabBarIcon:({color,size})=> <Ionicons name="document-text-outline" color={color} size={size}/> }} />
      <Tabs.Screen name="lista"      options={{ title:"Precios",    tabBarIcon:({color,size})=> <Ionicons name="pricetags-outline"     color={color} size={size}/> }} />
      <Tabs.Screen name="materiales" options={{ title:"Materiales", tabBarIcon:({color,size})=> <Ionicons name="albums-outline"        color={color} size={size}/> }} />
      <Tabs.Screen name="datos"      options={{ title:"Datos",      tabBarIcon:({color,size})=> <Ionicons name="person-circle-outline" color={color} size={size}/> }} />
    </Tabs>
  );
}