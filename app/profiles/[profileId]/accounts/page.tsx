import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { KIND_LABELS } from "@/lib/reports";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deactivateAccount } from "./actions";

export default async function AccountsPage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", profileId).single();
  if (!profile) notFound();

  const { data: accounts } = await supabase
    .from("accounts")
    .select("*")
    .eq("profile_id", profileId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Cuentas de {profile.name}</h1>
          <p className="text-sm text-slate-500">Bancos, inversiones USD, metales y otras inversiones.</p>
        </div>
        <Link href={`/profiles/${profileId}/accounts/new`}>
          <Button>Nueva cuenta</Button>
        </Link>
      </div>

      <Card>
        <CardTitle>Todas las cuentas</CardTitle>
        <ul className="divide-y divide-slate-100">
          {(accounts ?? []).map((account) => (
            <li key={account.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium text-slate-800">{account.name}</p>
                <p className="text-slate-500">{KIND_LABELS[account.kind]}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/profiles/${profileId}/accounts/${account.id}/edit`}>
                  <Button variant="secondary">Editar</Button>
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await deactivateAccount(profileId, account.id);
                  }}
                >
                  <Button variant="danger" type="submit">
                    Eliminar
                  </Button>
                </form>
              </div>
            </li>
          ))}
          {(!accounts || accounts.length === 0) && (
            <li className="py-3 text-sm text-slate-500">No hay cuentas todavía.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
