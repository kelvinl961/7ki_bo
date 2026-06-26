/**
 * Rebuild vi-VN locale files from zh-CN using finance-translations.vi,
 * common vi map, and phrase maps mined from already-translated modules.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, '../src/locales/langs');
const packagesLocalesDir = path.resolve(__dirname, '../../../packages/locales/src/langs');

const CHINESE_RE = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/;
const GARBAGE_KEY_RE = /NButton|DivClass|Template|VModel|Const[A-Z]/;

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function writeJson(p, data) {
  fs.writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}
function hasChinese(s) {
  return typeof s === 'string' && CHINESE_RE.test(s);
}

function buildParallelZhToTarget(zhNode, targetNode, map) {
  if (!zhNode || !targetNode) return;
  for (const key of Object.keys(zhNode)) {
    const z = zhNode[key];
    const t = targetNode[key];
    if (z && typeof z === 'object' && !Array.isArray(z)) {
      buildParallelZhToTarget(z, t && typeof t === 'object' ? t : {}, map);
    } else if (typeof z === 'string' && typeof t === 'string' && z && t && !hasChinese(t) && t !== z) {
      map[z] = t;
    }
  }
}

function buildCommonZhToVi() {
  const zh = readJson(path.join(packagesLocalesDir, 'zh-CN/common.json'));
  const vi = readJson(path.join(packagesLocalesDir, 'vi-VN/common.json'));
  const map = {};
  buildParallelZhToTarget(zh, vi, map);
  return map;
}

const financeTranslations = readJson(path.join(__dirname, 'finance-translations.json'));
const commonViMap = buildCommonZhToVi();

/** Mine zh->vi from modules that are already fully translated */
const phraseViMap = { ...commonViMap };
for (const name of fs.readdirSync(path.join(localesDir, 'vi-VN'))) {
  if (!name.endsWith('.json') || name === 'finance.json' || name === 'activity.json') continue;
  try {
    const zh = readJson(path.join(localesDir, 'zh-CN', name));
    const vi = readJson(path.join(localesDir, 'vi-VN', name));
    buildParallelZhToTarget(zh, vi, phraseViMap);
  } catch {
    /* skip */
  }
}

for (const [zh, entry] of Object.entries(financeTranslations)) {
  if (entry?.vi && typeof entry.vi === 'string' && !hasChinese(entry.vi)) {
    phraseViMap[zh] = entry.vi;
  }
}

/** Critical full-phrase overrides */
const VI_PHRASE = {
  在线充值: 'Nạp tiền trực tuyến',
  优惠活动: 'Hoạt động khuyến mãi',
  活动中心: 'Trung tâm hoạt động',
  活动列表: 'Danh sách hoạt động',
  已关闭活动: 'Hoạt động đã đóng',
  优惠统计: 'Thống kê khuyến mãi',
  分享管理: 'Quản lý chia sẻ',
  充值优惠: 'Khuyến mãi nạp tiền',
  充值活动: 'Khuyến mãi nạp tiền',
  用户活动: 'Hoạt động người dùng',
  幸运转盘: 'Vòng quay may mắn',
  公积金: 'Quỹ tích lũy',
  任务中心: 'Trung tâm nhiệm vụ',
  风控审核: 'Kiểm duyệt rủi ro',
  提现申请风险控制审核: 'Kiểm duyệt rủi ro rút tiền',
  由我风控: 'Rủi ro do tôi phụ trách',
  我负责的提现申请风险控制: 'Rủi ro rút tiền do tôi phụ trách',
  列配置: 'Cài đặt cột',
  本周: 'Tuần này',
  今日: 'Hôm nay',
  昨天: 'Hôm nay trước',
  上周: 'Tuần trước',
  搜索: 'Tìm kiếm',
  重置: 'Đặt lại',
  导出: 'Xuất',
  全部: 'Tất cả',
  启用: 'Bật',
  停用: 'Tắt',
  确定: 'Xác nhận',
  取消: 'Hủy',
  会员账号: 'Tài khoản thành viên',
  会员ID: 'ID thành viên',
  操作: 'Thao tác',
  状态: 'Trạng thái',
  币种: 'Loại tiền',
  获得幸运值: 'Điểm may mắn nhận được',
  剩余幸运值: 'Điểm may mắn còn lại',
  幸运值记录: 'Lịch sử điểm may mắn',
  中奖记录: 'Lịch sử trúng thưởng',
  实物订单: 'Đơn hàng vật phẩm',
  转盘列表: 'Danh sách vòng quay',
  三日神秘任务: 'Nhiệm vụ bí ẩn 3 ngày',
  新增幸运值: 'Thêm điểm may mắn',
  筛选条件: 'Tiêu chí lọc',
  选择开始和结束日期: 'Chọn ngày bắt đầu và kết thúc',
  优惠来源: 'Nguồn khuyến mãi',
  请选择优惠来源: 'Vui lòng chọn nguồn khuyến mãi',
  活动名称: 'Tên hoạt động',
  领取方式: 'Cách nhận',
  奖励类型: 'Loại thưởng',
  暂无数据: 'Không có dữ liệu',
  导出表格: 'Xuất bảng',
  总活动数: 'Tổng số hoạt động',
  活跃活动: 'Hoạt động đang diễn ra',
  总奖励发放: 'Tổng thưởng đã phát',
  可参与人数: 'Số người có thể tham gia',
  已领取人数: 'Số người đã nhận',
  已领取金额: 'Số tiền đã nhận',
};
Object.assign(phraseViMap, VI_PHRASE);

