document.documentElement.classList.add("js");
document.getElementById("y").textContent = new Date().getFullYear();
// scroll reveal
const io = new IntersectionObserver(
  (e) =>
    e.forEach((x) => {
      if (x.isIntersecting) {
        x.target.classList.add("in");
        io.unobserve(x.target);
      }
    }),
  { threshold: 0.12 },
);
document.querySelectorAll(".rv").forEach((el) => io.observe(el));
// copy email
const cb = document.getElementById("copy");
cb.onclick = () => {
  navigator.clipboard.writeText("ekananaikot@gmail.com").then(() => {
    cb.textContent = "Copied ✓";
    setTimeout(() => (cb.textContent = "Copy email"), 1800);
  });
};
// 3D wireframe
const c = document.getElementById("cube"),
  x = c.getContext("2d");
const V = [],
  E = [];
[1, 0.55].forEach((s, k) => {
  for (let i = 0; i < 8; i++)
    V.push([i & 1 ? s : -s, i & 2 ? s : -s, i & 4 ? s : -s]);
  [
    [0, 1],
    [2, 3],
    [4, 5],
    [6, 7],
    [0, 2],
    [1, 3],
    [4, 6],
    [5, 7],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ].forEach(([a, b]) => E.push([a + k * 8, b + k * 8, k]));
});
for (let i = 0; i < 8; i++) E.push([i, i + 8, 2]);
let mx = 0,
  my = 0,
  t = 0;
addEventListener("pointermove", (e) => {
  mx = e.clientX / innerWidth - 0.5;
  my = e.clientY / innerHeight - 0.5;
});
const still = matchMedia("(prefers-reduced-motion:reduce)").matches;
function draw() {
  const d = devicePixelRatio || 1,
    w = c.clientWidth,
    h = c.clientHeight;
  if (c.width !== w * d) {
    c.width = w * d;
    c.height = h * d;
  }
  x.setTransform(d, 0, 0, d, 0, 0);
  x.clearRect(0, 0, w, h);
  const ay = -(t + mx * 2),
    ax = 0.6 + my * 1.2,
    s = w * 0.2,
    col = getComputedStyle(document.documentElement)
      .getPropertyValue("--ac")
      .trim();
  const P = V.map(([a, b, e]) => {
    let X = a * Math.cos(ay) + e * Math.sin(ay),
      Z = -a * Math.sin(ay) + e * Math.cos(ay),
      Y = b * Math.cos(ax) - Z * Math.sin(ax);
    Z = b * Math.sin(ax) + Z * Math.cos(ax);
    const f = 3 / (3 + Z);
    return [w / 2 + X * s * f * 1.5, h / 2 + Y * s * f * 1.5];
  });
  E.forEach(([a, b, k]) => {
    x.beginPath();
    x.moveTo(...P[a]);
    x.lineTo(...P[b]);
    x.strokeStyle =
      k == 1 ? col : k == 2 ? "rgba(141,149,163,.35)" : "rgba(236,238,242,.8)";
    x.lineWidth = k == 1 ? 2 : 1.2;
    x.stroke();
  });
  P.forEach(([a, b], i) => {
    x.fillStyle = i < 8 ? "#eceef2" : col;
    x.beginPath();
    x.arc(a, b, i < 8 ? 3 : 2, 0, 7);
    x.fill();
  });
  if (!still) t += 0.006;
  requestAnimationFrame(draw);
}
draw();

