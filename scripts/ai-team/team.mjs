#!/usr/bin/env node
// AI Team helper — the tool Claude (the orchestrator) uses to reach outside agents.
// Zero dependencies: needs only Node 18+ (already required by Codex CLI).
//
//   node scripts/ai-team/team.mjs doctor                       which agents are installed
//   node scripts/ai-team/team.mjs list                         registry, with install status
//   node scripts/ai-team/team.mjs route <taskType> "<summary>" pick the best agent (JEV, else scoreboard)
//   node scripts/ai-team/team.mjs run <agentId> <taskType> <promptFile|->   run one task
//   node scripts/ai-team/team.mjs record <runId> pass|fail "<evidence>"     grade a run
//   node scripts/ai-team/team.mjs note <agentId> <taskType> <sec> pass|fail "<evidence>"  log a Claude subagent
//   node scripts/ai-team/team.mjs score                        success rate + speed per agent
//
// Every run is appended to .claude/ai-team/ledger.jsonl. A run only counts toward the
// scoreboard once `record` grades it with evidence (a test, a build, a review) — that is
// what keeps the system learning from qualified information instead of guesses.

import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const TEAM_DIR = join(ROOT, '.claude', 'ai-team');
const REGISTRY = process.env.AI_TEAM_REGISTRY || join(TEAM_DIR, 'agents.json');
const LEDGER = process.env.AI_TEAM_LEDGER || join(TEAM_DIR, 'ledger.jsonl');
const OUT_DIR = join(TEAM_DIR, 'runs');
const OLLAMA = process.env.OLLAMA_HOST || 'http://localhost:11434';
const IS_WIN = process.platform === 'win32';

const registry = () => JSON.parse(readFileSync(REGISTRY, 'utf8'));
const die = (msg) => { console.error(`error: ${msg}`); process.exit(1); };

