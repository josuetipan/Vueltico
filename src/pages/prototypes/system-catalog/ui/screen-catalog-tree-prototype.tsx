import { ChevronRight, FolderPlus, LayoutPanelLeft, Monitor, MousePointerClick } from "lucide-react";
import { useMemo, useState } from "react";
import {
  filterTreeByEntityScreens,
  mapPantallasCatalog,
} from "../lib/pantallas-catalog.mapper";
import { MOCK_ENTITY_ALLOWED_SCREEN_IDS, MOCK_PANTALLAS_CATALOG_ROOT } from "../model/mock-pantallas-catalog.api";
import type { CatalogTreeNode } from "../model/pantallas-catalog.types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { cn } from "@/shared/lib/utils";

const MAPPED = mapPantallasCatalog(MOCK_PANTALLAS_CATALOG_ROOT);

function KindBadge({ kind }: { kind: CatalogTreeNode["kind"] }) {
  const label = kind === "folder" ? "C" : kind === "screen" ? "P" : "A";
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded px-1 text-[10px] font-bold leading-none",
        kind === "folder" && "bg-amber-500/15 text-amber-900 dark:text-amber-100",
        kind === "screen" && "bg-sky-500/15 text-sky-900 dark:text-sky-100",
        kind === "action" && "bg-violet-500/15 text-violet-900 dark:text-violet-100",
      )}
      title={
        kind === "folder"
          ? "Carpeta (menú)"
          : kind === "screen"
            ? "Pantalla (catalog_id + screenKey)"
            : "Acción ACTION (csuic_id / itemCode)"
      }
    >
      {label}
    </span>
  );
}

function findNode(nodes: CatalogTreeNode[], id: string): CatalogTreeNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const found = findNode(n.children, id);
      if (found) return found;
    }
  }
  return null;
}

function collectExpandableIds(nodes: CatalogTreeNode[], acc: string[] = []): string[] {
  for (const n of nodes) {
    if (n.children?.length) acc.push(n.id);
    if (n.children) collectExpandableIds(n.children, acc);
  }
  return acc;
}

type TreeRowProps = {
  node: CatalogTreeNode;
  depth: number;
  expanded: Set<string>;
  selectedId: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
};

function TreeRow({ node, depth, expanded, selectedId, onToggle, onSelect }: TreeRowProps) {
  const hasChildren = Boolean(node.children?.length);
  const isOpen = expanded.has(node.id);
  const selected = selectedId === node.id;
  const canExpand = hasChildren && node.kind !== "action";

  return (
    <>
      <button
        type="button"
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
          selected ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted/60",
          node.kind === "action" && "text-foreground/85",
        )}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => onSelect(node.id)}
      >
        {canExpand ? (
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-muted"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
            aria-hidden
          >
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform",
                isOpen && "rotate-90",
              )}
            />
          </span>
        ) : (
          <span className="inline-block w-5 shrink-0" aria-hidden />
        )}
        <KindBadge kind={node.kind} />
        <span className="min-w-0 flex-1 truncate font-medium">{node.label}</span>
        <span className="hidden font-mono text-[10px] text-muted-foreground sm:block">
          #{node.catalogId}
        </span>
      </button>
      {canExpand && isOpen
        ? node.children!.map((child) => (
            <TreeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              selectedId={selectedId}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))
        : null}
    </>
  );
}

