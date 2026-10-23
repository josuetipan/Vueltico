export type RequestPasswordResetResult =
  | { ok: true }
  | { ok: false; error: "empty_fields" | "invalid_email" };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function requestPasswordReset(email: string): Promise<RequestPasswordResetResult> {
  const trimmed = email.trim();
  if (!trimmed) {
    return { ok: false, error: "empty_fields" };
  }
  if (!EMAIL_PATTERN.test(trimmed)) {
    return { ok: false, error: "invalid_email" };
  }

  await new Promise((resolve) => setTimeout(resolve, 500));
  return { ok: true };
}
