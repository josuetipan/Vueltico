import type { ApiListResponse } from "@/shared/api/contracts";
import type { PlanId } from "@/entities/plan";
import type {
  Organization,
  OrganizationListItem,
  SubscriptionStatus,
} from "@/entities/organization/model/organization";

export type ListOrganizationsFilters = {
  page: number;
  pageSize: number;
  search?: string;
  subscriptionStatus?: SubscriptionStatus | "all";
  planId?: PlanId | "all";
};

export type CreateOrganizationInput = {
  tradeName: string;
  legalName: string;
  taxId: string;
  email: string;
  phone: string;
  countryId?: string | null;
  country: string;
  cityId?: string | null;
  city: string;
  address: string;
  planId: PlanId;
  principalAdmin: {
    fullName: string;
    email: string;
  };
};

export type UpdateOrganizationInput = {
  tradeName: string;
  legalName: string;
  taxId: string;
  email: string;
  phone: string;
  countryId?: string | null;
  country: string;
  cityId?: string | null;
  city: string;
  address: string;
  planId: PlanId;
  subscriptionStatus: SubscriptionStatus;
};

export type OrganizationRepository = {
  list(filters: ListOrganizationsFilters): Promise<ApiListResponse<OrganizationListItem>>;
  getById(id: string): Promise<Organization | null>;
  create(input: CreateOrganizationInput, actorEmail: string): Promise<Organization>;
  update(id: string, input: UpdateOrganizationInput, actorEmail: string): Promise<Organization>;
  suspend(id: string, actorEmail: string): Promise<Organization>;
  reactivate(id: string, actorEmail: string): Promise<Organization>;
};
