/**
 * Second-pass: fix remaining Chinese in activity views + patch locale translations.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(__dirname, '..');
const activityRoot = path.join(appRoot, 'src/views/activity');
const localesDir = path.join(appRoot, 'src/locales/langs');

const EXTRA_KEYS = {
  totalRecords: { zh: '共 {0} 条', en: '{0} records total', vi: 'Tổng {0} bản ghi' },
  enabledAt: { zh: '开启时间：', en: 'Enabled at: ', vi: 'Thời gian bật: ' },
  selectedCount: {
    zh: '已选择 {0} 条数据，共 {1} 条',
    en: 'Selected {0} of {1} records',
    vi: 'Đã chọn {0}/{1} bản ghi',
  },
  selectedCountShort: {
    zh: '已选择 {0} 条数据 共 {1} 条',
    en: 'Selected {0} of {1} records',
    vi: 'Đã chọn {0}/{1} bản ghi',
  },
  totalRecordsLabel: { zh: '共 {0} 条记录', en: '{0} records total', vi: 'Tổng {0} bản ghi' },
  totalActiveReward: {
    zh: '已开启奖励合计: {0} BRL',
    en: 'Total active rewards: {0} BRL',
    vi: 'Tổng thưởng đang bật: {0} BRL',
  },
  batchErrors: { zh: '{0} 条错误', en: '{0} errors', vi: '{0} lỗi' },
  perTime: { zh: '/次', en: '/time', vi: '/lần' },
  tierLabel: { zh: '层级{0}', en: 'Tier {0}', vi: 'Cấp {0}' },
  startLabel: { zh: '开始：{0}', en: 'Start: {0}', vi: 'Bắt đầu: {0}' },
  endLabel: { zh: '结束：{0}', en: 'End: {0}', vi: 'Kết thúc: {0}' },
  participateLabel: { zh: '参与：{0}', en: 'Participants: {0}', vi: 'Tham gia: {0}' },
  limitLabel: { zh: '限制：{0}', en: 'Limit: {0}', vi: 'Giới hạn: {0}' },
  copyTitle: { zh: '{0} - 复制', en: '{0} - Copy', vi: '{0} - Sao chép' },
  auditMultiplierSuffix: { zh: '{0}倍', en: '{0}x', vi: '{0} lần' },
  allPlaceholder: { zh: '全部', en: 'All', vi: 'Tất cả' },
  batchOperation: { zh: '批量操作', en: 'Batch Operation', vi: 'Thao tác hàng loạt' },
  memberLabel: { zh: '会员', en: 'Member', vi: 'Thành viên' },
  timeLabel: { zh: '时间', en: 'Time', vi: 'Thời gian' },
  pfSettingsTitle: { zh: '公积金设置', en: 'Provident Fund Settings', vi: 'Cài đặt quỹ tích lũy' },
  pfEnabledOn: { zh: '已开启公积金统计', en: 'Provident fund tracking enabled', vi: 'Đã bật thống kê quỹ tích lũy' },
  pfDisabled: { zh: '已关闭公积金', en: 'Provident fund disabled', vi: 'Đã tắt quỹ tích lũy' },
  lwEnabledOn: { zh: '已开启幸运转盘', en: 'Lucky wheel enabled', vi: 'Đã bật vòng quay may mắn' },
  lwDisabled: { zh: '已关闭幸运转盘', en: 'Lucky wheel disabled', vi: 'Đã tắt vòng quay may mắn' },
  wheelEnabled: { zh: '转盘已开启', en: 'Wheel enabled', vi: 'Vòng quay đã bật' },
  wheelDisabled: { zh: '转盘已关闭', en: 'Wheel disabled', vi: 'Vòng quay đã tắt' },
  showLabel: { zh: '展示', en: 'Show', vi: 'Hiển thị' },
  hideLabel: { zh: '不展示', en: 'Hide', vi: 'Ẩn' },
  onLabel: { zh: '开', en: 'On', vi: 'Bật' },
  offLabel: { zh: '关', en: 'Off', vi: 'Tắt' },
  enabledTag: { zh: '启用', en: 'Enabled', vi: 'Đã bật' },
  disabledTag: { zh: '禁用', en: 'Disabled', vi: 'Đã tắt' },
  unlimited: { zh: '无限制', en: 'Unlimited', vi: 'Không giới hạn' },
  editTask: { zh: '编辑任务', en: 'Edit Task', vi: 'Chỉnh sửa nhiệm vụ' },
  noviceWelfareSettings: { zh: '新人福利设置', en: 'New Member Benefits Settings', vi: 'Cài đặt phúc lợi thành viên mới' },
  updateBtn: { zh: '更新', en: 'Update', vi: 'Cập nhật' },
  confirmBtn: { zh: '确定', en: 'Confirm', vi: 'Xác nhận' },
  batchEnable: { zh: '批量启用', en: 'Batch Enable', vi: 'Bật hàng loạt' },
  batchDisable: { zh: '批量禁用', en: 'Batch Disable', vi: 'Tắt hàng loạt' },
  noviceWelfareOn: { zh: '新人福利已开启', en: 'New member benefits enabled', vi: 'Đã bật phúc lợi thành viên mới' },
  noviceWelfareOff: { zh: '新人福利已关闭', en: 'New member benefits disabled', vi: 'Đã tắt phúc lợi thành viên mới' },
  taskOn: { zh: '任务已开启', en: 'Task enabled', vi: 'Đã bật nhiệm vụ' },
  taskOff: { zh: '任务已关闭', en: 'Task disabled', vi: 'Đã tắt nhiệm vụ' },
  bubbleOn: { zh: '提示气泡已开启', en: 'Tooltip bubble enabled', vi: 'Đã bật bong bóng gợi ý' },
  bubbleOff: { zh: '提示气泡已关闭', en: 'Tooltip bubble disabled', vi: 'Đã tắt bong bóng gợi ý' },
  batchEnableSuccess: { zh: '成功启用 {0} 个任务', en: 'Successfully enabled {0} tasks', vi: 'Đã bật {0} nhiệm vụ' },
  batchDisableSuccess: { zh: '成功禁用 {0} 个任务', en: 'Successfully disabled {0} tasks', vi: 'Đã tắt {0} nhiệm vụ' },
  editSuccess: { zh: '修改成功', en: 'Updated successfully', vi: 'Cập nhật thành công' },
  createSuccess: { zh: '新增成功', en: 'Created successfully', vi: 'Tạo thành công' },
  taskUpdateSuccess: { zh: '任务更新成功', en: 'Task updated successfully', vi: 'Cập nhật nhiệm vụ thành công' },
  taskCreateSuccess: { zh: '任务创建成功', en: 'Task created successfully', vi: 'Tạo nhiệm vụ thành công' },
  operationRetry: { zh: '操作失败，请重试', en: 'Operation failed, please retry', vi: 'Thao tác thất bại, vui lòng thử lại' },
  saveSettingsFailed: { zh: '保存设置失败，请重试', en: 'Failed to save settings, please retry', vi: 'Lưu cài đặt thất bại, vui lòng thử lại' },
  enterTaskCondition: { zh: '请输入任务条件', en: 'Please enter task conditions', vi: 'Vui lòng nhập điều kiện nhiệm vụ' },
  loadDataFailed: { zh: '加载数据失败: ', en: 'Failed to load data: ', vi: 'Tải dữ liệu thất bại: ' },
  editPf: { zh: '编辑公积金', en: 'Edit Provident Fund', vi: 'Chỉnh sửa quỹ tích lũy' },
  addPf: { zh: '新增公积金', en: 'Add Provident Fund', vi: 'Thêm quỹ tích lũy' },
  pfDisplayName: { zh: '公积金', en: 'Provident Fund', vi: 'Quỹ tích lũy' },
  distributeComplete: {
    zh: '派发完成：成功 {0} 人，失败 {1} 人',
    en: 'Distribution complete: {0} succeeded, {1} failed',
    vi: 'Phát thưởng xong: {0} thành công, {1} thất bại',
  },
  batchErrorWarning: {
    zh: '有 {0} 条数据存在错误，请修正后重新上传，或切换为"自动跳过错误"模式',
    en: '{0} rows have errors. Fix and re-upload, or switch to "Auto-skip errors" mode',
    vi: '{0} dòng có lỗi. Sửa và tải lại, hoặc chuyển sang chế độ "Tự động bỏ qua lỗi"',
  },
  distributeAllSuccess: { zh: '派发成功！共 {0} 人', en: 'Distributed successfully to {0} members', vi: 'Phát thưởng thành công cho {0} thành viên' },
  distributePartial: {
    zh: '部分派发成功：成功 {0} 人，失败 {1} 人',
    en: 'Partial success: {0} succeeded, {1} failed',
    vi: 'Thành công một phần: {0} thành công, {1} thất bại',
  },
  distributeFailed: { zh: '派发失败，请检查会员信息', en: 'Distribution failed, check member info', vi: 'Phát thưởng thất bại, kiểm tra thông tin thành viên' },
  missingMemberId: { zh: '缺少会员标识', en: 'Missing member identifier', vi: 'Thiếu định danh thành viên' },
  invalidRewardAmount: { zh: '奖励金额无效', en: 'Invalid reward amount', vi: 'Số tiền thưởng không hợp lệ' },
  invalidAuditMultiplier: { zh: '稽核倍数无效', en: 'Invalid audit multiplier', vi: 'Hệ số kiểm toán không hợp lệ' },
  unknownError: { zh: '未知错误', en: 'Unknown error', vi: 'Lỗi không xác định' },
  rewardAmountLabel: { zh: '* 奖励金额', en: '* Reward Amount', vi: '* Số tiền thưởng' },
  auditMultiplierLabel: { zh: '* 稽核倍数', en: '* Audit Multiplier', vi: '* Hệ số kiểm toán' },
  batchUploadLabel: { zh: '* 批量上传', en: '* Batch Upload', vi: '* Tải lên hàng loạt' },
  memberType: { zh: '会员类型', en: 'Member Type', vi: 'Loại thành viên' },
  accountType: { zh: '账号类型', en: 'Account Type', vi: 'Loại tài khoản' },
  multiAccountHint: { zh: '输入多条请用逗号拼接，最多支持200个会员账号', en: 'Separate multiple entries with commas, max 200 member accounts', vi: 'Nhập nhiều mục cách nhau bằng dấu phẩy, tối đa 200 tài khoản' },
  multiIdHint: { zh: '输入多条请用逗号拼接，最多支持200个会员ID', en: 'Separate multiple entries with commas, max 200 member IDs', vi: 'Nhập nhiều mục cách nhau bằng dấu phẩy, tối đa 200 ID thành viên' },
  readOnlyDetail: { zh: '详情', en: 'Details', vi: 'Chi tiết' },
  readOnlyModify: { zh: '修改', en: 'Modify', vi: 'Sửa' },
  readOnlyClose: { zh: '关闭', en: 'Close', vi: 'Đóng' },
  readOnlyCancel: { zh: '取消', en: 'Cancel', vi: 'Hủy' },
  statisticsDataCount: { zh: '共 {0} 条数据', en: '{0} records total', vi: 'Tổng {0} bản ghi' },
  loadStatisticsFailed: { zh: '加载活动统计数据失败: ', en: 'Failed to load activity statistics: ', vi: 'Tải thống kê hoạt động thất bại: ' },
};

const CYCLE_KEYS = {
  none: { zh: '不限制', en: 'No limit', vi: 'Không giới hạn' },
  monthly: { zh: '每月', en: 'Monthly', vi: 'Hàng tháng' },
  quarterly: { zh: '每季度', en: 'Quarterly', vi: 'Hàng quý' },
  semi_annual: { zh: '每半年', en: 'Semi-annual', vi: 'Nửa năm' },
  annual: { zh: '每年', en: 'Annual', vi: 'Hàng năm' },
};

const CATEGORY_KEYS = {
  comprehensive: '综合', chess_cards: '棋牌', hunting: '捕鱼', slot: '电子', live: '真人',
  sports: '体育', cockfight: '斗鸡', lottery: '彩票', video: '视频', esports: '电竞',
  table: '桌面', arcade: '街机', simulation: '模拟', other: '其他', recharge: '充值',
  betting: '打码', signin: '签到', invite: '邀请', newuser: '新人礼金', redpacket: '红包', custom: '自定义',
};

const TYPE_KEYS = {
  recharge: '充值', wagering: '打码', rescue: '救援金', checkin: '签到', luckyspin: '幸运转盘',
  luckywager: '幸运注单', redpacket: '红包', investment: '投资', promotion: '推广', agent: '代理',
  collect: '集字', guessing: '竞猜', newbie: '新人彩金', referral: '推荐奖励', soft: '软一刀',
  new: '新一刀', ranking: '相行榜', custom: '自定义',
};

const STATUS_KEYS = {
  draft: { zh: '草稿', en: 'Draft', vi: 'Bản nháp' },
  active: { zh: '进行中', en: 'Active', vi: 'Đang diễn ra' },
  paused: { zh: '已暂停', en: 'Paused', vi: 'Đã tạm dừng' },
  archived: { zh: '已归档', en: 'Archived', vi: 'Đã lưu trữ' },
  unknown: { zh: '未知状态', en: 'Unknown status', vi: 'Trạng thái không xác định' },
  uncategorized: { zh: '未分类', en: 'Uncategorized', vi: 'Chưa phân loại' },
  unknownType: { zh: '未知类型', en: 'Unknown type', vi: 'Loại không xác định' },
  notSetTime: { zh: '未设置时间', en: 'Time not set', vi: 'Chưa đặt thời gian' },
  timeFormatError: { zh: '时间格式错误', en: 'Invalid time format', vi: 'Định dạng thời gian không hợp lệ' },
  notSet: { zh: '未设置', en: 'Not set', vi: 'Chưa đặt' },
  system: { zh: '系统', en: 'System', vi: 'Hệ thống' },
  completed: { zh: '已完成', en: 'Completed', vi: 'Hoàn thành' },
  inProgress: { zh: '进行中', en: 'In Progress', vi: 'Đang diễn ra' },
};

function walkVueFiles(dir, base = '') {
  const files = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const rel = base ? `${base}/${f}` : f;
    if (fs.statSync(p).isDirectory()) files.push(...walkVueFiles(p, rel));
    else if (f.endsWith('.vue')) files.push({ abs: p, rel });
  }
  return files;
}

function patchLocales() {
  for (const lang of ['zh-CN', 'en-US', 'vi-VN']) {
    const p = path.join(localesDir, lang, 'activity.json');
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    data.common = data.common || {};
    const l = lang === 'zh-CN' ? 'zh' : lang === 'en-US' ? 'en' : 'vi';
    for (const [k, v] of Object.entries(EXTRA_KEYS)) {
      data.common[k] = v[l];
    }
    data.cycles = data.cycles || {};
    for (const [k, v] of Object.entries(CYCLE_KEYS)) {
      data.cycles[k] = v[l];
    }
    data.categories = data.categories || {};
    for (const [k, zh] of Object.entries(CATEGORY_KEYS)) {
      if (!data.categories[k]) {
        data.categories[k] =
          l === 'zh' ? zh : l === 'en' ? zh : zh; // placeholder, fix below
      }
    }
    if (l === 'en') {
      data.categories = {
        comprehensive: 'Comprehensive', chess_cards: 'Chess & Cards', hunting: 'Fishing',
        slot: 'Slots', live: 'Live Casino', sports: 'Sports', cockfight: 'Cockfight',
        lottery: 'Lottery', video: 'Video', esports: 'Esports', table: 'Table Games',
        arcade: 'Arcade', simulation: 'Simulation', other: 'Other', recharge: 'Recharge',
        betting: 'Wagering', signin: 'Check-in', invite: 'Invite', newuser: 'New User Bonus',
        redpacket: 'Red Packet', custom: 'Custom',
      };
    }
    if (l === 'vi') {
      data.categories = {
        comprehensive: 'Tổng hợp', chess_cards: 'Cờ bài', hunting: 'Bắn cá', slot: 'Nổ hũ',
        live: 'Casino trực tiếp', sports: 'Thể thao', cockfight: 'Đá gà', lottery: 'Xổ số',
        video: 'Video', esports: 'Esports', table: 'Game bàn', arcade: 'Arcade',
        simulation: 'Mô phỏng', other: 'Khác', recharge: 'Nạp tiền', betting: 'Cược',
        signin: 'Điểm danh', invite: 'Mời bạn', newuser: 'Thưởng thành viên mới',
        redpacket: 'Lì xì', custom: 'Tùy chỉnh',
      };
    }
    if (l === 'zh') {
      data.categories = CATEGORY_KEYS;
    }
    data.types = data.types || {};
    if (l === 'en') {
      data.types = {
        recharge: 'Recharge', wagering: 'Wagering', rescue: 'Rescue Bonus', checkin: 'Check-in',
        luckyspin: 'Lucky Wheel', luckywager: 'Lucky Bet', redpacket: 'Red Packet',
        investment: 'Investment', promotion: 'Promotion', agent: 'Agent', collect: 'Collect Words',
        guessing: 'Guessing', newbie: 'Newbie Bonus', referral: 'Referral Reward', soft: 'Soft Cut',
        new: 'New Cut', ranking: 'Ranking', custom: 'Custom',
      };
    } else if (l === 'vi') {
      data.types = {
        recharge: 'Nạp tiền', wagering: 'Cược', rescue: 'Tiền cứu trợ', checkin: 'Điểm danh',
        luckyspin: 'Vòng quay may mắn', luckywager: 'Cược may mắn', redpacket: 'Lì xì',
        investment: 'Đầu tư', promotion: 'Khuyến mãi', agent: 'Đại lý', collect: 'Thu thập chữ',
        guessing: 'Dự đoán', newbie: 'Thưởng người mới', referral: 'Thưởng giới thiệu',
        soft: 'Cắt mềm', new: 'Cắt mới', ranking: 'Bảng xếp hạng', custom: 'Tùy chỉnh',
      };
    } else {
      data.types = TYPE_KEYS;
    }
    data.statuses = {};
    for (const [k, v] of Object.entries(STATUS_KEYS)) {
      data.statuses[k] = v[l];
    }
    fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
  }
}

function patchFile(content) {
  let r = content;

  const reps = [
    [/prefix:\s*\(info:\s*any\)\s*=>\s*`共 \$\{info\.itemCount\} 条`/g, "prefix: (info: any) => $t('activity.totalRecords', [info.itemCount])"],
    [/开启时间：\{\{ formatTs\(pfEnabledAt\) \}\}/g, "{{ $t('activity.common.enabledAt') }}{{ formatTs(pfEnabledAt) }}"],
    [/开启时间：\{\{ formatTs\(lwEnabledAt\) \}\}/g, "{{ $t('activity.common.enabledAt') }}{{ formatTs(lwEnabledAt) }}"],
    [/title-text="公积金设置"/g, ":title-text=\"$t('activity.common.pfSettingsTitle')\""],
    [/placeholder="全部"/g, ":placeholder=\"$t('activity.common.allPlaceholder')\""],
    [/placeholder="批量操作"/g, ":placeholder=\"$t('common.batchOperation')\""],
    [/<n-form-item label="会员">/g, '<n-form-item :label="$t(\'activity.common.memberLabel\')">'],
    [/<n-form-item :label="activeTab === 'physical-orders' \? ' ' : '时间'">/g, '<n-form-item :label="activeTab === \'physical-orders\' ? \' \' : $t(\'activity.common.timeLabel\')">'],
    [/已选择 \{\{ selectedCount \}\} 条数据，共\s*\n\s*\{\{ paginationReactive\.total \}\} 条/g, "{{ $t('activity.common.selectedCount', [selectedCount, paginationReactive.total]) }}"],
    [/已选择 \{\{ selectedCount \}\} 条数据 共 \{\{ pagination\.itemCount \}\} 条/g, "{{ $t('activity.common.selectedCountShort', [selectedCount, pagination.itemCount]) }}"],
    [/共 \{\{ paginationReactive\.total \}\} 条记录/g, "{{ $t('activity.common.totalRecordsLabel', [paginationReactive.total]) }}"],
    [/已开启奖励合计: \{\{ totalActiveReward\.toFixed\(2\) \}\} BRL/g, "{{ $t('activity.common.totalActiveReward', [totalActiveReward.toFixed(2)]) }}"],
    [/\{\{ batchErrors\.length \}\} 条错误/g, "{{ $t('activity.common.batchErrors', [batchErrors.length]) }}"],
    [/<span class="lw-hint">\/次<\/span>/g, '<span class="lw-hint">{{ $t(\'activity.common.perTime\') }}</span>'],
    [/message\.success\(v \? '已开启公积金统计' : '已关闭公积金'\)/g, "message.success(v ? $t('activity.common.pfEnabledOn') : $t('activity.common.pfDisabled'))"],
    [/message\.success\(v \? '已开启幸运转盘' : '已关闭幸运转盘'\)/g, "message.success(v ? $t('activity.common.lwEnabledOn') : $t('activity.common.lwDisabled'))"],
    [/message\.success\(enabled \? '转盘已开启' : '转盘已关闭'\)/g, "message.success(enabled ? $t('activity.common.wheelEnabled') : $t('activity.common.wheelDisabled'))"],
    [/\? '展示' : '不展示'/g, "? $t('activity.common.showLabel') : $t('activity.common.hideLabel')"],
    [/\? '已完成' : '进行中'/g, "? $t('activity.statuses.completed') : $t('activity.statuses.inProgress')"],
    [/checked: \(\) => '开'/g, "checked: () => $t('activity.common.onLabel')"],
    [/unchecked: \(\) => '关'/g, "unchecked: () => $t('activity.common.offLabel')"],
    [/\{\{ taskData\.isActive \? '启用' : '禁用' \}\}/g, "{{ taskData.isActive ? $t('activity.common.enabledTag') : $t('activity.common.disabledTag') }}"],
    [/\{\{ isEdit \? '编辑任务' : '新人福利设置' \}\}/g, "{{ isEdit ? $t('activity.common.editTask') : $t('activity.common.noviceWelfareSettings') }}"],
    [/\{\{ isEdit \? '更新' : '确定' \}\}/g, "{{ isEdit ? $t('activity.common.updateBtn') : $t('activity.common.confirmBtn') }}"],
    [/message\.success\(props\.isEdit \? '任务更新成功' : '任务创建成功'\)/g, "message.success(props.isEdit ? $t('activity.common.taskUpdateSuccess') : $t('activity.common.taskCreateSuccess'))"],
    [/message\.error\(error\.message \|\| '操作失败，请重试'\)/g, "message.error(error.message || $t('activity.common.operationRetry'))"],
    [/message\.error\(error\.message \|\| '保存设置失败，请重试'\)/g, "message.error(error.message || $t('activity.common.saveSettingsFailed'))"],
    [/\{ required: true, message: '请输入任务条件', trigger: 'blur' \}/g, "{ required: true, message: $t('activity.common.enterTaskCondition'), trigger: 'blur' }"],
    [/message\.success\(value \? '新人福利已开启' : '新人福利已关闭'\)/g, "message.success(value ? $t('activity.common.noviceWelfareOn') : $t('activity.common.noviceWelfareOff'))"],
    [/message\.success\(value \? '任务已开启' : '任务已关闭'\)/g, "message.success(value ? $t('activity.common.taskOn') : $t('activity.common.taskOff'))"],
    [/message\.success\(value \? '提示气泡已开启' : '提示气泡已关闭'\)/g, "message.success(value ? $t('activity.common.bubbleOn') : $t('activity.common.bubbleOff'))"],
    [/message\.success\(`成功启用 \$\{rowKeys\.length\} 个任务`\)/g, "message.success($t('activity.common.batchEnableSuccess', [rowKeys.length]))"],
    [/message\.success\(`成功禁用 \$\{rowKeys\.length\} 个任务`\)/g, "message.success($t('activity.common.batchDisableSuccess', [rowKeys.length]))"],
    [/message\.success\(isEdit\.value \? '修改成功' : '新增成功'\)/g, "message.success(isEdit.value ? $t('activity.common.editSuccess') : $t('activity.common.createSuccess'))"],
    [/return props\.mode === 'edit' \? '编辑公积金' : '新增公积金'/g, "return props.mode === 'edit' ? $t('activity.common.editPf') : $t('activity.common.addPf')"],
    [/displayName: '公积金'/g, "displayName: $t('activity.common.pfDisplayName')"],
    [/form\.displayName = '公积金'/g, "form.displayName = $t('activity.common.pfDisplayName')"],
    [/:title="readOnly \? '详情' : '修改'"/g, ':title="readOnly ? $t(\'activity.common.readOnlyDetail\') : $t(\'activity.common.readOnlyModify\')"'],
    [/\{\{ readOnly \? '关闭' : '取消' \}\}/g, "{{ readOnly ? $t('activity.common.readOnlyClose') : $t('activity.common.readOnlyCancel') }}"],
    [/:title="`派发完成：成功 \$\{distributeResults\.successCount\} 人，失败 \$\{distributeResults\.failCount\} 人`"/g, ":title=\"$t('activity.common.distributeComplete', [distributeResults.successCount, distributeResults.failCount])\""],
    [/message\.warning\(`有 \$\{batchErrors\.value\.length\} 条数据存在错误，请修正后重新上传，或切换为"自动跳过错误"模式`\)/g, "message.warning($t('activity.common.batchErrorWarning', [batchErrors.value.length]))"],
    [/message\.success\(`派发成功！共 \$\{result\.successCount\} 人`\)/g, "message.success($t('activity.common.distributeAllSuccess', [result.successCount]))"],
    [/message\.warning\(`部分派发成功：成功 \$\{result\.successCount\} 人，失败 \$\{result\.failCount\} 人`\)/g, "message.warning($t('activity.common.distributePartial', [result.successCount, result.failCount]))"],
    [/message\.error\(`派发失败，请检查会员信息`\)/g, "message.error($t('activity.common.distributeFailed'))"],
    [/row\._error = '缺少会员标识'/g, "row._error = $t('activity.common.missingMemberId')"],
    [/row\._error = '奖励金额无效'/g, "row._error = $t('activity.common.invalidRewardAmount')"],
    [/row\._error = '稽核倍数无效'/g, "row._error = $t('activity.common.invalidAuditMultiplier')"],
    [/row\.error \|\| '未知错误'/g, "row.error || $t('activity.common.unknownError')"],
    [/<n-form-item label="\* 奖励金额"/g, '<n-form-item :label="$t(\'activity.common.rewardAmountLabel\')"'],
    [/<n-form-item label="\* 稽核倍数"/g, '<n-form-item :label="$t(\'activity.common.auditMultiplierLabel\')"'],
    [/<n-form-item label="\* 批量上传"/g, '<n-form-item :label="$t(\'activity.common.batchUploadLabel\')"'],
    [/:label="form\.addMode === 'manual' \? '会员类型' : '账号类型'"/g, ":label=\"form.addMode === 'manual' ? $t('activity.common.memberType') : $t('activity.common.accountType')\""],
    [/\? '输入多条请用逗号拼接，最多支持200个会员账号'/g, "? $t('activity.common.multiAccountHint')"],
    [/:\s*'输入多条请用逗号拼接，最多支持200个会员ID'/g, ": $t('activity.common.multiIdHint')"],
    [/`共 \$\{pagination\.total\} 条数据`/g, "$t('activity.common.statisticsDataCount', [pagination.total])"],
    [/message\.error\(`加载活动统计数据失败: \$\{errorMessage\}`\)/g, "message.error($t('activity.common.loadStatisticsFailed') + errorMessage)"],
    [/'加载数据失败: '\s*\+/g, "$t('activity.common.loadDataFailed') +"],
    [/\|\| `层级\$\{tier\.id\}`/g, "|| $t('activity.common.tierLabel', [tier.id])"],
    [/h\('div', \{\}, `开始：\$\{startsAt\.toLocaleString\('zh-CN'\)\}`\)/g, "h('div', {}, $t('activity.common.startLabel', [startsAt.toLocaleString()]))"],
    [/h\('div', \{\}, `结束：\$\{endsAt\.toLocaleString\('zh-CN'\)\}`\)/g, "h('div', {}, $t('activity.common.endLabel', [endsAt.toLocaleString()]))"],
    [/h\('div', \{\}, `开始：\$\{new Date\(row\.startAt\)\.toLocaleString\(\)\}`\)/g, "h('div', {}, $t('activity.common.startLabel', [new Date(row.startAt).toLocaleString()]))"],
    [/h\('div', \{\}, `结束：\$\{new Date\(row\.endAt\)\.toLocaleString\(\)\}`\)/g, "h('div', {}, $t('activity.common.endLabel', [new Date(row.endAt).toLocaleString()]))"],
    [/h\('div', \{ class: 'text-sm' \}, `参与：\$\{row\.currentParticipants\}`\)/g, "h('div', { class: 'text-sm' }, $t('activity.common.participateLabel', [row.currentParticipants]))"],
    [/`限制：\$\{row\.maxParticipants \|\| '无限制'\}`/g, "$t('activity.common.limitLabel', [row.maxParticipants || $t('activity.common.unlimited')])"],
    [/const title = `\$\{item\.title\} - 复制`/g, "const title = $t('activity.common.copyTitle', [item.title])"],
    [/taskData\.startTime \? formatDateTime\(taskData\.startTime\) : '无限制'/g, "taskData.startTime ? formatDateTime(taskData.startTime) : $t('activity.common.unlimited')"],
    [/taskData\.endTime \? formatDateTime\(taskData\.endTime\) : '无限制'/g, "taskData.endTime ? formatDateTime(taskData.endTime) : $t('activity.common.unlimited')"],
    [/filters\.memberSearchType === 'memberId' \? '请输入会员ID' : '请输入会员账号'/g, "filters.memberSearchType === 'memberId' ? $t('activity.luckyWheel.k8bf7') : $t('activity.luckyWheel.k8bf72')"],
    [/filters\.operatorSearchType === 'recipient' \? '请输入收件人' : '请输入操作人'/g, "filters.operatorSearchType === 'recipient' ? $t('activity.luckyWheel.k8bf73') : $t('activity.luckyWheel.k8bf74')"],
    [/批量启用 \(\{\{ selectedCount \}\}\)/g, "{{ $t('activity.common.batchEnable') }} ({{ selectedCount }})"],
    [/批量禁用 \(\{\{ selectedCount \}\}\)/g, "{{ $t('activity.common.batchDisable') }} ({{ selectedCount }})"],
  ];

  for (const [re, rep] of reps) {
    r = r.replace(re, rep);
  }

  // Reset cycle labels
  r = r.replace(
    /function resetCycleLabel\(cycle: string\) \{[\s\S]*?return map\[cycle\] \|\| cycle;\s*\}/,
    `function resetCycleLabel(cycle: string) {
  const map: Record<string, string> = {
    none: $t('activity.cycles.none'),
    monthly: $t('activity.cycles.monthly'),
    quarterly: $t('activity.cycles.quarterly'),
    semi_annual: $t('activity.cycles.semi_annual'),
    annual: $t('activity.cycles.annual'),
  };
  return map[cycle] || cycle;
}`,
  );

  return r;
}

patchLocales();
let n = 0;
for (const { abs, rel } of walkVueFiles(activityRoot)) {
  const orig = fs.readFileSync(abs, 'utf8');
  const next = patchFile(orig);
  if (next !== orig) {
    fs.writeFileSync(abs, next, 'utf8');
    n++;
    console.log('Patched', rel);
  }
}
console.log('Pass 2 done:', n, 'files');
