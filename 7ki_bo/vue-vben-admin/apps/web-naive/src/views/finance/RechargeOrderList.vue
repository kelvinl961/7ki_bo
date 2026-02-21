<template>
  <div class="recharge-order-list">
    <!-- Header Section -->
    <div class="page-header">
      <n-breadcrumb>
        <n-breadcrumb-item>财务管理</n-breadcrumb-item>
        <n-breadcrumb-item>在线充值</n-breadcrumb-item>
      </n-breadcrumb>
    </div>

    <!-- Tab Navigation -->
    <n-tabs v-model:value="activeTab" type="line" class="mb-4">
      <n-tab-pane name="all-orders" tab="全部订单">
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
                  >开始日期 - 结束日期</label
                >
                <TimezoneDatePicker
                  v-model="filters.dateRange"
                  @update:modelValue="handleDateRangeChange"
                />
              </div>

              <n-input
                v-model:value="filters.search"
                placeholder="会员账号、订单号、会员ID"
                style="width: 300px"
                clearable
                @keyup.enter="handleSearch"
              />
            </div>

            <!-- Second Row: Select Filters -->
            <div class="filter-row">
              <n-select
                v-model:value="filters.rechargeAmount"
                placeholder="充值面额"
                style="width: 150px"
                :options="rechargeAmountOptions"
                clearable
              />
              <n-select
                v-model:value="filters.currency"
                placeholder="币种"
                style="width: 120px"
                :options="currencyOptions"
                clearable
              />
              <n-select
                v-model:value="filters.vipLevel"
                placeholder="VIP等级"
                style="width: 120px"
                :options="vipLevelOptions"
                clearable
              />
              <n-select
                v-model:value="filters.thirdParty"
                placeholder="第三方支付"
                style="width: 150px"
                :options="thirdPartyOptions"
                clearable
              />
              <n-select
                v-model:value="filters.channel"
                placeholder="通道名称"
                style="width: 120px"
                :options="channelOptions"
                clearable
              />
              <n-select
                v-model:value="filters.status"
                placeholder="充值状态"
                style="width: 120px"
                :options="statusOptions"
                clearable
              />
            </div>

            <!-- Third Row: Search Buttons -->
            <div class="filter-row">
              <div class="filter-buttons">
                <n-button type="primary" @click="handleSearch">搜索</n-button>
                <n-dropdown :options="advancedSearchOptions" trigger="click">
                  <n-button>高级搜索</n-button>
                </n-dropdown>
                <n-button @click="handleReset">重置</n-button>
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
          :scroll-x="3000"
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
                      >创建在线订单</n-button
                    >
                    <n-button
                      type="warning"
                      @click="handleCreateSupplementOrder"
                      >创建补单</n-button
                    >
                    <n-dropdown :options="exportOptions" trigger="click">
                      <n-button>导出数据</n-button>
                    </n-dropdown>
                    <n-button @click="showColumnConfig = true">
                      <template #icon>
                        <n-icon><Settings /></n-icon>
                      </template>
                      列配置
                    </n-button>
                  </div>

                  <!-- 选择信息 -->
                  <div class="text-sm text-gray-600">
                    已选择 {{ selectedCount }} 条数据，共
                    {{ paginationReactive.total }} 条
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
                      批量处理 ({{ selectedCount }})
                    </n-button>
                    <n-button
                      type="error"
                      size="small"
                      @click="handleBulkCancel(selectedRows)"
                    >
                      批量取消 ({{ selectedCount }})
                    </n-button>
                    <n-button
                      size="small"
                      @click="handleBulkExport(selectedRows)"
                    >
                      导出选中 ({{ selectedCount }})
                    </n-button>
                  </div>

                  <!-- 选择控制 -->
                  <div class="flex gap-2">
                    <n-button size="small" @click="clearSelection"
                      >清空选择</n-button
                    >
                    <n-button size="small" @click="selectAll">全选</n-button>
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
                <span class="total-label">充值面额合计:</span>
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

      <n-tab-pane name="category-config" tab="大类配置">
        <!-- Filter Section -->
        <n-card class="mb-4">
          <div class="filter-section">
            <!-- First Row: Filters -->
            <div class="filter-row">
              <n-select
                v-model:value="categoryFilters.isActive"
                placeholder="开启状态"
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
                placeholder="黑名单状态"
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
                placeholder="大类名称或角标"
                style="width: 200px"
                clearable
                @keyup.enter="handleCategorySearch"
              />
              <n-button type="primary" @click="handleCategorySearch"
                >搜索</n-button
              >
              <n-button @click="handleCategoryReset">重置</n-button>
              <div class="ml-auto">
                <n-button type="primary" @click="handleAddCategory"
                  >新增充值大类</n-button
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
                      >新增充值大类</n-button
                    >
                  </div>

                  <!-- 选择信息 -->
                  <div class="text-sm text-gray-600">
                    共 {{ categoryPaginationReactive.total }} 条记录
                  </div>
                </div>

                <div class="flex items-center gap-4">
                  <!-- 选择控制 -->
                  <div class="flex gap-2">
                    <n-button size="small" @click="handleCategoryReset"
                      >重置筛选</n-button
                    >
                    <n-button size="small" @click="fetchCategoryData"
                      >刷新数据</n-button
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
                <n-form-item label="大类名称" path="name" required>
                  <n-input
                    v-model:value="categoryForm.name"
                    placeholder="请输入大类名称"
                    :maxlength="50"
                    show-count
                    clearable
                  />
                </n-form-item>

                <n-form-item label="大类图标" path="icon">
                  <div class="flex items-center gap-4">
                    <MediaLibrarySelector
                      v-model:value="categoryForm.icon"
                      category="icons"
                      :accept-types="['image']"
                      placeholder="选择或上传大类图标"
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
                <n-form-item label="充值黑名单" path="blacklistStatus" required>
                  <n-select
                    v-model:value="categoryForm.blacklistStatus"
                    placeholder="请选择"
                    :options="[
                      { label: '停用', value: 'DISABLED' },
                      { label: '启用', value: 'ENABLED' },
                    ]"
                  />
                </n-form-item>

                <n-form-item label="开启状态" path="isActive" required>
                  <n-select
                    v-model:value="categoryForm.isActive"
                    placeholder="请选择"
                    :options="[
                      { label: '停用', value: 'DISABLED' },
                      { label: '启用', value: 'ENABLED' },
                    ]"
                  />
                </n-form-item>
              </div>

              <!-- Third Row: Category Description -->
              <n-form-item label="大类角标" path="badge">
                <n-input
                  v-model:value="categoryForm.badge"
                  placeholder="请输入大类角标"
                  :maxlength="12"
                  show-count
                  clearable
                />
              </n-form-item>
            </n-form>

            <template #footer>
              <div style="display: flex; justify-content: flex-end; gap: 12px">
                <n-button @click="showCategoryModal = false">取消</n-button>
                <n-button
                  type="primary"
                  :loading="categoryModalLoading"
                  @click="handleSaveCategory"
                >
                  确认
                </n-button>
              </div>
            </template>
          </n-card>
        </n-modal>
      </n-tab-pane>

      <n-tab-pane name="disabled-channels" tab="已停用通道">
        <!-- Filter Section for Disabled Channels -->
        <n-card class="mb-4">
          <div class="filter-section">
            <!-- First Row: Search and Basic Filters -->
            <div class="filter-row">
              <n-input
                v-model:value="disabledChannelFilters.search"
                placeholder="搜索支付平台、商户号、通道名称"
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
                placeholder="支付平台"
                style="width: 150px"
                :options="platformOptions"
                clearable
              />

              <n-select
                v-model:value="disabledChannelFilters.currency"
                placeholder="币种"
                style="width: 120px"
                :options="currencyOptions"
                clearable
              />

              <n-select
                v-model:value="disabledChannelFilters.memberLevel"
                placeholder="会员层级"
                style="width: 150px"
                :options="memberLevelOptions"
                clearable
              />

              <n-button type="primary" @click="handleDisabledChannelSearch"
                >搜索</n-button
              >
              <n-button @click="handleDisabledChannelReset">重置</n-button>
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
                >已停用通道列表</span
              >
              <n-tooltip trigger="hover">
                <template #trigger>
                  <n-icon size="16" class="cursor-help text-gray-400">
                    <Information />
                  </n-icon>
                </template>
                这里显示所有已停用的支付通道，您可以重新启用或永久删除它们
              </n-tooltip>
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
                    >
                      收起
                    </n-button>
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
            <n-empty description="暂无已停用的通道">
              <template #extra>
                <n-button
                  type="primary"
                  @click="activeTab = 'third-party-channels'"
                >
                  查看活跃通道
                </n-button>
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
                  >取消</n-button
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

      <n-tab-pane name="third-party-channels" tab="三方支付通道">
        <!-- Filter Section -->
        <n-card class="mb-4">
          <div class="filter-section">
            <!-- First Row: Dropdowns -->
            <div class="filter-row">
              <n-select
                v-model:value="channelFilters.platform"
                placeholder="第三方支付平台"
                style="width: 150px"
                :options="platformOptions"
                clearable
              />
              <n-select
                v-model:value="channelFilters.gateway"
                placeholder="支付通道"
                style="width: 120px"
                :options="gatewayOptions"
                clearable
              />
              <n-select
                v-model:value="channelFilters.channelName"
                placeholder="通道名称"
                style="width: 120px"
                :options="channelNameOptions"
                clearable
              />
              <n-select
                v-model:value="channelFilters.currency"
                placeholder="通道币种"
                style="width: 120px"
                :options="currencyOptions"
                clearable
              />
              <n-select
                v-model:value="channelFilters.memberLevel"
                placeholder="会员层级"
                style="width: 150px"
                :options="memberLevelOptions"
                clearable
              />
            </div>

            <!-- Second Row: Search and Actions -->
            <div class="filter-row">
              <n-input
                v-model:value="channelFilters.search"
                placeholder="输入三方商户号、域名、通道备注"
                style="width: 300px"
                clearable
                @keyup.enter="handleChannelSearch"
              />
              <n-button type="primary" @click="handleChannelSearch"
                >搜索</n-button
              >
              <n-button @click="handleChannelReset">重置</n-button>
              <div class="ml-auto">
                <n-button type="primary" @click="handleAddChannel"
                  >新增三方</n-button
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
                      >新增三方</n-button
                    >
                  </div>

                  <!-- 选择信息 -->
                  <div class="text-sm text-gray-600">
                    共 {{ channelPaginationReactive.total }} 条记录
                  </div>
                </div>

                <div class="flex items-center gap-4">
                  <!-- 选择控制 -->
                  <div class="flex gap-2">
                    <n-button size="small" @click="handleChannelReset"
                      >重置筛选</n-button
                    >
                    <n-button size="small" @click="fetchChannelData"
                      >刷新数据</n-button
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
            title="修改"
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
                  <n-form-item label="通道币种" path="currency" required>
                    <n-select
                      v-model:value="channelForm.currency"
                      :options="currencyOptions"
                      placeholder="BRL"
                    />
                  </n-form-item>

                  <n-form-item
                    label="第三方支付"
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
                    label="第三方支付平台名"
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

                  <n-form-item label="三方商户号" path="merchantId" required>
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
                  <n-form-item label="商户密钥" path="merchantKey">
                    <div class="flex items-center gap-2">
                      <n-input
                        v-model:value="channelForm.merchantKey"
                        placeholder="••••••••••••"
                        type="password"
                        show-password-on="click"
                        style="flex: 1"
                      />
                      <n-button size="small">查看</n-button>
                    </div>
                  </n-form-item>
                </div>

                <!-- Row 4: Status -->
                <div class="mb-6">
                  <n-form-item label="成功标识" path="successStatus" required>
                    <n-input
                      v-model:value="channelForm.successStatus"
                      placeholder="SUCCESS"
                      :maxlength="20"
                    />
                  </n-form-item>
                </div>

                <!-- Row 5: URLs -->
                <div class="mb-6">
                  <n-form-item label="下单地址" path="orderUrl" required>
                    <n-input
                      v-model:value="channelForm.orderUrl"
                      placeholder="https://uspay.univepay.com/Payment/GlobalPay"
                      :maxlength="255"
                      show-count
                    />
                  </n-form-item>
                </div>

                <div class="mb-6">
                  <n-form-item label="查询地址" path="queryUrl" required>
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
                  <n-form-item label="三方回调IP" path="callbackIpWhitelist">
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
                  <span class="text-lg font-semibold">充值通道</span>
                </n-divider>

                <!-- Channel Configuration -->
                <div class="mb-6 rounded-lg bg-gray-50 p-4">
                  <div class="mb-4 flex items-center justify-between">
                    <span class="text-sm text-gray-600">通道1参数配置</span>
                    <n-switch
                      v-model:value="channelConfigEnabled"
                      :round="false"
                    >
                      <template #checked>启用所有通道</template>
                      <template #unchecked>启用所有通道</template>
                    </n-switch>
                  </div>

                  <!-- Channel Settings Row 1 -->
                  <div class="mb-4 grid grid-cols-2 gap-4">
                    <n-form-item
                      label="通道所属大类"
                      path="channelCategory"
                      required
                    >
                      <n-select
                        v-model:value="channelForm.channelCategory"
                        :options="rechargeCategoryOptions"
                        placeholder="请选择大类配置"
                        style="width: 100%"
                      />
                    </n-form-item>

                    <n-form-item label="通道编码" path="channelCode" required>
                      <n-input
                        v-model:value="channelForm.channelCode"
                        placeholder="100102"
                        :maxlength="50"
                      />
                    </n-form-item>
                  </div>

                  <div class="mb-4 grid grid-cols-2 gap-4">
                    <n-form-item label="通道名称" path="channelName" required>
                      <n-input
                        v-model:value="channelForm.channelName"
                        placeholder="PIX1"
                        :maxlength="50"
                        show-count
                      />
                    </n-form-item>

                    <n-form-item label="通道类型" path="channelType" required>
                      <n-select
                        v-model:value="channelForm.channelType"
                        :options="channelTypeOptions"
                        placeholder="普通"
                        style="width: 100%"
                      />
                    </n-form-item>
                  </div>

                  <!-- Member Level and Terminal -->
                  <div class="mb-4 grid grid-cols-1 gap-4">
                    <n-form-item label="会员层级" path="memberLevels">
                      <n-select
                        v-model:value="channelForm.memberLevels"
                        :options="memberTierOptions"
                        multiple
                        placeholder="请选择会员层级"
                        :max-tag-count="5"
                        style="width: 100%"
                      />
                    </n-form-item>

                    <n-form-item label="终端" path="terminals">
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
                    <n-form-item label="通道单笔限额">
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
                      <n-form-item label="是否输入姓名" path="requireName">
                        <n-switch v-model:value="channelForm.requireName" />
                      </n-form-item>

                      <n-form-item label="通道停/启用" path="isActive">
                        <n-switch v-model:value="channelForm.isActive" />
                      </n-form-item>
                    </div>
                  </div>

                  <!-- Additional Settings -->
                  <div class="mb-4 grid grid-cols-2 gap-4">
                    <n-form-item label="自定义通道角标" path="customBadge">
                      <n-input
                        v-model:value="channelForm.customBadge"
                        placeholder="请输入自定义通道角标"
                        :maxlength="20"
                        show-count
                      />
                    </n-form-item>

                    <n-form-item label="手续费率" path="feeRate">
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
                    <n-form-item label="通道费率" path="channelFeeRate">
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

                    <n-form-item label="赠送比例" path="bonusRate">
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
                      >配置手续费减免</n-button
                    >
                    <n-button
                      size="small"
                      type="info"
                      @click="showBonusConfigModal = true"
                      >配置充值赠送</n-button
                    >
                    <n-button
                      size="small"
                      type="warning"
                      @click="showRecommendedAmountModal = true"
                      >配置推荐金额</n-button
                    >
                  </div>

                  <!-- Pre-configured Amounts (Read-only, populated from configuration) -->
                  <div class="mb-4">
                    <n-form-item label="通道推荐金额" path="recommendedAmounts">
                      <n-input
                        v-model:value="channelForm.recommendedAmounts"
                        placeholder="将从 '配置推荐金额' 自动提取"
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
                    <n-form-item label="温馨提示" path="notificationMessage">
                      <n-input
                        v-model:value="channelForm.notificationMessage"
                        placeholder="输入的文字显示在代理通道选择区，最多1000个字"
                        type="textarea"
                        :autosize="{ minRows: 2, maxRows: 4 }"
                        :maxlength="1000"
                        show-count
                      />
                      <div class="mt-1 text-xs text-gray-500">
                        说明：温馨提示内容中可输入链接，会员前台会发布行提示
                      </div>
                    </n-form-item>
                  </div>
                </div>
              </n-form>
            </div>

            <template #footer>
              <div class="flex justify-end gap-3">
                <n-button @click="handleCloseChannelModal">取消</n-button>
                <n-button
                  type="primary"
                  @click="handleSaveChannel"
                  :loading="channelModalLoading"
                >
                  确认
                </n-button>
              </div>
            </template>
          </n-card>
        </n-modal>

        <!-- Bonus Config Modal - 配置充值赠送 -->
        <n-modal
          v-model:show="showBonusConfigModal"
          title="配置充值赠送"
          preset="card"
          style="width: 900px; max-height: 85vh"
          @update:show="(show) => !show && handleCloseBonusModal()"
        >
          <div style="max-height: 70vh; overflow-y: auto; padding: 0 16px">
            <div class="mb-6 rounded border-l-4 border-blue-500 bg-blue-50 p-4">
              <div class="text-sm text-blue-800">
                <strong>配置说明：</strong>
                设置充值赠送规则，包括气泡显示、颜色、会员层级策略和金额区间配置
              </div>
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
              <n-form-item label="赠送气泡" path="showBubble" class="mb-6">
                <n-radio-group
                  v-model:value="bonusForm.showBubble"
                  class="w-full"
                >
                  <n-radio value="hide" class="mr-8">不展示</n-radio>
                  <n-radio value="show" class="mr-8">展示</n-radio>
                </n-radio-group>
              </n-form-item>

              <!-- Bubble Color Options -->
              <n-form-item label="气泡背景颜色" path="bubbleColor" class="mb-6">
                <n-radio-group
                  v-model:value="bonusForm.bubbleColor"
                  class="w-full"
                >
                  <n-radio value="red" class="mr-6">
                    <n-tag type="error" size="small">红色</n-tag>
                  </n-radio>
                  <n-radio value="green" class="mr-6">
                    <n-tag type="success" size="small">绿色</n-tag>
                  </n-radio>
                  <n-radio value="blue" class="mr-6">
                    <n-tag type="info" size="small">蓝色</n-tag>
                  </n-radio>
                  <n-radio value="orange" class="mr-6">
                    <n-tag type="warning" size="small">橙色</n-tag>
                  </n-radio>
                </n-radio-group>
              </n-form-item>

              <!-- Member Level Options -->
              <n-form-item label="会员层级" path="memberLevel" class="mb-6">
                <n-radio-group
                  v-model:value="bonusForm.memberLevel"
                  class="w-full"
                >
                  <n-radio value="no-limit" class="mr-8">不区分层级</n-radio>
                  <n-radio value="by-level" class="mr-8"
                    >按层级分别配置充值赠送</n-radio
                  >
                </n-radio-group>
                <div class="mt-1 text-xs text-gray-500">
                  可新有会员统一配置赠送，也可根据会员级别分别配置充值赠送；<br />
                  未配置充值赠送的会员层级，无充值赠送；
                </div>
              </n-form-item>

              <!-- Amount Ranges Configuration -->
              <div class="mb-6 space-y-4">
                <div class="mb-3 text-sm font-medium text-gray-700">
                  充值金额区间配置
                </div>
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
                      placeholder="请输入"
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
                  </template>
                  添加金额区间
                </n-button>
              </div>

              <!-- Bonus Limit -->
              <n-form-item label="赠送金额上限" class="mb-6">
                <div class="flex items-center gap-2">
                  <n-input
                    v-model:value="bonusForm.bonusLimit"
                    placeholder="请输入赠送金额上限"
                    style="width: 280px"
                  />
                </div>
              </n-form-item>

              <!-- Daily Limit -->
              <n-form-item label="赠送次数上限" class="mb-6">
                <n-radio-group
                  v-model:value="bonusForm.dailyLimitType"
                  class="mb-3 w-full"
                >
                  <n-radio value="daily" class="mr-8">每日赠送上限次数</n-radio>
                  <n-radio value="total" class="mr-8">总共赠送上限次数</n-radio>
                </n-radio-group>
                <div class="flex items-center gap-2">
                  <n-input
                    v-model:value="bonusForm.dailyLimit"
                    placeholder="请输入赠送上限次数，不填表示不限次数"
                    style="width: 380px"
                  />
                </div>
                <div class="mt-2 text-xs text-gray-500">
                  可设置每日、总共其中一种，设置会员充值赠送次数上限
                </div>
              </n-form-item>
            </n-form>
          </div>

          <template #footer>
            <div class="flex justify-end gap-3 px-4 py-2">
              <n-button size="large" @click="handleCloseBonusModal"
                >取消</n-button
              >
              <n-button
                type="primary"
                size="large"
                @click="handleSaveBonusConfig"
                :loading="bonusModalLoading"
              >
                确认
              </n-button>
            </div>
          </template>
        </n-modal>

        <!-- Fee Reduction Modal - 配置手续费减免 -->
        <n-modal
          v-model:show="showFeeReductionModal"
          title="配置手续费减免"
          preset="card"
          style="width: 600px"
        >
          <n-form
            ref="feeReductionFormRef"
            :model="feeReductionForm"
            label-placement="left"
            label-width="140px"
          >
            <n-form-item label="限前多少次充值" required>
              <div class="flex items-center gap-2">
                <n-input
                  v-model:value="feeReductionForm.rechargeLimit"
                  placeholder="请输入前多少次充值"
                  style="width: 200px"
                />
                <span>次</span>
              </div>
              <div class="mt-1 text-xs text-gray-500">
                可限定前多少次充值，才减免手续费
              </div>
            </n-form-item>

            <n-form-item label="单笔充值金额限定" required>
              <div class="flex items-center gap-2">
                <span class="text-sm">R$</span>
                <n-input
                  v-model:value="feeReductionForm.singleAmountLimit"
                  placeholder="请输入单笔充值金额限定"
                  style="width: 200px"
                />
              </div>
              <div class="mt-1 text-xs text-gray-500">
                单笔金额小于此金额，才减免手续费，按充值金额填写（非游戏分数）
              </div>
            </n-form-item>

            <n-form-item label="减免百分比" required>
              <div class="flex items-center gap-2">
                <n-input
                  v-model:value="feeReductionForm.reductionPercentage"
                  placeholder="请输入减免百分比"
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
              <n-button @click="showFeeReductionModal = false">取消</n-button>
              <n-button type="primary" @click="handleSaveFeeReduction">
                确认
              </n-button>
            </div>
          </template>
        </n-modal>

        <!-- Recommended Amount Modal - 配置推荐金额 -->
        <n-modal
          v-model:show="showRecommendedAmountModal"
          title="配置推荐金额"
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
              <n-form-item label="充值限制">
                <n-radio-group v-model:value="recommendedAmountForm.amountType">
                  <n-radio value="可输入任意金额">可输入任意金额</n-radio>
                  <n-radio value="仅限固定金额">仅限固定金额</n-radio>
                </n-radio-group>
              </n-form-item>

              <!-- Recommended Amount Settings -->
              <div class="mb-4">
                <div class="grid grid-cols-2 gap-6">
                  <!-- Left Column -->
                  <div>
                    <h4 class="mb-3 font-medium">推荐金额设置</h4>
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
                            placeholder="输入加赠比例"
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
                            placeholder="输入加赠比例"
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
                >取消</n-button
              >
              <n-button type="primary" @click="handleSaveRecommendedAmount">
                确认
              </n-button>
            </div>
          </template>
        </n-modal>
      </n-tab-pane>

      <n-tab-pane name="third-party-statistics" tab="三方统计">
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
                  placeholder="开始日期"
                  style="width: 140px"
                />
                <span class="text-gray-500">-</span>
                <n-date-picker
                  v-model:value="statsFilters.endDate"
                  type="date"
                  placeholder="结束日期"
                  style="width: 140px"
                />

                <span class="filter-label ml-4">三方支付:</span>
                <n-select
                  v-model:value="statsFilters.platform"
                  placeholder="请选择三方支付"
                  style="width: 160px"
                  :options="platformOptions"
                  clearable
                />

                <span class="filter-label">通道所属大类:</span>
                <n-select
                  v-model:value="statsFilters.category"
                  placeholder="通道所属大类"
                  style="width: 140px"
                  :options="categoryOptions"
                  clearable
                />

                <n-button type="primary" @click="handleStatsSearch"
                  >搜索</n-button
                >
                <n-button @click="handleStatsReset">重置</n-button>
              </n-space>
            </div>
          </div>
        </n-card>

        <!-- Statistics Table -->
        <n-card>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-lg font-medium">三方支付统计</span>
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
                  </template>
                  导出报表
                </n-button>
                <n-button
                  type="primary"
                  size="small"
                  @click="handleRefreshStats"
                >
                  <template #icon>
                    <n-icon><Refresh /></n-icon>
                  </template>
                  刷新数据
                </n-button>
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
                        </template>
                        导出报表
                      </n-button>
                      <n-button
                        type="primary"
                        size="small"
                        @click="handleRefreshStats"
                      >
                        <template #icon>
                          <n-icon><Refresh /></n-icon>
                        </template>
                        刷新数据
                      </n-button>
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
                      </template>
                      三方支付统计
                    </n-tag>
                  </div>
                </div>
              </n-card>
            </template>

            <template #empty>
              <div class="py-8 text-center">
                <n-empty description="暂无统计数据">
                  <template #extra>
                    <n-text depth="3" class="text-sm">
                      请选择时间范围和筛选条件后点击搜索
                    </n-text>
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
              label="总交易笔数"
              :value="statsSummary.totalTransactions"
            >
              <template #suffix>笔</template>
            </n-statistic>
          </n-card>
          <n-card size="small">
            <n-statistic
              label="成功交易笔数"
              :value="statsSummary.successTransactions"
            >
              <template #suffix>笔</template>
            </n-statistic>
          </n-card>
          <n-card size="small">
            <n-statistic
              label="总交易金额"
              :value="statsSummary.totalAmount"
              :precision="2"
            >
              <template #suffix>BRL</template>
            </n-statistic>
          </n-card>
          <n-card size="small">
            <n-statistic
              label="整体成功率"
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
        title="创建预设订单"
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
          <n-form-item label="会员ID" path="memberId" required>
            <n-auto-complete
              v-model:value="presetOrderForm.memberId"
              :options="memberOptions"
              :loading="memberLoading"
              placeholder="请输入会员ID/账号/姓名进行搜索"
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
            <div class="mb-2 text-xs font-medium text-blue-600">
              已选择会员信息
            </div>
            <div class="space-y-1">
              <div class="flex justify-between">
                <span class="text-gray-600">会员ID:</span>
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
                <span class="text-gray-600">VIP等级:</span>
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
            <n-button @click="showPresetOrderModal = false">取消</n-button>
            <n-button
              type="primary"
              :loading="presetOrderLoading"
              @click="handleConfirmPresetOrder"
            >
              确定
            </n-button>
          </div>
        </template>
      </n-card>
    </n-modal>

    <!-- Supplement Order Modal -->
    <n-modal v-model:show="showSupplementOrderModal" :mask-closable="false">
      <n-card
        style="width: 600px"
        title="创建补单"
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
          <n-form-item label="会员ID" path="memberId" required>
            <n-auto-complete
              v-model:value="supplementOrderForm.memberId"
              :options="memberOptions"
              :loading="memberLoading"
              placeholder="请输入会员ID/账号/姓名进行搜索"
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
            <div class="mb-2 text-xs font-medium text-blue-600">
              已选择会员信息
            </div>
            <div class="space-y-1">
              <div class="flex justify-between">
                <span class="text-gray-600">会员ID:</span>
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
                <span class="text-gray-600">VIP等级:</span>
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
            <n-button @click="showSupplementOrderModal = false">取消</n-button>
            <n-button
              type="primary"
              :loading="supplementOrderLoading"
              @click="handleConfirmSupplementOrder"
            >
              确定
            </n-button>
          </div>
        </template>
      </n-card>
    </n-modal>

    <!-- Create Order Modal -->
    <n-modal v-model:show="showCreateOrderModal" :mask-closable="false">
      <n-card
        style="width: 700px"
        title="创建在线订单"
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
          <n-form-item label="会员账号/ID" path="memberAccount" required>
            <n-input-group>
              <n-input
                v-model:value="createOrderForm.memberAccount"
                placeholder="请输入会员账号或会员ID进行搜索"
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
              >
                搜索
              </n-button>
            </n-input-group>
          </n-form-item>

          <!-- Member Information Display -->
          <div v-if="foundMember" class="mb-4 rounded-lg bg-gray-50 p-4">
            <div class="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span class="text-gray-600">会员ID:</span>
                <span class="ml-2 font-medium">{{ foundMember.id }}</span>
              </div>
              <div>
                <span class="text-gray-600">会员账号:</span>
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
            <n-form-item label="充值大类" path="rechargeCategory" required>
              <n-select
                v-model:value="createOrderForm.rechargeCategory"
                placeholder="请选择充值大类"
                :options="rechargeCategoryOptions"
                @update:value="handleRechargeCategoryChange"
              />
              <div
                v-if="!rechargeCategoryOptions.length"
                class="mt-1 text-sm text-red-500"
              >
                请选择充值大类
              </div>
            </n-form-item>

            <!-- 支付通道 (只有选择充值大类后才显示) -->
            <n-form-item
              v-if="createOrderForm.rechargeCategory"
              label="支付通道"
              path="selectedChannel"
              required
            >
              <n-select
                v-model:value="createOrderForm.selectedChannel"
                placeholder="请选择支付通道"
                :options="availableChannelOptions"
                :loading="loadingChannels"
                @update:value="handleChannelChange"
              />
              <div
                v-if="availableChannelOptions.length === 0 && !loadingChannels"
                class="mt-1 text-sm text-red-500"
              >
                该大类下暂无可用的支付通道
              </div>
            </n-form-item>

            <!-- 订单金额 -->
            <n-form-item label="订单金额" path="orderAmount" required>
              <n-input-group>
                <n-input-group-label>R$</n-input-group-label>
                <n-input
                  v-model:value="createOrderForm.orderAmount"
                  placeholder="请输入订单金额"
                  @input="handleAmountInput"
                />
              </n-input-group>
            </n-form-item>

            <!-- 稽核倍数和赠送比例 -->
            <div class="grid grid-cols-2 gap-4">
              <n-form-item label="稽核倍数" path="auditMultiple">
                <n-input
                  v-model:value="createOrderForm.auditMultiple"
                  placeholder="1.00"
                  @input="validateAuditMultiple"
                />
              </n-form-item>
              <n-form-item label="赠送比例" path="bonusRatio">
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
                    placeholder="请输入赠送比例"
                  />
                  <n-input-group-label>%</n-input-group-label>
                </n-input-group>
              </n-form-item>
            </div>

            <!-- 订单备注 -->
            <n-form-item label="订单备注" path="orderNote">
              <n-input
                v-model:value="createOrderForm.orderNote"
                type="textarea"
                placeholder="请输入订单备注"
                :maxlength="1000"
                show-count
                :autosize="{ minRows: 2, maxRows: 4 }"
              />
            </n-form-item>

            <!-- 验证密码 -->
            <n-form-item label="验证密码" path="verificationPassword" required>
              <n-input
                v-model:value="createOrderForm.verificationPassword"
                type="password"
                placeholder="请输入您的登录密码"
                show-password-on="click"
              />
            </n-form-item>
          </div>
        </n-form>

        <template #footer>
          <div style="display: flex; justify-content: flex-end; gap: 12px">
            <n-button @click="showCreateOrderModal = false">取消</n-button>
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
            >
              确认
            </n-button>
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
        title="订单详情"
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
          <n-descriptions bordered :column="2" title="基本信息">
            <n-descriptions-item label="订单号">{{
              currentOrderDetail.orderId
            }}</n-descriptions-item>
            <n-descriptions-item label="订单状态">
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
            <n-descriptions-item label="会员ID">{{
              currentOrderDetail.user?.userID || currentOrderDetail.memberId
            }}</n-descriptions-item>
            <n-descriptions-item label="会员账号">{{
              currentOrderDetail.memberAccount
            }}</n-descriptions-item>
            <n-descriptions-item label="会员层级">{{
              currentOrderDetail.user?.memberTier?.tierName || '-'
            }}</n-descriptions-item>
            <n-descriptions-item label="充值大类">{{
              currentOrderDetail.thirdPartyPayment
            }}</n-descriptions-item>
            <n-descriptions-item label="通道名称">{{
              currentOrderDetail.channel?.channelName ||
              currentOrderDetail.channelName
            }}</n-descriptions-item>
            <n-descriptions-item label="通道编码">{{
              currentOrderDetail.channelCode
            }}</n-descriptions-item>
          </n-descriptions>

          <!-- Amount Info -->
          <n-descriptions bordered :column="2" title="金额信息" class="mt-4">
            <n-descriptions-item label="充值通道币种">{{
              currentOrderDetail.channelCurrency ||
              currentOrderDetail.channel?.currency ||
              'BRL'
            }}</n-descriptions-item>
            <n-descriptions-item label="数量">{{
              formatCurrency(
                currentOrderDetail.channelAmount ||
                  currentOrderDetail.rechargeAmount,
              )
            }}</n-descriptions-item>
            <n-descriptions-item label="汇率">{{
              currentOrderDetail.exchangeRate
                ? `1:${currentOrderDetail.exchangeRate}`
                : '-'
            }}</n-descriptions-item>
            <n-descriptions-item label="会员币种">BRL</n-descriptions-item>
            <n-descriptions-item label="订单金额">{{
              formatCurrency(currentOrderDetail.rechargeAmount)
            }}</n-descriptions-item>
            <n-descriptions-item label="赠送金额">{{
              formatCurrency(currentOrderDetail.bonusAmount || 0)
            }}</n-descriptions-item>
            <n-descriptions-item label="总上分金额">{{
              formatCurrency(
                currentOrderDetail.rechargeAmount +
                  (currentOrderDetail.bonusAmount || 0),
              )
            }}</n-descriptions-item>
            <n-descriptions-item label="通道费率">{{
              currentOrderDetail.channelFeeRate
                ? `${(currentOrderDetail.channelFeeRate * 100).toFixed(2)}%`
                : '-'
            }}</n-descriptions-item>
          </n-descriptions>

          <!-- Time Info -->
          <n-descriptions bordered :column="2" title="时间信息" class="mt-4">
            <n-descriptions-item label="创建时间">{{
              formatDateTime(currentOrderDetail.createdAt)
            }}</n-descriptions-item>
            <n-descriptions-item label="成功时间">
              {{
                currentOrderDetail.status === 'SUCCESS' ||
                currentOrderDetail.status === 'success'
                  ? formatDateTime(
                      (currentOrderDetail as any).processingTime ||
                        (currentOrderDetail as any).confirmTime ||
                        (currentOrderDetail as any).completeTime,
                    )
                  : '-'
              }}
            </n-descriptions-item>
            <n-descriptions-item label="更新时间">{{
              formatDateTime(currentOrderDetail.updatedAt)
            }}</n-descriptions-item>
            <n-descriptions-item label="操作人">{{
              (currentOrderDetail as any).操作人 || 'system'
            }}</n-descriptions-item>
          </n-descriptions>

          <!-- Additional Info -->
          <n-descriptions bordered :column="1" title="其他信息" class="mt-4">
            <n-descriptions-item label="三方订单号">{{
              currentOrderDetail.thirdPartyOrderId || '-'
            }}</n-descriptions-item>
            <n-descriptions-item label="标记">{{
              (currentOrderDetail as any).标记 || '-'
            }}</n-descriptions-item>
            <n-descriptions-item label="是否首存">{{
              (currentOrderDetail as any).是否首存 || '否'
            }}</n-descriptions-item>
            <n-descriptions-item label="备注">{{
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
            <n-descriptions bordered :column="1" title="错误信息">
              <n-descriptions-item
                v-if="currentOrderDetail.errorCode"
                label="错误代码"
                >{{ currentOrderDetail.errorCode }}</n-descriptions-item
              >
              <n-descriptions-item
                v-if="currentOrderDetail.errorDetails"
                label="错误详情"
                >{{ currentOrderDetail.errorDetails }}</n-descriptions-item
              >
            </n-descriptions>
          </div>
        </div>

        <template #footer>
          <div style="display: flex; justify-content: flex-end">
            <n-button @click="showOrderDetailModal = false">关闭</n-button>
          </div>
        </template>
      </n-card>
    </n-modal>

    <!-- Column Configuration Modal -->
    <n-modal v-model:show="showColumnConfig" :mask-closable="false">
      <n-card
        style="width: 500px"
        title="自定义列"
        :bordered="false"
        size="huge"
        :segmented="{ content: 'soft', footer: 'soft' }"
      >
        <div class="column-config-content">
          <p class="mb-4 text-gray-600">拖拽重新排序，勾选控制显示</p>

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
            <n-button @click="resetColumnConfig">重置</n-button>
            <div class="flex gap-2">
              <n-button @click="showColumnConfig = false">取消</n-button>
              <n-button type="primary" @click="saveColumnConfig">保存</n-button>
            </div>
          </div>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
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
import { useAccessStore } from '@vben/stores';
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
import { requestClient } from '../../api/request';
// Import timezone utilities
import {
  formatDateTimeInTimezone,
  getNowInTimezone,
  convertTimezoneToUTC,
  getDisplayTimezone,
} from '../../utils/timezoneUtils';
// Import transaction mappings for remark translation
import { TRANSACTION_SUBCATEGORY_MAPPINGS } from '../../utils/transactionMappings';

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
const dialog = useDialog();
const accessStore = useAccessStore();
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
    title: '三方支付',
    key: 'platformName',
    width: 150,
    ellipsis: true,
    render: (row: any) =>
      h('div', { class: 'font-medium text-blue-600' }, row.platformName || '-'),
  },
  {
    title: '通道所属大类',
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
    title: '三方通道名称/编码',
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
    title: '充值人数',
    key: 'uniqueUsers',
    width: 80,
    align: 'center' as const,
    render: (row: any) =>
      h('span', { class: 'font-medium' }, row.uniqueUsers || 0),
  },
  {
    title: '合计笔数',
    key: 'totalOrders',
    width: 80,
    align: 'center' as const,
    render: (row: any) =>
      h('span', { class: 'font-medium' }, row.totalOrders || 0),
  },
  {
    title: '成功笔数',
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
    title: '成功金额',
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
    title: '近30分钟成功IT笔数',
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
    title: '近30分钟成功IT金额',
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
    title: '成功率',
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
    title: '近30分钟成功IT率',
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
    title: '近30分钟成功金额上升',
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
    title: '近30分钟成功金额下降',
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
    title: '通道大类',
    key: 'channelCategory',
    width: 100,
    ellipsis: true,
  },
  {
    title: '通道名称',
    key: 'channelName',
    width: 150,
    ellipsis: true,
    render: (row: any) =>
      h('div', { class: 'font-medium' }, row.channelName || '-'),
  },
  {
    title: '支付平台',
    key: 'platformName',
    width: 150,
    ellipsis: true,
  },
  {
    title: '商户号',
    key: 'merchantId',
    width: 120,
    ellipsis: true,
  },
  {
    title: '通道编码',
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
    title: '币种',
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
    title: '交易限额',
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
    title: '会员层级',
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
    title: '停用时间',
    key: 'updatedAt',
    width: 160,
    render: (row: any) => {
      if (!row.updatedAt) return '-';
      return h(
        'div',
        { class: 'text-xs text-gray-600' },
        new Date(row.updatedAt).toLocaleString('zh-CN'),
      );
    },
  },
  {
    title: '停用原因',
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
    title: '操作',
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
    { required: true, message: '请选择第三方支付', trigger: 'change' },
  ],
  platformName: [
    { required: true, message: '请输入第三方支付平台名', trigger: 'blur' },
  ],
  merchantId: [
    { required: true, message: '请输入三方商户号', trigger: 'blur' },
  ],
  orderUrl: [{ required: true, message: '请输入下单地址', trigger: 'blur' }],
  queryUrl: [{ required: true, message: '请输入查询地址', trigger: 'blur' }],
  callbackIpWhitelist: [
    // Optional field - validation handled by backend
  ],
  channelCategory: [
    { required: true, message: '请选择通道所属大类', trigger: 'change' },
  ],
  channelCode: [{ required: true, message: '请输入通道编码', trigger: 'blur' }],
  channelName: [{ required: true, message: '请输入通道名称', trigger: 'blur' }],
  channelType: [
    { required: true, message: '请选择通道类型', trigger: 'change' },
  ],
  currency: [{ required: true, message: '请选择通道币种', trigger: 'change' }],
  'channelLimit.min': [
    {
      required: true,
      message: '请输入最小金额',
      trigger: 'blur',
    },
  ],
  'channelLimit.max': [
    {
      required: true,
      message: '请输入最大金额',
      trigger: 'blur',
    },
  ],
};

