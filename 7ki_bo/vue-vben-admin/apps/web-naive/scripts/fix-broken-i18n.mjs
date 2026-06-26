import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/views/finance');
const fixes = [
  // Broken partial success pattern
  [
    /\$t\('finance\.k3wkwp8'\) \+ '\/\$\{([^}]+)\} 条: ' \+ (\w+)/g,
    "$t('finance.partialSuccess', { ok: $2, total: $1 })",
  ],
  // Broken recharge/withdraw count
  [
    /\$t\('finance\.kdzez2y'\) \+ '\/ 提\$\{([^}]+)\}次: ' \+ (\w+)/g,
    "$t('finance.rechargeWithdrawTimes', { recharge: $2, withdraw: $1 })",
  ],
  [
    /\$t\('finance\.kdzez2y'\) \+ '\/提\$\{([^}]+)\}次: ' \+ ([^,]+)/g,
    "$t('finance.rechargeWithdrawTimes', { recharge: $2, withdraw: $1 })",
  ],
  // Template literals with Chinese - bulk success messages
  [
    /`批量强制拒绝成功 \(\$\{(\w+)\} 条\)`/g,
    "$t('finance.bulkForceRejectSuccess', { count: $1 })",
  ],
  [
    /`批量锁定成功 \(\$\{(\w+)\} 条\)`/g,
    "$t('finance.bulkLockSuccess', { count: $1 })",
  ],
  [
    /`批量解锁成功 \(\$\{(\w+)\} 条\)`/g,
    "$t('finance.bulkUnlockSuccess', { count: $1 })",
  ],
  [
    /`批量审核出款成功 \(\$\{(\w+)\} 条\)`/g,
    "$t('finance.bulkReviewPayoutSuccess', { count: $1 })",
  ],
  [
    /`批量强制取消成功 \(\$\{(\w+)\} 条\)`/g,
    "$t('finance.bulkForceCancelSuccess', { count: $1 })",
  ],
  [
    /`批量强制拒绝成功 \(\$\{(\w+)\} 条\)`/g,
    "$t('finance.bulkForceRejectSuccess', { count: $1 })",
  ],
  [
    /`批量备注成功 \(\$\{(\w+)\} 条\)`/g,
    "$t('finance.bulkRemarkSuccess', { count: $1 })",
  ],
  [
    /`批量已人工出款 \(\$\{(\w+)\} 条\)`/g,
    "$t('finance.bulkManualPayoutSuccess', { count: $1 })",
  ],
  [
    /`批量强制成功 \(\$\{(\w+)\} 条\)`/g,
    "$t('finance.bulkForceSuccess', { count: $1 })",
  ],
  [
    /`批量强制失败 \(\$\{(\w+)\} 条\)`/g,
    "$t('finance.bulkForceFailSuccess', { count: $1 })",
  ],
  [
    /`强制拒绝 \(共 \$\{([^}]+)\} 笔待出款\)`/g,
    "$t('finance.forceRejectPendingCount', { count: $1 })",
  ],
  [
    /`批量操作 \(\$\{selectedCount\}\)`/g,
    "$t('finance.bulkOperationCount', { count: selectedCount })",
  ],
  [
    /`重复IP: \$\{duplicateIP\}人`/g,
    "$t('finance.duplicateIpCount', { count: duplicateIP })",
  ],
  [
    /placeholder="将从 \$t\('finance\.configAmount'\) 自动提取"/g,
    ':placeholder="$t(\'finance.autoExtractFromConfigAmount\')"',
  ],
];

