import fs from "node:fs";
import path from "node:path";

const root = path.join(import.meta.dirname, "..", "src");

const replacements = [
  ["../../domain/organization-rules", "@/entities/organization/model/organization-rules"],
  ["../../domain/organization", "@/entities/organization/model/organization"],
  ["../../domain/audit", "@/entities/organization/model/audit"],
  ["../../domain/transfer-payment", "@/entities/transfer-payment/model/transfer-payment"],
  ["../../domain/receipt-policy", "@/entities/transfer-payment/model/receipt-policy"],
  ["../../domain/report-filters", "@/entities/commercial-report/model/report-filters"],
  ["../../domain/aggregations", "@/entities/commercial-report/model/aggregations"],
  ["../../domain/permissions", "@/entities/operator/model/permissions"],
  ["../../application/ports/commercial-reports-repository", "@/entities/commercial-report/api/commercial-reports-repository"],
  ["../../infrastructure/transfer-reconciliation-composition", "@/features/transfer-reconciliation/api/transfer-reconciliation-composition"],
  ["../../infrastructure/commercial-reports-composition", "@/features/commercial-report/api/commercial-reports-composition"],
  ["../../infrastructure/identity-composition", "@/features/auth/api/identity-composition"],
  ["../../infrastructure/mock-session-repository", "@/entities/session/api/mock-session-repository"],
  ["../../infrastructure/organizations-composition", "@/features/organization/api/organizations-composition"],
  ["from '../../domain/", "from '@/entities/"],
  ["from \"../../domain/", "from \"@/entities/"],
];

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, files);
    else if (/\.tsx?$/.test(name)) files.push(p);
  }
  return files;
}

// Fix generic ../../domain/X in entity api folders -> ../model/X
for (const file of walk(root)) {
  if (!file.includes(`${path.sep}entities${path.sep}`)) continue;
  let content = fs.readFileSync(file, "utf8");
  const next = content.replace(
    /from ["']\.\.\/\.\.\/domain\/([^"']+)["']/g,
    'from "@/entities/$1"',
  );
  // wrong - domain is not entity name. Manual per entity:
}

for (const file of walk(root)) {
  let content = fs.readFileSync(file, "utf8");
  let next = content;
  for (const [from, to] of replacements) {
    next = next.split(from).join(to);
  }
  // entity api: ../../domain/foo -> ../model/foo when under entities/*/api
  if (file.includes(`${path.sep}entities${path.sep}`) && file.includes(`${path.sep}api${path.sep}`)) {
    next = next.replace(/from ["']\.\.\/\.\.\/domain\/([^"']+)["']/g, 'from "../model/$1"');
  }
  if (file.includes(`${path.sep}entities${path.sep}`) && file.includes(`${path.sep}ui${path.sep}`)) {
    next = next.replace(/from ["']\.\.\/\.\.\/domain\/([^"']+)["']/g, 'from "../model/$1"');
  }
  if (next !== content) fs.writeFileSync(file, next);
}

console.log("Relative import fixes applied");
