import { useRef, useState } from "react";
import { View, Text, Image, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useAuth } from "../../src/providers/AuthProvider";
import logo from "../../assets/mateo-logo.png";

// Rojo Mateo (aprox Pantone 485)
const BRAND = "#DA291C";

export default function Login(){
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [busy,  setBusy]  = useState(false);
  const [show,  setShow]  = useState(false);
  const passRef = useRef(null);

  if (!loading && user) return <Redirect href="/(app)/inicio" />;

  const doLogin = async () => {
    if (!email.trim() || !pass) return;
    try { setBusy(true); await signInWithEmailAndPassword(auth, email.trim(), pass); }
    catch (e) { alert(e.message); }
    finally { setBusy(false); }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex:1, backgroundColor:"#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow:1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flex:1, paddingHorizontal:24, paddingTop:32, paddingBottom:24, justifyContent:"center" }}>
          {/* Logo centrado y tamaño cómodo */}
          <Image source={logo} resizeMode="contain"
            style={{ alignSelf:"center", width:260, height:96, marginBottom:28 }} />

          {/* Inputs */}
          <Text style={{ fontSize:13, color:"#6B7280", marginBottom:6 }}>Email</Text>
          <TextInput
            placeholder="tu@email.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={()=>passRef.current?.focus()}
            style={{
              backgroundColor:"#fff", borderWidth:1, borderColor:"#E5E7EB",
              borderRadius:12, paddingVertical:12, paddingHorizontal:12, marginBottom:14
            }}
          />

          <Text style={{ fontSize:13, color:"#6B7280", marginBottom:6 }}>Contraseña</Text>
          <View style={{
            flexDirection:"row", alignItems:"center",
            backgroundColor:"#fff", borderWidth:1, borderColor:"#E5E7EB",
            borderRadius:12, paddingHorizontal:10, marginBottom:18
          }}>
            <TextInput
              ref={passRef}
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              value={pass}
              onChangeText={setPass}
              secureTextEntry={!show}
              returnKeyType="go"
              onSubmitEditing={doLogin}
              style={{ flex:1, paddingVertical:12 }}
            />
            <Pressable onPress={()=>setShow(s=>!s)} style={{ padding:6 }}>
              <Ionicons name={show ? "eye-off-outline" : "eye-outline"} size={20} color="#6B7280" />
            </Pressable>
          </View>

          {/* Botón principal */}
          <Pressable onPress={doLogin} disabled={busy}
            style={{
              paddingVertical:16, borderRadius:14,
              backgroundColor: busy ? "#EF9A9A" : BRAND, opacity: busy?0.9:1
            }}>
            {busy
              ? <ActivityIndicator color="#fff" />
              : <Text style={{ color:"#fff", textAlign:"center", fontSize:16, fontWeight:"800" }}>Ingresar</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}