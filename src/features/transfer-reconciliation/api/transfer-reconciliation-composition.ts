import { getReceiptPolicy } from "../model/get-receipt-policy";
import { getTransferPayment } from "../model/get-transfer-payment";
import { listTransferPayments } from "../model/list-transfer-payments";
import { recordTransferVerification } from "../model/record-transfer-verification";
import { mockTransferReconciliationRepository } from "@/entities/transfer-payment/api/mock-transfer-reconciliation-repository";

const repo = mockTransferReconciliationRepository;

export const transferReconciliationUseCases = {
  listTransferPayments: (filters: Parameters<typeof listTransferPayments>[1]) =>
    listTransferPayments(repo, filters),
  getTransferPayment: (tenantId: string, paymentId: string) =>
    getTransferPayment(repo, tenantId, paymentId),
  recordVerification: (input: Parameters<typeof recordTransferVerification>[1]) =>
    recordTransferVerification(repo, input),
  getReceiptPolicy: () => getReceiptPolicy(repo),
};
