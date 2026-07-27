import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export function formatCop(value: number) {
  return copFormatter.format(value);
}

export function formatUsd(value: number) {
  return usdFormatter.format(value);
}

export function monthLabel(monthIso: string) {
  const date = new Date(`${monthIso}T00:00:00`);
  return new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric" }).format(date);
}

export function currentMonthIso() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}
