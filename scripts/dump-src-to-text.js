const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "..", "src");
const distDir = path.join(__dirname, "..", "dist");
const outputFile = path.join(distDir, "src-dump.txt");

const validExtensions = [
  ".js",
  ".ts",
  ".jsx",
  ".tsx",
  ".json",
  ".css",
  ".html",
];

function readAllFiles(dir) {
  let filesContent = "";

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      filesContent += readAllFiles(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (validExtensions.includes(ext)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        const relativePath = path
          .relative(srcDir, fullPath)
          .replace(/\\/g, "/");
        filesContent += `src/${relativePath}\n${content.trim()}\n\n`;
      }
    }
  }

  return filesContent;
}

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Write to file
const allContent = readAllFiles(srcDir).trim();
fs.writeFileSync(outputFile, allContent, "utf-8");

console.log(`✅ Dumped all src files into: ${outputFile}`);
