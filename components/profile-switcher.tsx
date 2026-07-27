"use client";

import { useRouter, usePathname } from "next/navigation";
import type { Profile } from "@/lib/supabase/types";
import { Select } from "@/components/ui/input";

export function ProfileSwitcher({ profiles }: { profiles: Profile[] }) {
  const router = useRouter();
  const pathname = usePathname();

  const match = pathname.match(/^\/profiles\/([^/]+)(\/.*)?$/);
  const currentProfileId = match?.[1] ?? profiles[0]?.id;
  const suffix = match?.[2] ?? "";

  function handleChange(profileId: string) {
    router.push(`/profiles/${profileId}${suffix}`);
  }

  return (
    <Select
      className="w-auto"
      value={currentProfileId}
      onChange={(e) => handleChange(e.target.value)}
    >
      {profiles.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </Select>
  );
}
