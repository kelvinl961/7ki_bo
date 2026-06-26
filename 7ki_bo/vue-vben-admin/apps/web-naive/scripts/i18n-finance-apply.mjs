/**
 * Finance i18n automation: extract Chinese UI strings, generate locale JSON, apply $t() replacements.
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
  确认删除: 'common.confirm',
  删除: 'common.delete',
  保存: 'common.save',
  状态: 'common.status',
  备注: 'common.remark',
  详情: 'common.detail',
  修改: 'common.edit',
  操作: 'common.actions',
  币种: 'common.currency',
  订单号: 'common.orderNo',
  会员账号: 'common.memberAccount',
  导出报表: 'common.exportReport',
  批量操作: 'common.batchOperation',
  全选: 'common.selectAll',
  今天: 'common.today',
  本周: 'common.thisWeek',
  本月: 'common.thisMonth',
  自定义: 'common.custom',
  启用: 'common.enable',
  停用: 'common.disable',
  关闭: 'common.close',
  金额: 'common.amount',
  成功: 'common.success',
  失败: 'common.failed',
  '加载中...': 'common.loading',
  暂无数据: 'common.noData',
  请选择: 'common.pleaseSelect',
  请输入: 'common.pleaseEnter',
  创建时间: 'common.createTime',
  高级搜索: 'common.advancedSearch',
  操作人: 'common.operator',
  操作时间: 'common.operationTime',
  类型: 'common.type',
  全部: 'common.all',
  查看: 'common.view',
  提交: 'common.submit',
  添加: 'common.add',
  导出: 'common.export',
  下载: 'common.download',
  上传: 'common.upload',
  复制: 'common.copy',
  复制成功: 'common.copySuccess',
  保存成功: 'common.saveSuccess',
  删除成功: 'common.deleteSuccess',
  操作成功: 'common.operationSuccess',
  操作失败: 'common.operationFailed',
  是: 'common.yes',
  否: 'common.no',
  已选择: 'common.selected',
  合计: 'common.total',
  时间: 'common.time',
  名称: 'common.name',
  描述: 'common.description',
  开始时间: 'common.startTime',
  结束时间: 'common.endTime',
  日期范围: 'common.dateRange',
  选择自定义时间范围: 'common.selectDateRange',
  订单状态: 'common.orderStatus',
  请选择搜索条件: 'common.selectSearchCondition',
  会员: 'common.member',
  等级: 'common.level',
  平台: 'common.platform',
  游戏: 'common.game',
};

function toCamelCase(en) {
  return en
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w, i) =>
      i === 0
        ? w.charAt(0).toLowerCase() + w.slice(1).toLowerCase()
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    )
    .join('')
    .replace(/[^a-zA-Z0-9]/g, '');
}

function hasChinese(s) {
  return /[\u4e00-\u9fff]/.test(s);
}

function extractStrings(content) {
  const results = [];
  const re = /(['"`])((?:(?!\1)[^\\]|\\.)*)(\1)/g;
  let m;
  while ((m = re.exec(content))) {
    const s = m[2];
    if (hasChinese(s) && s.length < 200 && !s.includes('\n')) {
      results.push({ full: m[0], quote: m[1], text: s, index: m.index });
    }
  }
  return results;
}

// English translations for finance-specific strings (zh -> en)
const EN_MAP = {
  代付统计: 'Payment Statistics',
  '查看对应三方代付出款的成功总数、成功率': 'View third-party payout success count and rate',
  统计时间: 'Statistics Time',
  选择时间范围: 'Select time range',
  三方代付: 'Third-party Payout',
  选择代付商: 'Select payout provider',
  选择币种: 'Select currency',
  请输入会员账号: 'Enter member account',
  会员提现次数: 'Member withdrawal count',
  选择提现次数: 'Select withdrawal count',
  统计概览: 'Statistics Overview',
  总订单数: 'Total orders',
  成功订单数: 'Success orders',
  失败订单数: 'Failed orders',
  成功率: 'Success rate',
  总金额: 'Total amount',
  成功金额: 'Success amount',
  详细统计: 'Detailed statistics',
  代付统计: 'Payment statistics',
  日期: 'Date',
  平均处理时间: 'Avg processing time',
  会员提现统计: 'Member withdrawal stats',
  '未提现: ': 'Never withdrawn: ',
  '首次: ': 'First time: ',
  '多次: ': 'Multiple: ',
  获取数据失败: 'Failed to fetch data',
  导出成功: 'Export successful',
  导出数据为空: 'Export data is empty',
  导出失败: 'Export failed',
  全部会员: 'All members',
  首次提现: 'First withdrawal',
  多次提现: 'Multiple withdrawals',
  PIX支付: 'PIX Payment',
  PIX自动: 'PIX Auto',
  银行转账: 'Bank transfer',
  人工代付: 'Manual payout',
  第三方代付: 'Third-party payout',
  未知渠道: 'Unknown channel',
  共: 'Total',
  ' 条统计记录': ' statistics records',
  ' 条': ' records',
  条: 'records',
  新增商户: 'Add merchant',
  代付币种: 'Payout currency',
  商户状态: 'Merchant status',
  选择状态: 'Select status',
  输入商户名称: 'Enter merchant name',
  ' 个代付商户': ' payout merchants',
  修改代付商户: 'Edit payout merchant',
  新增代付商户: 'Add payout merchant',
  基本信息: 'Basic info',
  选择代付币种: 'Select payout currency',
  请选择三方代付: 'Select third-party payout',
  三方代付平台名: 'Third-party platform name',
  输入三方代付平台名: 'Enter platform name',
  三方商户号: 'Third-party merchant ID',
  输入三方商户号: 'Enter merchant ID',
  三方商户密钥: 'Third-party merchant key',
  输入三方商户密钥: 'Enter merchant key',
  回调成功标识: 'Callback success flag',
  输入回调成功标识: 'Enter callback success flag',
  三方下单地址: 'Third-party order URL',
  输入三方下单地址: 'Enter order URL',
  查询地址: 'Query URL',
  输入查询地址: 'Enter query URL',
  余额查询地址: 'Balance query URL',
  输入余额查询地址: 'Enter balance query URL',
  三方回调IP: 'Third-party callback IP',
  输入三方回调IP: 'Enter callback IP',
  提现方式: 'Withdrawal method',
  限额设置: 'Limit settings',
  代付限额: 'Payout limit',
  输入最小代付限额: 'Enter minimum payout limit',
  输入最大代付限额: 'Enter maximum payout limit',
  请输入备注: 'Enter remark',
  停启用: 'Enable/Disable',
  开启: 'On',
  查询失败: 'Query failed',
  三方商户余额: 'Merchant balance',
  最小限额: 'Min limit',
  最大限额: 'Max limit',
  '停/启用': 'On/Off',
  删除确认: 'Delete confirmation',
  确认删除: 'Confirm delete',
  '删除后无法恢复。': 'Cannot be recovered after deletion.',
  保存失败: 'Save failed',
  更新成功: 'Update successful',
  新增成功: 'Create successful',
  请检查表单必填项: 'Please check required fields',
  未知错误: 'Unknown error',
  免审出款: 'Auto-approved withdrawal',
  '符合免审条件的提现订单自动处理': 'Auto-process withdrawals meeting exemption criteria',
  '免审条件：同时满足设置的会员层级、标签、注册时长、金额限制等条件':
    'Exemption criteria: member tier, tags, registration duration, amount limits, etc.',
  申请时间: 'Application time',
  金额大小: 'Amount range',
  自动规则: 'Auto rule',
  会员层级: 'Member tier',
  自己提定的: 'Custom filter',
  ' 条数据': ' records selected',
  已选择: 'Selected',
  导出搜索: 'Export search results',
  符合免审条件: 'Eligible for auto-approval',
  今日已自动处理: 'Auto-processed today',
  累计金额: 'Cumulative amount',
  清空选择: 'Clear selection',
  全选当前页: 'Select all on page',
  批量自动出款: 'Bulk auto payout',
  批量自动出款确认: 'Bulk auto payout confirmation',
  确认处理: 'Confirm process',
  批量导出: 'Bulk export',
  批量标记: 'Bulk mark',
  处理备注: 'Process remark',
  '自动审核处理备注（可选）': 'Auto-approval remark (optional)',
  自动审核规则设置: 'Auto-approval rule settings',
  '设置符合免审出款的条件，满足条件的提现申请将自动通过审核':
    'Set conditions for auto-approved withdrawals',
  VIP等级规则: 'VIP level rules',
  最低VIP等级: 'Minimum VIP level',
  选择最低VIP等级: 'Select minimum VIP level',
  VIP用户免审金额上限: 'VIP auto-approval amount limit',
  输入金额上限: 'Enter amount limit',
  账户安全规则: 'Account security rules',
  账户注册天数: 'Account registration days',
  最少注册天数: 'Minimum registration days',
  最近登录天数: 'Recent login days',
  最近登录天数内: 'Within recent login days',
  交易历史规则: 'Transaction history rules',
  最少充值次数: 'Minimum deposit count',
  充值提现比例: 'Deposit/withdrawal ratio',
  最低充值提现比例: 'Minimum deposit/withdrawal ratio',
  风险控制规则: 'Risk control rules',
  单笔免审金额上限: 'Single auto-approval amount limit',
  单笔最大金额: 'Maximum single amount',
  日累计免审金额: 'Daily auto-approval amount',
  每日累计最大金额: 'Maximum daily cumulative amount',
  规则启用状态: 'Rule enable status',
  启用VIP免审: 'Enable VIP auto-approval',
  启用小额免审: 'Enable small amount auto-approval',
  启用老用户免审: 'Enable veteran user auto-approval',
  启用高频用户免审: 'Enable frequent user auto-approval',
  保存规则: 'Save rules',
  免审出款详情: 'Auto-approval withdrawal details',
  订单信息: 'Order info',
  免审规则匹配: 'Auto-rule match',
  符合规则: 'Matching rule',
  VIP等级: 'VIP level',
  账户注册: 'Account registration',
  充值次数: 'Deposit count',
  次: 'times',
  提现信息: 'Withdrawal info',
  提现金额: 'Withdrawal amount',
  收款账户: 'Receiving account',
  收款人: 'Payee',
  立即自动出款: 'Process auto payout now',
  自动出款: 'Auto payout',
  前台备注: 'Frontend remark',
  后台备注: 'Backend remark',
  免审订单: 'Auto-approved order',
  免审规则: 'Auto-approval rule',
  系统: 'System',
  未锁定: 'Unlocked',
  默认层级: 'Default tier',
  完成时长: 'Completion duration',
  '(汇率)': '(Exchange rate)',
  实际到账: 'Actual received',
  人工出款: 'Manual payout',
  导出搜索功能开发中: 'Export search feature in development',
  暂无符合免审条件的订单: 'No orders eligible for auto-approval',
  获取数据失败，请稍后重试: 'Failed to fetch data, please retry',
  成功自动处理提现申请: 'Withdrawal auto-processed successfully',
  自动处理失败: 'Auto-process failed',
  批量自动处理失败: 'Bulk auto-process failed',
  自动审核规则保存成功: 'Auto-approval rules saved',
  规则保存失败: 'Failed to save rules',
  待自动审核: 'Pending auto-approval',
  提现成功: 'Withdrawal successful',
  自动处理中: 'Auto-processing',
  自动失败: 'Auto-failed',
  待处理: 'Pending',
  处理中: 'Processing',
  重新代付: 'Re-payout',
  '回调异常订单(含重新代付)': 'Callback exception orders (incl. re-payout)',
  回调状态: 'Callback status',
  代付类型: 'Payout type',
  异常订单: 'Exception orders',
  异常订单总数: 'Total exception orders',
  待重新代付: 'Pending re-payout',
  重新代付成功: 'Re-payout successful',
  批量重新代付: 'Bulk re-payout',
  全部充值: 'All recharges',
  充值统计: 'Recharge statistics',
  创建补单: 'Create supplementary order',
  充值总计: 'Recharge total',
  充值锁定: 'Recharge locked',
  充值确认: 'Recharge confirmed',
  充值失败: 'Recharge failed',
  不自动刷新: 'No auto refresh',
  操作教程: 'Operation guide',
  充值记录: 'Recharge records',
  宽松显示: 'Comfortable view',
  紧凑显示: 'Compact view',
  财务管理: 'Finance management',
  在线充值: 'Online recharge',
  提现管理: 'Withdrawal management',
  全部订单: 'All orders',
  '开始日期 - 结束日期': 'Start date - End date',
  '会员账号、订单号、会员ID': 'Member account, order no., member ID',
  充值面额: 'Recharge denomination',
  通道名称: 'Channel name',
  充值状态: 'Recharge status',
  创建在线订单: 'Create online order',
  导出数据: 'Export data',
  列配置: 'Column config',
  风控审核: 'Risk control review',
  投注稽核: 'Wagering audit',
  出款设置: 'Withdrawal settings',
  自动出款设置: 'Auto withdrawal settings',
};

// Generate Vietnamese from English (basic mapping for common terms)
function enToVi(en) {
  const viMap = {
    'Payment Statistics': 'Thống kê thanh toán hộ',
    'Third-party Payout': 'Thanh toán hộ bên thứ ba',
    Search: 'Tìm kiếm',
    Refresh: 'Làm mới',
    Reset: 'Đặt lại',
    Cancel: 'Hủy',
    Confirm: 'Xác nhận',
    Delete: 'Xóa',
    Save: 'Lưu',
    Status: 'Trạng thái',
    Remark: 'Ghi chú',
    Detail: 'Chi tiết',
    Edit: 'Sửa',
    Actions: 'Thao tác',
    Currency: 'Loại tiền',
    'Order No.': 'Mã đơn hàng',
    'Member Account': 'Tài khoản thành viên',
    Amount: 'Số tiền',
    Success: 'Thành công',
    Failed: 'Thất bại',
    Loading: 'Đang tải...',
    'No Data': 'Không có dữ liệu',
    Enable: 'Bật',
    Disable: 'Tắt',
    Close: 'Đóng',
    Today: 'Hôm nay',
    'This Month': 'Tháng này',
    All: 'Tất cả',
  };
  return viMap[en] || en;
}

function translateZh(zh) {
  if (COMMON_MAP[zh]) return null;
  if (EN_MAP[zh]) return EN_MAP[zh];
  // Fallback: use zh as placeholder for en (will need manual fix)
  return zh;
}

function ensureImport(content) {
  if (content.includes("import { $t } from '@vben/locales'")) return content;
  const scriptIdx = content.indexOf('<script setup');
  if (scriptIdx === -1) return content;
  const setupEnd = content.indexOf('>', scriptIdx);
  const importBlock = "\nimport { $t } from '@vben/locales';\n";
  return content.slice(0, setupEnd + 1) + importBlock + content.slice(setupEnd + 1);
}

function replaceString(content, oldFull, newVal) {
  return content.split(oldFull).join(newVal);
}

function processFile(filename) {
  const filePath = path.join(financeDir, filename);
  let content = fs.readFileSync(filePath, 'utf8');
  const extracted = extractStrings(content);
  const usedKeys = new Set();

  // Sort by length descending to avoid partial replacements
  const unique = [...new Map(extracted.map((e) => [e.text, e])).values()].sort(
    (a, b) => b.text.length - a.text.length,
  );

  for (const { text, full } of unique) {
    if (!hasChinese(text)) continue;

    const commonKey = COMMON_MAP[text];
    let replacement;

    if (commonKey) {
      replacement = `$t('${commonKey}')`;
    } else {
      const en = translateZh(text);
      if (!en || en === text) continue;
      let key = toCamelCase(en);
      if (!key) key = `key${Math.abs(hashCode(text))}`;
      if (usedKeys.has(key)) {
        key = `${key}${Math.abs(hashCode(text)) % 1000}`;
      }
      usedKeys.add(key);
      FINANCE_KEYS[key] = { en, zh: text, vi: enToVi(en) };
      replacement = `$t('finance.${key}')`;
    }

    // Determine context for replacement
    const idx = content.indexOf(full);
    if (idx === -1) continue;
    const before = content.slice(Math.max(0, idx - 30), idx);
    const after = content.slice(idx + full.length, idx + full.length + 5);

    let newFull;
    if (/:\s*$/.test(before) || /=\s*$/.test(before)) {
      // attribute or assignment value
      newFull = replacement;
    } else if (/message\.(error|success|warning|info)\(\s*$/.test(before)) {
      newFull = replacement;
    } else if (/label:\s*$/.test(before) || /title:\s*$/.test(before)) {
      newFull = replacement;
    } else {
      newFull = replacement;
    }

    if (full.startsWith("'") || full.startsWith('"')) {
      content = replaceString(content, full, newFull);
    }
  }

  content = ensureImport(content);
  return content;
}

function hashCode(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

const FINANCE_KEYS = {};

// Load extended translations from external file if exists
const extPath = path.join(__dirname, 'finance-translations-ext.json');
if (fs.existsSync(extPath)) {
  Object.assign(EN_MAP, JSON.parse(fs.readFileSync(extPath, 'utf8')));
}

const files = fs.readdirSync(financeDir).filter((f) => f.endsWith('.vue'));
for (const f of files) {
  const out = processFile(f);
  fs.writeFileSync(path.join(financeDir, f), out, 'utf8');
  console.log('Processed:', f);
}

// Write locale files
const enFinance = {};
const zhFinance = {};
const viFinance = {};
for (const [key, val] of Object.entries(FINANCE_KEYS)) {
  enFinance[key] = val.en;
  zhFinance[key] = val.zh;
  viFinance[key] = val.vi;
}

for (const [lang, data] of [
  ['en-US', enFinance],
  ['zh-CN', zhFinance],
  ['vi-VN', viFinance],
]) {
  const outPath = path.join(localesDir, lang, 'finance.json');
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${outPath} (${Object.keys(data).length} keys)`);
}

console.log('Done. Total finance keys:', Object.keys(FINANCE_KEYS).length);
