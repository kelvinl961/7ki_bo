<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :title="`修改 — ${form.currency}`"
    style="width: 720px; max-width: 98vw"
    :mask-closable="false"
    :bordered="false"
  >
    <n-spin :show="loading">
      <n-form :model="form" label-placement="left" :label-width="160" label-align="right">
        <n-form-item :label="$t('activity.interestTreasure.switch')">
          <n-switch v-model:value="form.isEnabled" />
        </n-form-item>
        <n-form-item :label="$t('activity.interestTreasure.showTooltip')">
          <n-switch v-model:value="form.showTooltip" />
        </n-form-item>
        <n-form-item :label="$t('activity.interestTreasure.annualRate')" required>
          <n-input-number v-model:value="form.annualRatePercent" :min="0" :precision="2" style="width: 200px" />
        </n-form-item>
        <n-form-item :label="$t('activity.interestTreasure.minDeposit')" required>
          <n-input-number v-model:value="form.minDeposit" :min="0" :precision="2" style="width: 200px" />
        </n-form-item>
        <n-form-item :label="$t('activity.interestTreasure.auditMode')" required>
          <n-radio-group v-model:value="form.auditMode">
            <n-space>
              <n-radio value="interest">{{ $t('activity.interestTreasure.auditInterest') }}</n-radio>
              <n-radio value="interest_principal">{{ $t('activity.interestTreasure.auditInterestPrincipal') }}</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item :label="$t('activity.interestTreasure.auditMultiplier')">
          <n-input-number v-model:value="form.auditMultiplier" :min="0" :precision="2" style="width: 160px" />
        </n-form-item>
        <n-form-item :label="$t('activity.interestTreasure.auditPlatforms')">
          <n-radio-group v-model:value="form.auditPlatformMode">
            <n-space vertical>
              <n-radio value="unlimited">{{ $t('activity.interestTreasure.auditUnlimited') }}</n-radio>
              <n-radio value="include">{{ $t('activity.interestTreasure.auditInclude') }}</n-radio>
              <n-radio value="exclude">{{ $t('activity.interestTreasure.auditExclude') }}</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item :label="$t('activity.interestTreasure.settleCycle')" required>
          <n-radio-group v-model:value="settlePreset">
            <n-space vertical>
              <n-radio :value="5">5 {{ $t('activity.interestTreasure.minutes') }}</n-radio>
              <n-radio :value="10">10 {{ $t('activity.interestTreasure.minutes') }}</n-radio>
              <n-radio :value="15">15 {{ $t('activity.interestTreasure.minutes') }}</n-radio>
              <n-radio :value="30">30 {{ $t('activity.interestTreasure.minutes') }}</n-radio>
              <n-radio :value="-1">
                <n-space align="center">
                  <span>{{ $t('activity.interestTreasure.other') }}</span>
                  <n-input-number
                    v-model:value="customMinutes"
                    :min="1"
                    :disabled="settlePreset !== -1"
                    style="width: 100px"
                  />
                  <span>{{ $t('activity.interestTreasure.minutes') }}</span>
                </n-space>
              </n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item :label="$t('activity.interestTreasure.claimTiming')" required>
          <n-radio-group v-model:value="form.claimTiming">
            <n-space>
              <n-radio value="next_day">{{ $t('activity.interestTreasure.claimNextDay') }}</n-radio>
              <n-radio value="realtime">{{ $t('activity.interestTreasure.claimRealtime') }}</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item :label="$t('activity.interestTreasure.interestCap')">
          <n-space align="center">
            <n-input-number v-model:value="form.interestCapCycles" :min="0" style="width: 120px" />
            <n-text depth="3" class="text-xs">{{ $t('activity.interestTreasure.capHint') }}</n-text>
          </n-space>
        </n-form-item>
        <n-form-item :label="$t('activity.interestTreasure.memberTiers')">
          <n-spin :show="tiersLoading" size="small">
            <n-checkbox-group v-model:value="form.memberTierIds">
              <n-space>
                <n-checkbox
                  v-for="t in tierOptions"
                  :key="t.id"
                  :value="t.id"
                  :label="t.label"
                />
              </n-space>
            </n-checkbox-group>
          </n-spin>
        </n-form-item>
        <n-form-item :label="$t('activity.interestTreasure.ruleDesc')">
          <n-space vertical style="width: 100%">
            <n-radio-group v-model:value="form.ruleMode">
              <n-space>
                <n-radio value="custom">{{ $t('activity.interestTreasure.ruleCustom') }}</n-radio>
                <n-radio value="system">{{ $t('activity.interestTreasure.ruleSystem') }}</n-radio>
              </n-space>
            </n-radio-group>
            <n-input
              v-model:value="form.ruleText"
              type="textarea"
              :rows="6"
              :disabled="form.ruleMode === 'system'"
            />
          </n-space>
        </n-form-item>
      </n-form>
    </n-spin>
    <template #footer>
      <n-space justify="end">
        <n-button @click="visible = false">{{ $t('activity.interestTreasure.cancel') }}</n-button>
        <n-button type="primary" :loading="submitting" @click="submit">
          {{ $t('activity.interestTreasure.save') }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';
import { computed, reactive, ref, watch } from 'vue';
import {
  NModal, NForm, NFormItem, NSwitch, NInputNumber, NRadioGroup, NRadio,
  NSpace, NCheckboxGroup, NCheckbox, NInput, NButton, NSpin, NText, useMessage,
} from 'naive-ui';
import { getActiveMemberTiersApi } from '#/api/core/memberTier';
import {
  interestTreasureApi,
  type InterestTreasureConfig,
} from '#/api/interestTreasure';

const props = defineProps<{
  show: boolean;
  config: InterestTreasureConfig | null;
}>();
const emit = defineEmits<{
  (e: 'update:show', v: boolean): void;
  (e: 'saved'): void;
}>();

const message = useMessage();
const loading = ref(false);
const submitting = ref(false);
const tiersLoading = ref(false);
const tierOptions = ref<{ id: number; label: string }[]>([]);
const settlePreset = ref<number>(5);
const customMinutes = ref(60);

const visible = computed({
  get: () => props.show,
  set: (v) => emit('update:show', v),
});

const form = reactive({
  currency: '',
  isEnabled: false,
  showTooltip: true,
  annualRatePercent: 0,
  minDeposit: 0,
  auditMode: 'interest' as 'interest' | 'interest_principal',
  auditMultiplier: 0,
  auditPlatformMode: 'unlimited',
  settleCycleMinutes: 5,
  claimTiming: 'next_day' as 'next_day' | 'realtime',
  interestCapCycles: 0,
  ruleMode: 'system',
  ruleText: '' as string | null,
  memberTierIds: [] as number[],
});

watch(settlePreset, (v) => {
  if (v > 0) form.settleCycleMinutes = v;
});

async function loadTiers() {
  tiersLoading.value = true;
  try {
    const tiers = await getActiveMemberTiersApi();
    tierOptions.value = (tiers || []).map((t) => ({
      id: Number(t.id),
      label: t.tierName || t.tierCode || String(t.id),
    }));
  } finally {
    tiersLoading.value = false;
  }
}

function applyConfig(c: InterestTreasureConfig) {
  form.currency = c.currency;
  form.isEnabled = c.isEnabled;
  form.showTooltip = c.showTooltip;
  form.annualRatePercent = Number(c.annualRatePercent);
  form.minDeposit = Number(c.minDeposit);
  form.auditMode = c.auditMode || 'interest';
  form.auditMultiplier = Number(c.auditMultiplier);
  form.auditPlatformMode = c.auditPlatformMode || 'unlimited';
  form.settleCycleMinutes = c.settleCycleMinutes || 5;
  form.claimTiming = c.claimTiming || 'next_day';
  form.interestCapCycles = c.interestCapCycles ?? 0;
  form.ruleMode = c.ruleMode || 'system';
  form.ruleText = c.ruleText || '';
  form.memberTierIds = [...(c.memberTierIds || [])];
  if ([5, 10, 15, 30].includes(form.settleCycleMinutes)) {
    settlePreset.value = form.settleCycleMinutes;
  } else {
    settlePreset.value = -1;
    customMinutes.value = form.settleCycleMinutes;
  }
}

async function submit() {
  if (!props.config?.id) return;
  if (settlePreset.value === -1) {
    form.settleCycleMinutes = customMinutes.value;
  }
  submitting.value = true;
  try {
    await interestTreasureApi.updateConfig(props.config.id, {
      isEnabled: form.isEnabled,
      showTooltip: form.showTooltip,
      annualRatePercent: form.annualRatePercent,
      minDeposit: form.minDeposit,
      auditMode: form.auditMode,
      auditMultiplier: form.auditMultiplier,
      auditPlatformMode: form.auditPlatformMode,
      settleCycleMinutes: form.settleCycleMinutes,
      claimTiming: form.claimTiming,
      interestCapCycles: form.interestCapCycles,
      ruleMode: form.ruleMode,
      ruleText: form.ruleText,
      memberTierIds: form.memberTierIds,
    });
    message.success($t('activity.interestTreasure.saveSuccess'));
    visible.value = false;
    emit('saved');
  } catch (e: any) {
    message.error(e?.response?.data?.message || e?.message || $t('activity.interestTreasure.saveFailed'));
  } finally {
    submitting.value = false;
  }
}

watch(visible, async (v) => {
  if (!v || !props.config) return;
  loading.value = true;
  try {
    await loadTiers();
    applyConfig(props.config);
  } finally {
    loading.value = false;
  }
});
</script>
