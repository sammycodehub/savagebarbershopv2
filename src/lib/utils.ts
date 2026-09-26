import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format a number as Ghanaian cedi currency, e.g. GHS 120.00 */
export function formatCurrency(amount: number, currency: string = "GHS") {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/** Format an ISO timestamp into a friendly date + time label, e.g. "Fri, 12 Sep · 2:30 PM" */
export function formatDateTimeLabel(isoString: string) {
  const date = new Date(isoString);
  const datePart = new Intl.DateTimeFormat("en-GH", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(date);
  const timePart = new Intl.DateTimeFormat("en-GH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
  return `${datePart} · ${timePart}`;
}

export function formatDuration(mins: number) {
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

/** Days of week labels matching Postgres's 0=Sunday convention used in operating_hours */
export const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Format seconds remaining as mm:ss, used for the 10-minute hold countdown */
export function formatCountdown(totalSeconds: number) {
  const minutes = Math.max(0, Math.floor(totalSeconds / 60));
  const seconds = Math.max(0, totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
