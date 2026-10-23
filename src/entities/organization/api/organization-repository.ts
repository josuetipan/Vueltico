import type { ApiListResponse } from "@/shared/api/contracts";
import type {
  Organization,
  OrganizationListItem,
  OrganizationLimits,
  PlanId,
} from "@/entities/organization/model/organization";

export type ListOrganizationsFilters = {
  page: number;
  pageSize: number;
  search?: string;
  status?: Organization["status"] | "all";
  planId?: PlanId | "all";
};

export type CreateOrganizationInput = {
  tradeName: string;
  legalName: string;
  ruc: string;
  email: string;
  phone: string;
  country: string;
  province: string;
  city: string;
  planId: PlanId;
  limits: OrganizationLimits;
  principalAdmin: {
    fullName: string;
    email: string;
  };
};

export type UpdateOrganizationInput = {
  tradeName: string;
  legalName: string;
  ruc: string;
  email: string;
  phone: string;
  country: string;
  province: string;
  city: string;
  planId: PlanId;
  limits: OrganizationLimits;
};

export type InvitePrincipalAdminInput = {
  organizationId: string;
  fullName: string;
  email: string;
};

export type OrganizationRepository = {
  list(filters: ListOrganizationsFilters): Promise<ApiListResponse<OrganizationListItem>>;
  getById(id: string): Promise<Organization | null>;
  create(input: CreateOrganizationInput, actorEmail: string): Promise<Organization>;
  update(id: string, input: UpdateOrganizationInput, actorEmail: string): Promise<Organization>;
  suspend(id: string, actorEmail: string): Promise<Organization>;
  reactivate(id: string, actorEmail: string): Promise<Organization>;
  invitePrincipalAdmin(input: InvitePrincipalAdminInput, actorEmail: string): Promise<Organization>;
};
