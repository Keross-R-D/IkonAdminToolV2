#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { exec, execSync } = require("child_process");

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

// Get the app directory
const appFolder = path.dirname(__filename);

// Check command-line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === "dev") {
  // Run in development mode
  console.log("🚀 Starting Next.js in development mode...");
  const devProcess = exec("npm run dev", { cwd: appFolder });
  devProcess.stdout.on("data", (data) => {
    console.log(data);
  });
  devProcess.stderr.on("data", (data) => {
    console.error(data);
  });
} else if (command === "update") {
  // Update dependencies
  console.log("📦 Updating dependencies...");
  try {
    execSync("npm i -g https://github.com/Keross-R-D/IkonAdminToolV2.git", { cwd: appFolder, stdio: 'inherit' });
    console.log("✅ Dependencies updated successfully!");
  } catch (error) {
    console.error("❌ Error updating dependencies:", error);
    process.exit(1);
  }
} else {
  // Default behavior - generate folder structure and run server
  // Get the folder where the command was run
  const targetFolder = process.cwd();
  const structure = readDirectory(targetFolder);

  // Save the folder structure JSON
  const outputPath = path.join(appFolder, "public/folderStructure.json");
  fs.writeFileSync(outputPath, JSON.stringify(structure, null, 2));
  console.log(`✅ Folder structure saved!`);
  
  // Check if .next exists, if not build first
  const nextFolderPath = path.join(appFolder, ".next");
  if (!fs.existsSync(nextFolderPath)) {
    console.log("🔨 .next folder not found, building first...");
    try {
      execSync("npm run build", { cwd: appFolder, stdio: 'inherit' });
      console.log("✅ Build completed successfully!");
    } catch (error) {
      console.error("❌ Build failed:", error);
      process.exit(1);
    }
  }
  
  console.log(`🚀 Starting Next.js server...`);
  const serverProcess = exec("node server.js", { cwd: appFolder });
  serverProcess.stdout.on("data", (data) => {
    console.log(data);
  });
  serverProcess.stderr.on("data", (data) => {
    console.error(data);
  });
}