function ledger() {
  if (!existsSync(LEDGER)) return [];
  return readFileSync(LEDGER, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
}
const append = (entry) => appendFileSync(LEDGER, JSON.stringify(entry) + '\n');

// ---------- install detection ----------

function hasCommand(bin) {
  const r = spawnSync(IS_WIN ? 'where' : 'which', [bin], { encoding: 'utf8' });
  return r.status === 0;
}

async function ollamaModels() {
  try {
    const res = await fetch(`${OLLAMA}/api/tags`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) return null;
    return (await res.json()).models.map((m) => m.name);
  } catch { return null; }
}

async function status() {
  const reg = registry();
  const pulled = await ollamaModels();
  return reg.agents.map((a) => {
    let installed;
    if (a.kind === 'native') installed = true;
    else if (a.kind === 'ollama') installed = !!pulled?.some((n) => n === a.model || n === `${a.model}:latest`);
    else if (a.kind === 'cli') installed = hasCommand(a.bin);
    else if (a.kind === 'router') installed = !!process.env[a.envKey];
    return { ...a, installed };
  });
}

async function doctor() {
  const rows = await status();
  const pulled = await ollamaModels();
  console.log(`Ollama server: ${pulled ? `running (${pulled.length} models)` : 'not reachable at ' + OLLAMA}`);
  for (const a of rows) {
    console.log(`${a.installed ? '[ok]  ' : '[--]  '}${a.id.padEnd(24)} ${a.kind.padEnd(7)} ${a.role}`);
    if (!a.installed && a.install) console.log(`        install: ${a.install}`);
  }
  // CLI flags change between releases — show the live help so the registry can be corrected.
  for (const a of rows.filter((r) => r.kind === 'cli' && r.installed && r.verifyFlags)) {
    const help = spawnSync(a.bin, a.helpArgs || ['--help'], { encoding: 'utf8', shell: IS_WIN });
    const text = (help.stdout || help.stderr || '').split('\n').slice(0, 25).join('\n');
    console.log(`\n--- ${a.id} ${(a.helpArgs || ['--help']).join(' ')} (check the registry args match) ---\n${text}`);
  }
}

// ---------- scoreboard ----------

function scoreboard() {
  const runs = ledger().filter((e) => e.type === 'run');
  const grades = new Map(ledger().filter((e) => e.type === 'grade').map((g) => [g.runId, g]));
  const stats = {};
  for (const r of runs) {
    const g = grades.get(r.runId);
    if (!g) continue; // ungraded = unqualified, ignored
    const k = `${r.agent}|${r.taskType}`;
    stats[k] ??= { agent: r.agent, taskType: r.taskType, pass: 0, fail: 0, ms: [] };
    stats[k][g.result] += 1;
    stats[k].ms.push(r.ms);
  }
  return Object.values(stats).map((s) => {
    const n = s.pass + s.fail;
    const sorted = [...s.ms].sort((a, b) => a - b);
    return {
      agent: s.agent, taskType: s.taskType, graded: n,
      // Laplace-smoothed pass rate: a new agent starts at 50% instead of 0 or 100.
      passRate: (s.pass + 1) / (n + 2),
      medianSec: Math.round(sorted[Math.floor(sorted.length / 2)] / 1000),
    };
  });
}

function score() {
  const rows = scoreboard().sort((a, b) => a.taskType.localeCompare(b.taskType) || b.passRate - a.passRate);
  if (!rows.length) return console.log('No graded runs yet. Grade runs with `record` to build the scoreboard.');
  console.log('taskType'.padEnd(14) + 'agent'.padEnd(24) + 'graded  pass%  median');
  for (const r of rows) {
    console.log(r.taskType.padEnd(14) + r.agent.padEnd(24) + String(r.graded).padEnd(8) +
      `${Math.round(r.passRate * 100)}%`.padEnd(7) + `${r.medianSec}s`);
  }
}

// ---------- routing ----------

async function route(taskType, summary) {
  if (!taskType || !summary) die('usage: route <taskType> "<summary>"');
  const reg = registry();
  if (!reg.taskTypes[taskType]) die(`unknown taskType "${taskType}". Known: ${Object.keys(reg.taskTypes).join(', ')}`);
  const candidates = (await status()).filter((a) => a.installed && a.kind !== 'router' && a.taskTypes.includes(taskType));
  if (!candidates.length) die(`no installed agent handles "${taskType}". Run doctor.`);

  const board = Object.fromEntries(scoreboard().filter((s) => s.taskType === taskType).map((s) => [s.agent, s]));
  const rank = (a) => (board[a.id]?.passRate ?? 0.5) + (a.priority ?? 0) * 0.01;
  const fallback = [...candidates].sort((a, b) => rank(b) - rank(a))[0];

  const jev = reg.agents.find((a) => a.kind === 'router');
  const key = jev && process.env[jev.envKey];
  if (!key) return print({ agent: fallback.id, by: 'scoreboard', reason: 'no JEV key set; highest graded pass rate' });

  // JEV is a "System One" model: it answers typed questions fast instead of writing text.
  // We give it the task, each candidate's strengths, and the track record, and ask one Choice.
  const state = [
    `Task type: ${taskType} — ${reg.taskTypes[taskType]}`,
    `Task: ${summary}`,
    'Track record (pass rate from graded runs, median seconds):',
    ...candidates.map((a) => `- ${a.id}: ${board[a.id] ? `${Math.round(board[a.id].passRate * 100)}% over ${board[a.id].graded} runs, ${board[a.id].medianSec}s` : 'no graded runs yet'}`),
  ].join('\n');
  const criteria = Object.fromEntries(candidates.map((a) => [a.id, `${a.role}. Strengths: ${a.strengths}`]));
  try {
    const res = await fetch(process.env.JEV_URL || 'https://api.typesafe.ai/v1/systemone', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: jev.model, state,
        questions: {
          agent: { type: 'choice', instructions: 'Which agent is most likely to complete this task correctly and quickly?', criteria },
          risk: { type: 'score', instructions: 'How risky is this change to the live website?', criteria: ['Trivial', 'Low', 'Medium', 'High'] },
        },
      }),
      signal: AbortSignal.timeout(Number(process.env.JEV_TIMEOUT_MS || 4000)),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    const pick = body.answers?.agent ?? body.choices?.agent;
    const chosen = pick?.choice;
    const p = pick?.probabilities?.[chosen];
    const min = Number(process.env.JEV_MIN_CONFIDENCE || 0.7);
    if (!criteria[chosen]) throw new Error('unrecognised answer shape');
    if (p !== undefined && p < min) {
      return print({ agent: fallback.id, by: 'scoreboard', reason: `JEV unsure (${p.toFixed(2)} < ${min}) — used track record`, jevSuggested: chosen });
    }
    const risk = body.answers?.risk ?? body.scores?.risk;
    return print({ agent: chosen, by: 'jev', confidence: p, risk: risk?.score ?? risk?.choice });
  } catch (err) {
    return print({ agent: fallback.id, by: 'scoreboard', reason: `JEV call failed (${err.message})` });
  }
}
const print = (o) => console.log(JSON.stringify(o, null, 2));

// ---------- running an agent ----------

function readPrompt(src) {
  if (!src) die('usage: run <agentId> <taskType> <promptFile|->');
  if (src === '-') return readFileSync(0, 'utf8');
  if (!existsSync(src)) die(`prompt file not found: ${src}`);
  return readFileSync(src, 'utf8');
}

async function runOllama(agent, prompt, timeoutMs) {
  const res = await fetch(`${OLLAMA}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: agent.model, prompt, stream: false, options: agent.options || {} }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}: ${await res.text()}`);
  return (await res.json()).response;
}

