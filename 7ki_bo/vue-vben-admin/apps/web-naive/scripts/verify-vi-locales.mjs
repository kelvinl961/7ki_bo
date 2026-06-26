import fs from 'node:fs';
import path from 'node:path';

const CH = /[\u4e00-\u9fff]/;
function countChinese(obj) {
  let c = 0;
  const w = (n) => {
    if (typeof n === 'string' && CH.test(n)) c++;
    else if (n && typeof n === 'object') Object.values(n).forEach(w);
  };
  w(obj);
  return c;
}

for (const f of ['finance.json', 'activity.json', 'page.json', 'brand.json']) {
  const j = JSON.parse(fs.readFileSync(`src/locales/langs/vi-VN/${f}`, 'utf8'));
  console.log(`${f}: ${countChinese(j)} strings still contain Chinese`);
}
