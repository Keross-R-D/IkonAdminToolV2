const fs = require("fs");
const { exec } = require("child_process");

console.log("🚀 Starting Next.js server...");

// Check if the build exists already
if (!fs.existsSync(`${__dirname}/.next`)) {
  console.log("Build not found, building Next.js app. First time it may take some time please wait...");
  exec("npx next build", { cwd: __dirname }, handleBuild);
} else {
  startServer();
}

function handleBuild(error, stdout, stderr) {
  if (error) {
    console.error(`Build error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Build stderr: ${stderr}`);
  }
  console.log(`Build stdout: ${stdout}`);
  startServer();
}

function startServer() {
  const nextProcess = exec("npx next start", { cwd: __dirname });

  nextProcess.stdout.on("data", (data) => {
    console.log(data);
  });

  nextProcess.stderr.on("data", (data) => {
    console.error(data);
  });
}