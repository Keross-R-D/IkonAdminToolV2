#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { exec } = require("child_process");

function generateId() {
  return crypto.randomBytes(8).toString("hex");
}

function readDirectory(dir, base = dir) {
  let results = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);
    if(file === "lib") continue; // Skip these folders

    const node = {
      id: file === "src"? Date.now().toString() : file.split("_")[1],
      name: file.split("_")[0],
      path: fullPath, // ✅ Include absolute path
      type: stats.isDirectory() ? "folder" : "file",
      children: stats.isDirectory() ? readDirectory(fullPath, base) : [],
    };

    results.push(node);
  }
  return results;
}

// Get the folder where the command was run
const targetFolder = process.cwd();
const structure = readDirectory(targetFolder);

// Save the folder structure JSON
const appFolder = path.dirname(__filename);
const outputPath = path.join(appFolder, "public/folderStructure.json");

fs.writeFileSync(outputPath, JSON.stringify(structure, null, 2));

console.log(`✅ Folder structure saved!`);
//console.log(`🚀 Starting Next.js server...`);

const serverProcess = exec("node server.js", { cwd: appFolder });

serverProcess.stdout.on("data", (data) => {
  console.log(data);

});

serverProcess.stderr.on("data", (data) => {
  console.error(data);
});
