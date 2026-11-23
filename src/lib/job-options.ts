// Shared job categories, urgency levels and Indian city suggestions (browser- and server-safe).
export const JOB_CATEGORIES = [
  "Tutoring",
  "Design",
  "Repairs",
  "Event Help",
  "Photography",
  "Photo Editing",
  "Other",
] as const;

export const JOB_URGENCIES = ["low", "medium", "high"] as const;

export const INDIAN_CITIES = [
  "Jaipur",
  "Delhi",
  "Mumbai",
  "Bengaluru",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Lucknow",
  "Chandigarh",
] as const;

/** Six-digit Indian PIN code: first digit 1-9 (no PIN starts with 0). */
export const PINCODE_PATTERN = /^[1-9][0-9]{5}$/;

export function isValidPincode(value: string | null | undefined): boolean {
  return PINCODE_PATTERN.test((value ?? "").trim());
}

/** Empty input becomes null; anything else is trimmed. */
export function normalizePincode(value: string): string | null {
  const v = value.replace(/\s+/g, "");
  return v === "" ? null : v;
}
