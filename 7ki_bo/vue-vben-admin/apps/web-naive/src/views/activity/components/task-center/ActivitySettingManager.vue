<template>
  <div class="activity-chest-manager">
    <n-card :bordered="false">
      <div class="toolbar">
        <div class="toolbar-group">
          <span>宝箱开关</span>
          <n-switch
            v-model:value="settings.chestsEnabled"
            :loading="savingSwitch"
            @update:value="toggleChests"
          />
          <n-button type="primary" @click="openSettings">活跃度设置</n-button>
          <span class="count-label">{{ chests.length }}/{{ MAX_CHESTS }}</span>
        </div>
        <div class="toolbar-group">
          <n-button
            type="primary"
            :disabled="chests.length >= MAX_CHESTS"
            @click="openChest()"
          >
            新增宝箱
          </n-button>
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

    <n-modal
      v-model:show="showSettings"
      preset="card"
      title="活跃度设置"
      :style="{ width: '720px', maxWidth: '98vw' }"
      :mask-closable="false"
    >
      <n-form label-placement="left" label-width="160" size="small">
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
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item label="奖金稽核指定平台">
          <div class="field-block">
            <n-radio-group v-model:value="settings.auditPlatformMode">
              <n-space>
                <n-radio value="unlimited">不限制</n-radio>
                <n-radio value="include">仅限以下勾选平台</n-radio>
                <n-radio value="exclude">排除勾选平台</n-radio>
              </n-space>
            </n-radio-group>
            <div
              v-if="settings.auditPlatformMode !== 'unlimited'"
              class="platform-grid"
              style="margin-top: 8px"
            >
              <n-spin :show="platformsLoading" size="small">
                <div class="platform-grid-inner">
                  <div class="platform-grid-cards">
                    <div
                      v-for="p in platformList"
                      :key="p.id"
                      class="platform-card"
                      :class="{ 'platform-card--on': isPlatformSelected(p.id) }"
                      @click="togglePlatform(p.id)"
                    >
                      <div class="platform-card-icon">
                        <img
                          v-if="p.imageUrl"
                          :src="p.imageUrl"
                          :alt="p.platformName"
                          class="platform-card-img"
                        />
                        <span v-else>{{ (p.platformId || '?').substring(0, 2) }}</span>
                      </div>
                      <div class="platform-card-body">
                        <div class="platform-card-name">{{ p.platformName }}</div>
                        <div class="platform-card-meta">
                          {{ (p.gameType || '').toUpperCase() }}
                          <template v-if="p.gameCount != null">
                            • {{ p.gameCount }} 个游戏
                          </template>
                        </div>
                      </div>
                      <n-checkbox
                        :checked="isPlatformSelected(p.id)"
                        @click.stop
                        @update:checked="(c: boolean) => setPlatformSelected(p.id, c)"
                      />
                    </div>
                  </div>
                  <div v-if="!platformsLoading && platformList.length === 0" class="platform-empty">
                    暂无可用平台
                  </div>
                </div>
              </n-spin>
            </div>
          </div>
        </n-form-item>
        <n-form-item label="奖金提现方式限制">
          <div class="field-block">
            <n-radio-group v-model:value="settings.withdrawMethodMode">
              <n-space>
                <n-radio value="unlimited">不限制</n-radio>
                <n-radio value="include">仅限勾选方式</n-radio>
              </n-space>
            </n-radio-group>
            <n-checkbox-group
              v-if="settings.withdrawMethodMode === 'include'"
              v-model:value="settings.withdrawMethods"
              style="margin-top: 8px"
            >
              <n-space>
                <n-checkbox
                  v-for="method in withdrawMethodOptions"
                  :key="method.value"
                  :value="method.value"
                  :label="method.label"
                />
              </n-space>
            </n-checkbox-group>
          </div>
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
        <n-space justify="end">
          <n-button @click="showSettings = false">取消</n-button>
          <n-button type="primary" :loading="savingSettings" @click="saveSettings">
            确认
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showChest"
      preset="card"
      title="宝箱配置"
      :style="{ width: '560px' }"
      :mask-closable="false"
    >
      <n-form label-placement="left" label-width="120" size="small">
        <n-form-item label="宝箱名称">
          <n-input v-model:value="chestForm.name" />
        </n-form-item>
        <n-form-item label="宝箱">
          <MediaLibrarySelector
            v-model="chestForm.iconUrl"
            category="promotion"
            :accept-types="['image']"
            placeholder="从媒体库选择宝箱图标"
          />
        </n-form-item>
        <n-form-item label="所需活跃度" required>
          <n-input-number v-model:value="chestForm.cost" :min="1" style="width: 100%" />
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
              style="width: 100%"
            />
          </n-form-item>
        </template>
        <template v-else>
          <n-form-item label="奖励区间">
            <div class="range-row">
              <n-input-number
                v-model:value="chestForm.rewardMin"
                :min="0"
                :precision="2"
                style="flex: 1"
              />
              <span>—</span>
              <n-input-number
                v-model:value="chestForm.rewardMax"
                :min="0"
                :precision="2"
                style="flex: 1"
              />
            </div>
          </n-form-item>
          <n-form-item label="期望奖金">
            <n-input-number
              v-model:value="chestForm.expectedAmount"
              :min="0"
              :precision="2"
              style="width: 100%"
            />
          </n-form-item>
          <n-form-item label="展示金额">
            <div class="range-row">
              <n-input-number
                v-model:value="chestForm.displayMin"
                :min="0"
                :precision="2"
                style="flex: 1"
              />
              <span>—</span>
              <n-input-number
                v-model:value="chestForm.displayMax"
                :min="0"
                :precision="2"
                style="flex: 1"
              />
            </div>
          </n-form-item>
        </template>
        <n-form-item label="排序">
          <n-input-number
            v-model:value="chestForm.sortOrder"
            :min="0"
            style="width: 100%"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showChest = false">取消</n-button>
          <n-button type="primary" :loading="savingChest" @click="saveChest">
            确认
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue';
import {
  NButton,
  NCard,
  NCheckbox,
  NCheckboxGroup,
  NDataTable,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  NRadio,
  NRadioGroup,
  NSpace,
  NSpin,
  NSwitch,
  useDialog,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import MediaLibrarySelector from '#/components/MediaLibrarySelector.vue';
import { getGamePlatformListApi } from '#/api/game/platform';
import { taskCenterPeriodicApi } from '#/api/taskCenterPeriodic';

const MAX_CHESTS = 20;

/** Coerce API Decimal / string / number for table + form (avoids `[object Object]`). */
function asNum(value: unknown, fallback = 0): number {
  if (value == null || value === '') return fallback;
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  if (typeof value === 'string') {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }
  if (typeof value === 'object' && value !== null && 'toString' in value) {
    const s = String((value as { toString: () => string }).toString());
    if (s && s !== '[object Object]') {
      const n = Number(s);
      if (Number.isFinite(n)) return n;
    }
  }
  return fallback;
}

const message = useMessage();
const dialog = useDialog();
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
  auditPlatformMode: 'unlimited' as 'unlimited' | 'include' | 'exclude',
  auditPlatforms: [] as Array<number | string>,
  withdrawMethodMode: 'unlimited' as 'unlimited' | 'include',
  withdrawMethods: [] as string[],
  defaultExpiryDays: 7,
});

