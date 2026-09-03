<template>
  <n-modal
    :show="show"
    preset="card"
    :title="$t('common.advancedSearch')"
    class="member-adv-modal"
    :style="{ width: 'min(1100px, 99vw)' }"
    :bordered="false"
    :closable="true"
    :segmented="{ content: 'soft', footer: 'soft' }"
    @update:show="onUpdateShow"
  >
    <div class="adv-scroll">
      <n-form
        :model="form"
        :show-feedback="false"
        label-placement="left"
        :label-width="160"
        size="small"
        class="adv-form"
      >
      <!-- 会员基本信息 -->
      <div class="adv-section-title">{{ $t('user.advancedSearch.memberBasicInfo') }}</div>

      <n-radio-group v-model:value="form.bulkKey" class="adv-bulk-radio-group">
        <div class="adv-bulk-radios">
          <n-radio value="member.account">{{ $t('common.memberAccount') }}</n-radio>
          <n-radio value="member.user_id_string">{{ $t('user.advancedSearch.memberId') }}</n-radio>
          <n-radio value="member.phone">{{ $t('user.advancedSearch.phone') }}</n-radio>
          <n-radio value="inviter.account">{{ $t('user.advancedSearch.inviterAccount') }}</n-radio>
          <n-radio value="inviter.user_id_string">{{ $t('user.advancedSearch.inviterId') }}</n-radio>
          <n-radio value="parent_agent_id">{{ $t('user.advancedSearch.parentAgentId') }}</n-radio>
          <n-radio value="inviter.account_parent">{{ $t('user.advancedSearch.parentAgentAccount') }}</n-radio>
          <n-radio value="agent.top_id_path">{{ $t('user.advancedSearch.topAgentIdPath') }}</n-radio>
          <n-radio value="top_agent_account">{{ $t('user.advancedSearch.topAgentAccount') }}</n-radio>
        </div>
      </n-radio-group>

      <n-input
        v-model:value="form.bulkValues"
        type="textarea"
        class="adv-bulk-textarea"
        :placeholder="$t('user.advancedSearch.multiAccountHint')"
        :rows="5"
        size="small"
      />

      <n-grid
        :cols="2"
        :x-gap="16"
        :y-gap="SECTION_FORM_ROW_GAP"
        class="adv-grid adv-grid--pane-tidy"
      >
        <n-gi>
          <n-form-item :label="$t('user.advancedSearch.realName')">
            <n-input
              v-model:value="form.name"
              clearable
              size="small"
              :placeholder="$t('common.pleaseEnter')"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item :label="$t('user.advancedSearch.memberTags')">
            <n-select
              v-model:value="form.memberTag"
              clearable
              size="small"
              :placeholder="$t('common.pleaseSelect')"
              :options="memberTagOptions"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item :label="$t('user.advancedSearch.memberLevel')">
            <n-select
              :value="form.memberTierIds"
              multiple
              clearable
              filterable
              :show-checkmark="false"
              :render-label="renderMultiLabel"
              :render-tag="renderMultiFieldTag"
              size="small"
              :placeholder="$t('common.pleaseSelect')"
              :max-tag-count="1"
              :options="memberTierOptionsWithAll"
              @update:value="(v) => {
                const p = form.memberTierIds;
                form.memberTierIds = normalizeMultiSelectValue(
                  v,
                  optionRealValues(memberTierOptionsWithAll),
                  p,
                );
              }"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item :label="$t('user.advancedSearch.vipLevel')">
            <n-select
              :value="form.vipLevelIds"
              multiple
              clearable
              filterable
              :show-checkmark="false"
              :render-label="renderMultiLabel"
              :render-tag="renderMultiFieldTag"
              size="small"
              :placeholder="$t('common.pleaseSelect')"
              :max-tag-count="1"
              :options="vipLevelOptionsWithAll"
              @update:value="(v) => {
                const p = form.vipLevelIds;
                form.vipLevelIds = normalizeMultiSelectValue(
                  v,
                  optionRealValues(vipLevelOptionsWithAll),
                  p,
                );
              }"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item :label="$t('user.advancedSearch.verificationMethod')">
            <n-select
              :value="form.verifyMethods"
              multiple
              clearable
              :show-checkmark="false"
              :render-label="renderMultiLabel"
              :render-tag="renderMultiFieldTag"
              size="small"
              :placeholder="$t('user.advancedSearch.selectVerification')"
              :max-tag-count="1"
              :options="verifyMethodOptionsWithAll"
              @update:value="(v) => {
                const p = form.verifyMethods;
                form.verifyMethods = normalizeMultiSelectValue(
                  v,
                  optionRealValues(verifyMethodOptionsWithAll),
                  p,
                );
              }"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item :label="$t('user.allMembers.accountStatus')">
            <n-select
              :value="form.accountStatuses"
              multiple
              clearable
              :show-checkmark="false"
              :render-label="renderMultiLabel"
              :render-tag="renderMultiFieldTag"
              size="small"
              :placeholder="$t('common.pleaseSelect')"
              :max-tag-count="1"
              :options="accountStatusOptionsWithAll"
              @update:value="(v) => {
                const p = form.accountStatuses;
                form.accountStatuses = normalizeMultiSelectValue(
                  v,
                  optionRealValues(accountStatusOptionsWithAll),
                  p,
                );
              }"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item :label="$t('user.advancedSearch.registerSource')">
            <n-select
              :value="form.regSources"
              multiple
              clearable
              filterable
              :show-checkmark="false"
              :render-label="renderMultiLabel"
              :render-tag="renderMultiFieldTag"
              size="small"
              :placeholder="$t('common.pleaseSelect')"
              :max-tag-count="1"
              :options="regSourceOptionsWithAll"
              @update:value="(v) => {
                const p = form.regSources;
                form.regSources = normalizeMultiSelectValue(
                  v,
                  optionRealValues(regSourceOptionsWithAll),
                  p,
                );
              }"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item :label="$t('user.advancedSearch.registerMethod')">
            <n-select
              :value="form.regMethods"
              multiple
              clearable
              :show-checkmark="false"
              :render-label="renderMultiLabel"
              :render-tag="renderMultiFieldTag"
              size="small"
              :placeholder="$t('common.pleaseSelect')"
              :max-tag-count="1"
              :options="regMethodOptionsWithAll"
              @update:value="(v) => {
                const p = form.regMethods;
                form.regMethods = normalizeMultiSelectValue(
                  v,
                  optionRealValues(regMethodOptionsWithAll),
                  p,
                );
              }"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item :label="$t('user.advancedSearch.memberRemark')">
            <n-input
              v-model:value="form.memberRemark"
              clearable
              size="small"
              :placeholder="$t('common.pleaseEnter')"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item :label="$t('user.advancedSearch.loginMethod')">
            <n-select
              :value="form.loginMethods"
              multiple
              clearable
              :show-checkmark="false"
              :render-label="renderMultiLabel"
              :render-tag="renderMultiFieldTag"
              size="small"
              :placeholder="$t('common.pleaseSelect')"
              :max-tag-count="1"
              :options="loginMethodOptionsWithAll"
              @update:value="(v) => {
                const p = form.loginMethods;
                form.loginMethods = normalizeMultiSelectValue(
                  v,
                  optionRealValues(loginMethodOptionsWithAll),
                  p,
                );
              }"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item :label="$t('user.advancedSearch.accountType')">
            <n-select
              :value="form.accountTypeUis"
              multiple
              clearable
              :show-checkmark="false"
              :render-label="renderMultiLabel"
              :render-tag="renderMultiFieldTag"
              size="small"
              :placeholder="$t('common.pleaseSelect')"
              :max-tag-count="1"
              :options="accountTypeUiOptionsWithAll"
              @update:value="(v) => {
                const p = form.accountTypeUis;
                form.accountTypeUis = normalizeMultiSelectValue(
                  v,
                  optionRealValues(accountTypeUiOptionsWithAll),
                  p,
                );
              }"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item :label="$t('user.advancedSearch.onlineStatus')">
            <n-select
              :value="form.onlineStatusUis"
              multiple
              clearable
              :show-checkmark="false"
              :render-label="renderMultiLabel"
              :render-tag="renderMultiFieldTag"
              size="small"
              :placeholder="$t('common.pleaseSelect')"
              :max-tag-count="1"
              :options="onlineStatusUiOptionsWithAll"
              @update:value="(v) => {
                const p = form.onlineStatusUis;
                form.onlineStatusUis = normalizeMultiSelectValue(
                  v,
                  optionRealValues(onlineStatusUiOptionsWithAll),
                  p,
                );
              }"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item :label="$t('user.advancedSearch.memberBirthday')">
            <n-date-picker
              v-model:value="form.birthday"
              type="date"
              clearable
              size="small"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item :label="$t('user.advancedSearch.linkedAccount')">
            <n-input
              v-model:value="form.associatedAccount"
              clearable
              size="small"
              :placeholder="$t('common.pleaseEnter')"
            />
          </n-form-item>
        </n-gi>
      </n-grid>

      <div class="adv-section-title adv-section-title--spaced">{{ $t('user.advancedSearch.otherInfo') }}</div>

      <n-tabs
        v-model:value="subTab"
        type="line"
        size="small"
        class="adv-subtabs"
      >
        <n-tab-pane name="reg" :tab="$t('user.advancedSearch.regLoginInfo')">
          <n-grid
            :cols="2"
            :x-gap="16"
            :y-gap="SECTION_FORM_ROW_GAP"
            class="adv-grid adv-grid--pane adv-grid--pane-tidy adv-grid--reg-login"
          >
            <n-gi>
              <n-form-item :label="$t('user.advancedSearch.registerTime')">
                <n-date-picker
                  v-model:value="form.regTimeRange"
                  type="datetimerange"
                  :time-zone="timezone"
                  clearable
                  size="small"
                  format="yyyy-MM-dd HH:mm:ss"
                  :default-time="['00:00:00', '23:59:59']"
                  :shortcuts="datetimerangeShortcuts"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('user.advancedSearch.registerIp')">
                <n-input v-model:value="form.registrationIp" clearable size="small" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('user.advancedSearch.registerDomain')">
                <n-input
                  v-model:value="form.registrationDomain"
                  clearable
                  size="small"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('user.advancedSearch.registerDeviceId')">
                <n-input v-model:value="form.deviceId" clearable size="small" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('user.advancedSearch.registerDeviceType')">
                <div class="adv-twin-select adv-twin-select--reg">
                  <n-select
                    :value="form.regDeviceOs"
                    multiple
                    clearable
                    :show-checkmark="false"
                    :render-label="renderMultiLabel"
                    :render-tag="renderMultiFieldTag"
                    size="small"
                    :placeholder="$t('user.advancedSearch.allOs')"
                    :max-tag-count="1"
                    :options="deviceOsOptionsWithAll"
                    @update:value="(v) => {
                      const p = form.regDeviceOs;
                      form.regDeviceOs = normalizeMultiSelectValue(
                        v,
                        optionRealValues(deviceOsOptionsWithAll),
                        p,
                      );
                    }"
                  />
                  <n-select
                    :value="form.regDeviceMethod"
                    multiple
                    clearable
                    :show-checkmark="false"
                    :render-label="renderMultiLabel"
                    :render-tag="renderMultiFieldTag"
                    size="small"
                    :placeholder="$t('user.advancedSearch.allRegisterMethods')"
                    :max-tag-count="1"
                    :options="deviceMethodOptionsWithAll"
                    @update:value="(v) => {
                      const p = form.regDeviceMethod;
                      form.regDeviceMethod = normalizeMultiSelectValue(
                        v,
                        optionRealValues(deviceMethodOptionsWithAll),
                        p,
                      );
                    }"
                  />
                </div>
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('user.advancedSearch.registerBrowserFingerprint')">
                <n-input
                  v-model:value="form.browserFingerprint"
                  clearable
                  size="small"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('user.advancedSearch.lastLoginTime')">
                <n-date-picker
                  v-model:value="form.lastLoginRange"
                  type="datetimerange"
                  :time-zone="timezone"
                  clearable
                  size="small"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('user.advancedSearch.lastLoginIp')">
                <n-input v-model:value="form.lastLoginIp" clearable size="small" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('user.advancedSearch.lastLoginDomain')">
                <n-input
                  v-model:value="form.lastLoginDomain"
                  clearable
                  size="small"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('user.advancedSearch.lastLoginDeviceId')">
                <n-input
                  v-model:value="form.lastLoginDeviceId"
                  clearable
                  size="small"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('user.advancedSearch.lastLoginDeviceType')">
                <div class="adv-twin-select adv-twin-select--reg">
                  <n-select
                    :value="form.lastLoginDeviceOs"
                    multiple
                    clearable
                    :show-checkmark="false"
                    :render-label="renderMultiLabel"
                    :render-tag="renderMultiFieldTag"
                    size="small"
                    :placeholder="$t('user.advancedSearch.allOs')"
                    :max-tag-count="1"
                    :options="deviceOsOptionsWithAll"
                    @update:value="(v) => {
                      const p = form.lastLoginDeviceOs;
                      form.lastLoginDeviceOs = normalizeMultiSelectValue(
                        v,
                        optionRealValues(deviceOsOptionsWithAll),
                        p,
                      );
                    }"
                  />
                  <n-select
                    :value="form.lastLoginDeviceMethod"
                    multiple
                    clearable
                    :show-checkmark="false"
                    :render-label="renderMultiLabel"
                    :render-tag="renderMultiFieldTag"
                    size="small"
                    :placeholder="$t('user.advancedSearch.allRegisterMethods')"
                    :max-tag-count="1"
                    :options="deviceMethodOptionsWithAll"
                    @update:value="(v) => {
                      const p = form.lastLoginDeviceMethod;
                      form.lastLoginDeviceMethod = normalizeMultiSelectValue(
                        v,
                        optionRealValues(deviceMethodOptionsWithAll),
                        p,
                      );
                    }"
                  />
                </div>
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('user.advancedSearch.lastLoginBrowserFingerprint')">
                <n-input
                  v-model:value="form.loginLogFingerprint"
                  clearable
                  size="small"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item
                :label="$t('user.advancedSearch.daysNotLoggedIn')"
                :show-feedback="false"
              >
                <div class="adv-range-inline adv-range-inline--reg">
                  <n-input
                    v-model:value="form.daysIdleMinStr"
                    size="small"
                    :placeholder="$t('user.advancedSearch.minValue')"
                  />
                  <span class="adv-range-sep">~</span>
                  <n-input
                    v-model:value="form.daysIdleMaxStr"
                    size="small"
                    :placeholder="$t('user.advancedSearch.maxValue')"
                  />
                </div>
              </n-form-item>
            </n-gi>
            <n-gi />
          </n-grid>
        </n-tab-pane>

        <n-tab-pane name="finance" :tab="$t('user.advancedSearch.financeInfo')">
          <n-grid
            :cols="2"
            :x-gap="16"
            :y-gap="SECTION_FORM_ROW_GAP"
            class="adv-grid adv-grid--pane adv-grid--pane-tidy adv-grid--reg-login"
          >
            <n-gi>
              <n-form-item :label="$t('user.advancedSearch.firstDepositTime')">
                <n-date-picker
                  v-model:value="form.firstDepositRange"
                  type="datetimerange"
                  :time-zone="timezone"
                  clearable
                  size="small"
                  format="yyyy-MM-dd HH:mm:ss"
                  :default-time="['00:00:00', '23:59:59']"
                  :shortcuts="datetimerangeShortcuts"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('user.advancedSearch.firstDepositAmount')">
                <div class="adv-range-inline adv-range-inline--reg">
                  <n-input
                    v-model:value="form.firstDepositAmtMin"
                    size="small"
                    :placeholder="$t('user.advancedSearch.minValue')"
                  />
                  <span class="adv-range-sep">~</span>
                  <n-input
                    v-model:value="form.firstDepositAmtMax"
                    size="small"
                    :placeholder="$t('user.advancedSearch.maxValue')"
                  />
                </div>
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('user.advancedSearch.lastDepositTime')">
                <n-date-picker
                  v-model:value="form.lastDepositRange"
                  type="datetimerange"
                  :time-zone="timezone"
                  clearable
                  size="small"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('user.advancedSearch.isFirstDeposit')">
                <n-select
                  :value="form.hasFirstDeposit"
                  multiple
                  clearable
                  :show-checkmark="false"
                  :render-label="renderMultiLabel"
                  :render-tag="renderMultiFieldTag"
                  size="small"
                  :placeholder="$t('common.pleaseSelect')"
                  :max-tag-count="1"
                  :options="hasFirstDepositOptionsWithAll"
                  @update:value="(v) => {
                    const p = form.hasFirstDeposit;
                    form.hasFirstDeposit = normalizeMultiSelectValue(
                      v,
                      optionRealValues(hasFirstDepositOptionsWithAll),
                      p,
                    );
                  }"
                />
              </n-form-item>
            </n-gi>
            <n-gi span="2" class="adv-gi-range">
              <n-form-item :label="$t('user.advancedSearch.lastDepositTime')">
                <n-date-picker
                  v-model:value="form.lastDepositRange"
                  type="datetimerange"
                  :time-zone="timezone"
                  clearable
                  size="small"
                  format="yyyy-MM-dd HH:mm:ss"
                  :default-time="['00:00:00', '23:59:59']"
                  :shortcuts="datetimerangeShortcuts"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('user.advancedSearch.lastWithdrawTime')">
                <n-date-picker
                  v-model:value="form.lastWithdrawRange"
                  type="datetimerange"
                  :time-zone="timezone"
                  clearable
                  size="small"
                  format="yyyy-MM-dd HH:mm:ss"
                  :default-time="['00:00:00', '23:59:59']"
                  :shortcuts="datetimerangeShortcuts"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('user.advancedSearch.totalDepositAmount')">
                <div class="adv-range-inline adv-range-inline--reg">
                  <n-input v-model:value="form.totalDepMin" size="small" :placeholder="$t('user.advancedSearch.minValue')" />
                  <span class="adv-range-sep">~</span>
                  <n-input v-model:value="form.totalDepMax" size="small" :placeholder="$t('user.advancedSearch.maxValue')" />
                </div>
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('user.advancedSearch.totalWithdrawAmount')">
                <div class="adv-range-inline adv-range-inline--reg">
                  <n-input v-model:value="form.totalWdMin" size="small" :placeholder="$t('user.advancedSearch.minValue')" />
                  <span class="adv-range-sep">~</span>
                  <n-input v-model:value="form.totalWdMax" size="small" :placeholder="$t('user.advancedSearch.maxValue')" />
                </div>
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item
                :label="$t('user.advancedSearch.daysNoRecharge')"
                :show-feedback="false"
              >
                <div class="adv-range-inline adv-range-inline--reg">
                  <n-input v-model:value="form.noRechargeDaysMinStr" size="small" :placeholder="$t('user.advancedSearch.minValue')" />
                  <span class="adv-range-sep">~</span>
                  <n-input v-model:value="form.noRechargeDaysMaxStr" size="small" :placeholder="$t('user.advancedSearch.maxValue')" />
                </div>
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('user.advancedSearch.accountBalance')">
                <div class="adv-range-inline adv-range-inline--reg">
                  <n-input v-model:value="form.balanceMin" size="small" :placeholder="$t('user.advancedSearch.minValue')" />
                  <span class="adv-range-sep">~</span>
                  <n-input v-model:value="form.balanceMax" size="small" :placeholder="$t('user.advancedSearch.maxValue')" />
                </div>
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('user.advancedSearch.depositCount')">
                <div class="adv-count-row">
                  <n-select
                    v-model:value="form.depCountOp"
                    size="small"
                    :options="cmpOpOptions"
                  />
                  <n-input v-model:value="form.depCountVal" size="small" />
                </div>
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('user.advancedSearch.withdrawCount')">
                <div class="adv-count-row">
                  <n-select
                    v-model:value="form.wdCountOp"
                    size="small"
                    :options="cmpOpOptions"
                  />
                  <n-input v-model:value="form.wdCountVal" size="small" />
                </div>
              </n-form-item>
            </n-gi>
            <n-gi />
            <n-gi>
              <n-form-item :label="$t('user.advancedSearch.netDepositWithdraw')">
                <div class="adv-range-inline adv-range-inline--reg">
                  <n-input v-model:value="form.netDiffMin" size="small" :placeholder="$t('user.advancedSearch.minValue')" />
                  <span class="adv-range-sep">~</span>
                  <n-input v-model:value="form.netDiffMax" size="small" :placeholder="$t('user.advancedSearch.maxValue')" />
                </div>
              </n-form-item>
            </n-gi>
            <n-gi />
          </n-grid>
        </n-tab-pane>
      </n-tabs>
      </n-form>
    </div>

    <template #footer>
      <div class="adv-footer">
        <n-button size="medium" @click="resetForm">{{ $t('common.reset') }}</n-button>
        <n-button type="primary" size="medium" @click="apply">{{ $t('common.search') }}</n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import {
  NModal,
  NTabs,
  NTabPane,
  NForm,
  NFormItem,
  NGrid,
  NGi,
  NInput,
  NSelect,
  NRadioGroup,
  NRadio,
  NDatePicker,
  NButton,
  NCheckbox,
  NTag,
} from 'naive-ui';
import { ref, reactive, watch, computed, h, type ComputedRef } from 'vue';
import { useDisplayTimezone } from '#/composables/useDisplayTimezone';
import type {
  AdminFilterClause,
  MemberAdvancedListBody,
} from '#/api/core/user-management';

