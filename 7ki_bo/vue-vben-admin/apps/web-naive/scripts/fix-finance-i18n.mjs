/**
 * Fix broken i18n syntax and complete remaining replacements in finance views.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const financeDir = path.join(root, 'src/views/finance');
const localesDir = path.join(root, 'src/locales/langs');

const COMMON_MAP = {
  搜索: 'common.search',
  重置: 'common.reset',
  刷新: 'common.refresh',
  取消: 'common.cancel',
  确认: 'common.confirm',
  删除: 'common.delete',
  保存: 'common.save',
  状态: 'common.status',
  备注: 'common.remark',
  详情: 'common.detail',
  修改: 'common.edit',
  操作: 'common.actions',
  币种: 'common.currency',
  导出报表: 'common.exportReport',
  全选: 'common.selectAll',
  启用: 'common.enable',
  停用: 'common.disable',
  关闭: 'common.close',
  金额: 'common.amount',
  失败: 'common.failed',
  创建: 'common.create',
  删除: 'common.delete',
  备注: 'common.remark',
  锁定: 'common.disable',
};

const translations = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'finance-translations.json'), 'utf8'),
);
const enFinance = JSON.parse(
  fs.readFileSync(path.join(localesDir, 'en-US/finance.json'), 'utf8'),
);
const zhFinance = JSON.parse(
  fs.readFileSync(path.join(localesDir, 'zh-CN/finance.json'), 'utf8'),
);
const viFinance = JSON.parse(
  fs.readFileSync(path.join(localesDir, 'vi-VN/finance.json'), 'utf8'),
);

function toCamelCase(en) {
  const words = en.replace(/[^\w\s]/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return `k${Date.now()}`;
  return words
    .map((w, i) =>
      i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    )
    .join('');
}

function getOrCreateKey(zh) {
  if (COMMON_MAP[zh]) return { common: COMMON_MAP[zh] };
  const existing = Object.entries(zhFinance).find(([, v]) => v === zh);
  if (existing) return { key: existing[0] };
  const t = translations[zh] || { en: zh, vi: zh };
  let key = toCamelCase(t.en);
  let n = 1;
  while (enFinance[key] && zhFinance[key] !== zh) key = `${toCamelCase(t.en)}${n++}`;
  enFinance[key] = t.en;
  zhFinance[key] = zh;
  viFinance[key] = t.vi;
  return { key };
}

function tExpr(zh) {
  const { common, key } = getOrCreateKey(zh);
  return common ? `$t('${common}')` : `$t('finance.${key}')`;
}

function fixBrokenAttrs(content) {
  const attrs = ['label', 'placeholder', 'tab', 'title', 'content', 'positive-text', 'negative-text'];
  for (const attr of attrs) {
    // label=$t('x') -> :label="$t('x')"
    content = content.replace(
      new RegExp(`${attr}=\\$t\\(([^)]+)\\)`, 'g'),
      `:${attr}="$t($1)"`,
    );
    // label="{{ $t('x') }}" -> :label="$t('x')"
    content = content.replace(
      new RegExp(`${attr}="{{ \\$t\\(([^)]+)\\) }}"`, 'g'),
      `:${attr}="$t($1)"`,
    );
  }
  return content;
}

function fixTemplateText(content) {
  // Replace Chinese text between > and < (not inside {{ }})
  return content.replace(/>([^<{}]*[\u4e00-\u9fff][^<{}]*)</g, (match, text) => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.includes('{{') || trimmed.includes('$t(')) return match;

    // Mixed: 共 {{ x }} 条
    const mixed = trimmed.match(/^([\u4e00-\u9fff\s]+)(\{\{[^}]+\}\})([\u4e00-\u9fff\s]+)$/);
    if (mixed) {
      const [, pre, expr, post] = mixed;
      const preT = pre.trim() ? tExpr(pre.trim()) : '';
      const postT = post.trim() ? tExpr(post.trim()) : '';
      const parts = [preT, expr, postT].filter(Boolean);
      return `>{{ ${parts.join(' + ')} }}<`;
    }

    // Pure Chinese text
    if (/^[\u4e00-\u9fff\s，。、：；！？（）【】\-_/\\]+$/.test(trimmed)) {
      return `>{{ ${tExpr(trimmed)} }}<`;
    }
    return match;
  });
}

function fixTemplateLiterals(content) {
  // `未提现: ${x}` patterns in h() calls
  return content.replace(/`([^`]*[\u4e00-\u9fff][^`]*)`/g, (match, inner) => {
    if (!inner.includes('${')) {
      if (/[\u4e00-\u9fff]/.test(inner)) {
        return tExpr(inner);
      }
      return match;
    }
    // prefix: ${var} suffix
    const parts = inner.split(/(\$\{[^}]+\})/);
    const rebuilt = parts
      .map((p) => {
        if (p.startsWith('${')) return p;
        if (/[\u4e00-\u9fff]/.test(p)) {
          // split label: value patterns
          const colon = p.match(/^([\u4e00-\u9fff：:]+)(.*)$/);
          if (colon) {
            const label = colon[1].replace(/[：:]$/, '');
            return `' + ${tExpr(label)} + ': ' + `;
          }
          return `' + ${tExpr(p.trim())} + '`;
        }
        return p ? `'${p}'` : '';
      })
      .join('');
    return '`' + rebuilt.replace(/^\s*'\s*\+\s*/, '').replace(/\s*\+\s*'$/, '') + '`';
  });
}

function fixQuotedRemaining(content) {
  const re = /(['"])([^'"]*[\u4e00-\u9fff][^'"]*)\1/g;
  return content.replace(re, (match, q, inner, offset) => {
    const before = content.slice(Math.max(0, offset - 20), offset);
    if (before.includes('$t(') || inner.includes('$t(')) return match;
    if (inner.includes('${')) {
      // skip complex template literals - handle separately
      return match;
    }
    return tExpr(inner);
  });
}

// Save locale files
function saveLocales() {
  for (const [lang, data] of [
    ['en-US', enFinance],
    ['zh-CN', zhFinance],
    ['vi-VN', viFinance],
  ]) {
    fs.writeFileSync(
      path.join(localesDir, lang, 'finance.json'),
      JSON.stringify(data, null, 2) + '\n',
      'utf8',
    );
  }
}

const files = fs.readdirSync(financeDir).filter((f) => f.endsWith('.vue'));
for (const f of files) {
  const fp = path.join(financeDir, f);
  let content = fs.readFileSync(fp, 'utf8');
  content = fixBrokenAttrs(content);
  content = fixQuotedRemaining(content);
  content = fixTemplateText(content);
  fs.writeFileSync(fp, content, 'utf8');
  console.log('Fixed:', f);
}

saveLocales();

let remaining = 0;
for (const f of files) {
  const c = fs.readFileSync(path.join(financeDir, f), 'utf8');
  const m = c.match(/[\u4e00-\u9fff]{2,}/g);
  remaining += m ? m.length : 0;
}
console.log('Remaining Chinese segments:', remaining);
console.log('Finance keys:', Object.keys(enFinance).length);
