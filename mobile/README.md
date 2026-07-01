# G-Smile Signature — Native Mobile App (iOS + Android)

This is a **separate React Native (Expo) codebase** from the website. It shares the same
Firebase Realtime Database, so products, orders, and settings created in the web Admin
Dashboard appear instantly in the app, and orders placed in the app appear instantly in
the Admin Dashboard.

## Why this is a separate project

A native iOS/Android app cannot run inside a Vite website. It needs:
- **Xcode** (macOS only) to compile and submit to the **Apple App Store**
- **Android Studio** to compile and submit to the **Google Play Store**
- An **Apple Developer Account** ($99/year)
- A **Google Play Developer Account** ($25 one-time)

This folder is a complete starting scaffold you (or a mobile developer) can run and ship.

## What's included

| Feature | Status |
|---|---|
| Shared Firebase backend (same products/orders as website) | ✅ |
| Home, Shop, Product Detail, Cart, Checkout, Orders, Account screens | ✅ |
| Push notifications (Expo Notifications, device token saved to Firebase) | ✅ |
| WhatsApp inquiry buttons | ✅ |
| Apple Pay / Google Pay (via Paystack/Flutterwave hosted checkout) | ✅ |
| Bottom tab + stack navigation | ✅ |

## 1. Install dependencies

```bash
cd mobile
npm install
```

## 2. Run it locally (Expo Go app)

```bash
npm start
```

Scan the QR code with the **Expo Go** app on your Android or iPhone.

## 3. Push Notifications setup

1. Create a free project at https://expo.dev
2. Run `npx eas init` inside `/mobile` to link this app to your Expo account
3. Copy the generated `projectId` into `app.json` → `expo.extra.eas.projectId`
4. In the Admin Dashboard (web), you can now send push notifications by writing to:
   ```
   gsmile_signature/pushTokens/{userId}
   ```
   and triggering Expo's Push API (`https://exp.host/--/api/v2/push/send`) from a small
   Cloud Function whenever an order status changes to "Shipped" or "Delivered".

## 4. Apple Pay / Google Pay

Apple Pay and Google Pay are **wallets**, not payment processors — they must be routed
through a gateway. This app opens Paystack's hosted checkout in a WebView
(`src/services/payments.ts`), which automatically shows:
- **Apple Pay button** on iOS devices with a card in Apple Wallet
- **Google Pay button** on Android devices with a card in Google Pay

Replace `PAYSTACK_PUBLIC_KEY` in `src/screens/CheckoutScreen.tsx` with your live key from
https://dashboard.paystack.com/#/settings/developer

### To enable Apple Pay specifically on Paystack
1. Go to Paystack Dashboard → Settings → Preferences → enable **Apple Pay**
2. Add your domain to **Apple Pay Merchant Domains**
3. No native iOS code changes needed — Paystack's checkout page handles it

### To go fully native (optional, more work)
Install `@stripe/stripe-react-native` and use `<PlatformPayButton />` for a truly native
Apple Pay / Google Pay sheet instead of a WebView. This requires Stripe as your processor.

## 5. Build for the App Store & Play Store

```bash
npm install -g eas-cli
eas login
eas build:configure

# iOS build (requires Apple Developer account)
eas build --platform ios

# Android build
eas build --platform android
```

## 6. Submit to stores

```bash
eas submit --platform ios
eas submit --platform android
```

## 7. Replace placeholder assets

Add real icons/splash screens to `/mobile/assets/`:
- `icon.png` — 1024×1024
- `splash.png` — 1284×2778
- `adaptive-icon.png` — 1024×1024 (Android)
- `notification-icon.png` — 96×96 white silhouette

## Folder Structure

```
mobile/
├── App.tsx
├── app.json
├── package.json
└── src/
    ├── config/firebase.ts       # Same Firebase project as the website
    ├── theme/colors.ts          # G-Smile brand colors
    ├── services/
    │   ├── api.ts               # Products, categories, orders (Firebase)
    │   ├── notifications.ts     # Push notification registration
    │   └── payments.ts          # Paystack/Flutterwave + Apple/Google Pay
    ├── navigation/index.tsx     # Tab + stack navigation
    └── screens/
        ├── HomeScreen.tsx
        ├── ShopScreen.tsx
        ├── ProductDetailScreen.tsx
        ├── CartScreen.tsx
        ├── CheckoutScreen.tsx
        ├── OrdersScreen.tsx
        └── AccountScreen.tsx
```
