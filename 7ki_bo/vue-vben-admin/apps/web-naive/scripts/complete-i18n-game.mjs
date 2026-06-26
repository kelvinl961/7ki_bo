/**
 * Batch i18n replacements for game-management Vue files (template + script strings).
 * Run: node scripts/complete-i18n-game.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'src', 'views', 'game-management');

const files = [
  'virtual-bonus-pool/index.vue',
  'virtual-bonus-pool/components/VirtualBonusPoolForm.vue',
  'virtual-bonus-pool/components/VirtualBonusPoolDetail.vue',
  'virtual-bonus-pool/components/VirtualBonusPoolBulkForm.vue',
  'platform/index.vue',
  'platform/GamePublicConfigModal.vue',
  'subgame/index.vue',
  'subgame/GameImportDialog.vue',
  'subgame/ApiImportDialog.vue',
  'bet-records/index.vue',
  'game-statistics/index.vue',
  'hot-game/HotGameList.vue',
  'hot-game/HotGameEditDialog.vue',
];

const replacements = [
  [/import \{ ref,/g, "import { $t } from '@vben/locales';\n\nimport { ref,"],
  [/import \{ h, ref,/g, "import { $t } from '@vben/locales';\n\nimport { h, ref,"],
  [/import \{ h, onMounted,/g, "import { $t } from '@vben/locales';\n\nimport { h, onMounted,"],
  [/import \{ ref, reactive, computed/g, "import { $t } from '@vben/locales';\n\nimport { ref, reactive, computed"],
  [/import \{ computed, ref/g, "import { $t } from '@vben/locales';\n\nimport { computed, ref"],
  [/import \{ reactive, ref, computed/g, "import { $t } from '@vben/locales';\n\nimport { reactive, ref, computed"],
  [/import \{ onMounted, ref/g, "import { $t } from '@vben/locales';\n\nimport { onMounted, ref"],
  // Remove duplicate $t imports
  [/import \{ \$t \} from '@vben\/locales';\n\nimport \{ \$t \} from '@vben\/locales';\n\n/g, "import { $t } from '@vben/locales';\n\n"],
  [/title="子游戏管理"/g, ':title="$t(\'game.subgame.title\')"'],
  [/description="子游戏管理页面"/g, ':description="$t(\'game.subgame.desc\')"'],
  [/title="虚拟彩金池"/g, ':title="$t(\'game.virtualBonusPool.title\')"'],
  [/title="虚拟彩金池详情"/g, ':title="$t(\'game.virtualBonusPool.detailTitle\')"'],
  [/title="批量修改配置"/g, ':title="$t(\'game.virtualBonusPool.bulkEditTitle\')"'],
  [/<n-breadcrumb-item>游戏管理<\/n-breadcrumb-item>/g, '<n-breadcrumb-item>{{ $t(\'game.breadcrumb\') }}</n-breadcrumb-item>'],
  [/<n-breadcrumb-item>子游戏管理<\/n-breadcrumb-item>/g, '<n-breadcrumb-item>{{ $t(\'game.subgame.breadcrumb\') }}</n-breadcrumb-item>'],
  [/<n-breadcrumb-item>投注记录<\/n-breadcrumb-item>/g, '<n-breadcrumb-item>{{ $t(\'game.betRecords.breadcrumb\') }}</n-breadcrumb-item>'],
  [/label="游戏厂商"/g, ':label="$t(\'game.subgame.vendor\')"'],
  [/placeholder="选择游戏厂商"/g, ':placeholder="$t(\'game.subgame.selectVendor\')"'],
  [/label class="mb-2 text-sm font-medium">游戏类型<\/label>/g, 'label class="mb-2 text-sm font-medium">{{ $t(\'game.subgame.gameType\') }}</label>'],
  [/placeholder="选择游戏类型"/g, ':placeholder="$t(\'game.subgame.selectGameType\')"'],
  [/label class="mb-2 text-sm font-medium">平台名称<\/label>/g, 'label class="mb-2 text-sm font-medium">{{ $t(\'game.subgame.platformName\') }}</label>'],
  [/placeholder="选择平台"/g, ':placeholder="$t(\'game.subgame.selectPlatform\')"'],
  [/placeholder="选择币种"/g, ':placeholder="$t(\'game.subgame.selectCurrency\')"'],
  [/label class="mb-2 text-sm font-medium">游戏状态<\/label>/g, 'label class="mb-2 text-sm font-medium">{{ $t(\'game.subgame.gameStatus\') }}</label>'],
  [/placeholder="选择状态"/g, ':placeholder="$t(\'game.subgame.selectStatus\')"'],
  [/label class="mb-2 text-sm font-medium">热门标识<\/label>/g, 'label class="mb-2 text-sm font-medium">{{ $t(\'game.subgame.hotTag\') }}</label>'],
  [/placeholder="选择热门类型"/g, ':placeholder="$t(\'game.subgame.selectHotType\')"'],
  [/placeholder="搜索游戏ID、游戏名称\.\.\."/g, ':placeholder="$t(\'game.subgame.searchPlaceholder\')"'],
  [/>\s*导入游戏\s*</g, '>{{ $t(\'game.subgame.importGames\') }}<'],
  [/>\s*接口导入\s*</g, '>{{ $t(\'game.subgame.apiImport\') }}<'],
  [/>\s*新增游戏\s*</g, '>{{ $t(\'game.subgame.addGame\') }}<'],
  [/>\s*导出 CSV\s*</g, '>{{ $t(\'game.subgame.exportCsv\') }}<'],
  [/>\s*清空选择\s*</g, '>{{ $t(\'game.clearSelection\') }}<'],
  [/>\s*新增平台\s*</g, '>{{ $t(\'game.platform.addPlatform\') }}<'],
  [/>\s*游戏公共配置\s*</g, '>{{ $t(\'game.platform.publicConfig\') }}<'],
  [/placeholder="搜索平台ID、平台名称\.\.\."/g, ':placeholder="$t(\'game.platform.searchPlaceholder\')"'],
  [/label class="mb-2 text-sm font-medium">平台状态<\/label>/g, 'label class="mb-2 text-sm font-medium">{{ $t(\'game.platform.platformStatus\') }}</label>'],
  [/>\s*批量修改配置\s*</g, '>{{ $t(\'game.virtualBonusPool.bulkEditConfig\') }}<'],
  [/label class="mb-2 text-sm font-medium">虚拟彩金池ID<\/label>/g, 'label class="mb-2 text-sm font-medium">{{ $t(\'game.virtualBonusPool.poolId\') }}</label>'],
  [/placeholder="输入虚拟彩金池ID"/g, ':placeholder="$t(\'game.virtualBonusPool.enterPoolId\')"'],
  [/label class="mb-2 text-sm font-medium">展示形式<\/label>/g, 'label class="mb-2 text-sm font-medium">{{ $t(\'game.virtualBonusPool.displayType\') }}</label>'],
  [/placeholder="选择展示形式"/g, ':placeholder="$t(\'game.virtualBonusPool.selectDisplayType\')"'],
  [/>\s*全选当前页\s*</g, '>{{ $t(\'game.virtualBonusPool.selectAllPage\') }}<'],
  [/message\.error\('加载数据失败'\)/g, "message.error($t('game.loadFailed'))"],
  [/message\.success\('删除成功'\)/g, "message.success($t('common.deleteSuccess'))"],
  [/message\.error\('删除失败'\)/g, "message.error($t('common.operationFailed'))"],
  [/message\.success\('创建成功'\)/g, "message.success($t('common.operationSuccess'))"],
  [/message\.success\('更新成功'\)/g, "message.success($t('common.saveSuccess'))"],
  [/message\.error\('操作失败'\)/g, "message.error($t('common.operationFailed'))"],
  [/tab="投注明细"/g, ':tab="$t(\'game.betRecords.detailsTab\')"'],
  [/title="投注记录"/g, ':title="$t(\'game.betRecords.title\')"'],
  [/description="游戏投注交易记录查询"/g, ':description="$t(\'game.betRecords.desc\')"'],
  [/title="游戏类型\/渠道"/g, ':title="$t(\'game.statistics.title\')"'],
  [/label="查询"/g, ':label="$t(\'game.statistics.query\')"'],
  [/value="day">日<\/n-radio-button>/g, 'value="day">{{ $t(\'game.statistics.day\') }}</n-radio-button>'],
  [/value="week">周<\/n-radio-button>/g, 'value="week">{{ $t(\'game.statistics.week\') }}</n-radio-button>'],
  [/value="month">月<\/n-radio-button>/g, 'value="month">{{ $t(\'game.statistics.month\') }}</n-radio-button>'],
  [/placeholder="选择开始和结束日期"/g, ':placeholder="$t(\'game.statistics.selectDateRange\')"'],
  [/>\s*搜索\s*<\/n-button>\s*\n\s*<n-button @click="resetFilters">/g, '>{{ $t(\'common.search\') }}</n-button>\n              <n-button @click="resetFilters">'],
  [/>\s*导出报表\s*</g, '>{{ $t(\'game.statistics.exportReport\') }}<'],
  [/<span>游戏类型统计<\/span>/g, '<span>{{ $t(\'game.statistics.gameTypeStats\') }}</span>'],
  [/正在加载数据\.\.\./g, "{{ $t('game.statistics.loadingData') }}"],
  [/description="暂无数据"/g, ':description="$t(\'game.statistics.noData\')"'],
  [/title: '排序'/g, "title: $t('game.subgame.sortOrder')"],
  [/title: '平台名称'/g, "title: $t('game.subgame.platformName')"],
  [/title: '游戏厂商'/g, "title: $t('game.subgame.vendor')"],
  [/title: '游戏ID'/g, "title: $t('game.subgame.gameId')"],
  [/title: '显示ID'/g, "title: $t('game.subgame.displayId')"],
  [/title: '游戏名称'/g, "title: $t('game.subgame.gameNameZh')"],
  [/title: '游戏类型'/g, "title: $t('game.subgame.gameType')"],
  [/title: '游戏图标'/g, "title: $t('game.subgame.iconLabel')"],
  [/title: '币种'/g, "title: $t('common.currency')"],
  [/title: '热门一'/g, "title: $t('game.subgame.hot1')"],
  [/title: '热门二'/g, "title: $t('game.subgame.hot2')"],
  [/title: '推荐'/g, "title: $t('game.subgame.recommended')"],
  [/title: '游戏开关'/g, "title: $t('game.subgame.gameSwitch')"],
  [/title: '维护状态'/g, "title: $t('game.subgame.maintenanceStatus')"],
  [/title: '展示给主播'/g, "title: $t('game.subgame.showToStreamer')"],
  [/title: '创建时间'/g, "title: $t('common.createTime')"],
  [/title: '操作'/g, "title: $t('common.actions')"],
  [/\{ default: \(\) => '编辑' \}/g, "{ default: () => $t('common.edit') }"],
  [/\{ default: \(\) => '删除' \}/g, "{ default: () => $t('common.delete') }"],
  [/\{ default: \(\) => '详情' \}/g, "{ default: () => $t('common.detail') }"],
  [/\{ default: \(\) => '修改' \}/g, "{ default: () => $t('common.modify') }"],
  [/\{ default: \(\) => '置顶' \}/g, "{ default: () => $t('game.virtualBonusPool.pinToTop') }"],
  [/return h\('span', \{ class: 'text-gray-400' \}, '无图标'\)/g, "return h('span', { class: 'text-gray-400' }, $t('game.virtualBonusPool.noIcon'))"],
  [/default: \(\) => \(row\.isUnderMaintenance \? '维护中' : '正常'\)/g, "default: () => (row.isUnderMaintenance ? $t('game.virtualBonusPool.underMaintenance') : $t('game.virtualBonusPool.maintenanceNormal'))"],
  [/label="展示方式"/g, ':label="$t(\'game.virtualBonusPool.displayMethod\')"'],
  [/label="展示位置"/g, ':label="$t(\'game.virtualBonusPool.displayPosition\')"'],
  [/label="点击跳转位置"/g, ':label="$t(\'game.virtualBonusPool.clickTarget\')"'],
  [/label="最大显示金额"/g, ':label="$t(\'game.virtualBonusPool.maxAmount\')"'],
  [/label="最小显示金额"/g, ':label="$t(\'game.virtualBonusPool.minAmount\')"'],
  [/label="小数点位数"/g, ':label="$t(\'game.virtualBonusPool.decimalPlaces\')"'],
  [/label="金额数字样式"/g, ':label="$t(\'game.virtualBonusPool.numberStyle\')"'],
  [/label="背景风格"/g, ':label="$t(\'game.virtualBonusPool.backgroundStyle\')"'],
  [/label="实时预览"/g, ':label="$t(\'game.virtualBonusPool.livePreview\')"'],
  [/template #unchecked>禁用<\/template>/g, '<template #unchecked>{{ $t(\'common.disabled\') }}</template>'],
  [/>\s*确认\s*<\/n-button>/g, '>{{ $t(\'game.virtualBonusPool.confirm\') }}</n-button>'],
  [/>\s*播放动画\s*</g, '>{{ $t(\'game.virtualBonusPool.playAnimation\') }}<'],
  [/h\('strong', \{\}, '合计'\)/g, "h('strong', {}, $t('game.statisticsExtra.totalRow'))"],
  [/prefix: \(info[^)]+\) => `共 \$\{info\.itemCount[^`]+\}`/g, "prefix: (info) => $t('game.statisticsExtra.prefixTotal', [info.itemCount || 0])"],
];

for (const rel of files) {
  const fp = path.join(root, rel);
  if (!fs.existsSync(fp)) {
    console.warn('skip missing', rel);
    continue;
  }
  let content = fs.readFileSync(fp, 'utf8');
  if (!content.includes("from '@vben/locales'") && !content.includes('$t(')) {
    // will add via replacements
  }
  for (const [from, to] of replacements) {
    content = content.replace(from, to);
  }
  // Ensure single $t import
  content = content.replace(/(import \{ \$t \} from '@vben\/locales';\n\n)+/g, "import { $t } from '@vben/locales';\n\n");
  fs.writeFileSync(fp, content);
  console.log('updated', rel);
}

console.log('done');
