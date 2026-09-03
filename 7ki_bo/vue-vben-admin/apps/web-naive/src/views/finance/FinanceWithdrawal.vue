<template>
  <div class="finance-withdrawal">
    <!-- Header and Filters -->
    <div class="header-section">
      <n-card :bordered="false" class="rounded-16px shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-gray-800">
              {{ props.isMyWithdrawal ? '由我出款' : '财务出款' }}
            </h2>
            <p class="mt-1 text-sm text-gray-600">
              {{
                props.isMyWithdrawal
                  ? '我负责处理的提现出款'
                  : '待财务处理的提现出款'
              }}
            </p>
          </div>
          <div class="flex gap-3">
            <!-- 🚀 SmartAutoRefresh Component -->
            <SmartAutoRefresh
              v-model="autoRefreshEnabled"
              :intervals="[15, 30, 60, 120]"
              :default-interval="30"
              :on-refresh="fetchData"
              @interval-change="handleRefreshIntervalChange"
            />
          </div>
        </div>

        <!-- Filter Section -->
        <div class="filter-section">
          <!-- Time Filter -->
          <div class="mb-4 flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-600">{{ $t('finance.applicationTime') }}</span>
              <n-radio-group v-model:value="filters.timeRange" size="small">
                <n-radio value="today">{{ $t('common.today') }}</n-radio>
                <n-radio value="month">{{ $t('common.thisMonth') }}</n-radio>
              </n-radio-group>
              <n-date-picker
                v-model:value="filters.dateRange"
                type="datetimerange"
                :time-zone="timezone"
                format="yyyy-MM-dd HH:mm:ss"
                :placeholder="$t('finance.selectTimeRange')"
                clearable
                size="small"
                class="w-80"
              />
            </div>
          </div>

          <!-- Search Filters -->
          <div
            class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8"
          >
            <!-- Member account / ID / order -->
            <div class="filter-item">
              <n-form-item :label="$t('finance.memberAccount2')">
                <n-input
                  v-model:value="filters.memberAccount"
                  :placeholder="$t('finance.searchMemberAccountOrRemarkUpTo200')"
                  clearable
                  size="small"
                />
              </n-form-item>
            </div>

            <div class="filter-item">
              <n-form-item :label="$t('finance.memberId')">
                <n-input
                  v-model:value="filters.userId"
                  :placeholder="$t('finance.pleaseEnterMemberId')"
                  clearable
                  size="small"
                />
              </n-form-item>
            </div>

            <div class="filter-item">
              <n-form-item :label="$t('finance.orderNo')">
                <n-input
                  v-model:value="filters.orderId"
                  :placeholder="$t('finance.pleaseEnterOrder')"
                  clearable
                  size="small"
                />
              </n-form-item>
            </div>

            <!-- Currency -->
            <div class="filter-item">
              <n-form-item :label="$t('finance.thirdPartyPayout')">
                <n-select
                  v-model:value="filters.thirdPartyPayment"
                  :placeholder="$t('finance.thirdPartyPayout')"
                  clearable
                  size="small"
                  :options="thirdPartyOptions"
                />
              </n-form-item>
            </div>

            <!-- Amount -->
            <div class="filter-item">
              <n-form-item :label="$t('finance.amountRange')">
                <n-input
                  v-model:value="filters.amount"
                  :placeholder="$t('common.amount')"
                  clearable
                  size="small"
                />
              </n-form-item>
            </div>

            <!-- Withdrawal Method -->
            <div class="filter-item">
              <n-form-item :label="$t('finance.withdrawalMethod')">
                <n-select
                  v-model:value="filters.withdrawalMethod"
                  :placeholder="$t('finance.withdrawalMethod')"
                  clearable
                  size="small"
                  :options="withdrawalMethodOptions"
                />
              </n-form-item>
            </div>

            <!-- Approval Status -->
            <div class="filter-item">
              <n-form-item :label="$t('finance.reviewStatus')">
                <n-select
                  v-model:value="filters.approvalStatus"
                  :placeholder="$t('finance.reviewStatus')"
                  clearable
                  size="small"
                  :options="approvalStatusOptions"
                />
              </n-form-item>
            </div>

            <!-- Operator -->
            <div class="filter-item">
              <n-form-item :label="$t('finance.operator')">
                <n-input
                  v-model:value="filters.operator"
                  :placeholder="$t('finance.operator')"
                  clearable
                  size="small"
                />
              </n-form-item>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-between">
            <div class="flex gap-2">
              <n-button type="primary" @click="applyFilters" :loading="loading">
                <template #icon>
                  <n-icon><SearchOutline /></n-icon>
                </template>{{ $t('common.search') }}</n-button>
              <n-button @click="resetFilters">
                <template #icon>
                  <n-icon><ReloadOutline /></n-icon>
                </template>{{ $t('common.advancedSearch') }}</n-button>
              <n-button @click="clearFilters">{{ $t('common.reset') }}</n-button>
              <n-button
                type="primary"
                :disabled="selectedIds.length === 0"
                @click="openFilterBatchModal"
              >
                批量操作 ({{ selectedIds.length }})
              </n-button>
              <n-button>{{ $t('finance.kzy265') }}</n-button>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              已选择 {{ selectedIds.length }} 条数据
              <n-tag v-if="props.isMyWithdrawal" type="info" size="small">{{ $t('finance.ksns8b') }}</n-tag>
              <n-tag v-else type="success" size="small">{{ $t('finance.financePayout') }}</n-tag>
              <!-- 🚀 NEW: SmartAutoRefresh Component -->
              <SmartAutoRefresh
                v-model="autoRefreshEnabled"
                :intervals="[15, 30, 60, 120]"
                :default-interval="30"
                :on-refresh="fetchData"
                @interval-change="handleRefreshIntervalChange"
              />
              <span class="cursor-pointer text-blue-600">{{ $t('finance.kbsp6s') }}</span>
            </div>
          </div>
        </div>
      </n-card>
    </div>

    <!-- SmartDataGrid -->
    <SmartDataGrid
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :pagination="paginationReactive"
      selectable
      :selected-keys="selectedIds"
      row-key="id"
      :scroll-x="2200"
      size="small"
      class="single-line-table"
      @update:selected-keys="
        (keys: (string | number)[]) =>
          (selectedIds = keys.map((k) => String(k)))
      "
      @update:page="handlePageChange"
      @update:page-size="handlePageSizeChange"
      @refresh="fetchData"
      @row-click="handleRowClick"
    >
      <template #actionBar="{ selectedCount, selectedRows }">
        <n-card :bordered="false" class="rounded-16px shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <!-- 主要操作按钮 -->
              <div class="flex gap-2">
                <n-button type="primary" @click="fetchData" :loading="loading">
                  <template #icon>
                    <n-icon><ReloadOutline /></n-icon>
                  </template>{{ $t('common.refresh') }}</n-button>
                <n-button
                  v-if="!props.isMyWithdrawal"
                  type="info"
                  @click="showBulkAssignModal"
                  :disabled="selectedCount === 0"
                >
                  <template #icon>
                    <n-icon><PersonOutline /></n-icon>
                  </template>{{ $t('finance.assignToMe') }}</n-button>
              </div>

              <!-- 全选当前页 + 批量操作 dropdown -->
              <n-checkbox
                :checked="isAllCurrentPageSelected"
                :indeterminate="isCurrentPageIndeterminate"
                @update:checked="toggleSelectAllCurrentPage"
              >{{ $t('finance.kq5y7t') }}</n-checkbox>
              <n-dropdown
                :options="batchOperationDropdownOptions"
                :disabled="selectedCount === 0"
                trigger="click"
                @select="
                  (key: string) => onBatchOperationSelect(key, selectedRows)
                "
              >
                <n-button
                  type="primary"
                  size="small"
                  :disabled="selectedCount === 0"
                >
                  {{
                    selectedCount > 0
                      ? `批量操作 (${selectedCount})`
                      : '批量操作'
                  }}
                  <template #icon>
                    <n-icon class="ml-1"><ChevronUpOutline /></n-icon>
                  </template>
                </n-button>
              </n-dropdown>
              <span class="text-sm text-gray-600"
                >{{ $t('finance.selectedRecords', { count: selectedCount }) }}</span
              >
              <span class="text-sm text-gray-600"
                >{{ $t('finance.totalRecordsCompact', { count: paginationReactive.total }) }}</span
              >
              <n-tag v-if="props.isMyWithdrawal" type="info" size="small"
                >{{ $t('finance.ksns8b') }}</n-tag
              >
              <n-tag v-else type="warning" size="small">{{ $t('finance.financePayout') }}</n-tag>
              <div class="summary-info">
                <span class="font-medium"
                  >{{ $t('finance.totalAmountLabel') }}: {{ totalAmount.toFixed(2) }}</span
                >
              </div>
            </div>

            <div class="flex items-center gap-4">
              <div class="flex gap-2">
                <n-button size="small" @click="clearSelection"
                  >{{ $t('finance.kxqos8') }}</n-button
                >
                <n-button size="small" @click="selectAll">{{ $t('common.selectAll') }}</n-button>
              </div>
            </div>
          </div>
        </n-card>
      </template>
    </SmartDataGrid>

    <!-- 批量强制取消 / 批量备注 - 表格弹窗（与照片一致） -->
    <n-modal
      v-model:show="batchReasonModal.show"
      preset="card"
      class="batch-reason-modal-card"
      :title="
        batchReasonModal.actionKey === 'batch-force-cancel'
          ? '批量强制取消'
          : batchReasonModal.actionKey === 'batch-manual-withdrawal'
            ? '批量已人工出款'
            : '批量备注'
      "
      :style="{ width: 'min(95vw, 1200px)' }"
      :closable="true"
      :mask-closable="false"
    >
      <div class="batch-reason-modal">
        <!-- 批量强制取消：提示与警告 -->
        <template v-if="batchReasonModal.actionKey === 'batch-force-cancel'">
          <div
            class="mb-4 flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 p-4"
          >
            <n-icon size="20" class="text-orange-500 shrink-0 mt-0.5">
              <WarningOutline />
            </n-icon>
            <div>
              <p class="font-medium text-orange-800">
                确认批量强制取消，选中的{{ batchReasonModal.rows?.length ?? 0 }}个订单？
              </p>
              <p class="mt-1 text-sm text-red-600">{{ $t('finance.k17824452473981') }}</p>
            </div>
          </div>
        </template>
        <!-- 批量已人工出款：确认提示 -->
        <template v-else-if="batchReasonModal.actionKey === 'batch-manual-withdrawal'">
          <div
            class="mb-4 flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 p-4"
          >
            <n-icon size="20" class="mt-0.5 shrink-0 text-orange-500">
              <WarningOutline />
            </n-icon>
            <p class="font-medium text-orange-800">
              已选中{{ batchReasonModal.rows?.length ?? 0 }}条数据，确认批量已人工出款吗？
            </p>
          </div>
        </template>
        <!-- 批量备注：已选条数 -->
        <template v-else>
          <p class="mb-4 text-gray-600">
            已选择{{ batchReasonModal.rows?.length ?? 0 }}条数据
          </p>
        </template>

        <!-- 表格区域 -->
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead>
              <tr class="border-b bg-gray-50">
                <th class="whitespace-nowrap px-3 py-2 text-left font-medium">{{ $t('finance.orderNo') }}</th>
                <th class="whitespace-nowrap px-3 py-2 text-left font-medium">
                  品牌名称(ID)
                </th>
                <th class="whitespace-nowrap px-3 py-2 text-left font-medium">
                  会员ID
                </th>
                <th class="whitespace-nowrap px-3 py-2 text-left font-medium">{{ $t('finance.memberAccount2') }}</th>
                <th class="whitespace-nowrap px-3 py-2 text-left font-medium">{{ $t('finance.memberCurrency') }}</th>
                <th class="whitespace-nowrap px-3 py-2 text-left font-medium">{{ $t('finance.withdrawalAmount') }}</th>
                <th class="min-w-[180px] px-3 py-2 text-left font-medium">
                  <div
                    v-if="batchReasonModal.actionKey === 'batch-force-cancel'"
                    class="flex flex-wrap items-center justify-between gap-2"
                  >
                    <span>{{ $t('finance.cancelReasonFrontend') }}</span>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-gray-500">{{ $t('finance.max1000Chars') }}</span>
                      <span class="text-xs text-gray-500">{{ $t('finance.text120') }}</span>
                      <n-input
                        v-model:value="batchBulkFrontend"
                        :placeholder="$t('finance.enter')"
                        size="small"
                        class="w-24"
                        :maxlength="1000"
                      />
                      <n-button type="primary" size="tiny" @click="applyBulkBatch('frontend')">{{ $t('finance.k1782445248056') }}</n-button>
                    </div>
                  </div>
                  <div v-else class="flex flex-wrap items-center justify-between gap-2">
                    <span>{{ $t('finance.frontendRemark') }}</span>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-gray-500">{{ $t('finance.max1000Chars') }}</span>
                      <span class="text-xs text-gray-500">{{ $t('finance.text120') }}</span>
                      <n-input
                        v-model:value="batchBulkFrontend"
                        :placeholder="$t('finance.enter')"
                        size="small"
                        class="w-24"
                        :maxlength="1000"
                      />
                      <n-button type="primary" size="tiny" @click="applyBulkBatch('frontend')">{{ $t('finance.k1782445248056') }}</n-button>
                    </div>
                  </div>
                </th>
                <th class="min-w-[180px] px-3 py-2 text-left font-medium">
                  <div
                    v-if="batchReasonModal.actionKey === 'batch-force-cancel'"
                    class="flex flex-wrap items-center justify-between gap-2"
                  >
                    <span>{{ $t('finance.cancelReasonBackend') }}</span>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-gray-500">{{ $t('finance.max1000Chars') }}</span>
                      <span class="text-xs text-gray-500">{{ $t('finance.text120') }}</span>
                      <n-input
                        v-model:value="batchBulkBackend"
                        :placeholder="$t('finance.enter')"
                        size="small"
                        class="w-24"
                        :maxlength="1000"
                      />
                      <n-button type="primary" size="tiny" @click="applyBulkBatch('backend')">{{ $t('finance.k1782445248056') }}</n-button>
                    </div>
                  </div>
                  <div v-else class="flex flex-wrap items-center justify-between gap-2">
                    <span>{{ $t('finance.backendRemark') }}</span>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-gray-500">{{ $t('finance.max1000Chars') }}</span>
                      <span class="text-xs text-gray-500">{{ $t('finance.text120') }}</span>
                      <n-input
                        v-model:value="batchBulkBackend"
                        :placeholder="$t('finance.enter')"
                        size="small"
                        class="w-24"
                        :maxlength="1000"
                      />
                      <n-button type="primary" size="tiny" @click="applyBulkBatch('backend')">{{ $t('finance.k1782445248056') }}</n-button>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in batchReasonModal.rows"
                :key="row.id"
                class="border-b hover:bg-gray-50/50"
              >
                <td class="whitespace-nowrap px-3 py-2 font-mono">
                  {{ row.orderId }}
                </td>
                <td class="whitespace-nowrap px-3 py-2">
                  {{ (row as any).brandName || '-' }} ({{ (row as any).brandId || '-' }})
                </td>
                <td class="whitespace-nowrap px-3 py-2">
                  <span>{{ row.displayMemberId || row.userID || row.memberId }}</span>
                  <n-tag v-if="row.vipLevel" size="small" type="success" class="ml-1">
                    {{ row.vipLevel }}
                  </n-tag>
                </td>
                <td class="whitespace-nowrap px-3 py-2">
                  {{ row.accountName || row.memberAccount }}
                </td>
                <td class="whitespace-nowrap px-3 py-2">
                  {{ row.currency || 'BRL' }}
                </td>
                <td class="whitespace-nowrap px-3 py-2 font-medium">
                  {{ formatCurrency(row.rewardAmount ?? row.withdrawAmount ?? row.withdrawalAmount ?? row.amount ?? 0) }}
                </td>
                <td class="px-3 py-2 align-top">
                  <n-input
                    v-if="batchReasonModal.actionKey === 'batch-force-cancel' && batchModalRowData[row.id]"
                    :value="batchModalRowData[row.id]?.frontendReason"
                    type="textarea"
                    :placeholder="$t('finance.enterFrontendCancel')"
                    :autosize="{ minRows: 2 }"
                    :maxlength="1000"
                    class="resize-y"
                    @update:value="(v: string) => setBatchRowField(row.id, 'frontendReason', v)"
                  />
                  <n-input
                    v-else-if="batchModalRowData[row.id]"
                    :value="batchModalRowData[row.id]?.frontendNotes"
                    type="textarea"
                    :placeholder="$t('finance.pleaseEnterFrontendRemark')"
                    :autosize="{ minRows: 2 }"
                    :maxlength="1000"
                    class="resize-y"
                    @update:value="(v: string) => setBatchRowField(row.id, 'frontendNotes', v)"
                  />
                </td>
                <td class="px-3 py-2 align-top">
                  <n-input
                    v-if="batchReasonModal.actionKey === 'batch-force-cancel' && batchModalRowData[row.id]"
                    :value="batchModalRowData[row.id]?.backendReason"
                    type="textarea"
                    :placeholder="$t('finance.enterBackendCancel')"
                    :autosize="{ minRows: 2 }"
                    :maxlength="1000"
                    class="resize-y"
                    @update:value="(v: string) => setBatchRowField(row.id, 'backendReason', v)"
                  />
                  <n-input
                    v-else-if="batchModalRowData[row.id]"
                    :value="batchModalRowData[row.id]?.backendNotes"
                    type="textarea"
                    :placeholder="$t('finance.pleaseEnterBackendRemark')"
                    :autosize="{ minRows: 2 }"
                    :maxlength="1000"
                    class="resize-y"
                    @update:value="(v: string) => setBatchRowField(row.id, 'backendNotes', v)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 底部按钮 -->
        <div class="mt-6 flex justify-end gap-3">
          <n-button @click="batchReasonModal.show = false">{{ $t('common.cancel') }}</n-button>
          <n-button
            type="primary"
            :loading="batchReasonModal.loading"
            @click="submitBatchReasonModal"
          >{{ $t('common.confirm') }}</n-button>
        </div>
      </div>
    </n-modal>

    <!-- 批量锁定 / 批量解锁 - 确认弹窗 -->
    <n-modal
      v-model:show="batchLockConfirmModal.show"
      preset="card"
      class="batch-reason-modal-card"
      :title="batchLockConfirmModal.actionKey === 'batch-unlock' ? '批量解锁' : '批量锁定'"
      :style="{ width: 'min(95vw, 1200px)' }"
      :closable="true"
      :mask-closable="false"
    >
      <div class="batch-lock-confirm-modal">
        <div
          class="mb-4 flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 p-4"
        >
          <n-icon size="20" class="shrink-0 mt-0.5 text-orange-500">
            <WarningOutline />
          </n-icon>
          <p class="font-medium text-orange-800">
            {{ batchLockConfirmModal.actionKey === 'batch-unlock' ? '确认批量解锁' : '确认批量锁定' }}，选择的{{ batchLockConfirmModal.rows?.length ?? 0 }}个订单？
          </p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead>
              <tr class="border-b bg-gray-50">
                <th class="whitespace-nowrap px-3 py-2 text-left font-medium">{{ $t('finance.orderNo') }}</th>
                <th class="whitespace-nowrap px-3 py-2 text-left font-medium">{{ $t('finance.brandNameId') }}</th>
                <th class="whitespace-nowrap px-3 py-2 text-left font-medium">{{ $t('finance.memberId') }}</th>
                <th class="whitespace-nowrap px-3 py-2 text-left font-medium">{{ $t('finance.memberAccount2') }}</th>
                <th class="whitespace-nowrap px-3 py-2 text-left font-medium">{{ $t('finance.memberCurrency') }}</th>
                <th class="whitespace-nowrap px-3 py-2 text-left font-medium">{{ $t('finance.withdrawalAmount') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in batchLockConfirmModal.rows"
                :key="row.id"
                class="border-b hover:bg-gray-50/50"
              >
                <td class="whitespace-nowrap px-3 py-2 font-mono">{{ row.orderId }}</td>
                <td class="whitespace-nowrap px-3 py-2">
                  {{ (row as any).brandName || '-' }} ({{ (row as any).brandId || '-' }})
                </td>
                <td class="whitespace-nowrap px-3 py-2">
                  <span>{{ row.displayMemberId || row.userID || row.memberId }}</span>
                  <n-tag v-if="row.vipLevel" size="small" type="success" class="ml-1">
                    {{ row.vipLevel }}
                  </n-tag>
                </td>
                <td class="whitespace-nowrap px-3 py-2">
                  {{ row.accountName || row.memberAccount }}
                </td>
                <td class="whitespace-nowrap px-3 py-2">{{ row.currency || 'BRL' }}</td>
                <td class="whitespace-nowrap px-3 py-2 font-medium">
                  {{ formatCurrency(row.rewardAmount ?? row.withdrawAmount ?? row.withdrawalAmount ?? row.amount ?? 0) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <n-button @click="batchLockConfirmModal.show = false">{{ $t('common.cancel') }}</n-button>
          <n-button
            type="primary"
            :loading="batchLockConfirmModal.loading"
            @click="submitBatchLockConfirm"
          >{{ $t('common.confirm') }}</n-button>
        </div>
      </div>
    </n-modal>

    <!-- 筛选区批量操作弹窗（与全部提现一致） -->
    <n-modal
      v-model:show="showFilterBatchModal"
      preset="dialog"
      :title="$t('finance.bulkActions')"
      :positive-text="$t('common.confirm')"
      :negative-text="$t('common.cancel')"
      @positive-click="submitFilterBatchModal"
    >
      <div class="space-y-4">
        <n-form-item :label="$t('finance.actions')">
          <n-select
            v-model:value="filterBatchActionKey"
            :options="batchOperationDropdownOptionsSelect"
            :placeholder="$t('finance.pleaseSelectActions')"
          />
        </n-form-item>
        <n-form-item :label="$t('finance.operationNote1')">
          <n-input
            v-model:value="filterBatchReason"
            type="textarea"
            :placeholder="$t('finance.pleaseEnterOperationNote')"
            :autosize="{ minRows: 2 }"
          />
        </n-form-item>
      </div>
    </n-modal>

    <!-- 批量重新代付：选择代付通道后调用 /wallet/re-payment/withdrawals/bulk-repayment -->
    <n-modal
      v-model:show="batchRePayModal.show"
      preset="dialog"
      :title="$t('finance.rePayoutConfirm1')"
      :positive-text="$t('finance.confirmPayout')"
      :negative-text="$t('common.cancel')"
      :loading="batchRePayModal.loading"
      @positive-click="submitBatchRePayModal"
    >
      <div class="space-y-4">
        <n-alert type="warning" :show-icon="false">
          确认重新代付以下{{ batchRePayModal.items.length }}个订单？
        </n-alert>
        <div class="max-h-60 overflow-y-auto">
          <div
            v-for="item in batchRePayModal.items"
            :key="item.id"
            class="mb-2 rounded border p-2"
          >
            <div class="text-sm">
              <div><strong>{{ $t('finance.orderNo') }}:</strong> {{ item.orderId }}</div>
              <div><strong>{{ $t('finance.member') }}:</strong> {{ item.memberAccount }}</div>
              <div>
                <strong>{{ $t('common.amount') }}:</strong>
                {{ item.rewardAmount ?? item.withdrawAmount ?? item.amount ?? 0 }}
                {{ item.currency }}
              </div>
              <div><strong>{{ $t('finance.paymentMethod') }}:</strong> {{ item.paymentMethod }}</div>
            </div>
          </div>
        </div>
        <n-form-item :label="$t('finance.payoutChannel')" required>
          <n-select
            v-model:value="batchRePayModal.paymentChannel"
            :placeholder="$t('finance.pleaseSelectPayoutChannel')"
            :options="paymentChannelOptions"
          />
        </n-form-item>
        <n-form-item :label="$t('finance.remark3')">
          <n-input
            v-model:value="batchRePayModal.notes"
            type="textarea"
            :placeholder="$t('finance.pleaseEnterRePayoutRemarkOptional')"
            :rows="3"
          />
        </n-form-item>
      </div>
    </n-modal>

    <!-- Process Modal -->
    <n-modal
      v-model:show="processModal.show"
      preset="dialog"
      :title="$t('finance.bulkProcessPayout')"
      :positive-text="$t('finance.confirmProcess')"
      :negative-text="$t('common.cancel')"
      @positive-click="handleBatchProcess"
    >
      <div class="space-y-4">
        <div>
          <n-alert type="info" :show-icon="false">
            确认处理以下{{ processModal.items.length }}个出款申请？
          </n-alert>
        </div>
        <div class="max-h-60 overflow-y-auto">
          <div
            v-for="item in processModal.items"
            :key="item.id"
            class="mb-2 rounded border p-2"
          >
            <div class="text-sm">
              <div><strong>{{ $t('finance.orderNo') }}:</strong> {{ item.orderId }}</div>
              <div><strong>{{ $t('finance.member') }}:</strong> {{ item.memberAccount }}</div>
              <div>
                <strong>{{ $t('common.amount') }}:</strong> {{ item.rewardAmount }}
                {{ item.currency }}
              </div>
              <div><strong>{{ $t('finance.paymentMethod') }}:</strong> {{ item.paymentMethod }}</div>
            </div>
          </div>
        </div>
        <div>
          <n-form-item :label="$t('finance.processStatus')" required>
            <n-select
              v-model:value="processModal.status"
              :placeholder="$t('finance.pleaseSelectProcessStatus')"
              :options="processStatusOptions"
            />
          </n-form-item>
        </div>
        <div>
          <n-form-item :label="$t('finance.processRemark')">
            <n-input
              v-model:value="processModal.notes"
              type="textarea"
              :placeholder="$t('finance.pleaseEnterProcessRemarkOptional')"
              :rows="3"
            />
          </n-form-item>
        </div>
      </div>
    </n-modal>

    <!-- Assign Modal -->
    <n-modal
      v-model:show="assignModal.show"
      preset="dialog"
      :title="$t('finance.assignPayoutTasks')"
      :positive-text="$t('finance.confirm')"
      :negative-text="$t('common.cancel')"
      @positive-click="handleBatchAssign"
    >
      <div class="space-y-4">
        <div>
          <n-alert type="info" :show-icon="false">
            将以下{{ assignModal.items.length }}个出款申请分配给自己处理？
          </n-alert>
        </div>
        <div class="max-h-60 overflow-y-auto">
          <div
            v-for="item in assignModal.items"
            :key="item.id"
            class="mb-2 rounded border p-2"
          >
            <div class="text-sm">
              <div><strong>{{ $t('finance.orderNo') }}:</strong> {{ item.orderId }}</div>
              <div><strong>{{ $t('finance.member') }}:</strong> {{ item.memberAccount }}</div>
              <div>
                <strong>{{ $t('common.amount') }}:</strong> {{ item.rewardAmount }}
                {{ item.currency }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </n-modal>

    <!-- Notes Modal -->
    <n-modal
      v-model:show="notesModal.show"
      preset="dialog"
      :title="$t('finance.editRemark')"
      :positive-text="$t('common.save')"
      :negative-text="$t('common.cancel')"
      :loading="notesModal.loading"
      @positive-click="handleSaveNotes"
    >
      <div class="space-y-4">
        <div v-if="notesModal.data">
          <n-alert type="info" :show-icon="false" class="mb-4">
            订单号: {{ notesModal.data.orderId }}
          </n-alert>
        </div>
        <div>
          <n-form-item :label="$t('finance.remark')">
            <n-select
              v-model:value="notesModal.noteType"
              :options="noteTypeOptions"
              :placeholder="$t('finance.pleaseSelectRemark')"
            />
          </n-form-item>
        </div>
        <div>
          <n-form-item :label="$t('finance.remark1')">
            <n-input
              v-model:value="notesModal.noteContent"
              type="textarea"
              :placeholder="$t('finance.pleaseEnterRemark1')"
              :rows="5"
            />
          </n-form-item>
        </div>
      </div>
    </n-modal>

    <!-- Detail Modal -->
    <n-modal
      v-model:show="detailModal.show"
      preset="card"
      :title="$t('finance.payoutDetails')"
      size="large"
      :style="{ width: '80%', maxWidth: '1000px' }"
    >
      <div v-if="detailModal.data" class="space-y-6">
        <!-- Basic Info -->
        <div class="grid grid-cols-2 gap-6">
          <n-card :title="$t('finance.basicInfo')" size="small">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('finance.orderNo') }}:</span>
                <span>{{ detailModal.data.orderId }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('common.memberAccount') }}:</span>
                <span>{{ detailModal.data.memberAccount }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('finance.applyTime') }}:</span>
                <span><TzDateTime :value="detailModal.data.applicationTime" /></span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('common.status') }}:</span>
                <n-tag :type="getStatusType(detailModal.data.status)">
                  {{ getStatusText(detailModal.data.status) }}
                </n-tag>
              </div>
            </div>
          </n-card>

          <n-card :title="$t('finance.amountInfo')" size="small">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('finance.withdrawalAmount') }}:</span>
                <span class="font-semibold text-green-600">
                  {{ detailModal.data.rewardAmount }}
                  {{ detailModal.data.currency }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">手续费:</span>
                <span
                  >{{ detailModal.data.fees || 0 }}
                  {{ detailModal.data.currency }}</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">实际到账:</span>
                <span
                  >{{
                    (
                      (detailModal.data.rewardAmount || 0) -
                      (detailModal.data.fees || 0)
                    ).toFixed(2)
                  }}
                  {{ detailModal.data.currency }}</span
                >
              </div>
            </div>
          </n-card>
        </div>

        <!-- Payment Info -->
        <n-card :title="$t('finance.receivingInfo')" size="small">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">{{ $t('finance.receivingMethod') }}:</span>
              <span>{{ detailModal.data.paymentMethod }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">{{ $t('finance.bankName') }}:</span>
              <span>{{ detailModal.data.bankName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">{{ $t('finance.accountNumber') }}:</span>
              <span>{{ detailModal.data.accountNumber }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">{{ $t('finance.cardholder') }}:</span>
              <span>{{ detailModal.data.accountHolderName }}</span>
            </div>
          </div>
        </n-card>

        <!-- Actions -->
        <div class="flex justify-end gap-3">
          <n-button @click="detailModal.show = false">{{ $t('common.close') }}</n-button>
          <n-button
            type="error"
            @click="showSingleRejectModal(detailModal.data)"
            v-if="canReject(detailModal.data?.status)"
          >{{ $t('finance.k1782445248062') }}</n-button>
          <n-button
            type="success"
            @click="showSingleProcessModal(detailModal.data)"
            v-if="canApprove(detailModal.data?.status)"
          >{{ $t('finance.k17824452480621') }}</n-button>
        </div>
      </div>
    </n-modal>

    <!-- Force Cancel Modal (强制取消) -->
    <n-modal
      v-model:show="forceCancelModal.show"
      preset="card"
      :title="$t('finance.cancel')"
      :style="{ width: 'min(90vw, 600px)' }"
      :closable="true"
      :mask-closable="false"
    >
      <div class="force-cancel-modal">
        <!-- Warning Message -->
        <div
          class="warning-message mb-6 rounded-lg border border-orange-200 bg-orange-50 p-4"
        >
          <div class="mb-3 flex items-center gap-2">
            <span class="font-medium text-orange-600">{{ $t('finance.k17824452473981') }}</span>
          </div>
        </div>

        <!-- Order Info -->
        <div v-if="forceCancelModal.data" class="order-info mb-6">
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-gray-600">{{ $t('finance.k1782445092052') }}</span>
              <span>{{ forceCancelModal.data.orderId }}</span>
            </div>
            <div>
              <span class="text-gray-600">{{ $t('finance.memberId') }}：</span>
              <span class="text-blue-600">{{
                forceCancelModal.data.memberAccount
              }}</span>
              <n-tag type="info" size="small" class="ml-1">V1</n-tag>
            </div>
            <div>
              <span class="text-gray-600">{{ $t('finance.k1782445092053') }}</span>
              <span>{{ forceCancelModal.data.memberName || 'kelvin88' }}</span>
            </div>
          </div>
          <div class="mt-3 grid grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-gray-600">{{ $t('finance.k17824450920531') }}</span>
              <span>{{
                forceCancelModal.data.memberTierName || '默认层级'
              }}</span>
            </div>
            <div>
              <span class="text-gray-600">{{ $t('finance.k1782445092054') }}</span>
              <span class="font-semibold text-green-600"
                >{{ forceCancelModal.data.rewardAmount }} BRL</span
              >
            </div>
            <div>
              <span class="text-gray-600">{{ $t('finance.k17824450920541') }}</span>
              <span>0.00 BRL</span>
            </div>
          </div>
          <div class="mt-3 text-sm">
            <span class="text-gray-600">{{ $t('finance.k1782445092055') }}</span>
            <span class="font-semibold"
              >{{ forceCancelModal.data.rewardAmount }} BRL</span
            >
          </div>
        </div>

        <!-- Cancellation Reasons -->
        <div class="mb-6 grid grid-cols-2 gap-6">
          <div>
            <label class="mb-2 block text-sm font-medium">{{ $t('finance.ktv2fh') }}</label>
            <n-input
              v-model:value="forceCancelModal.frontendReason"
              type="textarea"
              :placeholder="$t('finance.pleaseEnterCancelFrontend')"
              :rows="4"
              :maxlength="1000"
            />
            <div class="mt-1 text-right text-xs text-gray-500">
              {{ forceCancelModal.frontendReason.length }}/1000
            </div>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">{{ $t('finance.k12q6c') }}</label>
            <n-input
              v-model:value="forceCancelModal.backendReason"
              type="textarea"
              :placeholder="$t('finance.pleaseEnterCancelBackend')"
              :rows="4"
              :maxlength="1000"
            />
            <div class="mt-1 text-right text-xs text-gray-500">
              {{ forceCancelModal.backendReason.length }}/1000
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3">
          <n-button @click="forceCancelModal.show = false">{{ $t('common.cancel') }}</n-button>
          <n-button
            type="primary"
            @click="handleForceCancel"
            :loading="forceCancelModal.loading"
          >{{ $t('common.confirm') }}</n-button>
        </div>
      </div>
    </n-modal>

    <!-- 批量强制拒绝 - 表格弹窗（与参考图一致） -->
    <n-modal
      v-model:show="batchForceRejectModal.show"
      preset="card"
      class="batch-reason-modal-card batch-force-reject-modal-card"
      :title="$t('finance.bulkForceReject')"
      :style="{ width: 'min(98vw, 1600px)' }"
      :closable="true"
      :mask-closable="false"
    >
      <div class="batch-force-reject-modal">
        <div
          class="mb-4 flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 p-4"
        >
          <n-icon size="20" class="mt-0.5 shrink-0 text-orange-500">
            <WarningOutline />
          </n-icon>
          <div>
            <p class="font-medium text-orange-800">
              确认批量强制拒绝，选中的{{ batchForceRejectModal.rows?.length ?? 0 }}个订单吗？
            </p>
            <p class="mt-1 text-sm text-red-600">{{ $t('finance.k1782445248067') }}</p>
          </div>
        </div>
        <!-- 稽核平台（当存在「增加稽核任务」时显示） -->
        <div
          v-if="hasBatchForceRejectAuditRows"
          class="mb-4 rounded-lg border bg-gray-50 p-4"
        >
          <div class="mb-2 text-sm font-medium">{{ $t('finance.k1ezjw') }}</div>
          <div class="flex flex-wrap gap-2">
            <n-checkbox
              :checked="batchForceRejectPlatformsAll"
              @update:checked="(v: boolean) => setBatchForceRejectPlatformsAll(v)"
            >
              全选
            </n-checkbox>
            <n-checkbox
              v-for="p in availableProviders.slice(0, 12)"
              :key="p.platformId"
              :checked="batchForceRejectPlatforms[p.platformId] || false"
              @update:checked="(v: boolean) => setBatchForceRejectPlatform(p.platformId, v)"
            >
              {{ p.platformName }}
            </n-checkbox>
          </div>
        </div>
        <div class="batch-force-reject-table-wrap">
          <table class="batch-force-reject-table w-full border-collapse text-sm" style="table-layout: fixed">
            <colgroup>
              <col style="width: 10%">
              <col style="width: 9%">
              <col style="width: 7%">
              <col style="width: 9%">
              <col style="width: 5%">
              <col style="width: 7%">
              <col style="width: 16%">
              <col style="width: 9%">
              <col style="width: 7%">
              <col style="width: 11%">
              <col style="width: 11%">
            </colgroup>
            <thead>
              <tr class="border-b bg-gray-50">
                <th class="px-2 py-2 text-left font-medium">{{ $t('finance.orderNo') }}</th>
                <th class="whitespace-nowrap px-3 py-2 text-left font-medium">{{ $t('finance.brandNameId') }}</th>
                <th class="whitespace-nowrap px-3 py-2 text-left font-medium">{{ $t('finance.memberId') }}</th>
                <th class="px-2 py-2 text-left font-medium">{{ $t('finance.memberAccount2') }}</th>
                <th class="px-2 py-2 text-left font-medium">{{ $t('finance.memberCurrency') }}</th>
                <th class="px-2 py-2 text-left font-medium">{{ $t('finance.withdrawalAmount') }}</th>
                <th class="px-2 py-2 text-left font-medium">
                  <div class="flex flex-wrap items-center gap-2">
                    <span>{{ $t('finance.kuwnt6') }}</span>
                    <n-radio-group v-model:value="batchForceRejectBulk.windControlProcess" size="small">
                      <n-radio value="no">{{ $t('finance.khocqp') }}</n-radio>
                      <n-radio value="add_audit">{{ $t('finance.krsg39') }}</n-radio>
                      <n-radio value="deduct_balance">{{ $t('finance.k8ozj7') }}</n-radio>
                    </n-radio-group>
                    <n-button type="primary" size="tiny" @click="applyBatchForceRejectBulk('wind')">{{ $t('finance.k1782445248056') }}</n-button>
                  </div>
                </th>
                <th class="px-2 py-2 text-left font-medium">
                  <span>{{ $t('finance.krsg39') }}</span>
                  <div class="text-xs text-gray-500">最大20倍</div>
                  <n-input-number
                    v-model:value="batchForceRejectBulk.auditMultiplier"
                    size="small"
                    :min="0.01"
                    :max="20"
                    :step="0.01"
                    class="mt-1 w-20"
                  />
                  <n-button type="primary" size="tiny" class="mt-1" @click="applyBatchForceRejectBulk('audit')">{{ $t('finance.k1782445248056') }}</n-button>
                </th>
                <th class="px-2 py-2 text-left font-medium">{{ $t('finance.k8ozj7') }}</th>
                <th class="px-2 py-2 text-left font-medium">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <span>拒绝原因(前台)</span>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-gray-500">{{ $t('finance.max1000Chars') }}</span>
                      <n-input
                        v-model:value="batchForceRejectBulk.frontendReason"
                        :placeholder="$t('finance.text120')"
                        size="small"
                        class="w-24"
                        :maxlength="1000"
                      />
                      <n-button type="primary" size="tiny" @click="applyBatchForceRejectBulk('reason')">{{ $t('finance.k1782445248056') }}</n-button>
                    </div>
                  </div>
                </th>
                <th class="px-2 py-2 text-left font-medium">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <span>拒绝原因(后台)</span>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-gray-500">{{ $t('finance.max1000Chars') }}</span>
                      <n-input
                        v-model:value="batchForceRejectBulk.backendReason"
                        :placeholder="$t('finance.text120')"
                        size="small"
                        class="w-24"
                        :maxlength="1000"
                      />
                      <n-button type="primary" size="tiny" @click="applyBatchForceRejectBulk('backendReason')">{{ $t('finance.k1782445248056') }}</n-button>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in batchForceRejectModal.rows"
                :key="row.id"
                class="border-b hover:bg-gray-50/50"
              >
                <td class="px-2 py-2 font-mono text-xs break-all">{{ row.orderId }}</td>
                <td class="px-2 py-2 text-xs break-all">{{ (row as any).brandName || '-' }} ({{ (row as any).brandId || '-' }})</td>
                <td class="px-2 py-2 text-xs break-all">
                  <span>{{ row.displayMemberId || row.userID || row.memberId }}</span>
                  <n-tag v-if="row.vipLevel" size="small" type="success" class="ml-1">{{ row.vipLevel }}</n-tag>
                </td>
                <td class="px-2 py-2 text-xs break-all">{{ row.accountName || row.memberAccount }}</td>
                <td class="px-2 py-2 text-xs">{{ row.currency || 'BRL' }}</td>
                <td class="px-2 py-2 text-xs font-medium">
                  {{ formatCurrency(row.rewardAmount ?? row.withdrawAmount ?? row.withdrawalAmount ?? row.amount ?? 0) }}
                </td>
                <td class="px-2 py-2 align-top">
                  <template v-if="batchForceRejectRowData[row.id]">
                    <n-radio-group
                      :value="batchForceRejectRowData[row.id]?.windControlProcess"
                      size="small"
                      @update:value="(v: string) => setBatchForceRejectRowField(row.id, 'windControlProcess', v)"
                    >
                      <n-radio value="no">{{ $t('finance.khocqp') }}</n-radio>
                      <n-radio value="add_audit">{{ $t('finance.krsg39') }}</n-radio>
                      <n-radio value="deduct_balance">{{ $t('finance.k8ozj7') }}</n-radio>
                    </n-radio-group>
                  </template>
                </td>
                <td class="px-2 py-2 align-top">
                  <template v-if="batchForceRejectRowData[row.id]?.windControlProcess === 'add_audit'">
                    <n-input-number
                      :value="batchForceRejectRowData[row.id]?.auditMultiplier"
                      size="small"
                      :min="0.01"
                      :max="20"
                      :step="0.01"
                      class="w-20"
                      @update:value="(v: number | null) => setBatchForceRejectRowField(row.id, 'auditMultiplier', v ?? 1)"
                    />
                  </template>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-2 py-2 align-top">
                  <template v-if="batchForceRejectRowData[row.id]?.windControlProcess === 'deduct_balance'">
                    <n-input-number
                      :value="batchForceRejectRowData[row.id]?.deductAmount"
                      size="small"
                      :min="0"
                      class="w-24"
                      :placeholder="$t('common.amount')"
                      @update:value="(v: number | null) => setBatchForceRejectRowField(row.id, 'deductAmount', v ?? 0)"
                    />
                  </template>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-2 py-2 align-top">
                  <n-input
                    v-if="batchForceRejectRowData[row.id]"
                    :value="batchForceRejectRowData[row.id]?.frontendReason"
                    type="textarea"
                    :placeholder="$t('finance.enterFrontend')"
                    :autosize="{ minRows: 2 }"
                    :maxlength="1000"
                    class="resize-y"
                    @update:value="(v: string) => setBatchForceRejectRowField(row.id, 'frontendReason', v)"
                  />
                </td>
                <td class="px-2 py-2 align-top">
                  <n-input
                    v-if="batchForceRejectRowData[row.id]"
                    :value="batchForceRejectRowData[row.id]?.backendReason"
                    type="textarea"
                    :placeholder="$t('finance.enterBackend')"
                    :autosize="{ minRows: 2 }"
                    :maxlength="1000"
                    class="resize-y"
                    @update:value="(v: string) => setBatchForceRejectRowField(row.id, 'backendReason', v)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <n-button @click="batchForceRejectModal.show = false">{{ $t('common.cancel') }}</n-button>
          <n-button
            type="primary"
            :loading="batchForceRejectModal.loading"
            @click="submitBatchForceReject"
          >{{ $t('common.confirm') }}</n-button>
        </div>
      </div>
    </n-modal>

    <!-- Force Reject Modal (强制拒绝) - 单笔 -->
    <n-modal
      v-model:show="forceRejectModal.show"
      preset="card"
      :title="
        forceRejectModal.batchOrderIds?.length
          ? `强制拒绝 (共 ${forceRejectModal.batchOrderIds?.length ?? 0} 笔待出款)`
          : '强制拒绝'
      "
      :style="{ width: 'min(90vw, 800px)' }"
      :closable="true"
      :mask-closable="false"
    >
      <div class="force-reject-modal">
        <!-- Order Info (single row only; hide for batch) -->
        <div
          v-if="
            forceRejectModal.data && !forceRejectModal.batchOrderIds?.length
          "
          class="order-info mb-6"
        >
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-gray-600">{{ $t('finance.k1782445092052') }}</span>
              <span>{{ forceRejectModal.data.orderId }}</span>
            </div>
            <div>
              <span class="text-gray-600">{{ $t('finance.memberId') }}：</span>
              <span class="text-blue-600">{{
                forceRejectModal.data.memberAccount
              }}</span>
              <n-tag type="info" size="small" class="ml-1">V1</n-tag>
            </div>
            <div>
              <span class="text-gray-600">{{ $t('finance.k1782445092053') }}</span>
              <span>{{ forceRejectModal.data.memberName || 'kelvin88' }}</span>
            </div>
          </div>
          <div class="mt-3 grid grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-gray-600">{{ $t('finance.k17824450920531') }}</span>
              <span>{{
                forceRejectModal.data.memberTierName || '默认层级'
              }}</span>
            </div>
            <div>
              <span class="text-gray-600">{{ $t('finance.k1782445092054') }}</span>
              <span class="font-semibold text-green-600"
                >{{ forceRejectModal.data.rewardAmount }} BRL</span
              >
            </div>
            <div>
              <span class="text-gray-600">{{ $t('finance.k17824450920541') }}</span>
              <span>0.00 BRL</span>
            </div>
          </div>
          <div class="mt-3 text-sm">
            <span class="text-gray-600">{{ $t('finance.k1782445092055') }}</span>
            <span class="font-semibold"
              >{{ forceRejectModal.data.rewardAmount }} BRL</span
            >
          </div>
        </div>

        <!-- Wind Control Processing Options -->
        <div class="mb-6">
          <div class="mb-3 flex items-center gap-4">
            <span class="text-sm font-medium">{{ $t('finance.kzl2xl') }}</span>
            <n-radio-group v-model:value="forceRejectModal.windControlProcess">
              <n-radio value="no">{{ $t('finance.kb43kc') }}</n-radio>
              <n-radio value="add_audit">{{ $t('finance.krsg39') }}</n-radio>
              <n-radio value="deduct_balance">{{ $t('finance.k8ozj7') }}</n-radio>
            </n-radio-group>
          </div>

          <!-- Audit Task Addition -->
          <div
            v-if="forceRejectModal.windControlProcess === 'add_audit'"
            class="mb-4"
          >
            <div class="mb-2 flex items-center gap-2">
              <span class="text-sm font-medium">{{ $t('finance.krsg39') }}</span>
              <n-input-number
                v-model:value="forceRejectModal.auditMultiplier"
                :min="1"
                :max="100"
                :step="1"
                placeholder="1.00"
                class="w-24"
              />
              <span class="text-sm">{{ $t('finance.kblhtu') }}</span>
            </div>
            <div class="mb-3 text-sm text-gray-600">
              即需要再打码{{
                forceRejectModal.auditMultiplier * 30.0
              }}才能再次提现
            </div>
          </div>
        </div>

        <!-- Platform Selection -->
        <div class="mb-6">
          <div class="mb-3 text-sm font-medium">{{ $t('finance.kusymy') }}</div>
          <div class="platform-selection">
            <!-- Game Type Filters -->
            <div class="mb-4 flex flex-wrap gap-2">
              <n-button
                v-for="gameType in gameTypeFilters"
                :key="gameType.value"
                :type="
                  selectedGameType === gameType.value ? 'primary' : 'default'
                "
                size="small"
                @click="selectedGameType = gameType.value"
              >
                {{ gameType.label }}
              </n-button>
            </div>

            <!-- Platform Grid -->
            <div
              class="platform-grid max-h-80 overflow-y-auto rounded-lg border bg-gray-50 p-4"
            >
              <div class="grid grid-cols-2 gap-3">
                <!-- Select All Option -->
                <div
                  class="platform-card flex cursor-pointer items-center rounded-lg border bg-white p-3 transition-colors hover:border-blue-300"
                  :class="{
                    'border-blue-500 bg-blue-50':
                      forceRejectModal.platforms.all,
                  }"
                  @click="
                    handleSelectAllProviders(!forceRejectModal.platforms.all)
                  "
                >
                  <div
                    class="mr-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100"
                  >
                    <span class="text-2xl">🎮</span>
                  </div>
                  <div class="flex-1">
                    <div class="font-medium text-gray-900">{{ $t('finance.k7b4zs') }}</div>
                    <div class="text-sm text-gray-500">
                      ALL • {{ filteredProviders.length }} 个平台
                    </div>
                  </div>
                  <n-checkbox
                    :checked="forceRejectModal.platforms.all"
                    @click.stop
                    @update:checked="handleSelectAllProviders"
                  />
                </div>

                <!-- Individual Platforms -->
                <div
                  v-for="provider in filteredProviders"
                  :key="provider.platformId"
                  class="platform-card flex cursor-pointer items-center rounded-lg border bg-white p-3 transition-colors hover:border-blue-300"
                  :class="{
                    'border-blue-500 bg-blue-50':
                      forceRejectModal.platforms[provider.platformId],
                  }"
                  @click="toggleProviderSelection(provider.platformId)"
                >
                  <div
                    class="mr-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-400 to-blue-500"
                  >
                    <span class="text-sm font-bold text-white">{{
                      provider.platformId.substring(0, 2)
                    }}</span>
                  </div>
                  <div class="flex-1">
                    <div class="font-medium text-gray-900">
                      {{ provider.platformName }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ provider.gameType.toUpperCase() }} •
                      {{ provider.gameCount || 0 }} 个游戏
                    </div>
                  </div>
                  <n-checkbox
                    :checked="
                      forceRejectModal.platforms[provider.platformId] || false
                    "
                    @click.stop
                    @update:checked="
                      (checked) =>
                        updateProviderSelection(provider.platformId, checked)
                    "
                  />
                </div>
              </div>
            </div>

            <!-- Selection Summary -->
            <div class="mt-3 text-sm text-gray-600">
              已选择 {{ selectedProviderCount }} 个平台，共
              {{ totalGamesCount }} 个游戏
            </div>

            <div class="mt-3 rounded bg-yellow-50 p-3 text-sm text-gray-600">{{ $t('finance.k1782445247409') }}</div>
          </div>
        </div>

        <!-- Rejection Reasons -->
        <div class="mb-6 grid grid-cols-2 gap-6">
          <div>
            <label class="mb-2 block text-sm font-medium">{{ $t('finance.kmsitn') }}</label>
            <n-input
              v-model:value="forceRejectModal.frontendReason"
              type="textarea"
              :placeholder="$t('finance.pleaseEnterFrontend')"
              :rows="4"
              :maxlength="1000"
            />
            <div class="mt-1 text-right text-xs text-gray-500">
              {{ forceRejectModal.frontendReason.length }}/1000
            </div>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">{{ $t('finance.kutwb8') }}</label>
            <n-input
              v-model:value="forceRejectModal.backendReason"
              type="textarea"
              :placeholder="$t('finance.pleaseEnterBackend')"
              :rows="4"
              :maxlength="1000"
            />
            <div class="mt-1 text-right text-xs text-gray-500">
              {{ forceRejectModal.backendReason.length }}/1000
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3">
          <n-button @click="forceRejectModal.show = false">{{ $t('common.cancel') }}</n-button>
          <n-button
            type="primary"
            @click="handleForceReject"
            :loading="forceRejectModal.loading"
          >{{ $t('common.confirm') }}</n-button>
        </div>
      </div>
    </n-modal>

    <!-- Approve Withdrawal Modal (审核出款) -->
    <n-modal
      v-model:show="approveWithdrawalModal.show"
      preset="card"
      :style="{ width: 'min(95vw, 1400px)', maxHeight: '90vh' }"
      :closable="true"
      :mask-closable="false"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <span class="text-lg font-semibold">{{ $t('finance.reviewPayout') }}</span>
          <n-tag type="info" size="small">{{ $t('finance.kqn45i') }}</n-tag>
        </div>
      </template>

      <div class="approve-withdrawal-modal max-h-[75vh] overflow-y-auto">
        <!-- Order Summary Card -->
        <n-card :title="$t('finance.k1782445248045')" class="mb-6" size="small">
          <div
            v-if="approveWithdrawalModal.data"
            class="grid grid-cols-1 gap-6 lg:grid-cols-3"
          >
            <!-- Amount Info -->
            <div
              class="rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4"
            >
              <div class="text-center">
                <div class="mb-1 text-2xl font-bold text-green-600">
                  {{ approveWithdrawalModal.data.rewardAmount }} BRL
                </div>
                <div class="text-sm text-gray-600">{{ $t('finance.withdrawalAmount') }}</div>
                <div class="mt-1 text-xs text-gray-500">
                  实际到账: {{ approveWithdrawalModal.data.rewardAmount }} BRL
                </div>
              </div>
            </div>

            <!-- Order Info -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">{{ $t('finance.orderNo') }}</span>
                <span class="font-mono text-blue-600">{{
                  approveWithdrawalModal.data.orderId
                }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">{{ $t('common.status') }}</span>
                <n-tag type="warning" size="small">{{
                  getStatusText(approveWithdrawalModal.data.status)
                }}</n-tag>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">{{ $t('finance.withdrawalMethod') }}</span>
                <n-tag type="info" size="small">PIX</n-tag>
              </div>
            </div>

            <!-- Risk Info -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">{{ $t('finance.ksi6x5') }}</span>
                <span class="font-semibold">0</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">重复IP人数</span>
                <span class="font-semibold">0</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">CPF</span>
                <span class="font-mono text-xs">{{
                  approveWithdrawalModal.data.cpf || '123.141.241-24'
                }}</span>
              </div>
            </div>
          </div>
        </n-card>

        <!-- Member Information -->
        <n-card :title="$t('finance.memberInfo2')" class="mb-6" size="small">
          <div
            v-if="approveWithdrawalModal.data"
            class="grid grid-cols-1 gap-6 lg:grid-cols-2"
          >
            <!-- Basic Info -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">会员ID</span>
                <span class="font-semibold text-blue-600">{{
                  approveWithdrawalModal.data.memberInfo?.userID ||
                  approveWithdrawalModal.data.memberAccount
                }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">{{ $t('finance.memberAccount2') }}</span>
                <span>{{
                  approveWithdrawalModal.data.memberInfo?.name ||
                  approveWithdrawalModal.data.memberName ||
                  approveWithdrawalModal.data.memberAccount
                }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">VIP等级</span>
                <n-tag
                  v-if="approveWithdrawalModal.data.memberInfo?.vipLevel"
                  type="info"
                  size="small"
                >
                  {{
                    approveWithdrawalModal.data.memberInfo.vipLevel.name ||
                    `V${approveWithdrawalModal.data.memberInfo.vipLevel.level}`
                  }}
                </n-tag>
                <n-tag v-else type="info" size="small">{{ $t('finance.notSettings') }}</n-tag>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">{{ $t('finance.memberTier') }}</span>
                <span>{{
                  approveWithdrawalModal.data.memberInfo?.memberTier
                    ?.tierName || '默认层级'
                }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">{{ $t('finance.kk0u7v') }}</span>
                <span>{{
                  approveWithdrawalModal.data.memberInfo?.registrationDomain ||
                  '官网'
                }}</span>
              </div>
            </div>

            <!-- Financial Info -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">{{ $t('finance.kvl9l3') }}</span>
                <span class="font-semibold text-red-600"
                  >R$
                  {{
                    formatCurrency(
                      approveWithdrawalModal.data.memberInfo?.balance || 0,
                    )
                  }}</span
                >
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">{{ $t('finance.kklpn6') }}</span>
                <span class="font-semibold text-green-600"
                  >R$
                  {{
                    formatCurrency(
                      approveWithdrawalModal.data.memberInfo?.totalDeposit || 0,
                    )
                  }}</span
                >
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">{{ $t('finance.ktn35b') }}</span>
                <span
                  >R$
                  {{
                    formatCurrency(
                      approveWithdrawalModal.data.memberInfo?.totalWithdrawal ||
                        0,
                    )
                  }}</span
                >
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">{{ $t('finance.count2') }}</span>
                <span
                  >{{
                    approveWithdrawalModal.data.memberInfo?.depositCount || 0
                  }}/{{
                    approveWithdrawalModal.data.memberInfo?.withdrawalCount || 0
                  }}</span
                >
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">{{ $t('finance.text115') }}</span>
                <span class="font-semibold text-red-600">{{
                  formatCurrency(
                    approveWithdrawalModal.data.memberInfo
                      ?.depositWithdrawalDiff || 0,
                  )
                }}</span>
              </div>
            </div>
          </div>
        </n-card>

        <!-- Statistics -->
        <n-card :title="$t('finance.wageringStatistics')" class="mb-6" size="small">
          <n-data-table
            :columns="[
              { title: '统计周期', key: 'period', width: 80 },
              { title: '充值金额', key: 'deposit', width: 100 },
              { title: '提现金额', key: 'withdrawal', width: 100 },
              { title: '充/提差额', key: 'difference', width: 100 },
              { title: '投注数', key: 'betCount', width: 80 },
              { title: '投注金额', key: 'betAmount', width: 100 },
              { title: '输赢', key: 'profit', width: 100 },
              { title: '优惠金额', key: 'bonus', width: 100 },
              { title: '操作', key: 'actions', width: 200 },
            ]"
            :data="
              approveWithdrawalModal.data?.bettingStatistics
                ? [approveWithdrawalModal.data.bettingStatistics.today]
                : []
            "
            :single-line="false"
            size="small"
            :loading="approveWithdrawalModal.loading"
          >
            <template #empty>
              <div class="py-4 text-center text-gray-400">{{ $t('finance.noData') }}</div>
            </template>
            <template #difference="{ row }">
              <span class="font-semibold text-red-600">{{
                row.difference
              }}</span>
            </template>
            <template #profit="{ row }">
              <span
                :class="
                  parseFloat(row.profit) >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                "
                class="font-semibold"
                >{{ row.profit }}</span
              >
            </template>
            <template #actions="{ row }">
              <div class="flex gap-1">
                <n-button text type="primary" size="small">{{ $t('finance.klk33z') }}</n-button>
                <n-button text type="info" size="small">{{ $t('finance.wageringStatistics') }}</n-button>
              </div>
            </template>
          </n-data-table>
        </n-card>

        <!-- Risk Assessment -->
        <n-card :title="$t('finance.riskControl2')" class="mb-6" size="small">
          <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div
              :class="
                approveWithdrawalModal.data?.riskAssessment?.level === 'low'
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              "
              class="rounded-lg border p-4"
            >
              <div class="text-center">
                <div
                  :class="
                    approveWithdrawalModal.data?.riskAssessment?.level === 'low'
                      ? 'text-green-600'
                      : 'text-gray-600'
                  "
                  class="font-semibold"
                >
                  {{
                    approveWithdrawalModal.data?.riskAssessment?.level === 'low'
                      ? '低风险'
                      : '风险等级: ' +
                        (approveWithdrawalModal.data?.riskAssessment?.level ||
                          '未知')
                  }}
                </div>
                <div class="mt-1 text-xs text-gray-600">{{ $t('finance.k71xgg') }}</div>
              </div>
            </div>
            <div
              :class="
                approveWithdrawalModal.data?.riskAssessment?.isFirstWithdrawal
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-gray-200 bg-gray-50'
              "
              class="rounded-lg border p-4"
            >
              <div class="text-center">
                <div
                  :class="
                    approveWithdrawalModal.data?.riskAssessment
                      ?.isFirstWithdrawal
                      ? 'text-blue-600'
                      : 'text-gray-400'
                  "
                  class="font-semibold"
                >
                  {{
                    approveWithdrawalModal.data?.riskAssessment
                      ?.isFirstWithdrawal
                      ? '首次提现'
                      : '非首次提现'
                  }}
                </div>
                <div class="mt-1 text-xs text-gray-600">
                  {{
                    approveWithdrawalModal.data?.riskAssessment
                      ?.isFirstWithdrawal
                      ? '需要额外关注'
                      : '正常用户'
                  }}
                </div>
              </div>
            </div>
            <div
              :class="
                approveWithdrawalModal.data?.riskAssessment?.isRecentlyActive
                  ? 'border-orange-200 bg-orange-50'
                  : 'border-gray-200 bg-gray-50'
              "
              class="rounded-lg border p-4"
            >
              <div class="text-center">
                <div
                  :class="
                    approveWithdrawalModal.data?.riskAssessment
                      ?.isRecentlyActive
                      ? 'text-orange-600'
                      : 'text-gray-400'
                  "
                  class="font-semibold"
                >
                  {{
                    approveWithdrawalModal.data?.riskAssessment
                      ?.isRecentlyActive
                      ? '近期活跃'
                      : '非活跃'
                  }}
                </div>
                <div class="mt-1 text-xs text-gray-600">
                  {{
                    approveWithdrawalModal.data?.riskAssessment
                      ?.isRecentlyActive
                      ? '投注活跃用户'
                      : '无近期投注'
                  }}
                </div>
              </div>
            </div>
          </div>
        </n-card>
      </div>

      <template #action>
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500">{{ $t('finance.ki0hvy') }}</div>
          <div class="flex gap-3">
            <n-button
              @click="approveWithdrawalModal.show = false"
              :disabled="approveWithdrawalModal.loading"
            >{{ $t('common.cancel') }}</n-button>
            <n-button
              type="error"
              @click="
                approveWithdrawalModal.data &&
                showForceRejectModal(approveWithdrawalModal.data)
              "
              :disabled="
                approveWithdrawalModal.loading || !approveWithdrawalModal.data
              "
            >{{ $t('finance.k1782445248062') }}</n-button>
            <n-button
              type="primary"
              @click="handleApproveWithdrawal"
              :loading="approveWithdrawalModal.loading"
            >{{ $t('finance.k1782445248092') }}</n-button>
          </div>
        </div>
      </template>
    </n-modal>

    <!-- Wagering Requirements Modal -->
    <n-modal
      v-model:show="wageringModal.show"
      preset="card"
      :title="$t('finance.wageringTask')"
      size="large"
      :style="{ width: '90%', maxWidth: '600px' }"
      :closable="true"
      :mask-closable="false"
    >
      <div class="wagering-notification">
        <!-- Header Message -->
        <div class="mb-6 text-center">
          <div class="mb-2 text-lg font-medium text-orange-600">
            您还需
            {{
              wageringModal.data?.totalWageringRemaining?.toFixed(2) || '0.00'
            }}
            <span class="text-green-600">🔄</span>{{ $t('finance.k17824452480921') }}</div>
          <div class="text-sm text-gray-600">
            <n-button type="primary" text @click="goToBetting">{{ $t('finance.kgq7zm') }}</n-button>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="mb-4">
          <n-select
            v-model:value="wageringModal.filterType"
            :options="[
              { label: '全部', value: 'all' },
              { label: '充值上分', value: '充值上分' },
              { label: '注册账号', value: '注册账号' },
              { label: '充值赠送', value: '充值赠送' },
              { label: '领取奖励', value: '领取奖励' },
              { label: '投注', value: '投注' },
            ]"
            :placeholder="$t('finance.text68')"
            clearable
            class="w-48"
          />
          <span class="ml-4 text-sm text-gray-600">{{ $t('finance.kyqn3w') }}</span>
        </div>

        <!-- Wagering Tasks List -->
        <div class="max-h-80 space-y-3 overflow-y-auto">
          <div
            v-for="audit in filteredAudits"
            :key="audit.auditId"
            class="rounded-lg border bg-gray-50 p-4"
          >
            <div class="mb-3 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="font-semibold text-orange-500">
                  +{{ audit.rewardAmount.toFixed(2) }}
                </div>
                <div class="text-sm text-gray-600">
                  (×{{
                    audit.requiredBetAmount > 0
                      ? (audit.requiredBetAmount / audit.rewardAmount).toFixed(
                          2,
                        )
                      : '1.00'
                  }}倍)
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-medium">
                  {{ audit.remainingBetAmount.toFixed(2) }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ audit.status === 'pending' ? '待投注' : '投注中' }}
                </div>
              </div>
            </div>

            <div class="mb-2 flex items-center gap-2 text-sm text-gray-600">
              <span>来源: {{ audit.source }}</span>
              <span class="ml-auto"><TzDateTime :value="audit.createdAt" /></span>
            </div>

            <div class="text-sm text-gray-600">
              {{ audit.activityName }}
            </div>
          </div>
        </div>

        <!-- Footer Note -->
        <div
          class="mt-6 rounded bg-blue-50 p-4 text-center text-sm text-gray-500"
        >{{ $t('finance.k1782445248094') }}< 10,00时，系统将自动解除所有投注任务<br />
          (需注单统计完成后才能触发自动解除)
        </div>

        <!-- Actions -->
        <div class="mt-6 flex justify-center gap-3">
          <n-button @click="wageringModal.show = false">{{ $t('common.close') }}</n-button>
          <n-button type="primary" @click="goToBetting">{{ $t('finance.kgq7zm') }}</n-button>
        </div>
      </div>
    </n-modal>

    <!-- Member Detail Modal - Reuse existing UserDetailModal component -->
    <UserDetailModal
      v-model:visible="showMemberDetailModal"
      :user-id="currentMemberUserId"
    />
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import {
  ref,
  reactive,
  onMounted,
  onUnmounted,
  computed,
  h,
  watch,
  defineAsyncComponent,
} from 'vue';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
const SmartAutoRefresh = defineAsyncComponent(
  () => import('../../components/smart/SmartAutoRefresh/index.vue'),
);
const SmartDataGrid = defineAsyncComponent(
  () => import('../../components/smart/SmartDataGrid/index.vue'),
);

// Props
interface Props {
  isMyWithdrawal?: boolean; // true for "由我出款", false/undefined for "财务出款"
}

const props = withDefaults(defineProps<Props>(), {
  isMyWithdrawal: false,
});

const emit = defineEmits<{
  'refresh-tabs': [];
}>();

import {
  NButton,
  NCard,
  NInput,
  NSelect,
  NDatePicker,
  NFormItem,
  NModal,
  NAlert,
  NTag,
  NIcon,
  NRadioGroup,
  NRadio,
  NInputNumber,
  NCheckbox,
  useMessage,
  useDialog,
  type DataTableColumns,
} from 'naive-ui';
import {
  ReloadOutline,
  SearchOutline,
  PersonOutline,
  CopyOutline,
  ChevronUpOutline,
  WarningOutline,
} from '@vicons/ionicons5';
import {
  financeWithdrawalApi,
  isCompletedWithdrawalStatus,
} from '#/api/finance/financeWithdrawal';
import { rePaymentApi } from '#/api/finance/rePayment';
import { useUserStore } from '@vben/stores';
import { getGamePlatformListApi } from '#/api/game/platform';
import { formatCurrency } from '#/utils/format';
import TzDateTime from '#/components/common/TzDateTime.vue';
import { renderTzDateTime } from '#/components/common/tzDateTimeRender';
import { useDisplayTimezone } from '#/composables/useDisplayTimezone';
const UserDetailModal = defineAsyncComponent(
  () => import('#/components/user/UserDetailModal.vue'),
);

// Member detail modal refs
const showMemberDetailModal = ref(false);
const currentMemberUserId = ref<number>(0);

interface WithdrawalRecord {
  id: string;
  orderId: string;
  memberAccount: string;
  memberId?: string | number;
  userID?: string;
  displayMemberId?: string | number;
  memberName: string;
  vipLevel: string;
  applicationTime: string;
  currency: string;
  amount: number;
  paymentMethod: string;
  status: string;
  operator: string;
  fees: number;
  accountNumber: string;
  bankName: string;
  accountHolderName: string;
  notes: string;
  // Lock related fields
  isLocked: boolean;
  lockedBy: string | null;
  lockedAt: string | null;
  // Additional fields for finance withdrawal
  withdrawalCount: number;
  depositCount: number;
  frontendNotes: string;
  frontendNote?: string;
  backendNotes: string;
  backendNote?: string;
  description?: string;
  thirdPartyProvider: string;
  refreshCount: number;
  lastRefreshTime: string | null;
  accountName?: string;
  memberTierName?: string;
  appliedAt?: string;
  updatedAt?: string;
  completedTime?: string;
  processedTime?: string;
  exchangeRate?: number | string;
  withdrawAmount?: number;
  withdrawalAmount?: number;
  currentBalance?: number;
  beforeAmount?: number;
  estimatedAmount?: number;
  estimatedReceived?: number;
  fee?: number;
  approvalAmount?: number;
  rechargeWithdrawCount?: {
    rechargeCount: number;
    withdrawCount: number;
    duplicateIP: number;
  };
  totalDeposit?: number;
  totalWithdraw?: number;
  withdrawChannelInfo?: any;
  thirdPartyOrderNo?: string;
  paymentGateway?: string;
  reviewer?: string;
  [key: string]: any;
}

const message = useMessage();
const { timezone } = useDisplayTimezone();
const dialog = useDialog();
const userStore = useUserStore();

// Data and state
const loading = ref(false);
const tableData = ref<WithdrawalRecord[]>([]);
const selectedIds = ref<string[]>([]);
const batchOperation = ref('');

// Auto-refresh state (simplified with SmartAutoRefresh)
const autoRefreshEnabled = ref(false);

// Helper functions to get date ranges
const getTodayDateRange = (): [number, number] => {
  const now = new Date();
  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
  );
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
  );
  return [startOfDay.getTime(), endOfDay.getTime()];
};

const getMonthDateRange = (): [number, number] => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
  );
  return [startOfMonth.getTime(), endOfMonth.getTime()];
};

