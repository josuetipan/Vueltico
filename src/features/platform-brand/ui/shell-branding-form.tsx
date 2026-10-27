import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  DEFAULT_SHELL_BRAND_ASSETS,
  SHELL_BRAND_IMAGE_KEYS,
  SHELL_BRAND_IMAGE_META,
  type ShellBrandImageKey,
  type ShellBrandImageSlot,
  type ShellBrandingConfig,
} from "@/entities/platform-brand/model/shell-branding";
import { ShellBrandHeader } from "@/entities/platform-brand/ui/shell-brand-header";
import { useBrandPaletteContext } from "./brand-palette-provider";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";

export function ShellBrandingForm() {
  const { shellBranding, saveShellBranding, resetShellBranding, palette } =
    useBrandPaletteContext();
  const [draft, setDraft] = useState<ShellBrandingConfig>(shellBranding);
  const [openKey, setOpenKey] = useState<ShellBrandImageKey>("logoSymbol");
  const fileRefs = useRef<Partial<Record<ShellBrandImageKey, HTMLInputElement | null>>>({});

  useEffect(() => {
    setDraft(shellBranding);
  }, [shellBranding]);

  function patchSlot(key: ShellBrandImageKey, patch: Partial<ShellBrandImageSlot>) {
    setDraft((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...patch },
    }));
  }

  function onPickImage(key: ShellBrandImageKey, file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Seleccione un archivo de imagen.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") return;
      patchSlot(key, { src: result, enabled: true });
    };
    reader.readAsDataURL(file);
  }

  function onClearImage(key: ShellBrandImageKey) {
    patchSlot(key, {
      src: DEFAULT_SHELL_BRAND_ASSETS[key],
      ...(key === "logoCollaboration" ? { enabled: false } : {}),
    });
    const input = fileRefs.current[key];
    if (input) input.value = "";
  }

  function onSave() {
    saveShellBranding(draft);
    toast.success("Logos del menú guardados.");
  }

  function onReset() {
    const defaults = resetShellBranding();
    setDraft(defaults);
    toast.message("Logos del menú restablecidos.");
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_min(100%,320px)] xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Marca en menú lateral</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {SHELL_BRAND_IMAGE_KEYS.map((key) => {
            const meta = SHELL_BRAND_IMAGE_META[key];
            const slot = draft[key];
            const isOpen = openKey === key;

            return (
              <div key={key} className="overflow-hidden rounded-lg border border-border">
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                  aria-expanded={isOpen}
                  onClick={() => setOpenKey(key)}
                >
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-foreground/50 transition-transform",
                      isOpen && "rotate-180",
                    )}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 font-semibold text-foreground">{meta.label}</span>
                  <label
                    className="inline-flex shrink-0 items-center gap-1.5 text-xs font-normal"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={slot.enabled}
                      onChange={(e) => patchSlot(key, { enabled: e.target.checked })}
                      className="h-3.5 w-3.5 rounded border-input"
                    />
                    Visible
                  </label>
                </button>

                {isOpen ? (
                  <div className="space-y-3 border-t border-border px-4 py-4">
                    <p className="text-xs text-muted-foreground">{meta.hint}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        ref={(el) => {
                          fileRefs.current[key] = el;
                        }}
                        type="file"
                        accept="image/*"
                        className="max-w-full text-sm"
                        onChange={(e) => onPickImage(key, e.target.files?.[0])}
                      />
                      <Button type="button" variant="outline" size="sm" onClick={() => onClearImage(key)}>
                        Default
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}

          <div className="flex flex-wrap gap-2 pt-4 lg:hidden">
            <Button type="button" onClick={onSave}>
              Guardar
            </Button>
            <Button type="button" variant="outline" onClick={onReset}>
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
          <CardContent>
            <div
              className="overflow-hidden rounded-lg border border-sidebar-border"
              style={{ backgroundColor: palette.mid }}
            >
              <ShellBrandHeader config={draft} variant="preview" />
            </div>
          </CardContent>
        </Card>
        <div className="hidden flex-col gap-2 lg:flex">
          <Button type="button" onClick={onSave}>
            Guardar logos menú
          </Button>
          <Button type="button" variant="outline" onClick={onReset}>
            Restablecer
          </Button>
        </div>
      </div>
    </div>
  );
}
