import type { ReactNode } from "react";
import { LoginBrandPanel } from "@/pages/login/ui/login-brand-panel";

type LoginAuthShellProps = {
  title: string;
  children: ReactNode;
};

export function LoginAuthShell({ title, children }: LoginAuthShellProps) {
  return (
    <div className="relative min-h-screen">
      <LoginBrandPanel />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:justify-end lg:px-16 xl:px-20">
        <div className="w-full max-w-[400px] rounded-2xl border border-border/80 bg-background p-8 shadow-xl sm:p-10">
          <h1 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}
