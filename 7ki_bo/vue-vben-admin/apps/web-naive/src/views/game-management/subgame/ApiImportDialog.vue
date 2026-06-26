<template>
  <n-modal
    v-model:show="visible"
    preset="dialog"
    :title="$t('game.apiImport.title')"
    style="width: 900px"
  >
    <div class="flex flex-col gap-4">
      <n-tabs v-model:value="activeTab" type="line" animated>
        <n-tab-pane name="curl" :tab="$t('game.apiImport.curlTab')">
          <n-form label-placement="left" label-width="110">
            <n-form-item label="cURL">
              <n-input
                v-model:value="curlText"
                type="textarea"
                :rows="8"
                :placeholder="$t('game.apiImport.pasteCurl')"
              />
            </n-form-item>
            <div class="flex gap-2">
              <n-button @click="handleParseCurl" :disabled="loading"
                >{{ $t('game.apiImport.parseCurl') }}</n-button
              >
              <n-button
                type="primary"
                @click="handleTestCurl"
                :loading="loading"
                >{{ $t('game.apiImport.parseAndTest') }}</n-button
              >
            </div>
            <div class="text-gray-500" style="margin-top: 8px">
              {{ $t('game.apiImport.curlHint') }}
            </div>
          </n-form>
        </n-tab-pane>
        <n-tab-pane name="request" :tab="$t('game.apiImport.requestTab')">
          <n-form label-placement="left" label-width="110">
            <div class="grid grid-cols-2 gap-4">
              <n-form-item :label="$t('game.apiImport.httpMethod')">
                <n-select
                  v-model:value="form.method"
                  :options="methodOptions"
                  style="width: 120px"
                />
              </n-form-item>
              <n-form-item :label="$t('game.apiImport.platform')">
                <n-select
                  v-model:value="form.platformId"
                  :options="platformOptions"
                  :placeholder="$t('game.subgame.selectPlatform')"
                />
              </n-form-item>
            </div>
            <n-form-item :label="$t('game.subgame.vendor')">
              <n-input
                v-model:value="form.vendor"
                :placeholder="$t('game.apiImport.vendorPlaceholder')"
              />
            </n-form-item>
            <div class="grid grid-cols-2 gap-4">
              <n-form-item :label="$t('game.apiImport.baseDomain')">
                <n-input
                  v-model:value="form.baseUrl"
                  :placeholder="$t('game.apiImport.baseDomainPlaceholder')"
                />
              </n-form-item>
              <n-form-item label="Endpoint">
                <n-input
                  v-model:value="form.endpoint"
                  :placeholder="$t('game.apiImport.endpointPlaceholder')"
                />
              </n-form-item>
            </div>
            <n-form-item :label="$t('game.apiImport.apiUrl')">
              <n-input
                v-model:value="form.url"
                :placeholder="$t('game.apiImport.apiUrlPlaceholder')"
                readonly
              />
            </n-form-item>
            <div class="grid grid-cols-2 gap-4">
              <n-form-item :label="$t('common.currency')">
                <n-select
                  v-model:value="form.currency"
                  :options="currencyOptions"
                  style="width: 160px"
                />
              </n-form-item>
              <n-form-item :label="$t('game.apiImport.rootArrayPath')">
                <n-input
                  v-model:value="form.rootPath"
                  :placeholder="$t('game.apiImport.rootArrayPlaceholder')"
                />
              </n-form-item>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <n-form-item :label="$t('game.apiImport.requestHeaders')">
                <n-dynamic-input
                  v-model:value="form.headers"
                  preset="pair"
                  key-placeholder="Header"
                  value-placeholder="Value"
                />
              </n-form-item>
              <n-form-item :label="$t('game.apiImport.queryParams')">
                <n-dynamic-input
                  v-model:value="form.query"
                  preset="pair"
                  key-placeholder="key"
                  value-placeholder="value"
                />
              </n-form-item>
            </div>

            <n-form-item
              v-if="form.method === 'POST' || form.method === 'PUT'"
              :label="$t('game.apiImport.requestBody')"
            >
              <n-input
                v-model:value="form.bodyText"
                type="textarea"
                :rows="6"
                :placeholder="$t('game.apiImport.requestBodyPlaceholder')"
              />
            </n-form-item>

            <div class="flex gap-2">
              <n-button type="primary" :loading="loading" @click="sendRequest"
                >{{ $t('game.apiImport.testAndParse') }}</n-button
              >
              <n-button @click="resetAll" :disabled="loading">{{ $t('common.reset') }}</n-button>
            </div>
          </n-form>
        </n-tab-pane>

        <n-tab-pane name="paste" :tab="$t('game.apiImport.responseTab')">
          <n-form label-placement="left" label-width="110">
            <n-form-item :label="$t('game.apiImport.rootArrayPath')">
              <n-input
                v-model:value="form.rootPath"
                :placeholder="$t('game.apiImport.responsePathPlaceholder')"
              />
            </n-form-item>
            <n-form-item :label="$t('game.apiImport.responseRaw')">
              <n-input
                v-model:value="responseText"
                type="textarea"
                :rows="10"
                :placeholder="$t('game.apiImport.responseRawPlaceholder')"
              />
            </n-form-item>
            <div class="flex gap-2">
              <n-button
                type="primary"
                :loading="loading"
                @click="parsePastedResponse"
                >{{ $t('game.apiImport.parseResponse') }}</n-button
              >
              <n-button
                @click="
                  () => {
                    responseText = '';
                  }
                "
                :disabled="loading"
                >{{ $t('common.clear') }}</n-button
              >
            </div>
          </n-form>
        </n-tab-pane>

        <n-tab-pane name="mapping" :tab="$t('game.apiImport.mappingTab')">
          <div v-if="sampleKeys.length === 0" class="text-gray-500">
            {{ $t('game.apiImport.completeTestFirst') }}
          </div>
          <div v-else class="flex flex-col gap-4">
            <div class="grid grid-cols-2 gap-4">
              <n-form-item :label="$t('game.subgame.belongPlatform')">
                <n-select
                  v-model:value="form.platformId"
                  :options="platformOptions"
                  :placeholder="$t('game.subgame.selectPlatform')"
                />
              </n-form-item>
              <n-form-item :label="$t('game.subgame.vendor')">
                <n-input
                  v-model:value="form.vendor"
                  :placeholder="$t('game.apiImport.vendorPlaceholder')"
                />
              </n-form-item>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <n-form-item :label="$t('game.apiImport.gameIdField')">
                <n-select
                  v-model:value="mapping.gameId"
                  :options="pathOptions"
                  filterable
                  :placeholder="$t('game.apiImport.selectOrEnterPath')"
                />
              </n-form-item>
              <n-form-item :label="$t('game.apiImport.gameNameZhField')">
                <n-select
                  v-model:value="mapping.gameName"
                  :options="pathOptions"
                  filterable
                />
              </n-form-item>
              <n-form-item :label="$t('game.apiImport.nameLangPriority')">
                <n-select
                  v-model:value="nameKeyPriority"
                  multiple
                  :options="nameKeyOptions"
                  :placeholder="$t('game.apiImport.selectLangPriority')"
                />
              </n-form-item>
              <n-form-item :label="$t('game.apiImport.gameNameEnField')">
                <n-select
                  v-model:value="mapping.gameNameEn"
                  :options="pathOptions"
                  filterable
                />
              </n-form-item>
              <n-form-item :label="$t('game.apiImport.gameTypeField')">
                <n-select
                  v-model:value="mapping.gameType"
                  :options="pathOptions"
                  filterable
                />
              </n-form-item>
              <n-form-item :label="$t('game.apiImport.iconUrlField')">
                <n-select
                  v-model:value="mapping.iconUrl"
                  :options="pathOptions"
                  filterable
                />
              </n-form-item>
            </div>

            <n-alert type="info" v-if="preview.length"
              >{{ $t('game.apiImport.parsedCount', [preview.length]) }}</n-alert
            >
            <n-data-table
              :columns="previewColumns"
              :data="preview.slice(0, 50)"
              :scroll-x="900"
              size="small"
            />

            <div class="flex justify-end gap-2">
              <n-button @click="visible = false">{{ $t('common.cancel') }}</n-button>
              <n-button
                type="primary"
                :disabled="!form.platformId || preview.length === 0"
                :loading="importing"
                @click="doImport"
                >{{ $t('game.apiImport.startImport') }}</n-button
              >
            </div>
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, computed, watchEffect, h } from 'vue';
import {
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NDynamicInput,
  NButton,
  NDataTable,
  NTabs,
  NTabPane,
  NAlert,
  NImage,
  type DataTableColumns,
} from 'naive-ui';
import { notification } from '#/adapter/naive';
import { requestClient } from '#/api/request';
import { createGameApi, type CreateGameParams } from '#/api/game/subgame';

