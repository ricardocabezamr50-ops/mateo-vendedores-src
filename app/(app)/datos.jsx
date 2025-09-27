import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, FlatList, Alert, ActivityIndicator } from "react-native";
import * as Linking from "expo-linking";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { ref, getDownloadURL, listAll } from "firebase/storage";
import { storage, db } from "../../firebase/config";
import { useAuth } from "../../src/providers/AuthProvider";
import { Screen, H1, Card, P, PrimaryButton } from "../../src/components/ui";
import { doc, getDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

export default function Datos(){
  const { user, signOut } = useAuth();
  const [mineUrl, setMineUrl] = useState(null);
  const [all, setAll] = useState([]);
  const [role, setRole] = useState(null);
  const [level, setLevel] = useState(null);
  const [busy, setBusy] = useState(false);

  // Rol/Nivel desde Firestore
  useEffect(()=>{ (async()=>{
    try{
      if (!user?.uid) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()){
        const d = snap.data();
        setRole(d?.role ?? null);
        setLevel(d?.level ?? null);
      }
    }catch(e){ /* ignorar */ }
  })(); }, [user?.uid]);

  const isAdmin = useMemo(()=>{
    if ((role||"").toLowerCase() === "admin") return true;
    if (Number(level) >= 3) return true;
    return false;
  }, [role, level]);

  // Cargar tarjeta propia y (si admin) todas
  useEffect(()=>{ (async()=>{
    try{
      if (!user?.uid) return;

      // Mi PDF
      try {
        const myRef = ref(storage, `tarjetas/${user.uid}.pdf`);
        const u = await getDownloadURL(myRef);
        setMineUrl(u);
      } catch {
        setMineUrl(null);
      }

      // Admin: listar
      if (isAdmin){
        try{
          const dir = ref(storage, "tarjetas");
          const { items } = await listAll(dir);
          const rows = await Promise.all(items.map(async it => ({
            name: it.name,
            url: await getDownloadURL(it)
          })));
          setAll(rows);
        }catch(e){
          // si hubiera problema de permisos, mostrar un aviso suave
          console.log("Admin list tarjetas:", e?.code || e?.message);
        }
      } else {
        setAll([]);
      }
    }catch(e){
      Alert.alert("Datos", e.message || String(e));
    }
  })(); }, [user?.uid, isAdmin]);

  const openUrl = (u) => Linking.openURL(u);

  const downloadAndShare = async (url, filename = "tarjeta.pdf") => {
    try{
      setBusy(true);
      const dest = FileSystem.documentDirectory + filename;
      const { uri } = await FileSystem.downloadAsync(url, dest);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("Descarga", "Archivo guardado en: " + uri);
      }
    }catch(e){
      Alert.alert("Compartir", e.message || String(e));
    }finally{
      setBusy(false);
    }
  };

  const Toolbar = ({ url, filename }) => (
    <View style={{ flexDirection:"row", gap:18, marginTop:10 }}>
      <Pressable onPress={()=>openUrl(url)}><Ionicons name="eye-outline" size={22} /></Pressable>
      <Pressable onPress={()=>downloadAndShare(url, filename)}><Ionicons name="download-outline" size={22} /></Pressable>
      <Pressable onPress={()=>downloadAndShare(url, filename)}><Ionicons name="share-social-outline" size={22} /></Pressable>
    </View>
  );

  return (
    <Screen>
      <H1>Datos personales</H1>

      <Card>
        <P style={{ marginBottom:8 }}>Email</P>
        <Text style={{ fontSize:16, color:"#111", marginBottom:12 }}>{user?.email}</Text>

        {mineUrl
          ? <>
              <PrimaryButton title="Ver mi tarjeta (PDF)" onPress={()=>openUrl(mineUrl)} />
              <Toolbar url={mineUrl} filename={`${user?.uid||"mi"}-tarjeta.pdf`} />
            </>
          : <P>No hay tarjeta asignada todavía.</P>}
      </Card>

      {isAdmin && (
        <Card style={{ marginTop:12 }}>
          <H1 style={{ fontSize:18, marginBottom:8 }}>Tarjetas (admin)</H1>
          {busy ? (
            <View style={{ paddingVertical:10, alignItems:"center" }}>
              <ActivityIndicator />
              <P style={{ marginTop:6 }}>Preparando archivo…</P>
            </View>
          ) : null}
          <FlatList
            data={all}
            keyExtractor={(r)=>r.name}
            renderItem={({item})=>(
              <View style={{ paddingVertical:10, borderBottomWidth:1, borderBottomColor:"#F3F4F6" }}>
                <Text style={{ fontWeight:"600" }}>{item.name}</Text>
                <Toolbar url={item.url} filename={item.name} />
              </View>
            )}
            ListEmptyComponent={<P>No hay tarjetas en la carpeta.</P>}
          />
        </Card>
      )}
    </Screen>
  );
}