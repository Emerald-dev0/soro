/**
 * Money handling — kobo (minor units). ₦500 = 50000 kobo.
 * Never use floats for money. All amounts crossing the system are integers.
 */
export type MoneyMinor = number;

export const NGN_CURRENCY = 'NGN';

export function parseMoney(input: string | number): MoneyMinor {
  if (typeof input === 'number') {
    if (!Number.isFinite(input) || input < 0) throw new Error('Invalid money amount');
    return Math.round(input * 100);
  }
  const cleaned = input.replace(/[₦,\s]/g, '');
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) throw new Error(`Invalid money amount: ${input}`);
  return Math.round(n * 100);
}

export function formatMoney(minor: MoneyMinor, _currency = NGN_CURRENCY): string {
  return `₦${(minor / 100).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function addMoney(a: MoneyMinor, b: MoneyMinor): MoneyMinor { return a + b; }
export function subtractMoney(a: MoneyMinor, b: MoneyMinor): MoneyMinor { return a - b; }
export function compareMoney(a: MoneyMinor, b: MoneyMinor): number { return a < b ? -1 : a > b ? 1 : 0; }
