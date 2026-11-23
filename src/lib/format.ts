// India-first display formatting. Amounts are stored as plain INR numbers; dates as ISO.

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Rupee amount with Indian digit grouping, e.g. 150000 -> "₹1,50,000". */
export function formatINR(amount: number | string | null | undefined): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (n == null || !Number.isFinite(n)) return "—";
  return inr.format(Math.round(n));
}

/** Hourly rate, e.g. 450 -> "₹450/hr". */
export function formatRate(rate: number | string | null | undefined, perHour = "/hr"): string {
  return `${formatINR(rate)}${perHour}`;
}



/**
 * DD/MM/YYYY. Date-only values ("2026-12-16") are read as calendar dates so they never shift
 * by a day across time zones; timestamps are shown in India Standard Time.
 */
export function formatDate(value: string | Date | null | undefined): string {
  if (value == null || value === "") return "—";
  if (typeof value === "string") {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  }
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("day")}/${get("month")}/${get("year")}`;
}

/** Distance label; PIN-area centres are approximate, so never claim exactness. */
export function formatKm(km: number): string {
  if (km < 1) return "< 1 km";
  if (km < 10) return `≈ ${km.toFixed(1)} km`;
  return `≈ ${Math.round(km).toLocaleString("en-IN")} km`;
}