/** Word-level zh -> vi for segment fallback */
const VI_WORDS = [
  ['充值', 'Nạp tiền'],
  ['提现', 'Rút tiền'],
  ['优惠', 'Khuyến mãi'],
  ['活动', 'Hoạt động'],
  ['会员', 'Thành viên'],
  ['账号', 'Tài khoản'],
  ['稽核', 'Kiểm toán'],
  ['投注', 'Cược'],
  ['转盘', 'Vòng quay'],
  ['幸运值', 'Điểm may mắn'],
  ['记录', 'Lịch sử'],
  ['金额', 'Số tiền'],
  ['人数', 'Số người'],
  ['次数', 'Số lần'],
  ['总计', 'Tổng'],
  ['成功', 'Thành công'],
  ['失败', 'Thất bại'],
  ['审核', 'Kiểm duyệt'],
  ['风控', 'Rủi ro'],
  ['全部', 'Tất cả'],
  ['选择', 'Chọn'],
  ['请输入', 'Vui lòng nhập'],
  ['请选择', 'Vui lòng chọn'],
  ['加载', 'Đang tải'],
  ['导出', 'Xuất'],
  ['搜索', 'Tìm kiếm'],
  ['重置', 'Đặt lại'],
  ['操作', 'Thao tác'],
  ['状态', 'Trạng thái'],
  ['时间', 'Thời gian'],
  ['备注', 'Ghi chú'],
  ['详情', 'Chi tiết'],
  ['创建', 'Tạo'],
  ['更新', 'Cập nhật'],
  ['删除', 'Xóa'],
  ['编辑', 'Sửa'],
  ['启用', 'Bật'],
  ['禁用', 'Tắt'],
  ['任务', 'Nhiệm vụ'],
  ['奖励', 'Thưởng'],
  ['领取', 'Nhận'],
  ['发放', 'Phát'],
  ['参与', 'Tham gia'],
  ['剩余', 'Còn lại'],
  ['获得', 'Nhận được'],
  ['消耗', 'Tiêu hao'],
  ['过期', 'Hết hạn'],
  ['扣除', 'Khấu trừ'],
  ['订单', 'Đơn hàng'],
  ['实物', 'Vật phẩm'],
  ['中奖', 'Trúng thưởng'],
  ['配置', 'Cấu hình'],
  ['设置', 'Cài đặt'],
  ['类型', 'Loại'],
  ['名称', 'Tên'],
  ['列表', 'Danh sách'],
  ['统计', 'Thống kê'],
  ['管理', 'Quản lý'],
  ['分享', 'Chia sẻ'],
  ['关闭', 'Đóng'],
  ['开启', 'Bật'],
  ['周', 'Tuần'],
  ['月', 'Tháng'],
  ['日', 'Ngày'],
  ['小时', 'Giờ'],
  ['分钟', 'Phút'],
  ['无限制', 'Không giới hạn'],
  ['进行中', 'Đang diễn ra'],
  ['已完成', 'Hoàn thành'],
  ['剩余', 'Còn lại'],
];
VI_WORDS.sort((a, b) => b[0].length - a[0].length);

