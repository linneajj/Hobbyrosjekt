import express from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8787;

const WORLD = {
  startAreaId: "meadow",
  areas: {
    meadow: {
      id: "meadow",
      name: "Rosedalen",
      width: 11,
      height: 8,
      blocked: [
        [3, 2], [3, 3], [3, 4],
        [7, 1], [7, 2], [7, 3],
        [5, 6], [6, 6],
      ],
      spawn: { x: 0, y: 4 },
      pois: [
        { id: "home", x: 0, y: 4, emoji: "🏠", label: "Hjem", type: "safe" },
        { id: "forest", x: 2, y: 1, emoji: "🦋", label: "Sommerfugl-vokteren", type: "npc" },
        { id: "mirror", x: 5, y: 7, emoji: "🪞", label: "Speilport", type: "gate" },
        {
          id: "portal-temple",
          x: 10,
          y: 1,
          emoji: "🌀",
          label: "Portal til Måneplatået",
          type: "portal",
          targetAreaId: "moon",
          targetPos: { x: 1, y: 5 },
        },
        {
          id: "portal-lake",
          x: 10,
          y: 6,
          emoji: "🌀",
          label: "Portal til Stjerneviken",
          type: "portal",
          targetAreaId: "lake",
          targetPos: { x: 1, y: 5 },
        },
      ],
    },
    moon: {
      id: "moon",
      name: "Måneplatået",
      width: 9,
      height: 7,
      blocked: [
        [4, 1], [4, 2], [4, 3],
        [2, 5], [3, 5],
      ],
      spawn: { x: 1, y: 5 },
      pois: [
        { id: "temple", x: 6, y: 1, emoji: "🌙", label: "Måneorakelet", type: "npc" },
        {
          id: "portal-back-moon",
          x: 0,
          y: 6,
          emoji: "↩️",
          label: "Tilbake til Rosedalen",
          type: "portal",
          targetAreaId: "meadow",
          targetPos: { x: 9, y: 1 },
        },
      ],
    },
    lake: {
      id: "lake",
      name: "Stjerneviken",
      width: 10,
      height: 7,
      blocked: [
        [5, 0], [5, 1], [5, 2],
        [3, 4], [4, 4],
      ],
      spawn: { x: 1, y: 5 },
      pois: [
        { id: "lake-core", x: 8, y: 2, emoji: "🌊", label: "Stjernesjoen", type: "loot" },
        {
          id: "portal-back-lake",
          x: 0,
          y: 6,
          emoji: "↩️",
          label: "Tilbake til Rosedalen",
          type: "portal",
          targetAreaId: "meadow",
          targetPos: { x: 9, y: 6 },
        },
      ],
    },
  },
};

const QUESTS_TEMPLATE = [
  {
    id: "q1",
    title: "Mote Sommerfugl-vokteren",
    description: "Snakk med vokteren i Rosedalen. Dine valg gir ulike rewards.",
    status: "active",
  },
  {
    id: "q2",
    title: "Sok rad hos Maneorakelet",
    description: "Reis via portal til Maneplataet og bruk Maneblomst ved tempelet.",
    status: "locked",
  },
  {
    id: "q3",
    title: "Finn speilskar i Stjerneviken",
    description: "Bruk Stjernekompass ved Stjernesjoen for a finne Speilskar.",
    status: "locked",
  },
  {
    id: "q4",
    title: "Apne Speilporten",
    description: "Reis tilbake til Rosedalen. Bruk runeord + Speilskar ved Speilporten.",
    status: "locked",
  },
];

