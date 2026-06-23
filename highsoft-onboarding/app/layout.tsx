import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Highsoft Onboarding",
  description: "Sistema de onboarding para implantação Highsoft Sistemas"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
