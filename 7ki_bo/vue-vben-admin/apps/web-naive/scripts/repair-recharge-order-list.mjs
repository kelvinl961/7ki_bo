/**
 * Restore RechargeOrderList.vue template from git and re-apply safe i18n only.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const filePath = path.join(root, 'src/views/finance/RechargeOrderList.vue');
const localesDir = path.join(root, 'src/locales/langs');
const gitPath = '7ki_bo/vue-vben-admin/apps/web-naive/src/views/finance/RechargeOrderList.vue';

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
    content = content.replace(
      new RegExp(`(<n-[a-z-]+)${attr}=\\$t\\(([^)]+)\\)`, 'g'),
      `$1 :${attr}="$t($2)"`,
    );
    content = content.replace(
      new RegExp(`${attr}=\\$t\\(([^)]+)\\)`, 'g'),
      `:${attr}="$t($1)"`,
    );
    content = content.replace(
      new RegExp(`${attr}="{{ \\$t\\(([^)]+)\\) }}"`, 'g'),
      `:${attr}="$t($1)"`,
    );
  }
  return content;
}

function fixTemplateText(content) {
  return content.replace(/>([^<{}]*[\u4e00-\u9fff][^<{}]*)</g, (match, text) => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.includes('{{') || trimmed.includes('$t(')) return match;

    const mixed = trimmed.match(/^([\u4e00-\u9fff\s]+)(\{\{[^}]+\}\})([\u4e00-\u9fff\s]+)$/);
    if (mixed) {
      const [, pre, expr, post] = mixed;
      const preT = pre.trim() ? tExpr(pre.trim()) : '';
      const postT = post.trim() ? tExpr(post.trim()) : '';
      const parts = [preT, expr, postT].filter(Boolean);
      return `>{{ ${parts.join(' + ')} }}<`;
    }

    if (/^[\u4e00-\u9fff\s，。、：；！？（）【】\-_/\\]+$/.test(trimmed)) {
      return `>{{ ${tExpr(trimmed)} }}<`;
    }
    return match;
  });
}

function fixSafeQuotedAttrs(content) {
  const attrs = ['placeholder', 'label', 'tab', 'title', 'description', 'positive-text', 'negative-text'];
  for (const attr of attrs) {
    const re = new RegExp(`(\\s${attr})="([^"]*[\u4e00-\u9fff][^"]*)"`, 'g');
    content = content.replace(re, (_, prefix, inner) => {
      if (inner.includes('{{') || inner.includes('$t(')) return `${prefix}="${inner}"`;
      return `${prefix}:${attr.trim()}="${tExpr(inner)}"`;
    });
  }
  return content;
}

const current = fs.readFileSync(filePath, 'utf8');
const scriptMatch = current.match(/<script[\s\S]*$/);
if (!scriptMatch) {
  console.error('Could not find script section in current file');
  process.exit(1);
}

const gitContent = execSync(`git show "HEAD:${gitPath}"`, {
  cwd: path.resolve(root, '../../..'),
  encoding: 'utf8',
});

let templateMatch = gitContent.match(/^<template>[\s\S]*\n<\/template>/m);
if (!templateMatch) {
  // Fallback: split before root <script
  const idx = gitContent.indexOf('\n<script');
  if (idx === -1) {
    console.error('Could not find template in git version');
    process.exit(1);
  }
  templateMatch = [gitContent.slice(0, idx).trimEnd()];
}

let template = templateMatch[0];
template = fixBrokenAttrs(template);
template = fixSafeQuotedAttrs(template);
template = fixTemplateText(template);

const repaired = `${template}\n\n${scriptMatch[0]}`.replace(/\n{3,}/g, '\n\n');
fs.writeFileSync(filePath, repaired, 'utf8');

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

console.log('Repaired RechargeOrderList.vue template from git + safe i18n');
