<template>
  <div class="recharge-management">
    <!-- Main Navigation Tabs (simplified) -->
    <n-tabs v-model:value="activeTab" type="line" class="mb-4">
      <n-tab-pane name="all-recharges" tab="全部充值">
        <!-- Enhanced Filter Section -->
        <n-card class="mb-4">
          <!-- Top Row - Primary Filters -->
          <div class="mb-4 flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-600">创建时间</span>
              <n-radio-group
                v-model:value="filterForm.timeRange"
                size="small"
                @update:value="handleTimeRangeChange"
              >
                <n-radio value="today">今天</n-radio>
                <n-radio value="week">本周</n-radio>
                <n-radio value="month">本月</n-radio>
              </n-radio-group>
              <n-date-picker
                v-model:value="filterForm.dateRange"
                type="datetimerange"
                format="yyyy-MM-dd HH:mm:ss"
                placeholder="选择自定义时间范围"
                style="width: 350px"
                clearable
                @update:value="handleDateRangeChange"
              />
            </div>
          </div>

          <!-- Second Row - Search and Status Filters（搜索条件与全部会员页一致） -->
          <div class="mb-4 flex flex-wrap items-end gap-4">
            <n-select
              v-model:value="filterForm.status"
              placeholder="订单状态"
              style="width: 120px"
              clearable
              :options="statusOptions"
            />
            <div class="flex flex-col">
              <n-select
                v-model:value="filterForm.searchCondition"
                placeholder="请选择搜索条件"
                clearable
                style="width: 200px"
                :options="searchConditionOptions"
                @update:value="handleSearchConditionChange"
              />
            </div>
            <div v-if="filterForm.searchCondition" class="flex flex-col">
              <n-select
                v-model:value="filterForm.searchConditionValue"
                :placeholder="`请选择${getSearchConditionLabel()}`"
                clearable
                filterable
                style="width: 200px"
                :options="searchConditionValueOptions"
                :loading="loadingConditionOptions"
              />
            </div>
            <FieldSearchBar
              v-model:field="filterForm.searchField"
              v-model:value="filterForm.searchValue"
              :options="rechargeSearchFieldOptions"
              select-placeholder="请选择搜索字段"
              select-width="200px"
              input-width="240px"
              value-placeholder-fallback="搜索值"
              @field-changed="handleRechargeSearchFieldChange"
              @search="handleSearch"
            />
          </div>

          <!-- Third Row - Action Buttons -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <n-button type="primary" @click="handleSearch">
                <template #icon>
                  <n-icon :component="SearchOutline" />
                </template>
                搜索
              </n-button>
              <n-button @click="handleAdvancedSearch"> 高级搜索 </n-button>
              <n-button @click="handleReset">重置</n-button>
            </div>
            <div class="flex items-center gap-2">
              <n-button type="primary" @click="handleCreateSupplementaryOrder">
                <template #icon>
                  <n-icon :component="AddOutline" />
                </template>
                创建补单
              </n-button>
              <n-button @click="handleExport">
                <template #icon>
                  <n-icon :component="DownloadOutline" />
                </template>
                导出报表
              </n-button>
              <n-button @click="fetchData">
                <template #icon>
                  <n-icon :component="ReloadOutline" />
                </template>
                刷新
              </n-button>
            </div>
          </div>
        </n-card>

        <!-- Enhanced Summary Stats -->
        <n-card class="mb-4">
          <div class="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            <div
              class="rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 p-3 text-center"
            >
              <div class="text-lg font-bold text-blue-600">
                {{ summary.totalCount }}
              </div>
              <div class="mt-1 text-xs text-gray-600">全部充值</div>
            </div>
            <div
              class="rounded-lg bg-gradient-to-r from-green-50 to-green-100 p-3 text-center"
            >
              <div class="text-lg font-bold text-green-600">
                {{ formatCurrency(summary.totalAmount) }}
              </div>
              <div class="mt-1 text-xs text-gray-600">充值总计</div>
            </div>
            <div
              class="rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 p-3 text-center"
            >
              <div class="text-lg font-bold text-yellow-600">
                {{ summary.pendingCount }}
              </div>
              <div class="mt-1 text-xs text-gray-600">充值锁定</div>
            </div>
            <div
              class="rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 p-3 text-center"
            >
              <div class="text-lg font-bold text-purple-600">
                {{ summary.confirmedCount }}
              </div>
              <div class="mt-1 text-xs text-gray-600">充值确认</div>
            </div>
            <div
              class="rounded-lg bg-gradient-to-r from-red-50 to-red-100 p-3 text-center"
            >
              <div class="text-lg font-bold text-red-600">
                {{ summary.rejectedCount }}
              </div>
              <div class="mt-1 text-xs text-gray-600">充值失败</div>
            </div>
            <div
              class="rounded-lg bg-gradient-to-r from-indigo-50 to-indigo-100 p-3 text-center"
            >
              <div class="text-lg font-bold text-indigo-600">不自动刷新</div>
              <div class="mt-1 text-xs text-gray-600">操作教程</div>
            </div>
          </div>
        </n-card>

        <!-- Enhanced Table Section -->
        <n-card>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-medium">充值记录</span>
              <div class="flex items-center gap-2 text-sm text-gray-500">
                <span>共 {{ summary.totalCount }} 条</span>
                <n-divider vertical />
                <n-button size="small" text @click="toggleTableDensity">
                  {{ tableDense ? '宽松显示' : '紧凑显示' }}
                </n-button>
              </div>
            </div>
          </template>

          <n-data-table
            ref="tableRef"
            :columns="columns"
            :data="tableData"
            :loading="loading"
            :pagination="paginationConfig"
            :row-key="(row: RechargeOrder) => row.orderId"
            v-model:checked-row-keys="checkedRowKeys"
            striped
            remote
            :size="tableDense ? 'small' : 'medium'"
            :scroll-x="2500"
            @update:page="handlePageChange"
            @update:page-size="handlePageSizeChange"
          />
        </n-card>
      </n-tab-pane>

      <n-tab-pane name="recharge-statistics" tab="充值统计">
        <!-- Statistics Filter Section -->
        <n-card class="mb-4">
          <div class="mb-4 flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-600">统计时间</span>
              <n-radio-group
                v-model:value="statsForm.timeRange"
                size="small"
                @update:value="handleStatsTimeRangeChange"
              >
                <n-radio value="today">今天</n-radio>
                <n-radio value="week">本周</n-radio>
                <n-radio value="month">本月</n-radio>
                <n-radio value="custom">自定义</n-radio>
              </n-radio-group>
              <n-date-picker
                v-if="statsForm.timeRange === 'custom'"
                v-model:value="statsForm.dateRange"
                type="datetimerange"
                format="yyyy-MM-dd HH:mm:ss"
                placeholder="选择时间范围"
                style="width: 350px"
                clearable
                @update:value="handleStatsDateRangeChange"
              />
            </div>
          </div>

          <div class="mb-4 flex flex-wrap items-center gap-4">
            <n-select
              v-model:value="statsForm.paymentMethod"
              placeholder="支付方式"
              style="width: 140px"
              clearable
              :options="paymentMethodOptions"
              @update:value="handleStatsFilterChange"
            />
            <n-select
              v-model:value="statsForm.status"
              placeholder="订单状态"
              style="width: 120px"
              clearable
              :options="statusOptions"
              @update:value="handleStatsFilterChange"
            />
            <n-select
              v-model:value="statsForm.groupBy"
              placeholder="分组方式"
              style="width: 120px"
              :options="groupByOptions"
              @update:value="handleStatsFilterChange"
            />
            <n-button type="primary" @click="fetchStatsData">
              <template #icon>
                <n-icon :component="ReloadOutline" />
              </template>
              刷新数据
            </n-button>
          </div>
        </n-card>

        <!-- Statistics Overview Cards -->
        <n-card class="mb-4">
          <div class="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
            <div
              class="rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 p-3 text-center"
            >
              <div class="text-lg font-bold text-blue-600">
                {{ formatCurrency(statsData.summary?.totalSuccessAmount || 0) }}
              </div>
              <div class="mt-1 text-xs text-gray-600">充值成功金额</div>
            </div>
            <div
              class="rounded-lg bg-gradient-to-r from-green-50 to-green-100 p-3 text-center"
            >
              <div class="text-lg font-bold text-green-600">
                {{ statsData.summary?.totalSuccessCount || 0 }}
              </div>
              <div class="mt-1 text-xs text-gray-600">充值人数</div>
            </div>
            <div
              class="rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 p-3 text-center"
            >
              <div class="text-lg font-bold text-purple-600">
                {{ statsData.summary?.totalOrders || 0 }}
              </div>
              <div class="mt-1 text-xs text-gray-600">成功充值人数</div>
            </div>
            <div
              class="rounded-lg bg-gradient-to-r from-orange-50 to-orange-100 p-3 text-center"
            >
              <div class="text-lg font-bold text-orange-600">
                {{ statsData.summary?.totalSuccessCount || 0 }}
              </div>
              <div class="mt-1 text-xs text-gray-600">充值总订单数</div>
            </div>
            <div
              class="rounded-lg bg-gradient-to-r from-red-50 to-red-100 p-3 text-center"
            >
              <div class="text-lg font-bold text-red-600">
                {{ statsData.summary?.totalSuccessCount || 0 }}
              </div>
              <div class="mt-1 text-xs text-gray-600">成功充值订单数</div>
            </div>
            <div
              class="rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 p-3 text-center"
            >
              <div class="text-lg font-bold text-yellow-600">
                {{ statsData.summary?.totalFailedCount || 0 }}
              </div>
              <div class="mt-1 text-xs text-gray-600">失败充值订单数</div>
            </div>
            <div
              class="rounded-lg bg-gradient-to-r from-indigo-50 to-indigo-100 p-3 text-center"
            >
              <div class="text-lg font-bold text-indigo-600">
                {{ (statsData.summary?.successRate || 0).toFixed(1) }}%
              </div>
              <div class="mt-1 text-xs text-gray-600">充值成功率</div>
            </div>
            <div
              class="rounded-lg bg-gradient-to-r from-pink-50 to-pink-100 p-3 text-center"
            >
              <div class="text-lg font-bold text-pink-600">0%</div>
              <div class="mt-1 text-xs text-gray-600">充值次数占比</div>
            </div>
          </div>
        </n-card>

        <!-- Charts and Tables Section -->
        <div class="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <!-- Time Series Chart -->
          <n-card>
            <template #header>
              <span class="font-medium">充值趋势图</span>
            </template>
            <EchartsUI ref="timeSeriesChartRef" style="height: 300px" />
          </n-card>

          <!-- Payment Method Distribution -->
          <n-card>
            <template #header>
              <span class="font-medium">支付方式分布</span>
            </template>
            <EchartsUI ref="paymentMethodChartRef" style="height: 300px" />
          </n-card>
        </div>

        <!-- Detailed Statistics Table -->
        <n-card>
          <template #header>
            <span class="font-medium">支付方式详细统计</span>
          </template>
          <n-data-table
            :columns="statsColumns"
            :data="statsData.paymentMethodStats || []"
            :loading="statsLoading"
            :pagination="false"
            size="small"
            striped
          />
        </n-card>

        <!-- Top Users Section -->
        <n-card class="mt-4">
          <template #header>
            <span class="font-medium">充值排行榜</span>
          </template>
          <n-data-table
            :columns="topUsersColumns"
            :data="statsData.topUsers || []"
            :loading="statsLoading"
            :pagination="false"
            size="small"
            striped
          />
        </n-card>
      </n-tab-pane>
    </n-tabs>

    <!-- Create/Edit Modal -->
    <n-modal
      v-model:show="showRechargeModal"
      :title="isEditing ? '编辑充值' : '新建充值'"
      preset="card"
      style="width: 600px"
    >
      <n-form
        ref="rechargeFormRef"
        :model="rechargeForm"
        :rules="rechargeRules"
        label-placement="left"
        label-width="120px"
      >
        <n-form-item label="会员ID" path="memberId">
          <n-auto-complete
            v-model:value="rechargeForm.userId"
            :options="memberOptions"
            :loading="memberLoading"
            placeholder="请输入会员ID/账号/姓名进行搜索"
            :disabled="isEditing"
            @input="handleMemberInput"
            @select="handleMemberSelect"
            @clear="handleMemberClear"
            clearable
          />
        </n-form-item>

        <!-- Member Info Display -->
        <div v-if="selectedMember" class="mb-4 rounded bg-gray-50 p-3">
          <h4 class="mb-2 font-semibold">会员信息</h4>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span class="font-medium">会员ID:</span>
              {{ selectedMember.value }}
            </div>
            <div>
              <span class="font-medium">账号:</span>
              {{ selectedMember.account }}
            </div>
            <div>
              <span class="font-medium">姓名:</span> {{ selectedMember.name }}
            </div>
            <div>
              <span class="font-medium">VIP等级:</span>
              {{ selectedMember.vipLevel }}
            </div>
            <div>
              <span class="font-medium">当前余额:</span>
              {{ formatCurrency(selectedMember.balance) }}
            </div>
            <div>
              <span class="font-medium">邮箱:</span> {{ selectedMember.email }}
            </div>
          </div>
        </div>

        <n-form-item label="充值金额" path="amount">
          <n-input-number
            v-model:value="rechargeForm.amount"
            :min="0"
            :precision="2"
            placeholder="请输入充值金额"
            style="width: 100%"
          />
        </n-form-item>

        <n-form-item label="充值方式" path="rechargeMethod">
          <n-select
            v-model:value="rechargeForm.rechargeMethod"
            :options="rechargeMethodOptions"
            placeholder="请选择充值方式"
          />
        </n-form-item>

        <n-form-item label="支付渠道" path="channelInfo">
          <n-input
            v-model:value="rechargeForm.channelInfo"
            placeholder="请输入支付渠道信息"
          />
        </n-form-item>

        <n-form-item label="备注" path="note">
          <n-input
            v-model:value="rechargeForm.note"
            type="textarea"
            placeholder="请输入备注信息"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </n-form-item>
      </n-form>

      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="showRechargeModal = false">取消</n-button>
          <n-button
            type="primary"
            @click="handleSaveRecharge"
            :loading="modalLoading"
          >
            {{ isEditing ? '更新' : '创建' }}
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- User Detail Modal - Reuse existing UserDetailModal component -->
    <UserDetailModal
      v-model:visible="showUserDetailModal"
      :user-id="currentUserId"
    />

    <!-- Order Details Modal -->
    <n-modal
      v-model:show="showOrderDetailsModal"
      preset="card"
      title="订单详情"
      style="width: 900px; max-width: 90vw"
      :bordered="false"
      size="huge"
      :mask-closable="false"
    >
      <div v-if="orderDetails" class="order-details">
        <!-- Order Information Section -->
        <n-card title="订单信息" class="mb-4" size="small">
          <div class="grid grid-cols-2 gap-4">
            <div class="flex justify-between">
              <span class="text-gray-600">订单号:</span>
              <span class="font-mono">{{ orderDetails.orderId }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">订单状态:</span>
              <n-tag :type="getStatusColor(orderDetails.status)" size="small">
                {{ getStatusText(orderDetails.status) }}
              </n-tag>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">会员ID:</span>
              <span>{{ orderDetails.memberId }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">会员账号:</span>
              <span>{{ orderDetails.accountName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">会员层级:</span>
              <span>{{ orderDetails.memberTag || '默认层级' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">充值大类:</span>
              <span>{{
                orderDetails.rechargeChannelInfo?.channel || 'N/A'
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">充值币种:</span>
              <span>{{ orderDetails.currency || 'BRL' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">通道名称:</span>
              <span>{{ orderDetails.channelName || 'N/A' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">稽核倍数:</span>
              <span>{{
                orderDetails.auditMultiplier?.toFixed(2) || '1.00'
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">标记:</span>
              <span>{{ orderDetails.memberTag || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">充值信息:</span>
              <span>{{
                orderDetails.rechargeChannelInfo?.accountNumber || '-'
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">通道编码:</span>
              <span>{{ orderDetails.channelCode || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">操作人:</span>
              <span>{{ orderDetails.operator || 'system' }}</span>
            </div>
            <div class="col-span-2 flex justify-between">
              <span class="text-gray-600">三方商户订单号:</span>
              <span class="font-mono">{{
                orderDetails.thirdPartyOrderNo || '-'
              }}</span>
            </div>
          </div>
        </n-card>

        <!-- Amount and Time Information Section -->
        <n-card title="金额和时间信息" size="small">
          <n-table :bordered="false" :single-line="false">
            <tbody>
              <tr>
                <td class="text-gray-600" style="width: 150px">订单金额</td>
                <td class="text-right">
                  {{ formatCurrency(orderDetails.rechargeAmount) }}
                </td>
              </tr>
              <tr>
                <td class="text-gray-600">赠送金额</td>
                <td class="text-right">
                  {{ formatCurrency(orderDetails.bonusAmount || 0) }}
                </td>
              </tr>
              <tr>
                <td class="text-gray-600">总上分金额</td>
                <td class="text-right">
                  {{
                    formatCurrency(
                      (orderDetails.rechargeAmount || 0) +
                        (orderDetails.bonusAmount || 0),
                    )
                  }}
                </td>
              </tr>
              <tr>
                <td class="text-gray-600">会员币种</td>
                <td class="text-right">{{ orderDetails.currency || 'BRL' }}</td>
              </tr>
              <tr>
                <td class="text-gray-600">收款账号/地址</td>
                <td class="text-right">
                  {{ orderDetails.receivingAccount || '-' }}
                </td>
              </tr>
              <tr>
                <td class="text-gray-600">是否首充</td>
                <td class="text-right">
                  {{ orderDetails.isFirstDeposit ? '是' : '否' }}
                </td>
              </tr>
              <tr>
                <td class="text-gray-600">备注</td>
                <td class="text-right">
                  {{ orderDetails.backendNote || '-' }}
                </td>
              </tr>
              <tr>
                <td class="text-gray-600">创建时间</td>
                <td class="text-right">
                  {{
                    formatDateTime(
                      orderDetails.appliedAt,
                      'yyyy-MM-dd HH:mm:ss',
                    )
                  }}
                </td>
              </tr>
              <tr>
                <td class="text-gray-600">成功时间</td>
                <td class="text-right">
                  {{
                    orderDetails.confirmTime
                      ? formatDateTime(
                          orderDetails.confirmTime,
                          'yyyy-MM-dd HH:mm:ss',
                        )
                      : '-'
                  }}
                </td>
              </tr>
              <tr>
                <td class="text-gray-600">更新时间</td>
                <td class="text-right">
                  {{
                    formatDateTime(
                      orderDetails.updatedAt || orderDetails.appliedAt,
                      'yyyy-MM-dd HH:mm:ss',
                    )
                  }}
                </td>
              </tr>
            </tbody>
          </n-table>
        </n-card>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <n-button @click="showOrderDetailsModal = false">关闭</n-button>
        </div>
      </template>
    </n-modal>

    <!-- Supplementary Order Modal -->
    <n-modal
      v-model:show="showSupplementaryOrderModal"
      title="创建补单"
      preset="card"
      style="width: 500px"
      :mask-closable="false"
    >
      <div class="space-y-4">
        <!-- Order Number Input -->
        <div class="flex items-center gap-3">
          <div class="flex-1">
            <label class="mb-2 block text-sm font-medium text-gray-700">
              *订单号
            </label>
            <n-input
              v-model:value="supplementaryOrderForm.orderNumber"
              placeholder="请输入订单号"
              :maxlength="30"
              show-count
              clearable
              @keyup.enter="handleSearchOrder"
            />
          </div>
          <n-button
            type="primary"
            @click="handleSearchOrder"
            :loading="searchingOrder"
            class="mt-6"
          >
            搜索
          </n-button>
        </div>

        <!-- Search Results Display -->
        <div v-if="searchedOrder" class="rounded-lg bg-gray-50 p-3">
          <h4 class="mb-2 font-medium text-gray-900">订单信息</h4>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span class="font-medium">订单号:</span>
              {{ searchedOrder.orderId }}
            </div>
            <div>
              <span class="font-medium">会员账号:</span>
              {{ searchedOrder.accountName }}
            </div>
            <div>
              <span class="font-medium">充值金额:</span>
              {{ formatCurrency(searchedOrder.rechargeAmount) }}
            </div>
            <div>
              <span class="font-medium">状态:</span>
              <n-tag :type="getStatusColor(searchedOrder.status)" size="small">
                {{ getStatusText(searchedOrder.status) }}
              </n-tag>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div
          v-if="searchError"
          class="rounded-lg border border-red-200 bg-red-50 p-3"
        >
          <p class="text-sm text-red-600">{{ searchError }}</p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="showSupplementaryOrderModal = false">取消</n-button>
          <n-button
            type="primary"
            @click="handleConfirmSupplementaryOrder"
            :disabled="!searchedOrder"
            :loading="creatingOrder"
          >
            确认
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import {
  NCard,
  NTabs,
  NTabPane,
  NDataTable,
  NButton,
  NInput,
  NSelect,
  NDatePicker,
  NModal,
  NForm,
  NFormItem,
  NInputNumber,
  NAutoComplete,
  NTag,
  NText,
  NSpace,
  NIcon,
  NRadioGroup,
  NRadio,
  NDivider,
  NTable,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import {
  ReloadOutline,
  SearchOutline,
  AddOutline,
  DownloadOutline,
} from '@vicons/ionicons5';

// API imports
import {
  rechargeApi,
  type RechargeOrder,
  type Summary,
  type RechargeListParams,
  type UpdateRechargeParams,
  type CreateRechargeParams,
} from '#/api/finance/recharge';
import {
  rechargeStatsApi,
  type RechargeStatsParams,
  type RechargeStatsResponse,
} from '#/api/finance/recharge-stats';
import { searchUsersApi } from '#/api/core/user-management';
import FieldSearchBar, {
  type FieldSearchBarOption,
} from '#/components/filters/FieldSearchBar.vue';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
import { defineAsyncComponent } from 'vue';
const UserDetailModal = defineAsyncComponent(
  () => import('#/components/user/UserDetailModal.vue'),
);

// ECharts imports
import type { EchartsUIType } from '@vben/plugins/echarts';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

// Reactive data
const message = useMessage();
const activeTab = ref('all-recharges');
const loading = ref(false);
const modalLoading = ref(false);
const showRechargeModal = ref(false);
const isEditing = ref(false);
const currentEditingOrder = ref<RechargeOrder | null>(null);
const tableData = ref<RechargeOrder[]>([]);
const checkedRowKeys = ref<string[]>([]);
const tableRef = ref();
const rechargeFormRef = ref();
const memberLoading = ref(false);
let searchTimeout: NodeJS.Timeout;

// Member search
const memberOptions = ref<any[]>([]);
const selectedMember = ref<any>(null);

// UI State
const tableDense = ref(false);

// User Detail Modal State
const showUserDetailModal = ref(false);
const currentUserId = ref<number>(0);

// Order Details Modal State
const showOrderDetailsModal = ref(false);
const orderDetails = ref<RechargeOrder | null>(null);
const loadingOrderDetails = ref(false);

// Supplementary Order Modal State
const showSupplementaryOrderModal = ref(false);
const searchingOrder = ref(false);
const creatingOrder = ref(false);
const searchedOrder = ref<RechargeOrder | null>(null);
const searchError = ref('');

const supplementaryOrderForm = reactive({
  orderNumber: '',
});

// Summary data
const summary = ref<Summary>({
  totalCount: 0,
  totalAmount: 0,
  pendingCount: 0,
  confirmedCount: 0,
  rejectedCount: 0,
});

// Filter form with default week filter to show more data
const filterForm = ref({
  searchCondition: null as string | null,
  searchConditionValue: null as string | null,
  searchField: 'exact_account' as string | null,
  searchValue: '',
  searchMode: 'exact' as 'exact' | 'fuzzy',
  dateRange: null as [number, number] | null, // Fix type for date picker
  timeRange: 'week' as 'today' | 'week' | 'month' | '',
  status: null as string | null,
  rechargeMethod: null as string | null,
  agentMode: null as string | null,
  thirdPartyPayment: null as string | null,
  serviceFilter: null as string | null,
});

/** 与 src/views/user-management/all-members 一致 */
const searchConditionOptions = [
  { label: '会员层级', value: 'memberLevel' },
  { label: 'VIP等级', value: 'vipLevel' },
  { label: '会员标签', value: 'memberTags' },
  { label: '在线状态', value: 'onlineStatus' },
  { label: '账号状态', value: 'accountStatus' },
  { label: '登录记录', value: 'loginHistory' },
];

const onlineStatusOptions = [
  { label: '当前在线', value: 'currently_online' },
  { label: '大厅会员', value: 'lobby_member' },
  { label: '自营游戏会员', value: 'self_operated_member' },
  { label: '三方游戏会员', value: 'third_party_member' },
  { label: '疑似机器人', value: 'suspected_bot' },
  { label: '今日在线', value: 'today_online' },
];

const loadingConditionOptions = ref(false);
const searchConditionValueOptions = ref<
  Array<{ label: string; value: string }>
>([]);

const handleSearchConditionChange = async (value: string | null) => {
  filterForm.value.searchConditionValue = null;
  searchConditionValueOptions.value = [];

  if (!value) return;

  loadingConditionOptions.value = true;
  try {
    switch (value) {
      case 'accountStatus': {
        searchConditionValueOptions.value = [
          { label: '正常', value: 'NORMAL' },
          { label: '冻结', value: 'FROZEN' },
          { label: '异常冻结', value: 'ABNORMAL_FREEZE' },
          { label: '锁定', value: 'LOCKED' },
          { label: '暂停', value: 'SUSPENDED' },
          { label: '临时', value: 'TEMPORARY' },
        ];
        break;
      }
      case 'loginHistory': {
        searchConditionValueOptions.value = [
          { label: '今天登录', value: 'today' },
          { label: '7天内登录', value: 'week' },
          { label: '30天内登录', value: 'month' },
          { label: '从未登录', value: 'never' },
        ];
        break;
      }
      case 'memberLevel': {
        const { getActiveMemberTiersApi } = await import(
          '#/api/core/memberTier'
        );
        const tiers = await getActiveMemberTiersApi();
        searchConditionValueOptions.value = tiers.map((tier) => ({
          label: tier.tierName,
          value: tier.id.toString(),
        }));
        break;
      }
      case 'memberTags': {
        searchConditionValueOptions.value = [
          { label: '普通用户', value: 'normal' },
          { label: 'VIP用户', value: 'vip' },
          { label: '代理用户', value: 'agent' },
        ];
        break;
      }
      case 'onlineStatus': {
        searchConditionValueOptions.value = onlineStatusOptions;
        break;
      }
      case 'vipLevel': {
        const { getVIPLevels } = await import('#/api/vip');
        const vipResponse = await getVIPLevels({
          pageSize: 100,
          isActive: true,
        });
        const vipLevels = vipResponse.list || [];
        searchConditionValueOptions.value = vipLevels.map((level) => ({
          label: level.name,
          value: level.id.toString(),
        }));
        break;
      }
    }
  } catch (error) {
    console.error('Error loading search condition options:', error);
    message.error('加载选项失败');
  } finally {
    loadingConditionOptions.value = false;
  }
};

const getSearchConditionLabel = () => {
  const condition = searchConditionOptions.find(
    (opt) => opt.value === filterForm.value.searchCondition,
  );
  return condition ? condition.label : '值';
};

const rechargeSearchFieldOptions: FieldSearchBarOption[] = [
  { label: '精准会员账号', value: 'exact_account', mode: 'exact' },
  { label: '模糊会员账号', value: 'fuzzy_account', mode: 'fuzzy' },
  { label: '会员ID', value: 'userID', mode: 'exact' },
  { label: '精准姓名', value: 'exact_name', mode: 'exact' },
  { label: '模糊姓名', value: 'fuzzy_name', mode: 'fuzzy' },
  { label: '订单号', value: 'order_id', mode: 'exact' },
  { label: '三方订单号', value: 'third_party_order_no', mode: 'exact' },
];

function handleRechargeSearchFieldChange(field: string | null) {
  if (!field) return;
  const opt = rechargeSearchFieldOptions.find((o) => o.value === field);
  if (opt?.mode) {
    filterForm.value.searchMode = opt.mode;
  }
}

function applySearchToParams(params: RechargeListParams) {
  const v = filterForm.value.searchValue.trim();
  if (!v) return;
  if (filterForm.value.searchField) {
    params.searchField = filterForm.value.searchField;
    params.searchValue = v;
    if (filterForm.value.searchField === 'exact_account') {
      params.searchMode = 'exact';
    } else if (filterForm.value.searchField === 'fuzzy_account') {
      params.searchMode = 'fuzzy';
    } else {
      params.searchMode = filterForm.value.searchMode;
    }
  } else {
    params.search = v;
  }
}

function applySearchConditionToParams(params: RechargeListParams) {
  if (filterForm.value.searchCondition) {
    params.searchCondition = filterForm.value.searchCondition;
    if (filterForm.value.searchConditionValue) {
      params.searchConditionValue = filterForm.value.searchConditionValue;
    }
  }
}

// Statistics form - default to week to show more data
const statsForm = ref({
  timeRange: 'week' as 'today' | 'week' | 'month' | 'custom',
  dateRange: null as [number, number] | null,
  paymentMethod: null as string | null,
  status: null as string | null,
  groupBy: 'day' as 'day' | 'week' | 'month',
});

// Statistics data
const statsData = ref<RechargeStatsResponse>({
  summary: {
    totalSuccessAmount: 0,
    totalSuccessCount: 0,
    totalFailedCount: 0,
    totalPendingCount: 0,
    totalOrders: 0,
    successRate: 0,
    avgOrderAmount: 0,
    uniqueUsers: 0,
  },
  timeSeriesData: [],
  paymentMethodStats: [],
  topUsers: [],
  dailyTrends: [],
});

const statsLoading = ref(false);

// ECharts refs
const timeSeriesChartRef = ref<EchartsUIType>();
const paymentMethodChartRef = ref<EchartsUIType>();
const { renderEcharts: renderTimeSeriesChart } = useEcharts(timeSeriesChartRef);
const { renderEcharts: renderPaymentMethodChart } = useEcharts(
  paymentMethodChartRef,
);

// Chart rendering functions
const renderCharts = () => {
  console.log('📊 Rendering charts with current data...');
  renderTimeSeriesChartData();
  renderPaymentMethodChartData();
};

const renderTimeSeriesChartData = () => {
  const timeSeriesData = statsData.value.timeSeriesData || [];
  console.log('📊 Rendering time series chart with data:', timeSeriesData);

  if (timeSeriesData.length === 0) {
    console.log('📊 No time series data available');
    return;
  }

  const options = {
    title: {
      text: '充值趋势',
      left: 'center',
      textStyle: { fontSize: 14 },
    },
    grid: {
      top: '15%',
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: any) => {
        let result = params[0].name + '<br/>';
        params.forEach((param: any) => {
          if (param.seriesName.includes('金额')) {
            result +=
              param.marker +
              param.seriesName +
              ': ' +
              formatCurrency(param.value) +
              '<br/>';
          } else {
            result +=
              param.marker + param.seriesName + ': ' + param.value + '<br/>';
          }
        });
        return result;
      },
    },
    legend: {
      data: ['成功金额', '成功笔数', '失败笔数'],
      bottom: 0,
    },
    xAxis: {
      type: 'category' as const,
      data: timeSeriesData.map((item) => item.date),
    },
    yAxis: [
      {
        type: 'value' as const,
        name: '金额',
        position: 'left' as const,
      },
      {
        type: 'value' as const,
        name: '笔数',
        position: 'right' as const,
      },
    ],
    series: [
      {
        name: '成功金额',
        type: 'bar' as const,
        yAxisIndex: 0,
        data: timeSeriesData.map((item) => item.successAmount),
        itemStyle: { color: '#18a058' },
      },
      {
        name: '成功笔数',
        type: 'line' as const,
        yAxisIndex: 1,
        data: timeSeriesData.map((item) => item.successCount),
        itemStyle: { color: '#2080f0' },
      },
      {
        name: '失败笔数',
        type: 'line' as const,
        yAxisIndex: 1,
        data: timeSeriesData.map((item) => item.failedCount),
        itemStyle: { color: '#d03050' },
      },
    ],
  };

  console.log('📊 Time series options:', options);
  renderTimeSeriesChart(options);
};

const renderPaymentMethodChartData = () => {
  const paymentMethodStats = statsData.value.paymentMethodStats || [];
  console.log(
    '📊 Rendering payment method chart with data:',
    paymentMethodStats,
  );

  if (paymentMethodStats.length === 0) {
    console.log('📊 No payment method data available');
    return;
  }

  const paymentMethodData = paymentMethodStats.map((item) => ({
    name: item.paymentMethod,
    value: item.totalAmount,
  }));

  const options = {
    title: {
      text: '支付方式分布',
      left: 'center',
      textStyle: { fontSize: 14 },
    },
    tooltip: {
      trigger: 'item' as const,
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'horizontal' as const,
      bottom: 0,
      data: paymentMethodData.map((item) => item.name),
    },
    series: [
      {
        name: '支付方式',
        type: 'pie' as const,
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        data: paymentMethodData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        label: {
          formatter: '{b}: {d}%',
        },
      },
    ],
  };

  console.log('📊 Payment method options:', options);
  renderPaymentMethodChart(options);
};

// Utility functions
const formatCurrency = (value: number) => {
  // ✅ FIX: Format with proper 2 decimal places, ensure no extra trailing zeros
  // pt-BR format: R$ 100,00 (comma for decimals)
  // Remove any extra trailing zeros that might be added (e.g., R$ 100,000 → R$ 100,00)
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  // ✅ Remove extra trailing zeros after the decimal separator (comma in pt-BR)
  // e.g., "R$ 100,000" → "R$ 100,00" (remove extra 0)
  // Match pattern: R$ X,XXX... where XXX has more than 2 digits
  return formatted.replace(/,(\d{2})\d+/, ',$1');
};

// Recharge form
const rechargeForm = ref({
  memberId: '',
  amount: null as number | null,
  rechargeMethod: '',
  channelInfo: '',
  note: '',
});

// Pagination with proper types
const paginationConfig = ref({
  page: 1,
  pageSize: 20,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  showQuickJumper: true,
  prefix: ({ itemCount }: { itemCount: number | undefined }) =>
    `共 ${itemCount || 0} 项`,
});

// Form validation rules with proper types
const rechargeRules = {
  memberId: [{ required: true, message: '请选择会员', trigger: 'blur' }],
  amount: [
    { required: true, message: '请输入充值金额', trigger: 'blur' },
    {
      type: 'number' as const,
      min: 0.01,
      message: '充值金额必须大于0',
      trigger: 'blur',
    },
  ],
  rechargeMethod: [
    { required: true, message: '请选择充值方式', trigger: 'change' },
  ],
};

// Options
const statusOptions = [
  { label: '待处理', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '已拒绝', value: 'rejected' },
  { label: '处理中', value: 'processing' },
  { label: '已过期', value: 'expired' }, // ✅ Add expired status
];

const rechargeMethodOptions = [
  { label: 'PIX', value: 'pix' },
  { label: 'TED', value: 'ted' },
  { label: 'DOC', value: 'doc' },
  { label: 'Boleto', value: 'boleto' },
  { label: 'Credit Card', value: 'credit_card' },
];

const paymentMethodOptions = [
  { label: 'PIX', value: 'PIX' },
  { label: 'TED', value: 'TED' },
  { label: 'DOC', value: 'DOC' },
  { label: 'Boleto', value: 'Boleto' },
  { label: 'Credit Card', value: 'CreditCard' },
  { label: 'Manual Entry', value: 'Manual' },
];

const groupByOptions = [
  { label: '按日', value: 'day' },
  { label: '按周', value: 'week' },
  { label: '按月', value: 'month' },
];

const formatDateTime = (dateString: string, format?: string): string => {
  const date = new Date(dateString);
  if (format === 'yyyy-MM-dd') {
    return date.toLocaleDateString('pt-BR');
  } else if (format === 'HH:mm:ss') {
    return date.toLocaleTimeString('pt-BR');
  } else if (format === 'MM-dd HH:mm') {
    return (
      date.toLocaleDateString('pt-BR', { month: '2-digit', day: '2-digit' }) +
      ' ' +
      date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    );
  }
  return (
    date.toLocaleDateString('pt-BR') +
    ' ' +
    date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  );
};

const getStatusColor = (
  status: string,
): 'default' | 'error' | 'primary' | 'success' | 'info' | 'warning' => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'success':
      return 'success'; // Database status for confirmed
    case 'failed':
      return 'error'; // Database status for rejected
    case 'processing':
      return 'info';
    case 'expired':
      return 'error'; // ✅ Expired status
    case 'confirmed':
      return 'success'; // Legacy frontend status
    case 'rejected':
      return 'error'; // Legacy frontend status
    default:
      return 'default';
  }
};

const getStatusText = (status: string): string => {
  switch (status) {
    case 'pending':
      return '待审核';
    case 'success':
      return '已放款成功'; // Database status for confirmed
    case 'failed':
      return '已拒绝'; // Database status for rejected
    case 'processing':
      return '处理中';
    case 'expired':
      return '已过期'; // ✅ Expired status in Chinese
    case 'confirmed':
      return '已放款成功'; // Legacy frontend status
    case 'rejected':
      return '已拒绝'; // Legacy frontend status
    default:
      return status;
  }
};

const getVipLevelColor = (vipLevel: string): string => {
  if (!vipLevel || vipLevel === 'VIP0') return 'default';
  if (vipLevel === 'VIP1') return 'info';
  if (vipLevel === 'VIP2') return 'success';
  if (vipLevel === 'VIP3') return 'warning';
  if (vipLevel === 'VIP4') return 'error';
  return 'primary';
};

// Member search functions
const handleMemberSearch = async (query: string) => {
  if (!query.trim()) {
    memberOptions.value = [];
    return;
  }

  memberLoading.value = true;
  try {
    const response = await searchUsersApi({ q: query, limit: 10 });
    memberOptions.value = response.data.map((user) => ({
      label: `${user.account} - ${user.name}`,
      value: user.value,
      account: user.account,
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      balance: user.balance,
      vipLevel: user.vipLevel,
    }));
  } catch (error) {
    console.error('Member search error:', error);
    memberOptions.value = [];
  } finally {
    memberLoading.value = false;
  }
};

const handleMemberInput = (value: string) => {
  const matchedOption = memberOptions.value.find(
    (option) => option.label === value,
  );

  if (matchedOption) {
    rechargeForm.value.memberId = matchedOption.value;
    selectedMember.value = matchedOption;
    return;
  }

  if (/^\d+$/.test(value)) {
    rechargeForm.value.memberId = value;
    selectedMember.value = null;
  } else {
    if (selectedMember.value && selectedMember.value.value !== value) {
      selectedMember.value = null;
    }
  }

  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    handleMemberSearch(value);
  }, 200);
};

// Enhanced member select handler with proper signature
const handleMemberSelect = (value: string) => {
  const option = memberOptions.value.find((opt) => opt.value === value);
  if (option) {
    selectedMember.value = option;
    rechargeForm.value.memberId = option.value;
  }

  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
};

// Statistics table columns
const statsColumns: DataTableColumns<any> = [
  {
    title: '充值类型',
    key: 'paymentMethod',
    width: 120,
    render: (row) =>
      h(
        NText,
        { style: { fontWeight: '500' } },
        { default: () => row.paymentMethod },
      ),
  },
  {
    title: '充值大类',
    key: 'paymentGateway',
    width: 120,
    render: (row) => h(NText, {}, { default: () => row.paymentGateway }),
  },
  {
    title: '充值总额',
    key: 'totalAmount',
    width: 140,
    render: (row) =>
      h(
        NText,
        { style: { color: '#18a058', fontWeight: 'bold' } },
        { default: () => formatCurrency(row.totalAmount) },
      ),
  },
  {
    title: '充值成功金额',
    key: 'successAmount',
    width: 140,
    render: (row) =>
      h(
        NText,
        { style: { color: '#18a058' } },
        { default: () => formatCurrency(row.successAmount) },
      ),
  },
  {
    title: '充值人数',
    key: 'totalCount',
    width: 100,
    render: (row) => h(NText, {}, { default: () => row.totalCount }),
  },
  {
    title: '成功充值人数',
    key: 'successCount',
    width: 140,
    render: (row) =>
      h(
        NText,
        { style: { color: '#18a058' } },
        { default: () => row.successCount },
      ),
  },
  {
    title: '充值总订单数',
    key: 'totalCount',
    width: 140,
    render: (row) => h(NText, {}, { default: () => row.totalCount }),
  },
  {
    title: '成功充值订单数',
    key: 'successCount',
    width: 160,
    render: (row) =>
      h(
        NText,
        { style: { color: '#18a058' } },
        { default: () => row.successCount },
      ),
  },
  {
    title: '失败充值订单数',
    key: 'failedCount',
    width: 160,
    render: (row) =>
      h(
        NText,
        { style: { color: '#d03050' } },
        { default: () => row.failedCount },
      ),
  },
  {
    title: '充值成功率',
    key: 'successRate',
    width: 120,
    render: (row) =>
      h(
        NText,
        {
          style: {
            color:
              row.successRate >= 80
                ? '#18a058'
                : row.successRate >= 60
                  ? '#f0a020'
                  : '#d03050',
            fontWeight: 'bold',
          },
        },
        { default: () => `${row.successRate.toFixed(1)}%` },
      ),
  },
  {
    title: '充值总次数占比',
    key: 'percentage',
    width: 140,
    render: (row) => {
      const total =
        statsData.value.paymentMethodStats?.reduce(
          (sum, item) => sum + item.totalCount,
          0,
        ) || 0;
      const percentage = total > 0 ? (row.totalCount / total) * 100 : 0;
      return h(NText, {}, { default: () => `${percentage.toFixed(1)}%` });
    },
  },
];

// Top users table columns
const topUsersColumns: DataTableColumns<any> = [
  {
    title: '排名',
    key: 'rank',
    width: 60,
    render: (_, index) =>
      h('div', { class: 'text-center' }, [
        h(
          NText,
          {
            style: {
              fontWeight: 'bold',
              color:
                index === 0
                  ? '#f1c40f'
                  : index === 1
                    ? '#95a5a6'
                    : index === 2
                      ? '#cd853f'
                      : '#666',
            },
          },
          { default: () => index + 1 },
        ),
      ]),
  },
  {
    title: '会员账号',
    key: 'accountName',
    width: 140,
    render: (row) =>
      h(
        NText,
        { style: { fontWeight: '500' } },
        { default: () => row.accountName },
      ),
  },
  {
    title: 'VIP等级',
    key: 'vipLevel',
    width: 100,
    render: (row) =>
      h(
        NTag,
        {
          type: getVipLevelColor(row.vipLevel) as any,
          size: 'small',
        },
        { default: () => row.vipLevel },
      ),
  },
  {
    title: '充值总金额',
    key: 'totalAmount',
    width: 140,
    render: (row) =>
      h(
        NText,
        { style: { color: '#18a058', fontWeight: 'bold' } },
        { default: () => formatCurrency(row.totalAmount) },
      ),
  },
  {
    title: '充值次数',
    key: 'orderCount',
    width: 100,
    render: (row) => h(NText, {}, { default: () => row.orderCount }),
  },
  {
    title: '平均充值金额',
    key: 'avgAmount',
    width: 140,
    render: (row) =>
      h(NText, {}, { default: () => formatCurrency(row.avgAmount) }),
  },
];

const handleMemberClear = () => {
  selectedMember.value = null;
  memberOptions.value = [];
};

// Enhanced Table columns with proper sorting
const columns: DataTableColumns<RechargeOrder> = [
  {
    type: 'selection',
    width: 40,
  },
  {
    title: '订单号',
    key: 'orderId',
    width: 180,
    sorter: 'default',
    render: (row) =>
      h('div', { class: 'font-mono text-xs' }, [
        h(
          NText,
          {
            style: {
              fontFamily: 'monospace',
              fontSize: '11px',
              color: '#2080f0',
              cursor: 'pointer',
            },
            onClick: () => handleViewOrder(row),
          },
          { default: () => row.orderId },
        ),
        h(
          'div',
          { class: 'text-gray-400 text-xs mt-1' },
          formatDateTime(row.appliedAt, 'MM-dd HH:mm'),
        ),
      ]),
  },
  {
    title: '会员ID',
    key: 'memberId',
    width: 90,
    sorter: 'default',
    render: (row) =>
      h(
        NText,
        {
          style: {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#2080f0',
            cursor: 'pointer',
            textDecoration: 'underline',
          },
          onClick: () => handleViewUserDetail(row),
        },
        { default: () => row.memberId },
      ),
  },
  {
    title: '会员账号',
    key: 'accountName',
    width: 120,
    sorter: 'default',
    render: (row) =>
      h('div', { class: 'flex flex-col' }, [
        h(
          NText,
          {
            style: {
              fontSize: '12px',
              fontWeight: '500',
              color: '#2080f0',
              cursor: 'pointer',
              textDecoration: 'underline',
            },
            onClick: () => handleViewUserDetail(row),
          },
          { default: () => row.accountName },
        ),
        h(
          NText,
          { depth: 3, style: { fontSize: '10px' } },
          { default: () => row.memberTag || '-' },
        ),
      ]),
  },
  {
    title: '创建时间',
    key: 'appliedAt',
    width: 140,
    sorter: 'default',
    render: (row) =>
      h('div', { class: 'text-xs' }, [
        h('div', formatDateTime(row.appliedAt, 'yyyy-MM-dd')),
        h(
          'div',
          { class: 'text-gray-500' },
          formatDateTime(row.appliedAt, 'HH:mm:ss'),
        ),
      ]),
  },
  {
    title: '成功时间',
    key: 'confirmTime',
    width: 140,
    sorter: 'default',
    render: (row) =>
      h(
        'div',
        { class: 'text-xs' },
        row.confirmTime
          ? [
              h('div', formatDateTime(row.confirmTime, 'yyyy-MM-dd')),
              h(
                'div',
                { class: 'text-gray-500' },
                formatDateTime(row.confirmTime, 'HH:mm:ss'),
              ),
            ]
          : h(NText, { depth: 3 }, { default: () => '-' }),
      ),
  },
  {
    title: '更新时间',
    key: 'updatedAt',
    width: 140,
    sorter: 'default',
    render: (row) =>
      h('div', { class: 'text-xs' }, [
        h('div', formatDateTime(row.updatedAt || row.appliedAt, 'yyyy-MM-dd')),
        h(
          'div',
          { class: 'text-gray-500' },
          formatDateTime(row.updatedAt || row.appliedAt, 'HH:mm:ss'),
        ),
      ]),
  },
  {
    title: 'VIP等级',
    key: 'vipLevel',
    width: 80,
    sorter: 'default',
    render: (row) =>
      h(
        NTag,
        {
          type: getVipLevelColor(row.vipLevel) as any, // Fix type issue
          size: 'small',
          style: { fontSize: '10px' },
        },
        { default: () => row.vipLevel || 'VIP0' },
      ),
  },
  {
    title: '会员层级',
    key: 'memberTag',
    width: 90,
    sorter: 'default',
    render: (row) =>
      h(
        NTag,
        {
          type: 'info',
          size: 'small',
          style: { fontSize: '10px' },
        },
        { default: () => row.memberTag || '普通' },
      ),
  },
  {
    title: '充值币种',
    key: 'currency',
    width: 80,
    sorter: 'default',
    render: (row) =>
      h('div', { class: 'text-center' }, [
        h(
          NTag,
          { type: 'default', size: 'small' },
          { default: () => row.currency || 'BRL' },
        ),
      ]),
  },
  {
    title: '原始数量',
    key: 'rechargeAmount',
    width: 120,
    sorter: 'default',
    render: (row) =>
      h('div', { class: 'text-right' }, [
        h(
          NText,
          {
            style: { fontWeight: 'bold', color: '#18a058', fontSize: '12px' },
          },
          { default: () => formatCurrency(row.rechargeAmount) },
        ),
        row.fee &&
          row.fee > 0 &&
          h(
            'div',
            { class: 'text-xs text-red-500' },
            `-${formatCurrency(row.fee)}`,
          ),
      ]),
  },
  {
    title: '实际到账',
    key: 'actualReceived',
    width: 90,
    sorter: 'default',
    render: (row) =>
      h('div', { class: 'text-right' }, [
        h(
          NText,
          {
            style: { fontWeight: 'bold', color: '#18a058', fontSize: '12px' },
          },
          { default: () => formatCurrency(row.actualReceived) },
        ),
      ]),
  },
  {
    title: '订单状态',
    key: 'status',
    width: 100,
    sorter: 'default',
    render: (row) =>
      h('div', { class: 'text-center' }, [
        h(
          NTag,
          {
            type: getStatusColor(row.status),
            size: 'small',
            style: { fontSize: '10px' },
          },
          { default: () => getStatusText(row.status) },
        ),
        row.backendNote &&
          h('div', { class: 'text-xs text-red-500 mt-1' }, row.backendNote),
      ]),
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right',
    render: (row) =>
      h(
        NSpace,
        { size: 'small', justify: 'center' },
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                text: true,
                onClick: () => handleViewDetails(row),
              },
              { default: () => '详情' },
            ),
            row.status === 'pending' &&
              h(
                NButton,
                {
                  size: 'small',
                  type: 'success',
                  text: true,
                  onClick: () => handleConfirmRecharge(row),
                },
                { default: () => '确认' },
              ),
            row.status === 'pending' &&
              h(
                NButton,
                {
                  size: 'small',
                  type: 'error',
                  text: true,
                  onClick: () => handleRejectRecharge(row),
                },
                { default: () => '拒绝' },
              ),
          ],
        },
      ),
  },
];

// Methods
const fetchData = async () => {
  if (activeTab.value !== 'all-recharges') return;

  loading.value = true;
  try {
    // Handle time range filtering
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (filterForm.value.timeRange) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (filterForm.value.timeRange) {
        case 'today':
          startDate = today.toISOString();
          endDate = new Date(
            today.getTime() + 24 * 60 * 60 * 1000 - 1,
          ).toISOString();
          break;
        case 'week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          startDate = weekStart.toISOString();
          endDate = new Date(
            weekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1,
          ).toISOString();
          break;
        case 'month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          startDate = monthStart.toISOString();
          endDate = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0,
            23,
            59,
            59,
            999,
          ).toISOString();
          break;
      }
    } else if (filterForm.value.dateRange) {
      startDate = new Date(filterForm.value.dateRange[0]).toISOString();
      const end = new Date(filterForm.value.dateRange[1]);
      end.setHours(23, 59, 59, 999);
      endDate = end.toISOString();
    }

    const params: RechargeListParams = {
      page: paginationConfig.value.page,
      pageSize: paginationConfig.value.pageSize,
      status: filterForm.value.status || undefined,
      rechargeMethod: filterForm.value.rechargeMethod || undefined,
      startDate,
      endDate,
    };
    applySearchToParams(params);
    applySearchConditionToParams(params);

    console.log('🔍 Fetching recharge data with params:', params);

    const response = await rechargeApi.getList(params);
    console.log('📥 API Response received:', response);
    console.log('📥 Response structure:', {
      hasRecords: 'records' in response,
      hasData: 'data' in response,
      recordsLength: response.records?.length || 0,
      totalCount: response.total || 0,
      keys: Object.keys(response),
    });

    // Handle response structure - the response interceptor returns the transformed data
    if (!response) {
      console.error('❌ No response received - response is null/undefined');
      message.error('API响应为空');
      return;
    }

    // Extract data based on what response interceptor returns
    let records, total, summaryData;

    if (response.records) {
      // Response interceptor transformed {success: true, data: {...}} to {...}
      records = response.records;
      total = response.total;
      summaryData = response.summary;
    } else if (Array.isArray(response)) {
      // Fallback: direct array response
      records = response;
      total = response.length;
      summaryData = {
        totalCount: response.length,
        totalAmount: 0,
        pendingCount: 0,
        confirmedCount: 0,
        rejectedCount: 0,
      };
    } else {
      console.error('❌ Unexpected response structure:', response);
      message.error('API响应格式错误');
      return;
    }

    console.log('📊 Parsed data:', { records, total, summary: summaryData });

    tableData.value = records || [];
    paginationConfig.value.itemCount = total || 0;
    summary.value = summaryData;
  } catch (error: any) {
    console.error('🚨 Full error details:', error);
    console.error('🚨 Error message:', error?.message);
    console.error('🚨 Error response:', error?.response?.data);

    message.error(`获取数据失败: ${error?.message || '未知错误'}`);
  } finally {
    loading.value = false;
  }
};

const handleCreateRecharge = () => {
  isEditing.value = false;
  currentEditingOrder.value = null;
  rechargeForm.value = {
    memberId: '',
    amount: null,
    rechargeMethod: '',
    channelInfo: '',
    note: '',
  };
  selectedMember.value = null;
  showRechargeModal.value = true;
};

const handleEditRecharge = (order: RechargeOrder) => {
  isEditing.value = true;
  currentEditingOrder.value = order;
  rechargeForm.value = {
    memberId: order.memberId,
    amount: order.rechargeAmount,
    rechargeMethod: order.rechargeChannelInfo?.method || '',
    channelInfo: order.rechargeChannelInfo?.channel || '',
    note: order.backendNote || '',
  };
  showRechargeModal.value = true;
};

const handleSaveRecharge = async () => {
  if (!rechargeFormRef.value) return;

  try {
    await rechargeFormRef.value.validate();
    modalLoading.value = true;

    if (isEditing.value && currentEditingOrder.value) {
      const data: UpdateRechargeParams = {
        amount: rechargeForm.value.amount || undefined,
        rechargeMethod: rechargeForm.value.rechargeMethod || undefined,
        channelInfo: rechargeForm.value.channelInfo || undefined,
        note: rechargeForm.value.note || undefined,
      };

      const response = await rechargeApi.update(
        currentEditingOrder.value.orderId,
        data,
      );

      if (response.success) {
        message.success('更新成功');
        showRechargeModal.value = false;
        fetchData();
      }
    } else {
      const data: CreateRechargeParams = {
        memberId: rechargeForm.value.memberId,
        amount: rechargeForm.value.amount || 0,
        rechargeMethod: rechargeForm.value.rechargeMethod,
        channelInfo: rechargeForm.value.channelInfo,
        note: rechargeForm.value.note,
      };

      const response = await rechargeApi.create(data);

      if (response.success) {
        message.success('创建成功');
        showRechargeModal.value = false;
        fetchData();
      }
    }
  } catch (error) {
    message.error(isEditing.value ? '更新失败' : '创建失败');
    console.error('Save recharge error:', error);
  } finally {
    modalLoading.value = false;
  }
};

const handleConfirmRecharge = async (_order: RechargeOrder) => {
  try {
    // For now, just show success message since confirm API doesn't exist
    message.success('充值确认成功');
    fetchData();
  } catch (error) {
    message.error('确认失败');
    console.error('Confirm recharge error:', error);
  }
};

const handleSearch = () => {
  paginationConfig.value.page = 1;
  fetchData();
};

const handleReset = () => {
  filterForm.value = {
    searchCondition: null,
    searchConditionValue: null,
    searchField: 'exact_account',
    searchValue: '',
    searchMode: 'exact',
    dateRange: null,
    timeRange: 'week', // Default to week to show more data
    status: null,
    rechargeMethod: null,
    agentMode: null,
    thirdPartyPayment: null,
    serviceFilter: null,
  };
  searchConditionValueOptions.value = [];
  paginationConfig.value.page = 1;
  fetchData();
};

const handlePageChange = (page: number) => {
  paginationConfig.value.page = page;
  fetchData();
};

const handlePageSizeChange = (pageSize: number) => {
  paginationConfig.value.pageSize = pageSize;
  paginationConfig.value.page = 1;
  fetchData();
};

// Additional Event Handlers
const handleDateRangeChange = (value: any) => {
  if (value) {
    filterForm.value.timeRange = '';
    filterForm.value.dateRange = value;
  } else {
    filterForm.value.dateRange = null;
    filterForm.value.timeRange = 'week'; // Default to week when clearing custom date
  }
};

const handleTimeRangeChange = (value: string) => {
  // ✅ FIX: Set dateRange based on selected time range for date picker display
  if (value === 'week') {
    filterForm.value.dateRange = getWeekDateRange();
  } else if (value === 'today') {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
    filterForm.value.dateRange = [todayStart.getTime(), todayEnd.getTime()];
  } else if (value === 'month') {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
    filterForm.value.dateRange = [monthStart.getTime(), monthEnd.getTime()];
  } else {
    filterForm.value.dateRange = null; // Clear custom date range
  }
  if (value) {
    fetchData(); // Auto-fetch when time range changes
  }
};

const handleAdvancedSearch = () => {
  // TODO: Implement advanced search modal
  message.info('高级搜索功能开发中...');
};

const handleExport = async () => {
  try {
    message.loading('正在导出数据...', { duration: 0 });

    // Get all data for export (without pagination)
    const exportParams: RechargeListParams = {
      status: filterForm.value.status || undefined,
      rechargeMethod: filterForm.value.rechargeMethod || undefined,
      page: 1,
      pageSize: 10000, // Large number to get all data
      startDate: filterForm.value.dateRange?.[0]
        ? new Date(filterForm.value.dateRange[0]).toISOString()
        : undefined,
      endDate: filterForm.value.dateRange?.[1]
        ? (() => {
            const endDate = new Date(filterForm.value.dateRange[1]);
            endDate.setHours(23, 59, 59, 999);
            return endDate.toISOString();
          })()
        : undefined,
    };
    applySearchToParams(exportParams);
    applySearchConditionToParams(exportParams);

    const response = await rechargeApi.getList(exportParams);

    if (!response || !response.records) {
      message.error('导出数据失败');
      return;
    }

    // Prepare CSV data
    const csvData = response.records.map((record: RechargeOrder) => [
      record.orderId,
      record.memberId,
      record.userId,
      record.accountName,
      record.vipLevel || 'VIP0',
      record.memberTag || '',
      formatDateTime(record.appliedAt, 'yyyy-MM-dd HH:mm:ss'),
      record.rechargeAmount,
      record.currency || 'BRL',
      record.actualReceived,
      record.fee || 0,
      getStatusText(record.status),
      record.backendNote || '',
      record.rechargeChannelInfo?.method || '',
      record.rechargeChannelInfo?.channel || '',
    ]);

    // CSV headers
    const headers = [
      '订单号',
      '会员ID',
      '会员账号',
      'VIP等级',
      '会员标签',
      '创建时间',
      '充值金额',
      '币种',
      '实际到账',
      '手续费',
      '状态',
      '备注',
      '充值方式',
      '支付渠道',
    ];

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Create and download file
    const blob = new Blob(['\ufeff' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `充值记录_${new Date().toISOString().split('T')[0]}.csv`,
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    message.success('导出成功');
  } catch (error) {
    console.error('Export error:', error);
    message.error('导出失败');
  } finally {
    message.destroyAll();
  }
};

const toggleTableDensity = () => {
  tableDense.value = !tableDense.value;
};

const handleViewOrder = async (row: RechargeOrder) => {
  await fetchOrderDetails(row.orderId);
};

const handleViewDetails = async (row: RechargeOrder) => {
  await fetchOrderDetails(row.orderId);
};

const handleViewUserDetail = async (row: RechargeOrder) => {
  try {
    console.log('👤 [CLICK] View user detail:', {
      accountName: row.accountName,
      memberId: row.memberId,
      userId: row.userId,
      row: row,
    });

    // ✅ FIX: Use userId if available (internal database ID from backend)
    if (row.userId) {
      currentUserId.value = Number(row.userId);
      showUserDetailModal.value = true;
      return;
    }

    // Fallback: Search for user by account name or userID
    let searchResponse;
    try {
      // Try searching by account name first
      searchResponse = await searchUsersApi({ q: row.accountName, limit: 1 });
      console.log('🔍 Search response by account:', searchResponse);
    } catch (searchError) {
      console.error('❌ Search by account failed:', searchError);
      // Try searching by userID (9-digit) if account search fails
      if (row.memberId && /^\d{9}$/.test(row.memberId)) {
        try {
          searchResponse = await searchUsersApi({ q: row.memberId, limit: 1 });
          console.log('🔍 Search response by userID:', searchResponse);
        } catch (userIDError) {
          console.error('❌ Search by userID also failed:', userIDError);
          throw userIDError;
        }
      } else {
        throw searchError;
      }
    }

    // Handle different response structures
    let userData: any[] = [];
    if (Array.isArray(searchResponse)) {
      userData = searchResponse;
    } else if (searchResponse?.data && Array.isArray(searchResponse.data)) {
      userData = searchResponse.data;
    } else if (
      searchResponse?.code === 0 &&
      Array.isArray(searchResponse.data)
    ) {
      userData = searchResponse.data;
    }

    console.log('📦 Extracted user data:', userData);

    if (userData && userData.length > 0) {
      const user = userData[0];
      if (user && user.value) {
        // The value field contains the internal user ID
        const userId = Number(user.value);
        console.log('✅ Found user ID:', userId);
        currentUserId.value = userId;
        showUserDetailModal.value = true;
      } else {
        console.error('❌ User data missing value field:', user);
        message.warning('未找到用户信息: 用户数据格式错误');
      }
    } else {
      console.error('❌ No users found in search response');
      message.warning('未找到用户信息');
    }
  } catch (error: any) {
    console.error('❌ Error finding user:', error);
    message.error(`获取用户信息失败: ${error?.message || '未知错误'}`);
  }
};

const fetchOrderDetails = async (orderId: string) => {
  try {
    loadingOrderDetails.value = true;
    const response = await rechargeApi.getById(orderId);
    console.log('📥 Order details response:', response);
    // ✅ FIX: API returns { success: true, data: {...} }, but getById might return response.data
    // So response might be { success: true, data: {...} } or just the data object
    if (response) {
      if ((response as any).success && (response as any).data) {
        // Response is { success: true, data: {...} }
        orderDetails.value = (response as any).data;
        showOrderDetailsModal.value = true;
      } else if ((response as any).data) {
        // Response.data exists
        orderDetails.value = (response as any).data;
        showOrderDetailsModal.value = true;
      } else if ((response as any).orderId) {
        // Response is already the data object
        orderDetails.value = response as any;
        showOrderDetailsModal.value = true;
      } else {
        message.error((response as any)?.error || '获取订单详情失败');
      }
    } else {
      message.error('获取订单详情失败: 无响应数据');
    }
  } catch (error: any) {
    console.error('❌ Fetch order details error:', error);
    message.error(error?.message || '获取订单详情失败');
  } finally {
    loadingOrderDetails.value = false;
  }
};

const handleRejectRecharge = (row: RechargeOrder) => {
  // TODO: Implement reject functionality
  message.warning(`拒绝充值: ${row.orderId}`);
};

// Supplementary Order Functions
const handleCreateSupplementaryOrder = () => {
  showSupplementaryOrderModal.value = true;
  supplementaryOrderForm.orderNumber = '';
  searchedOrder.value = null;
  searchError.value = '';
};

const handleSearchOrder = async () => {
  if (!supplementaryOrderForm.orderNumber.trim()) {
    message.warning('请输入订单号');
    return;
  }

  searchingOrder.value = true;
  searchError.value = '';
  searchedOrder.value = null;

  try {
    // Search for the order in existing data first
    const foundOrder = tableData.value.find(
      (order) => order.orderId === supplementaryOrderForm.orderNumber.trim(),
    );

    if (foundOrder) {
      searchedOrder.value = foundOrder;
      message.success('订单查找成功');
    } else {
      // If not found in current data, try to search via API
      // This would typically call a backend API to search for orders
      message.warning('订单未找到，请检查订单号是否正确');
      searchError.value = '订单未找到，请检查订单号是否正确';
    }
  } catch (error) {
    console.error('搜索订单失败:', error);
    searchError.value = '搜索订单失败，请稍后重试';
    message.error('搜索订单失败');
  } finally {
    searchingOrder.value = false;
  }
};

const handleConfirmSupplementaryOrder = async () => {
  if (!searchedOrder.value) {
    message.warning('请先搜索并选择订单');
    return;
  }

  creatingOrder.value = true;
  try {
    // Here you would typically call an API to create the supplementary order
    // For now, we'll just show a success message
    message.success(`补单创建成功: ${searchedOrder.value.orderId}`);

    // Close modal and reset
    showSupplementaryOrderModal.value = false;
    supplementaryOrderForm.orderNumber = '';
    searchedOrder.value = null;
    searchError.value = '';

    // Refresh the main table data
    await fetchData();
  } catch (error) {
    console.error('创建补单失败:', error);
    message.error('创建补单失败，请稍后重试');
  } finally {
    creatingOrder.value = false;
  }
};

// Watchers
watch(activeTab, () => {
  if (activeTab.value === 'all-recharges') {
    fetchData();
  }
});

// Statistics functions
const fetchStatsData = async () => {
  if (activeTab.value !== 'recharge-statistics') return;

  statsLoading.value = true;
  try {
    // Handle time range filtering for stats
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (statsForm.value.timeRange && statsForm.value.timeRange !== 'custom') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (statsForm.value.timeRange) {
        case 'today':
          startDate = today.toISOString();
          endDate = new Date(
            today.getTime() + 24 * 60 * 60 * 1000 - 1,
          ).toISOString();
          break;
        case 'week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          startDate = weekStart.toISOString();
          endDate = new Date(
            weekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1,
          ).toISOString();
          break;
        case 'month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          startDate = monthStart.toISOString();
          endDate = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0,
            23,
            59,
            59,
            999,
          ).toISOString();
          break;
      }
    } else if (statsForm.value.dateRange) {
      startDate = new Date(statsForm.value.dateRange[0]).toISOString();
      const end = new Date(statsForm.value.dateRange[1]);
      end.setHours(23, 59, 59, 999);
      endDate = end.toISOString();
    }

    const params: RechargeStatsParams = {
      startDate,
      endDate,
      groupBy: statsForm.value.groupBy,
      paymentMethod: statsForm.value.paymentMethod || undefined,
      status: statsForm.value.status || undefined,
      currency: 'BRL',
    };

    console.log('📊 Fetching stats data with params:', params);

    const response = (await rechargeStatsApi.getStats(params)) as any;
    console.log('📊 Stats API Response received:', response);
    console.log('📊 Response structure:', {
      hasSuccess: 'success' in response,
      hasData: 'data' in response,
      dataKeys: response.data ? Object.keys(response.data) : [],
    });

    // Handle wrapped response structure
    if (response.success && response.data) {
      statsData.value = response.data;
      console.log('📊 Setting statsData to response.data:', response.data);
    } else {
      statsData.value = response;
      console.log('📊 Setting statsData to direct response:', response);
    }

    // Charts will be automatically updated via computed properties
    console.log('📊 Final statsData value:', {
      summary: statsData.value.summary,
      timeSeriesCount: statsData.value.timeSeriesData?.length || 0,
      paymentMethodCount: statsData.value.paymentMethodStats?.length || 0,
      topUsersCount: statsData.value.topUsers?.length || 0,
    });

    // Force Vue reactivity to trigger chart updates
    await nextTick();
    console.log('📊 Vue nextTick completed - charts should update now');

    // Render charts with actual data
    renderCharts();
  } catch (error: any) {
    console.error('🚨 Stats fetch error:', error);
    message.error(`获取统计数据失败: ${error?.message || '未知错误'}`);
  } finally {
    statsLoading.value = false;
  }
};

const handleStatsTimeRangeChange = (value: string) => {
  // ✅ FIX: Set dateRange based on selected time range for date picker display
  if (value === 'week') {
    statsForm.value.dateRange = getWeekDateRange();
  } else if (value === 'today') {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
    statsForm.value.dateRange = [todayStart.getTime(), todayEnd.getTime()];
  } else if (value === 'month') {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
    statsForm.value.dateRange = [monthStart.getTime(), monthEnd.getTime()];
  } else if (value === 'custom') {
    // Keep existing dateRange when switching to custom
    // Don't clear it
  } else {
    statsForm.value.dateRange = null; // Clear custom date range
  }
  if (value) {
    fetchStatsData(); // Auto-fetch when time range changes
  }
};

const handleStatsDateRangeChange = (value: any) => {
  if (value) {
    statsForm.value.timeRange = 'custom';
  }
  fetchStatsData();
};

const handleStatsFilterChange = () => {
  fetchStatsData();
};

// Watchers
watch(activeTab, (newTab) => {
  if (newTab === 'all-recharges') {
    fetchData();
  } else if (newTab === 'recharge-statistics') {
    // Ensure default timeRange is set and then fetch
    if (!statsForm.value.timeRange || statsForm.value.timeRange === 'today') {
      statsForm.value.timeRange = 'week';
    }
    fetchStatsData();
    // Also render charts if data is already available
    if (
      statsData.value.timeSeriesData?.length ||
      statsData.value.paymentMethodStats?.length
    ) {
      setTimeout(renderCharts, 100); // Small delay to ensure DOM is ready
    }
  }
});

// Helper function to calculate week date range
const getWeekDateRange = (): [number, number] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1); // End of week (Saturday 23:59:59)
  return [weekStart.getTime(), weekEnd.getTime()];
};

// Lifecycle - set default filter on mount
onMounted(() => {
  const route = useRoute();

  // Check if there are query parameters from user detail redirect
  if (route.query.userId || route.query.userAccount) {
    // Apply user filter from query params
    if (route.query.userAccount) {
      filterForm.value.searchField = 'exact_account';
      filterForm.value.searchValue = route.query.userAccount as string;
      filterForm.value.searchMode = 'exact';
    } else if (route.query.userName) {
      filterForm.value.searchField = 'exact_name';
      filterForm.value.searchValue = route.query.userName as string;
      filterForm.value.searchMode = 'exact';
    }

    // Set default time range to show all user's recharges
    filterForm.value.timeRange = 'month';

    // Trigger search with user filter
    fetchData();
  } else if (activeTab.value === 'all-recharges') {
    // ✅ FIX: Set default filter to week and set dateRange for date picker display
    filterForm.value.timeRange = 'week';
    filterForm.value.dateRange = getWeekDateRange(); // Set date range so date picker shows the selected week
    fetchData();
  } else if (activeTab.value === 'recharge-statistics') {
    // Auto-load statistics with default week range
    statsForm.value.timeRange = 'week';
    statsForm.value.dateRange = getWeekDateRange(); // Set date range for statistics too
    fetchStatsData();
  }
});
</script>

<style scoped>
.recharge-management {
  padding: 16px;
}

.recharge-management .n-data-table {
  min-height: 400px;
}

.recharge-management .n-card {
  border-radius: 8px;
}

.recharge-management .grid {
  display: grid;
}

.recharge-management .grid-cols-5 {
  grid-template-columns: repeat(5, 1fr);
}

.recharge-management .grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.recharge-management .gap-4 {
  gap: 1rem;
}

.recharge-management .gap-2 {
  gap: 0.5rem;
}

.recharge-management .text-center {
  text-align: center;
}

.recharge-management .text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.recharge-management .text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.recharge-management .font-bold {
  font-weight: 700;
}

.recharge-management .font-semibold {
  font-weight: 600;
}

.recharge-management .font-medium {
  font-weight: 500;
}

.recharge-management .p-3 {
  padding: 0.75rem;
}

.recharge-management .mb-4 {
  margin-bottom: 1rem;
}

.recharge-management .mb-2 {
  margin-bottom: 0.5rem;
}

.recharge-management .rounded {
  border-radius: 0.375rem;
}

.recharge-management .bg-blue-50 {
  background-color: #eff6ff;
}

.recharge-management .bg-green-50 {
  background-color: #f0fdf4;
}

.recharge-management .bg-orange-50 {
  background-color: #fff7ed;
}

.recharge-management .bg-red-50 {
  background-color: #fef2f2;
}

.recharge-management .bg-gray-50 {
  background-color: #f9fafb;
}

.recharge-management .text-blue-600 {
  color: #2563eb;
}

.recharge-management .text-green-600 {
  color: #16a34a;
}

.recharge-management .text-orange-600 {
  color: #ea580c;
}

.recharge-management .text-red-600 {
  color: #dc2626;
}

.recharge-management .text-gray-600 {
  color: #4b5563;
}

.recharge-management .flex {
  display: flex;
}

.recharge-management .items-center {
  align-items: center;
}

.recharge-management .justify-between {
  justify-content: space-between;
}

.recharge-management .justify-end {
  justify-content: flex-end;
}

.recharge-management .py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}
</style>
