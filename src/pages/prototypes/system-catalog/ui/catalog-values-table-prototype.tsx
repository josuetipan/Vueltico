import { ChevronDown, ChevronRight, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  breadcrumbForCatalogPath,
  listCatalogValueRows,
  type CatalogValueRow,
  type CatalogValueTipo,
} from "../lib/catalog-values-nav";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { DataTableCard } from "@/shared/ui/data/data-table-card";
import { DataTableToolbar } from "@/shared/ui/data/data-table-toolbar";
import {
  DataTableShell,
  dataTableHeadClass,
  dataTableTdClass,
  dataTableThClass,
} from "@/shared/ui/data/data-table-shell";
import { cn } from "@/shared/lib/utils";

function TipoBadge({ tipo }: { tipo: CatalogValueTipo }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 min-w-7 items-center justify-center rounded border text-xs font-bold",
        tipo === "C" && "border-amber-500/50 bg-amber-500/10 text-amber-900",
        tipo === "P" && "border-sky-500/50 bg-sky-500/10 text-sky-900",
        tipo === "A" && "border-violet-500/50 bg-violet-500/10 text-violet-900",
      )}
    >
      {tipo}
    </span>
  );
}

export function CatalogValuesTablePrototype() {
  /** Pila de carpetas/pantallas abiertas (solo ids con hijos). */
  const [pathIds, setPathIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const parentId = pathIds.length ? pathIds[pathIds.length - 1]! : null;

  const rows = useMemo(() => {
    let list = listCatalogValueRows(parentId);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.code.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          String(r.catalogId).includes(q),
      );
    }
    return list;
  }, [parentId, search]);

  const crumbs = breadcrumbForCatalogPath(pathIds);

  function openRow(row: CatalogValueRow) {
    if (!row.canOpen) return;
    setPathIds((prev) => [...prev, row.catalogId]);
    setSearch("");
  }

  function goToCrumb(index: number) {
    if (index === 0) setPathIds([]);
    else setPathIds(pathIds.slice(0, index));
    setSearch("");
  }

  if (collapsed) {
    return (
      <Card>
        <button
          type="button"
          className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium"
          onClick={() => setCollapsed(false)}
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
          Valores del catálogo (tabla drill-down)
        </button>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="flex flex-row items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          className="rounded p-1 hover:bg-muted"
          onClick={() => setCollapsed(true)}
          aria-label="Contraer panel"
        >
          <ChevronDown className="h-4 w-4" aria-hidden />
        </button>
        <CardTitle className="text-base font-semibold">Valores del catálogo</CardTitle>
      </CardHeader>

      <nav className="flex flex-wrap items-center gap-1 border-b border-border/80 bg-muted/20 px-4 py-2 text-xs">
        {crumbs.map((crumb, index) => (
          <span key={crumb.id ?? "root"} className="inline-flex items-center gap-1">
            {index > 0 ? <ChevronRight className="h-3 w-3 text-muted-foreground" aria-hidden /> : null}
            <button
              type="button"
              className={cn(
                "rounded px-1.5 py-0.5 hover:bg-muted",
                index === crumbs.length - 1 ? "font-semibold text-foreground" : "text-primary",
              )}
              onClick={() => goToCrumb(index)}
            >
              {crumb.label}
            </button>
          </span>
        ))}
      </nav>

      <DataTableCard
        toolbar={
          <DataTableToolbar
            searchPlaceholder="Buscar"
            searchValue={search}
            onSearchChange={setSearch}
            actions={
              <Button type="button" size="sm" className="gap-1">
                <Plus className="h-4 w-4" aria-hidden />
                Agregar
              </Button>
            }
          />
        }
        footer={
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm text-muted-foreground">
            <span>
              mostrando 1 a {rows.length} de {rows.length} registros
            </span>
            {pathIds.length > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPathIds((prev) => prev.slice(0, -1))}
              >
                Subir un nivel
              </Button>
            ) : null}
          </div>
        }
      >
        <DataTableShell>
          <table className="w-full min-w-[900px] text-sm">
            <thead className={dataTableHeadClass}>
              <tr>
                <th className={dataTableThClass}>No.</th>
                <th className={dataTableThClass}>Id</th>
                <th className={dataTableThClass}>Código</th>
                <th className={dataTableThClass}>Nombre</th>
                <th className={dataTableThClass}>Estado</th>
                <th className={dataTableThClass}>Nomenclatura</th>
                <th className={dataTableThClass}>Tipo</th>
                <th className={dataTableThClass}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.catalogId} className="border-b border-border/60 hover:bg-muted/30">
                  <td className={dataTableTdClass}>{index + 1}</td>
                  <td className={`${dataTableTdClass} font-mono text-xs`}>#{row.catalogId}</td>
                  <td className={dataTableTdClass}>{row.code}</td>
                  <td className={`${dataTableTdClass} font-medium`}>{row.name}</td>
                  <td className={dataTableTdClass}>
                    <Badge className="bg-emerald-600 font-normal hover:bg-emerald-600">{row.status}</Badge>
                  </td>
                  <td className={`${dataTableTdClass} max-w-[200px] truncate text-muted-foreground`}>
                    {row.nomenclatura}
                  </td>
                  <td className={dataTableTdClass}>
                    <TipoBadge tipo={row.tipo} />
                  </td>
                  <td className={dataTableTdClass}>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-primary"
                        disabled={!row.canOpen}
                        title={row.canOpen ? "Ver hijos" : "Sin hijos"}
                        onClick={() => openRow(row)}
                      >
                        <Eye className="h-4 w-4" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-primary"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-primary"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    Sin registros en este nivel.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </DataTableShell>
      </DataTableCard>

      <CardContent className="border-t border-border bg-muted/10 py-3 text-xs text-muted-foreground">
        <strong className="text-foreground">C</strong> = carpeta (ej. Plataforma). Abra con el ojo para ver hijas:{" "}
        <strong className="text-foreground">P</strong> = pantalla (Empresas, Planes…). En una{" "}
        <strong className="text-foreground">P</strong> con acciones UI, el ojo muestra filas{" "}
        <strong className="text-foreground">A</strong>.
      </CardContent>
    </Card>
  );
}
