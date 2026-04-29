import { useState, useEffect, useRef } from "react";
import "./App.css";

const CATEGORIES = [
  {
    name: "Geografi",
    clues: [
      { value: 200, clue: "Hva er hovedstaden i Norge?", answer: "Oslo" },
      { value: 400, clue: "Hvilket land er størst i verden (areal)?", answer: "Russland" },
      { value: 600, clue: "Hvilken elv er lengst i verden?", answer: "Nilen" },
      { value: 800, clue: "Hva er Norges høyeste fjell?", answer: "Galdhøpiggen" },
      { value: 1000, clue: "Hva heter verdens største innsjø (etter overflate)?", answer: "Kaspihavet" },
    ],
  },
  {
    name: "Historie",
    clues: [
      { value: 200, clue: "Hvilket år ble Norge selvstendig fra Sverige?", answer: "1905" },
      { value: 400, clue: "Hvem var Norges første statsminister etter 1905?", answer: "Christian Michelsen" },
      { value: 600, clue: "Hvilket år startet andre verdenskrig?", answer: "1939" },
      { value: 800, clue: "Hvem oppdaget Amerika i 1492?", answer: "Christoffer Columbus" },
      { value: 1000, clue: "Hva heter den første romanen skrevet på norsk (1854–55)?", answer: "Amtmandens Døtre" },
    ],
  },
  {
    name: "Vitenskap",
    clues: [
      { value: 200, clue: "Hva er det kjemiske symbolet for vann?", answer: "H₂O" },
      { value: 400, clue: "Hva kalles Jordens naturlige satellitt?", answer: "Månen" },
      { value: 600, clue: "Hvem formulerte gravitasjonsloven?", answer: "Isaac Newton" },
      { value: 800, clue: "Hva er DNA en forkortelse for (norsk)?", answer: "Deoksyribonukleinsyre" },
      { value: 1000, clue: "Hva er lysets hastighet i km/s (tilnærmet)?", answer: "300 000 km/s" },
    ],
  },
  {
    name: "Sport",
    clues: [
      { value: 200, clue: "Hvor mange spillere er det på et fotballag på banen?", answer: "11" },
      { value: 400, clue: "Hvilken by arrangerte vinter-OL i 1994?", answer: "Lillehammer" },
      { value: 600, clue: "Hvem har vunnet Tour de France flest ganger (5 ganger)?", answer: "Eddy Merckx" },
      { value: 800, clue: "Hvor mange hull er det i en standard golfrunde?", answer: "18" },
      { value: 1000, clue: "Hvilket land har vunnet flest OL-gull totalt gjennom historien?", answer: "USA" },
    ],
  },
  {
    name: "Musikk",
    clues: [
      { value: 200, clue: "Hvem sang hiten 'Take On Me' (1985)?", answer: "A-ha" },
      { value: 400, clue: "Hva het The Beatles' aller første single?", answer: "Love Me Do" },
      { value: 600, clue: "Hvem er kjent som 'Queen of Pop'?", answer: "Madonna" },
      { value: 800, clue: "Hva het Mozarts fulle navn?", answer: "Wolfgang Amadeus Mozart" },
      { value: 1000, clue: "Hvilken nasjonalitet har bandet ABBA?", answer: "Svensk" },
    ],
  },
  {
    name: "Film & TV",
    clues: [
      { value: 200, clue: "Hva heter den grønne ogre i animasjonsfilmen Shrek?", answer: "Shrek" },
      { value: 400, clue: "Hvem spiller Iron Man i Marvel Cinematic Universe?", answer: "Robert Downey Jr." },
      { value: 600, clue: "Hva heter den populære norske ungdomsserien fra NRK (2015)?", answer: "Skam" },
      { value: 800, clue: "Hvem regisserte filmen Titanic (1997)?", answer: "James Cameron" },
      { value: 1000, clue: "Hva er den best inntjenende filmen gjennom tidene?", answer: "Avatar" },
    ],
  },
];

// Generate a random Daily Double position once
function randomDailyDouble() {
  const catIdx = Math.floor(Math.random() * CATEGORIES.length);
  const clueIdx = 1 + Math.floor(Math.random() * 4); // rows 1-4 (not $200)
  return `${catIdx}-${clueIdx}`;
}

// ── Emoji Background ──────────────────────────────────────────
const BG_EMOJIS = ["🌸", "💖", "✨", "🦋", "🌷", "💜", "🎀", "⭐", "🌺", "💕", "🫧", "🩷"];
function EmojiBackground() {
  return (
    <div className="emoji-bg" aria-hidden="true">
      {Array.from({ length: 120 }, (_, i) => (
        <span key={i} className="emoji-bg-item">
          {BG_EMOJIS[i % BG_EMOJIS.length]}
        </span>
      ))}
    </div>
  );
}

// ── Setup Screen ──────────────────────────────────────────────
function SetupScreen({ onStart, onBackHub }) {
  const [names, setNames] = useState(["", ""]);
  const [emojis] = useState(["💖", "💜"]);

  const valid = names.every((n) => n.trim().length > 0);

  return (
    <div className="setup-screen">
      <EmojiBackground />
      <div className="title-deco">
        <span className="sparkle-icon">✨</span>
        <h1 className="jeopardy-title">Jeopardy!</h1>
        <span className="sparkle-icon">✨</span>
      </div>
      <p className="subtitle">💖 Quiz Night 💖</p>

      <div className="setup-card">
        <h2 className="setup-heading">Hvem spiller? 🎀</h2>
        <p className="setup-sub">Skriv inn lagnavn for å starte spillet</p>

        <div className="setup-inputs">
          {names.map((name, i) => (
            <div key={i} className="setup-input-group">
              <label className="setup-label">{emojis[i]} Lag {i + 1}</label>
              <input
                className="setup-input"
                type="text"
                placeholder={`Lagnavn for lag ${i + 1}...`}
                value={name}
                maxLength={20}
                onChange={(e) => {
                  const next = [...names];
                  next[i] = e.target.value;
                  setNames(next);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && valid) onStart(names.map((n) => n.trim()));
                }}
              />
            </div>
          ))}
        </div>

        <button
          className="start-btn"
          disabled={!valid}
          onClick={() => onStart(names.map((n) => n.trim()))}
        >
          ✨ Start spillet ✨
        </button>
      </div>

      <button className="fashion-entry-btn hub-entry-btn" onClick={onBackHub}>
        ← Til Cute Play Hub
      </button>
    </div>
  );
}

