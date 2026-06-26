/**
 * Rebuild en-US/finance.json from zh-CN using full-phrase translations only.
 * Fixes corrupted Chinglish like "Auditxcount", "列Config", "预count到账".
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, '../src/locales/langs');
const packagesLocalesDir = path.resolve(__dirname, '../../../packages/locales/src/langs');

const CHINESE_RE = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/;
const GARBAGE_KEY_RE = /NButton|DivClass|Template|VModel|NForm|NCard|NModal|Const[A-Z]/;
const CORRUPT_EN_RE =
  /xcount|列Config|解除settings|精准Member|模糊Member|预count|到count|占ratio|userscount|RechargeTotal|notAutoRefresh|Actions教程|Auditxcount|giftRatio|largetype|DepositType|Rechargelarge|submittimescount|Wageringtask|Auto解除|smallcount|as准|Member tierand/i;

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function writeJson(p, data) {
  fs.writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function hasChinese(s) {
  return typeof s === 'string' && CHINESE_RE.test(s);
}

function isCorruptEn(en) {
  if (!en || typeof en !== 'string') return true;
  if (hasChinese(en)) return true;
  if (CORRUPT_EN_RE.test(en)) return true;
  if (GARBAGE_KEY_RE.test(en)) return true;
  if (en.length > 200) return true;
  return false;
}

function buildCommonZhToEn() {
  const zh = readJson(path.join(packagesLocalesDir, 'zh-CN/common.json'));
  const en = readJson(path.join(packagesLocalesDir, 'en-US/common.json'));
  const map = {};
  const walk = (z, e) => {
    for (const k of Object.keys(z)) {
      if (typeof z[k] === 'object' && z[k]) walk(z[k], e[k] || {});
      else if (typeof z[k] === 'string' && typeof e[k] === 'string') map[z[k]] = e[k];
    }
  };
  walk(zh, en);
  return map;
}

const financeTranslations = readJson(path.join(__dirname, 'finance-translations.json'));
const supplement = fs.existsSync(path.join(__dirname, 'zh-en-supplement.json'))
  ? readJson(path.join(__dirname, 'zh-en-supplement.json'))
  : {};
const commonMap = buildCommonZhToEn();

/** Authoritative English by locale key (screenshot-critical + column headers) */
const KEY_EN = {
  columnConfig: 'Column Settings',
  kvmbt1: 'Total Deposits',
  kx5rr1: 'Confirmed Deposits',
  kpou7e: 'Failed Deposits',
  kezim9: 'Manual Refresh',
  k9szah: 'User Guide',
  kex5pu: 'This Week',
  kv58uj: 'Custom',
  k6efv0: 'Refresh',
  memberAccount: 'Exact Member Account',
  memberAccount1: 'Fuzzy Member Account',
  memberAccount2: 'Member Account',
  recharge8: 'Deposit Users',
  audit1: 'Audit Multiplier',
  trigger: 'Trigger Mode',
  autoSettings: 'Auto Release Settings',
  auto2: 'Auto Release Amount',
  estimatedFeeActualReceived: 'Est. Arrival (Fee) (Actual Received)',
  countCumulativeIP: 'Dep/Wd Count (Cumulative Diff) (Duplicate IP Users)',
  khnitl: 'All Risk Control',
  kfbdnf: 'My Risk Control',
  ktvmq5: 'Deposit Trend Chart',
  kzfycy: 'Payment Method Statistics',
  k46b0q: 'Deposit Ranking',
  kdiqtu: 'Deposit Count Share',
  recharge4: 'Deposit Trend',
  keh8ey: 'Deposit Records',
  k2tg5p: 'Finance Management',
  wageringTaskAudit: 'Wagering Audit',
  memberIdMemberAccountVIPTier: 'Member ID / Account (VIP / Tier)',
  applicationTimeActionsTimeCompletionDuration: 'Apply Time (Op Time) (Duration)',
  memberCurrencyRatio: 'Member Currency (Ratio)',
  withdrawalAmountBalance: 'Withdrawal Amount (Current Balance)',
  receivingMethodPayeeInfo: 'Receiving Method (Payee Info)',
  assignToMe: 'Assign to Me',
  selectAllCurrentPage: 'Select Current Page',
  selectedOfTotal: 'Selected {selected}, total {total}',
  selectedRecords: 'Selected {count} records',
  totalRecordsCompact: 'Total {count} records',
  bulkOperationWithCount: 'Bulk Actions ({count})',
  recharge5: 'Deposit Type',
  recharge6: 'Deposit Category',
  recharge7: 'Deposit Channel',
  rechargeStatistics: 'Deposit Statistics',
  allRecharges: 'All Deposits',
  rechargeSuccessAmount: 'Successful Deposit Amount',
  rechargeTotalOrders: 'Total Deposit Orders',
  rechargeSuccessRate: 'Deposit Success Rate',
  rechargeFailed: 'Deposit Failed',
  config1: 'Category Settings',
  text74: 'Category Icon',
  ratio1: 'Bonus Ratio',
  count1: 'Total Count',
  count2: 'Deposit/Withdrawal Count',
  count3: 'Bonus Limit Count',
  text118: 'Reduction Percentage',
  text91: 'Required Multiplier',
  text28: 'Remaining',
  amount4: 'Source Amount',
  auditAmount1: 'Audit Amount',
  alreadyComplete: 'Completed',
  sourceDescription: 'Source Description',
  only1: 'Eligible Games Only',
  paymentMethodDistribution: 'Payment Method Distribution',
  rechargeTrendImage: 'Deposit Trend Chart',
  paymentMethodDetailedStatistics: 'Payment Method Detailed Statistics',
  k4xkdu: 'Receiving Account/Address',
  k6akpt: 'First Deposit',
  vIPLevel: 'VIP Level',
  riskControlReview: 'Risk Control Review',
  riskControl: 'Risk Control',
  financePayout: 'Finance Payout',
  payout: 'Payout',
  rePayout: 'Re-Payout',
  autoApprovedWithdrawal: 'Auto-Approved Withdrawal',
  allWithdrawal: 'All Withdrawals',
  withdrawalSettings: 'Withdrawal Settings',
  paymentStatistics: 'Payment Statistics',
  thirdPartyPayout: 'Third-Party Payout',
  pageTotalSummary: 'Page Total: Source: {source} | Audit: {audit} | Completed: {completed} | Remaining: {remaining}',
};

