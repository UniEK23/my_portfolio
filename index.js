"use strict";

const EMAIL = "ekananaikot@gmail.com";

/* Scroll reveal. Content remains visible when IntersectionObserver is unavailable. */
const revealElements = [...document.querySelectorAll(".rv")];
let revealObserver = null;

if ("IntersectionObserver" in window) {
  revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );
  document.documentElement.classList.add("js");
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("in"));
}

function observeReveals(root) {
  if (!root) return;
  root.querySelectorAll(".rv").forEach((element) => {
    if (revealObserver) revealObserver.observe(element);
    else element.classList.add("in");
  });
}

/* Footer year */
const yearElement = document.getElementById("year");
if (yearElement) yearElement.textContent = String(new Date().getFullYear());

/* Accessible mobile navigation */
const navToggle = document.getElementById("nav-toggle");
const nav = document.getElementById("primary-nav");

function setNavOpen(open) {
  if (!navToggle || !nav) return;
  nav.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
}

navToggle?.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  setNavOpen(!isOpen);
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setNavOpen(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setNavOpen(false);
});

/* Copy email with graceful failure handling */
const copyButton = document.getElementById("copy-email");
const copyStatus = document.getElementById("copy-status");
let copyTimer = null;

copyButton?.addEventListener("click", async () => {
  const originalLabel = "Copy email";
  try {
    if (!navigator.clipboard?.writeText)
      throw new Error("Clipboard API unavailable");
    await navigator.clipboard.writeText(EMAIL);
    copyButton.textContent = "Copied ✓";
    if (copyStatus)
      copyStatus.textContent = "Email address copied to clipboard.";
  } catch {
    if (copyStatus)
      copyStatus.textContent = `Copy unavailable. Email: ${EMAIL}`;
    copyButton.textContent = "See email below";
  }

  window.clearTimeout(copyTimer);
  copyTimer = window.setTimeout(() => {
    copyButton.textContent = originalLabel;
    if (copyStatus) copyStatus.textContent = "";
  }, 2200);
});

/* Hero wireframe: time-based rotation, resize handling and page-restore support. */
const canvas = document.getElementById("cube");
const context = canvas?.getContext("2d");
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let reduceMotion = motionQuery.matches;

