<template>
  <Page>
    <n-card title="代理模式">
      <!-- 筛选表单（与 AgentList 布局一致） -->
      <n-form
        ref="filterFormRef"
        :model="filterForm"
        label-placement="left"
        inline
        size="small"
        label-width="90"
      >
        <n-form-item label="代理模式名称">
          <n-input
            v-model:value="filterForm.name"
            placeholder="请输入模式名称"
            style="width: 220px"
          />
        </n-form-item>
        <n-form-item label="币种">
          <n-select
            v-model:value="filterForm.currency"
            :options="currencyOptions"
            placeholder="选择币种"
            style="width: 140px"
          />
        </n-form-item>
        <n-form-item label="模式来源">
          <n-select
            v-model:value="filterForm.source"
            :options="sourceOptions"
            placeholder="选择来源"
            style="width: 140px"
          />
        </n-form-item>
        <n-form-item label="启用状态">
          <n-select
            v-model:value="filterForm.isEnabled"
            :options="enabledOptions"
            placeholder="选择状态"
            style="width: 140px"
          />
        </n-form-item>
        <n-form-item label="是否默认">
          <n-select
            v-model:value="filterForm.isDefault"
            :options="defaultOptions"
            placeholder="选择默认"
            style="width: 140px"
          />
        </n-form-item>
        <n-form-item label="结算周期">
          <n-select
            v-model:value="filterForm.settlementCycle"
            :options="settlementCycleOptions"
            placeholder="选择周期"
            style="width: 140px"
          />
        </n-form-item>
        <n-form-item>
          <n-button size="small" type="primary" @click="handleSearch"
            >搜索</n-button
          >
          <n-button size="small" style="margin-left: 8px" @click="handleReset"
            >重置</n-button
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
                    新增代理模式
                  </n-button>
                  <n-button type="success" @click="handleAgentPublicSettings">
                    代理公共设置
                  </n-button>
                  <n-button type="warning" @click="handleNetProfitSettings">
                    净盈利设置
                  </n-button>
                  <n-button type="info" @click="handleAgentLevelSettings">
                    代理等级设置
                  </n-button>
                </div>

                <!-- 选择信息 -->
                <div class="text-sm text-gray-600">
                  已选择 {{ selectedCount }} 条数据，共
                  {{ paginationReactive.total }} 条
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
                  批量关闭 ({{ selectedCount }})
                </n-button>

                <!-- 选择控制 -->
                <n-button size="small" @click="clearSelection"
                  >清空选择</n-button
                >
                <n-button size="small" @click="selectAll">全选</n-button>
              </div>
            </div>
          </n-card>
        </template>
      </SmartDataGrid>
    </n-card>

    <!-- 新增/编辑 代理模式（按截图进行布局） -->
    <n-modal
      v-model:show="modalVisible"
      :title="isEdit ? '编辑代理模式' : '新增代理模式'"
      :mask-closable="false"
      preset="card"
      style="width: 1200px; max-width: 95vw"
    >
      <n-form :model="formData" label-placement="left" label-width="120">
        <n-grid :cols="2" :x-gap="24" :y-gap="16">
          <!-- 左侧表单 -->
          <n-gi>
            <n-form-item label="币种" required>
              <n-select
                v-model:value="formData.currency"
                :options="currencyOptions"
                placeholder="请选择币种"
              />
            </n-form-item>

            <n-form-item label="代理模式名称" required>
              <n-input
                v-model:value="formData.name"
                placeholder="请输入代理模式名称"
              />
            </n-form-item>

            <n-form-item label="申请方式" required>
              <n-radio-group v-model:value="formData.applyMethod">
                <n-radio value="DIRECT">直接生效</n-radio>
                <n-radio value="APPROVAL">需要审核</n-radio>
              </n-radio-group>
            </n-form-item>

            <n-form-item label="佣金计算层数" required>
              <n-select
                v-model:value="formData.calcLevels"
                :options="calcLevelsOptions"
                placeholder="请选择"
              />
            </n-form-item>

            <n-form-item label="启用状态" required>
              <n-radio-group v-model:value="formData.isEnabled">
                <n-radio :value="true">启用</n-radio>
                <n-radio :value="false">停用</n-radio>
              </n-radio-group>
            </n-form-item>

            <n-form-item label="结算周期" required>
              <n-radio-group v-model:value="formData.settlementCycle">
                <n-radio value="DAILY">日结</n-radio>
                <n-radio value="WEEKLY">周结</n-radio>
                <n-radio value="MONTHLY">月结</n-radio>
                <n-radio value="CUSTOM">自定义结算</n-radio>
              </n-radio-group>
            </n-form-item>

            <n-form-item label="佣金计算依据" required>
              <n-radio-group v-model:value="formData.commissionBasis">
                <n-radio value="VALID_BET">有效投注</n-radio>
                <n-radio value="NET_PROFIT">净盈利</n-radio>
              </n-radio-group>
            </n-form-item>

            <n-form-item label="业绩计算范围" required>
              <n-radio-group v-model:value="formData.performanceScope">
                <n-radio value="ALL">全部计算（含无效）</n-radio>
                <n-radio value="VALID_ONLY">只计算有效会员业绩</n-radio>
              </n-radio-group>
            </n-form-item>
          </n-gi>

          <!-- 右侧区域 -->
          <n-gi>
            <n-form-item label="代理教程设置">
              <n-radio-group v-model:value="formData.tutorialType">
                <n-radio value="CUSTOM">自定义</n-radio>
              </n-radio-group>
              <div style="margin-top: 8px">
                <n-select
                  v-model:value="formData.tutorialTemplate"
                  :options="tutorialOptions"
                  placeholder="请选择模版"
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

            <n-form-item label="备注" style="margin-top: 16px">
              <n-input
                v-model:value="formData.remark"
                type="textarea"
                placeholder="请输入备注"
              />
            </n-form-item>
          </n-gi>
        </n-grid>

        <n-divider title-placement="left">阶梯返佣（按游戏类型）</n-divider>
        <n-tabs type="line">
          <n-tab-pane
            v-for="gt in gameTypes"
            :key="gt.value"
            :name="gt.value"
            :tab="gt.label"
          >
            <div class="mb-2 flex items-center justify-between">
              <div class="text-sm text-gray-500">
                当前 {{ gt.label }} 共
                {{ tierMap[gt.value]?.length || 0 }} 个层级
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
                  复制此配置到全部
                </n-button>
                <n-button
                  size="small"
                  style="margin-left: 8px"
                  @click="addTier(gt.value)"
                  type="primary"
                  >新增层级</n-button
                >
              </div>
            </div>
            <n-table size="small" bordered>
              <thead>
                <tr>
                  <th style="width: 160px">有效人数(0不限)</th>
                  <th style="width: 200px">有效投注(单位:金额)</th>
                  <th style="width: 160px">返佣比例(%)</th>
                  <th style="width: 160px">返佣金额</th>
                  <th style="width: 120px">操作</th>
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
                        >新增</n-button
                      >
                      <n-button
                        size="tiny"
                        text
                        type="error"
                        @click="removeTier(gt.value, idx)"
                        >删除</n-button
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
        <n-button @click="modalVisible = false">取消</n-button>
        <n-button type="primary" :loading="submitLoading" @click="handleConfirm"
          >确认</n-button
        >
      </template>
    </n-modal>

    <!-- 代理等级设置模态框 -->
    <n-modal
      v-model:show="agentLevelModalVisible"
      title="代理等级设置"
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
              自动升级代理
            </n-button>
          </div>
          <div class="flex gap-2">
            <n-button type="primary" size="small" @click="handleAddAgentLevel"
              >新增</n-button
            >
            <n-button
              type="warning"
              size="small"
              @click="handleBatchSaveAgentLevels"
              >批量保存</n-button
            >
          </div>
        </div>

        <n-table size="small" bordered :loading="agentLevelLoading">
          <thead>
            <tr>
              <th style="width: 80px; text-align: center">图标</th>
              <th style="width: 120px">代理等级名称</th>
              <th style="width: 200px">晋升条件 (需获得佣金)</th>
              <th style="width: 300px">描述</th>
              <th style="width: 100px; text-align: center">当前人数</th>
              <th style="width: 150px; text-align: center">操作</th>
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
                    取消
                  </n-button>
                  <n-button
                    size="tiny"
                    type="success"
                    @click="handleConfirmAgentLevel(level)"
                  >
                    确认
                  </n-button>
                  <n-button
                    size="tiny"
                    type="primary"
                    @click="handleEditAgentLevel(level)"
                  >
                    修改
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
            关闭
          </n-button>
        </div>
      </div>
    </n-modal>

    <!-- 编辑代理等级模态框 -->
    <n-modal
      v-model:show="agentLevelEditModalVisible"
      title="编辑代理等级"
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
          <n-form-item label="等级名称">
            <n-input v-model:value="editingAgentLevel.name" />
          </n-form-item>
          <n-form-item label="晋升条件">
            <n-input-number
              v-model:value="editingAgentLevel.promotionCondition"
              :min="0"
              style="width: 100%"
            />
          </n-form-item>
          <n-form-item label="描述">
            <n-input
              v-model:value="editingAgentLevel.description"
              type="textarea"
              :rows="3"
            />
          </n-form-item>
          <n-form-item label="图标颜色">
            <n-input v-model:value="editingAgentLevel.iconColor" />
          </n-form-item>
        </n-form>

        <div class="mt-4 flex justify-end gap-2">
          <n-button @click="agentLevelEditModalVisible = false">取消</n-button>
          <n-button
            type="primary"
            @click="
              editingAgentLevel?.id
                ? handleSaveAgentLevel()
                : handleCreateAgentLevel()
            "
          >
            {{ editingAgentLevel?.id ? '保存' : '创建' }}
          </n-button>
        </div>
      </div>
    </n-modal>

    <!-- 净盈利设置模态框 -->
    <n-modal
      v-model:show="netProfitModalVisible"
      title="净盈利设置"
      :mask-closable="false"
      preset="card"
      style="width: 600px; max-width: 90vw"
    >
      <div class="net-profit-settings">
        <div
          class="section-title"
          style="margin-bottom: 16px; font-weight: bold; color: #333"
        >
          净盈利排除平台运营成本
        </div>

        <div
          class="checkbox-group"
          style="display: flex; gap: 24px; flex-wrap: wrap"
        >
          <n-checkbox v-model:checked="netProfitSettings.excludePromotions">
            所有优惠和活动
          </n-checkbox>
          <n-checkbox v-model:checked="netProfitSettings.excludeGameCosts">
            三方游戏统一成本
          </n-checkbox>
          <n-checkbox v-model:checked="netProfitSettings.excludeDepositFees">
            充值手续费
          </n-checkbox>
          <n-checkbox v-model:checked="netProfitSettings.excludeWithdrawFees">
            提现手续费
          </n-checkbox>
          <n-checkbox
            v-model:checked="netProfitSettings.excludePreviousBalance"
          >
            上期结余
          </n-checkbox>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <n-button
            @click="netProfitModalVisible = false"
            :disabled="netProfitLoading"
            >取消</n-button
          >
          <n-button
            type="primary"
            @click="handleSaveNetProfitSettings"
            :loading="netProfitLoading"
            >确认</n-button
          >
        </div>
      </div>
    </n-modal>

    <!-- 代理公共设置模态框 -->
    <n-modal
      v-model:show="agentPublicModalVisible"
      title="代理公共设置"
      :mask-closable="false"
      preset="card"
      style="width: 900px; max-width: 95vw"
    >
      <div class="agent-public-settings">
        <!-- 默认代理模式设置 -->
        <div class="section">
          <h3 style="margin-bottom: 16px; font-weight: bold">
            默认代理模式设置
          </h3>
          <n-grid :cols="2" :x-gap="16">
            <n-gi>
              <n-form-item label="币种">
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
              <n-form-item label="代理模式">
                <n-select
                  v-model:value="agentPublicSettings.defaultAgentMode"
                  :options="[{ label: '一级代理', value: '一级代理' }]"
                />
              </n-form-item>
            </n-gi>
          </n-grid>
        </div>

        <!-- 返佣前端显示格式设置 -->
        <div class="section" style="margin-top: 24px">
          <h3 style="margin-bottom: 16px; font-weight: bold">
            返佣前端显示格式设置
          </h3>
          <n-radio-group v-model:value="agentPublicSettings.displayFormat">
            <n-space>
              <n-radio value="展示佣金比例">展示佣金比例</n-radio>
              <n-radio value="展示佣金金额">展示佣金金额</n-radio>
              <n-radio value="展示佣金金额和比例">展示佣金金额和比例</n-radio>
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
              <span style="font-weight: bold">返佣比例表</span>
              <n-button size="small" @click="addRebateRow">添加行</n-button>
            </div>
            <n-table size="small" bordered>
              <thead>
                <tr>
                  <th style="width: 80px">序号</th>
                  <th style="width: 150px">业绩</th>
                  <th style="width: 150px">返佣比例</th>
                  <th style="width: 80px">操作</th>
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
                      删除
                    </n-button>
                  </td>
                </tr>
              </tbody>
            </n-table>
          </div>
        </div>

        <!-- 结算设置 -->
        <div class="section" style="margin-top: 24px">
          <h3 style="margin-bottom: 16px; font-weight: bold">结算设置</h3>

          <!-- 佣金领取时间 -->
          <n-form-item label="佣金领取时间">
            <n-radio-group v-model:value="agentPublicSettings.settlementTime">
              <n-space>
                <n-radio value="每天">每天</n-radio>
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
          <n-form-item label="佣金积分倍数" style="margin-top: 16px">
            <n-radio-group
              v-model:value="agentPublicSettings.commissionMultiplier"
            >
              <n-space>
                <n-radio value="无需积分">无需积分</n-radio>
                <n-radio value="倍数">倍数</n-radio>
              </n-space>
            </n-radio-group>
            <n-input-number
              v-if="agentPublicSettings.commissionMultiplier === '倍数'"
              v-model:value="agentPublicSettings.multiplierValue"
              :min="0"
              suffix="倍"
              style="width: 120px; margin-left: 16px"
            />
          </n-form-item>

          <!-- 有效人数计算 -->
          <n-form-item label="有效人数计算" style="margin-top: 16px">
            <div style="display: flex; gap: 16px; align-items: center">
              <span>直属下级单个会员在结算周期内有效投注</span>
              <n-input-number
                v-model:value="agentPublicSettings.validMemberCalculation"
                :min="0"
                style="width: 120px"
              />
            </div>
          </n-form-item>

          <n-form-item label="" style="margin-top: 8px">
            <div style="display: flex; gap: 16px; align-items: center">
              <span>并且直属下级单个会员在结算周期内充值></span>
              <n-input-number
                v-model:value="agentPublicSettings.subordinateValidBet"
                :min="0"
                style="width: 120px"
              />
            </div>
          </n-form-item>

          <!-- 直属下级单个会员返佣上限 -->
          <n-form-item
            label="直属下级单个会员返佣上限"
            style="margin-top: 16px"
          >
            <div style="display: flex; gap: 16px; align-items: center">
              <span>日结模式上限</span>
              <n-input-number
                v-model:value="agentPublicSettings.dailyLimit"
                :min="0"
                style="width: 120px"
              />
            </div>
          </n-form-item>

          <n-form-item label="" style="margin-top: 8px">
            <div style="display: flex; gap: 16px; align-items: center">
              <span>周结模式上限</span>
              <n-input-number
                v-model:value="agentPublicSettings.weeklyLimit"
                :min="0"
                style="width: 120px"
              />
            </div>
          </n-form-item>

          <n-form-item label="" style="margin-top: 8px">
            <div style="display: flex; gap: 16px; align-items: center">
              <span>月结模式上限</span>
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
            >取消</n-button
          >
          <n-button
            type="primary"
            @click="handleSaveAgentPublicSettings"
            :loading="agentPublicLoading"
            >确认</n-button
          >
        </div>
      </div>
    </n-modal>
  </Page>
