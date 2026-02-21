<template>
  <n-modal
    :show="visible"
    @update:show="(value: boolean) => $emit('update:visible', value)"
    preset="card"
    title="提现设置"
    :style="{
      width: 'min(95vw, 1200px)',
      maxHeight: '85vh',
      margin: '0 auto',
    }"
    :closable="true"
    :mask-closable="false"
    :show-icon="false"
    transform-origin="center"
  >
    <div class="withdrawal-settings-container">
      <!-- Header with Save/Cancel Actions -->
      <div class="settings-header">
        <div
          class="mb-4 flex items-center justify-between rounded-lg bg-gray-50 p-3"
        >
          <div>
            <h3 class="text-base font-semibold text-gray-800">提现系统配置</h3>
            <p class="mt-1 text-xs text-gray-600">
              配置提现流程、限额规则和用户体验设置
            </p>
          </div>
          <div class="flex gap-2">
            <n-button @click="handleCancel" size="small">
              <template #icon>
                <n-icon><CloseOutline /></n-icon>
              </template>
              取消
            </n-button>
            <n-button
              type="primary"
              @click="handleSave"
              :loading="saving"
              size="small"
            >
              <template #icon>
                <n-icon><SaveOutline /></n-icon>
              </template>
              保存设置
            </n-button>
          </div>
        </div>
      </div>

      <!-- Enhanced Tabs with Icons -->
      <n-tabs
        v-model:value="activeTab"
        type="line"
        size="large"
        class="enhanced-tabs"
      >
        <!-- 用户界面 Tab -->
        <n-tab-pane name="interface" tab="用户界面">
          <template #tab>
            <div class="flex items-center gap-2">
              <n-icon><PersonOutline /></n-icon>
              <span>用户界面</span>
            </div>
          </template>

          <div class="tab-content">
            <n-form
              ref="interfaceFormRef"
              :model="formData"
              label-placement="left"
              label-width="220px"
              class="enhanced-form"
            >
              <!-- Basic System Settings -->
              <div class="form-section">
                <h4 class="section-title">基础系统设置</h4>

                <!-- Maintenance Window -->
                <n-form-item label="系统维护时间窗口" path="maintenanceWindow">
                  <div class="flex items-center gap-4">
                    <n-input
                      v-model:value="formData.maintenanceWindow"
                      placeholder="例: 02:00-04:00"
                      style="width: 200px"
                      size="medium"
                    />
                    <n-text depth="3"
                      >维护时间格式: HH:MM-HH:MM (24小时制)</n-text
                    >
                  </div>
                  <template #feedback>
                    <n-text depth="3" style="font-size: 12px">
                      在维护时间内，提现功能将暂停服务。留空表示无维护时间。
                    </n-text>
                  </template>
                </n-form-item>

                <!-- Daily Limit -->
                <n-form-item label="每日提现限额" path="dailyLimit">
                  <div class="flex items-center gap-4">
                    <n-input-number
                      v-model:value="formData.dailyLimit"
                      :min="0"
                      :max="10000000"
                      style="width: 200px"
                      size="medium"
                      :precision="2"
                      :show-button="false"
                    />
                    <n-text depth="3">BRL (巴西雷亚尔)</n-text>
                  </div>
                </n-form-item>

                <!-- Min/Max Amount -->
                <n-form-item label="单笔提现金额范围" path="amountRange">
                  <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2">
                      <n-text depth="3">最小:</n-text>
                      <n-input-number
                        v-model:value="formData.minAmount"
                        :min="0"
                        :max="formData.maxAmount || 1000000"
                        style="width: 120px"
                        size="medium"
                        :precision="2"
                        :show-button="false"
                      />
                    </div>
                    <div class="flex items-center gap-2">
                      <n-text depth="3">最大:</n-text>
                      <n-input-number
                        v-model:value="formData.maxAmount"
                        :min="formData.minAmount || 0"
                        :max="10000000"
                        style="width: 120px"
                        size="medium"
                        :precision="2"
                        :show-button="false"
                      />
                    </div>
                    <n-text depth="3">BRL</n-text>
                  </div>
                </n-form-item>

                <!-- Processing Time -->
                <n-form-item label="预计处理时间" path="processingTime">
                  <div class="flex items-center gap-4">
                    <n-input
                      v-model:value="formData.processingTime"
                      placeholder="例: 1-3个工作日"
                      style="width: 200px"
                      size="medium"
                    />
                    <n-text depth="3">向用户显示的预计处理时间</n-text>
                  </div>
                </n-form-item>
              </div>

              <!-- 前台设置任务显示开关 -->
              <div class="form-section">
                <h4 class="section-title">前台显示设置</h4>
                <n-form-item
                  label="前台设置任务显示开关"
                  path="frontendTaskDisplayEnabled"
                >
                  <n-radio-group
                    v-model:value="formData.frontendTaskDisplayEnabled"
                  >
                    <n-space direction="vertical" size="medium">
                      <n-radio :value="true">
                        <div class="radio-content">
                          <div class="radio-title">公开显示设置/提现任务</div>
                          <div class="radio-desc">
                            用户可以看到提现相关的设置和任务 (可能影响留存)
                          </div>
                        </div>
                      </n-radio>
                      <n-radio :value="false">
                        <div class="radio-content">
                          <div class="radio-title">隐藏前台设置任务</div>
                          <div class="radio-desc">
                            隐藏提现设置，简化用户界面
                          </div>
                        </div>
                      </n-radio>
                    </n-space>
                  </n-radio-group>
                </n-form-item>
              </div>
            </n-form>
          </div>
        </n-tab-pane>

        <!-- 安全验证 Tab -->
        <n-tab-pane name="security" tab="安全验证">
          <template #tab>
            <div class="flex items-center gap-2">
              <n-icon><ShieldCheckmarkOutline /></n-icon>
              <span>安全验证</span>
            </div>
          </template>

          <div class="tab-content">
            <n-form
              ref="securityFormRef"
              :model="formData"
              label-placement="left"
              label-width="220px"
              class="enhanced-form"
            >
              <!-- 提现CPF规则校验 -->
              <div class="form-section">
                <h4 class="section-title">身份验证设置</h4>
                <n-form-item label="提现CPF规则校验" path="cpfValidationMode">
                  <n-radio-group v-model:value="formData.cpfValidationMode">
                    <n-space direction="vertical" size="medium">
                      <n-radio value="disabled">
                        <div class="radio-content">
                          <div class="radio-title">关闭验证</div>
                          <div class="radio-desc text-red-500">
                            ⚠️ 不推荐：可能导致无效提现申请
                          </div>
                        </div>
                      </n-radio>
                      <n-radio value="format_only">
                        <div class="radio-content">
                          <div class="radio-title">只验证CPF格式</div>
                          <div class="radio-desc text-green-600">
                            ✅ 推荐：防止乱填无法出款
                          </div>
                        </div>
                      </n-radio>
                      <n-radio value="third_party">
                        <div class="radio-content">
                          <div class="radio-title">
                            第三方付费验证CPF和姓名真实性
                          </div>
                          <div class="radio-desc text-blue-600">
                            🛡️ 合规：最高安全级别
                          </div>
                        </div>
                      </n-radio>
                    </n-space>
                  </n-radio-group>
                </n-form-item>
              </div>

              <!-- 会员可同时进行提现数 -->
              <div class="form-section">
                <h4 class="section-title">并发控制</h4>
                <n-form-item
                  label="会员可同时进行提现数"
                  path="memberConcurrentWithdrawals"
                >
                  <div class="flex items-center gap-4">
                    <n-input-number
                      v-model:value="formData.memberConcurrentWithdrawals"
                      :min="1"
                      :max="10"
                      style="width: 120px"
                      size="medium"
                    />
                    <n-text depth="3"
                      >笔 (建议设置为1-3笔，避免资金风险)</n-text
                    >
                  </div>
                </n-form-item>
              </div>
            </n-form>
          </div>
        </n-tab-pane>

        <!-- 流程排序 Tab -->
        <n-tab-pane name="workflow" tab="流程排序">
          <template #tab>
            <div class="flex items-center gap-2">
              <n-icon><SwapHorizontalOutline /></n-icon>
              <span>流程排序</span>
            </div>
          </template>

          <div class="tab-content">
            <n-form
              ref="workflowFormRef"
              :model="formData"
              label-placement="left"
              label-width="220px"
              class="enhanced-form"
            >
              <!-- 提现页面排序 - Enhanced with Drag & Drop -->
              <div class="form-section">
                <h4 class="section-title">提现流程排序 (SOP)</h4>
                <n-form-item label="提现页签排序" path="withdrawalTabOrder">
                  <div class="tab-ordering-container">
                    <div class="ordering-header">
                      <n-alert type="info" :show-icon="false" class="mb-4">
                        <template #header>
                          <div class="flex items-center gap-2">
                            <n-icon><InformationCircleOutline /></n-icon>
                            <span>重要说明</span>
                          </div>
                        </template>
                        此排序决定用户提现时的页签显示顺序，影响用户的提现选择流程。请根据业务优先级进行排序。
                      </n-alert>
                    </div>

                    <div class="draggable-list">
                      <div class="tab-list">
                        <div
                          v-for="(
                            element, index
                          ) in formData.withdrawalTabOrder"
                          :key="element.id"
                          class="tab-item"
                          :class="{ dragging: isDragging }"
                          draggable="true"
                          @dragstart="onDragStart($event, index)"
                          @dragover="onDragOver($event)"
                          @drop="onDrop($event, index)"
                          @dragend="onDragEnd"
                        >
                          <div class="tab-item-content">
                            <div class="drag-handle">
                              <n-icon size="16"><MenuOutline /></n-icon>
                            </div>
                            <div class="tab-info">
                              <div class="tab-order-number">
                                {{ index + 1 }}
                              </div>
                              <div class="tab-details">
                                <div class="tab-name">{{ element.name }}</div>
                                <div class="tab-description">
                                  {{ element.description }}
                                </div>
                              </div>
                            </div>
                            <div class="tab-status">
                              <n-tag
                                :type="element.enabled ? 'success' : 'default'"
                                size="small"
                              >
                                {{ element.enabled ? '启用' : '禁用' }}
                              </n-tag>
                            </div>
                            <div class="tab-actions">
                              <n-button
                                text
                                @click="toggleTabStatus(element)"
                                size="small"
                              >
                                {{ element.enabled ? '禁用' : '启用' }}
                              </n-button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="ordering-footer mt-4">
                      <n-text depth="3" class="flex items-center gap-2">
                        <n-icon><HandLeftOutline /></n-icon>
                        拖拽上方项目可重新排序，排序将影响用户提现时的页签显示顺序
                      </n-text>
                    </div>
                  </div>
                </n-form-item>
              </div>
            </n-form>
          </div>
        </n-tab-pane>

        <!-- 业务规则 Tab -->
        <n-tab-pane name="business" tab="业务规则">
          <template #tab>
            <div class="flex items-center gap-2">
              <n-icon><BusinessOutline /></n-icon>
              <span>业务规则</span>
            </div>
          </template>

          <div class="tab-content">
            <n-form
              ref="businessFormRef"
              :model="formData"
              label-placement="left"
              label-width="220px"
              class="enhanced-form"
            >
              <!-- 代付有效时间 -->
              <div class="form-section">
                <h4 class="section-title">支付设置</h4>
                <n-form-item label="代付有效时间" path="paymentValidityHours">
                  <div class="flex items-center gap-4">
                    <n-input-number
                      v-model:value="formData.paymentValidityHours"
                      :min="1"
                      :max="168"
                      style="width: 120px"
                      size="medium"
                    />
                    <n-text depth="3">小时 (建议设置为24-72小时)</n-text>
                  </div>
                </n-form-item>
              </div>

              <!-- 提现手续费 -->
              <div class="form-section">
                <h4 class="section-title">手续费设置</h4>
                <n-form-item label="提现手续费" path="feeRoundingMode">
                  <n-radio-group v-model:value="formData.feeRoundingMode">
                    <n-space direction="vertical" size="medium">
                      <n-radio value="down">
                        <div class="radio-content">
                          <div class="radio-title">向下取整</div>
                          <div class="radio-desc">
                            手续费向下取整，对用户更友好
                          </div>
                        </div>
                      </n-radio>
                      <n-radio value="up">
                        <div class="radio-content">
                          <div class="radio-title">向上取整</div>
                          <div class="radio-desc">手续费向上取整，增加收入</div>
                        </div>
                      </n-radio>
                    </n-space>
                  </n-radio-group>
                  <n-text depth="3" style="margin-top: 8px; display: block">
                    举例: {{ formData.feeExample }}
                  </n-text>
                </n-form-item>
              </div>

              <!-- 提现审核通知 -->
              <div class="form-section">
                <h4 class="section-title">通知设置</h4>
                <n-form-item
                  label="提现审核通知"
                  path="reviewNotificationEnabled"
                >
                  <n-radio-group
                    v-model:value="formData.reviewNotificationEnabled"
                  >
                    <n-space direction="vertical" size="medium">
                      <n-radio :value="true">
                        <div class="radio-content">
                          <div class="radio-title">开启通知</div>
                          <div class="radio-desc">新增提现时会弹出提醒</div>
                        </div>
                      </n-radio>
                      <n-radio :value="false">
                        <div class="radio-content">
                          <div class="radio-title">关闭通知</div>
                          <div class="radio-desc">静默处理，不弹出提醒</div>
                        </div>
                      </n-radio>
                    </n-space>
                  </n-radio-group>
                </n-form-item>

                <!-- 查看完整提现限额 -->
                <n-form-item label="查看完整提现限额" path="showCompleteLimits">
                  <n-radio-group v-model:value="formData.showCompleteLimits">
                    <n-space direction="vertical" size="medium">
                      <n-radio :value="true">
                        <div class="radio-content">
                          <div class="radio-title">允许会员查看</div>
                          <div class="radio-desc">
                            会员可以在前台查看完整提现限额
                          </div>
                        </div>
                      </n-radio>
                      <n-radio :value="false">
                        <div class="radio-content">
                          <div class="radio-title">不允许会员查看</div>
                          <div class="radio-desc">隐藏完整限额信息</div>
                        </div>
                      </n-radio>
                    </n-space>
                  </n-radio-group>
                </n-form-item>
              </div>

              <!-- 添加提现账号限制 -->
              <div class="form-section">
                <h4 class="section-title">账号限制</h4>
                <n-form-item
                  label="添加提现账号限制"
                  path="accountRestrictions"
                >
                  <n-space
                    direction="vertical"
                    size="medium"
                    style="width: 100%"
                  >
                    <n-checkbox
                      v-model:checked="formData.restrictFirstDepositAccount"
                    >
                      限制未首充成功会员仅能绑定1个提现账号，不能删除
                    </n-checkbox>
                    <n-checkbox
                      v-model:checked="formData.restrictFirstWithdrawalAccount"
                    >
                      限制未首提成功会员仅能绑定1个提现账号，不能删除
                    </n-checkbox>
                    <n-checkbox
                      v-model:checked="formData.restrictBankCardBinding"
                    >
                      绑定数字货币提现地址前，强制绑定银行卡
                    </n-checkbox>
                  </n-space>
                  <n-text
                    depth="3"
                    style="margin-top: 12px; display: block; color: #6b7280"
                  >
                    说明: 不勾选表示不限制
                  </n-text>
                </n-form-item>
              </div>
            </n-form>
          </div>
        </n-tab-pane>

        <!-- 数字货币 Tab -->
        <n-tab-pane name="digital" tab="数字货币">
          <template #tab>
            <div class="flex items-center gap-2">
              <n-icon><WalletOutline /></n-icon>
              <span>数字货币</span>
            </div>
          </template>

          <div class="tab-content">
            <n-form
              ref="digitalFormRef"
              :model="formData"
              label-placement="left"
              label-width="220px"
              class="enhanced-form"
            >
              <!-- 会员币种 -->
              <div class="form-section">
                <h4 class="section-title">基础货币</h4>
                <n-form-item label="会员币种">
                  <div class="flex items-center gap-4">
                    <n-text>巴西雷亚尔 (BRL)</n-text>
                    <n-button type="primary" size="small">
                      应用到全部币种
                    </n-button>
                  </div>
                </n-form-item>
              </div>

              <!-- 可转的数字货币 -->
              <div class="form-section">
                <h4 class="section-title">数字货币配置</h4>
                <n-form-item
                  label="可转的数字货币"
                  path="allowedDigitalCurrencies"
                >
                  <div class="digital-currency-container">
                    <n-alert type="warning" :show-icon="false" class="mb-4">
                      <template #header>
                        <div class="flex items-center gap-2">
                          <n-icon><InformationCircleOutline /></n-icon>
                          <span>重要提示</span>
                        </div>
                      </template>
                      <div class="text-sm">
                        • 勾选表示允许转换为该币种进行提现<br />
                        • 若某种数字货币全部不勾选，则不显示该提现方式<br />
                        • 至少需要勾选一种货币，会员才能看到数字货币提现选项<br />
                        •
                        <span class="text-red-500"
                          >不推荐开启过多币种，可能增加刷钱或洗钱风险</span
                        >
                      </div>
                    </n-alert>

                    <div class="digital-currency-grid">
                      <div
                        v-for="currency in digitalCurrencies"
                        :key="currency.value"
                        class="currency-item"
                      >
                        <n-checkbox
                          v-model:checked="
                            formData.allowedDigitalCurrencies[currency.value]
                          "
                          class="currency-checkbox"
                        >
                          <div class="currency-info">
                            <div class="currency-name">
                              {{ currency.label }}
                            </div>
                            <div class="currency-desc">
                              {{ currency.description }}
                            </div>
                          </div>
                        </n-checkbox>
                      </div>
                    </div>
                  </div>
                </n-form-item>

                <!-- 提现精确模式 -->
                <n-form-item label="提现精确模式">
                  <div class="flex items-center gap-4">
                    <n-button type="primary" size="small">
                      前往修改精确模式设置
                    </n-button>
                    <n-text depth="3">控制数字货币提现的精度计算方式</n-text>
                  </div>
                </n-form-item>
              </div>
            </n-form>
          </div>
        </n-tab-pane>

        <!-- 会员限制 Tab -->
        <n-tab-pane name="restrictions" tab="会员限制">
          <template #tab>
            <div class="flex items-center gap-2">
              <n-icon><LockClosedOutline /></n-icon>
              <span>会员限制</span>
            </div>
          </template>

          <div class="tab-content">
            <n-form
              ref="restrictionsFormRef"
              :model="formData"
              label-placement="left"
              label-width="220px"
              class="enhanced-form"
            >
              <!-- 提现黑名单 -->
              <div class="form-section">
                <h4 class="section-title">黑名单设置</h4>
                <n-form-item label="提现黑名单" path="blacklistLevel">
                  <div class="flex items-center gap-4">
                    <n-select
                      v-model:value="formData.blacklistLevel"
                      :options="memberLevelOptions"
                      placeholder="请选择会员层级"
                      style="width: 250px"
                      size="medium"
                    />
                    <n-text depth="3">指定的会员层级将禁止发起提现申请</n-text>
                  </div>
                </n-form-item>
              </div>

              <!-- 首次提现限制 -->
              <div class="form-section">
                <h4 class="section-title">首次提现限制</h4>
                <n-form-item label="首次提现限制" path="firstWithdrawalRules">
                  <div class="first-withdrawal-container">
                    <div class="rules-header">
                      <div class="header-item">指定会员层级</div>
                      <div class="header-item">首次提现要求最低充值</div>
                      <div class="header-item">首次提现要求最高提现</div>
                      <div class="header-item">操作</div>
                    </div>

                    <div class="rules-list">
                      <div
                        v-for="(rule, index) in formData.firstWithdrawalRules"
                        :key="index"
                        class="rule-item"
                      >
                        <div class="rule-field">
                          <n-select
                            v-model:value="rule.memberLevel"
                            :options="memberLevelOptions"
                            placeholder="请选择会员层级"
                            size="small"
                          />
                        </div>
                        <div class="rule-field">
                          <n-input
                            v-model:value="rule.minRecharge"
                            placeholder="R$ 请输入最低充值金额"
                            size="small"
                          />
                        </div>
                        <div class="rule-field">
                          <n-input
                            v-model:value="rule.maxWithdrawal"
                            placeholder="R$ 请输入最高提现金额"
                            size="small"
                          />
                        </div>
                        <div class="rule-actions">
                          <n-button
                            size="small"
                            @click="addFirstWithdrawalRule"
                            type="primary"
                            circle
                          >
                            <template #icon>
                              <n-icon><SaveOutline /></n-icon>
                            </template>
                          </n-button>
                          <n-button
                            size="small"
                            @click="removeFirstWithdrawalRule(index)"
                            type="error"
                            circle
                            v-if="formData.firstWithdrawalRules.length > 1"
                          >
                            <template #icon>
                              <n-icon><CloseOutline /></n-icon>
                            </template>
                          </n-button>
                        </div>
                      </div>
                    </div>

                    <div class="rules-footer">
                      <n-button
                        @click="addFirstWithdrawalRule"
                        ghost
                        size="small"
                      >
                        <template #icon>
                          <n-icon><SaveOutline /></n-icon>
                        </template>
                        添加新规则
                      </n-button>
                    </div>
                  </div>
                </n-form-item>
              </div>
            </n-form>
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import {
  NModal,
  NTabs,
  NTabPane,
  NForm,
  NFormItem,
  NButton,
  NRadioGroup,
  NRadio,
  NInputNumber,
  NSpace,
  NText,
  NCheckbox,
  NSelect,
  NInput,
  NAlert,
  NTag,
  NIcon,
  useMessage,
  type FormInst,
} from 'naive-ui';
import {
  CloseOutline,
  SaveOutline,
  InformationCircleOutline,
  MenuOutline,
  HandLeftOutline,
  PersonOutline,
  ShieldCheckmarkOutline,
  SwapHorizontalOutline,
  BusinessOutline,
  WalletOutline,
  LockClosedOutline,
} from '@vicons/ionicons5';
// Note: Using native HTML5 drag and drop instead of external library
import { withdrawalSettingsApi } from '#/api/finance/withdrawalSettings';