if (canvas && context) {
  const vertices = [];
  const edges = [];
  const cubeEdges = [
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
  ];

  [1, 0.55].forEach((size, layer) => {
    for (let i = 0; i < 8; i += 1) {
      vertices.push([
        i & 1 ? size : -size,
        i & 2 ? size : -size,
        i & 4 ? size : -size,
      ]);
    }
    cubeEdges.forEach(([a, b]) =>
      edges.push([a + layer * 8, b + layer * 8, layer]),
    );
  });
  for (let i = 0; i < 8; i += 1) edges.push([i, i + 8, 2]);

  let pointerX = 0;
  let pointerY = 0;
  let angle = 0;
  let frameId = 0;
  let previousTime = 0;

  if (window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener(
      "pointermove",
      (event) => {
        pointerX = event.clientX / Math.max(window.innerWidth, 1) - 0.5;
        pointerY = event.clientY / Math.max(window.innerHeight, 1) - 0.5;
      },
      { passive: true },
    );
  }

  function drawWireframe() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(width * pixelRatio);
    const pixelHeight = Math.round(height * pixelRatio);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);

    const rotateY = -(angle + pointerX * 2);
    const rotateX = 0.6 + pointerY * 1.2;
    const scale = width * 0.2;
    const accent =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim() || "#ff6b1a";

    const projected = vertices.map(([vx, vy, vz]) => {
      const rotatedX = vx * Math.cos(rotateY) + vz * Math.sin(rotateY);
      let rotatedZ = -vx * Math.sin(rotateY) + vz * Math.cos(rotateY);
      const rotatedY = vy * Math.cos(rotateX) - rotatedZ * Math.sin(rotateX);
      rotatedZ = vy * Math.sin(rotateX) + rotatedZ * Math.cos(rotateX);
      const perspective = 3 / (3 + rotatedZ);
      return [
        width / 2 + rotatedX * scale * perspective * 1.5,
        height / 2 + rotatedY * scale * perspective * 1.5,
      ];
    });

    edges.forEach(([start, end, layer]) => {
      context.beginPath();
      context.moveTo(...projected[start]);
      context.lineTo(...projected[end]);
      context.strokeStyle =
        layer === 1
          ? accent
          : layer === 2
            ? "rgba(141,149,163,.35)"
            : "rgba(236,238,242,.8)";
      context.lineWidth = layer === 1 ? 2 : 1.2;
      context.stroke();
    });

    projected.forEach(([x, y], index) => {
      context.fillStyle = index < 8 ? "#eceef2" : accent;
      context.beginPath();
      context.arc(x, y, index < 8 ? 3 : 2, 0, Math.PI * 2);
      context.fill();
    });
  }

  function animateWireframe(timestamp) {
    frameId = 0;
    if (document.hidden || reduceMotion) {
      drawWireframe();
      previousTime = 0;
      return;
    }

    const elapsed = previousTime
      ? Math.min(timestamp - previousTime, 50)
      : 16.67;
    previousTime = timestamp;
    angle += elapsed * 0.00036;
    drawWireframe();
    frameId = window.requestAnimationFrame(animateWireframe);
  }

  function startWireframe() {
    if (frameId) window.cancelAnimationFrame(frameId);
    frameId = 0;
    previousTime = 0;
    drawWireframe();
    if (!reduceMotion && !document.hidden) {
      frameId = window.requestAnimationFrame(animateWireframe);
    }
  }

  if ("ResizeObserver" in window) {
    new ResizeObserver(drawWireframe).observe(canvas);
  } else {
    window.addEventListener("resize", drawWireframe, { passive: true });
  }

  motionQuery.addEventListener?.("change", (event) => {
    reduceMotion = event.matches;
    startWireframe();
  });
  document.addEventListener("visibilitychange", startWireframe);
  window.addEventListener("pageshow", startWireframe);
  window.addEventListener("pagehide", () => {
    if (frameId) window.cancelAnimationFrame(frameId);
    frameId = 0;
  });

  startWireframe();
}

/* Skills tree */
const skillBranches = [
  [
    "Web",
    [
      ["HTML5", "H5", 4, "on", "Semantic, accessible markup."],
      ["CSS", "CS", 4, "on", "Responsive layouts with Flexbox and Grid."],
      [
        "JavaScript",
        "JS",
        3,
        "on",
        "Interactive front ends and application logic.",
      ],
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
      ["Product visualization", "PV", 2, "on", "Clean product renders."],
      ["Environment design", "EN", 2, "on", "Scenes and props with mood."],
      ["SolidWorks", "SW", 2, "on", "CAD skills used in mechanical design."],
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
        "Turning ideas into playable builds quickly.",
      ],
      ["Gameplay systems", "GS", 2, "on", "Movement, combat and rule logic."],
      [
        "Asset pipeline",
        "AP",
        3,
        "on",
        "Exporting FBX/GLB assets for game engines.",
      ],
      ["Game engine", "GE", 1, "learn", "Learning a main game engine."],
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
        "Programming for robots through Aurora AEP.",
      ],
      [
        "Mobile robotics",
        "MR",
        1,
        "learn",
        "Navigation and sensing fundamentals.",
      ],
      [
        "Robotic arms",
        "RA",
        1,
        "learn",
        "Kinematics and arm-control fundamentals.",
      ],
      ["AI for robotics", "AI", 1, "learn", "Introduction to AI for robots."],
      ["ROS 2", "RS", 0, "lock", "On the roadmap."],
    ],
  ],
];

const levelNames = [
  "Locked",
  "Novice",
  "Apprentice",
  "Skilled",
  "Advanced",
  "Master",
];
const tree = document.getElementById("tree");
const quest = document.getElementById("quest");
const xp = document.getElementById("xp");
let unlockedSkills = 0;
let totalSkills = 0;