function isLikelyJson(text: string): boolean {
  const t = (text || '').trim();
  return (
    (t.startsWith('{') && t.endsWith('}')) ||
    (t.startsWith('[') && t.endsWith(']'))
  );
}

function tryParseJsonOrReturn(text: string): any {
  if (!text) return undefined;
  if (!isLikelyJson(text)) return text;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function parseTextToJsonFlexible(text: string): any {
  if (!text) return text;
  let src = text.trim();
  // Strip curl noise like: * Connection #0 to host ... left intact
  const noiseIdx = src.indexOf('* Connection');
  if (noiseIdx !== -1) {
    src = src.slice(0, noiseIdx).trim();
  }
  // If whole content is a quoted JSON string, unquote first
  if (
    (src.startsWith('"') && src.endsWith('"')) ||
    (src.startsWith("'") && src.endsWith("'"))
  ) {
    try {
      src = JSON.parse(src);
    } catch {
      /* ignore */
    }
  }
  if (isLikelyJson(src)) {
    try {
      return JSON.parse(src);
    } catch {
      /* fallthrough */
    }
  }
  // Try extract data array from text with balanced bracket scan
  const keyIdx = src.indexOf('"data"');
  if (keyIdx !== -1) {
    const startBracket = src.indexOf('[', keyIdx);
    if (startBracket !== -1) {
      let depth = 0;
      for (let i = startBracket; i < src.length; i++) {
        const ch = src[i];
        if (ch === '[') depth++;
        else if (ch === ']') {
          depth--;
          if (depth === 0) {
            const arrStr = src.slice(startBracket, i + 1);
            try {
              return { data: JSON.parse(arrStr) };
            } catch {
              /* ignore */
            }
            break;
          }
        }
      }
    }
  }
  return src; // fallback raw
}
const props = defineProps<{
  modelValue: boolean;
  platformOptions: Array<{ label: string; value: number }>;
}>();
const emit = defineEmits(['update:modelValue', 'success']);

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const loading = ref(false);
const importing = ref(false);
const activeTab = ref<'curl' | 'request' | 'mapping'>('request');
const curlText = ref('');
const responseText = ref('');

const methodOptions = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
];
const currencyOptions = [
  { label: 'BRL', value: 'BRL' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
];

const form = reactive({
  method: 'GET',
  url: '' as string,
  baseUrl: '' as string,
  endpoint: '' as string,
  headers: [] as Array<{ key: string; value: string }>,
  query: [] as Array<{ key: string; value: string }>,
  bodyText: '' as string,
  rootPath: '' as string,
  platformId: undefined as number | undefined,
  currency: 'BRL' as string,
  vendor: '' as string,
});

const rawItems = ref<any[]>([]);
const sampleKeys = ref<string[]>([]);
const pathOptions = computed(() =>
  sampleKeys.value.map((k) => ({ label: k, value: k })),
);

const mapping = reactive({
  gameId: 'id',
  gameName: 'name',
  gameNameEn: '',
  gameType: 'type',
  iconUrl: 'icon',
});

// Preferred language keys for gameName objects
const nameKeyPriority = ref<string[]>([
  'zh-hans',
  'zh-hant',
  'en',
  'th',
  'vi',
  'ko',
  'pt',
  'ja',
  'es',
  'id',
]);
const nameKeyOptions = computed(() => {
  const keys = new Set<string>(nameKeyPriority.value);
  // Inspect first 30 items to discover language keys
  const sample = rawItems.value.slice(0, 30);
  for (const it of sample) {
    const candidate = getByPath(it, mapping.gameName);
    if (
      candidate &&
      typeof candidate === 'object' &&
      !Array.isArray(candidate)
    ) {
      Object.keys(candidate).forEach((k) => keys.add(k));
    }
  }
  return Array.from(keys).map((k) => ({ label: k, value: k }));
});

// Normalize vendor-specific game type to standardized enum
function normalizeGameTypeToEnum(
  typeValue: any,
):
  | 'VIDEO'
  | 'LIVE'
  | 'SLOT'
  | 'LOTTERY'
  | 'SPORTS'
  | 'ESPORTS'
  | 'HUNTING'
  | 'CHESS_CARDS'
  | 'TABLE'
  | 'ARCADE'
  | 'SIMULATION'
  | 'COCKFIGHT'
  | 'OTHER'
  | undefined {
  if (typeValue == null) return undefined;
  const raw = String(typeValue).trim();
  // Numeric mapping as provided by vendor: 1: Video, 2: Slot, 3: Lottery, 4: Sports, 5: E-sports, 6: Hunting, 7: Chess and Cards
  const numericMap: Record<string, any> = {
    '1': 'VIDEO',
    '2': 'SLOT',
    '3': 'LOTTERY',
    '4': 'SPORTS',
    '5': 'ESPORTS',
    '6': 'HUNTING',
    '7': 'CHESS_CARDS',
  };
  if (numericMap[raw]) return numericMap[raw];

  const lower = raw.toLowerCase();
  if (/(live|live_casino|live-dealer|真人)/.test(lower)) return 'LIVE';
  if (/(video|videogame|video-game)/.test(lower)) return 'VIDEO';
  if (/(slot|slots)/.test(lower)) return 'SLOT';
  if (/(lottery|keno)/.test(lower)) return 'LOTTERY';
  if (/(sport|sportsbook|betting)/.test(lower)) return 'SPORTS';
  if (/(e-?sport|esports)/.test(lower)) return 'ESPORTS';
  if (/(hunt|fishing|arcade_fishing|捕鱼)/.test(lower)) return 'HUNTING';
  if (/(chess|cards|poker|baccarat|blackjack|roulette|桌面|棋牌)/.test(lower))
    return 'CHESS_CARDS';
  if (/(table)/.test(lower)) return 'TABLE';
  if (/(arcade|街机)/.test(lower)) return 'ARCADE';
  if (/(simulation|模拟)/.test(lower)) return 'SIMULATION';
  if (/(cockfight|斗鸡)/.test(lower)) return 'COCKFIGHT';
  return 'OTHER';
}

const preview = ref<Array<Record<string, any>>>([]);
const previewColumns = computed<DataTableColumns<Record<string, any>>>(() => [
  { title: $t('game.subgame.gameId'), key: 'gameId', width: 140 },
  { title: $t('game.apiImport.previewGameNameZh'), key: 'gameName', width: 200 },
  { title: $t('game.apiImport.previewGameNameEn'), key: 'gameNameEn', width: 200 },
  { title: $t('game.betRecordsExtra2.type'), key: 'gameType', width: 120 },
  {
    title: $t('game.apiImport.previewIcon'),
    key: 'iconUrl',
    width: 160,
    render: (row) => {
      const url = row.iconUrl as string;
      if (url && /^https?:\/\//i.test(url)) {
        return h(NImage, {
          src: url,
          width: 48,
          height: 48,
          objectFit: 'cover',
          previewDisabled: true,
          fallbackSrc: '/placeholder-game.png',
        });
      }
      return h('span', { style: 'color:#999' }, url || '-');
    },
  },
]);

function resetAll() {
  form.method = 'GET';
  form.url = '';
  form.baseUrl = '';
  form.endpoint = '';
  form.headers = [];
  form.query = [];
  form.bodyText = '';
  form.rootPath = '';
  rawItems.value = [];
  sampleKeys.value = [];
  preview.value = [];
}

function toObjectFromPairs(pairs: Array<{ key: string; value: string }>) {
  const obj: Record<string, string> = {};
  for (const p of pairs) if (p.key) obj[p.key] = p.value ?? '';
  return obj;
}

function getByPath(obj: any, path: string): any {
  if (!path) return undefined;
  const segs = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let cur = obj;
  for (const s of segs) {
    if (s === '') continue;
    if (cur == null) return undefined;
    cur = cur[s as any];
  }
  return cur;
}

function findFirstArray(o: any): any[] | null {
  if (Array.isArray(o)) return o;
  if (o && typeof o === 'object') {
    for (const k of Object.keys(o)) {
      const r = findFirstArray(o[k]);
      if (r) return r;
    }
  }
  return null;
}

function parseCurl(curl: string): {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: any;
} {
  const result: any = { headers: {} };
  const lines = curl
    .split(/\\n|\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  let joined = lines.join(' ');
  joined = joined.replace(/^\s*curl\s+/, '');

  // Prefer explicit --url option
  const explicitUrl =
    joined.match(/--url\s+(["\'])(https?:\/\/[^"\']+)\1/i) ||
    joined.match(/--url\s+(https?:\/\/[^\s]+)/i);
  if (explicitUrl) {
    result.url = (explicitUrl[2] || explicitUrl[1])?.replace(
      /^['\"]|['\"]$/g,
      '',
    );
  }

  // Extract headers first so URLs inside headers (e.g., Referer) don't confuse URL detection
  const headerRegex =
    /(?:-H|--header)\s+(['\"])\s*([^:'\"]+)\s*:\s*([^'\"]*)\1/g;
  let temp = joined;
  let hm: RegExpExecArray | null;
  while ((hm = headerRegex.exec(joined)) !== null) {
    const key = hm[2].trim();
    const value = hm[3].trim();
    result.headers[key] = value;
    // remove this header segment from temp
    temp = temp.replace(hm[0], '');
  }

  // If no explicit URL, find first bare http(s) token not preceded by '-H'/'--header'
  if (!result.url) {
    const urlTokens = temp.match(/https?:\/\/[^\s'\"]+/g);
    if (urlTokens && urlTokens.length) {
      result.url = urlTokens[0];
    } else {
      // Also handle quoted URL tokens at start
      const quoted =
        temp.match(/^["\'](https?:\/\/[^"\']+)["\']/) ||
        temp.match(/(^|\s)(["\'])(https?:\/\/[^"\']+)\2/);
      if (quoted) {
        result.url =
          quoted[1] && quoted[1].startsWith('http') ? quoted[1] : quoted[3];
      }
    }
  }

  // Method -X/--request
  const methodMatch = joined.match(
    /(?:-X|--request)\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)/i,
  );
  if (methodMatch) result.method = methodMatch[1].toUpperCase();

  // Data -d/--data/--data-raw
  const dataRegex =
    /(?:--data-binary|--data-raw|--data|-d)\s+(['\"])\s*([\s\S]*?)\1/g;
  const dm = dataRegex.exec(joined);
  if (dm) {
    const raw = dm[2];
    result.body = tryParseJsonOrReturn(raw);
    if (!result.method) result.method = 'POST';
  }

  if (!result.method) result.method = 'GET';
  return result;
}

// Keep form.url in sync with baseUrl + endpoint
watchEffect(() => {
  const base = (form.baseUrl || '').replace(/\/$/, '');
  const ep = (form.endpoint || '').startsWith('/')
    ? form.endpoint
    : form.endpoint
      ? '/' + form.endpoint
      : '';
  if (base || ep) {
    form.url = `${base}${ep}`;
  } else {
    form.url = '';
  }
});

function applyParsedToForm(parsed: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: any;
}) {
  if (parsed.method) form.method = parsed.method;
  if (parsed.url) {
    form.url = parsed.url;
    try {
      const u = new URL(parsed.url);
      form.baseUrl = `${u.protocol}//${u.host}`;
      form.endpoint = u.pathname + (u.search || '');
    } catch {}
  }
  if (parsed.headers) {
    form.headers = Object.entries(parsed.headers).map(([key, value]) => ({
      key,
      value,
    }));
  }
  if (parsed.body !== undefined) {
    form.bodyText =
      typeof parsed.body === 'string'
        ? parsed.body
        : JSON.stringify(parsed.body, null, 2);
  }
}

function handleParseCurl() {
  if (!curlText.value.trim()) {
    notification.warning({ content: $t('game.apiImport.pasteCurlRequired') });
    return;
  }
  const parsed = parseCurl(curlText.value);
  applyParsedToForm(parsed);
  activeTab.value = 'request';
  notification.success({ content: $t('game.apiImport.curlParsed') });
}

async function handleTestCurl() {
  handleParseCurl();
  await sendRequest();
  activeTab.value = 'mapping';
}

async function sendRequest() {
  if (!form.url) {
    notification.warning({ content: $t('game.apiImport.enterApiUrlRequired') });
    return;
  }
  try {
    loading.value = true;
    const headers = toObjectFromPairs(form.headers);
    const params = toObjectFromPairs(form.query);
    const body = form.bodyText
      ? tryParseJsonOrReturn(form.bodyText)
      : undefined;

    // Use backend proxy via requestClient so Authorization is attached automatically
    const wrapped = await requestClient.post<{
      success: boolean;
      status: number;
      data: any;
    }>('/analytics/proxy', {
      url: form.url,
      method: form.method,
      headers,
      query: params,
      body,
    });
    if (!(wrapped as any).success)
      throw new Error((wrapped as any).message || 'Proxy call failed');
    let resp = parseTextToJsonFlexible((wrapped as any).data);

    let arr: any[] | null = null;
    if (form.rootPath) {
      const root = getByPath(resp, form.rootPath);
      if (Array.isArray(root)) arr = root;
    }
    if (!arr) arr = findFirstArray(resp) || [];
    rawItems.value = arr;
    if (arr.length === 0) {
      sampleKeys.value = [];
      preview.value = [];
      notification.warning({ content: $t('game.apiImport.arrayNotFound') });
      return;
    }

    // collect keys (depth 1) for mapping options
    const first = arr[0] || {};
    const keys = new Set<string>();
    Object.keys(first).forEach((k) => keys.add(k));
    sampleKeys.value = Array.from(keys);

    buildPreview();
    notification.success({ content: $t('game.apiImport.parseSuccessGoMapping') });
  } catch (e: any) {
    console.error(e);
    notification.error({ content: e?.message || $t('game.apiImport.requestFailed') });
  } finally {
    loading.value = false;
  }
}

function parsePastedResponse() {
  try {
    loading.value = true;
    let resp: any = parseTextToJsonFlexible(responseText.value);
    let arr: any[] | null = null;
    if (form.rootPath) {
      const root = getByPath(resp, form.rootPath);
      if (Array.isArray(root)) arr = root;
    }
    if (!arr) arr = findFirstArray(resp) || [];
    rawItems.value = arr;
    if (arr.length === 0) {
      sampleKeys.value = [];
      preview.value = [];
      notification.warning({ content: $t('game.apiImport.arrayNotFound') });
      return;
    }
    const first = arr[0] || {};
    const keys = new Set<string>();
    Object.keys(first).forEach((k) => keys.add(k));
    sampleKeys.value = Array.from(keys);
    buildPreview();
    activeTab.value = 'mapping';
    notification.success({ content: $t('game.apiImport.parseSuccessGoMapping') });
  } finally {
    loading.value = false;
  }
}
function buildPreview() {
  preview.value = rawItems.value.map((it) => ({
    gameId: getByPath(it, mapping.gameId) ?? '',
    gameName: resolveGameName(getByPath(it, mapping.gameName)),
    gameNameEn: resolveEnglishName(
      getByPath(it, mapping.gameNameEn || mapping.gameName),
    ),
    gameType: getByPath(it, mapping.gameType) ?? '',
    iconUrl: getByPath(it, mapping.iconUrl) ?? '',
    vendor: form.vendor || '',
  }));
}

function resolveGameName(value: any): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    for (const key of nameKeyPriority.value) {
      if (value[key]) return String(value[key]);
    }
    // Fallback: first string property
    const first = Object.values(value).find((v) => typeof v === 'string');
    if (first) return String(first);
    return '';
  }
  return String(value);
}

function resolveEnglishName(value: any): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const candidates = ['en', 'en-us', 'en-GB', 'en-US', 'english', 'EN'];
    for (const key of candidates) {
      if (value[key]) return String(value[key]);
    }
    // fallback: if a prioritized Chinese exists and english missing, return any string
    const first = Object.values(value).find((v) => typeof v === 'string');
    if (first) return String(first);
    return '';
  }
  return String(value);
}

watchEffect(() => {
  if (rawItems.value.length) buildPreview();
});

async function doImport() {
  if (!form.platformId) {
    notification.warning({ content: $t('game.apiImport.selectPlatformRequired') });
    return;
  }
  if (preview.value.length === 0) {
    notification.warning({ content: $t('game.apiImport.noDataToImport') });
    return;
  }
  try {
    importing.value = true;
    let success = 0,
      failed = 0;
    for (const row of preview.value) {
      if (!row.gameId || !row.gameName) {
        failed++;
        continue;
      }
      const payload: CreateGameParams = {
        platformId: Number(form.platformId),
        gameId: String(row.gameId),
        gameName: String(row.gameName),
        gameNameEn: row.gameNameEn || undefined,
        gameType: row.gameType || undefined,
        gameTypeEnum: normalizeGameTypeToEnum(row.gameType),
        currency: form.currency,
        iconUrl: row.iconUrl || undefined,
        sortOrder: 0,
        isEnabled: true,
      };
      // Embed vendor and third-party fields for later use
      (payload as any).thirdPartyId = String(row.gameId);
      (payload as any).thirdPartyData = {
        vendor: form.vendor || undefined,
        sourceUrl: form.url,
      };
      try {
        await createGameApi(payload);
        success++;
      } catch (e) {
        failed++;
      }
    }
    notification.success({
      content: $t('game.apiImport.importCompleteSummary', [success, failed]),
    });
    emit('success');
    visible.value = false;
  } finally {
    importing.value = false;
  }
}
</script>

<style scoped>
.grid {
  display: grid;
}
.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.gap-4 {
  gap: 1rem;
}
.flex {
  display: flex;
}
.flex-col {
  flex-direction: column;
}
.justify-end {
  justify-content: flex-end;
}
.text-gray-500 {
  color: #6b7280;
}
</style>
