export const CATALOG_STATUSES = ["ACTIVE", "INACTIVE"] as const;
export type CatalogStatus = (typeof CATALOG_STATUSES)[number];

export type CatalogModule = {
  id: string;
  name: string;
  /** Slug técnico del módulo padre (ej. transferencias) */
  slug: string;
  status: CatalogStatus;
};

export type CatalogScreen = {
  id: string;
  moduleId: string;
  /** Nombre visible */
  name: string;
  /** screen_key — identificador único frontend */
  screenKey: string;
  path: string;
  description: string;
  status: CatalogStatus;
  createdAt: string;
  updatedAt: string;
};

export const UI_ELEMENT_TYPES = [
  "Boton_Principal",
  "Menu_Contextual",
  "Tabla_Accion",
  "Enlace_Navegacion",
  "Otro",
] as const;
export type UiElementType = (typeof UI_ELEMENT_TYPES)[number];

export const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
export type HttpMethod = (typeof HTTP_METHODS)[number];

export type ScreenAction = {
  id: string;
  screenId: string;
  name: string;
  permissionKey: string;
  httpMethod: HttpMethod;
  apiRoute: string;
  uiElement: UiElementType | null;
  description: string;
};

export type GlobalRoleTemplate = {
  id: string;
  /** Ej. ROLE_ADMIN */
  code: string;
  name: string;
  description: string;
  /** permission_key de acciones de pantalla */
  permissionKeys: string[];
  isSystem: boolean;
};

export const SCREEN_KEY_PATTERN = /^[a-z][a-z0-9_]*$/;
export const GLOBAL_ROLE_CODE_PATTERN = /^ROLE_[A-Z0-9_]+$/;

export function catalogStatusLabel(status: CatalogStatus): string {
  return status === "ACTIVE" ? "Activo" : "Inactivo";
}

export function uiElementLabel(el: UiElementType): string {
  switch (el) {
    case "Boton_Principal":
      return "Botón principal";
    case "Menu_Contextual":
      return "Menú contextual";
    case "Tabla_Accion":
      return "Acción en tabla";
    case "Enlace_Navegacion":
      return "Enlace de navegación";
    case "Otro":
      return "Otro";
  }
}

export function isValidScreenKey(key: string): boolean {
  return SCREEN_KEY_PATTERN.test(key.trim());
}

export function isValidGlobalRoleCode(code: string): boolean {
  return GLOBAL_ROLE_CODE_PATTERN.test(code.trim());
}

export function isValidActionPermissionKey(key: string): boolean {
  return /^[a-z][a-z0-9_]*:[a-z][a-z0-9_]*$/.test(key.trim());
}
