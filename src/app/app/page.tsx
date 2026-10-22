"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getRoleHomePath } from "@/modules/identity/domain/session";
import { useSession } from "@/modules/identity/presentation/hooks/use-session";
import { StatePanel } from "@/shared/presentation/components/feedback/state-panel";

export default function AppIndexPage() {
  const router = useRouter();
  const { session, isLoading } = useSession();

  useEffect(() => {
    if (isLoading) return;
    if (!session) {
      router.replace("/login");
      return;
    }
    router.replace(getRoleHomePath(session.role));
  }, [isLoading, session, router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <StatePanel
        variant="loading"
        title="Redirigiendo"
        description="Llevándole a su panel según el perfil activo…"
        className="max-w-md border-solid bg-card"
      />
    </div>
  );
}
