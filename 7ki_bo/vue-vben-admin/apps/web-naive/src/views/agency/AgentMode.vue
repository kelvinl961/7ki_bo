<template>
  <Page>
    <n-card :title="$t('agency.agentMode.title')">
      <!-- 筛选表单（与 AgentList 布局一致） -->
      <n-form
        ref="filterFormRef"
        :model="filterForm"
        label-placement="left"
        inline
        size="small"
        label-width="90"
      >
        <n-form-item :label="$t('agency.agentMode.modeName')">
          <n-input
            v-model:value="filterForm.name"
            :placeholder="$t('agency.agentMode.enterModeName')"
            style="width: 220px"
          />
        </n-form-item>
        <n-form-item :label="$t('common.currency')">
          <n-select
            v-model:value="filterForm.currency"
            :options="currencyOptions"
            :placeholder="$t('agency.agentMode.selectCurrency')"
            style="width: 140px"
          />
        </n-form-item>
        <n-form-item :label="$t('agency.agentMode.modeSource')">
          <n-select
            v-model:value="filterForm.source"
            :options="sourceOptions"
            :placeholder="$t('agency.agentMode.selectSource')"
            style="width: 140px"
          />
        </n-form-item>
        <n-form-item :label="$t('agency.agentMode.enableStatus')">
          <n-select
            v-model:value="filterForm.isEnabled"
            :options="enabledOptions"
            :placeholder="$t('agency.agentMode.selectStatus')"
            style="width: 140px"
          />
        </n-form-item>
        <n-form-item :label="$t('agency.agentMode.isDefault')">
          <n-select
            v-model:value="filterForm.isDefault"
            :options="defaultOptions"
            :placeholder="$t('agency.agentMode.selectDefault')"
            style="width: 140px"
          />
        </n-form-item>
        <n-form-item :label="$t('agency.agentMode.settlementCycle')">
          <n-select
            v-model:value="filterForm.settlementCycle"
            :options="settlementCycleOptions"
            :placeholder="$t('agency.agentMode.selectCycle')"
            style="width: 140px"
          />
        </n-form-item>
        <n-form-item>
          <n-button size="small" type="primary" @click="handleSearch"
            >{{ $t('common.search') }}</n-button
          >
          <n-button size="small" style="margin-left: 8px" @click="handleReset"
            >{{ $t('common.reset') }}</n-button
          >
        </n-form-item>
      </n-form>

      <!-- 🚀 NEW: SmartDataGrid Component -->
      <SmartDataGrid
        :data="tableData"
        :columns="columns"
        :loading="loading"
        :pagination="paginationReactive"
        selectable
        :selected-keys="selectedKeys"
        row-key="id"
        :scroll-x="1600"
        @update:selected-keys="selectedKeys = $event"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
        @refresh="handleRefresh"
        @row-click="handleRowClick"
      >
        <template #actionBar="{ selectedCount, selectedRows }">
          <n-card :bordered="false" class="rounded-16px shadow-sm">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <!-- 主要操作按钮 - 4个按钮如截图 -->
                <div class="flex gap-2">
                  <n-button type="primary" @click="handleCreate">
                    {{ $t('agency.agentMode.addMode') }}
                  </n-button>
                  <n-button type="success" @click="handleAgentPublicSettings">
                    {{ $t('agency.agentMode.publicSettings') }}
                  </n-button>
                  <n-button type="warning" @click="handleNetProfitSettings">
                    {{ $t('agency.agentMode.netProfitSettings') }}
                  </n-button>
                  <n-button type="info" @click="handleAgentLevelSettings">
                    {{ $t('agency.agentMode.levelSettings') }}
                  </n-button>
                </div>

                <!-- 选择信息 -->
                <div class="text-sm text-gray-600">
                  {{ $t('agency.agentMode.selectedCount', [String(selectedCount), String(paginationReactive.total)]) }}
                </div>
              </div>

              <div class="flex gap-2">
                <!-- 批量操作 -->
                <n-button
                  v-if="selectedCount > 0"
                  type="warning"
                  size="small"
                  @click="handleBatchClose(selectedRows)"
                >
                  {{ $t('agency.agentMode.batchClose') }} ({{ selectedCount }})
                </n-button>

                <!-- 选择控制 -->
                <n-button size="small" @click="clearSelection"
                  >{{ $t('agency.agentMode.clearSelection') }}</n-button
                >
                <n-button size="small" @click="selectAll">{{ $t('common.selectAll') }}</n-button>
              </div>
            </div>
          </n-card>
        </template>
      </SmartDataGrid>
    </n-card>

    <!-- 新增/编辑 代理模式（按截图进行布局） -->
    <n-modal
      v-model:show="modalVisible"
      :title="isEdit ? $t('agency.agentMode.editMode') : $t('agency.agentMode.addModeTitle')"
      :mask-closable="false"
      preset="card"
      style="width: 1200px; max-width: 95vw"
    >
      <n-form :model="formData" label-placement="left" label-width="120">
        <n-grid :cols="2" :x-gap="24" :y-gap="16">
          <!-- 左侧表单 -->
          <n-gi>
            <n-form-item :label="$t('common.currency')" required>
              <n-select
                v-model:value="formData.currency"
                :options="currencyOptions"
                :placeholder="$t('agency.agentMode.selectCurrencyFull')"
              />
            </n-form-item>

            <n-form-item :label="$t('agency.agentMode.modeName')" required>
              <n-input
                v-model:value="formData.name"
                :placeholder="$t('agency.agentMode.enterModeNameFull')"
              />
            </n-form-item>

            <n-form-item :label="$t('agency.agentMode.applicationMethod')" required>
              <n-radio-group v-model:value="formData.applyMethod">
                <n-radio value="DIRECT">{{ $t('agency.agentMode.directEffect') }}</n-radio>
                <n-radio value="APPROVAL">{{ $t('agency.agentMode.needsApproval') }}</n-radio>
              </n-radio-group>
            </n-form-item>

            <n-form-item :label="$t('agency.agentMode.commissionLayers')" required>
              <n-select
                v-model:value="formData.calcLevels"
                :options="calcLevelsOptions"
                :placeholder="$t('common.pleaseSelect')"
              />
            </n-form-item>

            <n-form-item :label="$t('agency.agentMode.enableStatus')" required>
              <n-radio-group v-model:value="formData.isEnabled">
                <n-radio :value="true">{{ $t('common.enable') }}</n-radio>
                <n-radio :value="false">{{ $t('common.disable') }}</n-radio>
              </n-radio-group>
            </n-form-item>

            <n-form-item :label="$t('agency.agentMode.settlementCycle')" required>
              <n-radio-group v-model:value="formData.settlementCycle">
                <n-radio value="DAILY">{{ $t('agency.agentMode.daily') }}</n-radio>
                <n-radio value="WEEKLY">{{ $t('agency.agentMode.weekly') }}</n-radio>
                <n-radio value="MONTHLY">{{ $t('agency.agentMode.monthly') }}</n-radio>
                <n-radio value="CUSTOM">{{ $t('agency.agentMode.customSettlement') }}</n-radio>
              </n-radio-group>
            </n-form-item>

            <n-form-item :label="$t('agency.agentMode.commissionBasis')" required>
              <n-radio-group v-model:value="formData.commissionBasis">
                <n-radio value="VALID_BET">{{ $t('agency.agentMode.validBet') }}</n-radio>
                <n-radio value="NET_PROFIT">{{ $t('agency.agentMode.netProfit') }}</n-radio>
              </n-radio-group>
            </n-form-item>

            <n-form-item :label="$t('agency.agentMode.performanceScope')" required>
              <n-radio-group v-model:value="formData.performanceScope">
                <n-radio value="ALL">{{ $t('agency.agentMode.allIncludingInvalid') }}</n-radio>
                <n-radio value="VALID_ONLY">{{ $t('agency.agentMode.validOnly') }}</n-radio>
              </n-radio-group>
            </n-form-item>
          </n-gi>

          <!-- 右侧区域 -->
          <n-gi>
            <n-form-item :label="$t('agency.agentMode.tutorialSettings')">
              <n-radio-group v-model:value="formData.tutorialType">
                <n-radio value="CUSTOM">{{ $t('common.custom') }}</n-radio>
              </n-radio-group>
              <div style="margin-top: 8px">
                <n-select
                  v-model:value="formData.tutorialTemplate"
                  :options="tutorialOptions"
                  :placeholder="$t('agency.agentMode.selectTemplate')"
                />
                <n-button type="primary" style="margin-left: 8px">
                  <template #icon>
                    <span>+</span>
                  </template>
                </n-button>
              </div>
            </n-form-item>

            <!-- 富文本编辑器区域 -->
            <div
              style="
                margin-top: 16px;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                min-height: 300px;
              "
            >
              <div
                style="
                  border-bottom: 1px solid #e5e7eb;
                  padding: 8px 12px;
                  background-color: #f9fafb;
                "
              >
                <div
                  style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                  "
                >
                  <!-- 工具栏按钮 -->
                  <n-select
                    v-model:value="formData.fontSize"
                    :options="fontSizeOptions"
                    size="small"
                    style="width: 80px"
                  />
                  <n-select
                    v-model:value="formData.fontFamily"
                    :options="fontFamilyOptions"
                    size="small"
                    style="width: 100px"
                  />
                  <n-button size="small" text><strong>B</strong></n-button>
                  <n-button size="small" text><em>I</em></n-button>
                  <n-button size="small" text><u>U</u></n-button>
                  <n-button size="small" text><s>S</s></n-button>
                  <!-- 更多工具栏按钮... -->
                </div>
              </div>
              <div style="padding: 12px; min-height: 200px">
                <n-input
                  v-model:value="formData.tutorialContent"
                  type="textarea"
                  placeholder="p"
                  :bordered="false"
                  :autosize="{ minRows: 8, maxRows: 12 }"
                />
              </div>
              <div
                style="
                  border-top: 1px solid #e5e7eb;
                  padding: 8px 12px;
                  text-align: right;
                  font-size: 12px;
                  color: #666;
                "
              >
                0/255
              </div>
            </div>

            <n-form-item :label="$t('common.remark')" style="margin-top: 16px">
              <n-input
                v-model:value="formData.remark"
                type="textarea"
                :placeholder="$t('common.pleaseEnter') + $t('common.remark')"
              />
            </n-form-item>
          </n-gi>
        </n-grid>

        <n-divider title-placement="left">{{ $t('agency.agentMode.tierRebate') }}</n-divider>
        <n-tabs type="line">
          <n-tab-pane
            v-for="gt in gameTypes"
            :key="gt.value"
            :name="gt.value"
            :tab="gt.label"
          >
            <div class="mb-2 flex items-center justify-between">
              <div class="text-sm text-gray-500">
                {{ $t('agency.agentMode.currentTiers', [gt.label, String(tierMap[gt.value]?.length || 0)]) }}
              </div>
              <div class="flex items-center">
                <n-button
                  size="small"
                  @click="copyConfigToAll(gt.value)"
                  tertiary
                  type="info"
                  :disabled="
                    !tierMap[gt.value] || tierMap[gt.value].length === 0
                  "
                >
                  {{ $t('agency.agentMode.copyToAll') }}
                </n-button>
                <n-button
                  size="small"
                  style="margin-left: 8px"
                  @click="addTier(gt.value)"
                  type="primary"
                  >{{ $t('agency.agentMode.addTier') }}</n-button
                >
              </div>
            </div>
            <n-table size="small" bordered>
              <thead>
                <tr>
                  <th style="width: 160px">{{ $t('agency.agentMode.validMembers') }}</th>
                  <th style="width: 200px">{{ $t('agency.agentMode.validBetAmount') }}</th>
                  <th style="width: 160px">{{ $t('agency.agentMode.rebateRate') }}</th>
                  <th style="width: 160px">{{ $t('agency.agentMode.rebateAmount') }}</th>
                  <th style="width: 120px">{{ $t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in tierMap[gt.value]" :key="row.key">
                  <td>
                    <n-input-number
                      v-model:value="row.minUsers"
                      :min="0"
                      placeholder="0"
                      style="width: 140px"
                    />
                  </td>
                  <td>
                    <n-input-number
                      v-model:value="row.validBet"
                      :min="0"
                      :precision="2"
                      placeholder="0.00"
                      style="width: 180px"
                      @update:value="() => calculateRebateAmount(row)"
                    />
                  </td>
                  <td>
                    <div class="flex items-center">
                      <n-input-number
                        v-model:value="row.rate"
                        :min="0"
                        :max="100"
                        :precision="2"
                        placeholder="0.00"
                        style="width: 120px"
                        @update:value="() => calculateRebateAmount(row)"
                      />
                      <span style="margin-left: 6px">%</span>
                    </div>
                  </td>
                  <td>
                    <n-input-number
                      v-model:value="row.amount"
                      :min="0"
                      :precision="2"
                      placeholder="0.00"
                      style="width: 140px"
                      disabled
                    />
                  </td>
                  <td>
                    <n-space>
                      <n-button
                        size="tiny"
                        text
                        type="primary"
                        @click="addTier(gt.value, idx)"
                        >{{ $t('common.create') }}</n-button
                      >
                      <n-button
                        size="tiny"
                        text
                        type="error"
                        @click="removeTier(gt.value, idx)"
                        >{{ $t('common.delete') }}</n-button
                      >
                    </n-space>
                  </td>
                </tr>
              </tbody>
            </n-table>
          </n-tab-pane>
        </n-tabs>
      </n-form>

      <template #action>
        <n-button @click="modalVisible = false">{{ $t('common.cancel') }}</n-button>
        <n-button type="primary" :loading="submitLoading" @click="handleConfirm"
          >{{ $t('common.confirm') }}</n-button
        >
      </template>
    </n-modal>

    <!-- 代理等级设置模态框 -->
    <n-modal
      v-model:show="agentLevelModalVisible"
      :title="$t('agency.agentMode.levelSettings')"
      :mask-closable="false"
      preset="card"
      style="width: 1200px; max-width: 95vw"
    >
      <div class="agent-level-settings">
        <div class="mb-4 flex items-center justify-between">
          <div class="flex gap-2">
            <n-button
              type="success"
              size="small"
              @click="handleAutoUpgradeAgents"
            >
              {{ $t('agency.agentMode.autoUpgradeAgent') }}
            </n-button>
          </div>
          <div class="flex gap-2">
            <n-button type="primary" size="small" @click="handleAddAgentLevel"
              >{{ $t('common.create') }}</n-button
            >
            <n-button
              type="warning"
              size="small"
              @click="handleBatchSaveAgentLevels"
              >{{ $t('agency.agentMode.batchSave') }}</n-button
            >
          </div>
        </div>

        <n-table size="small" bordered :loading="agentLevelLoading">
          <thead>
            <tr>
              <th style="width: 80px; text-align: center">{{ $t('agency.agentMode.icon') }}</th>
              <th style="width: 120px">{{ $t('agency.agentMode.levelName') }}</th>
              <th style="width: 200px">{{ $t('agency.agentMode.promotionCondition') }}</th>
              <th style="width: 300px">{{ $t('common.description') }}</th>
              <th style="width: 100px; text-align: center">{{ $t('agency.agentMode.currentCount') }}</th>
              <th style="width: 150px; text-align: center">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="level in agentLevels" :key="level.id" class="level-row">
              <td style="text-align: center">
                <div
                  class="level-icon"
                  :style="{
                    backgroundColor: level.iconColor,
                    color: 'white',
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    margin: '0 auto',
                  }"
                >
                  {{ level.icon }}
                </div>
              </td>
              <td>
                <n-input v-model:value="level.name" size="small" />
              </td>
              <td style="text-align: center">
                <n-input-number
                  v-model:value="level.promotionCondition"
                  size="small"
                  :min="0"
                  style="width: 100%"
                />
              </td>
              <td>
                <n-input v-model:value="level.description" size="small" />
              </td>
              <td style="text-align: center; color: #1890ff; font-weight: 500">
                {{ level.userCount }}
              </td>
              <td style="text-align: center">
                <div class="flex justify-center gap-1">
                  <n-button
                    size="tiny"
                    type="error"
                    @click="handleCancelAgentLevel(level.id)"
                  >
                    {{ $t('common.cancel') }}
                  </n-button>
                  <n-button
                    size="tiny"
                    type="success"
                    @click="handleConfirmAgentLevel(level)"
                  >
                    {{ $t('common.confirm') }}
                  </n-button>
                  <n-button
                    size="tiny"
                    type="primary"
                    @click="handleEditAgentLevel(level)"
                  >
                    {{ $t('common.modify') }}
                  </n-button>
                </div>
              </td>
            </tr>
          </tbody>
        </n-table>

        <div class="mt-6 flex justify-center">
          <n-button
            type="primary"
            size="large"
            @click="agentLevelModalVisible = false"
          >
            {{ $t('common.close') }}
          </n-button>
        </div>
      </div>
    </n-modal>

    <!-- 编辑代理等级模态框 -->
    <n-modal
      v-model:show="agentLevelEditModalVisible"
      :title="$t('agency.agentMode.editLevel')"
      :mask-closable="false"
      preset="card"
      style="width: 600px; max-width: 90vw"
    >
      <div v-if="editingAgentLevel">
        <n-form
          :model="editingAgentLevel"
          label-placement="left"
          label-width="120px"
        >
          <n-form-item :label="$t('agency.agentMode.levelNameLabel')">
            <n-input v-model:value="editingAgentLevel.name" />
          </n-form-item>
          <n-form-item :label="$t('agency.agentMode.promotionConditionLabel')">
            <n-input-number
              v-model:value="editingAgentLevel.promotionCondition"
              :min="0"
              style="width: 100%"
            />
          </n-form-item>
          <n-form-item :label="$t('common.description')">
            <n-input
              v-model:value="editingAgentLevel.description"
              type="textarea"
              :rows="3"
            />
          </n-form-item>
          <n-form-item :label="$t('agency.agentMode.iconColor')">
            <n-input v-model:value="editingAgentLevel.iconColor" />
          </n-form-item>
        </n-form>

        <div class="mt-4 flex justify-end gap-2">
          <n-button @click="agentLevelEditModalVisible = false">{{ $t('common.cancel') }}</n-button>
          <n-button
            type="primary"
            @click="
              editingAgentLevel?.id
                ? handleSaveAgentLevel()
                : handleCreateAgentLevel()
            "
          >
            {{ editingAgentLevel?.id ? $t('common.save') : $t('common.create') }}
          </n-button>
        </div>
      </div>
    </n-modal>

    <!-- 净盈利设置模态框 -->
    <n-modal
      v-model:show="netProfitModalVisible"
      :title="$t('agency.agentMode.netProfitSettings')"
      :mask-closable="false"
      preset="card"
      style="width: 600px; max-width: 90vw"
    >
      <div class="net-profit-settings">
        <div
          class="section-title"
          style="margin-bottom: 16px; font-weight: bold; color: #333"
        >
          {{ $t('agency.agentMode.netProfitExcludeTitle') }}
        </div>

        <div
          class="checkbox-group"
          style="display: flex; gap: 24px; flex-wrap: wrap"
        >
          <n-checkbox v-model:checked="netProfitSettings.excludePromotions">
            {{ $t('agency.agentMode.excludePromotions') }}
          </n-checkbox>
          <n-checkbox v-model:checked="netProfitSettings.excludeGameCosts">
            {{ $t('agency.agentMode.excludeGameCosts') }}
          </n-checkbox>
          <n-checkbox v-model:checked="netProfitSettings.excludeDepositFees">
            {{ $t('agency.agentMode.excludeDepositFees') }}
          </n-checkbox>
          <n-checkbox v-model:checked="netProfitSettings.excludeWithdrawFees">
            {{ $t('agency.agentMode.excludeWithdrawFees') }}
          </n-checkbox>
          <n-checkbox
            v-model:checked="netProfitSettings.excludePreviousBalance"
          >
            {{ $t('agency.agentMode.excludePreviousBalance') }}
          </n-checkbox>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <n-button
            @click="netProfitModalVisible = false"
            :disabled="netProfitLoading"
            >{{ $t('common.cancel') }}</n-button
          >
          <n-button
            type="primary"
            @click="handleSaveNetProfitSettings"
            :loading="netProfitLoading"
            >{{ $t('common.confirm') }}</n-button
          >
        </div>
      </div>
    </n-modal>

    <!-- 代理公共设置模态框 -->
    <n-modal
      v-model:show="agentPublicModalVisible"
      :title="$t('agency.agentMode.publicSettings')"
      :mask-closable="false"
      preset="card"
      style="width: 900px; max-width: 95vw"
    >
      <div class="agent-public-settings">
        <!-- 默认代理模式设置 -->
        <div class="section">
          <h3 style="margin-bottom: 16px; font-weight: bold">
            {{ $t('agency.agentMode.defaultModeSettings') }}
          </h3>
          <n-grid :cols="2" :x-gap="16">
            <n-gi>
              <n-form-item :label="$t('common.currency')">
                <n-select
                  v-model:value="agentPublicSettings.currency"
                  :options="[
                    { label: 'BRL', value: 'BRL' },
                    { label: 'USD', value: 'USD' },
                  ]"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('agency.agentMode.agentModeLabel')">
                <n-select
                  v-model:value="agentPublicSettings.defaultAgentMode"
                  :options="[{ label: $t('agency.agentMode.levelOneAgent'), value: '一级代理' }]"
                />
              </n-form-item>
            </n-gi>
          </n-grid>
        </div>

        <!-- 返佣前端显示格式设置 -->
        <div class="section" style="margin-top: 24px">
          <h3 style="margin-bottom: 16px; font-weight: bold">
            {{ $t('agency.agentMode.rebateDisplaySettings') }}
          </h3>
          <n-radio-group v-model:value="agentPublicSettings.displayFormat">
            <n-space>
              <n-radio :value="$t('agency.agentMode.showRebateRate')">{{ $t('agency.agentMode.showRebateRate') }}</n-radio>
              <n-radio :value="$t('agency.agentMode.showRebateAmount')">{{ $t('agency.agentMode.showRebateAmount') }}</n-radio>
              <n-radio :value="$t('agency.agentMode.showBoth')">{{ $t('agency.agentMode.showBoth') }}</n-radio>
            </n-space>
          </n-radio-group>

          <!-- 返佣比例表 -->
          <div style="margin-top: 16px">
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
              "
            >
              <span style="font-weight: bold">{{ $t('agency.agentMode.rebateRateTable') }}</span>
              <n-button size="small" @click="addRebateRow">{{ $t('agency.agentMode.addRow') }}</n-button>
            </div>
            <n-table size="small" bordered>
              <thead>
                <tr>
                  <th style="width: 80px">{{ $t('agency.agentMode.sequence') }}</th>
                  <th style="width: 150px">{{ $t('agency.agentMode.performance') }}</th>
                  <th style="width: 150px">{{ $t('agency.agentMode.rebateRate') }}</th>
                  <th style="width: 80px">{{ $t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, index) in agentPublicSettings.rebateTable"
                  :key="index"
                >
                  <td style="text-align: center">{{ row.sequence }}</td>
                  <td>
                    <n-input-number
                      v-model:value="row.performance"
                      :min="0"
                      style="width: 100%"
                    />
                  </td>
                  <td>
                    <n-input-number
                      v-model:value="row.rebateRate"
                      :min="0"
                      :max="100"
                      style="width: 100%"
                      suffix="%"
                    />
                  </td>
                  <td style="text-align: center">
                    <n-button
                      size="tiny"
                      type="error"
                      @click="removeRebateRow(index)"
                      :disabled="agentPublicSettings.rebateTable.length === 1"
                    >
                      {{ $t('common.delete') }}
                    </n-button>
                  </td>
                </tr>
              </tbody>
            </n-table>
          </div>
        </div>

        <!-- 结算设置 -->
        <div class="section" style="margin-top: 24px">
          <h3 style="margin-bottom: 16px; font-weight: bold">{{ $t('agency.agentMode.settlementSettings') }}</h3>

          <!-- 佣金领取时间 -->
          <n-form-item :label="$t('agency.agentMode.claimTime')">
            <n-radio-group v-model:value="agentPublicSettings.settlementTime">
              <n-space>
                <n-radio :value="$t('agency.agentMode.everyDay')">{{ $t('agency.agentMode.everyDay') }}</n-radio>
              </n-space>
            </n-radio-group>
          </n-form-item>

          <!-- 时间范围 -->
          <n-grid :cols="2" :x-gap="16" style="margin-top: 8px">
            <n-gi>
              <n-input
                v-model:value="agentPublicSettings.settlementStartTime"
                placeholder="07:00:00"
                style="width: 100%"
              />
            </n-gi>
            <n-gi style="display: flex; align-items: center">
              <span style="margin: 0 8px">-</span>
              <n-input
                v-model:value="agentPublicSettings.settlementEndTime"
                placeholder="23:59:59"
                style="width: 100%"
              />
            </n-gi>
          </n-grid>

          <!-- 佣金积分倍数 -->
          <n-form-item :label="$t('agency.agentMode.commissionMultiplier')" style="margin-top: 16px">
            <n-radio-group
              v-model:value="agentPublicSettings.commissionMultiplier"
            >
              <n-space>
                <n-radio :value="$t('agency.agentMode.noPointsRequired')">{{ $t('agency.agentMode.noPointsRequired') }}</n-radio>
                <n-radio :value="$t('agency.agentMode.multiplier')">{{ $t('agency.agentMode.multiplier') }}</n-radio>
              </n-space>
            </n-radio-group>
            <n-input-number
              v-if="agentPublicSettings.commissionMultiplier === $t('agency.agentMode.multiplier')"
              v-model:value="agentPublicSettings.multiplierValue"
              :min="0"
              :suffix="$t('agency.agentMode.multiplierSuffix')"
              style="width: 120px; margin-left: 16px"
            />
          </n-form-item>

          <!-- 有效人数计算 -->
          <n-form-item :label="$t('agency.agentMode.validMemberCalc')" style="margin-top: 16px">
            <div style="display: flex; gap: 16px; align-items: center">
              <span>{{ $t('agency.agentMode.directSubValidBet') }}</span>
              <n-input-number
                v-model:value="agentPublicSettings.validMemberCalculation"
                :min="0"
                style="width: 120px"
              />
            </div>
          </n-form-item>

          <n-form-item label="" style="margin-top: 8px">
            <div style="display: flex; gap: 16px; align-items: center">
              <span>{{ $t('agency.agentMode.directSubDeposit') }}</span>
              <n-input-number
                v-model:value="agentPublicSettings.subordinateValidBet"
                :min="0"
                style="width: 120px"
              />
            </div>
          </n-form-item>

          <!-- 直属下级单个会员返佣上限 -->
          <n-form-item
            :label="$t('agency.agentMode.rebateCapPerMember')"
            style="margin-top: 16px"
          >
            <div style="display: flex; gap: 16px; align-items: center">
              <span>{{ $t('agency.agentMode.dailyCap') }}</span>
              <n-input-number
                v-model:value="agentPublicSettings.dailyLimit"
                :min="0"
                style="width: 120px"
              />
            </div>
          </n-form-item>

          <n-form-item label="" style="margin-top: 8px">
            <div style="display: flex; gap: 16px; align-items: center">
              <span>{{ $t('agency.agentMode.weeklyCap') }}</span>
              <n-input-number
                v-model:value="agentPublicSettings.weeklyLimit"
                :min="0"
                style="width: 120px"
              />
            </div>
          </n-form-item>

          <n-form-item label="" style="margin-top: 8px">
            <div style="display: flex; gap: 16px; align-items: center">
              <span>{{ $t('agency.agentMode.monthlyCap') }}</span>
              <n-input-number
                v-model:value="agentPublicSettings.monthlyLimit"
                :min="0"
                style="width: 120px"
              />
            </div>
          </n-form-item>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <n-button
            @click="agentPublicModalVisible = false"
            :disabled="agentPublicLoading"
            >{{ $t('common.cancel') }}</n-button
          >
          <n-button
            type="primary"
            @click="handleSaveAgentPublicSettings"
            :loading="agentPublicLoading"
            >{{ $t('common.confirm') }}</n-button
          >
        </div>
      </div>
    </n-modal>
  </Page>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, h, computed, defineAsyncComponent } from 'vue';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
