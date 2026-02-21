<template>
  <!-- Full Screen Modal -->
  <n-modal
    v-model:show="modalShow"
    preset="card"
    :title="isEditing ? '编辑活动' : '新增活动'"
    style="width: 90vw; height: 90vh; max-width: 1400px; margin: 0 auto;"
    :mask-closable="false"
    class="activity-form-modal"
    @after-leave="handleModalClose"
  >
    <div class="modal-content-wrapper">
    <!-- Activity Type Selection -->
    <div class="mb-4 flex-shrink-0">
      <div class="mb-3">
        <span class="block text-sm font-medium text-gray-700 mb-2">活动类型:</span>
        <div class="flex flex-wrap gap-2">
          <n-button 
            v-for="type in activityTypes"
            :key="type.value"
            :type="formData.activityType === type.value ? 'primary' : 'default'"
            size="small"
            @click="formData.activityType = type.value"
            class="text-xs"
          >
            {{ type.label }}
          </n-button>
        </div>
      </div>
    </div>

    <!-- Tabbed Content -->
    <div class="tabs-wrapper">
      <n-tabs 
        v-model:value="activeTab" 
        type="line" 
        animated
      >
        <!-- Tab 1: Basic Settings -->
        <n-tab-pane name="basic" tab="基础设置">
          <div class="flex gap-6">
            <!-- Left Column -->
            <div class="flex-1 pr-4">
              <div class="space-y-4">
                <!-- Activity Classification -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">* 活动分类</label>
                  <n-checkbox-group v-model:value="formData.categories">
                    <div class="grid grid-cols-3 gap-2">
                      <n-checkbox 
                        v-for="category in activityCategories"
                        :key="category.value"
                        :value="category.value"
                        class="text-xs"
                      >
                        {{ category.label }}
                      </n-checkbox>
                    </div>
                  </n-checkbox-group>
                </div>

                <!-- Currency Selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">* 选择币种</label>
                  <n-checkbox-group v-model:value="formData.currencies" @update:value="handleCurrencyChange">
                    <div class="grid grid-cols-2 gap-2">
                      <n-checkbox value="all">全选</n-checkbox>
                      <n-checkbox value="BRL">BRL</n-checkbox>
                    </div>
                  </n-checkbox-group>
                </div>

                <!-- Activity Name -->
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="block text-sm font-medium text-gray-700">* 活动名称</label>
                    <n-button size="small" text @click="openTranslationModal">
                      更多语言
                    </n-button>
                  </div>
                  <div class="flex gap-3 mb-2">
                    <n-radio-group v-model:value="formData.nameType">
                      <n-space>
                        <n-radio value="custom">自定义</n-radio>
                        <n-radio value="system">系统自带</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>
                  <n-input
                    v-model:value="formData.title"
                    placeholder="请输入活动名称"
                  />
                </div>

                <!-- Activity Time -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">* 活动时间</label>
                  <div class="flex gap-3">
                    <n-date-picker
                      v-model:value="formData.startTime"
                      type="datetime"
                      placeholder="活动开始时间"
                      class="flex-1"
                      :is-date-disabled="(ts: number) => ts < Date.now()"
                      clearable
                    />
                    <span class="text-gray-400 self-center">-</span>
                    <n-date-picker
                      v-model:value="formData.endTime"
                      type="datetime"
                      placeholder="活动结束时间"
                      class="flex-1"
                      :is-date-disabled="(ts: number) => formData.startTime ? ts < formData.startTime : ts < Date.now()"
                      clearable
                    />
                  </div>
                  <n-checkbox v-model:checked="formData.syncDisplayTime" class="mt-2">
                    展示时间与活动时间保持一致
                  </n-checkbox>
                </div>

                <!-- Display Time (if not synced) -->
                <div v-if="!formData.syncDisplayTime">
                  <label class="block text-sm font-medium text-gray-700 mb-2">* 展示时间</label>
                  <div class="flex gap-3">
                    <n-date-picker
                      v-model:value="formData.displayStartTime"
                      type="datetime"
                      placeholder="客户端展示开始时间"
                      class="flex-1"
                      :is-date-disabled="(ts: number) => ts < Date.now()"
                      clearable
                    />
                    <span class="text-gray-400 self-center">-</span>
                    <n-date-picker
                      v-model:value="formData.displayEndTime"
                      type="datetime"
                      placeholder="客户端展示结束时间"
                      class="flex-1"
                      :is-date-disabled="(ts: number) => formData.displayStartTime ? ts < formData.displayStartTime : ts < Date.now()"
                      clearable
                    />
                  </div>
                </div>

                <!-- Wagering Specific Fields (only for 打码 type) -->
                <template v-if="formData.activityType === 'wagering'">
                  <!-- Loop Method -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      * 循环方式
                      <n-icon size="16" class="text-blue-500 ml-1">
                        <HelpCircle />
                      </n-icon>
                    </label>
                    <n-radio-group v-model:value="formData.loopMethod">
                      <n-space>
                        <n-radio value="daily_cumulative">日累计循环</n-radio>
                        <n-radio value="weekly_cumulative">周累计循环</n-radio>
                        <n-radio value="monthly_cumulative">月累计循环</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Time Limited -->
                  <div class="flex items-center justify-between">
                    <label class="block text-sm font-medium text-gray-700">是否限时</label>
                    <n-switch v-model:value="formData.isTimeLimited" />
                  </div>

                  <!-- Distribution Method -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">派发方式</label>
                    <n-radio-group v-model:value="formData.distributionMethod">
                      <n-space vertical>
                        <n-radio value="auto_claim">系统立即自动派发</n-radio>
                        <n-radio value="player_claim_expires">玩家自领-过期作废</n-radio>
                        <n-radio value="player_claim_auto_after_expire">玩家自领-过期自动派发</n-radio>
                        <n-radio value="player_apply_manual_approve">玩家申请-人工派发</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Claim Time -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">领取时间</label>
                    <n-radio-group v-model:value="formData.claimTime">
                      <n-space vertical>
                        <n-radio value="next_day">次日领取</n-radio>
                        <n-radio value="real_time">实时领取(影响留存)</n-radio>
                        <n-radio value="daily">每日</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Select Time -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">选择时间</label>
                    <div class="flex items-center gap-2">
                      <n-input-number
                        v-model:value="formData.selectTime"
                        placeholder="00:00:00"
                        class="w-32"
                        :min="0"
                        :max="23"
                      />
                      <span class="text-sm text-gray-500">以后可领取</span>
                    </div>
                  </div>

                  <!-- Reward Claim Expiry Days -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      奖励领取过期天数
                      <n-icon size="16" class="text-blue-500 ml-1">
                        <HelpCircle />
                      </n-icon>
                    </label>
                    <n-input-number
                      v-model:value="formData.rewardClaimExpiryDays"
                      placeholder="1"
                      class="w-32"
                      :min="1"
                    />
                  </div>

                  <!-- Valid Wagering Platform -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">有效打码平台</label>
                    
                    
                    <n-radio-group v-model:value="formData.wageringPlatform">
                      <n-space>
                        <n-radio value="all_platforms">全部平台</n-radio>
                        <n-radio value="specific_platforms">指定平台</n-radio>
                        <n-radio value="exclude_platforms">排除勾选平台</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Platform and Game Selection (when specific_platforms is selected) -->
                  <div v-if="formData.wageringPlatform === 'specific_platforms'">
                    <PlatformGameSelector
                      v-model="(formData as any).wageringPlatformConfig.selectedPlatforms"
                      :wagering-platform="formData.wageringPlatform"
                      @validation-change="handlePlatformValidation"
                    />
                  </div>

                  <!-- Claim Count -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">领取次数</label>
                    <n-radio-group v-model:value="formData.claimCount">
                      <n-space vertical>
                        <n-radio value="continuous_claim">可连续领取</n-radio>
                        <n-radio value="single_claim_only">领取最高一档(只领一次)</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Reward Settings Table -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-3">奖励设置</label>
                    <div class="border rounded-lg overflow-hidden">
                      <table class="w-full">
                        <thead class="bg-gray-50">
                          <tr>
                            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">有效投注额</th>
                            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">奖励金额</th>
                            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b w-16">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(item, index) in formData.wageringRewardSettings" :key="index" class="border-b">
                            <td class="px-4 py-2">
                              <n-input
                                v-model:value="item.effectiveWageringAmount"
                                placeholder="请输入有效投注额"
                                class="w-full"
                              />
                            </td>
                            <td class="px-4 py-2">
                              <n-input
                                v-model:value="item.rewardAmount"
                                placeholder="请输入奖励金额"
                                class="w-full"
                              />
                            </td>
                            <td class="px-4 py-2 text-center">
                              <n-button
                                v-if="formData.wageringRewardSettings.length > 1"
                                size="small"
                                type="error"
                                @click="removeWageringRewardSetting(index)"
                                class="w-8 h-8 p-0"
                              >
                                <n-icon size="16">
                                  <Close />
                                </n-icon>
                              </n-button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div class="mt-3">
                      <n-button type="primary" @click="addWageringRewardSetting" size="small">
                        <n-icon size="16" class="mr-1">
                          <Add />
                        </n-icon>
                        添加奖励设置
                      </n-button>
                    </div>
                  </div>

                  <!-- Reward Claim Expiry Days -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      * 奖励领取过期天数
                      <n-icon size="16" class="text-blue-500 ml-1">
                        <HelpCircle />
                      </n-icon>
                    </label>
                    <n-input-number
                      v-model:value="formData.wageringRewardExpiryDays"
                      placeholder="请输入过期天数"
                      class="w-full"
                      :min="1"
                    />
                  </div>
                </template>

                <!-- Rescue Fund Specific Fields (only for 救援金 type) -->
                <template v-if="formData.activityType === 'rescue'">
                  <!-- Valid Wagering Platform -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      有效打码平台
                      <n-icon size="16" class="text-blue-500 ml-1">
                        <HelpCircle />
                      </n-icon>
                    </label>
                    
                    
                    <n-radio-group v-model:value="formData.rescueWageringPlatform">
                      <n-space>
                        <n-radio value="all_platforms">全部平台</n-radio>
                        <n-radio value="specific_platforms">指定平台</n-radio>
                        <n-radio value="exclude_platforms">排除勾选平台</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Platform and Game Selection for Rescue (when specific_platforms is selected) -->
                  <div v-if="formData.rescueWageringPlatform === 'specific_platforms'">
                    <PlatformGameSelector
                      v-model="(formData as any).rescueWageringPlatformConfig.selectedPlatforms"
                      :wagering-platform="formData.rescueWageringPlatform"
                      @validation-change="handlePlatformValidation"
                    />
                  </div>

                  <!-- Deduct Discounts -->
                  <div class="flex items-center justify-between">
                    <label class="block text-sm font-medium text-gray-700">
                      扣除优惠
                      <n-icon size="16" class="text-blue-500 ml-1">
                        <HelpCircle />
                      </n-icon>
                    </label>
                    <n-switch v-model:value="formData.deductDiscounts" />
                  </div>

                  <!-- Loss Range -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">亏损范围</label>
                    <n-radio-group v-model:value="formData.lossRange">
                      <n-space>
                        <n-radio value="yesterday">昨日亏损</n-radio>
                        <n-radio value="last_week">上周亏损</n-radio>
                        <n-radio value="last_month">上月亏损</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Daily Reward Limit -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">* 每日奖励上限</label>
                    <n-input
                      v-model:value="formData.dailyRewardLimit"
                      placeholder="请输入每日奖励上限"
                      class="w-full"
                    />
                  </div>

                  <!-- Distribution Method -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">派发方式</label>
                    <n-radio-group v-model:value="formData.rescueDistributionMethod">
                      <n-space vertical>
                        <n-radio value="self_claim_expire">玩家自领-过期作废</n-radio>
                        <n-radio value="self_claim_auto">玩家自领-过期自动派发</n-radio>
                        <n-radio value="manual_distribution">玩家申请-人工派发</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Claim Time -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">领取时间</label>
                    <n-radio-group v-model:value="formData.rescueClaimTime">
                      <n-space>
                        <n-radio value="next_day">次日领取</n-radio>
                        <n-radio value="daily">每日</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Select Time -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">* 选择时间</label>
                    <div class="flex items-center gap-2">
                      <n-time-picker
                        v-model:value="formData.rescueSelectTime"
                        placeholder="00:00:00"
                        class="w-32"
                      />
                      <span class="text-sm text-gray-600">以后可领取</span>
                    </div>
                  </div>

                  <!-- Reward Claim Expiry Days -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      * 奖励领取过期天数
                      <n-icon size="16" class="text-blue-500 ml-1">
                        <HelpCircle />
                      </n-icon>
                    </label>
                    <n-input-number
                      v-model:value="formData.rescueRewardExpiryDays"
                      placeholder="1"
                      class="w-full"
                      :min="1"
                    />
                  </div>

                  <!-- Reward Type -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">奖励类型</label>
                    <n-select
                      v-model:value="formData.rewardType"
                      placeholder="比例"
                      :options="rewardTypeOptions"
                      class="w-full"
                    />
                  </div>

                  <!-- Reward Settings -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-3">奖励设置</label>
                    <div class="space-y-3">
                      <div 
                        v-for="(item, index) in formData.rescueRewardSettings" 
                        :key="index"
                        class="flex gap-3 items-end"
                      >
                        <!-- Loss Amount -->
                        <div class="flex-1">
                          <label class="block text-xs text-gray-600 mb-1">亏损金额</label>
                          <n-input
                            v-model:value="item.lossAmount"
                            placeholder="亏损金额"
                            class="w-full"
                          />
                        </div>
                        
                        <!-- Return Reward Ratio -->
                        <div class="flex-1">
                          <label class="block text-xs text-gray-600 mb-1">返奖比例</label>
                          <n-input-number
                            v-model:value="item.returnRatio"
                            placeholder="0.00"
                            :precision="2"
                            class="w-full"
                            :suffix="'%'"
                          />
                        </div>
                        
                        <!-- Remove Button -->
                        <n-button 
                          v-if="formData.rescueRewardSettings.length > 1"
                          size="small" 
                          type="error" 
                          @click="removeRescueRewardSetting(index)"
                          class="mb-1"
                        >
                          <n-icon size="16">
                            <Close />
                          </n-icon>
                        </n-button>
                      </div>
                      
                      <!-- Add More Button -->
                      <n-button 
                        size="small" 
                        type="primary" 
                        @click="addRescueRewardSetting"
                        class="w-full"
                      >
                        <n-icon size="16" class="mr-1">
                          <Add />
                        </n-icon>
                        添加奖励设置
                      </n-button>
                    </div>
                  </div>
                </template>

                <!-- Sign-in Specific Fields (only for 签到 type) -->
                <template v-if="formData.activityType === 'checkin'">
                  <!-- Valid Wagering Platform -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">有效打码平台</label>
                    <n-radio-group v-model:value="formData.checkinWageringPlatform">
                      <n-space>
                        <n-radio value="all_platforms">全部平台</n-radio>
                        <n-radio value="specific_platforms">指定平台</n-radio>
                        <n-radio value="exclude_platforms">排除勾选平台</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Recharge Method -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">* 充值方式</label>
                    <n-checkbox-group v-model:value="formData.checkinRechargeMethods" @update:value="handleCheckinRechargeMethodChange">
                      <div class="grid grid-cols-2 gap-2">
                        <n-checkbox value="all">全选</n-checkbox>
                        <n-checkbox value="pix">PIX</n-checkbox>
                        <n-checkbox value="customer_service">客服充值</n-checkbox>
                        <n-checkbox value="merchant">银商充值</n-checkbox>
                      </div>
                    </n-checkbox-group>
                  </div>

                  <!-- Sign-in Method -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">* 签到方式</label>
                    <n-radio-group v-model:value="formData.signinMethod">
                      <n-space>
                        <n-radio value="continuous">
                          连续签到
                          <n-icon size="16" class="text-blue-500 ml-1">
                            <HelpCircle />
                          </n-icon>
                        </n-radio>
                        <n-radio value="accumulated">
                          累计签到
                          <n-icon size="16" class="text-blue-500 ml-1">
                            <HelpCircle />
                          </n-icon>
                        </n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Sign-in Period -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">签到周期</label>
                    <n-radio-group v-model:value="formData.signinPeriod">
                      <n-space>
                        <n-radio value="7">7天</n-radio>
                        <n-radio value="15">15天</n-radio>
                        <n-radio value="30">30天</n-radio>
                        <n-radio value="custom">自定义</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Monthly Reset -->
                  <div class="flex items-center justify-between">
                    <label class="block text-sm font-medium text-gray-700">每月重置</label>
                    <n-switch v-model:value="formData.monthlyReset" />
                  </div>

                  <!-- Pop-up After Recharge -->
                  <div class="flex items-center justify-between">
                    <label class="block text-sm font-medium text-gray-700">
                      充值成功后直接弹窗
                      <n-icon size="16" class="text-blue-500 ml-1">
                        <HelpCircle />
                      </n-icon>
                    </label>
                    <n-switch v-model:value="formData.checkinPopupAfterRecharge" />
                  </div>

                  <!-- Enable Make-up Sign-in -->
                  <div class="flex items-center justify-between">
                    <label class="block text-sm font-medium text-gray-700">是否开启补签</label>
                    <n-switch v-model:value="formData.enableMakeupSignin" />
                  </div>

                  <!-- Pop-up Method Before Login -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">登录前弹窗方式</label>
                    <n-radio-group v-model:value="formData.checkinBeforeLoginPopup">
                      <n-space>
                        <n-radio value="none">不弹窗</n-radio>
                        <n-radio value="high_frequency">高频弹窗</n-radio>
                        <n-radio value="daily">每日一次</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Pop-up Method After Login -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">登录后弹窗方式</label>
                    <n-radio-group v-model:value="formData.checkinAfterLoginPopup">
                      <n-space>
                        <n-radio value="none">不弹窗</n-radio>
                        <n-radio value="high_frequency">高频弹窗</n-radio>
                        <n-radio value="daily">每日一次</n-radio>
                        <n-radio value="every_login">每次登录</n-radio>
                        <n-radio value="once_only">只弹一次</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Display Style -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">展示样式</label>
                    <n-radio-group v-model:value="formData.displayStyle">
                      <n-space>
                        <n-radio value="calendar">样式1</n-radio>
                        <n-radio value="list">样式2</n-radio>
                        <n-radio value="cards">样式3</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Style Preview -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">样式预览</label>
                    <div class="w-32 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      <div class="text-center text-gray-500 text-xs">
                        <div>样式{{ formData.displayStyle === 'calendar' ? '1' : formData.displayStyle === 'list' ? '2' : '3' }}预览</div>
                        <div class="mt-2">签到活动弹窗</div>
                      </div>
                    </div>
                  </div>

                 

                  <!-- Reward Method -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">奖励方式</label>
                    <n-radio-group v-model:value="formData.checkinRewardMethod">
                      <n-space>
                        <n-radio value="daily">全员统一</n-radio>
                        <n-radio value="milestone">
                          按VIP等级奖励
                          <n-icon size="16" class="text-blue-500 ml-1">
                            <HelpCircle />
                          </n-icon>
                        </n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Reward Configuration Table -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-3">奖励配置表</label>
                    <div class="overflow-x-auto">
                      <table class="w-full border border-gray-200 rounded-lg min-w-[800px]">
                        <thead class="bg-gray-50">
                          <tr>
                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b w-12">天</th>
                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b min-w-[120px]">类型</th>
                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b min-w-[100px]">奖励金额</th>
                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b min-w-[100px]">充值要求</th>
                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b min-w-[100px]">打码要求</th>
                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b min-w-[100px]">额外奖励</th>
                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b min-w-[160px]">签到图标</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr 
                            v-for="(item, index) in formData.checkinRewardSettings" 
                            :key="index"
                            class="border-b"
                          >
                            <td class="px-3 py-2 text-sm">{{ index + 1 }}</td>
                            <td class="px-3 py-2">
                              <n-select
                                v-model:value="item.type"
                                placeholder="固定"
                                :options="rewardTypeOptions"
                                size="small"
                                class="w-32 min-w-[120px]"
                              />
                            </td>
                            <td class="px-3 py-2">
                              <n-input-number
                                v-model:value="item.rewardAmount"
                                placeholder="0.00"
                                :precision="2"
                                size="small"
                                class="w-28 min-w-[100px]"
                              />
                            </td>
                            <td class="px-3 py-2">
                              <n-input-number
                                v-model:value="item.rechargeRequirement"
                                placeholder="0"
                                size="small"
                                class="w-28 min-w-[100px]"
                              />
                            </td>
                            <td class="px-3 py-2">
                              <n-input-number
                                v-model:value="item.wageringRequirement"
                                placeholder="0"
                                size="small"
                                class="w-28 min-w-[100px]"
                              />
                            </td>
                            <td class="px-3 py-2">
                              <n-input-number
                                v-model:value="item.additionalReward"
                                placeholder="0.00"
                                :precision="2"
                                size="small"
                                class="w-28 min-w-[100px]"
                              />
                            </td>
                            <td class="px-3 py-2">
                              <div class="flex items-center gap-2">
                                <MediaLibrarySelector
                                  v-model="item.checkinIcon"
                                  category="checkin"
                                  placeholder="选择图标"
                                  size="small"
                                  class="w-32 min-w-[120px]"
                                />
                                <div v-if="item.checkinIcon" class="w-8 h-8 border border-gray-200 rounded flex items-center justify-center bg-gray-50">
                                  <img 
                                    :src="item.checkinIcon" 
                                    :alt="`Day ${index + 1} icon`"
                                    class="w-6 h-6 object-contain"
                                    @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div class="mt-3">
                      <n-button 
                        size="small" 
                        type="primary" 
                        @click="addCheckinRewardSetting"
                        class="w-full"
                      >
                        <n-icon size="16" class="mr-1">
                          <Add />
                        </n-icon>
                        添加签到天数
                      </n-button>
                    </div>
                  </div>
                </template>

                <!-- Lucky Turntable Specific Fields (only for 幸运转盘 type) -->
                <template v-if="formData.activityType === 'luckyspin'">
                  <!-- Turntable Switch -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">* 转盘开关</label>
                    <n-checkbox-group v-model:value="formData.turntableSwitches">
                      <div class="space-y-2">
                        <n-checkbox value="all">全选</n-checkbox>
                        <n-checkbox value="silver">白银转盘</n-checkbox>
                        <n-checkbox value="gold">黄金转盘</n-checkbox>
                        <n-checkbox value="diamond">钻石转盘</n-checkbox>
                      </div>
                    </n-checkbox-group>
                  </div>

                  <!-- Lucky Value Validity Period -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      幸运值有效期
                      <n-icon size="16" class="text-blue-500 ml-1">
                        <HelpCircle />
                      </n-icon>
                    </label>
                    <n-radio-group v-model:value="formData.luckyValueValidityPeriod">
                      <n-space>
                        <n-radio value="daily">每日</n-radio>
                        <n-radio value="weekly">每周</n-radio>
                        <n-radio value="monthly">每月</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Reward Type -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">奖励类型</label>
                    <n-radio-group v-model:value="formData.luckyspinRewardType">
                      <n-space>
                        <n-radio value="valid_bet">有效投注</n-radio>
                        <n-radio value="task_creation">任务创建</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Valid Wagering Platform -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      有效打码平台
                      <n-icon size="16" class="text-blue-500 ml-1">
                        <HelpCircle />
                      </n-icon>
                    </label>
                    <n-radio-group v-model:value="formData.luckyspinWageringPlatform">
                      <n-space>
                        <n-radio value="all_platforms">全部平台</n-radio>
                        <n-radio value="specific_platforms">指定平台</n-radio>
                        <n-radio value="exclude_platforms">排除勾选平台</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Obtain Lucky Value -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">* 获得幸运值</label>
                    <div class="flex items-center gap-3">
                      <n-input-number
                        v-model:value="formData.luckyValuePerBet"
                        placeholder="1"
                        class="w-24"
                        :min="1"
                      />
                      <span class="text-sm text-gray-600">有效投注=1幸运值</span>
                    </div>
                  </div>

                  <!-- Winning Announcement -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">获奖公告</label>
                    <div class="space-y-3">
                      <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600">开启获奖公告</span>
                        <n-switch v-model:value="formData.enableWinningAnnouncement" />
                      </div>
                      
                      <div v-if="formData.enableWinningAnnouncement" class="flex items-center gap-2">
                        <span class="text-sm text-gray-600">每</span>
                        <n-input-number
                          v-model:value="formData.announcementInterval"
                          placeholder="24"
                          class="w-20"
                          :min="1"
                        />
                        <span class="text-sm text-gray-600">小时随机显示</span>
                        <n-input-number
                          v-model:value="formData.announcementCount"
                          placeholder="20"
                          class="w-20"
                          :min="1"
                        />
                        <span class="text-sm text-gray-600">条</span>
                      </div>
                      
                      <div class="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        抽中金额最大的三条奖励,会显示在获奖公告
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Lucky Bet Slip Specific Fields (only for 幸运注单 type) -->
                <template v-if="formData.activityType === 'luckywager'">
                  <!-- Valid Wagering Platform -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      有效打码平台
                      <n-icon size="16" class="text-blue-500 ml-1">
                        <HelpCircle />
                      </n-icon>
                    </label>
                    <n-radio-group v-model:value="formData.luckywagerWageringPlatform">
                      <n-space>
                        <n-radio value="all_platforms">全部平台</n-radio>
                        <n-radio value="specific_platforms">指定平台</n-radio>
                        <n-radio value="exclude_platforms">排除勾选平台</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Claim Count Limit -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">* 领取次数限制</label>
                    <n-radio-group v-model:value="formData.claimCountLimit">
                      <n-space>
                        <n-radio value="fixed">固定次数</n-radio>
                        <n-radio value="daily_recharge">当日充值</n-radio>
                        <n-radio value="daily_wagering">当日打码</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Daily Count Limit -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">* 每日次数上限</label>
                    <n-input
                      v-model:value="formData.dailyCountLimit"
                      placeholder="请输入每日次数上限"
                      class="w-full"
                    />
                  </div>

                  <!-- Total Count Limit -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">* 总次数上限</label>
                    <n-input
                      v-model:value="formData.totalCountLimit"
                      placeholder="请输入活动总次数, 0表示不限制"
                      class="w-full"
                    />
                  </div>

                  <!-- Minimum Valid Bet Amount -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">* 最低有效投注金额</label>
                    <n-input
                      v-model:value="formData.minimumValidBetAmount"
                      placeholder="请输入金额"
                      class="w-full"
                    />
                  </div>

                  <!-- Reward Method -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">* 奖励方式</label>
                    <n-radio-group v-model:value="formData.luckywagerRewardMethod">
                      <n-space>
                        <n-radio value="fixed_amount">固定金额</n-radio>
                        <n-radio value="bet_multiple">有效投注金额倍数</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Bet Slip Number Rule -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      * 注单号规则
                      <n-icon size="16" class="text-blue-500 ml-1">
                        <HelpCircle />
                      </n-icon>
                    </label>
                    <n-radio-group v-model:value="formData.betSlipNumberRule">
                      <n-space>
                        <n-radio value="ending_digits">尾号</n-radio>
                        <n-radio value="consecutive_digits">连号</n-radio>
                        <n-radio value="contains_anywhere">包含(任意位置)</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Large Amount Review Amount -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      * 大额审核金额
                      <n-icon size="16" class="text-blue-500 ml-1">
                        <HelpCircle />
                      </n-icon>
                    </label>
                    <div class="flex items-center gap-2">
                      <span class="text-sm text-gray-600">奖励金额 ≥</span>
                      <n-input
                        v-model:value="formData.largeAmountReviewAmount"
                        placeholder="请输入大额审核金额, 0表示不限制"
                        class="flex-1"
                      />
                      <span class="text-sm text-gray-600">需人工审核</span>
                    </div>
                  </div>

                  <!-- Dynamic Reward Configuration -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-3">奖励配置</label>
                    <div class="space-y-3">
                      <div 
                        v-for="(item, index) in formData.luckywagerRewardSettings" 
                        :key="index"
                        class="flex gap-3 items-end"
                      >
                        <!-- Bet Slip Ending Digits -->
                        <div class="flex-1">
                          <label class="block text-xs text-gray-600 mb-1">注单尾号为</label>
                          <n-input
                            v-model:value="item.betSlipEnding"
                            placeholder="请输入"
                            class="w-full"
                          />
                        </div>
                        
                        <!-- Reward Amount -->
                        <div class="flex-1">
                          <label class="block text-xs text-gray-600 mb-1">奖励金额</label>
                          <n-input
                            v-model:value="item.rewardAmount"
                            placeholder="请输入"
                            class="w-full"
                          />
                        </div>
                        
                        <!-- Remove Button -->
                        <n-button 
                          v-if="formData.luckywagerRewardSettings.length > 1"
                          size="small" 
                          type="error" 
                          @click="removeLuckywagerRewardSetting(index)"
                          class="mb-1"
                        >
                          <n-icon size="16">
                            <Close />
                          </n-icon>
                        </n-button>
                      </div>
                      
                      <!-- Add More Button -->
                      <n-button 
                        size="small" 
                        type="primary" 
                        @click="addLuckywagerRewardSetting"
                        class="w-full"
                      >
                        <n-icon size="16" class="mr-1">
                          <Add />
                        </n-icon>
                        添加奖励配置
                      </n-button>
                    </div>
                  </div>
                                            </template>

                            <!-- Red Packet Specific Fields (only for 红包 type) -->
                            <template v-if="formData.activityType === 'redpacket'">
                              <!-- Red Packet Type -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                  红包类型
                                  <n-icon size="16" class="text-blue-500 ml-1">
                                    <HelpCircle />
                                  </n-icon>
                                </label>
                                <n-radio-group v-model:value="formData.redPacketType">
                                  <n-space>
                                    <n-radio value="fixed">开红包</n-radio>
                                    <n-radio value="random">抢红包</n-radio>
                                    <n-radio value="progressive">送红包</n-radio>
                                  </n-space>
                                </n-radio-group>
                              </div>

                              <!-- Daily Distribution Time (only for random type) -->
                              <div v-if="formData.redPacketType === 'random'">
                                <label class="block text-sm font-medium text-gray-700 mb-3">每日派发时间</label>
                                <div class="space-y-3">
                                  <div v-for="(item, index) in formData.redPacketDailyDistributionTimes" :key="index" class="flex items-center gap-3">
                                    <span class="text-sm text-gray-600 w-8">{{ index + 1 }}</span>
                                    <div class="flex-1 flex items-center gap-2">
                                      <n-time-picker
                                        v-model:value="item.startTime"
                                        placeholder="00:00"
                                        format="HH:mm"
                                        class="w-24"
                                      />
                                      <span class="text-gray-500">至</span>
                                      <n-time-picker
                                        v-model:value="item.endTime"
                                        placeholder="23:59"
                                        format="HH:mm"
                                        class="w-24"
                                      />
                                    </div>
                                    <n-button
                                      v-if="formData.redPacketDailyDistributionTimes.length > 1"
                                      size="small"
                                      type="error"
                                      @click="removeRedPacketDailyDistributionTime(index)"
                                      class="w-8 h-8 p-0"
                                    >
                                      <n-icon size="16">
                                        <Close />
                                      </n-icon>
                                    </n-button>
                                  </div>
                                </div>
                                <div class="mt-3">
                                  <n-button type="primary" @click="addRedPacketDailyDistributionTime" size="small">
                                    <n-icon size="16" class="mr-1">
                                      <Add />
                                    </n-icon>
                                    添加派发时间
                                  </n-button>
                                </div>
                              </div>

                              <!-- Claim Conditions -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">领取条件</label>
                                <n-radio-group v-model:value="formData.redPacketClaimCondition">
                                  <n-space>
                                    <n-radio value="none">无条件</n-radio>
                                    <n-radio value="deposit">累计充值</n-radio>
                                    <n-radio value="wagering">累计打码</n-radio>
                                    <n-radio value="signup">充值次数</n-radio>
                                  </n-space>
                                </n-radio-group>
                              </div>

                              <!-- Security Verification -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                  安全验证
                                  <n-icon size="16" class="text-blue-500 ml-1">
                                    <HelpCircle />
                                  </n-icon>
                                </label>
                                <n-switch v-model:value="formData.securityVerification" />
                              </div>

                              <!-- Reward Type -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">奖励类型</label>
                                <n-radio-group v-model:value="formData.redPacketRewardType">
                                  <n-space>
                                    <n-radio value="fixed">固定金额</n-radio>
                                    <n-radio value="percent">百分比</n-radio>
                                    <n-radio value="points">积分</n-radio>
                                    <n-radio value="spins">旋转</n-radio>
                                    <n-radio value="coupon">优惠券</n-radio>
                                  </n-space>
                                </n-radio-group>
                              </div>


                              <!-- Total Count Limit -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                  * 总计金额
                                  <n-icon size="16" class="text-blue-500 ml-1">
                                    <HelpCircle />
                                  </n-icon>
                                </label>
                                <n-input-number
                                  v-model:value="formData.redPacketTotalAmount"
                                  placeholder="1000"
                                  :precision="2"
                                  class="w-full"
                                />
                              </div>

                              <!-- Count Limit per Time Period -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                  * 每个时间段红包总数
                                  <n-icon size="16" class="text-blue-500 ml-1">
                                    <HelpCircle />
                                  </n-icon>
                                </label>
                                <n-input-number
                                  v-model:value="formData.redPacketCountPerPeriod"
                                  placeholder="10000"
                                  class="w-full"
                                />
                              </div>

                              <!-- Actual Red Packet Amount Range -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                  * 实际红包金额
                                  <n-icon size="16" class="text-blue-500 ml-1">
                                    <HelpCircle />
                                  </n-icon>
                                </label>
                                <div class="flex items-center gap-2">
                                  <n-input-number
                                    v-model:value="formData.actualRedPacketMin"
                                    placeholder="0.02"
                                    :precision="2"
                                    class="flex-1"
                                  />
                                  <span class="text-gray-500">-</span>
                                  <n-input-number
                                    v-model:value="formData.actualRedPacketMax"
                                    placeholder="0.50"
                                    :precision="2"
                                    class="flex-1"
                                  />
                                </div>
                              </div>

                              <!-- Display Red Packet Amount Range -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                  * 展示红包金额
                                  <n-icon size="16" class="text-blue-500 ml-1">
                                    <HelpCircle />
                                  </n-icon>
                                </label>
                                <div class="flex items-center gap-2">
                                  <n-input-number
                                    v-model:value="formData.displayedRedPacketMin"
                                    placeholder="0.01"
                                    :precision="2"
                                    class="flex-1"
                                  />
                                  <span class="text-gray-500">-</span>
                                  <n-input-number
                                    v-model:value="formData.displayedRedPacketMax"
                                    placeholder="378.00"
                                    :precision="2"
                                    class="flex-1"
                                  />
                                </div>
                              </div>

                              <!-- Grab Chances per Time Period -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                  * 每个时间段限抢次数
                                  <n-icon size="16" class="text-blue-500 ml-1">
                                    <HelpCircle />
                                  </n-icon>
                                </label>
                                <n-input-number
                                  v-model:value="formData.grabLimitPerPeriod"
                                  placeholder="1"
                                  class="w-full"
                                />
                              </div>

                              <!-- Daily Grab Chances -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                  * 每日限抢次数
                                  <n-icon size="16" class="text-blue-500 ml-1">
                                    <HelpCircle />
                                  </n-icon>
                                </label>
                                <n-radio-group v-model:value="formData.dailyGrabLimitType">
                                  <n-space>
                                    <n-radio value="fixed">固定</n-radio>
                                    <n-radio value="daily_charge">当日充值</n-radio>
                                    <n-radio value="daily_bet">当日打码</n-radio>
                                  </n-space>
                                </n-radio-group>
                                <n-input-number
                                  v-if="formData.dailyGrabLimitType === 'fixed'"
                                  v-model:value="formData.dailyGrabLimit"
                                  placeholder="3"
                                  class="w-full mt-2"
                                />
                              </div>

                              <!-- Total Grab Limit -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                  * 总次数上限
                                  <n-icon size="16" class="text-blue-500 ml-1">
                                    <HelpCircle />
                                  </n-icon>
                                </label>
                                <n-input-number
                                  v-model:value="formData.totalGrabLimit"
                                  placeholder="1"
                                  :min="1"
                                  class="w-full"
                                />
                              </div>

                              <!-- Homepage Display Style -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-3">首页展示样式</label>
                                
                                <!-- Radio Button Selection -->
                                <n-radio-group v-model:value="formData.redPacketDisplayStyle" class="mb-6">
                                  <n-space size="large">
                                    <n-radio 
                                      v-for="style in allRedPacketStyles" 
                                      :key="style.value"
                                      :value="style.value"
                                      class="text-sm"
                                    >
                                      {{ style.label }}
                                    </n-radio>
                                  </n-space>
                                </n-radio-group>

                                <!-- Style Preview -->
                                <div>
                                  <label class="block text-sm font-medium text-gray-700 mb-3">样式预览</label>
                                  <div class="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 flex justify-center">
                                    <div class="text-center">
                                      <img 
                                        :src="getCurrentStyleImage()" 
                                        :alt="getCurrentStyleLabel()"
                                        class="w-32 h-32 mx-auto object-contain"
                                        v-if="getCurrentStyleImage()"
                                      />
                                      <div 
                                        v-else
                                        class="w-32 h-32 mx-auto bg-gray-200 rounded-lg flex items-center justify-center text-gray-500"
                                      >
                                        预览图片
                                      </div>
                                      <p class="mt-3 text-sm text-gray-600">{{ getCurrentStyleLabel() }}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </template>

                            <!-- Investment Specific Fields (only for 投资 type) -->
                            <template v-if="formData.activityType === 'invest'">
                              <!-- Investment Type -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">投资类型</label>
                                <n-radio-group v-model:value="formData.investmentType">
                                  <n-space>
                                    <n-radio value="fixed_amount">固定金额</n-radio>
                                    <n-radio value="gift_by_ratio">按比例赠送</n-radio>
                                  </n-space>
                                </n-radio-group>
                              </div>

                              <!-- Reward Days -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">* 返奖天数</label>
                                <n-input-number
                                  v-model:value="formData.rewardDays"
                                  placeholder="3"
                                  class="w-full"
                                  :min="1"
                                />
                              </div>

                              <!-- Distribution Method -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">派发方式</label>
                                <n-radio-group v-model:value="formData.investmentDistributionMethod">
                                  <n-space>
                                    <n-radio value="daily_auto">玩家自领-每日自动派发</n-radio>
                                    <n-radio value="expired_auto">玩家自领-过期自动派发</n-radio>
                                  </n-space>
                                </n-radio-group>
                              </div>

                              <!-- Investment Configuration Table -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-3">投资配置</label>
                                <div class="overflow-x-auto">
                                  <table class="w-full border border-gray-200 rounded-lg">
                                    <thead class="bg-gray-50">
                                      <tr>
                                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b">投资金额</th>
                                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b">赠送金额</th>
                                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b">累计返奖</th>
                                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b">每日返奖</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr 
                                        v-for="(item, index) in formData.investmentSettings" 
                                        :key="index"
                                        class="border-b"
                                      >
                                        <td class="px-3 py-2">
                                          <n-input
                                            v-model:value="item.investmentAmount"
                                            placeholder="请输入投资金额"
                                            size="small"
                                            class="w-full"
                                          />
                                        </td>
                                        <td class="px-3 py-2">
                                          <n-input
                                            v-model:value="item.giftAmount"
                                            placeholder="请输入赠送金额"
                                            size="small"
                                            class="w-full"
                                          />
                                        </td>
                                        <td class="px-3 py-2">
                                          <div class="text-sm text-gray-500">
                                            {{ calculateAccumulatedReward(item) }}
                                          </div>
                                        </td>
                                        <td class="px-3 py-2">
                                          <div class="text-sm text-gray-500">
                                            {{ calculateDailyReward(item) }}
                                          </div>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                                <div class="mt-3">
                                  <n-button 
                                    size="small" 
                                    type="primary" 
                                    @click="addInvestmentSetting"
                                    class="w-full"
                                  >
                                    <n-icon size="16" class="mr-1">
                                      <Add />
                                    </n-icon>
                                    添加投资配置
                                  </n-button>
                                </div>
                              </div>
                            </template>

                            <!-- Promotion Specific Fields (only for 推广 type) -->
                            <template v-if="formData.activityType === 'promotion'">
                              <!-- Effective Member Standard -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-3">有效会员标准</label>
                                
                                <!-- Accumulated Recharge -->
                                <div class="mb-3">
                                  <label class="block text-sm font-medium text-gray-700 mb-2">* 累计充值</label>
                                  <n-input
                                    v-model:value="formData.promotionAccumulatedRecharge"
                                    placeholder="请输入累计充值, 0表示不限制"
                                    class="w-full"
                                  />
                                </div>

                                <!-- Accumulated Recharge Days -->
                                <div class="mb-3">
                                  <label class="block text-sm font-medium text-gray-700 mb-2">* 累计充值天数</label>
                                  <n-input
                                    v-model:value="formData.promotionAccumulatedRechargeDays"
                                    placeholder="请输入累计充值天数, 0表示不限制"
                                    class="w-full"
                                  />
                                </div>

                                <!-- Accumulated Recharge Count -->
                                <div class="mb-3">
                                  <label class="block text-sm font-medium text-gray-700 mb-2">* 累计充值次数</label>
                                  <n-input
                                    v-model:value="formData.promotionAccumulatedRechargeCount"
                                    placeholder="请输入累计充值次数, 0表示不限制"
                                    class="w-full"
                                  />
                                </div>

                                <!-- Accumulated Wagering -->
                                <div class="mb-3">
                                  <label class="block text-sm font-medium text-gray-700 mb-2">* 累计打码</label>
                                  <n-input
                                    v-model:value="formData.promotionAccumulatedWagering"
                                    placeholder="请输入金额, 0表示不限制"
                                    class="w-full"
                                  />
                                </div>

                                <!-- Effective Wagering Platform -->
                                <div class="mb-3">
                                  <label class="block text-sm font-medium text-gray-700 mb-2">有效打码平台</label>
                                  <n-radio-group v-model:value="formData.promotionWageringPlatform">
                                    <n-space>
                                      <n-radio value="all_platforms">全部平台</n-radio>
                                      <n-radio value="specific_platforms">指定平台</n-radio>
                                      <n-radio value="exclude_platforms">排除勾选平台</n-radio>
                                    </n-space>
                                  </n-radio-group>
                                </div>

                                <!-- Platform and Game Selection for Promotion (when specific_platforms is selected) -->
                                <div v-if="formData.promotionWageringPlatform === 'specific_platforms'">
                                  <PlatformGameSelector
                                    v-model="(formData as any).promotionWageringPlatformConfig.selectedPlatforms"
                                    :wagering-platform="formData.promotionWageringPlatform"
                                    @validation-change="handlePlatformValidation"
                                  />
                                </div>

                                <!-- Download App and Login -->
                                <div class="flex items-center justify-between mb-3">
                                  <label class="block text-sm font-medium text-gray-700">下载app并登录</label>
                                  <n-switch v-model:value="formData.promotionDownloadAppLogin" />
                                </div>
                              </div>

                              <!-- Statistical Number of People Limit -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-3">统计人数限制</label>
                                
                                <!-- Same Registration IP Limit -->
                                <div class="mb-3">
                                  <label class="block text-sm font-medium text-gray-700 mb-2">* 同注册IP上限</label>
                                  <n-input
                                    v-model:value="formData.promotionSameIPLimit"
                                    placeholder="请输入同注册IP上限, 0表示不限制"
                                    class="w-full"
                                  />
                                </div>

                                <!-- Same Registration Device Limit -->
                                <div class="mb-3">
                                  <label class="block text-sm font-medium text-gray-700 mb-2">* 同注册设备上限</label>
                                  <n-input
                                    v-model:value="formData.promotionSameDeviceLimit"
                                    placeholder="请输入同注册设备上限, 0表示不限制"
                                    class="w-full"
                                  />
                                </div>
                              </div>

                              <!-- Reward Type -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">奖励类型</label>
                                <n-radio-group v-model:value="formData.promotionRewardType">
                                  <n-space>
                                    <n-radio value="fixed_amount">固定金额</n-radio>
                                    <n-radio value="random_amount">随机金额</n-radio>
                                    <n-radio value="accumulated_daily">
                                      累计日结(只领取最高一档)
                                      <n-icon size="16" class="text-blue-500 ml-1">
                                        <HelpCircle />
                                      </n-icon>
                                    </n-radio>
                                  </n-space>
                                </n-radio-group>
                              </div>

                              <!-- Whether to Display on Agent Page -->
                              <div class="flex items-center justify-between">
                                <label class="block text-sm font-medium text-gray-700">是否展示到代理页面</label>
                                <n-switch v-model:value="formData.promotionDisplayOnAgentPage" />
                              </div>

                              <!-- Distribution Method -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">派发方式</label>
                                <n-radio-group v-model:value="formData.promotionDistributionMethod">
                                  <n-space>
                                    <n-radio value="expired_invalid">玩家自领-过期作废</n-radio>
                                    <n-radio value="expired_auto">玩家自领-过期自动派发</n-radio>
                                    <n-radio value="manual_distribution">玩家申请-人工派发</n-radio>
                                  </n-space>
                                </n-radio-group>
                              </div>

                              <!-- Display Claim Method -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">展示领取方式</label>
                                <n-radio-group v-model:value="formData.promotionDisplayClaimMethod">
                                  <n-space>
                                    <n-radio value="open_redpacket">
                                      开红包
                                      <n-icon size="16" class="text-blue-500 ml-1">
                                        <HelpCircle />
                                      </n-icon>
                                    </n-radio>
                                    <n-radio value="open_treasurechest">
                                      开宝箱
                                      <n-icon size="16" class="text-blue-500 ml-1">
                                        <HelpCircle />
                                      </n-icon>
                                    </n-radio>
                                    <n-radio value="claim_button">
                                      领取按钮
                                      <n-icon size="16" class="text-blue-500 ml-1">
                                        <HelpCircle />
                                      </n-icon>
                                    </n-radio>
                                  </n-space>
                                </n-radio-group>
                              </div>

                              <!-- Whether to Display Amount -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">是否显示金额</label>
                                <n-radio-group v-model:value="formData.promotionDisplayAmount">
                                  <n-space>
                                    <n-radio value="hide">不显示</n-radio>
                                    <n-radio value="show">显示</n-radio>
                                  </n-space>
                                </n-radio-group>
                              </div>

                              <!-- Reward Settings -->
                              <div>
                                <div class="flex items-center justify-between mb-3">
                                  <label class="block text-sm font-medium text-gray-700">奖励设置</label>
                                  <div class="flex items-center gap-2">
                                    <n-button 
                                      size="small" 
                                      type="info" 
                                      text
                                      @click="downloadPromotionTemplate"
                                    >
                                      下载模板
                                    </n-button>
                                    <n-button 
                                      size="small" 
                                      type="primary" 
                                      text
                                      @click="batchImportPromotion"
                                    >
                                      批量导入 (CSV/Excel)
                                      <n-icon size="16" class="text-blue-500 ml-1">
                                        <HelpCircle />
                                      </n-icon>
                                    </n-button>
                                  </div>
                                </div>
                                
                                <div class="overflow-x-auto">
                                  <table class="w-full border border-gray-200 rounded-lg">
                                    <thead class="bg-gray-50">
                                      <tr>
                                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b">有效推广人数</th>
                                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b">奖励金额</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr 
                                        v-for="(item, index) in formData.promotionRewardSettings" 
                                        :key="index"
                                        class="border-b"
                                      >
                                        <td class="px-3 py-2">
                                          <n-input
                                            v-model:value="item.effectivePromotionCount"
                                            placeholder="请输入有效推广人数"
                                            size="small"
                                            class="w-full"
                                          />
                                        </td>
                                        <td class="px-3 py-2">
                                          <n-input
                                            v-model:value="item.rewardAmount"
                                            placeholder="请输入奖励金额"
                                            size="small"
                                            class="w-full"
                                          />
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                                <div class="mt-3">
                                  <n-button 
                                    size="small" 
                                    type="primary" 
                                    @click="addPromotionRewardSetting"
                                    class="w-full"
                                  >
                                    <n-icon size="16" class="mr-1">
                                      <Add />
                                    </n-icon>
                                    添加奖励设置
                                  </n-button>
                                </div>
                              </div>
                            </template>

                            <!-- Agent Specific Fields (only for 代理 type) -->
                            <template v-if="formData.activityType === 'agent'">
                              <!-- Whether to Display on Agent Page -->
                              <div class="flex items-center justify-between">
                                <label class="block text-sm font-medium text-gray-700">是否展示到代理页面</label>
                                <n-switch v-model:value="formData.agentDisplayOnAgentPage" />
                              </div>

                              <!-- Distribution Method -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">派发方式</label>
                                <n-radio-group v-model:value="formData.agentDistributionMethod">
                                  <n-space>
                                    <n-radio value="expired_invalid">玩家自领-过期作废</n-radio>
                                    <n-radio value="expired_auto">玩家自领-过期自动派发</n-radio>
                                    <n-radio value="manual_distribution">玩家申请-人工派发</n-radio>
                                  </n-space>
                                </n-radio-group>
                              </div>

                              <!-- Reward Claim Expiry Days -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                  * 奖励领取过期天数
                                  <n-icon size="16" class="text-blue-500 ml-1">
                                    <HelpCircle />
                                  </n-icon>
                                </label>
                                <n-input-number
                                  v-model:value="formData.agentRewardClaimExpiryDays"
                                  placeholder="1"
                                  class="w-full"
                                  :min="1"
                                />
                              </div>

                              <!-- Reward Cycle -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">返奖周期</label>
                                <n-radio-group v-model:value="formData.agentRewardCycle">
                                  <n-space>
                                    <n-radio value="daily">每日返奖</n-radio>
                                    <n-radio value="weekly">每周返奖</n-radio>
                                    <n-radio value="monthly">每月返奖</n-radio>
                                  </n-space>
                                </n-radio-group>
                              </div>

                              <!-- Reward Type (First Instance) -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">返奖类型</label>
                                <n-radio-group v-model:value="formData.agentRewardType">
                                  <n-space>
                                    <n-radio value="agent_rebate">代理返佣</n-radio>
                                    <n-radio value="direct_member_accumulated_recharge">直属会员累计充值</n-radio>
                                    <n-radio value="direct_member_first_recharge">
                                      直属会员首充
                                      <n-icon size="16" class="text-blue-500 ml-1">
                                        <HelpCircle />
                                      </n-icon>
                                    </n-radio>
                                  </n-space>
                                </n-radio-group>
                              </div>

                              <!-- Reward Type (Second Instance) -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">奖励类型</label>
                                <n-radio-group v-model:value="formData.agentRewardAmountType">
                                  <n-space>
                                    <n-radio value="fixed_amount">固定金额</n-radio>
                                    <n-radio value="proportional_amount">比例金额</n-radio>
                                  </n-space>
                                </n-radio-group>
                              </div>

                              <!-- Reward Settings -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-3">奖励设置</label>
                                <div class="space-y-3">
                                  <div 
                                    v-for="(item, index) in formData.agentRewardSettings" 
                                    :key="index"
                                    class="flex gap-3 items-end"
                                  >
                                    <!-- Rebate Amount -->
                                    <div class="flex-1">
                                      <label class="block text-xs text-gray-600 mb-1">返佣金额</label>
                                      <n-input
                                        v-model:value="item.rebateAmount"
                                        placeholder="请输入返佣金额"
                                        class="w-full"
                                      />
                                    </div>
                                    
                                    <!-- Reward Amount -->
                                    <div class="flex-1">
                                      <label class="block text-xs text-gray-600 mb-1">奖励金额</label>
                                      <n-input
                                        v-model:value="item.rewardAmount"
                                        placeholder="奖励金额"
                                        class="w-full"
                                      />
                                    </div>
                                    
                                    <!-- Remove Button -->
                                    <n-button 
                                      v-if="formData.agentRewardSettings.length > 1"
                                      size="small" 
                                      type="error" 
                                      @click="removeAgentRewardSetting(index)"
                                      class="mb-1"
                                    >
                                      <n-icon size="16">
                                        <Close />
                                      </n-icon>
                                    </n-button>
                                  </div>
                                  
                                  <!-- Add More Button -->
                                  <n-button 
                                    size="small" 
                                    type="primary" 
                                    @click="addAgentRewardSetting"
                                    class="w-full"
                                  >
                                    <n-icon size="16" class="mr-1">
                                      <Add />
                                    </n-icon>
                                    添加奖励设置
                                  </n-button>
                                </div>
                              </div>
                            </template>

                            <!-- Collect Characters Specific Fields (only for 集字 type) -->
                            <template v-if="formData.activityType === 'collect'">
                              <!-- Collect Characters Combination -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">集字组合</label>
                                <div class="space-y-3">
                                  <!-- Combination Type -->
                                  <div>
                                    <n-select
                                      v-model:value="formData.collectCombinationType"
                                      placeholder="节日语"
                                      :options="collectCombinationOptions"
                                      class="w-full"
                                    />
                                  </div>
                                  
                                  <!-- Combination Name -->
                                  <div>
                                    <n-select
                                      v-model:value="formData.collectCombinationName"
                                      placeholder="新年大吉"
                                      :options="collectCombinationNameOptions"
                                      class="w-full"
                                    />
                                  </div>
                                  
                                  <!-- Character Display -->
                                  <div class="flex gap-2 justify-center">
                                    <div 
                                      v-for="(char, index) in formData.collectCharacters" 
                                      :key="index"
                                      class="w-16 h-20 bg-red-500 rounded-lg flex items-center justify-center text-white text-2xl font-bold border-2 border-yellow-400"
                                    >
                                      {{ char }}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <!-- Amount Distribution Method -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">瓜分金额方式</label>
                                <n-radio-group v-model:value="formData.collectDistributionMethod">
                                  <n-space>
                                    <n-radio value="daily">每日瓜分</n-radio>
                                    <n-radio value="weekly">每周瓜分</n-radio>
                                    <n-radio value="monthly">每月瓜分</n-radio>
                                  </n-space>
                                </n-radio-group>
                              </div>

                              <!-- Reward Claim Expiry Days -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">* 奖励领取过期天数</label>
                                <n-input-number
                                  v-model:value="formData.collectRewardClaimExpiryDays"
                                  placeholder="1"
                                  class="w-full"
                                  :min="1"
                                />
                              </div>

                              <!-- Actual Distribution Amount -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">* 实际瓜分金额</label>
                                <n-input
                                  v-model:value="formData.collectActualDistributionAmount"
                                  :placeholder="`请输入${getDistributionMethodText()}瓜分`"
                                  class="w-full"
                                />
                              </div>

                              <!-- Displayed Distribution Amount -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">* 展示瓜分金额</label>
                                <n-input
                                  v-model:value="formData.collectDisplayedDistributionAmount"
                                  :placeholder="`请输入${getDistributionMethodText()}瓜分`"
                                  class="w-full"
                                />
                              </div>

                              <!-- Character Collection Method -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-3">集字获得途径</label>
                                
                                <!-- Important Note -->
                                <div class="text-xs text-orange-600 bg-orange-50 p-2 rounded mb-3">
                                  重要提示:获取条件修改后,次日才生效
                                </div>
                                
                                <!-- Conditions Table -->
                                <div class="space-y-3">
                                  <div 
                                    v-for="(item, index) in formData.collectConditions" 
                                    :key="index"
                                    class="flex gap-3 items-end"
                                  >
                                    <!-- Type -->
                                    <div class="flex-1">
                                      <label class="block text-xs text-gray-600 mb-1">类型</label>
                                      <n-select
                                        v-model:value="item.type"
                                        placeholder="有效投注"
                                        :options="collectConditionTypeOptions"
                                        size="small"
                                        class="w-full"
                                      />
                                    </div>
                                    
                                    <!-- Condition Value -->
                                    <div class="flex-1">
                                      <label class="block text-xs text-gray-600 mb-1">条件值</label>
                                      <n-input
                                        v-model:value="item.conditionValue"
                                        placeholder="请输入"
                                        size="small"
                                        class="w-full"
                                      />
                                    </div>
                                    
                                    <!-- Daily Count Limit -->
                                    <div class="flex-1">
                                      <label class="block text-xs text-gray-600 mb-1">每日次数上限</label>
                                      <n-input
                                        v-model:value="item.dailyCountLimit"
                                        placeholder="请输入"
                                        size="small"
                                        class="w-full"
                                      />
                                    </div>
                                    
                                    <!-- Remove Button -->
                                    <n-button 
                                      v-if="formData.collectConditions.length > 1"
                                      size="small" 
                                      type="error" 
                                      @click="removeCollectCondition(index)"
                                      class="mb-1"
                                    >
                                      <n-icon size="16">
                                        <Close />
                                      </n-icon>
                                    </n-button>
                                  </div>
                                  
                                  <!-- Add More Button -->
                                  <n-button 
                                    size="small" 
                                    type="primary" 
                                    @click="addCollectCondition"
                                    class="w-full"
                                  >
                                    <n-icon size="16" class="mr-1">
                                      <Add />
                                    </n-icon>
                                    添加集字条件
                                  </n-button>
                                </div>
                              </div>
                            </template>

                            <!-- Guessing/Competition Specific Fields (only for 竞猜 type) -->
                            <template v-if="formData.activityType === 'guessing'">
                              <!-- Team/Match Configuration -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-3">队伍配置</label>
                                <div class="overflow-x-auto">
                                  <table class="w-full border border-gray-200 rounded-lg">
                                    <thead class="bg-gray-50">
                                      <tr>
                                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b">编号</th>
                                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b">队伍Icon</th>
                                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b">队伍中文名</th>
                                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b">队伍英文名</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr 
                                        v-for="(team, index) in formData.guessingTeams" 
                                        :key="index"
                                        class="border-b"
                                      >
                                        <td class="px-3 py-2 text-sm">{{ index + 1 }}</td>
                                        <td class="px-3 py-2">
                                          <n-button 
                                            size="small" 
                                            type="primary" 
                                            @click="uploadTeamIcon(index)"
                                            class="w-16 h-16"
                                          >
                                            <n-icon size="24">
                                              <Add />
                                            </n-icon>
                                          </n-button>
                                        </td>
                                        <td class="px-3 py-2">
                                          <n-input
                                            v-model:value="team.chineseName"
                                            placeholder="请输入队伍中文名"
                                            size="small"
                                            class="w-full"
                                          />
                                        </td>
                                        <td class="px-3 py-2">
                                          <n-input
                                            v-model:value="team.englishName"
                                            placeholder="请输入队伍英文名"
                                            size="small"
                                            class="w-full"
                                          />
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                                
                                <!-- Add More Teams Button -->
                                <div class="mt-3">
                                  <n-button 
                                    size="small" 
                                    type="primary" 
                                    @click="addGuessingTeam"
                                    class="w-full"
                                  >
                                    <n-icon size="16" class="mr-1">
                                      <Add />
                                    </n-icon>
                                    添加队伍
                                  </n-button>
                                </div>
                                
                                <!-- Image Upload Instructions -->
                                <div class="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                  只能上传png,jpeg,jpg格式图片,且不超过1mb,图片尺寸100px*100px
                                </div>
                              </div>

                              <!-- Participation Conditions -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">* 参与条件</label>
                                <n-select
                                  v-model:value="formData.guessingParticipationCondition"
                                  placeholder="无条件"
                                  :options="guessingParticipationOptions"
                                  class="w-full"
                                />
                              </div>

                              <!-- Obtain Points -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">* 获取积分</label>
                                <n-select
                                  v-model:value="formData.guessingObtainPoints"
                                  placeholder="请选择"
                                  :options="guessingObtainPointsOptions"
                                  class="w-full"
                                />
                              </div>

                              <!-- Point Limit -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                  * 积分上限
                                  <n-icon size="16" class="text-blue-500 ml-1">
                                    <HelpCircle />
                                  </n-icon>
                                </label>
                                <n-input
                                  v-model:value="formData.guessingPointLimit"
                                  placeholder="请输入积分上限,0表示不限制"
                                  class="w-full"
                                />
                              </div>

                              <!-- Betting Limit -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">* 下注限额</label>
                                <div class="flex items-center gap-2">
                                  <n-input
                                    v-model:value="formData.guessingBettingLimitMin"
                                    placeholder="请输入最低限额"
                                    class="flex-1"
                                  />
                                  <span class="text-gray-500">-</span>
                                  <n-input
                                    v-model:value="formData.guessingBettingLimitMax"
                                    placeholder="请输入最高限额"
                                    class="flex-1"
                                  />
                                </div>
                              </div>

                              <!-- Actual Distribution Amount -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">* 实际瓜分金额</label>
                                <n-input
                                  v-model:value="formData.guessingActualDistributionAmount"
                                  placeholder="请输入实际瓜分金额"
                                  class="w-full"
                                />
                              </div>

                              <!-- Displayed Distribution Amount -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">* 展示瓜分金额</label>
                                <n-input
                                  v-model:value="formData.guessingDisplayedDistributionAmount"
                                  placeholder="请输入展示瓜分金额"
                                  class="w-full"
                                />
                              </div>

                              <!-- Distribution Method -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">瓜分方式</label>
                                <n-radio-group v-model:value="formData.guessingDistributionMethod">
                                  <n-space>
                                    <n-radio value="all_members">未下注会员可参与瓜分</n-radio>
                                    <n-radio value="betting_members_only">仅下注会员参与瓜分</n-radio>
                                  </n-space>
                                </n-radio-group>
                              </div>

                              <!-- Information Message -->
                              <div class="mt-6 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                <div class="flex items-center gap-2 text-orange-700">
                                  <n-icon size="16">
                                    <HelpCircle />
                                  </n-icon>
                                  <span class="text-sm">请保存后选择录入赛况,更新比赛数据</span>
                                </div>
                              </div>
                            </template>

                            <!-- Newcomer Bonus Specific Fields (only for 新人彩金 type) -->
                            <template v-if="formData.activityType === 'newbie'">
                              <!-- Promotion Type -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                  优惠类型
                                  <n-icon size="16" class="text-blue-500 ml-1">
                                    <HelpCircle />
                                  </n-icon>
                                </label>
                                <n-select
                                  v-model:value="formData.newbiePromotionType"
                                  placeholder="通用型兑换码（填写即可领奖）"
                                  :options="newbiePromotionTypeOptions"
                                  class="w-full"
                                  disabled
                                />
                                <div class="text-xs text-gray-500 mt-1">新人彩金活动自动使用通用型兑换码</div>
                              </div>

                              <!-- Redemption Code, Total Usage Count, Validity Period -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-3">兑换码 总使用次数 有效期</label>
                                
                                <!-- Batch Import and Download Template -->
                                <div class="flex items-center gap-2 mb-3">
                                  <n-button 
                                    size="small" 
                                    type="info" 
                                    text
                                    @click="downloadNewbieTemplate"
                                  >
                                    下载模板
                                  </n-button>
                                  <n-button 
                                    size="small" 
                                    type="primary" 
                                    text
                                    @click="batchImportNewbie"
                                  >
                                    批量导入
                                    <n-icon size="16" class="text-blue-500 ml-1">
                                      <HelpCircle />
                                    </n-icon>
                                  </n-button>
                                </div>
                                
                                <!-- Multiple Rows for Redemption Settings -->
                                <div class="space-y-3">
                                  <div 
                                    v-for="(item, index) in formData.newbieRedemptionSettings" 
                                    :key="index"
                                    class="flex gap-3 items-end"
                                  >
                                    <!-- Redemption Code -->
                                    <div class="flex-1">
                                      <label class="block text-xs text-gray-600 mb-1">兑换码</label>
                                      <n-input
                                        v-model:value="item.redemptionCode"
                                        placeholder="请输入优惠码数字"
                                        class="w-full"
                                      />
                                    </div>
                                    
                                    <!-- Total Usage Count -->
                                    <div class="flex-1">
                                      <label class="block text-xs text-gray-600 mb-1">总使用次数</label>
                                      <n-input
                                        v-model:value="item.totalUsageCount"
                                        placeholder="使用次数, 0表示不限制"
                                        class="w-full"
                                      />
                                    </div>
                                    
                                    <!-- Validity Period Start -->
                                    <div class="flex-1">
                                      <label class="block text-xs text-gray-600 mb-1">有效期开始</label>
                                      <n-date-picker
                                        v-model:value="item.startTime"
                                        placeholder="开始时间"
                                        class="w-full"
                                      />
                                    </div>
                                    
                                    <!-- Validity Period End -->
                                    <div class="flex-1">
                                      <label class="block text-xs text-gray-600 mb-1">有效期结束</label>
                                      <n-date-picker
                                        v-model:value="item.endTime"
                                        placeholder="结束时间"
                                        class="w-full"
                                      />
                                    </div>
                                    
                                    <!-- Remove Button -->
                                    <n-button 
                                      v-if="formData.newbieRedemptionSettings.length > 1"
                                      size="small" 
                                      type="error" 
                                      @click="removeNewbieRedemptionSetting(index)"
                                      class="mb-1"
                                    >
                                      <n-icon size="16">
                                        <Close />
                                      </n-icon>
                                    </n-button>
                                  </div>
                                  
                                  <!-- Add More Button -->
                                  <n-button 
                                    size="small" 
                                    type="primary" 
                                    @click="addNewbieRedemptionSetting"
                                    class="w-full"
                                  >
                                    <n-icon size="16" class="mr-1">
                                      <Add />
                                    </n-icon>
                                    添加兑换设置
                                  </n-button>
                                </div>
                              </div>

                              <!-- How to Get Redemption Code -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">获取兑换码方式</label>
                                <n-radio-group v-model:value="formData.newbieRedemptionMethod">
                                  <n-space>
                                    <n-radio value="click_link">点击链接获取</n-radio>
                                    <n-radio value="private_promotion">私下推广发送</n-radio>
                                    <n-radio value="user_click">用户点击获取</n-radio>
                                  </n-space>
                                </n-radio-group>
                              </div>



                              <!-- Gift Method -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">* 赠送方式</label>
                                <n-radio-group v-model:value="formData.newbieGiftMethod">
                                  <n-space>
                                    <n-radio value="fixed_bonus">固定彩金</n-radio>
                                    <n-radio value="proportional_gift">随机彩金</n-radio>
                                  </n-space>
                                </n-radio-group>
                              </div>

                              <!-- Actual Gift Amount & Display Gift Amount -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-3">实际赠送金额</label>
                                <div class="flex gap-3 items-end">
                                  <n-input
                                    v-model:value="formData.newbieActualGiftMin"
                                    placeholder="0.03"
                                    class="flex-1"
                                  />
                                  <span class="text-gray-500">-</span>
                                  <n-input
                                    v-model:value="formData.newbieActualGiftMax"
                                    placeholder="0.03"
                                    class="flex-1"
                                  />
                                </div>
                              </div>

                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-3">展示赠送金额</label>
                                <div class="flex gap-3 items-end">
                                  <n-input
                                    v-model:value="formData.newbieDisplayGiftMin"
                                    placeholder="0.03"
                                    class="flex-1"
                                  />
                                  <span class="text-gray-500">-</span>
                                  <n-input
                                    v-model:value="formData.newbieDisplayGiftMax"
                                    placeholder="18.00"
                                    class="flex-1"
                                  />
                                </div>
                              </div>

                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                  期望奖金
                                  <n-icon size="16" class="text-blue-500 ml-1">
                                    <HelpCircle />
                                  </n-icon>
                                </label>
                                <n-input
                                  v-model:value="formData.newbieExpectedBonus"
                                  placeholder="0.03"
                                  class="w-full"
                                />
                              </div>

                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                  提现门槛
                                  <n-icon size="16" class="text-red-500 ml-1">*</n-icon>
                                </label>
                                <div class="flex items-center gap-2">
                                  <span class="text-sm text-gray-600">累计充值</span>
                                  <n-input
                                    v-model:value="formData.newbieWithdrawalThreshold"
                                    placeholder="0"
                                    class="flex-1"
                                  />
                                  <span class="text-sm text-gray-600">才可提现</span>
                                </div>
                              </div>

                              <!-- Display Bonus -->
                              <div class="flex items-center justify-between">
                                <label class="block text-sm font-medium text-gray-700">
                                  展示彩金
                                  <n-icon size="16" class="text-blue-500 ml-1">
                                    <HelpCircle />
                                  </n-icon>
                                </label>
                                <n-switch v-model:value="formData.newbieDisplayBonus" />
                              </div>

                              <!-- Withdrawal Threshold -->
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">* 提现门槛</label>
                                <div class="flex items-center gap-2">
                                  <span class="text-sm text-gray-600">累计充值</span>
                                  <n-input
                                    v-model:value="formData.newbieWithdrawalThreshold"
                                    placeholder="请输入充值金额, 0表示不限制"
                                    class="flex-1"
                                  />
                                  <span class="text-sm text-gray-600">才可提现</span>
                                </div>
                              </div>

                              <!-- Profit Cap -->
                              <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div class="flex items-center justify-between">
                                  <div class="text-sm text-blue-700">
                                    盈利封顶 进入提现设置页面,未首充会员盈利上限设置
                                  </div>
                                  <n-button 
                                    size="small" 
                                    type="primary" 
                                    text
                                    @click="goToWithdrawalSettings"
                                  >
                                    前往
                                  </n-button>
                                </div>
                              </div>
                            </template>

                            <!-- Recharge Specific Fields (only for 充值 type) -->
                <template v-if="formData.activityType === 'recharge'">
                  <!-- Activity Conditions -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">活动条件</label>
                    <n-radio-group v-model:value="formData.condition">
                      <n-space vertical>
                        <n-radio value="first_deposit">账号首充</n-radio>
                        <n-radio value="accumulate_recharge">累计充值</n-radio>
                        <n-radio value="single_recharge">单笔充值</n-radio>
                        <n-radio value="recharge_count">充值次数</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Cycle Method (only show when condition is accumulate_recharge) -->
                  <div v-if="formData.condition === 'accumulate_recharge'">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      * 循环方式
                      <n-icon size="16" class="text-blue-500 ml-1">
                        <HelpCircle />
                      </n-icon>
                    </label>
                    <n-radio-group v-model:value="formData.cycleMethod">
                      <n-space vertical>
                        <n-radio value="daily_cumulative">日累计循环</n-radio>
                        <n-radio value="weekly_cumulative">周累计循环</n-radio>
                        <n-radio value="monthly_cumulative">月累计循环</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Distribution Method -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">派发方式</label>
                    <n-radio-group v-model:value="formData.distributionMethod">
                      <n-space vertical>
                        <n-radio value="player_claim_expires">玩家自领-过期作废</n-radio>
                        <n-radio value="player_claim_auto_after_expire">玩家自领-过期自动派发</n-radio>
                        <n-radio value="auto_claim">系统立即自动派发</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Claim Time (hide when distribution method is auto_claim) -->
                  <div v-if="formData.distributionMethod !== 'auto_claim'">
                    <label class="block text-sm font-medium text-gray-700 mb-2">领取时间</label>
                    <n-radio-group v-model:value="formData.claimTime">
                      <n-space vertical>
                        <n-radio value="real_time">实时领取(影响留存)</n-radio>
                        <n-radio value="next_day">次日领取</n-radio>
                        <n-radio value="daily">每日</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Claim Count (领取次数) - only for recharge activities -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">领取次数</label>
                    <n-radio-group v-model:value="formData.claimCount">
                      <n-space vertical>
                        <n-radio value="claim_individually">可逐条领取</n-radio>
                        <n-radio value="claim_highest_only">领取最高一档(只领一次)</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Missing Fields from Screenshot -->
                  <!-- Reward Expiration Days (hide when distribution method is auto_claim) -->
                  <div v-if="formData.distributionMethod !== 'auto_claim'">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      * 奖励领取过期天数
                      <n-icon size="16" class="text-blue-500 ml-1">
                        <HelpCircle />
                      </n-icon>
                    </label>
                    <n-input-number
                      v-model:value="formData.rewardExpirationDays"
                      placeholder="1"
                      class="w-full"
                      :min="1"
                    />
                  </div>

                  <!-- Pop-up Methods -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">登录前弹窗方式</label>
                    <n-radio-group v-model:value="formData.beforeLoginPopup">
                      <n-space>
                        <n-radio value="none">不弹窗</n-radio>
                        <n-radio value="daily">每日一次</n-radio>
                        <n-radio value="high_frequency">高频弹窗</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">登录后弹窗方式</label>
                    <n-radio-group v-model:value="formData.afterLoginPopup">
                      <n-space>
                        <n-radio value="none">不弹窗</n-radio>
                        <n-radio value="high_frequency">高频弹窗</n-radio>
                        <n-radio value="daily">每日一次</n-radio>
                        <n-radio value="every_login">每次登录</n-radio>
                        <n-radio value="once_only">只弹一次</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Direct Pop-up After Recharge -->
                  <div class="flex items-center justify-between">
                    <label class="block text-sm font-medium text-gray-700">
                      充值成功后直接弹窗
                      <n-icon size="16" class="text-blue-500 ml-1">
                        <HelpCircle />
                      </n-icon>
                    </label>
                    <n-switch v-model:value="formData.directPopupAfterRecharge" />
                  </div>

                  <!-- Recharge Amount Configuration -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-3">充值类型配置</label>
                    <div class="space-y-3">
                      <div 
                        v-for="(item, index) in formData.rechargeAmounts" 
                        :key="index"
                        class="flex gap-3 items-end"
                      >
                        <!-- Recharge Amount -->
                        <div class="flex-1">
                          <label class="block text-xs text-gray-600 mb-1">充值金额</label>
                          <n-input
                            v-model:value="item.betAmount"
                            placeholder="充值金额"
                            :class="{ 'border-red-500': item.betAmount === '' || item.betAmount === null }"
                          />
                          <div v-if="item.betAmount === '' || item.betAmount === null" class="text-red-500 text-xs mt-1">
                            不能为空
                          </div>
                        </div>
                        
                        <!-- Reward Amount -->
                        <div class="flex-1">
                          <label class="block text-xs text-gray-600 mb-1">奖励金额</label>
                          <n-input-number
                            v-model:value="item.rewardAmount"
                            placeholder="0.00"
                            :precision="2"
                            class="w-full"
                          />
                        </div>
                        
                        <!-- Remove Button -->
                        <n-button 
                          v-if="formData.rechargeAmounts.length > 1"
                          size="small" 
                          type="error" 
                          @click="removeRechargeAmount(index)"
                          class="mb-1"
                        >
                          <n-icon size="16">
                            <Close />
                          </n-icon>
                        </n-button>
                      </div>
                      
                      <!-- Add More Button -->
                      <n-button 
                        size="small" 
                        type="primary" 
                        @click="addRechargeAmount"
                        class="w-full"
                      >
                        <n-icon size="16" class="mr-1">
                          <Add />
                        </n-icon>
                        添加充值类型
                      </n-button>
                    </div>
                  </div>
                </template>

                <!-- Custom Type Configuration -->
                <div v-if="formData.activityType === 'custom'" class="space-y-6">
                  <div class="border-l-4 border-blue-500 pl-4">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">自定义类型配置</h3>
                    
                    <!-- Display Method -->
                    <div class="mb-6">
                      <label class="block text-sm font-medium text-gray-700 mb-3">
                        展示方式 <span class="text-red-500">*</span>
                      </label>
                      <n-radio-group v-model:value="formData.customDisplayMethod">
                        <n-space>
                          <n-radio value="builtin_page">内置页面</n-radio>
                          <n-radio value="jump_link">跳转链接</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Select Page (shown when jump_link is selected) -->
                    <div v-if="formData.customDisplayMethod === 'jump_link'" class="mb-6">
                      <label class="block text-sm font-medium text-gray-700 mb-3">
                        选择页面 <span class="text-red-500">*</span>
                      </label>
                      <n-radio-group v-model:value="formData.customJumpType">
                        <n-space vertical>
                          <n-radio value="external_link">外部链接</n-radio>
                          <n-radio value="activity">活动</n-radio>
                          <n-radio value="task">任务</n-radio>
                          <n-radio value="recharge">充值</n-radio>
                          <n-radio value="rebate">返水</n-radio>
                          <n-radio value="agent">代理</n-radio>
                          <n-radio value="vip">VIP</n-radio>
                          <n-radio value="interest_treasure">利息宝</n-radio>
                          <n-radio value="provident_fund">公积金</n-radio>
                          <n-radio value="blind_box_draw">盲盒抽奖</n-radio>
                          <n-radio value="to_be_claimed">待领取</n-radio>
                          <n-radio value="claim_record">领取记录</n-radio>
                          <n-radio value="personal_promotion_link">个人推广链接</n-radio>
                          <n-radio value="cooperative_operation">合作联营</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Link Configuration (shown when external_link is selected) -->
                    <div v-if="formData.customJumpType === 'external_link'" class="mb-6">
                      <label class="block text-sm font-medium text-gray-700 mb-3">
                        链接地址 <span class="text-red-500">*</span>
                      </label>
                      <div class="flex gap-3 items-center">
                        <n-select
                          v-model:value="formData.customOpenInNewWindow"
                          :options="[
                            { label: '新窗口打开', value: 'true', type: 'option' },
                            { label: '当前窗口打开', value: 'false', type: 'option' }
                          ]"
                          class="w-32"
                        />
                        <n-input
                          v-model:value="formData.customTargetUrl"
                          placeholder="请输入链接地址（例如：https://example.com）"
                          class="flex-1"
                          :status="getCustomUrlStatus()"
                          @blur="validateCustomUrl"
                        />
                      </div>
                    </div>

                    <!-- Information Message -->
                    <div class="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div class="flex items-start">
                        <n-icon size="16" class="text-orange-500 mt-0.5 mr-2">
                          <InformationCircle />
                        </n-icon>
                        <span class="text-sm text-orange-700">
                          点击活动宣传图，则打开设置的链接地址
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column -->
            <div class="w-80 flex flex-col border-l border-gray-200 pl-6">
              <!-- Display Management -->
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <label class="block text-sm font-medium text-gray-700">展示宣传图</label>
                  <n-switch v-model:value="formData.displayEnabled" />
                </div>

                <!-- Homepage Display -->
                <div class="flex items-center justify-between">
                  <label class="block text-sm font-medium text-gray-700">首页快捷入口</label>
                  <n-switch v-model:value="formData.homepageDisplay" />
                </div>



                <!-- Participation Method -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">参与活动方式</label>
                  <n-radio-group v-model:value="formData.participationMethod">
                    <n-space>
                      <n-radio value="auto">自动参与</n-radio>
                      <n-radio value="manual_click">需手动点击参与</n-radio>
                    </n-space>
                  </n-radio-group>
                </div>

                <!-- Recharge Methods -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">* 充值方式</label>
                  <n-checkbox-group v-model:value="formData.rechargeMethods" @update:value="handleRechargeMethodChange">
                    <div class="grid grid-cols-2 gap-2">
                      <n-checkbox value="all">全选</n-checkbox>
                      <n-checkbox value="pix">PIX</n-checkbox>
                      <n-checkbox value="customer_service">客服充值</n-checkbox>
                      <n-checkbox value="merchant">银商充值</n-checkbox>
                    </div>
                  </n-checkbox-group>
                </div>

                <!-- Bonus Method -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">奖金方式</label>
                  <n-radio-group v-model:value="formData.bonusMethod">
                    <n-space>
                      <n-radio value="fixed">固定金额</n-radio>
                      <n-radio value="random">随机金额</n-radio>
                      <n-radio value="percentage">比例金额</n-radio>
                    </n-space>
                  </n-radio-group>
                </div>

              </div>
            </div>
          </div>
        </n-tab-pane>

        <!-- Tab 2: Restrictions & Conditions -->
        <n-tab-pane name="restrictions" tab="限制条件">
          <div class="flex gap-6">
            <!-- Left Column -->
            <div class="flex-1 pr-4">
              <div class="space-y-6">
                <!-- Additional Restrictions -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">更多奖领取限制</label>
                  <n-checkbox-group v-model:value="formData.restrictions">
                    <div class="grid grid-cols-2 gap-2">
                      <n-checkbox value="phone_verified">完成手机验证才能领取</n-checkbox>
                      <n-checkbox value="complete_email">完成邮箱验证才能领取</n-checkbox>
                      <n-checkbox value="bank_card">完成银行卡绑定才能领取</n-checkbox>
                      <n-checkbox value="complete_recharge">完成充值后才能领取</n-checkbox>
                      <n-checkbox value="bind_currency">绑定虚拟货币才能领取</n-checkbox>
                      <n-checkbox value="three_party">绑定三方钱包才能领取</n-checkbox>
                      <n-checkbox value="complete_birthday">完成生日设置才能领取</n-checkbox>
                      <n-checkbox value="bind_payment">绑定收款方式才能领取</n-checkbox>
                      <n-checkbox value="real_name">完成实名认证才能领取</n-checkbox>
                      <n-checkbox value="game_experience">填写真实姓名才能领取</n-checkbox>
                      <n-checkbox value="same_activity">同类型活动只能领取1次</n-checkbox>
                      <n-checkbox value="charge_after_complete">充值后未来法才能领取</n-checkbox>
                      <n-checkbox value="same_ip">同登录IP只能申请1次</n-checkbox>
                      <!-- 🎯 NEW: Additional restrictions from Screenshot 2 -->
                      <n-checkbox value="complete_kyc">完成KYC认证才能领取</n-checkbox>
                      <n-checkbox value="bind_currency_third_party">绑定虚拟货币三方钱包才能领取</n-checkbox>
                      <n-checkbox value="complete_recharge_education">完成充值教育才能领取</n-checkbox>
                      <n-checkbox value="complete_bet_education">完成投注教育才能领取</n-checkbox>
                      <n-checkbox value="same_ip_device">同IP同设备只能申请1次</n-checkbox>
                      <n-checkbox value="network_verification">网络实名验证才能领取</n-checkbox>
                      <n-checkbox value="same_ip_limit">同登录IP只能申请1次</n-checkbox>
                      <n-checkbox value="device_binding_limit">同设备绑定只能申请1次</n-checkbox>
                      <n-checkbox value="phone_number_uniqueness">手机号唯一性才能领取</n-checkbox>
                      <n-checkbox value="physical_verification">物理验证才能领取</n-checkbox>
                      <n-checkbox value="location_verification">地理位置验证才能领取</n-checkbox>
                      <n-checkbox value="payment_method_verification">支付方式验证才能领取</n-checkbox>
                    </div>
                  </n-checkbox-group>
                </div>

                <!-- Audit Multiplier Configuration -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">稽核倍数设置</label>
                  <div class="grid grid-cols-2 gap-4">
                    <!-- Audit Required -->
                    <div>
                      <label class="block text-xs text-gray-600 mb-1">是否需要稽核</label>
                      <n-switch v-model:value="formData.auditSettings.auditRequired">
                        <template #checked>需要稽核</template>
                        <template #unchecked>无需稽核</template>
                      </n-switch>
                    </div>
                    
                    <!-- Audit Multiplier -->
                    <div>
                      <label class="block text-xs text-gray-600 mb-1">稽核倍数</label>
                      <n-input-number
                        v-model:value="formData.auditSettings.auditMultiplier"
                        :min="0"
                        :max="50"
                        :step="0.1"
                        :precision="1"
                        placeholder="1.0"
                        :disabled="!formData.auditSettings.auditRequired"
                        class="w-full"
                      >
                        <template #suffix>倍</template>
                      </n-input-number>
                    </div>
                    
                    <!-- Audit Completion Time removed - fixed to 24 hours -->
                    
                    <!-- Manual Review Required -->
                    <div>
                      <label class="block text-xs text-gray-600 mb-1">人工审核</label>
                      <n-switch v-model:value="formData.auditSettings.auditManualReviewRequired" :disabled="!formData.auditSettings.auditRequired">
                        <template #checked>需要人工审核</template>
                        <template #unchecked>自动审核</template>
                      </n-switch>
                    </div>
                  </div>
                  
                  <!-- Audit Description -->
                  <div v-if="formData.auditSettings.auditRequired" class="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p class="text-xs text-blue-600">
                      <i class="fa fa-info-circle mr-1"></i>
                      稽核说明：用户获得奖励后需要投注 <strong>{{ (formData.auditSettings.auditMultiplier || 1).toFixed(1) }}倍</strong> 奖励金额才能提现。
                    </p>
                  </div>
                </div>

                <!-- Member Participation -->
                <div>
                  <div class="flex items-center gap-4 mb-3">
                    <span class="text-sm font-medium text-gray-700">参与会员:</span>
                    <n-button 
                      v-for="level in memberLevels"
                      :key="level.value"
                      :type="formData.memberLevel === level.value ? 'primary' : 'default'"
                      size="small"
                      @click="formData.memberLevel = level.value"
                      class="text-xs"
                    >
                      {{ level.label }}
                    </n-button>
                  </div>
                  <n-checkbox-group v-model:value="formData.memberTags">
                    <div class="grid grid-cols-4 gap-2">
                      <n-checkbox value="default">默认等级</n-checkbox>
                      <n-checkbox value="user">备用等级</n-checkbox>
                      <n-checkbox value="five_yuan">五元玩家</n-checkbox>
                      <n-checkbox value="ten_yuan">十元玩家</n-checkbox>
                      <n-checkbox value="thirty_yuan">三十元玩家</n-checkbox>
                      <n-checkbox value="fifty_yuan">五十元玩家</n-checkbox>
                      <n-checkbox value="hundred_yuan">一百元玩家</n-checkbox>
                      <n-checkbox value="three_hundred">三百元玩家</n-checkbox>
                      <n-checkbox value="three_thousand">三千元玩家</n-checkbox>
                      <n-checkbox value="five_thousand">五千元玩家</n-checkbox>
                      <n-checkbox value="ten_thousand">十万元玩家</n-checkbox>
                      <n-checkbox value="hundred_thousand">百万土豪</n-checkbox>
                      <n-checkbox value="suspicion">可疑玩家</n-checkbox>
                      <n-checkbox value="high_win">高胜率</n-checkbox>
                      <n-checkbox value="test_user">测试专用</n-checkbox>
                      <n-checkbox value="manual_add">手动出款</n-checkbox>
                    </div>
                  </n-checkbox-group>
                </div>

                <!-- Platform Restrictions -->
                <div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">奖金触发平台限制</label>
                      <n-radio-group v-model:value="formData.platformRestriction">
                        <n-space vertical>
                          <n-radio value="no_limit">不限制</n-radio>
                          <n-radio value="only_selected">仅限勾选平台</n-radio>
                          <n-radio value="exclude_selected">排除勾选平台</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">奖金提现方式限制</label>
                      <n-radio-group v-model:value="formData.withdrawalRestriction">
                        <n-space vertical>
                          <n-radio value="no_limit">不限制</n-radio>
                          <n-radio value="only_selected">仅限勾选方式</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column -->
            <div class="w-80 flex flex-col border-l border-gray-200 pl-6">
              <!-- Channel & Transfer Settings -->
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <label class="block text-sm font-medium text-gray-700">指定渠道或代理</label>
                  <n-switch v-model:value="formData.specifyChannel" />
                </div>
                
                <div class="flex items-center justify-between">
                  <label class="block text-sm font-medium text-gray-700">详细页时间</label>
                  <n-switch v-model:value="formData.detailPageTime" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">转核方式</label>
                  <n-input
                    v-model:value="formData.transferMethod"
                    placeholder="只转核奖金"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">转核倍数</label>
                  <n-input-number
                    v-model:value="formData.transferMultiplier"
                    placeholder="1.00"
                    :precision="2"
                    class="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </n-tab-pane>

        <!-- Tab 3: Design & Platform -->
        <n-tab-pane name="design" tab="设计设置">
          <div class="flex gap-6">
            <!-- Left Column -->
            <div class="flex-1 pr-4">
              <!-- Background Color Selection -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-3">选择背景色</label>
                <div class="grid grid-cols-8 gap-2">
                  <div
                    v-for="color in backgroundColors"
                    :key="color.value"
                    class="w-8 h-8 rounded cursor-pointer border-2"
                    :class="formData.backgroundColor === color.value ? 'border-blue-500' : 'border-gray-200'"
                    :style="{ backgroundColor: color.value }"
                    @click="formData.backgroundColor = color.value"
                  ></div>
                </div>
              </div>

              <!-- Icon Selection -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-3">选择图标</label>
                <div class="grid grid-cols-5 gap-2 mb-3">
                  <div
                    v-for="icon in activityIcons"
                    :key="icon.id"
                    class="aspect-square border rounded flex items-center justify-center cursor-pointer text-xs"
                    :class="formData.selectedIcon === icon.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
                    @click="formData.selectedIcon = icon.id"
                  >
                    {{ icon.label }}
                  </div>
                </div>
                <n-button size="small" @click="openIconUpload" block>
                  自定义
                </n-button>
              </div>

              <!-- Platform Selection -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-3">活动申领端</label>
                <n-checkbox-group v-model:value="formData.platforms">
                  <div class="grid grid-cols-2 gap-2">
                    <n-checkbox value="android_app">Android_APP可领取</n-checkbox>
                    <n-checkbox value="ios_app">iOS_APP可领取</n-checkbox>
                    <n-checkbox value="native_app">原生APP</n-checkbox>
                    <n-checkbox value="browser_app">极速APP</n-checkbox>
                    <n-checkbox value="pwa_app">PWA快捷APP</n-checkbox>
                    <n-checkbox value="ios_browser">iOS浏览器</n-checkbox>
                    <n-checkbox value="pc_browser">PC可领取</n-checkbox>
                    <n-checkbox value="android_h5">Android_H5可领取</n-checkbox>
                    <n-checkbox value="ios_h5">iOS_H5可领取</n-checkbox>
                  </div>
                </n-checkbox-group>
              </div>
            </div>

            <!-- Right Column -->
            <div class="w-80 flex flex-col border-l border-gray-200 pl-6 space-y-6">
              <!-- Promotion Image -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">宣传图片</label>
                <MediaLibrarySelector
                  v-model="formData.promoImage"
                  category="promotion"
                  placeholder="选择宣传图片"
                  @change="handlePromoImageChange"
                />
                <div class="text-xs text-gray-500 mt-1">建议尺寸: 750x400</div>
              </div>

              <!-- Floating Icon Configuration -->
              <div>
                <div class="flex items-center justify-between mb-3">
                  <label class="block text-sm font-medium text-gray-700">悬浮图(原快捷入口)</label>
                  <div class="flex items-center gap-2">
                    <n-switch v-model:value="formData.floatingIcon.enabled" />
                    <n-checkbox v-model:checked="formData.floatingIcon.showActivityName" size="small">显示活动名称</n-checkbox>
                  </div>
                </div>

                <!-- Floating Icon Settings (shown when enabled) -->
                <div v-if="formData.floatingIcon.enabled" class="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <!-- Display Time Settings -->
                  <div class="flex items-center justify-between">
                    <label class="block text-sm font-medium text-gray-700">显示时间</label>
                    <div class="flex items-center gap-2">
                      <n-switch v-model:value="formData.floatingIcon.timeDisplay.enabled" size="small" />
                      <span class="text-xs text-gray-500">关</span>
                    </div>
                  </div>

                  <!-- Display Terminals -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      <span class="text-red-500">*</span> 展示终端
                    </label>
                    <div class="grid grid-cols-2 gap-1 text-xs">
                      <n-checkbox v-model:checked="formData.floatingIcon.terminals.android_app" size="small">Android_APP</n-checkbox>
                      <n-checkbox v-model:checked="formData.floatingIcon.terminals.ios_app" size="small">iOS_APP</n-checkbox>
                      <n-checkbox v-model:checked="formData.floatingIcon.terminals.native_app" size="small">原生APP</n-checkbox>
                      <n-checkbox v-model:checked="formData.floatingIcon.terminals.extreme_app" size="small">极速APP</n-checkbox>
                      <n-checkbox v-model:checked="formData.floatingIcon.terminals.wechat_app" size="small">马甲包</n-checkbox>
                      <n-checkbox v-model:checked="formData.floatingIcon.terminals.pwa_app" size="small">PWA快捷APP</n-checkbox>
                      <n-checkbox v-model:checked="formData.floatingIcon.terminals.ios_webapp" size="small">iOS描述器</n-checkbox>
                      <n-checkbox v-model:checked="formData.floatingIcon.terminals.pc" size="small">PC</n-checkbox>
                      <n-checkbox v-model:checked="formData.floatingIcon.terminals.android_h5" size="small">Android_H5</n-checkbox>
                      <n-checkbox v-model:checked="formData.floatingIcon.terminals.ios_h5" size="small">iOS_H5</n-checkbox>
                    </div>
                  </div>

                  <!-- Display Method -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      <span class="text-red-500">*</span> 展示方式
                    </label>
                    <n-radio-group v-model:value="formData.floatingIcon.displayMethod" size="small">
                      <n-space vertical>
                        <n-radio value="carousel">叠加轮播展示（默认）</n-radio>
                        <n-radio value="single">单独展示</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Display Position -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">展示位置</label>
                    <n-radio-group v-model:value="formData.floatingIcon.position" size="small">
                      <n-space>
                        <n-radio value="bottom-left">左下角</n-radio>
                        <n-radio value="bottom-right">右下角</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Display Pages -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">展示页面</label>
                    <div class="flex items-center gap-4">
                      <n-radio v-model:checked="formData.floatingIcon.pages.homepage" size="small">仅首页展示</n-radio>
                      <span class="text-xs text-gray-500">任意页面均展示</span>
                    </div>
                  </div>

                  <!-- Background Image -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">是否展示背景图</label>
                    <n-radio-group v-model:value="formData.floatingIcon.showBackground" size="small">
                      <n-space>
                        <n-radio value="show">展示</n-radio>
                        <n-radio value="hide">不展示</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Icon Selection -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      <span class="text-red-500">*</span> 选择图标
                    </label>
                    <n-radio-group v-model:value="formData.floatingIcon.iconType" size="small">
                      <n-space>
                        <n-radio value="general">全部通用（推荐）</n-radio>
                        <n-radio value="language">按语言设置</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Language Tabs for Icon Upload -->
                  <div v-if="formData.floatingIcon.iconType === 'language'">
                    <n-tabs v-model:value="formData.floatingIcon.activeLanguageTab" type="segment" size="small">
                      <n-tab-pane name="pt" tab="葡萄牙语">
                        <div class="space-y-2">
                          <MediaLibrarySelector
                            v-model="formData.floatingIcon.icons.pt"
                            category="floating-icon"
                            placeholder="选择葡萄牙语图标"
                          />
                          <div class="text-xs text-gray-500">格式:png,jpeg,jpg,gif，尺寸220px*220px，大小<1MB</div>
                        </div>
                      </n-tab-pane>
                      <n-tab-pane name="zh" tab="简体中文">
                        <div class="space-y-2">
                          <MediaLibrarySelector
                            v-model="formData.floatingIcon.icons.zh"
                            category="floating-icon"
                            placeholder="选择简体中文图标"
                          />
                          <div class="text-xs text-gray-500">格式:png,jpeg,jpg,gif，尺寸220px*220px，大小<1MB</div>
                        </div>
                      </n-tab-pane>
                    </n-tabs>
                  </div>

                  <!-- General Icon Upload -->
                  <div v-else class="space-y-3">
                    <MediaLibrarySelector
                      v-model="formData.floatingIcon.icons.general"
                      category="floating-icon"
                      placeholder="选择通用图标"
                    />
                    <div class="text-xs text-gray-500">格式:png,jpeg,jpg,gif，尺寸220px*220px，大小<1MB</div>
                    
                    <!-- Preset Icons -->
                    <div class="mt-3">
                      <div class="grid grid-cols-7 gap-1">
                        <div v-for="(icon, index) in presetIcons" :key="index" 
                             @click="selectPresetIcon(icon)"
                             :class="[
                               'cursor-pointer border-2 rounded p-1 hover:border-blue-500 transition-colors',
                               formData.floatingIcon.selectedPresetIcon === icon.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                             ]">
                          <img :src="icon.url" :alt="icon.name" class="w-full h-auto">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </n-tab-pane>

        <!-- Tab 4: Rules -->
        <n-tab-pane name="rules" tab="规则说明">
          <div class="flex gap-6">
            <!-- Left Column -->
            <div class="flex-1 pr-4">
              <div class="space-y-4">
                <div class="flex items-center justify-between mb-2">
                  <label class="block text-sm font-medium text-gray-700">规则说明</label>
                  <n-select
                    v-model:value="formData.ruleTemplate"
                    placeholder="自定义"
                    :options="ruleTemplateOptions"
                    class="w-32"
                  />
                </div>
                <n-input
                  v-model:value="formData.rules"
                  type="textarea"
                  placeholder="支持输入中文输入，按Enter键进行填写"
                  :autosize="{ minRows: 10, maxRows: 20 }"
                />
                <div class="text-right text-xs text-gray-500">
                  {{ formData.rules?.length || 0 }}/10000
                </div>
              </div>
            </div>

            <!-- Right Column - Empty for now -->
            <div class="w-80 border-l border-gray-200 pl-6">
              <div class="text-center text-gray-400 text-sm">
                规则预览区域
              </div>
            </div>
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>
    </div>

    <!-- Footer -->
    <template #action>
      <div class="flex items-center justify-between w-full">
        <n-button @click="handleCancel">关闭</n-button>
        <div class="flex gap-2">
          <n-button @click="handleSaveDraft" :loading="submitting">
            保存草稿
          </n-button>
          <n-button type="primary" @click="handleSubmit" :loading="submitting">
            保存提交
          </n-button>
        </div>
      </div>
    </template>
  </n-modal>

  <!-- Translation Modal -->
  <n-modal
    v-model:show="translationModalShow"
    preset="card"
    title="多语言设置"
    style="width: 600px"
  >
    <div class="space-y-4">
      <div
        v-for="lang in languages"
        :key="lang.code"
        class="space-y-2"
      >
        <label class="block text-sm font-medium text-gray-700">{{ lang.name }}</label>
        <n-input
          v-model:value="formData.translations[lang.code]"
          :placeholder="`请输入${lang.name}活动名称`"
        />
      </div>
    </div>
    <template #footer>
      <n-space justify="end">
        <n-button @click="translationModalShow = false">取消</n-button>
        <n-button type="primary" @click="saveTranslations">确定</n-button>
      </n-space>
    </template>
  </n-modal>

  <!-- Icon Upload Modal -->
  <n-modal
    v-model:show="iconUploadModalShow"
    preset="card"
    title="自定义上传图标"
    style="width: 500px"
  >
    <n-upload
      :file-list="customIconList"
      :default-upload="false"
      accept="image/*"
      @change="handleCustomIconChange"
    >
      <n-upload-dragger>
        <div class="text-center py-4">
          <n-icon size="48" class="text-gray-400 mb-2">
            <CloudUpload />
          </n-icon>
          <p class="text-sm text-gray-600">点击或拖拽上传自定义图标</p>
        </div>
      </n-upload-dragger>
    </n-upload>
    <template #footer>
      <n-space justify="end">
        <n-button @click="iconUploadModalShow = false">取消</n-button>
        <n-button type="primary" @click="saveCustomIcon">确定</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { 
  NModal, 
  NButton, 
  NSpace, 
  NIcon, 
  NTabs,
  NTabPane,
  NInput,
  NInputNumber,
  NSelect,
  NCheckbox,
  NCheckboxGroup,
  NRadio,
  NRadioGroup,
  NSwitch,
  NDatePicker,
  NTimePicker,
  NUpload,
  NUploadDragger,
  useMessage
} from 'naive-ui';
import { CloudUpload, CloudUploadOutline, HelpCircle, Close, Add, InformationCircle } from '@vicons/ionicons5';
import { createActivity, updateActivityV2 } from '#/api/activity';
import type { Activity, CreateActivityInput } from '#/api/activity';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking modal load
import { defineAsyncComponent } from 'vue';
const MediaLibrarySelector = defineAsyncComponent(() => import('#/components/MediaLibrarySelector.vue'));
const PlatformGameSelector = defineAsyncComponent(() => import('#/components/activity/PlatformGameSelector.vue'));
const Label = defineAsyncComponent(() => import('../../../../../../packages/@core/ui-kit/shadcn-ui/src/ui/label/Label.vue'));