// Filters
const filters = reactive({
  timeRange: 'today',
  dateRange: getTodayDateRange() as [number, number] | null, // Default to today
  memberAccount: '',
  userId: '',
  orderId: '',
  thirdPartyPayment: '',
  amount: '',
  withdrawalMethod: '',
  approvalStatus: 'all', // Default to showing all records
  operator: '',
});

// Pagination - SmartDataGrid compatible
const paginationReactive = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

// Modals
const processModal = reactive({
  show: false,
  items: [] as WithdrawalRecord[],
  status: '',
  notes: '',
});

const batchRePayModal = reactive({
  show: false,
  loading: false,
  items: [] as WithdrawalRecord[],
  paymentChannel: '',
  notes: '',
});

const assignModal = reactive({
  show: false,
  items: [] as WithdrawalRecord[],
});

const detailModal = reactive({
  show: false,
  data: null as WithdrawalRecord | null,
});

const wageringModal = reactive({
  show: false,
  filterType: 'all' as string,
  data: null as {
    canWithdraw: boolean;
    totalWageringRequired: number;
    totalWageringCompleted: number;
    totalWageringRemaining: number;
    pendingAudits: Array<{
      auditId: string;
      activityId: string;
      activityName: string;
      source: string;
      rewardAmount: number;
      requiredBetAmount: number;
      currentBetAmount: number;
      remainingBetAmount: number;
      completionPercentage: number;
      createdAt: string;
      status: string;
    }>;
    message?: string;
  } | null,
});

