import { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, Pressable, TextInput, FlatList, RefreshControl, Image, Modal, ActivityIndicator } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Linking from "expo-linking";
import { ref, getDownloadURL, getMetadata } from "firebase/storage";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import { storage, db } from "../../firebase/config";
import { Screen, Card } from "../../src/components/ui";
import { Ionicons } from "@expo/vector-icons";

const sanitize = (name="archivo") => String(name).replace(/[^\w\-.]+/g,"_");
const guessMimeFromExt = (name="") => {
  const n = name.toLowerCase();
  if (n.endsWith(".pdf")) return "application/pdf";
  if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
  if (n.endsWith(".png")) return "image/png";
  if (n.endsWith(".webp")) return "image/webp";
  if (n.endsWith(".ppt")) return "application/vnd.ms-powerpoint";
  if (n.endsWith(".pptx")) return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  return "application/octet-stream";
};
const utiFromMime = (m) => {
  const mime=(m||"").toLowerCase();
  if (mime.includes("pdf")) return "com.adobe.pdf";
  if (mime.includes("jpeg")||mime.includes("jpg")) return "public.jpeg";
  if (mime.includes("png")) return "public.png";
  if (mime.includes("webp")) return "public.webp";
  if (mime.includes("powerpoint")) return "com.microsoft.powerpoint.ppt";
  return "public.data";
};
async function probeUrl(url){
  try{
    const res = await fetch(url,{method:"HEAD"});
    const ct = res.headers.get("Content-Type")||undefined;
    const cd = res.headers.get("Content-Disposition")||"";
    const m = /filename\*?=(?:UTF-8'')?\"?([^\";]+)\"?/i.exec(cd);
    const name = m ? decodeURIComponent(m[1]) : undefined;
    return { contentType: ct, name };
  }catch{ return { contentType: undefined, name: undefined }; }
}

