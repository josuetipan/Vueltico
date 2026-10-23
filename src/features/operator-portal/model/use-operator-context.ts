import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/features/auth/model/use-session";
import { operatorPortalUseCases } from "@/features/operator-portal/api/operator-portal-composition";

export function useOperatorContext() {
  const { session } = useSession();
  const userId = session?.id ?? "";
  const tenantId = session?.tenant?.id ?? "";

  const profileQuery = useQuery({
    queryKey: ["operator-portal", "profile", userId, tenantId],
    queryFn: () => operatorPortalUseCases.getProfile(userId, tenantId),
    enabled: session?.role === "operator" && Boolean(userId && tenantId),
  });

  const tenantsQuery = useQuery({
    queryKey: ["operator-portal", "tenants", userId],
    queryFn: () => operatorPortalUseCases.listAvailableTenants(userId),
    enabled: session?.role === "operator" && Boolean(userId),
  });

  return {
    session,
    profile: profileQuery.data ?? null,
    tenants: tenantsQuery.data ?? [],
    isLoading: profileQuery.isLoading || tenantsQuery.isLoading,
    isError: profileQuery.isError,
    refetch: () => {
      void profileQuery.refetch();
      void tenantsQuery.refetch();
    },
  };
}
