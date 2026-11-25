/* Koi fish: data, body geometry and drawing.
   Everything here is plain TypeScript with no React, so it is easy to test and reuse. */

export const N = 16; // number of segments in the spine
const LX = -0.55; // light comes from the upper left
const LY = -0.83;

export type Pt = { x: number; y: number };
type Frame = Pt & { tx: number; ty: number; nx: number; ny: number; w: number };
type Kind = "kohaku" | "sanke" | "showa" | "ogon" | "chagoi";
export type Variant = {
  k: Kind;
  base: string;
  base2: string;
  fin: string; // r,g,b of the fins
  scale: string;
};
type Patch = {
  t: number;
  off: number;
  rx: number;
  ry: number;
  c1: string;
  c2: string;
  a: number;
  j: number[];
};
export type Fish = {
  x: number;
  y: number;
  a: number; // heading
  av: number; // turn speed (used when the fish starts swimming)
  sp: number; // current speed
  base: number; // cruising speed
  w: number; // wander phase
  ph: number; // tail wave phase
  pf: number; // pectoral fin phase
  L: number; // body length
  seg: number;
  mw: number; // max half-width
  v: Variant;
  patches: Patch[];
  s: Pt[]; // spine points, head first
};

export const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const rint = (a: number, b: number) => Math.floor(rnd(a, b + 1));
export const clamp = (v: number, a: number, b: number) =>
  Math.max(a, Math.min(b, v));

const VARIANTS: Variant[] = [
  { k: "kohaku", base: "#EEE9DF", base2: "#E0DACD", fin: "238,234,224", scale: "rgba(90,70,55,.17)" },
  { k: "sanke", base: "#EEE9DF", base2: "#E0DACD", fin: "238,234,224", scale: "rgba(90,70,55,.17)" },
  { k: "showa", base: "#2D3038", base2: "#20232B", fin: "200,206,216", scale: "rgba(255,255,255,.08)" },
  { k: "ogon", base: "#F2C34E", base2: "#CF8E26", fin: "240,200,110", scale: "rgba(120,70,10,.22)" },
  { k: "chagoi", base: "#9C7646", base2: "#7C5A32", fin: "196,166,126", scale: "rgba(40,25,10,.22)" },
];

function patch(
  t: number, off: number, rx: number, ry: number,
  c1: string, c2: string, a = 1,
): Patch {
  // j makes each patch outline slightly irregular, like real markings
  const j = Array.from({ length: 9 }, () => rnd(0.78, 1.22));
  return { t, off, rx, ry, c1, c2, a, j };
}

function genPatches(v: Variant): Patch[] {
  const P: Patch[] = [];
  const R1 = "#E8502A", R2 = "#C42A17", B1 = "#2B2B31", B2 = "#15151A";
  if (v.k === "kohaku") {
    const n = rint(3, 5);
    for (let i = 0; i < n; i++)
      P.push(patch(rnd(0.12, 0.88), rnd(-0.35, 0.35), rnd(0.08, 0.17), rnd(0.6, 1), R1, R2));
    if (Math.random() < 0.5) P.push(patch(0.05, 0, 0.075, 0.9, R1, R2));
  } else if (v.k === "sanke") {
    const n = rint(3, 4);
    for (let i = 0; i < n; i++)
      P.push(patch(rnd(0.12, 0.88), rnd(-0.3, 0.3), rnd(0.08, 0.15), rnd(0.6, 1), R1, R2));
    for (let i = 0; i < 3; i++)
      P.push(patch(rnd(0.18, 0.85), rnd(-0.6, 0.6), rnd(0.03, 0.07), rnd(0.3, 0.55), B1, B2));
  } else if (v.k === "showa") {
    for (let i = 0; i < 3; i++)
      P.push(patch(rnd(0.15, 0.85), rnd(-0.35, 0.35), rnd(0.1, 0.18), rnd(0.7, 1.1), R1, R2));
    for (let i = 0; i < 2; i++)
      P.push(patch(rnd(0.2, 0.85), rnd(-0.4, 0.4), rnd(0.06, 0.11), rnd(0.5, 0.8), "#F2EDE4", "#DDD5C8"));
    P.push(patch(0.06, 0, 0.08, 0.95, "#F2EDE4", "#DDD5C8"));
  } else if (v.k === "ogon") {
    for (let i = 0; i < 4; i++)
      P.push(patch(rnd(0.1, 0.85), rnd(-0.5, 0.5), rnd(0.1, 0.2), rnd(0.7, 1.1), "#B8801A", "#B8801A", 0.22));
  } else {
    for (let i = 0; i < 5; i++) {
      const c = i % 2 ? "#6B4E2C" : "#B58A55";
      P.push(patch(rnd(0.1, 0.88), rnd(-0.5, 0.5), rnd(0.08, 0.18), rnd(0.6, 1.1), c, c, 0.35));
    }
  }
  return P;
}

