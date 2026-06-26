<template>
  <n-modal
    v-model:show="visibleModel"
    :mask-closable="false"
    preset="card"
    :title="$t('user.userDetail.title')"
    style="width: 98vw; max-width: 1600px; height: 90vh"
    size="huge"
    @close="handleClose"
  >
    <template #header-extra>
      <div class="flex gap-2">
        <n-button size="small" @click="handleRefresh"> {{ $t('common.refresh') }} </n-button>
        <n-button size="small" type="primary" @click="handleEdit">
          {{ $t('user.userDetail.edit') }}
        </n-button>
      </div>
    </template>

    <div v-if="loading" class="flex h-96 items-center justify-center">
      <div class="w-full max-w-4xl">
        <n-skeleton :rows="3" />
        <div class="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-4">
          <div class="xl:col-span-3">
            <n-skeleton :rows="6" />
          </div>
          <div class="xl:col-span-1">
            <n-skeleton :rows="4" />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="userDetail" class="user-detail-content">
      <!-- User Info Bar (Fixed below tabs) -->
      <div class="user-info-bar">
        <!-- Profile Photo -->
        <span
          v-if="userDetail.avatarUrl || userDetail.idPhotoUrl"
          class="info-item"
        >
          <img
            :src="userDetail.avatarUrl || userDetail.idPhotoUrl"
            alt="Profile Photo"
            class="profile-photo"
            style="
              width: 40px;
              height: 40px;
              border-radius: 50%;
              object-fit: cover;
              margin-right: 8px;
            "
          />
        </span>
        <span class="info-item">
          <span class="info-label">{{ $t('common.currency') }}:</span>
          <span class="info-value">{{ userDetail.currency || 'BRL' }}</span>
        </span>
        <span class="info-item">
          <span class="info-label">{{ $t('user.allMembers.memberAccount') }}:</span>
          <span class="info-value">{{ userDetail.account }}</span>
          <n-button
            text
            size="tiny"
            @click="copyToClipboard(userDetail.account)"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              style="color: #0ea5e9"
            >
              <path
                d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
              />
            </svg>
          </n-button>
        </span>
        <span class="info-item">
          <span class="info-label">{{ $t('user.allMembers.memberId') }}:</span>
          <span class="info-value">{{
            userDetail.userID || userDetail.id
          }}</span>
          <n-button
            text
            size="tiny"
            @click="copyToClipboard(String(userDetail.userID || userDetail.id))"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              style="color: #0ea5e9"
            >
              <path
                d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
              />
            </svg>
          </n-button>
        </span>
      </div>

      <n-tabs v-model:value="activeTab" type="line" animated>
        <!-- Tab 1: 会员概览 -->
        <n-tab-pane name="overview" :tab="$t('user.userDetail.overview')">
          <!-- Two-Column Layout matching screenshot -->
          <div class="user-detail-table">
            <table class="detail-table-two-column">
              <tbody>
                <!-- Row 1: 账户状态 & 会员标签 -->
                <tr>
                  <td class="label-cell">{{ $t('user.userDetail.accountStatus') }}</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <n-tag
                          :type="getStatusType(userDetail.status)"
                          size="small"
                        >
                          {{
                            getStatusLabel(userDetail.status) ||
                            userDetail.accountStatusDisplay ||
                            userDetail.accountStatus ||
                            $t('user.userDetail.unknownStatus')
                          }}
                        </n-tag>
                        <span
                          v-if="(userDetail as any).accountStatusReason"
                          class="ml-2 text-gray-500"
                          >({{ (userDetail as any).accountStatusReason }})</span
                        >
                      </div>
                      <div class="content-right">
                        <n-button
                          text
                          type="primary"
                          size="tiny"
                          @click="handleShowStatusModal"
                          >{{ $t('user.userDetail.modifyStatus') }}</n-button
                        >
                      </div>
                    </div>
                  </td>
                  <td class="label-cell">{{ $t('user.userDetail.memberTags') }}</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <template
                          v-if="
                            userDetail.memberTags &&
                            userDetail.memberTags.length > 0
                          "
                        >
                          <n-tag
                            v-for="tag in userDetail.memberTags"
                            :key="tag"
                            size="small"
                            type="info"
                          >
                            {{ tag }}
                          </n-tag>
                        </template>
                        <span v-else>--</span>
                      </div>
                      <div class="content-right">
                        <n-button
                          text
                          type="warning"
                          size="tiny"
                          @click="showTagModal = true"
                          >{{ $t('user.userDetail.modifyTags') }}</n-button
                        >
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Row 2: 账号类型 & 会员层级 -->
                <tr>
                  <td class="label-cell">{{ $t('user.userDetail.accountType') }}</td>
                  <td class="value-cell">{{ userDetail.accountType }}</td>
                  <td class="label-cell">{{ $t('user.userDetail.memberTier') }}</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span>{{ userDetail.memberLevel }}</span>
                      </div>
                      <div class="content-right">
                        <n-button
                          text
                          type="warning"
                          size="tiny"
                          @click="showLevelModal = true"
                          >{{ $t('user.userDetail.modifyTier') }}</n-button
                        >
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Row 3: 自我禁止状态 & 登录密码 -->
                <tr>
                  <td class="label-cell">{{ $t('user.userDetail.selfExclusion') }}</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span>{{ userDetail.selfBanStatus || '--' }}</span>
                      </div>
                      <div class="content-right">
                        <n-button text type="info" size="tiny"
                          >{{ $t('user.userDetail.restoreNormal') }}</n-button
                        >
                      </div>
                    </div>
                  </td>
                  <td class="label-cell">{{ $t('user.userDetail.loginPassword') }}</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span
                          >{{ $t('user.userDetail.sameLoginPasswordCount') }}(
                          <span
                            v-if="(userDetail.passwordMatchCount || 0) > 0"
                            class="cursor-pointer font-semibold text-blue-600 hover:underline"
                            @click="handleFilterBySamePassword"
                          >
                            {{ userDetail.passwordMatchCount || 0 }}
                          </span>
                          <span v-else>{{
                            userDetail.passwordMatchCount || 0
                          }}</span>
                          )</span
                        >
                      </div>
                      <div class="content-right">
                        <n-button
                          text
                          type="primary"
                          size="tiny"
                          @click="showPasswordModal = true"
                          >{{ $t('user.userDetail.modifyLoginPassword') }}</n-button
                        >
                        <n-button text type="info" size="tiny"
                          >{{ $t('user.userDetail.batchProcess') }}</n-button
                        >
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Row 4: 上级代理 & 提现密码 -->
                <tr>
                  <td class="label-cell">{{ $t('user.userDetail.upperAgent') }}</td>
                  <td class="value-cell">
                    <span
                      v-if="
                        userDetail.invitedBy && userDetail.invitedBy !== $t('user.userDetail.none')
                      "
                      class="cursor-pointer text-blue-600 hover:underline"
                      @click="handleFilterByUpperAgent"
                    >
                      {{ userDetail.invitedBy }}
                    </span>
                    <span v-else>{{ $t('user.userDetail.none') }}</span>
                  </td>
                  <td class="label-cell">{{ $t('user.userDetail.withdrawPassword') }}</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span
                          >{{ $t('user.userDetail.sameWithdrawPinCount') }}(
                          <span
                            v-if="(userDetail.sameWithdrawalPinCount || 0) > 0"
                            class="cursor-pointer font-semibold text-blue-600 hover:underline"
                            @click="handleFilterBySameWithdrawalPin"
                          >
                            {{ userDetail.sameWithdrawalPinCount || 0 }}
                          </span>
                          <span v-else>{{
                            userDetail.sameWithdrawalPinCount || 0
                          }}</span>
                          )</span
                        >
                      </div>
                      <div class="content-right">
                        <n-button
                          text
                          type="warning"
                          size="tiny"
                          @click="handleResetWithdrawalPin"
                          >{{ $t('user.userDetail.resetWithdrawPassword') }}</n-button
                        >
                        <n-button text type="info" size="tiny"
                          >{{ $t('user.userDetail.batchProcess') }}</n-button
                        >
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Row 5: 代理佣金 & 提现账号 -->
                <tr>
                  <td class="label-cell">{{ $t('user.userDetail.agentCommission') }}</td>
                  <td class="value-cell">
                    {{ $t('user.userDetail.totalCommission') }}:
                    <span class="text-blue-600">{{
                      userDetail.totalCommission.toFixed(2)
                    }}</span>
                  </td>
                  <td class="label-cell">{{ $t('user.userDetail.withdrawAccounts') }}</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span
                          class="cursor-pointer text-blue-600 hover:underline"
                          @click="handleViewWithdrawalAccounts"
                        >
                          {{ userDetail.withdrawalAccountCount || 1 }}{{ $t('user.userDetail.units') }}
                        </span>
                        <span class="text-gray-500"
                          >{{ $t('user.userDetail.sameWithdrawAccountCount') }}(
                          <span
                            v-if="(userDetail.sameAccountCount || 0) > 0"
                            class="cursor-pointer font-semibold text-blue-600 hover:underline"
                            @click="handleFilterBySameWithdrawalAccount"
                          >
                            {{ userDetail.sameAccountCount || 0 }}
                          </span>
                          <span v-else>{{
                            userDetail.sameAccountCount || 0
                          }}</span>
                          )</span
                        >
                      </div>
                      <div class="content-right">
                        <n-button text type="info" size="tiny"
                          >{{ $t('user.userDetail.batchProcess') }}</n-button
                        >
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Row 6: 真实姓名 & 注册IP -->
                <tr>
                  <td class="label-cell">{{ $t('user.userDetail.realName') }}</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span
                          v-if="userDetail.realName"
                          class="cursor-pointer text-blue-600 hover:underline"
                          @click="handleFilterByName(userDetail.realName)"
                        >
                          {{ userDetail.realName }}
                        </span>
                        <span v-else>--</span>
                        <span class="text-gray-500"
                          >{{ $t('user.userDetail.sameNameRecent') }}({{
                            userDetail.sameRealNameCount || 0
                          }})</span
                        >
                      </div>
                      <div class="content-right">
                        <n-button text type="info" size="tiny"
                          >{{ $t('user.userDetail.batchProcess') }}</n-button
                        >
                      </div>
                    </div>
                  </td>
                  <td class="label-cell">{{ $t('user.userDetail.registerIp') }}</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span
                          v-if="userDetail.registrationIp"
                          class="cursor-pointer text-blue-600 hover:underline"
                          @click="handleFilterByRegistrationIp"
                        >
                          {{ userDetail.registrationIp }}
                        </span>
                        <span v-else>--</span>
                        <span class="text-gray-500"
                          >{{ $t('user.userDetail.registerTimeLabel') }}
                          {{
                            formatDateTime(userDetail.registrationTime)
                          }}
                          {{ $t('user.userDetail.registeredDays', [0]) }} {{ $t('user.userDetail.sameIpCount') }}(
                          <span
                            v-if="
                              (userDetail.sameRegIpCount ?? 0) > 0 &&
                              userDetail.registrationIp
                            "
                            class="cursor-pointer font-semibold text-blue-600 hover:underline"
                            @click="handleFilterBySameRegistrationIp"
                          >
                            {{ userDetail.sameRegIpCount ?? 0 }}
                          </span>
                          <span v-else>{{
                            userDetail.sameRegIpCount ?? 0
                          }}</span>
                          )</span
                        >
                      </div>
                      <div class="content-right">
                        <n-button
                          text
                          type="info"
                          size="tiny"
                          @click="handleViewAssociations('registration_ip')"
                          >{{ $t('user.userDetail.registerIpLink') }}</n-button
                        >
                        <n-button text size="tiny">{{ $t('user.userDetail.batchProcess') }}</n-button>
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Row 7: 会员币种 & 注册域名 -->
                <tr>
                  <td class="label-cell">{{ $t('user.userDetail.memberCurrency') }}</td>
                  <td class="value-cell">
                    <div class="flex items-center gap-1">
                      <span>{{ userDetail.currency }}</span>
                      <span class="ml-1">🇧🇷</span>
                    </div>
                  </td>
                  <td class="label-cell">{{ $t('user.userDetail.registerDomain') }}</td>
                  <td class="value-cell">
                    <span
                      v-if="userDetail.registrationDomain"
                      class="cursor-pointer text-blue-600 hover:underline"
                      @click="handleFilterByRegistrationDomain"
                    >
                      {{ userDetail.registrationDomain }}
                    </span>
                    <span v-else>--</span>
                  </td>
                </tr>

                <!-- Row 8: 账户余额 (full width row with many buttons) -->
                <tr>
                  <td class="label-cell">{{ $t('user.userDetail.accountBalance') }}</td>
                  <td class="value-cell" colspan="3">
                    <div class="cell-content">
                      <div class="content-left">
                        <span class="font-semibold text-blue-600">{{
                          userDetail.balance.toFixed(2)
                        }}</span>
                        <span class="text-gray-500">{{
                          $t('user.userDetail.availableFrozen', [
                            userDetail.balance.toFixed(2),
                            (userDetail.frozenBalance || 0).toFixed(2),
                          ])
                        }}</span>
                      </div>
                      <div class="content-right">
                        <n-button
                          text
                          type="success"
                          size="tiny"
                          @click="handleRefreshBalance"
                          :loading="loading"
                          >{{ $t('common.refresh') }}</n-button
                        >
                        <n-button text type="warning" size="tiny"
                          >{{ $t('user.userDetail.manualRecall') }}</n-button
                        >
                        <n-button
                          text
                          type="info"
                          size="tiny"
                          @click="handleViewTransactionHistory"
                          >{{ $t('user.userDetail.transactionRecords') }}</n-button
                        >
                        <n-button
                          text
                          type="success"
                          size="tiny"
                          @click="handleShowManualTransaction('credit')"
                          >{{ $t('user.userDetail.manualCredit') }}</n-button
                        >
                        <n-button
                          text
                          type="error"
                          size="tiny"
                          @click="handleShowManualTransaction('debit')"
                          >{{ $t('user.userDetail.manualDebit') }}</n-button
                        >
                        <n-button text size="tiny">{{ $t('user.userDetail.manualCreditBonus') }}</n-button>
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Row 9: 奖励钱包 & 累计充值 -->
                <tr>
                  <td class="label-cell">{{ $t('user.userDetail.rewardWallet') }}</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span>{{ userDetail.rewardWallet.toFixed(2) }}</span>
                      </div>
                      <div class="content-right">
                        <n-button text type="info" size="tiny">{{ $t('common.refresh') }}</n-button>
                      </div>
                    </div>
                  </td>
                  <td class="label-cell">{{ $t('user.userDetail.totalDeposit') }}</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span class="text-blue-600">{{
                          userDetail.totalDeposit.toFixed(2)
                        }}</span>
                        <span class="text-gray-500"
                          >{{ $t('user.userDetail.last24hDeposit') }}
                          {{
                            (userDetail.last24HoursDeposit || 0).toFixed(2)
                          }}
                          {{ $t('user.userDetail.maxSingleDeposit') }}
                          {{
                            (userDetail.maxSingleDeposit || 0).toFixed(0)
                          }}</span
                        >
                      </div>
                      <div class="content-right">
                        <n-button
                          text
                          type="primary"
                          size="tiny"
                          @click="handleNavigateToRecharge"
                          >{{ $t('user.userDetail.depositRecords') }}</n-button
                        >
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Row 10: 利息宝(累计收益) & 累计提现 -->
                <tr>
                  <td class="label-cell">{{ $t('user.userDetail.interestTreasureBalance') }}</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span
                          >{{ $t('user.userDetail.interestTreasure') }}:
                          <span class="text-blue-600">{{
                            userDetail.savingsBalance.toFixed(2)
                          }}</span></span
                        >
                        <span
                          >{{ $t('user.userDetail.cumulativeEarnings') }}:
                          {{ userDetail.totalSavingsEarned.toFixed(2) }}</span
                        >
                      </div>
                      <div class="content-right">
                        <n-button text type="info" size="tiny">{{ $t('common.refresh') }}</n-button>
                      </div>
                    </div>
                  </td>
                  <td class="label-cell">{{ $t('user.userDetail.totalWithdraw') }}</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span class="text-blue-600">{{
                          userDetail.totalWithdraw.toFixed(2)
                        }}</span>
                        <span class="text-gray-500"
                          >{{ $t('user.userDetail.last24hWithdraw') }}
                          {{
                            (userDetail.last24HoursWithdraw || 0).toFixed(2)
                          }}
                          {{ $t('user.userDetail.maxSingleWithdraw') }}
                          {{
                            (userDetail.maxSingleWithdraw || 0).toFixed(0)
                          }}</span
                        >
                        <span
                          v-if="(userDetail.totalManualDebits || 0) > 0"
                          class="ml-2 text-orange-500"
                        >
                          ({{ $t('user.userDetail.manualDeductLabel') }}:
                          {{ (userDetail.totalManualDebits || 0).toFixed(2) }})
                        </span>
                      </div>
                      <div class="content-right">
                        <n-button
                          text
                          type="info"
                          size="tiny"
                          @click="handleNavigateToWithdrawal"
                          >{{ $t('user.userDetail.withdrawRecords') }}</n-button
                        >
                        <n-button
                          text
                          type="warning"
                          size="tiny"
                          @click="handleNavigateToWageringAudit"
                          >{{ $t('user.userDetail.realTimeAudit') }}</n-button
                        >
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Row 11: 充提差额 & 今日投注 -->
                <tr>
                  <td class="label-cell">{{ $t('user.userDetail.depositWithdrawDiff') }}</td>
                  <td class="value-cell">
                    <span
                      :class="
                        userDetail.depositWithdrawalDiff >= 0
                          ? 'text-red-600'
                          : 'text-green-600'
                      "
                    >
                      {{ userDetail.depositWithdrawalDiff.toFixed(2) }}
                    </span>
                  </td>
                  <td class="label-cell">{{ $t('user.userDetail.todayBet') }}</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span class="text-blue-600">{{
                          userDetail.todayTotalBet.toFixed(2)
                        }}</span>
                        <span class="text-gray-500">
                          {{ $t('user.userDetail.validBetParen', [userDetail.todayValidBet.toFixed(2)]) }}
                          {{ $t('user.userDetail.totalValidBetParen', [(userDetail.totalValidBet || 0).toFixed(2)]) }}
                        </span>
                      </div>
                      <div class="content-right">
                        <n-button
                          text
                          type="primary"
                          size="tiny"
                          @click="handleNavigateToBetRecords"
                          >{{ $t('user.userDetail.betRecords') }}</n-button
                        >
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Row 12: 今日输赢 & 活动优惠 -->
                <tr>
                  <td class="label-cell">{{ $t('user.userDetail.todayWinLoss') }}</td>
                  <td class="value-cell">
                    <div class="flex items-center gap-2">
                      <span>
                        {{ $t('user.userDetail.winLossAmountParen', [userDetail.todayWinLoss.toFixed(2)]) }}
                        {{ $t('user.userDetail.totalWinLossParen', [(userDetail.totalWinLoss || 0).toFixed(2)]) }}
                      </span>
                    </div>
                  </td>
                  <td class="label-cell">{{ $t('user.userDetail.promotions') }}</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span
                          >{{ $t('user.userDetail.cumulativeRebate') }}:
                          <span class="text-blue-600">{{
                            (userDetail.totalRebate || 0).toFixed(2)
                          }}</span></span
                        >
                        <span
                          >{{ $t('user.userDetail.activityReward') }}:
                          <span class="text-blue-600">{{
                            (userDetail.activityReward || 0).toFixed(2)
                          }}</span></span
                        >
                        <span
                          >{{ $t('user.userDetail.taskReward') }}:
                          <span class="text-blue-600">{{
                            (userDetail.taskReward || 0).toFixed(2)
                          }}</span></span
                        >
                        <span
                          >{{ $t('user.userDetail.rechargeBonus') }}:
                          <span class="text-blue-600">{{
                            (userDetail.depositBonus || 0).toFixed(2)
                          }}</span></span
                        >
                        <span
                          >{{ $t('user.userDetail.abandonedReward') }}:
                          <span class="text-blue-600">{{
                            (userDetail.abandonedReward || 0).toFixed(2)
                          }}</span></span
                        >
                        <div class="mt-2 w-full">
                          {{ $t('user.userDetail.withdrawnProvidentFund') }}:
                          <span class="text-blue-600">{{
                            (userDetail.withdrawnProvidentFund || 0).toFixed(2)
                          }}</span>
                        </div>
                      </div>
                      <div class="content-right">
                        <n-button text type="info" size="tiny">{{ $t('common.refresh') }}</n-button>
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Row 13: 返水设置 & VIP等级 (full width) -->
                <tr>
                  <td class="label-cell">{{ $t('user.userDetail.rebateSettings') }}</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span>{{ userDetail.rebateSettings || '--' }}</span>
                      </div>
                      <div class="content-right">
                        <n-button text type="warning" size="tiny"
                          >{{ $t('common.modify') }}</n-button
                        >
                      </div>
                    </div>
                  </td>
                  <td class="label-cell">{{ $t('user.userDetail.vipLevel') }}</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <n-tag
                          type="warning"
                          size="small"
                          style="
                            background: linear-gradient(
                              135deg,
                              #667eea 0%,
                              #764ba2 100%
                            );
                            border: none;
                          "
                          >V{{ userDetail.vipLevel || 0 }}</n-tag
                        >
                        <template
                          v-if="
                            userDetail.vipProgression &&
                            userDetail.vipProgression.nextLevel
                          "
                        >
                          <span class="text-gray-600"
                            >({{ $t('user.userDetail.claimed') }}:{{
                              (userDetail.vipRewardsClaimed || 0).toFixed(2)
                            }})
                            {{ $t('user.userDetail.distanceToVip', [userDetail.vipProgression.nextLevel.level]) }}
                            {{ $t('user.userDetail.depositRemaining') }}
                            {{
                              userDetail.vipProgression.progress.remainingDeposit.toFixed(
                                0,
                              )
                            }}{{ $t('user.userDetail.wageringRemaining') }}{{
                              userDetail.vipProgression.progress.remainingBet.toFixed(
                                0,
                              )
                            }}</span
                          >
                        </template>
                        <span v-else class="text-gray-600"
                          >({{ $t('user.userDetail.claimed') }}:{{
                            (userDetail.vipRewardsClaimed || 0).toFixed(2)
                          }})</span
                        >
                      </div>
                      <div class="content-right">
                        <n-button text type="info" size="tiny">{{ $t('common.refresh') }}</n-button>
                        <n-button
                          text
                          type="primary"
                          size="tiny"
                          @click="handleNavigateToVipSettings"
                          >{{ $t('user.userDetail.vipLevel') }}</n-button
                        >
                        <n-button text type="info" size="tiny"
                          >{{ $t('user.userDetail.modifyVipLevel') }}</n-button
                        >
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Row 14: 注册设备号 & 注册客户端指纹 -->
                <tr>
                  <td class="label-cell">{{ $t('user.userDetail.registerDeviceId') }}</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span
                          v-if="userDetail.registrationDeviceId"
                          class="cursor-pointer text-blue-600 hover:underline"
                          @click="handleFilterByRegistrationDevice"
                        >
                          {{ userDetail.registrationDeviceId }}
                        </span>
                        <span v-else>--</span>
                        <span class="text-gray-500">
                          {{ $t('user.userDetail.deviceIdLabel') }}
                          <template
                            v-if="
                              userDetail.registrationDeviceInfo ||
                              userDetail.registrationBrowserInfo
                            "
                          >
                            ({{ userDetail.registrationDeviceInfo
                            }}{{
                              userDetail.registrationDeviceInfo &&
                              userDetail.registrationBrowserInfo
                                ? ' - '
                                : ''
                            }}{{ userDetail.registrationBrowserInfo }})
                          </template>
                          {{ $t('user.userDetail.sameLoginDeviceCount') }}({{
                            userDetail.sameRegistrationDeviceCount || 0
                          }})
                        </span>
                        <div
                          v-if="
                            formatDeviceTelemetrySeven(
                              userDetail.registrationDeviceTelemetry,
                            )
                          "
                          class="mt-1 whitespace-pre-wrap break-all text-xs leading-snug text-gray-700"
                        >
                          {{
                            formatDeviceTelemetrySeven(
                              userDetail.registrationDeviceTelemetry,
                            )
                          }}
                        </div>
                      </div>
                      <div class="content-right">
                        <n-button
                          text
                          type="info"
                          size="tiny"
                          @click="handleViewAssociations('registration_device')"
                          >{{ $t('user.userDetail.registerDeviceLink') }}</n-button
                        >
                        <n-button text size="tiny">{{ $t('user.userDetail.batchProcess') }}</n-button>
                      </div>
                    </div>
                  </td>
                  <td class="label-cell">{{ $t('user.userDetail.registerClientFingerprint') }}</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span
                          v-if="userDetail.registrationClientFingerprint"
                          class="cursor-pointer break-all text-blue-600 hover:underline"
                          @click="
                            filterMembersBySearchField(
                              'registration_fingerprint',
                              userDetail.registrationClientFingerprint,
                            )
                          "
                        >
                          {{ userDetail.registrationClientFingerprint }}
                        </span>
                        <span v-else class="text-gray-400">--</span>
                        <span class="text-gray-500">
                          {{ $t('user.userDetail.sameFingerprintCount') }}(
                          <span
                            v-if="
                              (userDetail.sameRegistrationClientFingerprintCount ??
                                0) > 0 &&
                              userDetail.registrationClientFingerprint
                            "
                            class="cursor-pointer text-blue-600 hover:underline"
                            @click.stop="
                              filterMembersBySearchField(
                                'registration_fingerprint',
                                userDetail.registrationClientFingerprint,
                              )
                            "
                          >
                            {{
                              userDetail.sameRegistrationClientFingerprintCount ??
                              0
                            }}
                          </span>
                          <span v-else>{{
                            userDetail.sameRegistrationClientFingerprintCount ??
                            0
                          }}</span>
                          )
                        </span>
                      </div>
                      <div class="content-right">
                        <n-button text size="tiny">{{ $t('user.userDetail.batchProcess') }}</n-button>
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Row 15: 注册来源 & 注册域名详情 -->
                <tr>
                  <td class="label-cell">{{ $t('user.userDetail.registerSource') }}</td>
                  <td class="value-cell">
                    <span
                      v-if="userDetail.registrationSource"
                      class="cursor-pointer text-blue-600 hover:underline"
                      @click="handleFilterByRegistrationSource"
                    >
                      {{ userDetail.registrationSource }}
                    </span>
                    <span v-else>{{ $t('user.userDetail.promoRegister') }}</span>
                  </td>
                  <td class="label-cell" colspan="2">
                    <div class="mt-1 text-xs text-gray-500">
                      ({{ $t('user.userDetail.registerAddress') }}:
                      {{
                        userDetail.registrationDomain
                          ? `https://${userDetail.registrationDomain}`
                          : '--'
                      }})
                    </div>
                  </td>
                </tr>

                <!-- Row 16: 最后登录ip & 最后登录域名 -->
                <tr>
                  <td class="label-cell">{{ $t('user.userDetail.lastLoginIp') }}</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span
                          v-if="userDetail.lastLoginIp"
                          class="cursor-pointer text-blue-600 hover:underline"
                          @click="handleFilterByLastLoginIp"
                        >
                          {{ userDetail.lastLoginIp }}
                        </span>
                        <span v-else>--</span>
                        <span class="text-gray-500">
                          ({{ userDetail.lastLoginLocation || '--' }})
                          {{ $t('user.userDetail.loginTimeLabel') }}
                          {{ formatDateTime(userDetail.lastLoginTime) }}
                          {{ $t('user.userDetail.sameLastLoginIpCount') }}(
                          <span
                            v-if="
                              (userDetail.sameLastLoginIpCount ?? 0) > 0 &&
                              userDetail.lastLoginIp
                            "
                            class="cursor-pointer font-semibold text-blue-600 hover:underline"
                            @click="handleFilterByLastLoginIp"
                          >
                            {{ userDetail.sameLastLoginIpCount ?? 0 }}
                          </span>
                          <span v-else>{{
                            userDetail.sameLastLoginIpCount ?? 0
                          }}</span>
                          )
                        </span>
                      </div>
                      <div class="content-right">
                        <n-button text type="info" size="tiny"
                          >{{ $t('user.userDetail.moreRecords') }}</n-button
                        >
                        <n-button text size="tiny">{{ $t('user.userDetail.batchProcess') }}</n-button>
                      </div>
                    </div>
                  </td>
                  <td class="label-cell">{{ $t('user.userDetail.lastLoginDomain') }}</td>
                  <td class="value-cell">
                    <span
                      v-if="userDetail.lastLoginDomain"
                      class="cursor-pointer text-blue-600 hover:underline"
                      @click="handleFilterByLastLoginDomain"
                    >
                      {{ userDetail.lastLoginDomain }}
                    </span>
                    <span v-else>--</span>
                  </td>
                </tr>

                <!-- Row 17: 最后登录设备号 & 最后登录客户端指纹 -->
                <tr>
                  <td class="label-cell">{{ $t('user.userDetail.lastLoginDeviceId') }}</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span
                          v-if="userDetail.lastLoginDeviceId"
                          class="cursor-pointer text-blue-600 hover:underline"
                          @click="handleFilterByLastLoginDevice"
                        >
                          {{ userDetail.lastLoginDeviceId }}
                        </span>
                        <span v-else>--</span>
                        <span class="text-gray-500">
                          {{ $t('user.userDetail.deviceIdLabel') }}
                          <template
                            v-if="
                              userDetail.lastLoginDeviceInfo ||
                              userDetail.lastLoginBrowserInfo
                            "
                          >
                            ({{
                              userDetail.lastLoginDeviceInfo
                            }}{{
                              userDetail.lastLoginDeviceInfo &&
                              userDetail.lastLoginBrowserInfo
                                ? ' - '
                                : ''
                            }}{{ userDetail.lastLoginBrowserInfo }})
                          </template>
                          {{ $t('user.userDetail.sameLoginDeviceCount') }}({{
                            userDetail.sameLastLoginDeviceCount || 0
                          }})
                        </span>
                        <div
                          v-if="
                            formatDeviceTelemetrySeven(
                              userDetail.lastLoginDeviceTelemetry,
                              { hideWhenObjectMissing: true },
                            )
                          "
                          class="mt-1 whitespace-pre-wrap break-all text-xs leading-snug text-gray-700"
                        >
                          {{
                            formatDeviceTelemetrySeven(
                              userDetail.lastLoginDeviceTelemetry,
                              { hideWhenObjectMissing: true },
                            )
                          }}
                        </div>
                        <div
                          v-else-if="
                            !userDetail.lastLoginDeviceId &&
                            (userDetail.lastLoginUserAgent ||
                              userDetail.lastLoginBrowserInfo)
                          "
                          class="mt-1 block text-xs leading-snug text-amber-800"
                        >
                          {{ $t('user.userDetail.deviceNotReported') }}
                          device-id、x-client-timezone、x-viewport。
                        </div>
                      </div>
                      <div class="content-right">
                        <n-button text type="info" size="tiny"
                          >{{ $t('user.userDetail.moreRecords') }}</n-button
                        >
                        <n-button text size="tiny">{{ $t('user.userDetail.batchProcess') }}</n-button>
                      </div>
                    </div>
                  </td>
                  <td class="label-cell">{{ $t('user.userDetail.lastLoginClientFingerprint') }}</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span
                          v-if="userDetail.lastLoginClientFingerprint"
                          class="cursor-pointer break-all text-blue-600 hover:underline"
                          @click="
                            filterMembersBySearchField(
                              'last_login_fingerprint',
                              userDetail.lastLoginClientFingerprint,
                            )
                          "
                        >
                          {{ userDetail.lastLoginClientFingerprint }}
                        </span>
                        <span v-else class="text-gray-400">--</span>
                        <span class="text-gray-500">
                          {{ $t('user.userDetail.sameFingerprintCount') }}(
                          <span
                            v-if="
                              (userDetail.sameLastLoginClientFingerprintCount ??
                                0) > 0 &&
                              userDetail.lastLoginClientFingerprint
                            "
                            class="cursor-pointer text-blue-600 hover:underline"
                            @click.stop="
                              filterMembersBySearchField(
                                'last_login_fingerprint',
                                userDetail.lastLoginClientFingerprint,
                              )
                            "
                          >
                            {{
                              userDetail.sameLastLoginClientFingerprintCount ??
                              0
                            }}
                          </span>
                          <span v-else>{{
                            userDetail.sameLastLoginClientFingerprintCount ?? 0
                          }}</span>
                          )
                        </span>
                      </div>
                      <div class="content-right">
                        <n-button text size="tiny">{{ $t('user.userDetail.batchProcess') }}</n-button>
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Row 18: 第三方绑定账号 & 注册方式 -->
                <tr>
                  <td class="label-cell">{{ $t('user.userDetail.thirdPartyBinding') }}</td>
                  <td class="value-cell">--</td>
                  <td class="label-cell">{{ $t('user.userDetail.registrationMethod') }}</td>
                  <td class="value-cell">
                    {{ userDetail.registrationMethod || $t('user.allMembers.accountRegister') }}
                  </td>
                </tr>

                <!-- Row 19: 登录方式 & 验证方式 -->
                <tr>
                  <td class="label-cell">{{ $t('user.userDetail.loginMethod') }}</td>
                  <td class="value-cell">
                    {{ userDetail.loginMethod || $t('user.userDetail.accountLogin') }}
                  </td>
                  <td class="label-cell">{{ $t('user.userDetail.verificationMethod') }}</td>
                  <td class="value-cell">
                    {{ userDetail.verificationMethod || $t('user.allMembers.noVerification') }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </n-tab-pane>

        <!-- Tab 2: Contact Information -->
        <n-tab-pane name="contact" :tab="$t('user.userDetail.contactTabTitle')">
          <ContactTab :user-id="Number(props.userId)" />
        </n-tab-pane>

        <!-- Tab 3: Personal Profile -->
        <n-tab-pane name="profile" :tab="$t('user.userDetail.profile')">
          <ProfileTab :user-id="Number(props.userId)" />
        </n-tab-pane>

        <!-- Tab 4: Withdrawal Accounts -->
        <n-tab-pane name="withdrawal-accounts" :tab="$t('user.userDetail.withdrawTab')">
          <WithdrawAccountTab :user-id="Number(props.userId)" />
        </n-tab-pane>

        <!-- Tab 5: Account Transactions -->
        <n-tab-pane name="transactions" :tab="$t('user.userDetail.transactions')">
          <div class="transaction-records">
            <!-- Summary Cards -->
            <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
              <n-card size="small" class="summary-card">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-sm text-gray-500">{{ $t('user.userDetail.totalDeposit') }}</div>
                    <div class="text-xl font-bold text-green-600">
                      R$ {{ (totalDeposit || 0).toFixed(2) }}
                      <div class="text-xs text-gray-400">
                        ({{ userStats?.totalDepositsCount || 0 }}{{ $t('user.userDetail.countUnit') }})
                      </div>
                    </div>
                  </div>
                </div>
              </n-card>

              <n-card size="small" class="summary-card">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-sm text-gray-500">{{ $t('user.userDetail.totalWithdraw') }}</div>
                    <div class="text-xl font-bold text-orange-600">
                      R$ {{ (totalWithdraw || 0).toFixed(2) }}
                      <div class="text-xs text-gray-400">
                        ({{ userStats?.totalWithdrawalsCount || 0 }}{{ $t('user.userDetail.countUnit') }})
                      </div>
                    </div>
                  </div>
                </div>
              </n-card>

              <n-card size="small" class="summary-card">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-sm text-gray-500">{{ $t('user.userDetail.netInflow') }}</div>
                    <div
                      class="text-xl font-bold"
                      :class="
                        (netFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      "
                    >
                      R$ {{ (netFlow || 0).toFixed(2) }}
                    </div>
                  </div>
                </div>
              </n-card>

              <n-card size="small" class="summary-card">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-sm text-gray-500">{{ $t('user.userDetail.transactionCount') }}</div>
                    <div class="text-xl font-bold text-blue-600">
                      {{ transactionPagination.itemCount || 0 }}
                    </div>
                  </div>
                </div>
              </n-card>
            </div>

            <!-- Filter Section - matching screenshot -->
            <n-card class="mb-4">
              <div class="flex flex-wrap items-end gap-3">
                <div class="flex flex-wrap items-center gap-2">
                  <n-button
                    size="small"
                    :type="
                      transactionTypeFilter === 'today' ? 'primary' : 'default'
                    "
                    @click="setDateRangeFromFilter('today')"
                  >
                    {{ $t('user.userDetail.dayFilter') }}
                  </n-button>
                  <n-button
                    size="small"
                    :type="
                      transactionTypeFilter === 'week' ? 'primary' : 'default'
                    "
                    @click="setDateRangeFromFilter('week')"
                  >
                    {{ $t('user.userDetail.weekFilter') }}
                  </n-button>
                  <n-button
                    size="small"
                    :type="
                      transactionTypeFilter === 'month' ? 'primary' : 'default'
                    "
                    @click="setDateRangeFromFilter('month')"
                  >
                    {{ $t('user.userDetail.monthFilter') }}
                  </n-button>
                  <TimezoneDatePicker
                    v-model="transactionDateRange"
                    width="400px"
                    @update:modelValue="handleTransactionDateRangeChange"
                  />
                </div>
                <n-select
                  v-model:value="transactionStatusFilter"
                  :placeholder="$t('user.userDetail.changeWallet')"
                  style="width: 120px"
                  :options="transactionStatusOptions"
                />
                <n-select
                  v-model:value="transactionCategoryFilter"
                  :placeholder="$t('user.userDetail.transactionCategory')"
                  clearable
                  style="width: 140px"
                  :options="categoryFilterOptions"
                />
                <n-input
                  v-model:value="transactionSearchId"
                  :placeholder="$t('user.userDetail.enterOrderNo')"
                  clearable
                  style="width: 180px"
                />
                <n-button type="primary" @click="loadTransactionRecords">
                  {{ $t('common.search') }}
                </n-button>
                <n-button @click="handleResetTransactionFilter">
                  {{ $t('common.reset') }}
                </n-button>
              </div>
            </n-card>

            <!-- Transaction Records Table -->
            <n-card>
              <template #header>
                <div class="flex items-center justify-between">
                  <span class="text-lg font-medium"
                    >{{ $t('user.userDetail.walletTxRecords') }}</span
                  >
                  <div class="flex items-center gap-2 text-sm text-gray-500">
                    <span
                      >{{ $t('user.userDetail.totalRecords', [transactionPagination.itemCount || 0]) }}</span
                    >
                    <n-button
                      size="tiny"
                      @click="loadTransactionRecords"
                      class="ml-2"
                    >
                      {{ $t('common.refresh') }}
                    </n-button>
                  </div>
                </div>
              </template>
              <n-data-table
                :loading="transactionLoading"
                :columns="transactionColumns"
                :data="transactionRecords"
                :pagination="transactionPagination"
                :remote="true"
                size="small"
                :row-key="(row: WalletTransaction) => row.id"
                :scroll-x="1500"
                @update:page="transactionPagination.onUpdatePage"
                @update:page-size="transactionPagination.onUpdatePageSize"
              />
            </n-card>
          </div>
        </n-tab-pane>

        <!-- Tab 6: Betting Statistics -->
        <n-tab-pane name="betting" :tab="$t('user.userDetail.betting')">
          <BetStatisticTab :user-id="Number(props.userId)" />
        </n-tab-pane>

        <!-- Tab 7: Member Messages -->
        <n-tab-pane name="messages" :tab="$t('user.userDetail.messages')">
          <div class="py-12 text-center text-gray-500">
            {{ $t('user.userDetail.messagesDeveloping') }}
          </div>
        </n-tab-pane>

        <!-- Tab 8: Member Logs -->
        <n-tab-pane name="logs" :tab="$t('user.userDetail.logs')">
          <UserAuditTrailTab :user-id="Number(props.userId)" />
        </n-tab-pane>

        <!-- Tab 9: Login Devices -->
        <n-tab-pane name="devices" :tab="$t('user.userDetail.devices')">
          <LoginDevicesTab :user-id="Number(props.userId)" />
        </n-tab-pane>

        <!-- Tab 10: Associated Accounts -->
        <n-tab-pane name="associations" :tab="$t('user.userDetail.linkedAccountsTab')">
          <AssociationsTab
            :user-id="Number(props.userId)"
            :initial-association-type="associationTypeFilter"
          />
        </n-tab-pane>

        <!-- Tab 11: RTP Control -->
        <n-tab-pane name="rtp-control" :tab="$t('user.userDetail.rtpControlTab')">
          <RtpControlTab
            :user-id="Number(props.userId)"
            :user-detail="userDetail"
          />
        </n-tab-pane>
      </n-tabs>
    </div>

    <!-- Status Change Modal -->
    <n-modal
      v-model:show="showStatusModal"
      preset="dialog"
      :title="$t('user.userDetail.modifyAccountStatus')"
    >
      <n-form>
        <n-form-item :label="$t('user.userDetail.accountStatus')">
          <n-select v-model:value="newStatus" :options="statusOptions" />
        </n-form-item>
        <n-form-item :label="$t('common.remark')">
          <n-input
            v-model:value="statusReason"
            type="textarea"
            :placeholder="$t('user.userDetail.enterModifyReason')"
          />
        </n-form-item>
      </n-form>
      <template #action>
        <div class="flex gap-2">
          <n-button @click="showStatusModal = false">{{ $t('common.cancel') }}</n-button>
          <n-button type="primary" @click="handleUpdateStatus">{{ $t('common.confirm') }}</n-button>
        </div>
      </template>
    </n-modal>

    <!-- Enhanced Manual Transaction Modal -->
    <n-modal
      v-model:show="showManualTransactionModal"
      preset="card"
      :title="$t('user.userDetail.manualTransactionOp')"
      style="width: 600px"
    >
      <n-form
        ref="manualFormRef"
        :model="manualTransactionForm"
        :rules="manualTransactionRules"
        label-placement="left"
        label-width="120"
      >
        <!-- Transaction Type -->
        <n-form-item :label="$t('user.userDetail.transactionType')" path="type">
          <n-select
            v-model:value="manualTransactionForm.type"
            :placeholder="$t('user.userDetail.selectTransactionType')"
            :options="manualTransactionTypeOptions"
            @update:value="handleTransactionTypeChange"
          />
        </n-form-item>

        <!-- Sub Type -->
        <n-form-item :label="$t('user.userDetail.subType')" path="subType">
          <n-select
            v-model:value="manualTransactionForm.subType"
            :placeholder="$t('user.userDetail.selectSubType')"
            :options="currentSubTypeOptions"
          />
        </n-form-item>

        <!-- Amount -->
        <n-form-item :label="$t('common.amount')" path="amount">
          <n-input-number
            v-model:value="manualTransactionForm.amount"
            :min="0.01"
            :max="999999.99"
            :precision="2"
            :placeholder="$t('user.userDetail.enterAmount')"
            style="width: 100%"
          >
            <template #suffix>BRL</template>
          </n-input-number>
        </n-form-item>

        <!-- Multiplier (for special cases) -->
        <n-form-item v-if="showMultiplier" :label="$t('user.userDetail.multiplier')" path="multiplier">
          <n-input-number
            v-model:value="manualTransactionForm.multiplier"
            :min="0.01"
            :max="100"
            :precision="2"
            :placeholder="$t('user.userDetail.enterMultiplier')"
            style="width: 100%"
          />
        </n-form-item>

        <!-- Currency -->
        <n-form-item :label="$t('common.currency')" path="currency">
          <n-select
            v-model:value="manualTransactionForm.currency"
            :placeholder="$t('user.userDetail.selectCurrency')"
            :options="currencyOptions"
          />
        </n-form-item>

        <!-- Description -->
        <n-form-item :label="$t('common.description')" path="description">
          <n-input
            v-model:value="manualTransactionForm.description"
            type="textarea"
            :placeholder="$t('user.userDetail.enterDescriptionRequired')"
            :rows="3"
          />
        </n-form-item>

        <!-- Frontend Notes -->
        <n-form-item :label="$t('user.userDetail.frontendNotes')">
          <n-input
            v-model:value="manualTransactionForm.frontendNotes"
            type="textarea"
            :placeholder="$t('user.userDetail.frontendNotesPlaceholder')"
            :rows="2"
          />
        </n-form-item>

        <!-- Backend Notes -->
        <n-form-item :label="$t('user.userDetail.backendNotes')">
          <n-input
            v-model:value="manualTransactionForm.backendNotes"
            type="textarea"
            :placeholder="$t('user.userDetail.backendNotesPlaceholder')"
            :rows="2"
          />
        </n-form-item>

        <!-- Reason -->
        <n-form-item :label="$t('user.userDetail.reason')">
          <n-input
            v-model:value="manualTransactionForm.reason"
            :placeholder="$t('user.userDetail.operationReason')"
          />
        </n-form-item>

        <!-- Summary Card -->
        <n-card
          v-if="manualTransactionForm.amount > 0"
          :title="$t('user.userDetail.operationPreview')"
          size="small"
          class="mt-4"
        >
          <n-descriptions bordered size="small" :column="2">
            <n-descriptions-item :label="$t('user.userDetail.user')">{{
              userDetail?.account
            }}</n-descriptions-item>
            <n-descriptions-item :label="$t('user.userDetail.operationType')">
              <n-tag :type="getTransactionTagType(manualTransactionForm.type)">
                {{ getTransactionTypeLabel(manualTransactionForm.type) }}
              </n-tag>
            </n-descriptions-item>
            <n-descriptions-item :label="$t('user.userDetail.transactionAmount')">
              <span
                :class="
                  isDebitType(manualTransactionForm.type)
                    ? 'text-red-600'
                    : 'text-green-600'
                "
              >
                {{ isDebitType(manualTransactionForm.type) ? '-' : '+' }}BRL
                {{ finalAmount.toFixed(2) }}
              </span>
            </n-descriptions-item>
            <n-descriptions-item :label="$t('user.userDetail.currentBalance')"
              >BRL
              {{
                userDetail?.balance.toFixed(2) || '0.00'
              }}</n-descriptions-item
            >
            <n-descriptions-item :label="$t('user.userDetail.balanceAfterOp')">
              <span
                :class="afterBalance >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                BRL {{ afterBalance.toFixed(2) }}
              </span>
            </n-descriptions-item>
            <n-descriptions-item :label="$t('user.userDetail.balanceChange')">
              <span
                :class="
                  isDebitType(manualTransactionForm.type)
                    ? 'text-red-600'
                    : 'text-green-600'
                "
              >
                {{ isDebitType(manualTransactionForm.type) ? '-' : '+' }}BRL
                {{ finalAmount.toFixed(2) }}
              </span>
            </n-descriptions-item>
          </n-descriptions>
        </n-card>
      </n-form>

      <template #action>
        <div class="flex gap-2">
          <n-button @click="showManualTransactionModal = false">{{ $t('common.cancel') }}</n-button>
          <n-button
            type="primary"
            :loading="manualTransactionLoading"
            @click="handleSubmitManualTransaction"
            :disabled="!canSubmitTransaction"
          >
            {{ getSubmitButtonText() }}
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- Member Tier Change Modal -->
    <n-modal
      v-model:show="showLevelModal"
      preset="card"
      :title="$t('user.userDetail.modifyMemberTier')"
      style="width: 500px"
    >
      <n-form label-placement="left" label-width="120">
        <n-form-item :label="$t('user.userDetail.currentTier')">
          <n-tag type="info" size="medium">
            {{
              userDetail?.memberTier?.tierName ||
              userDetail?.memberLevel ||
              $t('user.userDetail.defaultTier')
            }}
            <span v-if="userDetail?.memberTier?.tierType" class="ml-2 text-xs">
              ({{
                userDetail.memberTier.tierType === 'auto_upgrade'
                  ? $t('user.userDetail.autoUpgrade')
                  : $t('user.userDetail.fixedTier')
              }})
            </span>
          </n-tag>
        </n-form-item>

        <n-form-item :label="$t('user.userDetail.selectTier')" required>
          <n-select
            v-model:value="selectedTierId"
            :options="memberTierOptions"
            :placeholder="$t('user.userDetail.selectMemberTier')"
            :loading="tierOptionsLoading"
            clearable
            :consistent-menu-width="false"
            filterable
            label-field="label"
            value-field="value"
          />
        </n-form-item>

        <n-form-item :label="$t('user.userDetail.lockTier')">
          <n-switch v-model:value="lockTierAfterChange" />
          <span class="ml-2 text-sm text-gray-500">{{ $t('user.userDetail.lockTierHint') }}</span>
        </n-form-item>

        <n-form-item :label="$t('user.userDetail.modifyReason')">
          <n-input
            v-model:value="tierChangeReason"
            type="textarea"
            :placeholder="$t('user.userDetail.enterModifyReasonOptional')"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </n-form-item>
      </n-form>

      <template #action>
        <div class="flex justify-end gap-2">
          <n-button @click="showLevelModal = false">{{ $t('common.cancel') }}</n-button>
          <n-button
            type="primary"
            :loading="tierChangeLoading"
            @click="handleUpdateMemberTier"
            :disabled="!selectedTierId"
          >
            {{ $t('user.userDetail.confirmModify') }}
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- Password Change Modal -->
    <n-modal
      v-model:show="showPasswordModal"
      preset="card"
      :title="$t('user.userDetail.modifyLoginPassword')"
      style="width: 500px"
    >
      <n-form
        ref="passwordFormRef"
        :model="passwordForm"
        label-placement="left"
        label-width="120"
      >
        <n-form-item :label="$t('user.userDetail.newPassword')" required>
          <n-input
            v-model:value="passwordForm.newPassword"
            type="password"
            :placeholder="$t('user.userDetail.enterNewPassword')"
            show-password-on="mousedown"
          />
        </n-form-item>

        <n-form-item :label="$t('user.userDetail.confirmPassword')" required>
          <n-input
            v-model:value="passwordForm.confirmPassword"
            type="password"
            :placeholder="$t('user.userDetail.reenterNewPassword')"
            show-password-on="mousedown"
          />
        </n-form-item>
      </n-form>

      <template #action>
        <div class="flex justify-end gap-2">
          <n-button @click="showPasswordModal = false">{{ $t('common.cancel') }}</n-button>
          <n-button
            type="primary"
            :loading="passwordLoading"
            @click="handleUpdatePassword"
          >
            {{ $t('user.userDetail.confirmModify') }}
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- Withdrawal PIN Reset Modal -->
    <n-modal
      v-model:show="showWithdrawalPinModal"
      preset="card"
      :title="$t('user.userDetail.resetWithdrawPin')"
      style="width: 400px"
    >
      <n-form label-placement="left" label-width="100">
        <n-form-item :label="$t('user.userDetail.newWithdrawPin')">
          <n-input
            :value="withdrawalPinForm.newPin"
            @update:value="handlePinInput"
            :placeholder="$t('user.userDetail.enterSixDigitPin')"
            maxlength="6"
            :allow-input="(value: string) => !value || /^\d*$/.test(value)"
          />
        </n-form-item>
        <n-alert type="info" :bordered="false" style="margin-top: 8px">
          <template #icon><span></span></template>
          {{ $t('user.userDetail.clearPinHint') }}
        </n-alert>
      </n-form>

      <template #action>
        <div class="flex justify-end gap-2">
          <n-button @click="showWithdrawalPinModal = false">{{ $t('common.cancel') }}</n-button>
          <n-button type="primary" @click="confirmResetWithdrawalPin">
            {{ $t('user.userDetail.confirmReset') }}
          </n-button>
        </div>
      </template>
    </n-modal>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, computed, watch, reactive, h, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { formatDateTimeInTimezone } from '#/utils/timezoneUtils';
import {
  translateTransactionType,
  translateSubcategory,
  preloadActivityNames,
} from '#/utils/transactionTranslations';
import {
  NModal,
  NTabs,
  NTabPane,
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NTag,
  NButton,
  NForm,
  NFormItem,
  NSelect,
  NInput,
  NInputNumber,
  NDataTable,
  NDatePicker,
  NAlert,
  useMessage,
  type DataTableColumns,
  NSkeleton,
  NSwitch,
} from 'naive-ui';
// Icon import removed - using text instead
import {
  getUserDetailApi,
  updateUserStatusApi,
  createManualTransactionApi,
  getUserWalletTransactionsApi,
  updateUserPasswordApi,
  resetWithdrawalPinApi,
  getSameWithdrawalAccountCountApi,
  getUserSecurityStatsApi,
  type UserDetailInfo,
  type WalletTransaction,
  type WalletTransactionSummary,
  type DeviceTelemetrySeven,
} from '#/api/core/user-detail';
import {
  getActiveMemberTiersApi,
  manualAssignUserTierApi,
  type MemberTier,
} from '#/api/core/memberTier';
import ContactTab from './ContactTab.vue';
import ProfileTab from './ProfileTab.vue';
import WithdrawAccountTab from './WithdrawAccountTab.vue';
import BetStatisticTab from './BetStatisticTab.vue';
import UserAuditTrailTab from './UserAuditTrailTab.vue';
import LoginDevicesTab from './LoginDevicesTab.vue';
import RtpControlTab from './RtpControlTab.vue';
import AssociationsTab from './AssociationsTab.vue';
import TimezoneDatePicker from '#/components/common/TimezoneDatePicker.vue';

interface Props {
  visible: boolean;
  userId?: number;
}

interface Emits {
  (event: 'update:visible', value: boolean): void;
  (event: 'refresh'): void;
  (event: 'filter-by-name', name: string): void;
  (event: 'commission-click', amount: number): void;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  userId: 0,
});

const emit = defineEmits<Emits>();

const message = useMessage();
const router = useRouter();

type MemberListSearchField =
  | 'last_login_fingerprint'
  | 'last_login_user_agent'
  | 'registration_fingerprint'
  | 'registration_user_agent';

/** Member list: client hash uses *_fingerprint; raw UA uses *_user_agent (API fields are separate). */
function filterMembersBySearchField(
  field: MemberListSearchField,
  value: string | undefined | null,
) {
  const v = (value || '').trim();
  if (!v) return;
  emit('update:visible', false);
  router.push({
    path: '/user-management/all-members',
    query: { searchField: field, searchValue: v },
  });
}

/** Seven telemetry lines (no IP / location). Always prints all keys; missing values show --. */
function formatDeviceTelemetrySeven(
  t: DeviceTelemetrySeven | null | undefined,
  options?: { hideWhenObjectMissing?: boolean },
): string {
  if (!t || typeof t !== 'object') {
    if (options?.hideWhenObjectMissing) return '';
    t = {};
  }
  const val = (key: keyof DeviceTelemetrySeven): string => {
    const v = t![key];
    return v != null && String(v).trim() ? String(v).trim() : '--';
  };
  return [
    `User-Agent：${val('userAgent')}`,
    `${$t('user.userDetail.telemetryDeviceType')}：${val('deviceFormFactor')}`,
    `${$t('user.userDetail.telemetrySystemOs')}：${val('systemOs')}`,
    `${$t('user.userDetail.telemetryBrowserLanguage')}：${val('browserLanguage')}`,
    `${$t('user.userDetail.telemetryTimezone')}：${val('timezone')}`,
    `${$t('user.userDetail.telemetryScreenSize')}：${val('screenSize')}`,
    `${$t('user.userDetail.telemetryBrowserVersion')}：${val('browserVersion')}`,
  ].join('\n');
}

// Reactive data
const loading = ref(false);
const userDetail = ref<UserDetailInfo | null>(null);
const userStats = ref<any>(null);
const activeTab = ref('overview');
const associationTypeFilter = ref<string | null>(null);

// Transaction records data (now using wallet transactions)
const transactionLoading = ref(false);
const transactionRecords = ref<WalletTransaction[]>([]);
const walletTransactionSummary = ref<WalletTransactionSummary | null>(null);
const transactionPagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0, // 🎯 FIX: Naive UI uses itemCount, not total
  pageCount: 1, // 🎯 Explicitly set page count for Naive UI
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  prefix: (info: any) => $t('user.userDetail.paginationTotal', [info.itemCount]),
  onUpdatePage: (page: number) => {
    transactionPagination.page = page;
    loadTransactionRecords();
  },
  onUpdatePageSize: (pageSize: number) => {
    transactionPagination.pageSize = pageSize;
    transactionPagination.page = 1;
    loadTransactionRecords();
  },
});

