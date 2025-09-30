import { safeGetDownloadURL, urlFrom } from '../../src/utils/storage';
import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, TextInput, FlatList, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ref, listAll } from "firebase/storage";
import { collection, getDocs, query, where } from "firebase/firestore";
import { storage, db } from "../../firebase/config";
import { useAuth } from "../../src/providers/AuthProvider";
import { Screen, Card } from "../../src/components/ui";
import { colors } from "../../src/theme";

export default function Inicio(){
  const { user } = useAuth();
  const first = (user?.email||"").split("@")[0];

  const [q,setQ] = useState("");
  const [fCount, setFCount] = useState(0);
  const [pCount, setPCount] = useState(0);
  const [mCount, setMCount] = useState(0);
  const [fichas, setFichas] = useState([]);
  const [precios, setPrecios] = useState([]);

  useEffect(()=>{ (async()=>{
    const qF = query(collection(db,"DOCUMENTOS"), where("category","==","fichas"),  where("active","==", true));
    const qP = query(collection(db,"DOCUMENTOS"), where("category","==","precios"), where("active","==", true));
    const [sf, sp] = await Promise.all([getDocs(qF), getDocs(qP)]);
    const fDocs = sf.docs.map(d=>({ id:d.id, ...d.data() }));
    const pDocs = sp.docs.map(d=>({ id:d.id, ...d.data() }));
    setFichas(fDocs); setPrecios(pDocs);
    setFCount(fDocs.length); setPCount(pDocs.length);
    try { const { items } = await listAll(ref(storage, "materiales")); setMCount(items.length); } catch { setMCount(0); }
  })(); },[]);

  const results = useMemo(()=>{
    const s = q.trim().toLowerCase();
    if (!s) return [];
    const map = (arr,type)=>arr
      .filter(it => (it.title||"").toLowerCase().includes(s) || (Array.isArray(it.tags) && it.tags.some(t=>String(t).toLowerCase().includes(s))))
      .map(it => ({ type, title: it.title }));
    return [...map(fichas,"fichas"), ...map(precios,"precios")];
  }, [q, fichas, precios]);

  const Stat = ({label, value}) => (
    <View style={{ flex:1, padding:16, borderRadius:12, backgroundColor:"#fff", borderWidth:1, borderColor:"#E5E7EB" }}>
      <Text style={{ fontSize:22, fontWeight:"800", color:colors.text }}>{value}</Text>
      <Text style={{ color:"#6B7280", marginTop:4 }}>{label}</Text>
    </View>
  );

  // ÃƒÂ¢Ã‚Â¬Ã¢â‚¬Â¡ÃƒÂ¯Ã‚Â¸Ã‚Â Usa router.push en lugar de deep link
  const Quick = ({icon, label, to}) => (
    <Pressable onPress={()=>router.push(`/(app)/${to}`)} style={{ flex:1 }}>
      <View style={{ alignItems:"center", gap:8, padding:12 }}>
        <Ionicons name={icon} size={26} color={colors.brand}/>
        <Text style={{ fontWeight:"600", color:colors.text }}>{label}</Text>
      </View>
    </Pressable>
  );

  return (
    <Screen style={{ padding:0, backgroundColor:"#fff" }}>
      <LinearGradient colors={[colors.brand, "#b71c14"]} start={{x:0,y:0}} end={{x:1,y:1}}
        style={{ paddingHorizontal:16, paddingTop:18, paddingBottom:22, borderBottomLeftRadius:18, borderBottomRightRadius:18 }}>
        <Text style={{ color:"#FFDAD6", marginBottom:4 }}>Bienvenido</Text>
        <Text style={{ color:"#fff", fontSize:24, fontWeight:"800" }}>Hola, {first || "vendedor"} ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ¢â‚¬Â¹</Text>

        <View style={{ marginTop:14, backgroundColor:"#fff", borderRadius:12, paddingHorizontal:12, paddingVertical:8 }}>
          <View style={{ flexDirection:"row", alignItems:"center" }}>
            <Ionicons name="search-outline" size={18} color="#9CA3AF" />
            <TextInput
              placeholder="Buscar en fichas o precios."
              placeholderTextColor="#9CA3AF"
              value={q} onChangeText={setQ}
              style={{ flex:1, padding:8, marginLeft:6 }}
              autoCapitalize="none"
            />
            {q ? (
              <Pressable onPress={()=>setQ("")} style={{ padding:6 }}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </Pressable>
            ) : null}
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding:16, gap:12 }}>
        <Card style={{ padding:0 }}>
          <View style={{ flexDirection:"row", justifyContent:"space-around" }}>
            <Quick icon="document-text-outline" label="Fichas"     to="fichas" />
            <Quick icon="pricetags-outline"     label="Precios"    to="lista" />
            <Quick icon="albums-outline"        label="Materiales" to="materiales" />
          </View>
        </Card>

        <View style={{ flexDirection:"row", gap:12 }}>
          <Stat label="Fichas" value={fCount}/>
          <Stat label="Listas" value={pCount}/>
          <Stat label="Materiales" value={mCount}/>
        </View>

        {q ? (
          <Card>
            <Text style={{ fontWeight:"800", marginBottom:8, color:colors.text }}>Resultados</Text>
            <FlatList
              data={results}
              keyExtractor={(r,i)=> r.type+"-"+i}
              renderItem={({item})=>(
                <View style={{ paddingVertical:10, borderBottomWidth:1, borderBottomColor:"#F3F4F6", flexDirection:"row", alignItems:"center", gap:8 }}>
                  <Ionicons
                    name={ item.type==="fichas" ? "document-text-outline" : "pricetags-outline" }
                    size={18} color={colors.brand}/>
                  <Text style={{ flex:1, fontWeight:"600", color:colors.text }}>{item.title}</Text>
                </View>
              )}
              ListEmptyComponent={<Text style={{ color:"#6B7280" }}>Sin coincidencias.</Text>}
            />
          </Card>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

