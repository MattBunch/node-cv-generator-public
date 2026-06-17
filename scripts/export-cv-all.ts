import { spawn } from "node:child_process";

const run = (command: string, args: string[]): Promise<void> =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", shell: false });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });

const exportAll = async (): Promise<void> => {
  await run("pnpm", ["cv:ats"]);
  await run("pnpm", ["cv:polished"]);
  await run("pnpm", ["cv:references"]);
};

exportAll().catch((error: unknown) => {
  console.error("Failed to export all CV formats");
  console.error(error);
  process.exitCode = 1;
});
