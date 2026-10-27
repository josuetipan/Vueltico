import {
  PLATFORM_ADMIN_STATUSES,
  type PlatformAdminStatus,
} from "@/entities/platform-governance";
import type { CreatePlatformAdminInput } from "@/entities/platform-governance/api/governance-repository";
import { SUBSCRIPTION_PLANS, type PlanId } from "@/entities/plan";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

export type AdminRegistrationDraft = CreatePlatformAdminInput;

type AdminRegistrationFieldsProps = {
  draft: AdminRegistrationDraft;
  onChange: (patch: Partial<AdminRegistrationDraft>) => void;
  roles: { id: string; name: string }[];
  idPrefix?: string;
  showAccountStatus?: boolean;
};

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

export function AdminRegistrationFields({
  draft,
  onChange,
  roles,
  idPrefix = "admin",
  showAccountStatus = true,
}: AdminRegistrationFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Nombre" id={`${idPrefix}-name`} className="sm:col-span-2">
        <Input
          id={`${idPrefix}-name`}
          value={draft.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })}
        />
      </Field>
      <Field label="Identificación" id={`${idPrefix}-id`}>
        <Input
          id={`${idPrefix}-id`}
          value={draft.identification}
          onChange={(e) => onChange({ identification: e.target.value })}
          placeholder="Cédula o pasaporte"
        />
      </Field>
      <Field label="Correo" id={`${idPrefix}-email`}>
        <Input
          id={`${idPrefix}-email`}
          type="email"
          value={draft.email}
          onChange={(e) => onChange({ email: e.target.value })}
          autoComplete="off"
        />
      </Field>
      <Field label="Teléfono" id={`${idPrefix}-phone`}>
        <Input
          id={`${idPrefix}-phone`}
          type="tel"
          value={draft.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
        />
      </Field>
      <Field label="Ciudad" id={`${idPrefix}-city`}>
        <Input
          id={`${idPrefix}-city`}
          value={draft.city}
          onChange={(e) => onChange({ city: e.target.value })}
        />
      </Field>
      <Field label="Estado / provincia" id={`${idPrefix}-state`}>
        <Input
          id={`${idPrefix}-state`}
          value={draft.stateRegion}
          onChange={(e) => onChange({ stateRegion: e.target.value })}
        />
      </Field>
      <Field label="Plan" id={`${idPrefix}-plan`}>
        <select
          id={`${idPrefix}-plan`}
          value={draft.planId}
          onChange={(e) => onChange({ planId: e.target.value as PlanId })}
          className={selectClass}
        >
          {SUBSCRIPTION_PLANS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Rol de gobernanza" id={`${idPrefix}-role`}>
        <select
          id={`${idPrefix}-role`}
          value={draft.roleId}
          onChange={(e) => onChange({ roleId: e.target.value })}
          className={selectClass}
        >
          <option value="">Seleccione…</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Fecha de caducidad" id={`${idPrefix}-expires`}>
        <Input
          id={`${idPrefix}-expires`}
          type="date"
          value={draft.expiresAt.slice(0, 10)}
          onChange={(e) => onChange({ expiresAt: e.target.value })}
        />
      </Field>
      {showAccountStatus ? (
        <Field label="Estado de cuenta" id={`${idPrefix}-status`}>
          <select
            id={`${idPrefix}-status`}
            value={draft.status}
            onChange={(e) => onChange({ status: e.target.value as PlatformAdminStatus })}
            className={selectClass}
          >
            {PLATFORM_ADMIN_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "active" ? "Activo" : s === "invited" ? "Invitado" : "Inactivo"}
              </option>
            ))}
          </select>
        </Field>
      ) : null}
    </div>
  );
}

function Field({
  label,
  id,
  children,
  className,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

export function emptyAdminDraft(): AdminRegistrationDraft {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  return {
    email: "",
    fullName: "",
    identification: "",
    city: "",
    stateRegion: "",
    phone: "",
    planId: "growth",
    roleId: "",
    status: "invited",
    expiresAt: expires.toISOString().slice(0, 10),
  };
}

export function adminToDraft(
  admin: Awaited<
    ReturnType<
      typeof import("@/features/platform-governance/api/governance-composition").governanceUseCases.listPlatformAdmins
    >
  >[number],
): AdminRegistrationDraft {
  return {
    email: admin.email,
    fullName: admin.fullName,
    identification: admin.identification,
    city: admin.city,
    stateRegion: admin.stateRegion,
    phone: admin.phone,
    planId: admin.planId,
    roleId: admin.roleId,
    status: admin.status,
    expiresAt: admin.expiresAt.slice(0, 10),
  };
}
