<template>
  <n-modal
    v-model:show="visible"
    preset="dialog"
    title="接口导入子游戏"
    style="width: 900px"
  >
    <div class="flex flex-col gap-4">
      <n-tabs v-model:value="activeTab" type="line" animated>
        <n-tab-pane name="curl" tab="cURL 命令">
          <n-form label-placement="left" label-width="110">
            <n-form-item label="cURL">
              <n-input
                v-model:value="curlText"
                type="textarea"
                :rows="8"
                placeholder="粘贴从 Postman/浏览器复制的 cURL 命令"
              />
            </n-form-item>
            <div class="flex gap-2">
              <n-button @click="handleParseCurl" :disabled="loading"
                >解析 cURL</n-button
              >
              <n-button
                type="primary"
                @click="handleTestCurl"
                :loading="loading"
                >解析并测试</n-button
              >
            </div>
            <div class="text-gray-500" style="margin-top: 8px">
              支持 -X、-H/--header、-d/--data/--data-raw、--compressed
              等常见参数。解析后会填充到“请求设置”。
            </div>
          </n-form>
        </n-tab-pane>
        <n-tab-pane name="request" tab="请求设置">
          <n-form label-placement="left" label-width="110">
            <div class="grid grid-cols-2 gap-4">
              <n-form-item label="HTTP 方法">
                <n-select
                  v-model:value="form.method"
                  :options="methodOptions"
                  style="width: 120px"
                />
              </n-form-item>
              <n-form-item label="平台">
                <n-select
                  v-model:value="form.platformId"
                  :options="platformOptions"
                  placeholder="选择平台"
                />
              </n-form-item>
            </div>
            <n-form-item label="游戏厂商">
              <n-input
                v-model:value="form.vendor"
                placeholder="例如: PG Soft / CQ9 / JILI"
              />
            </n-form-item>
            <div class="grid grid-cols-2 gap-4">
              <n-form-item label="基础域名">
                <n-input
                  v-model:value="form.baseUrl"
                  placeholder="例如: https://apis.msh.best"
                />
              </n-form-item>
              <n-form-item label="Endpoint">
                <n-input
                  v-model:value="form.endpoint"
                  placeholder="例如: /ley/gamelist"
                />
              </n-form-item>
            </div>
            <n-form-item label="接口地址">
              <n-input
                v-model:value="form.url"
                placeholder="自动拼接: 基础域名 + Endpoint"
                readonly
              />
            </n-form-item>
            <div class="grid grid-cols-2 gap-4">
              <n-form-item label="币种">
                <n-select
                  v-model:value="form.currency"
                  :options="currencyOptions"
                  style="width: 160px"
                />
              </n-form-item>
              <n-form-item label="根数组路径">
                <n-input
                  v-model:value="form.rootPath"
                  placeholder="响应中列表路径，如 data.list 或 results"
                />
              </n-form-item>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <n-form-item label="请求头">
                <n-dynamic-input
                  v-model:value="form.headers"
                  preset="pair"
                  key-placeholder="Header"
                  value-placeholder="Value"
                />
              </n-form-item>
              <n-form-item label="查询参数">
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
              label="请求Body(JSON)"
            >
              <n-input
                v-model:value="form.bodyText"
                type="textarea"
                :rows="6"
                placeholder='例如: { "page": 1, "pageSize": 100 }'
              />
            </n-form-item>

            <div class="flex gap-2">
              <n-button type="primary" :loading="loading" @click="sendRequest"
                >测试并解析</n-button
              >
              <n-button @click="resetAll" :disabled="loading">重置</n-button>
            </div>
          </n-form>
        </n-tab-pane>

        <n-tab-pane name="paste" tab="响应提取">
          <n-form label-placement="left" label-width="110">
            <n-form-item label="根数组路径">
              <n-input
                v-model:value="form.rootPath"
                placeholder="例如: data 或 results.items"
              />
            </n-form-item>
            <n-form-item label="响应原文">
              <n-input
                v-model:value="responseText"
                type="textarea"
                :rows="10"
                placeholder="将第三方接口返回的响应原文粘贴到这里 (JSON 字符串或对象)"
              />
            </n-form-item>
            <div class="flex gap-2">
              <n-button
                type="primary"
                :loading="loading"
                @click="parsePastedResponse"
                >解析响应</n-button
              >
              <n-button
                @click="
                  () => {
                    responseText = '';
                  }
                "
                :disabled="loading"
                >清空</n-button
              >
            </div>
          </n-form>
        </n-tab-pane>

        <n-tab-pane name="mapping" tab="字段映射与预览">
          <div v-if="sampleKeys.length === 0" class="text-gray-500">
            请先完成“测试并解析”。
          </div>
          <div v-else class="flex flex-col gap-4">
            <div class="grid grid-cols-2 gap-4">
              <n-form-item label="所属平台">
                <n-select
                  v-model:value="form.platformId"
                  :options="platformOptions"
                  placeholder="选择平台"
                />
              </n-form-item>
              <n-form-item label="游戏厂商">
                <n-input
                  v-model:value="form.vendor"
                  placeholder="例如: PG Soft / CQ9 / JILI"
                />
              </n-form-item>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <n-form-item label="游戏ID 字段">
                <n-select
                  v-model:value="mapping.gameId"
                  :options="pathOptions"
                  filterable
                  placeholder="选择或输入路径"
                />
              </n-form-item>
              <n-form-item label="中文名称 字段">
                <n-select
                  v-model:value="mapping.gameName"
                  :options="pathOptions"
                  filterable
                />
              </n-form-item>
              <n-form-item label="名称语言优先级">
                <n-select
                  v-model:value="nameKeyPriority"
                  multiple
                  :options="nameKeyOptions"
                  placeholder="选择语言优先级（可多选拖动排序）"
                />
              </n-form-item>
              <n-form-item label="英文名称 字段">
                <n-select
                  v-model:value="mapping.gameNameEn"
                  :options="pathOptions"
                  filterable
                />
              </n-form-item>
              <n-form-item label="游戏类型 字段">
                <n-select
                  v-model:value="mapping.gameType"
                  :options="pathOptions"
                  filterable
                />
              </n-form-item>
              <n-form-item label="图标URL 字段">
                <n-select
                  v-model:value="mapping.iconUrl"
                  :options="pathOptions"
                  filterable
                />
              </n-form-item>
            </div>

            <n-alert type="info" v-if="preview.length"
              >共解析 {{ preview.length }} 条，最多显示 50 条预览。</n-alert
            >
            <n-data-table
              :columns="previewColumns"
              :data="preview.slice(0, 50)"
              :scroll-x="900"
              size="small"
            />

            <div class="flex justify-end gap-2">
              <n-button @click="visible = false">取消</n-button>
              <n-button
                type="primary"
                :disabled="!form.platformId || preview.length === 0"
                :loading="importing"
                @click="doImport"
                >开始导入</n-button
              >
            </div>
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
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
  { title: '游戏ID', key: 'gameId', width: 140 },
  { title: '中文名称', key: 'gameName', width: 200 },
  { title: '英文名称', key: 'gameNameEn', width: 200 },
  { title: '类型', key: 'gameType', width: 120 },
  {
    title: '图标',
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
    notification.warning({ content: '请粘贴 cURL 命令' });
    return;
  }
  const parsed = parseCurl(curlText.value);
  applyParsedToForm(parsed);
  activeTab.value = 'request';
  notification.success({ content: '已解析到“请求设置”' });
}

