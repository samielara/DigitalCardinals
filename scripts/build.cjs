const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
// Publish only website assets, not function source, tests, plans, or deployment notes.
for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (entry.isFile() && /\.(html|ico|png|webmanifest|xml|txt)$/.test(entry.name)) {
    fs.copyFileSync(path.join(root, entry.name), path.join(output, entry.name));
  }
}
fs.cpSync(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });
fs.cpSync(path.join(root, 'components'), path.join(output, 'components'), { recursive: true });
console.log('Built static site in dist; server code and tests excluded.');