// Category form validation rules
const categoryRules = {
  name: [
    { required: true, message: '请输入大类名称', trigger: 'blur' },
    { max: 50, message: '大类名称不能超过50个字符', trigger: 'blur' },
  ],
  blacklistStatus: [
    { required: true, message: '请选择黑名单状态', trigger: 'change' },
  ],
  isActive: [{ required: true, message: '请选择开启状态', trigger: 'change' }],
  badge: [{ max: 12, message: '大类角标不能超过12个字符', trigger: 'blur' }],
};

// Bonus form validation rules
const bonusRules = {
  showBubble: [
    { required: true, message: '请选择是否展示赠送气泡', trigger: 'change' },
  ],
  bubbleColor: [
    { required: true, message: '请选择气泡背景颜色', trigger: 'change' },
  ],
  memberLevel: [
    { required: true, message: '请选择会员层级策略', trigger: 'change' },
  ],
  amountRanges: [
    {
      type: 'array',
      min: 1,
      message: '至少需要配置一个金额区间',
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
  { label: 'PIX支付', value: 'PIX' },
  { label: 'UnivePay', value: 'UnivePay' },
  { label: '银行转账', value: 'BANK_TRANSFER' },
  { label: '信用卡', value: 'CREDIT_CARD' },
  { label: '数字钱包', value: 'DIGITAL_WALLET' },
];

const gatewayOptions = [
  { label: 'PIX Gateway', value: 'PIX_GATEWAY' },
  { label: 'UnivePay Gateway', value: 'UNIVEPAY_GATEWAY' },
  { label: 'Bank Gateway', value: 'BANK_GATEWAY' },
  { label: 'Card Gateway', value: 'CARD_GATEWAY' },
];

const channelNameOptions = [
  { label: 'PIX即时支付', value: 'PIX_INSTANT' },
  { label: 'PIX二维码', value: 'PIX_QR' },
  { label: 'UnivePay支付', value: 'UNIVEPAY_PAYMENT' },
  { label: '银行直连', value: 'BANK_DIRECT' },
  { label: '信用卡支付', value: 'CREDIT_PAYMENT' },
];

const categoryOptions = [
  { label: '即时支付', value: 'INSTANT_PAYMENT' },
  { label: '银行转账', value: 'BANK_TRANSFER' },
  { label: '信用卡支付', value: 'CREDIT_CARD' },
  { label: '数字钱包', value: 'DIGITAL_WALLET' },
  { label: '第三方支付', value: 'THIRD_PARTY' },
];

const terminalOptions = [
  { label: 'PC端', value: 'PC' },
  { label: '移动端', value: 'MOBILE' },
  { label: 'APP', value: 'APP' },
  { label: 'H5', value: 'H5' },
  { label: 'Android', value: 'ANDROID' },
  { label: 'iOS', value: 'IOS' },
];

// Channel type options for the new form
const channelTypeOptions = [
  { label: '普通', value: 'NORMAL' },
  { label: '优先', value: 'PRIORITY' },
  { label: 'VIP', value: 'VIP' },
  { label: '特殊', value: 'SPECIAL' },
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
  { label: '默认级别', value: 'DEFAULT' },
  { label: '全部会员', value: 'ALL' },
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
  { label: '待处理', value: 'pending' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
];

const advancedSearchOptions: DropdownOption[] = [
  { label: '高级筛选', key: 'advanced' },
  { label: '自定义查询', key: 'custom' },
];

const exportOptions: DropdownOption[] = [
  { label: '导出Excel', key: 'excel' },
  { label: '导出CSV', key: 'csv' },
  { label: '导出PDF', key: 'pdf' },
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

// Import timezone utilities
import {
  formatDateTimeInTimezone,
  getNowInTimezone,
  convertTimezoneToUTC,
  getDisplayTimezone,
} from '../../utils/timezoneUtils';

const formatDateTime = (dateString: string): string => {
  if (!dateString) return '-';
  const tz = getDisplayTimezone();
  return formatDateTimeInTimezone(dateString, tz);
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    message.success('复制成功');
  } catch (error) {
    message.error('复制失败');
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
    title: '订单号',
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
    title: '会员ID',
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
    title: '会员账号',
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
                { default: () => '已首次充值' },
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
                  { default: () => '未充值会员' },
                ),
        ],
      ),
  },
  {
    title: '首充状态',
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
            { default: () => '已首充' },
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
              { default: () => '未充值' },
            ),
  },
  {
    title: '昵称',
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
    title: '创建时间',
    key: 'createdAt',
    width: 140,
    render: (row) =>
      h(
        NText,
        { style: { fontSize: '12px' } },
        { default: () => formatDateTime(row.createdAt) },
      ),
  },
  {
    title: '成功时间',
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
        { default: () => (successTime ? formatDateTime(successTime) : '-') },
      );
    },
  },
  {
    title: '更新时间',
    key: 'updatedAt',
    width: 140,
    render: (row) =>
      h(
        NText,
        { style: { fontSize: '12px' } },
        { default: () => formatDateTime(row.updatedAt) },
      ),
  },
  {
    title: 'VIP等级',
    key: 'vipLevel',
    width: 100,
    render: (row) =>
      h(NTag, { type: 'info', size: 'small' }, { default: () => row.vipLevel }),
  },
  {
    title: '会员层级',
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
    title: '充值通道币种',
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
    title: '数量',
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
    title: '汇率',
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
    title: '会员币种',
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
    title: '订单金额',
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
    title: '赠送金额',
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
    title: '手续费',
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
    title: '总上分金额',
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
    title: '第三方支付',
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
    title: '通道名称',
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
    title: '通道费率',
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
    title: '订单状态',
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
                  title: '错误详情',
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
                  positiveText: '确定',
                });
              },
            },
            { default: () => '错误详情' },
          ),
        );
      }

      return h('div', { class: 'flex flex-col' }, elements);
    },
  },
  {
    title: '备注',
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

      // ✅ NEW: Translate remark key to Chinese (e.g., "manual_recharge" -> "手动充值")
      // If the remark is a key in our mapping, translate it; otherwise use the raw value
      const remarks =
        TRANSACTION_SUBCATEGORY_MAPPINGS[remarksRaw] || remarksRaw;

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
    title: '操作',
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
            { default: () => '强制入款' },
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
            { default: () => '强制取消' },
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
            { default: () => '刷新状态' },
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
            { default: () => '备注' },
          ),
        );
      }

      // If no actions available, show disabled text
      if (actions.length === 0) {
        return h(
          NText,
          { style: { color: '#999', fontSize: '12px' } },
          { default: () => '无可用操作' },
        );
      }

      return h(NSpace, { size: 'small' }, actions);
    },
  },
];

