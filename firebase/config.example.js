import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Copiá este archivo a firebase/config.js y poné tus valores reales.
const firebaseConfig = {
  apiKey: "AIzaSyA5DYt-REPLACE-ME",
  authDomain: "vend-appv02.firebaseapp.com",
  projectId: "vend-appv02",
  storageBucket: "vend-appv02.appspot.com",
  messagingSenderId: "140600251363",
  appId: "1:140600251363:web:b4472be3b25c22e63f06d6"
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
