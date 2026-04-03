import { useState } from 'react';
import Button from './components/Button';
import { useDeviceDetection } from '../hooks/useDeviceDetection';

/**
 * Questionnaire spirituel pour collecter les données de profil
 * Module optionnel - accessible depuis les paramètres ou l'onboarding étendu
 */
export default function SpiritualQuestionnaire({ user, onComplete, onCancel }) {
  const device = useDeviceDetection();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // État du formulaire
  const [formData, setFormData] = useState({
    // Identité
    prenomsNaissance: '',
    nomNaissance: '',
    evolutionIdentite: [
      { type: 'naissance', nom: '', date: '' }
    ],

    // Naissance
    dateNaissance: '',
    heureNaissance: '',
    lieuNaissance: '',
    paysNaissance: '',

    // Lignées
    lignePaternelle: {
      origines: '',
      traditions: '',
      patterns: ''
    },
    ligneMaternelle: {
      origines: '',
      traditions: '',
      patterns: ''
    },

    // Pratiques spirituelles
    pratiques: [],
    autresPratiques: '',

    // Thèmes de vie
    themesVie: [],
    patternsFamiliaux: ''
  });

  const totalSteps = 5;

  // Liste des pratiques spirituelles courantes
  const PRATIQUES_OPTIONS = [
    { id: 'meditation', label: 'Méditation' },
    { id: 'yoga', label: 'Yoga' },
    { id: 'priere', label: 'Prière' },
    { id: 'tarot', label: 'Tarot / Oracles' },
    { id: 'astrologie', label: 'Astrologie' },
    { id: 'numerologie', label: 'Numérologie' },
    { id: 'reiki', label: 'Reiki / Énergétique' },
    { id: 'chamanisme', label: 'Chamanisme' },
    { id: 'fa', label: 'Fâ / Ifa' },
    { id: 'bouddhisme', label: 'Bouddhisme' },
    { id: 'kabbale', label: 'Kabbale' },
    { id: 'wicca', label: 'Wicca / Paganisme' }
  ];

  // Thèmes de vie courants
  const THEMES_OPTIONS = [
    { id: 'identite', label: 'Recherche d\'identité' },
    { id: 'abandon', label: 'Abandon / Rejet' },
    { id: 'confiance', label: 'Confiance en soi' },
    { id: 'relations', label: 'Relations amoureuses' },
    { id: 'famille', label: 'Famille / Héritage' },
    { id: 'argent', label: 'Rapport à l\'argent' },
    { id: 'travail', label: 'Vocation / Mission de vie' },
    { id: 'sante', label: 'Santé / Corps' },
    { id: 'creativite', label: 'Expression créative' },
    { id: 'spiritualite', label: 'Éveil spirituel' },
    { id: 'deuil', label: 'Deuil / Pertes' },
    { id: 'transgenerationnel', label: 'Schémas transgénérationnels' }
  ];

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedField = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const addEvolutionIdentite = () => {
    setFormData(prev => ({
      ...prev,
      evolutionIdentite: [
        ...prev.evolutionIdentite,
        { type: '', nom: '', date: '' }
      ]
    }));
  };

  const updateEvolutionIdentite = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.evolutionIdentite];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, evolutionIdentite: updated };
    });
  };

  const togglePratique = (id) => {
    setFormData(prev => ({
      ...prev,
      pratiques: prev.pratiques.includes(id)
        ? prev.pratiques.filter(p => p !== id)
        : [...prev.pratiques, id]
    }));
  };

  const toggleTheme = (id) => {
    setFormData(prev => ({
      ...prev,
      themesVie: prev.themesVie.includes(id)
        ? prev.themesVie.filter(t => t !== id)
        : [...prev.themesVie, id]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Préparer les données pour Supabase
      const spiritualData = {
        identite: {
          prenoms_naissance: formData.prenomsNaissance,
          nom_naissance: formData.nomNaissance,
          evolution: formData.evolutionIdentite.filter(e => e.nom)
        },
        naissance: {
          date: formData.dateNaissance,
          heure: formData.heureNaissance,
          lieu: formData.lieuNaissance,
          pays: formData.paysNaissance
        },
        lignees: {
          paternelle: formData.lignePaternelle,
          maternelle: formData.ligneMaternelle
        },
        pratiques: {
          liste: formData.pratiques,
          autres: formData.autresPratiques
        },
        themes_vie: {
          liste: formData.themesVie,
          patterns_familiaux: formData.patternsFamiliaux
        },
        completed_at: new Date().toISOString()
      };

      // Appeler l'API pour sauvegarder
      const response = await fetch('https://helo-backend.onrender.com/api/profile/spiritual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          spiritual_data: spiritualData
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      onComplete(spiritualData);
    } catch (err) {
      console.error('Error saving spiritual data:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return renderIdentiteStep();
      case 2:
        return renderNaissanceStep();
      case 3:
        return renderLigneesStep();
      case 4:
        return renderPratiquesStep();
      case 5:
        return renderThemesStep();
      default:
        return null;
    }
  };

  const renderIdentiteStep = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <h2 style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--space-sm)' }}>
        🌟 Votre Identité
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
        L'identité est un élément clé en numérologie. Les changements de nom portent une signification.
      </p>

      <div>
        <label style={labelStyle}>Prénoms de naissance (dans l'ordre)</label>
        <input
          type="text"
          value={formData.prenomsNaissance}
          onChange={(e) => updateField('prenomsNaissance', e.target.value)}
          placeholder="Ex: Marie Claire Sophie"
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Nom de naissance</label>
        <input
          type="text"
          value={formData.nomNaissance}
          onChange={(e) => updateField('nomNaissance', e.target.value)}
          placeholder="Ex: Dupont"
          style={inputStyle}
        />
      </div>

      <div style={{ marginTop: 'var(--space-md)' }}>
        <label style={labelStyle}>Évolution de l'identité</label>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-sm)' }}>
          Ajoutez les changements de nom (mariage, adjonction, naturalisation, etc.)
        </p>

        {formData.evolutionIdentite.map((evolution, index) => (
          <div key={index} style={{
            padding: 'var(--space-md)',
            background: 'var(--color-surface-2)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-sm)'
          }}>
            <select
              value={evolution.type}
              onChange={(e) => updateEvolutionIdentite(index, 'type', e.target.value)}
              style={{ ...inputStyle, marginBottom: 'var(--space-sm)' }}
            >
              <option value="">Type de changement</option>
              <option value="naissance">Nom de naissance</option>
              <option value="adjonction">Adjonction</option>
              <option value="mariage">Mariage</option>
              <option value="divorce">Retour au nom de jeune fille</option>
              <option value="naturalisation">Naturalisation</option>
              <option value="autre">Autre</option>
            </select>

            <input
              type="text"
              value={evolution.nom}
              onChange={(e) => updateEvolutionIdentite(index, 'nom', e.target.value)}
              placeholder="Nom complet après ce changement"
              style={{ ...inputStyle, marginBottom: 'var(--space-sm)' }}
            />

            <input
              type="text"
              value={evolution.date}
              onChange={(e) => updateEvolutionIdentite(index, 'date', e.target.value)}
              placeholder="Date approximative (ex: 2015)"
              style={inputStyle}
            />
          </div>
        ))}

        <button
          onClick={addEvolutionIdentite}
          style={{
            padding: 'var(--space-sm)',
            border: '1px dashed var(--color-border)',
            background: 'transparent',
            color: 'var(--color-primary)',
            cursor: 'pointer',
            borderRadius: 'var(--radius-md)',
            width: '100%'
          }}
        >
          + Ajouter un changement de nom
        </button>
      </div>
    </div>
  );

  const renderNaissanceStep = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <h2 style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--space-sm)' }}>
        🌙 Naissance
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
        Ces informations sont essentielles pour le calcul astrologique et numérologique.
      </p>

      <div>
        <label style={labelStyle}>Date de naissance</label>
        <input
          type="date"
          value={formData.dateNaissance}
          onChange={(e) => updateField('dateNaissance', e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Heure de naissance (si connue)</label>
        <input
          type="time"
          value={formData.heureNaissance}
          onChange={(e) => updateField('heureNaissance', e.target.value)}
          style={inputStyle}
        />
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>
          L'heure exacte permet un thème natal précis
        </p>
      </div>

      <div>
        <label style={labelStyle}>Ville de naissance</label>
        <input
          type="text"
          value={formData.lieuNaissance}
          onChange={(e) => updateField('lieuNaissance', e.target.value)}
          placeholder="Ex: Paris, Libreville, Montréal"
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Pays de naissance</label>
        <input
          type="text"
          value={formData.paysNaissance}
          onChange={(e) => updateField('paysNaissance', e.target.value)}
          placeholder="Ex: France, Gabon, Canada"
          style={inputStyle}
        />
      </div>
    </div>
  );

  const renderLigneesStep = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <h2 style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--space-sm)' }}>
        🌳 Lignées Familiales
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
        L'histoire familiale influence notre chemin de vie. Partagez ce que vous savez.
      </p>

      <div style={{
        padding: 'var(--space-lg)',
        background: 'linear-gradient(135deg, rgba(123, 168, 192, 0.1), rgba(123, 168, 192, 0.05))',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)'
      }}>
        <h3 style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-md)' }}>
          Lignée Paternelle
        </h3>

        <div style={{ marginBottom: 'var(--space-md)' }}>
          <label style={labelStyle}>Origines géographiques / ethniques</label>
          <input
            type="text"
            value={formData.lignePaternelle.origines}
            onChange={(e) => updateNestedField('lignePaternelle', 'origines', e.target.value)}
            placeholder="Ex: Béninois, Fon"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 'var(--space-md)' }}>
          <label style={labelStyle}>Traditions spirituelles</label>
          <input
            type="text"
            value={formData.lignePaternelle.traditions}
            onChange={(e) => updateNestedField('lignePaternelle', 'traditions', e.target.value)}
            placeholder="Ex: Vodoun, Christianisme, Islam"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Schémas familiaux observés</label>
          <textarea
            value={formData.lignePaternelle.patterns}
            onChange={(e) => updateNestedField('lignePaternelle', 'patterns', e.target.value)}
            placeholder="Ex: Figures paternelles absentes, secrets de famille..."
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
          />
        </div>
      </div>

      <div style={{
        padding: 'var(--space-lg)',
        background: 'linear-gradient(135deg, rgba(138, 186, 168, 0.1), rgba(138, 186, 168, 0.05))',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)'
      }}>
        <h3 style={{ color: 'var(--color-accent)', marginBottom: 'var(--space-md)' }}>
          Lignée Maternelle
        </h3>

        <div style={{ marginBottom: 'var(--space-md)' }}>
          <label style={labelStyle}>Origines géographiques / ethniques</label>
          <input
            type="text"
            value={formData.ligneMaternelle.origines}
            onChange={(e) => updateNestedField('ligneMaternelle', 'origines', e.target.value)}
            placeholder="Ex: Gabonais, Fang"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 'var(--space-md)' }}>
          <label style={labelStyle}>Traditions spirituelles</label>
          <input
            type="text"
            value={formData.ligneMaternelle.traditions}
            onChange={(e) => updateNestedField('ligneMaternelle', 'traditions', e.target.value)}
            placeholder="Ex: Bwiti, Catholicisme"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Schémas familiaux observés</label>
          <textarea
            value={formData.ligneMaternelle.patterns}
            onChange={(e) => updateNestedField('ligneMaternelle', 'patterns', e.target.value)}
            placeholder="Ex: Femmes fortes, histoires de migration..."
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
          />
        </div>
      </div>
    </div>
  );

  const renderPratiquesStep = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <h2 style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--space-sm)' }}>
        ✨ Pratiques Spirituelles
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
        Quelles pratiques résonnent avec vous ? (Sélection multiple)
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 'var(--space-sm)'
      }}>
        {PRATIQUES_OPTIONS.map(pratique => (
          <button
            key={pratique.id}
            onClick={() => togglePratique(pratique.id)}
            style={{
              padding: 'var(--space-md)',
              border: formData.pratiques.includes(pratique.id)
                ? '2px solid var(--color-primary)'
                : '1px solid var(--color-border)',
              background: formData.pratiques.includes(pratique.id)
                ? 'rgba(123, 168, 192, 0.15)'
                : 'var(--color-surface-1)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-sm)',
              transition: 'var(--transition-fast)'
            }}
          >
            {pratique.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 'var(--space-md)' }}>
        <label style={labelStyle}>Autres pratiques</label>
        <textarea
          value={formData.autresPratiques}
          onChange={(e) => updateField('autresPratiques', e.target.value)}
          placeholder="Décrivez d'autres pratiques spirituelles que vous suivez..."
          style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
        />
      </div>
    </div>
  );

  const renderThemesStep = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <h2 style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--space-sm)' }}>
        🎯 Thèmes de Vie
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
        Quels thèmes reviennent régulièrement dans votre vie ? (Sélection multiple)
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 'var(--space-sm)'
      }}>
        {THEMES_OPTIONS.map(theme => (
          <button
            key={theme.id}
            onClick={() => toggleTheme(theme.id)}
            style={{
              padding: 'var(--space-md)',
              border: formData.themesVie.includes(theme.id)
                ? '2px solid var(--color-accent)'
                : '1px solid var(--color-border)',
              background: formData.themesVie.includes(theme.id)
                ? 'rgba(138, 186, 168, 0.15)'
                : 'var(--color-surface-1)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-sm)',
              transition: 'var(--transition-fast)'
            }}
          >
            {theme.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 'var(--space-md)' }}>
        <label style={labelStyle}>Schémas familiaux à libérer</label>
        <textarea
          value={formData.patternsFamiliaux}
          onChange={(e) => updateField('patternsFamiliaux', e.target.value)}
          placeholder="Quels schémas répétitifs observez-vous dans votre famille que vous souhaitez transformer ?"
          style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
        />
      </div>
    </div>
  );

  // Styles communs
  const labelStyle = {
    display: 'block',
    marginBottom: 'var(--space-xs)',
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--font-size-sm)'
  };

  const inputStyle = {
    width: '100%',
    padding: 'var(--space-md)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-surface-1)',
    color: 'var(--color-text-primary)',
    fontSize: 'var(--font-size-md)',
    boxSizing: 'border-box'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-background)',
      padding: device.isMobile ? 'var(--space-md)' : 'var(--space-xl)'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {/* Header avec progression */}
        <div style={{
          marginBottom: 'var(--space-xl)',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: 'var(--font-size-xl)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-md)'
          }}>
            Module Spiritualité
          </h1>

          {/* Barre de progression */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--space-sm)',
            marginBottom: 'var(--space-md)'
          }}>
            {[1, 2, 3, 4, 5].map(s => (
              <div
                key={s}
                style={{
                  width: '40px',
                  height: '4px',
                  borderRadius: '2px',
                  background: s <= step ? 'var(--color-primary)' : 'var(--color-border)'
                }}
              />
            ))}
          </div>
          <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
            Étape {step} sur {totalSteps}
          </p>
        </div>

        {/* Contenu de l'étape */}
        <div style={{
          background: 'var(--color-surface-1)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-xl)',
          marginBottom: 'var(--space-xl)'
        }}>
          {renderStep()}
        </div>

        {/* Erreur */}
        {error && (
          <div style={{
            padding: 'var(--space-md)',
            background: 'rgba(220, 53, 69, 0.1)',
            border: '1px solid rgba(220, 53, 69, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#dc3545',
            marginBottom: 'var(--space-md)'
          }}>
            {error}
          </div>
        )}

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 'var(--space-md)'
        }}>
          {step > 1 ? (
            <Button
              variant="secondary"
              onClick={() => setStep(step - 1)}
              style={{ flex: 1 }}
            >
              ← Précédent
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={onCancel}
              style={{ flex: 1 }}
            >
              Annuler
            </Button>
          )}

          {step < totalSteps ? (
            <Button
              onClick={() => setStep(step + 1)}
              style={{ flex: 1 }}
            >
              Suivant →
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))'
              }}
            >
              {loading ? 'Enregistrement...' : 'Terminer ✓'}
            </Button>
          )}
        </div>

        {/* Note de confidentialité */}
        <p style={{
          textAlign: 'center',
          color: 'var(--color-text-tertiary)',
          fontSize: 'var(--font-size-xs)',
          marginTop: 'var(--space-xl)'
        }}>
          🔒 Ces informations sont confidentielles et servent uniquement à personnaliser votre accompagnement spirituel.
        </p>
      </div>
    </div>
  );
}
