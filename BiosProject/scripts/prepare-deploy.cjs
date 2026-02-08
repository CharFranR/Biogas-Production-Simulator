const fs = require('fs');
const path = require('path');

function rmrf(p) {
  if (!fs.existsSync(p)) return;
  const stat = fs.statSync(p);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(p)) {
      rmrf(path.join(p, entry));
    }
    fs.rmdirSync(p);
  } else {
    fs.unlinkSync(p);
  }
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest);
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

const dist = path.resolve(__dirname, '..', 'dist');
const deploy = path.resolve(__dirname, '..', 'deploy');

console.log('Preparing deploy folder...');
rmrf(deploy);
fs.mkdirSync(deploy);

if (!fs.existsSync(dist)) {
  console.error('dist folder not found. Run build first.');
  process.exit(1);
}

copyRecursive(dist, deploy);
console.log('Copied dist -> deploy');