// body width along the spine: narrow head, widest near the shoulders, thin tail
const prof = (k: number) =>
  k < 0.3
    ? 0.42 + 0.58 * Math.sin(((k / 0.3) * Math.PI) / 2)
    : 1 - 0.9 * Math.pow((k - 0.3) / 0.7, 1.15);

export function makeFish(
  variantIndex: number, x: number, y: number, angle: number, scale: number,
): Fish {
  const v = VARIANTS[variantIndex % VARIANTS.length];
  const L = rnd(125, 185) * scale;
  const seg = L / (N - 1);
  const s: Pt[] = [];
  for (let k = 0; k < N; k++)
    s.push({ x: x - Math.cos(angle) * seg * k, y: y - Math.sin(angle) * seg * k });
  return {
    x, y, a: angle, av: 0, sp: rnd(0.7, 1.1), base: rnd(0.7, 1.1),
    w: rnd(0, 6), ph: rnd(0, 6), pf: rnd(0, 6),
    L, seg, mw: L * 0.1, v, patches: genPatches(v), s,
  };
}

/* ---------- geometry ---------- */

function geom(f: Fish): Frame[] {
  const P: Frame[] = [];
  for (let i = 0; i < N; i++) {
    const s = f.s[i];
    const pv = f.s[Math.max(i - 1, 0)];
    const nx = f.s[Math.min(i + 1, N - 1)];
    let tx = pv.x - nx.x;
    let ty = pv.y - nx.y;
    const tl = Math.hypot(tx, ty) || 1;
    tx /= tl;
    ty /= tl;
    const qx = -ty;
    const qy = tx;
    const k = i / (N - 1);
    // a gentle sweep that builds toward the tail, plus a small counter-sway at the head
    let wv = Math.sin(f.ph - i * 0.2) * f.L * 0.055 * Math.pow(k, 1.8) * (0.4 + f.sp * 0.3);
    wv += Math.sin(f.ph - i * 0.2 + Math.PI) * f.L * 0.014 * (1 - k) * (0.4 + f.sp * 0.3);
    P.push({ x: s.x + qx * wv, y: s.y + qy * wv, tx, ty, nx: qx, ny: qy, w: f.mw * prof(k) });
  }
  return P;
}

type Ctx = CanvasRenderingContext2D;

function smooth(cx: Ctx, pts: Pt[]) {
  const n = pts.length;
  cx.beginPath();
  cx.moveTo((pts[0].x + pts[n - 1].x) / 2, (pts[0].y + pts[n - 1].y) / 2);
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    cx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
  }
  cx.closePath();
}

function body(cx: Ctx, P: Frame[], ox: number, oy: number) {
  const pts: Pt[] = [];
  const h = P[0];
  const e = P[N - 1];
  pts.push({ x: h.x + h.tx * h.w * 0.95 + ox, y: h.y + h.ty * h.w * 0.95 + oy });
  for (let i = 0; i < N; i++)
    pts.push({ x: P[i].x + P[i].nx * P[i].w + ox, y: P[i].y + P[i].ny * P[i].w + oy });
  pts.push({ x: e.x - e.tx * e.w * 0.4 + ox, y: e.y - e.ty * e.w * 0.4 + oy });
  for (let i = N - 1; i >= 0; i--)
    pts.push({ x: P[i].x - P[i].nx * P[i].w + ox, y: P[i].y - P[i].ny * P[i].w + oy });
  smooth(cx, pts);
}