// Props
interface Props {
  show: boolean;
  editingItem?: Activity | null;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  editingItem: null
});

// Emits
const emit = defineEmits<{
  'update:show': [value: boolean];
  'success': [];
}>();

// Composables
const message = useMessage();

// Red packet style options with preview images
const allRedPacketStyles = [
  {
    value: 'modal',
    label: '红包',
    imageUrl: 'https://media.cheshi8899.com/media/media-1758164088476-327616913-style0.126acc89cddaa21ea37c.avif'
  },
  {
    value: 'banner',
    label: '福袋',
    imageUrl: 'https://media.cheshi8899.com/media/media-1758164096103-86127679-style3.0bebc3c7351d85ed90e6.avif'
  },
  {
    value: 'floating',
    label: '礼包',
    imageUrl: 'https://media.cheshi8899.com/media/media-1758164105287-572717226-style2.300901be34962fe97975.avif'
  },
  {
    value: 'treasurechest',
    label: '宝箱',
    imageUrl: 'https://media.cheshi8899.com/media/media-1758164113679-778866272-style1.b0289469b16cd12697b4.avif'
  },
  {
    value: 'treasurechest2',
    label: '宝箱2',
    imageUrl: 'https://media.cheshi8899.com/media/media-1758164509457-995019276-style4.332d1817313bf49a4341.avif'
  }
];

