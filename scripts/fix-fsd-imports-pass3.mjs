import fs from "node:fs";
import path from "node:path";

const root = path.join(import.meta.dirname, "..", "src");
const replacements = [
  ['from "../ports/organization-repository"', 'from "@/entities/organization/api/organization-repository"'],
  ['from "../ports/audit-log-repository"', 'from "@/entities/organization/api/audit-log-repository"'],
  ['from "../ports/transfer-reconciliation-repository"', 'from "@/entities/transfer-payment/api/transfer-reconciliation-repository"'],
  ['from "../ports/session-repository"', 'from "@/entities/session/api/session-repository"'],
  ['from "../hooks/use-session"', 'from "@/features/auth/model/use-session"'],
  ['from "../hooks/use-actor-email"', 'from "@/features/organization/model/use-actor-email"'],
  ['from "../hooks/use-operator-context"', 'from "@/features/operator-portal/model/use-operator-context"'],
  ['from "../model/report-filters"', 'from "@/entities/commercial-report/model/report-filters"'],
  ['from "../model/permissions"', 'from "@/entities/operator/model/permissions"'],
];

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, files);
    else if (/\.tsx?$/.test(name)) files.push(p);
  }
  return files;
}

let n = 0;
for (const file of walk(root)) {
  let content = fs.readFileSync(file, "utf8");
  let next = content;
  for (const [a, b] of replacements) next = next.split(a).join(b);
  if (next !== content) {
    fs.writeFileSync(file, next);
    n++;
  }
}
console.log(`Pass 3: ${n} files`);