export default function Materiales(){
  const [rows,setRows]=useState([]);
  const [q,setQ]=useState("");
  const [refreshing,setRefreshing]=useState(false);
  const [preparing,setPreparing]=useState(false);

  useEffect(()=>{
    const unsub = onSnapshot(collection(db,"DOCUMENTOS"), snap=>{
      setRows(snap.docs.map(d=>({ id:d.id, ...d.data() })));
    });
    return unsub;
  },[]);

  const refreshNow = useCallback(async()=>{
    try{
      setRefreshing(true);
      const snap = await getDocs(collection(db,"DOCUMENTOS"));
      setRows(snap.docs.map(d=>({ id:d.id, ...d.data() })));
    }finally{ setRefreshing(false); }
  },[]);

  const filtered = useMemo(()=>{
    const s=q.trim().toLowerCase();
    const base = rows.filter(d => String(d.category||"").toLowerCase()==="materiales" && (d.active ?? true));
    if(!s) return base;
    return base.filter(d=>{
      const title = String(d.title||d.name||"").toLowerCase();
      const hitTitle = title.includes(s);
      const tags = Array.isArray(d.tags) && d.tags.some(t=>String(t).toLowerCase().includes(s));
      return hitTitle || tags;
    });
  },[rows,q]);

  const openOnline = async (doc)=>{
    const sref = ref(storage, doc.storagePath || `materiales/${doc.fileName || doc.title}`);
    const url = doc.storageUrl || await getDownloadURL(sref);
    Linking.openURL(url);
  };

  const downloadAndShare = async (doc)=>{
    try{
      setPreparing(true);
      let metaName, metaType, url;
      if (doc.storagePath){
        const sref = ref(storage, doc.storagePath);
        const meta = await getMetadata(sref).catch(()=>null);
        metaName = meta?.name; metaType = meta?.contentType;
        url = doc.storageUrl || await getDownloadURL(sref);
      } else {
        url = doc.storageUrl;
      }
      if ((!metaName || !metaType) && url){
        const p = await probeUrl(url);
        metaName = metaName || p.name;
        metaType = metaType || p.contentType;
      }
      let name = sanitize(metaName || doc.fileName || doc.title || "material");
      if (!/\.[A-Za-z0-9]+$/.test(name)){
        const ext = (doc.title||"").match(/\.[A-Za-z0-9]+$/)?.[0] || "";
        name = name + ext;
      }
      let mime = metaType || guessMimeFromExt(name);
      const dest = FileSystem.cacheDirectory + name;
      try{ await FileSystem.deleteAsync(dest,{idempotent:true}); }catch{}
      const { uri } = await FileSystem.downloadAsync(url, dest);
      await Sharing.shareAsync(uri, { mimeType: mime, dialogTitle:`Compartir ${name}`, UTI: utiFromMime(mime) });
    }finally{ setPreparing(false); }
  };

  const Tag = ({children})=>(
    <View style={{ backgroundColor:"#E5EAF3", paddingHorizontal:10, paddingVertical:6, borderRadius:999, marginRight:8, marginTop:6 }}>
      <Text style={{ color:"#0F172A" }}>#{children}</Text>
    </View>
  );

  const isImg = (doc)=>{
    const n = String(doc.title||doc.fileName||"").toLowerCase();
    return /\.(png|jpe?g|webp)$/.test(n);
  };
  const Thumb = ({doc})=>(
    doc.thumbUrl
      ? <Image source={{ uri:doc.thumbUrl }} style={{ width:128, height:128, borderRadius:12, backgroundColor:"#EEF2F7" }} />
      : isImg(doc)
        ? <View style={{ width:128, height:128, borderRadius:12, backgroundColor:"#EEF2F7", alignItems:"center", justifyContent:"center" }}>
            <Ionicons name="image-outline" size={28}/>
          </View>
        : <View style={{ width:128, height:128, borderRadius:12, backgroundColor:"#EEF2F7", alignItems:"center", justifyContent:"center" }}>
            <Ionicons name="document-outline" size={28}/>
          </View>
  );

  const Row = ({item})=>(
    <Card style={{ marginBottom:12 }}>
      <View style={{ flexDirection:"row", gap:12 }}>
        <Thumb doc={item}/>
        <View style={{ flex:1 }}>
          <Text style={{ fontSize:18, fontWeight:"800", marginBottom:6 }}>{item.title || item.name}</Text>
          <View style={{ flexDirection:"row", flexWrap:"wrap" }}>
            {Array.isArray(item.tags) && item.tags.map((t,i)=> <Tag key={i}>{String(t)}</Tag>)}
          </View>
          <View style={{ flexDirection:"row", gap:18, marginTop:10 }}>
            <Pressable onPress={()=>openOnline(item)}><Ionicons name="eye-outline" size={22}/></Pressable>
            <Pressable onPress={()=>downloadAndShare(item)}><Ionicons name="download-outline" size={22}/></Pressable>
            <Pressable onPress={()=>downloadAndShare(item)}><Ionicons name="share-social-outline" size={22}/></Pressable>
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <Screen>
      <TextInput
        placeholder="Buscar material o tag..."
        placeholderTextColor="#9CA3AF"
        value={q} onChangeText={setQ}
        style={{ backgroundColor:"#fff", borderRadius:12, borderWidth:1, borderColor:"#E5E7EB", padding:12, marginBottom:12 }}
        autoCapitalize="none"
      />
      <FlatList
        data={filtered}
        keyExtractor={(it,idx)=> it.id || it.title || String(idx)}
        renderItem={({item})=> <Row item={item}/>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshNow}/>}
      />
      <Modal visible={preparing} transparent animationType="fade">
        <View style={{ flex:1, backgroundColor:"rgba(0,0,0,0.25)", alignItems:"center", justifyContent:"center" }}>
          <View style={{ backgroundColor:"#fff", padding:16, borderRadius:12, minWidth:220, alignItems:"center" }}>
            <ActivityIndicator size="large"/>
            <Text style={{ marginTop:10, fontWeight:"600" }}>Preparando archivo…</Text>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}