// a fan-shaped fin with fine rays
function fan(
  cx: Ctx, x: number, y: number, ang: number, len: number,
  spread: number, fa: string, rays: number,
) {
  const a0 = ang - spread;
  const a1 = ang + spread;
  const g = cx.createRadialGradient(x, y, len * 0.08, x, y, len);
  g.addColorStop(0, `rgba(${fa},.62)`);
  g.addColorStop(1, `rgba(${fa},.10)`);
  cx.beginPath();
  cx.moveTo(x, y);
  for (let k = 0; k <= 12; k++) {
    const a = a0 + ((a1 - a0) * k) / 12;
    const r = len * (k % 2 ? 0.9 : 1);
    cx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  cx.closePath();
  cx.fillStyle = g;
  cx.fill();
  cx.beginPath();
  for (let k = 0; k <= rays; k++) {
    const a = a0 + ((a1 - a0) * k) / rays;
    cx.moveTo(x, y);
    cx.lineTo(x + Math.cos(a) * len * 0.94, y + Math.sin(a) * len * 0.94);
  }
  cx.strokeStyle = "rgba(255,255,255,.26)";
  cx.lineWidth = 0.8;
  cx.stroke();
}

function tailFin(cx: Ctx, f: Fish, P: Frame[], fa: string) {
  const e = P[N - 1];
  const q = P[N - 2];
  let dx = e.x - q.x;
  let dy = e.y - q.y;
  const l = Math.hypot(dx, dy) || 1;
  dx /= l;
  dy /= l;
  const nx = -dy;
  const ny = dx;
  const fl = f.L * 0.44;
  const fs = f.L * 0.23;
  const bw = e.w * 1.1;
  const bd = Math.sin(f.ph - (N - 1) * 0.2 - 0.5) * fl * 0.3;
  const pt = (a: number, b: number): Pt => ({ x: e.x + dx * a + nx * b, y: e.y + dy * a + ny * b });

  const B1 = pt(-3, bw), c1 = pt(fl * 0.3, fs * 0.9 + bd * 0.3), c2 = pt(fl * 0.85, fs * 1.4 + bd * 0.8), T1 = pt(fl, fs + bd);
  const q1 = pt(fl * 0.85, fs * 0.35 + bd), Nn = pt(fl * 0.68, bd), q2 = pt(fl * 0.85, -fs * 0.35 + bd), T2 = pt(fl, -fs + bd);
  const c3 = pt(fl * 0.85, -fs * 1.4 + bd * 0.8), c4 = pt(fl * 0.3, -fs * 0.9 + bd * 0.3), B2 = pt(-3, -bw);
  const end = pt(fl, bd);
  const g = cx.createLinearGradient(e.x, e.y, end.x, end.y);
  g.addColorStop(0, `rgba(${fa},.78)`);
  g.addColorStop(1, `rgba(${fa},.12)`);
  cx.beginPath();
  cx.moveTo(B1.x, B1.y);
  cx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, T1.x, T1.y);
  cx.quadraticCurveTo(q1.x, q1.y, Nn.x, Nn.y);
  cx.quadraticCurveTo(q2.x, q2.y, T2.x, T2.y);
  cx.bezierCurveTo(c3.x, c3.y, c4.x, c4.y, B2.x, B2.y);
  cx.closePath();
  cx.fillStyle = g;
  cx.fill();
  cx.beginPath();
  for (let s = -1; s <= 1.01; s += 0.25) {
    const tip = pt(fl * (0.78 + 0.22 * (1 - Math.abs(s))), s * fs * 1.05 + bd * (0.6 + 0.4 * Math.abs(s)));
    const b = pt(-1, s * bw * 0.6);
    cx.moveTo(b.x, b.y);
    cx.lineTo(tip.x, tip.y);
  }
  cx.strokeStyle = "rgba(255,255,255,.22)";
  cx.lineWidth = 0.8;
  cx.stroke();
}

function spineStroke(
  cx: Ctx, P: Frame[], i0: number, i1: number, sh: number, lw: number, col: string,
) {
  cx.beginPath();
  for (let i = i0; i <= i1; i++) {
    const q = P[i];
    const x = q.x + LX * q.w * sh;
    const y = q.y + LY * q.w * sh;
    if (i === i0) cx.moveTo(x, y);
    else cx.lineTo(x, y);
  }
  cx.lineWidth = lw;
  cx.lineCap = "round";
  cx.lineJoin = "round";
  cx.strokeStyle = col;
  cx.stroke();
}

/* ---------- drawing ---------- */

