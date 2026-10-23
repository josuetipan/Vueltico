import fs from "node:fs";
import path from "node:path";

const root = path.join(import.meta.dirname, "..", "src");

const globalReplacements = [
  ["from '../domain/", "from '../model/"],
  ['from "../domain/', 'from "../model/'],
  ["from '../application/ports/", "from './"],
  ['from "../application/ports/', 'from "./'],
  ["from '../application/use-cases/", "from '../model/"],
  ['from "../application/use-cases/', 'from "../model/'],
  ["from '../ports/organization-repository'", "from '@/entities/organization/api/organization-repository'"],
  ["from '../ports/audit-log-repository'", "from '@/entities/organization/api/audit-log-repository'"],
  ["from '../ports/transfer-reconciliation-repository'", "from '@/entities/transfer-payment/api/transfer-reconciliation-repository'"],
  ["from '../ports/session-repository'", "from '@/entities/session/api/session-repository'"],
  ["from './mock-organization-repository'", "from '@/entities/organization/api/mock-organization-repository'"],
  ["from './mock-audit-log-repository'", "from '@/entities/organization/api/mock-audit-log-repository'"],
  ["from './mock-transfer-reconciliation-repository'", "from '@/entities/transfer-payment/api/mock-transfer-reconciliation-repository'"],
  ["from '../hooks/use-actor-email'", "from '@/features/organization/model/use-actor-email'"],
  ["from './organization-status-badge'", "from '@/entities/organization/ui/organization-status-badge'"],
  ["from './transfer-status-badge'", "from '@/entities/transfer-payment/ui/transfer-status-badge'"],
  ["from './receipt-viewer'", "from '@/widgets/receipt-viewer'"],
  ["from './planned-screens'", "from '../planned-screens'"],
  ["from './app-sidebar'", "from '@/widgets/app-sidebar'"],
  ["from './app-topbar'", "from '@/widgets/app-topbar'"],
  ["from './app-shell'", "from '@/widgets/app-shell'"],
  ["from './breadcrumbs'", "from '@/shared/ui/layout/breadcrumbs'"],
  ["from \"./app-sidebar\"", "from \"@/widgets/app-sidebar\""],
  ["from \"./app-topbar\"", "from \"@/widgets/app-topbar\""],
  ["from \"./app-shell\"", "from \"@/widgets/app-shell\""],
  ["from \"./breadcrumbs\"", "from \"@/shared/ui/layout/breadcrumbs\""],
  ["from '../infrastructure/mock-session-repository'", "from '@/entities/session/api/mock-session-repository'"],
  ["from '../application/ports/commercial-reports-repository'", "from '@/entities/commercial-report/api/commercial-reports-repository'"],
  ["from '../application/ports/operator-portal-repository'", "from '@/entities/operator/api/operator-portal-repository'"],
];

function walk2(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk2(p, files);
    else if (/\.tsx?$/.test(name)) files.push(p);
  }
  return files;
}

let changed = 0;
for (const file of walk2(root)) {
  let content = fs.readFileSync(file, "utf8");
  let next = content;
  for (const [a, b] of globalReplacements) next = next.split(a).join(b);
  if (next !== content) {
    fs.writeFileSync(file, next);
    changed++;
  }
}
console.log(`Pass 2: ${changed} files updated`);
