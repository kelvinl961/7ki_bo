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
        <n-button type="primary" @click="openRulesModal"> {{ $t('agency.commission.settings') }} </n-button>
      </div>

      <n-tabs v-model:value="activeTab" type="line" animated>
        <!-- 1. 待审核 -->
        <n-tab-pane name="pending" :tab="$t('agency.commission.pending')">
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
              <n-radio-button value="today">{{ $t('common.today') }}</n-radio-button>
              <n-radio-button value="yesterday">{{ $t('agency.commission.yesterday') }}</n-radio-button>
              <n-radio-button value="thisWeek">{{ $t('common.thisWeek') }}</n-radio-button>
              <n-radio-button value="lastWeek">{{ $t('agency.commission.lastWeek') }}</n-radio-button>
            </n-radio-group>
            <n-date-picker
              v-model:value="pendingTabDates.state.dateRange"
              type="daterange"
              :time-zone="timezone"
              clearable
              :shortcuts="commissionDateShortcuts"
              :placeholder="$t('agency.commission.selectDateRange')"
              format="yyyy-MM-dd"
              style="width: 320px"
              @update:value="pendingTabDates.onRangeUpdate"
            />
            <n-input
              v-model:value="pendingFilters.agentAccount"
              :placeholder="$t('agency.commission.agentAccount')"
              style="width: 200px"
              clearable
            />
            <n-input
              v-model:value="pendingFilters.agentId"
              :placeholder="$t('agency.commission.agentId')"
              style="width: 200px"
              clearable
            />
            <n-select
              v-model:value="pendingFilters.currency"
              :placeholder="$t('common.currency')"
              style="width: 150px"
              :options="currencyOptions"
              clearable
            />
            <n-button type="primary" @click="searchPending">{{ $t('common.search') }}</n-button>
            <n-button @click="resetPendingFilters">{{ $t('common.reset') }}</n-button>
          </div>

          <div style="display: flex; gap: 8px; margin-bottom: 16px">
            <n-button type="success" @click="batchApproveAll"
              >{{ $t('agency.commission.approveAll') }}</n-button
            >
            <n-button type="error" @click="batchRejectAll">{{ $t('agency.commission.rejectAll') }}</n-button>
            <n-button
              type="warning"
              :disabled="selectedPendingKeys.length === 0"
              @click="batchApprove"
              >{{ $t('agency.commission.batchApprove') }} ({{ selectedPendingKeys.length }})</n-button
            >
            <n-button
              type="error"
              :disabled="selectedPendingKeys.length === 0"
              @click="batchReject"
              >{{ $t('agency.commission.batchReject') }} ({{ selectedPendingKeys.length }})</n-button
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
        <n-tab-pane name="ready" :tab="$t('agency.commission.ready')">
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
              <n-radio-button value="today">{{ $t('common.today') }}</n-radio-button>
              <n-radio-button value="yesterday">{{ $t('agency.commission.yesterday') }}</n-radio-button>
              <n-radio-button value="thisWeek">{{ $t('common.thisWeek') }}</n-radio-button>
              <n-radio-button value="lastWeek">{{ $t('agency.commission.lastWeek') }}</n-radio-button>
            </n-radio-group>
            <n-date-picker
              v-model:value="readyTabDates.state.dateRange"
              type="daterange"
              :time-zone="timezone"
              clearable
              :shortcuts="commissionDateShortcuts"
              :placeholder="$t('agency.commission.selectDateRange')"
              format="yyyy-MM-dd"
              style="width: 320px"
              @update:value="readyTabDates.onRangeUpdate"
            />
            <n-input
              v-model:value="readyFilters.agentAccount"
              :placeholder="$t('agency.commission.agentAccount')"
              style="width: 200px"
              clearable
            />
            <n-button type="primary" @click="searchReady">{{ $t('common.search') }}</n-button>
            <n-button @click="resetReadyFilters">{{ $t('common.reset') }}</n-button>
          </div>

          <div style="display: flex; gap: 8px; margin-bottom: 16px">
            <n-button
              type="warning"
              :disabled="selectedReadyKeys.length === 0"
              @click="batchWithdraw"
              >{{ $t('agency.commission.batchWithdraw') }} ({{ selectedReadyKeys.length }})</n-button
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
        <n-tab-pane name="withdrawn" :tab="$t('agency.commission.withdrawn')">
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
              <n-radio-button value="today">{{ $t('common.today') }}</n-radio-button>
              <n-radio-button value="yesterday">{{ $t('agency.commission.yesterday') }}</n-radio-button>
              <n-radio-button value="thisWeek">{{ $t('common.thisWeek') }}</n-radio-button>
              <n-radio-button value="lastWeek">{{ $t('agency.commission.lastWeek') }}</n-radio-button>
            </n-radio-group>
            <n-date-picker
              v-model:value="withdrawnTabDates.state.dateRange"
              type="daterange"
              :time-zone="timezone"
              clearable
              :shortcuts="commissionDateShortcuts"
              :placeholder="$t('agency.commission.selectDateRange')"
              format="yyyy-MM-dd"
              style="width: 320px"
              @update:value="withdrawnTabDates.onRangeUpdate"
            />
            <n-input
              v-model:value="withdrawnFilters.agentAccount"
              :placeholder="$t('agency.commission.agentAccount')"
              style="width: 200px"
              clearable
            />
            <n-button type="primary" @click="searchWithdrawn">{{ $t('common.search') }}</n-button>
            <n-button @click="resetWithdrawnFilters">{{ $t('common.reset') }}</n-button>
          </div>

          <div style="display: flex; gap: 8px; margin-bottom: 16px">
            <n-button
              type="success"
              :disabled="selectedWithdrawnKeys.length === 0"
              @click="batchApproveWithdrawn"
              >{{ $t('agency.commission.batchApprove') }} ({{ selectedWithdrawnKeys.length }})</n-button
            >
            <n-button
              type="error"
              :disabled="selectedWithdrawnKeys.length === 0"
              @click="batchRejectWithdrawn"
              >{{ $t('agency.commission.batchReject') }} ({{ selectedWithdrawnKeys.length }})</n-button
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
        <n-tab-pane name="rejected" :tab="$t('agency.commission.rejected')">
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
              <n-radio-button value="today">{{ $t('common.today') }}</n-radio-button>
              <n-radio-button value="yesterday">{{ $t('agency.commission.yesterday') }}</n-radio-button>
              <n-radio-button value="thisWeek">{{ $t('common.thisWeek') }}</n-radio-button>
              <n-radio-button value="lastWeek">{{ $t('agency.commission.lastWeek') }}</n-radio-button>
            </n-radio-group>
            <n-date-picker
              v-model:value="rejectedTabDates.state.dateRange"
              type="daterange"
              :time-zone="timezone"
              clearable
              :shortcuts="commissionDateShortcuts"
              :placeholder="$t('agency.commission.selectDateRange')"
              format="yyyy-MM-dd"
              style="width: 320px"
              @update:value="rejectedTabDates.onRangeUpdate"
            />
            <n-input
              v-model:value="rejectedFilters.agentAccount"
              :placeholder="$t('agency.commission.agentAccount')"
              style="width: 200px"
              clearable
            />
            <n-button type="primary" @click="searchRejected">{{ $t('common.search') }}</n-button>
            <n-button @click="resetRejectedFilters">{{ $t('common.reset') }}</n-button>
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
        <n-tab-pane name="claimed" :tab="$t('agency.commission.claimed')">
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
              <n-radio-button value="today">{{ $t('common.today') }}</n-radio-button>
              <n-radio-button value="yesterday">{{ $t('agency.commission.yesterday') }}</n-radio-button>
              <n-radio-button value="thisWeek">{{ $t('common.thisWeek') }}</n-radio-button>
              <n-radio-button value="lastWeek">{{ $t('agency.commission.lastWeek') }}</n-radio-button>
            </n-radio-group>
            <n-date-picker
              v-model:value="claimedTabDates.state.dateRange"
              type="daterange"
              :time-zone="timezone"
              clearable
              :shortcuts="commissionDateShortcuts"
              :placeholder="$t('agency.commission.selectDateRange')"
              format="yyyy-MM-dd"
              style="width: 320px"
              @update:value="claimedTabDates.onRangeUpdate"
            />
            <n-input
              v-model:value="claimedFilters.agentAccount"
              :placeholder="$t('agency.commission.agentAccount')"
              style="width: 200px"
              clearable
            />
            <n-button type="primary" @click="searchClaimed">{{ $t('common.search') }}</n-button>
            <n-button @click="resetClaimedFilters">{{ $t('common.reset') }}</n-button>
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
        <n-tab-pane name="all" :tab="$t('agency.commission.allRecords')">
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
              <n-radio-button value="today">{{ $t('common.today') }}</n-radio-button>
              <n-radio-button value="yesterday">{{ $t('agency.commission.yesterday') }}</n-radio-button>
              <n-radio-button value="thisWeek">{{ $t('common.thisWeek') }}</n-radio-button>
              <n-radio-button value="lastWeek">{{ $t('agency.commission.lastWeek') }}</n-radio-button>
            </n-radio-group>
            <n-date-picker
              v-model:value="allTabDates.state.dateRange"
              type="daterange"
              :time-zone="timezone"
              clearable
              :shortcuts="commissionDateShortcuts"
              :placeholder="$t('agency.commission.selectDateRange')"
              format="yyyy-MM-dd"
              style="width: 320px"
              @update:value="allTabDates.onRangeUpdate"
            />
            <n-input
              v-model:value="allFilters.agentAccount"
              :placeholder="$t('agency.commission.agentAccount')"
              style="width: 200px"
              clearable
            />
            <n-select
              v-model:value="allFilters.status"
              :placeholder="$t('common.status')"
              style="width: 150px"
              :options="statusOptions"
              clearable
            />
            <n-button type="primary" @click="searchAll">{{ $t('common.search') }}</n-button>
            <n-button @click="resetAllFilters">{{ $t('common.reset') }}</n-button>
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
      :title="$t('agency.commission.auditRules')"
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
          <span style="min-width: 80px">{{ $t('agency.commission.amountGte') }}</span>
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
          {{ $t('agency.commission.auditRuleDesc') }}
        </div>
        <div style="color: #666; line-height: 1.6">
          {{ $t('agency.commission.auditRule1') }}<br />
          {{ $t('agency.commission.auditRule2') }}
        </div>
      </div>

      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 12px">
          <n-button @click="rulesModalVisible = false">{{ $t('common.cancel') }}</n-button>
          <n-button
            type="primary"
            @click="saveSettings"
            :loading="settingsSaving"
            >{{ $t('common.confirm') }}</n-button
          >
        </div>
      </template>
    </n-modal>

    <!-- Approve Modal -->
    <n-modal
      v-model:show="approveModalVisible"
      preset="card"
      :title="$t('agency.commission.approveTitle')"
      style="width: 500px"
      :mask-closable="false"
    >
      <n-form
        ref="approveFormRef"
        :model="approveForm"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item :label="$t('agency.commission.agentAccount')">
          <n-input :value="currentRecord?.agentAccount" disabled />
        </n-form-item>
        <n-form-item :label="$t('agency.commission.originalCommission')">
          <n-input
            :value="formatCurrency(currentRecord?.commissionAmount)"
            disabled
          />
        </n-form-item>
        <n-form-item :label="$t('agency.commission.modifiedCommission')" required>
          <n-input-number
            v-model:value="approveForm.adjustedAmount"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item :label="$t('common.remark')">
          <n-input
            v-model:value="approveForm.remark"
            type="textarea"
            :rows="3"
            :placeholder="$t('agency.commission.enterRemark')"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 12px">
          <n-button @click="approveModalVisible = false">{{ $t('common.cancel') }}</n-button>
          <n-button type="primary" @click="confirmApprove" :loading="approving"
            >{{ $t('agency.commission.confirmApprove') }}</n-button
          >
        </div>
      </template>
    </n-modal>

    <!-- Reject Modal -->
    <n-modal
      v-model:show="rejectModalVisible"
      preset="card"
      :title="$t('agency.commission.rejectTitle')"
      style="width: 500px"
      :mask-closable="false"
    >
      <n-form
        ref="rejectFormRef"
        :model="rejectForm"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item :label="$t('agency.commission.agentAccount')">
          <n-input :value="currentRecord?.agentAccount" disabled />
        </n-form-item>
        <n-form-item :label="$t('agency.commission.commissionAmount')">
          <n-input
            :value="formatCurrency(currentRecord?.commissionAmount)"
            disabled
          />
        </n-form-item>
        <n-form-item :label="$t('agency.commission.rejectReason')" required>
          <n-input
            v-model:value="rejectForm.reason"
            type="textarea"
            :rows="3"
            :placeholder="$t('agency.commission.enterRejectReason')"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 12px">
          <n-button @click="rejectModalVisible = false">{{ $t('common.cancel') }}</n-button>
          <n-button type="error" @click="confirmReject" :loading="rejecting"
            >{{ $t('agency.commission.confirmReject') }}</n-button
          >
        </div>
      </template>
    </n-modal>

    <!-- Remark Modal -->
    <n-modal
      v-model:show="remarkModalVisible"
      preset="card"
      :title="$t('agency.commission.addRemark')"
      style="width: 500px"
      :mask-closable="false"
    >
      <n-form
        ref="remarkFormRef"
        :model="remarkForm"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item :label="$t('agency.commission.remarkContent')" required>
          <n-input
            v-model:value="remarkForm.remark"
            type="textarea"
            :rows="4"
            :placeholder="$t('agency.commission.enterRemark')"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 12px">
          <n-button @click="remarkModalVisible = false">{{ $t('common.cancel') }}</n-button>
          <n-button
            type="primary"
            @click="confirmRemark"
            :loading="remarkSaving"
            >{{ $t('common.save') }}</n-button
          >
        </div>
      </template>
    </n-modal>
  </Page>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, onMounted, watch, h, computed } from 'vue';
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
import {
  convertTimezoneToUTC,
  displayCalendarRangeToPicker,
  getDisplayTimezone,
  getNowInTimezone,
  pickerDateRangeToUtcTimestamps,
  pickerTimestampToYmd,
} from '#/utils/timezoneUtils';
import { renderTzDateTime } from '#/components/common/tzDateTimeRender';
import { useDisplayTimezone } from '#/composables/useDisplayTimezone';