// Force Cancel Modal
const forceCancelModal = reactive({
  show: false,
  loading: false,
  data: null as WithdrawalRecord | null,
  frontendReason: '',
  backendReason: '',
});

// Force Reject Modal (单笔)
const forceRejectModal = reactive({
  show: false,
  loading: false,
  data: null as WithdrawalRecord | null,
  batchOrderIds: null as string[] | null,
  windControlProcess: 'no' as 'no' | 'add_audit' | 'deduct_balance',
  auditMultiplier: 1,
  selectedPlatform: 'poker',
  platforms: {} as Record<string, boolean>,
  frontendReason: '',
  backendReason: '',
});

// 批量强制拒绝 - 表格弹窗
type BatchForceRejectRowItem = {
  windControlProcess: 'no' | 'add_audit' | 'deduct_balance';
  auditMultiplier: number;
  deductAmount?: number;
  frontendReason: string;
  backendReason: string;
};
const batchForceRejectModal = ref<{
  show: boolean;
  loading?: boolean;
  rows: WithdrawalRecord[];
}>({ show: false, loading: false, rows: [] });
const batchForceRejectRowData = ref<Record<string, BatchForceRejectRowItem>>({});
const batchForceRejectBulk = reactive({
  windControlProcess: 'no' as 'no' | 'add_audit' | 'deduct_balance',
  auditMultiplier: 1,
  frontendReason: '',
  backendReason: '',
});
const batchForceRejectPlatforms = ref<Record<string, boolean>>({});
const hasBatchForceRejectAuditRows = computed(() =>
  batchForceRejectModal.value.rows.some(
    (r) => batchForceRejectRowData.value[r.id]?.windControlProcess === 'add_audit',
  ),
);
const batchForceRejectPlatformsAll = computed({
  get: () => {
    const ids = availableProviders.value.map((p) => p.platformId);
    return ids.length > 0 && ids.every((id) => batchForceRejectPlatforms.value[id]);
  },
  set: (v: boolean) => {
    availableProviders.value.forEach((p) => {
      batchForceRejectPlatforms.value[p.platformId] = v;
    });
  },
});
function setBatchForceRejectPlatformsAll(v: boolean) {
  availableProviders.value.forEach((p) => {
    batchForceRejectPlatforms.value[p.platformId] = v;
  });
}
function setBatchForceRejectPlatform(platformId: string, v: boolean) {
  batchForceRejectPlatforms.value[platformId] = v;
}
function setBatchForceRejectRowField(
  rowId: string,
  field: keyof BatchForceRejectRowItem,
  value: any,
) {
  const row = batchForceRejectRowData.value[rowId];
  if (row) (row as any)[field] = value;
}
function applyBatchForceRejectBulk(
  type: 'wind' | 'audit' | 'reason' | 'backendReason',
) {
  const rows = batchForceRejectModal.value.rows;
  if (type === 'wind') {
    rows.forEach((r) => {
      const d = batchForceRejectRowData.value[r.id];
      if (d) d.windControlProcess = batchForceRejectBulk.windControlProcess;
    });
  } else if (type === 'audit') {
    rows.forEach((r) => {
      const d = batchForceRejectRowData.value[r.id];
      if (d && d.windControlProcess === 'add_audit')
        d.auditMultiplier = batchForceRejectBulk.auditMultiplier;
    });
  } else if (type === 'backendReason') {
    rows.forEach((r) => {
      const d = batchForceRejectRowData.value[r.id];
      if (d) d.backendReason = batchForceRejectBulk.backendReason;
    });
  } else {
    rows.forEach((r) => {
      const d = batchForceRejectRowData.value[r.id];
      if (d) d.frontendReason = batchForceRejectBulk.frontendReason;
    });
  }
}
async function submitBatchForceReject() {
  const rows = batchForceRejectModal.value.rows;
  const platforms = batchForceRejectPlatforms.value;
  const selectedPlatform =
    Object.keys(platforms).find((k) => platforms[k]) ||
    availableProviders.value[0]?.platformId ||
    'PG';
  batchForceRejectModal.value.loading = true;
  let ok = 0;
  for (const row of rows) {
    const d = batchForceRejectRowData.value[row.id];
    if (!d) continue;
    try {
      let auditTask: { multiplier: number; platforms: Record<string, boolean>; selectedPlatform: string } | undefined;
      if (d.windControlProcess === 'add_audit') {
        auditTask = {
          multiplier: d.auditMultiplier,
          platforms: { ...platforms },
          selectedPlatform,
        };
      }
      const res = await financeWithdrawalApi.forceReject(row.id, {
        windControlProcess: d.windControlProcess,
        auditTask,
        frontendReason: d.frontendReason ?? '',
        backendReason: (d.backendReason || d.frontendReason) ?? '',
      });
      if (res?.success !== false) ok++;
    } catch (_) {
      /* skip */
    }
  }
  message[ok === rows.length ? 'success' : 'warning'](
    ok === rows.length
      ? `批量强制拒绝成功 (${rows.length} 条)`
      : `部分成功 ${ok}/${rows.length} 条`,
  );
  batchForceRejectModal.value.show = false;
  batchForceRejectModal.value.loading = false;
  await fetchData();
  selectedIds.value = [];
  emit('refresh-tabs');
}

