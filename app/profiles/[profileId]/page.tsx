import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLatestPerAccount, breakdownByKind } from "@/lib/reports";
import { KIND_LABELS } from "@/lib/reports";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AssetBreakdownChart } from "@/components/asset-breakdown-chart";
import { formatCop, formatUsd } from "@/lib/utils";

export default async function ProfilePage({
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .single();

  if (!profile) notFound();

  const latest = await getLatestPerAccount(supabase, profileId);
  const breakdown = breakdownByKind(latest);
  const totalCop = latest.reduce((sum, a) => sum + a.valueCop, 0);
  const totalUsd = latest.reduce((sum, a) => sum + a.valueUsd, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{profile.name}</h1>
          <p className="text-sm text-slate-500">Patrimonio y cuentas de {profile.name}.</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/profiles/${profileId}/accounts`}>
            <Button variant="secondary">Cuentas</Button>
          </Link>
          <Link href={`/profiles/${profileId}/snapshots`}>
            <Button>Captura mensual</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardTitle>Patrimonio total</CardTitle>
          <p className="text-3xl font-semibold text-slate-900">{formatCop(totalCop)}</p>
          <p className="text-sm text-slate-500">{formatUsd(totalUsd)}</p>
        </Card>
        <Card>
          <CardTitle>Composición</CardTitle>
          <AssetBreakdownChart data={breakdown} />
        </Card>
      </div>

      <Card>
        <CardTitle>Cuentas</CardTitle>
        <ul className="divide-y divide-slate-100">
          {latest.map((item) => (
            <li key={item.account.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <p className="font-medium text-slate-800">{item.account.name}</p>
                <p className="text-slate-500">{KIND_LABELS[item.account.kind]}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-slate-900">{formatCop(item.valueCop)}</p>
                <p className="text-slate-500">{formatUsd(item.valueUsd)}</p>
              </div>
            </li>
          ))}
          {latest.length === 0 && (
            <li className="py-2 text-sm text-slate-500">
              Aún no hay cuentas con datos. Ve a{" "}
              <Link href={`/profiles/${profileId}/accounts`} className="underline">
                Cuentas
              </Link>{" "}
              para crear la primera.
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}
