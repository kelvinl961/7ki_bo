<template>
  <div class="recharge-order-list">
    <!-- Header Section -->
    <div class="page-header">
      <n-breadcrumb>
        <n-breadcrumb-item>{{ $t('finance.k2tg5p') }}</n-breadcrumb-item>
        <n-breadcrumb-item>{{ $t('finance.kt982i') }}</n-breadcrumb-item>
      </n-breadcrumb>
    </div>

    <!-- Tab Navigation -->
    <n-tabs v-model:value="activeTab" type="line" class="mb-4">
      <n-tab-pane name="all-orders" :tab="$t('finance.allOrders')">
        <!-- Filter Section -->
        <n-card class="mb-4">
          <div class="filter-section">
            <!-- First Row: Date Range and Search -->
            <div class="filter-row">
              <!-- 时间段快捷选择 (日/周/月) -->
              <div class="flex flex-col">
                <label class="mb-2 text-sm font-medium">&nbsp;</label>
                <QuickDateSelect
                  v-model="filters.dateQuickSelect"
                  @update:modelValue="handleQuickDateSelect"
                />
              </div>

              <!-- 日期范围选择器 -->
              <div class="flex flex-col">
                <label class="mb-2 text-sm font-medium"
                  >{{ $t('finance.kfsfu1') }}</label
                >
                <TimezoneDatePicker
                  v-model="filters.dateRange"
                  @update:modelValue="handleDateRangeChange"
                />
              </div>

              <n-input
                v-model:value="filters.search"
               :placeholder="$t('finance.memberAccountOrderNoMemberId')"
                style="width: 300px"
                clearable
                @keyup.enter="handleSearch"
              />
            </div>

            <!-- Second Row: Select Filters -->
            <div class="filter-row">
              <n-select
                v-model:value="filters.rechargeAmount"
               :placeholder="$t('finance.rechargeDenomination')"
                style="width: 150px"
                :options="rechargeAmountOptions"
                clearable
              />
              <n-select
                v-model:value="filters.currency"
               :placeholder="$t('common.currency')"
                style="width: 120px"
                :options="currencyOptions"
                clearable
              />
              <n-select
                v-model:value="filters.vipLevel"
               :placeholder="$t('finance.vIPLevel')"
                style="width: 120px"
                :options="vipLevelOptions"
                clearable
              />
              <n-select
                v-model:value="filters.thirdParty"
               :placeholder="$t('finance.thirdPartyPayment1')"
                style="width: 150px"
                :options="thirdPartyOptions"
                clearable
              />
              <n-select
                v-model:value="filters.channel"
               :placeholder="$t('finance.channel1')"
                style="width: 120px"
                :options="channelOptions"
                clearable
              />
              <n-select
                v-model:value="filters.status"
               :placeholder="$t('finance.rechargeStatus')"
                style="width: 120px"
                :options="statusOptions"
                clearable
              />
            </div>

            <!-- Third Row: Search Buttons -->
            <div class="filter-row">
              <div class="filter-buttons">
                <n-button type="primary" @click="handleSearch">{{ $t('common.search') }}</n-button>
                <n-dropdown :options="advancedSearchOptions" trigger="click">
                  <n-button>{{ $t('finance.k1782444202588') }}</n-button>
                </n-dropdown>
                <n-button @click="handleReset">{{ $t('common.reset') }}</n-button>
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
          </div>
        </n-card>

        <!-- SmartDataGrid for All Orders -->
        <SmartDataGrid
          :data="tableData"
          :columns="visibleColumns"
          :loading="loading"
          :pagination="paginationReactive"
          selectable
          :selected-keys="checkedRowKeys"
          :row-key="(row: RechargeOrder) => row.orderId"
          striped
          size="small"
          :scroll-x="rechargeOrdersScrollX"
          @update:selected-keys="checkedRowKeys = $event"
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
                    <n-button type="primary" @click="handleCreateOrder"
                      >{{ $t('finance.createOnlineOrder') }}</n-button
                    >
                    <n-button
                      type="warning"
                      @click="handleCreateSupplementOrder"
                      >{{ $t('finance.createSupplementaryOrder') }}</n-button
                    >
                    <n-dropdown :options="exportOptions" trigger="click">
                      <n-button>{{ $t('finance.k4s5pc') }}</n-button>
                    </n-dropdown>
                    <n-button @click="showColumnConfig = true">
                      <template #icon>
                        <n-icon><Settings /></n-icon>
                      </template>{{ $t('finance.columnConfig') }}</n-button>
                  </div>

                  <!-- 选择信息 -->
                  <div class="text-sm text-gray-600">
                    {{ $t('finance.selectedOfTotal', { selected: selectedCount, total: paginationReactive.total }) }}
                  </div>
                </div>

                <div class="flex items-center gap-4">
                  <!-- 批量操作 -->
                  <div v-if="selectedCount > 0" class="flex gap-2">
                    <n-button
                      type="primary"
                      size="small"
                      @click="handleBulkProcess(selectedRows)"
                    >
                      {{ $t('finance.bulkProcessWithCount', { count: selectedCount }) }}
                    </n-button>
                    <n-button
                      type="error"
                      size="small"
                      @click="handleBulkCancel(selectedRows)"
                    >
                      {{ $t('finance.bulkCancelWithCount', { count: selectedCount }) }}
                    </n-button>
                    <n-button
                      size="small"
                      @click="handleBulkExport(selectedRows)"
                    >
                      {{ $t('finance.exportSelectedWithCount', { count: selectedCount }) }}
                    </n-button>
                  </div>

                  <!-- 选择控制 -->
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

        <!-- Totals Summary -->
        <n-card class="mt-4">
          <div class="totals-summary">
            <n-space size="large">
              <div class="total-item">
                <span class="total-label">{{ $t('finance.rechargeDenominationTotal') }}:</span>
                <span class="total-value">{{
                  formatCurrency(totals.rechargeAmount)
                }}</span>
              </div>
              <div class="total-item">
                <span class="total-label">订单金额合计:</span>
                <span class="total-value">{{
                  formatCurrency(totals.orderAmount)
                }}</span>
              </div>
              <div class="total-item">
                <span class="total-label">赠送金额合计:</span>
                <span class="total-value bonus">{{
                  formatCurrency(totals.bonusAmount)
                }}</span>
              </div>
              <div class="total-item">
                <span class="total-label">手续费合计:</span>
                <span class="total-value fee">{{
                  formatCurrency(totals.fee)
                }}</span>
              </div>
              <div class="total-item">
                <span class="total-label">总上分金额:</span>
                <span class="total-value credited">{{
                  formatCurrency(totals.totalCredited)
                }}</span>
              </div>
            </n-space>
          </div>
        </n-card>
      </n-tab-pane>

      <n-tab-pane name="category-config" :tab="$t('finance.config1')">
        <!-- Filter Section -->
        <n-card class="mb-4">
          <div class="filter-section">
            <!-- First Row: Filters -->
            <div class="filter-row">
              <n-select
                v-model:value="categoryFilters.isActive"
               :placeholder="$t('finance.onStatus')"
                style="width: 120px"
                :options="[
                  { label: '全部状态', value: '' },
                  { label: '已启用', value: 'ENABLED' },
                  { label: '已停用', value: 'DISABLED' },
                ]"
                clearable
              />
              <n-select
                v-model:value="categoryFilters.blacklistStatus"
               :placeholder="$t('finance.status1')"
                style="width: 120px"
                :options="[
                  { label: '全部状态', value: '' },
                  { label: '已启用', value: 'ENABLED' },
                  { label: '已停用', value: 'DISABLED' },
                ]"
                clearable
              />
              <n-input
                v-model:value="categoryFilters.search"
               :placeholder="$t('finance.or')"
                style="width: 200px"
                clearable
                @keyup.enter="handleCategorySearch"
              />
              <n-button type="primary" @click="handleCategorySearch"
                >{{ $t('common.search') }}</n-button
              >
              <n-button @click="handleCategoryReset">{{ $t('common.reset') }}</n-button>
              <div class="ml-auto">
                <n-button type="primary" @click="handleAddCategory"
                  >{{ $t('finance.addRecharge') }}</n-button
                >
              </div>
            </div>
          </div>
        </n-card>

        <!-- SmartDataGrid for Category Config -->
        <SmartDataGrid
          :data="categoryTableData"
          :columns="categoryColumns"
          :loading="categoryLoading"
          :pagination="categoryPaginationReactive"
          row-key="id"
          striped
          size="small"
          :scroll-x="1800"
          @update:page="handleCategoryPageChange"
          @update:page-size="handleCategoryPageSizeChange"
          @refresh="fetchCategoryData"
          @row-click="handleCategoryRowClick"
        >
          <template #actionBar="{ selectedCount, selectedRows }">
            <n-card :bordered="false" class="rounded-16px shadow-sm">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <!-- 主要操作按钮 -->
                  <div class="flex gap-2">
                    <n-button type="primary" @click="handleAddCategory"
                      >{{ $t('finance.addRecharge') }}</n-button
                    >
                  </div>

                  <!-- 选择信息 -->
                  <div class="text-sm text-gray-600">
                    {{ $t('finance.totalRecordsWithCount', { count: categoryPaginationReactive.total }) }}
                  </div>
                </div>

                <div class="flex items-center gap-4">
                  <!-- 选择控制 -->
                  <div class="flex gap-2">
                    <n-button size="small" @click="handleCategoryReset"
                      >{{ $t('finance.kcdgqo') }}</n-button
                    >
                    <n-button size="small" @click="fetchCategoryData"
                      >{{ $t('finance.k6efv0') }}</n-button
                    >
                  </div>
                </div>
              </div>
            </n-card>
          </template>
        </SmartDataGrid>

        <!-- Add/Edit Category Modal -->
        <n-modal v-model:show="showCategoryModal" :mask-closable="false">
          <n-card
            style="width: 700px"
            :title="isEditingCategory ? '编辑充值大类' : '新增充值大类'"
            :bordered="false"
            size="huge"
            role="dialog"
            aria-modal="true"
          >
            <template #header-extra>
              <n-button quaternary circle @click="showCategoryModal = false">
                <n-icon><Close /></n-icon>
              </n-button>
            </template>

            <n-form
              ref="categoryFormRef"
              :model="categoryForm"
              :rules="categoryRules"
              label-placement="left"
              label-width="120px"
              require-mark-placement="right-hanging"
            >
              <!-- First Row: Category Name and Icon -->
              <div class="grid grid-cols-2 gap-6">
                <n-form-item :label="$t('finance.text73')" path="name" required>
                  <n-input
                    v-model:value="categoryForm.name"
                   :placeholder="$t('finance.pleaseEnter')"
                    :maxlength="50"
                    show-count
                    clearable
                  />
                </n-form-item>

                <n-form-item :label="$t('finance.text74')" path="icon">
                  <div class="flex items-center gap-4">
                    <MediaLibrarySelector
                      v-model:value="categoryForm.icon"
                      category="icons"
                      :accept-types="['image']"
                     :placeholder="$t('finance.selectOr')"
                      @file-selected="handleCategoryIconSelected"
                    />
                    <div class="text-sm text-gray-500">
                      图标大小60*60<br />
                      PNG或JPG格式
                    </div>
                  </div>
                </n-form-item>
              </div>

              <!-- Second Row: Blacklist and Status -->
              <div class="grid grid-cols-2 gap-6">
                <n-form-item :label="$t('finance.rechargeBlacklist')" path="blacklistStatus" required>
                  <n-select
                    v-model:value="categoryForm.blacklistStatus"
                   :placeholder="$t('finance.pleaseSelect4')"
                    :options="[
                      { label: '停用', value: 'DISABLED' },
                      { label: '启用', value: 'ENABLED' },
                    ]"
                  />
                </n-form-item>

                <n-form-item :label="$t('finance.onStatus')" path="isActive" required>
                  <n-select
                    v-model:value="categoryForm.isActive"
                   :placeholder="$t('finance.pleaseSelect4')"
                    :options="[
                      { label: '停用', value: 'DISABLED' },
                      { label: '启用', value: 'ENABLED' },
                    ]"
                  />
                </n-form-item>
              </div>

              <!-- Third Row: Category Description -->
              <n-form-item :label="$t('finance.text75')" path="badge">
                <n-input
                  v-model:value="categoryForm.badge"
                 :placeholder="$t('finance.pleaseEnter1')"
                  :maxlength="12"
                  show-count
                  clearable
                />
              </n-form-item>
            </n-form>

            <template #footer>
              <div style="display: flex; justify-content: flex-end; gap: 12px">
                <n-button @click="showCategoryModal = false">{{ $t('common.cancel') }}</n-button>
                <n-button
                  type="primary"
                  :loading="categoryModalLoading"
                  @click="handleSaveCategory"
                >{{ $t('common.confirm') }}</n-button>
              </div>
            </template>
          </n-card>
        </n-modal>
      </n-tab-pane>

      <n-tab-pane name="disabled-channels" :tab="$t('finance.disabledChannel')">
        <!-- Filter Section for Disabled Channels -->
        <n-card class="mb-4">
          <div class="filter-section">
            <!-- First Row: Search and Basic Filters -->
            <div class="filter-row">
              <n-input
                v-model:value="disabledChannelFilters.search"
               :placeholder="$t('finance.searchPaymentPlatformMerchantChannel')"
                style="width: 300px"
                clearable
                @keyup.enter="handleDisabledChannelSearch"
              >
                <template #prefix>
                  <n-icon><Search /></n-icon>
                </template>
              </n-input>

              <n-select
                v-model:value="disabledChannelFilters.platform"
               :placeholder="$t('finance.paymentPlatform')"
                style="width: 150px"
                :options="platformOptions"
                clearable
              />

              <n-select
                v-model:value="disabledChannelFilters.currency"
               :placeholder="$t('common.currency')"
                style="width: 120px"
                :options="currencyOptions"
                clearable
              />

              <n-select
                v-model:value="disabledChannelFilters.memberLevel"
               :placeholder="$t('finance.memberTier')"
                style="width: 150px"
                :options="memberLevelOptions"
                clearable
              />

              <n-button type="primary" @click="handleDisabledChannelSearch"
                >{{ $t('common.search') }}</n-button
              >
              <n-button @click="handleDisabledChannelReset">{{ $t('common.reset') }}</n-button>
            </div>

            <!-- Second Row: Action Buttons -->
            <div class="filter-row">
              <n-space>
                <n-button
                  type="success"
                  @click="handleBatchEnableChannels"
                  :disabled="!selectedDisabledChannels.length"
                >
                  <template #icon>
                    <n-icon><CheckCircle /></n-icon>
                  </template>
                  批量启用 ({{ selectedDisabledChannels.length }})
                </n-button>
                <n-button
                  type="error"
                  @click="handleBatchDeleteChannels"
                  :disabled="!selectedDisabledChannels.length"
                >
                  <template #icon>
                    <n-icon><Trash /></n-icon>
                  </template>
                  批量删除 ({{ selectedDisabledChannels.length }})
                </n-button>
              </n-space>

              <div class="ml-auto">
                <n-tag type="warning" size="medium">
                  <template #icon>
                    <n-icon><Warning /></n-icon>
                  </template>
                  已停用通道:
                  {{ disabledChannelPaginationConfig.itemCount || 0 }}
                </n-tag>
              </div>
            </div>
          </div>
        </n-card>

        <!-- Disabled Channels Table -->
        <n-card>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-lg font-medium text-gray-700"
                >{{ $t('finance.ksaduq') }}</span
              >
              <n-tooltip trigger="hover">
                <template #trigger>
                  <n-icon size="16" class="cursor-help text-gray-400">
                    <Information />
                  </n-icon>
                </template>{{ $t('finance.k1782444246490') }}</n-tooltip>
            </div>
          </template>

          <!-- Grouped Display by Category -->
          <div v-if="groupedDisabledChannels.length > 0" class="space-y-6">
            <div
              v-for="group in groupedDisabledChannels"
              :key="group.category"
              class="category-group"
            >
              <!-- Category Header -->
              <div class="category-header">
                <div class="mb-4 flex items-center gap-4">
                  <div class="category-icon">
                    <img
                      v-if="group.categoryIcon"
                      :src="group.categoryIcon"
                      :alt="group.category"
                      class="h-12 w-12 rounded-lg object-cover"
                    />
                    <div
                      v-else
                      class="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200"
                    >
                      <span class="text-xs text-gray-500">{{
                        group.category
                      }}</span>
                    </div>
                  </div>
                  <div class="flex-1">
                    <h3 class="text-lg font-medium text-gray-800">
                      {{ group.category }}
                    </h3>
                    <p class="text-sm text-gray-500">
                      已停用通道: {{ group.channels.length }} 个
                    </p>
                  </div>
                  <div class="flex items-center gap-2">
                    <n-button
                      type="success"
                      size="small"
                      :disabled="
                        !getSelectedChannelsInGroup(group.category).length
                      "
                      @click="handleBatchEnableChannelsInGroup(group.category)"
                    >
                      <template #icon>
                        <n-icon><CheckCircle /></n-icon>
                      </template>
                      批量启用 ({{
                        getSelectedChannelsInGroup(group.category).length
                      }})
                    </n-button>
                    <n-button
                      v-if="!group.expanded"
                      type="info"
                      size="small"
                      @click="toggleGroupExpanded(group.category)"
                    >
                      展开 ({{ group.channels.length }})
                    </n-button>
                    <n-button
                      v-else
                      type="default"
                      size="small"
                      @click="toggleGroupExpanded(group.category)"
                    >{{ $t('finance.k1782444246491') }}</n-button>
                  </div>
                </div>
              </div>

              <!-- Channels Table for this Category -->
              <div v-show="group.expanded" class="category-content">
                <n-data-table
                  :columns="disabledChannelColumns"
                  :data="group.channels"
                  :loading="disabledChannelTableLoading"
                  :row-key="(row: any) => row.id"
                  v-model:checked-row-keys="selectedDisabledChannels"
                  checkable
                  size="small"
                  :scroll-x="1200"
                  striped
                  :pagination="false"
                />
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="!disabledChannelTableLoading"
            class="py-8 text-center"
          >
            <n-empty :description="$t('finance.noDisabledChannel')">
              <template #extra>
                <n-button
                  type="primary"
                  @click="activeTab = 'third-party-channels'"
                >{{ $t('finance.k17824442464911') }}</n-button>
              </template>
            </n-empty>
          </div>

          <!-- Loading State -->
          <div v-else class="py-8 text-center">
            <n-spin size="large" />
          </div>

          <!-- Overall Pagination -->
          <div
            v-if="groupedDisabledChannels.length > 0"
            class="mt-4 flex justify-end"
          >
            <n-pagination
              v-model:page="disabledChannelPaginationConfig.page"
              v-model:page-size="disabledChannelPaginationConfig.pageSize"
              :item-count="disabledChannelPaginationConfig.itemCount"
              :page-sizes="disabledChannelPaginationConfig.pageSizes"
              show-size-picker
              @update:page="handleDisabledChannelPageChange"
              @update:page-size="handleDisabledChannelPageSizeChange"
            />
          </div>
        </n-card>

        <!-- Batch Operations Confirmation Modal -->
        <n-modal v-model:show="showBatchOperationModal" :mask-closable="false">
          <n-card
            style="width: 500px"
            :title="
              batchOperationType === 'enable' ? '批量启用通道' : '批量删除通道'
            "
            :bordered="false"
            size="huge"
            role="dialog"
            aria-modal="true"
          >
            <div class="space-y-4">
              <n-alert
                :type="batchOperationType === 'enable' ? 'success' : 'error'"
                :title="
                  batchOperationType === 'enable' ? '确认启用' : '确认删除'
                "
              >
                {{
                  batchOperationType === 'enable'
                    ? `您确定要启用以下 ${selectedDisabledChannels.length} 个通道吗？启用后通道将重新可用。`
                    : `您确定要删除以下 ${selectedDisabledChannels.length} 个通道吗？此操作不可撤销！`
                }}
              </n-alert>

              <div class="max-h-60 overflow-y-auto">
                <n-list>
                  <n-list-item
                    v-for="channelId in selectedDisabledChannels"
                    :key="channelId"
                  >
                    <template #prefix>
                      <n-icon
                        :color="
                          batchOperationType === 'enable'
                            ? '#18a058'
                            : '#d03050'
                        "
                      >
                        <component
                          :is="
                            batchOperationType === 'enable'
                              ? CheckCircle
                              : Warning
                          "
                        />
                      </n-icon>
                    </template>
                    {{ getChannelDisplayName(channelId) }}
                  </n-list-item>
                </n-list>
              </div>
            </div>

            <template #footer>
              <div class="flex justify-end gap-3">
                <n-button @click="showBatchOperationModal = false"
                  >{{ $t('common.cancel') }}</n-button
                >
                <n-button
                  :type="batchOperationType === 'enable' ? 'success' : 'error'"
                  @click="confirmBatchOperation"
                  :loading="batchOperationLoading"
                >
                  {{
                    batchOperationType === 'enable' ? '确认启用' : '确认删除'
                  }}
                </n-button>
              </div>
            </template>
          </n-card>
        </n-modal>
      </n-tab-pane>

      <n-tab-pane name="third-party-channels" :tab="$t('finance.thirdPartyPaymentChannel')">
        <!-- Filter Section -->
        <n-card class="mb-4">
          <div class="filter-section">
            <!-- First Row: Dropdowns -->
            <div class="filter-row">
              <n-select
                v-model:value="channelFilters.platform"
               :placeholder="$t('finance.thirdPartyPaymentPlatform')"
                style="width: 150px"
                :options="platformOptions"
                clearable
              />
              <n-select
                v-model:value="channelFilters.gateway"
               :placeholder="$t('finance.paymentChannel')"
                style="width: 120px"
                :options="gatewayOptions"
                clearable
              />
              <n-select
                v-model:value="channelFilters.channelName"
               :placeholder="$t('finance.channel1')"
                style="width: 120px"
                :options="channelNameOptions"
                clearable
              />
              <n-select
                v-model:value="channelFilters.currency"
               :placeholder="$t('finance.channelCurrency')"
                style="width: 120px"
                :options="currencyOptions"
                clearable
              />
              <n-select
                v-model:value="channelFilters.memberLevel"
               :placeholder="$t('finance.memberTier')"
                style="width: 150px"
                :options="memberLevelOptions"
                clearable
              />
            </div>

            <!-- Second Row: Search and Actions -->
            <div class="filter-row">
              <n-input
                v-model:value="channelFilters.search"
               :placeholder="$t('finance.enterThirdPartyMerchantIdChannelRemark')"
                style="width: 300px"
                clearable
                @keyup.enter="handleChannelSearch"
              />
              <n-button type="primary" @click="handleChannelSearch"
                >{{ $t('common.search') }}</n-button
              >
              <n-button @click="handleChannelReset">{{ $t('common.reset') }}</n-button>
              <div class="ml-auto">
                <n-button type="primary" @click="handleAddChannel"
                  >{{ $t('finance.k3vbf8') }}</n-button
                >
              </div>
            </div>
          </div>
        </n-card>

        <!-- SmartDataGrid for Third Party Channels -->
        <SmartDataGrid
          :data="channelTableData"
          :columns="channelColumns"
          :loading="channelLoading"
          :pagination="channelPaginationReactive"
          :row-key="(row: ThirdPartyChannel) => row.merchantId"
          striped
          size="small"
          :scroll-x="3000"
          @update:page="handleChannelPageChange"
          @update:page-size="handleChannelPageSizeChange"
          @refresh="fetchChannelData"
          @row-click="handleChannelRowClick"
        >
          <template #actionBar="{ selectedCount, selectedRows }">
            <n-card :bordered="false" class="rounded-16px shadow-sm">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <!-- 主要操作按钮 -->
                  <div class="flex gap-2">
                    <n-button type="primary" @click="handleAddChannel"
                      >{{ $t('finance.k3vbf8') }}</n-button
                    >
                  </div>

                  <!-- 选择信息 -->
                  <div class="text-sm text-gray-600">
                    {{ $t('finance.totalRecordsWithCount', { count: channelPaginationReactive.total }) }}
                  </div>
                </div>

                <div class="flex items-center gap-4">
                  <!-- 选择控制 -->
                  <div class="flex gap-2">
                    <n-button size="small" @click="handleChannelReset"
                      >{{ $t('finance.kcdgqo') }}</n-button
                    >
                    <n-button size="small" @click="fetchChannelData"
                      >{{ $t('finance.k6efv0') }}</n-button
                    >
                  </div>
                </div>
              </div>
            </n-card>
          </template>
        </SmartDataGrid>

        <!-- Edit/Add Channel Modal -->
        <n-modal
          v-model:show="showChannelModal"
          :mask-closable="false"
          style="width: 1000px; max-height: 95vh"
        >
          <n-card
           :title="$t('common.edit')"
            :bordered="false"
            size="huge"
            role="dialog"
            aria-modal="true"
            style="max-height: 95vh; overflow: hidden"
          >
            <template #header-extra>
              <n-button quaternary circle @click="handleCloseChannelModal">
                <template #icon>
                  <n-icon><Close /></n-icon>
                </template>
              </n-button>
            </template>

            <div
              style="
                max-height: calc(95vh - 180px);
                overflow-y: auto;
                padding: 20px;
              "
            >
              <n-form
                ref="channelFormRef"
                :model="channelForm"
                :rules="channelRules"
                label-placement="left"
                label-width="120px"
                :show-feedback="false"
              >
                <!-- Row 1: Currency and Third Party Payment -->
                <div class="mb-6 grid grid-cols-2 gap-6">
                  <n-form-item :label="$t('finance.channelCurrency')" path="currency" required>
                    <n-select
                      v-model:value="channelForm.currency"
                      :options="currencyOptions"
                      placeholder="BRL"
                    />
                  </n-form-item>

                  <n-form-item
                   :label="$t('finance.thirdPartyPayment1')"
                    path="thirdPartyPayment"
                    required
                  >
                    <n-select
                      v-model:value="channelForm.thirdPartyPayment"
                      :options="updatedThirdPartyOptions"
                      placeholder="UnivePay(BRL)"
                    />
                  </n-form-item>
                </div>

                <!-- Row 2: Platform & Merchant Info -->
                <div class="mb-6 grid grid-cols-2 gap-6">
                  <n-form-item
                   :label="$t('finance.thirdPartyPaymentPlatform1')"
                    path="platformName"
                    required
                  >
                    <n-input
                      v-model:value="channelForm.platformName"
                      placeholder="UnivePay(BRL)"
                      :maxlength="30"
                      show-count
                    />
                  </n-form-item>

                  <n-form-item :label="$t('finance.thirdPartyMerchantId')" path="merchantId" required>
                    <n-input
                      v-model:value="channelForm.merchantId"
                      placeholder="C94899"
                      :maxlength="100"
                      show-count
                    />
                  </n-form-item>
                </div>

                <!-- Row 3: Merchant Key -->
                <div class="mb-6">
                  <n-form-item :label="$t('finance.merchantKey')" path="merchantKey">
                    <div class="flex items-center gap-2">
                      <n-input
                        v-model:value="channelForm.merchantKey"
                        placeholder="••••••••••••"
                        type="password"
                        show-password-on="click"
                        style="flex: 1"
                      />
                      <n-button size="small">{{ $t('finance.kbzi2g') }}</n-button>
                    </div>
                  </n-form-item>
                </div>

                <!-- Row 4: Status -->
                <div class="mb-6">
                  <n-form-item :label="$t('finance.successFlag')" path="successStatus" required>
                    <n-input
                      v-model:value="channelForm.successStatus"
                      placeholder="SUCCESS"
                      :maxlength="20"
                    />
                  </n-form-item>
                </div>

                <!-- Row 5: URLs -->
                <div class="mb-6">
                  <n-form-item :label="$t('finance.orderUrl')" path="orderUrl" required>
                    <n-input
                      v-model:value="channelForm.orderUrl"
                      placeholder="https://uspay.univepay.com/Payment/GlobalPay"
                      :maxlength="255"
                      show-count
                    />
                  </n-form-item>
                </div>

                <div class="mb-6">
                  <n-form-item :label="$t('finance.queryUrl')" path="queryUrl" required>
                    <n-input
                      v-model:value="channelForm.queryUrl"
                      placeholder="https://uspay.univepay.com/API/OrderQuery"
                      :maxlength="255"
                      show-count
                    />
                  </n-form-item>
                </div>

                <!-- Row 6: IP Whitelist -->
                <div class="mb-6">
                  <n-form-item :label="$t('finance.thirdPartyCallbackIp')" path="callbackIpWhitelist">
                    <n-input
                      v-model:value="channelForm.callbackIpWhitelist"
                      placeholder="206.190.237.175,3.236.96.173,52.91.82.61,18.205.95.173,44.213.172.47,52.44.4.48,54.227.130.231"
                      type="textarea"
                      :autosize="{ minRows: 2, maxRows: 4 }"
                    />
                  </n-form-item>
                </div>

                <!-- Channel Config Section -->
                <n-divider title-placement="left">
                  <span class="text-lg font-semibold">{{ $t('finance.k89gzp') }}</span>
                </n-divider>

                <!-- Channel Configuration -->
                <div class="mb-6 rounded-lg bg-gray-50 p-4">
                  <div class="mb-4 flex items-center justify-between">
                    <span class="text-sm text-gray-600">通道1参数配置</span>
                    <n-switch
                      v-model:value="channelConfigEnabled"
                      :round="false"
                    >
                      <template #checked>{{ $t('finance.kw4v1x') }}</template>
                      <template #unchecked>{{ $t('finance.kw4v1x') }}</template>
                    </n-switch>
                  </div>

                  <!-- Channel Settings Row 1 -->
                  <div class="mb-4 grid grid-cols-2 gap-4">
                    <n-form-item
                     :label="$t('finance.channel7')"
                      path="channelCategory"
                      required
                    >
                      <n-select
                        v-model:value="channelForm.channelCategory"
                        :options="rechargeCategoryOptions"
                       :placeholder="$t('finance.pleaseSelectConfig')"
                        style="width: 100%"
                      />
                    </n-form-item>

                    <n-form-item :label="$t('finance.channel2')" path="channelCode" required>
                      <n-input
                        v-model:value="channelForm.channelCode"
                        placeholder="100102"
                        :maxlength="50"
                      />
                    </n-form-item>
                  </div>

                  <div class="mb-4 grid grid-cols-2 gap-4">
                    <n-form-item :label="$t('finance.channel1')" path="channelName" required>
                      <n-input
                        v-model:value="channelForm.channelName"
                        placeholder="PIX1"
                        :maxlength="50"
                        show-count
                      />
                    </n-form-item>

                    <n-form-item :label="$t('finance.channel3')" path="channelType" required>
                      <n-select
                        v-model:value="channelForm.channelType"
                        :options="channelTypeOptions"
                       :placeholder="$t('finance.text18')"
                        style="width: 100%"
                      />
                    </n-form-item>
                  </div>

                  <!-- Member Level and Terminal -->
                  <div class="mb-4 grid grid-cols-1 gap-4">
                    <n-form-item :label="$t('finance.memberTier')" path="memberLevels">
                      <n-select
                        v-model:value="channelForm.memberLevels"
                        :options="memberTierOptions"
                        multiple
                       :placeholder="$t('finance.pleaseSelectMemberTier')"
                        :max-tag-count="5"
                        style="width: 100%"
                      />
                    </n-form-item>

                    <n-form-item :label="$t('finance.text19')" path="terminals">
                      <n-select
                        v-model:value="channelForm.terminals"
                        :options="terminalOptions"
                        multiple
                        placeholder="Android"
                        :max-tag-count="4"
                        style="width: 100%"
                      />
                    </n-form-item>
                  </div>

                  <!-- Amount Range and Settings -->
                  <div class="mb-4 grid grid-cols-2 gap-4">
                    <n-form-item :label="$t('finance.channelSingleLimit')">
                      <div class="flex items-center gap-2">
                        <n-input-number
                          v-model:value="channelForm.channelLimit.min"
                          placeholder="10.00"
                          :min="0"
                          :precision="2"
                          style="flex: 1"
                        />
                        <span>--</span>
                        <n-input-number
                          v-model:value="channelForm.channelLimit.max"
                          placeholder="50000.00"
                          :min="0"
                          :precision="2"
                          style="flex: 1"
                        />
                      </div>
                    </n-form-item>

                    <div class="flex items-center gap-4">
                      <n-form-item :label="$t('finance.yesNoEnter')" path="requireName">
                        <n-switch v-model:value="channelForm.requireName" />
                      </n-form-item>

                      <n-form-item :label="$t('finance.channelEnable')" path="isActive">
                        <n-switch v-model:value="channelForm.isActive" />
                      </n-form-item>
                    </div>
                  </div>

                  <!-- Additional Settings -->
                  <div class="mb-4 grid grid-cols-2 gap-4">
                    <n-form-item :label="$t('finance.channel8')" path="customBadge">
                      <n-input
                        v-model:value="channelForm.customBadge"
                       :placeholder="$t('finance.pleaseEnterChannel2')"
                        :maxlength="20"
                        show-count
                      />
                    </n-form-item>

                    <n-form-item :label="$t('finance.fee1')" path="feeRate">
                      <div class="flex items-center">
                        <n-input-number
                          v-model:value="channelForm.feeRate"
                          placeholder="0.00"
                          :min="0"
                          :max="100"
                          :precision="2"
                          style="flex: 1"
                        />
                        <span class="ml-1">%</span>
                      </div>
                    </n-form-item>
                  </div>

                  <div class="mb-4 grid grid-cols-2 gap-4">
                    <n-form-item :label="$t('finance.channel4')" path="channelFeeRate">
                      <div class="flex items-center">
                        <n-input-number
                          v-model:value="channelForm.channelFeeRate"
                          placeholder="0.00"
                          :min="0"
                          :max="100"
                          :precision="2"
                          style="flex: 1"
                        />
                        <span class="ml-1">%</span>
                      </div>
                    </n-form-item>

                    <n-form-item :label="$t('finance.ratio1')" path="bonusRate">
                      <div class="flex items-center">
                        <n-input-number
                          v-model:value="channelForm.bonusRate"
                          placeholder="0.00"
                          :min="0"
                          :max="100"
                          :precision="2"
                          style="flex: 1"
                        />
                        <span class="ml-1">%</span>
                      </div>
                    </n-form-item>
                  </div>

                  <!-- Fee Configuration Buttons -->
                  <div class="mb-4 flex gap-2">
                    <n-button
                      size="small"
                      type="primary"
                      @click="showFeeReductionModal = true"
                      >{{ $t('finance.configFee') }}</n-button
                    >
                    <n-button
                      size="small"
                      type="info"
                      @click="showBonusConfigModal = true"
                      >{{ $t('finance.configRecharge') }}</n-button
                    >
                    <n-button
                      size="small"
                      type="warning"
                      @click="showRecommendedAmountModal = true"
                      >{{ $t('finance.configAmount') }}</n-button
                    >
                  </div>

                  <!-- Pre-configured Amounts (Read-only, populated from configuration) -->
                  <div class="mb-4">
                    <n-form-item :label="$t('finance.channelAmount')" path="recommendedAmounts">
                      <n-input
                        v-model:value="channelForm.recommendedAmounts"
                       :placeholder="$t('finance.k1782444246431')"
                        :maxlength="255"
                        readonly
                        disabled
                      >
                        <template #suffix>
                          <n-tooltip trigger="hover">
                            <template #trigger>
                              <n-icon :size="16" class="text-gray-400">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path
                                    fill-rule="evenodd"
                                    d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
                                    clip-rule="evenodd"
                                  />
                                </svg>
                              </n-icon>
                            </template>
                            此字段由 "配置推荐金额" 标签页自动生成，无法手动编辑
                          </n-tooltip>
                        </template>
                      </n-input>
                    </n-form-item>
                  </div>

                  <!-- Notification Message -->
                  <div class="mb-4">
                    <n-form-item :label="$t('finance.text76')" path="notificationMessage">
                      <n-input
                        v-model:value="channelForm.notificationMessage"
                       :placeholder="$t('finance.enterChannelSelect1000')"
                        type="textarea"
                        :autosize="{ minRows: 2, maxRows: 4 }"
                        :maxlength="1000"
                        show-count
                      />
                      <div class="mt-1 text-xs text-gray-500">{{ $t('finance.k1782444246498') }}</div>
                    </n-form-item>
                  </div>
                </div>
              </n-form>
            </div>

            <template #footer>
              <div class="flex justify-end gap-3">
                <n-button @click="handleCloseChannelModal">{{ $t('common.cancel') }}</n-button>
                <n-button
                  type="primary"
                  @click="handleSaveChannel"
                  :loading="channelModalLoading"
                >{{ $t('common.confirm') }}</n-button>
              </div>
            </template>
          </n-card>
        </n-modal>

        <!-- Bonus Config Modal - 配置充值赠送 -->
        <n-modal
          v-model:show="showBonusConfigModal"
         :title="$t('finance.configRecharge')"
          preset="card"
          style="width: 900px; max-height: 85vh"
          @update:show="(show) => !show && handleCloseBonusModal()"
        >
          <div style="max-height: 70vh; overflow-y: auto; padding: 0 16px">
            <div class="mb-6 rounded border-l-4 border-blue-500 bg-blue-50 p-4">
              <div class="text-sm text-blue-800">
                <strong>{{ $t('finance.k1782444246499') }}</strong>{{ $t('finance.k1782443383347') }}</div>
            </div>
            <n-form
              ref="bonusFormRef"
              :model="bonusForm"
              :rules="bonusRules"
              label-placement="left"
              label-width="140px"
              class="space-y-6"
            >
              <!-- Bonus Display Options -->
              <n-form-item :label="$t('finance.text77')" path="showBubble" class="mb-6">
                <n-radio-group
                  v-model:value="bonusForm.showBubble"
                  class="w-full"
                >
                  <n-radio value="hide" class="mr-8">{{ $t('finance.kvptj0') }}</n-radio>
                  <n-radio value="show" class="mr-8">{{ $t('finance.ktkm2k') }}</n-radio>
                </n-radio-group>
              </n-form-item>

              <!-- Bubble Color Options -->
              <n-form-item :label="$t('finance.text122')" path="bubbleColor" class="mb-6">
                <n-radio-group
                  v-model:value="bonusForm.bubbleColor"
                  class="w-full"
                >
                  <n-radio value="red" class="mr-6">
                    <n-tag type="error" size="small">{{ $t('finance.k2u8eo') }}</n-tag>
                  </n-radio>
                  <n-radio value="green" class="mr-6">
                    <n-tag type="success" size="small">{{ $t('finance.kw47yw') }}</n-tag>
                  </n-radio>
                  <n-radio value="blue" class="mr-6">
                    <n-tag type="info" size="small">{{ $t('finance.k16p0l') }}</n-tag>
                  </n-radio>
                  <n-radio value="orange" class="mr-6">
                    <n-tag type="warning" size="small">{{ $t('finance.kg8tns') }}</n-tag>
                  </n-radio>
                </n-radio-group>
              </n-form-item>

              <!-- Member Level Options -->
              <n-form-item :label="$t('finance.memberTier')" path="memberLevel" class="mb-6">
                <n-radio-group
                  v-model:value="bonusForm.memberLevel"
                  class="w-full"
                >
                  <n-radio value="no-limit" class="mr-8">{{ $t('finance.ki5ekw') }}</n-radio>
                  <n-radio value="by-level" class="mr-8"
                    >{{ $t('finance.k0088i') }}</n-radio
                  >
                </n-radio-group>
                <div class="mt-1 text-xs text-gray-500">{{ $t('finance.k1782444246504') }}<br />{{ $t('finance.k1782444246505') }}</div>
              </n-form-item>

              <!-- Amount Ranges Configuration -->
              <div class="mb-6 space-y-4">
                <div class="mb-3 text-sm font-medium text-gray-700">{{ $t('finance.k17824442465051') }}</div>
                <div
                  v-for="(range, index) in bonusForm.amountRanges"
                  :key="index"
                  class="flex items-center gap-4 rounded border bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                >
                  <div class="flex items-center gap-2">
                    <span class="w-44 text-sm font-medium text-gray-700"
                      >{{ range.minAmount }} 到 {{ range.maxAmount }} R$</span
                    >
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="w-20 text-xs text-gray-500">固定金额:</span>
                    <n-input-number
                      v-model:value="range.fixedAmount"
                      :min="0"
                      :precision="2"
                     :placeholder="$t('finance.pleaseEnter5')"
                      style="width: 160px"
                    />
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="w-16 text-xs text-gray-500">比例:</span>
                    <n-input-number
                      v-model:value="range.bonusRate"
                      :min="0"
                      :max="100"
                      :precision="1"
                      style="width: 120px"
                    />
                    <span class="text-xs font-medium text-gray-600">%</span>
                  </div>
                  <n-button
                    size="tiny"
                    @click="removeAmountRange(index)"
                    v-if="bonusForm.amountRanges.length > 1"
                    class="ml-auto"
                  >
                    <template #icon>
                      <n-icon><Close /></n-icon>
                    </template>
                  </n-button>
                </div>
                <n-button
                  type="primary"
                  dashed
                  size="small"
                  @click="addAmountRange"
                  class="mt-2"
                >
                  <template #icon>
                    <n-icon><Plus /></n-icon>
                  </template>{{ $t('finance.k17824442465062') }}</n-button>
              </div>

              <!-- Bonus Limit -->
              <n-form-item :label="$t('finance.amount6')" class="mb-6">
                <div class="flex items-center gap-2">
                  <n-input
                    v-model:value="bonusForm.bonusLimit"
                   :placeholder="$t('finance.pleaseEnterAmount2')"
                    style="width: 280px"
                  />
                </div>
              </n-form-item>

              <!-- Daily Limit -->
              <n-form-item :label="$t('finance.count3')" class="mb-6">
                <n-radio-group
                  v-model:value="bonusForm.dailyLimitType"
                  class="mb-3 w-full"
                >
                  <n-radio value="daily" class="mr-8">{{ $t('finance.kz4vgv') }}</n-radio>
                  <n-radio value="total" class="mr-8">{{ $t('finance.k2i5dq') }}</n-radio>
                </n-radio-group>
                <div class="flex items-center gap-2">
                  <n-input
                    v-model:value="bonusForm.dailyLimit"
                   :placeholder="$t('finance.pleaseEnterCountCount')"
                    style="width: 380px"
                  />
                </div>
                <div class="mt-2 text-xs text-gray-500">{{ $t('finance.k1782444246507') }}</div>
              </n-form-item>
            </n-form>
          </div>

          <template #footer>
            <div class="flex justify-end gap-3 px-4 py-2">
              <n-button size="large" @click="handleCloseBonusModal"
                >{{ $t('common.cancel') }}</n-button
              >
              <n-button
                type="primary"
                size="large"
                @click="handleSaveBonusConfig"
                :loading="bonusModalLoading"
              >{{ $t('common.confirm') }}</n-button>
            </div>
          </template>
        </n-modal>

        <!-- Fee Reduction Modal - 配置手续费减免 -->
        <n-modal
          v-model:show="showFeeReductionModal"
         :title="$t('finance.configFee')"
          preset="card"
          style="width: 600px"
        >
          <n-form
            ref="feeReductionFormRef"
            :model="feeReductionForm"
            label-placement="left"
            label-width="140px"
          >
            <n-form-item :label="$t('finance.recharge12')" required>
              <div class="flex items-center gap-2">
                <n-input
                  v-model:value="feeReductionForm.rechargeLimit"
                 :placeholder="$t('finance.pleaseEnterRecharge')"
                  style="width: 200px"
                />
                <span>{{ $t('finance.ko2ian') }}</span>
              </div>
              <div class="mt-1 text-xs text-gray-500">{{ $t('finance.k1782444246508') }}</div>
            </n-form-item>

            <n-form-item :label="$t('finance.singleRechargeAmount')" required>
              <div class="flex items-center gap-2">
                <span class="text-sm">R$</span>
                <n-input
                  v-model:value="feeReductionForm.singleAmountLimit"
                 :placeholder="$t('finance.pleaseEnterSingleRechargeAmount')"
                  style="width: 200px"
                />
              </div>
              <div class="mt-1 text-xs text-gray-500">{{ $t('finance.k17824442465081') }}</div>
            </n-form-item>

            <n-form-item :label="$t('finance.text118')" required>
              <div class="flex items-center gap-2">
                <n-input
                  v-model:value="feeReductionForm.reductionPercentage"
                 :placeholder="$t('finance.pleaseEnter3')"
                  style="width: 200px"
                />
                <span>%</span>
              </div>
              <div class="mt-1 text-xs text-gray-500">
                例如：填入60%，表示减免总手续费的60%
              </div>
            </n-form-item>
          </n-form>

          <template #footer>
            <div class="flex justify-end gap-2">
              <n-button @click="showFeeReductionModal = false">{{ $t('common.cancel') }}</n-button>
              <n-button type="primary" @click="handleSaveFeeReduction">{{ $t('common.confirm') }}</n-button>
            </div>
          </template>
        </n-modal>

        <!-- Recommended Amount Modal - 配置推荐金额 -->
        <n-modal
          v-model:show="showRecommendedAmountModal"
         :title="$t('finance.configAmount')"
          preset="card"
          style="width: 1000px; max-height: 80vh"
        >
          <div style="max-height: 70vh; overflow-y: auto">
            <n-form
              ref="recommendedAmountFormRef"
              :model="recommendedAmountForm"
              label-placement="left"
              label-width="100px"
            >
              <!-- Amount Type Selection -->
              <n-form-item :label="$t('finance.recharge9')">
                <n-radio-group v-model:value="recommendedAmountForm.amountType">
                  <n-radio value="可输入任意金额">{{ $t('finance.enterAnyAmount') }}</n-radio>
                  <n-radio value="仅限固定金额">{{ $t('finance.onlyAmount') }}</n-radio>
                </n-radio-group>
              </n-form-item>

              <!-- Recommended Amount Settings -->
              <div class="mb-4">
                <div class="grid grid-cols-2 gap-6">
                  <!-- Left Column -->
                  <div>
                    <h4 class="mb-3 font-medium">{{ $t('finance.kzp2za') }}</h4>
                    <div class="space-y-3">
                      <div
                        v-for="(
                          amount, index
                        ) in recommendedAmountForm.amounts.slice(0, 4)"
                        :key="index"
                        class="flex items-center gap-3"
                      >
                        <div class="flex items-center gap-2">
                          <span class="w-20 text-sm">推荐金额(R$)</span>
                          <n-input
                            v-model:value="amount.amount"
                            style="width: 100px"
                          />
                        </div>
                        <n-select
                          v-model:value="amount.bonusType"
                          :options="[
                            { label: '按比例', value: '按比例' },
                            { label: '固定金额', value: '固定金额' },
                          ]"
                          style="width: 100px"
                        />
                        <div class="flex items-center gap-2">
                          <n-input
                            v-model:value="amount.bonusValue"
                            style="width: 100px"
                           :placeholder="$t('finance.enterRatio')"
                          />
                          <span>%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Right Column -->
                  <div>
                    <div class="mt-8 space-y-3">
                      <div
                        v-for="(
                          amount, index
                        ) in recommendedAmountForm.amounts.slice(4, 8)"
                        :key="index + 4"
                        class="flex items-center gap-3"
                      >
                        <div class="flex items-center gap-2">
                          <span class="w-20 text-sm">推荐金额(R$)</span>
                          <n-input
                            v-model:value="amount.amount"
                            style="width: 100px"
                          />
                        </div>
                        <n-select
                          v-model:value="amount.bonusType"
                          :options="[
                            { label: '按比例', value: '按比例' },
                            { label: '固定金额', value: '固定金额' },
                          ]"
                          style="width: 100px"
                        />
                        <div class="flex items-center gap-2">
                          <n-input
                            v-model:value="amount.bonusValue"
                            style="width: 100px"
                           :placeholder="$t('finance.enterRatio')"
                          />
                          <span>%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mb-4 text-xs text-gray-500">
                说明:
                会员按推荐金额充值才可获对应加赠，加赠金额与充值赠送金额加赠合出。
              </div>
            </n-form>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <n-button @click="showRecommendedAmountModal = false"
                >{{ $t('common.cancel') }}</n-button
              >
              <n-button type="primary" @click="handleSaveRecommendedAmount">{{ $t('common.confirm') }}</n-button>
            </div>
          </template>
        </n-modal>
      </n-tab-pane>

      <n-tab-pane name="third-party-statistics" :tab="$t('finance.thirdPartyStatistics')">
        <!-- Statistics Filter Section -->
        <n-card class="mb-4">
          <div class="filter-section">
            <!-- Date and Filter Row -->
            <div class="filter-row">
              <n-space align="center">
                <span class="filter-label">时间:</span>
                <n-date-picker
                  v-model:value="statsFilters.startDate"
                  type="date"
                  :time-zone="timezone"
                 :placeholder="$t('finance.startDate')"
                  style="width: 140px"
                />
                <span class="text-gray-500">-</span>
                <n-date-picker
                  v-model:value="statsFilters.endDate"
                  type="date"
                  :time-zone="timezone"
                 :placeholder="$t('finance.endDate')"
                  style="width: 140px"
                />

                <span class="filter-label ml-4">三方支付:</span>
                <n-select
                  v-model:value="statsFilters.platform"
                 :placeholder="$t('finance.pleaseSelectThirdPartyPayment')"
                  style="width: 160px"
                  :options="platformOptions"
                  clearable
                />

                <span class="filter-label">通道所属大类:</span>
                <n-select
                  v-model:value="statsFilters.category"
                 :placeholder="$t('finance.channel7')"
                  style="width: 140px"
                  :options="categoryOptions"
                  clearable
                />

                <n-button type="primary" @click="handleStatsSearch"
                  >{{ $t('common.search') }}</n-button
                >
                <n-button @click="handleStatsReset">{{ $t('common.reset') }}</n-button>
              </n-space>
            </div>
          </div>
        </n-card>

        <!-- Statistics Table -->
        <n-card>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-lg font-medium">{{ $t('finance.ki8ax2') }}</span>
              <n-space>
                <n-tag type="info" size="medium">
                  <template #icon>
                    <n-icon><Information /></n-icon>
                  </template>
                  统计时间: {{ formatStatsDateRange() }}
                </n-tag>
                <n-button type="info" size="small" @click="handleExportStats">
                  <template #icon>
                    <n-icon><Download /></n-icon>
                  </template>{{ $t('common.exportReport') }}</n-button>
                <n-button
                  type="primary"
                  size="small"
                  @click="handleRefreshStats"
                >
                  <template #icon>
                    <n-icon><Refresh /></n-icon>
                  </template>{{ $t('finance.k6efv0') }}</n-button>
              </n-space>
            </div>
          </template>

          <SmartDataGrid
            :data="statsTableData"
            :columns="statsColumns"
            :loading="statsTableLoading"
            :pagination="statsPaginationReactive"
            size="small"
            :scroll-x="1800"
            striped
            @update:page="handleStatsPageChange"
            @update:page-size="handleStatsPageSizeChange"
            @refresh="handleRefreshStats"
            @row-click="handleStatsRowClick"
          >
            <template #actionBar="{ selectedCount, selectedRows }">
              <n-card :bordered="false" class="rounded-16px shadow-sm">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <!-- 主要操作按钮 -->
                    <div class="flex gap-2">
                      <n-button
                        type="info"
                        size="small"
                        @click="handleExportStats"
                      >
                        <template #icon>
                          <n-icon><Download /></n-icon>
                        </template>{{ $t('common.exportReport') }}</n-button>
                      <n-button
                        type="primary"
                        size="small"
                        @click="handleRefreshStats"
                      >
                        <template #icon>
                          <n-icon><Refresh /></n-icon>
                        </template>{{ $t('finance.k6efv0') }}</n-button>
                    </div>

                    <!-- 统计信息 -->
                    <div class="text-sm text-gray-600">
                      统计时间: {{ formatStatsDateRange() }}，共
                      {{ statsPaginationReactive.total }} 条记录
                    </div>
                  </div>

                  <div class="flex items-center gap-4">
                    <!-- 统计标签 -->
                    <n-tag type="info" size="medium">
                      <template #icon>
                        <n-icon><Information /></n-icon>
                      </template>{{ $t('finance.ki8ax2') }}</n-tag>
                  </div>
                </div>
              </n-card>
            </template>

            <template #empty>
              <div class="py-8 text-center">
                <n-empty :description="$t('finance.noStatisticsData')">
                  <template #extra>
                    <n-text depth="3" class="text-sm">{{ $t('finance.k1782444246513') }}</n-text>
                  </template>
                </n-empty>
              </div>
            </template>
          </SmartDataGrid>
        </n-card>

        <!-- Statistics Summary Cards -->
        <div class="mt-4 grid grid-cols-4 gap-4">
          <n-card size="small">
            <n-statistic
             :label="$t('finance.transactionCount')"
              :value="statsSummary.totalTransactions"
            >
              <template #suffix>{{ $t('finance.k1mpan') }}</template>
            </n-statistic>
          </n-card>
          <n-card size="small">
            <n-statistic
             :label="$t('finance.successTransactionCount')"
              :value="statsSummary.successTransactions"
            >
              <template #suffix>{{ $t('finance.k1mpan') }}</template>
            </n-statistic>
          </n-card>
          <n-card size="small">
            <n-statistic
             :label="$t('finance.transactionAmount')"
              :value="statsSummary.totalAmount"
              :precision="2"
            >
              <template #suffix>BRL</template>
            </n-statistic>
          </n-card>
          <n-card size="small">
            <n-statistic
             :label="$t('finance.successRate1')"
              :value="statsSummary.overallSuccessRate"
              :precision="2"
              :value-style="{
                color:
                  statsSummary.overallSuccessRate >= 95
                    ? '#18a058'
                    : statsSummary.overallSuccessRate >= 85
                      ? '#f0a020'
                      : '#d03050',
              }"
            >
              <template #suffix>%</template>
            </n-statistic>
          </n-card>
        </div>
      </n-tab-pane>
    </n-tabs>

    <!-- Preset Order Modal -->
    <n-modal v-model:show="showPresetOrderModal" :mask-closable="false">
      <n-card
        style="width: 600px"
       :title="$t('finance.createOrder')"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <template #header-extra>
          <n-button quaternary circle @click="showPresetOrderModal = false">
            <n-icon><Close /></n-icon>
          </n-button>
        </template>

        <n-form
          :model="presetOrderForm"
          label-placement="left"
          label-width="120px"
          require-mark-placement="right-hanging"
        >
          <n-form-item :label="$t('finance.memberId')" path="memberId" required>
            <n-auto-complete
              v-model:value="presetOrderForm.memberId"
              :options="memberOptions"
              :loading="memberLoading"
             :placeholder="$t('finance.pleaseEnterMemberIdAccountSearch')"
              clearable
              @input="handleMemberInput"
              @select="handleMemberSelect"
              @clear="handleMemberClear"
            />
          </n-form-item>

          <div
            v-if="selectedMember"
            class="mb-4 rounded border border-blue-200 bg-blue-50 p-3 text-sm"
          >
            <div class="mb-2 text-xs font-medium text-blue-600">{{ $t('finance.k1782444246514') }}</div>
            <div class="space-y-1">
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('finance.memberId') }}:</span>
                <span class="font-medium text-gray-900">{{
                  selectedMember.value
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">账号:</span>
                <span class="font-medium text-gray-900">{{
                  selectedMember.account
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">姓名:</span>
                <span class="font-medium text-gray-900">{{
                  selectedMember.name || 'N/A'
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('finance.vIPLevel') }}:</span>
                <span class="font-medium text-gray-900">{{
                  selectedMember.vipLevel
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">余额:</span>
                <span class="font-medium text-green-600">{{
                  formatCurrency(selectedMember.balance)
                }}</span>
              </div>
            </div>
          </div>
        </n-form>

        <template #footer>
          <div style="display: flex; justify-content: flex-end; gap: 12px">
            <n-button @click="showPresetOrderModal = false">{{ $t('common.cancel') }}</n-button>
            <n-button
              type="primary"
              :loading="presetOrderLoading"
              @click="handleConfirmPresetOrder"
            >{{ $t('finance.confirm3') }}</n-button>
          </div>
        </template>
      </n-card>
    </n-modal>

    <!-- Supplement Order Modal -->
    <n-modal v-model:show="showSupplementOrderModal" :mask-closable="false">
      <n-card
        style="width: 600px"
       :title="$t('finance.createSupplementaryOrder')"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <template #header-extra>
          <n-button quaternary circle @click="showSupplementOrderModal = false">
            <n-icon><Close /></n-icon>
          </n-button>
        </template>

        <n-form
          :model="supplementOrderForm"
          label-placement="left"
          label-width="120px"
          require-mark-placement="right-hanging"
        >
          <n-form-item :label="$t('finance.memberId')" path="memberId" required>
            <n-auto-complete
              v-model:value="supplementOrderForm.memberId"
              :options="memberOptions"
              :loading="memberLoading"
             :placeholder="$t('finance.pleaseEnterMemberIdAccountSearch')"
              clearable
              @input="handleMemberInput"
              @select="handleMemberSelect"
              @clear="handleMemberClear"
            />
          </n-form-item>

          <div
            v-if="selectedMember"
            class="mb-4 rounded border border-blue-200 bg-blue-50 p-3 text-sm"
          >
            <div class="mb-2 text-xs font-medium text-blue-600">{{ $t('finance.k1782444246514') }}</div>
            <div class="space-y-1">
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('finance.memberId') }}:</span>
                <span class="font-medium text-gray-900">{{
                  selectedMember.value
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">账号:</span>
                <span class="font-medium text-gray-900">{{
                  selectedMember.account
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">姓名:</span>
                <span class="font-medium text-gray-900">{{
                  selectedMember.name || 'N/A'
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('finance.vIPLevel') }}:</span>
                <span class="font-medium text-gray-900">{{
                  selectedMember.vipLevel
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">余额:</span>
                <span class="font-medium text-green-600">{{
                  formatCurrency(selectedMember.balance)
                }}</span>
              </div>
            </div>
          </div>
        </n-form>

        <template #footer>
          <div style="display: flex; justify-content: flex-end; gap: 12px">
            <n-button @click="showSupplementOrderModal = false">{{ $t('common.cancel') }}</n-button>
            <n-button
              type="primary"
              :loading="supplementOrderLoading"
              @click="handleConfirmSupplementOrder"
            >{{ $t('finance.confirm3') }}</n-button>
          </div>
        </template>
      </n-card>
    </n-modal>

    <!-- Create Order Modal -->
    <n-modal v-model:show="showCreateOrderModal" :mask-closable="false">
      <n-card
        style="width: 700px"
       :title="$t('finance.createOnlineOrder')"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <template #header-extra>
          <n-button quaternary circle @click="showCreateOrderModal = false">
            <n-icon><Close /></n-icon>
          </n-button>
        </template>

        <n-form
          :model="createOrderForm"
          label-placement="left"
          label-width="120px"
          require-mark-placement="right-hanging"
        >
          <!-- Member Search -->
          <n-form-item :label="$t('finance.memberAccountID')" path="memberAccount" required>
            <n-input-group>
              <n-input
                v-model:value="createOrderForm.memberAccount"
               :placeholder="$t('finance.pleaseEnterMemberAccountOrMemberIdSearch')"
                :maxlength="200"
                show-count
                clearable
                @input="handleMemberAccountInput"
                @keyup.enter="handleSearchMember"
              />
              <n-button
                type="primary"
                @click="handleSearchMember"
                :loading="searchingMember"
              >{{ $t('common.search') }}</n-button>
            </n-input-group>
          </n-form-item>

          <!-- Member Information Display -->
          <div v-if="foundMember" class="mb-4 rounded-lg bg-gray-50 p-4">
            <div class="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span class="text-gray-600">{{ $t('finance.memberId') }}:</span>
                <span class="ml-2 font-medium">{{ foundMember.id }}</span>
              </div>
              <div>
                <span class="text-gray-600">{{ $t('common.memberAccount') }}:</span>
                <span class="ml-2 font-medium">{{ foundMember.account }}</span>
              </div>
              <div>
                <span class="text-gray-600">会员币种:</span>
                <span class="ml-2 font-medium">{{
                  foundMember.currency || 'BRL'
                }}</span>
              </div>
            </div>
          </div>

          <!-- Form Fields -->
          <div v-if="foundMember">
            <!-- 充值大类 -->
            <n-form-item :label="$t('finance.recharge6')" path="rechargeCategory" required>
              <n-select
                v-model:value="createOrderForm.rechargeCategory"
               :placeholder="$t('finance.pleaseSelectRecharge')"
                :options="rechargeCategoryOptions"
                @update:value="handleRechargeCategoryChange"
              />
              <div
                v-if="!rechargeCategoryOptions.length"
                class="mt-1 text-sm text-red-500"
              >{{ $t('finance.pleaseSelectRecharge') }}</div>
            </n-form-item>

            <!-- 支付通道 (只有选择充值大类后才显示) -->
            <n-form-item
              v-if="createOrderForm.rechargeCategory"
             :label="$t('finance.paymentChannel')"
              path="selectedChannel"
              required
            >
              <n-select
                v-model:value="createOrderForm.selectedChannel"
               :placeholder="$t('finance.pleaseSelectPaymentChannel')"
                :options="availableChannelOptions"
                :loading="loadingChannels"
                @update:value="handleChannelChange"
              />
              <div
                v-if="availableChannelOptions.length === 0 && !loadingChannels"
                class="mt-1 text-sm text-red-500"
              >{{ $t('finance.k1782444246516') }}</div>
            </n-form-item>

            <!-- 订单金额 -->
            <n-form-item :label="$t('finance.orderAmount')" path="orderAmount" required>
              <n-input-group>
                <n-input-group-label>R$</n-input-group-label>
                <n-input
                  v-model:value="createOrderForm.orderAmount"
                 :placeholder="$t('finance.pleaseEnterOrderAmount')"
                  @input="handleAmountInput"
                />
              </n-input-group>
            </n-form-item>

            <!-- 稽核倍数和赠送比例 -->
            <div class="grid grid-cols-2 gap-4">
              <n-form-item :label="$t('finance.audit1')" path="auditMultiple">
                <n-input
                  v-model:value="createOrderForm.auditMultiple"
                  placeholder="1.00"
                  @input="validateAuditMultiple"
                />
              </n-form-item>
              <n-form-item :label="$t('finance.ratio1')" path="bonusRatio">
                <n-input-group>
                  <n-select
                    v-model:value="createOrderForm.bonusType"
                    style="width: 120px"
                    :options="[
                      { label: '赠送比例', value: 'ratio' },
                      { label: '固定金额', value: 'fixed' },
                    ]"
                    default-value="ratio"
                  />
                  <n-input
                    v-model:value="createOrderForm.bonusValue"
                   :placeholder="$t('finance.pleaseEnterRatio')"
                  />
                  <n-input-group-label>%</n-input-group-label>
                </n-input-group>
              </n-form-item>
            </div>

            <!-- 订单备注 -->
            <n-form-item :label="$t('finance.orderRemark')" path="orderNote">
              <n-input
                v-model:value="createOrderForm.orderNote"
                type="textarea"
               :placeholder="$t('finance.pleaseEnterOrderRemark')"
                :maxlength="1000"
                show-count
                :autosize="{ minRows: 2, maxRows: 4 }"
              />
            </n-form-item>

            <!-- 验证密码 -->
            <n-form-item :label="$t('finance.text78')" path="verificationPassword" required>
              <n-input
                v-model:value="createOrderForm.verificationPassword"
                type="password"
               :placeholder="$t('finance.pleaseEnterLogin')"
                show-password-on="click"
              />
            </n-form-item>
          </div>
        </n-form>

        <template #footer>
          <div style="display: flex; justify-content: flex-end; gap: 12px">
            <n-button @click="showCreateOrderModal = false">{{ $t('common.cancel') }}</n-button>
            <n-button
              type="primary"
              :loading="createOrderLoading"
              :disabled="
                !foundMember ||
                !createOrderForm.rechargeCategory ||
                !createOrderForm.orderAmount ||
                !createOrderForm.verificationPassword
              "
              @click="handleConfirmCreateOrder"
            >{{ $t('common.confirm') }}</n-button>
          </div>
        </template>
      </n-card>
    </n-modal>

    <!-- User Detail Modal -->
    <UserDetailModal
      v-model:visible="showUserDetailModal"
      :userId="currentUserId"
    />

    <!-- Order Detail Modal -->
    <n-modal v-model:show="showOrderDetailModal" :mask-closable="false">
      <n-card
        style="width: 800px; max-height: 80vh; overflow-y: auto"
       :title="$t('finance.orderDetails')"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <template #header-extra>
          <n-button quaternary circle @click="showOrderDetailModal = false">
            <n-icon><Close /></n-icon>
          </n-button>
        </template>

        <div v-if="currentOrderDetail" class="order-detail">
          <!-- Order Basic Info -->
          <n-descriptions bordered :column="2" :title="$t('finance.basicInfo')">
            <n-descriptions-item :label="$t('finance.orderNo')">{{
              currentOrderDetail.orderId
            }}</n-descriptions-item>
            <n-descriptions-item :label="$t('finance.orderStatus')">
              <n-tag
                :type="
                  currentOrderDetail.status === 'SUCCESS'
                    ? 'success'
                    : 'warning'
                "
              >
                {{
                  currentOrderDetail.status === 'SUCCESS'
                    ? '充值成功'
                    : currentOrderDetail.status
                }}
              </n-tag>
            </n-descriptions-item>
            <n-descriptions-item :label="$t('finance.memberId')">{{
              currentOrderDetail.user?.userID || currentOrderDetail.memberId
            }}</n-descriptions-item>
            <n-descriptions-item :label="$t('finance.memberAccount2')">{{
              currentOrderDetail.memberAccount
            }}</n-descriptions-item>
            <n-descriptions-item :label="$t('finance.memberTier')">{{
              currentOrderDetail.user?.memberTier?.tierName || '-'
            }}</n-descriptions-item>
            <n-descriptions-item :label="$t('finance.recharge6')">{{
              currentOrderDetail.thirdPartyPayment
            }}</n-descriptions-item>
            <n-descriptions-item :label="$t('finance.channel1')">{{
              currentOrderDetail.channel?.channelName ||
              currentOrderDetail.channelName
            }}</n-descriptions-item>
            <n-descriptions-item :label="$t('finance.channel2')">{{
              currentOrderDetail.channelCode
            }}</n-descriptions-item>
          </n-descriptions>

          <!-- Amount Info -->
          <n-descriptions bordered :column="2" :title="$t('finance.amountInfo')" class="mt-4">
            <n-descriptions-item :label="$t('finance.rechargeChannelCurrency')">{{
              currentOrderDetail.channelCurrency ||
              currentOrderDetail.channel?.currency ||
              'BRL'
            }}</n-descriptions-item>
            <n-descriptions-item :label="$t('finance.text20')">{{
              formatCurrency(
                currentOrderDetail.channelAmount ||
                  currentOrderDetail.rechargeAmount,
              )
            }}</n-descriptions-item>
            <n-descriptions-item :label="$t('finance.exchangeRate')">{{
              currentOrderDetail.exchangeRate
                ? `1:${currentOrderDetail.exchangeRate}`
                : '-'
            }}</n-descriptions-item>
            <n-descriptions-item :label="$t('finance.memberCurrency')">BRL</n-descriptions-item>
            <n-descriptions-item :label="$t('finance.orderAmount')">{{
              formatCurrency(currentOrderDetail.rechargeAmount)
            }}</n-descriptions-item>
            <n-descriptions-item :label="$t('finance.amount3')">{{
              formatCurrency(currentOrderDetail.bonusAmount || 0)
            }}</n-descriptions-item>
            <n-descriptions-item :label="$t('finance.amount5')">{{
              formatCurrency(
                currentOrderDetail.rechargeAmount +
                  (currentOrderDetail.bonusAmount || 0),
              )
            }}</n-descriptions-item>
            <n-descriptions-item :label="$t('finance.channel4')">{{
              currentOrderDetail.channelFeeRate
                ? `${(currentOrderDetail.channelFeeRate * 100).toFixed(2)}%`
                : '-'
            }}</n-descriptions-item>
          </n-descriptions>

          <!-- Time Info -->
          <n-descriptions bordered :column="2" :title="$t('finance.timeInfo')" class="mt-4">
            <n-descriptions-item :label="$t('finance.createTime')">
              <TzDateTime :value="currentOrderDetail.createdAt" />
            </n-descriptions-item>
            <n-descriptions-item :label="$t('finance.successTime')">
              <TzDateTime
                v-if="
                  currentOrderDetail.status === 'SUCCESS' ||
                  currentOrderDetail.status === 'success'
                "
                :value="
                  (currentOrderDetail as any).processingTime ||
                  (currentOrderDetail as any).confirmTime ||
                  (currentOrderDetail as any).completeTime
                "
              />
              <template v-else>-</template>
            </n-descriptions-item>
            <n-descriptions-item :label="$t('finance.time')">
              <TzDateTime :value="currentOrderDetail.updatedAt" />
            </n-descriptions-item>
            <n-descriptions-item :label="$t('finance.operator')">{{
              (currentOrderDetail as any).操作人 || 'system'
            }}</n-descriptions-item>
          </n-descriptions>

          <!-- Additional Info -->
          <n-descriptions bordered :column="1" :title="$t('finance.info')" class="mt-4">
            <n-descriptions-item :label="$t('finance.thirdPartyOrder')">{{
              currentOrderDetail.thirdPartyOrderId || '-'
            }}</n-descriptions-item>
            <n-descriptions-item :label="$t('finance.text21')">{{
              (currentOrderDetail as any).标记 || '-'
            }}</n-descriptions-item>
            <n-descriptions-item :label="$t('finance.yesNo')">{{
              (currentOrderDetail as any).是否首存 || '否'
            }}</n-descriptions-item>
            <n-descriptions-item :label="$t('common.remark')">{{
              currentOrderDetail.remark || '-'
            }}</n-descriptions-item>
          </n-descriptions>

          <!-- Error Details (if applicable) -->
          <div
            v-if="
              currentOrderDetail.errorDetails || currentOrderDetail.errorCode
            "
            class="mt-4"
          >
            <n-descriptions bordered :column="1" :title="$t('finance.info1')">
              <n-descriptions-item
                v-if="currentOrderDetail.errorCode"
               :label="$t('finance.text79')"
                >{{ currentOrderDetail.errorCode }}</n-descriptions-item
              >
              <n-descriptions-item
                v-if="currentOrderDetail.errorDetails"
               :label="$t('finance.details')"
                >{{ currentOrderDetail.errorDetails }}</n-descriptions-item
              >
            </n-descriptions>
          </div>
        </div>

        <template #footer>
          <div style="display: flex; justify-content: flex-end">
            <n-button @click="showOrderDetailModal = false">{{ $t('common.close') }}</n-button>
          </div>
        </template>
      </n-card>
    </n-modal>

    <!-- Column Configuration Modal -->
    <n-modal v-model:show="showColumnConfig" :mask-closable="false">
      <n-card
        style="width: 500px"
       :title="$t('finance.text80')"
        :bordered="false"
        size="huge"
        :segmented="{ content: 'soft', footer: 'soft' }"
      >
        <div class="column-config-content">
          <p class="mb-4 text-gray-600">{{ $t('finance.knyc2n') }}</p>

          <div class="column-list">
            <div
              v-for="column in columnConfigList"
              :key="column.key"
              class="column-item"
            >
              <n-checkbox
                v-model:checked="column.visible"
                :label="column.title"
                class="column-checkbox"
              />
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-between">
            <n-button @click="resetColumnConfig">{{ $t('common.reset') }}</n-button>
            <div class="flex gap-2">
              <n-button @click="showColumnConfig = false">{{ $t('common.cancel') }}</n-button>
              <n-button type="primary" @click="saveColumnConfig">{{ $t('common.save') }}</n-button>
            </div>
          </div>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import {
  ref,
  reactive,
  computed,
  onMounted,
  onUnmounted,
  h,
  watch,
  nextTick,
} from 'vue';
import AdminNotificationService from '../../services/adminNotificationService';
import { useAccessStore, useUserStore } from '@vben/stores';
import {
  NCard,
  NTabs,
  NTabPane,
  NDataTable,
  NButton,
  NInput,
  NSelect,
  NDatePicker,
  NDropdown,
  NSwitch,
  NTag,
  NText,
  NSpace,
  NBreadcrumb,
  NBreadcrumbItem,
  NTooltip,
  NModal,
  NForm,
  NFormItem,
  NInputNumber,
  NInputGroup,
  NInputGroupLabel,
  NIcon,
  NAutoComplete,
  NCheckbox,
  NCheckboxGroup,
  NEmpty,
  NAlert,
  NList,
  NListItem,
  NPopconfirm,
  NStatistic,
  NSpin,
  NPagination,
  NRadio,
  NRadioGroup,
  NDescriptions,
  NDescriptionsItem,
  useMessage,
  useDialog,
  type DataTableColumns,
  type DropdownOption,
} from 'naive-ui';
import {
  Close,
  Search,
  CheckmarkCircle as CheckCircle,
  Warning,
  Trash,
  InformationCircle as Information,
  Create as Edit,
  Download,
  Refresh,
  Add as Plus,
  Settings,
} from '@vicons/ionicons5';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
import { defineAsyncComponent } from 'vue';
const MediaLibrarySelector = defineAsyncComponent(
  () => import('../../components/MediaLibrarySelector.vue'),
);
const UserDetailModal = defineAsyncComponent(
  () => import('../../components/user/UserDetailModal.vue'),
);
const SmartAutoRefresh = defineAsyncComponent(
  () => import('../../components/smart/SmartAutoRefresh/index.vue'),
);
const SmartDataGrid = defineAsyncComponent(
  () => import('../../components/smart/SmartDataGrid/index.vue'),
);
const TimezoneDatePicker = defineAsyncComponent(
  () => import('../../components/common/TimezoneDatePicker.vue'),
);
const QuickDateSelect = defineAsyncComponent(
  () => import('../../components/common/QuickDateSelect.vue'),
);

// API imports
import {
  getRechargeOrderList,
  exportRechargeOrders,
  createRechargeOrder,
  type RechargeOrder as BaseRechargeOrder,
  type RechargeOrderListParams,
  type CreateRechargeOrderData,
} from '../../api/finance/recharge-orders';

// Extended RechargeOrder type with first deposit status
interface RechargeOrder extends BaseRechargeOrder {
  hasAnySuccessfulDeposit?: boolean;
  isFirstDeposit?: boolean;
}
import {
  getRechargeCategoriesConfig,
  createRechargeCategory as createRechargeCategoryConfig,
  updateRechargeCategory as updateRechargeCategoryConfig,
  deleteRechargeCategory as deleteRechargeCategoryConfig,
  getThirdPartyChannels,
  getDisabledChannels,
  getRechargeSettings,
  updateRechargeSettings,
  getThirdPartyStatistics,
  type RechargeCategoryConfig,
  type ThirdPartyChannelInfo,
  type RechargeSettings,
} from '../../api/finance/recharge-category-config';
import {
  getRechargeCategories,
  createRechargeCategory,
  updateRechargeCategory,
  deleteRechargeCategory,
  toggleRechargeCategoryStatus,
} from '../../api/finance/rechargeCategory';
import { searchUsers } from '../../api/users/index';
import thirdPartyChannelApi from '../../api/finance/third-party-channels';
import { getMemberTiersApi } from '../../api/core/memberTier';
import { sortMemberTiersForDisplay } from '#/utils/memberTierSort';
import { requestClient } from '../../api/request';
import {
  displayCalendarRangeToPicker,
  formatDateTimeInTimezone,
  formatDateInTimezone,
  getDisplayTimezone,
  getNowInTimezone,
  pickerRangeToUtcIso,
} from '../../utils/timezoneUtils';
import { renderTzDateTime } from '#/components/common/tzDateTimeRender';
import TzDateTime from '#/components/common/TzDateTime.vue';
import { useDisplayTimezone } from '#/composables/useDisplayTimezone';
// Import transaction mappings for remark translation
import { translateSubcategory } from '../../utils/transactionTranslations';

// Types
interface TableTotals {
  rechargeAmount: number;
  orderAmount: number;
  bonusAmount: number;
  fee: number;
  totalCredited: number;
}

interface ThirdPartyChannel {
  // Core identification
  platformName: string;
  merchantId: string;
  merchantKey?: string;
  currency: string;

  // New fields from screenshot
  thirdPartyPayment: string;
  successStatus: string;
  orderUrl: string;
  queryUrl: string;
  callbackIpWhitelist: string;

  // Channel configuration
  channelName: string;
  channelCode: string;
  channelCategory: string;
  channelType: string;
  channelLimit: {
    min: number;
    max: number;
  };

  // Access control
  memberLevels: string[];
  terminals: string[];
  requireName: boolean;
  isActive: boolean;

  // Financial settings
  feeRate: number;
  channelFeeRate: number;
  customBadge: string;
  recommendedAmounts: string;
  notificationMessage: string;

  // Configuration state
  channelConfig: {
    enabled: boolean;
  };

  // Legacy fields for backward compatibility
  gatewayName?: string;
  domain?: string;
  ipAddress?: string;
  minAmount?: number;
  maxAmount?: number;
  bonusRate?: number;
  terminal?: string[];
  memberLevel?: string;
  remark?: string;
  priority?: number;

  // Statistics (optional)
  successRate?: number;
  avgProcessTime?: string;
}

// Reactive data
const message = useMessage();
const { timezone } = useDisplayTimezone();
const dialog = useDialog();
const accessStore = useAccessStore();
const userStore = useUserStore();
const activeTab = ref('all-orders');
const loading = ref(false);
// 🚀 NEW: Simplified auto-refresh state (SmartAutoRefresh handles all timer logic)
const autoRefreshEnabled = ref(false);
const tableData = ref<RechargeOrder[]>([]);
const checkedRowKeys = ref<string[]>([]);
const tableRef = ref();

// 🚀 REMOVED: refreshIntervalOptions (now handled by SmartAutoRefresh component)

// Third-party channels data
const channelLoading = ref(false);
const channelTableData = ref<ThirdPartyChannel[]>([]);
const channelTableRef = ref();
const showChannelModal = ref(false);
const showBonusConfigModal = ref(false);
const showFeeReductionModal = ref(false);
const showRecommendedAmountModal = ref(false);
const isEditingChannel = ref(false);
const channelModalLoading = ref(false);
const bonusModalLoading = ref(false);
const channelFormRef = ref();
const bonusFormRef = ref();
const currentEditingChannel = ref<ThirdPartyChannel | null>(null);
const currentBonusChannel = ref<ThirdPartyChannel | null>(null);

// Category configuration data
const categoryLoading = ref(false);
const categoryTableData = ref<any[]>([]);
const categoryTableRef = ref();
const showCategoryModal = ref(false);
const categoryModalLoading = ref(false);
const categoryFormRef = ref();
const isEditingCategory = ref(false);
const currentEditingCategory = ref<any>(null);

// Category form data
const categoryForm = ref({
  name: '',
  icon: '',
  blacklistStatus: 'ENABLED' as 'ENABLED' | 'DISABLED',
  isActive: 'ENABLED' as 'ENABLED' | 'DISABLED',
  badge: '',
});

// Fee reduction modal form
const feeReductionForm = ref({
  rechargeLimit: '', // 限前多少次充值
  singleAmountLimit: '', // 单笔充值金额限定
  reductionPercentage: '', // 减免百分比
});

// Recommended amount modal form
const recommendedAmountForm = ref({
  amountType: '可输入任意金额', // 可输入任意金额 | 仅限固定金额
  amounts: [
    { amount: '10.00', bonusType: '按比例', bonusValue: '' },
    { amount: '15.00', bonusType: '按比例', bonusValue: '0.12' },
    { amount: '50.00', bonusType: '按比例', bonusValue: '0.12' },
    { amount: '100.00', bonusType: '按比例', bonusValue: '0.13' },
    { amount: '300.00', bonusType: '按比例', bonusValue: '0.23' },
    { amount: '500.00', bonusType: '按比例', bonusValue: '0.26' },
    { amount: '1000.00', bonusType: '按比例', bonusValue: '0.3' },
    { amount: '5000.00', bonusType: '按比例', bonusValue: '0.32' },
  ],
});

// Category icon handling
const handleCategoryIconSelected = (file: any) => {
  console.log('📁 Category icon selected:', file);
  console.log('📁 File object:', JSON.stringify(file, null, 2));

  if (file && file.url) {
    categoryForm.value.icon = file.url;
    console.log('✅ Icon URL set to:', categoryForm.value.icon);
  } else if (file && typeof file === 'string') {
    categoryForm.value.icon = file;
    console.log('✅ Icon URL set to (string):', categoryForm.value.icon);
  } else {
    console.warn('⚠️ Unexpected file format:', file);
  }
};

// Filters
const filters = reactive({
  dateQuickSelect: 'day' as 'day' | 'week' | 'month',
  dateRange: null as [number, number] | null,
  search: '',
  rechargeAmount: null as string | null,
  currency: null as string | null,
  vipLevel: null as string | null,
  thirdParty: null as string | null,
  channel: null as string | null,
  status: null as string | null,
});

// Channel filters
const channelFilters = reactive({
  platform: null as string | null,
  gateway: null as string | null,
  channelName: null as string | null,
  currency: null as string | null,
  memberLevel: null as string | null,
  search: '',
});

// Category filters
const categoryFilters = reactive({
  isActive: null as string | null,
  blacklistStatus: null as string | null,
  search: '',
});

// Channel form - updated to match screenshot requirements
const channelForm = ref({
  currency: 'BRL',
  thirdPartyPayment: '',
  platformName: '',
  merchantId: '',
  merchantKey: '',
  successStatus: 'SUCCESS',
  orderUrl: '',
  queryUrl: '',
  callbackIpWhitelist: '',
  channelCategory: '',
  channelCode: '',
  channelName: '',
  channelType: 'NORMAL',
  memberLevels: [],
  terminals: [],
  channelLimit: {
    min: 10,
    max: 50000,
  },
  requireName: false,
  isActive: true,
  customBadge: '',
  feeRate: 0,
  channelFeeRate: 0,
  recommendedAmounts: '10.00,15.00,50.00,100.00,300.00,500.00,1000.00,5000.00',
  notificationMessage: '',
  channelConfig: {
    enabled: true,
  },
  // Bonus configuration
  bonusConfig: null as any,

  // Legacy fields for backward compatibility
  gatewayName: '',
  domain: '',
  ipAddress: '',
  bonusRate: 0,
  terminal: ['PC'],
  memberLevel: 'ALL',
  priority: 0,
  remark: '',
});

// Tab state
const activeChannelTab = ref('channel-info');

// Disabled channels state
const disabledChannelFilters = reactive({
  search: '',
  platform: null as string | null,
  currency: null as string | null,
  memberLevel: null as string | null,
});

const disabledChannelTableData = ref<any[]>([]);
const disabledChannelTableLoading = ref(false);
const selectedDisabledChannels = ref<string[]>([]);
const expandedGroups = ref<Set<string>>(new Set());

// Computed property for grouping disabled channels by category
const groupedDisabledChannels = computed(() => {
  if (!disabledChannelTableData.value.length) return [];

  // Group channels by category
  const groups = new Map<string, any[]>();

  disabledChannelTableData.value.forEach((channel) => {
    const category = channel.channelCategory || '未分类';
    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category)!.push(channel);
  });

  // Convert to array with category info
  return Array.from(groups.entries()).map(([category, channels]) => ({
    category,
    channels,
    expanded: expandedGroups.value.has(category),
    categoryIcon: getCategoryIcon(category),
  }));
});

// Computed property for channel config enabled state
const channelConfigEnabled = computed({
  get: () => channelForm.value.channelConfig?.enabled ?? true,
  set: (value: boolean) => {
    if (!channelForm.value.channelConfig) {
      channelForm.value.channelConfig = { enabled: value };
    } else {
      channelForm.value.channelConfig.enabled = value;
    }
  },
});

const disabledChannelPaginationConfig = ref({
  page: 1,
  pageSize: 20,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
});

// Batch operation state
const showBatchOperationModal = ref(false);
const batchOperationType = ref<'enable' | 'delete'>('enable');
const batchOperationLoading = ref(false);

// Statistics state
const statsFilters = reactive({
  startDate: (Date.now() - 24 * 60 * 60 * 1000) as number | null, // Yesterday
  endDate: Date.now() as number | null, // Today
  platform: null as string | null,
  category: null as string | null,
});

const statsTableData = ref<any[]>([]);
const statsTableLoading = ref(false);

const statsPaginationConfig = ref({
  page: 1,
  pageSize: 20,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
});

const statsSummary = ref({
  totalTransactions: 0,
  successTransactions: 0,
  totalAmount: 0,
  overallSuccessRate: 0,
});

// Statistics table columns
const statsColumns: DataTableColumns<any> = [
  {
    title: $t('finance.thirdPartyPayment'),
    key: 'platformName',
    width: 150,
    ellipsis: true,
    render: (row: any) =>
      h('div', { class: 'font-medium text-blue-600' }, row.platformName || '-'),
  },
  {
    title: $t('finance.channel7'),
    key: 'channelCategory',
    width: 120,
    render: (row: any) =>
      h(
        'n-tag',
        { type: 'info', size: 'small' },
        { default: () => row.channelCategory },
      ),
  },
  {
    title: $t('finance.thirdPartyChannel'),
    key: 'channelInfo',
    width: 180,
    render: (row: any) => {
      return h('div', { class: 'text-xs' }, [
        h('div', { class: 'font-medium' }, row.channelName || '-'),
        h('div', { class: 'text-gray-500' }, row.channelCode || '-'),
      ]);
    },
  },
  {
    title: $t('finance.recharge8'),
    key: 'uniqueUsers',
    width: 80,
    align: 'center' as const,
    render: (row: any) =>
      h('span', { class: 'font-medium' }, row.uniqueUsers || 0),
  },
  {
    title: $t('finance.count1'),
    key: 'totalOrders',
    width: 80,
    align: 'center' as const,
    render: (row: any) =>
      h('span', { class: 'font-medium' }, row.totalOrders || 0),
  },
  {
    title: $t('finance.successCount'),
    key: 'successOrders',
    width: 80,
    align: 'center' as const,
    render: (row: any) =>
      h(
        'span',
        { class: 'font-medium text-green-600' },
        row.successOrders || 0,
      ),
  },
  {
    title: $t('finance.successAmount'),
    key: 'successAmount',
    width: 120,
    align: 'right' as const,
    render: (row: any) => {
      const amount = Number(row.successAmount || 0);
      return h('div', { class: 'text-xs' }, [
        h('div', { class: 'font-medium text-green-600' }, amount.toFixed(2)),
        h('div', { class: 'text-gray-500' }, 'BRL'),
      ]);
    },
  },
  {
    title: $t('finance.30MinutesSuccessITCount'),
    key: 'recent30MinSuccess',
    width: 140,
    align: 'center' as const,
    render: (row: any) => {
      const count = row.recent30MinSuccess || 0;
      const trend = row.recent30MinTrend || 0;
      return h('div', { class: 'text-xs' }, [
        h('div', { class: 'font-medium' }, count),
        h(
          'div',
          {
            class: `text-xs ${trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-500'}`,
          },
          trend > 0 ? `↑${trend}` : trend < 0 ? `↓${Math.abs(trend)}` : '—',
        ),
      ]);
    },
  },
  {
    title: $t('finance.30MinutesSuccessITAmount'),
    key: 'recent30MinAmount',
    width: 140,
    align: 'right' as const,
    render: (row: any) => {
      const amount = Number(row.recent30MinAmount || 0);
      return h('div', { class: 'text-xs' }, [
        h('div', { class: 'font-medium' }, amount.toFixed(2)),
        h('div', { class: 'text-gray-500' }, 'BRL'),
      ]);
    },
  },
  {
    title: $t('finance.successRate'),
    key: 'successRate',
    width: 80,
    align: 'center' as const,
    render: (row: any) => {
      const rate = Number(row.successRate || 0);
      const color = rate >= 95 ? '#18a058' : rate >= 85 ? '#f0a020' : '#d03050';
      return h(
        'span',
        {
          class: 'font-medium',
          style: { color },
        },
        `${rate.toFixed(1)}%`,
      );
    },
  },
  {
    title: $t('finance.30MinutesSuccessIT'),
    key: 'recent30MinRate',
    width: 120,
    align: 'center' as const,
    render: (row: any) => {
      const rate = Number(row.recent30MinRate || 0);
      const color = rate >= 95 ? '#18a058' : rate >= 85 ? '#f0a020' : '#d03050';
      return h(
        'span',
        {
          class: 'font-medium',
          style: { color },
        },
        `${rate.toFixed(1)}%`,
      );
    },
  },
  {
    title: $t('finance.30MinutesSuccessAmount1'),
    key: 'recent30MinAmountTrend',
    width: 140,
    align: 'center' as const,
    render: (row: any) => {
      const trend = Number(row.recent30MinAmountTrend || 0);
      const isPositive = trend > 0;
      return h('div', { class: 'text-xs' }, [
        h(
          'span',
          {
            class: `font-medium ${isPositive ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'}`,
          },
          isPositive
            ? `+${trend.toFixed(2)}`
            : trend < 0
              ? trend.toFixed(2)
              : '0.00',
        ),
        h('div', { class: 'text-gray-500' }, 'BRL'),
      ]);
    },
  },
  {
    title: $t('finance.30MinutesSuccessAmount2'),
    key: 'recent30MinAmountDown',
    width: 140,
    align: 'center' as const,
    render: (row: any) => {
      const down = Number(row.recent30MinAmountDown || 0);
      return h('div', { class: 'text-xs' }, [
        h(
          'span',
          {
            class: down > 0 ? 'font-medium text-red-600' : 'text-gray-500',
          },
          down > 0 ? `-${down.toFixed(2)}` : '0.00',
        ),
        h('div', { class: 'text-gray-500' }, 'BRL'),
      ]);
    },
  },
];

// Disabled channels table columns
const disabledChannelColumns: DataTableColumns<any> = [
  {
    type: 'selection' as const,
    width: 50,
  },
  {
    title: $t('finance.channel5'),
    key: 'channelCategory',
    width: 100,
    ellipsis: true,
  },
  {
    title: $t('finance.channel1'),
    key: 'channelName',
    width: 150,
    ellipsis: true,
    render: (row: any) =>
      h('div', { class: 'font-medium' }, row.channelName || '-'),
  },
  {
    title: $t('finance.paymentPlatform'),
    key: 'platformName',
    width: 150,
    ellipsis: true,
  },
  {
    title: $t('finance.merchant'),
    key: 'merchantId',
    width: 120,
    ellipsis: true,
  },
  {
    title: $t('finance.channel2'),
    key: 'channelCode',
    width: 120,
    ellipsis: true,
    render: (row: any) =>
      h(
        'n-tag',
        { type: 'info', size: 'small' },
        { default: () => row.channelCode },
      ),
  },
  {
    title: $t('common.currency'),
    key: 'currency',
    width: 80,
    render: (row: any) =>
      h(
        'n-tag',
        { type: 'default', size: 'small' },
        { default: () => row.currency },
      ),
  },
  {
    title: $t('finance.transactionLimit'),
    key: 'limits',
    width: 140,
    render: (row: any) => {
      const min = Number(row.minAmount || 0);
      const max = Number(row.maxAmount || 0);
      return h('div', { class: 'text-xs' }, [
        h('div', `${min.toFixed(2)} ~ ${max.toFixed(2)}`),
        h('div', { class: 'text-gray-500' }, row.currency || 'BRL'),
      ]);
    },
  },
  {
    title: $t('finance.memberTier'),
    key: 'memberLevel',
    width: 100,
    render: (row: any) =>
      h(
        'n-tag',
        { type: 'warning', size: 'small' },
        { default: () => row.memberLevel || 'ALL' },
      ),
  },
  {
    title: $t('finance.disableTime'),
    key: 'updatedAt',
    width: 160,
    render: (row: any) => {
      if (!row.updatedAt) return '-';
      return h(
        'div',
        { class: 'text-xs text-gray-600' },
        { default: () => renderTzDateTime(row.updatedAt) },
      );
    },
  },
  {
    title: $t('finance.disable'),
    key: 'remark',
    width: 180,
    ellipsis: true,
    render: (row: any) => {
      if (!row.remark) return h('span', { class: 'text-gray-400' }, '暂无备注');
      return h(
        'n-tooltip',
        { trigger: 'hover' },
        {
          trigger: () =>
            h(
              'span',
              { class: 'cursor-help text-blue-600' },
              row.remark.slice(0, 20) + (row.remark.length > 20 ? '...' : ''),
            ),
          default: () => row.remark,
        },
      );
    },
  },
  {
    title: $t('common.actions'),
    key: 'actions',
    width: 180,
    fixed: 'right' as const,
    render: (row: any) => {
      return h('n-space', { size: 'small' }, [
        h(
          'n-button',
          {
            type: 'success',
            size: 'small',
            onClick: () => handleEnableChannel(row),
          },
          {
            default: () => '启用',
            icon: () => h('n-icon', null, { default: () => h('CheckCircle') }),
          },
        ),
        h(
          'n-button',
          {
            type: 'info',
            size: 'small',
            onClick: () => handleEditChannel(row),
          },
          {
            default: () => '编辑',
            icon: () => h('n-icon', null, { default: () => h('Edit') }),
          },
        ),
        h(
          'n-popconfirm',
          {
            onPositiveClick: () => handleDeleteDisabledChannel(row),
          },
          {
            trigger: () =>
              h(
                'n-button',
                {
                  type: 'error',
                  size: 'small',
                },
                {
                  default: () => '删除',
                  icon: () => h('n-icon', null, { default: () => h('Trash') }),
                },
              ),
            default: () => '确定要永久删除此通道吗？',
          },
        ),
      ]);
    },
  },
];

// Bonus form
const bonusForm = ref({
  bonusRate: 0, // Legacy field
  showBubble: 'show',
  bubbleColor: 'blue',
  memberLevel: 'no-limit',
  amountRanges: [
    { minAmount: '1.00', maxAmount: '29.99', fixedAmount: '', bonusRate: 0.0 },
    { minAmount: '30', maxAmount: '999.99', fixedAmount: '', bonusRate: 0.2 },
    {
      minAmount: '1000',
      maxAmount: '2999.99',
      fixedAmount: '',
      bonusRate: 0.4,
    },
    {
      minAmount: '3000',
      maxAmount: '9999.99',
      fixedAmount: '',
      bonusRate: 0.6,
    },
    {
      minAmount: '10000',
      maxAmount: '29999.99',
      fixedAmount: '',
      bonusRate: 2.6,
    },
    {
      minAmount: '30000',
      maxAmount: '50000.00',
      fixedAmount: '',
      bonusRate: 8.8,
    },
  ],
  bonusLimit: '',
  dailyLimitType: 'daily',
  dailyLimit: '',
});

// Order creation modals
const showPresetOrderModal = ref(false);
const showSupplementOrderModal = ref(false);
const showCreateOrderModal = ref(false);
const presetOrderLoading = ref(false);
const supplementOrderLoading = ref(false);
const createOrderLoading = ref(false);
const searchingMember = ref(false);

// Order forms
const presetOrderForm = ref({
  memberId: '',
});

const supplementOrderForm = ref({
  memberId: '',
});

// User and Order Detail Modals
const showUserDetailModal = ref(false);
const showOrderDetailModal = ref(false);
const currentUserId = ref<number>(0);
const currentOrderDetail = ref<RechargeOrder | null>(null);

const createOrderForm = reactive({
  memberAccount: '',
  rechargeCategory: '',
  selectedChannel: null as string | null,
  orderAmount: '',
  auditMultiple: '1.00',
  bonusType: 'ratio',
  bonusValue: '',
  orderNote: '',
  verificationPassword: '',
});

// Member search for create order
const foundMember = ref<any>(null);
const rechargeCategoryOptions = ref<any[]>([]);
const memberTierOptions = ref<DropdownOption[]>([]);
const availableChannelOptions = ref<any[]>([]);
const loadingChannels = ref(false);
const selectedChannelDetails = ref<any>(null);

// Member search (same as withdrawal management)
const memberOptions = ref<any[]>([]);
const memberLoading = ref(false);
const selectedMember = ref<any>(null);
let searchTimeout: NodeJS.Timeout | null = null;

// Pagination - SmartDataGrid compatible
const paginationReactive = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

// Channel pagination - SmartDataGrid compatible
const channelPaginationReactive = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

// Category pagination - SmartDataGrid compatible
const categoryPaginationReactive = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

// Stats pagination - SmartDataGrid compatible
const statsPaginationReactive = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

// Form validation rules - updated to match actual form fields
const channelRules = {
  thirdPartyPayment: [
    { required: true, message: $t('finance.pleaseSelectThirdPartyPayment1'), trigger: 'change' },
  ],
  platformName: [
    { required: true, message: $t('finance.pleaseEnterThirdPartyPaymentPlatform'), trigger: 'blur' },
  ],
  merchantId: [
    { required: true, message: $t('finance.pleaseEnterThirdPartyMerchantId'), trigger: 'blur' },
  ],
  orderUrl: [{ required: true, message: $t('finance.pleaseEnterOrderUrl'), trigger: 'blur' }],
  queryUrl: [{ required: true, message: $t('finance.pleaseEnterQueryUrl'), trigger: 'blur' }],
  callbackIpWhitelist: [
    // Optional field - validation handled by backend
  ],
  channelCategory: [
    { required: true, message: $t('finance.pleaseSelectChannel1'), trigger: 'change' },
  ],
  channelCode: [{ required: true, message: $t('finance.pleaseEnterChannel'), trigger: 'blur' }],
  channelName: [{ required: true, message: $t('finance.pleaseEnterChannel1'), trigger: 'blur' }],
  channelType: [
    { required: true, message: $t('finance.pleaseSelectChannel'), trigger: 'change' },
  ],
  currency: [{ required: true, message: $t('finance.pleaseSelectChannelCurrency'), trigger: 'change' }],
  'channelLimit.min': [
    {
      required: true,
      message: $t('finance.pleaseEnterMinAmount'),
      trigger: 'blur',
    },
  ],
  'channelLimit.max': [
    {
      required: true,
      message: $t('finance.pleaseEnterMaxAmount'),
      trigger: 'blur',
    },
  ],
};

// Category form validation rules
const categoryRules = {
  name: [
    { required: true, message: $t('finance.pleaseEnter'), trigger: 'blur' },
    { max: 50, message: $t('finance.50'), trigger: 'blur' },
  ],
  blacklistStatus: [
    { required: true, message: $t('finance.pleaseSelectStatus2'), trigger: 'change' },
  ],
  isActive: [{ required: true, message: $t('finance.pleaseSelectOnStatus'), trigger: 'change' }],
  badge: [{ max: 12, message: $t('finance.12'), trigger: 'blur' }],
};

// Bonus form validation rules
const bonusRules = {
  showBubble: [
    { required: true, message: $t('finance.pleaseSelectYesNo'), trigger: 'change' },
  ],
  bubbleColor: [
    { required: true, message: $t('finance.pleaseSelect3'), trigger: 'change' },
  ],
  memberLevel: [
    { required: true, message: $t('finance.pleaseSelectMemberTier1'), trigger: 'change' },
  ],
  amountRanges: [
    {
      type: 'array',
      min: 1,
      message: $t('finance.atLeastConfigOneAmount'),
      trigger: 'change',
    },
  ],
};

// Options
const rechargeAmountOptions = [
  { label: '50 BRL', value: '50' },
  { label: '100 BRL', value: '100' },
  { label: '200 BRL', value: '200' },
  { label: '500 BRL', value: '500' },
  { label: '1000 BRL', value: '1000' },
];

const currencyOptions = [
  { label: 'BRL', value: 'BRL' },
  { label: 'USD', value: 'USD' },
];

const vipLevelOptions = [
  { label: 'VIP0', value: 'VIP0' },
  { label: 'VIP1', value: 'VIP1' },
  { label: 'VIP2', value: 'VIP2' },
  { label: 'VIP3', value: 'VIP3' },
];

const thirdPartyOptions = [
  { label: 'UnivePay', value: 'UnivePay' },
  { label: 'PIX Payment', value: 'PIX' },
  { label: 'Other', value: 'Other' },
];

// Channel management dropdown options
const platformOptions = [
  { label: $t('finance.pixPayment'), value: 'PIX' },
  { label: 'UnivePay', value: 'UnivePay' },
  { label: $t('finance.bankTransfer'), value: 'BANK_TRANSFER' },
  { label: $t('finance.text55'), value: 'CREDIT_CARD' },
  { label: $t('finance.digitalWallet'), value: 'DIGITAL_WALLET' },
];

const gatewayOptions = [
  { label: 'PIX Gateway', value: 'PIX_GATEWAY' },
  { label: 'UnivePay Gateway', value: 'UNIVEPAY_GATEWAY' },
  { label: 'Bank Gateway', value: 'BANK_GATEWAY' },
  { label: 'Card Gateway', value: 'CARD_GATEWAY' },
];

const channelNameOptions = [
  { label: $t('finance.pIXPayment'), value: 'PIX_INSTANT' },
  { label: $t('finance.pIX'), value: 'PIX_QR' },
  { label: $t('finance.uNIVEPAYPayment'), value: 'UNIVEPAY_PAYMENT' },
  { label: $t('finance.bank'), value: 'BANK_DIRECT' },
  { label: $t('finance.payment2'), value: 'CREDIT_PAYMENT' },
];

const categoryOptions = [
  { label: $t('finance.payment1'), value: 'INSTANT_PAYMENT' },
  { label: $t('finance.bankTransfer'), value: 'BANK_TRANSFER' },
  { label: $t('finance.payment2'), value: 'CREDIT_CARD' },
  { label: $t('finance.digitalWallet'), value: 'DIGITAL_WALLET' },
  { label: $t('finance.thirdPartyPayment1'), value: 'THIRD_PARTY' },
];

const terminalOptions = [
  { label: $t('finance.pC'), value: 'PC' },
  { label: $t('finance.text56'), value: 'MOBILE' },
  { label: 'APP', value: 'APP' },
  { label: 'H5', value: 'H5' },
  { label: 'Android', value: 'ANDROID' },
  { label: 'iOS', value: 'IOS' },
];

// Channel type options for the new form
const channelTypeOptions = [
  { label: $t('finance.text18'), value: 'NORMAL' },
  { label: $t('finance.text22'), value: 'PRIORITY' },
  { label: 'VIP', value: 'VIP' },
  { label: $t('finance.text23'), value: 'SPECIAL' },
];

// Updated third party payment options with more choices
const updatedThirdPartyOptions = [
  { label: 'UnivePay(BRL)', value: 'UnivePay_BRL' },
  { label: 'PIX Payment', value: 'PIX' },
  { label: 'Banco do Brasil', value: 'BB' },
  { label: 'Caixa', value: 'CAIXA' },
  { label: 'Itaú', value: 'ITAU' },
  { label: 'Bradesco', value: 'BRADESCO' },
];

// Member level options for multiple selection (legacy, will be replaced by memberTierOptions)
const memberLevelOptions = [
  { label: $t('finance.text81'), value: 'DEFAULT' },
  { label: $t('finance.allMembers'), value: 'ALL' },
  { label: 'VIP0', value: 'VIP0' },
  { label: 'VIP1', value: 'VIP1' },
  { label: 'VIP2', value: 'VIP2' },
  { label: 'VIP3', value: 'VIP3' },
  { label: 'VIP4', value: 'VIP4' },
  { label: 'VIP5', value: 'VIP5' },
];

const channelOptions = [
  { label: 'PIX', value: 'PIX' },
  { label: 'TED', value: 'TED' },
  { label: 'DOC', value: 'DOC' },
];

const statusOptions = [
  { label: $t('finance.pending'), value: 'pending' },
  { label: $t('finance.alreadyComplete'), value: 'completed' },
  { label: $t('finance.cancelled'), value: 'cancelled' },
];

const advancedSearchOptions: DropdownOption[] = [
  { label: $t('finance.text82'), key: 'advanced' },
  { label: $t('finance.query'), key: 'custom' },
];

const exportOptions: DropdownOption[] = [
  { label: $t('finance.exportExcel'), key: 'excel' },
  { label: $t('finance.exportCsv'), key: 'csv' },
  { label: $t('finance.exportPdf'), key: 'pdf' },
];

// Backend totals (from ALL records, not just current page)
const backendTotals = ref<TableTotals>({
  rechargeAmount: 0,
  orderAmount: 0,
  bonusAmount: 0,
  fee: 0,
  totalCredited: 0,
});

// Computed - use backend totals (accurate, includes ALL records)
const totals = computed<TableTotals>(() => {
  return backendTotals.value;
});

// Utility functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

const formatDateTime = (dateString: string): string => {
  if (!dateString) return '-';
  const tz = getDisplayTimezone();
  return formatDateTimeInTimezone(dateString, tz);
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    message.success($t('finance.copiedSuccessfully'));
  } catch (error) {
    message.error($t('finance.failed2'));
  }
};

const convertToCSV = (data: RechargeOrder[]): string => {
  const headers = [
    '订单ID',
    '会员ID',
    '会员账号',
    '会员姓名',
    'VIP等级',
    '充值金额',
    '币种',
    '第三方支付',
    '通道名称',
    '商户ID',
    '订单类型',
    '状态',
    '提交时间',
    '支付时间',
    '完成时间',
    '实际金额',
    '赠送金额',
    '手续费',
    '备注',
  ];

  const csvRows = [headers.join(',')];

  data.forEach((row) => {
    const values = [
      `"${row.orderId || ''}"`,
      `"${row.memberId || ''}"`,
      `"${row.memberAccount || ''}"`,
      `"${row.memberName || ''}"`,
      `"${row.vipLevel || ''}"`,
      `"${row.rechargeAmount || 0}"`,
      `"${row.currency || ''}"`,
      `"${row.thirdPartyPayment || ''}"`,
      `"${row.channelName || ''}"`,
      `"${row.merchantId || ''}"`,
      `"${row.orderType || ''}"`,
      `"${row.status || ''}"`,
      `"${formatDateTime(row.submitTime || '')}"`,
      `"${formatDateTime(row.paymentTime || '')}"`,
      `"${formatDateTime(row.completeTime || '')}"`,
      `"${row.actualAmount || 0}"`,
      `"${row.bonusAmount || 0}"`,
      `"${row.fees || 0}"`,
      `"${row.remark || ''}"`,
    ];
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
};

// Table columns
const columns: DataTableColumns<RechargeOrder> = [
  {
    type: 'selection',
    width: 50,
  },
  {
    title: $t('finance.orderNo'),
    key: 'orderId',
    width: 180,
    render: (row) =>
      h(
        NTooltip,
        { trigger: 'hover' },
        {
          trigger: () =>
            h(
              NText,
              {
                style: {
                  color: '#1890ff',
                  cursor: 'pointer',
                  fontSize: '12px',
                },
                onClick: () => handleViewOrderDetail(row),
              },
              { default: () => row.orderId },
            ),
          default: () => '点击查看订单详情',
        },
      ),
  },
  {
    title: $t('finance.memberId'),
    key: 'memberId',
    width: 100,
    render: (row) =>
      h(
        NTooltip,
        { trigger: 'hover' },
        {
          trigger: () =>
            h(
              NText,
              {
                style: {
                  fontSize: '12px',
                  color: '#1890ff',
                  cursor: 'pointer',
                },
                onClick: () => handleViewUserDetail(row.memberId),
              },
              { default: () => row.user?.userID || row.memberId },
            ),
          default: () => '点击查看会员详情',
        },
      ),
  },
  {
    title: $t('finance.memberAccount2'),
    key: 'memberAccount',
    width: 150,
    render: (row) =>
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
        [
          h(
            NTooltip,
            { trigger: 'hover' },
            {
              trigger: () =>
                h(
                  NText,
                  {
                    style: {
                      color: '#1890ff',
                      cursor: 'pointer',
                      fontSize: '12px',
                    },
                    onClick: () => handleViewUserDetail(row.memberId),
                  },
                  { default: () => row.memberAccount },
                ),
              default: () => '点击查看会员详情',
            },
          ),
          // First deposit status indicator
          row.isFirstDeposit
            ? h(
                NTag,
                {
                  type: 'success',
                  size: 'small',
                  style: { fontSize: '10px', padding: '2px 6px' },
                },
                { default: () => $t('finance.alreadyFirstTimeRecharge') },
              )
            : row.hasAnySuccessfulDeposit
              ? null // No tag for subsequent deposits
              : h(
                  NTag,
                  {
                    type: 'warning',
                    size: 'small',
                    style: { fontSize: '10px', padding: '2px 6px' },
                  },
                  { default: () => $t('finance.notRechargeMember') },
                ),
        ],
      ),
  },
  {
    title: $t('finance.firstDepositStatus'),
    key: 'firstDepositStatus',
    width: 80,
    render: (row) =>
      row.isFirstDeposit
        ? h(
            NTag,
            {
              type: 'success',
              size: 'small',
              style: { fontSize: '10px', padding: '2px 6px' },
            },
            { default: () => $t('finance.alreadyFirstDeposit') },
          )
        : row.hasAnySuccessfulDeposit
          ? h(
              NText,
              { style: { fontSize: '12px', color: '#666' } },
              { default: () => '-' },
            )
          : h(
              NTag,
              {
                type: 'warning',
                size: 'small',
                style: { fontSize: '10px', padding: '2px 6px' },
              },
              { default: () => $t('finance.notRecharge') },
            ),
  },
  {
    title: $t('finance.text24'),
    key: 'memberName',
    width: 100,
    render: (row) =>
      h(
        NText,
        { style: { fontSize: '12px' } },
        { default: () => row.memberName || '-' },
      ),
  },
  {
    title: $t('finance.createTime'),
    key: 'createdAt',
    width: 140,
    render: (row) =>
      h(
        NText,
        { style: { fontSize: '12px' } },
        { default: () => renderTzDateTime(row.createdAt) },
      ),
  },
  {
    title: $t('finance.successTime'),
    key: 'confirmTime',
    width: 140,
    render: (row) => {
      const successTime =
        row.status === 'SUCCESS' || row.status === 'success'
          ? (row as any).processingTime ||
            (row as any).confirmTime ||
            (row as any).completeTime
          : '';
      return h(
        NText,
        { style: { fontSize: '12px' } },
        { default: () => (successTime ? renderTzDateTime(successTime) : '-') },
      );
    },
  },
  {
    title: $t('finance.time'),
    key: 'updatedAt',
    width: 140,
    render: (row) =>
      h(
        NText,
        { style: { fontSize: '12px' } },
        { default: () => renderTzDateTime(row.updatedAt) },
      ),
  },
  {
    title: $t('finance.vIPLevel'),
    key: 'vipLevel',
    width: 100,
    render: (row) =>
      h(NTag, { type: 'info', size: 'small' }, { default: () => row.vipLevel }),
  },
  {
    title: $t('finance.memberTier'),
    key: 'memberTier',
    width: 100,
    render: (row) =>
      h(
        NTag,
        { type: 'warning', size: 'small' },
        {
          default: () =>
            row.user?.memberTier?.tierName || row.memberTier || '默认层级',
        },
      ),
  },
  {
    title: $t('finance.rechargeChannelCurrency'),
    key: 'channelCurrency',
    width: 120,
    render: (row) =>
      h('div', { class: 'text-xs' }, [
        h(
          'div',
          { class: 'font-medium' },
          row.channelCurrency || row.channel?.currency || row.currency,
        ),
        h('div', { class: 'text-gray-500' }, '通道币种'),
      ]),
  },
  {
    title: $t('finance.text20'),
    key: 'channelAmount',
    width: 120,
    render: (row) =>
      h('div', { class: 'text-xs' }, [
        h(
          'div',
          { class: 'font-medium' },
          formatCurrency(row.channelAmount || row.rechargeAmount),
        ),
        h(
          'div',
          { class: 'text-gray-500' },
          row.channelCurrency || row.currency,
        ),
      ]),
  },
  {
    title: $t('finance.exchangeRate'),
    key: 'exchangeRate',
    width: 100,
    render: (row) => {
      if (!row.exchangeRate || row.channelCurrency === row.currency) {
        return h('span', { class: 'text-gray-400 text-xs' }, '-');
      }
      return h('div', { class: 'text-xs' }, [
        h('div', { class: 'font-medium' }, `1:${row.exchangeRate}`),
        h(
          'div',
          { class: 'text-gray-500' },
          `${row.currency}:${row.channelCurrency}`,
        ),
      ]);
    },
  },
  {
    title: $t('finance.memberCurrency'),
    key: 'currency',
    width: 90,
    render: (row) =>
      h(
        'div',
        { class: 'text-xs' },
        [
          h('div', { class: 'font-medium' }, 'BRL'),
          row.conversionRatio
            ? h(
                'div',
                { class: 'text-gray-500' },
                `比例1:${row.conversionRatio}`,
              )
            : null,
        ].filter(Boolean),
      ),
  },
  {
    title: $t('finance.orderAmount'),
    key: 'orderAmount',
    width: 120,
    render: (row) =>
      h(
        NText,
        { style: { fontWeight: 'bold', fontSize: '12px' } },
        {
          default: () =>
            formatCurrency((row as any).orderAmount || row.rechargeAmount),
        },
      ),
  },
  {
    title: $t('finance.amount3'),
    key: 'bonusAmount',
    width: 120,
    render: (row) => {
      // Use backend-calculated bonus amount (already calculated from ThirdPartyChannel.bonusConfig)
      const displayAmount = row.bonusAmount || 0;
      return h(
        NText,
        { style: { color: '#f0a020', fontSize: '12px' } },
        { default: () => formatCurrency(displayAmount) },
      );
    },
  },
  {
    title: $t('finance.fee'),
    key: 'fees',
    width: 100,
    render: (row) =>
      h(
        NText,
        { style: { color: '#d03050', fontSize: '12px' } },
        { default: () => formatCurrency(row.fees || 0) },
      ),
  },
  {
    title: $t('finance.amount5'),
    key: 'totalCredited',
    width: 120,
    render: (row) =>
      h(
        NText,
        { style: { fontWeight: 'bold', color: '#18a058', fontSize: '12px' } },
        {
          default: () =>
            formatCurrency(
              (row as any).totalCredited ||
                row.rechargeAmount + row.bonusAmount,
            ),
        },
      ),
  },
  {
    title: $t('finance.thirdPartyPayment1'),
    key: 'thirdPartyPayment',
    width: 120,
    render: (row) =>
      h(
        NText,
        { style: { fontSize: '12px' } },
        { default: () => row.thirdPartyPayment || 'N/A' },
      ),
  },
  {
    title: $t('finance.channel1'),
    key: 'channelName',
    width: 100,
    render: (row) =>
      h(
        NText,
        { style: { fontSize: '12px' } },
        { default: () => row.channel?.channelName || row.channelName || 'N/A' },
      ),
  },

  {
    title: $t('finance.channel4'),
    key: 'channelFeeRate',
    width: 100,
    render: (row) => {
      if (!row.channelFeeRate) {
        return h('span', { class: 'text-gray-400 text-xs' }, '-');
      }
      return h(
        'div',
        { class: 'text-xs font-medium' },
        `${(row.channelFeeRate * 100).toFixed(2)}%`,
      );
    },
  },
  {
    title: $t('finance.orderStatus'),
    key: 'status',
    width: 140,
    render: (row) => {
      const statusMap: Record<
        string,
        { type: 'success' | 'warning' | 'error' | 'info'; text: string }
      > = {
        SUCCESS: { type: 'success', text: '充值成功' },
        success: { type: 'success', text: '充值成功' },
        PENDING: { type: 'warning', text: '待支付' },
        pending: { type: 'warning', text: '待支付' },
        PROCESSING: { type: 'info', text: '处理中' },
        processing: { type: 'info', text: '处理中' },
        FAILED: { type: 'error', text: '充值失败' },
        failed: { type: 'error', text: '充值失败' },
        CANCELLED: { type: 'error', text: '充值取消' },
        canceled: { type: 'error', text: '充值取消' },
        reviewing: { type: 'info', text: '审核中' },
        expired: { type: 'error', text: '充值过期' },
      };
      const statusInfo = statusMap[row.status] || {
        type: 'info',
        text: row.status,
      };

      const elements = [
        h(
          NTag,
          { type: statusInfo.type, size: 'small' },
          { default: () => statusInfo.text },
        ),
      ];

      // Add error details button for failed orders
      if (
        (row.status === 'FAILED' ||
          row.status === 'failed' ||
          row.status === 'CANCELLED' ||
          row.status === 'canceled' ||
          row.status === 'expired') &&
        (row.errorDetails || row.errorCode)
      ) {
        elements.push(
          h(
            NButton,
            {
              size: 'tiny',
              type: 'error',
              text: true,
              style: { marginTop: '4px', fontSize: '10px' },
              onClick: () => {
                // TODO: Implement error details modal
                dialog.info({
                  title: $t('finance.details'),
                  content: () =>
                    h(
                      'div',
                      { class: 'text-sm' },
                      [
                        row.errorCode
                          ? h('div', { class: 'mb-2' }, [
                              h('strong', '错误代码: '),
                              h('span', row.errorCode),
                            ])
                          : null,
                        row.errorDetails
                          ? h('div', [
                              h('strong', '错误信息: '),
                              h('span', row.errorDetails),
                            ])
                          : null,
                      ].filter(Boolean),
                    ),
                  positiveText: $t('finance.confirm3'),
                });
              },
            },
            { default: () => $t('finance.details') },
          ),
        );
      }

      return h('div', { class: 'flex flex-col' }, elements);
    },
  },
  {
    title: $t('common.remark'),
    key: 'remarks',
    width: 150,
    render: (row: any) => {
      // ✅ FIX: Check both remark (singular) and remarks (plural) fields
      // API returns remarks (plural) but deposit table has remark (singular)
      const remarksRaw =
        (row as any).remarks ||
        (row as any).remark ||
        ((row as any).metadata && (row as any).metadata.remarks) ||
        '';
      if (!remarksRaw || remarksRaw.trim() === '') {
        return h(
          NText,
          { style: { color: '#999', fontSize: '12px' } },
          { default: () => '-' },
        );
      }

      // Translate remark key via i18n (e.g., "manual_recharge" -> localized label)
      const remarks = translateSubcategory(remarksRaw);

      return h(
        NTooltip,
        { trigger: 'hover', placement: 'top' },
        {
          trigger: () =>
            h(
              NText,
              {
                style: {
                  fontSize: '12px',
                  color: '#666',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '150px',
                  display: 'block',
                },
              },
              { default: () => remarks },
            ),
          default: () => remarks,
        },
      );
    },
  },
  {
    title: $t('common.actions'),
    key: 'actions',
    width: 200,
    fixed: 'right',
    render: (row) => {
      const actions = [];
      const status = row.status?.toUpperCase();

      // 强制入款 - Available for PENDING, PROCESSING, TIMEOUT, CANCELLED orders (exclude FAILED)
      if (['PENDING', 'PROCESSING', 'TIMEOUT', 'CANCELLED'].includes(status)) {
        actions.push(
          h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              onClick: () => handleForceDeposit(row),
            },
            { default: () => $t('finance.text83') },
          ),
        );
      }

      // 强制取消 - Available for PENDING, PROCESSING orders
      if (['PENDING', 'PROCESSING'].includes(status)) {
        actions.push(
          h(
            NButton,
            {
              size: 'small',
              type: 'error',
              onClick: () => handleForceCancel(row),
            },
            { default: () => $t('finance.cancel') },
          ),
        );
      }

      // 刷新状态 - Available for PENDING, TIMEOUT orders (can be refreshed once per minute)
      if (['PENDING', 'TIMEOUT'].includes(status)) {
        actions.push(
          h(
            NButton,
            {
              size: 'small',
              type: 'info',
              onClick: () => handleRefreshStatus(row),
            },
            { default: () => $t('finance.refreshStatus') },
          ),
        );
      }

      // 备注 - Show remarks button for processed orders (SUCCESS, CANCELLED) that had force operations
      const hasForceOperation =
        (row as any).metadata?.forceCancelledBy ||
        (row as any).metadata?.forceDepositRequestedBy ||
        ['SUCCESS', 'CANCELLED', 'CANCELED'].includes(status);

      if (
        hasForceOperation ||
        ['SUCCESS', 'CANCELLED', 'CANCELED'].includes(status)
      ) {
        actions.push(
          h(
            NButton,
            {
              size: 'small',
              type: 'warning',
              onClick: () => handleUpdateRemarks(row),
            },
            { default: () => $t('common.remark') },
          ),
        );
      }

      // If no actions available, show disabled text
      if (actions.length === 0) {
        return h(
          NText,
          { style: { color: '#999', fontSize: '12px' } },
          { default: () => $t('finance.noAvailableActions') },
        );
      }

      return h(NSpace, { size: 'small' }, actions);
    },
  },
];

// Channel table columns
const channelColumns: DataTableColumns<ThirdPartyChannel> = [
  {
    title: $t('finance.thirdPartyPaymentPlatform'),
    key: 'platformName',
    width: 150,
    render: (row) =>
      h(
        NText,
        { style: { fontSize: '12px' } },
        { default: () => row.platformName },
      ),
  },
  {
    title: $t('finance.thirdPartyPayment1'),
    key: 'gatewayName',
    width: 120,
    render: (row) =>
      h(
        NText,
        { style: { fontSize: '12px' } },
        { default: () => row.gatewayName },
      ),
  },
  {
    title: $t('finance.thirdPartyMerchantId'),
    key: 'merchantId',
    width: 120,
    render: (row) =>
      h(
        NSpace,
        { size: 'small' },
        {
          default: () => [
            h(
              NText,
              { style: { fontSize: '12px' } },
              { default: () => row.merchantId },
            ),
            h(
              NButton,
              {
                size: 'tiny',
                onClick: () => copyToClipboard(row.merchantId),
              },
              { default: () => $t('finance.copy') },
            ),
          ],
        },
      ),
  },
  {
    title: $t('finance.text25'),
    key: 'domain',
    width: 150,
    render: (row) =>
      h(
        NText,
        {
          style: { color: '#1890ff', cursor: 'pointer', fontSize: '12px' },
          onClick: () => window.open(`https://${row.domain}`, '_blank'),
        },
        { default: () => row.domain },
      ),
  },
  {
    title: $t('finance.thirdPartyCallbackIp'),
    key: 'ipAddress',
    width: 130,
    render: (row) =>
      h(
        NText,
        { style: { fontSize: '12px' } },
        {
          default: () =>
            row.ipAddress && row.ipAddress.length > 12
              ? `${row.ipAddress.substring(0, 12)}...`
              : row.ipAddress || '-',
        },
      ),
  },
  {
    title: $t('finance.channel1'),
    key: 'channelName',
    width: 100,
    render: (row) =>
      h(
        NText,
        { style: { fontSize: '12px' } },
        { default: () => row.channelName },
      ),
  },
  {
    title: $t('finance.channel6'),
    key: 'channelCode',
    width: 100,
    render: (row) =>
      h(
        NText,
        { style: { fontSize: '12px' } },
        { default: () => row.channelCode },
      ),
  },
  {
    title: $t('finance.text84'),
    key: 'channelCategory',
    width: 100,
    render: (row) =>
      h(
        NText,
        { style: { fontSize: '12px' } },
        { default: () => row.channelCategory },
      ),
  },
  {
    title: $t('finance.channelCurrency'),
    key: 'currency',
    width: 80,
    render: (row) =>
      h(
        NText,
        { style: { fontSize: '12px' } },
        { default: () => row.currency },
      ),
  },
  {
    title: $t('finance.singleLimit'),
    key: 'channelLimit',
    width: 120,
    render: (row) =>
      h(
        NText,
        { style: { fontSize: '12px' } },
        {
          default: () =>
            row.channelLimit
              ? `${row.channelLimit.min || 0} ~ ${row.channelLimit.max || 0}`
              : '未设置',
        },
      ),
  },
  {
    title: $t('finance.ratio2'),
    key: 'bonusRate',
    width: 120,
    render: (row) =>
      h(
        NSpace,
        { size: 'small' },
        {
          default: () => [
            h(
              NText,
              { style: { fontSize: '12px' } },
              {
                default: () =>
                  typeof row.bonusRate === 'number'
                    ? row.bonusRate.toFixed(2)
                    : Number(row.bonusRate || 0).toFixed(2),
              },
            ),
            h(
              NButton,
              {
                size: 'tiny',
                type: 'primary',
                onClick: () => handleConfigBonusRate(row),
              },
              { default: () => $t('finance.config') },
            ),
          ],
        },
      ),
  },
  {
    title: $t('finance.text19'),
    key: 'terminal',
    width: 120,
    render: (row) =>
      h(
        NSpace,
        { size: 'small' },
        {
          default: () =>
            (row.terminal && Array.isArray(row.terminal)
              ? row.terminal
              : []
            ).map((terminal) =>
              h(
                NTag,
                { size: 'small', type: 'info' },
                { default: () => terminal },
              ),
            ),
        },
      ),
  },
  {
    title: $t('finance.memberTier'),
    key: 'memberLevel',
    width: 100,
    render: (row) =>
      h(
        NText,
        { style: { fontSize: '12px' } },
        { default: () => row.memberLevel },
      ),
  },
  {
    title: $t('finance.channelStatus'),
    key: 'isActive',
    width: 100,
    render: (row) =>
      h(NSwitch, {
        value: row.isActive === true,
        size: 'small',
        'onUpdate:value': (value: boolean) =>
          handleToggleChannelStatus(row, value),
      }),
  },
  {
    title: $t('finance.successRate'),
    key: 'successRate',
    width: 80,
    render: (row) =>
      h(
        NText,
        { style: { fontSize: '12px' } },
        {
          default: () =>
            row.successRate ? `${(row.successRate * 100).toFixed(1)}%` : '-',
        },
      ),
  },
  {
    title: $t('finance.processingTimeS'),
    key: 'avgProcessTime',
    width: 100,
    render: (row) =>
      h(
        NText,
        { style: { fontSize: '12px' } },
        {
          default: () => (row.avgProcessTime ? `${row.avgProcessTime}s` : '-'),
        },
      ),
  },
  {
    title: $t('finance.channelRemark'),
    key: 'remark',
    width: 150,
    render: (row) =>
      h(
        NText,
        { style: { fontSize: '12px' } },
        { default: () => row.remark || '-' },
      ),
  },
  {
    title: $t('common.actions'),
    key: 'actions',
    width: 160,
    fixed: 'right',
    render: (row) =>
      h(
        NSpace,
        { size: 'small' },
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                text: true,
                onClick: () => handleEditChannel(row),
              },
              { default: () => $t('finance.edit') },
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'info',
                text: true,
                onClick: () => handleTestChannelConnection(row),
              },
              { default: () => $t('finance.text26') },
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'error',
                text: true,
                onClick: () => handleDeleteChannel(row),
              },
              { default: () => $t('common.delete') },
            ),
          ],
        },
      ),
  },
];

