import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { CatalogStatusBadge, type CatalogScreen } from "@/entities/system-catalog";
import { systemCatalogUseCases } from "@/features/system-catalog/api/system-catalog-composition";
import { ScreenFormDialog } from "@/features/system-catalog/ui/screen-form-dialog";
import { SystemCatalogSubnav } from "@/features/system-catalog/ui/system-catalog-subnav";
import { Button } from "@/shared/ui/button";
import { DataTableCard } from "@/shared/ui/data/data-table-card";
import { DataTableToolbar } from "@/shared/ui/data/data-table-toolbar";
import { TablePagination } from "@/shared/ui/data/table-pagination";
import { StatePanel } from "@/shared/ui/feedback/state-panel";
import { SelectField } from "@/shared/ui/select-field";
import { TABLE_PAGE_SIZE } from "@/shared/lib/table-pagination";
import {
  DataTableShell,
  dataTableHeadClass,
  dataTableTdClass,
  dataTableThClass,
} from "@/shared/ui/data/data-table-shell";
import { CATALOG_STATUSES, catalogStatusLabel, type CatalogStatus } from "@/entities/system-catalog";

export function ScreensCatalogBlock() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [moduleId, setModuleId] = useState<string | "all">("all");
  const [status, setStatus] = useState<CatalogStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CatalogScreen | null>(null);

  const modulesQuery = useQuery({
    queryKey: ["system-catalog", "modules"],
    queryFn: () => systemCatalogUseCases.listModules(),
  });

  const screensQuery = useQuery({
    queryKey: ["system-catalog", "screens", { search, moduleId, status, page }],
    queryFn: () =>
      systemCatalogUseCases.listScreens({
        page,
        pageSize: TABLE_PAGE_SIZE,
        search,
        moduleId,
        status,
      }),
  });

  const saveMutation = useMutation({
    mutationFn: (values: Parameters<typeof systemCatalogUseCases.createScreen>[0]) => {
      if (editing) return systemCatalogUseCases.updateScreen(editing.id, values);
      return systemCatalogUseCases.createScreen(values);
    },
    onSuccess: () => {
      toast.success(editing ? "Pantalla actualizada" : "Pantalla registrada");
      setDialogOpen(false);
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ["system-catalog"] });
    },
    onError: () => toast.error("Revise screen_key único y campos obligatorios."),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: CatalogStatus }) =>
      systemCatalogUseCases.setScreenStatus(id, next),
    onSuccess: () => {
      toast.success("Estado actualizado");
      void queryClient.invalidateQueries({ queryKey: ["system-catalog"] });
    },
  });

  const createModuleMutation = useMutation({
    mutationFn: async (name: string) =>
      systemCatalogUseCases.createModule({
        name,
        slug: name
          .toLowerCase()
          .normalize("NFD")
          .replace(/\p{M}/gu, "")
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      }),
    onSuccess: () => {
      toast.success("Módulo creado");
      void queryClient.invalidateQueries({ queryKey: ["system-catalog", "modules"] });
    },
    onError: () => toast.error("El slug del módulo ya existe."),
  });

  const modules = modulesQuery.data ?? [];

  return (
    <div className="space-y-6">
      <SystemCatalogSubnav />

      <DataTableCard
        toolbar={
          <DataTableToolbar
            searchPlaceholder="Pantalla, key o ruta…"
            searchValue={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            filters={
              <>
                <SelectField
                  id="flt-mod"
                  variant="toolbar"
                  label="Módulo"
                  value={moduleId}
                  onChange={(v) => {
                    setModuleId(v);
                    setPage(1);
                  }}
                  options={[
                    { value: "all", label: "Todos" },
                    ...modules.map((m) => ({ value: m.id, label: m.name })),
                  ]}
                />
                <SelectField
                  id="flt-st"
                  variant="toolbar"
                  label="Estado"
                  value={status}
                  onChange={(v) => {
                    setStatus(v as CatalogStatus | "all");
                    setPage(1);
                  }}
                  options={[
                    { value: "all", label: "Todos" },
                    ...CATALOG_STATUSES.map((s) => ({ value: s, label: catalogStatusLabel(s) })),
                  ]}
                />
              </>
            }
            actions={
              <Button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setDialogOpen(true);
                }}
              >
                Registrar pantalla
              </Button>
            }
          />
        }
        footer={
          screensQuery.data?.meta ? (
            <TablePagination
              page={screensQuery.data.meta.page}
              totalPages={screensQuery.data.meta.totalPages}
              totalItems={screensQuery.data.meta.totalItems}
              pageSize={screensQuery.data.meta.pageSize}
              onPageChange={setPage}
            />
          ) : null
        }
      >
        {screensQuery.isLoading ? (
          <StatePanel variant="loading" title="Cargando pantallas…" className="border-0" />
        ) : screensQuery.isError ? (
          <StatePanel variant="error" title="Error al cargar" className="border-0" />
        ) : (
          <DataTableShell>
            <table className="w-full min-w-[880px] text-sm">
              <thead className={dataTableHeadClass}>
                <tr>
                  <th className={dataTableThClass}>Módulo padre</th>
                  <th className={dataTableThClass}>Pantalla</th>
                  <th className={dataTableThClass}>screen_key</th>
                  <th className={dataTableThClass}>Ruta</th>
                  <th className={dataTableThClass}>Estado</th>
                  <th className={dataTableThClass}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {(screensQuery.data?.data ?? []).map((row) => (
                  <tr key={row.id} className="border-b border-border/60">
                    <td className={dataTableTdClass}>{row.moduleName}</td>
                    <td className={dataTableTdClass}>
                      <p className="font-medium">{row.name}</p>
                      <p className="text-xs text-muted-foreground">{row.actionCount} acciones</p>
                    </td>
                    <td className={`${dataTableTdClass} font-mono text-xs`}>{row.screenKey}</td>
                    <td className={`${dataTableTdClass} font-mono text-xs`}>{row.path}</td>
                    <td className={dataTableTdClass}>
                      <CatalogStatusBadge status={row.status} />
                    </td>
                    <td className={dataTableTdClass}>
                      <div className="flex flex-wrap gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditing(row);
                            setDialogOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button type="button" variant="outline" size="sm" asChild>
                          <Link
                            to={`/app/superadmin/sistema/permisos?screen=${row.id}`}
                          >
                            Gestionar acciones
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            statusMutation.mutate({
                              id: row.id,
                              next: row.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                            })
                          }
                        >
                          {row.status === "ACTIVE" ? "Desactivar" : "Activar"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataTableShell>
        )}
      </DataTableCard>

      <ScreenFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        modules={modules}
        editing={editing}
        isPending={saveMutation.isPending}
        onSubmit={(values) => saveMutation.mutate(values)}
        onCreateModule={(name) => createModuleMutation.mutate(name)}
      />
    </div>
  );
}