const message = useMessage();
const dialog = useDialog();
const { timezone } = useDisplayTimezone();

// Active tab
const activeTab = ref('pending');

// Currency options
const currencyOptions = computed(() => [
  { label: 'BRL', value: 'BRL' },
  { label: 'ZMW', value: 'ZMW' },
  { label: 'USDT', value: 'USDT' },
]);

const statusOptions = computed(() => [
  { label: $t('agency.commission.pending'), value: 'PENDING' },
  { label: $t('agency.commission.ready'), value: 'READY' },
  { label: $t('agency.commission.withdrawn'), value: 'WITHDRAWN' },
  { label: $t('agency.commission.rejected'), value: 'REJECTED' },
  { label: $t('agency.commission.claimedStatus'), value: 'CLAIMED' },
]);

const currencyList = computed(() => [
  { code: 'BRL', name: $t('agency.commission.currencyBrl') },
]);

const commissionDateShortcuts = computed(() => ({
  [$t('common.today')]: () => getTodayRange(),
  [$t('agency.commission.yesterday')]: () => getYesterdayRange(),
  [$t('common.thisWeek')]: () => getWeekRange(),
  [$t('agency.commission.lastWeek')]: () => getLastWeekRange(),
}));

// Format currency
const formatCurrency = (amount: number, currency: string = 'BRL') => {
  if (amount === null || amount === undefined) return '0.00';
  return `${amount.toFixed(2)} ${currency}`;
};