function translateByWords(zh) {
  let s = zh;
  for (const [cn, vi] of VI_WORDS) {
    if (s.includes(cn)) s = s.split(cn).join(` ${vi} `);
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

function translateVi(zh, enFallback) {
  if (!zh || typeof zh !== 'string') return null;
  if (VI_PHRASE[zh]) return VI_PHRASE[zh];
  if (phraseViMap[zh] && !hasChinese(phraseViMap[zh])) return phraseViMap[zh];
  const ft = financeTranslations[zh];
  if (ft?.vi && !hasChinese(ft.vi)) return ft.vi;

  let fromWords = translateByWords(zh);
  if (fromWords && !hasChinese(fromWords)) return fromWords;

  if (enFallback && typeof enFallback === 'string' && !hasChinese(enFallback)) {
    return enFallback;
  }
  return null;
}

function walkRebuild(zhNode, viNode, enNode, stats, pathPrefix = '') {
  if (!viNode || typeof viNode !== 'object') viNode = {};
  for (const key of Object.keys(zhNode)) {
    const zhVal = zhNode[key];
    const fullKey = pathPrefix ? `${pathPrefix}.${key}` : key;

    if (zhVal && typeof zhVal === 'object' && !Array.isArray(zhVal)) {
      if (!viNode[key] || typeof viNode[key] !== 'object') viNode[key] = {};
      const enChild = enNode?.[key] && typeof enNode[key] === 'object' ? enNode[key] : {};
      walkRebuild(zhVal, viNode[key], enChild, stats, fullKey);
      continue;
    }

    if (typeof zhVal !== 'string') continue;
    if (GARBAGE_KEY_RE.test(key) || zhVal.includes('<') || zhVal.length > 180) continue;

    const currentVi = viNode[key];
    const enVal = enNode?.[key];
    const needsFix =
      typeof currentVi !== 'string' ||
      hasChinese(currentVi) ||
      currentVi === zhVal;

    if (!needsFix) continue;

    let newVi = translateVi(zhVal, enVal);
    if (!newVi || hasChinese(newVi)) continue;

    if (newVi !== currentVi) {
      viNode[key] = newVi;
      stats.fixed++;
    }
  }
  return viNode;
}

function countChinese(obj) {
  let c = 0;
  const w = (n) => {
    if (typeof n === 'string' && hasChinese(n)) c++;
    else if (n && typeof n === 'object') Object.values(n).forEach(w);
  };
  w(obj);
  return c;
}

/** Fix finance-translations .vi entries that still contain Chinese */
let ftViFixed = 0;
for (const [zh, entry] of Object.entries(financeTranslations)) {
  if (!entry?.vi || !hasChinese(entry.vi)) continue;
  const better = translateVi(zh, entry.en);
  if (better && !hasChinese(better)) {
    entry.vi = better;
    ftViFixed++;
  }
}
writeJson(path.join(__dirname, 'finance-translations.json'), financeTranslations);

const modules = ['finance.json', 'activity.json'];
const results = [];

for (const file of modules) {
  const zh = readJson(path.join(localesDir, 'zh-CN', file));
  let vi = readJson(path.join(localesDir, 'vi-VN', file));
  const en = readJson(path.join(localesDir, 'en-US', file));
  const stats = { fixed: 0 };
  walkRebuild(zh, vi, en, stats);

  // Force critical keys
  if (file === 'finance.json') {
    vi.kt982i = 'Nạp tiền trực tuyến';
    vi.riskControlReview = vi.riskControlReview?.includes('Kiểm') ? vi.riskControlReview : 'Kiểm duyệt rủi ro';
    vi.riskControl = 'Rủi ro do tôi phụ trách';
    vi.withdrawalApplicationRiskControlReview =
      'Kiểm duyệt rủi ro rút tiền';
    vi.withdrawalApplicationRiskControl = 'Rủi ro rút tiền do tôi phụ trách';
  }
  if (file === 'activity.json') {
    vi.center ??= {};
    vi.center.k4f182 = 'Hoạt động khuyến mãi';
    vi.center.k6d3b = 'Trung tâm hoạt động';
    vi.taskCenter ??= {};
    vi.taskCenter.k4efb = 'Trung tâm nhiệm vụ';
    vi.labels ??= {};
    vi.labels.thisWeek = 'Tuần này';
    if (vi.luckyWheelPublicConfig) vi.luckyWheelPublicConfig.k83b7 = 'Điểm may mắn nhận được';
    if (vi.luckyWheelAddLuckyValue) vi.luckyWheelAddLuckyValue.k65b0 = 'Thêm điểm may mắn';
  }

  writeJson(path.join(localesDir, 'vi-VN', file), vi);
  results.push({ file, fixed: stats.fixed, remaining: countChinese(vi) });
}

// page.json menu tweaks
const pageVi = readJson(path.join(localesDir, 'vi-VN/page.json'));
pageVi.menu.promotionalActivities = 'Hoạt động khuyến mãi';
writeJson(path.join(localesDir, 'vi-VN/page.json'), pageVi);

const brandVi = readJson(path.join(localesDir, 'vi-VN/brand.json'));
if (brandVi.skin) brandVi.skin.configSaved = 'Cấu hình đã lưu';
writeJson(path.join(localesDir, 'vi-VN/brand.json'), brandVi);

console.log(`Phrase map size: ${Object.keys(phraseViMap).length}`);
console.log(`finance-translations .vi fixed: ${ftViFixed}`);
for (const r of results) {
  console.log(`${r.file}: updated ${r.fixed} keys, ${r.remaining} still contain Chinese`);
}
