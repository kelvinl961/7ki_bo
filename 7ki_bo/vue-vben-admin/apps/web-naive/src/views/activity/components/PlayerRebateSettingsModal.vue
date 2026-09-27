<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :title="$t('activity.playerRebate.settings')"
    style="width: 640px; max-width: 96vw"
    :mask-closable="false"
    :bordered="false"
  >
    <n-spin :show="loading">
      <n-form
        :model="form"
        label-placement="left"
        :label-width="140"
        label-align="right"
        class="pr-settings-form"
      >
        <n-form-item :label="$t('activity.playerRebate.switch')">
          <n-switch v-model:value="form.isEnabled">
            <template #checked>{{ $t('activity.playerRebate.active') }}</template>
            <template #unchecked>{{ $t('activity.playerRebate.inactive') }}</template>
          </n-switch>
        </n-form-item>

        <n-form-item :label="$t('activity.playerRebate.settleMode')" required>
          <n-space vertical :size="10">
            <n-radio-group v-model:value="form.settleMode" name="pr-settle">
              <n-space vertical>
                <n-radio value="none">{{ $t('activity.playerRebate.settleNone') }}</n-radio>
                <n-radio value="daily">
                  <n-space align="center" :size="6">
                    <span>{{ $t('activity.playerRebate.settleDaily') }}</span>
                    <n-input-number
                      v-model:value="form.settleHour"
                      :min="0"
                      :max="23"
                      :disabled="form.settleMode !== 'daily'"
                      style="width: 80px"
                    />
                    <span>{{ $t('activity.playerRebate.settleAt') }}</span>
                  </n-space>
                </n-radio>
                <n-radio value="weekly">
                  <n-space align="center" :size="6">
                    <span>{{ $t('activity.playerRebate.settleWeekly') }}</span>
                    <n-select
                      v-model:value="form.settleWeekday"
                      :options="weekdayOptions"
                      :disabled="form.settleMode !== 'weekly'"
                      style="width: 110px"
                    />
                    <n-input-number
                      v-model:value="form.settleHour"
                      :min="0"
                      :max="23"
                      :disabled="form.settleMode !== 'weekly'"
                      style="width: 80px"
                    />
                    <span>{{ $t('activity.playerRebate.settleAt') }}</span>
                  </n-space>
                </n-radio>
                <n-radio value="monthly">
                  <n-space align="center" :size="6">
                    <span>{{ $t('activity.playerRebate.settleMonthly') }}</span>
                    <n-input-number
                      v-model:value="form.settleMonthDay"
                      :min="1"
                      :max="28"
                      :disabled="form.settleMode !== 'monthly'"
                      style="width: 80px"
                    />
                    <span>{{ $t('activity.playerRebate.monthDay') }}</span>
                    <n-input-number
                      v-model:value="form.settleHour"
                      :min="0"
                      :max="23"
                      :disabled="form.settleMode !== 'monthly'"
                      style="width: 80px"
                    />
                    <span>{{ $t('activity.playerRebate.settleAt') }}</span>
                  </n-space>
                </n-radio>
              </n-space>
            </n-radio-group>
          </n-space>
        </n-form-item>

        <n-form-item :label="$t('activity.playerRebate.distributeMode')" required>
          <n-radio-group v-model:value="form.distributeMode" name="pr-dist">
            <n-space vertical>
              <n-radio value="self_auto">{{ $t('activity.playerRebate.distSelfAuto') }}</n-radio>
              <n-radio value="self_void">{{ $t('activity.playerRebate.distSelfVoid') }}</n-radio>
              <n-radio value="system_auto">{{ $t('activity.playerRebate.distSystemAuto') }}</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <n-form-item :label="$t('activity.playerRebate.claimTiming')" required>
          <n-radio-group v-model:value="form.claimTiming" name="pr-claim">
            <n-space>
              <n-radio value="next_day">{{ $t('activity.playerRebate.claimNextDay') }}</n-radio>
              <n-radio value="realtime">{{ $t('activity.playerRebate.claimRealtime') }}</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <n-form-item :label="$t('activity.playerRebate.expiryDays')" required>
          <n-space align="center">
            <n-input-number v-model:value="form.expiryDays" :min="0" :max="365" style="width: 120px" />
            <n-text depth="3" class="text-xs">{{ $t('activity.playerRebate.expiryHint') }}</n-text>
          </n-space>
        </n-form-item>
      </n-form>
    </n-spin>

    <template #footer>
      <n-space justify="end">
        <n-button @click="visible = false">{{ $t('activity.playerRebate.cancel') }}</n-button>
        <n-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ $t('activity.playerRebate.save') }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';
import { computed, reactive, ref, watch } from 'vue';
import {
  NModal,
  NForm,
  NFormItem,
  NSwitch,
  NRadioGroup,
  NRadio,
  NSpace,
  NInputNumber,
  NSelect,
  NButton,
  NSpin,
  NText,
  useMessage,
} from 'naive-ui';
import {
  playerRebateApi,
  type PlayerRebateSettings,
} from '#/api/playerRebate';

const props = defineProps<{ show: boolean }>();
const emit = defineEmits<{
  (e: 'update:show', v: boolean): void;
  (e: 'saved'): void;
}>();

const message = useMessage();
const loading = ref(false);
const submitting = ref(false);

const visible = computed({
  get: () => props.show,
  set: (v) => emit('update:show', v),
});

const form = reactive({
  isEnabled: false,
  settleMode: 'none' as PlayerRebateSettings['settleMode'],
  settleHour: 0,
  settleWeekday: 1,
  settleMonthDay: 1,
  distributeMode: 'self_auto' as PlayerRebateSettings['distributeMode'],
  claimTiming: 'next_day' as PlayerRebateSettings['claimTiming'],
  expiryDays: 3,
});

const weekdayOptions = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
  { label: '6', value: 6 },
  { label: '7', value: 7 },
];

async function load() {
  loading.value = true;
  try {
    const res = (await playerRebateApi.getSettings()) as {
      success?: boolean;
      data?: PlayerRebateSettings;
    };
    const data = res?.data ?? (res as unknown as PlayerRebateSettings);
    if (!data) return;
    form.isEnabled = Boolean(data.isEnabled);
    form.settleMode = data.settleMode ?? 'none';
    form.settleHour = Number(data.settleHour ?? 0);
    form.settleWeekday = Number(data.settleWeekday ?? 1);
    form.settleMonthDay = Number(data.settleMonthDay ?? 1);
    form.distributeMode = data.distributeMode ?? 'self_auto';
    form.claimTiming = data.claimTiming ?? 'next_day';
    form.expiryDays = Number(data.expiryDays ?? 3);
  } catch (e: any) {
    message.error(e?.message || $t('activity.playerRebate.loadFailed'));
  } finally {
    loading.value = false;
  }
}

async function handleSubmit() {
  submitting.value = true;
  try {
    await playerRebateApi.updateSettings({
      isEnabled: form.isEnabled,
      settleMode: form.settleMode,
      settleHour: form.settleHour,
      settleWeekday: form.settleWeekday,
      settleMonthDay: form.settleMonthDay,
      distributeMode: form.distributeMode,
      claimTiming: form.claimTiming,
      expiryDays: form.expiryDays,
    });
    message.success($t('activity.playerRebate.saveSuccess'));
    visible.value = false;
    emit('saved');
  } catch (e: any) {
    message.error(e?.message || $t('activity.playerRebate.saveFailed'));
  } finally {
    submitting.value = false;
  }
}

watch(visible, (v) => {
  if (v) load();
});
</script>
