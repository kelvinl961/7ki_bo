<template>
  <Page>
    <n-card>
      <!-- Header Actions -->
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        "
      >
        <n-button type="primary" @click="openRulesModal"> 佣金设置 </n-button>
      </div>

      <n-tabs v-model:value="activeTab" type="line" animated>
        <!-- 1. 待审核 -->
        <n-tab-pane name="pending" tab="待审核">
          <div
            style="
              display: flex;
              gap: 8px;
              margin-bottom: 16px;
              flex-wrap: wrap;
            "
          >
            <n-radio-group
              v-model:value="pendingTabDates.state.preset"
              class="commission-date-preset-group"
              size="small"
              @update:value="pendingTabDates.onPresetChange"
            >
              <n-radio-button value="today">今日</n-radio-button>
              <n-radio-button value="yesterday">昨天</n-radio-button>
              <n-radio-button value="thisWeek">本周</n-radio-button>
              <n-radio-button value="lastWeek">上周</n-radio-button>
            </n-radio-group>
            <n-date-picker
              v-model:value="pendingTabDates.state.dateRange"
              type="daterange"
              :timezone="COMMISSION_REPORT_TIMEZONE"
              clearable
              :shortcuts="commissionDateShortcuts"
              placeholder="选择开始和结束日期"
              format="yyyy-MM-dd"
              style="width: 320px"
              @update:value="pendingTabDates.onRangeUpdate"
            />
            <n-input
              v-model:value="pendingFilters.agentAccount"
              placeholder="代理账号"
              style="width: 200px"
              clearable
            />
            <n-input
              v-model:value="pendingFilters.agentId"
              placeholder="代理ID"
              style="width: 200px"
              clearable
            />
            <n-select
              v-model:value="pendingFilters.currency"
              placeholder="币种"
              style="width: 150px"
              :options="currencyOptions"
              clearable
            />
            <n-button type="primary" @click="searchPending">搜索</n-button>
            <n-button @click="resetPendingFilters">重置</n-button>
          </div>

          <div style="display: flex; gap: 8px; margin-bottom: 16px">
            <n-button type="success" @click="batchApproveAll"
              >全部通过</n-button
            >
            <n-button type="error" @click="batchRejectAll">全部拒绝</n-button>
            <n-button
              type="warning"
              :disabled="selectedPendingKeys.length === 0"
              @click="batchApprove"
              >批量通过 ({{ selectedPendingKeys.length }})</n-button
            >
            <n-button
              type="error"
              :disabled="selectedPendingKeys.length === 0"
              @click="batchReject"
              >批量拒绝 ({{ selectedPendingKeys.length }})</n-button
            >
          </div>

          <n-data-table
            remote
            :columns="pendingColumns"
            :data="pendingData"
            :loading="pendingLoading"
            :pagination="pendingPagination"
            :row-key="(row: any) => row.id"
            v-model:checked-row-keys="selectedPendingKeys"
            @update:page="
              (page) => {
                pendingPagination.page = page;
                fetchPendingData();
              }
            "
            @update:page-size="
              (size) => {
                pendingPagination.pageSize = size;
                pendingPagination.page = 1;
                fetchPendingData();
              }
            "
          />
        </n-tab-pane>

        <!-- 2. 待领取 -->
        <n-tab-pane name="ready" tab="待领取">
          <div
            style="
              display: flex;
              gap: 8px;
              margin-bottom: 16px;
              flex-wrap: wrap;
            "
          >
            <n-radio-group
              v-model:value="readyTabDates.state.preset"
              class="commission-date-preset-group"
              size="small"
              @update:value="readyTabDates.onPresetChange"
            >
              <n-radio-button value="today">今日</n-radio-button>
              <n-radio-button value="yesterday">昨天</n-radio-button>
              <n-radio-button value="thisWeek">本周</n-radio-button>
              <n-radio-button value="lastWeek">上周</n-radio-button>
            </n-radio-group>
            <n-date-picker
              v-model:value="readyTabDates.state.dateRange"
              type="daterange"
              :timezone="COMMISSION_REPORT_TIMEZONE"
              clearable
              :shortcuts="commissionDateShortcuts"
              placeholder="选择开始和结束日期"
              format="yyyy-MM-dd"
              style="width: 320px"
              @update:value="readyTabDates.onRangeUpdate"
            />
            <n-input
              v-model:value="readyFilters.agentAccount"
              placeholder="代理账号"
              style="width: 200px"
              clearable
            />
            <n-button type="primary" @click="searchReady">搜索</n-button>
            <n-button @click="resetReadyFilters">重置</n-button>
          </div>

          <div style="display: flex; gap: 8px; margin-bottom: 16px">
            <n-button
              type="warning"
              :disabled="selectedReadyKeys.length === 0"
              @click="batchWithdraw"
              >批量撤回 ({{ selectedReadyKeys.length }})</n-button
            >
          </div>

          <n-data-table
            remote
            :columns="readyColumns"
            :data="readyData"
            :loading="readyLoading"
            :pagination="readyPagination"
            :row-key="(row: any) => row.id"
            v-model:checked-row-keys="selectedReadyKeys"
            @update:page="
              (page) => {
                readyPagination.page = page;
                fetchReadyData();
              }
            "
            @update:page-size="
              (size) => {
                readyPagination.pageSize = size;
                readyPagination.page = 1;
                fetchReadyData();
              }
            "
          />
        </n-tab-pane>

        <!-- 3. 已撤回 -->
        <n-tab-pane name="withdrawn" tab="已撤回">
          <div
            style="
              display: flex;
              gap: 8px;
              margin-bottom: 16px;
              flex-wrap: wrap;
            "
          >
            <n-radio-group
              v-model:value="withdrawnTabDates.state.preset"
              class="commission-date-preset-group"
              size="small"
              @update:value="withdrawnTabDates.onPresetChange"
            >
              <n-radio-button value="today">今日</n-radio-button>
              <n-radio-button value="yesterday">昨天</n-radio-button>
              <n-radio-button value="thisWeek">本周</n-radio-button>
              <n-radio-button value="lastWeek">上周</n-radio-button>
            </n-radio-group>
            <n-date-picker
              v-model:value="withdrawnTabDates.state.dateRange"
              type="daterange"
              :timezone="COMMISSION_REPORT_TIMEZONE"
              clearable
              :shortcuts="commissionDateShortcuts"
              placeholder="选择开始和结束日期"
              format="yyyy-MM-dd"
              style="width: 320px"
              @update:value="withdrawnTabDates.onRangeUpdate"
            />
            <n-input
              v-model:value="withdrawnFilters.agentAccount"
              placeholder="代理账号"
              style="width: 200px"
              clearable
            />
            <n-button type="primary" @click="searchWithdrawn">搜索</n-button>
            <n-button @click="resetWithdrawnFilters">重置</n-button>
          </div>

          <div style="display: flex; gap: 8px; margin-bottom: 16px">
            <n-button
              type="success"
              :disabled="selectedWithdrawnKeys.length === 0"
              @click="batchApproveWithdrawn"
              >批量通过 ({{ selectedWithdrawnKeys.length }})</n-button
            >
            <n-button
              type="error"
              :disabled="selectedWithdrawnKeys.length === 0"
              @click="batchRejectWithdrawn"
              >批量拒绝 ({{ selectedWithdrawnKeys.length }})</n-button
            >
          </div>

          <n-data-table
            remote
            :columns="withdrawnColumns"
            :data="withdrawnData"
            :loading="withdrawnLoading"
            :pagination="withdrawnPagination"
            :row-key="(row: any) => row.id"
            v-model:checked-row-keys="selectedWithdrawnKeys"
            @update:page="
              (page) => {
                withdrawnPagination.page = page;
                fetchWithdrawnData();
              }
            "
            @update:page-size="
              (size) => {
                withdrawnPagination.pageSize = size;
                withdrawnPagination.page = 1;
                fetchWithdrawnData();
              }
            "
          />
        </n-tab-pane>

        <!-- 4. 已拒绝 -->
        <n-tab-pane name="rejected" tab="已拒绝">
          <div
            style="
              display: flex;
              gap: 8px;
              margin-bottom: 16px;
              flex-wrap: wrap;
            "
          >
            <n-radio-group
              v-model:value="rejectedTabDates.state.preset"
              class="commission-date-preset-group"
              size="small"
              @update:value="rejectedTabDates.onPresetChange"
            >
              <n-radio-button value="today">今日</n-radio-button>
              <n-radio-button value="yesterday">昨天</n-radio-button>
              <n-radio-button value="thisWeek">本周</n-radio-button>
              <n-radio-button value="lastWeek">上周</n-radio-button>
            </n-radio-group>
            <n-date-picker
              v-model:value="rejectedTabDates.state.dateRange"
              type="daterange"
              :timezone="COMMISSION_REPORT_TIMEZONE"
              clearable
              :shortcuts="commissionDateShortcuts"
              placeholder="选择开始和结束日期"
              format="yyyy-MM-dd"
              style="width: 320px"
              @update:value="rejectedTabDates.onRangeUpdate"
            />
            <n-input
              v-model:value="rejectedFilters.agentAccount"
              placeholder="代理账号"
              style="width: 200px"
              clearable
            />
            <n-button type="primary" @click="searchRejected">搜索</n-button>
            <n-button @click="resetRejectedFilters">重置</n-button>
          </div>

          <n-data-table
            remote
            :columns="rejectedColumns"
            :data="rejectedData"
            :loading="rejectedLoading"
            :pagination="rejectedPagination"
            @update:page="
              (page) => {
                rejectedPagination.page = page;
                fetchRejectedData();
              }
            "
            @update:page-size="
              (size) => {
                rejectedPagination.pageSize = size;
                rejectedPagination.page = 1;
                fetchRejectedData();
              }
            "
          />
        </n-tab-pane>

        <!-- 5. 领取记录 -->
        <n-tab-pane name="claimed" tab="领取记录">
          <div
            style="
              display: flex;
              gap: 8px;
              margin-bottom: 16px;
              flex-wrap: wrap;
            "
          >
            <n-radio-group
              v-model:value="claimedTabDates.state.preset"
              class="commission-date-preset-group"
              size="small"
              @update:value="claimedTabDates.onPresetChange"
            >
              <n-radio-button value="today">今日</n-radio-button>
              <n-radio-button value="yesterday">昨天</n-radio-button>
              <n-radio-button value="thisWeek">本周</n-radio-button>
              <n-radio-button value="lastWeek">上周</n-radio-button>
            </n-radio-group>
            <n-date-picker
              v-model:value="claimedTabDates.state.dateRange"
              type="daterange"
              :timezone="COMMISSION_REPORT_TIMEZONE"
              clearable
              :shortcuts="commissionDateShortcuts"
              placeholder="选择开始和结束日期"
              format="yyyy-MM-dd"
              style="width: 320px"
              @update:value="claimedTabDates.onRangeUpdate"
            />
            <n-input
              v-model:value="claimedFilters.agentAccount"
              placeholder="代理账号"
              style="width: 200px"
              clearable
            />
            <n-button type="primary" @click="searchClaimed">搜索</n-button>
            <n-button @click="resetClaimedFilters">重置</n-button>
          </div>

          <n-data-table
            remote
            :columns="claimedColumns"
            :data="claimedData"
            :loading="claimedLoading"
            :pagination="claimedPagination"
            @update:page="
              (page) => {
                claimedPagination.page = page;
                fetchClaimedData();
              }
            "
            @update:page-size="
              (size) => {
                claimedPagination.pageSize = size;
                claimedPagination.page = 1;
                fetchClaimedData();
              }
            "
          />
        </n-tab-pane>

        <!-- 6. 全部记录 -->
        <n-tab-pane name="all" tab="全部记录">
          <div
            style="
              display: flex;
              gap: 8px;
              margin-bottom: 16px;
              flex-wrap: wrap;
            "
          >
            <n-radio-group
              v-model:value="allTabDates.state.preset"
              class="commission-date-preset-group"
              size="small"
              @update:value="allTabDates.onPresetChange"
            >
              <n-radio-button value="today">今日</n-radio-button>
              <n-radio-button value="yesterday">昨天</n-radio-button>
              <n-radio-button value="thisWeek">本周</n-radio-button>
              <n-radio-button value="lastWeek">上周</n-radio-button>
            </n-radio-group>
            <n-date-picker
              v-model:value="allTabDates.state.dateRange"
              type="daterange"
              :timezone="COMMISSION_REPORT_TIMEZONE"
              clearable
              :shortcuts="commissionDateShortcuts"
              placeholder="选择开始和结束日期"
              format="yyyy-MM-dd"
              style="width: 320px"
              @update:value="allTabDates.onRangeUpdate"
            />
            <n-input
              v-model:value="allFilters.agentAccount"
              placeholder="代理账号"
              style="width: 200px"
              clearable
            />
            <n-select
              v-model:value="allFilters.status"
              placeholder="状态"
              style="width: 150px"
              :options="statusOptions"
              clearable
            />
            <n-button type="primary" @click="searchAll">搜索</n-button>
            <n-button @click="resetAllFilters">重置</n-button>
          </div>

          <n-data-table
            remote
            :columns="allColumns"
            :data="allData"
            :loading="allLoading"
            :pagination="allPagination"
            @update:page="
              (page) => {
                allPagination.page = page;
                fetchAllData();
              }
            "
            @update:page-size="
              (size) => {
                allPagination.pageSize = size;
                allPagination.page = 1;
                fetchAllData();
              }
            "
          />
        </n-tab-pane>
      </n-tabs>
    </n-card>

    <!-- Commission Rules Modal -->
    <n-modal
      v-model:show="rulesModalVisible"
      preset="card"
      title="佣金人工审核规则"
      style="width: 600px"
      :mask-closable="false"
    >
      <div style="margin-bottom: 24px">
        <div
          v-for="currency in currencyList"
          :key="currency.code"
          style="
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 16px;
          "
        >
          <span style="min-width: 120px; color: #666">{{ currency.name }}</span>
          <span style="min-width: 80px">佣金金额≥</span>
          <n-input-number
            v-model:value="(settingsForm as any)[currency.code]"
            :min="0"
            :precision="2"
            style="flex: 1"
            placeholder="0.00"
          />
        </div>
      </div>

      <div
        style="
          background: #f5f7fa;
          padding: 16px;
          border-radius: 4px;
          margin-bottom: 16px;
        "
      >
        <div style="font-weight: 500; margin-bottom: 8px">
          佣金人工审核规则:
        </div>
        <div style="color: #666; line-height: 1.6">
          1.若佣金结算之后的佣金超过设置的金额, 将被人工审核；<br />
          2.0表示不限制。
        </div>
      </div>

      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 12px">
          <n-button @click="rulesModalVisible = false">取消</n-button>
          <n-button
            type="primary"
            @click="saveSettings"
            :loading="settingsSaving"
            >确认</n-button
          >
        </div>
      </template>
    </n-modal>

    <!-- Approve Modal -->
    <n-modal
      v-model:show="approveModalVisible"
      preset="card"
      title="通过审核"
      style="width: 500px"
      :mask-closable="false"
    >
      <n-form
        ref="approveFormRef"
        :model="approveForm"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="代理账号">
          <n-input :value="currentRecord?.agentAccount" disabled />
        </n-form-item>
        <n-form-item label="原始佣金">
          <n-input
            :value="formatCurrency(currentRecord?.commissionAmount)"
            disabled
          />
        </n-form-item>
        <n-form-item label="修改后佣金" required>
          <n-input-number
            v-model:value="approveForm.adjustedAmount"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item label="备注">
          <n-input
            v-model:value="approveForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 12px">
          <n-button @click="approveModalVisible = false">取消</n-button>
          <n-button type="primary" @click="confirmApprove" :loading="approving"
            >确认通过</n-button
          >
        </div>
      </template>
    </n-modal>

    <!-- Reject Modal -->
    <n-modal
      v-model:show="rejectModalVisible"
      preset="card"
      title="拒绝佣金"
      style="width: 500px"
      :mask-closable="false"
    >
      <n-form
        ref="rejectFormRef"
        :model="rejectForm"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="代理账号">
          <n-input :value="currentRecord?.agentAccount" disabled />
        </n-form-item>
        <n-form-item label="佣金金额">
          <n-input
            :value="formatCurrency(currentRecord?.commissionAmount)"
            disabled
          />
        </n-form-item>
        <n-form-item label="拒绝原因" required>
          <n-input
            v-model:value="rejectForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入拒绝原因"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 12px">
          <n-button @click="rejectModalVisible = false">取消</n-button>
          <n-button type="error" @click="confirmReject" :loading="rejecting"
            >确认拒绝</n-button
          >
        </div>
      </template>
    </n-modal>

    <!-- Remark Modal -->
    <n-modal
      v-model:show="remarkModalVisible"
      preset="card"
      title="添加备注"
      style="width: 500px"
      :mask-closable="false"
    >
      <n-form
        ref="remarkFormRef"
        :model="remarkForm"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="备注内容" required>
          <n-input
            v-model:value="remarkForm.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入备注内容"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 12px">
          <n-button @click="remarkModalVisible = false">取消</n-button>
          <n-button
            type="primary"
            @click="confirmRemark"
            :loading="remarkSaving"
            >保存</n-button
          >
        </div>
      </template>
    </n-modal>
  </Page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, h } from 'vue';