// Channel table columns
const channelColumns: DataTableColumns<ThirdPartyChannel> = [
  {
    title: '第三方支付平台',
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
    title: '第三方支付',
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
    title: '三方商户号',
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
              { default: () => '复制' },
            ),
          ],
        },
      ),
  },
  {
    title: '网址',
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
    title: '三方回调IP',
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
    title: '通道名称',
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
    title: '通道编号',
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
    title: '所属大类',
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
    title: '通道币种',
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
    title: '单笔限额',
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
    title: '赠送比例(%)',
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
              { default: () => '配置' },
            ),
          ],
        },
      ),
  },
  {
    title: '终端',
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
    title: '会员层级',
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
    title: '通道状态',
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
    title: '成功率',
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
    title: '处理时间(s)',
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
    title: '通道备注',
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
    title: '操作',
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
              { default: () => '编辑' },
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'info',
                text: true,
                onClick: () => handleTestChannelConnection(row),
              },
              { default: () => '测试' },
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'error',
                text: true,
                onClick: () => handleDeleteChannel(row),
              },
              { default: () => '删除' },
            ),
          ],
        },
      ),
  },
];

// Category table columns
const categoryColumns: DataTableColumns<any> = [
  {
    title: '大类名称',
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
    title: '大类角标',
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
    title: '显示排序',
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
    title: '黑名单状态',
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
    title: '开启状态',
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
    title: '创建时间',
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
              return new Date(row.createdAt).toLocaleDateString('zh-CN');
            }
            return '-';
          },
        },
      ),
  },
  {
    title: '操作',
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
              { default: () => '修改' },
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'error',
                text: true,
                onClick: () => handleDeleteCategory(row),
              },
              { default: () => '删除' },
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
      const [start, end] = filters.dateRange;
      const tz = getDisplayTimezone();
      const startDateObj = new Date(start);
      const endDateObj = new Date(end);

      // Get date components in display timezone
      const startTz = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).formatToParts(startDateObj);

      const endTz = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).formatToParts(endDateObj);

      const startUTC = convertTimezoneToUTC(
        parseInt(startTz.find((p) => p.type === 'year')!.value),
        parseInt(startTz.find((p) => p.type === 'month')!.value),
        parseInt(startTz.find((p) => p.type === 'day')!.value),
        parseInt(startTz.find((p) => p.type === 'hour')!.value),
        parseInt(startTz.find((p) => p.type === 'minute')!.value),
        parseInt(startTz.find((p) => p.type === 'second')!.value),
        tz,
      );

      const endUTC = convertTimezoneToUTC(
        parseInt(endTz.find((p) => p.type === 'year')!.value),
        parseInt(endTz.find((p) => p.type === 'month')!.value),
        parseInt(endTz.find((p) => p.type === 'day')!.value),
        parseInt(endTz.find((p) => p.type === 'hour')!.value),
        parseInt(endTz.find((p) => p.type === 'minute')!.value),
        parseInt(endTz.find((p) => p.type === 'second')!.value),
        tz,
      );

      startDate = startUTC.toISOString();
      endDate = endUTC.toISOString();
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
      message.error('获取充值订单数据失败');
      tableData.value = [];
      paginationReactive.total = 0;
    }
  } catch (error) {
    message.error('获取数据失败');
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

  const tz = getDisplayTimezone();
  const tzNow = getNowInTimezone(tz);

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

  // Convert to UTC timestamps
  const startDateUTC = convertTimezoneToUTC(
    startYear,
    startMonth,
    startDay,
    0,
    0,
    0,
    tz,
  );
  const endDateUTC = convertTimezoneToUTC(
    endYear,
    endMonth,
    endDay,
    23,
    59,
    59,
    tz,
  );

  filters.dateRange = [startDateUTC.getTime(), endDateUTC.getTime()];
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
    message.warning('请输入会员账号或会员ID');
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

      message.success('会员查找成功');
    } else {
      message.warning('未找到该会员，请检查账号或ID是否正确');
    }
  } catch (error) {
    console.error('搜索会员失败:', error);
    message.error('搜索会员失败，请稍后重试');
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
    message.error('加载充值大类失败');
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
      memberTierOptions.value = response.list.map((tier: any) => ({
        label: tier.tierName,
        value: tier.tierCode,
        name: tier.tierName,
        description: tier.description,
      }));
      console.log('✅ Loaded member tier options:', memberTierOptions.value);
    } else {
      console.warn('⚠️ No member tiers found');
      memberTierOptions.value = [];
    }
  } catch (error) {
    console.error('❌ 加载会员层级失败:', error);
    message.error('加载会员层级失败');
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
    message.error('加载支付通道失败');
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
    message.warning('请先搜索并确认会员信息');
    return;
  }

  if (!createOrderForm.verificationPassword) {
    message.warning('请输入验证密码');
    return;
  }

  if (!createOrderForm.selectedChannel || !selectedChannelDetails.value) {
    message.warning('请选择支付通道');
    return;
  }

  createOrderLoading.value = true;
  try {
    // Get the selected category details
    const selectedCategory = rechargeCategoryOptions.value.find(
      (option) => option.value === createOrderForm.rechargeCategory,
    );

    if (!selectedCategory) {
      message.error('请选择有效的充值大类');
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
      message.success('订单创建成功');
      showCreateOrderModal.value = false;

      // Refresh the table to show the new order
      await fetchData();
      console.log('✅ Order created successfully:', response.orderId);
    } else if (response && response.success) {
      // Wrapped response with success property
      message.success('订单创建成功');
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
      message.success('订单创建成功');
      showCreateOrderModal.value = false;
      await fetchData();
      console.log(
        '✅ Order created successfully via error handler:',
        error.orderId,
      );
    } else {
      message.error('创建订单失败，请稍后重试');
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
      message.error('请选择会员');
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
      message.success('预设订单创建成功');
      showPresetOrderModal.value = false;
      fetchData();
    } else {
      throw new Error('会员数据不完整');
    }
  } catch (error) {
    message.error('创建预设订单失败');
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
      message.error('请选择会员');
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
      message.success('补单创建成功');
      showSupplementOrderModal.value = false;
      fetchData();
    } else {
      throw new Error('会员数据不完整');
    }
  } catch (error) {
    message.error('创建补单失败');
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
        title: '确认强制入款',
        content: `确定要对订单 ${row.orderId} 执行强制入款操作吗？`,
        positiveText: '确认',
        negativeText: '取消',
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
      message.success('强制入款成功');
      fetchData(); // Refresh table
    } else {
      message.error(response.message || '强制入款失败');
    }
  } catch (error) {
    console.error('Force deposit error:', error);
    message.error('强制入款操作失败');
  }
};

