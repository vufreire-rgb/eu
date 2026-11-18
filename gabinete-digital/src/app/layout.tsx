import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Toasts } from "@/components/ui";

export const metadata: Metadata = {
  title: { default: "Gabinete Digital — Atendimento parlamentar", template: "%s · Gabinete Digital" },
  description: "Protótipo de plataforma de atendimento parlamentar: solicitações, acompanhamento e transparência. Ambiente de demonstração.",
  applicationName: "Gabinete Digital",
  appleWebApp: { capable: true, title: "Gabinete Digital", statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: "#14283F", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-3 focus:py-2">Ir para o conteúdo</a>
        <StoreProvider>
          {children}
          <Toasts />
        </StoreProvider>
      </body>
    </html>
  );
}