// Approve Withdrawal Modal
const approveWithdrawalModal = reactive({
  show: false,
  loading: false,
  data: null as WithdrawalRecord | null,
});

// Options
const thirdPartyOptions = [
  { label: $t('finance.pixAutoPayout'), value: 'PIX_AUTO' },
  { label: $t('finance.bankTransfer'), value: 'BANK_TRANSFER' },
  { label: $t('finance.digitalWallet'), value: 'DIGITAL_WALLET' },
];

const paymentChannelOptions = [
  { label: $t('finance.pIXChannel1'), value: 'PIX_CHANNEL_1' },
  { label: $t('finance.pIXChannel2'), value: 'PIX_CHANNEL_2' },
  { label: $t('finance.bankPayoutChannel'), value: 'BANK_CHANNEL' },
];

const withdrawalMethodOptions = [
  { label: 'PIX', value: 'PIX' },
  { label: $t('finance.bankCard'), value: 'BANK_CARD' },
  { label: $t('finance.digitalWallet'), value: 'WALLET' },
];

const approvalStatusOptions = [
  { label: $t('finance.allRecords'), value: 'all' }, // Default - shows all records
  { label: $t('finance.pendingFinanceProcess'), value: '' },
  { label: $t('finance.pendingReview'), value: 'pending' },
  { label: $t('finance.alreadyReview'), value: 'approved' },
  { label: $t('finance.processing'), value: 'processing' },
  { label: $t('finance.alreadyComplete'), value: 'completed' },
  { label: $t('finance.rejected'), value: 'rejected' },
];

const processStatusOptions = [
  { label: $t('finance.processSuccess'), value: 'success' },
  { label: $t('finance.processFailed'), value: 'failed' },
  { label: $t('finance.pendingConfirm'), value: 'pending_confirmation' },
];

const batchOperationOptions = [
  { label: $t('finance.bulkProcess'), value: 'batch_process' },
  { label: $t('finance.bulk'), value: 'batch_assign' },
  { label: $t('finance.bulkExport'), value: 'batch_export' },
];

// 批量操作：由我出款、财务出款均显示全部选项
const batchOperationDropdownOptions = [
  { label: $t('finance.bulkLock'), key: 'batch-lock' },
  { label: $t('finance.bulkUnlock'), key: 'batch-unlock' },
  { label: $t('finance.bulkRemark'), key: 'batch-remark' },
  { label: $t('finance.bulkForceCancel'), key: 'batch-force-cancel' },
  { label: $t('finance.bulkForceReject'), key: 'batch-force-reject' },
  { label: $t('finance.bulkForceSuccess1'), key: 'batch-force-success' },
  { label: $t('finance.bulkForceFail'), key: 'batch-force-fail' },
  { label: $t('finance.bulkRefreshCallback'), key: 'batch-refresh-callback' },
  { label: $t('finance.bulkReviewPayout'), key: 'batch-approve' },
  { label: $t('finance.bulkRePayout'), key: 'batch-repay' },
  { label: $t('finance.bulkManualPayoutDone'), key: 'batch-manual-withdrawal' },
];
const batchOperationDropdownOptionsSelect = batchOperationDropdownOptions.map((o) => ({
  label: o.label,
  value: o.key,
}));

const showFilterBatchModal = ref(false);
const filterBatchActionKey = ref('');
const filterBatchReason = ref('');
function openFilterBatchModal() {
  if (selectedIds.value.length === 0) {
    message.warning($t('finance.pleaseSelectActionsRecords'));
    return;
  }
  filterBatchActionKey.value = '';
  filterBatchReason.value = '';
  showFilterBatchModal.value = true;
}
async function submitFilterBatchModal() {
  if (!filterBatchActionKey.value) {
    message.warning($t('finance.pleaseSelectActions'));
    return false;
  }
  const selectedRows = tableData.value.filter((r) =>
    selectedIds.value.includes(r.id),
  );
  // 解锁/备注/取消/拒绝/审核/人工出款：筛掉未锁定和已完成的订单
  const rowsForOp = filterRowsForBatchOpLocked(
    filterBatchActionKey.value,
    selectedRows,
  );

  showFilterBatchModal.value = false;

  if (filterBatchActionKey.value === 'batch-force-reject') {
    if (rowsForOp.length === 0) {
      selectedIds.value = [];
      message.warning($t('finance.recordsHasEligibleActionsConditionsOrder'));
      return true;
    }
    if (rowsForOp.length < selectedRows.length) {
      selectedIds.value = rowsForOp.map((r) => String(r.id));
    }
    showForceRejectModalForBatch(rowsForOp);
    return true;
  }

  if (
    ['batch-force-cancel', 'batch-remark', 'batch-manual-withdrawal'].includes(
      filterBatchActionKey.value,
    )
  ) {
    if (rowsForOp.length === 0) {
      selectedIds.value = [];
      message.warning($t('finance.recordsHasEligibleActionsConditionsOrder'));
      return true;
    }
    if (rowsForOp.length < selectedRows.length) {
      selectedIds.value = rowsForOp.map((r) => String(r.id));
    }
    openBatchReasonModal(filterBatchActionKey.value, rowsForOp.map((r) => String(r.id)));
    return true;
  }

  if (filterBatchActionKey.value === 'batch-unlock') {
    if (rowsForOp.length === 0) {
      selectedIds.value = [];
      message.warning($t('finance.recordsHasEligibleActionsConditionsOrder'));
      return true;
    }
    if (rowsForOp.length < selectedRows.length) {
      selectedIds.value = rowsForOp.map((r) => String(r.id));
    }
    openBatchLockConfirmModal('batch-unlock', rowsForOp);
    return true;
  }

  if (filterBatchActionKey.value === 'batch-lock') {
    openBatchLockConfirmModal('batch-lock', selectedRows);
    return true;
  }

  const useFilteredForOrderIds = [
    'batch-approve',
    'batch-refresh-callback',
    'batch-repay',
  ].includes(filterBatchActionKey.value);
  const orderIds = useFilteredForOrderIds
    ? rowsForOp.map((r) => String(r.id))
    : selectedRows.map((r) => String(r.id));
  if (useFilteredForOrderIds) {
    if (rowsForOp.length === 0) {
      selectedIds.value = [];
      message.warning($t('finance.recordsHasEligibleActionsConditionsOrder'));
      return true;
    }
    if (rowsForOp.length < selectedRows.length) {
      selectedIds.value = rowsForOp.map((r) => String(r.id));
    }
  }

  await runFinanceBatchAction(
    filterBatchActionKey.value,
    orderIds,
    filterBatchReason.value,
  );
  return true;
}

