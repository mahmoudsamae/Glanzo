import Link from "next/link";

import { clientEnv } from "@/lib/env";

function rootSiteUrl(): string {
  const root = clientEnv.NEXT_PUBLIC_ROOT_DOMAIN;
  const protocol = root.includes("localhost") ? "http" : "https";
  return `${protocol}://${root}`;
}

export default function ShopNotFound() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col items-center justify-center gap-[var(--space-6)] px-[var(--space-4)] py-[var(--space-16)] text-center">
      <h1 className="font-display text-xl leading-tight text-[color:var(--text-0)]">
        This shop doesn&apos;t exist.
      </h1>
      <p className="text-md text-muted-foreground">
        The address may be wrong, or the shop is no longer on Glanzo.
      </p>
      <Link
        href={rootSiteUrl()}
        className="text-base text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Go to Glanzo
      </Link>
    </main>
  );
}
