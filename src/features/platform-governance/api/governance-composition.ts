import { mockGovernanceRepository } from "@/entities/platform-governance";

export const governanceUseCases = {
  listPermissions: () => mockGovernanceRepository.listPermissions(),
  createPermission: mockGovernanceRepository.createPermission.bind(mockGovernanceRepository),
  deletePermission: mockGovernanceRepository.deletePermission.bind(mockGovernanceRepository),

  listRoles: () => mockGovernanceRepository.listRoles(),
  getRole: mockGovernanceRepository.getRole.bind(mockGovernanceRepository),
  createRole: mockGovernanceRepository.createRole.bind(mockGovernanceRepository),
  updateRole: mockGovernanceRepository.updateRole.bind(mockGovernanceRepository),
  deleteRole: mockGovernanceRepository.deleteRole.bind(mockGovernanceRepository),

  listPlatformAdmins: () => mockGovernanceRepository.listPlatformAdmins(),
  createPlatformAdmin: mockGovernanceRepository.createPlatformAdmin.bind(mockGovernanceRepository),
  updatePlatformAdmin: mockGovernanceRepository.updatePlatformAdmin.bind(mockGovernanceRepository),
};