// Modal states
const showStatusModal = ref(false);
const showLevelModal = ref(false);
const showTagModal = ref(false);
const showCreditModal = ref(false);
const showManualTransactionModal = ref(false);
const showPasswordModal = ref(false);
const showWithdrawalPinModal = ref(false);

// Withdrawal PIN form
const withdrawalPinForm = ref({
  newPin: '',
});

// Transaction filters - default to today (日)
const transactionTypeFilter = ref('today');
const transactionStatusFilter = ref('');
const transactionCategoryFilter = ref('');
const transactionSearchId = ref('');
const transactionDateRange = ref<[number, number] | null>(null);

// Category filter options - matching screenshot "账变大类"
const categoryFilterOptions = computed(() => [
  { label: $t('user.userDetail.walletAll'), value: '' },
  { label: $t('user.userDetail.categoryDeposit'), value: 'deposit' },
  { label: $t('user.userDetail.categoryWithdrawal'), value: 'withdrawal' },
  { label: $t('user.userDetail.categoryGameTransfer'), value: 'game_transfer' },
  { label: $t('user.userDetail.categoryBet'), value: 'bet' },
  { label: $t('user.userDetail.categoryWin'), value: 'win' },
  { label: $t('user.userDetail.categoryBonus'), value: 'bonus' },
  { label: $t('user.userDetail.categoryRebate'), value: 'rebate' },
  { label: $t('user.userDetail.categoryCommission'), value: 'commission' },
  { label: $t('user.userDetail.categoryManualCredit'), value: 'manual_credit' },
  { label: $t('user.userDetail.categoryManualDebit'), value: 'manual_debit' },
]);

