import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLatestPerAccount, getMonthlySeries, breakdownByKind } from "@/lib/reports";
import { Card, CardTitle } from "@/components/ui/card";
import { NetWorthChart } from "@/components/net-worth-chart";
import { AssetBreakdownChart } from "@/components/asset-breakdown-chart";
import { ReportProfileFilter } from "@/components/report-profile-filter";
import { formatCop, formatUsd, monthLabel } from "@/lib/utils";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ profile?: string }>;
}) {
  const { profile: profileId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  const series = await getMonthlySeries(supabase, profileId);
  const latest = await getLatestPerAccount(supabase, profileId);
  const breakdown = breakdownByKind(latest);

  const rows = series.map((point, index) => {
    const prev = series[index - 1];
    const deltaCop = prev ? point.valueCop - prev.valueCop : null;
    const deltaPct = prev && prev.valueCop !== 0 ? (deltaCop! / prev.valueCop) * 100 : null;
    return { ...point, deltaCop, deltaPct };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Reportes</h1>
          <p className="text-sm text-slate-500">Patrimonio neto y variación mes a mes.</p>
        </div>
        <ReportProfileFilter profiles={profiles ?? []} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Evolución del patrimonio (COP)</CardTitle>
          <NetWorthChart data={series} />
        </Card>
        <Card>
          <CardTitle>Composición por tipo de activo (mes más reciente por cuenta)</CardTitle>
          <AssetBreakdownChart data={breakdown} />
        </Card>
      </div>

      <Card>
        <CardTitle>Variación mes a mes</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2 pr-4">Mes</th>
                <th className="py-2 pr-4">Patrimonio (COP)</th>
                <th className="py-2 pr-4">Patrimonio (USD)</th>
                <th className="py-2 pr-4">Variación (COP)</th>
                <th className="py-2">Variación %</th>
              </tr>
            </thead>
            <tbody>
              {[...rows].reverse().map((row) => (
                <tr key={row.month} className="border-b border-slate-100">
                  <td className="py-2 pr-4 capitalize">{monthLabel(row.month)}</td>
                  <td className="py-2 pr-4">{formatCop(row.valueCop)}</td>
                  <td className="py-2 pr-4">{formatUsd(row.valueUsd)}</td>
                  <td
                    className={`py-2 pr-4 ${
                      row.deltaCop == null ? "text-slate-400" : row.deltaCop >= 0 ? "text-emerald-700" : "text-red-600"
                    }`}
                  >
                    {row.deltaCop == null ? "—" : formatCop(row.deltaCop)}
                  </td>
                  <td
                    className={
                      row.deltaPct == null ? "text-slate-400" : row.deltaPct >= 0 ? "text-emerald-700" : "text-red-600"
                    }
                  >
                    {row.deltaPct == null ? "—" : `${row.deltaPct.toFixed(1)}%`}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-500">
                    Aún no hay snapshots mensuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