interface WithdrawalTab {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  order: number;
  type: 'normal' | 'digital' | 'third_party' | 'no_wallet';
}

interface WithdrawalSettings {
  // Basic Settings
  dailyLimit: number;
  maintenanceWindow?: string;
  maxAmount: number;
  minAmount: number;
  processingTime: string;

  // Interface Settings
  frontendTaskDisplayEnabled: boolean;
  cpfValidationMode: 'disabled' | 'format_only' | 'third_party';
  memberConcurrentWithdrawals: number;
  withdrawalTabOrder: WithdrawalTab[];

  // Business Rules
  paymentValidityHours: number;
  feeRoundingMode: 'down' | 'up';
  feeExample: string;
  limitUnverifiedMembers: boolean;
  restrictFirstDepositAccount: boolean;
  restrictFirstWithdrawalAccount: boolean;
  restrictBankCardBinding: boolean;
  reviewNotificationEnabled: boolean;
  showCompleteLimits: boolean;
  blacklistLevel: string;
  allowedDigitalCurrencies: Record<string, boolean>;
  firstWithdrawalRules: Array<{
    memberLevel: string;
    minRecharge: string;
    maxWithdrawal: string;
  }>;
}

interface Props {
  visible: boolean;
  editData?: WithdrawalSettings | null;
}

