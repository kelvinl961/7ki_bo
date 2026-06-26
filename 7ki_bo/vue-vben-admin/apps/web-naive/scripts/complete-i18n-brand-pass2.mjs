import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const brandDir = path.join(__dirname, '..', 'src', 'views', 'brand');

const files = [
  'BrandLogoSetting.vue',
  'BrandSkinSetting.vue',
  'components/SkinLangEditor.vue',
  'DomainManagement.vue',
];

const replacements = [
  [/<!--[\s\S]*?[\u4e00-\u9fff][\s\S]*?-->/g, ''],
  [/\/\/[^\n]*[\u4e00-\u9fff][^\n]*/g, ''],
  [/\/\*[\s\S]*?[\u4e00-\u9fff][\s\S]*?\*\//g, ''],
  [/\/\*\*[\s\S]*?[\u4e00-\u9fff][\s\S]*?\*\//g, ''],
];

for (const f of files) {
  const fp = path.join(brandDir, f);
  if (!fs.existsSync(fp)) continue;
  let c = fs.readFileSync(fp, 'utf8');
  for (const [a, b] of replacements) c = c.replace(a, b);
  fs.writeFileSync(fp, c);
  console.log('brand pass2', f);
}
