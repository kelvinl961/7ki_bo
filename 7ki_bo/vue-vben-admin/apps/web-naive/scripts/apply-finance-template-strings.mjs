/**
 * Apply i18n to remaining hardcoded Chinese strings in finance Vue templates.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const financeDir = path.join(__dirname, '../src/views/finance');

const REPLACEMENTS = [
  // Selection / pagination summaries
  [
    /已选择\s*\{\{\s*selectedIds\.length\s*\}\}\s*条数据，共\s*\n\s*\{\{\s*paginationReactive\.total\s*\}\}\s*条/g,
    `{{ $t('finance.selectedOfTotal', { selected: selectedIds.length, total: paginationReactive.total }) }}`,
  ],
  [
    /已选择\s*\{\{\s*selectedCount\s*\}\}\s*条数据，共\s*\n?\s*\{\{\s*paginationReactive\.total\s*\}\}\s*条/g,
    `{{ $t('finance.selectedOfTotal', { selected: selectedCount, total: paginationReactive.total }) }}`,
  ],
  [
    />已选择\s*\{\{\s*selectedCount\s*\}\}\s*条数据</g,
    `>{{ $t('finance.selectedRecords', { count: selectedCount }) }}<`,
  ],
  [
    />已选择\s*\{\{\s*selectedIds\.length\s*\}\}\s*条数据</g,
    `>{{ $t('finance.selectedRecords', { count: selectedIds.length }) }}<`,
  ],
  [
    />共\s*\{\{\s*paginationReactive\.total\s*\}\}\s*条</g,
    `>{{ $t('finance.totalRecordsCompact', { count: paginationReactive.total }) }}<`,
  ],
  [
    />共\s*\{\{\s*summary\.totalCount\s*\}\}\s*条</g,
    `>{{ $t('finance.totalRecordsCompact', { count: summary.totalCount }) }}<`,
  ],
  [
    />总计:\s*\{\{\s*summary\.totalCount\s*\}\}\s*条</g,
    `>{{ $t('finance.totalAmountLabel') }}: {{ summary.totalCount }}<`,
  ],
  [
    />总计:\s*\{\{\s*totalAmount\.toFixed\(2\)\s*\}\}</g,
    `>{{ $t('finance.totalAmountLabel') }}: {{ totalAmount.toFixed(2) }}<`,
  ],
  [
    /批量操作\s*\(\{\{\s*checkedRowKeys\.length\s*\}\}\)/g,
    `{{ $t('finance.bulkOperationWithCount', { count: checkedRowKeys.length }) }}`,
  ],
  [
    /批量处理\s*\(\{\{\s*selectedCount\s*\}\}\)/g,
    `{{ $t('finance.bulkProcessWithCount', { count: selectedCount }) }}`,
  ],
  [
    /批量取消\s*\(\{\{\s*selectedCount\s*\}\}\)/g,
    `{{ $t('finance.bulkCancelWithCount', { count: selectedCount }) }}`,
  ],
  [
    /导出选中\s*\(\{\{\s*selectedCount\s*\}\}\)/g,
    `{{ $t('finance.exportSelectedWithCount', { count: selectedCount }) }}`,
  ],
  [
    /共\s*\{\{\s*categoryPaginationReactive\.total\s*\}\}\s*条记录/g,
    `{{ $t('finance.totalRecordsWithCount', { count: categoryPaginationReactive.total }) }}`,
  ],
  [
    /共\s*\{\{\s*channelPaginationReactive\.total\s*\}\}\s*条记录/g,
    `{{ $t('finance.totalRecordsWithCount', { count: channelPaginationReactive.total }) }}`,
  ],
  // Auto withdrawal labels
  [/>(符合免审条件):/g, `>{{ $t('finance.meetsAutoApproval') }}:`],
  [/>(今日已自动处理):/g, `>{{ $t('finance.autoProcessedToday') }}:`],
  [/>(累计金额):/g, `>{{ $t('finance.cumulativeAmount') }}:`],
  [/<strong>订单号:<\/strong>/g, `<strong>{{ $t('finance.orderNo') }}:</strong>`],
  [/<strong>会员:<\/strong>/g, `<strong>{{ $t('finance.member') }}:</strong>`],
  [/<strong>金额:<\/strong>/g, `<strong>{{ $t('common.amount') }}:</strong>`],
  [/<strong>符合规则:<\/strong>/g, `<strong>{{ $t('finance.meetsRule') }}:</strong>`],
  [/<span class="text-gray-600">订单号:<\/span>/g, `<span class="text-gray-600">{{ $t('finance.orderNo') }}:</span>`],
  [/<span class="text-gray-600">会员账号:<\/span>/g, `<span class="text-gray-600">{{ $t('common.memberAccount') }}:</span>`],
  [/<span class="text-gray-600">申请时间:<\/span>/g, `<span class="text-gray-600">{{ $t('finance.applyTime') }}:</span>`],
  [/<span class="text-gray-600">订单状态:<\/span>/g, `<span class="text-gray-600">{{ $t('common.orderStatus') }}:</span>`],
  [/<span class="text-gray-600">符合规则:<\/span>/g, `<span class="text-gray-600">{{ $t('finance.meetsRule') }}:</span>`],
  [/<span class="text-gray-600">VIP等级:<\/span>/g, `<span class="text-gray-600">{{ $t('finance.vIPLevel') }}:</span>`],
  [/<span class="text-gray-600">账户注册:<\/span>/g, `<span class="text-gray-600">{{ $t('finance.accountRegistration') }}:</span>`],
  [/<span class="text-gray-600">充值次数:<\/span>/g, `<span class="text-gray-600">{{ $t('finance.depositCount') }}:</span>`],
  [/<span class="text-gray-600">提现金额:<\/span>/g, `<span class="text-gray-600">{{ $t('finance.withdrawalAmount') }}:</span>`],
  [/<span class="text-gray-600">提现方式:<\/span>/g, `<span class="text-gray-600">{{ $t('finance.withdrawalMethod') }}:</span>`],
  [/<span class="text-gray-600">收款账户:<\/span>/g, `<span class="text-gray-600">{{ $t('finance.receivingAccount') }}:</span>`],
  [/<span class="text-gray-600">收款人:<\/span>/g, `<span class="text-gray-600">{{ $t('finance.payee') }}:</span>`],
  [/<strong>收款方式:<\/strong>/g, `<strong>{{ $t('finance.paymentMethod') }}:</strong>`],
  // Table headers
  [/<th[^>]*>品牌名称\(ID\)<\/th>/g, `<th class="whitespace-nowrap px-3 py-2 text-left font-medium">{{ $t('finance.brandNameId') }}</th>`],
  [/<th[^>]*>会员ID<\/th>/g, `<th class="whitespace-nowrap px-3 py-2 text-left font-medium">{{ $t('finance.memberId') }}</th>`],
  // Cancel reason labels
  [/<span>取消原因\(前台展示\)<\/span>/g, `<span>{{ $t('finance.cancelReasonFrontend') }}</span>`],
  [/<span>取消原因\(后台展示\)<\/span>/g, `<span>{{ $t('finance.cancelReasonBackend') }}</span>`],
  [/<span class="text-xs text-gray-500">最多1000字<\/span>/g, `<span class="text-xs text-gray-500">{{ $t('finance.max1000Chars') }}</span>`],
  // Third party payment status
  [/\{ default: \(\) => \(row\.enabled \? '启用' : '停用'\) \}/g,
    `{ default: () => (row.enabled ? $t('common.enable') : $t('common.disable')) }`],
];

/** Common field labels: Chinese -> i18n key */
const FIELD_LABELS = {
  会员ID: 'finance.memberId',
  会员账号: 'common.memberAccount',
  币种: 'common.currency',
  账户余额: 'finance.accountBalance',
  VIP等级: 'finance.vIPLevel',
  状态: 'common.status',
  预计到账: 'finance.estimatedArrival',
  提现前余额: 'finance.balanceBeforeWithdrawal',
  提现后余额: 'finance.balanceAfterWithdrawal',
  收款方式: 'finance.receivingMethod',
  银行名称: 'finance.bankName',
  账户号码: 'finance.accountNumber',
  持卡人: 'finance.cardholder',
  风险等级: 'finance.riskLevel',
  风险评分: 'finance.riskScore',
  风险标记: 'finance.riskFlag',
  重复IP人数: 'finance.duplicateIpCount',
  回调状态: 'finance.callbackStatus',
  异常原因: 'finance.abnormalReason',
  重试次数: 'finance.retryCount',
  最后重试: 'finance.lastRetry',
  代付金额: 'finance.payoutAmount',
  代付通道: 'finance.payoutChannel',
  第三方订单号: 'finance.thirdPartyOrderNo',
  充值面额合计: 'finance.rechargeDenominationTotal',
  真实姓名: 'finance.realName',
  '账号/地址': 'finance.accountOrAddress',
  类型: 'common.type',
  电话: 'common.phone',
  邮箱: 'common.email',
  异常订单总数: 'finance.abnormalOrderTotal',
  待重新代付: 'finance.pendingRepayment',
  重新代付成功: 'finance.repaymentSuccess',
};