interface Emits {
  'update:visible': [visible: boolean];
  success: [];
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  editData: null,
});

const emit = defineEmits<Emits>();
const message = useMessage();
const interfaceFormRef = ref<FormInst>();
const securityFormRef = ref<FormInst>();
const workflowFormRef = ref<FormInst>();
const businessFormRef = ref<FormInst>();
const digitalFormRef = ref<FormInst>();
const restrictionsFormRef = ref<FormInst>();
const activeTab = ref('interface');

// Digital currencies configuration
const digitalCurrencies = [
  {
    label: 'USDT-TRC20',
    value: 'USDT_TRC20',
    description: 'Tether USD on TRON network',
  },
  {
    label: 'USDT-ERC20',
    value: 'USDT_ERC20',
    description: 'Tether USD on Ethereum network',
  },
  { label: 'USDC', value: 'USDC', description: 'USD Coin' },
  { label: 'TRX', value: 'TRX', description: 'TRON native token' },
  { label: 'BTC', value: 'BTC', description: 'Bitcoin' },
  { label: 'ETH', value: 'ETH', description: 'Ethereum' },
];

const memberLevelOptions = [
  { label: '默认', value: 'default' },
  { label: 'VIP1', value: 'vip1' },
  { label: 'VIP2', value: 'vip2' },
  { label: 'VIP3', value: 'vip3' },
  { label: 'VIP4', value: 'vip4' },
  { label: 'VIP5', value: 'vip5' },
];

