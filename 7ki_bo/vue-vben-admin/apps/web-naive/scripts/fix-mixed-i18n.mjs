/**
 * Fix mixed Chinese + interpolation patterns across finance views.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/views/finance');
const localesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/locales/langs');

const extraKeys = {
  totalStatisticsRecords: { en: 'Total {count} statistics records', zh: '共 {count} 条统计记录', vi: 'Tổng {count} bản ghi thống kê' },
  totalPayoutMerchants: { en: 'Total {count} payout merchants', zh: '共 {count} 个代付商户', vi: 'Tổng {count} đại lý chi hộ' },
  selectedRecords: { en: 'Selected {count} records', zh: '已选择 {count} 条数据', vi: 'Đã chọn {count} bản ghi' },
  selectedOfTotal: { en: 'Selected {selected} of {total} records', zh: '已选择 {selected} 条数据，共 {total} 条', vi: 'Đã chọn {selected}/{total} bản ghi' },
  selectedRecordsCompact: { en: 'Selected{count} records', zh: '已选择{count}条数据', vi: 'Đã chọn{count} bản ghi' },
  totalRecordsCompact: { en: 'Total{count} records', zh: '共{count}条', vi: 'Tổng{count} bản ghi' },
  bulkAutoPayoutCount: { en: 'Bulk auto payout ({count})', zh: '批量自动出款 ({count})', vi: 'Chi tự động hàng loạt ({count})' },
  bulkOperationWithCount: { en: 'Bulk operation ({count})', zh: '批量操作 ({count})', vi: 'Thao tác hàng loạt ({count})' },
  confirmAutoProcessCount: { en: 'Confirm auto-process {count} eligible withdrawal applications?', zh: '确认自动处理以下{count}个符合免审条件的提现申请？', vi: 'Xác nhận tự động xử lý {count} đơn rút đủ điều kiện miễn duyệt?' },
  accountAgeDays: { en: '{count} days', zh: '{count}天', vi: '{count} ngày' },
  depositCountTimes: { en: '{count} times', zh: '{count}次', vi: '{count} lần' },
  actualReceivedAmount: { en: 'Actual received: {amount}', zh: '实际到账: {amount}', vi: 'Thực nhận: {amount}' },
  accountNumberLabel: { en: 'Account: {account}', zh: '账号: {account}', vi: 'Tài khoản: {account}' },
  accountHolderLabel: { en: 'Name: {name}', zh: '姓名: {name}', vi: 'Tên: {name}' },
  availableBalance: { en: 'Available: {amount}', zh: '可用: {amount}', vi: 'Khả dụng: {amount}' },
  frozenBalance: { en: 'Frozen: {amount}', zh: '冻结: {amount}', vi: 'Đóng băng: {amount}' },
  neverWithdrawnLabel: { en: 'Never withdrawn: {count}', zh: '未提现: {count}', vi: 'Chưa rút: {count}' },
  firstWithdrawnLabel: { en: 'First time: {count}', zh: '首次: {count}', vi: 'Lần đầu: {count}' },
  multipleWithdrawnLabel: { en: 'Multiple: {count}', zh: '多次: {count}', vi: 'Nhiều lần: {count}' },
  deleteProviderConfirm: { en: 'Confirm delete third-party payout merchant "{name}"? Cannot be recovered.', zh: '确认删除三方代付商户 "{name}"？删除后无法恢复。', vi: 'Xác nhận xóa đại lý chi hộ "{name}"? Không thể khôi phục.' },
  saveFailedWithError: { en: 'Save failed: {error}', zh: '保存失败: {error}', vi: 'Lưu thất bại: {error}' },
  autoRefreshEnabled: { en: 'Auto-refresh enabled, every {seconds} seconds', zh: '已启用自动更新，每{seconds}秒刷新一次', vi: 'Đã bật tự động làm mới, mỗi {seconds} giây' },
  refreshIntervalChanged: { en: 'Refresh interval changed to {seconds} seconds', zh: '刷新间隔已更改为{seconds}秒', vi: 'Khoảng làm mới đã đổi thành {seconds} giây' },
  autoProcessSuccessCount: { en: 'Successfully auto-processed {count} eligible withdrawal applications', zh: '成功自动处理 {count} 个符合免审条件的提现申请', vi: 'Đã tự động xử lý {count} đơn rút đủ điều kiện' },
  autoProcessSimulatedCount: { en: 'Successfully auto-processed {count} withdrawal applications (simulated)', zh: '成功自动处理 {count} 个提现申请 (模拟)', vi: 'Đã tự động xử lý {count} đơn rút (mô phỏng)' },
  viewPayoutStatsDesc: { en: 'View third-party payout success count and success rate', zh: '查看对应三方代付出款的成功总数、成功率', vi: 'Xem tổng số và tỷ lệ thành công chi hộ bên thứ ba' },
  thirdPartyMerchantMgmt: { en: 'Third-party payout merchant management (withdrawal/payout)', zh: '第三方代付商户管理 (提现/出款)', vi: 'Quản lý đại lý chi hộ bên thứ ba (rút/chi)' },
  eligibleForAutoApproval: { en: 'Eligible for auto-approval:', zh: '符合免审条件:', vi: 'Đủ điều kiện miễn duyệt:' },
  autoProcessedToday: { en: 'Auto-processed today:', zh: '今日已自动处理:', vi: 'Đã tự động xử lý hôm nay:' },
  cumulativeAmount: { en: 'Cumulative amount:', zh: '累计金额:', vi: 'Số tiền tích lũy:' },
  exportSearch: { en: 'Export search', zh: '导出搜索', vi: 'Xuất kết quả tìm kiếm' },
  saveRules: { en: 'Save rules', zh: '保存规则', vi: 'Lưu quy tắc' },
  processAutoPayoutNow: { en: 'Process auto payout now', zh: '立即自动出款', vi: 'Chi tự động ngay' },
  autoApprovalConditionsDesc: { en: 'Exemption: member tier, tags, registration duration, amount limits, etc.', zh: '免审条件：同时满足设置的会员层级、标签、注册时长、金额限制等条件', vi: 'Miễn duyệt: cấp thành viên, nhãn, thời gian đăng ký, giới hạn số tiền' },
  autoApprovalProcessDesc: { en: 'Auto-process withdrawals meeting exemption criteria', zh: '符合免审条件的提现订单自动处理', vi: 'Tự động xử lý đơn rút đáp ứng điều kiện miễn duyệt' },
  autoApprovalRulesDesc: { en: 'Set conditions for auto-approved withdrawals', zh: '设置符合免审出款的条件，满足条件的提现申请将自动通过审核', vi: 'Thiết lập điều kiện rút tiền miễn duyệt' },
  vipLevelLabel: { en: 'VIP Level:', zh: 'VIP等级:', vi: 'Cấp VIP:' },
  financePayout: { en: 'Finance Payout', zh: '财务出款', vi: 'Chi tài chính' },
  myPayout: { en: 'My Payout', zh: '我的出款', vi: 'Chi hộ của tôi' },
  assignToMe: { en: 'Assign to me', zh: '分配给我', vi: 'Giao cho tôi' },
  selectAllCurrentPage: { en: 'Select all on page', zh: '全选当前页', vi: 'Chọn tất cả trang này' },
  bulkLock: { en: 'Bulk lock', zh: '批量锁定', vi: 'Khóa hàng loạt' },
  columnConfig: { en: 'Column config', zh: '列配置', vi: 'Cấu hình cột' },
  addMerchant: { en: 'Add merchant', zh: '新增商户', vi: 'Thêm đại lý' },
};

for (const [lang, field] of [['en-US', 'en'], ['zh-CN', 'zh'], ['vi-VN', 'vi']]) {
  const fp = path.join(localesDir, lang, 'finance.json');
  const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
  for (const [k, v] of Object.entries(extraKeys)) data[k] = v[field];
  fs.writeFileSync(fp, JSON.stringify(data, null, 2) + '\n');
}

const replacements = [
  ['查看对应三方代付出款的成功总数、成功率', "{{ $t('finance.viewPayoutStatsDesc') }}"],
  ['第三方代付商户管理 (提现/出款)', "{{ $t('finance.thirdPartyMerchantMgmt') }}"],
  ['符合免审条件的提现订单自动处理', "{{ $t('finance.autoApprovalProcessDesc') }}"],
  ['免审条件：同时满足设置的会员层级、标签、注册时长、金额限制等条件', "{{ $t('finance.autoApprovalConditionsDesc') }}"],
  ['设置符合免审出款的条件，满足条件的提现申请将自动通过审核', "{{ $t('finance.autoApprovalRulesDesc') }}"],
  ['共 {{ paginationReactive.total }} 条统计记录', "{{ $t('finance.totalStatisticsRecords', { count: paginationReactive.total }) }}"],
  ['共 {{ paginationReactive.total }} 个代付商户', "{{ $t('finance.totalPayoutMerchants', { count: paginationReactive.total }) }}"],
  ['已选择 {{ selectedIds.length }} 条数据', "{{ $t('finance.selectedRecords', { count: selectedIds.length }) }}"],
  ['已选择 {{ selectedCount }} 条数据，共', "{{ $t('finance.selectedOfTotal', { selected: selectedCount, total: paginationReactive.total }) }}"],
  ['{{ paginationReactive.total }} 条', ''],
  ['已选择{{ selectedIds.length }}条数据', "{{ $t('finance.selectedRecordsCompact', { count: selectedIds.length }) }}"],
  ['共{{ paginationReactive.total }}条', "{{ $t('finance.totalRecordsCompact', { count: paginationReactive.total }) }}"],
  ['批量自动出款 ({{ selectedCount }})', "{{ $t('finance.bulkAutoPayoutCount', { count: selectedCount }) }}"],
  ['批量操作 ({{ selectedIds.length }})', "{{ $t('finance.bulkOperationWithCount', { count: selectedIds.length }) }}"],
  ['>符合免审条件:', ">{{ $t('finance.eligibleForAutoApproval') }}"],
  ['>今日已自动处理:', ">{{ $t('finance.autoProcessedToday') }}"],
  ['>累计金额:', ">{{ $t('finance.cumulativeAmount') }}"],
  ['导出搜索', "{{ $t('finance.exportSearch') }}"],
  ['保存规则', "{{ $t('finance.saveRules') }}"],
  ['立即自动出款', "{{ $t('finance.processAutoPayoutNow') }}"],
  ['列配置', "{{ $t('finance.columnConfig') }}"],
  ['新增商户', "{{ $t('finance.addMerchant') }}"],
  ['高级搜索', "{{ $t('common.advancedSearch') }}"],
  ['我的出款', "{{ $t('finance.myPayout') }}"],
  ['分配给我', "{{ $t('finance.assignToMe') }}"],
  ['全选当前页', "{{ $t('finance.selectAllCurrentPage') }}"],
  ["'财务出款'", "$t('finance.financePayout')"],
  ['<span class="text-gray-600">VIP等级:</span>', '<span class="text-gray-600">{{ $t(\'finance.vipLevelLabel\') }}</span>'],
  ['<span>{{ detailModal.data.accountAge }}天</span>', "<span>{{ $t('finance.accountAgeDays', { count: detailModal.data.accountAge }) }}</span>"],
  ['<span>{{ detailModal.data.depositCount }}次</span>', "<span>{{ $t('finance.depositCountTimes', { count: detailModal.data.depositCount }) }}</span>"],
  ['`未提现: ${row.memberStats.never}`', "$t('finance.neverWithdrawnLabel', { count: row.memberStats.never })"],
  ['`首次: ${row.memberStats.firstTime}`', "$t('finance.firstWithdrawnLabel', { count: row.memberStats.firstTime })"],
  ['`多次: ${row.memberStats.multiple}`', "$t('finance.multipleWithdrawnLabel', { count: row.memberStats.multiple })"],
  ['`可用: ${balance.balance?.toFixed(2) || \'0.00\'}`', "$t('finance.availableBalance', { amount: balance.balance?.toFixed(2) || '0.00' })"],
  ['`冻结: ${balance.frozenAmount?.toFixed(2) || \'0.00\'}`', "$t('finance.frozenBalance', { amount: balance.frozenAmount?.toFixed(2) || '0.00' })"],
  ['`实际到账: ${((row.amount || 0) - (row.fee || 0)).toFixed(2)}`', "$t('finance.actualReceivedAmount', { amount: ((row.amount || 0) - (row.fee || 0)).toFixed(2) })"],
  ['`充${row.rechargeWithdrawCount?.rechargeCount || 0}/提${row.rechargeWithdrawCount?.withdrawCount || 0}次`', "$t('finance.rechargeWithdrawTimes', { recharge: row.rechargeWithdrawCount?.rechargeCount || 0, withdraw: row.rechargeWithdrawCount?.withdrawCount || 0 })"],
  ['`账号: ${row.memberBankAccount || row.accountNumber || \'-\'}`', "$t('finance.accountNumberLabel', { account: row.memberBankAccount || row.accountNumber || '-' })"],
  ['`姓名: ${row.accountHolderName || row.memberName || \'-\'}`', "$t('finance.accountHolderLabel', { name: row.accountHolderName || row.memberName || '-' })"],
  ['content: `确认删除三方代付商户 "${provider.platformName}"？删除后无法恢复。`', "content: $t('finance.deleteProviderConfirm', { name: provider.platformName })"],
  ['message.error(`保存失败: ${error.message || \'未知错误\'}`)', "message.error($t('finance.saveFailedWithError', { error: error.message || $t('finance.unknownError') }))"],
  ['message.success(`已启用自动更新，每${refreshInterval.value}秒刷新一次`)', "message.success($t('finance.autoRefreshEnabled', { seconds: refreshInterval.value }))"],
  ['message.success(`刷新间隔已更改为${newInterval}秒`)', "message.success($t('finance.refreshIntervalChanged', { seconds: newInterval }))"],
  ['message.success(`成功自动处理 ${autoApprovalModal.items.length} 个符合免审条件的提现申请`)', "message.success($t('finance.autoProcessSuccessCount', { count: autoApprovalModal.items.length }))"],
  ['message.success(`成功自动处理 ${autoApprovalModal.items.length} 个提现申请 (模拟)`)', "message.success($t('finance.autoProcessSimulatedCount', { count: autoApprovalModal.items.length }))"],
  ["'批量锁定'", "$t('finance.bulkLock')"],
];

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.vue'))) {
  let c = fs.readFileSync(path.join(dir, f), 'utf8');
  for (const [from, to] of replacements) c = c.split(from).join(to);
  fs.writeFileSync(path.join(dir, f), c);
  console.log('Mixed fix:', f);
}
