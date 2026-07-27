import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { KIND_LABELS } from "@/lib/reports";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { MonthPicker } from "@/components/month-picker";
import { currentMonthIso, monthLabel } from "@/lib/utils";
import { saveSnapshots } from "./actions";
import type { Account } from "@/lib/supabase/types";

export default async function SnapshotsPage({
  params,
  searchParams,
}: {
  params: Promise<{ profileId: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const { profileId } = await params;
  const { month: monthParam } = await searchParams;
  const month = monthParam ?? currentMonthIso();

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
    .order("kind", { ascending: true });

  const { data: existingSnapshots } = await supabase
    .from("snapshots")
    .select("*")
    .eq("month", month)
    .in("account_id", (accounts ?? []).map((a) => a.id));

  const snapshotByAccount = new Map((existingSnapshots ?? []).map((s) => [s.account_id, s]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Captura mensual — {profile.name}</h1>
          <p className="text-sm text-slate-500 capitalize">{monthLabel(month)}</p>
        </div>
        <MonthPicker month={month} />
      </div>

      {(!accounts || accounts.length === 0) ? (
        <Card>
          <p className="text-sm text-slate-500">
            No hay cuentas activas. Crea cuentas primero en la sección Cuentas.
          </p>
        </Card>
      ) : (
        <form action={saveSnapshots.bind(null, profileId, month)} className="space-y-4">
          {(accounts as Account[]).map((account) => {
            const existing = snapshotByAccount.get(account.id);
            return (
              <Card key={account.id}>
                <CardTitle>
                  {account.name} · {KIND_LABELS[account.kind]}
                </CardTitle>
                {(account.kind === "bank" || account.kind === "usd_investment") ? (
                  <div>
                    <Label htmlFor={`balance_${account.id}`}>
                      Saldo ({account.currency})
                    </Label>
                    <Input
                      id={`balance_${account.id}`}
                      name={`balance_${account.id}`}
                      type="number"
                      step="0.01"
                      defaultValue={existing?.manual_balance ?? undefined}
                      placeholder="0.00"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`qty_${account.id}`}>
                        {account.kind === "metal"
                          ? `Cantidad (${account.attributes.unit ?? "oz"})`
                          : "Cantidad"}
                      </Label>
                      <Input
                        id={`qty_${account.id}`}
                        name={`qty_${account.id}`}
                        type="number"
                        step="0.00000001"
                        defaultValue={existing?.quantity ?? undefined}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`price_${account.id}`}>
                        Precio manual USD (opcional)
                      </Label>
                      <Input
                        id={`price_${account.id}`}
                        name={`price_${account.id}`}
                        type="number"
                        step="0.01"
                        placeholder={
                          existing?.price_used
                            ? `Automático (último: $${Number(existing.price_used).toFixed(2)})`
                            : "Dejar vacío para usar precio automático"
                        }
                      />
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
          <Button type="submit" className="w-full">
            Guardar snapshot de {monthLabel(month)}
          </Button>
        </form>
      )}
    </div>
  );
}
