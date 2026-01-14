<template>
  <div class="risk-control-review">
    <!-- Header with Filters -->
    <div class="header-section">
      <n-card :bordered="false" class="rounded-16px shadow-sm">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h2 class="text-xl font-semibold text-gray-800">{{ props.isMyRisk ? '由我风控' : '风控审核' }}</h2>
            <p class="text-sm text-gray-600 mt-1">{{ props.isMyRisk ? '我负责的提现申请风险控制' : '提现申请风险控制审核' }}</p>
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

        <!-- Search Filters -->
        <div class="filter-section grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-4">
          <!-- Date Range -->
          <div class="filter-item">
            <n-form-item label="申请时间">
              <n-date-picker
                v-model:value="filters.dateRange"
                type="daterange"
                format="yyyy-MM-dd"
                placeholder="选择日期范围"
                clearable
                size="small"
                class="w-full"
              />
            </n-form-item>
          </div>

          <!-- Member ID -->
          <div class="filter-item">
            <n-form-item label="会员ID">
              <n-input
                v-model:value="filters.memberId"
                placeholder="请输入会员ID"
                clearable
                size="small"
              />
            </n-form-item>
          </div>

          <!-- Member Account -->
          <div class="filter-item">
            <n-form-item label="会员账号">
              <n-input
                v-model:value="filters.memberAccount"
                placeholder="请输入会员账号"
                clearable
                size="small"
              />
            </n-form-item>
          </div>

          <!-- Member Currency -->
          <div class="filter-item">
            <n-form-item label="会员币种">
              <n-select
                v-model:value="filters.memberCurrency"
                placeholder="选择币种"
                clearable
                size="small"
                :options="currencyOptions"
              />
            </n-form-item>
          </div>

          <!-- Withdrawal Amount -->
          <div class="filter-item">
            <n-form-item label="提现金额">
              <n-input
                v-model:value="filters.withdrawalAmount"
                placeholder="请输入金额"
                clearable
                size="small"
              />
            </n-form-item>
          </div>

          <!-- Payment Method -->
          <div class="filter-item">
            <n-form-item label="收款方式">
              <n-select
                v-model:value="filters.paymentMethod"
                placeholder="选择收款方式"
                clearable
                size="small"
                :options="paymentMethodOptions"
              />
            </n-form-item>
          </div>
        </div>

        <!-- Search Actions -->
        <div class="flex justify-between items-center">
          <div class="flex gap-2">
            <n-button type="primary" @click="applyFilters" :loading="loading">
              <template #icon>
                <n-icon><SearchOutline /></n-icon>
              </template>
              高级搜索
            </n-button>
            <n-button @click="resetFilters">
              <template #icon>
                <n-icon><ReloadOutline /></n-icon>
              </template>
              重置
            </n-button>
          </div>
          <div class="text-sm text-gray-600">
            已选择 {{ selectedIds.length }} 条数据，共 {{ paginationReactive.total }} 条
            <n-tag v-if="props.isMyRisk" type="info" size="small" class="ml-2">
              我的风控
            </n-tag>
            <n-tag v-else type="warning" size="small" class="ml-2">
              全部风控
            </n-tag>
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
      remote
      @update:selected-keys="selectedIds = $event"
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
                  v-if="!props.isMyRisk"
                  type="info" 
                  @click="showBulkAssignModal"
                  :disabled="selectedCount === 0"
                >
                  <template #icon>
                    <n-icon><CheckmarkCircleOutline /></n-icon>
                  </template>
                  分配给我
                </n-button>
              </div>
              
              <!-- 选择信息 -->
              <div class="text-sm text-gray-600">
                已选择 {{ selectedCount }} 条数据，共 {{ paginationReactive.total }} 条
                <n-tag v-if="props.isMyRisk" type="info" size="small" class="ml-2">
                  我的风控
                </n-tag>
                <n-tag v-else type="warning" size="small" class="ml-2">
                  全部风控
                </n-tag>
              </div>
            </div>
            
            <div class="flex items-center gap-4">
              <!-- 批量操作 -->
              <div v-if="selectedCount > 0" class="flex gap-2">
                <n-button 
                  type="warning" 
                  size="small"
                  @click="handleBulkLock(selectedRows)"
                >
                  批量锁定 ({{ selectedCount }})
                </n-button>
                <n-button 
                  type="info" 
                  size="small"
                  @click="handleBulkUnlock(selectedRows)"
                >
                  批量解锁 ({{ selectedCount }})
                </n-button>
                <n-button 
                  type="success" 
                  size="small"
                  @click="handleBulkApprove(selectedRows)"
                >
                  批量通过 ({{ selectedCount }})
                </n-button>
                <n-button 
                  type="error" 
                  size="small"
                  @click="handleBulkReject(selectedRows)"
                >
                  批量拒绝 ({{ selectedCount }})
                </n-button>
                <n-button 
                  type="default" 
                  size="small"
                  @click="handleBulkCancel(selectedRows)"
                >
                  批量强制取消 ({{ selectedCount }})
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

    <!-- Approval Modal -->
    <n-modal
      v-model:show="approvalModal.show"
      preset="dialog"
      title="审核通过"
      positive-text="确认通过"
      negative-text="取消"
      @positive-click="handleApproval"
    >
      <div class="space-y-4">
        <div>
          <n-alert type="info" :show-icon="false">
            确认通过以下提现申请？
          </n-alert>
        </div>
        <div class="max-h-60 overflow-y-auto">
          <div v-for="item in approvalModal.items" :key="item.id" class="border rounded p-2 mb-2">
            <div class="text-sm">
              <div><strong>订单号:</strong> {{ item.orderId }}</div>
              <div><strong>会员:</strong> {{ item.memberAccount }}</div>
              <div><strong>金额:</strong> {{ item.withdrawalAmount }} {{ item.memberCurrency }}</div>
            </div>
          </div>
        </div>
        <div>
          <n-form-item label="审核备注">
            <n-input
              v-model:value="approvalModal.notes"
              type="textarea"
              placeholder="请输入审核备注（可选）"
              :rows="3"
            />
          </n-form-item>
        </div>
      </div>
    </n-modal>

    <!-- Rejection Modal -->
    <n-modal
      v-model:show="rejectionModal.show"
      preset="dialog"
      title="审核拒绝"
      positive-text="确认拒绝"
      negative-text="取消"
      @positive-click="handleRejection"
    >
      <div class="space-y-4">
        <div>
          <n-alert type="warning" :show-icon="false">
            确认拒绝以下提现申请？拒绝后将自动退回用户余额。
          </n-alert>
        </div>
        <div class="max-h-60 overflow-y-auto">
          <div v-for="item in rejectionModal.items" :key="item.id" class="border rounded p-2 mb-2">
            <div class="text-sm">
              <div><strong>订单号:</strong> {{ item.orderId }}</div>
              <div><strong>会员:</strong> {{ item.memberAccount }}</div>
              <div><strong>金额:</strong> {{ item.withdrawalAmount }} {{ item.memberCurrency }}</div>
            </div>
          </div>
        </div>
        <div>
          <n-form-item label="拒绝原因" required>
            <n-select
              v-model:value="rejectionModal.reason"
              placeholder="请选择拒绝原因"
              :options="rejectionReasons"
            />
          </n-form-item>
        </div>
        <div>
          <n-form-item label="审核备注">
            <n-input
              v-model:value="rejectionModal.notes"
              type="textarea"
              placeholder="请输入审核备注（可选）"
              :rows="3"
            />
          </n-form-item>
        </div>
      </div>
    </n-modal>

    <!-- Detail Modal -->
    <n-modal
      v-model:show="detailModal.show"
      preset="card"
      title="提现详情"
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
                <span class="text-gray-600">VIP等级:</span>
                <span>{{ detailModal.data.vipLevel }}</span>
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
                  {{ detailModal.data.withdrawalAmount }} {{ detailModal.data.memberCurrency }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">预计到账:</span>
                <span>{{ detailModal.data.approvalAmount }} {{ detailModal.data.expectedCurrency }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">提现前余额:</span>
                <span>{{ detailModal.data.beforeAmount }} {{ detailModal.data.memberCurrency }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">提现后余额:</span>
                <span>{{ detailModal.data.afterAmount }} {{ detailModal.data.memberCurrency }}</span>
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
              <span>{{ detailModal.data.bankAccount }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">持卡人:</span>
              <span>{{ detailModal.data.accountHolderName }}</span>
            </div>
          </div>
        </n-card>

        <!-- Risk Assessment -->
        <n-card title="风险评估" size="small" v-if="detailModal.data.riskAssessment">
          <div class="space-y-3">
            <div class="flex items-center gap-4">
              <span class="text-gray-600">风险等级:</span>
              <n-tag 
                :type="getRiskLevelType(detailModal.data.riskLevel)"
                size="large"
              >
                {{ detailModal.data.riskLevel }}
              </n-tag>
              <span class="text-gray-600">风险评分:</span>
              <n-progress 
                type="line" 
                :percentage="(detailModal.data.riskScore / 10) * 100"
                :color="getRiskScoreColor(detailModal.data.riskScore)"
                :show-indicator="false"
                :height="8"
                class="w-24"
              />
              <span class="text-sm">{{ detailModal.data.riskScore }}/10</span>
            </div>
            <div v-if="detailModal.data.riskFlags && detailModal.data.riskFlags.length > 0">
              <span class="text-gray-600">风险标记:</span>
              <div class="flex gap-2 mt-1">
                <n-tag 
                  v-for="flag in detailModal.data.riskFlags" 
                  :key="flag"
                  type="warning"
                  size="small"
                >
                  {{ getRiskFlagText(flag) }}
                </n-tag>
              </div>
            </div>
          </div>
        </n-card>

        <!-- Actions -->
        <div class="flex justify-end gap-3">
          <n-button @click="detailModal.show = false">关闭</n-button>
          <n-button 
            type="error" 
            @click="showSingleRejectModal(detailModal.data)"
            v-if="canApproveReject(detailModal.data.status)"
          >
            拒绝
          </n-button>
          <n-button 
            type="success" 
            @click="showSingleApproveModal(detailModal.data)"
            v-if="canApproveReject(detailModal.data.status)"
          >
            通过
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
            <n-icon size="20" color="#f56565">⚠️</n-icon>
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
              <span class="font-semibold text-green-600">{{ forceCancelModal.data.withdrawalAmount }} BRL</span>
            </div>
            <div>
              <span class="text-gray-600">手续费：</span>
              <span>0.00 BRL</span>
            </div>
          </div>
          <div class="text-sm mt-3">
            <span class="text-gray-600">实际到账：</span>
            <span class="font-semibold">{{ forceCancelModal.data.withdrawalAmount }} BRL</span>
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
              <span class="font-semibold text-green-600">{{ forceRejectModal.data.withdrawalAmount }} BRL</span>
            </div>
            <div>
              <span class="text-gray-600">手续费：</span>
              <span>0.00 BRL</span>
            </div>
          </div>
          <div class="text-sm mt-3">
            <span class="text-gray-600">实际到账：</span>
            <span class="font-semibold">{{ forceRejectModal.data.withdrawalAmount }} BRL</span>
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

    <!-- Member Detail Modal - Reuse existing UserDetailModal component -->
    <UserDetailModal
      v-model:visible="showMemberDetailModal"
      :user-id="currentMemberUserId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, h, defineAsyncComponent } from 'vue';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
const SmartAutoRefresh = defineAsyncComponent(() => import('../../components/smart/SmartAutoRefresh/index.vue'));
const SmartDataGrid = defineAsyncComponent(() => import('../../components/smart/SmartDataGrid/index.vue'));

// Props
interface Props {
  isMyRisk?: boolean; // true for "由我风控", false/undefined for "风控审核"
}

const props = withDefaults(defineProps<Props>(), {
  isMyRisk: false
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
  NProgress,
  NIcon,
  NRadioGroup,
  NRadio,
  NInputNumber,
  NCheckbox,
  useMessage,
  type DataTableColumns
} from 'naive-ui';
import { ReloadOutline, SearchOutline, CheckmarkCircleOutline, CopyOutline } from '@vicons/ionicons5';
import { riskControlApi } from '#/api/finance/riskControl';
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
  memberId: string | number;
  userID?: string; // 9-digit display ID
  displayMemberId?: string | number; // For UI display
  memberAccount: string;
  memberName: string;
  vipLevel: string;
  applicationTime: string;
  memberCurrency: string;
  withdrawalAmount: number;
  expectedCurrency: string;
  approvalAmount: number;
  paymentMethod: string;
  operator: string;
  beforeAmount: number;
  afterAmount: number;
  status: string;
  riskScore?: number;
  riskLevel?: string;
  riskFlags?: string[];
  // Lock related fields
  isLocked: boolean;
  lockedBy: string | null;
  lockedAt: string | null;
  // Additional fields as per requirements
  withdrawalCount: number;
  depositCount: number;
  accountInfo: string;
  frontendNotes: string;
  frontendNote?: string;
  backendNotes: string;
  backendNote?: string;
  description: string;
  accountName?: string;
  memberTierName?: string;
  appliedAt?: string;
  updatedAt?: string;
  completedTime?: string;
  processedTime?: string;
  currency?: string;
  exchangeRate?: number | string;
  withdrawAmount?: number;
  currentBalance?: number;
  estimatedAmount?: number;
  estimatedReceived?: number;
  fee?: number;
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
  thirdPartyProvider?: string;
  reviewer?: string;
  [key: string]: any;
}

const message = useMessage();

// Data and state
const loading = ref(false);
const tableData = ref<WithdrawalRecord[]>([]);
const selectedIds = ref<(string | number)[]>([]);

// Auto-refresh state
const autoRefreshEnabled = ref(false);

// Helper function to get today's date range
const getTodayDateRange = (): [number, number] => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  return [startOfDay.getTime(), endOfDay.getTime()];
};

// Filters
const filters = reactive({
  dateRange: getTodayDateRange() as [number, number] | null, // Default to today
  memberId: '',
  memberAccount: '',
  memberCurrency: '',
  withdrawalAmount: '',
  paymentMethod: '',
  operator: ''
});

// Pagination - SmartDataGrid compatible
const paginationReactive = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

// Modals
const approvalModal = reactive({
  show: false,
  items: [] as WithdrawalRecord[],
  notes: ''
});

const rejectionModal = reactive({
  show: false,
  items: [] as WithdrawalRecord[],
  reason: '',
  notes: ''
});

const detailModal = reactive({
  show: false,
  data: null as WithdrawalRecord | null
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

// Options
const currencyOptions = [
  { label: 'BRL', value: 'BRL' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' }
];

const paymentMethodOptions = [
  { label: 'PIX', value: 'PIX' },
  { label: '银行转账', value: 'BANK_TRANSFER' },
  { label: '数字钱包', value: 'DIGITAL_WALLET' }
];

const rejectionReasons = [
  { label: '风险控制', value: 'RISK_CONTROL' },
  { label: '信息不符', value: 'INFO_MISMATCH' },
  { label: '可疑交易', value: 'SUSPICIOUS_TRANSACTION' },
  { label: '频繁提现', value: 'FREQUENT_WITHDRAWAL' },
  { label: '其他原因', value: 'OTHER' }
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
  console.log('🔍 Filtering providers (Risk Control):', {
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
    console.log('🎮 Loading game providers using getGamePlatformListApi...');
    const response = await getGamePlatformListApi({ 
      pageSize: 1000,
      isEnabled: true 
    });
    
    console.log('Platform API response:', response);
    
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
      
      console.log('✅ Loaded game providers successfully:', availableProviders.value.length);
      console.log(' Sample providers:', availableProviders.value.slice(0, 5));
      console.log('🎮 All game types found:', [...new Set(availableProviders.value.map(p => p.gameType))]);
    }
  } catch (error) {
    console.error('❌ Failed to fetch game providers:', error);
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

// Table columns
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
      h('div', { class: 'font-medium' }, row.currency || row.memberCurrency || 'BRL'),
      h('div', { class: 'text-xs text-gray-500' }, `(${row.exchangeRate || '0.05'})`)
    ])
  },
  // 6. 提现金额 (当前余额)
  {
    title: '提现金额 (当前余额)',
    key: 'withdrawAmount',
    width: 140,
    render: (row) => h('div', { class: 'text-center space-y-1' }, [
      h('div', { class: 'font-semibold text-red-600' }, formatCurrency(row.withdrawAmount || row.withdrawalAmount)),
      h('div', { class: 'text-xs text-gray-500' }, formatCurrency(row.currentBalance || row.beforeAmount || 0))
    ])
  },
  // 7. 到账币种汇率
  {
    title: '到账币种汇率',
    key: 'arrivalCurrency',
    width: 120,
    render: (row) => h('div', { class: 'text-center space-y-1' }, [
      h('div', { class: 'font-medium' }, row.currency || row.expectedCurrency || 'BRL'),
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
      h('div', { class: 'text-xs text-gray-500' }, `手续费: ${formatCurrency(row.fee || 0)}`),
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
      
      const accountType = info.accountType || info.type || '';
      const displayType = getAccountTypeDisplay(accountType);
      
      // Build copy all text - include type and CPF
      const copyAllText = [
        info.name ? `真实姓名：${info.name}` : '',
        info.account ? `账号/地址：${info.account}` : '',
        displayType ? `类型：${displayType}` : '',
        info.cpf ? `CPF：${info.cpf}` : '',
        info.phone ? `电话：${info.phone}` : '',
        info.email ? `邮箱：${info.email}` : ''
      ].filter(Boolean).join('\n');
      
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
        info.name && h('div', { class: 'flex items-center justify-between text-xs' }, [
          h('span', { class: 'text-gray-600' }, '真实姓名：'),
          h('div', { class: 'flex items-center gap-1' }, [
            h('span', { class: 'font-medium' }, info.name),
            h(NButton, {
              text: true,
              size: 'tiny',
              onClick: () => copyField(info.name, '真实姓名')
            }, { default: () => h(NIcon, { size: 14, component: CopyOutline }) })
          ])
        ]),
        // Account/Address
        info.account && h('div', { class: 'flex items-center justify-between text-xs' }, [
          h('span', { class: 'text-gray-600' }, '账号/地址：'),
          h('div', { class: 'flex items-center gap-1' }, [
            h('span', { class: 'font-medium' }, info.account),
            h(NButton, {
              text: true,
              size: 'tiny',
              onClick: () => copyField(info.account, '账号/地址')
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
        info.cpf && h('div', { class: 'flex items-center justify-between text-xs' }, [
          h('span', { class: 'text-gray-600' }, 'CPF：'),
          h('div', { class: 'flex items-center gap-1' }, [
            h('span', { class: 'font-medium' }, info.cpf),
            h(NButton, {
              text: true,
              size: 'tiny',
              onClick: () => copyField(info.cpf, 'CPF')
            }, { default: () => h(NIcon, { size: 14, component: CopyOutline }) })
          ])
        ]),
        // Phone
        info.phone && h('div', { class: 'flex items-center justify-between text-xs' }, [
          h('span', { class: 'text-gray-600' }, '电话：'),
          h('div', { class: 'flex items-center gap-1' }, [
            h('span', { class: 'font-medium' }, info.phone),
            h(NButton, {
              text: true,
              size: 'tiny',
              onClick: () => copyField(info.phone, '电话')
            }, { default: () => h(NIcon, { size: 14, component: CopyOutline }) })
          ])
        ]),
        // Email
        info.email && h('div', { class: 'flex items-center justify-between text-xs' }, [
          h('span', { class: 'text-gray-600' }, '邮箱：'),
          h('div', { class: 'flex items-center gap-1' }, [
            h('span', { class: 'font-medium' }, info.email),
            h(NButton, {
              text: true,
              size: 'tiny',
              onClick: () => copyField(info.email, '邮箱')
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
    width: 100,
    render: () => h('div', { class: 'text-xs text-center' }, [
      h('span', { class: 'text-gray-400' }, '-')
    ])
  },
  // 13. 后台备注
  {
    title: '后台备注',
    key: 'backendNotes',
    width: 200,
    render: (row) => {
      // Only show backend notes if there's a third-party error
      const backendNote = row.backendNote || row.backendNotes || row.description;
      const hasError = row.status === 'failed' || row.status === 'rejected' || 
                       (backendNote && (
                         backendNote.toLowerCase().includes('error') ||
                         backendNote.toLowerCase().includes('failed') ||
                         backendNote.toLowerCase().includes('错误') ||
                         backendNote.toLowerCase().includes('失败')
                       ));
      
      return h('div', { class: 'text-xs' }, [
        hasError && backendNote
          ? h('div', { class: 'space-y-1' }, [
              h('div', { class: 'text-red-500' }, '错误信息：'),
              h('div', { class: 'text-red-600' }, backendNote)
            ])
          : h('span', { class: 'text-gray-400 text-center' }, '-')
      ]);
    }
  },
  // 14. 三方代付 (代付次数)
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
        h('div', { class: 'text-xs text-gray-500' }, `代付次数: ${row.withdrawCount || row.withdrawalCount || 1}`)
      ]);
    }
  },
  // 15. 操作 (Keep existing actions column)
  {
    title: '操作',
    key: 'actions',
    width: 200,
    fixed: 'right',
    render: (row) => {
      const actions = [];
      
      // For 风控审核 states: only show lock/unlock until locked
      const isRiskState = ['pending', 'reviewing', 'risk_review_required'].includes(row.status);
      
      if (isRiskState) {
        // Always show lock/unlock button
        actions.push(
          h(
            NButton,
            {
              size: 'small',
              type: row.isLocked ? 'warning' : 'default',
              onClick: () => row.isLocked ? unlockOrder(row) : lockOrder(row)
            },
            { default: () => row.isLocked ? '解锁' : '锁定' }
          )
        );
        
        // Show other actions (for testing, always show; in production, check isLocked)
        // if (row.isLocked) {  // Temporarily commented for testing
          actions.push(
            // Risk Control Review
            h(
              NButton,
              {
                size: 'small',
                type: 'success',
                onClick: () => showSingleApproveModal(row)
              },
              { default: () => '风控审核' }
            ),
            
            // Force Reject
            h(
              NButton,
              {
                size: 'small',
                type: 'error',
                onClick: () => showForceRejectModal(row)
              },
              { default: () => '强制拒绝' }
            ),
            
            // Force Cancel
            h(
              NButton,
              {
                size: 'small',
                type: 'warning',
                onClick: () => showForceCancelModal(row)
              },
              { default: () => '强制取消' }
            ),
            
            // Notes
            h(
              NButton,
              {
                size: 'small',
                type: 'info',
                onClick: () => showNotesModal(row)
              },
              { default: () => '备注' }
            )
          );
        // }
      } else {
        // For other states, show all actions
        actions.push(
          h(
            NButton,
            {
              size: 'small',
              type: row.isLocked ? 'warning' : 'default',
              onClick: () => row.isLocked ? unlockOrder(row) : lockOrder(row)
            },
            { default: () => row.isLocked ? '解锁' : '锁定' }
          ),
          h(
            NButton,
            {
              size: 'small',
              type: 'success',
              onClick: () => showSingleApproveModal(row)
            },
            { default: () => '风控审核' }
          ),
          h(
            NButton,
            {
              size: 'small',
              type: 'error',
              onClick: () => showForceRejectModal(row)
            },
            { default: () => '强制拒绝' }
          ),
          h(
            NButton,
            {
              size: 'small',
              type: 'warning',
              onClick: () => showForceCancelModal(row)
            },
            { default: () => '强制取消' }
          ),
          h(
            NButton,
            {
              size: 'small',
              type: 'info',
              onClick: () => showNotesModal(row)
            },
            { default: () => '备注' }
          )
        );
      }
      
      return h('div', { class: 'flex gap-1 flex-wrap' }, actions);
    }
  }
];

// Helper functions
const getCurrentUser = () => {
  // Get current user from authentication store (same as FinanceWithdrawal)
  const userStore = useUserStore();
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
    // Make API call to lock the withdrawal
    const response = await riskControlApi.lockWithdrawal(row.id);
    
    if (response.success) {
      message.success(`订单 ${row.orderId} 已锁定`);
      
      // 🚀 IMMEDIATE UPDATE: Update the row data immediately
      const lockData = response.data;
      if (lockData) {
        row.isLocked = lockData.isLocked;
        row.lockedBy = lockData.lockedBy;
        row.lockedAt = lockData.lockedAt;
      }
      
      // Refresh data to ensure consistency
      await fetchData();
      // Emit event to refresh other tabs
      emit('refresh-tabs');
    } else {
      message.error(response.message || '锁定失败');
    }
  } catch (error) {
    console.error('Lock order error:', error);
    message.error('锁定失败');
  }
};

const unlockOrder = async (row: WithdrawalRecord) => {
  try {
    // Make API call to unlock the withdrawal
    const response = await riskControlApi.unlockWithdrawal(row.id);
    
    if (response.success) {
      message.success(`订单 ${row.orderId} 已解锁`);
      
      // 🚀 IMMEDIATE UPDATE: Update the row data immediately
      const unlockData = response.data;
      if (unlockData) {
        row.isLocked = unlockData.isLocked;
        row.lockedBy = unlockData.lockedBy;
        row.lockedAt = unlockData.lockedAt;
      }
      
      // Refresh data to ensure consistency
      await fetchData();
      // Emit event to refresh other tabs
      emit('refresh-tabs');
    } else {
      message.error(response.message || '解锁失败');
    }
  } catch (error) {
    console.error('Unlock order error:', error);
    message.error('解锁失败');
  }
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
const handleBulkLock = (_selectedRows: WithdrawalRecord[]) => {
  showBulkLockModal();
};

const handleBulkUnlock = (_selectedRows: WithdrawalRecord[]) => {
  showBulkUnlockModal();
};

const handleBulkApprove = (_selectedRows: WithdrawalRecord[]) => {
  showBulkApproveModal();
};

const handleBulkReject = (_selectedRows: WithdrawalRecord[]) => {
  showBulkRejectModal();
};

const handleBulkCancel = (_selectedRows: WithdrawalRecord[]) => {
  showBulkCancelModal();
};

// Force Cancel Modal Functions
const showForceCancelModal = (row: WithdrawalRecord) => {
  console.log('强制取消 button clicked (Risk Control)', row);
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
    const response = await riskControlApi.forceCancel(forceCancelModal.data.id, {
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

// Provider selection handlers
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

// Force Reject Modal Functions  
const showForceRejectModal = (row: WithdrawalRecord) => {
  console.log('强制拒绝 button clicked (Risk Control)', row);
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
    const response = await riskControlApi.forceReject(forceRejectModal.data.id, {
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

const showNotesModal = (row: WithdrawalRecord) => {
  // For now, show a placeholder - could be replaced with notes modal
  message.info(`备注功能：订单 ${row.orderId}`);
  // TODO: Implement notes modal
};

const showBulkLockModal = () => {
  // TODO: Implement bulk lock modal
  message.info('批量锁定功能开发中');
};

const showBulkUnlockModal = () => {
  // TODO: Implement bulk unlock modal
  message.info('批量解锁功能开发中');
};

const showBulkCancelModal = () => {
  // TODO: Implement bulk cancel modal
  message.info('批量强制取消功能开发中');
};

// Methods
const fetchData = async () => {
  console.log('🔄 [Risk Control] Fetching data, page:', paginationReactive.page, 'pageSize:', paginationReactive.pageSize);
  loading.value = true;
  try {
    const params: any = {
      page: paginationReactive.page,
      pageSize: paginationReactive.pageSize, // 🚨 FIX: Use pageSize instead of limit
      limit: paginationReactive.pageSize // Keep for backwards compatibility
    };

    // Add filters
    if (filters.dateRange) {
      const startDate = new Date(filters.dateRange[0]);
      startDate.setHours(0, 0, 0, 0);
      params.startDate = startDate.toISOString().split('T')[0];
      
      const endDate = new Date(filters.dateRange[1]);
      endDate.setHours(23, 59, 59, 999);
      params.endDate = endDate.toISOString().split('T')[0];
    }
    
    if (filters.memberId) params.memberId = filters.memberId;
    if (filters.memberAccount) params.memberAccount = filters.memberAccount;
    if (filters.memberCurrency) params.memberCurrency = filters.memberCurrency;
    if (filters.withdrawalAmount) params.withdrawalAmount = filters.withdrawalAmount;
    if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
    if (filters.operator) params.operator = filters.operator;
    
    // Add filter for "由我风控" - only show withdrawals assigned to current user
    if (props.isMyRisk) {
      params.assignedToMe = true;
    }

    console.log('🔄 [Risk Control] API params:', params);

    try {
      const response = await riskControlApi.getWithdrawalsForReview(params);
      
      console.log('📥 [Risk Control] API Response:', response);
      console.log('📥 [Risk Control] Response keys:', response ? Object.keys(response) : 'null');
      
      // Handle the full response object returned by the API
      if (response && response.success && response.data) {
        // Extract data from the response object
        const responseData = response.data;
        console.log('📥 [Risk Control] Response data:', responseData);
        console.log('📥 [Risk Control] Withdrawals count:', responseData.withdrawals?.length);
        
        if (responseData.withdrawals) {
          // Map API response to local interface
          const mappedData = (responseData.withdrawals || []).map((item: any) => ({
            ...item,
            id: item.id || item.orderId, // 🚨 FIX: Ensure id is set
            orderId: item.orderId || item.trxId,
            memberId: item.memberId, // Internal database ID (e.g., 7) - DO NOT OVERWRITE
            userID: item.userID, // 9-digit display ID (e.g., '154301535')
            displayMemberId: item.userID || item.memberId, // For UI display only
            isLocked: item.isLocked || false,
            lockedBy: item.lockedBy || null,
            lockedAt: item.lockedAt || null,
            withdrawalCount: item.withdrawalCount || 0,
            depositCount: item.depositCount || 0,
            accountInfo: item.accountInfo || '',
            frontendNotes: item.frontendNotes || '',
            backendNotes: item.backendNotes || '',
            description: item.description || ''
          }));
          
          console.log('✅ [Risk Control] Mapped data:', mappedData.length, 'records');
          console.log('✅ [Risk Control] First record:', mappedData[0]);
          
          tableData.value = mappedData;
          paginationReactive.total = responseData.pagination?.total || 0;
          
          console.log('✅ [Risk Control] TableData set:', tableData.value.length);
          console.log('✅ [Risk Control] Pagination total:', paginationReactive.total);
        } else {
          console.warn('❌ [Risk Control] No withdrawals in response data:', responseData);
          tableData.value = [];
          paginationReactive.total = 0;
        }
      } else {
        console.warn('❌ [Risk Control] Invalid API response:', response);
        // Fallback to empty data for now
        tableData.value = [];
        paginationReactive.total = 0;
        message.warning(response?.message || '暂无数据');
      }
    } catch (apiError) {
      console.error('❌ [Risk Control] API call failed:', apiError);
      // Set empty state on API failure
      tableData.value = [];
      paginationReactive.total = 0;
      message.error('获取数据失败，请稍后重试');
    }
  } catch (error) {
    console.error('❌ [Risk Control] Fetch data error:', error);
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
  Object.assign(filters, {
    dateRange: getTodayDateRange(), // Reset to today
    memberId: '',
    memberAccount: '',
    memberCurrency: '',
    withdrawalAmount: '',
    paymentMethod: '',
    operator: ''
  });
  paginationReactive.page = 1;
  fetchData();
};

const showDetail = async (row: WithdrawalRecord) => {
  try {
    const response = await riskControlApi.getWithdrawalDetails(row.id);
    if (response.success) {
      detailModal.data = { ...row, ...response.data.withdrawal, riskAssessment: response.data.riskAssessment };
      detailModal.show = true;
    } else {
      message.error('获取详情失败');
    }
  } catch (error) {
    message.error('获取详情失败');
  }
};

const showBulkApproveModal = () => {
  const selectedItems = tableData.value.filter(item => selectedIds.value.includes(item.id));
  approvalModal.items = selectedItems;
  approvalModal.notes = '';
  approvalModal.show = true;
};

const showBulkRejectModal = () => {
  const selectedItems = tableData.value.filter(item => selectedIds.value.includes(item.id));
  rejectionModal.items = selectedItems;
  rejectionModal.reason = '';
  rejectionModal.notes = '';
  rejectionModal.show = true;
};

const showBulkAssignModal = () => {
  const selectedItems = tableData.value.filter(item => selectedIds.value.includes(item.id));
  message.info(`正在分配 ${selectedItems.length} 个提现申请给您处理`);
  // TODO: Implement bulk assign functionality
  // This would assign the selected withdrawals to the current user for processing
};

const showSingleApproveModal = (row: WithdrawalRecord) => {
  approvalModal.items = [row];
  approvalModal.notes = '';
  approvalModal.show = true;
};

const showSingleRejectModal = (row: WithdrawalRecord) => {
  rejectionModal.items = [row];
  rejectionModal.reason = '';
  rejectionModal.notes = '';
  rejectionModal.show = true;
};

const handleApproval = async () => {
  try {
    if (approvalModal.items.length === 1) {
      // Single approval
      const response = await riskControlApi.approveWithdrawal(
        approvalModal.items[0]?.id || '',
        {
          notes: approvalModal.notes
        }
      );
      
      if (response.success) {
        message.success('审核通过成功');
        approvalModal.show = false;
        selectedIds.value = [];
        
        // 🚀 Immediately remove item from table (status changed to processing, no longer in risk review tab)
        const processedId = approvalModal.items[0]?.id;
        if (processedId) {
          tableData.value = tableData.value.filter(item => item.id !== processedId);
          paginationReactive.total = Math.max(0, paginationReactive.total - 1);
        }
        
        // 🔔 Immediately refresh badge counts
        emit('refresh-tabs');
        
        // Then refresh to sync with backend
        await fetchData();
      } else {
        message.error(response.message || '审核失败');
      }
    } else {
      // Bulk approval
      const response = await riskControlApi.bulkApprove({
        withdrawalIds: approvalModal.items.map(item => item.id),
        notes: approvalModal.notes
      });
      
      if (response.success) {
        message.success('批量审核通过成功');
        approvalModal.show = false;
        selectedIds.value = [];
        
        // 🚀 Immediately remove items from table (status changed to processing, no longer in risk review tab)
        const processedIds = approvalModal.items.map(item => item.id);
        tableData.value = tableData.value.filter(item => !processedIds.includes(item.id));
        paginationReactive.total = Math.max(0, paginationReactive.total - processedIds.length);
        
        // 🔔 Immediately refresh badge counts
        emit('refresh-tabs');
        
        // Then refresh to sync with backend
        await fetchData();
      } else {
        message.error(response.message || '批量审核失败');
      }
    }
  } catch (error) {
    message.error('审核操作失败');
  }
};

const handleRejection = async () => {
  if (!rejectionModal.reason) {
    message.error('请选择拒绝原因');
    return;
  }

  try {
    if (rejectionModal.items.length === 1) {
      // Single rejection
      const response = await riskControlApi.rejectWithdrawal(
        rejectionModal.items[0]?.id || '',
        {
          reason: rejectionModal.reason,
          notes: rejectionModal.notes
        }
      );
      
      if (response.success) {
        message.success('审核拒绝成功，已退回用户余额');
        rejectionModal.show = false;
        selectedIds.value = [];
        
        // 🚀 Immediately remove item from table (status changed to rejected, no longer in risk review tab)
        const processedId = rejectionModal.items[0]?.id;
        if (processedId) {
          tableData.value = tableData.value.filter(item => item.id !== processedId);
          paginationReactive.total = Math.max(0, paginationReactive.total - 1);
        }
        
        // 🔔 Immediately refresh badge counts
        emit('refresh-tabs');
        
        // Then refresh to sync with backend
        await fetchData();
      } else {
        message.error(response.message || '审核失败');
      }
    } else {
      // Bulk rejection
      const response = await riskControlApi.bulkReject({
        withdrawalIds: rejectionModal.items.map(item => item.id),
        reason: rejectionModal.reason,
        notes: rejectionModal.notes
      });
      
      if (response.success) {
        message.success('批量审核拒绝成功，已退回用户余额');
        rejectionModal.show = false;
        selectedIds.value = [];
        
        // 🚀 Immediately remove items from table (status changed to rejected, no longer in risk review tab)
        const processedIds = rejectionModal.items.map(item => item.id);
        tableData.value = tableData.value.filter(item => !processedIds.includes(item.id));
        paginationReactive.total = Math.max(0, paginationReactive.total - processedIds.length);
        
        // 🔔 Immediately refresh badge counts
        emit('refresh-tabs');
        
        // Then refresh to sync with backend
        await fetchData();
      } else {
        message.error(response.message || '批量审核失败');
      }
    }
  } catch (error) {
    message.error('审核操作失败');
  }
};

// Utility functions
const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN');
};

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': 'warning',
    'reviewing': 'info',
    'approved': 'success',
    'rejected': 'error'
  };
  return statusMap[status] || 'default';
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待审核',
    'reviewing': '审核中',
    'approved': '提现成功',
    'rejected': '已拒绝',
    'success': '提现成功',
    'completed': '提现成功',
    'processing': '处理中',
    'failed': '失败'
  };
  return statusMap[status] || status;
};

const getRiskLevelType = (level: string) => {
  const levelMap: Record<string, string> = {
    'LOW': 'success',
    'MEDIUM': 'warning',
    'HIGH': 'error'
  };
  return levelMap[level] || 'default';
};

const getRiskScoreColor = (score: number) => {
  if (score >= 7) return '#f56565';
  if (score >= 4) return '#ed8936';
  return '#48bb78';
};

const getRiskFlagText = (flag: string) => {
  const flagMap: Record<string, string> = {
    'LARGE_AMOUNT': '大额提现',
    'NON_STANDARD_PAYMENT': '非标准支付',
    'FREQUENT_WITHDRAWAL': '频繁提现',
    'SUSPICIOUS_PATTERN': '可疑模式'
  };
  return flagMap[flag] || flag;
};

const canApproveReject = (status: string) => {
  return ['pending', 'reviewing'].includes(status);
};

// Auto-refresh handler
const handleRefreshIntervalChange = (newInterval: number) => {
  console.log('RiskControlReview: Refresh interval changed to', newInterval, 'seconds');
  // SmartAutoRefresh component handles all timer logic
};

// Lifecycle
onMounted(async () => {
  // 🔧 FIX: Load sequentially to prevent database connection race
  await fetchAvailableProviders();
  
  // Small delay before next query
  await new Promise(resolve => setTimeout(resolve, 100));
  
  await fetchData();
});
</script>

<style scoped>
.risk-control-review {
  padding: 16px;
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
</style>
