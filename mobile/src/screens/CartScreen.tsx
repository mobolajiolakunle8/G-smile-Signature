import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, FlatList } from "react-native";
import { colors } from "../theme/colors";

/**
 * Simplified local cart demo. In production, wire this to the same
 * cart persistence pattern as the website (AsyncStorage + Firebase).
 */
export default function CartScreen({ route, navigation }: any) {
  const initial = route.params?.product ? [{ ...route.params.product, qty: 1 }] : [];
  const [items, setItems] = useState(initial);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image source={{ uri: item.image }} style={styles.thumb} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>₦{item.price.toLocaleString()} × {item.qty}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Your cart is empty.</Text>}
      />
      <View style={styles.footer}>
        <Text style={styles.total}>Total: ₦{total.toLocaleString()}</Text>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => navigation.navigate("Checkout", { items, total })}
        >
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, padding: 16 },
  row: { flexDirection: "row", marginBottom: 16, alignItems: "center" },
  thumb: { width: 64, height: 64, borderRadius: 4, backgroundColor: colors.cream },
  name: { fontWeight: "600", color: colors.ink },
  price: { color: colors.gold, marginTop: 4 },
  empty: { textAlign: "center", marginTop: 40, color: "#888" },
  footer: { borderTopWidth: 1, borderTopColor: colors.cream, paddingTop: 16 },
  total: { fontSize: 18, fontWeight: "700", color: colors.ink, marginBottom: 12 },
  checkoutBtn: { backgroundColor: colors.gold, padding: 16, alignItems: "center", borderRadius: 2 },
  checkoutText: { color: colors.ink, fontWeight: "700" },
});