// ==================== 1. Commission Settings ====================
const settingsLoading = ref(false);
const settingsData = ref<any[]>([]);
const rulesModalVisible = ref(false);
const settingsSaving = ref(false);
const settingsForm = reactive({
  BRL: 0,
});



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
    message.error($t('agency.commission.loadSettingsFailed'));
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
      message.success($t('common.saveSuccess'));
      rulesModalVisible.value = false;
      fetchSettings();
    } else {
      message.error(response.message || $t('agency.commission.saveFailed'));
    }
  } catch (error: any) {
    console.error('Failed to save settings:', error);
    message.error(error.message || $t('agency.commission.saveFailed'));
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
  const tzNow = getNowInTimezone();
  return displayCalendarRangeToPicker(
    tzNow.year,
    tzNow.month,
    tzNow.day,
    tzNow.year,
    tzNow.month,
    tzNow.day,
  );
}

function getMondayOfWeekContaining(
  year: number,
  month: number,
  day: number,
): { year: number; month: number; day: number } {
  const tz = getDisplayTimezone();
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
  const tz = getDisplayTimezone();
  const { year, month, day } = getNowInTimezone(tz);
  const y = addCalendarDaysInTz(year, month, day, -1, tz);
  return displayCalendarRangeToPicker(y.year, y.month, y.day, y.year, y.month, y.day);
}

