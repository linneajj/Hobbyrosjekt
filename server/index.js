import express from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8787;

const WORLD = {
  width: 11,
  height: 8,
  blocked: [
    [3, 2], [3, 3], [3, 4],
    [7, 1], [7, 2], [7, 3],
    [5, 6], [6, 6],
  ],
  pois: [
    { id: "home", x: 0, y: 4, emoji: "🏠", label: "Hjem", type: "safe" },
    { id: "forest", x: 2, y: 1, emoji: "🦋", label: "Drømmeskogen", type: "npc" },
    { id: "temple", x: 5, y: 1, emoji: "🌙", label: "Månetempel", type: "npc" },
    { id: "lake", x: 9, y: 4, emoji: "🌊", label: "Stjernesjø", type: "loot" },
    { id: "mirror", x: 5, y: 7, emoji: "🪞", label: "Speilport", type: "gate" },
  ],
};

const START = { x: 0, y: 4 };

const QUESTS_TEMPLATE = [
  {
    id: "q1",
    title: "Snakk med Sommerfugl-vokteren",
    description: "Finn vokteren i Drømmeskogen og få Måneblomsten.",
    status: "active",
  },
  {
    id: "q2",
    title: "Søk råd hos Måneorakelet",
    description: "Bruk Måneblomsten ved Månetempelet for å få Stjernekompass.",
    status: "locked",
  },
  {
    id: "q3",
    title: "Hent speilskår i Stjernesjøen",
    description: "Med Stjernekompasset finner du skjulte speilskår ved sjøen.",
    status: "locked",
  },
  {
    id: "q4",
    title: "Åpne Speilporten",
    description: "Stå ved Speilporten og bruk runeord + speilskår.",
    status: "locked",
  },
];

const sessions = new Map();

function newState() {
  return {
    world: WORLD,
    player: { ...START },
    quests: QUESTS_TEMPLATE.map((q) => ({ ...q })),
    inventory: [],
    steps: 0,
    completed: false,
    log: ["Eventyret starter ved Hjem 🏠"],
  };
}

function createSession() {
  const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  sessions.set(sessionId, newState());
  return sessionId;
}

function getSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, newState());
  }
  return sessions.get(sessionId);
}

function pushLog(state, msg) {
  state.log = [msg, ...state.log].slice(0, 10);
}

function isBlocked(x, y) {
  return WORLD.blocked.some(([bx, by]) => bx === x && by === y);
}

function poiAt(x, y) {
  return WORLD.pois.find((p) => p.x === x && p.y === y) || null;
}

function hasItem(state, item) {
  return state.inventory.includes(item);
}

function addItem(state, item) {
  if (!hasItem(state, item)) state.inventory.push(item);
}

function activateNext(state, questId) {
  const idx = state.quests.findIndex((q) => q.id === questId);
  if (idx >= 0 && idx + 1 < state.quests.length) {
    if (state.quests[idx + 1].status === "locked") {
      state.quests[idx + 1].status = "active";
    }
  }
}

function completeQuest(state, questId) {
  const quest = state.quests.find((q) => q.id === questId);
  if (!quest) return;
  quest.status = "done";
  activateNext(state, questId);
}

function currentQuest(state) {
  return state.quests.find((q) => q.status === "active") || null;
}

app.post("/api/dream/session", (req, res) => {
  const sessionId = createSession();
  res.json({ sessionId, state: getSession(sessionId) });
});

app.get("/api/dream/state/:sessionId", (req, res) => {
  const state = getSession(req.params.sessionId);
  res.json({ state });
});

app.post("/api/dream/move/:sessionId", (req, res) => {
  const state = getSession(req.params.sessionId);
  const { dir } = req.body || {};
  const next = { ...state.player };

  if (dir === "up") next.y -= 1;
  if (dir === "down") next.y += 1;
  if (dir === "left") next.x -= 1;
  if (dir === "right") next.x += 1;

  next.x = Math.max(0, Math.min(WORLD.width - 1, next.x));
  next.y = Math.max(0, Math.min(WORLD.height - 1, next.y));

  if (isBlocked(next.x, next.y)) {
    const message = "Veien er blokkert av drømmetåke. Finn en annen rute.";
    pushLog(state, message);
    return res.json({ state, message });
  }

  state.player = next;
  state.steps += 1;
  const poi = poiAt(next.x, next.y);
  const message = poi
    ? `Du kom til ${poi.label} ${poi.emoji}.`
    : `Du flyttet til (${next.x}, ${next.y}).`;
  pushLog(state, message);

  res.json({ state, message });
});

app.post("/api/dream/interact/:sessionId", (req, res) => {
  const state = getSession(req.params.sessionId);
  const { runeWord = "", action = "interact" } = req.body || {};
  const quest = currentQuest(state);

  if (!quest) {
    state.completed = true;
    const message = "Alle quests er ferdige. Du har mestret Drømmespeilet!";
    pushLog(state, message);
    return res.json({ state, message });
  }

  const poi = poiAt(state.player.x, state.player.y);
  if (!poi) {
    const message = "Her er det stille i drømmeverdenen. Prøv en spesiell lokasjon.";
    pushLog(state, message);
    return res.json({ state, message });
  }

  let message = "Ingenting skjedde akkurat nå.";

  if (poi.id === "forest") {
    if (quest.id === "q1") {
      addItem(state, "Måneblomst");
      completeQuest(state, "q1");
      message = "Sommerfugl-vokteren gir deg Måneblomst 🌸. Neste: Månetempelet.";
    } else {
      message = "Vokteren hvisker: Følg lyset videre mot tempelet.";
    }
  }

  if (poi.id === "temple") {
    if (quest.id === "q2") {
      if (!hasItem(state, "Måneblomst")) {
        message = "Orakelet venter på Måneblomst før det kan hjelpe deg.";
      } else {
        addItem(state, "Stjernekompass");
        completeQuest(state, "q2");
        message = "Orakelet vekker Stjernekompasset ditt 🧭. Neste: Stjernesjøen.";
      }
    } else {
      message = "Måneorakelet: Stol på intuisjonen din.";
    }
  }

  if (poi.id === "lake") {
    if (quest.id === "q3") {
      if (!hasItem(state, "Stjernekompass")) {
        message = "Vannet er uklart. Du trenger Stjernekompass for å finne skåren.";
      } else {
        addItem(state, "Speilskår");
        completeQuest(state, "q3");
        message = "Du fant en Speilskår i vannet 💎. Speilporten venter.";
      }
    } else {
      message = "Stjernesjøen glitrer rolig.";
    }
  }

  if (poi.id === "mirror") {
    if (quest.id === "q4") {
      const validRune = runeWord.trim().toLowerCase();
      if (!hasItem(state, "Speilskår")) {
        message = "Porten er lukket. Du mangler Speilskår.";
      } else if (action !== "use-rune") {
        message = "Speilporten vibrerer. Prøv handlingen 'bruk runeord'.";
      } else if (validRune.length < 3) {
        message = "Runeordet er for svakt. Skriv minst 3 bokstaver.";
      } else {
        completeQuest(state, "q4");
        state.completed = true;
        message = `Speilporten åpnes med runeordet "${runeWord}"! Eventyret er fullført 🌟`;
      }
    } else {
      message = "Speilporten pulserer med stille lys.";
    }
  }

  pushLog(state, message);
  res.json({ state, message });
});

app.post("/api/dream/reset/:sessionId", (req, res) => {
  const state = newState();
  sessions.set(req.params.sessionId, state);
  res.json({ state });
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Dream backend running on http://localhost:${PORT}`);
});
