import { useMemo, useState } from "react";
import { mapPantallasCatalog } from "../lib/pantallas-catalog.mapper";
import { MOCK_PANTALLAS_CATALOG_ROOT } from "../model/mock-pantallas-catalog.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { SelectField } from "@/shared/ui/select-field";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";

const MAPPED = mapPantallasCatalog(MOCK_PANTALLAS_CATALOG_ROOT);

/** Simula login cap_security */
const MOCK_LOGIN = {
  allowedScreenIds: new Set([2101, 2102]),
  allowedActionKeys: new Set(["transfers:view", "transfers:export", "transfers:approve"]),
};

function canPerform(screenKey: string, actionId: string): boolean {
  const screenEntry = Object.entries(MAPPED.screenKeyByCatalogId).find(([, sk]) => sk === screenKey);
  if (!screenEntry) return false;
  const catalogId = Number(screenEntry[0]);
  if (!MOCK_LOGIN.allowedScreenIds.has(catalogId)) return false;
  return MOCK_LOGIN.allowedActionKeys.has(actionId);
}

export function RuntimeAccessPrototype() {
  const [screenKey, setScreenKey] = useState("transferencias-listado");

  const actions = useMemo(() => {
    const entry = Object.entries(MAPPED.screenKeyByCatalogId).find(([, sk]) => sk === screenKey);
    if (!entry) return [];
    return MAPPED.actionsByScreenId[Number(entry[0])] ?? [];
  }, [screenKey]);

  const screenOptions = useMemo(() => {
    const items: { value: string; label: string }[] = [];
    for (const section of MAPPED.menuSections) {
      for (const s of section.children) {
        items.push({ value: s.screenKey, label: `${section.label} · ${s.label}` });
      }
    }
    return items;
  }, []);

  const hasScreen = Object.values(MAPPED.screenKeyByCatalogId).includes(screenKey)
    ? MOCK_LOGIN.allowedScreenIds.has(
        Number(
          Object.entries(MAPPED.screenKeyByCatalogId).find(([, sk]) => sk === screenKey)?.[0],
        ),
      )
    : false;

  return (
    <div className="space-y-4">
      <Card className="border-dashed">
        <CardContent className="space-y-1 py-3 font-mono text-[11px] text-muted-foreground">
          <p>
            allowedScreenIds: [{[...MOCK_LOGIN.allowedScreenIds].join(", ")}]
          </p>
          <p>
            allowedActionKeys: [{[...MOCK_LOGIN.allowedActionKeys].join(", ")}]
          </p>
          <p className="font-sans text-xs">
            Regla: sin pantalla en allowedScreenIds → denegar aunque exista el actionId.
          </p>
        </CardContent>
      </Card>

      <SelectField
        id="runtime-screen"
        label="screenKey (workspace registry)"
        value={screenKey}
        onChange={setScreenKey}
        options={screenOptions}
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Botones en pantalla</CardTitle>
          <CardDescription>
            <code>canPerform(screenKey, actionId)</code> — actionId = itemCode del ACTION.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!hasScreen ? (
            <p className="text-sm text-destructive">
              Usuario sin acceso a esta pantalla (catalog_id no está en allowedScreenIds). Todos los
              botones ocultos.
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => {
              const allowed = canPerform(screenKey, action.actionId);
              return allowed ? (
                <Button key={action.actionId} type="button" size="sm" variant="default">
                  {action.description}
                </Button>
              ) : (
                <Badge
                  key={action.actionId}
                  variant="outline"
                  className={cn("text-muted-foreground line-through opacity-60")}
                  title={`Sin permiso: ${action.actionId}`}
                >
                  {action.description} (oculto)
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
