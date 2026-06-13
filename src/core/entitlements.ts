// Entitlements — what the player has unlocked. Today this is local-only so the
// theme-pack flow works end to end during development. On the mobile build this
// is the ONE place the store wires in: replace `runPurchase` / `loadFromStore`
// with RevenueCat (see MOBILE.md). The rest of the app only calls the helpers
// below, so nothing else changes when real purchases land.

const KEY = 'dokuplus:entitlements:v1';

export interface Entitlements {
  pro: boolean; // "Pro" unlock — removes ads (later) and includes every pack
  themes: string[]; // individually purchased theme pack ids
}

const empty = (): Entitlements => ({ pro: false, themes: [] });

const read = (): Entitlements => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<Entitlements>;
    return { pro: !!parsed.pro, themes: Array.isArray(parsed.themes) ? parsed.themes : [] };
  } catch {
    return empty();
  }
};

const write = (e: Entitlements): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify(e));
  } catch {
    // storage unavailable — purchases simply won't persist
  }
};

export const getEntitlements = (): Entitlements => read();

export const isThemeUnlocked = (id: string, group: 'free' | 'pack'): boolean => {
  if (group === 'free') return true;
  const e = read();
  return e.pro || e.themes.includes(id);
};

// ---------------------------------------------------------------------------
// Store seam. Swap the body of these for RevenueCat on the native build.
// ---------------------------------------------------------------------------

// Simulates a successful purchase locally. Replace with a RevenueCat
// `Purchases.purchasePackage(...)` call and grant on success.
const runPurchase = async (productId: string): Promise<boolean> => {
  void productId; // the real RevenueCat call keys off this id (see MOBILE.md)
  await new Promise((r) => setTimeout(r, 400));
  return true;
};

export const purchaseTheme = async (id: string): Promise<boolean> => {
  const ok = await runPurchase(`theme.${id}`);
  if (!ok) return false;
  const e = read();
  if (!e.themes.includes(id)) e.themes.push(id);
  write(e);
  return true;
};

export const purchasePro = async (): Promise<boolean> => {
  const ok = await runPurchase('pro');
  if (!ok) return false;
  const e = read();
  e.pro = true;
  write(e);
  return true;
};

// On the native build, fetch entitlements from RevenueCat's CustomerInfo and
// reconcile here so purchases restore across devices/reinstalls.
export const restorePurchases = async (): Promise<void> => {
  // no-op until the store is wired in
};
