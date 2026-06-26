/**
 * Replace common hardcoded Chinese UI strings with $t('common.*') in Vue files.
 * Usage: node scripts/apply-common-i18n.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../src');

/** Replace common hardcoded Chinese UI strings with $t('common.*') in Vue files. */
const REPLACEMENTS = [
  ['请选择搜索条件', 'common.selectSearchCondition'],
  ['请选择搜索字段', 'common.searchField'],
  ['选择自定义时间范围', 'common.selectDateRange'],
  ['高级搜索', 'common.advancedSearch'],
  ['导出报表', 'common.exportReport'],
  ['创建时间', 'common.createTime'],
  ['订单状态', 'common.orderStatus'],
  ['会员账号', 'common.memberAccount'],
  ['操作失败', 'common.operationFailed'],
  ['操作成功', 'common.operationSuccess'],
  ['保存成功', 'common.saveSuccess'],
  ['删除成功', 'common.deleteSuccess'],
  ['复制成功', 'common.copySuccess'],
  ['加载中...', 'common.loading'],
  ['暂无数据', 'common.noData'],
  ['搜索值', 'common.searchValue'],
  ['批量操作', 'common.batchOperation'],
  ['操作时间', 'common.operationTime'],
  ['已选择', 'common.selected'],
  ['取消', 'common.cancel'],
  ['搜索', 'common.search'],
  ['重置', 'common.reset'],
  ['刷新', 'common.refresh'],
  ['确认', 'common.confirm'],
  ['删除', 'common.delete'],
  ['保存', 'common.save'],
  ['提交', 'common.submit'],
  ['关闭', 'common.close'],
  ['全选', 'common.selectAll'],
  ['请选择', 'common.pleaseSelect'],
  ['今天', 'common.today'],
  ['本周', 'common.thisWeek'],
  ['本月', 'common.thisMonth'],
  ['状态', 'common.status'],
  ['备注', 'common.remark'],
  ['操作', 'common.actions'],
  ['币种', 'common.currency'],
  ['启用', 'common.enable'],
  ['停用', 'common.disable'],
  ['会员', 'common.member'],
  ['全部', 'common.all'],
  ['操作人', 'common.operator'],
  ['订单号', 'common.orderNo'],
  ['修改', 'common.modify'],
  ['等级', 'common.level'],
  ['类型', 'common.type'],
  ['自定义', 'common.custom'],
  ['游戏', 'common.game'],
  ['上传', 'common.upload'],
  ['下载', 'common.download'],
  ['导入', 'common.import'],
  ['导出', 'common.export'],
  ['复制', 'common.copy'],
  ['详情', 'common.detail'],
  ['查看', 'common.view'],
  ['新增', 'common.create'],
  ['添加', 'common.add'],
  ['金额', 'common.amount'],
  ['时间', 'common.time'],
  ['名称', 'common.name'],
  ['合计', 'common.total'],
  ['失败', 'common.failed'],
].sort((a, b) => b[0].length - a[0].length);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') walk(full, files);
    else if (entry.name.endsWith('.vue')) files.push(full);
  }
  return files;
}

function ensureImport(content) {
  if (content.includes("$t('common.") || content.includes('$t("common.')) {
    if (!content.includes('@vben/locales') && !content.includes('#/locales')) {
      const scriptMatch = content.match(/<script[^>]*setup[^>]*>/);
      if (scriptMatch) {
        const insert = `\nimport { $t } from '@vben/locales';\n`;
        return content.replace(scriptMatch[0], scriptMatch[0] + insert);
      }
    }
  }
  return content;
}

function applyReplacements(content) {
  let result = content;
  for (const [zh, key] of REPLACEMENTS) {
    // Template text nodes: >搜索<
    result = result.replaceAll(`>${zh}<`, `>{{ $t('${key}') }}<`);
    result = result.replaceAll(`> ${zh} <`, `> {{ $t('${key}') }} <`);
    // Attributes: placeholder="搜索" tab="搜索" label="搜索"
    result = result.replaceAll(`placeholder="${zh}"`, `:placeholder="$t('${key}')"`);
    result = result.replaceAll(`tab="${zh}"`, `:tab="$t('${key}')"`);
    result = result.replaceAll(`label="${zh}"`, `:label="$t('${key}')"`);
    result = result.replaceAll(`title="${zh}"`, `:title="$t('${key}')"`);
    // n-button content with spaces
    result = result.replaceAll(`> ${zh}</`, `> {{ $t('${key}') }}</`);
  }
  return result;
}

let totalFiles = 0;
let changedFiles = 0;

for (const file of walk(root)) {
  totalFiles++;
  const original = fs.readFileSync(file, 'utf8');
  let updated = applyReplacements(original);
  updated = ensureImport(updated);
  if (updated !== original) {
    fs.writeFileSync(file, updated, 'utf8');
    changedFiles++;
  }
}

console.log(`Processed ${totalFiles} Vue files, updated ${changedFiles}`);
