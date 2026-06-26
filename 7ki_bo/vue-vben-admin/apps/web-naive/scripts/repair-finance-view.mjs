/**
 * Restore a finance Vue file from git and apply safe i18n (template + script).
 * Usage: node scripts/repair-finance-view.mjs WithdrawManagement.vue [RechargeManagement.vue ...]
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const financeDir = path.join(root, 'src/views/finance');
const localesDir = path.join(root, 'src/locales/langs');
const repoRoot = path.resolve(root, '../../..');
const gitPrefix = '7ki_bo/vue-vben-admin/apps/web-naive/src/views/finance';

const files = process.argv.slice(2);
if (!files.length) {
  console.error('Usage: node repair-finance-view.mjs <File.vue> [...]');
  process.exit(1);
}

const COMMON_MAP = {
  搜索: 'common.search',
  高级搜索: 'common.advancedSearch',
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
  导出: 'common.export',
  今天: 'common.today',
  本月: 'common.thisMonth',
};

const DOMAIN_LITERALS = new Set([
  '可输入任意金额',
  '仅限固定金额',
  '按比例',
  '固定金额',
  '未分类',
  '停用',
  '启用',
  'no',
  'add_audit',
  'deduct_balance',
]);

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
  zhFinance[key] = t.zh ?? zh;
  viFinance[key] = t.vi ?? zh;
  return { key };
}

function tExpr(zh) {
  const trimmed = zh.trim();
  if (DOMAIN_LITERALS.has(trimmed)) return `'${trimmed}'`;
  const { common, key } = getOrCreateKey(trimmed);
  return common ? `$t('${common}')` : `$t('finance.${key}')`;
}

function fixTemplateAttrs(template) {
  let t = template;
  t = t.replace(/<(n-[a-z-]+):(label|tab|title|description|placeholder)=/g, '<$1 :$2=');
  t = t.replace(/("[^"]*"):(tab|title)=/g, '$1 :$2=');
  t = t.replace(/(:column="[0-9]+"):(title)=/g, '$1 :$2=');
  return t;
}

function safeTemplateI18n(template) {
  let t = template;
  const attrs = ['placeholder', 'label', 'tab', 'title', 'description', 'positive-text', 'negative-text'];
  for (const attr of attrs) {
    const re = new RegExp(`(\\s${attr})="([^"]*[\u4e00-\u9fff][^"]*)"`, 'g');
    t = t.replace(re, (_, prefix, inner) => {
      if (inner.includes('{{') || inner.includes('$t(')) return `${prefix}="${inner}"`;
      return `${prefix}:${attr.trim()}="${tExpr(inner)}"`;
    });
    t = t.replace(new RegExp(`${attr}=\\$t\\(([^)]+)\\)`, 'g'), `:${attr}="$t($1)"`);
  }

  t = t.replace(/>([^<{}]*[\u4e00-\u9fff][^<{}]*)</g, (match, text) => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.includes('{{') || trimmed.includes('$t(')) return match;
    const mixed = trimmed.match(/^([\u4e00-\u9fff\s]+)(\{\{[^}]+\}\})([\u4e00-\u9fff\s]+)$/);
    if (mixed) {
      const [, pre, expr, post] = mixed;
      const preT = pre.trim() ? tExpr(pre.trim()) : '';
      const postT = post.trim() ? tExpr(post.trim()) : '';
      return `>{{ ${[preT, expr, postT].filter(Boolean).join(' + ')} }}<`;
    }
    if (/^[\u4e00-\u9fff\s，。、：；！？（）【】\-_/\\%]+$/.test(trimmed)) {
      return `>{{ ${tExpr(trimmed)} }}<`;
    }
    return match;
  });

  return fixTemplateAttrs(t);
}

function safeScriptI18n(script) {
  let s = script;
  if (!s.includes("from '@vben/locales'")) {
    s = s.replace(
      /<script setup lang="ts">\r?\n/,
      `<script setup lang="ts">\nimport { $t } from '@vben/locales';\n\n`,
    );
  }

  const safeAttrs = ['title', 'label', 'message', 'positiveText', 'negativeText', 'content'];
  for (const attr of safeAttrs) {
    s = s.replace(
      new RegExp(`(${attr}):\\s*'([^'\\n]*[\\u4e00-\\u9fff][^'\\n]*)'`, 'g'),
      (match, name, zh) => {
        if (DOMAIN_LITERALS.has(zh.trim())) return match;
        return `${name}: ${tExpr(zh)}`;
      },
    );
  }

  s = s.replace(
    /\{ default: \(\) => '([^'\n]*[\u4e00-\u9fff][^'\n]*)' \}/g,
    (match, zh) => {
      if (DOMAIN_LITERALS.has(zh.trim())) return match;
      return `{ default: () => ${tExpr(zh)} }`;
    },
  );

  s = s.replace(
    /message\.(success|error|warning|info)\(\s*'([^']*[\u4e00-\u9fff][^']*)'\s*\)/g,
    (match, type, zh) => `message.${type}(${tExpr(zh)})`,
  );

  s = s.replace(
    /dialog\.(warning|error|info|success)\(\{\s*title:\s*'([^']*[\u4e00-\u9fff][^']*)'/g,
    (match, type, zh) => `dialog.${type}({ title: ${tExpr(zh)}`,
  );

  return s;
}

function sanityCheck(content) {
  const issues = [];
  if (/\(\) =>\s*\}/.test(content)) issues.push('empty arrow functions');
  if (/\|\| ;/.test(content)) issues.push('empty || fallbacks');
  if (/\$t\('finance\.[a-zA-Z0-9]+\$t\(/.test(content)) issues.push('nested broken $t');
  if (/<n-[a-z-]+:(label|tab)/.test(content)) issues.push('merged tag attrs');
  if (/\$t\('finance\.[a-zA-Z0-9]+N[A-Z]/.test(content)) issues.push('garbage finance keys');
  if (/@[a-z]+="[^"]*\$t\('finance\./.test(content)) issues.push('corrupted event handlers');
  return issues;
}

for (const file of files) {
  const gitPath = `${gitPrefix}/${file}`;
  const filePath = path.join(financeDir, file);
  const gitContent = execSync(`git show "HEAD:${gitPath}"`, {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  const scriptStart = gitContent.indexOf('\n<script');
  if (scriptStart === -1) throw new Error(`No <script in ${file}`);
  let template = gitContent.slice(0, scriptStart).trimEnd();
  let scriptAndStyle = gitContent.slice(scriptStart + 1);

  template = safeTemplateI18n(template);
  scriptAndStyle = safeScriptI18n(scriptAndStyle);

  const repaired = `${template}\n\n${scriptAndStyle}`;
  fs.writeFileSync(filePath, repaired, 'utf8');

  const issues = sanityCheck(repaired);
  console.log(`Repaired ${file} (${repaired.split('\n').length} lines)`);
  if (issues.length) console.warn(`  Issues: ${issues.join(', ')}`);
  else console.log('  Sanity checks passed');
}

for (const [lang, data] of [
  ['en-US', enFinance],
  ['zh-CN', zhFinance],
  ['vi-VN', viFinance],
]) {
  fs.writeFileSync(
    path.join(localesDir, lang, 'finance.json'),
    `${JSON.stringify(data, null, 2)}\n`,
    'utf8',
  );
}
