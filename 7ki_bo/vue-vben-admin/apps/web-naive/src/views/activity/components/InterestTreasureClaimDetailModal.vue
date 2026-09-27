<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :title="$t('activity.interestTreasure.detail')"
    style="width: 520px; max-width: 96vw"
    :mask-closable="true"
  >
    <n-spin :show="loading">
      <table class="it-detail-table" v-if="detail">
        <tbody>
          <tr><td>{{ $t('activity.interestTreasure.currency') }}</td><td>{{ detail.currency }}</td></tr>
          <tr><td>{{ $t('activity.interestTreasure.memberId') }}</td><td>{{ detail.userId }}</td></tr>
          <tr><td>{{ $t('activity.interestTreasure.memberAccount') }}</td><td>{{ detail.memberAccount }}</td></tr>
          <tr><td>{{ $t('activity.interestTreasure.principal') }}</td><td>{{ detail.principal }}</td></tr>
          <tr>
            <td>{{ $t('activity.interestTreasure.period') }}</td>
            <td>
              {{ formatDt(detail.periodStart) }} - {{ formatDt(detail.periodEnd) }}
              ({{ detail.cyclesCount }}{{ $t('activity.interestTreasure.cycles') }})
            </td>
          </tr>
          <tr><td>{{ $t('activity.interestTreasure.duration') }}</td><td>{{ detail.durationMinutes }}{{ $t('activity.interestTreasure.minutes') }}</td></tr>
          <tr><td>{{ $t('activity.interestTreasure.annualRate') }}</td><td>{{ detail.annualRatePercent }}%</td></tr>
          <tr><td>{{ $t('activity.interestTreasure.settleCycle') }}</td><td>{{ $t('activity.interestTreasure.every') }}{{ detail.settleCycleMinutes }}{{ $t('activity.interestTreasure.minutes') }}</td></tr>
          <tr><td>{{ $t('activity.interestTreasure.interestCap') }}</td><td>{{ detail.interestCapCycles }}{{ $t('activity.interestTreasure.cycles') }}</td></tr>
          <tr><td>{{ $t('activity.interestTreasure.claimAmount') }}</td><td>{{ detail.claimAmount }}</td></tr>
          <tr><td>{{ $t('activity.interestTreasure.claimTime') }}</td><td>{{ formatDt(detail.claimedAt) }}</td></tr>
          <tr>
            <td>{{ $t('activity.interestTreasure.claimMethod') }}</td>
            <td>
              {{ detail.claimMethod === 'auto_realtime'
                ? $t('activity.interestTreasure.claimRealtime')
                : $t('activity.interestTreasure.claimManual') }}
            </td>
          </tr>
        </tbody>
      </table>
    </n-spin>
    <template #footer>
      <n-space justify="center">
        <n-button type="primary" @click="visible = false">{{ $t('activity.interestTreasure.close') }}</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';
import { computed, ref, watch } from 'vue';
import { NModal, NSpin, NButton, NSpace, useMessage } from 'naive-ui';
import { interestTreasureApi } from '#/api/interestTreasure';

const props = defineProps<{ show: boolean; ledgerId: number | null }>();
const emit = defineEmits<{ (e: 'update:show', v: boolean): void }>();
const message = useMessage();
const loading = ref(false);
const detail = ref<any>(null);

const visible = computed({
  get: () => props.show,
  set: (v) => emit('update:show', v),
});

function formatDt(v: string | Date) {
  if (!v) return '—';
  const d = typeof v === 'string' ? new Date(v) : v;
  return d.toLocaleString();
}

watch(visible, async (v) => {
  if (!v || !props.ledgerId) return;
  loading.value = true;
  detail.value = null;
  try {
    const res: any = await interestTreasureApi.getClaimDetail(props.ledgerId);
    detail.value = res?.data ?? res;
  } catch (e: any) {
    message.error(e?.message || $t('activity.interestTreasure.loadFailed'));
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.it-detail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.it-detail-table td {
  border: 1px solid var(--n-border-color);
  padding: 8px 12px;
}
.it-detail-table td:first-child {
  width: 140px;
  background: var(--n-color-embedded);
  color: var(--n-text-color-3);
}
</style>
