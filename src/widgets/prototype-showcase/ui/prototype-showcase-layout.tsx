import { useState, type ReactNode } from "react";
import { SegmentTabs, type SegmentTabItem } from "@/shared/ui/layout/segment-tabs";

export type PrototypeShowcaseTab = {
  id: string;
  label: string;
  description?: string;
  content: ReactNode;
};

type PrototypeShowcaseLayoutProps = {
  ariaLabel: string;
  tabs: PrototypeShowcaseTab[];
  defaultTabId?: string;
};

/**
 * Un bloque visible a la vez en prototipos: evita apilar listados, formularios y workspaces.
 */
export function PrototypeShowcaseLayout({
  ariaLabel,
  tabs,
  defaultTabId,
}: PrototypeShowcaseLayoutProps) {
  const [tab, setTab] = useState(defaultTabId ?? tabs[0]?.id ?? "");
  const active = tabs.find((t) => t.id === tab) ?? tabs[0];

  if (!active) return null;

  const segmentItems: SegmentTabItem<string>[] = tabs.map((t) => ({
    id: t.id,
    label: t.label,
  }));

  return (
    <div className="space-y-4">
      <SegmentTabs
        items={segmentItems}
        value={active.id}
        onChange={setTab}
        ariaLabel={ariaLabel}
      />
      {active.description ? (
        <p className="text-sm font-normal text-foreground/80">{active.description}</p>
      ) : null}
      {active.content}
    </div>
  );
}
