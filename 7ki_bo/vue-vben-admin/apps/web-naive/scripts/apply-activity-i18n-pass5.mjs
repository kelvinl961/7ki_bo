/**
 * Pass 5: final user-visible Chinese cleanup.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(__dirname, '..');
const activityRoot = path.join(appRoot, 'src/views/activity');
const localesDir = path.join(appRoot, 'src/locales/langs');

const LABELS = {
  '* 活动分类': { en: '* Activity Category', vi: '* Loại hoạt động' },
  '* 选择币种': { en: '* Select Currency', vi: '* Chọn tiền tệ' },
  '* 活动名称': { en: '* Activity Name', vi: '* Tên hoạt động' },
  '* 活动时间': { en: '* Activity Time', vi: '* Thời gian hoạt động' },
  '* 展示时间': { en: '* Display Time', vi: '* Thời gian hiển thị' },
  '* 循环方式': { en: '* Loop Method', vi: '* Phương thức lặp' },
  '* 奖励领取过期天数': { en: '* Reward Claim Expiry (days)', vi: '* Số ngày hết hạn nhận thưởng' },
  '* 每日奖励上限': { en: '* Daily Reward Cap', vi: '* Giới hạn thưởng hàng ngày' },
  '* 选择时间': { en: '* Select Time', vi: '* Chọn thời gian' },
  '* 充值方式': { en: '* Deposit Method', vi: '* Phương thức nạp tiền' },
  '* 签到方式': { en: '* Check-in Method', vi: '* Phương thức điểm danh' },
  '* 转盘开关': { en: '* Wheel Switch', vi: '* Công tắc vòng quay' },
  '* 获得幸运值': { en: '* Lucky Value Earned', vi: '* Điểm may mắn nhận được' },
  '* 领取次数限制': { en: '* Claim Count Limit', vi: '* Giới hạn số lần nhận' },
  '* 每日次数上限': { en: '* Daily Count Cap', vi: '* Giới hạn số lần/ngày' },
  '* 总次数上限': { en: '* Total Count Cap', vi: '* Giới hạn tổng số lần' },
  '* 最低有效投注金额': { en: '* Min Valid Bet Amount', vi: '* Số tiền cược tối thiểu hợp lệ' },
  '* 奖励方式': { en: '* Reward Method', vi: '* Phương thức thưởng' },
  '* 注单号规则': { en: '* Bet Slip No. Rule', vi: '* Quy tắc số phiếu cược' },
  '* 大额审核金额': { en: '* Large Amount Review Threshold', vi: '* Ngưỡng duyệt số tiền lớn' },
  '* 总计金额': { en: '* Total Amount', vi: '* Tổng số tiền' },
  '* 每个时间段红包总数': { en: '* Red Packets per Time Slot', vi: '* Tổng lì xì mỗi khung giờ' },
  '* 实际红包金额': { en: '* Actual Red Packet Amount', vi: '* Số tiền lì xì thực tế' },
  '* 展示红包金额': { en: '* Display Red Packet Amount', vi: '* Số tiền lì xì hiển thị' },
  '* 每个时间段限抢次数': { en: '* Grab Limit per Time Slot', vi: '* Giới hạn nhận/khung giờ' },
  '* 每日限抢次数': { en: '* Daily Grab Limit', vi: '* Giới hạn nhận/ngày' },
  '* 返奖天数': { en: '* Reward Return Days', vi: '* Số ngày hoàn thưởng' },
  '* 累计充值': { en: '* Cumulative Deposit', vi: '* Tổng nạp tiền' },
  '* 累计充值天数': { en: '* Cumulative Deposit Days', vi: '* Số ngày nạp tích lũy' },
  '* 累计充值次数': { en: '* Cumulative Deposit Count', vi: '* Số lần nạp tích lũy' },
  '* 累计打码': { en: '* Cumulative Wagering', vi: '* Tổng cược' },
  '* 同注册IP上限': { en: '* Same Registration IP Limit', vi: '* Giới hạn IP đăng ký trùng' },
  '* 同注册设备上限': { en: '* Same Registration Device Limit', vi: '* Giới hạn thiết bị đăng ký trùng' },
  '* 实际瓜分金额': { en: '* Actual Share Amount', vi: '* Số tiền chia thực tế' },
  '* 展示瓜分金额': { en: '* Display Share Amount', vi: '* Số tiền chia hiển thị' },
  '* 参与条件': { en: '* Participation Conditions', vi: '* Điều kiện tham gia' },
  '* 获取积分': { en: '* Earn Points', vi: '* Nhận điểm' },
  '* 积分上限': { en: '* Points Cap', vi: '* Giới hạn điểm' },
  '* 下注限额': { en: '* Bet Limit', vi: '* Giới hạn cược' },
  '* 赠送方式': { en: '* Gift Method', vi: '* Phương thức tặng' },
  '* 提现门槛': { en: '* Withdrawal Threshold', vi: '* Ngưỡng rút tiền' },
  批量删除: { en: 'Batch Delete', vi: 'Xóa hàng loạt' },
  关闭: { en: 'Disable', vi: 'Tắt' },
  开启: { en: 'Enable', vi: 'Bật' },
  本周: { en: 'This Week', vi: 'Tuần này' },
  请选择: { en: 'Please select', vi: 'Vui lòng chọn' },
  未知样式: { en: 'Unknown style', vi: 'Kiểu không xác định' },
  '派发奖励失败，请稍后重试': {
    en: 'Failed to distribute rewards, please retry',
    vi: 'Phát thưởng thất bại, vui lòng thử lại',
  },
};

function patchLocales() {
  for (const lang of ['zh-CN', 'en-US', 'vi-VN']) {
    const p = path.join(localesDir, lang, 'activity.json');
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    data.labels = data.labels || {};
    const l = lang === 'zh-CN' ? 'zh' : lang === 'en-US' ? 'en' : 'vi';
    for (const [zh, tr] of Object.entries(LABELS)) {
      const key = 'l' + [...zh].reduce((h, c) => ((h * 31 + c.charCodeAt(0)) >>> 0), 0).toString(36).slice(0, 8);
      data.labels[key] = l === 'zh' ? zh : tr[l];
    }
    // semantic aliases
    data.labels.activityCategory = l === 'zh' ? '* 活动分类' : LABELS['* 活动分类'][l];
    data.labels.selectCurrency = l === 'zh' ? '* 选择币种' : LABELS['* 选择币种'][l];
    data.labels.activityName = l === 'zh' ? '* 活动名称' : LABELS['* 活动名称'][l];
    data.labels.loopMethod = l === 'zh' ? '* 循环方式' : LABELS['* 循环方式'][l];
    data.labels.batchDelete = LABELS['批量删除'][l];
    data.labels.disable = LABELS['关闭'][l];
    data.labels.enable = LABELS['开启'][l];
    data.labels.thisWeek = LABELS['本周'][l];
    data.labels.pleaseSelect = LABELS['请选择'][l];
    data.labels.unknownStyle = LABELS['未知样式'][l];
    data.labels.distributeFailed = LABELS['派发奖励失败，请稍后重试'][l]; // eslint-disable-line
    data.labels.confirmToggleActivity = l === 'zh' ? '确定{0}此活动吗？' : l === 'en' ? 'Confirm {0} this activity?' : 'Xác nhận {0} hoạt động này?';
    data.labels.statusUpdated = l === 'zh' ? '活动状态已更新为{0}' : l === 'en' ? 'Activity status updated to {0}' : 'Trạng thái hoạt động đã cập nhật thành {0}';
    data.labels.sortUpdated = l === 'zh' ? '已更新活动 {0} 的排序为 {1}' : l === 'en' ? 'Updated sort order for activity {0} to {1}' : 'Đã cập nhật thứ tự hoạt động {0} thành {1}';
    data.labels.confirmBatchDelete = l === 'zh' ? '确定要删除选中的 {0} 个活动吗？' : l === 'en' ? 'Delete {0} selected activities?' : 'Xóa {0} hoạt động đã chọn?';
    data.labels.stylePreview = l === 'zh' ? '样式{0}预览' : l === 'en' ? 'Style {0} Preview' : 'Xem trước kiểu {0}';
    fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
  }
}

const CATEGORY_MAP = `const categoryMap: Record<string, string> = {
    comprehensive: $t('activity.categories.comprehensive'),
    chess_cards: $t('activity.categories.chess_cards'),
    hunting: $t('activity.categories.hunting'),
    slot: $t('activity.categories.slot'),
    live: $t('activity.categories.live'),
    sports: $t('activity.categories.sports'),
    cockfight: $t('activity.categories.cockfight'),
    lottery: $t('activity.categories.lottery'),
    video: $t('activity.categories.video'),
    esports: $t('activity.categories.esports'),
    table: $t('activity.categories.table'),
    arcade: $t('activity.categories.arcade'),
    simulation: $t('activity.categories.simulation'),
    other: $t('activity.categories.other'),
    recharge: $t('activity.categories.recharge'),
    betting: $t('activity.categories.betting'),
    signin: $t('activity.categories.signin'),
    invite: $t('activity.categories.invite'),
    newuser: $t('activity.categories.newuser'),
    redpacket: $t('activity.categories.redpacket'),
    custom: $t('activity.categories.custom'),
  };`;

const TYPE_MAP = `const typeMap: Record<string, string> = {
    recharge: $t('activity.types.recharge'),
    wagering: $t('activity.types.wagering'),
    rescue: $t('activity.types.rescue'),
    checkin: $t('activity.types.checkin'),
    luckyspin: $t('activity.types.luckyspin'),
    luckywager: $t('activity.types.luckywager'),
    redpacket: $t('activity.types.redpacket'),
    investment: $t('activity.types.investment'),
    promotion: $t('activity.types.promotion'),
    agent: $t('activity.types.agent'),
    collect: $t('activity.types.collect'),
    guessing: $t('activity.types.guessing'),
    newbie: $t('activity.types.newbie'),
    referral: $t('activity.types.referral'),
    soft: $t('activity.types.soft'),
    new: $t('activity.types.new'),
    ranking: $t('activity.types.ranking'),
    custom: $t('activity.types.custom'),
  };`;

function walk(dir, base = '') {
  const out = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const rel = base ? `${base}/${f}` : f;
    if (fs.statSync(p).isDirectory()) out.push(...walk(p, rel));
    else if (f.endsWith('.vue')) out.push({ abs: p, rel });
  }
  return out;
}

patchLocales();

const labelKey = (zh) => {
  const k = 'l' + [...zh].reduce((h, c) => ((h * 31 + c.charCodeAt(0)) >>> 0), 0).toString(36).slice(0, 8);
  return `activity.labels.${k}`;
};

for (const { abs, rel } of walk(activityRoot)) {
  let c = fs.readFileSync(abs, 'utf8');
  const orig = c;

  for (const zh of Object.keys(LABELS)) {
    const key = labelKey(zh);
    c = c.replace(new RegExp(`>\\*?\\s*${zh.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*</label\\s*\\n\\s*>`, 'g'), `>{{ $t('${key}') }}</label\n                      >`);
    c = c.replace(new RegExp(`\\n(\\s+)${zh.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n(\\s+<)`, 'g'), `\n$1{{ $t('${key}') }}\n$2`);
  }

  c = c.replace(/const categoryMap: Record<string, string> = \{[\s\S]*?\};/g, CATEGORY_MAP);
  c = c.replace(/getCategoryText[\s\S]*?const categoryMap: Record<string, string> = \{[\s\S]*?\};/, (m) => m.replace(/const categoryMap: Record<string, string> = \{[\s\S]*?\};/, CATEGORY_MAP));
  c = c.replace(/getTypeText[\s\S]*?const typeMap: Record<string, string> = \{[\s\S]*?\};/, (m) => {
    if (!m.includes('getTypeText')) return m;
    return m.replace(/const typeMap: Record<string, string> = \{[\s\S]*?\};/, TYPE_MAP);
  });

  c = c.replace(/\|\| category \|\| '未分类'/g, "|| category || $t('activity.statuses.uncategorized')");
  c = c.replace(/\|\| type \|\| '未知类型'/g, "|| type || $t('activity.statuses.unknownType')");

  c = c.replace(/row\.status === 'active' \? '关闭' : '开启'/g, "row.status === 'active' ? $t('activity.labels.disable') : $t('activity.labels.enable')");
  c = c.replace(/`确定\$\{row\.status === 'active' \? '关闭' : '开启'\}此活动吗？`/g, "$t('activity.labels.confirmToggleActivity', [row.status === 'active' ? $t('activity.labels.disable') : $t('activity.labels.enable')])");
  c = c.replace(/批量删除 \(\{\{ selectedCount \}\}\)/g, "{{ $t('activity.labels.batchDelete') }} ({{ selectedCount }})");
  c = c.replace(/prefix: \(\{ itemCount \}: \{ itemCount: number \}\) => `共 \$\{itemCount\} 条`/g, "prefix: ({ itemCount }: { itemCount: number }) => $t('activity.totalRecords', [itemCount])");
  c = c.replace(/共 \{\{ totalCount \}\} 条记录/g, "{{ $t('activity.common.totalRecordsLabel', [totalCount]) }}");
  c = c.replace(/<n-radio-button value="thisWeek">本周<\/n-radio-button>/g, '<n-radio-button value="thisWeek">{{ $t(\'activity.labels.thisWeek\') }}</n-radio-button>');
  c = c.replace(/placeholder="请选择"/g, ':placeholder="$t(\'activity.labels.pleaseSelect\')"');
  c = c.replace(/return currentStyle\?\.label \|\| '未知样式'/g, "return currentStyle?.label || $t('activity.labels.unknownStyle')");
  c = c.replace(/message\.error\(err\?\.message \|\| '派发奖励失败，请稍后重试'\)/g, "message.error(err?.message || $t('activity.labels.distributeFailed'))");
  c = c.replace(/`活动状态已更新为\$\{newStatus === 'active' \? '开启' : '暂停'\}`/g, "$t('activity.labels.statusUpdated', [newStatus === 'active' ? $t('activity.labels.enable') : $t('activity.activityList.k5df2')])");
  c = c.replace(/content: `确定要删除选中的 \$\{activitiesToDelete\.length\} 个活动吗？`/g, "content: $t('activity.labels.confirmBatchDelete', [activitiesToDelete.length])");
  c = c.replace(/positiveText: '确定'/g, "positiveText: $t('common.confirm')");
  c = c.replace(/negativeText: '取消'/g, "negativeText: $t('common.cancel')");
  c = c.replace(/message\.success\(`已更新活动 \$\{activityId\} 的排序为 \$\{value\}`\)/g, "message.success($t('activity.labels.sortUpdated', [activityId, value]))");

  if (c !== orig) {
    fs.writeFileSync(abs, c, 'utf8');
    console.log('Pass5', rel);
  }
}
console.log('Pass 5 done');