async function handleTestCurl() {
  handleParseCurl();
  await sendRequest();
  activeTab.value = 'mapping';
}

async function sendRequest() {
  if (!form.url) {
    notification.warning({ content: '请输入接口地址' });
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
      notification.warning({ content: '未找到可解析的数组，请检查根路径' });
      return;
    }

    // collect keys (depth 1) for mapping options
    const first = arr[0] || {};
    const keys = new Set<string>();
    Object.keys(first).forEach((k) => keys.add(k));
    sampleKeys.value = Array.from(keys);

    buildPreview();
    notification.success({ content: '解析成功，请到“字段映射与预览”确认数据' });
  } catch (e: any) {
    console.error(e);
    notification.error({ content: e?.message || '请求失败' });
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
      notification.warning({ content: '未找到可解析的数组，请检查根路径' });
      return;
    }
    const first = arr[0] || {};
    const keys = new Set<string>();
    Object.keys(first).forEach((k) => keys.add(k));
    sampleKeys.value = Array.from(keys);
    buildPreview();
    activeTab.value = 'mapping';
    notification.success({ content: '解析成功，请到“字段映射与预览”确认数据' });
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
    notification.warning({ content: '请选择平台' });
    return;
  }
  if (preview.value.length === 0) {
    notification.warning({ content: '没有可导入的数据' });
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
      content: `导入完成：成功 ${success} 条，失败 ${failed} 条`,
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
