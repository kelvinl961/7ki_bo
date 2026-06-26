import fs from 'fs';
import path from 'path';

const FM = 'operations.form';
const MS = 'operations.messageSettings';
const CS = 'operations.domain.createSubdomain';

const replacements = [
  // OperationMessageFormModal
  [/:title="editingItem \? '编辑通知' :/g, ":title=\"editingItem ? $t('operations.form.editNotification') :"],
  [/placeholder="请输入通知标题"/g, ':placeholder="$t(\'operations.form.notificationTitlePlaceholder\')"'],
  [/placeholder="请输入通知内容"/g, ':placeholder="$t(\'operations.form.notificationContentPlaceholder\')"'],
  [/label="是否立即发送"/g, ':label="$t(\'operations.form.immediateSend\')"'],
  [/>\s*开启后将立即发送通知，否则按时间段发送\s*</g, ">{{ $t('operations.form.immediateSendHint') }}<"],
  [/>\s*开启后通知将以弹窗形式显示\s*</g, ">{{ $t('operations.form.popupDisplayHint') }}<"],
  [/>\s*开启后支持视频内容推送\s*</g, ">{{ $t('operations.form.videoPushHint') }}<"],
  [/label="已读\/发送"/g, ':label="$t(\'operations.messageSettings.readOrSent\')"'],
  [/>\s*标记为已读或已发送状态\s*</g, ">{{ $t('operations.form.readSentHint') }}<"],
  [/label="消息优先级"/g, ':label="$t(\'operations.form.messagePriority\')"'],
  [/label="消息图标（可选）"/g, ':label="$t(\'operations.form.messageIcon\')"'],
  [/placeholder="从媒体库选择消息图标"/g, ':placeholder="$t(\'operations.form.messageIconPlaceholder\')"'],
  [/>\s*选择一个图标来增强消息的视觉效果（可选）\s*</g, ">{{ $t('operations.form.iconEnhanceHint') }}<"],
  [/alt="消息\{\{ \$t\('operations\.layout\.iconPreview'\) \}\}"/g, ':alt="$t(\'operations.form.messageIcon\')"'],
  [/label="目标用户筛选"/g, ':label="$t(\'operations.form.targetUserFilter\')"'],
  [/<n-checkbox value="new_users">新用户<\/n-checkbox>/g, '<n-checkbox value="new_users">{{ $t(\'operations.form.filterNewUsers\') }}</n-checkbox>'],
  [/<n-checkbox value="vip_users">VIP用户<\/n-checkbox>/g, '<n-checkbox value="vip_users">{{ $t(\'operations.form.filterVipUsers\') }}</n-checkbox>'],
  [/<n-checkbox value="active_users">活跃用户<\/n-checkbox>/g, '<n-checkbox value="active_users">{{ $t(\'operations.form.filterActiveUsers\') }}</n-checkbox>'],
  [/<n-checkbox value="inactive_users">非活跃用户<\/n-checkbox>/g, '<n-checkbox value="inactive_users">{{ $t(\'operations.form.filterInactiveUsers\') }}</n-checkbox>'],
  [/<n-checkbox value="high_rollers">高额投注用户<\/n-checkbox>/g, '<n-checkbox value="high_rollers">{{ $t(\'operations.form.filterHighRollers\') }}</n-checkbox>'],
  [/label="发送限制"/g, ':label="$t(\'operations.form.sendLimit\')"'],
  [/placeholder="最大发送次数"/g, ':placeholder="$t(\'operations.form.maxSendPlaceholder\')"'],
  [/placeholder="发送间隔\(分钟\)"/g, ':placeholder="$t(\'operations.form.sendIntervalPlaceholder\')"'],
  [/placeholder="点击通知后跳转的链接"/g, ':placeholder="$t(\'operations.form.jumpLinkPlaceholder\')"'],
  [/placeholder="请输入后台备注信息"/g, ':placeholder="$t(\'operations.messageSettings.backendRemark\')"'],
  [/\{\{ editingItem \? '更新' : '创建' \}\}/g, "{{ editingItem ? $t('operations.form.update') : $t('operations.form.create') }}"],
  [
    /\{ required: true, message: \$t\('common\.pleaseEnter'\) \+ '标题', trigger: 'blur' \}/g,
    "{ required: true, message: $t('common.pleaseEnterField', [$t('operations.messageSettings.titleLabel')]), trigger: 'blur' }",
  ],
  [/message: '标题长度应在2-100个字符之间'/g, "message: $t('operations.form.notificationTitleLength')"],
  [
    /\{ required: true, message: \$t\('common\.pleaseEnter'\) \+ '内容', trigger: 'blur' \}/g,
    "{ required: true, message: $t('common.pleaseEnterField', [$t('operations.messageSettings.content')]), trigger: 'blur' }",
  ],
  [/message: '内容长度应在10-1000个字符之间'/g, "message: $t('operations.form.notificationContentLength')"],
  [
    /\{ required: true, message: \$t\('common\.pleaseSelect'\) \+ '触发条件', trigger: 'change' \}/g,
    "{ required: true, message: $t('common.pleaseSelect') + ' ' + $t('operations.messageSettings.triggerCondition'), trigger: 'change' }",
  ],
  [/content: props\.editingItem \? '更新成功' : '创建成功'/g, "content: props.editingItem ? $t('operations.form.updateSuccess') : $t('operations.form.createSuccess')"],
  [/content: '提交失败'/g, "content: $t('operations.form.submitFailed')"],

  // OperationMessageGGFormModal
  [/:title="isEditing \? '编辑系统公告' : '新增系统公告'"/g, ':title="isEditing ? $t(\'operations.form.editGg\') : $t(\'operations.form.addGg\')"'],
  [/placeholder="输入公告标题"/g, ':placeholder="$t(\'operations.form.ggTitlePlaceholder\')"'],
  [/placeholder="输入公告内容（支持 HTML 和 Emoji）"/g, ':placeholder="$t(\'operations.form.ggContentPlaceholder\')"'],
  [/<template #unchecked>禁用<\/template>/g, '<template #unchecked>{{ $t(\'common.disable\') }}</template>'],
  [/<p>• 开始时间：公告开始显示的时间<\/p>/g, '<p>• {{ $t(\'operations.form.ggTimeStartHint\') }}</p>'],
  [/<p>• 结束时间：公告停止显示的时间<\/p>/g, '<p>• {{ $t(\'operations.form.ggTimeEndHint\') }}</p>'],
  [/label="字体大小"/g, ':label="$t(\'operations.form.fontSize\')"'],
  [/placeholder="字体大小"/g, ':placeholder="$t(\'operations.form.fontSizePlaceholder\')"'],
  [/formData\.title \|\| '公告标题预览'/g, "formData.title || $t('operations.form.titlePreview')"],
  [/formData\.content \|\| '这里是公告内容预览\.\.\.'/g, "formData.content || $t('operations.form.contentPreview')"],
  [/\{ label: '左上角', value: 'top-left' \}/g, "{ label: $t('operations.form.posTopLeft'), value: 'top-left' }"],
  [/\{ label: '右上角', value: 'top-right' \}/g, "{ label: $t('operations.form.posTopRight'), value: 'top-right' }"],
  [/\{ label: '关闭公告', value: 'close' \}/g, "{ label: $t('operations.form.closeAnnouncement'), value: 'close' }"],
  [
    /\{ required: true, message: \$t\('common\.pleaseEnter'\) \+ '公告标题', trigger: 'input' \}/g,
    "{ required: true, message: $t('common.pleaseEnterField', [$t('operations.messageSettings.announcementTitle')]), trigger: 'input' }",
  ],
  [/message: '标题长度应在1-100字符之间'/g, "message: $t('operations.form.ggTitleLength')"],
  [
    /\{ required: true, message: \$t\('common\.pleaseEnter'\) \+ '公告内容', trigger: 'input' \}/g,
    "{ required: true, message: $t('common.pleaseEnterField', [$t('operations.messageSettings.announcementContent')]), trigger: 'input' }",
  ],
  [/message: '内容长度应在1-2000字符之间'/g, "message: $t('operations.form.ggContentLength')"],

  // BackendApiCreateModal
  [
    />该类型域名对业务至关重要，停用或删除时请慎重操作。随意或错删可能会影响老用户访问和业务稳定性。</g,
    ">{{ $t('operations.domain.createSubdomain.purposeWarning') }}",
  ],
  [
    /placeholder='例如，"@"代表主域名，或"api"、"cdn"等'/g,
    ":placeholder=\"$t('operations.domain.createSubdomain.prefixPlaceholder')\"",
  ],
  [
    /const useTypeLabel = computed\(\(\) => props\.useTypeLabel \|\| '后端加速域名'\)/g,
    "const useTypeLabel = computed(() => props.useTypeLabel || $t('operations.domain.useType.backendApi'))",
  ],
  [/const modalTitle = computed\(\(\) => props\.modalTitle \|\| '新增域名'\)/g, "const modalTitle = computed(() => props.modalTitle || $t('common.create'))"],
  [/message\.info\(`未找到 \$\{cdnProvider\} 节点下的域名`\)/g, "message.info($t('operations.domain.createSubdomain.noDomains'))"],
  [/message\.success\(`找到 \$\{uniqueDomains\.length\} 个域名`\)/g, "message.success($t('operations.domain.modal.recordsCount', [uniqueDomains.length]))"],
  [/message\.success\(`成功创建 \$\{subdomains\.length\} 个子域名！`\)/g, "message.success($t('operations.domain.createSubdomain.createSuccess', [subdomains.length]))"],
  [
    /`主域名 \$\{formData\.domainName\} 已存在。DNS配置未更新，请在Cloudflare中手动检查。`/g,
    "$t('operations.domain.message.mainDomainExists', [formData.domainName])",
  ],
  [
    /message\.success\(`✅ 主域名 \$\{formData\.domainName\} 的DNS记录已更新！`\)/g,
    "message.success($t('operations.domain.message.dnsUpdated', [formData.domainName]))",
  ],
  [/message\.error\(`创建失败：\$\{errors\.join\('; '\)\}`\)/g, "message.error($t('operations.domain.createDomain.createPartial', [0, errors.length, errors.join('; ')]))"],
  [/message\.error\(response\.message \|\| response\.data\?\.message \|\| '创建失败'\)/g, "message.error(response.message || response.data?.message || $t('operations.domain.createDomain.createFailed'))"],
  [/message\.error\('请填写必填项'\)/g, "message.error($t('operations.form.checkForm'))"],
  [/message\.error\(error\.message \|\| '创建失败，请重试'\)/g, "message.error(error.message || $t('operations.domain.createDomain.createFailed'))"],

  // CreateSubdomain remaining
  [/<strong>规则：<\/strong>/g, '<strong>{{ $t(\'common.prompt\') }}:</strong>'],
  [/tag: '机联盟'/g, "tag: 'Alliance'"],
];

// Add domain message keys for backend modal
const enPath = 'src/locales/langs/en-US/operations.json';
for (const lang of ['en-US', 'zh-CN', 'vi-VN']) {
  const p = `src/locales/langs/${lang}/operations.json`;
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (!data.domain.message.mainDomainExists) {
    Object.assign(data.domain.message, {
      mainDomainExists: lang === 'zh-CN'
        ? '主域名 {0} 已存在。DNS配置未更新，请在Cloudflare中手动检查。'
        : lang === 'vi-VN'
          ? 'Tên miền chính {0} đã tồn tại. DNS chưa cập nhật, kiểm tra thủ công trên Cloudflare.'
          : 'Main domain {0} already exists. DNS not updated — check manually in Cloudflare.',
      dnsUpdated: lang === 'zh-CN'
        ? '✅ 主域名 {0} 的DNS记录已更新！'
        : lang === 'vi-VN'
          ? '✅ Đã cập nhật bản ghi DNS cho tên miền chính {0}!'
          : '✅ DNS records updated for main domain {0}!',
    });
    fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
  }
}

function walk(dir, files = []) {
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) walk(fp, files);
    else if (fp.endsWith('.vue')) files.push(fp);
  }
  return files;
}

let updated = 0;
for (const file of walk('src/views/operateManager')) {
  let content = fs.readFileSync(file, 'utf8');
  const orig = content;
  for (const [from, to] of replacements) content = content.replace(from, to);
  if (content !== orig) {
    fs.writeFileSync(file, content);
    updated++;
    console.log('Updated:', file);
  }
}
console.log('Done:', updated);
