import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCdD6cFieFBEUkcaTRuG4dwyyL_6HQBBVM",
  authDomain: "vend-appv02.firebaseapp.com",
  projectId: "vend-appv02",
  storageBucket: "vend-appv02.appspot.com",
  messagingSenderId: "140600251363",
  appId: "1:140600251363:web:b4472be3b25c22e63f06d6"
};

// Reusar instancia en HMR
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Si HMR ya creÃ³ Auth, reusarlo
let auth;
try {
  auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
} catch (_) {
  auth = getAuth(app);
}

const db = getFirestore(app);
const storage = getStorage(app);

// Admins que ven todo
const ADMIN_EMAILS = ["admin@vendapp.com"]; // agrega los que correspondan

export { app, auth, db, storage, ADMIN_EMAILS };
