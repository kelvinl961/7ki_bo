/**
 * Pass 2: replace remaining Chinese strings safely using finance-translations registry.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const financeDir = path.join(__dirname, '../src/views/finance');
const localesDir = path.join(__dirname, '../src/locales/langs');

const COMMON_MAP = {
  搜索: 'common.search', 重置: 'common.reset', 刷新: 'common.refresh',
  取消: 'common.cancel', 确认: 'common.confirm', 删除: 'common.delete',
  保存: 'common.save', 状态: 'common.status', 备注: 'common.remark',
  详情: 'common.detail', 修改: 'common.edit', 操作: 'common.actions',
  关闭: 'common.close', 启用: 'common.enable', 停用: 'common.disable',
  导出报表: 'common.exportReport', 全选: 'common.selectAll',
};

const translations = JSON.parse(fs.readFileSync(path.join(__dirname, 'finance-translations.json'), 'utf8'));
const enFinance = JSON.parse(fs.readFileSync(path.join(localesDir, 'en-US/finance.json'), 'utf8'));
const zhFinance = JSON.parse(fs.readFileSync(path.join(localesDir, 'zh-CN/finance.json'), 'utf8'));
const viFinance = JSON.parse(fs.readFileSync(path.join(localesDir, 'vi-VN/finance.json'), 'utf8'));

function toCamelCase(en) {
  const words = en.replace(/[^\w\s]/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return `k${Math.random().toString(36).slice(2, 8)}`;
  return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}

function resolve(zh) {
  if (COMMON_MAP[zh]) return { expr: `$t('${COMMON_MAP[zh]}')` };
  const hit = Object.entries(zhFinance).find(([, v]) => v === zh);
  if (hit) return { expr: `$t('finance.${hit[0]}')` };
  const t = translations[zh] || { en: zh, vi: zh };
  let key = toCamelCase(t.en);
  let n = 1;
  while (enFinance[key] && zhFinance[key] !== zh) key = `${toCamelCase(t.en)}${n++}`;
  enFinance[key] = t.en; zhFinance[key] = zh; viFinance[key] = t.vi;
  return { expr: `$t('finance.${key}')` };
}

function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function applyFile(content) {
  // Multiline element text: >\n  中文\n<
  content = content.replace(/>\s*([\u4e00-\u9fff][^\n<]{1,200}?)\s*</g, (m, zh) => {
    if (zh.includes('{{') || zh.includes('$t')) return m;
    const trimmed = zh.trim();
    if (!/^[\u4e00-\u9fff\s，。、：；！？（）【】\-_%/\\]+$/.test(trimmed)) return m;
    return `>{{ ${resolve(trimmed).expr} }}<`;
  });

  // Mixed: 共 {{ x }} 条统计记录
  content = content.replace(
    /([\u4e00-\u9fff]+)\s*(\{\{[^}]+\}\})\s*([\u4e00-\u9fff]+)/g,
    (_, pre, expr, post) => `${resolve(pre.trim()).expr} ${expr} ${resolve(post.trim()).expr}`,
  );

  // h() backtick literals: `未提现: ${x}` -> $t('key') + ': ' + x
  content = content.replace(/`([\u4e00-\u9fff][^`]*?\$\{[^}]+\}[^`]*)`/g, (m, inner) => {
    const colon = inner.match(/^([\u4e00-\u9fff：:]+)\s*\$\{([^}]+)\}(.*)$/);
    if (colon) {
      const label = colon[1].replace(/[：:]$/, '');
      const { expr } = resolve(label);
      const suffix = colon[3].trim();
      if (suffix) return `${expr} + '${suffix}: ' + ${colon[2]}`;
      return `${expr} + ': ' + ${colon[2]}`;
    }
    return m;
  });

  // Remaining quoted Chinese in script (not already $t)
  content = content.replace(/(['"])([^'"]*[\u4e00-\u9fff][^'"]*)\1/g, (m, q, inner, off) => {
    const before = content.slice(Math.max(0, off - 15), off);
    if (before.includes('$t(') || inner.includes('$t(')) return m;
    if (inner.includes('${')) return m;
    return resolve(inner).expr;
  });

  return content;
}

for (const f of fs.readdirSync(financeDir).filter(x => x.endsWith('.vue'))) {
  const fp = path.join(financeDir, f);
  fs.writeFileSync(fp, applyFile(fs.readFileSync(fp, 'utf8')), 'utf8');
  console.log('Pass2:', f);
}

for (const [lang, data] of [['en-US', enFinance], ['zh-CN', zhFinance], ['vi-VN', viFinance]]) {
  fs.writeFileSync(path.join(localesDir, lang, 'finance.json'), JSON.stringify(data, null, 2) + '\n');
}

let rem = 0;
for (const f of fs.readdirSync(financeDir).filter(x => x.endsWith('.vue'))) {
  const m = fs.readFileSync(path.join(financeDir, f), 'utf8').match(/[\u4e00-\u9fff]{2,}/g);
  rem += m ? m.length : 0;
}
console.log('Remaining:', rem);
