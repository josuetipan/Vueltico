import type {
  CatalogTreeNode,
  GranularActionDefinition,
  GranularMenuScreenItem,
  GranularMenuSection,
  MappedPantallasCatalog,
  PantallasCatalogRowDto,
} from "../model/pantallas-catalog.types";

const ACTION_VAL01 = new Set(["ACTION", "ACCION"]);

function isActionRow(row: PantallasCatalogRowDto): boolean {
  return ACTION_VAL01.has((row.val01 ?? "").toUpperCase());
}

function isFolderRow(row: PantallasCatalogRowDto): boolean {
  if (isActionRow(row)) return false;
  const v = (row.val01 ?? "").toUpperCase();
  if (v === "FOLDER") return true;
  if (v === "SCREEN") return false;
  return Boolean(row.values?.some((c) => !isActionRow(c)));
}

function isScreenRow(row: PantallasCatalogRowDto): boolean {
  if (isActionRow(row)) return false;
  const v = (row.val01 ?? "").toUpperCase();
  return v === "SCREEN" || (!isFolderRow(row) && Boolean(row.val02));
}

function rowToTreeNode(row: PantallasCatalogRowDto): CatalogTreeNode {
  if (isActionRow(row)) {
    return {
      id: `act-${row.id}`,
      kind: "action",
      catalogId: row.id,
      itemCode: row.itemCode,
      label: row.description,
      val01: row.val01,
      val02: row.val02,
      val03: row.val03,
      val04: row.val04,
      elementSelector: row.val04,
    };
  }

  if (isScreenRow(row)) {
    const actionChildren =
      row.values?.filter(isActionRow).map(rowToTreeNode) ?? [];
    return {
      id: `scr-${row.id}`,
      kind: "screen",
      catalogId: row.id,
      itemCode: row.itemCode,
      label: row.description,
      val01: row.val01,
      val02: row.val02,
      val03: row.val03,
      val04: row.val04,
      screenKey: row.val02 ?? row.itemCode,
      path: row.val03 ?? "",
      children: actionChildren.length ? actionChildren : undefined,
    };
  }

  const childRows =
    row.values?.filter((c) => !isActionRow(c)).map(rowToTreeNode) ?? [];
  return {
    id: `fld-${row.id}`,
    kind: "folder",
    catalogId: row.id,
    itemCode: row.itemCode,
    label: row.description,
    val01: row.val01 ?? "FOLDER",
    val02: row.val02,
    val03: row.val03,
    val04: row.val04,
    children: childRows.length ? childRows : undefined,
  };
}

function collectScreensFromTree(
  nodes: CatalogTreeNode[],
  acc: GranularMenuScreenItem[] = [],
): GranularMenuScreenItem[] {
  for (const n of nodes) {
    if (n.kind === "screen") {
      acc.push({
        catalogId: n.catalogId,
        label: n.label,
        itemCode: n.itemCode,
        screenKey: n.screenKey ?? n.itemCode,
        path: n.path ?? "",
      });
    }
    if (n.children) collectScreensFromTree(n.children, acc);
  }
  return acc;
}

function buildActionsMap(nodes: CatalogTreeNode[]): Record<number, GranularActionDefinition[]> {
  const map: Record<number, GranularActionDefinition[]> = {};

  function walk(list: CatalogTreeNode[]) {
    for (const n of list) {
      if (n.kind === "screen") {
        const actions =
          n.children?.filter((c) => c.kind === "action").map((a) => ({
            catalogId: a.catalogId,
            actionId: a.itemCode,
            description: a.label,
            elementSelector: a.elementSelector,
            apiRoute: a.val03,
            httpMethod: a.val02,
          })) ?? [];
        if (actions.length) map[n.catalogId] = actions;
      }
      if (n.children) walk(n.children);
    }
  }

  walk(nodes);
  return map;
}

export function mapPantallasCatalog(rows: PantallasCatalogRowDto[]): MappedPantallasCatalog {
  const tree = rows.map(rowToTreeNode);
  const menuSections: GranularMenuSection[] = tree
    .filter((n) => n.kind === "folder")
    .map((folder) => ({
      catalogId: folder.catalogId,
      label: folder.label,
      itemCode: folder.itemCode,
      children: collectScreensFromTree(folder.children ?? []),
    }));

  const actionsByScreenId = buildActionsMap(tree);
  const screenKeyByCatalogId: Record<number, string> = {};
  for (const section of menuSections) {
    for (const s of section.children) {
      screenKeyByCatalogId[s.catalogId] = s.screenKey;
    }
  }

  return { tree, menuSections, actionsByScreenId, screenKeyByCatalogId };
}

/** Filtra árbol: solo pantallas permitidas para la entidad (+ carpetas que las contienen). */
export function filterTreeByEntityScreens(
  tree: CatalogTreeNode[],
  allowedScreenIds: Set<number>,
): CatalogTreeNode[] {
  function filterNode(node: CatalogTreeNode): CatalogTreeNode | null {
    if (node.kind === "action") return node;

    if (node.kind === "screen") {
      if (!allowedScreenIds.has(node.catalogId)) return null;
      return node;
    }

    const children =
      node.children
        ?.map(filterNode)
        .filter((c): c is CatalogTreeNode => c !== null) ?? [];
    if (!children.length) return null;
    return { ...node, children };
  }

  return tree.map(filterNode).filter((n): n is CatalogTreeNode => n !== null);
}
