import { AuthLink, AuthShell, RegisterForm } from "@/features/auth";
import { registerWithPassword } from "@/server/modules/auth/actions";
import { redirectIfAuthenticatedFromAuthPages } from "@/server/modules/shops/create-shop.service";

type RegisterPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  await redirectIfAuthenticatedFromAuthPages();
  const { next } = await searchParams;
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  return (
    <AuthShell
      title="Starte deinen Salon"
      subtitle="In wenigen Minuten bist du live."
      footer={
        <>
          Schon registriert? <AuthLink href={loginHref}>Anmelden</AuthLink>
        </>
      }
    >
      <RegisterForm registerAction={registerWithPassword} nextPath={next} />
    </AuthShell>
  );
}
