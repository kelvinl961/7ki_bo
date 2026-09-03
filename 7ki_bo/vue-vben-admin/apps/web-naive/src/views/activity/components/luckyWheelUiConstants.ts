export const MEMBER_SEARCH_OPTION_KEYS = [
  { labelKey: 'activity.luckyWheelUi.memberAccount', value: 'account' },
  { labelKey: 'activity.luckyWheelUi.memberId', value: 'memberId' },
] as const;

export const OPERATOR_SEARCH_OPTION_KEYS = [
  { labelKey: 'activity.luckyWheelUi.operator', value: 'operator' },
  { labelKey: 'activity.luckyWheelUi.recipient', value: 'recipient' },
] as const;

export const LUCKY_VALUE_CHANGE_TYPE_OPTION_KEYS = [
  { labelKey: 'activity.luckyWheelUi.all', value: null },
  { labelKey: 'activity.luckyWheelUi.earn', value: 'BET_EARN' },
  { labelKey: 'activity.luckyWheelUi.depositEarn', value: 'DEPOSIT_EARN' },
  { labelKey: 'activity.luckyWheelUi.manualAdd', value: 'MANUAL_ADD' },
  { labelKey: 'activity.luckyWheelUi.deduct', value: 'MANUAL_DEDUCT' },
  { labelKey: 'activity.luckyWheelUi.consumeSilver', value: 'SPIN_CONSUME_SILVER' },
  { labelKey: 'activity.luckyWheelUi.consumeGold', value: 'SPIN_CONSUME_GOLD' },
  { labelKey: 'activity.luckyWheelUi.consumeDiamond', value: 'SPIN_CONSUME_DIAMOND' },
  { labelKey: 'activity.luckyWheelUi.consume', value: 'SPIN_CONSUME' },
  { labelKey: 'activity.luckyWheelUi.expire', value: 'EXPIRE_VOID' },
];

export const REMAINING_VALUE_METRIC_OPTION_KEYS = [
  { labelKey: 'activity.luckyWheelUi.remainingLuckyValue', value: 'remaining' },
  { labelKey: 'activity.luckyWheelUi.consumedLuckyValue', value: 'consumed' },
  { labelKey: 'activity.luckyWheelUi.expiredLuckyValue', value: 'expired' },
  { labelKey: 'activity.luckyWheelUi.earnedLuckyValue', value: 'earned' },
] as const;

export const WINNING_REWARD_TYPE_OPTION_KEYS = [
  { labelKey: 'activity.luckyWheelUi.fixedBonus', value: 'FIXED_CASH' },
  { labelKey: 'activity.luckyWheelUi.randomBonus', value: 'RANDOM_CASH' },
  { labelKey: 'activity.luckyWheelUi.physical', value: 'PHYSICAL' },
  { labelKey: 'activity.luckyWheelUi.none', value: 'THANK_YOU' },
  { labelKey: 'activity.luckyWheelUi.displayOnly', value: 'DISPLAY_ONLY' },
];

export const WHEEL_TYPE_FILTER_OPTION_KEYS = [
  { labelKey: 'activity.luckyWheelUi.allTypes', value: null },
  { labelKey: 'activity.luckyWheelUi.wheelSilver', value: 'silver' },
  { labelKey: 'activity.luckyWheelUi.wheelGold', value: 'gold' },
  { labelKey: 'activity.luckyWheelUi.wheelDiamond', value: 'diamond' },
  { labelKey: 'activity.luckyWheelUi.wheelCustom', value: 'custom' },
];

export const PHYSICAL_ORDER_STATUS_OPTION_KEYS = [
  { labelKey: 'activity.luckyWheelUi.allStatuses', value: null },
  { labelKey: 'activity.luckyWheelUi.pendingShipment', value: 'pending_shipment' },
  { labelKey: 'activity.luckyWheelUi.shipped', value: 'shipped' },
  { labelKey: 'activity.luckyWheelUi.received', value: 'received' },
];

export const PHYSICAL_ORDER_TIME_FIELD_OPTION_KEYS = [
  { labelKey: 'activity.luckyWheelUi.wonAt', value: 'wonAt' },
  { labelKey: 'activity.luckyWheelUi.shippedAt', value: 'shippedAt' },
  { labelKey: 'activity.luckyWheelUi.operatedAt', value: 'operatedAt' },
];

export const BULK_ACTION_OPTION_KEYS = [
  { labelKey: 'activity.luckyWheelUi.bulkExport', value: 'export' },
  { labelKey: 'activity.luckyWheelAddLuckyValue.deductAction', value: 'deduct' },
];