const SmartDataGrid = defineAsyncComponent(
  () => import('../../components/smart/SmartDataGrid/index.vue'),
);
import { Page } from '@vben/common-ui';
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NButton,
  NDivider,
  NRadio,
  NRadioGroup,
  NModal,
  NTable,
  NInputNumber,
  NTabs,
  NTabPane,
  NSpace,
  NSwitch,
  NCheckbox,
  NGrid,
  NGi,
  useMessage,
  useDialog,
  type DataTableColumns,
  type DataTableRowKey,
} from 'naive-ui';
import {
  agentModeApi,
  gameRebateApi,
  type GameRebateConfigRequest,
} from '#/api/agency/agent-mode';
import {
  getAgentLevelsApi,
  createAgentLevelApi,
  updateAgentLevelApi,
  batchUpdateAgentLevelsApi,
  autoUpgradeAgentsApi,
  type AgentLevel,
  type CreateAgentLevelRequest,
  type UpdateAgentLevelRequest,
} from '#/api/agency/agent-level';
import {
  getNetProfitSettingsApi,
  updateNetProfitSettingsApi,
  getPublicSettingsApi,
  updatePublicSettingsApi,
  type UpdateNetProfitSettingsRequest,
  type UpdatePublicSettingsRequest,
} from '#/api/agency/agent-settings';

