import { RelationalModelCard } from "@/shared/ui/prototype/relational-model-card";

export function OrganizationTenantModelOverview() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <RelationalModelCard title="Tabla companies">
        <p className="font-mono text-xs leading-relaxed">
          id · legal_name · trade_name · tax_id (único)
          <br />
          phone · email · country_id / country · city_id / city · address
          <br />
          plan_id (FK) · subscription_status · created_at
        </p>
      </RelationalModelCard>
      <RelationalModelCard title="Tablas relacionadas">
        <p>
          <span className="font-semibold">plans</span> — límites por plan; la empresa no los
          duplica.
        </p>
        <p>
          <span className="font-semibold">company_users</span> — usuarios y roles por tenant.
        </p>
      </RelationalModelCard>
    </div>
  );
}
