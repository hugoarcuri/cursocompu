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
  return String(age);
}
