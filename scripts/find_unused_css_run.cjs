const fs = require("fs");
const path = require("path");

const cssPath = path.resolve(__dirname, "..", "src", "pages", "Rebecca.css");
const srcDir = path.resolve(__dirname, "..", "src");

function readCss(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch (e) {
    console.error("ERR_READ_CSS", e.message);
    process.exit(1);
  }
}

function walk(dir) {
  const out = [];
  const entries = fs.readdirSync(dir);
  for (const e of entries) {
    const fp = path.join(dir, e);
    const st = fs.statSync(fp);
    if (st.isDirectory()) out.push(...walk(fp));
    else if (/\.(ts|tsx|js|jsx|html)$/.test(fp)) out.push(fp);
  }
  return out;
}

const css = readCss(cssPath);
const cssNoComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
// match selectors blocks by capturing the left side before '{'
const blocks = cssNoComments
  .split("{")
  .map((s) => s.split("\n").slice(0, 1)[0])
  .filter(Boolean);
const names = new Set();
// also scan whole css for .class and #id tokens
const tokenRe = /([#.][A-Za-z0-9_-]+)/g;
let m;
while ((m = tokenRe.exec(cssNoComments)) !== null) {
  names.add(m[1]);
}

const selectors = Array.from(names).sort();
const files = walk(srcDir);

function fileContains(fp, needle) {
  try {
    const c = fs.readFileSync(fp, "utf8");
    return c.indexOf(needle) !== -1;
  } catch (e) {
    return false;
  }
}

function isUsed(sel) {
  const name = sel.slice(1);
  if (sel.startsWith(".")) {
    // search common patterns
    const patterns = [
      `className=\"`,
      `className='`,
      `class=\"`,
      `class='`,
      `.${name}`,
      `getElementsByClassName('${name}')`,
      `getElementsByClassName(\"${name}\")`,
      `querySelector('.${name}')`,
      `querySelectorAll('.${name}')`,
      name, // fallback
    ];
    for (const f of files) {
      const c = fs.readFileSync(f, "utf8");
      for (const p of patterns) {
        if (c.indexOf(p) !== -1) return true;
      }
    }
    return false;
  } else {
    const patterns = [
      `id=\"`,
      `id='`,
      `#${name}`,
      `getElementById('${name}')`,
      `getElementById(\"${name}\")`,
      `querySelector('#${name}')`,
      `querySelectorAll('#${name}')`,
      name,
    ];
    for (const f of files) {
      const c = fs.readFileSync(f, "utf8");
      for (const p of patterns) {
        if (c.indexOf(p) !== -1) return true;
      }
    }
    return false;
  }
}

const result = {
  totalSelectors: selectors.length,
  checkedFiles: files.length,
  unused: [],
};
for (const s of selectors) {
  try {
    const used = isUsed(s);
    if (!used) result.unused.push(s);
  } catch (e) {
    console.error("ERR_CHECK", s, e.message);
  }
}

console.log(JSON.stringify(result, null, 2));
