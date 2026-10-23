import type {
  TransferDecisionAction,
  TransferPayment,
  TransferPaymentListItem,
  TransferPaymentStatus,
  VerificationSource,
} from "@/entities/transfer-payment/model/transfer-payment";
import type { ReceiptPolicyView } from "@/entities/transfer-payment/model/receipt-policy";

export type ListTransferPaymentsFilters = {
  tenantId: string;
  status?: TransferPaymentStatus | "all";
  search?: string;
  fromDate?: string;
  toDate?: string;
};

export type RecordVerificationInput = {
  tenantId: string;
  paymentId: string;
  action: TransferDecisionAction;
  responsibleUserId: string;
  responsibleEmail: string;
  reason: string;
  verificationSource?: VerificationSource;
  notes?: string;
};

export interface TransferReconciliationRepository {
  list(filters: ListTransferPaymentsFilters): Promise<TransferPaymentListItem[]>;
  getById(tenantId: string, paymentId: string): Promise<TransferPayment>;
  recordVerification(input: RecordVerificationInput): Promise<TransferPayment>;
  getReceiptPolicy(): Promise<ReceiptPolicyView>;
}
