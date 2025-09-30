import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase/config";

/** Devuelve StorageReference si es path, o null si ya es URL http(s) */
export function toRef(pathOrUrl) {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return null;
  return ref(storage, pathOrUrl);
}

/** Si es path => resuelve URL; si ya es URL => la devuelve; si nada => null */
export async function urlFrom(pathOrUrl) {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const r = toRef(pathOrUrl);
  return r ? await getDownloadURL(r) : null;
}

/** getDownloadURL con guardas y try/catch (acepta ref o path string) */
export async function safeGetDownloadURL(refOrPath) {
  try {
    if (!refOrPath) return null;
    if (typeof refOrPath === "string") {
      const r = toRef(refOrPath);
      if (!r) return refOrPath;         // ya era URL
      return await getDownloadURL(r);
    }
    // StorageReference típico de listAll()
    if (typeof refOrPath === "object" && refOrPath !== null) {
      return await getDownloadURL(refOrPath);
    }
    return null;
  } catch (e) {
    console.warn("[storage] getDownloadURL failed:", refOrPath?.fullPath ?? refOrPath, e);
    return null;
  }
}
