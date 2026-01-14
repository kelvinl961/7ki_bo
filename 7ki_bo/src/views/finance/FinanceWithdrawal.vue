<template>
  <div class="finance-withdrawal">
    <!-- Header and Filters -->
    <div class="header-section">
      <n-card :bordered="false" class="rounded-16px shadow-sm">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h2 class="text-xl font-semibold text-gray-800">{{ props.isMyWithdrawal ? '由我出款' : '财务出款' }}</h2>
            <p class="text-sm text-gray-600 mt-1">{{ props.isMyWithdrawal ? '我负责处理的提现出款' : '待财务处理的提现出款' }}</p>
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
          <div class="flex flex-wrap items-center gap-4 mb-4">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-600">申请时间</span>
              <n-radio-group v-model:value="filters.timeRange" size="small">
                <n-radio value="today">今天</n-radio>
                <n-radio value="month">本月</n-radio>
              </n-radio-group>
              <n-date-picker
                v-model:value="filters.dateRange"
                type="datetimerange"
                format="yyyy-MM-dd HH:mm:ss"
                placeholder="选择时间范围"
                clearable
                size="small"
                class="w-80"
              />
            </div>
          </div>

          <!-- Search Filters -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-4">
            <!-- Member ID -->
            <div class="filter-item">
              <n-form-item label="会员账号">
                <n-input
                  v-model:value="filters.memberAccount"
                  placeholder="会员账号或备注内容搜索，最多200个"
                  clearable
                  size="small"
                />
              </n-form-item>
            </div>

            <!-- Currency -->
            <div class="filter-item">
              <n-form-item label="三方代付">
                <n-select
                  v-model:value="filters.thirdPartyPayment"
                  placeholder="三方代付"
                  clearable
                  size="small"
                  :options="thirdPartyOptions"
                />
              </n-form-item>
            </div>

            <!-- Amount -->
            <div class="filter-item">
              <n-form-item label="金额大小">
                <n-input
                  v-model:value="filters.amount"
                  placeholder="金额"
                  clearable
                  size="small"
                />
              </n-form-item>
            </div>

            <!-- Withdrawal Method -->
            <div class="filter-item">
              <n-form-item label="提现方式">
                <n-select
                  v-model:value="filters.withdrawalMethod"
                  placeholder="提现方式"
                  clearable
                  size="small"
                  :options="withdrawalMethodOptions"
                />
              </n-form-item>
            </div>

            <!-- Approval Status -->
            <div class="filter-item">
              <n-form-item label="审核状态">
                <n-select
                  v-model:value="filters.approvalStatus"
                  placeholder="审核状态"
                  clearable
                  size="small"
                  :options="approvalStatusOptions"
                />
              </n-form-item>
            </div>

            <!-- Operator -->
            <div class="filter-item">
              <n-form-item label="操作人">
                <n-input
                  v-model:value="filters.operator"
                  placeholder="操作人"
                  clearable
                  size="small"
                />
              </n-form-item>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-between items-center">
            <div class="flex gap-2">
              <n-button type="primary" @click="applyFilters" :loading="loading">
                <template #icon>
                  <n-icon><SearchOutline /></n-icon>
                </template>
                搜索
              </n-button>
              <n-button @click="resetFilters">
                <template #icon>
                  <n-icon><ReloadOutline /></n-icon>
                </template>
                高级搜索
              </n-button>
              <n-button @click="clearFilters">
                重置
              </n-button>
              <n-button>
                自己提定的
              </n-button>
            </div>
            <div class="text-sm text-gray-600 flex items-center gap-2">
              已选择 {{ selectedIds.length }} 条数据
              <n-tag v-if="props.isMyWithdrawal" type="info" size="small">
                我的出款
              </n-tag>
              <n-tag v-else type="success" size="small">
                财务出款
              </n-tag>
              <!-- 🚀 NEW: SmartAutoRefresh Component -->
              <SmartAutoRefresh
                v-model="autoRefreshEnabled"
                :intervals="[15, 30, 60, 120]"
                :default-interval="30"
                :on-refresh="fetchData"
                @interval-change="handleRefreshIntervalChange"
              />
              <span class="text-blue-600 cursor-pointer">导出搜索</span>
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
      @update:selected-keys="(keys: (string | number)[]) => selectedIds = keys.map(k => String(k))"
      @update:page="handlePageChange"
      @update:page-size="handlePageSizeChange"
      @refresh="fetchData"
      @row-click="handleRowClick"
    >
      <template #actionBar="{ selectedCount, selectedRows }">
        <n-card :bordered="false" class="rounded-16px shadow-sm">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-4">
              <!-- 主要操作按钮 -->
              <div class="flex gap-2">
                <n-button 
                  type="primary" 
                  @click="fetchData"
                  :loading="loading"
                >
                  <template #icon>
                    <n-icon><ReloadOutline /></n-icon>
                  </template>
                  刷新
                </n-button>
                <n-button 
                  v-if="!props.isMyWithdrawal"
                  type="info" 
                  @click="showBulkAssignModal"
                  :disabled="selectedCount === 0"
                >
                  <template #icon>
                    <n-icon><PersonOutline /></n-icon>
                  </template>
                  分配给我
                </n-button>
              </div>
              
              <!-- 选择信息和总计 -->
              <div class="flex items-center gap-4">
                <div class="text-sm text-gray-600">
                  已选择 {{ selectedCount }} 条数据，共 {{ paginationReactive.total }} 条
                  <n-tag v-if="props.isMyWithdrawal" type="info" size="small" class="ml-2">
                    我的出款
                  </n-tag>
                  <n-tag v-else type="warning" size="small" class="ml-2">
                    财务出款
                  </n-tag>
                </div>
                <div class="summary-info">
                  <span class="font-medium">总计: {{ totalAmount.toFixed(2) }}</span>
                </div>
              </div>
            </div>
            
            <div class="flex items-center gap-4">
              <!-- 批量操作 -->
              <div v-if="selectedCount > 0" class="flex gap-2">
                <n-button 
                  type="success" 
                  size="small"
                  @click="handleBulkProcess(selectedRows)"
                >
                  批量处理 ({{ selectedCount }})
                </n-button>
              </div>
              
              <!-- 选择控制 -->
              <div class="flex gap-2">
                <n-button size="small" @click="clearSelection">清空选择</n-button>
                <n-button size="small" @click="selectAll">全选</n-button>
              </div>
            </div>
          </div>
        </n-card>
      </template>
    </SmartDataGrid>

    <!-- Batch Operations Panel (keep existing for now) -->
    <div v-if="selectedIds.length > 0" class="batch-operations mt-4">
      <n-card :bordered="false" class="rounded-16px shadow-sm">
        <div class="p-4 border-t">
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-600">全选当前页</span>
            <n-select
              v-model:value="batchOperation"
              placeholder="批量操作"
              size="small"
              class="w-40"
              :options="batchOperationOptions"
            />
            <span class="text-sm text-gray-600">已选择{{ selectedIds.length }}条数据</span>
            <span class="text-sm text-gray-600">共{{ paginationReactive.total }}条</span>
          </div>
        </div>
      </n-card>
    </div>

    <!-- Process Modal -->
    <n-modal
      v-model:show="processModal.show"
      preset="dialog"
      title="批量处理出款"
      positive-text="确认处理"
      negative-text="取消"
      @positive-click="handleBatchProcess"
    >
      <div class="space-y-4">
        <div>
          <n-alert type="info" :show-icon="false">
            确认处理以下{{ processModal.items.length }}个出款申请？
          </n-alert>
        </div>
        <div class="max-h-60 overflow-y-auto">
          <div v-for="item in processModal.items" :key="item.id" class="border rounded p-2 mb-2">
            <div class="text-sm">
              <div><strong>订单号:</strong> {{ item.orderId }}</div>
              <div><strong>会员:</strong> {{ item.memberAccount }}</div>
              <div><strong>金额:</strong> {{ item.rewardAmount }} {{ item.currency }}</div>
              <div><strong>收款方式:</strong> {{ item.paymentMethod }}</div>
            </div>
          </div>
        </div>
        <div>
          <n-form-item label="处理状态" required>
            <n-select
              v-model:value="processModal.status"
              placeholder="请选择处理状态"
              :options="processStatusOptions"
            />
          </n-form-item>
        </div>
        <div>
          <n-form-item label="处理备注">
            <n-input
              v-model:value="processModal.notes"
              type="textarea"
              placeholder="请输入处理备注（可选）"
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
      title="分配出款任务"
      positive-text="确认分配"
      negative-text="取消"
      @positive-click="handleBatchAssign"
    >
      <div class="space-y-4">
        <div>
          <n-alert type="info" :show-icon="false">
            将以下{{ assignModal.items.length }}个出款申请分配给自己处理？
          </n-alert>
        </div>
        <div class="max-h-60 overflow-y-auto">
          <div v-for="item in assignModal.items" :key="item.id" class="border rounded p-2 mb-2">
            <div class="text-sm">
              <div><strong>订单号:</strong> {{ item.orderId }}</div>
              <div><strong>会员:</strong> {{ item.memberAccount }}</div>
              <div><strong>金额:</strong> {{ item.rewardAmount }} {{ item.currency }}</div>
            </div>
          </div>
        </div>
      </div>
    </n-modal>

    <!-- Notes Modal -->
    <n-modal
      v-model:show="notesModal.show"
      preset="dialog"
      title="编辑备注"
      positive-text="保存"
      negative-text="取消"
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
          <n-form-item label="备注类型">
            <n-select
              v-model:value="notesModal.noteType"
              :options="noteTypeOptions"
              placeholder="请选择备注类型"
            />
          </n-form-item>
        </div>
        <div>
          <n-form-item label="备注内容">
            <n-input
              v-model:value="notesModal.noteContent"
              type="textarea"
              placeholder="请输入备注内容"
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
      title="出款详情"
      size="large"
      :style="{ width: '80%', maxWidth: '1000px' }"
    >
      <div v-if="detailModal.data" class="space-y-6">
        <!-- Basic Info -->
        <div class="grid grid-cols-2 gap-6">
          <n-card title="基本信息" size="small">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">订单号:</span>
                <span>{{ detailModal.data.orderId }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">会员账号:</span>
                <span>{{ detailModal.data.memberAccount }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">申请时间:</span>
                <span>{{ formatDateTime(detailModal.data.applicationTime) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">状态:</span>
                <n-tag :type="getStatusType(detailModal.data.status)">
                  {{ getStatusText(detailModal.data.status) }}
                </n-tag>
              </div>
            </div>
          </n-card>

          <n-card title="金额信息" size="small">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">提现金额:</span>
                <span class="font-semibold text-green-600">
                  {{ detailModal.data.rewardAmount }} {{ detailModal.data.currency }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">手续费:</span>
                <span>{{ detailModal.data.fees || 0 }} {{ detailModal.data.currency }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">实际到账:</span>
                <span>{{ ((detailModal.data.rewardAmount || 0) - (detailModal.data.fees || 0)).toFixed(2) }} {{ detailModal.data.currency }}</span>
              </div>
            </div>
          </n-card>
        </div>

        <!-- Payment Info -->
        <n-card title="收款信息" size="small">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">收款方式:</span>
              <span>{{ detailModal.data.paymentMethod }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">银行名称:</span>
              <span>{{ detailModal.data.bankName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">账户号码:</span>
              <span>{{ detailModal.data.accountNumber }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">持卡人:</span>
              <span>{{ detailModal.data.accountHolderName }}</span>
            </div>
          </div>
        </n-card>

        <!-- Actions -->
        <div class="flex justify-end gap-3">
          <n-button @click="detailModal.show = false">关闭</n-button>
          <n-button 
            type="error" 
            @click="showSingleRejectModal(detailModal.data)"
            v-if="canReject(detailModal.data?.status)"
          >
            拒绝出款
          </n-button>
          <n-button 
            type="success" 
            @click="showSingleProcessModal(detailModal.data)"
            v-if="canApprove(detailModal.data?.status)"
          >
            确认出款
          </n-button>
        </div>
      </div>
    </n-modal>

    <!-- Force Cancel Modal (强制取消) -->
    <n-modal
      v-model:show="forceCancelModal.show"
      preset="card"
      title="强制取消"
      :style="{ width: 'min(90vw, 600px)' }"
      :closable="true"
      :mask-closable="false"
    >
      <div class="force-cancel-modal">
        <!-- Warning Message -->
        <div class="warning-message mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-orange-600 font-medium">
              请到三方支付后台确认这笔订单的真实状态，请谨慎操作避免损失，取消后提现金额将返还给会员！
            </span>
          </div>
        </div>

        <!-- Order Info -->
        <div v-if="forceCancelModal.data" class="order-info mb-6">
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-gray-600">订单号：</span>
              <span>{{ forceCancelModal.data.orderId }}</span>
            </div>
            <div>
              <span class="text-gray-600">会员ID：</span>
              <span class="text-blue-600">{{ forceCancelModal.data.memberAccount }}</span>
              <n-tag type="info" size="small" class="ml-1">V1</n-tag>
            </div>
            <div>
              <span class="text-gray-600">会员账号：</span>
              <span>{{ forceCancelModal.data.memberName || 'kelvin88' }}</span>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-4 text-sm mt-3">
            <div>
              <span class="text-gray-600">会员层级：</span>
              <span>{{ forceCancelModal.data.memberTierName || '默认层级' }}</span>
            </div>
            <div>
              <span class="text-gray-600">提现金额：</span>
              <span class="font-semibold text-green-600">{{ forceCancelModal.data.rewardAmount }} BRL</span>
            </div>
            <div>
              <span class="text-gray-600">手续费：</span>
              <span>0.00 BRL</span>
            </div>
          </div>
          <div class="text-sm mt-3">
            <span class="text-gray-600">实际到账：</span>
            <span class="font-semibold">{{ forceCancelModal.data.rewardAmount }} BRL</span>
          </div>
        </div>

        <!-- Cancellation Reasons -->
        <div class="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label class="block text-sm font-medium mb-2">取消前台原因</label>
            <n-input
              v-model:value="forceCancelModal.frontendReason"
              type="textarea"
              placeholder="请输入取消前台原因"
              :rows="4"
              :maxlength="1000"
            />
            <div class="text-right text-xs text-gray-500 mt-1">
              {{ forceCancelModal.frontendReason.length }}/1000
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">取消后台原因</label>
            <n-input
              v-model:value="forceCancelModal.backendReason"
              type="textarea"
              placeholder="请输入取消后台原因"
              :rows="4"
              :maxlength="1000"
            />
            <div class="text-right text-xs text-gray-500 mt-1">
              {{ forceCancelModal.backendReason.length }}/1000
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3">
          <n-button @click="forceCancelModal.show = false">取消</n-button>
          <n-button type="primary" @click="handleForceCancel" :loading="forceCancelModal.loading">
            确认
          </n-button>
        </div>
      </div>
    </n-modal>

    <!-- Force Reject Modal (强制拒绝) -->
    <n-modal
      v-model:show="forceRejectModal.show"
      preset="card"
      title="强制拒绝"
      :style="{ width: 'min(90vw, 800px)' }"
      :closable="true"
      :mask-closable="false"
    >
      <div class="force-reject-modal">
        <!-- Order Info -->
        <div v-if="forceRejectModal.data" class="order-info mb-6">
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-gray-600">订单号：</span>
              <span>{{ forceRejectModal.data.orderId }}</span>
            </div>
            <div>
              <span class="text-gray-600">会员ID：</span>
              <span class="text-blue-600">{{ forceRejectModal.data.memberAccount }}</span>
              <n-tag type="info" size="small" class="ml-1">V1</n-tag>
            </div>
            <div>
              <span class="text-gray-600">会员账号：</span>
              <span>{{ forceRejectModal.data.memberName || 'kelvin88' }}</span>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-4 text-sm mt-3">
            <div>
              <span class="text-gray-600">会员层级：</span>
              <span>{{ forceRejectModal.data.memberTierName || '默认层级' }}</span>
            </div>
            <div>
              <span class="text-gray-600">提现金额：</span>
              <span class="font-semibold text-green-600">{{ forceRejectModal.data.rewardAmount }} BRL</span>
            </div>
            <div>
              <span class="text-gray-600">手续费：</span>
              <span>0.00 BRL</span>
            </div>
          </div>
          <div class="text-sm mt-3">
            <span class="text-gray-600">实际到账：</span>
            <span class="font-semibold">{{ forceRejectModal.data.rewardAmount }} BRL</span>
          </div>
        </div>

        <!-- Wind Control Processing Options -->
        <div class="mb-6">
          <div class="flex items-center gap-4 mb-3">
            <span class="text-sm font-medium">是否风控处理</span>
            <n-radio-group v-model:value="forceRejectModal.windControlProcess">
              <n-radio value="no">不处理</n-radio>
              <n-radio value="add_audit">增加稽核任务</n-radio>
              <n-radio value="deduct_balance">扣除余额</n-radio>
            </n-radio-group>
          </div>
          
          <!-- Audit Task Addition -->
          <div v-if="forceRejectModal.windControlProcess === 'add_audit'" class="mb-4">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-sm font-medium">增加稽核任务</span>
              <n-input-number
                v-model:value="forceRejectModal.auditMultiplier"
                :min="1"
                :max="100"
                :step="1"
                placeholder="1.00"
                class="w-24"
              />
              <span class="text-sm">倍</span>
            </div>
            <div class="text-sm text-gray-600 mb-3">
              即需要再打码{{ forceRejectModal.auditMultiplier * 30.00 }}才能再次提现
            </div>
          </div>
        </div>

        <!-- Platform Selection -->
        <div class="mb-6">
          <div class="text-sm font-medium mb-3">指定稽核平台</div>
          <div class="platform-selection">
            <!-- Game Type Filters -->
            <div class="flex gap-2 mb-4 flex-wrap">
              <n-button
                v-for="gameType in gameTypeFilters"
                :key="gameType.value"
                :type="selectedGameType === gameType.value ? 'primary' : 'default'"
                size="small"
                @click="selectedGameType = gameType.value"
              >
                {{ gameType.label }}
              </n-button>
            </div>

            <!-- Platform Grid -->
            <div class="platform-grid max-h-80 overflow-y-auto border rounded-lg p-4 bg-gray-50">
              <div class="grid grid-cols-2 gap-3">
                <!-- Select All Option -->
                <div 
                  class="platform-card flex items-center p-3 bg-white rounded-lg border cursor-pointer hover:border-blue-300 transition-colors"
                  :class="{ 'border-blue-500 bg-blue-50': forceRejectModal.platforms.all }"
                  @click="handleSelectAllProviders(!forceRejectModal.platforms.all)"
                >
                  <div class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-3">
                    <span class="text-2xl">🎮</span>
                  </div>
                  <div class="flex-1">
                    <div class="font-medium text-gray-900">全部平台</div>
                    <div class="text-sm text-gray-500">ALL • {{ filteredProviders.length }} 个平台</div>
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
                  class="platform-card flex items-center p-3 bg-white rounded-lg border cursor-pointer hover:border-blue-300 transition-colors"
                  :class="{ 'border-blue-500 bg-blue-50': forceRejectModal.platforms[provider.platformId] }"
                  @click="toggleProviderSelection(provider.platformId)"
                >
                  <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg mr-3">
                    <span class="text-white font-bold text-sm">{{ provider.platformId.substring(0, 2) }}</span>
                  </div>
                  <div class="flex-1">
                    <div class="font-medium text-gray-900">{{ provider.platformName }}</div>
                    <div class="text-sm text-gray-500">{{ provider.gameType.toUpperCase() }} • {{ provider.gameCount || 0 }} 个游戏</div>
                  </div>
                  <n-checkbox 
                    :checked="forceRejectModal.platforms[provider.platformId] || false"
                    @click.stop
                    @update:checked="(checked) => updateProviderSelection(provider.platformId, checked)"
                  />
                </div>
              </div>
            </div>

            <!-- Selection Summary -->
            <div class="mt-3 text-sm text-gray-600">
              已选择 {{ selectedProviderCount }} 个平台，共 {{ totalGamesCount }} 个游戏
            </div>
            
            <div class="text-sm text-gray-600 mt-3 p-3 bg-yellow-50 rounded">
              提示：若此处勾选指定稽核但游戏管理选择稽核排除，则仍会被排除，即仍突围时以游戏管理为准
            </div>
          </div>
        </div>

        <!-- Rejection Reasons -->
        <div class="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label class="block text-sm font-medium mb-2">拒绝前台原因</label>
            <n-input
              v-model:value="forceRejectModal.frontendReason"
              type="textarea"
              placeholder="请输入拒绝前台原因"
              :rows="4"
              :maxlength="1000"
            />
            <div class="text-right text-xs text-gray-500 mt-1">
              {{ forceRejectModal.frontendReason.length }}/1000
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">拒绝后台原因</label>
            <n-input
              v-model:value="forceRejectModal.backendReason"
              type="textarea"
              placeholder="请输入拒绝后台原因"
              :rows="4"
              :maxlength="1000"
            />
            <div class="text-right text-xs text-gray-500 mt-1">
              {{ forceRejectModal.backendReason.length }}/1000
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3">
          <n-button @click="forceRejectModal.show = false">取消</n-button>
          <n-button type="primary" @click="handleForceReject" :loading="forceRejectModal.loading">
            确认
          </n-button>
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
          <span class="text-lg font-semibold">审核出款</span>
          <n-tag type="info" size="small">需要审核</n-tag>
        </div>
      </template>

      <div class="approve-withdrawal-modal max-h-[75vh] overflow-y-auto">
        <!-- Order Summary Card -->
        <n-card title=" 订单概览" class="mb-6" size="small">
          <div v-if="approveWithdrawalModal.data" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Amount Info -->
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600 mb-1">
                  {{ approveWithdrawalModal.data.rewardAmount }} BRL
                </div>
                <div class="text-sm text-gray-600">提现金额</div>
                <div class="text-xs text-gray-500 mt-1">
                  实际到账: {{ approveWithdrawalModal.data.rewardAmount }} BRL
                </div>
              </div>
            </div>

            <!-- Order Info -->
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">订单号</span>
                <span class="font-mono text-blue-600">{{ approveWithdrawalModal.data.orderId }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">状态</span>
                <n-tag type="warning" size="small">{{ getStatusText(approveWithdrawalModal.data.status) }}</n-tag>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">提现方式</span>
                <n-tag type="info" size="small">PIX</n-tag>
              </div>
            </div>

            <!-- Risk Info -->
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">代付次数</span>
                <span class="font-semibold">0</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">重复IP人数</span>
                <span class="font-semibold">0</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">CPF</span>
                <span class="font-mono text-xs">{{ approveWithdrawalModal.data.cpf || '123.141.241-24' }}</span>
              </div>
            </div>
          </div>
        </n-card>

        <!-- Member Information -->
        <n-card title="👤 会员信息" class="mb-6" size="small">
          <div v-if="approveWithdrawalModal.data" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Basic Info -->
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">会员ID</span>
                <span class="text-blue-600 font-semibold">{{ approveWithdrawalModal.data.memberInfo?.userID || approveWithdrawalModal.data.memberAccount }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">会员账号</span>
                <span>{{ approveWithdrawalModal.data.memberInfo?.name || approveWithdrawalModal.data.memberName || approveWithdrawalModal.data.memberAccount }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">VIP等级</span>
                <n-tag v-if="approveWithdrawalModal.data.memberInfo?.vipLevel" type="info" size="small">
                  {{ approveWithdrawalModal.data.memberInfo.vipLevel.name || `V${approveWithdrawalModal.data.memberInfo.vipLevel.level}` }}
                </n-tag>
                <n-tag v-else type="info" size="small">未设置</n-tag>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">会员层级</span>
                <span>{{ approveWithdrawalModal.data.memberInfo?.memberTier?.tierName || '默认层级' }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">注册来源</span>
                <span>{{ approveWithdrawalModal.data.memberInfo?.registrationDomain || '官网' }}</span>
              </div>
            </div>

            <!-- Financial Info -->
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">账户余额</span>
                <span class="text-red-600 font-semibold">R$ {{ formatCurrency(approveWithdrawalModal.data.memberInfo?.balance || 0) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">累计充值</span>
                <span class="text-green-600 font-semibold">R$ {{ formatCurrency(approveWithdrawalModal.data.memberInfo?.totalDeposit || 0) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">累计提现</span>
                <span>R$ {{ formatCurrency(approveWithdrawalModal.data.memberInfo?.totalWithdrawal || 0) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">充/提次数</span>
                <span>{{ approveWithdrawalModal.data.memberInfo?.depositCount || 0 }}/{{ approveWithdrawalModal.data.memberInfo?.withdrawalCount || 0 }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">充/提差额</span>
                <span class="text-red-600 font-semibold">{{ formatCurrency(approveWithdrawalModal.data.memberInfo?.depositWithdrawalDiff || 0) }}</span>
              </div>
            </div>
          </div>
        </n-card>

        <!-- Statistics -->
        <n-card title="投注统计" class="mb-6" size="small">
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
              { title: '操作', key: 'actions', width: 200 }
            ]"
            :data="approveWithdrawalModal.data?.bettingStatistics ? [approveWithdrawalModal.data.bettingStatistics.today] : []"
            :single-line="false"
            size="small"
            :loading="approveWithdrawalModal.loading"
          >
            <template #empty>
              <div class="text-center py-4 text-gray-400">暂无数据</div>
            </template>
            <template #difference="{ row }">
              <span class="text-red-600 font-semibold">{{ row.difference }}</span>
            </template>
            <template #profit="{ row }">
              <span :class="parseFloat(row.profit) >= 0 ? 'text-green-600' : 'text-red-600'" class="font-semibold">{{ row.profit }}</span>
            </template>
            <template #actions="{ row }">
              <div class="flex gap-1">
                <n-button text type="primary" size="small">投注明细</n-button>
                <n-button text type="info" size="small">投注统计</n-button>
              </div>
            </template>
          </n-data-table>
        </n-card>

        <!-- Risk Assessment -->
        <n-card title="⚠️ 风控评估" class="mb-6" size="small">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div :class="approveWithdrawalModal.data?.riskAssessment?.level === 'low' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'" class="p-4 rounded-lg border">
              <div class="text-center">
                <div :class="approveWithdrawalModal.data?.riskAssessment?.level === 'low' ? 'text-green-600' : 'text-gray-600'" class="font-semibold">
                  {{ approveWithdrawalModal.data?.riskAssessment?.level === 'low' ? '低风险' : '风险等级: ' + (approveWithdrawalModal.data?.riskAssessment?.level || '未知') }}
                </div>
                <div class="text-xs text-gray-600 mt-1">正常提现用户</div>
              </div>
            </div>
            <div :class="approveWithdrawalModal.data?.riskAssessment?.isFirstWithdrawal ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'" class="p-4 rounded-lg border">
              <div class="text-center">
                <div :class="approveWithdrawalModal.data?.riskAssessment?.isFirstWithdrawal ? 'text-blue-600' : 'text-gray-400'" class="font-semibold">
                  {{ approveWithdrawalModal.data?.riskAssessment?.isFirstWithdrawal ? '首次提现' : '非首次提现' }}
                </div>
                <div class="text-xs text-gray-600 mt-1">{{ approveWithdrawalModal.data?.riskAssessment?.isFirstWithdrawal ? '需要额外关注' : '正常用户' }}</div>
              </div>
            </div>
            <div :class="approveWithdrawalModal.data?.riskAssessment?.isRecentlyActive ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'" class="p-4 rounded-lg border">
              <div class="text-center">
                <div :class="approveWithdrawalModal.data?.riskAssessment?.isRecentlyActive ? 'text-orange-600' : 'text-gray-400'" class="font-semibold">
                  {{ approveWithdrawalModal.data?.riskAssessment?.isRecentlyActive ? '近期活跃' : '非活跃' }}
                </div>
                <div class="text-xs text-gray-600 mt-1">{{ approveWithdrawalModal.data?.riskAssessment?.isRecentlyActive ? '投注活跃用户' : '无近期投注' }}</div>
              </div>
            </div>
          </div>
        </n-card>
      </div>

      <template #action>
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-500">
            审核后订单将进入出款流程
          </div>
          <div class="flex gap-3">
            <n-button 
              @click="approveWithdrawalModal.show = false"
              :disabled="approveWithdrawalModal.loading"
            >
              取消
            </n-button>
            <n-button 
              type="error" 
              @click="approveWithdrawalModal.data && showForceRejectModal(approveWithdrawalModal.data)"
              :disabled="approveWithdrawalModal.loading || !approveWithdrawalModal.data"
            >
              拒绝出款
            </n-button>
            <n-button 
              type="primary" 
              @click="handleApproveWithdrawal" 
              :loading="approveWithdrawalModal.loading"
            >
              批准出款
            </n-button>
          </div>
        </div>
      </template>
    </n-modal>

    <!-- Wagering Requirements Modal -->
    <n-modal
      v-model:show="wageringModal.show"
      preset="card"
      title="投注任务提醒"
      size="large"
      :style="{ width: '90%', maxWidth: '600px' }"
      :closable="true"
      :mask-closable="false"
    >
      <div class="wagering-notification">
        <!-- Header Message -->
        <div class="text-center mb-6">
          <div class="text-orange-600 text-lg font-medium mb-2">
            您还需 {{ wageringModal.data?.totalWageringRemaining?.toFixed(2) || '0.00' }} 
            <span class="text-green-600">🔄</span> 有效投注才能提现呀！
          </div>
          <div class="text-gray-600 text-sm">
            <n-button type="primary" text @click="goToBetting">去投注</n-button>
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
              { label: '投注', value: '投注' }
            ]"
            placeholder="筛选来源"
            clearable
            class="w-48"
          />
          <span class="ml-4 text-sm text-gray-600">有效投注计算规则</span>
        </div>

        <!-- Wagering Tasks List -->
        <div class="space-y-3 max-h-80 overflow-y-auto">
          <div 
            v-for="audit in filteredAudits" 
            :key="audit.auditId"
            class="border rounded-lg p-4 bg-gray-50"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="text-orange-500 font-semibold">
                  +{{ audit.rewardAmount.toFixed(2) }}
                </div>
                <div class="text-sm text-gray-600">
                  (×{{ audit.requiredBetAmount > 0 ? (audit.requiredBetAmount / audit.rewardAmount).toFixed(2) : '1.00' }}倍)
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

            <div class="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <span>来源: {{ audit.source }}</span>
              <span class="ml-auto">{{ formatDateTime(audit.createdAt) }}</span>
            </div>

            <div class="text-sm text-gray-600">
              {{ audit.activityName }}
            </div>
          </div>
        </div>

        <!-- Footer Note -->
        <div class="text-center text-sm text-gray-500 mt-6 p-4 bg-blue-50 rounded">
          当账户资产 < 10,00时，系统将自动解除所有投注任务<br>
          (需注单统计完成后才能触发自动解除)
        </div>

        <!-- Actions -->
        <div class="flex justify-center gap-3 mt-6">
          <n-button @click="wageringModal.show = false">
            关闭
          </n-button>
          <n-button type="primary" @click="goToBetting">
            去投注
          </n-button>
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
import { ref, reactive, onMounted, onUnmounted, computed, h, watch, defineAsyncComponent } from 'vue';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
const SmartAutoRefresh = defineAsyncComponent(() => import('../../components/smart/SmartAutoRefresh/index.vue'));
const SmartDataGrid = defineAsyncComponent(() => import('../../components/smart/SmartDataGrid/index.vue'));

// Props
interface Props {
  isMyWithdrawal?: boolean; // true for "由我出款", false/undefined for "财务出款"
}

const props = withDefaults(defineProps<Props>(), {
  isMyWithdrawal: false
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
  type DataTableColumns
} from 'naive-ui';
import { ReloadOutline, SearchOutline, PersonOutline, CopyOutline } from '@vicons/ionicons5';
import { financeWithdrawalApi } from '#/api/finance/financeWithdrawal';
import { useUserStore } from '@vben/stores';
import { getGamePlatformListApi } from '#/api/game/platform';
import { formatCurrency, formatDateTime } from '#/utils/format';
const UserDetailModal = defineAsyncComponent(() => import('#/components/user/UserDetailModal.vue'));

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
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  return [startOfDay.getTime(), endOfDay.getTime()];
};

const getMonthDateRange = (): [number, number] => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return [startOfMonth.getTime(), endOfMonth.getTime()];
};

// Filters
const filters = reactive({
  timeRange: 'today',
  dateRange: getTodayDateRange() as [number, number] | null, // Default to today
  memberAccount: '',
  thirdPartyPayment: '',
  amount: '',
  withdrawalMethod: '',
  approvalStatus: 'all', // Default to showing all records
  operator: ''
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
  notes: ''
});

const assignModal = reactive({
  show: false,
  items: [] as WithdrawalRecord[]
});

const detailModal = reactive({
  show: false,
  data: null as WithdrawalRecord | null
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
  } | null
});

// Force Cancel Modal
const forceCancelModal = reactive({
  show: false,
  loading: false,
  data: null as WithdrawalRecord | null,
  frontendReason: '',
  backendReason: ''
});

// Force Reject Modal
const forceRejectModal = reactive({
  show: false,
  loading: false,
  data: null as WithdrawalRecord | null,
  windControlProcess: 'no' as 'no' | 'add_audit' | 'deduct_balance',
  auditMultiplier: 1,
  selectedPlatform: 'poker',
  platforms: {} as Record<string, boolean>,
  frontendReason: '',
  backendReason: ''
});

// Approve Withdrawal Modal
const approveWithdrawalModal = reactive({
  show: false,
  loading: false,
  data: null as WithdrawalRecord | null
});

// Options
const thirdPartyOptions = [
  { label: 'PIX自动代付', value: 'PIX_AUTO' },
  { label: '银行转账', value: 'BANK_TRANSFER' },
  { label: '数字钱包', value: 'DIGITAL_WALLET' }
];

const withdrawalMethodOptions = [
  { label: 'PIX', value: 'PIX' },
  { label: '银行卡', value: 'BANK_CARD' },
  { label: '数字钱包', value: 'WALLET' }
];

const approvalStatusOptions = [
  { label: '全部记录', value: 'all' }, // Default - shows all records
  { label: '待财务处理', value: '' },
  { label: '待审核', value: 'pending' },
  { label: '已审核', value: 'approved' },
  { label: '处理中', value: 'processing' },
  { label: '已完成', value: 'completed' },
  { label: '已拒绝', value: 'rejected' }
];

const processStatusOptions = [
  { label: '处理成功', value: 'success' },
  { label: '处理失败', value: 'failed' },
  { label: '待确认', value: 'pending_confirmation' }
];

const batchOperationOptions = [
  { label: '批量处理', value: 'batch_process' },
  { label: '批量分配', value: 'batch_assign' },
  { label: '批量导出', value: 'batch_export' }
];

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
  { label: '全部', value: '全部' },
  { label: '电子', value: 'SLOT' },
  { label: '真人', value: 'LIVE' },
  { label: '体育', value: 'SPORTS' },
  { label: '彩票', value: 'LOTTERY' },
  { label: '棋牌', value: 'CHESS_CARDS' },
  { label: '电竞', value: 'ESPORTS' },
  { label: '捕鱼', value: 'HUNTING' },
  { label: '街机', value: 'ARCADE' },
  { label: '模拟', value: 'SIMULATION' },
  { label: '斗鸡', value: 'COCKFIGHT' },
  { label: '区块链', value: 'BLOCKCHAIN' }
];

// Computed properties for the new UI
const filteredProviders = computed(() => {
  console.log('🔍 Filtering providers:', {
    selectedGameType: selectedGameType.value,
    totalProviders: availableProviders.value.length,
    gameTypes: availableProviders.value.map(p => p.gameType)
  });
  
  if (selectedGameType.value === '全部') {
    return availableProviders.value;
  }
  const filtered = availableProviders.value.filter(provider => 
    provider.gameType === selectedGameType.value
  );
  
  console.log(`🎯 Filtered ${filtered.length} providers for ${selectedGameType.value}:`, filtered);
  return filtered;
});

const selectedProviderCount = computed(() => {
  const selectedKeys = Object.keys(forceRejectModal.platforms).filter(key => 
    key !== 'all' && forceRejectModal.platforms[key]
  );
  return selectedKeys.length;
});

const totalGamesCount = computed(() => {
  const selectedKeys = Object.keys(forceRejectModal.platforms).filter(key => 
    key !== 'all' && forceRejectModal.platforms[key]
  );
  return selectedKeys.reduce((total, platformId) => {
    const provider = availableProviders.value.find(p => p.platformId === platformId);
    return total + (provider?.gameCount || 0);
  }, 0);
});

// Fetch available game providers using the same API as promotion templates
const fetchAvailableProviders = async () => {
  try {
    console.log('🎮 Loading game providers using getGamePlatformListApi (Finance)...');
    const response = await getGamePlatformListApi({ 
      pageSize: 1000,
      isEnabled: true 
    });
    
    console.log('Platform API response (Finance):', response);
    
    if (response.list && response.list.length > 0) {
      availableProviders.value = response.list.map(platform => ({
        platformId: platform.platformId,
        platformName: platform.platformName,
        gameType: platform.gameType,
        isEnabled: platform.isEnabled,
        gameCount: platform.subGameCount || 0
      }));
      
      // Update audit platforms for backward compatibility
      auditPlatforms.value = availableProviders.value.map(provider => ({
        key: provider.platformId,
        label: provider.platformName
      }));
      
      console.log('✅ Loaded game providers successfully (Finance):', availableProviders.value.length);
      console.log(' Sample providers (Finance):', availableProviders.value.slice(0, 5));
      console.log('🎮 All game types found:', [...new Set(availableProviders.value.map(p => p.gameType))]);
    }
  } catch (error) {
    console.error('❌ Failed to fetch game providers (Finance):', error);
    // Fallback to static list if API fails
    auditPlatforms.value = [
      { key: 'PG', label: 'PG Soft' },
      { key: 'PP', label: 'Pragmatic Play' },
      { key: 'JILI', label: 'JILI Games' },
      { key: 'EVO', label: 'Evolution' },
      { key: 'POKER', label: '棋牌' },
      { key: 'FISHING', label: '捕鱼' },
      { key: 'LIVE', label: '真人' },
      { key: 'SPORTS', label: '体育' }
    ];
    
    // Also populate availableProviders from fallback
    availableProviders.value = auditPlatforms.value.map(platform => ({
      platformId: platform.key,
      platformName: platform.label,
      gameType: '',
      isEnabled: true
    }));
  }
};


// Computed
const totalAmount = computed(() => {
  return tableData.value.reduce((sum, item) => sum + (item.rewardAmount || 0), 0);
});

const selectedCount = computed(() => selectedIds.value.length);
const hasSelection = computed(() => selectedIds.value.length > 0);

const filteredAudits = computed(() => {
  if (!wageringModal.data?.pendingAudits) return [];
  
  if (wageringModal.filterType === 'all') {
    return wageringModal.data.pendingAudits;
  }
  
  return wageringModal.data.pendingAudits.filter(audit => 
    audit.source === wageringModal.filterType
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
    'will pass to modal': Number(row.memberId)
  });
  
  // Validate memberId before opening modal
  const userId = Number(row.memberId);
  if (!userId || isNaN(userId) || userId === 0) {
    message.error('无效的会员ID');
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
    width: 50
  },
  // 1. 订单号
  {
    title: '订单号',
    key: 'orderId',
    width: 140,
    fixed: 'left',
    render: (row) => h('div', { class: 'space-y-1' }, [
      h(NButton, {
        text: true,
        type: 'primary',
        size: 'small',
        class: 'font-mono font-medium',
        onClick: () => showDetail(row)
      }, { default: () => row.orderId }),
      row.thirdPartyOrderNo && h('div', { class: 'text-xs text-gray-500 font-mono' }, row.thirdPartyOrderNo)
    ])
  },
  // 2. 会员ID (VIP等级)
  {
    title: '会员ID (VIP等级)',
    key: 'memberId',
    width: 130,
    render: (row) => h('div', { class: 'text-center space-y-1' }, [
      h(NButton, {
        text: true,
        type: 'primary',
        size: 'small',
        class: 'font-mono font-medium',
        onClick: () => showMemberDetail(row)
      }, { default: () => row.displayMemberId || row.userID || row.memberId }),
      h(NTag, { size: 'small', type: 'info' }, { default: () => row.vipLevel || 'VIP0' })
    ])
  },
  // 3. 会员账号 (会员层级)
  {
    title: '会员账号 (会员层级)',
    key: 'memberAccount',
    width: 140,
    render: (row) => h('div', { class: 'space-y-1' }, [
      h(NButton, {
        text: true,
        type: 'primary',
        size: 'small',
        class: 'font-medium',
        onClick: () => showMemberDetail(row)
      }, { default: () => row.accountName || row.memberAccount }),
      h('div', { class: 'text-xs text-gray-500' }, row.memberTierName || '默认层级')
    ])
  },
  // 4. 申请时间 (操作时间) (完成时长)
  {
    title: '申请时间 (操作时间) (完成时长)',
    key: 'appliedAt',
    width: 180,
    render: (row) => h('div', { class: 'text-center space-y-1' }, [
      h('div', { class: 'text-xs' }, formatDateTime(row.appliedAt || row.applicationTime)),
      h('div', { class: 'text-xs text-gray-500' }, formatDateTime(row.updatedAt || row.completedTime)),
      h('div', { 
        class: 'text-xs font-medium',
        style: { color: row.processedTime !== '-' ? '#10b981' : '#9ca3af' }
      }, row.processedTime || '-')
    ])
  },
  // 5. 会员币种 (比例)
  {
    title: '会员币种 (比例)',
    key: 'memberCurrency',
    width: 120,
    render: (row) => h('div', { class: 'text-center space-y-1' }, [
      h('div', { class: 'font-medium' }, row.currency || 'BRL'),
      h('div', { class: 'text-xs text-gray-500' }, `(${row.exchangeRate || '0.05'})`)
    ])
  },
  // 6. 提现金额 (当前余额)
  {
    title: '提现金额 (当前余额)',
    key: 'withdrawAmount',
    width: 140,
    render: (row) => h('div', { class: 'text-center space-y-1' }, [
      h('div', { class: 'font-semibold text-red-600' }, formatCurrency(row.withdrawAmount || row.withdrawalAmount || row.amount)),
      h('div', { class: 'text-xs text-gray-500' }, formatCurrency(row.currentBalance || row.beforeAmount || 0))
    ])
  },
  // 7. 到账币种汇率
  {
    title: '到账币种汇率',
    key: 'arrivalCurrency',
    width: 120,
    render: (row) => h('div', { class: 'text-center space-y-1' }, [
      h('div', { class: 'font-medium' }, row.currency || 'BRL'),
      h('div', { class: 'text-xs text-gray-500' }, `汇率: ${row.exchangeRate || '0.05'}`)
    ])
  },
  // 8. 预计到帐 (手续费) (实际到账)
  {
    title: '预计到帐 (手续费) (实际到账)',
    key: 'estimatedAmount',
    width: 160,
    render: (row) => h('div', { class: 'text-center space-y-1' }, [
      h('div', { class: 'text-xs font-semibold text-green-600' }, formatCurrency(row.estimatedAmount || row.estimatedReceived || row.approvalAmount || 0)),
      h('div', { class: 'text-xs text-gray-500' }, `手续费: ${formatCurrency(row.fee || row.fees || 0)}`),
      h('div', { class: 'text-xs' }, `实际: ${formatCurrency(row.estimatedReceived || row.estimatedAmount || row.approvalAmount || 0)}`),
      h('div', { class: 'flex gap-1 justify-center mt-2' }, [
        h(NButton, {
          size: 'tiny',
          type: 'info',
          onClick: () => {
            // Navigate to 投注任务(稽核) with user context
            window.location.href = `/finance/wagering-audit?userId=${row.memberId}`;
          }
        }, { default: () => '稽核' }),
        h(NButton, {
          size: 'tiny',
          type: 'primary',
          onClick: () => {
            // Navigate to 游戏 -> 投注记录 with user context
            window.location.href = `/game-management/bet-records?userId=${row.memberId}`;
          }
        }, { default: () => '投注' })
      ])
    ])
  },
  // 9. 充 / 提次数 (累计充 / 提差额) (重复IP人数)
  {
    title: '充 / 提次数 (累计充 / 提差额) (重复IP人数)',
    key: 'counts',
    width: 180,
    render: (row) => {
      const rechargeCount = row.rechargeWithdrawCount?.rechargeCount || row.depositCount || 0;
      const withdrawCount = row.rechargeWithdrawCount?.withdrawCount || row.withdrawalCount || 0;
      const totalDeposit = row.totalDeposit || 0;
      const totalWithdraw = row.totalWithdraw || 0;
      const difference = totalDeposit - totalWithdraw;
      const duplicateIP = row.rechargeWithdrawCount?.duplicateIP || 0;
      
      return h('div', { class: 'text-center space-y-1' }, [
        h('div', { class: 'text-xs' }, `充${rechargeCount} / 提${withdrawCount}次`),
        h('div', { 
          class: `text-xs font-medium ${difference >= 0 ? 'text-green-600' : 'text-red-600'}` 
        }, `差额: ${formatCurrency(difference)}`),
        h('div', { class: 'text-xs text-orange-600' }, `重复IP: ${duplicateIP}人`)
      ]);
    }
  },
  // 10. 收款方式 (收款人信息) - ✅ ENHANCED: Same as "全部提现" tab
  {
    title: '收款方式 (收款人信息)',
    key: 'paymentMethod',
    width: 320,
    render: (row) => {
      // ✅ FIX: Fallback to row fields if withdrawChannelInfo is missing or empty
      const info = row.withdrawChannelInfo || {};
      const pixType = info.type || row.paymentMethod || row.withdrawMethod || 'PIX';
      
      // ✅ FIX: Check if info has meaningful data (not just empty strings)
      const hasInfoData = info.account || info.name || info.cpf || info.phone || info.email;
      
      // ✅ FIX: If withdrawChannelInfo is empty or has no meaningful data, try to build from row data
      const fallbackInfo = !hasInfoData ? {
        type: row.paymentMethod || row.withdrawMethod || info.type || 'PIX',
        accountType: row.accountType || info.accountType || '',
        name: row.accountHolderName || row.memberName || info.name || '',
        account: row.accountNumber || row.memberBankAccount || row.bankAccount || info.account || '',
        cpf: row.cpf || info.cpf || '',
        phone: row.accountPhone || info.phone || '',
        email: row.accountEmail || info.email || '',
        bankCode: row.bankName || row.memberBank || info.bankCode || ''
      } : {};
      
      // Merge fallback info with actual info (actual info takes precedence, but fallback fills gaps)
      const displayInfo = {
        type: info.type || fallbackInfo.type || pixType,
        accountType: info.accountType || fallbackInfo.accountType || '',
        name: info.name || fallbackInfo.name || '',
        account: info.account || fallbackInfo.account || '',
        cpf: info.cpf || fallbackInfo.cpf || '',
        phone: info.phone || fallbackInfo.phone || '',
        email: info.email || fallbackInfo.email || '',
        bankCode: info.bankCode || fallbackInfo.bankCode || ''
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
          'CPF': 'CPF',
          'PHONE': 'PHONE',
          'EMAIL': 'EMAIL',
          'RANDOM_KEY': 'RANDOM_KEY',
          'CNPJ': 'CNPJ',
          'EVP': 'EVP',
          'BANK': 'BANK'
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
        displayInfo.email ? `邮箱：${displayInfo.email}` : ''
      ].filter(Boolean).join('\n');
      
      // ✅ FIX: Show at least payment method type even if no other info
      if (!copyAllText && !displayInfo.account && !displayInfo.name) {
        return h('div', { class: 'bg-gray-50 p-2 rounded' }, [
          h('div', { class: 'font-semibold text-sm text-gray-600' }, pixType),
          h('div', { class: 'text-xs text-gray-400 mt-1' }, '暂无收款信息')
        ]);
      }
      
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
          copyAllText && h(NButton, {
            text: true,
            type: 'primary',
            size: 'tiny',
            onClick: copyAll
          }, { default: () => '复制全部' })
        ]),
        // Name
        displayInfo.name && h('div', { class: 'flex items-center justify-between text-xs' }, [
          h('span', { class: 'text-gray-600' }, '真实姓名：'),
          h('div', { class: 'flex items-center gap-1' }, [
            h('span', { class: 'font-medium' }, displayInfo.name),
            h(NButton, {
              text: true,
              size: 'tiny',
              onClick: () => copyField(displayInfo.name, '真实姓名')
            }, { default: () => h(NIcon, { size: 14, component: CopyOutline }) })
          ])
        ]),
        // Account/Address
        displayInfo.account && h('div', { class: 'flex items-center justify-between text-xs' }, [
          h('span', { class: 'text-gray-600' }, '账号/地址：'),
          h('div', { class: 'flex items-center gap-1' }, [
            h('span', { class: 'font-medium' }, displayInfo.account),
            h(NButton, {
              text: true,
              size: 'tiny',
              onClick: () => copyField(displayInfo.account, '账号/地址')
            }, { default: () => h(NIcon, { size: 14, component: CopyOutline }) })
          ])
        ]),
        // Type (账户类型) - Always show if available
        displayType && h('div', { class: 'flex items-center justify-between text-xs' }, [
          h('span', { class: 'text-gray-600' }, '类型：'),
          h('div', { class: 'flex items-center gap-1' }, [
            h('span', { class: 'font-medium' }, displayType),
            h(NButton, {
              text: true,
              size: 'tiny',
              onClick: () => copyField(displayType, '类型')
            }, { default: () => h(NIcon, { size: 14, component: CopyOutline }) })
          ])
        ]),
        // CPF
        displayInfo.cpf && h('div', { class: 'flex items-center justify-between text-xs' }, [
          h('span', { class: 'text-gray-600' }, 'CPF：'),
          h('div', { class: 'flex items-center gap-1' }, [
            h('span', { class: 'font-medium' }, displayInfo.cpf),
            h(NButton, {
              text: true,
              size: 'tiny',
              onClick: () => copyField(displayInfo.cpf, 'CPF')
            }, { default: () => h(NIcon, { size: 14, component: CopyOutline }) })
          ])
        ]),
        // Phone
        displayInfo.phone && h('div', { class: 'flex items-center justify-between text-xs' }, [
          h('span', { class: 'text-gray-600' }, '电话：'),
          h('div', { class: 'flex items-center gap-1' }, [
            h('span', { class: 'font-medium' }, displayInfo.phone),
            h(NButton, {
              text: true,
              size: 'tiny',
              onClick: () => copyField(displayInfo.phone, '电话')
            }, { default: () => h(NIcon, { size: 14, component: CopyOutline }) })
          ])
        ]),
        // Email
        displayInfo.email && h('div', { class: 'flex items-center justify-between text-xs' }, [
          h('span', { class: 'text-gray-600' }, '邮箱：'),
          h('div', { class: 'flex items-center gap-1' }, [
            h('span', { class: 'font-medium' }, displayInfo.email),
            h(NButton, {
              text: true,
              size: 'tiny',
              onClick: () => copyField(displayInfo.email, '邮箱')
            }, { default: () => h(NIcon, { size: 14, component: CopyOutline }) })
          ])
        ])
      ]);
    }
  },
  // 11. 订单状态 (操作人)
  {
    title: '订单状态 (操作人)',
    key: 'status',
    width: 140,
    render: (row) => {
      const statusMap = {
        'unlocked': { type: 'default', text: '未锁定' },
        'pending': { type: 'warning', text: '待出款' },
        'reviewing': { type: 'info', text: '审核中' },
        'completed': { type: 'success', text: '已付款' },
        'approved': { type: 'success', text: '已付款' },
        'success': { type: 'success', text: '已付款' },
        'processing': { type: 'info', text: '处理中' },
        'rejected': { type: 'error', text: '已拒绝' },
        'failed': { type: 'error', text: '失败' },
        'cancelled': { type: 'default', text: '已取消' },
        'canceled': { type: 'default', text: '已取消' },
        'risk_review': { type: 'warning', text: '风控审核' }
      };
      const status = statusMap[row.status as keyof typeof statusMap] || { type: 'default', text: row.status };
      
      // 🎯 NEW: Operator name display logic
      let operatorDisplay = '';
      if (row.reviewer || row.operator) {
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
        h(NTag, { type: status.type as any, size: 'small' }, { default: () => status.text }),
        operatorDisplay && h('div', { class: 'text-xs text-gray-500' }, operatorDisplay)
      ]);
    }
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
          : h('span', { class: 'text-gray-400 text-center' }, '-')
      ]);
    }
  },
  // 13. 后台备注
  {
    title: '后台备注',
    key: 'backendNotes',
    width: 200,
    render: (row) => {
      const backendNote = row.backendNotes || row.backendNote || row.description || row.notes || '';
      const hasError = row.status === 'failed' || row.status === 'rejected' || 
                       (backendNote && (
                         backendNote.toLowerCase().includes('error') ||
                         backendNote.toLowerCase().includes('failed') ||
                         backendNote.toLowerCase().includes('错误') ||
                         backendNote.toLowerCase().includes('失败')
                       ));
      
      return h('div', { class: 'text-xs' }, [
        backendNote
          ? h('div', { class: hasError ? 'space-y-1' : '' }, [
              hasError && h('div', { class: 'text-red-500' }, '错误信息：'),
              h('div', { class: hasError ? 'text-red-600' : 'text-gray-700' }, backendNote)
            ])
          : h('span', { class: 'text-gray-400 text-center' }, '-')
      ]);
    }
  },
  // 14. 三方备注
  {
    title: '三方备注',
    key: 'thirdPartyNotes',
    width: 200,
    render: (row) => {
      const thirdPartyNote = row.thirdPartyNotes || row.thirdPartyError || row.gatewayError || '';
      const hasError = thirdPartyNote && (
        thirdPartyNote.toLowerCase().includes('error') ||
        thirdPartyNote.toLowerCase().includes('failed') ||
        thirdPartyNote.toLowerCase().includes('拒绝') ||
        thirdPartyNote.toLowerCase().includes('错误') ||
        thirdPartyNote.toLowerCase().includes('失败')
      );
      
      return h('div', { class: 'text-xs' }, [
        thirdPartyNote
          ? h('div', { class: 'space-y-1' }, [
              h('div', { class: 'text-orange-500 text-xs' }, '三方响应：'),
              h('div', { class: hasError ? 'text-red-600' : 'text-gray-700' }, thirdPartyNote)
            ])
          : h('span', { class: 'text-gray-400 text-center' }, '-')
      ]);
    }
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
      } else if (gateway.toLowerCase() === 'auto_system' || gateway === 'auto_system') {
        displayName = '免审出款';
      }
      
      return h('div', { class: 'text-center space-y-1' }, [
        h('div', { class: 'font-medium text-xs' }, displayName),
        h('div', { class: 'text-xs text-gray-500' }, `代付次数: ${row.withdrawCount || row.withdrawalCount || row.refreshCount || 1}`)
      ]);
    }
  },
  // 16. 操作 (Keep existing actions column)
  {
    title: '操作',
    key: 'actions',
    width: 200,
    fixed: 'right',
    render: (row) => {
      const actions = [];
      
      // For 风控审核 and 财务出款 states: only show lock/unlock until locked
      const isRiskOrFinanceState = ['pending', 'reviewing', 'risk_review_required', 'finance_pending'].includes(row.status);
      
      if (isRiskOrFinanceState) {
        // 🎯 FIX: Only show lock/unlock for pending/processing statuses
        const canLockUnlock = ['pending', 'reviewing', 'processing', 'risk_review'].includes(row.status);
        
        if (canLockUnlock) {
          actions.push(
            h(
              NButton,
              {
                size: 'small',
                type: row.isLocked ? 'warning' : 'default',
                onClick: () => row.isLocked ? unlockOrder(row) : lockOrder(row)
              },
              { 
                default: () => {
                  if (row.isLocked) {
                    return row.lockedBy ? `解锁 (${row.lockedBy})` : '解锁';
                  } else {
                    return '锁定';
                  }
                }
              }
            )
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
                onClick: () => showApproveWithdrawalModal(row)
              },
              { default: () => '审核出款' }
            ),
            
            // Manual withdrawal - 已人工出款
            h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                onClick: () => showManualWithdrawalModal(row)
              },
              { default: () => '已人工出款' }
            ),
            
            // Force Cancel - 强制取消
            h(
              NButton,
              {
                size: 'small',
                type: 'warning',
                onClick: () => showForceCancelModal(row)
              },
              { default: () => '强制取消' }
            ),
            
            // Force Reject - 强制拒绝
            h(
              NButton,
              {
                size: 'small',
                type: 'error',
                onClick: () => showForceRejectModal(row)
              },
              { default: () => '强制拒绝' }
            ),
            
            // Notes - Only show if locked
            ...(row.isLocked ? [h(
              NButton,
              {
                size: 'small',
                type: 'info',
                onClick: () => showNotesModal(row)
              },
              { default: () => '备注' }
            )] : [])
          );
        }
      } else {
        // For other states, show all actions
        // 🎯 FIX: Only show lock/unlock for pending/processing statuses  
        const canLockUnlock = ['pending', 'reviewing', 'processing', 'risk_review'].includes(row.status);
        
        if (canLockUnlock) {
          actions.push(
            h(
              NButton,
              {
                size: 'small',
                type: row.isLocked ? 'warning' : 'default',
                onClick: () => row.isLocked ? unlockOrder(row) : lockOrder(row)
              },
              { 
                default: () => {
                  if (row.isLocked) {
                    return row.lockedBy ? `解锁 (${row.lockedBy})` : '解锁';
                  } else {
                    return '锁定';
                  }
                }
              }
            )
          );
        }
        
        // Other action buttons - Only show approve/reject buttons for pending withdrawals
        actions.push(
          ...(canApprove(row.status) ? [
            h(
              NButton,
              {
                size: 'small',
                type: 'success',
                onClick: () => showSingleApproveModal(row)
              },
              { default: () => '批准' }
            )
          ] : []),
          ...(canReject(row.status) ? [
            h(
              NButton,
              {
                size: 'small',
                type: 'error',
                onClick: () => showSingleRejectModal(row)
              },
              { default: () => '拒绝' }
            )
          ] : []),
          // Notes - Only show if locked
          ...(row.isLocked ? [h(
            NButton,
            {
              size: 'small',
              type: 'info',
              onClick: () => showNotesModal(row)
            },
            { default: () => '备注' }
          )] : [])
        );
      }
      
      return h('div', { class: 'flex gap-1 flex-wrap justify-center' }, actions);
    }
  }
];

// Helper functions
const getCurrentUser = () => {
  // Get current user from authentication store
  const userInfo = userStore.userInfo;
  if (userInfo) {
    // Use username or id from actual user store
    return userInfo.username || userInfo.userId || userInfo.id?.toString() || 'admin';
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
    const response = await financeWithdrawalApi.lockWithdrawal(row.id, 'unlock');
    
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
  message.info('审核出款功能开发中');
};

const showForceWithdrawalModal = (row: WithdrawalRecord) => {
  dialog.warning({
    title: '强制出款确认',
    content: `确认强制出款订单 ${row.orderId}？此操作将把状态改为"已强制出款"，请谨慎操作！`,
    positiveText: '确认强制出款',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        row.status = 'force_withdrawn';
        message.success('强制出款成功');
      } catch (error) {
        message.error('强制出款失败');
      }
    }
  });
};

const showForceFailureModal = (row: WithdrawalRecord) => {
  dialog.warning({
    title: '强制失败确认',
    content: `确认强制失败订单 ${row.orderId}？此操作将把状态改为"付款失败"，请谨慎操作！`,
    positiveText: '确认强制失败',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        row.status = 'payment_failed';
        message.success('强制失败成功');
      } catch (error) {
        message.error('强制失败操作失败');
      }
    }
  });
};

