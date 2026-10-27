import { useMemo, useState } from "react";
import { mapPantallasCatalog, filterTreeByEntityScreens } from "../lib/pantallas-catalog.mapper";
import { MOCK_ENTITY_ALLOWED_SCREEN_IDS, MOCK_PANTALLAS_CATALOG_ROOT } from "../model/mock-pantallas-catalog.api";
import type { HttpMethod } from "@/entities/system-catalog";
import { RolePermissionMatrix } from "@/features/system-catalog/ui/role-permission-matrix";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { SelectField } from "@/shared/ui/select-field";
import { toast } from "sonner";

const MAPPED = mapPantallasCatalog(MOCK_PANTALLAS_CATALOG_ROOT);

const MOCK_ROLES = [
  { id: "ROLE_CASHIER", name: "Cajero / Operador" },
  { id: "ROLE_ADMIN", name: "Administrador" },
  { id: "ROLE_AUDITOR", name: "Auditor" },
];

const SEED_GRANTS: Record<string, { screens: number[]; actions: string[] }> = {
  ROLE_CASHIER: {
    screens: [2101],
    actions: ["transfers:view", "transfers:export"],
  },
  ROLE_ADMIN: {
    screens: [1101, 1102, 2101, 2102],
    actions: [
      "seg-prmg-btn-create-permisos",
      "seg-prmg-btn-save-masivo",
      "btn_editar_usuario",
      "transfers:view",
      "transfers:export",
      "transfers:approve",
    ],
  },
  ROLE_AUDITOR: {
    screens: [2101],
    actions: ["transfers:view", "transfers:export"],
  },
};

export function GranularPermissionsPrototype() {
  const [roleId, setRoleId] = useState(MOCK_ROLES[1]!.id);
  const [screenIds, setScreenIds] = useState<Set<number>>(
    () => new Set(SEED_GRANTS[roleId]?.screens ?? []),
  );
  const [actionKeys, setActionKeys] = useState<Set<string>>(
    () => new Set(SEED_GRANTS[roleId]?.actions ?? []),
  );

  const entityTree = useMemo(
    () => filterTreeByEntityScreens(MAPPED.tree, MOCK_ENTITY_ALLOWED_SCREEN_IDS),
    [],
  );

  const matrixTree = useMemo(
    () =>
      entityTree.map((folder) => ({
        module: { id: String(folder.catalogId), name: folder.label },
        screens: (folder.children ?? [])
          .filter((c) => c.kind === "screen")
          .map((screen) => ({
            id: String(screen.catalogId),
            name: screen.label,
            screenKey: screen.screenKey ?? screen.itemCode,
            actions: (screen.children ?? [])
              .filter((a) => a.kind === "action")
              .map((a) => ({
                id: a.id,
                screenId: String(screen.catalogId),
                name: a.label,
                permissionKey: a.itemCode,
                httpMethod: (a.val02 ?? "GET") as HttpMethod,
                apiRoute: a.val03 ?? "",
                uiElement: null,
                description: a.label,
              })),
          })),
      })),
    [entityTree],
  );

  const selectedKeys = useMemo(() => {
    const keys = new Set(actionKeys);
    return keys;
  }, [actionKeys]);

  function loadRole(id: string) {
    setRoleId(id);
    const seed = SEED_GRANTS[id];
    setScreenIds(new Set(seed?.screens ?? []));
    setActionKeys(new Set(seed?.actions ?? []));
  }

  function toggleKey(key: string, checked: boolean) {
    setActionKeys((prev) => {
      const next = new Set(prev);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  function toggleScreen(keys: string[], checked: boolean) {
    setActionKeys((prev) => {
      const next = new Set(prev);
      for (const k of keys) {
        if (checked) next.add(k);
        else next.delete(k);
      }
      return next;
    });
  }

  function onSave() {
    toast.success("Demo: grants → cap_security (allowedScreenIds + allowedActionKeys)");
  }

  return (
    <div className="space-y-4">
      <Card className="border-dashed">
        <CardContent className="py-3 text-xs text-muted-foreground">
          Misma fuente PANTALLAS que parametrización. Solo pantallas habilitadas para la entidad.
          Guardado masivo: ids de pantalla + <code>itemCode</code> de cada ACTION (csuic_id).
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-end gap-4">
        <SelectField
          id="demo-role"
          label="Rol global (plantilla)"
          value={roleId}
          onChange={loadRole}
          options={MOCK_ROLES.map((r) => ({ value: r.id, label: `${r.name} (${r.id})` }))}
        />
        <Button type="button" onClick={onSave}>
          Guardar permisos granulares (demo)
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Árbol granular-menu-tree</CardTitle>
          <CardDescription>
            Pantallas marcadas → <code>allowedScreenIds</code>. Acciones →{" "}
            <code>allowedActionKeys</code> (igualdad exacta, sin aliases).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded bg-muted px-2 py-1">
              Pantallas rol: {[...screenIds].join(", ") || "—"}
            </span>
          </div>
          <RolePermissionMatrix
            tree={matrixTree}
            selectedKeys={selectedKeys}
            onToggle={toggleKey}
            onToggleScreen={toggleScreen}
          />
          <p className="text-xs text-muted-foreground">
            Nota prototipo: los checkboxes de pantalla a nivel módulo controlan acciones; en producción
            también persistir <code>catalog_id</code> de pantalla aunque no tenga acciones hijas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
