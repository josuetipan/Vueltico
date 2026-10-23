import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ThemeProvider } from "@/shared/lib/theme";
import { BrandPaletteProvider } from "@/features/platform-brand/ui/brand-palette-provider";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/shared/ui/tooltip";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <BrandPaletteProvider>
          <TooltipProvider delayDuration={300}>
            {children}
            <Toaster richColors closeButton position="top-right" />
          </TooltipProvider>
        </BrandPaletteProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
