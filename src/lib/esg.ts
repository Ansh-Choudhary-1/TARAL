/**
 * Derives ESG / carbon figures from real order history so the numbers on the
 * dashboards and the ESG Reports screen move as orders are placed and switched.
 */

import type { Order } from './seedData';

interface FuelProfile {
  /** Residual CO₂ in tons per MT burned. */
  co2PerMt: number;
  /** Cost saved in ₹ per MT versus the coal baseline. */
  savingPerMt: number;
  /** Share of the fuel that counts as clean energy (0-1). */
  cleanFactor: number;
}

/** Tons of CO₂ avoided per MT versus an equivalent coal burn. */
export const COAL_CO2_PER_MT = 2.42;
/** ₹ paid per ton of CO₂ avoided when converting to carbon credits. */
export const CREDIT_RATE_PER_TON = 1500;

const FUEL_PROFILES: Record<string, FuelProfile> = {
  'Biomass Pellets': { co2PerMt: 0.1, savingPerMt: 1200, cleanFactor: 1 },
  'Premium Biomass Pellets': { co2PerMt: 0.1, savingPerMt: 1200, cleanFactor: 1 },
  Briquettes: { co2PerMt: 0.12, savingPerMt: 1000, cleanFactor: 1 },
  'Agricultural Briquettes': { co2PerMt: 0.12, savingPerMt: 1000, cleanFactor: 1 },
  'Wood Chip Pellets': { co2PerMt: 0.08, savingPerMt: 1100, cleanFactor: 1 },
  'RDF Pellets': { co2PerMt: 0.6, savingPerMt: 900, cleanFactor: 0.7 },
  'RDF Pellets (Industrial)': { co2PerMt: 0.6, savingPerMt: 900, cleanFactor: 0.7 },
};

const DEFAULT_PROFILE: FuelProfile = { co2PerMt: 0.5, savingPerMt: 800, cleanFactor: 0.8 };

function profileFor(fuel: string): FuelProfile {
  return FUEL_PROFILES[fuel] ?? DEFAULT_PROFILE;
}

export interface EsgSummary {
  ordersCount: number;
  totalQuantity: number;
  co2ReducedTons: number;
  creditsEarned: number;
  monthlySavings: number;
  totalSavings: number;
  cleanEnergyPct: number;
  wasteReducedMt: number;
  /** Per-fuel breakdown used by the ESG portfolio view. */
  byFuel: { fuel: string; quantity: number; co2ReducedTons: number; creditsEarned: number }[];
}

function isSameMonth(dateStr: string, ref: Date): boolean {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

/** CO₂ avoided (tons) and credit value (₹) for a single order. */
export function orderEsg(order: Order): { co2ReducedTons: number; creditsEarned: number } {
  if (order.status === 'Cancelled') return { co2ReducedTons: 0, creditsEarned: 0 };
  const profile = profileFor(order.fuel);
  const co2ReducedTons = Math.max(0, order.quantity * (COAL_CO2_PER_MT - profile.co2PerMt));
  return {
    co2ReducedTons,
    creditsEarned: Math.round(co2ReducedTons * CREDIT_RATE_PER_TON),
  };
}

export function computeEsg(orders: Order[], now: Date = new Date()): EsgSummary {
  const active = orders.filter((o) => o.status !== 'Cancelled');

  const byFuelMap = new Map<string, { quantity: number; co2ReducedTons: number; creditsEarned: number }>();
  let co2ReducedTons = 0;
  let creditsEarned = 0;
  let totalSavings = 0;
  let monthlySavings = 0;
  let totalQuantity = 0;
  let cleanQuantity = 0;

  for (const order of active) {
    const profile = profileFor(order.fuel);
    const { co2ReducedTons: orderCo2, creditsEarned: orderCredits } = orderEsg(order);
    const saving = order.quantity * profile.savingPerMt;

    co2ReducedTons += orderCo2;
    creditsEarned += orderCredits;
    totalSavings += saving;
    totalQuantity += order.quantity;
    cleanQuantity += order.quantity * profile.cleanFactor;
    if (isSameMonth(order.orderDate, now)) monthlySavings += saving;

    const bucket = byFuelMap.get(order.fuel) ?? { quantity: 0, co2ReducedTons: 0, creditsEarned: 0 };
    bucket.quantity += order.quantity;
    bucket.co2ReducedTons += orderCo2;
    bucket.creditsEarned += orderCredits;
    byFuelMap.set(order.fuel, bucket);
  }

  return {
    ordersCount: active.length,
    totalQuantity,
    co2ReducedTons: Math.round(co2ReducedTons * 10) / 10,
    creditsEarned,
    monthlySavings: Math.round(monthlySavings),
    totalSavings: Math.round(totalSavings),
    cleanEnergyPct: totalQuantity > 0 ? Math.round((cleanQuantity / totalQuantity) * 100) : 0,
    wasteReducedMt: Math.round(totalQuantity * 0.6 * 10) / 10,
    byFuel: [...byFuelMap.entries()]
      .map(([fuel, v]) => ({
        fuel,
        quantity: v.quantity,
        co2ReducedTons: Math.round(v.co2ReducedTons * 10) / 10,
        creditsEarned: v.creditsEarned,
      }))
      .sort((a, b) => b.creditsEarned - a.creditsEarned),
  };
}