const props = defineProps<{ show: boolean }>();
const emit = defineEmits<{
  'update:show': [v: boolean];
  apply: [payload: MemberAdvancedListBody];
}>();

const subTab = ref('reg');

/** 会员基本信息 + 其他信息（两 tab）栅格行距（px），三处 n-grid 共用 */
const SECTION_FORM_ROW_GAP = 15;

const ALL = '__all__';
const { timezone } = useDisplayTimezone();

const memberTierOptions = ref<{ label: string; value: string }[]>([]);
const vipLevelOptions = ref<{ label: string; value: string }[]>([]);

const memberTierOptionsWithAll = computed(() => [
  { label: $t('common.all'), value: ALL },
  ...memberTierOptions.value,
]);
const vipLevelOptionsWithAll = computed(() => [
  { label: $t('common.all'), value: ALL },
  ...vipLevelOptions.value,
]);

function optionsWithAll(opts: { label: string; value: string }[]) {
  return [{ label: $t('common.all'), value: ALL }, ...opts];
}

function withAllComputed(opts: ComputedRef<{ label: string; value: string }[]>) {
  return computed(() => optionsWithAll(opts.value));
}

function optionRealValues(options: { value: string }[]): string[] {
  return options.map((o) => String(o.value)).filter((v) => v !== ALL);
}

