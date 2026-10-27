import {
  SUBSCRIPTION_STATUSES,
  subscriptionStatusLabel,
  type SubscriptionStatus,
} from "@/entities/organization/model/organization";
import { SelectField } from "@/shared/ui/select-field";

type SubscriptionStatusSelectProps = {
  id: string;
  value: SubscriptionStatus;
  onChange: (status: SubscriptionStatus) => void;
  disabled?: boolean;
};

export function SubscriptionStatusSelect({
  id,
  value,
  onChange,
  disabled,
}: SubscriptionStatusSelectProps) {
  return (
    <SelectField
      id={id}
      label="Suscripción"
      hideLabel
      value={value}
      onChange={(v) => onChange(v as SubscriptionStatus)}
      disabled={disabled}
      options={SUBSCRIPTION_STATUSES.map((s) => ({
        value: s,
        label: subscriptionStatusLabel(s),
      }))}
      className="min-w-[9.5rem]"
    />
  );
}