function getWeekRange(): [number, number] {
  const tz = getDisplayTimezone();
  const { year, month, day } = getNowInTimezone(tz);
  const mon = getMondayOfWeekContaining(year, month, day);
  const sun = addCalendarDaysInTz(mon.year, mon.month, mon.day, 6, tz);
  return displayCalendarRangeToPicker(
    mon.year,
    mon.month,
    mon.day,
    sun.year,
    sun.month,
    sun.day,
  );
}

function getLastWeekRange(): [number, number] {
  const tz = getDisplayTimezone();
  const { year, month, day } = getNowInTimezone(tz);
  const mon = getMondayOfWeekContaining(year, month, day);
  const prevMon = addCalendarDaysInTz(mon.year, mon.month, mon.day, -7, tz);
  const prevSun = addCalendarDaysInTz(prevMon.year, prevMon.month, prevMon.day, 6, tz);
  return displayCalendarRangeToPicker(
    prevMon.year,
    prevMon.month,
    prevMon.day,
    prevSun.year,
    prevSun.month,
    prevSun.day,
  );
}



type CommissionDatePreset = 'today' | 'yesterday' | 'thisWeek' | 'lastWeek';

function tsToYmdInCommissionTz(ts: number): string {
  if (Number.isNaN(ts)) return '';
  return pickerTimestampToYmd(ts);
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

const pendingColumns = computed<DataTableColumns<any>>(() => [
  {
    type: 'selection',
  },
  {
    title: $t('common.currency'),
    key: 'currency',
    width: 80,
  },
  {
    title: $t('common.orderNo'),
    key: 'orderNo',
    width: 180,
  },
  {
    title: $t('agency.commission.settlementDate'),
    key: 'settlementDate',
    width: 160,
    render: (row) => renderTzDateTime(row.settlementDate),
  },
  {
    title: $t('agency.commission.agentId'),
    key: 'agentId',
    width: 100,
  },
  {
    title: $t('agency.commission.agentAccount'),
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
    title: $t('agency.commission.agentMode'),
    key: 'agentMode',
    width: 100,
  },
  {
    title: $t('agency.commission.settlementPeriod'),
    key: 'settlementCycle',
    width: 100,
  },
  {
    title: $t('agency.commission.commission'),
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
    title: $t('agency.commission.backendRemark'),
    key: 'remark',
    width: 150,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: $t('common.operator'),
    key: 'operator',
    width: 100,
  },
  {
    title: $t('common.operationTime'),
    key: 'operatedAt',
    width: 160,
    render: (row) => renderTzDateTime(row.operatedAt),
  },
  {
    title: $t('common.actions'),
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
          { default: () => $t('agency.commission.approve') },
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            onClick: () => handleReject(row),
          },
          { default: () => $t('agency.commission.reject') },
        ),
        h(
          NButton,
          {
            size: 'small',
            onClick: () => handleRemark(row),
          },
          { default: () => $t('agency.commission.remark') },
        ),
      ]);
    },
  },
]);

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