/** 每一项具体选项都已选 → 查询不传该维度（与全选等价） */
function isNoOpMultiFilter(
  arr: string[] | null | undefined,
  realValues: string[],
): boolean {
  if (!realValues.length || !arr?.length) return false;
  const set = new Set(arr.map(String));
  return realValues.every((r) => set.has(r));
}

function stripAllToken(arr: string[] | null | undefined): string[] {
  return (arr ?? []).filter((x) => x !== ALL);
}

/** 全选且含 ALL 时，把 ALL 放到末尾（与 normalize 一致），并修正旧数据 `[ALL, ...]`。 */
function reorderAllTokenLast(
  arr: string[] | null | undefined,
  realValues: string[],
): string[] | null {
  if (!arr?.length || !realValues.length) return arr ?? null;
  const set = new Set(arr.map(String));
  if (!set.has(ALL)) return arr;
  if (!realValues.every((r) => set.has(r))) return arr;
  if (arr.length === realValues.length + 1 && arr[arr.length - 1] === ALL) {
    return arr;
  }
  return [...realValues, ALL];
}

/**
 * 全选时存 `[...所有具体 value, ALL]`：与 Set 语义相同，但 ALL 放末尾，避免 max-tag-count=1 时
 * 第一个槽位被 ALL 占掉（render-tag 对 ALL 返回 null 会只剩「+N」无文字）。
 */
