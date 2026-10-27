import type { PantallasCatalogRowDto } from "../model/pantallas-catalog.types";
import { MOCK_PANTALLAS_CATALOG_ROOT } from "../model/mock-pantallas-catalog.api";

export type CatalogValueTipo = "C" | "P" | "A";

export type CatalogValueRow = {
  catalogId: number;
  code: string;
  name: string;
  status: "ACTIVO" | "INACTIVO";
  nomenclatura: string;
  tipo: CatalogValueTipo;
  /** Abrir hijos (carpeta, pantalla con acciones, etc.) */
  canOpen: boolean;
};

const ACTION_VAL01 = new Set(["ACTION", "ACCION"]);

export function findCatalogRowById(
  id: number,
  rows: PantallasCatalogRowDto[] = MOCK_PANTALLAS_CATALOG_ROOT,
): PantallasCatalogRowDto | null {
  for (const row of rows) {
    if (row.id === id) return row;
    if (row.values?.length) {
      const found = findCatalogRowById(id, row.values);
      if (found) return found;
    }
  }
  return null;
}

function rowTipo(row: PantallasCatalogRowDto): CatalogValueTipo {
  const v = (row.val01 ?? "").toUpperCase();
  if (ACTION_VAL01.has(v)) return "A";
  if (v === "SCREEN") return "P";
  return "C";
}

function rowNomenclatura(row: PantallasCatalogRowDto, tipo: CatalogValueTipo): string {
  if (tipo === "P") return row.val03?.trim() || row.val02?.trim() || "—";
  if (tipo === "A") return row.val03?.trim() || "—";
  return row.val02?.trim() || "—";
}

function canOpenRow(row: PantallasCatalogRowDto, tipo: CatalogValueTipo): boolean {
  if (!row.values?.length) return false;
  if (tipo === "C" || tipo === "P") return true;
  return false;
}

export function listCatalogValueRows(parentCatalogId: number | null): CatalogValueRow[] {
  const parentRows: PantallasCatalogRowDto[] = parentCatalogId
    ? (findCatalogRowById(parentCatalogId)?.values ?? [])
    : MOCK_PANTALLAS_CATALOG_ROOT;

  return parentRows.map((row) => {
    const tipo = rowTipo(row);
    return {
      catalogId: row.id,
      code: row.itemCode,
      name: row.description,
      status: "ACTIVO",
      nomenclatura: rowNomenclatura(row, tipo),
      tipo,
      canOpen: canOpenRow(row, tipo),
    };
  });
}

export function breadcrumbForCatalogPath(pathIds: number[]): { id: number | null; label: string }[] {
  const crumbs: { id: number | null; label: string }[] = [
    { id: null, label: "Valores del catálogo PANTALLAS" },
  ];
  for (const id of pathIds) {
    const row = findCatalogRowById(id);
    if (row) crumbs.push({ id, label: row.description });
  }
  return crumbs;
}
