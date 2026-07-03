import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calcAgeRange(
  day: number | null,
  month: number | null,
  year: number | null,
  ref: string,
): string | null {
  if (!day || !month || !year || !ref) return null;
  const refDate = new Date(ref);
  const birth = new Date(year, month - 1, day);
  let age = refDate.getFullYear() - birth.getFullYear();
  const monthDiff = refDate.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && refDate.getDate() < birth.getDate())) age--;
  if (age < 14) return null;
  if (age <= 24) return String(age);
  if (age <= 29) return "25-29";
  if (age <= 34) return "30-34";
  if (age <= 39) return "35-39";
  if (age <= 49) return "40-49";
  return "50+";
}