// Category table columns
const categoryColumns: DataTableColumns<any> = [
  {
    title: $t('finance.text73'),
    key: 'name',
    width: 150,
    render: (row) =>
      h('div', { class: 'flex items-center' }, [
        row.icon
          ? h('img', {
              src: row.icon,
              alt: row.name,
              class: 'w-6 h-6 rounded mr-2 object-cover',
            })
          : h(
              'div',
              {
                class:
                  'w-6 h-6 rounded mr-2 bg-gray-200 flex items-center justify-center text-xs',
              },
              '📁',
            ),
        h(
          NText,
          { style: { fontSize: '12px' } },
          { default: () => row.name || 'N/A' },
        ),
      ]),
  },
  {
    title: $t('finance.text75'),
    key: 'badge',
    width: 120,
    render: (row) =>
      h(
        NText,
        { style: { fontSize: '12px' } },
        { default: () => row.badge || '-' },
      ),
  },
  {
    title: $t('finance.text85'),
    key: 'displayOrder',
    width: 100,
    render: (row) =>
      h(
        NText,
        { style: { fontSize: '12px' } },
        { default: () => row.displayOrder || '0' },
      ),
  },
  {
    title: $t('finance.status1'),
    key: 'blacklistStatus',
    width: 120,
    render: (row) =>
      h(
        NTag,
        {
          type: row.blacklistStatus === 'ENABLED' ? 'success' : 'error',
          size: 'small',
        },
        {
          default: () => (row.blacklistStatus === 'ENABLED' ? '启用' : '停用'),
        },
      ),
  },
  {
    title: $t('finance.onStatus'),
    key: 'isActive',
    width: 100,
    render: (row) =>
      h(NSwitch, {
        value: row.isActive === 'ENABLED',
        size: 'small',
        'onUpdate:value': (value: boolean) =>
          handleToggleCategoryStatus(row, value),
      }),
  },
  {
    title: $t('finance.createTime'),
    key: 'createdAt',
    width: 150,
    render: (row) =>
      h(
        NText,
        { style: { fontSize: '12px' } },
        {
          default: () => {
            if (
              row.createdAt &&
              typeof row.createdAt === 'object' &&
              row.createdAt.toISOString
            ) {
              return formatDateInTimezone(row.createdAt);
            }
            return '-';
          },
        },
      ),
  },
  {
    title: $t('common.actions'),
    key: 'actions',
    width: 120,
    fixed: 'right',
    render: (row) =>
      h(
        NSpace,
        { size: 'small' },
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                text: true,
                onClick: () => handleEditCategory(row),
              },
              { default: () => $t('common.edit') },
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'error',
                text: true,
                onClick: () => handleDeleteCategory(row),
              },
              { default: () => $t('common.delete') },
            ),
          ],
        },
      ),
  },
];

