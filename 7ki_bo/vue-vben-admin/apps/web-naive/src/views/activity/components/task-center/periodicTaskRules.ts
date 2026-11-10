export type PeriodicSettingsCategory =
  | 'DAILY_TASK'
  | 'WEEKLY_TASK'
  | 'THREE_DAY_MYSTERY';

export function wageringRuleLine(auditMultiplier: number, index = 6): string {
  const multiple = Number(auditMultiplier);
  if (!Number.isFinite(multiple) || multiple <= 0) {
    return `${index}. 投注说明：赠送的奖金无需流水，可直接提现`;
  }
  return `${index}. 投注说明：赠送的奖金需${multiple.toFixed(2)}倍流水（即稽核有效投注）才能提现，投注不限游戏平台`;
}

export function systemRuleText(
  category: 'DAILY_TASK' | 'WEEKLY_TASK',
  auditMultiplier = 2,
): string {
  const reset =
    category === 'WEEKLY_TASK'
      ? '每周任务只统计当周的数据，任务进度将于UTC -03:00时间周一00:00自动更新并重置'
      : '每日任务只统计当天的数据，任务进度将于UTC -03:00时间00:00自动更新并重置';
  return [
    '1. 适用对象：所有平台注册用户',
    '2. 任务与奖励：完成以上任务可获得对应奖励，完成任务越多，收获越多',
    `3. 重置时间：${reset}`,
    '4. 奖励发放：完成任务后，需在指定时间内手动领取，仅限iOS_APP、Android_APP、PC、iOS_H5、Android_H5',
    '5. 奖励有效期：所有类型的奖励均有有效期，请在规定时间内领取或者使用，逾期作废',
    wageringRuleLine(Number(auditMultiplier || 0) > 0 ? auditMultiplier : 2, 6),
  ].join('\n');
}

export function threeDaySystemRuleText(input: {
  auditMultiplier?: number;
  claimPlatforms?: string;
  claimCondition?: string;
}): string {
  const platforms = input.claimPlatforms?.trim() || 'Android_APP、PC、iOS_APP、Android_H5、iOS_H5';
  const condition =
    input.claimCondition?.trim() || '完成当日抽取的全部任务才可领取';
  return [
    '1. 适用对象：所有平台注册用户',
    '2. 任务与奖励：每日完成任务可获得对应奖励，连续3日完成任务可解锁最终神秘大奖',
    '3. 重置时间：每日任务于当天00:00更新重置，且神秘奖励必须连续3个自然日均完成任务，中途不可中断，一旦在任何一天未能完成任务，您挑战3日进度将自动清零，必须重新开始',
    `4. 领取条件：${condition}`,
    `5. 奖励发放：完成任务后，需在指定时间内手动领取，仅限${platforms}`,
    '6. 奖励有效期：所有类型的奖励均有有效期，请在规定时间内领取或者使用，逾期作废',
    wageringRuleLine(Number(input.auditMultiplier || 0), 7),
  ].join('\n');
}

export const MEMBER_GROUP_OPTIONS = [
  { key: 'defaultLevel', label: '默认层级' },
  { key: 'yellowLevel', label: '首充玩家' },
  { key: 'oneHundredYuan', label: '百元玩家' },
  { key: 'oneThousandYuan', label: '千元玩家' },
  { key: 'tenThousandYuan', label: '万元玩家' },
  { key: 'fiftyThousandYuan', label: '5万玩家' },
  { key: 'oneHundredThousandYuan', label: '10万玩家' },
  { key: 'thirtyThousandYuan', label: '50万玩家' },
  { key: 'millionYuan', label: '100万大客户' },
  { key: 'threeThousandYuan', label: '千万富豪' },
  { key: 'childrenPlay', label: '刷子玩家' },
  { key: 'chainPlay', label: '可疑玩家' },
  { key: 'badgePlay', label: '恶意玩家' },
  { key: 'profitPlay', label: '套利玩家' },
  { key: 'deadUser', label: '死牢用户' },
  { key: 'fixedAgent', label: '固定代理' },
  { key: 'manualExport', label: '手动出款专用' },
  { key: 'testLevel', label: '测试层级' },
] as const;
