# Exemples de Prompts Générés par Variation

Ce document montre les prompts réels que le système génère pour chaque méthode et variation détectée.

## 1. JOURNALING EXPRESSIF

### Variation: `lettre_non_envoyee`
**Détecté quand:** `unsaid > 0.5` (beaucoup de non-dits exprimés)

**Contexte personnalisé:**
```
📝 J'ai détecté des non-dits et une charge émotionnelle.
L'écriture expressive peut vous aider à transformer cette charge en compréhension.
Cette détection est très fiable pour vous (87%).
```

**Prompts générés:**
1. "Écrivez une lettre à cette personne ou à cette situation..."
2. "Dites tout ce que vous auriez voulu dire..."
3. "Laissez vos vraies émotions s'exprimer"
4. "Commencez par 'J'aurais voulu...'"
5. "Qu'est-ce que vous regrettez de ne pas avoir dit ?"

**Exemple d'utilisation:**
```
Utilisateur tape: "Je n'ai jamais eu le courage de lui dire combien elle comptait..."
↓ Système détecte: non-dits élevés
↓ Affiche prompts ci-dessus
↓ Utilisateur clique: "Écrivez une lettre à cette personne..."
↓ Texte ajouté à l'éditeur
Utilisateur continue: "Chère Sarah, je voudrais que tu saches..."
```

---

### Variation: `journal_guide_recit`
**Détecté quand:** `narrative_coherence < 0.4` (histoire fragmentée, pas bien structurée)

**Contexte personnalisé:**
```
📝 Votre histoire semble fragmentée. Raconter la timeline peut vous aider
à retrouver une cohérence narrative et du sens.
```

**Prompts générés:**
1. "Racontez cette histoire du début à la fin"
2. "Comment cette expérience s'est-elle déroulée ?"
3. "Décrivez les moments clés"
4. "Qu'avez-vous découvert au cours de ce parcours ?"
5. "Comment cette histoire continue-t-elle aujourd'hui ?"

**Exemple d'utilisation:**
```
Utilisateur tape: "C'était chaos. D'un côté... non, attends, avant ça..."
↓ Système détecte: cohérence narrative faible (0.3)
↓ Affiche prompts pour structurer
↓ Utilisateur clique: "Racontez cette histoire du début à la fin"
↓ Commence à écrire une narration chronologique
```

---

### Variation: `gratitude_post_traumatique`
**Détecté quand:** Ni non-dits majeurs, ni cohérence narrative cassée

**Contexte personnalisé:**
```
💫 Malgré la douleur, cultiver la gratitude peut être un chemins vers la résilience.
```

**Prompts générés:**
1. "Malgré la douleur, y a-t-il quelque chose pour lequel vous êtes reconnaissant ?"
2. "Qu'avez-vous appris qui vous a fortifié ?"
3. "Qui ou qu'est-ce qui vous a soutenu ?"
4. "Quels petits moments de lumière avez-vous trouvés ?"

**Exemple d'utilisation:**
```
Utilisateur tape: "C'est difficile mais je sais que j'avance..."
↓ Système détecte: pas de blocages majeurs, bonne résilience
↓ Affiche prompts de gratitude
↓ Utilisateur découvre des ressources internes
```

---

## 2. TIPI (Régulation Somatique)

### Variation: `gentle`
**Détecté quand:** `detresse > 75 OR arousal > 0.8` (détresse très élevée)

**Contexte personnalisé:**
```
🫁 Je sens une activation émotionnelle très importante.
Commençons doucement par explorer cette sensation dans votre corps.
```

**Prompts générés:**
1. "Où sentez-vous cette émotion dans votre corps ? (gorge, poitrine, ventre...)"
2. "Respirez doucement avec cette sensation..."
3. "Observez-la sans la combattre"
4. "Que vous dit votre corps en ce moment ?"

---

### Variation: `focused`
**Détecté quand:** `detresse < 50 AND arousal < 0.6` (régulation simple)

**Contexte personnalisé:**
```
🫁 Votre système nerveux peut être apaisé rapidement.
```

**Prompts générés:**
1. "Sentez cette tension et laissez-la se relâcher"
2. "Trois respirations profondes..."
3. "Où disparaît cette sensation ?"

---

### Variation: `standard`
**Détecté quand:** Arousal 0.6-0.9 (zone optimale)

**Contexte personnalisé:**
```
🫁 Votre corps vous parle. Écoutons-le.
```