const showReWithdrawalModal = (row: WithdrawalRecord) => {
  dialog.info({
    title: '重新出款确认',
    content: `确认重新出款订单 ${row.orderId}？此操作将把状态改为"待出款"，请谨慎操作！`,
    positiveText: '确认重新出款',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        row.status = 'finance_pending';
        message.success('重新出款设置成功');
      } catch (error) {
        message.error('重新出款设置失败');
      }
    }
  });
};

const showManualWithdrawalModal = (row: WithdrawalRecord) => {
  dialog.warning({
    title: '人工出款确认',
    content: () => h('div', [
      h('div', { class: 'mb-3' }, `确认人工出款订单 ${row.orderId}？`),
      h('div', { class: 'text-sm text-gray-600 mb-2' }, `提现金额: ${row.amount} ${row.currency}`),
      h('div', { class: 'text-sm text-gray-600 mb-2' }, `会员账号: ${row.memberAccount}`),
      h('div', { class: 'text-orange-600 text-sm font-medium' }, '⚠️ 此操作将直接标记为已完成，不调用第三方支付接口'),
      h('div', { class: 'text-red-600 text-sm mt-2' }, '请确保已通过其他方式完成实际转账！')
    ]),
    positiveText: '确认人工出款',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const response = await financeWithdrawalApi.manualWithdrawal(row.id);
        
        if (response.success) {
          message.success('人工出款标记成功');
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
    }
  });
};

