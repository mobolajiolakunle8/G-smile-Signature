import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Linking } from "react-native";
import { colors } from "../theme/colors";

export default function ProductDetailScreen({ route, navigation }: any) {
  const { product } = route.params;

  const whatsappInquiry = () => {
    const msg = `Hi G-Smile Signature, I'm interested in ${product.name} (₦${product.price.toLocaleString()}). Is it available?`;
    Linking.openURL(`https://wa.me/2348065653384?text=${encodeURIComponent(msg)}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image source={{ uri: product.image }} style={styles.image} />
        <View style={styles.body}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>₦{product.price?.toLocaleString()}</Text>
          <Text style={styles.desc}>{product.description}</Text>

          <TouchableOpacity style={styles.buyBtn} onPress={() => navigation.navigate("Cart", { product })}>
            <Text style={styles.buyText}>Add to Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.waBtn} onPress={whatsappInquiry}>
            <Text style={styles.waText}>Need help choosing? Chat on WhatsApp</Text>
          </TouchableOpacity>

          <View style={styles.trustRow}>
            <Text style={styles.trustItem}>🚚 Fast Delivery</Text>
            <Text style={styles.trustItem}>🔒 Secure Checkout</Text>
            <Text style={styles.trustItem}>↩️ 7-Day Returns</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  image: { width: "100%", height: 380, backgroundColor: colors.cream },
  body: { padding: 20 },
  name: { fontSize: 22, fontWeight: "700", color: colors.ink },
  price: { fontSize: 20, color: colors.gold, fontWeight: "700", marginTop: 6 },
  desc: { marginTop: 12, color: "#555", lineHeight: 20 },
  buyBtn: { backgroundColor: colors.ink, padding: 16, alignItems: "center", marginTop: 20, borderRadius: 2 },
  buyText: { color: colors.white, fontWeight: "700", letterSpacing: 1 },
  waBtn: { backgroundColor: "#25D366", padding: 14, alignItems: "center", marginTop: 10, borderRadius: 2 },
  waText: { color: colors.white, fontWeight: "600" },
  trustRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 24 },
  trustItem: { fontSize: 11, color: "#666" },
});