// Helper functions for style preview
const getCurrentStyleImage = () => {
  const currentStyle = allRedPacketStyles.find(style => style.value === formData.redPacketDisplayStyle);
  return currentStyle?.imageUrl || '';
};

const getCurrentStyleLabel = () => {
  const currentStyle = allRedPacketStyles.find(style => style.value === formData.redPacketDisplayStyle);
  return currentStyle?.label || '未知样式';
};

// Reset form data to initial state
const resetFormData = () => {
  Object.assign(formData, {
    activityType: 'recharge',
    category: 'recharge',
    categories: [],
    currency: 'all',
    currencies: [],
    title: '',
    nameType: 'custom',
    startTime: null,
    endTime: null,
    syncDisplayTime: true,
    displayStartTime: null,
    displayEndTime: null,
    condition: 'first_deposit',
    distributionMethod: 'player_claim_expires',
    claimTime: 'real_time',
    claimCount: 'claim_individually', // Claim count: claim_individually (可逐条领取) or claim_highest_only (领取最高一档)
    receiveMethod: 'auto',
    receiveFrequency: 'immediate',
    displayEnabled: true,
    homepageDisplay: false,
    floatingIcon: {
      enabled: false,
      showActivityName: false,
      terminals: {
        android_app: true,
        ios_app: true,
        native_app: false,
        extreme_app: false,
        wechat_app: false,
        pwa_app: false,
        ios_webapp: false,
        pc: true,
        android_h5: true,
        ios_h5: true,
      },
      displayMethod: 'carousel',
      position: 'bottom-right',
      pages: { homepage: true },
      showBackground: 'show',
      iconType: 'general',
      activeLanguageTab: 'pt',
      icons: { general: null, pt: null, zh: null },
    },
    // Wagering fields
    loopMethod: 'single',
    isTimeLimited: false,
    distributionMethod: 'direct',
    claimTime: 24,
    selectTime: 24,
    wageringPlatform: 'all_platforms',
    wageringPlatformConfig: {
      selectedPlatforms: [],
      platformIds: []
    },
    claimCount: 1,
    wageringRewardExpiryDays: 1,
    wageringRewardSettings: [
      { effectiveWageringAmount: '', rewardAmount: '' },
    ] as { effectiveWageringAmount: string; rewardAmount: string }[],
    // Red Packet fields
    redPacketType: 'fixed',
    redPacketClaimCondition: 'none',
    redPacketRewardType: 'fixed',
    securityVerification: false,
    redPacketTotalAmount: 1000,
    redPacketCountPerPeriod: 10000,
    actualRedPacketMin: 0.02,
    actualRedPacketMax: 0.50,
    displayedRedPacketMin: 0.01,
    displayedRedPacketMax: 378.00,
    grabLimitPerPeriod: 1,
    dailyGrabLimitType: 'fixed',
    dailyGrabLimit: 3,
    totalGrabLimit: 1,
    expectedBonus: 1.00,
    redPacketTotalCountLimit: 1,
    redPacketDisplayStyle: 'modal',
    redPacketDailyDistributionTimes: [
      { startTime: null, endTime: null },
    ],
  });
};