if (tree && quest && xp) {
  tree.innerHTML = skillBranches
    .map(([branchName, skills]) => {
      const nodes = skills
        .map(([name, abbreviation, level, state, description]) => {
          totalSkills += 1;
          if (state === "on") unlockedSkills += 1;
          const pips = Array.from(
            { length: 5 },
            (_, index) =>
              `<i class="${index < level ? "f" : ""}" aria-hidden="true"></i>`,
          ).join("");
          return `
        <button class="node ${state}" type="button" data-branch="${branchName}" data-name="${name}" data-level="${level}" data-state="${state}" data-description="${description}" aria-pressed="false">
          <span class="hex" aria-hidden="true">${abbreviation}</span>
          <span><b>${name}</b><span class="pips" aria-label="Level ${level} out of 5">${pips}</span></span>
        </button>`;
        })
        .join("");
      return `<div class="branch rv"><h3>${branchName}</h3>${nodes}</div>`;
    })
    .join("");

  observeReveals(tree);

  function showSkill(button) {
    if (!button) return;
    tree.querySelectorAll(".node").forEach((node) => {
      const selected = node === button;
      node.classList.toggle("sel", selected);
      node.setAttribute("aria-pressed", String(selected));
    });

    const { branch, name, level, state, description } = button.dataset;
    const stateLabel =
      state === "learn"
        ? "IN TRAINING · "
        : state === "lock"
          ? "LOCKED · "
          : "";
    quest.innerHTML = `
      <span class="mono">QUEST LOG · ${branch}</span>
      <h4>${name}</h4>
      <p class="mono">${stateLabel}LV ${level}/5 · ${levelNames[Number(level)]}</p>
      <p class="quest-description">${description}</p>`;
  }

  tree.addEventListener("click", (event) => {
    const button = event.target.closest(".node");
    if (button) showSkill(button);
  });

  showSkill(tree.querySelector(".node"));
  xp.textContent = `${unlockedSkills}/${totalSkills} skills unlocked · more loading…`;
}

/* Education progress cells + scrolling rover */
const educationCards = document.querySelectorAll(".wp[data-start][data-end]");

educationCards.forEach((card) => {
  const startDate = new Date(`${card.dataset.start}-01T00:00:00`);
  const endDate = new Date(`${card.dataset.end}-01T00:00:00`);
  const now = new Date();
  const duration = endDate - startDate;
  const progress =
    duration > 0 ? Math.max(0, Math.min(1, (now - startDate) / duration)) : 0;
  const filledCells = Math.round(progress * 10);
  const cells = card.querySelector(".cells");
  const status = card.querySelector(".st");

  if (cells) {
    cells.innerHTML =
      Array.from(
        { length: 10 },
        (_, index) =>
          `<i class="${index < filledCells ? "f" : ""}" aria-hidden="true"></i>`,
      ).join("") + `<span>${Math.round(progress * 100)}% of timeline</span>`;
  }

  if (status) {
    status.textContent =
      now < startDate
        ? "UPCOMING"
        : now >= endDate
          ? "COMPLETE"
          : "IN PROGRESS";
  }
});

const path = document.getElementById("path");
const rover = document.getElementById("rover");
const waypoints = path ? [...path.querySelectorAll(".wp")] : [];

function moveRover() {
  if (!path || !rover) return;
  const bounds = path.getBoundingClientRect();
  if (!bounds.height) return;

  const progress = Math.max(
    0,
    Math.min(1, (window.innerHeight * 0.6 - bounds.top) / bounds.height),
  );
  rover.style.top = `${progress * Math.max(0, bounds.height - rover.offsetHeight)}px`;
  waypoints.forEach((waypoint) => {
    waypoint.classList.toggle(
      "pass",
      waypoint.offsetTop <= progress * bounds.height + 20,
    );
  });
}

window.addEventListener("scroll", moveRover, { passive: true });
window.addEventListener("resize", moveRover, { passive: true });
moveRover();

/* Accessible project tabs */
const tabs = [...document.querySelectorAll('[role="tab"][data-target]')];
const panels = [...document.querySelectorAll("[data-content]")];

function activateTab(tab, moveFocus = false) {
  const targetId = tab.dataset.target;
  tabs.forEach((item) => {
    const active = item === tab;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-selected", String(active));
    item.tabIndex = active ? 0 : -1;
  });
  panels.forEach((panel) => {
    panel.hidden = panel.id !== targetId;
  });
  if (moveFocus) tab.focus();
  observeReveals(document.getElementById(targetId));
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateTab(tab));
  tab.addEventListener("keydown", (event) => {
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft")
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;
    else return;
    event.preventDefault();
    activateTab(tabs[nextIndex], true);
  });
});

