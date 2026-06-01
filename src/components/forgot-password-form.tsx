"use client";

import Link from "next/link";
import { startTransition, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setIsPending(true);

    const email = formData.get("email")?.toString().trim() ?? "";
    const redirectTo = `${window.location.origin}/reset-password`;

    const result = await authClient.requestPasswordReset({
      email,
      redirectTo,
    });

    setIsPending(false);

    if (result.error) {
      setError(result.error.message ?? "Could not request a reset link.");
      return;
    }

    startTransition(() => {
      setSent(true);
    });
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      action={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Reset your password</h1>
          <p className="text-sm text-balance text-muted-foreground">
            {"Enter your account email and we'll generate a reset link."}
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="jane@example.com"
            required
            className="bg-background"
          />
        </Field>
        {error ? (
          <Field>
            <FieldError>{error}</FieldError>
          </Field>
        ) : null}
        <Field>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Generating link..." : "Send reset link"}
          </Button>
          <FieldDescription className="text-center">
            {sent
              ? "If the account exists, the reset link has been generated."
              : "The current development setup logs reset links on the server."}
          </FieldDescription>
          <FieldDescription className="text-center">
            <Link href="/login" className="underline underline-offset-4">
              Back to login
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