// Reactive data
const modalShow = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
});

const isEditing = computed(() => !!props.editingItem);

const activeTab = ref('basic');
const submitting = ref(false);
const translationModalShow = ref(false);
const iconUploadModalShow = ref(false);
const isPlatformSelectionValid = ref(true);

// Form data
const formData = reactive({
  // Activity Type
  activityType: 'recharge',
  
  // Basic Settings
  category: 'recharge',
  categories: [] as string[], // Multi-select for activity classification
  currency: 'all',
  currencies: [] as string[], // Multi-select for currencies
  title: '',
  nameType: 'custom', // Custom or System default for activity name
  startTime: null as number | null,
  endTime: null as number | null,
  syncDisplayTime: true,
  displayStartTime: null as number | null,
  displayEndTime: null as number | null,
  
  // Activity Conditions
  condition: 'first_deposit',
  cycleMethod: 'daily_cumulative', // Cycle method for accumulate_recharge condition
  distributionMethod: 'player_claim_expires',
  claimTime: 'real_time',
  claimCount: 'claim_individually', // Claim count: claim_individually (可逐条领取) or claim_highest_only (领取最高一档)
  receiveMethod: 'auto',
  receiveFrequency: 'immediate',
  
  // Display Settings
  displayEnabled: true,
  homepageDisplay: false,
  
  // Floating Icon Settings
  floatingIcon: {
    enabled: false,
    showActivityName: false,
    terminals: {
      android_app: true,
      ios_app: true,
      native_app: false,
      extreme_app: false,
      wechat_app: false,
      pwa_app: false,
      ios_webapp: false,
      pc: true,
      android_h5: true,
      ios_h5: true,
    },
    displayMethod: 'carousel', // 'carousel' or 'single'
    position: 'bottom-right', // 'bottom-left' or 'bottom-right'
    pages: {
      homepage: true, // true = only homepage, false = all pages
    },
    showBackground: 'show', // 'show' or 'hide'
    iconType: 'general', // 'general' or 'language'
    activeLanguageTab: 'pt',
    icons: {
      general: null as any,
      pt: null as any,
      zh: null as any,
    },
    selectedPresetIcon: null as string | null,
    timeDisplay: {
      enabled: false,
    },
  },
  
  // Participation Settings
  participationMethod: 'auto',
  rechargeMethods: ['all'],
  bonusMethod: 'fixed',
  
  // Restrictions
  restrictions: [] as string[],
  memberLevel: 'all',
  memberTags: [] as string[],
  
  // Audit Settings
  auditSettings: {
    auditRequired: true,
    auditMultiplier: 1.0,
    auditManualReviewRequired: false,
  },

  
  // Advanced Settings
  specifyChannel: false,
  detailPageTime: false,
  transferMethod: '只转核奖金',
  transferMultiplier: 1.00,
  platformRestriction: 'no_limit',
  withdrawalRestriction: 'no_limit',
  
  // Rules
  ruleTemplate: 'custom',
  rules: '',
  
  // Design Settings
  backgroundColor: '#ffffff',
  selectedIcon: 'gift',
  platforms: ['android_app', 'ios_app'],
  promoImage: undefined as any,
  
  // Translations
  translations: {} as Record<string, string>,

  // Missing Fields from Screenshot
  rewardExpirationDays: 1,
  beforeLoginPopup: 'none',
  afterLoginPopup: 'none',
  directPopupAfterRecharge: false,

  // Recharge Amount Configuration
  rechargeAmounts: [
    { betAmount: '', rewardAmount: 0.00 },
  ] as { betAmount: string; rewardAmount: number }[],

  // Wagering Specific Fields
  loopMethod: 'daily_cumulative',
  isTimeLimited: false,
  distributionMethod: 'player_claim_expires',
  claimTime: 'next_day',
  selectTime: 0,
  rewardClaimExpiryDays: 1,
  wageringPlatform: 'all_platforms',
  claimCount: 'continuous_claim',
  wageringRewardExpiryDays: 1,
  wageringRewardSettings: [
    { effectiveWageringAmount: '', rewardAmount: '' },
  ] as { effectiveWageringAmount: string; rewardAmount: string }[],

  // Rescue Fund Specific Fields
  rescueWageringPlatform: 'all_platforms',
  rescueWageringPlatformConfig: {
    selectedPlatforms: [],
    platformIds: []
  },
  deductDiscounts: false,
  lossRange: 'yesterday',
  dailyRewardLimit: '',
  rescueDistributionMethod: 'self_claim_expire',
  rescueClaimTime: 'next_day',
  rescueSelectTime: null as number | null,
  rescueRewardExpiryDays: 1,
  rewardType: 'percentage',
  rescueRewardSettings: [
    { lossAmount: '', returnRatio: 0.00 },
  ] as { lossAmount: string; returnRatio: number }[],

  // Sign-in Specific Fields
  checkinWageringPlatform: 'all_platforms',
  checkinRechargeMethods: ['all'],
  signinMethod: 'continuous',
  signinPeriod: '7',
  monthlyReset: false,
  checkinPopupAfterRecharge: false,
  enableMakeupSignin: false,
  checkinBeforeLoginPopup: 'high_frequency',
  checkinAfterLoginPopup: 'high_frequency',
  displayStyle: 'calendar',
  checkinIcon: null as any,
  checkinRewardMethod: 'daily',
  checkinRewardSettings: [
    { type: 'fixed', rewardAmount: 0.00, rechargeRequirement: 0, wageringRequirement: 0, additionalReward: 0.00, checkinIcon: null },
  ] as { type: string; rewardAmount: number; rechargeRequirement: number; wageringRequirement: number; additionalReward: number; checkinIcon: any }[],

  // Lucky Turntable Specific Fields
  turntableSwitches: ['all'] as string[],
  luckyValueValidityPeriod: 'daily',
  luckyspinRewardType: 'valid_bet',
  luckyspinWageringPlatform: 'all',
  luckyValuePerBet: 1,
  enableWinningAnnouncement: false,
  announcementInterval: 24,
  announcementCount: 20,

  // Lucky Bet Slip Specific Fields
  luckywagerWageringPlatform: 'all',
  claimCountLimit: 'fixed',
  dailyCountLimit: '',
  totalCountLimit: '',
  minimumValidBetAmount: '',
  luckywagerRewardMethod: 'fixed_amount',
  betSlipNumberRule: 'ending_digits',
  largeAmountReviewAmount: '',
  luckywagerRewardSettings: [
    { betSlipEnding: '', rewardAmount: '' },
  ] as { betSlipEnding: string; rewardAmount: string }[],

  // Red Packet Specific Fields
  redPacketType: 'fixed',
  redPacketClaimCondition: 'none',
  redPacketRewardType: 'fixed',
  securityVerification: false,
  redPacketTotalAmount: 1000,
  redPacketCountPerPeriod: 10000,
  actualRedPacketMin: 0.02,
  actualRedPacketMax: 0.50,
  displayedRedPacketMin: 0.01,
  displayedRedPacketMax: 378.00,
  grabLimitPerPeriod: 1,
  dailyGrabLimitType: 'fixed',
  dailyGrabLimit: 3,
  totalGrabLimit: 1,
  expectedBonus: 1.00,
  redPacketTotalCountLimit: 1,
  redPacketDisplayStyle: 'modal',
  redPacketDailyDistributionTimes: [
    { startTime: null, endTime: null },
  ],

  // Investment Specific Fields
  investmentType: 'fixed_amount',
  rewardDays: 3,
  investmentDistributionMethod: 'daily_auto',
  investmentSettings: [
    { investmentAmount: '', giftAmount: '' },
  ] as { investmentAmount: string; giftAmount: string }[],

  // Promotion Specific Fields
  promotionAccumulatedRecharge: '',
  promotionAccumulatedRechargeDays: '',
  promotionAccumulatedRechargeCount: '',
  promotionAccumulatedWagering: '',
  promotionWageringPlatform: 'all_platforms',
  promotionWageringPlatformConfig: {
    selectedPlatforms: [],
    platformIds: []
  },
  promotionDownloadAppLogin: false,
  promotionSameIPLimit: '',
  promotionSameDeviceLimit: '',
  promotionRewardType: 'fixed_amount',
  promotionDisplayOnAgentPage: false,
  promotionDistributionMethod: 'expired_auto',
  promotionDisplayClaimMethod: 'open_redpacket',
  promotionDisplayAmount: 'hide',
  promotionRewardSettings: [
    { effectivePromotionCount: '', rewardAmount: '' },
  ] as { effectivePromotionCount: string; rewardAmount: string }[],

  // Agent Specific Fields
  agentDisplayOnAgentPage: false,
  agentDistributionMethod: 'expired_auto',
  agentRewardClaimExpiryDays: 1,
  agentRewardCycle: 'daily',
  agentRewardType: 'agent_rebate',
  agentRewardAmountType: 'fixed_amount',
  agentRewardSettings: [
    { rebateAmount: '', rewardAmount: '' },
  ] as { rebateAmount: string; rewardAmount: string }[],

  // Collect Characters Specific Fields
  collectCombinationType: 'festival',
  collectCombinationName: 'new_year_luck',
  collectCharacters: ['新', '年', '大', '吉'],
  collectDistributionMethod: 'monthly',
  collectRewardClaimExpiryDays: 1,
  collectActualDistributionAmount: '',
  collectDisplayedDistributionAmount: '',
  collectConditions: [
    { type: 'valid_bet', conditionValue: '', dailyCountLimit: '' },
  ] as { type: string; conditionValue: string; dailyCountLimit: string }[],

  // Guessing/Competition Specific Fields
  guessingTeams: [
    { chineseName: '', englishName: '', icon: '' },
    { chineseName: '', englishName: '', icon: '' },
  ] as { chineseName: string; englishName: string; icon: string }[],
  guessingParticipationCondition: 'no_condition',
  guessingObtainPoints: '',
  guessingPointLimit: '',
  guessingBettingLimitMin: '',
  guessingBettingLimitMax: '',
  guessingActualDistributionAmount: '',
  guessingDisplayedDistributionAmount: '',
  guessingDistributionMethod: 'all_members',

  // Newcomer Bonus Specific Fields
  newbiePromotionType: 'code_redemption',
  newbieRedemptionCode: '',
  newbieTotalUsageCount: '',
  newbieStartTime: null as number | null,
  newbieEndTime: null as number | null,
  newbieRedemptionMethod: 'private_promotion',
  newbiePopupAfterTopup: false,
  newbieGiftMethod: 'fixed_bonus',
  newbieRedemptionSettings: [
    { redemptionCode: '', totalUsageCount: '', startTime: null as number | null, endTime: null as number | null },
  ] as { redemptionCode: string; totalUsageCount: string; startTime: number | null; endTime: number | null }[],
  newbieRewardSettings: [
    { firstDepositAmount: '', rewardAmount: '' },
  ] as { firstDepositAmount: string; rewardAmount: string }[],
  newbieDisplayBonus: true,
  newbieWithdrawalThreshold: '',
  newbieActualGiftMin: '',
  newbieActualGiftMax: '',
  newbieDisplayGiftMin: '',
  newbieDisplayGiftMax: '',
  newbieExpectedBonus: '',

  // Custom Type Configuration
  customDisplayMethod: 'builtin_page',
  customJumpType: 'external_link',
  customOpenInNewWindow: 'true',
  customTargetUrl: '',
});

