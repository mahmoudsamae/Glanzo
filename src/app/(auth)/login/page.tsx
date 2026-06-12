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
      title="Welcome back"
      subtitle="Sign in to your shop dashboard."
      footer={
        <>
          New here? <AuthLink href="/register">Create an account</AuthLink>
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