const newKeys = {
  partialSuccess: { en: 'Partial success: {ok}/{total} records', zh: '部分成功：{ok}/{total} 条', vi: 'Thành công một phần: {ok}/{total} bản ghi' },
  rechargeWithdrawTimes: { en: 'Deposit {recharge}/Withdraw {withdraw} times', zh: '充{recharge}/提{withdraw}次', vi: 'Nạp {recharge}/Rút {withdraw} lần' },
  bulkForceRejectSuccess: { en: 'Bulk force reject successful ({count} records)', zh: '批量强制拒绝成功 ({count} 条)', vi: 'Từ chối cưỡng bức hàng loạt thành công ({count} bản ghi)' },
  bulkLockSuccess: { en: 'Bulk lock successful ({count} records)', zh: '批量锁定成功 ({count} 条)', vi: 'Khóa hàng loạt thành công ({count} bản ghi)' },
  bulkUnlockSuccess: { en: 'Bulk unlock successful ({count} records)', zh: '批量解锁成功 ({count} 条)', vi: 'Mở khóa hàng loạt thành công ({count} bản ghi)' },
  bulkReviewPayoutSuccess: { en: 'Bulk review payout successful ({count} records)', zh: '批量审核出款成功 ({count} 条)', vi: 'Duyệt chi hộ hàng loạt thành công ({count} bản ghi)' },
  bulkForceCancelSuccess: { en: 'Bulk force cancel successful ({count} records)', zh: '批量强制取消成功 ({count} 条)', vi: 'Hủy cưỡng bức hàng loạt thành công ({count} bản ghi)' },
  bulkRemarkSuccess: { en: 'Bulk remark successful ({count} records)', zh: '批量备注成功 ({count} 条)', vi: 'Ghi chú hàng loạt thành công ({count} bản ghi)' },
  bulkManualPayoutSuccess: { en: 'Bulk manual payout successful ({count} records)', zh: '批量已人工出款 ({count} 条)', vi: 'Chi thủ công hàng loạt thành công ({count} bản ghi)' },
  bulkForceSuccess: { en: 'Bulk force success ({count} records)', zh: '批量强制成功 ({count} 条)', vi: 'Cưỡng bức thành công hàng loạt ({count} bản ghi)' },
  bulkForceFailSuccess: { en: 'Bulk force fail marked ({count} records)', zh: '批量强制失败 ({count} 条)', vi: 'Đánh dấu thất bại cưỡng bức hàng loạt ({count} bản ghi)' },
  forceRejectPendingCount: { en: 'Force reject (total {count} pending payouts)', zh: '强制拒绝 (共 {count} 笔待出款)', vi: 'Từ chối cưỡng bức (tổng {count} chi hộ đang chờ)' },
  bulkOperationCount: { en: 'Bulk operation ({count})', zh: '批量操作 ({count})', vi: 'Thao tác hàng loạt ({count})' },
  duplicateIpCount: { en: 'Duplicate IP: {count} users', zh: '重复IP: {count}人', vi: 'IP trùng: {count} người' },
  autoExtractFromConfigAmount: { en: 'Auto-extract from configured amount', zh: '将从配置推荐金额自动提取', vi: 'Tự động trích từ số tiền cấu hình' },
  currencyLabel: { en: 'Currency:', zh: '币种:', vi: 'Loại tiền:' },
  gamesCount: { en: '{count} games', zh: '{count} 个游戏', vi: '{count} trò chơi' },
};

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.vue'))) {
  let c = fs.readFileSync(path.join(dir, f), 'utf8');
  for (const [re, rep] of fixes) c = c.replace(re, rep);
  // Fix >币种:<
  c = c.replace(/>币种:</g, '>{{ $t(\'finance.currencyLabel\') }}<');
  c = c.replace(
    /\{\{ \(p\.gameType \|\| ''\)\.toUpperCase\(\) \}\} • \{\{ p\.gameCount \|\| 0 \}\} 个游戏/g,
    "{{ (p.gameType || '').toUpperCase() }} • {{ $t('finance.gamesCount', { count: p.gameCount || 0 }) }}",
  );
  fs.writeFileSync(path.join(dir, f), c);
  console.log('Patched', f);
}

const localesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/locales/langs');
for (const [lang, field] of [['en-US', 'en'], ['zh-CN', 'zh'], ['vi-VN', 'vi']]) {
  const fp = path.join(localesDir, lang, 'finance.json');
  const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
  for (const [k, v] of Object.entries(newKeys)) data[k] = v[field];
  fs.writeFileSync(fp, JSON.stringify(data, null, 2) + '\n');
}
