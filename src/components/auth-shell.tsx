import Link from "next/link";
import { GalleryVerticalEndIcon } from "lucide-react";

import { appConfig } from "@/lib/config/app";

type AuthShellProps = {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
};

export function AuthShell({
  children,
  eyebrow,
  title,
  description,
}: AuthShellProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-6 p-6 md:p-10">
        <div className="flex justify-center md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEndIcon className="size-4" />
            </div>
            {appConfig.name}
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
      <div className="hidden bg-muted lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-balance">
              {title}
            </h1>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        <div className="max-w-xl rounded-xl border bg-background p-6">
          <div className="flex flex-col gap-3">
            <h2 className="text-base font-medium">Milestone 1</h2>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-muted-foreground">
              <li>Bakery sign-in and onboarding</li>
              <li>Org-scoped app data model for ingredients, recipes, and runs</li>
              <li>Historical pricing with versioned recipe structures</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
