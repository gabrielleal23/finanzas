import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLatestPerAccount, getMonthlySeries, totalsByProfile, breakdownByKind } from "@/lib/reports";
import { Card, CardTitle } from "@/components/ui/card";
import { NetWorthChart } from "@/components/net-worth-chart";
import { AssetBreakdownChart } from "@/components/asset-breakdown-chart";
import { formatCop, formatUsd } from "@/lib/utils";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const latest = await getLatestPerAccount(supabase);
  const series = await getMonthlySeries(supabase);
  const profileTotals = totalsByProfile(latest);
  const breakdown = breakdownByKind(latest);

  const totalCop = profileTotals.reduce((sum, p) => sum + p.valueCop, 0);
  const totalUsd = profileTotals.reduce((sum, p) => sum + p.valueUsd, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Patrimonio consolidado</h1>
        <p className="text-sm text-slate-500">Suma de todas las personas y cuentas.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardTitle>Patrimonio total (COP)</CardTitle>
          <p className="text-3xl font-semibold text-slate-900">{formatCop(totalCop)}</p>
          <p className="text-sm text-slate-500">{formatUsd(totalUsd)}</p>
        </Card>
        <Card>
          <CardTitle>Por persona</CardTitle>
          <ul className="space-y-1">
            {profileTotals.map((p) => (
              <li key={p.profileId} className="flex justify-between text-sm">
                <Link href={`/profiles/${p.profileId}`} className="text-slate-700 hover:underline">
                  {p.profileName}
                </Link>
                <span className="font-medium text-slate-900">{formatCop(p.valueCop)}</span>
              </li>
            ))}
            {profileTotals.length === 0 && (
              <li className="text-sm text-slate-500">Aún no hay cuentas registradas.</li>
            )}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Evolución del patrimonio</CardTitle>
          <NetWorthChart data={series} />
        </Card>
        <Card>
          <CardTitle>Composición por tipo de activo</CardTitle>
          <AssetBreakdownChart data={breakdown} />
        </Card>
      </div>
    </div>
  );
}