import { Page } from '@vben/common-ui';
import {
  NCard,
  NTabs,
  NTabPane,
  NButton,
  NDataTable,
  NDatePicker,
  NRadioGroup,
  NRadioButton,
  NInput,
  NSelect,
  NModal,
  NForm,
  NFormItem,
  NInputNumber,
  NTag,
  NPopconfirm,
  useMessage,
  useDialog,
  type DataTableColumns,
} from 'naive-ui';
import { requestClient } from '#/api/request';
import { convertTimezoneToUTC, getNowInTimezone } from '#/utils/timezoneUtils';

/** 与优惠明细等报表一致：按圣保罗日历日传参 */
const COMMISSION_REPORT_TIMEZONE = 'America/Sao_Paulo';

const message = useMessage();
const dialog = useDialog();

// Active tab
const activeTab = ref('pending');

// Currency options
const currencyOptions = [
  { label: 'BRL', value: 'BRL' },
  { label: 'ZMW', value: 'ZMW' },
  { label: 'USDT', value: 'USDT' },
];

// Status options
const statusOptions = [
  { label: '待审核', value: 'PENDING' },
  { label: '待领取', value: 'READY' },
  { label: '已撤回', value: 'WITHDRAWN' },
  { label: '已拒绝', value: 'REJECTED' },
  { label: '已领取', value: 'CLAIMED' },
];