const platformsLoading = ref(false);
const platformList = ref<
  Array<{
    id: number;
    platformId: string;
    platformName: string;
    gameType: string;
    gameCount?: number;
    imageUrl?: string;
  }>
>([]);
const withdrawMethodOptions = [
  { label: 'PIX', value: 'PIX' },
  { label: '银行卡', value: 'BANK' },
  { label: 'USDT', value: 'USDT' },
  { label: '支付宝', value: 'ALIPAY' },
  { label: '微信', value: 'WECHAT' },
];

async function loadPlatformOptions() {
  if (platformList.value.length > 0) return;
  platformsLoading.value = true;
  try {
    const res = await getGamePlatformListApi({ pageSize: 1000, isEnabled: true });
    const list = (res as any)?.list ?? (res as any)?.data?.list ?? [];
    platformList.value = (list as any[])
      .filter((p) => p?.id != null)
      .map((p) => ({
        id: Number(p.id),
        platformId: String(p.platformId || p.id),
        platformName: String(p.platformName || p.name || p.platformId || p.id),
        gameType: String(p.gameType || 'ALL'),
        gameCount: p.subGameCount ?? p.gameCount ?? 0,
        imageUrl: String(p.logoUrl || p.imageUrl || p.imageHorizontalUrl || '').trim() || undefined,
      }));
  } catch {
    platformList.value = [];
  } finally {
    platformsLoading.value = false;
  }
}

