<template>
  <div>
    <n-alert type="info" style="margin-bottom: 16px;">
      配置该代理模式的阶梯返佣规则，每个层级可以设置不同的门槛和比例。
    </n-alert>

    <!-- 操作按钮 -->
    <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
      <h3>返佣层级配置</h3>
      <n-button type="primary" @click="handleAddTier">新增层级</n-button>
    </div>

    <!-- 层级列表 -->
    <n-space vertical :size="16">
      <n-card 
        v-for="(tier, index) in tiers" 
        :key="index"
        :title="`第${tier.levelNo}级`"
        size="small"
      >
        <template #header-extra>
          <n-button 
            size="small" 
            type="error" 
            text 
            @click="handleRemoveTier(index)"
          >
            删除
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
              <n-form-item label="层级序号">
                <n-input-number 
                  v-model:value="tier.levelNo" 
                  :min="1" 
                  :max="10"
                  placeholder="层级序号"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="指标类型">
                <n-select 
                  v-model:value="tier.metricType" 
                  :options="metricTypeOptions"
                  placeholder="选择指标类型"
                />
              </n-form-item>
            </n-gi>
          </n-grid>

          <n-grid :cols="2" :x-gap="16">
            <n-gi>
              <n-form-item label="门槛下限">
                <n-input-number 
                  v-model:value="tier.rangeMin" 
                  :min="0"
                  :precision="2"
                  placeholder="最小值"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="门槛上限">
                <n-input-number 
                  v-model:value="tier.rangeMax" 
                  :min="0"
                  :precision="2"
                  placeholder="最大值（不填表示无上限）"
                />
              </n-form-item>
            </n-gi>
          </n-grid>

          <n-grid :cols="3" :x-gap="16">
            <n-gi>
              <n-form-item label="返佣比例(%)">
                <n-input-number 
                  v-model:value="tier.ratePercent" 
                  :min="0"
                  :max="100"
                  :precision="4"
                  placeholder="返佣比例"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="单级封顶">
                <n-input-number 
                  v-model:value="tier.capAmount" 
                  :min="0"
                  :precision="2"
                  placeholder="单级最大返佣金额"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="超出部分额外比例(%)">
                <n-input-number 
                  v-model:value="tier.extraRate" 
                  :min="0"
                  :max="100"
                  :precision="4"
                  placeholder="超出部分额外返佣比例"
                />
              </n-form-item>
            </n-gi>
          </n-grid>

          <n-form-item label="复杂规则配置">
            <n-input 
              v-model:value="tier.ruleJsonText" 
              type="textarea"
              :rows="3"
              placeholder="JSON格式的复杂规则配置（可选）"
            />
          </n-form-item>
        </n-form>
      </n-card>
    </n-space>

    <!-- 空状态 -->
    <n-empty 
      v-if="tiers.length === 0"
      description="暂无层级配置，点击上方按钮新增"
      style="margin: 40px 0;"
    />

    <!-- 预览区域 -->
    <n-card v-if="tiers.length > 0" title="配置预览" style="margin-top: 24px;">
      <n-table :single-line="false" size="small">
        <thead>
          <tr>
            <th>层级</th>
            <th>指标类型</th>
            <th>门槛范围</th>
            <th>返佣比例</th>
            <th>单级封顶</th>
            <th>额外比例</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tier in sortedTiers" :key="tier.levelNo">
            <td>第{{ tier.levelNo }}级</td>
            <td>{{ getMetricTypeLabel(tier.metricType) }}</td>
            <td>
              {{ tier.rangeMin || 0 }} - {{ tier.rangeMax || '∞' }}
            </td>
            <td>{{ tier.ratePercent || 0 }}%</td>
            <td>{{ tier.capAmount || '无限制' }}</td>
            <td>{{ tier.extraRate || 0 }}%</td>
          </tr>
        </tbody>
      </n-table>
    </n-card>

    <!-- 操作按钮 -->
    <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px;">
      <n-button @click="$emit('close')">取消</n-button>
      <n-button type="primary" @click="handleSave" :loading="saveLoading">
        保存配置
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
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