function normalizeMultiSelectValue(
  raw: unknown,
  realValues: string[],
  prev: string[] | null,
): string[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const set = new Set(raw.map(String));
  const hasAll = set.has(ALL);
  const realsPicked = realValues.filter((r) => set.has(r));
  const allPicked =
    realValues.length > 0 && realsPicked.length === realValues.length;
  const prevHadAll = prev?.includes(ALL) ?? false;
  const prevEveryReal =
    !!prev?.length &&
    realValues.length > 0 &&
    realValues.every((r) => prev!.includes(r));

  if (prevHadAll && prevEveryReal && !hasAll && allPicked) {
    return null;
  }

  if (
    hasAll &&
    realsPicked.length > 0 &&
    realsPicked.length < realValues.length
  ) {
    return realsPicked;
  }

  if (hasAll || allPicked) {
    return realValues.length ? [...realValues, ALL] : null;
  }

  return realsPicked.length ? realsPicked : null;
}

/** 输入区不展示「全部」标签，只展示具体项 + 计数，与常见后台多选一致 */
function renderMultiFieldTag(props: {
  option: { label?: unknown; value?: unknown; disabled?: boolean };
  handleClose: () => void;
}) {
  if (String(props.option?.value ?? '') === ALL) {
    return null;
  }
  const raw = props.option.label;
  const text = typeof raw === 'string' ? raw : String(raw ?? '');
  return h(
    NTag,
    {
      size: 'small',
      closable: !props.option.disabled,
      onClose: props.handleClose,
      internalCloseIsButtonTag: false,
      internalCloseFocusable: false,
    },
    { default: () => text },
  );
}

/** Checkbox + label in dropdown so multiselect is obvious (menu is teleported — use global class below). */
function renderMultiLabel(
  option: { label?: unknown; type?: string },
  selected: boolean,
) {
  if (option.type === 'group') {
    const g = option.label;
    return typeof g === 'string' ? g : String(g ?? '');
  }
  const raw = option.label;
  const text = typeof raw === 'string' ? raw : String(raw ?? '');
  return h('span', { class: 'adv-ms-lbl' }, [
    h(NCheckbox, {
      checked: selected,
      size: 'small',
      tabindex: -1,
      style: { pointerEvents: 'none' },
    }),
    h('span', { class: 'adv-ms-lbl-text' }, text),
  ]);
}

const memberTagOptions = computed(() => [
  { label: $t('user.advancedSearch.defaultTag'), value: 'default' },
]);

