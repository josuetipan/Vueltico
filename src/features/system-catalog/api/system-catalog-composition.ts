import { mockSystemCatalogRepository } from "@/entities/system-catalog/api/mock-system-catalog-repository";

export const systemCatalogUseCases = {
  listModules: mockSystemCatalogRepository.listModules.bind(mockSystemCatalogRepository),
  createModule: mockSystemCatalogRepository.createModule.bind(mockSystemCatalogRepository),
  listScreens: mockSystemCatalogRepository.listScreens.bind(mockSystemCatalogRepository),
  getScreen: mockSystemCatalogRepository.getScreen.bind(mockSystemCatalogRepository),
  createScreen: mockSystemCatalogRepository.createScreen.bind(mockSystemCatalogRepository),
  updateScreen: mockSystemCatalogRepository.updateScreen.bind(mockSystemCatalogRepository),
  setScreenStatus: mockSystemCatalogRepository.setScreenStatus.bind(mockSystemCatalogRepository),
  listActionsByScreen:
    mockSystemCatalogRepository.listActionsByScreen.bind(mockSystemCatalogRepository),
  createScreenAction:
    mockSystemCatalogRepository.createScreenAction.bind(mockSystemCatalogRepository),
  updateScreenAction:
    mockSystemCatalogRepository.updateScreenAction.bind(mockSystemCatalogRepository),
  deleteScreenAction:
    mockSystemCatalogRepository.deleteScreenAction.bind(mockSystemCatalogRepository),
  listGlobalRoles: mockSystemCatalogRepository.listGlobalRoles.bind(mockSystemCatalogRepository),
  getPermissionTree:
    mockSystemCatalogRepository.getPermissionTree.bind(mockSystemCatalogRepository),
  createGlobalRole:
    mockSystemCatalogRepository.createGlobalRole.bind(mockSystemCatalogRepository),
  updateGlobalRole:
    mockSystemCatalogRepository.updateGlobalRole.bind(mockSystemCatalogRepository),
  deleteGlobalRole:
    mockSystemCatalogRepository.deleteGlobalRole.bind(mockSystemCatalogRepository),
};