function withUtcCommissionDates<
  T extends { endDate: number | null; startDate: number | null },
>(filters: T) {
  const { startDate, endDate, ...rest } = filters;
  if (startDate == null || endDate == null) {
    return { ...rest };
  }
  const [s, e] = pickerDateRangeToUtcTimestamps([startDate, endDate]);
  return { ...rest, startDate: s, endDate: e };
}

const fetchPendingData = async () => {
  pendingLoading.value = true;
  try {
    const params = {
      page: pendingPagination.page,
      pageSize: pendingPagination.pageSize,
      status: 'PENDING',
      ...withUtcCommissionDates(pendingFilters),
    };
    const response = await requestClient.get('/commission-management/records', {
      params,
    });
    const { list, total } = normalizeCommissionRecordsResponse(response);
    pendingData.value = list;
    pendingPagination.itemCount = total;
  } catch (error) {
    console.error('Failed to fetch pending data:', error);
    message.error($t('agency.commission.loadDataFailed'));
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
    message.success($t('agency.commission.approved'));
    approveModalVisible.value = false;
    fetchPendingData();
  } catch (error) {
    console.error('Failed to approve:', error);
    message.error($t('common.operationFailed'));
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
    message.warning($t('agency.commission.enterRejectReasonWarning'));
    return;
  }
  rejecting.value = true;
  try {
    await requestClient.post(
      `/commission-management/records/${currentRecord.value.id}/reject`,
      rejectForm,
    );
    message.success($t('agency.commission.rejectedMsg'));
    rejectModalVisible.value = false;
    fetchPendingData();
  } catch (error) {
    console.error('Failed to reject:', error);
    message.error($t('common.operationFailed'));
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
    message.success($t('agency.commission.remarkSaved'));
    remarkModalVisible.value = false;
    fetchPendingData();
  } catch (error) {
    console.error('Failed to save remark:', error);
    message.error($t('agency.commission.saveFailed'));
  } finally {
    remarkSaving.value = false;
  }
};

