export default function ManageBookingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-full flex flex-1 flex-col bg-[var(--ink-0)] text-[var(--text-1)]">
      {children}
    </div>
  );
}