</template>

<script setup lang="ts">
import { ref, reactive, h, defineAsyncComponent } from 'vue';
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

// options (使用字符串，避免 MixedOption 类型告警)
const currencyOptions = [
  { label: 'BRL', value: 'BRL' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
];
const sourceOptions = [
  { label: '系统自带', value: 'SYSTEM' },
  { label: '自定义', value: 'CUSTOM' },
];
const enabledOptions = [
  { label: '启用', value: 'true' },
  { label: '禁用', value: 'false' },
];
const defaultOptions = [
  { label: '是', value: 'true' },
  { label: '否', value: 'false' },
];
const settlementCycleOptions = [
  { label: '日结', value: 'DAILY' },
  { label: '周结', value: 'WEEKLY' },
  { label: '月结', value: 'MONTHLY' },
  { label: '自定义结算', value: 'CUSTOM' },
];
const calcLevelsOptions = [
  { label: '只算一级', value: 'LEVEL_ONE' },
  { label: '最多两级', value: 'MAX_TWO' },
  { label: '最多三级', value: 'MAX_THREE' },
  { label: '无数级', value: 'UNLIMITED' },
];

const tutorialOptions = [
  { label: '请选择模版', value: '' },
  { label: '默认模版', value: 'DEFAULT' },
  { label: '新手指南', value: 'BEGINNER' },
  { label: '高级教程', value: 'ADVANCED' },
];

const fontSizeOptions = [
  { label: '12px', value: '12px' },
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
  { label: '18px', value: '18px' },
  { label: '20px', value: '20px' },
];

const fontFamilyOptions = [
  { label: '系统字体', value: '系统字体' },
  { label: '微软雅黑', value: '微软雅黑' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Times New Roman', value: 'Times New Roman' },
];

// columns（按照截图布局）
const columns: DataTableColumns<AgentModeRow> = [
  {
    type: 'selection',
    width: 50,
  },
  {
    title: '代理模式ID',
    key: 'id',
    width: 100,
    sorter: true,
  },
  {
    title: '币种',
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
    title: '模式名称',
    key: 'name',
    width: 150,
    render: (row) =>
      h('div', {}, [
        row.isDefault
          ? h(
              'span',
              { style: 'color:#18a058;margin-right:6px;font-weight:bold;' },
              '默认',
            )
          : null,
        row.name,
      ]),
  },
  {
    title: '模式来源',
    key: 'source',
    width: 100,
    render: (row) => {
      const sourceMap: Record<string, string> = {
        SYSTEM: '系统自带',
        CUSTOM: '自定义',
      };
      return sourceMap[row.source] || row.source;
    },
  },
  {
    title: '结算周期',
    key: 'settlementCycle',
    width: 100,
    render: (row) => {
      const cycleMap: Record<string, string> = {
        DAILY: '日结',
        WEEKLY: '周结',
        MONTHLY: '月结',
        CUSTOM: '自定义结算',
      };
      return cycleMap[row.settlementCycle] || row.settlementCycle;
    },
  },
  {
    title: '佣金计算依据',
    key: 'commissionBasis',
    width: 120,
    render: (row) => {
      const basisMap: Record<string, string> = {
        VALID_BET: '有效投注',
        NET_PROFIT: '净盈利',
      };
      return basisMap[row.commissionBasis] || row.commissionBasis;
    },
  },
  {
    title: '佣金计算层数',
    key: 'calcLevels',
    width: 120,
    render: (row) => {
      const levelsMap: Record<string, string> = {
        LEVEL_ONE: '只算一级',
        MAX_TWO: '最多两级',
        MAX_THREE: '最多三级',
        MAX_FOUR: '最多四级',
        MAX_FIVE: '最多五级',
        UNLIMITED: '无数级',
        CUSTOM: '自定义层数',
      };
      return levelsMap[row.calcLevels] || row.calcLevels;
    },
  },
  {
    title: '超出部分额外返佣',
    key: 'overflowSummary',
    width: 150,
    render: (row) => row.overflowSummary || '-',
  },
  {
    title: '启用状态',
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
    title: '上周期结算时间',
    key: 'lastCycleClosedDate',
    width: 130,
    render: (row) => row.lastCycleClosedDate || '-',
  },
  {
    title: '已使用人数',
    key: 'usedCount',
    width: 100,
    render: (row) => row.usedCount || 0,
  },
  {
    title: '备注',
    key: 'remark',
    width: 100,
    render: (row) => row.remark || '-',
  },
  {
    title: '操作',
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
        '修改',
      );
    },
  },
  {
    title: '操作人',
    key: 'operator',
    width: 100,
    render: (row) => row.operator || '-',
  },
  {
    title: '操作时间',
    key: 'operatedAt',
    width: 140,
    sorter: true,
    render: (row) => row.operatedAt || '-',
  },
];