const batchApprove = () => {
  dialog.warning({
    title: $t('agency.commission.batchApproveTitle'),
    content: $t('agency.commission.batchApproveContent', [String(selectedPendingKeys.value.length)]),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      try {
        await requestClient.post(
          '/commission-management/records/batch-approve',
          {
            ids: selectedPendingKeys.value,
          },
        );
        message.success($t('agency.commission.batchApproveSuccess'));
        selectedPendingKeys.value = [];
        fetchPendingData();
      } catch (error) {
        console.error('Failed to batch approve:', error);
        message.error($t('agency.commission.batchOpFailed'));
      }
    },
  });
};

const batchReject = () => {
  dialog.warning({
    title: $t('agency.commission.batchRejectTitle'),
    content: $t('agency.commission.batchRejectContent', [String(selectedPendingKeys.value.length)]),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      try {
        await requestClient.post(
          '/commission-management/records/batch-reject',
          {
            ids: selectedPendingKeys.value,
          },
        );
        message.success($t('agency.commission.batchRejectSuccess'));
        selectedPendingKeys.value = [];
        fetchPendingData();
      } catch (error) {
        console.error('Failed to batch reject:', error);
        message.error($t('agency.commission.batchOpFailed'));
      }
    },
  });
};

const batchApproveAll = () => {
  dialog.warning({
    title: $t('agency.commission.approveAllTitle'),
    content: $t('agency.commission.approveAllContent'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      try {
        await requestClient.post(
          '/commission-management/records/approve-all',
          pendingFilters,
        );
        message.success($t('agency.commission.approveAllSuccess'));
        fetchPendingData();
      } catch (error) {
        console.error('Failed to approve all:', error);
        message.error($t('common.operationFailed'));
      }
    },
  });
};

const batchRejectAll = () => {
  dialog.error({
    title: $t('agency.commission.rejectAllTitle'),
    content: $t('agency.commission.rejectAllContent'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      try {
        await requestClient.post(
          '/commission-management/records/reject-all',
          pendingFilters,
        );
        message.success($t('agency.commission.rejectAllSuccess'));
        fetchPendingData();
      } catch (error) {
        console.error('Failed to reject all:', error);
        message.error($t('common.operationFailed'));
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

const readyColumns = computed<DataTableColumns<any>>(() => [
  {
    type: 'selection',
  },
  {
    title: $t('common.currency'),
    key: 'currency',
    width: 80,
  },
  {
    title: $t('common.orderNo'),
    key: 'orderNo',
    width: 180,
  },
  {
    title: $t('agency.commission.settlementDate'),
    key: 'settlementDate',
    width: 160,
    render: (row) => renderTzDateTime(row.settlementDate),
  },
  {
    title: $t('agency.commission.agentAccount'),
    key: 'agentAccount',
    width: 120,
  },
  {
    title: $t('agency.commission.commission'),
    key: 'commissionAmount',
    width: 120,
    align: 'right',
    render: (row) => formatCurrency(row.commissionAmount, row.currency),
  },
  {
    title: $t('common.operationTime'),
    key: 'operatedAt',
    width: 160,
    render: (row) => renderTzDateTime(row.operatedAt),
  },
  {
    title: $t('common.actions'),
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
          default: () => $t('agency.commission.confirmWithdraw'),
          trigger: () =>
            h(
              NButton,
              {
                size: 'small',
                type: 'warning',
              },
              { default: () => $t('agency.commission.withdraw') },
            ),
        },
      );
    },
  },
]);

const fetchReadyData = async () => {
  readyLoading.value = true;
  try {
    const params = {
      page: readyPagination.page,
      pageSize: readyPagination.pageSize,
      status: 'READY',
      ...withUtcCommissionDates(readyFilters),
    };
    const response = await requestClient.get('/commission-management/records', {
      params,
    });
    const { list, total } = normalizeCommissionRecordsResponse(response);
    readyData.value = list;
    readyPagination.itemCount = total;
  } catch (error) {
    console.error('Failed to fetch ready data:', error);
    message.error($t('agency.commission.loadDataFailed'));
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
    message.success($t('agency.commission.withdrawSuccess'));
    fetchReadyData();
  } catch (error) {
    console.error('Failed to withdraw:', error);
    message.error($t('agency.commission.withdrawFailed'));
  }
};

const batchWithdraw = () => {
  dialog.warning({
    title: $t('agency.commission.batchWithdrawTitle'),
    content: $t('agency.commission.batchWithdrawContent', [String(selectedReadyKeys.value.length)]),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      try {
        await requestClient.post(
          '/commission-management/records/batch-withdraw',
          {
            ids: selectedReadyKeys.value,
          },
        );
        message.success($t('agency.commission.batchWithdrawSuccess'));
        selectedReadyKeys.value = [];
        fetchReadyData();
      } catch (error) {
        console.error('Failed to batch withdraw:', error);
        message.error($t('agency.commission.batchOpFailed'));
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

const withdrawnColumns = computed<DataTableColumns<any>>(() => [
  {
    type: 'selection',
  },
  {
    title: $t('common.currency'),
    key: 'currency',
    width: 80,
  },
  {
    title: $t('common.orderNo'),
    key: 'orderNo',
    width: 180,
  },
  {
    title: $t('agency.commission.agentAccount'),
    key: 'agentAccount',
    width: 120,
  },
  {
    title: $t('agency.commission.commission'),
    key: 'commissionAmount',
    width: 120,
    align: 'right',
    render: (row) => formatCurrency(row.commissionAmount, row.currency),
  },
  {
    title: $t('agency.commission.withdrawTime'),
    key: 'withdrawnAt',
    width: 160,
    render: (row) => renderTzDateTime(row.withdrawnAt),
  },
  {
    title: $t('common.actions'),
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
          { default: () => $t('agency.commission.approve') },
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            onClick: () => handleRejectWithdrawn(row),
          },
          { default: () => $t('agency.commission.reject') },
        ),
      ]);
    },
  },
]);

const fetchWithdrawnData = async () => {
  withdrawnLoading.value = true;
  try {
    const params = {
      page: withdrawnPagination.page,
      pageSize: withdrawnPagination.pageSize,
      status: 'WITHDRAWN',
      ...withUtcCommissionDates(withdrawnFilters),
    };
    const response = await requestClient.get('/commission-management/records', {
      params,
    });
    const { list, total } = normalizeCommissionRecordsResponse(response);
    withdrawnData.value = list;
    withdrawnPagination.itemCount = total;
  } catch (error) {
    console.error('Failed to fetch withdrawn data:', error);
    message.error($t('agency.commission.loadDataFailed'));
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
    title: $t('agency.commission.batchApproveTitle'),
    content: $t('agency.commission.batchApproveContent', [String(selectedWithdrawnKeys.value.length)]),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      try {
        await requestClient.post(
          '/commission-management/records/batch-approve',
          {
            ids: selectedWithdrawnKeys.value,
          },
        );
        message.success($t('agency.commission.batchApproveSuccess'));
        selectedWithdrawnKeys.value = [];
        fetchWithdrawnData();
      } catch (error) {
        console.error('Failed to batch approve:', error);
        message.error($t('agency.commission.batchOpFailed'));
      }
    },
  });
};