for (const [zh, key] of Object.entries(FIELD_LABELS)) {
  const esc = zh.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  REPLACEMENTS.push([
    new RegExp(`(<span class="text-gray-600">)${esc}([：:])</span>`, 'g'),
    `$1{{ $t('${key}') }}$2</span>`,
  ]);
  REPLACEMENTS.push([
    new RegExp(`(<span class="info-label">)${esc}(</span>)`, 'g'),
    `$1{{ $t('${key}') }}$2`,
  ]);
  REPLACEMENTS.push([
    new RegExp(`(<strong>)${esc}([：:])</strong>`, 'g'),
    `$1{{ $t('${key}') }}$2</strong>`,
  ]);
  REPLACEMENTS.push([new RegExp(`>${esc}([：:])`, 'g'), `>{{ $t('${key}') }}$1`]);
}

REPLACEMENTS.push(
  [
    /<p class="mt-1 text-sm text-gray-600">回调异常订单\(含重新代付\)<\/p>/,
    `<p class="mt-1 text-sm text-gray-600">{{ $t('finance.callbackAbnormalOrders') }}</p>`,
  ],
  [
    /\{ default: \(\) => \(row\.isLocked \? '解锁' : '锁定'\) \}/g,
    `{ default: () => (row.isLocked ? $t('common.unlock') : $t('common.lock')) }`,
  ],
  [
    /\{ default: \(\) => row\.callbackStatus \|\| '异常' \}/g,
    `{ default: () => row.callbackStatus || $t('finance.abnormal') }`,
  ],
);