const DIALOG_TREES = {
  forest: {
    start: {
      text: "Vokteren ser deg an. Hvordan vil du be om hjelp?",
      choices: [
        {
          id: "brave",
          label: "Jeg er klar for alt. Test meg.",
          effects: { affinity: 2, stardust: 5, item: "Maneblomst", completeQuest: "q1" },
          nextMessage: "Vokteren smiler: mot blir belonnet. Du far Maneblomst.",
        },
        {
          id: "kind",
          label: "Kan du lare meg veien med ro og visdom?",
          effects: { affinity: 1, stardust: 15, item: "Maneblomst", completeQuest: "q1" },
          nextMessage: "Vokteren nikker: mildhet gir stjernestov. Du far Maneblomst.",
        },
      ],
    },
  },
  temple: {
    start: {
      text: "Orakelet horer dine tanker. Hva velger du?",
      choices: [
        {
          id: "focus",
          label: "Jeg fokuserer pa kart og retning.",
          effects: { affinity: 1, stardust: 10, item: "Stjernekompass", completeQuest: "q2" },
          nextMessage: "Orakelet aktiverer kompasset ditt.",
        },
        {
          id: "intuition",
          label: "Jeg folger intuisjonen og hjertet.",
          effects: { affinity: 3, stardust: 2, item: "Stjernekompass", completeQuest: "q2" },
          nextMessage: "Orakelet sier: intuisjon er ogsa navigasjon.",
        },
      ],
    },
  },
};

const sessions = new Map(); // sessionId -> { profileKey, state }
const profiles = new Map(); // profileKey -> { profileId, profileName, slot, state }