function isPlatformSelected(id: number): boolean {
  return settings.auditPlatforms.some((x) => Number(x) === id);
}

function setPlatformSelected(id: number, checked: boolean) {
  if (checked) {
    if (!isPlatformSelected(id)) settings.auditPlatforms.push(id);
  } else {
    settings.auditPlatforms = settings.auditPlatforms.filter(
      (x) => Number(x) !== id,
    );
  }
}

function togglePlatform(id: number) {
  setPlatformSelected(id, !isPlatformSelected(id));
}

function normalizeIdList(raw: unknown): Array<number | string> {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((id) => {
      const n = Number(id);
      return Number.isFinite(n) ? n : String(id);
    })
    .filter((id) => id !== '' && id != null);
}

function normalizeMethodList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((m) => String(m).trim().toUpperCase()).filter(Boolean);
}

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

const columns = computed<DataTableColumns<any>>(() => [
  {
    title: '宝箱',
    key: 'iconUrl',
    width: 70,
    render: (r) =>
      r.iconUrl
        ? h('img', { src: r.iconUrl, style: 'width:28px;height:28px;object-fit:contain' })
        : '—',
  },
  {
    title: '宝箱名称',
    key: 'name',
    render: (r) => r.name || r.title || `宝箱 ${r.id}`,
  },
  {
    title: '所需活跃度',
    key: 'cost',
    render: (r) => String(asNum(r.cost ?? r.threshold, 0)),
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
        return `${asNum(r.rewardMin)}-${asNum(r.rewardMax)}`;
      }
      return String(asNum(r.rewardAmount ?? r.rewardCash, 0));
    },
  },
  {
    title: '期望奖金',
    key: 'expectedAmount',
    render: (r) =>
      r.rewardType === 'random'
        ? r.expectedAmount == null
          ? '--'
          : String(asNum(r.expectedAmount))
        : '--',
  },
  {
    title: '展示金额',
    key: 'display',
    render: (r) =>
      r.rewardType === 'random'
        ? `${r.displayMin == null ? '--' : asNum(r.displayMin)}-${
            r.displayMax == null ? '--' : asNum(r.displayMax)
          }`
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
    width: 140,
    render: (row) =>
      h(
        NSpace,
        { size: 8 },
        {
          default: () => [
            h(
              NButton,
              { size: 'small', text: true, type: 'primary', onClick: () => openChest(row) },
              { default: () => '修改' },
            ),
            h(
              NButton,
              {
                size: 'small',
                text: true,
                type: 'error',
                onClick: () => confirmDelete(row),
              },
              { default: () => '删除' },
            ),
          ],
        },
      ),
  },
]);

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
      settings.auditMultiplier = asNum(sd.auditMultiplier, 0);
      settings.auditPlatformMode =
        sd.auditPlatformMode === 'include' || sd.auditPlatformMode === 'exclude'
          ? sd.auditPlatformMode
          : 'unlimited';
      settings.auditPlatforms = normalizeIdList(sd.auditPlatforms);
      settings.withdrawMethodMode =
        sd.withdrawMethodMode === 'include' ? 'include' : 'unlimited';
      settings.withdrawMethods = normalizeMethodList(sd.withdrawMethods);
      settings.defaultExpiryDays = asNum(sd.defaultExpiryDays, 7) || 7;
    }
    const list = c?.data ?? c ?? [];
    chests.value = Array.isArray(list) ? list : [];
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

