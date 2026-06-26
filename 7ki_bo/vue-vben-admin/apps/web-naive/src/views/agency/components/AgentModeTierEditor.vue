<template>
  <div>
    <n-alert type="info" style="margin-bottom: 16px">
      {{ $t('agency.tierEditor.description') }}
    </n-alert>

    <div
      style="
        margin-bottom: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      "
    >
      <h3>{{ $t('agency.tierEditor.tierConfig') }}</h3>
      <n-button type="primary" @click="handleAddTier">{{
        $t('agency.tierEditor.addTier')
      }}</n-button>
    </div>

    <n-space vertical :size="16">
      <n-card
        v-for="(tier, index) in tiers"
        :key="index"
        :title="$t('agency.tierEditor.tierLevel', [tier.levelNo])"
        size="small"
      >
        <template #header-extra>
          <n-button
            size="small"
            type="error"
            text
            @click="handleRemoveTier(index)"
          >
            {{ $t('common.delete') }}
          </n-button>
        </template>

        <n-form
          :model="tier"
          label-placement="left"
          label-width="120px"
          size="small"
        >
          <n-grid :cols="3" :x-gap="16">
            <n-gi>
              <n-form-item :label="$t('agency.tierEditor.levelNo')">
                <n-input-number
                  v-model:value="tier.levelNo"
                  :min="1"
                  :max="10"
                  :placeholder="$t('agency.tierEditor.levelNo')"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('agency.tierEditor.metricType')">
                <n-select
                  v-model:value="tier.metricType"
                  :options="metricTypeOptions"
                  :placeholder="$t('agency.tierEditor.selectMetric')"
                />
              </n-form-item>
            </n-gi>
          </n-grid>

          <n-grid :cols="2" :x-gap="16">
            <n-gi>
              <n-form-item :label="$t('agency.tierEditor.thresholdMin')">
                <n-input-number
                  v-model:value="tier.rangeMin"
                  :min="0"
                  :precision="2"
                  :placeholder="$t('agency.agentList.minValue')"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('agency.tierEditor.thresholdMax')">
                <n-input-number
                  v-model:value="tier.rangeMax"
                  :min="0"
                  :precision="2"
                  :placeholder="$t('agency.tierEditor.thresholdMaxHint')"
                />
              </n-form-item>
            </n-gi>
          </n-grid>

          <n-grid :cols="3" :x-gap="16">
            <n-gi>
              <n-form-item :label="$t('agency.tierEditor.rebateRate')">
                <n-input-number
                  v-model:value="tier.ratePercent"
                  :min="0"
                  :max="100"
                  :precision="4"
                  :placeholder="$t('agency.tierEditor.rebateRate')"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('agency.tierEditor.tierCap')">
                <n-input-number
                  v-model:value="tier.capAmount"
                  :min="0"
                  :precision="2"
                  :placeholder="$t('agency.tierEditor.tierCapHint')"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('agency.tierEditor.extraRate')">
                <n-input-number
                  v-model:value="tier.extraRate"
                  :min="0"
                  :max="100"
                  :precision="4"
                  :placeholder="$t('agency.tierEditor.extraRateHint')"
                />
              </n-form-item>
            </n-gi>
          </n-grid>

          <n-form-item :label="$t('agency.tierEditor.complexRules')">
            <n-input
              v-model:value="tier.ruleJsonText"
              type="textarea"
              :rows="3"
              :placeholder="$t('agency.tierEditor.complexRulesPlaceholder')"
            />
          </n-form-item>
        </n-form>
      </n-card>
    </n-space>

    <n-empty
      v-if="tiers.length === 0"
      :description="$t('agency.tierEditor.emptyState')"
      style="margin: 40px 0"
    />

    <n-card
      v-if="tiers.length > 0"
      :title="$t('agency.tierEditor.preview')"
      style="margin-top: 24px"
    >
      <n-table :single-line="false" size="small">
        <thead>
          <tr>
            <th>{{ $t('agency.tierEditor.tierCol') }}</th>
            <th>{{ $t('agency.tierEditor.metricType') }}</th>
            <th>{{ $t('agency.tierEditor.thresholdRange') }}</th>
            <th>{{ $t('agency.tierEditor.rebateRate') }}</th>
            <th>{{ $t('agency.tierEditor.tierCap') }}</th>
            <th>{{ $t('agency.tierEditor.extraRateCol') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tier in sortedTiers" :key="tier.levelNo">
            <td>{{ $t('agency.tierEditor.tierLevel', [tier.levelNo]) }}</td>
            <td>{{ getMetricTypeLabel(tier.metricType) }}</td>
            <td>
              {{ tier.rangeMin || 0 }} -
              {{ tier.rangeMax ?? $t('agency.tierEditor.unlimited') }}
            </td>
            <td>{{ tier.ratePercent || 0 }}%</td>
            <td>
              {{ tier.capAmount ?? $t('agency.tierEditor.unlimited') }}
            </td>
            <td>{{ tier.extraRate || 0 }}%</td>
          </tr>
        </tbody>
      </n-table>
    </n-card>

    <div
      style="
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 24px;
      "
    >
      <n-button @click="$emit('close')">{{ $t('common.cancel') }}</n-button>
      <n-button type="primary" @click="handleSave" :loading="saveLoading">
        {{ $t('agency.tierEditor.saveConfig') }}
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, computed, onMounted } from 'vue';
import { useMessage } from 'naive-ui';
import { agentModeApi, type AgentModeTier } from '#/api/agency/agent-mode';

interface Props {
  modeId: number;
}

interface Emits {
  (e: 'close'): void;
  (e: 'updated'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const message = useMessage();

const tiers = ref<(AgentModeTier & { ruleJsonText?: string })[]>([]);
const saveLoading = ref(false);
const loadLoading = ref(false);

const metricTypeOptions = computed(() => [
  { label: $t('agency.tierEditor.metricValidBet'), value: 'VALID_BET' },
  { label: $t('agency.tierEditor.metricNetProfit'), value: 'NET_PROFIT' },
  { label: $t('agency.tierEditor.metricDeposit'), value: 'DEPOSIT' },
  { label: $t('agency.tierEditor.metricRecharge'), value: 'RECHARGE' },
  { label: $t('agency.tierEditor.metricComposite'), value: 'COMPOSITE' },
]);

const sortedTiers = computed(() => {
  return [...tiers.value].sort((a, b) => a.levelNo - b.levelNo);
});

const getMetricTypeLabel = (type: string) => {
  const option = metricTypeOptions.value.find((opt) => opt.value === type);
  return option?.label || type;
};

const loadTiers = async () => {
  loadLoading.value = true;
  try {
    const response = await agentModeApi.getAgentModeTiers(props.modeId);
    if (response.success) {
      tiers.value = response.data.map((tier) => ({
        ...tier,
        ruleJsonText: tier.ruleJson
          ? JSON.stringify(tier.ruleJson, null, 2)
          : '',
      }));
    }
  } catch (error) {
    console.error('Failed to load tier config:', error);
    message.error($t('agency.tierEditor.loadFailed'));
  } finally {
    loadLoading.value = false;
  }
};

const handleAddTier = () => {
  const nextLevelNo =
    tiers.value.length > 0
      ? Math.max(...tiers.value.map((t) => t.levelNo)) + 1
      : 1;

  tiers.value.push({
    levelNo: nextLevelNo,
    metricType: 'VALID_BET',
    rangeMin: 0,
    rangeMax: undefined,
    ratePercent: 0,
    capAmount: undefined,
    extraRate: undefined,
    ruleJsonText: '',
  });
};

const handleRemoveTier = (index: number) => {
  tiers.value.splice(index, 1);
};

const validateTiers = (): boolean => {
  const levelNos = tiers.value.map((t) => t.levelNo);
  const uniqueLevelNos = new Set(levelNos);
  if (levelNos.length !== uniqueLevelNos.size) {
    message.error($t('agency.tierEditor.duplicateLevel'));
    return false;
  }

  for (const tier of tiers.value) {
    if (!tier.levelNo || tier.levelNo < 1) {
      message.error($t('agency.tierEditor.levelMustPositive'));
      return false;
    }
    if (!tier.metricType) {
      message.error($t('agency.tierEditor.selectMetricRequired'));
      return false;
    }
    if (tier.rangeMin === undefined || tier.rangeMin < 0) {
      message.error($t('agency.tierEditor.thresholdMinRequired'));
      return false;
    }
    if (tier.rangeMax !== undefined && tier.rangeMax < tier.rangeMin) {
      message.error($t('agency.tierEditor.thresholdMaxInvalid'));
      return false;
    }
    if (
      tier.ratePercent === undefined ||
      tier.ratePercent < 0 ||
      tier.ratePercent > 100
    ) {
      message.error($t('agency.tierEditor.rebateRateRange'));
      return false;
    }
  }

  return true;
};

const handleSave = async () => {
  if (!validateTiers()) {
    return;
  }

  saveLoading.value = true;
  try {
    const processedTiers: AgentModeTier[] = tiers.value.map((tier) => {
      const result: AgentModeTier = {
        levelNo: tier.levelNo,
        metricType: tier.metricType,
        rangeMin: tier.rangeMin,
        rangeMax: tier.rangeMax,
        ratePercent: tier.ratePercent,
        capAmount: tier.capAmount,
        extraRate: tier.extraRate,
      };

      if (tier.ruleJsonText && tier.ruleJsonText.trim()) {
        try {
          result.ruleJson = JSON.parse(tier.ruleJsonText);
        } catch {
          throw new Error(
            $t('agency.tierEditor.jsonError', [String(tier.levelNo)]),
          );
        }
      }

      return result;
    });

    await agentModeApi.updateAgentModeTiers(props.modeId, processedTiers);
    message.success($t('agency.tierEditor.saveSuccess'));
    emit('updated');
    emit('close');
  } catch (error) {
    console.error('Save failed:', error);
    message.error(
      error instanceof Error ? error.message : $t('agency.tierEditor.saveFailed'),
    );
  } finally {
    saveLoading.value = false;
  }
};

onMounted(() => {
  loadTiers();
});
</script>

<style scoped>
:deep(.n-card-header) {
  padding: 12px 16px;
}

:deep(.n-card-body) {
  padding: 16px;
}

:deep(.n-form-item) {
  margin-bottom: 16px;
}
</style>