/** Fix known bad finance-translations.json entries */
const PHRASE_EN = {
  稽核倍数: 'Audit Multiplier',
  触发模式: 'Trigger Mode',
  精准会员账号: 'Exact Member Account',
  模糊会员账号: 'Fuzzy Member Account',
  列配置: 'Column Settings',
  充值总计: 'Total Deposits',
  充值人数: 'Deposit Users',
  自动解除设置: 'Auto Release Settings',
  预计到帐: 'Estimated Arrival',
  预计到帐: 'Estimated Arrival',
  '预计到帐 (手续费) (实际到账)': 'Est. Arrival (Fee) (Actual Received)',
  '充 / 提次数 (累计充 / 提差额) (重复IP人数)':
    'Dep/Wd Count (Cumulative Diff) (Duplicate IP Users)',
  全部风控: 'All Risk Control',
  本周: 'This Week',
  充值趋势图: 'Deposit Trend Chart',
  支付方式详细统计: 'Payment Method Detailed Statistics',
  充值排行榜: 'Deposit Ranking',
  充值次数占比: 'Deposit Count Share',
  不自动刷新: 'Manual Refresh',
  操作教程: 'User Guide',
  充值记录: 'Deposit Records',
  分配给我: 'Assign to Me',
  全选当前页: 'Select Current Page',
  会员ID: 'Member ID',
  批量操作: 'Bulk Actions',
  已选择: 'Selected',
  条数据: 'records',
  共: 'Total',
  条: 'records',
  条记录: 'records',
  页面合计: 'Page Total',
  源金额: 'Source Amount',
  稽核金额: 'Audit Amount',
  已完成: 'Completed',
  剩余: 'Remaining',
  来源描述: 'Source Description',
  触发模式: 'Trigger Mode',
  投注任务: 'Wagering Task',
  '投注任务(稽核)': 'Wagering Audit',
  财务管理: 'Finance Management',
  风控审核: 'Risk Control Review',
  提现申请风险控制审核: 'Withdrawal risk control review',
  紧凑显示: 'Compact View',
  充值类型: 'Deposit Type',
  充值大类: 'Deposit Category',
  充值通道: 'Deposit Channel',
  充值成功金额: 'Successful Deposit Amount',
  充值总订单: 'Total Deposit Orders',
  充值成功率: 'Deposit Success Rate',
  充值失败: 'Deposit Failed',
  支付方式分布: 'Payment Method Distribution',
  启用: 'Enable',
  停用: 'Disable',
};

