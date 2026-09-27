<template>
  <div class="activity-chest-manager space-y-3">
    <n-card :bordered="false">
      <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <span class="text-sm font-medium">宝箱开关</span>
          <n-switch
            v-model:value="settings.chestsEnabled"
            :loading="savingSwitch"
            @update:value="toggleChests"
          />
          <n-button type="primary" @click="showSettings = true"
            >活跃度设置</n-button
          >
        </div>
        <div class="flex gap-2">
          <n-button type="primary" @click="openChest()">新增宝箱</n-button>
          <n-button @click="load">刷新</n-button>
        </div>
      </div>

      <n-data-table
        :columns="columns"
        :data="chests"
        :loading="loading"
        size="small"
      />
    </n-card>

    <!-- Settings modal -->
    <n-modal
      v-model:show="showSettings"
      preset="card"
      title="活跃度设置"
      style="width: 520px"
    >
      <n-form label-placement="left" label-width="160">
        <n-form-item label="重复循环开宝箱">
          <n-radio-group v-model:value="settings.allowRepeatCycle">
            <n-radio :value="false">不允许</n-radio>
            <n-radio :value="true">允许</n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="宝箱重置时间">
          <n-radio-group v-model:value="settings.chestResetCycle">
            <n-radio value="daily">每日重置</n-radio>
            <n-radio value="weekly">每周重置</n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="稽核倍数" required>
          <n-input-number
            v-model:value="settings.auditMultiplier"
            :min="0"
            :precision="2"
            class="w-full"
          />
        </n-form-item>
        <n-form-item label="奖金稽核指定平台">
          <n-radio-group v-model:value="settings.auditPlatformMode">
            <n-radio value="unlimited">不限制</n-radio>
            <n-radio value="include">仅限以下勾选平台</n-radio>
            <n-radio value="exclude">排除勾选平台</n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="奖金提现方式限制">
          <n-radio-group v-model:value="settings.withdrawMethodMode">
            <n-radio value="unlimited">不限制</n-radio>
            <n-radio value="include">仅限勾选方式</n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="默认过期天数">
          <n-input-number
            v-model:value="settings.defaultExpiryDays"
            :min="1"
            :max="31"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="showSettings = false">取消</n-button>
          <n-button
            type="primary"
            :loading="savingSettings"
            @click="saveSettings"
            >确认</n-button
          >
        </div>
      </template>
    </n-modal>

    <!-- Chest edit -->
    <n-modal
      v-model:show="showChest"
      preset="card"
      title="宝箱配置"
      style="width: 560px"
    >
      <n-form label-placement="left" label-width="120">
        <n-form-item label="宝箱名称">
          <n-input v-model:value="chestForm.name" />
        </n-form-item>
        <n-form-item label="宝箱icon URL">
          <n-input v-model:value="chestForm.iconUrl" placeholder="可选" />
        </n-form-item>
        <n-form-item label="所需活跃度" required>
          <n-input-number v-model:value="chestForm.cost" :min="1" class="w-full" />
        </n-form-item>
        <n-form-item label="奖励类型">
          <n-radio-group v-model:value="chestForm.rewardType">
            <n-radio value="fixed">固定</n-radio>
            <n-radio value="random">随机</n-radio>
          </n-radio-group>
        </n-form-item>
        <template v-if="chestForm.rewardType === 'fixed'">
          <n-form-item label="奖励金额">
            <n-input-number
              v-model:value="chestForm.rewardAmount"
              :min="0"
              :precision="2"
              class="w-full"
            />
          </n-form-item>
        </template>
        <template v-else>
          <n-form-item label="奖励区间">
            <div class="flex gap-2 w-full">
              <n-input-number
                v-model:value="chestForm.rewardMin"
                :min="0"
                :precision="2"
                class="flex-1"
              />
              <n-input-number
                v-model:value="chestForm.rewardMax"
                :min="0"
                :precision="2"
                class="flex-1"
              />
            </div>
          </n-form-item>
          <n-form-item label="期望奖金">
            <n-input-number
              v-model:value="chestForm.expectedAmount"
              :min="0"
              :precision="2"
              class="w-full"
            />
          </n-form-item>
          <n-form-item label="展示金额">
            <div class="flex gap-2 w-full">
              <n-input-number
                v-model:value="chestForm.displayMin"
                :min="0"
                :precision="2"
                class="flex-1"
              />
              <n-input-number
                v-model:value="chestForm.displayMax"
                :min="0"
                :precision="2"
                class="flex-1"
              />
            </div>
          </n-form-item>
        </template>
        <n-form-item label="排序">
          <n-input-number v-model:value="chestForm.sortOrder" :min="0" class="w-full" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="showChest = false">取消</n-button>
          <n-button type="primary" :loading="savingChest" @click="saveChest"
            >确认</n-button
          >
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue';
import { NButton, useMessage, type DataTableColumns } from 'naive-ui';
import { taskCenterPeriodicApi } from '#/api/taskCenterPeriodic';

