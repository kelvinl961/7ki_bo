/**
 * Generate zh-en-supplement.json from missing Chinese strings using word-level glossary.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const missingPath = path.join(__dirname, 'missing-zh-strings.json');
const outPath = path.join(__dirname, 'zh-en-supplement.json');

const CHINESE_RE = /[\u4e00-\u9fff]/;

/** Word/phrase -> English (longest-match applied first) */
const WORD = {
  管理所有活动的创建、编辑、监控和统计:
    'Manage creation, editing, monitoring, and statistics for all activities',
  上级代理详情暂不可用（需后端返回 upper_agent_id）:
    'Upper agent details unavailable (backend must return upper_agent_id)',
  大类角标不能超过12个字符: 'Category badge cannot exceed 12 characters',
  大类名称不能超过50个字符: 'Category name cannot exceed 50 characters',
  用户ID 或 账号: 'User ID or account',
  '用户ID/账号': 'User ID / Account',
  选择开始和结束日期: 'Select start and end dates',
  请选择优惠来源: 'Please select promotion source',
  请选择或搜索活动: 'Please select or search activity',
  请选择奖励类型: 'Please select reward type',
  加载活动列表失败: 'Failed to load activity list',
  没有数据可导出: 'No data to export',
  正在加载数据...: 'Loading data...',
  发放奖励合计: 'Total rewards issued',
  发放奖励: 'Reward issued',
  全部领取方式: 'All claim methods',
  赠送奖励: 'Gift reward',
  手动领取: 'Manual claim',
  系统派发: 'System distribution',
  后台手动派发: 'Manual backend distribution',
  活动扣除: 'Activity deduction',
  加倍奖金: 'Double bonus',
  盲盒免费次数: 'Mystery box free spins',
  银商结算: 'Merchant settlement',
  积分抽奖: 'Points lottery',
  折扣券: 'Discount coupon',
  新人彩金: 'New member bonus',
  优惠明细: 'Promotion details',
  优惠名称: 'Promotion name',
  会员币种: 'Member currency',
  会员账号: 'Member account',
  会员ID: 'Member ID',
  上级代理: 'Upper agent',
  来源类型: 'Source type',
  发放方式: 'Distribution method',
  获取时间: 'Acquisition time',
  点击查看上级代理详情: 'Click to view upper agent details',
  点击提示: 'Click for hint',
  幸运值: 'Lucky value',
  活跃度: 'Activity points',
  共: 'Total',
  条: 'records',
  条记录: 'records',
  '3天以内': 'Within 3 days',
  '7天以内': 'Within 7 days',
  '24小时以内': 'Within 24 hours',
  '30天以内': 'Within 30 days',
  网址: 'URL',
  测试: 'Test',
  频繁: 'Frequent',
  剩余: 'Remaining',
  促销: 'Promotion',
  奖金: 'Bonus',
  救援: 'Rescue',
  佣金: 'Commission',
  退款: 'Refund',
  流水: 'Turnover',
  新人: 'New user',
  进度: 'Progress',
  清除: 'Clear',
  派彩: 'Payout',
  结算: 'Settlement',
  允许: 'Allow',
  禁止: 'Forbid',
  即时: 'Instant',
  延迟: 'Delayed',
  由我: 'By me',
  内容: 'Content',
  账号: 'Account',
  姓名: 'Name',
  展示: 'Display',
  红色: 'Red',
  绿色: 'Green',
  蓝色: 'Blue',
  橙色: 'Orange',
  比例: 'Ratio',
  余额: 'Balance',
  必需: 'Required',
  总计: 'Total',
  积分: 'Points',
  红包: 'Red packet',
  推广: 'Promotion',
  草稿: 'Draft',
  综合: 'Comprehensive',
  视频: 'Video',
  桌面: 'Desktop',
  其他: 'Other',
  打码: 'Wagering',
  签到: 'Check-in',
  邀请: 'Invite',
  投资: 'Investment',
  代理: 'Agent',
  集字: 'Collect characters',
  竞猜: 'Guessing',
  网页: 'Web page',
  固定: 'Fixed',
  每日: 'Daily',
  每周: 'Weekly',
  每月: 'Monthly',
  尾号: 'Last digits',
  连号: 'Consecutive numbers',
  旋转: 'Spin',
  显示: 'Show',
  编号: 'Number',
  前往: 'Go to',
  确定: 'Confirm',
  福袋: 'Lucky bag',
  礼包: 'Gift pack',
  宝箱: 'Treasure chest',
  奖品: 'Prize',
  节日: 'Holiday',
  赌场: 'Casino',
  成语: 'Idiom',
  投注数: 'Bet count',
  低风险: 'Low risk',
  非活跃: 'Inactive',
  投注中: 'Wagering in progress',
  区块链: 'Blockchain',
  将从: 'Will deduct from',
  按比例: 'By ratio',
  未分类: 'Uncategorized',
  商户号: 'Merchant ID',
  信用卡: 'Credit card',
  PC端: 'PC',
  移动端: 'Mobile',
  保障金: 'Reserve fund',
  保证金: 'Deposit guarantee',
  源金额: 'Source amount',
  进行中: 'In progress',
  已复制: 'Copied',
  应用到: 'Apply to',
  仅通知: 'Notify only',
  倍: 'x',
  次: 'times',
  笔: 'transactions',
  近: 'Recent',
  每: 'Each',
  至: 'to',
  关: 'Close',
  新: 'New',
  年: 'Year',
  大: 'Large',
  吉: 'Lucky',
  行: 'Row',
  开: 'Open',
  或: 'or',
  的: '',
  和: 'and',
  与: 'and',
  为: 'as',
  在: 'in',
  从: 'from',
  到: 'to',
  请: 'Please',
  选择: 'select',
  输入: 'enter',
  查看: 'view',
  编辑: 'edit',
  添加: 'add',
  删除: 'delete',
  保存: 'save',
  取消: 'cancel',
  确认: 'confirm',
  搜索: 'search',
  重置: 'reset',
  导出: 'export',
  导入: 'import',
  刷新: 'refresh',
  详情: 'details',
  操作: 'actions',
  状态: 'status',
  备注: 'remark',
  类型: 'type',
  名称: 'name',
  时间: 'time',
  金额: 'amount',
  数量: 'quantity',
  全部: 'all',
  启用: 'enable',
  禁用: 'disable',
  成功: 'success',
  失败: 'failed',
  加载: 'load',
  暂无: 'no',
  数据: 'data',
  列表: 'list',
  配置: 'config',
  设置: 'settings',
  规则: 'rules',
  条件: 'conditions',
  方式: 'method',
  来源: 'source',
  方式: 'method',
  领取: 'claim',
  发放: 'issue',
  赠送: 'gift',
  扣除: 'deduct',
  手动: 'manual',
  系统: 'system',
  后台: 'backend',
  会员: 'member',
  用户: 'user',
  订单: 'order',
  通道: 'channel',
  平台: 'platform',
  游戏: 'game',
  厂商: 'vendor',
  币种: 'currency',
  汇率: 'exchange rate',
  手续费: 'fee',
  最低: 'minimum',
  最高: 'maximum',
  最小: 'min',
  最大: 'max',
  开始: 'start',
  结束: 'end',
  创建: 'create',
  更新: 'update',
  修改: 'modify',
  复制: 'copy',
  上传: 'upload',
  下载: 'download',
  批量: 'batch',
  单个: 'single',
  全部游戏: 'all games',
  单个游戏: 'single game',
  未入金: 'no deposit',
  仅入金: 'deposit only',
  仅活动领奖: 'activity claim only',
  新建提现: 'New withdrawal',
  批量操作: 'Batch operation',
  自定义列表: 'Custom list',
  总提现金额: 'Total withdrawal amount',
  导出数据: 'Export data',
  已选择: 'Selected',
  步骤: 'Step',
  搜索会员: 'Search member',
  会员信息确认: 'Member info confirmed',
  重新选择: 'Reselect',
  填写提现信息: 'Fill withdrawal info',
  填写原因: 'Enter reason',
  强制拒绝: 'Force reject',
  强制取消: 'Force cancel',
  批量备注: 'Batch remark',
  重复IP人数: 'Duplicate IP count',
  个平台: 'platforms',
  提示: 'Note',
  若此处勾选指定稽核但游戏管理选择稽核排除:
    'If audit is specified here but excluded in game management, game management takes precedence',
  即需要再打码: 'Requires additional wagering of',
  才能再次提现: 'before next withdrawal',
  充: 'Deposit',
  提: 'Withdraw',
  人: 'users',
  总计: 'Total',
  条: 'records',
};

