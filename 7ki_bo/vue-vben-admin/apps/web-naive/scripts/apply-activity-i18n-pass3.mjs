/**
 * Pass 3: Replace inline label maps with $t() and add task/reward type keys.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(__dirname, '..');
const activityRoot = path.join(appRoot, 'src/views/activity');
const localesDir = path.join(appRoot, 'src/locales/langs');

const TASK_TYPES = {
  REGISTRATION: { zh: '注册任务', en: 'Registration Task', vi: 'Nhiệm vụ đăng ký' },
  FIRST_DEPOSIT: { zh: '首充任务', en: 'First Deposit Task', vi: 'Nhiệm vụ nạp lần đầu' },
  DAILY_CHECKIN: { zh: '每日签到', en: 'Daily Check-in', vi: 'Điểm danh hàng ngày' },
  DAILY_BET: { zh: '每日投注', en: 'Daily Bet', vi: 'Cược hàng ngày' },
  WEEKLY_BET: { zh: '每周投注', en: 'Weekly Bet', vi: 'Cược hàng tuần' },
  INVITE_FRIENDS: { zh: '邀请好友', en: 'Invite Friends', vi: 'Mời bạn bè' },
  GAME_PLAY: { zh: '游戏体验', en: 'Game Experience', vi: 'Trải nghiệm game' },
  PROFILE_COMPLETE: { zh: '完善资料', en: 'Complete Profile', vi: 'Hoàn thiện hồ sơ' },
  BANK_BINDING: { zh: '银行卡绑定', en: 'Bank Card Binding', vi: 'Liên kết thẻ ngân hàng' },
  PHONE_VERIFICATION: { zh: '手机验证', en: 'Phone Verification', vi: 'Xác minh điện thoại' },
  EMAIL_VERIFICATION: { zh: '邮箱验证', en: 'Email Verification', vi: 'Xác minh email' },
  CUSTOM: { zh: '自定义任务', en: 'Custom Task', vi: 'Nhiệm vụ tùy chỉnh' },
};

const TASK_CATEGORIES = {
  NOVICE_WELFARE: { zh: '新人福利', en: 'New Member Benefits', vi: 'Phúc lợi thành viên mới' },
  DAILY_TASK: { zh: '每日任务', en: 'Daily Tasks', vi: 'Nhiệm vụ hàng ngày' },
  WEEKLY_TASK: { zh: '每周任务', en: 'Weekly Tasks', vi: 'Nhiệm vụ hàng tuần' },
  THREE_DAY_RANKING: { zh: '三日神秘任务', en: 'Three-Day Mystery Task', vi: 'Nhiệm vụ bí ẩn 3 ngày' },
};

const REWARD_TYPES = {
  CASH: { zh: '现金（固定）', en: 'Cash (Fixed)', vi: 'Tiền mặt (cố định)' },
  BONUS: { zh: '奖金（浮动）', en: 'Bonus (Variable)', vi: 'Thưởng (biến động)' },
  POINTS: { zh: '积分', en: 'Points', vi: 'Điểm' },
  FREE_SPINS: { zh: '免费旋转', en: 'Free Spins', vi: 'Vòng quay miễn phí' },
  DISCOUNT: { zh: '折扣', en: 'Discount', vi: 'Giảm giá' },
  CUSTOM: { zh: '自定义奖励', en: 'Custom Reward', vi: 'Thưởng tùy chỉnh' },
};

const REWARD_TYPES_SHORT = {
  CASH: { zh: '固定', en: 'Fixed', vi: 'Cố định' },
  BONUS: { zh: '浮动', en: 'Variable', vi: 'Biến động' },
  POINTS: { zh: '积分', en: 'Points', vi: 'Điểm' },
  FREE_SPINS: { zh: '免费旋转', en: 'Free Spins', vi: 'Vòng quay miễn phí' },
  DISCOUNT: { zh: '折扣', en: 'Discount', vi: 'Giảm giá' },
  CUSTOM: { zh: '自定义', en: 'Custom', vi: 'Tùy chỉnh' },
};

const RULE_PREVIEWS = {
  noviceWelfare: {
    zh: '1.每个新注册的账号都可以完成以上任务，完成任务后可获得一定金额奖金，难度越高，奖励越多；\n2.满足条件即可直接领取，可在iOS_APP、Android_APP、iOS_H5、Android_H5、PC任意一端直接领取，过期作废（即未主动领取视为自愿放弃）；\n3.因本任务赠送的奖金较高，所以赠送的奖金需10.00倍流水（即稽核，打码或有效投注）才能提现；\n4.本任务仅限账号本人进行正常的人为操作，禁止租借、使用外挂、机器人、不同账号对打、互刷、套利、接口、协议、利用漏洞、群控或其他技术手段参与，否则取消或扣除相关，冻结、甚至拉入黑名单；\n5.为避免文字理解差异，平台将保留本活动最终解释权。',
    en: '1. Each newly registered account can complete the above tasks and receive bonus rewards upon completion; higher difficulty yields greater rewards.\n2. Meet the conditions to claim directly on iOS_APP, Android_APP, iOS_H5, Android_H5, or PC; unclaimed rewards expire (failure to claim voluntarily is deemed forfeiture).\n3. Due to the high bonus amount, a 10.00x wagering requirement (audit/valid bet) applies before withdrawal.\n4. Tasks must be completed by the account holder through normal human operation; prohibited activities include renting accounts, bots, collusion, arbitrage, exploits, or technical manipulation — violations may result in cancellation, deduction, freezing, or blacklisting.\n5. The platform reserves final interpretation rights for this activity.',
    vi: '1. Mỗi tài khoản mới đăng ký có thể hoàn thành các nhiệm vụ trên và nhận thưởng; độ khó cao hơn thì thưởng nhiều hơn.\n2. Đáp ứng điều kiện để nhận trực tiếp trên iOS_APP, Android_APP, iOS_H5, Android_H5 hoặc PC; thưởng hết hạn nếu không nhận.\n3. Do số tiền thưởng cao, yêu cầu cược 10.00 lần trước khi rút.\n4. Chỉ chủ tài khoản được thao tác bình thường; cấm bot, gian lận, đánh chéo — vi phạm có thể bị hủy, khấu trừ, đóng băng hoặc blacklist.\n5. Nền tảng giữ quyền giải thích cuối cùng.',
  },
  providentFund: {
    zh: `1. 每笔充值按活动比例计入公积金（币种 BRL）。
2. 取出公积金需完成对应打码倍数；有赠送与无赠送时倍数可能不同。
3. 活动期内领取次数、累计赠送等以实际配置为准。
4. 支持 PC、H5、Android / iOS APP 等终端（以「领取入口」配置为准）。
5. 防刷、风控与人工审核以平台规则为准。`,
    en: `1. Each deposit is credited to the provident fund at the activity ratio (BRL currency).
2. Withdrawal requires completing the corresponding wagering multiplier; multipliers may differ with or without bonus.
3. Claim limits and cumulative bonuses during the activity period follow actual configuration.
4. Supports PC, H5, Android/iOS APP terminals (per claim entry settings).
5. Anti-fraud, risk control, and manual review follow platform rules.`,
    vi: `1. Mỗi lần nạp được tính vào quỹ tích lũy theo tỷ lệ hoạt động (BRL).
2. Rút quỹ cần hoàn thành hệ số cược tương ứng.
3. Số lần nhận và tổng thưởng theo cấu hình thực tế.
4. Hỗ trợ PC, H5, Android/iOS APP.
5. Chống gian lận và kiểm duyệt theo quy tắc nền tảng.`,
  },
  luckyWheel: {
    zh: `1. 用户通过有效投注获得幸运值，幸运值在有效期内可用于转盘抽奖。
2. 白银、黄金、钻石转盘消耗不同幸运值，奖品以实际配置为准。
3. 中奖奖金需完成对应稽核倍数后方可提现。
4. 领取入口、会员层级及更多限制以本页配置为准。
5. 平台保留活动解释、风控及人工审核权利。`,
    en: `1. Users earn lucky value through valid bets; lucky value can be used for wheel draws within its validity period.
2. Silver, gold, and diamond wheels consume different lucky values; prizes follow actual configuration.
3. Winnings require completing the corresponding audit multiplier before withdrawal.
4. Claim entry, member tiers, and other restrictions follow this page's configuration.
5. The platform reserves rights for activity interpretation, risk control, and manual review.`,
    vi: `1. Người dùng nhận điểm may mắn qua cược hợp lệ; dùng để quay trong thời hạn hiệu lực.
2. Vòng bạc, vàng, kim cương tiêu tốn điểm khác nhau.
3. Tiền thắng cần hoàn thành hệ số kiểm toán trước khi rút.
4. Cổng nhận và hạn chế theo cấu hình trang này.
5. Nền tảng giữ quyền giải thích và kiểm duyệt.`,
  },
};

function patchLocales() {
  for (const lang of ['zh-CN', 'en-US', 'vi-VN']) {
    const p = path.join(localesDir, lang, 'activity.json');
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    const l = lang === 'zh-CN' ? 'zh' : lang === 'en-US' ? 'en' : 'vi';
    data.taskTypes = {};
    for (const [k, v] of Object.entries(TASK_TYPES)) data.taskTypes[k] = v[l];
    data.taskCategories = {};
    for (const [k, v] of Object.entries(TASK_CATEGORIES)) data.taskCategories[k] = v[l];
    data.rewardTypes = {};
    for (const [k, v] of Object.entries(REWARD_TYPES)) data.rewardTypes[k] = v[l];
    data.rewardTypesShort = {};
    for (const [k, v] of Object.entries(REWARD_TYPES_SHORT)) data.rewardTypesShort[k] = v[l];
    data.rulePreviews = {
      noviceWelfare: RULE_PREVIEWS.noviceWelfare[l],
      providentFund: RULE_PREVIEWS.providentFund[l],
      luckyWheel: RULE_PREVIEWS.luckyWheel[l],
    };
    fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
  }
}

function replaceCategoryMap(content) {
  return content.replace(
    /const categoryMap: \{ \[key: string\]: string \} = \{[\s\S]*?\};/g,
    `const categoryMap: { [key: string]: string } = {
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
      };`,
  );
}

function replaceTypeMap(content) {
  return content.replace(
    /const typeMap: \{ \[key: string\]: string \} = \{[\s\S]*?\};/g,
    `const typeMap: { [key: string]: string } = {
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
      };`,
  );
}

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

patchLocales();

for (const { abs, rel } of walkVueFiles(activityRoot)) {
  let c = fs.readFileSync(abs, 'utf8');
  const orig = c;
  c = replaceCategoryMap(c);
  c = replaceTypeMap(c);
  c = c.replace(/\|\| row\.category \|\| '未分类'/g, "|| row.category || $t('activity.statuses.uncategorized')");
  c = c.replace(/\|\| row\.type \|\| '未知类型'/g, "|| row.type || $t('activity.statuses.unknownType')");
  c = c.replace(/draft: \{ type: 'warning', text: '草稿' \}/g, "draft: { type: 'warning', text: $t('activity.statuses.draft') }");
  c = c.replace(/active: \{ type: 'success', text: '进行中' \}/g, "active: { type: 'success', text: $t('activity.statuses.active') }");
  c = c.replace(/paused: \{ type: 'error', text: '已暂停' \}/g, "paused: { type: 'error', text: $t('activity.statuses.paused') }");
  c = c.replace(/archived: \{ type: 'default', text: '已归档' \}/g, "archived: { type: 'default', text: $t('activity.statuses.archived') }");
  c = c.replace(/text: '未知状态'/g, "text: $t('activity.statuses.unknown')");
  c = c.replace(/row\.createdBy \|\| '系统'/g, "row.createdBy || $t('activity.statuses.system')");
  c = c.replace(/return '未设置'/g, "return $t('activity.statuses.notSet')");
  c = c.replace(/return '时间格式错误'/g, "return $t('activity.statuses.timeFormatError')");
  c = c.replace(/return '未设置时间'/g, "return $t('activity.statuses.notSetTime')");

  // TaskDetailModal maps
  c = c.replace(
    /const typeMap: Record<string, string> = \{[\s\S]*?CUSTOM: '自定义任务',[\s\S]*?\};/,
    `const typeMap: Record<string, string> = {
    REGISTRATION: $t('activity.taskTypes.REGISTRATION'),
    FIRST_DEPOSIT: $t('activity.taskTypes.FIRST_DEPOSIT'),
    DAILY_CHECKIN: $t('activity.taskTypes.DAILY_CHECKIN'),
    DAILY_BET: $t('activity.taskTypes.DAILY_BET'),
    WEEKLY_BET: $t('activity.taskTypes.WEEKLY_BET'),
    INVITE_FRIENDS: $t('activity.taskTypes.INVITE_FRIENDS'),
    GAME_PLAY: $t('activity.taskTypes.GAME_PLAY'),
    PROFILE_COMPLETE: $t('activity.taskTypes.PROFILE_COMPLETE'),
    BANK_BINDING: $t('activity.taskTypes.BANK_BINDING'),
    PHONE_VERIFICATION: $t('activity.taskTypes.PHONE_VERIFICATION'),
    EMAIL_VERIFICATION: $t('activity.taskTypes.EMAIL_VERIFICATION'),
    CUSTOM: $t('activity.taskTypes.CUSTOM'),
  };`,
  );
  c = c.replace(
    /const categoryMap: Record<string, string> = \{[\s\S]*?THREE_DAY_RANKING: '三日神秘任务',[\s\S]*?\};/,
    `const categoryMap: Record<string, string> = {
    NOVICE_WELFARE: $t('activity.taskCategories.NOVICE_WELFARE'),
    DAILY_TASK: $t('activity.taskCategories.DAILY_TASK'),
    WEEKLY_TASK: $t('activity.taskCategories.WEEKLY_TASK'),
    THREE_DAY_RANKING: $t('activity.taskCategories.THREE_DAY_RANKING'),
  };`,
  );
  c = c.replace(
    /const typeMap: Record<string, string> = \{[\s\S]*?CUSTOM: '自定义奖励',[\s\S]*?\};\s*return typeMap\[rewardType\]/,
    `const typeMap: Record<string, string> = {
    CASH: $t('activity.rewardTypes.CASH'),
    BONUS: $t('activity.rewardTypes.BONUS'),
    POINTS: $t('activity.rewardTypes.POINTS'),
    FREE_SPINS: $t('activity.rewardTypes.FREE_SPINS'),
    DISCOUNT: $t('activity.rewardTypes.DISCOUNT'),
    CUSTOM: $t('activity.rewardTypes.CUSTOM'),
  };
  return typeMap[rewardType]`,
  );

  // NoviceWelfareManager short reward types
  c = c.replace(
    /CASH: '固定',\s*BONUS: '浮动',\s*POINTS: '积分',\s*FREE_SPINS: '免费旋转',\s*DISCOUNT: '折扣',\s*CUSTOM: '自定义',/,
    `CASH: $t('activity.rewardTypesShort.CASH'),
        BONUS: $t('activity.rewardTypesShort.BONUS'),
        POINTS: $t('activity.rewardTypesShort.POINTS'),
        FREE_SPINS: $t('activity.rewardTypesShort.FREE_SPINS'),
        DISCOUNT: $t('activity.rewardTypesShort.DISCOUNT'),
        CUSTOM: $t('activity.rewardTypesShort.CUSTOM'),`,
  );

  // ProvidentFund resetCycleLabel
  c = c.replace(
    /function resetCycleLabel\(v: string\) \{[\s\S]*?return m\[v\] \|\| v \|\| '--';\s*\}/,
    `function resetCycleLabel(v: string) {
  const m: Record<string, string> = {
    none: $t('activity.cycles.none'),
    monthly: $t('activity.cycles.monthly'),
    quarterly: $t('activity.cycles.quarterly'),
    semi_annual: $t('activity.cycles.semi_annual'),
    annual: $t('activity.cycles.annual'),
  };
  return m[v] || v || '--';
}`,
  );

  // Rule previews
  c = c.replace(/const SYSTEM_RULE_PREVIEW = `[\s\S]*?`;/g, (match) => {
    if (match.includes('公积金')) return "const SYSTEM_RULE_PREVIEW = $t('activity.rulePreviews.providentFund');";
    if (match.includes('幸运值')) return "const SYSTEM_RULE_PREVIEW = $t('activity.rulePreviews.luckyWheel');";
    return match;
  });

  c = c.replace(
    /'1\.每个新注册的账号都可以完成以上任务[\s\S]*?最终解释权。',/,
    "$t('activity.rulePreviews.noviceWelfare'),",
  );

  if (c !== orig) {
    fs.writeFileSync(abs, c, 'utf8');
    console.log('Pass3', rel);
  }
}

console.log('Pass 3 complete');
