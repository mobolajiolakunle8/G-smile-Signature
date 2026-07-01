import { ref, onValue, push, set, serverTimestamp } from "firebase/database";
import { database, DB_PATH } from "../config/firebase";

export type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  gallery: string[];
  category: string;
  stock: number;
  description: string;
  tags?: string[];
};

export type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: { name: string; qty: number; price: number; image: string }[];
  total: number;
  status: string;
  date: string;
};

function dbRef(path: string) {
  return ref(database, `${DB_PATH}/${path}`);
}

/** Real-time product listener — mirrors the website's live catalog */
export function subscribeToProducts(callback: (products: Product[]) => void) {
  return onValue(dbRef("products"), (snap) => {
    callback(snap.exists() ? Object.values(snap.val()) : []);
  });
}

export function subscribeToCategories(callback: (categories: any[]) => void) {
  return onValue(dbRef("categories"), (snap) => {
    callback(snap.exists() ? Object.values(snap.val()) : []);
  });
}

/** Push a new order — admins see it instantly in the web dashboard */
export async function placeOrder(order: Omit<Order, "id" | "date" | "status">) {
  const newOrderRef = push(dbRef("orders"));
  const fullOrder: Order = {
    ...order,
    id: newOrderRef.key || `GS-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    status: "Awaiting Payment",
  };
  await set(newOrderRef, fullOrder);
  return fullOrder;
}

/** Track order status changes live (push-notification trigger point) */
export function subscribeToOrder(orderId: string, callback: (order: Order | null) => void) {
  return onValue(dbRef(`orders/${orderId}`), (snap) => {
    callback(snap.exists() ? snap.val() : null);
  });
}

export async function logDeviceToken(userId: string, expoPushToken: string) {
  await set(dbRef(`pushTokens/${userId}`), {
    token: expoPushToken,
    updatedAt: serverTimestamp(),
  });
}
