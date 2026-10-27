import { useEffect, useState } from "react";
import {
  CATALOG_STATUSES,
  catalogStatusLabel,
  type CatalogModule,
  type CatalogScreen,
  type CatalogStatus,
} from "@/entities/system-catalog";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { SelectField } from "@/shared/ui/select-field";

export type ScreenFormValues = {
  moduleId: string;
  name: string;
  screenKey: string;
  path: string;
  description: string;
  status: CatalogStatus;
};

type ScreenFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modules: CatalogModule[];
  editing: CatalogScreen | null;
  onSubmit: (values: ScreenFormValues) => void;
  isPending: boolean;
  onCreateModule: (name: string) => void;
};

function emptyValues(modules: CatalogModule[]): ScreenFormValues {
  return {
    moduleId: modules[0]?.id ?? "",
    name: "",
    screenKey: "",
    path: "",
    description: "",
    status: "ACTIVE",
  };
}

export function ScreenFormDialog({
  open,
  onOpenChange,
  modules,
  editing,
  onSubmit,
  isPending,
  onCreateModule,
}: ScreenFormDialogProps) {
  const [draft, setDraft] = useState<ScreenFormValues>(() => emptyValues(modules));
  const [newModuleName, setNewModuleName] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setDraft({
        moduleId: editing.moduleId,
        name: editing.name,
        screenKey: editing.screenKey,
        path: editing.path,
        description: editing.description,
        status: editing.status,
      });
    } else {
      setDraft(emptyValues(modules));
    }
  }, [open, editing, modules]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar pantalla" : "Registrar pantalla"}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(draft);
          }}
        >
          <SelectField
            id="scr-module"
            label="Módulo perteneciente"
            value={draft.moduleId}
            onChange={(v) => setDraft((p) => ({ ...p, moduleId: v }))}
            options={modules.map((m) => ({ value: m.id, label: m.name }))}
          />
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Nuevo módulo (nombre)"
              value={newModuleName}
              onChange={(e) => setNewModuleName(e.target.value)}
              className="max-w-[220px]"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (!newModuleName.trim()) return;
                onCreateModule(newModuleName.trim());
                setNewModuleName("");
              }}
            >
              Crear módulo
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="scr-name">Nombre visible</Label>
            <Input
              id="scr-name"
              value={draft.name}
              onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="scr-key">Identificador único (screen_key)</Label>
            <Input
              id="scr-key"
              value={draft.screenKey}
              onChange={(e) => setDraft((p) => ({ ...p, screenKey: e.target.value }))}
              placeholder="view_transfers_list"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="scr-path">Ruta de navegación (path)</Label>
            <Input
              id="scr-path"
              value={draft.path}
              onChange={(e) => setDraft((p) => ({ ...p, path: e.target.value }))}
              placeholder="/app/empresa/transferencias"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="scr-desc">Descripción</Label>
            <Input
              id="scr-desc"
              value={draft.description}
              onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
            />
          </div>
          <SelectField
            id="scr-status"
            label="Estado"
            value={draft.status}
            onChange={(v) => setDraft((p) => ({ ...p, status: v as CatalogStatus }))}
            options={CATALOG_STATUSES.map((s) => ({ value: s, label: catalogStatusLabel(s) }))}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