const handleForceCancel = async (row: any) => {
  try {
    console.log('❌ Force cancel for order:', row.orderId);

    // Show input dialog for cancellation reason
    const reason = await new Promise<string | null>((resolve) => {
      let inputValue = '';
      dialog.warning({
        title: '确认强制取消',
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
        positiveText: '确认取消',
        negativeText: '取消',
        onPositiveClick: () => {
          if (!inputValue.trim()) {
            message.warning('请输入取消原因');
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
      message.success('强制取消成功');
      fetchData(); // Refresh table
    } else {
      message.error(response.message || '强制取消失败');
    }
  } catch (error) {
    console.error('Force cancel error:', error);
    message.error('强制取消操作失败');
  }
};

const handleRefreshStatus = async (row: any) => {
  try {
    console.log('🔄 Refresh status for order:', row.orderId);

    // Call the refresh status API using requestClient
    const response = await requestClient.post(`/deposits/${row.id}/refresh`);

    if (response.success !== false) {
      message.success('状态刷新请求已提交，请稍后查看结果');
      // Don't refresh immediately as the status update might take time
    } else {
      if (response.message && response.message.includes('频繁')) {
        message.warning('刷新过于频繁，请稍后再试');
      } else {
        message.error(response.message || '状态刷新失败');
      }
    }
  } catch (error) {
    console.error('Refresh status error:', error);
    message.error('状态刷新操作失败');
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
        title: '添加备注',
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
        positiveText: '保存',
        negativeText: '取消',
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
        message.success('备注更新成功');
        await fetchData(); // Refresh the table
      } else {
        message.error('备注更新失败');
      }
    }
  } catch (error) {
    console.error('❌ Error updating remarks:', error);
    message.error('备注更新失败');
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
    message.error('获取通道数据失败');
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

    message.success('充值赠送配置已保存，将在保存通道时一起提交');
    showBonusConfigModal.value = false;
  } catch (error) {
    console.error('❌ Error saving bonus config:', error);
    message.error('保存失败');
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
    message.success('手续费减免配置已保存');
    showFeeReductionModal.value = false;
  } catch (error) {
    console.error('❌ Error saving fee reduction:', error);
    message.error('保存失败');
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

    message.success('推荐金额配置已保存，包含金额和加赠比例');
    showRecommendedAmountModal.value = false;
  } catch (error) {
    console.error('❌ Error saving recommended amounts:', error);
    message.error('保存失败');
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
      message.success('配置成功');
      showBonusConfigModal.value = false;
      fetchChannelData();
    } else {
      throw new Error(response.message || '配置失败');
    }
  } catch (error) {
    message.error('配置失败');
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
      message.error('状态更新失败');
    }
  } catch (error) {
    // Revert the change if API call fails
    channel.isActive = !value;
    message.error('状态更新失败');
    console.error('Toggle channel status error:', error);
  }
};

const handleTestChannelConnection = async (channel: any) => {
  try {
    message.loading('测试连接中...', { duration: 0 });
    const response = await thirdPartyChannelApi.testConnection(channel.id);

    if (response && response.success !== false) {
      message.success('连接测试成功');
    } else {
      message.error(response?.message || '连接测试失败');
    }
  } catch (error) {
    console.error('Test channel connection error:', error);
    message.error('连接测试失败');
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
      message.success('删除成功');
      await fetchChannelData();
    } else {
      message.error(response?.message || '删除失败');
    }
  } catch (error) {
    console.error('Delete channel error:', error);
    message.error('删除失败');
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
    message.error('获取大类配置数据失败');
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
      message.success('删除成功');
      await fetchCategoryData();
    } else {
      message.error(response.message || '删除失败');
    }
  } catch (error) {
    console.error('Delete category error:', error);
    message.error('删除失败');
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
        message.success('更新成功');
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
        message.success('创建成功');
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
    message.error('状态更新失败');
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
    message.error('获取已停用通道失败');
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
    message.error('启用通道失败');
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
    message.error('删除通道失败');
  }
};

