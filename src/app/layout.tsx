import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppProviders } from "@/shared/presentation/providers/app-providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Vueltico",
    template: "%s · Vueltico",
  },
  description:
    "Plataforma SaaS multiempresa para operaciones comerciales y financieras en Ecuador.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-EC" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Saltar al contenido principal
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
