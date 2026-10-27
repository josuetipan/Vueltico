import { createCreateOrganizationUseCase } from "../model/create-organization";
import { createGetOrganizationUseCase } from "../model/get-organization";
import { createGetOrganizationAuditLogUseCase } from "../model/get-organization-audit-log";
import { createListOrganizationsUseCase } from "../model/list-organizations";
import { createListCompanyAdminsUseCase } from "../model/list-company-admins";
import { createCreateCompanyAdminUseCase } from "../model/create-company-admin";
import { createUpdateCompanyUserStatusUseCase } from "../model/update-company-user-status";
import { createUpdateCompanyAdminUseCase } from "../model/update-company-admin";
import { createReactivateOrganizationUseCase } from "../model/reactivate-organization";
import { createSuspendOrganizationUseCase } from "../model/suspend-organization";
import { createUpdateOrganizationUseCase } from "../model/update-organization";
import { mockAuditLogRepository } from "@/entities/organization/api/mock-audit-log-repository";
import { mockOrganizationRepository } from "@/entities/organization/api/mock-organization-repository";
import { mockCompanyUserRepository } from "@/entities/organization/api/mock-company-user-repository";

const orgRepo = mockOrganizationRepository;
const auditRepo = mockAuditLogRepository;
const companyUserRepo = mockCompanyUserRepository;

export const organizationsUseCases = {
  listOrganizations: createListOrganizationsUseCase(orgRepo),
  getOrganization: createGetOrganizationUseCase(orgRepo),
  createOrganization: createCreateOrganizationUseCase(orgRepo),
  updateOrganization: createUpdateOrganizationUseCase(orgRepo),
  suspendOrganization: createSuspendOrganizationUseCase(orgRepo),
  reactivateOrganization: createReactivateOrganizationUseCase(orgRepo),
  getOrganizationAuditLog: createGetOrganizationAuditLogUseCase(auditRepo),
  listCompanyUsers: companyUserRepo.listByOrganization.bind(companyUserRepo),
  listCompanyAdmins: createListCompanyAdminsUseCase(companyUserRepo, orgRepo),
  createCompanyAdmin: createCreateCompanyAdminUseCase(companyUserRepo),
  updateCompanyUserStatus: createUpdateCompanyUserStatusUseCase(companyUserRepo),
  updateCompanyAdmin: createUpdateCompanyAdminUseCase(companyUserRepo),
};
