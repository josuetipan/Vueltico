export const INVOICE_PAYMENT_STATUSES = ["PAID", "PENDING", "FAILED"] as const;
export type InvoicePaymentStatus = (typeof INVOICE_PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = ["BANK_TRANSFER", "CREDIT_CARD", "CASH"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type Invoice = {
  id: string;
  number: string;
  organizationId: string;
  subscriptionId: string;
  issuedAt: string;
  dueAt: string;
  totalUsd: number;
  paymentStatus: InvoicePaymentStatus;
  paymentMethod: PaymentMethod;
  receiptDataUrl: string | null;
  notes: string;
};

export type InvoiceListItem = Invoice & {
  organizationTradeName: string;
  organizationTaxId: string;
};

export function invoicePaymentStatusLabel(status: InvoicePaymentStatus): string {
  switch (status) {
    case "PAID":
      return "Pagado";
    case "PENDING":
      return "Pendiente";
    case "FAILED":
      return "Fallido";
  }
}

export function paymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case "BANK_TRANSFER":
      return "Transferencia bancaria";
    case "CREDIT_CARD":
      return "Tarjeta de crédito";
    case "CASH":
      return "Efectivo";
  }
}
