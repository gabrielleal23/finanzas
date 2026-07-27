import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardTitle } from "@/components/ui/card";
import { AccountForm } from "@/components/account-form";
import { updateAccount } from "../../actions";

export default async function EditAccountPage({
  params,
}: {
  params: Promise<{ profileId: string; accountId: string }>;
}) {
  const { profileId, accountId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: account } = await supabase.from("accounts").select("*").eq("id", accountId).single();
  if (!account) notFound();

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardTitle>Editar cuenta</CardTitle>
        <AccountForm account={account} action={updateAccount.bind(null, profileId, accountId)} />
      </Card>
    </div>
  );
}