// 响应式数据
const tiers = ref<(AgentModeTier & { ruleJsonText?: string })[]>([]);
const saveLoading = ref(false);
const loadLoading = ref(false);

// 指标类型选项
const metricTypeOptions = [
  { label: '有效投注', value: 'VALID_BET' },
  { label: '净盈利', value: 'NET_PROFIT' },
  { label: '存款', value: 'DEPOSIT' },
  { label: '充值', value: 'RECHARGE' },
  { label: '组合', value: 'COMPOSITE' },
];

// 计算属性
const sortedTiers = computed(() => {
  return [...tiers.value].sort((a, b) => a.levelNo - b.levelNo);
});

// 方法
const getMetricTypeLabel = (type: string) => {
  const option = metricTypeOptions.find(opt => opt.value === type);
  return option?.label || type;
};

const loadTiers = async () => {
  loadLoading.value = true;
  try {
    const response = await agentModeApi.getAgentModeTiers(props.modeId);
    if (response.success) {
      tiers.value = response.data.map(tier => ({
        ...tier,
        ruleJsonText: tier.ruleJson ? JSON.stringify(tier.ruleJson, null, 2) : '',
      }));
    }
  } catch (error) {
    console.error('加载层级配置失败:', error);
    message.error('加载层级配置失败');
  } finally {
    loadLoading.value = false;
  }
};

const handleAddTier = () => {
  const nextLevelNo = tiers.value.length > 0 
    ? Math.max(...tiers.value.map(t => t.levelNo)) + 1 
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
  // 验证层级序号唯一性
  const levelNos = tiers.value.map(t => t.levelNo);
  const uniqueLevelNos = new Set(levelNos);
  if (levelNos.length !== uniqueLevelNos.size) {
    message.error('层级序号不能重复');
    return false;
  }

  // 验证必填字段
  for (const tier of tiers.value) {
    if (!tier.levelNo || tier.levelNo < 1) {
      message.error('层级序号必须大于0');
      return false;
    }
    if (!tier.metricType) {
      message.error('请选择指标类型');
      return false;
    }
    if (tier.rangeMin === undefined || tier.rangeMin < 0) {
      message.error('门槛下限不能为空且必须大于等于0');
      return false;
    }
    if (tier.rangeMax !== undefined && tier.rangeMax < tier.rangeMin) {
      message.error('门槛上限不能小于下限');
      return false;
    }
    if (tier.ratePercent === undefined || tier.ratePercent < 0 || tier.ratePercent > 100) {
      message.error('返佣比例必须在0-100之间');
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
    // 处理 JSON 规则
    const processedTiers: AgentModeTier[] = tiers.value.map(tier => {
      const result: AgentModeTier = {
        levelNo: tier.levelNo,
        metricType: tier.metricType,
        rangeMin: tier.rangeMin,
        rangeMax: tier.rangeMax,
        ratePercent: tier.ratePercent,
        capAmount: tier.capAmount,
        extraRate: tier.extraRate,
      };

      // 处理 JSON 规则
      if (tier.ruleJsonText && tier.ruleJsonText.trim()) {
        try {
          result.ruleJson = JSON.parse(tier.ruleJsonText);
        } catch (error) {
          throw new Error(`第${tier.levelNo}级的复杂规则JSON格式错误`);
        }
      }

      return result;
    });

    await agentModeApi.updateAgentModeTiers(props.modeId, processedTiers);
    message.success('保存成功');
    emit('updated');
    emit('close');
  } catch (error) {
    console.error('保存失败:', error);
    message.error(error instanceof Error ? error.message : '保存失败');
  } finally {
    saveLoading.value = false;
  }
};

// 组件挂载时加载数据
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
