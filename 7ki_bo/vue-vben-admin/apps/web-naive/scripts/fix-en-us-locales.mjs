/**
 * Fix en-US finance.json and activity.json by walking zh-CN parallel structure.
 * Also repairs finance-translations.json entries whose .en still contains Chinese.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');
const localesDir = path.join(appRoot, 'src/locales/langs');
const packagesLocalesDir = path.resolve(
  appRoot,
  '../../packages/locales/src/langs',
);
const financeTranslationsPath = path.join(__dirname, 'finance-translations.json');

const CHINESE_RE = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/;

function hasChinese(s) {
  return typeof s === 'string' && CHINESE_RE.test(s);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

/** Build zh -> en map from parallel common.json files */
function buildCommonZhToEn() {
  const zhCommon = readJson(path.join(packagesLocalesDir, 'zh-CN/common.json'));
  const enCommon = readJson(path.join(packagesLocalesDir, 'en-US/common.json'));
  const map = {};

  function walk(zhNode, enNode) {
    for (const key of Object.keys(zhNode)) {
      const z = zhNode[key];
      const e = enNode?.[key];
      if (z && typeof z === 'object' && !Array.isArray(z)) {
        walk(z, e && typeof e === 'object' ? e : {});
      } else if (typeof z === 'string' && typeof e === 'string' && z && e) {
        map[z] = e;
      }
    }
  }

  walk(zhCommon, enCommon);
  return map;
}

/** Gaming / finance glossary (zh phrase -> English) */
const GLOSSARY = {
  电子: 'Slots',
  真人: 'Live Casino',
  返水: 'Rebate',
  返佣: 'Commission Rebate',
  本周: 'This Week',
  活动: 'Activity',
  优惠活动: 'Promotions',
  优惠: 'Promotion',
  充值: 'Deposit',
  提现: 'Withdrawal',
  入金: 'Deposit',
  出款: 'Payout',
  稽核: 'Audit',
  投注: 'Wagering',
  输赢: 'Win/Loss',
  官网: 'Official Site',
  未知: 'Unknown',
  体育: 'Sports',
  彩票: 'Lottery',
  棋牌: 'Card Games',
  电竞: 'Esports',
  捕鱼: 'Fishing',
  街机: 'Arcade',
  斗鸡: 'Cockfighting',
  电话: 'Phone',
  邮箱: 'Email',
  批准: 'Approve',
  拒绝: 'Reject',
  错误: 'Error',
  更新: 'Update',
  排名: 'Ranking',
  普通: 'Regular',
  终端: 'Terminal',
  数量: 'Quantity',
  汇率: 'Exchange Rate',
  标记: 'Mark',
  优先: 'Priority',
  特殊: 'Special',
  昵称: 'Nickname',
  锁定: 'Locked',
  解锁: 'Unlock',
  冻结: 'Frozen',
  暂停: 'Suspended',
  临时: 'Temporary',
  笔数: 'Count',
  按日: 'By Day',
  按周: 'By Week',
  按月: 'By Month',
  正常: 'Normal',
  模拟: 'Simulated',
  筛选条件: 'Filter Criteria',
  领取方式: 'Claim Method',
  奖励类型: 'Reward Type',
  奖励: 'Reward',
  领取时间: 'Claim Time',
  发放奖励: 'Reward Issued',
  发放奖励合计: 'Total Rewards Issued',
  数据列表: 'Data List',
  正在加载数据: 'Loading data',
  没有数据可导出: 'No data to export',
  任务: 'Task',
  新人福利: 'New Member Benefits',
  利息宝: 'Interest Vault',
  幸运转盘: 'Lucky Wheel',
  公积金: 'Provident Fund',
  盲盒抽奖: 'Mystery Box Draw',
  活动中心: 'Activity Center',
  活动列表: 'Activity List',
  活动名称: 'Activity Name',
  活动ID: 'Activity ID',
  已关闭活动: 'Closed Activities',
  优惠统计: 'Promotion Statistics',
  分享管理: 'Share Management',
  优惠来源: 'Promotion Source',
  全部领取方式: 'All Claim Methods',
  今日: 'Today',
  昨天: 'Yesterday',
  上周: 'Last Week',
  搜索: 'Search',
  导出: 'Export',
  大类角标不能超过12个字符: 'Category badge cannot exceed 12 characters',
  大类名称不能超过50个字符: 'Category name cannot exceed 50 characters',
  '3天以内': 'Within 3 days',
  '7天以内': 'Within 7 days',
  '24小时以内': 'Within 24 hours',
  '30天以内': 'Within 30 days',
  请选择优惠来源: 'Please select promotion source',
  请选择或搜索活动: 'Please select or search activity',
  请选择奖励类型: 'Please select reward type',
  加载活动列表失败: 'Failed to load activity list',
  '管理所有活动的创建、编辑、监控和统计':
    'Manage creation, editing, monitoring, and statistics for all activities',
  用户ID或账号: 'User ID or account',
  '用户ID/账号': 'User ID / Account',
  选择开始和结束日期: 'Select start and end dates',
  共: 'Total',
  条: 'records',
  天: 'days',
  小时: 'hours',
  分钟: 'minutes',
  秒: 'seconds',
  元: 'CNY',
  处理中: 'Processing',
  成功: 'Success',
  失败: 'Failed',
  说明: 'Description',
  对接厂商: 'Integration Vendor',
  规则类型: 'Rule Type',
  入金条件: 'Deposit Condition',
  游戏范围: 'Game Scope',
  操作历史: 'Operation History',
  设置RTP: 'Set RTP',
  单局最高倍数: 'Max Multiplier Per Round',
  单局最高赢取: 'Max Win Per Round',
  游戏类型: 'Game Type',
  类型: 'Type',
  时间: 'Time',
  状态: 'Status',
  操作人: 'Operator',
  游戏ID: 'Game ID',
  商户RTP调控V2: 'Merchant RTP Control V2',
  商户级别的RTP调控: 'Merchant-level RTP control',
  支持单个游戏或全部游戏调控: 'Control RTP for a single game or all games',
  根据已启用的游戏平台加载: 'Loaded from enabled game platforms',
  选择RTP值: 'Select RTP value',
  波动型: 'Volatile',
  仿正型: 'Normal-like',
  混合型: 'Mixed',
  稳定型: 'Stable',
  高中奖率: 'High Hit Rate',
  拉霸: 'Slots',
  电子游戏: 'Slot Games',
  视讯游戏: 'Live Video Games',
  捕鱼游戏: 'Fishing Games',
  彩票游戏: 'Lottery Games',
  全部slots游戏: 'All slot games',
  未入金: 'No Deposit',
  仅入金: 'Deposit Only',
  仅活动领奖: 'Activity Claim Only',
  添加规则: 'Add Rule',
  重置表单: 'Reset Form',
  加载后端配置: 'Load Backend Config',
  清空全部规则: 'Clear All Rules',
  保存到后端: 'Save to Backend',
  规则列表: 'Rule List',
  暂无规则: 'No Rules Yet',
  优先级: 'Priority',
  厂商: 'Vendor',
  启用: 'Enable',
  禁用: 'Disable',
  上移: 'Move Up',
  下移: 'Move Down',
  删除: 'Delete',
  是: 'Yes',
  否: 'No',
  取消: 'Cancel',
};

