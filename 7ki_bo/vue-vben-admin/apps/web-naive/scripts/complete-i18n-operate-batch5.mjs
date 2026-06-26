import fs from 'fs';
import path from 'path';

const CD = 'operations.domain.createDomain';
const BC = 'operations.domain.batchCacheExt';
const TS = 'operations.domain.trafficStats';

const replacements = [
  // CreateDomainModal
  [/\{\{ node\.count \}\}条/g, "{{ $t('operations.domain.createDomain.recordsCount', [node.count]) }}"],
  [/>\s*开通\s*</g, ">{{ $t('operations.domain.createDomain.activate') }}<"],
  [/<span>主域名<\/span>/g, '<span>{{ $t(\'operations.domain.createDomain.mainDomain\') }}</span>'],
  [
    /placeholder="支持批量添加，最多20个，多个域名请换行，例如：&#10;123\.com&#10;123\.com\.hk&#10;123\.in"/g,
    ':placeholder="$t(\'operations.domain.createDomain.mainDomainPlaceholder\')"',
  ],
  [/>\s*使用场景\s*</g, ">{{ $t('operations.domain.createDomain.usageScenario') }}<"],
  [/>\s*使用场景说明\s*</g, ">{{ $t('operations.domain.createDomain.usageScenarioHint') }}<"],
  [/<n-radio value="CLUB_ONLY">仅俱乐部<\/n-radio>/g, '<n-radio value="CLUB_ONLY">{{ $t(\'operations.domain.createDomain.clubOnly\') }}</n-radio>'],
  [
    /<n-radio value="PC_AGENT_BACKEND">仅PC\{\{ \$t\('operations\.layout\.agent'\) \}\}后台<\/n-radio>/g,
    '<n-radio value="PC_AGENT_BACKEND">{{ $t(\'operations.domain.createDomain.pcAgentBackend\') }}</n-radio>',
  ],
  [
    /<div class="tutorial-title">收费和使用法教程：<\/div>/g,
    '<div class="tutorial-title">{{ $t(\'operations.domain.createDomain.tutorialTitle\') }}</div>',
  ],
  [
    /<div class="tutorial-label">1、限顶级域名：<\/div>/g,
    '<div class="tutorial-label">{{ $t(\'operations.domain.createDomain.topLevelOnly\') }}</div>',
  ],
  [
    /此处只能添加独立的顶级域名，请勿添加子域名，例如：只能添加123\.com，不是www\.123\.com。详见:/g,
    "{{ $t('operations.domain.createDomain.topLevelDesc') }}",
  ],
  [/>域名管理教程</g, ">{{ $t('operations.domain.createDomain.domainTutorial') }}"],
  [
    /<div class="tutorial-label">2、节点使用教程：<\/div>/g,
    '<div class="tutorial-label">{{ $t(\'operations.domain.createDomain.nodeTutorial\') }}</div>',
  ],
  [
    /<strong>\(1\) 中国市场 \(含港澳台\)：<\/strong>[\s\S]*?大陆阿里云。/g,
    "<strong>{{ $t('operations.domain.createDomain.chinaMarket') }}</strong> {{ $t('operations.domain.createDomain.chinaMarketDesc') }}",
  ],
  [
    /<strong>\(2\) 全球市场 \(即非中国\)：<\/strong>[\s\S]*?Yundun \(云盾\)。/g,
    "<strong>{{ $t('operations.domain.createDomain.globalMarket') }}</strong> {{ $t('operations.domain.createDomain.globalMarketDesc') }}",
  ],
  [
    /<strong>\(3\) Wangsu独立IP：<\/strong>[\s\S]*?系统自动回收。/g,
    "<strong>{{ $t('operations.domain.createDomain.wangsuIp') }}</strong> {{ $t('operations.domain.createDomain.wangsuIpDesc') }}",
  ],
  [
    /<strong>\(4\) 开放回源：<\/strong>[\s\S]*?详见域名管理教程。/g,
    "<strong>{{ $t('operations.domain.createDomain.openOrigin') }}</strong> {{ $t('operations.domain.createDomain.openOriginDesc') }}",
  ],
  [/\{ text: '顶级版', type: 'success' \}/g, "{ text: $t('operations.domain.createDomain.badgePremium'), type: 'success' }"],
  [/\{ text: '全球', type: 'info' \}/g, "{ text: $t('operations.domain.createDomain.badgeGlobal'), type: 'info' }"],
  [/\{ text: '国际', type: 'success' \}/g, "{ text: $t('operations.domain.createDomain.badgeIntl'), type: 'success' }"],
  [/\{ text: '维护中', type: 'default' \}/g, "{ text: $t('operations.domain.createDomain.badgeMaintaining'), type: 'default' }"],
  [/\{ text: '防封', type: 'warning' \}/g, "{ text: $t('operations.domain.createDomain.badgeAntiBlock'), type: 'warning' }"],
  [/label: '华为云'/g, "label: $t('operations.domain.cdn.huawei')"],
  [/label: 'AWS防封'/g, "label: $t('operations.domain.createDomain.awsAntiBlock')"],
  [
    /message: \$t\('common\.pleaseEnter'\) \+ '主域名'/g,
    "message: $t('common.pleaseEnterField', [$t('operations.domain.createDomain.validateMainDomain')])",
  ],
  [
    /message: \$t\('common\.pleaseSelect'\) \+ '使用场景'/g,
    "message: $t('common.pleaseSelect') + ' ' + $t('operations.domain.createDomain.usageScenario')",
  ],
  [/domainsError\.value = '请输入主域名'/g, "domainsError.value = $t('operations.domain.createDomain.enterMainDomain')"],
  [/domainsError\.value = '最多只能添加20个域名'/g, "domainsError.value = $t('operations.domain.createDomain.maxDomains')"],
  [
    /domainsError\.value = `域名格式错误: \$\{domain\}`/g,
    "domainsError.value = $t('operations.domain.createDomain.invalidFormat', [domain])",
  ],
  [
    /domainsError\.value = `请勿添加www子域名: \$\{domain\}。只添加顶级域名，如: \$\{domain\.replace\('www\.', ''\)\}`/g,
    "domainsError.value = $t('operations.domain.createDomain.noWwwSubdomain', [domain, domain.replace('www.', '')])",
  ],
  [
    /message\.info\(`开通 \$\{node\.label\} 功能即将上线`\)/g,
    "message.info($t('operations.domain.createDomain.activateComingSoon', [node.label]))",
  ],
  [/message\.info\('域名管理教程即将上线'\)/g, "message.info($t('operations.domain.createDomain.tutorialComingSoon'))"],
  [/message\.warning\('请选择已开通的CDN节点'\)/g, "message.warning($t('operations.domain.createDomain.selectActivatedNode'))"],
  [
    /message\.success\(`成功创建 \$\{successful\.length\} 个域名`\)/g,
    "message.success($t('operations.domain.createDomain.createSuccess', [successful.length]))",
  ],
  [
    /\(r: any\) => r\.reason\?\.message \|\| '未知错误'/g,
    "(r: any) => r.reason?.message || $t('operations.unknownError')",
  ],
  [
    /`成功创建 \$\{successful\.length\} 个域名，\$\{failed\.length\} 个失败：\$\{failedDomains\.join\('; '\)\}`/g,
    "$t('operations.domain.createDomain.createPartial', [successful.length, failed.length, failedDomains.join('; ')])",
  ],
  [
    /message\.error\(error\.response\?\.data\?\.message \|\| error\.message \|\| '创建失败'\)/g,
    "message.error(error.response?.data?.message || error.message || $t('operations.domain.createDomain.createFailed'))",
  ],

  // BatchCacheView hints
  [
    /每行输入一个完整URL，例如：https:\/\/www\.example\.com\/image\/logo\.png/g,
    "{{ $t('operations.domain.batchCacheExt.urlHint1') }}",
  ],
  [/<div>• 支持HTTP和HTTPS协议<\/div>/g, '<div>• {{ $t(\'operations.domain.batchCacheExt.urlHint2\') }}</div>'],
  [/<div>• 每次最多提交1000条URL<\/div>/g, '<div>• {{ $t(\'operations.domain.batchCacheExt.urlHint3\') }}</div>'],
  [
    /<span style="color: #666"> \/ \{\{ urlUsage\.total \}\} 条<\/span>/g,
    '<span style="color: #666"> / {{ urlUsage.total }}{{ $t(\'operations.domain.batchCacheExt.itemsUnit\') }}</span>',
  ],
  [
    /<span style="color: #666"> 条<\/span>/g,
    '<span style="color: #666">{{ $t(\'operations.domain.batchCacheExt.itemsUnit\') }}</span>',
  ],
  [
    /每行输入一个完整目录路径，例如：https:\/\/www\.example\.com\/images\//g,
    "{{ $t('operations.domain.batchCacheExt.dirHint1') }}",
  ],
  [/<div>• 目录路径必须以 \/ 结尾<\/div>/g, '<div>• {{ $t(\'operations.domain.batchCacheExt.dirHint2\') }}</div>'],
  [
    /<div>• 将清除该目录下的所有资源缓存<\/div>/g,
    '<div>• {{ $t(\'operations.domain.batchCacheExt.dirHint3\') }}</div>',
  ],
  [/<div>• 每次最多提交10个目录<\/div>/g, '<div>• {{ $t(\'operations.domain.batchCacheExt.dirHint4\') }}</div>'],
  [
    /\/ \{\{ directoryUsage\.total \}\} 个<\/span/g,
    "/ {{ directoryUsage.total }}{{ $t('operations.domain.batchCacheExt.dirsUnit') }}</span",
  ],
  [
    /<span style="color: #666"> 个<\/span>/g,
    '<span style="color: #666">{{ $t(\'operations.domain.batchCacheExt.dirsUnit\') }}</span>',
  ],
  [/<span style="font-weight: 600">刷新记录<\/span>/g, '<span style="font-weight: 600">{{ $t(\'operations.domain.batchCacheExt.refreshHistory\') }}</span>'],
  [/title: '刷新类型'/g, "title: $t('operations.domain.batchCacheExt.refreshType')"],
  [/default: \(\) => \(row\.type === 'URL' \? 'URL刷新' : '目录刷新'\)/g, "default: () => (row.type === 'URL' ? $t('operations.domain.batchCacheExt.urlRefresh') : $t('operations.domain.batchCacheExt.dirRefresh'))"],
  [/title: '刷新数量'/g, "title: $t('operations.domain.batchCacheExt.refreshCount')"],
  [/PENDING: \{ text: '等待中', type: 'default' \}/g, "PENDING: { text: $t('operations.domain.batchCacheExt.statusPending'), type: 'default' }"],
  [/PROCESSING: \{ text: '处理中', type: 'info' \}/g, "PROCESSING: { text: $t('operations.domain.batchCacheExt.statusProcessing'), type: 'info' }"],
  [/SUCCESS: \{ text: '成功', type: 'success' \}/g, "SUCCESS: { text: $t('operations.domain.batchCacheExt.statusSuccess'), type: 'success' }"],
  [/FAILED: \{ text: '失败', type: 'error' \}/g, "FAILED: { text: $t('operations.domain.batchCacheExt.statusFailed'), type: 'error' }"],
  [/title: '提交时间'/g, "title: $t('operations.domain.batchCacheExt.submitTime')"],
  [/title: '完成时间'/g, "title: $t('operations.domain.batchCacheExt.completeTime')"],
  [/message\.warning\('请输入要刷新的地址'\)/g, "message.warning($t('operations.domain.batchCacheExt.enterAddress'))"],
  [
    /`每次最多提交 \$\{maxCount\} 条\$\{type === 'url' \? 'URL' : '目录'\}`/g,
    "$t('operations.domain.batchCacheExt.maxSubmit', [maxCount, type === 'url' ? 'URL' : $t('operations.domain.batchCacheExt.directoryTab')])",
  ],
  [
    /message\.error\(`发现 \$\{invalidLines\.length\} 条无效的地址格式`\)/g,
    "message.error($t('operations.domain.batchCacheExt.invalidFormat', [invalidLines.length]))",
  ],
  [/message\.error\('目录路径必须以 \/ 结尾'\)/g, "message.error($t('operations.domain.batchCacheExt.dirMustEndSlash'))"],
  [
    /`成功提交 \$\{lines\.length\} 条\$\{type === 'url' \? 'URL' : '目录'\}刷新任务`/g,
    "$t('operations.domain.batchCacheExt.submitSuccess', [lines.length, type === 'url' ? $t('operations.domain.batchCacheExt.urlRefresh') : $t('operations.domain.batchCacheExt.dirRefresh')])",
  ],
  [/message\.error\('刷新任务提交失败'\)/g, "message.error($t('operations.domain.batchCacheExt.submitFailed'))"],
  [/message\.success\('已清空'\)/g, "message.success($t('operations.domain.batchCacheExt.cleared'))"],
  [/message\.error\('获取刷新记录失败'\)/g, "message.error($t('operations.domain.batchCacheExt.fetchHistoryFailed'))"],

  // TrafficStatsView
  [
    /<span style="font-size: 16px; font-weight: 600">流量统计<\/span>/g,
    '<span style="font-size: 16px; font-weight: 600">{{ $t(\'operations.domain.trafficStats.title\') }}</span>',
  ],
  [/>\s*导出报表\s*</g, ">{{ $t('common.exportReport') }}<"],
  [/title="子域名详情"/g, ':title="$t(\'operations.domain.trafficStats.subdomainDetail\')"'],
  [
    />月份：\{\{ selectedMonth \}\}<\/span/g,
    ">{{ $t('operations.domain.trafficStats.monthLabel', [selectedMonth]) }}</span",
  ],
  [
    />子域名数量：\{\{ selectedDomainCount \}\}<\/span/g,
    ">{{ $t('operations.domain.trafficStats.subdomainCount', [selectedDomainCount]) }}</span",
  ],
  [/title: '总费用\(BRL\)'/g, "title: $t('operations.domain.trafficStats.totalCostBrl')"],
  [/h\('span', \{\}, 'CDN节点 '\)/g, "h('span', {}, $t('operations.domain.trafficStats.cdnNodeCount') + ' ')"],
  [/default: \(\) => '本月启用的 CDN 节点数量'/g, "default: () => $t('operations.domain.trafficStats.cdnNodeTooltip')"],
  [/title: '节点费用\(BRL\)'/g, "title: $t('operations.domain.trafficStats.nodeCostBrl')"],
  [/h\('span', \{\}, '免费流量\(GB\) '\)/g, "h('span', {}, $t('operations.domain.trafficStats.freeTrafficGb') + ' ')"],
  [/default: \(\) => '平台赠送的免费流量'/g, "default: () => $t('operations.domain.trafficStats.freeTrafficTooltip')"],
  [/title: '已使用\(GB\)'/g, "title: $t('operations.domain.trafficStats.usedGb')"],
  [/message\.info\('查看流量详情'\)/g, "message.info($t('operations.domain.trafficStats.viewTrafficDetail'))"],
  [/title: '超出用量\(GB\)'/g, "title: $t('operations.domain.trafficStats.exceededGb')"],
  [/title: '超出单价\(1GB\/月\)'/g, "title: $t('operations.domain.trafficStats.exceededUnitPrice')"],
  [/title: '超出费用\(BRL\)'/g, "title: $t('operations.domain.trafficStats.exceededCostBrl')"],
  [/h\('span', \{\}, '免费子域名\(个\) '\)/g, "h('span', {}, $t('operations.domain.trafficStats.freeSubdomains') + ' ')"],
  [/default: \(\) => '本月免费子域名额度数量'/g, "default: () => $t('operations.domain.trafficStats.freeSubdomainTooltip')"],
  [/h\('span', \{\}, '子域名\(个\) '\)/g, "h('span', {}, $t('operations.domain.trafficStats.subdomainCountCol') + ' ')"],
  [/default: \(\) => '实际使用的子域名数量'/g, "default: () => $t('operations.domain.trafficStats.subdomainUsedTooltip')"],
  [/title: '超出数量\(个\)'/g, "title: $t('operations.domain.trafficStats.exceededCount')"],
  [/title: '超出单价\(个\/月\)'/g, "title: $t('operations.domain.trafficStats.exceededUnitPriceItem')"],
  [/h\('span', \{\}, '独立IP\(个\) '\)/g, "h('span', {}, $t('operations.domain.trafficStats.independentIp') + ' ')"],
  [/default: \(\) => '独立IP数量'/g, "default: () => $t('operations.domain.trafficStats.ipCountTooltip')"],
  [/title: 'IP费用\(1个\/月\)'/g, "title: $t('operations.domain.trafficStats.ipCostMonthly')"],
  [/title: 'IP费用'/g, "title: $t('operations.domain.trafficStats.ipCost')"],
  [/message\.info\('暂无流量统计数据'\)/g, "message.info($t('operations.domain.trafficStats.noStats'))"],
  [
    /message\.info\(`查看 \$\{row\.date\} 的详细数据`\)/g,
    "message.info($t('operations.domain.trafficStats.viewDateDetail', [row.date]))",
  ],
  [/\? '正常'/g, "? $t('operations.domain.trafficStats.statusNormal')"],
  [/\? '停用'/g, "? $t('operations.domain.trafficStats.statusDisabled')"],
  [/\? '已过期'/g, "? $t('operations.domain.trafficStats.statusExpired')"],
  [/ : '异常'/g, " : $t('operations.domain.trafficStats.statusAbnormal')"],
];

function walk(dir, files = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, files);
    else if (p.endsWith('.vue')) files.push(p);
  }
  return files;
}

const files = walk('src/views/operateManager');
let updated = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const orig = content;
  for (const [from, to] of replacements) content = content.replace(from, to);
  if (content !== orig && content.includes('<script') && !content.includes("from '@vben/locales'")) {
    content = content.replace(/(<script setup lang="ts">\r?\n)/, "$1import { $t } from '@vben/locales';\n\n");
  }
  if (content !== orig) {
    fs.writeFileSync(file, content);
    updated++;
    console.log('Updated:', file);
  }
}
console.log('Done:', updated);