// Format currency
const formatCurrency = (amount: number, currency: string = 'BRL') => {
  if (amount === null || amount === undefined) return '0.00';
  return `${amount.toFixed(2)} ${currency}`;
};

// Format date
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

// ==================== 1. Commission Settings ====================
const settingsLoading = ref(false);
const settingsData = ref<any[]>([]);
const rulesModalVisible = ref(false);
const settingsSaving = ref(false);
const settingsForm = reactive({
  BRL: 0,
});

const currencyList = [{ code: 'BRL', name: '巴西雷亚尔(BRL)' }];

const fetchSettings = async () => {
  settingsLoading.value = true;
  try {
    const response = await requestClient.get('/commission-management/settings');
    console.log('Settings response:', response);

    if (response.success && response.data) {
      settingsData.value = response.data;
      // Update form with fetched values
      settingsData.value.forEach((item: any) => {
        if (item.currency === 'BRL') {
          settingsForm.BRL = item.threshold;
        }
      });
    } else {
      // Use default value
      settingsForm.BRL = 0;
    }
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    message.error('加载设置失败');
    // Use default value
    settingsForm.BRL = 0;
  } finally {
    settingsLoading.value = false;
  }
};

const openRulesModal = () => {
  rulesModalVisible.value = true;
};

const saveSettings = async () => {
  settingsSaving.value = true;
  try {
    const response = await requestClient.post(
      '/commission-management/settings',
      settingsForm,
    );
    console.log('Save settings response:', response);

    if (response.success) {
      message.success('保存成功');
      rulesModalVisible.value = false;
      fetchSettings();
    } else {
      message.error(response.message || '保存失败');
    }
  } catch (error: any) {
    console.error('Failed to save settings:', error);
    message.error(error.message || '保存失败');
  } finally {
    settingsSaving.value = false;
  }
};

