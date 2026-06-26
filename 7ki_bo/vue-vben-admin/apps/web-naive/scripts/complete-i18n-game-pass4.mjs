import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'src', 'views', 'game-management');

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith('.vue')) acc.push(p);
  }
  return acc;
}

const replacements = [
  [/content: '游戏导入成功'/g, "content: $t('game.subgame.importSuccess')"],
  [/content: '删除成功'/g, "content: $t('common.deleteSuccess')"],
  [/content: '删除失败'/g, "content: $t('common.deleteFailed')"],
  [/content: '状态更新成功'/g, "content: $t('game.virtualBonusPool.statusUpdateSuccess')"],
  [/content: '状态更新失败'/g, "content: $t('game.virtualBonusPool.statusUpdateFailed')"],
  [/content: '置顶成功'/g, "content: $t('game.virtualBonusPool.pinSuccess')"],
  [/content: '置顶失败'/g, "content: $t('game.virtualBonusPool.pinFailed')"],
  [/content: '请拖拽图片文件'/g, "content: $t('game.subgame.dragImageOnly')"],
  [/content: '图标上传成功'/g, "content: $t('game.subgame.iconUploadSuccess')"],
  [/content: error instanceof Error \? error\.message : '图标上传失败'/g, "content: error instanceof Error ? error.message : $t('game.subgame.iconUploadFailed')"],
  [/throw new Error\('上传失败'\)/g, "throw new Error($t('game.subgame.uploadFailed'))"],
  [/content: `已导出 \$\{all\.length\} 条记录`/g, "content: $t('game.virtualBonusPool.exportedRecords', [all.length])"],
  [/content: e\?\.message \|\| '导出失败'/g, "content: e?.message || $t('game.subgame.exportFailed')"],
  [/alt: '游戏图标'/g, "alt: $t('game.subgame.gameIconPlaceholder')"],
  [/g\.isEnabled \? '是' : '否'/g, "g.isEnabled ? $t('common.yes') : $t('common.no')"],
  [/g\.isHot1 \? '是' : '否'/g, "g.isHot1 ? $t('common.yes') : $t('common.no')"],
  [/g\.isHot2 \? '是' : '否'/g, "g.isHot2 ? $t('common.yes') : $t('common.no')"],
  [/g\.isRecommended \? '是' : '否'/g, "g.isRecommended ? $t('common.yes') : $t('common.no')"],
  [/g\.isUnderMaintenance \? '是' : '否'/g, "g.isUnderMaintenance ? $t('common.yes') : $t('common.no')"],
  [/g\.showToStreamer \? '是' : '否'/g, "g.showToStreamer ? $t('common.yes') : $t('common.no')"],
  [/`子游戏导出_\$\{new Date\(\)\.toISOString\(\)\.slice\(0, 10\)\}\.csv`/g, "`${$t('game.subgame.exportFileName', [new Date().toISOString().slice(0, 10)])}`"],
  [/`安全验证失败: 表单数据与正在编辑的游戏不匹配。请刷新页面后重试。\\n错误: \$\{validationErrors\.join\(', '\)\}`/g, "$t('game.virtualBonusPool.securityValidationFailed', [validationErrors.join(', ')])"],
  [/'平台名称'/g, "$t('game.subgame.platformName')"],
  [/'游戏厂商'/g, "$t('game.subgame.vendor')"],
  [/'显示ID'/g, "$t('game.subgame.displayId')"],
  [/'游戏名称\(中文\)'/g, "$t('game.subgame.gameNameZh')"],
  [/'游戏名称\(英文\)'/g, "$t('game.subgame.gameNameEn')"],
  [/'游戏类型'/g, "$t('game.subgame.gameType')"],
  [/'币种'/g, "$t('common.currency')"],
  [/'启用'/g, "$t('common.enabled')"],
  [/'热门一'/g, "$t('game.subgame.hot1')"],
  [/'热门二'/g, "$t('game.subgame.hot2')"],
  [/'推荐'/g, "$t('game.subgame.recommended')"],
  [/'维护中'/g, "$t('game.virtualBonusPool.underMaintenance')"],
  [/'展示给主播'/g, "$t('game.subgame.showToStreamer')"],
  [/'排序'/g, "$t('game.subgame.sortOrder')"],
  [/'备注'/g, "$t('common.remark')"],
  [/'创建时间'/g, "$t('common.createTime')"],
  [/'更新时间'/g, "$t('common.updateTime')"],
  [/\? '导入游戏'/g, "? $t('game.importDialog.title')"],
  [/: '导入游戏'/g, ": $t('game.importDialog.title')"],
  [/\? 'API导入'/g, "? $t('game.apiImport.title')"],
  [/: 'API导入'/g, ": $t('game.apiImport.title')"],
];

for (const fp of walk(root)) {
  let c = fs.readFileSync(fp, 'utf8');
  for (const [a, b] of replacements) c = c.replace(a, b);
  fs.writeFileSync(fp, c);
  console.log('pass4', path.relative(root, fp));
}