function MenuPreview({ sections }: { sections: typeof MAPPED.menuSections }) {
  return (
    <ul className="space-y-3">
      {sections.map((section) => (
        <li key={section.catalogId}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted">
            {section.label}
          </p>
          <ul className="mt-1 space-y-0.5">
            {section.children.map((screen) => (
              <li key={screen.catalogId}>
                <span className="block rounded px-2 py-1 text-xs text-sidebar-foreground/90">
                  {screen.label}
                </span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

export function ScreenCatalogTreePrototype() {
  const entityTree = useMemo(
    () => filterTreeByEntityScreens(MAPPED.tree, MOCK_ENTITY_ALLOWED_SCREEN_IDS),
    [],
  );
  const entityMenu = useMemo(
    () => mapPantallasCatalog(MOCK_PANTALLAS_CATALOG_ROOT).menuSections.map((s) => ({
      ...s,
      children: s.children.filter((c) => MOCK_ENTITY_ALLOWED_SCREEN_IDS.has(c.catalogId)),
    })).filter((s) => s.children.length > 0),
    [],
  );

  const [expanded, setExpanded] = useState(() => new Set(collectExpandableIds(MAPPED.tree)));
  const [selectedId, setSelectedId] = useState<string | null>("scr-2101");
  const [draftMode, setDraftMode] = useState<"folder" | "screen" | "action" | null>(null);
  const [showEntityFilter, setShowEntityFilter] = useState(false);

  const displayTree = showEntityFilter ? entityTree : MAPPED.tree;
  const displayMenu = showEntityFilter ? entityMenu : MAPPED.menuSections;

  const selected = useMemo(
    () => (selectedId ? findNode(MAPPED.tree, selectedId) : null),
    [selectedId],
  );

  const parentFolder = selected ? findParentFolder(MAPPED.tree, selected.id) : null;
  const parentScreen = selected?.kind === "action" ? findParentScreen(MAPPED.tree, selected.id) : selected?.kind === "screen" ? selected : null;

  function onToggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-4">
        <Card className="border-dashed bg-muted/15">
          <CardContent className="flex flex-wrap items-center gap-3 py-3 text-xs text-muted-foreground">
            <span>
              Fuente: <code className="text-foreground">GET …/catalogs/item-code/PANTALLAS</code>
            </span>
            <label className="ml-auto inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={showEntityFilter}
                onChange={(e) => setShowEntityFilter(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-input"
              />
              Filtrar por entidad (permisos por entidad)
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">Árbol PANTALLAS (parametrización)</CardTitle>
                <CardDescription>
                  <strong>C</strong> carpeta · <strong>P</strong> pantalla (<code>catalog_id</code>,{" "}
                  <code>screenKey</code> en val02) · <strong>A</strong> acción (<code>val01=ACTION</code>
                  , <code>itemCode</code> = csuic_id). Las acciones no aparecen en el menú.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!selected || selected.kind !== "folder"}
                  onClick={() => setDraftMode("folder")}
                >
                  <FolderPlus className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  Carpeta (C)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!parentFolder || parentFolder.kind !== "folder"}
                  onClick={() => setDraftMode("screen")}
                >
                  <Monitor className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  Pantalla (P)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!parentScreen || parentScreen.kind !== "screen"}
                  onClick={() => setDraftMode("action")}
                >
                  <MousePointerClick className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  Acción (A)
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="rounded-lg border border-dashed border-border bg-muted/20 p-2">
            {displayTree.map((node) => (
              <TreeRow
                key={node.id}
                node={node}
                depth={0}
                expanded={expanded}
                selectedId={selectedId}
                onToggle={onToggle}
                onSelect={(id) => {
                  setSelectedId(id);
                  setDraftMode(null);
                }}
              />
            ))}
          </CardContent>
        </Card>

        {draftMode ? (
          <Card className="border-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Registrar componente UI / fila catálogo (demo)
              </CardTitle>
              <CardDescription>
                Id numérico y itemCode definitivos; selector solo en val04 (no autoriza).
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>description</Label>
                <Input placeholder="Nombre visible" />
              </div>
              <div className="space-y-1.5">
                <Label>itemCode (csuic_id si es ACTION)</Label>
                <Input placeholder="seg-prmg-btn-create-permisos" className="font-mono text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label>val01</Label>
                <Input
                  readOnly
                  value={draftMode === "folder" ? "FOLDER" : draftMode === "screen" ? "SCREEN" : "ACTION"}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label>{draftMode === "screen" ? "val02 screenKey" : "val02 método HTTP"}</Label>
                <Input
                  placeholder={draftMode === "screen" ? "permisos-granulares" : "POST"}
                  className="font-mono text-sm"
                />
              </div>
              {draftMode !== "folder" ? (
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>{draftMode === "screen" ? "val03 path" : "val03 API route"}</Label>
                  <Input placeholder="/api/v1/..." className="font-mono text-sm" />
                </div>
              ) : null}
              {draftMode === "action" ? (
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>val04 elementSelector (solo UI)</Label>
                  <Input placeholder="#btn-create" className="font-mono text-sm" />
                </div>
              ) : null}
              <div className="flex gap-2 sm:col-span-2">
                <Button type="button" size="sm">
                  POST catálogo (demo)
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setDraftMode(null)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : selected ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                <KindBadge kind={selected.kind} />
                {selected.label}
                <Badge variant="outline" className="font-mono text-[10px] font-normal">
                  id {selected.catalogId}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 font-mono text-xs">
              <p>
                <span className="text-muted-foreground font-sans">itemCode:</span> {selected.itemCode}
              </p>
              <p>
                <span className="text-muted-foreground font-sans">val01:</span> {selected.val01 ?? "—"}
              </p>
              {selected.kind === "screen" ? (
                <>
                  <p>
                    <span className="text-muted-foreground font-sans">screenKey (val02):</span>{" "}
                    {selected.screenKey}
                  </p>
                  <p>
                    <span className="text-muted-foreground font-sans">path (val03):</span> {selected.path}
                  </p>
                  <p className="pt-2 font-sans text-sm text-muted-foreground">
                    Acciones hijas: {MAPPED.actionsByScreenId[selected.catalogId]?.length ?? 0} →{" "}
                    <code>actionsByScreenId[{selected.catalogId}]</code>
                  </p>
                </>
              ) : null}
              {selected.kind === "action" ? (
                <>
                  <p className="font-sans text-sm text-amber-800 dark:text-amber-200">
                    Autorizar solo con igualdad exacta de{" "}
                    <code className="font-mono">{selected.itemCode}</code> en allowedActionKeys.
                  </p>
                  <p>
                    <span className="text-muted-foreground font-sans">elementSelector:</span>{" "}
                    {selected.elementSelector ?? "—"} (no usar para permisos)
                  </p>
                </>
              ) : null}
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="space-y-4 xl:sticky xl:top-4 xl:self-start">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-sidebar-border bg-sidebar pb-3 text-sidebar-foreground">
            <CardTitle className="flex items-center gap-2 text-sm">
              <LayoutPanelLeft className="h-4 w-4" aria-hidden />
              Menú (mapper → GranularMenuSection[])
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-sidebar px-3 py-4 text-sidebar-foreground">
            <MenuPreview sections={displayMenu} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium">actionsByScreenId (extracto)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-40 overflow-auto rounded bg-muted/50 p-2 text-[10px] leading-relaxed">
              {JSON.stringify(
                Object.fromEntries(
                  Object.entries(MAPPED.actionsByScreenId)
                    .slice(0, 2)
                    .map(([k, v]) => [k, v.map((a) => a.actionId)]),
                ),
                null,
                2,
              )}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function findParentFolder(nodes: CatalogTreeNode[], childId: string): CatalogTreeNode | null {
  for (const n of nodes) {
    if (n.kind === "folder" && n.children?.some((c) => c.id === childId)) return n;
    if (n.children) {
      const inner = findParentFolder(n.children, childId);
      if (inner) return inner;
    }
  }
  return null;
}

function findParentScreen(nodes: CatalogTreeNode[], actionId: string): CatalogTreeNode | null {
  for (const n of nodes) {
    if (n.kind === "screen" && n.children?.some((c) => c.id === actionId)) return n;
    if (n.children) {
      const inner = findParentScreen(n.children, actionId);
      if (inner) return inner;
    }
  }
  return null;
}
