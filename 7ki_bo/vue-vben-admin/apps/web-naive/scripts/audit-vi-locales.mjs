import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, '../src/locales/langs/vi-VN');
const CH = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/;
const EN_WORD = /\b(Please|Enter|Select|Activity|Reward|Task|Loading|Failed|Success|Export|Import|Search|Reset|All|Enable|Disable|Cancel|Confirm|Submit|Update|Create|Delete|Edit|Status|Type|Amount|Member|Order|Platform|Settings|Config|Manual|Auto|System|Default|Preview|Upload|Download|Bulk|Total|Online|Offline|Pending|Approved|Rejected|Withdraw|Deposit|Bonus|Lucky|Wheel|Promotion|Share|Weekly|Daily|Monthly|Custom|Unknown|Error|Warning|Info|Show|Hide|Open|Close|Add|Remove|Save|Back|Next|Previous|Refresh|Filter|Sort|Date|Time|Week|Month|Day|Hour|Minute|Second|Yes|No|True|False|None|Null|undefined|feature|under development|coming soon|Stay tuned|click|drag|template|Excel|CSV|Android|iOS|PC|H5|APP|PWA|TG|KYC|VIP|SVIP|BRL|USD|ID|IP|SMS|T&C|ALL|ON|OFF|OK|API|URL|HTTP|HTTPS|JSON|XML|PDF|PNG|JPEG|JPG|GIF|XLSX|XLS|MB|px|APP可|H5可|browser|checkbox|button|modal|toast|tooltip|placeholder|featureunder|taskfeature|mystery task)\b/i;
const EN_FRAGMENT = /[A-Za-z]{3,}/;

function flatten(o, p = '', m = {}) {
  for (const [k, v] of Object.entries(o || {})) {
    const x = p ? `${p}.${k}` : k;
    if (typeof v === 'string') m[x] = v;
    else if (v && typeof v === 'object') flatten(v, x, m);
  }
  return m;
}

function walkDir(d, a = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walkDir(f, a);
    else if (f.endsWith('.vue')) a.push(f);
  }
  return a;
}

const used = { finance: new Set(), activity: new Set() };
for (const f of walkDir(path.join(__dirname, '../src/views/finance'))) {
  const s = fs.readFileSync(f, 'utf8');
  let m;
  const re = /\$t\(['"]finance\.([^'"]+)/g;
  while ((m = re.exec(s))) used.finance.add(m[1]);
}
for (const f of [...walkDir(path.join(__dirname, '../src/views/activity')), ...walkDir(path.join(__dirname, '../src/views/user'))]) {
  const s = fs.readFileSync(f, 'utf8');
  let m;
  const re = /\$t\(['"]activity\.([^'"]+)/g;
  while ((m = re.exec(s))) used.activity.add(m[1]);
}

function auditFile(file, ns) {
  const flat = flatten(JSON.parse(fs.readFileSync(path.join(localesDir, file), 'utf8')));
  const usedKeys = used[ns] || new Set(Object.keys(flat));
  const issues = [];
  for (const [k, v] of Object.entries(flat)) {
    if (typeof v !== 'string' || !v.trim()) continue;
    const hasCh = CH.test(v);
    const hasEn = EN_FRAGMENT.test(v) && !/^[\d\s.,:;!?@#$%^&*()[\]{}_+\-=/\\|'"]+$/.test(v);
    if (!hasCh && !hasEn) continue;
    // Allow pure acronyms/brands in short strings
    const allowAcronym = /^(iOS|Android|PC|PWA|KYC|VIP|BRL|USD|TG|SMS|OK)$/i.test(v.trim());
    if (allowAcronym && !hasCh) continue;
    issues.push({ k, v, used: usedKeys.has(k), hasCh, hasEn });
  }
  return issues;
}

for (const [file, ns] of [['finance.json', 'finance'], ['activity.json', 'activity']]) {
  const issues = auditFile(file, ns);
  const usedIssues = issues.filter((i) => i.used);
  console.log(`\n=== ${file} ===`);
  console.log(`Total issues: ${issues.length}, USED in UI: ${usedIssues.length}`);
  usedIssues.slice(0, 60).forEach(({ k, v }) => console.log(`  ${k}: ${v.slice(0, 100)}`));
  if (usedIssues.length > 60) console.log(`  ... and ${usedIssues.length - 60} more`);
}
