import { useState, useEffect } from "react";
import {
  getMeditationSignedUrl,
  listUserMeditations,
  addMantra,
  removeMantra,
  getPersonalNotes,
  addPersonalNote,
  updatePersonalNote,
  deletePersonalNote,
  updateExtendedProfile,
} from "../lib/supabase";

/**
 * Page complète du profil spirituel/transgénérationnel
 * Affiche toutes les données : numérologie, astrologie, Fâ, lignées, mantras, etc.
 */
export default function SpiritualProfile({ user, onBack }) {
  const [activeTab, setActiveTab] = useState("overview");
  const profile = user?.extended_profile;

  if (!profile) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={onBack} style={styles.backButton}>← Retour</button>
          <h1 style={styles.title}>Mon Profil Spirituel</h1>
        </div>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>✨</div>
          <h2>Profil non encore créé</h2>
          <p>Discute avec Helō pour explorer ta numérologie, ton thème astral et tes lignées.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Vue d'ensemble", icon: "✨" },
    { id: "numerology", label: "Numérologie", icon: "🔢" },
    { id: "astrology", label: "Astrologie", icon: "⭐" },
    { id: "fa", label: "Fâ", icon: "🎯" },
    { id: "lineage", label: "Lignées", icon: "🌳" },
    { id: "mantras", label: "Mantras", icon: "💫" },
    { id: "meditations", label: "Méditations", icon: "🧘" },
    { id: "notes", label: "Notes", icon: "📝" },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>← Retour</button>
        <h1 style={styles.title}>Mon Profil Spirituel</h1>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : {})
            }}
          >
            <span>{tab.icon}</span>
            <span style={styles.tabLabel}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={styles.content}>
        {activeTab === "overview" && <OverviewTab profile={profile} />}
        {activeTab === "numerology" && <NumerologyTab profile={profile} userId={user?.id} />}
        {activeTab === "astrology" && <AstrologyTab profile={profile} />}
        {activeTab === "fa" && <FaTab profile={profile} />}
        {activeTab === "lineage" && <LineageTab profile={profile} />}
        {activeTab === "mantras" && <MantrasTab profile={profile} userId={user?.id} />}
        {activeTab === "meditations" && <MeditationsTab profile={profile} userId={user?.id} />}
        {activeTab === "notes" && <NotesTab userId={user?.id} />}
      </div>
    </div>
  );
}

// ============================================
// TAB COMPONENTS
// ============================================

