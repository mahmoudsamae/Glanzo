import { AuthLink, AuthShell, LoginForm } from "@/features/auth";
import {
  loginWithPassword,
  signInWithGoogle,
} from "@/server/modules/auth/actions";
import { redirectIfAuthenticatedFromAuthPages } from "@/server/modules/shops/create-shop.service";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  await redirectIfAuthenticatedFromAuthPages();
  const { next } = await searchParams;

  return (
    <AuthShell
      title="Willkommen zurück"
      subtitle="Melde dich in deinem Salon-Dashboard an."
      footer={
        <>
          Neu hier? <AuthLink href="/register">Konto erstellen</AuthLink>
        </>
      }
    >
      <LoginForm
        loginAction={loginWithPassword}
        googleSignInAction={signInWithGoogle}
        nextPath={next}
      />
    </AuthShell>
  );
}
