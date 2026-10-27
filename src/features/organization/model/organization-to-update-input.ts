import type { UpdateOrganizationInput } from "@/entities/organization/api/organization-repository";
import type { Organization } from "@/entities/organization/model/organization";

export function organizationToUpdateInput(org: Organization): UpdateOrganizationInput {
  return {
    tradeName: org.tradeName,
    legalName: org.legalName,
    taxId: org.taxId,
    email: org.email,
    phone: org.phone,
    countryId: org.countryId,
    country: org.country,
    cityId: org.cityId,
    city: org.city,
    address: org.address,
    planId: org.planId,
    subscriptionStatus: org.subscriptionStatus,
  };
}
