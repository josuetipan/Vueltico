import type { SessionRepository } from "../ports/session-repository";

export function createSignOutUseCase(repo: SessionRepository) {
  return () => repo.signOut();
}
