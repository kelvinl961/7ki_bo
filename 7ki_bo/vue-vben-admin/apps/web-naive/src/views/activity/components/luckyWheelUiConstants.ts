import { LUCKY_WHEEL_TYPE_OPTIONS } from './luckyWheelTypes';

export const MEMBER_SEARCH_OPTIONS = [
  { label: '会员账号', value: 'account' },
  { label: '会员ID', value: 'memberId' },
] as const;

export const OPERATOR_SEARCH_OPTIONS = [
  { label: '操作人', value: 'operator' },
  { label: '收件人', value: 'recipient' },
] as const;

export const LUCKY_VALUE_CHANGE_TYPE_OPTIONS = [
  { label: '全部', value: null },
  { label: '获得', value: 'earn' },
  { label: '消耗', value: 'consume' },
  { label: '过期', value: 'expire' },
  { label: '扣除', value: 'deduct' },
  { label: '人工调整', value: 'manual' },
];

export const REMAINING_VALUE_METRIC_OPTIONS = [
  { label: '剩余幸运值', value: 'remaining' },
  { label: '消耗幸运值', value: 'consumed' },
  { label: '过期幸运值', value: 'expired' },
  { label: '获得幸运值', value: 'earned' },
] as const;

export const WINNING_REWARD_TYPE_OPTIONS = [
  { label: '固定奖金', value: 'fixed_bonus' },
  { label: '随机奖金', value: 'random_bonus' },
  { label: '实物', value: 'physical' },
  { label: '谢谢参与(奖金0)', value: 'none' },
];

export const WHEEL_TYPE_FILTER_OPTIONS = [
  { label: '全部类型', value: null },
  ...LUCKY_WHEEL_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
];

export const PHYSICAL_ORDER_STATUS_OPTIONS = [
  { label: '全部状态', value: null },
  { label: '待发货', value: 'pending_shipment' },
  { label: '已发货', value: 'shipped' },
  { label: '已签收', value: 'received' },
];

export const PHYSICAL_ORDER_TIME_FIELD_OPTIONS = [
  { label: '中奖时间', value: 'wonAt' },
  { label: '发货时间', value: 'shippedAt' },
  { label: '操作时间', value: 'operatedAt' },
];

export const BULK_ACTION_OPTIONS = [
  { label: '批量导出', value: 'export' },
];