/* Project thumbnail -> accessible native dialog with project details. */
const projectDetails = {
  "halcyon-court": {
    category: "WEB APP · WEB DEVELOPMENT",

    title: "Halcyon Court",

    description: "A fictional luxury lodging experience built to practise responsive web design and interactive 3D. The project combines a polished booking-style interface with JavaScript and Three.js. Add a little more detail here about the specific challenge you solved and what you learned.",

    problem: "Guests often can't visit an apartment before booking, and photos alone don't show how a space feels.",

    solution: "A browsable 3D experience: a live building scene with a day/night slider, an interactive lounge and bedroom, and a booking form that sends the dates and a live price estimate to WhatsApp.",

    duration: "",

    status: "Live demo",

    image: "assets/images/halcyon-court.png",

    alt: "Halcyon Court website preview",

    tags: ["JavaScript", "Three.js", "HTML5", "CSS", "Responsive design"],

    links: [{ label: "Live site ↗", href: "https://halcyon-court.netlify.app/" }],
  },
  "watch-my-wards": {
    category: "WEB APP · WEB DEVELOPMENT",

    title: "Student Record Management System",

    description: "A responsive student management dashboard connected to a Node and Express REST API, with live statistics, search, course filtering and full create, edit and delete of student records.",

    problem: "A practice project on keeping a responsive interface in sync with a REST API through the full create, read, update and delete cycle.",

    solution: "The dashboard stats always cover all records, even while a search is active. Search works on name, ID and course, and the course filter is built from the real data. Add and edit share one native dialog form, and API values are escaped before rendering. Loading, empty and error states (with a retry button) and toast messages cover the unhappy paths. The layout moves from cards with bottom navigation on mobile to a sidebar and table on desktop.",

    contribution: "Designed and built the whole frontend: layout, styling, state handling and API integration.",
    
    duration: "",

    status: "Working prototype",

    image: "assets/images/watch-my-wards.png",

    alt: "Student Record Management System dashboard",
    
    tags: ["HTML5", "CSS3", "JavaScript (Fetch API)", "Node.js", "Express.js", "Git & GitHub"],

    links: [
      { label: "View on GitHub ↗", href: "https://github.com/UniEK23/watch_my_wards" },
      { label: "Live demo ↗", href: "https://watch-my-wards.netlify.app/" },
    ],
  },
  "heven-survey": {
    category: "WEB · LANDING PAGE",

    title: "HEVEN Survey Landing Page",

    description: "A single-page site that invites people to take a five-minute survey for HEVEN, a natural skincare brand preparing to go national. It is built around the brand's existing look: a high-contrast serif wordmark, a warm off-white palette, olive accents and a calm, unhurried layout.",

    problem: "HEVEN was preparing to go national and wanted honest feedback from real customers first, with a target of at least 100 responses. A bare survey link in a chat gets ignored, so the brand needed a page that builds trust, explains the survey and gets people to start.",

    solution: "A focused, single-purpose page: one headline, one call to action, and clear expectations up front (about 5 minutes, 7 short sections, adults 22+). A seven-step marker echoes the survey's sections. Type and colour follow the brand. Sections reveal gently on scroll, reduced-motion preferences are respected, and the layout adapts to small screens.",

    contribution: "Designed and built the page in HTML, CSS and JavaScript around HEVEN's existing brand.",
    
    duration: "",

    status: "Live",

    image: "assets/images/heven-survey.png",

    alt: "HEVEN survey landing page with the headline 'Your Body. Your First Home.' and a Take the survey button",

    tags: ["HTML5", "CSS3", "JavaScript", "Responsive design", "Accessibility", "Netlify"],

    links: [
      { label: "Live site ↗", href: "https://heven-survey.netlify.app/" },
    ],
  },

  "featured-3d": {
    category: "3D ART · BLENDER",
    title: "Featured 3D piece",
    description:
      "",
    image: "assets/images/3d-artwork.png",
    alt: "Preview of a Blender artwork",
    tags: ["Blender", "Modelling", "Materials", "Rendering"],
    links: [
      {
        label: "View on ArtStation ↗",
        href: "https://www.artstation.com/ekanastra",
      },
    ],
  },

  "featured-game": {
    category: "GAME DEVELOPMENT · PROTOTYPE",
    title: "Featured game prototype",
    description:
      "Replace this text with the core gameplay mechanic, the engine or language used, and what the prototype helped you test or learn.",
    image: "assets/images/gameplay-feature.png",
    alt: "Preview of a game prototype",
    tags: ["Gameplay", "Prototyping", "Interactive systems"],
    links: [],
  },
};