const COMMON_ZH_TO_EN = buildCommonZhToEn();
let financeTranslations = readJson(financeTranslationsPath);

const supplementPath = path.join(__dirname, 'zh-en-supplement.json');
let SUPPLEMENT = {};
if (fs.existsSync(supplementPath)) {
  SUPPLEMENT = readJson(supplementPath);
  Object.assign(GLOSSARY, SUPPLEMENT);
}

function financeTranslationEn(zh) {
  const entry = financeTranslations[zh];
  if (!entry || typeof entry.en !== 'string') return null;
  if (hasChinese(entry.en)) return null;
  return entry.en;
}

function replaceLongestFirst(text, phraseMap) {
  const phrases = Object.keys(phraseMap).sort((a, b) => b.length - a.length);
  let result = text;
  for (const phrase of phrases) {
    if (!phrase) continue;
    result = result.split(phrase).join(phraseMap[phrase]);
  }
  return result;
}

function translateZh(zh) {
  if (!zh || typeof zh !== 'string') return zh;

  if (COMMON_ZH_TO_EN[zh]) return COMMON_ZH_TO_EN[zh];
  if (GLOSSARY[zh]) return GLOSSARY[zh];
  if (SUPPLEMENT[zh]) return SUPPLEMENT[zh];

  const fromFinance = financeTranslationEn(zh);
  if (fromFinance) return fromFinance;

  const phraseReplaced = replaceLongestFirst(zh, GLOSSARY);
  if (phraseReplaced !== zh) return phraseReplaced;

  return zh;
}

