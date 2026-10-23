const ECUADOR_LOCALE = "es-EC";
const USD = "USD";

export function formatUsdFromCents(cents: number): string {
  return formatUsd(cents / 100);
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat(ECUADOR_LOCALE, {
    style: "currency",
    currency: USD,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDateEc(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  },
): string {
  const value = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(ECUADOR_LOCALE, {
    timeZone: "America/Guayaquil",
    ...options,
  }).format(value);
}

export function formatDateTimeEc(date: Date | string | number): string {
  return formatDateEc(date, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
