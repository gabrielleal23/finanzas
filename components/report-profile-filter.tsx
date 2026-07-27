"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Profile } from "@/lib/supabase/types";
import { Select } from "@/components/ui/input";

export function ReportProfileFilter({ profiles }: { profiles: Profile[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("profile") ?? "all";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("profile");
    else params.set("profile", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select className="w-auto" value={current} onChange={(e) => handleChange(e.target.value)}>
      <option value="all">Todos (consolidado)</option>
      {profiles.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </Select>
  );
}
