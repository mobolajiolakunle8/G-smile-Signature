import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, TextInput, StyleSheet, SafeAreaView } from "react-native";
import { subscribeToProducts, Product } from "../services/api";
import { colors } from "../theme/colors";

export default function ShopScreen({ navigation }: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const unsub = subscribeToProducts(setProducts);
    return unsub;
  }, []);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Shop All Bags</Text>
      <TextInput
        placeholder="Search bags..."
        value={query}
        onChangeText={setQuery}
        style={styles.search}
        placeholderTextColor={colors.ash}
      />
      <FlatList
        data={filtered}
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
  title: { fontSize: 22, fontWeight: "700", margin: 16, color: colors.ink },
  search: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cream,
    padding: 12,
    borderRadius: 4,
    color: colors.ink,
  },
  card: { flex: 1, margin: 6, backgroundColor: colors.cream, borderRadius: 4, padding: 8 },
  cardImage: { width: "100%", height: 140, borderRadius: 4, backgroundColor: colors.ash },
  cardName: { marginTop: 8, fontWeight: "600", color: colors.ink },
  cardPrice: { color: colors.gold, fontWeight: "700", marginTop: 2 },
});
