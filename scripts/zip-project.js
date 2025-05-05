// scripts/zip-project.js
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const output = fs.createWriteStream(
  path.join(__dirname, "..", "dist", "techni-management.zip")
);

const archive = archiver("zip", { zlib: { level: 9 } });

output.on("close", () => {
  console.log(`Project zipped: ${archive.pointer()} total bytes`);
});

archive.on("error", (err) => {
  throw err;
});

archive.pipe(output);
archive.directory(path.join(__dirname, ".."), false); // zip root folder content
archive.finalize();
