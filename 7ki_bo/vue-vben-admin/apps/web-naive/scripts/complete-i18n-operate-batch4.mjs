import fs from 'fs';
import path from 'path';

const ROOT = 'src/views/operateManager';
const CS = 'operations.domain.createSubdomain';
const BC = 'operations.domain.batchCacheExt';
const MS = 'operations.messageSettings';
const FM = 'operations.form';

const replacements = [
  // Quick fixes
  [
    />检测节点响应无法优化的IP地址如下（DNS污染），建议更换域名：</g,
    ">{{ $t('operations.healthCheck.dnsPollutionHint') }}",
  ],
  [
    /下载站域名绑定\{\{ \$t\('operations\.layout\.agent'\) \}\}优先级：APP内部识别 > 渠道ID强制绑定 > 域名绑定/g,
    "{{ $t('operations.domain.modal.bindAgentHint2') }}: APP > {{ $t('operations.domain.modal.bindAgentPriority2') }} > {{ $t('operations.domain.modal.bindAgentPriority3') }}",
  ],
  [
    /\(\) => \(isDisabled \? '已停用' : '启用成功'\)/g,
    "() => (isDisabled ? $t('operations.messageSettings.option.statusDisabled') : $t('operations.domain.status.enabledSuccess'))",
  ],

  // CreateSubdomainModal template
  [/label="选择节点"/g, `:label="$t('${CS}.selectNode')"`],
  [/label="选择域名"/g, `:label="$t('${CS}.selectDomain')"`],
  [
    /description="该CDN节点下暂无可用域名，请先在域名管理中创建域名"/g,
    `:description="$t('${CS}.noDomains')"`,
  ],
  [/label="域名用途"/g, `:label="$t('${CS}.domainPurpose')"`],
  [
    />该类型域名对业务至关重要，停用或删除时请慎重操作。随意或错删可能会影响老用户访问和业务稳定性。</g,
    ">{{ $t('operations.domain.createSubdomain.purposeWarning') }}",
  ],
  [/label="生效域名"/g, `:label="$t('${CS}.activeDomain')"`],
  [
    /placeholder='例如，"@"代表主域名，或"www"、"api"等'/g,
    `:placeholder="$t('${CS}.prefixPlaceholder')"`,
  ],
  [/>域名设置</g, ">{{ $t('operations.domain.createSubdomain.domainSettings') }}"],
  [/label="作为推广域名"/g, `:label="$t('${CS}.asPromotion')"`],
  [
    />将该域名作为前台\{\{ \$t\('operations\.layout\.agent'\) \}\}推广专用地址/g,
    ">{{ $t('operations.domain.createSubdomain.promotionCheckbox') }}",
  ],
    [
    />必须保持至少一条域名开启该功能。推广域名便于\{\{ \$t\('operations\.layout\.agent'\) \}\}推广使用和流量分发。</g,
    ">{{ $t('operations.domain.createSubdomain.promotionRule') }}",
  ],
  [/label="启用入口"/g, `:label="$t('${CS}.enabledEntrance')"`],
  [
    /<strong>全部（默认）<\/strong> - 所有用户均可访问，无限制/g,
    "<strong>{{ $t('operations.domain.entrance.all') }}</strong> - {{ $t('operations.domain.createSubdomain.entranceAll').split(' - ')[1] || $t('operations.domain.createSubdomain.entranceAll') }}",
  ],
  // Simpler entrance replacements
  [
    /<n-radio value="ALL">\s*<strong>全部（默认）<\/strong> - 所有用户均可访问，无限制\s*<\/n-radio>/g,
    '<n-radio value="ALL">{{ $t(\'operations.domain.createSubdomain.entranceAll\') }}</n-radio>',
  ],
  [
    /<n-radio value="APP_ONLY">\s*<strong>仅极速APP<\/strong> - 该域名只能通过极速 APP\s*访问，网页端无法直接访问\s*<\/n-radio>/g,
    '<n-radio value="APP_ONLY">{{ $t(\'operations.domain.createSubdomain.entranceAppOnly\') }}</n-radio>',
  ],
  [
    /<n-radio value="H5_PWA">\s*<strong>H5和PWA<\/strong> - 仅允许 H5 和 PWA\s*访问，但不会出现在轮巡列表\s*<\/n-radio>/g,
    '<n-radio value="H5_PWA">{{ $t(\'operations.domain.createSubdomain.entranceH5Pwa\') }}</n-radio>',
  ],
  [
    /<strong>支持启用入口的CDN节点：<\/strong\s*>\s*阿里云、Funnull、Cloudflare \(CF\)、Yundun、Wangsu-CDN、腾讯云、AWS/g,
    "<strong>{{ $t('operations.domain.createSubdomain.entranceCdnSupport') }}</strong> {{ $t('operations.domain.createSubdomain.entranceCdnList') }}",
  ],
  [/label="屏蔽设备"/g, `:label="$t('${CS}.blockedDevice')"`],
  [
    /<n-radio value="NONE">\s*<strong>都不屏蔽（默认）<\/strong> - 所有设备均可访问\s*<\/n-radio>/g,
    '<n-radio value="NONE">{{ $t(\'operations.domain.createSubdomain.deviceNone\') }}</n-radio>',
  ],
  [
    /<n-radio value="BLOCK_MOBILE">\s*<strong>屏蔽手机端<\/strong> -\s*PC端可访问，移动端（安卓\/iOS）不可访问\s*<\/n-radio>/g,
    '<n-radio value="BLOCK_MOBILE">{{ $t(\'operations.domain.createSubdomain.deviceBlockMobile\') }}</n-radio>',
  ],
  [
    /<n-radio value="BLOCK_PC">\s*<strong>屏蔽PC端<\/strong> -\s*移动端（安卓\/iOS）可访问，PC端不可访问\s*<\/n-radio>/g,
    '<n-radio value="BLOCK_PC">{{ $t(\'operations.domain.createSubdomain.deviceBlockPc\') }}</n-radio>',
  ],
  [
    /<strong>支持屏蔽设备的CDN节点：<\/strong\s*>\s*阿里云、Funnull、Cloudflare \(CF\)、Yundun、Wangsu-CDN、腾讯云、AWS/g,
    "<strong>{{ $t('operations.domain.createSubdomain.deviceCdnSupport') }}</strong> {{ $t('operations.domain.createSubdomain.entranceCdnList') }}",
  ],
  [/placeholder="请输入备注"/g, ':placeholder="$t(\'common.pleaseEnterField\', [$t(\'common.remark\')])"'],
  [/label="域名配置参考建议："/g, `:label="$t('${CS}.configAdvice')"`],
  [/>详见: 域名管理教程</g, ">{{ $t('operations.domain.createSubdomain.seeTutorial') }}"],
  [
    /<strong>（1）多节点组合：<\/strong\s*>[\s\S]*?WEB大厅、APP大厅、OSS加速和后端加速域名。/g,
    "<strong>{{ $t('operations.domain.createSubdomain.tip1Title') }}</strong>{{ $t('operations.domain.createSubdomain.tip1') }}",
  ],
  [
    /<strong>（2）不是越多越好：<\/strong\s*>[\s\S]*?避免网络检测浪费太多时间。/g,
    "<strong>{{ $t('operations.domain.createSubdomain.tip2Title') }}</strong>{{ $t('operations.domain.createSubdomain.tip2') }}",
  ],
  [
    /<strong>（3）如何备用：<\/strong\s*>[\s\S]*?等未来再快速启用。/g,
    "<strong>{{ $t('operations.domain.createSubdomain.tip3Title') }}</strong>{{ $t('operations.domain.createSubdomain.tip3') }}",
  ],
  [
    /<strong>（4）主域名说明：<\/strong\s*>[\s\S]*?才算真正启用。/g,
    "<strong>{{ $t('operations.domain.createSubdomain.tip4Title') }}</strong>{{ $t('operations.domain.createSubdomain.tip4') }}",
  ],
  [
    /<strong>（5）子域名说明：<\/strong\s*>[\s\S]*?避免浪费无用功。/g,
    "<strong>{{ $t('operations.domain.createSubdomain.tip5Title') }}</strong>{{ $t('operations.domain.createSubdomain.tip5') }}",
  ],
  [
    /<strong>（6）大陆市场特别规则：<\/strong\s*>[\s\S]*?可以作为URL跳转。/g,
    "<strong>{{ $t('operations.domain.createSubdomain.tip6Title') }}</strong>{{ $t('operations.domain.createSubdomain.tip6') }}",
  ],
  [/>\s*确认\s*</g, ">{{ $t('common.confirm') }}<"],

  // CreateSubdomainModal script
  [
    /const useTypeLabel = computed\(\(\) => props\.useTypeLabel \|\| 'Web大厅'\)/g,
    "const useTypeLabel = computed(() => props.useTypeLabel || $t('operations.domain.createSubdomain.defaultWebHall'))",
  ],
  [
    /const modalTitle = computed\(\(\) => props\.modalTitle \|\| '新增Web大厅子域名'\)/g,
    "const modalTitle = computed(() => props.modalTitle || $t('operations.domain.createSubdomain.defaultModalTitle'))",
  ],
  [
    /message\.warning\('获取域名列表失败，请稍后重试'\)/g,
    "message.warning($t('operations.domain.createSubdomain.fetchDomainsFailed'))",
  ],
  [
    /\{ required: true, message: \$t\('common\.pleaseSelect'\) \+ '节点', trigger: 'change' \}/g,
    "{ required: true, message: $t('common.pleaseSelect') + ' ' + $t('operations.domain.createSubdomain.selectNode'), trigger: 'change' }",
  ],
  [
    /\{ required: true, message: \$t\('common\.pleaseSelect'\) \+ '域名', trigger: 'change' \}/g,
    "{ required: true, message: $t('common.pleaseSelect') + ' ' + $t('operations.domain.createSubdomain.selectDomain'), trigger: 'change' }",
  ],
  [/prefix === '根域名'/g, "prefix === $t('operations.domain.createSubdomain.rootDomain')"],
  [
    /`成功创建 \$\{subdomains\.length\} 个子域名，\$\{errors\.length\} 个失败：\$\{errors\.join\('; '\)\}`/g,
    "$t('operations.domain.createSubdomain.createPartialSuccess', [subdomains.length, errors.length, errors.join('; ')])",
  ],

  // BatchCacheView
  [/tab="URL清理缓存"/g, `:tab="$t('${BC}.urlTab')"`],
  [/tab="目录清理缓存"/g, `:tab="$t('${BC}.directoryTab')"`],
  [
    />默认情况下，每一个账号每日可刷新 URL 10000 条，每次最多可提交\s*1000 条</g,
    ">{{ $t('operations.domain.batchCacheExt.urlLimitWarning') }}",
  ],
  [
    />默认情况下，每一个账号每日可刷新目录 100 个，每次最多可提交\s*10 个</g,
    ">{{ $t('operations.domain.batchCacheExt.directoryLimitWarning') }}",
  ],
  [
    /<div style="margin-bottom: 8px; font-weight: 500">URL地址<\/div>/g,
    '<div style="margin-bottom: 8px; font-weight: 500">{{ $t(\'operations.domain.batchCacheExt.urlAddress\') }}</div>',
  ],
  [
    /placeholder="请输入待刷新的URL，每行输入一个URL"/g,
    ':placeholder="$t(\'operations.domain.batchCacheExt.urlPlaceholder\')"',
  ],
  [
    /<div style="margin-bottom: 8px; font-weight: 500">目录地址<\/div>/g,
    '<div style="margin-bottom: 8px; font-weight: 500">{{ $t(\'operations.domain.batchCacheExt.directoryAddress\') }}</div>',
  ],
  [
    /placeholder="请输入待刷新的目录路径，每行输入一个目录"/g,
    ':placeholder="$t(\'operations.domain.batchCacheExt.directoryPlaceholder\')"',
  ],
  [/>\s*立即刷新\s*</g, ">{{ $t('operations.domain.batchCacheExt.refreshNow') }}<"],
  [/>\s*清空\s*</g, ">{{ $t('operations.domain.batchCacheExt.clear') }}<"],
  [
    /<span style="color: #666">今日已使用：<\/span>/g,
    '<span style="color: #666">{{ $t(\'operations.domain.batchCacheExt.usedToday\') }}</span>',
  ],
  [
    /<span style="color: #666">剩余额度：<\/span>/g,
    '<span style="color: #666">{{ $t(\'operations.domain.batchCacheExt.remaining\') }}</span>',
  ],

  // PMD/GG common
  [
    /<label class="mb-2 text-sm font-medium">展示状态<\/label>/g,
    '<label class="mb-2 text-sm font-medium">{{ $t(\'operations.form.displayStatus\') }}</label>',
  ],
  [
    /<label class="mb-2 text-sm font-medium">关键词<\/label>/g,
    '<label class="mb-2 text-sm font-medium">{{ $t(\'operations.messageSettings.keyword\') }}</label>',
  ],
  [/placeholder="输入内容或ID搜索"/g, ':placeholder="$t(\'operations.messageSettings.contentSearch\')"'],
  [/>\s*新增跑马灯\s*</g, ">{{ $t('operations.messageSettings.addPmd') }}<"],
  [/>\s*新增公告\s*</g, ">{{ $t('operations.messageSettings.addAnnouncement') }}<"],
  [/>\s*批量暂停/g, ">{{ $t('operations.messageSettings.batchPause') }} ({{"],
  [/title: '展示状态'/g, "title: $t('operations.form.displayStatus')"],
  [/title: '停留时间\(秒\)'/g, "title: $t('operations.form.displayDurationSec')"],
  [/render: \(row\) => `\$\{row\.displayDuration \|\| 0\}秒`/g, "render: (row) => `${row.displayDuration || 0}${$t('operations.messageSettings.secondsUnit')}`"],
  [/title: '内容'/g, "title: $t('operations.messageSettings.content')"],
  [/title: '后台备注'/g, "title: $t('operations.messageSettings.backendRemark')"],
  [
    /\{ default: \(\) => \(row\.status === 'enabled' \? '暂停' : '启动'\) \}/g,
    "{ default: () => (row.status === 'enabled' ? $t('operations.messageSettings.stop') : $t('operations.messageSettings.start')) }",
  ],
  [
    /\{ label: \$t\('operations\.layout\.login'\) \+ '前', value: 'before_login' \}/g,
    "{ label: $t('operations.form.beforeLogin'), value: 'before_login' }",
  ],
  [
    /\{ label: \$t\('operations\.layout\.login'\) \+ '后', value: 'after_login' \}/g,
    "{ label: $t('operations.form.afterLoginOnly'), value: 'after_login' }",
  ],
  [
    /\{ label: \$t\('operations\.layout\.login'\) \+ '前后', value: 'both' \}/g,
    "{ label: $t('operations.form.loginBoth'), value: 'both' }",
  ],
  [/<p>• 开始时间：跑马灯通知开始显示的时间<\/p>/g, '<p>• {{ $t(\'operations.form.pmdTimeStartHint\') }}</p>'],
  [/<p>• 结束时间：跑马灯通知停止显示的时间<\/p>/g, '<p>• {{ $t(\'operations.form.pmdTimeEndHint\') }}</p>'],
  [
    /<n-checkbox value="new_user">新用户（\{\{ \$t\('operations\.layout\.register'\) \}\}7天内）<\/n-checkbox>/g,
    '<n-checkbox value="new_user">{{ $t(\'operations.form.newUser7d\') }}</n-checkbox>',
  ],
  [
    /<n-checkbox value="active_user">\s*>活跃用户（7天内有\{\{ \$t\('operations\.layout\.login'\) \}\}）<\/n-checkbox/g,
    '<n-checkbox value="active_user">{{ $t(\'operations.form.activeUser7d\') }}</n-checkbox',
  ],
  [/<n-checkbox value="vip_user">VIP用户<\/n-checkbox>/g, '<n-checkbox value="vip_user">{{ $t(\'operations.form.vipUser\') }}</n-checkbox>'],
  [
    /<n-checkbox value="deposit_user">\{\{ \$t\('operations\.layout\.deposit'\) \}\}用户<\/n-checkbox>/g,
    '<n-checkbox value="deposit_user">{{ $t(\'operations.form.depositUser\') }}</n-checkbox>',
  ],
  [
    /<n-checkbox value="no_deposit_user">未\{\{ \$t\('operations\.layout\.deposit'\) \}\}用户<\/n-checkbox>/g,
    '<n-checkbox value="no_deposit_user">{{ $t(\'operations.form.noDepositUser\') }}</n-checkbox>',
  ],
  [
    /\{ required: true, message: \$t\('common\.pleaseSelect'\) \+ '收件人类型', trigger: 'change' \}/g,
    "{ required: true, message: $t('common.pleaseSelect') + ' ' + $t('operations.messageSettings.receiverType'), trigger: 'change' }",
  ],
  [
    /\{ required: true, message: \$t\('common\.pleaseSelect'\) \+ '展示状态', trigger: 'change' \}/g,
    "{ required: true, message: $t('common.pleaseSelect') + ' ' + $t('operations.form.displayStatus'), trigger: 'change' }",
  ],
  [
    /\{ required: true, message: \$t\('common\.pleaseEnter'\) \+ '通知内容', trigger: 'input' \}/g,
    "{ required: true, message: $t('common.pleaseEnterField', [$t('operations.form.notificationContent')]), trigger: 'input' }",
  ],
  [/message: '内容长度应在1-500字符之间'/g, "message: $t('operations.form.contentLength')"],
  [
    /\{ required: true, message: \$t\('common\.pleaseEnter'\) \+ '排序数值', trigger: 'blur' \}/g,
    "{ required: true, message: $t('common.pleaseEnterField', [$t('common.sort')]), trigger: 'blur' }",
  ],
  [/return new Error\('请输入排序数值'\)/g, "return new Error($t('operations.form.enterSort'))"],
  [/return new Error\('排序数值应在0-9999之间'\)/g, "return new Error($t('operations.form.sortRange'))"],
  [
    /\{ required: true, message: \$t\('common\.pleaseEnter'\) \+ '停留时间', trigger: 'blur' \}/g,
    "{ required: true, message: $t('common.pleaseEnterField', [$t('operations.form.displayDurationSec')]), trigger: 'blur' }",
  ],
  [/return new Error\('请输入停留时间'\)/g, "return new Error($t('operations.form.enterDuration'))"],
  [/return new Error\('停留时间应在1-3600秒之间'\)/g, "return new Error($t('operations.form.durationRange'))"],
];

function walk(dir, files = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, files);
    else if (p.endsWith('.vue')) files.push(p);
  }
  return files;
}

const files = walk(ROOT);
let updated = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const orig = content;
  for (const [from, to] of replacements) {
    content = content.replace(from, to);
  }
  if (
    content !== orig &&
    content.includes('<script') &&
    !content.includes("from '@vben/locales'")
  ) {
    content = content.replace(
      /(<script setup lang="ts">\r?\n)/,
      "$1import { $t } from '@vben/locales';\n\n",
    );
  }
  if (content !== orig) {
    fs.writeFileSync(file, content);
    updated++;
    console.log('Updated:', file);
  }
}
console.log('Vue files updated:', updated);