// Form data
const newStatus = ref('');
const statusReason = ref('');

// Manual transaction form
const manualFormRef = ref();
const manualTransactionLoading = ref(false);
const manualTransactionForm = reactive({
  type: '',
  subType: '',
  amount: 0,
  multiplier: 1,
  currency: 'BRL',
  description: '',
  frontendNotes: '',
  backendNotes: '',
  reason: '',
});

// Password form
const passwordFormRef = ref();
const passwordLoading = ref(false);
const passwordForm = reactive({
  newPassword: '',
  confirmPassword: '',
});

// Member Tier Modal
const selectedTierId = ref<number | null>(null);
const lockTierAfterChange = ref(true); // Default to locking when manually changed
const tierChangeReason = ref('');
const tierChangeLoading = ref(false);
const tierOptionsLoading = ref(false);
const memberTierOptions = ref<{ label: string; value: number }[]>([]);

// Computed property to get the label for the selected tier
const selectedTierLabel = computed(() => {
  if (!selectedTierId.value) return null;
  const option = memberTierOptions.value.find(
    (opt) => opt.value === selectedTierId.value,
  );
  return option ? option.label : selectedTierId.value;
});

// Load member tier options when modal opens
watch(showLevelModal, async (isOpen) => {
  if (isOpen) {
    try {
      tierOptionsLoading.value = true;
      const tiers = await getActiveMemberTiersApi();

      // Format options for n-select with proper label and value structure
      memberTierOptions.value = tiers.map((tier: MemberTier) => {
        const option = {
          label: `${tier.tierName} (${tier.tierType === 'auto_upgrade' ? $t('user.userDetail.autoUpgrade') : $t('user.userDetail.fixedTier')})`,
          value: tier.id,
          tier: tier,
        };
        console.log('📦 Created option:', option);
        return option;
      });

      console.log(' Member tier options loaded:', memberTierOptions.value);
      console.log(' Options count:', memberTierOptions.value.length);
      console.log(' First option:', memberTierOptions.value[0]);

      // 🎯 Set default selected value to user's current tier
      if (userDetail.value?.memberTier) {
        selectedTierId.value = userDetail.value.memberTier.id;
        console.log(
          `📌 Pre-selected user's current tier: ${userDetail.value.memberTier.tierName} (ID: ${selectedTierId.value})`,
        );
        console.log('Current options:', memberTierOptions.value);
      }
    } catch (error) {
      message.error($t('user.userDetail.loadMemberTierFailed'));
      console.error('Failed to load member tiers:', error);
    } finally {
      tierOptionsLoading.value = false;
    }
  }
});

