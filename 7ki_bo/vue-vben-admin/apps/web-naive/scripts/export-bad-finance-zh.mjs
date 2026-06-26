import fs from 'node:fs';
import path from 'node:path';

const CH = /[\u4e00-\u9fff]/;
const EN_POLLUTION =
  /\b(Please|Select|Enter|Activity|Member|Order|Failed|Loading|Success|Export|Import|Search|Reset|Confirm|Cancel|Submit|Update|Create|Delete|Edit|Status|Amount|Reward|Task|Platform|Settings|Config|Manual|Automatic|System|Default|Preview|Upload|Download|Bulk|Total|Enable|Disable|Show|Hide|Add|Remove|Save|Back|Next|Refresh|Filter|Pending|Approved|Rejected|Processing|Complete|Minimum|Maximum|Recent|Single|Daily|Weekly|Monthly|Custom|Unknown|Error|Warning|feature|development|coming|soon|Stay|tuned|unavailable|requirements|description|statistics|management|distribution|acquisition|settlement|coupon|lottery|mystery|rebate|merchant|interest|treasure|withdrawal|deposit|recharge|wagering|promotion|operator|recipient|participants|progress|supported|content|rules|basic|info|category|subcategory|timeline|started|ended|duration|platforms|copied|draft|saved|gift|bonus|points|claim|methods|issued|data|list|icon|currency|source|upper|agent|detail|details|view|click|tier|balance|security|registration|login|transaction|history|ratio|risk|control|limit|optional|process|remark|auto|approval|payout|range|within|count|Current|Page|Basic|Max|No|Gift|Operator|User|Commission|Interest|Treasure|Merchant|Discount|backend|Mystery|box|free|spins|Upper|Type|Participation|Content|under|Simulated|giftamount|SVIPReward|VIPReward|ShowActivity|Ratio|Slot|Lottery|Esports|Arcade|Cockfight|Approve|Frozen|Suspended|Temporary|Terminal|Quantity|Exchange|Mark|Priority|Special|Test|Progress|Clear|Complete|Key|Received|Blockchain|Mobile|Cancelled|Confirmed|Expired|Credit|Card|Vault|optional|modify|copy|load|refresh|found|correct|later|already|rules|rule|level|levels|label|labels|records|record|compact|actions|action|meets|conditions|condition|desc|nter|upperlimit|lackname|argetype|Third|party|Payment|Check|Account|Simulated|Estimated|expense|veteran|frequent|small|Digital|Wallet|transfer|Cumulative|match|Payee|calculate)\b/i;

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

const viF = JSON.parse(fs.readFileSync('src/locales/langs/vi-VN/finance.json', 'utf8'));
const zhF = JSON.parse(fs.readFileSync('src/locales/langs/zh-CN/finance.json', 'utf8'));
const usedF = new Set();
for (const f of walkDir('src/views/finance')) {
  const s = fs.readFileSync(f, 'utf8');
  let m;
  const re = /\$t\(['"]finance\.([^'"]+)/g;
  while ((m = re.exec(s))) usedF.add(m[1]);
}

const missing = [];
for (const k of usedF) {
  const v = get(viF, k);
  const z = get(zhF, k);
  if (typeof v === 'string' && (CH.test(v) || EN_POLLUTION.test(v))) {
    missing.push({ k, zh: z, vi: v });
  }
}
console.log('finance used bad:', missing.length);
missing.slice(0, 50).forEach(({ k, zh, vi }) => console.log(k, '|', zh, '|', vi?.slice(0, 60)));
