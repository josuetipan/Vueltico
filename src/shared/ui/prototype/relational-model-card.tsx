import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

type RelationalModelCardProps = {
  title: string;
  children: React.ReactNode;
};

export function RelationalModelCard({ title, children }: RelationalModelCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm font-normal">{children}</CardContent>
    </Card>
  );
}
