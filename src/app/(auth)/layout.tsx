export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="salon-auth-root flex min-h-full flex-1 flex-col">{children}</div>;
}