const handleBatchEnableChannels = () => {
  if (selectedDisabledChannels.value.length === 0) {
    message.warning('请选择要启用的通道');
    return;
  }
  batchOperationType.value = 'enable';
  showBatchOperationModal.value = true;
};

const handleBatchDeleteChannels = () => {
  if (selectedDisabledChannels.value.length === 0) {
    message.warning('请选择要删除的通道');
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
  const start = new Date(statsFilters.startDate).toLocaleDateString('zh-CN');
  const end = new Date(statsFilters.endDate).toLocaleDateString('zh-CN');
  return `${start} - ${end}`;
};

const fetchStatsData = async () => {
  statsTableLoading.value = true;
  try {
    console.log('📊 Fetching statistics data...');

    if (!statsFilters.startDate || !statsFilters.endDate) {
      message.warning('请选择日期范围');
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
    message.error('获取统计数据失败');
    statsTableData.value = [];
    statsPaginationConfig.value.itemCount = 0;
  } finally {
    statsTableLoading.value = false;
  }
};

const handleStatsSearch = () => {
  console.log('🔍 Stats search triggered with filters:', statsFilters);
  if (!statsFilters.startDate || !statsFilters.endDate) {
    message.warning('请选择开始和结束日期');
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
    message.warning('请先选择日期范围');
    return;
  }
  fetchStatsData();
};

const handleExportStats = () => {
  if (statsTableData.value.length === 0) {
    message.warning('暂无数据可导出');
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

  message.success('统计报表已导出');
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
const COLUMN_CONFIG_KEY = 'recharge-order-columns-config';

// Define all available columns with their default visibility (完整的39列配置)
const columnConfigList = ref([
  // 🔥 基础信息列
  { key: 'orderId', title: '订单号', visible: true },
  { key: 'memberAccount', title: '会员账号', visible: true },
  { key: 'firstDepositStatus', title: '首充状态', visible: true },
  { key: 'memberName', title: '会员姓名', visible: false },
  { key: 'memberId', title: '会员ID', visible: false },
  { key: 'vipLevel', title: 'VIP等级', visible: true },

  // 🔥 用户要求的关键列 - 金额相关
  { key: 'exchangeRate', title: '汇率', visible: true },
  { key: 'currency', title: '会员币种', visible: true },
  { key: 'rechargeAmount', title: '订单金额', visible: true },
  { key: 'bonusAmount', title: '赠送金额', visible: true },
  { key: 'feeAmount', title: '手续费', visible: true },
  { key: 'totalCreditAmount', title: '总上分金额', visible: true },
  { key: 'actualAmount', title: '实际金额', visible: false },
  { key: 'platformFee', title: '平台手续费', visible: false },
  { key: 'discountAmount', title: '优惠金额', visible: false },

  // 🔥 用户要求的关键列 - 支付和通道
  { key: 'thirdPartyPayment', title: '第三方支付', visible: true },
  { key: 'channelName', title: '通道名称', visible: true },
  { key: 'channelFeeRate', title: '通道费率', visible: true },
  { key: 'status', title: '订单状态', visible: true },

  // 🔥 币种和汇率
  { key: 'channelCurrency', title: '通道币种', visible: false },
  { key: 'channelAmount', title: '通道金额', visible: false },
  { key: 'conversionRatio', title: '转换比例', visible: false },

  // 技术信息
  { key: 'channelCode', title: '通道代码', visible: false },
  { key: 'merchantId', title: '商户ID', visible: false },
  { key: 'orderType', title: '订单类型', visible: false },

  // 时间信息
  { key: 'submitTime', title: '提交时间', visible: true },
  { key: 'paymentTime', title: '支付时间', visible: false },
  { key: 'completeTime', title: '完成时间', visible: false },
  { key: 'notifyTime', title: '通知时间', visible: false },
  { key: 'createdAt', title: '创建时间', visible: true },
  { key: 'updatedAt', title: '更新时间', visible: true },

  // 余额信息
  { key: 'balanceBefore', title: '充值前余额', visible: false },
  { key: 'balanceAfter', title: '充值后余额', visible: false },

  // 用户相关
  { key: 'user.balance', title: '用户余额', visible: false },
  { key: 'user.email', title: '用户邮箱', visible: false },
  { key: 'user.currency', title: '用户币种', visible: false },
  { key: 'user.vipLevel.name', title: 'VIP等级名称', visible: false },
  { key: 'user.memberTier.tierName', title: '会员层级', visible: true },

  // 其他
  { key: 'categoryId', title: '分类ID', visible: false },
]);

// Load column configuration from database
const loadColumnConfig = async () => {
  try {
    const response = await requestClient.get(
      `/backoffice/preferences/${COLUMN_CONFIG_KEY}`,
    );

    if (response && response.preferenceValue) {
      const savedConfig = response.preferenceValue;
      columnConfigList.value.forEach((col) => {
        const savedCol = savedConfig.find((s: any) => s.key === col.key);
        if (savedCol) {
          col.visible = savedCol.visible;
        }
      });
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
    await requestClient.put(`/backoffice/preferences/${COLUMN_CONFIG_KEY}`, {
      preferenceValue: columnConfigList.value,
    });
    message.success('列配置已保存');
    showColumnConfig.value = false;
    console.log('✅ Column configuration saved to database');
  } catch (error) {
    console.error('Failed to save column configuration:', error);
    message.error('保存列配置失败');
  }
};

// Reset column configuration to default
const resetColumnConfig = async () => {
  try {
    // Reset to smart defaults (important columns visible, others hidden)
    const defaultVisible = [
      'orderId',
      'memberAccount',
      'firstDepositStatus',
      'vipLevel',
      'exchangeRate',
      'currency',
      'rechargeAmount',
      'bonusAmount',
      'feeAmount',
      'totalCreditAmount',
      'thirdPartyPayment',
      'channelName',
      'channelFeeRate',
      'status',
      'submitTime',
      'createdAt',
      'updatedAt',
      'user.memberTier.tierName',
    ];

    columnConfigList.value.forEach((col) => {
      col.visible = defaultVisible.includes(col.key);
    });

    // Delete from database
    await requestClient.delete(`/backoffice/preferences/${COLUMN_CONFIG_KEY}`);
    message.success('列配置已重置为默认显示');
    console.log('✅ Column configuration reset to smart defaults');
  } catch (error) {
    // Even if delete fails, reset locally to smart defaults
    const defaultVisible = [
      'orderId',
      'memberAccount',
      'firstDepositStatus',
      'vipLevel',
      'exchangeRate',
      'currency',
      'rechargeAmount',
      'bonusAmount',
      'feeAmount',
      'totalCreditAmount',
      'thirdPartyPayment',
      'channelName',
      'channelFeeRate',
      'status',
      'submitTime',
      'createdAt',
      'updatedAt',
      'user.memberTier.tierName',
    ];

    columnConfigList.value.forEach((col) => {
      col.visible = defaultVisible.includes(col.key);
    });

    message.success('列配置已重置为默认显示');
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
