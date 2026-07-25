const fs = require('fs');
const path = require('path');

function scanDir(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
      results = results.concat(scanDir(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.html') || entry.name.endsWith('.css'))) {
      results.push(fullPath);
    }
  }
  return results;
}

const allFiles = scanDir(path.join(__dirname, '..'));

console.log('=== SCANNING FOR RAW SQL INTERPOLATIONS IN DB QUERIES ===');
let sqlInterpolations = 0;
allFiles.forEach(f => {
  if (!f.endsWith('.js')) return;
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.match(/(query|execute)\s*\(\s*`[^`]*\${[^}]+}[^`]*`/)) {
      const rel = path.relative(path.join(__dirname, '..'), f);
      console.log(`[SQL Interpolation] ${rel}:${idx+1} -> ${line.trim()}`);
      sqlInterpolations++;
    }
  });
});
console.log(`Total raw SQL interpolations: ${sqlInterpolations}\n`);

console.log('=== SCANNING FOR UNHANDLED ASYNC EXPRESS ROUTE HANDLERS ===');
let unhandledAsync = 0;
allFiles.forEach(f => {
  if (!f.includes('controllers') && !f.includes('routes') && !f.includes('api')) return;
  if (!f.endsWith('.js')) return;
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  let inAsyncFunc = false;
  let funcLine = 0;
  let hasTry = false;

  lines.forEach((line, idx) => {
    if (line.match(/exports\.\w+\s*=\s*async|async\s+function|async\s*\(/)) {
      inAsyncFunc = true;
      funcLine = idx + 1;
      hasTry = false;
    }
    if (inAsyncFunc && line.includes('try {')) {
      hasTry = true;
    }
    if (inAsyncFunc && line.match(/^};\s*$|^}\s*$/)) {
      if (!hasTry) {
        const rel = path.relative(path.join(__dirname, '..'), f);
        console.log(`[Missing try-catch] ${rel}:${funcLine}`);
        unhandledAsync++;
      }
      inAsyncFunc = false;
    }
  });
});
console.log(`Total async functions missing try-catch: ${unhandledAsync}\n`);

console.log('=== SCANNING FOR TODO / FIXME / HACK ===');
let todos = 0;
allFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.match(/\b(TODO|FIXME|HACK|XXX)\b/i)) {
      const rel = path.relative(path.join(__dirname, '..'), f);
      console.log(`[TODO/FIXME] ${rel}:${idx+1} -> ${line.trim()}`);
      todos++;
    }
  });
});
console.log(`Total TODO/FIXME count: ${todos}\n`);