// Default withdrawal tab order (SOP)
const defaultWithdrawalTabs: WithdrawalTab[] = [
  {
    id: 'no_wallet',
    name: 'NO钱包',
    description: '无需钱包地址的快速提现方式',
    enabled: true,
    order: 1,
    type: 'no_wallet',
  },
  {
    id: 'normal',
    name: '正常提现',
    description: '传统银行转账提现方式',
    enabled: true,
    order: 2,
    type: 'normal',
  },
  {
    id: 'digital',
    name: '转为数字货币',
    description: '提现为USDT等数字货币',
    enabled: true,
    order: 3,
    type: 'digital',
  },
  {
    id: 'third_party',
    name: '三方钱包',
    description: '第三方支付钱包提现',
    enabled: true,
    order: 4,
    type: 'third_party',
  },
];

// Default form data
const defaultFormData: WithdrawalSettings = {
  // Basic Settings
  dailyLimit: 100000,
  maintenanceWindow: '02:00-04:00',
  maxAmount: 50000,
  minAmount: 100,
  processingTime: '1-3个工作日',

  // Interface Settings
  frontendTaskDisplayEnabled: false,
  cpfValidationMode: 'format_only',
  memberConcurrentWithdrawals: 1,
  withdrawalTabOrder: [...defaultWithdrawalTabs],

  // Business Rules
  paymentValidityHours: 24,
  feeRoundingMode: 'down',
  feeExample: '10.01向下取整后等于10',
  limitUnverifiedMembers: false,
  restrictFirstDepositAccount: false,
  restrictFirstWithdrawalAccount: false,
  restrictBankCardBinding: false,
  reviewNotificationEnabled: true,
  showCompleteLimits: false,
  blacklistLevel: '',
  allowedDigitalCurrencies: {
    USDT_TRC20: false,
    USDT_ERC20: false,
    USDC: false,
    TRX: false,
    BTC: false,
    ETH: false,
  },
  firstWithdrawalRules: [
    {
      memberLevel: 'default',
      minRecharge: 'R$ 0.00',
      maxWithdrawal: 'R$ 0.00',
    },
  ],
};