// Options data
const activityTypes = [
  { label: '充值', value: 'recharge' },
  { label: '打码', value: 'wagering' },
  { label: '救援金', value: 'rescue' },
  { label: '签到', value: 'checkin' },
  { label: '幸运转盘', value: 'luckyspin' },
  { label: '幸运注单', value: 'luckywager' },
  { label: '红包', value: 'redpacket' },
  { label: '投资', value: 'invest' },
  { label: '推广', value: 'promotion' },
  { label: '代理', value: 'agent' },
  { label: '集字', value: 'collect' },
  { label: '竞猜', value: 'guessing' },
  { label: '新人彩金', value: 'newbie' },
  { label: '推荐奖励', value: 'referral' },
  { label: '软一刀', value: 'soft' },
  { label: '新一刀', value: 'new' },
  { label: '相行榜', value: 'ranking' },
  { label: '自定义', value: 'custom' },
];

const activityCategories = [
  { label: '综合', value: 'comprehensive' },
  { label: '棋牌', value: 'chess_cards' },
  { label: '捕鱼', value: 'hunting' },
  { label: '电子', value: 'slot' },
  { label: '真人', value: 'live' },
  { label: '体育', value: 'sports' },
  { label: '斗鸡', value: 'cockfight' },
  { label: '彩票', value: 'lottery' },
  { label: '视频', value: 'video' },
  { label: '电竞', value: 'esports' },
  { label: '桌面', value: 'table' },
  { label: '街机', value: 'arcade' },
  { label: '模拟', value: 'simulation' },
  { label: '其他', value: 'other' },
];

const currencyOptions = [
  { label: '全选', value: 'all' },
  { label: 'BRL', value: 'BRL' },
];

const backgroundColors = [
  // Row 1
  { label: '黑1', value: '#000000' },
  { label: '灰1', value: '#6B7280' },
  { label: '灰2', value: '#9CA3AF' },
  { label: '黑2', value: '#1F2937' },
  { label: '黑3', value: '#374151' },
  { label: '黑4', value: '#111827' },
  { label: '黑5', value: '#0F172A' },
  // Row 2
  { label: '灰3', value: '#4B5563' },
  { label: '黑6', value: '#030712' },
  { label: '灰4', value: '#71717A' },
  { label: '黑7', value: '#18181B' },
  { label: '黑8', value: '#27272A' },
  { label: '黑9', value: '#3F3F46' },
  { label: '灰5', value: '#A1A1AA' },
  // Row 3
  { label: '灰6', value: '#52525B' },
  { label: '黑10', value: '#09090B' },
  { label: '灰7', value: '#D4D4D8' },
  { label: '灰8', value: '#E4E4E7' },
  { label: '灰9', value: '#F4F4F5' },
  { label: '蓝紫', value: '#8B5FBF' },
];

const activityIcons = [
  { id: 'game', label: '游戏' },
  { id: 'award', label: '奖品' },
  { id: 'activity', label: '活动' },
  { id: 'daily', label: '节日' },
  { id: 'casino', label: '赌场' },
  { id: 'sports', label: '美女' },
  { id: 'custom', label: '自定义' },
];

const memberLevels = [
  { label: '全部层级', value: 'all' },
  { label: '备用层级', value: 'backup' },
  { label: '五元玩家', value: 'five_yuan' },
  { label: '十元玩家', value: 'ten_yuan' },
  { label: '三千玩家', value: 'three_thousand' },
  { label: '五千玩家', value: 'five_thousand' },
  { label: '一万玩家', value: 'ten_thousand' },
  { label: '三万玩家', value: 'thirty_thousand' },
  { label: '五万玩家', value: 'fifty_thousand' },
  { label: '十万玩家', value: 'hundred_thousand' },
  { label: '百万土豪', value: 'millionaire' },
  { label: '刷子玩家', value: 'brush' },
  { label: '其他恶性...', value: 'other_bad' },
  { label: '死半用户', value: 'dead_user' },
  { label: '測试专用...', value: 'test_user' },
];

const languages = [
  { code: 'zh-CN', name: '简体中文' },
  { code: 'en-US', name: 'English' },
  { code: 'pt-BR', name: 'Português' },
];

const ruleTemplateOptions = [
  { label: '自定义', value: 'custom' },
  { label: '系统自带', value: 'system' },
];

const rewardTypeOptions = [
  { label: '固定奖励', value: 'fixed' },
  { label: '比例奖励', value: 'percentage' },
  { label: '随机奖励', value: 'random' },
];

// Preset floating icons
const presetIcons = ref([
  { id: 'gift1', name: '礼品1', url: '/uploads/icons/floating/gift1.png' },
  { id: 'bonus1', name: '奖金1', url: '/uploads/icons/floating/bonus1.png' },
  { id: 'activity1', name: '活动1', url: '/uploads/icons/floating/activity1.png' },
  { id: 'vip1', name: 'VIP1', url: '/uploads/icons/floating/vip1.png' },
  { id: 'recharge1', name: '充值1', url: '/uploads/icons/floating/recharge1.png' },
  { id: 'mission1', name: '任务1', url: '/uploads/icons/floating/mission1.png' },
  { id: 'lucky1', name: '幸运1', url: '/uploads/icons/floating/lucky1.png' },
]);

// File lists
const promoImageList = ref([]);
const customIconList = ref([]);

// Enum mapping functions to convert frontend values to backend schema
const mapFrontendToBackendRewardType = (frontendValue: string): string => {
  const mapping: Record<string, string> = {
    'fixed_amount': 'fixed',
    'percentage': 'percent',
    'points': 'points',
    'spins': 'spins',
    'coupon': 'coupon'
  };
  return mapping[frontendValue] || 'fixed';
};

const mapFrontendToBackendDistributionMethod = (frontendValue: string): string => {
  const mapping: Record<string, string> = {
    'expired_auto': 'auto_claim',
    'self_claim_expire': 'manual_review',
    'manual': 'manual_review',
    'auto': 'direct',
    'bonus': 'bonus_wallet'
  };
  return mapping[frontendValue] || 'auto_claim';
};

// Map rescue distribution method
const mapRescueDistributionMethod = (frontendValue: string): string => {
  const mapping: Record<string, string> = {
    'self_claim_expire': 'auto_claim',
    'self_claim_auto': 'auto_claim',
    'manual_distribution': 'manual_review',
    'direct': 'direct',
    'bonus_wallet': 'bonus_wallet',
    'manual_review': 'manual_review',
    'auto_claim': 'auto_claim'
  };
  return mapping[frontendValue] || 'manual_review';
};

// Map reward type
const mapRewardType = (frontendValue: string): string => {
  const mapping: Record<string, string> = {
    'percentage': 'percent',
    'percent': 'percent',
    'fixed': 'fixed',
    'points': 'points',
    'spins': 'spins',
    'coupon': 'coupon'
  };
  return mapping[frontendValue] || 'fixed';
};

// Map rescue claim time to number
const mapRescueClaimTimeToNumber = (frontendValue: string): number => {
  const mapping: Record<string, number> = {
    'next_day': 24,
    'daily': 24,
    'immediate': 0
  };
  return mapping[frontendValue] || 24;
};

// Map loss range to object
const mapLossRangeToObject = (frontendValue: string): { min: number; max: number } | undefined => {
  const mapping: Record<string, { min: number; max: number }> = {
    'yesterday': { min: 0, max: 50000 },     // Yesterday loss range
    'last_week': { min: 0, max: 200000 },    // Last week loss range  
    'last_month': { min: 0, max: 500000 }    // Last month loss range
  };
  return mapping[frontendValue] || undefined;
};



// Reverse mapping functions for loading edit data
const mapBackendToFrontendRewardType = (backendValue?: string): string => {
  const mapping: Record<string, string> = {
    'fixed': 'fixed_amount',
    'percent': 'percentage',
    'points': 'points',
    'spins': 'spins',
    'coupon': 'coupon'
  };
  return mapping[backendValue || ''] || 'fixed_amount';
};

// Reverse mapping for rescue distribution method
const mapBackendToFrontendRescueDistributionMethod = (backendValue?: string): string => {
  const mapping: Record<string, string> = {
    'auto_claim': 'self_claim_expire',
    'manual_review': 'manual_distribution',
    'direct': 'direct',
    'bonus_wallet': 'bonus_wallet'
  };
  return mapping[backendValue || ''] || 'self_claim_expire';
};

// Reverse mapping for loss range object to string
const mapLossRangeFromObject = (backendValue?: { min: number; max: number }): string => {
  if (!backendValue) return 'yesterday';
  
  const { min, max } = backendValue;
  if (min === 0 && max === 50000) return 'yesterday';
  if (min === 0 && max === 200000) return 'last_week';
  if (min === 0 && max === 500000) return 'last_month';
  return 'yesterday'; // Default fallback
};

// Reverse mapping for rescue claim time from number to string
const mapRescueClaimTimeFromNumber = (backendValue?: number): string => {
  const mapping: Record<number, string> = {
    24: 'next_day',
    0: 'immediate'
  };
  return mapping[backendValue || 24] || 'next_day';
};

const mapBackendToFrontendDistributionMethod = (backendValue?: string): string => {
  const mapping: Record<string, string> = {
    'auto_claim': 'expired_auto',
    'manual_review': 'self_claim_expire',
    'direct': 'auto',
    'bonus_wallet': 'bonus'
  };
  return mapping[backendValue || ''] || 'expired_auto';
};

// Newbie bonus mapping functions
const mapNewbiePromotionTypeToBackend = (frontendValue: string): string => {
  const mapping: Record<string, string> = {
    'code_redemption': 'registration',
    'first_deposit_coupon': 'first_deposit',
    'newcomer_gift': 'both',
    'registration_bonus': 'registration'
  };
  return mapping[frontendValue] || 'registration';
};

const mapNewbiePromotionTypeFromBackend = (backendValue?: string): string => {
  const mapping: Record<string, string> = {
    'registration': 'code_redemption',
    'first_deposit': 'first_deposit_coupon',
    'both': 'newcomer_gift'
  };
  return mapping[backendValue || 'registration'] || 'code_redemption';
};

const mapNewbieRedemptionMethodToBackend = (frontendValue: string): string => {
  const mapping: Record<string, string> = {
    'click_link': 'code',
    'private_promotion': 'manual',
    'user_click': 'auto'
  };
  return mapping[frontendValue] || 'manual';
};

const mapNewbieRedemptionMethodFromBackend = (backendValue?: string): string => {
  const mapping: Record<string, string> = {
    'code': 'click_link',
    'manual': 'private_promotion',
    'auto': 'user_click'
  };
  return mapping[backendValue || 'manual'] || 'private_promotion';
};

const mapNewbieGiftMethodToBackend = (frontendValue: string): string => {
  const mapping: Record<string, string> = {
    'fixed_bonus': 'immediate',
    'proportional_gift': 'delayed'
  };
  return mapping[frontendValue] || 'immediate';
};

const mapNewbieGiftMethodFromBackend = (backendValue?: string): string => {
  const mapping: Record<string, string> = {
    'immediate': 'fixed_bonus',
    'delayed': 'proportional_gift',
    'manual': 'fixed_bonus'
  };
  return mapping[backendValue || 'immediate'] || 'fixed_bonus';
};

// Methods
const handleCurrencyChange = (values: (string | number)[]) => {
  // If "all" is selected, automatically select all available currencies
  if (values.includes('all')) {
    formData.currencies = ['all', 'BRL'];
  } else {
    formData.currencies = values.map(v => v.toString());
  }
};

// Handle platform selection validation
const handlePlatformValidation = (isValid: boolean) => {
  isPlatformSelectionValid.value = isValid;
};

