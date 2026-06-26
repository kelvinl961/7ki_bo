import fs from 'fs';
const p = new URL('../src/views/game-management/virtual-bonus-pool/index.vue', import.meta.url);
let c = fs.readFileSync(p, 'utf8');
c = c.replace(
  /const dialog = window\.confirm\([\s\S]*?handleDelete[\s\S]*?\n  if \(dialog\)/,
  (m) => m.replace(/const dialog = window\.confirm\([^;]+;/, "const dialog = window.confirm($t('game.virtualBonusPool.confirmDelete', [String(row.id)]));"),
);
// simpler: line-based
const lines = c.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('handleDelete') && lines[i + 1]?.includes('window.confirm')) {
    lines[i + 1] = "  const dialog = window.confirm($t('game.virtualBonusPool.confirmDelete', [String(row.id)]));";
  }
}
fs.writeFileSync(p, lines.join('\n'));
console.log('done');
