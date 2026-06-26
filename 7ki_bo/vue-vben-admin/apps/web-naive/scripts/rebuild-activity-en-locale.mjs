/**
 * Rebuild en-US/activity.json from zh-CN. Fixes Chinglish corruption.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, '../src/locales/langs');
const packagesLocalesDir = path.resolve(__dirname, '../../../packages/locales/src/langs');

const CHINESE_RE = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/;
const GARBAGE_KEY_RE = /NButton|DivClass|Template|VModel|NTabPane|Const[A-Z]|RenderRow|k\d+[A-Z][a-z]/;
const CORRUPT_EN_RE =
  /xcount|userscount|andusers|openclose|yesno|notlimit|PromotionName|RechargePromotion|taskin|cancel出|FundOpen|Fundsettings|Dailytask|Weeklytask|giftRatio|ActivityTime[^l]|ActivityID|please select[A-Z]|Please select[A-Z]|最large|当before|参and|预count|Activityopen|Activitysettle|没has|notopen|alreadysettle|none效|already归档|Content信息|Statistics信息|支持Platform|Activity要求|Activity规则|Activity时长|暂none|noteorder|New User礼金|推荐Reward|VIPReward|SVIPReward|loadfailed|PromotionDetails|PromotionType|totalActivity count|totalReward发放|total参与|Export表格|recordscount|totaltimescount|andStatistics|and端|Activity参数|reward amount|ended activities|total@|Lucky Valueand|itemsusers|onlyhas|私lower|has效|eachtype|andsettings|三Day|Prompt气泡|taskcondition|Showamount|yesnoOn|Benefitssettings|pertimes|Wageringafter|Rechargeafter|OpenCloseOn|RatioProvident|StatisticsProvident|FundReward|activity points settings|RemainingLucky|in奖|实物订order|公TotalConfig|奖item|cancel耗|Displaysuccess|真实success|YesNo公/i;

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
  if (GARBAGE_KEY_RE.test(en)) return true;
  if (CORRUPT_EN_RE.test(en)) return true;
  if (en.length > 200) return true;
  if (/^k\d+[a-z0-9]*$/i.test(en.trim())) return true;
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

const supplement = fs.existsSync(path.join(__dirname, 'zh-en-supplement.json'))
  ? readJson(path.join(__dirname, 'zh-en-supplement.json'))
  : {};
const financeTranslations = readJson(path.join(__dirname, 'finance-translations.json'));
const commonMap = buildCommonZhToEn();
const activityMap = readJson(path.join(__dirname, 'activity-i18n-map.json'));

/** Longest-first phrase segments for rule-based translation */
const SEGMENTS = [
  ['管理所有活动的创建、编辑、监控和统计', 'Manage creation, editing, monitoring, and statistics for all activities'],
  ['管理新人福利、每日任务、每周任务等各类任务的配置和设置', 'Manage new member benefits, daily tasks, weekly tasks, and other task configurations'],
  ['管理转盘配置、幸运值记录与中奖数据', 'Manage wheel configuration, lucky value records, and prize data'],
  ['用户每次充值后获得对应比例的公积金奖励，需完成对应倍数的打码后才可取出领取；仅统计公积金开关开启后的充值。', 'Users receive provident fund rewards based on each deposit ratio. Required wagering must be completed before withdrawal. Only deposits after the provident fund toggle is enabled are counted.'],
  ['用户ID/账号', 'User ID / Account'],
  ['用户ID 或 账号', 'User ID or Account'],
  ['请选择优惠来源', 'Please select promotion source'],
  ['请选择或搜索活动', 'Please select or search activity'],
  ['请选择奖励类型', 'Please select reward type'],
  ['请选择开始和结束日期', 'Select start and end dates'],
  ['选择开始和结束日期', 'Select start and end dates'],
  ['加载活动列表失败', 'Failed to load activity list'],
  ['没有数据可导出', 'No data to export'],
  ['正在加载数据...', 'Loading data...'],
  ['发放奖励合计:', 'Total rewards issued:'],
  ['点击查看上级代理详情', 'Click to view upper agent details'],
  ['上级代理详情暂不可用（需后端返回 upper_agent_id）', 'Upper agent details unavailable (backend must return upper_agent_id)'],
  ['最大参与人数', 'Max participants'],
  ['当前参与人数', 'Current participants'],
  ['参与进度', 'Participation progress'],
  ['展示状态', 'Display status'],
  ['支持平台', 'Supported platforms'],
  ['活动开始时间', 'Activity start time'],
  ['活动结束时间', 'Activity end time'],
  ['活动时长', 'Activity duration'],
  ['内容信息', 'Content info'],
  ['暂无内容信息', 'No content info'],
  ['统计信息', 'Statistics info'],
  ['参与人数', 'Participants'],
  ['预计支出', 'Estimated expense'],
  ['活动开始', 'Activity started'],
  ['活动结束', 'Activity ended'],
  ['没有活动信息', 'No activity info'],
  ['活动要求', 'Activity requirements'],
  ['活动描述', 'Activity description'],
  ['活动规则', 'Activity rules'],
  ['活动时间线', 'Activity timeline'],
  ['未开始/已结束', 'Not started / Ended'],
  ['无效日期', 'Invalid date'],
  ['日期格式错误', 'Invalid date format'],
  ['已关闭活动', 'Closed activities'],
  ['已关闭幸运转盘', 'Lucky wheel closed'],
  ['已关闭公积金', 'Provident fund closed'],
  ['已开启幸运转盘', 'Lucky wheel enabled'],
  ['已开启公积金统计', 'Provident fund statistics enabled'],
  ['已强制解除', 'Force released'],
  ['新人礼金', 'New user bonus'],
  ['新人彩金', 'New member bonus'],
  ['新人福利', 'New member benefits'],
  ['幸运注单', 'Lucky bet slip'],
  ['推荐奖励', 'Referral reward'],
  ['充值优惠', 'Deposit promotion'],
  ['优惠统计', 'Promotion statistics'],
  ['优惠活动', 'Promotion activities'],
  ['优惠来源', 'Promotion source'],
  ['优惠名称', 'Promotion name'],
  ['优惠明细', 'Promotion details'],
  ['优惠类型', 'Promotion type'],
  ['活动中心', 'Activity center'],
  ['活动列表', 'Activity list'],
  ['活动名称', 'Activity name'],
  ['活动ID', 'Activity ID'],
  ['活动币种', 'Activity currency'],
  ['活动扣除', 'Activity deduction'],
  ['活动点数', 'Activity points'],
  ['活动详情', 'Activity details'],
  ['活动类别', 'Activity category'],
  ['活动子类', 'Activity subcategory'],
  ['活动状态', 'Activity status'],
  ['活动参数', 'Activity parameters'],
  ['分享管理', 'Share management'],
  ['筛选条件', 'Filter criteria'],
  ['数据列表', 'Data list'],
  ['领取方式', 'Claim method'],
  ['全部领取方式', 'All claim methods'],
  ['奖励类型', 'Reward type'],
  ['赠送奖励', 'Gift reward'],
  ['发放奖励', 'Reward issued'],
  ['发放方式', 'Distribution method'],
  ['领取时间', 'Claim time'],
  ['获取时间', 'Acquisition time'],
  ['来源类型', 'Source type'],
  ['会员币种', 'Member currency'],
  ['会员ID', 'Member ID'],
  ['会员账号', 'Member account'],
  ['上级代理', 'Upper agent'],
  ['暂无数据', 'No data'],
  ['加载失败', 'Load failed'],
  ['盲盒抽奖', 'Mystery box draw'],
  ['盲盒免费次数', 'Mystery box free spins'],
  ['幸运转盘', 'Lucky wheel'],
  ['幸运值记录', 'Lucky value records'],
  ['剩余幸运值', 'Remaining lucky value'],
  ['幸运值周期', 'Lucky value cycle'],
  ['过期幸运值', 'Expired lucky value'],
  ['扣除幸运值', 'Deduct lucky value'],
  ['中奖记录', 'Prize records'],
  ['中奖时间', 'Prize time'],
  ['实物订单', 'Physical orders'],
  ['转盘列表', 'Wheel list'],
  ['转盘类型', 'Wheel type'],
  ['转盘名称', 'Wheel name'],
  ['转盘开关', 'Wheel toggle'],
  ['转盘已开启', 'Wheel enabled'],
  ['转盘已关闭', 'Wheel disabled'],
  ['全部转盘类型', 'All wheel types'],
  ['+ 转盘公共配置', '+ Wheel public configuration'],
  ['公积金明细', 'Provident fund details'],
  ['公积金开关', 'Provident fund toggle'],
  ['公积金设置', 'Provident fund settings'],
  ['公积金封顶', 'Provident fund cap'],
  ['公积金奖金', 'Provident fund bonus'],
  ['赠送前公积金', 'Provident fund before bonus'],
  ['赠送公积金', 'Bonus provident fund'],
  ['赠送后公积金', 'Provident fund after bonus'],
  ['已赠送/封顶次数', 'Gifted / cap count'],
  ['投注要求', 'Wagering requirements'],
  ['投注状态', 'Wagering status'],
  ['投注倍数', 'Wagering multiplier'],
  ['新增投注量', 'New wagering volume'],
  ['总要求投注', 'Total required wagering'],
  ['已投注', 'Wagered'],
  ['剩余投注', 'Remaining wagering'],
  ['限制平台', 'Restricted platforms'],
  ['强制解除', 'Force release'],
  ['取出记录', 'Withdrawal records'],
  ['取出金额', 'Withdrawal amount'],
  ['赠送比例', 'Bonus ratio'],
  ['任务中心', 'Task center'],
  ['每日任务', 'Daily tasks'],
  ['每周任务', 'Weekly tasks'],
  ['三天神秘任务', '3-day mystery task'],
  ['活跃度设置', 'Activity points settings'],
  ['新人福利设置', 'New member benefit settings'],
  ['签到活动', 'Check-in activity'],
  ['打码活动', 'Wagering activity'],
  ['充值活动', 'Deposit promotion'],
  ['红包活动', 'Red envelope activity'],
  ['新人活动', 'New user activity'],
  ['救援金', 'Rescue fund'],
  ['返水', 'Rebate'],
  ['返佣', 'Commission rebate'],
  ['利息宝', 'Interest vault'],
  ['银商结算', 'Merchant settlement'],
  ['积分抽奖', 'Points lottery'],
  ['折扣券', 'Discount coupon'],
  ['手动领取', 'Manual claim'],
  ['系统派发', 'System distribution'],
  ['后台手动派发', 'Manual backend distribution'],
  ['加倍奖金', 'Double bonus'],
  ['幸运值', 'Lucky value'],
  ['订单号', 'Order no.'],
  ['订单编号', 'Order no.'],
  ['订单状态', 'Order status'],
  ['收货姓名', 'Recipient name'],
  ['收货地址', 'Shipping address'],
  ['联系电话', 'Contact phone'],
  ['快递单号', 'Tracking no.'],
  ['快递公司', 'Courier company'],
  ['发货时间', 'Ship time'],
  ['变动类型', 'Change type'],
  ['变动前', 'Before change'],
  ['变动后', 'After change'],
  ['变动时间', 'Change time'],
  ['过期时间', 'Expiry time'],
  ['全选当前页', 'Select current page'],
  ['全选所有结果', 'Select all results'],
  ['导出报表', 'Export report'],
  ['导出已开始', 'Export started'],
  ['导出失败，请确认 API 已接入', 'Export failed; confirm API is connected'],
  ['开关更新失败', 'Toggle update failed'],
  ['转盘开关更新失败', 'Wheel toggle update failed'],
  ['操作失败', 'Operation failed'],
  ['开启时间：', 'Enabled at: '],
  ['已选择 {0} 条数据，共 {1} 条', 'Selected {0} records, total {1}'],
  ['已选择 {0} 条数据 共 {1} 条', 'Selected {0} records, total {1}'],
  ['共 {0} 条记录', 'Total {0} records'],
  ['共 {0} 条', 'Total {0} records'],
  ['共 {0} 条数据', 'Total {0} records'],
  ['0表示不限制', '0 means unlimited'],
  ['请输入会员ID', 'Please enter member ID'],
  ['请输入收件人', 'Please enter recipient'],
  ['全部状态', 'All statuses'],
  ['全部类型', 'setAll types'],
  ['全部转盘类型', 'All wheel types'],
  ['变动类型', 'Change type'],
  ['最小值', 'Min value'],
  ['最大值', 'Max value'],
  ['人员', 'Personnel'],
  ['今日', 'Today'],
  ['昨天', 'Yesterday'],
  ['上周', 'Last week'],
  ['搜索', 'Search'],
  ['导出', 'Export'],
  ['详情', 'Detail'],
  ['操作', 'Actions'],
  ['范围', 'Range'],
  ['周', 'Week'],
  ['月', 'Month'],
  ['时间', 'Time'],
  ['币种', 'Currency'],
  ['全部', 'All'],
  ['启用', 'Enable'],
  ['禁用', 'Disable'],
  ['开', 'On'],
  ['关', 'Off'],
  ['展示', 'Show'],
  ['不展示', 'Hide'],
  ['无限制', 'Unlimited'],
  ['确定', 'Confirm'],
  ['取消', 'Cancel'],
  ['更新', 'Update'],
  ['创建时间', 'Create time'],
  ['更新 time', 'Update time'],
  ['活动', 'Activity'],
  ['任务', 'Task'],
  ['优惠', 'Promotion'],
  ['奖金', 'Bonus'],
  ['积分', 'Points'],
  ['推广', 'Promotion'],
  ['红包', 'Red envelope'],
  ['点击提示', 'Click for hint'],
  ['已结束', 'Ended'],
  ['已关闭', 'Closed'],
  ['已暂停', 'Paused'],
  ['已归档', 'Archived'],
  ['1天', '1 day'],
  ['7天', '7 days'],
  ['15天', '15 days'],
  ['30天', '30 days'],
  ['自定义', 'Custom'],
  ['开始时间', 'Start time'],
  ['结束时间', 'End time'],
];