async function openSettings() {
  showChest.value = false;
  await loadPlatformOptions();
  showSettings.value = true;
}

async function saveSettings() {
  if (
    settings.auditPlatformMode !== 'unlimited' &&
    settings.auditPlatforms.length === 0
  ) {
    message.error('请至少勾选一个稽核平台');
    return;
  }
  if (
    settings.withdrawMethodMode === 'include' &&
    settings.withdrawMethods.length === 0
  ) {
    message.error('请至少勾选一种提现方式');
    return;
  }
  savingSettings.value = true;
  try {
    await taskCenterPeriodicApi.updatePointSettings({
      allowRepeatCycle: settings.allowRepeatCycle,
      chestResetCycle: settings.chestResetCycle,
      auditMultiplier: settings.auditMultiplier,
      auditPlatformMode: settings.auditPlatformMode,
      auditPlatforms: settings.auditPlatforms,
      withdrawMethodMode: settings.withdrawMethodMode,
      withdrawMethods: settings.withdrawMethods,
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
  showSettings.value = false;
  if (row) {
    editId.value = row.id;
    chestForm.name = row.name || row.title || '';
    chestForm.iconUrl = row.iconUrl || '';
    chestForm.cost = asNum(row.cost ?? row.threshold, 1) || 1;
    chestForm.rewardType = row.rewardType === 'random' ? 'random' : 'fixed';
    chestForm.rewardAmount = asNum(row.rewardAmount ?? row.rewardCash, 0);
    chestForm.rewardMin = asNum(row.rewardMin, 0);
    chestForm.rewardMax = asNum(row.rewardMax, 0);
    chestForm.expectedAmount = asNum(row.expectedAmount, 0);
    chestForm.displayMin = asNum(row.displayMin, 0);
    chestForm.displayMax = asNum(row.displayMax, 0);
    chestForm.sortOrder = asNum(row.sortOrder, 0);
  } else {
    if (chests.value.length >= MAX_CHESTS) {
      message.warning(`最多 ${MAX_CHESTS} 个宝箱`);
      return;
    }
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

function confirmDelete(row: any) {
  dialog.warning({
    title: '删除宝箱',
    content: `确认删除「${row.name || row.title || `宝箱 ${row.id}`}」？删除后可腾出名额继续新增。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await taskCenterPeriodicApi.deleteChest(row.id);
        message.success('已删除');
        await load();
      } catch (e: any) {
        message.error(e?.message || '删除失败');
      }
    },
  });
}

onMounted(load);
</script>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.toolbar-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.count-label {
  font-size: 13px;
  color: #6b7280;
}
.range-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.field-block {
  width: 100%;
}
.platform-grid {
  width: 100%;
}
.platform-grid-inner {
  max-height: 320px;
  overflow-y: auto;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  padding: 12px;
}
.platform-grid-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.platform-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
}
.platform-card--on {
  border-color: #3b82f6;
  background: #eff6ff;
}
.platform-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #e5e7eb;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  overflow: hidden;
}
.platform-card-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.platform-card-body {
  flex: 1;
  min-width: 0;
}
.platform-card-name {
  font-weight: 600;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.platform-card-meta {
  font-size: 12px;
  color: #6b7280;
}
.platform-empty {
  padding: 16px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}
</style>
