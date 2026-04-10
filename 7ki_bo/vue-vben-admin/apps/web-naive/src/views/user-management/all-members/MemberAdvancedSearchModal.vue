<template>
  <n-modal
    :show="show"
    preset="card"
    title="高级搜索"
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
        :label-width="136"
        size="small"
        class="adv-form"
      >
      <!-- 会员基本信息 -->
      <div class="adv-section-title">会员基本信息</div>

      <n-radio-group v-model:value="form.bulkKey" class="adv-bulk-radio-group">
        <div class="adv-bulk-radios">
          <n-radio value="member.account">会员账号</n-radio>
          <n-radio value="member.id">会员ID</n-radio>
          <n-radio value="member.phone">手机号</n-radio>
          <n-radio value="inviter.account">邀请人账号</n-radio>
          <n-radio value="inviter.id">邀请人ID</n-radio>
          <n-radio value="parent_agent_id">上级代理ID</n-radio>
          <n-radio value="inviter.account_parent">上级代理账号</n-radio>
          <n-radio value="agent.top_id_path">顶层代理ID</n-radio>
          <n-radio value="top_agent_account">顶层代理账号</n-radio>
        </div>
      </n-radio-group>

      <n-input
        v-model:value="form.bulkValues"
        type="textarea"
        class="adv-bulk-textarea"
        placeholder="多个账号需英文逗号隔开，最多支持10000个"
        :rows="5"
        size="small"
      />

      <n-grid :cols="2" :x-gap="20" :y-gap="4" class="adv-grid">
        <n-gi>
          <n-form-item label="姓名">
            <n-input
              v-model:value="form.name"
              clearable
              size="small"
              placeholder="请输入"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="会员标签">
            <n-select
              v-model:value="form.memberTag"
              clearable
              size="small"
              placeholder="请选择"
              :options="memberTagOptions"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="会员层级">
            <n-select
              :value="form.memberTierIds"
              multiple
              clearable
              filterable
              :show-checkmark="false"
              :render-label="renderMultiLabel"
              :render-tag="renderMultiFieldTag"
              size="small"
              placeholder="请选择"
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
          <n-form-item label="VIP等级">
            <n-select
              :value="form.vipLevelIds"
              multiple
              clearable
              filterable
              :show-checkmark="false"
              :render-label="renderMultiLabel"
              :render-tag="renderMultiFieldTag"
              size="small"
              placeholder="请选择"
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
          <n-form-item label="验证方式">
            <n-select
              :value="form.verifyMethods"
              multiple
              clearable
              :show-checkmark="false"
              :render-label="renderMultiLabel"
              :render-tag="renderMultiFieldTag"
              size="small"
              placeholder="请选择验证方式"
              :max-tag-count="1"
              :options="optionsWithAll(verifyMethodOptions)"
              @update:value="(v) => {
                const p = form.verifyMethods;
                form.verifyMethods = normalizeMultiSelectValue(
                  v,
                  optionRealValues(optionsWithAll(verifyMethodOptions)),
                  p,
                );
              }"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="账号状态">
            <n-select
              :value="form.accountStatuses"
              multiple
              clearable
              :show-checkmark="false"
              :render-label="renderMultiLabel"
              :render-tag="renderMultiFieldTag"
              size="small"
              placeholder="请选择"
              :max-tag-count="1"
              :options="optionsWithAll(accountStatusOptions)"
              @update:value="(v) => {
                const p = form.accountStatuses;
                form.accountStatuses = normalizeMultiSelectValue(
                  v,
                  optionRealValues(optionsWithAll(accountStatusOptions)),
                  p,
                );
              }"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="注册来源">
            <n-select
              :value="form.regSources"
              multiple
              clearable
              filterable
              :show-checkmark="false"
              :render-label="renderMultiLabel"
              :render-tag="renderMultiFieldTag"
              size="small"
              placeholder="请选择"
              :max-tag-count="1"
              :options="optionsWithAll(regSourceOptions)"
              @update:value="(v) => {
                const p = form.regSources;
                form.regSources = normalizeMultiSelectValue(
                  v,
                  optionRealValues(optionsWithAll(regSourceOptions)),
                  p,
                );
              }"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="注册方式">
            <n-select
              :value="form.regMethods"
              multiple
              clearable
              :show-checkmark="false"
              :render-label="renderMultiLabel"
              :render-tag="renderMultiFieldTag"
              size="small"
              placeholder="请选择"
              :max-tag-count="1"
              :options="optionsWithAll(regMethodOptions)"
              @update:value="(v) => {
                const p = form.regMethods;
                form.regMethods = normalizeMultiSelectValue(
                  v,
                  optionRealValues(optionsWithAll(regMethodOptions)),
                  p,
                );
              }"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="会员备注">
            <n-input
              v-model:value="form.memberRemark"
              clearable
              size="small"
              placeholder="请输入"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="登录方式">
            <n-select
              :value="form.loginMethods"
              multiple
              clearable
              :show-checkmark="false"
              :render-label="renderMultiLabel"
              :render-tag="renderMultiFieldTag"
              size="small"
              placeholder="请选择"
              :max-tag-count="1"
              :options="optionsWithAll(loginMethodOptions)"
              @update:value="(v) => {
                const p = form.loginMethods;
                form.loginMethods = normalizeMultiSelectValue(
                  v,
                  optionRealValues(optionsWithAll(loginMethodOptions)),
                  p,
                );
              }"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="账号类型">
            <n-select
              :value="form.accountTypeUis"
              multiple
              clearable
              :show-checkmark="false"
              :render-label="renderMultiLabel"
              :render-tag="renderMultiFieldTag"
              size="small"
              placeholder="请选择"
              :max-tag-count="1"
              :options="optionsWithAll(accountTypeUiOptions)"
              @update:value="(v) => {
                const p = form.accountTypeUis;
                form.accountTypeUis = normalizeMultiSelectValue(
                  v,
                  optionRealValues(optionsWithAll(accountTypeUiOptions)),
                  p,
                );
              }"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="在线状态">
            <n-select
              :value="form.onlineStatusUis"
              multiple
              clearable
              :show-checkmark="false"
              :render-label="renderMultiLabel"
              :render-tag="renderMultiFieldTag"
              size="small"
              placeholder="请选择"
              :max-tag-count="1"
              :options="optionsWithAll(onlineStatusUiOptions)"
              @update:value="(v) => {
                const p = form.onlineStatusUis;
                form.onlineStatusUis = normalizeMultiSelectValue(
                  v,
                  optionRealValues(optionsWithAll(onlineStatusUiOptions)),
                  p,
                );
              }"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="会员生日">
            <n-date-picker
              v-model:value="form.birthday"
              type="date"
              clearable
              size="small"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="同关联账号">
            <n-input
              v-model:value="form.associatedAccount"
              clearable
              size="small"
              placeholder="请输入"
            />
          </n-form-item>
        </n-gi>
      </n-grid>

      <!-- 其他信息 -->
      <div class="adv-section-title adv-section-title--spaced">其他信息</div>

      <n-tabs
        v-model:value="subTab"
        type="line"
        size="small"
        class="adv-subtabs"
      >
        <n-tab-pane name="reg" tab="注册登录信息">
          <n-grid :cols="2" :x-gap="20" :y-gap="4" class="adv-grid adv-grid--pane">
            <n-gi span="2" class="adv-gi-range">
              <n-form-item label="注册时间">
                <n-date-picker
                  v-model:value="form.regTimeRange"
                  type="datetimerange"
                  clearable
                  size="small"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="注册IP">
                <n-input v-model:value="form.registrationIp" clearable size="small" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="注册域名">
                <n-input
                  v-model:value="form.registrationDomain"
                  clearable
                  size="small"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="注册设备号">
                <n-input v-model:value="form.deviceId" clearable size="small" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="注册设备类型">
                <div class="adv-twin-select adv-twin-select--multi">
                  <n-select
                    :value="form.regDeviceOs"
                    multiple
                    clearable
                    :show-checkmark="false"
                    :render-label="renderMultiLabel"
                    :render-tag="renderMultiFieldTag"
                    size="small"
                    placeholder="系统"
                    :max-tag-count="1"
                    :options="optionsWithAll(deviceOsOptions)"
                    @update:value="(v) => {
                      const p = form.regDeviceOs;
                      form.regDeviceOs = normalizeMultiSelectValue(
                        v,
                        optionRealValues(optionsWithAll(deviceOsOptions)),
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
                    placeholder="方式"
                    :max-tag-count="1"
                    :options="optionsWithAll(deviceMethodOptions)"
                    @update:value="(v) => {
                      const p = form.regDeviceMethod;
                      form.regDeviceMethod = normalizeMultiSelectValue(
                        v,
                        optionRealValues(optionsWithAll(deviceMethodOptions)),
                        p,
                      );
                    }"
                  />
                </div>
              </n-form-item>
            </n-gi>
            <n-gi span="2" class="adv-gi-wide">
              <n-form-item label="注册浏览器指纹">
                <n-input
                  v-model:value="form.browserFingerprint"
                  clearable
                  size="small"
                />
              </n-form-item>
            </n-gi>
            <n-gi span="2" class="adv-gi-range">
              <n-form-item label="最后登录时间">
                <n-date-picker
                  v-model:value="form.lastLoginRange"
                  type="datetimerange"
                  clearable
                  size="small"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="最后登录IP">
                <n-input v-model:value="form.lastLoginIp" clearable size="small" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="最后登录域名">
                <n-input
                  v-model:value="form.lastLoginDomain"
                  clearable
                  size="small"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="最后登录设备号">
                <n-input
                  v-model:value="form.lastLoginDeviceId"
                  clearable
                  size="small"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="最后登录设备类型">
                <div class="adv-twin-select adv-twin-select--multi">
                  <n-select
                    :value="form.lastLoginDeviceOs"
                    multiple
                    clearable
                    :show-checkmark="false"
                    :render-label="renderMultiLabel"
                    :render-tag="renderMultiFieldTag"
                    size="small"
                    placeholder="系统"
                    :max-tag-count="1"
                    :options="optionsWithAll(deviceOsOptions)"
                    @update:value="(v) => {
                      const p = form.lastLoginDeviceOs;
                      form.lastLoginDeviceOs = normalizeMultiSelectValue(
                        v,
                        optionRealValues(optionsWithAll(deviceOsOptions)),
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
                    placeholder="方式"
                    :max-tag-count="1"
                    :options="optionsWithAll(deviceMethodOptions)"
                    @update:value="(v) => {
                      const p = form.lastLoginDeviceMethod;
                      form.lastLoginDeviceMethod = normalizeMultiSelectValue(
                        v,
                        optionRealValues(optionsWithAll(deviceMethodOptions)),
                        p,
                      );
                    }"
                  />
                </div>
              </n-form-item>
            </n-gi>
            <n-gi span="2" class="adv-gi-wide">
              <n-form-item label="最后登录浏览器指纹">
                <n-input
                  v-model:value="form.loginLogFingerprint"
                  clearable
                  size="small"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item
                label="未登录时间(天)"
                :show-feedback="false"
              >
                <div class="adv-range-inline">
                  <n-input
                    v-model:value="form.daysIdleMinStr"
                    size="small"
                    placeholder=""
                  />
                  <span class="adv-range-sep">~</span>
                  <n-input
                    v-model:value="form.daysIdleMaxStr"
                    size="small"
                    placeholder=""
                  />
                </div>
              </n-form-item>
            </n-gi>
          </n-grid>
        </n-tab-pane>

        <n-tab-pane name="finance" tab="财务信息">
          <n-grid :cols="2" :x-gap="20" :y-gap="4" class="adv-grid adv-grid--pane">
            <n-gi span="2" class="adv-gi-range">
              <n-form-item label="首充时间">
                <n-date-picker
                  v-model:value="form.firstDepositRange"
                  type="datetimerange"
                  clearable
                  size="small"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="首充金额">
                <div class="adv-range-inline">
                  <n-input
                    v-model:value="form.firstDepositAmtMin"
                    size="small"
                    placeholder="最小"
                  />
                  <span class="adv-range-sep">~</span>
                  <n-input
                    v-model:value="form.firstDepositAmtMax"
                    size="small"
                    placeholder="最大"
                  />
                </div>
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="是否首充">
                <n-select
                  :value="form.hasFirstDeposit"
                  multiple
                  clearable
                  :show-checkmark="false"
                  :render-label="renderMultiLabel"
                  :render-tag="renderMultiFieldTag"
                  size="small"
                  placeholder="请选择"
                  :max-tag-count="1"
                  :options="optionsWithAll(hasFirstDepositOptions)"
                  @update:value="(v) => {
                    const p = form.hasFirstDeposit;
                    form.hasFirstDeposit = normalizeMultiSelectValue(
                      v,
                      optionRealValues(optionsWithAll(hasFirstDepositOptions)),
                      p,
                    );
                  }"
                />
              </n-form-item>
            </n-gi>
            <n-gi span="2" class="adv-gi-range">
              <n-form-item label="最后充值时间">
                <n-date-picker
                  v-model:value="form.lastDepositRange"
                  type="datetimerange"
                  clearable
                  size="small"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="累计充值金额">
                <div class="adv-range-inline">
                  <n-input v-model:value="form.totalDepMin" size="small" />
                  <span class="adv-range-sep">~</span>
                  <n-input v-model:value="form.totalDepMax" size="small" />
                </div>
              </n-form-item>
            </n-gi>
            <n-gi class="adv-gi-range">
              <n-form-item label="最后提现时间">
                <n-date-picker
                  v-model:value="form.lastWithdrawRange"
                  type="datetimerange"
                  clearable
                  size="small"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="提现总额">
                <div class="adv-range-inline">
                  <n-input v-model:value="form.totalWdMin" size="small" />
                  <span class="adv-range-sep">~</span>
                  <n-input v-model:value="form.totalWdMax" size="small" />
                </div>
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item
                label="未充值时间(天)"
                :show-feedback="false"
              >
                <div class="adv-range-inline">
                  <n-input v-model:value="form.noRechargeDaysMinStr" size="small" />
                  <span class="adv-range-sep">~</span>
                  <n-input v-model:value="form.noRechargeDaysMaxStr" size="small" />
                </div>
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="账号余额">
                <div class="adv-range-inline">
                  <n-input v-model:value="form.balanceMin" size="small" />
                  <span class="adv-range-sep">~</span>
                  <n-input v-model:value="form.balanceMax" size="small" />
                </div>
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="充值次数">
                <div class="adv-count-row">
                  <n-select
                    v-model:value="form.depCountOp"
                    size="small"
                    style="width: 96px"
                    :options="cmpOpOptions"
                  />
                  <n-input v-model:value="form.depCountVal" size="small" />
                </div>
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="提现次数">
                <div class="adv-count-row">
                  <n-select
                    v-model:value="form.wdCountOp"
                    size="small"
                    style="width: 96px"
                    :options="cmpOpOptions"
                  />
                  <n-input v-model:value="form.wdCountVal" size="small" />
                </div>
              </n-form-item>
            </n-gi>
            <n-gi span="2" class="adv-gi-netdiff">
              <n-form-item label="总充提差额">
                <div class="adv-range-inline">
                  <n-input v-model:value="form.netDiffMin" size="small" />
                  <span class="adv-range-sep">~</span>
                  <n-input v-model:value="form.netDiffMax" size="small" />
                </div>
              </n-form-item>
            </n-gi>
          </n-grid>
        </n-tab-pane>
      </n-tabs>
      </n-form>
    </div>

    <template #footer>
      <div class="adv-footer">
        <n-button size="medium" @click="resetForm">重置</n-button>
        <n-button type="primary" size="medium" @click="apply">搜索</n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
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
import { ref, reactive, watch, computed, h } from 'vue';
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

