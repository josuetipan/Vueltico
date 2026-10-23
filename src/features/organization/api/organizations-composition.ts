import { createCreateOrganizationUseCase } from "../model/create-organization";
import { createGetOrganizationUseCase } from "../model/get-organization";
import { createGetOrganizationAuditLogUseCase } from "../model/get-organization-audit-log";
import { createInvitePrincipalAdminUseCase } from "../model/invite-principal-admin";
import { createListOrganizationsUseCase } from "../model/list-organizations";
import { createReactivateOrganizationUseCase } from "../model/reactivate-organization";
import { createSuspendOrganizationUseCase } from "../model/suspend-organization";
import { createUpdateOrganizationUseCase } from "../model/update-organization";
import { mockAuditLogRepository } from "@/entities/organization/api/mock-audit-log-repository";
import { mockOrganizationRepository } from "@/entities/organization/api/mock-organization-repository";

const orgRepo = mockOrganizationRepository;
const auditRepo = mockAuditLogRepository;

export const organizationsUseCases = {
  listOrganizations: createListOrganizationsUseCase(orgRepo),
  getOrganization: createGetOrganizationUseCase(orgRepo),
  createOrganization: createCreateOrganizationUseCase(orgRepo),
  updateOrganization: createUpdateOrganizationUseCase(orgRepo),
  suspendOrganization: createSuspendOrganizationUseCase(orgRepo),
  reactivateOrganization: createReactivateOrganizationUseCase(orgRepo),
  invitePrincipalAdmin: createInvitePrincipalAdminUseCase(orgRepo),
  getOrganizationAuditLog: createGetOrganizationAuditLogUseCase(auditRepo),
};
