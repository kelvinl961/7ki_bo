import fs from 'fs';
import path from 'path';

const ROOT = 'src/views/operateManager';

const replacements = [
  // HealthCheck remaining
  [
    />检测节点响应无法优化的IP地址如下（DNS污染），建议更换域名：</g,
    ">{{ $t('operations.healthCheck.dnsPollutionHint') }}",
  ],
  [/'建议更换域名'/g, "$t('operations.healthCheck.suggestChangeDomain')"],
  [
    /`正在执行实时检测 \$\{domain\.domainName\}\.\.\.`/g,
    "$t('operations.healthCheck.detecting', [domain.domainName])",
  ],
  [
    /\(\) => \(row\.verificationStatus \? '已生效' : '已生效'\)/g,
    "() => $t('operations.domain.status.effective')",
  ],

  // DownloadSite / Backend bind agent
  [
    /\{\{ \$t\('operations\.layout\.agent'\) \}\}账号/g,
    "{{ $t('operations.domain.modal.agentAccount') }}",
  ],
  [
    />下载站域名绑定\{\{ \$t\('operations\.layout\.agent'\) \}\}优先级：APP内部识别 > 渠道ID强制绑定 > 域名绑定</g,
    ">{{ $t('operations.domain.modal.bindAgentHint2') }}: APP > {{ $t('operations.domain.modal.bindAgentPriority2') }} > {{ $t('operations.domain.modal.bindAgentPriority3') }}",
  ],
  [
    /enable: '启用',\s*disable: '停用',\s*delete: '删除'/g,
    "enable: $t('common.enable'), disable: $t('common.disable'), delete: $t('common.delete')",
  ],
  [
    /message\.success\(`批量\$\{actionText\}成功`\)/g,
    "message.success($t('operations.domain.message.bulkActionSuccess', [actionText]))",
  ],
  [
    /message\.error\(response\.message \|\| `批量\$\{actionText\}失败`\)/g,
    "message.error(response.message || $t('operations.domain.message.bulkActionFailed', [actionText]))",
  ],
  [
    /message\.info\(`批量\$\{actionText\}功能开发中`\)/g,
    "message.info($t('operations.domain.message.bulkActionDeveloping', [actionText]))",
  ],
  [
    /message\.error\(error\.response\?\.data\?\.message \|\| `批量\$\{actionText\}失败`\)/g,
    "message.error(error.response?.data?.message || $t('operations.domain.message.bulkActionFailed', [actionText]))",
  ],

  // BackendApiView
  [/modal-title="新增后端加速域名"/g, ':modal-title="$t(\'operations.domain.createBackendApiSubdomain\')"'],
  [
    /placeholder="请输入\{\{ \$t\('operations\.layout\.agent'\) \}\}ID"/g,
    ':placeholder="$t(\'operations.domain.modal.agentIdPlaceholder\')"',
  ],
  [/title: 'CDN节点'/g, "title: $t('operations.domain.column.cdnNodeName')"],
  [/title: '后端加速域名'/g, "title: $t('operations.domain.useType.backendApi')"],
  [/message\.success\('已复制到剪贴板'\)/g, "message.success($t('operations.domain.message.copied'))"],
  [/title: 'SSL证书'/g, "title: $t('operations.domain.column.sslCert')"],
  [
    /default: \(\) => \(row\.sslEnabled \? '已启用' : '未启用'\)/g,
    "default: () => (row.sslEnabled ? $t('common.enabled') : $t('common.disabled'))",
  ],
  [/title: '验证状态'/g, "title: $t('operations.domain.column.verifyStatus')"],
  [
    /default: \(\) => \(row\.verificationStatus \? '已验证' : '待验证'\)/g,
    "default: () => (row.verificationStatus ? $t('operations.domain.stats.verified') : $t('operations.domain.status.verificationPending'))",
  ],
  [/NORMAL: \{ text: '正常', type: 'success' \}/g, "NORMAL: { text: $t('operations.domain.status.normal'), type: 'success' }"],
  [/DISABLED: \{ text: '已停用', type: 'error' \}/g, "DISABLED: { text: $t('operations.messageSettings.option.statusDisabled'), type: 'error' }"],
  [/EXPIRED: \{ text: '已过期', type: 'warning' \}/g, "EXPIRED: { text: $t('operations.domain.status.expired'), type: 'warning' }"],
  [/EXPIRING_SOON: \{ text: '即将过期', type: 'warning' \}/g, "EXPIRING_SOON: { text: $t('operations.domain.status.expiringSoon'), type: 'warning' }"],
  [/VERIFICATION_PENDING: \{ text: '验证中', type: 'info' \}/g, "VERIFICATION_PENDING: { text: $t('operations.domain.status.verificationPending'), type: 'info' }"],
  [/title: '绑定' \+ \$t\('operations\.layout\.agent'\)/g, "title: $t('operations.domain.action.bindAgent')"],
  [
    /message\.warning\('请输入' \+ \$t\('operations\.layout\.agent'\) \+ 'ID'\)/g,
    "message.warning($t('operations.domain.message.enterAgentAccount'))",
  ],

  // AppUpdateView
  [/modal-title="新增APP更新域名"/g, ':modal-title="$t(\'operations.domain.createAppUpdateSubdomain\')"'],
  [/message\.info\('刷新解析状态\.\.\.'\)/g, "message.info($t('operations.domain.message.refreshingDns'))"],
  [
    /message\.error\(error\.response\?\.data\?\.message \|\| '获取域名列表失败'\)/g,
    "message.error(error.response?.data?.message || $t('operations.domain.message.fetchListFailed'))",
  ],

  // AllDomainsView
  [
    /<div>• 为特定域名分配\{\{ \$t\('operations\.layout\.agent'\) \}\}，以便管理流量和推广策略<\/div>/g,
    "<div>• {{ $t('operations.domain.modal.bindAgentHint1') }}</div>",
  ],
  [
    /<div>• 上级归属判定优先级：<\/div>/g,
    "<div>• {{ $t('operations.domain.modal.bindAgentHint2') }}</div>",
  ],
  [
    /1\. 推广链接的上级（最高优先级）/g,
    "{{ $t('operations.domain.modal.bindAgentPriority1') }}",
  ],
  [
    /2\. 渠道ID配置的强制绑定上级/g,
    "{{ $t('operations.domain.modal.bindAgentPriority2') }}",
  ],
  [
    /3\. 域名管理中配置的强制绑定上级/g,
    "{{ $t('operations.domain.modal.bindAgentPriority3') }}",
  ],
  [/\{ label: '网宿 \(Wangsu\)', value: 'WANGSU' \}/g, "{ label: 'Wangsu', value: 'WANGSU' }"],
  [/\{ label: '火山云 \(Volcengine\)', value: 'VOLCENGINE' \}/g, "{ label: 'Volcengine', value: 'VOLCENGINE' }"],
  [/\{ label: '阿里云 \(Aliyun\)', value: 'ALIYUN' \}/g, "{ label: 'Aliyun', value: 'ALIYUN' }"],
  [/\{ label: '腾讯云 \(Tencent\)', value: 'TENCENT_CLOUD' \}/g, "{ label: 'Tencent Cloud', value: 'TENCENT_CLOUD' }"],
  [/\{ label: '华为云 \(Huawei\)', value: 'HUAWEI_CLOUD' \}/g, "{ label: $t('operations.domain.cdn.huawei'), value: 'HUAWEI_CLOUD' }"],
  [/\{ label: '云盾 \(Yundun\)', value: 'YUNDUN' \}/g, "{ label: 'Yundun', value: 'YUNDUN' }"],
  [/\(\) => '更换节点'/g, "() => $t('operations.domain.action.switchNode')"],
  [
    /\(\) => '绑定' \+ \$t\('operations\.layout\.agent'\)/g,
    "() => $t('operations.domain.action.bindAgent')",
  ],
  [/\(\) => \(isDisabled \? '启用' : '停用'\)/g, "() => (isDisabled ? $t('common.enable') : $t('common.disable'))"],
  [/\(\) => '清缓存'/g, "() => $t('operations.domain.action.clearCache')"],
  [/\(\) => '删除'/g, "() => $t('common.delete')"],
  [
    /message\.error\(error\.response\?\.data\?\.message \|\| '绑定' \+ \$t\('operations\.layout\.agent'\) \+ '失败'\)/g,
    "message.error(error.response?.data?.message || $t('operations.domain.message.agentBindFailed'))",
  ],
  [
    /message\.success\(result\.data\.message \|\| '验证完成'\)/g,
    "message.success(result.data.message || $t('operations.domain.message.verifyComplete'))",
  ],

  // LobbyPopModalManager
  [/<n-statistic label="总数"/g, '<n-statistic :label="$t(\'operations.messageSettings.total\')"'],
  [/<n-statistic label="生效中"/g, '<n-statistic :label="$t(\'operations.form.statusActive\')"'],
  [/<n-statistic label="已过期"/g, '<n-statistic :label="$t(\'operations.form.statusExpired\')"'],
  [/<n-statistic label="草稿"/g, '<n-statistic :label="$t(\'operations.messageSettings.draft\')"'],
  [/<n-statistic label="已停用"/g, '<n-statistic :label="$t(\'operations.messageSettings.option.statusDisabled\')"'],
  [
    /<label class="mb-2 text-sm font-medium">跳转类型<\/label>/g,
    '<label class="mb-2 text-sm font-medium">{{ $t(\'operations.form.jumpType\') }}</label>',
  ],
  [
    /<label class="mb-2 text-sm font-medium">展示入口<\/label>/g,
    '<label class="mb-2 text-sm font-medium">{{ $t(\'operations.form.entryPoints\') }}</label>',
  ],
  [/placeholder="选择展示入口"/g, ':placeholder="$t(\'operations.form.entryPoints\')"'],
  [
    /<label class="mb-2 text-sm font-medium">受众<\/label>/g,
    '<label class="mb-2 text-sm font-medium">{{ $t(\'operations.messageSettings.targetAudience\') }}</label>',
  ],
  [/placeholder="输入受众搜索"/g, ':placeholder="$t(\'operations.messageSettings.targetAudience\')"'],
  [/placeholder="输入操作人搜索"/g, ':placeholder="$t(\'operations.messageSettings.operatorPlaceholder\')"'],
  [/>\s*新增弹窗\s*</g, ">{{ $t('operations.messageSettings.addPop') }}<"],
  [
    /\{\{ paginationReactive\.total \}\} 条/g,
    "{{ $t('operations.domain.modal.recordsCount', [paginationReactive.total]) }}",
  ],
  [/>\s*批量启用/g, ">{{ $t('common.enable') }} ({{"],
  [/>\s*批量停用/g, ">{{ $t('common.disable') }} ({{"],
  [/title="弹窗详情"/g, ':title="$t(\'operations.messageSettings.popDetail\')"'],
  [
    /<label class="text-sm font-medium text-gray-600">受众<\/label>/g,
    '<label class="text-sm font-medium text-gray-600">{{ $t(\'operations.messageSettings.targetAudience\') }}</label>',
  ],
  [
    /<label class="text-sm font-medium text-gray-600">跳转类型<\/label>/g,
    '<label class="text-sm font-medium text-gray-600">{{ $t(\'operations.form.jumpType\') }}</label>',
  ],
  [
    /<label class="text-sm font-medium text-gray-600">弹窗图片<\/label>/g,
    '<label class="text-sm font-medium text-gray-600">{{ $t(\'operations.messageSettings.popImage\') }}</label>',
  ],
  [/alt="弹窗图片"/g, ':alt="$t(\'operations.messageSettings.popImage\')"'],
  [
    /<label class="text-sm font-medium text-gray-600">展示入口<\/label>/g,
    '<label class="text-sm font-medium text-gray-600">{{ $t(\'operations.form.entryPoints\') }}</label>',
  ],
  [
    />最大显示次数<\/label/g,
    ">{{ $t('operations.form.maxDisplayTimes') }}</label",
  ],
  [/\{\{ detailData\.maxDisplayTimes \}\}次/g, "{{ detailData.maxDisplayTimes }}{{ $t('operations.messageSettings.timesUnit') }}"],
  [
    /<label class="text-sm font-medium text-gray-600">显示间隔<\/label>/g,
    '<label class="text-sm font-medium text-gray-600">{{ $t(\'operations.form.displayInterval\') }}</label>',
  ],
  [/\{\{ detailData\.displayInterval \}\}小时/g, "{{ detailData.displayInterval }}{{ $t('operations.messageSettings.hoursUnit') }}"],
  [
    /<label class="text-sm font-medium text-gray-600">总浏览量<\/label>/g,
    '<label class="text-sm font-medium text-gray-600">{{ $t(\'operations.messageSettings.totalViews\') }}</label>',
  ],
  [
    /<label class="text-sm font-medium text-gray-600">总点击量<\/label>/g,
    '<label class="text-sm font-medium text-gray-600">{{ $t(\'operations.messageSettings.totalClicks\') }}</label>',
  ],
  [
    /<label class="text-sm font-medium text-gray-600">点击率<\/label>/g,
    '<label class="text-sm font-medium text-gray-600">{{ $t(\'operations.messageSettings.clickRate\') }}</label>',
  ],
  [
    /\{ label: \$t\('operations\.layout\.login'\) \+ '后弹窗', value: 'login' \}/g,
    "{ label: $t('operations.form.afterLogin'), value: 'login' }",
  ],
  [/\{ label: '首页加载', value: 'homepage' \}/g, "{ label: $t('operations.form.homepageLoad'), value: 'homepage' }"],
  [
    /\{ label: \$t\('operations\.layout\.deposit'\) \+ '页面', value: 'deposit' \}/g,
    "{ label: $t('operations.form.depositPage'), value: 'deposit' }",
  ],
  [/\{ label: '游戏大厅', value: 'game_lobby' \}/g, "{ label: $t('operations.form.gameLobby'), value: 'game_lobby' }"],
  [/\{ label: '活动页面', value: 'promotion' \}/g, "{ label: $t('operations.form.promotionPage'), value: 'promotion' }"],
  [/title: '弹窗图片预览'/g, "title: $t('operations.form.popImagePreview')"],
  [/title: '受众'/g, "title: $t('operations.messageSettings.targetAudience')"],
  [/title: '展示入口'/g, "title: $t('operations.form.entryPoints')"],
  [
    /\{ default: \(\) => \(row\.status === 'active' \? '停止' : '发布'\) \}/g,
    "{ default: () => (row.status === 'active' ? $t('operations.messageSettings.stop') : $t('operations.messageSettings.publish')) }",
  ],
  [
    /default: \(\) => \$t\('operations\.layout\.confirm'\) \+ '删除这个弹窗吗？'/g,
    "default: () => $t('operations.messageSettings.confirmDeletePop')",
  ],
  [/content: '加载弹窗数据失败'/g, "content: $t('operations.messageSettings.loadPopFailed')"],
  [/content: '复制成功'/g, "content: $t('operations.messageSettings.copySuccess')"],
  [/content: '复制失败'/g, "content: $t('operations.messageSettings.copyFailed')"],
  [
    /content: `\$\{newStatus === 'active' \? '启用' : '停用'\}成功`/g,
    "content: newStatus === 'active' ? $t('operations.messageSettings.toggleSuccess', [$t('common.enable')]) : $t('operations.messageSettings.toggleSuccess', [$t('common.disable')])",
  ],
  [
    /content: `批量\$\{status === 'active' \? '启用' : '停用'\}成功`/g,
    "content: $t('operations.messageSettings.batchToggleSuccess', [status === 'active' ? $t('common.enable') : $t('common.disable')])",
  ],
  [
    /content: `成功删除 \$\{modalsToDelete\.length\} 个弹窗`/g,
    "content: $t('operations.messageSettings.batchDeletePopSuccess', [modalsToDelete.length])",
  ],

  // LobbyBannerFormModal
  [/placeholder="从媒体库选择或上传Banner图片"/g, ':placeholder="$t(\'operations.form.bannerImagePlaceholder\')"'],
  [/<p>• 开始时间：Banner开始显示的时间（必填）<\/p>/g, '<p>• {{ $t(\'operations.form.bannerTimeStartHint\') }}</p>'],
  [/<p>• 结束时间：Banner停止显示的时间（可选）<\/p>/g, '<p>• {{ $t(\'operations.form.bannerTimeEndHint\') }}</p>'],
  [/<p>• 如果不设置结束时间，将持续显示直到手动停止<\/p>/g, '<p>• {{ $t(\'operations.form.bannerTimeNoEndHint\') }}</p>'],
  [/placeholder="请选择活动"/g, ':placeholder="$t(\'operations.form.selectActivity\')"'],
  [/placeholder="请选择任务"/g, ':placeholder="$t(\'operations.form.selectTask\')"'],
  [/placeholder="请选择游戏平台"/g, ':placeholder="$t(\'operations.form.selectGamePlatform\')"'],
  [/<p>• 无跳转：点击Banner无任何响应<\/p>/g, '<p>• {{ $t(\'operations.form.bannerJumpNoneHint\') }}</p>'],
  [/<p>• 外链：跳转到外部网站，需要完整URL<\/p>/g, '<p>• {{ $t(\'operations.form.bannerJumpExternalHint\') }}</p>'],
  [/<p>• 内部页面：跳转到系统内部页面<\/p>/g, '<p>• {{ $t(\'operations.form.bannerJumpInternalHint\') }}</p>'],
  [
    /label: `\$\{platform\.platformName\} \(\$\{platform\.subGameCount\} 游戏\)`/g,
    "label: `${platform.platformName} (${$t('operations.form.gameCount', [platform.subGameCount])})`",
  ],
  [
    /\{ required: true, message: \$t\('common\.pleaseEnter'\) \+ 'Banner名称', trigger: 'blur' \}/g,
    "{ required: true, message: $t('common.pleaseEnterField', [$t('operations.messageSettings.bannerName')]), trigger: 'blur' }",
  ],
  [/message: 'Banner名称长度在1到100个字符'/g, "message: $t('operations.form.bannerNameLength')"],
  [/message: '请上传Banner图片'/g, "message: $t('operations.form.uploadBannerRequired')"],
  [/message: '停留时间在1到300秒之间'/g, "message: $t('operations.form.stayDurationRange')"],
  [/return new Error\('开始时间应在合理范围内'\)/g, "return new Error($t('operations.form.startInRange'))"],
  [
    /\{ required: true, message: \$t\('common\.pleaseSelect'\) \+ '跳转方式', trigger: 'change' \}/g,
    "{ required: true, message: $t('common.pleaseSelect') + ' ' + $t('operations.messageSettings.jumpMode'), trigger: 'change' }",
  ],
  [/message\.success\('Banner更新成功'\)/g, "message.success($t('operations.messageSettings.bannerUpdateSuccess'))"],
  [/message\.success\('Banner创建成功'\)/g, "message.success($t('operations.messageSettings.bannerCreateSuccess'))"],
  [
    /message\.error\(isEditing\.value \? 'Banner更新失败' : 'Banner创建失败'\)/g,
    "message.error(isEditing.value ? $t('operations.messageSettings.bannerUpdateFailed') : $t('operations.messageSettings.bannerCreateFailed'))",
  ],
  [/message\.success\('Banner图片已选择'\)/g, "message.success($t('operations.messageSettings.bannerImageSelected'))"],
  [/message\.success\('图片已选择'\)/g, "message.success($t('operations.messageSettings.imageSelected'))"],
  [/message\.success\('图片已删除'\)/g, "message.success($t('operations.messageSettings.imageDeleted'))"],

  // TypeScript 备注 field - keep as remark in interface
  [/备注\?: string/g, 'remark?: string'],
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
  if (content !== orig) {
    fs.writeFileSync(file, content);
    updated++;
    console.log('Updated:', file);
  }
}
console.log('Vue files updated:', updated);
