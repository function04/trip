import type { ExchangeRate } from "@/types";

export function convertToKRW(
  amount: number,
  currency: string,
  paymentMethod: string,
  rates: ExchangeRate[]
): number {
  if (currency === "KRW") return amount;

  const rate = rates.find(
    (r) => r.currency === currency && r.payment_method === paymentMethod
  );

  if (!rate) return amount; // fallback: return as-is
  return Math.round(amount * rate.rate_to_krw);
}

export function formatKRW(amount: number): string {
  return new Intl.NumberFormat("ko-KR").format(amount) + "원";
}

export function formatAmount(amount: number, currency: string): string {
  switch (currency) {
    case "GBP":
      return `£${amount.toFixed(2)}`;
    case "EUR":
      return `€${amount.toFixed(2)}`;
    case "KRW":
      return `₩${new Intl.NumberFormat("ko-KR").format(amount)}`;
    default:
      return String(amount);
  }
}