const message = useMessage();
const dialog = useDialog();

interface AgentModeRow {
  id: number;
  currency: string;
  name: string;
  source: string;
  settlementCycle: string;
  commissionBasis: string;
  calcLevels: string;
  overflowSummary: string | '-';
  isDefault: boolean;
  isEnabled: boolean;
  lastCycleClosedDate: string | null;
  usedCount: number;
  remark: string | '-';
  operator: string;
  operatedAt: string;
}

// state
const loading = ref(false);
const tableData = ref<AgentModeRow[]>([]);
const selectedKeys = ref<DataTableRowKey[]>([]);

// Agent Level Settings Modal
const agentLevelModalVisible = ref(false);
const agentLevels = ref<AgentLevel[]>([]);
const agentLevelLoading = ref(false);

const editingAgentLevel = ref<AgentLevel | null>(null);
const agentLevelEditModalVisible = ref(false);

// Net Profit Settings Modal
const netProfitModalVisible = ref(false);
const netProfitLoading = ref(false);
const netProfitSettings = reactive({
  currency: 'BRL',
  excludePromotions: true, // 排除优惠和活动
  excludeGameCosts: false, // 三方游戏统一成本
  excludeDepositFees: false, // 充值手续费
  excludeWithdrawFees: false, // 提现手续费
  excludePreviousBalance: false, // 上期结余
});

