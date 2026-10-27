import {
  COMPANY_USER_STATUSES,
  type CompanyUserStatus,
} from "@/entities/organization/model/company-user";
import { SelectField } from "@/shared/ui/select-field";

const LABELS: Record<CompanyUserStatus, string> = {
  active: "Activo",
  invited: "Invitado",
  disabled: "Inactivo",
};

type CompanyUserStatusSelectProps = {
  id: string;
  value: CompanyUserStatus;
  onChange: (status: CompanyUserStatus) => void;
  disabled?: boolean;
};

export function CompanyUserStatusSelect({
  id,
  value,
  onChange,
  disabled,
}: CompanyUserStatusSelectProps) {
  return (
    <SelectField
      id={id}
      label="Estado"
      hideLabel
      value={value}
      onChange={(v) => onChange(v as CompanyUserStatus)}
      disabled={disabled}
      options={COMPANY_USER_STATUSES.map((s) => ({ value: s, label: LABELS[s] }))}
      className="min-w-[8.5rem]"
    />
  );
}
