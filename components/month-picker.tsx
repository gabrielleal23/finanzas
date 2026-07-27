"use client";

import { useRouter, usePathname } from "next/navigation";

export function MonthPicker({ month }: { month: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <input
      type="month"
      value={month.slice(0, 7)}
      onChange={(e) => router.push(`${pathname}?month=${e.target.value}-01`)}
      className="rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
    />
  );
}