// Handle update member tier
const handleUpdateMemberTier = async () => {
  if (!selectedTierId.value) {
    message.error($t('user.userDetail.selectMemberTierRequired'));
    return;
  }

  try {
    tierChangeLoading.value = true;

    console.log('🔄 Updating member tier:', {
      userId: props.userId,
      tierId: selectedTierId.value,
      lockTier: lockTierAfterChange.value,
      reason: tierChangeReason.value,
    });

    const result = await manualAssignUserTierApi(
      Number(props.userId),
      selectedTierId.value,
      tierChangeReason.value || 'Admin manual assignment',
      lockTierAfterChange.value,
    );

    console.log('✅ Tier update result:', result);

    message.success($t('user.userDetail.tierUpdateSuccess'));
    showLevelModal.value = false;

    // Reset form
    selectedTierId.value = null;
    lockTierAfterChange.value = true;
    tierChangeReason.value = '';

    // Force reload user detail with cache bust
    console.log('🔄 Reloading user detail with force refresh...');
    console.log(
      'Before reload - Current memberTier:',
      userDetail.value?.memberTier,
    );
    await loadUserDetail(true);
    console.log('After reload - New memberTier:', userDetail.value?.memberTier);

    // Notify parent to refresh list
    emit('refresh');
  } catch (error: any) {
    message.error($t('user.userDetail.tierUpdateFailed') + ': ' + (error?.message || $t('user.userDetail.unknown')));
    console.error('❌ Update member tier error:', error);
  } finally {
    tierChangeLoading.value = false;
  }
};

