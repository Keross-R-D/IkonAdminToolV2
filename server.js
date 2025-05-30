const { exec } = require("child_process");

console.log("🚀 Starting Next.js server...");

const nextProcess = exec("npx next dev", { cwd: __dirname });

nextProcess.stdout.on("data", (data) => {
  console.log(data);

});

nextProcess.stderr.on("data", (data) => {
  console.error(data);
});