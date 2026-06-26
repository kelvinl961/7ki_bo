import fs from 'fs';
import path from 'path';

const replacements = [
  // BatchOperationsModal
  [/已选择 \{\{ selectedIds\.length \}\} 个域名/g, "{{ $t('operations.domain.selectedCount', [selectedIds.length]) }}"],
  [/label="操作类型"/g, ':label="$t(\'operations.domain.batchOps.operationType\')"'],
  [/placeholder="请选择操作类型"/g, ':placeholder="$t(\'operations.domain.batchOps.selectOperation\')"'],
  [/placeholder="请选择状态"/g, ':placeholder="$t(\'common.pleaseSelect\') + \' \' + $t(\'common.status\')"'],
  [/label="CDN提供商"/g, ':label="$t(\'operations.domain.column.cdnProvider\')"'],
  [/placeholder="请选择CDN提供商"/g, ':placeholder="$t(\'operations.domain.batchOps.selectCdn\')"'],
  [/\{ label: \$t\('common\.modify'\) \+ '状态', value: 'status' \}/g, "{ label: $t('operations.domain.batchOps.modifyStatus'), value: 'status' }"],
  [/\{ label: '切换CDN', value: 'cdn' \}/g, "{ label: $t('operations.domain.action.switchCdn'), value: 'cdn' }"],
  [/\{ label: '启用', value: 'active' \}/g, "{ label: $t('common.enable'), value: 'active' }"],
  [/\{ label: '禁用', value: 'inactive' \}/g, "{ label: $t('common.disable'), value: 'inactive' }"],
  [/\{ label: '阿里云', value: 'aliyun' \}/g, "{ label: 'Aliyun', value: 'aliyun' }"],
  [/\{ label: '腾讯云', value: 'tencent' \}/g, "{ label: 'Tencent Cloud', value: 'tencent' }"],
  [/message\.success\('批量操作成功'\)/g, "message.success($t('operations.domain.message.bulkActionSuccess', [$t('common.batchOperation')]))"],
  [/message\.error\('批量操作失败'\)/g, "message.error($t('operations.domain.message.bulkActionFailed', [$t('common.batchOperation')]))"],

  // CDNSwitchModal
  [/title="CDN切换"/g, ':title="$t(\'operations.domain.cdnSwitch.title\')"'],
  [/<p>域名: \{\{ domain\.domain \}\}<\/p>/g, '<p>{{ $t(\'operations.domain.column.domain\') }}: {{ domain.domain }}</p>'],
  [/<p>当前CDN: \{\{ domain\.cdnProvider \}\}<\/p>/g, '<p>{{ $t(\'operations.domain.modal.currentCdn\') }}: {{ domain.cdnProvider }}</p>'],
  [/label="新CDN提供商"/g, ':label="$t(\'operations.domain.cdnSwitch.newProvider\')"'],
  [/placeholder="请选择新的CDN提供商"/g, ':placeholder="$t(\'operations.domain.cdnSwitch.selectNewProvider\')"'],
  [/label="切换原因"/g, ':label="$t(\'operations.domain.cdnSwitch.reason\')"'],
  [/placeholder="请输入切换原因"/g, ':placeholder="$t(\'operations.domain.cdnSwitch.reasonPlaceholder\')"'],
  [/\{\{ \$t\('operations\.layout\.confirm'\) \}\}切换/g, "{{ $t('operations.domain.cdnSwitch.confirmSwitch') }}"],
  [
    /message: \$t\('common\.pleaseSelect'\) \+ '新的CDN提供商'/g,
    "message: $t('operations.domain.cdnSwitch.selectNewProvider')",
  ],
  [
    /message: \$t\('common\.pleaseEnter'\) \+ '切换原因'/g,
    "message: $t('common.pleaseEnterField', [$t('operations.domain.cdnSwitch.reason')])",
  ],
  [/message\.success\('CDN切换成功'\)/g, "message.success($t('operations.domain.message.cdnSwitchSuccess'))"],

  // OperationMessageGG
  [/placeholder="输入标题或ID搜索"/g, ':placeholder="$t(\'operations.messageSettings.titleSearch\')"'],
  [/\{ default: \(\) => \(row\.popupEntry \? '是' : '否'\) \}/g, "{ default: () => (row.popupEntry ? $t('common.yes') : $t('common.no')) }"],
  [/\{ default: \(\) => \(row\.videoPushEnabled \? '是' : '否'\) \}/g, "{ default: () => (row.videoPushEnabled ? $t('common.yes') : $t('common.no')) }"],
  [/copyData\.title = `\$\{copyData\.title\} \(复制\)`/g, "copyData.title = `${copyData.title}${$t('operations.messageSettings.copySuffix')}`"],
  [/content: '停用成功'/g, "content: $t('operations.messageSettings.disableSuccess')"],
  [/content: '停用失败'/g, "content: $t('operations.messageSettings.disableFailed')"],
  [
    /content: `\$\{newStatus === 'enabled' \? '启用' : '停用'\}成功`/g,
    "content: newStatus === 'enabled' ? $t('operations.messageSettings.toggleSuccess', [$t('common.enable')]) : $t('operations.messageSettings.toggleSuccess', [$t('common.disable')])",
  ],
  [/content: '状态更新失败'/g, "content: $t('operations.messageSettings.statusUpdateFailed')"],
  [
    /content: `成功删除 \$\{ggsToDelete\.length\} 条系统公告`/g,
    "content: $t('operations.messageSettings.batchDeleteGgSuccess', [ggsToDelete.length])",
  ],
  [
    /content: `成功停用 \$\{ggsToDisable\.length\} 条系统公告`/g,
    "content: $t('operations.messageSettings.batchDisableGgSuccess', [ggsToDisable.length])",
  ],
  [/content: '批量停用失败'/g, "content: $t('operations.messageSettings.batchDisableFailed')"],

  // LobbyBannerManager
  [
    /<label class="text-sm font-medium text-gray-600">跳转方式<\/label>/g,
    '<label class="text-sm font-medium text-gray-600">{{ $t(\'operations.messageSettings.jumpMode\') }}</label>',
  ],
  [/\{\{ detailData\.displayDuration \}\}秒/g, "{{ detailData.displayDuration }}{{ $t('operations.messageSettings.secondsUnit') }}"],
  [/:alt="'Banner预览'"/g, ':alt="$t(\'operations.form.bannerPreview\')"'],

  // WhitelistDomainsView
  [
    />外部白名单域名管理（含泛域）</g,
    ">{{ $t('operations.domain.tabs.whitelist') }}",
  ],
  [/title="白名单域名"/g, ':title="$t(\'operations.domain.whitelist.title\')"'],
  [/description="该功能正在开发中"/g, ':description="$t(\'operations.domain.whitelist.developing\')"'],

  // OperationMessagePMD script
  [/copyData\.content = `\$\{copyData\.content\} \(复制\)`/g, "copyData.content = `${copyData.content}${$t('operations.messageSettings.copySuffix')}`"],
  [
    /content: willEnable \? '启动成功' : '暂停成功'/g,
    "content: willEnable ? $t('operations.messageSettings.startSuccess') : $t('operations.messageSettings.pauseSuccess')",
  ],
  [/content: '操作失败'/g, "content: $t('common.operationFailed')"],
  [
    /content: `\$\{newStatus === 'enabled' \? '启用' : '停用'\}成功`/g,
    "content: newStatus === 'enabled' ? $t('operations.messageSettings.toggleSuccess', [$t('common.enable')]) : $t('operations.messageSettings.toggleSuccess', [$t('common.disable')])",
  ],
  [
    /content: `成功暂停 \$\{pmdsToPause\.length\} 条跑马灯通知`/g,
    "content: $t('operations.messageSettings.batchPausePmdSuccess', [pmdsToPause.length])",
  ],
  [/content: '批量暂停失败'/g, "content: $t('operations.messageSettings.batchPauseFailed')"],
];

