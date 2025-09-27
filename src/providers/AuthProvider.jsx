import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as fbSignOut } from "firebase/auth";
import { router } from "expo-router";
import { auth } from "../../firebase/config";

const Ctx = createContext({ user:null, loading:true, signOut:async()=>{} });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u)=>{ setUser(u); setLoading(false); });
    return unsub;
  }, []);

  const signOut = async () => {
    try { await fbSignOut(auth); }
    finally { router.replace("/(auth)/login"); }
  };

  return <Ctx.Provider value={{ user, loading, signOut }}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);
export default AuthProvider;