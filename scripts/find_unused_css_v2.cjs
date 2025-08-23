const fs = require('fs');
const path = require('path');

const cssPath = path.resolve(__dirname, '..', 'src', 'pages', 'Rebecca.css');
const srcDir = path.resolve(__dirname, '..', 'src');

const css = fs.readFileSync(cssPath, 'utf8');

// find all .class or #id occurrences in CSS (excluding those inside comments)
const commentFree = css.replace(/\/\*[\s\S]*?\*\//g, '');
const re = /([#.][a-zA-Z0-9_-]+)/g;
const all = new Set();
let m;
while ((m = re.exec(commentFree)) !== null) {
  all.add(m[1]);
}

const selectors = Array.from(all).sort();

function walk(dir){
  const files = [];
  fs.readdirSync(dir).forEach(f=>{
    const fp = path.join(dir,f);
    const st = fs.statSync(fp);
    if (st.isDirectory()) files.push(...walk(fp));
    else if (/\.(ts|tsx|js|jsx|html)$/.test(fp)) files.push(fp);
  });
  return files;
}

const files = walk(srcDir);

function usedSelector(sel){
  const name = sel.slice(1);
  const isClass = sel.startsWith('.');
  const patterns = [];
  if (isClass) {
    patterns.push(new RegExp('(className|class)\\s*=\\s*["\\'`][^"\\'`]*\\b'+escapeReg(name)+'\\b[^"\\'`]*["\\'`]', 'm'));
    patterns.push(new RegExp("\\.querySelector(All)?\\s*\\(\\s*['\\\"]\\."+escapeReg(name)+"['\\\"]\\s*\\)", 'm'));
    patterns.push(new RegExp("getElementsByClassName\\s*\\(\\s*['\\\"]"+escapeReg(name)+"['\\\"]\\s*\\)", 'm'));
    patterns.push(new RegExp('\\b'+escapeReg(name)+'\\b', 'm'));
  } else {
    patterns.push(new RegExp('id\\s*=\\s*["\\'`][^"\\'`]*\\b'+escapeReg(name)+'\\b[^"\\'`]*["\\'`]', 'm'));
    patterns.push(new RegExp("\\.querySelector(All)?\\s*\\(\\s*['\\\"]#"+escapeReg(name)+"['\\\"]\\s*\\)", 'm'));
    patterns.push(new RegExp("getElementById\\s*\\(\\s*['\\\"]"+escapeReg(name)+"['\\\"]\\s*\\)", 'm'));
    patterns.push(new RegExp('\\b'+escapeReg(name)+'\\b', 'm'));
  }

  for (const fp of files){
    const content = fs.readFileSync(fp,'utf8');
    for (const p of patterns){
      if (p.test(content)) return true;
    }
  }
  return false;
}

function escapeReg(s){return s.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&');}

const results = { totalSelectors: selectors.length, selectors: [] };

selectors.forEach(sel => {
  const used = usedSelector(sel);
  results.selectors.push({selector: sel, used});
});

const unused = results.selectors.filter(s=>!s.used).map(s=>s.selector);

console.log(JSON.stringify({unused, totalSelectors: results.totalSelectors, checkedFiles: files.length}, null, 2));
