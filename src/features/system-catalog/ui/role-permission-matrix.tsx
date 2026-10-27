import { uiElementLabel, type ScreenAction } from "@/entities/system-catalog";
import { cn } from "@/shared/lib/utils";

export type PermissionTreeNode = {
  module: { id: string; name: string };
  screens: {
    id: string;
    name: string;
    screenKey: string;
    actions: ScreenAction[];
  }[];
};

type RolePermissionMatrixProps = {
  tree: PermissionTreeNode[];
  selectedKeys: Set<string>;
  onToggle: (permissionKey: string, checked: boolean) => void;
  onToggleScreen: (keys: string[], checked: boolean) => void;
  className?: string;
};

export function RolePermissionMatrix({
  tree,
  selectedKeys,
  onToggle,
  onToggleScreen,
  className,
}: RolePermissionMatrixProps) {
  return (
    <div className={cn("space-y-4 rounded-lg border border-border p-4", className)}>
      {tree.map(({ module, screens }) => (
        <div key={module.id} className="space-y-2">
          <p className="text-sm font-semibold">Módulo: {module.name}</p>
          {screens.length === 0 ? (
            <p className="pl-4 text-xs text-muted-foreground">Sin pantallas activas.</p>
          ) : (
            screens.map((screen) => {
              const keys = screen.actions.map((a) => a.permissionKey);
              const allChecked = keys.length > 0 && keys.every((k) => selectedKeys.has(k));
              const someChecked = keys.some((k) => selectedKeys.has(k));
              return (
                <div key={screen.id} className="space-y-1 border-l-2 border-border/60 pl-4">
                  <label className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-input"
                      checked={allChecked}
                      ref={(el) => {
                        if (el) el.indeterminate = !allChecked && someChecked;
                      }}
                      onChange={(e) => onToggleScreen(keys, e.target.checked)}
                    />
                    <span>
                      <span className="font-medium">Pantalla: {screen.name}</span>
                      <span className="ml-2 font-mono text-xs text-muted-foreground">
                        ({screen.screenKey})
                      </span>
                    </span>
                  </label>
                  <ul className="space-y-1 pl-6">
                    {screen.actions.map((action) => (
                      <li key={action.id}>
                        <label className="flex items-start gap-2 text-sm text-foreground/90">
                          <input
                            type="checkbox"
                            className="mt-0.5 h-4 w-4 rounded border-input"
                            checked={selectedKeys.has(action.permissionKey)}
                            onChange={(e) => onToggle(action.permissionKey, e.target.checked)}
                          />
                          <span>
                            {action.name}{" "}
                            <span className="font-mono text-xs text-muted-foreground">
                              ({action.permissionKey})
                            </span>
                            {action.uiElement ? (
                              <span className="block text-xs text-muted-foreground">
                                {uiElementLabel(action.uiElement)}
                              </span>
                            ) : null}
                          </span>
                        </label>
                      </li>
                    ))}
                    {screen.actions.length === 0 ? (
                      <li className="text-xs text-muted-foreground">Sin acciones registradas.</li>
                    ) : null}
                  </ul>
                </div>
              );
            })
          )}
        </div>
      ))}
    </div>
  );
}