// modal state
const modalVisible = ref(false);
const isEdit = ref(false);
const submitLoading = ref(false);
const currentModeId = ref<number | null>(null);

// 游戏类型集合（与数据库 GameCategory 枚举对应，基于 GamePlatform 实际类型）
const gameTypes = [
  { label: '街机', value: 'ARCADE' },
  { label: '区块链', value: 'BLOCKCHAIN' },
  { label: '棋牌', value: 'CHESS_CARDS' },
  { label: '斗鸡', value: 'COCKFIGHT' },
  { label: '捕鱼', value: 'HUNTING' },
  { label: '真人', value: 'LIVE' },
  { label: '彩票', value: 'LOTTERY' },
  { label: '电子', value: 'SLOT' },
  { label: '体育', value: 'SPORTS' },
];

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
for (const gt of gameTypes) {
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
  for (const gt of gameTypes) {
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
    message.warning('当前游戏类型没有配置可复制');
    return;
  }

  // Find the display name for the source game type
  const sourceGameType = gameTypes.find((gt) => gt.value === from);
  const sourceDisplayName = sourceGameType?.label || from;

  // Show confirmation dialog
  dialog.info({
    title: '确认复制配置',
    content: `确定要将"${sourceDisplayName}"的配置复制到所有其他游戏类型吗？这将覆盖其他游戏类型的现有配置。`,
    positiveText: '确认复制',
    negativeText: '取消',
    onPositiveClick: () => {
      // Create deep copy of source configuration
      const srcCopy = src.map((r) => ({ ...r, key: '' }));
      let copiedCount = 0;

      for (const gt of gameTypes) {
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

      message.success(
        `已成功将"${sourceDisplayName}"的配置复制到 ${copiedCount} 个其他游戏类型`,
      );
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
        message.error('更新代理模式失败');
        return;
      }
      modeId = currentModeId.value;
    } else {
      const resp = await agentModeApi.createAgentMode(formData as any);
      if (!(resp as any).success) {
        message.error('创建代理模式失败');
        return;
      }
      modeId = parseInt((resp as any).data.id);
      currentModeId.value = modeId;
    }

    // Save game rebate configurations
    if (modeId) {
      const gameRebateConfigs: GameRebateConfigRequest[] = [];

      for (const gt of gameTypes) {
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
        message.success('游戏返佣配置保存成功');
      } catch (error) {
        console.error('保存游戏返佣配置失败:', error);
        message.warning('代理模式保存成功，但游戏返佣配置保存失败');
      }
    }

    modalVisible.value = false;
    message.success(isEdit.value ? '代理模式更新成功' : '代理模式创建成功');
    await loadData();
  } catch (error) {
    console.error('保存代理模式失败:', error);
    message.error('保存失败');
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
    message.error('加载净盈利设置失败');
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
    message.success('净盈利设置已保存');
    netProfitModalVisible.value = false;
  } catch (error) {
    console.error('保存净盈利设置失败:', error);
    message.error('保存净盈利设置失败');
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
    message.error('加载代理公共设置失败');
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
    message.success('代理公共设置已保存');
    agentPublicModalVisible.value = false;
  } catch (error) {
    console.error('保存代理公共设置失败:', error);
    message.error('保存代理公共设置失败');
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
    message.error('获取代理等级失败');
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
    message.info('已取消修改');
  } catch (error) {
    console.error('取消操作失败:', error);
    message.error('取消操作失败');
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
    message.success('代理等级设置已确认');
    await fetchAgentLevels(); // 刷新数据
  } catch (error) {
    console.error('确认操作失败:', error);
    message.error('确认操作失败');
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
    message.success('代理等级设置已保存');
    agentLevelEditModalVisible.value = false;
    editingAgentLevel.value = null;
    await fetchAgentLevels(); // 刷新数据
  } catch (error) {
    console.error('保存失败:', error);
    message.error('保存失败');
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
    description: `晋级需再获得0佣金的代理`,
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
    message.success('代理等级创建成功');
    agentLevelEditModalVisible.value = false;
    editingAgentLevel.value = null;
    await fetchAgentLevels(); // 刷新数据
  } catch (error) {
    console.error('创建失败:', error);
    message.error('创建失败');
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
    message.success(`成功批量更新 ${updateData.length} 个代理等级`);
    await fetchAgentLevels(); // 刷新数据
  } catch (error) {
    console.error('批量保存失败:', error);
    message.error('批量保存失败');
  }
};

// 自动升级代理
const handleAutoUpgradeAgents = async () => {
  try {
    const response = await autoUpgradeAgentsApi();
    const { upgradedCount, upgradedAgents } = response.data;

    if (upgradedCount > 0) {
      message.success(`自动升级完成！共升级 ${upgradedCount} 个代理`);
      // 显示升级详情
      const upgradeDetails = upgradedAgents
        .map(
          (agent) =>
            `${agent.username}: LV${agent.oldLevel} → LV${agent.newLevel}`,
        )
        .join('\n');

      dialog.success({
        title: '自动升级结果',
        content: `升级详情：\n${upgradeDetails}`,
        positiveText: '确定',
      });
    } else {
      message.info('没有代理符合升级条件');
    }

    await fetchAgentLevels(); // 刷新数据以更新用户数量
  } catch (error) {
    console.error('自动升级失败:', error);
    message.error('自动升级失败');
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
      for (const gt of gameTypes) {
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
      for (const gt of gameTypes) {
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
    message.warning(`加载游戏返佣配置失败，将使用默认配置: ${errorMessage}`);

    // Initialize with default empty tiers
    for (const gt of gameTypes) {
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
      message.success(`已${newStatus ? '启用' : '停用'}代理模式: ${row.name}`);
      // Optionally refresh the data to ensure consistency
      // await loadData();
    } else {
      // API returned success: false, revert the change
      row.isEnabled = originalStatus;
      message.error('状态更新失败: ' + (response.message || '未知错误'));
    }
  } catch (error) {
    // Revert the change if API call fails
    row.isEnabled = !newStatus;
    console.error('Status update error:', error);

    // Handle 409 Conflict specifically
    if ((error as any)?.response?.status === 409) {
      message.warning('无法禁用该货币的最后一个代理模式，请先创建其他代理模式');
    } else {
      const errorMessage = error instanceof Error ? error.message : '网络错误';
      message.error('状态更新失败: ' + errorMessage);
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
