import { Stack } from "expo-router";
import { AuthProvider } from "../src/providers/AuthProvider";

export default function Root(){
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown:false }} />
    </AuthProvider>
  );
}