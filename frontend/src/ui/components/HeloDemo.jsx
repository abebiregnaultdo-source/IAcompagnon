import { useEffect, useRef, useState } from "react";

/**
 * HeloDemo — démonstration animée de l'app dans un mockup téléphone.
 * Version web (landing page) : le téléphone est centré, une légende au-dessus
 * change au fil des scènes. L'app "joue" toute seule en boucle.
 * Design fidèle : couleurs, wordmark helō minuscule, statut réel "Je t'écoute".
 */

/* Jeu d'icônes outline uniformes (trait fin, couleur de charte) — remplace les
   emojis système disparates pour un rendu soigné et cohérent. */
const Ic = ({ name, size = 20, color = "#5a8299" }) => {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: color, strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    chat: <><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 9 9 0 0 1-4-1L3 20l1-5.5a8.5 8.5 0 1 1 17-3z" /></>,
    voice: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M6 11a6 6 0 0 0 12 0M12 17v4" /></>,
    book: <><path d="M4 5a2 2 0 0 1 2-2h9v16H6a2 2 0 0 0-2 2V5z" /><path d="M15 3h3a1 1 0 0 1 1 1v15" /></>,
    palette: <><circle cx="12" cy="12" r="9" /><circle cx="8.5" cy="9.5" r="1" /><circle cx="15" cy="8.5" r="1" /><circle cx="16" cy="13" r="1" /><path d="M12 21a3 3 0 0 0 0-6 2 2 0 0 1 0-4" /></>,
    candle: <><path d="M12 3s2 2 2 3.5S12 8 12 8s-2-1-2-1.5S12 3 12 3z" /><rect x="9" y="9" width="6" height="11" rx="1" /><path d="M12 9v-1" /></>,
    lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
    moon: <><path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z" /></>,
    compass: <><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" /></>,
    pen: <><path d="M4 20h16" /><path d="M14 4l6 6-9 9H5v-6l9-9z" /></>,
    brush: <><path d="M14 3l7 7-6 3-4-4 3-6z" /><path d="M11 13c-2 2-2 5-6 6 1-4 4-4 6-6z" /></>,
    scroll: <><path d="M8 3h9a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M5 6a2 2 0 0 0 4 0V4M9 8h7M9 12h7" /></>,
  };
  return <svg {...p}>{paths[name] || null}</svg>;
};

const CAPS = {
  deuils: ["Quel que soit votre deuil", "Un parent, un enfant, un conjoint, un proche. Ici, votre histoire a sa place."],
  chat: ["Un accompagnement qui reste", "Pas besoin de tout réexpliquer à chaque fois. helō vous connaît, et avance à vos côtés."],
  breath: ["Quand les mots ne suffisent plus", "Une respiration guidée, un ancrage, pour retrouver un peu de calme dans le corps."],
  voice: ["Parler, tout simplement", "Certains soirs, écrire est trop dur. Alors on peut aussi se parler."],
  library: ["Vous n'êtes jamais seul·e", "Lignes d'écoute, associations, poèmes, ressources fiables — de vraies aides, à portée de main."],
  create: ["Poser ce qu'on ne peut pas dire", "Une lettre, un dessin, un poème. Parfois, créer aide à traverser."],
};

const CONVO = [
  { who: "helo", t: "Bonjour Camille 🌸 Comment tu te sens ce matin ?", think: 900 },
  { who: "user", t: "La chambre est prête depuis des mois. Je n'arrive pas à y entrer." },
  { who: "helo", t: "Cette porte, c'est une des plus dures. Tu n'as pas à l'ouvrir aujourd'hui.", think: 1300 },
  { who: "user", t: "Les gens me disent « tu es jeune, ça reviendra ». Comme si on pouvait le remplacer." },
  { who: "helo", t: "Ce n'est pas « un » bébé. C'était le tien. Personne ne le remplace, et ton chagrin est légitime — même si les autres ne savent pas quoi en faire.", think: 1500 },
  { who: "user", t: "J'ai l'impression d'être seule à me souvenir de lui." },
  { who: "helo", t: "Ici, tu n'es pas seule à t'en souvenir. On peut lui garder une place, ensemble. Prends juste un moment pour respirer avec moi.", think: 1200, cta: true },
];

const DEUILS = [
  { ic: "🕊️", t: "Sophie — « Depuis que maman est partie… »", d: "La perte d'un parent" },
  { ic: "💗", t: "Camille — « Notre bébé n'a pas pu rester. »", d: "Le deuil périnatal" },
  { ic: "🤍", t: "Marc — « Ma femme, après 40 ans… »", d: "La perte d'un conjoint" },
  { ic: "🌱", t: "Lucie — « Mon frère, si jeune. »", d: "La perte d'un proche" },
];

