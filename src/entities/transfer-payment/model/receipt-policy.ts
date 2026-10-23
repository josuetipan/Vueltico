export const DEFAULT_RECEIPT_RETENTION_DAYS = 90;

export type ReceiptPolicyView = {
  retentionDays: number;
  summary: string;
  temporaryStorageNote: string;
};

export function getReceiptPolicyView(): ReceiptPolicyView {
  return {
    retentionDays: DEFAULT_RECEIPT_RETENTION_DAYS,
    summary:
      "Los comprobantes adjuntos se conservan de forma temporal para verificación. No sustituyen el registro en su entidad bancaria autorizada.",
    temporaryStorageNote:
      "Tras la expiración, la vista previa puede eliminarse salvo obligación legal de conservación (retención legal activa).",
  };
}

export function computeExpiryIso(storedAtIso: string, retentionDays: number): string {
  const d = new Date(storedAtIso);
  d.setUTCDate(d.getUTCDate() + retentionDays);
  return d.toISOString();
}

export function isReceiptExpired(expiresAtIso: string, now = new Date()): boolean {
  return now.getTime() > new Date(expiresAtIso).getTime();
}