// Dynamic game providers
interface AuditPlatform {
  key: string;
  label: string;
}

interface AvailableProvider {
  platformId: string;
  platformName: string;
  gameType: string;
  isEnabled: boolean;
  gameCount?: number;
}

const auditPlatforms = ref<AuditPlatform[]>([]);
const availableProviders = ref<AvailableProvider[]>([]);

// Game type filtering
const selectedGameType = ref('全部');
const gameTypeFilters = [
  { label: $t('finance.all1'), value: '全部' },
  { label: $t('finance.text2'), value: 'SLOT' },
  { label: $t('finance.text3'), value: 'LIVE' },
  { label: $t('finance.text4'), value: 'SPORTS' },
  { label: $t('finance.text5'), value: 'LOTTERY' },
  { label: $t('finance.text6'), value: 'CHESS_CARDS' },
  { label: $t('finance.text7'), value: 'ESPORTS' },
  { label: $t('finance.text8'), value: 'HUNTING' },
  { label: $t('finance.text9'), value: 'ARCADE' },
  { label: $t('finance.simulated'), value: 'SIMULATION' },
  { label: $t('finance.text10'), value: 'COCKFIGHT' },
  { label: $t('finance.text50'), value: 'BLOCKCHAIN' },
];

// Computed properties for the new UI
const filteredProviders = computed(() => {
  console.log('🔍 Filtering providers:', {
    selectedGameType: selectedGameType.value,
    totalProviders: availableProviders.value.length,
    gameTypes: availableProviders.value.map((p) => p.gameType),
  });

  if (selectedGameType.value === '全部') {
    return availableProviders.value;
  }
  const filtered = availableProviders.value.filter(
    (provider) => provider.gameType === selectedGameType.value,
  );

  console.log(
    `🎯 Filtered ${filtered.length} providers for ${selectedGameType.value}:`,
    filtered,
  );
  return filtered;
});

const selectedProviderCount = computed(() => {
  const selectedKeys = Object.keys(forceRejectModal.platforms).filter(
    (key) => key !== 'all' && forceRejectModal.platforms[key],
  );
  return selectedKeys.length;
});

const totalGamesCount = computed(() => {
  const selectedKeys = Object.keys(forceRejectModal.platforms).filter(
    (key) => key !== 'all' && forceRejectModal.platforms[key],
  );
  return selectedKeys.reduce((total, platformId) => {
    const provider = availableProviders.value.find(
      (p) => p.platformId === platformId,
    );
    return total + Number(provider?.gameCount ?? 0);
  }, 0);
});

// Fetch available game providers using the same API as promotion templates
const fetchAvailableProviders = async () => {
  try {
    console.log(
      '🎮 Loading game providers using getGamePlatformListApi (Finance)...',
    );
    const response = await getGamePlatformListApi({
      pageSize: 1000,
      isEnabled: true,
    });

    console.log('Platform API response (Finance):', response);

    if (response.list && response.list.length > 0) {
      availableProviders.value = response.list.map((platform) => ({
        platformId: platform.platformId,
        platformName: platform.platformName,
        gameType: platform.gameType,
        isEnabled: platform.isEnabled,
        gameCount: platform.subGameCount || 0,
      }));

      // Update audit platforms for backward compatibility
      auditPlatforms.value = availableProviders.value.map((provider) => ({
        key: provider.platformId,
        label: provider.platformName,
      }));

      console.log(
        '✅ Loaded game providers successfully (Finance):',
        availableProviders.value.length,
      );
      console.log(
        ' Sample providers (Finance):',
        availableProviders.value.slice(0, 5),
      );
      console.log('🎮 All game types found:', [
        ...new Set(availableProviders.value.map((p) => p.gameType)),
      ]);
    }
  } catch (error) {
    console.error('❌ Failed to fetch game providers (Finance):', error);
    // Fallback to static list if API fails
    auditPlatforms.value = [
      { key: 'PG', label: 'PG Soft' },
      { key: 'PP', label: 'Pragmatic Play' },
      { key: 'JILI', label: 'JILI Games' },
      { key: 'EVO', label: 'Evolution' },
      { key: 'POKER', label: $t('finance.text6') },
      { key: 'FISHING', label: $t('finance.text8') },
      { key: 'LIVE', label: $t('finance.text3') },
      { key: 'SPORTS', label: $t('finance.text4') },
    ];

    // Also populate availableProviders from fallback
    availableProviders.value = auditPlatforms.value.map((platform) => ({
      platformId: platform.key,
      platformName: platform.label,
      gameType: '',
      isEnabled: true,
    }));
  }
};

// Computed
const totalAmount = computed(() => {
  return tableData.value.reduce(
    (sum, item) => sum + (item.rewardAmount || 0),
    0,
  );
});

const selectedCount = computed(() => selectedIds.value.length);
const hasSelection = computed(() => selectedIds.value.length > 0);

const filteredAudits = computed(() => {
  if (!wageringModal.data?.pendingAudits) return [];

  if (wageringModal.filterType === 'all') {
    return wageringModal.data.pendingAudits;
  }

  return wageringModal.data.pendingAudits.filter(
    (audit) => audit.source === wageringModal.filterType,
  );
});

// Table columns based on screenshot
// Show member detail modal - pass memberId to existing UserDetailModal
const showMemberDetail = (row: WithdrawalRecord) => {
  console.log('👤 [CLICK] Member detail clicked:', {
    'row.memberId': row.memberId,
    'row.userID': row.userID,
    'typeof row.memberId': typeof row.memberId,
    'Number(row.memberId)': Number(row.memberId),
    'will pass to modal': Number(row.memberId),
  });

  // Validate memberId before opening modal
  const userId = Number(row.memberId);
  if (!userId || isNaN(userId) || userId === 0) {
    message.error($t('finance.noMemberId'));
    console.error('❌ Invalid memberId:', row.memberId);
    return;
  }

  // Use the internal database ID (memberId), not the 9-digit userID
  currentMemberUserId.value = userId;
  showMemberDetailModal.value = true;
};

