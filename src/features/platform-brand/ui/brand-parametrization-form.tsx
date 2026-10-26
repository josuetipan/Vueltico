import { useEffect, useState } from "react";

import { toast } from "sonner";

import {

  BRAND_COLOR_KEYS,

  BRAND_COLOR_META,

  isValidBrandHex,

  type BrandColorKey,

  type BrandPalette,

} from "@/entities/platform-brand";

import { useBrandPaletteContext } from "./brand-palette-provider";

import { Button } from "@/shared/ui/button";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

import { Input } from "@/shared/ui/input";

import { Label } from "@/shared/ui/label";

import { VuelticoLogo } from "@/shared/ui/brand/vueltico-logo";

import { LoginBrandingForm } from "./login-branding-form";
import { ShellBrandingForm } from "./shell-branding-form";

import { cn } from "@/shared/lib/utils";



type ParamTab = "colors" | "shell" | "login";



const TAB_LABELS: Record<ParamTab, string> = {

  colors: "Colores",

  shell: "Marca menú",

  login: "Branding login",

};



export function BrandParametrizationForm() {

  const { palette, savePalette, resetPalette } = useBrandPaletteContext();

  const [tab, setTab] = useState<ParamTab>("shell");

  const [draft, setDraft] = useState<BrandPalette>(palette);



  useEffect(() => {

    setDraft(palette);

  }, [palette]);



  function setColor(key: BrandColorKey, value: string) {

    setDraft((prev) => ({ ...prev, [key]: value }));

  }



  function onSaveColors() {

    for (const key of BRAND_COLOR_KEYS) {

      if (!isValidBrandHex(draft[key])) {

        toast.error(`Color inválido: ${BRAND_COLOR_META[key].label}`);

        return;

      }

    }

    savePalette(draft);

    toast.success("Paleta guardada.");

  }



  function onResetColors() {

    const defaults = resetPalette();

    setDraft(defaults);

    toast.message("Paleta restablecida.");

  }



  return (

    <div className="space-y-6">

      <div

        className="inline-flex rounded-lg border border-border bg-muted/30 p-1"

        role="tablist"

        aria-label="Secciones de parametrización"

      >

        {(Object.keys(TAB_LABELS) as ParamTab[]).map((key) => (

          <button

            key={key}

            type="button"

            role="tab"

            aria-selected={tab === key}

            className={cn(

              "rounded-md px-4 py-2 text-sm font-normal transition-colors",

              tab === key

                ? "bg-background text-foreground shadow-sm"

                : "text-foreground/70 hover:text-foreground",

            )}

            onClick={() => setTab(key)}

          >

            {TAB_LABELS[key]}

          </button>

        ))}

      </div>



      {tab === "colors" ? (

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_min(100%,320px)] xl:grid-cols-[minmax(0,1fr)_360px]">

          <Card>

            <CardHeader>

              <CardTitle>Colores del sistema</CardTitle>

              <CardDescription>Cuatro colores para fondos, bordes y acentos.</CardDescription>

            </CardHeader>

            <CardContent className="space-y-5">

              {BRAND_COLOR_KEYS.map((key) => (

                <div key={key} className="grid gap-2 sm:grid-cols-[auto_1fr] sm:items-center">

                  <div

                    className="h-12 w-12 shrink-0 rounded-md border shadow-inner"

                    style={{ backgroundColor: draft[key] }}

                    aria-hidden

                  />

                  <div className="space-y-1.5">

                    <Label htmlFor={`brand-${key}`}>{BRAND_COLOR_META[key].label}</Label>

                    <Input

                      id={`brand-${key}`}

                      value={draft[key]}

                      onChange={(e) => setColor(key, e.target.value)}

                      spellCheck={false}

                      className="font-mono uppercase"

                    />

                  </div>

                </div>

              ))}

              <div className="flex flex-wrap gap-2 pt-2 lg:hidden">

                <Button type="button" onClick={onSaveColors}>

                  Guardar

                </Button>

                <Button type="button" variant="outline" onClick={onResetColors}>

                  Restablecer

                </Button>

              </div>

            </CardContent>

          </Card>



          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">

            <Card>

              <CardHeader className="pb-3">

                <CardTitle className="text-base">Vista previa</CardTitle>

              </CardHeader>

              <CardContent className="space-y-4">

                <div

                  className="overflow-hidden rounded-lg border"

                  style={{ backgroundColor: draft.mid }}

                >

                  <div className="flex justify-center p-6">

                    <VuelticoLogo variant="symbol" className="max-h-24" />

                  </div>

                </div>

                <div

                  className="rounded-lg border p-4"

                  style={{ backgroundColor: draft.surface, borderColor: draft.light }}

                >

                  <VuelticoLogo variant="wordmark" className="mx-auto mb-4 max-h-12" />

                  <div

                    className="rounded-md px-3 py-2 text-center text-sm font-medium"

                    style={{ backgroundColor: draft.accent, color: draft.surface }}

                  >

                    Botón primario

                  </div>

                </div>

              </CardContent>

            </Card>

            <div className="hidden flex-col gap-2 lg:flex">

              <Button type="button" onClick={onSaveColors}>

                Guardar colores

              </Button>

              <Button type="button" variant="outline" onClick={onResetColors}>

                Restablecer

              </Button>

            </div>

          </div>

        </div>

      ) : tab === "shell" ? (

        <ShellBrandingForm />

      ) : (

        <LoginBrandingForm />

      )}

    </div>

  );

}


