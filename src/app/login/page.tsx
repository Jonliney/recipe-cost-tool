import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
import { getSession } from "@/lib/auth/session";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return (
    <AuthShell
      eyebrow="Sign in"
      title="Access your bakery workspace."
      description="Use your email and password to manage ingredient pricing, recipes, and production runs."
    >
      <AuthForm mode="sign-in" />
    </AuthShell>
  );
}