// t = time in ms (moves the light on the back), scale = 1 on desktop, smaller on phones
export function drawFish(cx: Ctx, f: Fish, t: number, scale: number) {
  const P = geom(f);
  const v = f.v;
  const fa = v.fin;

  // soft shadow on the pond floor
  cx.save();
  cx.shadowColor = "rgba(0,8,16,.35)";
  cx.shadowBlur = 14 * scale;
  body(cx, P, 6, 11);
  cx.fillStyle = "rgba(0,8,16,.2)";
  cx.fill();
  cx.restore();

  tailFin(cx, f, P, fa);

  for (const sd of [-1, 1]) {
    const a7 = P[7];
    const ang7 = Math.atan2(sd * a7.ny * 0.4 - a7.ty * 0.95, sd * a7.nx * 0.4 - a7.tx * 0.95) + Math.sin(f.pf + 1) * 0.1 * sd;
    fan(cx, a7.x + a7.nx * sd * a7.w * 0.7, a7.y + a7.ny * sd * a7.w * 0.7, ang7, f.L * 0.11, 0.4, fa, 4);
    const a3 = P[3];
    const ang3 = Math.atan2(sd * a3.ny * 0.55 - a3.ty * 0.85, sd * a3.nx * 0.55 - a3.tx * 0.85) + Math.sin(f.pf) * 0.34 * sd;
    fan(cx, a3.x + a3.nx * sd * a3.w * 0.95, a3.y + a3.ny * sd * a3.w * 0.95, ang3, f.L * 0.21, 0.55, fa, 6);
  }

  // body colour
  body(cx, P, 0, 0);
  const bg = cx.createLinearGradient(P[0].x, P[0].y, P[N - 1].x, P[N - 1].y);
  bg.addColorStop(0, v.base);
  bg.addColorStop(1, v.base2);
  cx.fillStyle = bg;
  cx.fill();

  cx.save();
  cx.clip();

  // colour patches
  for (const p of f.patches) {
    const u = p.t * (N - 1);
    const i0 = Math.floor(u);
    const i1 = Math.min(i0 + 1, N - 1);
    const r = u - i0;
    const a = P[i0];
    const b = P[i1];
    const nxx = a.nx + (b.nx - a.nx) * r;
    const nyy = a.ny + (b.ny - a.ny) * r;
    const tx = a.tx + (b.tx - a.tx) * r;
    const ty = a.ty + (b.ty - a.ty) * r;
    const w = a.w + (b.w - a.w) * r;
    const X = a.x + (b.x - a.x) * r + nxx * w * p.off;
    const Y = a.y + (b.y - a.y) * r + nyy * w * p.off;
    const rx = f.L * p.rx;
    const ry = w * p.ry;
    const n = p.j.length;
    const pts: Pt[] = [];
    for (let k = 0; k < n; k++) {
      const an = (k / n) * 6.283;
      const j = p.j[k];
      const cc = Math.cos(an) * rx * j;
      const ss = Math.sin(an) * ry * j;
      pts.push({ x: X + tx * cc + nxx * ss, y: Y + ty * cc + nyy * ss });
    }
    const g = cx.createRadialGradient(X, Y, 0, X, Y, Math.max(rx, ry));
    g.addColorStop(0, p.c1);
    g.addColorStop(1, p.c2);
    cx.globalAlpha = p.a;
    cx.fillStyle = g;
    smooth(cx, pts);
    cx.fill();
  }
  cx.globalAlpha = 1;

  // staggered scales
  cx.beginPath();
  for (let i = 2; i < N - 2.5; i += 0.5) {
    const u0 = Math.floor(i);
    const r0 = i - u0;
    const A = P[u0];
    const Bq = P[Math.min(u0 + 1, N - 1)];
    const q = {
      x: A.x + (Bq.x - A.x) * r0, y: A.y + (Bq.y - A.y) * r0,
      nx: A.nx + (Bq.nx - A.nx) * r0, ny: A.ny + (Bq.ny - A.ny) * r0,
      tx: A.tx + (Bq.tx - A.tx) * r0, ty: A.ty + (Bq.ty - A.ty) * r0,
      w: A.w + (Bq.w - A.w) * r0,
    };
    const ang = Math.atan2(q.ty, q.tx);
    const rr = f.seg * 0.4;
    const odd = Math.round(i * 2) & 1;
    const a0 = ang + Math.PI - 1.1;
    const a1 = ang + Math.PI + 1.1;
    for (let l = -2; l <= 2; l++) {
      const cl = (l + (odd ? 0.5 : 0)) * 0.4;
      if (Math.abs(cl) > 0.82) continue;
      const sx = q.x + q.nx * q.w * cl;
      const sy = q.y + q.ny * q.w * cl;
      cx.moveTo(sx + Math.cos(a0) * rr, sy + Math.sin(a0) * rr);
      cx.arc(sx, sy, rr, a0, a1);
    }
  }
  cx.strokeStyle = v.scale;
  cx.lineWidth = 0.8;
  cx.stroke();

  // light rippling through the water moves across the back
  cx.globalCompositeOperation = "lighter";
  for (let cz = 0; cz < 3; cz++) {
    const ci = (N - 1) * (0.5 + 0.5 * Math.sin(t * 0.0006 * (cz + 1) + f.w * (cz + 2) + cz * 2));
    const c0 = P[Math.max(0, Math.min(N - 1, Math.round(ci)))];
    const cr = f.mw * (1.5 + cz * 0.5);
    const cg = cx.createRadialGradient(c0.x, c0.y, 0, c0.x, c0.y, cr);
    cg.addColorStop(0, "rgba(255,255,255,.2)");
    cg.addColorStop(1, "rgba(255,255,255,0)");
    cx.fillStyle = cg;
    cx.fillRect(c0.x - cr, c0.y - cr, cr * 2, cr * 2);
  }
  cx.globalCompositeOperation = "source-over";

  // shaded belly edge, dorsal ridge and soft highlights
  body(cx, P, 0, 0);
  cx.lineWidth = f.mw * 0.55;
  cx.strokeStyle = "rgba(0,0,0,.16)";
  cx.stroke();
  spineStroke(cx, P, 3, N - 5, 0, f.mw * 0.16, "rgba(0,0,0,.14)");
  spineStroke(cx, P, 1, N - 3, 0.38, f.mw * 0.75, `rgba(255,255,255,${v.k === "ogon" ? 0.26 : 0.15})`);
  spineStroke(cx, P, 1, N - 4, 0.55, f.mw * 0.28, `rgba(255,255,255,${v.k === "ogon" ? 0.3 : 0.18})`);
  spineStroke(cx, P, 1, N - 3, -0.6, f.mw * 0.8, "rgba(0,0,0,.2)");
  cx.restore();

  // outline
  body(cx, P, 0, 0);
  cx.strokeStyle = "rgba(0,0,0,.35)";
  cx.lineWidth = 1;
  cx.stroke();

  // gill line
  const g2 = P[2];
  cx.beginPath();
  cx.moveTo(g2.x + g2.nx * g2.w * 0.85, g2.y + g2.ny * g2.w * 0.85);
  cx.quadraticCurveTo(g2.x - g2.tx * f.seg * 0.7, g2.y - g2.ty * f.seg * 0.7, g2.x - g2.nx * g2.w * 0.85, g2.y - g2.ny * g2.w * 0.85);
  cx.strokeStyle = "rgba(0,0,0,.22)";
  cx.lineWidth = 1;
  cx.stroke();

  // whiskers
  const h0 = P[0];
  const sn = { x: h0.x + h0.tx * h0.w * 0.95, y: h0.y + h0.ty * h0.w * 0.95 };
  for (const sd of [-1, 1]) {
    cx.beginPath();
    cx.moveTo(sn.x + h0.nx * sd * h0.w * 0.3, sn.y + h0.ny * sd * h0.w * 0.3);
    cx.quadraticCurveTo(
      sn.x + h0.tx * f.L * 0.04 + h0.nx * sd * f.L * 0.01, sn.y + h0.ty * f.L * 0.04 + h0.ny * sd * f.L * 0.01,
      sn.x + h0.tx * f.L * 0.05 + h0.nx * sd * f.L * 0.035, sn.y + h0.ty * f.L * 0.05 + h0.ny * sd * f.L * 0.035,
    );
    cx.strokeStyle = "rgba(235,225,210,.5)";
    cx.lineWidth = 1;
    cx.stroke();
  }

  // eyes
  const h1 = P[1];
  const er = Math.max(2, f.L * 0.017);
  for (const sd of [-1, 1]) {
    const ex = h1.x + h1.nx * sd * h1.w * 0.78;
    const ey = h1.y + h1.ny * sd * h1.w * 0.78;
    cx.beginPath();
    cx.arc(ex, ey, er, 0, 6.283);
    cx.fillStyle = "#0A0C10";
    cx.fill();
    cx.beginPath();
    cx.arc(ex - er * 0.3, ey - er * 0.3, er * 0.35, 0, 6.283);
    cx.fillStyle = "rgba(255,255,255,.7)";
    cx.fill();
  }
}