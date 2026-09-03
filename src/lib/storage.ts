/**
 * Tiny typed wrapper around localStorage used as TARAL's "database".
 * Everything is JSON-serialised and every access is guarded so the app keeps
 * working if storage is unavailable (private mode, quota) or corrupted.
 */

export const STORAGE_KEYS = {
  /** Current session user (kept name `user` for backwards compatibility). */
  user: 'user',
  /** Registry of known accounts keyed by email. */
  accounts: 'taral_accounts',
  orders: 'taral_orders',
  products: 'taral_products',
  fuelData: 'taral_fuel_data',
  fleetUnits: 'taral_fleet_units',
  monitoringUnits: 'taral_monitoring_units',
  inquiries: 'taral_inquiries',
  quotes: 'taral_quotes',
  reports: 'taral_reports',
  creditTrades: 'taral_credit_trades',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/** Keys that hold seeded demo collections and are restored on "Reset Demo Data". */
export const SEEDED_KEYS: StorageKey[] = [
  STORAGE_KEYS.orders,
  STORAGE_KEYS.products,
  STORAGE_KEYS.fuelData,
  STORAGE_KEYS.fleetUnits,
  STORAGE_KEYS.monitoringUnits,
  STORAGE_KEYS.reports,
];

/** Keys cleared on "Reset Demo Data" (seeded collections + user-generated data). */
export const RESETTABLE_KEYS: StorageKey[] = [
  ...SEEDED_KEYS,
  STORAGE_KEYS.inquiries,
  STORAGE_KEYS.quotes,
  STORAGE_KEYS.creditTrades,
];

function isBrowserStorageAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch {
    return false;
  }
}

export function get<T>(key: string, fallback: T): T {
  if (!isBrowserStorageAvailable()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function set<T>(key: string, value: T): void {
  if (!isBrowserStorageAvailable()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore write failures (quota / disabled storage) */
  }
}

export function remove(key: string): void {
  if (!isBrowserStorageAvailable()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/**
 * Read a collection from storage, seeding it on first access so subsequent
 * mutations persist. First-run behaviour is identical to the old hardcoded data.
 */
export function getOrSeed<T>(key: string, seed: T): T {
  if (!isBrowserStorageAvailable()) return seed;
  const raw = (() => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  })();
  if (raw === null) {
    set(key, seed);
    return seed;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    set(key, seed);
    return seed;
  }
}