// ==================== 2. Pending Approval ====================
const pendingLoading = ref(false);
const pendingData = ref<any[]>([]);
const selectedPendingKeys = ref<number[]>([]);
const pendingPagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  showQuickJumper: true,
  pageSizes: [10, 20, 50, 100],
});

function addCalendarDaysInTz(
  year: number,
  month: number,
  day: number,
  deltaDays: number,
  tz: string,
): { year: number; month: number; day: number } {
  const anchor = convertTimezoneToUTC(year, month, day, 12, 0, 0, tz).getTime();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(anchor + deltaDays * 86_400_000));
  const y = Number(parts.find((p) => p.type === 'year')?.value);
  const m = Number(parts.find((p) => p.type === 'month')?.value);
  const d = Number(parts.find((p) => p.type === 'day')?.value);
  return { year: y, month: m, day: d };
}

function getTodayRange(): [number, number] {
  const tz = COMMISSION_REPORT_TIMEZONE;
  const tzNow = getNowInTimezone(tz);
  const start = convertTimezoneToUTC(tzNow.year, tzNow.month, tzNow.day, 0, 0, 0, tz);
  const end = convertTimezoneToUTC(tzNow.year, tzNow.month, tzNow.day, 23, 59, 59, tz);
  return [start.getTime(), end.getTime()];
}

function getMondayOfWeekContaining(
  year: number,
  month: number,
  day: number,
): { year: number; month: number; day: number } {
  const tz = COMMISSION_REPORT_TIMEZONE;
  const noon = convertTimezoneToUTC(year, month, day, 12, 0, 0, tz);
  const weekdayShort = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
  }).format(noon);
  const dowMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const dow = dowMap[weekdayShort] ?? 1;
  const daysFromMonday = dow === 0 ? 6 : dow - 1;
  let monY = year;
  let monM = month;
  let monD = day;
  for (let i = 0; i < daysFromMonday; i++) {
    const prev = addCalendarDaysInTz(monY, monM, monD, -1, tz);
    monY = prev.year;
    monM = prev.month;
    monD = prev.day;
  }
  return { year: monY, month: monM, day: monD };
}

function getYesterdayRange(): [number, number] {
  const tz = COMMISSION_REPORT_TIMEZONE;
  const { year, month, day } = getNowInTimezone(tz);
  const y = addCalendarDaysInTz(year, month, day, -1, tz);
  const start = convertTimezoneToUTC(y.year, y.month, y.day, 0, 0, 0, tz);
  const end = convertTimezoneToUTC(y.year, y.month, y.day, 23, 59, 59, tz);
  return [start.getTime(), end.getTime()];
}

function getWeekRange(): [number, number] {
  const tz = COMMISSION_REPORT_TIMEZONE;
  const { year, month, day } = getNowInTimezone(tz);
  const mon = getMondayOfWeekContaining(year, month, day);
  const sun = addCalendarDaysInTz(mon.year, mon.month, mon.day, 6, tz);
  const start = convertTimezoneToUTC(mon.year, mon.month, mon.day, 0, 0, 0, tz);
  const end = convertTimezoneToUTC(sun.year, sun.month, sun.day, 23, 59, 59, tz);
  return [start.getTime(), end.getTime()];
}

function getLastWeekRange(): [number, number] {
  const tz = COMMISSION_REPORT_TIMEZONE;
  const { year, month, day } = getNowInTimezone(tz);
  const mon = getMondayOfWeekContaining(year, month, day);
  const prevMon = addCalendarDaysInTz(mon.year, mon.month, mon.day, -7, tz);
  const prevSun = addCalendarDaysInTz(prevMon.year, prevMon.month, prevMon.day, 6, tz);
  const start = convertTimezoneToUTC(prevMon.year, prevMon.month, prevMon.day, 0, 0, 0, tz);
  const end = convertTimezoneToUTC(prevSun.year, prevSun.month, prevSun.day, 23, 59, 59, tz);
  return [start.getTime(), end.getTime()];
}

const commissionDateShortcuts: Record<string, () => [number, number]> = {
  今日: () => getTodayRange(),
  昨天: () => getYesterdayRange(),
  本周: () => getWeekRange(),
  上周: () => getLastWeekRange(),
};

type CommissionDatePreset = 'today' | 'yesterday' | 'thisWeek' | 'lastWeek';

function tsToYmdInCommissionTz(ts: number): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: COMMISSION_REPORT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

