import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Linking } from "react-native";
import { colors } from "../theme/colors";
import { registerForPushNotificationsAsync } from "../services/notifications";

export default function AccountScreen() {
  useEffect(() => {
    // Register for push notifications as soon as the user opens their account
    registerForPushNotificationsAsync("guest-device").catch(() => {});
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Account</Text>

      <View style={styles.menu}>
        {["My Orders", "Wishlist", "Saved Address", "Account Details", "Track Order"].map((item) => (
          <TouchableOpacity key={item} style={styles.menuItem}>
            <Text style={styles.menuText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.waBtn}
        onPress={() => Linking.openURL("https://wa.me/2348065653384")}
      >
        <Text style={styles.waText}>Chat with us on WhatsApp</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, padding: 20 },
  title: { fontSize: 22, fontWeight: "700", color: colors.ink, marginBottom: 20 },
  menu: { borderTopWidth: 1, borderTopColor: colors.cream },
  menuItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.cream },
  menuText: { fontSize: 15, color: colors.ink },
  waBtn: { backgroundColor: "#25D366", padding: 16, alignItems: "center", marginTop: 30, borderRadius: 2 },
  waText: { color: "#fff", fontWeight: "700" },
});
