import fs from 'node:fs';
import path from 'node:path';

const CH = /[\u4e00-\u9fff]/;
const EN_POLLUTION =
  /\b(Please|Select|Enter|Activity|Member|Order|Failed|Loading|Success|Export|Import|Search|Reset|Confirm|Cancel|Submit|Update|Create|Delete|Edit|Status|Amount|Reward|Task|Platform|Settings|Config|Manual|Automatic|System|Default|Preview|Upload|Download|Bulk|Total|Enable|Disable|Show|Hide|Add|Remove|Save|Back|Next|Refresh|Filter|Pending|Approved|Rejected|Processing|Complete|Minimum|Maximum|Recent|Single|Daily|Weekly|Monthly|Custom|Unknown|Error|Warning|feature|development|coming|soon|Stay|tuned|unavailable|requirements|description|statistics|management|distribution|acquisition|settlement|coupon|lottery|mystery|rebate|merchant|interest|treasure|withdrawal|deposit|recharge|wagering|promotion|operator|recipient|participants|progress|supported|content|rules|basic|info|category|subcategory|timeline|started|ended|duration|platforms|copied|draft|saved|gift|bonus|points|claim|methods|issued|data|list|icon|currency|source|upper|agent|detail|details|view|click|tier|balance|security|registration|login|transaction|history|ratio|risk|control|limit|optional|process|remark|auto|approval|payout|range|within|count|Current|Page|Basic|Max|No|Gift|Operator|User|Commission|Interest|Treasure|Merchant|Discount|backend|Mystery|box|free|spins|Upper|Type|Participation|Content|under|Simulated|giftamount|SVIPReward|VIPReward|ShowActivity|Ratio|Slot|Lottery|Esports|Arcade|Cockfight|Approve|Frozen|Suspended|Temporary|Terminal|Quantity|Exchange|Mark|Priority|Special|Test|Progress|Clear|Complete|Key|Received|Blockchain|Mobile|Cancelled|Confirmed|Expired|Credit|Card|Vault|optional|modify|copy|load|refresh|found|correct|later|already|rules|rule|level|levels|label|labels|records|record|compact|actions|action|meets|conditions|condition|desc|nter|upperlimit|lackname|argetype|Third|party|Payment|Check|Account|Simulated)\b/i;
const ALLOW = /^(VIP|SVIP|KYC|BRL|USD|iOS|Android|PC|PWA|H5|APP|TG|SMS|IP|ID|OK|API|URL|CSV|XLSX|XLS|PDF|PNG|JPEG|JPG|GIF|MB|px|T&C|ALL|RTP|backend|Esports|Arcade|Blockchain|Slot)$/i;

function get(o, k) {
  return k.split('.').reduce((a, c) => a?.[c], o);
}
function walkDir(d, a = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walkDir(f, a);
    else if (f.endsWith('.vue')) a.push(f);
  }
  return a;
}
function isBad(s) {
  if (!s || typeof s !== 'string') return false;
  if (CH.test(s)) return true;
  const stripped = s.replace(/\{[^}]+\}/g, ' ').replace(/\{\{[^}]+\}\}/g, ' ');
  return EN_POLLUTION.test(stripped);
}

const viF = JSON.parse(fs.readFileSync('src/locales/langs/vi-VN/finance.json', 'utf8'));
const viA = JSON.parse(fs.readFileSync('src/locales/langs/vi-VN/activity.json', 'utf8'));
const usedF = new Set();
const usedA = new Set();
for (const f of walkDir('src/views/finance')) {
  const s = fs.readFileSync(f, 'utf8');
  let m;
  const re = /\$t\(['"]finance\.([^'"]+)/g;
  while ((m = re.exec(s))) usedF.add(m[1]);
}
for (const f of [...walkDir('src/views/activity'), ...walkDir('src/views/user')]) {
  const s = fs.readFileSync(f, 'utf8');
  let m;
  const re = /\$t\(['"]activity\.([^'"]+)/g;
  while ((m = re.exec(s))) usedA.add(m[1]);
}

function report(name, used, root) {
  const bad = [];
  for (const k of used) {
    const v = get(root, k);
    if (typeof v === 'string' && isBad(v)) bad.push([k, v]);
  }
  console.log(`${name}: ${bad.length} bad / ${used.size} used`);
  bad.slice(0, 35).forEach(([k, v]) => console.log(`  ${k}: ${v.slice(0, 95)}`));
}
report('finance', usedF, viF);
report('activity', usedA, viA);