// Using real API data

// Methods
const fetchData = async () => {
  loading.value = true;
  try {
    // Convert date range from display timezone to UTC
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (filters.dateRange) {
      const { startDate: startIso, endDate: endIso } = pickerRangeToUtcIso(
        filters.dateRange,
      );
      startDate = startIso;
      endDate = endIso;
    }

    const params: RechargeOrderListParams = {
      page: paginationReactive.page,
      limit: paginationReactive.pageSize,
      startDate,
      endDate,
      search: filters.search || undefined,
      // rechargeAmount: filters.rechargeAmount || undefined, // Not in API params
      currency: filters.currency || undefined,
      vipLevel: filters.vipLevel || undefined,
      // thirdParty: filters.thirdParty || undefined, // Not in API params
      channel: filters.channel || undefined,
      status: filters.status || undefined,
    };

    // Fetch from API
    try {
      const response = await getRechargeOrderList(params);
      console.log('📡 Frontend received response:', response);
      console.log('📡 Response structure:', JSON.stringify(response, null, 2));

      // Handle different response structures due to interceptor
      let orders: any[] = [];
      let paginationData: any = null;
      let statistics: any = null;

      if (response && response.orders) {
        // Direct response from interceptor: {orders: [...], pagination: {...}, statistics: {...}}
        orders = response.orders;
        paginationData = response.pagination;
        statistics = response.statistics;
        console.log('✅ Using direct response format');
      } else if (response && response.data) {
        // Wrapped response: {data: {orders: [...], pagination: {...}, statistics: {...}}}
        orders = response.data.orders || [];
        paginationData = response.data.pagination;
        statistics = response.data.statistics;
        console.log('✅ Using wrapped response format');
      } else {
        console.error('❌ Unexpected response structure:', response);
        orders = [];
        paginationData = { total: 0 };
        statistics = null;
      }

      tableData.value = orders;
      paginationReactive.total = paginationData?.total || 0;

      // Update totals from backend statistics (ALL records, not just current page)
      if (statistics) {
        backendTotals.value = {
          rechargeAmount: statistics.totalAmount || 0, // 充值面额合计
          orderAmount:
            statistics.totalConfirmedAmount || statistics.totalAmount || 0, // 订单金额合计
          bonusAmount: statistics.totalBonusAmount || 0, // 赠送金额合计
          fee: statistics.totalFees || 0, // 手续费合计
          totalCredited: statistics.totalCreditAmount || 0, // 总上分金额
        };
        console.log('📊 Backend totals:', backendTotals.value);
      } else {
        // Fallback: reset totals if no statistics
        backendTotals.value = {
          rechargeAmount: 0,
          orderAmount: 0,
          bonusAmount: 0,
          fee: 0,
          totalCredited: 0,
        };
      }

      console.log('📊 Table data set:', tableData.value.length, 'orders');
      console.log('📊 Pagination total:', paginationReactive.total);

      // Debug: Log bonusAmount for first few orders
      if (tableData.value.length > 0) {
        console.log(
          '🎁 First order bonusAmount:',
          tableData.value[0].bonusAmount,
        );
        console.log('🎁 First order data sample:', {
          orderId: tableData.value[0].orderId,
          amount: tableData.value[0].amount,
          bonusAmount: tableData.value[0].bonusAmount,
          rechargeAmount: tableData.value[0].rechargeAmount,
        });
      }
    } catch (apiError) {
      console.error('API call failed:', apiError);
      message.error($t('finance.fetchRechargeOrderCountFailed'));
      tableData.value = [];
      paginationReactive.total = 0;
    }
  } catch (error) {
    message.error($t('finance.failedToFetchData'));
    console.error('Fetch data error:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  paginationReactive.page = 1;
  fetchData();
};

// Date range handlers
const handleQuickDateSelect = (value: 'day' | 'week' | 'month' | null) => {
  if (!value) return;

  const tzNow = getNowInTimezone();

  let startYear: number, startMonth: number, startDay: number;
  let endYear: number, endMonth: number, endDay: number;

  if (value === 'day') {
    // Today
    startYear = tzNow.year;
    startMonth = tzNow.month;
    startDay = tzNow.day;
    endYear = tzNow.year;
    endMonth = tzNow.month;
    endDay = tzNow.day;
  } else if (value === 'week') {
    // Last 7 days
    const weekAgo = new Date(tzNow.year, tzNow.month - 1, tzNow.day);
    weekAgo.setDate(weekAgo.getDate() - 7);
    startYear = weekAgo.getFullYear();
    startMonth = weekAgo.getMonth() + 1;
    startDay = weekAgo.getDate();
    endYear = tzNow.year;
    endMonth = tzNow.month;
    endDay = tzNow.day;
  } else {
    // 'month'
    // Last 30 days
    const monthAgo = new Date(tzNow.year, tzNow.month - 1, tzNow.day);
    monthAgo.setDate(monthAgo.getDate() - 30);
    startYear = monthAgo.getFullYear();
    startMonth = monthAgo.getMonth() + 1;
    startDay = monthAgo.getDate();
    endYear = tzNow.year;
    endMonth = tzNow.month;
    endDay = tzNow.day;
  }

  filters.dateRange = displayCalendarRangeToPicker(
    startYear,
    startMonth,
    startDay,
    endYear,
    endMonth,
    endDay,
  );
};

const handleDateRangeChange = (value: [number, number] | null) => {
  filters.dateRange = value;
  filters.dateQuickSelect = null as any; // Clear quick select when manually changing date range
};

const handleReset = () => {
  filters.dateQuickSelect = 'day';
  filters.dateRange = null;
  filters.search = '';
  filters.rechargeAmount = null;
  filters.currency = null;
  filters.vipLevel = null;
  filters.thirdParty = null;
  filters.channel = null;
  filters.status = null;
  paginationReactive.page = 1;
  handleQuickDateSelect('day'); // Apply default date range
  fetchData();
};

watch(timezone, () => {
  if (filters.dateQuickSelect) {
    handleQuickDateSelect(filters.dateQuickSelect);
  }
});

// User search function
// Removed handleUserSearch - not used

// Removed handleCreatePresetOrder - not used

const handleCreateSupplementOrder = () => {
  console.log('🎯 Creating supplement order modal');

  // Reset form
  supplementOrderForm.value.memberId = '';

  // Reset member search
  memberOptions.value = [];
  selectedMember.value = null;

  console.log('✅ Form reset complete:', supplementOrderForm.value);
  showSupplementOrderModal.value = true;
};

// Create Order Modal Functions
const handleCreateOrder = () => {
  console.log('🎯 Opening create order modal');

  // Reset form
  Object.assign(createOrderForm, {
    memberAccount: '',
    rechargeCategory: '',
    orderAmount: '',
    auditMultiple: '1.00',
    bonusType: 'ratio',
    bonusValue: '',
    orderNote: '',
    verificationPassword: '',
  });

  // Reset member data
  foundMember.value = null;
  rechargeCategoryOptions.value = [];

  showCreateOrderModal.value = true;
};

const handleSearchMember = async () => {
  if (!createOrderForm.memberAccount.trim()) {
    message.warning($t('finance.pleaseEnterMemberAccountOrMemberId'));
    return;
  }

  searchingMember.value = true;
  foundMember.value = null;

  try {
    // Search for member by account or ID
    const searchQuery = createOrderForm.memberAccount.trim();
    console.log('🔍 Searching for member:', searchQuery);

    // Check if the input is a numeric ID or account name
    // const isNumericId = /^\d+$/.test(searchQuery); // Not used currently

    // Call the search API - backend will automatically detect search type
    const response = await searchUsers({
      q: searchQuery,
      limit: 1,
    });

    console.log('🔍 Frontend received response:', response);
    console.log('🔍 Response structure:', {
      hasData: !!response,
      dataType: typeof response,
      isArray: Array.isArray(response),
      dataLength: response?.length,
      fullResponse: response,
    });

    if (Array.isArray(response) && response.length > 0) {
      const member = response[0];
      foundMember.value = {
        id: member.value,
        account: member.account,
        name: member.name,
        currency: 'BRL',
        vipLevel: member.vipLevel || 'VIP0',
        balance: member.balance || 0,
      };

      // Load recharge categories from ThirdPartyChannel
      await loadRechargeCategories();

      message.success($t('finance.memberSuccess'));
    } else {
      message.warning($t('finance.notFoundMemberPleaseCheckAccountOrIDYesNoCorrect'));
    }
  } catch (error) {
    console.error('搜索会员失败:', error);
    message.error($t('finance.searchMemberFailedPleaseLaterRetry'));
  } finally {
    searchingMember.value = false;
  }
};

const loadRechargeCategories = async () => {
  try {
    console.log('🔍 Loading recharge categories for dropdown...');
    // Load from new RechargeCategory API
    const response = await getRechargeCategories({
      isActive: 'ENABLED', // Only get active categories
      pageSize: 100, // Get more categories if needed
    });

    console.log(' Recharge categories response:', response);

    // Handle different response structures (same logic as fetchCategoryData)
    let actualData;
    if (response && response.data && response.data.list) {
      actualData = response.data;
    } else if (response && response.list) {
      actualData = response;
    } else if (
      response &&
      response.success &&
      response.data &&
      response.data.data
    ) {
      actualData = response.data.data;
    } else {
      console.error('❌ Unexpected response structure:', response);
      actualData = { list: [] };
    }

    console.log(' Actual categories data:', actualData);

    if (actualData.list && actualData.list.length > 0) {
      rechargeCategoryOptions.value = actualData.list.map((category: any) => ({
        label: category.name,
        value: category.name, // Use name instead of ID for backend compatibility
        name: category.name,
        icon: category.icon,
      }));
      console.log(
        '✅ Loaded recharge category options:',
        rechargeCategoryOptions.value,
      );
    } else {
      console.warn('⚠️ No recharge categories found');
      rechargeCategoryOptions.value = [];
    }
  } catch (error) {
    console.error('❌ 加载充值大类失败:', error);
    message.error($t('finance.loadingRechargeFailed'));
    rechargeCategoryOptions.value = [];
  }
};

// Load member tiers for the dropdown
const loadMemberTiers = async () => {
  try {
    console.log('🔍 Loading member tiers for dropdown...');
    // Load from MemberTier API
    const response = await getMemberTiersApi({
      isActive: true,
      pageSize: 100,
    });

    console.log(' Member tiers response:', response);

    if (response && response.list && response.list.length > 0) {
      memberTierOptions.value = sortMemberTiersForDisplay(response.list).map(
        (tier: any) => ({
        label: tier.tierName,
        value: tier.tierCode,
        name: tier.tierName,
        description: tier.description,
      }),
      );
      console.log('✅ Loaded member tier options:', memberTierOptions.value);
    } else {
      console.warn('⚠️ No member tiers found');
      memberTierOptions.value = [];
    }
  } catch (error) {
    console.error('❌ 加载会员层级失败:', error);
    message.error($t('finance.loadingMemberTierFailed'));
    memberTierOptions.value = [];
  }
};

const handleMemberAccountInput = (value: string) => {
  createOrderForm.memberAccount = value;
  if (!value.trim()) {
    foundMember.value = null;
    rechargeCategoryOptions.value = [];
    availableChannelOptions.value = [];
    createOrderForm.rechargeCategory = '';
    createOrderForm.selectedChannel = null;
    selectedChannelDetails.value = null;
  }
};

const handleRechargeCategoryChange = async (value: string | number) => {
  console.log('🏷️ 充值大类选择:', value);

  // Reset channel selection
  createOrderForm.selectedChannel = null;
  selectedChannelDetails.value = null;
  availableChannelOptions.value = [];

  // Find the selected category details
  const selectedCategory = rechargeCategoryOptions.value.find(
    (option) => option.value === value,
  );
  if (selectedCategory) {
    console.log('✅ Selected category details:', selectedCategory);
    await loadAvailableChannels(selectedCategory.name);
  }
};

const loadAvailableChannels = async (categoryName: string) => {
  loadingChannels.value = true;
  try {
    console.log('🔍 Loading active channels for category:', categoryName);

    // Load active channels for this category
    const response = await thirdPartyChannelApi.getList({
      isActive: true,
      limit: 100,
    });

    console.log('📊 Channels response:', response);

    if (response && response.data && response.data.records) {
      // Filter channels by category
      const filteredChannels = response.data.records.filter(
        (channel: any) =>
          channel.channelCategory === categoryName && channel.isActive,
      );

      availableChannelOptions.value = filteredChannels.map((channel: any) => ({
        label: `${channel.channelName} (${channel.platformName})`,
        value: channel.channelCode,
        channelDetails: channel,
      }));
      console.log('✅ Loaded channel options:', availableChannelOptions.value);
    } else {
      availableChannelOptions.value = [];
      console.log('⚠️ No active channels found for category:', categoryName);
    }
  } catch (error) {
    console.error('❌ Failed to load channels:', error);
    message.error($t('finance.loadingPaymentChannelFailed'));
    availableChannelOptions.value = [];
  } finally {
    loadingChannels.value = false;
  }
};

const handleChannelChange = (value: string) => {
  console.log('🔗 支付通道选择:', value);

  // Find and store the selected channel details
  const selectedOption = availableChannelOptions.value.find(
    (option) => option.value === value,
  );
  if (selectedOption) {
    selectedChannelDetails.value = selectedOption.channelDetails;
    console.log('✅ Selected channel details:', selectedChannelDetails.value);
  }
};

const handleAmountInput = (value: string) => {
  // Validate amount format (max 12 digits, 2 decimal places)
  const regex = /^\d{1,12}(\.\d{0,2})?$/;
  if (!regex.test(value) && value !== '') {
    createOrderForm.orderAmount = createOrderForm.orderAmount;
    return;
  }
  createOrderForm.orderAmount = value;
};

const validateAuditMultiple = (value: string) => {
  // Validate audit multiple format
  const regex = /^\d+(\.\d{0,2})?$/;
  if (!regex.test(value) && value !== '') {
    createOrderForm.auditMultiple = createOrderForm.auditMultiple;
    return;
  }
  createOrderForm.auditMultiple = value;
};

const handleConfirmCreateOrder = async () => {
  if (!foundMember.value) {
    message.warning($t('finance.pleaseSearchConfirmMemberInfo'));
    return;
  }

  if (!createOrderForm.verificationPassword) {
    message.warning($t('finance.pleaseEnter2'));
    return;
  }

  if (!createOrderForm.selectedChannel || !selectedChannelDetails.value) {
    message.warning($t('finance.pleaseSelectPaymentChannel'));
    return;
  }

  createOrderLoading.value = true;
  try {
    // Get the selected category details
    const selectedCategory = rechargeCategoryOptions.value.find(
      (option) => option.value === createOrderForm.rechargeCategory,
    );

    if (!selectedCategory) {
      message.error($t('finance.pleaseSelectHasRecharge'));
      return;
    }

    // Use selected channel details
    const channelDetails = selectedChannelDetails.value;

    // Prepare order data for API
    const orderData = {
      memberId: parseInt(foundMember.value.id), // Ensure it's a number
      memberAccount: foundMember.value.account,
      memberName: foundMember.value.name || '',
      vipLevel: foundMember.value.vipLevel || 'V0',
      rechargeAmount: parseFloat(createOrderForm.orderAmount),
      currency: foundMember.value.currency || 'BRL',
      thirdPartyPayment:
        channelDetails.thirdPartyPayment || selectedCategory.name,
      channelName: channelDetails.channelName,
      channelCode: channelDetails.channelCode,
      merchantId: channelDetails.merchantId,
      orderType: 'NORMAL' as const,
      balanceBefore: parseFloat(foundMember.value.balance?.toString() || '0'),
      bonusAmount: createOrderForm.bonusValue
        ? parseFloat(createOrderForm.bonusValue)
        : 0,
      fees: 0,
      remark: createOrderForm.orderNote || '',
    };

    console.log('🚀 创建订单数据:', orderData);

    // Call the actual API
    const response = await createRechargeOrder(orderData);
    console.log('📡 创建订单响应:', response);
    console.log('📡 Response type:', typeof response);
    console.log('📡 Response keys:', Object.keys(response || {}));

    // Handle different response structures due to interceptor
    if (response && response.id && response.orderId) {
      // Direct response from interceptor (order object)
      message.success($t('finance.orderCreateSuccess'));
      showCreateOrderModal.value = false;

      // Refresh the table to show the new order
      await fetchData();
      console.log('✅ Order created successfully:', response.orderId);
    } else if (response && response.success) {
      // Wrapped response with success property
      message.success($t('finance.orderCreateSuccess'));
      showCreateOrderModal.value = false;

      // Refresh the table to show the new order
      await fetchData();
      console.log('✅ Order created successfully (wrapped response)');
    } else {
      throw new Error('创建失败 - 响应格式不正确');
    }
  } catch (error) {
    console.error('创建订单失败:', error);
    console.log('🔍 Error details:', JSON.stringify(error, null, 2));

    // Check if this is actually a successful 201 response that was treated as an error
    if (error && typeof error === 'object' && error.id && error.orderId) {
      // This is actually the order data from a 201 response
      message.success($t('finance.orderCreateSuccess'));
      showCreateOrderModal.value = false;
      await fetchData();
      console.log(
        '✅ Order created successfully via error handler:',
        error.orderId,
      );
    } else {
      message.error($t('finance.createOrderFailedPleaseLaterRetry'));
    }
  } finally {
    createOrderLoading.value = false;
  }
};

// Member search functions (same as withdrawal management)
const handleMemberSearch = async (query: string) => {
  console.log('🔍 Search query:', query, 'Length:', query?.length);

  if (!query || query.trim().length < 1) {
    console.log('❌ Query too short, clearing options');
    memberOptions.value = [];
    return;
  }

  try {
    memberLoading.value = true;
    console.log('🚀 Calling searchUsers with:', { q: query.trim(), limit: 10 });

    const response = await searchUsers({ q: query.trim(), limit: 10 });
    console.log('✅ Search response:', response);

    if (Array.isArray(response)) {
      memberOptions.value = response.map((user) => ({
        label: user.label,
        value: user.value,
        disabled: false,
        // Store the full user data for selection
        ...user,
      }));
      console.log('✅ Member options set:', memberOptions.value);
    } else {
      console.log('❌ Response not successful or no data:', response);
      memberOptions.value = [];
    }
  } catch (error) {
    console.error('❌ Search members error:', error);
    memberOptions.value = [];
  } finally {
    memberLoading.value = false;
  }
};

const handleMemberSelect = (value: string, option: any) => {
  console.log('✅ Member selected:', value, option);
  console.log(' Option details:', JSON.stringify(option, null, 2));

  if (option) {
    // Store the selected member data
    selectedMember.value = {
      value: option.value,
      account: option.account,
      name: option.name,
      email: option.email || '',
      cpf: option.cpf || '',
      balance: option.balance || 0,
      vipLevel: option.vipLevel || 'V0',
    };

    console.log('✅ Selected member stored:', selectedMember.value);
    console.log('✅ selectedMember.value is now:', !!selectedMember.value);
  } else {
    console.error('❌ No option provided to handleMemberSelect');
  }

  // Clear the search timeout when user selects
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
};

const handleMemberClear = () => {
  console.log('🧹 Member cleared');
  selectedMember.value = null;
  memberOptions.value = [];

  // Clear the search timeout when user clears
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
};

const handleMemberInput = (value: string) => {
  console.log('🔍 Member input changed:', value, typeof value);

  // Clear existing timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  // Only clear selection if the value doesn't match the current selected member's display
  if (selectedMember.value) {
    const currentLabel =
      selectedMember.value.account + ' - ' + selectedMember.value.name;
    if (value !== currentLabel && value !== selectedMember.value.value) {
      console.log('🧹 Clearing selection because value changed from selection');
      selectedMember.value = null;
    }
  }

  // Trigger search after user types (only if no member is selected or value doesn't match)
  if (value && value.trim().length > 0 && !selectedMember.value) {
    console.log('⏰ Setting search timeout for:', value);
    searchTimeout = setTimeout(() => {
      console.log('🚀 Executing search for:', value);
      handleMemberSearch(value);
    }, 300);
  } else if (!value) {
    console.log('❌ Clearing options - empty value');
    memberOptions.value = [];
  }
};

const handleConfirmPresetOrder = async () => {
  try {
    console.log('🎯 Confirming preset order...');
    console.log('✅ selectedMember.value:', selectedMember.value);
    console.log('✅ presetOrderForm.memberId:', presetOrderForm.value.memberId);

    // Check if we have either selectedMember data or at least a member ID in the form
    if (!selectedMember.value && !presetOrderForm.value.memberId) {
      console.error('❌ No member selected!');
      message.error($t('finance.pleaseSelectMember'));
      return;
    }

    // If we have form data but no selectedMember, try to use form data
    let memberData;
    if (selectedMember.value) {
      memberData = {
        memberId: parseInt(selectedMember.value.value),
        memberAccount: selectedMember.value.account,
        memberName: selectedMember.value.name || '',
        balanceBefore: Number(selectedMember.value.balance || 0),
      };
    } else if (presetOrderForm.value.memberId) {
      // Fallback: use form value (assume it's a valid member ID)
      const memberIdString = presetOrderForm.value.memberId;
      const memberId = memberIdString.includes(' - ')
        ? memberIdString.split(' - ')[0]
        : memberIdString;

      memberData = {
        memberId: parseInt(memberId) || 1, // fallback to 1 if parsing fails
        memberAccount: 'Unknown',
        memberName: 'Unknown',
        balanceBefore: 0,
      };
    }

    presetOrderLoading.value = true;

    const orderData: CreateRechargeOrderData = {
      memberId: memberData.memberId,
      memberAccount: memberData.memberAccount,
      memberName: memberData.memberName,
      rechargeAmount: 1000, // Default amount, can be adjusted by admin later
      thirdPartyPayment: 'System',
      channelName: 'Manual',
      channelCode: 'MANUAL_PRESET',
      merchantId: 'PRESET_' + Date.now(),
      orderType: 'PRESET',
      balanceBefore: memberData.balanceBefore,
    };

    if (memberData) {
      await createRechargeOrder(orderData);
      message.success($t('finance.orderCreateSuccess1'));
      showPresetOrderModal.value = false;
      fetchData();
    } else {
      throw new Error('会员数据不完整');
    }
  } catch (error) {
    message.error($t('finance.createOrderFailed1'));
    console.error('Create preset order error:', error);
  } finally {
    presetOrderLoading.value = false;
  }
};

const handleConfirmSupplementOrder = async () => {
  try {
    console.log('🎯 Confirming supplement order...');
    console.log('✅ selectedMember.value:', selectedMember.value);
    console.log(
      '✅ supplementOrderForm.memberId:',
      supplementOrderForm.value.memberId,
    );

    // Check if we have either selectedMember data or at least a member ID in the form
    if (!selectedMember.value && !supplementOrderForm.value.memberId) {
      console.error('❌ No member selected!');
      message.error($t('finance.pleaseSelectMember'));
      return;
    }

    // If we have form data but no selectedMember, try to use form data
    let memberData;
    if (selectedMember.value) {
      memberData = {
        memberId: parseInt(selectedMember.value.value),
        memberAccount: selectedMember.value.account,
        memberName: selectedMember.value.name || '',
        balanceBefore: Number(selectedMember.value.balance || 0),
      };
    } else if (supplementOrderForm.value.memberId) {
      // Fallback: use form value (assume it's a valid member ID)
      const memberIdString = supplementOrderForm.value.memberId;
      const memberId = memberIdString.includes(' - ')
        ? memberIdString.split(' - ')[0]
        : memberIdString;

      memberData = {
        memberId: parseInt(memberId) || 1, // fallback to 1 if parsing fails
        memberAccount: 'Unknown',
        memberName: 'Unknown',
        balanceBefore: 0,
      };
    }

    supplementOrderLoading.value = true;

    const orderData: CreateRechargeOrderData = {
      memberId: memberData.memberId,
      memberAccount: memberData.memberAccount,
      memberName: memberData.memberName,
      rechargeAmount: 1000, // Default amount, can be adjusted by admin later
      thirdPartyPayment: 'System',
      channelName: 'Manual',
      channelCode: 'MANUAL_SUPPLEMENT',
      merchantId: 'SUPPLEMENT_' + Date.now(),
      orderType: 'SUPPLEMENT',
      balanceBefore: memberData.balanceBefore,
    };

    if (memberData) {
      await createRechargeOrder(orderData);
      message.success($t('finance.createSuccess1'));
      showSupplementOrderModal.value = false;
      fetchData();
    } else {
      throw new Error('会员数据不完整');
    }
  } catch (error) {
    message.error($t('finance.createSupplementaryOrderFailed'));
    console.error('Create supplement order error:', error);
  } finally {
    supplementOrderLoading.value = false;
  }
};

// 🚀 NEW: Simplified refresh interval change handler (SmartAutoRefresh handles all timer logic)
const handleRefreshIntervalChange = (newInterval: number) => {
  console.log(`Auto-refresh interval changed to ${newInterval} seconds`);
  // Optional: Save user preference
  localStorage.setItem('recharge-refresh-interval', newInterval.toString());
};

// Handle user detail modal
const handleViewUserDetail = (userId: number) => {
  currentUserId.value = userId;
  showUserDetailModal.value = true;
};

// Handle order detail modal
const handleViewOrderDetail = (order: RechargeOrder) => {
  currentOrderDetail.value = order;
  showOrderDetailModal.value = true;
};

// Calculate bonus amount based on channel configuration (from JOINed data)
const calculateBonusAmount = (order: RechargeOrder) => {
  // Priority 1: Use order's actual bonus amount if it exists (transaction-specific)
  if (order.bonusAmount && order.bonusAmount > 0) {
    return order.bonusAmount;
  }

  // Priority 2: Calculate from channel's basic bonus rate (via JOIN)
  if (order.channel?.bonusRate && order.channel.bonusRate > 0) {
    const amount = order.channelAmount || order.rechargeAmount;
    return amount * order.channel.bonusRate;
  }

  // Priority 3: Try advanced bonus configuration (JSON from JOIN)
  if (order.channel?.bonusConfig) {
    try {
      const bonusConfig =
        typeof order.channel.bonusConfig === 'string'
          ? JSON.parse(order.channel.bonusConfig)
          : order.channel.bonusConfig;

      if (bonusConfig?.bonusRules) {
        const amount = order.channelAmount || order.rechargeAmount;
        for (const rule of bonusConfig.bonusRules) {
          if (amount >= rule.minAmount && amount <= rule.maxAmount) {
            if (rule.bonusType === 'PERCENTAGE') {
              return amount * rule.bonusValue;
            } else {
              return rule.bonusValue;
            }
          }
        }
      }
    } catch (error) {
      console.warn('Error parsing bonus config:', error);
    }
  }

  // Fallback to 0
  return 0;
};

const handlePageChange = (page: number) => {
  paginationReactive.page = page;
  fetchData();
};

const handlePageSizeChange = (pageSize: number) => {
  paginationReactive.pageSize = pageSize;
  paginationReactive.page = 1;
  fetchData();
};

// SmartDataGrid event handlers
const handleRowClick = (row: RechargeOrder) => {
  console.log('Row clicked:', row);
};

const clearSelection = () => {
  checkedRowKeys.value = [];
};

const selectAll = () => {
  checkedRowKeys.value = tableData.value.map((item) => item.orderId);
};

// Update bulk operation handlers to accept selectedRows parameter
const handleBulkProcess = (selectedRows?: RechargeOrder[]) => {
  const orders =
    selectedRows ||
    tableData.value.filter((item) =>
      checkedRowKeys.value.includes(item.orderId),
    );
  console.log('Bulk processing orders:', orders);
  message.info(`批量处理 ${orders.length} 个订单`);
};

const handleBulkCancel = (selectedRows?: RechargeOrder[]) => {
  const orders =
    selectedRows ||
    tableData.value.filter((item) =>
      checkedRowKeys.value.includes(item.orderId),
    );
  console.log('Bulk canceling orders:', orders);
  message.info(`批量取消 ${orders.length} 个订单`);
};

const handleBulkExport = (selectedRows?: RechargeOrder[]) => {
  const orders =
    selectedRows ||
    tableData.value.filter((item) =>
      checkedRowKeys.value.includes(item.orderId),
    );
  console.log('Bulk exporting orders:', orders);
  message.info(`导出 ${orders.length} 个订单`);
};

// Row click handlers for SmartDataGrid
const handleCategoryRowClick = (row: any) => {
  console.log('Category row clicked:', row);
};

const handleChannelRowClick = (row: ThirdPartyChannel) => {
  console.log('Channel row clicked:', row);
};

const handleStatsRowClick = (row: any) => {
  console.log('Stats row clicked:', row);
};

// Operation handlers for the new 操作 column
const handleForceDeposit = async (row: any) => {
  try {
    console.log('💰 Force deposit for order:', row.orderId);

    // Show confirmation dialog
    const confirmed = await new Promise<boolean>((resolve) => {
      dialog.warning({
        title: $t('finance.confirm2'),
        content: `确定要对订单 ${row.orderId} 执行强制入款操作吗？`,
        positiveText: $t('common.confirm'),
        negativeText: $t('common.cancel'),
        onPositiveClick: () => {
          resolve(true);
        },
        onNegativeClick: () => {
          resolve(false);
        },
      });
    });

    if (!confirmed) return;

    // Call the force deposit API using requestClient
    const response = await requestClient.put(
      `/transactions/deposits/${row.id}/force`,
      {
        confirmedAmount: row.amount,
        bonusAmount: row.bonusAmount || 0,
        reason: '管理员强制入款',
      },
    );

    if (response.success !== false) {
      message.success($t('finance.success1'));
      fetchData(); // Refresh table
    } else {
      message.error(response.message || '强制入款失败');
    }
  } catch (error) {
    console.error('Force deposit error:', error);
    message.error($t('finance.actionsFailed'));
  }
};

const handleForceCancel = async (row: any) => {
  try {
    console.log('❌ Force cancel for order:', row.orderId);

    // Show input dialog for cancellation reason
    const reason = await new Promise<string | null>((resolve) => {
      let inputValue = '';
      dialog.warning({
        title: $t('finance.confirmCancel1'),
        content: () =>
          h('div', [
            h('p', `确定要取消订单 ${row.orderId} 吗？`),
            h('br'),
            h('p', '请输入取消原因：'),
            h('input', {
              type: 'text',
              placeholder: '请输入取消原因',
              style:
                'width: 100%; padding: 8px; margin-top: 8px; border: 1px solid #ddd; border-radius: 4px;',
              onInput: (e: any) => {
                inputValue = e.target.value;
              },
            }),
          ]),
        positiveText: $t('finance.confirmCancel'),
        negativeText: $t('common.cancel'),
        onPositiveClick: () => {
          if (!inputValue.trim()) {
            message.warning($t('finance.pleaseEnterCancel'));
            return false;
          }
          resolve(inputValue);
        },
        onNegativeClick: () => {
          resolve(null);
        },
      });
    });

    if (!reason) return;

    // Call the force cancel API using requestClient
    const response = await requestClient.put(
      `/transactions/deposits/${row.id}/cancel`,
      {
        reason: reason,
      },
    );

    if (response.success !== false) {
      message.success($t('finance.cancelSuccess'));
      fetchData(); // Refresh table
    } else {
      message.error(response.message || '强制取消失败');
    }
  } catch (error) {
    console.error('Force cancel error:', error);
    message.error($t('finance.cancelActionsFailed'));
  }
};

const handleRefreshStatus = async (row: any) => {
  try {
    console.log('🔄 Refresh status for order:', row.orderId);

    // Call the refresh status API using requestClient
    const response = await requestClient.post(`/deposits/${row.id}/refresh`);

    if (response.success !== false) {
      message.success($t('finance.statusRefreshPleaseAlreadyPleaseLater'));
      // Don't refresh immediately as the status update might take time
    } else {
      if (response.message && response.message.includes('频繁')) {
        message.warning($t('finance.refreshPleaseLater'));
      } else {
        message.error(response.message || '状态刷新失败');
      }
    }
  } catch (error) {
    console.error('Refresh status error:', error);
    message.error($t('finance.statusRefreshActionsFailed'));
  }
};

const handleUpdateRemarks = async (row: any) => {
  try {
    console.log('📝 Update remarks for order:', row.orderId);

    // Show a dialog to enter remarks
    const remarksInput = await new Promise<string | null>((resolve) => {
      const currentRemarks =
        row.remarks || (row.metadata && row.metadata.remarks) || '';
      const inputRef = ref(currentRemarks);
      const d = dialog.create({
        title: $t('finance.remark2'),
        content: () => {
          return h('div', [
            h(
              'p',
              { style: { marginBottom: '12px', color: '#666' } },
              `订单号: ${row.orderId}`,
            ),
            h(NInput, {
              value: inputRef.value,
              onUpdateValue: (value: string) => (inputRef.value = value),
              type: 'textarea',
              placeholder: '请输入备注信息...',
              rows: 4,
              maxlength: 500,
              showCount: true,
            }),
          ]);
        },
        positiveText: $t('common.save'),
        negativeText: $t('common.cancel'),
        onPositiveClick: () => {
          resolve(inputRef.value);
        },
        onNegativeClick: () => {
          resolve(null);
        },
      });
    });

    if (remarksInput !== null && remarksInput.trim()) {
      // Call the API to update remarks
      const response = await requestClient.put(
        `/transactions/deposits/${row.id}/remarks`,
        {
          remarks: remarksInput.trim(),
        },
      );

      // Response interceptor unwraps {code: 0, data: {...}} to just {...}
      // So we check if response exists and has the expected data
      if (response && response.depositId) {
        message.success($t('finance.remarkUpdateSuccessful'));
        await fetchData(); // Refresh the table
      } else {
        message.error($t('finance.remarkFailed'));
      }
    }
  } catch (error) {
    console.error('❌ Error updating remarks:', error);
    message.error($t('finance.remarkFailed'));
  }
};

// Channel management methods
const fetchChannelData = async () => {
  channelLoading.value = true;
  try {
    const params = {
      page: channelPaginationReactive.page,
      limit: channelPaginationReactive.pageSize,
      search: channelFilters.search || undefined,
      platformName: channelFilters.platform || undefined,
      gatewayName: channelFilters.gateway || undefined,
      channelName: channelFilters.channelName || undefined,
      currency: channelFilters.currency || undefined,
      memberLevel: channelFilters.memberLevel || undefined,
    };

    console.log('🔍 Fetching channels with params:', params);
    const response = await thirdPartyChannelApi.getList(params);
    console.log(' Channel data response:', response);

    // Handle different response structures due to interceptor
    let actualData;
    if (response && response.records) {
      // Direct response from interceptor: {records: [...], pagination: {...}}
      actualData = response;
    } else if (response && response.data && response.data.records) {
      // Wrapped response: {data: {records: [...], pagination: {...}}}
      actualData = response.data;
    } else {
      console.error('❌ Unexpected channel response structure:', response);
      actualData = { records: [], pagination: { total: 0 } };
    }

    console.log(' Actual channel data:', actualData);

    if (actualData.records) {
      // Transform data to match frontend interface if needed
      let channels = actualData.records.map((channel: any) => ({
        ...channel,
        channelLimit: channel.channelLimit || {
          min: Number(channel.minAmount || 0),
          max: Number(channel.maxAmount || 0),
        },
        bonusRate: Number(channel.bonusRate || 0),
        terminal: Array.isArray(channel.terminal) ? channel.terminal : ['PC'],
      }));

      channelTableData.value = channels;
      channelPaginationReactive.total = actualData.pagination?.total || 0;
      console.log('✅ Loaded channels:', channelTableData.value.length);
      console.log(
        '✅ Channel pagination total:',
        channelPaginationReactive.total,
      );
    } else {
      channelTableData.value = [];
      channelPaginationReactive.total = 0;
    }
  } catch (error) {
    message.error($t('finance.fetchChannelDataFailed'));
    console.error('Fetch channel data error:', error);
    channelTableData.value = [];
    channelPaginationReactive.total = 0;
  } finally {
    channelLoading.value = false;
  }
};

const handleChannelSearch = () => {
  channelPaginationReactive.page = 1;
  fetchChannelData();
};

const handleChannelReset = () => {
  channelFilters.platform = null;
  channelFilters.gateway = null;
  channelFilters.channelName = null;
  channelFilters.currency = null;
  channelFilters.memberLevel = null;
  channelFilters.search = '';
  channelPaginationReactive.page = 1;
  fetchChannelData();
};

const handleCloseChannelModal = () => {
  showChannelModal.value = false;
  // Reset form to prevent stale data
  channelForm.value = {
    currency: 'BRL',
    thirdPartyPayment: '',
    platformName: '',
    merchantId: '',
    merchantKey: '',
    successStatus: 'SUCCESS',
    orderUrl: '',
    queryUrl: '',
    callbackIpWhitelist: '',
    channelCategory: '',
    channelCode: '',
    channelName: '',
    channelType: 'NORMAL',
    memberLevels: [],
    terminals: [],
    channelLimit: {
      min: 10,
      max: 50000,
    },
    requireName: false,
    isActive: true,
    customBadge: '',
    feeRate: 0,
    channelFeeRate: 0,
    recommendedAmounts:
      '10.00,15.00,50.00,100.00,300.00,500.00,1000.00,5000.00',
    notificationMessage: '',
    channelConfig: {
      enabled: true,
    },
    // Legacy fields for backward compatibility
    gatewayName: '',
    domain: '',
    ipAddress: '',
    bonusRate: 0,
    terminal: ['PC'],
    memberLevel: 'ALL',
    priority: 0,
    remark: '',
  };
  isEditingChannel.value = false;
  currentEditingChannel.value = null;
};

const handleAddChannel = () => {
  isEditingChannel.value = false;
  currentEditingChannel.value = null;
  activeChannelTab.value = 'channel-info';

  // Initialize form with default values
  channelForm.value = {
    currency: 'BRL',
    thirdPartyPayment: '',
    platformName: '',
    merchantId: '',
    merchantKey: '',
    successStatus: 'SUCCESS',
    orderUrl: '',
    queryUrl: '',
    callbackIpWhitelist: '',
    channelCategory: '',
    channelCode: '',
    channelName: '',
    channelType: 'NORMAL',
    memberLevels: [],
    terminals: [],
    channelLimit: {
      min: 10,
      max: 50000,
    },
    requireName: false,
    isActive: true,
    customBadge: '',
    feeRate: 0,
    channelFeeRate: 0,
    recommendedAmounts:
      '10.00,15.00,50.00,100.00,300.00,500.00,1000.00,5000.00',
    notificationMessage: '',
    channelConfig: {
      enabled: true,
    },
    // Legacy fields for backward compatibility
    gatewayName: '',
    domain: '',
    ipAddress: '',
    bonusRate: 0,
    terminal: ['PC'],
    memberLevel: 'ALL',
    priority: 0,
    remark: '',
  };

  showChannelModal.value = true;
};

const handleEditChannel = async (channel: any) => {
  isEditingChannel.value = true;
  currentEditingChannel.value = channel;
  activeChannelTab.value = 'channel-info';

  // Map existing channel data to form structure
  channelForm.value = {
    currency: channel.currency || 'BRL',
    thirdPartyPayment: channel.thirdPartyPayment || '',
    platformName: channel.platformName || '',
    merchantId: channel.merchantId || '',
    merchantKey: channel.merchantKey || '',
    successStatus: channel.successStatus || 'SUCCESS',
    orderUrl: channel.orderUrl || '',
    queryUrl: channel.queryUrl || '',
    callbackIpWhitelist: channel.callbackIpWhitelist || '',
    channelCategory: channel.channelCategory || '',
    channelCode: channel.channelCode || '',
    channelName: channel.channelName || '',
    channelType: channel.channelType || 'NORMAL',
    memberLevels: Array.isArray(channel.memberLevels)
      ? channel.memberLevels
      : [],
    terminals: Array.isArray(channel.terminals) ? channel.terminals : [],
    channelLimit: {
      min: channel.minAmount || channel.channelLimit?.min || 10,
      max: channel.maxAmount || channel.channelLimit?.max || 50000,
    },
    requireName: channel.requireName || false,
    isActive: channel.isActive !== undefined ? channel.isActive : true,
    customBadge: channel.customBadge || '',
    feeRate: channel.feeRate || 0,
    channelFeeRate: channel.channelFeeRate || 0,
    recommendedAmounts:
      channel.recommendedAmounts ||
      '10.00,15.00,50.00,100.00,300.00,500.00,1000.00,5000.00',
    notificationMessage: channel.notificationMessage || '',
    channelConfig: {
      enabled:
        channel.channelConfig?.enabled !== undefined
          ? channel.channelConfig.enabled
          : true,
    },
    // Bonus configuration
    bonusConfig: channel.bonusConfig || null,

    // Legacy fields for backward compatibility
    gatewayName: channel.gatewayName || '',
    domain: channel.domain || '',
    ipAddress: channel.ipAddress || '',
    bonusRate: channel.bonusRate || 0,
    terminal: Array.isArray(channel.terminal) ? channel.terminal : ['PC'],
    memberLevel: channel.memberLevel || 'ALL',
    priority: channel.priority || 0,
    remark: channel.remark || '',
  };

  // ✅ FIX: Populate recommended amounts form from existing data
  // Use Object.assign to preserve reactivity instead of replacing the entire object
  console.log(
    '🔍 [PROD DEBUG] Channel recommendedAmounts type:',
    typeof channel.recommendedAmounts,
  );
  console.log(
    '🔍 [PROD DEBUG] Channel recommendedAmounts value:',
    channel.recommendedAmounts,
  );
  console.log(
    '🔍 [PROD DEBUG] Channel recommendedAmounts stringified:',
    JSON.stringify(channel.recommendedAmounts),
  );

  // Default form structure
  const defaultFormData = {
    amountType: '可输入任意金额',
    amounts: [
      { amount: '', bonusType: '按比例', bonusValue: '' },
      { amount: '', bonusType: '按比例', bonusValue: '' },
      { amount: '', bonusType: '按比例', bonusValue: '' },
      { amount: '', bonusType: '按比例', bonusValue: '' },
      { amount: '', bonusType: '按比例', bonusValue: '' },
      { amount: '', bonusType: '按比例', bonusValue: '' },
      { amount: '', bonusType: '按比例', bonusValue: '' },
      { amount: '', bonusType: '按比例', bonusValue: '' },
    ],
  };

  // ✅ FIX: Use Object.assign to preserve reactivity (don't replace the entire object)
  Object.assign(recommendedAmountForm.value, defaultFormData);

  if (
    channel.recommendedAmounts &&
    typeof channel.recommendedAmounts === 'string'
  ) {
    const amounts = channel.recommendedAmounts
      .split(',')
      .map((amount: string) => amount.trim())
      .filter((amount: string) => amount && !isNaN(parseFloat(amount)))
      .slice(0, 8);

    console.log('🔍 [PROD DEBUG] Parsed amounts from string:', amounts);

    // Populate with existing amounts using Object.assign for each item
    amounts.forEach((amount: string, index: number) => {
      if (index < 8 && recommendedAmountForm.value.amounts[index]) {
        // ✅ FIX: Use Object.assign to update nested objects
        Object.assign(recommendedAmountForm.value.amounts[index], {
          amount: String(amount),
          bonusType: '按比例',
          bonusValue: '0.12',
        });
      }
    });

    console.log(
      '🔄 [PROD DEBUG] After string population:',
      JSON.stringify(recommendedAmountForm.value, null, 2),
    );
  } else if (
    channel.recommendedAmounts &&
    typeof channel.recommendedAmounts === 'object'
  ) {
    console.log(
      '📝 [PROD DEBUG] Channel has structured recommendedAmounts:',
      JSON.stringify(channel.recommendedAmounts, null, 2),
    );

    // Try to extract amounts from the object structure
    if (
      channel.recommendedAmounts.amounts &&
      Array.isArray(channel.recommendedAmounts.amounts)
    ) {
      console.log(
        '🔍 [PROD DEBUG] Processing amounts array:',
        channel.recommendedAmounts.amounts,
      );

      channel.recommendedAmounts.amounts.forEach((item: any, index: number) => {
        if (index < 8 && recommendedAmountForm.value.amounts[index]) {
          // ✅ FIX: Support both 'rewardAmount' (backend format) and 'amount' (legacy format)
          const amountValue =
            item.rewardAmount ?? item.amount ?? item.value ?? null;

          console.log(`🔍 [PROD DEBUG] Item ${index}:`, {
            item,
            amountValue,
            type: typeof amountValue,
          });

          if (amountValue !== null && amountValue !== undefined) {
            // ✅ FIX: Use Object.assign to update nested objects and ensure string type
            Object.assign(recommendedAmountForm.value.amounts[index], {
              amount: String(amountValue),
              bonusType: item.bonusType === 'FIXED' ? '固定金额' : '按比例',
              bonusValue: String(item.bonusValue ?? '0.12'),
            });
          }
        }
      });

      // ✅ FIX: Also set the amountType from mode
      if (channel.recommendedAmounts.mode) {
        recommendedAmountForm.value.amountType =
          channel.recommendedAmounts.mode === 'FIXED'
            ? '仅限固定金额'
            : '可输入任意金额';
      }
    }

    console.log(
      '🔄 [PROD DEBUG] After object population:',
      JSON.stringify(recommendedAmountForm.value, null, 2),
    );
  } else {
    console.log(
      '📝 [PROD DEBUG] No recommendedAmounts data found, using default form',
    );
  }

  // ✅ FIX: Use nextTick to ensure form is mounted before logging final state
  await nextTick();
  console.log(
    '✅ [PROD DEBUG] Final recommendedAmountForm.value:',
    JSON.stringify(recommendedAmountForm.value, null, 2),
  );
  console.log(
    '✅ [PROD DEBUG] Form amounts length:',
    recommendedAmountForm.value.amounts.length,
  );
  recommendedAmountForm.value.amounts.forEach((item, idx) => {
    console.log(`✅ [PROD DEBUG] Form amount[${idx}]:`, {
      amount: item.amount,
      bonusType: item.bonusType,
      bonusValue: item.bonusValue,
    });
  });

  // Populate bonus config form from existing data
  if (channel.bonusConfig && typeof channel.bonusConfig === 'object') {
    console.log('🎁 Channel has bonus config:', channel.bonusConfig);

    // Reset bonus form to defaults first
    bonusForm.value = {
      bonusRate: channel.bonusRate || 0,
      showBubble: channel.bonusConfig.showBubble ? 'show' : 'hide',
      bubbleColor: channel.bonusConfig.bubbleBackgroundColor || 'blue',
      memberLevel:
        channel.bonusConfig.memberLevelStrategy === 'UNIFIED'
          ? 'no-limit'
          : 'by-level',
      amountRanges: [
        {
          minAmount: '1.00',
          maxAmount: '29.99',
          fixedAmount: '',
          bonusRate: 0.0,
        },
        {
          minAmount: '30',
          maxAmount: '999.99',
          fixedAmount: '',
          bonusRate: 0.2,
        },
        {
          minAmount: '1000',
          maxAmount: '2999.99',
          fixedAmount: '',
          bonusRate: 0.4,
        },
        {
          minAmount: '3000',
          maxAmount: '9999.99',
          fixedAmount: '',
          bonusRate: 0.6,
        },
        {
          minAmount: '10000',
          maxAmount: '29999.99',
          fixedAmount: '',
          bonusRate: 2.6,
        },
        {
          minAmount: '30000',
          maxAmount: '50000.00',
          fixedAmount: '',
          bonusRate: 8.8,
        },
      ],
      bonusLimit: channel.bonusConfig.maxBonusAmount
        ? String(channel.bonusConfig.maxBonusAmount)
        : '',
      dailyLimitType:
        channel.bonusConfig.countLimitType === 'DAILY' ? 'daily' : 'total',
      dailyLimit: channel.bonusConfig.maxBonusCount
        ? String(channel.bonusConfig.maxBonusCount)
        : '',
    };

    // Populate amount ranges from bonus config
    if (
      channel.bonusConfig.bonusRules &&
      Array.isArray(channel.bonusConfig.bonusRules)
    ) {
      channel.bonusConfig.bonusRules.forEach((rule: any, index: number) => {
        if (index < 6 && bonusForm.value.amountRanges[index]) {
          bonusForm.value.amountRanges[index].minAmount = String(
            rule.minAmount,
          );
          bonusForm.value.amountRanges[index].maxAmount = String(
            rule.maxAmount,
          );
          bonusForm.value.amountRanges[index].bonusRate = rule.bonusRatio * 100; // Convert decimal to percentage
          bonusForm.value.amountRanges[index].fixedAmount = rule.fixedAmount
            ? String(rule.fixedAmount)
            : '';
        }
      });
    }

    console.log(
      '🔄 Populated bonusForm from existing bonus config:',
      bonusForm.value,
    );
  } else {
    console.log('🎁 No bonus config found, using default bonus form');
  }

  showChannelModal.value = true;
};

const handleSaveChannel = async () => {
  if (!channelFormRef.value) return;

  try {
    await channelFormRef.value.validate();
    channelModalLoading.value = true;

    console.log('💾 Saving channel:', channelForm.value);
    console.log('🔧 Is editing:', isEditingChannel.value);
    console.log(
      '📊 Recommended amounts data type:',
      typeof channelForm.value.recommendedAmounts,
    );
    console.log(
      '📊 Recommended amounts data:',
      channelForm.value.recommendedAmounts,
    );

    // Transform frontend data to backend format
    const { channelLimit, ...formData } = channelForm.value;

    // Remove empty legacy fields to avoid validation errors
    const cleanedFormData = { ...formData };
    if (cleanedFormData.domain === '') delete cleanedFormData.domain;
    if (cleanedFormData.ipAddress === '') delete cleanedFormData.ipAddress;
    if (cleanedFormData.gatewayName === '') delete cleanedFormData.gatewayName;

    const backendData = {
      ...cleanedFormData,
      minAmount: Math.max(channelLimit?.min || 1, 1),
      maxAmount: Math.max(channelLimit?.max || 10000, 1),
    };

    // Ensure minAmount < maxAmount
    if (backendData.minAmount >= backendData.maxAmount) {
      throw new Error('最小金额必须小于最大金额');
    }

    if (isEditingChannel.value && currentEditingChannel.value) {
      // Update existing channel
      const response = await thirdPartyChannelApi.update(
        currentEditingChannel.value.id,
        backendData as any,
      );
      console.log('🔍 Update response:', response);

      // Check for success in the response structure
      if (response && (response.success || response.data?.id || response.id)) {
        console.log('✅ Update successful, showing success message');
        message.success(response.message || '更新成功');
        handleCloseChannelModal();
      } else {
        console.log('❌ Update failed');
        throw new Error(response?.message || '更新失败');
      }
    } else {
      // Create new channel
      const response = await thirdPartyChannelApi.create(backendData as any);
      console.log('🔍 Create response:', response);

      // Check for success in the response structure
      if (response && (response.success || response.data?.id || response.id)) {
        message.success(response.message || '创建成功');
        handleCloseChannelModal();
      } else {
        throw new Error(response?.message || '创建失败');
      }
    }

    showChannelModal.value = false;
    fetchChannelData();
  } catch (error) {
    message.error(isEditingChannel.value ? '更新失败' : '创建失败');
    console.error('Save channel error:', error);
  } finally {
    channelModalLoading.value = false;
  }
};

const handleConfigBonusRate = (channel: ThirdPartyChannel) => {
  currentBonusChannel.value = channel;

  // Reset bonus form to defaults first
  bonusForm.value = {
    bonusRate: channel.bonusRate || 0,
    showBubble: 'show',
    bubbleColor: 'blue',
    memberLevel: 'no-limit',
    amountRanges: [
      {
        minAmount: '1.00',
        maxAmount: '29.99',
        fixedAmount: '',
        bonusRate: 0.0,
      },
      { minAmount: '30', maxAmount: '999.99', fixedAmount: '', bonusRate: 0.2 },
      {
        minAmount: '1000',
        maxAmount: '2999.99',
        fixedAmount: '',
        bonusRate: 0.4,
      },
      {
        minAmount: '3000',
        maxAmount: '9999.99',
        fixedAmount: '',
        bonusRate: 0.6,
      },
      {
        minAmount: '10000',
        maxAmount: '29999.99',
        fixedAmount: '',
        bonusRate: 2.6,
      },
      {
        minAmount: '30000',
        maxAmount: '50000.00',
        fixedAmount: '',
        bonusRate: 8.8,
      },
    ],
    bonusLimit: '',
    dailyLimitType: 'daily',
    dailyLimit: '',
  };

  // If channel has existing bonus config, populate it
  if (channel.bonusConfig && typeof channel.bonusConfig === 'object') {
    console.log('🎁 Channel has bonus config:', channel.bonusConfig);

    bonusForm.value.showBubble = channel.bonusConfig.showBubble
      ? 'show'
      : 'hide';
    bonusForm.value.bubbleColor =
      channel.bonusConfig.bubbleBackgroundColor || 'blue';
    bonusForm.value.memberLevel =
      channel.bonusConfig.memberLevelStrategy === 'UNIFIED'
        ? 'no-limit'
        : 'by-level';
    bonusForm.value.bonusLimit = channel.bonusConfig.maxBonusAmount
      ? String(channel.bonusConfig.maxBonusAmount)
      : '';
    bonusForm.value.dailyLimitType =
      channel.bonusConfig.countLimitType === 'DAILY' ? 'daily' : 'total';
    bonusForm.value.dailyLimit = channel.bonusConfig.maxBonusCount
      ? String(channel.bonusConfig.maxBonusCount)
      : '';

    // Populate amount ranges from bonus config
    if (
      channel.bonusConfig.bonusRules &&
      Array.isArray(channel.bonusConfig.bonusRules)
    ) {
      channel.bonusConfig.bonusRules.forEach((rule: any, index: number) => {
        if (index < 6 && bonusForm.value.amountRanges[index]) {
          bonusForm.value.amountRanges[index].minAmount = String(
            rule.minAmount,
          );
          bonusForm.value.amountRanges[index].maxAmount = String(
            rule.maxAmount,
          );
          bonusForm.value.amountRanges[index].bonusRate = rule.bonusRatio * 100; // Convert decimal to percentage
          bonusForm.value.amountRanges[index].fixedAmount = rule.fixedAmount
            ? String(rule.fixedAmount)
            : '';
        }
      });
    }

    console.log(
      '🔄 Populated bonusForm from existing bonus config:',
      bonusForm.value,
    );
  } else {
    console.log('🎁 No bonus config found, using default bonus form');
  }

  showBonusConfigModal.value = true;
};

// Add/Remove amount range functions for bonus modal
const addAmountRange = () => {
  bonusForm.value.amountRanges.push({
    minAmount: '0.00',
    maxAmount: '100.00',
    fixedAmount: '',
    bonusRate: 0,
  });
};

const removeAmountRange = (index: number) => {
  if (bonusForm.value.amountRanges.length > 1) {
    bonusForm.value.amountRanges.splice(index, 1);
  }
};

// Save handlers for the new modals
const handleSaveBonusConfig = async () => {
  try {
    if (!bonusFormRef.value) return;

    bonusModalLoading.value = true;

    // Validate form
    await bonusFormRef.value.validate();

    // Check if form has valid data
    if (
      !bonusForm.value.amountRanges ||
      bonusForm.value.amountRanges.length === 0
    ) {
      throw new Error('请至少配置一个金额区间');
    }

    console.log('💰 Saving bonus config:', bonusForm.value);

    // Debug: Log each range to see what we're working with
    console.log('🔍 Debug - Amount ranges before processing:');
    bonusForm.value.amountRanges.forEach((range: any, index: number) => {
      console.log(`Range ${index}:`, {
        minAmount: range.minAmount,
        maxAmount: range.maxAmount,
        fixedAmount: range.fixedAmount,
        bonusRate: range.bonusRate,
        minAmountType: typeof range.minAmount,
        maxAmountType: typeof range.maxAmount,
        bonusRateType: typeof range.bonusRate,
      });
    });

    // Transform the form data to match the database schema
    const bonusConfig = {
      showBubble: bonusForm.value.showBubble === 'show',
      bubbleBackgroundColor: bonusForm.value.bubbleColor,
      memberLevelStrategy:
        bonusForm.value.memberLevel === 'no-limit'
          ? 'UNIFIED'
          : 'SEPARATE_BY_LEVEL',
      bonusRules: bonusForm.value.amountRanges
        .filter((range: any) => {
          // Only include ranges with valid min/max amounts and bonus rate
          const minAmount = parseFloat(range.minAmount);
          const maxAmount = parseFloat(range.maxAmount);
          const bonusRate = parseFloat(range.bonusRate);

          const isValid =
            !isNaN(minAmount) &&
            !isNaN(maxAmount) &&
            !isNaN(bonusRate) &&
            minAmount > 0 &&
            maxAmount > minAmount &&
            bonusRate >= 0;

          if (!isValid) {
            console.log('⚠️ Filtering out invalid range:', {
              range,
              minAmount,
              maxAmount,
              bonusRate,
            });
          }

          return isValid;
        })
        .map((range: any) => {
          const minAmount = parseFloat(range.minAmount);
          const maxAmount = parseFloat(range.maxAmount);
          const bonusRate = parseFloat(range.bonusRate);

          // Double-check that we're not sending invalid data
          if (minAmount <= 0 || maxAmount <= minAmount) {
            console.error('❌ Invalid range data detected:', {
              range,
              minAmount,
              maxAmount,
            });
            throw new Error(
              `Invalid range: minAmount (${minAmount}) must be > 0 and maxAmount (${maxAmount}) must be > minAmount`,
            );
          }

          return {
            minAmount,
            maxAmount,
            bonusRatio: bonusRate / 100, // Convert percentage to decimal
            fixedAmount: range.fixedAmount
              ? parseFloat(range.fixedAmount)
              : undefined,
          };
        }),
      maxBonusAmount: bonusForm.value.bonusLimit
        ? parseFloat(bonusForm.value.bonusLimit)
        : undefined,
      maxBonusCount: bonusForm.value.dailyLimit
        ? parseInt(bonusForm.value.dailyLimit)
        : undefined,
      countLimitType:
        bonusForm.value.dailyLimitType === 'daily' ? 'DAILY' : 'TOTAL',
    };

    // Only store bonus config if we have valid rules
    if (bonusConfig.bonusRules && bonusConfig.bonusRules.length > 0) {
      channelForm.value.bonusConfig = bonusConfig;
      console.log(
        '💾 Bonus config stored in channel form:',
        channelForm.value.bonusConfig,
      );
    } else {
      // If no valid rules, set to null to avoid validation errors
      channelForm.value.bonusConfig = null;
      console.log('⚠️ No valid bonus rules found, setting bonusConfig to null');
    }

    console.log('💾 Bonus config transformed and stored:', bonusConfig);

    // Debug: Log the exact data being sent to backend
    console.log('🔍 Debug - Form data before save:', {
      showBubble: bonusForm.value.showBubble,
      bubbleColor: bonusForm.value.bubbleColor,
      memberLevel: bonusForm.value.memberLevel,
      amountRanges: bonusForm.value.amountRanges,
      bonusLimit: bonusForm.value.bonusLimit,
      dailyLimitType: bonusForm.value.dailyLimitType,
      dailyLimit: bonusForm.value.dailyLimit,
    });

    message.success($t('finance.rechargeConfigAlreadySaveSaveChannel'));
    showBonusConfigModal.value = false;
  } catch (error) {
    console.error('❌ Error saving bonus config:', error);
    message.error($t('finance.saveFailed'));
  } finally {
    bonusModalLoading.value = false;
  }
};

// Reset bonus form when modal is closed
const handleCloseBonusModal = () => {
  showBonusConfigModal.value = false;
  // Reset form to defaults
  bonusForm.value = {
    bonusRate: 0,
    showBubble: 'show',
    bubbleColor: 'blue',
    memberLevel: 'no-limit',
    amountRanges: [
      {
        minAmount: '1.00',
        maxAmount: '29.99',
        fixedAmount: '',
        bonusRate: 0.0,
      },
      { minAmount: '30', maxAmount: '999.99', fixedAmount: '', bonusRate: 0.2 },
      {
        minAmount: '1000',
        maxAmount: '2999.99',
        fixedAmount: '',
        bonusRate: 0.4,
      },
      {
        minAmount: '3000',
        maxAmount: '9999.99',
        fixedAmount: '',
        bonusRate: 0.6,
      },
      {
        minAmount: '10000',
        maxAmount: '29999.99',
        fixedAmount: '',
        bonusRate: 2.6,
      },
      {
        minAmount: '30000',
        maxAmount: '50000.00',
        fixedAmount: '',
        bonusRate: 8.8,
      },
    ],
    bonusLimit: '',
    dailyLimitType: 'daily',
    dailyLimit: '',
  };
};

const handleSaveFeeReduction = async () => {
  try {
    console.log('💸 Saving fee reduction:', feeReductionForm.value);
    message.success($t('finance.feeConfigAlreadySave'));
    showFeeReductionModal.value = false;
  } catch (error) {
    console.error('❌ Error saving fee reduction:', error);
    message.error($t('finance.saveFailed'));
  }
};

const handleSaveRecommendedAmount = async () => {
  try {
    console.log('💎 Saving recommended amounts:', recommendedAmountForm.value);

    // Filter valid amounts with their bonus values
    const validAmountConfigs = recommendedAmountForm.value.amounts
      .filter((item: any) => item.amount && item.amount.trim() !== '')
      .map((item: any) => {
        const amountValue = parseFloat(item.amount.trim());
        return {
          rewardAmount: amountValue, // ✅ FIX: Use 'rewardAmount' to match backend validation schema
          bonusType: item.bonusType === '按比例' ? 'PERCENTAGE' : 'FIXED',
          bonusValue: parseFloat(item.bonusValue) || 0,
          description: `${item.amount} BRL - ${item.bonusValue}% bonus`,
        };
      })
      .filter(
        (config: any) => !isNaN(config.rewardAmount) && config.rewardAmount > 0,
      );

    // Create the structured configuration for database storage
    const recommendedAmountConfig = {
      mode:
        recommendedAmountForm.value.amountType === '仅限固定金额'
          ? 'FIXED'
          : 'FLEXIBLE',
      amounts: validAmountConfigs,
    };

    // Store the structured config in channelForm for database saving
    channelForm.value.recommendedAmounts = recommendedAmountConfig;

    // ✅ FIX: Update the display field with comma-separated amounts for backward compatibility
    // Use rewardAmount (the actual field name) instead of amount
    const displayAmounts = validAmountConfigs
      .map((config: any) => config.rewardAmount)
      .join(',');

    // Update the display field to show amounts with bonus info
    const displayText = validAmountConfigs
      .map(
        (config: any) => `${config.rewardAmount} BRL (${config.bonusValue}%)`,
      )
      .join(', ');

    console.log(
      '🔄 Recommended amounts config saved:',
      recommendedAmountConfig,
    );
    console.log('📱 Display amounts updated:', displayAmounts);
    console.log('📊 Display text with bonus:', displayText);

    message.success($t('finance.amountConfigAlreadySaveIncludingAmountAndRatio'));
    showRecommendedAmountModal.value = false;
  } catch (error) {
    console.error('❌ Error saving recommended amounts:', error);
    message.error($t('finance.saveFailed'));
  }
};

const handleSaveBonusRate = async () => {
  try {
    bonusModalLoading.value = true;

    if (!currentBonusChannel.value) {
      throw new Error('No channel selected for bonus rate configuration');
    }

    console.log(
      '💰 Updating bonus rate for channel:',
      currentBonusChannel.value.id,
    );
    console.log('💰 New bonus rate:', bonusForm.value.bonusRate);

    const response = await thirdPartyChannelApi.updateBonusRate(
      currentBonusChannel.value.id,
      bonusForm.value.bonusRate,
    );

    if (response.data) {
      // Update local data
      if (currentBonusChannel.value) {
        currentBonusChannel.value.bonusRate = bonusForm.value.bonusRate;
      }
      message.success($t('finance.configSuccess'));
      showBonusConfigModal.value = false;
      fetchChannelData();
    } else {
      throw new Error(response.message || '配置失败');
    }
  } catch (error) {
    message.error($t('finance.configFailed'));
    console.error('Save bonus rate error:', error);
  } finally {
    bonusModalLoading.value = false;
  }
};

const handleChannelPageChange = (page: number) => {
  channelPaginationReactive.page = page;
  fetchChannelData();
};

const handleChannelPageSizeChange = (pageSize: number) => {
  channelPaginationReactive.pageSize = pageSize;
  channelPaginationReactive.page = 1;
  fetchChannelData();
};

const handleToggleChannelStatus = async (channel: any, value: boolean) => {
  try {
    // Update the local state immediately for better UX
    const originalStatus = channel.isActive;
    channel.isActive = value;

    // Call the API to toggle the status
    const response = await thirdPartyChannelApi.toggleStatus(channel.id, value);
    console.log('📡 Toggle channel status response:', response);

    if (response && response.success !== false) {
      message.success(value ? '通道已启用' : '通道已停用');
      // Refresh the data to ensure consistency
      await fetchChannelData();
    } else {
      // Revert the change if API call fails
      channel.isActive = originalStatus;
      message.error($t('finance.statusFailed'));
    }
  } catch (error) {
    // Revert the change if API call fails
    channel.isActive = !value;
    message.error($t('finance.statusFailed'));
    console.error('Toggle channel status error:', error);
  }
};

const handleTestChannelConnection = async (channel: any) => {
  try {
    message.loading('测试连接中...', { duration: 0 });
    const response = await thirdPartyChannelApi.testConnection(channel.id);

    if (response && response.success !== false) {
      message.success($t('finance.success2'));
    } else {
      message.error(response?.message || '连接测试失败');
    }
  } catch (error) {
    console.error('Test channel connection error:', error);
    message.error($t('finance.failed8'));
  }
};

const handleDeleteChannel = async (channel: any) => {
  try {
    const confirmed = await window.confirm(
      `确定要删除通道 "${channel.channelName}" 吗？`,
    );
    if (!confirmed) return;

    const response = await thirdPartyChannelApi.delete(channel.id);
    if (response && response.success !== false) {
      message.success($t('finance.deleteSuccessful'));
      await fetchChannelData();
    } else {
      message.error(response?.message || '删除失败');
    }
  } catch (error) {
    console.error('Delete channel error:', error);
    message.error($t('finance.deleteFailed'));
  }
};

// Category management methods
const fetchCategoryData = async () => {
  categoryLoading.value = true;
  try {
    const params = {
      page: categoryPaginationReactive.page,
      pageSize: categoryPaginationReactive.pageSize,
      search: categoryFilters.search || undefined,
      isActive: categoryFilters.isActive || undefined,
      blacklistStatus: categoryFilters.blacklistStatus || undefined,
    };

    const response = await getRechargeCategories(params);
    console.log(' Category data response:', response);
    console.log(' Response structure:', JSON.stringify(response, null, 2));

    // Handle different response structures
    let actualData;
    if (response && response.data && response.data.list) {
      // If response.data contains the list directly
      actualData = response.data;
    } else if (response && response.list) {
      // If response contains the list directly
      actualData = response;
    } else if (
      response &&
      response.success &&
      response.data &&
      response.data.data
    ) {
      // If there's an extra wrapper
      actualData = response.data.data;
    } else {
      console.error('❌ Unexpected response structure:', response);
      actualData = { list: [], pagination: { total: 0 } };
    }

    console.log(' Actual data extracted:', actualData);

    categoryTableData.value = actualData.list || [];
    categoryPaginationReactive.total = actualData.pagination?.total || 0;
    console.log('✅ Loaded categories:', categoryTableData.value.length);
    console.log('✅ Categories data:', categoryTableData.value);
    console.log('✅ Pagination total:', categoryPaginationReactive.total);
  } catch (error) {
    message.error($t('finance.fetchConfigDataFailed'));
    console.error('Fetch category data error:', error);
    categoryTableData.value = [];
    categoryPaginationReactive.total = 0;
  } finally {
    categoryLoading.value = false;
  }
};

const handleCategorySearch = () => {
  categoryPaginationReactive.page = 1;
  fetchCategoryData();
};

const handleCategoryReset = () => {
  categoryFilters.isActive = null;
  categoryFilters.blacklistStatus = null;
  categoryFilters.search = '';
  categoryPaginationReactive.page = 1;
  fetchCategoryData();
};

const handleAddCategory = () => {
  isEditingCategory.value = false;
  currentEditingCategory.value = null;

  // Reset form
  categoryForm.value = {
    name: '',
    icon: '',
    blacklistStatus: 'ENABLED',
    isActive: 'ENABLED',
    badge: '',
  };

  // Icon will be handled by MediaLibrarySelector

  showCategoryModal.value = true;
};

const handleEditCategory = (category: any) => {
  console.log('🔧 Editing category:', category);
  isEditingCategory.value = true;
  currentEditingCategory.value = category;

  // Populate form with existing data
  categoryForm.value = {
    name: category.name || '',
    icon: category.icon || '',
    blacklistStatus: category.blacklistStatus || 'ENABLED',
    isActive: category.isActive || 'ENABLED',
    badge: category.badge || '',
  };

  console.log('📝 Form populated with:', categoryForm.value);
  console.log('🖼️ Icon value:', categoryForm.value.icon);

  showCategoryModal.value = true;
};

const handleDeleteCategory = async (category: any) => {
  try {
    const confirmed = await window.confirm(
      `确定要删除大类 "${category.name}" 吗？`,
    );
    if (!confirmed) return;

    const response = await deleteRechargeCategory(category.id);
    if (response.success) {
      message.success($t('finance.deleteSuccessful'));
      await fetchCategoryData();
    } else {
      message.error(response.message || '删除失败');
    }
  } catch (error) {
    console.error('Delete category error:', error);
    message.error($t('finance.deleteFailed'));
  }
};

// Category icon handling - now using MediaLibrarySelector

// Save category function
const handleSaveCategory = async () => {
  if (!categoryFormRef.value) return;

  try {
    await categoryFormRef.value.validate();
    categoryModalLoading.value = true;

    console.log('💾 Saving category:', categoryForm.value);
    console.log('🔧 Is editing:', isEditingCategory.value);

    if (isEditingCategory.value && currentEditingCategory.value) {
      // Update existing category
      console.log('🚀 Updating category with data:', categoryForm.value);
      const response = await updateRechargeCategory(
        currentEditingCategory.value.id,
        categoryForm.value,
      );
      console.log('📡 Update API Response:', response);

      if (response && response.success) {
        message.success($t('finance.updateSuccessful'));
        showCategoryModal.value = false;
        await fetchCategoryData();
      } else {
        message.error(response?.message || '更新失败');
      }
    } else {
      // Create new category
      console.log('🚀 Creating category with data:', categoryForm.value);
      const response = await createRechargeCategory(categoryForm.value);
      console.log('📡 API Response:', response);
      console.log('📡 Response type:', typeof response);
      console.log('📡 Response success:', response?.success);

      if (response && response.success) {
        message.success($t('finance.createSuccess'));
        showCategoryModal.value = false;
        await fetchCategoryData();
      } else {
        message.error(response?.message || '创建失败');
      }
    }
  } catch (error) {
    message.error(isEditingCategory.value ? '更新失败' : '创建失败');
    console.error('Save category error:', error);
  } finally {
    categoryModalLoading.value = false;
  }
};

const handleToggleCategoryStatus = async (category: any, value: boolean) => {
  try {
    // Update the local state immediately for better UX
    const newStatus = value ? 'ENABLED' : 'DISABLED';
    category.isActive = newStatus;

    // Call the API to update the status
    const response = await toggleRechargeCategoryStatus(category.id);
    if (response.success) {
      message.success(value ? '已启用' : '已停用');
      // Refresh the data to ensure consistency
      await fetchCategoryData();
    } else {
      // Revert the change if API call fails
      category.isActive = newStatus === 'ENABLED' ? 'DISABLED' : 'ENABLED';
      message.error(response.message || '状态更新失败');
    }
  } catch (error) {
    // Revert the change if API call fails
    category.isActive =
      category.isActive === 'ENABLED' ? 'DISABLED' : 'ENABLED';
    message.error($t('finance.statusFailed'));
    console.error('Toggle category status error:', error);
  }
};

const handleCategoryPageChange = (page: number) => {
  categoryPaginationReactive.page = page;
  fetchCategoryData();
};

const handleCategoryPageSizeChange = (pageSize: number) => {
  categoryPaginationReactive.pageSize = pageSize;
  categoryPaginationReactive.page = 1;
  fetchCategoryData();
};

// Helper functions for channel modal - removed complex functionality for cleaner UI

// Disabled channels functions
const fetchDisabledChannelData = async () => {
  disabledChannelTableLoading.value = true;
  try {
    console.log('🔍 Fetching disabled channels...');

    const params = {
      page: disabledChannelPaginationConfig.value.page,
      pageSize: disabledChannelPaginationConfig.value.pageSize,
      isActive: false, // Only fetch inactive channels
      platformName: disabledChannelFilters.platform || undefined,
      currency: disabledChannelFilters.currency || undefined,
      memberLevel: disabledChannelFilters.memberLevel || undefined,
      search: disabledChannelFilters.search || undefined,
    };

    // Use existing channel API but filter for inactive channels
    const response = await thirdPartyChannelApi.getList(params);
    console.log('📊 Disabled channels response:', response);

    if (response && response.data && response.data.records) {
      disabledChannelTableData.value = response.data.records;
      disabledChannelPaginationConfig.value.itemCount =
        response.data.pagination?.total || 0;

      // Auto-expand first group if it exists
      if (response.data.records.length > 0) {
        const firstCategory =
          response.data.records[0].channelCategory || '未分类';
        expandedGroups.value.add(firstCategory);
      }
    } else {
      disabledChannelTableData.value = [];
      disabledChannelPaginationConfig.value.itemCount = 0;
    }
  } catch (error) {
    console.error('❌ Error fetching disabled channels:', error);
    message.error($t('finance.fetchDisabledChannelFailed'));
    disabledChannelTableData.value = [];
    disabledChannelPaginationConfig.value.itemCount = 0;
  } finally {
    disabledChannelTableLoading.value = false;
  }
};

const handleDisabledChannelSearch = () => {
  disabledChannelPaginationConfig.value.page = 1;
  fetchDisabledChannelData();
};

const handleDisabledChannelReset = () => {
  disabledChannelFilters.search = '';
  disabledChannelFilters.platform = null;
  disabledChannelFilters.currency = null;
  disabledChannelFilters.memberLevel = null;
  disabledChannelPaginationConfig.value.page = 1;
  fetchDisabledChannelData();
};

const handleDisabledChannelPageChange = (page: number) => {
  disabledChannelPaginationConfig.value.page = page;
  fetchDisabledChannelData();
};

const handleDisabledChannelPageSizeChange = (pageSize: number) => {
  disabledChannelPaginationConfig.value.pageSize = pageSize;
  disabledChannelPaginationConfig.value.page = 1;
  fetchDisabledChannelData();
};

const handleEnableChannel = async (channel: any) => {
  try {
    console.log('🔄 Enabling channel:', channel.channelCode);

    // Call API to enable channel
    await thirdPartyChannelApi.toggleStatus(channel.id, true);

    message.success(`通道 "${channel.channelName}" 已启用`);

    // Refresh both tables
    fetchDisabledChannelData();
    fetchChannelData();
  } catch (error) {
    console.error('❌ Error enabling channel:', error);
    message.error($t('finance.enableChannelFailed'));
  }
};

const handleDeleteDisabledChannel = async (channel: any) => {
  try {
    console.log('🗑️ Deleting disabled channel:', channel.channelCode);

    // Call API to delete channel
    await thirdPartyChannelApi.delete(channel.id);

    message.success(`通道 "${channel.channelName}" 已删除`);

    // Refresh table
    fetchDisabledChannelData();
  } catch (error) {
    console.error('❌ Error deleting disabled channel:', error);
    message.error($t('finance.deleteChannelFailed'));
  }
};

const handleBatchEnableChannels = () => {
  if (selectedDisabledChannels.value.length === 0) {
    message.warning($t('finance.pleaseSelectEnableChannel'));
    return;
  }
  batchOperationType.value = 'enable';
  showBatchOperationModal.value = true;
};

const handleBatchDeleteChannels = () => {
  if (selectedDisabledChannels.value.length === 0) {
    message.warning($t('finance.pleaseSelectDeleteChannel'));
    return;
  }
  batchOperationType.value = 'delete';
  showBatchOperationModal.value = true;
};

const getChannelDisplayName = (channelId: string) => {
  const channel = disabledChannelTableData.value.find(
    (c) => c.id === channelId,
  );
  return channel
    ? `${channel.platformName} - ${channel.channelName}`
    : channelId;
};

const confirmBatchOperation = async () => {
  if (selectedDisabledChannels.value.length === 0) return;

  batchOperationLoading.value = true;
  try {
    const promises = selectedDisabledChannels.value.map((channelId) => {
      if (batchOperationType.value === 'enable') {
        return thirdPartyChannelApi.toggleStatus(channelId, true);
      } else {
        return thirdPartyChannelApi.delete(channelId);
      }
    });

    await Promise.all(promises);

    const action = batchOperationType.value === 'enable' ? '启用' : '删除';
    message.success(
      `批量${action}成功，共处理 ${selectedDisabledChannels.value.length} 个通道`,
    );

    // Reset selection and refresh data
    selectedDisabledChannels.value = [];
    showBatchOperationModal.value = false;
    fetchDisabledChannelData();

    if (batchOperationType.value === 'enable') {
      fetchChannelData(); // Refresh active channels table too
    }
  } catch (error) {
    console.error('❌ Batch operation error:', error);
    const action = batchOperationType.value === 'enable' ? '启用' : '删除';
    message.error(`批量${action}失败`);
  } finally {
    batchOperationLoading.value = false;
  }
};

// Statistics functions
const formatStatsDateRange = () => {
  if (!statsFilters.startDate || !statsFilters.endDate) {
    return '请选择日期范围';
  }
  const start = formatDateInTimezone(statsFilters.startDate);
  const end = formatDateInTimezone(statsFilters.endDate);
  return `${start} - ${end}`;
};

const fetchStatsData = async () => {
  statsTableLoading.value = true;
  try {
    console.log('📊 Fetching statistics data...');

    if (!statsFilters.startDate || !statsFilters.endDate) {
      message.warning($t('finance.pleaseSelectDate'));
      return;
    }

    // Get real statistics from the backend
    const startDate = new Date(statsFilters.startDate).toISOString();
    const endDate = new Date(statsFilters.endDate).toISOString();

    const params = {
      startDate,
      endDate,
      platform: statsFilters.platform || undefined,
      category: statsFilters.category || undefined,
    };

    console.log('📊 Fetching real statistics with params:', params);

    // Call the finance online recharge orders API to get real statistics
    const response = await getRechargeOrderList({
      startDate,
      endDate,
      limit: 1000, // Get all records for statistics
      page: 1,
    });

    console.log('📊 Statistics response:', response);
    console.log('📊 Response has orders:', !!response?.orders);
    console.log('📊 Response.data has orders:', !!response?.data?.orders);
    console.log(
      '📊 Orders count:',
      response?.orders?.length || response?.data?.orders?.length || 0,
    );

    const orders = response?.orders || response?.data?.orders;
    if (response && orders && orders.length > 0) {
      // Group orders by channel and calculate real statistics
      const channelStats = new Map();
      const successStatuses = [
        'SUCCESS',
        'success',
        'COMPLETED',
        'completed',
        'CONFIRMED',
        'confirmed',
      ];

      orders.forEach((order: any) => {
        const channelKey = `${order.channelCode || order.paymentMethod || 'UNKNOWN'}_${order.channelName || 'Unknown'}`;
        console.log('📊 Processing order:', {
          channelCode: order.channelCode,
          channelName: order.channelName,
          paymentMethod: order.paymentMethod,
          status: order.status,
          amount: order.amount,
          channelKey,
        });

        if (!channelStats.has(channelKey)) {
          channelStats.set(channelKey, {
            id: order.id,
            platformName:
              order.platformName ||
              order.paymentGateway ||
              order.paymentMethod ||
              'Unknown',
            channelCategory:
              order.channelCategory ||
              order.paymentCategory ||
              order.productCode ||
              'Unknown',
            channelName:
              order.channelName || order.paymentGateway || 'Unknown Channel',
            channelCode:
              order.channelCode ||
              order.paymentMethod ||
              order.productCode ||
              'UNKNOWN',
            totalOrders: 0,
            successOrders: 0,
            successAmount: 0,
            uniqueUsers: new Set(),
            recent30MinSuccess: 0,
            recent30MinAmount: 0,
          });
        }

        const stats = channelStats.get(channelKey);
        stats.totalOrders++;
        stats.uniqueUsers.add(order.memberAccount);

        // Check if order is successful (handle various success statuses)
        if (successStatuses.includes(order.status)) {
          stats.successOrders++;
          stats.successAmount += Number(
            order.amount || order.rechargeAmount || 0,
          );
        }

        // Check if order is in recent 30 minutes
        const orderTime = new Date(order.createdAt).getTime();
        const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
        if (orderTime >= thirtyMinutesAgo) {
          if (successStatuses.includes(order.status)) {
            stats.recent30MinSuccess++;
            stats.recent30MinAmount += Number(
              order.amount || order.rechargeAmount || 0,
            );
          }
        }
      });

      // Convert to array and calculate rates
      const statsArray = Array.from(channelStats.values()).map((stats) => ({
        ...stats,
        uniqueUsers: stats.uniqueUsers.size,
        successRate:
          stats.totalOrders > 0
            ? (stats.successOrders / stats.totalOrders) * 100
            : 0,
        recent30MinRate:
          stats.recent30MinSuccess > 0
            ? (stats.recent30MinSuccess / Math.max(stats.totalOrders, 1)) * 100
            : 0,
        recent30MinTrend: 0, // TODO: Implement actual trend calculation
        recent30MinAmountTrend: 0,
        recent30MinAmountDown: 0,
      }));

      // Apply filters
      let filteredStats = statsArray;
      if (statsFilters.platform) {
        filteredStats = statsArray.filter((stat) =>
          stat.platformName
            .toLowerCase()
            .includes(statsFilters.platform!.toLowerCase()),
        );
      }
      if (statsFilters.category) {
        filteredStats = statsArray.filter((stat) =>
          stat.channelCategory
            .toLowerCase()
            .includes(statsFilters.category!.toLowerCase()),
        );
      }

      statsTableData.value = filteredStats;
      statsPaginationConfig.value.itemCount = filteredStats.length;

      // Calculate summary
      const totalTrans = filteredStats.reduce(
        (sum, stat) => sum + stat.totalOrders,
        0,
      );
      const successTrans = filteredStats.reduce(
        (sum, stat) => sum + stat.successOrders,
        0,
      );
      const totalAmount = filteredStats.reduce(
        (sum, stat) => sum + stat.successAmount,
        0,
      );

      statsSummary.value = {
        totalTransactions: totalTrans,
        successTransactions: successTrans,
        totalAmount: totalAmount,
        overallSuccessRate:
          totalTrans > 0 ? (successTrans / totalTrans) * 100 : 0,
      };

      console.log('✅ Statistics calculated:', {
        totalChannels: filteredStats.length,
        totalTransactions: totalTrans,
        successRate: statsSummary.value.overallSuccessRate.toFixed(2) + '%',
      });
    } else {
      console.log('📊 No orders found in response:', {
        response,
        orders: orders?.length || 0,
      });
      statsTableData.value = [];
      statsPaginationConfig.value.itemCount = 0;
      statsSummary.value = {
        totalTransactions: 0,
        successTransactions: 0,
        totalAmount: 0,
        overallSuccessRate: 0,
      };
    }
  } catch (error) {
    console.error('❌ Error fetching statistics:', error);
    message.error($t('finance.fetchStatisticsDataFailed'));
    statsTableData.value = [];
    statsPaginationConfig.value.itemCount = 0;
  } finally {
    statsTableLoading.value = false;
  }
};

const handleStatsSearch = () => {
  console.log('🔍 Stats search triggered with filters:', statsFilters);
  if (!statsFilters.startDate || !statsFilters.endDate) {
    message.warning($t('finance.pleaseSelectAndEndDate'));
    return;
  }
  statsPaginationConfig.value.page = 1;
  fetchStatsData();
};

const handleStatsReset = () => {
  statsFilters.startDate = null;
  statsFilters.endDate = null;
  statsFilters.platform = null;
  statsFilters.category = null;
  statsPaginationConfig.value.page = 1;
  statsTableData.value = [];
  statsPaginationConfig.value.itemCount = 0;
  statsSummary.value = {
    totalTransactions: 0,
    successTransactions: 0,
    totalAmount: 0,
    overallSuccessRate: 0,
  };
};

const handleRefreshStats = () => {
  if (!statsFilters.startDate || !statsFilters.endDate) {
    message.warning($t('finance.pleaseSelectDate1'));
    return;
  }
  fetchStatsData();
};

const handleExportStats = () => {
  if (statsTableData.value.length === 0) {
    message.warning($t('finance.noDataExport'));
    return;
  }

  // Generate CSV content
  const headers = [
    '三方支付',
    '通道所属大类',
    '通道名称',
    '通道编码',
    '充值人数',
    '合计笔数',
    '成功笔数',
    '成功金额',
    '近30分钟成功笔数',
    '近30分钟成功金额',
    '成功率(%)',
    '近30分钟成功率(%)',
    '近30分钟金额上升',
    '近30分钟金额下降',
  ];

  const csvContent = [
    headers.join(','),
    ...statsTableData.value.map((row) =>
      [
        row.platformName,
        row.channelCategory,
        row.channelName,
        row.channelCode,
        row.uniqueUsers,
        row.totalOrders,
        row.successOrders,
        row.successAmount.toFixed(2),
        row.recent30MinSuccess,
        row.recent30MinAmount.toFixed(2),
        row.successRate.toFixed(2),
        row.recent30MinRate.toFixed(2),
        row.recent30MinAmountTrend.toFixed(2),
        row.recent30MinAmountDown.toFixed(2),
      ].join(','),
    ),
  ].join('\n');

  // Download CSV
  const blob = new Blob(['\ufeff' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `三方支付统计_${formatStatsDateRange().replace(/[\/\s]/g, '_')}.csv`,
  );
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  message.success($t('finance.statisticsAlreadyExport'));
};

const handleStatsPageChange = (page: number) => {
  statsPaginationConfig.value.page = page;
  fetchStatsData();
};

const handleStatsPageSizeChange = (pageSize: number) => {
  statsPaginationConfig.value.pageSize = pageSize;
  statsPaginationConfig.value.page = 1;
  fetchStatsData();
};

// Helper functions for disabled channels grouping
const getCategoryIcon = (category: string) => {
  // Try to get icon from recharge categories
  const categoryData = categoryTableData.value.find(
    (cat) => cat.name === category,
  );
  return categoryData?.icon || null;
};

const toggleGroupExpanded = (category: string) => {
  if (expandedGroups.value.has(category)) {
    expandedGroups.value.delete(category);
  } else {
    expandedGroups.value.add(category);
  }
};

const getSelectedChannelsInGroup = (category: string) => {
  const group = groupedDisabledChannels.value.find(
    (g) => g.category === category,
  );
  if (!group) return [];

  return group.channels.filter((channel) =>
    selectedDisabledChannels.value.includes(channel.id),
  );
};

const handleBatchEnableChannelsInGroup = (category: string) => {
  const selectedInGroup = getSelectedChannelsInGroup(category);
  if (selectedInGroup.length === 0) {
    message.warning(`请选择 ${category} 分类下要启用的通道`);
    return;
  }

  // Filter selectedDisabledChannels to only include channels from this group
  selectedDisabledChannels.value = selectedInGroup.map((channel) => channel.id);
  batchOperationType.value = 'enable';
  showBatchOperationModal.value = true;
};

// Watchers
watch(activeTab, () => {
  if (activeTab.value === 'all-orders') {
    fetchData();
  } else if (activeTab.value === 'third-party-channels') {
    fetchChannelData();
  } else if (activeTab.value === 'category-config') {
    fetchCategoryData();
  } else if (activeTab.value === 'disabled-channels') {
    fetchDisabledChannelData();
  } else if (activeTab.value === 'third-party-statistics') {
    // Auto-fetch stats with default date range
    console.log(
      '📊 Third party statistics tab activated with filters:',
      statsFilters,
    );
    if (statsFilters.startDate && statsFilters.endDate) {
      console.log('📊 Auto-triggering stats fetch...');
      fetchStatsData();
    } else {
      console.log('📊 No date range set, not auto-fetching');
    }
  }
});

// Real-time updates listener
let eventSource: EventSource | null = null;

// Column configuration
const showColumnConfig = ref(false);
const COLUMN_CONFIG_BASE_KEY = 'recharge-order-columns-config';
const DEFAULT_VISIBLE_COLUMN_KEYS = [
  'orderId',
  'memberAccount',
  'firstDepositStatus',
  'vipLevel',
  'memberTier',
  'exchangeRate',
  'currency',
  'orderAmount',
  'bonusAmount',
  'fees',
  'totalCredited',
  'thirdPartyPayment',
  'channelName',
  'channelFeeRate',
  'status',
  'createdAt',
  'updatedAt',
];
const columnConfigList = ref<{ key: string; title: string; visible: boolean }[]>(
  [],
);

const getCurrentColumnConfigKey = () => {
  const userInfo = userStore.userInfo as any;
  const currentUserKey =
    userInfo?.username || userInfo?.userId || userInfo?.id?.toString() || 'admin';
  return `${COLUMN_CONFIG_BASE_KEY}:${currentUserKey}`;
};

const buildColumnConfigFromTableColumns = (
  savedConfig?: { key?: string; visible?: boolean }[],
) => {
  const tableColumnConfig = columns
    .filter((col) => col.type !== 'selection' && col.key && col.key !== 'actions')
    .map((col) => {
      const key = String(col.key);
      return {
        key,
        title: typeof col.title === 'string' ? col.title : key,
        visible: DEFAULT_VISIBLE_COLUMN_KEYS.includes(key),
      };
    });

  if (!savedConfig?.length) {
    columnConfigList.value = tableColumnConfig;
    return;
  }

  const defaultMap = new Map(tableColumnConfig.map((item) => [item.key, item]));
  const validSaved = savedConfig.filter((item) => item?.key && defaultMap.has(item.key));
  const savedKeys = validSaved.map((item) => String(item.key));
  const fallbackKeys = tableColumnConfig
    .map((item) => item.key)
    .filter((key) => !savedKeys.includes(key));
  const mergedOrder = [...savedKeys, ...fallbackKeys];
  const savedVisibleMap = new Map(
    validSaved.map((item) => [String(item.key), Boolean(item.visible)]),
  );

  columnConfigList.value = mergedOrder
    .map((key) => {
      const defaultItem = defaultMap.get(key);
      if (!defaultItem) return null;
      return {
        ...defaultItem,
        visible: savedVisibleMap.has(key)
          ? Boolean(savedVisibleMap.get(key))
          : defaultItem.visible,
      };
    })
    .filter(Boolean) as { key: string; title: string; visible: boolean }[];
};

// Load column configuration from database
const loadColumnConfig = async () => {
  buildColumnConfigFromTableColumns();
  try {
    const configKey = getCurrentColumnConfigKey();
    const response = await requestClient.get(`/backoffice/preferences/${configKey}`);
    // requestClient returns { success, data, message } for backoffice APIs — preference fields live on `data`
    const preferenceValue = (response as any)?.data?.preferenceValue ?? (response as any)?.preferenceValue;
    if (Array.isArray(preferenceValue)) {
      buildColumnConfigFromTableColumns(preferenceValue);
      console.log('✅ Column configuration loaded from database');
    }
  } catch (error) {
    // If no preference found or error, use defaults
    console.log(' Using default column configuration');
  }
};

// Save column configuration to database
const saveColumnConfig = async () => {
  try {
    const configKey = getCurrentColumnConfigKey();
    await requestClient.put(`/backoffice/preferences/${configKey}`, {
      preferenceValue: columnConfigList.value.map(({ key, visible }) => ({
        key,
        visible,
      })),
    });
    message.success($t('finance.columnConfigAlreadySave'));
    showColumnConfig.value = false;
    console.log('✅ Column configuration saved to database');
  } catch (error) {
    console.error('Failed to save column configuration:', error);
    message.error($t('finance.saveColumnConfigFailed'));
  }
};

// Reset column configuration to default
const resetColumnConfig = async () => {
  try {
    columnConfigList.value.forEach((col) => {
      col.visible = DEFAULT_VISIBLE_COLUMN_KEYS.includes(col.key);
    });

    // Delete from database
    const configKey = getCurrentColumnConfigKey();
    await requestClient.delete(`/backoffice/preferences/${configKey}`);
    message.success($t('finance.columnConfigAlreadyReset'));
    console.log('✅ Column configuration reset to smart defaults');
  } catch (error) {
    // Even if delete fails, reset locally to smart defaults
    columnConfigList.value.forEach((col) => {
      col.visible = DEFAULT_VISIBLE_COLUMN_KEYS.includes(col.key);
    });

    message.success($t('finance.columnConfigAlreadyReset'));
    console.log(' Column configuration reset locally to smart defaults');
  }
};

// Filter columns based on visibility
const visibleColumns = computed(() => {
  const baseColumns = columns.filter((col) => {
    if (col.type === 'selection' || col.key === 'actions') {
      return true; // Always show selection and actions columns
    }
    const config = columnConfigList.value.find((c) => c.key === col.key);
    return config ? config.visible : true;
  });
  return baseColumns;
});

const RECHARGE_COL_WIDTH_FALLBACK = 100;

function rechargeColumnWidthForScroll(col: Record<string, unknown>): number {
  const raw = col.width ?? col.minWidth;
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) {
    return raw;
  }
  if (typeof raw === 'string') {
    const n = Number.parseInt(raw.replace(/\D/g, '') || '0', 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return RECHARGE_COL_WIDTH_FALLBACK;
}

/** Min table width follows visible columns so hiding columns does not stretch gaps across a fixed 3000px */
const rechargeOrdersScrollX = computed(() => {
  const cols = visibleColumns.value as unknown as Record<string, unknown>[];
  let sum = 0;
  for (const col of cols) {
    sum += rechargeColumnWidthForScroll(col);
  }
  return Math.max(sum + 32, 480);
});

const setupRealTimeUpdates = () => {
  // 🚫 DISABLED: Admin panel doesn't need real-time notifications for force operations
  console.log(
    '📡 Real-time updates disabled for admin panel - admins perform actions manually',
  );
  return;

  /* DISABLED SSE CODE - Can be re-enabled if needed
  // Close existing connection
  if (eventSource) {
    eventSource.close();
  }

  try {
    // Connect to admin deposit updates channel
    const token = accessStore.accessToken || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('accessToken') || 
                  localStorage.getItem('authToken');
    
    if (!token) {
      console.warn('📡 No authentication token found, skipping real-time updates setup');
      return;
    }
    
    console.log('📡 Setting up real-time updates with token:', token ? 'present' : 'missing');
    console.log('📡 SSE URL:', `/api/admin/deposit-updates/stream?token=${token ? '[HIDDEN]' : 'null'}`);
    eventSource = new EventSource(`/api/admin/deposit-updates/stream?token=${encodeURIComponent(token)}`);
    
    eventSource.onopen = (event) => {
      console.log('✅ SSE connection opened successfully');
    };
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Skip heartbeat and connection messages
        if (data.type === 'heartbeat' || data.type === 'connection_established') {
          return;
        }
        
        console.log('📡 Real-time notification received:', data);
        
        // Handle different notification types with sound
        switch (data.type) {
          case 'deposit_created':
            AdminNotificationService.handleDepositCreated(data);
            fetchData(); // Refresh table to show new record
            break;
            
          case 'withdrawal_created':
            AdminNotificationService.handleDepositCreated(data); // Reuse same handler for now
            fetchData(); // Refresh table to show new record
            break;
            
          case 'deposit_force_processed':
            AdminNotificationService.handleForceDepositProcessed(data);
            fetchData(); // Refresh table to show updated status
            break;
            
          case 'deposit_force_cancelled':
            AdminNotificationService.handleForceCancelDeposit(data);
            fetchData(); // Refresh table to show updated status
            break;
            
          default:
            // Handle other notification types
            AdminNotificationService.showNotification(data);
            break;
        }
      } catch (error) {
        console.error('Error parsing real-time notification:', error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.warn('Real-time connection error:', error);
      // Reconnect after 5 seconds (always, regardless of tab)
      setTimeout(() => {
        setupRealTimeUpdates();
      }, 5000);
    };
    
    console.log('📡 Real-time updates connected');
  } catch (error) {
    console.error('Failed to setup real-time updates:', error);
  }
  */
};

const cleanupRealTimeUpdates = () => {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
    console.log('📡 Real-time updates disconnected');
  }
};

// Lifecycle
onMounted(async () => {
  // Initialize notification service
  await AdminNotificationService.initialize();

  // Load column configuration
  loadColumnConfig();

  // Set default date range to "日" (day)
  handleQuickDateSelect('day');

  fetchData();
  loadRechargeCategories();
  loadMemberTiers();

  // Setup real-time updates (always, regardless of tab)
  setupRealTimeUpdates();
});

onUnmounted(() => {
  cleanupRealTimeUpdates();
  // 🚀 REMOVED: stopAllTimers() - SmartAutoRefresh handles cleanup automatically
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
});
</script>

<style scoped>
.recharge-order-list {
  padding: 16px;
}

.page-header {
  margin-bottom: 16px;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
}

/* 🚀 REMOVED: .auto-refresh-controls (SmartAutoRefresh has built-in styling) 
.auto-refresh-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}
*/

/* Category grouping styles */
.category-group {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fafafa;
  overflow: hidden;
}

.category-header {
  background: #f9fafb;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.category-content {
  padding: 0;
  background: white;
}

.category-icon img {
  border: 2px solid #e5e7eb;
  transition: all 0.2s ease;
}

.category-icon img:hover {
  border-color: #3b82f6;
  transform: scale(1.05);
}

.filter-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bulk-operations {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.selected-count {
  font-weight: 500;
  color: #666;
}

.recharge-order-list .n-data-table {
  font-size: 12px;
}

.recharge-order-list .n-card {
  border-radius: 8px;
}

.recharge-order-list .n-tabs {
  margin-bottom: 16px;
}

.totals-summary {
  margin-top: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e8e9ea;
}

.total-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.total-label {
  font-weight: 500;
  color: #666;
  font-size: 14px;
}

.total-value {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.total-value.bonus {
  color: #f0a020;
}

.total-value.fee {
  color: #d03050;
}

.total-value.credited {
  color: #18a058;
}

.ml-auto {
  margin-left: auto;
}

.grid {
  display: grid;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.gap-4 {
  gap: 1rem;
}

.col-span-2 {
  grid-column: span 2;
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .bulk-operations {
    flex-direction: column;
    gap: 12px;
  }

  .totals-summary .n-space {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* Column Configuration Modal */
.column-config-content {
  padding: 8px 0;
}

.column-list {
  max-height: 400px;
  overflow-y: auto;
}

.column-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.column-item:last-child {
  border-bottom: none;
}

.column-checkbox {
  width: 100%;
}
</style>
