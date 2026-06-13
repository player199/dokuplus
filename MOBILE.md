# doku+ — Mobile app (Capacitor + RevenueCat)

This wraps the existing web app in native iOS/Android shells and adds real
in-app purchases for the theme packs / Pro unlock. The web code doesn't change —
the app's UI already runs through `src/core/themes.ts` (color packs) and
`src/core/entitlements.ts` (what's unlocked). RevenueCat plugs into that one
entitlements file.

Native builds need a Mac with **Xcode** (iOS) and **Android Studio** (Android).
Run everything below on your machine, not in CI.

## 1. Install Capacitor + platforms

```bash
npm install @capacitor/core @capacitor/app
npm install -D @capacitor/cli @capacitor/ios @capacitor/android

npx cap add ios
npx cap add android
```

`capacitor.config.ts` is already committed (appId `app.dokuplus`, webDir `dist`).
Change `appId` to your real reverse-domain bundle id before submitting.

## 2. Build + sync

```bash
npm run build       # produces dist/
npx cap sync        # copies web build + native plugins into ios/ and android/
npx cap open ios    # opens Xcode
npx cap open android
```

Re-run `npm run build && npx cap sync` after any web change.

## 3. In-app purchases with RevenueCat

```bash
npm install @revenuecat/purchases-capacitor
npx cap sync
```

1. Create products in **App Store Connect** and **Google Play Console**:
   - `pro` — non-consumable (removes ads later, includes every theme pack)
   - `theme.sunset`, `theme.phosphor`, `theme.carbon` — non-consumables
   (ids must match `runPurchase('theme.<id>')` / `'pro'` in `entitlements.ts`)
2. Add them to a RevenueCat project; create an **entitlement** per pack (and a
   `pro` entitlement) and attach the products.
3. Initialise RevenueCat once at startup (e.g. in `src/main.tsx`):

   ```ts
   import { Purchases } from '@revenuecat/purchases-capacitor';
   await Purchases.configure({ apiKey: PUBLIC_SDK_KEY });
   ```

4. Wire the seam in `src/core/entitlements.ts` — replace the three marked spots:
   - `runPurchase(productId)` → look up the matching package and call
     `Purchases.purchasePackage(...)`; return true on success.
   - `restorePurchases()` → `Purchases.restorePurchases()` then reconcile.
   - On launch, read `Purchases.getCustomerInfo()` and mirror active
     entitlements into local state so unlocks restore across devices.

   Nothing else in the app needs to change: themes call `isThemeUnlocked`,
   purchases call `purchaseTheme` / `purchasePro`.

## 4. Notes

- The theme picker already shows lock badges and an Unlock/Owned tag driven by
  entitlements, so once step 3 is wired the store flow is live.
- Until then, `runPurchase` resolves successfully and unlocks locally — handy
  for development, but lock it down (or leave packs free) before release.
- Recommended monetization order: Pro unlock (removes ads + all packs) as the
  main earner, packs as à-la-carte cosmetics, optional rewarded-video hints.
