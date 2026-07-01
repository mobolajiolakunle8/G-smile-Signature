/**
 * PAYMENT STRATEGY
 * ------------------------------------------------------------------
 * Apple Pay and Google Pay are WALLETS, not standalone processors.
 * You cannot "integrate Apple Pay" alone — Apple requires a registered
 * Merchant ID + a payment processor that supports Apple Pay tokenization
 * (Paystack and Flutterwave both support this in Nigeria).
 *
 * This module opens a hosted checkout (Paystack/Flutterwave) inside a
 * WebView. Both gateways automatically show the Apple Pay button on iOS
 * Safari/WebView and the Google Pay button on Android Chrome/WebView
 * when the customer's device supports it — no extra native code needed.
 * ------------------------------------------------------------------
 */

export type CheckoutParams = {
  email: string;
  amountNaira: number;
  reference: string;
  publicKey: string;
};

/** Builds the Paystack inline checkout URL to load in a WebView */
export function buildPaystackCheckoutUrl({ email, amountNaira, reference, publicKey }: CheckoutParams) {
  const amountKobo = Math.round(amountNaira * 100);
  const params = new URLSearchParams({
    email,
    amount: String(amountKobo),
    ref: reference,
    key: publicKey,
  });
  return `https://checkout.paystack.com/${publicKey}?${params.toString()}`;
}

/** Builds the Flutterwave hosted checkout URL (also supports Apple/Google Pay) */
export function buildFlutterwaveCheckoutUrl({ email, amountNaira, reference, publicKey }: CheckoutParams) {
  const params = new URLSearchParams({
    public_key: publicKey,
    tx_ref: reference,
    amount: String(amountNaira),
    currency: "NGN",
    customer_email: email,
    payment_options: "card,mobilemoney,ussd,applepay,googlepay",
  });
  return `https://checkout.flutterwave.com/v3/hosted/pay?${params.toString()}`;
}

/**
 * Native alternative (deeper integration, optional):
 * npx expo install @stripe/stripe-react-native
 * Stripe's <PlatformPayButton /> gives a fully native Apple Pay / Google Pay
 * sheet if you decide to move settlement to Stripe instead of a hosted page.
 */
