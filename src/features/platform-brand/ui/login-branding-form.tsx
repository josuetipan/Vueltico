import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  DEFAULT_LOGIN_BRAND_ASSETS,
  LOGIN_BRAND_IMAGE_KEYS,
  LOGIN_BRAND_IMAGE_META,
  LOGIN_BRAND_PLACEMENT_LABELS,
  LOGIN_BRAND_PLACEMENTS,
  LOGIN_BRAND_SIZE_PRESETS,
  type LoginBrandImageKey,
  type LoginBrandImageSlot,
  type LoginBrandingConfig,
} from "@/entities/platform-brand/model/login-branding";
import { useBrandPaletteContext } from "./brand-palette-provider";
import { LoginBrandingPreview } from "./login-branding-preview";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { cn } from "@/shared/lib/utils";

const SIZE_LABELS: Record<(typeof LOGIN_BRAND_SIZE_PRESETS)[number], string> = {
  sm: "Pequeño",
  md: "Mediano",
  lg: "Grande",
  watermark: "Marca de agua",
};

export function LoginBrandingForm() {
  const { loginBranding, saveLoginBranding, resetLoginBranding } = useBrandPaletteContext();
  const [draft, setDraft] = useState<LoginBrandingConfig>(loginBranding);
  const [openKey, setOpenKey] = useState<LoginBrandImageKey>("background");
  const fileRefs = useRef<Partial<Record<LoginBrandImageKey, HTMLInputElement | null>>>({});

  useEffect(() => {
    setDraft(loginBranding);
  }, [loginBranding]);

  function patchSlot(key: LoginBrandImageKey, patch: Partial<LoginBrandImageSlot>) {
    setDraft((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...patch },
    }));
  }

  function onPickImage(key: LoginBrandImageKey, file: File | undefined) {
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

  function onClearImage(key: LoginBrandImageKey) {
    patchSlot(key, {
      src: DEFAULT_LOGIN_BRAND_ASSETS[key],
      ...(key === "logoCollaboration" ? { enabled: false } : {}),
    });
    const input = fileRefs.current[key];
    if (input) input.value = "";
  }

  function onSave() {
    saveLoginBranding(draft);
    toast.success("Branding de login guardado.");
  }

  function onReset() {
    const defaults = resetLoginBranding();
    setDraft(defaults);
    toast.message("Branding de login restablecido.");
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_min(100%,320px)] xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Imágenes del login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {LOGIN_BRAND_IMAGE_KEYS.map((key) => {
            const meta = LOGIN_BRAND_IMAGE_META[key];
            const slot = draft[key];
            const isBackground = key === "background";
            const isLogoCollaboration = key === "logoCollaboration";
            const isOpen = openKey === key;
            const placementOptions = isBackground
              ? (["cover"] as const)
              : LOGIN_BRAND_PLACEMENTS.filter((p) => p !== "cover");

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
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onClearImage(key)}
                      >
                        Default
                      </Button>
                    </div>

                    {isLogoCollaboration ? (
                      <p className="text-xs text-muted-foreground">
                        Se muestra junto al logo escrito; la ubicación la define el logo escrito.
                      </p>
                    ) : null}

                    {!isBackground && !isLogoCollaboration ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor={`placement-${key}`} className="text-xs">
                            Ubicación
                          </Label>
                          <select
                            id={`placement-${key}`}
                            value={slot.placement}
                            onChange={(e) =>
                              patchSlot(key, {
                                placement: e.target.value as LoginBrandImageSlot["placement"],
                              })
                            }
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                          >
                            {placementOptions.map((p) => (
                              <option key={p} value={p}>
                                {LOGIN_BRAND_PLACEMENT_LABELS[p]}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`size-${key}`} className="text-xs">
                            Tamaño
                          </Label>
                          <select
                            id={`size-${key}`}
                            value={slot.size}
                            onChange={(e) =>
                              patchSlot(key, {
                                size: e.target.value as LoginBrandImageSlot["size"],
                              })
                            }
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                          >
                            {LOGIN_BRAND_SIZE_PRESETS.map((s) => (
                              <option key={s} value={s}>
                                {SIZE_LABELS[s]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : null}

                    {!isBackground && isLogoCollaboration ? (
                      <div className="space-y-1.5">
                        <Label htmlFor={`size-${key}`} className="text-xs">
                          Tamaño
                        </Label>
                        <select
                          id={`size-${key}`}
                          value={slot.size}
                          onChange={(e) =>
                            patchSlot(key, {
                              size: e.target.value as LoginBrandImageSlot["size"],
                            })
                          }
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                          {LOGIN_BRAND_SIZE_PRESETS.map((s) => (
                            <option key={s} value={s}>
                              {SIZE_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : null}

                    <div className="space-y-1.5">
                      <Label htmlFor={`opacity-${key}`} className="text-xs">
                        Opacidad ({slot.opacity}%)
                      </Label>
                      <input
                        id={`opacity-${key}`}
                        type="range"
                        min={1}
                        max={100}
                        value={slot.opacity}
                        onChange={(e) => patchSlot(key, { opacity: Number(e.target.value) })}
                        className="h-2 w-full cursor-pointer accent-primary"
                      />
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
            <LoginBrandingPreview config={draft} />
          </CardContent>
        </Card>
        <div className="hidden flex-col gap-2 lg:flex">
          <Button type="button" onClick={onSave}>
            Guardar branding login
          </Button>
          <Button type="button" variant="outline" onClick={onReset}>
            Restablecer
          </Button>
        </div>
      </div>
    </div>
  );
}