const formData = reactive<WithdrawalSettings>({ ...defaultFormData });

// Drag and drop state
const isDragging = ref(false);
const saving = ref(false);

// Drag and drop methods
let draggedIndex = -1;

const onDragStart = (event: DragEvent, index: number) => {
  isDragging.value = true;
  draggedIndex = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', '');
  }
};

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
};

const onDrop = (event: DragEvent, dropIndex: number) => {
  event.preventDefault();

  if (
    draggedIndex !== -1 &&
    draggedIndex !== dropIndex &&
    formData.withdrawalTabOrder
  ) {
    const draggedItem = formData.withdrawalTabOrder[draggedIndex];

    if (draggedItem) {
      // Remove the dragged item
      formData.withdrawalTabOrder.splice(draggedIndex, 1);

      // Insert at new position
      const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
      formData.withdrawalTabOrder.splice(insertIndex, 0, draggedItem);

      // Update order numbers
      formData.withdrawalTabOrder.forEach((tab, index) => {
        tab.order = index + 1;
      });

      message.success('提现页签排序已更新');
    }
  }
};

const onDragEnd = () => {
  isDragging.value = false;
  draggedIndex = -1;
};

const toggleTabStatus = (tab: WithdrawalTab) => {
  tab.enabled = !tab.enabled;
  message.success(`${tab.name} 已${tab.enabled ? '启用' : '禁用'}`);
};

