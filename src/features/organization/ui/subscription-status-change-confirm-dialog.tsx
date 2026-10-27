import {
  subscriptionStatusLabel,
  type SubscriptionStatus,
} from "@/entities/organization/model/organization";
import { ConfirmDialog } from "@/shared/ui/feedback/confirm-dialog";

export type PendingSubscriptionStatusChange = {
  organizationLabel: string;
  from: SubscriptionStatus;
  to: SubscriptionStatus;
};

type SubscriptionStatusChangeConfirmDialogProps = {
  pending: PendingSubscriptionStatusChange | null;
  onDismiss: () => void;
  onConfirm: () => void;
};

function isSensitiveTarget(status: SubscriptionStatus): boolean {
  return status === "CANCELED" || status === "EXPIRED";
}

export function SubscriptionStatusChangeConfirmDialog({
  pending,
  onDismiss,
  onConfirm,
}: SubscriptionStatusChangeConfirmDialogProps) {
  return (
    <ConfirmDialog
      open={pending !== null}
      onOpenChange={(open) => {
        if (!open) onDismiss();
      }}
      title="Confirmar cambio de suscripción"
      description={
        pending
          ? `Va a cambiar la suscripción de «${pending.organizationLabel}» de ${subscriptionStatusLabel(pending.from)} a ${subscriptionStatusLabel(pending.to)}. Esta acción queda registrada en auditoría.`
          : ""
      }
      confirmLabel="Confirmar cambio"
      cancelLabel="Cancelar"
      destructive={pending ? isSensitiveTarget(pending.to) : false}
      onConfirm={onConfirm}
    />
  );
}
