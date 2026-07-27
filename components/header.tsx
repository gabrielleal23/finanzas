import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProfileSwitcher } from "@/components/profile-switcher";
import { SignOutButton } from "@/components/sign-out-button";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-slate-900">
          Finanzas
        </Link>
        <nav className="flex gap-4 text-sm text-slate-600">
          <Link href="/" className="hover:text-slate-900">
            Consolidado
          </Link>
          <Link href="/reports" className="hover:text-slate-900">
            Reportes
          </Link>
        </nav>
        {profiles && profiles.length > 0 && (
          <div className="ml-auto flex items-center gap-3">
            <ProfileSwitcher profiles={profiles} />
          </div>
        )}
        <SignOutButton />
      </div>
    </header>
  );
}
