<template>
  <div class="withdraw-management">
    <!-- Tab Navigation -->
    <n-tabs v-model:value="activeTab" type="line" class="mb-4">
      <n-tab-pane name="risk-review" tab="风控审核">
        <template #tab>
          <span class="flex items-center gap-2">
            风控审核
            <n-badge
              :value="riskReviewCount"
              :max="99"
              type="error"
              v-if="riskReviewCount > 0"
            />
          </span>
        </template>
        <RiskControlReview @refresh-tabs="handleRefreshTabs" />
      </n-tab-pane>

      <n-tab-pane name="my-risk" tab="由我风控">
        <template #tab>
          <span class="flex items-center gap-2">
            由我风控
            <n-badge
              :value="myRiskCount"
              :max="99"
              type="error"
              v-if="myRiskCount > 0"
            />
          </span>
        </template>
        <RiskControlReview
          :is-my-risk="true"
          @refresh-tabs="handleRefreshTabs"
        />
      </n-tab-pane>

      <n-tab-pane name="finance-withdrawal" tab="财务出款">
        <template #tab>
          <span class="flex items-center gap-2">
            财务出款
            <n-badge
              :value="financeCount"
              :max="99"
              type="error"
              v-if="financeCount > 0"
            />
          </span>
        </template>
        <FinanceWithdrawal @refresh-tabs="handleRefreshTabs" />
      </n-tab-pane>

      <n-tab-pane name="my-withdrawal" tab="由我出款">
        <template #tab>
          <span class="flex items-center gap-2">
            由我出款
            <n-badge
              :value="myWithdrawalCount"
              :max="99"
              type="error"
              v-if="myWithdrawalCount > 0"
            />
          </span>
        </template>
        <FinanceWithdrawal
          :is-my-withdrawal="true"
          @refresh-tabs="handleRefreshTabs"
        />
      </n-tab-pane>

      <n-tab-pane name="re-payment" tab="重新代付">
        <RePayment />
      </n-tab-pane>

      <n-tab-pane name="auto-withdrawal" tab="免审出款">
        <template #tab>
          <span class="flex items-center gap-2">
            免审出款
            <n-badge :value="autoApprovalCount" :max="99" type="success" />
          </span>
        </template>
        <AutoWithdrawal />
      </n-tab-pane>

      <n-tab-pane name="all-withdrawals" tab="全部提现">
        <!-- Filter Section -->
        <n-card class="mb-4">
          <n-form
            ref="filterFormRef"
            :model="filterForm"
            label-placement="left"
            label-width="auto"
            class="mb-4"
          >
            <!-- First row - Date and Status filters -->
            <div
              class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <n-form-item label="日期范围" class="col-span-1 md:col-span-2">
                <n-space vertical size="small" class="w-full">
                  <n-date-picker
                    v-model:value="filterForm.dateRange"
                    type="datetimerange"
                    clearable
                    format="yyyy-MM-dd HH:mm:ss"
                    :shortcuts="dateShortcuts"
                    class="w-full"
                  />
                 
                </n-space>
              </n-form-item>

              <n-form-item label="提现状态">
                <n-select
                  v-model:value="filterForm.status"
                  :options="statusOptions"
                  placeholder="请选择状态"
                  clearable
                  class="w-full"
                />
              </n-form-item>

              <n-form-item label="提现方式">
                <n-select
                  v-model:value="filterForm.withdrawMethod"
                  :options="withdrawMethodOptions"
                  placeholder="请选择提现方式"
                  clearable
                  class="w-full"
                />
              </n-form-item>
            </div>

            <!-- Second row - Member and Agent filters -->
            <div
              class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <n-form-item label="会员层级">
                <n-select
                  v-model:value="filterForm.vipLevel"
                  :options="vipLevelOptions"
                  placeholder="请选择会员等级"
                  clearable
                  class="w-full"
                />
              </n-form-item>

              <n-form-item label="代理模式">
                <n-select
                  v-model:value="filterForm.agentMode"
                  :options="agentModeOptions"
                  placeholder="请选择代理模式"
                  clearable
                  class="w-full"
                />
              </n-form-item>

              <n-form-item label="三方代付">
                <n-select
                  v-model:value="filterForm.thirdPartyPayment"
                  :options="thirdPartyOptions"
                  placeholder="请选择三方代付"
                  clearable
                  class="w-full"
                />
              </n-form-item>

              <n-form-item label="服务筛选">
                <n-select
                  v-model:value="filterForm.serviceFilter"
                  :options="serviceFilterOptions"
                  placeholder="请选择服务筛选"
                  clearable
                  class="w-full"
                />
              </n-form-item>
            </div>

            <!-- Third row - Search and Actions -->
            <div class="flex flex-wrap items-end gap-4">
              <n-form-item label="搜索" class="min-w-[300px] flex-1">
                <n-input
                  v-model:value="searchInput"
                  placeholder="订单号/会员ID/会员账号"
                  clearable
                  class="w-full"
                  @keyup.enter="handleSearch"
                />
              </n-form-item>

              <n-form-item class="flex-shrink-0">
                <n-space>
                  <n-button type="primary" @click="handleSearch">搜索</n-button>
                  <n-button @click="handleAdvancedSearch">高级搜索</n-button>
                  <n-button @click="handleResetFilters">重置</n-button>
                </n-space>
              </n-form-item>
            </div>
          </n-form>

          <!-- Action Buttons -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <n-button type="primary" @click="handleCreateWithdrawal">
                新建提现
              </n-button>
              <n-button
                type="primary"
                :disabled="!checkedRowKeys.length"
                @click="handleBatchOperation"
              >
                批量操作 ({{ checkedRowKeys.length }})
              </n-button>
              <n-button @click="handleExport">导出</n-button>
              <n-button @click="fetchData">刷新</n-button>
              <n-button @click="showColumnConfig = true">
                <template #icon>
                  <n-icon><Settings /></n-icon>
                </template>
                自定义列表
              </n-button>
              <!-- 🚀 NEW: SmartAutoRefresh Component -->
              <SmartAutoRefresh
                v-model="autoRefreshEnabled"
                :intervals="[15, 30, 60, 120]"
                :default-interval="30"
                :on-refresh="fetchData"
                @interval-change="handleRefreshIntervalChange"
              />
            </div>

            <!-- Summary -->
            <div class="flex items-center gap-4">
              <n-text depth="3">总计: {{ summary.totalCount }} 条</n-text>
              <n-text depth="3">
                总提现金额:
                <strong class="text-red-600">{{
                  formatCurrency(summary.totalAmount)
                }}</strong>
              </n-text>
            </div>
          </div>
        </n-card>

        <!-- SmartDataGrid -->
        <SmartDataGrid
          :data="tableData"
          :columns="visibleColumns"
          :loading="loading"
          :pagination="paginationReactive"
          selectable
          :selected-keys="checkedRowKeys"
          row-key="orderId"
          :scroll-x="2300"
          striped
          remote
          @update:selected-keys="checkedRowKeys = $event"
          @update:page="handleAllWithdrawalsPageChange"
          @update:page-size="handleAllWithdrawalsPageSizeChange"
          @refresh="fetchAllWithdrawalsData"
          @row-click="handleAllWithdrawalsRowClick"
        >
          <template #actionBar="{ selectedCount, selectedRows }">
            <n-card :bordered="false" class="rounded-16px shadow-sm">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <!-- 主要操作按钮 -->
                  <div class="flex gap-2">
                    <n-button
                      type="primary"
                      @click="fetchAllWithdrawalsData"
                      :loading="loading"
                    >
                      <template #icon>
                        <n-icon><ReloadOutline /></n-icon>
                      </template>
                      刷新
                    </n-button>
                    <n-button type="success" @click="showCreateWithdrawalModal">
                      <template #icon>
                        <n-icon><AddOutline /></n-icon>
                      </template>
                      新建提现订单
                    </n-button>
                    <n-button type="info" @click="handleExportAllWithdrawals">
                      <template #icon>
                        <n-icon><DownloadOutline /></n-icon>
                      </template>
                      导出数据
                    </n-button>
                  </div>

                  <!-- 全选当前页 + 批量操作 dropdown (match screenshot) -->
                  <n-checkbox
                    :checked="isAllCurrentPageSelected"
                    :indeterminate="isCurrentPageIndeterminate"
                    @update:checked="toggleSelectAllCurrentPage"
                  >
                    全选当前页
                  </n-checkbox>
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
                    >已选择 {{ selectedCount }} 条数据</span
                  >
                  <span class="text-sm text-gray-600"
                    >共 {{ paginationReactive.total }} 条</span
                  >
                  <n-tag type="info" size="small">全部提现</n-tag>
                </div>

                <div class="flex items-center gap-4">
                  <!-- 选择控制 -->
                  <div class="flex gap-2">
                    <n-button size="small" @click="clearAllWithdrawalsSelection"
                      >清空选择</n-button
                    >
                    <n-button size="small" @click="selectAllWithdrawals"
                      >全选</n-button
                    >
                  </div>
                </div>
              </div>
            </n-card>
          </template>
        </SmartDataGrid>
      </n-tab-pane>

      <n-tab-pane name="withdrawal-settings" tab="提现设置">
        <WithdrawalSettings />
      </n-tab-pane>

      <n-tab-pane name="third-party-payment" tab="三方代付">
        <ThirdPartyPayment />
      </n-tab-pane>

      <n-tab-pane name="payment-statistics" tab="代付统计">
        <PaymentStatistics />
      </n-tab-pane>
    </n-tabs>

    <!-- Create/Edit Withdrawal Modal -->
    <n-modal
      v-model:show="showWithdrawalModal"
      preset="card"
      :title="isEditing ? '编辑提现订单' : '新建提现订单'"
      style="width: 500px"
      :mask-closable="false"
    >
      <div class="withdrawal-modal-content">
        <!-- Member Search Section - Only show when no member selected or editing -->
        <div v-if="!selectedMember || isEditing" class="member-search-section">
          <div class="mb-2">
            <h3 class="mb-2 text-lg font-medium text-gray-800">
              步骤 1: 搜索会员
            </h3>
            <p class="mb-4 text-sm text-gray-600">请输入会员账号进行搜索</p>
          </div>
          <div class="mb-4 flex gap-2">
            <n-select
              v-model:value="searchType"
              :options="[{ label: '会员账号', value: 'account' }]"
              style="width: 120px"
              :disabled="isEditing"
            />
            <n-input
              v-model:value="memberSearchQuery"
              placeholder="例如: shayu888"
              :disabled="isEditing"
              style="flex: 1"
              maxlength="16"
              show-count
              @keyup.enter="() => handleMemberSearch(memberSearchQuery)"
              clearable
            />
            <n-button
              type="primary"
              @click="() => handleMemberSearch(memberSearchQuery)"
              :loading="memberLoading"
              :disabled="isEditing || !memberSearchQuery.trim()"
            >
              搜索
            </n-button>
          </div>
          <p class="text-xs text-gray-500">
            提示: 输入完成后按 Enter 键或点击搜索按钮
          </p>
        </div>

        <!-- Member Info Display - Show when member is selected -->
        <div v-if="selectedMember" class="member-info-section mb-6">
          <div class="mb-2">
            <h3 class="mb-2 text-lg font-medium text-gray-800">
              ✅ 步骤 1: 会员信息确认
            </h3>
          </div>
          <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div class="mb-2 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <span class="text-sm text-gray-600"
                  >会员ID: <strong>{{ selectedMember.value }}</strong></span
                >
                <span class="text-sm text-gray-600"
                  >会员账号: <strong>{{ selectedMember.account }}</strong></span
                >
                <span class="text-sm text-gray-600"
                  >币种:
                  <strong>{{ selectedMember.currency || 'BRL' }}</strong></span
                >
              </div>
              <n-button
                v-if="!isEditing"
                size="small"
                @click="handleMemberClear"
                type="tertiary"
              >
                重新选择
              </n-button>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">账户余额:</span>
              <div class="flex items-center gap-2">
                <span class="text-xl font-medium text-green-600">{{
                  formatBalance(selectedMember.balance)
                }}</span>
                <span class="text-gray-500">{{
                  selectedMember.currency || 'BRL'
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Section - Only show when member is selected -->
        <div v-if="selectedMember" class="withdrawal-form-section">
          <div class="mb-4">
            <h3 class="mb-2 text-lg font-medium text-gray-800">
              步骤 2: 填写提现信息
            </h3>
            <p class="text-sm text-gray-600">请填写提现相关信息</p>
          </div>
          <n-form
            ref="withdrawalFormRef"
            :model="withdrawalForm"
            :rules="withdrawalRules"
          >
            <!-- Withdrawal Method -->
            <div class="form-row mb-4">
              <label class="form-label required">提现方式</label>
              <n-select
                v-model:value="withdrawalForm.withdrawMethod"
                :options="withdrawMethodOptions"
                placeholder="请选择提现方式"
                style="width: 100%"
              />
            </div>

            <!-- Withdrawal Account -->
            <div class="form-row mb-4">
              <label class="form-label required">提现账号</label>
              <n-select
                v-model:value="withdrawalForm.withdrawAccount"
                :options="withdrawAccountOptions"
                placeholder="请选择提现账号"
                style="width: 100%"
              />
            </div>

            <!-- Withdrawal Amount -->
            <div class="form-row mb-4">
              <label class="form-label required">提现金额</label>
              <n-input-group>
                <n-input-group-label style="background: #f5f5f5"
                  >R$</n-input-group-label
                >
                <n-input-number
                  v-model:value="withdrawalForm.amount"
                  placeholder="请输入要提现金额"
                  :min="0"
                  :precision="2"
                  style="flex: 1"
                  :show-button="false"
                />
              </n-input-group>
            </div>

            <!-- Frontend Notes -->
            <div class="form-row mb-4">
              <label class="form-label">前台备注</label>
              <n-input
                v-model:value="withdrawalForm.frontendNote"
                type="textarea"
                placeholder="请输入显示在客户端的备注"
                :autosize="{ minRows: 2, maxRows: 4 }"
                maxlength="1000"
                show-count
              />
            </div>

            <!-- Backend Notes -->
            <div class="form-row mb-4">
              <label class="form-label">后台备注</label>
              <n-input
                v-model:value="withdrawalForm.backendNote"
                type="textarea"
                placeholder="请输入显示在管理后台的备注"
                :autosize="{ minRows: 2, maxRows: 4 }"
                maxlength="1000"
                show-count
              />
            </div>

            <!-- Verification Password -->
            <div class="form-row mb-6">
              <label class="form-label required">验证密码</label>
              <n-input
                v-model:value="withdrawalForm.verificationPassword"
                type="password"
                placeholder="请输入您的登录密码"
                show-password-on="click"
              />
            </div>
          </n-form>

          <!-- Action Buttons -->
          <div class="action-buttons mt-6 flex justify-center gap-4">
            <n-button @click="handleCancelWithdrawal" style="width: 100px">
              取消
            </n-button>
            <n-button
              type="primary"
              @click="handleSubmitWithdrawal"
              :loading="modalLoading"
              style="width: 100px"
            >
              确认
            </n-button>
          </div>
        </div>

        <!-- Cancel button - always available when no member selected -->
        <div
          v-if="!selectedMember"
          class="action-buttons mt-6 flex justify-center"
        >
          <n-button @click="handleCancelWithdrawal" style="width: 100px">
            取消
          </n-button>
        </div>
      </div>
    </n-modal>

    <!-- Note Modal -->
    <n-modal
      v-model:show="showNoteModal"
      preset="dialog"
      title="编辑备注"
      positive-text="保存"
      negative-text="取消"
      @positive-click="handleSaveNote"
      @negative-click="showNoteModal = false"
    >
      <n-form ref="noteFormRef" :model="noteForm" :rules="noteRules">
        <n-form-item label="备注类型" path="type">
          <n-select
            v-model:value="noteForm.type"
            :options="noteTypeOptions"
            placeholder="请选择备注类型"
          />
        </n-form-item>
        <n-form-item label="备注内容" path="content">
          <n-input
            v-model:value="noteForm.content"
            type="textarea"
            placeholder="请输入备注内容"
            :autosize="{ minRows: 3 }"
          />
        </n-form-item>
      </n-form>
    </n-modal>

    <!-- Batch Operation Modal (legacy: 全部提现顶部按钮打开) -->
    <n-modal
      v-model:show="showBatchModal"
      preset="dialog"
      title="批量操作"
      positive-text="确认"
      negative-text="取消"
      @positive-click="handleConfirmBatch"
      @negative-click="showBatchModal = false"
    >
      <n-form ref="batchFormRef" :model="batchForm" :rules="batchRules">
        <n-form-item label="操作类型" path="action">
          <n-select
            v-model:value="batchForm.action"
            :options="batchActionOptions"
            placeholder="请选择操作类型"
          />
        </n-form-item>
        <n-form-item
          v-if="batchForm.action === 'update-status'"
          label="新状态"
          path="status"
        >
          <n-select
            v-model:value="batchForm.status"
            :options="statusOptions.filter((opt) => opt.value !== '')"
            placeholder="请选择新状态"
          />
        </n-form-item>
        <n-form-item label="操作说明" path="reason">
          <n-input
            v-model:value="batchForm.reason"
            type="textarea"
            placeholder="请输入操作说明"
            :autosize="{ minRows: 3 }"
          />
        </n-form-item>
      </n-form>
    </n-modal>

    <!-- 批量操作 - 填写原因（强制取消/强制拒绝/批量备注） -->
    <n-modal
      v-model:show="batchReasonModal.show"
      preset="dialog"
      title="操作说明"
      positive-text="确认"
      negative-text="取消"
      @positive-click="submitBatchReasonModal"
    >
      <n-input
        v-model:value="batchReasonModal.reason"
        type="textarea"
        placeholder="请输入操作说明（必填）"
        :autosize="{ minRows: 3 }"
      />
    </n-modal>

    <!-- Force Reject Modal (强制拒绝) - same as screenshot -->
    <n-modal
      v-model:show="batchForceRejectModal.show"
      preset="card"
      :title="
        batchForceRejectModal.batchOrderIds?.length
          ? `强制拒绝 (共 ${batchForceRejectModal.batchOrderIds.length} 笔待出款)`
          : '强制拒绝'
      "
      :style="{ width: 'min(90vw, 800px)' }"
      :closable="true"
      :mask-closable="false"
    >
      <div class="force-reject-modal">
        <!-- Order info: single row only; hide for batch -->
        <div
          v-if="
            batchForceRejectModal.data &&
            (!batchForceRejectModal.batchOrderIds ||
              batchForceRejectModal.batchOrderIds.length <= 1)
          "
          class="order-info mb-6"
        >
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-gray-600">订单号：</span>
              <span>{{ batchForceRejectModal.data.orderId }}</span>
            </div>
            <div>
              <span class="text-gray-600">会员ID：</span>
              <span class="text-blue-600">{{ batchForceRejectModal.data.memberId }}</span>
            </div>
            <div>
              <span class="text-gray-600">会员账号：</span>
              <span>{{ batchForceRejectModal.data.accountName }}</span>
            </div>
            <div>
              <span class="text-gray-600">会员层级：</span>
              <span>{{ batchForceRejectModal.data.memberTag || '-' }}</span>
            </div>
            <div>
              <span class="text-gray-600">提现金额：</span>
              <span class="font-semibold text-green-600"
                >{{ batchForceRejectModal.data.withdrawAmount }} {{ batchForceRejectModal.data.currency }}</span
              >
            </div>
            <div>
              <span class="text-gray-600">手续费：</span>
              <span>{{ batchForceRejectModal.data.fee ?? 0 }} {{ batchForceRejectModal.data.currency }}</span>
            </div>
          </div>
          <div class="mt-3 text-sm">
            <span class="text-gray-600">实际到账：</span>
            <span class="font-semibold"
              >{{ batchForceRejectModal.data.estimatedReceived ?? batchForceRejectModal.data.withdrawAmount }} {{ batchForceRejectModal.data.currency }}</span
            >
          </div>
        </div>
        <div class="mb-6">
          <div class="mb-3 flex items-center gap-4">
            <span class="text-sm font-medium">是否风控处理</span>
            <n-radio-group v-model:value="batchForceRejectModal.windControlProcess">
              <n-radio value="no">不处理</n-radio>
              <n-radio value="add_audit">增加稽核任务</n-radio>
              <n-radio value="deduct_balance">扣除余额</n-radio>
            </n-radio-group>
          </div>
          <div
            v-if="batchForceRejectModal.windControlProcess === 'add_audit'"
            class="mb-4"
          >
            <div class="mb-2 flex items-center gap-2">
              <span class="text-sm font-medium">增加稽核任务</span>
              <n-input-number
                v-model:value="batchForceRejectModal.auditMultiplier"
                :min="1"
                :max="100"
                :step="1"
                class="w-24"
              />
              <span class="text-sm">倍</span>
            </div>
            <div class="mb-3 text-sm text-gray-600">
              即需要再打码 {{ batchForceRejectModal.auditMultiplier * 30.0 }} 才能再次提现
            </div>
          </div>
        </div>
        <div class="mb-6">
          <div class="mb-3 text-sm font-medium">指定稽核平台</div>
          <div class="platform-grid max-h-80 overflow-y-auto rounded-lg border bg-gray-50 p-4">
            <div class="grid grid-cols-2 gap-3">
              <div
                class="platform-card flex cursor-pointer items-center rounded-lg border bg-white p-3"
                :class="{ 'border-blue-500 bg-blue-50': batchForceRejectModal.platforms.all }"
                @click="batchForceRejectModal.platforms.all = !batchForceRejectModal.platforms.all"
              >
                <div class="mr-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <span class="text-2xl">🎮</span>
                </div>
                <div class="flex-1">
                  <div class="font-medium text-gray-900">全部平台</div>
                  <div class="text-sm text-gray-500">ALL • {{ batchForceRejectPlatforms.length }} 个平台</div>
                </div>
                <n-checkbox
                  :checked="batchForceRejectModal.platforms.all"
                  @click.stop
                  @update:checked="(c: boolean) => (batchForceRejectModal.platforms.all = c)"
                />
              </div>
              <div
                v-for="p in batchForceRejectPlatforms"
                :key="p.platformId"
                class="platform-card flex cursor-pointer items-center rounded-lg border bg-white p-3"
                :class="{ 'border-blue-500 bg-blue-50': batchForceRejectModal.platforms[p.platformId] }"
                @click="toggleBatchForceRejectPlatform(p.platformId)"
              >
                <div class="mr-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200">
                  <span class="text-sm font-bold">{{ p.platformId?.substring(0, 2) || '?' }}</span>
                </div>
                <div class="flex-1">
                  <div class="font-medium text-gray-900">{{ p.platformName }}</div>
                  <div class="text-sm text-gray-500">{{ (p.gameType || '').toUpperCase() }} • {{ p.gameCount || 0 }} 个游戏</div>
                </div>
                <n-checkbox
                  :checked="!!batchForceRejectModal.platforms[p.platformId]"
                  @click.stop
                  @update:checked="(c: boolean) => (batchForceRejectModal.platforms[p.platformId] = c)"
                />
              </div>
            </div>
          </div>
          <div class="mt-3 rounded bg-yellow-50 p-3 text-sm text-gray-600">
            提示：若此处勾选指定稽核但游戏管理选择稽核排除，则仍会被排除，即冲突时以游戏管理为准
          </div>
        </div>
        <div class="mb-6 grid grid-cols-2 gap-6">
          <div>
            <label class="mb-2 block text-sm font-medium">拒绝前台原因</label>
            <n-input
              v-model:value="batchForceRejectModal.frontendReason"
              type="textarea"
              placeholder="请输入拒绝前台原因"
              :rows="4"
              :maxlength="1000"
            />
            <div class="mt-1 text-right text-xs text-gray-500">
              {{ batchForceRejectModal.frontendReason.length }}/1000
            </div>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">拒绝后台原因</label>
            <n-input
              v-model:value="batchForceRejectModal.backendReason"
              type="textarea"
              placeholder="请输入拒绝后台原因"
              :rows="4"
              :maxlength="1000"
            />
            <div class="mt-1 text-right text-xs text-gray-500">
              {{ batchForceRejectModal.backendReason.length }}/1000
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-3">
          <n-button @click="batchForceRejectModal.show = false">取消</n-button>
          <n-button
            type="primary"
            :loading="batchForceRejectModal.loading"
            @click="submitBatchForceReject"
          >
            确认
          </n-button>
        </div>
      </div>
    </n-modal>

    <!-- Withdrawal Detail Modal -->
    <n-modal
      v-model:show="showDetailModal"
      preset="card"
      title="提现详情"
      size="large"
      :style="{ width: '80%', maxWidth: '1200px' }"
    >
      <div v-if="detailModalData" class="space-y-6">
        <!-- Member Personal Information -->
        <n-card title="会员个人信息" :bordered="false" class="shadow-sm">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="info-item">
              <span class="info-label">订单号</span>
              <div class="info-value-with-copy">
                <span class="info-value">{{ detailModalData.orderId }}</span>
                <n-button
                  text
                  @click="copyToClipboard(detailModalData.orderId, '订单号')"
                  class="copy-btn"
                >
                  <template #icon>
                    <n-icon><CopyOutline /></n-icon>
                  </template>
                </n-button>
              </div>
            </div>
            <div class="info-item">
              <span class="info-label">会员账号</span>
              <div class="info-value-with-copy">
                <span class="info-value">{{
                  detailModalData.accountName
                }}</span>
                <n-button
                  text
                  @click="
                    copyToClipboard(detailModalData.accountName, '会员账号')
                  "
                  class="copy-btn"
                >
                  <template #icon>
                    <n-icon><CopyOutline /></n-icon>
                  </template>
                </n-button>
              </div>
            </div>
            <div class="info-item">
              <span class="info-label">会员ID</span>
              <span class="info-value">{{ detailModalData.memberId }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">会员币种</span>
              <span class="info-value">{{ detailModalData.currency }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">会员层级</span>
              <span class="info-value">{{
                detailModalData.memberTierName || '默认层级'
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">VIP等级</span>
              <span class="info-value">
                <n-tag type="info" size="small">{{
                  detailModalData.vipLevel || 'VIP0'
                }}</n-tag>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">三方商户订单号</span>
              <span class="info-value font-mono text-xs">{{
                detailModalData.thirdPartyOrderNo || '-'
              }}</span>
            </div>
          </div>
        </n-card>

        <!-- Withdrawal Account Information -->
        <n-card title="提现账户信息" :bordered="false" class="shadow-sm">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="info-item">
              <span class="info-label">提现方式</span>
              <span class="info-value">{{
                detailModalData.withdrawChannelInfo?.type || 'PIX'
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">真实姓名</span>
              <div class="info-value-with-copy">
                <span class="info-value">{{
                  detailModalData.withdrawChannelInfo?.name || '-'
                }}</span>
                <n-button
                  text
                  @click="
                    copyToClipboard(
                      detailModalData.withdrawChannelInfo?.name,
                      '真实姓名',
                    )
                  "
                  class="copy-btn"
                >
                  <template #icon>
                    <n-icon><CopyOutline /></n-icon>
                  </template>
                </n-button>
              </div>
            </div>
            <div class="info-item">
              <span class="info-label">账号/地址</span>
              <div class="info-value-with-copy">
                <span class="info-value">{{
                  detailModalData.withdrawChannelInfo?.account || '-'
                }}</span>
                <n-button
                  text
                  @click="
                    copyToClipboard(
                      detailModalData.withdrawChannelInfo?.account,
                      '账号/地址',
                    )
                  "
                  class="copy-btn"
                >
                  <template #icon>
                    <n-icon><CopyOutline /></n-icon>
                  </template>
                </n-button>
              </div>
            </div>
            <div class="info-item">
              <span class="info-label">类型</span>
              <span class="info-value">{{
                detailModalData.withdrawChannelInfo?.cpf ? 'CPF' : 'CPF'
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">CPF</span>
              <div class="info-value-with-copy">
                <span class="info-value">{{
                  detailModalData.withdrawChannelInfo?.cpf || '-'
                }}</span>
                <n-button
                  text
                  @click="
                    copyToClipboard(
                      detailModalData.withdrawChannelInfo?.cpf,
                      'CPF',
                    )
                  "
                  class="copy-btn"
                >
                  <template #icon>
                    <n-icon><CopyOutline /></n-icon>
                  </template>
                </n-button>
              </div>
            </div>
          </div>
        </n-card>

        <!-- Withdrawal Amount Information -->
        <n-card title="提现金额信息" :bordered="false" class="shadow-sm">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="info-item">
              <span class="info-label">提现金额</span>
              <div class="info-value-with-copy">
                <span class="info-value font-semibold text-red-600">{{
                  formatCurrency(
                    detailModalData.withdrawAmount || detailModalData.amount,
                  )
                }}</span>
                <n-button
                  text
                  @click="
                    copyToClipboard(
                      String(
                        detailModalData.withdrawAmount ||
                          detailModalData.amount,
                      ),
                      '提现金额',
                    )
                  "
                  class="copy-btn"
                >
                  <template #icon>
                    <n-icon><CopyOutline /></n-icon>
                  </template>
                </n-button>
              </div>
            </div>
            <div class="info-item">
              <span class="info-label">手续费</span>
              <div class="info-value-with-copy">
                <span class="info-value">{{
                  formatCurrency(detailModalData.fee || 0)
                }}</span>
                <n-button
                  text
                  @click="
                    copyToClipboard(String(detailModalData.fee || 0), '手续费')
                  "
                  class="copy-btn"
                >
                  <template #icon>
                    <n-icon><CopyOutline /></n-icon>
                  </template>
                </n-button>
              </div>
            </div>
            <div class="info-item">
              <span class="info-label">预计到账</span>
              <div class="info-value-with-copy">
                <span class="info-value font-semibold text-green-600">{{
                  formatCurrency(
                    detailModalData.estimatedReceived ||
                      detailModalData.estimatedAmount ||
                      0,
                  )
                }}</span>
                <n-button
                  text
                  @click="
                    copyToClipboard(
                      String(
                        detailModalData.estimatedReceived ||
                          detailModalData.estimatedAmount ||
                          0,
                      ),
                      '预计到账',
                    )
                  "
                  class="copy-btn"
                >
                  <template #icon>
                    <n-icon><CopyOutline /></n-icon>
                  </template>
                </n-button>
              </div>
            </div>
            <div class="info-item">
              <span class="info-label">实际到账</span>
              <div class="info-value-with-copy">
                <span class="info-value">{{
                  formatCurrency(detailModalData.estimatedReceived || 0)
                }}</span>
                <n-button
                  text
                  @click="
                    copyToClipboard(
                      String(detailModalData.estimatedReceived || 0),
                      '实际到账',
                    )
                  "
                  class="copy-btn"
                >
                  <template #icon>
                    <n-icon><CopyOutline /></n-icon>
                  </template>
                </n-button>
              </div>
            </div>
            <div class="info-item">
              <span class="info-label">到账币种汇率</span>
              <span class="info-value"
                >{{ detailModalData.currency }} ({{
                  detailModalData.exchangeRate || '0.05'
                }})</span
              >
            </div>
          </div>
        </n-card>

        <!-- Other Information -->
        <n-card title="其他信息" :bordered="false" class="shadow-sm">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="info-item">
              <span class="info-label">操作人</span>
              <span class="info-value">{{
                detailModalData.reviewer || '-'
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">操作时间</span>
              <span class="info-value">{{
                formatDateTime(
                  detailModalData.updatedAt || detailModalData.createdAt,
                )
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">申请时间</span>
              <span class="info-value">{{
                formatDateTime(
                  detailModalData.appliedAt || detailModalData.createdAt,
                )
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">充 / 提次数</span>
              <span class="info-value"
                >充{{
                  detailModalData.rechargeWithdrawCount?.rechargeCount || 0
                }}次 / 提{{
                  detailModalData.rechargeWithdrawCount?.withdrawCount || 0
                }}次</span
              >
            </div>
            <div class="info-item col-span-2">
              <span class="info-label">累计充 / 提差额</span>
              <span
                class="info-value"
                :class="
                  (detailModalData.totalDeposit || 0) -
                    (detailModalData.totalWithdraw || 0) >=
                  0
                    ? 'text-green-600'
                    : 'text-red-600'
                "
              >
                {{
                  formatCurrency(
                    (detailModalData.totalDeposit || 0) -
                      (detailModalData.totalWithdraw || 0),
                  )
                }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">重复IP人数</span>
              <span class="info-value text-orange-600"
                >{{
                  detailModalData.rechargeWithdrawCount?.duplicateIP || 0
                }}人</span
              >
            </div>
          </div>
        </n-card>

        <!-- Three-party Payment -->
        <n-card title="三方代付" :bordered="false" class="shadow-sm">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="info-item">
              <span class="info-label">三方代付</span>
              <span class="info-value">{{
                detailModalData.paymentGateway || 'Pay4z'
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">代付次数</span>
              <span class="info-value">{{
                detailModalData.withdrawCount || 1
              }}</span>
            </div>
          </div>
        </n-card>
      </div>
    </n-modal>

    <!-- Member Detail Modal - Reuse existing UserDetailModal component -->
    <UserDetailModal
      v-model:visible="showMemberDetailModal"
      :user-id="currentMemberUserId"
    />

    <!-- Column Configuration Modal -->
    <n-modal
      v-model:show="showColumnConfig"
      preset="card"
      style="width: 600px"
      title="自定义列"
    >
      <n-card>
        <template #header>
          <div class="flex items-center justify-between">
            <span>拖拽重新排序，勾选控制显示</span>
            <n-button text @click="resetColumnConfig">重置</n-button>
          </div>
        </template>

        <div class="space-y-2">
          <div
            v-for="(col, index) in columnConfigList"
            :key="col.key"
            class="flex items-center justify-between rounded border p-2 hover:bg-gray-50"
          >
            <div class="flex items-center gap-3">
              <n-checkbox
                v-model:checked="col.visible"
                :disabled="col.required"
              />
              <span class="text-sm">{{ col.title }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span v-if="col.required" class="text-xs text-gray-400"
                >必需</span
              >
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

    <!-- Withdrawal Settings Modal -->
    <WithdrawalSettingsModal
      v-model:visible="showWithdrawalSettings"
      @success="handleWithdrawalSettingsSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  watch,
  h,
  defineAsyncComponent,
} from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '#/store';
import { requestClient } from '#/api/request';
import {
  useTrimmedSearch,
  getDateRangeLabel,
} from '#/composables/useFormHelpers';
// ✅ PERFORMANCE FIX: Lazy load child components to avoid blocking page load
// These components are only needed when their tabs/modals are opened
const SmartAutoRefresh = defineAsyncComponent(
  () => import('../../components/smart/SmartAutoRefresh/index.vue'),
);
const SmartDataGrid = defineAsyncComponent(
  () => import('../../components/smart/SmartDataGrid/index.vue'),
);
const RiskControlReview = defineAsyncComponent(
  () => import('./RiskControlReview.vue'),
);
const FinanceWithdrawal = defineAsyncComponent(
  () => import('./FinanceWithdrawal.vue'),
);
const RePayment = defineAsyncComponent(() => import('./RePayment.vue'));
const AutoWithdrawal = defineAsyncComponent(
  () => import('./AutoWithdrawal.vue'),
);
const WithdrawalSettings = defineAsyncComponent(
  () => import('./WithdrawalSettings.vue'),
);
const WithdrawalSettingsModal = defineAsyncComponent(
  () => import('../../components/WithdrawalSettingsModal.vue'),
);
const ThirdPartyPayment = defineAsyncComponent(
  () => import('./ThirdPartyPayment.vue'),
);
const PaymentStatistics = defineAsyncComponent(
  () => import('./PaymentStatistics.vue'),
);
const UserDetailModal = defineAsyncComponent(
  () => import('#/components/user/UserDetailModal.vue'),
);
import {
  NCard,
  NForm,
  NFormItem,
  NDatePicker,
  NSelect,
  NInput,
  NInputGroup,
  NInputGroupLabel,
  NInputNumber,
  NButton,
  NSpace,
  NDataTable,
  NText,
  NTag,
  NIcon,
  NCheckbox,
  NModal,
  NTabs,
  NTabPane,
  NBadge,
  useMessage,
  useDialog,
  type DataTableColumns,
  type FormInst,
  type FormRules,
} from 'naive-ui';
import {
  Settings,
  ReloadOutline,
  AddOutline,
  DownloadOutline,
  CopyOutline,
  ChevronUpOutline,
} from '@vicons/ionicons5';
import { withdrawalApi } from '#/api/finance/withdrawal';
import { financeWithdrawalApi } from '#/api/finance/financeWithdrawal';
import { rePaymentApi } from '#/api/finance/rePayment';
import { searchUsersApi } from '#/api/core/user-management';
import { getMemberTiersApi } from '#/api/core/memberTier';
import { getGamePlatformListApi } from '#/api/game/platform';
import { formatCurrency, formatDateTime } from '#/utils/format';

// Interfaces
interface WithdrawOrder {
  orderId: string;
  memberId: string;
  userID?: string; // 9-digit display ID (e.g., "154301535")
  accountName: string;
  vipLevel: string;
  memberTag: string;
  appliedAt: string;
  withdrawAmount: number;
  currency: string;
  estimatedReceived: number;
  fee: number;
  rechargeWithdrawCount: {
    rechargeCount: number;
    withdrawCount: number;
    duplicateIP: number;
  };
  withdrawChannelInfo: {
    method: string;
    name: string;
    address: string;
    type: string;
    cpf: string;
  };
  status: string;
  backendNote?: string;
  frontendNote?: string;
  agencyNote?: string;
  // Lock-related fields
  isLocked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
}

interface FilterForm {
  dateRange: [number, number] | null;
  thirdPartyPayment: string | null;
  status: string | null;
  withdrawMethod: string | null;
  vipLevel: string | null;
  agentMode: string | null;
  serviceFilter: string | null;
  search: string;
}

interface WithdrawalForm {
  memberId: string;
  amount: number | null;
  withdrawMethod: string;
  withdrawAccount: string;
  frontendNote: string;
  backendNote: string;
  verificationPassword: string;
}

interface Summary {
  totalCount: number;
  totalAmount: number;
}

interface NoteForm {
  type: string;
  content: string;
  orderId: string;
}

interface BatchForm {
  action: string;
  status?: string;
  reason: string;
}

// Refs
const message = useMessage();
const dialog = useDialog();
const route = useRoute();
const filterFormRef = ref<FormInst | null>(null);
const withdrawalFormRef = ref<FormInst | null>(null);
const noteFormRef = ref<FormInst | null>(null);
const batchFormRef = ref<FormInst | null>(null);
const tableRef = ref();

// Data
const activeTab = ref('risk-review');
/** 日运营报表下钻：保持起止为精确 UTC 时间戳，避免再按本地日切到 23:59 */
const exactWithdrawalRangeFromDrill = ref(false);
const allWithdrawalsFundingFilter = ref<'unfunded' | 'funded' | null>(null);
const allWithdrawalsCurrencyOverride = ref<string | null>(null);
const skipNextDateRangeNormalize = ref(false);

function applyWithdrawalListQueryFromRoute() {
  const q = route.query;
  if (String(q.tab) === 'all-withdrawals') {
    activeTab.value = 'all-withdrawals';
  }
  const hasOpsRange = q.opsDateStart != null && q.opsDateEnd != null;
  if (hasOpsRange) {
    const s = Number(q.opsDateStart);
    const e = Number(q.opsDateEnd);
    if (!Number.isNaN(s) && !Number.isNaN(e)) {
      skipNextDateRangeNormalize.value = true;
      filterForm.value.dateRange = [s, e];
      exactWithdrawalRangeFromDrill.value = true;
    }
    if (q.opsFunding === 'unfunded' || q.opsFunding === 'funded') {
      allWithdrawalsFundingFilter.value = q.opsFunding;
    } else {
      allWithdrawalsFundingFilter.value = null;
    }
    if (typeof q.opsCurrency === 'string' && q.opsCurrency.trim()) {
      allWithdrawalsCurrencyOverride.value = q.opsCurrency.trim();
    } else {
      allWithdrawalsCurrencyOverride.value = null;
    }
  }
}

const loading = ref(false);
const modalLoading = ref(false);
const tableData = ref<WithdrawOrder[]>([]);
const checkedRowKeys = ref<string[]>([]);
const showWithdrawalModal = ref(false);
const showNoteModal = ref(false);
const showBatchModal = ref(false);
const showColumnConfig = ref(false);
const showWithdrawalSettings = ref(false);
const showDetailModal = ref(false);
const detailModalData = ref<WithdrawOrder | null>(null);
const showMemberDetailModal = ref(false);
const currentMemberUserId = ref<number>(0);
const isEditing = ref(false);
const currentEditingOrder = ref<WithdrawOrder | null>(null);

// Tab badge counts
const riskReviewCount = ref(0);
const myRiskCount = ref(0);
const financeCount = ref(0);
const myWithdrawalCount = ref(0);
const autoApprovalCount = ref(0);

// Member search
const memberOptions = ref<any[]>([]);
const memberLoading = ref(false);
const selectedMember = ref<any>(null);
const searchType = ref('account');
const memberSearchQuery = ref('');
let searchTimeout: NodeJS.Timeout | null = null;

// Member tier options
const memberTierOptions = ref<any[]>([]);

// Form data
// 🔍 FIX: Auto-trim search input
const { value: searchInput, trimmed: searchQuery } = useTrimmedSearch('');

const filterForm = ref<FilterForm>({
  dateRange: null, // ✅ FIX: No default date range for "全部提现" tab - show all withdrawals
  thirdPartyPayment: null,
  status: null,
  withdrawMethod: null,
  vipLevel: null,
  agentMode: null,
  serviceFilter: null,
  search: '',
});

// 📅 FIX: Auto-adjust end date to 23:59:59
watch(
  () => filterForm.value.dateRange,
  (newRange) => {
    if (skipNextDateRangeNormalize.value) {
      skipNextDateRangeNormalize.value = false;
      return;
    }
    if (newRange && newRange.length === 2) {
      const [start, end] = newRange;
      exactWithdrawalRangeFromDrill.value = false;
      allWithdrawalsFundingFilter.value = null;
      allWithdrawalsCurrencyOverride.value = null;

      // Set start to 00:00:00
      const startDate = new Date(start);
      startDate.setHours(0, 0, 0, 0);

      // Set end to 23:59:59
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);

      // Update if times changed
      if (startDate.getTime() !== start || endDate.getTime() !== end) {
        filterForm.value.dateRange = [startDate.getTime(), endDate.getTime()];
      }
    }
  },
);

// 📅 Date range display label
const dateRangeLabel = computed(() => {
  return filterForm.value.dateRange
    ? getDateRangeLabel(filterForm.value.dateRange)
    : '';
});

// Helper function to get default date range (weekly)
function getDefaultDateRange(): [number, number] {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  return [weekAgo.getTime(), now.getTime()];
}

const withdrawalForm = ref<WithdrawalForm>({
  memberId: '',
  amount: null,
  withdrawMethod: '',
  withdrawAccount: '',
  frontendNote: '',
  backendNote: '',
  verificationPassword: '',
});

const noteForm = ref<NoteForm>({
  type: '',
  content: '',
  orderId: '',
});

const batchForm = ref<BatchForm>({
  action: '',
  status: '',
  reason: '',
});

// Pagination - SmartDataGrid compatible
const paginationReactive = ref({
  page: 1,
  pageSize: 20,
  total: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  showQuickJumper: true,
});

// Auto-refresh functionality (simplified with SmartAutoRefresh)
const autoRefreshEnabled = ref(false);

// Column configuration
const columnConfigList = ref([
  { key: 'orderId', title: '订单号', visible: true, required: true },
  { key: 'memberId', title: '会员ID', visible: true, required: false },
  { key: 'memberAccount', title: '会员账号', visible: true, required: false },
  {
    key: 'firstDepositStatus',
    title: '首充状态',
    visible: true,
    required: false,
  },
  { key: 'memberInfo', title: '会员信息', visible: true, required: false },
  { key: 'memberName', title: '会员姓名', visible: false, required: false },
  { key: 'vipLevel', title: 'VIP等级', visible: true, required: false },
  { key: 'appliedAt', title: '申请时间', visible: true, required: false },
  { key: 'withdrawAmount', title: '提现金额', visible: true, required: false },
  {
    key: 'estimatedAmount',
    title: '预计到账金额',
    visible: true,
    required: false,
  },
  { key: 'counts', title: '充/提次数', visible: true, required: false },
  { key: 'withdrawChannel', title: '提现方式', visible: true, required: false },
  { key: 'status', title: '订单状态', visible: true, required: false },
  { key: 'notes', title: '备注', visible: false, required: false },
  { key: 'actions', title: '操作', visible: true, required: true },
]);

// Summary
const summary = ref<Summary>({
  totalCount: 0,
  totalAmount: 0,
});

// Options
const dateShortcuts = {
  今天: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return [start.getTime(), end.getTime()];
  },
  昨天: () => {
    const now = new Date();
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1,
    );
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return [start.getTime(), end.getTime()];
  },
  本周: () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - dayOfWeek,
    );
    const end = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - dayOfWeek + 7,
    );
    return [start.getTime(), end.getTime()];
  },
  本月: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return [start.getTime(), end.getTime()];
  },
};

const thirdPartyOptions = [
  { label: '全部', value: '' },
  { label: 'PIX', value: 'pix' },
  { label: '银行转账', value: 'bank' },
  { label: '数字钱包', value: 'wallet' },
];

const statusOptions = [
  { label: '全部', value: '' },
  { label: '未锁定', value: 'unlocked' },
  { label: '待出款', value: 'pending' },
  { label: '已出款', value: 'completed' },
  { label: '已拒绝', value: 'rejected' },
  { label: '已取消', value: 'cancelled' },
];

const withdrawMethodOptions = [
  { label: '全部', value: '' },
  { label: 'PIX', value: 'pix' },
  { label: '银行转账', value: 'bank' },
  { label: '数字钱包', value: 'wallet' },
];

const withdrawAccountOptions = [
  { label: '请选择提现账号', value: '' },
  { label: '主账户', value: 'main_account' },
  { label: '备用账户', value: 'backup_account' },
];

// VIP options - will be replaced with member tier options dynamically
const vipLevelOptions = computed(() => {
  if (memberTierOptions.value.length > 0) {
    return [{ label: '全部', value: '' }, ...memberTierOptions.value];
  }
  // Fallback to default VIP options if tiers not loaded
  return [
    { label: '全部', value: '' },
    { label: 'VIP0', value: 'vip0' },
    { label: 'VIP1', value: 'vip1' },
    { label: 'VIP2', value: 'vip2' },
    { label: 'VIP3', value: 'vip3' },
    { label: 'VIP4', value: 'vip4' },
    { label: 'VIP5', value: 'vip5' },
  ];
});

const agentModeOptions = [
  { label: '全部', value: '' },
  { label: '推广模式', value: 'referral' },
  { label: '手动分配', value: 'manual' },
];

const serviceFilterOptions = [
  { label: '全部', value: '' },
  { label: '正常服务', value: 'normal' },
  { label: '风险控制', value: 'risk' },
  { label: '客服处理', value: 'service' },
];

const noteTypeOptions = [
  { label: '后台备注', value: 'backend' },
  { label: '前台备注', value: 'frontend' },
  { label: '三方代付备注', value: 'agency' },
];

const batchActionOptions = [
  { label: '批量锁定', value: 'lock' },
  { label: '批量解锁', value: 'unlock' },
  { label: '批量审核出款', value: 'approve' },
  { label: '批量拒绝', value: 'reject' },
  { label: '批量强制取消', value: 'cancel' },
  { label: '批量更新状态', value: 'update-status' },
  { label: '批量导出', value: 'export' },
];

// 批量操作下拉选项（与截图一致 11 项）
const batchOperationDropdownOptions = [
  { label: '批量锁定', key: 'batch-lock' },
  { label: '批量解锁', key: 'batch-unlock' },
  { label: '批量备注', key: 'batch-remark' },
  { label: '批量强制取消', key: 'batch-force-cancel' },
  { label: '批量强制拒绝', key: 'batch-force-reject' },
  { label: '批量强制成功', key: 'batch-force-success' },
  { label: '批量强制失败', key: 'batch-force-fail' },
  { label: '批量刷新回调', key: 'batch-refresh-callback' },
  { label: '批量审核出款', key: 'batch-approve' },
  { label: '批量重新代付', key: 'batch-repay' },
  { label: '批量已人工出款', key: 'batch-manual-withdrawal' },
];

// Validation rules
const withdrawalRules: FormRules = {
  memberId: {
    required: true,
    message: '请选择会员',
    trigger: ['blur', 'change'],
  },
  amount: {
    required: true,
    type: 'number',
    message: '请输入提现金额',
    trigger: ['blur', 'change'],
  },
  withdrawMethod: { required: true, message: '请选择提现方式' },
  paymentInfo: { required: true, message: '请输入收款信息' },
};

const noteRules: FormRules = {
  type: { required: true, message: '请选择备注类型' },
  content: { required: true, message: '请输入备注内容' },
};

const batchRules: FormRules = {
  action: { required: true, message: '请选择操作类型' },
  reason: { required: true, message: '请输入操作说明' },
};

// Table columns - matching exact user requirements
const columns: DataTableColumns<WithdrawOrder> = [
  {
    type: 'selection',
    width: 50,
    fixed: 'left',
  },
  // 1. 订单号
  {
    title: '订单号',
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
  // 2. 会员ID (VIP等级)
  {
    title: '会员ID (VIP等级)',
    key: 'memberId',
    width: 130,
    render: (row) =>
      h('div', { class: 'text-center space-y-1' }, [
        h(
          NButton,
          {
            text: true,
            type: 'primary',
            size: 'small',
            class: 'font-mono font-medium',
            onClick: () => showMemberDetail(row),
          },
          { default: () => row.displayMemberId || row.userID || row.memberId },
        ), // Display 9-digit ID, but onClick passes internal ID
        h(
          NTag,
          { size: 'small', type: 'info' },
          { default: () => row.vipLevel || 'VIP0' },
        ),
      ]),
  },
  // 3. 会员账号 (会员层级)
  {
    title: '会员账号 (会员层级)',
    key: 'memberAccount',
    width: 140,
    render: (row) =>
      h('div', { class: 'space-y-1' }, [
        h(
          NButton,
          {
            text: true,
            type: 'primary',
            size: 'small',
            class: 'font-medium',
            onClick: () => showMemberDetail(row),
          },
          { default: () => row.accountName },
        ),
        h(
          'div',
          { class: 'text-xs text-gray-500' },
          row.memberTierName || '默认层级',
        ),
      ]),
  },
  // 4. 申请时间 (操作时间) (完成时长)
  {
    title: '申请时间 (操作时间) (完成时长)',
    key: 'appliedAt',
    width: 180,
    render: (row) =>
      h('div', { class: 'text-center space-y-1' }, [
        h('div', { class: 'text-xs' }, formatDateTime(row.appliedAt)),
        h(
          'div',
          { class: 'text-xs text-gray-500' },
          formatDateTime(row.updatedAt || row.completedTime),
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
  // 5. 会员币种 (比例)
  {
    title: '会员币种 (比例)',
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
  // 6. 提现金额 (当前余额)
  {
    title: '提现金额 (当前余额)',
    key: 'withdrawAmount',
    width: 140,
    render: (row) =>
      h('div', { class: 'text-center space-y-1' }, [
        h(
          'div',
          { class: 'font-semibold text-red-600' },
          formatCurrency(row.withdrawAmount),
        ),
        h(
          'div',
          { class: 'text-xs text-gray-500' },
          formatCurrency(row.currentBalance || 0),
        ),
      ]),
  },
  // 7. 到账币种汇率
  {
    title: '到账币种汇率',
    key: 'arrivalCurrency',
    width: 120,
    render: (row) =>
      h('div', { class: 'text-center space-y-1' }, [
        h('div', { class: 'font-medium' }, row.currency || 'BRL'),
        h(
          'div',
          { class: 'text-xs text-gray-500' },
          `汇率: ${row.exchangeRate || '0.05'}`,
        ),
      ]),
  },
  // 8. 预计到帐 (手续费) (实际到账)
  {
    title: '预计到帐 (手续费) (实际到账)',
    key: 'estimatedAmount',
    width: 160,
    render: (row) =>
      h('div', { class: 'text-center space-y-1' }, [
        h(
          'div',
          { class: 'text-xs font-semibold text-green-600' },
          formatCurrency(row.estimatedAmount || row.estimatedReceived || 0),
        ),
        h(
          'div',
          { class: 'text-xs text-gray-500' },
          `手续费: ${formatCurrency(row.fee || 0)}`,
        ),
        h(
          'div',
          { class: 'text-xs' },
          `实际: ${formatCurrency(row.estimatedReceived || row.estimatedAmount || 0)}`,
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
            { default: () => '稽核' },
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
            { default: () => '投注' },
          ),
        ]),
      ]),
  },
  // 9. 充 / 提次数 (累计充 / 提差额) (重复IP人数)
  {
    title: '充 / 提次数 (累计充 / 提差额) (重复IP人数)',
    key: 'counts',
    width: 180,
    render: (row) => {
      const rechargeCount = row.rechargeWithdrawCount?.rechargeCount || 0;
      const withdrawCount = row.rechargeWithdrawCount?.withdrawCount || 0;
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
  // 10. 收款方式 (收款人信息)
  {
    title: '收款方式 (收款人信息)',
    key: 'paymentMethod',
    width: 320,
    render: (row) => {
      const info = row.withdrawChannelInfo || {};
      const pixType = info.type || row.paymentMethod || 'PIX';

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

      const accountType = info.accountType || info.type || '';
      const displayType = getAccountTypeDisplay(accountType);

      // Build copy all text - include type and CPF
      const copyAllText = [
        info.name ? `真实姓名：${info.name}` : '',
        info.account ? `账号/地址：${info.account}` : '',
        displayType ? `类型：${displayType}` : '',
        info.cpf ? `CPF：${info.cpf}` : '',
        info.phone ? `电话：${info.phone}` : '',
        info.email ? `邮箱：${info.email}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const copyAll = () => {
        if (copyAllText) {
          navigator.clipboard.writeText(copyAllText);
          message.success('已复制全部信息');
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
              { default: () => '复制全部' },
            ),
        ]),
        // Name
        info.name &&
          h('div', { class: 'flex items-center justify-between text-xs' }, [
            h('span', { class: 'text-gray-600' }, '真实姓名：'),
            h('div', { class: 'flex items-center gap-1' }, [
              h('span', { class: 'font-medium' }, info.name),
              h(
                NButton,
                {
                  text: true,
                  size: 'tiny',
                  onClick: () => copyField(info.name, '真实姓名'),
                },
                {
                  default: () => h(NIcon, { size: 14, component: CopyOutline }),
                },
              ),
            ]),
          ]),
        // Account/Address
        info.account &&
          h('div', { class: 'flex items-center justify-between text-xs' }, [
            h('span', { class: 'text-gray-600' }, '账号/地址：'),
            h('div', { class: 'flex items-center gap-1' }, [
              h('span', { class: 'font-medium' }, info.account),
              h(
                NButton,
                {
                  text: true,
                  size: 'tiny',
                  onClick: () => copyField(info.account, '账号/地址'),
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
        // CPF - Always show if available (regardless of type)
        info.cpf &&
          h('div', { class: 'flex items-center justify-between text-xs' }, [
            h('span', { class: 'text-gray-600' }, 'CPF：'),
            h('div', { class: 'flex items-center gap-1' }, [
              h('span', { class: 'font-medium' }, info.cpf),
              h(
                NButton,
                {
                  text: true,
                  size: 'tiny',
                  onClick: () => copyField(info.cpf, 'CPF'),
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
  // 11. 订单状态 (操作人)
  {
    title: '订单状态 (操作人)',
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
      } else if (row.reviewer) {
        // If reviewer exists, show it
        operatorDisplay = row.reviewer;
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
  // 12. 前台备注
  {
    title: '前台备注',
    key: 'frontendNotes',
    width: 150,
    render: (row) => {
      const frontendNote = row.frontendNotes || row.frontendNote || '';
      return h('div', { class: 'text-xs' }, [
        frontendNote
          ? h('div', { class: 'text-gray-700' }, frontendNote)
          : h('span', { class: 'text-gray-400 text-center' }, '-'),
      ]);
    },
  },
  // 13. 后台备注
  {
    title: '后台备注',
    key: 'backendNotes',
    width: 200,
    render: (row) => {
      const backendNote =
        row.backendNotes || row.backendNote || row.description || '';
      const hasError =
        row.status === 'failed' ||
        row.status === 'rejected' ||
        (backendNote &&
          (backendNote.toLowerCase().includes('error') ||
            backendNote.toLowerCase().includes('failed') ||
            backendNote.toLowerCase().includes('错误') ||
            backendNote.toLowerCase().includes('失败')));

      return h('div', { class: 'text-xs' }, [
        backendNote
          ? h('div', { class: hasError ? 'space-y-1' : '' }, [
              hasError && h('div', { class: 'text-red-500' }, '错误信息：'),
              h(
                'div',
                { class: hasError ? 'text-red-600' : 'text-gray-700' },
                backendNote,
              ),
            ])
          : h('span', { class: 'text-gray-400 text-center' }, '-'),
      ]);
    },
  },
  // 14. 三方备注
  {
    title: '三方备注',
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

      return h('div', { class: 'text-xs' }, [
        thirdPartyNote
          ? h('div', { class: 'space-y-1' }, [
              h('div', { class: 'text-orange-500 text-xs' }, '三方响应：'),
              h(
                'div',
                { class: hasError ? 'text-red-600' : 'text-gray-700' },
                thirdPartyNote,
              ),
            ])
          : h('span', { class: 'text-gray-400 text-center' }, '-'),
      ]);
    },
  },
  // 15. 三方代付 (代付次数)
  {
    title: '三方代付 (代付次数)',
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
          `代付次数: ${row.withdrawCount || 1}`,
        ),
      ]);
    },
  },
  // 15. 操作
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right',
    render: (row) => {
      const actions = [];

      // Only show 备注 button if the withdrawal is locked
      if (row.isLocked) {
        actions.push(
          h(
            NButton,
            {
              size: 'small',
              type: 'info',
              onClick: () => handleEditNote(row),
            },
            { default: () => '备注' },
          ),
        );
      }

      return h('div', { class: 'flex flex-wrap gap-1' }, actions);
    },
  },
];

// SmartDataGrid event handlers for All Withdrawals tab
const handleAllWithdrawalsPageChange = (page: number) => {
  paginationReactive.value.page = page;
  fetchAllWithdrawalsData();
};

const handleAllWithdrawalsPageSizeChange = (pageSize: number) => {
  paginationReactive.value.pageSize = pageSize;
  paginationReactive.value.page = 1;
  fetchAllWithdrawalsData();
};

const handleAllWithdrawalsRowClick = (_row: WithdrawOrder) => {
  // console.log('Row clicked:', row);
};

const clearAllWithdrawalsSelection = () => {
  checkedRowKeys.value = [];
};

const selectAllWithdrawals = () => {
  checkedRowKeys.value = tableData.value.map((row) => row.orderId);
};

// 全选当前页：当前页所有 orderId
const currentPageOrderIds = computed(() =>
  tableData.value.map((row) => row.orderId),
);

const isAllCurrentPageSelected = computed(() => {
  const ids = currentPageOrderIds.value;
  if (ids.length === 0) return false;
  return ids.every((id) => checkedRowKeys.value.includes(id));
});

const isCurrentPageIndeterminate = computed(() => {
  const ids = currentPageOrderIds.value;
  if (ids.length === 0) return false;
  const selected = ids.filter((id) => checkedRowKeys.value.includes(id));
  return selected.length > 0 && selected.length < ids.length;
});

const toggleSelectAllCurrentPage = (checked: boolean) => {
  if (checked) {
    checkedRowKeys.value = [
      ...new Set([...checkedRowKeys.value, ...currentPageOrderIds.value]),
    ];
  } else {
    const pageSet = new Set(currentPageOrderIds.value);
    checkedRowKeys.value = checkedRowKeys.value.filter(
      (id) => !pageSet.has(id),
    );
  }
};

// 批量操作需要填写原因的 action
const batchReasonModal = ref<{
  show: boolean;
  actionKey: string;
  orderIds: string[];
  reason: string;
}>({
  show: false,
  actionKey: '',
  orderIds: [],
  reason: '',
});

// 批量强制拒绝 - 与截图一致的弹窗（风控选项 + 稽核平台 + 前后台原因）
const batchForceRejectPlatforms = ref<{ platformId: string; platformName: string; gameType: string; gameCount?: number }[]>([]);
const batchForceRejectModal = ref<{
  show: boolean;
  loading: boolean;
  data: WithdrawOrder | null;
  batchOrderIds: string[];
  windControlProcess: 'no' | 'add_audit' | 'deduct_balance';
  auditMultiplier: number;
  platforms: Record<string, boolean>;
  frontendReason: string;
  backendReason: string;
}>({
  show: false,
  loading: false,
  data: null,
  batchOrderIds: [],
  windControlProcess: 'no',
  auditMultiplier: 1,
  platforms: { all: true },
  frontendReason: '',
  backendReason: '',
});

async function openBatchForceRejectModal(rows: WithdrawOrder[]) {
  if (rows.length === 0) return;
  batchForceRejectModal.value.data = rows[0];
  batchForceRejectModal.value.batchOrderIds = rows.map((r) => r.orderId).filter(Boolean);
  batchForceRejectModal.value.windControlProcess = 'no';
  batchForceRejectModal.value.auditMultiplier = 1;
  batchForceRejectModal.value.frontendReason = '';
  batchForceRejectModal.value.backendReason = '';
  if (batchForceRejectPlatforms.value.length === 0) {
    try {
      const res = await getGamePlatformListApi({ pageSize: 1000, isEnabled: true });
      const list = (res as any)?.list ?? (res as any)?.data?.list ?? [];
      batchForceRejectPlatforms.value = list.map((p: any) => ({
        platformId: p.platformId || p.id,
        platformName: p.platformName || p.name || p.platformId,
        gameType: p.gameType || 'ALL',
        gameCount: p.gameCount ?? 0,
      }));
      const newPlatforms: Record<string, boolean> = { all: true };
      batchForceRejectPlatforms.value.forEach((p) => {
        newPlatforms[p.platformId] = true;
      });
      batchForceRejectModal.value.platforms = newPlatforms;
    } catch (_) {
      batchForceRejectModal.value.platforms = { all: true };
    }
  } else {
    const newPlatforms: Record<string, boolean> = { all: true };
    batchForceRejectPlatforms.value.forEach((p) => {
      newPlatforms[p.platformId] = true;
    });
    batchForceRejectModal.value.platforms = newPlatforms;
  }
  batchForceRejectModal.value.show = true;
}

function toggleBatchForceRejectPlatform(platformId: string) {
  const m = batchForceRejectModal.value;
  m.platforms[platformId] = !m.platforms[platformId];
  const selected = batchForceRejectPlatforms.value.filter((p) => m.platforms[p.platformId]).length;
  m.platforms.all = selected === batchForceRejectPlatforms.value.length;
}

async function submitBatchForceReject() {
  const m = batchForceRejectModal.value;
  const ids = m.batchOrderIds;
  if (ids.length === 0) return;
  try {
    m.loading = true;
    let auditTaskData: { multiplier: number; platforms: Record<string, boolean>; selectedPlatform: string } | undefined;
    if (m.windControlProcess === 'add_audit') {
      auditTaskData = {
        multiplier: m.auditMultiplier,
        platforms: m.platforms,
        selectedPlatform: batchForceRejectPlatforms.value[0]?.platformId || 'PG',
      };
    }
    const payload = {
      windControlProcess: m.windControlProcess,
      auditTask: auditTaskData,
      frontendReason: m.frontendReason,
      backendReason: m.backendReason,
    };
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
      ok === ids.length ? `批量强制拒绝成功 (${ok} 条)` : `部分成功 ${ok}/${ids.length} 条`,
    );
    m.show = false;
    m.batchOrderIds = [];
    await fetchData();
    checkedRowKeys.value = [];
  } catch (e: any) {
    message.error(e?.message || '批量强制拒绝失败');
  } finally {
    m.loading = false;
  }
}

function openBatchReasonModal(actionKey: string, orderIds: string[]) {
  batchReasonModal.value = { show: true, actionKey, orderIds, reason: '' };
}

async function submitBatchReasonModal() {
  const { actionKey, orderIds, reason } = batchReasonModal.value;
  if (
    !reason.trim() &&
    ['batch-force-cancel', 'batch-force-reject', 'batch-remark'].includes(
      actionKey,
    )
  ) {
    message.warning('请输入操作说明');
    return;
  }
  batchReasonModal.value.show = false;
  await runBatchAction(actionKey, orderIds, reason.trim());
}

async function runBatchAction(
  actionKey: string,
  orderIds: string[],
  reason: string = '',
) {
  const len = orderIds.length;
  try {
    loading.value = true;
    if (actionKey === 'batch-lock') {
      const res = await withdrawalApi.batchLock(orderIds, reason || '批量锁定');
      if (res?.success !== false) {
        message.success(`批量锁定成功 (${len} 条)`);
        await fetchData();
        checkedRowKeys.value = [];
      } else {
        message.error(res?.message || '批量锁定失败');
      }
    } else if (actionKey === 'batch-unlock') {
      const res = await withdrawalApi.batchUnlock(
        orderIds,
        reason || '批量解锁',
      );
      if (res?.success !== false) {
        message.success(`批量解锁成功 (${len} 条)`);
        await fetchData();
        checkedRowKeys.value = [];
      } else {
        message.error(res?.message || '批量解锁失败');
      }
    } else if (actionKey === 'batch-approve') {
      const pendingOrderIds = orderIds.filter((orderId) => {
        const row = tableData.value.find((r) => r.orderId === orderId);
        return row?.status === 'pending';
      });
      if (pendingOrderIds.length === 0) {
        message.warning('所选记录中无待出款状态，仅处理待出款订单，已跳过');
        return;
      }
      if (pendingOrderIds.length < orderIds.length) {
        message.info(`已跳过 ${orderIds.length - pendingOrderIds.length} 笔非待出款订单，仅处理 ${pendingOrderIds.length} 笔待出款`);
      }
      const res = await withdrawalApi.batchApprove(
        pendingOrderIds,
        reason || '批量审核出款',
      );
      if (res?.success !== false) {
        message.success(`批量审核出款成功 (${pendingOrderIds.length} 条)`);
        await fetchData();
        checkedRowKeys.value = [];
      } else {
        message.error(res?.message || '批量审核出款失败');
      }
    } else if (actionKey === 'batch-force-cancel') {
      let ok = 0;
      for (const id of orderIds) {
        try {
          const res = await financeWithdrawalApi.forceCancel(id, {
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
          ? `批量强制取消成功 (${len} 条)`
          : `部分成功 ${ok}/${len} 条`,
      );
      await fetchData();
      checkedRowKeys.value = [];
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
      checkedRowKeys.value = [];
    } else if (actionKey === 'batch-remark') {
      let ok = 0;
      for (const id of orderIds) {
        try {
          const res = await withdrawalApi.updateNote(id, {
            backendNotes: reason,
          });
          if (res?.success !== false || (res as any)?.trxId) ok++;
        } catch (_) {
          /* skip */
        }
      }
      message[ok === len ? 'success' : 'warning'](
        ok === len ? `批量备注成功 (${len} 条)` : `部分成功 ${ok}/${len} 条`,
      );
      await fetchData();
      checkedRowKeys.value = [];
    } else if (actionKey === 'batch-force-success') {
      const res = await withdrawalApi.batchOperation({
        orderIds,
        action: 'update-status',
        status: 'success',
        reason: reason || '批量强制成功',
      });
      if (res?.success !== false) {
        message.success(`批量强制成功 (${len} 条)`);
        await fetchData();
        checkedRowKeys.value = [];
      } else {
        message.error((res as any)?.message || '操作失败');
      }
    } else if (actionKey === 'batch-force-fail') {
      const res = await withdrawalApi.batchOperation({
        orderIds,
        action: 'update-status',
        status: 'failed',
        reason: reason || '批量强制失败',
      });
      if (res?.success !== false) {
        message.success(`批量强制失败 (${len} 条)`);
        await fetchData();
        checkedRowKeys.value = [];
      } else {
        message.error((res as any)?.message || '操作失败');
      }
    } else if (actionKey === 'batch-refresh-callback') {
      message.info('批量刷新回调功能请在三方代付或重新代付中使用');
    } else if (actionKey === 'batch-repay') {
      message.info('请到「重新代付」页签进行批量重新代付');
    } else if (actionKey === 'batch-manual-withdrawal') {
      let ok = 0;
      for (const id of orderIds) {
        try {
          const res = await financeWithdrawalApi.manualWithdrawal(id);
          if (res?.success !== false) ok++;
        } catch (_) {
          /* skip */
        }
      }
      message[ok === len ? 'success' : 'warning'](
        ok === len ? `批量已人工出款 (${len} 条)` : `部分成功 ${ok}/${len} 条`,
      );
      await fetchData();
      checkedRowKeys.value = [];
    } else if (actionKey === 'cancel') {
      const res = await withdrawalApi.batchOperation({
        orderIds,
        action: 'cancel',
        reason: reason || '批量强制取消',
      });
      if (res?.success !== false) {
        message.success(`批量取消成功 (${len} 条)`);
        await fetchData();
        checkedRowKeys.value = [];
      } else {
        message.error((res as any)?.message || '操作失败');
      }
    }
  } catch (e: any) {
    message.error(e?.message || '批量操作失败');
  } finally {
    loading.value = false;
  }
}

function onBatchOperationSelect(key: string, selectedRows: WithdrawOrder[]) {
  const pendingOnly =
    key === 'batch-approve' ||
    key === 'approve' ||
    key === 'batch-force-cancel' ||
    key === 'batch-force-reject' ||
    key === 'batch-remark';
  const rows = pendingOnly
    ? selectedRows.filter((r) => r.status === 'pending')
    : selectedRows;
  const orderIds = rows.map((r) => r.orderId).filter(Boolean);

  if (orderIds.length === 0) {
    if (selectedRows.length > 0 && pendingOnly)
      message.warning('所选记录中无待出款状态，仅处理待出款订单');
    else message.warning('请先选择要操作的记录');
    return;
  }
  if (pendingOnly && rows.length < selectedRows.length) {
    message.info(`已过滤非待出款订单，将仅处理 ${orderIds.length} 笔待出款`);
  }

  if (key === 'batch-force-reject') {
    openBatchForceRejectModal(rows);
    return;
  }
  if (['batch-force-cancel', 'batch-remark'].includes(key)) {
    openBatchReasonModal(key, orderIds);
    return;
  }
  runBatchAction(key, orderIds);
}

const handleExportAllWithdrawals = () => {
  // TODO: Implement export functionality
  message.info('导出功能开发中');
};

// Rename fetchData to be more specific for All Withdrawals tab
const fetchAllWithdrawalsData = async () => {
  await fetchData();
};

// Methods
const fetchData = async () => {
  console.log(
    '🔄 [All Withdrawals] fetchData called, activeTab:',
    activeTab.value,
  );
  console.log(
    '🔄 [All Withdrawals] Current page:',
    paginationReactive.value.page,
    'pageSize:',
    paginationReactive.value.pageSize,
  );
  if (activeTab.value !== 'all-withdrawals') return;

  console.log('🔄 [All Withdrawals] Starting data fetch...');
  loading.value = true;
  try {
    const dr = filterForm.value.dateRange;
    const endMs = dr?.[1];
    const params = {
      page: paginationReactive.value.page,
      pageSize: paginationReactive.value.pageSize,
      ...filterForm.value,
      search: searchQuery.value, // 🔍 FIX: Use auto-trimmed search
      startDate:
        dr?.[0] != null ? new Date(dr[0]).toISOString() : undefined,
      endDate:
        endMs != null
          ? exactWithdrawalRangeFromDrill.value
            ? new Date(endMs).toISOString()
            : (() => {
                const endDate = new Date(endMs);
                endDate.setHours(23, 59, 59, 999);
                return endDate.toISOString();
              })()
          : undefined,
      currency: allWithdrawalsCurrencyOverride.value || undefined,
      fundingFilter: allWithdrawalsFundingFilter.value || undefined,
    };

    console.log('🔄 [All Withdrawals] API params:', params);

    const rawResponse: any = await withdrawalApi.getList(
      params as import('#/api/finance/withdrawal').WithdrawListParams,
    );

    console.log('📥 API Response:', rawResponse);
    console.log(
      '📥 Response keys:',
      rawResponse ? Object.keys(rawResponse) : 'null',
    );

    // Backend returns: { success: true, data: [...], pagination: {...}, total: 33 }
    // Or: { withdrawals: [...], pagination: {...}, canWithdraw: true, ... }
    // Response interceptor may return different structures
    let records, total, summaryData;

    // Check if response has withdrawals key (new structure)
    if (rawResponse.withdrawals && Array.isArray(rawResponse.withdrawals)) {
      // Structure: { withdrawals: [...], pagination: {...}, canWithdraw: true, totalWageringRequired: ..., ... }
      records = rawResponse.withdrawals;
      total = rawResponse.pagination?.total || records.length;
      summaryData = { totalCount: total, totalAmount: 0 };
      console.log('✅ Response with withdrawals array:', {
        recordsCount: records.length,
        total,
      });
    } else if (rawResponse.data && rawResponse.total !== undefined) {
      // Structure: { data: [...], pagination: {...}, total: 33 }
      records = Array.isArray(rawResponse.data) ? rawResponse.data : [];
      total = rawResponse.total;
      summaryData = { totalCount: total, totalAmount: 0 };
      console.log('✅ Response with pagination:', {
        recordsCount: records.length,
        total,
      });
    } else if (Array.isArray(rawResponse)) {
      // Direct array (pagination info lost)
      records = rawResponse;
      total = records.length;
      summaryData = { totalCount: total, totalAmount: 0 };
      console.log('⚠️ Direct array - no pagination');
    } else {
      console.error('❌ Unexpected response structure:', rawResponse);
      message.error('数据格式错误');
      return;
    }

    console.log('✅ Setting tableData to:', records);
    console.log('✅ Records count:', records?.length);
    console.log('✅ First record structure:', records?.[0]);

    // Map API field names to frontend expected field names
    const mappedRecords = records.map((record: any) => {
      console.log('📊 [FRONTEND] Record data:', {
        userID: record.userID,
        memberId: record.memberId,
        memberName: record.memberName,
        rechargeWithdrawCount: record.rechargeWithdrawCount,
      });

      return {
        ...record,
        orderId: record.trxId || record.orderId || record.id,
        memberId: record.memberId, // Internal database ID (e.g., 7) - DO NOT OVERWRITE
        userID: record.userID, // 9-digit display ID (e.g., '154301535')
        displayMemberId: record.userID || record.memberId, // For UI display only
        accountName: record.memberName || record.accountName,
        appliedAt: record.createdAt || record.appliedAt,
        withdrawAmount:
          record.rewardAmount || record.withdrawAmount || record.amount,
        estimatedReceived:
          record.estimatedReceived ||
          (record.rewardAmount || record.amount || 0) -
            (record.fee || record.fees || 0),
        fee: record.fee || record.fees || 0,
        withdrawMethod: record.paymentMethod || record.withdrawMethod,
        withdrawAccount: record.memberBankAccount || record.withdrawAccount,
        bankName: record.memberBank || record.bankName,
        accountHolder: record.accountHolderName || record.accountHolder,
        // Notes fields
        frontendNotes: record.frontendNotes || '',
        frontendNote: record.frontendNote || '',
        backendNotes: record.backendNotes || '',
        backendNote: record.backendNote || '',
        description: record.description || '',
        thirdPartyNotes:
          record.thirdPartyNotes ||
          record.thirdPartyError ||
          record.gatewayError ||
          '',
        // Lock status
        isLocked: record.isLocked || false,
        lockedBy: record.lockedBy || null,
        lockedAt: record.lockedAt || null,
        // Add nested objects with defaults
        rechargeWithdrawCount: record.rechargeWithdrawCount || {
          rechargeCount: 0,
          withdrawCount: 0,
          duplicateIP: 0,
        },
        withdrawChannelInfo: record.withdrawChannelInfo || {
          method: record.paymentMethod || 'PIX',
          name: record.paymentGateway || 'manual',
          type: record.memberBank || 'PIX',
          cpf: record.memberBankAccount || '',
        },
        balanceInfo: record.balanceInfo || {
          before: record.balanceBefore || 0,
          after: record.balanceAfter || 0,
          change: (record.balanceBefore || 0) - (record.balanceAfter || 0),
        },
      };
    });

    tableData.value = mappedRecords;
    paginationReactive.value.total = total;
    summary.value = summaryData;

    console.log('✅ TableData after assignment:', tableData.value);
    console.log('✅ TableData length:', tableData.value.length);
    console.log('✅ Pagination total:', paginationReactive.value.total);

    // Check table reactivity
    setTimeout(() => {
      console.log('🔍 TableData after timeout:', tableData.value);
      console.log('🔍 Loading state:', loading.value);
    }, 100);
  } catch (error) {
    message.error('获取数据失败');
    console.error('Fetch data error:', error);
  } finally {
    loading.value = false;
  }
};

const handleCreateWithdrawal = () => {
  isEditing.value = false;
  currentEditingOrder.value = null;
  withdrawalForm.value = {
    memberId: '',
    amount: null,
    withdrawMethod: '',
    withdrawAccount: '',
    frontendNote: '',
    backendNote: '',
    verificationPassword: '',
  };
  // Reset member search
  memberOptions.value = [];
  selectedMember.value = null;
  showWithdrawalModal.value = true;
};

const handleSaveWithdrawal = async () => {
  if (!withdrawalFormRef.value) return;

  try {
    await withdrawalFormRef.value.validate();
    modalLoading.value = true;

    const data = {
      ...withdrawalForm.value,
      orderId: currentEditingOrder.value?.orderId,
    };

    console.log('💾 Saving withdrawal with data:', data);
    console.log('💾 Selected member:', selectedMember.value);
    console.log(
      '💾 Form memberId value:',
      withdrawalForm.value.memberId,
      '(type:',
      typeof withdrawalForm.value.memberId,
      ')',
    );

    const response = isEditing.value
      ? await withdrawalApi.update(data.orderId!, data)
      : await withdrawalApi.create(data);

    if (response.success) {
      // Show detailed success message with withdrawal info
      if (isEditing.value) {
        message.success('提现订单更新成功');
      } else {
        const orderInfo = response.data;
        message.success(
          `提现订单创建成功！订单号: ${orderInfo.orderId}，金额: ${orderInfo.withdrawAmount} ${orderInfo.currency}`,
        );
      }

      // Close modal and clear member selection
      showWithdrawalModal.value = false;
      handleMemberClear();

      // Refresh the data table - don't let refresh errors affect success message
      try {
        await fetchData();
      } catch (refreshError) {
        console.warn('⚠️ Failed to refresh data after save:', refreshError);
        // Don't show error - the save was successful
      }

      console.log('✅ Withdrawal operation completed successfully');
    } else {
      // Check if this is a wagering requirement error
      if (response.code === 'wagering_required' && response.data) {
        // Show wagering requirements modal instead of generic error
        showWageringModal(response.data);
      } else {
        message.error(
          response.message || (isEditing.value ? '更新失败' : '创建失败'),
        );
      }
    }
  } catch (error: any) {
    console.error('Save withdrawal error:', error);

    // Check if the error response contains wagering requirements
    if (
      error?.response?.data?.code === 'wagering_required' &&
      error?.response?.data?.data
    ) {
      showWageringModal(error.response.data.data);
    } else {
      message.error(
        error?.response?.data?.message ||
          (isEditing.value ? '更新失败' : '创建失败'),
      );
    }
  } finally {
    modalLoading.value = false;
  }
};

// New methods for the redesigned modal
const handleCancelWithdrawal = () => {
  showWithdrawalModal.value = false;
  handleMemberClear();
};

const handleSubmitWithdrawal = async () => {
  await handleSaveWithdrawal();
};

const formatBalance = (balance: number | undefined) => {
  if (balance === undefined || balance === null) return '0.00';
  return balance.toFixed(2);
};

const handleToggleLock = async (row: WithdrawOrder) => {
  try {
    const action = row.isLocked ? 'unlock' : 'lock';
    const response = await withdrawalApi.toggleLock(row.orderId, action);

    if (response.success) {
      message.success(action === 'lock' ? '锁定成功' : '解锁成功');
      fetchData(); // Refresh data to show updated lock status
    } else {
      message.error(
        response.message || `${action === 'lock' ? '锁定' : '解锁'}失败`,
      );
    }
  } catch (error) {
    message.error('操作失败');
    console.error('Toggle lock error:', error);
  }
};

const handleSearch = () => {
  paginationReactive.value.page = 1;
  fetchData();
};

const handleAdvancedSearch = () => {
  // TODO: Implement advanced search modal
  message.info('高级搜索功能开发中');
};

const handleResetFilters = () => {
  searchInput.value = ''; // 🔍 FIX: Reset search input
  filterForm.value = {
    dateRange: null,
    thirdPartyPayment: null,
    status: null,
    withdrawMethod: null,
    vipLevel: null,
    agentMode: null,
    serviceFilter: null,
    search: '',
  };
  paginationReactive.value.page = 1;
  fetchData();
};

const handlePageChange = (page: number) => {
  paginationReactive.value.page = page;
  fetchData();
};

const handlePageSizeChange = (pageSize: number) => {
  paginationReactive.value.pageSize = pageSize;
  paginationReactive.value.page = 1;
  fetchData();
};

const handleEditNote = (row: WithdrawOrder) => {
  currentEditingOrder.value = row;

  // Determine note type and content based on existing notes
  let noteType = 'backend';
  let noteContent = '';

  if (row.frontendNotes || row.frontendNote) {
    noteType = 'frontend';
    noteContent = row.frontendNotes || row.frontendNote || '';
  } else if (row.backendNotes || row.backendNote) {
    noteType = 'backend';
    noteContent = row.backendNotes || row.backendNote || '';
  }

  noteForm.value = {
    type: noteType,
    content: noteContent,
    orderId: row.orderId,
  };
  showNoteModal.value = true;
};

// Watch for note type changes and update content accordingly
watch(
  () => noteForm.value.type,
  (newType) => {
    if (!currentEditingOrder.value || !showNoteModal.value) return;

    const row = currentEditingOrder.value;

    // Update content based on selected type
    if (newType === 'frontend') {
      noteForm.value.content = row.frontendNotes || row.frontendNote || '';
    } else if (newType === 'backend') {
      noteForm.value.content = row.backendNotes || row.backendNote || '';
    } else if (newType === 'system' || newType === 'agency') {
      noteForm.value.content = row.systemNotes || '';
    }
  },
);

const handleSaveNote = async () => {
  if (!noteFormRef.value) return;

  try {
    await noteFormRef.value.validate();

    // Map note type to correct field names
    const noteData: any = {};
    if (noteForm.value.type === 'frontend') {
      noteData.frontendNotes = noteForm.value.content;
    } else if (noteForm.value.type === 'backend') {
      noteData.backendNotes = noteForm.value.content;
    } else if (
      noteForm.value.type === 'system' ||
      noteForm.value.type === 'agency'
    ) {
      noteData.systemNotes = noteForm.value.content;
    }

    console.log('💾 Saving notes:', {
      orderId: noteForm.value.orderId,
      noteData,
    });

    const response = await withdrawalApi.updateNote(
      noteForm.value.orderId,
      noteData,
    );

    console.log('✅ API Response:', response);

    // Response interceptor returns the data directly, so if we have a trxId, it's successful
    const isSuccess = response && (response.trxId || response.success === true);

    if (isSuccess) {
      console.log('✅ Update successful, updating table data...');

      // Update local table data immediately with the returned data
      if (currentEditingOrder.value) {
        console.log('🔍 Looking for order:', currentEditingOrder.value.orderId);
        console.log('🔍 Table data length:', tableData.value.length);
        console.log(
          '🔍 Table orderIds:',
          tableData.value.map((r) => r.orderId).slice(0, 5),
        );

        const rowIndex = tableData.value.findIndex(
          (r) => r.orderId === currentEditingOrder.value!.orderId,
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

      message.success('备注保存成功');
      showNoteModal.value = false;

      // Force table to re-render by creating a new array reference
      tableData.value = [...tableData.value];

      // Refresh data from server
      console.log('🔄 Refreshing data from server...');
      await fetchData();
    } else {
      const errorMsg = response?.message || '保存失败';
      console.error('❌ Update failed:', errorMsg, response);
      message.error(errorMsg);
    }
  } catch (error: any) {
    console.error('❌ Save note error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response,
      data: error.response?.data,
    });
    message.error(error.response?.data?.message || error.message || '保存失败');
  }
};

const handleBatchOperation = () => {
  if (checkedRowKeys.value.length === 0) {
    message.warning('请先选择要操作的记录');
    return;
  }

  batchForm.value = {
    action: '',
    status: '',
    reason: '',
  };
  showBatchModal.value = true;
};

const handleConfirmBatch = async () => {
  if (!batchFormRef.value) return;

  try {
    await batchFormRef.value.validate();
    const response = await withdrawalApi.batchOperation({
      orderIds: checkedRowKeys.value,
      action: batchForm.value.action,
      status: batchForm.value.status,
      reason: batchForm.value.reason,
    });

    if (response.success) {
      message.success('批量操作成功');
      showBatchModal.value = false;
      checkedRowKeys.value = [];
      fetchData();
    }
  } catch (error) {
    message.error('批量操作失败');
    console.error('Batch operation error:', error);
  }
};

const handleExport = async () => {
  try {
    const dr = filterForm.value.dateRange;
    const endMs = dr?.[1];
    const params = {
      ...filterForm.value,
      startDate:
        dr?.[0] != null ? new Date(dr[0]).toISOString() : undefined,
      endDate:
        endMs != null
          ? exactWithdrawalRangeFromDrill.value
            ? new Date(endMs).toISOString()
            : (() => {
                const endDate = new Date(endMs);
                endDate.setHours(23, 59, 59, 999);
                return endDate.toISOString();
              })()
          : undefined,
      currency: allWithdrawalsCurrencyOverride.value || undefined,
      fundingFilter: allWithdrawalsFundingFilter.value || undefined,
    };

    const response = await withdrawalApi.exportData(
      params as import('#/api/finance/withdrawal').WithdrawListParams,
    );

    if (response.success) {
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `withdrawal-records-${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      message.success('导出成功');
    }
  } catch (error) {
    message.error('导出失败');
    console.error('Export error:', error);
  }
};

// Auto-refresh methods (simplified with SmartAutoRefresh)
const handleRefreshIntervalChange = (newInterval: number) => {
  console.log(
    'WithdrawManagement: Refresh interval changed to',
    newInterval,
    'seconds',
  );
  // SmartAutoRefresh component handles all timer logic
};

// Column configuration methods
const saveColumnConfig = () => {
  // Here you could save to localStorage or backend API
  const visibleColumns = columnConfigList.value
    .filter((col) => col.visible)
    .map((col) => col.key);
  localStorage.setItem(
    'withdrawalColumnsConfig',
    JSON.stringify(visibleColumns),
  );
  showColumnConfig.value = false;
  console.log('✅ Column configuration saved:', visibleColumns);
  // You could also trigger a table refresh here if needed
};

const resetColumnConfig = () => {
  // Reset to default visibility
  columnConfigList.value.forEach((col) => {
    if (
      col.key === 'orderId' ||
      col.key === 'memberAccount' ||
      col.key === 'appliedAt' ||
      col.key === 'withdrawAmount' ||
      col.key === 'status' ||
      col.key === 'actions'
    ) {
      col.visible = true;
    } else {
      col.visible = false;
    }
  });
  console.log('🔄 Column configuration reset to defaults');
};

// Withdrawal settings handlers
const handleWithdrawalSettingsSuccess = () => {
  console.log('✅ Withdrawal settings saved successfully');
  // Could refresh data if needed
};

// Filter columns based on visibility
const visibleColumns = computed(() => {
  return columns.filter((col) => {
    if (col.type === 'selection' || !col.key) {
      return true; // Always show selection and columns without keys
    }
    const config = columnConfigList.value.find((c) => c.key === col.key);
    return config ? config.visible : true;
  });
});

// Member search methods
const handleMemberSearch = async (query: string) => {
  console.log('🔍 Search query:', query, 'Length:', query?.length);

  if (!query || query.trim().length < 1) {
    console.log('❌ Query too short, clearing options');
    memberOptions.value = [];
    return;
  }

  try {
    memberLoading.value = true;
    console.log('🚀 Calling searchUsersApi with:', {
      q: query.trim(),
      limit: 10,
    });

    const response = await searchUsersApi({ q: query.trim(), limit: 10 });
    console.log('✅ Search response:', response);

    // Check if response is an array (direct user data) or has success/data structure
    let userData = [];
    if (Array.isArray(response)) {
      userData = response;
    } else if (response.success && response.data) {
      userData = response.data;
    } else if (response.data && Array.isArray(response.data)) {
      userData = response.data;
    }

    if (userData.length > 0) {
      // Found users - update options for autocomplete
      memberOptions.value = userData.map((user) => ({
        label: user.label,
        value: user.value,
        disabled: false,
        // Store the full user data for selection
        ...user,
      }));

      // For manual search (button click), auto-select the first user
      if (userData.length === 1) {
        selectedMember.value = userData[0];
        withdrawalForm.value.memberId = userData[0].value;
        message.success(
          `找到会员: ${userData[0].account} (${userData[0].name})`,
        );
      } else {
        message.success(`找到 ${userData.length} 个会员，请选择一个`);
      }

      console.log('✅ Member options set:', memberOptions.value);
    } else {
      console.log('❌ No users found for query:', query);
      memberOptions.value = [];
      selectedMember.value = null;
      withdrawalForm.value.memberId = '';
      message.warning(`未找到会员账号: ${query}`);
    }
  } catch (error) {
    console.error('❌ Search members error:', error);
    memberOptions.value = [];
    selectedMember.value = null;
    withdrawalForm.value.memberId = '';
    message.error('搜索会员失败，请稍后重试');
  } finally {
    memberLoading.value = false;
  }
};

const handleMemberSelect = (value: string, option: any) => {
  console.log('✅ Member selected:', value, option);

  if (option) {
    // Store the selected member data (option now contains all user data)
    selectedMember.value = {
      value: option.value,
      account: option.account,
      name: option.name,
      email: option.email,
      cpf: option.cpf,
      balance: option.balance,
      vipLevel: option.vipLevel,
    };

    // Set the form value to the user ID (numeric)
    withdrawalForm.value.memberId = option.value;

    console.log('✅ Selected member stored:', selectedMember.value);
    console.log('✅ Form memberId set to:', withdrawalForm.value.memberId);
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
  withdrawalForm.value.memberId = ''; // Clear the form memberId as well

  // Clear the search timeout when user clears
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
};

const handleMemberInput = (value: string) => {
  console.log('🔍 Member input changed:', value);

  // Clear existing timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  // Check if this value matches any option label (user selected from dropdown)
  const matchedOption = memberOptions.value.find(
    (option) => option.label === value,
  );

  if (matchedOption) {
    // User selected an option - set the form value to the numeric ID
    console.log(
      '✅ Found matching option for label:',
      value,
      '-> ID:',
      matchedOption.value,
    );
    withdrawalForm.value.memberId = matchedOption.value;

    // Update selected member data
    selectedMember.value = {
      value: matchedOption.value,
      account: matchedOption.account,
      name: matchedOption.name,
      email: matchedOption.email,
      cpf: matchedOption.cpf,
      balance: matchedOption.balance,
      vipLevel: matchedOption.vipLevel,
    };

    return; // Don't trigger search
  }

  // Check if user typed a numeric value directly
  if (/^\d+$/.test(value)) {
    console.log('🔢 User typed numeric value directly:', value);
    // Let the form keep the numeric value
    withdrawalForm.value.memberId = value;
    // Clear selection since we don't have member data
    selectedMember.value = null;
  } else {
    // Clear selection when user types a new value
    if (selectedMember.value && selectedMember.value.value !== value) {
      console.log(
        '🧹 Clearing selection because value changed:',
        selectedMember.value.value,
        '!==',
        value,
      );
      selectedMember.value = null;
    }
  }

  // Debounce the search
  searchTimeout = setTimeout(() => {
    handleMemberSearch(value);
  }, 200); // 200ms delay for better responsiveness
};

// Initialize column configuration from localStorage
const initializeColumnConfig = () => {
  try {
    const savedConfig = localStorage.getItem('withdrawalColumnsConfig');
    if (savedConfig) {
      const visibleColumnKeys = JSON.parse(savedConfig);
      columnConfigList.value.forEach((col) => {
        col.visible = visibleColumnKeys.includes(col.key);
      });
      console.log('✅ Column configuration loaded from localStorage');
    }
  } catch (error) {
    console.warn('⚠️ Failed to load column configuration:', error);
  }
};

// Fetch tab badge counts
const fetchTabCounts = async () => {
  try {
    console.log('📊 Fetching tab counts from PROPER API...');

    // 🎯 FIX: Use the REAL tab counts API that includes "由我" counts
    const response = await requestClient.get('/finance-withdrawal/tab-counts');
    console.log('📦 Tab counts response:', response);

    if (response && response.data) {
      const counts = response.data;

      // ✅ Use REAL counts from backend
      riskReviewCount.value = counts.riskReviewCount || 0;
      financeCount.value = counts.financeCount || 0;
      autoApprovalCount.value = counts.autoApprovalCount || 0;
      myRiskCount.value = counts.myRiskCount || 0; // ✅ REAL count, not simulated!
      myWithdrawalCount.value = counts.myWithdrawalCount || 0; // ✅ REAL count, not simulated!

      console.log('✅ Badge counts updated (REAL DATA):', {
        riskReview: riskReviewCount.value,
        finance: financeCount.value,
        auto: autoApprovalCount.value,
        myRisk: myRiskCount.value,
        myWithdrawal: myWithdrawalCount.value,
      });
    } else {
      console.warn('⚠️ No data in notification response, using fallback');
      await fetchTabCountsFallback();
    }
  } catch (error) {
    console.error(
      '❌ Failed to fetch tab counts from notification API:',
      error,
    );
    // Fallback to existing withdrawal API
    await fetchTabCountsFallback();
  }
};

// 🔔 Real-time SSE connection for withdrawal count updates
let sseConnection: EventSource | null = null;
let notificationAudio: HTMLAudioElement | null = null;
const previousCounts = ref({
  riskReview: 0,
  finance: 0,
});

// Initialize notification audio
const initAudioContext = () => {
  try {
    const audioUrl = `${import.meta.env.BASE_URL}sounds/withdrawal-notification.mp3`;

    notificationAudio = new Audio(audioUrl);
    notificationAudio.volume = 0.7; // 70% volume
    notificationAudio.preload = 'auto'; // Preload the audio

    console.log('🔊 Withdrawal notification audio initialized:', audioUrl);
  } catch (error) {
    console.error('Failed to initialize notification audio:', error);
  }
};

// Play notification sound
const playNotificationSound = async () => {
  try {
    if (!notificationAudio) {
      console.warn('Notification audio not initialized');
      return;
    }

    // Reset audio to start if it's already playing
    notificationAudio.currentTime = 0;

    // Play the audio
    await notificationAudio.play();

    console.log('🔔 Withdrawal notification sound played');
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

// Connect to withdrawal SSE stream
const connectToWithdrawalSSE = () => {
  try {
    const authStore = useAuthStore();
    const token = authStore.accessToken;

    if (!token) {
      console.warn('No auth token available for SSE connection');
      return;
    }

    const apiUrl =
      import.meta.env.VITE_GLOB_API_URL || 'http://localhost:5888/api';
    const sseUrl = `${apiUrl}/wallet/withdrawal-events/admin-stream?token=${token}`;

    console.log('📡 Connecting to withdrawal SSE:', sseUrl);

    sseConnection = new EventSource(sseUrl);

    sseConnection.onopen = () => {
      console.log('✅ Withdrawal SSE connected');
    };

    sseConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Withdrawal SSE message:', data);

        if (data.type === 'withdrawal_count_update' && data.counts) {
          // Update counts
          const oldRiskCount = riskReviewCount.value;
          const oldFinanceCount = financeCount.value;

          riskReviewCount.value = data.counts.riskControlCount || 0;
          financeCount.value = data.counts.financeWithdrawalCount || 0;

          // Play sound if count increased
          const riskIncreased = riskReviewCount.value > oldRiskCount;
          const financeIncreased = financeCount.value > oldFinanceCount;

          if (riskIncreased || financeIncreased) {
            playNotificationSound();
            console.log('🔔 New withdrawal notification!', {
              riskControl: `${oldRiskCount} -> ${riskReviewCount.value}`,
              finance: `${oldFinanceCount} -> ${financeCount.value}`,
            });
          }

          console.log('✅ Withdrawal counts updated via SSE:', {
            riskControl: riskReviewCount.value,
            finance: financeCount.value,
          });
        }

        // Handle individual withdrawal status updates (remove from table if completed)
        if (
          data.type === 'withdrawal_count_update' &&
          data.withdrawalId &&
          data.newStatus
        ) {
          const completedStatuses = [
            'success',
            'failed',
            'rejected',
            'canceled',
          ];
          if (completedStatuses.includes(data.newStatus)) {
            // Trigger refresh of active tab to remove completed withdrawal
            console.log(
              `🔄 Withdrawal ${data.withdrawalId} completed (${data.newStatus}), refreshing active tab...`,
            );
            // The child components will handle their own refresh when they receive the 'refresh-tabs' event
          }
        }
      } catch (error) {
        console.error('Error processing SSE message:', error);
      }
    };

    sseConnection.onerror = (error) => {
      console.error('❌ Withdrawal SSE error:', error);
      sseConnection?.close();

      // Reconnect after 5 seconds
      setTimeout(() => {
        console.log('🔄 Reconnecting to withdrawal SSE...');
        connectToWithdrawalSSE();
      }, 5000);
    };
  } catch (error) {
    console.error('Failed to connect to withdrawal SSE:', error);
  }
};

// Disconnect from SSE
const disconnectFromWithdrawalSSE = () => {
  if (sseConnection) {
    sseConnection.close();
    sseConnection = null;
    console.log('🔌 Disconnected from withdrawal SSE');
  }
};

// Fallback method using existing withdrawal API
// 🔧 FIX: Stagger API calls to prevent database connection race condition
const fetchTabCountsFallback = async () => {
  try {
    console.log('📊 Fetching tab counts (fallback method)...');

    // Call sequentially instead of parallel to avoid overwhelming database connection

    // 1. 风控审核 (Risk Control Review) - status: 'reviewing'
    const riskResponse = await withdrawalApi.getList({
      status: 'reviewing',
      pageSize: 1,
    });
    riskReviewCount.value =
      riskResponse.total ||
      riskResponse.pagination?.total ||
      riskResponse.data?.total ||
      0;
    console.log(`✅ 风控审核 count: ${riskReviewCount.value}`, riskResponse);

    // Small delay to prevent connection pool exhaustion
    await new Promise((resolve) => setTimeout(resolve, 50));

    // 2. 财务出款 (Finance Withdrawal) - status: 'pending'
    const financeResponse = await withdrawalApi.getList({
      status: 'pending',
      pageSize: 1,
    });
    financeCount.value =
      financeResponse.total ||
      financeResponse.pagination?.total ||
      financeResponse.data?.total ||
      0;
    console.log(`✅ 财务出款 count: ${financeCount.value}`, financeResponse);

    await new Promise((resolve) => setTimeout(resolve, 50));

    // 3. 免审出款 (Auto Approval) - status: 'processing'
    const autoResponse = await withdrawalApi.getList({
      status: 'processing',
      pageSize: 1,
    });
    autoApprovalCount.value =
      autoResponse.total ||
      autoResponse.pagination?.total ||
      autoResponse.data?.total ||
      0;
    console.log(`✅ 免审出款 count: ${autoApprovalCount.value}`, autoResponse);

    // For "由我" tabs, we'll start with the same counts as the main tabs
    // These can be refined later when user assignment logic is implemented
    myRiskCount.value = Math.floor(riskReviewCount.value / 2); // Simulated assigned count
    myWithdrawalCount.value = Math.floor(financeCount.value / 2); // Simulated assigned count

    console.log('📊 All tab counts fetched:', {
      risk: riskReviewCount.value,
      finance: financeCount.value,
      auto: autoApprovalCount.value,
    });
  } catch (error) {
    console.error('❌ Failed to fetch tab counts:', error);
    // Silent fallback failure - set defaults
    riskReviewCount.value = 0;
    financeCount.value = 0;
    autoApprovalCount.value = 0;
    myRiskCount.value = 0;
    myWithdrawalCount.value = 0;
  }
};

// Handle refresh tabs event from child components
const handleRefreshTabs = () => {
  console.log('🔄 Refreshing all tabs after lock/unlock operation');
  // Refresh tab counts to update badges
  fetchTabCounts();

  // If we're on the all-withdrawals tab, also refresh the main data
  if (activeTab.value === 'all-withdrawals') {
    fetchData();
  }
};

// Show withdrawal detail modal
const showDetail = (row: WithdrawOrder) => {
  console.log(' Opening withdrawal detail modal for order:', row.orderId);
  detailModalData.value = row;
  showDetailModal.value = true;
};

// Show member detail modal - pass memberId to existing UserDetailModal
const showMemberDetail = (row: WithdrawOrder) => {
  console.log('👤 [CLICK] Member detail clicked:', {
    'row.memberId': row.memberId,
    'row.userID': row.userID,
    'typeof row.memberId': typeof row.memberId,
    'Number(row.memberId)': Number(row.memberId),
    'will pass to modal': Number(row.memberId),
  });

  // Use the internal database ID (memberId), not the 9-digit userID
  currentMemberUserId.value = Number(row.memberId);
  showMemberDetailModal.value = true;
};

// Copy to clipboard helper
const copyToClipboard = (text: string, label: string = '内容') => {
  if (!text || text === '-') {
    message.warning('无内容可复制');
    return;
  }
  navigator.clipboard
    .writeText(text)
    .then(() => {
      message.success(`已复制${label}`);
    })
    .catch(() => {
      message.error('复制失败');
    });
};

// Load member tiers for the filter dropdown
const loadMemberTiers = async () => {
  try {
    console.log('🔍 Loading member tiers for filter dropdown...');
    const response = await getMemberTiersApi({
      isActive: true,
      pageSize: 100,
      sortBy: 'sortOrder',
      sortOrder: 'asc',
    });

    console.log(' Member tiers response:', response);

    if (response && response.list && response.list.length > 0) {
      memberTierOptions.value = response.list.map((tier: any) => ({
        label: tier.tierName,
        value: tier.tierCode,
        tier: tier,
      }));
      console.log('✅ Loaded member tier options:', memberTierOptions.value);
    } else {
      console.warn('⚠️ No member tiers found');
      memberTierOptions.value = [];
    }
  } catch (error) {
    console.error('❌ 加载会员层级失败:', error);
    memberTierOptions.value = [];
  }
};

// Lifecycle
onMounted(async () => {
  console.log('🚀 Component mounted, loading data...');
  applyWithdrawalListQueryFromRoute();
  initializeColumnConfig();

  // Initialize audio context for notifications
  initAudioContext();

  // Load member tiers for the filter dropdown
  loadMemberTiers();

  // 🔧 FIX: Load data sequentially to prevent database connection race
  // Load main data first
  await fetchData();

  // 🔔 Connect to real-time SSE for withdrawal count updates
  connectToWithdrawalSSE();

  // Small delay before loading tab counts
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Then load tab counts (which makes additional queries)
  fetchTabCounts();
});

// Watch for tab changes to stop auto-refresh when leaving 'all-withdrawals' tab
watch(activeTab, (newTab, oldTab) => {
  if (oldTab === 'all-withdrawals' && newTab !== 'all-withdrawals') {
    console.log(
      '📦 Switching away from all-withdrawals tab, stopping auto-refresh',
    );
    // SmartAutoRefresh component handles its own cleanup automatically
    autoRefreshEnabled.value = false;
  }
  if (newTab === 'all-withdrawals') {
    console.log('📦 Switched to all-withdrawals tab');
    fetchData();
  }
});

// Clean up on unmount
onUnmounted(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  // Disconnect from SSE
  disconnectFromWithdrawalSSE();

  // SmartAutoRefresh handles its own cleanup
  console.log('🧹 Component unmounted');
});
</script>

<style scoped>
.withdraw-management {
  padding: 16px;
}

/* Grid utilities */
.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.gap-4 {
  gap: 1rem;
}

.col-span-1 {
  grid-column: span 1 / span 1;
}

.w-full {
  width: 100%;
}

.flex {
  display: flex;
}

.flex-wrap {
  flex-wrap: wrap;
}

.flex-1 {
  flex: 1 1 0%;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.items-center {
  align-items: center;
}

.items-end {
  align-items: flex-end;
}

.justify-between {
  justify-content: space-between;
}

.min-w-\[300px\] {
  min-width: 300px;
}

/* Responsive utilities */
@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .md\:col-span-2 {
    grid-column: span 2 / span 2;
  }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .xl\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

/* Spacing utilities */
.space-y-1 > * + * {
  margin-top: 0.25rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.gap-2 {
  gap: 0.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

/* Color utilities */
.text-red-600 {
  color: #dc2626;
}

.text-green-600 {
  color: #16a34a;
}

.text-blue-600 {
  color: #2563eb;
}

.text-orange-600 {
  color: #ea580c;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-600 {
  color: #4b5563;
}

/* Background utilities */
.bg-gray-50 {
  background-color: #f9fafb;
}

.rounded {
  border-radius: 0.375rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.p-2 {
  padding: 0.5rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

/* Typography utilities */
.font-medium {
  font-weight: 500;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.text-center {
  text-align: center;
}

.auto-refresh-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Withdrawal Modal Styles */
.withdrawal-modal-content {
  padding: 0;
}

.member-search-section {
  margin-bottom: 24px;
}

.member-info-section {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 24px;
}

.balance-section {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 24px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-label.required::before {
  content: '*';
  color: #ef4444;
  margin-right: 4px;
}

.action-buttons {
  margin-top: 24px;
}

/* Detail Modal Styles */
.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: #666;
  font-size: 14px;
  min-width: 120px;
}

.info-value {
  color: #333;
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  text-align: right;
}

.col-span-2 {
  grid-column: span 2 / span 2;
}

.info-value-with-copy {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: flex-end;
}

.copy-btn {
  opacity: 0.5;
  transition: opacity 0.2s;
  padding: 4px;
}

.copy-btn:hover {
  opacity: 1;
}

.info-item:hover .copy-btn {
  opacity: 0.8;
}
</style>
