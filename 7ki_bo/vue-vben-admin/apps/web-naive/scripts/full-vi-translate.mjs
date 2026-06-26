/**
 * Full vi-VN translation pass: remove all Chinese and English from locale strings.
 * Walks zh-CN + en-US in parallel and rebuilds vi-VN values.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appLocales = path.join(__dirname, '../src/locales/langs');
const pkgLocales = path.resolve(__dirname, '../../../packages/locales/src/langs');

const CH = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/;
const CORRUPT_RE = /<[^>]+>|n-button|v-model|v-if=|<!--|class=/i;
const GARBAGE_KEY_RE = /NButton|DivClass|Template|VModel|NTabPane|NIconSize|Const[A-Z]/;
const ALLOWED_LATIN =
  /^(VIP|SVIP|KYC|BRL|USD|CNY|iOS|Android|PC|PWA|H5|APP|TG|SMS|IP|ID|OK|API|URL|CSV|XLSX|XLS|PDF|PNG|JPEG|JPG|GIF|MB|px|T&C|ALL|RTP|ON|OFF|NaN|backend)$/i;

/** English vocabulary that should not appear in vi strings */
const EN_POLLUTION =
  /\b(Please|Select|Enter|Activity|Member|Order|Failed|Loading|Success|Export|Import|Search|Reset|Confirm|Cancel|Submit|Update|Create|Delete|Edit|Status|Amount|Reward|Task|Platform|Settings|Config|Manual|Automatic|System|Default|Preview|Upload|Download|Bulk|Total|Enable|Disable|Show|Hide|Add|Remove|Save|Back|Next|Refresh|Filter|Pending|Approved|Rejected|Processing|Complete|Minimum|Maximum|Recent|Single|Daily|Weekly|Monthly|Custom|Unknown|Error|Warning|feature|development|coming|soon|Stay|tuned|unavailable|requirements|description|statistics|management|distribution|acquisition|settlement|coupon|lottery|mystery|rebate|merchant|interest|treasure|withdrawal|deposit|recharge|wagering|promotion|operator|recipient|participants|progress|supported|content|rules|basic|info|category|subcategory|timeline|started|ended|duration|platforms|copied|draft|saved|gift|bonus|points|claim|methods|issued|data|list|icon|currency|source|upper|agent|detail|details|view|click|tier|balance|security|registration|login|transaction|history|ratio|risk|control|limit|optional|process|remark|auto|approval|payout|range|time|within|count|Current|Page|Select|Basic|Max|Current|No|Gift|Operator|User|Commission|Interest|Treasure|Merchant|Discount|Manual|backend|Mystery|box|free|spins|Upper|Source|Type|Participation|Supported|Content|rules|under|Simulated|nter|upperlimit|lackname|argetype|Third|party|Payment|Refresh|Later|Correct|Yes|No|giftamount|SVIPReward|VIPReward|taskfeature|featureunder|entertask|ShowActivity|Ratio|Provident|Fund|Open|Close|Wagering|Audit|Slot|Lottery|Esports|Arcade|Cockfight|Approve|Frozen|Suspended|Temporary|Terminal|Quantity|Exchange|Mark|Priority|Special|Test|Progress|Clear|Complete|Key|Received|Blockchain|Mobile|Cancelled|Confirmed|Expired|Merchant|Credit|Card|Enable|Disable|Interest|Vault|Source|Simulated|optional|enter|select|check|fill|generate|set|modify|copy|load|refresh|update|create|delete|export|import|search|reset|confirm|cancel|submit|save|add|remove|show|hide|open|close|enable|disable|pending|approved|rejected|processing|complete|minimum|maximum|recent|single|daily|weekly|monthly|custom|unknown|error|warning|failed|success|loading|successfully|not|found|correct|later|already|rules|rule|level|levels|label|labels|days|day|hours|hour|minutes|minute|seconds|second|records|record|compact|actions|action|meets|conditions|condition|settings|setting|desc|optional|remark|process|payout|approval|auto|bulk|range|within|registration|transaction|deposit|withdrawal|security|history|risk|control|single|limit|amount|amounts|enterAmount|nterAmount|giftamount|Ratio1|Withdrawal|Deposit|Recharge|Third|party|lackname|orderStatus|argetype|No\.|Refresh|Later|Already|Please|Check|Account|Or|IDYes|NoCorrect|statusRefresh|notFoundMember|Simulated)\b/i;

function hasChinese(s) {
  return typeof s === 'string' && CH.test(s);
}

function hasEnglishPollution(s) {
  if (typeof s !== 'string') return false;
  if (EN_POLLUTION.test(s)) return true;
  // Residual Latin-only tokens (4+ chars) not in allowlist — likely English
  const tokens = s.replace(/\{[^}]+\}/g, ' ').match(/\b[A-Za-z]{4,}\b/g) || [];
  return tokens.some((t) => !ALLOWED_LATIN.test(t));
}

function isCleanVi(s) {
  if (typeof s !== 'string' || !s.trim()) return false;
  if (hasChinese(s) || CORRUPT_RE.test(s)) return false;
  if (hasEnglishPollution(s)) return false;
  return true;
}

