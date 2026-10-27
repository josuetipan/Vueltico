import { PrototypeFrame } from "@/shared/ui/prototype/prototype-frame";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { PrototypeShowcaseLayout } from "@/widgets/prototype-showcase";
import { CatalogValuesTablePrototype } from "./catalog-values-table-prototype";
import { ScreenCatalogTreePrototype } from "./screen-catalog-tree-prototype";
import { GranularPermissionsPrototype } from "./granular-permissions-prototype";
import { RuntimeAccessPrototype } from "./runtime-access-prototype";

export function SystemCatalogPrototypeHome() {
  return (
    <PrototypeFrame moduleLabel="system-catalog">
      <div className="space-y-6">
        <PageHeader
          title="Prototipo · Catálogo PANTALLAS y permisos granulares (modelo Captec)"
          description="Árbol API → mapper (menú + actionsByScreenId) → asignación rol → runtime canPerform. Sin backend."
        />

        <PrototypeShowcaseLayout
          ariaLabel="Flujo catálogo Captec"
          defaultTabId="parametrizacion"
          tabs={[
            {
              id: "parametrizacion",
              label: "Parametrización",
              description:
                "Tabla tipo PrimeNG: raíz con C (Plataforma, Card-Holder…); ojo abre hijas P y subcarpetas.",
              content: (
                <div className="space-y-8">
                  <CatalogValuesTablePrototype />
                  <ScreenCatalogTreePrototype />
                </div>
              ),
            },
            {
              id: "permisos",
              label: "Permisos granulares",
              description:
                "Rol ↔ catalog_id de pantalla + itemCode de acciones. Árbol filtrado por entidad.",
              content: <GranularPermissionsPrototype />,
            },
            {
              id: "runtime",
              label: "Runtime",
              description: "allowedScreenIds / allowedActionKeys y canPerform(screenKey, actionId).",
              content: <RuntimeAccessPrototype />,
            },
          ]}
        />
      </div>
    </PrototypeFrame>
  );
}
