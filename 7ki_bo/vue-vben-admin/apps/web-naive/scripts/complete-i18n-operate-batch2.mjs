import fs from 'fs';
import path from 'path';

const ROOT = 'src/views/operateManager';

const replacements = [
  // Fix broken syntax from batch1
  [
    /\$t\('operations\.healthCheck\.fetchFailed', \[' \+ \(error\.message \|\| '未知错误'\)\)/g,
    "$t('operations.healthCheck.fetchFailed', [error.message || $t('operations.unknownError')])",
  ],
  [
    /\$t\('operations\.certificate\.fetchFailed', \[' \+ error\.message\)/g,
    "$t('operations.certificate.fetchFailed', [error.message || $t('operations.unknownError')])",
  ],
  [
    /\$t\('operations\.certificate\.applyFailedWith', \[' \+ error\.message\)/g,
    "$t('operations.certificate.applyFailedWith', [error.message || $t('operations.unknownError')])",
  ],
  [
    /\$t\('operations\.certificate\.nginxFailedWith', \[' \+ error\.message\)/g,
    "$t('operations.certificate.nginxFailedWith', [error.message || $t('operations.unknownError')])",
  ],
  [
    /\$t\('operations\.certificate\.dnsValidateFailedWith', \[' \+ error\.message\)/g,
    "$t('operations.certificate.dnsValidateFailedWith', [error.message || $t('operations.unknownError')])",
  ],
  [
    /\$t\('operations\.certificate\.deleteFailedWith', \[' \+ error\.message\)/g,
    "$t('operations.certificate.deleteFailedWith', [error.message || $t('operations.unknownError')])",
  ],

  // Record counts
  [/>\s*共 \{\{ pagination\.itemCount \}\} 条\s*</g, ">{{ $t('operations.domain.modal.recordsCount', [pagination.itemCount]) }}<"],
  [/>\s*共 \{\{ pagination\.itemCount \|\| 0 \}\} 条\s*</g, ">{{ $t('operations.domain.modal.recordsCount', [pagination.itemCount || 0]) }}<"],
  [
    /prefix: \(\{ itemCount \}: \{ itemCount: number \}\) => `共 \$\{itemCount\} 条`/g,
    "prefix: ({ itemCount }: { itemCount: number }) => $t('operations.domain.modal.recordsCount', [itemCount])",
  ],

  // Domain modal labels (template)
  [
    /<div style="margin-bottom: 8px; font-weight: 500">当前域名<\/div>/g,
    '<div style="margin-bottom: 8px; font-weight: 500">{{ $t(\'operations.domain.modal.currentDomain\') }}</div>',
  ],
  [
    /<div style="margin-bottom: 8px; font-weight: 500">当前CDN<\/div>/g,
    '<div style="margin-bottom: 8px; font-weight: 500">{{ $t(\'operations.domain.modal.currentCdn\') }}</div>',
  ],
  [
    /<div style="margin-bottom: 8px; font-weight: 500">\s*目标CDN节点/g,
    '<div style="margin-bottom: 8px; font-weight: 500">{{ $t(\'operations.domain.modal.targetCdnRequired\') }}',
  ],
  [
    /<div style="margin-bottom: 8px; font-weight: 500">域名<\/div>/g,
    '<div style="margin-bottom: 8px; font-weight: 500">{{ $t(\'operations.domain.column.domain\') }}</div>',
  ],
  [
    /<div style="font-weight: 500; margin-bottom: 8px">功能说明：<\/div>/g,
    '<div style="font-weight: 500; margin-bottom: 8px">{{ $t(\'operations.domain.modal.featureDescription\') }}</div>',
  ],
  [
    /<div style="margin-top: 8px; font-weight: 500">支持CDN节点：<\/div>/g,
    '<div style="margin-top: 8px; font-weight: 500">{{ $t(\'operations.domain.modal.supportedCdn\') }}</div>',
  ],

  // CDN switch hint text
  [
    /•\s*仅限域名已托管DNS厂商（阿里云与Cloudflare），切换过程无感知，预计5-10分钟域名生效/g,
    "• {{ $t('operations.domain.modal.cdnSwitchHint') }}",
  ],
  [
    /Cloudflare、AWS、网宿、火山云、阿里云、腾讯云、华为云、SuperEdge、Funnull、云盾/g,
    "{{ $t('operations.domain.modal.cdnList') }}",
  ],

  // Huawei cloud option
  [/\{ label: '华为云', value: 'HUAWEI_CLOUD' \}/g, "{ label: $t('operations.domain.cdn.huawei'), value: 'HUAWEI_CLOUD' }"],

  // Status maps and labels
  [/\{ label: 'Web大厅', value: 'WEB_HALL' \}/g, "{ label: $t('operations.domain.useType.webHall'), value: 'WEB_HALL' }"],
  [/\{ label: '启用成功', value: 'NORMAL' \}/g, "{ label: $t('operations.domain.status.enabledSuccess'), value: 'NORMAL' }"],
  [/\{ label: '待启用', value: 'DISABLED' \}/g, "{ label: $t('operations.domain.status.pendingEnable'), value: 'DISABLED' }"],
  [/\{ label: '批量操作', value: '', disabled: true \}/g, "{ label: $t('common.batchOperation'), value: '', disabled: true }"],
  [/\{ label: '启用', value: 'enable' \}/g, "{ label: $t('common.enable'), value: 'enable' }"],
  [/\{ label: '停用', value: 'disable' \}/g, "{ label: $t('common.disable'), value: 'disable' }"],
  [/\{ label: '删除', value: 'delete' \}/g, "{ label: $t('common.delete'), value: 'delete' }"],
  [/\{ label: '手动检测', value: 'detect' \}/g, "{ label: $t('operations.domain.action.manualDetect'), value: 'detect' }"],
  [/\{ label: '100条\/页', value: 100 \}/g, "{ label: $t('operations.domain.perPage', [100]), value: 100 }"],
  [/\{ label: '50条\/页', value: 50 \}/g, "{ label: $t('operations.domain.perPage', [50]), value: 50 }"],
  [/\{ label: '20条\/页', value: 20 \}/g, "{ label: $t('operations.domain.perPage', [20]), value: 20 }"],

  // Health check filters
  [/\{ label: '全部域名', value: '' \}/g, "{ label: $t('operations.healthCheck.allDomains'), value: '' }"],
  [/\{ label: 'Web大厅域名', value: 'WEB_HALL' \}/g, "{ label: $t('operations.domain.useType.webHallDomain'), value: 'WEB_HALL' }"],
  [/\{ label: 'APP大厅域名', value: 'APP_HALL' \}/g, "{ label: $t('operations.domain.useType.appHallDomain'), value: 'APP_HALL' }"],
  [/\{ label: '后端加速域名', value: 'BACKEND_API' \}/g, "{ label: $t('operations.domain.useType.backendApi'), value: 'BACKEND_API' }"],
  [/\{ label: 'APP更新', value: 'APP_UPDATE' \}/g, "{ label: $t('operations.domain.useType.appUpdate'), value: 'APP_UPDATE' }"],
  [/\{ label: 'OSS加速域名', value: 'OSS_ACCELERATION' \}/g, "{ label: $t('operations.domain.useType.ossAcceleration'), value: 'OSS_ACCELERATION' }"],
  [/\{ label: '下载站域名', value: 'DOWNLOAD_SITE' \}/g, "{ label: $t('operations.domain.useType.downloadSite'), value: 'DOWNLOAD_SITE' }"],
  [/\{ label: '全部状态', value: '' \}/g, "{ label: $t('operations.domain.filter.allStatus'), value: '' }"],
  [/\{ label: '优', value: 'EXCELLENT' \}/g, "{ label: $t('operations.domain.status.excellent'), value: 'EXCELLENT' }"],
  [/\{ label: '良', value: 'GOOD' \}/g, "{ label: $t('operations.domain.status.good'), value: 'GOOD' }"],
  [/\{ label: '差', value: 'POOR' \}/g, "{ label: $t('operations.domain.status.poor'), value: 'POOR' }"],
  [/\{ label: '全球', value: 'GLOBAL' \}/g, "{ label: $t('operations.domain.status.global'), value: 'GLOBAL' }"],
  [/\{ label: '中国', value: 'CHINA' \}/g, "{ label: $t('operations.domain.status.china'), value: 'CHINA' }"],
  [/\{ label: '亚洲', value: 'ASIA' \}/g, "{ label: $t('operations.domain.status.asia'), value: 'ASIA' }"],
  [/\{ label: '欧洲', value: 'EUROPE' \}/g, "{ label: $t('operations.domain.status.europe'), value: 'EUROPE' }"],
  [/\{ label: '北美', value: 'NORTH_AMERICA' \}/g, "{ label: $t('operations.domain.status.northAmerica'), value: 'NORTH_AMERICA' }"],
  [/\{ label: '南美', value: 'SOUTH_AMERICA' \}/g, "{ label: $t('operations.domain.status.southAmerica'), value: 'SOUTH_AMERICA' }"],

  // Health check template
  [
    /\? `地图显示: \$\{healthData\.find\(\(h\) => h\.id === selectedDomainIdForMap\)\?\.domainName\}`\s*: '地图显示: 全部域名'/g,
    "? $t('operations.healthCheck.mapShow', [healthData.find((h) => h.id === selectedDomainIdForMap)?.domainName || '']) : $t('operations.healthCheck.mapShowAll')",
  ],
  [/<span style="font-size: 13px; color: #666">全当操作<\/span>/g, '<span style="font-size: 13px; color: #666">{{ $t(\'operations.healthCheck.batchAction\') }}</span>'],
  [
    /共 \{\{ pagination\.itemCount \}\} 条数据/g,
    "{{ $t('operations.healthCheck.recordData', [pagination.itemCount]) }}",
  ],
  [
    /前往 1 页 共\s*\n\s*\{\{ Math\.ceil\(pagination\.itemCount \/ pagination\.pageSize\) \}\} 条/g,
    "{{ $t('operations.healthCheck.gotoPage', [Math.ceil(pagination.itemCount / pagination.pageSize)]) }}",
  ],
  [/<span style="font-size: 13px">正常 \(&lt; 500ms\)<\/span>/g, '<span style="font-size: 13px">{{ $t(\'operations.healthCheck.latencyNormal\') }}</span>'],
  [/<span style="font-size: 13px">一般 \(500-1000ms\)<\/span>/g, '<span style="font-size: 13px">{{ $t(\'operations.healthCheck.latencyFair\') }}</span>'],
  [/<span style="font-size: 13px">缓慢 \(&gt; 1000ms\)<\/span>/g, '<span style="font-size: 13px">{{ $t(\'operations.healthCheck.latencySlow\') }}</span>'],
  [/<span style="font-size: 13px">无数据<\/span>/g, '<span style="font-size: 13px">{{ $t(\'operations.healthCheck.noData\') }}</span>'],
  [/>今日检测次数：<\/span/g, ">{{ $t('operations.healthCheck.todayChecks') }}</span"],
  [/<span style="font-size: 14px; font-weight: 500">拨测点<\/span>/g, '<span style="font-size: 14px; font-weight: 500">{{ $t(\'operations.healthCheck.probePoint\') }}</span>'],
  [
    />域名：\{\{ selectedDomain\?\.domainName \}\}<\/span/g,
    ">{{ $t('operations.healthCheck.domainLabel', [selectedDomain?.domainName || '']) }}</span",
  ],
  [
    />健康值：\{\{ selectedDomain\?\.healthScore \}\}%<\/span/g,
    ">{{ $t('operations.healthCheck.healthLabel', [selectedDomain?.healthScore || 0]) }}</span",
  ],
  [
    /:data="detailData\.filter\(\(d\) => d\.status === '正常'\)"/g,
    ":data=\"detailData.filter((d) => d.status === $t('operations.healthCheck.statusNormal'))\"",
  ],
  [
    /:data="detailData\.filter\(\(d\) => d\.status === '失败'\)"/g,
    ":data=\"detailData.filter((d) => d.status === $t('operations.healthCheck.statusFailed'))\"",
  ],
  [
    />检测节点响应无法优化的IP地址如下（DNS污染），建议更换域名：</g,
    ">{{ $t('operations.healthCheck.dnsPollutionHint') }}",
  ],

  // Health check script
  [/\{ default: \(\) => '检测' \}/g, "{ default: () => $t('operations.healthCheck.detect') }"],
  [/\{ default: \(\) => '建议更换域名' \}/g, "{ default: () => $t('operations.healthCheck.suggestChangeDomain') }"],
  [/row\.status === '正常'/g, "row.status === $t('operations.healthCheck.statusNormal')"],
  [/check\.checkStatus === '失败'/g, "check.checkStatus === $t('operations.healthCheck.statusFailed')"],
  [/health\.status !== '失败'/g, "health.status !== $t('operations.healthCheck.statusFailed')"],
  [/health\.status === '失败'/g, "health.status === $t('operations.healthCheck.statusFailed')"],
  [/locationStats\[loc\]\.status = '失败'/g, "locationStats[loc].status = $t('operations.healthCheck.statusFailed')"],
  [/: '无数据'/g, ": $t('operations.healthCheck.noData')"],
  [
    /message\.loading\(`正在执行实时检测 \$\{domain\.domainName\}\.\.\.`\)/g,
    "message.loading($t('operations.healthCheck.detecting', [domain.domainName]))",
  ],
  [
    /message\.loading\(`正在批量检测 \$\{selectedRowKeys\.value\.length\} 个域名\.\.\.`\)/g,
    "message.loading($t('operations.healthCheck.batchDetecting', [selectedRowKeys.value.length]))",
  ],
  [
    /message\.error\(`检测失败: \$\{result\.message \|\| '未知错误'\}`\)/g,
    "message.error($t('operations.healthCheck.detectFailed', [result.message || $t('operations.unknownError')]))",
  ],
  [
    /message\.error\('检测失败: ' \+ \(error\.message \|\| '未知错误'\)\)/g,
    "message.error($t('operations.healthCheck.detectFailed', [error.message || $t('operations.unknownError')]))",
  ],
  [
    /`检测完成！\$\{domain\.domainName\}\\n` \+\s*`健康值: \$\{healthScore\}%\\n` \+\s*`检测点: \$\{totalLocations\} 个位置`/g,
    "$t('operations.healthCheck.detectComplete', [domain.domainName, healthScore, totalLocations])",
  ],
  [
    /状态: \$\{status\}<br\/>\s*响应: \$\{responseTime\}/g,
    "${$t('operations.healthCheck.statusLabel')}: ${status}<br/>${$t('operations.healthCheck.responseLabel')}: ${responseTime}",
  ],

  // Domain view common script patterns
  [/'已解析'/g, "$t('operations.domain.column.resolved')"],
  [/'\(生效状态如同源\)'/g, "$t('operations.domain.column.dnsNoteHint')"],
  [/'\(生效状态和同源\)'/g, "$t('operations.domain.column.dnsNoteHint')"],
  [/default: \(\) => \(row\.verificationStatus \? '已生效' : '待解析'\)/g, "default: () => (row.verificationStatus ? $t('operations.domain.status.effective') : $t('operations.domain.status.verificationPending'))"],
  [/default: \(\) => \(row\.verificationStatus \? '已生效' : '已生效'\)/g, "default: () => $t('operations.domain.status.effective')"],
  [/DEFAULT: '默认'/g, "DEFAULT: $t('operations.domain.status.defaultPort')"],
  [/FIXED: '固定端口'/g, "FIXED: $t('operations.domain.status.fixed')"],
  [/\|\| '默认'/g, "|| $t('operations.domain.status.defaultPort')"],
  [/NORMAL: \{ text: '启用成功', type: 'success' \}/g, "NORMAL: { text: $t('operations.domain.status.enabledSuccess'), type: 'success' }"],
  [/DISABLED: \{ text: '待启用', type: 'warning' \}/g, "DISABLED: { text: $t('operations.domain.status.pendingEnable'), type: 'warning' }"],
  [/EXPIRED: \{ text: '已过期', type: 'error' \}/g, "EXPIRED: { text: $t('operations.domain.status.expired'), type: 'error' }"],
  [/key: '备注'/g, "key: 'remark'"],
  [/row\.备注/g, "row.remark"],
  [/备注: formData/g, "remark: formData"],
  [/\|\| '无'/g, "|| $t('operations.domain.status.none')"],
  [/row\.boundAgentId \|\| '无'/g, "row.boundAgentId || $t('operations.domain.status.none')"],
  [/\{ default: \(\) => '复制' \}/g, "{ default: () => $t('common.copy') }"],
  [/\{ default: \(\) => '绑定域名' \}/g, "{ default: () => $t('operations.domain.action.bindDomain') }"],
  [/h\('div', \{\}, '出现在其他档别'\)/g, "h('div', {}, $t('operations.domain.column.otherOrg'))"],
  [/h\('div', \{\}, '表'\)/g, "h('div', {}, '')"],
  [
    /h\('div', \{\}, '强制绑定' \+ \$t\('operations\.layout\.agent'\) \+ '管理'\)/g,
    "h('div', {}, $t('operations.domain.column.forceBindParent'))",
  ],
  [
    /h\('span', \{\}, map\[row\.enabledEntrance\] \|\| '全部'\)/g,
    "h('span', {}, map[row.enabledEntrance] || $t('common.all'))",
  ],
  [
    /h\('span', \{\}, map\[row\.blockedDevice\] \|\| '都不屏蔽'\)/g,
    "h('span', {}, map[row.blockedDevice] || $t('operations.domain.device.none'))",
  ],
  [
    /`\$\{row\.status === 'DISABLED' \? '✅ 确认启用？' : '⚠️ 确认停用？'\}`/g,
    "row.status === 'DISABLED' ? $t('operations.domain.modal.confirmEnable') : $t('operations.domain.modal.confirmDisable')",
  ],
  [/'🗑️ 确认清理缓存？'/g, "$t('operations.domain.modal.confirmClearCache')"],
  [/'清理后用户可能需要重新加载资源'/g, "$t('operations.domain.modal.confirmClearCacheHint')"],
  [
    /message\.success\('CDN节点切换成功'\)/g,
    "message.success($t('operations.domain.message.cdnSwitchSuccess'))",
  ],
  [
    /message\.success\(agentId\.value \? \$t\('operations\.layout\.agent'\) \+ '绑定成功' : \$t\('operations\.layout\.agent'\) \+ '解绑成功'\)/g,
    "message.success(agentId.value ? $t('operations.domain.message.agentBindSuccess') : $t('operations.domain.message.agentUnbindSuccess'))",
  ],
  [
    /row\.isPromotionDomain \? '已取消推广域名' : '已设为推广域名'/g,
    "row.isPromotionDomain ? $t('operations.domain.message.promotionCancelled') : $t('operations.domain.message.promotionSet')",
  ],
  [
    /message\.success\(`域名\$\{newStatus === 'DISABLED' \? '停用' : '启用'\}成功`\)/g,
    "message.success(newStatus === 'DISABLED' ? $t('operations.domain.message.domainDisableSuccess') : $t('operations.domain.message.domainEnableSuccess'))",
  ],
  [
    /message\.error\(response\.message \|\| '域名删除失败'\)/g,
    "message.error(response.message || $t('operations.domain.message.domainDeleteFailed'))",
  ],
  [
    /message\.error\(error\.response\?\.data\?\.message \|\| '域名删除失败'\)/g,
    "message.error(error.response?.data?.message || $t('operations.domain.message.domainDeleteFailed'))",
  ],
  [
    /error\.response\?\.data\?\.message \|\| error\.message \|\| '获取域名列表失败'/g,
    "error.response?.data?.message || error.message || $t('operations.domain.message.fetchListFailed')",
  ],
  [
    /message\.error\(response\.message \|\| 'CDN节点更换失败'\)/g,
    "message.error(response.message || $t('operations.domain.message.cdnChangeFailed'))",
  ],
  [
    /message\.error\(error\.response\?\.data\?\.message \|\| 'CDN节点更换失败'\)/g,
    "message.error(error.response?.data?.message || $t('operations.domain.message.cdnChangeFailed'))",
  ],
  [
    /`域名\$\{domain\.status === 'DISABLED' \? '启用' : '停用'\}成功`/g,
    "domain.status === 'DISABLED' ? $t('operations.domain.message.domainEnableSuccess') : $t('operations.domain.message.domainDisableSuccess')",
  ],
  [
    /message\.error\(response\.message \|\| '操作失败'\)/g,
    "message.error(response.message || $t('operations.domain.message.operationFailed'))",
  ],
  [
    /message\.error\(error\.response\?\.data\?\.message \|\| '操作失败'\)/g,
    "message.error(error.response?.data?.message || $t('operations.domain.message.operationFailed'))",
  ],
  [
    /message\.error\(response\.message \|\| '缓存清理失败'\)/g,
    "message.error(response.message || $t('operations.domain.message.cacheClearFailed'))",
  ],
  [
    /message\.error\(error\.response\?\.data\?\.message \|\| '缓存清理失败'\)/g,
    "message.error(error.response?.data?.message || $t('operations.domain.message.cacheClearFailed'))",
  ],
  [
    /message\.success\(`成功删除 \$\{selectedRowKeys\.value\.length\} 个域名`\)/g,
    "message.success($t('operations.domain.message.bulkDeleteSuccess', [selectedRowKeys.value.length]))",
  ],
  [
    /message\.error\(response\.message \|\| '批量删除失败'\)/g,
    "message.error(response.message || $t('operations.domain.message.bulkDeleteFailed'))",
  ],
  [
    /message\.error\(error\.response\?\.data\?\.message \|\| '批量删除失败'\)/g,
    "message.error(error.response?.data?.message || $t('operations.domain.message.bulkDeleteFailed'))",
  ],
  [
    /message\.error\(response\.message \|\| \$t\('operations\.layout\.agent'\) \+ '绑定失败'\)/g,
    "message.error(response.message || $t('operations.domain.message.agentBindFailed'))",
  ],
  [
    /message\.error\(error\.response\?\.data\?\.message \|\| \$t\('operations\.layout\.agent'\) \+ '绑定失败'\)/g,
    "message.error(error.response?.data?.message || $t('operations.domain.message.agentBindFailed'))",
  ],
  [
    /message\.error\(response\.message \|\| \$t\('operations\.layout\.agent'\) \+ '解绑失败'\)/g,
    "message.error(response.message || $t('operations.domain.message.agentUnbindFailed'))",
  ],
  [
    /message\.error\(error\.response\?\.data\?\.message \|\| \$t\('operations\.layout\.agent'\) \+ '解绑失败'\)/g,
    "message.error(error.response?.data?.message || $t('operations.domain.message.agentUnbindFailed'))",
  ],
  [
    /message\.success\(`\$\{value \? '已添加' : '已移除'\}到其他档别表`\)/g,
    "message.success(value ? $t('operations.domain.message.addedToOtherOrg') : $t('operations.domain.message.removedFromOtherOrg'))",
  ],

  // use-type-label props
  [/use-type-label="OSS加速域名"/g, ':use-type-label="$t(\'operations.domain.useType.ossAcceleration\')"'],
  [/use-type-label="下载站域名"/g, ':use-type-label="$t(\'operations.domain.useType.downloadSite\')"'],
  [/modal-title="新增OSS加速域名"/g, ':modal-title="$t(\'operations.domain.createOssSubdomain\')"'],
  [/modal-title="新增下载站域名"/g, ':modal-title="$t(\'operations.domain.createDownloadSubdomain\')"'],

  // Certificate remaining
  [
    /placeholder="请输入域名,多个请换行,格式如下:&#10;www\.123\.com&#10;123\.com"/g,
    ':placeholder="$t(\'operations.certificate.domainsPlaceholder\')"',
  ],
  [
    /<div>• 使用 Let's Encrypt 免费证书，有效期为90天，自动续期<\/div>/g,
    "<div>• {{ $t('operations.certificate.applyHint1') }}</div>",
  ],
  [
    /<div>• 通过 DNS-01 验证方式，自动在 Route53 添加 TXT 记录<\/div>/g,
    "<div>• {{ $t('operations.certificate.applyHint2') }}</div>",
  ],
  [
    /<div>• 域名必须先在域名管理中创建（AWS Route53）<\/div>/g,
    "<div>• {{ $t('operations.certificate.applyHint3') }}</div>",
  ],
  [
    /<div>• 证书验证通常需要 2-5 分钟<\/div>/g,
    "<div>• {{ $t('operations.certificate.applyHint4') }}</div>",
  ],
  [/placeholder="证书绑定的域名"/g, ':placeholder="$t(\'operations.certificate.boundDomainPlaceholder\')"'],
  [/placeholder="请粘贴证书文件内容（\.crt 或 \.pem）"/g, ':placeholder="$t(\'operations.certificate.crtPlaceholder\')"'],
  [/placeholder="请粘贴私钥文件内容（\.key）"/g, ':placeholder="$t(\'operations.certificate.keyPlaceholder\')"'],
  [
    /<div>• 请确保证书和私钥文件匹配<\/div>/g,
    "<div>• {{ $t('operations.certificate.uploadHint1') }}</div>",
  ],
  [
    /<div>• 私钥文件请妥善保管，不要泄露给他人<\/div>/g,
    "<div>• {{ $t('operations.certificate.uploadHint2') }}</div>",
  ],
  [
    /<div>• 支持标准PEM格式的证书文件<\/div>/g,
    "<div>• {{ $t('operations.certificate.uploadHint3') }}</div>",
  ],
  [/<n-descriptions-item label="供应商">/g, '<n-descriptions-item :label="$t(\'operations.certificate.vendor\')">'],
  [/<n-descriptions-item label="证书类型">/g, '<n-descriptions-item :label="$t(\'operations.certificate.certType\')">'],
  [/h\('span', \{\}, '验证方式 '\)/g, "h('span', {}, $t('operations.certificate.verificationMethod') + ' ')"],
  [
    /`域名 \$\{mainDomain\} 未在系统中找到，请先在域名管理中创建该域名`/g,
    "$t('operations.certificate.domainNotFound', [mainDomain])",
  ],
  [
    /`✅ \$\{mainDomain\} 证书已创建！状态：待验证。请在证书列表中查看详情和安装脚本。`/g,
    "$t('operations.certificate.applySuccess', [mainDomain])",
  ],
  [
    /message\.info\(`下载证书\$\{type === 'crt' \? 'CRT' : 'KEY'\}文件`\)/g,
    "message.info($t('operations.certificate.downloadCertFile', [type === 'crt' ? 'CRT' : 'KEY']))",
  ],
  [
    /message\.info\(`续期证书: \$\{cert\.name\}`\)/g,
    "message.info($t('operations.certificate.renewInfo', [cert.name]))",
  ],
  [
    /message\.info\(`绑定域名到证书: \$\{cert\.name\}`\)/g,
    "message.info($t('operations.certificate.bindInfo', [cert.name]))",
  ],
  [
    /`DNS记录: \$\{result\.validationRecord\.name\} = \$\{result\.validationRecord\.value\}`/g,
    "$t('operations.certificate.dnsRecord', [result.validationRecord.name, result.validationRecord.value])",
  ],

  // Form modals - labels and placeholders
  [/label="弹窗图片（可选）"/g, ':label="$t(\'operations.form.popImageOptional\')"'],
  [/placeholder="从媒体库选择弹窗图片"/g, ':placeholder="$t(\'operations.form.popImagePlaceholder\')"'],
  [/placeholder="请输入弹窗内容，支持HTML格式\.\.\."/g, ':placeholder="$t(\'operations.form.popContentPlaceholder\')"'],
  [
    />支持HTML标签，例如：&lt;b&gt;粗体&lt;\/b&gt;、&lt;i&gt;斜体&lt;\/i&gt;、&lt;br&gt;换行等</g,
    ">{{ $t('operations.form.htmlHint') }}",
  ],
  [/\{\{ getCharacterCount\(\) \}\} 个字符/g, "{{ $t('operations.form.charCount', [getCharacterCount()]) }}"],
  [/<label class="mb-2 block text-sm font-medium">快速设置<\/label>/g, '<label class="mb-2 block text-sm font-medium">{{ $t(\'operations.form.quickSetup\') }}</label>'],
  [/<span class="font-medium">时间说明<\/span>/g, '<span class="font-medium">{{ $t(\'operations.form.timeHint\') }}</span>'],
  [/<p>• 开始时间：弹窗开始显示的时间（必填）<\/p>/g, '<p>• {{ $t(\'operations.form.timeStartHint\') }}</p>'],
  [/<p>• 结束时间：弹窗停止显示的时间（可选，不设置则长期有效）<\/p>/g, '<p>• {{ $t(\'operations.form.timeEndHint\') }}</p>'],
  [/<p>• 请确保结束时间大于开始时间<\/p>/g, '<p>• {{ $t(\'operations.form.timeOrderHint\') }}</p>'],
  [/placeholder="输入最大显示次数"/g, ':placeholder="$t(\'operations.form.maxDisplayPlaceholder\')"'],
  [/placeholder="输入显示间隔"/g, ':placeholder="$t(\'operations.form.displayIntervalPlaceholder\')"'],
  [/<n-checkbox value="homepage">首页加载<\/n-checkbox>/g, '<n-checkbox value="homepage">{{ $t(\'operations.form.homepageLoad\') }}</n-checkbox>'],
  [/<n-checkbox value="game_lobby">游戏大厅<\/n-checkbox>/g, '<n-checkbox value="game_lobby">{{ $t(\'operations.form.gameLobby\') }}</n-checkbox>'],
  [/<n-checkbox value="promotion">活动页面<\/n-checkbox>/g, '<n-checkbox value="promotion">{{ $t(\'operations.form.promotionPage\') }}</n-checkbox>'],
  [/<n-checkbox value="manual">手动触发<\/n-checkbox>/g, '<n-checkbox value="manual">{{ $t(\'operations.form.manualTrigger\') }}</n-checkbox>'],
  [/<span class="font-medium">展示说明<\/span>/g, '<span class="font-medium">{{ $t(\'operations.form.displayHint\') }}</span>'],
  [/<p>• 最大显示次数：单个用户最多看到弹窗的次数<\/p>/g, '<p>• {{ $t(\'operations.form.maxDisplayHint\') }}</p>'],
  [/<p>• 显示间隔：两次显示之间的最小间隔时间<\/p>/g, '<p>• {{ $t(\'operations.form.intervalHint\') }}</p>'],
  [/<p>• 展示入口：弹窗在哪些页面或场景下显示<\/p>/g, '<p>• {{ $t(\'operations.form.entryHint\') }}</p>'],
  [/placeholder="选择跳转类型"/g, ':placeholder="$t(\'operations.form.jumpType\')"'],
  [/placeholder="请输入跳转目标URL或ID"/g, ':placeholder="$t(\'operations.form.jumpTargetPlaceholder\')"'],
  [/<span class="font-medium">跳转说明<\/span>/g, '<span class="font-medium">{{ $t(\'operations.form.jumpHint\') }}</span>'],
  [/<p>• 无跳转：点击弹窗无任何响应<\/p>/g, '<p>• {{ $t(\'operations.form.jumpNoneHint\') }}</p>'],
  [/<p>• 外链跳转：跳转到外部网站，需要完整URL<\/p>/g, '<p>• {{ $t(\'operations.form.jumpExternalHint\') }}</p>'],
  [/<p>• 内部功能：跳转到系统内部页面<\/p>/g, '<p>• {{ $t(\'operations.form.jumpInternalHint\') }}</p>'],
  [/<p>• 游戏：跳转到指定游戏<\/p>/g, '<p>• {{ $t(\'operations.form.jumpGameHint\') }}</p>'],
  [/<p>• 活动页面：跳转到活动详情页<\/p>/g, '<p>• {{ $t(\'operations.form.jumpActivityHint\') }}</p>'],

  // Form validation
  [
    /\{ required: true, message: \$t\('common\.pleaseEnter'\) \+ '弹窗标题', trigger: 'blur' \}/g,
    "{ required: true, message: $t('common.pleaseEnterField', [$t('operations.form.popTitle')]), trigger: 'blur' }",
  ],
  [/message: '弹窗标题长度在1到100个字符'/g, "message: $t('operations.form.titleLength')"],
  [/message: '弹窗图片为可选字段'/g, "message: $t('operations.form.imageOptional')"],
  [
    /\{ required: true, message: \$t\('common\.pleaseSelect'\) \+ '语言', trigger: 'change' \}/g,
    "{ required: true, message: $t('common.pleaseSelect') + ' ' + $t('operations.language'), trigger: 'change' }",
  ],
  [
    /\{ required: true, message: \$t\('common\.pleaseSelect'\) \+ '币种', trigger: 'change' \}/g,
    "{ required: true, message: $t('common.pleaseSelect') + ' ' + $t('common.currency'), trigger: 'change' }",
  ],
  [
    /\{ required: true, message: \$t\('common\.pleaseSelect'\) \+ '受众', trigger: 'change' \}/g,
    "{ required: true, message: $t('common.pleaseSelect') + ' ' + $t('operations.messageSettings.targetAudience'), trigger: 'change' }",
  ],
  [/message: '排序数值在0到9999之间'/g, "message: $t('operations.form.sortRange')"],
  [
    /\{ required: true, message: \$t\('common\.pleaseSelect'\) \+ '开始时间', trigger: 'change' \}/g,
    "{ required: true, message: $t('common.pleaseSelect') + ' ' + $t('common.startTime'), trigger: 'change' }",
  ],
  [/return new Error\('请选择开始时间'\)/g, "return new Error($t('common.pleaseSelect') + ' ' + $t('common.startTime'))"],
  [/return new Error\('请选择有效的开始时间'\)/g, "return new Error($t('operations.form.validStartTime'))"],
  [/return new Error\('请选择有效的结束时间'\)/g, "return new Error($t('operations.form.validEndTime'))"],
  [/message: '最大显示次数在1到999之间'/g, "message: $t('operations.form.displayTimesRange')"],
  [/message: '显示间隔在1到168小时之间'/g, "message: $t('operations.form.intervalRange')"],
  [/message: '请至少选择一个展示入口'/g, "message: $t('operations.form.selectEntry')"],
  [
    /\{ required: true, message: \$t\('common\.pleaseSelect'\) \+ '跳转类型', trigger: 'change' \}/g,
    "{ required: true, message: $t('common.pleaseSelect') + ' ' + $t('operations.form.jumpType'), trigger: 'change' }",
  ],
  [/return new Error\('请输入跳转目标'\)/g, "return new Error($t('operations.form.enterJumpTarget'))"],
  [
    /\{ required: true, message: \$t\('common\.pleaseSelect'\) \+ '状态', trigger: 'change' \}/g,
    "{ required: true, message: $t('common.pleaseSelect') + ' ' + $t('common.status'), trigger: 'change' }",
  ],
  [
    /\{ label: '新' \+ \$t\('operations\.layout\.register'\) \+ '用户', value: '新' \+ \$t\('operations\.layout\.register'\) \+ '用户' \}/g,
    "{ label: $t('operations.form.audienceNewUser'), value: 'new_user' }",
  ],
  [
    /\{ label: \$t\('operations\.layout\.deposit'\) \+ '用户', value: \$t\('operations\.layout\.deposit'\) \+ '用户' \}/g,
    "{ label: $t('operations.form.audienceDeposit'), value: 'deposit_user' }",
  ],
  [
    /\{ label: '未' \+ \$t\('operations\.layout\.deposit'\) \+ '用户', value: '未' \+ \$t\('operations\.layout\.deposit'\) \+ '用户' \}/g,
    "{ label: $t('operations.form.audienceNoDeposit'), value: 'no_deposit_user' }",
  ],
  [
    /<n-checkbox value="login">\{\{ \$t\('operations\.layout\.login'\) \}\}后弹窗<\/n-checkbox>/g,
    '<n-checkbox value="login">{{ $t(\'operations.form.afterLogin\') }}</n-checkbox>',
  ],
  [
    /<n-checkbox value="deposit">\{\{ \$t\('operations\.layout\.deposit'\) \}\}页面<\/n-checkbox>/g,
    '<n-checkbox value="deposit">{{ $t(\'operations.form.depositPage\') }}</n-checkbox>',
  ],
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
