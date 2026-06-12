import type { Metadata } from "next";

import { MotionProvider } from "@/components/layout";
import { fontClassNames } from "@/lib/fonts";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Glanzo",
  description: "Multi-tenant SaaS for Barbershops, Friseure & Beauty-Studios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontClassNames} h-full`}>
      <body className="min-h-full flex flex-col font-sans">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