// First withdrawal rules management
const addFirstWithdrawalRule = () => {
  formData.firstWithdrawalRules.push({
    memberLevel: '',
    minRecharge: 'R$ 0.00',
    maxWithdrawal: 'R$ 0.00',
  });
  message.success('已添加新的首次提现规则');
};

const removeFirstWithdrawalRule = (index: number) => {
  if (formData.firstWithdrawalRules.length > 1) {
    formData.firstWithdrawalRules.splice(index, 1);
    message.success('已删除提现规则');
  }
};

// Modal actions
const handleCancel = () => {
  emit('update:visible', false);
};

const handleSave = async () => {
  try {
    saving.value = true;

    // Validate all forms with better error handling
    const forms = [
      { name: 'interface', ref: interfaceFormRef.value },
      { name: 'security', ref: securityFormRef.value },
      { name: 'workflow', ref: workflowFormRef.value },
      { name: 'business', ref: businessFormRef.value },
      { name: 'digital', ref: digitalFormRef.value },
      { name: 'restrictions', ref: restrictionsFormRef.value },
    ];

    console.log('🔍 Starting form validation...');

    // Validate each form individually to identify which one fails
    for (const form of forms) {
      if (form.ref?.validate) {
        try {
          await form.ref.validate();
          console.log(`✅ ${form.name} form validation passed`);
        } catch (validationError) {
          console.error(
            `❌ ${form.name} form validation failed:`,
            validationError,
          );
          message.error(`${form.name} 表单验证失败，请检查输入`);
          return; // Stop here, don't proceed with API call
        }
      } else {
        console.log(
          `⚠️ ${form.name} form ref not available, skipping validation`,
        );
      }
    }

    console.log('✅ All form validations passed, proceeding with API call...');

    // Prepare data with required fields - exclude backend-only fields
    const {
      id,
      createdAt,
      updatedAt,
      createdBy,
      updatedBy,
      withdrawalQueueSortBy,
      queueSortOrder,
      feeMode,
      hideUnverifiedTasks,
      cpfFormatValidationEnabled,
      cpfThirdPartyValidationEnabled,
      limitWithdrawalAccountEnabled,
      restrictFirstWithdrawalAccount,
      restrictBankCardBinding,
      enableAccountLimits,
      limitDigitalCurrencyWithdrawal,
      baseCurrency,
      applyToAllCurrencies,
      precisionMode,
      pixAllowedBindingTypes,
      pixAccountQuantityLimit,
      pixBindingEnabled,
      ...cleanFormData
    } = formData;

    const saveData = cleanFormData;

    console.log('📤 Sending data to API:', saveData);

    // Save to database
    const response = await withdrawalSettingsApi.saveSettings(saveData as any);

    console.log('📥 API response received:', response);

    if (response.success) {
      console.log('✅ Settings saved successfully, closing modal...');
      message.success('提现设置保存成功');
      emit('success');
      emit('update:visible', false);
      console.log('✅ Modal close event emitted');
    } else {
      console.log('❌ Settings save failed:', response);
      message.error(response.message || '保存设置失败');
    }
  } catch (error: any) {
    console.error('Save settings error:', error);

    // Check if this is actually a successful response being thrown as an error
    if (error && typeof error === 'object' && error.success === true) {
      console.log(
        '🔧 Detected successful response in error - treating as success',
      );
      console.log(
        '✅ Settings saved successfully (from error handler), closing modal...',
      );
      message.success('提现设置保存成功');
      emit('success');
      emit('update:visible', false);
      console.log('✅ Modal close event emitted (from error handler)');
      return;
    }

    message.error('保存设置失败');
  } finally {
    saving.value = false;
  }
};