const handleModalClose = () => {
  // Reset form data
  Object.assign(formData, {
    activityType: 'recharge',
    category: 'recharge',
    categories: [],
    currency: 'all',
    currencies: [],
    title: '',
    nameType: 'custom',
    startTime: null,
    endTime: null,
    syncDisplayTime: true,
    displayStartTime: null,
    displayEndTime: null,
    condition: 'first_deposit',
    distributionMethod: 'player_claim_expires',
    claimTime: 'real_time',
    claimCount: 'claim_individually', // Claim count: claim_individually (可逐条领取) or claim_highest_only (领取最高一档)
    receiveMethod: 'auto',
    receiveFrequency: 'immediate',
    displayEnabled: true,
    homepageDisplay: false,
    floatingIcon: {
      enabled: false,
      showActivityName: false,
      terminals: {
        android_app: true,
        ios_app: true,
        native_app: false,
        extreme_app: false,
        wechat_app: false,
        pwa_app: false,
        ios_webapp: false,
        pc: true,
        android_h5: true,
        ios_h5: true,
      },
      displayMethod: 'carousel',
      position: 'bottom-right',
      pages: { homepage: true },
      showBackground: 'show',
      iconType: 'general',
      activeLanguageTab: 'pt',
      icons: { general: null, pt: null, zh: null },
      selectedPresetIcon: null,
      timeDisplay: { enabled: false },
    },
    participationMethod: 'auto',
    rechargeMethods: ['all'],
    bonusMethod: 'fixed',
    restrictions: [],
    memberLevel: 'all',
    memberTags: [],
    specifyChannel: false,
    detailPageTime: false,
    transferMethod: '只转核奖金',
    transferMultiplier: 1.00,
    platformRestriction: 'no_limit',
    withdrawalRestriction: 'no_limit',
    ruleTemplate: 'custom',
    rules: '',
    backgroundColor: '#ffffff',
    selectedIcon: 'gift',
    platforms: ['android_app', 'ios_app'],
    translations: {},
    rewardExpirationDays: 1,
    beforeLoginPopup: 'none',
    afterLoginPopup: 'none',
    directPopupAfterRecharge: false,
    rechargeAmounts: [
      { betAmount: '', rewardAmount: 0.00 },
    ],
    // Wagering Specific Fields
    loopMethod: 'single',
    isTimeLimited: false,
    distributionMethod: 'direct',
    claimTime: 24,
    selectTime: 24,
    wageringPlatform: 'all_platforms',
    wageringPlatformConfig: {
      selectedPlatforms: [],
      platformIds: []
    },
    claimCount: 1,

    // Rescue Fund Specific Fields
    rescueWageringPlatform: 'all_platforms',
  rescueWageringPlatformConfig: {
    selectedPlatforms: [],
    platformIds: []
  },
    deductDiscounts: false,
    lossRange: 'yesterday',
    dailyRewardLimit: '',
    rescueDistributionMethod: 'self_claim_expire',
    rescueClaimTime: 'next_day',
    rescueSelectTime: null,
    rescueRewardExpiryDays: 1,
    rewardType: 'percentage',
    rescueRewardSettings: [
      { lossAmount: '', returnRatio: 0.00 },
    ],

    // Sign-in Specific Fields
    checkinWageringPlatform: 'all_platforms',
    checkinRechargeMethods: ['all'],
    signinMethod: 'continuous',
    signinPeriod: '7',
    monthlyReset: false,
    checkinPopupAfterRecharge: false,
    enableMakeupSignin: false,
    checkinBeforeLoginPopup: 'high_frequency',
    checkinAfterLoginPopup: 'high_frequency',
    displayStyle: 'calendar',
    checkinIcon: null,
    checkinRewardMethod: 'daily',
    checkinRewardSettings: [
      { type: 'fixed', rewardAmount: 0.00, rechargeRequirement: 0, wageringRequirement: 0, additionalReward: 0.00, checkinIcon: null },
    ],

    // Lucky Turntable Specific Fields
    turntableSwitches: ['all'],
    luckyValueValidityPeriod: 'daily',
    luckyspinRewardType: 'valid_bet',
    luckyspinWageringPlatform: 'all',
    luckyValuePerBet: 1,
    enableWinningAnnouncement: false,
    announcementInterval: 24,
    announcementCount: 20,

    // Lucky Bet Slip Specific Fields
    luckywagerWageringPlatform: 'all',
    claimCountLimit: 'fixed',
    dailyCountLimit: '',
    totalCountLimit: '',
    minimumValidBetAmount: '',
    luckywagerRewardMethod: 'fixed_amount',
    betSlipNumberRule: 'ending_digits',
    largeAmountReviewAmount: '',
         luckywagerRewardSettings: [
       { betSlipEnding: '', rewardAmount: '' },
     ],

     // Red Packet Specific Fields
     redPacketType: 'fixed',
     redPacketClaimCondition: 'none',
     redPacketRewardType: 'fixed',
     securityVerification: false,
     redPacketTotalAmount: 1000,
     redPacketCountPerPeriod: 10000,
     actualRedPacketMin: 0.02,
     actualRedPacketMax: 0.50,
     displayedRedPacketMin: 0.01,
     displayedRedPacketMax: 378.00,
     grabLimitPerPeriod: 1,
     dailyGrabLimitType: 'fixed',
     dailyGrabLimit: 3,
     totalGrabLimit: 1,
     expectedBonus: 1.00,
     redPacketTotalCountLimit: 1,
     redPacketDisplayStyle: 'modal',
     redPacketDailyDistributionTimes: [
       { startTime: null, endTime: null },
     ],

     // Investment Specific Fields
     investmentType: 'fixed_amount',
     rewardDays: 3,
     investmentDistributionMethod: 'daily_auto',
     investmentSettings: [
       { investmentAmount: '', giftAmount: '' },
     ],

     // Promotion Specific Fields
     promotionAccumulatedRecharge: '',
     promotionAccumulatedRechargeDays: '',
     promotionAccumulatedRechargeCount: '',
     promotionAccumulatedWagering: '',
     promotionWageringPlatform: 'all_platforms',
     promotionWageringPlatformConfig: {
       selectedPlatforms: [],
       platformIds: []
     },
     promotionDownloadAppLogin: false,
     promotionSameIPLimit: '',
     promotionSameDeviceLimit: '',
     promotionRewardType: 'fixed_amount',
     promotionDisplayOnAgentPage: false,
     promotionDistributionMethod: 'expired_auto',
     promotionDisplayClaimMethod: 'open_redpacket',
     promotionDisplayAmount: 'hide',
     promotionRewardSettings: [
       { effectivePromotionCount: '', rewardAmount: '' },
     ],

     // Agent Specific Fields
     agentDisplayOnAgentPage: false,
     agentDistributionMethod: 'expired_auto',
     agentRewardClaimExpiryDays: 1,
     agentRewardCycle: 'daily',
     agentRewardType: 'agent_rebate',
     agentRewardAmountType: 'fixed_amount',
     agentRewardSettings: [
       { rebateAmount: '', rewardAmount: '' },
     ],

     // Collect Characters Specific Fields
     collectCombinationType: 'festival',
     collectCombinationName: 'new_year_luck',
     collectCharacters: ['新', '年', '大', '吉'],
     collectDistributionMethod: 'monthly',
     collectRewardClaimExpiryDays: 1,
     collectActualDistributionAmount: '',
     collectDisplayedDistributionAmount: '',
     collectConditions: [
       { type: 'valid_bet', conditionValue: '', dailyCountLimit: '' },
     ],

     // Guessing/Competition Specific Fields
     guessingTeams: [
       { chineseName: '', englishName: '', icon: '' },
       { chineseName: '', englishName: '', icon: '' },
     ],
     guessingParticipationCondition: 'no_condition',
     guessingObtainPoints: '',
     guessingPointLimit: '',
     guessingBettingLimitMin: '',
     guessingBettingLimitMax: '',
     guessingActualDistributionAmount: '',
     guessingDisplayedDistributionAmount: '',
     guessingDistributionMethod: 'all_members',

     // Newcomer Bonus Specific Fields
               newbiePromotionType: 'code_redemption',
  newbieRedemptionCode: '',
  newbieTotalUsageCount: '',
  newbieStartTime: null,
  newbieEndTime: null,
  newbieRedemptionMethod: 'private_promotion',
  newbiePopupAfterTopup: false,
  newbieGiftMethod: 'fixed_bonus',
  newbieRedemptionSettings: [
    { redemptionCode: '', totalUsageCount: '', startTime: null, endTime: null },
  ],
  newbieRewardSettings: [
    { firstDepositAmount: '', rewardAmount: '' },
  ],
  newbieDisplayBonus: true,
  newbieWithdrawalThreshold: '',
  newbieActualGiftMin: '',
  newbieActualGiftMax: '',
  newbieDisplayGiftMin: '',
  newbieDisplayGiftMax: '',
  newbieExpectedBonus: '',

  // Custom Type Configuration
  customDisplayMethod: 'builtin_page',
  customJumpType: 'external_link',
  customOpenInNewWindow: 'true', // Use string to match form input type
  customTargetUrl: '',
  });
};

const handleCancel = () => {
  modalShow.value = false;
};

// URL validation for custom target URL
const isValidUrl = (url: string): boolean => {
  if (!url || !url.trim()) {
    return false;
  }
  
  const trimmedUrl = url.trim();
  
  // Check if URL starts with http:// or https://
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return false;
  }
  
  // Validate URL format using URL constructor
  try {
    const urlObj = new URL(trimmedUrl);
    
    // Check if hostname is present
    if (!urlObj.hostname || urlObj.hostname.trim() === '') {
      return false;
    }
    
    // Check for invalid characters in hostname
    if (urlObj.hostname.includes(' ')) {
      return false;
    }
    
    return true;
  } catch (e) {
    return false;
  }
};

// Get status for custom URL input field
const getCustomUrlStatus = (): 'error' | 'warning' | 'success' | undefined => {
  if (formData.activityType !== 'custom') {
    return undefined;
  }
  
  if (formData.customDisplayMethod !== 'jump_link' || formData.customJumpType !== 'external_link') {
    return undefined;
  }
  
  if (!formData.customTargetUrl || !formData.customTargetUrl.trim()) {
    return undefined; // Don't show error for empty field until blur
  }
  
  return isValidUrl(formData.customTargetUrl) ? undefined : 'error';
};

// Validate custom URL on blur
const validateCustomUrl = () => {
  if (formData.activityType === 'custom' && 
      formData.customDisplayMethod === 'jump_link' && 
      formData.customJumpType === 'external_link' && 
      formData.customTargetUrl) {
    
    if (!isValidUrl(formData.customTargetUrl)) {
      const url = formData.customTargetUrl.trim();
      if (!url) {
        message.warning('请输入链接地址');
      } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
        message.warning('链接地址必须以 http:// 或 https:// 开头');
      } else {
        message.warning('请输入有效的链接地址');
      }
    }
  }
};

const handleSaveDraft = async () => {
  submitting.value = true;
  try {
    // Validate required fields
    if (!formData.title) {
      message.error('请输入活动名称');
      return;
    }
    
    if (!formData.startTime || !formData.endTime) {
      message.error('请设置活动时间段');
      return;
    }
    
    // Prepare data for API
    const activityData: any = {
      title: formData.title,
      category: formData.category,
      currencyScope: formData.currency,
      type: formData.activityType,
      memberScope: formData.memberLevel,
      claimLimit: 0,
      platforms: formData.platforms,
      startAt: formData.startTime ? new Date(formData.startTime).toISOString() : '',
      endAt: formData.endTime ? new Date(formData.endTime).toISOString() : '',
      status: 'draft',
      displayOrder: 0,
      description: formData.rules,
      rules: formData.rules,
    };
    
    // TODO: Call API to save activity
    console.log('Saving activity draft:', activityData);
    
    message.success('活动已保存为草稿');
    modalShow.value = false;
    emit('success');
  } catch (error) {
    console.error('Error saving activity draft:', error);
    message.error('保存失败，请重试');
  } finally {
    submitting.value = false;
  }
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    // Validate required fields
    if (!formData.title) {
      message.error('请输入活动名称');
      return;
    }
    
    if (!formData.startTime || !formData.endTime) {
      message.error('请设置活动时间段');
      return;
    }
    
    // Validate custom type configuration
    if (formData.activityType === 'custom') {
      if (!formData.customDisplayMethod) {
        message.error('请选择展示方式');
        submitting.value = false;
        return;
      }
      
      if (formData.customDisplayMethod === 'jump_link' && !formData.customJumpType) {
        message.error('请选择跳转页面类型');
        submitting.value = false;
        return;
      }
      
      if (formData.customDisplayMethod === 'jump_link' && formData.customJumpType === 'external_link' && !formData.customTargetUrl) {
        message.error('请输入链接地址');
        submitting.value = false;
        return;
      }
      
      // Validate URL format if external link - strict validation using isValidUrl function
      if (formData.customDisplayMethod === 'jump_link' && formData.customJumpType === 'external_link' && formData.customTargetUrl) {
        const url = formData.customTargetUrl.trim();
        
        // Check if URL is not empty after trimming
        if (!url) {
          message.error('请输入链接地址');
          submitting.value = false;
          return;
        }
        
        // Use the same validation function for consistency
        if (!isValidUrl(url)) {
          // Provide specific error messages
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            message.error('链接地址必须以 http:// 或 https:// 开头');
          } else {
            message.error('请输入有效的链接地址（格式不正确）');
          }
          submitting.value = false;
          return;
        }
      }
    }
    
    // Build config payload including Promotion fields
    console.log('🔍 Debug - Full formData before submission:', formData);
    console.log('🔍 Debug - Activity Type:', formData.activityType);
    
    // Debug log for custom config before saving
    if (formData.activityType === 'custom') {
      console.log('🔍 Debug - Custom Config to Save (BEFORE building payload):', {
        customDisplayMethod: formData.customDisplayMethod,
        customJumpType: formData.customJumpType,
        customTargetUrl: formData.customTargetUrl,
        customOpenInNewWindow: formData.customOpenInNewWindow,
        customOpenInNewWindowType: typeof formData.customOpenInNewWindow,
        willSaveJumpType: formData.customJumpType ? 'YES' : 'NO',
        willSaveTargetUrl: formData.customTargetUrl && formData.customTargetUrl.trim() ? 'YES' : 'NO',
        willSaveOpenInNewWindow: formData.customJumpType ? (formData.customOpenInNewWindow === 'true' || formData.customOpenInNewWindow === true) : 'NO'
      });
    }
    
    const configPayload: any = {
      title: formData.title,
      memberScope: formData.memberLevel,
      claimLimit: 0,
      platforms: formData.platforms,
      description: formData.rules,
      
      // Audit settings
      auditRequired: formData.auditSettings.auditRequired,
      auditMultiplier: formData.auditSettings.auditMultiplier,
      // auditCompletionTimeHours removed - fixed to 24 hours
      auditManualReviewRequired: formData.auditSettings.auditManualReviewRequired,
      rules: formData.rules,
      // Restrictions & Conditions
      restrictions: formData.restrictions,
      memberTags: formData.memberTags,
      platformRestriction: formData.platformRestriction,
      withdrawalRestriction: formData.withdrawalRestriction,
      specifyChannel: formData.specifyChannel,
      // Remove redundant fields - they're stored at root level
      // displayEnabled, homepageDisplay, floatingIconEnabled, iconUrl are at root
      // floatingIconConfig is also at root level, not in config
      // Promotion specific fields - convert to match backend schema
      promotionAccumulatedRecharge: formData.promotionAccumulatedRecharge ? parseFloat(formData.promotionAccumulatedRecharge) : undefined,
      promotionAccumulatedRechargeDays: formData.promotionAccumulatedRechargeDays ? parseInt(formData.promotionAccumulatedRechargeDays) : undefined,
      promotionAccumulatedRechargeCount: formData.promotionAccumulatedRechargeCount ? parseInt(formData.promotionAccumulatedRechargeCount) : undefined,
      promotionAccumulatedWagering: formData.promotionAccumulatedWagering ? parseFloat(formData.promotionAccumulatedWagering) : undefined,
      promotionWageringPlatform: formData.promotionWageringPlatform,
      promotionWageringPlatformConfig: formData.promotionWageringPlatformConfig,
      promotionDownloadAppLogin: formData.promotionDownloadAppLogin,
      promotionSameIPLimit: formData.promotionSameIPLimit ? parseInt(formData.promotionSameIPLimit) : undefined,
      promotionSameDeviceLimit: formData.promotionSameDeviceLimit ? parseInt(formData.promotionSameDeviceLimit) : undefined,
      promotionRewardType: mapFrontendToBackendRewardType(formData.promotionRewardType),
      promotionDisplayOnAgentPage: formData.promotionDisplayOnAgentPage,
      promotionDistributionMethod: mapFrontendToBackendDistributionMethod(formData.promotionDistributionMethod),
      promotionDisplayClaimMethod: formData.promotionDisplayClaimMethod,
      promotionDisplayAmount: formData.promotionDisplayAmount === 'show',
      promotionRewardSettings: formData.promotionRewardSettings?.map(setting => ({
        condition: setting.effectivePromotionCount,
        rewardType: mapFrontendToBackendRewardType('fixed_amount'), // Default
        rewardValue: parseFloat(setting.rewardAmount) || 0,
        maxClaim: 1 // Default
      })) || [],
      // Check-in specific fields - save all to database
      checkinWageringPlatform: [formData.checkinWageringPlatform],
      checkinRechargeMethods: formData.checkinRechargeMethods,
      signinMethod: formData.signinMethod,
      signinPeriod: parseInt(formData.signinPeriod) || 7,
      monthlyReset: Boolean(formData.monthlyReset),
      checkinPopupAfterRecharge: Boolean(formData.checkinPopupAfterRecharge),
      enableMakeupSignin: Boolean(formData.enableMakeupSignin),
      checkinBeforeLoginPopup: formData.checkinBeforeLoginPopup || 'none',
      checkinAfterLoginPopup: formData.checkinAfterLoginPopup || 'none',
      displayStyle: formData.displayStyle,
      checkinIcon: formData.checkinIcon,
      checkinRewardMethod: formData.checkinRewardMethod,
      checkinRewardSettings: Array.isArray(formData.checkinRewardSettings) 
        ? formData.checkinRewardSettings.map((setting, index) => ({
            day: index + 1,
            rewardType: setting.type || 'fixed',
            rewardValue: parseFloat(setting.rewardAmount?.toString() || '0') || 0,
            extraReward: parseFloat(setting.additionalReward?.toString() || '0') || 0,
            rechargeRequirement: parseFloat(setting.rechargeRequirement?.toString() || '0') || 0,
            wageringRequirement: parseFloat(setting.wageringRequirement?.toString() || '0') || 0,
            iconUrl: setting.checkinIcon
          }))
        : [],
      // Custom Type Configuration - ensure all fields are saved
      // 🔒 FIX: Always save all custom fields, even if displayMethod is builtin_page
      // This preserves data when user switches between builtin_page and jump_link
      customDisplayMethod: formData.customDisplayMethod,
      // Save customJumpType if it exists (preserve even when switching to builtin_page)
      customJumpType: formData.customJumpType || undefined,
      // Save customTargetUrl if it exists and is not empty (preserve even when switching to builtin_page)
      customTargetUrl: formData.customTargetUrl && formData.customTargetUrl.trim() ? formData.customTargetUrl.trim() : undefined,
      // 🔒 FIX: Always save customOpenInNewWindow as boolean when jump_link data exists
      // This tells the web app whether to open in new tab or current tab
      customOpenInNewWindow: formData.customJumpType ? (formData.customOpenInNewWindow === 'true' || formData.customOpenInNewWindow === true) : undefined,
      customBuiltinPage: formData.customDisplayMethod === 'builtin_page' ? 'builtin' : undefined,
      // Save customJumpConfig if jump_link data exists
      customJumpConfig: formData.customJumpType ? {
        jumpMode: (() => {
          // Map jump types to jumpMode
          if (formData.customJumpType === 'external_link') return 'URL';
          if (formData.customJumpType === 'activity') return 'ACTIVITY';
          if (formData.customJumpType === 'task') return 'TASK';
          return 'INTERNAL'; // For other internal pages
        })(),
        targetUrl: formData.customJumpType === 'external_link' && formData.customTargetUrl ? formData.customTargetUrl.trim() : undefined,
        targetActivityId: formData.customJumpType === 'activity' ? undefined : undefined, // TODO: Add activity selection if needed
        targetTaskId: formData.customJumpType === 'task' ? undefined : undefined, // TODO: Add task selection if needed
        // 🔒 FIX: Save openInNewWindow as boolean - this is used by web app to determine new tab vs current tab
        openInNewWindow: formData.customOpenInNewWindow === 'true' || formData.customOpenInNewWindow === true
      } : undefined,
      
      // Recharge specific fields - save all to database
      condition: formData.activityType === 'recharge' ? formData.condition : undefined,
      cycleMethod: formData.activityType === 'recharge' && formData.condition === 'accumulate_recharge' ? formData.cycleMethod : undefined,
      distributionMethod: formData.distributionMethod,
      claimTime: formData.claimTime,
      claimCount: formData.activityType === 'recharge' ? formData.claimCount : undefined, // Claim count: claim_individually or claim_highest_only
      rechargeAmounts: formData.activityType === 'recharge' ? formData.rechargeAmounts?.map(item => ({
        betAmount: item.betAmount?.toString() || '',
        rewardAmount: parseFloat(item.rewardAmount?.toString() || '0') || 0
      })) : undefined,
      rechargeMethods: formData.activityType === 'recharge' ? formData.rechargeMethods : undefined,
      bonusMethod: formData.activityType === 'recharge' ? formData.bonusMethod : undefined,
      participationMethod: formData.activityType === 'recharge' ? formData.participationMethod : undefined,
      // ✅ FIX: Ensure beforeLoginPopup and afterLoginPopup are always sent with a value (never undefined)
      beforeLoginPopup: formData.activityType === 'recharge' ? (formData.beforeLoginPopup || 'none') : undefined,
      afterLoginPopup: formData.activityType === 'recharge' ? (formData.afterLoginPopup || 'none') : undefined,
      directPopupAfterRecharge: formData.activityType === 'recharge' ? formData.directPopupAfterRecharge : undefined,
      rewardExpirationDays: formData.activityType === 'recharge' ? formData.rewardExpirationDays : undefined,
      // Wagering specific fields - save all to database
      loopMethod: formData.loopMethod,
      isTimeLimited: formData.isTimeLimited,
      selectTime: formData.selectTime,
      wageringPlatform: formData.wageringPlatform,
      claimCount: formData.claimCount,
      wageringRewardExpiryDays: formData.wageringRewardExpiryDays,
      wageringRewardSettings: formData.wageringRewardSettings?.map(setting => ({
        effectiveWageringAmount: parseFloat(setting.effectiveWageringAmount) || 0,
        rewardAmount: parseFloat(setting.rewardAmount) || 0
      })) || [],
      wageringPlatformConfig: (formData as any).wageringPlatformConfig,
      // Rescue Fund specific fields - save all to database
      rescueWageringPlatform: formData.rescueWageringPlatform === 'all_platforms' ? ['all'] : [formData.rescueWageringPlatform],
      rescueWageringPlatformConfig: (formData as any).rescueWageringPlatformConfig,
      deductDiscounts: formData.deductDiscounts,
      lossRange: mapLossRangeToObject(formData.lossRange),
      dailyRewardLimit: formData.dailyRewardLimit ? parseFloat(formData.dailyRewardLimit) : undefined,
      rescueDistributionMethod: mapRescueDistributionMethod(formData.rescueDistributionMethod),
      rescueClaimTime: mapRescueClaimTimeToNumber(formData.rescueClaimTime),
      rescueSelectTime: formData.rescueSelectTime || undefined,
      rescueRewardExpiryDays: formData.rescueRewardExpiryDays,
      rewardType: mapRewardType(formData.rewardType),
      rescueRewardSettings: formData.rescueRewardSettings?.map(setting => ({
        lossMin: parseFloat(setting.lossAmount) || 0,
        lossMax: parseFloat(setting.lossAmount) || 0, // TODO: Add lossMax field to frontend
        rescueRate: parseFloat(setting.returnRatio.toString()) || 0,
        maxRescue: parseFloat(setting.lossAmount) || 0, // TODO: Add maxRescue field to frontend
        wageringRequirement: 0 // TODO: Add wageringRequirement field to frontend
      })) || [],
      // Red Packet specific fields - save all to database
      redPacketType: formData.redPacketType,
      redPacketClaimCondition: formData.redPacketClaimCondition,
      redPacketRewardType: formData.redPacketRewardType,
      securityVerification: formData.securityVerification,
      redPacketTotalAmount: formData.redPacketTotalAmount,
      redPacketCountPerPeriod: formData.redPacketCountPerPeriod,
      actualRedPacketMin: formData.actualRedPacketMin,
      actualRedPacketMax: formData.actualRedPacketMax,
      displayedRedPacketMin: formData.displayedRedPacketMin,
      displayedRedPacketMax: formData.displayedRedPacketMax,
      grabLimitPerPeriod: formData.grabLimitPerPeriod,
      dailyGrabLimitType: formData.dailyGrabLimitType,
      dailyGrabLimit: formData.dailyGrabLimit,
      totalGrabLimit: formData.totalGrabLimit,
      expectedBonus: formData.expectedBonus,
      redPacketTotalCountLimit: formData.redPacketTotalCountLimit || undefined,
      redPacketDisplayStyle: formData.redPacketDisplayStyle,
      redPacketDailyDistributionTimes: formData.redPacketDailyDistributionTimes?.filter(time => time.startTime && time.endTime).map(time => ({
        startTime: time.startTime,
        endTime: time.endTime
      })) || [],
      // Newbie Bonus specific fields - save all to database with proper mapping
      newbiePromotionType: mapNewbiePromotionTypeToBackend(formData.newbiePromotionType),
      newbieRedemptionCode: formData.newbieRedemptionCode || undefined,
      newbieTotalUsageCount: formData.newbieTotalUsageCount && parseInt(formData.newbieTotalUsageCount) > 0 ? parseInt(formData.newbieTotalUsageCount) : undefined,
      newbieStartTime: formData.newbieStartTime ? new Date(formData.newbieStartTime) : undefined,
      newbieEndTime: formData.newbieEndTime ? new Date(formData.newbieEndTime) : undefined,
      newbieRedemptionMethod: mapNewbieRedemptionMethodToBackend(formData.newbieRedemptionMethod),
      newbiePopupAfterTopup: formData.newbiePopupAfterTopup,
      newbieGiftMethod: mapNewbieGiftMethodToBackend(formData.newbieGiftMethod),
      newbieRedemptionSettings: formData.newbieRedemptionSettings?.filter(s => s.redemptionCode).map(setting => ({
        redemptionCode: setting.redemptionCode,
        totalUsageCount: setting.totalUsageCount ? parseInt(setting.totalUsageCount) : undefined,
        startTime: setting.startTime ? new Date(setting.startTime) : undefined,
        endTime: setting.endTime ? new Date(setting.endTime) : undefined
      })) || undefined,
      newbieRewardSettings: formData.newbieRewardSettings
        ?.filter(s => {
          const depositAmount = parseFloat(s.firstDepositAmount);
          const rewardAmount = parseFloat(s.rewardAmount);
          // Only include settings where both values are valid and positive
          return !isNaN(depositAmount) && depositAmount > 0 && !isNaN(rewardAmount) && rewardAmount > 0;
        })
        .map(setting => ({
          firstDepositMin: parseFloat(setting.firstDepositAmount),
          rewardType: 'fixed' as const,
          rewardValue: parseFloat(setting.rewardAmount),
          cap: undefined,
          validityDays: undefined
        })).filter(s => s.firstDepositMin > 0 && s.rewardValue > 0) // Double check after mapping
        || undefined,
      newbieDisplayBonus: formData.newbieDisplayBonus,
      newbieWithdrawalThreshold: (() => {
        const val = parseFloat(formData.newbieWithdrawalThreshold);
        return !isNaN(val) && val > 0 ? val : undefined;
      })(),
      newbieActualGiftMin: (() => {
        const val = parseFloat(formData.newbieActualGiftMin);
        return !isNaN(val) && val > 0 ? val : undefined;
      })(),
      newbieActualGiftMax: (() => {
        const val = parseFloat(formData.newbieActualGiftMax);
        return !isNaN(val) && val > 0 ? val : undefined;
      })(),
      newbieDisplayGiftMin: (() => {
        const val = parseFloat(formData.newbieDisplayGiftMin);
        return !isNaN(val) && val > 0 ? val : undefined;
      })(),
      newbieDisplayGiftMax: (() => {
        const val = parseFloat(formData.newbieDisplayGiftMax);
        return !isNaN(val) && val > 0 ? val : undefined;
      })(),
      newbieExpectedBonus: (() => {
        const val = parseFloat(formData.newbieExpectedBonus);
        return !isNaN(val) && val > 0 ? val : undefined;
      })()
    };

    console.log('🔍 Debug - ConfigPayload before submission:', configPayload);
    
    // Debug newbie bonus fields specifically
    if (formData.activityType === 'newbie') {
      console.log('🎁 Debug - Newbie Bonus specific fields in payload:', {
        newbiePromotionType: configPayload.newbiePromotionType,
        newbieRedemptionMethod: configPayload.newbieRedemptionMethod,
        newbieGiftMethod: configPayload.newbieGiftMethod,
        newbieTotalUsageCount: configPayload.newbieTotalUsageCount,
        newbieRewardSettings: configPayload.newbieRewardSettings,
        newbieWithdrawalThreshold: configPayload.newbieWithdrawalThreshold,
        newbieActualGiftMin: configPayload.newbieActualGiftMin,
        newbieActualGiftMax: configPayload.newbieActualGiftMax,
        newbieDisplayGiftMin: configPayload.newbieDisplayGiftMin,
        newbieDisplayGiftMax: configPayload.newbieDisplayGiftMax
      });
      
      // For newbie bonus, we need either:
      // 1. Reward settings table with valid entries, OR
      // 2. Gift amount ranges (min/max) configured
      const hasRewardSettings = configPayload.newbieRewardSettings && configPayload.newbieRewardSettings.length > 0;
      const hasGiftAmounts = configPayload.newbieActualGiftMin && configPayload.newbieActualGiftMax;
      
      if (!hasRewardSettings && !hasGiftAmounts) {
        message.warning('请配置奖励设置：填写实际赠送金额范围，或添加奖励设置表（如果使用固定金额方式）');
        submitting.value = false;
        return;
      }
      
      // If no reward settings but has gift amounts, create a default reward setting
      if (!hasRewardSettings && hasGiftAmounts) {
        configPayload.newbieRewardSettings = [{
          firstDepositMin: 1, // Minimum deposit of 1
          rewardType: 'fixed' as const,
          rewardValue: configPayload.newbieActualGiftMin || 0.01,
          cap: configPayload.newbieActualGiftMax,
          validityDays: undefined
        }];
        console.log('✅ Auto-generated reward setting from gift amounts:', configPayload.newbieRewardSettings);
      }
    }
    
    console.log('🔍 Debug - Rescue specific fields in payload:', {
      rescueWageringPlatform: configPayload.rescueWageringPlatform,
      rescueWageringPlatformConfig: configPayload.rescueWageringPlatformConfig,
      deductDiscounts: configPayload.deductDiscounts,
      lossRange: configPayload.lossRange,
      dailyRewardLimit: configPayload.dailyRewardLimit,
      rescueDistributionMethod: configPayload.rescueDistributionMethod,
      rescueClaimTime: configPayload.rescueClaimTime,
      rescueSelectTime: configPayload.rescueSelectTime,
      rescueRewardExpiryDays: configPayload.rescueRewardExpiryDays,
      rewardType: configPayload.rewardType,
      rescueRewardSettings: configPayload.rescueRewardSettings
    });

    if (isEditing.value && props.editingItem?.id) {
      const updatePayload: any = {
        type: formData.activityType,
        category: formData.categories.length > 0 ? formData.categories.join(',') : formData.category,
        currency: formData.currencies.length > 0 ? formData.currencies.join(',') : formData.currency,
        status: 'active',
        startsAt: formData.startTime ? new Date(formData.startTime) : undefined,
        endsAt: formData.endTime ? new Date(formData.endTime) : undefined,
        isVisible: true,
        // Add root level fields
        promoUrl: formData.promoImage && formData.promoImage.trim() !== '' ? formData.promoImage : undefined,
        displayEnabled: formData.displayEnabled,
        homepageDisplay: formData.homepageDisplay,
        floatingIconEnabled: formData.floatingIcon.enabled,
        floatingIconConfig: {
          jumpMode: 'NONE', // Default jump mode
          targetUrl: undefined, // Use undefined instead of empty string
          targetActivityId: undefined, // Use undefined instead of null
          targetTaskId: undefined, // Use undefined instead of null
          iconUrl: (formData.floatingIcon.icons.general?.trim() && formData.floatingIcon.icons.general.trim() !== '') ? formData.floatingIcon.icons.general : 
                   (formData.floatingIcon.selectedPresetIcon?.trim() && formData.floatingIcon.selectedPresetIcon.trim() !== '') ? formData.floatingIcon.selectedPresetIcon : undefined,
          position: formData.floatingIcon.position || 'bottom-right', // Position is now already in correct format
          size: 'medium',
          animation: 'bounce',
          backgroundColor: '#ffffff',
          textColor: '#000000',
          customAction: undefined, // Use undefined instead of null
          metadata: {
            enabled: formData.floatingIcon.enabled,
            showActivityName: formData.floatingIcon.showActivityName,
            terminals: formData.floatingIcon.terminals,
            displayMethod: formData.floatingIcon.displayMethod,
            pages: formData.floatingIcon.pages,
            showBackground: formData.floatingIcon.showBackground,
            iconType: formData.floatingIcon.iconType,
            icons: formData.floatingIcon.icons,
            selectedPresetIcon: formData.floatingIcon.selectedPresetIcon,
            timeDisplay: formData.floatingIcon.timeDisplay,
          }
        },
        // Add recharge-specific fields at root level (backend will merge into config)
        ...(formData.activityType === 'recharge' ? {
          condition: formData.condition,
          cycleMethod: formData.condition === 'accumulate_recharge' ? formData.cycleMethod : undefined,
          distributionMethod: formData.distributionMethod,
          claimTime: formData.claimTime,
          claimCount: formData.claimCount, // Claim count setting
          rechargeAmounts: formData.rechargeAmounts,
          rechargeMethods: formData.rechargeMethods,
          bonusMethod: formData.bonusMethod,
          participationMethod: formData.participationMethod,
          beforeLoginPopup: formData.beforeLoginPopup,
          afterLoginPopup: formData.afterLoginPopup,
          directPopupAfterRecharge: formData.directPopupAfterRecharge,
          rewardExpirationDays: formData.rewardExpirationDays,
        } : {}),
        config: configPayload,
      };
      
      console.log('🚀 Debug - Final UPDATE payload:', updatePayload);
      console.log('🚀 Debug - Custom config in payload:', {
        customDisplayMethod: configPayload.customDisplayMethod,
        customJumpType: configPayload.customJumpType,
        customTargetUrl: configPayload.customTargetUrl,
        customOpenInNewWindow: configPayload.customOpenInNewWindow,
        customJumpConfig: configPayload.customJumpConfig
      });
      await updateActivityV2(Number((props.editingItem as any).id), updatePayload);
      message.success('活动更新成功！');
      modalShow.value = false;
      emit('success');
    } else {
      const createPayload: CreateActivityInput = {
        type: formData.activityType,
        category: formData.categories.length > 0 ? formData.categories.join(',') : formData.category,
        currency: formData.currencies.length > 0 ? formData.currencies.join(',') : formData.currency,
        status: 'active',
        startsAt: formData.startTime ? new Date(formData.startTime) : undefined,
        endsAt: formData.endTime ? new Date(formData.endTime) : undefined,
        // Add root level fields
        displayEnabled: formData.displayEnabled,
        homepageDisplay: formData.homepageDisplay,
        floatingIconEnabled: formData.floatingIcon.enabled,
        floatingIconConfig: {
          jumpMode: 'NONE', // Default jump mode
          targetUrl: undefined, // Use undefined instead of empty string
          targetActivityId: undefined, // Use undefined instead of null
          targetTaskId: undefined, // Use undefined instead of null
          iconUrl: (formData.floatingIcon.icons.general?.trim() && formData.floatingIcon.icons.general.trim() !== '') ? formData.floatingIcon.icons.general : 
                   (formData.floatingIcon.selectedPresetIcon?.trim() && formData.floatingIcon.selectedPresetIcon.trim() !== '') ? formData.floatingIcon.selectedPresetIcon : undefined,
          position: formData.floatingIcon.position || 'bottom-right', // Position is now already in correct format
          size: 'medium',
          animation: 'bounce',
          backgroundColor: '#ffffff',
          textColor: '#000000',
          customAction: undefined, // Use undefined instead of null
          metadata: {
            enabled: formData.floatingIcon.enabled,
            showActivityName: formData.floatingIcon.showActivityName,
            terminals: formData.floatingIcon.terminals,
            displayMethod: formData.floatingIcon.displayMethod,
            pages: formData.floatingIcon.pages,
            showBackground: formData.floatingIcon.showBackground,
            iconType: formData.floatingIcon.iconType,
            icons: formData.floatingIcon.icons,
            selectedPresetIcon: formData.floatingIcon.selectedPresetIcon,
            timeDisplay: formData.floatingIcon.timeDisplay,
          }
        },
        // Add recharge-specific fields at root level (backend will merge into config)
        ...(formData.activityType === 'recharge' ? {
          condition: formData.condition,
          cycleMethod: formData.condition === 'accumulate_recharge' ? formData.cycleMethod : undefined,
          distributionMethod: formData.distributionMethod,
          claimTime: formData.claimTime,
          claimCount: formData.claimCount, // Claim count setting
          rechargeAmounts: formData.rechargeAmounts,
          rechargeMethods: formData.rechargeMethods,
          bonusMethod: formData.bonusMethod,
          participationMethod: formData.participationMethod,
          beforeLoginPopup: formData.beforeLoginPopup,
          afterLoginPopup: formData.afterLoginPopup,
          directPopupAfterRecharge: formData.directPopupAfterRecharge,
          rewardExpirationDays: formData.rewardExpirationDays,
        } : {}),
        config: configPayload,
        createdBy: 1,
        locales: [
          { locale: 'pt-BR', title: formData.title, description: formData.rules },
          { locale: 'zh-CN', title: formData.title, description: formData.rules },
        ],
      };
      
      console.log('🚀 Debug - Final CREATE payload:', createPayload);
      await createActivity(createPayload);
      message.success('活动创建成功！');
      modalShow.value = false;
      emit('success');
    }
  } catch (error) {
    console.error('Error submitting activity:', error);
    message.error('提交失败，请重试');
  } finally {
    submitting.value = false;
  }
};

