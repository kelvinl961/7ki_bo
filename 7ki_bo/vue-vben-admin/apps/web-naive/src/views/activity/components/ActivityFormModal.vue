<template>
  <!-- Full Screen Modal -->
  <n-modal
    v-model:show="modalShow"
    preset="card"
    :title="isEditing ? $t('activity.formModal.k7f162') : $t('activity.formModal.k65b05')"
    style="width: 90vw; height: 90vh; max-width: 1400px; margin: 0 auto"
    :mask-closable="false"
    class="activity-form-modal"
    @after-leave="handleModalClose"
  >
    <div class="modal-content-wrapper">
      <!-- Activity Type Selection -->
      <div class="mb-4 flex-shrink-0">
        <div class="mb-3">
          <span class="mb-2 block text-sm font-medium text-gray-700"
            >{{ $t('activity.formModal.k6d3b') }}</span
          >
          <div class="flex flex-wrap gap-2">
            <n-button
              v-for="type in activityTypes"
              :key="type.value"
              :type="
                formData.activityType === type.value ? 'primary' : 'default'
              "
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
        <n-tabs v-model:value="activeTab" type="line" animated>
          <!-- Tab 1: Basic Settings -->
          <n-tab-pane name="basic" :tab="$t('activity.formModal.k57fa')">
            <div class="flex gap-6">
              <!-- Left Column -->
              <div class="flex-1 pr-4">
                <div class="space-y-4">
                  <!-- Activity Classification -->
                  <div>
                    <label class="mb-2 block text-sm font-medium text-gray-700"
                      >{{ $t('activity.labels.lyhz308') }}</label
                      >
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
                    <label class="mb-2 block text-sm font-medium text-gray-700"
                      >{{ $t('activity.labels.l12yg2ea') }}</label
                      >
                    <n-checkbox-group
                      v-model:value="formData.currencies"
                      @update:value="handleCurrencyChange"
                    >
                      <div class="grid grid-cols-2 gap-2">
                        <n-checkbox value="all">{{ $t('activity.formModal.k51683') }}</n-checkbox>
                        <n-checkbox value="BRL">BRL</n-checkbox>
                      </div>
                    </n-checkbox-group>
                  </div>

                  <!-- Activity Name -->
                  <div>
                    <div class="mb-2 flex items-center justify-between">
                      <label class="block text-sm font-medium text-gray-700"
                        >{{ $t('activity.labels.lyhzex2') }}</label
                      >
                      <n-button size="small" text @click="openTranslationModal">{{ $t('activity.formModal.k66f4') }}</n-button>
                    </div>
                    <div class="mb-2 flex gap-3">
                      <n-radio-group v-model:value="formData.nameType">
                        <n-space>
                          <n-radio value="custom">{{ $t('activity.detailModal.k81ea') }}</n-radio>
                          <n-radio value="system">{{ $t('activity.formModal.k7cfb') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>
                    <n-input
                      v-model:value="formData.title"
                      :placeholder="$t('activity.formModal.k8bf7')"
                    />
                  </div>

                  <!-- Activity Time -->
                  <div>
                    <label class="mb-2 block text-sm font-medium text-gray-700"
                      >{{ $t('activity.labels.lyi2m4h') }}</label
                      >
                    <div class="flex gap-3">
                      <n-date-picker
                        :time-zone="timezone"
                        v-model:value="formData.startTime"
                        type="datetime"
                        :placeholder="$t('activity.detailModal.k6d3b5')"
                        class="flex-1"
                        :is-date-disabled="(ts: number) => ts < Date.now()"
                        clearable
                      />
                      <span class="self-center text-gray-400">-</span>
                      <n-date-picker
                        :time-zone="timezone"
                        v-model:value="formData.endTime"
                        type="datetime"
                        :placeholder="$t('activity.detailModal.k6d3b6')"
                        class="flex-1"
                        :is-date-disabled="
                          (ts: number) =>
                            formData.startTime
                              ? ts < formData.startTime
                              : ts < Date.now()
                        "
                        clearable
                      />
                    </div>
                    <n-checkbox
                      v-model:checked="formData.syncDisplayTime"
                      class="mt-2"
                    >{{ $t('activity.formModal.k5c55') }}</n-checkbox>
                  </div>

                  <!-- Display Time (if not synced) -->
                  <div v-if="!formData.syncDisplayTime">
                    <label class="mb-2 block text-sm font-medium text-gray-700"
                      >{{ $t('activity.labels.lwizqk9') }}</label
                      >
                    <div class="flex gap-3">
                      <n-date-picker
                        :time-zone="timezone"
                        v-model:value="formData.displayStartTime"
                        type="datetime"
                        :placeholder="$t('activity.formModal.k5ba2')"
                        class="flex-1"
                        :is-date-disabled="(ts: number) => ts < Date.now()"
                        clearable
                      />
                      <span class="self-center text-gray-400">-</span>
                      <n-date-picker
                        :time-zone="timezone"
                        v-model:value="formData.displayEndTime"
                        type="datetime"
                        :placeholder="$t('activity.formModal.k5ba22')"
                        class="flex-1"
                        :is-date-disabled="
                          (ts: number) =>
                            formData.displayStartTime
                              ? ts < formData.displayStartTime
                              : ts < Date.now()
                        "
                        clearable
                      />
                    </div>
                  </div>

                  <!-- Wagering Specific Fields (only for 打码 type) -->
                  <template v-if="formData.activityType === 'wagering'">
                    <!-- Loop Method -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >
                        {{ $t('activity.labels.lwxatv5') }}
                        <n-icon size="16" class="ml-1 text-blue-500">
                          <HelpCircle />
                        </n-icon>
                      </label>
                      <n-radio-group v-model:value="formData.loopMethod">
                        <n-space>
                          <n-radio value="daily_cumulative">{{ $t('activity.formModal.k65e5') }}</n-radio>
                          <n-radio value="weekly_cumulative"
                            >{{ $t('activity.formModal.k5468') }}</n-radio
                          >
                          <n-radio value="monthly_cumulative"
                            >{{ $t('activity.formModal.k6708') }}</n-radio
                          >
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Time Limited -->
                    <div class="flex items-center justify-between">
                      <label class="block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k662f') }}</label
                      >
                      <n-switch v-model:value="formData.isTimeLimited" />
                    </div>

                    <!-- Distribution Method -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k6d3e') }}</label
                      >
                      <n-radio-group
                        v-model:value="formData.distributionMethod"
                      >
                        <n-space vertical>
                          <n-radio value="auto_claim">{{ $t('activity.formModal.k7cfb2') }}</n-radio>
                          <n-radio value="player_claim_expires"
                            >{{ $t('activity.formModal.k73a9k8fc7') }}</n-radio
                          >
                          <n-radio value="player_claim_auto_after_expire"
                            >{{ $t('activity.formModal.k73a9k8fc72') }}</n-radio
                          >
                          <n-radio value="player_apply_manual_approve"
                            >{{ $t('activity.formModal.k73a9k4eba') }}</n-radio
                          >
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Claim Time -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.rewardReport.k98862') }}</label
                      >
                      <n-radio-group v-model:value="formData.claimTime">
                        <n-space vertical>
                          <n-radio value="next_day">{{ $t('activity.formModal.k6b21') }}</n-radio>
                          <n-radio value="real_time"
                            >{{ $t('activity.formModal.k5b9ek5f71') }}</n-radio
                          >
                          <n-radio value="daily">{{ $t('activity.formModal.k6bcf') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Select Time -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k90096') }}</label
                      >
                      <div class="flex items-center gap-2">
                        <n-input-number
                          v-model:value="formData.selectTime"
                          placeholder="00:00:00"
                          class="w-32"
                          :min="0"
                          :max="23"
                        />
                        <span class="text-sm text-gray-500">{{ $t('activity.formModal.k4ee5') }}</span>
                      </div>
                    </div>

                    <!-- Reward Claim Expiry Days -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >{{ $t('activity.formModal.k59562') }}<n-icon size="16" class="ml-1 text-blue-500">
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
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k67092') }}</label
                      >

                      <n-radio-group v-model:value="formData.wageringPlatform">
                        <n-space>
                          <n-radio value="all_platforms">{{ $t('activity.formModal.k5168') }}</n-radio>
                          <n-radio value="specific_platforms">{{ $t('activity.formModal.k6307') }}</n-radio>
                          <n-radio value="exclude_platforms"
                            >{{ $t('activity.formModal.k6392') }}</n-radio
                          >
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Platform and Game Selection (when specific_platforms is selected) -->
                    <div
                      v-if="formData.wageringPlatform === 'specific_platforms'"
                    >
                      <PlatformGameSelector
                        v-model="
                          (formData as any).wageringPlatformConfig
                            .selectedPlatforms
                        "
                        :wagering-platform="formData.wageringPlatform"
                        @validation-change="handlePlatformValidation"
                      />
                    </div>

                    <!-- Claim Count -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k9886') }}</label
                      >
                      <n-radio-group v-model:value="formData.claimCount">
                        <n-space vertical>
                          <n-radio value="continuous_claim">{{ $t('activity.formModal.k53ef') }}</n-radio>
                          <n-radio value="single_claim_only"
                            >{{ $t('activity.formModal.k9886k53ea') }}</n-radio
                          >
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Reward Settings Table -->
                    <div>
                      <label
                        class="mb-3 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k59563') }}</label
                      >
                      <div class="overflow-hidden rounded-lg border">
                        <table class="w-full">
                          <thead class="bg-gray-50">
                            <tr>
                              <th
                                class="border-b px-4 py-2 text-left text-sm font-medium text-gray-700"
                              >{{ $t('activity.formModal.k67093') }}</th>
                              <th
                                class="border-b px-4 py-2 text-left text-sm font-medium text-gray-700"
                              >{{ $t('activity.formModal.k5956') }}</th>
                              <th
                                class="w-16 border-b px-4 py-2 text-left text-sm font-medium text-gray-700"
                              >{{ $t('activity.rewardReport.k64cd') }}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="(
                                item, index
                              ) in formData.wageringRewardSettings"
                              :key="index"
                              class="border-b"
                            >
                              <td class="px-4 py-2">
                                <n-input
                                  v-model:value="item.effectiveWageringAmount"
                                  :placeholder="$t('activity.formModal.k8bf72')"
                                  class="w-full"
                                />
                              </td>
                              <td class="px-4 py-2">
                                <n-input
                                  v-model:value="item.rewardAmount"
                                  :placeholder="$t('activity.formModal.k8bf73')"
                                  class="w-full"
                                />
                              </td>
                              <td class="px-4 py-2 text-center">
                                <n-button
                                  v-if="
                                    formData.wageringRewardSettings.length > 1
                                  "
                                  size="small"
                                  type="error"
                                  @click="removeWageringRewardSetting(index)"
                                  class="h-8 w-8 p-0"
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
                        <n-button
                          type="primary"
                          @click="addWageringRewardSetting"
                          size="small"
                        >
                          <n-icon size="16" class="mr-1">
                            <Add />
                          </n-icon>{{ $t('activity.formModal.k6dfb') }}</n-button>
                      </div>
                    </div>

                    <!-- Reward Claim Expiry Days -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >
                        {{ $t('activity.labels.lihat34') }}
                        <n-icon size="16" class="ml-1 text-blue-500">
                          <HelpCircle />
                        </n-icon>
                      </label>
                      <n-input-number
                        v-model:value="formData.wageringRewardExpiryDays"
                        :placeholder="$t('activity.formModal.k8bf74')"
                        class="w-full"
                        :min="1"
                      />
                    </div>
                  </template>

                  <!-- Rescue Fund Specific Fields (only for 救援金 type) -->
                  <template v-if="formData.activityType === 'rescue' || formData.activityType === 'newbie_rescue'">
                    <!-- Newbie days limit (新手救援金 only) -->
                    <div v-if="formData.activityType === 'newbie_rescue'">
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >新手注册天数限制
                        <n-icon size="16" class="ml-1 text-blue-500">
                          <HelpCircle />
                        </n-icon>
                      </label>
                      <n-input-number
                        v-model:value="formData.newbieDaysLimit"
                        placeholder="7"
                        class="w-full"
                        :min="1"
                      />
                      <p class="mt-1 text-xs text-gray-500">
                        仅注册天数 ≤ 该值的用户可参与
                      </p>
                    </div>

                    <!-- Valid Wagering Platform -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >{{ $t('activity.formModal.k67092') }}<n-icon size="16" class="ml-1 text-blue-500">
                          <HelpCircle />
                        </n-icon>
                      </label>

                      <n-radio-group
                        v-model:value="formData.rescueWageringPlatform"
                      >
                        <n-space>
                          <n-radio value="all_platforms">{{ $t('activity.formModal.k5168') }}</n-radio>
                          <n-radio value="specific_platforms">{{ $t('activity.formModal.k6307') }}</n-radio>
                          <n-radio value="exclude_platforms"
                            >{{ $t('activity.formModal.k6392') }}</n-radio
                          >
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Platform and Game Selection for Rescue (when specific_platforms is selected) -->
                    <div
                      v-if="
                        formData.rescueWageringPlatform === 'specific_platforms'
                      "
                    >
                      <PlatformGameSelector
                        v-model="
                          (formData as any).rescueWageringPlatformConfig
                            .selectedPlatforms
                        "
                        :wagering-platform="formData.rescueWageringPlatform"
                        @validation-change="handlePlatformValidation"
                      />
                    </div>

                    <!-- Deduct Discounts -->
                    <div class="flex items-center justify-between">
                      <label class="block text-sm font-medium text-gray-700">{{ $t('activity.formModal.k6263') }}<n-icon size="16" class="ml-1 text-blue-500">
                          <HelpCircle />
                        </n-icon>
                      </label>
                      <n-switch v-model:value="formData.deductDiscounts" />
                    </div>

                    <!-- Loss Range -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k4e8f2') }}</label
                      >
                      <n-radio-group v-model:value="formData.lossRange">
                        <n-space>
                          <n-radio value="yesterday">{{ $t('activity.formModal.k6628') }}</n-radio>
                          <n-radio value="last_week">{{ $t('activity.formModal.k4e0a') }}</n-radio>
                          <n-radio value="last_month">{{ $t('activity.formModal.k4e0a2') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Daily Reward Limit -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.labels.ls373il') }}</label
                      >
                      <n-input
                        v-model:value="formData.dailyRewardLimit"
                        :placeholder="$t('activity.formModal.k8bf75')"
                        class="w-full"
                      />
                    </div>

                    <!-- Distribution Method -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k6d3e') }}</label
                      >
                      <n-radio-group
                        v-model:value="formData.rescueDistributionMethod"
                      >
                        <n-space vertical>
                          <n-radio value="self_claim_expire"
                            >{{ $t('activity.formModal.k73a9k8fc7') }}</n-radio
                          >
                          <n-radio value="self_claim_auto"
                            >{{ $t('activity.formModal.k73a9k8fc72') }}</n-radio
                          >
                          <n-radio value="manual_distribution"
                            >{{ $t('activity.formModal.k73a9k4eba') }}</n-radio
                          >
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Claim Time -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.rewardReport.k98862') }}</label
                      >
                      <n-radio-group v-model:value="formData.rescueClaimTime">
                        <n-space>
                          <n-radio value="next_day">{{ $t('activity.formModal.k6b21') }}</n-radio>
                          <n-radio value="daily">{{ $t('activity.formModal.k6bcf') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Select Time -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.labels.l12yhkok') }}</label
                      >
                      <div class="flex items-center gap-2">
                        <n-time-picker
                          v-model:value="formData.rescueSelectTime"
                          placeholder="00:00:00"
                          class="w-32"
                        />
                        <span class="text-sm text-gray-600">{{ $t('activity.formModal.k4ee5') }}</span>
                      </div>
                    </div>

                    <!-- Reward Claim Expiry Days -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >
                        {{ $t('activity.labels.lihat34') }}
                        <n-icon size="16" class="ml-1 text-blue-500">
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
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.rewardReport.k5956') }}</label
                      >
                      <n-select
                        v-model:value="formData.rewardType"
                        :placeholder="$t('activity.formModal.k6bd4')"
                        :options="rewardTypeOptions"
                        class="w-full"
                      />
                    </div>

                    <!-- Reward Settings -->
                    <div>
                      <label
                        class="mb-3 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k59563') }}</label
                      >
                      <div class="space-y-3">
                        <div
                          v-for="(item, index) in formData.rescueRewardSettings"
                          :key="index"
                          class="flex items-end gap-3"
                        >
                          <!-- Loss Amount -->
                          <div class="flex-1">
                            <label class="mb-1 block text-xs text-gray-600"
                              >{{ $t('activity.formModal.k4e8f') }}</label
                            >
                            <n-input
                              v-model:value="item.lossAmount"
                              :placeholder="$t('activity.formModal.k4e8f')"
                              class="w-full"
                            />
                          </div>

                          <!-- Return Reward Ratio -->
                          <div class="flex-1">
                            <label class="mb-1 block text-xs text-gray-600"
                              >{{ $t('activity.formModal.k8fd4') }}</label
                            >
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
                          </n-icon>{{ $t('activity.formModal.k6dfb') }}</n-button>
                      </div>
                    </div>
                  </template>

                  <!-- Withdrawal Activity Fields (提现活动) -->
                  <template v-if="formData.activityType === 'withdrawal'">
                    <div>
                      <label class="mb-2 block text-sm font-medium text-gray-700"
                        >统计周期</label
                      >
                      <n-radio-group v-model:value="formData.rewardCycle">
                        <n-space>
                          <n-radio value="daily">按日</n-radio>
                          <n-radio value="weekly">按周</n-radio>
                          <n-radio value="monthly">按月</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <div>
                      <label class="mb-2 block text-sm font-medium text-gray-700"
                        >赠金发放</label
                      >
                      <n-radio-group v-model:value="formData.giftMode">
                        <n-space>
                          <n-radio value="pending_claim">待领取</n-radio>
                          <n-radio value="add_to_withdraw">直接到账</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <div>
                      <label class="mb-2 block text-sm font-medium text-gray-700"
                        >领取档位</label
                      >
                      <n-radio-group v-model:value="formData.claimMode">
                        <n-space>
                          <n-radio value="claim_individually">可逐条领取</n-radio>
                          <n-radio value="claim_highest_only">仅领取最高档</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <div>
                      <label class="mb-2 block text-sm font-medium text-gray-700"
                        >累计方式</label
                      >
                      <n-radio-group v-model:value="formData.accumulateMode">
                        <n-space>
                          <n-radio value="per_slip">单笔提现</n-radio>
                          <n-radio value="cumulative">周期累计</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <div>
                      <label class="mb-2 block text-sm font-medium text-gray-700"
                        >赠送方式</label
                      >
                      <n-radio-group v-model:value="formData.withdrawalRewardType">
                        <n-space>
                          <n-radio value="fixed">固定金额</n-radio>
                          <n-radio value="percent">百分比</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <div>
                      <label class="mb-2 block text-sm font-medium text-gray-700"
                        >最高赠送金额（可选）</label
                      >
                      <n-input
                        v-model:value="formData.maxRewardAmount"
                        placeholder="0"
                        class="w-full"
                      />
                    </div>

                    <div>
                      <label class="mb-3 block text-sm font-medium text-gray-700"
                        >提现档位设置</label
                      >
                      <div class="space-y-3">
                        <div
                          v-for="(item, index) in formData.withdrawalTiers"
                          :key="index"
                          class="flex items-end gap-3"
                        >
                          <div class="flex-1">
                            <label class="mb-1 block text-xs text-gray-600"
                              >提现金额门槛</label
                            >
                            <n-input
                              v-model:value="item.withdrawMin"
                              placeholder="100"
                              class="w-full"
                            />
                          </div>
                          <div class="flex-1">
                            <label class="mb-1 block text-xs text-gray-600"
                              >赠送
                              {{
                                formData.withdrawalRewardType === 'percent'
                                  ? '(%)'
                                  : '(金额)'
                              }}</label
                            >
                            <n-input
                              v-model:value="item.rewardValue"
                              placeholder="10"
                              class="w-full"
                            />
                          </div>
                          <n-button
                            v-if="formData.withdrawalTiers.length > 1"
                            size="small"
                            type="error"
                            class="mb-1"
                            @click="removeWithdrawalTier(index)"
                          >
                            <n-icon size="16">
                              <Close />
                            </n-icon>
                          </n-button>
                        </div>
                        <n-button
                          size="small"
                          type="primary"
                          class="w-full"
                          @click="addWithdrawalTier"
                        >
                          <n-icon size="16" class="mr-1">
                            <Add />
                          </n-icon>
                          添加档位
                        </n-button>
                      </div>
                    </div>
                  </template>

                  <!-- Sign-in Specific Fields (only for 签到 type) -->
                  <template v-if="formData.activityType === 'checkin'">
                    <!-- Valid Wagering Platform -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k67092') }}</label
                      >
                      <n-radio-group
                        v-model:value="formData.checkinWageringPlatform"
                      >
                        <n-space>
                          <n-radio value="all_platforms">{{ $t('activity.formModal.k5168') }}</n-radio>
                          <n-radio value="specific_platforms">{{ $t('activity.formModal.k6307') }}</n-radio>
                          <n-radio value="exclude_platforms"
                            >{{ $t('activity.formModal.k6392') }}</n-radio
                          >
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Recharge Method -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.labels.luyqxz7') }}</label
                      >
                      <n-checkbox-group
                        v-model:value="formData.checkinRechargeMethods"
                        @update:value="handleCheckinRechargeMethodChange"
                      >
                        <div class="grid grid-cols-2 gap-2">
                          <n-checkbox value="all">{{ $t('activity.formModal.k51683') }}</n-checkbox>
                          <n-checkbox value="pix">PIX</n-checkbox>
                          <n-checkbox value="customer_service"
                            >{{ $t('activity.formModal.k5ba23') }}</n-checkbox
                          >
                          <n-checkbox value="merchant">{{ $t('activity.formModal.k94f6') }}</n-checkbox>
                        </div>
                      </n-checkbox-group>
                    </div>

                    <!-- Sign-in Method -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.labels.l10ar1y6') }}</label
                      >
                      <n-radio-group v-model:value="formData.signinMethod">
                        <n-space>
                          <n-radio value="continuous">{{ $t('activity.formModal.k8fde') }}<n-icon size="16" class="ml-1 text-blue-500">
                              <HelpCircle />
                            </n-icon>
                          </n-radio>
                          <n-radio value="accumulated">{{ $t('activity.formModal.k7d2f') }}<n-icon size="16" class="ml-1 text-blue-500">
                              <HelpCircle />
                            </n-icon>
                          </n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Sign-in Period -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k7b7e') }}</label
                      >
                      <n-radio-group v-model:value="formData.signinPeriod">
                        <n-space>
                          <n-radio value="7">{{ $t('activity.formModal.7') }}</n-radio>
                          <n-radio value="15">{{ $t('activity.formModal.15') }}</n-radio>
                          <n-radio value="30">{{ $t('activity.formModal.30') }}</n-radio>
                          <n-radio value="custom">{{ $t('activity.detailModal.k81ea') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Monthly Reset -->
                    <div class="flex items-center justify-between">
                      <label class="block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k6bcf2') }}</label
                      >
                      <n-switch v-model:value="formData.monthlyReset" />
                    </div>

                    <!-- Pop-up After Recharge -->
                    <div class="flex items-center justify-between">
                      <label class="block text-sm font-medium text-gray-700">{{ $t('activity.formModal.k51452') }}<n-icon size="16" class="ml-1 text-blue-500">
                          <HelpCircle />
                        </n-icon>
                      </label>
                      <n-switch
                        v-model:value="formData.checkinPopupAfterRecharge"
                      />
                    </div>

                    <!-- Enable Make-up Sign-in -->
                    <div class="flex items-center justify-between">
                      <label class="block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k662f2') }}</label
                      >
                      <n-switch v-model:value="formData.enableMakeupSignin" />
                    </div>

                    <!-- Pop-up Method Before Login -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k767b') }}</label
                      >
                      <n-radio-group
                        v-model:value="formData.checkinBeforeLoginPopup"
                      >
                        <n-space>
                          <n-radio value="none">{{ $t('activity.formModal.k4e0d') }}</n-radio>
                          <n-radio value="high_frequency">{{ $t('activity.formModal.k9ad8') }}</n-radio>
                          <n-radio value="daily">{{ $t('activity.formModal.k6bcf3') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Pop-up Method After Login -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k767b2') }}</label
                      >
                      <n-radio-group
                        v-model:value="formData.checkinAfterLoginPopup"
                      >
                        <n-space>
                          <n-radio value="none">{{ $t('activity.formModal.k4e0d') }}</n-radio>
                          <n-radio value="high_frequency">{{ $t('activity.formModal.k9ad8') }}</n-radio>
                          <n-radio value="daily">{{ $t('activity.formModal.k6bcf3') }}</n-radio>
                          <n-radio value="every_login">{{ $t('activity.formModal.k6bcf4') }}</n-radio>
                          <n-radio value="once_only">{{ $t('activity.formModal.k53ea2') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Display Style -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k5c552') }}</label
                      >
                      <n-radio-group v-model:value="formData.displayStyle">
                        <n-space>
                          <n-radio value="calendar">{{ $t('activity.formModal.k6837') }}</n-radio>
                          <n-radio value="list">{{ $t('activity.formModal.k68372') }}</n-radio>
                          <n-radio value="cards">{{ $t('activity.formModal.k68373') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Style Preview -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k68374') }}</label
                      >
                      <div
                        class="flex h-48 w-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50"
                      >
                        <div class="text-center text-xs text-gray-500">
                          <div>
                            {{
                              $t('activity.labels.stylePreview', [
                                formData.displayStyle === 'calendar'
                                  ? '1'
                                  : formData.displayStyle === 'list'
                                    ? '2'
                                    : '3',
                              ])
                            }}
                          </div>
                          <div class="mt-2">{{ $t('activity.formModal.k7b7e2') }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- Reward Method -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k59564') }}</label
                      >
                      <n-radio-group
                        v-model:value="formData.checkinRewardMethod"
                      >
                        <n-space>
                          <n-radio value="daily">{{ $t('activity.formModal.k51682') }}</n-radio>
                          <n-radio value="milestone">{{ $t('activity.formModal.k6309') }}<n-icon size="16" class="ml-1 text-blue-500">
                              <HelpCircle />
                            </n-icon>
                          </n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Reward Configuration Table -->
                    <div>
                      <label
                        class="mb-3 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k59565') }}</label
                      >
                      <div class="overflow-x-auto">
                        <table
                          class="w-full min-w-[800px] rounded-lg border border-gray-200"
                        >
                          <thead class="bg-gray-50">
                            <tr>
                              <th
                                class="w-12 border-b px-3 py-2 text-left text-xs font-medium text-gray-700"
                              >{{ $t('activity.detailModal.k5929') }}</th>
                              <th
                                class="min-w-[120px] border-b px-3 py-2 text-left text-xs font-medium text-gray-700"
                              >{{ $t('activity.formModal.k7c7b') }}</th>
                              <th
                                class="min-w-[100px] border-b px-3 py-2 text-left text-xs font-medium text-gray-700"
                              >{{ $t('activity.formModal.k5956') }}</th>
                              <th
                                class="min-w-[100px] border-b px-3 py-2 text-left text-xs font-medium text-gray-700"
                              >{{ $t('activity.formModal.k51453') }}</th>
                              <th
                                class="min-w-[100px] border-b px-3 py-2 text-left text-xs font-medium text-gray-700"
                              >{{ $t('activity.formModal.k6253') }}</th>
                              <th
                                class="min-w-[100px] border-b px-3 py-2 text-left text-xs font-medium text-gray-700"
                              >{{ $t('activity.formModal.k989d') }}</th>
                              <th
                                class="min-w-[160px] border-b px-3 py-2 text-left text-xs font-medium text-gray-700"
                              >{{ $t('activity.formModal.k7b7e3') }}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="(
                                item, index
                              ) in formData.checkinRewardSettings"
                              :key="index"
                              class="border-b"
                            >
                              <td class="px-3 py-2 text-sm">{{ index + 1 }}</td>
                              <td class="px-3 py-2">
                                <n-select
                                  v-model:value="item.type"
                                  :placeholder="$t('activity.formModal.k56fa')"
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
                                    :placeholder="$t('activity.formModal.k9009')"
                                    size="small"
                                    class="w-32 min-w-[120px]"
                                  />
                                  <div
                                    v-if="item.checkinIcon"
                                    class="flex h-8 w-8 items-center justify-center rounded border border-gray-200 bg-gray-50"
                                  >
                                    <img
                                      :src="item.checkinIcon"
                                      :alt="`Day ${index + 1} icon`"
                                      class="h-6 w-6 object-contain"
                                      @error="
                                        (e) =>
                                          ((
                                            e.target as HTMLImageElement
                                          ).style.display = 'none')
                                      "
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
                          </n-icon>{{ $t('activity.formModal.k6dfb2') }}</n-button>
                      </div>
                    </div>
                  </template>

                  <!-- Lucky Turntable Specific Fields (only for 幸运转盘 type) -->
                  <!-- luckyspin form hidden: use Lucky Wheel module instead -->
                  <template v-if="false && formData.activityType === 'luckyspin'">
                    <!-- Turntable Switch -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.labels.l12ykvit') }}</label
                      >
                      <n-checkbox-group
                        v-model:value="formData.turntableSwitches"
                      >
                        <div class="space-y-2">
                          <n-checkbox value="all">{{ $t('activity.formModal.k51683') }}</n-checkbox>
                          <n-checkbox value="silver">{{ $t('activity.formModal.k767d') }}</n-checkbox>
                          <n-checkbox value="gold">{{ $t('activity.formModal.k9ec4') }}</n-checkbox>
                          <n-checkbox value="diamond">{{ $t('activity.formModal.k94bb') }}</n-checkbox>
                        </div>
                      </n-checkbox-group>
                    </div>

                    <!-- Lucky Value Validity Period -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >{{ $t('activity.formModal.k5e78') }}<n-icon size="16" class="ml-1 text-blue-500">
                          <HelpCircle />
                        </n-icon>
                      </label>
                      <n-radio-group
                        v-model:value="formData.luckyValueValidityPeriod"
                      >
                        <n-space>
                          <n-radio value="daily">{{ $t('activity.formModal.k6bcf') }}</n-radio>
                          <n-radio value="weekly">{{ $t('activity.formModal.k6bcf5') }}</n-radio>
                          <n-radio value="monthly">{{ $t('activity.formModal.k6bcf6') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Reward Type -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.rewardReport.k5956') }}</label
                      >
                      <n-radio-group
                        v-model:value="formData.luckyspinRewardType"
                      >
                        <n-space>
                          <n-radio value="valid_bet">{{ $t('activity.formModal.k6709') }}</n-radio>
                          <n-radio value="task_creation">{{ $t('activity.formModal.k4efb') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Valid Wagering Platform -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >{{ $t('activity.formModal.k67092') }}<n-icon size="16" class="ml-1 text-blue-500">
                          <HelpCircle />
                        </n-icon>
                      </label>
                      <n-radio-group
                        v-model:value="formData.luckyspinWageringPlatform"
                      >
                        <n-space>
                          <n-radio value="all_platforms">{{ $t('activity.formModal.k5168') }}</n-radio>
                          <n-radio value="specific_platforms">{{ $t('activity.formModal.k6307') }}</n-radio>
                          <n-radio value="exclude_platforms"
                            >{{ $t('activity.formModal.k6392') }}</n-radio
                          >
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Obtain Lucky Value -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.labels.lmkxz8u') }}</label
                      >
                      <div class="flex items-center gap-3">
                        <n-input-number
                          v-model:value="formData.luckyValuePerBet"
                          placeholder="1"
                          class="w-24"
                          :min="1"
                        />
                        <span class="text-sm text-gray-600"
                          >{{ $t('activity.formModal.k67091') }}</span
                        >
                      </div>
                    </div>

                    <!-- Winning Announcement -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k83b7') }}</label
                      >
                      <div class="space-y-3">
                        <div class="flex items-center justify-between">
                          <span class="text-sm text-gray-600"
                            >{{ $t('activity.formModal.k5f002') }}</span
                          >
                          <n-switch
                            v-model:value="formData.enableWinningAnnouncement"
                          />
                        </div>

                        <div
                          v-if="formData.enableWinningAnnouncement"
                          class="flex items-center gap-2"
                        >
                          <span class="text-sm text-gray-600">{{ $t('activity.formModal.k6bcf7') }}</span>
                          <n-input-number
                            v-model:value="formData.announcementInterval"
                            placeholder="24"
                            class="w-20"
                            :min="1"
                          />
                          <span class="text-sm text-gray-600"
                            >{{ $t('activity.formModal.k5c0f') }}</span
                          >
                          <n-input-number
                            v-model:value="formData.announcementCount"
                            placeholder="20"
                            class="w-20"
                            :min="1"
                          />
                          <span class="text-sm text-gray-600">{{ $t('activity.formModal.k6761') }}</span>
                        </div>

                        <div
                          class="rounded bg-gray-50 p-2 text-xs text-gray-500"
                        >{{ $t('activity.formModal.k62bdk4f1a') }}</div>
                      </div>
                    </div>
                  </template>

                  <!-- Lucky Bet Slip Specific Fields (only for 幸运注单 type) -->
                  <template v-if="formData.activityType === 'luckywager'">
                    <!-- Valid Wagering Platform -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >{{ $t('activity.formModal.k67092') }}<n-icon size="16" class="ml-1 text-blue-500">
                          <HelpCircle />
                        </n-icon>
                      </label>
                      <n-radio-group
                        v-model:value="formData.luckywagerWageringPlatform"
                      >
                        <n-space>
                          <n-radio value="all_platforms">{{ $t('activity.formModal.k5168') }}</n-radio>
                          <n-radio value="specific_platforms">{{ $t('activity.formModal.k6307') }}</n-radio>
                          <n-radio value="exclude_platforms"
                            >{{ $t('activity.formModal.k6392') }}</n-radio
                          >
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Claim Count Limit -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.labels.l1gch4kb') }}</label
                      >
                      <n-radio-group v-model:value="formData.claimCountLimit">
                        <n-space>
                          <n-radio value="fixed">{{ $t('activity.formModal.k56fa2') }}</n-radio>
                          <n-radio value="daily_recharge">{{ $t('activity.formModal.k5f53') }}</n-radio>
                          <n-radio value="daily_wagering">{{ $t('activity.formModal.k5f532') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Daily Count Limit -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.labels.lueqfa9') }}</label
                      >
                      <n-input
                        v-model:value="formData.dailyCountLimit"
                        :placeholder="$t('activity.formModal.k8bf76')"
                        class="w-full"
                      />
                    </div>

                    <!-- Total Count Limit -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.labels.lrdj69m') }}</label
                      >
                      <n-input
                        v-model:value="formData.totalCountLimit"
                        :placeholder="$t('activity.formModal.k8bf70')"
                        class="w-full"
                      />
                    </div>

                    <!-- Minimum Valid Bet Amount -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.labels.l1vsgv7m') }}</label
                      >
                      <n-input
                        v-model:value="formData.minimumValidBetAmount"
                        :placeholder="$t('activity.formModal.k8bf77')"
                        class="w-full"
                      />
                    </div>

                    <!-- Reward Method -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.labels.lvzqgav') }}</label
                      >
                      <n-radio-group
                        v-model:value="formData.luckywagerRewardMethod"
                      >
                        <n-space>
                          <n-radio value="fixed_amount">{{ $t('activity.formModal.k56fa3') }}</n-radio>
                          <n-radio value="bet_multiple"
                            >{{ $t('activity.formModal.k67094') }}</n-radio
                          >
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Bet Slip Number Rule -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >
                        {{ $t('activity.labels.l2ub955') }}
                        <n-icon size="16" class="ml-1 text-blue-500">
                          <HelpCircle />
                        </n-icon>
                      </label>
                      <n-radio-group v-model:value="formData.betSlipNumberRule">
                        <n-space>
                          <n-radio value="ending_digits">{{ $t('activity.formModal.k5c3e') }}</n-radio>
                          <n-radio value="consecutive_digits">{{ $t('activity.formModal.k8fde2') }}</n-radio>
                          <n-radio value="contains_anywhere"
                            >{{ $t('activity.formModal.k5305k4efb') }}</n-radio
                          >
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Large Amount Review Amount -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >
                        {{ $t('activity.labels.lpda967') }}
                        <n-icon size="16" class="ml-1 text-blue-500">
                          <HelpCircle />
                        </n-icon>
                      </label>
                      <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-600">{{ $t('activity.formModal.k59566') }}</span>
                        <n-input
                          v-model:value="formData.largeAmountReviewAmount"
                          :placeholder="$t('activity.formModal.k8bf702')"
                          class="flex-1"
                        />
                        <span class="text-sm text-gray-600">{{ $t('activity.formModal.k9700') }}</span>
                      </div>
                    </div>

                    <!-- Dynamic Reward Configuration -->
                    <div>
                      <label
                        class="mb-3 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k59567') }}</label
                      >
                      <div class="space-y-3">
                        <div
                          v-for="(
                            item, index
                          ) in formData.luckywagerRewardSettings"
                          :key="index"
                          class="flex items-end gap-3"
                        >
                          <!-- Bet Slip Ending Digits -->
                          <div class="flex-1">
                            <label class="mb-1 block text-xs text-gray-600"
                              >{{ $t('activity.formModal.k6ce8') }}</label
                            >
                            <n-input
                              v-model:value="item.betSlipEnding"
                              :placeholder="$t('activity.formModal.k8bf78')"
                              class="w-full"
                            />
                          </div>

                          <!-- Reward Amount -->
                          <div class="flex-1">
                            <label class="mb-1 block text-xs text-gray-600"
                              >{{ $t('activity.formModal.k5956') }}</label
                            >
                            <n-input
                              v-model:value="item.rewardAmount"
                              :placeholder="$t('activity.formModal.k8bf78')"
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
                          </n-icon>{{ $t('activity.formModal.k6dfb3') }}</n-button>
                      </div>
                    </div>
                  </template>

                  <!-- Red Packet Specific Fields (only for 红包 type) -->
                  <template v-if="formData.activityType === 'redpacket'">
                    <!-- Red Packet Type -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >{{ $t('activity.formModal.k7ea2') }}<n-icon size="16" class="ml-1 text-blue-500">
                          <HelpCircle />
                        </n-icon>
                      </label>
                      <n-radio-group v-model:value="formData.redPacketType">
                        <n-space>
                          <n-radio value="fixed">{{ $t('activity.formModal.k5f003') }}</n-radio>
                          <n-radio value="random">{{ $t('activity.formModal.k62a2') }}</n-radio>
                          <n-radio value="progressive">{{ $t('activity.formModal.k9001') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Daily Distribution Time (only for random type) -->
                    <div v-if="formData.redPacketType === 'random'">
                      <label
                        class="mb-3 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k6bcf8') }}</label
                      >
                      <div class="space-y-3">
                        <div
                          v-for="(
                            item, index
                          ) in formData.redPacketDailyDistributionTimes"
                          :key="index"
                          class="flex items-center gap-3"
                        >
                          <span class="w-8 text-sm text-gray-600">{{
                            index + 1
                          }}</span>
                          <div class="flex flex-1 items-center gap-2">
                            <n-time-picker
                              v-model:value="item.startTime"
                              placeholder="00:00"
                              format="HH:mm"
                              class="w-24"
                            />
                            <span class="text-gray-500">{{ $t('activity.formModal.k81f3') }}</span>
                            <n-time-picker
                              v-model:value="item.endTime"
                              placeholder="23:59"
                              format="HH:mm"
                              class="w-24"
                            />
                          </div>
                          <n-button
                            v-if="
                              formData.redPacketDailyDistributionTimes.length >
                              1
                            "
                            size="small"
                            type="error"
                            @click="removeRedPacketDailyDistributionTime(index)"
                            class="h-8 w-8 p-0"
                          >
                            <n-icon size="16">
                              <Close />
                            </n-icon>
                          </n-button>
                        </div>
                      </div>
                      <div class="mt-3">
                        <n-button
                          type="primary"
                          @click="addRedPacketDailyDistributionTime"
                          size="small"
                        >
                          <n-icon size="16" class="mr-1">
                            <Add />
                          </n-icon>{{ $t('activity.formModal.k6dfb4') }}</n-button>
                      </div>
                    </div>

                    <!-- Claim Conditions -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k98862') }}</label
                      >
                      <n-radio-group
                        v-model:value="formData.redPacketClaimCondition"
                      >
                        <n-space>
                          <n-radio value="none">{{ $t('activity.formModal.k65e0') }}</n-radio>
                          <n-radio value="deposit">{{ $t('activity.formModal.k7d2f2') }}</n-radio>
                          <n-radio value="wagering">{{ $t('activity.formModal.k7d2f3') }}</n-radio>
                          <n-radio value="signup">{{ $t('activity.formModal.k51454') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Security Verification -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >{{ $t('activity.formModal.k5b89') }}<n-icon size="16" class="ml-1 text-blue-500">
                          <HelpCircle />
                        </n-icon>
                      </label>
                      <n-switch v-model:value="formData.securityVerification" />
                    </div>

                    <!-- Reward Type -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.rewardReport.k5956') }}</label
                      >
                      <n-radio-group
                        v-model:value="formData.redPacketRewardType"
                      >
                        <n-space>
                          <n-radio value="fixed">{{ $t('activity.formModal.k56fa3') }}</n-radio>
                          <n-radio value="percent">{{ $t('activity.formModal.k767e') }}</n-radio>
                          <n-radio value="points">{{ $t('activity.rewardReport.k79ef2') }}</n-radio>
                          <n-radio value="spins">{{ $t('activity.formModal.k65cb') }}</n-radio>
                          <n-radio value="coupon">{{ $t('activity.formModal.k4f18') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Total Count Limit -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >
                        {{ $t('activity.labels.lx3lht4') }}
                        <n-icon size="16" class="ml-1 text-blue-500">
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
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >
                        {{ $t('activity.labels.l1lwx21q') }}
                        <n-icon size="16" class="ml-1 text-blue-500">
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
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >
                        {{ $t('activity.labels.lz671bg') }}
                        <n-icon size="16" class="ml-1 text-blue-500">
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
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >
                        {{ $t('activity.labels.l89djt6') }}
                        <n-icon size="16" class="ml-1 text-blue-500">
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
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >
                        {{ $t('activity.labels.l1oyrz3b') }}
                        <n-icon size="16" class="ml-1 text-blue-500">
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
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >
                        {{ $t('activity.labels.lzuj7cd') }}
                        <n-icon size="16" class="ml-1 text-blue-500">
                          <HelpCircle />
                        </n-icon>
                      </label>
                      <n-radio-group
                        v-model:value="formData.dailyGrabLimitType"
                      >
                        <n-space>
                          <n-radio value="fixed">{{ $t('activity.formModal.k56fa') }}</n-radio>
                          <n-radio value="daily_charge">{{ $t('activity.formModal.k5f53') }}</n-radio>
                          <n-radio value="daily_bet">{{ $t('activity.formModal.k5f532') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                      <n-input-number
                        v-if="formData.dailyGrabLimitType === 'fixed'"
                        v-model:value="formData.dailyGrabLimit"
                        placeholder="3"
                        class="mt-2 w-full"
                      />
                    </div>

                    <!-- Total Grab Limit -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >
                        {{ $t('activity.labels.lrdj69m') }}
                        <n-icon size="16" class="ml-1 text-blue-500">
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
                      <label
                        class="mb-3 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k9996') }}</label
                      >

                      <!-- Radio Button Selection -->
                      <n-radio-group
                        v-model:value="formData.redPacketDisplayStyle"
                        class="mb-6"
                      >
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
                        <label
                          class="mb-3 block text-sm font-medium text-gray-700"
                          >{{ $t('activity.formModal.k68374') }}</label
                        >
                        <div
                          class="flex justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8"
                        >
                          <div class="text-center">
                            <img
                              :src="getCurrentStyleImage()"
                              :alt="getCurrentStyleLabel()"
                              class="mx-auto h-32 w-32 object-contain"
                              v-if="getCurrentStyleImage()"
                            />
                            <div
                              v-else
                              class="mx-auto flex h-32 w-32 items-center justify-center rounded-lg bg-gray-200 text-gray-500"
                            >{{ $t('activity.formModal.k9884') }}</div>
                            <p class="mt-3 text-sm text-gray-600">
                              {{ getCurrentStyleLabel() }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>

                  <!-- Investment Specific Fields (only for 投资 type) -->
                  <template v-if="formData.activityType === 'investment'">
                    <!-- Investment Type -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k6295') }}</label
                      >
                      <n-radio-group v-model:value="formData.investmentType">
                        <n-space>
                          <n-radio value="fixed_amount">{{ $t('activity.formModal.k56fa3') }}</n-radio>
                          <n-radio value="gift_by_ratio">{{ $t('activity.formModal.k63092') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Reward Days -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.labels.l12w2syn') }}</label
                      >
                      <n-input-number
                        v-model:value="formData.rewardDays"
                        placeholder="3"
                        class="w-full"
                        :min="1"
                      />
                    </div>

                    <!-- Distribution Method -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k6d3e') }}</label
                      >
                      <n-radio-group
                        v-model:value="formData.investmentDistributionMethod"
                      >
                        <n-space>
                          <n-radio value="daily_auto"
                            >{{ $t('activity.formModal.k73a9k6bcf') }}</n-radio
                          >
                          <n-radio value="expired_auto"
                            >{{ $t('activity.formModal.k73a9k8fc72') }}</n-radio
                          >
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Investment Configuration Table -->
                    <div>
                      <label
                        class="mb-3 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k62952') }}</label
                      >
                      <div class="overflow-x-auto">
                        <table class="w-full rounded-lg border border-gray-200">
                          <thead class="bg-gray-50">
                            <tr>
                              <th
                                class="border-b px-3 py-2 text-left text-xs font-medium text-gray-700"
                              >{{ $t('activity.formModal.k62953') }}</th>
                              <th
                                class="border-b px-3 py-2 text-left text-xs font-medium text-gray-700"
                              >{{ $t('activity.detailModal.k8d60') }}</th>
                              <th
                                class="border-b px-3 py-2 text-left text-xs font-medium text-gray-700"
                              >{{ $t('activity.formModal.k7d2f4') }}</th>
                              <th
                                class="border-b px-3 py-2 text-left text-xs font-medium text-gray-700"
                              >{{ $t('activity.formModal.k6bcf9') }}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="(
                                item, index
                              ) in formData.investmentSettings"
                              :key="index"
                              class="border-b"
                            >
                              <td class="px-3 py-2">
                                <n-input
                                  v-model:value="item.investmentAmount"
                                  :placeholder="$t('activity.formModal.k8bf79')"
                                  size="small"
                                  class="w-full"
                                />
                              </td>
                              <td class="px-3 py-2">
                                <n-input
                                  v-model:value="item.giftAmount"
                                  :placeholder="$t('activity.formModal.k8bf710')"
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
                          </n-icon>{{ $t('activity.formModal.k6dfb5') }}</n-button>
                      </div>
                    </div>
                  </template>

                  <!-- Promotion Specific Fields (only for 推广 type) -->
                  <template v-if="formData.activityType === 'promotion'">
                    <!-- Effective Member Standard -->
                    <div>
                      <label
                        class="mb-3 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k67095') }}</label
                      >

                      <!-- Accumulated Recharge -->
                      <div class="mb-3">
                        <label
                          class="mb-2 block text-sm font-medium text-gray-700"
                          >{{ $t('activity.labels.l10qqv1b') }}</label
                      >
                        <n-input
                          v-model:value="formData.promotionAccumulatedRecharge"
                          :placeholder="$t('activity.formModal.k8bf703')"
                          class="w-full"
                        />
                      </div>

                      <!-- Accumulated Recharge Days -->
                      <div class="mb-3">
                        <label
                          class="mb-2 block text-sm font-medium text-gray-700"
                          >{{ $t('activity.labels.l7miy4m') }}</label
                      >
                        <n-input
                          v-model:value="
                            formData.promotionAccumulatedRechargeDays
                          "
                          :placeholder="$t('activity.formModal.k8bf704')"
                          class="w-full"
                        />
                      </div>

                      <!-- Accumulated Recharge Count -->
                      <div class="mb-3">
                        <label
                          class="mb-2 block text-sm font-medium text-gray-700"
                          >{{ $t('activity.labels.l7mm05q') }}</label
                      >
                        <n-input
                          v-model:value="
                            formData.promotionAccumulatedRechargeCount
                          "
                          :placeholder="$t('activity.formModal.k8bf705')"
                          class="w-full"
                        />
                      </div>

                      <!-- Accumulated Wagering -->
                      <div class="mb-3">
                        <label
                          class="mb-2 block text-sm font-medium text-gray-700"
                          >{{ $t('activity.labels.l10qtzbq') }}</label
                      >
                        <n-input
                          v-model:value="formData.promotionAccumulatedWagering"
                          :placeholder="$t('activity.formModal.k8bf706')"
                          class="w-full"
                        />
                      </div>

                      <!-- Effective Wagering Platform -->
                      <div class="mb-3">
                        <label
                          class="mb-2 block text-sm font-medium text-gray-700"
                          >{{ $t('activity.formModal.k67092') }}</label
                        >
                        <n-radio-group
                          v-model:value="formData.promotionWageringPlatform"
                        >
                          <n-space>
                            <n-radio value="all_platforms">{{ $t('activity.formModal.k5168') }}</n-radio>
                            <n-radio value="specific_platforms"
                              >{{ $t('activity.formModal.k6307') }}</n-radio
                            >
                            <n-radio value="exclude_platforms"
                              >{{ $t('activity.formModal.k6392') }}</n-radio
                            >
                          </n-space>
                        </n-radio-group>
                      </div>

                      <!-- Platform and Game Selection for Promotion (when specific_platforms is selected) -->
                      <div
                        v-if="
                          formData.promotionWageringPlatform ===
                          'specific_platforms'
                        "
                      >
                        <PlatformGameSelector
                          v-model="
                            (formData as any).promotionWageringPlatformConfig
                              .selectedPlatforms
                          "
                          :wagering-platform="
                            formData.promotionWageringPlatform
                          "
                          @validation-change="handlePlatformValidation"
                        />
                      </div>

                      <!-- Download App and Login -->
                      <div class="mb-3 flex items-center justify-between">
                        <label class="block text-sm font-medium text-gray-700"
                          >{{ $t('activity.formModal.k4e0b') }}</label
                        >
                        <n-switch
                          v-model:value="formData.promotionDownloadAppLogin"
                        />
                      </div>
                    </div>

                    <!-- Statistical Number of People Limit -->
                    <div>
                      <label
                        class="mb-3 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k7edf') }}</label
                      >

                      <!-- Same Registration IP Limit -->
                      <div class="mb-3">
                        <label
                          class="mb-2 block text-sm font-medium text-gray-700"
                          >{{ $t('activity.labels.l1b84jvr') }}</label
                      >
                        <n-input
                          v-model:value="formData.promotionSameIPLimit"
                          :placeholder="$t('activity.formModal.k8bf707')"
                          class="w-full"
                        />
                      </div>

                      <!-- Same Registration Device Limit -->
                      <div class="mb-3">
                        <label
                          class="mb-2 block text-sm font-medium text-gray-700"
                          >{{ $t('activity.labels.l1t6cb2h') }}</label
                      >
                        <n-input
                          v-model:value="formData.promotionSameDeviceLimit"
                          :placeholder="$t('activity.formModal.k8bf708')"
                          class="w-full"
                        />
                      </div>
                    </div>

                    <!-- Reward Type -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.rewardReport.k5956') }}</label
                      >
                      <n-radio-group
                        v-model:value="formData.promotionRewardType"
                      >
                        <n-space>
                          <n-radio value="fixed_amount">{{ $t('activity.formModal.k56fa3') }}</n-radio>
                          <n-radio value="random_amount">{{ $t('activity.formModal.k968f') }}</n-radio>
                          <n-radio value="accumulated_daily">{{ $t('activity.formModal.k7d2fk53ea') }}<n-icon size="16" class="ml-1 text-blue-500">
                              <HelpCircle />
                            </n-icon>
                          </n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Whether to Display on Agent Page -->
                    <div class="flex items-center justify-between">
                      <label class="block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k662f3') }}</label
                      >
                      <n-switch
                        v-model:value="formData.promotionDisplayOnAgentPage"
                      />
                    </div>

                    <!-- Whether to Allow Claiming Same Activity Type -->
                    <div class="flex items-center justify-between">
                      <label class="block text-sm font-medium text-gray-700">{{ $t('activity.formModal.k662f4') }}</label>
                      <n-switch v-model:value="allowClaimSamePromotionType" />
                    </div>

                    <!-- Distribution Method -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k6d3e') }}</label
                      >
                      <n-radio-group
                        v-model:value="formData.promotionDistributionMethod"
                      >
                        <n-space>
                          <n-radio value="expired_invalid"
                            >{{ $t('activity.formModal.k73a9k8fc7') }}</n-radio
                          >
                          <n-radio value="expired_auto"
                            >{{ $t('activity.formModal.k73a9k8fc72') }}</n-radio
                          >
                          <n-radio value="manual_distribution"
                            >{{ $t('activity.formModal.k73a9k4eba') }}</n-radio
                          >
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Display Claim Method -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k5c553') }}</label
                      >
                      <n-radio-group
                        v-model:value="formData.promotionDisplayClaimMethod"
                      >
                        <n-space>
                          <n-radio value="open_redpacket">{{ $t('activity.formModal.k5f003') }}<n-icon size="16" class="ml-1 text-blue-500">
                              <HelpCircle />
                            </n-icon>
                          </n-radio>
                          <n-radio value="open_treasurechest">{{ $t('activity.formModal.k5f004') }}<n-icon size="16" class="ml-1 text-blue-500">
                              <HelpCircle />
                            </n-icon>
                          </n-radio>
                          <n-radio value="claim_button">{{ $t('activity.formModal.k98863') }}<n-icon size="16" class="ml-1 text-blue-500">
                              <HelpCircle />
                            </n-icon>
                          </n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Whether to Display Amount -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k662f5') }}</label
                      >
                      <n-radio-group
                        v-model:value="formData.promotionDisplayAmount"
                      >
                        <n-space>
                          <n-radio value="hide">{{ $t('activity.formModal.k4e0d2') }}</n-radio>
                          <n-radio value="show">{{ $t('activity.formModal.k663e') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Reward Settings -->
                    <div>
                      <div class="mb-3 flex items-center justify-between">
                        <label class="block text-sm font-medium text-gray-700"
                          >{{ $t('activity.formModal.k59563') }}</label
                        >
                        <div class="flex items-center gap-2">
                          <n-button
                            size="small"
                            type="info"
                            text
                            @click="downloadPromotionTemplate"
                          >{{ $t('activity.formModal.k4e0b2') }}</n-button>
                          <n-button
                            size="small"
                            type="primary"
                            text
                            @click="batchImportPromotion"
                          >{{ $t('activity.formModal.k6279CSVExcel') }}<n-icon size="16" class="ml-1 text-blue-500">
                              <HelpCircle />
                            </n-icon>
                          </n-button>
                        </div>
                      </div>

                      <div class="overflow-x-auto">
                        <table class="w-full rounded-lg border border-gray-200">
                          <thead class="bg-gray-50">
                            <tr>
                              <th
                                class="border-b px-3 py-2 text-left text-xs font-medium text-gray-700"
                              >{{ $t('activity.formModal.k67096') }}</th>
                              <th
                                class="border-b px-3 py-2 text-left text-xs font-medium text-gray-700"
                              >{{ $t('activity.formModal.k5956') }}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="(
                                item, index
                              ) in formData.promotionRewardSettings"
                              :key="index"
                              class="border-b"
                            >
                              <td class="px-3 py-2">
                                <n-input
                                  v-model:value="item.effectivePromotionCount"
                                  :placeholder="$t('activity.formModal.k8bf711')"
                                  size="small"
                                  class="w-full"
                                />
                              </td>
                              <td class="px-3 py-2">
                                <n-input
                                  v-model:value="item.rewardAmount"
                                  :placeholder="$t('activity.formModal.k8bf73')"
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
                          </n-icon>{{ $t('activity.formModal.k6dfb') }}</n-button>
                      </div>
                    </div>
                  </template>

                  <!-- Agent Specific Fields (only for 代理 type) -->
                  <template v-if="formData.activityType === 'agent'">
                    <!-- Whether to Display on Agent Page -->
                    <div class="flex items-center justify-between">
                      <label class="block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k662f3') }}</label
                      >
                      <n-switch
                        v-model:value="formData.agentDisplayOnAgentPage"
                      />
                    </div>

                    <!-- Distribution Method -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k6d3e') }}</label
                      >
                      <n-radio-group
                        v-model:value="formData.agentDistributionMethod"
                      >
                        <n-space>
                          <n-radio value="expired_invalid"
                            >{{ $t('activity.formModal.k73a9k8fc7') }}</n-radio
                          >
                          <n-radio value="expired_auto"
                            >{{ $t('activity.formModal.k73a9k8fc72') }}</n-radio
                          >
                          <n-radio value="manual_distribution"
                            >{{ $t('activity.formModal.k73a9k4eba') }}</n-radio
                          >
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Reward Claim Expiry Days -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >
                        {{ $t('activity.labels.lihat34') }}
                        <n-icon size="16" class="ml-1 text-blue-500">
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
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k8fd42') }}</label
                      >
                      <n-radio-group v-model:value="formData.agentRewardCycle">
                        <n-space>
                          <n-radio value="daily">{{ $t('activity.formModal.k6bcf9') }}</n-radio>
                          <n-radio value="weekly">{{ $t('activity.formModal.k6bcf10') }}</n-radio>
                          <n-radio value="monthly">{{ $t('activity.formModal.k6bcf11') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Reward Type (First Instance) -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k8fd43') }}</label
                      >
                      <n-radio-group v-model:value="formData.agentRewardType">
                        <n-space>
                          <n-radio value="agent_rebate">{{ $t('activity.formModal.k4ee3') }}</n-radio>
                          <n-radio value="direct_member_accumulated_recharge"
                            >{{ $t('activity.formModal.k76f4') }}</n-radio
                          >
                          <n-radio value="direct_member_first_recharge">{{ $t('activity.formModal.k76f42') }}<n-icon size="16" class="ml-1 text-blue-500">
                              <HelpCircle />
                            </n-icon>
                          </n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Reward Type (Second Instance) -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.rewardReport.k5956') }}</label
                      >
                      <n-radio-group
                        v-model:value="formData.agentRewardAmountType"
                      >
                        <n-space>
                          <n-radio value="fixed_amount">{{ $t('activity.formModal.k56fa3') }}</n-radio>
                          <n-radio value="proportional_amount"
                            >{{ $t('activity.formModal.k6bd42') }}</n-radio
                          >
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Reward Settings -->
                    <div>
                      <label
                        class="mb-3 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k59563') }}</label
                      >
                      <div class="space-y-3">
                        <div
                          v-for="(item, index) in formData.agentRewardSettings"
                          :key="index"
                          class="flex items-end gap-3"
                        >
                          <!-- Rebate Amount -->
                          <div class="flex-1">
                            <label class="mb-1 block text-xs text-gray-600"
                              >{{ $t('activity.formModal.k8fd44') }}</label
                            >
                            <n-input
                              v-model:value="item.rebateAmount"
                              :placeholder="$t('activity.formModal.k8bf712')"
                              class="w-full"
                            />
                          </div>

                          <!-- Reward Amount -->
                          <div class="flex-1">
                            <label class="mb-1 block text-xs text-gray-600"
                              >{{ $t('activity.formModal.k5956') }}</label
                            >
                            <n-input
                              v-model:value="item.rewardAmount"
                              :placeholder="$t('activity.formModal.k5956')"
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
                          </n-icon>{{ $t('activity.formModal.k6dfb') }}</n-button>
                      </div>
                    </div>
                  </template>

                  <!-- Return Bonus Specific Fields (回归彩金) -->
                  <template v-if="formData.activityType === 'return_bonus'">
                    <div>
                      <label class="mb-2 block text-sm font-medium text-gray-700">未登录最少天数</label>
                      <n-input-number
                        v-model:value="formData.inactiveDaysMin"
                        :min="1"
                        class="w-full"
                        placeholder="7"
                      />
                    </div>
                    <div>
                      <label class="mb-2 block text-sm font-medium text-gray-700">回归奖励金额</label>
                      <n-input-number
                        v-model:value="formData.rewardAmount"
                        :min="0"
                        :precision="2"
                        class="w-full"
                      />
                    </div>
                    <div class="flex items-center justify-between">
                      <label class="block text-sm font-medium text-gray-700">登录奖励需先充值</label>
                      <n-switch v-model:value="formData.requiresDeposit" />
                    </div>
                    <div v-if="formData.requiresDeposit">
                      <label class="mb-2 block text-sm font-medium text-gray-700">最低充值金额</label>
                      <n-input-number
                        v-model:value="formData.minDepositAmount"
                        :min="0"
                        :precision="2"
                        class="w-full"
                      />
                    </div>
                    <div>
                      <label class="mb-2 block text-sm font-medium text-gray-700">未充值最少天数</label>
                      <n-input-number
                        v-model:value="formData.depositInactiveDaysMin"
                        :min="0"
                        class="w-full"
                        placeholder="7"
                      />
                    </div>
                    <div>
                      <label class="mb-2 block text-sm font-medium text-gray-700">充值回归奖励金额</label>
                      <n-input-number
                        v-model:value="formData.depositRewardAmount"
                        :min="0"
                        :precision="2"
                        class="w-full"
                      />
                    </div>
                  </template>

                  <!-- Ranking Specific Fields (排行榜) -->
                  <template v-if="formData.activityType === 'ranking'">
                    <div>
                      <label class="mb-2 block text-sm font-medium text-gray-700">排行指标</label>
                      <n-radio-group v-model:value="formData.rankingMetric">
                        <n-space>
                          <n-radio value="wagering">打码</n-radio>
                          <n-radio value="recharge">充值</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>
                    <div>
                      <label class="mb-2 block text-sm font-medium text-gray-700">统计周期</label>
                      <n-radio-group v-model:value="formData.rankingPeriod">
                        <n-space>
                          <n-radio value="daily">日</n-radio>
                          <n-radio value="weekly">周</n-radio>
                          <n-radio value="monthly">月</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>
                    <div>
                      <label class="mb-2 block text-sm font-medium text-gray-700">机器人数量</label>
                      <n-input-number v-model:value="formData.robotCount" :min="0" :max="100" class="w-full" />
                    </div>
                    <div>
                      <label class="mb-3 block text-sm font-medium text-gray-700">名次奖励区间</label>
                      <div class="space-y-3">
                        <div
                          v-for="(item, index) in formData.rankingRewards"
                          :key="index"
                          class="flex items-end gap-3"
                        >
                          <div class="flex-1">
                            <label class="mb-1 block text-xs text-gray-600">名次起</label>
                            <n-input-number v-model:value="item.rankFrom" :min="1" class="w-full" />
                          </div>
                          <div class="flex-1">
                            <label class="mb-1 block text-xs text-gray-600">名次止</label>
                            <n-input-number v-model:value="item.rankTo" :min="1" class="w-full" />
                          </div>
                          <div class="flex-1">
                            <label class="mb-1 block text-xs text-gray-600">奖励金额</label>
                            <n-input-number v-model:value="item.rewardValue" :min="0" :precision="2" class="w-full" />
                          </div>
                          <n-button
                            v-if="formData.rankingRewards.length > 1"
                            size="small"
                            type="error"
                            class="mb-1"
                            @click="removeRankingReward(index)"
                          >
                            <n-icon size="16"><Close /></n-icon>
                          </n-button>
                        </div>
                        <n-button size="small" type="primary" class="w-full" @click="addRankingReward">
                          <n-icon size="16" class="mr-1"><Add /></n-icon>添加区间
                        </n-button>
                      </div>
                    </div>
                  </template>

                  <!-- Collect Characters Specific Fields (only for 集字 type) -->
                  <template v-if="formData.activityType === 'collect'">
                    <!-- Collect Characters Combination -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k96c6') }}</label
                      >
                      <div class="space-y-3">
                        <!-- Combination Type -->
                        <div>
                          <n-select
                            v-model:value="formData.collectCombinationType"
                            :placeholder="$t('activity.formModal.k8282')"
                            :options="collectCombinationOptions"
                            class="w-full"
                          />
                        </div>

                        <!-- Combination Name -->
                        <div>
                          <n-select
                            v-model:value="formData.collectCombinationName"
                            :placeholder="$t('activity.formModal.k65b0')"
                            :options="collectCombinationNameOptions"
                            class="w-full"
                          />
                        </div>

                        <!-- Character Display -->
                        <div class="flex justify-center gap-2">
                          <div
                            v-for="(char, index) in formData.collectCharacters"
                            :key="index"
                            class="flex h-20 w-16 items-center justify-center rounded-lg border-2 border-yellow-400 bg-red-500 text-2xl font-bold text-white"
                          >
                            {{ char }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Amount Distribution Method -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k74dc') }}</label
                      >
                      <n-radio-group
                        v-model:value="formData.collectDistributionMethod"
                      >
                        <n-space>
                          <n-radio value="daily">{{ $t('activity.formModal.k6bcf12') }}</n-radio>
                          <n-radio value="weekly">{{ $t('activity.formModal.k6bcf13') }}</n-radio>
                          <n-radio value="monthly">{{ $t('activity.formModal.k6bcf14') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Reward Claim Expiry Days -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.labels.lihat34') }}</label
                      >
                      <n-input-number
                        v-model:value="formData.collectRewardClaimExpiryDays"
                        placeholder="1"
                        class="w-full"
                        :min="1"
                      />
                    </div>

                    <!-- Actual Distribution Amount -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.labels.lxxo71v') }}</label
                      >
                      <n-input
                        v-model:value="formData.collectActualDistributionAmount"
                        :placeholder="$t('activity.formModal.enterDistributionShare', [getDistributionMethodText()])"
                        class="w-full"
                      />
                    </div>

                    <!-- Displayed Distribution Amount -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.labels.l70upjl') }}</label
                      >
                      <n-input
                        v-model:value="
                          formData.collectDisplayedDistributionAmount
                        "
                        :placeholder="$t('activity.formModal.enterDistributionShare', [getDistributionMethodText()])"
                        class="w-full"
                      />
                    </div>

                    <!-- Character Collection Method -->
                    <div>
                      <label
                        class="mb-3 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k96c62') }}</label
                      >

                      <!-- Important Note -->
                      <div
                        class="mb-3 rounded bg-orange-50 p-2 text-xs text-orange-600"
                      >{{ $t('activity.formModal.k91cdk83b7k6b21') }}</div>

                      <!-- Conditions Table -->
                      <div class="space-y-3">
                        <div
                          v-for="(item, index) in formData.collectConditions"
                          :key="index"
                          class="flex items-end gap-3"
                        >
                          <!-- Type -->
                          <div class="flex-1">
                            <label class="mb-1 block text-xs text-gray-600"
                              >{{ $t('activity.formModal.k7c7b') }}</label
                            >
                            <n-select
                              v-model:value="item.type"
                              :placeholder="$t('activity.formModal.k6709')"
                              :options="collectConditionTypeOptions"
                              size="small"
                              class="w-full"
                            />
                          </div>

                          <!-- Condition Value -->
                          <div class="flex-1">
                            <label class="mb-1 block text-xs text-gray-600"
                              >{{ $t('activity.formModal.k67612') }}</label
                            >
                            <n-input
                              v-model:value="item.conditionValue"
                              :placeholder="$t('activity.formModal.k8bf78')"
                              size="small"
                              class="w-full"
                            />
                          </div>

                          <!-- Daily Count Limit -->
                          <div class="flex-1">
                            <label class="mb-1 block text-xs text-gray-600"
                              >{{ $t('activity.formModal.k6bcf15') }}</label
                            >
                            <n-input
                              v-model:value="item.dailyCountLimit"
                              :placeholder="$t('activity.formModal.k8bf78')"
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
                          </n-icon>{{ $t('activity.formModal.k6dfb6') }}</n-button>
                      </div>
                    </div>
                  </template>

                  <!-- Guessing/Competition Specific Fields (only for 竞猜 type) -->
                  <template v-if="formData.activityType === 'guessing'">
                    <!-- Team/Match Configuration -->
                    <div>
                      <label
                        class="mb-3 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k961f') }}</label
                      >
                      <div class="overflow-x-auto">
                        <table class="w-full rounded-lg border border-gray-200">
                          <thead class="bg-gray-50">
                            <tr>
                              <th
                                class="border-b px-3 py-2 text-left text-xs font-medium text-gray-700"
                              >{{ $t('activity.formModal.k7f16') }}</th>
                              <th
                                class="border-b px-3 py-2 text-left text-xs font-medium text-gray-700"
                              >{{ $t('activity.formModal.k961f2') }}</th>
                              <th
                                class="border-b px-3 py-2 text-left text-xs font-medium text-gray-700"
                              >{{ $t('activity.formModal.k961f3') }}</th>
                              <th
                                class="border-b px-3 py-2 text-left text-xs font-medium text-gray-700"
                              >{{ $t('activity.formModal.k961f4') }}</th>
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
                                  class="h-16 w-16"
                                >
                                  <n-icon size="24">
                                    <Add />
                                  </n-icon>
                                </n-button>
                              </td>
                              <td class="px-3 py-2">
                                <n-input
                                  v-model:value="team.chineseName"
                                  :placeholder="$t('activity.formModal.k8bf713')"
                                  size="small"
                                  class="w-full"
                                />
                              </td>
                              <td class="px-3 py-2">
                                <n-input
                                  v-model:value="team.englishName"
                                  :placeholder="$t('activity.formModal.k8bf714')"
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
                          </n-icon>{{ $t('activity.formModal.k6dfb7') }}</n-button>
                      </div>

                      <!-- Image Upload Instructions -->
                      <div
                        class="mt-3 rounded bg-gray-50 p-2 text-xs text-gray-500"
                      >{{ $t('activity.formModal.k53eaJpegJpgk4e14k56fe100px') }}</div>
                    </div>

                    <!-- Participation Conditions -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.labels.lv9qdtj') }}</label
                      >
                      <n-select
                        v-model:value="formData.guessingParticipationCondition"
                        :placeholder="$t('activity.formModal.k65e0')"
                        :options="guessingParticipationOptions"
                        class="w-full"
                      />
                    </div>

                    <!-- Obtain Points -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.labels.l11cf7fw') }}</label
                      >
                      <n-select
                        v-model:value="formData.guessingObtainPoints"
                        :placeholder="$t('activity.labels.pleaseSelect')"
                        :options="guessingObtainPointsOptions"
                        class="w-full"
                      />
                    </div>

                    <!-- Point Limit -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >
                        {{ $t('activity.labels.l103joxf') }}
                        <n-icon size="16" class="ml-1 text-blue-500">
                          <HelpCircle />
                        </n-icon>
                      </label>
                      <n-input
                        v-model:value="formData.guessingPointLimit"
                        :placeholder="$t('activity.formModal.k8bf709')"
                        class="w-full"
                      />
                    </div>

                    <!-- Betting Limit -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.labels.luojaf4') }}</label
                      >
                      <div class="flex items-center gap-2">
                        <n-input
                          v-model:value="formData.guessingBettingLimitMin"
                          :placeholder="$t('activity.formModal.k8bf715')"
                          class="flex-1"
                        />
                        <span class="text-gray-500">-</span>
                        <n-input
                          v-model:value="formData.guessingBettingLimitMax"
                          :placeholder="$t('activity.formModal.k8bf716')"
                          class="flex-1"
                        />
                      </div>
                    </div>

                    <!-- Actual Distribution Amount -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.labels.lxxo71v') }}</label
                      >
                      <n-input
                        v-model:value="
                          formData.guessingActualDistributionAmount
                        "
                        :placeholder="$t('activity.formModal.k8bf717')"
                        class="w-full"
                      />
                    </div>

                    <!-- Displayed Distribution Amount -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.labels.l70upjl') }}</label
                      >
                      <n-input
                        v-model:value="
                          formData.guessingDisplayedDistributionAmount
                        "
                        :placeholder="$t('activity.formModal.k8bf718')"
                        class="w-full"
                      />
                    </div>

                    <!-- Distribution Method -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k74dc2') }}</label
                      >
                      <n-radio-group
                        v-model:value="formData.guessingDistributionMethod"
                      >
                        <n-space>
                          <n-radio value="all_members"
                            >{{ $t('activity.formModal.k672a') }}</n-radio
                          >
                          <n-radio value="betting_members_only"
                            >{{ $t('activity.formModal.k4ec5') }}</n-radio
                          >
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Information Message -->
                    <div
                      class="mt-6 rounded-lg border border-orange-200 bg-orange-50 p-3"
                    >
                      <div class="flex items-center gap-2 text-orange-700">
                        <n-icon size="16">
                          <HelpCircle />
                        </n-icon>
                        <span class="text-sm"
                          >{{ $t('activity.formModal.k8bf7k66f4') }}</span
                        >
                      </div>
                    </div>
                  </template>

                  <!-- Newcomer Bonus Specific Fields (only for 新人彩金 type) -->
                  <template v-if="formData.activityType === 'newbie'">
                    <!-- Promotion Type -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >{{ $t('activity.formModal.k4f182') }}<n-icon size="16" class="ml-1 text-blue-500">
                          <HelpCircle />
                        </n-icon>
                      </label>
                      <n-select
                        v-model:value="formData.newbiePromotionType"
                        :placeholder="$t('activity.formModal.k901ak586b')"
                        :options="newbiePromotionTypeOptions"
                        class="w-full"
                        disabled
                      />
                      <div class="mt-1 text-xs text-gray-500">{{ $t('activity.formModal.k65b02') }}</div>
                    </div>

                    <!-- Redemption Code, Total Usage Count, Validity Period -->
                    <div>
                      <label
                        class="mb-3 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k5151k603bk6709') }}</label
                      >

                      <!-- Batch Import and Download Template -->
                      <div class="mb-3 flex items-center gap-2">
                        <n-button
                          size="small"
                          type="info"
                          text
                          @click="downloadNewbieTemplate"
                        >{{ $t('activity.formModal.k4e0b2') }}</n-button>
                        <n-button
                          size="small"
                          type="primary"
                          text
                          @click="batchImportNewbie"
                        >{{ $t('activity.formModal.k6279') }}<n-icon size="16" class="ml-1 text-blue-500">
                            <HelpCircle />
                          </n-icon>
                        </n-button>
                      </div>

                      <!-- Multiple Rows for Redemption Settings -->
                      <div class="space-y-3">
                        <div
                          v-for="(
                            item, index
                          ) in formData.newbieRedemptionSettings"
                          :key="index"
                          class="flex items-end gap-3"
                        >
                          <!-- Redemption Code -->
                          <div class="flex-1">
                            <label class="mb-1 block text-xs text-gray-600"
                              >{{ $t('activity.formModal.k5151') }}</label
                            >
                            <n-input
                              v-model:value="item.redemptionCode"
                              :placeholder="$t('activity.formModal.k8bf719')"
                              class="w-full"
                            />
                          </div>

                          <!-- Total Usage Count -->
                          <div class="flex-1">
                            <label class="mb-1 block text-xs text-gray-600"
                              >{{ $t('activity.formModal.k603b') }}</label
                            >
                            <n-input
                              v-model:value="item.totalUsageCount"
                              :placeholder="$t('activity.formModal.k4f7f0')"
                              class="w-full"
                            />
                          </div>

                          <!-- Validity Period Start -->
                          <div class="flex-1">
                            <label class="mb-1 block text-xs text-gray-600"
                              >{{ $t('activity.formModal.k67097') }}</label
                            >
                            <n-date-picker
                        :time-zone="timezone"
                              v-model:value="item.startTime"
                              :placeholder="$t('activity.formModal.k5f00')"
                              class="w-full"
                            />
                          </div>

                          <!-- Validity Period End -->
                          <div class="flex-1">
                            <label class="mb-1 block text-xs text-gray-600"
                              >{{ $t('activity.formModal.k67098') }}</label
                            >
                            <n-date-picker
                        :time-zone="timezone"
                              v-model:value="item.endTime"
                              :placeholder="$t('activity.formModal.k7ed3')"
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
                          </n-icon>{{ $t('activity.formModal.k6dfb8') }}</n-button>
                      </div>
                    </div>

                    <!-- How to Get Redemption Code -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k83b72') }}</label
                      >
                      <n-radio-group
                        v-model:value="formData.newbieRedemptionMethod"
                      >
                        <n-space>
                          <n-radio value="click_link">{{ $t('activity.formModal.k70b9') }}</n-radio>
                          <n-radio value="private_promotion"
                            >{{ $t('activity.formModal.k79c1') }}</n-radio
                          >
                          <n-radio value="user_click">{{ $t('activity.formModal.k7528') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Gift Method -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.labels.l12t06bx') }}</label
                      >
                      <n-radio-group v-model:value="formData.newbieGiftMethod">
                        <n-space>
                          <n-radio value="fixed_bonus">{{ $t('activity.formModal.k56fa4') }}</n-radio>
                          <n-radio value="proportional_gift">{{ $t('activity.formModal.k968f2') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Actual Gift Amount & Display Gift Amount -->
                    <div>
                      <label
                        class="mb-3 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k5b9e') }}</label
                      >
                      <div class="flex items-end gap-3">
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
                      <label
                        class="mb-3 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k5c554') }}</label
                      >
                      <div class="flex items-end gap-3">
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
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >{{ $t('activity.formModal.k671f') }}<n-icon size="16" class="ml-1 text-blue-500">
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
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >{{ $t('activity.formModal.k63d0') }}<n-icon size="16" class="ml-1 text-red-500">*</n-icon>
                      </label>
                      <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-600">{{ $t('activity.formModal.k7d2f2') }}</span>
                        <n-input
                          v-model:value="formData.newbieWithdrawalThreshold"
                          placeholder="0"
                          class="flex-1"
                        />
                        <span class="text-sm text-gray-600">{{ $t('activity.formModal.k624d') }}</span>
                      </div>
                    </div>

                    <!-- Display Bonus -->
                    <div class="flex items-center justify-between">
                      <label class="block text-sm font-medium text-gray-700">{{ $t('activity.formModal.k5c555') }}<n-icon size="16" class="ml-1 text-blue-500">
                          <HelpCircle />
                        </n-icon>
                      </label>
                      <n-switch v-model:value="formData.newbieDisplayBonus" />
                    </div>

                    <!-- Withdrawal Threshold -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.labels.lxgd7ux') }}</label
                      >
                      <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-600">{{ $t('activity.formModal.k7d2f2') }}</span>
                        <n-input
                          v-model:value="formData.newbieWithdrawalThreshold"
                          :placeholder="$t('activity.formModal.k8bf7010')"
                          class="flex-1"
                        />
                        <span class="text-sm text-gray-600">{{ $t('activity.formModal.k624d') }}</span>
                      </div>
                    </div>

                    <!-- Profit Cap -->
                    <div
                      class="rounded-lg border border-blue-200 bg-blue-50 p-3"
                    >
                      <div class="flex items-center justify-between">
                        <div class="text-sm text-blue-700">{{ $t('activity.formModal.k76c8k8fdbk672a') }}</div>
                        <n-button
                          size="small"
                          type="primary"
                          text
                          @click="goToWithdrawalSettings"
                        >{{ $t('activity.formModal.k524d') }}</n-button>
                      </div>
                    </div>
                  </template>

                  <!-- Recharge Specific Fields (only for 充值 type) -->
                  <template v-if="formData.activityType === 'recharge'">
                    <!-- Activity Conditions -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k6d3b2') }}</label
                      >
                      <n-radio-group v-model:value="formData.condition">
                        <n-space vertical>
                          <n-radio value="first_deposit">{{ $t('activity.formModal.k8d26') }}</n-radio>
                          <n-radio value="accumulate_recharge"
                            >{{ $t('activity.formModal.k7d2f2') }}</n-radio
                          >
                          <n-radio value="single_recharge">{{ $t('activity.formModal.k5355') }}</n-radio>
                          <n-radio value="recharge_count">{{ $t('activity.formModal.k51454') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Cycle Method (only show when condition is accumulate_recharge) -->
                    <div v-if="formData.condition === 'accumulate_recharge'">
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >
                        {{ $t('activity.labels.lwxatv5') }}
                        <n-icon size="16" class="ml-1 text-blue-500">
                          <HelpCircle />
                        </n-icon>
                      </label>
                      <n-radio-group v-model:value="formData.cycleMethod">
                        <n-space vertical>
                          <n-radio value="daily_cumulative">{{ $t('activity.formModal.k65e5') }}</n-radio>
                          <n-radio value="weekly_cumulative"
                            >{{ $t('activity.formModal.k5468') }}</n-radio
                          >
                          <n-radio value="monthly_cumulative"
                            >{{ $t('activity.formModal.k6708') }}</n-radio
                          >
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Distribution Method -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k6d3e') }}</label
                      >
                      <n-radio-group
                        v-model:value="formData.distributionMethod"
                      >
                        <n-space vertical>
                          <n-radio value="player_claim_expires"
                            >{{ $t('activity.formModal.k73a9k8fc7') }}</n-radio
                          >
                          <n-radio value="player_claim_auto_after_expire"
                            >{{ $t('activity.formModal.k73a9k8fc72') }}</n-radio
                          >
                          <n-radio value="auto_claim">{{ $t('activity.formModal.k7cfb2') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Claim Time (hide when distribution method is auto_claim) -->
                    <div v-if="formData.distributionMethod !== 'auto_claim'">
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.rewardReport.k98862') }}</label
                      >
                      <n-radio-group v-model:value="formData.claimTime">
                        <n-space vertical>
                          <n-radio value="real_time"
                            >{{ $t('activity.formModal.k5b9ek5f71') }}</n-radio
                          >
                          <n-radio value="next_day">{{ $t('activity.formModal.k6b21') }}</n-radio>
                          <n-radio value="daily">{{ $t('activity.formModal.k6bcf') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Claim Count (领取次数) - only for recharge activities -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k9886') }}</label
                      >
                      <n-radio-group v-model:value="formData.claimCount">
                        <n-space vertical>
                          <n-radio value="claim_individually"
                            >{{ $t('activity.formModal.k53ef2') }}</n-radio
                          >
                          <n-radio value="claim_highest_only"
                            >{{ $t('activity.formModal.k9886k53ea') }}</n-radio
                          >
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Missing Fields from Screenshot -->
                    <!-- Reward Expiration Days (hide when distribution method is auto_claim) -->
                    <div v-if="formData.distributionMethod !== 'auto_claim'">
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >
                        {{ $t('activity.labels.lihat34') }}
                        <n-icon size="16" class="ml-1 text-blue-500">
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
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k767b') }}</label
                      >
                      <n-radio-group v-model:value="formData.beforeLoginPopup">
                        <n-space>
                          <n-radio value="none">{{ $t('activity.formModal.k4e0d') }}</n-radio>
                          <n-radio value="daily">{{ $t('activity.formModal.k6bcf3') }}</n-radio>
                          <n-radio value="high_frequency">{{ $t('activity.formModal.k9ad8') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k767b2') }}</label
                      >
                      <n-radio-group v-model:value="formData.afterLoginPopup">
                        <n-space>
                          <n-radio value="none">{{ $t('activity.formModal.k4e0d') }}</n-radio>
                          <n-radio value="high_frequency">{{ $t('activity.formModal.k9ad8') }}</n-radio>
                          <n-radio value="daily">{{ $t('activity.formModal.k6bcf3') }}</n-radio>
                          <n-radio value="every_login">{{ $t('activity.formModal.k6bcf4') }}</n-radio>
                          <n-radio value="once_only">{{ $t('activity.formModal.k53ea2') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Direct Pop-up After Recharge -->
                    <div class="flex items-center justify-between">
                      <label class="block text-sm font-medium text-gray-700">{{ $t('activity.formModal.k51452') }}<n-icon size="16" class="ml-1 text-blue-500">
                          <HelpCircle />
                        </n-icon>
                      </label>
                      <n-switch
                        v-model:value="formData.directPopupAfterRecharge"
                      />
                    </div>

                    <!-- Recharge Amount Configuration -->
                    <div>
                      <label
                        class="mb-3 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k51455') }}</label
                      >
                      <div class="space-y-3">
                        <div
                          v-for="(item, index) in formData.rechargeAmounts"
                          :key="index"
                          class="flex items-end gap-3"
                        >
                          <!-- Recharge Amount -->
                          <div class="flex-1">
                            <label class="mb-1 block text-xs text-gray-600"
                              >{{ $t('activity.formModal.k5145') }}</label
                            >
                            <n-input
                              v-model:value="item.betAmount"
                              :placeholder="$t('activity.formModal.k5145')"
                              :class="{
                                'border-red-500':
                                  item.betAmount === '' ||
                                  item.betAmount === null,
                              }"
                            />
                            <div
                              v-if="
                                item.betAmount === '' || item.betAmount === null
                              "
                              class="mt-1 text-xs text-red-500"
                            >{{ $t('activity.formModal.k4e0d3') }}</div>
                          </div>

                          <!-- Reward Amount -->
                          <div class="flex-1">
                            <label class="mb-1 block text-xs text-gray-600"
                              >{{ $t('activity.formModal.k5956') }}</label
                            >
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
                          </n-icon>{{ $t('activity.formModal.k6dfb9') }}</n-button>
                      </div>
                    </div>
                  </template>

                  <!-- Custom Type Configuration -->
                  <div
                    v-if="formData.activityType === 'custom'"
                    class="space-y-6"
                  >
                    <div class="border-l-4 border-blue-500 pl-4">
                      <h3 class="mb-4 text-lg font-semibold text-gray-900">{{ $t('activity.formModal.k81ea2') }}</h3>

                      <!-- Display Method -->
                      <div class="mb-6">
                        <label
                          class="mb-3 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k5c556') }}<span class="text-red-500">*</span>
                        </label>
                        <n-radio-group
                          v-model:value="formData.customDisplayMethod"
                        >
                          <n-space>
                            <n-radio value="builtin_page">{{ $t('activity.formModal.k5185') }}</n-radio>
                            <n-radio value="jump_link">{{ $t('activity.formModal.k8df3') }}</n-radio>
                          </n-space>
                        </n-radio-group>
                      </div>

                      <!-- Built-in page rich content -->
                      <div
                        v-if="formData.customDisplayMethod === 'builtin_page'"
                        class="mb-6"
                      >
                        <label
                          class="mb-3 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k9875') }}<span class="text-red-500">*</span>
                        </label>
                        <RichTextEditor
                          v-model="formData.customPageContent"
                          :max-length="50000"
                          :height="420"
                          :placeholder="$t('activity.formModal.k7f16k652fk56fek6587k8868')"
                        />
                      </div>

                      <!-- Select Page (shown when jump_link is selected) -->
                      <div
                        v-if="formData.customDisplayMethod === 'jump_link'"
                        class="mb-6"
                      >
                        <label
                          class="mb-3 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k90097') }}<span class="text-red-500">*</span>
                        </label>
                        <n-radio-group v-model:value="formData.customJumpType">
                          <n-space vertical>
                            <n-radio value="external_link">{{ $t('activity.formModal.k5916') }}</n-radio>
                            <n-radio value="activity">{{ $t('activity.rewardReport.k6d3b3') }}</n-radio>
                            <n-radio value="task">{{ $t('activity.rewardReport.k4efb') }}</n-radio>
                            <n-radio value="recharge">{{ $t('activity.detailModal.k5145') }}</n-radio>
                            <n-radio value="rebate">{{ $t('activity.rewardReport.k8fd4') }}</n-radio>
                            <n-radio value="agent">{{ $t('activity.detailModal.k4ee3') }}</n-radio>
                            <n-radio value="vip">VIP</n-radio>
                            <n-radio value="interest_treasure">{{ $t('activity.rewardReport.k5229') }}</n-radio>
                            <n-radio value="provident_fund">{{ $t('activity.rewardReport.k516c') }}</n-radio>
                            <n-radio value="blind_box_draw">{{ $t('activity.rewardReport.k76f2') }}</n-radio>
                            <n-radio value="to_be_claimed">{{ $t('activity.formModal.k5f85') }}</n-radio>
                            <n-radio value="claim_record">{{ $t('activity.formModal.k98864') }}</n-radio>
                            <n-radio value="personal_promotion_link"
                              >{{ $t('activity.formModal.k4e2a') }}</n-radio
                            >
                            <n-radio value="cooperative_operation"
                              >{{ $t('activity.formModal.k5408') }}</n-radio
                            >
                          </n-space>
                        </n-radio-group>
                      </div>

                      <!-- Link Configuration (shown when external_link is selected) -->
                      <div
                        v-if="formData.customJumpType === 'external_link'"
                        class="mb-6"
                      >
                        <label
                          class="mb-3 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k94fe') }}<span class="text-red-500">*</span>
                        </label>
                        <div class="flex items-center gap-3">
                          <n-select
                            v-model:value="formData.customOpenInNewWindow"
                            :options="[
                              {
                                label: $t('activity.formModal.k65b03'),
                                value: 'true',
                                type: 'option',
                              },
                              {
                                label: $t('activity.formModal.k5f533'),
                                value: 'false',
                                type: 'option',
                              },
                            ]"
                            class="w-32"
                          />
                          <n-input
                            v-model:value="formData.customTargetUrl"
                            :placeholder="$t('activity.formModal.enterLinkAddress')"
                            class="flex-1"
                            :status="getCustomUrlStatus()"
                            @blur="validateCustomUrl"
                          />
                        </div>
                      </div>

                      <!-- Information Message -->
                      <div
                        class="rounded-lg border border-orange-200 bg-orange-50 p-3"
                      >
                        <div class="flex items-start">
                          <n-icon size="16" class="mr-2 mt-0.5 text-orange-500">
                            <InformationCircle />
                          </n-icon>
                          <span class="text-sm text-orange-700">{{ $t('activity.formModal.k70b9k5219') }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column -->
              <div class="flex w-80 flex-col border-l border-gray-200 pl-6">
                <!-- Display Management -->
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <label class="block text-sm font-medium text-gray-700"
                      >{{ $t('activity.formModal.k5c557') }}</label
                    >
                    <n-switch v-model:value="formData.displayEnabled" />
                  </div>

                  <!-- Homepage Display -->
             

                  <!-- Participation Method -->
                  <div>
                    <label class="mb-2 block text-sm font-medium text-gray-700"
                      >{{ $t('activity.formModal.k53c2') }}</label
                    >
                    <n-radio-group v-model:value="formData.participationMethod">
                      <n-space>
                        <n-radio value="auto">{{ $t('activity.formModal.k81ea3') }}</n-radio>
                        <n-radio value="manual_click">{{ $t('activity.formModal.k97002') }}</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>

                  <!-- Recharge Methods -->
                  <div>
                    <label class="mb-2 block text-sm font-medium text-gray-700"
                      >{{ $t('activity.labels.luyqxz7') }}</label
                      >
                    <n-checkbox-group
                      v-model:value="formData.rechargeMethods"
                      @update:value="handleRechargeMethodChange"
                    >
                      <div class="grid grid-cols-2 gap-2">
                        <n-checkbox value="all">{{ $t('activity.formModal.k51683') }}</n-checkbox>
                        <n-checkbox value="pix">PIX</n-checkbox>
                        <n-checkbox value="customer_service"
                          >{{ $t('activity.formModal.k5ba23') }}</n-checkbox
                        >
                        <n-checkbox value="merchant">{{ $t('activity.formModal.k94f6') }}</n-checkbox>
                      </div>
                    </n-checkbox-group>
                  </div>

                  <!-- Bonus Method -->
                  <div>
                    <label class="mb-2 block text-sm font-medium text-gray-700"
                      >{{ $t('activity.formModal.k59568') }}</label
                    >
                    <n-radio-group v-model:value="formData.bonusMethod">
                      <n-space>
                        <n-radio value="fixed">{{ $t('activity.formModal.k56fa3') }}</n-radio>
                        <n-radio value="random">{{ $t('activity.formModal.k968f') }}</n-radio>
                        <n-radio value="percentage">{{ $t('activity.formModal.k6bd42') }}</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>
                </div>
              </div>
            </div>
          </n-tab-pane>

          <!-- Tab 2: Restrictions & Conditions -->
          <n-tab-pane name="restrictions" :tab="$t('activity.formModal.k9650')">
            <div class="flex gap-6">
              <!-- Left Column -->
              <div class="flex-1 pr-4">
                <div class="space-y-6">
                  <!-- Additional Restrictions -->
                  <div>
                    <label class="mb-3 block text-sm font-medium text-gray-700"
                      >{{ $t('activity.formModal.k66f42') }}</label
                    >
                    <n-checkbox-group v-model:value="formData.restrictions">
                      <div class="grid grid-cols-2 gap-2">
                        <n-checkbox value="phone_verified"
                          >{{ $t('activity.formModal.k5b8c') }}</n-checkbox
                        >
                        <n-checkbox value="complete_email"
                          >{{ $t('activity.formModal.k5b8c2') }}</n-checkbox
                        >
                        <n-checkbox value="bank_card"
                          >{{ $t('activity.formModal.k5b8c3') }}</n-checkbox
                        >
                        <n-checkbox value="complete_recharge"
                          >{{ $t('activity.formModal.k5b8c4') }}</n-checkbox
                        >
                        <n-checkbox value="bind_currency"
                          >{{ $t('activity.formModal.k7ed1') }}</n-checkbox
                        >
                        <n-checkbox value="three_party"
                          >{{ $t('activity.formModal.k7ed12') }}</n-checkbox
                        >
                        <n-checkbox value="complete_birthday"
                          >{{ $t('activity.formModal.k5b8c5') }}</n-checkbox
                        >
                        <n-checkbox value="bind_payment"
                          >{{ $t('activity.formModal.k7ed13') }}</n-checkbox
                        >
                        <n-checkbox value="real_name"
                          >{{ $t('activity.formModal.k5b8c6') }}</n-checkbox
                        >
                        <n-checkbox value="game_experience"
                          >{{ $t('activity.formModal.k586b') }}</n-checkbox
                        >
                        <n-checkbox value="same_activity"
                          >{{ $t('activity.formModal.k540c') }}</n-checkbox
                        >
                        <n-checkbox value="charge_after_complete"
                          >{{ $t('activity.formModal.k51456') }}</n-checkbox
                        >
                        <n-checkbox value="same_ip"
                          >{{ $t('activity.formModal.k540c2') }}</n-checkbox
                        >
                        <!-- 🎯 NEW: Additional restrictions from Screenshot 2 -->
                        <n-checkbox value="complete_kyc"
                          >{{ $t('activity.formModal.k5b8c7') }}</n-checkbox
                        >
                        <n-checkbox value="bind_currency_third_party"
                          >{{ $t('activity.formModal.k7ed14') }}</n-checkbox
                        >
                        <n-checkbox value="complete_recharge_education"
                          >{{ $t('activity.formModal.k5b8c8') }}</n-checkbox
                        >
                        <n-checkbox value="complete_bet_education"
                          >{{ $t('activity.formModal.k5b8c9') }}</n-checkbox
                        >
                        <n-checkbox value="same_ip_device"
                          >{{ $t('activity.formModal.k540c3') }}</n-checkbox
                        >
                        <n-checkbox value="network_verification"
                          >{{ $t('activity.formModal.k7f51') }}</n-checkbox
                        >
                        <n-checkbox value="same_ip_limit"
                          >{{ $t('activity.formModal.k540c2') }}</n-checkbox
                        >
                        <n-checkbox value="device_binding_limit"
                          >{{ $t('activity.formModal.k540c4') }}</n-checkbox
                        >
                        <n-checkbox value="phone_number_uniqueness"
                          >{{ $t('activity.formModal.k624b') }}</n-checkbox
                        >
                        <n-checkbox value="physical_verification"
                          >{{ $t('activity.formModal.k7269') }}</n-checkbox
                        >
                        <n-checkbox value="location_verification"
                          >{{ $t('activity.formModal.k5730') }}</n-checkbox
                        >
                        <n-checkbox value="payment_method_verification"
                          >{{ $t('activity.formModal.k652f') }}</n-checkbox
                        >
                      </div>
                    </n-checkbox-group>
                  </div>

                  <!-- Audit Multiplier Configuration -->
                  <div>
                    <label class="mb-3 block text-sm font-medium text-gray-700"
                      >{{ $t('activity.formModal.k7a3d') }}</label
                    >
                    <div class="grid grid-cols-2 gap-4">
                      <!-- Audit Required -->
                      <div>
                        <label class="mb-1 block text-xs text-gray-600"
                          >{{ $t('activity.formModal.k662f6') }}</label
                        >
                        <n-switch
                          v-model:value="formData.auditSettings.auditRequired"
                        >
                          <template #checked>{{ $t('activity.formModal.k97003') }}</template>
                          <template #unchecked>{{ $t('activity.formModal.k65e02') }}</template>
                        </n-switch>
                      </div>

                      <!-- Audit Multiplier -->
                      <div>
                        <label class="mb-1 block text-xs text-gray-600"
                          >{{ $t('activity.formModal.k7a3d2') }}</label
                        >
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
                          <template #suffix>{{ $t('activity.formModal.k500d') }}</template>
                        </n-input-number>
                      </div>

                      <!-- Audit Completion Time removed - fixed to 24 hours -->

                      <!-- Manual Review Required -->
                      <div>
                        <label class="mb-1 block text-xs text-gray-600"
                          >{{ $t('activity.formModal.k4eba') }}</label
                        >
                        <n-switch
                          v-model:value="
                            formData.auditSettings.auditManualReviewRequired
                          "
                          :disabled="!formData.auditSettings.auditRequired"
                        >
                          <template #checked>{{ $t('activity.formModal.k97004') }}</template>
                          <template #unchecked>{{ $t('activity.formModal.k81ea4') }}</template>
                        </n-switch>
                      </div>
                    </div>

                    <!-- Audit Description -->
                    <div
                      v-if="formData.auditSettings.auditRequired"
                      class="mt-3 rounded-lg bg-blue-50 p-3"
                    >
                      <p class="text-xs text-blue-600">
                        <i class="fa fa-info-circle mr-1"></i>{{ $t('activity.formModal.k7a3dk7528') }}<strong
                          >{{
                            $t('activity.common.auditMultiplierSuffix', [
                              (formData.auditSettings.auditMultiplier || 1).toFixed(1),
                            ])
                          }}</strong
                        >{{ $t('activity.formModal.k59569') }}</p>
                    </div>
                  </div>

                  <!-- Member Participation -->
                  <div>
                    <div class="mb-3 flex flex-wrap items-center gap-2">
                      <span class="text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k53c22') }}</span
                      >
                      <n-button
                        v-for="level in memberLevelButtons"
                        :key="level.value"
                        :type="
                          formData.memberLevel === level.value
                            ? 'primary'
                            : 'default'
                        "
                        size="small"
                        :disabled="memberTiersLoading"
                        @click="formData.memberLevel = level.value"
                        class="text-xs"
                      >
                        {{ level.label }}
                      </n-button>
                    </div>
                    <div
                      v-if="memberTiersLoading"
                      class="text-sm text-gray-500"
                    >{{ $t('activity.formModal.k52a0') }}</div>
                    <div
                      v-else-if="memberTierOptions.length === 0"
                      class="text-sm text-gray-500"
                    >{{ $t('activity.formModal.k6682k8bf7') }}</div>
                    <template v-else>
                      <n-checkbox
                        class="mb-2"
                        :checked="allMemberTiersSelected"
                        :indeterminate="memberTagsIndeterminate"
                        @update:checked="onToggleAllMemberTiers"
                      >{{ $t('activity.formModal.k51683') }}</n-checkbox>
                      <n-checkbox-group v-model:value="formData.memberTags">
                        <div class="grid grid-cols-4 gap-2">
                          <n-checkbox
                            v-for="opt in memberTierOptions"
                            :key="opt.id"
                            :value="opt.id"
                          >
                            {{ opt.label }}
                          </n-checkbox>
                        </div>
                      </n-checkbox-group>
                    </template>
                  </div>

                  <!-- Platform Restrictions -->
                  <div>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          class="mb-2 block text-sm font-medium text-gray-700"
                          >{{ $t('activity.formModal.k595610') }}</label
                        >
                        <n-radio-group
                          v-model:value="formData.platformRestriction"
                        >
                          <n-space vertical>
                            <n-radio value="no_limit">{{ $t('activity.formModal.k4e0d4') }}</n-radio>
                            <n-radio value="only_selected"
                              >{{ $t('activity.formModal.k4ec52') }}</n-radio
                            >
                            <n-radio value="exclude_selected"
                              >{{ $t('activity.formModal.k6392') }}</n-radio
                            >
                          </n-space>
                        </n-radio-group>
                      </div>

                      <div>
                        <label
                          class="mb-2 block text-sm font-medium text-gray-700"
                          >{{ $t('activity.formModal.k595611') }}</label
                        >
                        <n-radio-group
                          v-model:value="formData.withdrawalRestriction"
                        >
                          <n-space vertical>
                            <n-radio value="no_limit">{{ $t('activity.formModal.k4e0d4') }}</n-radio>
                            <n-radio value="only_selected"
                              >{{ $t('activity.formModal.k4ec53') }}</n-radio
                            >
                          </n-space>
                        </n-radio-group>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column -->
              <div class="flex w-80 flex-col border-l border-gray-200 pl-6">
                <!-- Channel & Transfer Settings -->
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <label class="block text-sm font-medium text-gray-700"
                      >{{ $t('activity.formModal.k63072') }}</label
                    >
                    <n-switch v-model:value="formData.specifyChannel" />
                  </div>

                  <div class="flex items-center justify-between">
                    <label class="block text-sm font-medium text-gray-700"
                      >{{ $t('activity.formModal.k8be6') }}</label
                    >
                    <n-switch v-model:value="formData.detailPageTime" />
                  </div>

                  <div>
                    <label class="mb-2 block text-sm font-medium text-gray-700"
                      >{{ $t('activity.formModal.k8f6c') }}</label
                    >
                    <n-input
                      v-model:value="formData.transferMethod"
                      :placeholder="$t('activity.formModal.k53ea')"
                    />
                  </div>

                  <div>
                    <label class="mb-2 block text-sm font-medium text-gray-700"
                      >{{ $t('activity.formModal.k8f6c2') }}</label
                    >
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
          <n-tab-pane name="design" :tab="$t('activity.formModal.k8bbe')">
            <div class="flex gap-6">
              <!-- Left Column -->
              <div class="flex-1 pr-4">
                <!-- Background Color Selection -->
                <div class="mb-6">
                  <label class="mb-3 block text-sm font-medium text-gray-700"
                    >{{ $t('activity.formModal.k90098') }}</label
                  >
                  <div class="grid grid-cols-8 gap-2">
                    <div
                      v-for="color in backgroundColors"
                      :key="color.value"
                      class="h-8 w-8 cursor-pointer rounded border-2"
                      :class="
                        formData.backgroundColor === color.value
                          ? 'border-blue-500'
                          : 'border-gray-200'
                      "
                      :style="{ backgroundColor: color.value }"
                      @click="formData.backgroundColor = color.value"
                    ></div>
                  </div>
                </div>

                <!-- Icon Selection -->
                <div class="mb-6">
                  <label class="mb-3 block text-sm font-medium text-gray-700"
                    >{{ $t('activity.formModal.k9009') }}</label
                  >
                  <div class="mb-3 grid grid-cols-5 gap-2">
                    <div
                      v-for="icon in activityIcons"
                      :key="icon.id"
                      class="flex aspect-square cursor-pointer items-center justify-center rounded border text-xs"
                      :class="
                        formData.selectedIcon === icon.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      "
                      @click="formData.selectedIcon = icon.id"
                    >
                      {{ icon.label }}
                    </div>
                  </div>
                  <n-button size="small" @click="openIconUpload" block>{{ $t('activity.detailModal.k81ea') }}</n-button>
                </div>

                <!-- Platform Selection -->
                <div class="mb-6">
                  <label class="mb-3 block text-sm font-medium text-gray-700"
                    >{{ $t('activity.formModal.k6d3b3') }}</label
                  >
                  <n-checkbox-group v-model:value="formData.platforms">
                    <div class="grid grid-cols-2 gap-2">
                      <n-checkbox value="android_app"
                        >{{ $t('activity.formModal.androidAPP') }}</n-checkbox
                      >
                      <n-checkbox value="ios_app">{{ $t('activity.formModal.iOSAPP') }}</n-checkbox>
                      <n-checkbox value="native_app">{{ $t('activity.formModal.k539f') }}</n-checkbox>
                      <n-checkbox value="browser_app">{{ $t('activity.formModal.k6781') }}</n-checkbox>
                      <n-checkbox value="pwa_app">{{ $t('activity.formModal.pWAAPP') }}</n-checkbox>
                      <n-checkbox value="ios_browser">{{ $t('activity.detailModal.iOS2') }}</n-checkbox>
                      <n-checkbox value="pc_browser">{{ $t('activity.formModal.pC') }}</n-checkbox>
                      <n-checkbox value="android_h5"
                        >{{ $t('activity.formModal.androidH5') }}</n-checkbox
                      >
                      <n-checkbox value="ios_h5">{{ $t('activity.formModal.iOSH5') }}</n-checkbox>
                    </div>
                  </n-checkbox-group>
                </div>
              </div>

              <!-- Right Column -->
              <div
                class="flex w-80 flex-col space-y-6 border-l border-gray-200 pl-6"
              >
                <!-- Promotion Image -->
                <div>
                  <label class="mb-3 block text-sm font-medium text-gray-700"
                    >{{ $t('activity.formModal.k5ba3') }}</label
                  >
                  <MediaLibrarySelector
                    v-model="formData.promoImage"
                    category="promotion"
                    :placeholder="$t('activity.formModal.k90092')"
                    @change="handlePromoImageChange"
                  />
                  <div class="mt-1 text-xs text-gray-500">{{ $t('activity.formModal.k5efa750x400') }}</div>
                </div>

                <!-- Floating Icon Configuration -->
                <div>
                  <div class="mb-3 flex items-center justify-between">
                    <label class="block text-sm font-medium text-gray-700"
                      >{{ $t('activity.formModal.k60ack539f') }}</label
                    >
                    <div class="flex items-center gap-2">
                      <n-switch v-model:value="formData.floatingIcon.enabled" />
                      <n-checkbox
                        v-model:checked="formData.floatingIcon.showActivityName"
                        size="small"
                        >{{ $t('activity.formModal.k663e2') }}</n-checkbox
                      >
                    </div>
                  </div>

                  <!-- Floating Icon Settings (shown when enabled) -->
                  <div
                    v-if="formData.floatingIcon.enabled"
                    class="space-y-4 rounded-lg bg-gray-50 p-4"
                  >
                    <!-- Display Time Settings -->
                    <div class="flex items-center justify-between">
                      <label class="block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k663e3') }}</label
                      >
                      <div class="flex items-center gap-2">
                        <n-switch
                          v-model:value="
                            formData.floatingIcon.timeDisplay.enabled
                          "
                          size="small"
                        />
                        <span class="text-xs text-gray-500">{{ $t('activity.formModal.k5173') }}</span>
                      </div>
                    </div>

                    <!-- Display Terminals -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >
                        <span class="text-red-500">*</span>{{ $t('activity.formModal.k5c558') }}</label>
                      <div class="grid grid-cols-2 gap-1 text-xs">
                        <n-checkbox
                          v-model:checked="
                            formData.floatingIcon.terminals.android_app
                          "
                          size="small"
                          >Android_APP</n-checkbox
                        >
                        <n-checkbox
                          v-model:checked="
                            formData.floatingIcon.terminals.ios_app
                          "
                          size="small"
                          >iOS_APP</n-checkbox
                        >
                        <n-checkbox
                          v-model:checked="
                            formData.floatingIcon.terminals.native_app
                          "
                          size="small"
                          >{{ $t('activity.formModal.k539f') }}</n-checkbox
                        >
                        <n-checkbox
                          v-model:checked="
                            formData.floatingIcon.terminals.extreme_app
                          "
                          size="small"
                          >{{ $t('activity.formModal.k6781') }}</n-checkbox
                        >
                        <n-checkbox
                          v-model:checked="
                            formData.floatingIcon.terminals.wechat_app
                          "
                          size="small"
                          >{{ $t('activity.formModal.k9a6c') }}</n-checkbox
                        >
                        <n-checkbox
                          v-model:checked="
                            formData.floatingIcon.terminals.pwa_app
                          "
                          size="small"
                          >{{ $t('activity.formModal.pWAAPP') }}</n-checkbox
                        >
                        <n-checkbox
                          v-model:checked="
                            formData.floatingIcon.terminals.ios_webapp
                          "
                          size="small"
                          >{{ $t('activity.formModal.iOS') }}</n-checkbox
                        >
                        <n-checkbox
                          v-model:checked="formData.floatingIcon.terminals.pc"
                          size="small"
                          >PC</n-checkbox
                        >
                        <n-checkbox
                          v-model:checked="
                            formData.floatingIcon.terminals.android_h5
                          "
                          size="small"
                          >Android_H5</n-checkbox
                        >
                        <n-checkbox
                          v-model:checked="
                            formData.floatingIcon.terminals.ios_h5
                          "
                          size="small"
                          >iOS_H5</n-checkbox
                        >
                      </div>
                    </div>

                    <!-- Display Method -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >
                        <span class="text-red-500">*</span>{{ $t('activity.formModal.k5c556') }}</label>
                      <n-radio-group
                        v-model:value="formData.floatingIcon.displayMethod"
                        size="small"
                      >
                        <n-space vertical>
                          <n-radio value="carousel"
                            >{{ $t('activity.formModal.k53e0k9ed8') }}</n-radio
                          >
                          <n-radio value="single">{{ $t('activity.formModal.k53552') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Display Position -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k5c559') }}</label
                      >
                      <n-radio-group
                        v-model:value="formData.floatingIcon.position"
                        size="small"
                      >
                        <n-space>
                          <n-radio value="bottom-left">{{ $t('activity.formModal.k5de6') }}</n-radio>
                          <n-radio value="bottom-right">{{ $t('activity.formModal.k53f3') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Display Pages -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k5c5510') }}</label
                      >
                      <div class="flex items-center gap-4">
                        <n-radio
                          v-model:checked="formData.floatingIcon.pages.homepage"
                          size="small"
                          >{{ $t('activity.formModal.k4ec54') }}</n-radio
                        >
                        <span class="text-xs text-gray-500"
                          >{{ $t('activity.formModal.k4efb2') }}</span
                        >
                      </div>
                    </div>

                    <!-- Background Image -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                        >{{ $t('activity.formModal.k662f7') }}</label
                      >
                      <n-radio-group
                        v-model:value="formData.floatingIcon.showBackground"
                        size="small"
                      >
                        <n-space>
                          <n-radio value="show">{{ $t('activity.formModal.k5c5511') }}</n-radio>
                          <n-radio value="hide">{{ $t('activity.formModal.k4e0d5') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Icon Selection -->
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >
                        <span class="text-red-500">*</span>{{ $t('activity.formModal.k9009') }}</label>
                      <n-radio-group
                        v-model:value="formData.floatingIcon.iconType"
                        size="small"
                      >
                        <n-space>
                          <n-radio value="general">{{ $t('activity.formModal.k5168k63a8') }}</n-radio>
                          <n-radio value="language">{{ $t('activity.formModal.k63093') }}</n-radio>
                        </n-space>
                      </n-radio-group>
                    </div>

                    <!-- Language Tabs for Icon Upload -->
                    <div v-if="formData.floatingIcon.iconType === 'language'">
                      <n-tabs
                        v-model:value="formData.floatingIcon.activeLanguageTab"
                        type="segment"
                        size="small"
                      >
                        <n-tab-pane name="pt" :tab="$t('activity.formModal.k8461')">
                          <div class="space-y-2">
                            <MediaLibrarySelector
                              v-model="formData.floatingIcon.icons.pt"
                              category="floating-icon"
                              :placeholder="$t('activity.formModal.k90093')"
                            />
                            <div class="text-xs text-gray-500">{{ $t('activity.formModal.k683cPngJpegJpgGifk5c3a220pxk5927') }}<1MB
                            </div>
                          </div>
                        </n-tab-pane>
                        <n-tab-pane name="zh" :tab="$t('activity.formModal.k7b80')">
                          <div class="space-y-2">
                            <MediaLibrarySelector
                              v-model="formData.floatingIcon.icons.zh"
                              category="floating-icon"
                              :placeholder="$t('activity.formModal.k90094')"
                            />
                            <div class="text-xs text-gray-500">{{ $t('activity.formModal.k683cPngJpegJpgGifk5c3a220pxk5927') }}<1MB
                            </div>
                          </div>
                        </n-tab-pane>
                      </n-tabs>
                    </div>

                    <!-- General Icon Upload -->
                    <div v-else class="space-y-3">
                      <MediaLibrarySelector
                        v-model="formData.floatingIcon.icons.general"
                        category="floating-icon"
                        :placeholder="$t('activity.formModal.k90095')"
                      />
                      <div class="text-xs text-gray-500">{{ $t('activity.formModal.k683cPngJpegJpgGifk5c3a220pxk5927') }}<1MB
                      </div>

                      <!-- Preset Icons -->
                      <div class="mt-3">
                        <div class="grid grid-cols-7 gap-1">
                          <div
                            v-for="(icon, index) in presetIcons"
                            :key="index"
                            @click="selectPresetIcon(icon)"
                            :class="[
                              'cursor-pointer rounded border-2 p-1 transition-colors hover:border-blue-500',
                              formData.floatingIcon.selectedPresetIcon ===
                              icon.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200',
                            ]"
                          >
                            <img
                              :src="icon.url"
                              :alt="icon.name"
                              class="h-auto w-full"
                            />
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
          <n-tab-pane name="rules" :tab="$t('activity.formModal.k89c4')">
            <div class="flex gap-6">
              <!-- Left Column -->
              <div class="flex-1 pr-4">
                <div class="space-y-4">
                  <div class="mb-2 flex items-center justify-between">
                    <label class="block text-sm font-medium text-gray-700"
                      >{{ $t('activity.formModal.k89c4') }}</label
                    >
                    <n-select
                      v-model:value="formData.ruleTemplate"
                      :placeholder="$t('activity.detailModal.k81ea')"
                      :options="ruleTemplateOptions"
                      class="w-32"
                    />
                  </div>
                  <n-input
                    v-if="formData.ruleTemplate === 'custom'"
                    v-model:value="formData.rules"
                    type="textarea"
                    :placeholder="$t('activity.formModal.k8bf7TC')"
                    :rows="14"
                    :maxlength="10000"
                    show-count
                  />
                  <div
                    v-else
                    class="rounded-lg border border-gray-200 bg-gray-50 p-4"
                  >
                    <div class="mb-2 text-xs font-medium text-gray-500">{{ $t('activity.formModal.k7cfb3') }}</div>
                    <pre
                      class="m-0 whitespace-pre-wrap text-sm leading-relaxed text-gray-700"
                    >{{ systemRulesPreview }}</pre>
                  </div>
                </div>
              </div>

              <!-- Right Column - Rules preview -->
              <div class="w-80 border-l border-gray-200 pl-6">
                <div class="mb-2 text-sm font-medium text-gray-700">{{ $t('activity.formModal.k89c42') }}</div>
                <div
                  v-if="formData.ruleTemplate === 'custom' && formData.rules"
                  class="activity-rules-preview activity-rules-preview--system"
                >
                  {{ formData.rules }}
                </div>
                <div
                  v-else-if="formData.ruleTemplate === 'system'"
                  class="activity-rules-preview activity-rules-preview--system"
                >
                  {{ systemRulesPreview }}
                </div>
                <div v-else class="text-center text-sm text-gray-400">{{ $t('activity.formModal.k6682') }}</div>
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>
    </div>

    <!-- Footer -->
    <template #action>
      <div class="flex w-full items-center justify-between">
        <n-button @click="handleCancel">{{ $t('activity.activityList.k5173') }}</n-button>
        <div class="flex gap-2">
          <n-button @click="handleSaveDraft" :loading="submitting">{{ $t('activity.formModal.k4fdd') }}</n-button>
          <n-button type="primary" @click="handleSubmit" :loading="submitting">{{ $t('activity.formModal.k4fdd2') }}</n-button>
        </div>
      </div>
    </template>
  </n-modal>

  <!-- Translation Modal -->
  <n-modal
    v-model:show="translationModalShow"
    preset="card"
    :title="$t('activity.formModal.k591a')"
    style="width: 600px"
  >
    <div class="space-y-4">
      <div v-for="lang in languages" :key="lang.code" class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">{{
          lang.name
        }}</label>
        <n-input
          v-model:value="formData.translations[lang.code]"
          :placeholder="$t('activity.formModal.enterLangActivityName', [lang.name])"
        />
      </div>
    </div>
    <template #footer>
      <n-space justify="end">
        <n-button @click="translationModalShow = false">{{ $t('activity.activityList.k53d6') }}</n-button>
        <n-button type="primary" @click="saveTranslations">{{ $t('activity.formModal.k786e') }}</n-button>
      </n-space>
    </template>
  </n-modal>

  <!-- Icon Upload Modal -->
  <n-modal
    v-model:show="iconUploadModalShow"
    preset="card"
    :title="$t('activity.formModal.k81ea')"
    style="width: 500px"
  >
    <n-upload
      :file-list="customIconList"
      :default-upload="false"
      accept="image/*"
      @change="handleCustomIconChange"
    >
      <n-upload-dragger>
        <div class="py-4 text-center">
          <n-icon size="48" class="mb-2 text-gray-400">
            <CloudUpload />
          </n-icon>
          <p class="text-sm text-gray-600">{{ $t('activity.formModal.k70b92') }}</p>
        </div>
      </n-upload-dragger>
    </n-upload>
    <template #footer>
      <n-space justify="end">
        <n-button @click="iconUploadModalShow = false">{{ $t('activity.activityList.k53d6') }}</n-button>
        <n-button type="primary" @click="saveCustomIcon">{{ $t('activity.formModal.k786e') }}</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

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
  useMessage,
} from 'naive-ui';
import {
  CloudUpload,
  CloudUploadOutline,
  HelpCircle,
  Close,
  Add,
  InformationCircle,
} from '@vicons/ionicons5';
import { useAppConfig } from '@vben/hooks';
import { useAccessStore } from '@vben/stores';
import { createActivity, updateActivityV2 } from '#/api/activity';
import { useDisplayTimezone } from '#/composables/useDisplayTimezone';
import type { Activity, CreateActivityInput } from '#/api/activity';
import { useActiveMemberTiers } from '#/composables/useActiveMemberTiers';
import {
  memberGroupsFromTierIds,
  resolveMemberTierIdsFromConfig,
} from '#/utils/activityMemberTier';

// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking modal load
import { defineAsyncComponent } from 'vue';
const MediaLibrarySelector = defineAsyncComponent(
  () => import('#/components/MediaLibrarySelector.vue'),
);
const RichTextEditor = defineAsyncComponent(
  () => import('#/components/common/RichTextEditor.vue'),
);
const PlatformGameSelector = defineAsyncComponent(
  () => import('#/components/activity/PlatformGameSelector.vue'),
);
const Label = defineAsyncComponent(
  () =>
    import(
      '../../../../../../packages/@core/ui-kit/shadcn-ui/src/ui/label/Label.vue'
    ),
);

// Props
interface Props {
  show: boolean;
  editingItem?: Activity | null;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  editingItem: null,
});

// Emits
const emit = defineEmits<{
  'update:show': [value: boolean];
  success: [];
}>();

// Composables
const message = useMessage();
const { timezone } = useDisplayTimezone();
const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);
const accessStore = useAccessStore();

/** Same path as backend `GET /api/activities/promotion/template/download` */
function resolvePromotionTemplateDownloadUrl(): string {
  const path = '/api/activities/promotion/template/download';
  // Dev: use Vite proxy (same origin as admin) so fetch works without CORS issues
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return `${window.location.origin}${path}`;
  }
  const raw = String(apiURL || '').trim();
  if (!raw) {
    return path;
  }
  if (raw.startsWith('/')) {
    return `${raw.replace(/\/+$/, '')}/activities/promotion/template/download`;
  }
  const base = raw.replace(/\/+$/, '');
  return `${base}/activities/promotion/template/download`;
}

// Red packet style options with preview images
const allRedPacketStyles = [
  {
    value: 'modal',
    label: $t('activity.rewardReport.k7ea2'),
    imageUrl:
      'https://media.cheshi8899.com/media/media-1758164088476-327616913-style0.126acc89cddaa21ea37c.avif',
  },
  {
    value: 'banner',
    label: $t('activity.formModal.k798f'),
    imageUrl:
      'https://media.cheshi8899.com/media/media-1758164096103-86127679-style3.0bebc3c7351d85ed90e6.avif',
  },
  {
    value: 'floating',
    label: $t('activity.formModal.k793c'),
    imageUrl:
      'https://media.cheshi8899.com/media/media-1758164105287-572717226-style2.300901be34962fe97975.avif',
  },
  {
    value: 'treasurechest',
    label: $t('activity.formModal.k5b9d'),
    imageUrl:
      'https://media.cheshi8899.com/media/media-1758164113679-778866272-style1.b0289469b16cd12697b4.avif',
  },
  {
    value: 'treasurechest2',
    label: $t('activity.formModal.k5b9d2'),
    imageUrl:
      'https://media.cheshi8899.com/media/media-1758164509457-995019276-style4.332d1817313bf49a4341.avif',
  },
];

// Helper functions for style preview
const getCurrentStyleImage = () => {
  const currentStyle = allRedPacketStyles.find(
    (style) => style.value === formData.redPacketDisplayStyle,
  );
  return currentStyle?.imageUrl || '';
};

const getCurrentStyleLabel = () => {
  const currentStyle = allRedPacketStyles.find(
    (style) => style.value === formData.redPacketDisplayStyle,
  );
  return currentStyle?.label || $t('activity.labels.unknownStyle');
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
      platformIds: [],
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
    actualRedPacketMax: 0.5,
    displayedRedPacketMin: 0.01,
    displayedRedPacketMax: 378.0,
    grabLimitPerPeriod: 1,
    dailyGrabLimitType: 'fixed',
    dailyGrabLimit: 3,
    totalGrabLimit: 1,
    expectedBonus: 1.0,
    redPacketTotalCountLimit: 1,
    redPacketDisplayStyle: 'modal',
    redPacketDailyDistributionTimes: [{ startTime: null, endTime: null }],
  });
};

// Reactive data
const modalShow = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value),
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
  transferMultiplier: 1.0,
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
  rechargeAmounts: [{ betAmount: '', rewardAmount: 0.0 }] as {
    betAmount: string;
    rewardAmount: number;
  }[],

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
    platformIds: [],
  },
  deductDiscounts: false,
  lossRange: 'yesterday',
  dailyRewardLimit: '',
  rescueDistributionMethod: 'self_claim_expire',
  rescueClaimTime: 'next_day',
  rescueSelectTime: null as number | null,
  rescueRewardExpiryDays: 1,
  rewardType: 'percentage',
  rescueRewardSettings: [{ lossAmount: '', returnRatio: 0.0 }] as {
    lossAmount: string;
    returnRatio: number;
  }[],
  newbieDaysLimit: 7,

  // Withdrawal Activity Specific Fields
  rewardCycle: 'daily',
  giftMode: 'pending_claim',
  claimMode: 'claim_individually',
  accumulateMode: 'per_slip',
  withdrawalRewardType: 'fixed',
  maxRewardAmount: '',
  withdrawalTiers: [{ withdrawMin: '', rewardValue: '' }] as {
    withdrawMin: string;
    rewardValue: string;
  }[],

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
    {
      type: 'fixed',
      rewardAmount: 0.0,
      rechargeRequirement: 0,
      wageringRequirement: 0,
      additionalReward: 0.0,
      checkinIcon: null,
    },
  ] as {
    type: string;
    rewardAmount: number;
    rechargeRequirement: number;
    wageringRequirement: number;
    additionalReward: number;
    checkinIcon: any;
  }[],

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
  luckywagerRewardSettings: [{ betSlipEnding: '', rewardAmount: '' }] as {
    betSlipEnding: string;
    rewardAmount: string;
  }[],

  // Red Packet Specific Fields
  redPacketType: 'fixed',
  redPacketClaimCondition: 'none',
  redPacketRewardType: 'fixed',
  securityVerification: false,
  redPacketTotalAmount: 1000,
  redPacketCountPerPeriod: 10000,
  actualRedPacketMin: 0.02,
  actualRedPacketMax: 0.5,
  displayedRedPacketMin: 0.01,
  displayedRedPacketMax: 378.0,
  grabLimitPerPeriod: 1,
  dailyGrabLimitType: 'fixed',
  dailyGrabLimit: 3,
  totalGrabLimit: 1,
  expectedBonus: 1.0,
  redPacketTotalCountLimit: 1,
  redPacketDisplayStyle: 'modal',
  redPacketDailyDistributionTimes: [{ startTime: null, endTime: null }],

  // Investment Specific Fields
  investmentType: 'fixed_amount',
  rewardDays: 3,
  investmentDistributionMethod: 'daily_auto',
  investmentSettings: [{ investmentAmount: '', giftAmount: '' }] as {
    investmentAmount: string;
    giftAmount: string;
  }[],

  // Promotion Specific Fields
  promotionAccumulatedRecharge: '',
  promotionAccumulatedRechargeDays: '',
  promotionAccumulatedRechargeCount: '',
  promotionAccumulatedWagering: '',
  promotionWageringPlatform: 'all_platforms',
  promotionWageringPlatformConfig: {
    selectedPlatforms: [],
    platformIds: [],
  },
  promotionDownloadAppLogin: false,
  promotionSameIPLimit: '',
  promotionSameDeviceLimit: '',
  promotionAllowSameTypeClaim: true,
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
  agentRewardSettings: [{ rebateAmount: '', rewardAmount: '' }] as {
    rebateAmount: string;
    rewardAmount: string;
  }[],

  // Return Bonus Specific Fields
  inactiveDaysMin: 7,
  rewardAmount: 0,
  requiresDeposit: false,
  minDepositAmount: 0,
  depositInactiveDaysMin: 7,
  depositRewardAmount: 0,

  // Ranking Specific Fields
  rankingMetric: 'wagering' as 'wagering' | 'recharge',
  rankingPeriod: 'daily' as 'daily' | 'weekly' | 'monthly',
  robotCount: 0,
  rankingRewards: [{ rankFrom: 1, rankTo: 1, rewardValue: 0 }] as {
    rankFrom: number;
    rankTo: number;
    rewardValue: number;
  }[],

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
    {
      redemptionCode: '',
      totalUsageCount: '',
      startTime: null as number | null,
      endTime: null as number | null,
    },
  ] as {
    redemptionCode: string;
    totalUsageCount: string;
    startTime: number | null;
    endTime: number | null;
  }[],
  newbieRewardSettings: [{ firstDepositAmount: '', rewardAmount: '' }] as {
    firstDepositAmount: string;
    rewardAmount: string;
  }[],
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
  customPageContent: '',
});

const allowClaimSamePromotionType = computed({
  get: () => !formData.restrictions.includes('same_activity'),
  set: (value: boolean) => {
    formData.promotionAllowSameTypeClaim = value;
    if (value) {
      formData.restrictions = formData.restrictions.filter(
        (item) => item !== 'same_activity',
      );
      return;
    }
    if (!formData.restrictions.includes('same_activity')) {
      formData.restrictions.push('same_activity');
    }
  },
});

// Options data
const activityTypes = [
  { label: $t('activity.detailModal.k5145'), value: 'recharge' },
  { label: $t('activity.detailModal.k6253'), value: 'wagering' },
  { label: $t('activity.detailModal.k6551'), value: 'rescue' },
  { label: $t('activity.detailModal.k7b7e'), value: 'checkin' },
  { label: $t('activity.detailModal.k5e78'), value: 'luckywager' },
  { label: $t('activity.rewardReport.k7ea2'), value: 'redpacket' },
  { label: $t('activity.detailModal.k6295'), value: 'investment' },
  { label: $t('activity.rewardReport.k63a8'), value: 'promotion' },
  { label: $t('activity.detailModal.k4ee3'), value: 'agent' },
  { label: $t('activity.detailModal.k96c6'), value: 'collect' },
  { label: $t('activity.detailModal.k7ade'), value: 'guessing' },
  { label: $t('activity.rewardReport.k65b02'), value: 'newbie' },
  { label: $t('activity.detailModal.k81ea'), value: 'custom' },
  { label: '提现活动', value: 'withdrawal' },
  { label: $t('activity.detailModal.k8f6f'), value: 'soft' },
  { label: '新砍一刀', value: 'newblade' },
  { label: '回归彩金', value: 'return_bonus' },
  { label: $t('activity.detailModal.k76f8'), value: 'ranking' },
  { label: '抽奖助力', value: 'lottery_assist' },
  { label: '新手救援金', value: 'newbie_rescue' },
];

const activityCategories = [
  { label: $t('activity.detailModal.k7efc'), value: 'comprehensive' },
  { label: $t('activity.detailModal.k68cb'), value: 'chess_cards' },
  { label: $t('activity.detailModal.k6355'), value: 'hunting' },
  { label: $t('activity.detailModal.k7535'), value: 'slot' },
  { label: $t('activity.detailModal.k771f'), value: 'live' },
  { label: $t('activity.detailModal.k4f53'), value: 'sports' },
  { label: $t('activity.detailModal.k6597'), value: 'cockfight' },
  { label: $t('activity.detailModal.k5f69'), value: 'lottery' },
  { label: $t('activity.detailModal.k89c6'), value: 'video' },
  { label: $t('activity.detailModal.k75352'), value: 'esports' },
  { label: $t('activity.detailModal.k684c'), value: 'table' },
  { label: $t('activity.detailModal.k8857'), value: 'arcade' },
  { label: $t('activity.detailModal.k6a21'), value: 'simulation' },
  { label: $t('activity.detailModal.k5176'), value: 'other' },
];

const currencyOptions = [
  { label: $t('activity.formModal.k51683'), value: 'all' },
  { label: 'BRL', value: 'BRL' },
];

const backgroundColors = [
  // Row 1
  { label: $t('activity.formModal.k9ed1'), value: '#000000' },
  { label: $t('activity.formModal.k7070'), value: '#6B7280' },
  { label: $t('activity.formModal.k70702'), value: '#9CA3AF' },
  { label: $t('activity.formModal.k9ed12'), value: '#1F2937' },
  { label: $t('activity.formModal.k9ed13'), value: '#374151' },
  { label: $t('activity.formModal.k9ed14'), value: '#111827' },
  { label: $t('activity.formModal.k9ed15'), value: '#0F172A' },
  // Row 2
  { label: $t('activity.formModal.k70703'), value: '#4B5563' },
  { label: $t('activity.formModal.k9ed16'), value: '#030712' },
  { label: $t('activity.formModal.k70704'), value: '#71717A' },
  { label: $t('activity.formModal.k9ed17'), value: '#18181B' },
  { label: $t('activity.formModal.k9ed18'), value: '#27272A' },
  { label: $t('activity.formModal.k9ed19'), value: '#3F3F46' },
  { label: $t('activity.formModal.k70705'), value: '#A1A1AA' },
  // Row 3
  { label: $t('activity.formModal.k70706'), value: '#52525B' },
  { label: $t('activity.formModal.k9ed110'), value: '#09090B' },
  { label: $t('activity.formModal.k70707'), value: '#D4D4D8' },
  { label: $t('activity.formModal.k70708'), value: '#E4E4E7' },
  { label: $t('activity.formModal.k70709'), value: '#F4F4F5' },
  { label: $t('activity.formModal.k84dd'), value: '#8B5FBF' },
];

const activityIcons = [
  { id: 'game', label: $t('activity.formModal.k6e38') },
  { id: 'award', label: $t('activity.formModal.k595612') },
  { id: 'activity', label: $t('activity.rewardReport.k6d3b3') },
  { id: 'daily', label: $t('activity.formModal.k82822') },
  { id: 'casino', label: $t('activity.formModal.k8d4c') },
  { id: 'sports', label: $t('activity.formModal.k7f8e') },
  { id: 'custom', label: $t('activity.detailModal.k81ea') },
];

const {
  tierOptions: memberTierOptions,
  allTierIds: allMemberTierIds,
  loading: memberTiersLoading,
  load: loadMemberTierOptions,
} = useActiveMemberTiers();

const memberLevelButtons = computed(() => [
  { label: $t('activity.formModal.k51684'), value: 'all' },
  ...memberTierOptions.value.map((tier) => ({
    label: tier.label,
    value: tier.id,
  })),
]);

const allMemberTiersSelected = computed(
  () =>
    allMemberTierIds.value.length > 0 &&
    allMemberTierIds.value.every((id) => formData.memberTags.includes(id)),
);

const memberTagsIndeterminate = computed(
  () =>
    formData.memberTags.length > 0 &&
    !allMemberTiersSelected.value,
);

function onToggleAllMemberTiers(checked: boolean) {
  formData.memberTags = checked ? [...allMemberTierIds.value] : [];
}

function applyMemberTierSelectionFromConfig(config: Record<string, unknown>) {
  formData.memberLevel = String(config.memberScope || 'all');
  formData.memberTags = resolveMemberTierIdsFromConfig(
    config,
    memberTierOptions.value,
  );
}

const languages = computed(() => [
  { code: 'zh-CN', name: $t('activity.formModal.langZhCN') },
  { code: 'en-US', name: 'English' },
  { code: 'pt-BR', name: 'Português' },
]);

const ruleTemplateOptions = [
  { label: $t('activity.detailModal.k81ea'), value: 'custom' },
  { label: $t('activity.formModal.k7cfb'), value: 'system' },
];

const systemRulesPreview = computed(() => {
  const typeLabel =
    activityTypes.find((t) => t.value === formData.activityType)?.label ||
    formData.activityType;
  return $t('activity.formModal.systemRulesAutoPreview', [typeLabel]);
});

/** 提交时：系统自带不传自定义规则，自定义模板传 T&C 文本 */
function resolveRulesForSubmit(): string {
  return formData.ruleTemplate === 'custom' ? formData.rules || '' : '';
}

const rewardTypeOptions = [
  { label: $t('activity.formModal.k56fa5'), value: 'fixed' },
  { label: $t('activity.formModal.k6bd43'), value: 'percentage' },
  { label: $t('activity.formModal.k968f3'), value: 'random' },
];

// Preset floating icons
const presetIcons = computed(() => [
  { id: 'gift1', name: $t('activity.formModal.floatingIconGift1'), url: '/uploads/icons/floating/gift1.png' },
  { id: 'bonus1', name: $t('activity.formModal.floatingIconBonus1'), url: '/uploads/icons/floating/bonus1.png' },
  {
    id: 'activity1',
    name: $t('activity.formModal.floatingIconActivity1'),
    url: '/uploads/icons/floating/activity1.png',
  },
  { id: 'vip1', name: 'VIP1', url: '/uploads/icons/floating/vip1.png' },
  {
    id: 'recharge1',
    name: $t('activity.formModal.floatingIconRecharge1'),
    url: '/uploads/icons/floating/recharge1.png',
  },
  {
    id: 'mission1',
    name: $t('activity.formModal.floatingIconTask1'),
    url: '/uploads/icons/floating/mission1.png',
  },
  { id: 'lucky1', name: $t('activity.formModal.floatingIconLucky1'), url: '/uploads/icons/floating/lucky1.png' },
]);

// File lists
const promoImageList = ref([]);
const customIconList = ref([]);

// Enum mapping functions to convert frontend values to backend schema
const mapFrontendToBackendRewardType = (frontendValue: string): string => {
  const mapping: Record<string, string> = {
    fixed_amount: 'fixed',
    percentage: 'percent',
    points: 'points',
    spins: 'spins',
    coupon: 'coupon',
  };
  return mapping[frontendValue] || 'fixed';
};

const mapFrontendToBackendDistributionMethod = (
  frontendValue: string,
): string => {
  const mapping: Record<string, string> = {
    expired_auto: 'auto_claim',
    self_claim_expire: 'manual_review',
    manual: 'manual_review',
    auto: 'direct',
    bonus: 'bonus_wallet',
  };
  return mapping[frontendValue] || 'auto_claim';
};

// Map rescue distribution method (BO radio → API). Do not collapse both self-claim options to auto_claim.
const mapRescueDistributionMethod = (frontendValue: string): string => {
  const mapping: Record<string, string> = {
    self_claim_expire: 'player_claim_expires', // 玩家自领-过期作废
    self_claim_auto: 'player_claim_auto_after_expire', // 玩家自领-过期自动派发
    manual_distribution: 'manual_review',
    direct: 'direct',
    bonus_wallet: 'bonus_wallet',
    manual_review: 'manual_review',
    auto_claim: 'auto_claim',
    player_claim_expires: 'player_claim_expires',
    player_claim_auto_after_expire: 'player_claim_auto_after_expire',
    manual_expire: 'manual_expire',
  };
  return mapping[frontendValue] || 'player_claim_expires';
};

// Map reward type
const mapRewardType = (frontendValue: string): string => {
  const mapping: Record<string, string> = {
    percentage: 'percent',
    percent: 'percent',
    fixed: 'fixed',
    points: 'points',
    spins: 'spins',
    coupon: 'coupon',
  };
  return mapping[frontendValue] || 'fixed';
};

// Map rescue claim time to number
const mapRescueClaimTimeToNumber = (frontendValue: string): number => {
  const mapping: Record<string, number> = {
    next_day: 24,
    daily: 24,
    immediate: 0,
  };
  return mapping[frontendValue] || 24;
};

// Map loss range to object
const mapLossRangeToObject = (
  frontendValue: string,
): { min: number; max: number } | undefined => {
  const mapping: Record<string, { min: number; max: number }> = {
    yesterday: { min: 0, max: 50000 }, // Yesterday loss range
    last_week: { min: 0, max: 200000 }, // Last week loss range
    last_month: { min: 0, max: 500000 }, // Last month loss range
  };
  return mapping[frontendValue] || undefined;
};

// Reverse mapping functions for loading edit data
const mapBackendToFrontendRewardType = (backendValue?: string): string => {
  const mapping: Record<string, string> = {
    fixed: 'fixed_amount',
    percent: 'percentage',
    points: 'points',
    spins: 'spins',
    coupon: 'coupon',
  };
  return mapping[backendValue || ''] || 'fixed_amount';
};

// Reverse mapping for rescue distribution method (API → BO radio)
const mapBackendToFrontendRescueDistributionMethod = (
  backendValue?: string,
): string => {
  const mapping: Record<string, string> = {
    player_claim_expires: 'self_claim_expire',
    manual_expire: 'self_claim_expire',
    player_claim_auto_after_expire: 'self_claim_auto',
    manual_auto_fallback: 'self_claim_auto',
    // Legacy mis-mapped rows: treat old auto_claim as 过期自动派发 so ops can re-save correctly
    auto_claim: 'self_claim_auto',
    manual_review: 'manual_distribution',
    direct: 'direct',
    bonus_wallet: 'bonus_wallet',
  };
  return mapping[backendValue || ''] || 'self_claim_expire';
};

// Reverse mapping for loss range object to string
const mapLossRangeFromObject = (backendValue?: {
  min: number;
  max: number;
}): string => {
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
    0: 'immediate',
  };
  return mapping[backendValue || 24] || 'next_day';
};

const mapBackendToFrontendDistributionMethod = (
  backendValue?: string,
): string => {
  const mapping: Record<string, string> = {
    auto_claim: 'expired_auto',
    manual_review: 'self_claim_expire',
    direct: 'auto',
    bonus_wallet: 'bonus',
  };
  return mapping[backendValue || ''] || 'expired_auto';
};

// Newbie bonus mapping functions
const mapNewbiePromotionTypeToBackend = (frontendValue: string): string => {
  const mapping: Record<string, string> = {
    code_redemption: 'registration',
    first_deposit_coupon: 'first_deposit',
    newcomer_gift: 'both',
    registration_bonus: 'registration',
  };
  return mapping[frontendValue] || 'registration';
};

const mapNewbiePromotionTypeFromBackend = (backendValue?: string): string => {
  const mapping: Record<string, string> = {
    registration: 'code_redemption',
    first_deposit: 'first_deposit_coupon',
    both: 'newcomer_gift',
  };
  return mapping[backendValue || 'registration'] || 'code_redemption';
};

const mapNewbieRedemptionMethodToBackend = (frontendValue: string): string => {
  const mapping: Record<string, string> = {
    click_link: 'code',
    private_promotion: 'manual',
    user_click: 'auto',
  };
  return mapping[frontendValue] || 'manual';
};

const mapNewbieRedemptionMethodFromBackend = (
  backendValue?: string,
): string => {
  const mapping: Record<string, string> = {
    code: 'click_link',
    manual: 'private_promotion',
    auto: 'user_click',
  };
  return mapping[backendValue || 'manual'] || 'private_promotion';
};

const mapNewbieGiftMethodToBackend = (frontendValue: string): string => {
  const mapping: Record<string, string> = {
    fixed_bonus: 'immediate',
    proportional_gift: 'delayed',
  };
  return mapping[frontendValue] || 'immediate';
};

const mapNewbieGiftMethodFromBackend = (backendValue?: string): string => {
  const mapping: Record<string, string> = {
    immediate: 'fixed_bonus',
    delayed: 'proportional_gift',
    manual: 'fixed_bonus',
  };
  return mapping[backendValue || 'immediate'] || 'fixed_bonus';
};

// Methods
const handleCurrencyChange = (values: (string | number)[]) => {
  // If "all" is selected, automatically select all available currencies
  if (values.includes('all')) {
    formData.currencies = ['all', 'BRL'];
  } else {
    formData.currencies = values.map((v) => v.toString());
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
    transferMultiplier: 1.0,
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
    rechargeAmounts: [{ betAmount: '', rewardAmount: 0.0 }],
    // Wagering Specific Fields
    loopMethod: 'single',
    isTimeLimited: false,
    distributionMethod: 'direct',
    claimTime: 24,
    selectTime: 24,
    wageringPlatform: 'all_platforms',
    wageringPlatformConfig: {
      selectedPlatforms: [],
      platformIds: [],
    },
    claimCount: 1,

    // Rescue Fund Specific Fields
    rescueWageringPlatform: 'all_platforms',
    rescueWageringPlatformConfig: {
      selectedPlatforms: [],
      platformIds: [],
    },
    deductDiscounts: false,
    lossRange: 'yesterday',
    dailyRewardLimit: '',
    rescueDistributionMethod: 'self_claim_expire',
    rescueClaimTime: 'next_day',
    rescueSelectTime: null,
    rescueRewardExpiryDays: 1,
    rewardType: 'percentage',
    rescueRewardSettings: [{ lossAmount: '', returnRatio: 0.0 }],
    newbieDaysLimit: 7,
    rewardCycle: 'daily',
    giftMode: 'pending_claim',
    claimMode: 'claim_individually',
    accumulateMode: 'per_slip',
    withdrawalRewardType: 'fixed',
    maxRewardAmount: '',
    withdrawalTiers: [{ withdrawMin: '', rewardValue: '' }],

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
      {
        type: 'fixed',
        rewardAmount: 0.0,
        rechargeRequirement: 0,
        wageringRequirement: 0,
        additionalReward: 0.0,
        checkinIcon: null,
      },
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
    luckywagerRewardSettings: [{ betSlipEnding: '', rewardAmount: '' }],

    // Red Packet Specific Fields
    redPacketType: 'fixed',
    redPacketClaimCondition: 'none',
    redPacketRewardType: 'fixed',
    securityVerification: false,
    redPacketTotalAmount: 1000,
    redPacketCountPerPeriod: 10000,
    actualRedPacketMin: 0.02,
    actualRedPacketMax: 0.5,
    displayedRedPacketMin: 0.01,
    displayedRedPacketMax: 378.0,
    grabLimitPerPeriod: 1,
    dailyGrabLimitType: 'fixed',
    dailyGrabLimit: 3,
    totalGrabLimit: 1,
    expectedBonus: 1.0,
    redPacketTotalCountLimit: 1,
    redPacketDisplayStyle: 'modal',
    redPacketDailyDistributionTimes: [{ startTime: null, endTime: null }],

    // Investment Specific Fields
    investmentType: 'fixed_amount',
    rewardDays: 3,
    investmentDistributionMethod: 'daily_auto',
    investmentSettings: [{ investmentAmount: '', giftAmount: '' }],

    // Promotion Specific Fields
    promotionAccumulatedRecharge: '',
    promotionAccumulatedRechargeDays: '',
    promotionAccumulatedRechargeCount: '',
    promotionAccumulatedWagering: '',
    promotionWageringPlatform: 'all_platforms',
    promotionWageringPlatformConfig: {
      selectedPlatforms: [],
      platformIds: [],
    },
    promotionDownloadAppLogin: false,
    promotionSameIPLimit: '',
    promotionSameDeviceLimit: '',
    promotionAllowSameTypeClaim: true,
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
    agentRewardSettings: [{ rebateAmount: '', rewardAmount: '' }],

    // Return Bonus Specific Fields
    inactiveDaysMin: 7,
    rewardAmount: 0,
    requiresDeposit: false,
    minDepositAmount: 0,
    depositInactiveDaysMin: 7,
    depositRewardAmount: 0,

    // Ranking Specific Fields
    rankingMetric: 'wagering',
    rankingPeriod: 'daily',
    robotCount: 0,
    rankingRewards: [{ rankFrom: 1, rankTo: 1, rewardValue: 0 }],

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
      {
        redemptionCode: '',
        totalUsageCount: '',
        startTime: null,
        endTime: null,
      },
    ],
    newbieRewardSettings: [{ firstDepositAmount: '', rewardAmount: '' }],
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
    customPageContent: '',
  });
};

const handleCancel = () => {
  modalShow.value = false;
};

function toCustomOpenInNewWindowBoolean(
  value: string | boolean | undefined,
): boolean {
  if (typeof value === 'boolean') return value;
  return value === 'true';
}

/** API may store title in locales; config.title can be stale placeholder. */
function resolveActivityTitle(item: any): string {
  const placeholder = $t('activity.detailModal.k672a2');
  const locales = item?.locales as
    | Array<{ locale?: string; title?: string }>
    | undefined;
  const fromLocales =
    locales?.find((l) => l.locale === 'zh-CN')?.title ||
    locales?.find((l) => l.locale === 'pt-BR')?.title ||
    locales?.[0]?.title;
  const candidates = [fromLocales, item?.title, item?.config?.title];
  for (const candidate of candidates) {
    if (candidate && candidate !== placeholder) return candidate;
  }
  return fromLocales || item?.title || item?.config?.title || '';
}

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

  if (
    formData.customDisplayMethod !== 'jump_link' ||
    formData.customJumpType !== 'external_link'
  ) {
    return undefined;
  }

  if (!formData.customTargetUrl || !formData.customTargetUrl.trim()) {
    return undefined; // Don't show error for empty field until blur
  }

  return isValidUrl(formData.customTargetUrl) ? undefined : 'error';
};

// Validate custom URL on blur
const validateCustomUrl = () => {
  if (
    formData.activityType === 'custom' &&
    formData.customDisplayMethod === 'jump_link' &&
    formData.customJumpType === 'external_link' &&
    formData.customTargetUrl
  ) {
    if (!isValidUrl(formData.customTargetUrl)) {
      const url = formData.customTargetUrl.trim();
      if (!url) {
        message.warning($t('activity.formModal.k8bf720'));
      } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
        message.warning($t('activity.formModal.linkMustStartHttp'));
      } else {
        message.warning($t('activity.formModal.k8bf721'));
      }
    }
  }
};

const handleSaveDraft = async () => {
  submitting.value = true;
  try {
    // Validate required fields
    if (!formData.title) {
      message.error($t('activity.formModal.k8bf7'));
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      message.error($t('activity.formModal.k8bf722'));
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
      startAt: formData.startTime
        ? new Date(formData.startTime).toISOString()
        : '',
      endAt: formData.endTime ? new Date(formData.endTime).toISOString() : '',
      status: 'draft',
      displayOrder: 0,
      description: resolveRulesForSubmit(),
      rules: resolveRulesForSubmit(),
    };

    // TODO: Call API to save activity
    console.log('Saving activity draft:', activityData);

    message.success($t('activity.formModal.k6d3b4'));
    modalShow.value = false;
    emit('success');
  } catch (error) {
    console.error('Error saving activity draft:', error);
    message.error($t('activity.formModal.k4fddk8bf7'));
  } finally {
    submitting.value = false;
  }
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    // Validate required fields
    if (!formData.title) {
      message.error($t('activity.formModal.k8bf7'));
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      message.error($t('activity.formModal.k8bf722'));
      return;
    }

    // Validate custom type configuration
    if (formData.activityType === 'custom') {
      if (!formData.customDisplayMethod) {
        message.error($t('activity.formModal.k8bf723'));
        submitting.value = false;
        return;
      }

      if (
        formData.customDisplayMethod === 'jump_link' &&
        !formData.customJumpType
      ) {
        message.error($t('activity.formModal.k8bf724'));
        submitting.value = false;
        return;
      }

      if (
        formData.customDisplayMethod === 'jump_link' &&
        formData.customJumpType === 'external_link' &&
        !formData.customTargetUrl
      ) {
        message.error($t('activity.formModal.k8bf720'));
        submitting.value = false;
        return;
      }

      // Validate URL format if external link - strict validation using isValidUrl function
      if (
        formData.customDisplayMethod === 'jump_link' &&
        formData.customJumpType === 'external_link' &&
        formData.customTargetUrl
      ) {
        const url = formData.customTargetUrl.trim();

        // Check if URL is not empty after trimming
        if (!url) {
          message.error($t('activity.formModal.k8bf720'));
          submitting.value = false;
          return;
        }

        // Use the same validation function for consistency
        if (!isValidUrl(url)) {
          // Provide specific error messages
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            message.error($t('activity.formModal.linkMustStartHttp'));
          } else {
            message.error($t('activity.formModal.k8bf7k683c'));
          }
          submitting.value = false;
          return;
        }
      }

      if (formData.customDisplayMethod === 'builtin_page') {
        const plainText = (formData.customPageContent || '')
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .trim();
        if (!plainText) {
          message.error($t('activity.formModal.k8bf725'));
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
      console.log(
        '🔍 Debug - Custom Config to Save (BEFORE building payload):',
        {
          customDisplayMethod: formData.customDisplayMethod,
          customJumpType: formData.customJumpType,
          customTargetUrl: formData.customTargetUrl,
          customOpenInNewWindow: formData.customOpenInNewWindow,
          customOpenInNewWindowType: typeof formData.customOpenInNewWindow,
          willSaveJumpType: formData.customJumpType ? 'YES' : 'NO',
          willSaveTargetUrl:
            formData.customTargetUrl && formData.customTargetUrl.trim()
              ? 'YES'
              : 'NO',
          willSaveOpenInNewWindow: formData.customJumpType
            ? toCustomOpenInNewWindowBoolean(formData.customOpenInNewWindow)
              ? 'YES'
              : 'NO'
            : 'NO',
        },
      );
    }

    const configPayload: any = {
      title: formData.title,
      memberScope: formData.memberLevel,
      claimLimit: 0,
      platforms: formData.platforms,
      description: resolveRulesForSubmit(),

      // Audit settings
      auditRequired: formData.auditSettings.auditRequired,
      auditMultiplier: formData.auditSettings.auditMultiplier,
      // auditCompletionTimeHours removed - fixed to 24 hours
      auditManualReviewRequired:
        formData.auditSettings.auditManualReviewRequired,
      rules: resolveRulesForSubmit(),
      ruleTemplate: formData.ruleTemplate,
      // Restrictions & Conditions
      restrictions: formData.restrictions,
      memberTags: formData.memberTags,
      memberGroups: memberGroupsFromTierIds(formData.memberTags),
      platformRestriction: formData.platformRestriction,
      withdrawalRestriction: formData.withdrawalRestriction,
      specifyChannel: formData.specifyChannel,
      // Remove redundant fields - they're stored at root level
      // displayEnabled, homepageDisplay, floatingIconEnabled, iconUrl are at root
      // floatingIconConfig is also at root level, not in config
      // Promotion specific fields - convert to match backend schema
      promotionAccumulatedRecharge: formData.promotionAccumulatedRecharge
        ? parseFloat(formData.promotionAccumulatedRecharge)
        : undefined,
      promotionAccumulatedRechargeDays:
        formData.promotionAccumulatedRechargeDays
          ? parseInt(formData.promotionAccumulatedRechargeDays)
          : undefined,
      promotionAccumulatedRechargeCount:
        formData.promotionAccumulatedRechargeCount
          ? parseInt(formData.promotionAccumulatedRechargeCount)
          : undefined,
      promotionAccumulatedWagering: formData.promotionAccumulatedWagering
        ? parseFloat(formData.promotionAccumulatedWagering)
        : undefined,
      promotionWageringPlatform: formData.promotionWageringPlatform,
      promotionWageringPlatformConfig: formData.promotionWageringPlatformConfig,
      promotionDownloadAppLogin: formData.promotionDownloadAppLogin,
      promotionSameIPLimit: formData.promotionSameIPLimit
        ? parseInt(formData.promotionSameIPLimit)
        : undefined,
      promotionSameDeviceLimit: formData.promotionSameDeviceLimit
        ? parseInt(formData.promotionSameDeviceLimit)
        : undefined,
      promotionAllowSameTypeClaim:
        !formData.restrictions.includes('same_activity'),
      promotionRewardType: mapFrontendToBackendRewardType(
        formData.promotionRewardType,
      ),
      promotionDisplayOnAgentPage: formData.promotionDisplayOnAgentPage,
      promotionDistributionMethod: mapFrontendToBackendDistributionMethod(
        formData.promotionDistributionMethod,
      ),
      promotionDisplayClaimMethod: formData.promotionDisplayClaimMethod,
      promotionDisplayAmount: formData.promotionDisplayAmount === 'show',
      promotionRewardSettings:
        formData.promotionRewardSettings?.map((setting) => ({
          condition: setting.effectivePromotionCount,
          rewardType: mapFrontendToBackendRewardType('fixed_amount'), // Default
          rewardValue: parseFloat(setting.rewardAmount) || 0,
          maxClaim: 1, // Default
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
            rewardValue:
              parseFloat(setting.rewardAmount?.toString() || '0') || 0,
            extraReward:
              parseFloat(setting.additionalReward?.toString() || '0') || 0,
            rechargeRequirement:
              parseFloat(setting.rechargeRequirement?.toString() || '0') || 0,
            wageringRequirement:
              parseFloat(setting.wageringRequirement?.toString() || '0') || 0,
            iconUrl: setting.checkinIcon,
          }))
        : [],
      // Custom Type Configuration - ensure all fields are saved
      // 🔒 FIX: Always save all custom fields, even if displayMethod is builtin_page
      // This preserves data when user switches between builtin_page and jump_link
      customDisplayMethod: formData.customDisplayMethod,
      // Save customJumpType if it exists (preserve even when switching to builtin_page)
      customJumpType: formData.customJumpType || undefined,
      // Save customTargetUrl if it exists and is not empty (preserve even when switching to builtin_page)
      customTargetUrl:
        formData.customTargetUrl && formData.customTargetUrl.trim()
          ? formData.customTargetUrl.trim()
          : undefined,
      // 🔒 FIX: Always save customOpenInNewWindow as boolean when jump_link data exists
      // This tells the web app whether to open in new tab or current tab
      customOpenInNewWindow: formData.customJumpType
        ? toCustomOpenInNewWindowBoolean(formData.customOpenInNewWindow)
        : undefined,
      customBuiltinPage:
        formData.customDisplayMethod === 'builtin_page' ? 'builtin' : undefined,
      customPageContent:
        formData.customPageContent && formData.customPageContent.trim()
          ? formData.customPageContent
          : undefined,
      // Save customJumpConfig if jump_link data exists
      customJumpConfig: formData.customJumpType
        ? {
            jumpMode: (() => {
              // Map jump types to jumpMode
              if (formData.customJumpType === 'external_link') return 'URL';
              if (formData.customJumpType === 'activity') return 'ACTIVITY';
              if (formData.customJumpType === 'task') return 'TASK';
              return 'INTERNAL'; // For other internal pages
            })(),
            targetUrl:
              formData.customJumpType === 'external_link' &&
              formData.customTargetUrl
                ? formData.customTargetUrl.trim()
                : undefined,
            targetActivityId:
              formData.customJumpType === 'activity' ? undefined : undefined, // TODO: Add activity selection if needed
            targetTaskId:
              formData.customJumpType === 'task' ? undefined : undefined, // TODO: Add task selection if needed
            // 🔒 FIX: Save openInNewWindow as boolean - this is used by web app to determine new tab vs current tab
            openInNewWindow: toCustomOpenInNewWindowBoolean(
              formData.customOpenInNewWindow,
            ),
          }
        : undefined,

      // Recharge / withdrawal specific fields
      condition:
        formData.activityType === 'recharge' ? formData.condition : undefined,
      rewardCycle:
        formData.activityType === 'withdrawal'
          ? formData.rewardCycle
          : undefined,
      cycleMethod:
        formData.activityType === 'withdrawal'
          ? formData.rewardCycle
          : formData.activityType === 'recharge' &&
              formData.condition === 'accumulate_recharge'
            ? formData.cycleMethod
            : undefined,
      distributionMethod: formData.distributionMethod,
      claimTime: formData.claimTime,
      claimCount:
        formData.activityType === 'recharge' ? formData.claimCount : undefined,
      claimMode:
        formData.activityType === 'withdrawal'
          ? formData.claimMode
          : undefined,
      accumulateMode:
        formData.activityType === 'withdrawal'
          ? formData.accumulateMode
          : undefined,
      giftMode:
        formData.activityType === 'withdrawal'
          ? formData.giftMode
          : undefined,
      giftType:
        formData.activityType === 'withdrawal'
          ? formData.withdrawalRewardType
          : undefined,
      maxRewardAmount:
        formData.activityType === 'withdrawal' && formData.maxRewardAmount
          ? parseFloat(formData.maxRewardAmount)
          : undefined,
      tiers:
        formData.activityType === 'withdrawal'
          ? formData.withdrawalTiers
              ?.filter((t) => t.withdrawMin || t.rewardValue)
              .map((t, idx) => ({
                tierIndex: idx,
                withdrawMin: parseFloat(t.withdrawMin) || 0,
                rewardValue: parseFloat(t.rewardValue) || 0,
                rewardType: formData.withdrawalRewardType,
              })) || []
          : undefined,
      rechargeAmounts:
        formData.activityType === 'recharge'
          ? formData.rechargeAmounts?.map((item) => ({
              betAmount: item.betAmount?.toString() || '',
              rewardAmount:
                parseFloat(item.rewardAmount?.toString() || '0') || 0,
            }))
          : undefined,
      rechargeMethods:
        formData.activityType === 'recharge'
          ? formData.rechargeMethods
          : undefined,
      bonusMethod:
        formData.activityType === 'recharge' ? formData.bonusMethod : undefined,
      participationMethod:
        formData.activityType === 'recharge'
          ? formData.participationMethod
          : undefined,
      // ✅ FIX: Ensure beforeLoginPopup and afterLoginPopup are always sent with a value (never undefined)
      beforeLoginPopup:
        formData.activityType === 'recharge'
          ? formData.beforeLoginPopup || 'none'
          : undefined,
      afterLoginPopup:
        formData.activityType === 'recharge'
          ? formData.afterLoginPopup || 'none'
          : undefined,
      directPopupAfterRecharge:
        formData.activityType === 'recharge'
          ? formData.directPopupAfterRecharge
          : undefined,
      rewardExpirationDays:
        formData.activityType === 'recharge'
          ? formData.rewardExpirationDays
          : undefined,
      // Wagering specific fields - save all to database
      loopMethod: formData.loopMethod,
      isTimeLimited: formData.isTimeLimited,
      selectTime: formData.selectTime,
      wageringPlatform: formData.wageringPlatform,
      claimCount:
        formData.activityType === 'withdrawal'
          ? formData.claimMode
          : formData.activityType === 'wagering' ||
              formData.activityType === 'recharge'
            ? formData.claimCount
            : formData.claimCount,
      wageringRewardExpiryDays: formData.wageringRewardExpiryDays,
      wageringRewardSettings:
        formData.wageringRewardSettings?.map((setting) => ({
          effectiveWageringAmount:
            parseFloat(setting.effectiveWageringAmount) || 0,
          rewardAmount: parseFloat(setting.rewardAmount) || 0,
        })) || [],
      wageringPlatformConfig: (formData as any).wageringPlatformConfig,
      // Rescue Fund specific fields - save all to database
      rescueWageringPlatform:
        formData.rescueWageringPlatform === 'all_platforms'
          ? ['all']
          : [formData.rescueWageringPlatform],
      rescueWageringPlatformConfig: (formData as any)
        .rescueWageringPlatformConfig,
      deductDiscounts: formData.deductDiscounts,
      lossRange:
        formData.activityType === 'newbie_rescue'
          ? formData.lossRange
          : mapLossRangeToObject(formData.lossRange),
      newbieDaysLimit:
        formData.activityType === 'newbie_rescue'
          ? formData.newbieDaysLimit
          : undefined,
      dailyRewardLimit: formData.dailyRewardLimit
        ? parseFloat(formData.dailyRewardLimit)
        : undefined,
      // Dual-write: rescue readers use rescueDistributionMethod; keep distributionMethod in sync
      rescueDistributionMethod: mapRescueDistributionMethod(
        formData.rescueDistributionMethod,
      ),
      distributionMethod: mapRescueDistributionMethod(
        formData.rescueDistributionMethod,
      ),
      rescueClaimTime: mapRescueClaimTimeToNumber(formData.rescueClaimTime),
      rescueSelectTime: formData.rescueSelectTime || undefined,
      rescueRewardExpiryDays: formData.rescueRewardExpiryDays,
      rewardType:
        formData.activityType === 'withdrawal'
          ? formData.withdrawalRewardType
          : mapRewardType(formData.rewardType),
      rescueRewardSettings:
        formData.rescueRewardSettings?.map((setting) => ({
          lossMin: parseFloat(setting.lossAmount) || 0,
          lossMax: parseFloat(setting.lossAmount) || 0, // TODO: Add lossMax field to frontend
          rescueRate: parseFloat(setting.returnRatio.toString()) || 0,
          maxRescue: parseFloat(setting.lossAmount) || 0, // TODO: Add maxRescue field to frontend
          wageringRequirement: 0, // TODO: Add wageringRequirement field to frontend
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
      redPacketDailyDistributionTimes:
        formData.redPacketDailyDistributionTimes
          ?.filter((time) => time.startTime && time.endTime)
          .map((time) => ({
            startTime: time.startTime,
            endTime: time.endTime,
          })) || [],
      // Agent specific fields
      agentDisplayOnAgentPage: formData.agentDisplayOnAgentPage,
      agentDistributionMethod: formData.agentDistributionMethod,
      agentRewardClaimExpiryDays: formData.agentRewardClaimExpiryDays,
      agentRewardCycle: formData.agentRewardCycle,
      agentRewardType: formData.agentRewardType,
      agentRewardAmountType: formData.agentRewardAmountType,
      agentRewardSettings:
        formData.agentRewardSettings?.map((setting, index) => ({
          level: index + 1,
          rebateAmount: parseFloat(String(setting.rebateAmount)) || 0,
          rewardAmount: parseFloat(String(setting.rewardAmount)) || 0,
          minRecharge: parseFloat(String(setting.rebateAmount)) || 0,
        })) || [],

      // Return bonus specific fields
      inactiveDaysMin:
        formData.activityType === 'return_bonus'
          ? formData.inactiveDaysMin || 0
          : undefined,
      ...(formData.activityType === 'return_bonus'
        ? {
            rewardAmount: formData.rewardAmount || 0,
            requiresDeposit: formData.requiresDeposit,
            minDepositAmount: formData.minDepositAmount || 0,
            depositInactiveDaysMin: formData.depositInactiveDaysMin || 0,
            depositRewardAmount: formData.depositRewardAmount || 0,
            enableDepositGap: (formData.depositRewardAmount || 0) > 0,
            depositGapRewardAmount: formData.depositRewardAmount || 0,
            returnBonusRewards: (() => {
              const rules: Array<Record<string, unknown>> = [
                {
                  rule: 'login_gap',
                  inactiveDaysMin: formData.inactiveDaysMin || 0,
                  rewardAmount: formData.rewardAmount || 0,
                  requiresDeposit: formData.requiresDeposit,
                  minDepositAmount: formData.minDepositAmount || 0,
                },
              ];
              if ((formData.depositRewardAmount || 0) > 0) {
                rules.push({
                  rule: 'deposit_gap',
                  inactiveDaysMin:
                    formData.depositInactiveDaysMin ||
                    formData.inactiveDaysMin ||
                    0,
                  rewardAmount: formData.depositRewardAmount || 0,
                  requiresDeposit: true,
                  minDepositAmount: formData.minDepositAmount || 0,
                });
              }
              return rules.slice(0, 2);
            })(),
          }
        : {}),

      // Ranking specific fields
      rankingMetric:
        formData.activityType === 'ranking'
          ? formData.rankingMetric
          : undefined,
      rankingPeriod:
        formData.activityType === 'ranking'
          ? formData.rankingPeriod
          : undefined,
      robotCount:
        formData.activityType === 'ranking' ? formData.robotCount || 0 : undefined,
      rankingRobotCount:
        formData.activityType === 'ranking' ? formData.robotCount || 0 : undefined,
      rankingRewards:
        formData.activityType === 'ranking'
          ? formData.rankingRewards?.map((r) => ({
              rankFrom: Number(r.rankFrom) || 1,
              rankTo: Number(r.rankTo) || 1,
              rewardValue: Number(r.rewardValue) || 0,
            })) || []
          : undefined,

      // Newbie Bonus specific fields - save all to database with proper mapping
      newbiePromotionType: mapNewbiePromotionTypeToBackend(
        formData.newbiePromotionType,
      ),
      newbieRedemptionCode: formData.newbieRedemptionCode || undefined,
      newbieTotalUsageCount:
        formData.newbieTotalUsageCount &&
        parseInt(formData.newbieTotalUsageCount) > 0
          ? parseInt(formData.newbieTotalUsageCount)
          : undefined,
      newbieStartTime: formData.newbieStartTime
        ? new Date(formData.newbieStartTime)
        : undefined,
      newbieEndTime: formData.newbieEndTime
        ? new Date(formData.newbieEndTime)
        : undefined,
      newbieRedemptionMethod: mapNewbieRedemptionMethodToBackend(
        formData.newbieRedemptionMethod,
      ),
      newbiePopupAfterTopup: formData.newbiePopupAfterTopup,
      newbieGiftMethod: mapNewbieGiftMethodToBackend(formData.newbieGiftMethod),
      newbieRedemptionSettings:
        formData.newbieRedemptionSettings
          ?.filter((s) => s.redemptionCode)
          .map((setting) => ({
            redemptionCode: setting.redemptionCode,
            totalUsageCount: setting.totalUsageCount
              ? parseInt(setting.totalUsageCount)
              : undefined,
            startTime: setting.startTime
              ? new Date(setting.startTime)
              : undefined,
            endTime: setting.endTime ? new Date(setting.endTime) : undefined,
          })) || undefined,
      newbieRewardSettings:
        formData.newbieRewardSettings
          ?.filter((s) => {
            const depositAmount = parseFloat(s.firstDepositAmount);
            const rewardAmount = parseFloat(s.rewardAmount);
            // Only include settings where both values are valid and positive
            return (
              !isNaN(depositAmount) &&
              depositAmount > 0 &&
              !isNaN(rewardAmount) &&
              rewardAmount > 0
            );
          })
          .map((setting) => ({
            firstDepositMin: parseFloat(setting.firstDepositAmount),
            rewardType: 'fixed' as const,
            rewardValue: parseFloat(setting.rewardAmount),
            cap: undefined,
            validityDays: undefined,
          }))
          .filter((s) => s.firstDepositMin > 0 && s.rewardValue > 0) || // Double check after mapping
        undefined,
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
      })(),
    };

    console.log('🔍 Debug - ConfigPayload before submission:', configPayload);

    // Promotion uses promotionWageringPlatform* — do not persist wagering-activity defaults into config
    if (formData.activityType === 'promotion') {
      delete configPayload.wageringPlatform;
      delete configPayload.wageringPlatformConfig;
      delete configPayload.wageringRewardSettings;
      delete configPayload.wageringRewardExpiryDays;
      console.log('🔍 Promotion platform save:', {
        promotionWageringPlatform: configPayload.promotionWageringPlatform,
        selectedPlatforms:
          configPayload.promotionWageringPlatformConfig?.selectedPlatforms?.length ??
          0,
      });
    }

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
        newbieDisplayGiftMax: configPayload.newbieDisplayGiftMax,
      });

      // For newbie bonus, we need either:
      // 1. Reward settings table with valid entries, OR
      // 2. Gift amount ranges (min/max) configured
      const hasRewardSettings =
        configPayload.newbieRewardSettings &&
        configPayload.newbieRewardSettings.length > 0;
      const hasGiftAmounts =
        configPayload.newbieActualGiftMin && configPayload.newbieActualGiftMax;

      if (!hasRewardSettings && !hasGiftAmounts) {
        message.warning($t('activity.formModal.configureRewardSettings'));
        submitting.value = false;
        return;
      }

      // If no reward settings but has gift amounts, create a default reward setting
      if (!hasRewardSettings && hasGiftAmounts) {
        configPayload.newbieRewardSettings = [
          {
            firstDepositMin: 1, // Minimum deposit of 1
            rewardType: 'fixed' as const,
            rewardValue: configPayload.newbieActualGiftMin || 0.01,
            cap: configPayload.newbieActualGiftMax,
            validityDays: undefined,
          },
        ];
        console.log(
          '✅ Auto-generated reward setting from gift amounts:',
          configPayload.newbieRewardSettings,
        );
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
      rescueRewardSettings: configPayload.rescueRewardSettings,
    });

    if (isEditing.value && props.editingItem?.id) {
      const updatePayload: any = {
        type: formData.activityType,
        category:
          formData.categories.length > 0
            ? formData.categories.join(',')
            : formData.category,
        currency:
          formData.currencies.length > 0
            ? formData.currencies.join(',')
            : formData.currency,
        status: 'active',
        startsAt: formData.startTime ? new Date(formData.startTime) : undefined,
        endsAt: formData.endTime ? new Date(formData.endTime) : undefined,
        isVisible: true,
        // Add root level fields
        promoUrl:
          formData.promoImage && formData.promoImage.trim() !== ''
            ? formData.promoImage
            : undefined,
        displayEnabled: formData.displayEnabled,
        homepageDisplay: formData.homepageDisplay,
        floatingIconEnabled: formData.floatingIcon.enabled,
        floatingIconConfig: {
          jumpMode: 'NONE', // Default jump mode
          targetUrl: undefined, // Use undefined instead of empty string
          targetActivityId: undefined, // Use undefined instead of null
          targetTaskId: undefined, // Use undefined instead of null
          iconUrl:
            formData.floatingIcon.icons.general?.trim() &&
            formData.floatingIcon.icons.general.trim() !== ''
              ? formData.floatingIcon.icons.general
              : formData.floatingIcon.selectedPresetIcon?.trim() &&
                  formData.floatingIcon.selectedPresetIcon.trim() !== ''
                ? formData.floatingIcon.selectedPresetIcon
                : undefined,
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
          },
        },
        // Add recharge-specific fields at root level (backend will merge into config)
        ...(formData.activityType === 'recharge'
          ? {
              condition: formData.condition,
              cycleMethod:
                formData.condition === 'accumulate_recharge'
                  ? formData.cycleMethod
                  : undefined,
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
            }
          : {}),
        config: configPayload,
      };

      console.log('🚀 Debug - Final UPDATE payload:', updatePayload);
      console.log('🚀 Debug - Custom config in payload:', {
        customDisplayMethod: configPayload.customDisplayMethod,
        customJumpType: configPayload.customJumpType,
        customTargetUrl: configPayload.customTargetUrl,
        customOpenInNewWindow: configPayload.customOpenInNewWindow,
        customJumpConfig: configPayload.customJumpConfig,
      });
      await updateActivityV2(
        Number((props.editingItem as any).id),
        updatePayload,
      );
      message.success($t('activity.formModal.k6d3b5'));
      modalShow.value = false;
      emit('success');
    } else {
      const createPayload: CreateActivityInput = {
        type: formData.activityType,
        category:
          formData.categories.length > 0
            ? formData.categories.join(',')
            : formData.category,
        currency:
          formData.currencies.length > 0
            ? formData.currencies.join(',')
            : formData.currency,
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
          iconUrl:
            formData.floatingIcon.icons.general?.trim() &&
            formData.floatingIcon.icons.general.trim() !== ''
              ? formData.floatingIcon.icons.general
              : formData.floatingIcon.selectedPresetIcon?.trim() &&
                  formData.floatingIcon.selectedPresetIcon.trim() !== ''
                ? formData.floatingIcon.selectedPresetIcon
                : undefined,
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
          },
        },
        // Add recharge-specific fields at root level (backend will merge into config)
        ...(formData.activityType === 'recharge'
          ? {
              condition: formData.condition,
              cycleMethod:
                formData.condition === 'accumulate_recharge'
                  ? formData.cycleMethod
                  : undefined,
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
            }
          : {}),
        config: configPayload,
        createdBy: 1,
        locales: [
          {
            locale: 'pt-BR',
            title: formData.title,
            description: resolveRulesForSubmit(),
          },
          {
            locale: 'zh-CN',
            title: formData.title,
            description: resolveRulesForSubmit(),
          },
        ],
      };

      console.log('🚀 Debug - Final CREATE payload:', createPayload);
      await createActivity(createPayload);
      message.success($t('activity.formModal.k6d3b6'));
      modalShow.value = false;
      emit('success');
    }
  } catch (error) {
    console.error('Error submitting activity:', error);
    message.error($t('activity.formModal.k63d0k8bf7'));
  } finally {
    submitting.value = false;
  }
};

const openTranslationModal = () => {
  translationModalShow.value = true;
};

const saveTranslations = () => {
  translationModalShow.value = false;
  message.success($t('activity.formModal.k591a2'));
};

const openIconUpload = () => {
  iconUploadModalShow.value = true;
};

const saveCustomIcon = () => {
  iconUploadModalShow.value = false;
  message.success($t('activity.formModal.k81ea5'));
};

const handlePromoImageChange = (options: any) => {
  promoImageList.value = options.fileList;
};

const handleCustomIconChange = (options: any) => {
  customIconList.value = options.fileList;
};

// Methods for Recharge Amount Configuration
const addRechargeAmount = () => {
  formData.rechargeAmounts.push({ betAmount: '', rewardAmount: 0.0 });
};

const removeRechargeAmount = (index: number) => {
  formData.rechargeAmounts.splice(index, 1);
};

// Methods for Rescue Fund Reward Settings
const addRescueRewardSetting = () => {
  formData.rescueRewardSettings.push({ lossAmount: '', returnRatio: 0.0 });
};

const removeRescueRewardSetting = (index: number) => {
  formData.rescueRewardSettings.splice(index, 1);
};

const addWithdrawalTier = () => {
  formData.withdrawalTiers.push({ withdrawMin: '', rewardValue: '' });
};

const removeWithdrawalTier = (index: number) => {
  formData.withdrawalTiers.splice(index, 1);
};

// Methods for Sign-in Reward Settings
const addCheckinRewardSetting = () => {
  formData.checkinRewardSettings.push({
    type: 'fixed',
    rewardAmount: 0.0,
    rechargeRequirement: 0,
    wageringRequirement: 0,
    additionalReward: 0.0,
    checkinIcon: null,
  });
};

const removeCheckinRewardSetting = (index: number) => {
  formData.checkinRewardSettings.splice(index, 1);
};

const handleCheckinRechargeMethodChange = (values: (string | number)[]) => {
  // If "all" is selected, automatically select all available recharge methods
  if (values.includes('all')) {
    formData.checkinRechargeMethods = [
      'all',
      'pix',
      'customer_service',
      'merchant',
    ];
  } else {
    formData.checkinRechargeMethods = values.map((v) => v.toString());
  }
};

const handleRechargeMethodChange = (values: (string | number)[]) => {
  // If "all" is selected, automatically select all available recharge methods
  if (values.includes('all')) {
    formData.rechargeMethods = ['all', 'pix', 'customer_service', 'merchant'];
  } else {
    formData.rechargeMethods = values.map((v) => v.toString());
  }
};

const handleCheckinIconChange = (options: any) => {
  // Handle check-in icon change
  console.log('Check-in icon changed:', options);
};

// Methods for Lucky Bet Slip Specific Fields
const addLuckywagerRewardSetting = () => {
  formData.luckywagerRewardSettings.push({
    betSlipEnding: '',
    rewardAmount: '',
  });
};

const removeLuckywagerRewardSetting = (index: number) => {
  formData.luckywagerRewardSettings.splice(index, 1);
};

// Methods for Investment Specific Fields
const addInvestmentSetting = () => {
  formData.investmentSettings.push({ investmentAmount: '', giftAmount: '' });
};

const calculateAccumulatedReward = (item: {
  investmentAmount: string;
  giftAmount: string;
}) => {
  if (!item.investmentAmount || !item.giftAmount) return '-';
  const investment = parseFloat(item.investmentAmount);
  const gift = parseFloat(item.giftAmount);
  if (isNaN(investment) || isNaN(gift)) return '-';
  return (investment + gift).toFixed(2);
};

const calculateDailyReward = (item: {
  investmentAmount: string;
  giftAmount: string;
}) => {
  if (!item.investmentAmount || !item.giftAmount || !formData.rewardDays)
    return '-';
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
      url: `/uploads/floating-icons/${Date.now()}-${file.name}`,
    };

    if (language === 'general') {
      formData.floatingIcon.icons.general = fileInfo;
    } else if (language === 'pt') {
      formData.floatingIcon.icons.pt = fileInfo;
    } else if (language === 'zh') {
      formData.floatingIcon.icons.zh = fileInfo;
    }

    message.success(
      $t('activity.formModal.iconUploadSuccess', [
        language === 'general'
          ? $t('activity.formModal.k901a')
          : language === 'pt'
            ? 'Português'
            : $t('activity.formModal.langZhCN'),
      ]),
    );
  }
};

const selectPresetIcon = (icon: { id: string; name: string; url: string }) => {
  formData.floatingIcon.selectedPresetIcon = icon.id;
  formData.floatingIcon.icons.general = {
    name: icon.name,
    url: icon.url,
  };
  message.success($t('activity.formModal.presetIconSelected', [icon.name]));
};

// Methods for Promotion Specific Fields
const addPromotionRewardSetting = () => {
  formData.promotionRewardSettings.push({
    effectivePromotionCount: '',
    rewardAmount: '',
  });
};

const downloadPromotionTemplate = async () => {
  try {
    // Check if this is a promotion activity type
    if (formData.activityType !== 'promotion') {
      message.error($t('activity.formModal.k53ea3'));
      return;
    }

    const downloadUrl = resolvePromotionTemplateDownloadUrl();
    const headers: Record<string, string> = {};
    const token = accessStore.accessToken;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(downloadUrl, {
      method: 'GET',
      credentials: 'include',
      headers,
    });

    const contentType = response.headers.get('content-type') || '';

    if (!response.ok) {
      let errMsg = `下载失败 (${response.status})`;
      try {
        if (contentType.includes('application/json')) {
          const err = await response.json();
          errMsg =
            (err as { message?: string; error?: string }).message ||
            (err as { message?: string; error?: string }).error ||
            errMsg;
        }
      } catch {
        /* ignore */
      }
      message.error(errMsg);
      return;
    }

    if (contentType.includes('application/json')) {
      const json = (await response.json()) as {
        message?: string;
        error?: string;
      };
      message.error(json.message || json.error || '下载失败');
      return;
    }

    const blob = await response.blob();
    const disposition = response.headers.get('content-disposition') || '';
    let filename = `promotion_reward_template_${
      new Date().toISOString().split('T')[0]
    }.csv`;
    const filenameMatch = /filename\*?=(?:UTF-8'')?["']?([^"';\n]+)/i.exec(
      disposition,
    );
    if (filenameMatch?.[1]) {
      try {
        filename = decodeURIComponent(filenameMatch[1].trim());
      } catch {
        filename = filenameMatch[1].trim();
      }
    }

    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);

    message.success($t('activity.formModal.k6a21'));
  } catch (error) {
    console.error('❌ Download failed:', error);
    message.error($t('activity.formModal.k6a212'));
  }
};

const batchImportPromotion = () => {
  try {
    console.log('Batch import promotion settings');

    // Check if this is a promotion activity type
    if (formData.activityType !== 'promotion') {
      message.error($t('activity.formModal.k53ea4'));
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
        console.log(
          '🔍 Starting file import for:',
          file.name,
          'Size:',
          file.size,
          'bytes',
        );

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
          message.error($t('activity.formModal.k4e0dk8bf7Csvk6216Xlsxk6587'));
          return;
        }

        console.log(' Parse result:', result);

        if (result?.success) {
          const importCount = (result as any).importCount;
          const rewardSettings = (result as any).rewardSettings;

          console.log(
            `✅ Successfully parsed ${importCount} settings:`,
            rewardSettings,
          );
          message.success(`成功导入 ${importCount} 个奖励设置`);

          // Update form data with imported settings
          formData.promotionRewardSettings = rewardSettings;

          console.log(
            '📝 Updated form data:',
            formData.promotionRewardSettings,
          );
        } else {
          const errorMessage = (result as any)?.message || '批量导入失败';
          console.log('❌ Import failed:', errorMessage);
          message.error(errorMessage);
        }
      } catch (error) {
        console.error('❌ Import failed with exception:', error);
        message.error($t('activity.formModal.k6279k8bf7'));
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
    message.error($t('activity.formModal.k62792'));
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
      if (
        isNaN(referralCount) ||
        isNaN(rewardAmount) ||
        referralCount <= 0 ||
        rewardAmount < 0
      ) {
        skipCount++;
        continue;
      }

      // Create reward setting object in frontend format
      rewardSettings.push({
        effectivePromotionCount: referralCount.toString(),
        rewardAmount: rewardAmount.toString(),
      });

      importCount++;
    }

    if (rewardSettings.length === 0) {
      return {
        success: false,
        message: $t('activity.formModal.k6ca1'),
      };
    }

    return {
      success: true,
      importCount,
      skipCount,
      rewardSettings,
      message: `成功导入 ${importCount} 个奖励设置${skipCount > 0 ? `，跳过 ${skipCount} 个无效数据` : ''}`,
    };
  } catch (error) {
    return {
      success: false,
      message: $t('activity.formModal.cSV'),
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
      message:
        '系统暂不支持Excel文件解析，请将Excel文件另存为CSV格式后重新导入。\n\n操作步骤：\n1. 在Excel中打开您的文件\n2. 点击"文件" > "另存为"\n3. 选择"CSV (逗号分隔值)" 格式\n4. 保存后重新导入CSV文件',
    };
  } catch (error) {
    console.error('❌ Excel parsing error:', error);
    return {
      success: false,
      message: $t('activity.formModal.excelk8bf7'),
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
          if (
            isNaN(referralCount) ||
            isNaN(rewardAmount) ||
            referralCount <= 0 ||
            rewardAmount < 0
          ) {
            skipCount++;
            continue;
          }

          // Create reward setting object in frontend format
          rewardSettings.push({
            effectivePromotionCount: referralCount.toString(),
            rewardAmount: rewardAmount.toString(),
          });

          importCount++;
        }

        if (rewardSettings.length === 0) {
          resolve({
            success: false,
            message: $t('activity.formModal.k6ca1'),
          });
          return;
        }

        resolve({
          success: true,
          importCount,
          skipCount,
          rewardSettings,
          message: `成功导入 ${importCount} 个奖励设置${skipCount > 0 ? `，跳过 ${skipCount} 个无效数据` : ''}`,
        });
      } catch (error) {
        resolve({
          success: false,
          message: $t('activity.formModal.excel'),
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        message: $t('activity.formModal.excel2'),
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

const addRankingReward = () => {
  const last = formData.rankingRewards[formData.rankingRewards.length - 1];
  const nextFrom = (last?.rankTo || 0) + 1;
  formData.rankingRewards.push({
    rankFrom: nextFrom,
    rankTo: nextFrom,
    rewardValue: 0,
  });
};

const removeRankingReward = (index: number) => {
  formData.rankingRewards.splice(index, 1);
};

// Methods for Collect Characters Specific Fields
const addCollectCondition = () => {
  formData.collectConditions.push({
    type: 'valid_bet',
    conditionValue: '',
    dailyCountLimit: '',
  });
};

const removeCollectCondition = (index: number) => {
  formData.collectConditions.splice(index, 1);
};

const getDistributionMethodText = () => {
  switch (formData.collectDistributionMethod) {
    case 'daily':
      return $t('activity.formModal.k6bcf');
    case 'weekly':
      return $t('activity.formModal.k6bcf5');
    case 'monthly':
      return $t('activity.formModal.k6bcf6');
    default:
      return $t('activity.formModal.k6bcf6');
  }
};

// Options for Collect Characters
const collectCombinationOptions = [
  { label: $t('activity.formModal.k8282'), value: 'festival' },
  { label: $t('activity.formModal.k795d'), value: 'blessing' },
  { label: $t('activity.formModal.k6210'), value: 'idiom' },
];

const collectCombinationNameOptions = [
  { label: $t('activity.formModal.k65b0'), value: 'new_year_luck' },
  { label: $t('activity.formModal.k606d'), value: 'congratulations_wealth' },
  { label: $t('activity.formModal.k4e07'), value: 'everything_goes_well' },
];

const collectConditionTypeOptions = [
  { label: $t('activity.formModal.k6709'), value: 'valid_bet' },
  { label: $t('activity.formModal.k5145'), value: 'recharge_amount' },
  { label: $t('activity.formModal.k767b3'), value: 'login_count' },
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
  { label: $t('activity.formModal.k65e0'), value: 'no_condition' },
  { label: $t('activity.formModal.vIP'), value: 'vip_level' },
  { label: $t('activity.formModal.k5145'), value: 'recharge_amount' },
  { label: $t('activity.formModal.k62532'), value: 'wagering_amount' },
];

const guessingObtainPointsOptions = [
  { label: $t('activity.formModal.k6709'), value: 'valid_bet' },
  { label: $t('activity.formModal.k5145'), value: 'recharge_amount' },
  { label: $t('activity.formModal.k767b3'), value: 'login_count' },
  { label: $t('activity.formModal.k5b8c10'), value: 'complete_task' },
];

// Methods for Newcomer Bonus Specific Fields
const addNewbieRewardSetting = () => {
  formData.newbieRewardSettings.push({
    firstDepositAmount: '',
    rewardAmount: '',
  });
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
    endTime: null,
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
  { label: $t('activity.formModal.k99962'), value: 'first_deposit_coupon' },
  { label: $t('activity.formModal.k65b04'), value: 'newcomer_gift' },
  { label: $t('activity.formModal.k6ce82'), value: 'registration_bonus' },
  { label: $t('activity.formModal.k901ak586b2'), value: 'code_redemption' },
];

// Watch for modal show/hide to reset form
watch(
  () => props.show,
  async (newShow) => {
    if (!newShow) {
      resetFormData();
      return;
    }

    await loadMemberTierOptions();

    if (props.editingItem?.config) {
      applyMemberTierSelectionFromConfig(props.editingItem.config);
    }
  },
);

// Watch for activity type changes to auto-set newbie promotion type
watch(
  () => formData.activityType,
  (newType) => {
    if (newType === 'newbie') {
      formData.newbiePromotionType = 'code_redemption';
    }
  },
);

// Watch for editing item changes - use immediate: true to load data when item is already set
watch(
  () => props.editingItem,
  (newItem) => {
    console.log(
      '🔍 Watch triggered - editingItem changed:',
      newItem ? 'has item' : 'no item',
    );
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
        title: resolveActivityTitle(newItem),
        activityType: (() => {
          const raw = (newItem as any).type || 'recharge';
          // Legacy BO used "invest"; API canonical type is "investment"
          return raw === 'invest' ? 'investment' : raw;
        })(),
        category: (newItem as any).category,
        currency: (newItem as any).currency,
        startTime: parseDate(
          (newItem as any).startsAt || (newItem as any).startAt,
        ),
        endTime: parseDate((newItem as any).endsAt || (newItem as any).endAt),
        platforms:
          (newItem as any).config?.platforms ||
          (newItem as any).platforms ||
          [],
        rules: (newItem as any).config?.rules || (newItem as any).rules || '',
        ruleTemplate:
          (newItem as any).config?.ruleTemplate ||
          ((newItem as any).config?.rules || (newItem as any).rules
            ? 'custom'
            : 'custom'),
        displayEnabled:
          (newItem as any).displayEnabled ??
          (newItem as any).config?.displayEnabled ??
          true,
        homepageDisplay:
          (newItem as any).homepageDisplay ??
          (newItem as any).config?.homepageDisplay ??
          false,
        promoImage:
          (newItem as any).promoUrl ||
          (newItem as any).iconUrl ||
          (newItem as any).config?.iconUrl ||
          undefined,
      });

      // Parse categories from comma-separated string to array
      if ((newItem as any).category) {
        formData.categories = (newItem as any).category
          .split(',')
          .filter(Boolean);
      } else {
        formData.categories = [];
      }

      // Parse currencies from comma-separated string to array
      if ((newItem as any).currency) {
        formData.currencies = (newItem as any).currency
          .split(',')
          .filter(Boolean);
      } else {
        formData.currencies = [];
      }

      // Floating icon settings
      const fic =
        (newItem as any).floatingIconConfig ||
        (newItem as any).config?.floatingIconConfig ||
        {};
      formData.floatingIcon.enabled =
        (newItem as any).floatingIconEnabled ??
        (newItem as any).config?.floatingIconEnabled ??
        false;

      // Load floating icon config from metadata if available
      if (fic.metadata) {
        formData.floatingIcon.showActivityName =
          fic.metadata.showActivityName ?? false;
        formData.floatingIcon.terminals =
          fic.metadata.terminals || formData.floatingIcon.terminals;
        formData.floatingIcon.displayMethod =
          fic.metadata.displayMethod || formData.floatingIcon.displayMethod;
        formData.floatingIcon.pages =
          fic.metadata.pages || formData.floatingIcon.pages;
        formData.floatingIcon.showBackground =
          fic.metadata.showBackground || formData.floatingIcon.showBackground;
        formData.floatingIcon.iconType =
          fic.metadata.iconType || formData.floatingIcon.iconType;
        formData.floatingIcon.icons =
          fic.metadata.icons || formData.floatingIcon.icons;
        formData.floatingIcon.selectedPresetIcon =
          fic.metadata.selectedPresetIcon || null;
        formData.floatingIcon.timeDisplay =
          fic.metadata.timeDisplay || formData.floatingIcon.timeDisplay;
      } else {
        // Fallback to direct properties for backward compatibility
        formData.floatingIcon.showActivityName = fic.showActivityName ?? false;
        formData.floatingIcon.terminals =
          fic.terminals || formData.floatingIcon.terminals;
        formData.floatingIcon.displayMethod =
          fic.displayMethod || formData.floatingIcon.displayMethod;
        formData.floatingIcon.pages = fic.pages || formData.floatingIcon.pages;
        formData.floatingIcon.showBackground =
          fic.showBackground || formData.floatingIcon.showBackground;
        formData.floatingIcon.iconType =
          fic.iconType || formData.floatingIcon.iconType;
        formData.floatingIcon.icons = fic.icons || formData.floatingIcon.icons;
        formData.floatingIcon.selectedPresetIcon =
          fic.selectedPresetIcon || null;
        formData.floatingIcon.timeDisplay =
          fic.timeDisplay || formData.floatingIcon.timeDisplay;
      }

      // Load position from floatingIconConfig and convert underscores to dashes for backward compatibility
      formData.floatingIcon.position = (
        fic.position || formData.floatingIcon.position
      ).replace('_', '-');

      // Load icon from floatingIconConfig.iconUrl
      if (fic.iconUrl) {
        formData.floatingIcon.icons.general = fic.iconUrl;
      }

      // Promotion fields - convert from backend to frontend format
      formData.promotionAccumulatedRecharge =
        (newItem as any).config?.promotionAccumulatedRecharge?.toString() || '';

      // Auto-set newbie promotion type if activity type is newbie
      if ((newItem as any).type === 'newbie') {
        formData.newbiePromotionType = 'code_redemption';
      }
      formData.promotionAccumulatedRechargeDays =
        (newItem as any).config?.promotionAccumulatedRechargeDays?.toString() ||
        '';
      formData.promotionAccumulatedRechargeCount =
        (
          newItem as any
        ).config?.promotionAccumulatedRechargeCount?.toString() || '';
      formData.promotionAccumulatedWagering =
        (newItem as any).config?.promotionAccumulatedWagering?.toString() || '';
      const promoConfig = (newItem as any).config || {};
      const legacyWageringConfig = promoConfig.wageringPlatformConfig;
      const savedPromotionConfig = promoConfig.promotionWageringPlatformConfig;
      formData.promotionWageringPlatform =
        promoConfig.promotionWageringPlatform ||
        (promoConfig.wageringPlatform &&
        promoConfig.wageringPlatform !== 'all_platforms'
          ? promoConfig.wageringPlatform
          : 'all_platforms');
      const normalizePromotionPlatformConfig = (cfg: any) => {
        if (!cfg?.selectedPlatforms?.length) {
          return (
            cfg ?? {
              selectedPlatforms: [],
              platformIds: [],
            }
          );
        }
        const selectedPlatforms = cfg.selectedPlatforms.map((p: any) => {
          const raw = p?.platformId;
          const platformId =
            typeof raw === 'number'
              ? raw
              : parseInt(String(raw ?? '').trim(), 10);
          return {
            ...p,
            platformId: Number.isNaN(platformId) ? raw : platformId,
          };
        });
        return {
          ...cfg,
          selectedPlatforms,
          platformIds: selectedPlatforms.map((p: any) => p.platformId),
        };
      };
      formData.promotionWageringPlatformConfig =
        normalizePromotionPlatformConfig(
          savedPromotionConfig?.selectedPlatforms?.length > 0
            ? savedPromotionConfig
            : legacyWageringConfig?.selectedPlatforms?.length > 0
              ? legacyWageringConfig
              : {
                  selectedPlatforms: [],
                  platformIds: [],
                },
        );
      formData.promotionDownloadAppLogin =
        (newItem as any).config?.promotionDownloadAppLogin ?? false;
      formData.promotionSameIPLimit =
        (newItem as any).config?.promotionSameIPLimit?.toString() || '';
      formData.promotionSameDeviceLimit =
        (newItem as any).config?.promotionSameDeviceLimit?.toString() || '';
      formData.promotionAllowSameTypeClaim =
        (newItem as any).config?.promotionAllowSameTypeClaim ??
        !((newItem as any).config?.restrictions || []).includes(
          'same_activity',
        );
      formData.promotionRewardType =
        mapBackendToFrontendRewardType(
          (newItem as any).config?.promotionRewardType,
        ) || formData.promotionRewardType;
      formData.promotionDisplayOnAgentPage =
        (newItem as any).config?.promotionDisplayOnAgentPage ?? false;
      formData.promotionDistributionMethod =
        mapBackendToFrontendDistributionMethod(
          (newItem as any).config?.promotionDistributionMethod,
        ) || formData.promotionDistributionMethod;
      formData.promotionDisplayClaimMethod =
        (newItem as any).config?.promotionDisplayClaimMethod ||
        formData.promotionDisplayClaimMethod;
      formData.promotionDisplayAmount = (newItem as any).config
        ?.promotionDisplayAmount
        ? 'show'
        : 'hide';
      formData.promotionRewardSettings =
        (newItem as any).config?.promotionRewardSettings?.map(
          (setting: any) => ({
            effectivePromotionCount: setting.condition || '',
            rewardAmount: setting.rewardValue?.toString() || '',
          }),
        ) || formData.promotionRewardSettings;

      // Keep backward compatibility by syncing the new switch with legacy restriction.
      if (formData.promotionAllowSameTypeClaim) {
        formData.restrictions = formData.restrictions.filter(
          (item) => item !== 'same_activity',
        );
      } else if (!formData.restrictions.includes('same_activity')) {
        formData.restrictions.push('same_activity');
      }

      // Load restrictions and conditions
      formData.restrictions = (newItem as any).config?.restrictions || [];
      applyMemberTierSelectionFromConfig((newItem as any).config || {});
      formData.platformRestriction =
        (newItem as any).config?.platformRestriction || 'no_limit';
      formData.withdrawalRestriction =
        (newItem as any).config?.withdrawalRestriction || 'no_limit';
      formData.specifyChannel =
        (newItem as any).config?.specifyChannel ?? false;

      // Load audit settings
      formData.auditSettings = {
        auditRequired: (newItem as any).config?.auditRequired ?? true,
        auditMultiplier: (newItem as any).config?.auditMultiplier ?? 1.0,
        // auditCompletionTimeHours removed - fixed to 24 hours
        auditManualReviewRequired:
          (newItem as any).config?.auditManualReviewRequired ?? false,
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
        customJumpConfig: customConfig.customJumpConfig,
      });

      // Load custom display method (root first, then config — matches API transformActivity)
      const rootCustom = newItem as any;
      if (rootCustom.customDisplayMethod || customConfig.customDisplayMethod) {
        formData.customDisplayMethod =
          rootCustom.customDisplayMethod || customConfig.customDisplayMethod;
      }

      if (activityType === 'custom') {
        formData.customPageContent =
          rootCustom.customPageContent ||
          customConfig.customPageContent ||
          customConfig.pageContent ||
          '';
      }

      // Load custom jump type - root first (API transformActivity hoists these out of config)
      const rootJumpConfig =
        rootCustom.customJumpConfig ?? customConfig.customJumpConfig;
      if (
        rootCustom.customJumpType !== undefined &&
        rootCustom.customJumpType !== null
      ) {
        formData.customJumpType = rootCustom.customJumpType;
      } else if (
        customConfig.customJumpType !== undefined &&
        customConfig.customJumpType !== null
      ) {
        formData.customJumpType = customConfig.customJumpType;
      } else if (rootJumpConfig?.jumpMode) {
        const jumpMode = rootJumpConfig.jumpMode;
        if (jumpMode === 'URL') {
          formData.customJumpType = 'external_link';
        } else if (jumpMode === 'ACTIVITY') {
          formData.customJumpType = 'activity';
        } else if (jumpMode === 'TASK') {
          formData.customJumpType = 'task';
        }
      }

      // Load custom target URL - root first, even when displayMethod is builtin_page
      if (
        rootCustom.customTargetUrl !== undefined &&
        rootCustom.customTargetUrl !== null &&
        rootCustom.customTargetUrl !== ''
      ) {
        formData.customTargetUrl = rootCustom.customTargetUrl;
      } else if (
        customConfig.customTargetUrl !== undefined &&
        customConfig.customTargetUrl !== null
      ) {
        formData.customTargetUrl = customConfig.customTargetUrl;
      } else if (rootJumpConfig?.targetUrl) {
        formData.customTargetUrl = rootJumpConfig.targetUrl;
      } else {
        formData.customTargetUrl = '';
      }

      // Handle customOpenInNewWindow - root first, then config
      const openInNewWindowValue =
        rootCustom.customOpenInNewWindow ??
        rootJumpConfig?.openInNewWindow ??
        customConfig.customOpenInNewWindow ??
        customConfig.customJumpConfig?.openInNewWindow ??
        undefined;

      // Convert to string format that the form expects ('true' or 'false')
      if (openInNewWindowValue !== undefined) {
        if (typeof openInNewWindowValue === 'boolean') {
          formData.customOpenInNewWindow = openInNewWindowValue
            ? 'true'
            : 'false';
        } else if (typeof openInNewWindowValue === 'string') {
          // Handle string values 'true', 'false', '1', '0', etc.
          formData.customOpenInNewWindow =
            openInNewWindowValue === 'true' || openInNewWindowValue === '1'
              ? 'true'
              : 'false';
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
        rawOpenInNewWindowValue: openInNewWindowValue,
      });

      // ========================================
      // Load recharge specific configuration
      // ========================================
      if ((newItem as any).type === 'recharge') {
        // Load recharge-specific fields from root level first, then config
        formData.condition =
          (newItem as any).condition ??
          (newItem as any).config?.condition ??
          'first_deposit';
        formData.distributionMethod =
          (newItem as any).distributionMethod ??
          (newItem as any).config?.distributionMethod ??
          'player_claim_expires';
        formData.claimTime =
          (newItem as any).claimTime ??
          (newItem as any).config?.claimTime ??
          'real_time';
        formData.claimCount =
          (newItem as any).claimCount ??
          (newItem as any).config?.claimCount ??
          'claim_individually';
        formData.rechargeAmounts =
          (newItem as any).rechargeAmounts ??
          (newItem as any).config?.rechargeAmounts ??
          formData.rechargeAmounts;
        formData.rechargeMethods =
          (newItem as any).rechargeMethods ??
          (newItem as any).config?.rechargeMethods ??
          formData.rechargeMethods;
        formData.bonusMethod =
          (newItem as any).bonusMethod ??
          (newItem as any).config?.bonusMethod ??
          'fixed';
        formData.participationMethod =
          (newItem as any).participationMethod ??
          (newItem as any).config?.participationMethod ??
          'auto';
        formData.beforeLoginPopup =
          (newItem as any).beforeLoginPopup ??
          (newItem as any).config?.beforeLoginPopup ??
          'none';
        formData.afterLoginPopup =
          (newItem as any).afterLoginPopup ??
          (newItem as any).config?.afterLoginPopup ??
          'none';
        formData.directPopupAfterRecharge =
          (newItem as any).directPopupAfterRecharge ??
          (newItem as any).config?.directPopupAfterRecharge ??
          false;
        formData.rewardExpirationDays =
          (newItem as any).rewardExpirationDays ??
          (newItem as any).config?.rewardExpirationDays ??
          1;

        // Transform rechargeAmounts if needed (handle both formats)
        if (
          formData.rechargeAmounts &&
          Array.isArray(formData.rechargeAmounts)
        ) {
          formData.rechargeAmounts = formData.rechargeAmounts.map(
            (item: any) => ({
              betAmount:
                item.betAmount?.toString() ||
                item.rechargeAmount?.toString() ||
                '',
              rewardAmount: item.rewardAmount || 0.0,
            }),
          );
        }

        // Load cycleMethod if condition is accumulate_recharge
        if (formData.condition === 'accumulate_recharge') {
          formData.cycleMethod =
            (newItem as any).config?.cycleMethod ||
            (newItem as any).cycleMethod ||
            'daily_cumulative';
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
          rewardExpirationDays: formData.rewardExpirationDays,
        });
      }

      // Load wagering specific configuration
      formData.loopMethod =
        (newItem as any).config?.loopMethod || 'daily_cumulative';
      formData.isTimeLimited = (newItem as any).config?.isTimeLimited ?? false;
      // Only set distributionMethod and claimTime if not already set by recharge section
      if ((newItem as any).type !== 'recharge') {
        formData.distributionMethod =
          (newItem as any).config?.distributionMethod || 'player_claim_expires';
        formData.claimTime = (newItem as any).config?.claimTime || 'next_day';
      }
      formData.selectTime = (newItem as any).config?.selectTime || 0;
      formData.wageringPlatform = Array.isArray(
        (newItem as any).config?.wageringPlatform,
      )
        ? (newItem as any).config.wageringPlatform[0] || 'all_platforms'
        : (newItem as any).config?.wageringPlatform ||
          formData.wageringPlatform;
      formData.claimCount =
        (newItem as any).config?.claimCount || 'continuous_claim';
      formData.wageringRewardExpiryDays =
        (newItem as any).config?.wageringRewardExpiryDays || 1;
      formData.wageringRewardSettings =
        (newItem as any).config?.wageringRewardSettings?.map(
          (setting: any) => ({
            effectiveWageringAmount:
              setting.effectiveWageringAmount?.toString() || '',
            rewardAmount: setting.rewardAmount?.toString() || '',
          }),
        ) || formData.wageringRewardSettings;

      // Load red packet specific configuration
      formData.redPacketType =
        (newItem as any).config?.redPacketType || 'fixed';
      formData.redPacketClaimCondition =
        (newItem as any).config?.redPacketClaimCondition || 'none';
      formData.redPacketRewardType =
        (newItem as any).config?.redPacketRewardType || 'fixed';
      formData.securityVerification =
        (newItem as any).config?.securityVerification || false;
      formData.redPacketTotalAmount =
        (newItem as any).config?.redPacketTotalAmount || 1000;
      formData.redPacketCountPerPeriod =
        (newItem as any).config?.redPacketCountPerPeriod || 10000;
      formData.actualRedPacketMin =
        (newItem as any).config?.actualRedPacketMin || 0.02;
      formData.actualRedPacketMax =
        (newItem as any).config?.actualRedPacketMax || 0.5;
      formData.displayedRedPacketMin =
        (newItem as any).config?.displayedRedPacketMin || 0.01;
      formData.displayedRedPacketMax =
        (newItem as any).config?.displayedRedPacketMax || 378.0;
      formData.grabLimitPerPeriod =
        (newItem as any).config?.grabLimitPerPeriod || 1;
      formData.dailyGrabLimitType =
        (newItem as any).config?.dailyGrabLimitType || 'fixed';
      formData.dailyGrabLimit = (newItem as any).config?.dailyGrabLimit || 3;
      formData.totalGrabLimit = (newItem as any).config?.totalGrabLimit || 1;
      formData.expectedBonus = (newItem as any).config?.expectedBonus || 1.0;
      formData.redPacketTotalCountLimit =
        (newItem as any).config?.redPacketTotalCountLimit || 1;
      formData.redPacketDisplayStyle =
        (newItem as any).config?.redPacketDisplayStyle || 'modal';
      formData.redPacketDailyDistributionTimes =
        (newItem as any).config?.redPacketDailyDistributionTimes?.map(
          (time: any) => ({
            startTime: time.startTime || null,
            endTime: time.endTime || null,
          }),
        ) || formData.redPacketDailyDistributionTimes;

      // Load check-in specific configuration
      formData.checkinWageringPlatform = Array.isArray(
        (newItem as any).config?.checkinWageringPlatform,
      )
        ? (newItem as any).config.checkinWageringPlatform[0] || 'all_platforms'
        : (newItem as any).config?.checkinWageringPlatform ||
          formData.checkinWageringPlatform;
      formData.checkinRechargeMethods =
        (newItem as any).config?.checkinRechargeMethods ||
        formData.checkinRechargeMethods;
      formData.signinMethod =
        (newItem as any).config?.signinMethod || formData.signinMethod;
      formData.signinPeriod =
        (newItem as any).config?.signinPeriod?.toString() ||
        formData.signinPeriod;
      formData.monthlyReset =
        (newItem as any).config?.monthlyReset ?? formData.monthlyReset;
      formData.checkinPopupAfterRecharge =
        (newItem as any).config?.checkinPopupAfterRecharge ??
        formData.checkinPopupAfterRecharge;
      formData.enableMakeupSignin =
        (newItem as any).config?.enableMakeupSignin ??
        formData.enableMakeupSignin;
      formData.checkinBeforeLoginPopup =
        (newItem as any).config?.checkinBeforeLoginPopup ||
        formData.checkinBeforeLoginPopup;
      formData.checkinAfterLoginPopup =
        (newItem as any).config?.checkinAfterLoginPopup ||
        formData.checkinAfterLoginPopup;
      formData.displayStyle =
        (newItem as any).config?.displayStyle || formData.displayStyle;
      formData.checkinRewardMethod =
        (newItem as any).config?.checkinRewardMethod ||
        formData.checkinRewardMethod;
      // Handle checkinRewardSettings with proper type checking
      const checkinSettings = (newItem as any).config?.checkinRewardSettings;
      if (Array.isArray(checkinSettings)) {
        formData.checkinRewardSettings = checkinSettings.map(
          (setting: any, index: number) => ({
            type: setting.rewardType || 'fixed',
            rewardAmount: setting.rewardValue || 0,
            rechargeRequirement: setting.rechargeRequirement || 0,
            wageringRequirement: setting.wageringRequirement || 0,
            additionalReward: setting.extraReward || 0,
            checkinIcon: setting.iconUrl || null,
          }),
        );
      }

      // ========================================
      // Load rescue specific configuration
      // ========================================
      console.log('🔍 Loading rescue config from:', (newItem as any).config);
      formData.rescueWageringPlatform = Array.isArray(
        (newItem as any).config?.rescueWageringPlatform,
      )
        ? (newItem as any).config.rescueWageringPlatform[0] || 'all_platforms'
        : (newItem as any).config?.rescueWageringPlatform ||
          formData.rescueWageringPlatform;

      // Load rescue platform config
      (formData as any).rescueWageringPlatformConfig = (newItem as any).config
        ?.rescueWageringPlatformConfig || {
        selectedPlatforms: [],
        platformIds: [],
      };

      formData.deductDiscounts =
        (newItem as any).config?.deductDiscounts ?? formData.deductDiscounts;
      const rawLossRange = (newItem as any).config?.lossRange;
      if (typeof rawLossRange === 'string') {
        formData.lossRange = rawLossRange || formData.lossRange;
      } else {
        formData.lossRange =
          mapLossRangeFromObject(rawLossRange) || formData.lossRange;
      }
      formData.newbieDaysLimit =
        Number((newItem as any).config?.newbieDaysLimit) ||
        formData.newbieDaysLimit;
      formData.dailyRewardLimit =
        (newItem as any).config?.dailyRewardLimit?.toString() ||
        formData.dailyRewardLimit;
      formData.rescueDistributionMethod =
        mapBackendToFrontendRescueDistributionMethod(
          (newItem as any).config?.rescueDistributionMethod,
        ) || formData.rescueDistributionMethod;
      formData.rescueClaimTime =
        mapRescueClaimTimeFromNumber(
          (newItem as any).config?.rescueClaimTime,
        ) || formData.rescueClaimTime;
      formData.rescueSelectTime =
        (newItem as any).config?.rescueSelectTime || formData.rescueSelectTime;
      formData.rescueRewardExpiryDays =
        (newItem as any).config?.rescueRewardExpiryDays ||
        formData.rescueRewardExpiryDays;
      formData.rewardType =
        mapBackendToFrontendRewardType((newItem as any).config?.rewardType) ||
        formData.rewardType;

      // Load rescue reward settings
      const rescueSettings = (newItem as any).config?.rescueRewardSettings;
      if (Array.isArray(rescueSettings)) {
        formData.rescueRewardSettings = rescueSettings.map((setting: any) => ({
          lossAmount:
            setting.lossMin?.toString() || setting.lossAmount?.toString() || '',
          returnRatio: setting.rescueRate || setting.returnRatio || 0,
        }));
      }

      // ========================================
      // Load withdrawal activity configuration
      // ========================================
      const normalizeRewardCycle = (raw: unknown) => {
        const v = String(raw || '');
        if (v === 'day' || v === 'daily') return 'daily';
        if (v === 'week' || v === 'weekly') return 'weekly';
        if (v === 'month' || v === 'monthly') return 'monthly';
        return formData.rewardCycle;
      };
      const normalizeGiftMode = (raw: unknown) => {
        const v = String(raw || '');
        if (v === 'pending' || v === 'pending_claim') return 'pending_claim';
        if (v === 'add_to_withdraw' || v === 'add_into_withdrawal')
          return 'add_to_withdraw';
        return formData.giftMode;
      };
      formData.rewardCycle = normalizeRewardCycle(
        (newItem as any).config?.rewardCycle ??
          (newItem as any).config?.cycleMethod,
      );
      formData.giftMode = normalizeGiftMode((newItem as any).config?.giftMode);
      formData.claimMode =
        (newItem as any).config?.claimMode ||
        (newItem as any).config?.claimCount ||
        formData.claimMode;
      formData.accumulateMode =
        (newItem as any).config?.accumulateMode || formData.accumulateMode;
      formData.withdrawalRewardType =
        (newItem as any).config?.rewardType ||
        (newItem as any).config?.giftType ||
        formData.withdrawalRewardType;
      formData.maxRewardAmount =
        (newItem as any).config?.maxRewardAmount?.toString() ||
        formData.maxRewardAmount;
      const withdrawalTiers = (newItem as any).config?.tiers;
      if (Array.isArray(withdrawalTiers) && withdrawalTiers.length > 0) {
        formData.withdrawalTiers = withdrawalTiers.map((tier: any) => ({
          withdrawMin: tier.withdrawMin?.toString() || '',
          rewardValue: tier.rewardValue?.toString() || '',
        }));
      }

      // ========================================
      // Load agent / return_bonus / ranking configuration
      // ========================================
      const cfg = (newItem as any).config || {};
      formData.agentDisplayOnAgentPage =
        cfg.agentDisplayOnAgentPage ?? formData.agentDisplayOnAgentPage;
      formData.agentDistributionMethod =
        cfg.agentDistributionMethod || formData.agentDistributionMethod;
      formData.agentRewardClaimExpiryDays =
        cfg.agentRewardClaimExpiryDays || formData.agentRewardClaimExpiryDays;
      formData.agentRewardCycle =
        cfg.agentRewardCycle || formData.agentRewardCycle;
      formData.agentRewardType =
        cfg.agentRewardType || formData.agentRewardType;
      formData.agentRewardAmountType =
        cfg.agentRewardAmountType || formData.agentRewardAmountType;
      if (Array.isArray(cfg.agentRewardSettings) && cfg.agentRewardSettings.length) {
        formData.agentRewardSettings = cfg.agentRewardSettings.map((s: any) => ({
          rebateAmount: String(s.rebateAmount ?? s.minRecharge ?? ''),
          rewardAmount: String(s.rewardAmount ?? s.rewardValue ?? ''),
        }));
      }

      formData.inactiveDaysMin =
        Number(cfg.inactiveDaysMin) || formData.inactiveDaysMin;
      formData.rewardAmount =
        Number(cfg.rewardAmount ?? cfg.returnBonusRewards?.[0]?.rewardAmount) ||
        formData.rewardAmount;
      formData.requiresDeposit =
        cfg.requiresDeposit ?? formData.requiresDeposit;
      formData.minDepositAmount =
        Number(cfg.minDepositAmount) || formData.minDepositAmount;
      formData.depositInactiveDaysMin =
        Number(
          cfg.depositInactiveDaysMin ??
            cfg.returnBonusRewards?.find((r: any) => r.rule === 'deposit_gap')
              ?.inactiveDaysMin,
        ) || formData.depositInactiveDaysMin;
      formData.depositRewardAmount =
        Number(
          cfg.depositRewardAmount ??
            cfg.depositGapRewardAmount ??
            cfg.returnBonusRewards?.find((r: any) => r.rule === 'deposit_gap')
              ?.rewardAmount,
        ) || formData.depositRewardAmount;

      formData.rankingMetric = cfg.rankingMetric || formData.rankingMetric;
      formData.rankingPeriod = cfg.rankingPeriod || formData.rankingPeriod;
      formData.robotCount =
        Number(cfg.robotCount ?? cfg.rankingRobotCount) || formData.robotCount;
      if (Array.isArray(cfg.rankingRewards) && cfg.rankingRewards.length) {
        formData.rankingRewards = cfg.rankingRewards.map((r: any) => ({
          rankFrom: Number(r.rankFrom) || 1,
          rankTo: Number(r.rankTo) || 1,
          rewardValue: Number(r.rewardValue ?? r.rewardAmount) || 0,
        }));
      }

      // ========================================
      // Load newbie bonus specific configuration
      // ========================================
      console.log(
        '🔍 Loading newbie bonus config from:',
        (newItem as any).config,
      );
      formData.newbiePromotionType =
        mapNewbiePromotionTypeFromBackend(
          (newItem as any).config?.newbiePromotionType,
        ) || formData.newbiePromotionType;
      formData.newbieRedemptionCode =
        (newItem as any).config?.newbieRedemptionCode ||
        formData.newbieRedemptionCode;
      formData.newbieTotalUsageCount =
        (newItem as any).config?.newbieTotalUsageCount?.toString() ||
        formData.newbieTotalUsageCount;
      formData.newbieStartTime =
        parseDate((newItem as any).config?.newbieStartTime) ||
        formData.newbieStartTime;
      formData.newbieEndTime =
        parseDate((newItem as any).config?.newbieEndTime) ||
        formData.newbieEndTime;
      formData.newbieRedemptionMethod =
        mapNewbieRedemptionMethodFromBackend(
          (newItem as any).config?.newbieRedemptionMethod,
        ) || formData.newbieRedemptionMethod;
      formData.newbiePopupAfterTopup =
        (newItem as any).config?.newbiePopupAfterTopup ??
        formData.newbiePopupAfterTopup;
      formData.newbieGiftMethod =
        mapNewbieGiftMethodFromBackend(
          (newItem as any).config?.newbieGiftMethod,
        ) || formData.newbieGiftMethod;
      formData.newbieDisplayBonus =
        (newItem as any).config?.newbieDisplayBonus ??
        formData.newbieDisplayBonus;
      formData.newbieWithdrawalThreshold =
        (newItem as any).config?.newbieWithdrawalThreshold?.toString() ||
        formData.newbieWithdrawalThreshold;
      formData.newbieActualGiftMin =
        (newItem as any).config?.newbieActualGiftMin?.toString() ||
        formData.newbieActualGiftMin;
      formData.newbieActualGiftMax =
        (newItem as any).config?.newbieActualGiftMax?.toString() ||
        formData.newbieActualGiftMax;
      formData.newbieDisplayGiftMin =
        (newItem as any).config?.newbieDisplayGiftMin?.toString() ||
        formData.newbieDisplayGiftMin;
      formData.newbieDisplayGiftMax =
        (newItem as any).config?.newbieDisplayGiftMax?.toString() ||
        formData.newbieDisplayGiftMax;
      formData.newbieExpectedBonus =
        (newItem as any).config?.newbieExpectedBonus?.toString() ||
        formData.newbieExpectedBonus;

      // Load newbie redemption settings
      const newbieRedemptionSettings = (newItem as any).config
        ?.newbieRedemptionSettings;
      if (
        Array.isArray(newbieRedemptionSettings) &&
        newbieRedemptionSettings.length > 0
      ) {
        formData.newbieRedemptionSettings = newbieRedemptionSettings.map(
          (setting: any) => ({
            redemptionCode: setting.redemptionCode || '',
            totalUsageCount: setting.totalUsageCount?.toString() || '',
            startTime: parseDate(setting.startTime) || null,
            endTime: parseDate(setting.endTime) || null,
          }),
        );
      }

      // Load newbie reward settings
      const newbieRewardSettings = (newItem as any).config
        ?.newbieRewardSettings;
      if (
        Array.isArray(newbieRewardSettings) &&
        newbieRewardSettings.length > 0
      ) {
        formData.newbieRewardSettings = newbieRewardSettings.map(
          (setting: any) => ({
            firstDepositAmount:
              (
                setting.firstDepositMin || setting.firstDepositAmount
              )?.toString() || '',
            rewardAmount:
              (setting.rewardValue || setting.rewardAmount)?.toString() || '',
          }),
        );
      }
    }
  },
  { immediate: true },
);

const addWageringRewardSetting = () => {
  formData.wageringRewardSettings.push({
    effectiveWageringAmount: '',
    rewardAmount: '',
  });
};
const removeWageringRewardSetting = (index: number) => {
  formData.wageringRewardSettings.splice(index, 1);
};

const addRedPacketDailyDistributionTime = () => {
  formData.redPacketDailyDistributionTimes.push({
    startTime: null,
    endTime: null,
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

.activity-rules-preview {
  max-height: 420px;
  overflow-y: auto;
  padding: 12px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #e5e7eb;
  font-size: 13px;
  line-height: 1.65;
  color: #374151;
  word-break: break-word;
}

.activity-rules-preview--system {
  background: #f9fafb;
  white-space: pre-wrap;
}

.activity-rules-preview :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.activity-rules-preview :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 8px 0;
}

.activity-rules-preview :deep(table td),
.activity-rules-preview :deep(table th) {
  border: 1px solid #e5e7eb;
  padding: 6px 8px;
}

.activity-rules-preview :deep(ul),
.activity-rules-preview :deep(ol) {
  padding-left: 1.25rem;
  margin: 0.5rem 0;
}

.activity-rules-preview :deep(p) {
  margin: 0.5rem 0;
}

.activity-rules-preview :deep(h1),
.activity-rules-preview :deep(h2),
.activity-rules-preview :deep(h3) {
  margin: 0.75rem 0 0.5rem;
  font-weight: 600;
  color: #111827;
}
</style>