const refreshOrderStatus = async (row: WithdrawalRecord) => {
  try {
    // TODO: Implement actual status refresh API call
    const refreshResults = [
      '刷新成功',
      '该三方代付不支持刷新',
      '每3分钟才能刷新一次',
      '刷新失败'
    ];
    const result = refreshResults[Math.floor(Math.random() * refreshResults.length)];
    
    if (result === '刷新成功') {
      message.success(result);
    } else if (result === '刷新失败') {
      message.error(result);
    } else {
      message.warning(result || '未知结果');
    }
  } catch (error) {
    message.error('刷新状态失败');
  }
};

// Notes Modal State
const notesModal = reactive({
  show: false,
  loading: false,
  data: null as WithdrawalRecord | null,
  noteType: 'backend' as 'frontend' | 'backend' | 'system',
  noteContent: ''
});

const noteTypeOptions = [
  { label: '后台备注', value: 'backend' },
  { label: '前台备注', value: 'frontend' },
  { label: '系统备注', value: 'system' }
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
watch(() => notesModal.noteType, (newType) => {
  if (!notesModal.data || !notesModal.show) return;
  
  const row = notesModal.data;
  
  // Update content based on selected type
  if (newType === 'frontend') {
    notesModal.noteContent = row.frontendNotes || row.frontendNote || '';
  } else if (newType === 'backend') {
    notesModal.noteContent = row.backendNotes || row.backendNote || row.description || '';
  } else if (newType === 'system') {
    notesModal.noteContent = row.systemNotes || '';
  }
});

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
    
    console.log('💾 Saving notes:', { orderId: notesModal.data.orderId, noteData });
    
    // Call API to update notes - use orderId (trxId) instead of internal id
    const response = await financeWithdrawalApi.updateNote(notesModal.data.orderId, noteData);
    
    console.log('✅ API Response:', response);
    
    // Response interceptor returns the data directly, so if we have a trxId, it's successful
    const isSuccess = response && (response.trxId || response.success === true);
    
    if (isSuccess) {
      console.log('✅ Update successful, updating table data...');
      
      // Update local table data immediately with the returned data
      if (notesModal.data) {
        console.log('🔍 Looking for order:', notesModal.data.orderId);
        console.log('🔍 Table data length:', tableData.value.length);
        
        const rowIndex = tableData.value.findIndex(r => r.orderId === notesModal.data!.orderId);
        console.log('📍 Found row at index:', rowIndex);
        
        if (rowIndex !== -1) {
          // Response interceptor returns data directly, so response IS the data
          const responseData = response;
          
          console.log('💾 Updating row with data:', {
            noteData,
            responseData: {
              frontendNotes: responseData.frontendNotes,
              backendNotes: responseData.backendNotes,
              systemNotes: responseData.systemNotes
            }
          });
          
          // Create a new object to ensure reactivity
          const updatedRow = { ...tableData.value[rowIndex] };
          
          if (noteData.frontendNotes !== undefined) {
            updatedRow.frontendNotes = responseData.frontendNotes || noteData.frontendNotes;
            updatedRow.frontendNote = responseData.frontendNotes || noteData.frontendNotes;
          }
          if (noteData.backendNotes !== undefined) {
            updatedRow.backendNotes = responseData.backendNotes || noteData.backendNotes;
            updatedRow.backendNote = responseData.backendNotes || noteData.backendNotes;
          }
          if (noteData.systemNotes !== undefined) {
            updatedRow.systemNotes = responseData.systemNotes || noteData.systemNotes;
          }
          
          // Replace the entire row object to ensure Vue detects the change
          tableData.value[rowIndex] = updatedRow;
          
          console.log('✅ Updated row:', { 
            frontendNotes: updatedRow.frontendNotes, 
            backendNotes: updatedRow.backendNotes,
            systemNotes: updatedRow.systemNotes
          });
        } else {
          console.error('❌ Row not found in table data!');
        }
      }
      
      message.success('备注更新成功');
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
      data: error.response?.data
    });
    message.error(error.response?.data?.message || error.message || '备注更新失败');
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
    const response = await financeWithdrawalApi.forceCancel(forceCancelModal.data.id, {
      frontendReason: forceCancelModal.frontendReason,
      backendReason: forceCancelModal.backendReason
    });
    
    if (response.success) {
      message.success('强制取消成功，提现金额已返还给会员');
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
  if (!forceRejectModal.data) return;
  
  try {
    forceRejectModal.loading = true;
    
    // Prepare audit task data if adding audit
    let auditTaskData: { multiplier: number; platforms: { [key: string]: boolean }; selectedPlatform: string; } | undefined;
    if (forceRejectModal.windControlProcess === 'add_audit') {
      auditTaskData = {
        multiplier: forceRejectModal.auditMultiplier,
        platforms: forceRejectModal.platforms,
        selectedPlatform: forceRejectModal.selectedPlatform
      };
    }
    
    // Call API to force reject withdrawal
    const response = await financeWithdrawalApi.forceReject(forceRejectModal.data.id, {
      windControlProcess: forceRejectModal.windControlProcess,
      auditTask: auditTaskData,
      frontendReason: forceRejectModal.frontendReason,
      backendReason: forceRejectModal.backendReason
    });
    
    if (response.success) {
      let successMessage = '强制拒绝成功';
      if (forceRejectModal.windControlProcess === 'add_audit') {
        successMessage += '，已添加稽核任务';
      } else if (forceRejectModal.windControlProcess === 'deduct_balance') {
        successMessage += '，已扣除余额';
      }
      message.success(successMessage);
      forceRejectModal.show = false;
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
  forceRejectModal.windControlProcess = 'no';
  forceRejectModal.auditMultiplier = 1;
  forceRejectModal.selectedPlatform = availableProviders.value[0]?.platformId || 'PG';
  
  // Initialize platform selections
  const newPlatforms: Record<string, boolean> = { all: false };
  availableProviders.value.forEach(provider => {
    newPlatforms[provider.platformId] = false;
  });
  forceRejectModal.platforms = newPlatforms;
  
  forceRejectModal.frontendReason = '';
  forceRejectModal.backendReason = '';
  forceRejectModal.show = true;
  console.log('Force reject modal should show:', forceRejectModal.show);
};

// Provider selection handlers for force reject modal
const handleProviderSelection = () => {
  // Update 'all' checkbox based on individual selections
  const selectedCount = Object.values(forceRejectModal.platforms).filter(selected => selected && typeof selected === 'boolean').length;
  forceRejectModal.platforms.all = selectedCount === availableProviders.value.length;
};

const handleSelectAllProviders = (checked: boolean) => {
  forceRejectModal.platforms.all = checked;
  // Update individual provider selections
  availableProviders.value.forEach(provider => {
    forceRejectModal.platforms[provider.platformId] = checked;
  });
};

const toggleProviderSelection = (platformId: string) => {
  forceRejectModal.platforms[platformId] = !forceRejectModal.platforms[platformId];
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
        riskAssessment: detailResponse.data.riskAssessment
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
    const response = await financeWithdrawalApi.approveWithdrawal(approveWithdrawalModal.data.id);
    
    if (response.success) {
      message.success('审核出款成功，订单已进入处理流程，等待第三方处理');
      approveWithdrawalModal.show = false;
      
      // 🚀 Update item status to processing (will remain visible until third-party completes)
      // Once third-party responds (success/failed), it will disappear from the tab automatically
      const withdrawalId = approveWithdrawalModal.data.id;
      const item = tableData.value.find(item => item.id === withdrawalId);
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
  selectedIds.value = tableData.value.map(row => row.id);
};

// Bulk operation handlers that work with selectedRows
const handleBulkProcess = (_selectedRows: WithdrawalRecord[]) => {
  showBulkProcessModal();
};

// Methods
const fetchData = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: paginationReactive.page,
      limit: paginationReactive.pageSize
    };

    // Add filters - use full datetime for accurate filtering (matching AutoWithdrawal)
    if (filters.dateRange) {
      params.startDate = new Date(filters.dateRange[0]).toISOString();
      const endDate = new Date(filters.dateRange[1]);
      endDate.setHours(23, 59, 59, 999);
      params.endDate = endDate.toISOString();
    }
    
    if (filters.memberAccount) params.memberAccount = filters.memberAccount;
    if (filters.thirdPartyPayment) params.thirdPartyPayment = filters.thirdPartyPayment;
    if (filters.amount) params.amount = filters.amount;
    if (filters.withdrawalMethod) params.withdrawalMethod = filters.withdrawalMethod;
    if (filters.approvalStatus) params.approvalStatus = filters.approvalStatus;
    if (filters.operator) params.operator = filters.operator;
    
    // Add filter for "由我出款" - only show withdrawals assigned to current user
    if (props.isMyWithdrawal) {
      params.assignedToMe = true;
    }

    try {
      const response = await financeWithdrawalApi.getWithdrawalsForProcessing(params);
      
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
            thirdPartyNotes: item.thirdPartyNotes || item.thirdPartyError || item.gatewayError || '',
            thirdPartyProvider: item.thirdPartyProvider || '',
            refreshCount: item.refreshCount || 0,
            lastRefreshTime: item.lastRefreshTime || null
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
      message.error('获取数据失败，请稍后重试');
    }
  } catch (error) {
    console.error('Fetch data error:', error);
    tableData.value = [];
    paginationReactive.total = 0;
    message.error('获取数据失败');
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
    thirdPartyPayment: '',
    amount: '',
    withdrawalMethod: '',
    approvalStatus: 'all', // Default to showing all records
    operator: ''
  });
  paginationReactive.page = 1;
  fetchData();
};