const TOOLS = [
  { k: "write", ic: "pen", label: "Écrire", cap: "Une lettre à l'être disparu" },
  { k: "draw", ic: "brush", label: "Dessiner", cap: "Un dessin libre, sans mots" },
  { k: "poem", ic: "scroll", label: "Poème", cap: "Un poème pour accompagner" },
  { k: "color", ic: "palette", label: "Colorier", cap: "Un coloriage apaisant" },
];

export default function HeloDemo() {
  const [scene, setScene] = useState("deuils");
  const [cap, setCap] = useState(CAPS.deuils);
  const [msgs, setMsgs] = useState([]);        // messages affichés du chat
  const [typing, setTyping] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const [deuilsIn, setDeuilsIn] = useState(0); // combien de cas affichés
  const [breathPhase, setBreathPhase] = useState("Inspire…");
  const [voiceState, setVoiceState] = useState({ st: "Je vous écoute…", line: "« On va prendre un moment ensemble. »" });
  const [libIn, setLibIn] = useState(0);
  const [tool, setTool] = useState("write");
  const alive = useRef(true);
  const bodyRef = useRef(null);

  useEffect(() => {
    alive.current = true;
    const S = (ms) => new Promise((r) => setTimeout(r, ms));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    async function loop() {
      while (alive.current) {
        // 1) DIVERSITÉ
        setScene("deuils"); setCap(CAPS.deuils); setDeuilsIn(0);
        await S(500);
        for (let i = 1; i <= DEUILS.length && alive.current; i++) { setDeuilsIn(i); await S(650); }
        await S(1900);
        if (!alive.current) return;

        // 2) CHAT — Camille
        setScene("chat"); setCap(CAPS.chat); setMsgs([]); setShowCta(false);
        await S(500);
        for (const m of CONVO) {
          if (!alive.current) return;
          if (m.who === "helo" && m.think && !reduce) { setTyping(true); await S(m.think); setTyping(false); }
          setMsgs((prev) => [...prev, m]);
          if (bodyRef.current) requestAnimationFrame(() => { bodyRef.current.scrollTop = bodyRef.current.scrollHeight; });
          if (m.cta) { await S(400); setShowCta(true); }
          await S(m.who === "user" ? 800 : 1000);
        }
        await S(900);
        if (!alive.current) return;

        // 3) RESPIRATION (suite du chat)
        setScene("breath"); setCap(CAPS.breath);
        const seq = ["Inspire…", "Retiens…", "Expire…"];
        for (let i = 0; i < 3 && alive.current; i++) { setBreathPhase(seq[i % 3]); await S(2800); }
        if (!alive.current) return;

        // 4) VOCAL
        setScene("voice"); setCap(CAPS.voice);
        setVoiceState({ st: "Je vous écoute…", line: "« On va prendre un moment ensemble. »" });
        await S(3000);
        setVoiceState({ st: "Helō parle…", line: "« Respire avec moi. Inspire… expire… je suis là. »" });
        await S(3200);
        if (!alive.current) return;

        // 5) BIBLIOTHÈQUE
        setScene("library"); setCap(CAPS.library); setLibIn(0);
        await S(500);
        for (let i = 1; i <= 4 && alive.current; i++) { setLibIn(i); await S(480); }
        await S(2200);
        if (!alive.current) return;

        // 6) CRÉATIVITÉ — les 4 outils
        setScene("create"); setCap(CAPS.create); setTool("write");
        await S(1200);
        for (const t of TOOLS.slice(1)) { if (!alive.current) return; setTool(t.k); await S(1500); }
        await S(700);
      }
    }
    loop();
    return () => { alive.current = false; };
  }, []);

  const currentTool = TOOLS.find((t) => t.k === tool) || TOOLS[0];

  return (
    <div className="hd-wrap">
      <div className="hd-cap" key={cap[0]}>
        <div className="hd-cap-title">{cap[0]}</div>
        <div className="hd-cap-body">{cap[1]}</div>
      </div>

      <div className="hd-phone">
        <div className="hd-notch" />
        <div className="hd-screen">

          {/* DIVERSITÉ */}
          <div className={`hd-view hd-deuils ${scene === "deuils" ? "on" : ""}`}>
            <div className="hd-deuils-head">Chaque deuil est unique.<br />helō les accompagne tous.</div>
            <div className="hd-deuils-list">
              {DEUILS.map((d, i) => (
                <div key={d.t} className={`hd-dl ${scene === "deuils" && i < deuilsIn ? "in" : ""}`}>
                  <span className="hd-dl-ic">{d.ic}</span>
                  <div><b>{d.t}</b><i>{d.d}</i></div>
                </div>
              ))}
            </div>
          </div>

          {/* CHAT */}
          <div className={`hd-view hd-chat ${scene === "chat" ? "on" : ""}`}>
            <div className="hd-chat-head">
              <div className="hd-av">h</div>
              <div><div className="hd-nm">Helō</div><div className="hd-st">Je t'écoute</div></div>
            </div>
            <div className="hd-chat-body" ref={bodyRef}>
              {msgs.map((m, i) => (
                <div key={i} className={`hd-msg ${m.who} show`} dangerouslySetInnerHTML={{ __html: m.t }} />
              ))}
              {typing && <div className="hd-typing show"><i /><i /><i /></div>}
              {showCta && <div className="hd-breathe-cta show">🫧 Faire l'exercice guidé avec moi</div>}
            </div>
            <div className="hd-chat-input"><div className="hd-box">Écris ce qui te vient…</div><div className="hd-send">➤</div></div>
          </div>

          {/* RESPIRATION */}
          <div className={`hd-view hd-breath ${scene === "breath" ? "on" : ""}`}>
            <div className="hd-breath-title">Respire avec moi</div>
            <div className="hd-breath-sub">Cohérence cardiaque · 5 secondes</div>
            <div className="hd-circles"><span className="c1" /><span className="c2" /><span className="c3" /><span className="dot" /></div>
            <div className="hd-breath-phase">{breathPhase}</div>
          </div>

          {/* VOCAL */}
          <div className={`hd-view hd-voice ${scene === "voice" ? "on" : ""}`}>
            <div className="hd-orb"><span className="o1" /><span className="o2" /><span className="o3" />
              <div className="hd-wave"><b /><b /><b /><b /><b /><b /><b /></div>
            </div>
            <div className="hd-voice-status">{voiceState.st}</div>
            <div className="hd-voice-line">{voiceState.line}</div>
          </div>

          {/* BIBLIOTHÈQUE */}
          <div className={`hd-view hd-library ${scene === "library" ? "on" : ""}`}>
            <div className="hd-lib-head"><Ic name="book" size={18} /> Bibliothèque</div>
            <div className="hd-lib-tabs"><span className="lt on">Aide</span><span className="lt">Inspiration</span><span className="lt">Comprendre</span></div>
            <div className="hd-lib-list">
              {[
                { u: true, t: "SOS Amitié · 09 72 39 40 50", d: "Écoute 24h/24, 7j/7 — gratuit et anonyme" },
                { t: "Empreintes — Vivre son deuil", d: "Groupes de parole pour adultes endeuillés" },
                { t: "« Si… » — Rudyard Kipling", d: "Poème intégré, à lire dans l'app" },
                { t: "Comprendre le deuil — Psycom", d: "Ressource publique, fiable et gratuite" },
              ].map((c, i) => (
                <div key={c.t} className={`hd-lib-card ${c.u ? "urgent" : ""} ${scene === "library" && i < libIn ? "in" : ""}`}>
                  <div className="hd-lib-t">{c.t}</div><div className="hd-lib-d">{c.d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CRÉATIVITÉ */}
          <div className={`hd-view hd-create ${scene === "create" ? "on" : ""}`}>
            <div className="hd-create-head"><Ic name="palette" size={18} /> Créativité</div>
            <div className="hd-preview">
              {tool === "write" && <div className="hd-cp"><div className="hd-lines"><i /><i /><i /><i style={{ width: "60%" }} /></div><div className="hd-cp-cap">{currentTool.cap}</div></div>}
              {tool === "draw" && <div className="hd-cp"><svg viewBox="0 0 200 100" style={{ width: "72%" }}><path d="M20,80 C45,25 80,95 110,50 S170,20 185,65" fill="none" stroke="#7BA8C0" strokeWidth="4" strokeLinecap="round" /><circle cx="150" cy="38" r="8" fill="#C0A87B" opacity=".55" /></svg><div className="hd-cp-cap">{currentTool.cap}</div></div>}
              {tool === "poem" && <div className="hd-cp"><div className="hd-poem">« Ne pleure pas de mon départ,<br />je suis dans le vent, dans la clarté… »</div><div className="hd-cp-cap">{currentTool.cap}</div></div>}
              {tool === "color" && <div className="hd-cp"><div className="hd-mandala"><span /><span /><span /><span /></div><div className="hd-cp-cap">{currentTool.cap}</div></div>}
            </div>
            <div className="hd-tools">
              {TOOLS.map((t) => (
                <div key={t.k} className={`hd-ct ${tool === t.k ? "on" : ""}`}>
                  <span><Ic name={t.ic} size={18} color={tool === t.k ? "#3E6478" : "#7a8088"} /></span>{t.label}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