// Options
const statusOptions = computed(() => [
  { label: $t('user.userDetail.statusNormal'), value: 'NORMAL' },
  { label: $t('user.userDetail.statusManualFreeze'), value: 'MANUAL_FREEZE' },
  { label: $t('user.userDetail.statusAbnormalFreeze'), value: 'ABNORMAL_FREEZE' },
  { label: $t('user.userDetail.statusProhibitBonus'), value: 'PROHIBIT_BONUS' },
  { label: $t('user.userDetail.statusProhibitWithdrawal'), value: 'PROHIBIT_WITHDRAWAL' },
  { label: $t('user.userDetail.statusProhibitGame'), value: 'PROHIBIT_GAME_ENTRY' },
  { label: $t('user.userDetail.statusBlacklist'), value: 'BLACKLIST' },
  { label: $t('user.userDetail.statusMarginal'), value: 'MARGINAL' },
]);

// Wallet transaction category options - matching screenshot "变动钱包" filter
const transactionStatusOptions = computed(() => [
  { label: $t('user.userDetail.walletAll'), value: '' },
  { label: $t('user.userDetail.walletBalance'), value: 'balance' },
  { label: $t('user.userDetail.walletReward'), value: 'reward' },
  { label: $t('user.userDetail.walletSavings'), value: 'savings' },
]);

// Manual transaction options
const manualTransactionTypeOptions = computed(() => [
  { label: `${$t('user.userDetail.txCredit')} (Credit)`, value: 'credit' },
  { label: `${$t('user.userDetail.txDebit')} (Debit)`, value: 'debit' },
  { label: `${$t('user.userDetail.txAdjustment')} (Adjustment)`, value: 'adjustment' },
  { label: `${$t('user.userDetail.txCorrection')} (Correction)`, value: 'correction' },
  { label: `${$t('user.userDetail.txBonusAdjustment')} (Bonus Adjustment)`, value: 'bonus_adjustment' },
  { label: `${$t('user.userDetail.txPenalty')} (Penalty)`, value: 'penalty' },
]);

const subTypeOptionsMap = computed(() => ({
  credit: [
    { label: $t('user.userDetail.subCustomerCompensation'), value: 'customer_compensation' },
    { label: $t('user.userDetail.subSystemErrorCompensation'), value: 'system_error_compensation' },
    { label: $t('user.userDetail.subPromotionReward'), value: 'promotion_reward' },
    { label: $t('user.userDetail.subReferralReward'), value: 'referral_reward' },
    { label: $t('user.userDetail.subOtherCredit'), value: 'other_credit' },
  ],
  debit: [
    { label: $t('user.userDetail.subViolationPenalty'), value: 'violation_penalty' },
    { label: $t('user.userDetail.subSystemErrorDebit'), value: 'system_error_debit' },
    { label: $t('user.userDetail.subDisputeResolution'), value: 'dispute_resolution' },
    { label: $t('user.userDetail.subFeeDeduction'), value: 'fee_deduction' },
    { label: $t('user.userDetail.subOtherDebit'), value: 'other_debit' },
  ],
  adjustment: [
    { label: $t('user.userDetail.subBalanceAdjustment'), value: 'balance_adjustment' },
    { label: $t('user.userDetail.subExchangeRateAdjustment'), value: 'exchange_rate_adjustment' },
    { label: $t('user.userDetail.subAccountMigration'), value: 'account_migration' },
  ],
  correction: [
    { label: $t('user.userDetail.subDataCorrection'), value: 'data_correction' },
    { label: $t('user.userDetail.subDuplicateCorrection'), value: 'duplicate_correction' },
    { label: $t('user.userDetail.subErrorCorrection'), value: 'error_correction' },
  ],
  bonus_adjustment: [
    { label: $t('user.userDetail.subBonusGrant'), value: 'bonus_grant' },
    { label: $t('user.userDetail.subBonusRevoke'), value: 'bonus_revoke' },
    { label: $t('user.userDetail.subBonusCorrection'), value: 'bonus_correction' },
  ],
  penalty: [
    { label: $t('user.userDetail.subViolationFine'), value: 'violation_fine' },
    { label: $t('user.userDetail.subOverduePenalty'), value: 'overdue_penalty' },
    { label: $t('user.userDetail.subAbusePenalty'), value: 'abuse_penalty' },
  ],
}));

