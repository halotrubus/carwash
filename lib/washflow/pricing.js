import { ADDONS, DIRTINESS } from './constants';

// Compute order totals
// order: { categoryId, packageId, dirtiness, addonIds:[] }
// db: provides pricingMatrix & addonPrices
export function computePrice(db, { categoryId, packageId, dirtiness, addonIds = [] }, discount = 0) {
  const base = db?.pricingMatrix?.[categoryId]?.[packageId]?.[dirtiness] || 0;
  const addonItems = addonIds.map((id) => ({
    id,
    name: ADDONS.find((a) => a.id === id)?.name || id,
    price: db?.addonPrices?.[id] || 0,
  }));
  const addonTotal = addonItems.reduce((s, a) => s + a.price, 0);
  const subtotal = base + addonTotal;
  const total = Math.max(0, subtotal - (discount || 0));
  return { base, addonItems, addonTotal, subtotal, discount: discount || 0, total };
}

// Recommendation from inspection indicator values
// values: array of 'ringan' | 'sedang' | 'berat'
export function recommendDirtiness(values = []) {
  const vals = values.filter(Boolean);
  if (vals.length === 0) return 'ringan';
  if (vals.some((v) => v === 'berat')) return 'berat';
  if (vals.some((v) => v === 'sedang')) return 'sedang';
  return 'ringan';
}

export function dirtinessMeta(id) {
  return DIRTINESS.find((d) => d.id === id) || DIRTINESS[0];
}
