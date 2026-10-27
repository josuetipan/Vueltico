/** Forma alineada a GET /parametrization/catalogs/item-code/PANTALLAS (Captec). */

export type PantallasCatalogRowDto = {
  /** catalog_id numérico — clave en BD y permisos */
  id: number;
  itemCode: string;
  description: string;
  val01?: string;
  val02?: string;
  val03?: string;
  val04?: string;
  values?: PantallasCatalogRowDto[];
};

export type GranularActionDefinition = {
  catalogId: number;
  /** csuic_id — autorizar solo por igualdad exacta */
  actionId: string;
  description: string;
  /** Solo documentación UI; no autorizar */
  elementSelector?: string;
  apiRoute?: string;
  httpMethod?: string;
};

export type GranularMenuSection = {
  catalogId: number;
  label: string;
  itemCode: string;
  children: GranularMenuScreenItem[];
};

export type GranularMenuScreenItem = {
  catalogId: number;
  label: string;
  itemCode: string;
  screenKey: string;
  path: string;
};

export type MappedPantallasCatalog = {
  tree: CatalogTreeNode[];
  menuSections: GranularMenuSection[];
  actionsByScreenId: Record<number, GranularActionDefinition[]>;
  screenKeyByCatalogId: Record<number, string>;
};

export type CatalogNodeKind = "folder" | "screen" | "action";

export type CatalogTreeNode = {
  id: string;
  kind: CatalogNodeKind;
  catalogId: number;
  itemCode: string;
  label: string;
  val01?: string;
  val02?: string;
  val03?: string;
  val04?: string;
  screenKey?: string;
  path?: string;
  elementSelector?: string;
  children?: CatalogTreeNode[];
};
