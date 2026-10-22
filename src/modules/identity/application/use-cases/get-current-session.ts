import type { SessionRepository } from "../ports/session-repository";

export function createGetCurrentSessionUseCase(repo: SessionRepository) {
  return () => repo.getCurrent();
}