// Agent Public Settings Modal
const agentPublicModalVisible = ref(false);
const agentPublicLoading = ref(false);
const agentPublicSettings = reactive({
  currency: 'BRL',
  defaultAgentMode: '一级代理',
  displayFormat: '展示佣金比例',
  settlementTime: '每天',
  settlementStartTime: '07:00:00',
  settlementEndTime: '23:59:59',
  commissionMultiplier: '倍数',
  multiplierValue: 1.0,
  validMemberCalculation: 0.0,
  subordinateValidBet: 0.0,
  dailyLimit: 0.0,
  weeklyLimit: 0.0,
  monthlyLimit: 0.0,
  rebateTable: [
    { sequence: 1, performance: 1000.0, rebateRate: 3.0 },
    { sequence: 2, performance: 10000.0, rebateRate: 5.0 },
  ],
});

const filterForm = reactive({
  name: '',
  currency: '',
  source: '',
  isEnabled: '',
  isDefault: '',
  settlementCycle: '',
});

// 分页配置 (simplified for SmartDataGrid)
const paginationReactive = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

const currencyOptions = computed(() => [
  { label: 'BRL', value: 'BRL' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
]);
const sourceOptions = computed(() => [
  { label: $t('agency.agentMode.systemSource'), value: 'SYSTEM' },
  { label: $t('agency.agentMode.customSource'), value: 'CUSTOM' },
]);
const enabledOptions = computed(() => [
  { label: $t('common.enable'), value: 'true' },
  { label: $t('common.disable'), value: 'false' },
]);
const defaultOptions = computed(() => [
  { label: $t('common.yes'), value: 'true' },
  { label: $t('common.no'), value: 'false' },
]);
const settlementCycleOptions = computed(() => [
  { label: $t('agency.agentMode.daily'), value: 'DAILY' },
  { label: $t('agency.agentMode.weekly'), value: 'WEEKLY' },
  { label: $t('agency.agentMode.monthly'), value: 'MONTHLY' },
  { label: $t('agency.agentMode.customSettlement'), value: 'CUSTOM' },
]);
const calcLevelsOptions = computed(() => [
  { label: $t('agency.agentMode.levelOneOnly'), value: 'LEVEL_ONE' },
  { label: $t('agency.agentMode.maxTwoLevels'), value: 'MAX_TWO' },
  { label: $t('agency.agentMode.maxThreeLevels'), value: 'MAX_THREE' },
  { label: $t('agency.agentMode.unlimitedLevels'), value: 'UNLIMITED' },
]);
const tutorialOptions = computed(() => [
  { label: $t('agency.agentMode.selectTemplate'), value: '' },
  { label: $t('agency.agentMode.templateDefault'), value: 'DEFAULT' },
  { label: $t('agency.agentMode.templateBeginner'), value: 'BEGINNER' },
  { label: $t('agency.agentMode.templateAdvanced'), value: 'ADVANCED' },
]);
const fontSizeOptions = computed(() => [
  { label: '12px', value: '12px' },
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
  { label: '18px', value: '18px' },
  { label: '20px', value: '20px' },
]);
const fontFamilyOptions = computed(() => [
  { label: $t('agency.agentMode.fontSystem'), value: '系统字体' },
  { label: $t('agency.agentMode.fontYaHei'), value: '微软雅黑' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Times New Roman', value: 'Times New Roman' },
]);

// columns（按照截图布局）
const columns = computed<DataTableColumns<AgentModeRow>>(() => [
  {
    type: 'selection',
    width: 50,
  },
  {
    title: $t('agency.agentMode.modeId'),
    key: 'id',
    width: 100,
    sorter: true,
  },
  {
    title: $t('common.currency'),
    key: 'currency',
    width: 80,
    render: (row) => {
      return h(
        'span',
        {
          style:
            'background: #52c41a; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px;',
        },
        row.currency,
      );
    },
  },
  {
    title: $t('agency.agentMode.modeNameCol'),
    key: 'name',
    width: 150,
    render: (row) =>
      h('div', {}, [
        row.isDefault
          ? h(
              'span',
              { style: 'color:#18a058;margin-right:6px;font-weight:bold;' },
              $t('agency.agentMode.defaultBadge'),
            )
          : null,
        row.name,
      ]),
  },
  {
    title: $t('agency.agentMode.modeSource'),
    key: 'source',
    width: 100,
    render: (row) => {
      const sourceMap: Record<string, string> = {
        SYSTEM: $t('agency.agentMode.systemSource'),
        CUSTOM: $t('agency.agentMode.customSource'),
      };
      return sourceMap[row.source] || row.source;
    },
  },
  {
    title: $t('agency.agentMode.settlementCycle'),
    key: 'settlementCycle',
    width: 100,
    render: (row) => {
      const cycleMap: Record<string, string> = {
        DAILY: $t('agency.agentMode.daily'),
        WEEKLY: $t('agency.agentMode.weekly'),
        MONTHLY: $t('agency.agentMode.monthly'),
        CUSTOM: $t('agency.agentMode.customSettlement'),
      };
      return cycleMap[row.settlementCycle] || row.settlementCycle;
    },
  },
  {
    title: $t('agency.agentMode.commissionBasis'),
    key: 'commissionBasis',
    width: 120,
    render: (row) => {
      const basisMap: Record<string, string> = {
        VALID_BET: $t('agency.agentMode.validBet'),
        NET_PROFIT: $t('agency.agentMode.netProfit'),
      };
      return basisMap[row.commissionBasis] || row.commissionBasis;
    },
  },
  {
    title: $t('agency.agentMode.commissionLayers'),
    key: 'calcLevels',
    width: 120,
    render: (row) => {
      const levelsMap: Record<string, string> = {
        LEVEL_ONE: $t('agency.agentMode.levelOneOnly'),
        MAX_TWO: $t('agency.agentMode.maxTwoLevels'),
        MAX_THREE: $t('agency.agentMode.maxThreeLevels'),
        MAX_FOUR: $t('agency.agentMode.maxFourLevels'),
        MAX_FIVE: $t('agency.agentMode.maxFiveLevels'),
        UNLIMITED: $t('agency.agentMode.unlimitedLevels'),
        CUSTOM: $t('agency.agentMode.customLevels'),
      };
      return levelsMap[row.calcLevels] || row.calcLevels;
    },
  },
  {
    title: $t('agency.agentMode.overflowRebate'),
    key: 'overflowSummary',
    width: 150,
    render: (row) => row.overflowSummary || '-',
  },
  {
    title: $t('agency.agentMode.enableStatus'),
    key: 'isEnabled',
    width: 100,
    render: (row) => {
      return h(NSwitch, {
        value: row.isEnabled,
        size: 'small',
        'onUpdate:value': (value: boolean) => handleStatusToggle(row, value),
      });
    },
  },
  {
    title: $t('agency.agentMode.lastCycleClosed'),
    key: 'lastCycleClosedDate',
    width: 130,
    render: (row) => row.lastCycleClosedDate || '-',
  },
  {
    title: $t('agency.agentMode.usedCount'),
    key: 'usedCount',
    width: 100,
    render: (row) => row.usedCount || 0,
  },
  {
    title: $t('common.remark'),
    key: 'remark',
    width: 100,
    render: (row) => row.remark || '-',
  },
  {
    title: $t('common.actions'),
    key: 'actions',
    width: 80,
    fixed: 'right',
    render: (row) => {
      return h(
        'a',
        {
          href: '#',
          style: 'color: #1890ff; text-decoration: none;',
          onClick: (e: Event) => {
            e.preventDefault();
            handleEdit(row);
          },
        },
        $t('common.modify'),
      );
    },
  },
  {
    title: $t('common.operator'),
    key: 'operator',
    width: 100,
    render: (row) => row.operator || '-',
  },
  {
    title: $t('common.operationTime'),
    key: 'operatedAt',
    width: 140,
    sorter: true,
    render: (row) => row.operatedAt || '-',
  },
]);

// modal state
const modalVisible = ref(false);
const isEdit = ref(false);
const submitLoading = ref(false);
const currentModeId = ref<number | null>(null);

// 游戏类型集合（与数据库 GameCategory 枚举对应，基于 GamePlatform 实际类型）
const gameTypes = computed(() => [
  { label: $t('agency.agentMode.gameArcade'), value: 'ARCADE' },
  { label: $t('agency.agentMode.gameBlockchain'), value: 'BLOCKCHAIN' },
  { label: $t('agency.agentMode.gameChessCards'), value: 'CHESS_CARDS' },
  { label: $t('agency.agentMode.gameCockfight'), value: 'COCKFIGHT' },
  { label: $t('agency.agentMode.gameHunting'), value: 'HUNTING' },
  { label: $t('agency.agentMode.gameLive'), value: 'LIVE' },
  { label: $t('agency.agentMode.gameLottery'), value: 'LOTTERY' },
  { label: $t('agency.agentMode.gameSlot'), value: 'SLOT' },
  { label: $t('agency.agentMode.gameSports'), value: 'SPORTS' },
]);

interface TierRow {
  key: string;
  minUsers: number;
  validBet: number;
  rate: number;
  amount: number;
}
const tierMap = reactive<Record<string, TierRow[]>>({});

// Auto-calculate amount when rate or validBet changes
const calculateRebateAmount = (row: TierRow) => {
  if (row.rate > 0 && row.validBet > 0) {
    row.amount = Number(((row.validBet * row.rate) / 100).toFixed(2));
  } else {
    row.amount = 0;
  }
};

// Initialize tierMap with watchers for auto-calculation
for (const gt of gameTypes.value) {
  const initialRow = {
    key: `${gt.value}-0`,
    minUsers: 0,
    validBet: 0,
    rate: 0.3,
    amount: 0,
  };
  calculateRebateAmount(initialRow); // Calculate initial amount
  tierMap[gt.value] = [initialRow];
}

const formData = reactive({
  currency: 'BRL',
  name: '',
  applyMethod: 'DIRECT',
  calcLevels: 'LEVEL_ONE',
  isEnabled: true,
  settlementCycle: 'DAILY',
  commissionBasis: 'VALID_BET',
  performanceScope: 'VALID_ONLY',
  tutorialType: 'CUSTOM',
  tutorialTemplate: '',
  tutorialContent: '',
  fontSize: '16px',
  fontFamily: '系统字体',
  isDefault: false,
  remark: '',
});

function handleCreate() {
  isEdit.value = false;
  currentModeId.value = null;
  Object.assign(formData, {
    currency: 'BRL',
    name: '',
    applyMethod: 'DIRECT',
    calcLevels: 'LEVEL_ONE',
    isEnabled: true,
    settlementCycle: 'DAILY',
    commissionBasis: 'VALID_BET',
    performanceScope: 'VALID_ONLY',
    tutorialType: 'CUSTOM',
    tutorialTemplate: '',
    tutorialContent: '',
    fontSize: '16px',
    fontFamily: '系统字体',
    isDefault: false,
    remark: '',
  });
  for (const gt of gameTypes.value) {
    const newRow = {
      key: `${gt.value}-0`,
      minUsers: 0,
      validBet: 0,
      rate: 0.3,
      amount: 0,
    };
    calculateRebateAmount(newRow);
    tierMap[gt.value] = [newRow];
  }
  modalVisible.value = true;
}

function addTier(gt: string, afterIndex?: number) {
  const list = tierMap[gt];
  if (!list) return;
  const idx = (afterIndex ?? list.length - 1) + 1;
  const newRow = {
    key: `${gt}-${Date.now()}-${idx}`,
    minUsers: 0,
    validBet: 0,
    rate: 0,
    amount: 0,
  };
  calculateRebateAmount(newRow);
  list.splice((afterIndex ?? list.length) + 1, 0, newRow);
}
function removeTier(gt: string, index: number) {
  const list = tierMap[gt];
  if (!list || list.length <= 1) return;
  list.splice(index, 1);
}
function copyConfigToAll(from: string) {
  const src = tierMap[from];
  if (!src || src.length === 0) {
    message.warning($t('agency.agentMode.noConfigToCopy'));
    return;
  }

  // Find the display name for the source game type
  const sourceGameType = gameTypes.value.find((gt) => gt.value === from);
  const sourceDisplayName = sourceGameType?.label || from;

  // Show confirmation dialog
  dialog.info({
    title: $t('agency.agentMode.confirmCopyTitle'),
    content: $t('agency.agentMode.confirmCopyContent', [sourceDisplayName]),
    positiveText: $t('agency.agentMode.confirmCopyPositive'),
    negativeText: $t('common.cancel'),
    onPositiveClick: () => {
      // Create deep copy of source configuration
      const srcCopy = src.map((r) => ({ ...r, key: '' }));
      let copiedCount = 0;

      for (const gt of gameTypes.value) {
        if (gt.value === from) continue;

        tierMap[gt.value] = srcCopy.map((r, i) => {
          const newRow = {
            ...r,
            key: `${gt.value}-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          };
          calculateRebateAmount(newRow);
          return newRow;
        });
        copiedCount++;
      }

      message.success($t('agency.agentMode.copySuccess', [sourceDisplayName, String(copiedCount)]));
    },
    onNegativeClick: () => {
      // User cancelled, do nothing
    },
  });
}

async function handleConfirm() {
  try {
    submitLoading.value = true;
    let modeId = currentModeId.value;

    // create or update base info
    if (isEdit.value && currentModeId.value) {
      const resp = await agentModeApi.updateAgentMode(
        currentModeId.value,
        formData as any,
      );
      if (!(resp as any).success) {
        message.error($t('agency.agentMode.updateModeFailed'));
        return;
      }
      modeId = currentModeId.value;
    } else {
      const resp = await agentModeApi.createAgentMode(formData as any);
      if (!(resp as any).success) {
        message.error($t('agency.agentMode.createModeFailed'));
        return;
      }
      modeId = parseInt((resp as any).data.id);
      currentModeId.value = modeId;
    }

    // Save game rebate configurations
    if (modeId) {
      const gameRebateConfigs: GameRebateConfigRequest[] = [];

      for (const gt of gameTypes.value) {
        const list = tierMap[gt.value];
        if (!list || list.length === 0) continue;

        // Save all tiers for each game type
        list.forEach((tier, index) => {
          gameRebateConfigs.push({
            gameCategory: gt.value as any,
            tierLevel: index + 1, // Tier level starts from 1
            minValidUsers: tier.minUsers,
            minValidBetAmount: tier.validBet,
            rebatePercentage: tier.rate,
            rebateAmount: tier.amount,
            isActive: true,
          });
        });
      }

      try {
        await gameRebateApi.updateGameRebateConfigs(modeId, gameRebateConfigs);
        message.success($t('agency.agentMode.gameRebateSaved'));
      } catch (error) {
        console.error('保存游戏返佣配置失败:', error);
        message.warning($t('agency.agentMode.gameRebatePartialFail'));
      }
    }

    modalVisible.value = false;
    message.success(isEdit.value ? $t('agency.agentMode.modeUpdateSuccess') : $t('agency.agentMode.modeCreateSuccess'));
    await loadData();
  } catch (error) {
    console.error('保存代理模式失败:', error);
    message.error($t('agency.agentMode.saveModeFailed'));
  } finally {
    submitLoading.value = false;
  }
}

// actions
const loadData = async () => {
  try {
    loading.value = true;
    const params = {
      page: paginationReactive.page,
      pageSize: paginationReactive.pageSize,
      sortBy: 'id',
      sortOrder: 'asc',
      name: filterForm.name || undefined,
      currency: filterForm.currency || undefined,
      source: filterForm.source || undefined,
      isEnabled: filterForm.isEnabled || undefined,
      isDefault: filterForm.isDefault || undefined,
      settlementCycle: filterForm.settlementCycle || undefined,
    } as any;
    const resp = await agentModeApi.getAgentModeList(params);
    if ((resp as any).success) {
      tableData.value = resp.data.list as any;
      paginationReactive.total = resp.data.total;
    }
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  paginationReactive.page = 1;
  loadData();
};
const handleReset = () => {
  Object.assign(filterForm, {
    name: '',
    currency: '',
    source: '',
    isEnabled: '',
    isDefault: '',
    settlementCycle: '',
  });
  paginationReactive.page = 1;
  loadData();
};

// 新增的4个按钮处理函数

// 代理公共设置
const handleAgentPublicSettings = async () => {
  agentPublicModalVisible.value = true;
  await loadAgentPublicSettings();
};

// 净盈利设置
const handleNetProfitSettings = async () => {
  netProfitModalVisible.value = true;
  await loadNetProfitSettings();
};

// 加载净盈利设置
const loadNetProfitSettings = async () => {
  try {
    netProfitLoading.value = true;
    const response = await getNetProfitSettingsApi(netProfitSettings.currency);
    const data = response.data;

    Object.assign(netProfitSettings, {
      currency: data.currency,
      excludePromotions: data.excludePromotions,
      excludeGameCosts: data.excludeGameCosts,
      excludeDepositFees: data.excludeDepositFees,
      excludeWithdrawFees: data.excludeWithdrawFees,
      excludePreviousBalance: data.excludePreviousBalance,
    });
  } catch (error) {
    console.error('加载净盈利设置失败:', error);
    message.error($t('agency.agentMode.loadNetProfitFailed'));
  } finally {
    netProfitLoading.value = false;
  }
};

// 保存净盈利设置
const handleSaveNetProfitSettings = async () => {
  try {
    netProfitLoading.value = true;
    const updateData: UpdateNetProfitSettingsRequest = {
      excludePromotions: netProfitSettings.excludePromotions,
      excludeGameCosts: netProfitSettings.excludeGameCosts,
      excludeDepositFees: netProfitSettings.excludeDepositFees,
      excludeWithdrawFees: netProfitSettings.excludeWithdrawFees,
      excludePreviousBalance: netProfitSettings.excludePreviousBalance,
    };

    await updateNetProfitSettingsApi(netProfitSettings.currency, updateData);
    message.success($t('agency.agentMode.netProfitSaved'));
    netProfitModalVisible.value = false;
  } catch (error) {
    console.error('保存净盈利设置失败:', error);
    message.error($t('agency.agentMode.saveNetProfitFailed'));
  } finally {
    netProfitLoading.value = false;
  }
};

// 添加返佣比例行
const addRebateRow = () => {
  const maxSequence = Math.max(
    ...agentPublicSettings.rebateTable.map((r) => r.sequence),
    0,
  );
  agentPublicSettings.rebateTable.push({
    sequence: maxSequence + 1,
    performance: 0,
    rebateRate: 0,
  });
};

// 删除返佣比例行
const removeRebateRow = (index: number) => {
  if (agentPublicSettings.rebateTable.length > 1) {
    agentPublicSettings.rebateTable.splice(index, 1);
  }
};

// 加载代理公共设置
const loadAgentPublicSettings = async () => {
  try {
    agentPublicLoading.value = true;
    const response = await getPublicSettingsApi(agentPublicSettings.currency);
    const data = response.data;

    Object.assign(agentPublicSettings, {
      currency: data.currency,
      defaultAgentMode: data.defaultAgentMode,
      displayFormat: data.displayFormat,
      settlementTime: data.settlementTime,
      settlementStartTime: data.settlementStartTime || '07:00:00',
      settlementEndTime: data.settlementEndTime || '23:59:59',
      commissionMultiplier: data.commissionMultiplier,
      multiplierValue: data.multiplierValue,
      validMemberCalculation: data.validMemberCalculation,
      subordinateValidBet: data.subordinateValidBet,
      dailyLimit: data.dailyLimit,
      weeklyLimit: data.weeklyLimit,
      monthlyLimit: data.monthlyLimit,
      rebateTable:
        data.rebateTable.length > 0
          ? data.rebateTable
          : [
              { sequence: 1, performance: 1000.0, rebateRate: 3.0 },
              { sequence: 2, performance: 10000.0, rebateRate: 5.0 },
            ],
    });
  } catch (error) {
    console.error('加载代理公共设置失败:', error);
    message.error($t('agency.agentMode.loadPublicFailed'));
  } finally {
    agentPublicLoading.value = false;
  }
};

// 保存代理公共设置
const handleSaveAgentPublicSettings = async () => {
  try {
    agentPublicLoading.value = true;
    const updateData: UpdatePublicSettingsRequest = {
      defaultAgentMode: agentPublicSettings.defaultAgentMode,
      displayFormat: agentPublicSettings.displayFormat,
      settlementTime: agentPublicSettings.settlementTime,
      settlementStartTime: agentPublicSettings.settlementStartTime,
      settlementEndTime: agentPublicSettings.settlementEndTime,
      commissionMultiplier: agentPublicSettings.commissionMultiplier,
      multiplierValue: agentPublicSettings.multiplierValue,
      validMemberCalculation: agentPublicSettings.validMemberCalculation,
      subordinateValidBet: agentPublicSettings.subordinateValidBet,
      dailyLimit: agentPublicSettings.dailyLimit,
      weeklyLimit: agentPublicSettings.weeklyLimit,
      monthlyLimit: agentPublicSettings.monthlyLimit,
      rebateTable: agentPublicSettings.rebateTable,
    };

    await updatePublicSettingsApi(agentPublicSettings.currency, updateData);
    message.success($t('agency.agentMode.publicSaved'));
    agentPublicModalVisible.value = false;
  } catch (error) {
    console.error('保存代理公共设置失败:', error);
    message.error($t('agency.agentMode.savePublicFailed'));
  } finally {
    agentPublicLoading.value = false;
  }
};

// 代理等级设置
const handleAgentLevelSettings = async () => {
  agentLevelModalVisible.value = true;
  await fetchAgentLevels();
};

// 获取代理等级数据
const fetchAgentLevels = async () => {
  try {
    agentLevelLoading.value = true;
    const response = await getAgentLevelsApi();
    agentLevels.value = response.data;
    console.log('📊 Agent levels loaded:', agentLevels.value.length);
  } catch (error) {
    console.error('获取代理等级失败:', error);
    message.error($t('agency.agentMode.loadLevelsFailed'));
  } finally {
    agentLevelLoading.value = false;
  }
};

// 编辑代理等级
const handleEditAgentLevel = (level: AgentLevel) => {
  editingAgentLevel.value = { ...level };
  agentLevelEditModalVisible.value = true;
};

// 取消编辑代理等级
const handleCancelAgentLevel = async (_levelId: number) => {
  try {
    // 刷新数据以恢复原始状态
    await fetchAgentLevels();
    message.info($t('agency.agentMode.cancelEditDone'));
  } catch (error) {
    console.error('取消操作失败:', error);
    message.error($t('agency.agentMode.cancelFailed'));
  }
};

// 确认代理等级设置
const handleConfirmAgentLevel = async (level: AgentLevel) => {
  try {
    const updateData: UpdateAgentLevelRequest = {
      id: level.id,
      level: level.level,
      name: level.name,
      promotionCondition: level.promotionCondition,
      description: level.description,
      icon: level.icon,
      iconColor: level.iconColor,
      isActive: level.isActive,
    };

    await updateAgentLevelApi(updateData);
    message.success($t('agency.agentMode.levelConfirmed'));
    await fetchAgentLevels(); // 刷新数据
  } catch (error) {
    console.error('确认操作失败:', error);
    message.error($t('agency.agentMode.confirmFailed'));
    await fetchAgentLevels(); // 出错时也刷新数据
  }
};

// 保存代理等级编辑
const handleSaveAgentLevel = async () => {
  if (!editingAgentLevel.value) return;

  try {
    const updateData: UpdateAgentLevelRequest = {
      id: editingAgentLevel.value.id,
      level: editingAgentLevel.value.level,
      name: editingAgentLevel.value.name,
      promotionCondition: editingAgentLevel.value.promotionCondition,
      description: editingAgentLevel.value.description,
      icon: editingAgentLevel.value.icon,
      iconColor: editingAgentLevel.value.iconColor,
      isActive: editingAgentLevel.value.isActive,
    };

    await updateAgentLevelApi(updateData);
    message.success($t('agency.agentMode.levelSaved'));
    agentLevelEditModalVisible.value = false;
    editingAgentLevel.value = null;
    await fetchAgentLevels(); // 刷新数据
  } catch (error) {
    console.error('保存失败:', error);
    message.error($t('agency.agentMode.saveModeFailed'));
  }
};

// 新增代理等级
const handleAddAgentLevel = () => {
  // 找到下一个可用的等级
  const maxLevel = Math.max(...agentLevels.value.map((l) => l.level), 0);
  const newLevel: AgentLevel = {
    id: 0, // 新建时为0，后端会自动分配
    level: maxLevel + 1,
    name: `LV${maxLevel + 1}`,
    promotionCondition: 0,
    description: $t('agency.agentMode.promotionDesc', ['0']),
    icon: (maxLevel + 1).toString(),
    iconColor: '#CD7F32',
    isActive: true,
    userCount: 0,
    createdAt: '',
    updatedAt: '',
  };

  editingAgentLevel.value = newLevel;
  agentLevelEditModalVisible.value = true;
};

// 创建新代理等级
const handleCreateAgentLevel = async () => {
  if (!editingAgentLevel.value) return;

  try {
    const createData: CreateAgentLevelRequest = {
      level: editingAgentLevel.value.level,
      name: editingAgentLevel.value.name,
      promotionCondition: editingAgentLevel.value.promotionCondition,
      description: editingAgentLevel.value.description,
      icon: editingAgentLevel.value.icon,
      iconColor: editingAgentLevel.value.iconColor,
      isActive: editingAgentLevel.value.isActive,
    };

    await createAgentLevelApi(createData);
    message.success($t('agency.agentMode.levelCreated'));
    agentLevelEditModalVisible.value = false;
    editingAgentLevel.value = null;
    await fetchAgentLevels(); // 刷新数据
  } catch (error) {
    console.error('创建失败:', error);
    message.error($t('agency.agentMode.saveModeFailed'));
  }
};

// 批量保存代理等级
const handleBatchSaveAgentLevels = async () => {
  try {
    const updateData: UpdateAgentLevelRequest[] = agentLevels.value.map(
      (level) => ({
        id: level.id,
        level: level.level,
        name: level.name,
        promotionCondition: level.promotionCondition,
        description: level.description,
        icon: level.icon,
        iconColor: level.iconColor,
        isActive: level.isActive,
      }),
    );

    await batchUpdateAgentLevelsApi(updateData);
    message.success($t('agency.agentMode.batchLevelsSaved', [String(updateData.length)]));
    await fetchAgentLevels(); // 刷新数据
  } catch (error) {
    console.error('批量保存失败:', error);
    message.error($t('agency.agentMode.batchSaveFailed'));
  }
};

// 自动升级代理
const handleAutoUpgradeAgents = async () => {
  try {
    const response = await autoUpgradeAgentsApi();
    const { upgradedCount, upgradedAgents } = response.data;

    if (upgradedCount > 0) {
      message.success($t('agency.agentMode.autoUpgradeDone', [String(upgradedCount)]));
      // 显示升级详情
      const upgradeDetails = upgradedAgents
        .map(
          (agent) =>
            `${agent.username}: LV${agent.oldLevel} → LV${agent.newLevel}`,
        )
        .join('\n');

      dialog.success({
        title: $t('agency.agentMode.autoUpgradeResult'),
        content: `${$t('agency.agentMode.autoUpgradeResult')}:\n${upgradeDetails}`,
        positiveText: $t('common.confirm'),
      });
    } else {
      message.info($t('agency.agentMode.autoUpgradeNone'));
    }

    await fetchAgentLevels(); // 刷新数据以更新用户数量
  } catch (error) {
    console.error('自动升级失败:', error);
    message.error($t('agency.agentMode.autoUpgradeFailed'));
  }
};

const handleBatchClose = async (selectedRows?: AgentModeRow[]) => {
  const rowsToClose =
    selectedRows ||
    tableData.value.filter((item) => selectedKeys.value.includes(item.id));

  if (rowsToClose.length === 0) {
    console.log('No rows selected for batch close');
    return;
  }

  console.log('Batch closing rows:', rowsToClose);

  for (const row of rowsToClose) {
    await agentModeApi.updateAgentModeStatus(Number(row.id), false as any);
  }
  selectedKeys.value = [];
  loadData();
};

// handleSelectionChange removed - not used
const handlePageChange = (page: number) => {
  paginationReactive.page = page;
  loadData();
};
const handlePageSizeChange = (pageSize: number) => {
  paginationReactive.pageSize = pageSize;
  paginationReactive.page = 1;
  loadData();
};

// Helper function to convert Chinese display text back to enum values
const mapDisplayToEnum = (displayValue: string, type: string): string => {
  const mappings: Record<string, Record<string, string>> = {
    calcLevels: {
      只算一级: 'LEVEL_ONE',
      最多二级: 'MAX_TWO',
      最多三级: 'MAX_THREE',
      无级数: 'UNLIMITED',
    },
    settlementCycle: {
      日结: 'DAILY',
      周结: 'WEEKLY',
      月结: 'MONTHLY',
    },
    commissionBasis: {
      有效投注: 'VALID_BET',
      净盈利: 'NET_PROFIT',
      组合指标: 'COMPOSITE',
    },
  };

  return mappings[type]?.[displayValue] || displayValue;
};

// Load game rebate configurations
const loadGameRebateConfigs = async (modeId: number) => {
  try {
    const response = await gameRebateApi.getGameRebateConfigs(modeId);
    if (response.success && response.data) {
      // Reset tierMap
      for (const gt of gameTypes.value) {
        tierMap[gt.value] = [];
      }

      // Group configurations by game type and sort by tier level
      const groupedConfigs: Record<string, any[]> = {};
      response.data.forEach((config: any) => {
        const gameType = config.gameCategory;
        if (!groupedConfigs[gameType]) {
          groupedConfigs[gameType] = [];
        }
        groupedConfigs[gameType].push(config);
      });

      // Populate tierMap with loaded configurations
      Object.keys(groupedConfigs).forEach((gameType) => {
        const configs =
          groupedConfigs[gameType]?.sort(
            (a, b) => (a.tierLevel || 1) - (b.tierLevel || 1),
          ) || [];
        tierMap[gameType] = configs.map((config, index) => {
          const newRow = {
            key: `${gameType}-${Date.now()}-${index}`,
            minUsers: config.minValidUsers,
            validBet: config.minValidBetAmount,
            rate: config.rebatePercentage,
            amount: config.rebateAmount,
          };
          // Recalculate amount to ensure consistency
          calculateRebateAmount(newRow);
          return newRow;
        });
      });

      // For game types without configurations, add default empty tier
      for (const gt of gameTypes.value) {
        if (!tierMap[gt.value] || tierMap[gt.value]?.length === 0) {
          const defaultRow = {
            key: `${gt.value}-${Date.now()}-0`,
            minUsers: 0,
            validBet: 0,
            rate: 0,
            amount: 0,
          };
          calculateRebateAmount(defaultRow);
          tierMap[gt.value] = [defaultRow];
        }
      }
    }
  } catch (error) {
    console.error('Failed to load game rebate configurations:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    message.warning($t('agency.agentMode.loadRebateFailed', [errorMessage]));

    // Initialize with default empty tiers
    for (const gt of gameTypes.value) {
      const defaultRow = {
        key: `${gt.value}-${Date.now()}-0`,
        minUsers: 0,
        validBet: 0,
        rate: 0,
        amount: 0,
      };
      calculateRebateAmount(defaultRow);
      tierMap[gt.value] = [defaultRow];
    }
  }
};

// Actions handlers
const handleEdit = async (row: AgentModeRow) => {
  isEdit.value = true;
  currentModeId.value = row.id;

  // Populate form with existing data, converting display values back to enum values
  Object.assign(formData, {
    currency: row.currency,
    name: row.name,
    applyMethod: 'DIRECT', // Default since this field may not exist in row
    calcLevels: mapDisplayToEnum(row.calcLevels, 'calcLevels'),
    // Will need to fetch if calcLevels is CUSTOM
    isEnabled: row.isEnabled,
    settlementCycle: mapDisplayToEnum(row.settlementCycle, 'settlementCycle'),
    commissionBasis: mapDisplayToEnum(row.commissionBasis, 'commissionBasis'),
    performanceScope: 'VALID_ONLY', // Default
    tutorialType: 'CUSTOM',
    tutorialTemplate: '',
    tutorialContent: '',
    fontSize: '16px',
    fontFamily: '系统字体',
    isDefault: row.isDefault,
    remark: row.remark || '',
  });

  // Load game rebate configurations
  await loadGameRebateConfigs(row.id);

  modalVisible.value = true;
};

const handleStatusToggle = async (row: AgentModeRow, newStatus: boolean) => {
  try {
    // Update the status immediately in the UI for better UX
    const originalStatus = row.isEnabled;
    row.isEnabled = newStatus;

    // Call API to update status in database
    const response = await agentModeApi.updateAgentModeStatus(
      row.id,
      newStatus,
    );

    if (response.success) {
      message.success(newStatus ? $t('agency.agentMode.statusEnabled', [row.name]) : $t('agency.agentMode.statusDisabled', [row.name]));
      // Optionally refresh the data to ensure consistency
      // await loadData();
    } else {
      // API returned success: false, revert the change
      row.isEnabled = originalStatus;
      message.error($t('agency.agentMode.statusUpdateFailed', [response.message || '']));
    }
  } catch (error) {
    // Revert the change if API call fails
    row.isEnabled = !newStatus;
    console.error('Status update error:', error);

    // Handle 409 Conflict specifically
    if ((error as any)?.response?.status === 409) {
      message.warning($t('agency.agentMode.cannotDisableLast'));
    } else {
      const errorMessage = error instanceof Error ? error.message : '';
      message.error($t('agency.agentMode.statusUpdateFailed', [errorMessage]));
    }
  }
};

// SmartDataGrid event handlers
const handleRefresh = () => {
  loadData();
};

const handleRowClick = (agentMode: AgentModeRow) => {
  console.log('Agent mode row clicked:', agentMode);
  // Optional: Auto-open edit modal on row click
  // handleEdit(agentMode);
};

const clearSelection = () => {
  selectedKeys.value = [];
  console.log('Selection cleared');
};

const selectAll = () => {
  selectedKeys.value = tableData.value.map((mode) => mode.id);
  console.log('All selected');
};

// init
loadData();
</script>