function bindCommissionTabDates(filters: {
  startDate: number | null;
  endDate: number | null;
}) {
  const t = getTodayRange();
  filters.startDate = t[0];
  filters.endDate = t[1];

  const state = reactive({
    dateRange: [t[0], t[1]] as [number, number] | null,
    preset: 'today' as CommissionDatePreset | null,
  });

  function syncPresetFromRange(range: [number, number] | null) {
    if (!range || range.length !== 2) {
      state.preset = null;
      return;
    }
    const startYmd = tsToYmdInCommissionTz(range[0]);
    const endYmd = tsToYmdInCommissionTz(range[1]);
    const candidates: Array<[CommissionDatePreset, () => [number, number]]> = [
      ['today', getTodayRange],
      ['yesterday', getYesterdayRange],
      ['thisWeek', getWeekRange],
      ['lastWeek', getLastWeekRange],
    ];
    for (const [key, fn] of candidates) {
      const [s, e] = fn();
      if (
        startYmd === tsToYmdInCommissionTz(s) &&
        endYmd === tsToYmdInCommissionTz(e)
      ) {
        state.preset = key;
        return;
      }
    }
    state.preset = null;
  }

  function onRangeUpdate(v: [number, number] | null) {
    state.dateRange = v;
    if (v) {
      filters.startDate = v[0];
      filters.endDate = v[1];
    } else {
      filters.startDate = null;
      filters.endDate = null;
    }
    syncPresetFromRange(v);
  }

  function onPresetChange(v: CommissionDatePreset | null) {
    if (v == null) return;
    let tuple: [number, number];
    if (v === 'today') tuple = getTodayRange();
    else if (v === 'yesterday') tuple = getYesterdayRange();
    else if (v === 'thisWeek') tuple = getWeekRange();
    else tuple = getLastWeekRange();
    state.dateRange = tuple;
    filters.startDate = tuple[0];
    filters.endDate = tuple[1];
  }

  function reset() {
    state.preset = 'today';
    const r = getTodayRange();
    state.dateRange = r;
    filters.startDate = r[0];
    filters.endDate = r[1];
  }

  return { state, onRangeUpdate, onPresetChange, reset };
}

const pendingFilters = reactive({
  startDate: null as number | null,
  endDate: null as number | null,
  agentAccount: '',
  agentId: '',
  currency: null as string | null,
});
const pendingTabDates = bindCommissionTabDates(pendingFilters);

const currentRecord = ref<any>(null);
const approveModalVisible = ref(false);
const rejectModalVisible = ref(false);
const remarkModalVisible = ref(false);
const approving = ref(false);
const rejecting = ref(false);
const remarkSaving = ref(false);

const approveForm = reactive({
  adjustedAmount: 0,
  remark: '',
});

const rejectForm = reactive({
  reason: '',
});

const remarkForm = reactive({
  remark: '',
});

const pendingColumns: DataTableColumns<any> = [
  {
    type: 'selection',
  },
  {
    title: '币种',
    key: 'currency',
    width: 80,
  },
  {
    title: '订单号',
    key: 'orderNo',
    width: 180,
  },
  {
    title: '结算日期',
    key: 'settlementDate',
    width: 160,
    render: (row) => formatDate(row.settlementDate),
  },
  {
    title: '代理ID',
    key: 'agentId',
    width: 100,
  },
  {
    title: '代理账号',
    key: 'agentAccount',
    width: 120,
    render: (row) => {
      return h(
        NButton,
        {
          text: true,
          type: 'primary',
          onClick: () => viewAgentDetail(row.agentId),
        },
        { default: () => row.agentAccount },
      );
    },
  },
  {
    title: '代理模式',
    key: 'agentMode',
    width: 100,
  },
  {
    title: '结算周期',
    key: 'settlementCycle',
    width: 100,
  },
  {
    title: '佣金',
    key: 'commissionAmount',
    width: 120,
    align: 'right',
    render: (row) => {
      return h(
        NButton,
        {
          text: true,
          type: 'primary',
          onClick: () => viewCommissionDetail(row.id),
        },
        { default: () => formatCurrency(row.commissionAmount, row.currency) },
      );
    },
  },
  {
    title: '后台备注',
    key: 'remark',
    width: 150,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '操作人',
    key: 'operator',
    width: 100,
  },
  {
    title: '操作时间',
    key: 'operatedAt',
    width: 160,
    render: (row) => formatDate(row.operatedAt),
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    fixed: 'right',
    render: (row) => {
      return h('div', { style: 'display: flex; gap: 8px;' }, [
        h(
          NButton,
          {
            size: 'small',
            type: 'success',
            onClick: () => handleApprove(row),
          },
          { default: () => '通过' },
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            onClick: () => handleReject(row),
          },
          { default: () => '拒绝' },
        ),
        h(
          NButton,
          {
            size: 'small',
            onClick: () => handleRemark(row),
          },
          { default: () => '备注' },
        ),
      ]);
    },
  },
];

/** 兼容 request 拦截器解包后的 { list, total } 与未解包的 { data: { list, total } } */
function normalizeCommissionRecordsResponse(response: unknown): {
  list: any[];
  total: number;
} {
  const r = response as Record<string, unknown>;
  const inner =
    r?.data && typeof r.data === 'object' && !Array.isArray(r.data)
      ? (r.data as Record<string, unknown>)
      : r;
  const list = inner?.list;
  const totalRaw = inner?.total;
  const n =
    typeof totalRaw === 'number'
      ? totalRaw
      : typeof totalRaw === 'string'
        ? Number(totalRaw)
        : NaN;
  return {
    list: Array.isArray(list) ? list : [],
    total: Number.isFinite(n) ? n : 0,
  };
}

const fetchPendingData = async () => {
  pendingLoading.value = true;
  try {
    const params = {
      page: pendingPagination.page,
      pageSize: pendingPagination.pageSize,
      status: 'PENDING',
      ...pendingFilters,
    };
    const response = await requestClient.get('/commission-management/records', {
      params,
    });
    const { list, total } = normalizeCommissionRecordsResponse(response);
    pendingData.value = list;
    pendingPagination.itemCount = total;
  } catch (error) {
    console.error('Failed to fetch pending data:', error);
    message.error('获取数据失败');
  } finally {
    pendingLoading.value = false;
  }
};

const searchPending = () => {
  pendingPagination.page = 1;
  fetchPendingData();
};

const resetPendingFilters = () => {
  pendingTabDates.reset();
  Object.assign(pendingFilters, {
    agentAccount: '',
    agentId: '',
    currency: null,
  });
  fetchPendingData();
};

