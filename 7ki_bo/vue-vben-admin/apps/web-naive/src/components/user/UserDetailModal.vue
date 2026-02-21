<template>
  <n-modal
    v-model:show="visibleModel"
    :mask-closable="false"
    preset="card"
    title="会员详情"
    style="width: 98vw; max-width: 1600px; height: 90vh"
    size="huge"
    @close="handleClose"
  >
    <template #header-extra>
      <div class="flex gap-2">
        <n-button size="small" @click="handleRefresh"> 刷新 </n-button>
        <n-button size="small" type="primary" @click="handleEdit">
          编辑
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
          <span class="info-label">币种:</span>
          <span class="info-value">{{ userDetail.currency || 'BRL' }}</span>
        </span>
        <span class="info-item">
          <span class="info-label">会员账号:</span>
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
          <span class="info-label">会员ID:</span>
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
        <n-tab-pane name="overview" tab="会员概览">
          <!-- Two-Column Layout matching screenshot -->
          <div class="user-detail-table">
            <table class="detail-table-two-column">
              <tbody>
                <!-- Row 1: 账户状态 & 会员标签 -->
                <tr>
                  <td class="label-cell">账户状态</td>
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
                            '未知状态'
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
                          >修改状态</n-button
                        >
                      </div>
                    </div>
                  </td>
                  <td class="label-cell">会员标签</td>
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
                          >修改标签</n-button
                        >
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Row 2: 账号类型 & 会员层级 -->
                <tr>
                  <td class="label-cell">账号类型</td>
                  <td class="value-cell">{{ userDetail.accountType }}</td>
                  <td class="label-cell">会员层级</td>
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
                          >修改层级</n-button
                        >
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Row 3: 自我禁止状态 & 登录密码 -->
                <tr>
                  <td class="label-cell">自我禁止状态</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span>{{ userDetail.selfBanStatus || '--' }}</span>
                      </div>
                      <div class="content-right">
                        <n-button text type="info" size="tiny"
                          >恢复正常</n-button
                        >
                      </div>
                    </div>
                  </td>
                  <td class="label-cell">登录密码</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span
                          >****** 同登录密码人数(
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
                          >修改登录密码</n-button
                        >
                        <n-button text type="info" size="tiny"
                          >批量处理</n-button
                        >
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Row 4: 上级代理 & 提现密码 -->
                <tr>
                  <td class="label-cell">上级代理</td>
                  <td class="value-cell">
                    <span
                      v-if="
                        userDetail.invitedBy && userDetail.invitedBy !== '无'
                      "
                      class="cursor-pointer text-blue-600 hover:underline"
                      @click="handleFilterByUpperAgent"
                    >
                      {{ userDetail.invitedBy }}
                    </span>
                    <span v-else>无</span>
                  </td>
                  <td class="label-cell">提现密码</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span
                          >****** 同提现密码人数(
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
                          >重置提现密码</n-button
                        >
                        <n-button text type="info" size="tiny"
                          >批量处理</n-button
                        >
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Row 5: 代理佣金 & 提现账号 -->
                <tr>
                  <td class="label-cell">代理佣金</td>
                  <td class="value-cell">
                    累计佣金:
                    <span class="text-blue-600">{{
                      userDetail.totalCommission.toFixed(2)
                    }}</span>
                  </td>
                  <td class="label-cell">提现账号</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span
                          class="cursor-pointer text-blue-600 hover:underline"
                          @click="handleViewWithdrawalAccounts"
                        >
                          {{ userDetail.withdrawalAccountCount || 1 }}个
                        </span>
                        <span class="text-gray-500"
                          >同提现账号人数(
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
                          >批量处理</n-button
                        >
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Row 6: 真实姓名 & 注册IP -->
                <tr>
                  <td class="label-cell">真实姓名</td>
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
                          >近6天同姓名({{
                            userDetail.sameRealNameCount || 0
                          }})</span
                        >
                      </div>
                      <div class="content-right">
                        <n-button text type="info" size="tiny"
                          >批量处理</n-button
                        >
                      </div>
                    </div>
                  </td>
                  <td class="label-cell">注册IP</td>
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
                          >注册时间
                          {{
                            formatDateTime(userDetail.registrationTime)
                          }}
                          (已注册0天) 同IP人数(
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
                          >注册IP 关联</n-button
                        >
                        <n-button text size="tiny">批量处理</n-button>
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Row 7: 会员币种 & 注册域名 -->
                <tr>
                  <td class="label-cell">会员币种</td>
                  <td class="value-cell">
                    <div class="flex items-center gap-1">
                      <span>{{ userDetail.currency }}</span>
                      <span class="ml-1">🇧🇷</span>
                    </div>
                  </td>
                  <td class="label-cell">注册域名</td>
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
                  <td class="label-cell">账户余额</td>
                  <td class="value-cell" colspan="3">
                    <div class="cell-content">
                      <div class="content-left">
                        <span class="font-semibold text-blue-600">{{
                          userDetail.balance.toFixed(2)
                        }}</span>
                        <span class="text-gray-500"
                          >(可用{{ userDetail.balance.toFixed(2) }}+冻结{{
                            (userDetail.frozenBalance || 0).toFixed(2)
                          }})</span
                        >
                      </div>
                      <div class="content-right">
                        <n-button
                          text
                          type="success"
                          size="tiny"
                          @click="handleRefreshBalance"
                          :loading="loading"
                          >刷新</n-button
                        >
                        <n-button text type="warning" size="tiny"
                          >人工拉回</n-button
                        >
                        <n-button
                          text
                          type="info"
                          size="tiny"
                          @click="handleViewTransactionHistory"
                          >账变记录</n-button
                        >
                        <n-button
                          text
                          type="success"
                          size="tiny"
                          @click="handleShowManualTransaction('credit')"
                          >手动加款</n-button
                        >
                        <n-button
                          text
                          type="error"
                          size="tiny"
                          @click="handleShowManualTransaction('debit')"
                          >手动扣除</n-button
                        >
                        <n-button text size="tiny">手动加积分奖核</n-button>
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Row 9: 奖励钱包 & 累计充值 -->
                <tr>
                  <td class="label-cell">奖励钱包</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span>{{ userDetail.rewardWallet.toFixed(2) }}</span>
                      </div>
                      <div class="content-right">
                        <n-button text type="info" size="tiny">刷新</n-button>
                      </div>
                    </div>
                  </td>
                  <td class="label-cell">累计充值</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span class="text-blue-600">{{
                          userDetail.totalDeposit.toFixed(2)
                        }}</span>
                        <span class="text-gray-500"
                          >(0%) 近24小时充值
                          {{
                            (userDetail.last24HoursDeposit || 0).toFixed(2)
                          }}
                          历史最大单笔充值
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
                          >充值记录</n-button
                        >
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Row 10: 利息宝(累计收益) & 累计提现 -->
                <tr>
                  <td class="label-cell">利息宝(累计收益)</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span
                          >利息宝余额:
                          <span class="text-blue-600">{{
                            userDetail.savingsBalance.toFixed(2)
                          }}</span></span
                        >
                        <span
                          >累计收益:
                          {{ userDetail.totalSavingsEarned.toFixed(2) }}</span
                        >
                      </div>
                      <div class="content-right">
                        <n-button text type="info" size="tiny">刷新</n-button>
                      </div>
                    </div>
                  </td>
                  <td class="label-cell">累计提现</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span class="text-blue-600">{{
                          userDetail.totalWithdraw.toFixed(2)
                        }}</span>
                        <span class="text-gray-500"
                          >(0%) 近24小时提现
                          {{
                            (userDetail.last24HoursWithdraw || 0).toFixed(2)
                          }}
                          历史最大单笔提现
                          {{
                            (userDetail.maxSingleWithdraw || 0).toFixed(0)
                          }}</span
                        >
                        <span
                          v-if="(userDetail.totalManualDebits || 0) > 0"
                          class="ml-2 text-orange-500"
                        >
                          (手动扣款:
                          {{ (userDetail.totalManualDebits || 0).toFixed(2) }})
                        </span>
                      </div>
                      <div class="content-right">
                        <n-button
                          text
                          type="info"
                          size="tiny"
                          @click="handleNavigateToWithdrawal"
                          >提现记录</n-button
                        >
                        <n-button
                          text
                          type="warning"
                          size="tiny"
                          @click="handleNavigateToWageringAudit"
                          >实时稽核</n-button
                        >
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Row 11: 充提差额 & 今日投注 -->
                <tr>
                  <td class="label-cell">充提差额</td>
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
                  <td class="label-cell">今日投注</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span class="text-blue-600">{{
                          userDetail.todayTotalBet.toFixed(2)
                        }}</span>
                        <span class="text-gray-500"
                          >(有效投注 {{ userDetail.todayValidBet.toFixed(2) }})
                          (总有效投注
                          {{
                            (userDetail.totalValidBet || 0).toFixed(2)
                          }})</span
                        >
                      </div>
                      <div class="content-right">
                        <n-button
                          text
                          type="primary"
                          size="tiny"
                          @click="handleNavigateToBetRecords"
                          >投注记录</n-button
                        >
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Row 12: 今日输赢 & 活动优惠 -->
                <tr>
                  <td class="label-cell">今日输赢</td>
                  <td class="value-cell">
                    <div class="flex items-center gap-2">
                      <span
                        >(输赢金额
                        <span class="text-blue-600">{{
                          userDetail.todayWinLoss.toFixed(2)
                        }}</span
                        >) (总输赢金额
                        <span class="text-blue-600">{{
                          (userDetail.totalWinLoss || 0).toFixed(2)
                        }}</span
                        >)</span
                      >
                    </div>
                  </td>
                  <td class="label-cell">活动优惠</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span
                          >累计返水:
                          <span class="text-blue-600">{{
                            (userDetail.totalRebate || 0).toFixed(2)
                          }}</span></span
                        >
                        <span
                          >活动奖励:
                          <span class="text-blue-600">{{
                            (userDetail.activityReward || 0).toFixed(2)
                          }}</span></span
                        >
                        <span
                          >任务奖励:
                          <span class="text-blue-600">{{
                            (userDetail.taskReward || 0).toFixed(2)
                          }}</span></span
                        >
                        <span
                          >充值优惠:
                          <span class="text-blue-600">{{
                            (userDetail.depositBonus || 0).toFixed(2)
                          }}</span></span
                        >
                        <span
                          >放弃奖励:
                          <span class="text-blue-600">{{
                            (userDetail.abandonedReward || 0).toFixed(2)
                          }}</span></span
                        >
                        <div class="mt-2 w-full">
                          已取出的公积金:
                          <span class="text-blue-600">{{
                            (userDetail.withdrawnProvidentFund || 0).toFixed(2)
                          }}</span>
                        </div>
                      </div>
                      <div class="content-right">
                        <n-button text type="info" size="tiny">刷新</n-button>
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Row 13: 返水设置 & VIP等级 (full width) -->
                <tr>
                  <td class="label-cell">返水设置</td>
                  <td class="value-cell">
                    <div class="cell-content">
                      <div class="content-left">
                        <span>{{ userDetail.rebateSettings || '--' }}</span>
                      </div>
                      <div class="content-right">
                        <n-button text type="warning" size="tiny"
                          >修改</n-button
                        >
                      </div>
                    </div>
                  </td>
                  <td class="label-cell">VIP等级</td>
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
                            >(已领取:{{
                              (userDetail.vipRewardsClaimed || 0).toFixed(2)
                            }}) 距离VIP{{
                              userDetail.vipProgression.nextLevel.level
                            }}
                            充值还至
                            {{
                              userDetail.vipProgression.progress.remainingDeposit.toFixed(
                                0,
                              )
                            }}打码还至{{
                              userDetail.vipProgression.progress.remainingBet.toFixed(
                                0,
                              )
                            }}</span
                          >
                        </template>
                        <span v-else class="text-gray-600"
                          >(已领取:{{
                            (userDetail.vipRewardsClaimed || 0).toFixed(2)
                          }})</span
                        >
                      </div>
                      <div class="content-right">
                        <n-button text type="info" size="tiny">刷新</n-button>
                        <n-button
                          text
                          type="primary"
                          size="tiny"
                          @click="handleNavigateToVipSettings"
                          >VIP等级</n-button
                        >
                        <n-button text type="info" size="tiny"
                          >修改VIP等级</n-button
                        >
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Row 14: 注册设备号 & 注册浏览器指纹 -->
                <tr>
                  <td class="label-cell">注册设备号</td>
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
                          (设备号)
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
                          同登录设备人数({{
                            userDetail.sameRegistrationDeviceCount || 0
                          }})
                        </span>
                      </div>
                      <div class="content-right">
                        <n-button
                          text
                          type="info"
                          size="tiny"
                          @click="handleViewAssociations('registration_device')"
                          >注册设备号 关联</n-button
                        >
                        <n-button text size="tiny">批量处理</n-button>
                      </div>
                    </div>
                  </td>
                  <td class="label-cell">注册浏览器指纹</td>
                  <td class="value-cell">
                    {{ userDetail.registrationFingerprint || '--' }}
                  </td>
                </tr>

                <!-- Row 15: 注册来源 & 注册域名详情 -->
                <tr>
                  <td class="label-cell">注册来源</td>
                  <td class="value-cell">
                    <span
                      v-if="userDetail.registrationSource"
                      class="cursor-pointer text-blue-600 hover:underline"
                      @click="handleFilterByRegistrationSource"
                    >
                      {{ userDetail.registrationSource }}
                    </span>
                    <span v-else>推广注册</span>
                  </td>
                  <td class="label-cell" colspan="2">
                    <div class="mt-1 text-xs text-gray-500">
                      (注册地址:
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
                  <td class="label-cell">最后登录ip</td>
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
                        <span class="text-gray-500"
                          >({{ userDetail.lastLoginLocation || '--' }}) 登录时间
                          {{ formatDateTime(userDetail.lastLoginTime) }}</span
                        >
                      </div>
                      <div class="content-right">
                        <n-button text type="info" size="tiny"
                          >更多记录</n-button
                        >
                        <n-button text size="tiny">批量处理</n-button>
                      </div>
                    </div>
                  </td>
                  <td class="label-cell">最后登录域名</td>
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

                <!-- Row 17: 最后登录设备号 & 最后登录指纹 -->
                <tr>
                  <td class="label-cell">最后登录设备号</td>
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
                          (设备号) 同登录设备数({{
                            userDetail.sameLastLoginDeviceCount || 0
                          }})
                        </span>
                      </div>
                      <div class="content-right">
                        <n-button text type="info" size="tiny"
                          >更多记录</n-button
                        >
                        <n-button text size="tiny">批量处理</n-button>
                      </div>
                    </div>
                  </td>
                  <td class="label-cell">最后登录指纹</td>
                  <td class="value-cell">--</td>
                </tr>

                <!-- Row 18: 第三方绑定账号 & 注册方式 -->
                <tr>
                  <td class="label-cell">第三方绑定账号</td>
                  <td class="value-cell">--</td>
                  <td class="label-cell">注册方式</td>
                  <td class="value-cell">
                    {{ userDetail.registrationMethod || '账号注册' }}
                  </td>
                </tr>

                <!-- Row 19: 登录方式 & 验证方式 -->
                <tr>
                  <td class="label-cell">登录方式</td>
                  <td class="value-cell">
                    {{ userDetail.loginMethod || '账号登录' }}
                  </td>
                  <td class="label-cell">验证方式</td>
                  <td class="value-cell">
                    {{ userDetail.verificationMethod || '无验证' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </n-tab-pane>

        <!-- Tab 2: Contact Information -->
        <n-tab-pane name="contact" tab="联系方式（需安全码解密）">
          <ContactTab :user-id="Number(props.userId)" />
        </n-tab-pane>

        <!-- Tab 3: Personal Profile -->
        <n-tab-pane name="profile" tab="个人资料">
          <ProfileTab :user-id="Number(props.userId)" />
        </n-tab-pane>

        <!-- Tab 4: Withdrawal Accounts -->
        <n-tab-pane name="withdrawal-accounts" tab="提现账号">
          <WithdrawAccountTab :user-id="Number(props.userId)" />
        </n-tab-pane>

        <!-- Tab 5: Account Transactions -->
        <n-tab-pane name="transactions" tab="账户交易">
          <div class="transaction-records">
            <!-- Summary Cards -->
            <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
              <n-card size="small" class="summary-card">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-sm text-gray-500">总充值</div>
                    <div class="text-xl font-bold text-green-600">
                      R$ {{ (totalDeposit || 0).toFixed(2) }}
                      <div class="text-xs text-gray-400">
                        ({{ userStats?.totalDepositsCount || 0 }}笔)
                      </div>
                    </div>
                  </div>
                </div>
              </n-card>

              <n-card size="small" class="summary-card">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-sm text-gray-500">总提现</div>
                    <div class="text-xl font-bold text-orange-600">
                      R$ {{ (totalWithdraw || 0).toFixed(2) }}
                      <div class="text-xs text-gray-400">
                        ({{ userStats?.totalWithdrawalsCount || 0 }}笔)
                      </div>
                    </div>
                  </div>
                </div>
              </n-card>

              <n-card size="small" class="summary-card">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-sm text-gray-500">净流入</div>
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
                    <div class="text-sm text-gray-500">交易笔数</div>
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
                <div class="flex items-center gap-2">
                  <n-button
                    size="small"
                    :type="
                      transactionTypeFilter === 'today' ? 'primary' : 'default'
                    "
                    @click="setDateRangeFromFilter('today')"
                  >
                    日
                  </n-button>
                  <n-button
                    size="small"
                    :type="
                      transactionTypeFilter === 'week' ? 'primary' : 'default'
                    "
                    @click="setDateRangeFromFilter('week')"
                  >
                    周
                  </n-button>
                  <n-button
                    size="small"
                    :type="
                      transactionTypeFilter === 'month' ? 'primary' : 'default'
                    "
                    @click="setDateRangeFromFilter('month')"
                  >
                    月
                  </n-button>
                </div>
                <div class="flex items-center gap-2">
                  <n-date-picker
                    v-model:value="startDate"
                    type="datetime"
                    placeholder="开始时间"
                    style="width: 200px"
                    format="yyyy-MM-dd HH:mm:ss"
                  />
                  <span>-</span>
                  <n-date-picker
                    v-model:value="endDate"
                    type="datetime"
                    placeholder="结束时间"
                    style="width: 200px"
                    format="yyyy-MM-dd HH:mm:ss"
                  />
                </div>
                <n-select
                  v-model:value="transactionStatusFilter"
                  placeholder="变动钱包"
                  style="width: 120px"
                  :options="transactionStatusOptions"
                />
                <n-select
                  v-model:value="transactionCategoryFilter"
                  placeholder="账变大类"
                  clearable
                  style="width: 140px"
                  :options="categoryFilterOptions"
                />
                <n-input
                  v-model:value="transactionSearchId"
                  placeholder="请输入单号"
                  clearable
                  style="width: 180px"
                />
                <n-button type="primary" @click="loadTransactionRecords">
                  搜索
                </n-button>
                <n-button @click="handleResetTransactionFilter">
                  重置
                </n-button>
              </div>
            </n-card>

            <!-- Transaction Records Table -->
            <n-card>
              <template #header>
                <div class="flex items-center justify-between">
                  <span class="text-lg font-medium"
                    >钱包交易记录 (资金变动)</span
                  >
                  <div class="flex items-center gap-2 text-sm text-gray-500">
                    <span
                      >共
                      {{ transactionPagination.itemCount || 0 }} 条记录</span
                    >
                    <n-button
                      size="tiny"
                      @click="loadTransactionRecords"
                      class="ml-2"
                    >
                      刷新
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
        <n-tab-pane name="betting" tab="投注统计">
          <BetStatisticTab :user-id="Number(props.userId)" />
        </n-tab-pane>

        <!-- Tab 7: Member Messages -->
        <n-tab-pane name="messages" tab="会员消息">
          <div class="py-12 text-center text-gray-500">
            会员消息功能开发中...
          </div>
        </n-tab-pane>

        <!-- Tab 8: Member Logs -->
        <n-tab-pane name="logs" tab="会员日志">
          <UserAuditTrailTab :user-id="Number(props.userId)" />
        </n-tab-pane>

        <!-- Tab 9: Login Devices -->
        <n-tab-pane name="devices" tab="登录设备">
          <LoginDevicesTab :user-id="Number(props.userId)" />
        </n-tab-pane>

        <!-- Tab 10: Associated Accounts -->
        <n-tab-pane name="associations" tab="关联账号">
          <AssociationsTab
            :user-id="Number(props.userId)"
            :initial-association-type="associationTypeFilter"
          />
        </n-tab-pane>

        <!-- Tab 11: RTP Control -->
        <n-tab-pane name="rtp-control" tab="个人RTP调控">
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
      title="修改账号状态"
    >
      <n-form>
        <n-form-item label="账号状态">
          <n-select v-model:value="newStatus" :options="statusOptions" />
        </n-form-item>
        <n-form-item label="备注">
          <n-input
            v-model:value="statusReason"
            type="textarea"
            placeholder="请输入修改原因"
          />
        </n-form-item>
      </n-form>
      <template #action>
        <div class="flex gap-2">
          <n-button @click="showStatusModal = false">取消</n-button>
          <n-button type="primary" @click="handleUpdateStatus">确认</n-button>
        </div>
      </template>
    </n-modal>

    <!-- Enhanced Manual Transaction Modal -->
    <n-modal
      v-model:show="showManualTransactionModal"
      preset="card"
      title="手动交易操作"
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
        <n-form-item label="交易类型" path="type">
          <n-select
            v-model:value="manualTransactionForm.type"
            placeholder="选择交易类型"
            :options="manualTransactionTypeOptions"
            @update:value="handleTransactionTypeChange"
          />
        </n-form-item>

        <!-- Sub Type -->
        <n-form-item label="子类型" path="subType">
          <n-select
            v-model:value="manualTransactionForm.subType"
            placeholder="选择子类型"
            :options="currentSubTypeOptions"
          />
        </n-form-item>

        <!-- Amount -->
        <n-form-item label="金额" path="amount">
          <n-input-number
            v-model:value="manualTransactionForm.amount"
            :min="0.01"
            :max="999999.99"
            :precision="2"
            placeholder="输入金额"
            style="width: 100%"
          >
            <template #suffix>BRL</template>
          </n-input-number>
        </n-form-item>

        <!-- Multiplier (for special cases) -->
        <n-form-item v-if="showMultiplier" label="倍数" path="multiplier">
          <n-input-number
            v-model:value="manualTransactionForm.multiplier"
            :min="0.01"
            :max="100"
            :precision="2"
            placeholder="输入倍数"
            style="width: 100%"
          />
        </n-form-item>

        <!-- Currency -->
        <n-form-item label="币种" path="currency">
          <n-select
            v-model:value="manualTransactionForm.currency"
            placeholder="选择币种"
            :options="currencyOptions"
          />
        </n-form-item>

        <!-- Description -->
        <n-form-item label="描述" path="description">
          <n-input
            v-model:value="manualTransactionForm.description"
            type="textarea"
            placeholder="请输入详细描述（必填）"
            :rows="3"
          />
        </n-form-item>

        <!-- Frontend Notes -->
        <n-form-item label="前端备注">
          <n-input
            v-model:value="manualTransactionForm.frontendNotes"
            type="textarea"
            placeholder="用户可见的备注信息"
            :rows="2"
          />
        </n-form-item>

        <!-- Backend Notes -->
        <n-form-item label="后端备注">
          <n-input
            v-model:value="manualTransactionForm.backendNotes"
            type="textarea"
            placeholder="内部备注，用户不可见"
            :rows="2"
          />
        </n-form-item>

        <!-- Reason -->
        <n-form-item label="原因">
          <n-input
            v-model:value="manualTransactionForm.reason"
            placeholder="操作原因"
          />
        </n-form-item>

        <!-- Summary Card -->
        <n-card
          v-if="manualTransactionForm.amount > 0"
          title="操作预览"
          size="small"
          class="mt-4"
        >
          <n-descriptions bordered size="small" :column="2">
            <n-descriptions-item label="用户">{{
              userDetail?.account
            }}</n-descriptions-item>
            <n-descriptions-item label="操作类型">
              <n-tag :type="getTransactionTagType(manualTransactionForm.type)">
                {{ getTransactionTypeLabel(manualTransactionForm.type) }}
              </n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="交易金额">
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
            <n-descriptions-item label="当前余额"
              >BRL
              {{
                userDetail?.balance.toFixed(2) || '0.00'
              }}</n-descriptions-item
            >
            <n-descriptions-item label="操作后余额">
              <span
                :class="afterBalance >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                BRL {{ afterBalance.toFixed(2) }}
              </span>
            </n-descriptions-item>
            <n-descriptions-item label="余额变动">
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
          <n-button @click="showManualTransactionModal = false">取消</n-button>
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
      title="修改会员层级"
      style="width: 500px"
    >
      <n-form label-placement="left" label-width="120">
        <n-form-item label="当前层级">
          <n-tag type="info" size="medium">
            {{
              userDetail?.memberTier?.tierName ||
              userDetail?.memberLevel ||
              '默认层级'
            }}
            <span v-if="userDetail?.memberTier?.tierType" class="ml-2 text-xs">
              ({{
                userDetail.memberTier.tierType === 'auto_upgrade'
                  ? '自动升级'
                  : '固定层级'
              }})
            </span>
          </n-tag>
        </n-form-item>

        <n-form-item label="选择层级" required>
          <n-select
            v-model:value="selectedTierId"
            :options="memberTierOptions"
            placeholder="请选择会员层级"
            :loading="tierOptionsLoading"
            clearable
            :consistent-menu-width="false"
            filterable
            label-field="label"
            value-field="value"
          />
        </n-form-item>

        <n-form-item label="锁定层级">
          <n-switch v-model:value="lockTierAfterChange" />
          <span class="ml-2 text-sm text-gray-500">开启后将防止自动升级</span>
        </n-form-item>

        <n-form-item label="修改原因">
          <n-input
            v-model:value="tierChangeReason"
            type="textarea"
            placeholder="请输入修改原因（可选）"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </n-form-item>
      </n-form>

      <template #action>
        <div class="flex justify-end gap-2">
          <n-button @click="showLevelModal = false">取消</n-button>
          <n-button
            type="primary"
            :loading="tierChangeLoading"
            @click="handleUpdateMemberTier"
            :disabled="!selectedTierId"
          >
            确认修改
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- Password Change Modal -->
    <n-modal
      v-model:show="showPasswordModal"
      preset="card"
      title="修改登录密码"
      style="width: 500px"
    >
      <n-form
        ref="passwordFormRef"
        :model="passwordForm"
        label-placement="left"
        label-width="120"
      >
        <n-form-item label="新密码" required>
          <n-input
            v-model:value="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码（至少6个字符）"
            show-password-on="mousedown"
          />
        </n-form-item>

        <n-form-item label="确认密码" required>
          <n-input
            v-model:value="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password-on="mousedown"
          />
        </n-form-item>
      </n-form>

      <template #action>
        <div class="flex justify-end gap-2">
          <n-button @click="showPasswordModal = false">取消</n-button>
          <n-button
            type="primary"
            :loading="passwordLoading"
            @click="handleUpdatePassword"
          >
            确认修改
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- Withdrawal PIN Reset Modal -->
    <n-modal
      v-model:show="showWithdrawalPinModal"
      preset="card"
      title="重置提现密码"
      style="width: 400px"
    >
      <n-form label-placement="left" label-width="100">
        <n-form-item label="新提现密码">
          <n-input
            :value="withdrawalPinForm.newPin"
            @update:value="handlePinInput"
            placeholder="请输入6位数字密码"
            maxlength="6"
            :allow-input="(value: string) => !value || /^\d*$/.test(value)"
          />
        </n-form-item>
        <n-alert type="info" :bordered="false" style="margin-top: 8px">
          <template #icon><span></span></template>
          留空则清除密码，用户需要重新设置。
        </n-alert>
      </n-form>

      <template #action>
        <div class="flex justify-end gap-2">
          <n-button @click="showWithdrawalPinModal = false">取消</n-button>
          <n-button type="primary" @click="confirmResetWithdrawalPin">
            确认重置
          </n-button>
        </div>
      </template>
    </n-modal>
  </n-modal>
</template>

<script setup lang="ts">
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
  getUserSecurityStatsApi,
  type UserDetailInfo,
  type WalletTransaction,
  type WalletTransactionSummary,
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
  prefix: (info: any) => `共 ${info.itemCount} 条`,
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
const startDate = ref<number | null>(null);
const endDate = ref<number | null>(null);

// Category filter options - matching screenshot "账变大类"
const categoryFilterOptions = [
  { label: '全部', value: '' },
  { label: '充值', value: 'deposit' },
  { label: '会员提现', value: 'withdrawal' },
  { label: '资金切换', value: 'game_transfer' },
  { label: '投注', value: 'bet' },
  { label: '派彩', value: 'win' },
  { label: '奖励', value: 'bonus' },
  { label: '返水', value: 'rebate' },
  { label: '佣金', value: 'commission' },
  { label: '人工加款', value: 'manual_credit' },
  { label: '人工扣款', value: 'manual_debit' },
];

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
          label: `${tier.tierName} (${tier.tierType === 'auto_upgrade' ? '自动升级' : '固定层级'})`,
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
      message.error('加载会员层级失败');
      console.error('Failed to load member tiers:', error);
    } finally {
      tierOptionsLoading.value = false;
    }
  }
});

// Handle update member tier
const handleUpdateMemberTier = async () => {
  if (!selectedTierId.value) {
    message.error('请选择会员层级');
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

    message.success('会员层级修改成功');
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
    message.error('会员层级修改失败: ' + (error?.message || '未知错误'));
    console.error('❌ Update member tier error:', error);
  } finally {
    tierChangeLoading.value = false;
  }
};

// Options
const statusOptions = [
  { label: '正常', value: 'NORMAL' },
  { label: '手动冻结', value: 'MANUAL_FREEZE' },
  { label: '禁止领取优惠', value: 'PROHIBIT_BONUS' },
  { label: '禁止提现', value: 'PROHIBIT_WITHDRAWAL' },
  { label: '禁止游戏入场', value: 'PROHIBIT_GAME_ENTRY' },
  { label: '黑名单', value: 'BLACKLIST' },
  { label: '边缘用户', value: 'MARGINAL' },
];

// Wallet transaction category options - matching screenshot "变动钱包" filter
const transactionStatusOptions = [
  { label: '全部', value: '' },
  { label: '余额', value: 'balance' },
  { label: '奖励钱包', value: 'reward' },
  { label: '储蓄钱包', value: 'savings' },
];

// Manual transaction options
const manualTransactionTypeOptions = [
  { label: '加款 (Credit)', value: 'credit' },
  { label: '扣款 (Debit)', value: 'debit' },
  { label: '调整 (Adjustment)', value: 'adjustment' },
  { label: '修正 (Correction)', value: 'correction' },
  { label: '奖金调整 (Bonus Adjustment)', value: 'bonus_adjustment' },
  { label: '罚款 (Penalty)', value: 'penalty' },
];

const subTypeOptionsMap = {
  credit: [
    { label: '客服补偿', value: 'customer_compensation' },
    { label: '系统错误补偿', value: 'system_error_compensation' },
    { label: '促销奖励', value: 'promotion_reward' },
    { label: '推荐奖励', value: 'referral_reward' },
    { label: '其他加款', value: 'other_credit' },
  ],
  debit: [
    { label: '违规扣款', value: 'violation_penalty' },
    { label: '系统错误扣款', value: 'system_error_debit' },
    { label: '争议处理', value: 'dispute_resolution' },
    { label: '手续费', value: 'fee_deduction' },
    { label: '其他扣款', value: 'other_debit' },
  ],
  adjustment: [
    { label: '余额调整', value: 'balance_adjustment' },
    { label: '汇率调整', value: 'exchange_rate_adjustment' },
    { label: '账户迁移', value: 'account_migration' },
  ],
  correction: [
    { label: '数据修正', value: 'data_correction' },
    { label: '重复交易修正', value: 'duplicate_correction' },
    { label: '错误交易修正', value: 'error_correction' },
  ],
  bonus_adjustment: [
    { label: '奖金发放', value: 'bonus_grant' },
    { label: '奖金回收', value: 'bonus_revoke' },
    { label: '奖金修正', value: 'bonus_correction' },
  ],
  penalty: [
    { label: '违规罚款', value: 'violation_fine' },
    { label: '逾期罚款', value: 'overdue_penalty' },
    { label: '滥用罚款', value: 'abuse_penalty' },
  ],
};

const currencyOptions = [
  { label: 'BRL (巴西雷亚尔)', value: 'BRL' },
  { label: 'USD (美元)', value: 'USD' },
  { label: 'EUR (欧元)', value: 'EUR' },
];

// Form validation rules
const manualTransactionRules = {
  type: {
    required: true,
    message: '请选择交易类型',
    trigger: 'blur',
  },
  subType: {
    required: true,
    message: '请选择子类型',
    trigger: 'blur',
  },
  amount: {
    required: true,
    validator: (_rule: any, value: number) => {
      if (!value || value < 0.01) {
        return new Error('请输入有效金额');
      }
      return true;
    },
    trigger: 'blur',
  },
  description: {
    required: true,
    message: '请输入描述',
    trigger: 'blur',
  },
};

// Transaction table columns - matching screenshot exactly
const transactionColumns: DataTableColumns<WalletTransaction> = [
  {
    title: '单号',
    key: 'id',
    width: 150,
    fixed: 'left',
    render: (row) => {
      return h('span', { class: 'text-xs font-mono' }, String(row.id));
    },
  },
  {
    title: '交易时间',
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
    title: '变动钱包',
    key: 'walletType',
    width: 100,
    align: 'center',
    render: () => {
      // All transactions are balance wallet
      return h('span', { class: 'text-sm' }, '余额');
    },
  },
  {
    title: '账变大类',
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
    title: '小类明细',
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
    title: '变动前余额',
    key: 'balanceBefore',
    width: 120,
    align: 'right',
    render: (row) => {
      const before = Number(row.balanceBefore) || 0;
      return h('span', { class: 'text-sm font-medium' }, before.toFixed(2));
    },
  },
  {
    title: '变动金额',
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
    title: '变动后余额',
    key: 'balanceAfter',
    width: 120,
    align: 'right',
    render: (row) => {
      const after = Number(row.balanceAfter) || 0;
      return h('span', { class: 'text-sm font-medium' }, after.toFixed(2));
    },
  },
  {
    title: '前台备注',
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
    title: '最后操作人',
    key: 'operator',
    width: 120,
    render: (row) => {
      const operator = row.metadata?.operator || row.metadata?.adminName || '';
      return h('span', { class: 'text-sm' }, operator || '-');
    },
  },
  {
    title: '后台备注',
    key: 'backendNotes',
    width: 150,
    ellipsis: true,
    render: (row) => {
      const notes =
        row.metadata?.backendNotes || row.metadata?.internalNotes || '';
      return h('span', { class: 'text-sm text-gray-600' }, notes || '-');
    },
  },
];

// Computed
const visibleModel = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});

// Manual transaction computed properties
const currentSubTypeOptions = computed(() => {
  return (
    subTypeOptionsMap[
      manualTransactionForm.type as keyof typeof subTypeOptionsMap
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
        if (startDate.value === null && endDate.value === null) {
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
      if (startDate.value === null && endDate.value === null) {
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
    getUserSecurityStatsApi(Number(props.userId))
      .then((securityStats) => {
        console.log('📊 Security stats received:', securityStats);

        // Update user detail with real security stats
        if (userDetail.value) {
          userDetail.value.passwordMatchCount =
            securityStats.passwordMatchCount;
          userDetail.value.sameWithdrawalPinCount =
            securityStats.sameWithdrawalPinCount;
          userDetail.value.withdrawalAccountCount =
            securityStats.withdrawAccountCount;
          userDetail.value.sameAccountCount = securityStats.sameAccountCount;
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
    message.error('获取用户详情失败');
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
  message.info('编辑功能开发中...');
};

const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return '无效日期';

  try {
    // Use timezone conversion utility
    return formatDateTimeInTimezone(dateString);
  } catch (error) {
    console.warn('Date formatting error:', error, 'Input:', dateString);
    return '无效日期';
  }
};

const getStatusType = (
  status: string,
): 'success' | 'error' | 'warning' | 'default' => {
  const statusMap: Record<string, 'success' | 'error' | 'warning'> = {
    NORMAL: 'success',
    ACTIVE: 'success',
    MANUAL_FREEZE: 'error',
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
    NORMAL: '正常',
    ACTIVE: '正常',
    MANUAL_FREEZE: '手动冻结',
    PROHIBIT_BONUS: '禁止领取优惠',
    PROHIBIT_WITHDRAWAL: '禁止提现',
    PROHIBIT_GAME_ENTRY: '禁止游戏入场',
    BLACKLIST: '黑名单',
    MARGINAL: '边缘用户',
    BANNED: '封禁',
    SUSPENDED: '暂停',
  };
  return statusMap[status] || status;
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    message.success('已复制到剪贴板');
  } catch (error) {
    message.error('复制失败');
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
    message.success('状态修改成功');
    showStatusModal.value = false;

    // Force reload user detail with cache bust
    await loadUserDetail(true);

    // Notify parent to refresh list
    emit('refresh');
  } catch (error) {
    message.error('状态修改失败');
  }
};

// Manual transaction helper methods
const isDebitType = (type: string) => {
  return ['debit', 'penalty'].includes(type);
};

const getTransactionTypeLabel = (type: string) => {
  const labelMap = {
    credit: '加款',
    debit: '扣款',
    adjustment: '调整',
    correction: '修正',
    bonus_adjustment: '奖金调整',
    penalty: '罚款',
  };
  return labelMap[type as keyof typeof labelMap] || type;
};

const getTransactionTagType = (type: string) => {
  if (['credit', 'bonus_adjustment'].includes(type)) return 'success';
  if (['debit', 'penalty'].includes(type)) return 'error';
  return 'warning';
};

const getSubmitButtonText = () => {
  if (!manualTransactionForm.type) return '提交';
  return `确认${getTransactionTypeLabel(manualTransactionForm.type)}`;
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
    message.success('余额刷新成功');
  } catch (error) {
    console.error('Failed to refresh balance:', error);
    message.error('余额刷新失败');
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
      `${getTransactionTypeLabel(manualTransactionForm.type)}操作成功`,
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
      `${getTransactionTypeLabel(manualTransactionForm.type)}操作失败`,
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
      startDate: startDate.value
        ? new Date(startDate.value).toISOString().split('T')[0]
        : undefined,
      endDate: endDate.value
        ? new Date(endDate.value).toISOString().split('T')[0]
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
    message.error('获取钱包交易记录失败');
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
      startDate.value = startOfToday.getTime();
      endDate.value = endOfToday.getTime();
      break;

    case 'week':
      // Last 7 days: 7 days ago to today
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      startDate.value = weekAgo.getTime();
      endDate.value = endOfToday.getTime();
      break;

    case 'month':
      // Last 30 days: 30 days ago to today
      const monthAgo = new Date(now);
      monthAgo.setDate(monthAgo.getDate() - 30);
      monthAgo.setHours(0, 0, 0, 0);
      startDate.value = monthAgo.getTime();
      endDate.value = endOfToday.getTime();
      break;
  }

  // Reset pagination and load records
  transactionPagination.page = 1;
  loadTransactionRecords();
};

const handleResetTransactionFilter = () => {
  transactionTypeFilter.value = 'today'; // Reset to today (default)
  transactionStatusFilter.value = '';
  transactionCategoryFilter.value = '';
  transactionSearchId.value = '';
  startDate.value = null;
  endDate.value = null;
  transactionPagination.page = 1;
  transactionPagination.pageCount = 1; // Reset page count
  loadTransactionRecords();
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
    message.error('提现密码必须是6位数字');
    return;
  }

  try {
    // Call API to reset withdrawal PIN
    await resetWithdrawalPinApi(Number(props.userId), newPin || undefined);

    if (newPin) {
      message.success(`提现密码已重置为: ${newPin}`);
    } else {
      message.success('提现密码已清除，用户需要重新设置');
    }

    showWithdrawalPinModal.value = false;

    // Force reload user detail with cache bust
    await loadUserDetail(true);

    // Notify parent to refresh list
    emit('refresh');
  } catch (error) {
    message.error('重置提现密码失败');
    console.error('Reset withdrawal PIN error:', error);
  }
};

// Handle update password
const handleUpdatePassword = async () => {
  if (!passwordFormRef.value) return;

  // Validate form
  if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
    message.error('请填写所有必填字段');
    return;
  }

  if (passwordForm.newPassword.length < 6) {
    message.error('密码长度至少6个字符');
    return;
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    message.error('两次输入的密码不一致');
    return;
  }

  try {
    passwordLoading.value = true;

    // Call API to update password
    await updateUserPasswordApi(Number(props.userId), passwordForm.newPassword);

    message.success('密码修改成功');
    showPasswordModal.value = false;
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';

    // Force reload user detail with cache bust
    await loadUserDetail(true);

    // Notify parent to refresh list
    emit('refresh');
  } catch (error) {
    message.error('密码修改失败');
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

// ✅ NEW: Handle filter by same withdrawal account
const handleFilterBySameWithdrawalAccount = () => {
  if (!userDetail.value) return;

  emit('update:visible', false);
  router.push({
    path: '/user-management/all-members',
    query: {
      searchField: 'same_withdrawal_account',
      searchValue: String(userDetail.value.id), // Use current user ID as reference
      filterType: 'same_withdrawal_account',
      matchCount: userDetail.value.sameAccountCount || 0,
    },
  });
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
  if (!userDetail.value || !upperAgentId || upperAgentId === '无') return;

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
