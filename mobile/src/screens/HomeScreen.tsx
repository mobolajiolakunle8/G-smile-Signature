import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { subscribeToProducts, Product } from "../services/api";
import { colors } from "../theme/colors";

export default function HomeScreen({ navigation }: any) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const unsub = subscribeToProducts(setProducts);
    return unsub;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>THE NEW COLLECTION</Text>
        <Text style={styles.headline}>Premium Bags for{"\n"}Every Occasion</Text>
        <TouchableOpacity style={styles.cta} onPress={() => navigation.navigate("Shop")}>
          <Text style={styles.ctaText}>Shop Now</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Featured Products</Text>
      <FlatList
        data={products.slice(0, 8)}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("ProductDetail", { product: item })}
          >
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.cardPrice}>₦{item.price?.toLocaleString()}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  hero: { backgroundColor: colors.cream, padding: 24, alignItems: "center" },
  eyebrow: { color: colors.gold, fontSize: 11, letterSpacing: 2, fontWeight: "600" },
  headline: { fontSize: 28, fontWeight: "700", color: colors.ink, textAlign: "center", marginTop: 8 },
  cta: { backgroundColor: colors.ink, paddingVertical: 12, paddingHorizontal: 28, marginTop: 16, borderRadius: 2 },
  ctaText: { color: colors.white, fontWeight: "600", letterSpacing: 1 },
  sectionTitle: { fontSize: 18, fontWeight: "700", margin: 16, color: colors.ink },
  card: { flex: 1, margin: 6, backgroundColor: colors.cream, borderRadius: 4, padding: 8 },
  cardImage: { width: "100%", height: 140, borderRadius: 4, backgroundColor: colors.ash },
  cardName: { marginTop: 8, fontWeight: "600", color: colors.ink },
  cardPrice: { color: colors.gold, fontWeight: "700", marginTop: 2 },
});