// Load existing settings
const loadSettings = async () => {
  try {
    const response = await withdrawalSettingsApi.getSettings();
    if (response.success && response.data) {
      Object.assign(formData, response.data);
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
};

// Watch for edit data changes
watch(
  () => props.editData,
  (newData) => {
    if (newData) {
      Object.assign(formData, newData);
    }
  },
  { immediate: true },
);

// Watch for modal visibility to load settings
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      activeTab.value = 'interface'; // Reset to first tab when opening
      if (!props.editData) {
        loadSettings();
      }
    }
  },
);

// Update fee example based on rounding mode
watch(
  () => formData.feeRoundingMode,
  (mode) => {
    formData.feeExample =
      mode === 'down' ? '10.01向下取整后等于10' : '10.01向上取整后等于11';
  },
);
</script>

<style scoped>
/* Enhanced Modal Styles */
.withdrawal-settings-container {
  max-height: calc(85vh - 120px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.settings-header {
  flex-shrink: 0;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

/* Enhanced Tabs */
.enhanced-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.enhanced-tabs :deep(.n-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.enhanced-tabs :deep(.n-tabs-nav) {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 4px;
  flex-shrink: 0;
}

.enhanced-tabs :deep(.n-tabs-tab) {
  border-radius: 6px;
  transition: all 0.2s ease;
}

.enhanced-tabs :deep(.n-tabs-tab--active) {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.enhanced-tabs :deep(.n-tabs-content) {
  flex: 1;
  overflow: hidden;
}

.enhanced-tabs :deep(.n-tab-pane) {
  height: 100%;
  overflow-y: auto;
}

/* Tab Content */
.tab-content {
  padding: 16px 0;
  height: 100%;
  overflow-y: auto;
}

/* Enhanced Form */
.enhanced-form {
  max-height: none;
}

.form-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #fafbfc;
  border-radius: 8px;
  border-left: 3px solid #1890ff;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 16px;
  background: #1890ff;
  border-radius: 2px;
}

/* Radio Content */
.radio-content {
  margin-left: 8px;
}

.radio-title {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.radio-desc {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

/* Tab Ordering Styles */
.tab-ordering-container {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  max-height: 400px;
  overflow-y: auto;
}

.ordering-header {
  margin-bottom: 16px;
}

.draggable-list {
  min-height: 150px;
}

.tab-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tab-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  transition: all 0.2s ease;
  cursor: move;
}

.tab-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.tab-item.dragging {
  opacity: 0.8;
  transform: rotate(2deg);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.tab-item-content {
  display: flex;
  align-items: center;
  padding: 12px;
  gap: 12px;
}

.drag-handle {
  color: #9ca3af;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.drag-handle:hover {
  background: #f3f4f6;
  color: #6b7280;
}

.drag-handle:active {
  cursor: grabbing;
}

.tab-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.tab-order-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #1890ff;
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 12px;
}

.tab-details {
  flex: 1;
}

.tab-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.tab-description {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

.tab-status {
  display: flex;
  align-items: center;
}

.tab-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ordering-footer {
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

/* Responsive Design */
@media (max-width: 768px) {
  .withdrawal-settings-container {
    max-height: calc(90vh - 100px);
  }

  .settings-header .flex {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .form-section {
    padding: 12px;
    margin-bottom: 16px;
  }

  .tab-item-content {
    padding: 10px;
    gap: 8px;
  }

  .tab-info {
    gap: 8px;
  }

  .tab-order-number {
    width: 20px;
    height: 20px;
    font-size: 10px;
  }
}

/* Animation for drag and drop */
.tab-list .sortable-ghost {
  opacity: 0.4;
}

.tab-list .sortable-chosen {
  transform: scale(1.02);
}

.tab-list .sortable-drag {
  transform: rotate(5deg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

/* Digital Currency Styles */
.digital-currency-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.digital-currency-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.currency-item {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease;
}

.currency-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.currency-checkbox {
  width: 100%;
}

.currency-info {
  margin-left: 8px;
}

.currency-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.currency-desc {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

/* First Withdrawal Rules Styles */
.first-withdrawal-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.rules-header {
  display: grid;
  grid-template-columns: 2fr 2fr 2fr 1fr;
  gap: 16px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.header-item {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule-item {
  display: grid;
  grid-template-columns: 2fr 2fr 2fr 1fr;
  gap: 16px;
  align-items: center;
  padding: 12px 16px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.rule-field {
  display: flex;
  align-items: center;
}

.rule-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.rules-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: center;
}

/* Enhanced Form Validation */
.enhanced-form :deep(.n-form-item-feedback-wrapper) {
  margin-top: 4px;
}

.enhanced-form :deep(.n-form-item--error .n-input__border) {
  border-color: #f56565 !important;
}

.enhanced-form :deep(.n-form-item--error .n-input__state-border) {
  border-color: #f56565 !important;
}

/* Responsive Design for New Components */
@media (max-width: 768px) {
  .digital-currency-grid {
    grid-template-columns: 1fr;
  }

  .rules-header,
  .rule-item {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .header-item {
    text-align: center;
    padding: 8px 0;
    border-bottom: 1px solid #e5e7eb;
  }

  .rule-field {
    justify-content: center;
  }

  .rule-actions {
    justify-content: center;
    margin-top: 8px;
  }
}

.withdrawal-settings-form .n-form-item {
  margin-bottom: 24px;
}

/* Tab styling */
:deep(.n-tabs-nav) {
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
  padding: 8px 16px 0;
}

:deep(.n-tabs-tab) {
  padding: 12px 24px;
  margin-right: 4px;
  border-radius: 6px 6px 0 0;
  font-weight: 500;
}

:deep(.n-tabs-tab--active) {
  background: white;
  border-bottom: 2px solid #18a058;
}

:deep(.n-tabs-pane) {
  padding: 0;
}

/* Better spacing for form sections */
.n-form-item:last-child {
  margin-bottom: 0;
}

/* Highlight important sections */
.n-form-item:has([label*='黑名单']) :deep(.n-form-item-label) {
  color: #d03050;
  font-weight: 600;
}

.n-form-item:has([label*='数字货币']) :deep(.n-form-item-label) {
  color: #f0a020;
  font-weight: 600;
}
</style>
