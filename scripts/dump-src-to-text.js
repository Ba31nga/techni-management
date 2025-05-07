const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "..", "src");
const distDir = path.join(__dirname, "..", "dist");
const outputFile = path.join(distDir, "src-dump.txt");

function readAllFiles(dir) {
  let filesContent = "";

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      filesContent += readAllFiles(fullPath);
    } else if (entry.isFile()) {
      const content = fs.readFileSync(fullPath, "utf-8");
      const relativePath = path.relative(srcDir, fullPath);
      filesContent += `\n\n--- FILE: ${relativePath} ---\n\n${content}`;
    }
  }

  return filesContent;
}

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

const allContent = readAllFiles(srcDir);
fs.writeFileSync(outputFile, allContent, "utf-8");

console.log(`✅ Dumped all src files into: ${outputFile}`);
