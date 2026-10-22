import type { UserSession } from "../domain/session";
import type { SessionRepository } from "../application/ports/session-repository";

const STORAGE_KEY = "vueltico.mock.session";

function readStoredSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
}

function writeStoredSession(session: UserSession | null): void {
  if (typeof window === "undefined") return;
  if (!session) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export const mockSessionRepository: SessionRepository = {
  async getCurrent() {
    await delay(120);
    return readStoredSession();
  },
  async save(session) {
    await delay(120);
    writeStoredSession(session);
    return session;
  },
  async signOut() {
    await delay(120);
    writeStoredSession(null);
  },
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