function needsFix(s) {
  if (typeof s !== 'string' || !s.trim()) return false;
  if (CORRUPT_RE.test(s)) return false;
  return !isCleanVi(s);
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function writeJson(p, data) {
  fs.writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function parallelWalk(zh, target, map, mode = 'zh-vi') {
  if (!zh || !target) return;
  for (const key of Object.keys(zh)) {
    const z = zh[key];
    const t = target[key];
    if (z && typeof z === 'object' && !Array.isArray(z)) {
      parallelWalk(z, t && typeof t === 'object' ? t : {}, map, mode);
    } else if (typeof z === 'string' && typeof t === 'string' && z && t && isCleanVi(t)) {
      if (mode === 'zh-vi' && t !== z) map[z] = t;
      if (mode === 'en-vi' && t !== z) map[z] = t; // z is en, t is vi
    }
  }
}

/** zh -> vi phrase map */
const zhToVi = {};
/** en -> vi phrase map */
const enToVi = {};

// packages common
parallelWalk(
  readJson(path.join(pkgLocales, 'zh-CN/common.json')),
  readJson(path.join(pkgLocales, 'vi-VN/common.json')),
  zhToVi,
);
parallelWalk(
  readJson(path.join(pkgLocales, 'en-US/common.json')),
  readJson(path.join(pkgLocales, 'vi-VN/common.json')),
  enToVi,
  'en-vi',
);

const financeTranslations = readJson(path.join(__dirname, 'finance-translations.json'));
for (const [zh, entry] of Object.entries(financeTranslations)) {
  if (entry?.vi && isCleanVi(entry.vi)) zhToVi[zh] = entry.vi;
  if (entry?.en && entry?.vi && isCleanVi(entry.vi)) enToVi[entry.en] = entry.vi;
}

// Mine clean pairs from app locale modules
for (const name of fs.readdirSync(path.join(appLocales, 'vi-VN'))) {
  if (!name.endsWith('.json')) continue;
  const zhPath = path.join(appLocales, 'zh-CN', name);
  const enPath = path.join(appLocales, 'en-US', name);
  const viPath = path.join(appLocales, 'vi-VN', name);
  if (!fs.existsSync(zhPath)) continue;
  try {
    const zh = readJson(zhPath);
    const vi = readJson(viPath);
    parallelWalk(zh, vi, zhToVi);
    if (fs.existsSync(enPath)) {
      parallelWalk(readJson(enPath), vi, enToVi, 'en-vi');
    }
  } catch {
    /* skip */
  }
}

/** zh -> vi glossary (gaming / admin terms) */
const GLOSSARY_ZH_VI = {
  大类角标不能超过12个字符: 'Huy hiệu danh mục không được vượt quá 12 ký tự',
  大类名称不能超过50个字符: 'Tên danh mục không được vượt quá 50 ký tự',
  电子: 'Slot',
  真人: 'Casino trực tiếp',
  返水: 'Hoàn trả',
  返佣: 'Hoa hồng',
  本周: 'Tuần này',
  活动: 'Hoạt động',
  优惠活动: 'Hoạt động khuyến mãi',
  优惠: 'Khuyến mãi',
  充值: 'Nạp tiền',
  提现: 'Rút tiền',
  入金: 'Nạp tiền',
  出款: 'Chi trả',
  稽核: 'Kiểm toán',
  投注: 'Cược',
  输赢: 'Thắng/Thua',
  官网: 'Trang chính thức',
  未知: 'Không xác định',
  体育: 'Thể thao',
  彩票: 'Xổ số',
  棋牌: 'Bài',
  电竞: 'Esports',
  捕鱼: 'Bắn cá',
  街机: 'Arcade',
  斗鸡: 'Đá gà',
  电话: 'Điện thoại',
  邮箱: 'Email',
  批准: 'Phê duyệt',
  拒绝: 'Từ chối',
  错误: 'Lỗi',
  更新: 'Cập nhật',
  排名: 'Xếp hạng',
  普通: 'Thường',
  终端: 'Thiết bị',
  数量: 'Số lượng',
  汇率: 'Tỷ giá',
  标记: 'Đánh dấu',
  优先: 'Ưu tiên',
  特殊: 'Đặc biệt',
  昵称: 'Biệt danh',
  锁定: 'Khóa',
  解锁: 'Mở khóa',
  冻结: 'Đóng băng',
  暂停: 'Tạm dừng',
  临时: 'Tạm thời',
  笔数: 'Số giao dịch',
  按日: 'Theo ngày',
  按周: 'Theo tuần',
  按月: 'Theo tháng',
  正常: 'Bình thường',
  模拟: 'Mô phỏng',
  筛选条件: 'Tiêu chí lọc',
  领取方式: 'Cách nhận',
  奖励类型: 'Loại thưởng',
  奖励: 'Thưởng',
  领取时间: 'Thời gian nhận',
  发放奖励: 'Thưởng đã phát',
  发放奖励合计: 'Tổng thưởng đã phát',
  数据列表: 'Danh sách dữ liệu',
  正在加载数据: 'Đang tải dữ liệu',
  没有数据可导出: 'Không có dữ liệu để xuất',
  任务: 'Nhiệm vụ',
  新人福利: 'Phúc lợi người mới',
  利息宝: 'Kho lãi suất',
  幸运转盘: 'Vòng quay may mắn',
  公积金: 'Quỹ tích lũy',
  盲盒抽奖: 'Rút hộp bí ẩn',
  活动中心: 'Trung tâm hoạt động',
  活动列表: 'Danh sách hoạt động',
  活动名称: 'Tên hoạt động',
  活动ID: 'Mã hoạt động',
  已关闭活动: 'Hoạt động đã đóng',
  优惠统计: 'Thống kê khuyến mãi',
  分享管理: 'Quản lý chia sẻ',
  优惠来源: 'Nguồn khuyến mãi',
  全部领取方式: 'Tất cả cách nhận',
  今日: 'Hôm nay',
  昨天: 'Hôm qua',
  上周: 'Tuần trước',
  搜索: 'Tìm kiếm',
  导出: 'Xuất',
  处理中: 'Đang xử lý',
  成功: 'Thành công',
  失败: 'Thất bại',
  说明: 'Mô tả',
  类型: 'Loại',
  时间: 'Thời gian',
  状态: 'Trạng thái',
  操作人: 'Người thao tác',
  启用: 'Bật',
  禁用: 'Tắt',
  删除: 'Xóa',
  取消: 'Hủy',
  是: 'Có',
  否: 'Không',
  修改会员层级: 'Sửa cấp thành viên',
  在线充值: 'Nạp tiền trực tuyến',
  '管理所有活动的创建、编辑、监控和统计':
    'Quản lý tạo, chỉnh sửa, giám sát và thống kê mọi hoạt động',
  请选择优惠来源: 'Vui lòng chọn nguồn khuyến mãi',
  请选择或搜索活动: 'Vui lòng chọn hoặc tìm hoạt động',
  请选择奖励类型: 'Vui lòng chọn loại thưởng',
  加载活动列表失败: 'Không tải được danh sách hoạt động',
  用户ID或账号: 'ID người dùng hoặc tài khoản',
  '用户ID/账号': 'ID người dùng / Tài khoản',
  选择开始和结束日期: 'Chọn ngày bắt đầu và kết thúc',
  共: 'Tổng',
  条: 'bản ghi',
  天: 'ngày',
  小时: 'giờ',
  分钟: 'phút',
  秒: 'giây',
  '3天以内': 'Trong 3 ngày',
  '7天以内': 'Trong 7 ngày',
  '24小时以内': 'Trong 24 giờ',
  '30天以内': 'Trong 30 ngày',
  三天神秘任务: 'Nhiệm vụ bí ẩn 3 ngày',
  三日神秘任务: 'Nhiệm vụ bí ẩn 3 ngày',
  每日任务: 'Nhiệm vụ hàng ngày',
  每周任务: 'Nhiệm vụ hàng tuần',
  会员: 'Thành viên',
  会员ID: 'ID thành viên',
  会员账号: 'Tài khoản thành viên',
  订单号: 'Mã đơn hàng',
  暂无数据: 'Không có dữ liệu',
  全部: 'Tất cả',
  确定: 'Xác nhận',
  重置: 'Đặt lại',
  详情: 'Chi tiết',
  操作: 'Thao tác',
  复制失败: 'Sao chép thất bại',
  复制失败请手动复制: 'Sao chép thất bại, vui lòng sao chép thủ công',
  加载用户详情失败: 'Không tải được chi tiết người dùng',
  状态更新成功: 'Cập nhật trạng thái thành công',
  状态更新失败: 'Cập nhật trạng thái thất bại',
  刷新余额失败: 'Làm mới số dư thất bại',
  加载会员层级失败: 'Không tải được cấp thành viên',
  选择时间范围: 'Chọn khoảng thời gian',
  自动规则: 'Quy tắc tự động',
  全选当前页: 'Chọn tất cả trang hiện tại',
  批量自动出款: 'Chi trả tự động hàng loạt',
  VIP等级规则: 'Quy tắc cấp VIP',
  最低VIP等级: 'Cấp VIP tối thiểu',
  自动审核规则设置: 'Cài đặt quy tắc kiểm duyệt tự động',
  '自动审核处理备注（可选）': 'Ghi chú xử lý kiểm duyệt tự động (tùy chọn)',
  活动详情: 'Chi tiết hoạt động',
  基本信息: 'Thông tin cơ bản',
  活动分类: 'Danh mục hoạt động',
  活动子种类: 'Danh mục con hoạt động',
  参与会员: 'Thành viên tham gia',
  赠送奖励: 'Thưởng tặng',
  最大参与人数: 'Số người tham gia tối đa',
  当前参与人数: 'Số người tham gia hiện tại',
  参与进度: 'Tiến độ tham gia',
  支持平台: 'Nền tảng hỗ trợ',
  活动开始时间: 'Thời gian bắt đầu hoạt động',
  活动结束时间: 'Thời gian kết thúc hoạt động',
  活动时长: 'Thời lượng hoạt động',
  内容信息: 'Thông tin nội dung',
  暂无内容信息: 'Chưa có thông tin nội dung',
  统计信息: 'Thông tin thống kê',
  活动要求: 'Yêu cầu hoạt động',
  活动描述: 'Mô tả hoạt động',
  活动规则: 'Quy tắc hoạt động',
  活动时间线: 'Dòng thời gian hoạt động',
  活动开始: 'Hoạt động đã bắt đầu',
  活动结束: 'Hoạt động đã kết thúc',
  来源类型: 'Loại nguồn',
  发放方式: 'Cách phát',
  获取时间: 'Thời gian nhận',
  上级代理: 'Đại lý cấp trên',
  优惠名称: 'Tên khuyến mãi',
  会员币种: 'Loại tiền thành viên',
  赠送奖励: 'Thưởng tặng',
  '发放奖励合计:': 'Tổng thưởng đã phát:',
  '正在加载数据...': 'Đang tải dữ liệu...',
  加载失败: 'Tải thất bại',
  后台手动派发: 'Phát thủ công từ backend',
  系统派发: 'Phát bởi hệ thống',
  手动领取: 'Nhận thủ công',
  折扣券: 'Phiếu giảm giá',
  积分抽奖: 'Xổ số điểm',
  银商结算: 'Thanh toán đại lý thanh toán',
  盲盒免费次数: 'Lượt quay hộp bí ẩn miễn phí',
  新人彩金: 'Thưởng thành viên mới',
  VIP奖励: 'Thưởng VIP',
  SVIP奖励: 'Thưởng SVIP',
  '上级代理详情暂不可用（需后端返回 upper_agent_id）':
    'Chi tiết đại lý cấp trên không khả dụng (backend cần trả về upper_agent_id)',
  '免审条件：同时满足设置的会员层级、标签、注册时长、金额限制等条件':
    'Điều kiện miễn duyệt: đáp ứng đồng thời cấp thành viên, nhãn, thời gian đăng ký, giới hạn số tiền',
  符合免审条件的提现订单自动处理: 'Tự động xử lý đơn rút đáp ứng điều kiện miễn duyệt',
  '设置符合免审出款的条件，满足条件的提现申请将自动通过审核':
    'Thiết lập điều kiện chi trả miễn duyệt; đơn đủ điều kiện sẽ được duyệt tự động',
};
Object.assign(zhToVi, GLOSSARY_ZH_VI);

/** en -> vi full phrases */
const EN_VI_PHRASE = {
  'Category badge cannot exceed 12 characters': 'Huy hiệu danh mục không được vượt quá 12 ký tự',
  'Category name cannot exceed 50 characters': 'Tên danh mục không được vượt quá 50 ký tự',
  'Manage creation, editing, monitoring, and statistics for all activities':
    'Quản lý tạo, chỉnh sửa, giám sát và thống kê mọi hoạt động',
  'User ID / Account': 'ID người dùng / Tài khoản',
  'User ID or Account': 'ID người dùng hoặc tài khoản',
  'Please select promotion source': 'Vui lòng chọn nguồn khuyến mãi',
  'Please select or search activity': 'Vui lòng chọn hoặc tìm hoạt động',
  'Please select reward type': 'Vui lòng chọn loại thưởng',
  'Failed to load activity list': 'Không tải được danh sách hoạt động',
  'All claim methods': 'Tất cả cách nhận',
  'Total rewards issued:': 'Tổng thưởng đã phát:',
  'Loading data...': 'Đang tải dữ liệu...',
  'Activity ID': 'Mã hoạt động',
  'Gift reward': 'Thưởng tặng',
  'Upper agent details unavailable (backend must return upper_agent_id)':
    'Chi tiết đại lý cấp trên không khả dụng (backend cần trả về upper_agent_id)',
  'No data to export': 'Không có dữ liệu để xuất',
  Rebate: 'Hoàn trả',
  'Commission rebate': 'Hoa hồng',
  'Interest Treasure': 'Kho lãi suất',
  'Merchant settlement': 'Thanh toán đại lý thanh toán',
  'Points lottery': 'Xổ số điểm',
  'Discount coupon': 'Phiếu giảm giá',
  'Manual claim': 'Nhận thủ công',
  'System distribution': 'Phát bởi hệ thống',
  'Manual backend distribution': 'Phát thủ công từ backend',
  'Double bonus': 'Thưởng gấp đôi',
  'Activity Points': 'Điểm hoạt động',
  Points: 'Điểm',
  'Mystery box free spins': 'Lượt quay hộp bí ẩn miễn phí',
  'Member ID': 'ID thành viên',
  'Upper Agent': 'Đại lý cấp trên',
  'Source type': 'Loại nguồn',
  'Distribution method': 'Cách phát',
  'Acquisition time': 'Thời gian nhận',
  'Red envelope': 'Lì xì',
  Promotion: 'Khuyến mãi',
  'New member bonus': 'Thưởng thành viên mới',
  'Load failed': 'Tải thất bại',
  'Activity details': 'Chi tiết hoạt động',
  'Activity Category': 'Danh mục hoạt động',
  'Activity subcategory': 'Danh mục con hoạt động',
  'Activity start time': 'Thời gian bắt đầu hoạt động',
  'Activity end time': 'Thời gian kết thúc hoạt động',
  'Activity duration': 'Thời lượng hoạt động',
  'Activity started': 'Hoạt động đã bắt đầu',
  'Activity ended': 'Hoạt động đã kết thúc',
  'Activity requirements': 'Yêu cầu hoạt động',
  'Activity description': 'Mô tả hoạt động',
  'Activity rules': 'Quy tắc hoạt động',
  'Activity timeline': 'Dòng thời gian hoạt động',
  'Activity saved as draft': 'Đã lưu hoạt động dạng nháp',
  'Activity copied successfully': 'Sao chép hoạt động thành công',
  'Activity platforms': 'Nền tảng hoạt động',
  'Activity statistics details': 'Chi tiết thống kê hoạt động',
  'Activity currency': 'Loại tiền hoạt động',
  'Modify Member Tier': 'Sửa cấp thành viên',
  'Copy failed': 'Sao chép thất bại',
  'Failed to load user details': 'Không tải được chi tiết người dùng',
  'Status updated successfully': 'Cập nhật trạng thái thành công',
  'Failed to update status': 'Cập nhật trạng thái thất bại',
  'Failed to refresh balance': 'Làm mới số dư thất bại',
  'Failed to load member tiers': 'Không tải được cấp thành viên',
  '3-Day mystery task feature is under development...':
    'Tính năng nhiệm vụ bí ẩn 3 ngày đang phát triển...',
  '3-Day mystery task feature coming soon. Stay tuned!':
    'Tính năng nhiệm vụ bí ẩn 3 ngày sắp ra mắt. Hãy chờ nhé!',
  'activity points settings under development...': 'Cài đặt điểm hoạt động đang phát triển...',
  'Dailytaskfeatureunder development...': 'Tính năng nhiệm vụ hàng ngày đang phát triển...',
  'Weeklytaskfeatureunder development...': 'Tính năng nhiệm vụ hàng tuần đang phát triển...',
  'Activity Reward': 'Thưởng hoạt động',
  'Exchange rate': 'Tỷ giá',
  'Low Risk': 'Rủi ro thấp',
  'Paid out': 'Đã chi trả',
  Cancelled: 'Đã hủy',
  'Success rate': 'Tỷ lệ thành công',
  Confirmed: 'Đã xác nhận',
  Expired: 'Đã hết hạn',
  'Credit Card': 'Thẻ tín dụng',
  'Already First deposit': 'Đã nạp lần đầu',
  'Enable/Disable': 'Bật/Tắt',
  'Interest Vault': 'Kho lãi suất',
  'Source Amount': 'Số tiền nguồn',
  Frozen: 'Đóng băng',
  Suspended: 'Tạm dừng',
  Temporary: 'Tạm thời',
  'By Day': 'Theo ngày',
  'By Week': 'Theo tuần',
  'By Month': 'Theo tháng',
  Terminal: 'Thiết bị',
  Quantity: 'Số lượng',
  Mark: 'Đánh dấu',
  Priority: 'Ưu tiên',
  Special: 'Đặc biệt',
  Config: 'Cấu hình',
  Test: 'Kiểm thử',
  Progress: 'Tiến độ',
  Clear: 'Xóa',
  Complete: 'Hoàn thành',
  Key: 'Khóa',
  Received: 'Đã nhận',
  Processing: 'Đang xử lý',
  Rejected: 'Đã từ chối',
  Blockchain: 'Blockchain',
  Mobile: 'Di động',
  Approve: 'Phê duyệt',
  Lottery: 'Xổ số',
  Esports: 'Esports',
  Arcade: 'Arcade',
  Cockfight: 'Đá gà',
  Slot: 'Slot',
  'Live Casino': 'Casino trực tiếp',
  'Please enter': 'Vui lòng nhập',
  'Please select': 'Vui lòng chọn',
  'Please check': 'Vui lòng kiểm tra',
  'Please fill in': 'Vui lòng điền',
  'Please generate': 'Vui lòng tạo',
  'under development': 'đang phát triển',
  'coming soon': 'sắp ra mắt',
  'Stay tuned': 'Hãy chờ nhé',
  'Load failed': 'Tải thất bại',
  'Operation failed': 'Thao tác thất bại',
  'Export failed': 'Xuất thất bại',
  'Update failed': 'Cập nhật thất bại',
  'Create failed': 'Tạo thất bại',
  'Delete failed': 'Xóa thất bại',
  successfully: 'thành công',
  'not found': 'không tìm thấy',
  'Order No.': 'Mã đơn hàng',
  'Third-party Payment': 'Thanh toán bên thứ ba',
  'Member account': 'Tài khoản thành viên',
  'Reward Icon': 'Biểu tượng thưởng',
  'Reward icon': 'Biểu tượng thưởng',
  'ShowActivity Name': 'Hiển thị tên hoạt động',
  'Click to view upper agent details': 'Bấm để xem chi tiết đại lý cấp trên',
  'Filter criteria': 'Tiêu chí lọc',
  'Claim method': 'Cách nhận',
  'Reward type': 'Loại thưởng',
  'Promotion source': 'Nguồn khuyến mãi',
  'Promotion name': 'Tên khuyến mãi',
  'Promotion statistics': 'Thống kê khuyến mãi',
  'Share management': 'Quản lý chia sẻ',
  'Activity center': 'Trung tâm hoạt động',
  'Activity list': 'Danh sách hoạt động',
  'Activity name': 'Tên hoạt động',
  'Closed activities': 'Hoạt động đã đóng',
  'Lucky wheel': 'Vòng quay may mắn',
  'Provident fund': 'Quỹ tích lũy',
  'Task center': 'Trung tâm nhiệm vụ',
  'New member benefits': 'Phúc lợi người mới',
  'Check-in activity': 'Hoạt động điểm danh',
  'Wagering activity': 'Hoạt động cược',
  'Deposit promotion': 'Khuyến mãi nạp tiền',
  'Rescue fund': 'Quỹ cứu trợ',
  'Physical orders': 'Đơn hàng vật phẩm',
  'Wheel list': 'Danh sách vòng quay',
  'Lucky value records': 'Lịch sử điểm may mắn',
  'Prize records': 'Lịch sử trúng thưởng',
  'Remaining lucky value': 'Điểm may mắn còn lại',
  'Earned lucky value': 'Điểm may mắn nhận được',
  'Fixed bonus': 'Thưởng cố định',
  'Random bonus': 'Thưởng ngẫu nhiên',
  'Physical item': 'Vật phẩm',
  'All types': 'Tất cả loại',
  'All statuses': 'Tất cả trạng thái',
  'Pending shipment': 'Chờ giao hàng',
  Shipped: 'Đã giao',
  'Bulk export': 'Xuất hàng loạt',
  'Silver wheel': 'Vòng bạc',
  'Gold wheel': 'Vòng vàng',
  'Diamond wheel': 'Vòng kim cương',
  'Manual adjustment': 'Điều chỉnh thủ công',
  Earned: 'Nhận được',
  Consumed: 'Đã tiêu',
  Expired: 'Hết hạn',
  Deducted: 'Đã khấu trừ',
  Operator: 'Người thao tác',
  Recipient: 'Người nhận',
};
Object.assign(enToVi, EN_VI_PHRASE);

/** Word-level replacements */
const ZH_VI_WORDS = [
  ['请输入', 'Vui lòng nhập'],
  ['请选择', 'Vui lòng chọn'],
  ['请设置', 'Vui lòng thiết lập'],
  ['请完善', 'Vui lòng hoàn thiện'],
  ['请至少', 'Vui lòng ít nhất'],
  ['请先', 'Vui lòng trước tiên'],
  ['请编辑', 'Vui lòng chỉnh sửa'],
  ['请保存', 'Vui lòng lưu'],
  ['请配置', 'Vui lòng cấu hình'],
  ['不能为空', 'Không được để trống'],
  ['0表示不限制', '0 nghĩa là không giới hạn'],
  ['修改', 'Sửa'],
  ['复制', 'Sao chép'],
  ['加载', 'Tải'],
  ['刷新', 'Làm mới'],
  ['更新', 'Cập nhật'],
  ['创建', 'Tạo'],
  ['删除', 'Xóa'],
  ['导出', 'Xuất'],
  ['导入', 'Nhập'],
  ['保存', 'Lưu'],
  ['提交', 'Gửi'],
  ['失败', 'Thất bại'],
  ['成功', 'Thành công'],
  ['会员', 'Thành viên'],
  ['层级', 'Cấp'],
  ['账号', 'Tài khoản'],
  ['用户', 'Người dùng'],
  ['订单', 'Đơn hàng'],
  ['状态', 'Trạng thái'],
  ['余额', 'Số dư'],
  ['金额', 'Số tiền'],
  ['充值', 'Nạp tiền'],
  ['提现', 'Rút tiền'],
  ['活动', 'Hoạt động'],
  ['任务', 'Nhiệm vụ'],
  ['奖励', 'Thưởng'],
  ['优惠', 'Khuyến mãi'],
  ['领取', 'Nhận'],
  ['派发', 'Phát'],
  ['稽核', 'Kiểm toán'],
  ['投注', 'Cược'],
  ['平台', 'Nền tảng'],
  ['配置', 'Cấu hình'],
  ['设置', 'Cài đặt'],
  ['详情', 'Chi tiết'],
  ['列表', 'Danh sách'],
  ['统计', 'Thống kê'],
  ['管理', 'Quản lý'],
  ['全部', 'Tất cả'],
  ['启用', 'Bật'],
  ['禁用', 'Tắt'],
  ['确定', 'Xác nhận'],
  ['取消', 'Hủy'],
  ['搜索', 'Tìm kiếm'],
  ['重置', 'Đặt lại'],
  ['操作', 'Thao tác'],
  ['备注', 'Ghi chú'],
  ['时间', 'Thời gian'],
  ['名称', 'Tên'],
  ['类型', 'Loại'],
  ['币种', 'Loại tiền'],
  ['人数', 'Số người'],
  ['次数', 'Số lần'],
  ['天数', 'Số ngày'],
  ['字符', 'ký tự'],
  ['不能超过', 'không được vượt quá'],
  ['个', ''],
  ['的', ''],
];
ZH_VI_WORDS.sort((a, b) => b[0].length - a[0].length);

const EN_VI_WORDS = [
  ['Please enter', 'Vui lòng nhập'],
  ['Please select', 'Vui lòng chọn'],
  ['Please check', 'Vui lòng kiểm tra'],
  ['Please fill in', 'Vui lòng điền'],
  ['Please generate', 'Vui lòng tạo'],
  ['Please set', 'Vui lòng thiết lập'],
  ['cannot exceed', 'không được vượt quá'],
  ['characters', 'ký tự'],
  ['under development', 'đang phát triển'],
  ['coming soon', 'sắp ra mắt'],
  ['Stay tuned', 'Hãy chờ nhé'],
  ['Activity', 'Hoạt động'],
  ['Member', 'Thành viên'],
  ['Reward', 'Thưởng'],
  ['Promotion', 'Khuyến mãi'],
  ['Withdrawal', 'Rút tiền'],
  ['Deposit', 'Nạp tiền'],
  ['Recharge', 'Nạp tiền'],
  ['Wagering', 'Cược'],
  ['Platform', 'Nền tảng'],
  ['Settings', 'Cài đặt'],
  ['Configuration', 'Cấu hình'],
  ['Manual', 'Thủ công'],
  ['Automatic', 'Tự động'],
  ['System', 'Hệ thống'],
  ['Default', 'Mặc định'],
  ['Preview', 'Xem trước'],
  ['Loading', 'Đang tải'],
  ['Failed', 'Thất bại'],
  ['Success', 'Thành công'],
  ['successfully', 'thành công'],
  ['Export', 'Xuất'],
  ['Import', 'Nhập'],
  ['Search', 'Tìm kiếm'],
  ['Reset', 'Đặt lại'],
  ['Confirm', 'Xác nhận'],
  ['Cancel', 'Hủy'],
  ['Submit', 'Gửi'],
  ['Update', 'Cập nhật'],
  ['Create', 'Tạo'],
  ['Delete', 'Xóa'],
  ['Edit', 'Sửa'],
  ['Modify', 'Sửa'],
  ['Status', 'Trạng thái'],
  ['Amount', 'Số tiền'],
  ['Order', 'Đơn hàng'],
  ['Account', 'Tài khoản'],
  ['Operator', 'Người thao tác'],
  ['Recipient', 'Người nhận'],
  ['Details', 'Chi tiết'],
  ['Detail', 'Chi tiết'],
  ['Description', 'Mô tả'],
  ['Statistics', 'Thống kê'],
  ['Management', 'Quản lý'],
  ['Filter', 'Lọc'],
  ['Criteria', 'Tiêu chí'],
  ['Method', 'Cách'],
  ['Type', 'Loại'],
  ['Source', 'Nguồn'],
  ['Distribution', 'Phát'],
  ['Acquisition', 'Nhận'],
  ['Upper', 'Cấp trên'],
  ['Agent', 'Đại lý'],
  ['Gift', 'Tặng'],
  ['Bonus', 'Thưởng'],
  ['Points', 'Điểm'],
  ['Task', 'Nhiệm vụ'],
  ['Wheel', 'Vòng quay'],
  ['Lucky', 'May mắn'],
  ['Value', 'Giá trị'],
  ['Records', 'Lịch sử'],
  ['Remaining', 'Còn lại'],
  ['Earned', 'Nhận được'],
  ['Consumed', 'Đã tiêu'],
  ['Physical', 'Vật phẩm'],
  ['Pending', 'Đang chờ'],
  ['Approved', 'Đã duyệt'],
  ['Rejected', 'Đã từ chối'],
  ['Processing', 'Đang xử lý'],
  ['Confirmed', 'Đã xác nhận'],
  ['Expired', 'Hết hạn'],
  ['Cancelled', 'Đã hủy'],
  ['Complete', 'Hoàn thành'],
  ['Already', 'Đã'],
  ['Not', 'Không'],
  ['No', 'Không'],
  ['All', 'Tất cả'],
  ['Enable', 'Bật'],
  ['Disable', 'Tắt'],
  ['Show', 'Hiển thị'],
  ['Hide', 'Ẩn'],
  ['Add', 'Thêm'],
  ['Remove', 'Xóa'],
  ['Save', 'Lưu'],
  ['Refresh', 'Làm mới'],
  ['Copy', 'Sao chép'],
  ['Load', 'Tải'],
  ['found', 'tìm thấy'],
  ['correct', 'đúng'],
  ['later', 'sau'],
  ['Refresh', 'Làm mới'],
  ['Third-party', 'Bên thứ ba'],
  ['Payment', 'Thanh toán'],
  ['Merchant', 'Đại lý thanh toán'],
  ['Exchange', 'Tỷ giá'],
  ['rate', 'tỷ lệ'],
  ['Risk', 'Rủi ro'],
  ['Frozen', 'Đóng băng'],
  ['Suspended', 'Tạm dừng'],
  ['Temporary', 'Tạm thời'],
  ['Terminal', 'Thiết bị'],
  ['Quantity', 'Số lượng'],
  ['Priority', 'Ưu tiên'],
  ['Special', 'Đặc biệt'],
  ['Progress', 'Tiến độ'],
  ['Received', 'Đã nhận'],
  ['Mobile', 'Di động'],
  ['Approve', 'Phê duyệt'],
  ['Rebate', 'Hoàn trả'],
  ['Interest', 'Lãi suất'],
  ['Treasure', 'Kho'],
  ['Vault', 'Kho'],
  ['Settlement', 'Thanh toán'],
  ['Coupon', 'Phiếu giảm giá'],
  ['Lottery', 'Xổ số'],
  ['Mystery', 'Bí ẩn'],
  ['box', 'hộp'],
  ['spins', 'lượt quay'],
  ['free', 'miễn phí'],
  ['New', 'Mới'],
  ['member', 'thành viên'],
  ['user', 'người dùng'],
  ['Red', 'Lì'],
  ['envelope', 'xì'],
  ['Double', 'Gấp đôi'],
  ['Claim', 'Nhận'],
  ['claim', 'nhận'],
  ['methods', 'cách'],
  ['issued', 'đã phát'],
  ['data', 'dữ liệu'],
  ['list', 'danh sách'],
  ['icon', 'biểu tượng'],
  ['Icon', 'Biểu tượng'],
  ['Name', 'Tên'],
  ['name', 'tên'],
  ['currency', 'loại tiền'],
  ['Currency', 'Loại tiền'],
  ['time', 'thời gian'],
  ['Time', 'Thời gian'],
  ['rules', 'quy tắc'],
  ['Rules', 'Quy tắc'],
  ['requirements', 'yêu cầu'],
  ['Requirements', 'Yêu cầu'],
  ['description', 'mô tả'],
  ['timeline', 'dòng thời gian'],
  ['started', 'đã bắt đầu'],
  ['ended', 'đã kết thúc'],
  ['duration', 'thời lượng'],
  ['category', 'danh mục'],
  ['subcategory', 'danh mục con'],
  ['platforms', 'nền tảng'],
  ['copied', 'sao chép'],
  ['draft', 'nháp'],
  ['saved', 'đã lưu'],
  ['as', 'dạng'],
  ['development', 'phát triển'],
  ['feature', 'tính năng'],
  ['mystery', 'bí ẩn'],
  ['Day', 'Ngày'],
  ['Daily', 'Hàng ngày'],
  ['Weekly', 'Hàng tuần'],
  ['Monthly', 'Hàng tháng'],
  ['Custom', 'Tùy chỉnh'],
  ['Select', 'Chọn'],
  ['enter', 'nhập'],
  ['select', 'chọn'],
  ['or', 'hoặc'],
  ['and', 'và'],
  ['for', 'cho'],
  ['to', ''],
  ['the', ''],
  ['a', ''],
  ['an', ''],
  ['of', ''],
  ['in', 'trong'],
  ['with', 'với'],
  ['from', 'từ'],
  ['by', 'bởi'],
  ['is', ''],
  ['are', ''],
  ['be', ''],
  ['must', 'phải'],
  ['return', 'trả về'],
  ['backend', 'backend'],
  ['unavailable', 'không khả dụng'],
  ['details', 'chi tiết'],
  ['view', 'xem'],
  ['Click', 'Bấm'],
  ['click', 'bấm'],
  ['upper', 'cấp trên'],
  ['agent', 'đại lý'],
  ['tier', 'cấp'],
  ['Tier', 'Cấp'],
  ['balance', 'số dư'],
  ['Balance', 'Số dư'],
  ['refresh', 'làm mới'],
  ['update', 'cập nhật'],
  ['tiers', 'cấp'],
];
EN_VI_WORDS.sort((a, b) => b[0].length - a[0].length);

function replaceWords(text, pairs) {
  let s = text;
  for (const [from, to] of pairs) {
    if (s.includes(from)) s = s.split(from).join(to);
  }
  return s
    .replace(/，/g, ', ')
    .replace(/。/g, '.')
    .replace(/；/g, '; ')
    .replace(/：/g, ': ')
    .replace(/（/g, ' (')
    .replace(/）/g, ') ')
    .replace(/、/g, ', ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.:;!?])/g, '$1')
    .trim();
}

function translateFromZh(zh) {
  if (!zh || typeof zh !== 'string') return null;
  if (zhToVi[zh] && isCleanVi(zhToVi[zh])) return zhToVi[zh];
  let s = replaceWords(zh, ZH_VI_WORDS.map(([a, b]) => [a, b]));
  if (isCleanVi(s)) {
    zhToVi[zh] = s;
    return s;
  }
  return null;
}

function translateFromEn(en) {
  if (!en || typeof en !== 'string') return null;
  if (enToVi[en] && isCleanVi(enToVi[en])) return enToVi[en];
  // Exact case-insensitive match
  const lower = en.toLowerCase();
  for (const [k, v] of Object.entries(enToVi)) {
    if (k.toLowerCase() === lower && isCleanVi(v)) return v;
  }
  let s = replaceWords(en, EN_VI_WORDS);
  if (isCleanVi(s)) {
    enToVi[en] = s;
    return s;
  }
  return null;
}

function resolveVi(zh, en, vi, key) {
  if (GARBAGE_KEY_RE.test(key) || (typeof zh === 'string' && CORRUPT_RE.test(zh))) {
    return vi;
  }
  if (isCleanVi(vi) && vi !== en) return vi;

  const candidates = [];
  // Always prefer zh-based translation when fixing polluted strings
  if (zh) {
    if (zhToVi[zh] && isCleanVi(zhToVi[zh])) candidates.push(zhToVi[zh]);
    const fromZh = translateFromZh(zh);
    if (fromZh) candidates.push(fromZh);
  }
  if (en) {
    if (enToVi[en] && isCleanVi(enToVi[en])) candidates.push(enToVi[en]);
    const fromEn = translateFromEn(en);
    if (fromEn) candidates.push(fromEn);
  }
  if (vi && vi !== zh && vi !== en) {
    const fromVi = translateFromEn(vi);
    if (fromVi) candidates.push(fromVi);
  }

  for (const c of candidates) {
    if (isCleanVi(c)) return c;
  }
  return vi;
}

function walkFix(zhNode, enNode, viNode, stats, keyPrefix = '') {
  if (!viNode || typeof viNode !== 'object') viNode = {};
  for (const key of Object.keys(zhNode)) {
    const zhVal = zhNode[key];
    const fullKey = keyPrefix ? `${keyPrefix}.${key}` : key;

    if (zhVal && typeof zhVal === 'object' && !Array.isArray(zhVal)) {
      if (!viNode[key] || typeof viNode[key] !== 'object') viNode[key] = {};
      const enChild = enNode?.[key] && typeof enNode[key] === 'object' ? enNode[key] : {};
      walkFix(zhVal, enChild, viNode[key], stats, fullKey);
      continue;
    }

    if (typeof zhVal !== 'string') continue;
    const enVal = typeof enNode?.[key] === 'string' ? enNode[key] : undefined;
    const curVi = viNode[key];
    if (typeof curVi !== 'string') continue;
    if (!needsFix(curVi) && isCleanVi(curVi)) continue;

    const newVi = resolveVi(zhVal, enVal, curVi, key);
    if (newVi && newVi !== curVi && isCleanVi(newVi)) {
      viNode[key] = newVi;
      stats.fixed++;
      if (zhVal) zhToVi[zhVal] = newVi;
      if (enVal) enToVi[enVal] = newVi;
    }
  }
  return viNode;
}

function countIssues(obj) {
  let cn = 0;
  let en = 0;
  const w = (n) => {
    if (typeof n === 'string') {
      if (hasChinese(n)) cn++;
      else if (hasEnglishPollution(n) && !CORRUPT_RE.test(n)) en++;
    } else if (n && typeof n === 'object') Object.values(n).forEach(w);
  };
  w(obj);
  return { cn, en };
}

// Run 3 passes for map growth
const files = fs.readdirSync(path.join(appLocales, 'vi-VN')).filter((f) => f.endsWith('.json'));
const results = [];

for (let pass = 1; pass <= 3; pass++) {
  for (const file of files) {
    const zhPath = path.join(appLocales, 'zh-CN', file);
    if (!fs.existsSync(zhPath)) continue;
    const zh = readJson(zhPath);
    const en = fs.existsSync(path.join(appLocales, 'en-US', file))
      ? readJson(path.join(appLocales, 'en-US', file))
      : {};
    const viPath = path.join(appLocales, 'vi-VN', file);
    let vi = readJson(viPath);
    const stats = { fixed: 0 };
    walkFix(zh, en, vi, stats);
    if (stats.fixed > 0) writeJson(viPath, vi);
    if (pass === 3) {
      const issues = countIssues(vi);
      results.push({ file, ...issues, fixed: stats.fixed });
    }
  }
}

// Critical overrides
const pageVi = readJson(path.join(appLocales, 'vi-VN/page.json'));
pageVi.menu.promotionalActivities = 'Hoạt động khuyến mãi';
writeJson(path.join(appLocales, 'vi-VN/page.json'), pageVi);

const financeVi = readJson(path.join(appLocales, 'vi-VN/finance.json'));
financeVi.kt982i = 'Nạp tiền trực tuyến';
writeJson(path.join(appLocales, 'vi-VN/finance.json'), financeVi);

console.log(`Phrase maps: zh->vi ${Object.keys(zhToVi).length}, en->vi ${Object.keys(enToVi).length}`);
for (const r of results.sort((a, b) => b.cn + b.en - (a.cn + a.en))) {
  console.log(`${r.file}: ${r.cn} Chinese, ${r.en} English-like remaining`);
}