function countChineseInObject(obj) {
  let count = 0;
  const walk = (node) => {
    if (typeof node === 'string') {
      if (hasChinese(node)) count++;
      return;
    }
    if (node && typeof node === 'object') {
      for (const v of Object.values(node)) walk(v);
    }
  };
  walk(obj);
  return count;
}

function walkAndFix(zhNode, enNode, stats) {
  if (!enNode || typeof enNode !== 'object') enNode = {};

  for (const key of Object.keys(zhNode)) {
    const zhVal = zhNode[key];
    const enVal = enNode[key];

    if (zhVal && typeof zhVal === 'object' && !Array.isArray(zhVal)) {
      if (!enNode[key] || typeof enNode[key] !== 'object') {
        enNode[key] = {};
      }
      walkAndFix(zhVal, enNode[key], stats);
      continue;
    }

    if (typeof zhVal !== 'string') continue;

    const fullMap = { ...COMMON_ZH_TO_EN, ...GLOSSARY, ...SUPPLEMENT };
    let translated = translateZh(zhVal);
    if (hasChinese(translated)) {
      translated = replaceLongestFirst(zhVal, fullMap);
    }

    // Always rebuild from zh when current en still contains Chinese
    if (typeof enVal === 'string' && hasChinese(enVal) && hasChinese(zhVal)) {
      const fromZh = replaceLongestFirst(zhVal, fullMap);
      if (!hasChinese(fromZh)) translated = fromZh;
    }

    const needsFix =
      typeof enVal !== 'string' ||
      hasChinese(enVal) ||
      enVal === zhVal ||
      (!hasChinese(translated) && enVal !== translated);

    if (needsFix && !hasChinese(translated) && translated !== enVal) {
      enNode[key] = translated;
      stats.fixed++;
    }
  }

  return enNode;
}

function fixFinanceTranslations() {
  let fixed = 0;
  for (const [zh, entry] of Object.entries(financeTranslations)) {
    if (!entry || typeof entry !== 'object') continue;
    if (!hasChinese(entry.en)) continue;

    const newEn = translateZh(zh);
    if (newEn && newEn !== entry.en && !hasChinese(newEn)) {
      entry.en = newEn;
      fixed++;
    } else if (hasChinese(entry.en)) {
      const replaced = replaceLongestFirst(entry.en, GLOSSARY);
      if (!hasChinese(replaced) && replaced !== entry.en) {
        entry.en = replaced;
        fixed++;
      } else {
        const fromZh = replaceLongestFirst(zh, {
          ...COMMON_ZH_TO_EN,
          ...GLOSSARY,
        });
        if (!hasChinese(fromZh) && fromZh !== zh) {
          entry.en = fromZh;
          fixed++;
        }
      }
    }
  }
  return fixed;
}

function fixLocaleFile(name) {
  const zh = readJson(path.join(localesDir, 'zh-CN', name));
  const enPath = path.join(localesDir, 'en-US', name);
  const en = readJson(enPath);
  const stats = { fixed: 0 };
  walkAndFix(zh, en, stats);
  writeJson(enPath, en);
  const remaining = countChineseInObject(en);
  return { fixed: stats.fixed, remaining };
}

console.log('=== fix-en-us-locales ===');
console.log(`Common map entries: ${Object.keys(COMMON_ZH_TO_EN).length}`);
console.log(`Glossary entries: ${Object.keys(GLOSSARY).length}`);
console.log(
  `Finance translations loaded: ${Object.keys(financeTranslations).length}`,
);

const financeResult = fixLocaleFile('finance.json');
console.log(
  `finance.json: fixed ${financeResult.fixed} values, ${financeResult.remaining} strings still contain Chinese`,
);

const activityResult = fixLocaleFile('activity.json');
console.log(
  `activity.json: fixed ${activityResult.fixed} values, ${activityResult.remaining} strings still contain Chinese`,
);

const financeTransFixed = fixFinanceTranslations();
writeJson(financeTranslationsPath, financeTranslations);

let financeTransRemaining = 0;
for (const entry of Object.values(financeTranslations)) {
  if (entry?.en && hasChinese(entry.en)) financeTransRemaining++;
}

console.log(
  `finance-translations.json: fixed ${financeTransFixed} .en entries, ${financeTransRemaining} .en entries still contain Chinese`,
);

const totalRemaining =
  financeResult.remaining + activityResult.remaining + financeTransRemaining;
console.log(`Total remaining Chinese in en-US locales + finance-translations: ${totalRemaining}`);
console.log('Done.');