function runCli(agent, prompt, timeoutMs) {
  return new Promise((ok, fail) => {
    // Long prompts go in on stdin (no quoting problems, no Windows 8k command-line limit).
    // CLIs that can't read stdin get {promptFile}: a path to the prompt saved on disk.
    mkdirSync(OUT_DIR, { recursive: true });
    const promptFile = join(OUT_DIR, `prompt-${Date.now()}.md`);
    writeFileSync(promptFile, prompt);
    let args = agent.args.map((x) => x.replaceAll('{promptFile}', promptFile));
    // Windows runs npm shims (.cmd) through cmd.exe, which does not quote args for us.
    if (IS_WIN) args = args.map((x) => (/[\s"]/.test(x) ? `"${x.replaceAll('"', '\\"')}"` : x));
    const child = spawn(agent.bin, args, { cwd: ROOT, shell: IS_WIN, stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '', err = '';
    const timer = setTimeout(() => { child.kill(); fail(new Error(`timed out after ${timeoutMs / 1000}s`)); }, timeoutMs);
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (err += d));
    child.on('error', (e) => { clearTimeout(timer); fail(e); });
    child.on('close', (code) => {
      clearTimeout(timer);
      code === 0 ? ok(out) : fail(new Error(`exit ${code}: ${err.slice(-2000)}`));
    });
    if (agent.stdin) child.stdin.write(prompt);
    child.stdin.end();
  });
}

async function run(agentId, taskType, promptSrc) {
  const reg = registry();
  const agent = reg.agents.find((a) => a.id === agentId);
  if (!agent) die(`unknown agent "${agentId}". See: list`);
  if (agent.kind === 'native') die(`${agentId} is a Claude Code subagent — call it with the Agent tool, not this script.`);
  if (agent.kind === 'router') die('jev is the router, not a worker. Use: route');
  if (!reg.taskTypes[taskType]) die(`unknown taskType "${taskType}"`);
  if (!(await status()).find((a) => a.id === agentId).installed) die(`${agentId} is not installed. Install: ${agent.install}`);

  const learnings = existsSync(join(TEAM_DIR, 'learnings.md')) ? readFileSync(join(TEAM_DIR, 'learnings.md'), 'utf8') : '';
  // Every outside agent gets the house rules + verified lessons prepended, so it never
  // works without the project's hard rules (logo lock, cultural guardrail, etc.).
  const prompt = [reg.preamble, learnings && `Verified lessons from past runs:\n${learnings}`, '--- TASK ---', readPrompt(promptSrc)]
    .filter(Boolean).join('\n\n');

  const runId = randomUUID().slice(0, 8);
  const timeoutMs = Number(process.env.AI_TEAM_TIMEOUT_SEC || agent.timeoutSec || 600) * 1000;
  const started = Date.now();
  let output, error;
  try {
    output = agent.kind === 'ollama' ? await runOllama(agent, prompt, timeoutMs) : await runCli(agent, prompt, timeoutMs);
  } catch (e) { error = e.message; }
  const ms = Date.now() - started;

  mkdirSync(OUT_DIR, { recursive: true });
  const outFile = join(OUT_DIR, `${runId}-${agentId}.md`);
  writeFileSync(outFile, output ?? `ERROR: ${error}`);
  append({ type: 'run', runId, agent: agentId, taskType, ms, ok: !error, error, at: new Date().toISOString() });
  print({ runId, agent: agentId, ok: !error, seconds: Math.round(ms / 1000), output: outFile.replace(ROOT + '/', '').replace(ROOT + '\\', ''), error });
  if (error) process.exitCode = 2;
}

function record(runId, result, ...evidence) {
  if (!['pass', 'fail'].includes(result)) die('usage: record <runId> pass|fail "<evidence>"');
  const note = evidence.join(' ').trim();
  if (!note) die('evidence is required (e.g. "npm test green", "build failed: type error"). Ungraded guesses do not train the router.');
  if (!ledger().some((e) => e.type === 'run' && e.runId === runId)) die(`no run with id ${runId}`);
  append({ type: 'grade', runId, result, evidence: note, at: new Date().toISOString() });
  console.log(`graded ${runId}: ${result}`);
}

// Claude's own subagents run through the Agent tool, so the orchestrator logs them here
// after grading — that way they compete on the same scoreboard as outside agents.
function note(agentId, taskType, seconds, result, ...evidence) {
  const reg = registry();
  if (!reg.agents.some((a) => a.id === agentId)) die(`unknown agent "${agentId}"`);
  if (!reg.taskTypes[taskType]) die(`unknown taskType "${taskType}"`);
  if (!(Number(seconds) >= 0)) die('usage: note <agentId> <taskType> <seconds> pass|fail "<evidence>"');
  if (!['pass', 'fail'].includes(result) || !evidence.join(' ').trim()) die('usage: note <agentId> <taskType> <seconds> pass|fail "<evidence>"');
  const runId = randomUUID().slice(0, 8);
  append({ type: 'run', runId, agent: agentId, taskType, ms: Number(seconds) * 1000, ok: true, at: new Date().toISOString() });
  record(runId, result, ...evidence);
}

async function list() {
  for (const a of await status()) {
    console.log(`${a.installed ? '[ok]' : '[--]'} ${a.id.padEnd(24)} tasks: ${a.taskTypes.join(', ') || '(router)'}`);
  }
}

const [cmd, ...rest] = process.argv.slice(2);
const commands = { doctor, list, route, run, record, note, score };
if (!commands[cmd]) {
  console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 12).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(cmd ? 1 : 0);
}
await commands[cmd](...rest);
