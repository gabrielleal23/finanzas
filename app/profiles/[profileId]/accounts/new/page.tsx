import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardTitle } from "@/components/ui/card";
import { AccountForm } from "@/components/account-form";
import { createAccount } from "../actions";

export default async function NewAccountPage({
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

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardTitle>Nueva cuenta</CardTitle>
        <AccountForm action={createAccount.bind(null, profileId)} />
      </Card>
    </div>
  );
}
