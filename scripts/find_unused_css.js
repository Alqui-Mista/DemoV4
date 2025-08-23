const fs = require("fs");
const path = require("path");

const cssPath = path.resolve(__dirname, "..", "src", "pages", "Rebecca.css");
const srcDir = path.resolve(__dirname, "..", "src");

const css = fs.readFileSync(cssPath, "utf8");

// Extract selectors (very simple): take selector parts before '{'
const selectorLines = css
  .split("{")
  .map((s) => s.split("\n").slice(0, 1)[0])
  .map((s) => s.trim())
  .filter(Boolean);
const selectors = new Set();
selectorLines.forEach((line) => {
  // skip @ rules and keyframes
  if (line.startsWith("@") || line.startsWith("}")) return;
  // split by commas
  line.split(",").forEach((part) => {
    const p = part.trim();
    // capture first token (selector) up to space
    const token = p.split(" ")[0];
    if (!token) return;
    // if token contains combinators or pseudo, strip them
    const cleaned = token
      .replace(/::?[^\s\.:#\[]*/g, "")
      .replace(/\[.*?\]/g, "")
      .replace(/>+/g, "")
      .replace(/\s+/g, "")
      .replace(/,$/, "");
    // find class names and ids within token
    const re = /([#.][a-zA-Z0-9_\-]+)/g;
    let m;
    while ((m = re.exec(token)) !== null) {
      selectors.add(m[1]);
    }
  });
});

// read all src files
function walk(dir) {
  const files = [];
  fs.readdirSync(dir).forEach((f) => {
    const fp = path.join(dir, f);
    const st = fs.statSync(fp);
    if (st.isDirectory()) files.push(...walk(fp));
    else if (/\.(ts|tsx|js|jsx|html)$/.test(fp)) files.push(fp);
  });
  return files;
}

const files = walk(srcDir);

function usedSelector(sel) {
  const name = sel.slice(1);
  const isClass = sel.startsWith(".");
  for (const fp of files) {
    const content = fs.readFileSync(fp, "utf8");
    if (isClass) {
      // check className="...TOKEN..." or class="...TOKEN..."
      const cre = new RegExp(
        "class(Name)?\\s*=\\s*[\"'`][^\"'`]*\\b" +
          escapeReg(name) +
          "\\b[^\"'`]*[\"'`]",
        "m"
      );
      if (cre.test(content)) return true;
      // querySelector('.token') or getElementsByClassName('token')
      const cre2 = new RegExp(
        "(querySelectorAll|querySelector)\\s*\\(\\s*['\"]\\." +
          escapeReg(name) +
          "['\"]\\s*\\)"
      );
      if (cre2.test(content)) return true;
      const cre3 = new RegExp(
        "getElementsByClassName\\s*\\(\\s*['\"]" +
          escapeReg(name) +
          "['\"]\\s*\\)"
      );
      if (cre3.test(content)) return true;
      // general word match (class used in template vars) - fallback
      const cre4 = new RegExp("\\b" + escapeReg(name) + "\\b");
      if (cre4.test(content)) return true;
    } else {
      // id
      const cre = new RegExp(
        "id\\s*=\\s*[\"'`][^\"'`]*\\b" + escapeReg(name) + "\\b[^\"'`]*[\"'`]",
        "m"
      );
      if (cre.test(content)) return true;
      const cre2 = new RegExp(
        "(querySelectorAll|querySelector)\\s*\\(\\s*['\"]#" +
          escapeReg(name) +
          "['\"]\\s*\\)"
      );
      if (cre2.test(content)) return true;
      const cre3 = new RegExp(
        "getElementById\\s*\\(\\s*['\"]" + escapeReg(name) + "['\"]\\s*\\)"
      );
      if (cre3.test(content)) return true;
      const cre4 = new RegExp("\\b" + escapeReg(name) + "\\b");
      if (cre4.test(content)) return true;
    }
  }
  return false;
}

function escapeReg(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const results = { total: selectors.size, selectors: [] };

[...selectors].sort().forEach((sel) => {
  const used = usedSelector(sel);
  results.selectors.push({ selector: sel, used });
});

const unused = results.selectors.filter((s) => !s.used).map((s) => s.selector);

console.log(
  JSON.stringify(
    { unused, totalSelectors: results.total, checkedFiles: files.length },
    null,
    2
  )
);
