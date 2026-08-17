import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Move — Sistema da agência",
  description: "Clientes, demandas, financeiro e metas da Move em um lugar só.",
};

// Roda antes de qualquer render: lê a preferência salva (ou a do sistema
// operacional) e já aplica a classe .dark no <html>, evitando o "pisca-branco"
// quando quem prefere o escuro entra no sistema.
const scriptDoTema = `
(function () {
  try {
    var salvo = localStorage.getItem('tema-move');
    var sistemaPrefereEscuro =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var usarEscuro = salvo === 'escuro' || (!salvo && sistemaPrefereEscuro);
    if (usarEscuro) document.documentElement.classList.add('dark');
  } catch (_) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptDoTema }} />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
