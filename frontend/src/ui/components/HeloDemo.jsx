import { useEffect, useRef, useState } from "react";

/**
 * HeloDemo — démonstration animée de l'app dans un mockup téléphone.
 * Version web (landing page) : le téléphone est centré, une légende au-dessus
 * change au fil des scènes. L'app "joue" toute seule en boucle.
 * Design fidèle : couleurs, wordmark helō minuscule, statut réel "Je t'écoute".
 */

const CAPS = {
  deuils: ["Quel que soit votre deuil", "Perte d'un parent, d'un enfant, d'un conjoint, d'un proche — helō accompagne chaque histoire."],
  chat: ["L'histoire de Camille", "helō se souvient de ce qu'elle confie, séance après séance, et la guide au lieu de la questionner sans fin."],
  breath: ["Le corps, pas que les mots", "Cohérence cardiaque, ancrage, respiration : helō accompagne le système nerveux, en direct."],
  voice: ["Aussi par la voix", "Un échange vocal apaisant, pour les moments où écrire est trop dur."],
  library: ["La bibliothèque", "Lignes d'écoute, associations de deuil, poèmes, guides publics — de vraies aides à portée."],
  create: ["Créer pour déposer", "Écrire une lettre, dessiner, un poème, colorier : la création comme voie d'expression du chagrin."],
};

const CONVO = [
  { who: "helo", t: "Bonjour Camille 🌸 La dernière fois, tu me parlais de ce vide, depuis son départ. Comment se passent tes journées ?", think: 1100 },
  { who: "user", t: "Les nuits sont les pires. Tout me revient d'un coup." },
  { who: "helo", t: "Je t'entends. La nuit, il n'y a plus rien pour tenir le chagrin à distance — il remonte, entier.", think: 1300 },
  { who: "helo", t: "Ce que tu vis a un nom : les vagues du deuil. Ce n'est pas un recul — c'est ton cœur qui fait son chemin.", think: 1400 },
  { who: "user", t: "J'ai l'impression que ça ne s'arrêtera jamais." },
  { who: "helo", t: "Tu n'as pas à traverser cette nuit seule. On va poser un peu ce poids, ensemble.", think: 1200 },
  { who: "helo", t: "Pose une main sur ton cœur, l'autre sur ton ventre. On va respirer ensemble.", think: 1000, cta: true },
];

const DEUILS = [
  { ic: "🕊️", t: "Sophie — « Depuis que maman est partie… »", d: "La perte d'un parent" },
  { ic: "💗", t: "Camille — « Notre bébé n'a pas pu rester. »", d: "Le deuil périnatal" },
  { ic: "🤍", t: "Marc — « Ma femme, après 40 ans… »", d: "La perte d'un conjoint" },
  { ic: "🌱", t: "Lucie — « Mon frère, si jeune. »", d: "La perte d'un proche" },
];

const TOOLS = [
  { k: "write", ic: "✍️", label: "Écrire", cap: "Une lettre à l'être disparu" },
  { k: "draw", ic: "🖌️", label: "Dessiner", cap: "Un dessin libre, sans mots" },
  { k: "poem", ic: "📜", label: "Poème", cap: "Un poème pour accompagner" },
  { k: "color", ic: "🎨", label: "Colorier", cap: "Un coloriage apaisant" },
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
            <div className="hd-lib-head">📚 Bibliothèque</div>
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
            <div className="hd-create-head">🎨 Créativité</div>
            <div className="hd-preview">
              {tool === "write" && <div className="hd-cp"><div className="hd-lines"><i /><i /><i /><i style={{ width: "60%" }} /></div><div className="hd-cp-cap">{currentTool.cap}</div></div>}
              {tool === "draw" && <div className="hd-cp"><svg viewBox="0 0 200 100" style={{ width: "72%" }}><path d="M20,80 C45,25 80,95 110,50 S170,20 185,65" fill="none" stroke="#7BA8C0" strokeWidth="4" strokeLinecap="round" /><circle cx="150" cy="38" r="8" fill="#C0A87B" opacity=".55" /></svg><div className="hd-cp-cap">{currentTool.cap}</div></div>}
              {tool === "poem" && <div className="hd-cp"><div className="hd-poem">« Ne pleure pas de mon départ,<br />je suis dans le vent, dans la clarté… »</div><div className="hd-cp-cap">{currentTool.cap}</div></div>}
              {tool === "color" && <div className="hd-cp"><div className="hd-mandala"><span /><span /><span /><span /></div><div className="hd-cp-cap">{currentTool.cap}</div></div>}
            </div>
            <div className="hd-tools">
              {TOOLS.map((t) => (
                <div key={t.k} className={`hd-ct ${tool === t.k ? "on" : ""}`}><span>{t.ic}</span>{t.label}</div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
