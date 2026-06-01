import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth-shell";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { getSession } from "@/lib/auth/session";

export default async function ForgotPasswordPage() {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return (
    <AuthShell
      eyebrow="Reset access"
      title="Generate a password reset link."
      description="This development setup logs reset links on the server so the flow can be wired before email delivery is implemented."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
