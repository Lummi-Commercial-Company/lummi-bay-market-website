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
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";

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

/*
 * Reuse the CMS editor when nothing it is built from has changed (1 Oct 2026).
 *
 * `tinacms build` spends most of a deploy rebuilding the editor at /admin —
 * about 40 of the build's ~50 seconds. The editor is built from tina/, the lib/
 * code it imports, the installed packages and the TinaCloud settings; it never
 * changes when staff save content. A save in the CMS is a content commit, so
 * its deploy can copy the last build's editor instead. The copy is keyed by a
 * hash of every one of those inputs, kept in .next/cache (which the host keeps
 * between builds); any change to any of them builds the editor again.
 *
 * TINA_FORCE_BUILD=1 always builds.
 */
const fingerprint = editorFingerprint();
const cacheDir = path.join(".next", "cache", "tina-admin");
const cached = path.join(cacheDir, fingerprint);

if (!process.env.TINA_FORCE_BUILD && existsSync(path.join(cached, "index.html"))) {
  rmSync("public/admin", { recursive: true, force: true });
  cpSync(cached, "public/admin", { recursive: true });
  console.log(`TinaCMS: nothing the editor is built from has changed (${fingerprint.slice(0, 12)}); reusing the last build's /admin.`);
  process.exit(0);
}

const result = spawnSync("npx", args, { stdio: "inherit", shell: false });
if (result.status === 0 && existsSync("public/admin/index.html")) {
  try {
    rmSync(cacheDir, { recursive: true, force: true });
    mkdirSync(cacheDir, { recursive: true });
    cpSync("public/admin", cached, { recursive: true });
  } catch (error) {
    console.warn(`TinaCMS: could not keep this editor build for next time (${error.message}).`);
  }
}
process.exit(result.status ?? 1);

function editorFingerprint() {
  const hash = createHash("sha256");
  const files = [
    ...walk("tina").filter((file) => !file.includes("__generated__")),
    ...walk("lib"),
    "package.json",
    "package-lock.json",
  ].sort();
  for (const file of files) {
    hash.update(file);
    hash.update(readFileSync(file));
  }
  // The editor is built for one TinaCloud project and one branch.
  hash.update(String(hasCloudCredentials));
  hash.update(clientId ?? "");
  hash.update(createHash("sha256").update(token ?? "").digest("hex"));
  hash.update(process.env.NEXT_PUBLIC_TINA_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || "main");
  return hash.digest("hex");
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "node_modules" ? [] : walk(full);
    return [full];
  });
}