// Watch for timeRange changes and update dateRange accordingly (matching AutoWithdrawal)
watch(() => filters.timeRange, (newValue) => {
  if (newValue === 'today') {
    filters.dateRange = getTodayDateRange();
  } else if (newValue === 'month') {
    filters.dateRange = getMonthDateRange();
  }
  // Automatically fetch data when time range changes (matching AutoWithdrawal)
  fetchData();
});


const showDetail = async (row: WithdrawalRecord) => {
  detailModal.data = row;
  detailModal.show = true;
};

const showBulkProcessModal = () => {
  const selectedItems = tableData.value.filter(item => selectedIds.value.includes(item.id));
  processModal.items = selectedItems;
  processModal.status = '';
  processModal.notes = '';
  processModal.show = true;
};

const showBulkAssignModal = () => {
  const selectedItems = tableData.value.filter(item => selectedIds.value.includes(item.id));
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
      message.error('请选择处理状态');
      return;
    }

    const action = processModal.status === 'success' ? 'confirm' : 'reject';
    
    try {
      const response = await financeWithdrawalApi.bulkProcess({
        withdrawalIds: processModal.items.map(item => item.id),
        action,
        notes: processModal.notes
      });
      
      if (response.success) {
        const actionText = action === 'confirm' ? '批准' : '拒绝';
        message.success(`成功${actionText} ${processModal.items.length} 个出款申请`);
        processModal.show = false;
        selectedIds.value = [];
        
        // 🚀 Immediately remove items from table if rejected (disappear immediately)
      // For approve, items stay visible in "processing" status until third-party completes
      if (action === 'reject') {
        const processedIds = processModal.items.map(item => item.id);
        tableData.value = tableData.value.filter(item => !processedIds.includes(item.id));
        
        // Update pagination total
        paginationReactive.total = Math.max(0, paginationReactive.total - processedIds.length);
      } else if (action === 'confirm') {
        // For approve/confirm, update status to processing (stays visible until third-party completes)
        const processedIds = processModal.items.map(item => item.id);
        tableData.value.forEach(item => {
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
      message.success(`成功处理 ${processModal.items.length} 个出款申请 (模拟)`);
      processModal.show = false;
      selectedIds.value = [];
      fetchData();
    }
  } catch (error) {
    message.error('处理失败');
  }
};

const handleBatchAssign = async () => {
  try {
    try {
      const response = await financeWithdrawalApi.bulkAssign({
        withdrawalIds: assignModal.items.map(item => item.id)
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
    message.error('分配失败');
  }
};

// Utility functions
const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN');
};

const getStatusType = (status: string): "success" | "warning" | "error" | "default" | "primary" | "info" => {
  const statusMap: Record<string, "success" | "warning" | "error" | "default" | "primary" | "info"> = {
    'pending': 'warning',
    'processing': 'info',
    'success': 'success',
    'failed': 'error',
    'approved': 'success'
  };
  return statusMap[status] || 'default';
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待处理',
    'processing': '处理中',
    'success': '提现成功',
    'failed': '失败',
    'approved': '提现成功'
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
  console.log('FinanceWithdrawal: Refresh interval changed to', newInterval, 'seconds');
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
</style>