// Add locale keys
const extra = {
  'en-US': {
    batchOps: {
      operationType: 'Operation Type',
      selectOperation: 'Select operation type',
      selectCdn: 'Select CDN provider',
      modifyStatus: 'Modify Status',
    },
    cdnSwitch: {
      title: 'CDN Switch',
      newProvider: 'New CDN Provider',
      selectNewProvider: 'Select new CDN provider',
      reason: 'Switch Reason',
      reasonPlaceholder: 'Enter switch reason',
      confirmSwitch: 'Confirm Switch',
    },
    whitelist: { add: 'Add Whitelist Domain', title: 'Whitelist Domains', developing: 'This feature is under development' },
    customDns: { empty: 'No custom DNS records' },
  },
  'zh-CN': {
    batchOps: {
      operationType: '操作类型',
      selectOperation: '请选择操作类型',
      selectCdn: '请选择CDN提供商',
      modifyStatus: '修改状态',
    },
    cdnSwitch: {
      title: 'CDN切换',
      newProvider: '新CDN提供商',
      selectNewProvider: '请选择新的CDN提供商',
      reason: '切换原因',
      reasonPlaceholder: '请输入切换原因',
      confirmSwitch: '确认切换',
    },
    whitelist: { add: '添加白名单域名', title: '白名单域名', developing: '该功能正在开发中' },
    customDns: { empty: '暂无自定义DNS记录' },
  },
  'vi-VN': {
    batchOps: {
      operationType: 'Loại thao tác',
      selectOperation: 'Chọn loại thao tác',
      selectCdn: 'Chọn nhà cung cấp CDN',
      modifyStatus: 'Sửa trạng thái',
    },
    cdnSwitch: {
      title: 'Chuyển CDN',
      newProvider: 'Nhà cung cấp CDN mới',
      selectNewProvider: 'Chọn nhà cung cấp CDN mới',
      reason: 'Lý do chuyển',
      reasonPlaceholder: 'Nhập lý do chuyển',
      confirmSwitch: 'Xác nhận chuyển',
    },
    whitelist: { add: 'Thêm tên miền whitelist', title: 'Tên miền whitelist', developing: 'Tính năng đang phát triển' },
    customDns: { empty: 'Chưa có bản ghi DNS tùy chỉnh' },
  },
};

