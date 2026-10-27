import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  HTTP_METHODS,
  UI_ELEMENT_TYPES,
  uiElementLabel,
  type ScreenAction,
} from "@/entities/system-catalog";
import { systemCatalogUseCases } from "@/features/system-catalog/api/system-catalog-composition";
import { SystemCatalogSubnav } from "@/features/system-catalog/ui/system-catalog-subnav";
import { Button } from "@/shared/ui/button";
import { DataTableCard } from "@/shared/ui/data/data-table-card";
import { StatePanel } from "@/shared/ui/feedback/state-panel";
import { SelectField } from "@/shared/ui/select-field";
import {
  DataTableShell,
  dataTableHeadClass,
  dataTableTdClass,
  dataTableThClass,
} from "@/shared/ui/data/data-table-shell";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";

type ActionDraft = {
  name: string;
  permissionKey: string;
  httpMethod: (typeof HTTP_METHODS)[number];
  apiRoute: string;
  uiElement: (typeof UI_ELEMENT_TYPES)[number] | "";
  description: string;
};

const emptyAction = (): ActionDraft => ({
  name: "",
  permissionKey: "",
  httpMethod: "GET",
  apiRoute: "",
  uiElement: "",
  description: "",
});

export function ScreenActionsBlock() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const screenParam = searchParams.get("screen") ?? "";

  const screensQuery = useQuery({
    queryKey: ["system-catalog", "screens-all"],
    queryFn: () => systemCatalogUseCases.listScreens({ page: 1, pageSize: 200 }),
  });

  const screenOptions = useMemo(
    () => screensQuery.data?.data ?? [],
    [screensQuery.data?.data],
  );

  const [screenId, setScreenId] = useState("");
  useEffect(() => {
    if (screenParam) setScreenId(screenParam);
    else if (!screenId && screenOptions[0]) setScreenId(screenOptions[0].id);
  }, [screenParam, screenOptions, screenId]);

  const selectedScreen = screenOptions.find((s) => s.id === screenId);

  const actionsQuery = useQuery({
    queryKey: ["system-catalog", "actions", screenId],
    queryFn: () => systemCatalogUseCases.listActionsByScreen(screenId),
    enabled: Boolean(screenId),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ScreenAction | null>(null);
  const [draft, setDraft] = useState<ActionDraft>(emptyAction);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        screenId,
        name: draft.name,
        permissionKey: draft.permissionKey,
        httpMethod: draft.httpMethod,
        apiRoute: draft.apiRoute,
        uiElement: draft.uiElement || null,
        description: draft.description,
      };
      if (editing) return systemCatalogUseCases.updateScreenAction(editing.id, payload);
      return systemCatalogUseCases.createScreenAction(payload);
    },
    onSuccess: () => {
      toast.success(editing ? "Acción actualizada" : "Acción agregada");
      setDialogOpen(false);
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ["system-catalog"] });
    },
    onError: () => toast.error("permission_key inválido o duplicado."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => systemCatalogUseCases.deleteScreenAction(id),
    onSuccess: () => {
      toast.success("Acción eliminada");
      setDeleteId(null);
      void queryClient.invalidateQueries({ queryKey: ["system-catalog"] });
    },
  });

  function openCreate() {
    setEditing(null);
    setDraft(emptyAction());
    setDialogOpen(true);
  }

  function openEdit(action: ScreenAction) {
    setEditing(action);
    setDraft({
      name: action.name,
      permissionKey: action.permissionKey,
      httpMethod: action.httpMethod,
      apiRoute: action.apiRoute,
      uiElement: action.uiElement ?? "",
      description: action.description,
    });
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <SystemCatalogSubnav />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,280px)_1fr]">
        <SelectField
          id="pick-screen"
          label="Pantalla"
          value={screenId}
          onChange={(v) => {
            setScreenId(v);
            setSearchParams(v ? { screen: v } : {});
          }}
          options={screenOptions.map((s) => ({
            value: s.id,
            label: `${s.moduleName} · ${s.name}`,
          }))}
        />
        {selectedScreen ? (
          <div className="text-sm text-muted-foreground lg:pt-7">
            <span className="font-mono text-xs">{selectedScreen.screenKey}</span>
            <span className="mx-2">·</span>
            <span className="font-mono text-xs">{selectedScreen.path}</span>
          </div>
        ) : null}
      </div>

      <DataTableCard
        toolbar={
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <p className="text-sm font-medium">Acciones / botones habilitados</p>
            <Button type="button" size="sm" onClick={openCreate} disabled={!screenId}>
              Agregar acción
            </Button>
          </div>
        }
      >
        {!screenId ? (
          <StatePanel variant="empty" title="Seleccione una pantalla" className="border-0" />
        ) : actionsQuery.isLoading ? (
          <StatePanel variant="loading" title="Cargando acciones…" className="border-0" />
        ) : (
          <DataTableShell>
            <table className="w-full min-w-[720px] text-sm">
              <thead className={dataTableHeadClass}>
                <tr>
                  <th className={dataTableThClass}>Acción / botón</th>
                  <th className={dataTableThClass}>permission_key</th>
                  <th className={dataTableThClass}>Método / endpoint</th>
                  <th className={dataTableThClass}>Descripción</th>
                  <th className={dataTableThClass} />
                </tr>
              </thead>
              <tbody>
                {(actionsQuery.data ?? []).map((row) => (
                  <tr key={row.id} className="border-b border-border/60">
                    <td className={dataTableTdClass}>
                      <p className="font-medium">{row.name}</p>
                      {row.uiElement ? (
                        <p className="text-xs text-muted-foreground">
                          {uiElementLabel(row.uiElement)}
                        </p>
                      ) : null}
                    </td>
                    <td className={`${dataTableTdClass} font-mono text-xs`}>{row.permissionKey}</td>
                    <td className={`${dataTableTdClass} font-mono text-xs`}>
                      {row.httpMethod} {row.apiRoute}
                    </td>
                    <td className={dataTableTdClass}>{row.description}</td>
                    <td className={dataTableTdClass}>
                      <div className="flex gap-1">
                        <Button type="button" variant="outline" size="sm" onClick={() => openEdit(row)}>
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => setDeleteId(row.id)}
                        >
                          Eliminar
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar acción" : "Agregar acción a pantalla"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nombre de la acción</Label>
              <Input value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Permiso atómico (modulo:accion)</Label>
              <Input
                value={draft.permissionKey}
                onChange={(e) => setDraft((p) => ({ ...p, permissionKey: e.target.value }))}
                placeholder="transfers:approve"
              />
            </div>
            <SelectField
              id="act-method"
              label="Método HTTP"
              value={draft.httpMethod}
              onChange={(v) =>
                setDraft((p) => ({ ...p, httpMethod: v as ActionDraft["httpMethod"] }))
              }
              options={HTTP_METHODS.map((m) => ({ value: m, label: m }))}
            />
            <div className="space-y-1.5">
              <Label>Ruta API protegida</Label>
              <Input
                value={draft.apiRoute}
                onChange={(e) => setDraft((p) => ({ ...p, apiRoute: e.target.value }))}
              />
            </div>
            <SelectField
              id="act-ui"
              label="Elemento UI (opcional)"
              value={draft.uiElement || "Otro"}
              onChange={(v) =>
                setDraft((p) => ({
                  ...p,
                  uiElement: v === "Otro" ? "" : (v as ActionDraft["uiElement"]),
                }))
              }
              options={[
                { value: "Otro", label: "— Sin especificar —" },
                ...UI_ELEMENT_TYPES.map((u) => ({ value: u, label: uiElementLabel(u) })),
              ]}
            />
            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Input
                value={draft.description}
                onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar acción?</AlertDialogTitle>
            <AlertDialogDescription>
              Se quitará de los roles globales que la referencien.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
