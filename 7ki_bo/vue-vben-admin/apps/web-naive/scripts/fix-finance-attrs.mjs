/**
 * Safe post-processor: fix attribute binding syntax only.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const financeDir = path.join(__dirname, '../src/views/finance');
const attrs = ['label', 'placeholder', 'tab', 'title', 'content', 'positive-text', 'negative-text'];

function fixContent(content) {
  for (const attr of attrs) {
    // label=$t('x')>  -> :label="$t('x')">
    content = content.replace(
      new RegExp(`(?<![:"])${attr}=\\$t\\(([^)]+)\\)(?=[\\s>/])`, 'g'),
      `:${attr}="$t($1)"`,
    );
  }
  return content;
}

function fixTemplateBareText(content) {
  // Lines with only Chinese between tags (multiline p tags etc.)
  const commonText = {
    刷新: "{{ $t('common.refresh') }}",
    搜索: "{{ $t('common.search') }}",
    重置: "{{ $t('common.reset') }}",
    导出报表: "{{ $t('common.exportReport') }}",
    取消: "{{ $t('common.cancel') }}",
    确认: "{{ $t('common.confirm') }}",
    删除: "{{ $t('common.delete') }}",
    保存: "{{ $t('common.save') }}",
    关闭: "{{ $t('common.close') }}",
    详情: "{{ $t('common.detail') }}",
    修改: "{{ $t('common.edit') }}",
  };

  for (const [zh, repl] of Object.entries(commonText)) {
    content = content.replace(
      new RegExp(`(\\n\\s*)${zh}(\\s*\\n)`, 'g'),
      `$1${repl}$2`,
    );
    content = content.replace(
      new RegExp(`>\\s*${zh}\\s*<`, 'g'),
      `>${repl}<`,
    );
  }
  return content;
}

const files = fs.readdirSync(financeDir).filter((f) => f.endsWith('.vue'));
for (const f of files) {
  const fp = path.join(financeDir, f);
  let c = fs.readFileSync(fp, 'utf8');
  c = fixContent(c);
  c = fixTemplateBareText(c);
  fs.writeFileSync(fp, c, 'utf8');
  console.log('Fixed attrs:', f);
}