function OverviewTab({ profile }) {
  const identite = profile.identite || {};
  const themes = profile.themes_therapeutiques || {};

  return (
    <div style={styles.tabContent}>
      {/* Identité */}
      <Section title="Identité">
        <div style={styles.identityCard}>
          <div style={styles.identityName}>
            {identite.prenoms_complets?.traditionnel && (
              <div style={styles.traditionalName}>
                {identite.prenoms_complets.traditionnel}
              </div>
            )}
            <div style={styles.fullName}>
              {identite.nom_complet_actuel || `${user?.first_name}`}
            </div>
          </div>
          {identite.naissance && (
            <div style={styles.birthInfo}>
              Née le {formatDate(identite.naissance.date)} à {identite.naissance.heure}
              <br />
              {identite.naissance.lieu}
            </div>
          )}
        </div>
      </Section>

      {/* Message Central */}
      {profile.message_central && (
        <Section title="Message Central">
          <div style={styles.centralMessage}>
            "{profile.message_central}"
          </div>
        </Section>
      )}

      {/* Leçon de Vie */}
      {themes.lecon_centrale && (
        <Section title="Leçon de Vie">
          <div style={styles.lessonCard}>
            {themes.lecon_centrale}
          </div>
        </Section>
      )}

      {/* Patterns */}
      {themes.patterns?.length > 0 && (
        <Section title="Patterns Identifiés">
          <div style={styles.patternsList}>
            {themes.patterns.map((p, i) => (
              <div key={i} style={styles.patternItem}>• {p}</div>
            ))}
          </div>
        </Section>
      )}

      {/* Ressources */}
      {themes.ressources?.length > 0 && (
        <Section title="Ressources Intérieures">
          <div style={styles.resourcesList}>
            {themes.ressources.map((r, i) => (
              <span key={i} style={styles.resourceChip}>{r}</span>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function NumerologyTab({ profile }) {
  const num = profile.numerologie || {};

  return (
    <div style={styles.tabContent}>
      <Section title="Chemin de Vie">
        <div style={styles.bigNumber}>{num.chemin_de_vie}</div>
        <div style={styles.numberMeaning}>{num.chemin_signification}</div>
      </Section>

      <div style={styles.numbersGrid}>
        <NumberCard
          label="Expression (naissance)"
          value={num.expression_naissance}
          description="Calculé avec tes prénoms de naissance"
        />
        <NumberCard
          label="Expression (actuel)"
          value={num.expression_actuelle}
          description="Calculé avec ton nom actuel"
        />
        <NumberCard
          label="Jour de naissance"
          value={num.jour_naissance}
          description="Énergie de ton jour"
        />
        <NumberCard
          label="Année Personnelle 2026"
          value={num.annee_personnelle_2026}
          description="Thème de ton année"
        />
      </div>

      {num.chiffres_porte_bonheur?.length > 0 && (
        <Section title="Chiffres Porte-Bonheur">
          <div style={styles.luckyNumbers}>
            {num.chiffres_porte_bonheur.map((n, i) => (
              <span key={i} style={styles.luckyNumber}>{n}</span>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function AstrologyTab({ profile }) {
  const astro = profile.astrologie || {};

  return (
    <div style={styles.tabContent}>
      <Section title="Thème Natal">
        <div style={styles.astroGrid}>
          <AstroCard icon="☀️" label="Soleil" value={astro.soleil} />
          <AstroCard icon="🌙" label="Lune" value={astro.lune} />
          <AstroCard icon="⬆️" label="Ascendant" value={astro.ascendant} />
        </div>
      </Section>

      {astro.noeud_nord && (
        <Section title="Noeud Nord (Mission Karmique)">
          <div style={styles.karmicCard}>
            <div style={styles.karmicValue}>{astro.noeud_nord}</div>
            <div style={styles.karmicExplanation}>
              Le Noeud Nord indique ce que ton âme est venue apprendre dans cette vie.
              Il représente ta zone de croissance, là où tu dois sortir de ta zone de confort.
            </div>
          </div>
        </Section>
      )}

      {profile.pierres?.length > 0 && (
        <Section title="Pierres Recommandées">
          <div style={styles.stonesList}>
            {profile.pierres.map((pierre, i) => (
              <div key={i} style={styles.stoneCard}>
                <span style={styles.stoneIcon}>💎</span>
                <span>{pierre}</span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function FaTab({ profile }) {
  const fa = profile.fa_divination || {};

  if (!fa.signe) {
    return (
      <div style={styles.tabContent}>
        <div style={styles.emptyTab}>
          <div style={styles.emptyIcon}>🎯</div>
          <p>Le Fâ n'a pas encore été consulté pour ton profil.</p>
          <p style={styles.faExplanation}>
            Le Fâ est un système de divination originaire du Golfe du Bénin,
            transmis par les Yoruba et pratiqué au Bénin, Togo, et Nigeria.
            Chaque personne possède un signe qui révèle sa nature profonde et son chemin de vie.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.tabContent}>
      <Section title="Ton Signe Fâ">
        <div style={styles.faCard}>
          <div style={styles.faSignName}>{fa.signe}</div>
          {fa.numero && <div style={styles.faNumber}>N° {fa.numero}</div>}
          <div style={styles.faSignification}>"{fa.signification}"</div>
        </div>
      </Section>

      <Section title="Qu'est-ce que le Fâ ?">
        <div style={styles.faInfo}>
          <p>
            Le Fâ (ou Ifá chez les Yoruba du Nigeria) est l'un des plus anciens
            systèmes de divination au monde. Il comprend 256 signes (Odu),
            chacun portant des messages, des interdits et des recommandations.
          </p>
          <p>
            Ton signe personnel, déterminé à la naissance ou lors d'une consultation,
            révèle ta mission de vie, tes forces et les défis que tu dois surmonter.
          </p>
        </div>
      </Section>

      <Section title="Lectures Recommandées">
        <div style={styles.booksList}>
          <BookCard
            title="Le Fa, une géomancie divinatoire du Golfe du Bénin"
            author="Bernard Maupoil"
            type="Académique"
          />
          <BookCard
            title="Ifá Divination"
            author="William Bascom"
            type="Ethnographie"
          />
        </div>
      </Section>
    </div>
  );
}

function LineageTab({ profile }) {
  const lignees = profile.lignees || {};
  const famille = profile.famille_proche || {};

  return (
    <div style={styles.tabContent}>
      {lignees.paternelle && (
        <Section title="Lignée Paternelle">
          <div style={styles.lineageCard}>
            <div style={styles.lineageName}>{lignees.paternelle.nom}</div>
            <div style={styles.lineageOrigin}>{lignees.paternelle.origine}</div>
            {lignees.paternelle.histoire && (
              <div style={styles.lineageHistory}>{lignees.paternelle.histoire}</div>
            )}
          </div>
        </Section>
      )}

      {lignees.maternelle && (
        <Section title="Lignée Maternelle">
          <div style={styles.lineageCard}>
            <div style={styles.lineageName}>
              {lignees.maternelle.nom_officiel}
              {lignees.maternelle.nom_souche && ` (${lignees.maternelle.nom_souche})`}
            </div>
            {lignees.maternelle.nom_traditionnel && (
              <div style={styles.traditionalLineage}>
                Nom traditionnel : {lignees.maternelle.nom_traditionnel}
              </div>
            )}
            <div style={styles.lineageOrigin}>{lignees.maternelle.origine}</div>
            {lignees.maternelle.statut && (
              <div style={styles.lineageStatus}>{lignees.maternelle.statut}</div>
            )}
            {lignees.maternelle.histoire && (
              <div style={styles.lineageHistory}>{lignees.maternelle.histoire}</div>
            )}
            {lignees.maternelle.ancetre_divin && (
              <div style={styles.divineAncestor}>
                Ancêtre divin : {lignees.maternelle.ancetre_divin}
              </div>
            )}
          </div>
        </Section>
      )}

      {famille.grand_mere_maternelle && (
        <Section title="Ange Gardien">
          <div style={styles.angelCard}>
            <div style={styles.angelIcon}>👼</div>
            <div style={styles.angelName}>
              {famille.grand_mere_maternelle.surnom || "Mamie"} {famille.grand_mere_maternelle.nom}
            </div>
            {famille.grand_mere_maternelle.lieu_naissance && (
              <div style={styles.angelOrigin}>
                Née à {famille.grand_mere_maternelle.lieu_naissance}
              </div>
            )}
            <div style={styles.angelRole}>
              {famille.grand_mere_maternelle.role_spirituel}
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}

function MantrasTab({ profile, userId }) {
  const [mantras, setMantras] = useState(profile.mantras || []);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [newMantra, setNewMantra] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const copyMantra = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleAddMantra = async () => {
    if (!newMantra.trim() || !userId) return;
    setSaving(true);
    try {
      await addMantra(userId, newMantra.trim());
      setMantras([...mantras, newMantra.trim()]);
      setNewMantra("");
      setIsAdding(false);
    } catch (err) {
      console.error("Erreur ajout mantra:", err);
      alert("Erreur lors de l'ajout du mantra");
    }
    setSaving(false);
  };

  const handleRemoveMantra = async (index) => {
    if (!userId) return;
    if (!confirm("Supprimer ce mantra ?")) return;
    setSaving(true);
    try {
      await removeMantra(userId, index);
      setMantras(mantras.filter((_, i) => i !== index));
    } catch (err) {
      console.error("Erreur suppression mantra:", err);
      alert("Erreur lors de la suppression");
    }
    setSaving(false);
  };

  return (
    <div style={styles.tabContent}>
      {profile.message_central && (
        <Section title="Message Central">
          <div style={styles.centralMessageLarge}>
            "{profile.message_central}"
          </div>
        </Section>
      )}

      <Section title="Mantras Personnels">
        {mantras.length === 0 ? (
          <p style={styles.emptyText}>Aucun mantra enregistré</p>
        ) : (
          <div style={styles.mantrasList}>
            {mantras.map((mantra, i) => (
              <div key={i} style={styles.mantraCard}>
                <div
                  style={{ flex: 1, cursor: "pointer" }}
                  onClick={() => copyMantra(mantra, i)}
                >
                  <div style={styles.mantraText}>"{mantra}"</div>
                  <div style={styles.mantraCopy}>
                    {copiedIndex === i ? "✓ Copié" : "Tap pour copier"}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveMantra(i)}
                  style={styles.deleteButton}
                  disabled={saving}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Ajouter un mantra */}
        {isAdding ? (
          <div style={styles.addMantraForm}>
            <textarea
              value={newMantra}
              onChange={(e) => setNewMantra(e.target.value)}
              placeholder="Écris ton nouveau mantra..."
              style={styles.mantraInput}
              rows={2}
            />
            <div style={styles.addMantraButtons}>
              <button
                onClick={() => { setIsAdding(false); setNewMantra(""); }}
                style={styles.cancelButton}
              >
                Annuler
              </button>
              <button
                onClick={handleAddMantra}
                style={styles.saveButton}
                disabled={saving || !newMantra.trim()}
              >
                {saving ? "..." : "Ajouter"}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setIsAdding(true)} style={styles.addButton}>
            + Ajouter un mantra
          </button>
        )}
      </Section>

      <Section title="Comment utiliser tes mantras">
        <div style={styles.howToUse}>
          <p>1. Choisis un mantra qui résonne avec toi aujourd'hui</p>
          <p>2. Répète-le 3 fois à voix haute ou dans ta tête</p>
          <p>3. Respire profondément entre chaque répétition</p>
          <p>4. Visualise l'énergie du mantra t'envelopper</p>
        </div>
      </Section>
    </div>
  );
}

function MeditationsTab({ profile, userId }) {
  const [playingIndex, setPlayingIndex] = useState(null);
  const [audioProgress, setAudioProgress] = useState({});
  const [audioUrls, setAudioUrls] = useState({});
  const [loadingAudio, setLoadingAudio] = useState({});

  // Méditations définies dans le profil (stockées dans Supabase Storage privé)
  // Structure: { id, title, description, duration, category, fileName }
  const profileMeditations = profile?.meditations || [];

  // Méditations par défaut (disponibles pour tous les utilisateurs avec extended_profile)
  const defaultMeditations = [
    {
      id: "liberation-transgenerationnelle",
      title: "Libération Transgénérationnelle",
      description: "Script d'hypnose pour libérer les croyances limitantes héritées et travailler avec le soutien de tes ancêtres",
      duration: "~15 min",
      category: "hypnose",
      fileName: "liberation-transgenerationnelle.mp3",
    },
    {
      id: "liberation-croyances",
      title: "Libération des Croyances Limitantes",
      description: "Connexion au vivant et transformation des croyances qui te limitent",
      duration: "~12 min",
      category: "hypnose",
      fileName: "liberation-croyances.mp3",
    }
  ];

  const allMeditations = [...defaultMeditations, ...profileMeditations];

  // Charger l'URL signée quand on clique sur play
  const loadAndPlayAudio = async (index, meditation) => {
    if (!userId) {
      alert("Tu dois être connecté(e) pour écouter les méditations.");
      return;
    }

    // Si déjà en lecture, pause
    if (playingIndex === index) {
      const audio = document.getElementById(`audio-${index}`);
      if (audio) audio.pause();
      setPlayingIndex(null);
      return;
    }

    // Si URL déjà chargée et valide
    if (audioUrls[index]) {
      playAudio(index);
      return;
    }

    // Charger l'URL signée depuis Supabase Storage
    setLoadingAudio(prev => ({ ...prev, [index]: true }));

    try {
      const signedUrl = await getMeditationSignedUrl(userId, meditation.fileName);

      if (signedUrl) {
        setAudioUrls(prev => ({ ...prev, [index]: signedUrl }));
        // Attendre que le DOM soit mis à jour avec la nouvelle URL
        // puis playAudio gèrera l'attente du chargement
        setTimeout(() => {
          playAudio(index);
          setLoadingAudio(prev => ({ ...prev, [index]: false }));
        }, 200);
      } else {
        alert("Cette méditation n'est pas encore disponible dans ton espace privé.\n\nAs-tu bien uploadé les fichiers dans Supabase Storage ?\nChemin: meditations/" + userId + "/" + meditation.fileName);
        setLoadingAudio(prev => ({ ...prev, [index]: false }));
      }
    } catch (error) {
      console.error("Erreur chargement audio:", error);
      alert("Erreur lors du chargement de l'audio: " + error.message);
      setLoadingAudio(prev => ({ ...prev, [index]: false }));
    }
  };

  const playAudio = (index) => {
    // Pause tous les autres audios
    document.querySelectorAll('audio').forEach(a => a.pause());

    const audio = document.getElementById(`audio-${index}`);
    if (audio) {
      // Pour les gros fichiers, on commence à jouer dès que possible (streaming)
      audio.play()
        .then(() => {
          setPlayingIndex(index);
          setLoadingAudio(prev => ({ ...prev, [index]: false }));
        })
        .catch(err => {
          console.error("Erreur lecture audio:", err);
          // Si l'audio n'est pas encore prêt, attendre un peu
          if (err.name === 'NotAllowedError') {
            alert("Clique à nouveau pour lancer la lecture (restriction navigateur).");
          } else {
            // Réessayer après un court délai
            setTimeout(() => {
              audio.play()
                .then(() => {
                  setPlayingIndex(index);
                  setLoadingAudio(prev => ({ ...prev, [index]: false }));
                })
                .catch(() => {
                  alert("Le fichier est en cours de chargement. Réessaie dans quelques secondes.");
                  setLoadingAudio(prev => ({ ...prev, [index]: false }));
                });
            }, 1000);
          }
        });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={styles.tabContent}>
      <Section title="Mes Méditations Guidées">
        <p style={styles.meditationIntro}>
          Tes méditations et scripts d'hypnose personnalisés, stockés de façon sécurisée.
          <span style={{ display: 'block', marginTop: '8px', fontSize: '0.85em', color: 'var(--color-accent)' }}>
            🔒 Accès privé - uniquement visible par toi
          </span>
        </p>

        {allMeditations.length === 0 ? (
          <div style={styles.emptyTab}>
            <div style={styles.emptyIcon}>🧘</div>
            <p>Aucune méditation enregistrée.</p>
            <p style={styles.emptyHint}>
              Parle avec Helō pour créer des méditations personnalisées.
            </p>
          </div>
        ) : (
          <div style={styles.meditationsList}>
            {allMeditations.map((meditation, index) => (
              <div key={meditation.id || index} style={styles.meditationCard}>
                <div style={styles.meditationHeader}>
                  <div style={styles.meditationIcon}>
                    {meditation.category === "hypnose" ? "🌀" : "🧘"}
                  </div>
                  <div style={styles.meditationInfo}>
                    <div style={styles.meditationTitle}>{meditation.title}</div>
                    <div style={styles.meditationMeta}>
                      <span style={styles.meditationCategory}>
                        {meditation.category === "hypnose" ? "Hypnose" : "Méditation"}
                      </span>
                      <span style={styles.meditationDuration}>{meditation.duration}</span>
                    </div>
                  </div>
                </div>

                {meditation.description && (
                  <p style={styles.meditationDescription}>{meditation.description}</p>
                )}

                {/* Lecteur audio sécurisé */}
                <div style={styles.audioPlayer}>
                  {audioUrls[index] && (
                    <audio
                      id={`audio-${index}`}
                      src={audioUrls[index]}
                      preload="auto"
                      onLoadedMetadata={(e) => {
                        // Dès que les métadonnées sont chargées, on peut jouer
                        setAudioProgress(prev => ({
                          ...prev,
                          [index]: {
                            current: 0,
                            duration: e.target.duration
                          }
                        }));
                      }}
                      onTimeUpdate={(e) => {
                        setAudioProgress(prev => ({
                          ...prev,
                          [index]: {
                            current: e.target.currentTime,
                            duration: e.target.duration
                          }
                        }));
                      }}
                      onEnded={() => setPlayingIndex(null)}
                      onError={(e) => {
                        console.error("Erreur audio:", e);
                        setLoadingAudio(prev => ({ ...prev, [index]: false }));
                      }}
                    />
                  )}
                  <button
                    style={{
                      ...styles.playButton,
                      opacity: loadingAudio[index] ? 0.7 : 1,
                    }}
                    onClick={() => loadAndPlayAudio(index, meditation)}
                    disabled={loadingAudio[index]}
                  >
                    {loadingAudio[index]
                      ? "⏳ Chargement..."
                      : playingIndex === index
                        ? "⏸️ Pause"
                        : "▶️ Écouter"
                    }
                  </button>
                  {audioProgress[index] && (
                    <div style={styles.progressInfo}>
                      {formatTime(audioProgress[index].current)} / {formatTime(audioProgress[index].duration || 0)}
                    </div>
                  )}
                  <div style={styles.progressBar}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: audioProgress[index]
                          ? `${(audioProgress[index].current / audioProgress[index].duration) * 100}%`
                          : '0%'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Comment utiliser ces méditations">
        <div style={styles.howToUse}>
          <p>1. Choisis un moment calme, sans interruption</p>
          <p>2. Installe-toi confortablement, allongé(e) ou assis(e)</p>
          <p>3. Mets des écouteurs pour une immersion complète</p>
          <p>4. Laisse-toi guider par la voix, sans forcer</p>
          <p>5. Après l'écoute, prends quelques instants avant de te lever</p>
        </div>
      </Section>
    </div>
  );
}

function NotesTab({ userId }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newNote, setNewNote] = useState({ title: "", content: "", tags: "" });
  const [saving, setSaving] = useState(false);

  // Charger les notes
  useEffect(() => {
    if (!userId) return;
    const loadNotes = async () => {
      try {
        const data = await getPersonalNotes(userId);
        setNotes(data || []);
      } catch (err) {
        console.error("Erreur chargement notes:", err);
      }
      setLoading(false);
    };
    loadNotes();
  }, [userId]);

  const handleAddNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    setSaving(true);
    try {
      const note = await addPersonalNote(userId, {
        title: newNote.title.trim(),
        content: newNote.content.trim(),
        tags: newNote.tags.split(",").map(t => t.trim()).filter(Boolean),
      });
      setNotes([note, ...notes]);
      setNewNote({ title: "", content: "", tags: "" });
      setIsAdding(false);
    } catch (err) {
      console.error("Erreur ajout note:", err);
      alert("Erreur lors de l'ajout");
    }
    setSaving(false);
  };

  const handleUpdateNote = async (noteId) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    setSaving(true);
    try {
      await updatePersonalNote(userId, noteId, {
        title: note.title,
        content: note.content,
        tags: note.tags,
      });
      setEditingId(null);
    } catch (err) {
      console.error("Erreur mise à jour:", err);
      alert("Erreur lors de la sauvegarde");
    }
    setSaving(false);
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm("Supprimer cette note ?")) return;
    try {
      await deletePersonalNote(userId, noteId);
      setNotes(notes.filter(n => n.id !== noteId));
    } catch (err) {
      console.error("Erreur suppression:", err);
      alert("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <div style={styles.tabContent}>
        <p style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>
          Chargement des notes...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.tabContent}>
      <Section title="Mes Notes Personnelles">
        <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", marginBottom: "var(--space-lg)" }}>
          Un espace pour noter tes exercices, réflexions, observations...
        </p>

        {/* Bouton ajouter ou formulaire */}
        {isAdding ? (
          <div style={styles.noteForm}>
            <input
              type="text"
              placeholder="Titre de la note"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              style={styles.noteInput}
            />
            <textarea
              placeholder="Contenu..."
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              style={styles.noteTextarea}
              rows={6}
            />
            <input
              type="text"
              placeholder="Tags (séparés par des virgules)"
              value={newNote.tags}
              onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
              style={styles.noteInput}
            />
            <div style={styles.addMantraButtons}>
              <button onClick={() => { setIsAdding(false); setNewNote({ title: "", content: "", tags: "" }); }} style={styles.cancelButton}>
                Annuler
              </button>
              <button onClick={handleAddNote} style={styles.saveButton} disabled={saving}>
                {saving ? "..." : "Enregistrer"}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setIsAdding(true)} style={styles.addButton}>
            + Ajouter une note
          </button>
        )}

        {/* Liste des notes */}
        {notes.length === 0 && !isAdding ? (
          <p style={styles.emptyText}>Aucune note enregistrée</p>
        ) : (
          <div style={styles.notesList}>
            {notes.map((note) => (
              <div key={note.id} style={styles.noteCard}>
                {editingId === note.id ? (
                  <>
                    <input
                      type="text"
                      value={note.title}
                      onChange={(e) => setNotes(notes.map(n => n.id === note.id ? { ...n, title: e.target.value } : n))}
                      style={styles.noteInput}
                    />
                    <textarea
                      value={note.content}
                      onChange={(e) => setNotes(notes.map(n => n.id === note.id ? { ...n, content: e.target.value } : n))}
                      style={styles.noteTextarea}
                      rows={6}
                    />
                    <div style={styles.addMantraButtons}>
                      <button onClick={() => setEditingId(null)} style={styles.cancelButton}>Annuler</button>
                      <button onClick={() => handleUpdateNote(note.id)} style={styles.saveButton} disabled={saving}>
                        {saving ? "..." : "Sauvegarder"}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={styles.noteHeader}>
                      <h4 style={styles.noteTitle}>{note.title}</h4>
                      <div style={styles.noteActions}>
                        <button onClick={() => setEditingId(note.id)} style={styles.editButton}>✎</button>
                        <button onClick={() => handleDeleteNote(note.id)} style={styles.deleteButton}>✕</button>
                      </div>
                    </div>
                    <div style={styles.noteContent}>{note.content}</div>
                    {note.tags?.length > 0 && (
                      <div style={styles.noteTags}>
                        {note.tags.map((tag, i) => (
                          <span key={i} style={styles.noteTag}>{tag}</span>
                        ))}
                      </div>
                    )}
                    <div style={styles.noteDate}>
                      {new Date(note.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}

function NumberCard({ label, value, description }) {
  return (
    <div style={styles.numberCard}>
      <div style={styles.numberValue}>{value || "—"}</div>
      <div style={styles.numberLabel}>{label}</div>
      {description && <div style={styles.numberDesc}>{description}</div>}
    </div>
  );
}

function AstroCard({ icon, label, value }) {
  return (
    <div style={styles.astroCard}>
      <div style={styles.astroIcon}>{icon}</div>
      <div style={styles.astroLabel}>{label}</div>
      <div style={styles.astroValue}>{value || "—"}</div>
    </div>
  );
}

function BookCard({ title, author, type }) {
  return (
    <div style={styles.bookCard}>
      <div style={styles.bookTitle}>{title}</div>
      <div style={styles.bookAuthor}>{author}</div>
      <div style={styles.bookType}>{type}</div>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// ============================================
// STYLES
// ============================================

const styles = {
  container: {
    minHeight: "100vh",
    background: "var(--color-background)",
    padding: "var(--space-lg)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-lg)",
    marginBottom: "var(--space-xl)",
  },
  backButton: {
    background: "none",
    border: "none",
    color: "var(--color-primary)",
    cursor: "pointer",
    fontSize: "var(--font-size-md)",
    padding: "var(--space-sm)",
  },
  title: {
    fontSize: "var(--font-size-xl)",
    fontWeight: "var(--font-weight-semibold)",
    margin: 0,
  },
  tabsContainer: {
    display: "flex",
    gap: "6px",
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    paddingBottom: "var(--space-md)",
    marginBottom: "var(--space-lg)",
    borderBottom: "1px solid var(--color-border)",
    padding: "4px 0 var(--space-md) 0",
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 10px",
    border: "none",
    background: "transparent",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    fontSize: "12px",
    color: "var(--color-text-secondary)",
    whiteSpace: "nowrap",
    transition: "var(--transition-fast)",
    flexShrink: 0,
    minWidth: "fit-content",
  },
  tabActive: {
    background: "var(--color-primary)",
    color: "white",
  },
  tabLabel: {
    display: "inline",
  },
  content: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  tabContent: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-xl)",
  },
  section: {
    marginBottom: "var(--space-lg)",
  },
  sectionTitle: {
    fontSize: "var(--font-size-md)",
    fontWeight: "var(--font-weight-semibold)",
    color: "var(--color-text-primary)",
    marginBottom: "var(--space-md)",
    paddingBottom: "var(--space-xs)",
    borderBottom: "2px solid var(--color-primary)",
    display: "inline-block",
  },
  emptyState: {
    textAlign: "center",
    padding: "var(--space-2xl)",
    color: "var(--color-text-secondary)",
  },
  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "var(--space-lg)",
  },
  emptyTab: {
    textAlign: "center",
    padding: "var(--space-xl)",
    color: "var(--color-text-secondary)",
  },
  emptyText: {
    color: "var(--color-text-tertiary)",
    fontStyle: "italic",
  },

  // Identity
  identityCard: {
    background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-xl)",
    color: "white",
    textAlign: "center",
  },
  traditionalName: {
    fontSize: "var(--font-size-2xl)",
    fontWeight: "var(--font-weight-bold)",
    marginBottom: "var(--space-xs)",
  },
  fullName: {
    fontSize: "var(--font-size-md)",
    opacity: 0.9,
  },
  birthInfo: {
    marginTop: "var(--space-md)",
    fontSize: "var(--font-size-sm)",
    opacity: 0.8,
  },

  // Central Message
  centralMessage: {
    fontSize: "var(--font-size-lg)",
    fontStyle: "italic",
    color: "var(--color-primary)",
    textAlign: "center",
    padding: "var(--space-lg)",
    background: "var(--color-surface-1)",
    borderRadius: "var(--radius-md)",
    borderLeft: "4px solid var(--color-primary)",
  },
  centralMessageLarge: {
    fontSize: "var(--font-size-xl)",
    fontStyle: "italic",
    color: "var(--color-primary)",
    textAlign: "center",
    padding: "var(--space-xl)",
    background: "linear-gradient(135deg, rgba(123, 168, 192, 0.1), rgba(138, 186, 168, 0.1))",
    borderRadius: "var(--radius-lg)",
  },

  // Lesson & Patterns
  lessonCard: {
    background: "var(--color-surface-2)",
    padding: "var(--space-lg)",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--font-size-md)",
    lineHeight: "var(--line-height-relaxed)",
  },
  patternsList: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-sm)",
  },
  patternItem: {
    padding: "var(--space-sm) var(--space-md)",
    background: "var(--color-surface-1)",
    borderRadius: "var(--radius-sm)",
    fontSize: "var(--font-size-sm)",
  },
  resourcesList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "var(--space-sm)",
  },
  resourceChip: {
    padding: "var(--space-xs) var(--space-md)",
    background: "var(--color-accent-calm)",
    borderRadius: "var(--radius-full)",
    fontSize: "var(--font-size-sm)",
  },

  // Numerology
  bigNumber: {
    fontSize: "5rem",
    fontWeight: "var(--font-weight-bold)",
    color: "var(--color-primary)",
    textAlign: "center",
  },
  numberMeaning: {
    textAlign: "center",
    fontSize: "var(--font-size-lg)",
    color: "var(--color-text-secondary)",
    marginTop: "var(--space-md)",
  },
  numbersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "var(--space-md)",
    marginTop: "var(--space-xl)",
  },
  numberCard: {
    background: "var(--color-surface-1)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-lg)",
    textAlign: "center",
  },
  numberValue: {
    fontSize: "var(--font-size-2xl)",
    fontWeight: "var(--font-weight-bold)",
    color: "var(--color-primary)",
  },
  numberLabel: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-primary)",
    marginTop: "var(--space-xs)",
  },
  numberDesc: {
    fontSize: "var(--font-size-xs)",
    color: "var(--color-text-tertiary)",
    marginTop: "var(--space-xs)",
  },
  luckyNumbers: {
    display: "flex",
    justifyContent: "center",
    gap: "var(--space-md)",
    flexWrap: "wrap",
  },
  luckyNumber: {
    width: "50px",
    height: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
    color: "white",
    borderRadius: "50%",
    fontSize: "var(--font-size-lg)",
    fontWeight: "var(--font-weight-bold)",
  },

  // Astrology
  astroGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "var(--space-md)",
  },
  astroCard: {
    background: "var(--color-surface-1)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-lg)",
    textAlign: "center",
  },
  astroIcon: {
    fontSize: "2rem",
    marginBottom: "var(--space-sm)",
  },
  astroLabel: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-tertiary)",
  },
  astroValue: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-primary)",
    marginTop: "var(--space-xs)",
    fontWeight: "var(--font-weight-medium)",
  },
  karmicCard: {
    background: "var(--color-surface-2)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-lg)",
  },
  karmicValue: {
    fontSize: "var(--font-size-lg)",
    fontWeight: "var(--font-weight-semibold)",
    color: "var(--color-primary)",
    marginBottom: "var(--space-md)",
  },
  karmicExplanation: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-secondary)",
    lineHeight: "var(--line-height-relaxed)",
  },
  stonesList: {
    display: "flex",
    gap: "var(--space-md)",
    flexWrap: "wrap",
  },
  stoneCard: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-sm)",
    padding: "var(--space-sm) var(--space-md)",
    background: "var(--color-surface-1)",
    borderRadius: "var(--radius-md)",
  },
  stoneIcon: {
    fontSize: "1.2rem",
  },

  // Fâ
  faCard: {
    background: "linear-gradient(135deg, #8B4513, #D2691E)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-xl)",
    color: "white",
    textAlign: "center",
  },
  faSignName: {
    fontSize: "var(--font-size-2xl)",
    fontWeight: "var(--font-weight-bold)",
    marginBottom: "var(--space-sm)",
  },
  faNumber: {
    fontSize: "var(--font-size-sm)",
    opacity: 0.8,
    marginBottom: "var(--space-md)",
  },
  faSignification: {
    fontSize: "var(--font-size-md)",
    fontStyle: "italic",
    lineHeight: "var(--line-height-relaxed)",
  },
  faInfo: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-secondary)",
    lineHeight: "var(--line-height-relaxed)",
  },
  faExplanation: {
    marginTop: "var(--space-md)",
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-tertiary)",
    lineHeight: "var(--line-height-relaxed)",
  },
  booksList: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-md)",
  },
  bookCard: {
    background: "var(--color-surface-1)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-md)",
  },
  bookTitle: {
    fontWeight: "var(--font-weight-semibold)",
    marginBottom: "var(--space-xs)",
  },
  bookAuthor: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-secondary)",
  },
  bookType: {
    fontSize: "var(--font-size-xs)",
    color: "var(--color-text-tertiary)",
    marginTop: "var(--space-xs)",
  },

  // Lineage
  lineageCard: {
    background: "var(--color-surface-1)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-lg)",
    borderLeft: "4px solid var(--color-primary)",
  },
  lineageName: {
    fontSize: "var(--font-size-lg)",
    fontWeight: "var(--font-weight-semibold)",
    color: "var(--color-text-primary)",
  },
  traditionalLineage: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-primary)",
    fontStyle: "italic",
    marginTop: "var(--space-xs)",
  },
  lineageOrigin: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-secondary)",
    marginTop: "var(--space-xs)",
  },
  lineageStatus: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-accent)",
    fontWeight: "var(--font-weight-medium)",
    marginTop: "var(--space-xs)",
  },
  lineageHistory: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-secondary)",
    marginTop: "var(--space-md)",
    lineHeight: "var(--line-height-relaxed)",
  },
  divineAncestor: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-primary)",
    fontWeight: "var(--font-weight-medium)",
    marginTop: "var(--space-md)",
    padding: "var(--space-sm)",
    background: "var(--color-surface-2)",
    borderRadius: "var(--radius-sm)",
  },
  angelCard: {
    background: "linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 182, 193, 0.1))",
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-xl)",
    textAlign: "center",
    border: "1px solid rgba(255, 215, 0, 0.3)",
  },
  angelIcon: {
    fontSize: "3rem",
    marginBottom: "var(--space-md)",
  },
  angelName: {
    fontSize: "var(--font-size-lg)",
    fontWeight: "var(--font-weight-semibold)",
  },
  angelOrigin: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-secondary)",
    marginTop: "var(--space-xs)",
  },
  angelRole: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-primary)",
    marginTop: "var(--space-sm)",
    fontStyle: "italic",
  },

  // Mantras
  mantrasList: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-md)",
  },
  mantraCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "var(--space-md)",
    background: "var(--color-surface-1)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-lg)",
    transition: "var(--transition-fast)",
    border: "1px solid var(--color-border)",
  },
  mantraText: {
    fontSize: "var(--font-size-md)",
    fontStyle: "italic",
    color: "var(--color-text-primary)",
    lineHeight: "var(--line-height-relaxed)",
  },
  mantraCopy: {
    fontSize: "var(--font-size-xs)",
    color: "var(--color-text-tertiary)",
    marginTop: "var(--space-sm)",
  },
  howToUse: {
    background: "var(--color-surface-2)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-lg)",
    fontSize: "var(--font-size-sm)",
    lineHeight: "var(--line-height-relaxed)",
  },

  // Meditations
  meditationIntro: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-secondary)",
    marginBottom: "var(--space-lg)",
    lineHeight: "var(--line-height-relaxed)",
  },
  meditationsList: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-lg)",
  },
  meditationCard: {
    background: "var(--color-surface-1)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-lg)",
    border: "1px solid var(--color-border)",
  },
  meditationHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "var(--space-md)",
    marginBottom: "var(--space-md)",
  },
  meditationIcon: {
    fontSize: "2rem",
    width: "50px",
    height: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, rgba(123, 168, 192, 0.2), rgba(138, 186, 168, 0.2))",
    borderRadius: "var(--radius-md)",
  },
  meditationInfo: {
    flex: 1,
  },
  meditationTitle: {
    fontSize: "var(--font-size-md)",
    fontWeight: "var(--font-weight-semibold)",
    color: "var(--color-text-primary)",
    marginBottom: "var(--space-xs)",
  },
  meditationMeta: {
    display: "flex",
    gap: "var(--space-md)",
    fontSize: "var(--font-size-xs)",
  },
  meditationCategory: {
    color: "var(--color-primary)",
    fontWeight: "var(--font-weight-medium)",
  },
  meditationDuration: {
    color: "var(--color-text-tertiary)",
  },
  meditationDescription: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-secondary)",
    marginBottom: "var(--space-md)",
    lineHeight: "var(--line-height-relaxed)",
  },
  audioPlayer: {
    background: "var(--color-surface-2)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-md)",
  },
  playButton: {
    padding: "var(--space-sm) var(--space-lg)",
    background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
    color: "white",
    border: "none",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    fontSize: "var(--font-size-sm)",
    fontWeight: "var(--font-weight-medium)",
    marginBottom: "var(--space-sm)",
  },
  progressInfo: {
    fontSize: "var(--font-size-xs)",
    color: "var(--color-text-tertiary)",
    marginBottom: "var(--space-xs)",
  },
  progressBar: {
    height: "4px",
    background: "var(--color-border)",
    borderRadius: "var(--radius-full)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, var(--color-primary), var(--color-accent))",
    transition: "width 0.1s linear",
  },
  audioNotConfigured: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-sm)",
    padding: "var(--space-md)",
    background: "var(--color-surface-2)",
    borderRadius: "var(--radius-md)",
    color: "var(--color-text-tertiary)",
    fontSize: "var(--font-size-sm)",
  },
  emptyHint: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-tertiary)",
    marginTop: "var(--space-sm)",
  },

  // Édition mantras et notes
  addButton: {
    width: "100%",
    padding: "var(--space-md)",
    background: "var(--color-surface-2)",
    border: "2px dashed var(--color-border)",
    borderRadius: "var(--radius-md)",
    color: "var(--color-primary)",
    fontSize: "var(--font-size-md)",
    cursor: "pointer",
    marginTop: "var(--space-md)",
    transition: "var(--transition-fast)",
  },
  addMantraForm: {
    marginTop: "var(--space-md)",
    padding: "var(--space-lg)",
    background: "var(--color-surface-1)",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--color-border)",
  },
  mantraInput: {
    width: "100%",
    padding: "var(--space-md)",
    fontSize: "var(--font-size-md)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    background: "var(--color-background)",
    color: "var(--color-text-primary)",
    resize: "vertical",
  },
  addMantraButtons: {
    display: "flex",
    gap: "var(--space-sm)",
    marginTop: "var(--space-md)",
    justifyContent: "flex-end",
  },
  cancelButton: {
    padding: "var(--space-sm) var(--space-lg)",
    background: "transparent",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    color: "var(--color-text-secondary)",
  },
  saveButton: {
    padding: "var(--space-sm) var(--space-lg)",
    background: "var(--color-primary)",
    border: "none",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    color: "white",
  },
  deleteButton: {
    background: "transparent",
    border: "none",
    color: "var(--color-text-tertiary)",
    cursor: "pointer",
    fontSize: "var(--font-size-md)",
    padding: "var(--space-xs)",
    opacity: 0.6,
    transition: "var(--transition-fast)",
  },
  editButton: {
    background: "transparent",
    border: "none",
    color: "var(--color-primary)",
    cursor: "pointer",
    fontSize: "var(--font-size-md)",
    padding: "var(--space-xs)",
  },

  // Notes
  noteForm: {
    marginBottom: "var(--space-lg)",
    padding: "var(--space-lg)",
    background: "var(--color-surface-1)",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--color-border)",
  },
  noteInput: {
    width: "100%",
    padding: "var(--space-md)",
    fontSize: "var(--font-size-md)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    background: "var(--color-background)",
    color: "var(--color-text-primary)",
    marginBottom: "var(--space-sm)",
  },
  noteTextarea: {
    width: "100%",
    padding: "var(--space-md)",
    fontSize: "var(--font-size-md)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    background: "var(--color-background)",
    color: "var(--color-text-primary)",
    marginBottom: "var(--space-sm)",
    resize: "vertical",
    fontFamily: "inherit",
    lineHeight: "var(--line-height-relaxed)",
  },
  notesList: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-md)",
    marginTop: "var(--space-lg)",
  },
  noteCard: {
    background: "var(--color-surface-1)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-lg)",
    border: "1px solid var(--color-border)",
  },
  noteHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "var(--space-md)",
  },
  noteTitle: {
    fontSize: "var(--font-size-md)",
    fontWeight: "var(--font-weight-semibold)",
    color: "var(--color-text-primary)",
    margin: 0,
  },
  noteActions: {
    display: "flex",
    gap: "var(--space-xs)",
  },
  noteContent: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-secondary)",
    lineHeight: "var(--line-height-relaxed)",
    whiteSpace: "pre-wrap",
  },
  noteTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "var(--space-xs)",
    marginTop: "var(--space-md)",
  },
  noteTag: {
    fontSize: "var(--font-size-xs)",
    padding: "var(--space-xs) var(--space-sm)",
    background: "var(--color-primary)",
    color: "white",
    borderRadius: "var(--radius-full)",
  },
  noteDate: {
    fontSize: "var(--font-size-xs)",
    color: "var(--color-text-tertiary)",
    marginTop: "var(--space-md)",
  },
};
