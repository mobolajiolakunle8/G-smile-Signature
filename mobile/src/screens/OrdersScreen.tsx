import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, SafeAreaView } from "react-native";
import { ref, onValue } from "firebase/database";
import { database, DB_PATH } from "../config/firebase";
import { colors } from "../theme/colors";

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onValue(ref(database, `${DB_PATH}/orders`), (snap) => {
      setOrders(snap.exists() ? Object.values(snap.val()) : []);
    });
    return unsub;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.orderId}>{item.id}</Text>
            <Text style={styles.status}>{item.status}</Text>
            <Text style={styles.total}>₦{item.total?.toLocaleString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No orders yet.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  title: { fontSize: 22, fontWeight: "700", margin: 16, color: colors.ink },
  card: { backgroundColor: colors.cream, padding: 14, borderRadius: 4, marginBottom: 10 },
  orderId: { fontWeight: "700", color: colors.ink },
  status: { color: colors.gold, marginTop: 4, fontWeight: "600" },
  total: { marginTop: 4, color: "#555" },
  empty: { textAlign: "center", marginTop: 40, color: "#888" },
});
