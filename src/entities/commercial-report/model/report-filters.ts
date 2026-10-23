export type ReportFilters = {
  tenantId: string;
  dateFrom: string;
  dateTo: string;
  branchId: string | null;
  registerId: string | null;
  cashierId: string | null;
  paymentMethod: "all" | "cash" | "transfer_reported" | "transfer_confirmed";
};

export type ComparePeriodMode = "none" | "previous";

export type ReportQuery = ReportFilters & {
  compare: ComparePeriodMode;
};

const EC_TZ = "America/Guayaquil";

export function ecDateKey(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: EC_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export function defaultReportDateRange(reference = new Date()): { dateFrom: string; dateTo: string } {
  const dateTo = ecDateKey(reference.toISOString());
  const [yStr, mStr] = dateTo.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const from = new Date(Date.UTC(y, m - 1, 1, 12, 0, 0));
  const dateFrom = new Intl.DateTimeFormat("en-CA", {
    timeZone: EC_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(from);
  return { dateFrom, dateTo };
}

export function previousPeriod(dateFrom: string, dateTo: string): { dateFrom: string; dateTo: string } {
  const [yfStr, mfStr, dfStr] = dateFrom.split("-");
  const [ytStr, mtStr, dtStr] = dateTo.split("-");
  const yf = Number(yfStr);
  const mf = Number(mfStr);
  const df = Number(dfStr);
  const yt = Number(ytStr);
  const mt = Number(mtStr);
  const dt = Number(dtStr);
  const start = Date.UTC(yf, mf - 1, df);
  const end = Date.UTC(yt, mt - 1, dt);
  const days = Math.round((end - start) / 86400000) + 1;
  const prevEnd = new Date(start - 86400000);
  const prevStart = new Date(prevEnd.getTime() - (days - 1) * 86400000);
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: EC_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  return { dateFrom: fmt(prevStart), dateTo: fmt(prevEnd) };
}

export function inDateRange(iso: string, from: string, to: string): boolean {
  const k = ecDateKey(iso);
  return k >= from && k <= to;
}
