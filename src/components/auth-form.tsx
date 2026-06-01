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

type AuthFormMode = "sign-in" | "sign-up";

type AuthFormProps = React.ComponentProps<"form"> & {
  mode: AuthFormMode;
};

export function AuthForm({
  className,
  mode,
  ...props
}: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setIsPending(true);

    const email = formData.get("email")?.toString().trim() ?? "";
    const password = formData.get("password")?.toString() ?? "";
    const name = formData.get("name")?.toString().trim() ?? "";

    const result =
      mode === "sign-in"
        ? await authClient.signIn.email({
            email,
            password,
          })
        : await authClient.signUp.email({
            name,
            email,
            password,
          });

    setIsPending(false);

    if (result.error) {
      setError(result.error.message ?? "Something went wrong.");
      return;
    }

    startTransition(() => {
      router.push("/");
      router.refresh();
    });
  }

  const isSignIn = mode === "sign-in";

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      action={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">
            {isSignIn ? "Login to your account" : "Create your account"}
          </h1>
          <p className="text-sm text-balance text-muted-foreground">
            {isSignIn
              ? "Enter your email below to continue."
              : "Set up your account before creating your bakery."}
          </p>
        </div>

        {!isSignIn ? (
          <Field>
            <FieldLabel htmlFor="name">Full name</FieldLabel>
            <Input
              id="name"
              name="name"
              placeholder="Jane Baker"
              required
              className="bg-background"
            />
          </Field>
        ) : null}

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

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            {isSignIn ? (
              <Link
                href="/forgot-password"
                className="ml-auto text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </Link>
            ) : null}
          </div>
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
            {isPending
              ? isSignIn
                ? "Signing in..."
                : "Creating account..."
              : isSignIn
                ? "Login"
                : "Create account"}
          </Button>
          <FieldDescription className="text-center">
            {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
            <Link
              href={isSignIn ? "/sign-up" : "/login"}
              className="underline underline-offset-4"
            >
              {isSignIn ? "Sign up" : "Login"}
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