const verifyMethodOptions = computed(() => [
  { label: $t('user.advancedSearch.noVerification'), value: 'none' },
  { label: $t('user.advancedSearch.smsVerification'), value: 'sms' },
  { label: $t('user.advancedSearch.emailVerification'), value: 'email' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Google', value: 'google' },
  { label: 'Line', value: 'line' },
  { label: 'Telegram', value: 'telegram' },
  { label: 'Zalo', value: 'zalo' },
]);
const verifyMethodOptionsWithAll = withAllComputed(verifyMethodOptions);

const regSourceOptions = computed(() => [
  { label: $t('user.advancedSearch.promoRegister'), value: 'promo' },
  { label: $t('user.advancedSearch.organicRegister'), value: 'organic' },
  { label: $t('user.advancedSearch.channelRegister'), value: 'channel' },
]);
const regSourceOptionsWithAll = withAllComputed(regSourceOptions);

const regMethodOptions = computed(() => [
  { label: $t('user.advancedSearch.accountRegister'), value: 'account_reg' },
  { label: $t('user.advancedSearch.facebookReg'), value: 'facebook_reg' },
  { label: $t('user.advancedSearch.googleReg'), value: 'google_reg' },
  { label: $t('user.advancedSearch.lineReg'), value: 'line_reg' },
  { label: $t('user.advancedSearch.phoneReg'), value: 'phone_reg' },
  { label: $t('user.advancedSearch.emailReg'), value: 'email_reg' },
  { label: $t('user.advancedSearch.telegramBotReg'), value: 'telegram_bot_reg' },
  { label: $t('user.advancedSearch.telegramReg'), value: 'telegram_reg' },
  { label: $t('user.advancedSearch.zaloReg'), value: 'zalo_reg' },
  { label: $t('user.advancedSearch.telegramGameReg'), value: 'telegram_game_reg' },
]);
const regMethodOptionsWithAll = withAllComputed(regMethodOptions);

const loginMethodOptions = computed(() => [
  { label: $t('user.advancedSearch.facebookLogin'), value: 'facebook_login' },
  { label: $t('user.advancedSearch.googleLogin'), value: 'google_login' },
  { label: $t('user.advancedSearch.lineLogin'), value: 'line_login' },
  { label: $t('user.advancedSearch.accountLogin'), value: 'account_login' },
  { label: $t('user.advancedSearch.emailLogin'), value: 'email_login' },
  { label: $t('user.advancedSearch.phoneLogin'), value: 'phone_login' },
  { label: $t('user.advancedSearch.telegramMiniLogin'), value: 'telegram_mini_login' },
  { label: $t('user.advancedSearch.telegramLogin'), value: 'telegram_login' },
  { label: $t('user.advancedSearch.zaloLogin'), value: 'zalo_login' },
  { label: $t('user.advancedSearch.telegramGameLogin'), value: 'telegram_game_login' },
  { label: $t('user.advancedSearch.accountPcProxyLogin'), value: 'account_pc_proxy_login' },
  { label: $t('user.advancedSearch.phonePcProxyLogin'), value: 'phone_pc_proxy_login' },
  { label: $t('user.advancedSearch.emailPcProxyLogin'), value: 'email_pc_proxy_login' },
  { label: $t('user.advancedSearch.faceIdLogin'), value: 'face_id_login' },
  { label: $t('user.advancedSearch.fingerprintLogin'), value: 'fingerprint_login' },
  { label: $t('user.advancedSearch.biometricLogin'), value: 'biometric_login' },
  { label: $t('user.advancedSearch.gestureLogin'), value: 'gesture_login' },
]);
const loginMethodOptionsWithAll = withAllComputed(loginMethodOptions);

const accountTypeUiOptions = computed(() => [
  { label: $t('user.allMembers.officialAgentAll'), value: 'official_agent_all' },
  { label: $t('user.allMembers.officialMember'), value: 'official_member' },
  { label: $t('user.allMembers.officialAgentPro'), value: 'official_agent_pro' },
  { label: $t('user.allMembers.temporaryAccount'), value: 'temporary' },
  { label: $t('user.allMembers.clubAccount'), value: 'club' },
]);
const accountTypeUiOptionsWithAll = withAllComputed(accountTypeUiOptions);

const onlineStatusUiOptions = computed(() => [
  { label: $t('user.allMembers.currentlyOnline'), value: 'currently_online' },
  { label: $t('user.allMembers.lobbyMember'), value: 'lobby_member' },
  { label: $t('user.allMembers.selfOperatedMember'), value: 'self_operated_member' },
  { label: $t('user.allMembers.thirdPartyMember'), value: 'third_party_member' },
  { label: $t('user.allMembers.suspectedBot'), value: 'suspected_bot' },
  { label: $t('user.allMembers.todayOnline'), value: 'today_online' },
]);
const onlineStatusUiOptionsWithAll = withAllComputed(onlineStatusUiOptions);

const deviceOsOptions = computed(() => [
  { label: 'Windows', value: 'win' },
  { label: 'Mac', value: 'mac' },
  { label: 'Android', value: 'android' },
  { label: 'iOS', value: 'ios' },
  { label: $t('user.advancedSearch.osOther'), value: 'os_other' },
]);
const deviceOsOptionsWithAll = withAllComputed(deviceOsOptions);

const deviceMethodOptions = computed(() => [
  { label: $t('user.advancedSearch.clientBrowser'), value: 'client_browser' },
  { label: $t('user.advancedSearch.clientPwa'), value: 'client_pwa' },
  { label: $t('user.advancedSearch.clientDesktopShortcut'), value: 'client_desktop_shortcut' },
  { label: $t('user.advancedSearch.clientVest'), value: 'client_vest' },
  { label: $t('user.advancedSearch.clientIosProfile'), value: 'client_ios_profile' },
  { label: $t('user.advancedSearch.clientSpeedApp'), value: 'client_speed_app' },
  { label: $t('user.advancedSearch.clientNative'), value: 'client_native' },
  { label: $t('user.advancedSearch.clientTelegram'), value: 'client_telegram' },
]);
const deviceMethodOptionsWithAll = withAllComputed(deviceMethodOptions);

const hasFirstDepositOptions = computed(() => [
  { label: $t('common.yes'), value: 'yes' },
  { label: $t('common.no'), value: 'no' },
]);
const hasFirstDepositOptionsWithAll = withAllComputed(hasFirstDepositOptions);

const accountStatusOptions = computed(() => [
  { label: $t('user.allMembers.statusNormal'), value: 'NORMAL' },
  { label: $t('user.advancedSearch.manualFreeze'), value: 'MANUAL_FREEZE' },
  { label: $t('user.advancedSearch.abnormalFreeze'), value: 'ABNORMAL_FREEZE' },
  { label: $t('user.advancedSearch.prohibitBonus'), value: 'PROHIBIT_BONUS' },
  { label: $t('user.advancedSearch.prohibitWithdrawal'), value: 'PROHIBIT_WITHDRAWAL' },
  { label: $t('user.advancedSearch.prohibitGame'), value: 'PROHIBIT_GAME_ENTRY' },
  { label: $t('user.advancedSearch.blacklist'), value: 'BLACKLIST' },
  { label: $t('user.advancedSearch.marginal'), value: 'MARGINAL' },
]);
const accountStatusOptionsWithAll = withAllComputed(accountStatusOptions);

const cmpOpOptions = computed(() => [
  { label: '=', value: 'eq' },
  { label: '>', value: 'gt' },
  { label: '≥', value: 'gte' },
  { label: '<', value: 'lt' },
  { label: '≤', value: 'lte' },
  { label: '≠', value: 'ne' },
]);

const form = reactive({
  bulkKey: 'member.account',
  bulkValues: '',
  name: '',
  memberTag: null as string | null,
  memberTierIds: null as string[] | null,
  vipLevelIds: null as string[] | null,
  verifyMethods: null as string[] | null,
  accountStatuses: null as string[] | null,
  regSources: null as string[] | null,
  regMethods: null as string[] | null,
  memberRemark: '',
  loginMethods: null as string[] | null,
  accountTypeUis: null as string[] | null,
  onlineStatusUis: null as string[] | null,
  birthday: null as number | null,
  associatedAccount: '',
  regTimeRange: null as [number, number] | null,
  registrationIp: '',
  registrationDomain: '',
  deviceId: '',
  regDeviceOs: null as string[] | null,
  regDeviceMethod: null as string[] | null,
  browserFingerprint: '',
  lastLoginRange: null as [number, number] | null,
  lastLoginIp: '',
  lastLoginDomain: '',
  lastLoginDeviceId: '',
  lastLoginDeviceOs: null as string[] | null,
  lastLoginDeviceMethod: null as string[] | null,
  loginLogFingerprint: '',
  daysIdleMinStr: '',
  daysIdleMaxStr: '',
  firstDepositRange: null as [number, number] | null,
  firstDepositAmtMin: '',
  firstDepositAmtMax: '',
  hasFirstDeposit: null as string[] | null,
  lastDepositRange: null as [number, number] | null,
  totalDepMin: '',
  totalDepMax: '',
  lastWithdrawRange: null as [number, number] | null,
  totalWdMin: '',
  totalWdMax: '',
  noRechargeDaysMinStr: '',
  noRechargeDaysMaxStr: '',
  balanceMin: '',
  balanceMax: '',
  depCountOp: 'eq' as 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'ne',
  depCountVal: '',
  wdCountOp: 'eq' as 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'ne',
  wdCountVal: '',
  netDiffMin: '',
  netDiffMax: '',
});

function onUpdateShow(v: boolean) {
  emit('update:show', v);
}

async function loadTierVipOptions() {
  try {
    const { getActiveMemberTiersApi } = await import('#/api/core/memberTier');
    const tiers = await getActiveMemberTiersApi();
    memberTierOptions.value = tiers.map((t) => ({
      label: t.tierName,
      value: String(t.id),
    }));
  } catch {
    memberTierOptions.value = [];
  }
  try {
    const { getVIPLevels } = await import('#/api/vip');
    const vipResponse = await getVIPLevels({ pageSize: 100, isActive: true });
    const list = vipResponse.list || [];
    vipLevelOptions.value = list.map((l: { name: string; id: number }) => ({
      label: l.name,
      value: String(l.id),
    }));
  } catch {
    vipLevelOptions.value = [];
  }
}

function migrateAllMultiSelectAllLast() {
  form.memberTierIds = reorderAllTokenLast(
    form.memberTierIds,
    optionRealValues(memberTierOptionsWithAll.value),
  );
  form.vipLevelIds = reorderAllTokenLast(
    form.vipLevelIds,
    optionRealValues(vipLevelOptionsWithAll.value),
  );
  form.verifyMethods = reorderAllTokenLast(
    form.verifyMethods,
    optionRealValues(verifyMethodOptionsWithAll.value),
  );
  form.accountStatuses = reorderAllTokenLast(
    form.accountStatuses,
    optionRealValues(accountStatusOptionsWithAll.value),
  );
  form.regSources = reorderAllTokenLast(
    form.regSources,
    optionRealValues(regSourceOptionsWithAll.value),
  );
  form.regMethods = reorderAllTokenLast(
    form.regMethods,
    optionRealValues(regMethodOptionsWithAll.value),
  );
  form.loginMethods = reorderAllTokenLast(
    form.loginMethods,
    optionRealValues(loginMethodOptionsWithAll.value),
  );
  form.accountTypeUis = reorderAllTokenLast(
    form.accountTypeUis,
    optionRealValues(accountTypeUiOptionsWithAll.value),
  );
  form.onlineStatusUis = reorderAllTokenLast(
    form.onlineStatusUis,
    optionRealValues(onlineStatusUiOptionsWithAll.value),
  );
  form.regDeviceOs = reorderAllTokenLast(
    form.regDeviceOs,
    optionRealValues(deviceOsOptionsWithAll.value),
  );
  form.regDeviceMethod = reorderAllTokenLast(
    form.regDeviceMethod,
    optionRealValues(deviceMethodOptionsWithAll.value),
  );
  form.lastLoginDeviceOs = reorderAllTokenLast(
    form.lastLoginDeviceOs,
    optionRealValues(deviceOsOptionsWithAll.value),
  );
  form.lastLoginDeviceMethod = reorderAllTokenLast(
    form.lastLoginDeviceMethod,
    optionRealValues(deviceMethodOptionsWithAll.value),
  );
  form.hasFirstDeposit = reorderAllTokenLast(
    form.hasFirstDeposit,
    optionRealValues(hasFirstDepositOptionsWithAll.value),
  );
}

watch(
  () => props.show,
  async (v) => {
    if (!v) return;
    subTab.value = 'reg';
    try {
      await loadTierVipOptions();
    } finally {
      migrateAllMultiSelectAllLast();
    }
  },
);

function resetForm() {
  form.bulkKey = 'member.account';
  form.bulkValues = '';
  form.name = '';
  form.memberTag = null;
  form.memberTierIds = null;
  form.vipLevelIds = null;
  form.verifyMethods = null;
  form.accountStatuses = null;
  form.regSources = null;
  form.regMethods = null;
  form.memberRemark = '';
  form.loginMethods = null;
  form.accountTypeUis = null;
  form.onlineStatusUis = null;
  form.birthday = null;
  form.associatedAccount = '';
  form.regTimeRange = null;
  form.registrationIp = '';
  form.registrationDomain = '';
  form.deviceId = '';
  form.regDeviceOs = null;
  form.regDeviceMethod = null;
  form.browserFingerprint = '';
  form.lastLoginRange = null;
  form.lastLoginIp = '';
  form.lastLoginDomain = '';
  form.lastLoginDeviceId = '';
  form.lastLoginDeviceOs = null;
  form.lastLoginDeviceMethod = null;
  form.loginLogFingerprint = '';
  form.daysIdleMinStr = '';
  form.daysIdleMaxStr = '';
  form.firstDepositRange = null;
  form.firstDepositAmtMin = '';
  form.firstDepositAmtMax = '';
  form.hasFirstDeposit = null;
  form.lastDepositRange = null;
  form.totalDepMin = '';
  form.totalDepMax = '';
  form.lastWithdrawRange = null;
  form.totalWdMin = '';
  form.totalWdMax = '';
  form.noRechargeDaysMinStr = '';
  form.noRechargeDaysMaxStr = '';
  form.balanceMin = '';
  form.balanceMax = '';
  form.depCountOp = 'eq';
  form.depCountVal = '';
  form.wdCountOp = 'eq';
  form.wdCountVal = '';
  form.netDiffMin = '';
  form.netDiffMax = '';
}

function localDayStartEndMs(d: Date): [number, number] {
  const start = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    0,
    0,
    0,
    0,
  );
  const end = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    23,
    59,
    59,
    0,
  );
  return [start.getTime(), end.getTime()];
}