// skill tree (edit levels 0-5 and states: on | learn | lock)
const T = [
  [
    "Web",
    [
      ["HTML5", "H5", 4, "on", "Semantic, accessible markup."],
      ["CSS", "CS", 4, "on", "Responsive layouts with Flexbox and Grid."],
      ["JavaScript", "JS", 3, "on", "Interactive front ends and app logic."],
      ["Node.js & Express", "Nd", 3, "on", "APIs and backend foundations."],
      ["Git & GitHub", "Gt", 3, "on", "Version control and collaboration."],
    ],
  ],
  [
    "3D Art",
    [
      ["Blender", "Bl", 3, "on", "Modelling, materials and renders."],
      [
        "Low-poly modelling",
        "LP",
        3,
        "on",
        "Clean, game-ready stylised assets.",
      ],
      ["Product viz", "PV", 2, "on", "Clean product renders."],
      ["Environment design", "EN", 2, "on", "Scenes and props with mood."],
      ["SolidWorks", "SW", 2, "on", "CAD from my engineering degree."],
    ],
  ],
  [
    "Games",
    [
      [
        "Prototyping",
        "PR",
        3,
        "on",
        "Turning ideas into playable builds fast.",
      ],
      ["Gameplay systems", "GS", 2, "on", "Movement, combat and rule logic."],
      ["Asset pipeline", "AP", 3, "on", "Exporting FBX/GLB for game engines."],
      ["Game engine", "GE", 1, "learn", "Learning my main engine."],
      ["Multiplayer", "MP", 0, "lock", "On the roadmap."],
    ],
  ],
  [
    "Robotics",
    [
      [
        "Robot programming",
        "PY",
        2,
        "learn",
        "Programming for robots, via Aurora AEP.",
      ],
      ["Mobile robotics", "MR", 1, "learn", "Navigation and sensing basics."],
      ["Robotic arms", "RA", 1, "learn", "Kinematics and arm control basics."],
      ["AI for robotics", "AI", 1, "learn", "Intro to AI for robots."],
      ["ROS", "RS", 0, "lock", "On the roadmap."],
    ],
  ],
];
const LV = ["Locked", "Novice", "Apprentice", "Skilled", "Advanced", "Master"],
  tree = document.getElementById("tree"),
  qb = document.getElementById("quest");
let un = 0,
  tt = 0;
tree.innerHTML = T.map(
  ([b, k]) =>
    `<div class="branch rv"><h3>${b}</h3>${k
      .map(([a, ab, l, st, d]) => {
        tt++;
        if (st == "on") un++;
        return `<button class="node ${st}" data-b="${b}" data-a="${a}" data-l="${l}" data-s="${st}" data-d="${d}"><span class="hex">${ab}</span><span><b>${a}</b><span class="pips">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= l ? "f" : ""}"></i>`).join("")}</span></span></button>`;
      })
      .join("")}</div>`,
).join("");
tree.querySelectorAll(".rv").forEach((el) => io.observe(el));
function show(el) {
  tree.querySelectorAll(".sel").forEach((x) => x.classList.remove("sel"));
  el.classList.add("sel");
  const { b, a, l, s, d } = el.dataset;
  qb.innerHTML = `<span class="mono">QUEST LOG · ${b}</span><h4>${a}</h4><p class="mono">${s == "learn" ? "IN TRAINING · " : s == "lock" ? "LOCKED · " : ""}LV ${l}/5 · ${LV[l]}</p><p style="margin-top:8px">${d}</p>`;
}
tree.addEventListener("click", (e) => {
  const n = e.target.closest(".node");
  if (n) show(n);
});
show(tree.querySelector(".node"));
document.getElementById("xp").textContent =
  `${un}/${tt} skills unlocked · more loading…`;
// education: mission progress cells + rover
document.querySelectorAll(".wp[data-start]").forEach((w) => {
  const a = new Date(w.dataset.start),
    e = new Date(w.dataset.end),
    p = Math.max(0, Math.min(1, (Date.now() - a) / (e - a))),
    f = Math.round(p * 10);
  w.querySelector(".cells").innerHTML =
    Array.from(
      { length: 10 },
      (_, i) => `<i class="${i < f ? "f" : ""}"></i>`,
    ).join("") + `<span>${Math.round(p * 100)}% of mission</span>`;
  w.querySelector(".st").textContent = p >= 1 ? "COMPLETE" : "IN PROGRESS";
});
const path = document.getElementById("path"),
  rover = document.getElementById("rover"),
  wps = [...path.querySelectorAll(".wp")];
function move() {
  const r = path.getBoundingClientRect(),
    p = Math.max(0, Math.min(1, (innerHeight * 0.6 - r.top) / r.height));
  rover.style.top = p * (r.height - 30) + "px";
  wps.forEach((w) =>
    w.classList.toggle("pass", w.offsetTop <= p * r.height + 20),
  );
}
addEventListener("scroll", move, { passive: true });
move();
