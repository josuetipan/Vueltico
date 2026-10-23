import type { UserSession } from "@/entities/session";

export type SessionRepository = {
  getCurrent(): Promise<UserSession | null>;
  save(session: UserSession): Promise<UserSession>;
  signOut(): Promise<void>;
};
