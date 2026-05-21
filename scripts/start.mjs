import { spawnSync } from "node:child_process";

const port = process.env.PORT || "8080";

const result = spawnSync(
  "npx",
  ["next", "start", "-H", "0.0.0.0", "-p", port],
  { stdio: "inherit", env: process.env, shell: true },
);

process.exit(result.status ?? 1);