const handleApprove = (record: any) => {
  currentRecord.value = record;
  approveForm.adjustedAmount = record.commissionAmount;
  approveForm.remark = '';
  approveModalVisible.value = true;
};

const confirmApprove = async () => {
  if (!currentRecord.value) return;
  approving.value = true;
  try {
    await requestClient.post(
      `/commission-management/records/${currentRecord.value.id}/approve`,
      approveForm,
    );
    message.success('审核通过');
    approveModalVisible.value = false;
    fetchPendingData();
  } catch (error) {
    console.error('Failed to approve:', error);
    message.error('操作失败');
  } finally {
    approving.value = false;
  }
};

const handleReject = (record: any) => {
  currentRecord.value = record;
  rejectForm.reason = '';
  rejectModalVisible.value = true;
};

const confirmReject = async () => {
  if (!currentRecord.value || !rejectForm.reason) {
    message.warning('请输入拒绝原因');
    return;
  }
  rejecting.value = true;
  try {
    await requestClient.post(
      `/commission-management/records/${currentRecord.value.id}/reject`,
      rejectForm,
    );
    message.success('已拒绝');
    rejectModalVisible.value = false;
    fetchPendingData();
  } catch (error) {
    console.error('Failed to reject:', error);
    message.error('操作失败');
  } finally {
    rejecting.value = false;
  }
};

const handleRemark = (record: any) => {
  currentRecord.value = record;
  remarkForm.remark = record.remark || '';
  remarkModalVisible.value = true;
};

const confirmRemark = async () => {
  if (!currentRecord.value) return;
  remarkSaving.value = true;
  try {
    await requestClient.post(
      `/commission-management/records/${currentRecord.value.id}/remark`,
      remarkForm,
    );
    message.success('备注已保存');
    remarkModalVisible.value = false;
    fetchPendingData();
  } catch (error) {
    console.error('Failed to save remark:', error);
    message.error('保存失败');
  } finally {
    remarkSaving.value = false;
  }
};

const batchApprove = () => {
  dialog.warning({
    title: '批量通过',
    content: `确定要通过选中的 ${selectedPendingKeys.value.length} 条记录吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await requestClient.post(
          '/commission-management/records/batch-approve',
          {
            ids: selectedPendingKeys.value,
          },
        );
        message.success('批量通过成功');
        selectedPendingKeys.value = [];
        fetchPendingData();
      } catch (error) {
        console.error('Failed to batch approve:', error);
        message.error('批量操作失败');
      }
    },
  });
};

const batchReject = () => {
  dialog.warning({
    title: '批量拒绝',
    content: `确定要拒绝选中的 ${selectedPendingKeys.value.length} 条记录吗？此操作不可撤销！`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await requestClient.post(
          '/commission-management/records/batch-reject',
          {
            ids: selectedPendingKeys.value,
          },
        );
        message.success('批量拒绝成功');
        selectedPendingKeys.value = [];
        fetchPendingData();
      } catch (error) {
        console.error('Failed to batch reject:', error);
        message.error('批量操作失败');
      }
    },
  });
};

const batchApproveAll = () => {
  dialog.warning({
    title: '全部通过',
    content: '确定要通过当前待审核的所有记录吗？请谨慎操作！',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await requestClient.post(
          '/commission-management/records/approve-all',
          pendingFilters,
        );
        message.success('全部通过成功');
        fetchPendingData();
      } catch (error) {
        console.error('Failed to approve all:', error);
        message.error('操作失败');
      }
    },
  });
};

const batchRejectAll = () => {
  dialog.error({
    title: '全部拒绝',
    content: '确定要拒绝当前待审核的所有记录吗？此操作不可撤销，请谨慎操作！',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await requestClient.post(
          '/commission-management/records/reject-all',
          pendingFilters,
        );
        message.success('全部拒绝成功');
        fetchPendingData();
      } catch (error) {
        console.error('Failed to reject all:', error);
        message.error('操作失败');
      }
    },
  });
};

// ==================== 3. Ready to Claim ====================
const readyLoading = ref(false);
const readyData = ref<any[]>([]);
const selectedReadyKeys = ref<number[]>([]);
const readyPagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  showQuickJumper: true,
  pageSizes: [10, 20, 50, 100],
});

const readyFilters = reactive({
  startDate: null as number | null,
  endDate: null as number | null,
  agentAccount: '',
});
const readyTabDates = bindCommissionTabDates(readyFilters);

const readyColumns: DataTableColumns<any> = [
  {
    type: 'selection',
  },
  {
    title: '币种',
    key: 'currency',
    width: 80,
  },
  {
    title: '订单号',
    key: 'orderNo',
    width: 180,
  },
  {
    title: '结算日期',
    key: 'settlementDate',
    width: 160,
    render: (row) => formatDate(row.settlementDate),
  },
  {
    title: '代理账号',
    key: 'agentAccount',
    width: 120,
  },
  {
    title: '佣金',
    key: 'commissionAmount',
    width: 120,
    align: 'right',
    render: (row) => formatCurrency(row.commissionAmount, row.currency),
  },
  {
    title: '操作时间',
    key: 'operatedAt',
    width: 160,
    render: (row) => formatDate(row.operatedAt),
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right',
    render: (row) => {
      return h(
        NPopconfirm,
        {
          onPositiveClick: () => handleWithdraw(row.id),
        },
        {
          default: () => '确定要撤回此佣金吗？',
          trigger: () =>
            h(
              NButton,
              {
                size: 'small',
                type: 'warning',
              },
              { default: () => '撤回' },
            ),
        },
      );
    },
  },
];

const fetchReadyData = async () => {
  readyLoading.value = true;
  try {
    const params = {
      page: readyPagination.page,
      pageSize: readyPagination.pageSize,
      status: 'READY',
      ...readyFilters,
    };
    const response = await requestClient.get('/commission-management/records', {
      params,
    });
    const { list, total } = normalizeCommissionRecordsResponse(response);
    readyData.value = list;
    readyPagination.itemCount = total;
  } catch (error) {
    console.error('Failed to fetch ready data:', error);
    message.error('获取数据失败');
  } finally {
    readyLoading.value = false;
  }
};

const searchReady = () => {
  readyPagination.page = 1;
  fetchReadyData();
};

const resetReadyFilters = () => {
  readyTabDates.reset();
  Object.assign(readyFilters, {
    agentAccount: '',
  });
  fetchReadyData();
};

const handleWithdraw = async (id: number) => {
  try {
    await requestClient.post(`/commission-management/records/${id}/withdraw`);
    message.success('撤回成功');
    fetchReadyData();
  } catch (error) {
    console.error('Failed to withdraw:', error);
    message.error('撤回失败');
  }
};

const batchWithdraw = () => {
  dialog.warning({
    title: '批量撤回',
    content: `确定要撤回选中的 ${selectedReadyKeys.value.length} 条记录吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await requestClient.post(
          '/commission-management/records/batch-withdraw',
          {
            ids: selectedReadyKeys.value,
          },
        );
        message.success('批量撤回成功');
        selectedReadyKeys.value = [];
        fetchReadyData();
      } catch (error) {
        console.error('Failed to batch withdraw:', error);
        message.error('批量操作失败');
      }
    },
  });
};

