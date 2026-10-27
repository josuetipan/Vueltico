import type { ApiListResponse } from "@/shared/api/contracts";
import { resolvePageSize } from "@/shared/lib/table-pagination";
import {
  isValidActionPermissionKey,
  isValidGlobalRoleCode,
  isValidScreenKey,
  type CatalogModule,
  type CatalogScreen,
  type CatalogStatus,
  type GlobalRoleTemplate,
  type HttpMethod,
  type ScreenAction,
  type UiElementType,
} from "../model/catalog";
import {
  SEED_CATALOG_MODULES,
  SEED_CATALOG_SCREENS,
  SEED_GLOBAL_ROLES,
  SEED_SCREEN_ACTIONS,
} from "../model/seed-data";

const STORAGE_KEY = "vueltico.system.catalog.v1";

type CatalogStore = {
  modules: CatalogModule[];
  screens: CatalogScreen[];
  actions: ScreenAction[];
  roles: GlobalRoleTemplate[];
};

function nowIso(): string {
  return new Date().toISOString();
}

function delay(ms = 260): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function defaultStore(): CatalogStore {
  return {
    modules: [...SEED_CATALOG_MODULES],
    screens: [...SEED_CATALOG_SCREENS],
    actions: [...SEED_SCREEN_ACTIONS],
    roles: [...SEED_GLOBAL_ROLES],
  };
}

function loadStore(): CatalogStore {
  if (typeof window === "undefined") return defaultStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStore();
    const parsed = JSON.parse(raw) as CatalogStore;
    if (!parsed.modules?.length) return defaultStore();
    return parsed;
  } catch {
    return defaultStore();
  }
}

let store: CatalogStore = loadStore();