const openTranslationModal = () => {
  translationModalShow.value = true;
};

const saveTranslations = () => {
  translationModalShow.value = false;
  message.success('多语言设置已保存');
};

const openIconUpload = () => {
  iconUploadModalShow.value = true;
};

const saveCustomIcon = () => {
  iconUploadModalShow.value = false;
  message.success('自定义图标已保存');
};



const handlePromoImageChange = (options: any) => {
  promoImageList.value = options.fileList;
};

const handleCustomIconChange = (options: any) => {
  customIconList.value = options.fileList;
};

// Methods for Recharge Amount Configuration
const addRechargeAmount = () => {
  formData.rechargeAmounts.push({ betAmount: '', rewardAmount: 0.00 });
};

const removeRechargeAmount = (index: number) => {
  formData.rechargeAmounts.splice(index, 1);
};

// Methods for Rescue Fund Reward Settings
const addRescueRewardSetting = () => {
  formData.rescueRewardSettings.push({ lossAmount: '', returnRatio: 0.00 });
};

const removeRescueRewardSetting = (index: number) => {
  formData.rescueRewardSettings.splice(index, 1);
};

// Methods for Sign-in Reward Settings
const addCheckinRewardSetting = () => {
  formData.checkinRewardSettings.push({ 
    type: 'fixed', 
    rewardAmount: 0.00, 
    rechargeRequirement: 0, 
    wageringRequirement: 0, 
    additionalReward: 0.00,
    checkinIcon: null
  });
};

const removeCheckinRewardSetting = (index: number) => {
  formData.checkinRewardSettings.splice(index, 1);
};

const handleCheckinRechargeMethodChange = (values: (string | number)[]) => {
  // If "all" is selected, automatically select all available recharge methods
  if (values.includes('all')) {
    formData.checkinRechargeMethods = ['all', 'pix', 'customer_service', 'merchant'];
  } else {
    formData.checkinRechargeMethods = values.map(v => v.toString());
  }
};

const handleRechargeMethodChange = (values: (string | number)[]) => {
  // If "all" is selected, automatically select all available recharge methods
  if (values.includes('all')) {
    formData.rechargeMethods = ['all', 'pix', 'customer_service', 'merchant'];
  } else {
    formData.rechargeMethods = values.map(v => v.toString());
  }
};

const handleCheckinIconChange = (options: any) => {
  // Handle check-in icon change
  console.log('Check-in icon changed:', options);
};

// Methods for Lucky Bet Slip Specific Fields
const addLuckywagerRewardSetting = () => {
  formData.luckywagerRewardSettings.push({ betSlipEnding: '', rewardAmount: '' });
};

const removeLuckywagerRewardSetting = (index: number) => {
  formData.luckywagerRewardSettings.splice(index, 1);
};

// Methods for Investment Specific Fields
const addInvestmentSetting = () => {
  formData.investmentSettings.push({ investmentAmount: '', giftAmount: '' });
};

const calculateAccumulatedReward = (item: { investmentAmount: string; giftAmount: string }) => {
  if (!item.investmentAmount || !item.giftAmount) return '-';
  const investment = parseFloat(item.investmentAmount);
  const gift = parseFloat(item.giftAmount);
  if (isNaN(investment) || isNaN(gift)) return '-';
  return (investment + gift).toFixed(2);
};

const calculateDailyReward = (item: { investmentAmount: string; giftAmount: string }) => {
  if (!item.investmentAmount || !item.giftAmount || !formData.rewardDays) return '-';
  const investment = parseFloat(item.investmentAmount);
  const gift = parseFloat(item.giftAmount);
  if (isNaN(investment) || isNaN(gift)) return '-';
  const totalReward = investment + gift;
  return (totalReward / formData.rewardDays).toFixed(2);
};

// Methods for Floating Icon
const handleFloatingIconUpload = (language: string, event: any) => {
  const { file } = event;
  if (file && file.status === 'finished') {
    // Simulate file upload success
    const fileInfo = {
      name: file.name,
      url: `/uploads/floating-icons/${Date.now()}-${file.name}`
    };
    
    if (language === 'general') {
      formData.floatingIcon.icons.general = fileInfo;
    } else if (language === 'pt') {
      formData.floatingIcon.icons.pt = fileInfo;
    } else if (language === 'zh') {
      formData.floatingIcon.icons.zh = fileInfo;
    }
    
    message.success(`${language === 'general' ? '通用' : language === 'pt' ? '葡萄牙语' : '简体中文'}图标上传成功`);
  }
};

const selectPresetIcon = (icon: { id: string; name: string; url: string }) => {
  formData.floatingIcon.selectedPresetIcon = icon.id;
  formData.floatingIcon.icons.general = {
    name: icon.name,
    url: icon.url
  };
  message.success(`已选择预设图标: ${icon.name}`);
};

// Methods for Promotion Specific Fields
const addPromotionRewardSetting = () => {
  formData.promotionRewardSettings.push({ effectivePromotionCount: '', rewardAmount: '' });
};

