<template>
  <div class="withdrawal-settings">
    <!-- Header Section -->
    <div class="header-section">
      <n-card :bordered="false" class="rounded-16px shadow-sm">
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-gray-800">提现设置</h2>
            <p class="mt-1 text-sm text-gray-600">管理提现通道配置和限额设置</p>
          </div>
        </div>
      </n-card>
    </div>

    <!-- SmartDataGrid -->
    <SmartDataGrid
      :data="channelsData"
      :columns="columns"
      :loading="loading"
      :scroll-x="2000"
      size="small"
      class="withdrawal-settings-table"
      @refresh="refreshData"
      @row-click="handleRowClick"
    >
      <template #actionBar>
        <n-card :bordered="false" class="rounded-16px shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <!-- 主要操作按钮 -->
              <div class="flex gap-2">
                <n-button
                  type="primary"
                  @click="refreshData"
                  :loading="loading"
                >
                  <template #icon>
                    <n-icon><ReloadOutline /></n-icon>
                  </template>
                  刷新
                </n-button>
                <n-button type="error" @click="showCloseChannelModal">
                  <template #icon>
                    <n-icon><CloseCircleOutline /></n-icon>
                  </template>
                  关闭提现通道
                </n-button>
                <n-button type="success" @click="showAutoApprovalModal">
                  <template #icon>
                    <n-icon><CheckmarkCircleOutline /></n-icon>
                  </template>
                  免审自动出款
                </n-button>
                <n-button type="info" @click="showGeneralSettingsModal">
                  <template #icon>
                    <n-icon><SettingsOutline /></n-icon>
                  </template>
                  提现设置
                </n-button>
                <n-button type="warning" @click="showRiskControlModal">
                  <template #icon>
                    <n-icon><RocketOutline /></n-icon>
                  </template>
                  风控审核设置
                </n-button>
              </div>

              <!-- 信息显示 -->
              <div class="text-sm text-gray-600">
                共 {{ channelsData.length }} 个提现通道
                <n-tag type="info" size="small" class="ml-2"> 提现设置 </n-tag>
              </div>
            </div>
          </div>
        </n-card>
      </template>
    </SmartDataGrid>

    <!-- Channel Configuration Modal -->
    <n-modal
      v-model:show="channelModal.show"
      preset="card"
      title="提现通道配置"
      size="large"
      :style="{ width: '80%', maxWidth: '1200px' }"
    >
      <div class="space-y-6">
        <!-- Channel Selection -->
        <n-card title="通道选择" size="small">
          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="通道类型">
              <n-select
                v-model:value="channelModal.data.type"
                placeholder="选择通道类型"
                :options="channelTypeOptions"
                @update:value="onChannelTypeChange"
              />
            </n-form-item>
            <n-form-item label="通道名称">
              <n-input
                v-model:value="channelModal.data.name"
                placeholder="输入通道名称"
              />
            </n-form-item>
          </div>
        </n-card>

        <!-- Channel Status Settings -->
        <n-card title="通道状态设置" size="small">
          <div class="grid grid-cols-3 gap-6">
            <div class="space-y-4">
              <h4 class="font-medium text-gray-700">基本状态</h4>
              <n-form-item label="是否允许会员用">
                <n-switch
                  v-model:value="channelModal.data.allowMemberUse"
                  size="small"
                />
              </n-form-item>
              <n-form-item label="是否支持转账现">
                <n-switch
                  v-model:value="channelModal.data.supportTransfer"
                  size="small"
                />
              </n-form-item>
              <n-form-item label="是否支持数字货币提现">
                <n-switch
                  v-model:value="channelModal.data.supportDigitalCurrency"
                  size="small"
                />
              </n-form-item>
            </div>

            <div class="space-y-4">
              <h4 class="font-medium text-gray-700">提现限额</h4>
              <n-form-item label="允许提现">
                <n-switch
                  v-model:value="channelModal.data.allowWithdrawal"
                  size="small"
                />
              </n-form-item>
              <n-form-item label="监号数量">
                <n-input-number
                  v-model:value="channelModal.data.monitorCount"
                  placeholder="监号数量"
                  :min="0"
                  class="w-full"
                />
              </n-form-item>
            </div>

            <div class="space-y-4">
              <h4 class="font-medium text-gray-700">币种设置</h4>
              <n-form-item label="到账币种">
                <n-select
                  v-model:value="channelModal.data.currency"
                  placeholder="选择币种"
                  :options="currencyOptions"
                />
              </n-form-item>
              <n-form-item label="单笔限额">
                <n-input
                  v-model:value="channelModal.data.singleLimit"
                  placeholder="0.00-20,000.00"
                />
              </n-form-item>
              <n-form-item label="手续费">
                <n-input
                  v-model:value="channelModal.data.fees"
                  placeholder="0.00-20,000.00 0.00"
                />
              </n-form-item>
            </div>
          </div>
        </n-card>

        <!-- Advanced Settings -->
        <n-card title="高级设置" size="small">
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-4">
              <n-form-item label="工作时间设置">
                <n-time-picker
                  v-model:value="channelModal.data.workingHours as any"
                  :type="timeRangeType"
                  format="HH:mm"
                  placeholder="选择工作时间范围"
                  class="w-full"
                />
              </n-form-item>
              <n-form-item label="每日限额">
                <n-input-number
                  v-model:value="channelModal.data.dailyLimit"
                  placeholder="每日最大提现限额"
                  :min="0"
                  class="w-full"
                />
              </n-form-item>
            </div>

            <div class="space-y-4">
              <n-form-item label="风险控制等级">
                <n-select
                  v-model:value="channelModal.data.riskLevel"
                  placeholder="选择风险等级"
                  :options="riskLevelOptions"
                />
              </n-form-item>
              <n-form-item label="优先级">
                <n-input-number
                  v-model:value="channelModal.data.priority"
                  placeholder="通道优先级 (1-100)"
                  :min="1"
                  :max="100"
                  class="w-full"
                />
              </n-form-item>
            </div>
          </div>
        </n-card>

        <!-- API Configuration -->
        <n-card title="API配置" size="small">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <n-form-item label="API地址">
                <n-input
                  v-model:value="channelModal.data.apiUrl"
                  placeholder="输入API地址"
                />
              </n-form-item>
              <n-form-item label="商户号">
                <n-input
                  v-model:value="channelModal.data.merchantId"
                  placeholder="输入商户号"
                />
              </n-form-item>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <n-form-item label="密钥">
                <n-input
                  v-model:value="channelModal.data.secretKey"
                  placeholder="输入密钥"
                  type="password"
                  show-password-on="click"
                />
              </n-form-item>
              <n-form-item label="回调地址">
                <n-input
                  v-model:value="channelModal.data.callbackUrl"
                  placeholder="输入回调地址"
                />
              </n-form-item>
            </div>
          </div>
        </n-card>

        <!-- Actions -->
        <div class="flex justify-end gap-3">
          <n-button @click="channelModal.show = false">取消</n-button>
          <n-button
            type="primary"
            @click="saveChannelSettings"
            :loading="channelModal.saving"
          >
            保存设置
          </n-button>
        </div>
      </div>
    </n-modal>

    <!-- Bulk Settings Modal -->
    <n-modal
      v-model:show="bulkSettingsModal.show"
      preset="dialog"
      title="批量工作时间设置"
      positive-text="应用设置"
      negative-text="取消"
      @positive-click="applyBulkSettings"
    >
      <div class="space-y-4">
        <n-alert type="info" :show-icon="false">
          为所有启用的提现通道设置统一的工作时间
        </n-alert>
        <n-form-item label="工作时间">
          <n-time-picker
            v-model:value="bulkSettingsModal.workingHours as any"
            :type="timeRangeType"
            format="HH:mm"
            placeholder="选择工作时间范围"
            class="w-full"
          />
        </n-form-item>
        <n-form-item label="应用到">
          <n-select
            v-model:value="bulkSettingsModal.applyTo"
            placeholder="选择应用范围"
            :options="[
              { label: '所有通道', value: 'all' },
              { label: '仅启用通道', value: 'enabled' },
              { label: '仅PIX通道', value: 'pix' },
            ]"
          />
        </n-form-item>
      </div>
    </n-modal>

    <!-- Auto Risk Control Modal -->
    <n-modal
      v-model:show="autoRuleModal.show"
      preset="card"
      title="风险自动减控设置"
      size="large"
      :style="{ width: '70%', maxWidth: '800px' }"
    >
      <div class="space-y-6">
        <n-alert type="warning" :show-icon="false">
          当检测到异常提现行为时，系统将自动调整通道设置以降低风险
        </n-alert>

        <!-- Risk Detection Rules -->
        <n-card title="风险检测规则" size="small">
          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="异常提现频率阈值">
              <n-input-number
                v-model:value="autoRuleModal.data.frequencyThreshold"
                placeholder="每分钟最大提现次数"
                :min="1"
                class="w-full"
              />
            </n-form-item>
            <n-form-item label="异常金额阈值">
              <n-input-number
                v-model:value="autoRuleModal.data.amountThreshold"
                placeholder="单笔异常金额"
                :min="0"
                class="w-full"
              />
            </n-form-item>
            <n-form-item label="失败率阈值">
              <n-input-number
                v-model:value="autoRuleModal.data.failureRateThreshold"
                placeholder="失败率百分比"
                :min="0"
                :max="100"
                class="w-full"
              />
            </n-form-item>
            <n-form-item label="监控时间窗口（分钟）">
              <n-input-number
                v-model:value="autoRuleModal.data.monitorWindow"
                placeholder="监控时间窗口"
                :min="1"
                class="w-full"
              />
            </n-form-item>
          </div>
        </n-card>

        <!-- Auto Actions -->
        <n-card title="自动处理动作" size="small">
          <div class="space-y-4">
            <n-form-item label="启用自动风控">
              <n-switch v-model:value="autoRuleModal.data.enabled" />
            </n-form-item>
            <n-form-item label="触发时动作">
              <n-select
                v-model:value="autoRuleModal.data.action"
                placeholder="选择触发动作"
                :options="[
                  { label: '暂停通道', value: 'pause' },
                  { label: '降低限额', value: 'reduce_limit' },
                  { label: '仅通知', value: 'notify_only' },
                ]"
              />
            </n-form-item>
            <n-form-item label="恢复条件">
              <n-select
                v-model:value="autoRuleModal.data.recoveryCondition"
                placeholder="选择恢复条件"
                :options="[
                  { label: '手动恢复', value: 'manual' },
                  { label: '1小时后自动', value: 'auto_1h' },
                  { label: '4小时后自动', value: 'auto_4h' },
                ]"
              />
            </n-form-item>
          </div>
        </n-card>

        <!-- Actions -->
        <div class="flex justify-end gap-3">
          <n-button @click="autoRuleModal.show = false">取消</n-button>
          <n-button type="primary" @click="saveAutoRiskSettings">
            保存设置
          </n-button>
        </div>
      </div>
    </n-modal>

    <!-- Withdrawal Settings Modal -->
    <WithdrawalSettingsModal
      v-model:visible="showSettingsModal"
      @success="refreshData"
    />

    <!-- Withdrawal Channel Configuration Modal -->
    <WithdrawalChannelConfigModal
      v-model:visible="showChannelConfigModal"
      :edit-data="selectedChannelData"
      @success="refreshData"
      @update:visible="
        (value) => {
          if (!value) handleChannelConfigModalClose();
        }
      "
    />

    <!-- Modify Withdrawal Method Modal -->
    <ModifyWithdrawalMethodModal
      v-model:visible="showModifyMethodModal"
      :channel-data="selectedMethodData"
      @success="refreshData"
    />

    <!-- Close Channel Modal -->
    <n-modal
      v-model:show="showCloseChannelModalState"
      preset="dialog"
      title="关闭提现通道"
      positive-text="确认"
      negative-text="取消"
      @positive-click="handleCloseChannelConfirm"
    >
      <div class="space-y-4">
        <!-- Channel Switch Radio Group -->
        <div>
          <div class="mb-3">
            <span class="text-sm font-medium text-gray-700">提现通道开关</span>
            <span class="ml-1 text-red-500">*</span>
          </div>
          <n-radio-group v-model:value="closeChannelForm.channelSwitch">
            <n-space direction="vertical">
              <n-radio value="enabled">开启提现通道</n-radio>
              <n-radio value="disabled">关闭提现通道</n-radio>
            </n-space>
          </n-radio-group>
        </div>

        <!-- Description -->
        <div class="rounded bg-gray-50 p-3 text-sm text-gray-600">
          关闭提现通道后，会员将无法提现
        </div>
      </div>
    </n-modal>

    <!-- Auto Approval Modal -->
    <n-modal
      v-model:show="showAutoApprovalModalState"
      preset="dialog"
      title="免人工审核自动出款"
      positive-text="确认"
      negative-text="取消"
      :style="{ width: '80%', maxWidth: '1200px' }"
      @positive-click="handleAutoApprovalConfirm"
    >
      <div class="max-h-[70vh] space-y-4 overflow-y-auto">
        <!-- Subtitle -->
        <div class="mb-4 text-center text-sm text-gray-500">
          (免财务出款人工审核步骤，不含风控出款)
        </div>

        <!-- Approval Switch -->
        <div class="mb-6">
          <div class="mb-3">
            <span class="text-sm font-medium text-gray-700">免审出款开关</span>
            <span class="ml-1 text-red-500">*</span>
          </div>
          <n-radio-group v-model:value="autoApprovalForm.approvalSwitch">
            <n-space direction="vertical">
              <n-radio value="disabled">关闭免审自动出款</n-radio>
              <n-radio value="enabled">开启免审自动出款</n-radio>
            </n-space>
          </n-radio-group>
        </div>

        <!-- Conditional Content - Only show when enabled -->
        <div v-if="autoApprovalForm.approvalSwitch === 'enabled'">
          <!-- Reason Note Switch - Only show when auto-approval is enabled -->
          <div class="mb-6">
            <div class="mb-3">
              <span class="text-sm font-medium text-gray-700"
                >不免审原因备注开关</span
              >
              <span class="ml-1 text-red-500">*</span>
            </div>
            <n-radio-group v-model:value="autoApprovalForm.reasonNoteSwitch">
              <n-space direction="vertical">
                <n-radio value="disabled">关闭不免审原因订单备注</n-radio>
                <n-radio value="enabled">开启不免审原因订单备注</n-radio>
              </n-space>
            </n-radio-group>
          </div>

          <!-- 必须审核的情形 Section -->
          <n-card
            title="必须审核的情形（必审的级别高于免审，只要触发必审则必须通过）"
            size="small"
            class="mb-4"
            :bordered="true"
          >
            <!-- 必审会员层级 -->
            <div class="mb-6">
              <div class="mb-3 flex items-center gap-2">
                <span class="text-sm font-medium">必审会员层级</span>
                <n-checkbox
                  :checked="selectAllAutoApprovalRequiredTiers"
                  @update:checked="handleSelectAllAutoApprovalRequiredTiers"
                >
                  全选
                </n-checkbox>
              </div>
              <div class="grid grid-cols-4 gap-2">
                <n-checkbox
                  v-for="tier in memberTierOptions"
                  :key="tier.value"
                  :value="tier.value"
                  :checked="
                    autoApprovalForm.requiredAuditMemberTiers.includes(
                      tier.value,
                    )
                  "
                  @update:checked="
                    (checked) => {
                      if (checked) {
                        autoApprovalForm.requiredAuditMemberTiers.push(
                          tier.value,
                        );
                      } else {
                        const index =
                          autoApprovalForm.requiredAuditMemberTiers.indexOf(
                            tier.value,
                          );
                        if (index > -1)
                          autoApprovalForm.requiredAuditMemberTiers.splice(
                            index,
                            1,
                          );
                      }
                    }
                  "
                >
                  {{ tier.label }}
                </n-checkbox>
              </div>
            </div>

            <!-- 必审会员标签 -->
            <div class="mb-6">
              <div class="mb-3 flex items-center gap-2">
                <span class="text-sm font-medium">必审会员标签</span>
                <n-checkbox
                  :checked="selectAllAutoApprovalRequiredTags"
                  @update:checked="handleSelectAllAutoApprovalRequiredTags"
                >
                  全选
                </n-checkbox>
              </div>
              <div class="grid grid-cols-4 gap-2">
                <n-checkbox
                  v-for="tag in userTagOptions"
                  :key="tag.value"
                  :value="tag.value"
                  :checked="
                    autoApprovalForm.requiredAuditTags.includes(tag.value)
                  "
                  @update:checked="
                    (checked) => {
                      if (checked) {
                        autoApprovalForm.requiredAuditTags.push(tag.value);
                      } else {
                        const index =
                          autoApprovalForm.requiredAuditTags.indexOf(tag.value);
                        if (index > -1)
                          autoApprovalForm.requiredAuditTags.splice(index, 1);
                      }
                    }
                  "
                >
                  {{ tag.label }}
                </n-checkbox>
              </div>
            </div>

            <!-- 必审会员注册时长 -->
            <div class="mb-6">
              <div class="mb-3">
                <span class="text-sm font-medium">必审会员注册时长</span>
              </div>
              <n-radio-group
                v-model:value="
                  autoApprovalForm.requiredAuditRegistrationDuration
                "
              >
                <n-space>
                  <n-radio value="24h">24小时以内</n-radio>
                  <n-radio value="3d">3天以内</n-radio>
                  <n-radio value="7d">7天以内</n-radio>
                  <n-radio value="30d">30天以内</n-radio>
                  <n-radio value="disabled">关闭此条件</n-radio>
                </n-space>
              </n-radio-group>
            </div>

            <!-- 账号提现次数必审条件 -->
            <div class="mb-6">
              <div class="mb-3">
                <span class="text-sm font-medium">账号提现次数必审条件</span>
              </div>
              <n-space vertical>
                <n-checkbox
                  v-model:checked="
                    autoApprovalForm.withdrawalCountAudit.firstWithdrawal
                  "
                >
                  首次提现
                </n-checkbox>
                <div class="flex items-center gap-2">
                  <n-checkbox
                    v-model:checked="
                      autoApprovalForm.withdrawalCountAudit.firstNWithdrawals
                    "
                  >
                    前
                  </n-checkbox>
                  <n-input-number
                    v-model:value="
                      autoApprovalForm.withdrawalCountAudit.firstNValue
                    "
                    :min="1"
                    :max="100"
                    size="small"
                    style="width: 100px"
                  />
                  <span>次提现</span>
                </div>
              </n-space>
            </div>

            <!-- 打码和充提差额必审条件 -->
            <div class="mb-6">
              <div class="mb-3">
                <span class="text-sm font-medium">打码和充提差额必审条件</span>
              </div>
              <n-space vertical class="w-full">
                <div class="flex items-center gap-2">
                  <n-checkbox
                    v-model:checked="
                      autoApprovalForm.wageringAudit.wageringChargeEnabled
                    "
                  >
                    近
                  </n-checkbox>
                  <n-input-number
                    v-model:value="
                      autoApprovalForm.wageringAudit.wageringChargeHours
                    "
                    :min="0"
                    size="small"
                    style="width: 80px"
                  />
                  <span>天充提差额≤</span>
                  <n-input-number
                    v-model:value="
                      autoApprovalForm.wageringAudit.wageringChargeValue
                    "
                    :min="0"
                    size="small"
                    style="width: 120px"
                  />
                </div>
                <div class="flex items-center gap-2">
                  <n-checkbox
                    v-model:checked="
                      autoApprovalForm.wageringAudit.codeMultipleEnabled
                    "
                  >
                    近
                  </n-checkbox>
                  <n-input-number
                    v-model:value="
                      autoApprovalForm.wageringAudit.codeMultipleHours
                    "
                    :min="0"
                    size="small"
                    style="width: 80px"
                  />
                  <span>天打码倍数≤</span>
                  <n-input-number
                    v-model:value="
                      autoApprovalForm.wageringAudit.codeMultipleValue
                    "
                    :min="0"
                    :step="0.1"
                    size="small"
                    style="width: 120px"
                  />
                  <span>倍</span>
                </div>
                <div class="flex items-center gap-2">
                  <n-checkbox
                    v-model:checked="
                      autoApprovalForm.wageringAudit.claimRatioEnabled
                    "
                  >
                    累计充提差额比例≤
                  </n-checkbox>
                  <n-input-number
                    v-model:value="
                      autoApprovalForm.wageringAudit.claimRatioValue
                    "
                    :min="0"
                    :step="0.1"
                    size="small"
                    style="width: 120px"
                  />
                  <span>%，且至额≤</span>
                  <n-input-number
                    v-model:value="
                      autoApprovalForm.wageringAudit.claimTotalValue
                    "
                    :min="0"
                    size="small"
                    style="width: 120px"
                  />
                </div>
                <div class="flex items-center gap-2">
                  <n-checkbox
                    v-model:checked="
                      autoApprovalForm.wageringAudit.memberSuccessEnabled
                    "
                  >
                    会员已成功提现过
                  </n-checkbox>
                  <n-input-number
                    v-model:value="
                      autoApprovalForm.wageringAudit.memberSuccessValue
                    "
                    :min="0"
                    size="small"
                    style="width: 80px"
                  />
                  <span>次后，免以上3个条件</span>
                </div>
              </n-space>
            </div>

            <!-- PIX必须人工审核类型 -->
            <div class="mb-6">
              <div class="mb-3">
                <span class="text-sm font-medium">PIX必须人工审核类型</span>
              </div>
              <n-checkbox-group>
                <n-space>
                  <n-checkbox
                    v-model:checked="autoApprovalForm.pixManualAuditTypes.cpf"
                    >CPF</n-checkbox
                  >
                  <n-checkbox
                    v-model:checked="autoApprovalForm.pixManualAuditTypes.phone"
                    >PHONE</n-checkbox
                  >
                  <n-checkbox
                    v-model:checked="autoApprovalForm.pixManualAuditTypes.email"
                    >EMAIL</n-checkbox
                  >
                  <n-checkbox
                    v-model:checked="autoApprovalForm.pixManualAuditTypes.evp"
                    >EVP</n-checkbox
                  >
                  <n-checkbox
                    v-model:checked="autoApprovalForm.pixManualAuditTypes.cnpj"
                    >CNPJ</n-checkbox
                  >
                  <n-checkbox
                    v-model:checked="autoApprovalForm.pixManualAuditTypes.slry"
                    >SLRY</n-checkbox
                  >
                  <n-checkbox
                    v-model:checked="autoApprovalForm.pixManualAuditTypes.svgs"
                    >SVGS</n-checkbox
                  >
                  <n-checkbox
                    v-model:checked="autoApprovalForm.pixManualAuditTypes.tran"
                    >TRAN</n-checkbox
                  >
                  <n-checkbox
                    v-model:checked="autoApprovalForm.pixManualAuditTypes.cacc"
                    >CACC</n-checkbox
                  >
                </n-space>
              </n-checkbox-group>
            </div>

            <!-- 风控类型必审条件 -->
            <div class="mb-6">
              <div class="mb-3">
                <span class="text-sm font-medium">风控类型必审条件</span>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <!-- Left column -->
                <n-checkbox-group>
                  <n-space vertical>
                    <n-checkbox
                      v-model:checked="
                        autoApprovalForm.riskTypesRequireAudit
                          .depositDisputeNotProcessed
                      "
                    >
                      触发派奖监控风控规则且未处理
                    </n-checkbox>
                    <n-checkbox
                      v-model:checked="
                        autoApprovalForm.riskTypesRequireAudit
                          .uncompletedFirstDeposit
                      "
                    >
                      未完成首充
                    </n-checkbox>
                    <div class="flex items-center gap-2">
                      <n-checkbox
                        v-model:checked="
                          autoApprovalForm.riskTypesRequireAudit
                            .recentWithdrawalEnabled
                        "
                      >
                        近
                      </n-checkbox>
                      <n-input-number
                        v-model:value="
                          autoApprovalForm.riskTypesRequireAudit
                            .recentWithdrawalDays
                        "
                        :min="0"
                        size="small"
                        style="width: 80px"
                      />
                      <span>天被取消或被拒绝提现</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <n-checkbox
                        v-model:checked="
                          autoApprovalForm.riskTypesRequireAudit
                            .handMotionAddEnabled
                        "
                      >
                        近
                      </n-checkbox>
                      <n-input-number
                        v-model:value="
                          autoApprovalForm.riskTypesRequireAudit
                            .handMotionAddDays
                        "
                        :min="0"
                        size="small"
                        style="width: 80px"
                      />
                      <span>天手动加款</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <n-checkbox
                        v-model:checked="
                          autoApprovalForm.riskTypesRequireAudit
                            .systemRemoveRiskEnabled
                        "
                      >
                        近
                      </n-checkbox>
                      <n-input-number
                        v-model:value="
                          autoApprovalForm.riskTypesRequireAudit
                            .systemRemoveRiskDays
                        "
                        :min="0"
                        size="small"
                        style="width: 80px"
                      />
                      <span>天有系统解除稽核</span>
                    </div>
                  </n-space>
                </n-checkbox-group>

                <!-- Right column -->
                <n-checkbox-group>
                  <n-space vertical>
                    <n-checkbox
                      v-model:checked="
                        autoApprovalForm.riskTypesRequireAudit.cpfMismatch
                      "
                    >
                      充提CPF不一致
                    </n-checkbox>
                    <n-checkbox
                      v-model:checked="
                        autoApprovalForm.riskTypesRequireAudit.sameIPWithOthers
                      "
                    >
                      该提现IP有相同姓名的会员账号
                    </n-checkbox>
                    <div class="flex items-center gap-2">
                      <span>该提现设备有≥</span>
                      <n-input-number
                        v-model:value="
                          autoApprovalForm.riskTypesRequireAudit.sameDeviceCount
                        "
                        :min="0"
                        size="small"
                        style="width: 80px"
                      />
                      <span>个会员账号</span>
                    </div>
                  </n-space>
                </n-checkbox-group>
              </div>
            </div>

            <!-- 领取过优惠必审条件 -->
            <div class="mb-6">
              <div class="mb-3">
                <span class="text-sm font-medium">领取过优惠必审条件</span>
              </div>
              <div class="mb-3 flex items-center gap-2">
                <span>近</span>
                <n-input-number
                  v-model:value="autoApprovalForm.bonusClaimAudit.hours"
                  :min="0"
                  :max="720"
                  size="small"
                  style="width: 100px"
                />
                <span>小时，领取过以下指定优惠必须审核</span>
              </div>
              <div>
                <div class="mb-2 text-sm">领取指定优惠</div>
                <n-checkbox-group>
                  <n-space vertical>
                    <n-checkbox
                      v-model:checked="
                        autoApprovalForm.bonusClaimAudit.activityTypes.deposit
                      "
                    >
                      活动 > 充值活动
                    </n-checkbox>
                    <n-checkbox
                      v-model:checked="
                        autoApprovalForm.bonusClaimAudit.activityTypes.wagering
                      "
                    >
                      活动 > 打码活动
                    </n-checkbox>
                    <n-checkbox
                      v-model:checked="
                        autoApprovalForm.bonusClaimAudit.activityTypes.task
                      "
                    >
                      任务
                    </n-checkbox>
                    <n-checkbox
                      v-model:checked="
                        autoApprovalForm.bonusClaimAudit.activityTypes.rebate
                      "
                    >
                      返水
                    </n-checkbox>
                    <n-checkbox
                      v-model:checked="
                        autoApprovalForm.bonusClaimAudit.activityTypes.vipReward
                      "
                    >
                      VIP奖励
                    </n-checkbox>
                    <n-checkbox
                      v-model:checked="
                        autoApprovalForm.bonusClaimAudit.activityTypes.luckySpin
                      "
                    >
                      利恩宝
                    </n-checkbox>
                    <n-checkbox
                      v-model:checked="
                        autoApprovalForm.bonusClaimAudit.activityTypes
                          .luckyTransfer
                      "
                    >
                      幸运转盘
                    </n-checkbox>
                    <n-checkbox
                      v-model:checked="
                        autoApprovalForm.bonusClaimAudit.activityTypes
                          .publicFund
                      "
                    >
                      公积金
                    </n-checkbox>
                    <n-checkbox
                      v-model:checked="
                        autoApprovalForm.bonusClaimAudit.activityTypes
                          .firstDeposit
                      "
                    >
                      首盒抽奖
                    </n-checkbox>
                    <n-checkbox
                      v-model:checked="
                        autoApprovalForm.bonusClaimAudit.activityTypes
                          .fixedValue
                      "
                    >
                      充值优惠
                    </n-checkbox>
                    <n-checkbox
                      v-model:checked="
                        autoApprovalForm.bonusClaimAudit.activityTypes.silverBox
                      "
                    >
                      银商结算
                    </n-checkbox>
                  </n-space>
                </n-checkbox-group>
              </div>
            </div>

            <!-- 投注过以下游戏必审 -->
            <div class="mb-6">
              <div class="mb-3">
                <span class="text-sm font-medium"
                  >投注过以下游戏必审（建议勾选容易套利的游戏）</span
                >
              </div>
              <div class="mb-3 flex items-center gap-2">
                <span>近</span>
                <n-input-number
                  v-model:value="autoApprovalForm.mustAuditGames.hours"
                  :min="0"
                  :max="720"
                  size="small"
                  style="width: 100px"
                />
                <span>小时，内按过以下游戏必审</span>
              </div>
              <PlatformGameSelector
                v-model="autoApprovalForm.mustAuditGames.selectedPlatforms"
                :wagering-platform="
                  autoApprovalForm.mustAuditGames.platformSelection
                "
                @validation-change="handleAutoApprovalGamePlatformValidation"
              />
            </div>

            <!-- 其他必审条件 (Per Tier) -->
            <div class="mb-6">
              <div class="mb-3 flex items-center justify-between">
                <span class="text-sm font-medium">其他必审条件</span>
                <n-button
                  type="primary"
                  size="small"
                  @click="applyAutoApprovalOtherAuditToAllTiers"
                >
                  应用到全部层级
                </n-button>
              </div>
              <n-tabs v-model:value="currentAutoApprovalAuditTier" type="line">
                <n-tab-pane name="all" tab="全部层级">
                  <n-space vertical class="w-full">
                    <div class="flex items-center gap-2">
                      <span class="text-sm">近</span>
                      <n-input-number
                        v-model:value="
                          currentAutoApprovalAuditData.bonusClaimHours
                        "
                        :min="0"
                        size="small"
                        style="width: 100px"
                      />
                      <span class="text-sm">小时，优惠累计领取≥</span>
                      <n-input
                        v-model:value="
                          currentAutoApprovalAuditData.bonusClaimAmount
                        "
                        size="small"
                        style="width: 150px"
                        placeholder="请输入金额"
                      />
                      <span class="text-sm font-medium">必须审核</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-sm">近</span>
                      <n-input-number
                        v-model:value="
                          currentAutoApprovalAuditData.auditExemptHours
                        "
                        :min="0"
                        size="small"
                        style="width: 100px"
                      />
                      <span class="text-sm">小时，免审核金额≥</span>
                      <n-input
                        v-model:value="
                          currentAutoApprovalAuditData.auditExemptAmount
                        "
                        size="small"
                        style="width: 150px"
                        placeholder="请输入金额"
                      />
                      <span class="text-sm font-medium">必须审核</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-sm">单笔提现金额＞</span>
                      <n-input
                        v-model:value="
                          currentAutoApprovalAuditData.singleWithdrawAmount
                        "
                        size="small"
                        style="width: 150px"
                        placeholder="请输入金额"
                      />
                      <span class="text-sm font-medium">必须审核</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-sm">指定银行提现</span>
                      <n-select
                        v-model:value="
                          currentAutoApprovalAuditData.specifiedBank
                        "
                        size="small"
                        style="width: 200px"
                        placeholder="请选择银行"
                        :options="bankOptions"
                      />
                      <span class="text-sm font-medium">必须审核</span>
                    </div>
                  </n-space>
                </n-tab-pane>
                <n-tab-pane
                  v-for="tier in memberTierOptions"
                  :key="tier.value"
                  :name="tier.value"
                  :tab="tier.label"
                >
                  <n-space vertical class="w-full">
                    <!-- Same fields as "all" tier -->
                    <div class="flex items-center gap-2">
                      <span class="text-sm">近</span>
                      <n-input-number
                        v-model:value="
                          currentAutoApprovalAuditData.bonusClaimHours
                        "
                        :min="0"
                        size="small"
                        style="width: 100px"
                      />
                      <span class="text-sm">小时，优惠累计领取≥</span>
                      <n-input
                        v-model:value="
                          currentAutoApprovalAuditData.bonusClaimAmount
                        "
                        size="small"
                        style="width: 150px"
                        placeholder="请输入金额"
                      />
                      <span class="text-sm font-medium">必须审核</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-sm">近</span>
                      <n-input-number
                        v-model:value="
                          currentAutoApprovalAuditData.auditExemptHours
                        "
                        :min="0"
                        size="small"
                        style="width: 100px"
                      />
                      <span class="text-sm">小时，免审核金额≥</span>
                      <n-input
                        v-model:value="
                          currentAutoApprovalAuditData.auditExemptAmount
                        "
                        size="small"
                        style="width: 150px"
                        placeholder="请输入金额"
                      />
                      <span class="text-sm font-medium">必须审核</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-sm">单笔提现金额＞</span>
                      <n-input
                        v-model:value="
                          currentAutoApprovalAuditData.singleWithdrawAmount
                        "
                        size="small"
                        style="width: 150px"
                        placeholder="请输入金额"
                      />
                      <span class="text-sm font-medium">必须审核</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-sm">指定银行提现</span>
                      <n-select
                        v-model:value="
                          currentAutoApprovalAuditData.specifiedBank
                        "
                        size="small"
                        style="width: 200px"
                        placeholder="请选择银行"
                        :options="bankOptions"
                      />
                      <span class="text-sm font-medium">必须审核</span>
                    </div>
                  </n-space>
                </n-tab-pane>
              </n-tabs>
            </div>
          </n-card>

          <n-divider />

          <!-- 免审核的情形 Section -->
          <n-card
            title="免审核的情形(满足以下任意一个条件的会员都自动免审核，不填或填0表示不限制)"
            size="small"
            class="mb-4"
            :bordered="true"
          >
            <!-- 免审会员层级 -->
            <div class="mb-6">
              <div class="mb-3 flex items-center gap-2">
                <span class="text-sm font-medium">免审会员层级</span>
                <n-checkbox
                  :checked="selectAllAutoApprovalExemptTiers"
                  @update:checked="handleSelectAllAutoApprovalExemptTiers"
                >
                  全选
                </n-checkbox>
              </div>
              <div class="grid grid-cols-4 gap-2">
                <n-checkbox
                  v-for="tier in memberTierOptions"
                  :key="tier.value"
                  :value="tier.value"
                  :checked="
                    autoApprovalForm.exemptMemberTiers.includes(tier.value)
                  "
                  @update:checked="
                    (checked) => {
                      if (checked) {
                        autoApprovalForm.exemptMemberTiers.push(tier.value);
                      } else {
                        const index =
                          autoApprovalForm.exemptMemberTiers.indexOf(
                            tier.value,
                          );
                        if (index > -1)
                          autoApprovalForm.exemptMemberTiers.splice(index, 1);
                      }
                    }
                  "
                >
                  {{ tier.label }}
                </n-checkbox>
              </div>
            </div>

            <!-- 免审会员标签 -->
            <div class="mb-6">
              <div class="mb-3 flex items-center gap-2">
                <span class="text-sm font-medium">免审会员标签</span>
                <n-checkbox
                  :checked="selectAllAutoApprovalExemptTags"
                  @update:checked="handleSelectAllAutoApprovalExemptTags"
                >
                  全选
                </n-checkbox>
              </div>
              <div class="grid grid-cols-4 gap-2">
                <n-checkbox
                  v-for="tag in userTagOptions"
                  :key="tag.value"
                  :value="tag.value"
                  :checked="autoApprovalForm.exemptTags.includes(tag.value)"
                  @update:checked="
                    (checked) => {
                      if (checked) {
                        autoApprovalForm.exemptTags.push(tag.value);
                      } else {
                        const index = autoApprovalForm.exemptTags.indexOf(
                          tag.value,
                        );
                        if (index > -1)
                          autoApprovalForm.exemptTags.splice(index, 1);
                      }
                    }
                  "
                >
                  {{ tag.label }}
                </n-checkbox>
              </div>
            </div>

            <!-- 免审会员注册时长 -->
            <div class="mb-6">
              <div class="mb-3">
                <span class="text-sm font-medium">免审会员注册时长</span>
              </div>
              <n-radio-group
                v-model:value="autoApprovalForm.exemptRegistrationDuration"
              >
                <n-space>
                  <n-radio value="disabled">关闭此条件</n-radio>
                  <n-radio value="超24小时">超24小时</n-radio>
                  <n-radio value="超3天">超3天</n-radio>
                  <n-radio value="超7天">超7天</n-radio>
                  <n-radio value="超30天">超30天</n-radio>
                </n-space>
              </n-radio-group>
            </div>

            <!-- 免审提现方式 -->
            <div class="mb-6">
              <div class="mb-3">
                <span class="text-sm font-medium">免审提现方式</span>
              </div>
              <n-checkbox-group>
                <n-space>
                  <n-checkbox
                    v-model:checked="
                      autoApprovalForm.exemptWithdrawMethods
                        .firstThirdPartyWallet
                    "
                  >
                    首次使用三方钱包提现
                  </n-checkbox>
                  <n-checkbox
                    v-model:checked="
                      autoApprovalForm.exemptWithdrawMethods
                        .everyThirdPartyWallet
                    "
                  >
                    每次使用三方钱包提现
                  </n-checkbox>
                  <n-checkbox
                    v-model:checked="
                      autoApprovalForm.exemptWithdrawMethods.firstNoCoinWallet
                    "
                  >
                    首次使用NO钱包提现
                  </n-checkbox>
                  <n-checkbox
                    v-model:checked="
                      autoApprovalForm.exemptWithdrawMethods.everyNoCoinWallet
                    "
                  >
                    每次使用NO钱包提现
                  </n-checkbox>
                </n-space>
              </n-checkbox-group>
            </div>

            <!-- 免审提现次数 -->
            <div class="mb-6">
              <div class="mb-3">
                <span class="text-sm font-medium">免审提现次数</span>
              </div>
              <div class="flex items-center gap-2">
                <span>累计提现次数≥</span>
                <n-input-number
                  v-model:value="autoApprovalForm.exemptWithdrawCount.value"
                  :min="0"
                  size="small"
                  style="width: 100px"
                />
                <span>次</span>
              </div>
            </div>

            <!-- 其他免审条件 (Per Tier) -->
            <div class="mb-6">
              <div class="mb-3 flex items-center justify-between">
                <span class="text-sm font-medium">其他免审条件</span>
                <n-button
                  type="primary"
                  size="small"
                  @click="applyAutoApprovalOtherExemptToAllTiers"
                >
                  应用到全部层级
                </n-button>
              </div>
              <n-tabs v-model:value="currentAutoApprovalExemptTier" type="line">
                <n-tab-pane name="all" tab="全部层级">
                  <n-space vertical class="w-full">
                    <div class="flex items-center gap-2">
                      <span class="text-sm">近</span>
                      <n-input-number
                        v-model:value="currentAutoApprovalExemptData.claimHours"
                        :min="0"
                        size="small"
                        style="width: 100px"
                      />
                      <span class="text-sm">小时，累计领取＜</span>
                      <n-input
                        v-model:value="
                          currentAutoApprovalExemptData.claimAmount
                        "
                        size="small"
                        style="width: 150px"
                        placeholder="请输入金额"
                      />
                      <span class="text-sm font-medium">免审核的情形</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-sm">近</span>
                      <n-input-number
                        v-model:value="
                          currentAutoApprovalExemptData.exemptHours
                        "
                        :min="0"
                        size="small"
                        style="width: 100px"
                      />
                      <span class="text-sm">小时，免审核金额＜</span>
                      <n-input
                        v-model:value="
                          currentAutoApprovalExemptData.exemptAmount
                        "
                        size="small"
                        style="width: 150px"
                        placeholder="请输入金额"
                      />
                      <span class="text-sm font-medium">免审核的情形</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-sm">单笔提现金额≤</span>
                      <n-input
                        v-model:value="
                          currentAutoApprovalExemptData.singleWithdrawAmount
                        "
                        size="small"
                        style="width: 150px"
                        placeholder="请输入单笔提现金额"
                      />
                      <span class="text-sm font-medium">免审核的情形</span>
                    </div>
                  </n-space>
                </n-tab-pane>
                <n-tab-pane
                  v-for="tier in memberTierOptions"
                  :key="tier.value"
                  :name="tier.value"
                  :tab="tier.label"
                >
                  <n-space vertical class="w-full">
                    <!-- Same fields as "all" tier -->
                    <div class="flex items-center gap-2">
                      <span class="text-sm">近</span>
                      <n-input-number
                        v-model:value="currentAutoApprovalExemptData.claimHours"
                        :min="0"
                        size="small"
                        style="width: 100px"
                      />
                      <span class="text-sm">小时，累计领取＜</span>
                      <n-input
                        v-model:value="
                          currentAutoApprovalExemptData.claimAmount
                        "
                        size="small"
                        style="width: 150px"
                        placeholder="请输入金额"
                      />
                      <span class="text-sm font-medium">免审核的情形</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-sm">近</span>
                      <n-input-number
                        v-model:value="
                          currentAutoApprovalExemptData.exemptHours
                        "
                        :min="0"
                        size="small"
                        style="width: 100px"
                      />
                      <span class="text-sm">小时，免审核金额＜</span>
                      <n-input
                        v-model:value="
                          currentAutoApprovalExemptData.exemptAmount
                        "
                        size="small"
                        style="width: 150px"
                        placeholder="请输入金额"
                      />
                      <span class="text-sm font-medium">免审核的情形</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-sm">单笔提现金额≤</span>
                      <n-input
                        v-model:value="
                          currentAutoApprovalExemptData.singleWithdrawAmount
                        "
                        size="small"
                        style="width: 150px"
                        placeholder="请输入单笔提现金额"
                      />
                      <span class="text-sm font-medium">免审核的情形</span>
                    </div>
                  </n-space>
                </n-tab-pane>
              </n-tabs>
            </div>
          </n-card>

          <n-divider />

          <!-- 三方代付设置 Section -->
          <n-card
            title="三方代付设置"
            size="small"
            class="mb-4"
            :bordered="true"
          >
            <div class="mb-3 flex items-center justify-between">
              <span class="text-sm font-medium">代付模式</span>
              <n-button
                type="primary"
                size="small"
                @click="applyAutoApprovalThirdPartyToAllTiers"
              >
                应用到全部层级
              </n-button>
            </div>
            <n-tabs
              v-model:value="currentAutoApprovalThirdPartyTier"
              type="line"
            >
              <n-tab-pane name="all" tab="全部层级">
                <n-radio-group
                  v-model:value="currentAutoApprovalThirdPartyData.mode"
                >
                  <n-space vertical>
                    <n-radio value="auto">自动匹配三方代付</n-radio>
                    <n-radio value="manual">人工指定三方代付</n-radio>
                  </n-space>
                </n-radio-group>
              </n-tab-pane>
              <n-tab-pane
                v-for="tier in memberTierOptions"
                :key="tier.value"
                :name="tier.value"
                :tab="tier.label"
              >
                <n-radio-group
                  v-model:value="currentAutoApprovalThirdPartyData.mode"
                >
                  <n-space vertical>
                    <n-radio value="auto">自动匹配三方代付</n-radio>
                    <n-radio value="manual">人工指定三方代付</n-radio>
                  </n-space>
                </n-radio-group>
              </n-tab-pane>
            </n-tabs>
          </n-card>
        </div>
      </div>
    </n-modal>

    <!-- Risk Control Modal -->
    <n-modal
      v-model:show="showRiskControlModalState"
      preset="dialog"
      title="风控自动审核设置"
      positive-text="确认"
      negative-text="取消"
      :style="{ width: '80%', maxWidth: '1200px' }"
      @positive-click="handleRiskControlConfirm"
    >
      <div class="max-h-[70vh] space-y-4 overflow-y-auto">
        <!-- Risk Control Switch Radio Group -->
        <div>
          <div class="mb-3">
            <span class="text-sm font-medium text-gray-700"
              >是否需风控审核</span
            >
            <span class="ml-1 text-red-500">*</span>
          </div>
          <n-radio-group v-model:value="riskControlForm.riskControlSwitch">
            <n-space direction="vertical">
              <n-radio value="disabled">关闭风控审核</n-radio>
              <n-radio value="enabled">开启风控审核</n-radio>
            </n-space>
          </n-radio-group>
        </div>

        <!-- Expanded Form when Risk Control is Enabled -->
        <template v-if="riskControlForm.riskControlSwitch === 'enabled'">
          <n-divider />

          <!-- 关闭不免审风控原因订单审核 -->
          <div>
            <div class="mb-3">
              <span class="text-sm font-medium text-gray-700"
                >不免审风控原因订单审核</span
              >
            </div>
            <n-radio-group v-model:value="riskControlForm.noExemptRiskReview">
              <n-space direction="vertical">
                <n-radio value="enabled">关闭不免审风控原因订单审核</n-radio>
                <n-radio value="disabled">开启不免审风控原因订单审核</n-radio>
              </n-space>
            </n-radio-group>
          </div>

          <n-divider />

          <!-- Tabs for Must Audit vs Exempt -->
          <n-tabs type="line" animated>
            <n-tab-pane name="must-audit" tab="必审条件">
              <!-- Must Audit Content -->

              <!-- 必须风控审核的情形 -->
              <div>
                <div class="mb-3">
                  <span class="text-sm font-medium text-gray-700"
                    >必须风控审核的情形</span
                  >
                  <span class="ml-2 text-xs text-gray-500"
                    >(必审的级别高于免审，只要触发以下任意一条规则即必须风控审核)</span
                  >
                </div>

                <!-- 必审会员层级 -->
                <div class="mb-4">
                  <div class="mb-2 flex items-center gap-2">
                    <span class="text-sm">必审会员层级</span>
                    <n-checkbox
                      :checked="selectAllRequiredTiers"
                      @update:checked="handleSelectAllRequiredTiers"
                    >
                      全选
                    </n-checkbox>
                  </div>
                  <div class="grid grid-cols-4 gap-2">
                    <n-checkbox
                      v-for="tier in memberTierOptions"
                      :key="tier.value"
                      :value="tier.value"
                      :checked="
                        riskControlForm.requiredAuditMemberTiers.includes(
                          tier.value,
                        )
                      "
                      @update:checked="
                        (checked) => {
                          if (checked) {
                            riskControlForm.requiredAuditMemberTiers.push(
                              tier.value,
                            );
                          } else {
                            const index =
                              riskControlForm.requiredAuditMemberTiers.indexOf(
                                tier.value,
                              );
                            if (index > -1)
                              riskControlForm.requiredAuditMemberTiers.splice(
                                index,
                                1,
                              );
                          }
                        }
                      "
                    >
                      {{ tier.label }}
                    </n-checkbox>
                  </div>
                </div>

                <!-- 必审会员标签 -->
                <div class="mb-4">
                  <div class="mb-2 flex items-center gap-2">
                    <span class="text-sm">必审会员标签</span>
                    <n-checkbox
                      :checked="selectAllRequiredTags"
                      @update:checked="handleSelectAllRequiredTags"
                    >
                      全选
                    </n-checkbox>
                  </div>
                  <div class="grid grid-cols-4 gap-2">
                    <n-checkbox
                      v-for="tag in userTagOptions"
                      :key="tag.value"
                      :value="tag.value"
                      :checked="
                        riskControlForm.requiredAuditTags.includes(tag.value)
                      "
                      @update:checked="
                        (checked) => {
                          if (checked) {
                            riskControlForm.requiredAuditTags.push(tag.value);
                          } else {
                            const index =
                              riskControlForm.requiredAuditTags.indexOf(
                                tag.value,
                              );
                            if (index > -1)
                              riskControlForm.requiredAuditTags.splice(
                                index,
                                1,
                              );
                          }
                        }
                      "
                    >
                      {{ tag.label }}
                    </n-checkbox>
                  </div>
                </div>

                <!-- 必审会员注册时长 -->
                <div class="mb-4 rounded bg-gray-50 p-3">
                  <div class="mb-2 font-medium">必审会员注册时长</div>
                  <n-radio-group
                    v-model:value="riskControlForm.registrationDurationOption"
                  >
                    <n-space direction="vertical">
                      <n-radio value="disabled">关闭此条件</n-radio>
                      <n-radio value="24h">24小时以内</n-radio>
                      <n-radio value="3d">3天以内</n-radio>
                      <n-radio value="7d">7天以内</n-radio>
                      <n-radio value="30d">30天以内</n-radio>
                    </n-space>
                  </n-radio-group>
                </div>

                <!-- 账号提现次数必审条件 -->
                <div class="mb-4">
                  <div class="mb-2 font-medium">账号提现次数必审条件</div>
                  <div class="space-y-2">
                    <div class="flex items-center gap-2">
                      <n-checkbox
                        v-model:checked="
                          riskControlForm.withdrawalAuditTriggers
                            .firstTimeWithdraw
                        "
                      >
                        提现账号首次提现
                      </n-checkbox>
                    </div>

                    <div class="flex items-center gap-2">
                      <n-checkbox
                        v-model:checked="
                          riskControlForm.withdrawalAuditTriggers
                            .withdrawCountLessThan
                        "
                        >会员前</n-checkbox
                      >
                      <n-input-number
                        v-model:value="
                          riskControlForm.withdrawalAuditTriggers
                            .withdrawCountValue
                        "
                        :min="1"
                        size="small"
                        style="width: 80px"
                      />
                      <span>次提现必须审核</span>
                    </div>
                  </div>
                </div>

                <!-- 打码和充提差额必审条件 -->
                <div class="mb-4">
                  <div class="mb-2 font-medium">打码和充提差额必审条件</div>
                  <div class="space-y-2">
                    <div class="flex items-center gap-2">
                      <n-checkbox
                        v-model:checked="
                          riskControlForm.wageringAudit.chargeDiffEnabled
                        "
                        >近</n-checkbox
                      >
                      <n-input-number
                        v-model:value="
                          riskControlForm.wageringAudit.chargeDiffDays
                        "
                        :min="1"
                        size="small"
                        style="width: 80px"
                      />
                      <span>天充提差额≤</span>
                      <n-input-number
                        v-model:value="
                          riskControlForm.wageringAudit.chargeDiffValue
                        "
                        :min="0"
                        size="small"
                        style="width: 100px"
                      />
                    </div>

                    <div class="flex items-center gap-2">
                      <n-checkbox
                        v-model:checked="
                          riskControlForm.wageringAudit.codeMultipleEnabled
                        "
                        >近</n-checkbox
                      >
                      <n-input-number
                        v-model:value="
                          riskControlForm.wageringAudit.codeMultipleDays
                        "
                        :min="1"
                        size="small"
                        style="width: 80px"
                      />
                      <span>天打码倍数≤</span>
                      <n-input-number
                        v-model:value="
                          riskControlForm.wageringAudit.codeMultipleValue
                        "
                        :min="0"
                        :step="0.1"
                        size="small"
                        style="width: 80px"
                      />
                      <span>倍</span>
                    </div>

                    <div class="flex items-center gap-2">
                      <n-checkbox
                        v-model:checked="
                          riskControlForm.wageringAudit
                            .depositRefundRatioEnabled
                        "
                        >累计充提差额比例≤</n-checkbox
                      >
                      <n-input-number
                        v-model:value="
                          riskControlForm.wageringAudit.depositRefundRatioValue
                        "
                        :min="0"
                        :step="0.1"
                        size="small"
                        style="width: 80px"
                      />
                      <span>%，且差额≤</span>
                      <n-input-number
                        v-model:value="
                          riskControlForm.wageringAudit
                            .depositRefundRatioMinDeposit
                        "
                        :min="0"
                        :step="0.01"
                        size="small"
                        style="width: 100px"
                      />
                    </div>

                    <div class="flex items-center gap-2">
                      <n-checkbox
                        v-model:checked="
                          riskControlForm.wageringAudit
                            .successWithdrawCountAfterRefund
                        "
                        >会员已成功提现过</n-checkbox
                      >
                      <n-input-number
                        v-model:value="
                          riskControlForm.wageringAudit
                            .successWithdrawCountAfterRefundValue
                        "
                        :min="0"
                        size="small"
                        style="width: 80px"
                      />
                      <span>次后，免以上3个条件</span>
                    </div>
                  </div>
                </div>

                <!-- PIX必须人工审核类型 -->
                <div class="mb-4">
                  <div class="mb-2 font-medium">PIX必须人工审核类型</div>
                  <div class="grid grid-cols-3 gap-2">
                    <n-checkbox
                      v-model:checked="riskControlForm.pixManualAuditTypes.cpf"
                      >CPF</n-checkbox
                    >
                    <n-checkbox
                      v-model:checked="
                        riskControlForm.pixManualAuditTypes.phone
                      "
                      >PHONE</n-checkbox
                    >
                    <n-checkbox
                      v-model:checked="
                        riskControlForm.pixManualAuditTypes.email
                      "
                      >EMAIL</n-checkbox
                    >
                    <n-checkbox
                      v-model:checked="riskControlForm.pixManualAuditTypes.evp"
                      >EVP</n-checkbox
                    >
                    <n-checkbox
                      v-model:checked="riskControlForm.pixManualAuditTypes.cnpj"
                      >CNPJ</n-checkbox
                    >
                    <n-checkbox
                      v-model:checked="riskControlForm.pixManualAuditTypes.slry"
                      >SLRY</n-checkbox
                    >
                    <n-checkbox
                      v-model:checked="riskControlForm.pixManualAuditTypes.svgs"
                      >SVGS</n-checkbox
                    >
                    <n-checkbox
                      v-model:checked="riskControlForm.pixManualAuditTypes.cacc"
                      >CACC</n-checkbox
                    >
                    <n-checkbox
                      v-model:checked="riskControlForm.pixManualAuditTypes.tran"
                      >TRAN</n-checkbox
                    >
                  </div>
                </div>
              </div>

              <n-divider />

              <!-- 风控类型必审条件 -->
              <div class="mb-4">
                <div class="mb-3">
                  <span class="text-sm font-medium text-gray-700"
                    >风控类型必审条件</span
                  >
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <n-checkbox
                    v-model:checked="
                      riskControlForm.riskTypesRequireAudit
                        .depositDisputeNotProcessed
                    "
                  >
                    触发派奖监控风控规则且未处理
                  </n-checkbox>
                  <n-checkbox
                    v-model:checked="
                      riskControlForm.riskTypesRequireAudit.depositChargeback
                    "
                  >
                    触发对赌监控风控规则且未处理
                  </n-checkbox>
                  <n-checkbox
                    v-model:checked="
                      riskControlForm.riskTypesRequireAudit
                        .incompleteFirstCharge
                    "
                  >
                    未完成首充
                  </n-checkbox>
                  <n-checkbox
                    v-model:checked="
                      riskControlForm.riskTypesRequireAudit.cpfMismatch
                    "
                  >
                    充提CPF不一致
                  </n-checkbox>

                  <div class="flex items-center gap-2">
                    <n-checkbox
                      v-model:checked="
                        riskControlForm.riskTypesRequireAudit.canceledOrRejected
                      "
                      >近</n-checkbox
                    >
                    <n-input-number
                      v-model:value="
                        riskControlForm.riskTypesRequireAudit
                          .canceledOrRejectedDays
                      "
                      :min="1"
                      size="small"
                      style="width: 80px"
                    />
                    <span>天被取消或被拒绝提现</span>
                  </div>

                  <div class="flex items-center gap-2">
                    <n-checkbox
                      v-model:checked="
                        riskControlForm.riskTypesRequireAudit.ipSameNameAccount
                      "
                      >该提现IP有相同姓名的会员账号</n-checkbox
                    >
                  </div>

                  <div class="flex items-center gap-2">
                    <n-checkbox
                      v-model:checked="
                        riskControlForm.riskTypesRequireAudit.manualDeposit
                      "
                      >近</n-checkbox
                    >
                    <n-input-number
                      v-model:value="
                        riskControlForm.riskTypesRequireAudit.manualDepositDays
                      "
                      :min="1"
                      size="small"
                      style="width: 80px"
                    />
                    <span>天有手动加款</span>
                  </div>

                  <div class="flex items-center gap-2">
                    <n-checkbox
                      v-model:checked="
                        riskControlForm.riskTypesRequireAudit
                          .deviceMultipleAccounts
                      "
                      >该提现设备有≥</n-checkbox
                    >
                    <n-input-number
                      v-model:value="
                        riskControlForm.riskTypesRequireAudit
                          .deviceMultipleAccountsValue
                      "
                      :min="1"
                      size="small"
                      style="width: 80px"
                    />
                    <span>个会员账号</span>
                  </div>

                  <div class="flex items-center gap-2">
                    <n-checkbox
                      v-model:checked="
                        riskControlForm.riskTypesRequireAudit.systemResolved
                      "
                      >近</n-checkbox
                    >
                    <n-input-number
                      v-model:value="
                        riskControlForm.riskTypesRequireAudit.systemResolvedDays
                      "
                      :min="1"
                      size="small"
                      style="width: 80px"
                    />
                    <span>天有系统解除稽核</span>
                  </div>
                </div>
              </div>

              <n-divider />

              <!-- 领取过优惠必审条件 -->
              <div class="mb-4">
                <div class="mb-3">
                  <span class="text-sm font-medium text-gray-700"
                    >领取过优惠必审条件</span
                  >
                </div>

                <div class="space-y-3">
                  <div class="flex items-center gap-2">
                    <span class="text-sm">近</span>
                    <n-input-number
                      v-model:value="riskControlForm.bonusClaimAuditHours"
                      :min="1"
                      style="width: 100px"
                      size="small"
                    />
                    <span class="text-sm">小时，领取过以下指定优惠必审核</span>
                  </div>

                  <div class="pl-4">
                    <div class="mb-2 font-medium">领取指定优惠</div>

                    <!-- 活动 - Expandable -->
                    <div class="mb-2">
                      <div class="mb-2 flex items-center gap-2">
                        <n-icon
                          size="16"
                          class="cursor-pointer"
                          @click="
                            expandedBonusTypes.activity =
                              !expandedBonusTypes.activity
                          "
                        >
                          <svg
                            v-if="!expandedBonusTypes.activity"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="currentColor"
                              d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"
                            />
                          </svg>
                          <svg v-else viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"
                            />
                          </svg>
                        </n-icon>
                        <n-checkbox
                          v-model:checked="
                            riskControlForm.bonusClaimAudit.activity
                          "
                          >活动</n-checkbox
                        >
                      </div>

                      <div
                        v-if="expandedBonusTypes.activity"
                        class="space-y-1 pl-8"
                      >
                        <n-checkbox
                          v-model:checked="
                            riskControlForm.bonusClaimAudit.activityTypes
                              .recharge
                          "
                          >充值活动</n-checkbox
                        >
                        <br />
                        <n-checkbox
                          v-model:checked="
                            riskControlForm.bonusClaimAudit.activityTypes.wager
                          "
                          >打码活动</n-checkbox
                        >
                        <br />
                        <n-checkbox
                          v-model:checked="
                            riskControlForm.bonusClaimAudit.activityTypes.rescue
                          "
                          >救援金活动</n-checkbox
                        >
                        <br />
                        <n-checkbox
                          v-model:checked="
                            riskControlForm.bonusClaimAudit.activityTypes
                              .redPacket
                          "
                          >红包活动</n-checkbox
                        >
                        <br />
                        <n-checkbox
                          v-model:checked="
                            riskControlForm.bonusClaimAudit.activityTypes.signin
                          "
                          >签到活动</n-checkbox
                        >
                      </div>
                    </div>

                    <!-- Other promotion types -->
                    <div class="grid grid-cols-3 gap-2">
                      <n-checkbox
                        v-model:checked="riskControlForm.bonusClaimAudit.task"
                        >任务</n-checkbox
                      >
                      <n-checkbox
                        v-model:checked="riskControlForm.bonusClaimAudit.rebate"
                        >返水</n-checkbox
                      >
                      <n-checkbox
                        v-model:checked="
                          riskControlForm.bonusClaimAudit.cashback
                        "
                        >返佣</n-checkbox
                      >
                      <n-checkbox
                        v-model:checked="riskControlForm.bonusClaimAudit.vip"
                        >VIP奖励</n-checkbox
                      >
                      <n-checkbox
                        v-model:checked="
                          riskControlForm.bonusClaimAudit.interest
                        "
                        >利息宝</n-checkbox
                      >
                      <n-checkbox
                        v-model:checked="riskControlForm.bonusClaimAudit.lucky"
                        >幸运转盘</n-checkbox
                      >
                      <n-checkbox
                        v-model:checked="riskControlForm.bonusClaimAudit.fund"
                        >公积金</n-checkbox
                      >
                      <n-checkbox
                        v-model:checked="riskControlForm.bonusClaimAudit.raffle"
                        >首盒抽奖</n-checkbox
                      >
                      <n-checkbox
                        v-model:checked="
                          riskControlForm.bonusClaimAudit.recharge
                        "
                        >充值优惠</n-checkbox
                      >
                      <n-checkbox
                        v-model:checked="
                          riskControlForm.bonusClaimAudit.promotion
                        "
                        >推广活动</n-checkbox
                      >
                      <n-checkbox
                        v-model:checked="
                          riskControlForm.bonusClaimAudit.investment
                        "
                        >投资活动</n-checkbox
                      >
                      <n-checkbox
                        v-model:checked="
                          riskControlForm.bonusClaimAudit.investmentDeduction
                        "
                        >投资扣款</n-checkbox
                      >
                      <n-checkbox
                        v-model:checked="riskControlForm.bonusClaimAudit.agent"
                        >代理活动</n-checkbox
                      >
                      <n-checkbox
                        v-model:checked="
                          riskControlForm.bonusClaimAudit.settlement
                        "
                        >银商结算</n-checkbox
                      >
                    </div>
                  </div>
                </div>
              </div>

              <n-divider />

              <!-- 其他必审条件 -->
              <div class="mb-4">
                <!-- Tabs for Member Tiers -->
                <div class="mb-4">
                  <div class="mb-3 flex items-center justify-between">
                    <span class="font-medium">其他必审条件</span>
                    <n-button
                      type="primary"
                      size="small"
                      @click="applyOtherAuditToAllTiers"
                      >应用到全部层级</n-button
                    >
                  </div>

                  <!-- Tier Tabs -->
                  <div class="mb-4 flex gap-2 overflow-x-auto border-b">
                    <!-- All Tiers Tab -->
                    <div
                      class="cursor-pointer whitespace-nowrap px-4 py-2 hover:bg-gray-50"
                      :class="{
                        'border-b-2 border-blue-500':
                          selectedOtherAuditTab === 'all',
                      }"
                      @click="selectedOtherAuditTab = 'all'"
                    >
                      全部层级
                    </div>
                    <!-- Dynamic Member Tier Tabs -->
                    <div
                      v-for="tier in memberTierOptions"
                      :key="tier.value"
                      class="cursor-pointer whitespace-nowrap px-4 py-2 hover:bg-gray-50"
                      :class="{
                        'border-b-2 border-blue-500':
                          selectedOtherAuditTab === tier.value,
                      }"
                      @click="selectedOtherAuditTab = tier.value"
                    >
                      {{ tier.label }}
                    </div>
                  </div>

                  <div class="space-y-4">
                    <!-- Time-based conditions -->
                    <div class="flex items-center gap-2">
                      <span>近</span>
                      <n-input-number
                        v-model:value="currentOtherAuditData.bonusClaimHours"
                        :min="1"
                        size="small"
                        style="width: 100px"
                      />
                      <span>小时，优惠累计领取≥</span>
                      <n-input
                        v-model:value="currentOtherAuditData.bonusClaimAmount"
                        placeholder="请输入领取金额"
                        size="small"
                        style="width: 200px"
                      />
                      <span>必须审核</span>
                    </div>

                    <div class="flex items-center gap-2">
                      <span>近</span>
                      <n-input-number
                        v-model:value="currentOtherAuditData.auditExemptHours"
                        :min="1"
                        size="small"
                        style="width: 100px"
                      />
                      <span>小时，免审核金额≥</span>
                      <n-input
                        v-model:value="currentOtherAuditData.auditExemptAmount"
                        placeholder="请输入免审核金额"
                        size="small"
                        style="width: 200px"
                      />
                      <span>必须审核</span>
                    </div>

                    <div class="flex items-center gap-2">
                      <span>单笔提现金额＞</span>
                      <n-input
                        v-model:value="
                          currentOtherAuditData.singleWithdrawAmount
                        "
                        placeholder="请输入"
                        size="small"
                        style="width: 200px"
                      />
                      <span>必须审核</span>
                    </div>

                    <div class="flex items-center gap-2">
                      <span>指定银行提现</span>
                      <n-select
                        v-model:value="currentOtherAuditData.specifiedBank"
                        placeholder="请选择银行"
                        size="small"
                        style="width: 300px"
                        :options="[]"
                      />
                      <span>必须审核</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 投注以下游戏必审 -->
              <div class="mb-4">
                <div class="mb-3">
                  <span class="text-sm font-medium text-gray-700"
                    >投注以下游戏必审</span
                  >
                  <span class="ml-2 text-xs text-gray-500"
                    >(建议勾选高返现容易套利的游戏)</span
                  >
                </div>

                <div class="mb-4 flex items-center gap-2">
                  <span class="text-sm">近</span>
                  <n-input-number
                    v-model:value="riskControlForm.mustAuditGamesHours"
                    :min="0"
                    style="width: 100px"
                    size="small"
                  />
                  <span class="text-sm">小时，内投过以下游戏必审</span>
                </div>

                <!-- Game Platform Selection -->
                <div class="mb-4">
                  <n-radio-group
                    v-model:value="
                      riskControlForm.mustAuditGames.platformSelection
                    "
                  >
                    <n-space>
                      <n-radio value="all_platforms">全部平台</n-radio>
                      <n-radio value="specific_platforms">指定平台</n-radio>
                      <n-radio value="exclude_platforms">排除勾选平台</n-radio>
                    </n-space>
                  </n-radio-group>

                  <!-- Use PlatformGameSelector Component -->
                  <div class="mt-3">
                    <PlatformGameSelector
                      v-model="riskControlForm.mustAuditGames.selectedPlatforms"
                      :wagering-platform="
                        riskControlForm.mustAuditGames.platformSelection
                      "
                      @validation-change="handleGamePlatformValidation"
                    />
                  </div>
                </div>
              </div>
            </n-tab-pane>

            <!-- Exempt Tab -->
            <n-tab-pane name="exempt-audit" tab="免审条件">
              <!-- 免风控审核的情形 -->
              <div class="mb-4">
                <div class="mb-3 rounded bg-gray-100 p-2">
                  <span class="text-sm font-medium text-gray-700"
                    >免风控审核的情形</span
                  >
                  <span class="ml-2 text-xs text-gray-500"
                    >(满足以下任意一个条件的会员都自动免风控审核，不填或填0表示不限制)</span
                  >
                </div>

                <div class="space-y-4">
                  <!-- 免审会员层级 -->
                  <div>
                    <div class="mb-2 flex items-center gap-2">
                      <span class="text-sm font-medium">免审会员层级</span>
                      <n-checkbox
                        :checked="selectAllExemptTiers"
                        @update:checked="handleSelectAllExemptTiers"
                      >
                        全选
                      </n-checkbox>
                    </div>
                    <div class="grid grid-cols-4 gap-2">
                      <n-checkbox
                        v-for="tier in memberTierOptions"
                        :key="tier.value"
                        :value="tier.value"
                        :checked="
                          riskControlForm.exemptRiskReview.memberTiers.includes(
                            tier.value,
                          )
                        "
                        @update:checked="
                          (checked) => {
                            if (checked) {
                              riskControlForm.exemptRiskReview.memberTiers.push(
                                tier.value,
                              );
                            } else {
                              const index =
                                riskControlForm.exemptRiskReview.memberTiers.indexOf(
                                  tier.value,
                                );
                              if (index > -1)
                                riskControlForm.exemptRiskReview.memberTiers.splice(
                                  index,
                                  1,
                                );
                            }
                          }
                        "
                      >
                        {{ tier.label }}
                      </n-checkbox>
                    </div>
                  </div>

                  <!-- 免审会员标签 -->
                  <div>
                    <div class="mb-2 flex items-center gap-2">
                      <span class="text-sm font-medium">免审会员标签</span>
                      <n-checkbox
                        :checked="selectAllExemptTags"
                        @update:checked="handleSelectAllExemptTags"
                      >
                        全选
                      </n-checkbox>
                    </div>
                    <div class="grid grid-cols-4 gap-2">
                      <n-checkbox
                        v-for="tag in userTagOptions"
                        :key="tag.value"
                        :value="tag.value"
                        :checked="
                          riskControlForm.exemptRiskReview.tags.includes(
                            tag.value,
                          )
                        "
                        @update:checked="
                          (checked) => {
                            if (checked) {
                              riskControlForm.exemptRiskReview.tags.push(
                                tag.value,
                              );
                            } else {
                              const index =
                                riskControlForm.exemptRiskReview.tags.indexOf(
                                  tag.value,
                                );
                              if (index > -1)
                                riskControlForm.exemptRiskReview.tags.splice(
                                  index,
                                  1,
                                );
                            }
                          }
                        "
                      >
                        {{ tag.label }}
                      </n-checkbox>
                    </div>
                  </div>

                  <!-- 免审会员注册时长 -->
                  <div>
                    <div class="mb-2">
                      <span class="text-sm font-medium">免审会员注册时长</span>
                    </div>
                    <n-radio-group
                      v-model:value="
                        riskControlForm.exemptRiskReview
                          .registrationDurationType
                      "
                    >
                      <n-space>
                        <n-radio value="disabled">关闭此条件</n-radio>
                        <n-radio value="超24小时">超24小时</n-radio>
                        <n-radio value="超3天">超3天</n-radio>
                        <n-radio value="超7天">超7天</n-radio>
                        <n-radio value="超30天">超30天</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- 免审提现方式 -->
                  <div>
                    <div class="mb-2">
                      <span class="text-sm font-medium">免审提现方式</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                      <n-checkbox
                        v-model:checked="
                          riskControlForm.exemptRiskReview.withdrawMethods
                            .firstThirdParty
                        "
                      >
                        首次使用三方钱包提现
                      </n-checkbox>
                      <n-checkbox
                        v-model:checked="
                          riskControlForm.exemptRiskReview.withdrawMethods
                            .firstNoCoin
                        "
                      >
                        首次使用NO币包提现
                      </n-checkbox>
                      <n-checkbox
                        v-model:checked="
                          riskControlForm.exemptRiskReview.withdrawMethods
                            .everyThirdParty
                        "
                      >
                        每次使用三方钱包包提现
                      </n-checkbox>
                      <n-checkbox
                        v-model:checked="
                          riskControlForm.exemptRiskReview.withdrawMethods
                            .everyNoCoin
                        "
                      >
                        每次使用NO币包提现
                      </n-checkbox>
                    </div>
                  </div>

                  <!-- 免审提现次数 -->
                  <div>
                    <div class="mb-2">
                      <span class="text-sm font-medium">免审提现次数</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span>累计提现次数≥</span>
                      <n-input-number
                        v-model:value="
                          riskControlForm.exemptRiskReview.withdrawCount.value
                        "
                        :min="0"
                        style="width: 100px"
                        size="small"
                      />
                      <span>次</span>
                    </div>
                  </div>
                </div>
              </div>

              <n-divider />

              <!-- 其他免审条件 (Similar to 其他必审条件) -->
              <div class="mb-4">
                <!-- Tabs for Member Tiers -->
                <div class="mb-4">
                  <div class="mb-3 flex items-center justify-between">
                    <span class="font-medium">其他免审条件</span>
                    <n-button
                      type="primary"
                      size="small"
                      @click="applyOtherExemptToAllTiers"
                      >应用到全部层级</n-button
                    >
                  </div>

                  <!-- Tier Tabs -->
                  <div class="mb-4 flex gap-2 overflow-x-auto border-b">
                    <!-- All Tiers Tab -->
                    <div
                      class="cursor-pointer whitespace-nowrap px-4 py-2 hover:bg-gray-50"
                      :class="{
                        'border-b-2 border-blue-500':
                          selectedExemptTab === 'all',
                      }"
                      @click="selectedExemptTab = 'all'"
                    >
                      全部层级
                    </div>
                    <!-- Dynamic Member Tier Tabs -->
                    <div
                      v-for="tier in memberTierOptions"
                      :key="tier.value"
                      class="cursor-pointer whitespace-nowrap px-4 py-2 hover:bg-gray-50"
                      :class="{
                        'border-b-2 border-blue-500':
                          selectedExemptTab === tier.value,
                      }"
                      @click="selectedExemptTab = tier.value"
                    >
                      {{ tier.label }}
                    </div>
                  </div>

                  <div class="space-y-4">
                    <!-- Time-based conditions -->
                    <div class="flex items-center gap-2">
                      <span>近</span>
                      <n-input-number
                        v-model:value="currentOtherExemptData.claimHours"
                        :min="0"
                        size="small"
                        style="width: 100px"
                      />
                      <span>小时，累计领取＜</span>
                      <n-input
                        v-model:value="currentOtherExemptData.claimAmount"
                        placeholder="请输入领取金额"
                        size="small"
                        style="width: 200px"
                      />
                      <span>免审核的情形</span>
                    </div>

                    <div class="flex items-center gap-2">
                      <span class="text-red-500">*</span>
                      <span>近</span>
                      <n-input-number
                        v-model:value="currentOtherExemptData.exemptHours"
                        :min="0"
                        size="small"
                        style="width: 100px"
                      />
                      <span>小时，免审核金额＜</span>
                      <n-input
                        v-model:value="currentOtherExemptData.exemptAmount"
                        placeholder="请输入免审核金额"
                        size="small"
                        style="width: 200px"
                      />
                      <span>免审核的情形</span>
                    </div>

                    <div class="flex items-center gap-2">
                      <span class="text-red-500">*</span>
                      <span>单笔提现金额≤</span>
                      <n-input
                        v-model:value="
                          currentOtherExemptData.singleWithdrawAmount
                        "
                        placeholder="请输入单笔提现金额"
                        size="small"
                        style="width: 200px"
                      />
                      <span>免审核的情形</span>
                    </div>
                  </div>
                </div>
              </div>
            </n-tab-pane>
          </n-tabs>
        </template>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  onMounted,
  h,
  computed,
  defineAsyncComponent,
} from 'vue';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
const SmartDataGrid = defineAsyncComponent(
  () => import('../../components/smart/SmartDataGrid/index.vue'),
);
import {
  NButton,
  NCard,
  NInput,
  NInputNumber,
  NSelect,
  NFormItem,
  NModal,
  NAlert,
  NTag,
  NIcon,
  NSwitch,
  NTimePicker,
  NRadioGroup,
  NRadio,
  NSpace,
  NCheckbox,
  NDivider,
  NTabs,
  NTabPane,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import {
  ReloadOutline,
  SettingsOutline,
  RocketOutline,
  CheckmarkCircleOutline,
  CloseCircleOutline,
} from '@vicons/ionicons5';
import { withdrawalSettingsApi } from '#/api/finance/withdrawalSettings';
import { withdrawalConfigApi } from '#/api/system/systemConfig';
import { getMemberTiersApi } from '#/api/core/memberTier';
const WithdrawalChannelConfigModal = defineAsyncComponent(
  () => import('../../components/WithdrawalChannelConfigModal.vue'),
);
const WithdrawalSettingsModal = defineAsyncComponent(
  () => import('../../components/WithdrawalSettingsModal.vue'),
);
const ModifyWithdrawalMethodModal = defineAsyncComponent(
  () => import('../../components/ModifyWithdrawalMethodModal.vue'),
);
const PlatformGameSelector = defineAsyncComponent(
  () => import('#/components/activity/PlatformGameSelector.vue'),
);
import type { SelectedPlatform } from '#/api/activity/platformSelection';

interface WithdrawalChannel {
  id: string;
  type: string;
  name: string;
  allowMemberUse: boolean;
  supportTransfer: boolean;
  supportDigitalCurrency: boolean;
  allowWithdrawal: boolean;
  monitorCount: number;
  currency: string;
  singleLimit: string;
  fees: string;
  workingHours: [number, number] | null;
  dailyLimit: number;
  riskLevel: string;
  priority: number;
  apiUrl: string;
  merchantId: string;
  secretKey: string;
  callbackUrl: string;
  status: string;
  arrivalStatus: string;
  [key: string]: any;
}

const message = useMessage();
// Provide typed time range for NTimePicker to infer tuple model
const timeRangeType = 'timerange' as const;

// Data and state
const loading = ref(false);
const channelsData = ref<WithdrawalChannel[]>([]);
const showChannelConfigModal = ref(false);
const selectedChannelData = ref<WithdrawalChannel | null>(null);
const showSettingsModal = ref(false);
const showModifyMethodModal = ref(false);
const showCloseChannelModalState = ref(false);
const showAutoApprovalModalState = ref(false);
const showRiskControlModalState = ref(false);
const selectedMethodData = ref<WithdrawalChannel | null>(null);

// Close channel modal data
const closeChannelForm = reactive({
  channelSwitch: 'enabled', // 'enabled' or 'disabled'
});

// Auto approval modal data
const autoApprovalForm = reactive({
  approvalSwitch: 'disabled', // 'enabled' or 'disabled'
  reasonNoteSwitch: 'disabled', // 'enabled' or 'disabled' - 不免审原因备注开关

  // 必须审核的情形
  requiredAuditMemberTiers: [] as string[],
  requiredAuditTags: [] as string[],
  requiredAuditRegistrationDuration: 'disabled', // '24h' | '3d' | '7d' | '30d' | 'disabled'
  withdrawalCountAudit: {
    firstWithdrawal: false,
    firstNWithdrawals: false,
    firstNValue: 1,
  },
  wageringAudit: {
    wageringChargeEnabled: false,
    wageringChargeHours: 3,
    wageringChargeValue: 0,
    codeMultipleEnabled: false,
    codeMultipleHours: 3,
    codeMultipleValue: 1,
    claimRatioEnabled: false,
    claimRatioValue: 1,
    claimTotalValue: 100.0,
    memberSuccessEnabled: false,
    memberSuccessValue: 3,
  },
  pixManualAuditTypes: {
    cpf: false,
    phone: false,
    email: false,
    evp: false,
    cnpj: false,
    slry: false,
    svgs: false,
    tran: false,
    cacc: false,
  },
  riskTypesRequireAudit: {
    depositDisputeNotProcessed: false,
    uncompletedFirstDeposit: false,
    recentWithdrawalEnabled: false,
    recentWithdrawalDays: 3,
    handMotionAddEnabled: false,
    handMotionAddDays: 7,
    systemRemoveRiskEnabled: false,
    systemRemoveRiskDays: 3,
    cpfMismatch: false,
    sameIPWithOthers: false,
    sameDeviceCount: 3,
  },
  bonusClaimAudit: {
    enabled: false,
    hours: 24,
    activityTypes: {
      deposit: false,
      wagering: false,
      task: false,
      rebate: false,
      vipReward: false,
      luckySpin: false,
      luckyTransfer: false,
      publicFund: false,
      firstDeposit: false,
      fixedValue: false,
      silverBox: false,
    },
  },
  mustAuditGames: {
    enabled: false,
    hours: 0,
    platformSelection: 'specific_platforms' as
      | 'all_platforms'
      | 'specific_platforms',
    selectedPlatforms: [] as SelectedPlatform[],
  },
  otherAuditConditions: {} as Record<
    string,
    {
      bonusClaimHours: number;
      bonusClaimAmount: string;
      auditExemptHours: number;
      auditExemptAmount: string;
      singleWithdrawAmount: string;
      specifiedBank: string;
    }
  >,

  // 免审核的情形
  exemptMemberTiers: [] as string[],
  exemptTags: [] as string[],
  exemptRegistrationDuration: 'disabled', // '超24小时' | '超3天' | '超7天' | '超30天' | 'disabled'
  exemptWithdrawMethods: {
    firstThirdPartyWallet: false,
    everyThirdPartyWallet: false,
    firstNoCoinWallet: false,
    everyNoCoinWallet: false,
  },
  exemptWithdrawCount: {
    enabled: false,
    value: 1,
  },
  otherExemptConditions: {} as Record<
    string,
    {
      claimHours: number;
      claimAmount: string;
      exemptHours: number;
      exemptAmount: string;
      singleWithdrawAmount: string;
    }
  >,

  // 三方代付设置
  thirdPartyPayment: {} as Record<
    string,
    {
      mode: 'auto' | 'manual'; // 自动匹配三方代付 or 人工指定三方代付
    }
  >,
});

// Risk control modal data
const riskControlForm = reactive({
  riskControlSwitch: 'enabled', // 'enabled' or 'disabled'
  // 关闭不免审风控原因订单审核
  skipRiskReview: 'disabled', // 'enabled' or 'disabled'
  noExemptRiskReview: 'enabled', // 'enabled' or 'disabled'
  // 必须风控审核的情形
  requiredAuditMemberTiers: [] as string[], // Selected member tier IDs
  requiredAuditTags: [] as string[], // Selected tags
  registrationDurationOption: 'disabled', // 'disabled' or 'enabled'
  registrationDuration: 24, // hours
  registrationDurationType: '24h', // '24h', '3d', '7d', '30d'
  // 账号提现必审条件
  withdrawalAuditTriggers: {
    firstTimeWithdraw: false,
    withdrawCountLessThan: false,
    withdrawCountValue: 1,
    withdrawCountDays: 3,
    manualDeposit: false,
    manualDepositDays: 7,
    depositRefundRatio: false,
    depositRefundRatioValue: 1,
    depositRefundRatioMinDeposit: 100.0,
    successWithdrawCountAfterRefund: false,
    successWithdrawCountAfterRefundValue: 3,
  },
  // 打码和充提差额必审条件
  wageringAudit: {
    chargeDiffEnabled: false,
    chargeDiffDays: 3,
    chargeDiffValue: 0,
    codeMultipleEnabled: false,
    codeMultipleDays: 3,
    codeMultipleValue: 1,
    depositRefundRatioEnabled: false,
    depositRefundRatioValue: 1,
    depositRefundRatioMinDeposit: 100.0,
    successWithdrawCountAfterRefund: false,
    successWithdrawCountAfterRefundValue: 3,
  },
  // 风控类型必审条件
  riskTypesRequireAudit: {
    depositDisputeNotProcessed: false,
    depositChargeback: false,
    incompleteFirstCharge: false,
    systemResolutionManualDeposit: false,
    cpfMismatch: false,
    ipSameAccountCount: false,
    ipSameAccountCountValue: 3,
    canceledOrRejected: false,
    canceledOrRejectedDays: 3,
    ipSameNameAccount: false,
    manualDeposit: false,
    manualDepositDays: 7,
    deviceMultipleAccounts: false,
    deviceMultipleAccountsValue: 3,
    systemResolved: false,
    systemResolvedDays: 3,
  },
  // 领取过优惠必审条件
  bonusClaimAudit: {
    within24Hours: false,
    withinBonusCumulative: false,
    withinBonusCumulativeValue: 0,
    singleWithdrawAmount: false,
    singleWithdrawAmountValue: 0,
    designatedBank: false,
    selectedBanks: [] as string[],
    // Bonus types
    activity: false,
    activityTypes: {
      recharge: false,
      wager: false,
      rescue: false,
      redPacket: false,
      signin: false,
    },
    task: false,
    rebate: false,
    cashback: false,
    vip: false,
    interest: false,
    lucky: false,
    fund: false,
    raffle: false,
    recharge: false,
    promotion: false,
    investment: false,
    investmentDeduction: false,
    agent: false,
    settlement: false,
  },
  // 其他必审条件 (per tier)
  otherAuditConditions: {} as Record<
    string,
    {
      bonusClaimHours: number;
      bonusClaimAmount: string;
      auditExemptHours: number;
      auditExemptAmount: string;
      singleWithdrawAmount: string;
      specifiedBank: string;
    }
  >,
  // 其他免审条件 (per tier)
  otherExemptConditions: {} as Record<
    string,
    {
      claimHours: number;
      claimAmount: string;
      exemptHours: number;
      exemptAmount: string;
      singleWithdrawAmount: string;
    }
  >,
  // 免风控审核的情形
  exemptRiskReview: {
    memberTiers: [] as string[],
    tags: [] as string[],
    registrationDurationOption: 'disabled',
    registrationDuration: 24,
    registrationDurationType: 'disabled',
    withdrawMethods: {
      firstThirdParty: false,
      firstNoCoin: false,
      everyThirdParty: false,
      everyNoCoin: false,
    },
    withdrawCount: {
      enabled: false,
      value: 1,
    },
    singleWithdrawAmountMin: 0,
  },
  // 投注以下游戏必审
  mustAuditGames: {
    gameCategories: [] as string[],
    platformSelection: 'all_platforms' as
      | 'all_platforms'
      | 'specific_platforms'
      | 'exclude_platforms',
    selectedPlatforms: [] as SelectedPlatform[],
  },
  // 玩过以下游戏必审
  playedGamesAudit: {
    withinHours: 0,
    minBets: 0,
  },
  // PIX必须人工审核类型
  pixManualAuditTypes: {
    cpf: false,
    phone: false,
    email: false,
    evp: false,
    cnpj: false,
    slry: false,
    svgs: false,
    cacc: false,
    tran: false,
  },
  bonusClaimAuditHours: 24,
  mustAuditGamesHours: 0,
});

// Expandable bonus types state
const expandedBonusTypes = reactive({
  activity: false,
});

// Tab states
const selectedOtherAuditTab = ref('all');
const selectedExemptTab = ref('all');

// Initialize tier data helper
const initializeTierData = (tierId: string) => {
  if (!riskControlForm.otherAuditConditions[tierId]) {
    riskControlForm.otherAuditConditions[tierId] = {
      bonusClaimHours: 24,
      bonusClaimAmount: '',
      auditExemptHours: 24,
      auditExemptAmount: '',
      singleWithdrawAmount: '',
      specifiedBank: '',
    };
  }
  if (!riskControlForm.otherExemptConditions[tierId]) {
    riskControlForm.otherExemptConditions[tierId] = {
      claimHours: 0,
      claimAmount: '',
      exemptHours: 0,
      exemptAmount: '',
      singleWithdrawAmount: '',
    };
  }
};

// Computed properties for current tier data
const currentOtherAuditData = computed(() => {
  const tierId = selectedOtherAuditTab.value;
  initializeTierData(tierId);
  return (
    riskControlForm.otherAuditConditions[tierId] || {
      bonusClaimHours: 24,
      bonusClaimAmount: '',
      auditExemptHours: 24,
      auditExemptAmount: '',
      singleWithdrawAmount: '',
      specifiedBank: '',
    }
  );
});

const currentOtherExemptData = computed(() => {
  const tierId = selectedExemptTab.value;
  initializeTierData(tierId);
  return (
    riskControlForm.otherExemptConditions[tierId] || {
      claimHours: 0,
      claimAmount: '',
      exemptHours: 0,
      exemptAmount: '',
      singleWithdrawAmount: '',
    }
  );
});

// Computed properties for "全选" checkboxes
const selectAllRequiredTiers = computed(() => {
  return (
    memberTierOptions.value.length > 0 &&
    riskControlForm.requiredAuditMemberTiers.length ===
      memberTierOptions.value.length
  );
});

const selectAllRequiredTags = computed(() => {
  return (
    userTagOptions.length > 0 &&
    riskControlForm.requiredAuditTags.length === userTagOptions.length
  );
});

const selectAllExemptTiers = computed(() => {
  return (
    memberTierOptions.value.length > 0 &&
    riskControlForm.exemptRiskReview.memberTiers.length ===
      memberTierOptions.value.length
  );
});

const selectAllExemptTags = computed(() => {
  return (
    userTagOptions.length > 0 &&
    riskControlForm.exemptRiskReview.tags.length === userTagOptions.length
  );
});

// Handlers for "全选" checkboxes
const handleSelectAllRequiredTiers = (checked: boolean) => {
  if (checked) {
    riskControlForm.requiredAuditMemberTiers = memberTierOptions.value.map(
      (t) => t.value,
    );
  } else {
    riskControlForm.requiredAuditMemberTiers = [];
  }
};

const handleSelectAllRequiredTags = (checked: boolean) => {
  if (checked) {
    riskControlForm.requiredAuditTags = userTagOptions.map((t) => t.value);
  } else {
    riskControlForm.requiredAuditTags = [];
  }
};

const handleSelectAllExemptTiers = (checked: boolean) => {
  if (checked) {
    riskControlForm.exemptRiskReview.memberTiers = memberTierOptions.value.map(
      (t) => t.value,
    );
  } else {
    riskControlForm.exemptRiskReview.memberTiers = [];
  }
};

const handleSelectAllExemptTags = (checked: boolean) => {
  if (checked) {
    riskControlForm.exemptRiskReview.tags = userTagOptions.map((t) => t.value);
  } else {
    riskControlForm.exemptRiskReview.tags = [];
  }
};

// Game platform validation handler
const handleGamePlatformValidation = (isValid: boolean) => {
  // Handle platform selection validation
  if (!isValid) {
    console.warn('Game platform selection validation failed');
  }
};

// Apply to all tiers handlers
const applyOtherAuditToAllTiers = () => {
  const currentTierId = selectedOtherAuditTab.value;
  const currentData = riskControlForm.otherAuditConditions[currentTierId];

  if (!currentData) {
    message.warning('请先配置当前层级的条件');
    return;
  }

  // Apply to 'all' tier
  riskControlForm.otherAuditConditions['all'] = { ...currentData };

  // Apply to each member tier
  memberTierOptions.value.forEach((tier) => {
    riskControlForm.otherAuditConditions[tier.value] = { ...currentData };
  });

  message.success('已应用到全部层级');
};

const applyOtherExemptToAllTiers = () => {
  const currentTierId = selectedExemptTab.value;
  const currentData = riskControlForm.otherExemptConditions[currentTierId];

  if (!currentData) {
    message.warning('请先配置当前层级的条件');
    return;
  }

  // Apply to 'all' tier
  riskControlForm.otherExemptConditions['all'] = { ...currentData };

  // Apply to each member tier
  memberTierOptions.value.forEach((tier) => {
    riskControlForm.otherExemptConditions[tier.value] = { ...currentData };
  });

  message.success('已应用到全部层级');
};

// ============================================================================
// AUTO-APPROVAL MODAL - Computed Properties and Handlers
// ============================================================================

// Auto-Approval Computed Properties for "全选" checkboxes
const selectAllAutoApprovalRequiredTiers = computed(() => {
  return (
    memberTierOptions.value.length > 0 &&
    autoApprovalForm.requiredAuditMemberTiers.length ===
      memberTierOptions.value.length
  );
});

const selectAllAutoApprovalRequiredTags = computed(() => {
  return (
    userTagOptions.length > 0 &&
    autoApprovalForm.requiredAuditTags.length === userTagOptions.length
  );
});

const selectAllAutoApprovalExemptTiers = computed(() => {
  return (
    memberTierOptions.value.length > 0 &&
    autoApprovalForm.exemptMemberTiers.length === memberTierOptions.value.length
  );
});

const selectAllAutoApprovalExemptTags = computed(() => {
  return (
    userTagOptions.length > 0 &&
    autoApprovalForm.exemptTags.length === userTagOptions.length
  );
});

// Current tier data for "其他必审条件"
const currentAutoApprovalAuditTier = ref('all');
const currentAutoApprovalAuditData = computed(() => {
  const tierId = currentAutoApprovalAuditTier.value;
  if (!autoApprovalForm.otherAuditConditions[tierId]) {
    autoApprovalForm.otherAuditConditions[tierId] = {
      bonusClaimHours: 24,
      bonusClaimAmount: '',
      auditExemptHours: 24,
      auditExemptAmount: '',
      singleWithdrawAmount: '',
      specifiedBank: '',
    };
  }
  return autoApprovalForm.otherAuditConditions[tierId]!;
});

// Current tier data for "其他免审条件"
const currentAutoApprovalExemptTier = ref('all');
const currentAutoApprovalExemptData = computed(() => {
  const tierId = currentAutoApprovalExemptTier.value;
  if (!autoApprovalForm.otherExemptConditions[tierId]) {
    autoApprovalForm.otherExemptConditions[tierId] = {
      claimHours: 0,
      claimAmount: '',
      exemptHours: 0,
      exemptAmount: '',
      singleWithdrawAmount: '',
    };
  }
  return autoApprovalForm.otherExemptConditions[tierId]!;
});

// Current tier data for "三方代付设置"
const currentAutoApprovalThirdPartyTier = ref('all');
const currentAutoApprovalThirdPartyData = computed(() => {
  const tierId = currentAutoApprovalThirdPartyTier.value;
  if (!autoApprovalForm.thirdPartyPayment[tierId]) {
    autoApprovalForm.thirdPartyPayment[tierId] = {
      mode: 'auto',
    };
  }
  return autoApprovalForm.thirdPartyPayment[tierId]!;
});

// Bank options
const bankOptions = ref([
  { label: '请选择银行', value: '' },
  { label: 'Banco do Brasil', value: 'banco_do_brasil' },
  { label: 'Bradesco', value: 'bradesco' },
  { label: 'Caixa', value: 'caixa' },
  { label: 'Itaú', value: 'itau' },
  { label: 'Santander', value: 'santander' },
  { label: 'Nubank', value: 'nubank' },
  { label: 'Banco Inter', value: 'banco_inter' },
]);

// Auto-Approval Handlers
const handleSelectAllAutoApprovalRequiredTiers = (checked: boolean) => {
  if (checked) {
    autoApprovalForm.requiredAuditMemberTiers = memberTierOptions.value.map(
      (t: any) => t.value,
    );
  } else {
    autoApprovalForm.requiredAuditMemberTiers = [];
  }
};

const handleSelectAllAutoApprovalRequiredTags = (checked: boolean) => {
  if (checked) {
    autoApprovalForm.requiredAuditTags = userTagOptions.map(
      (t: any) => t.value,
    );
  } else {
    autoApprovalForm.requiredAuditTags = [];
  }
};

const handleSelectAllAutoApprovalExemptTiers = (checked: boolean) => {
  if (checked) {
    autoApprovalForm.exemptMemberTiers = memberTierOptions.value.map(
      (t: any) => t.value,
    );
  } else {
    autoApprovalForm.exemptMemberTiers = [];
  }
};

const handleSelectAllAutoApprovalExemptTags = (checked: boolean) => {
  if (checked) {
    autoApprovalForm.exemptTags = userTagOptions.map((t: any) => t.value);
  } else {
    autoApprovalForm.exemptTags = [];
  }
};

const handleAutoApprovalGamePlatformValidation = (isValid: boolean) => {
  console.log('Auto-approval game platform validation:', isValid);
};

const applyAutoApprovalOtherAuditToAllTiers = () => {
  const currentData = JSON.parse(
    JSON.stringify(currentAutoApprovalAuditData.value),
  );

  // Apply to 'all' tier
  autoApprovalForm.otherAuditConditions['all'] = currentData;

  // Apply to all individual tiers
  memberTierOptions.value.forEach((tier: any) => {
    autoApprovalForm.otherAuditConditions[tier.value] = JSON.parse(
      JSON.stringify(currentData),
    );
  });

  message.success('已应用到全部层级');
};

const applyAutoApprovalOtherExemptToAllTiers = () => {
  const currentData = JSON.parse(
    JSON.stringify(currentAutoApprovalExemptData.value),
  );

  // Apply to 'all' tier
  autoApprovalForm.otherExemptConditions['all'] = currentData;

  // Apply to all individual tiers
  memberTierOptions.value.forEach((tier: any) => {
    autoApprovalForm.otherExemptConditions[tier.value] = JSON.parse(
      JSON.stringify(currentData),
    );
  });

  message.success('已应用到全部层级');
};

const applyAutoApprovalThirdPartyToAllTiers = () => {
  const currentData = JSON.parse(
    JSON.stringify(currentAutoApprovalThirdPartyData.value),
  );

  // Apply to 'all' tier
  autoApprovalForm.thirdPartyPayment['all'] = currentData;

  // Apply to all individual tiers
  memberTierOptions.value.forEach((tier: any) => {
    autoApprovalForm.thirdPartyPayment[tier.value] = JSON.parse(
      JSON.stringify(currentData),
    );
  });

  message.success('已应用到全部层级');
};

// ============================================================================
// END AUTO-APPROVAL MODAL
// ============================================================================

// Modals
const channelModal = reactive({
  show: false,
  saving: false,
  isEdit: false,
  data: {
    id: '',
    type: '',
    name: '',
    allowMemberUse: false,
    supportTransfer: false,
    supportDigitalCurrency: false,
    allowWithdrawal: false,
    monitorCount: 4,
    currency: 'BRL',
    singleLimit: '0.00-20,000.00',
    fees: '0.00-20,000.00 0.00',
    workingHours: null as [number, number] | null,
    dailyLimit: 50000,
    riskLevel: 'medium',
    priority: 50,
    apiUrl: '',
    merchantId: '',
    secretKey: '',
    callbackUrl: '',
    status: 'active',
  } as WithdrawalChannel,
});

const bulkSettingsModal = reactive({
  show: false,
  workingHours: null as [number, number] | null,
  applyTo: 'enabled',
});

const autoRuleModal = reactive({
  show: false,
  data: {
    enabled: false,
    frequencyThreshold: 10,
    amountThreshold: 50000,
    failureRateThreshold: 30,
    monitorWindow: 15,
    action: 'pause',
    recoveryCondition: 'manual',
  },
});

// Options
const channelTypeOptions = [
  { label: 'PIX', value: 'PIX' },
  { label: '银行转账', value: 'BANK_TRANSFER' },
  { label: '数字钱包', value: 'DIGITAL_WALLET' },
  { label: '加密货币', value: 'CRYPTO' },
];

const currencyOptions = [
  { label: 'BRL', value: 'BRL' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
];

const riskLevelOptions = [
  { label: '低风险', value: 'low' },
  { label: '中风险', value: 'medium' },
  { label: '高风险', value: 'high' },
];

// Member tiers and tags for risk control
const memberTiers = ref<any[]>([]);
const memberTierOptions = computed(() => {
  return memberTiers.value.map((tier) => ({
    label: tier.tierName,
    value: tier.id.toString(),
  }));
});

// User tags options (static for now, could be fetched from API)
const userTagOptions = [{ label: '默认标签', value: 'default' }];

// Table columns based on screenshot
const columns: DataTableColumns<WithdrawalChannel> = [
  {
    title: '提现大类',
    key: 'type',
    width: 120,
    render: (row) => h('div', { class: 'text-center' }, row.type),
  },
  {
    title: '提现方式',
    key: 'name',
    width: 120,
    render: (row) => h('div', { class: 'text-center' }, row.name),
  },
  {
    title: '是否允许提现',
    key: 'allowWithdrawal',
    width: 140,
    render: (row) =>
      h('div', { class: 'text-center' }, [
        h(NSwitch, {
          value: row.allowWithdrawal,
          size: 'small',
          onUpdateValue: (value: boolean) =>
            updateChannelSetting(row.id, 'allowWithdrawal', value),
        }),
      ]),
  },
  {
    title: '是否允许会员用',
    key: 'allowMemberUse',
    width: 140,
    render: (row) =>
      h('div', { class: 'text-center' }, [
        h(NSwitch, {
          value: row.allowMemberUse,
          size: 'small',
          disabled: true, // Shown as disabled in screenshot
        }),
      ]),
  },
  {
    title: '是否支持转账现',
    key: 'supportTransfer',
    width: 140,
    render: (row) =>
      h('div', { class: 'text-center' }, [
        h(NSwitch, {
          value: row.supportTransfer,
          size: 'small',
          onUpdateValue: (value: boolean) =>
            updateChannelSetting(row.id, 'supportTransfer', value),
        }),
      ]),
  },
  {
    title: '是否支持数字货币提现',
    key: 'supportDigitalCurrency',
    width: 160,
    render: (row) =>
      h('div', { class: 'text-center' }, [
        h(NSwitch, {
          value: row.supportDigitalCurrency,
          size: 'small',
          onUpdateValue: (value: boolean) =>
            updateChannelSetting(row.id, 'supportDigitalCurrency', value),
        }),
      ]),
  },
  {
    title: '允许提现',
    key: 'withdrawalLimit',
    width: 100,
    render: (row) =>
      h('div', { class: 'text-center' }, [
        h(
          NTag,
          {
            type: row.allowWithdrawal ? 'success' : 'error',
            size: 'small',
          },
          { default: () => (row.allowWithdrawal ? '允许' : '禁止') },
        ),
      ]),
  },
  {
    title: '监号数量',
    key: 'monitorCount',
    width: 100,
    render: (row) => h('div', { class: 'text-center' }, row.monitorCount),
  },
  {
    title: '到账币种',
    key: 'currency',
    width: 100,
    render: (row) => h('div', { class: 'text-center' }, row.currency),
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render: (row) => {
      // Simple text with data attribute for identification
      return h(
        'span',
        {
          class: 'cursor-pointer text-blue-500 hover:text-blue-700 underline',
          'data-row-id': row.id,
          'data-action': 'modify',
        },
        '修改',
      );
    },
  },
  {
    title: '单笔限额',
    key: 'singleLimit',
    width: 160,
    render: (row) =>
      h('div', { class: 'text-center text-sm' }, [
        h('div', `全部层级${row.singleLimit}`),
      ]),
  },
  {
    title: '手续费',
    key: 'fees',
    width: 160,
    render: (row) => h('div', { class: 'text-center text-sm' }, row.fees),
  },
  {
    title: '到账',
    key: 'arrivalStatus',
    width: 100,
    render: (row) => {
      const statusMap: Record<string, string> = {
        instant: '即时',
        'T+0': 'T+0',
        'T+1': 'T+1',
        delayed: '延迟',
        manual: '人工',
      };
      return h(
        'div',
        { class: 'text-center' },
        statusMap[row.arrivalStatus] || row.arrivalStatus || '-',
      );
    },
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => {
      const statusMap: Record<string, string> = {
        active: '启用',
        paused: '暂停',
        inactive: '停用',
        disabled: '禁用',
      };
      const statusText = statusMap[row.status] || row.status || '-';
      return h(
        NTag,
        {
          type:
            row.status === 'active'
              ? 'success'
              : row.status === 'paused'
                ? 'warning'
                : 'default',
          size: 'small',
        },
        { default: () => statusText },
      );
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right',
    render: (row) =>
      h('div', { class: 'flex gap-1 justify-center' }, [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            onClick: () => editChannel(row),
          },
          { default: () => '修改' },
        ),
      ]),
  },
];

// SmartDataGrid event handlers
const handleRowClick = (row: any, _index: number, event?: Event) => {
  // Check if the click was on the modify button
  const target = event?.target as HTMLElement;
  if (target && target.dataset?.action === 'modify') {
    showModifyMethodModalForChannel(row);
  }
};

// Methods
const refreshData = async () => {
  loading.value = true;
  try {
    console.log('🔄 Refreshing withdrawal channels...');
    console.log('📡 Calling API: /third-party-channels');
    const response = await withdrawalSettingsApi.getWithdrawalChannels();

    if (response && response.success) {
      channelsData.value = response.data.channels || [];
      console.log('✅ Channels loaded:', channelsData.value.length);
    } else {
      console.warn('⚠️ API response indicates failure:', response);
      channelsData.value = [];
      message.warning(response?.message || '暂无通道数据');
    }
  } catch (error) {
    console.error('❌ Fetch channels error:', error);
    channelsData.value = [];
    message.error('获取数据失败');
  } finally {
    loading.value = false;
  }
};

const loadModalSettings = async () => {
  try {
    console.log('🔄 Loading modal settings...');
    const response = await withdrawalConfigApi.getModalSettings();

    if (response.success && response.data) {
      const data = response.data as any; // Type assertion for comprehensive settings

      // Update form data with loaded settings
      closeChannelForm.channelSwitch = data.channelSwitch || 'enabled';
      autoApprovalForm.approvalSwitch = data.autoApprovalSwitch || 'disabled';
      riskControlForm.riskControlSwitch = data.riskControlSwitch || 'enabled';

      // Load all risk control settings if they exist
      if (data.noExemptRiskReview !== undefined) {
        riskControlForm.noExemptRiskReview = data.noExemptRiskReview;
      }

      // Required audit conditions
      if (data.requiredAuditMemberTiers) {
        riskControlForm.requiredAuditMemberTiers =
          data.requiredAuditMemberTiers;
      }
      if (data.requiredAuditTags) {
        riskControlForm.requiredAuditTags = data.requiredAuditTags;
      }
      if (data.registrationDurationOption) {
        riskControlForm.registrationDurationOption =
          data.registrationDurationOption;
      }
      if (data.registrationDurationValue !== undefined) {
        riskControlForm.registrationDuration = data.registrationDurationValue;
      }

      // Withdrawal audit triggers
      if (data.withdrawalAuditTriggers) {
        Object.assign(
          riskControlForm.withdrawalAuditTriggers,
          data.withdrawalAuditTriggers,
        );
      }

      // Wagering and deposit difference audit conditions
      if (data.wageringAudit) {
        Object.assign(riskControlForm.wageringAudit, data.wageringAudit);
      }

      // PIX manual audit types
      if (data.pixManualAuditTypes) {
        Object.assign(
          riskControlForm.pixManualAuditTypes,
          data.pixManualAuditTypes,
        );
      }

      // Risk types require audit
      if (data.riskTypesRequireAudit) {
        Object.assign(
          riskControlForm.riskTypesRequireAudit,
          data.riskTypesRequireAudit,
        );
      }

      // Bonus claim audit
      if (data.bonusClaimAudit) {
        Object.assign(riskControlForm.bonusClaimAudit, data.bonusClaimAudit);
      }
      if (data.bonusClaimAuditHours !== undefined) {
        riskControlForm.bonusClaimAuditHours = data.bonusClaimAuditHours;
      }

      // Other audit conditions (per tier)
      if (data.otherAuditConditions) {
        riskControlForm.otherAuditConditions = data.otherAuditConditions;
      }

      // Exempt risk review
      if (data.exemptRiskReview) {
        if (data.exemptRiskReview.memberTiers) {
          riskControlForm.exemptRiskReview.memberTiers =
            data.exemptRiskReview.memberTiers;
        }
        if (data.exemptRiskReview.tags) {
          riskControlForm.exemptRiskReview.tags = data.exemptRiskReview.tags;
        }
        if (data.exemptRiskReview.registrationDurationType) {
          riskControlForm.exemptRiskReview.registrationDurationType =
            data.exemptRiskReview.registrationDurationType;
        }
        if (data.exemptRiskReview.withdrawMethods) {
          Object.assign(
            riskControlForm.exemptRiskReview.withdrawMethods,
            data.exemptRiskReview.withdrawMethods,
          );
        }
        if (data.exemptRiskReview.withdrawCount) {
          Object.assign(
            riskControlForm.exemptRiskReview.withdrawCount,
            data.exemptRiskReview.withdrawCount,
          );
        }
        if (data.exemptRiskReview.singleWithdrawAmountMin !== undefined) {
          riskControlForm.exemptRiskReview.singleWithdrawAmountMin =
            data.exemptRiskReview.singleWithdrawAmountMin;
        }
      }

      // Other exempt conditions (per tier)
      if (data.otherExemptConditions) {
        riskControlForm.otherExemptConditions = data.otherExemptConditions;
      }

      // Must audit games
      if (data.mustAuditGames) {
        if (data.mustAuditGames.hours !== undefined) {
          riskControlForm.mustAuditGamesHours = data.mustAuditGames.hours;
        }
        if (data.mustAuditGames.platformSelection) {
          riskControlForm.mustAuditGames.platformSelection =
            data.mustAuditGames.platformSelection;
        }
        if (data.mustAuditGames.selectedPlatforms) {
          riskControlForm.mustAuditGames.selectedPlatforms =
            data.mustAuditGames.selectedPlatforms;
        }
      }

      // Played games audit
      if (data.playedGamesAudit) {
        Object.assign(riskControlForm.playedGamesAudit, data.playedGamesAudit);
      }

      // ============================================================================
      // Load Auto-Approval Settings
      // ============================================================================
      if (data.autoApprovalSettings) {
        const autoSettings = data.autoApprovalSettings;

        // Load all auto-approval settings
        if (autoSettings.approvalSwitch !== undefined) {
          autoApprovalForm.approvalSwitch = autoSettings.approvalSwitch;
        }
        if (autoSettings.reasonNoteSwitch !== undefined) {
          autoApprovalForm.reasonNoteSwitch = autoSettings.reasonNoteSwitch;
        }
        if (autoSettings.requiredAuditMemberTiers) {
          autoApprovalForm.requiredAuditMemberTiers =
            autoSettings.requiredAuditMemberTiers;
        }
        if (autoSettings.requiredAuditTags) {
          autoApprovalForm.requiredAuditTags = autoSettings.requiredAuditTags;
        }
        if (autoSettings.requiredAuditRegistrationDuration) {
          autoApprovalForm.requiredAuditRegistrationDuration =
            autoSettings.requiredAuditRegistrationDuration;
        }
        if (autoSettings.withdrawalCountAudit) {
          Object.assign(
            autoApprovalForm.withdrawalCountAudit,
            autoSettings.withdrawalCountAudit,
          );
        }
        if (autoSettings.wageringAudit) {
          Object.assign(
            autoApprovalForm.wageringAudit,
            autoSettings.wageringAudit,
          );
        }
        if (autoSettings.pixManualAuditTypes) {
          Object.assign(
            autoApprovalForm.pixManualAuditTypes,
            autoSettings.pixManualAuditTypes,
          );
        }
        if (autoSettings.riskTypesRequireAudit) {
          Object.assign(
            autoApprovalForm.riskTypesRequireAudit,
            autoSettings.riskTypesRequireAudit,
          );
        }
        if (autoSettings.bonusClaimAudit) {
          Object.assign(
            autoApprovalForm.bonusClaimAudit,
            autoSettings.bonusClaimAudit,
          );
        }
        if (autoSettings.mustAuditGames) {
          Object.assign(
            autoApprovalForm.mustAuditGames,
            autoSettings.mustAuditGames,
          );
        }
        if (autoSettings.otherAuditConditions) {
          autoApprovalForm.otherAuditConditions =
            autoSettings.otherAuditConditions;
        }
        if (autoSettings.exemptMemberTiers) {
          autoApprovalForm.exemptMemberTiers = autoSettings.exemptMemberTiers;
        }
        if (autoSettings.exemptTags) {
          autoApprovalForm.exemptTags = autoSettings.exemptTags;
        }
        if (autoSettings.exemptRegistrationDuration) {
          autoApprovalForm.exemptRegistrationDuration =
            autoSettings.exemptRegistrationDuration;
        }
        if (autoSettings.exemptWithdrawMethods) {
          Object.assign(
            autoApprovalForm.exemptWithdrawMethods,
            autoSettings.exemptWithdrawMethods,
          );
        }
        if (autoSettings.exemptWithdrawCount) {
          Object.assign(
            autoApprovalForm.exemptWithdrawCount,
            autoSettings.exemptWithdrawCount,
          );
        }
        if (autoSettings.otherExemptConditions) {
          autoApprovalForm.otherExemptConditions =
            autoSettings.otherExemptConditions;
        }
        if (autoSettings.thirdPartyPayment) {
          autoApprovalForm.thirdPartyPayment = autoSettings.thirdPartyPayment;
        }

        console.log('✅ Auto-approval settings loaded:', autoSettings);
      }

      console.log('✅ Modal settings loaded:', data);
    } else {
      console.log('ℹ️ No existing modal settings found, using defaults');
      // Set defaults
      closeChannelForm.channelSwitch = 'enabled';
      autoApprovalForm.approvalSwitch = 'disabled';
      riskControlForm.riskControlSwitch = 'enabled';
    }
  } catch (error) {
    console.error('❌ Error loading modal settings:', error);
    // Use defaults on error
    closeChannelForm.channelSwitch = 'enabled';
    autoApprovalForm.approvalSwitch = 'disabled';
    riskControlForm.riskControlSwitch = 'enabled';
  }
};

const loadMemberTiers = async () => {
  try {
    console.log('🔄 Loading member tiers...');
    const response = await getMemberTiersApi({ isActive: true });

    if (response && response.list) {
      memberTiers.value = response.list;
      console.log('✅ Member tiers loaded:', memberTiers.value.length);
    } else {
      console.log('ℹ️ No member tiers found');
      memberTiers.value = [];
    }
  } catch (error) {
    console.error('❌ Error loading member tiers:', error);
    memberTiers.value = [];
  }
};

const updateChannelSetting = async (
  channelId: string,
  field: string,
  value: any,
) => {
  try {
    try {
      const response = await withdrawalSettingsApi.updateChannelSetting(
        channelId,
        { field, value },
      );

      if (response.success) {
        // Find and update the channel locally
        const channel = channelsData.value.find((c) => c.id === channelId);
        if (channel) {
          (channel as any)[field] = value;
        }
        message.success(`${field} 设置已更新`);
      } else {
        message.error(response.message || '设置更新失败');
      }
    } catch (apiError) {
      console.warn('API call failed:', apiError);
      // Update locally as fallback
      const channel = channelsData.value.find((c) => c.id === channelId);
      if (channel) {
        (channel as any)[field] = value;
      }
      message.success(`${field} 设置已更新 (本地)`);
    }
  } catch (error) {
    message.error('设置更新失败');
  }
};

// Function removed - replaced with new editChannel function

// Remove unused function declarations to satisfy lints
// const showAddChannelModal = () => { /* unused */ };
// const showBulkSettingsModal = () => { /* unused */ };

// Remove unused functions that are not referenced in template
// const showAutoRuleModal = () => {
//   autoRuleModal.show = true;
// };

// const showChannelModal = () => {
//   showAddChannelModal();
// };

// New configuration modals based on requirements
const showCloseChannelModal = () => {
  // Form already has current values loaded from database
  showCloseChannelModalState.value = true;
};

const handleCloseChannelConfirm = async () => {
  try {
    console.log(
      '📤 Saving channel switch setting:',
      closeChannelForm.channelSwitch,
    );

    // Save channel switch setting to database
    const response = await withdrawalConfigApi.saveModalSettings({
      channelSwitch: closeChannelForm.channelSwitch,
    });

    console.log('📥 Channel switch save response:', response);

    if (response.success) {
      const action =
        closeChannelForm.channelSwitch === 'enabled' ? '开启' : '关闭';
      message.success(`${action}提现通道成功`);
      showCloseChannelModalState.value = false;

      // Refresh data if needed - don't let refresh errors affect success message
      try {
        await refreshData();
      } catch (refreshError) {
        console.warn('⚠️ Failed to refresh data after save:', refreshError);
        // Don't show error - the save was successful
      }
    } else {
      console.error('❌ Save failed:', response);
      message.error(response.message || '保存设置失败');
    }
  } catch (error) {
    console.error('❌ Error saving channel switch:', error);
    message.error('操作失败，请重试');
  }
};

const showAutoApprovalModal = () => {
  // Form already has current values loaded from database
  showAutoApprovalModalState.value = true;
};

const handleAutoApprovalConfirm = async () => {
  try {
    console.log(
      '💾 Saving comprehensive auto-approval settings...',
      autoApprovalForm,
    );

    // Prepare comprehensive settings data
    const settingsData = {
      approvalSwitch: autoApprovalForm.approvalSwitch,
      reasonNoteSwitch: autoApprovalForm.reasonNoteSwitch,
      requiredAuditMemberTiers: autoApprovalForm.requiredAuditMemberTiers,
      requiredAuditTags: autoApprovalForm.requiredAuditTags,
      requiredAuditRegistrationDuration:
        autoApprovalForm.requiredAuditRegistrationDuration,
      withdrawalCountAudit: autoApprovalForm.withdrawalCountAudit,
      wageringAudit: autoApprovalForm.wageringAudit,
      pixManualAuditTypes: autoApprovalForm.pixManualAuditTypes,
      riskTypesRequireAudit: autoApprovalForm.riskTypesRequireAudit,
      bonusClaimAudit: autoApprovalForm.bonusClaimAudit,
      mustAuditGames: autoApprovalForm.mustAuditGames,
      otherAuditConditions: autoApprovalForm.otherAuditConditions,
      exemptMemberTiers: autoApprovalForm.exemptMemberTiers,
      exemptTags: autoApprovalForm.exemptTags,
      exemptRegistrationDuration: autoApprovalForm.exemptRegistrationDuration,
      exemptWithdrawMethods: autoApprovalForm.exemptWithdrawMethods,
      exemptWithdrawCount: autoApprovalForm.exemptWithdrawCount,
      otherExemptConditions: autoApprovalForm.otherExemptConditions,
      thirdPartyPayment: autoApprovalForm.thirdPartyPayment,
    };

    console.log(
      '📤 Sending comprehensive auto-approval data to server:',
      settingsData,
    );

    // For now, save using the modal settings API (we'll enhance the API later)
    const response = await withdrawalConfigApi.saveModalSettings({
      autoApprovalSwitch: autoApprovalForm.approvalSwitch,
      autoApprovalSettings: settingsData,
    });

    console.log('📥 Auto-approval server response:', response);

    if (response.success) {
      const action =
        autoApprovalForm.approvalSwitch === 'enabled' ? '开启' : '关闭';
      message.success(`${action}免人工审核自动出款设置保存成功`);
      showAutoApprovalModalState.value = false;

      // Refresh data if needed - don't let refresh errors affect success message
      try {
        await refreshData();
      } catch (refreshError) {
        console.warn('⚠️ Failed to refresh data after save:', refreshError);
        // Don't show error - the save was successful
      }
    } else {
      console.error('❌ Save failed:', response);
      message.error(response.message || '保存设置失败');
    }
  } catch (error) {
    console.error('❌ Error saving comprehensive auto approval:', error);
    message.error('操作失败，请重试');
  }
};

const showGeneralSettingsModal = () => {
  showSettingsModal.value = true;
};

const showModifyMethodModalForChannel = (channel: WithdrawalChannel) => {
  selectedMethodData.value = channel;
  showModifyMethodModal.value = true;
};

const showRiskControlModal = () => {
  // Form already has current values loaded from database
  showRiskControlModalState.value = true;
};

const handleRiskControlConfirm = async () => {
  try {
    console.log('💾 Saving risk control settings...', riskControlForm);

    // Prepare data for saving
    const settingsData = {
      // Basic settings
      riskControlSwitch: riskControlForm.riskControlSwitch,
      noExemptRiskReview: riskControlForm.noExemptRiskReview,

      // Required audit conditions
      requiredAuditMemberTiers: riskControlForm.requiredAuditMemberTiers,
      requiredAuditTags: riskControlForm.requiredAuditTags,
      registrationDurationOption: riskControlForm.registrationDurationOption,
      registrationDurationValue: riskControlForm.registrationDuration,

      // Withdrawal audit triggers
      withdrawalAuditTriggers: riskControlForm.withdrawalAuditTriggers,

      // Wagering and deposit difference audit conditions
      wageringAudit: riskControlForm.wageringAudit,

      // PIX manual audit types
      pixManualAuditTypes: riskControlForm.pixManualAuditTypes,

      // Risk types that require audit
      riskTypesRequireAudit: riskControlForm.riskTypesRequireAudit,

      // Bonus claim audit conditions
      bonusClaimAudit: riskControlForm.bonusClaimAudit,
      bonusClaimAuditHours: riskControlForm.bonusClaimAuditHours,

      // Other audit conditions (per tier)
      otherAuditConditions: riskControlForm.otherAuditConditions,

      // Exempt risk review conditions
      exemptRiskReview: {
        memberTiers: riskControlForm.exemptRiskReview.memberTiers,
        tags: riskControlForm.exemptRiskReview.tags,
        registrationDurationType:
          riskControlForm.exemptRiskReview.registrationDurationType,
        withdrawMethods: riskControlForm.exemptRiskReview.withdrawMethods,
        withdrawCount: riskControlForm.exemptRiskReview.withdrawCount,
        singleWithdrawAmountMin:
          riskControlForm.exemptRiskReview.singleWithdrawAmountMin,
      },

      // Other exempt conditions (per tier)
      otherExemptConditions: riskControlForm.otherExemptConditions,

      // Must audit games
      mustAuditGames: {
        hours: riskControlForm.mustAuditGamesHours,
        platformSelection: riskControlForm.mustAuditGames.platformSelection,
        selectedPlatforms: riskControlForm.mustAuditGames.selectedPlatforms,
      },

      // Played games audit
      playedGamesAudit: riskControlForm.playedGamesAudit,
    };

    console.log('📤 Sending data to server:', settingsData);

    // Save risk control settings to database
    const response = (await withdrawalConfigApi.saveModalSettings(
      settingsData,
    )) as any;

    console.log('📥 Server response:', response);

    if (response.success) {
      const action =
        riskControlForm.riskControlSwitch === 'enabled' ? '开启' : '关闭';
      message.success(`${action}风控审核设置保存成功`);
      showRiskControlModalState.value = false;

      // Refresh data if needed - don't let refresh errors affect success message
      try {
        await refreshData();
      } catch (refreshError) {
        console.warn('⚠️ Failed to refresh data after save:', refreshError);
        // Don't show error - the save was successful
      }
    } else {
      console.error('❌ Save failed:', response);
      message.error(response.message || '保存设置失败');
    }
  } catch (error) {
    console.error('❌ Error saving risk control:', error);
    message.error('操作失败，请重试');
  }
};

const onChannelTypeChange = (value: string) => {
  // Auto-fill name based on type
  channelModal.data.name = value;
};

const saveChannelSettings = async () => {
  try {
    channelModal.saving = true;

    try {
      const response = await withdrawalSettingsApi.saveWithdrawalChannel(
        channelModal.data,
      );

      if (response.success) {
        if (channelModal.isEdit) {
          // Update existing channel
          const index = channelsData.value.findIndex(
            (c) => c.id === channelModal.data.id,
          );
          if (index !== -1) {
            channelsData.value[index] = { ...response.data };
          }
          message.success('通道设置已更新');
        } else {
          // Add new channel
          channelsData.value.push({ ...response.data });
          message.success('新通道已添加');
        }

        channelModal.show = false;
      } else {
        message.error(response.message || '保存失败');
      }
    } catch (apiError) {
      console.warn('API call failed:', apiError);
      // Fallback to local update
      if (channelModal.isEdit) {
        const index = channelsData.value.findIndex(
          (c) => c.id === channelModal.data.id,
        );
        if (index !== -1) {
          channelsData.value[index] = { ...channelModal.data };
        }
        message.success('通道设置已更新 (本地)');
      } else {
        channelModal.data.id = Date.now().toString();
        channelsData.value.push({ ...channelModal.data });
        message.success('新通道已添加 (本地)');
      }
      channelModal.show = false;
    }
  } catch (error) {
    message.error('保存失败');
  } finally {
    channelModal.saving = false;
  }
};

const applyBulkSettings = async () => {
  try {
    if (!bulkSettingsModal.workingHours) {
      message.error('请选择工作时间');
      return;
    }

    // Apply to selected channels
    const targetChannels = channelsData.value.filter((channel) => {
      if (bulkSettingsModal.applyTo === 'all') return true;
      if (bulkSettingsModal.applyTo === 'enabled')
        return channel.allowWithdrawal;
      if (bulkSettingsModal.applyTo === 'pix') return channel.type === 'PIX';
      return false;
    });

    targetChannels.forEach((channel) => {
      channel.workingHours = bulkSettingsModal.workingHours;
    });

    // TODO: Implement actual API call

    message.success(`已为 ${targetChannels.length} 个通道设置工作时间`);
    bulkSettingsModal.show = false;
  } catch (error) {
    message.error('批量设置失败');
  }
};

const saveAutoRiskSettings = async () => {
  try {
    // TODO: Implement actual API call to save auto risk settings
    message.success('风险自动减控设置已保存');
    autoRuleModal.show = false;
  } catch (error) {
    message.error('设置保存失败');
  }
};

// Channel editing functions
const editChannel = (channelData: WithdrawalChannel) => {
  selectedChannelData.value = channelData;
  showChannelConfigModal.value = true;
};

const handleChannelConfigModalClose = () => {
  selectedChannelData.value = null;
  showChannelConfigModal.value = false;
};

// Lifecycle
onMounted(() => {
  refreshData();
  loadModalSettings();
  loadMemberTiers();
});
</script>

<style scoped>
.withdrawal-settings {
  padding: 16px;
}

.withdrawal-settings-table :deep(.n-data-table-td) {
  white-space: nowrap;
}

.withdrawal-settings-table :deep(.n-data-table-th) {
  background: #f8f9fa;
  font-weight: 600;
  text-align: center;
}

.withdrawal-settings-table :deep(.n-data-table-td) {
  text-align: center;
}
</style>
