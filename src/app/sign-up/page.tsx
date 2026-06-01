import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
import { getSession } from "@/lib/auth/session";

export default async function SignUpPage() {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return (
    <AuthShell
      eyebrow="Create account"
      title="Start with an account, then create your bakery."
      description="The first step is a simple email and password account. Bakery setup happens immediately after sign-up."
    >
      <AuthForm mode="sign-up" />
    </AuthShell>
  );
}
