<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { NDataTable, NSpin, type DataTableColumns } from 'naive-ui';
import { $t } from '@vben/locales';
import { renderTzDateTime } from '#/components/common/tzDateTimeRender';
import {
  getFundingTransferSessionSummaryApi,
  type FundingTransferSessionSummaryData,
  type FundingTransferSessionSummaryRow,
} from '#/api/core/user-detail';

const props = defineProps<{
  userId: number;
  txId: string;
}>();

/** Module-level cache so re-expand of the same tx does not re-fetch. */
const summaryCache = new Map<string, FundingTransferSessionSummaryData>();

const loading = ref(true);
const error = ref<string | null>(null);
const summary = ref<FundingTransferSessionSummaryData | null>(null);

function formatMoney(n: number | null | undefined): string {
  if (n == null || Number.isNaN(Number(n))) return '0.00';
  return Number(n).toFixed(2);
}

function formatWinLoss(n: number): string {
  const v = Number(n) || 0;
  const abs = Math.abs(v).toFixed(2);
  if (v > 0) return `+${abs}`;
  if (v < 0) return `-${abs}`;
  return abs;
}

const columns = computed<DataTableColumns<FundingTransferSessionSummaryRow>>(
  () => [
    {
      title: $t('user.userDetail.sessionDetailStartTime'),
      key: 'startTime',
      width: 160,
      render: (row) =>
        row.startTime ? renderTzDateTime(row.startTime) : '-',
    },
    {
      title: $t('user.userDetail.sessionDetailEndTime'),
      key: 'endTime',
      width: 160,
      render: (row) =>
        row.endTime ? renderTzDateTime(row.endTime) : '-',
    },
    {
      title: $t('user.userDetail.sessionDetailPlatform'),
      key: 'platform',
      width: 100,
      render: (row) => row.platform || '-',
    },
    {
      title: $t('user.userDetail.sessionDetailCategory'),
      key: 'category',
      width: 90,
      render: (row) => row.category || '-',
    },
    {
      title: $t('user.userDetail.sessionDetailGameName'),
      key: 'gameName',
      width: 140,
      ellipsis: { tooltip: true },
      render: (row) => row.gameName || '-',
    },
    {
      title: $t('user.userDetail.sessionDetailBetCount'),
      key: 'betCount',
      width: 90,
      align: 'right',
      render: (row) => String(row.betCount ?? 0),
    },
    {
      title: $t('user.userDetail.sessionDetailBetAmount'),
      key: 'betAmount',
      width: 110,
      align: 'right',
      render: (row) => formatMoney(row.betAmount),
    },
    {
      title: $t('user.userDetail.sessionDetailValidBet'),
      key: 'validBet',
      width: 110,
      align: 'right',
      render: (row) => formatMoney(row.validBet),
    },
    {
      title: $t('user.userDetail.sessionDetailWithholdingTax'),
      key: 'withholdingTax',
      width: 90,
      align: 'right',
      render: (row) => formatMoney(row.withholdingTax ?? 0),
    },
    {
      title: $t('user.userDetail.sessionDetailMemberWinLoss'),
      key: 'memberWinLoss',
      width: 110,
      align: 'right',
      render: (row) => {
        const v = Number(row.memberWinLoss) || 0;
        const color = v > 0 ? '#18a058' : v < 0 ? '#d03050' : undefined;
        return h(
          'span',
          { style: color ? { color } : undefined },
          formatWinLoss(v),
        );
      },
    },
  ],
);

const tableData = computed(() => summary.value?.rows ?? []);

const footerLabel = computed(() => $t('user.userDetail.sessionDetailTotal'));

onMounted(async () => {
  const cacheKey = `${props.userId}:${props.txId}`;
  const cached = summaryCache.get(cacheKey);
  if (cached) {
    summary.value = cached;
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = null;
  try {
    const data = await getFundingTransferSessionSummaryApi(
      props.userId,
      props.txId,
    );
    summaryCache.set(cacheKey, data);
    summary.value = data;
  } catch (e: unknown) {
    const msg =
      e && typeof e === 'object' && 'message' in e
        ? String((e as { message: unknown }).message)
        : $t('user.userDetail.sessionDetailLoadFailed');
    error.value = msg;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="transfer-session-expand px-2 py-2">
    <n-spin :show="loading">
      <div v-if="error" class="py-3 text-sm text-red-500">
        {{ error }}
      </div>
      <template v-else>
        <n-data-table
          size="small"
          :bordered="true"
          :single-line="false"
          :columns="columns"
          :data="tableData"
          :pagination="false"
          :row-key="
            (row: FundingTransferSessionSummaryRow, i: number) =>
              `${row.platform}-${row.category}-${row.gameName}-${i}`
          "
        />
        <div
          v-if="summary"
          class="mt-1 flex flex-wrap items-center justify-end gap-4 border-t border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium"
        >
          <span>{{ footerLabel }}</span>
          <span
            >{{ $t('user.userDetail.sessionDetailBetCount') }}:
            {{ summary.totals.betCount }}</span
          >
          <span
            >{{ $t('user.userDetail.sessionDetailBetAmount') }}:
            {{ formatMoney(summary.totals.betAmount) }}</span
          >
          <span
            >{{ $t('user.userDetail.sessionDetailValidBet') }}:
            {{ formatMoney(summary.totals.validBet) }}</span
          >
          <span
            >{{ $t('user.userDetail.sessionDetailWithholdingTax') }}:
            {{ formatMoney(summary.totals.withholdingTax) }}</span
          >
          <span
            :style="{
              color:
                summary.totals.memberWinLoss > 0
                  ? '#18a058'
                  : summary.totals.memberWinLoss < 0
                    ? '#d03050'
                    : undefined,
            }"
            >{{ $t('user.userDetail.sessionDetailMemberWinLoss') }}:
            {{ formatWinLoss(summary.totals.memberWinLoss) }}</span
          >
        </div>
        <div
          v-else-if="!loading"
          class="py-3 text-center text-sm text-gray-400"
        >
          {{ $t('user.userDetail.sessionDetailEmpty') }}
        </div>
      </template>
    </n-spin>
  </div>
</template>

<style scoped>
.transfer-session-expand :deep(.n-data-table) {
  background: #fafafa;
}
</style>