// ==================== 4. Withdrawn ====================
const withdrawnLoading = ref(false);
const withdrawnData = ref<any[]>([]);
const selectedWithdrawnKeys = ref<number[]>([]);
const withdrawnPagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  showQuickJumper: true,
  pageSizes: [10, 20, 50, 100],
});

const withdrawnFilters = reactive({
  startDate: null as number | null,
  endDate: null as number | null,
  agentAccount: '',
});
const withdrawnTabDates = bindCommissionTabDates(withdrawnFilters);

const withdrawnColumns: DataTableColumns<any> = [
  {
    type: 'selection',
  },
  {
    title: '币种',
    key: 'currency',
    width: 80,
  },
  {
    title: '订单号',
    key: 'orderNo',
    width: 180,
  },
  {
    title: '代理账号',
    key: 'agentAccount',
    width: 120,
  },
  {
    title: '佣金',
    key: 'commissionAmount',
    width: 120,
    align: 'right',
    render: (row) => formatCurrency(row.commissionAmount, row.currency),
  },
  {
    title: '撤回时间',
    key: 'withdrawnAt',
    width: 160,
    render: (row) => formatDate(row.withdrawnAt),
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right',
    render: (row) => {
      return h('div', { style: 'display: flex; gap: 8px;' }, [
        h(
          NButton,
          {
            size: 'small',
            type: 'success',
            onClick: () => handleApproveWithdrawn(row),
          },
          { default: () => '通过' },
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            onClick: () => handleRejectWithdrawn(row),
          },
          { default: () => '拒绝' },
        ),
      ]);
    },
  },
];

const fetchWithdrawnData = async () => {
  withdrawnLoading.value = true;
  try {
    const params = {
      page: withdrawnPagination.page,
      pageSize: withdrawnPagination.pageSize,
      status: 'WITHDRAWN',
      ...withdrawnFilters,
    };
    const response = await requestClient.get('/commission-management/records', {
      params,
    });
    const { list, total } = normalizeCommissionRecordsResponse(response);
    withdrawnData.value = list;
    withdrawnPagination.itemCount = total;
  } catch (error) {
    console.error('Failed to fetch withdrawn data:', error);
    message.error('获取数据失败');
  } finally {
    withdrawnLoading.value = false;
  }
};

const searchWithdrawn = () => {
  withdrawnPagination.page = 1;
  fetchWithdrawnData();
};

const resetWithdrawnFilters = () => {
  withdrawnTabDates.reset();
  Object.assign(withdrawnFilters, {
    agentAccount: '',
  });
  fetchWithdrawnData();
};

const handleApproveWithdrawn = (record: any) => {
  currentRecord.value = record;
  approveForm.adjustedAmount = record.commissionAmount;
  approveForm.remark = '';
  approveModalVisible.value = true;
};

const handleRejectWithdrawn = (record: any) => {
  currentRecord.value = record;
  rejectForm.reason = '';
  rejectModalVisible.value = true;
};

const batchApproveWithdrawn = () => {
  dialog.warning({
    title: '批量通过',
    content: `确定要通过选中的 ${selectedWithdrawnKeys.value.length} 条记录吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await requestClient.post(
          '/commission-management/records/batch-approve',
          {
            ids: selectedWithdrawnKeys.value,
          },
        );
        message.success('批量通过成功');
        selectedWithdrawnKeys.value = [];
        fetchWithdrawnData();
      } catch (error) {
        console.error('Failed to batch approve:', error);
        message.error('批量操作失败');
      }
    },
  });
};

const batchRejectWithdrawn = () => {
  dialog.warning({
    title: '批量拒绝',
    content: `确定要拒绝选中的 ${selectedWithdrawnKeys.value.length} 条记录吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await requestClient.post(
          '/commission-management/records/batch-reject',
          {
            ids: selectedWithdrawnKeys.value,
          },
        );
        message.success('批量拒绝成功');
        selectedWithdrawnKeys.value = [];
        fetchWithdrawnData();
      } catch (error) {
        console.error('Failed to batch reject:', error);
        message.error('批量操作失败');
      }
    },
  });
};

// ==================== 5. Rejected ====================
const rejectedLoading = ref(false);
const rejectedData = ref<any[]>([]);
const rejectedPagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  showQuickJumper: true,
  pageSizes: [10, 20, 50, 100],
});

const rejectedFilters = reactive({
  startDate: null as number | null,
  endDate: null as number | null,
  agentAccount: '',
});
const rejectedTabDates = bindCommissionTabDates(rejectedFilters);

const rejectedColumns: DataTableColumns<any> = [
  {
    title: '币种',
    key: 'currency',
    width: 80,
  },
  {
    title: '订单号',
    key: 'orderNo',
    width: 180,
  },
  {
    title: '代理账号',
    key: 'agentAccount',
    width: 120,
  },
  {
    title: '佣金',
    key: 'commissionAmount',
    width: 120,
    align: 'right',
    render: (row) => formatCurrency(row.commissionAmount, row.currency),
  },
  {
    title: '拒绝原因',
    key: 'rejectReason',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '拒绝时间',
    key: 'rejectedAt',
    width: 160,
    render: (row) => formatDate(row.rejectedAt),
  },
];

const fetchRejectedData = async () => {
  rejectedLoading.value = true;
  try {
    const params = {
      page: rejectedPagination.page,
      pageSize: rejectedPagination.pageSize,
      status: 'REJECTED',
      ...rejectedFilters,
    };
    const response = await requestClient.get('/commission-management/records', {
      params,
    });
    const { list, total } = normalizeCommissionRecordsResponse(response);
    rejectedData.value = list;
    rejectedPagination.itemCount = total;
  } catch (error) {
    console.error('Failed to fetch rejected data:', error);
    message.error('获取数据失败');
  } finally {
    rejectedLoading.value = false;
  }
};