const datetimerangeShortcuts = computed<Record<string, () => [number, number]>>(() => ({
  [$t('common.today')]: () => localDayStartEndMs(new Date()),
  [$t('user.advancedSearch.yesterday')]: () => {
    const t = new Date();
    t.setDate(t.getDate() - 1);
    return localDayStartEndMs(t);
  },
  [$t('common.thisWeek')]: () => {
    const now = new Date();
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    const start = new Date(
      monday.getFullYear(),
      monday.getMonth(),
      monday.getDate(),
      0,
      0,
      0,
      0,
    );
    const end = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      0,
    );
    return [start.getTime(), end.getTime()];
  },
  [$t('common.thisMonth')]: () => {
    const n = new Date();
    const y = n.getFullYear();
    const m = n.getMonth();
    const lastDay = new Date(y, m + 1, 0).getDate();
    const start = new Date(y, m, 1, 0, 0, 0, 0);
    const end = new Date(y, m, lastDay, 23, 59, 59, 0);
    return [start.getTime(), end.getTime()];
  },
}));

function tsRange(r: [number, number] | null): [string, string] | null {
  if (!r || r.length !== 2) return null;
  return [new Date(r[0]).toISOString(), new Date(r[1]).toISOString()];
}

function pushStr(
  parts: AdminFilterClause[],
  key: string,
  op: AdminFilterClause['op'],
  raw: string,
) {
  const v = raw.trim();
  if (!v) return;
  parts.push({ key, op, val: v });
}

function pushNumBetween(
  parts: AdminFilterClause[],
  key: string,
  minS: string,
  maxS: string,
) {
  const min = minS.trim() ? Number(minS) : NaN;
  const max = maxS.trim() ? Number(maxS) : NaN;
  if (Number.isNaN(min) && Number.isNaN(max)) return;
  if (!Number.isNaN(min) && !Number.isNaN(max)) {
    parts.push({
      key,
      op: 'between',
      val: [Math.min(min, max), Math.max(min, max)],
    });
  } else if (!Number.isNaN(min)) {
    parts.push({ key, op: 'gte', val: min });
  } else {
    parts.push({ key, op: 'lte', val: max });
  }
}

function bulkFilterKey(sel: string): string {
  if (sel === 'inviter.account_parent') return 'inviter.account';
  return sel;
}

function parseDaysPair(
  a: string,
  b: string,
): { minDays: number; maxDays: number } | null {
  const x = a.trim() ? parseInt(a, 10) : NaN;
  const y = b.trim() ? parseInt(b, 10) : NaN;
  if (Number.isNaN(x) || Number.isNaN(y)) return null;
  return { minDays: Math.min(x, y), maxDays: Math.max(x, y) };
}