const NEW_KEYS = {
  bulkProcessWithCount: { en: 'Bulk Process ({count})', zh: '批量处理 ({count})', vi: 'Xử lý hàng loạt ({count})' },
  bulkCancelWithCount: { en: 'Bulk Cancel ({count})', zh: '批量取消 ({count})', vi: 'Hủy hàng loạt ({count})' },
  exportSelectedWithCount: { en: 'Export Selected ({count})', zh: '导出选中 ({count})', vi: 'Xuất đã chọn ({count})' },
  totalRecordsWithCount: { en: '{count} records total', zh: '共 {count} 条记录', vi: 'Tổng {count} bản ghi' },
  meetsAutoApproval: { en: 'Meets auto-approval criteria', zh: '符合免审条件', vi: 'Đủ điều kiện tự duyệt' },
  autoProcessedToday: { en: 'Auto-processed today', zh: '今日已自动处理', vi: 'Đã tự xử lý hôm nay' },
  cumulativeAmount: { en: 'Cumulative amount', zh: '累计金额', vi: 'Số tiền tích lũy' },
  member: { en: 'Member', zh: '会员', vi: 'Thành viên' },
  meetsRule: { en: 'Meets rule', zh: '符合规则', vi: 'Đủ quy tắc' },
  applyTime: { en: 'Apply time', zh: '申请时间', vi: 'Thời gian đăng ký' },
  accountRegistration: { en: 'Account registration', zh: '账户注册', vi: 'Đăng ký tài khoản' },
  depositCount: { en: 'Deposit count', zh: '充值次数', vi: 'Số lần nạp' },
  withdrawalAmount: { en: 'Withdrawal amount', zh: '提现金额', vi: 'Số tiền rút' },
  withdrawalMethod: { en: 'Withdrawal method', zh: '提现方式', vi: 'Phương thức rút' },
  receivingAccount: { en: 'Receiving account', zh: '收款账户', vi: 'Tài khoản nhận' },
  payee: { en: 'Payee', zh: '收款人', vi: 'Người nhận' },
  paymentMethod: { en: 'Payment method', zh: '收款方式', vi: 'Phương thức thanh toán' },
  brandNameId: { en: 'Brand Name (ID)', zh: '品牌名称(ID)', vi: 'Tên thương hiệu (ID)' },
  cancelReasonFrontend: { en: 'Cancel reason (shown to user)', zh: '取消原因(前台展示)', vi: 'Lý do hủy (hiển thị)' },
  cancelReasonBackend: { en: 'Cancel reason (internal)', zh: '取消原因(后台展示)', vi: 'Lý do hủy (nội bộ)' },
  max1000Chars: { en: 'Max 1000 characters', zh: '最多1000字', vi: 'Tối đa 1000 ký tự' },
  accountBalance: { en: 'Account balance', zh: '账户余额', vi: 'Số dư tài khoản' },
  estimatedArrival: { en: 'Estimated arrival', zh: '预计到账', vi: 'Dự kiến nhận' },
  balanceBeforeWithdrawal: { en: 'Balance before withdrawal', zh: '提现前余额', vi: 'Số dư trước rút' },
  balanceAfterWithdrawal: { en: 'Balance after withdrawal', zh: '提现后余额', vi: 'Số dư sau rút' },
  bankName: { en: 'Bank name', zh: '银行名称', vi: 'Tên ngân hàng' },
  accountNumber: { en: 'Account number', zh: '账户号码', vi: 'Số tài khoản' },
  cardholder: { en: 'Cardholder', zh: '持卡人', vi: 'Chủ thẻ' },
  riskScore: { en: 'Risk score', zh: '风险评分', vi: 'Điểm rủi ro' },
  riskFlag: { en: 'Risk flag', zh: '风险标记', vi: 'Cờ rủi ro' },
  duplicateIpCount: { en: 'Duplicate IP count', zh: '重复IP人数', vi: 'Số IP trùng' },
  abnormalReason: { en: 'Abnormal reason', zh: '异常原因', vi: 'Lý do bất thường' },
  retryCount: { en: 'Retry count', zh: '重试次数', vi: 'Số lần thử lại' },
  lastRetry: { en: 'Last retry', zh: '最后重试', vi: 'Lần thử cuối' },
  payoutAmount: { en: 'Payout amount', zh: '代付金额', vi: 'Số tiền chi' },
  payoutChannel: { en: 'Payout channel', zh: '代付通道', vi: 'Kênh chi' },
  thirdPartyOrderNo: { en: 'Third-party order no.', zh: '第三方订单号', vi: 'Mã đơn bên thứ ba' },
  rechargeDenominationTotal: { en: 'Recharge denomination total', zh: '充值面额合计', vi: 'Tổng mệnh giá nạp' },
  realName: { en: 'Real name', zh: '真实姓名', vi: 'Tên thật' },
  accountOrAddress: { en: 'Account/Address', zh: '账号/地址', vi: 'Tài khoản/Địa chỉ' },
  abnormalOrderTotal: { en: 'Total abnormal orders', zh: '异常订单总数', vi: 'Tổng đơn bất thường' },
  pendingRepayment: { en: 'Pending re-payout', zh: '待重新代付', vi: 'Chờ chi lại' },
  repaymentSuccess: { en: 'Re-payout success', zh: '重新代付成功', vi: 'Chi lại thành công' },
  callbackAbnormalOrders: { en: 'Callback abnormal orders (incl. re-payout)', zh: '回调异常订单(含重新代付)', vi: 'Đơn callback bất thường (gồm chi lại)' },
  abnormal: { en: 'Abnormal', zh: '异常', vi: 'Bất thường' },
};

