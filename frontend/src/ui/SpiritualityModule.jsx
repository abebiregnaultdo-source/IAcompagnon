import { useState, useEffect } from 'react';
import Button from './components/Button';
import SpiritualQuestionnaire from './SpiritualQuestionnaire';
import { useDeviceDetection } from '../hooks/useDeviceDetection';
import {
  calculateCheminDeVie,
  calculateAnneePersonnelle,
  calculateExpression,
  calculateIntime,
  calculateRealisation,
  calculateCompatibility,
  CHEMIN_INTERPRETATIONS,
  ANNEE_INTERPRETATIONS
} from '../utils/numerology';

/**
 * Module Spiritualité - Point d'entrée principal
 * Gère l'affichage des données spirituelles et l'accès au questionnaire
 */
export default function SpiritualityModule({ user, onBack }) {
  const device = useDeviceDetection();
  const [view, setView] = useState('overview'); // 'overview', 'questionnaire', 'numerology', 'calculator'
  const [spiritualData, setSpiritualData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numerologyResults, setNumerologyResults] = useState(null);

  // État pour le calculateur de compatibilité
  const [partnerData, setPartnerData] = useState({
    prenom: '',
    nom: '',
    dateNaissance: ''
  });
  const [compatibilityResult, setCompatibilityResult] = useState(null);

  useEffect(() => {
    loadSpiritualData();
  }, [user]);

  const loadSpiritualData = async () => {
    if (!user?.id) return;

    try {
      // Charger depuis extended_profile
      const response = await fetch(
        `https://helo-backend.onrender.com/api/profile/${user.id}/extended`
      );

      if (response.ok) {
        const data = await response.json();
        setSpiritualData(data.spiritual || null);

        // Calculer la numérologie si les données de naissance existent
        if (data.spiritual?.naissance?.date) {
          calculateNumerology(data.spiritual);
        }
      }
    } catch (error) {
      console.error('Error loading spiritual data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNumerology = (data) => {
    if (!data?.naissance?.date) return;

    try {
      const dateNaissance = data.naissance.date;
      const nomComplet = data.identite
        ? `${data.identite.prenoms_naissance || ''} ${data.identite.nom_naissance || ''}`
        : '';

      const results = {
        cheminDeVie: null,
        anneePersonnelle: null,
        expression: null,
        intime: null,
        realisation: null
      };

      // Chemin de vie
      const cheminResult = calculateCheminDeVie(dateNaissance);
      const cheminFinal = cheminResult.chemin.includes('/')
        ? cheminResult.chemin.split('/')[1]
        : cheminResult.chemin;

      results.cheminDeVie = {
        nombre: cheminResult.chemin,
        interpretation: CHEMIN_INTERPRETATIONS[cheminFinal],
        details: cheminResult.details
      };

      // Année personnelle
      const currentYear = new Date().getFullYear();
      const anneeResult = calculateAnneePersonnelle(dateNaissance, currentYear);
      results.anneePersonnelle = {
        annee: currentYear,
        nombre: anneeResult.anneePersonnelle,
        interpretation: ANNEE_INTERPRETATIONS[anneeResult.anneePersonnelle],
        details: anneeResult.details
      };

      // Calculs basés sur le nom (si disponible)
      if (nomComplet.trim()) {
        results.expression = calculateExpression(nomComplet);
        results.intime = calculateIntime(nomComplet);
        results.realisation = calculateRealisation(nomComplet);
      }

      setNumerologyResults(results);
    } catch (error) {
      console.error('Error calculating numerology:', error);
    }
  };

  const handleQuestionnaireComplete = (data) => {
    setSpiritualData(data);
    calculateNumerology(data);
    setView('overview');
  };

  const calculateCompatibilityHandler = () => {
    if (!partnerData.dateNaissance || !numerologyResults?.cheminDeVie) return;

    try {
      const partnerChemin = calculateCheminDeVie(partnerData.dateNaissance);
      const result = calculateCompatibility(
        numerologyResults.cheminDeVie.nombre,
        partnerChemin.chemin
      );

      setCompatibilityResult({
        ...result,
        partnerChemin: partnerChemin.chemin,
        partnerNom: `${partnerData.prenom} ${partnerData.nom}`.trim() || 'Partenaire'
      });
    } catch (error) {
      console.error('Error calculating compatibility:', error);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-background)'
      }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Chargement...</p>
      </div>
    );
  }

  if (view === 'questionnaire') {
    return (
      <SpiritualQuestionnaire
        user={user}
        onComplete={handleQuestionnaireComplete}
        onCancel={() => setView('overview')}
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-background)',
      padding: device.isMobile ? 'var(--space-md)' : 'var(--space-xl)'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-xl)'
        }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-xs)'
            }}
          >
            ← Retour
          </button>
          <h1 style={{
            fontSize: 'var(--font-size-xl)',
            color: 'var(--color-text-primary)'
          }}>
            🔮 Spiritualité
          </h1>
          <div style={{ width: '60px' }} />
        </div>

        {/* Navigation tabs */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-sm)',
          marginBottom: 'var(--space-xl)',
          overflowX: 'auto'
        }}>
          {['overview', 'numerology', 'calculator'].map(tab => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              style={{
                padding: 'var(--space-sm) var(--space-md)',
                border: view === tab ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                background: view === tab ? 'rgba(123, 168, 192, 0.1)' : 'transparent',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                color: view === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                whiteSpace: 'nowrap'
              }}
            >
              {tab === 'overview' && '📋 Aperçu'}
              {tab === 'numerology' && '🔢 Numérologie'}
              {tab === 'calculator' && '💕 Compatibilité'}
            </button>
          ))}
        </div>

        {/* Content based on view */}
        {view === 'overview' && renderOverview()}
        {view === 'numerology' && renderNumerology()}
        {view === 'calculator' && renderCompatibilityCalculator()}
      </div>
    </div>
  );

  function renderOverview() {
    if (!spiritualData) {
      return (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-2xl)',
          background: 'var(--color-surface-1)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <p style={{
            fontSize: '4rem',
            marginBottom: 'var(--space-lg)'
          }}>
            ✨
          </p>
          <h2 style={{
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-md)'
          }}>
            Découvrez votre profil spirituel
          </h2>
          <p style={{
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-xl)'
          }}>
            Répondez au questionnaire pour recevoir une analyse numérologique
            et spirituelle personnalisée.
          </p>
          <Button onClick={() => setView('questionnaire')}>
            Commencer le questionnaire
          </Button>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        {/* Résumé numérologique */}
        {numerologyResults?.cheminDeVie && (
          <div style={{
            padding: 'var(--space-xl)',
            background: 'linear-gradient(135deg, rgba(123, 168, 192, 0.15), rgba(138, 186, 168, 0.1))',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 'var(--space-md)'
            }}>
              <div>
                <h3 style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--space-xs)' }}>
                  Chemin de Vie
                </h3>
                <p style={{
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  color: 'var(--color-primary)'
                }}>
                  {numerologyResults.cheminDeVie.nombre}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  Année {numerologyResults.anneePersonnelle?.annee}
                </p>
                <p style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: 'var(--color-primary)'
                }}>
                  {numerologyResults.anneePersonnelle?.nombre}
                </p>
              </div>
            </div>

            {numerologyResults.cheminDeVie.interpretation && (
              <>
                <p style={{
                  fontSize: 'var(--font-size-lg)',
                  color: 'var(--color-primary)',
                  marginBottom: 'var(--space-sm)'
                }}>
                  {numerologyResults.cheminDeVie.interpretation.titre}
                </p>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  {numerologyResults.cheminDeVie.interpretation.mission}
                </p>
              </>
            )}
          </div>
        )}

        {/* Identité */}
        {spiritualData.identite && (
          <Section title="🌟 Identité">
            <p style={{ color: 'var(--color-text-primary)' }}>
              <strong>Nom de naissance:</strong>{' '}
              {spiritualData.identite.prenoms_naissance} {spiritualData.identite.nom_naissance}
            </p>
            {spiritualData.identite.evolution?.length > 0 && (
              <div style={{ marginTop: 'var(--space-md)' }}>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  Évolution:
                </p>
                {spiritualData.identite.evolution.map((e, i) => (
                  <p key={i} style={{ color: 'var(--color-text-primary)', marginLeft: 'var(--space-md)' }}>
                    {e.type}: {e.nom} {e.date && `(${e.date})`}
                  </p>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* Pratiques */}
        {spiritualData.pratiques?.liste?.length > 0 && (
          <Section title="✨ Pratiques Spirituelles">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
              {spiritualData.pratiques.liste.map(p => (
                <span
                  key={p}
                  style={{
                    padding: 'var(--space-xs) var(--space-sm)',
                    background: 'var(--color-surface-2)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Thèmes de vie */}
        {spiritualData.themes_vie?.liste?.length > 0 && (
          <Section title="🎯 Thèmes de Vie">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
              {spiritualData.themes_vie.liste.map(t => (
                <span
                  key={t}
                  style={{
                    padding: 'var(--space-xs) var(--space-sm)',
                    background: 'rgba(138, 186, 168, 0.2)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Action pour modifier */}
        <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)' }}>
          <Button
            variant="secondary"
            onClick={() => setView('questionnaire')}
          >
            Modifier mon profil spirituel
          </Button>
        </div>
      </div>
    );
  }

  function renderNumerology() {
    if (!numerologyResults) {
      return (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-2xl)',
          background: 'var(--color-surface-1)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Complétez le questionnaire pour voir votre analyse numérologique.
          </p>
          <Button
            onClick={() => setView('questionnaire')}
            style={{ marginTop: 'var(--space-lg)' }}
          >
            Commencer
          </Button>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        {/* Chemin de Vie */}
        <NumerologyCard
          title="Chemin de Vie"
          number={numerologyResults.cheminDeVie.nombre}
          interpretation={numerologyResults.cheminDeVie.interpretation}
          color="var(--color-primary)"
        />

        {/* Année Personnelle */}
        <NumerologyCard
          title={`Année Personnelle ${numerologyResults.anneePersonnelle.annee}`}
          number={String(numerologyResults.anneePersonnelle.nombre)}
          interpretation={numerologyResults.anneePersonnelle.interpretation}
          color="var(--color-primary)"
        />

        {/* Expression (si disponible) */}
        {numerologyResults.expression && (
          <NumerologyCard
            title="Nombre d'Expression"
            number={numerologyResults.expression.expression}
            description="Ce que vous êtes venu exprimer dans cette vie"
            color="#9b87c2"
          />
        )}

        {/* Intime */}
        {numerologyResults.intime && (
          <NumerologyCard
            title="Élan du Cœur"
            number={numerologyResults.intime.intime}
            description="Vos désirs profonds et motivations intérieures"
            color="#e07b7b"
          />
        )}

        {/* Réalisation */}
        {numerologyResults.realisation && (
          <NumerologyCard
            title="Nombre de Réalisation"
            number={numerologyResults.realisation.realisation}
            description="Comment vous vous présentez au monde"
            color="#7bc2a0"
          />
        )}
      </div>
    );
  }

  function renderCompatibilityCalculator() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        <div style={{
          padding: 'var(--space-xl)',
          background: 'var(--color-surface-1)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)'
        }}>
          <h3 style={{
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-lg)'
          }}>
            💕 Calculateur de Compatibilité
          </h3>

          {!numerologyResults?.cheminDeVie ? (
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Complétez d'abord votre profil pour calculer la compatibilité.
            </p>
          ) : (
            <>
              <p style={{
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--space-lg)'
              }}>
                Votre chemin de vie: <strong style={{ color: 'var(--color-primary)' }}>
                  {numerologyResults.cheminDeVie.nombre}
                </strong>
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: 'var(--space-xs)',
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--font-size-sm)'
                  }}>
                    Prénom du partenaire
                  </label>
                  <input
                    type="text"
                    value={partnerData.prenom}
                    onChange={(e) => setPartnerData(p => ({ ...p, prenom: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: 'var(--space-md)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-background)',
                      color: 'var(--color-text-primary)'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: 'var(--space-xs)',
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--font-size-sm)'
                  }}>
                    Nom du partenaire
                  </label>
                  <input
                    type="text"
                    value={partnerData.nom}
                    onChange={(e) => setPartnerData(p => ({ ...p, nom: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: 'var(--space-md)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-background)',
                      color: 'var(--color-text-primary)'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: 'var(--space-xs)',
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--font-size-sm)'
                  }}>
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    value={partnerData.dateNaissance}
                    onChange={(e) => setPartnerData(p => ({ ...p, dateNaissance: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: 'var(--space-md)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-background)',
                      color: 'var(--color-text-primary)'
                    }}
                  />
                </div>

                <Button
                  onClick={calculateCompatibilityHandler}
                  disabled={!partnerData.dateNaissance}
                  style={{ marginTop: 'var(--space-md)' }}
                >
                  Calculer la compatibilité
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Résultat de compatibilité */}
        {compatibilityResult && (
          <div style={{
            padding: 'var(--space-xl)',
            background: 'linear-gradient(135deg, rgba(123, 168, 192, 0.1), rgba(138, 186, 168, 0.1))',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-lg)'
            }}>
              <div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  {compatibilityResult.partnerNom}
                </p>
                <p style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: 'var(--color-primary)'
                }}>
                  Chemin {compatibilityResult.partnerChemin}
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  color: compatibilityResult.score >= 8 ? '#28a745' :
                    compatibilityResult.score >= 6 ? 'var(--color-primary)' : '#dc3545'
                }}>
                  {compatibilityResult.score}/10
                </p>
                <p style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  {compatibilityResult.scoreLabel}
                </p>
              </div>
            </div>

            <p style={{
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-md)'
            }}>
              {compatibilityResult.description}
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-md)'
            }}>
              <div>
                <h4 style={{ color: '#28a745', marginBottom: 'var(--space-sm)' }}>
                  Forces
                </h4>
                <ul style={{
                  margin: 0,
                  paddingLeft: 'var(--space-lg)',
                  color: 'var(--color-text-secondary)'
                }}>
                  {compatibilityResult.forces.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 style={{ color: '#dc3545', marginBottom: 'var(--space-sm)' }}>
                  Défis
                </h4>
                <ul style={{
                  margin: 0,
                  paddingLeft: 'var(--space-lg)',
                  color: 'var(--color-text-secondary)'
                }}>
                  {compatibilityResult.defis.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

// Composant Section
function Section({ title, children }) {
  return (
    <div style={{
      padding: 'var(--space-lg)',
      background: 'var(--color-surface-1)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)'
    }}>
      <h3 style={{
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--space-md)'
      }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

// Composant NumerologyCard
function NumerologyCard({ title, number, interpretation, description, color }) {
  return (
    <div style={{
      padding: 'var(--space-xl)',
      background: 'var(--color-surface-1)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
      borderLeft: `4px solid ${color}`
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 'var(--space-md)'
      }}>
        <h3 style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
        <span style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: color
        }}>
          {number}
        </span>
      </div>

      {interpretation ? (
        <>
          <p style={{
            fontSize: 'var(--font-size-lg)',
            color: color,
            marginBottom: 'var(--space-sm)'
          }}>
            {interpretation.titre || interpretation.theme}
          </p>
          <p style={{
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-md)'
          }}>
            {interpretation.mission || interpretation.description}
          </p>

          {interpretation.keywords && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-xs)',
              marginBottom: 'var(--space-md)'
            }}>
              {interpretation.keywords.map((k, i) => (
                <span
                  key={i}
                  style={{
                    padding: '2px 8px',
                    background: `${color}20`,
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--font-size-xs)',
                    color: color
                  }}
                >
                  {k}
                </span>
              ))}
            </div>
          )}

          {interpretation.forces && (
            <div style={{ marginTop: 'var(--space-md)' }}>
              <p style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-tertiary)',
                marginBottom: 'var(--space-xs)'
              }}>
                Forces:
              </p>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                {interpretation.forces.join(' • ')}
              </p>
            </div>
          )}

          {interpretation.defis && (
            <div style={{ marginTop: 'var(--space-sm)' }}>
              <p style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-tertiary)',
                marginBottom: 'var(--space-xs)'
              }}>
                Défis:
              </p>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                {interpretation.defis.join(' • ')}
              </p>
            </div>
          )}

          {interpretation.conseils && (
            <div style={{ marginTop: 'var(--space-sm)' }}>
              <p style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-tertiary)',
                marginBottom: 'var(--space-xs)'
              }}>
                Conseils:
              </p>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                {interpretation.conseils.join(' • ')}
              </p>
            </div>
          )}
        </>
      ) : description && (
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {description}
        </p>
      )}
    </div>
  );
}