// ── Winner Screen ─────────────────────────────────────────────
function WinnerScreen({ teamNames, scores, onRestart }) {
  const maxScore = Math.max(...scores);
  const winners = teamNames.filter((_, i) => scores[i] === maxScore);
  const isTie = winners.length > 1;

  return (
    <div className="winner-screen">
      <EmojiBackground />
      <div className="winner-confetti">
        {["🎊", "💖", "✨", "🌸", "💜", "🎀", "⭐", "🌷"].map((e, i) => (
          <span key={i} className="confetti-piece" style={{ "--i": i }}>{e}</span>
        ))}
      </div>

      <div className="winner-card">
        <p className="winner-trophy">🏆</p>
        <h2 className="winner-heading">
          {isTie ? "Uavgjort! 🤝" : `${winners[0]} vinner! 🎉`}
        </h2>
        <p className="winner-sub">
          {isTie ? "Begge lag er like gode — dere er begge vinnere!" : "Gratulerer med seieren!"}
        </p>

        <div className="winner-scores">
          {teamNames.map((name, i) => (
            <div key={i} className={`winner-score-card ${scores[i] === maxScore ? "winner-highlight" : ""}`}>
              <span className="winner-team-name">{name}</span>
              <span className="winner-team-score">${scores[i].toLocaleString()}</span>
            </div>
          ))}
        </div>

        <button className="start-btn" onClick={onRestart}>
          🎀 Spill igjen 🎀
        </button>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────
function App() {
  const [phase, setPhase] = useState("hub"); // "hub" | "setup" | "game" | "winner"
  const [teamNames, setTeamNames] = useState(["Lag 1", "Lag 2"]);
  const [scores, setScores] = useState([0, 0]);
  const [activeTeam, setActiveTeam] = useState(0);
  const [answered, setAnswered] = useState(
    () => CATEGORIES.map((cat) => cat.clues.map(() => false))
  );
  const [modal, setModal] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [dailyDouble] = useState(randomDailyDouble);
  const [isDailyDouble, setIsDailyDouble] = useState(false);
  const [ddWager, setDdWager] = useState("");

  // Check if all clues answered → game over
  useEffect(() => {
    if (phase !== "game") return;
    const allDone = answered.every((row) => row.every(Boolean));
    if (allDone) setPhase("winner");
  }, [answered, phase]);

  const totalClues = CATEGORIES.length * CATEGORIES[0].clues.length;
  const answeredCount = answered.flat().filter(Boolean).length;
  const progress = Math.round((answeredCount / totalClues) * 100);

  const startGame = (names) => {
    setTeamNames(names);
    setScores([0, 0]);
    setActiveTeam(0);
    setAnswered(CATEGORIES.map((cat) => cat.clues.map(() => false)));
    setPhase("game");
  };

  const restartGame = () => {
    setPhase("setup");
  };

  const openClue = (catIdx, clueIdx) => {
    if (answered[catIdx][clueIdx]) return;
    const key = `${catIdx}-${clueIdx}`;
    setIsDailyDouble(key === dailyDouble);
    setDdWager("");
    setModal({ catIdx, clueIdx });
    setRevealed(false);
  };

  const closeModal = () => {
    setModal(null);
    setRevealed(false);
    setIsDailyDouble(false);
    setDdWager("");
  };

  const markAnswered = () => {
    if (!modal) return;
    const next = answered.map((row, ci) =>
      row.map((val, qi) => (ci === modal.catIdx && qi === modal.clueIdx ? true : val))
    );
    setAnswered(next);
    closeModal();
  };

  const getEffectiveValue = () => {
    if (!modal) return 0;
    if (isDailyDouble) {
      const w = parseInt(ddWager, 10);
      return isNaN(w) || w <= 0 ? 0 : w;
    }
    return CATEGORIES[modal.catIdx].clues[modal.clueIdx].value;
  };

  const awardPoints = (teamIdx) => {
    const value = getEffectiveValue();
    setScores((prev) => prev.map((s, i) => (i === teamIdx ? s + value : s)));
    setActiveTeam(teamIdx === 0 ? 1 : 0);
    markAnswered();
  };

  const deductPoints = (teamIdx) => {
    const value = getEffectiveValue();
    setScores((prev) => prev.map((s, i) => (i === teamIdx ? s - value : s)));
    markAnswered();
  };

  const currentClue = modal !== null ? CATEGORIES[modal.catIdx].clues[modal.clueIdx] : null;
  const effectiveValue = getEffectiveValue();
  const ddWagerValid = isDailyDouble && parseInt(ddWager, 10) > 0;

  if (phase === "setup") return <SetupScreen onStart={startGame} onBackHub={() => setPhase("hub")} />;
  if (phase === "hub") return <PlayHubScreen onOpen={(page) => setPhase(page)} />;
  if (phase === "winner") return <WinnerScreen teamNames={teamNames} scores={scores} onRestart={restartGame} />;
  if (phase === "fashion") return <FashionScreen onBack={() => setPhase("hub")} />;
  if (phase === "makeup") return <MakeupScreen onBack={() => setPhase("hub")} />;
  if (phase === "nails") return <NailScreen onBack={() => setPhase("hub")} />;
  if (phase === "fortune") return <FortuneWheelScreen onBack={() => setPhase("hub")} />;
  if (phase === "stickers") return <StickerBookScreen onBack={() => setPhase("hub")} />;
  if (phase === "quiz") return <FriendshipQuizScreen onBack={() => setPhase("hub")} />;

  return (
    <div className="jeopardy-app">
      <EmojiBackground />
      <div className="title-deco">
        <span className="sparkle-icon">✨</span>
        <h1 className="jeopardy-title">Jeopardy!</h1>
        <span className="sparkle-icon">✨</span>
      </div>
      <p className="subtitle">💖 Quiz Night 💖</p>

      {/* Scoreboard */}
      <div className="scoreboard">
        {scores.map((score, i) => (
          <div key={i} className={`score-card ${activeTeam === i ? "score-card--active" : ""}`}>
            <span className="team-name">{teamNames[i]}</span>
            <span className="team-score">${score.toLocaleString()}</span>
            {activeTeam === i && <span className="active-badge">TUR 🎯</span>}
          </div>
        ))}
        <div className="scoreboard-right">
          <div className="progress-wrap">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <p className="progress-label">{answeredCount}/{totalClues} spørsmål</p>
          <button className="reset-btn" onClick={restartGame}>Nytt spill</button>
          <button className="reset-btn fashion-game-btn" onClick={() => setPhase("hub")}>← Cute Play Hub</button>
        </div>
      </div>

      {/* Board */}
      <div className="board">
        {CATEGORIES.map((cat, ci) => (
          <div key={ci} className="category-header">{cat.name}</div>
        ))}
        {[0, 1, 2, 3, 4].map((rowIdx) =>
          CATEGORIES.map((cat, catIdx) => {
            const clue = cat.clues[rowIdx];
            const done = answered[catIdx][rowIdx];
            const isDD = `${catIdx}-${rowIdx}` === dailyDouble && !done;
            return (
              <div
                key={`${catIdx}-${rowIdx}`}
                className={`clue-cell ${done ? "answered" : ""} ${isDD ? "daily-double-cell" : ""}`}
                onClick={() => openClue(catIdx, rowIdx)}
              >
                {done ? "" : isDD ? "⭐" : `$${clue.value}`}
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {modal !== null && currentClue && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>

            {isDailyDouble ? (
              <div className="daily-double-banner">⭐ Daily Double! ⭐</div>
            ) : (
              <p className="modal-value">${currentClue.value}</p>
            )}

            <p className="modal-category">
              {CATEGORIES[modal.catIdx].name} · Lag: <strong>{teamNames[activeTeam]}</strong>
            </p>

            {isDailyDouble && !revealed && (
              <div className="dd-wager">
                <label className="dd-label">Innsats for {teamNames[activeTeam]}:</label>
                <input
                  className="dd-input"
                  type="number"
                  min={1}
                  max={Math.max(scores[activeTeam], 1000)}
                  placeholder="Skriv inn beløp..."
                  value={ddWager}
                  onChange={(e) => setDdWager(e.target.value)}
                />
                {ddWagerValid && (
                  <p className="dd-wager-preview">Innsats: ${parseInt(ddWager).toLocaleString()}</p>
                )}
              </div>
            )}

            {(!isDailyDouble || ddWagerValid) && (
              <p className="modal-clue">{currentClue.clue}</p>
            )}

            {(!isDailyDouble || ddWagerValid) && !revealed && (
              <button className="reveal-btn" onClick={() => setRevealed(true)}>
                Vis svar
              </button>
            )}

            {revealed && (
              <>
                <p className="modal-answer">{currentClue.answer}</p>
                <div className="award-section">
                  <p className="award-label">Hvem svarte riktig?</p>
                  <div className="award-buttons">
                    {teamNames.map((name, i) => (
                      <div key={i} className="team-award">
                        <span>{name}</span>
                        <button className="award-btn correct" onClick={() => awardPoints(i)}>
                          +${effectiveValue.toLocaleString()}
                        </button>
                        <button className="award-btn wrong" onClick={() => deductPoints(i)}>
                          −${effectiveValue.toLocaleString()}
                        </button>
                      </div>
                    ))}
                  </div>
                  <button className="skip-btn" onClick={markAnswered}>Ingen poeng</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Fashion / Outfit Screen ───────────────────────────────────
const HAIR = [
  // label, SVG path(s) for hair shape
  {
    label: "Bølgete langt 🌊",
    color: "#c0392b",
    paths: [
      "M100,60 Q60,20 80,90 Q50,100 60,140 Q40,160 70,170 L80,130 Q70,110 90,100 Z",
      "M140,60 Q180,20 160,90 Q190,100 180,140 Q200,160 170,170 L160,130 Q170,110 150,100 Z",
    ],
  },
  {
    label: "Rett kort ✂️",
    color: "#8e44ad",
    paths: [
      "M85,65 Q70,50 75,90 L80,90 Q82,70 90,68 Z",
      "M155,65 Q170,50 165,90 L160,90 Q158,70 150,68 Z",
      "M85,65 Q120,55 155,65 L158,72 Q120,62 82,72 Z",
    ],
  },
  {
    label: "Høy hestehale 🎀",
    color: "#e67e22",
    paths: [
      "M100,62 Q80,50 85,70 L115,62 Q112,50 100,62 Z",
      "M140,62 Q160,50 155,70 L125,62 Q128,50 140,62 Z",
      "M112,58 Q120,30 128,58 Q124,32 120,28 Q116,32 112,58 Z",
    ],
  },
  {
    label: "Krøller 🌀",
    color: "#16a085",
    paths: [
      "M90,65 Q60,55 65,85 Q55,95 65,110 Q50,120 65,130 L75,120 Q65,112 75,100 Q65,88 75,80 Q72,65 90,68 Z",
      "M150,65 Q180,55 175,85 Q185,95 175,110 Q190,120 175,130 L165,120 Q175,112 165,100 Q175,88 165,80 Q168,65 150,68 Z",
    ],
  },
  {
    label: "Fletter 🤎",
    color: "#6d4c41",
    paths: [
      "M88,65 Q75,65 78,100 Q74,115 80,140 L86,140 Q82,115 84,100 Q83,75 92,70 Z",
      "M152,65 Q165,65 162,100 Q166,115 160,140 L154,140 Q158,115 156,100 Q157,75 148,70 Z",
    ],
  },
];

const TOPS = [
  {
    label: "Rosa hoodie 🩷",
    bodyColor: "#f48fb1",
    sleeveColor: "#f06292",
    paths: {
      body: "M85,175 Q80,190 82,230 L158,230 Q160,190 155,175 Z",
      sleeves: "M85,175 Q60,180 55,215 L75,220 Q78,192 90,185 Z M155,175 Q180,180 185,215 L165,220 Q162,192 150,185 Z",
      collar: "M100,172 Q120,180 140,172 Q135,165 120,168 Q105,165 100,172 Z",
    },
  },
  {
    label: "Stripet topp 🎀",
    bodyColor: "#ce93d8",
    sleeveColor: "#ab47bc",
    paths: {
      body: "M90,172 Q85,185 87,225 L153,225 Q155,185 150,172 Z",
      sleeves: "M90,172 Q72,175 68,205 L82,208 Q84,182 94,178 Z M150,172 Q168,175 172,205 L158,208 Q156,182 146,178 Z",
      collar: "M100,168 Q120,158 140,168 L138,175 Q120,165 102,175 Z",
    },
  },
  {
    label: "Svart crop top 🖤",
    bodyColor: "#424242",
    sleeveColor: "#212121",
    paths: {
      body: "M92,170 Q88,182 90,210 L150,210 Q152,182 148,170 Z",
      sleeves: "M92,170 Q76,172 73,198 L86,200 Q87,178 96,174 Z M148,170 Q164,172 167,198 L154,200 Q153,178 144,174 Z",
      collar: "M100,165 Q120,155 140,165 L136,170 Q120,162 104,170 Z",
    },
  },
  {
    label: "Gul sommerkjole 🌻",
    bodyColor: "#fff176",
    sleeveColor: "#f9a825",
    paths: {
      body: "M88,168 Q75,185 72,235 L168,235 Q165,185 152,168 Z",
      sleeves: "M88,168 Q75,162 72,178 L80,182 Q84,170 92,170 Z M152,168 Q165,162 168,178 L160,182 Q156,170 148,170 Z",
      collar: "M95,164 Q120,155 145,164 L142,170 Q120,160 98,170 Z",
    },
  },
  {
    label: "Rød blazer 💼",
    bodyColor: "#e53935",
    sleeveColor: "#b71c1c",
    paths: {
      body: "M86,172 Q80,188 82,232 L158,232 Q160,188 154,172 Z",
      sleeves: "M86,172 Q62,178 58,218 L72,222 Q76,190 92,182 Z M154,172 Q178,178 182,218 L168,222 Q164,190 148,182 Z",
      collar: "M102,168 Q110,178 120,175 Q130,178 138,168 L135,162 Q120,170 105,162 Z",
    },
  },
];

const PANTS = [
  {
    label: "Rosa bukse 🌸",
    color: "#f8bbd0",
    paths: "M88,228 Q84,270 82,310 L108,310 Q112,270 120,250 Q128,270 132,310 L158,310 Q156,270 152,228 Z",
  },
  {
    label: "Blå jeans 👖",
    color: "#1565c0",
    paths: "M88,228 Q84,268 80,312 L107,312 Q111,268 120,248 Q129,268 133,312 L160,312 Q156,268 152,228 Z",
  },
  {
    label: "Mini-skjørt 🩷",
    color: "#e91e63",
    paths: "M85,228 Q82,245 80,258 L160,258 Q158,245 155,228 Z M90,252 L92,278 L108,275 Z M150,252 L148,278 L132,275 Z",
  },
  {
    label: "Grønn joggebukse 🌿",
    color: "#388e3c",
    paths: "M88,228 Q85,270 83,315 L110,315 Q113,268 120,250 Q127,268 130,315 L157,315 Q155,270 152,228 Z",
  },
  {
    label: "Hvite shorts 🤍",
    color: "#eeeeee",
    paths: "M87,228 Q84,252 83,272 L120,268 L157,272 Q156,252 153,228 Z",
  },
];

const SHOES = [
  {
    label: "Rosa hæler 👠",
    color: "#f48fb1",
    paths: "M87,310 Q80,318 78,325 L104,325 Q106,315 108,312 Z M132,310 Q138,315 140,325 L162,325 Q160,318 153,310 Z M78,322 Q72,325 74,328 L104,328 L104,325 Z M162,322 Q168,325 166,328 L136,328 L136,325 Z",
  },
  {
    label: "Hvite sneakers 👟",
    color: "#fafafa",
    paths: "M82,310 Q76,315 75,324 L108,324 Q109,314 108,310 Z M132,310 Q131,314 132,324 L165,324 Q164,315 158,310 Z M75,320 Q74,326 78,326 L108,326 L108,324 Z M132,324 L132,326 L162,326 Q166,326 165,320 Z",
  },
  {
    label: "Svarte støvler 🖤",
    color: "#212121",
    paths: "M83,308 Q78,318 77,332 L107,332 Q108,318 108,308 Z M132,308 Q132,318 133,332 L163,332 Q162,318 157,308 Z",
  },
  {
    label: "Gule sandaler 🌻",
    color: "#f9a825",
    paths: "M85,310 L85,322 L107,322 L107,310 Z M133,310 L133,322 L155,322 L155,310 Z M88,310 Q88,308 96,308 Q104,308 104,310 Z M136,310 Q136,308 144,308 Q152,308 152,310 Z M85,316 L107,316 M133,316 L155,316",
  },
  {
    label: "Lilla loafers 💜",
    color: "#7b1fa2",
    paths: "M82,310 Q78,316 79,323 L108,323 Q110,316 108,310 Z M132,310 Q130,316 132,323 L161,323 Q162,316 158,310 Z",
  },
];

function FashionScreen({ onBack }) {
  const [hairIdx, setHairIdx] = useState(0);
  const [topIdx, setTopIdx] = useState(0);
  const [pantsIdx, setPantsIdx] = useState(0);
  const [shoesIdx, setShoesIdx] = useState(0);

  const cycle = (setter, idx, arr, dir) =>
    setter((idx + dir + arr.length) % arr.length);

  const hair = HAIR[hairIdx];
  const top = TOPS[topIdx];
  const pants = PANTS[pantsIdx];
  const shoes = SHOES[shoesIdx];

  return (
    <div className="fashion-screen">
      <EmojiBackground />
      <div className="fashion-inner">
        <h1 className="fashion-title">✨ Velg antrekk! ✨</h1>
        <p className="fashion-sub">Kle på din supermodell 💖</p>

        <div className="fashion-layout">
          {/* LEFT CONTROLS */}
          <div className="fashion-controls left">
            {/* Hair */}
            <div className="outfit-picker" style={{ marginTop: "30px" }}>
              <button className="arrow-btn" onClick={() => cycle(setHairIdx, hairIdx, HAIR, -1)}>◀</button>
              <span className="outfit-label">{hair.label}</span>
              <button className="arrow-btn" onClick={() => cycle(setHairIdx, hairIdx, HAIR, 1)}>▶</button>
            </div>

            {/* Top */}
            <div className="outfit-picker" style={{ marginTop: "90px" }}>
              <button className="arrow-btn" onClick={() => cycle(setTopIdx, topIdx, TOPS, -1)}>◀</button>
              <span className="outfit-label">{top.label}</span>
              <button className="arrow-btn" onClick={() => cycle(setTopIdx, topIdx, TOPS, 1)}>▶</button>
            </div>

            {/* Pants */}
            <div className="outfit-picker" style={{ marginTop: "100px" }}>
              <button className="arrow-btn" onClick={() => cycle(setPantsIdx, pantsIdx, PANTS, -1)}>◀</button>
              <span className="outfit-label">{pants.label}</span>
              <button className="arrow-btn" onClick={() => cycle(setPantsIdx, pantsIdx, PANTS, 1)}>▶</button>
            </div>

            {/* Shoes */}
            <div className="outfit-picker" style={{ marginTop: "80px" }}>
              <button className="arrow-btn" onClick={() => cycle(setShoesIdx, shoesIdx, SHOES, -1)}>◀</button>
              <span className="outfit-label">{shoes.label}</span>
              <button className="arrow-btn" onClick={() => cycle(setShoesIdx, shoesIdx, SHOES, 1)}>▶</button>
            </div>
          </div>

          {/* MANNEQUIN SVG */}
          <div className="mannequin-wrap">
            <svg viewBox="0 0 240 370" className="mannequin-svg" xmlns="http://www.w3.org/2000/svg">
              {/* SHOES */}
              <g fill={shoes.color} stroke="#0003" strokeWidth="1">
                <path d={shoes.paths} />
              </g>

              {/* PANTS */}
              <g fill={pants.color} stroke="#0002" strokeWidth="1">
                <path d={pants.paths} />
              </g>

              {/* TOP — body */}
              <g fill={top.bodyColor} stroke="#0002" strokeWidth="1">
                <path d={top.paths.body} />
              </g>
              {/* TOP — sleeves */}
              <g fill={top.sleeveColor} stroke="#0002" strokeWidth="1">
                <path d={top.paths.sleeves} />
              </g>
              {/* TOP — collar */}
              <g fill={top.bodyColor} stroke="#0002" strokeWidth="0.5">
                <path d={top.paths.collar} />
              </g>

              {/* BODY / SKIN */}
              {/* Neck */}
              <rect x="112" y="148" width="16" height="24" rx="6" fill="#f5cba7" />
              {/* Torso skin (behind top) */}
              {/* Arms */}
              <path d="M88,175 Q72,185 68,215 L78,218 Q80,192 94,182 Z" fill="#f5cba7" />
              <path d="M152,175 Q168,185 172,215 L162,218 Q160,192 146,182 Z" fill="#f5cba7" />
              {/* Hands */}
              <ellipse cx="70" cy="218" rx="7" ry="5" fill="#f5cba7" />
              <ellipse cx="170" cy="218" rx="7" ry="5" fill="#f5cba7" />
              {/* Legs skin */}
              <path d="M92,228 Q89,268 87,310 L107,310 Q109,270 120,252 Q131,270 133,310 L153,310 Q151,268 148,228 Z" fill="#f5cba7" opacity="0.3" />

              {/* HEAD */}
              <ellipse cx="120" cy="100" rx="30" ry="35" fill="#f5cba7" />
              {/* Eyes */}
              <ellipse cx="110" cy="96" rx="4" ry="4.5" fill="white" />
              <ellipse cx="130" cy="96" rx="4" ry="4.5" fill="white" />
              <ellipse cx="111" cy="97" rx="2.5" ry="3" fill="#5d4037" />
              <ellipse cx="131" cy="97" rx="2.5" ry="3" fill="#5d4037" />
              <circle cx="111.5" cy="96" r="1" fill="black" />
              <circle cx="131.5" cy="96" r="1" fill="black" />
              {/* Eye sparkle */}
              <circle cx="113" cy="95" r="0.8" fill="white" />
              <circle cx="133" cy="95" r="0.8" fill="white" />
              {/* Eyebrows */}
              <path d="M106,90 Q110,87 115,90" stroke="#5d4037" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M125,90 Q130,87 134,90" stroke="#5d4037" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              {/* Nose */}
              <path d="M118,103 Q120,108 122,103" stroke="#c9956a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              {/* Mouth / smile */}
              <path d="M113,112 Q120,118 127,112" stroke="#e91e63" strokeWidth="2" fill="none" strokeLinecap="round" />
              {/* Blush */}
              <ellipse cx="105" cy="108" rx="6" ry="3.5" fill="#f48fb1" opacity="0.4" />
              <ellipse cx="135" cy="108" rx="6" ry="3.5" fill="#f48fb1" opacity="0.4" />

              {/* HAIR — drawn on top of head */}
              {hair.paths.map((p, i) => (
                <path key={i} d={p} fill={hair.color} />
              ))}
              {/* Hair bow for hestehale */}
              {hairIdx === 2 && (
                <g>
                  <path d="M112,50 Q107,44 112,48 Q117,42 122,48 Q127,44 122,50 Q117,46 112,50 Z" fill="#e91e63" />
                  <circle cx="117" cy="49" r="2.5" fill="#c2185b" />
                </g>
              )}
            </svg>
          </div>

          {/* RIGHT — mirror of pickers (empty, just for layout balance) */}
          <div className="fashion-controls right" aria-hidden="true" />
        </div>

        <button className="start-btn fashion-back-btn" onClick={onBack}>
          ← Tilbake
        </button>
      </div>
    </div>
  );
}

// ── Makeup Studio Screen ──────────────────────────────────────
const MAKEUP_TOOLS = [
  { id: "blush",       label: "Blush",       emoji: "🌸", color: "rgba(255,100,160,0.22)", size: 52, soft: true },
  { id: "lipstick",    label: "Leppestift",  emoji: "💄", color: "rgba(210,30,60,0.9)",   size: 9,  soft: false,
    colors: ["rgba(210,30,60,0.9)","rgba(200,50,160,0.9)","rgba(235,95,70,0.9)","rgba(160,0,90,0.9)","rgba(60,0,30,0.9)","rgba(255,130,150,0.9)"] },
  { id: "eyeliner",    label: "Eyeliner",    emoji: "✏️", color: "rgba(10,10,10,0.95)",   size: 3,  soft: false,
    colors: ["rgba(10,10,10,0.95)","rgba(20,0,80,0.95)","rgba(0,30,80,0.95)","rgba(80,0,20,0.95)","rgba(0,80,40,0.95)"] },
  { id: "mascara",     label: "Mascara",     emoji: "👁️", color: "rgba(5,5,5,1)",         size: 5,  soft: false },
  { id: "eyeshadow",   label: "Øyenskygge",  emoji: "💜", color: "rgba(140,80,200,0.42)", size: 30, soft: true,
    colors: ["rgba(140,80,200,0.42)","rgba(230,100,180,0.42)","rgba(60,150,200,0.42)","rgba(50,160,100,0.42)","rgba(200,150,50,0.42)","rgba(200,60,60,0.42)","rgba(80,40,20,0.42)","rgba(180,220,255,0.42)"] },
  { id: "highlighter", label: "Highlighter", emoji: "✨", color: "rgba(255,245,180,0.44)",size: 45, soft: true },
  { id: "contour",     label: "Kontur",      emoji: "🤎", color: "rgba(120,75,35,0.3)",   size: 24, soft: true },
  { id: "bronzer",     label: "Bronzer",     emoji: "🧡", color: "rgba(200,125,50,0.22)", size: 50, soft: true },
  { id: "glitter",     label: "Glitter",     emoji: "🌟", color: "rgba(220,200,255,0.85)",size: 4,  soft: false, glitter: true },
  { id: "eraser",      label: "Visk ut",     emoji: "🧹", color: "erase",                 size: 28, soft: false },
];

function MakeupScreen({ onBack }) {
  const canvasRef = useRef(null);
  const [activeTool, setActiveTool] = useState("blush");
  const [toolColors, setToolColors] = useState({});
  const [brushScale, setBrushScale] = useState(1);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef(null);
  const activeToolRef = useRef("blush");
  const toolColorsRef = useRef({});
  const brushScaleRef = useRef(1);

  const changeBrushScale = (v) => { setBrushScale(v); brushScaleRef.current = v; };

  const toolMap = Object.fromEntries(MAKEUP_TOOLS.map(t => [t.id, t]));

  const chooseTool = (id) => {
    setActiveTool(id);
    activeToolRef.current = id;
  };

  const chooseColor = (toolId, c) => {
    const next = { ...toolColorsRef.current, [toolId]: c };
    setToolColors(next);
    toolColorsRef.current = next;
  };

  const getActiveColor = (toolId) => toolColorsRef.current[toolId] || toolMap[toolId].color;

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * scaleX, y: (src.clientY - rect.top) * scaleY };
  };

  const paint = (pos) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const toolId = activeToolRef.current;
    const tool = toolMap[toolId];
    const color = getActiveColor(toolId);

    const sz = tool.size * brushScaleRef.current;
    if (color === "erase") {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, sz, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fill();
      ctx.restore();
    } else if (tool.glitter) {
      const spread = 25 * brushScaleRef.current;
      for (let i = 0; i < 10; i++) {
        const rx = pos.x + (Math.random() - 0.5) * spread * 2;
        const ry = pos.y + (Math.random() - 0.5) * spread * 2;
        ctx.beginPath();
        ctx.arc(rx, ry, Math.random() * 3 * brushScaleRef.current + 0.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
    } else if (tool.soft) {
      const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, sz);
      grad.addColorStop(0, color);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, sz, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    } else {
      const last = lastPosRef.current || pos;
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = sz;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }
    lastPosRef.current = pos;
  };

  const onStart = (e) => {
    e.preventDefault();
    isDrawingRef.current = true;
    const pos = getPos(e);
    lastPosRef.current = pos;
    paint(pos);
  };

  const onMove = (e) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    paint(getPos(e));
  };

  const onStop = () => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="makeup-screen">
      <EmojiBackground />
      <div className="makeup-inner">
        <h1 className="fashion-title">💄 Makeup Studio 💄</h1>
        <p className="fashion-sub">Velg verktøy og mal på ansiktet!</p>

        <div className="makeup-layout">
          {/* TOOLS PANEL */}
          <div className="makeup-tools-panel">
            {MAKEUP_TOOLS.map(tool => (
              <div key={tool.id} className="makeup-tool-group">
                <button
                  className={`makeup-tool-btn ${activeTool === tool.id ? "active" : ""}`}
                  onClick={() => chooseTool(tool.id)}
                >
                  <span className="tool-emoji">{tool.emoji}</span>
                  <span className="tool-name">{tool.label}</span>
                </button>
                {activeTool === tool.id && tool.colors && (
                  <div className="tool-palette">
                    {tool.colors.map((c, i) => (
                      <button
                        key={i}
                        className={`palette-swatch ${(toolColors[tool.id] || tool.color) === c ? "selected" : ""}`}
                        style={{ background: c.replace(/[\d.]+\)$/, "0.95)") }}
                        onClick={() => chooseColor(tool.id, c)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="brush-size-wrap">
              <label className="brush-size-label">🖌️ Størrelse</label>
              <input
                type="range"
                min="0.3"
                max="3"
                step="0.1"
                value={brushScale}
                onChange={(e) => changeBrushScale(parseFloat(e.target.value))}
                className="brush-size-slider"
              />
              <span className="brush-size-preview" style={{
                width: `${Math.round(12 * brushScale)}px`,
                height: `${Math.round(12 * brushScale)}px`,
              }} />
            </div>
            <button className="makeup-clear-btn" onClick={clearCanvas}>🗑️ Fjern alt</button>
          </div>

          {/* FACE + CANVAS */}
          <div className="face-canvas-wrap">
            <svg viewBox="0 0 300 380" className="face-svg" xmlns="http://www.w3.org/2000/svg">
              {/* Neck */}
              <path d="M125,300 Q118,330 120,360 L180,360 Q182,330 175,300 Z" fill="#f5cba7" />
              {/* Shoulders */}
              <path d="M60,370 Q120,345 150,358 Q180,345 240,370 L240,385 L60,385 Z" fill="#f0c090" opacity="0.6" />
              {/* Face */}
              <ellipse cx="150" cy="185" rx="110" ry="135" fill="#fde4c8" />
              {/* Ear left */}
              <ellipse cx="41" cy="190" rx="15" ry="22" fill="#f5cba7" />
              <ellipse cx="41" cy="190" rx="8" ry="13" fill="#ebb98a" />
              {/* Ear right */}
              <ellipse cx="259" cy="190" rx="15" ry="22" fill="#f5cba7" />
              <ellipse cx="259" cy="190" rx="8" ry="13" fill="#ebb98a" />
              {/* Forehead glow */}
              <ellipse cx="150" cy="108" rx="55" ry="28" fill="rgba(255,255,255,0.12)" />
              {/* Eyebrows */}
              <path d="M82,142 Q105,129 130,137" stroke="#7d5a3c" strokeWidth="4.5" fill="none" strokeLinecap="round" />
              <path d="M170,137 Q195,129 218,142" stroke="#7d5a3c" strokeWidth="4.5" fill="none" strokeLinecap="round" />
              {/* Eye whites */}
              <ellipse cx="106" cy="167" rx="26" ry="17" fill="white" />
              <ellipse cx="194" cy="167" rx="26" ry="17" fill="white" />
              {/* Iris */}
              <circle cx="106" cy="167" r="12" fill="#6b9a8a" />
              <circle cx="194" cy="167" r="12" fill="#6b9a8a" />
              {/* Pupil */}
              <circle cx="106" cy="167" r="7" fill="#111" />
              <circle cx="194" cy="167" r="7" fill="#111" />
              {/* Eye shine */}
              <circle cx="110" cy="163" r="3.5" fill="white" opacity="0.9" />
              <circle cx="198" cy="163" r="3.5" fill="white" opacity="0.9" />
              <circle cx="102" cy="170" r="1.8" fill="white" opacity="0.45" />
              <circle cx="190" cy="170" r="1.8" fill="white" opacity="0.45" />
              {/* Upper lash line */}
              <path d="M80,157 Q92,143 106,150 Q120,143 132,157" stroke="#111" strokeWidth="2.8" fill="none" strokeLinecap="round" />
              <path d="M168,157 Q180,143 194,150 Q208,143 220,157" stroke="#111" strokeWidth="2.8" fill="none" strokeLinecap="round" />
              {/* Lash spikes L */}
              <line x1="82" y1="159" x2="77" y2="150" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="91" y1="152" x2="87" y2="143" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="106" y1="150" x2="106" y2="141" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="120" y1="152" x2="124" y2="143" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="130" y1="159" x2="134" y2="150" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
              {/* Lash spikes R */}
              <line x1="170" y1="159" x2="166" y2="150" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="180" y1="152" x2="177" y2="143" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="194" y1="150" x2="194" y2="141" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="208" y1="152" x2="212" y2="143" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="218" y1="159" x2="222" y2="150" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
              {/* Lower lash */}
              <path d="M82,175 Q92,182 106,180 Q120,182 130,175" stroke="#555" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M170,175 Q180,182 194,180 Q208,182 218,175" stroke="#555" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              {/* Nose */}
              <path d="M144,178 Q139,215 130,226 Q142,233 150,230 Q158,233 170,226 Q161,215 156,178" stroke="#d4976b" strokeWidth="2" fill="none" strokeLinecap="round" />
              <ellipse cx="135" cy="226" rx="9" ry="5.5" fill="rgba(180,120,80,0.18)" />
              <ellipse cx="165" cy="226" rx="9" ry="5.5" fill="rgba(180,120,80,0.18)" />
              <path d="M130,226 Q142,234 158,226" stroke="#c08050" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              {/* Natural blush hint */}
              <ellipse cx="80" cy="218" rx="30" ry="17" fill="rgba(255,160,160,0.1)" />
              <ellipse cx="220" cy="218" rx="30" ry="17" fill="rgba(255,160,160,0.1)" />
              {/* Lips — lower */}
              <path d="M112,262 Q132,280 150,276 Q168,280 188,262 Q170,268 150,270 Q130,268 112,262 Z" fill="#e8907a" />
              {/* Lips — upper */}
              <path d="M112,262 Q128,250 140,256 Q150,252 160,256 Q172,250 188,262 Q170,256 150,258 Q130,256 112,262 Z" fill="#d47060" />
              {/* Lip line */}
              <path d="M112,262 Q128,250 140,256 Q150,252 160,256 Q172,250 188,262" stroke="#c06050" strokeWidth="1.2" fill="none" />
              <path d="M112,262 Q132,280 150,276 Q168,280 188,262" stroke="#c06050" strokeWidth="1.2" fill="none" />
              {/* Lip shine */}
              <ellipse cx="138" cy="267" rx="13" ry="5" fill="rgba(255,255,255,0.22)" />
            </svg>

            <canvas
              ref={canvasRef}
              width={300}
              height={380}
              className="makeup-canvas"
              onMouseDown={onStart}
              onMouseMove={onMove}
              onMouseUp={onStop}
              onMouseLeave={onStop}
              onTouchStart={onStart}
              onTouchMove={onMove}
              onTouchEnd={onStop}
            />
          </div>
        </div>

        <button className="start-btn fashion-back-btn" onClick={onBack}>← Tilbake</button>
      </div>
    </div>
  );
}

// ── Nail Studio ───────────────────────────────────────────────
const NAIL_SHAPES = [
  { id: "round",    label: "Round 🔵" },
  { id: "oval",     label: "Oval 🥚" },
  { id: "square",   label: "Square ⬜" },
  { id: "squoval",  label: "Squoval ▱" },
  { id: "almond",   label: "Almond 🌰" },
  { id: "coffin",   label: "Coffin 🪦" },
  { id: "stiletto", label: "Stiletto 💅" },
];

const POLISH_COLORS = [
  "#e91e8c","#f48fb1","#f44336","#ff7043","#ff9800",
  "#ffd700","#c5e1a5","#26c6da","#42a5f5","#5c6bc0",
  "#ce93d8","#bcaaa4","#212121","#795548","#ff80ab",
  "#b2dfdb","#fff9c4","#ffe0b2","#c8e6c9","#e1bee7",
  "#ffffff","transparent",
];

const NAIL_STICKERS = ["⭐","🌈","🩷","💎","🌸","✨","🦋","🌺","💫","🎀","🌙","❤️","🍓","🌷","💜","🔮","🐝","🌊","🫧","🪩"];

// Nail base positions: cx = centre-x, baseY = cuticle y, w = width, h = height
const LEFT_NAIL_POS = [
  { cx: 70,  baseY: 210, w: 17, h: 26 }, // thumb
  { cx: 107, baseY: 152, w: 19, h: 32 }, // index
  { cx: 142, baseY: 136, w: 21, h: 36 }, // middle
  { cx: 176, baseY: 144, w: 19, h: 32 }, // ring
  { cx: 205, baseY: 169, w: 15, h: 26 }, // pinky
];
const RIGHT_NAIL_POS = [
  { cx: 570, baseY: 210, w: 17, h: 26 },
  { cx: 533, baseY: 152, w: 19, h: 32 },
  { cx: 498, baseY: 136, w: 21, h: 36 },
  { cx: 464, baseY: 144, w: 19, h: 32 },
  { cx: 435, baseY: 169, w: 15, h: 26 },
];

function nailPath(cx, baseY, w, h, shape) {
  const x0 = cx - w / 2, x1 = cx + w / 2, y1 = baseY - h, r = w / 2;
  switch (shape) {
    case "square":
      return `M${x0},${baseY} L${x0},${y1} L${x1},${y1} L${x1},${baseY} Z`;
    case "round":
      return `M${x0},${baseY} L${x0},${y1+r} A${r},${r} 0 0,1 ${x1},${y1+r} L${x1},${baseY} Z`;
    case "oval": {
      const ry = r * 1.6;
      return `M${x0},${baseY} L${x0},${y1+ry} A${r},${ry} 0 0,1 ${x1},${y1+ry} L${x1},${baseY} Z`;
    }
    case "squoval": {
      const rc = w * 0.22;
      return `M${x0},${baseY} L${x0},${y1+rc} Q${x0},${y1} ${x0+rc},${y1} L${x1-rc},${y1} Q${x1},${y1} ${x1},${y1+rc} L${x1},${baseY} Z`;
    }
    case "almond":
      return `M${x0},${baseY} L${x0},${y1+h*0.42} Q${cx-w*0.04},${y1-h*0.04} ${cx},${y1} Q${cx+w*0.04},${y1-h*0.04} ${x1},${y1+h*0.42} L${x1},${baseY} Z`;
    case "coffin": {
      const tw = w * 0.52, tx0 = cx - tw/2, tx1 = cx + tw/2;
      return `M${x0},${baseY} L${x0},${y1+h*0.24} L${tx0},${y1} L${tx1},${y1} L${x1},${y1+h*0.24} L${x1},${baseY} Z`;
    }
    case "stiletto":
      return `M${x0},${baseY} L${x0},${y1+h*0.33} L${cx},${y1} L${x1},${y1+h*0.33} L${x1},${baseY} Z`;
    default:
      return `M${x0},${baseY} L${x0},${y1} L${x1},${y1} L${x1},${baseY} Z`;
  }
}

function nailGleam(cx, baseY, w, h) {
  const hw = w * 0.32, hx = cx - hw / 2, hy = baseY - h * 0.72;
  return `M${hx},${hy + h*0.22} Q${cx},${hy} ${hx+hw},${hy + h*0.22} Z`;
}

const SKIN    = "#fde4c8";
const SKIN_SH = "#f0c090";
const NAIL_BG = "#fce4ec";

function NailScreen({ onBack }) {
  const [shape, setShape]           = useState("round");
  const [tool, setTool]             = useState("polish");
  const [polishColor, setPolishColor] = useState("#e91e8c");
  const [sticker, setSticker]       = useState("⭐");
  const [nailColors, setNailColors] = useState(() => Array(10).fill("transparent"));
  const [nailStickers, setNailStickers] = useState(() => Array(10).fill(null).map(() => []));
  const svgRef = useRef(null);

  const toSvgPt = (e) => {
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width)  * 640,
      y: ((e.clientY - rect.top)  / rect.height) * 380,
    };
  };

  const handleNail = (idx, e) => {
    e.stopPropagation();
    if (tool === "polish") {
      setNailColors(prev => prev.map((c, i) => i === idx ? polishColor : c));
    } else {
      const pt = toSvgPt(e);
      setNailStickers(prev => prev.map((arr, i) => i === idx ? [...arr, { emoji: sticker, x: pt.x, y: pt.y }] : arr));
    }
  };

  const clearAll = () => {
    setNailColors(Array(10).fill("transparent"));
    setNailStickers(Array(10).fill(null).map(() => []));
  };

  const allNails = [...LEFT_NAIL_POS, ...RIGHT_NAIL_POS];

  return (
    <div className="nail-screen">
      <EmojiBackground />
      <div className="nail-inner">
        <h1 className="fashion-title">💅 Nail Studio 💅</h1>
        <p className="fashion-sub">Velg form, farge og klistremerker!</p>

        <div className="nail-layout">

          {/* ── CONTROLS ── */}
          <div className="nail-controls">
            <div className="nail-section-title">💅 Negleform</div>
            <div className="nail-shape-grid">
              {NAIL_SHAPES.map(s => (
                <button key={s.id} className={`nail-shape-btn ${shape === s.id ? "active" : ""}`} onClick={() => setShape(s.id)}>
                  {s.label}
                </button>
              ))}
            </div>

            <div className="nail-section-title" style={{ marginTop: "14px" }}>🖌️ Verktøy</div>
            <div className="nail-tool-row">
              <button className={`nail-tool-btn ${tool === "polish" ? "active" : ""}`} onClick={() => setTool("polish")}>💅 Neglelakk</button>
              <button className={`nail-tool-btn ${tool === "sticker" ? "active" : ""}`} onClick={() => setTool("sticker")}>⭐ Klistremerke</button>
            </div>

            {tool === "polish" && (
              <>
                <div className="nail-section-title" style={{ marginTop: "10px" }}>🎨 Farge</div>
                <div className="nail-color-grid">
                  {POLISH_COLORS.map((c, i) => (
                    <button
                      key={i}
                      className={`nail-color-swatch ${polishColor === c ? "selected" : ""}`}
                      style={{
                        background: c === "transparent"
                          ? "linear-gradient(135deg,#fff 45%,#f9a 45%)"
                          : c,
                        border: (c === "#ffffff" || c === "transparent") ? "1.5px solid #ddd" : "none",
                      }}
                      onClick={() => setPolishColor(c)}
                    />
                  ))}
                </div>
              </>
            )}

            {tool === "sticker" && (
              <>
                <div className="nail-section-title" style={{ marginTop: "10px" }}>✨ Klistremerke</div>
                <div className="nail-sticker-grid">
                  {NAIL_STICKERS.map((s, i) => (
                    <button key={i} className={`nail-sticker-btn ${sticker === s ? "active" : ""}`} onClick={() => setSticker(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}

            <button className="makeup-clear-btn" style={{ marginTop: "16px" }} onClick={clearAll}>🗑️ Fjern alt</button>
          </div>

          {/* ── HANDS SVG ── */}
          <div className="nail-hands-wrap">
            <svg ref={svgRef} viewBox="0 0 640 380" className="nail-hands-svg">

              {/* ══ LEFT HAND ══ */}
              {/* Palm */}
              <rect x="48"  y="252" width="178" height="120" rx="42" fill={SKIN} />
              <rect x="48"  y="252" width="178" height="12"  rx="8"  fill={SKIN_SH} opacity="0.35" />
              {/* Fingers */}
              <rect x="97"  y="144" width="20" height="116" rx="10" fill={SKIN} />
              <rect x="130" y="128" width="24" height="132" rx="12" fill={SKIN} />
              <rect x="165" y="136" width="22" height="124" rx="11" fill={SKIN} />
              <rect x="197" y="161" width="16" height="99"  rx="8"  fill={SKIN} />
              {/* Thumb */}
              <path d="M57,200 Q46,222 48,263 Q52,292 70,297 Q88,294 93,268 Q97,241 88,216 Q80,196 65,194 Z" fill={SKIN} />
              {/* Knuckles */}
              {[107,142,176,205].map((cx,i) => <ellipse key={i} cx={cx} cy={[202,195,200,214][i]} rx="8" ry="3.5" fill={SKIN_SH} opacity="0.3" />)}

              {/* ══ RIGHT HAND ══ */}
              <rect x="414" y="252" width="178" height="120" rx="42" fill={SKIN} />
              <rect x="414" y="252" width="178" height="12"  rx="8"  fill={SKIN_SH} opacity="0.35" />
              <rect x="523" y="144" width="20" height="116" rx="10" fill={SKIN} />
              <rect x="486" y="128" width="24" height="132" rx="12" fill={SKIN} />
              <rect x="453" y="136" width="22" height="124" rx="11" fill={SKIN} />
              <rect x="427" y="161" width="16" height="99"  rx="8"  fill={SKIN} />
              <path d="M583,200 Q594,222 592,263 Q588,292 570,297 Q552,294 547,268 Q543,241 552,216 Q560,196 575,194 Z" fill={SKIN} />
              {[533,498,464,435].map((cx,i) => <ellipse key={i} cx={cx} cy={[202,195,200,214][i]} rx="8" ry="3.5" fill={SKIN_SH} opacity="0.3" />)}

              {/* ══ NAILS ══ */}
              {allNails.map((pos, idx) => {
                const p  = nailPath(pos.cx, pos.baseY, pos.w, pos.h, shape);
                const gl = nailGleam(pos.cx, pos.baseY, pos.w, pos.h);
                const col = nailColors[idx];
                const stks = nailStickers[idx];
                return (
                  <g key={idx} onClick={(e) => handleNail(idx, e)} style={{ cursor: tool === "polish" ? "pointer" : "cell" }}>
                    <path d={p} fill={NAIL_BG} stroke={SKIN_SH} strokeWidth="0.8" />
                    {col && col !== "transparent" && <path d={p} fill={col} opacity="0.93" />}
                    <path d={gl} fill="rgba(255,255,255,0.5)" style={{ pointerEvents: "none" }} />
                    {stks.map((s, si) => (
                      <text key={si} x={s.x} y={s.y} fontSize="7" textAnchor="middle" dominantBaseline="middle" style={{ userSelect: "none", pointerEvents: "none" }}>{s.emoji}</text>
                    ))}
                    <path d={p} fill="transparent" />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <button className="start-btn fashion-back-btn" onClick={onBack}>← Tilbake</button>
      </div>
    </div>
  );
}

// ── Cute Play Hub ─────────────────────────────────────────────
const PLAY_CARDS = [
  { id: "game", emoji: "🎯", title: "Jeopardy Quiz", desc: "Spill quiz med lag og poeng.", tags: ["quiz", "kunnskap", "lag"] },
  { id: "fashion", emoji: "👗", title: "Outfit Stylist", desc: "Bytt hår, topp, bukse og sko.", tags: ["fashion", "style", "dressup"] },
  { id: "makeup", emoji: "💄", title: "Makeup Studio", desc: "Tegn makeup pa ansiktet med ulike verktøy.", tags: ["sminke", "makeup", "beauty"] },
  { id: "nails", emoji: "💅", title: "Nail Studio", desc: "Neglelakk, former og stickers pa negler.", tags: ["negler", "nail", "design"] },
  { id: "fortune", emoji: "🔮", title: "Fortune Spinner", desc: "Snurr hjulet for en cute challenge.", tags: ["lek", "spinn", "challenge"] },
  { id: "stickers", emoji: "🧷", title: "Sticker Book", desc: "Lag eget klistremerke-kort.", tags: ["sticker", "kreativ", "toy"] },
  { id: "quiz", emoji: "💕", title: "Friendship Quiz", desc: "Finn hvilken bestie-vibe du har.", tags: ["vennskap", "personlighet", "quiz"] },
];

function PlayHubScreen({ onOpen }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = PLAY_CARDS.filter((card) => {
    const hay = `${card.title} ${card.desc} ${card.tags.join(" ")}`.toLowerCase();
    return q.length === 0 || hay.includes(q);
  });

  const openCard = (id) => {
    if (id === "game") {
      onOpen("setup");
      return;
    }
    onOpen(id);
  };

  return (
    <div className="play-hub-screen">
      <EmojiBackground />
      <div className="play-hub-inner">
        <h1 className="fashion-title">🧸 Cute Play Hub 🧸</h1>
        <p className="fashion-sub">Sok etter jentete spill og leker du vil spille!</p>

        <input
          className="hub-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sok: quiz, makeup, negler, stickers..."
        />

        <div className="hub-grid">
          {filtered.map((card) => (
            <button key={card.id} className="hub-card" onClick={() => openCard(card.id)}>
              <span className="hub-card-emoji">{card.emoji}</span>
              <span className="hub-card-title">{card.title}</span>
              <span className="hub-card-desc">{card.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Fortune Spinner ───────────────────────────────────────────
const FORTUNE_TASKS = [
  "Si tre ting du elsker ved deg selv ✨",
  "Lag en mini catwalk i 10 sekunder 👠",
  "Velg dagens power-farge 🎨",
  "Gi en bestie et kompliment 💖",
  "Lag en ny negle-kombinasjon 💅",
  "Ta en glam-pause med highlighter 🌟",
  "Velg en ny challenge i Play Hub 🧸",
  "Dance break i 15 sekunder 💃",
];

function FortuneWheelScreen({ onBack }) {
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);

  const spin = () => {
    if (spinning) return;
    const idx = Math.floor(Math.random() * FORTUNE_TASKS.length);
    const step = 360 / FORTUNE_TASKS.length;
    const target = 360 * 6 + (360 - idx * step - step / 2);
    setSpinning(true);
    setSelectedIndex(null);
    setResult("Velger en challenge...");
    setAngle((prev) => prev + target);
    setTimeout(() => {
      setSelectedIndex(idx);
      setResult(FORTUNE_TASKS[idx]);
      setSpinning(false);
    }, 3200);
  };

  return (
    <div className="fortune-screen">
      <EmojiBackground />
      <div className="fortune-inner">
        <h1 className="fashion-title">🔮 Fortune Spinner 🔮</h1>
        <p className="fashion-sub">Snurr og fa en ny cute aktivitet!</p>

        <div className="wheel-wrap">
          <div className="wheel-pointer">▼</div>
          <div className="fortune-wheel" style={{ transform: `rotate(${angle}deg)` }}>
            {FORTUNE_TASKS.map((_, i) => (
              <span key={i} className="wheel-dot" style={{ transform: `rotate(${i * (360 / FORTUNE_TASKS.length)}deg) translateY(-132px)` }}>•</span>
            ))}
          </div>
        </div>

        <button className="start-btn" onClick={spin} disabled={spinning}>
          {spinning ? "✨ Spinner..." : "✨ Snurr hjulet"}
        </button>

        <div className="fortune-result-card">
          <p className="fortune-result-title">Dagens challenge</p>
          <p className="fortune-result">{result || "Trykk spin for en challenge"}</p>
        </div>

        <div className="fortune-task-list" aria-live="polite">
          {FORTUNE_TASKS.map((task, i) => (
            <div
              key={task}
              className={`fortune-task-item ${selectedIndex === i ? "selected" : ""}`}
            >
              <span className="fortune-task-dot">{selectedIndex === i ? "💖" : "•"}</span>
              <span>{task}</span>
            </div>
          ))}
        </div>
        <button className="start-btn fashion-back-btn" onClick={onBack}>← Tilbake</button>
      </div>
    </div>
  );
}

// ── Sticker Book ──────────────────────────────────────────────
const STICKER_ITEMS = ["⭐", "🌈", "🩷", "💎", "🌸", "🦋", "🎀", "✨", "🧸", "🍓", "🌺", "🫧"];

function StickerBookScreen({ onBack }) {
  const [active, setActive] = useState("⭐");
  const [size, setSize] = useState(26);
  const [placed, setPlaced] = useState([]);

  const placeSticker = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPlaced((prev) => [...prev, { emoji: active, x, y, size }]);
  };

  return (
    <div className="sticker-screen">
      <EmojiBackground />
      <div className="sticker-inner">
        <h1 className="fashion-title">🧷 Sticker Book 🧷</h1>
        <p className="fashion-sub">Lag ditt eget cute kort med klistremerker!</p>

        <div className="sticker-toolbar">
          {STICKER_ITEMS.map((s) => (
            <button key={s} className={`nail-sticker-btn ${active === s ? "active" : ""}`} onClick={() => setActive(s)}>{s}</button>
          ))}
          <label className="sticker-size-label">Storrelsen</label>
          <input className="brush-size-slider" type="range" min="14" max="52" step="1" value={size} onChange={(e) => setSize(parseInt(e.target.value, 10))} />
          <button className="makeup-clear-btn" onClick={() => setPlaced([])}>🗑️ Fjern alt</button>
        </div>

        <div className="sticker-board" onClick={placeSticker}>
          {placed.map((item, i) => (
            <span key={i} className="sticker-item" style={{ left: `${item.x}%`, top: `${item.y}%`, fontSize: `${item.size}px` }}>
              {item.emoji}
            </span>
          ))}
        </div>

        <button className="start-btn fashion-back-btn" onClick={onBack}>← Tilbake</button>
      </div>
    </div>
  );
}

// ── Friendship Quiz ───────────────────────────────────────────
const FRIENDSHIP_QUESTIONS = [
  {
    q: "Hva er drømmedagen med bestie?",
    options: [
      { t: "Spa + selfcare", s: 3 },
      { t: "Shopping + cafe", s: 2 },
      { t: "Gaming + chill", s: 1 },
      { t: "Dance + party", s: 4 },
    ],
  },
  {
    q: "Velg en power-accessory:",
    options: [
      { t: "Hårsløyfe", s: 2 },
      { t: "Glitterveske", s: 4 },
      { t: "Chunky sneakers", s: 1 },
      { t: "Diamant-hårklype", s: 3 },
    ],
  },
  {
    q: "Hvilken vibe matcher deg mest?",
    options: [
      { t: "Soft & sweet", s: 3 },
      { t: "Bold & glam", s: 4 },
      { t: "Cool & comfy", s: 1 },
      { t: "Cute & creative", s: 2 },
    ],
  },
];

function FriendshipQuizScreen({ onBack }) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);

  const pick = (s) => {
    setScore((v) => v + s);
    setIdx((v) => v + 1);
  };

  const restart = () => {
    setIdx(0);
    setScore(0);
  };

  const done = idx >= FRIENDSHIP_QUESTIONS.length;
  let result = "";
  if (done) {
    if (score <= 5) result = "Du er Cozy Bestie ☕: rolig, trygg og super-loyal.";
    else if (score <= 8) result = "Du er Cute Creator 🎨: kreativ, morsom og full av ideer.";
    else result = "Du er Glam Queen 👑: selvsikker, shiny og ikonisk!";
  }

  return (
    <div className="friendship-screen">
      <EmojiBackground />
      <div className="friendship-inner">
        <h1 className="fashion-title">💕 Friendship Quiz 💕</h1>
        {!done ? (
          <div className="friendship-card">
            <p className="friendship-step">Sporsmal {idx + 1} / {FRIENDSHIP_QUESTIONS.length}</p>
            <h3 className="friendship-question">{FRIENDSHIP_QUESTIONS[idx].q}</h3>
            <div className="friendship-options">
              {FRIENDSHIP_QUESTIONS[idx].options.map((o) => (
                <button key={o.t} className="friendship-option-btn" onClick={() => pick(o.s)}>{o.t}</button>
              ))}
            </div>
          </div>
        ) : (
          <div className="friendship-card">
            <p className="friendship-result">{result}</p>
            <button className="start-btn" onClick={restart}>Ta quizen igjen</button>
          </div>
        )}
        <button className="start-btn fashion-back-btn" onClick={onBack}>← Tilbake</button>
      </div>
    </div>
  );
}

export default App;

