import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSalary(salary?: string | number | null): string | null {
  if (salary === null || salary === undefined || salary === "") return null;
  const value = Number(salary);
  if (Number.isNaN(value)) return String(salary);
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function formatDate(date?: string | null): string {
  return date ? new Date(date).toLocaleDateString() : "";
}

// Reads a File or Blob as base64 without the "data:...;base64," prefix
export function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