const localesDir = path.join(__dirname, '../src/locales/langs');
for (const [key, vals] of Object.entries(NEW_KEYS)) {
  for (const [lang, file] of [
    ['en-US', vals.en],
    ['zh-CN', vals.zh],
    ['vi-VN', vals.vi],
  ]) {
    const fp = path.join(localesDir, lang, 'finance.json');
    const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
    if (!data[key]) data[key] = file;
    fs.writeFileSync(fp, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  }
}

let total = 0;
for (const file of fs.readdirSync(financeDir).filter((f) => f.endsWith('.vue') && !f.includes('Updated'))) {
  const fp = path.join(financeDir, file);
  let content = fs.readFileSync(fp, 'utf8');
  const templateEnd = content.indexOf('\n</template>');
  if (templateEnd === -1) continue;
  let template = content.slice(0, templateEnd + '\n</template>'.length);
  const rest = content.slice(templateEnd + '\n</template>'.length);
  let changed = 0;
  for (const [re, repl] of REPLACEMENTS) {
    const before = template;
    template = template.replace(re, repl);
    if (template !== before) changed++;
  }
  if (changed) {
    fs.writeFileSync(fp, template + rest, 'utf8');
    console.log(`${file}: ${changed} pattern groups applied`);
    total += changed;
  }
}

console.log(`Done. ${total} total pattern groups across files.`);