const message = useMessage();
const loading = ref(false);
const savingSwitch = ref(false);
const savingSettings = ref(false);
const savingChest = ref(false);
const showSettings = ref(false);
const showChest = ref(false);
const chests = ref<any[]>([]);
const editId = ref<number | null>(null);

const settings = reactive({
  chestsEnabled: true,
  allowRepeatCycle: false,
  chestResetCycle: 'daily' as 'daily' | 'weekly',
  auditMultiplier: 0,
  auditPlatformMode: 'unlimited',
  withdrawMethodMode: 'unlimited',
  defaultExpiryDays: 7,
});

const chestForm = reactive({
  name: '',
  iconUrl: '',
  cost: 1,
  rewardType: 'fixed' as 'fixed' | 'random',
  rewardAmount: 0,
  rewardMin: 0,
  rewardMax: 0,
  expectedAmount: 0,
  displayMin: 0,
  displayMax: 0,
  sortOrder: 0,
});

const columns: DataTableColumns<any> = [
  {
    title: '宝箱icon',
    key: 'iconUrl',
    width: 70,
    render: (r) =>
      r.iconUrl
        ? h('img', { src: r.iconUrl, style: 'width:28px;height:28px' })
        : '🎁',
  },
  {
    title: '宝箱名称',
    key: 'name',
    render: (r) => r.name || r.title || `宝箱 ${r.id}`,
  },
  {
    title: '所需活跃度',
    key: 'cost',
    render: (r) => String(r.cost ?? r.threshold ?? 0),
  },
  {
    title: '奖励类型',
    key: 'rewardType',
    render: (r) => (r.rewardType === 'random' ? '随机' : '固定'),
  },
  {
    title: '奖励金额',
    key: 'reward',
    render: (r) => {
      if (r.rewardType === 'random') {
        return `${r.rewardMin ?? 0}-${r.rewardMax ?? 0}`;
      }
      return String(r.rewardAmount ?? r.rewardCash ?? 0);
    },
  },
  {
    title: '期望奖金',
    key: 'expectedAmount',
    render: (r) =>
      r.rewardType === 'random' ? String(r.expectedAmount ?? '--') : '--',
  },
  {
    title: '展示金额',
    key: 'display',
    render: (r) =>
      r.rewardType === 'random'
        ? `${r.displayMin ?? '--'}-${r.displayMax ?? '--'}`
        : '--',
  },
  { title: '操作人', key: 'updatedBy', render: (r) => r.updatedBy || '--' },
  {
    title: '操作时间',
    key: 'updatedAt',
    render: (r) =>
      r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '--',
  },
  {
    title: '操作',
    key: 'a',
    render: (row) =>
      h(
        NButton,
        { size: 'small', onClick: () => openChest(row) },
        { default: () => '修改' },
      ),
  },
];

