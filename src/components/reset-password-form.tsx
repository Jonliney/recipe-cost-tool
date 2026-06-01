"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

type ResetPasswordFormProps = React.ComponentProps<"form"> & {
  token: string;
};

export function ResetPasswordForm({
  className,
  token,
  ...props
}: ResetPasswordFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setIsPending(true);

    const newPassword = formData.get("password")?.toString() ?? "";

    const result = await authClient.resetPassword({
      newPassword,
      token,
    });

    setIsPending(false);

    if (result.error) {
      setError(result.error.message ?? "Could not reset your password.");
      return;
    }

    startTransition(() => {
      router.push("/login");
      router.refresh();
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
          <h1 className="text-2xl font-bold">Choose a new password</h1>
          <p className="text-sm text-balance text-muted-foreground">
            {"Set the password you'll use to sign in going forward."}
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="password">New password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
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
            {isPending ? "Resetting password..." : "Reset password"}
          </Button>
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
