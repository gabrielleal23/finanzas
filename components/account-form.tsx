"use client";

import { useState } from "react";
import type { Account, AccountKind } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

const KIND_OPTIONS: { value: AccountKind; label: string }[] = [
  { value: "bank", label: "Cuenta bancaria / efectivo" },
  { value: "usd_investment", label: "Inversión en USD" },
  { value: "metal", label: "Metal precioso" },
  { value: "other_investment", label: "Otra inversión (acción/fondo/cripto)" },
];

export function AccountForm({
  action,
  account,
}: {
  action: (formData: FormData) => void;
  account?: Account;
}) {
  const [kind, setKind] = useState<AccountKind>(account?.kind ?? "bank");

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" required defaultValue={account?.name} placeholder="Ej. Bancolombia ahorros" />
      </div>

      <div>
        <Label htmlFor="kind">Tipo de cuenta</Label>
        <Select
          id="kind"
          name="kind"
          value={kind}
          disabled={!!account}
          onChange={(e) => setKind(e.target.value as AccountKind)}
        >
          {KIND_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        {account && (
          <>
            <input type="hidden" name="kind" value={kind} />
            <p className="mt-1 text-xs text-slate-400">El tipo no se puede cambiar después de crear la cuenta.</p>
          </>
        )}
      </div>

      {kind === "bank" ? (
        <div>
          <Label htmlFor="currency">Moneda</Label>
          <Select id="currency" name="currency" defaultValue={account?.currency ?? "COP"}>
            <option value="COP">COP</option>
            <option value="USD">USD</option>
          </Select>
        </div>
      ) : (
        <input type="hidden" name="currency" value={kind === "usd_investment" ? "USD" : "COP"} />
      )}

      {kind === "metal" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="metal_type">Metal</Label>
            <Select id="metal_type" name="metal_type" defaultValue={account?.attributes.metal_type ?? "gold"}>
              <option value="gold">Oro</option>
              <option value="silver">Plata</option>
              <option value="platinum">Platino</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="unit">Unidad</Label>
            <Select id="unit" name="unit" defaultValue={account?.attributes.unit ?? "oz"}>
              <option value="oz">Onzas troy</option>
              <option value="g">Gramos</option>
            </Select>
          </div>
        </div>
      )}

      {kind === "other_investment" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="asset_type">Tipo de activo</Label>
            <Select id="asset_type" name="asset_type" defaultValue={account?.attributes.asset_type ?? "stock"}>
              <option value="stock">Acción</option>
              <option value="fund">Fondo</option>
              <option value="crypto">Cripto</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="symbol">Símbolo</Label>
            <Input
              id="symbol"
              name="symbol"
              required
              defaultValue={account?.attributes.symbol}
              placeholder="AAPL, o bitcoin para cripto"
            />
          </div>
        </div>
      )}

      <Button type="submit" className="w-full">
        {account ? "Guardar cambios" : "Crear cuenta"}
      </Button>
    </form>
  );
}
