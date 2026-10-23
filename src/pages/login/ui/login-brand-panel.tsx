import { LoginBrandLayer } from "@/entities/platform-brand/ui/login-brand-layer";
import { useBrandPaletteContext } from "@/features/platform-brand/ui/brand-palette-provider";

export function LoginBrandPanel() {
  const { loginBranding } = useBrandPaletteContext();

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <LoginBrandLayer config={loginBranding} variant="login" />
    </div>
  );
}
