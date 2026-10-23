import type { BrandPalette } from "@/entities/platform-brand";

/** Texto en UI: solo negro sobre claro y blanco (surface) sobre oscuro. */
const TEXT_ON_LIGHT = "#000000";

/** Aplica la paleta de 4 colores a variables CSS del design system. */
export function applyBrandPaletteToDocument(palette: BrandPalette) {
  const root = document.documentElement;
  const textOnDark = palette.surface;

  root.style.setProperty("--brand-light", palette.light);
  root.style.setProperty("--brand-mid", palette.mid);
  root.style.setProperty("--brand-accent", palette.accent);
  root.style.setProperty("--brand-surface", palette.surface);

  root.style.setProperty("--text-on-light", TEXT_ON_LIGHT);
  root.style.setProperty("--text-on-dark", textOnDark);

  root.style.setProperty("--background", palette.surface);
  root.style.setProperty("--foreground", TEXT_ON_LIGHT);
  root.style.setProperty("--card", palette.surface);
  root.style.setProperty("--card-foreground", TEXT_ON_LIGHT);
  root.style.setProperty("--popover", palette.surface);
  root.style.setProperty("--popover-foreground", TEXT_ON_LIGHT);

  root.style.setProperty("--muted-foreground", TEXT_ON_LIGHT);

  root.style.setProperty("--primary", palette.accent);
  root.style.setProperty("--primary-foreground", textOnDark);
  root.style.setProperty("--secondary", palette.light);
  root.style.setProperty("--secondary-foreground", TEXT_ON_LIGHT);
  root.style.setProperty("--muted", palette.light);
  root.style.setProperty("--accent", palette.accent);
  root.style.setProperty("--accent-foreground", textOnDark);

  root.style.setProperty("--border", palette.light);
  root.style.setProperty("--input", palette.light);
  root.style.setProperty("--ring", palette.accent);

  root.style.setProperty("--sidebar", palette.mid);
  root.style.setProperty("--sidebar-foreground", textOnDark);
  root.style.setProperty(
    "--sidebar-muted",
    `color-mix(in srgb, ${textOnDark} 72%, ${palette.mid})`,
  );
  root.style.setProperty("--sidebar-accent", palette.accent);
  root.style.setProperty("--sidebar-border", palette.light);
}
