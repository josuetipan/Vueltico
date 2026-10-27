export class CompanyUserError extends Error {
  constructor(
    message: string,
    readonly code: "email_exists_in_org" | "empty_fields" | "not_found",
  ) {
    super(message);
    this.name = "CompanyUserError";
  }
}