const batchRejectWithdrawn = () => {
  dialog.warning({
    title: $t('agency.commission.batchRejectTitle'),
    content: $t('agency.commission.batchRejectContent', [String(selectedWithdrawnKeys.value.length)]),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      try {
        await requestClient.post(
          '/commission-management/records/batch-reject',
          {
            ids: selectedWithdrawnKeys.value,
          },
        );
        message.success($t('agency.commission.batchRejectSuccess'));
        selectedWithdrawnKeys.value = [];
        fetchWithdrawnData();
      } catch (error) {
        console.error('Failed to batch reject:', error);
        message.error($t('agency.commission.batchOpFailed'));
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

const rejectedColumns = computed<DataTableColumns<any>>(() => [
  {
    title: $t('common.currency'),
    key: 'currency',
    width: 80,
  },
  {
    title: $t('common.orderNo'),
    key: 'orderNo',
    width: 180,
  },
  {
    title: $t('agency.commission.agentAccount'),
    key: 'agentAccount',
    width: 120,
  },
  {
    title: $t('agency.commission.commission'),
    key: 'commissionAmount',
    width: 120,
    align: 'right',
    render: (row) => formatCurrency(row.commissionAmount, row.currency),
  },
  {
    title: $t('agency.commission.rejectReasonCol'),
    key: 'rejectReason',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: $t('agency.commission.rejectTime'),
    key: 'rejectedAt',
    width: 160,
    render: (row) => renderTzDateTime(row.rejectedAt),
  },
]);

const fetchRejectedData = async () => {
  rejectedLoading.value = true;
  try {
    const params = {
      page: rejectedPagination.page,
      pageSize: rejectedPagination.pageSize,
      status: 'REJECTED',
      ...withUtcCommissionDates(rejectedFilters),
    };
    const response = await requestClient.get('/commission-management/records', {
      params,
    });
    const { list, total } = normalizeCommissionRecordsResponse(response);
    rejectedData.value = list;
    rejectedPagination.itemCount = total;
  } catch (error) {
    console.error('Failed to fetch rejected data:', error);
    message.error($t('agency.commission.loadDataFailed'));
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

const claimedColumns = computed<DataTableColumns<any>>(() => [
  {
    title: $t('common.currency'),
    key: 'currency',
    width: 80,
  },
  {
    title: $t('common.orderNo'),
    key: 'orderNo',
    width: 180,
  },
  {
    title: $t('agency.commission.agentAccount'),
    key: 'agentAccount',
    width: 120,
  },
  {
    title: $t('agency.commission.commission'),
    key: 'commissionAmount',
    width: 120,
    align: 'right',
    render: (row) => formatCurrency(row.commissionAmount, row.currency),
  },
  {
    title: $t('agency.commission.claimTime'),
    key: 'claimedAt',
    width: 160,
    render: (row) => renderTzDateTime(row.claimedAt),
  },
]);

const fetchClaimedData = async () => {
  claimedLoading.value = true;
  try {
    const params = {
      page: claimedPagination.page,
      pageSize: claimedPagination.pageSize,
      status: 'CLAIMED',
      ...withUtcCommissionDates(claimedFilters),
    };
    const response = await requestClient.get('/commission-management/records', {
      params,
    });
    const { list, total } = normalizeCommissionRecordsResponse(response);
    claimedData.value = list;
    claimedPagination.itemCount = total;
  } catch (error) {
    console.error('Failed to fetch claimed data:', error);
    message.error($t('agency.commission.loadDataFailed'));
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

watch(timezone, () => {
  for (const tab of [
    pendingTabDates,
    readyTabDates,
    withdrawnTabDates,
    rejectedTabDates,
    claimedTabDates,
    allTabDates,
  ]) {
    if (tab.state.preset) {
      tab.onPresetChange(tab.state.preset);
    }
  }
});

const allColumns = computed<DataTableColumns<any>>(() => [
  {
    title: $t('common.currency'),
    key: 'currency',
    width: 80,
  },
  {
    title: $t('common.orderNo'),
    key: 'orderNo',
    width: 180,
  },
  {
    title: $t('agency.commission.agentAccount'),
    key: 'agentAccount',
    width: 120,
  },
  {
    title: $t('agency.commission.commission'),
    key: 'commissionAmount',
    width: 120,
    align: 'right',
    render: (row) => formatCurrency(row.commissionAmount, row.currency),
  },
  {
    title: $t('common.status'),
    key: 'status',
    width: 100,
    render: (row) => {
      const statusMap: Record<string, { type: any; text: string }> = {
        PENDING: { type: 'warning', text: $t('agency.commission.pending') },
        PENDING_AUDIT: { type: 'warning', text: $t('agency.commission.pending') },
        READY: { type: 'info', text: $t('agency.commission.ready') },
        RELEASED: { type: 'info', text: $t('agency.commission.ready') },
        WITHDRAWN: { type: 'default', text: $t('agency.commission.withdrawn') },
        CANCELLED: { type: 'default', text: $t('agency.commission.withdrawn') },
        REJECTED: { type: 'error', text: $t('agency.commission.rejected') },
        NOT_ELIGIBLE: { type: 'error', text: $t('agency.commission.rejected') },
        CLAIMED: { type: 'success', text: $t('agency.commission.claimedStatus') },
        FAILED: { type: 'error', text: $t('common.failed') },
      };
      const status = statusMap[row.status] || {
        type: 'default',
        text: row.status,
      };
      return h(NTag, { type: status.type }, { default: () => status.text });
    },
  },
  {
    title: $t('common.operationTime'),
    key: 'operatedAt',
    width: 160,
    render: (row) => renderTzDateTime(row.operatedAt),
  },
]);

const fetchAllData = async () => {
  allLoading.value = true;
  try {
    const params = {
      page: allPagination.page,
      pageSize: allPagination.pageSize,
      ...withUtcCommissionDates(allFilters),
    };
    const response = await requestClient.get('/commission-management/records', {
      params,
    });
    const { list, total } = normalizeCommissionRecordsResponse(response);
    allData.value = list;
    allPagination.itemCount = total;
  } catch (error) {
    console.error('Failed to fetch all data:', error);
    message.error($t('agency.commission.loadDataFailed'));
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
  message.info($t('agency.commission.viewAgentDetail') + agentId);
};

const viewCommissionDetail = (recordId: number) => {
  // TODO: Implement commission detail view
  message.info($t('agency.commission.viewCommissionDetail') + recordId);
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
