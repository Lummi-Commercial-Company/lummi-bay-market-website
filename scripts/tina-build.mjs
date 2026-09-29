/**
 * Runs the TinaCMS build, and degrades gracefully when TinaCloud credentials are
 * absent instead of failing the whole deploy.
 *
 * Why this exists: `tinacms build` exits with ERR_CLOUD_CHECK_FAILED when
 * NEXT_PUBLIC_TINA_CLIENT_ID or TINA_TOKEN is missing. That took the entire site
 * down with it — no pages, no preview URL, nothing to look at — when the only
 * thing actually broken was the editor.
 *
 * With credentials: a normal cloud build. /admin works.
 * Without: a local build, so the site still renders and deploys. /admin will not
 * be able to reach TinaCloud, and the log says so loudly.
 */
import { spawnSync } from "node:child_process";

const clientId = process.env.NEXT_PUBLIC_TINA_CLIENT_ID;
const token = process.env.TINA_TOKEN;
const hasCloudCredentials = Boolean(clientId && token);

const args = hasCloudCredentials
  ? ["tinacms", "build"]
  : ["tinacms", "build", "--local", "--skip-cloud-checks"];

if (!hasCloudCredentials) {
  const missing = [
    !clientId && "NEXT_PUBLIC_TINA_CLIENT_ID",
    !token && "TINA_TOKEN",
  ].filter(Boolean);
  console.warn(
    [
      "",
      "  ⚠  TinaCMS: building WITHOUT TinaCloud.",
      `     Missing: ${missing.join(", ")}`,
      "",
      "     The site will build and deploy normally. The /admin editor will NOT",
      "     be able to sign in or save until these are set in the host's",
      "     environment variables and the project is redeployed.",
      "",
    ].join("\n"),
  );
}

const result = spawnSync("npx", args, { stdio: "inherit", shell: false });
process.exit(result.status ?? 1);