const currencyOptions = computed(() => [
  { label: $t('user.userDetail.currencyBRL'), value: 'BRL' },
  { label: $t('user.userDetail.currencyUSD'), value: 'USD' },
  { label: $t('user.userDetail.currencyEUR'), value: 'EUR' },
]);

// Form validation rules
const manualTransactionRules = computed(() => ({
  type: {
    required: true,
    message: $t('user.userDetail.selectTransactionType'),
    trigger: 'blur',
  },
  subType: {
    required: true,
    message: $t('user.userDetail.selectSubType'),
    trigger: 'blur',
  },
  amount: {
    required: true,
    validator: (_rule: any, value: number) => {
      if (!value || value < 0.01) {
        return new Error($t('user.userDetail.enterValidAmount'));
      }
      return true;
    },
    trigger: 'blur',
  },
  description: {
    required: true,
    message: $t('user.userDetail.enterDescriptionRequired'),
    trigger: 'blur',
  },
}));

// Transaction table columns - matching screenshot exactly
const transactionColumns = computed<DataTableColumns<WalletTransaction>>(() => [
  {
    title: $t('user.userDetail.orderNo'),
    key: 'id',
    width: 150,
    fixed: 'left',
    render: (row) => {
      const merchantOrderNo = row.metadata?.callbackData?.merchantOrderNo;
      const hasMerchantOrderNo =
        typeof merchantOrderNo === 'string' && merchantOrderNo.trim();
      const displayOrderNo = hasMerchantOrderNo
        ? merchantOrderNo
        : String(row.id);
      if (!hasMerchantOrderNo) {
        return h('span', { class: 'text-xs font-mono' }, displayOrderNo);
      }
      return h(
        'span',
        {
          class: 'text-xs font-mono text-blue-600 underline cursor-pointer',
          title: $t('common.copy'),
          onClick: () => copyToClipboard(displayOrderNo),
        },
        displayOrderNo,
      );
    },
  },
  {
    title: $t('common.time'),
    key: 'createdAt',
    width: 180,
    render: (row) => {
      const transactionTime = row.createdAt;
      if (!transactionTime) return h('span', { class: 'text-gray-400' }, '-');

      try {
        const date = new Date(transactionTime);
        if (!isNaN(date.getTime())) {
          return h(
            'span',
            { class: 'text-sm' },
            date.toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
          );
        }
      } catch (error) {
        console.warn('Date parsing error:', error);
      }
      return h('span', { class: 'text-gray-400' }, '-');
    },
  },
  {
    title: $t('user.userDetail.changeWalletCol'),
    key: 'walletType',
    width: 100,
    align: 'center',
    render: () => {
      // All transactions are balance wallet
      return h('span', { class: 'text-sm' }, $t('user.userDetail.walletBalance'));
    },
  },
  {
    title: $t('user.userDetail.transactionCategory'),
    key: 'type',
    width: 120,
    align: 'center',
    render: (row) => {
      // ✅ Use centralized translation function
      const translatedType = translateTransactionType(row.type);
      return h(
        'span',
        { class: 'text-sm px-2 py-1 border border-gray-300 rounded' },
        translatedType || '-',
      );
    },
  },
  {
    title: $t('user.userDetail.subCategory'),
    key: 'subcategory',
    width: 150,
    render: (row) => {
      // ✅ Use centralized translation function
      // subcategoryDetails is a string from API response, not an object!
      let subcategoryText = row.subcategoryDetails || '';

      // Fallback to other sources if needed
      if (!subcategoryText && row.metadata?.subcategoryDetails) {
        subcategoryText = row.metadata.subcategoryDetails;
      }

      if (!subcategoryText && row.description) {
        subcategoryText = row.description;
      }

      if (!subcategoryText && row.referenceType) {
        subcategoryText = row.referenceType;
      }

      // 🎁 Enhanced VIP level extraction for VIP_UPGRADE_BONUS
      let enhancedMetadata = { ...(row.metadata || {}) };

      // ✅ FIX: Include description in metadata for recharge activity translation
      // Description is needed to determine first_deposit vs accumulate_recharge
      if (row.description && !enhancedMetadata.description) {
        enhancedMetadata.description = row.description;
        enhancedMetadata.rowDescription = row.description; // Also add as rowDescription for fallback
      }

      if (
        subcategoryText === 'VIP_UPGRADE_BONUS' ||
        subcategoryText.toUpperCase() === 'VIP_UPGRADE_BONUS'
      ) {
        // Try multiple sources for VIP level
        if (!enhancedMetadata.vipLevel) {
          if (row.metadata?.vipLevel)
            enhancedMetadata.vipLevel = row.metadata.vipLevel;
          else if (row.metadata?.vipLevelId)
            enhancedMetadata.vipLevel = row.metadata.vipLevelId;
          else if (row.metadata?.toLevel)
            enhancedMetadata.vipLevel = row.metadata.toLevel;
          else if (row.metadata?.level)
            enhancedMetadata.vipLevel = row.metadata.level;
        }
      }

      // 🎁 Handle other VIP reward types with level
      if (
        subcategoryText.startsWith('VIP_') &&
        (subcategoryText.includes('REWARD') ||
          subcategoryText.includes('BONUS'))
      ) {
        if (!enhancedMetadata.vipLevel) {
          if (row.metadata?.vipLevel)
            enhancedMetadata.vipLevel = row.metadata.vipLevel;
          else if (row.metadata?.vipLevelId)
            enhancedMetadata.vipLevel = row.metadata.vipLevelId;
        }
      }

      // Translate the subcategory text with metadata for game sessions and VIP levels
      const translatedText = translateSubcategory(
        subcategoryText,
        enhancedMetadata,
      );

      if (translatedText && translatedText !== '-') {
        return h('span', { class: 'text-sm' }, translatedText);
      }

      return h('span', { class: 'text-gray-400 text-sm' }, '-');
    },
  },
  {
    title: $t('user.userDetail.balanceBefore'),
    key: 'balanceBefore',
    width: 120,
    align: 'right',
    render: (row) => {
      const before = Number(row.balanceBefore) || 0;
      return h('span', { class: 'text-sm font-medium' }, before.toFixed(2));
    },
  },
  {
    title: $t('user.userDetail.changeAmount'),
    key: 'amount',
    width: 120,
    align: 'right',
    render: (row) => {
      const amount = Number(row.amount) || 0;
      const isPositive = amount >= 0;
      const color = isPositive ? 'text-green-600' : 'text-red-600';
      return h(
        'span',
        {
          class: `font-semibold ${color}`,
        },
        `${isPositive ? '' : '-'}${Math.abs(amount).toFixed(2)}`,
      );
    },
  },
  {
    title: $t('user.userDetail.balanceAfter'),
    key: 'balanceAfter',
    width: 120,
    align: 'right',
    render: (row) => {
      const after = Number(row.balanceAfter) || 0;
      return h('span', { class: 'text-sm font-medium' }, after.toFixed(2));
    },
  },
  {
    title: $t('user.userDetail.frontendNote'),
    key: 'frontendNotes',
    width: 200,
    ellipsis: {
      tooltip: true, // Enable tooltip for long error messages
    },
    render: (row) => {
      // Priority: frontendNotes > errorMessage > notes > failureReason > cancellationReason
      const notes =
        row.metadata?.frontendNotes ||
        row.metadata?.errorMessage ||
        row.metadata?.notes ||
        row.metadata?.failureReason ||
        row.metadata?.cancellationReason ||
        '';

      // For failed/unfrozen withdrawals, show error in red
      const isError =
        row.metadata?.subcategoryDetails === 'withdrawal_unfreeze' && notes;

      return h(
        'span',
        {
          class: isError ? 'text-sm text-red-600' : 'text-sm text-gray-600',
        },
        notes || '-',
      );
    },
  },
  {
    title: $t('user.userDetail.lastOperator'),
    key: 'operator',
    width: 120,
    render: (row) => {
      const operator = row.metadata?.operator || row.metadata?.adminName || '';
      return h('span', { class: 'text-sm' }, operator || '-');
    },
  },
  {
    title: $t('user.userDetail.backendNote'),
    key: 'backendNotes',
    width: 150,
    ellipsis: true,
    render: (row) => {
      const notes =
        row.metadata?.backendNotes || row.metadata?.internalNotes || '';
      return h('span', { class: 'text-sm text-gray-600' }, notes || '-');
    },
  },
]);

// Computed
const visibleModel = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});

// Manual transaction computed properties
const currentSubTypeOptions = computed(() => {
  return (
    subTypeOptionsMap.value[
      manualTransactionForm.type as keyof typeof subTypeOptionsMap.value
    ] || []
  );
});

const showMultiplier = computed(() => {
  return (
    manualTransactionForm.type === 'adjustment' ||
    manualTransactionForm.type === 'bonus_adjustment'
  );
});

const finalAmount = computed(() => {
  return manualTransactionForm.amount * manualTransactionForm.multiplier;
});

const afterBalance = computed(() => {
  const currentBalance = userDetail.value?.balance || 0;
  if (isDebitType(manualTransactionForm.type)) {
    return currentBalance - finalAmount.value;
  } else {
    return currentBalance + finalAmount.value;
  }
});

const canSubmitTransaction = computed(() => {
  return (
    manualTransactionForm.type &&
    manualTransactionForm.subType &&
    manualTransactionForm.amount > 0 &&
    manualTransactionForm.description.trim() !== ''
  );
});

// Transaction summary computed properties - ALWAYS use summary data (not paginated records)
// 🎯 FIX: Use ONLY the API summary which contains totals for ALL transactions in the date range
const totalDeposit = computed(() => {
  // Always use summary data from API (which includes ALL transactions, not just current page)
  if (
    walletTransactionSummary.value &&
    walletTransactionSummary.value.totalDeposits !== undefined
  ) {
    return walletTransactionSummary.value.totalDeposits;
  }

  return 0;
});

const totalWithdraw = computed(() => {
  // Always use summary data from API (which includes ALL transactions, not just current page)
  if (
    walletTransactionSummary.value &&
    walletTransactionSummary.value.totalWithdrawals !== undefined
  ) {
    return walletTransactionSummary.value.totalWithdrawals;
  }

  return 0;
});

const netFlow = computed(() => {
  // Calculate net flow from deposits and withdrawals
  return totalDeposit.value - totalWithdraw.value;
});

// Single watcher for visible + userId to avoid double API call when opening from feedback/other pages
// (Both props change in same tick → previously two watchers each called loadUserDetail once)
watch(
  () => [props.visible, props.userId] as const,
  ([newVisible, newUserId]) => {
    if (newVisible && newUserId) {
      loadUserDetail(true);
      // Initialize date range and load transactions if on transactions tab
      if (activeTab.value === 'transactions') {
        if (transactionDateRange.value === null) {
          setDateRangeFromFilter('today');
        } else {
          loadTransactionRecords();
        }
      }
    }
  },
);

// Watch for tab changes to load transaction records
watch(
  () => activeTab.value,
  (newTab) => {
    if (newTab === 'transactions' && props.userId) {
      // Initialize date range if not set (switching to transactions tab)
      if (transactionDateRange.value === null) {
        setDateRangeFromFilter('today'); // This will also load records
      } else {
        loadTransactionRecords(); // Just reload with existing date range
      }
    }
  },
);

// Load transaction records when modal is opened
// Note: Don't load userDetail here - it's handled by watch(visible)
onMounted(() => {
  if (props.visible && props.userId && activeTab.value === 'transactions') {
    loadTransactionRecords();
  }
});

