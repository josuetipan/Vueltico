import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRoleHomePath } from "@/entities/session";
import { useSession } from "@/features/auth/model/use-session";
import { StatePanel } from "@/shared/ui/feedback/state-panel";

export function AppIndexRedirect() {
  const navigate = useNavigate();
  const { session, isLoading } = useSession();

  useEffect(() => {
    if (isLoading) return;
    if (!session) {
      navigate("/login", { replace: true });
      return;
    }
    navigate(getRoleHomePath(session.role), { replace: true });
  }, [isLoading, session, navigate]);

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
