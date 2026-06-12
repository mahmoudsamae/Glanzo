import { Button } from "@/components/ui";

export default function MarketingPage() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center px-[var(--space-4)] py-[var(--space-16)]">
      <div className="flex w-full max-w-lg flex-col gap-[var(--space-8)] text-center">
        <div className="flex flex-col gap-[var(--space-4)]">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Glanzo</p>
          <h1 className="font-display text-2xl leading-tight">
            Barbershops, Friseure &amp; Beauty-Studios — operations, simplified
          </h1>
          <p className="text-md text-muted-foreground">
            Marketing placeholder. Staff dashboards and customer mini-sites for appointment-based
            businesses.
          </p>
        </div>
        <div className="flex flex-col gap-[var(--space-3)] sm:flex-row sm:justify-center">
          <Button asChild>
            <a href="/login">Staff login</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/register">Create account</a>
          </Button>
        </div>
      </div>
    </main>
  );
}
