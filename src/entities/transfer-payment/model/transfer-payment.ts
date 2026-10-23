export const TRANSFER_PAYMENT_STATUSES = [
  "pending_verification",
  "in_review",
  "confirmed",
  "rejected",
] as const;

export type TransferPaymentStatus = (typeof TRANSFER_PAYMENT_STATUSES)[number];

export type VerificationSource =
  | "authorized_bank_statement"
  | "banking_portal_manual"
  | "other_documented";

export type TransferDecisionAction =
  | "confirm"
  | "reject"
  | "mark_in_review"
  | "defer_verification";

export type TransferDecisionRecord = {
  id: string;
  action: TransferDecisionAction;
  at: string;
  responsibleUserId: string;
  responsibleEmail: string;
  reason: string;
  verificationSource?: VerificationSource;
  notes?: string;
};

export type ReceiptRetention = {
  policyDays: number;
  storedAt: string;
  expiresAt: string;
  legalHold: boolean;
};

export type TransferPayment = {
  id: string;
  tenantId: string;
  saleId: string;
  saleLabel: string;
  reportedAt: string;
  cashierName: string;
  destinationAccountId: string;
  destinationAccountName: string;
  amountCents: number;
  bankName: string;
  reference: string;
  status: TransferPaymentStatus;
  receiptFileName: string;
  receiptMimeType: string;
  receiptPreviewUrl: string;
  receiptUploadedAt: string;
  retention: ReceiptRetention;
  decisions: TransferDecisionRecord[];
  duplicateReferenceWarningIds: string[];
};

export type TransferPaymentListItem = Pick<
  TransferPayment,
  | "id"
  | "reportedAt"
  | "saleId"
  | "saleLabel"
  | "cashierName"
  | "destinationAccountName"
  | "amountCents"
  | "reference"
  | "status"
  | "duplicateReferenceWarningIds"
>;

export function isTransferAccredited(status: TransferPaymentStatus): boolean {
  return status === "confirmed";
}

export function transferStatusLabel(status: TransferPaymentStatus): string {
  switch (status) {
    case "pending_verification":
      return "Pendiente de verificación";
    case "in_review":
      return "En revisión";
    case "confirmed":
      return "Confirmada";
    case "rejected":
      return "Rechazada";
  }
}