for (const [lang, sections] of Object.entries(extra)) {
  const p = path.join('src/locales/langs', lang, 'operations.json');
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  Object.assign(data.domain, sections);
  if (!data.messageSettings.disableSuccess) {
    Object.assign(data.messageSettings, {
      disableSuccess: lang === 'zh-CN' ? '停用成功' : lang === 'vi-VN' ? 'Tắt thành công' : 'Disabled successfully',
      disableFailed: lang === 'zh-CN' ? '停用失败' : lang === 'vi-VN' ? 'Tắt thất bại' : 'Disable failed',
      batchDeleteGgSuccess: lang === 'zh-CN' ? '成功删除 {0} 条系统公告' : lang === 'vi-VN' ? 'Đã xóa {0} thông báo hệ thống' : 'Deleted {0} announcement(s)',
      batchDisableGgSuccess: lang === 'zh-CN' ? '成功停用 {0} 条系统公告' : lang === 'vi-VN' ? 'Đã tắt {0} thông báo hệ thống' : 'Disabled {0} announcement(s)',
      batchDisableFailed: lang === 'zh-CN' ? '批量停用失败' : lang === 'vi-VN' ? 'Tắt hàng loạt thất bại' : 'Batch disable failed',
      startSuccess: lang === 'zh-CN' ? '启动成功' : lang === 'vi-VN' ? 'Khởi động thành công' : 'Started successfully',
      pauseSuccess: lang === 'zh-CN' ? '暂停成功' : lang === 'vi-VN' ? 'Tạm dừng thành công' : 'Paused successfully',
      batchPausePmdSuccess: lang === 'zh-CN' ? '成功暂停 {0} 条跑马灯通知' : lang === 'vi-VN' ? 'Đã tạm dừng {0} thông báo marquee' : 'Paused {0} marquee message(s)',
      batchPauseFailed: lang === 'zh-CN' ? '批量暂停失败' : lang === 'vi-VN' ? 'Tạm dừng hàng loạt thất bại' : 'Batch pause failed',
    });
  }
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
}

function walk(dir, files = []) {
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) walk(fp, files);
    else if (fp.endsWith('.vue')) files.push(fp);
  }
  return files;
}

let n = 0;
for (const file of walk('src/views/operateManager')) {
  let c = fs.readFileSync(file, 'utf8');
  const o = c;
  for (const [from, to] of replacements) c = c.replace(from, to);
  if (c !== o && c.includes('<script') && !c.includes("from '@vben/locales'")) {
    c = c.replace(/(<script setup lang="ts">\r?\n)/, "$1import { $t } from '@vben/locales';\n\n");
  }
  if (c !== o) {
    fs.writeFileSync(file, c);
    n++;
    console.log('Updated:', file);
  }
}
console.log('Done:', n);