// Methods
const loadUserDetail = async (forceRefresh = false) => {
  if (!props.userId) return;

  loading.value = true;
  try {
    // Single optimized API call that includes all data
    // Pass forceRefresh to bypass cache
    console.log(`📡 Loading user detail (forceRefresh: ${forceRefresh})`);
    userDetail.value = await getUserDetailApi(
      Number(props.userId),
      forceRefresh,
    );

    console.log('✅ User detail loaded:', {
      id: userDetail.value?.id,
      memberLevel: userDetail.value?.memberLevel,
      memberTier: userDetail.value?.memberTier,
    });

    // Initialize user stats from user detail data (optimized - no logging)
    userStats.value = {
      totalDeposits: userDetail.value.totalDeposit,
      totalDepositsCount: userDetail.value.totalDepositCount,
      totalWithdrawals: userDetail.value.totalWithdraw,
      totalWithdrawalsCount: userDetail.value.totalWithdrawCount,
      totalManualCredits: 0,
      totalManualDebits: 0,
      todayValidBetAmount: userDetail.value.todayValidBet,
      todayBetAmount: userDetail.value.todayTotalBet,
      todayProfitLoss: userDetail.value.todayWinLoss,
    };

    // ✅ OPTIMIZATION: Fetch security statistics in background (non-blocking)
    // Don't await - let it load in background while modal is already visible
    Promise.all([
      getUserSecurityStatsApi(Number(props.userId)),
      getSameWithdrawalAccountCountApi(Number(props.userId)),
    ])
      .then(([securityStats, sameWithdrawalAccountCount]) => {
        console.log('📊 Security stats received:', securityStats);

        // Update user detail with real security stats
        if (userDetail.value) {
          userDetail.value.passwordMatchCount =
            securityStats.passwordMatchCount;
          userDetail.value.sameWithdrawalPinCount =
            securityStats.sameWithdrawalPinCount;
          userDetail.value.withdrawalAccountCount =
            securityStats.withdrawAccountCount;
          userDetail.value.sameAccountCount =
            sameWithdrawalAccountCount ||
            securityStats.sameWithdrawalAccountCount ||
            securityStats.sameAccountCount;
          userDetail.value.sameRegIpCount = securityStats.sameRegIpCount;
          userDetail.value.sameRealNameCount = securityStats.sameRealNameCount;
          userDetail.value.sameRegistrationDeviceCount =
            securityStats.sameRegistrationDeviceCount;
          userDetail.value.sameLastLoginDeviceCount =
            securityStats.sameLastLoginDeviceCount;
          console.log('✅ Security stats updated in userDetail:', {
            passwordMatchCount: securityStats.passwordMatchCount,
            sameWithdrawalPinCount: securityStats.sameWithdrawalPinCount,
            sameRegIpCount: securityStats.sameRegIpCount,
            sameRealNameCount: securityStats.sameRealNameCount,
            sameRegistrationDeviceCount:
              securityStats.sameRegistrationDeviceCount,
            sameLastLoginDeviceCount: securityStats.sameLastLoginDeviceCount,
          });
        }
      })
      .catch((securityError) => {
        console.error('❌ Failed to fetch security stats:', securityError);
        // Don't fail the whole operation if security stats fail
      });

    // Load transaction records if transactions tab is active
    if (activeTab.value === 'transactions') {
      loadTransactionRecords();
    }
  } catch (error) {
    message.error($t('user.userDetail.loadUserDetailFailed'));
    console.error('Error loading user detail:', error);
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  emit('update:visible', false);
  activeTab.value = 'overview';
};

const handleRefresh = () => {
  loadUserDetail(true);
  emit('refresh');
};

const handleEdit = () => {
  message.info($t('user.userDetail.editDeveloping'));
};

const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return $t('user.userDetail.invalidDate');

  try {
    // Use timezone conversion utility
    return formatDateTimeInTimezone(dateString);
  } catch (error) {
    console.warn('Date formatting error:', error, 'Input:', dateString);
    return $t('user.userDetail.invalidDate');
  }
};

const getStatusType = (
  status: string,
): 'success' | 'error' | 'warning' | 'default' => {
  const statusMap: Record<string, 'success' | 'error' | 'warning'> = {
    NORMAL: 'success',
    ACTIVE: 'success',
    MANUAL_FREEZE: 'error',
    ABNORMAL_FREEZE: 'error',
    PROHIBIT_BONUS: 'warning',
    PROHIBIT_WITHDRAWAL: 'warning',
    PROHIBIT_GAME_ENTRY: 'warning',
    BLACKLIST: 'error',
    MARGINAL: 'warning',
    BANNED: 'error',
    SUSPENDED: 'warning',
  };
  return statusMap[status] || 'default';
};

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    NORMAL: $t('user.userDetail.statusNormal'),
    ACTIVE: $t('user.userDetail.statusNormal'),
    MANUAL_FREEZE: $t('user.userDetail.statusManualFreeze'),
    ABNORMAL_FREEZE: $t('user.userDetail.statusAbnormalFreeze'),
    PROHIBIT_BONUS: $t('user.userDetail.statusProhibitBonus'),
    PROHIBIT_WITHDRAWAL: $t('user.userDetail.statusProhibitWithdrawal'),
    PROHIBIT_GAME_ENTRY: $t('user.userDetail.statusProhibitGame'),
    BLACKLIST: $t('user.userDetail.statusBlacklist'),
    MARGINAL: $t('user.userDetail.statusMarginal'),
    BANNED: $t('user.userDetail.statusBanned'),
    SUSPENDED: $t('user.userDetail.statusSuspended'),
  };
  return statusMap[status] || status;
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    message.success($t('user.userDetail.copied'));
  } catch (error) {
    message.error($t('user.userDetail.copyFailed'));
  }
};

const handleShowStatusModal = () => {
  // Pre-fill the modal with current status and reason
  if (userDetail.value) {
    // Use accountStatus first (always correct), fallback to status
    const currentStatus =
      userDetail.value.accountStatus || userDetail.value.status || 'NORMAL';
    newStatus.value = currentStatus;

    // Pre-fill the status reason if it exists
    statusReason.value = (userDetail.value as any).accountStatusReason || '';

    console.log(
      '🔧 Opening status modal - userDetail.accountStatus:',
      userDetail.value.accountStatus,
    );
    console.log(
      '🔧 Opening status modal - userDetail.status:',
      userDetail.value.status,
    );
    console.log(
      '🔧 Opening status modal - userDetail.accountStatusReason:',
      (userDetail.value as any).accountStatusReason,
    );
    console.log('🔧 Setting newStatus to:', newStatus.value);
    console.log('🔧 Setting statusReason to:', statusReason.value);
  }
  showStatusModal.value = true;
};

const handleUpdateStatus = async () => {
  if (!props.userId || !newStatus.value) return;

  try {
    // Send both status and reason to backend
    console.log(
      '💾 Saving status - newStatus:',
      newStatus.value,
      'reason:',
      statusReason.value,
    );
    await updateUserStatusApi(
      Number(props.userId),
      newStatus.value,
      statusReason.value || undefined,
    );
    message.success($t('user.userDetail.statusUpdateSuccess'));
    showStatusModal.value = false;

    // Force reload user detail with cache bust
    await loadUserDetail(true);

    // Notify parent to refresh list
    emit('refresh');
  } catch (error) {
    message.error($t('user.userDetail.statusUpdateFailed'));
  }
};

// Manual transaction helper methods
const isDebitType = (type: string) => {
  return ['debit', 'penalty'].includes(type);
};

const getTransactionTypeLabel = (type: string) => {
  const labelMap = {
    credit: $t('user.userDetail.txCredit'),
    debit: $t('user.userDetail.txDebit'),
    adjustment: $t('user.userDetail.txAdjustment'),
    correction: $t('user.userDetail.txCorrection'),
    bonus_adjustment: $t('user.userDetail.txBonusAdjustment'),
    penalty: $t('user.userDetail.txPenalty'),
  };
  return labelMap[type as keyof typeof labelMap] || type;
};

const getTransactionTagType = (type: string) => {
  if (['credit', 'bonus_adjustment'].includes(type)) return 'success';
  if (['debit', 'penalty'].includes(type)) return 'error';
  return 'warning';
};

const getSubmitButtonText = () => {
  if (!manualTransactionForm.type) return $t('common.submit');
  return $t('user.userDetail.confirmTransactionType', [
    getTransactionTypeLabel(manualTransactionForm.type),
  ]);
};

const handleTransactionTypeChange = () => {
  // Reset sub type when type changes
  manualTransactionForm.subType = '';
};

const resetManualTransactionForm = () => {
  Object.assign(manualTransactionForm, {
    type: '',
    subType: '',
    amount: 0,
    multiplier: 1,
    currency: 'BRL',
    description: '',
    frontendNotes: '',
    backendNotes: '',
    reason: '',
  });
};

const handleShowManualTransaction = (type: 'credit' | 'debit') => {
  resetManualTransactionForm();
  manualTransactionForm.type = type;
  showManualTransactionModal.value = true;
};

// 🔧 FIX: Add refresh balance handler
const handleRefreshBalance = async () => {
  console.log('🔄 Manually refreshing user balance...');
  try {
    await loadUserDetail(true); // Force refresh with cache bust
    message.success($t('user.userDetail.balanceRefreshSuccess'));
  } catch (error) {
    console.error('Failed to refresh balance:', error);
    message.error($t('user.userDetail.balanceRefreshFailed'));
  }
};

const handleSubmitManualTransaction = async () => {
  if (!manualFormRef.value) return;

  try {
    await manualFormRef.value.validate();
    manualTransactionLoading.value = true;

    await createManualTransactionApi({
      userId: Number(props.userId!),
      type: manualTransactionForm.type as any,
      subType: manualTransactionForm.subType,
      amount: manualTransactionForm.amount,
      multiplier: manualTransactionForm.multiplier,
      description: manualTransactionForm.description,
      frontendNotes: manualTransactionForm.frontendNotes,
      backendNotes: manualTransactionForm.backendNotes,
      reason: manualTransactionForm.reason,
      currency: manualTransactionForm.currency,
    });

    message.success(
      $t('user.userDetail.operationSuccess', [getTransactionTypeLabel(manualTransactionForm.type)]),
    );
    showManualTransactionModal.value = false;
    resetManualTransactionForm();

    // Force reload user detail with cache bust
    await loadUserDetail(true);

    // Refresh transaction records if on transactions tab
    if (activeTab.value === 'transactions') {
      loadTransactionRecords();
    }

    // Notify parent to refresh list
    emit('refresh');
  } catch (error) {
    message.error(
      $t('user.userDetail.operationFailed', [getTransactionTypeLabel(manualTransactionForm.type)]),
    );
    console.error('Manual transaction error:', error);
  } finally {
    manualTransactionLoading.value = false;
  }
};

// Transaction records methods - now using wallet transactions
const loadTransactionRecords = async () => {
  if (!props.userId) return;

  transactionLoading.value = true;
  try {
    // 🎯 NEW: Use wallet transactions API instead of manual-only transactions
    const dateValue = (transactionTypeFilter.value || 'today') as
      | 'today'
      | 'yesterday'
      | 'week'
      | 'month'
      | 'all'
      | 'custom';
    const params = {
      userId: Number(props.userId),
      page: transactionPagination.page,
      pageSize: transactionPagination.pageSize,
      date: dateValue,
      category: 'all', // Show all categories of wallet transactions
      startDate: transactionDateRange.value?.[0]
        ? new Date(transactionDateRange.value[0])
            .toISOString()
            .split('T')[0]
        : undefined,
      endDate: transactionDateRange.value?.[1]
        ? new Date(transactionDateRange.value[1])
            .toISOString()
            .split('T')[0]
        : undefined,
      forceRefresh: true, // 🎯 Force refresh to bypass cache
    };

    console.log('📤 [MODAL] Requesting transactions with params:', params);
    const response = await getUserWalletTransactionsApi(params);
    console.log('📥 [MODAL] Raw response received:', {
      transactionsCount: response.transactions?.length,
      paginationObject: response.pagination,
      paginationTotal: response.pagination?.total,
      paginationTotalPages: response.pagination?.totalPages,
    });

    // Store the summary data
    walletTransactionSummary.value = response.summary;

    // Process transactions - ensure proper data types
    const processedRecords = response.transactions.map((record: any) => ({
      ...record,
      amount: Number(record.amount) || 0,
      balanceBefore: Number(record.balanceBefore) || 0,
      balanceAfter: Number(record.balanceAfter) || 0,
      createdAt: record.createdAt,
      description: record.description || '',
      type: record.type || '',
      status: record.status || 'completed',
    }));

    transactionRecords.value = processedRecords;
    transactionPagination.page = response.pagination.current;
    transactionPagination.pageSize = response.pagination.pageSize;
    transactionPagination.itemCount = response.pagination.total; // 🎯 FIX: Use itemCount for Naive UI
    transactionPagination.pageCount = Math.ceil(
      response.pagination.total / response.pagination.pageSize,
    ); // 🎯 Explicitly calculate pageCount

    console.log('🔍 [MODAL] Pagination updated:', {
      page: transactionPagination.page,
      pageSize: transactionPagination.pageSize,
      itemCount: transactionPagination.itemCount,
      pageCount: transactionPagination.pageCount,
      calculatedPages: Math.ceil(
        transactionPagination.itemCount / transactionPagination.pageSize,
      ),
      responseTotal: response.pagination.total,
      responseTotalPages: response.pagination.totalPages,
    });

    // ✅ Pre-load activity names for recharge activities (non-blocking)
    // This populates the cache so translateSubcategory can use real activity names
    preloadActivityNames(processedRecords).catch((error) => {
      console.warn('⚠️ Failed to pre-load activity names:', error);
    });
  } catch (error) {
    message.error($t('user.userDetail.loadWalletTxFailed'));
    console.error('Error loading wallet transactions:', error);
  } finally {
    transactionLoading.value = false;
  }
};

const handleViewTransactionHistory = () => {
  activeTab.value = 'transactions';
  loadTransactionRecords();
};

// Helper function to set date range based on quick filter selection
const setDateRangeFromFilter = (filterType: 'today' | 'week' | 'month') => {
  const now = new Date();
  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
  );

  transactionTypeFilter.value = filterType;

  switch (filterType) {
    case 'today':
      // Today: start of today to end of today
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
      );
      transactionDateRange.value = [
        startOfToday.getTime(),
        endOfToday.getTime(),
      ];
      break;

    case 'week':
      // Last 7 days: 7 days ago to today
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      transactionDateRange.value = [weekAgo.getTime(), endOfToday.getTime()];
      break;

    case 'month':
      // Last 30 days: 30 days ago to today
      const monthAgo = new Date(now);
      monthAgo.setDate(monthAgo.getDate() - 30);
      monthAgo.setHours(0, 0, 0, 0);
      transactionDateRange.value = [monthAgo.getTime(), endOfToday.getTime()];
      break;
  }

  // Reset pagination and load records
  transactionPagination.page = 1;
  loadTransactionRecords();
};

