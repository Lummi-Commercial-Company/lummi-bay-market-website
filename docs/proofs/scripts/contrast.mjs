/* WCAG 2.x contrast audit of the locked brand palette (skill `brand-system`).
   Run: node docs/proofs/scripts/contrast.mjs
   No browser needed — this is pure sRGB maths, so it is the one proof in this
   directory that does not depend on Playwright or on fuel-strip-proof.html. */

const T = {
  navy: '#1C4E8F', navyDeep: '#14396B', teal: '#0FB5C4', cedar: '#C9772E',
  ground: '#FBF9F4', paper: '#FFFFFF', ink: '#2A2820', bone: '#F5F1E8',
};

const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
const lin = c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const L = h => { const [r, g, b] = hex(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

/* Opacity does not lower contrast by its own factor — it composites toward the
   background. Measure the composited colour, never the token. */
const over = (fg, bg, a) => {
  const F = hex(fg), B = hex(bg);
  return '#' + F.map((v, i) => v * a + B[i] * (1 - a))
    .map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
};

let failures = 0;
const check = (label, fg, bg, floor) => {
  const r = ratio(fg, bg), ok = r >= floor;
  if (!ok) failures++;
  console.log(
    (ok ? '  ok  ' : ' FAIL ') + label.padEnd(46) +
    r.toFixed(2).padStart(6) + '  needs ' + floor.toFixed(1)
  );
};

console.log('\nBody text — needs 4.5:1');
check('ink on ground', T.ink, T.ground, 4.5);
check('ink @ .70 opacity on ground', over(T.ink, T.ground, 0.70), T.ground, 4.5);
check('ink @ .75 opacity on ground', over(T.ink, T.ground, 0.75), T.ground, 4.5);
check('navy on ground', T.navy, T.ground, 4.5);
check('navy-deep on paper (prices)', T.navyDeep, T.paper, 4.5);
check('bone on navy (reversed)', T.bone, T.navy, 4.5);

console.log('\nSmall text in accent colours — needs 4.5:1');
check('cedar on paper', T.cedar, T.paper, 4.5);
check('cedar on bone', T.cedar, T.bone, 4.5);
check('cedar on ground', T.cedar, T.ground, 4.5);
check('cedar @ .75 opacity on ground', over(T.cedar, T.ground, 0.75), T.ground, 4.5);
check('teal on ground', T.teal, T.ground, 4.5);
check('paper on cedar fill (Rewards pill)', T.paper, T.cedar, 4.5);
check('ink on cedar fill', T.ink, T.cedar, 4.5);

console.log('\nLarge text (>=24px, or >=18.66px bold) — needs 3:1');
check('cedar on paper', T.cedar, T.paper, 3);
check('cedar on bone', T.cedar, T.bone, 3);
check('cedar on ground', T.cedar, T.ground, 3);

console.log('\nNon-text UI boundaries (WCAG 1.4.11) — needs 3:1');
check('cedar fill against navy header', T.cedar, T.navy, 3);
check('bone fill against navy header', T.bone, T.navy, 3);
check('teal waterline against ground', T.teal, T.ground, 3);

console.log('\n' + (failures ? failures + ' failing pair(s). See ADR 0014.' : 'all pass') + '\n');
