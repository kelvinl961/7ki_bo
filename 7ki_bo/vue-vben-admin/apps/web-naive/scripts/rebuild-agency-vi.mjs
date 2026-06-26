/**
 * Rebuild vi-VN/agency.json from zh-CN with full Vietnamese translations.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, '../src/locales/langs');

const AGENCY_VI = {
  代理模式: 'Chế độ đại lý',
  代理模式名称: 'Tên chế độ đại lý',
  请输入模式名称: 'Vui lòng nhập tên chế độ',
  选择币种: 'Chọn loại tiền',
  模式来源: 'Nguồn chế độ',
  选择来源: 'Chọn nguồn',
  启用状态: 'Trạng thái kích hoạt',
  选择状态: 'Chọn trạng thái',
  是否默认: 'Có phải mặc định',
  选择默认: 'Chọn mặc định',
  结算周期: 'Chu kỳ quyết toán',
  选择周期: 'Chọn chu kỳ',
  新增代理模式: 'Thêm chế độ đại lý',
  代理公共设置: 'Cài đặt chung đại lý',
  净盈利设置: 'Cài đặt lợi nhuận ròng',
  代理等级设置: 'Cài đặt cấp đại lý',
  '已选择 {0} 条数据，共 {1} 条': 'Đã chọn {0} / {1} bản ghi',
  清空选择: 'Xóa lựa chọn',
  批量关闭: 'Đóng hàng loạt',
  编辑代理模式: 'Sửa chế độ đại lý',
  申请方式: 'Cách đăng ký',
  直接生效: 'Có hiệu lực ngay',
  需要审核: 'Cần kiểm duyệt',
  佣金计算层数: 'Số tầng tính hoa hồng',
  日结: 'Quyết toán theo ngày',
  周结: 'Quyết toán theo tuần',
  月结: 'Quyết toán theo tháng',
  自定义结算: 'Quyết toán tùy chỉnh',
  佣金计算依据: 'Cơ sở tính hoa hồng',
  有效投注: 'Cược hợp lệ',
  净盈利: 'Lợi nhuận ròng',
  业绩计算范围: 'Phạm vi tính thành tích',
  '全部计算（含无效）': 'Tính tất cả (kể cả không hợp lệ)',
  只计算有效会员业绩: 'Chỉ tính thành tích thành viên hợp lệ',
  代理教程设置: 'Cài đặt hướng dẫn đại lý',
  请选择模版: 'Vui lòng chọn mẫu',
  '阶梯返佣（按游戏类型）': 'Hoàn hoa hồng theo bậc (theo loại game)',
  '当前 {0} 共 {1} 个层级': 'Hiện tại {0}: {1} bậc',
  复制此配置到全部: 'Sao chép cấu hình này cho tất cả',
  新增层级: 'Thêm bậc',
  '有效人数(0不限)': 'Số người hợp lệ (0 = không giới hạn)',
  '有效投注(单位:金额)': 'Cược hợp lệ (số tiền)',
  '返佣比例(%)': 'Tỷ lệ hoàn hoa hồng (%)',
  返佣金额: 'Số tiền hoàn hoa hồng',
  自动升级代理: 'Tự động nâng cấp đại lý',
  批量保存: 'Lưu hàng loạt',
  图标: 'Biểu tượng',
  代理等级名称: 'Tên cấp đại lý',
  '晋升条件 (需获得佣金)': 'Điều kiện thăng cấp (cần nhận hoa hồng)',
  当前人数: 'Số người hiện tại',
  编辑代理等级: 'Sửa cấp đại lý',
  等级名称: 'Tên cấp',
  晋升条件: 'Điều kiện thăng cấp',
  图标颜色: 'Màu biểu tượng',
  代理模式ID: 'ID chế độ đại lý',
  模式名称: 'Tên chế độ',
  默认: 'Mặc định',
  系统自带: 'Hệ thống',
  自定义: 'Tùy chỉnh',
  超出部分额外返佣: 'Hoàn thêm phần vượt',
  上周期结算时间: 'Thời gian quyết toán kỳ trước',
  已使用人数: 'Số người đã dùng',
  请输入代理模式名称: 'Vui lòng nhập tên chế độ đại lý',
  请选择币种: 'Vui lòng chọn loại tiền',
  只算一级: 'Chỉ tính cấp một',
  最多两级: 'Tối đa hai cấp',
  最多三级: 'Tối đa ba cấp',
  无数级: 'Không giới hạn cấp',
  最多四级: 'Tối đa bốn cấp',
  最多五级: 'Tối đa năm cấp',
  自定义层数: 'Số tầng tùy chỉnh',
  默认模版: 'Mẫu mặc định',
  新手指南: 'Hướng dẫn người mới',
  高级教程: 'Hướng dẫn nâng cao',
  系统字体: 'Phông hệ thống',
  微软雅黑: 'Microsoft YaHei',
  确认复制配置: 'Xác nhận sao chép cấu hình',
  确认复制: 'Xác nhận sao chép',
  佣金设置: 'Cài đặt hoa hồng',
  待审核: 'Chờ duyệt',
  待领取: 'Chờ nhận',
  已撤回: 'Đã thu hồi',
  已拒绝: 'Đã từ chối',
  领取记录: 'Lịch sử nhận',
  全部记录: 'Tất cả lịch sử',
  昨天: 'Hôm qua',
  上周: 'Tuần trước',
  选择开始和结束日期: 'Chọn ngày bắt đầu và kết thúc',
  代理账号: 'Tài khoản đại lý',
  代理ID: 'ID đại lý',
  全部通过: 'Duyệt tất cả',
  全部拒绝: 'Từ chối tất cả',
  批量通过: 'Duyệt hàng loạt',
  批量拒绝: 'Từ chối hàng loạt',
  批量撤回: 'Thu hồi hàng loạt',
  佣金人工审核规则: 'Quy tắc kiểm duyệt hoa hồng thủ công',
  '佣金金额≥': 'Số tiền hoa hồng ≥',
  '佣金人工审核规则:': 'Quy tắc kiểm duyệt hoa hồng thủ công:',
  通过审核: 'Duyệt',
  原始佣金: 'Hoa hồng gốc',
  修改后佣金: 'Hoa hồng sau chỉnh sửa',
  确认通过: 'Xác nhận duyệt',
  拒绝佣金: 'Từ chối hoa hồng',
  佣金金额: 'Số tiền hoa hồng',
  拒绝原因: 'Lý do từ chối',
  请输入拒绝原因: 'Vui lòng nhập lý do từ chối',
  确认拒绝: 'Xác nhận từ chối',
  添加备注: 'Thêm ghi chú',
  备注内容: 'Nội dung ghi chú',
  请输入备注: 'Vui lòng nhập ghi chú',
  结算日期: 'Ngày quyết toán',
  佣金: 'Hoa hồng',
  后台备注: 'Ghi chú hệ thống quản trị',
  通过: 'Duyệt',
  拒绝: 'Từ chối',
  备注: 'Ghi chú',
  撤回: 'Thu hồi',
  撤回时间: 'Thời gian thu hồi',
  拒绝时间: 'Thời gian từ chối',
  领取时间: 'Thời gian nhận',
  已领取: 'Đã nhận',
  返佣层级配置: 'Cấu hình bậc hoàn hoa hồng',
  指标类型: 'Loại chỉ số',
  选择指标类型: 'Chọn loại chỉ số',
  保存配置: 'Lưu cấu hình',
  无限制: 'Không giới hạn',
  保存成功: 'Lưu thành công',
  保存失败: 'Lưu thất bại',
  体育: 'Thể thao',
  街机: 'Trò chơi arcade',
  区块链: 'Chuỗi khối',
  棋牌: 'Bài',
  斗鸡: 'Đá gà',
  捕鱼: 'Bắn cá',
  真人: 'Casino trực tiếp',
  彩票: 'Xổ số',
  电子: 'Nổ hũ',
  '确定要将"{0}"的配置复制到所有其他游戏类型吗？这将覆盖其他游戏类型的现有配置。':
    'Bạn có chắc muốn sao chép cấu hình "{0}" sang tất cả loại game khác? Thao tác này sẽ ghi đè cấu hình hiện có.',
  '已成功将"{0}"的配置复制到 {1} 个其他游戏类型':
    'Đã sao chép cấu hình "{0}" sang {1} loại game khác',
  当前游戏类型没有配置可复制: 'Loại game hiện tại không có cấu hình để sao chép',
  更新代理模式失败: 'Cập nhật chế độ đại lý thất bại',
  创建代理模式失败: 'Tạo chế độ đại lý thất bại',
  游戏返佣配置保存成功: 'Lưu cấu hình hoàn hoa hồng game thành công',
  '代理模式保存成功，但游戏返佣配置保存失败':
    'Lưu chế độ đại lý thành công, nhưng lưu cấu hình hoàn hoa hồng game thất bại',
  代理模式更新成功: 'Cập nhật chế độ đại lý thành công',
  代理模式创建成功: 'Tạo chế độ đại lý thành công',
  加载净盈利设置失败: 'Không tải được cài đặt lợi nhuận ròng',
  保存净盈利设置失败: 'Lưu cài đặt lợi nhuận ròng thất bại',
  净盈利设置已保存: 'Đã lưu cài đặt lợi nhuận ròng',
  加载代理公共设置失败: 'Không tải được cài đặt chung đại lý',
  保存代理公共设置失败: 'Lưu cài đặt chung đại lý thất bại',
  代理公共设置已保存: 'Đã lưu cài đặt chung đại lý',
  获取代理等级失败: 'Không tải được cấp đại lý',
  已取消修改: 'Đã hủy thay đổi',
  取消操作失败: 'Hủy thao tác thất bại',
  代理等级设置已确认: 'Đã xác nhận cài đặt cấp đại lý',
  确认操作失败: 'Xác nhận thao tác thất bại',
  代理等级设置已保存: 'Đã lưu cài đặt cấp đại lý',
  代理等级创建成功: 'Tạo cấp đại lý thành công',
  '成功批量更新 {0} 个代理等级': 'Đã cập nhật hàng loạt {0} cấp đại lý',
  批量保存失败: 'Lưu hàng loạt thất bại',
  '自动升级完成！共升级 {0} 个代理': 'Tự động nâng cấp hoàn tất! Đã nâng cấp {0} đại lý',
  自动升级结果: 'Kết quả tự động nâng cấp',
  没有代理符合升级条件: 'Không có đại lý đủ điều kiện nâng cấp',
  自动升级失败: 'Tự động nâng cấp thất bại',
  '已启用代理模式: {0}': 'Đã bật chế độ đại lý: {0}',
  '已停用代理模式: {0}': 'Đã tắt chế độ đại lý: {0}',
  '状态更新失败: {0}': 'Cập nhật trạng thái thất bại: {0}',
  无法禁用该货币的最后一个代理模式: 'Không thể tắt chế độ đại lý cuối cùng của loại tiền này',
  '加载游戏返佣配置失败，将使用默认配置: {0}':
    'Không tải được cấu hình hoàn hoa hồng game, dùng mặc định: {0}',
  净盈利排除平台运营成本: 'Loại trừ chi phí vận hành nền tảng khỏi lợi nhuận ròng',
  所有优惠和活动: 'Tất cả khuyến mãi và hoạt động',
  三方游戏统一成本: 'Chi phí thống nhất game bên thứ ba',
  充值手续费: 'Phí nạp tiền',
  提现手续费: 'Phí rút tiền',
  上期结余: 'Số dư kỳ trước',
  默认代理模式设置: 'Cài đặt chế độ đại lý mặc định',
  一级代理: 'Đại lý cấp một',
  返佣前端显示格式设置: 'Cài đặt định dạng hiển thị hoàn hoa hồng trên giao diện',
  展示佣金比例: 'Hiển thị tỷ lệ hoa hồng',
  展示佣金金额: 'Hiển thị số tiền hoa hồng',
  展示佣金金额和比例: 'Hiển thị số tiền và tỷ lệ hoa hồng',
  返佣比例表: 'Bảng tỷ lệ hoàn hoa hồng',
  添加行: 'Thêm dòng',
  业绩: 'Thành tích',
  序号: 'Thứ tự',
  结算设置: 'Cài đặt quyết toán',
  佣金领取时间: 'Thời gian nhận hoa hồng',
  每天: 'Mỗi ngày',
  佣金积分倍数: 'Hệ số điểm hoa hồng',
  无需积分: 'Không cần điểm',
  倍数: 'Hệ số',
  倍: 'lần',
  有效人数计算: 'Tính số người hợp lệ',
  直属下级单个会员在结算周期内有效投注:
    'Cược hợp lệ của từng thành viên cấp dưới trực tiếp trong chu kỳ quyết toán',
  '并且直属下级单个会员在结算周期内充值>':
    'Và nạp tiền của từng thành viên cấp dưới trực tiếp trong chu kỳ quyết toán >',
  直属下级单个会员返佣上限: 'Giới hạn hoàn hoa hồng mỗi thành viên cấp dưới trực tiếp',
  日结模式上限: 'Giới hạn quyết toán theo ngày',
  周结模式上限: 'Giới hạn quyết toán theo tuần',
  月结模式上限: 'Giới hạn quyết toán theo tháng',
  '晋级需再获得{0}佣金的代理': 'Cần thêm {0} hoa hồng để thăng cấp',
  配置该代理模式的阶梯返佣规则: 'Cấu hình quy tắc hoàn hoa hồng theo bậc cho chế độ đại lý này',
  '配置该代理模式的阶梯返佣规则，每个层级可以设置不同的门槛和比例。':
    'Cấu hình quy tắc hoàn hoa hồng theo bậc cho chế độ đại lý này. Mỗi bậc có thể đặt ngưỡng và tỷ lệ khác nhau.',
  返佣层级配置: 'Cấu hình bậc hoàn hoa hồng',
  '第{0}级': 'Bậc {0}',
  层级序号: 'Số thứ tự bậc',
  门槛下限: 'Ngưỡng tối thiểu',
  门槛上限: 'Ngưỡng tối đa',
  '最大值（不填表示无上限）': 'Giá trị tối đa (để trống = không giới hạn)',
  单级封顶: 'Trần mỗi bậc',
  单级最大返佣金额: 'Số tiền hoàn hoa hồng tối đa mỗi bậc',
  '超出部分额外比例(%)': 'Tỷ lệ thêm phần vượt (%)',
  超出部分额外返佣比例: 'Tỷ lệ hoàn thêm phần vượt',
  复杂规则配置: 'Cấu hình quy tắc phức tạp',
  'JSON格式的复杂规则配置（可选）': 'Cấu hình quy tắc phức tạp dạng JSON (tùy chọn)',
  暂无层级配置: 'Chưa có cấu hình bậc',
  '暂无层级配置，点击上方按钮新增': 'Chưa có cấu hình bậc, nhấn nút phía trên để thêm',
  配置预览: 'Xem trước cấu hình',
  门槛范围: 'Phạm vi ngưỡng',
  额外比例: 'Tỷ lệ thêm',
  加载层级配置失败: 'Không tải được cấu hình bậc',
  层级序号不能重复: 'Số thứ tự bậc không được trùng',
  层级序号必须大于0: 'Số thứ tự bậc phải lớn hơn 0',
  请选择指标类型: 'Vui lòng chọn loại chỉ số',
  门槛下限不能为空且必须大于等于0: 'Ngưỡng tối thiểu bắt buộc và phải ≥ 0',
  门槛上限不能小于下限: 'Ngưỡng tối đa không được nhỏ hơn tối thiểu',
  '返佣比例必须在0-100之间': 'Tỷ lệ hoàn hoa hồng phải từ 0–100',
  '第{0}级的复杂规则JSON格式错误': 'Định dạng JSON quy tắc phức tạp bậc {0} không hợp lệ',
  存款: 'Nạp',
  组合: 'Tổ hợp',
  '1.若佣金结算之后的佣金超过设置的金额, 将被人工审核；':
    '1. Nếu hoa hồng sau quyết toán vượt mức đã đặt, sẽ cần kiểm duyệt thủ công;',
  '2.0表示不限制。': '2. 0 nghĩa là không giới hạn.',
  确定要撤回此佣金吗: 'Bạn có chắc muốn thu hồi hoa hồng này?',
  '确定要撤回此佣金吗？': 'Bạn có chắc muốn thu hồi hoa hồng này?',
  加载设置失败: 'Không tải được cài đặt',
  获取数据失败: 'Không tải được dữ liệu',
  审核通过: 'Đã duyệt',
  备注已保存: 'Đã lưu ghi chú',
  '确定要通过选中的 {0} 条记录吗？': 'Bạn có chắc muốn duyệt {0} bản ghi đã chọn?',
  '确定要拒绝选中的 {0} 条记录吗？此操作不可撤销！':
    'Bạn có chắc muốn từ chối {0} bản ghi đã chọn? Thao tác này không thể hoàn tác!',
  '确定要通过当前待审核的所有记录吗？请谨慎操作！':
    'Bạn có chắc muốn duyệt tất cả bản ghi đang chờ? Hãy thận trọng!',
  '确定要拒绝当前待审核的所有记录吗？此操作不可撤销，请谨慎操作！':
    'Bạn có chắc muốn từ chối tất cả bản ghi đang chờ? Thao tác này không thể hoàn tác!',
  批量通过成功: 'Duyệt hàng loạt thành công',
  批量拒绝成功: 'Từ chối hàng loạt thành công',
  全部通过成功: 'Duyệt tất cả thành công',
  全部拒绝成功: 'Từ chối tất cả thành công',
  批量操作失败: 'Thao tác hàng loạt thất bại',
  撤回成功: 'Thu hồi thành công',
  撤回失败: 'Thu hồi thất bại',
  '确定要撤回选中的 {0} 条记录吗？': 'Bạn có chắc muốn thu hồi {0} bản ghi đã chọn?',
  批量撤回成功: 'Thu hồi hàng loạt thành công',
  '查看代理详情: ': 'Xem chi tiết đại lý: ',
  '查看佣金详情: ': 'Xem chi tiết hoa hồng: ',
  '巴西雷亚尔(BRL)': 'Real Brazil (BRL)',
};

const WORDS = [
  ['请输入', 'Vui lòng nhập'],
  ['请选择', 'Vui lòng chọn'],
  ['确定要', 'Bạn có chắc muốn'],
  ['代理', 'Đại lý'],
  ['佣金', 'Hoa hồng'],
  ['返佣', 'Hoàn hoa hồng'],
  ['结算', 'Quyết toán'],
  ['模式', 'Chế độ'],
  ['等级', 'Cấp'],
  ['层级', 'Bậc'],
  ['备注', 'Ghi chú'],
  ['失败', 'Thất bại'],
  ['成功', 'Thành công'],
  ['操作', 'Thao tác'],
  ['账号', 'Tài khoản'],
  ['加载', 'Tải'],
  ['保存', 'Lưu'],
  ['删除', 'Xóa'],
  ['添加', 'Thêm'],
  ['编辑', 'Sửa'],
  ['查看', 'Xem'],
  ['导出', 'Xuất'],
  ['刷新', 'Làm mới'],
  ['状态', 'Trạng thái'],
  ['金额', 'Số tiền'],
  ['人数', 'Số người'],
  ['时间', 'Thời gian'],
  ['日期', 'Ngày'],
  ['全部', 'Tất cả'],
  ['批量', 'Hàng loạt'],
  ['通过', 'Duyệt'],
  ['拒绝', 'Từ chối'],
  ['撤回', 'Thu hồi'],
  ['领取', 'Nhận'],
  ['审核', 'Kiểm duyệt'],
  ['设置', 'Cài đặt'],
  ['配置', 'Cấu hình'],
  ['游戏', 'Game'],
  ['会员', 'Thành viên'],
  ['有效', 'Hợp lệ'],
  ['投注', 'Cược'],
  ['充值', 'Nạp tiền'],
  ['提现', 'Rút tiền'],
  ['登录', 'Đăng nhập'],
  ['注册', 'Đăng ký'],
  ['列表', 'Danh sách'],
  ['概览', 'Tổng quan'],
  ['详情', 'Chi tiết'],
  ['记录', 'Lịch sử'],
  ['统计', 'Thống kê'],
  ['手动', 'Thủ công'],
  ['自动', 'Tự động'],
  ['确认', 'Xác nhận'],
  ['取消', 'Hủy'],
  ['更新', 'Cập nhật'],
  ['创建', 'Tạo'],
  ['复制', 'Sao chép'],
  ['发送', 'Gửi'],
  ['余额', 'Số dư'],
  ['冻结', 'Đóng băng'],
  ['可用', 'Khả dụng'],
  ['扣除', 'Trừ'],
  ['原因', 'Lý do'],
  ['前台', 'Giao diện người dùng'],
  ['后台', 'Hệ thống quản trị'],
  ['浏览器', 'Trình duyệt'],
  ['总', 'Tổng'],
  ['共', 'Tổng'],
  ['条', 'bản ghi'],
  ['天', 'ngày'],
  ['级', 'cấp'],
  ['开发中', 'đang phát triển'],
  ['功能', 'tính năng'],
  ['消息', 'Tin nhắn'],
  ['设备', 'Thiết bị'],
  ['其他', 'Khác'],
  ['未知', 'Không rõ'],
  ['活跃', 'Đang hoạt động'],
  ['停用', 'Tắt'],
  ['激活', 'Kích hoạt'],
];
WORDS.sort((a, b) => b[0].length - a[0].length);

const CH = /[\u4e00-\u9fff]/;

function translate(zh) {
  if (!zh || typeof zh !== 'string') return zh;
  if (AGENCY_VI[zh]) return AGENCY_VI[zh];
  let s = zh;
  for (const [cn, vi] of WORDS) {
    if (cn && s.includes(cn)) s = s.split(cn).join(vi);
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
  if (CH.test(s)) return null;
  return s;
}

function walk(zhNode, viNode) {
  if (!viNode || typeof viNode !== 'object') viNode = {};
  for (const key of Object.keys(zhNode)) {
    const z = zhNode[key];
    if (z && typeof z === 'object' && !Array.isArray(z)) {
      if (!viNode[key] || typeof viNode[key] !== 'object') viNode[key] = {};
      walk(z, viNode[key]);
    } else if (typeof z === 'string') {
      const t = translate(z);
      if (t) viNode[key] = t;
    }
  }
  return viNode;
}

function fixTypos(obj) {
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (typeof v === 'string') {
      obj[k] = v
        .replace(/Tất cảTừ chối/g, 'Từ chối tất cả')
        .replace(/Hàng loạtTừ chối/g, 'Từ chối hàng loạt')
        .replace(/Xác nhậnTừ chối/g, 'Xác nhận từ chối')
        .replace(/Đại lýCấp/g, 'Cấp đại lý')
        .replace(/Ho hồng/g, 'Hoa hồng')
        .replace(/ho hồng/g, 'hoa hồng')
        .replace(/Thh án/g, 'Quyết toán')
        .replace(/Tho tác/g, 'Thao tác')
        .replace(/Hôm ny/g, 'Hôm qua')
        .replace(/Thể tho/g, 'Thể thao')
        .replace(/gio dịch/g, 'giao dịch')
        .replace(/dh sách/gi, 'danh sách')
        .replace(/gme /gi, 'game ')
        .replace(/Làm mớied/g, 'Đã làm mới')
        .replace(/([a-zà-ỹ])([A-ZĐ])/g, '$1 $2')
        .replace(/hàng loạt([A-ZĐ])/gi, 'hàng loạt $1')
        .replace(/tất cả([A-ZĐ])/gi, 'tất cả $1')
        .replace(/Thành công/g, ' thành công')
        .replace(/Thất bại/g, ' thất bại')
        .replace(/\s{2,}/g, ' ')
        .trim();
    } else if (v && typeof v === 'object') fixTypos(v);
  }
}

const zh = JSON.parse(fs.readFileSync(path.join(localesDir, 'zh-CN/agency.json'), 'utf8'));
const vi = JSON.parse(fs.readFileSync(path.join(localesDir, 'vi-VN/agency.json'), 'utf8'));
walk(zh, vi);
fixTypos(vi);

// Explicit fixes for commission tab (screenshot)
vi.commission.settings = 'Cài đặt hoa hồng';
vi.commission.pending = 'Chờ duyệt';
vi.commission.ready = 'Chờ nhận';
vi.commission.withdrawn = 'Đã thu hồi';
vi.commission.rejected = 'Đã từ chối';
vi.commission.claimed = 'Lịch sử nhận';
vi.commission.allRecords = 'Tất cả lịch sử';
vi.commission.yesterday = 'Hôm qua';
vi.commission.approveAll = 'Duyệt tất cả';
vi.commission.rejectAll = 'Từ chối tất cả';
vi.commission.batchApprove = 'Duyệt hàng loạt';
vi.commission.batchReject = 'Từ chối hàng loạt';
vi.commission.auditRule1 =
  '1. Nếu hoa hồng sau quyết toán vượt mức đã đặt, sẽ cần kiểm duyệt thủ công;';
vi.commission.confirmWithdraw = 'Bạn có chắc muốn thu hồi hoa hồng này?';
vi.commission.batchApproveContent = 'Bạn có chắc muốn duyệt {0} bản ghi đã chọn?';
vi.commission.batchRejectContent =
  'Bạn có chắc muốn từ chối {0} bản ghi đã chọn? Thao tác này không thể hoàn tác!';
vi.commission.approveAllContent =
  'Bạn có chắc muốn duyệt tất cả bản ghi đang chờ? Hãy thận trọng!';
vi.commission.rejectAllContent =
  'Bạn có chắc muốn từ chối tất cả bản ghi đang chờ? Thao tác này không thể hoàn tác!';
vi.commission.batchWithdrawContent = 'Bạn có chắc muốn thu hồi {0} bản ghi đã chọn?';
vi.commission.remarkSaved = 'Đã lưu ghi chú';
vi.commission.approved = 'Đã duyệt';
vi.commission.batchApproveSuccess = 'Duyệt hàng loạt thành công';
vi.commission.batchRejectSuccess = 'Từ chối hàng loạt thành công';
vi.commission.approveAllSuccess = 'Duyệt tất cả thành công';
vi.commission.rejectAllSuccess = 'Từ chối tất cả thành công';
vi.commission.batchOpFailed = 'Thao tác hàng loạt thất bại';
vi.commission.withdrawSuccess = 'Thu hồi thành công';
vi.commission.withdrawFailed = 'Thu hồi thất bại';
vi.commission.batchWithdrawSuccess = 'Thu hồi hàng loạt thành công';
vi.commission.loadSettingsFailed = 'Không tải được cài đặt';
vi.commission.currencyBrl = 'Real Brazil (BRL)';
vi.commission.settlementPeriod = 'Chu kỳ quyết toán';
vi.commission.settlementDate = 'Ngày quyết toán';
vi.commission.commission = 'Hoa hồng';
vi.commission.commissionAmount = 'Số tiền hoa hồng';

// Agent mode page (screenshot)
vi.agentMode.modeName = 'Tên chế độ đại lý';
vi.agentMode.enterModeName = 'Vui lòng nhập tên chế độ';
vi.agentMode.modeSource = 'Nguồn chế độ';
vi.agentMode.isDefault = 'Có phải mặc định';
vi.agentMode.settlementCycle = 'Chu kỳ quyết toán';
vi.agentMode.addMode = 'Thêm chế độ đại lý';
vi.agentMode.publicSettings = 'Cài đặt chung đại lý';
vi.agentMode.netProfitSettings = 'Cài đặt lợi nhuận ròng';
vi.agentMode.levelSettings = 'Cài đặt cấp đại lý';
vi.agentMode.selectedCount = 'Đã chọn {0}, tổng {1}';
vi.agentMode.modeId = 'ID chế độ đại lý';
vi.agentMode.modeNameCol = 'Tên chế độ';
vi.agentMode.commissionBasis = 'Cơ sở tính hoa hồng';
vi.agentMode.commissionLayers = 'Số tầng tính hoa hồng';
vi.agentMode.overflowRebate = 'Hoàn thêm phần vượt';
vi.agentMode.lastCycleClosed = 'Quyết toán kỳ trước';
vi.agentMode.usedCount = 'Số người đã dùng';

fs.writeFileSync(
  path.join(localesDir, 'vi-VN/agency.json'),
  `${JSON.stringify(vi, null, 2)}\n`,
  'utf8',
);
console.log('Rebuilt vi-VN/agency.json');
