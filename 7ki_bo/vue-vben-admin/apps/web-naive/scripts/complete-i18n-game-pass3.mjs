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
  // bet-records template labels
  [/label="游戏类型"/g, ':label="$t(\'game.betRecords.gameType\')"'],
  [/label="游戏名称"/g, ':label="$t(\'game.betRecords.gameName\')"'],
  [/label="最小金额"/g, ':label="$t(\'game.betRecordsExtra.minAmount\')"'],
  [/label="最大金额"/g, ':label="$t(\'game.betRecordsExtra.maxAmount\')"'],
  [/placeholder="请输入会员账号或ID"/g, ':placeholder="$t(\'game.betRecordsExtra.enterMemberOrId\')"'],
  [/placeholder="最小金额"/g, ':placeholder="$t(\'game.betRecordsExtra.minAmount\')"'],
  [/placeholder="最大金额"/g, ':placeholder="$t(\'game.betRecordsExtra.maxAmount\')"'],
  [/label="游戏厂商"/g, ':label="$t(\'game.subgame.vendor\')"'],
  [/label="游戏类型" path="gameType"/g, ':label="$t(\'game.subgame.gameType\')" path="gameType"'],
  [/<label class="mb-2 text-sm font-medium">游戏厂商<\/label>/g, '<label class="mb-2 text-sm font-medium">{{ $t(\'game.subgame.vendor\') }}</label>'],
  // hot game validation
  [/message: '请选择平台'/g, "message: $t('game.hotGameExtra.selectPlatformRequired')"],
  [/message: '游戏ID长度为1-50个字符'/g, "message: $t('game.hotGameExtra.gameIdLength')"],
  [/message: '请输入热门名称'/g, "message: $t('game.hotGameExtra.enterHotName')"],
  [/message: '热门名称长度为1-100个字符'/g, "message: $t('game.hotGameExtra.hotNameLength')"],
  [/message: '请选择游戏类型'/g, "message: $t('game.hotGameExtra.selectGameTypeRequired')"],
  [/message: '请选择标签类型'/g, "message: $t('game.hotGameExtra.selectTagTypeRequired')"],
  [/message: '请输入排序值'/g, "message: $t('game.hotGameExtra.sortOrderRequired')"],
  [/message: '排序值范围为0-9999'/g, "message: $t('game.hotGameExtra.sortOrderRange')"],
  [/message: '备注长度不能超过200个字符'/g, "message: $t('game.hotGameExtra.remarkMaxLength')"],
  [/content: '更新成功'/g, "content: $t('game.hotGameExtra.updateSuccess')"],
  [/content: '创建成功'/g, "content: $t('game.hotGameExtra.createSuccess')"],
  [/content: error\?\.message \|\| '操作失败'/g, "content: error?.message || $t('common.operationFailed')"],
  [/\{ label: '热门', value: 'hot' \}/g, "{ label: $t('game.hotGameExtra.tagHot'), value: 'hot' }"],
  [/\{ label: '回收', value: 'recycled' \}/g, "{ label: $t('game.hotGameExtra.tagRecycled'), value: 'recycled' }"],
  // virtual bonus pool
  [/title: '展示形式'/g, "title: $t('game.virtualBonusPool.displayForm')"],
  [/title: '状态'/g, "title: $t('common.status')"],
  [/title: '操作人'/g, "title: $t('common.operator')"],
  [/title: '操作时间'/g, "title: $t('common.operationTime')"],
  [/window\.confirm\(\$t\('game\.virtualBonusPool\.confirmDelete', \[ "\$\{row\.id\}" 吗？"\)/g, "window.confirm($t('game.virtualBonusPool.confirmDelete', [row.id]))"],
  [/window\.confirm\(\s*`确认删除选中的 \$\{selectedRows\.value\.length\} 项吗？`/g, "window.confirm($t('game.virtualBonusPool.confirmBulkDelete', [selectedRows.value.length]))"],
  [/placeholder="请选择币种"/g, ':placeholder="$t(\'game.virtualBonusPool.selectCurrencyRequired\')"'],
  [/placeholder="请选择展示位置"/g, ':placeholder="$t(\'game.virtualBonusPool.selectDisplayPositionRequired\')"'],
  [/placeholder="请选择跳转位置"/g, ':placeholder="$t(\'game.virtualBonusPool.selectClickTargetRequired\')"'],
  [/placeholder="请输入最大显示金额"/g, ':placeholder="$t(\'game.virtualBonusPool.enterMaxAmount\')"'],
  [/placeholder="请输入最小显示金额"/g, ':placeholder="$t(\'game.virtualBonusPool.enterMinAmount\')"'],
  [/placeholder="请输入小数点位数"/g, ':placeholder="$t(\'game.virtualBonusPool.enterDecimalPlaces\')"'],
  [/placeholder="选择数字样式图片"/g, ':placeholder="$t(\'game.virtualBonusPool.selectNumberStyle\')"'],
  [/placeholder="选择背景风格图片"/g, ':placeholder="$t(\'game.virtualBonusPool.selectBgStyle\')"'],
  [/placeholder="请输入备注信息（最多200字）"/g, ':placeholder="$t(\'game.virtualBonusPool.enterRemarkMax200\')"'],
  [/placeholder="选择数字样式"/g, ':placeholder="$t(\'game.virtualBonusPool.selectNumberStyle\')"'],
  [/placeholder="选择背景风格"/g, ':placeholder="$t(\'game.virtualBonusPool.selectBgStyle\')"'],
  [/placeholder="小数点位数"/g, ':placeholder="$t(\'game.virtualBonusPool.enterDecimalPlaces\')"'],
  [/placeholder="输入新的备注信息"/g, ':placeholder="$t(\'game.virtualBonusPool.enterNewRemark\')"'],
  [/message: '请选择展示方式'/g, "message: $t('game.virtualBonusPool.selectDisplayMethodRequired')"],
  [/message: '请选择展示位置'/g, "message: $t('game.virtualBonusPool.selectDisplayPositionRequired')"],
  [/message: '请选择点击跳转位置'/g, "message: $t('game.virtualBonusPool.selectClickTargetRequired')"],
  [/message: '请输入最大显示金额'/g, "message: $t('game.virtualBonusPool.enterMaxAmountRequired')"],
  [/message: '请输入最小显示金额'/g, "message: $t('game.virtualBonusPool.enterMinAmountRequired')"],
  [/message: '请输入小数点位数'/g, "message: $t('game.virtualBonusPool.enterDecimalRequired')"],
  [/message\.success\(`已选择数字样式: \$\{file\.filename\}`\)/g, "message.success($t('game.virtualBonusPool.numberStyleSelected', [file.filename]))"],
  [/message\.success\(`已选择新模板: \$\{file\.filename\}`\)/g, "message.success($t('game.virtualBonusPool.templateSelected', [file.filename]))"],
  [/<n-form-item-gi label="展示形式">/g, '<n-form-item-gi :label="$t(\'game.virtualBonusPool.displayForm\')">'],
  [/<n-form-item-gi label="最大金额调整">/g, '<n-form-item-gi :label="$t(\'game.virtualBonusPool.maxAmountAdjust\')">'],
  [/<n-form-item-gi label="最小金额调整">/g, '<n-form-item-gi :label="$t(\'game.virtualBonusPool.minAmountAdjust\')">'],
  [/\{\{ formData\.status \? '启用' : '禁用' \}\}/g, "{{ formData.status ? $t('common.enabled') : $t('common.disabled') }}"],
  [/<strong>\{\{ selectedItems\.length \}\}<\/strong> 个/g, '<strong>{{ selectedItems.length }}</strong> {{ $t(\'game.virtualBonusPool.bulkEditDesc2\') }}'],
  [/maxAmountAdjustment: '最大金额调整'/g, "maxAmountAdjustment: $t('game.virtualBonusPool.maxAmountAdjust')"],
  [/minAmountAdjustment: '最小金额调整'/g, "minAmountAdjustment: $t('game.virtualBonusPool.minAmountAdjust')"],
  [/return `→ \$\{maxType === 'multiply' \? '乘以' : maxType === 'add' \? '增加' : '设为'\} \$\{maxValue\}`/g, "return `→ ${$t('game.virtualBonusPool.adjustOp' + (maxType === 'multiply' ? 'Multiply' : maxType === 'add' ? 'Add' : 'Set'))} ${maxValue}`"],
  [/return `→ \$\{minType === 'multiply' \? '乘以' : minType === 'add' \? '增加' : '设为'\} \$\{minValue\}`/g, "return `→ ${$t('game.virtualBonusPool.adjustOp' + (minType === 'multiply' ? 'Multiply' : minType === 'add' ? 'Add' : 'Set'))} ${minValue}`"],
  [/\{\{ data\?\.decimalPlaces \|\| 0 \}\} 位/g, '{{ $t(\'game.virtualBonusPool.decimalPlacesUnit\', [data?.decimalPlaces || 0]) }}'],
  // subgame form validation
  [/return Promise\.reject\(new Error\('请选择所属平台'\)\)/g, "return Promise.reject(new Error($t('game.platformExtra.selectPlatformRequired')))"],
  [/message: '显示ID长度不能超过50个字符'/g, "message: $t('game.platformExtra.displayIdMax')"],
  [/message: '游戏名称长度为2-50个字符'/g, "message: $t('game.platformExtra.gameNameZhMax')"],
  // game type option labels (keep Chinese values for API)
  [/\{ label: '电子游戏', value: '电子游戏' \}/g, "{ label: $t('game.subgame.typeVideo'), value: '电子游戏' }"],
  [/\{ label: '真人游戏', value: '真人游戏' \}/g, "{ label: $t('game.subgame.typeLive'), value: '真人游戏' }"],
  [/\{ label: '体育游戏', value: '体育游戏' \}/g, "{ label: $t('game.subgame.typeSports'), value: '体育游戏' }"],
  [/\{ label: '彩票游戏', value: '彩票游戏' \}/g, "{ label: $t('game.subgame.typeLottery'), value: '彩票游戏' }"],
  [/\{ label: '捕鱼游戏', value: '捕鱼游戏' \}/g, "{ label: $t('game.subgame.typeHunting'), value: '捕鱼游戏' }"],
  [/\{ label: '棋牌游戏', value: '棋牌游戏' \}/g, "{ label: $t('game.subgame.typeChess'), value: '棋牌游戏' }"],
  [/\{ label: '棋牌', value: '棋牌' \}/g, "{ label: $t('game.subgame.typeChessShort'), value: '棋牌' }"],
  [/\{ label: '街机游戏', value: '街机游戏' \}/g, "{ label: $t('game.subgame.typeArcade'), value: '街机游戏' }"],
  [/\{ label: '斗鸡游戏', value: '斗鸡游戏' \}/g, "{ label: $t('game.subgame.typeCockfight'), value: '斗鸡游戏' }"],
  [/\{ label: '区块链游戏', value: '区块链游戏' \}/g, "{ label: $t('game.subgame.typeBlockchain'), value: '区块链游戏' }"],
  // strip Chinese HTML comments
  [/<!--[\s\S]*?[\u4e00-\u9fff][\s\S]*?-->/g, ''],
  [/\/\/[^\n]*[\u4e00-\u9fff][^\n]*/g, ''],
  [/\/\*[\s\S]*?[\u4e00-\u9fff][\s\S]*?\*\//g, ''],
];

for (const fp of walk(root)) {
  let c = fs.readFileSync(fp, 'utf8');
  if (!c.includes("from '@vben/locales'") && /[\u4e00-\u9fff]/.test(c)) {
    c = c.replace(/^import /m, "import { $t } from '@vben/locales';\n\nimport ");
  }
  for (const [a, b] of replacements) c = c.replace(a, b);
  c = c.replace(/(import \{ \$t \} from '@vben\/locales';\n\n)+/g, "import { $t } from '@vben/locales';\n\n");
  fs.writeFileSync(fp, c);
  console.log('pass3', path.relative(root, fp));
}
console.log('pass3 done');