// fix typo in segment
const idx = SEGMENTS.findIndex(([k]) => k === '全部类型');
if (idx >= 0) SEGMENTS[idx] = ['全部类型', 'All types'];

SEGMENTS.sort((a, b) => b[0].length - a[0].length);

const PHRASE_EN = Object.fromEntries(SEGMENTS);

function translateBySegments(zh) {
  if (!hasChinese(zh)) return zh;
  let s = zh;
  for (const [cn, en] of SEGMENTS) {
    if (s.includes(cn)) s = s.split(cn).join(en);
  }
  s = s
    .replace(/，/g, ', ')
    .replace(/。/g, '.')
    .replace(/；/g, '; ')
    .replace(/：/g, ': ')
    .replace(/（/g, ' (')
    .replace(/）/g, ') ')
    .replace(/、/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
  if (hasChinese(s)) return null;
  return s;
}

function translatePhrase(zh) {
  if (!zh || typeof zh !== 'string') return null;
  if (PHRASE_EN[zh]) return PHRASE_EN[zh];
  if (commonMap[zh]) return commonMap[zh];
  if (supplement[zh] && !hasChinese(supplement[zh]) && !isCorruptEn(supplement[zh]))
    return supplement[zh];
  const ft = financeTranslations[zh];
  if (ft?.en && !isCorruptEn(ft.en)) return ft.en;

  let s = zh;
  if (/^请输入/.test(s)) {
    const rest = translateBySegments(s.slice(3)) || s.slice(3);
    if (!hasChinese(rest)) return `Please enter ${rest.charAt(0).toLowerCase()}${rest.slice(1)}`;
  }
  if (/^请选择/.test(s)) {
    const rest = translateBySegments(s.slice(3)) || s.slice(3);
    if (!hasChinese(rest)) return `Please select ${rest.charAt(0).toLowerCase()}${rest.slice(1)}`;
  }

  return translateBySegments(zh);
}

function walkRebuild(zhNode, enNode) {
  if (!enNode || typeof enNode !== 'object') enNode = {};
  for (const key of Object.keys(zhNode)) {
    const zhVal = zhNode[key];
    if (zhVal && typeof zhVal === 'object' && !Array.isArray(zhVal)) {
      if (!enNode[key] || typeof enNode[key] !== 'object') enNode[key] = {};
      walkRebuild(zhVal, enNode[key]);
      continue;
    }
    if (typeof zhVal !== 'string') continue;
    if (GARBAGE_KEY_RE.test(key) || zhVal.includes('<') || zhVal.length > 180) continue;

    const currentEn = enNode[key];
    const needsFix = isCorruptEn(currentEn);
    if (!needsFix && !hasChinese(zhVal)) continue;

    let newEn = translatePhrase(zhVal);
    if ((!newEn || isCorruptEn(newEn)) && typeof currentEn === 'string' && !isCorruptEn(currentEn)) {
      continue;
    }
    if (newEn && !isCorruptEn(newEn) && newEn !== currentEn) {
      enNode[key] = newEn;
    }
  }
  return enNode;
}

const zh = readJson(path.join(localesDir, 'zh-CN/activity.json'));
let en = readJson(path.join(localesDir, 'en-US/activity.json'));

walkRebuild(zh, en);

// Force menu-critical keys
en.center ??= {};
en.center.k4f182 = 'Promotion Activities';
en.center.k6d3b = 'Activity Center';
en.center.k6d3b2 = 'Activity List';
en.center.k5df2 = 'Closed Activities';
en.center.k4f18 = 'Promotion Statistics';
en.center.k5206 = 'Share Management';
en.taskCenter ??= {};
en.taskCenter.k4efb = 'Task Center';
en.rewardReport ??= {};
en.rewardReport.k5145 = 'Deposit Promotion';
en.rewardReport.k6d3b2 = 'Activity ID';
en.rewardReport.k4f182 = 'Promotion Name';

writeJson(path.join(localesDir, 'en-US/activity.json'), en);

function countBad(obj) {
  let c = 0;
  const w = (n) => {
    if (typeof n === 'string' && isCorruptEn(n)) c++;
    else if (n && typeof n === 'object') Object.values(n).forEach(w);
  };
  w(obj);
  return c;
}
console.log('activity en-US rebuilt; remaining corrupt strings:', countBad(en));