const columns: DataTableColumns<WithdrawalRecord> = [
  {
    type: 'selection',
    fixed: 'left',
    width: 50,
  },
  // 1. 订单号
  {
    title: $t('finance.orderNo'),
    key: 'orderId',
    width: 140,
    fixed: 'left',
    render: (row) =>
      h('div', { class: 'space-y-1' }, [
        h(
          NButton,
          {
            text: true,
            type: 'primary',
            size: 'small',
            class: 'font-mono font-medium',
            onClick: () => showDetail(row),
          },
          { default: () => row.orderId },
        ),
        row.thirdPartyOrderNo &&
          h(
            'div',
            { class: 'text-xs text-gray-500 font-mono' },
            row.thirdPartyOrderNo,
          ),
      ]),
  },
  // 2. 会员ID / 会员账号 (VIP / 层级) — 上：ID+VIP，下：账号（电话）与层级
  {
    title: $t('finance.memberIdMemberAccountVIPTier'),
    key: 'memberId',
    width: 200,
    render: (row) =>
      h('div', { class: 'min-w-0 space-y-1 text-center' }, [
        h(
          'div',
          { class: 'flex flex-wrap items-center justify-center gap-1' },
          [
            h(
              NButton,
              {
                text: true,
                type: 'primary',
                size: 'small',
                class: 'font-mono font-medium',
                onClick: () => showMemberDetail(row),
              },
              {
                default: () =>
                  row.displayMemberId || row.userID || row.memberId,
              },
            ),
            h(
              NTag,
              { size: 'small', type: 'info' },
              { default: () => row.vipLevel || 'VIP0' },
            ),
          ],
        ),
        h(
          NButton,
          {
            text: true,
            type: 'primary',
            size: 'small',
            class: 'max-w-full whitespace-normal break-all font-medium',
            onClick: () => showMemberDetail(row),
          },
          {
            default: () => row.accountName || row.memberAccount,
          },
        ),
        h(
          'div',
          { class: 'text-xs text-gray-500' },
          row.memberTierName || '默认层级',
        ),
      ]),
  },
  // 3. 申请时间 (操作时间) (完成时长)
  {
    title: $t('finance.applicationTimeActionsTimeCompletionDuration'),
    key: 'appliedAt',
    width: 180,
    render: (row) =>
      h('div', { class: 'text-center space-y-1' }, [
        h(
          'div',
          { class: 'text-xs' },
          [renderTzDateTime(row.appliedAt || row.applicationTime)],
        ),
        h(
          'div',
          { class: 'text-xs text-gray-500' },
          [renderTzDateTime(row.updatedAt || row.completedTime)],
        ),
        h(
          'div',
          {
            class: 'text-xs font-medium',
            style: { color: row.processedTime !== '-' ? '#10b981' : '#9ca3af' },
          },
          row.processedTime || '-',
        ),
      ]),
  },
  // 4. 会员币种 (比例)
  {
    title: $t('finance.memberCurrencyRatio'),
    key: 'memberCurrency',
    width: 120,
    render: (row) =>
      h('div', { class: 'text-center space-y-1' }, [
        h('div', { class: 'font-medium' }, row.currency || 'BRL'),
        h(
          'div',
          { class: 'text-xs text-gray-500' },
          `(${row.exchangeRate || '0.05'})`,
        ),
      ]),
  },
  // 5. 提现金额 (当前余额)
  {
    title: $t('finance.withdrawalAmountBalance'),
    key: 'withdrawAmount',
    width: 140,
    render: (row) =>
      h('div', { class: 'text-center space-y-1' }, [
        h(
          'div',
          { class: 'font-semibold text-red-600' },
          formatCurrency(
            row.withdrawAmount || row.withdrawalAmount || row.amount,
          ),
        ),
        h(
          'div',
          { class: 'text-xs text-gray-500' },
          formatCurrency(row.currentBalance || row.beforeAmount || 0),
        ),
      ]),
  },
  // 6. 预计到帐 (手续费) (实际到账)
  {
    title: $t('finance.estimatedFeeActualReceived'),
    key: 'estimatedAmount',
    width: 160,
    render: (row) =>
      h('div', { class: 'text-center space-y-1' }, [
        h(
          'div',
          { class: 'text-xs font-semibold text-green-600' },
          formatCurrency(
            row.estimatedAmount ||
              row.estimatedReceived ||
              row.approvalAmount ||
              0,
          ),
        ),
        h(
          'div',
          { class: 'text-xs text-gray-500' },
          `手续费: ${formatCurrency(row.fee || row.fees || 0)}`,
        ),
        h(
          'div',
          { class: 'text-xs' },
          `实际: ${formatCurrency(row.estimatedReceived || row.estimatedAmount || row.approvalAmount || 0)}`,
        ),
        h('div', { class: 'flex gap-1 justify-center mt-2' }, [
          h(
            NButton,
            {
              size: 'tiny',
              type: 'info',
              onClick: () => {
                // Navigate to 投注任务(稽核) with user context
                window.location.href = `/finance/wagering-audit?userId=${row.memberId}`;
              },
            },
            { default: () => $t('finance.audit') },
          ),
          h(
            NButton,
            {
              size: 'tiny',
              type: 'primary',
              onClick: () => {
                // Navigate to 游戏 -> 投注记录 with user context
                window.location.href = `/game-management/bet-records?userId=${row.memberId}`;
              },
            },
            { default: () => $t('finance.wagering') },
          ),
        ]),
      ]),
  },
  // 7. 充 / 提次数 (累计充 / 提差额) (重复IP人数)
  {
    title: $t('finance.countCumulativeIP'),
    key: 'counts',
    width: 180,
    render: (row) => {
      const rechargeCount =
        row.rechargeWithdrawCount?.rechargeCount || row.depositCount || 0;
      const withdrawCount =
        row.rechargeWithdrawCount?.withdrawCount || row.withdrawalCount || 0;
      const totalDeposit = row.totalDeposit || 0;
      const totalWithdraw = row.totalWithdraw || 0;
      const difference = totalDeposit - totalWithdraw;
      const duplicateIP = row.rechargeWithdrawCount?.duplicateIP || 0;

      return h('div', { class: 'text-center space-y-1' }, [
        h(
          'div',
          { class: 'text-xs' },
          `充${rechargeCount} / 提${withdrawCount}次`,
        ),
        h(
          'div',
          {
            class: `text-xs font-medium ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`,
          },
          `差额: ${formatCurrency(difference)}`,
        ),
        h(
          'div',
          { class: 'text-xs text-orange-600' },
          `重复IP: ${duplicateIP}人`,
        ),
      ]);
    },
  },
  // 8. 收款方式 (收款人信息) - ✅ ENHANCED: Same as "全部提现" tab
  {
    title: $t('finance.receivingMethodPayeeInfo'),
    key: 'paymentMethod',
    width: 320,
    render: (row) => {
      // ✅ FIX: Fallback to row fields if withdrawChannelInfo is missing or empty
      const info = row.withdrawChannelInfo || {};
      const pixType =
        info.type || row.paymentMethod || row.withdrawMethod || 'PIX';

      // ✅ FIX: Check if info has meaningful data (not just empty strings)
      const hasInfoData =
        info.account || info.name || info.cpf || info.phone || info.email;

      // ✅ FIX: If withdrawChannelInfo is empty or has no meaningful data, try to build from row data
      const fallbackInfo = !hasInfoData
        ? {
            type: row.paymentMethod || row.withdrawMethod || info.type || 'PIX',
            accountType: row.accountType || info.accountType || '',
            name: row.accountHolderName || row.memberName || info.name || '',
            account:
              row.accountNumber ||
              row.memberBankAccount ||
              row.bankAccount ||
              info.account ||
              '',
            cpf: row.cpf || info.cpf || '',
            phone: row.accountPhone || info.phone || '',
            email: row.accountEmail || info.email || '',
            bankCode: row.bankName || row.memberBank || info.bankCode || '',
          }
        : {};

      // Merge fallback info with actual info (actual info takes precedence, but fallback fills gaps)
      const displayInfo = {
        type: info.type || fallbackInfo.type || pixType,
        accountType: info.accountType || fallbackInfo.accountType || '',
        name: info.name || fallbackInfo.name || '',
        account: info.account || fallbackInfo.account || '',
        cpf: info.cpf || fallbackInfo.cpf || '',
        phone: info.phone || fallbackInfo.phone || '',
        email: info.email || fallbackInfo.email || '',
        bankCode: info.bankCode || fallbackInfo.bankCode || '',
      };

      // Helper function to map accountType to display format
      const getAccountTypeDisplay = (accountType: string): string => {
        if (!accountType) return '';
        // Handle PIX_ prefix formats (e.g., PIX_PHONE -> PHONE)
        if (accountType.startsWith('PIX_')) {
          return accountType.replace('PIX_', '');
        }
        // Handle direct formats
        const typeMap: Record<string, string> = {
          CPF: 'CPF',
          PHONE: 'PHONE',
          EMAIL: 'EMAIL',
          RANDOM_KEY: 'RANDOM_KEY',
          CNPJ: 'CNPJ',
          EVP: 'EVP',
          BANK: 'BANK',
        };
        return typeMap[accountType] || accountType;
      };

      const accountType = displayInfo.accountType || displayInfo.type || '';
      const displayType = getAccountTypeDisplay(accountType);

      // Build copy all text - include type and CPF
      const copyAllText = [
        displayInfo.name ? `真实姓名：${displayInfo.name}` : '',
        displayInfo.account ? `账号/地址：${displayInfo.account}` : '',
        displayType ? `类型：${displayType}` : '',
        displayInfo.cpf ? `CPF：${displayInfo.cpf}` : '',
        displayInfo.phone ? `电话：${displayInfo.phone}` : '',
        displayInfo.email ? `邮箱：${displayInfo.email}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      // ✅ FIX: Show at least payment method type even if no other info
      if (!copyAllText && !displayInfo.account && !displayInfo.name) {
        return h('div', { class: 'bg-gray-50 p-2 rounded' }, [
          h('div', { class: 'font-semibold text-sm text-gray-600' }, pixType),
          h('div', { class: 'text-xs text-gray-400 mt-1' }, '暂无收款信息'),
        ]);
      }

      const copyAll = () => {
        if (copyAllText) {
          navigator.clipboard.writeText(copyAllText);
          message.success($t('finance.alreadyAllInfo'));
        }
      };

      const copyField = (value: string, label: string) => {
        navigator.clipboard.writeText(value);
        message.success(`已复制${label}`);
      };

      return h('div', { class: 'bg-gray-50 p-2 rounded space-y-1' }, [
        // Header with payment method and copy all button
        h('div', { class: 'flex items-center justify-between mb-2' }, [
          h('div', { class: 'font-semibold text-sm' }, pixType),
          copyAllText &&
            h(
              NButton,
              {
                text: true,
                type: 'primary',
                size: 'tiny',
                onClick: copyAll,
              },
              { default: () => $t('finance.all') },
            ),
        ]),
        // Name
        displayInfo.name &&
          h('div', { class: 'flex items-center justify-between text-xs' }, [
            h('span', { class: 'text-gray-600' }, '真实姓名：'),
            h('div', { class: 'flex items-center gap-1' }, [
              h('span', { class: 'font-medium' }, displayInfo.name),
              h(
                NButton,
                {
                  text: true,
                  size: 'tiny',
                  onClick: () => copyField(displayInfo.name, '真实姓名'),
                },
                {
                  default: () => h(NIcon, { size: 14, component: CopyOutline }),
                },
              ),
            ]),
          ]),
        // Account/Address
        displayInfo.account &&
          h('div', { class: 'flex items-center justify-between text-xs' }, [
            h('span', { class: 'text-gray-600' }, '账号/地址：'),
            h('div', { class: 'flex items-center gap-1' }, [
              h('span', { class: 'font-medium' }, displayInfo.account),
              h(
                NButton,
                {
                  text: true,
                  size: 'tiny',
                  onClick: () => copyField(displayInfo.account, '账号/地址'),
                },
                {
                  default: () => h(NIcon, { size: 14, component: CopyOutline }),
                },
              ),
            ]),
          ]),
        // Type (账户类型) - Always show if available
        displayType &&
          h('div', { class: 'flex items-center justify-between text-xs' }, [
            h('span', { class: 'text-gray-600' }, '类型：'),
            h('div', { class: 'flex items-center gap-1' }, [
              h('span', { class: 'font-medium' }, displayType),
              h(
                NButton,
                {
                  text: true,
                  size: 'tiny',
                  onClick: () => copyField(displayType, '类型'),
                },
                {
                  default: () => h(NIcon, { size: 14, component: CopyOutline }),
                },
              ),
            ]),
          ]),
        // CPF
        displayInfo.cpf &&
          h('div', { class: 'flex items-center justify-between text-xs' }, [
            h('span', { class: 'text-gray-600' }, 'CPF：'),
            h('div', { class: 'flex items-center gap-1' }, [
              h('span', { class: 'font-medium' }, displayInfo.cpf),
              h(
                NButton,
                {
                  text: true,
                  size: 'tiny',
                  onClick: () => copyField(displayInfo.cpf, 'CPF'),
                },
                {
                  default: () => h(NIcon, { size: 14, component: CopyOutline }),
                },
              ),
            ]),
          ]),
        // Phone
        displayInfo.phone &&
          h('div', { class: 'flex items-center justify-between text-xs' }, [
            h('span', { class: 'text-gray-600' }, '电话：'),
            h('div', { class: 'flex items-center gap-1' }, [
              h('span', { class: 'font-medium' }, displayInfo.phone),
              h(
                NButton,
                {
                  text: true,
                  size: 'tiny',
                  onClick: () => copyField(displayInfo.phone, '电话'),
                },
                {
                  default: () => h(NIcon, { size: 14, component: CopyOutline }),
                },
              ),
            ]),
          ]),
        // Email
        displayInfo.email &&
          h('div', { class: 'flex items-center justify-between text-xs' }, [
            h('span', { class: 'text-gray-600' }, '邮箱：'),
            h('div', { class: 'flex items-center gap-1' }, [
              h('span', { class: 'font-medium' }, displayInfo.email),
              h(
                NButton,
                {
                  text: true,
                  size: 'tiny',
                  onClick: () => copyField(displayInfo.email, '邮箱'),
                },
                {
                  default: () => h(NIcon, { size: 14, component: CopyOutline }),
                },
              ),
            ]),
          ]),
      ]);
    },
  },
  // 9. 操作（位于订单状态 / 操作人之前，与全部提现一致）
  {
    title: $t('common.actions'),
    key: 'actions',
    width: 200,
    render: (row) => {
      const actions = [];

      // For 风控审核 and 财务出款 states: only show lock/unlock until locked
      const isRiskOrFinanceState = [
        'pending',
        'reviewing',
        'risk_review_required',
        'finance_pending',
      ].includes(row.status);

      if (isRiskOrFinanceState) {
        // 🎯 FIX: Only show lock/unlock for pending/processing statuses
        const canLockUnlock = [
          'pending',
          'reviewing',
          'processing',
          'risk_review',
        ].includes(row.status);

        if (canLockUnlock) {
          actions.push(
            h(
              NButton,
              {
                size: 'small',
                type: row.isLocked ? 'warning' : 'default',
                onClick: () =>
                  row.isLocked ? unlockOrder(row) : lockOrder(row),
              },
              {
                default: () => {
                  if (row.isLocked) {
                    return row.lockedBy ? `解锁 (${row.lockedBy})` : '解锁';
                  } else {
                    return '锁定';
                  }
                },
              },
            ),
          );
        }

        // Show other actions only when record is locked
        if (row.isLocked) {
          actions.push(
            // Approve withdrawal - 审核出款
            h(
              NButton,
              {
                size: 'small',
                type: 'success',
                onClick: () => showApproveWithdrawalModal(row),
              },
              { default: () => $t('finance.reviewPayout') },
            ),

            // Manual withdrawal - 已人工出款
            h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                onClick: () => showManualWithdrawalModal(row),
              },
              { default: () => $t('finance.manualPayoutDone') },
            ),

            // Force Cancel - 强制取消
            h(
              NButton,
              {
                size: 'small',
                type: 'warning',
                onClick: () => showForceCancelModal(row),
              },
              { default: () => $t('finance.cancel') },
            ),

            // Force Reject - 强制拒绝
            h(
              NButton,
              {
                size: 'small',
                type: 'error',
                onClick: () => showForceRejectModal(row),
              },
              { default: () => $t('finance.text65') },
            ),

            // Notes - Only show if locked
            ...(row.isLocked
              ? [
                  h(
                    NButton,
                    {
                      size: 'small',
                      type: 'info',
                      onClick: () => showNotesModal(row),
                    },
                    { default: () => $t('common.remark') },
                  ),
                ]
              : []),
          );
        }
      } else {
        // For other states, show all actions
        // 🎯 FIX: Only show lock/unlock for pending/processing statuses
        const canLockUnlock = [
          'pending',
          'reviewing',
          'processing',
          'risk_review',
        ].includes(row.status);

        if (canLockUnlock) {
          actions.push(
            h(
              NButton,
              {
                size: 'small',
                type: row.isLocked ? 'warning' : 'default',
                onClick: () =>
                  row.isLocked ? unlockOrder(row) : lockOrder(row),
              },
              {
                default: () => {
                  if (row.isLocked) {
                    return row.lockedBy ? `解锁 (${row.lockedBy})` : '解锁';
                  } else {
                    return '锁定';
                  }
                },
              },
            ),
          );
        }

        // Other action buttons - Only show approve/reject buttons for pending withdrawals
        actions.push(
          ...(canApprove(row.status)
            ? [
                h(
                  NButton,
                  {
                    size: 'small',
                    type: 'success',
                    onClick: () => showSingleApproveModal(row),
                  },
                  { default: () => $t('finance.text13') },
                ),
              ]
            : []),
          ...(canReject(row.status)
            ? [
                h(
                  NButton,
                  {
                    size: 'small',
                    type: 'error',
                    onClick: () => showSingleRejectModal(row),
                  },
                  { default: () => $t('finance.text14') },
                ),
              ]
            : []),
          // Notes - Only show if locked
          ...(row.isLocked
            ? [
                h(
                  NButton,
                  {
                    size: 'small',
                    type: 'info',
                    onClick: () => showNotesModal(row),
                  },
                  { default: () => $t('common.remark') },
                ),
              ]
            : []),
        );
      }

      return h(
        'div',
        { class: 'flex gap-1 flex-wrap justify-center' },
        actions,
      );
    },
  },
  // 10. 订单状态 (操作人)
  {
    title: $t('finance.orderStatusActions'),
    key: 'status',
    width: 140,
    render: (row) => {
      const statusMap = {
        unlocked: { type: 'default', text: '未锁定' },
        pending: { type: 'warning', text: '待出款' },
        reviewing: { type: 'info', text: '审核中' },
        // Third-party paid / completed
        paid: { type: 'success', text: '已出款' },
        completed: { type: 'success', text: '已出款' },
        success: { type: 'success', text: '已出款' },
        // Admin approval (not third-party paid)
        approved: { type: 'success', text: '已人工' },
        processing: { type: 'info', text: '处理中' },
        rejected: { type: 'error', text: '已拒绝' },
        failed: { type: 'error', text: '失败' },
        cancelled: { type: 'default', text: '已取消' },
        canceled: { type: 'default', text: '已取消' },
        risk_review: { type: 'warning', text: '风控审核' },
      };
      const statusKey = String(row.status ?? '').toLowerCase();
      let status = statusMap[statusKey as keyof typeof statusMap] || {
        type: 'default',
        text: row.status,
      };
      if (statusKey === 'paid') {
        status = { ...status, text: '已出款' };
      }

      const isManual =
        (row.paymentGateway || row.thirdPartyProvider || '').toLowerCase() ===
        'manual';
      const hasThirdPartyOrderNo = !!(row as any).thirdPartyOrderNo;
      if (
        isManual &&
        !hasThirdPartyOrderNo &&
        ['completed', 'success'].includes(statusKey)
      ) {
        status = { ...status, text: '已人工' };
      }

      // 🎯 NEW: Operator name display logic
      let operatorDisplay = '';
      const systemHintText = [
        (row as any).systemNotes,
        (row as any).notes,
        row.description,
        (row as any).frontendNote,
        (row as any).financeNote,
        (row as any).metadata?.processType,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const isSystemAuto =
        (row as any).operator === 'system' ||
        (row as any).metadata?.processType === 'auto_withdrawal' ||
        /auto[_\s-]*approved/i.test(systemHintText) ||
        /auto\s*withdrawal\s*processed/i.test(systemHintText);

      if (isSystemAuto) {
        operatorDisplay = '系统';
      } else if (row.reviewer || row.operator) {
        // If reviewer/operator exists, show it
        operatorDisplay = row.reviewer || row.operator;
      } else if (row.isLocked && row.lockedBy) {
        // If locked, show who locked it
        operatorDisplay = row.lockedBy;
      } else if (row.isLocked === false || !row.lockedBy) {
        // If not locked, show "未锁定"
        operatorDisplay = '未锁定';
      }

      return h('div', { class: 'text-center space-y-1' }, [
        h(
          NTag,
          { type: status.type as any, size: 'small' },
          { default: () => status.text },
        ),
        operatorDisplay &&
          h('div', { class: 'text-xs text-gray-500' }, operatorDisplay),
      ]);
    },
  },
  // 11. 前台备注（长备注自动换行便于阅读）
  {
    title: $t('finance.frontendRemark'),
    key: 'frontendNotes',
    width: 150,
    render: (row) => {
      const frontendNote = row.frontendNotes || row.frontendNote || '';
      return h('div', { class: 'text-xs min-w-0 remark-cell-content' }, [
        frontendNote
          ? h('div', { class: 'text-gray-700 break-words whitespace-normal' }, frontendNote)
          : h('span', { class: 'text-gray-400 text-center' }, '-'),
      ]);
    },
  },
  // 12. 后台备注
  {
    title: $t('finance.backendRemark'),
    key: 'backendNotes',
    width: 200,
    render: (row) => {
      const backendNote =
        row.backendNotes ||
        row.backendNote ||
        row.description ||
        row.notes ||
        '';
      const hasError =
        row.status === 'failed' ||
        row.status === 'rejected' ||
        (backendNote &&
          (backendNote.toLowerCase().includes('error') ||
            backendNote.toLowerCase().includes('failed') ||
            backendNote.toLowerCase().includes('错误') ||
            backendNote.toLowerCase().includes('失败')));

      return h('div', { class: 'text-xs min-w-0 remark-cell-content' }, [
        backendNote
          ? h('div', { class: hasError ? 'space-y-1' : '' }, [
              hasError && h('div', { class: 'text-red-500' }, '错误信息：'),
              h(
                'div',
                { class: `${hasError ? 'text-red-600' : 'text-gray-700'} break-words whitespace-normal` },
                backendNote,
              ),
            ])
          : h('span', { class: 'text-gray-400 text-center' }, '-'),
      ]);
    },
  },
  // 13. 三方备注
  {
    title: $t('finance.thirdPartyRemark'),
    key: 'thirdPartyNotes',
    width: 200,
    render: (row) => {
      const thirdPartyNote =
        row.thirdPartyNotes || row.thirdPartyError || row.gatewayError || '';
      const hasError =
        thirdPartyNote &&
        (thirdPartyNote.toLowerCase().includes('error') ||
          thirdPartyNote.toLowerCase().includes('failed') ||
          thirdPartyNote.toLowerCase().includes('拒绝') ||
          thirdPartyNote.toLowerCase().includes('错误') ||
          thirdPartyNote.toLowerCase().includes('失败'));

      return h('div', { class: 'text-xs min-w-0 remark-cell-content' }, [
        thirdPartyNote
          ? h('div', { class: 'space-y-1' }, [
              h('div', { class: 'text-orange-500 text-xs' }, '三方响应：'),
              h(
                'div',
                { class: `${hasError ? 'text-red-600' : 'text-gray-700'} break-words whitespace-normal` },
                thirdPartyNote,
              ),
            ])
          : h('span', { class: 'text-gray-400 text-center' }, '-'),
      ]);
    },
  },
  // 14. 三方代付 (代付次数)
  {
    title: $t('finance.thirdPartyPayoutPayoutCount'),
    key: 'thirdPartyPayment',
    width: 160,
    render: (row) => {
      const gateway = row.paymentGateway || row.thirdPartyProvider || 'Pay4z';
      let displayName = gateway;

      // 🎯 NEW: Chinese translations for gateway names
      if (gateway.toLowerCase() === 'manual') {
        displayName = '人工出款';
      } else if (
        gateway.toLowerCase() === 'auto_system' ||
        gateway === 'auto_system'
      ) {
        displayName = '免审出款';
      }

      return h('div', { class: 'text-center space-y-1' }, [
        h('div', { class: 'font-medium text-xs' }, displayName),
        h(
          'div',
          { class: 'text-xs text-gray-500' },
          `代付次数: ${row.withdrawCount || row.withdrawalCount || row.refreshCount || 1}`,
        ),
      ]);
    },
  },
];

// Helper functions
const getCurrentUser = () => {
  // Get current user from authentication store
  const userInfo = userStore.userInfo;
  if (userInfo) {
    // Use username or id from actual user store
    return (
      userInfo.username || userInfo.userId || userInfo.id?.toString() || 'admin'
    );
  }

  // Fallback to admin for development/testing (matches backend)
  return 'admin';
};

const lockOrder = async (row: WithdrawalRecord) => {
  try {
    const response = await financeWithdrawalApi.lockWithdrawal(row.id, 'lock');

    console.log('🔍 Lock response:', response);

    // Check if response has success property or if it's directly successful
    if (response && (response.success === true || response.message)) {
      message.success(response.message || `订单 ${row.orderId} 已锁定`);
      // Refresh data to show updated lock status and move to "由我出款" tab
      await fetchData();
      // Emit event to refresh other tabs
      emit('refresh-tabs');
    } else {
      console.warn('Unexpected response format:', response);
      message.error(response?.message || '锁定失败');
    }
  } catch (error: any) {
    console.error('Lock order error:', error);
    console.error('Error details:', error.response?.data);
    message.error(error.response?.data?.message || error.message || '锁定失败');
  }
};

const unlockOrder = async (row: WithdrawalRecord) => {
  try {
    const response = await financeWithdrawalApi.lockWithdrawal(
      row.id,
      'unlock',
    );

    console.log('🔍 Unlock response:', response);

    // Check if response has success property or if it's directly successful
    if (response && (response.success === true || response.message)) {
      message.success(response.message || `订单 ${row.orderId} 已解锁`);
      // Refresh data to show updated lock status
      await fetchData();
      // Emit event to refresh other tabs
      emit('refresh-tabs');
    } else {
      console.warn('Unexpected response format:', response);
      message.error(response?.message || '解锁失败');
    }
  } catch (error: any) {
    console.error('Unlock order error:', error);
    console.error('Error details:', error.response?.data);
    message.error(error.response?.data?.message || error.message || '解锁失败');
  }
};

const showReviewWithdrawalModal = (row: WithdrawalRecord) => {
  // TODO: Implement review withdrawal modal with third-party selection
  message.info($t('finance.reviewPayoutFeatureInDevelopment'));
};

const showForceWithdrawalModal = (row: WithdrawalRecord) => {
  dialog.warning({
    title: $t('finance.payoutConfirm'),
    content: `确认强制出款订单 ${row.orderId}？此操作将把状态改为"已强制出款"，请谨慎操作！`,
    positiveText: $t('finance.confirmPayout1'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      try {
        row.status = 'force_withdrawn';
        message.success($t('finance.payoutSuccess1'));
      } catch (error) {
        message.error($t('finance.payoutFailed1'));
      }
    },
  });
};

const showForceFailureModal = (row: WithdrawalRecord) => {
  dialog.warning({
    title: $t('finance.failedConfirm'),
    content: `确认强制失败订单 ${row.orderId}？此操作将把状态改为"付款失败"，请谨慎操作！`,
    positiveText: $t('finance.confirmFailed1'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      try {
        row.status = 'payment_failed';
        message.success($t('finance.failedSuccess'));
      } catch (error) {
        message.error($t('finance.failedActionsFailed'));
      }
    },
  });
};

const showReWithdrawalModal = (row: WithdrawalRecord) => {
  dialog.info({
    title: $t('finance.rePayoutConfirm'),
    content: `确认重新出款订单 ${row.orderId}？此操作将把状态改为"待出款"，请谨慎操作！`,
    positiveText: $t('finance.confirmRePayout'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      try {
        row.status = 'finance_pending';
        message.success($t('finance.rePayoutSettingsSuccess'));
      } catch (error) {
        message.error($t('finance.rePayoutSettingsFailed'));
      }
    },
  });
};

const showManualWithdrawalModal = (row: WithdrawalRecord) => {
  dialog.warning({
    title: $t('finance.manualPayoutConfirm'),
    content: () =>
      h('div', [
        h('div', { class: 'mb-3' }, `确认人工出款订单 ${row.orderId}？`),
        h(
          'div',
          { class: 'text-sm text-gray-600 mb-2' },
          `提现金额: ${row.amount} ${row.currency}`,
        ),
        h(
          'div',
          { class: 'text-sm text-gray-600 mb-2' },
          `会员账号: ${row.memberAccount}`,
        ),
        h(
          'div',
          { class: 'text-orange-600 text-sm font-medium' },
          '⚠️ 此操作将直接标记为已完成，不调用第三方支付接口',
        ),
        h(
          'div',
          { class: 'text-red-600 text-sm mt-2' },
          '请确保已通过其他方式完成实际转账！',
        ),
      ]),
    positiveText: $t('finance.confirmManualPayout'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      try {
        const response = await financeWithdrawalApi.manualWithdrawal(row.id);

        if (response.success) {
          message.success($t('finance.manualPayoutSuccess1'));
          // Refresh data to show updated status
          await fetchData();
          // Emit event to refresh other tabs
          emit('refresh-tabs');
        } else {
          message.error(response.message || '人工出款失败');
        }
      } catch (error: any) {
        console.error('Manual withdrawal error:', error);
        message.error(error.response?.data?.message || '人工出款失败');
      }
    },
  });
};

const refreshOrderStatus = async (row: WithdrawalRecord) => {
  try {
    // TODO: Implement actual status refresh API call
    const refreshResults = [
      '刷新成功',
      '该三方代付不支持刷新',
      '每3分钟才能刷新一次',
      '刷新失败',
    ];
    const result =
      refreshResults[Math.floor(Math.random() * refreshResults.length)];

    if (result === '刷新成功') {
      message.success(result);
    } else if (result === '刷新失败') {
      message.error(result);
    } else {
      message.warning(result || '未知结果');
    }
  } catch (error) {
    message.error($t('finance.refreshStatusFailed'));
  }
};

// Notes Modal State
const notesModal = reactive({
  show: false,
  loading: false,
  data: null as WithdrawalRecord | null,
  noteType: 'backend' as 'frontend' | 'backend' | 'system',
  noteContent: '',
});

const noteTypeOptions = [
  { label: $t('finance.backendRemark'), value: 'backend' },
  { label: $t('finance.frontendRemark'), value: 'frontend' },
  { label: $t('finance.systemRemark'), value: 'system' },
];

const showNotesModal = (row: WithdrawalRecord) => {
  notesModal.data = row;

  // Determine note type and content based on existing notes
  let noteType: 'frontend' | 'backend' | 'system' = 'backend';
  let noteContent = '';

  if (row.frontendNotes || row.frontendNote) {
    noteType = 'frontend';
    noteContent = row.frontendNotes || row.frontendNote || '';
  } else if (row.backendNotes || row.backendNote) {
    noteType = 'backend';
    noteContent = row.backendNotes || row.backendNote || row.description || '';
  } else if (row.systemNotes) {
    noteType = 'system';
    noteContent = row.systemNotes || '';
  }

  notesModal.noteType = noteType;
  notesModal.noteContent = noteContent;
  notesModal.show = true;
};

// Watch for note type changes and update content accordingly
watch(
  () => notesModal.noteType,
  (newType) => {
    if (!notesModal.data || !notesModal.show) return;

    const row = notesModal.data;

    // Update content based on selected type
    if (newType === 'frontend') {
      notesModal.noteContent = row.frontendNotes || row.frontendNote || '';
    } else if (newType === 'backend') {
      notesModal.noteContent =
        row.backendNotes || row.backendNote || row.description || '';
    } else if (newType === 'system') {
      notesModal.noteContent = row.systemNotes || '';
    }
  },
);

const handleSaveNotes = async () => {
  if (!notesModal.data) return;

  try {
    notesModal.loading = true;

    // Map note type to correct field names
    const noteData: any = {};
    if (notesModal.noteType === 'frontend') {
      noteData.frontendNotes = notesModal.noteContent;
    } else if (notesModal.noteType === 'backend') {
      noteData.backendNotes = notesModal.noteContent;
    } else if (notesModal.noteType === 'system') {
      noteData.systemNotes = notesModal.noteContent;
    }

    console.log('💾 Saving notes:', {
      orderId: notesModal.data.orderId,
      noteData,
    });

    // Call API to update notes - use orderId (trxId) instead of internal id
    const response = await financeWithdrawalApi.updateNote(
      notesModal.data.orderId,
      noteData,
    );

    console.log('✅ API Response:', response);

    // Response interceptor returns the data directly, so if we have a trxId, it's successful
    const isSuccess = response && (response.trxId || response.success === true);

    if (isSuccess) {
      console.log('✅ Update successful, updating table data...');

      // Update local table data immediately with the returned data
      if (notesModal.data) {
        console.log('🔍 Looking for order:', notesModal.data.orderId);
        console.log('🔍 Table data length:', tableData.value.length);

        const rowIndex = tableData.value.findIndex(
          (r) => r.orderId === notesModal.data!.orderId,
        );
        console.log('📍 Found row at index:', rowIndex);

        if (rowIndex !== -1) {
          // Response interceptor returns data directly, so response IS the data
          const responseData = response;

          console.log('💾 Updating row with data:', {
            noteData,
            responseData: {
              frontendNotes: responseData.frontendNotes,
              backendNotes: responseData.backendNotes,
              systemNotes: responseData.systemNotes,
            },
          });

          // Create a new object to ensure reactivity
          const updatedRow = { ...tableData.value[rowIndex] };

          if (noteData.frontendNotes !== undefined) {
            updatedRow.frontendNotes =
              responseData.frontendNotes || noteData.frontendNotes;
            updatedRow.frontendNote =
              responseData.frontendNotes || noteData.frontendNotes;
          }
          if (noteData.backendNotes !== undefined) {
            updatedRow.backendNotes =
              responseData.backendNotes || noteData.backendNotes;
            updatedRow.backendNote =
              responseData.backendNotes || noteData.backendNotes;
          }
          if (noteData.systemNotes !== undefined) {
            updatedRow.systemNotes =
              responseData.systemNotes || noteData.systemNotes;
          }

          // Replace the entire row object to ensure Vue detects the change
          tableData.value[rowIndex] = updatedRow;

          console.log('✅ Updated row:', {
            frontendNotes: updatedRow.frontendNotes,
            backendNotes: updatedRow.backendNotes,
            systemNotes: updatedRow.systemNotes,
          });
        } else {
          console.error('❌ Row not found in table data!');
        }
      }

      message.success($t('finance.remarkUpdateSuccessful'));
      notesModal.show = false;

      // Force table to re-render by creating a new array reference
      tableData.value = [...tableData.value];

      // Refresh data from server
      console.log('🔄 Refreshing data from server...');
      await fetchData();
    } else {
      const errorMsg = response?.message || '备注更新失败';
      console.error('❌ Update failed:', errorMsg, response);
      message.error(errorMsg);
    }
  } catch (error: any) {
    console.error('❌ Update notes error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response,
      data: error.response?.data,
    });
    message.error(
      error.response?.data?.message || error.message || '备注更新失败',
    );
  } finally {
    notesModal.loading = false;
  }
};

// Force Cancel Modal Functions
const showForceCancelModal = (row: WithdrawalRecord) => {
  console.log('强制取消 button clicked', row);
  forceCancelModal.data = row;
  forceCancelModal.frontendReason = '';
  forceCancelModal.backendReason = '';
  forceCancelModal.show = true;
  console.log('Force cancel modal should show:', forceCancelModal.show);
};

const handleForceCancel = async () => {
  if (!forceCancelModal.data) return;

  try {
    forceCancelModal.loading = true;

    // Call API to force cancel withdrawal
    const response = await financeWithdrawalApi.forceCancel(
      forceCancelModal.data.id,
      {
        frontendReason: forceCancelModal.frontendReason,
        backendReason: forceCancelModal.backendReason,
      },
    );

    if (response.success) {
      message.success($t('finance.cancelSuccessWithdrawalAmountAlreadyRefundMember'));
      forceCancelModal.show = false;
      await fetchData();
      emit('refresh-tabs');
    } else {
      message.error(response.message || '强制取消失败');
    }
  } catch (error: any) {
    console.error('Force cancel error:', error);
    message.error(error.response?.data?.message || '强制取消失败');
  } finally {
    forceCancelModal.loading = false;
  }
};

const handleForceReject = async () => {
  const batchIds = forceRejectModal.batchOrderIds;
  const singleId = forceRejectModal.data?.id;
  const ids: string[] =
    batchIds && batchIds.length > 0 ? batchIds : singleId ? [singleId] : [];
  if (ids.length === 0) return;

  try {
    forceRejectModal.loading = true;

    let auditTaskData:
      | {
          multiplier: number;
          platforms: { [key: string]: boolean };
          selectedPlatform: string;
        }
      | undefined;
    if (forceRejectModal.windControlProcess === 'add_audit') {
      auditTaskData = {
        multiplier: forceRejectModal.auditMultiplier,
        platforms: forceRejectModal.platforms,
        selectedPlatform: forceRejectModal.selectedPlatform,
      };
    }

    const payload = {
      windControlProcess: forceRejectModal.windControlProcess,
      auditTask: auditTaskData,
      frontendReason: forceRejectModal.frontendReason,
      backendReason: forceRejectModal.backendReason,
    };

    if (ids.length > 1) {
      let ok = 0;
      for (const id of ids) {
        try {
          const res = await financeWithdrawalApi.forceReject(id, payload);
          if (res?.success !== false) ok++;
        } catch (_) {
          /* skip */
        }
      }
      message[ok === ids.length ? 'success' : 'warning'](
        ok === ids.length
          ? `批量强制拒绝成功 (${ok} 条)`
          : `部分成功 ${ok}/${ids.length} 条`,
      );
      forceRejectModal.batchOrderIds = null;
      forceRejectModal.show = false;
      await fetchData();
      emit('refresh-tabs');
      return;
    }

    const firstId = ids[0];
    if (!firstId) return;
    const response = await financeWithdrawalApi.forceReject(firstId, payload);

    if (response.success) {
      let successMessage = '强制拒绝成功';
      if (forceRejectModal.windControlProcess === 'add_audit') {
        successMessage += '，已添加稽核任务';
      } else if (forceRejectModal.windControlProcess === 'deduct_balance') {
        successMessage += '，已扣除余额';
      }
      message.success(successMessage);
      forceRejectModal.show = false;
      forceRejectModal.batchOrderIds = null;
      await fetchData();
      emit('refresh-tabs');
    } else {
      message.error(response.message || '强制拒绝失败');
    }
  } catch (error: any) {
    console.error('Force reject error:', error);
    message.error(error.response?.data?.message || '强制拒绝失败');
  } finally {
    forceRejectModal.loading = false;
  }
};

// Force Reject Modal Functions
const showForceRejectModal = (row: WithdrawalRecord) => {
  console.log('强制拒绝 button clicked (Finance)', row);
  forceRejectModal.data = row;
  forceRejectModal.batchOrderIds = null;
  forceRejectModal.windControlProcess = 'no';
  forceRejectModal.auditMultiplier = 1;
  forceRejectModal.selectedPlatform =
    availableProviders.value[0]?.platformId || 'PG';

  const newPlatforms: Record<string, boolean> = { all: true };
  availableProviders.value.forEach((provider) => {
    newPlatforms[provider.platformId] = true;
  });
  forceRejectModal.platforms = newPlatforms;

  forceRejectModal.frontendReason = '';
  forceRejectModal.backendReason = '';
  forceRejectModal.show = true;
};

/** Open Force Reject modal in batch mode - 表格弹窗（与参考图一致） */
const showForceRejectModalForBatch = (rows: WithdrawalRecord[]) => {
  if (rows.length === 0) return;
  const next: Record<string, BatchForceRejectRowItem> = {};
  rows.forEach((r) => {
    next[r.id] = {
      windControlProcess: 'no',
      auditMultiplier: 1,
      deductAmount: 0,
      frontendReason: '',
      backendReason: '',
    };
  });
  batchForceRejectRowData.value = next;
  batchForceRejectBulk.windControlProcess = 'no';
  batchForceRejectBulk.auditMultiplier = 1;
  batchForceRejectBulk.frontendReason = '';
  batchForceRejectBulk.backendReason = '';
  const platforms: Record<string, boolean> = {};
  availableProviders.value.forEach((p) => {
    platforms[p.platformId] = true;
  });
  batchForceRejectPlatforms.value = platforms;
  batchForceRejectModal.value = { show: true, loading: false, rows };
};

// Provider selection handlers for force reject modal
const handleProviderSelection = () => {
  // Update 'all' checkbox based on individual selections
  const selectedCount = Object.values(forceRejectModal.platforms).filter(
    (selected) => selected && typeof selected === 'boolean',
  ).length;
  forceRejectModal.platforms.all =
    selectedCount === availableProviders.value.length;
};

const handleSelectAllProviders = (checked: boolean) => {
  forceRejectModal.platforms.all = checked;
  // Update individual provider selections
  availableProviders.value.forEach((provider) => {
    forceRejectModal.platforms[provider.platformId] = checked;
  });
};

const toggleProviderSelection = (platformId: string) => {
  forceRejectModal.platforms[platformId] =
    !forceRejectModal.platforms[platformId];
  handleProviderSelection();
};

const updateProviderSelection = (platformId: string, checked: boolean) => {
  forceRejectModal.platforms[platformId] = checked;
  handleProviderSelection();
};

// Approve Withdrawal Modal Functions
const showApproveWithdrawalModal = async (row: WithdrawalRecord) => {
  approveWithdrawalModal.data = row;
  approveWithdrawalModal.show = true;
  approveWithdrawalModal.loading = true;

  try {
    const { riskControlApi } = await import('#/api/finance/riskControl');
    const detailResponse = await riskControlApi.getWithdrawalDetails(row.id);

    if (detailResponse.success && detailResponse.data) {
      approveWithdrawalModal.data = {
        ...row,
        ...detailResponse.data.withdrawal,
        memberInfo: detailResponse.data.memberInfo,
        bettingStatistics: detailResponse.data.bettingStatistics,
        riskAssessment: detailResponse.data.riskAssessment,
      };
    }
  } catch (error) {
    console.error('Failed to fetch withdrawal details:', error);
  } finally {
    approveWithdrawalModal.loading = false;
  }
};

const handleApproveWithdrawal = async () => {
  if (!approveWithdrawalModal.data) return;

  try {
    approveWithdrawalModal.loading = true;

    // Call API to approve withdrawal for processing
    const response = await financeWithdrawalApi.approveWithdrawal(
      approveWithdrawalModal.data.id,
    );

    if (response.success) {
      message.success($t('finance.reviewPayoutSuccessOrderAlreadyProcessPendingThirdPartyProcess'));
      approveWithdrawalModal.show = false;

      // 🚀 Update item status to processing (will remain visible until third-party completes)
      // Once third-party responds (success/failed), it will disappear from the tab automatically
      const withdrawalId = approveWithdrawalModal.data.id;
      const item = tableData.value.find((item) => item.id === withdrawalId);
      if (item) {
        item.status = 'processing'; // Status stays as processing, buttons won't show anymore
      }

      // Refresh data to sync with backend
      await fetchData();

      // Emit refresh event for tab counts
      emit('refresh-tabs');
    } else {
      message.error(response.message || '审核出款失败');
    }
  } catch (error: any) {
    console.error('Approve withdrawal error:', error);
    message.error(error.response?.data?.message || '审核出款失败');
  } finally {
    approveWithdrawalModal.loading = false;
  }
};

const showWageringModal = (wageringData: any) => {
  wageringModal.data = wageringData;
  wageringModal.filterType = 'all';
  wageringModal.show = true;
};

const goToBetting = () => {
  // Close the modal first
  wageringModal.show = false;

  // Navigate to betting/games page
  // You can customize this URL based on your game routing
  window.open('/games', '_blank');

  // Or use Vue router if you prefer internal navigation
  // router.push('/games');
};

// SmartDataGrid event handlers
const handlePageChange = (page: number) => {
  paginationReactive.page = page;
  fetchData();
};

const handlePageSizeChange = (pageSize: number) => {
  paginationReactive.pageSize = pageSize;
  paginationReactive.page = 1;
  fetchData();
};

const handleRowClick = (_row: WithdrawalRecord) => {
  // console.log('Row clicked:', row);
};

const clearSelection = () => {
  selectedIds.value = [];
};

const selectAll = () => {
  selectedIds.value = tableData.value.map((row) => row.id);
};

// 全选当前页
const currentPageOrderIds = computed(() =>
  tableData.value.map((row) => row.id),
);
const isAllCurrentPageSelected = computed(() => {
  const ids = currentPageOrderIds.value;
  if (ids.length === 0) return false;
  return ids.every((id) => selectedIds.value.includes(id));
});
const isCurrentPageIndeterminate = computed(() => {
  const ids = currentPageOrderIds.value;
  if (ids.length === 0) return false;
  const selected = ids.filter((id) => selectedIds.value.includes(id));
  return selected.length > 0 && selected.length < ids.length;
});
const toggleSelectAllCurrentPage = (checked: boolean) => {
  if (checked) {
    selectedIds.value = [
      ...new Set([...selectedIds.value, ...currentPageOrderIds.value]),
    ];
  } else {
    const pageSet = new Set(currentPageOrderIds.value);
    selectedIds.value = selectedIds.value.filter((id) => !pageSet.has(id));
  }
};

// 批量强制取消/批量备注：每行原因或备注
type BatchModalRowItem = {
  backendReason?: string;
  backendNotes?: string;
  frontendReason?: string;
  frontendNotes?: string;
};
const batchModalRowData = ref<Record<string, BatchModalRowItem>>({});
const batchBulkFrontend = ref('');
const batchBulkBackend = ref('');

const batchReasonModal = ref<{
  show: boolean;
  loading?: boolean;
  actionKey: string;
  orderIds: string[];
  rows: WithdrawalRecord[];
  reason: string;
}>({
  show: false,
  loading: false,
  actionKey: '',
  orderIds: [],
  rows: [],
  reason: '',
});

// 批量锁定/批量解锁确认弹窗
const batchLockConfirmModal = ref<{
  show: boolean;
  loading?: boolean;
  actionKey: 'batch-lock' | 'batch-unlock';
  rows: WithdrawalRecord[];
}>({
  show: false,
  loading: false,
  actionKey: 'batch-lock',
  rows: [],
});

function openBatchLockConfirmModal(actionKey: 'batch-lock' | 'batch-unlock', rows: WithdrawalRecord[]) {
  if (actionKey === 'batch-lock') {
    // 只有待出款(pending)且未锁定的订单才可以被锁定；筛掉已锁定、非待出款
    const toLock = rows.filter(
      (r) => !(r.isLocked || r.lockedBy) && r.status === 'pending',
    );
    if (toLock.length === 0) {
      selectedIds.value = [];
      message.warning($t('finance.hasEligibleLockedConditionsOrderOnlyPendingPayoutUnlockedOrderLocked'));
      return;
    }
    if (toLock.length < rows.length) {
      selectedIds.value = toLock.map((r) => String(r.id));
    }
    batchLockConfirmModal.value = {
      show: true,
      loading: false,
      actionKey,
      rows: toLock,
    };
    return;
  }
  batchLockConfirmModal.value = {
    show: true,
    loading: false,
    actionKey,
    rows,
  };
}

async function submitBatchLockConfirm() {
  const { actionKey, rows } = batchLockConfirmModal.value;
  batchLockConfirmModal.value.loading = true;
  const orderIds = rows.map((r) => String(r.id)).filter(Boolean);
  await runFinanceBatchAction(actionKey, orderIds);
  batchLockConfirmModal.value.loading = false;
  batchLockConfirmModal.value.show = false;
}

function openBatchReasonModal(actionKey: string, orderIds: string[]) {
  if (actionKey === 'batch-force-reject') {
    const selectedRows = tableData.value.filter((r) =>
      orderIds.includes(String(r.id)),
    );
    const pendingRows = selectedRows.filter((r) => r.status === 'pending');
    if (pendingRows.length === 0) return;
    showForceRejectModalForBatch(pendingRows);
    return;
  }
  const rows = tableData.value.filter((r) => orderIds.includes(String(r.id)));
  const next: Record<string, BatchModalRowItem> = {};
  if (actionKey === 'batch-force-cancel') {
    rows.forEach((r) => {
      next[r.id] = { frontendReason: '', backendReason: '' };
    });
  } else {
    // batch-remark、batch-manual-withdrawal：每行前台/后台备注
    rows.forEach((r) => {
      next[r.id] = { frontendNotes: '', backendNotes: '' };
    });
  }
  batchModalRowData.value = next;
  batchBulkFrontend.value = '';
  batchBulkBackend.value = '';
  batchReasonModal.value = {
    show: true,
    loading: false,
    actionKey,
    orderIds,
    rows,
    reason: '',
  };
}

function setBatchRowField(
  rowId: string,
  field: keyof BatchModalRowItem,
  value: string,
) {
  const row = batchModalRowData.value[rowId];
  if (row) row[field] = value;
}

function applyBulkBatch(field: 'frontend' | 'backend') {
  const rows = batchReasonModal.value.rows;
  const isCancel = batchReasonModal.value.actionKey === 'batch-force-cancel';
  const text = field === 'frontend' ? batchBulkFrontend.value : batchBulkBackend.value;
  rows.forEach((r) => {
    const row = batchModalRowData.value[r.id];
    if (!row) return;
    if (isCancel) {
      if (field === 'frontend') row.frontendReason = text;
      else row.backendReason = text;
    } else {
      if (field === 'frontend') row.frontendNotes = text;
      else row.backendNotes = text;
    }
  });
}

async function submitBatchReasonModal() {
  const { actionKey, rows, orderIds } = batchReasonModal.value;
  batchReasonModal.value.loading = true;
  const rowPayloads = rows.map((r) => {
    const d = batchModalRowData.value[r.id] || {};
    return {
      id: r.id,
      orderId: r.orderId,
      frontendReason: d.frontendReason ?? '',
      backendReason: d.backendReason ?? '',
      frontendNotes: d.frontendNotes ?? '',
      backendNotes: d.backendNotes ?? '',
    };
  });
  await runFinanceBatchAction(actionKey, orderIds, '', rowPayloads);
  batchReasonModal.value.loading = false;
  batchReasonModal.value.show = false;
}

type BatchRowPayload = {
  id: string;
  orderId?: string;
  frontendReason?: string;
  backendReason?: string;
  frontendNotes?: string;
  backendNotes?: string;
};

const REPAYABLE_STATUSES = new Set(['processing', 'failed']);

function openBatchRePayModal(rows: WithdrawalRecord[]) {
  const eligible = rows.filter((r) =>
    REPAYABLE_STATUSES.has(String(r.status || '')),
  );
  if (eligible.length === 0) {
    message.warning($t('finance.recordsHasEligibleActionsConditionsOrder'));
    return;
  }
  if (eligible.length < rows.length) {
    message.info(
      `已跳过 ${rows.length - eligible.length} 笔非处理中/失败订单，将重新代付 ${eligible.length} 笔`,
    );
  }
  const knownChannels = new Set(paymentChannelOptions.map((o) => o.value));
  const existingChannel = eligible
    .map((r) => String(r.paymentGateway || '').trim())
    .find((ch) => ch && knownChannels.has(ch));
  batchRePayModal.items = eligible;
  batchRePayModal.paymentChannel = existingChannel || '';
  batchRePayModal.notes = '';
  batchRePayModal.loading = false;
  batchRePayModal.show = true;
}

async function submitBatchRePayModal(): Promise<boolean> {
  if (!batchRePayModal.paymentChannel) {
    message.warning($t('finance.pleaseSelectPayoutChannel'));
    return false;
  }
  const withdrawalIds = batchRePayModal.items
    .map((r) => String(r.id))
    .filter(Boolean);
  if (withdrawalIds.length === 0) {
    message.warning($t('finance.pleaseSelectActionsRecords'));
    return false;
  }
  try {
    batchRePayModal.loading = true;
    const res = await rePaymentApi.bulkRePayment({
      withdrawalIds,
      paymentChannel: batchRePayModal.paymentChannel,
      notes: batchRePayModal.notes || undefined,
    });
    const results = res?.data?.results ?? [];
    const ok = results.filter((r) => r.success).length;
    const len = withdrawalIds.length;
    if (res?.success === false) {
      message.error(res.message || '批量重新代付失败');
      return false;
    }
    message[ok === len ? 'success' : 'warning'](
      ok === len
        ? `批量重新代付成功 (${len} 条)`
        : `部分成功 ${ok}/${len} 条`,
    );
    batchRePayModal.show = false;
    selectedIds.value = [];
    await fetchData();
    emit('refresh-tabs');
    return true;
  } catch (e: unknown) {
    const err = e as { message?: string };
    message.error(err?.message || '批量重新代付失败');
    return false;
  } finally {
    batchRePayModal.loading = false;
  }
}

async function runFinanceBatchAction(
  actionKey: string,
  orderIds: string[],
  reason: string = '',
  rowPayloads?: BatchRowPayload[],
) {
  const len = orderIds.length;
  try {
    loading.value = true;
    if (actionKey === 'batch-lock') {
      let ok = 0;
      for (const id of orderIds) {
        try {
          const res = await financeWithdrawalApi.lockWithdrawal(id, 'lock');
          if (res?.success !== false) ok++;
        } catch (_) {
          /* skip */
        }
      }
      message[ok === len ? 'success' : 'warning'](
        ok === len ? `批量锁定成功 (${len} 条)` : `部分成功 ${ok}/${len} 条`,
      );
      await fetchData();
      selectedIds.value = [];
      emit('refresh-tabs');
    } else if (actionKey === 'batch-unlock') {
      let ok = 0;
      for (const id of orderIds) {
        try {
          const res = await financeWithdrawalApi.lockWithdrawal(id, 'unlock');
          if (res?.success !== false) ok++;
        } catch (_) {
          /* skip */
        }
      }
      message[ok === len ? 'success' : 'warning'](
        ok === len ? `批量解锁成功 (${len} 条)` : `部分成功 ${ok}/${len} 条`,
      );
      await fetchData();
      selectedIds.value = [];
      emit('refresh-tabs');
    } else if (actionKey === 'batch-approve') {
      const pendingIds = orderIds.filter((id) => {
        const row = tableData.value.find((r) => String(r.id) === id);
        return row?.status === 'pending';
      });
      if (pendingIds.length === 0) return;
      let ok = 0;
      for (const id of pendingIds) {
        try {
          const res = await financeWithdrawalApi.approveWithdrawal(id);
          if (res?.success !== false) ok++;
        } catch (_) {
          /* skip */
        }
      }
      message[ok === pendingIds.length ? 'success' : 'warning'](
        ok === pendingIds.length
          ? `批量审核出款成功 (${pendingIds.length} 条)`
          : `部分成功 ${ok}/${pendingIds.length} 条`,
      );
      await fetchData();
      selectedIds.value = [];
      emit('refresh-tabs');
    } else if (actionKey === 'batch-force-cancel') {
      let ok = 0;
      const payloads = rowPayloads?.length ? rowPayloads : orderIds.map((id) => ({ id, frontendReason: reason, backendReason: reason }));
      for (const p of payloads) {
        try {
          const res = await financeWithdrawalApi.forceCancel(p.id, {
            frontendReason: p.frontendReason ?? reason,
            backendReason: p.backendReason ?? reason,
          });
          if (res?.success !== false) ok++;
        } catch (_) {
          /* skip */
        }
      }
      message[ok === payloads.length ? 'success' : 'warning'](
        ok === payloads.length
          ? `批量强制取消成功 (${payloads.length} 条)`
          : `部分成功 ${ok}/${payloads.length} 条`,
      );
      await fetchData();
      selectedIds.value = [];
      emit('refresh-tabs');
    } else if (actionKey === 'batch-force-reject') {
      let ok = 0;
      for (const id of orderIds) {
        try {
          const res = await financeWithdrawalApi.forceReject(id, {
            windControlProcess: 'no',
            frontendReason: reason,
            backendReason: reason,
          });
          if (res?.success !== false) ok++;
        } catch (_) {
          /* skip */
        }
      }
      message[ok === len ? 'success' : 'warning'](
        ok === len
          ? `批量强制拒绝成功 (${len} 条)`
          : `部分成功 ${ok}/${len} 条`,
      );
      await fetchData();
      selectedIds.value = [];
      emit('refresh-tabs');
    } else if (actionKey === 'batch-remark') {
      let ok = 0;
      const payloads = rowPayloads?.length
        ? rowPayloads
        : orderIds.map((id) => ({
            id,
            backendNotes: reason,
            frontendNotes: reason,
          }));
      for (const p of payloads) {
        try {
          // 备注接口使用 orderId（与单条备注一致），无 orderId 时回退为 id
          const noteId = (p as BatchRowPayload).orderId || p.id;
          const res = await financeWithdrawalApi.updateNote(noteId, {
            frontendNotes: (p as BatchRowPayload).frontendNotes,
            backendNotes: (p as BatchRowPayload).backendNotes ?? reason,
          });
          if (res?.success !== false) ok++;
        } catch (_) {
          /* skip */
        }
      }
      message[ok === payloads.length ? 'success' : 'warning'](
        ok === payloads.length ? `批量备注成功 (${payloads.length} 条)` : `部分成功 ${ok}/${payloads.length} 条`,
      );
      await fetchData();
      selectedIds.value = [];
      emit('refresh-tabs');
    } else if (actionKey === 'batch-force-success') {
      let ok = 0;
      for (const id of orderIds) {
        try {
          const res = await financeWithdrawalApi.processWithdrawal(id, {
            action: 'confirm',
          });
          if (res?.success !== false) ok++;
        } catch (_) {
          /* skip */
        }
      }
      message[ok === len ? 'success' : 'warning'](
        ok === len ? `批量强制成功 (${len} 条)` : `部分成功 ${ok}/${len} 条`,
      );
      await fetchData();
      selectedIds.value = [];
      emit('refresh-tabs');
    } else if (actionKey === 'batch-force-fail') {
      let ok = 0;
      for (const id of orderIds) {
        try {
          const res = await financeWithdrawalApi.processWithdrawal(id, {
            action: 'reject',
            notes: reason || '批量强制失败',
          });
          if (res?.success !== false) ok++;
        } catch (_) {
          /* skip */
        }
      }
      message[ok === len ? 'success' : 'warning'](
        ok === len ? `批量强制失败 (${len} 条)` : `部分成功 ${ok}/${len} 条`,
      );
      await fetchData();
      selectedIds.value = [];
      emit('refresh-tabs');
    } else if (actionKey === 'batch-refresh-callback') {
      message.info($t('finance.bulkRefreshCallbackPleaseThirdPartyPayoutOrRePaying'));
    } else if (actionKey === 'batch-repay') {
      const rows = tableData.value.filter((r) =>
        orderIds.includes(String(r.id)),
      );
      openBatchRePayModal(rows);
    } else if (actionKey === 'batch-manual-withdrawal') {
      let ok = 0;
      const payloads = rowPayloads?.length
        ? rowPayloads
        : orderIds.map((id) => ({ id, frontendNotes: '', backendNotes: '' }));
      for (const p of payloads) {
        try {
          const res = await financeWithdrawalApi.manualWithdrawal(p.id);
          if (res?.success !== false) {
            ok++;
            if ((p.frontendNotes ?? '').trim() || (p.backendNotes ?? '').trim()) {
              const noteId = (p as BatchRowPayload).orderId || p.id;
              await financeWithdrawalApi.updateNote(noteId, {
                frontendNotes: p.frontendNotes,
                backendNotes: p.backendNotes,
              });
            }
          }
        } catch (_) {
          /* skip */
        }
      }
      message[ok === payloads.length ? 'success' : 'warning'](
        ok === payloads.length
          ? `批量已人工出款 (${payloads.length} 条)`
          : `部分成功 ${ok}/${payloads.length} 条`,
      );
      await fetchData();
      selectedIds.value = [];
      emit('refresh-tabs');
    }
  } catch (e: any) {
    message.error(e?.message || '批量操作失败');
  } finally {
    loading.value = false;
  }
}

/** 解锁/备注/取消/拒绝/审核出款/人工出款/回调/代付：仅操作已锁定且未完成的订单，筛选掉未锁定和已完成的。付款失败(payment_failed)视为未完成，允许参与备注/取消/拒绝/审核/人工/回调/代付 */
function filterRowsForBatchOpLocked(
  key: string,
  rows: WithdrawalRecord[],
): WithdrawalRecord[] {
  const needLockedOnly =
    key === 'batch-unlock' ||
    key === 'batch-remark' ||
    key === 'batch-force-cancel' ||
    key === 'batch-force-reject' ||
    key === 'batch-approve' ||
    key === 'batch-manual-withdrawal' ||
    key === 'batch-refresh-callback' ||
    key === 'batch-repay';
  if (!needLockedOnly) return rows;
  // 仅保留已锁定的：与表格列「订单状态(操作人)」一致，必须 isLocked 且 lockedBy 有值才算已锁定
  let filtered = rows.filter(
    (r) =>
      !!r.isLocked &&
      r.lockedBy != null &&
      String(r.lockedBy).trim() !== '',
  );
  if (key !== 'batch-unlock') {
    // 备注/取消/拒绝/审核/人工/回调/代付：再排除已完成的订单（付款失败不算已完成）
    filtered = filtered.filter((r) => !isCompletedWithdrawalStatus(r.status || ''));
  }
  // 审核出款/强制取消/强制拒绝：仅 pending 或 payment_failed（付款失败和已解锁场景下允许的操作）
  if (
    key === 'batch-approve' ||
    key === 'batch-force-cancel' ||
    key === 'batch-force-reject'
  ) {
    filtered = filtered.filter(
      (r) => r.status === 'pending' || r.status === 'payment_failed',
    );
  }
  return filtered;
}

function onBatchOperationSelect(key: string, selectedRows: WithdrawalRecord[]) {
  // 解锁/备注/取消/拒绝/审核/人工出款：先筛掉未锁定和已完成的
  const afterLockFilter = filterRowsForBatchOpLocked(key, selectedRows);
  const pendingOrPaymentFailed =
    key === 'batch-approve' ||
    key === 'batch-force-cancel' ||
    key === 'batch-force-reject';
  const rows = pendingOrPaymentFailed
    ? afterLockFilter.filter(
        (r) => r.status === 'pending' || r.status === 'payment_failed',
      )
    : afterLockFilter;
  const orderIds = rows.map((r) => String(r.id)).filter(Boolean);

  if (orderIds.length === 0) {
    if (selectedRows.length > 0) {
      selectedIds.value = [];
      message.warning($t('finance.recordsHasEligibleActionsConditionsOrder'));
    }
    return;
  }
  if (rows.length < selectedRows.length) {
    selectedIds.value = orderIds;
  }

  if (key === 'batch-force-reject') {
    showForceRejectModalForBatch(rows);
    return;
  }
  if (['batch-force-cancel', 'batch-remark', 'batch-manual-withdrawal'].includes(key)) {
    openBatchReasonModal(key, orderIds);
    return;
  }
  if (key === 'batch-lock' || key === 'batch-unlock') {
    openBatchLockConfirmModal(key, rows);
    return;
  }
  runFinanceBatchAction(key, orderIds);
}

const handleBulkProcess = (_selectedRows: WithdrawalRecord[]) => {
  showBulkProcessModal();
};

// Methods
const fetchData = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: paginationReactive.page,
      limit: paginationReactive.pageSize,
    };

    // Add filters - use full datetime for accurate filtering (matching AutoWithdrawal)
    if (filters.dateRange) {
      params.startDate = new Date(filters.dateRange[0]).toISOString();
      const endDate = new Date(filters.dateRange[1]);
      endDate.setHours(23, 59, 59, 999);
      params.endDate = endDate.toISOString();
    }

    if (filters.memberAccount) params.memberAccount = filters.memberAccount;
    if (filters.userId?.trim()) params.userId = filters.userId.trim();
    if (filters.orderId?.trim()) params.orderId = filters.orderId.trim();
    if (filters.thirdPartyPayment)
      params.thirdPartyPayment = filters.thirdPartyPayment;
    if (filters.amount) params.amount = filters.amount;
    if (filters.withdrawalMethod)
      params.withdrawalMethod = filters.withdrawalMethod;
    if (filters.approvalStatus) params.approvalStatus = filters.approvalStatus;
    if (filters.operator) params.operator = filters.operator;

    // Add filter for "由我出款" - only show withdrawals assigned to current user
    if (props.isMyWithdrawal) {
      params.assignedToMe = true;
    }

    try {
      const response =
        await financeWithdrawalApi.getWithdrawalsForProcessing(params);

      // Handle the full response object returned by the API
      if (response && response.success && response.data) {
        // Extract data from the response object
        const responseData = response.data;
        if (responseData.withdrawals) {
          const withdrawalsArray = responseData.withdrawals || [];

          const mappedData = withdrawalsArray.map((item: any) => ({
            ...item,
            memberId: item.memberId, // Internal database ID (e.g., 7) - DO NOT OVERWRITE
            userID: item.userID, // 9-digit display ID (e.g., '154301535')
            displayMemberId: item.userID || item.memberId, // For UI display only
            isLocked: item.isLocked || false,
            lockedBy: item.lockedBy || null,
            lockedAt: item.lockedAt || null,
            withdrawalCount: item.withdrawalCount || 0,
            depositCount: item.depositCount || 0,
            frontendNotes: item.frontendNotes || '',
            backendNotes: item.backendNotes || '',
            thirdPartyNotes:
              item.thirdPartyNotes ||
              item.thirdPartyError ||
              item.gatewayError ||
              '',
            thirdPartyProvider: item.thirdPartyProvider || '',
            refreshCount: item.refreshCount || 0,
            lastRefreshTime: item.lastRefreshTime || null,
          }));

          tableData.value = mappedData;
          paginationReactive.total = responseData.pagination?.total || 0;
        } else {
          console.warn('No withdrawals in response data:', responseData);
          tableData.value = [];
          paginationReactive.total = 0;
        }
      } else {
        console.warn('API response:', response);
        // Fallback to empty data for now
        tableData.value = [];
        paginationReactive.total = 0;
        message.warning(response?.message || '暂无数据');
      }
    } catch (apiError) {
      console.error('API call failed:', apiError);
      // Set empty state on API failure
      tableData.value = [];
      paginationReactive.total = 0;
      message.error($t('finance.failedToFetchDataPleaseLaterRetry'));
    }
  } catch (error) {
    console.error('Fetch data error:', error);
    tableData.value = [];
    paginationReactive.total = 0;
    message.error($t('finance.failedToFetchData'));
  } finally {
    loading.value = false;
  }
};

const applyFilters = () => {
  paginationReactive.page = 1;
  fetchData();
};

const resetFilters = () => {
  // Reset to default filters but keep current data
  fetchData();
};

const clearFilters = () => {
  Object.assign(filters, {
    timeRange: 'today',
    dateRange: getTodayDateRange(), // Reset to today
    memberAccount: '',
    userId: '',
    orderId: '',
    thirdPartyPayment: '',
    amount: '',
    withdrawalMethod: '',
    approvalStatus: 'all', // Default to showing all records
    operator: '',
  });
  paginationReactive.page = 1;
  fetchData();
};

// Watch for timeRange changes and update dateRange accordingly (matching AutoWithdrawal)
watch(
  () => filters.timeRange,
  (newValue) => {
    if (newValue === 'today') {
      filters.dateRange = getTodayDateRange();
    } else if (newValue === 'month') {
      filters.dateRange = getMonthDateRange();
    }
    // Automatically fetch data when time range changes (matching AutoWithdrawal)
    fetchData();
  },
);

const showDetail = async (row: WithdrawalRecord) => {
  detailModal.data = row;
  detailModal.show = true;
};

const showBulkProcessModal = () => {
  const selectedItems = tableData.value.filter((item) =>
    selectedIds.value.includes(item.id),
  );
  processModal.items = selectedItems;
  processModal.status = '';
  processModal.notes = '';
  processModal.show = true;
};

const showBulkAssignModal = () => {
  const selectedItems = tableData.value.filter((item) =>
    selectedIds.value.includes(item.id),
  );
  assignModal.items = selectedItems;
  assignModal.show = true;
};

const showSingleProcessModal = (row: WithdrawalRecord) => {
  processModal.items = [row];
  processModal.status = '';
  processModal.notes = '';
  processModal.show = true;
};

const showSingleApproveModal = (row: WithdrawalRecord) => {
  processModal.items = [row];
  processModal.status = 'success';
  processModal.notes = '';
  processModal.show = true;
};

const showSingleRejectModal = (row: WithdrawalRecord) => {
  processModal.items = [row];
  processModal.status = 'failed';
  processModal.notes = '';
  processModal.show = true;
};

const handleBatchProcess = async () => {
  try {
    if (!processModal.status) {
      message.error($t('finance.pleaseSelectProcessStatus'));
      return;
    }

    const action = processModal.status === 'success' ? 'confirm' : 'reject';

    try {
      const response = await financeWithdrawalApi.bulkProcess({
        withdrawalIds: processModal.items.map((item) => item.id),
        action,
        notes: processModal.notes,
      });

      if (response.success) {
        const actionText = action === 'confirm' ? '批准' : '拒绝';
        message.success(
          `成功${actionText} ${processModal.items.length} 个出款申请`,
        );
        processModal.show = false;
        selectedIds.value = [];

        // 🚀 Immediately remove items from table if rejected (disappear immediately)
        // For approve, items stay visible in "processing" status until third-party completes
        if (action === 'reject') {
          const processedIds = processModal.items.map((item) => item.id);
          tableData.value = tableData.value.filter(
            (item) => !processedIds.includes(item.id),
          );

          // Update pagination total
          paginationReactive.total = Math.max(
            0,
            paginationReactive.total - processedIds.length,
          );
        } else if (action === 'confirm') {
          // For approve/confirm, update status to processing (stays visible until third-party completes)
          const processedIds = processModal.items.map((item) => item.id);
          tableData.value.forEach((item) => {
            if (processedIds.includes(item.id)) {
              item.status = 'processing';
            }
          });
        }

        // Then refresh to sync with backend
        await fetchData();

        // Emit refresh event for tab counts
        emit('refresh-tabs');
      } else {
        message.error(response.message || '处理失败');
      }
    } catch (apiError) {
      console.warn('API call failed:', apiError);
      message.success(
        `成功处理 ${processModal.items.length} 个出款申请 (模拟)`,
      );
      processModal.show = false;
      selectedIds.value = [];
      fetchData();
    }
  } catch (error) {
    message.error($t('finance.processFailed'));
  }
};

const handleBatchAssign = async () => {
  try {
    try {
      const response = await financeWithdrawalApi.bulkAssign({
        withdrawalIds: assignModal.items.map((item) => item.id),
      });

      if (response.success) {
        message.success(`成功分配 ${assignModal.items.length} 个出款申请`);
        assignModal.show = false;
        selectedIds.value = [];
        fetchData();
      } else {
        message.error(response.message || '分配失败');
      }
    } catch (apiError) {
      console.warn('API call failed:', apiError);
      message.success(`成功分配 ${assignModal.items.length} 个出款申请 (模拟)`);
      assignModal.show = false;
      selectedIds.value = [];
      fetchData();
    }
  } catch (error) {
    message.error($t('finance.failed'));
  }
};

// Utility functions
const getStatusType = (
  status: string,
): 'success' | 'warning' | 'error' | 'default' | 'primary' | 'info' => {
  const statusMap: Record<
    string,
    'success' | 'warning' | 'error' | 'default' | 'primary' | 'info'
  > = {
    pending: 'warning',
    processing: 'info',
    success: 'success',
    failed: 'error',
    approved: 'success',
  };
  return statusMap[status] || 'default';
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    success: '提现成功',
    failed: '失败',
    approved: '提现成功',
  };
  return statusMap[status] || status;
};

const canProcess = (status: string) => {
  // Only show action buttons for withdrawals that can be approved/rejected
  // Exclude completed statuses: success, failed, rejected, canceled, processing (waiting for third-party)
  return ['pending'].includes(status);
};

const canApprove = (status: string) => {
  // Can approve only if pending (not already processing/success/failed)
  return status === 'pending';
};

const canReject = (status: string) => {
  // Can reject only if pending (not already processing/success/failed)
  return status === 'pending';
};

// Auto-refresh methods (simplified with SmartAutoRefresh)
const handleRefreshIntervalChange = (newInterval: number) => {
  console.log(
    'FinanceWithdrawal: Refresh interval changed to',
    newInterval,
    'seconds',
  );
  // SmartAutoRefresh component handles all timer logic
};

// Lifecycle
onMounted(async () => {
  await fetchAvailableProviders();
  fetchData();
});

onUnmounted(() => {
  // Component cleanup handled by SmartAutoRefresh
});
</script>

<style scoped>
.finance-withdrawal {
  padding: 16px;
}

.header-section {
  margin-bottom: 16px;
}

.filter-section {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.filter-item {
  display: flex;
  flex-direction: column;
}

.single-line-table :deep(.n-data-table-td) {
  white-space: nowrap;
}

/* 备注列（前台/后台/三方）长文本自动换行，便于阅读 */
.single-line-table :deep(.n-data-table-td:has(.remark-cell-content)) {
  white-space: normal;
}
.single-line-table :deep(.remark-cell-content) {
  word-break: break-word;
  white-space: normal;
  max-width: 100%;
}

.single-line-table :deep(.n-data-table-th) {
  background: #f8f9fa;
  font-weight: 600;
}

.summary-section {
  border-top: 1px solid #e0e0e0;
}

/* Simple table styling like withdrawal settings */
.single-line-table :deep(.n-data-table-td) {
  white-space: nowrap;
}

.single-line-table :deep(.n-data-table-th) {
  background: #f8f9fa;
  font-weight: 600;
}

/* 批量强制取消/批量备注 弹窗标题居中 */
.batch-reason-modal-card :deep(.n-card-header),
.batch-reason-modal-card :deep(.n-card-header__main) {
  text-align: center;
  justify-content: center;
}

/* 批量强制拒绝：表格不横向滚动，全部列在一屏内显示 */
.batch-force-reject-table-wrap {
  overflow-x: visible;
  max-width: 100%;
}
.batch-force-reject-table {
  table-layout: fixed;
  word-break: break-word;
}

</style>

<style>
/* 弹窗可能被 teleport 到 body，需全局样式保证标题居中 */
.batch-reason-modal-card .n-card-header,
.batch-reason-modal-card .n-card-header__main {
  text-align: center;
  justify-content: center;
}
</style>
