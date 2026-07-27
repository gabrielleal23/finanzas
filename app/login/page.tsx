"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setStatus("error");
      setError(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 text-xl font-semibold text-slate-900">Finanzas</h1>
        <p className="mb-5 text-sm text-slate-500">
          Ingresa tu correo y te enviamos un enlace de acceso.
        </p>
        {status === "sent" ? (
          <p className="text-sm text-emerald-700">
            Listo, revisa tu correo <strong>{email}</strong> y da clic en el enlace para entrar.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
              />
            </div>
            {status === "error" && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={status === "sending"}>
              {status === "sending" ? "Enviando..." : "Enviar enlace de acceso"}
            </Button>
          </form>
        )}
      </Card>
    </main>
  );
}
