// Shared freelance categories, urgency levels and Indian city suggestions (browser- and server-safe).
/** Freelance categories with their sub-categories. */
export const FREELANCE_CATEGORIES = [
  { name: "Web Development", emoji: "💻", subs: ["Frontend Development", "Backend Development", "Full Stack Development", "WordPress Development"] },
  { name: "Graphic Design", emoji: "🎨", subs: ["Logo Design", "Social Media Design", "Branding", "UI/UX Design"] },
  { name: "Content Writing", emoji: "✍️", subs: ["Blog Writing", "Copywriting", "Technical Writing", "Website Content"] },
  { name: "Video Editing", emoji: "🎬", subs: ["YouTube Video Editing", "Reels and Shorts Editing", "Motion Graphics", "Promotional Videos"] },
  { name: "Digital Marketing", emoji: "📈", subs: ["SEO", "Social Media Management", "Google Ads", "Content Marketing"] },
  { name: "Data Entry and Virtual Assistance", emoji: "🗂️", subs: ["Data Entry", "Excel Work", "Virtual Assistance", "Internet Research"] },
  { name: "AI and Machine Learning", emoji: "🤖", subs: ["AI Chatbot Development", "Machine Learning Projects", "Python Automation", "AI Integration"] },
  { name: "App Development", emoji: "📱", subs: ["Android Development", "iOS Development", "Cross-Platform Development"] },
  { name: "Photography and Creative Media", emoji: "📷", subs: ["Photo Editing", "Image Retouching", "Digital Illustration", "Creative Design"] },
  { name: "Other Professional Freelance Work", emoji: "🧩", subs: [] as string[] },
] as const;

export const OTHER_CATEGORY = "Other Professional Freelance Work";
export const JOB_CATEGORIES: string[] = FREELANCE_CATEGORIES.map((c) => c.name);

export function subcategoriesFor(category: string): readonly string[] {
  return FREELANCE_CATEGORIES.find((c) => c.name === category)?.subs ?? [];
}

export const PROJECT_TYPES = [
  { value: "fixed", label: "Fixed Price" },
  { value: "hourly", label: "Hourly" },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "expert", label: "Expert" },
] as const;

export const PROJECT_DURATIONS = [
  "Less than 1 week",
  "1 to 2 weeks",
  "2 to 4 weeks",
  "1 to 3 months",
  "More than 3 months",
] as const;

export const AVAILABILITY_OPTIONS = ["Full-time", "Part-time", "Weekends only", "Not available"] as const;

export function labelFor(list: readonly { value: string; label: string }[], value: string | null | undefined): string {
  return list.find((x) => x.value === value)?.label ?? (value || "—");
}

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