**Prompts générés:**
1. "Où sentez-vous cette émotion dans votre corps ?"
2. "Respirez avec cette sensation"
3. "Qu'apprend-elle à vous dire ?"

---

## 3. ACT (Acceptation et Engagement)

### Variation: `defusion_cognitive`
**Détecté quand:** `fusion_score > 0.6` (pensées rigides)

**Contexte personnalisé:**
```
🎯 Je détecte une tension entre votre douleur et vos pensées rigides.
Créons de la distance avec ces pensées sans avoir à les combattre.
```

**Prompts générés:**
1. "Notez ces pensées comme des visiteurs (pas des vérités)"
2. "Quelle pensée revient tout le temps ?"
3. "Qu'arriverait-il si vous la laissiez passer sans la combattre ?"
4. "Vos pensées définissent-elles votre réalité ?"

**Exemple:**
```
Utilisateur tape: "Je suis nul. Je ne peux rien faire. C'est fini pour moi."
↓ Système détecte: fusion cognitive élevée (0.78)
↓ Affiche prompts pour créer distance
↓ Utilisateur écrit: "J'observe la pensée 'Je suis nul'..."
↓ Commence à la voir comme un visiteur, pas une vérité
```

---

### Variation: `valeurs_et_action`
**Détecté quand:** `values_seeking > 0.5` (cherche le sens)

**Contexte personnalisé:**
```
🎯 Je sens une recherche de direction et de sens.
Redéfinissons les valeurs qui matière vraiment pour vous.
```

**Prompts générés:**
1. "Qu'est-ce qui est vraiment important pour vous ?"
2. "Malgré cette douleur, qu'aimeriez-vous accomplir ?"
3. "Vers quelles valeurs voulez-vous avancer ?"
4. "Comment cette difficulté peut-elle devenir une opportunité ?"

---

### Variation: `acceptation_experiencielle`
**Détecté quand:** `avoidance_score > 0.5` (évitement émotionnel)

**Contexte personnalisé:**
```
🎯 L'évitement augmente la souffrance. Accueillir les émotions peut libérer.
```

**Prompts générés:**
1. "Au lieu d'éviter, pouvez-vous simplement observer cette émotion ?"
2. "Qu'arriverait-il si vous la laissiez exister ?"
3. "Comment votre vie changerait-elle en l'acceptant ?"

---

## 4. CONTINUING BONDS (Maintenir le Lien)

### Variation: `rituel_connexion`
**Détecté quand:** `ritual_affinity > 0.5` (affinité pour les rituels)

**Contexte personnalisé:**
```
💫 Je sens une recherche de connexion et de sens.
Les rituels peuvent honorer votre lien et transformer la perte.
```

**Prompts générés:**
1. "Créez un rituel symbolique pour honorer cette personne"
2. "Qu'est-ce que vous feriez ensemble que vous pourriez continuer ?"
3. "Un lieu, un moment, une pratique pour vous connecter ?"
4. "Comment continuez-vous cette relation autrement ?"

---

### Variation: `conversation_interieure`
**Détecté quand:** `internal_dialogue_capacity > 0.5` (capacité réflexive)

**Contexte personnalisé:**
```
💫 Parlez avec cette personne intérieurement.
```

**Prompts générés:**
1. "Que lui diriez-vous si elle était là ?"
2. "Qu'aurait-elle à vous dire maintenant ?"
3. "Écrivez cette conversation..."
4. "Comme si elle vous parlait intérieurement"

---

### Variation: `objet_transitionnel`
**Détecté quand:** Autres conditions

**Contexte personnalisé:**
```
💫 Un objet peut symboliser cette connexion.
```

**Prompts générés:**
1. "Y a-t-il un objet qui vous relie à cette personne ?"
2. "Que représente-t-il pour vous ?"
3. "Où le gardez-vous ?"
4. "Comment cet objet vous aide-t-il ?"

---

## 📊 Matrice Détection-Prompts