const handleTransactionDateRangeChange = () => {
  transactionTypeFilter.value = 'custom';
};

const handleResetTransactionFilter = () => {
  transactionTypeFilter.value = 'today'; // Reset to today (default)
  transactionStatusFilter.value = '';
  transactionCategoryFilter.value = '';
  transactionSearchId.value = '';
  transactionDateRange.value = null;
  transactionPagination.page = 1;
  transactionPagination.pageCount = 1; // Reset page count
  setDateRangeFromFilter('today');
};

// Handle real name click to filter main grid
const handleFilterByName = (name: string) => {
  emit('filter-by-name', name);
  // Close the modal to show the filtered grid
  emit('update:visible', false);
};

// Handle commission click
const handleCommissionClick = (amount: number) => {
  emit('commission-click', amount);
};

// Handle view withdrawal accounts - switch to withdrawal accounts tab
const handleViewWithdrawalAccounts = () => {
  activeTab.value = 'withdrawal-accounts';
};

// Handle view associations
const handleViewAssociations = (
  type: 'registration_ip' | 'registration_device',
) => {
  associationTypeFilter.value = type;
  activeTab.value = 'associations';
};

// Handle reset withdrawal PIN - show modal
const handleResetWithdrawalPin = () => {
  if (!props.userId) return;
  withdrawalPinForm.value.newPin = '';
  showWithdrawalPinModal.value = true;
};

// Handle PIN input - only allow numbers and max 6 digits
const handlePinInput = (value: string) => {
  // Remove non-numeric characters and limit to 6 digits
  withdrawalPinForm.value.newPin = value.replace(/\D/g, '').slice(0, 6);
};

// Confirm reset withdrawal PIN
const confirmResetWithdrawalPin = async () => {
  if (!props.userId) return;

  const newPin = withdrawalPinForm.value.newPin;

  // Validate PIN if provided (must be exactly 6 digits)
  if (newPin && newPin.length !== 6) {
    message.error($t('user.userDetail.pinMustBeSixDigits'));
    return;
  }

  try {
    // Call API to reset withdrawal PIN
    await resetWithdrawalPinApi(Number(props.userId), newPin || undefined);

    if (newPin) {
      message.success($t('user.userDetail.withdrawPinResetTo', [newPin]));
    } else {
      message.success($t('user.userDetail.pinClearedHint'));
    }

    showWithdrawalPinModal.value = false;

    // Force reload user detail with cache bust
    await loadUserDetail(true);

    // Notify parent to refresh list
    emit('refresh');
  } catch (error) {
    message.error($t('user.userDetail.resetPinFailed'));
    console.error('Reset withdrawal PIN error:', error);
  }
};

// Handle update password
const handleUpdatePassword = async () => {
  if (!passwordFormRef.value) return;

  // Validate form
  if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
    message.error($t('user.userDetail.fillRequiredFields'));
    return;
  }

  if (passwordForm.newPassword.length < 6) {
    message.error($t('user.backofficeAccount.passwordMinLength'));
    return;
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    message.error($t('user.backofficeAccount.passwordMismatch'));
    return;
  }

  try {
    passwordLoading.value = true;

    // Call API to update password
    await updateUserPasswordApi(Number(props.userId), passwordForm.newPassword);

    message.success($t('user.userDetail.passwordUpdateSuccess'));
    showPasswordModal.value = false;
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';

    // Force reload user detail with cache bust
    await loadUserDetail(true);

    // Notify parent to refresh list
    emit('refresh');
  } catch (error) {
    message.error($t('user.userDetail.passwordUpdateFailed'));
    console.error('Update password error:', error);
  } finally {
    passwordLoading.value = false;
  }
};

// Handle navigate to VIP settings
const handleNavigateToVipSettings = () => {
  emit('update:visible', false);
  router.push('/preferentialActivitiesNew/vip-reward/setting');
};

// Handle navigate to recharge management with user filter
const handleNavigateToRecharge = () => {
  if (!userDetail.value) return;

  emit('update:visible', false);
  router.push({
    path: '/finance/recharge-management',
    query: {
      tab: 'all-recharges',
      userId: userDetail.value.id,
      userAccount: userDetail.value.account,
      userName: userDetail.value.realName || userDetail.value.account,
    },
  });
};

// Handle navigate to withdrawal management with user filter
const handleNavigateToWithdrawal = () => {
  if (!userDetail.value) return;

  emit('update:visible', false);
  router.push({
    path: '/finance/withdraw-management',
    query: {
      tab: 'all-withdrawals',
      userId: userDetail.value.id,
      userAccount: userDetail.value.account,
      userName: userDetail.value.realName || userDetail.value.account,
    },
  });
};

// Handle navigate to bet records with user filter
const handleNavigateToBetRecords = () => {
  if (!userDetail.value) return;

  emit('update:visible', false);
  router.push({
    path: '/game-management/bet-records',
    query: {
      userId: userDetail.value.id,
      userAccount: userDetail.value.account,
      userName: userDetail.value.realName || userDetail.value.account,
    },
  });
};

// Handle navigate to wagering audit with user filter
const handleNavigateToWageringAudit = () => {
  if (!userDetail.value) return;

  emit('update:visible', false);
  router.push({
    path: '/finance/wagering-audit',
    query: {
      userId: userDetail.value.id,
      userAccount: userDetail.value.account,
      userName: userDetail.value.realName || userDetail.value.account,
    },
  });
};

// ✅ NEW: Handle filter by same login password
const handleFilterBySamePassword = () => {
  if (!userDetail.value) return;

  emit('update:visible', false);
  router.push({
    path: '/user-management/all-members',
    query: {
      searchField: 'same_login_password',
      searchValue: String(userDetail.value.id), // Use current user ID as reference
      filterType: 'same_password',
      matchCount: userDetail.value.passwordMatchCount || 0,
    },
  });
};

// ✅ NEW: Handle filter by same withdrawal PIN
const handleFilterBySameWithdrawalPin = () => {
  if (!userDetail.value) return;

  emit('update:visible', false);
  router.push({
    path: '/user-management/all-members',
    query: {
      searchField: 'same_withdrawal_pin',
      searchValue: String(userDetail.value.id), // Use current user ID as reference
      filterType: 'same_withdrawal_pin',
      matchCount: userDetail.value.sameWithdrawalPinCount || 0,
    },
  });
};

// ✅ Handle filter by same withdrawal account — open associations tab
const handleFilterBySameWithdrawalAccount = () => {
  if (!userDetail.value) return;

  associationTypeFilter.value = 'same_withdrawal_account';
  activeTab.value = 'associations';
};

// ✅ FIX: Handle filter by registration IP (click on IP itself)
const handleFilterByRegistrationIp = () => {
  if (!userDetail.value || !userDetail.value.registrationIp) return;

  emit('update:visible', false);
  router.push({
    path: '/user-management/all-members',
    query: {
      searchField: 'registration_ip',
      searchValue: userDetail.value.registrationIp,
      filterType: 'registration_ip',
    },
  });
};

// ✅ NEW: Handle filter by same registration IP (click on count)
const handleFilterBySameRegistrationIp = () => {
  if (!userDetail.value || !userDetail.value.registrationIp) return;

  emit('update:visible', false);
  router.push({
    path: '/user-management/all-members',
    query: {
      searchField: 'registration_ip',
      searchValue: userDetail.value.registrationIp,
      filterType: 'same_registration_ip',
      matchCount: userDetail.value.sameRegIpCount || 0,
    },
  });
};

// ✅ NEW: Handle filter by registration domain
const handleFilterByRegistrationDomain = () => {
  if (!userDetail.value || !userDetail.value.registrationDomain) return;

  emit('update:visible', false);
  router.push({
    path: '/user-management/all-members',
    query: {
      searchField: 'registration_domain',
      searchValue: userDetail.value.registrationDomain,
    },
  });
};

// ✅ NEW: Handle filter by upper agent
const handleFilterByUpperAgent = () => {
  // ✅ FIX: Use invitedBy (userID) for search, display as 上级代理ID
  const upperAgentId = userDetail.value?.invitedBy;
  if (!userDetail.value || !upperAgentId || upperAgentId === $t('user.userDetail.none')) return;

  emit('update:visible', false);
  router.push({
    path: '/user-management/all-members',
    query: {
      searchField: 'upper_agent_id',
      searchValue: upperAgentId,
    },
  });
};

// ✅ NEW: Handle filter by registration device
const handleFilterByRegistrationDevice = () => {
  if (!userDetail.value || !userDetail.value.registrationDeviceId) return;

  emit('update:visible', false);
  router.push({
    path: '/user-management/all-members',
    query: {
      searchField: 'registration_device',
      searchValue: userDetail.value.registrationDeviceId,
    },
  });
};

// ✅ NEW: Handle filter by registration source
const handleFilterByRegistrationSource = () => {
  if (!userDetail.value || !userDetail.value.registrationSource) return;

  emit('update:visible', false);
  router.push({
    path: '/user-management/all-members',
    query: {
      searchField: 'registration_source',
      searchValue: userDetail.value.registrationSource,
    },
  });
};

const handleFilterByRegistrationFingerprint = () => {
  filterMembersBySearchField(
    'registration_fingerprint',
    userDetail.value?.registrationFingerprint,
  );
};

// ✅ NEW: Handle filter by last login IP
const handleFilterByLastLoginIp = () => {
  if (!userDetail.value || !userDetail.value.lastLoginIp) return;

  emit('update:visible', false);
  router.push({
    path: '/user-management/all-members',
    query: {
      searchField: 'last_login_ip',
      searchValue: userDetail.value.lastLoginIp,
    },
  });
};

// ✅ NEW: Handle filter by last login domain
const handleFilterByLastLoginDomain = () => {
  if (!userDetail.value || !userDetail.value.lastLoginDomain) return;

  emit('update:visible', false);
  router.push({
    path: '/user-management/all-members',
    query: {
      searchField: 'last_login_domain',
      searchValue: userDetail.value.lastLoginDomain,
    },
  });
};

// ✅ NEW: Handle filter by last login device
const handleFilterByLastLoginDevice = () => {
  if (!userDetail.value || !userDetail.value.lastLoginDeviceId) return;

  emit('update:visible', false);
  router.push({
    path: '/user-management/all-members',
    query: {
      searchField: 'last_login_device',
      searchValue: userDetail.value.lastLoginDeviceId,
    },
  });
};

const handleFilterByLastLoginFingerprint = () => {
  filterMembersBySearchField(
    'last_login_fingerprint',
    userDetail.value?.lastLoginFingerprint,
  );
};
</script>

<style scoped>
.user-detail-content {
  display: flex;
  flex-direction: column;
  height: 75vh;
  overflow: hidden;
}

/* User Info Bar - Fixed below tab headers */
.user-info-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 12px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.info-label {
  color: #666;
  font-weight: 500;
}

.info-value {
  color: #1a1a1a;
  font-weight: 600;
  margin-right: 4px;
}

/* Fix n-tabs to take full height with scrollable content */
.user-detail-content :deep(.n-tabs) {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.user-detail-content :deep(.n-tabs-nav) {
  flex-shrink: 0;
}

.user-detail-content :deep(.n-tabs-pane-wrapper) {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.user-detail-content :deep(.n-tab-pane) {
  padding-bottom: 20px;
}

/* Two-Column Table Layout matching screenshot */
.user-detail-table {
  width: 100%;
  background: #fff;
}

.detail-table-two-column {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  table-layout: fixed;
}

.detail-table-two-column tbody tr {
  border-bottom: 1px solid #e5e7eb;
}

.detail-table-two-column tbody tr:hover {
  background: #f9fafb;
}

/* Label cells - narrower for 2-column layout */
.label-cell {
  width: 140px;
  padding: 10px 12px;
  background: #f5f5f5;
  color: #666;
  font-weight: 500;
  vertical-align: top;
  border-right: 1px solid #e5e7eb;
  white-space: nowrap;
}

/* Value cells - flexible width */
.value-cell {
  padding: 10px 12px;
  color: #333;
  background: #fff;
  border-right: 1px solid #e5e7eb;
}

.value-cell:last-child {
  border-right: none;
}

/* Cell content layout - buttons aligned to right */
.cell-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.content-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1;
}

.content-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  margin-left: auto;
}

.value-cell .text-blue-600 {
  color: #2563eb;
}

.value-cell .text-gray-500 {
  color: #6b7280;
}

.value-cell .text-gray-600 {
  color: #4b5563;
}

.value-cell .text-red-600 {
  color: #dc2626;
}

.value-cell .text-green-600 {
  color: #16a34a;
}

/* Legacy styles for other tabs */
.n-descriptions :deep(.n-descriptions-item-label) {
  font-weight: 500;
  color: #666;
  padding: 8px 12px;
}

.n-descriptions :deep(.n-descriptions-item-content) {
  color: #333;
  padding: 8px 12px;
}

.n-descriptions :deep(.n-descriptions-item) {
  padding: 4px 0;
}

.n-card :deep(.n-card-header) {
  padding: 12px 16px;
}

.n-card :deep(.n-card__content) {
  padding: 12px 16px;
}

.summary-card {
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.transaction-records .n-card {
  border-radius: 8px;
}

.transaction-records .n-data-table {
  border-radius: 6px;
}

.transaction-records .n-tag {
  border-radius: 4px;
}
</style>
