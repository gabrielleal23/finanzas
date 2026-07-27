import type { SupabaseClient } from "@supabase/supabase-js";
import type { Account, AccountKind, Database } from "@/lib/supabase/types";

interface SnapshotRow {
  id: string;
  account_id: string;
  month: string;
  value_cop: number;
  value_usd: number;
  accounts: (Account & { profiles: { id: string; name: string } | null }) | null;
}

export interface LatestAccountValue {
  account: Account;
  profileId: string;
  profileName: string;
  month: string;
  valueCop: number;
  valueUsd: number;
}

export interface ProfileTotal {
  profileId: string;
  profileName: string;
  valueCop: number;
  valueUsd: number;
}

export interface KindBreakdown {
  kind: AccountKind;
  valueCop: number;
}

export interface MonthPoint {
  month: string;
  valueCop: number;
  valueUsd: number;
}

async function fetchAllSnapshotsWithAccounts(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("snapshots")
    .select("id, account_id, month, value_cop, value_usd, accounts(*, profiles(id, name))")
    .order("month", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as SnapshotRow[];
}

/** Último snapshot (mes más reciente) por cuenta, opcionalmente filtrado por perfil. */
export async function getLatestPerAccount(
  supabase: SupabaseClient<Database>,
  profileId?: string
): Promise<LatestAccountValue[]> {
  const rows = await fetchAllSnapshotsWithAccounts(supabase);
  const latestByAccount = new Map<string, SnapshotRow>();

  for (const row of rows) {
    if (!row.accounts) continue;
    if (profileId && row.accounts.profiles?.id !== profileId) continue;
    const existing = latestByAccount.get(row.account_id);
    if (!existing || row.month > existing.month) latestByAccount.set(row.account_id, row);
  }

  return Array.from(latestByAccount.values())
    .filter((row) => row.accounts)
    .map((row) => ({
      account: row.accounts as Account,
      profileId: row.accounts!.profiles?.id ?? "",
      profileName: row.accounts!.profiles?.name ?? "",
      month: row.month,
      valueCop: Number(row.value_cop),
      valueUsd: Number(row.value_usd),
    }));
}

export function totalsByProfile(latest: LatestAccountValue[]): ProfileTotal[] {
  const map = new Map<string, ProfileTotal>();
  for (const item of latest) {
    const existing = map.get(item.profileId);
    if (existing) {
      existing.valueCop += item.valueCop;
      existing.valueUsd += item.valueUsd;
    } else {
      map.set(item.profileId, {
        profileId: item.profileId,
        profileName: item.profileName,
        valueCop: item.valueCop,
        valueUsd: item.valueUsd,
      });
    }
  }
  return Array.from(map.values());
}

export function breakdownByKind(latest: LatestAccountValue[]): KindBreakdown[] {
  const map = new Map<AccountKind, number>();
  for (const item of latest) {
    map.set(item.account.kind, (map.get(item.account.kind) ?? 0) + item.valueCop);
  }
  return Array.from(map.entries()).map(([kind, valueCop]) => ({ kind, valueCop }));
}

/** Serie mensual (suma de todos los snapshots de ese mes), opcionalmente filtrada por perfil. */
export async function getMonthlySeries(
  supabase: SupabaseClient<Database>,
  profileId?: string
): Promise<MonthPoint[]> {
  const rows = await fetchAllSnapshotsWithAccounts(supabase);
  const map = new Map<string, MonthPoint>();

  for (const row of rows) {
    if (!row.accounts) continue;
    if (profileId && row.accounts.profiles?.id !== profileId) continue;
    const existing = map.get(row.month);
    if (existing) {
      existing.valueCop += Number(row.value_cop);
      existing.valueUsd += Number(row.value_usd);
    } else {
      map.set(row.month, { month: row.month, valueCop: Number(row.value_cop), valueUsd: Number(row.value_usd) });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
}

export const KIND_LABELS: Record<AccountKind, string> = {
  bank: "Bancos / efectivo",
  usd_investment: "Inversión USD",
  metal: "Metales preciosos",
  other_investment: "Otras inversiones",
};