const downloadPromotionTemplate = async () => {
  try {
    console.log('Download promotion template');
    
    // Check if this is a promotion activity type
    if (formData.activityType !== 'promotion') {
      message.error('只有推广类型活动支持模板下载');
      return;
    }
    
    // Use generic template endpoint (no activity ID required)
    const downloadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/activities/promotion/template/download`;
    
    // Method 1: Direct window.open (works best for downloads)
    window.open(downloadUrl, '_blank');
    
    message.success('模板下载开始');
  } catch (error) {
    console.error('❌ Download failed:', error);
    message.error('模板下载失败');
  }
};

const batchImportPromotion = () => {
  try {
    console.log('Batch import promotion settings');
    
    // Check if this is a promotion activity type
    if (formData.activityType !== 'promotion') {
      message.error('只有推广类型活动支持批量导入');
      return;
    }

    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    input.style.display = 'none';
    
    input.onchange = async (event: any) => {
      const file = event.target?.files?.[0];
      if (!file) return;
      
      try {
        console.log('🔍 Starting file import for:', file.name, 'Size:', file.size, 'bytes');
        
        // Check file type and parse accordingly
        const fileName = file.name.toLowerCase();
        let result;
        
        if (fileName.endsWith('.csv')) {
          console.log('📄 Processing CSV file');
          // Read CSV file content
          const csvContent = await readFileAsText(file);
          console.log('📖 CSV content length:', csvContent.length);
          result = parsePromotionCSV(csvContent);
        } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
          console.log('📊 Processing Excel file');
          // Parse Excel file
          result = await parsePromotionExcel(file);
        } else {
          console.log('❌ Unsupported file type:', fileName);
          message.error('不支持的文件格式，请上传 .csv 或 .xlsx 文件');
          return;
        }
        
        console.log(' Parse result:', result);
        
        if (result?.success) {
          const importCount = (result as any).importCount;
          const rewardSettings = (result as any).rewardSettings;
          
          console.log(`✅ Successfully parsed ${importCount} settings:`, rewardSettings);
          message.success(`成功导入 ${importCount} 个奖励设置`);
          
          // Update form data with imported settings
          formData.promotionRewardSettings = rewardSettings;
          
          console.log('📝 Updated form data:', formData.promotionRewardSettings);
        } else {
          const errorMessage = (result as any)?.message || '批量导入失败';
          console.log('❌ Import failed:', errorMessage);
          message.error(errorMessage);
        }
      } catch (error) {
        console.error('❌ Import failed with exception:', error);
        message.error('批量导入失败，请检查文件格式');
      } finally {
        // Clean up
        document.body.removeChild(input);
      }
    };
    
    // Trigger file selection
    document.body.appendChild(input);
    input.click();
    
  } catch (error) {
    console.error('❌ Batch import error:', error);
    message.error('批量导入功能异常');
  }
};

// Helper function to read file as text
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file, 'UTF-8');
  });
};

// Helper function to parse promotion CSV
const parsePromotionCSV = (csvContent: string) => {
  try {
    const lines = csvContent.trim().split('\n');
    const rewardSettings = [];
    let importCount = 0;
    let skipCount = 0;

    // Skip header row and process data rows
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i]?.split(',');
      
      if (!row || row.length < 2) {
        skipCount++;
        continue;
      }

      const referralCount = parseInt(row[0]?.trim() || '0');
      const rewardAmount = parseFloat(row[1]?.trim() || '0');

      // Validate data
      if (isNaN(referralCount) || isNaN(rewardAmount) || referralCount <= 0 || rewardAmount < 0) {
        skipCount++;
        continue;
      }

      // Create reward setting object in frontend format
      rewardSettings.push({
        effectivePromotionCount: referralCount.toString(),
        rewardAmount: rewardAmount.toString()
      });

      importCount++;
    }

    if (rewardSettings.length === 0) {
      return {
        success: false,
        message: '没有有效的奖励设置数据'
      };
    }

    return {
      success: true,
      importCount,
      skipCount,
      rewardSettings,
      message: `成功导入 ${importCount} 个奖励设置${skipCount > 0 ? `，跳过 ${skipCount} 个无效数据` : ''}`
    };
  } catch (error) {
    return {
      success: false,
      message: 'CSV文件格式错误'
    };
  }
};

// Helper function to parse promotion Excel file
const parsePromotionExcel = async (file: File) => {
  try {
    console.log('🔍 Attempting to parse Excel file:', file.name);
    
    // Try to use SheetJS if available
    const XLSX = (window as any).XLSX;
    if (XLSX) {
      console.log('✅ SheetJS library found, using it to parse Excel');
      return await parseExcelWithSheetJS(file, XLSX);
    }
    
    // If SheetJS not available, provide clear instructions
    console.log('❌ SheetJS library not available');
    return {
      success: false,
      message: '系统暂不支持Excel文件解析，请将Excel文件另存为CSV格式后重新导入。\n\n操作步骤：\n1. 在Excel中打开您的文件\n2. 点击"文件" > "另存为"\n3. 选择"CSV (逗号分隔值)" 格式\n4. 保存后重新导入CSV文件'
    };
  } catch (error) {
    console.error('❌ Excel parsing error:', error);
    return {
      success: false,
      message: 'Excel文件解析失败，请检查文件格式或转换为CSV格式后重试'
    };
  }
};

// Helper function to parse Excel using SheetJS
const parseExcelWithSheetJS = async (file: File, XLSX: any) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to array of arrays
        const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Parse the data
        const rewardSettings = [];
        let importCount = 0;
        let skipCount = 0;

        // Skip header row and process data rows
        for (let i = 1; i < sheetData.length; i++) {
          const row = sheetData[i] as any[];
          
          if (!row || row.length < 2) {
            skipCount++;
            continue;
          }

          const referralCount = parseInt(row[0]?.toString().trim());
          const rewardAmount = parseFloat(row[1]?.toString().trim());

          // Validate data
          if (isNaN(referralCount) || isNaN(rewardAmount) || referralCount <= 0 || rewardAmount < 0) {
            skipCount++;
            continue;
          }

          // Create reward setting object in frontend format
          rewardSettings.push({
            effectivePromotionCount: referralCount.toString(),
            rewardAmount: rewardAmount.toString()
          });

          importCount++;
        }

        if (rewardSettings.length === 0) {
          resolve({
            success: false,
            message: '没有有效的奖励设置数据'
          });
          return;
        }

        resolve({
          success: true,
          importCount,
          skipCount,
          rewardSettings,
          message: `成功导入 ${importCount} 个奖励设置${skipCount > 0 ? `，跳过 ${skipCount} 个无效数据` : ''}`
        });
      } catch (error) {
        resolve({
          success: false,
          message: 'Excel文件解析失败'
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        message: 'Excel文件读取失败'
      });
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Methods for Agent Specific Fields
const addAgentRewardSetting = () => {
  formData.agentRewardSettings.push({ rebateAmount: '', rewardAmount: '' });
};

const removeAgentRewardSetting = (index: number) => {
  formData.agentRewardSettings.splice(index, 1);
};

// Methods for Collect Characters Specific Fields
const addCollectCondition = () => {
  formData.collectConditions.push({ type: 'valid_bet', conditionValue: '', dailyCountLimit: '' });
};

const removeCollectCondition = (index: number) => {
  formData.collectConditions.splice(index, 1);
};

const getDistributionMethodText = () => {
  switch (formData.collectDistributionMethod) {
    case 'daily': return '每日';
    case 'weekly': return '每周';
    case 'monthly': return '每月';
    default: return '每月';
  }
};

// Options for Collect Characters
const collectCombinationOptions = [
  { label: '节日语', value: 'festival' },
  { label: '祝福语', value: 'blessing' },
  { label: '成语', value: 'idiom' },
];

const collectCombinationNameOptions = [
  { label: '新年大吉', value: 'new_year_luck' },
  { label: '恭喜发财', value: 'congratulations_wealth' },
  { label: '万事如意', value: 'everything_goes_well' },
];

const collectConditionTypeOptions = [
  { label: '有效投注', value: 'valid_bet' },
  { label: '充值金额', value: 'recharge_amount' },
  { label: '登录次数', value: 'login_count' },
];

// Methods for Guessing/Competition Specific Fields
const addGuessingTeam = () => {
  formData.guessingTeams.push({ chineseName: '', englishName: '', icon: '' });
};

const uploadTeamIcon = (index: number) => {
  // TODO: Implement team icon upload functionality
  console.log('Upload team icon for team', index);
};

// Options for Guessing/Competition
const guessingParticipationOptions = [
  { label: '无条件', value: 'no_condition' },
  { label: 'VIP等级', value: 'vip_level' },
  { label: '充值金额', value: 'recharge_amount' },
  { label: '打码金额', value: 'wagering_amount' },
];

const guessingObtainPointsOptions = [
  { label: '有效投注', value: 'valid_bet' },
  { label: '充值金额', value: 'recharge_amount' },
  { label: '登录次数', value: 'login_count' },
  { label: '完成任务', value: 'complete_task' },
];

// Methods for Newcomer Bonus Specific Fields
const addNewbieRewardSetting = () => {
  formData.newbieRewardSettings.push({ firstDepositAmount: '', rewardAmount: '' });
};

const removeNewbieRewardSetting = (index: number) => {
  formData.newbieRewardSettings.splice(index, 1);
};

const addNewbieValidityPeriod = () => {
  // TODO: Implement validity period addition functionality
  console.log('Add newbie validity period');
};

const addNewbieRedemptionSetting = () => {
  formData.newbieRedemptionSettings.push({ 
    redemptionCode: '', 
    totalUsageCount: '', 
    startTime: null, 
    endTime: null 
  });
};

const removeNewbieRedemptionSetting = (index: number) => {
  formData.newbieRedemptionSettings.splice(index, 1);
};

const downloadNewbieTemplate = () => {
  // TODO: Implement template download functionality
  console.log('Download newcomer bonus template');
};

const batchImportNewbie = () => {
  // TODO: Implement batch import functionality
  console.log('Batch import newcomer bonus settings');
};

const goToWithdrawalSettings = () => {
  // TODO: Implement navigation to withdrawal settings
  console.log('Navigate to withdrawal settings page');
};

// Options for Newcomer Bonus
const newbiePromotionTypeOptions = [
  { label: '首充优惠券', value: 'first_deposit_coupon' },
  { label: '新人礼包', value: 'newcomer_gift' },
  { label: '注册奖励', value: 'registration_bonus' },
  { label: '通用型兑换码（填写即可领奖', value: 'code_redemption' },
];

// Watch for modal show/hide to reset form
watch(() => props.show, (newShow) => {
  if (!newShow) {
    // Reset form when modal is closed
    resetFormData();
  } else if (newShow && props.editingItem) {
    // If modal opens with editing item, ensure data is loaded
    // This handles the case where editingItem is set before show becomes true
    console.log('🔍 Modal opened with editing item, triggering data load');
  }
});

// Watch for activity type changes to auto-set newbie promotion type
watch(() => formData.activityType, (newType) => {
  if (newType === 'newbie') {
    formData.newbiePromotionType = 'code_redemption';
  }
});

// Watch for editing item changes - use immediate: true to load data when item is already set
watch(() => props.editingItem, (newItem) => {
  console.log('🔍 Watch triggered - editingItem changed:', newItem ? 'has item' : 'no item');
  if (newItem) {
    // Helper function to safely parse dates
    const parseDate = (dateValue: any) => {
      if (!dateValue) return null;
      
      try {
        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? null : date.getTime();
      } catch (error) {
        console.warn('Invalid date value:', dateValue, error);
        return null;
      }
    };
    
    // Populate form with editing item data (prefer values from config)
    Object.assign(formData, {
      title: (newItem as any).config?.title || (newItem as any).title || '',
      activityType: (newItem as any).type || 'recharge',
      category: (newItem as any).category,
      currency: (newItem as any).currency,
      startTime: parseDate((newItem as any).startsAt || (newItem as any).startAt),
      endTime: parseDate((newItem as any).endsAt || (newItem as any).endAt),
      platforms: (newItem as any).config?.platforms || (newItem as any).platforms || [],
      rules: (newItem as any).config?.rules || (newItem as any).rules || '',
      displayEnabled: (newItem as any).displayEnabled ?? (newItem as any).config?.displayEnabled ?? true,
      homepageDisplay: (newItem as any).homepageDisplay ?? (newItem as any).config?.homepageDisplay ?? false,
      promoImage: (newItem as any).promoUrl || (newItem as any).iconUrl || (newItem as any).config?.iconUrl || undefined,
    });

    // Parse categories from comma-separated string to array
    if ((newItem as any).category) {
      formData.categories = (newItem as any).category.split(',').filter(Boolean);
    } else {
      formData.categories = [];
    }

    // Parse currencies from comma-separated string to array
    if ((newItem as any).currency) {
      formData.currencies = (newItem as any).currency.split(',').filter(Boolean);
    } else {
      formData.currencies = [];
    }

    // Floating icon settings
    const fic = (newItem as any).floatingIconConfig || (newItem as any).config?.floatingIconConfig || {};
    formData.floatingIcon.enabled = (newItem as any).floatingIconEnabled ?? (newItem as any).config?.floatingIconEnabled ?? false;
    
    // Load floating icon config from metadata if available
    if (fic.metadata) {
      formData.floatingIcon.showActivityName = fic.metadata.showActivityName ?? false;
      formData.floatingIcon.terminals = fic.metadata.terminals || formData.floatingIcon.terminals;
      formData.floatingIcon.displayMethod = fic.metadata.displayMethod || formData.floatingIcon.displayMethod;
      formData.floatingIcon.pages = fic.metadata.pages || formData.floatingIcon.pages;
      formData.floatingIcon.showBackground = fic.metadata.showBackground || formData.floatingIcon.showBackground;
      formData.floatingIcon.iconType = fic.metadata.iconType || formData.floatingIcon.iconType;
      formData.floatingIcon.icons = fic.metadata.icons || formData.floatingIcon.icons;
      formData.floatingIcon.selectedPresetIcon = fic.metadata.selectedPresetIcon || null;
      formData.floatingIcon.timeDisplay = fic.metadata.timeDisplay || formData.floatingIcon.timeDisplay;
    } else {
      // Fallback to direct properties for backward compatibility
      formData.floatingIcon.showActivityName = fic.showActivityName ?? false;
      formData.floatingIcon.terminals = fic.terminals || formData.floatingIcon.terminals;
      formData.floatingIcon.displayMethod = fic.displayMethod || formData.floatingIcon.displayMethod;
      formData.floatingIcon.pages = fic.pages || formData.floatingIcon.pages;
      formData.floatingIcon.showBackground = fic.showBackground || formData.floatingIcon.showBackground;
      formData.floatingIcon.iconType = fic.iconType || formData.floatingIcon.iconType;
      formData.floatingIcon.icons = fic.icons || formData.floatingIcon.icons;
      formData.floatingIcon.selectedPresetIcon = fic.selectedPresetIcon || null;
      formData.floatingIcon.timeDisplay = fic.timeDisplay || formData.floatingIcon.timeDisplay;
    }
    
    // Load position from floatingIconConfig and convert underscores to dashes for backward compatibility
    formData.floatingIcon.position = (fic.position || formData.floatingIcon.position).replace('_', '-');
    
    // Load icon from floatingIconConfig.iconUrl
    if (fic.iconUrl) {
      formData.floatingIcon.icons.general = fic.iconUrl;
    }

    // Promotion fields - convert from backend to frontend format
    formData.promotionAccumulatedRecharge = (newItem as any).config?.promotionAccumulatedRecharge?.toString() || '';

    // Auto-set newbie promotion type if activity type is newbie
    if ((newItem as any).type === 'newbie') {
      formData.newbiePromotionType = 'code_redemption';
    }
    formData.promotionAccumulatedRechargeDays = (newItem as any).config?.promotionAccumulatedRechargeDays?.toString() || '';
    formData.promotionAccumulatedRechargeCount = (newItem as any).config?.promotionAccumulatedRechargeCount?.toString() || '';
    formData.promotionAccumulatedWagering = (newItem as any).config?.promotionAccumulatedWagering?.toString() || '';
    formData.promotionWageringPlatform = (newItem as any).config?.promotionWageringPlatform || 'all_platforms';
    formData.promotionWageringPlatformConfig = (newItem as any).config?.promotionWageringPlatformConfig || {
      selectedPlatforms: [],
      platformIds: []
    };
    formData.promotionDownloadAppLogin = (newItem as any).config?.promotionDownloadAppLogin ?? false;
    formData.promotionSameIPLimit = (newItem as any).config?.promotionSameIPLimit?.toString() || '';
    formData.promotionSameDeviceLimit = (newItem as any).config?.promotionSameDeviceLimit?.toString() || '';
    formData.promotionRewardType = mapBackendToFrontendRewardType((newItem as any).config?.promotionRewardType) || formData.promotionRewardType;
    formData.promotionDisplayOnAgentPage = (newItem as any).config?.promotionDisplayOnAgentPage ?? false;
    formData.promotionDistributionMethod = mapBackendToFrontendDistributionMethod((newItem as any).config?.promotionDistributionMethod) || formData.promotionDistributionMethod;
          formData.promotionDisplayClaimMethod = (newItem as any).config?.promotionDisplayClaimMethod || formData.promotionDisplayClaimMethod;
    formData.promotionDisplayAmount = (newItem as any).config?.promotionDisplayAmount ? 'show' : 'hide';
    formData.promotionRewardSettings = (newItem as any).config?.promotionRewardSettings?.map((setting: any) => ({
      effectivePromotionCount: setting.condition || '',
      rewardAmount: setting.rewardValue?.toString() || ''
    })) || formData.promotionRewardSettings;

    // Load restrictions and conditions
    formData.restrictions = (newItem as any).config?.restrictions || [];
    formData.memberLevel = (newItem as any).config?.memberScope || 'all';
    formData.memberTags = (newItem as any).config?.memberTags || [];
    formData.platformRestriction = (newItem as any).config?.platformRestriction || 'no_limit';
    formData.withdrawalRestriction = (newItem as any).config?.withdrawalRestriction || 'no_limit';
    formData.specifyChannel = (newItem as any).config?.specifyChannel ?? false;

    // Load audit settings
    formData.auditSettings = {
      auditRequired: (newItem as any).config?.auditRequired ?? true,
      auditMultiplier: (newItem as any).config?.auditMultiplier ?? 1.0,
      // auditCompletionTimeHours removed - fixed to 24 hours
      auditManualReviewRequired: (newItem as any).config?.auditManualReviewRequired ?? false,
    };

    // Load custom type configuration - ALWAYS load, not just for custom type
    const customConfig = (newItem as any).config || {};
    const activityType = (newItem as any).type || formData.activityType;
    
    console.log('🔍 Loading activity data - Full config:', customConfig);
    console.log('🔍 Loading activity data - Activity type:', activityType);
    console.log('🔍 Loading activity data - Custom config fields:', {
      customDisplayMethod: customConfig.customDisplayMethod,
      customJumpType: customConfig.customJumpType,
      customTargetUrl: customConfig.customTargetUrl,
      customOpenInNewWindow: customConfig.customOpenInNewWindow,
      customJumpConfig: customConfig.customJumpConfig
    });
    
    // Load custom display method (only if exists, otherwise keep default)
    if (customConfig.customDisplayMethod) {
      formData.customDisplayMethod = customConfig.customDisplayMethod;
    }
    
    // Load custom jump type - ALWAYS load if it exists, even if displayMethod is builtin_page
    // This ensures that if user previously selected jump_link, the value is preserved
    if (customConfig.customJumpType !== undefined && customConfig.customJumpType !== null) {
      formData.customJumpType = customConfig.customJumpType;
    }
    // If customJumpType doesn't exist but customJumpConfig exists, try to infer from jumpMode
    else if (customConfig.customJumpConfig?.jumpMode) {
      const jumpMode = customConfig.customJumpConfig.jumpMode;
      if (jumpMode === 'URL') {
        formData.customJumpType = 'external_link';
      } else if (jumpMode === 'ACTIVITY') {
        formData.customJumpType = 'activity';
      } else if (jumpMode === 'TASK') {
        formData.customJumpType = 'task';
      }
    }
    
    // Load custom target URL - ALWAYS load if it exists, even if displayMethod is builtin_page
    // This ensures that if user previously entered a URL, it's preserved
    if (customConfig.customTargetUrl !== undefined && customConfig.customTargetUrl !== null) {
      formData.customTargetUrl = customConfig.customTargetUrl;
    } else if (customConfig.customJumpConfig?.targetUrl) {
      // Fallback to customJumpConfig.targetUrl
      formData.customTargetUrl = customConfig.customJumpConfig.targetUrl;
    } else {
      formData.customTargetUrl = '';
    }
    
    // Handle customOpenInNewWindow - support both boolean and string values
    // Also check customJumpConfig.openInNewWindow as fallback
    // ALWAYS load if it exists, even if displayMethod is builtin_page
    const openInNewWindowValue = customConfig.customOpenInNewWindow ?? 
                                  customConfig.customJumpConfig?.openInNewWindow ?? 
                                  undefined;
    
    // Convert to string format that the form expects ('true' or 'false')
    if (openInNewWindowValue !== undefined) {
      if (typeof openInNewWindowValue === 'boolean') {
        formData.customOpenInNewWindow = openInNewWindowValue ? 'true' : 'false';
      } else if (typeof openInNewWindowValue === 'string') {
        // Handle string values 'true', 'false', '1', '0', etc.
        formData.customOpenInNewWindow = (openInNewWindowValue === 'true' || openInNewWindowValue === '1') ? 'true' : 'false';
      } else {
        formData.customOpenInNewWindow = 'true'; // Default if type is unexpected
      }
    }
    // If openInNewWindowValue is undefined, keep the form's default value
    
    // Debug log for custom config loading
    console.log('🔍 Loaded custom activity config into form:', {
      customDisplayMethod: formData.customDisplayMethod,
      customJumpType: formData.customJumpType,
      customTargetUrl: formData.customTargetUrl,
      customOpenInNewWindow: formData.customOpenInNewWindow,
      rawOpenInNewWindowValue: openInNewWindowValue
    });

    // ========================================
    // Load recharge specific configuration
    // ========================================
    if ((newItem as any).type === 'recharge') {
      // Load recharge-specific fields from root level first, then config
      formData.condition = (newItem as any).condition ?? (newItem as any).config?.condition ?? 'first_deposit';
      formData.distributionMethod = (newItem as any).distributionMethod ?? (newItem as any).config?.distributionMethod ?? 'player_claim_expires';
      formData.claimTime = (newItem as any).claimTime ?? (newItem as any).config?.claimTime ?? 'real_time';
      formData.claimCount = (newItem as any).claimCount ?? (newItem as any).config?.claimCount ?? 'claim_individually';
      formData.rechargeAmounts = (newItem as any).rechargeAmounts ?? (newItem as any).config?.rechargeAmounts ?? formData.rechargeAmounts;
      formData.rechargeMethods = (newItem as any).rechargeMethods ?? (newItem as any).config?.rechargeMethods ?? formData.rechargeMethods;
      formData.bonusMethod = (newItem as any).bonusMethod ?? (newItem as any).config?.bonusMethod ?? 'fixed';
      formData.participationMethod = (newItem as any).participationMethod ?? (newItem as any).config?.participationMethod ?? 'auto';
      formData.beforeLoginPopup = (newItem as any).beforeLoginPopup ?? (newItem as any).config?.beforeLoginPopup ?? 'none';
      formData.afterLoginPopup = (newItem as any).afterLoginPopup ?? (newItem as any).config?.afterLoginPopup ?? 'none';
      formData.directPopupAfterRecharge = (newItem as any).directPopupAfterRecharge ?? (newItem as any).config?.directPopupAfterRecharge ?? false;
      formData.rewardExpirationDays = (newItem as any).rewardExpirationDays ?? (newItem as any).config?.rewardExpirationDays ?? 1;
      
      // Transform rechargeAmounts if needed (handle both formats)
      if (formData.rechargeAmounts && Array.isArray(formData.rechargeAmounts)) {
        formData.rechargeAmounts = formData.rechargeAmounts.map((item: any) => ({
          betAmount: item.betAmount?.toString() || item.rechargeAmount?.toString() || '',
          rewardAmount: item.rewardAmount || 0.00
        }));
      }
      
      // Load cycleMethod if condition is accumulate_recharge
      if (formData.condition === 'accumulate_recharge') {
        formData.cycleMethod = (newItem as any).config?.cycleMethod || (newItem as any).cycleMethod || 'daily_cumulative';
      }
      
      console.log('🔍 Loaded recharge fields:', {
        condition: formData.condition,
        cycleMethod: formData.cycleMethod,
        distributionMethod: formData.distributionMethod,
        claimTime: formData.claimTime,
        claimCount: formData.claimCount, // Claim count setting
        rechargeAmounts: formData.rechargeAmounts,
        rechargeMethods: formData.rechargeMethods,
        bonusMethod: formData.bonusMethod,
        participationMethod: formData.participationMethod,
        beforeLoginPopup: formData.beforeLoginPopup,
        afterLoginPopup: formData.afterLoginPopup,
        directPopupAfterRecharge: formData.directPopupAfterRecharge,
        rewardExpirationDays: formData.rewardExpirationDays
      });
    }

    // Load wagering specific configuration
    formData.loopMethod = (newItem as any).config?.loopMethod || 'daily_cumulative';
    formData.isTimeLimited = (newItem as any).config?.isTimeLimited ?? false;
    // Only set distributionMethod and claimTime if not already set by recharge section
    if ((newItem as any).type !== 'recharge') {
      formData.distributionMethod = (newItem as any).config?.distributionMethod || 'player_claim_expires';
      formData.claimTime = (newItem as any).config?.claimTime || 'next_day';
    }
    formData.selectTime = (newItem as any).config?.selectTime || 0;
    formData.wageringPlatform = Array.isArray((newItem as any).config?.wageringPlatform) 
      ? (newItem as any).config.wageringPlatform[0] || 'all_platforms'
      : (newItem as any).config?.wageringPlatform || formData.wageringPlatform;
    formData.claimCount = (newItem as any).config?.claimCount || 'continuous_claim';
    formData.wageringRewardExpiryDays = (newItem as any).config?.wageringRewardExpiryDays || 1;
    formData.wageringRewardSettings = (newItem as any).config?.wageringRewardSettings?.map((setting: any) => ({
      effectiveWageringAmount: setting.effectiveWageringAmount?.toString() || '',
      rewardAmount: setting.rewardAmount?.toString() || ''
    })) || formData.wageringRewardSettings;

    // Load red packet specific configuration
    formData.redPacketType = (newItem as any).config?.redPacketType || 'fixed';
    formData.redPacketClaimCondition = (newItem as any).config?.redPacketClaimCondition || 'none';
    formData.redPacketRewardType = (newItem as any).config?.redPacketRewardType || 'fixed';
    formData.securityVerification = (newItem as any).config?.securityVerification || false;
    formData.redPacketTotalAmount = (newItem as any).config?.redPacketTotalAmount || 1000;
    formData.redPacketCountPerPeriod = (newItem as any).config?.redPacketCountPerPeriod || 10000;
    formData.actualRedPacketMin = (newItem as any).config?.actualRedPacketMin || 0.02;
    formData.actualRedPacketMax = (newItem as any).config?.actualRedPacketMax || 0.50;
    formData.displayedRedPacketMin = (newItem as any).config?.displayedRedPacketMin || 0.01;
    formData.displayedRedPacketMax = (newItem as any).config?.displayedRedPacketMax || 378.00;
    formData.grabLimitPerPeriod = (newItem as any).config?.grabLimitPerPeriod || 1;
    formData.dailyGrabLimitType = (newItem as any).config?.dailyGrabLimitType || 'fixed';
    formData.dailyGrabLimit = (newItem as any).config?.dailyGrabLimit || 3;
    formData.totalGrabLimit = (newItem as any).config?.totalGrabLimit || 1;
    formData.expectedBonus = (newItem as any).config?.expectedBonus || 1.00;
    formData.redPacketTotalCountLimit = (newItem as any).config?.redPacketTotalCountLimit || 1;
    formData.redPacketDisplayStyle = (newItem as any).config?.redPacketDisplayStyle || 'modal';
    formData.redPacketDailyDistributionTimes = (newItem as any).config?.redPacketDailyDistributionTimes?.map((time: any) => ({
      startTime: time.startTime || null,
      endTime: time.endTime || null
    })) || formData.redPacketDailyDistributionTimes;

    // Load check-in specific configuration
    formData.checkinWageringPlatform = Array.isArray((newItem as any).config?.checkinWageringPlatform) 
      ? (newItem as any).config.checkinWageringPlatform[0] || 'all_platforms'
      : (newItem as any).config?.checkinWageringPlatform || formData.checkinWageringPlatform;
    formData.checkinRechargeMethods = (newItem as any).config?.checkinRechargeMethods || formData.checkinRechargeMethods;
    formData.signinMethod = (newItem as any).config?.signinMethod || formData.signinMethod;
    formData.signinPeriod = (newItem as any).config?.signinPeriod?.toString() || formData.signinPeriod;
    formData.monthlyReset = (newItem as any).config?.monthlyReset ?? formData.monthlyReset;
    formData.checkinPopupAfterRecharge = (newItem as any).config?.checkinPopupAfterRecharge ?? formData.checkinPopupAfterRecharge;
    formData.enableMakeupSignin = (newItem as any).config?.enableMakeupSignin ?? formData.enableMakeupSignin;
    formData.checkinBeforeLoginPopup = (newItem as any).config?.checkinBeforeLoginPopup || formData.checkinBeforeLoginPopup;
    formData.checkinAfterLoginPopup = (newItem as any).config?.checkinAfterLoginPopup || formData.checkinAfterLoginPopup;
    formData.displayStyle = (newItem as any).config?.displayStyle || formData.displayStyle;
    formData.checkinRewardMethod = (newItem as any).config?.checkinRewardMethod || formData.checkinRewardMethod;
    // Handle checkinRewardSettings with proper type checking
    const checkinSettings = (newItem as any).config?.checkinRewardSettings;
    if (Array.isArray(checkinSettings)) {
      formData.checkinRewardSettings = checkinSettings.map((setting: any, index: number) => ({
        type: setting.rewardType || 'fixed',
        rewardAmount: setting.rewardValue || 0,
        rechargeRequirement: setting.rechargeRequirement || 0,
        wageringRequirement: setting.wageringRequirement || 0,
        additionalReward: setting.extraReward || 0,
        checkinIcon: setting.iconUrl || null
      }));
    }

    // ========================================
    // Load rescue specific configuration
    // ========================================
    console.log('🔍 Loading rescue config from:', (newItem as any).config);
    formData.rescueWageringPlatform = Array.isArray((newItem as any).config?.rescueWageringPlatform) 
      ? (newItem as any).config.rescueWageringPlatform[0] || 'all_platforms'
      : (newItem as any).config?.rescueWageringPlatform || formData.rescueWageringPlatform;
    
    // Load rescue platform config
    (formData as any).rescueWageringPlatformConfig = (newItem as any).config?.rescueWageringPlatformConfig || {
      selectedPlatforms: [],
      platformIds: []
    };
    
    formData.deductDiscounts = (newItem as any).config?.deductDiscounts ?? formData.deductDiscounts;
    formData.lossRange = mapLossRangeFromObject((newItem as any).config?.lossRange) || formData.lossRange;
    formData.dailyRewardLimit = (newItem as any).config?.dailyRewardLimit?.toString() || formData.dailyRewardLimit;
    formData.rescueDistributionMethod = mapBackendToFrontendRescueDistributionMethod((newItem as any).config?.rescueDistributionMethod) || formData.rescueDistributionMethod;
    formData.rescueClaimTime = mapRescueClaimTimeFromNumber((newItem as any).config?.rescueClaimTime) || formData.rescueClaimTime;
    formData.rescueSelectTime = (newItem as any).config?.rescueSelectTime || formData.rescueSelectTime;
    formData.rescueRewardExpiryDays = (newItem as any).config?.rescueRewardExpiryDays || formData.rescueRewardExpiryDays;
    formData.rewardType = mapBackendToFrontendRewardType((newItem as any).config?.rewardType) || formData.rewardType;
    
    // Load rescue reward settings
    const rescueSettings = (newItem as any).config?.rescueRewardSettings;
    if (Array.isArray(rescueSettings)) {
      formData.rescueRewardSettings = rescueSettings.map((setting: any) => ({
        lossAmount: setting.lossMin?.toString() || setting.lossAmount?.toString() || '',
        returnRatio: setting.rescueRate || setting.returnRatio || 0
      }));
    }

    // ========================================
    // Load newbie bonus specific configuration
    // ========================================
    console.log('🔍 Loading newbie bonus config from:', (newItem as any).config);
    formData.newbiePromotionType = mapNewbiePromotionTypeFromBackend((newItem as any).config?.newbiePromotionType) || formData.newbiePromotionType;
    formData.newbieRedemptionCode = (newItem as any).config?.newbieRedemptionCode || formData.newbieRedemptionCode;
    formData.newbieTotalUsageCount = (newItem as any).config?.newbieTotalUsageCount?.toString() || formData.newbieTotalUsageCount;
    formData.newbieStartTime = parseDate((newItem as any).config?.newbieStartTime) || formData.newbieStartTime;
    formData.newbieEndTime = parseDate((newItem as any).config?.newbieEndTime) || formData.newbieEndTime;
    formData.newbieRedemptionMethod = mapNewbieRedemptionMethodFromBackend((newItem as any).config?.newbieRedemptionMethod) || formData.newbieRedemptionMethod;
    formData.newbiePopupAfterTopup = (newItem as any).config?.newbiePopupAfterTopup ?? formData.newbiePopupAfterTopup;
    formData.newbieGiftMethod = mapNewbieGiftMethodFromBackend((newItem as any).config?.newbieGiftMethod) || formData.newbieGiftMethod;
    formData.newbieDisplayBonus = (newItem as any).config?.newbieDisplayBonus ?? formData.newbieDisplayBonus;
    formData.newbieWithdrawalThreshold = (newItem as any).config?.newbieWithdrawalThreshold?.toString() || formData.newbieWithdrawalThreshold;
    formData.newbieActualGiftMin = (newItem as any).config?.newbieActualGiftMin?.toString() || formData.newbieActualGiftMin;
    formData.newbieActualGiftMax = (newItem as any).config?.newbieActualGiftMax?.toString() || formData.newbieActualGiftMax;
    formData.newbieDisplayGiftMin = (newItem as any).config?.newbieDisplayGiftMin?.toString() || formData.newbieDisplayGiftMin;
    formData.newbieDisplayGiftMax = (newItem as any).config?.newbieDisplayGiftMax?.toString() || formData.newbieDisplayGiftMax;
    formData.newbieExpectedBonus = (newItem as any).config?.newbieExpectedBonus?.toString() || formData.newbieExpectedBonus;

    // Load newbie redemption settings
    const newbieRedemptionSettings = (newItem as any).config?.newbieRedemptionSettings;
    if (Array.isArray(newbieRedemptionSettings) && newbieRedemptionSettings.length > 0) {
      formData.newbieRedemptionSettings = newbieRedemptionSettings.map((setting: any) => ({
        redemptionCode: setting.redemptionCode || '',
        totalUsageCount: setting.totalUsageCount?.toString() || '',
        startTime: parseDate(setting.startTime) || null,
        endTime: parseDate(setting.endTime) || null
      }));
    }

    // Load newbie reward settings
    const newbieRewardSettings = (newItem as any).config?.newbieRewardSettings;
    if (Array.isArray(newbieRewardSettings) && newbieRewardSettings.length > 0) {
      formData.newbieRewardSettings = newbieRewardSettings.map((setting: any) => ({
        firstDepositAmount: (setting.firstDepositMin || setting.firstDepositAmount)?.toString() || '',
        rewardAmount: (setting.rewardValue || setting.rewardAmount)?.toString() || ''
      }));
    }
  }
}, { immediate: true });

const addWageringRewardSetting = () => {
  formData.wageringRewardSettings.push({ 
    effectiveWageringAmount: '', 
    rewardAmount: '' 
  });
};
const removeWageringRewardSetting = (index: number) => {
  formData.wageringRewardSettings.splice(index, 1);
};

const addRedPacketDailyDistributionTime = () => {
  formData.redPacketDailyDistributionTimes.push({ 
    startTime: null, 
    endTime: null 
  });
};
const removeRedPacketDailyDistributionTime = (index: number) => {
  formData.redPacketDailyDistributionTimes.splice(index, 1);
};
</script>

<style scoped>
.activity-form-modal {
  @apply bg-white;
}

/* SIMPLE FUCKING SOLUTION - MAKE THE WRAPPER SCROLLABLE */
.modal-content-wrapper {
  max-height: 75vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;
}

/* Custom scrollbar */
.modal-content-wrapper::-webkit-scrollbar {
  width: 8px;
}

.modal-content-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.modal-content-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.modal-content-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Basic styling */
.activity-form-modal :deep(.n-tabs-tab) {
  @apply text-sm font-medium;
}

.activity-form-modal :deep(.n-tabs-tab--active) {
  @apply text-blue-600;
}

.activity-form-modal :deep(.n-tabs-bar) {
  @apply bg-blue-600;
}

.activity-form-modal :deep(.n-input),
.activity-form-modal :deep(.n-select),
.activity-form-modal :deep(.n-date-picker) {
  @apply w-full;
}

.activity-form-modal :deep(.n-checkbox) {
  @apply text-sm;
}

.activity-form-modal :deep(.n-radio) {
  @apply text-sm;
}

.activity-form-modal :deep(.n-switch) {
  @apply text-sm;
}
</style> 