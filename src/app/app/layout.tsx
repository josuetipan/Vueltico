import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aplicación",
};

export default function AppAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
