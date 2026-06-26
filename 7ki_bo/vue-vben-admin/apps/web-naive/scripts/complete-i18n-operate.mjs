import fs from 'fs';
import path from 'path';

const ROOT = 'src/views/operateManager';
const LOCALE_DIR = 'src/locales/langs';

// Merge locale extensions
const extensions = JSON.parse(
  fs.readFileSync('scripts/locale-merge-operate.json', 'utf8'),
);

for (const [lang, ext] of Object.entries(extensions)) {
  const filePath = path.join(LOCALE_DIR, lang, 'operations.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (const [key, value] of Object.entries(ext)) {
    if (typeof value === 'object' && !Array.isArray(value)) {
      data[key] = { ...(data[key] || {}), ...value };
    } else {
      data[key] = value;
    }
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  console.log('Merged locale:', filePath);
}

const replacements = [
  // Common template fixes
  [/>\s*搜索\s*</g, '>{{ $t(\'common.search\') }}<'],
  [/>\s*新增\s*</g, '>{{ $t(\'common.create\') }}<'],
  [/>\s*关闭\s*</g, '>{{ $t(\'common.close\') }}<'],
  [/>\s*上传\s*</g, '>{{ $t(\'common.upload\') }}<'],
  [/>\s*申请\s*</g, '>{{ $t(\'operations.certificate.apply\') }}<'],
  [/>\s*执行\s*</g, '>{{ $t(\'operations.healthCheck.execute\') }}<'],
  [/>\s*检测\s*</g, '>{{ $t(\'operations.healthCheck.detect\') }}<'],
  [/>\s*批量删除\s*</g, '>{{ $t(\'operations.domain.action.bulkDelete\') }}<'],
  [/>\s*申请免费证书\s*</g, '>{{ $t(\'operations.certificate.applyFree\') }}<'],
  [/>\s*上传证书\s*</g, '>{{ $t(\'operations.certificate.uploadCert\') }}<'],
  [/placeholder="请输入证书名称"/g, ':placeholder="$t(\'operations.certificate.filterName\')"'],
  [/placeholder="证书到期时间"/g, ':placeholder="$t(\'operations.certificate.filterExpiry\')"'],
  [/placeholder="供应商"/g, ':placeholder="$t(\'operations.certificate.filterVendor\')"'],
  [/placeholder="证书类型"/g, ':placeholder="$t(\'operations.certificate.filterType\')"'],
  [/title="申请免费证书"/g, ':title="$t(\'operations.certificate.applyTitle\')"'],
  [/title="证书详情"/g, ':title="$t(\'operations.certificate.detailTitle\')"'],
  [/title="检测详情"/g, ':title="$t(\'operations.healthCheck.detailTitle\')"'],
  [/tab="基本信息"/g, ':tab="$t(\'operations.form.tabBasic\')"'],
  [/tab="时间设置"/g, ':tab="$t(\'operations.form.tabTime\')"'],
  [/tab="展示设置"/g, ':tab="$t(\'operations.form.tabDisplay\')"'],
  [/tab="显示设置"/g, ':tab="$t(\'operations.form.tabDisplaySettings\')"'],
  [/tab="跳转设置"/g, ':tab="$t(\'operations.form.tabJump\')"'],
  [/tab="高级设置"/g, ':tab="$t(\'operations.form.tabAdvanced\')"'],
  [/tab="访问成功"/g, ':tab="$t(\'operations.healthCheck.tabSuccess\')"'],
  [/tab="访问失败"/g, ':tab="$t(\'operations.healthCheck.tabFailed\')"'],
  [/label="验证方式"/g, ':label="$t(\'operations.certificate.verificationMethod\')"'],
  [/label="\*域名"/g, ':label="$t(\'operations.certificate.domainsLabel\')"'],
  [/label="证书名称"/g, ':label="$t(\'operations.certificate.certName\')"'],
  [/label="域名"/g, ':label="$t(\'operations.certificate.boundDomain\')"'],
  [/label="CRT文件内容"/g, ':label="$t(\'operations.certificate.crtContent\')"'],
  [/label="KEY文件内容"/g, ':label="$t(\'operations.certificate.keyContent\')"'],
  [/label="证书ID"/g, ':label="$t(\'operations.certificate.certId\')"'],
  [/label="通配符证书"/g, ':label="$t(\'operations.certificate.wildcardCert\')"'],
  [/label="签发日期"/g, ':label="$t(\'operations.certificate.issuedDate\')"'],
  [/label="到期日期"/g, ':label="$t(\'operations.certificate.expiryDate\')"'],
  [/label="绑定域名"/g, ':label="$t(\'operations.certificate.bindTitle\')"'],
  [/placeholder="全部域名"/g, ':placeholder="$t(\'operations.healthCheck.allDomains\')"'],
  [/placeholder="检测状态"/g, ':placeholder="$t(\'operations.healthCheck.checkStatus\')"'],
  [/placeholder="中国"/g, ':placeholder="$t(\'operations.domain.status.china\')"'],
  [/>\s*显示全部域名\s*</g, '>{{ $t(\'operations.healthCheck.showAllDomains\') }}<'],
  [/>\s*格式不正确\s*</g, '>{{ $t(\'operations.certificate.invalidFormat\') }}<'],
  [/>\s*单域名证书\s*</g, '>{{ $t(\'operations.certificate.singleDomain\') }}<'],
  [/>\s*多域名通配符证书 \(仅支持顶级域名\)\s*</g, '>{{ $t(\'operations.certificate.wildcardDomain\') }}<'],
  [/>\s*添加TXT类型解析\s*</g, '>{{ $t(\'operations.certificate.addTxtRecord\') }}<'],
  [/>\s*1小时\s*</g, '>{{ $t(\'operations.form.hour1\') }}<'],
  [/>\s*6小时\s*</g, '>{{ $t(\'operations.form.hour6\') }}<'],
  [/>\s*1天\s*</g, '>{{ $t(\'operations.form.day1\') }}<'],
  [/>\s*7天\s*</g, '>{{ $t(\'operations.form.day7\') }}<'],
  [/>\s*30天\s*</g, '>{{ $t(\'operations.form.day30\') }}<'],
  [/>\s*更新\s*</g, '>{{ $t(\'operations.form.update\') }}<'],
  [/>\s*创建\s*</g, '>{{ $t(\'operations.form.create\') }}<'],
  [/isEditing \? '编辑Banner' :/g, "isEditing ? $t('operations.form.editBanner') :"],
  [/isEditing \? '编辑弹窗' : '新增弹窗'/g, "isEditing ? $t('operations.form.editPop') : $t('operations.form.addPop')"],
  [/isEditing \? '编辑跑马灯通知' : '新增跑马灯通知'/g, "isEditing ? $t('operations.form.editPmd') : $t('operations.form.addPmd')"],
  [/isEditing \? '编辑' : '创建'/g, "isEditing ? $t('operations.form.update') : $t('operations.form.create')"],
  [/isEditing \? '更新' : '创建'/g, "isEditing ? $t('operations.form.update') : $t('operations.form.create')"],
  [/label="排序（可选）"/g, ':label="$t(\'operations.form.sortOptional\')"'],
  [/label="排序\(可选\)"/g, ':label="$t(\'operations.form.sortOptional\')"'],
  [/label="停留时间\(秒\)（可选）"/g, ':label="$t(\'operations.form.staySecondsOptional\')"'],
  [/label="结束时间（可选）"/g, ':label="$t(\'operations.form.endTimeOptional\')"'],
  [/label="弹窗标题"/g, ':label="$t(\'operations.form.popTitle\')"'],
  [/label="弹窗内容"/g, ':label="$t(\'operations.form.popContent\')"'],
  [/label="展示入口"/g, ':label="$t(\'operations.form.entryPoints\')"'],
  [/label="跳转类型"/g, ':label="$t(\'operations.form.jumpType\')"'],
  [/label="是否启用"/g, ':label="$t(\'operations.form.isEnabled\')"'],
  [/label="后台备注"/g, ':label="$t(\'operations.messageSettings.backendRemark\')"'],
  [/label="展示状态"/g, ':label="$t(\'operations.form.displayStatus\')"'],
  [/label="通知内容"/g, ':label="$t(\'operations.form.notificationContent\')"'],
  [/label="滚动速度"/g, ':label="$t(\'operations.form.scrollSpeed\')"'],
  [/label="文字颜色"/g, ':label="$t(\'operations.form.textColor\')"'],
  [/label="背景颜色"/g, ':label="$t(\'operations.form.bgColor\')"'],
  [/label="显示位置"/g, ':label="$t(\'operations.messageSettings.displayPosition\')"'],
  [/label="预览效果"/g, ':label="$t(\'operations.form.previewEffect\')"'],
  [/label="用户筛选条件"/g, ':label="$t(\'operations.form.userFilter\')"'],
  [/label="显示优先级"/g, ':label="$t(\'operations.form.displayPriority\')"'],
  [/label="点击行为"/g, ':label="$t(\'operations.form.clickAction\')"'],
  [/label="跳转链接"/g, ':label="$t(\'operations.form.redirectUrl\')"'],
  [/label="最大显示次数"/g, ':label="$t(\'operations.form.maxDisplayTimes\')"'],
  [/label="显示间隔（小时）"/g, ':label="$t(\'operations.form.displayInterval\')"'],
  [/label="受众"/g, ':label="$t(\'operations.messageSettings.targetAudience\')"'],
  [/label="停留时间\(秒\)"/g, ':label="$t(\'operations.form.displayDurationSec\')"'],
  [/label="Banner图片"/g, ':label="$t(\'operations.form.bannerImage\')"'],
  [/label="选择活动"/g, ':label="$t(\'operations.form.selectActivity\')"'],
  [/label="选择任务"/g, ':label="$t(\'operations.form.selectTask\')"'],
  [/label="选择游戏平台"/g, ':label="$t(\'operations.form.selectGamePlatform\')"'],
  [/placeholder="输入排序数值"/g, ':placeholder="$t(\'operations.form.sortPlaceholder\')"'],
  [/placeholder="选择开始时间"/g, ':placeholder="$t(\'operations.messageSettings.startTime\')"'],
  [/placeholder="选择结束时间"/g, ':placeholder="$t(\'operations.messageSettings.endTime\')"'],
  [/placeholder="请输入弹窗标题"/g, ':placeholder="$t(\'operations.form.popTitlePlaceholder\')"'],
  [/placeholder="请输入Banner名称"/g, ':placeholder="$t(\'operations.form.bannerNamePlaceholder\')"'],
  [/placeholder="输入跑马灯通知内容（支持 HTML 和 Emoji）"/g, ':placeholder="$t(\'operations.form.pmdContentPlaceholder\')"'],
  [/placeholder="选择展示状态"/g, ':placeholder="$t(\'operations.form.displayStatus\')"'],
  [/placeholder="选择滚动速度"/g, ':placeholder="$t(\'operations.form.scrollSpeed\')"'],
  [/placeholder="选择显示位置"/g, ':placeholder="$t(\'operations.messageSettings.displayPosition\')"'],
  [/placeholder="选择优先级"/g, ':placeholder="$t(\'operations.form.displayPriority\')"'],
  [/placeholder="选择点击行为"/g, ':placeholder="$t(\'operations.form.clickAction\')"'],
  [/placeholder="输入跳转链接"/g, ':placeholder="$t(\'operations.form.redirectPlaceholder\')"'],
  [/placeholder="输入后台备注信息"/g, ':placeholder="$t(\'operations.messageSettings.backendRemark\')"'],
  [/placeholder="选择受众"/g, ':placeholder="$t(\'operations.messageSettings.targetAudience\')"'],
  [/placeholder="输入停留时间"/g, ':placeholder="$t(\'operations.form.displayDurationPlaceholder\')"'],
  [/alt="Banner预览"/g, ':alt="$t(\'operations.form.bannerPreview\')"'],
  [/alt="弹窗图片预览"/g, ':alt="$t(\'operations.form.popImagePreview\')"'],
  [/formData\.content \|\| '这里是预览内容\.\.\.'/g, "formData.content || $t('operations.form.previewContent')"],
  [/targetAudience: '娱乐位普通会员'/g, "targetAudience: $t('operations.form.audienceRegular')"],
  [/message\.error\('请检查表单填写'\)/g, "message.error($t('operations.form.checkForm'))"],
  [/message\.error\('请检查表单信息'\)/g, "message.error($t('operations.form.checkForm'))"],
  [/message\.error\('请检查时间设置'\)/g, "message.error($t('operations.form.checkTimeForm'))"],
  [/message\.error\('结束时间必须大于开始时间'\)/g, "message.error($t('operations.form.endAfterStart'))"],
  [/message\.success\('弹窗更新成功'\)/g, "message.success($t('operations.form.popUpdateSuccess'))"],
  [/message\.success\('弹窗创建成功'\)/g, "message.success($t('operations.form.popCreateSuccess'))"],
  [/message\.error\(isEditing\.value \? '弹窗更新失败' : '弹窗创建失败'\)/g, "message.error(isEditing.value ? $t('operations.form.popUpdateFailed') : $t('operations.form.popCreateFailed'))"],
  [/message\.success\('更新成功'\)/g, "message.success($t('operations.form.updateSuccess'))"],
  [/message\.error\('加载活动列表失败'\)/g, "message.error($t('operations.form.loadActivitiesFailed'))"],
  [/message\.error\('加载任务列表失败'\)/g, "message.error($t('operations.form.loadTasksFailed'))"],
  [/message\.error\('加载游戏平台列表失败'\)/g, "message.error($t('operations.form.loadGamesFailed'))"],
  [/message\.error\('获取证书列表失败: '/g, "message.error($t('operations.certificate.fetchFailed', ['"],
  [/message\.error\('请输入至少一个域名'\)/g, "message.error($t('operations.certificate.enterOneDomain'))"],
  [/message\.success\('证书上传成功'\)/g, "message.success($t('operations.certificate.uploadSuccess'))"],
  [/message\.error\('证书上传失败'\)/g, "message.error($t('operations.certificate.uploadFailed'))"],
  [/message\.error\('证书未绑定域名'\)/g, "message.error($t('operations.certificate.notBoundDomain'))"],
  [/message\.info\('NGINX配置命令已复制到剪贴板'\)/g, "message.info($t('operations.certificate.nginxCopied'))"],
  [/message\.info\('请查看控制台获取NGINX配置命令'\)/g, "message.info($t('operations.certificate.nginxConsole'))"],
  [/message\.error\(result\.message \|\| 'NGINX配置失败'\)/g, "message.error(result.message || $t('operations.certificate.nginxFailed'))"],
  [/message\.error\('NGINX配置失败: '/g, "message.error($t('operations.certificate.nginxFailedWith', ['"],
  [/message\.error\(result\.message \|\| 'DNS验证失败'\)/g, "message.error(result.message || $t('operations.certificate.dnsValidateFailed'))"],
  [/message\.error\('DNS验证失败: '/g, "message.error($t('operations.certificate.dnsValidateFailedWith', ['"],
  [/message\.success\('证书删除成功'\)/g, "message.success($t('operations.certificate.deleteSuccess'))"],
  [/message\.error\(result\.message \|\| '证书删除失败'\)/g, "message.error(result.message || $t('operations.certificate.deleteFailed'))"],
  [/message\.error\('证书删除失败: '/g, "message.error($t('operations.certificate.deleteFailedWith', ['"],
  [/message\.error\(result\.message \|\| '证书申请失败'\)/g, "message.error(result.message || $t('operations.certificate.applyFailed'))"],
  [/message\.error\('证书申请失败: '/g, "message.error($t('operations.certificate.applyFailedWith', ['"],
  [/message\.info\('暂无健康检测数据。请先创建域名并等待初始同步完成。'\)/g, "message.info($t('operations.healthCheck.noDataYet'))"],
  [/message\.error\('获取检测数据失败: '/g, "message.error($t('operations.healthCheck.fetchFailed', ['"],
  [/message\.info\('该域名暂无详细监测数据'\)/g, "message.info($t('operations.healthCheck.noDetailData'))"],
  [/message\.warning\('获取详细数据失败'\)/g, "message.warning($t('operations.healthCheck.fetchDetailFailed'))"],
  [/message\.error\('获取详细数据失败'\)/g, "message.error($t('operations.healthCheck.fetchDetailFailed'))"],
  [/message\.warning\('请选择要检测的域名'\)/g, "message.warning($t('operations.healthCheck.selectDomains'))"],
  [/message\.success\('批量检测完成'\)/g, "message.success($t('operations.domain.message.batchDetectComplete'))"],
  [/message\.error\('批量检测失败'\)/g, "message.error($t('operations.domain.message.batchDetectFailed'))"],
  [/message\.error\(error\.response\?\.data\?\.message \|\| '切换CDN节点失败'\)/g, "message.error(error.response?.data?.message || $t('operations.domain.message.cdnSwitchFailed'))"],
  [/message\.error\(error\.response\?\.data\?\.message \|\| '清理缓存失败'\)/g, "message.error(error.response?.data?.message || $t('operations.domain.message.cacheClearFailed'))"],
  [/message\.warning\(result\.message \|\| '验证失败'\)/g, "message.warning(result.message || $t('operations.domain.message.verifyFailed'))"],
  [/message\.error\(error\.response\?\.data\?\.message \|\| '验证失败'\)/g, "message.error(error.response?.data?.message || $t('operations.domain.message.verifyFailed'))"],
  [/message\.warning\(error\.response\?\.data\?\.message \|\| '请稍后再试'\)/g, "message.warning(error.response?.data?.message || $t('operations.domain.message.tryAgainLater'))"],
  [/filters\.region = '中国'/g, "filters.region = 'CHINA'"],
  [/region: '中国'/g, "region: 'CHINA'"],
  [/default: \(\) => '续期'/g, "default: () => $t('operations.certificate.renew')"],
  [/default: \(\) => '验证DNS'/g, "default: () => $t('operations.certificate.validateDns')"],
  [/default: \(\) => '配置HTTPS'/g, "default: () => $t('operations.certificate.configureHttps')"],
  [/default: \(\) => '下载'/g, "default: () => $t('common.download')"],
  [/default: \(\) => '更换节点'/g, "default: () => $t('operations.domain.action.switchNode')"],
  [/row\.isWildcard \? '是' : '否'/g, "row.isWildcard ? $t('common.yes') : $t('common.no')"],
  [/selectedCertificate\.isWildcard \? '是' : '否'/g, "selectedCertificate.isWildcard ? $t('common.yes') : $t('common.no')"],
  [/days > 0 \? `还有\$\{days\}天` : '已过期'/g, "days > 0 ? $t('operations.certificate.daysRemaining', [days]) : $t('operations.certificate.expired')"],
  [/'⚠️ 确认删除证书？'/g, "$t('operations.certificate.confirmDeleteCert')"],
  [/`证书域名: \$\{row\.domains\?\.join\(', '\) \|\| '未知'\}`/g, "$t('operations.certificate.certDomainLabel') + ': ' + (row.domains?.join(', ') || $t('operations.certificate.unknown'))"],
  [/VALID: '正常'/g, "VALID: $t('operations.certificate.validStatus')"],
  [/PENDING_VALIDATION: '待验证'/g, "PENDING_VALIDATION: $t('operations.certificate.pendingValidation')"],
  [/EXPIRING_SOON: '即将过期'/g, "EXPIRING_SOON: $t('operations.domain.status.expiringSoon')"],
  [/EXPIRED: '已过期'/g, "EXPIRED: $t('operations.certificate.expired')"],
  [/DNS: 'DNS验证'/g, "DNS: $t('operations.domain.verification.dns')"],
  [/HTTP: 'HTTP验证'/g, "HTTP: $t('operations.domain.verification.http')"],
  [/FILE: '文件验证'/g, "FILE: $t('operations.certificate.fileValidation')"],
  [/ALIYUN: '阿里云'/g, "ALIYUN: $t('operations.certificate.providerAliyun')"],
  [/TENCENT_CLOUD: '腾讯云'/g, "TENCENT_CLOUD: $t('operations.certificate.providerTencent')"],
  [/CUSTOM: '自定义'/g, "CUSTOM: $t('operations.certificate.providerCustom')"],
  [/FREE: \{ text: '免费'/g, "FREE: { text: $t('operations.certificate.free')"],
  [/PAID: \{ text: '付费'/g, "PAID: { text: $t('operations.certificate.paid')"],
  [/UPLOADED: \{ text: '自上传'/g, "UPLOADED: { text: $t('operations.certificate.uploadedCert')"],
  [/title: '证书ID'/g, "title: $t('operations.certificate.certId')"],
  [/title: '证书名称'/g, "title: $t('operations.certificate.certName')"],
  [/title: '供应商'/g, "title: $t('operations.certificate.vendor')"],
  [/title: 'CRT文件'/g, "title: $t('operations.certificate.crtFile')"],
  [/title: 'key文件'/g, "title: $t('operations.certificate.keyFile')"],
  [/title: '类型'/g, "title: $t('common.type')"],
  [/title: '证书状态'/g, "title: $t('operations.certificate.certStatus')"],
  [/title: '是否通配符证书'/g, "title: $t('operations.certificate.isWildcard')"],
  [/title: '证书对应域名'/g, "title: $t('operations.certificate.certDomains')"],
  [/title: '到期时间'/g, "title: $t('operations.certificate.expiryTime')"],
  [/default: \(\) => '证书签发时使用的域名验证方式'/g, "default: () => $t('operations.certificate.verificationTooltip')"],
  [/\{ label: '免费证书', value: 'FREE' \}/g, "{ label: $t('operations.certificate.freeCert'), value: 'FREE' }"],
  [/\{ label: '付费证书', value: 'PAID' \}/g, "{ label: $t('operations.certificate.paidCert'), value: 'PAID' }"],
  [/\{ label: '自上传', value: 'UPLOADED' \}/g, "{ label: $t('operations.certificate.uploadedCert'), value: 'UPLOADED' }"],
  [/\{ label: '正常', value: 'VALID' \}/g, "{ label: $t('operations.certificate.validStatus'), value: 'VALID' }"],
  [/\{ label: '待验证', value: 'PENDING_VALIDATION' \}/g, "{ label: $t('operations.certificate.pendingValidation'), value: 'PENDING_VALIDATION' }"],
  [/\{ label: 'DNS验证', value: 'DNS' \}/g, "{ label: $t('operations.domain.verification.dns'), value: 'DNS' }"],
  [/\{ label: 'HTTP验证', value: 'HTTP' \}/g, "{ label: $t('operations.domain.verification.http'), value: 'HTTP' }"],
  [/\{ label: '文件验证', value: 'FILE' \}/g, "{ label: $t('operations.certificate.fileValidation'), value: 'FILE' }"],
  [/\{ label: '阿里云', value: 'ALIYUN' \}/g, "{ label: $t('operations.certificate.providerAliyun'), value: 'ALIYUN' }"],
  [/\{ label: '腾讯云', value: 'TENCENT_CLOUD' \}/g, "{ label: $t('operations.certificate.providerTencent'), value: 'TENCENT_CLOUD' }"],
  [/\{ label: '自定义', value: 'CUSTOM' \}/g, "{ label: $t('operations.certificate.providerCustom'), value: 'CUSTOM' }"],
  [/message: \$t\('common\.pleaseEnter'\) \+ '域名'/g, "message: $t('common.pleaseEnterField', [$t('operations.certificate.validateDomain')])"],
  [/message: \$t\('common\.pleaseEnter'\) \+ '证书名称'/g, "message: $t('common.pleaseEnterField', [$t('operations.certificate.validateCertName')])"],
  [/message: \$t\('common\.pleaseEnter'\) \+ 'CRT文件内容'/g, "message: $t('common.pleaseEnterField', [$t('operations.certificate.validateCrt')])"],
  [/message: \$t\('common\.pleaseEnter'\) \+ 'KEY文件内容'/g, "message: $t('common.pleaseEnterField', [$t('operations.certificate.validateKey')])"],
  [/\{ label: '生效中', value: 'active' \}/g, "{ label: $t('operations.form.statusActive'), value: 'active' }"],
  [/\{ label: '已过期', value: 'expired' \}/g, "{ label: $t('operations.form.statusExpired'), value: 'expired' }"],
  [/\{ label: '已停用', value: 'inactive' \}/g, "{ label: $t('operations.form.statusInactive'), value: 'inactive' }"],
  [/\{ label: '娱乐位普通会员', value: '娱乐位普通会员' \}/g, "{ label: $t('operations.form.audienceRegular'), value: 'regular' }"],
  [/\{ label: 'VIP会员', value: 'VIP会员' \}/g, "{ label: $t('operations.form.audienceVip'), value: 'vip' }"],
  [/\{ label: '活跃用户', value: '活跃用户' \}/g, "{ label: $t('operations.form.audienceActive'), value: 'active' }"],
  [/\{ label: '全部用户', value: '全部用户' \}/g, "{ label: $t('operations.form.audienceAll'), value: 'all' }"],
  [/\{ label: '慢速', value: 'slow' \}/g, "{ label: $t('operations.form.speedSlow'), value: 'slow' }"],
  [/\{ label: '中速', value: 'medium' \}/g, "{ label: $t('operations.form.speedMedium'), value: 'medium' }"],
  [/\{ label: '快速', value: 'fast' \}/g, "{ label: $t('operations.form.speedFast'), value: 'fast' }"],
  [/\{ label: '顶部', value: 'top' \}/g, "{ label: $t('operations.form.posTop'), value: 'top' }"],
  [/\{ label: '底部', value: 'bottom' \}/g, "{ label: $t('operations.form.posBottom'), value: 'bottom' }"],
  [/\{ label: '中部', value: 'center' \}/g, "{ label: $t('operations.form.posCenter'), value: 'center' }"],
  [/\{ label: '低', value: 'low' \}/g, "{ label: $t('operations.form.priorityLow'), value: 'low' }"],
  [/\{ label: '普通', value: 'normal' \}/g, "{ label: $t('operations.form.priorityNormal'), value: 'normal' }"],
  [/\{ label: '高', value: 'high' \}/g, "{ label: $t('operations.form.priorityHigh'), value: 'high' }"],
  [/\{ label: '紧急', value: 'urgent' \}/g, "{ label: $t('operations.form.priorityUrgent'), value: 'urgent' }"],
  [/\{ label: '无操作', value: 'none' \}/g, "{ label: $t('operations.form.clickNone'), value: 'none' }"],
  [/\{ label: '页面跳转', value: 'redirect' \}/g, "{ label: $t('operations.form.clickRedirect'), value: 'redirect' }"],
  [/\{ label: '弹出详情', value: 'popup' \}/g, "{ label: $t('operations.form.clickPopup'), value: 'popup' }"],
  [/\{ label: '会员层级', value: 'vip' \}/g, "{ label: $t('operations.messageSettings.option.receiverVipLevel'), value: 'vip' }"],
  [/\{ label: '英文', value: 'en-US' \}/g, "{ label: $t('operations.messageSettings.option.langEn'), value: 'en-US' }"],
  [/\{ label: '葡语', value: 'pt-BR' \}/g, "{ label: $t('operations.messageSettings.option.langPt'), value: 'pt-BR' }"],
  [/\{ label: '西班牙语', value: 'es-ES' \}/g, "{ label: $t('operations.messageSettings.option.langEs'), value: 'es-ES' }"],
  [/\{ label: '日语', value: 'ja-JP' \}/g, "{ label: $t('operations.messageSettings.option.langJa'), value: 'ja-JP' }"],
  [/if \(score >= 85\) return '优'/g, "if (score >= 85) return $t('operations.domain.status.excellent')"],
  [/if \(score >= 70\) return '良'/g, "if (score >= 70) return $t('operations.domain.status.good')"],
  [/if \(score >= 60\) return '中'/g, "if (score >= 60) return $t('operations.healthCheck.statusMedium')"],
  [/return '差'/g, "return $t('operations.domain.status.poor')"],
  [/default: \(\) => '建议更换域名'/g, "default: () => $t('operations.healthCheck.suggestChangeDomain')"],
  [/status: check\.checkStatus \|\| '正常'/g, "status: check.checkStatus || $t('operations.healthCheck.statusNormal')"],
  [/locationStats\[loc\]\.status = '失败'/g, "locationStats[loc].status = $t('operations.healthCheck.statusFailed')"],
  [/if \(health\.status === '失败'\)/g, "if (health.status === $t('operations.healthCheck.statusFailed'))"],
  [/health \? health\.status : '未检测'/g, "health ? health.status : $t('operations.healthCheck.notDetected')"],
  [/'CN-Beijing': \{ lat: 39\.9042, lng: 116\.4074, name: '北京' \}/g, "'CN-Beijing': { lat: 39.9042, lng: 116.4074, name: $t('operations.healthCheck.cityBeijing') }"],
  [/'CN-Shanghai': \{ lat: 31\.2304, lng: 121\.4737, name: '上海' \}/g, "'CN-Shanghai': { lat: 31.2304, lng: 121.4737, name: $t('operations.healthCheck.cityShanghai') }"],
  [/'CN-Guangzhou': \{ lat: 23\.1291, lng: 113\.2644, name: '广州' \}/g, "'CN-Guangzhou': { lat: 23.1291, lng: 113.2644, name: $t('operations.healthCheck.cityGuangzhou') }"],
  [/'CN-Chengdu': \{ lat: 30\.5728, lng: 104\.0668, name: '成都' \}/g, "'CN-Chengdu': { lat: 30.5728, lng: 104.0668, name: $t('operations.healthCheck.cityChengdu') }"],
  [/default: \(\) => \(isDisabled \? '已停用' : '启用成功'\)/g, "default: () => (isDisabled ? $t('operations.messageSettings.option.statusDisabled') : $t('operations.domain.status.enabledSuccess'))"],
  [/statusMap\.NORMAL \|\| \{ type: 'success', text: '正常' \}/g, "statusMap.NORMAL || { type: 'success', text: $t('operations.domain.status.normal') }"],
  [/default: \(\) => '删除这个弹窗吗？'/g, "default: () => $t('operations.messageSettings.confirmDeletePop')"],
  [/message\.error\('获取统计数据失败'\)/g, "message.error($t('operations.domain.message.fetchStatsFailed'))"],
  [/message\.success\('导出报表功能开发中'\)/g, "message.success($t('operations.domain.message.exportDeveloping'))"],
  [/message\.warning\('暂无该月域名数据'\)/g, "message.warning($t('operations.domain.message.noDomainData'))"],
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
