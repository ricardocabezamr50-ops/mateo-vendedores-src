import { Tabs, router } from "expo-router";
import { Image, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "../../src/providers/AuthProvider";

const LogoTitle = () => (
  <Image
    source={require("../../assets/logo-mateo.png")}
    style={{ width: 28, height: 28 }}
    resizeMode="contain"
  />
);

export default function Layout() {
  const { signOut } = useAuth();
  const onLogout = async () => { try { await signOut(); } finally { router.replace("/"); } };

  return (
    <Tabs
      initialRouteName="inicio"
      screenOptions={{
        headerTitle: () => <LogoTitle />,
        tabBarActiveTintColor: "#0A84FF",
        tabBarInactiveTintColor: "#98A2B3",
        headerRight: () => (
          <Pressable onPress={onLogout} style={{ paddingHorizontal: 12 }}>
            <Ionicons name="log-out-outline" size={22} />
          </Pressable>
        ),
      }}
    >
      {/* Orden explícito de las pestañas */}
      <Tabs.Screen
        name="inicio"
        options={{
          title: "Inicio",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="lista"
        options={{
          title: "Lista",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name={focused ? "list" : "list-outline"} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="fichas"
        options={{
          title: "Fichas",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name={focused ? "document-text" : "document-text-outline"} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="materiales"
        options={{
          title: "Materiales",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name={focused ? "cube" : "cube-outline"} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