const searchRejected = () => {
  rejectedPagination.page = 1;
  fetchRejectedData();
};

const resetRejectedFilters = () => {
  rejectedTabDates.reset();
  Object.assign(rejectedFilters, {
    agentAccount: '',
  });
  fetchRejectedData();
};

// ==================== 6. Claimed ====================
const claimedLoading = ref(false);
const claimedData = ref<any[]>([]);
const claimedPagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  showQuickJumper: true,
  pageSizes: [10, 20, 50, 100],
});

const claimedFilters = reactive({
  startDate: null as number | null,
  endDate: null as number | null,
  agentAccount: '',
});
const claimedTabDates = bindCommissionTabDates(claimedFilters);

const claimedColumns: DataTableColumns<any> = [
  {
    title: '币种',
    key: 'currency',
    width: 80,
  },
  {
    title: '订单号',
    key: 'orderNo',
    width: 180,
  },
  {
    title: '代理账号',
    key: 'agentAccount',
    width: 120,
  },
  {
    title: '佣金',
    key: 'commissionAmount',
    width: 120,
    align: 'right',
    render: (row) => formatCurrency(row.commissionAmount, row.currency),
  },
  {
    title: '领取时间',
    key: 'claimedAt',
    width: 160,
    render: (row) => formatDate(row.claimedAt),
  },
];

const fetchClaimedData = async () => {
  claimedLoading.value = true;
  try {
    const params = {
      page: claimedPagination.page,
      pageSize: claimedPagination.pageSize,
      status: 'CLAIMED',
      ...claimedFilters,
    };
    const response = await requestClient.get('/commission-management/records', {
      params,
    });
    const { list, total } = normalizeCommissionRecordsResponse(response);
    claimedData.value = list;
    claimedPagination.itemCount = total;
  } catch (error) {
    console.error('Failed to fetch claimed data:', error);
    message.error('获取数据失败');
  } finally {
    claimedLoading.value = false;
  }
};

const searchClaimed = () => {
  claimedPagination.page = 1;
  fetchClaimedData();
};

const resetClaimedFilters = () => {
  claimedTabDates.reset();
  Object.assign(claimedFilters, {
    agentAccount: '',
  });
  fetchClaimedData();
};

// ==================== 7. All Records ====================
const allLoading = ref(false);
const allData = ref<any[]>([]);
const allPagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  showQuickJumper: true,
  pageSizes: [10, 20, 50, 100],
});

const allFilters = reactive({
  startDate: null as number | null,
  endDate: null as number | null,
  agentAccount: '',
  status: null as string | null,
});
const allTabDates = bindCommissionTabDates(allFilters);

const allColumns: DataTableColumns<any> = [
  {
    title: '币种',
    key: 'currency',
    width: 80,
  },
  {
    title: '订单号',
    key: 'orderNo',
    width: 180,
  },
  {
    title: '代理账号',
    key: 'agentAccount',
    width: 120,
  },
  {
    title: '佣金',
    key: 'commissionAmount',
    width: 120,
    align: 'right',
    render: (row) => formatCurrency(row.commissionAmount, row.currency),
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => {
      const statusMap: Record<string, { type: any; text: string }> = {
        PENDING: { type: 'warning', text: '待审核' },
        PENDING_AUDIT: { type: 'warning', text: '待审核' },
        READY: { type: 'info', text: '待领取' },
        RELEASED: { type: 'info', text: '待领取' },
        WITHDRAWN: { type: 'default', text: '已撤回' },
        CANCELLED: { type: 'default', text: '已撤回' },
        REJECTED: { type: 'error', text: '已拒绝' },
        NOT_ELIGIBLE: { type: 'error', text: '已拒绝' },
        CLAIMED: { type: 'success', text: '已领取' },
        FAILED: { type: 'error', text: '失败' },
      };
      const status = statusMap[row.status] || {
        type: 'default',
        text: row.status,
      };
      return h(NTag, { type: status.type }, { default: () => status.text });
    },
  },
  {
    title: '操作时间',
    key: 'operatedAt',
    width: 160,
    render: (row) => formatDate(row.operatedAt),
  },
];

const fetchAllData = async () => {
  allLoading.value = true;
  try {
    const params = {
      page: allPagination.page,
      pageSize: allPagination.pageSize,
      ...allFilters,
    };
    const response = await requestClient.get('/commission-management/records', {
      params,
    });
    const { list, total } = normalizeCommissionRecordsResponse(response);
    allData.value = list;
    allPagination.itemCount = total;
  } catch (error) {
    console.error('Failed to fetch all data:', error);
    message.error('获取数据失败');
  } finally {
    allLoading.value = false;
  }
};

const searchAll = () => {
  allPagination.page = 1;
  fetchAllData();
};

const resetAllFilters = () => {
  allTabDates.reset();
  Object.assign(allFilters, {
    agentAccount: '',
    status: null,
  });
  fetchAllData();
};

// Helper functions
const viewAgentDetail = (agentId: number) => {
  // TODO: Implement agent detail view
  message.info('查看代理详情: ' + agentId);
};

const viewCommissionDetail = (recordId: number) => {
  // TODO: Implement commission detail view
  message.info('查看佣金详情: ' + recordId);
};

// Initialize
onMounted(() => {
  fetchSettings();
  fetchPendingData();
});

// Watch activeTab and auto-load data when switching tabs
watch(activeTab, (newTab) => {
  switch (newTab) {
    case 'pending':
      fetchPendingData();
      break;
    case 'ready':
      fetchReadyData();
      break;
    case 'withdrawn':
      fetchWithdrawnData();
      break;
    case 'rejected':
      fetchRejectedData();
      break;
    case 'claimed':
      fetchClaimedData();
      break;
    case 'all':
      fetchAllData();
      break;
  }
});
</script>

<style scoped>
.n-card {
  margin: 16px 0;
}

.commission-date-preset-group {
  display: inline-flex;
  flex-wrap: nowrap;
}
.commission-date-preset-group :deep(.n-radio-button) {
  flex: 1 1 0;
  min-width: 3.25rem;
  justify-content: center;
  padding-left: 12px;
  padding-right: 12px;
}
</style>
