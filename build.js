/* =====================================================================
   Conect Web — build.js
   Embute styles.css dentro do HTML (entre os marcadores CSS_INLINE)
   para eliminar o round-trip do CSS e melhorar FCP/LCP.

   Uso:
     node build.js          -> embute o CSS (produção)
     node build.js --dev    -> volta ao <link> externo (desenvolvimento)

   styles.css continua sendo a ÚNICA fonte de verdade. Edite o CSS lá
   e rode "node build.js" antes de publicar.
   ===================================================================== */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const CSS_FILE = path.join(ROOT, "styles.css");
const PAGES = [
  { file: path.join(ROOT, "index.html"), href: "./styles.css" },
  { file: path.join(ROOT, "integracao-de-sistemas", "index.html"), href: "/styles.css" },
];

const DEV = process.argv.includes("--dev");
const START = "<!-- CSS_INLINE_START -->";
const END = "<!-- CSS_INLINE_END -->";
const blockRe = new RegExp(`${START}[\\s\\S]*?${END}`);

const css = fs.readFileSync(CSS_FILE, "utf8");

for (const { file, href } of PAGES) {
  if (!fs.existsSync(file)) {
    console.warn("! ignorado (não encontrado):", file);
    continue;
  }
  let html = fs.readFileSync(file, "utf8");
  if (!blockRe.test(html)) {
    console.warn("! sem marcadores CSS_INLINE:", file);
    continue;
  }
  const inner = DEV
    ? `  <link rel="stylesheet" href="${href}" />`
    : `  <style>\n${css}\n  </style>`;
  html = html.replace(blockRe, `${START}\n${inner}\n  ${END}`);
  fs.writeFileSync(file, html);
  console.log((DEV ? "↩ link externo" : "✓ CSS embutido") + " em", path.relative(ROOT, file));
}
