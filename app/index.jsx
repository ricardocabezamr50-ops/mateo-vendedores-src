import { Redirect } from "expo-router";
import { useAuth } from "../src/providers/AuthProvider";

export default function Index(){
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Redirect href="/(app)/inicio" /> : <Redirect href="/(auth)/login" />;
}