function createProfileId() {
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function profileKey(profileId, slot) {
  return `${profileId}:${slot}`;
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getArea(areaId) {
  return WORLD.areas[areaId] || WORLD.areas[WORLD.startAreaId];
}

function newState() {
  const startArea = getArea(WORLD.startAreaId);
  return {
    world: WORLD,
    areaId: startArea.id,
    player: { ...startArea.spawn },
    quests: QUESTS_TEMPLATE.map((q) => ({ ...q })),
    inventory: [],
    rewards: {
      affinity: 0,
      stardust: 0,
    },
    steps: 0,
    completed: false,
    pendingDialog: null,
    log: ["Eventyret starter ved Hjem."],
  };
}

function currentAreaState(state) {
  return getArea(state.areaId);
}

function createSession(profileKeyValue, profileState) {
  const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  sessions.set(sessionId, {
    profileKey: profileKeyValue,
    state: deepClone(profileState),
  });
  return sessionId;
}

function getSession(sessionId) {
  if (!sessions.has(sessionId)) return null;
  return sessions.get(sessionId);
}

function saveSessionToProfile(sessionId) {
  const session = getSession(sessionId);
  if (!session) return;
  const profile = profiles.get(session.profileKey);
  if (!profile) return;
  profile.state = deepClone(session.state);
  profiles.set(session.profileKey, profile);
}

function publicState(state) {
  const area = currentAreaState(state);
  return {
    ...state,
    world: {
      ...state.world,
      currentArea: area,
      availableAreas: Object.values(state.world.areas).map((a) => ({ id: a.id, name: a.name })),
    },
  };
}

function pushLog(state, msg) {
  state.log = [msg, ...state.log].slice(0, 10);
}

function isBlocked(state, x, y) {
  const area = currentAreaState(state);
  return area.blocked.some(([bx, by]) => bx === x && by === y);
}

function poiAt(state, x, y) {
  const area = currentAreaState(state);
  return area.pois.find((p) => p.x === x && p.y === y) || null;
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

function upsertProfile(profileName, slot, profileId) {
  if (profileId) {
    const key = profileKey(profileId, slot);
    if (profiles.has(key)) return profiles.get(key);
  }

  const sanitizedName = (profileName || "Dreamer").slice(0, 32).trim() || "Dreamer";
  const existing = Array.from(profiles.values()).find(
    (p) => p.profileName.toLowerCase() === sanitizedName.toLowerCase() && p.slot === slot
  );
  if (existing) return existing;

  const createdProfileId = profileId || createProfileId();
  const key = profileKey(createdProfileId, slot);
  const profile = {
    profileId: createdProfileId,
    profileName: sanitizedName,
    slot,
    state: newState(),
  };
  profiles.set(key, profile);
  return profile;
}

app.get("/api/dream/profiles", (req, res) => {
  const list = Array.from(profiles.values()).map((p) => ({
    profileId: p.profileId,
    profileName: p.profileName,
    slot: p.slot,
    completed: Boolean(p.state.completed),
    steps: p.state.steps,
    areaId: p.state.areaId,
    stardust: p.state.rewards?.stardust || 0,
    affinity: p.state.rewards?.affinity || 0,
  }));
  res.json({ profiles: list });
});

app.post("/api/dream/profile", (req, res) => {
  const slotRaw = Number(req.body?.slot);
  const slot = Number.isFinite(slotRaw) && slotRaw >= 1 && slotRaw <= 3 ? slotRaw : 1;
  const profileName = req.body?.profileName;
  const profileId = req.body?.profileId;

  const profile = upsertProfile(profileName, slot, profileId);
  const key = profileKey(profile.profileId, profile.slot);
  const sessionId = createSession(key, profile.state);
  const session = getSession(sessionId);

  res.json({
    sessionId,
    profileId: profile.profileId,
    profileName: profile.profileName,
    slot: profile.slot,
    state: publicState(session.state),
  });
});

app.post("/api/dream/profile/save/:sessionId", (req, res) => {
  const session = getSession(req.params.sessionId);
  if (!session) return res.status(404).json({ error: "session_not_found" });
  saveSessionToProfile(req.params.sessionId);
  return res.json({ ok: true });
});

app.post("/api/dream/session", (req, res) => {
  const profile = upsertProfile(req.body?.profileName || "Dreamer", 1, req.body?.profileId);
  const key = profileKey(profile.profileId, profile.slot);
  const sessionId = createSession(key, profile.state);
  const session = getSession(sessionId);
  res.json({ sessionId, state: publicState(session.state), profileId: profile.profileId });
});

app.get("/api/dream/state/:sessionId", (req, res) => {
  const session = getSession(req.params.sessionId);
  if (!session) return res.status(404).json({ error: "session_not_found" });
  res.json({ state: publicState(session.state) });
});

app.post("/api/dream/move/:sessionId", (req, res) => {
  const session = getSession(req.params.sessionId);
  if (!session) return res.status(404).json({ error: "session_not_found" });
  const state = session.state;
  const { dir } = req.body || {};
  const next = { ...state.player };
  const area = currentAreaState(state);

  if (dir === "up") next.y -= 1;
  if (dir === "down") next.y += 1;
  if (dir === "left") next.x -= 1;
  if (dir === "right") next.x += 1;

  next.x = Math.max(0, Math.min(area.width - 1, next.x));
  next.y = Math.max(0, Math.min(area.height - 1, next.y));

  if (isBlocked(state, next.x, next.y)) {
    const message = "Veien er blokkert av drømmetåke. Finn en annen rute.";
    pushLog(state, message);
    saveSessionToProfile(req.params.sessionId);
    return res.json({ state: publicState(state), message });
  }

  state.pendingDialog = null;
  state.player = next;
  state.steps += 1;
  const poi = poiAt(state, next.x, next.y);
  const message = poi
    ? `Du kom til ${poi.label} ${poi.emoji} i ${area.name}.`
    : `Du flyttet til (${next.x}, ${next.y}).`;
  pushLog(state, message);
  saveSessionToProfile(req.params.sessionId);

  res.json({ state: publicState(state), message });
});

function applyDialogChoice(state, poiId, choiceId) {
  const tree = DIALOG_TREES[poiId];
  if (!tree || !state.pendingDialog) return null;
  const node = tree[state.pendingDialog.nodeId];
  if (!node) return null;
  const selected = node.choices.find((c) => c.id === choiceId);
  if (!selected) return null;

  const effects = selected.effects || {};
  if (effects.item) addItem(state, effects.item);
  if (effects.affinity) state.rewards.affinity += effects.affinity;
  if (effects.stardust) state.rewards.stardust += effects.stardust;
  if (effects.completeQuest) completeQuest(state, effects.completeQuest);

  state.pendingDialog = null;
  return selected.nextMessage || "Valget ditt endret skjebnen.";
}

function startDialog(state, poiId) {
  const tree = DIALOG_TREES[poiId];
  if (!tree) return null;
  const nodeId = "start";
  const node = tree[nodeId];
  state.pendingDialog = { poiId, nodeId, text: node.text, choices: node.choices };
  return node.text;
}

app.post("/api/dream/interact/:sessionId", (req, res) => {
  const session = getSession(req.params.sessionId);
  if (!session) return res.status(404).json({ error: "session_not_found" });
  const state = session.state;
  const { runeWord = "", action = "interact", choiceId } = req.body || {};
  const quest = currentQuest(state);

  if (!quest) {
    state.completed = true;
    const message = "Alle quests er ferdige. Du har mestret Drømmespeilet!";
    pushLog(state, message);
    saveSessionToProfile(req.params.sessionId);
    return res.json({ state: publicState(state), message });
  }

  const poi = poiAt(state, state.player.x, state.player.y);
  if (!poi) {
    const message = "Her er det stille i drømmeverdenen. Prøv en spesiell lokasjon.";
    pushLog(state, message);
    saveSessionToProfile(req.params.sessionId);
    return res.json({ state: publicState(state), message });
  }

  let message = "Ingenting skjedde akkurat nå.";

  if (poi.id === "forest") {
    if (quest.id === "q1") {
      if (choiceId) {
        const outcome = applyDialogChoice(state, "forest", choiceId);
        message = outcome || "Valget ble ikke gjenkjent.";
      } else {
        message = startDialog(state, "forest") || "Vokteren er stille akkurat na.";
      }
    } else {
      message = "Vokteren hvisker: Følg lyset videre mot tempelet.";
    }
  }

  if (poi.id === "temple") {
    if (quest.id === "q2") {
      if (!hasItem(state, "Maneblomst")) {
        message = "Orakelet venter på Måneblomst før det kan hjelpe deg.";
      } else if (choiceId) {
        const outcome = applyDialogChoice(state, "temple", choiceId);
        message = outcome || "Valget ble ikke gjenkjent.";
      } else {
        message = startDialog(state, "temple") || "Orakelet er stille.";
      }
    } else {
      message = "Måneorakelet: Stol på intuisjonen din.";
    }
  }

  if (poi.id === "lake-core") {
    if (quest.id === "q3") {
      if (!hasItem(state, "Stjernekompass")) {
        message = "Vannet er uklart. Du trenger Stjernekompass for å finne skåren.";
      } else {
        addItem(state, "Speilskar");
        state.rewards.stardust += 10;
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
      if (!hasItem(state, "Speilskar")) {
        message = "Porten er lukket. Du mangler Speilskår.";
      } else if (action !== "use-rune") {
        message = "Speilporten vibrerer. Prøv handlingen 'bruk runeord'.";
      } else if (validRune.length < 3) {
        message = "Runeordet er for svakt. Skriv minst 3 bokstaver.";
      } else if ((state.rewards.stardust || 0) < 20) {
        message = "Speilporten krever mer stjernestov. Velg klokt i dialogene dine.";
      } else {
        completeQuest(state, "q4");
        state.completed = true;
        message = `Speilporten åpnes med runeordet "${runeWord}"! Eventyret er fullført 🌟`;
      }
    } else {
      message = "Speilporten pulserer med stille lys.";
    }
  }

  if (poi.type === "portal") {
    if (action !== "travel") {
      message = "Dette er en portal. Bruk handlingen 'Reis'.";
    } else {
      const nextArea = getArea(poi.targetAreaId);
      state.areaId = nextArea.id;
      state.player = { ...poi.targetPos };
      state.pendingDialog = null;
      message = `Portalhopp fullfort! Du er na i ${nextArea.name}.`;
    }
  }

  pushLog(state, message);
  saveSessionToProfile(req.params.sessionId);
  res.json({ state: publicState(state), message });
});

app.post("/api/dream/reset/:sessionId", (req, res) => {
  const session = getSession(req.params.sessionId);
  if (!session) return res.status(404).json({ error: "session_not_found" });
  session.state = newState();
  saveSessionToProfile(req.params.sessionId);
  res.json({ state: publicState(session.state) });
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Dream backend running on http://localhost:${PORT}`);
});
