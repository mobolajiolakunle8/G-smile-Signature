import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Modal } from "react-native";
import { WebView } from "react-native-webview";
import { colors } from "../theme/colors";
import { placeOrder } from "../services/api";
import { buildPaystackCheckoutUrl } from "../services/payments";
import { scheduleLocalNotification } from "../services/notifications";

const PAYSTACK_PUBLIC_KEY = "pk_test_replace_with_your_live_public_key";

export default function CheckoutScreen({ route, navigation }: any) {
  const { items = [], total = 0 } = route.params || {};
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const reference = `GS-${Date.now()}`;

  const checkoutUrl = buildPaystackCheckoutUrl({
    email: email || "guest@gsmilesignature.com",
    amountNaira: total,
    reference,
    publicKey: PAYSTACK_PUBLIC_KEY,
  });

  const handlePay = () => {
    if (!name || !email || !phone || !address) return;
    setShowPayment(true);
  };

  const handleWebViewNavChange = async (navState: any) => {
    // Paystack redirects to a callback URL containing "?trxref=" on success
    if (navState.url.includes("trxref") || navState.url.includes("success")) {
      setShowPayment(false);
      const order = await placeOrder({
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        items: items.map((i: any) => ({ name: i.name, qty: i.qty, price: i.price, image: i.image })),
        total,
      });
      await scheduleLocalNotification("Order Placed! 🎉", `Order ${order.id} confirmed. We'll notify you once shipped.`);
      navigation.popToTop();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.label}>Full Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Jane Doe" />
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="you@email.com" keyboardType="email-address" />
      <Text style={styles.label}>Phone</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+234..." keyboardType="phone-pad" />
      <Text style={styles.label}>Delivery Address</Text>
      <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="12 Admiralty Way, Lekki" />

      <Text style={styles.total}>Total: ₦{total.toLocaleString()}</Text>

      <TouchableOpacity style={styles.payBtn} onPress={handlePay}>
        <Text style={styles.payText}>Pay Now (Card / Apple Pay / Google Pay)</Text>
      </TouchableOpacity>

      <Modal visible={showPayment} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setShowPayment(false)}>
            <Text style={{ color: colors.ink }}>Close</Text>
          </TouchableOpacity>
          <WebView source={{ uri: checkoutUrl }} onNavigationStateChange={handleWebViewNavChange} />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, padding: 20 },
  label: { fontSize: 12, fontWeight: "600", color: "#666", marginTop: 12, textTransform: "uppercase" },
  input: { borderWidth: 1, borderColor: colors.cream, padding: 12, marginTop: 6, borderRadius: 2, color: colors.ink },
  total: { fontSize: 18, fontWeight: "700", color: colors.ink, marginTop: 24 },
  payBtn: { backgroundColor: colors.ink, padding: 16, alignItems: "center", marginTop: 16, borderRadius: 2 },
  payText: { color: colors.white, fontWeight: "700" },
  closeBtn: { padding: 16, alignItems: "flex-end" },
});
