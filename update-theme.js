const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /bg-black/g, replacement: 'bg-slate-50' },
  { regex: /bg-\[#050505\]/g, replacement: 'bg-slate-50' },
  { regex: /bg-zinc-950/g, replacement: 'bg-white' },
  { regex: /text-white/g, replacement: 'text-slate-900' },
  { regex: /text-zinc-400/g, replacement: 'text-slate-600' },
  { regex: /text-zinc-500/g, replacement: 'text-slate-500' },
  { regex: /text-zinc-300/g, replacement: 'text-slate-700' },
  { regex: /border-white\/10/g, replacement: 'border-slate-200' },
  { regex: /border-white\/5/g, replacement: 'border-slate-100' },
  { regex: /bg-white\/5/g, replacement: 'bg-slate-100' },
  { regex: /bg-white\/10/g, replacement: 'bg-slate-200' },
  { regex: /hover:bg-white\/5/g, replacement: 'hover:bg-slate-100' },
  { regex: /hover:bg-white\/10/g, replacement: 'hover:bg-slate-200' },
  { regex: /divide-white\/5/g, replacement: 'divide-slate-100' },
  { regex: /bg-black\/50/g, replacement: 'bg-white/80' },
  { regex: /bg-zinc-900/g, replacement: 'bg-slate-100' },
  { regex: /hover:bg-zinc-800/g, replacement: 'hover:bg-slate-200' },
  { regex: /text-zinc-600/g, replacement: 'text-slate-400' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        processDirectory(fullPath);
      }
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const { regex, replacement } of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory('./app');
processDirectory('./components');
