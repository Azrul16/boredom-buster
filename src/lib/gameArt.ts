import type { GamePalette, Surface } from "./personalization";
type Point = { x: number; y: number };
function rounded(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

export function drawGarden(
  ctx: CanvasRenderingContext2D,
  body: Point[],
  food: Point,
  dir: number,
  palette?: GamePalette,
  surface: Surface = "classic",
) {
  const ground =
    surface === "midnight"
      ? ["#172a31", "#1b3038"]
      : surface === "arcade"
        ? ["#27233c", "#2d2845"]
        : ["#a5cf64", "#aed66c"];
  ctx.fillStyle = ground[0];
  ctx.fillRect(0, 0, 440, 440);
  for (let y = 0; y < 20; y++)
    for (let x = 0; x < 20; x++) {
      ctx.fillStyle = ground[(x + y) % 2];
      ctx.fillRect(x * 22, y * 22, 22, 22);
    }
  ctx.save();
  ctx.shadowColor = "#38632644";
  ctx.shadowBlur = 5;
  ctx.shadowOffsetY = 3;
  const x = food.x * 22 + 11,
    y = food.y * 22 + 11;
  ctx.fillStyle = "#e94e58";
  ctx.beginPath();
  ctx.ellipse(x, y + 1, 8, 9, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff8584";
  ctx.beginPath();
  ctx.ellipse(x - 2, y - 2, 2, 3, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#65482b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - 7);
  ctx.lineTo(x + 2, y - 12);
  ctx.stroke();
  ctx.fillStyle = "#34774a";
  ctx.beginPath();
  ctx.ellipse(x + 5, y - 9, 4, 2, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 18;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = palette?.dark ?? "#3669c7";
  ctx.beginPath();
  body.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x * 22 + 11, p.y * 22 + 11);
    else ctx.lineTo(p.x * 22 + 11, p.y * 22 + 11);
  });
  ctx.stroke();
  body.forEach((p, i) => {
    ctx.fillStyle = palette
      ? i === 0
        ? palette.light
        : i % 2
          ? palette.base
          : palette.dark
      : i === 0
        ? "#558bea"
        : i % 2
          ? "#467bdc"
          : "#4073d4";
    ctx.beginPath();
    ctx.arc(p.x * 22 + 11, p.y * 22 + 11, i === 0 ? 10 : 8, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowColor = "transparent";
  const head = body[0];
  ctx.translate(head.x * 22 + 11, head.y * 22 + 11);
  ctx.rotate([-0.5 * Math.PI, 0, 0.5 * Math.PI, Math.PI][dir]);
  for (const ey of [-5, 5]) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(5, ey, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#192b53";
    ctx.beginPath();
    ctx.arc(6.5, ey, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawFlight(
  ctx: CanvasRenderingContext2D,
  s: {
    y: number;
    vy: number;
    time: number;
    score: number;
    gates: { x: number; center: number; gap: number }[];
  },
  palette?: GamePalette,
  surface: Surface = "classic",
) {
  const W = 480,
    H = 500;
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(
    0,
    surface === "midnight"
      ? "#15243c"
      : surface === "arcade"
        ? "#35204b"
        : "#80cfe5",
  );
  sky.addColorStop(
    1,
    surface === "midnight"
      ? "#405b73"
      : surface === "arcade"
        ? "#d78f98"
        : "#e2f3dd",
  );
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#fff7c2";
  ctx.beginPath();
  ctx.arc(375, 78, 34, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 5; i++) {
    const x = ((((i * 147 - s.time * 17) % 650) + 650) % 650) - 80,
      y = 55 + ((i * 57) % 170);
    ctx.fillStyle = "#ffffffb0";
    ctx.beginPath();
    ctx.ellipse(x, y, 34, 12, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 18, y - 8, 24, 16, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 42, y, 31, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let layer = 0; layer < 2; layer++) {
    ctx.fillStyle = layer ? "#78b89c" : "#a1cfb7";
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 8)
      ctx.lineTo(
        x,
        390 + layer * 40 + Math.sin((x + s.time * (layer ? 17 : 8)) / 95) * 25,
      );
    ctx.lineTo(W, H);
    ctx.fill();
  }
  for (const gate of s.gates) {
    const top = gate.center - gate.gap / 2,
      bottom = gate.center + gate.gap / 2;
    const gradient = ctx.createLinearGradient(gate.x, 0, gate.x + 46, 0);
    gradient.addColorStop(0, "#33775b");
    gradient.addColorStop(0.4, "#60a77a");
    gradient.addColorStop(1, "#28654f");
    ctx.fillStyle = gradient;
    ctx.fillRect(gate.x, 0, 46, top);
    ctx.fillRect(gate.x, bottom, 46, H - bottom);
    rounded(ctx, gate.x - 4, top - 16, 54, 16, 5, "#305c48");
    rounded(ctx, gate.x - 4, bottom, 54, 16, 5, "#305c48");
    rounded(ctx, gate.x - 4, top - 16, 54, 5, 2, "#a2d177");
    rounded(ctx, gate.x - 4, bottom, 54, 5, 2, "#a2d177");
    ctx.strokeStyle = "#ffffff13";
    ctx.lineWidth = 2;
    for (let y = 20; y < top - 16; y += 30) {
      ctx.beginPath();
      ctx.moveTo(gate.x, y);
      ctx.lineTo(gate.x + 46, y);
      ctx.stroke();
    }
    ctx.fillStyle = "#f7cd65";
    ctx.beginPath();
    ctx.arc(gate.x + 23, gate.center, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff1b3";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(105, s.y);
  ctx.rotate(Math.max(-0.35, Math.min(0.8, s.vy / 750)));
  ctx.shadowColor = "#416f6555";
  ctx.shadowBlur = 7;
  ctx.shadowOffsetY = 4;
  rounded(ctx, -16, -14, 32, 28, 10, palette?.base ?? "#edaa47");
  ctx.shadowColor = "transparent";
  rounded(ctx, -10, -11, 25, 18, 7, palette?.light ?? "#ffd578");
  ctx.fillStyle = palette?.dark ?? "#d28636";
  ctx.beginPath();
  ctx.ellipse(-11, 4, 12, 6, Math.sin(s.time * 24) * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f7f8ee";
  ctx.beginPath();
  ctx.arc(9, -6, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#27364c";
  ctx.beginPath();
  ctx.arc(11, -6, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ec7652";
  ctx.beginPath();
  ctx.moveTo(16, -1);
  ctx.lineTo(25, 3);
  ctx.lineTo(16, 7);
  ctx.fill();
  ctx.restore();
  ctx.textAlign = "center";
  ctx.font = "bold 42px Arial";
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#315b6760";
  ctx.strokeText(String(s.score), W / 2, 58);
  ctx.fillStyle = "white";
  ctx.fillText(String(s.score), W / 2, 58);
  ctx.textAlign = "left";
}

export function drawPong(
  ctx: CanvasRenderingContext2D,
  s: {
    x: number;
    y: number;
    player: number;
    cpu: number;
    score: number[];
    trail: Point[];
  },
  palette?: GamePalette,
  surface: Surface = "classic",
) {
  const W = 680,
    H = 420;
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(
    0,
    surface === "arcade"
      ? "#35204b"
      : surface === "midnight"
        ? "#12272b"
        : "#18284b",
  );
  bg.addColorStop(
    1,
    surface === "arcade"
      ? "#18142e"
      : surface === "midnight"
        ? "#09171e"
        : "#0c142c",
  );
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#91a3d21c";
  ctx.lineWidth = 1;
  ctx.strokeRect(12, 12, W - 24, H - 24);
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 65, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([6, 12]);
  ctx.beginPath();
  ctx.moveTo(W / 2, 12);
  ctx.lineTo(W / 2, H - 12);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = "bold 104px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "#b69cff20";
  ctx.fillText(String(s.score[0]), W * 0.34, 130);
  ctx.fillStyle = "#ff9e9520";
  ctx.fillText(String(s.score[1]), W * 0.66, 130);
  ctx.textAlign = "left";
  ctx.shadowBlur = 18;
  ctx.shadowColor = palette ? palette.base + "88" : "#a985ff88";
  rounded(ctx, 20, s.player - 40, 12, 80, 6, palette?.base ?? "#baa3ff");
  ctx.shadowColor = "#ff8b8588";
  rounded(ctx, W - 32, s.cpu - 40, 12, 80, 6, "#ff9e95");
  ctx.shadowColor = "transparent";
  s.trail.forEach((p, i) => {
    ctx.fillStyle = `rgba(151,202,255,${(i / s.trail.length) * 0.25})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3 + (i / s.trail.length) * 4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowColor = "#c1e6ff";
  ctx.shadowBlur = 16;
  ctx.fillStyle = "#f4fcff";
  ctx.beginPath();
  ctx.arc(s.x, s.y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = "transparent";
}

export function drawRace(
  ctx: CanvasRenderingContext2D,
  s: { progress: number; signal: string; time: number; held: boolean },
  portrait = false,
  palette?: GamePalette,
) {
  if (portrait) {
    drawPortraitRace(ctx, s, palette);
    return;
  }
  ctx.fillStyle = "#81b790";
  ctx.fillRect(0, 0, 680, 380);
  for (let i = 0; i < 20; i++) {
    const x = (i * 173) % 680,
      y = i % 2 ? 335 : 40;
    ctx.fillStyle = i % 2 ? "#689d78" : "#6ba77b";
    ctx.beginPath();
    ctx.arc(x, y, 14 + (i % 3) * 4, 0, Math.PI * 2);
    ctx.fill();
  }
  rounded(ctx, 28, 118, 624, 176, 22, "#d7c8ad");
  rounded(ctx, 34, 124, 612, 164, 18, "#456978");
  ctx.strokeStyle = "#c4e0dd66";
  ctx.lineWidth = 2;
  ctx.setLineDash([12, 12]);
  for (const y of [155, 211, 267]) {
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(640, y);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  for (let row = 0; row < 8; row++)
    for (let col = 0; col < 2; col++) {
      ctx.fillStyle = (row + col) % 2 ? "#f4f0df" : "#203c4a";
      ctx.fillRect(609 + col * 10, 130 + row * 19, 10, 19);
    }
  ctx.fillStyle = "#e7eee4";
  ctx.font = "bold 10px Arial";
  ctx.fillText("FINISH", 597, 311);
  ctx.fillText("START", 43, 311);
  rounded(ctx, 258, 20, 164, 70, 22, "#284b51");
  rounded(ctx, 265, 26, 150, 56, 18, "#15333c");
  ["red", "amber", "green"].forEach((c, i) => {
    ctx.fillStyle =
      c === s.signal
        ? c === "red"
          ? "#ff7776"
          : c === "amber"
            ? "#ffda7c"
            : "#83f3aa"
        : "#31515a";
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = c === s.signal ? 16 : 0;
    ctx.beginPath();
    ctx.arc(292 + i * 48, 54, 16, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
  const x = 65 + s.progress * 5.5,
    stride = s.held && s.signal !== "red" ? Math.sin(s.time * 22) * 7 : 0;
  ctx.fillStyle = "#223b4b33";
  ctx.beginPath();
  ctx.ellipse(x, 239, 20, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = palette?.dark ?? "#4e3e87";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - 5, 221);
  ctx.lineTo(x - 8 - stride, 237);
  ctx.moveTo(x + 5, 221);
  ctx.lineTo(x + 8 + stride, 237);
  ctx.stroke();
  rounded(ctx, x - 13, 190, 26, 34, 8, palette?.base ?? "#9471e8");
  ctx.strokeStyle = palette?.light ?? "#c9adff";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x - 13, 197);
  ctx.lineTo(x - 20, 210 + stride);
  ctx.moveTo(x + 13, 197);
  ctx.lineTo(x + 20, 210 - stride);
  ctx.stroke();
  ctx.fillStyle = "#ffd9b3";
  ctx.beginPath();
  ctx.arc(x, 181, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#463c63";
  ctx.beginPath();
  ctx.arc(x, 177, 13, Math.PI, Math.PI * 2);
  ctx.fill();
  rounded(ctx, 185, 343, 310, 6, 3, "#4c7e64");
  rounded(ctx, 185, 343, Math.max(6, s.progress * 3.1), 6, 3, "#ecf7c0");
}
function drawPortraitRace(
  ctx: CanvasRenderingContext2D,
  s: { progress: number; signal: string; time: number; held: boolean },
  palette?: GamePalette,
) {
  ctx.fillStyle = "#81b790";
  ctx.fillRect(0, 0, 380, 520);
  for (let i = 0; i < 14; i++) {
    const x = i % 2 ? 345 : 30,
      y = 110 + ((i * 57) % 390);
    ctx.fillStyle = i % 3 ? "#679e76" : "#73a981";
    ctx.beginPath();
    ctx.arc(x, y, 14 + (i % 3) * 5, 0, Math.PI * 2);
    ctx.fill();
  }
  rounded(ctx, 78, 108, 224, 385, 22, "#d6c6a9");
  rounded(ctx, 85, 115, 210, 371, 17, "#456978");
  ctx.strokeStyle = "#c4e0dd66";
  ctx.lineWidth = 2;
  ctx.setLineDash([12, 12]);
  for (const x of [105, 190, 275]) {
    ctx.beginPath();
    ctx.moveTo(x, 120);
    ctx.lineTo(x, 480);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  for (let col = 0; col < 10; col++)
    for (let row = 0; row < 2; row++) {
      ctx.fillStyle = (col + row) % 2 ? "#f4f0df" : "#203c4a";
      ctx.fillRect(90 + col * 20, 136 + row * 10, 20, 10);
    }
  rounded(ctx, 106, 22, 168, 70, 22, "#254950");
  rounded(ctx, 113, 29, 154, 56, 18, "#15333c");
  ["red", "amber", "green"].forEach((c, i) => {
    ctx.fillStyle =
      c === s.signal
        ? c === "red"
          ? "#ff7776"
          : c === "amber"
            ? "#ffda7c"
            : "#83f3aa"
        : "#31515a";
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = c === s.signal ? 15 : 0;
    ctx.beginPath();
    ctx.arc(142 + i * 48, 57, 16, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
  const x = 190,
    y = 443 - s.progress * 2.65,
    stride = s.held && s.signal !== "red" ? Math.sin(s.time * 22) * 6 : 0;
  ctx.fillStyle = "#223b4b44";
  ctx.beginPath();
  ctx.ellipse(x, y + 23, 22, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = palette?.dark ?? "#4e3e87";
  ctx.lineCap = "round";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(x - 7, y + 6);
  ctx.lineTo(x - 9 - stride, y + 24);
  ctx.moveTo(x + 7, y + 6);
  ctx.lineTo(x + 9 + stride, y + 24);
  ctx.stroke();
  rounded(ctx, x - 16, y - 20, 32, 34, 9, palette?.base ?? "#9471e8");
  ctx.strokeStyle = palette?.light ?? "#c9adff";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x - 15, y - 14);
  ctx.lineTo(x - 25, y + stride);
  ctx.moveTo(x + 15, y - 14);
  ctx.lineTo(x + 25, y - stride);
  ctx.stroke();
  ctx.fillStyle = "#ffd9b3";
  ctx.beginPath();
  ctx.arc(x, y - 29, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#463c63";
  ctx.beginPath();
  ctx.arc(x, y - 33, 15, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e6f2dd";
  ctx.font = "bold 10px Arial";
  ctx.textAlign = "center";
  ctx.fillText("FINISH", 190, 127);
  ctx.fillText("START", 190, 478);
  ctx.textAlign = "left";
}
