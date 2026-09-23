const CURRENCY_SYMBOLS: Record<string, string> = {
  CAD: "$",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

const DEFAULT_CURRENCY = "CAD";

/**
 * Formats an hourly rate for display, e.g. `500 $ CAD`.
 * Falls back to CAD when the profile has no currency set.
 */
export function formatRate(rate: number | null | undefined, currency?: string | null): string {
  const code = (currency || DEFAULT_CURRENCY).toUpperCase();
  const symbol = CURRENCY_SYMBOLS[code];
  const amount = Number(rate ?? 0).toLocaleString("fr-CA");
  return symbol ? `${amount} ${symbol} ${code}` : `${amount} ${code}`;
}