function translatePhrase(zh) {
  if (!zh || typeof zh !== 'string') return null;
  if (KEY_EN[zh]) return KEY_EN[zh]; // unlikely
  if (commonMap[zh]) return commonMap[zh];
  if (PHRASE_EN[zh]) return PHRASE_EN[zh];
  if (supplement[zh] && !hasChinese(supplement[zh])) return supplement[zh];

  const ft = financeTranslations[zh];
  if (ft?.en && !isCorruptEn(ft.en)) return ft.en;

  return null;
}

function humanizeKey(key) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^[kK]\d+[a-z0-9]+$/i, key)
    .replace(/^k/i, '')
    .trim() || key;
}

const zh = readJson(path.join(localesDir, 'zh-CN/finance.json'));
const en = readJson(path.join(localesDir, 'en-US/finance.json'));
let fixed = 0;
let skippedGarbage = 0;

for (const key of Object.keys(zh)) {
  const zhVal = zh[key];
  if (typeof zhVal !== 'string') continue;

  if (GARBAGE_KEY_RE.test(key) || zhVal.includes('<') || zhVal.length > 150) {
    skippedGarbage++;
    continue;
  }

  let newEn = KEY_EN[key];
  if (!newEn) newEn = translatePhrase(zhVal);

  if (!newEn || isCorruptEn(newEn)) {
    // keep existing en if it's clean
    if (typeof en[key] === 'string' && !isCorruptEn(en[key])) continue;
    newEn = translatePhrase(zhVal.replace(/\{[^}]+\}/g, '').trim()) || en[key];
  }

  if (!newEn || isCorruptEn(newEn)) {
    if (hasChinese(zhVal) && !GARBAGE_KEY_RE.test(key)) {
      newEn = humanizeKey(key);
    } else {
      continue;
    }
  }

  if (en[key] !== newEn) {
    en[key] = newEn;
    fixed++;
  }
}

writeJson(path.join(localesDir, 'en-US/finance.json'), en);

// Fix finance-translations.json corrupted .en
let ftFixed = 0;
for (const [zh, entry] of Object.entries(financeTranslations)) {
  if (!entry?.en || !isCorruptEn(entry.en)) continue;
  const better = translatePhrase(zh);
  if (better && !isCorruptEn(better)) {
    entry.en = better;
    ftFixed++;
  }
}
writeJson(path.join(__dirname, 'finance-translations.json'), financeTranslations);

const remaining = Object.values(en).filter((v) => typeof v === 'string' && hasChinese(v)).length;
const corrupt = Object.values(en).filter((v) => typeof v === 'string' && isCorruptEn(v)).length;
console.log(`Rebuilt en-US finance.json: ${fixed} keys updated`);
console.log(`finance-translations.json: ${ftFixed} .en fixed`);
console.log(`Remaining Chinese: ${remaining}, corrupt patterns: ${corrupt}, skipped garbage keys: ${skippedGarbage}`);