const projectDialog = document.getElementById("project-dialog");
const dialogClose = document.getElementById("dialog-close");
const dialogImage = document.getElementById("dialog-image");
const dialogCategory = document.getElementById("dialog-category");
const dialogTitle = document.getElementById("dialog-title");
const dialogDescription = document.getElementById("dialog-description");
const dialogTags = document.getElementById("dialog-tags");
const dialogLinks = document.getElementById("dialog-links");
const dialogMeta = document.getElementById("dialog-meta");
const dialogDuration = document.getElementById("dialog-duration");
const dialogStatus = document.getElementById("dialog-status");
const textBlocks = {
  problem: ["dialog-problem-block", "dialog-problem"],
  solution: ["dialog-solution-block", "dialog-solution"],
  contribution: ["dialog-role-block", "dialog-role"],
};
let lastProjectTrigger = null;

function openProject(projectId, trigger) {
  const project = projectDetails[projectId];
  if (!project || !projectDialog) return;

  lastProjectTrigger = trigger;
  dialogCategory.textContent = project.category;
  dialogTitle.textContent = project.title;
  dialogDescription.textContent = project.description;
  dialogImage.removeAttribute("src");
  dialogImage.dataset.failed = "false";
  dialogImage.alt = project.alt || project.title;
  dialogImage.src = project.image;
  Object.entries(textBlocks).forEach(([key, [blockId, textId]]) => {
    document.getElementById(blockId).hidden = !project[key];
    document.getElementById(textId).textContent = project[key] || "";
  });
  dialogDuration.textContent = project.duration || "";
  dialogStatus.textContent = project.status || "";
  dialogDuration.parentElement.hidden = !project.duration;
  dialogStatus.parentElement.hidden = !project.status;
  dialogMeta.hidden = !project.duration && !project.status;
  dialogTags.replaceChildren();
  project.tags.forEach((tag) => {
    const badge = document.createElement("span");
    badge.textContent = tag;
    dialogTags.append(badge);
  });

  dialogLinks.replaceChildren();
  (project.links || []).forEach((linkData) => {
    const link = document.createElement("a");
    link.href = linkData.href;
    link.textContent = linkData.label;
    if (/^https?:/i.test(linkData.href)) {
      link.target = "_blank";
      link.rel = "noreferrer";
    }
    dialogLinks.append(link);
  });

  if (typeof projectDialog.showModal === "function") {
    if (!projectDialog.open) projectDialog.showModal();
  } else {
    projectDialog.setAttribute("open", "");
  }
  dialogClose?.focus();
}

document.querySelectorAll(".project-tile[data-project-id]").forEach((tile) => {
  tile.addEventListener("click", () =>
    openProject(tile.dataset.projectId, tile),
  );
});

dialogClose?.addEventListener("click", () => {
  if (projectDialog?.open) projectDialog.close();
  else projectDialog?.removeAttribute("open");
});

projectDialog?.addEventListener("click", (event) => {
  if (event.target === projectDialog) projectDialog.close();
});

projectDialog?.addEventListener("close", () => {
  lastProjectTrigger?.focus();
});

/* Remove broken image elements without leaving broken-image icons behind. */
document.querySelectorAll("img").forEach((imageElement) => {
  imageElement.addEventListener(
    "error",
    () => {
      imageElement.dataset.failed = "true";
      imageElement.removeAttribute("src");
      imageElement.alt = "";
    },
    { once: true },
  );
});

dialogImage?.addEventListener(
  "error",
  () => {
    dialogImage.removeAttribute("src");
    dialogImage.alt = "";
  },
  { once: false },
);