function apply() {
  const parts: AdminFilterClause[] = [];
  const payload: MemberAdvancedListBody = {};

  const bulk = form.bulkValues.trim();
  if (bulk) {
    if (form.bulkKey === 'top_agent_account') {
      payload.topAgentAccounts = bulk
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (form.bulkKey === 'agent.top_id_path') {
      const segs = bulk
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (segs.length === 1) {
        parts.push({ key: 'agent.top_id_path', op: 'like', val: segs[0]! });
      } else if (segs.length > 1) {
        parts.push({
          op: 'or',
          children: segs.map((s) => ({
            key: 'agent.top_id_path',
            op: 'like' as const,
            val: s,
          })),
        });
      }
    } else {
      parts.push({
        key: bulkFilterKey(form.bulkKey),
        op: 'in',
        val: bulk,
      });
    }
  }

  if (form.name.trim()) {
    parts.push({ key: 'member.name', op: 'like', val: form.name.trim() });
  }
  if (
    form.memberTierIds?.length &&
    !isNoOpMultiFilter(
      form.memberTierIds,
      optionRealValues(memberTierOptionsWithAll.value),
    )
  ) {
    const nums = stripAllToken(form.memberTierIds)
      .map((s) => parseInt(s, 10))
      .filter((n) => !Number.isNaN(n));
    if (nums.length === 1) {
      parts.push({
        key: 'member.member_tier_id',
        op: 'eq',
        val: nums[0]!,
      });
    } else if (nums.length > 1) {
      parts.push({
        key: 'member.member_tier_id',
        op: 'in',
        val: nums,
      });
    }
  }
  if (
    form.vipLevelIds?.length &&
    !isNoOpMultiFilter(
      form.vipLevelIds,
      optionRealValues(vipLevelOptionsWithAll.value),
    )
  ) {
    const nums = stripAllToken(form.vipLevelIds)
      .map((s) => parseInt(s, 10))
      .filter((n) => !Number.isNaN(n));
    if (nums.length === 1) {
      parts.push({
        key: 'member.vip_level_id',
        op: 'eq',
        val: nums[0]!,
      });
    } else if (nums.length > 1) {
      parts.push({
        key: 'member.vip_level_id',
        op: 'in',
        val: nums,
      });
    }
  }
  const accountStatusReals = optionRealValues(accountStatusOptionsWithAll.value);
  const accountStatusesStripped = stripAllToken(form.accountStatuses);
  if (
    accountStatusesStripped.length &&
    !isNoOpMultiFilter(form.accountStatuses, accountStatusReals)
  ) {
    if (accountStatusesStripped.length === 1) {
      parts.push({
        key: 'member.account_status',
        op: 'eq',
        val: accountStatusesStripped[0]!,
      });
    } else {
      parts.push({
        key: 'member.account_status',
        op: 'in',
        val: accountStatusesStripped,
      });
    }
  }
  const verifyReals = optionRealValues(verifyMethodOptionsWithAll.value);
  if (
    form.verifyMethods?.length &&
    !isNoOpMultiFilter(form.verifyMethods, verifyReals)
  ) {
    payload.verificationMethods = stripAllToken(form.verifyMethods);
  }

  const regMethodReals = optionRealValues(regMethodOptionsWithAll.value);
  if (
    form.regMethods?.length &&
    !isNoOpMultiFilter(form.regMethods, regMethodReals)
  ) {
    payload.registrationMethods = stripAllToken(form.regMethods);
  }
  const loginMethodReals = optionRealValues(loginMethodOptionsWithAll.value);
  if (
    form.loginMethods?.length &&
    !isNoOpMultiFilter(form.loginMethods, loginMethodReals)
  ) {
    payload.loginMethods = stripAllToken(form.loginMethods);
  }
  const onlineStatusReals = optionRealValues(onlineStatusUiOptionsWithAll.value);
  if (
    form.onlineStatusUis?.length &&
    !isNoOpMultiFilter(form.onlineStatusUis, onlineStatusReals)
  ) {
    payload.onlineStatusFilters = stripAllToken(form.onlineStatusUis);
  }

  const regR = tsRange(form.regTimeRange);
  if (regR) parts.push({ key: 'member.created_at', op: 'between', val: regR });
  const llR = tsRange(form.lastLoginRange);
  if (llR) parts.push({ key: 'member.last_login', op: 'between', val: llR });

  pushStr(parts, 'member.registration_ip', 'eq', form.registrationIp);
  pushStr(parts, 'member.last_login_ip', 'eq', form.lastLoginIp);
  pushStr(parts, 'member.registration_domain', 'like', form.registrationDomain);
  pushStr(parts, 'member.device_id', 'eq', form.deviceId);
  const regOsReals = optionRealValues(deviceOsOptionsWithAll.value);
  const regDmReals = optionRealValues(deviceMethodOptionsWithAll.value);
  if (!isNoOpMultiFilter(form.regDeviceOs, regOsReals)) {
    payload.registrationDeviceOsFilters = stripAllToken(form.regDeviceOs ?? []);
  }
  if (!isNoOpMultiFilter(form.regDeviceMethod, regDmReals)) {
    payload.registrationDeviceClientFilters = stripAllToken(
      form.regDeviceMethod ?? [],
    );
  }
  pushStr(
    parts,
    'member.browser_fingerprint',
    'eq',
    form.browserFingerprint,
  );
  pushStr(parts, 'member.registration_domain', 'like', form.lastLoginDomain);
  pushStr(parts, 'member.device_id', 'eq', form.lastLoginDeviceId);

  if (!isNoOpMultiFilter(form.lastLoginDeviceOs, regOsReals)) {
    payload.lastLoginDeviceOsFilters = stripAllToken(form.lastLoginDeviceOs ?? []);
  }
  if (!isNoOpMultiFilter(form.lastLoginDeviceMethod, regDmReals)) {
    payload.lastLoginDeviceClientFilters = stripAllToken(
      form.lastLoginDeviceMethod ?? [],
    );
  }

  if (form.loginLogFingerprint.trim()) {
    payload.loginLogLast = {
      browserFingerprint: form.loginLogFingerprint.trim(),
    };
  }

  const idle = parseDaysPair(form.daysIdleMinStr, form.daysIdleMaxStr);
  if (idle && (idle.minDays > 0 || idle.maxDays > 0)) {
    payload.lastLoginAgeDays = idle;
  }

  const fdR = tsRange(form.firstDepositRange);
  if (fdR) {
    parts.push({
      key: 'financial.first_deposit_at',
      op: 'between',
      val: fdR,
    });
  }
  pushNumBetween(
    parts,
    'financial.first_deposit_amount',
    form.firstDepositAmtMin,
    form.firstDepositAmtMax,
  );
  const hasFdReals = optionRealValues(hasFirstDepositOptionsWithAll.value);
  if (
    form.hasFirstDeposit?.length &&
    !isNoOpMultiFilter(form.hasFirstDeposit, hasFdReals)
  ) {
    const h = stripAllToken(form.hasFirstDeposit);
    const yes = h.includes('yes');
    const no = h.includes('no');
    if (yes && !no) {
      parts.push({ key: 'financial.deposit_count', op: 'gte', val: 1 });
    } else if (no && !yes) {
      parts.push({ key: 'financial.deposit_count', op: 'eq', val: 0 });
    }
  }

  const ldR = tsRange(form.lastDepositRange);
  if (ldR) {
    parts.push({
      key: 'financial.last_deposit_at',
      op: 'between',
      val: ldR,
    });
  }
  const lwR = tsRange(form.lastWithdrawRange);
  if (lwR) {
    parts.push({
      key: 'financial.last_withdrawal_at',
      op: 'between',
      val: lwR,
    });
  }
  pushNumBetween(
    parts,
    'financial.total_deposits',
    form.totalDepMin,
    form.totalDepMax,
  );
  pushNumBetween(
    parts,
    'financial.total_withdrawals',
    form.totalWdMin,
    form.totalWdMax,
  );
  pushNumBetween(parts, 'member.balance', form.balanceMin, form.balanceMax);

  const depIdle = parseDaysPair(
    form.noRechargeDaysMinStr,
    form.noRechargeDaysMaxStr,
  );
  if (depIdle && (depIdle.minDays > 0 || depIdle.maxDays > 0)) {
    payload.depositIdleAgeDays = depIdle;
  }

  if (form.depCountVal.trim()) {
    const n = parseInt(form.depCountVal, 10);
    if (!Number.isNaN(n)) {
      parts.push({
        key: 'financial.deposit_count',
        op: form.depCountOp,
        val: n,
      });
    }
  }
  if (form.wdCountVal.trim()) {
    const n = parseInt(form.wdCountVal, 10);
    if (!Number.isNaN(n)) {
      parts.push({
        key: 'financial.withdrawal_count',
        op: form.wdCountOp,
        val: n,
      });
    }
  }

  if (form.netDiffMin.trim() || form.netDiffMax.trim()) {
    const a = form.netDiffMin.trim() ? Number(form.netDiffMin) : undefined;
    const b = form.netDiffMax.trim() ? Number(form.netDiffMax) : undefined;
    if (a !== undefined || b !== undefined) {
      payload.financialNetDepositWithdrawDiff = { min: a, max: b };
    }
  }

  if (parts.length > 0) {
    payload.filter =
      parts.length === 1 ? parts[0]! : { op: 'and', children: parts };
  }

  emit('apply', payload);
  emit('update:show', false);
}
</script>

<style scoped>
.adv-scroll {
  max-height: min(calc(100vh - 160px), 720px);
  overflow-y: auto;
  padding-right: 4px;
}

.adv-section-title {
  position: relative;
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  line-height: 22px;
  margin: 0 0 12px;
  padding: 0 0 8px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.adv-section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 2px;
  bottom: 10px;
  width: 3px;
  border-radius: 1px;
  background: #1677ff;
}

.adv-section-title--spaced {
  margin-top: 20px;
}

.adv-bulk-radio-group {
  display: block;
  margin-bottom: 6px;
}

.adv-bulk-radios {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  align-items: center;
}

.adv-bulk-radios :deep(.n-radio) {
  margin-right: 0;
}

.adv-bulk-radios :deep(.n-radio__label) {
  font-size: 13px;
}

.adv-bulk-textarea {
  margin-bottom: 10px;
}

.adv-bulk-textarea :deep(.n-input__textarea-el) {
  font-size: 13px;
}

.adv-grid :deep(.n-form-item-label) {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.65);
  align-items: center;
}

