const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const distDir = path.join(__dirname, "..", "dist");
const outputPath = path.join(distDir, "techni-management.zip");

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

const output = fs.createWriteStream(outputPath);
const archive = archiver("zip", { zlib: { level: 9 } });

output.on("close", () => {
  console.log(`Project zipped: ${archive.pointer()} total bytes`);
});

archive.on("error", (err) => {
  throw err;
});

archive.pipe(output);

// Zip everything except dist, node_modules, .next
archive.glob("**/*", {
  cwd: path.join(__dirname, ".."),
  ignore: ["dist/**", "node_modules/**", ".next/**"],
});

archive.finalize();
