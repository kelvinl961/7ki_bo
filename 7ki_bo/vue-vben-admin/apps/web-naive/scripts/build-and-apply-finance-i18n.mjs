/**
 * Build finance locale files and apply i18n to all finance Vue views.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const financeDir = path.join(root, 'src/views/finance');
const localesDir = path.join(root, 'src/locales/langs');
const rawPath = path.join(__dirname, 'finance-strings-raw.json');

const COMMON_MAP = {
  取消: 'common.cancel', 搜索: 'common.search', 重置: 'common.reset', 刷新: 'common.refresh',
  确认: 'common.confirm', 删除: 'common.delete', 保存: 'common.save', 状态: 'common.status',
  备注: 'common.remark', 详情: 'common.detail', 修改: 'common.edit', 操作: 'common.actions',
  币种: 'common.currency', 订单号: 'common.orderNo', 会员账号: 'common.memberAccount',
  导出报表: 'common.exportReport', 批量操作: 'common.batchOperation', 全选: 'common.selectAll',
  今天: 'common.today', 本周: 'common.thisWeek', 本月: 'common.thisMonth', 自定义: 'common.custom',
  启用: 'common.enable', 停用: 'common.disable', 关闭: 'common.close', 金额: 'common.amount',
  成功: 'common.success', 失败: 'common.failed', '加载中...': 'common.loading', 暂无数据: 'common.noData',
  请选择: 'common.pleaseSelect', 请输入: 'common.pleaseEnter', 创建时间: 'common.createTime',
  高级搜索: 'common.advancedSearch', 操作人: 'common.operator', 操作时间: 'common.operationTime',
  类型: 'common.type', 全部: 'common.all', 查看: 'common.view', 提交: 'common.submit',
  添加: 'common.add', 导出: 'common.export', 下载: 'common.download', 上传: 'common.upload',
  复制: 'common.copy', 复制成功: 'common.copySuccess', 保存成功: 'common.saveSuccess',
  删除成功: 'common.deleteSuccess', 操作成功: 'common.operationSuccess', 操作失败: 'common.operationFailed',
  是: 'common.yes', 否: 'common.no', 已选择: 'common.selected', 合计: 'common.total',
  时间: 'common.time', 名称: 'common.name', 描述: 'common.description', 开始时间: 'common.startTime',
  结束时间: 'common.endTime', 日期范围: 'common.dateRange', 选择自定义时间范围: 'common.selectDateRange',
  订单状态: 'common.orderStatus', 请选择搜索条件: 'common.selectSearchCondition', 会员: 'common.member',
  等级: 'common.level', 平台: 'common.platform', 游戏: 'common.game', 创建: 'common.create',
  编辑: 'common.edit', 确定: 'common.confirm',
};

const EXT = JSON.parse(fs.readFileSync(path.join(__dirname, 'finance-translations.json'), 'utf8'));

function toCamelCase(en) {
  const words = en.replace(/[^\w\s]/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 'text';
  return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('').replace(/[^a-zA-Z0-9]/g, '');
}
function hashCode(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0; return Math.abs(h); }
function getTranslation(zh) { return EXT[zh] || { en: zh, vi: zh }; }

function buildKeyRegistry(strings) {
  const registry = {}; const usedKeys = new Set();
  for (const zh of strings) {
    if (COMMON_MAP[zh]) { registry[zh] = { commonKey: COMMON_MAP[zh], zh }; continue; }
    const { en, vi } = getTranslation(zh);
    let key = toCamelCase(en); if (!key || key.length < 2) key = `k${hashCode(zh)}`;
    let finalKey = key; let n = 1; while (usedKeys.has(finalKey)) finalKey = `${key}${n++}`;
    usedKeys.add(finalKey);
    registry[zh] = { key: finalKey, en, vi, zh };
  }
  return registry;
}

function tCall(entry) { return entry.commonKey ? `$t('${entry.commonKey}')` : `$t('finance.${entry.key}')`; }
function ensureImport(content) {
  if (content.includes("import { $t } from '@vben/locales'")) return content;
  const idx = content.indexOf('<script setup'); if (idx === -1) return content;
  const end = content.indexOf('>', idx);
  return content.slice(0, end + 1) + "\nimport { $t } from '@vben/locales';\n" + content.slice(end + 1);
}
function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function applyReplacements(content, registry) {
  const sorted = Object.keys(registry).sort((a, b) => b.length - a.length);
  const attrs = ['tab', 'label', 'placeholder', 'title', 'content', 'positive-text', 'negative-text'];

  for (const zh of sorted) {
    const t = tCall(registry[zh]);
    if (zh.includes('$t(')) continue;

    // 1. HTML attributes FIRST (before bare quotes)
    for (const attr of attrs) {
      content = content.replace(new RegExp(`${attr}="${esc(zh)}"`, 'g'), `:${attr}="${t}"`);
      content = content.replace(new RegExp(`${attr}='${esc(zh)}'`, 'g'), `:${attr}="${t}"`);
    }

    // 2. Script/template quoted strings (not inside already translated)
    for (const q of ["'", '"']) {
      content = content.replace(new RegExp(`${q}${esc(zh)}${q}`, 'g'), (match, offset) => {
        const before = content.slice(Math.max(0, offset - 30), offset);
        if (before.includes('$t(')) return match;
        return t;
      });
    }

    // 3. Button/text nodes on same line only
    content = content.replace(new RegExp(`>\\s*${esc(zh)}\\s*<`, 'g'), `>{{ ${t} }}<`);
  }
  return content;
}

const strings = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
const registry = buildKeyRegistry(strings);
const en = {}, zh = {}, vi = {};
for (const entry of Object.values(registry)) {
  if (entry.commonKey) continue;
  en[entry.key] = entry.en; zh[entry.key] = entry.zh; vi[entry.key] = entry.vi;
}

// Merge fix-broken keys if locale files exist
for (const extra of ['partialSuccess','rechargeWithdrawTimes','bulkForceRejectSuccess','bulkLockSuccess','bulkUnlockSuccess','autoExtractFromConfigAmount','currencyLabel','gamesCount']) {
  const extras = {
    partialSuccess: { en: 'Partial success: {ok}/{total} records', zh: '部分成功：{ok}/{total} 条', vi: 'Thành công một phần: {ok}/{total} bản ghi' },
    rechargeWithdrawTimes: { en: 'Deposit {recharge}/Withdraw {withdraw} times', zh: '充{recharge}/提{withdraw}次', vi: 'Nạp {recharge}/Rút {withdraw} lần' },
    bulkForceRejectSuccess: { en: 'Bulk force reject successful ({count} records)', zh: '批量强制拒绝成功 ({count} 条)', vi: 'Từ chối cưỡng bức hàng loạt thành công ({count} bản ghi)' },
    bulkLockSuccess: { en: 'Bulk lock successful ({count} records)', zh: '批量锁定成功 ({count} 条)', vi: 'Khóa hàng loạt thành công ({count} bản ghi)' },
    bulkUnlockSuccess: { en: 'Bulk unlock successful ({count} records)', zh: '批量解锁成功 ({count} 条)', vi: 'Mở khóa hàng loạt thành công ({count} bản ghi)' },
    autoExtractFromConfigAmount: { en: 'Auto-extract from configured amount', zh: '将从配置推荐金额自动提取', vi: 'Tự động trích từ số tiền cấu hình' },
    currencyLabel: { en: 'Currency:', zh: '币种:', vi: 'Loại tiền:' },
    gamesCount: { en: '{count} games', zh: '{count} 个游戏', vi: '{count} trò chơi' },
  };
  if (extras[extra]) { en[extra]=extras[extra].en; zh[extra]=extras[extra].zh; vi[extra]=extras[extra].vi; }
}

for (const [lang, data] of [['en-US', en], ['zh-CN', zh], ['vi-VN', vi]]) {
  fs.mkdirSync(path.join(localesDir, lang), { recursive: true });
  fs.writeFileSync(path.join(localesDir, lang, 'finance.json'), JSON.stringify(data, null, 2) + '\n');
  console.log(`Wrote ${lang}/finance.json (${Object.keys(data).length} keys)`);
}

for (const f of fs.readdirSync(financeDir).filter(x => x.endsWith('.vue'))) {
  const fp = path.join(financeDir, f);
  let c = applyReplacements(fs.readFileSync(fp, 'utf8'), registry);
  c = ensureImport(c);
  fs.writeFileSync(fp, c);
  console.log('Updated', f);
}

let rem = 0;
for (const f of fs.readdirSync(financeDir).filter(x => x.endsWith('.vue'))) {
  const m = fs.readFileSync(path.join(financeDir, f), 'utf8').match(/[\u4e00-\u9fff]{2,}/g);
  rem += m ? m.length : 0;
}
console.log('Remaining Chinese segments:', rem);