.adv-grid--pane {
  padding-top: 6px;
}

/* 会员基本信息 + 其他信息：同一套 flex 行布局，避免仅 y-gap 相同但行高/内边距不一致 */
.adv-grid--pane-tidy :deep(.n-form-item) {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-start;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}

.adv-grid--pane-tidy :deep(.n-form-item-label) {
  width: 160px !important;
  min-width: 160px !important;
  max-width: 160px !important;
  flex-shrink: 0;
  justify-content: flex-end;
  padding-right: 10px;
  text-align: right;
  line-height: 28px;
  white-space: normal;
  word-break: break-word;
  overflow: visible;
  align-self: flex-start;
}

.adv-grid--pane-tidy :deep(.n-form-item-blank) {
  flex: 1;
  min-width: 0;
  max-width: 100%;
}

.adv-grid--pane-tidy :deep(.n-input),
.adv-grid--pane-tidy :deep(.n-input-wrapper),
.adv-grid--pane-tidy :deep(.n-base-selection),
.adv-grid--pane-tidy :deep(.n-select),
.adv-grid--pane-tidy :deep(.n-date-picker) {
  width: 100% !important;
  max-width: 100%;
  box-sizing: border-box;
}

.adv-grid--pane-tidy .adv-range-inline {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
}

.adv-grid--pane-tidy .adv-range-inline :deep(.n-input),
.adv-grid--pane-tidy .adv-range-inline :deep(.n-input-wrapper) {
  flex: 1 1 0%;
  min-width: 48px;
  width: auto !important;
}

.adv-grid--pane-tidy .adv-count-row {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
}

.adv-grid--pane-tidy .adv-count-row :deep(.n-select) {
  flex: 0 0 96px;
  width: 96px !important;
  min-width: 96px;
}

.adv-grid--pane-tidy .adv-count-row :deep(.n-input),
.adv-grid--pane-tidy .adv-count-row :deep(.n-input-wrapper) {
  flex: 1 1 0%;
  min-width: 48px;
  width: auto !important;
}

.adv-grid--reg-login .adv-twin-select--reg {
  display: flex;
  gap: 8px;
  width: 100%;
  align-items: flex-start;
  overflow: visible;
}

/* Twin selects: never use width:0 — it collapses the trigger so the menu can't open visibly */
.adv-grid--reg-login .adv-twin-select--reg :deep(.n-select) {
  flex: 1 1 0%;
  min-width: 100px;
  width: auto !important;
  max-width: none;
}

.adv-grid--reg-login .adv-twin-select--reg :deep(.n-base-selection) {
  width: 100% !important;
  min-width: 0;
}

.adv-gi-wide :deep(.n-input) {
  width: min(680px, 100%) !important;
}

.adv-twin-select {
  display: flex;
  gap: 8px;
  width: auto;
  max-width: 100%;
}

.adv-twin-select :deep(.n-select) {
  width: 124px !important;
  flex: none;
  min-width: 0;
}

.adv-twin-select--multi :deep(.n-select) {
  width: 200px !important;
  min-width: 160px;
}

.adv-range-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  width: auto;
  max-width: 100%;
}

.adv-range-inline :deep(.n-input) {
  width: 132px !important;
  flex: none;
  min-width: 0;
}

.adv-range-sep {
  color: rgba(0, 0, 0, 0.45);
  flex-shrink: 0;
  font-size: 13px;
}

.adv-count-row {
  display: flex;
  gap: 8px;
  width: auto;
  max-width: 100%;
}

.adv-count-row :deep(.n-select) {
  width: 96px !important;
  flex: none;
}

.adv-count-row :deep(.n-input) {
  width: 136px !important;
  flex: none;
  min-width: 0;
}

.adv-subtabs :deep(.n-tabs-nav) {
  margin-bottom: 0;
}

.adv-subtabs :deep(.n-tabs-bar) {
  background-color: #1677ff;
}

.adv-subtabs :deep(.n-tabs-tab.n-tabs-tab--active) {
  color: #1677ff;
  font-weight: 600;
}

.adv-form :deep(.n-form-item) {
  margin-bottom: 0;
}

.adv-form :deep(.n-form-item-blank) {
  min-height: 0;
}

.adv-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.member-adv-modal :deep(.n-card) {
  border-radius: 8px;
  box-shadow:
    0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
}

.member-adv-modal :deep(.n-card-header) {
  padding: 16px 20px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.member-adv-modal :deep(.n-card-header__main) {
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.88);
}

.member-adv-modal :deep(.n-card__content) {
  padding: 16px 20px 8px;
}

.member-adv-modal :deep(.n-card__footer) {
  padding: 12px 20px 16px;
  border-top: 1px solid #f0f0f0;
}
</style>

<!-- Select menu is teleported; keep layout for checkbox + label visible in dropdown -->
<style>
.adv-ms-lbl {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 22px;
  box-sizing: border-box;
}

.adv-ms-lbl-text {
  flex: 1;
  min-width: 0;
}
</style>