const ALL = '__all__';

const memberTierOptions = ref<{ label: string; value: string }[]>([]);
const vipLevelOptions = ref<{ label: string; value: string }[]>([]);

const memberTierOptionsWithAll = computed(() => [
  { label: '全部', value: ALL },
  ...memberTierOptions.value,
]);
const vipLevelOptionsWithAll = computed(() => [
  { label: '全部', value: ALL },
  ...vipLevelOptions.value,
]);

function optionsWithAll(opts: { label: string; value: string }[]) {
  return [{ label: '全部', value: ALL }, ...opts];
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

const memberTagOptions = [{ label: '默认标签', value: 'default' }];

const verifyMethodOptions = [
  { label: '无验证', value: 'none' },
  { label: '短信验证', value: 'sms' },
  { label: '邮箱验证', value: 'email' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Google', value: 'google' },
  { label: 'Line', value: 'line' },
  { label: 'Telegram', value: 'telegram' },
  { label: 'Zalo', value: 'zalo' },
];

const regSourceOptions = [
  { label: '推广注册', value: 'promo' },
  { label: '自然注册', value: 'organic' },
  { label: '渠道投放', value: 'channel' },
];

const regMethodOptions = [
  { label: '网页', value: 'web' },
  { label: 'H5', value: 'h5' },
  { label: 'APP', value: 'app' },
];

const loginMethodOptions = [
  { label: '账号密码', value: 'password' },
  { label: '短信验证码', value: 'sms' },
  { label: '第三方', value: 'oauth' },
];

const accountTypeUiOptions = [
  { label: '正式账号-人人代理', value: 'official_agent_all' },
  { label: '正式账号-普通会员', value: 'official_member' },
  { label: '正式账号-专业代理', value: 'official_agent_pro' },
  { label: '临时账号', value: 'temporary' },
  { label: '俱乐部账号', value: 'club' },
];

const onlineStatusUiOptions = [
  { label: '当前在线', value: 'currently_online' },
  { label: '大厅会员', value: 'lobby_member' },
  { label: '自营游戏会员', value: 'self_operated_member' },
  { label: '三方游戏会员', value: 'third_party_member' },
  { label: '疑似机器人', value: 'suspected_bot' },
  { label: '今日在线', value: 'today_online' },
];

const deviceOsOptions = [
  { label: 'iOS', value: 'iOS' },
  { label: 'Android', value: 'Android' },
  { label: 'Windows', value: 'Windows' },
  { label: 'macOS', value: 'macOS' },
];

const deviceMethodOptions = [
  { label: 'APP', value: 'APP' },
  { label: 'H5', value: 'H5' },
  { label: 'Web', value: 'Web' },
];

const hasFirstDepositOptions = [
  { label: '是', value: 'yes' },
  { label: '否', value: 'no' },
];

const accountStatusOptions = [
  { label: '正常', value: 'NORMAL' },
  { label: '手动冻结', value: 'MANUAL_FREEZE' },
  { label: '异常冻结', value: 'ABNORMAL_FREEZE' },
  { label: '禁止领取优惠', value: 'PROHIBIT_BONUS' },
  { label: '禁止提现', value: 'PROHIBIT_WITHDRAWAL' },
  { label: '禁止进入游戏', value: 'PROHIBIT_GAME_ENTRY' },
  { label: '黑名单', value: 'BLACKLIST' },
  { label: '边退', value: 'MARGINAL' },
];

const cmpOpOptions = [
  { label: '=', value: 'eq' },
  { label: '>', value: 'gt' },
  { label: '≥', value: 'gte' },
  { label: '<', value: 'lt' },
  { label: '≤', value: 'lte' },
  { label: '≠', value: 'ne' },
];

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
    optionRealValues(optionsWithAll(verifyMethodOptions)),
  );
  form.accountStatuses = reorderAllTokenLast(
    form.accountStatuses,
    optionRealValues(optionsWithAll(accountStatusOptions)),
  );
  form.regSources = reorderAllTokenLast(
    form.regSources,
    optionRealValues(optionsWithAll(regSourceOptions)),
  );
  form.regMethods = reorderAllTokenLast(
    form.regMethods,
    optionRealValues(optionsWithAll(regMethodOptions)),
  );
  form.loginMethods = reorderAllTokenLast(
    form.loginMethods,
    optionRealValues(optionsWithAll(loginMethodOptions)),
  );
  form.accountTypeUis = reorderAllTokenLast(
    form.accountTypeUis,
    optionRealValues(optionsWithAll(accountTypeUiOptions)),
  );
  form.onlineStatusUis = reorderAllTokenLast(
    form.onlineStatusUis,
    optionRealValues(optionsWithAll(onlineStatusUiOptions)),
  );
  form.regDeviceOs = reorderAllTokenLast(
    form.regDeviceOs,
    optionRealValues(optionsWithAll(deviceOsOptions)),
  );
  form.regDeviceMethod = reorderAllTokenLast(
    form.regDeviceMethod,
    optionRealValues(optionsWithAll(deviceMethodOptions)),
  );
  form.lastLoginDeviceOs = reorderAllTokenLast(
    form.lastLoginDeviceOs,
    optionRealValues(optionsWithAll(deviceOsOptions)),
  );
  form.lastLoginDeviceMethod = reorderAllTokenLast(
    form.lastLoginDeviceMethod,
    optionRealValues(optionsWithAll(deviceMethodOptions)),
  );
  form.hasFirstDeposit = reorderAllTokenLast(
    form.hasFirstDeposit,
    optionRealValues(optionsWithAll(hasFirstDepositOptions)),
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

function pushOrLikeGroup(
  parts: AdminFilterClause[],
  key: string,
  values: string[],
) {
  const vs = values.map((s) => s.trim()).filter(Boolean);
  if (!vs.length) return;
  if (vs.length === 1) {
    parts.push({ key, op: 'like', val: vs[0]! });
    return;
  }
  parts.push({
    op: 'or',
    children: vs.map((val) => ({ key, op: 'like' as const, val })),
  });
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
  const accountStatusReals = optionRealValues(
    optionsWithAll(accountStatusOptions),
  );
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
  const verifyReals = optionRealValues(optionsWithAll(verifyMethodOptions));
  if (
    form.verifyMethods?.length &&
    !isNoOpMultiFilter(form.verifyMethods, verifyReals)
  ) {
    payload.verificationMethods = stripAllToken(form.verifyMethods);
  }

  const regMethodReals = optionRealValues(optionsWithAll(regMethodOptions));
  if (!isNoOpMultiFilter(form.regMethods, regMethodReals)) {
    const rawRm = stripAllToken(form.regMethods ?? []);
    const regMethodToDeviceToken: Record<string, string> = {
      web: 'Web',
      h5: 'H5',
      app: 'APP',
    };
    const mapped = rawRm.map((v) => regMethodToDeviceToken[v] ?? v);
    pushOrLikeGroup(parts, 'member.registration_device', mapped);
  }

  const regR = tsRange(form.regTimeRange);
  if (regR) parts.push({ key: 'member.created_at', op: 'between', val: regR });
  const llR = tsRange(form.lastLoginRange);
  if (llR) parts.push({ key: 'member.last_login', op: 'between', val: llR });

  pushStr(parts, 'member.registration_ip', 'eq', form.registrationIp);
  pushStr(parts, 'member.last_login_ip', 'eq', form.lastLoginIp);
  pushStr(parts, 'member.registration_domain', 'like', form.registrationDomain);
  pushStr(parts, 'member.device_id', 'eq', form.deviceId);
  const regOsReals = optionRealValues(optionsWithAll(deviceOsOptions));
  const regDmReals = optionRealValues(optionsWithAll(deviceMethodOptions));
  if (!isNoOpMultiFilter(form.regDeviceOs, regOsReals)) {
    pushOrLikeGroup(
      parts,
      'member.registration_device',
      stripAllToken(form.regDeviceOs ?? []),
    );
  }
  if (!isNoOpMultiFilter(form.regDeviceMethod, regDmReals)) {
    pushOrLikeGroup(
      parts,
      'member.registration_device',
      stripAllToken(form.regDeviceMethod ?? []),
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
    pushOrLikeGroup(
      parts,
      'member.registration_device',
      stripAllToken(form.lastLoginDeviceOs ?? []),
    );
  }
  if (!isNoOpMultiFilter(form.lastLoginDeviceMethod, regDmReals)) {
    pushOrLikeGroup(
      parts,
      'member.registration_device',
      stripAllToken(form.lastLoginDeviceMethod ?? []),
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
  const hasFdReals = optionRealValues(optionsWithAll(hasFirstDepositOptions));
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
  margin-bottom: 10px;
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
  margin-bottom: 16px;
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
  padding-top: 12px;
}

/* Same-row label + field: keep inputs/selects short */
.adv-grid :deep(.n-input),
.adv-grid :deep(.n-select),
.adv-grid :deep(.n-date-picker) {
  width: 252px !important;
  max-width: 100%;
  box-sizing: border-box;
}

.adv-gi-range :deep(.n-date-picker) {
  width: min(520px, 100%) !important;
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

.adv-gi-netdiff .adv-range-inline :deep(.n-input) {
  width: 200px !important;
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
  margin-bottom: 2px;
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