```
Message Utilisateur
    ↓
Analyse Linguistique + Émotionnelle
    ↓
┌─────────────────────────────────────────────────────────┐
│ JOURNALING (Non-dits + charge émotionnelle)             │
├─────────────────────────────────────────────────────────┤
│ unsaid > 0.5 → "Écrivez une lettre..."                 │
│ narrative < 0.4 → "Racontez du début à la fin..."      │
│ Sinon → "Malgré la douleur, gratitude?"                │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ TIPI (Activation somatique)                             │
├─────────────────────────────────────────────────────────┤
│ detresse > 75 → "Gentlement, où sentirez-vous..."      │
│ detresse < 50 → "Trois respirations profondes..."      │
│ Sinon → "Écoutons votre corps..."                       │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ ACT (Fusion cognitive / Évitement)                      │
├─────────────────────────────────────────────────────────┤
│ fusion > 0.6 → "Pensées comme visiteurs..."            │
│ values > 0.5 → "Qu'est-ce qui importe vraiment ?"      │
│ avoidance > 0.5 → "Acceptons cette émotion..."        │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ CONTINUING BONDS (Recherche de lien)                    │
├─────────────────────────────────────────────────────────┤
│ ritual > 0.5 → "Créez un rituel symbolique..."         │
│ dialogue > 0.5 → "Parlez intérieurement..."            │
│ Sinon → "Un objet qui vous relie ?"                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Cas d'Usage Réels

### Cas 1: Deuil Récent avec Non-Dits
```
Message: "Ma mère est décédée il y a 2 mois. Je n'ai jamais vraiment 
         eu la chance de lui dire à quel point elle était importante. 
         Je suis rongé par les regrets."

Analyse:
  - Non-dits: 0.92 (très élevé!)
  - Charge émotionnelle: élevée (regrets explicites)
  - Arousal: 0.72 (optimal pour journaling)
  - Detresse: 78 (élevé mais pas critique)

Détection:
  → journaling_expressif: 0.95 (très confiant!)
  → Variation: "lettre_non_envoyee"

Affichage:
  ✓ Contexte: "J'ai détecté des non-dits... 95% confiance"
  ✓ Suggestions:
    - "Écrivez une lettre à votre mère..."
    - "Dites-lui tout ce que vous auriez voulu..."
```

### Cas 2: Trauma Actif
```
Message: "Je tremble, j'arrive pas à respirer. C'est trop."

Analyse:
  - Arousal: 0.95 (TRÈS élevé)
  - Somatic activation: 0.88 (tremblement, respiration)
  - Cognitive processing: 0.2 (trop submergé)

Détection:
  → TIPI: 0.89
  → Variation: "gentle" (priorité apaisement)
  → Journaling détecté MAIS contra-indiqué (arousal trop élevé)

Affichage:
  ✓ Contexte: "Activation très élevée. Commençons doucement."
  ✓ Suggestions: "Où sentez-vous...", "Respirez..."
  ⚠️ Pas de journaling tant qu'on n'a pas régulé
```

### Cas 3: Perte de Sens
```
Message: "Pourquoi elle? Pourquoi pas moi? À quoi bon continuer? 
         Rien n'a plus de sens."

Analyse:
  - Meaning seeking: 0.91 (questions métaphysiques)
  - Values seeking: 0.85 (perte de direction)
  - Rumination: 0.78 (persévération sur "pourquoi")

Détection:
  → ACT: 0.82
  → Variation: "valeurs_et_action"
  → Continuing Bonds: 0.65

Affichage:
  ✓ Contexte: "Perte de direction. Redéfinissons vos valeurs."
  ✓ Suggestions: "Qu'est-ce qui compte vraiment...", "Malgré la douleur..."
```

### Cas 4: Maintien du Lien
```
Message: "Je veux continuer à sentir sa présence. Parfois, je lui parle 
         et je sens qu'elle m'écoute. Est-ce normal ?"

Analyse:
  - Connection seeking: 0.88
  - Internal dialogue capacity: 0.79
  - Grief avoidance: 0.1 (pas d'évitement, c'est positif)

Détection:
  → Continuing Bonds: 0.91 (très fiable!)
  → Variation: "conversation_interieure"

Affichage:
  ✓ Contexte: "Je sens une recherche de connexion profonde..."
  ✓ Suggestions: "Que lui diriez-vous...", "Écrivez cette conversation..."
```

---

## 💡 Points Clés

1. **Variation basée sur nuances:** Pas juste "journal" mais les 3 variations ciblées
2. **Confiance affichée:** L'utilisateur voit pourquoi on propose cela
3. **Contexte humain:** "J'ai détecté" pas "Le système détecte"
4. **Debounce intelligent:** Analyse seulement quand contenu > 30 caractères
5. **Fallback gracieux:** Si API échoue, prompts par défaut
6. **Éthique:** Aucune analyse sans consentement, données chiffrées

---

**Status:** ✅ Tous les prompts implémentés et testés
**Fichier à consulter:** `backend/api-gateway/app/main.py` - fonction `_generate_personalized_prompts()`
