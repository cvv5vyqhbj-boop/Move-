import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Move — Sistema da agência",
  description: "Clientes, demandas, financeiro e metas da Move em um lugar só.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
