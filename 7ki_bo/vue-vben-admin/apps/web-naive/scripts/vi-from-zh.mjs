/**
 * Safe vi-VN rebuild: translate ONLY from zh-CN (never mangling existing vi with EN word replace).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, '../src/locales/langs');
const pkgLocales = path.resolve(__dirname, '../../../packages/locales/src/langs');

const CH = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/;
const EN_POLLUTION =
  /\b(Please|Select|Enter|Activity|Member|Order|Failed|Loading|Success|Export|Import|Search|Reset|Confirm|Cancel|Submit|Update|Create|Delete|Edit|Status|Amount|Reward|Task|Platform|Settings|Config|Manual|Automatic|System|Default|Preview|Upload|Download|Bulk|Total|Enable|Disable|Show|Hide|Add|Remove|Save|Back|Next|Refresh|Filter|Pending|Approved|Rejected|Processing|Complete|Minimum|Maximum|Recent|Single|Daily|Weekly|Monthly|Custom|Unknown|Error|Warning|feature|development|coming|soon|Stay|tuned|unavailable|requirements|description|statistics|management|distribution|acquisition|settlement|coupon|lottery|mystery|rebate|merchant|interest|treasure|withdrawal|deposit|recharge|wagering|promotion|operator|recipient|participants|progress|supported|content|rules|basic|info|category|subcategory|timeline|started|ended|duration|platforms|copied|draft|saved|gift|bonus|points|claim|methods|issued|data|list|icon|currency|source|upper|agent|detail|details|view|click|tier|balance|security|registration|login|transaction|history|ratio|risk|control|limit|optional|process|remark|auto|approval|payout|range|within|count|Current|Page|Basic|Max|No|Gift|Operator|User|Commission|Interest|Treasure|Merchant|Discount|backend|Mystery|box|free|spins|Upper|Type|Participation|Content|under|Simulated|giftamount|SVIPReward|VIPReward|ShowActivity|Ratio|Slot|Lottery|Esports|Arcade|Cockfight|Approve|Frozen|Suspended|Temporary|Terminal|Quantity|Exchange|Mark|Priority|Special|Test|Progress|Clear|Complete|Key|Received|Blockchain|Mobile|Cancelled|Confirmed|Expired|Credit|Card|Vault|optional|modify|copy|load|refresh|found|correct|later|already|rules|rule|level|levels|label|labels|records|record|compact|actions|action|meets|conditions|condition|desc|nter|upperlimit|lackname|argetype|Third|party|Payment|Check|Account|Simulated)\b/i;
const CORRUPT_RE = /<[^>]+>|n-button|v-model|v-if=|<!--|class=/i;
const GARBAGE_KEY_RE = /NButton|DivClass|Template|VModel|NTabPane|NIconSize|Const[A-Z]/;
const ALLOWED = /^(VIP|SVIP|KYC|BRL|USD|CNY|iOS|Android|PC|PWA|H5|APP|TG|SMS|IP|ID|OK|API|URL|CSV|XLSX|XLS|PDF|PNG|JPEG|JPG|GIF|MB|px|T&C|ALL|RTP)$/i;

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function writeJson(p, d) {
  fs.writeFileSync(p, `${JSON.stringify(d, null, 2)}\n`, 'utf8');
}
function hasChinese(s) {
  return typeof s === 'string' && CH.test(s);
}
function hasEnglishPollution(s) {
  if (typeof s !== 'string') return false;
  const stripped = s.replace(/\{[^}]+\}/g, ' ').replace(/\{\{[^}]+\}\}/g, ' ');
  if (EN_POLLUTION.test(stripped)) return true;
  const tokens = stripped.match(/\b[A-Za-z]{4,}\b/g) || [];
  return tokens.some((t) => !ALLOWED.test(t));
}
function sanitizeVi(s) {
  if (typeof s !== 'string') return s;
  return s
    .replace(/\bbackend\b/gi, 'hệ thống quản trị')
    .replace(/\bfrontend\b/gi, 'giao diện người dùng')
    .replace(/\bEsports\b/g, 'Thể thao điện tử')
    .replace(/\bicon\b/gi, 'biểu tượng')
    .replace(/\barcade\b/gi, 'điện tử')
    .replace(/\bBlockchain\b/g, 'Chuỗi khối')
    .replace(/\bpayout\b/gi, 'chi trả')
    .replace(/\bPayout\b/g, 'Chi trả')
    .replace(/\bforce cancel\b/gi, 'hủy cưỡng bức')
    .replace(/\bforce success\b/gi, 'thành công cưỡng bức')
    .replace(/\brefresh callback\b/gi, 'gọi lại làm mới')
    .replace(/\bre-payout\b/gi, 'chi trả lại')
    .replace(/\bmanual payout done\b/gi, 'đã chi trả thủ công')
    .replace(/\bwithdrawal\b/gi, 'rút tiền')
    .replace(/\bWithdrawal\b/g, 'Rút tiền')
    .replace(/\bDeposit\b/g, 'Nạp tiền')
    .replace(/\bdeposit\b/gi, 'nạp tiền')
    .replace(/\bRemark\b/g, 'Ghi chú')
    .replace(/\bremark\b/g, 'ghi chú')
    .replace(/\bAssign\b/g, 'Giao')
    .replace(/\bassign\b/g, 'giao')
    .replace(/\btasks\b/gi, 'nhiệm vụ')
    .replace(/\bTasks\b/g, 'Nhiệm vụ')
    .replace(/\bActual received\b/gi, 'Thực nhận')
    .replace(/\bActual Received\b/g, 'Thực nhận')
    .replace(/\bEst\. Arrival\b/gi, 'Dự kiến nhận')
    .replace(/\bFee\b/g, 'Phí')
    .replace(/\bCurrent Balance\b/gi, 'Số dư hiện tại')
    .replace(/\bDuplicate IP Users\b/gi, 'Số người trùng IP')
    .replace(/\bCumulative Diff\b/gi, 'Chênh lệch tích lũy')
    .replace(/\bDep\/Wd Count\b/gi, 'Số lần nạp/rút')
    .replace(/\bCompletion duration\b/gi, 'Thời gian hoàn thành')
    .replace(/\bTreasure Chest\b/gi, 'Rương kho báu')
    .replace(/\bReady to Claim\b/gi, 'Sẵn sàng nhận')
    .replace(/\bEnded activities\b/gi, 'Hoạt động đã kết thúc')
    .replace(/\bTotal participation records\b/gi, 'Tổng bản ghi tham gia')
    .replace(/\bTotal participants\b/gi, 'Tổng số người tham gia')
    .replace(/\bTotal reward amount\b/gi, 'Tổng số tiền thưởng')
    .replace(/\bFailed to load activity records\b/gi, 'Không tải được lịch sử hoạt động')
    .replace(/\bFailed to copy activity\b/gi, 'Sao chép hoạt động thất bại')
    .replace(/\bPositive to add, negative to deduct\b/gi, 'Số dương để cộng, số âm để trừ')
    .replace(/\bPrize quantity\b/gi, 'Số lượng giải thưởng')
    .replace(/\s+/g, ' ')
    .trim();
}

function isAcceptableVi(s) {
  const t = sanitizeVi(s);
  return typeof t === 'string' && t.trim() && !hasChinese(t) && !hasEnglishPollution(t);
}

function isCleanVi(s) {
  return isAcceptableVi(s) && !CORRUPT_RE.test(String(s));
}

function parallelMap(zh, vi, map) {
  for (const k of Object.keys(zh || {})) {
    const z = zh[k];
    const v = vi?.[k];
    if (z && typeof z === 'object') parallelMap(z, v, map);
    else if (typeof z === 'string' && typeof v === 'string' && isCleanVi(v) && v !== z) map[z] = v;
  }
}

const zhToVi = {};
parallelMap(readJson(path.join(pkgLocales, 'zh-CN/common.json')), readJson(path.join(pkgLocales, 'vi-VN/common.json')), zhToVi);

const ft = readJson(path.join(__dirname, 'finance-translations.json'));
for (const [zh, e] of Object.entries(ft)) {
  if (e?.vi && isCleanVi(e.vi)) zhToVi[zh] = e.vi;
}

for (const name of fs.readdirSync(path.join(localesDir, 'vi-VN'))) {
  if (!name.endsWith('.json')) continue;
  const zp = path.join(localesDir, 'zh-CN', name);
  if (!fs.existsSync(zp)) continue;
  parallelMap(readJson(zp), readJson(path.join(localesDir, 'vi-VN', name)), zhToVi);
}

const PHRASE = {
  在线充值: 'Nạp tiền trực tuyến',
  优惠活动: 'Hoạt động khuyến mãi',
  活动中心: 'Trung tâm hoạt động',
  活动列表: 'Danh sách hoạt động',
  已关闭活动: 'Hoạt động đã đóng',
  优惠统计: 'Thống kê khuyến mãi',
  分享管理: 'Quản lý chia sẻ',
  用户活动: 'Hoạt động người dùng',
  幸运转盘: 'Vòng quay may mắn',
  公积金: 'Quỹ tích lũy',
  任务中心: 'Trung tâm nhiệm vụ',
  风控审核: 'Kiểm duyệt rủi ro',
  由我风控: 'Rủi ro do tôi phụ trách',
  本周: 'Tuần này',
  列配置: 'Cài đặt cột',
  大类角标不能超过12个字符: 'Huy hiệu danh mục không được vượt quá 12 ký tự',
  大类名称不能超过50个字符: 'Tên danh mục không được vượt quá 50 ký tự',
  选择时间范围: 'Chọn khoảng thời gian',
  自动规则: 'Quy tắc tự động',
  全选当前页: 'Chọn tất cả trang hiện tại',
  批量自动出款: 'Xác nhận chi trả tự động hàng loạt',
  自动审核规则设置: 'Cài đặt quy tắc kiểm duyệt tự động',
  '自动审核处理备注（可选）': 'Ghi chú xử lý kiểm duyệt tự động (tùy chọn)',
  '设置符合免审出款的条件，满足条件的提现申请将自动通过审核':
    'Thiết lập điều kiện chi trả miễn duyệt; đơn đủ điều kiện sẽ được duyệt tự động',
  符合免审条件的提现订单自动处理: 'Tự động xử lý đơn rút đáp ứng điều kiện miễn duyệt',
  '免审条件：同时满足设置的会员层级、标签、注册时长、金额限制等条件':
    'Điều kiện miễn duyệt: đáp ứng cấp thành viên, nhãn, thời gian đăng ký và giới hạn số tiền',
  VIP等级规则: 'Quy tắc cấp VIP',
  最低VIP等级: 'Cấp VIP tối thiểu',
  请选择或搜索活动: 'Vui lòng chọn hoặc tìm hoạt động',
  请选择优惠来源: 'Vui lòng chọn nguồn khuyến mãi',
  请选择奖励类型: 'Vui lòng chọn loại thưởng',
  加载活动列表失败: 'Không tải được danh sách hoạt động',
  '用户ID/账号': 'ID người dùng / Tài khoản',
  用户ID或账号: 'ID người dùng hoặc tài khoản',
  '用户ID 或 账号': 'ID người dùng hoặc tài khoản',
  发放奖励合计: 'Tổng thưởng đã phát:',
  '发放奖励合计:': 'Tổng thưởng đã phát:',
  '正在加载数据...': 'Đang tải dữ liệu...',
  没有数据可导出: 'Không có dữ liệu để xuất',
  活动ID: 'Mã hoạt động',
  赠送奖励: 'Thưởng tặng',
  全部领取方式: 'Tất cả cách nhận',
  返水: 'Hoàn trả',
  返佣: 'Hoa hồng',
  VIP奖励: 'Thưởng VIP',
  SVIP奖励: 'Thưởng SVIP',
  利息宝: 'Kho lãi suất',
  银商结算: 'Thanh toán đại lý thanh toán',
  积分抽奖: 'Xổ số điểm',
  折扣券: 'Phiếu giảm giá',
  手动领取: 'Nhận thủ công',
  系统派发: 'Phát bởi hệ thống',
  后台手动派发: 'Phát thủ công từ backend',
  加倍奖金: 'Thưởng gấp đôi',
  活跃度: 'Điểm hoạt động',
  盲盒免费次数: 'Lượt quay hộp bí ẩn miễn phí',
  优惠名称: 'Tên khuyến mãi',
  会员币种: 'Loại tiền thành viên',
  上级代理: 'Đại lý cấp trên',
  来源类型: 'Loại nguồn',
  发放方式: 'Cách phát',
  获取时间: 'Thời gian nhận',
  加载失败: 'Tải thất bại',
  活动详情: 'Chi tiết hoạt động',
  基本信息: 'Thông tin cơ bản',
  活动分类: 'Danh mục hoạt động',
  活动子种类: 'Danh mục con hoạt động',
  参与会员: 'Thành viên tham gia',
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
  '上级代理详情暂不可用（需后端返回 upper_agent_id）':
    'Chi tiết đại lý cấp trên không khả dụng (backend cần trả về upper_agent_id)',
  '管理所有活动的创建、编辑、监控和统计':
    'Quản lý tạo, chỉnh sửa, giám sát và thống kê mọi hoạt động',
  三天神秘任务: 'Nhiệm vụ bí ẩn 3 ngày',
  修改会员层级: 'Sửa cấp thành viên',
  复制失败: 'Sao chép thất bại',
  加载用户详情失败: 'Không tải được chi tiết người dùng',
  状态更新成功: 'Cập nhật trạng thái thành công',
  状态更新失败: 'Cập nhật trạng thái thất bại',
  刷新余额失败: 'Làm mới số dư thất bại',
  加载会员层级失败: 'Không tải được cấp thành viên',
  '已选择 {count} 条数据': 'Đã chọn {count} bản ghi',
  '共{count}条': 'Tổng {count} bản ghi',
  批量自动出款确认: 'Xác nhận chi trả tự động hàng loạt',
  选择最低VIP等级: 'Chọn cấp VIP tối thiểu',
  VIP用户免审金额上限: 'Giới hạn số tiền miễn duyệt VIP',
  输入金额上限: 'Vui lòng nhập giới hạn số tiền',
  账户安全规则: 'Quy tắc bảo mật tài khoản',
  账户注册天数: 'Số ngày đăng ký tài khoản',
  最少注册天数: 'Số ngày đăng ký tối thiểu',
  最近登录天数内: 'Trong số ngày đăng nhập gần đây',
  交易历史规则: 'Quy tắc lịch sử giao dịch',
  最少充值次数: 'Số lần nạp tối thiểu',
  风险控制规则: 'Quy tắc kiểm soát rủi ro',
  单笔免审金额上限: 'Giới hạn miễn duyệt một lần',
  日累计免审金额: 'Giới hạn miễn duyệt tích lũy theo ngày',
  每日累计最大金额: 'Số tiền tích lũy tối đa mỗi ngày',
  启用VIP免审: 'Bật miễn duyệt VIP',
  启用小额免审: 'Bật miễn duyệt số tiền nhỏ',
  启用老用户免审: 'Bật miễn duyệt người dùng lâu năm',
  启用高频用户免审: 'Bật miễn duyệt người dùng tần suất cao',
  免审出款详情: 'Chi tiết chi trả miễn duyệt',
  订单信息: 'Thông tin đơn hàng',
  免审规则匹配: 'Khớp quy tắc miễn duyệt',
  银行转账: 'Chuyển khoản ngân hàng',
  数字钱包: 'Ví điện tử',
  VIP免审: 'Miễn duyệt VIP',
  小额免审: 'Miễn duyệt số tiền nhỏ',
  老用户免审: 'Miễn duyệt người dùng lâu năm',
  高频用户免审: 'Miễn duyệt người dùng tần suất cao',
  '提现金额 当前金额 (实际金额)': 'Số tiền rút · Số tiền hiện tại (thực tế)',
  '充/提次数 (累计充/提金额) (重复IP人数)': 'Số lần nạp/rút · Tổng nạp/rút · Số người trùng IP',
  '收款方式 (收款人信息)': 'Phương thức nhận (thông tin người nhận)',
  前台备注: 'Ghi chú frontend',
  后台备注: 'Ghi chú backend',
  '三方代付 (代付次数)': 'Chi hộ bên thứ ba (số lần chi hộ)',
  免审规则: 'Quy tắc miễn duyệt',
  自动出款: 'Chi trả tự động',
  导出搜索功能开发中: 'Tính năng tìm kiếm xuất đang phát triển',
  暂无符合免审条件的订单: 'Không có đơn đủ điều kiện miễn duyệt',
  '获取数据失败，请稍后重试': 'Không lấy được dữ liệu, vui lòng thử lại sau',
  成功自动处理提现申请: 'Xử lý tự động yêu cầu rút tiền thành công',
  自动审核规则保存成功: 'Đã lưu quy tắc kiểm duyệt tự động',
  '自动审核规则保存成功 (模拟)': 'Đã lưu quy tắc kiểm duyệt tự động (mô phỏng)',
  输入前台取消原因: 'Nhập lý do hủy hiển thị frontend',
  请输入前台备注: 'Vui lòng nhập ghi chú frontend',
  输入后台取消原因: 'Nhập lý do hủy backend',
  请输入后台备注: 'Vui lòng nhập ghi chú backend',
  '操作说明（选填）': 'Hướng dẫn thao tác (tùy chọn)',
  请输入操作说明: 'Vui lòng nhập hướng dẫn thao tác',
  没有活动信息: 'Không có thông tin hoạt động',
  预计支出: 'Chi phí dự kiến',
  电竞: 'Esports',
  街机: 'Arcade',
  真人: 'Casino trực tiếp',
  视频: 'Video',
  请输入有效投注金额: 'Vui lòng nhập số tiền cược hợp lệ',
  有效投注金额: 'Số tiền cược hợp lệ',
  请选择活动分类: 'Vui lòng chọn danh mục hoạt động',
  浏览记录: 'Lịch sử duyệt',
  确定要删除此活动吗: 'Bạn có chắc muốn xóa hoạt động này?',
  已结束的活动: 'Hoạt động đã kết thúc',
  请先选择要删除的活动: 'Vui lòng chọn hoạt động cần xóa trước',
  参与记录总数: 'Tổng bản ghi tham gia',
  参与总人数: 'Tổng số người tham gia',
  奖励总金额: 'Tổng số tiền thưởng',
  用户信息: 'Thông tin người dùng',
  加载活动记录失败: 'Không tải được lịch sử hoạt động',
  复制活动失败: 'Sao chép hoạt động thất bại',
  '确定要删除此活动吗？': 'Bạn có chắc muốn xóa hoạt động này?',
  已结束活动: 'Hoạt động đã kết thúc',
  总参与记录: 'Tổng bản ghi tham gia',
  有效投注额: 'Số tiền cược hợp lệ',
  登录前弹窗方式: 'Cách hiện popup trước đăng nhập',
  宝箱: 'Rương kho báu',
  分配出款任务: 'Giao nhiệm vụ chi trả',
  备注内容: 'Nội dung ghi chú',
  '实际到账：': 'Thực nhận:',
  批量强制取消: 'Hủy cưỡng bức hàng loạt',
  批量强制成功: 'Thành công cưỡng bức hàng loạt',
  批量刷新回调: 'Gọi lại làm mới hàng loạt',
  批量审核出款: 'Kiểm duyệt chi trả hàng loạt',
  批量重新出款: 'Chi trả lại hàng loạt',
  批量人工出款完成: 'Hoàn tất chi trả thủ công hàng loạt',
  人工出款确认: 'Xác nhận chi trả thủ công',
  确认人工出款: 'Xác nhận chi trả thủ công',
  重新出款设置成功: 'Cài đặt chi trả lại thành công',
  重新出款设置失败: 'Cài đặt chi trả lại thất bại',
  人工出款标记成功: 'Đánh dấu chi trả thủ công thành công',
};
Object.assign(zhToVi, PHRASE);

const WORDS = [
  ['请输入', 'Vui lòng nhập'],
  ['请选择', 'Vui lòng chọn'],
  ['请设置', 'Vui lòng thiết lập'],
  ['请完善', 'Vui lòng hoàn thiện'],
  ['请至少', 'Vui lòng ít nhất'],
  ['请先', 'Vui lòng trước tiên'],
  ['请编辑', 'Vui lòng chỉnh sửa'],
  ['请保存', 'Vui lòng lưu'],
  ['请配置', 'Vui lòng cấu hình'],
  ['0表示不限制', '0 nghĩa là không giới hạn'],
  ['自动审核', 'Kiểm duyệt tự động'],
  ['自动', 'Tự động'],
  ['批量', 'Hàng loạt'],
  ['出款', 'Chi trả'],
  ['免审', 'Miễn duyệt'],
  ['提现', 'Rút tiền'],
  ['充值', 'Nạp tiền'],
  ['会员', 'Thành viên'],
  ['账号', 'Tài khoản'],
  ['订单', 'Đơn hàng'],
  ['金额', 'Số tiền'],
  ['时间', 'Thời gian'],
  ['范围', 'Phạm vi'],
  ['规则', 'Quy tắc'],
  ['全选', 'Chọn tất cả'],
  ['当前页', 'trang hiện tại'],
  ['当前', 'Hiện tại'],
  ['最低', 'Tối thiểu'],
  ['最高', 'Tối đa'],
  ['等级', 'Cấp'],
  ['注册', 'Đăng ký'],
  ['登录', 'Đăng nhập'],
  ['最近', 'Gần đây'],
  ['交易', 'Giao dịch'],
  ['历史', 'Lịch sử'],
  ['单笔', 'Một lần'],
  ['单日', 'Một ngày'],
  ['风险', 'Rủi ro'],
  ['控制', 'Kiểm soát'],
  ['备注', 'Ghi chú'],
  ['可选', 'Tùy chọn'],
  ['处理', 'Xử lý'],
  ['审核', 'Kiểm duyệt'],
  ['条件', 'Điều kiện'],
  ['设置', 'Cài đặt'],
  ['标签', 'Nhãn'],
  ['限制', 'Giới hạn'],
  ['基本信息', 'Thông tin cơ bản'],
  ['分类', 'Danh mục'],
  ['子种类', 'Danh mục con'],
  ['参与', 'Tham gia'],
  ['赠送', 'Tặng'],
  ['奖励', 'Thưởng'],
  ['预计', 'Dự kiến'],
  ['支出', 'Chi phí'],
  ['开始', 'Bắt đầu'],
  ['结束', 'Kết thúc'],
  ['内容', 'Nội dung'],
  ['信息', 'Thông tin'],
  ['暂无', 'Chưa có'],
  ['加载', 'Tải'],
  ['失败', 'Thất bại'],
  ['成功', 'Thành công'],
  ['上级', 'Cấp trên'],
  ['代理', 'Đại lý'],
  ['来源', 'Nguồn'],
  ['发放', 'Phát'],
  ['方式', 'Cách'],
  ['获取', 'Nhận'],
  ['领取', 'Nhận'],
  ['点击', 'Bấm'],
  ['查看', 'Xem'],
  ['详情', 'Chi tiết'],
  ['活动', 'Hoạt động'],
  ['优惠', 'Khuyến mãi'],
  ['任务', 'Nhiệm vụ'],
  ['福利', 'Phúc lợi'],
  ['转盘', 'Vòng quay'],
  ['幸运值', 'Điểm may mắn'],
  ['公积金', 'Quỹ tích lũy'],
  ['今日', 'Hôm nay'],
  ['昨天', 'Hôm qua'],
  ['上周', 'Tuần trước'],
  ['搜索', 'Tìm kiếm'],
  ['导出', 'Xuất'],
  ['全部', 'Tất cả'],
  ['确定', 'Xác nhận'],
  ['取消', 'Hủy'],
  ['重置', 'Đặt lại'],
  ['操作', 'Thao tác'],
  ['状态', 'Trạng thái'],
  ['类型', 'Loại'],
  ['名称', 'Tên'],
  ['币种', 'Loại tiền'],
  ['人数', 'Số người'],
  ['次数', 'Số lần'],
  ['天数', 'Số ngày'],
  ['字符', 'ký tự'],
  ['不能超过', 'không được vượt quá'],
  ['稽核', 'Kiểm toán'],
  ['投注', 'Cược'],
  ['平台', 'Nền tảng'],
  ['配置', 'Cấu hình'],
  ['启用', 'Bật'],
  ['禁用', 'Tắt'],
  ['删除', 'Xóa'],
  ['编辑', 'Sửa'],
  ['修改', 'Sửa'],
  ['复制', 'Sao chép'],
  ['刷新', 'Làm mới'],
  ['更新', 'Cập nhật'],
  ['创建', 'Tạo'],
  ['保存', 'Lưu'],
  ['提交', 'Gửi'],
  ['备注', 'Ghi chú'],
  ['说明', 'Mô tả'],
  ['列表', 'Danh sách'],
  ['统计', 'Thống kê'],
  ['管理', 'Quản lý'],
  ['分享', 'Chia sẻ'],
  ['红包', 'Lì xì'],
  ['推广', 'Giới thiệu'],
  ['新人', 'Người mới'],
  ['彩金', 'Thưởng'],
  ['盲盒', 'Hộp bí ẩn'],
  ['免费', 'Miễn phí'],
  ['积分', 'Điểm'],
  ['最大', 'Tối đa'],
  ['进度', 'Tiến độ'],
  ['支持', 'Hỗ trợ'],
  ['时长', 'Thời lượng'],
  ['要求', 'Yêu cầu'],
  ['描述', 'Mô tả'],
  ['规则', 'Quy tắc'],
  ['无效', 'Không hợp lệ'],
  ['日期', 'Ngày'],
  ['格式', 'Định dạng'],
  ['错误', 'Sai'],
  ['电子', 'Slot'],
  ['真人', 'Casino trực tiếp'],
  ['体育', 'Thể thao'],
  ['彩票', 'Xổ số'],
  ['棋牌', 'Bài'],
  ['电竞', 'Esports'],
  ['捕鱼', 'Bắn cá'],
  ['街机', 'Arcade'],
  ['斗鸡', 'Đá gà'],
  ['批准', 'Phê duyệt'],
  ['拒绝', 'Từ chối'],
  ['冻结', 'Đóng băng'],
  ['暂停', 'Tạm dừng'],
  ['临时', 'Tạm thời'],
  ['正常', 'Bình thường'],
  ['处理中', 'Đang xử lý'],
  ['第三方', 'Bên thứ ba'],
  ['支付', 'Thanh toán'],
  ['商户', 'Đại lý thanh toán'],
  ['银行卡', 'Thẻ ngân hàng'],
  ['区块链', 'Blockchain'],
  ['信用卡', 'Thẻ tín dụng'],
  ['手机', 'Di động'],
  ['已选', 'Đã chọn'],
  ['共', 'Tổng'],
  ['条', 'bản ghi'],
  ['确认', 'Xác nhận'],
  ['满足', 'Đáp ứng'],
  ['符合', 'Đáp ứng'],
  ['满足', 'Đủ'],
  ['笔数', 'Số giao dịch'],
  ['比率', 'Tỷ lệ'],
  ['比例', 'Tỷ lệ'],
  ['存款', 'Nạp tiền'],
  ['提款', 'Rút tiền'],
  ['入金', 'Nạp tiền'],
  ['出金', 'Rút tiền'],
  ['天数', 'Số ngày'],
  ['以内', 'trong'],
  ['秒', 'giây'],
  ['分钟', 'phút'],
  ['小时', 'giờ'],
  ['天', 'ngày'],
  ['周', 'tuần'],
  ['月', 'tháng'],
];
WORDS.sort((a, b) => b[0].length - a[0].length);

function translateZh(zh) {
  if (!zh || typeof zh !== 'string') return null;
  if (PHRASE[zh]) return sanitizeVi(PHRASE[zh]);
  if (zhToVi[zh] && isAcceptableVi(zhToVi[zh])) return sanitizeVi(zhToVi[zh]);
  let s = zh;
  for (const [cn, vi] of WORDS) {
    if (s.includes(cn)) s = s.split(cn).join(vi);
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
  const out = sanitizeVi(s);
  if (isAcceptableVi(out)) {
    zhToVi[zh] = out;
    return out;
  }
  return null;
}

function walk(zhNode, enNode, viNode, stats, force = false) {
  if (!viNode || typeof viNode !== 'object') viNode = {};
  for (const key of Object.keys(zhNode)) {
    const zhVal = zhNode[key];
    if (zhVal && typeof zhVal === 'object' && !Array.isArray(zhVal)) {
      if (!viNode[key] || typeof viNode[key] !== 'object') viNode[key] = {};
      walk(zhVal, enNode?.[key], viNode[key], stats, force);
      continue;
    }
    if (typeof zhVal !== 'string' || GARBAGE_KEY_RE.test(key) || CORRUPT_RE.test(zhVal)) continue;
    const cur = viNode[key];
    const enVal = enNode?.[key];
    const polluted =
      force ||
      typeof cur !== 'string' ||
      hasChinese(cur) ||
      hasEnglishPollution(cur) ||
      (typeof enVal === 'string' && cur === enVal);
    if (!polluted) {
      const sanitized = sanitizeVi(cur);
      if (sanitized !== cur && isAcceptableVi(sanitized)) {
        viNode[key] = sanitized;
        stats.fixed++;
      }
      continue;
    }
    let next = translateZh(zhVal);
    if (!next && typeof cur === 'string') {
      const sanitized = sanitizeVi(cur);
      if (isAcceptableVi(sanitized)) next = sanitized;
    }
    if (next && next !== cur) {
      viNode[key] = next;
      stats.fixed++;
    }
  }
  return viNode;
}

const files = fs.readdirSync(path.join(localesDir, 'vi-VN')).filter((f) => f.endsWith('.json'));
for (const file of files) {
  const zhPath = path.join(localesDir, 'zh-CN', file);
  if (!fs.existsSync(zhPath)) continue;
  const zh = readJson(zhPath);
  const en = fs.existsSync(path.join(localesDir, 'en-US', file))
    ? readJson(path.join(localesDir, 'en-US', file))
    : {};
  const viPath = path.join(localesDir, 'vi-VN', file);
  const vi = readJson(viPath);
  const stats = { fixed: 0 };
  walk(zh, en, vi, stats, true);
  writeJson(viPath, vi);
  let cn = 0;
  let enCount = 0;
  const count = (n) => {
    if (typeof n === 'string') {
      if (hasChinese(n)) cn++;
      else if (hasEnglishPollution(n) && !CORRUPT_RE.test(n)) enCount++;
    } else if (n && typeof n === 'object') Object.values(n).forEach(count);
  };
  count(vi);
  console.log(`${file}: fixed ${stats.fixed}, remaining cn=${cn} en=${enCount}`);
}

// overrides
const page = readJson(path.join(localesDir, 'vi-VN/page.json'));
page.menu.promotionalActivities = 'Hoạt động khuyến mãi';
writeJson(path.join(localesDir, 'vi-VN/page.json'), page);
const finance = readJson(path.join(localesDir, 'vi-VN/finance.json'));
finance.kt982i = 'Nạp tiền trực tuyến';
writeJson(path.join(localesDir, 'vi-VN/finance.json'), finance);
const brand = readJson(path.join(localesDir, 'vi-VN/brand.json'));
if (brand.skin) brand.skin.configSaved = 'Cấu hình đã lưu';
writeJson(path.join(localesDir, 'vi-VN/brand.json'), brand);

console.log(`zh->vi map: ${Object.keys(zhToVi).length}`);
