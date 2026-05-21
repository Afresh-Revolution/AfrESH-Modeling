import { spawnSync } from "node:child_process";

if (
  process.env.NODE_ENV === "production" &&
  !process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY?.trim()
) {
  console.warn(
    "[afresh-web] NEXT_SERVER_ACTIONS_ENCRYPTION_KEY is unset. Admin Server Actions may 404 after redeploys (UnrecognizedActionError).",
  );
}

const port = process.env.PORT || "8080";

const result = spawnSync(
  "npx",
  ["next", "start", "-H", "0.0.0.0", "-p", port],
  { stdio: "inherit", env: process.env, shell: true },
);

process.exit(result.status ?? 1);