function persist() {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function moduleName(moduleId: string): string {
  return store.modules.find((m) => m.id === moduleId)?.name ?? "—";
}

export type ScreenListRow = CatalogScreen & { moduleName: string; actionCount: number };

export type UpsertModuleInput = { name: string; slug: string; status?: CatalogStatus };

export type UpsertScreenInput = {
  moduleId: string;
  name: string;
  screenKey: string;
  path: string;
  description: string;
  status: CatalogStatus;
};

export type UpsertScreenActionInput = {
  screenId: string;
  name: string;
  permissionKey: string;
  httpMethod: HttpMethod;
  apiRoute: string;
  uiElement: UiElementType | null;
  description: string;
};

export type UpsertGlobalRoleInput = {
  code: string;
  name: string;
  description: string;
  permissionKeys: string[];
};

export const mockSystemCatalogRepository = {
  listModules(): CatalogModule[] {
    return [...store.modules].sort((a, b) => a.name.localeCompare(b.name));
  },

  createModule(input: UpsertModuleInput): CatalogModule {
    const slug = input.slug.trim().toLowerCase();
    if (store.modules.some((m) => m.slug === slug)) throw new Error("MODULE_SLUG_EXISTS");
    const mod: CatalogModule = {
      id: `mod-${Date.now()}`,
      name: input.name.trim(),
      slug,
      status: input.status ?? "ACTIVE",
    };
    store.modules.push(mod);
    persist();
    return mod;
  },

  async listScreens(filters: {
    page: number;
    pageSize?: number;
    search?: string;
    moduleId?: string | "all";
    status?: CatalogStatus | "all";
  }): Promise<ApiListResponse<ScreenListRow>> {
    await delay();
    let rows: ScreenListRow[] = store.screens.map((s) => ({
      ...s,
      moduleName: moduleName(s.moduleId),
      actionCount: store.actions.filter((a) => a.screenId === s.id).length,
    }));
    const q = filters.search?.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.screenKey.includes(q) ||
          r.path.toLowerCase().includes(q) ||
          r.moduleName.toLowerCase().includes(q),
      );
    }
    if (filters.moduleId && filters.moduleId !== "all") {
      rows = rows.filter((r) => r.moduleId === filters.moduleId);
    }
    if (filters.status && filters.status !== "all") {
      rows = rows.filter((r) => r.status === filters.status);
    }
    rows.sort((a, b) => a.moduleName.localeCompare(b.moduleName) || a.name.localeCompare(b.name));
    const pageSize = resolvePageSize(filters.pageSize);
    const totalItems = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const page = Math.min(Math.max(1, filters.page), totalPages);
    const start = (page - 1) * pageSize;
    return {
      data: rows.slice(start, start + pageSize),
      meta: { page, pageSize, totalItems, totalPages },
    };
  },

  getScreen(id: string): CatalogScreen | null {
    return store.screens.find((s) => s.id === id) ?? null;
  },

  async createScreen(input: UpsertScreenInput): Promise<CatalogScreen> {
    await delay(350);
    const screenKey = input.screenKey.trim();
    if (!isValidScreenKey(screenKey)) throw new Error("INVALID_SCREEN_KEY");
    if (store.screens.some((s) => s.screenKey === screenKey)) throw new Error("SCREEN_KEY_EXISTS");
    if (!store.modules.some((m) => m.id === input.moduleId)) throw new Error("MODULE_NOT_FOUND");
    const ts = nowIso();
    const screen: CatalogScreen = {
      id: `scr-${Date.now()}`,
      moduleId: input.moduleId,
      name: input.name.trim(),
      screenKey,
      path: input.path.trim(),
      description: input.description.trim(),
      status: input.status,
      createdAt: ts,
      updatedAt: ts,
    };
    store.screens.push(screen);
    persist();
    return screen;
  },

  async updateScreen(id: string, input: UpsertScreenInput): Promise<CatalogScreen> {
    await delay(350);
    const idx = store.screens.findIndex((s) => s.id === id);
    if (idx < 0) throw new Error("NOT_FOUND");
    const screenKey = input.screenKey.trim();
    if (!isValidScreenKey(screenKey)) throw new Error("INVALID_SCREEN_KEY");
    if (store.screens.some((s) => s.screenKey === screenKey && s.id !== id)) {
      throw new Error("SCREEN_KEY_EXISTS");
    }
    const prev = store.screens[idx]!;
    const next: CatalogScreen = {
      ...prev,
      moduleId: input.moduleId,
      name: input.name.trim(),
      screenKey,
      path: input.path.trim(),
      description: input.description.trim(),
      status: input.status,
      updatedAt: nowIso(),
    };
    store.screens[idx] = next;
    persist();
    return next;
  },

  async setScreenStatus(id: string, status: CatalogStatus): Promise<CatalogScreen> {
    await delay(250);
    const screen = store.screens.find((s) => s.id === id);
    if (!screen) throw new Error("NOT_FOUND");
    screen.status = status;
    screen.updatedAt = nowIso();
    persist();
    return screen;
  },

  listActionsByScreen(screenId: string): ScreenAction[] {
    return store.actions.filter((a) => a.screenId === screenId);
  },

  async createScreenAction(input: UpsertScreenActionInput): Promise<ScreenAction> {
    await delay(350);
    const permissionKey = input.permissionKey.trim().toLowerCase();
    if (!isValidActionPermissionKey(permissionKey)) throw new Error("INVALID_PERMISSION_KEY");
    if (!store.screens.some((s) => s.id === input.screenId)) throw new Error("SCREEN_NOT_FOUND");
    if (store.actions.some((a) => a.permissionKey === permissionKey)) {
      throw new Error("PERMISSION_KEY_EXISTS");
    }
    const action: ScreenAction = {
      id: `act-${Date.now()}`,
      screenId: input.screenId,
      name: input.name.trim(),
      permissionKey,
      httpMethod: input.httpMethod,
      apiRoute: input.apiRoute.trim(),
      uiElement: input.uiElement,
      description: input.description.trim(),
    };
    store.actions.push(action);
    persist();
    return action;
  },

  async updateScreenAction(id: string, input: UpsertScreenActionInput): Promise<ScreenAction> {
    await delay(350);
    const idx = store.actions.findIndex((a) => a.id === id);
    if (idx < 0) throw new Error("NOT_FOUND");
    const permissionKey = input.permissionKey.trim().toLowerCase();
    if (!isValidActionPermissionKey(permissionKey)) throw new Error("INVALID_PERMISSION_KEY");
    if (store.actions.some((a) => a.permissionKey === permissionKey && a.id !== id)) {
      throw new Error("PERMISSION_KEY_EXISTS");
    }
    const prev = store.actions[idx]!;
    const next: ScreenAction = { ...prev, ...input, name: input.name.trim(), permissionKey };
    store.actions[idx] = next;
    persist();
    return next;
  },

  async deleteScreenAction(id: string): Promise<void> {
    await delay(250);
    const idx = store.actions.findIndex((a) => a.id === id);
    if (idx < 0) throw new Error("NOT_FOUND");
    const key = store.actions[idx]!.permissionKey;
    store.actions.splice(idx, 1);
    for (const role of store.roles) {
      role.permissionKeys = role.permissionKeys.filter((k) => k !== key);
    }
    persist();
  },

  listGlobalRoles(): GlobalRoleTemplate[] {
    return [...store.roles].sort((a, b) => a.name.localeCompare(b.name));
  },

  getPermissionTree(): {
    module: CatalogModule;
    screens: (CatalogScreen & { actions: ScreenAction[] })[];
  }[] {
    return store.modules
      .filter((m) => m.status === "ACTIVE")
      .map((module) => ({
        module,
        screens: store.screens
          .filter((s) => s.moduleId === module.id && s.status === "ACTIVE")
          .map((screen) => ({
            ...screen,
            actions: store.actions.filter((a) => a.screenId === screen.id),
          })),
      }));
  },

  async createGlobalRole(input: UpsertGlobalRoleInput): Promise<GlobalRoleTemplate> {
    await delay(400);
    const code = input.code.trim();
    if (!isValidGlobalRoleCode(code)) throw new Error("INVALID_ROLE_CODE");
    if (store.roles.some((r) => r.code === code)) throw new Error("ROLE_CODE_EXISTS");
    const role: GlobalRoleTemplate = {
      id: `grole-${Date.now()}`,
      code,
      name: input.name.trim(),
      description: input.description.trim(),
      permissionKeys: [...input.permissionKeys],
      isSystem: false,
    };
    store.roles.push(role);
    persist();
    return role;
  },

  async updateGlobalRole(id: string, input: UpsertGlobalRoleInput): Promise<GlobalRoleTemplate> {
    await delay(400);
    const idx = store.roles.findIndex((r) => r.id === id);
    if (idx < 0) throw new Error("NOT_FOUND");
    const prev = store.roles[idx]!;
    if (prev.isSystem && prev.code !== input.code.trim()) throw new Error("SYSTEM_LOCKED");
    const code = input.code.trim();
    if (!isValidGlobalRoleCode(code)) throw new Error("INVALID_ROLE_CODE");
    if (store.roles.some((r) => r.code === code && r.id !== id)) throw new Error("ROLE_CODE_EXISTS");
    const next: GlobalRoleTemplate = {
      ...prev,
      code,
      name: input.name.trim(),
      description: input.description.trim(),
      permissionKeys: [...input.permissionKeys],
    };
    store.roles[idx] = next;
    persist();
    return next;
  },

  async deleteGlobalRole(id: string): Promise<void> {
    await delay(300);
    const role = store.roles.find((r) => r.id === id);
    if (!role) throw new Error("NOT_FOUND");
    if (role.isSystem) throw new Error("SYSTEM_LOCKED");
    store.roles = store.roles.filter((r) => r.id !== id);
    persist();
  },
};
