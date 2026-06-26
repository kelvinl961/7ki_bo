/**
 * Safe pass 2: line-by-line replacements without cross-tag matching.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const financeDir = path.join(__dirname, '../src/views/finance');
const localesDir = path.join(__dirname, '../src/locales/langs');

const COMMON = {
  搜索: 'common.search', 重置: 'common.reset', 刷新: 'common.refresh', 取消: 'common.cancel',
  确认: 'common.confirm', 删除: 'common.delete', 保存: 'common.save', 关闭: 'common.close',
  详情: 'common.detail', 修改: 'common.edit', 今天: 'common.today', 本月: 'common.thisMonth',
  导出报表: 'common.exportReport', 全选: 'common.selectAll', 备注: 'common.remark',
  操作人: 'common.operator', 会员账号: 'common.memberAccount', 订单号: 'common.orderNo',
  金额: 'common.amount', 状态: 'common.status', 高级搜索: 'common.advancedSearch',
};

const translations = JSON.parse(fs.readFileSync(path.join(__dirname, 'finance-translations.json'), 'utf8'));
const enMap = JSON.parse(fs.readFileSync(path.join(localesDir, 'en-US/finance.json'), 'utf8'));
const zhMap = JSON.parse(fs.readFileSync(path.join(localesDir, 'zh-CN/finance.json'), 'utf8'));
const viMap = JSON.parse(fs.readFileSync(path.join(localesDir, 'vi-VN/finance.json'), 'utf8'));

function toKey(en) {
  const w = en.replace(/[^\w\s]/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (!w.length) return 'k' + Math.random().toString(36).slice(2, 7);
  return w.map((x, i) => (i ? x[0].toUpperCase() + x.slice(1).toLowerCase() : x.toLowerCase())).join('');
}

function tExpr(zhText) {
  if (COMMON[zhText]) return `$t('${COMMON[zhText]}')`;
  let key = Object.entries(zhMap).find(([, v]) => v === zhText)?.[0];
  if (!key) {
    const tr = translations[zhText] || { en: zhText, vi: zhText };
    key = toKey(tr.en);
    let n = 1;
    const base = key;
    while (enMap[key] && zhMap[key] !== zhText) key = base + n++;
    enMap[key] = tr.en;
    zhMap[key] = zhText;
    viMap[key] = tr.vi;
  }
  return `$t('finance.${key}')`;
}

function processLine(line) {
  if (!/[\u4e00-\u9fff]/.test(line)) return line;
  const trimmed = line.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.includes('<!--')) return line;

  let out = line;

  out = out.replace(/(<n-radio[^>]*>)([^<]*[\u4e00-\u9fff][^<]*)(<\/n-radio>)/g, (_, a, txt, b) => {
    return `${a}{{ ${tExpr(txt.trim())} }}${b}`;
  });

  out = out.replace(/<strong>([^<]*[\u4e00-\u9fff][^<]*)<\/strong>/g, (_, txt) => {
    const raw = txt.trim();
    const hasColon = /[：:]$/.test(raw);
    const label = raw.replace(/[：:]$/, '');
    return `<strong>{{ ${tExpr(label)} }}${hasColon ? ':' : ''}</strong>`;
  });

  out = out.replace(/<span([^>]*)>([^<]*[\u4e00-\u9fff][^<]*)<\/span>/g, (_, attrs, txt) => {
    const raw = txt.trim();
    const hasColon = /[：:]$/.test(raw);
    const label = raw.replace(/[：:]$/, '');
    if (!/^[\u4e00-\u9fff\s]+$/.test(label)) return `<span${attrs}>${txt}</span>`;
    return `<span${attrs}>{{ ${tExpr(label)} }}${hasColon ? ':' : ''}</span>`;
  });

  out = out.replace(/>([^<{]*[\u4e00-\u9fff][^<{]*)</g, (_, txt) => {
    const raw = txt.trim();
    if (!raw || raw.includes('{{') || raw.includes('$t(')) return `>${txt}<`;
    if (/^[\u4e00-\u9fff\s，。、：；！？（）【】\-_%/\\:.!?]+$/.test(raw)) {
      return `>{{ ${tExpr(raw)} }}<`;
    }
    return `>${txt}<`;
  });

  out = out.replace(/message\.(success|error|warning|info)\(`([^`]*[\u4e00-\u9fff][^`]*)`\)/g, (_, type, inner) => {
    if (inner.includes('${')) return `message.${type}(\`${inner}\`)`;
    return `message.${type}(${tExpr(inner)})`;
  });

  return out;
}

for (const f of fs.readdirSync(financeDir).filter((x) => x.endsWith('.vue'))) {
  const fp = path.join(financeDir, f);
  const lines = fs.readFileSync(fp, 'utf8').split('\n');
  fs.writeFileSync(fp, lines.map(processLine).join('\n'));
  console.log('Safe pass2:', f);
}

for (const [lang, data] of [
  ['en-US', enMap],
  ['zh-CN', zhMap],
  ['vi-VN', viMap],
]) {
  fs.writeFileSync(path.join(localesDir, lang, 'finance.json'), JSON.stringify(data, null, 2) + '\n');
}
