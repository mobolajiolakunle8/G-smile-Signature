import { onValue, push, ref, serverTimestamp, set } from "firebase/database";
import { database, firebaseEnabled } from "./config";

const DB_PATH = "gsmile_signature";

export function dbRef(path: string) {
  if (!database) throw new Error("Firebase not configured");
  return ref(database, `${DB_PATH}/${path}`);
}

export function subscribe<T>(path: string, callback: (data: T | null) => void) {
  if (!database || !firebaseEnabled) return () => {};
  const r = dbRef(path);
  const unsub = onValue(r, (snapshot) => {
    callback(snapshot.exists() ? (snapshot.val() as T) : null);
  });
  return unsub;
}

export async function setValue<T>(path: string, value: T) {
  if (!database || !firebaseEnabled) throw new Error("Firebase not configured");
  await set(dbRef(path), value);
}

export async function logEvent<T extends Record<string, unknown>>(path: string, payload: T) {
  if (!database || !firebaseEnabled) return;
  await push(dbRef(path), {
    ...payload,
    createdAt: serverTimestamp(),
  });
}

export const SYNC_PATHS = {
  products: "products",
  categories: "categories",
  testimonials: "testimonials",
  faqs: "faqs",
  coupons: "coupons",
  content: "content",
  settings: "settings",
  orders: "orders",
  subscribers: "subscribers",
  logs: "logs",
} as const;
