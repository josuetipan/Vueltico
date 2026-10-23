import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserSession } from "@/entities/session";
import { identityUseCases } from "@/features/auth/api/identity-composition";

const SESSION_QUERY_KEY = ["identity", "session"] as const;

export function useSession() {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: () => identityUseCases.getCurrentSession(),
    staleTime: 60_000,
  });

  const signOutMutation = useMutation({
    mutationFn: () => identityUseCases.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(SESSION_QUERY_KEY, null);
    },
  });

  function setSession(session: UserSession | null) {
    queryClient.setQueryData(SESSION_QUERY_KEY, session);
  }

  return {
    session: sessionQuery.data ?? null,
    isLoading: sessionQuery.isLoading,
    isAuthenticated: Boolean(sessionQuery.data),
    setSession,
    signOut: signOutMutation.mutateAsync,
    isSigningOut: signOutMutation.isPending,
  };
}