function replaceLongestFirst(text, map) {
  const phrases = Object.keys(map).sort((a, b) => b.length - a.length);
  let result = text;
  for (const phrase of phrases) {
    if (!phrase) continue;
    result = result.split(phrase).join(map[phrase]);
  }
  return result.replace(/\s{2,}/g, ' ').trim();
}

function translate(zh) {
  if (!zh || typeof zh !== 'string') return zh;
  if (!CHINESE_RE.test(zh)) return zh;
  if (WORD[zh]) return WORD[zh];

  let result = replaceLongestFirst(zh, WORD);

  // Template: 共 {0} 条
  result = result
    .replace(/共\s*\{(\d+)\}\s*条/g, 'Total {$1} records')
    .replace(/共\s*\{(\d+)\}\s*条记录/g, 'Total {$1} records')
    .replace(/请选择(.+)/g, 'Please select $1')
    .replace(/请输入(.+)/g, 'Please enter $1')
    .replace(/加载(.+)失败/g, 'Failed to load $1')
    .replace(/没有(.+)可导出/g, 'No $1 to export');

  // Clean orphaned Chinese particles if only 的/了 remain
  result = result.replace(/\s*的\s*/g, ' ').trim();

  return result;
}

const missing = JSON.parse(fs.readFileSync(missingPath, 'utf8'));
const supplement = {};

for (const zh of missing) {
  const en = translate(zh);
  if (en && en !== zh && !CHINESE_RE.test(en)) {
    supplement[zh] = en;
  }
}

fs.writeFileSync(outPath, `${JSON.stringify(supplement, null, 2)}\n`);
console.log(`Generated ${Object.keys(supplement).length}/${missing.length} translations -> zh-en-supplement.json`);