async function load() {
  loading.value = true;
  try {
    const [s, c]: any[] = await Promise.all([
      taskCenterPeriodicApi.getPointSettings(),
      taskCenterPeriodicApi.listChests(),
    ]);
    const sd = s?.data ?? s;
    if (sd) {
      settings.chestsEnabled = sd.chestsEnabled !== false;
      settings.allowRepeatCycle = Boolean(sd.allowRepeatCycle);
      settings.chestResetCycle =
        sd.chestResetCycle === 'weekly' ? 'weekly' : 'daily';
      settings.auditMultiplier = Number(sd.auditMultiplier) || 0;
      settings.auditPlatformMode = sd.auditPlatformMode || 'unlimited';
      settings.withdrawMethodMode = sd.withdrawMethodMode || 'unlimited';
      settings.defaultExpiryDays = Number(sd.defaultExpiryDays) || 7;
    }
    chests.value = c?.data ?? c ?? [];
  } catch (e: any) {
    message.error(e?.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

async function toggleChests(v: boolean) {
  savingSwitch.value = true;
  try {
    await taskCenterPeriodicApi.updatePointSettings({ chestsEnabled: v });
    message.success(v ? '宝箱已开启' : '宝箱已关闭');
  } catch (e: any) {
    settings.chestsEnabled = !v;
    message.error(e?.message || '更新失败');
  } finally {
    savingSwitch.value = false;
  }
}

async function saveSettings() {
  savingSettings.value = true;
  try {
    await taskCenterPeriodicApi.updatePointSettings({
      allowRepeatCycle: settings.allowRepeatCycle,
      chestResetCycle: settings.chestResetCycle,
      auditMultiplier: settings.auditMultiplier,
      auditPlatformMode: settings.auditPlatformMode as any,
      withdrawMethodMode: settings.withdrawMethodMode as any,
      defaultExpiryDays: settings.defaultExpiryDays,
    });
    showSettings.value = false;
    message.success('已保存');
  } catch (e: any) {
    message.error(e?.message || '保存失败');
  } finally {
    savingSettings.value = false;
  }
}

function openChest(row?: any) {
  if (row) {
    editId.value = row.id;
    chestForm.name = row.name || row.title || '';
    chestForm.iconUrl = row.iconUrl || '';
    chestForm.cost = Number(row.cost ?? row.threshold) || 1;
    chestForm.rewardType = row.rewardType === 'random' ? 'random' : 'fixed';
    chestForm.rewardAmount = Number(row.rewardAmount ?? row.rewardCash) || 0;
    chestForm.rewardMin = Number(row.rewardMin) || 0;
    chestForm.rewardMax = Number(row.rewardMax) || 0;
    chestForm.expectedAmount = Number(row.expectedAmount) || 0;
    chestForm.displayMin = Number(row.displayMin) || 0;
    chestForm.displayMax = Number(row.displayMax) || 0;
    chestForm.sortOrder = Number(row.sortOrder) || 0;
  } else {
    editId.value = null;
    chestForm.name = `活跃度宝箱 ${(chests.value.length || 0) + 1}`;
    chestForm.iconUrl = '';
    chestForm.cost = 1;
    chestForm.rewardType = 'fixed';
    chestForm.rewardAmount = 0;
    chestForm.rewardMin = 0;
    chestForm.rewardMax = 0;
    chestForm.expectedAmount = 0;
    chestForm.displayMin = 0;
    chestForm.displayMax = 0;
    chestForm.sortOrder = chests.value.length;
  }
  showChest.value = true;
}

async function saveChest() {
  savingChest.value = true;
  try {
    const body: Record<string, unknown> = {
      name: chestForm.name,
      title: chestForm.name,
      iconUrl: chestForm.iconUrl || null,
      cost: chestForm.cost,
      threshold: chestForm.cost,
      rewardType: chestForm.rewardType,
      sortOrder: chestForm.sortOrder,
      isActive: true,
    };
    if (chestForm.rewardType === 'fixed') {
      body.rewardAmount = chestForm.rewardAmount;
      body.rewardCash = chestForm.rewardAmount;
    } else {
      body.rewardMin = chestForm.rewardMin;
      body.rewardMax = chestForm.rewardMax;
      body.expectedAmount = chestForm.expectedAmount;
      body.displayMin = chestForm.displayMin;
      body.displayMax = chestForm.displayMax;
      body.rewardAmount = 0;
    }
    if (editId.value) {
      await taskCenterPeriodicApi.updateChest(editId.value, body);
    } else {
      await taskCenterPeriodicApi.createChest(body);
    }
    showChest.value = false;
    await load();
    message.success('已保存');
  } catch (e: any) {
    message.error(e?.message || '保存失败');
  } finally {
    savingChest.value = false;
  }
}

onMounted(load);
</script>
