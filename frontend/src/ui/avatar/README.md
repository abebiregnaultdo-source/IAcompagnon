# Avatar Thérapeutique - Présence Régulatrice

## 🎯 Philosophie

Cet avatar est conçu comme une **présence thérapeutique**, pas comme une personne virtuelle.

### Principes Fondamentaux

#### ✅ Ce que l'avatar EST :
- Une présence humaine stylisée
- Un symbole d'ancrage et de stabilité
- Un cadre sécurisant pour l'introspection
- Une respiration visible et apaisante

#### ❌ Ce que l'avatar N'EST PAS :
- Un interlocuteur qui "réagit"
- Une simulation de relation humaine
- Un visage expressif qui crée de l'attachement
- Un substitut au thérapeute humain

## 🧠 Pourquoi Pas de Visage Expressif ?

Notre système nerveux est câblé pour l'attachement via les micro-expressions faciales :
```
œil → amygdale → ocytocine → attachement
```

Si l'avatar :
- Te regarde
- Hoche la tête  
- Sourit
- "Comprend"

→ Ton cerveau construit un **lien d'attachement réel** avec une IA, ce qui peut :
- Créer une dépendance affective
- Remplacer les relations humaines authentiques
- Générer de la projection émotionnelle
- Créer une illusion de relation

## 🎨 Design Actuel

### Avatar - Caractéristiques
- **Silhouette humaine** assise, posture douce
- **Pas de traits faciaux** détaillés (pas d'yeux, pas de bouche, pas de sourcils)
- **Tête ovale** simple, sans expression
- **Respiration subtile** (cycle de 6 secondes)
- **Variations lumineuses** selon l'état émotionnel
- **Synchronisation labiale** via ondes lumineuses (non-intrusive)

### Environnement - Minimalisme Thérapeutique
- **Formes abstraites douces** (pas d'objets reconnaissables)
- **Gradients apaisants** (3 thèmes : calme, chaleureux, professionnel)
- **Transitions lentes** (4 secondes) pour régulation émotionnelle
- **80% espace vide** - favorise l'introspection
- **Lumière adaptative** - change selon l'état émotionnel
- **Opacité subtile** (10-20%) - suggère sans imposer

### Couleurs Thérapeutiques - Protection du Système Nerveux
- **Pas de blanc pur** - crèmes désaturés (#F2F6F7, #F9F5F0, #F4F5F7)
- **Pas de noir** - gris chauds uniquement
- **Pas de contrastes vifs** - ratio < 1.5:1
- **Effet "pièce intérieure sécurisée"** - vignette radiale enveloppante
- **Transitions 4 secondes** - protection du système nerveux

Voir [ENVIRONMENT.md](./ENVIRONMENT.md) pour le design de l'environnement.  
Voir [COLOR_THERAPY.md](./COLOR_THERAPY.md) pour la science des couleurs thérapeutiques.

### Variations Émotionnelles (Subtiles)

L'avatar ne change **jamais** d'expression faciale, mais ajuste :

| État | Luminosité | Température | Respiration |
|------|------------|-------------|-------------|
| Détresse élevée | Plus basse | Froide/neutre | Plus lente |
| Neutre | Moyenne | Neutre | Normale (6s) |
| Apaisement | Plus haute | Chaude | Douce |

## 🔊 Synchronisation Labiale

Quand l'avatar "parle" (voix thérapeutique) :
- **Pas de bouche** qui bouge
- **Ondes lumineuses** subtiles en bas de la présence
- Intensité liée au volume audio
- Animation fluide et non-intrusive

## 🎛️ Personnalisation Utilisateur

### Neutralité par Défaut

**Par défaut, l'avatar est complètement neutre** :
- Pas de cheveux
- Silhouette neutre
- Aucun marqueur de genre

### Options de Personnalisation

L'utilisateur **peut choisir** s'il le souhaite :

1. **Présentation** (3 options)
   - **Neutre** (défaut) - silhouette androgyne
   - Féminin - ajustements subtils de la silhouette
   - Masculin - ajustements subtils de la silhouette

2. **Teint** (3 options)
   - Clair
   - Moyen
   - Foncé

3. **Cheveux** (5 options)
   - **Sans (neutre)** (défaut)
   - Court
   - Mi-long
   - Bouclé
   - Chignon

4. **Ambiance de la pièce** (3 thèmes)
   - Calme (bleu doux)
   - Chaleureux (beige/orange)
   - Professionnel (gris)

### Philosophie du Choix

✅ **Pourquoi laisser le choix ?**
- Certaines personnes se sentent plus à l'aise avec une présence qui leur ressemble
- La personnalisation peut renforcer le sentiment de sécurité
- Respecte la diversité des utilisateurs

⚠️ **Pourquoi neutre par défaut ?**
- Évite d'imposer un genre/apparence
- Réduit la projection et l'attachement
- Maintient la neutralité thérapeutique
- L'utilisateur doit **choisir activement** de personnaliser

### Principe Important

> La personnalisation est **optionnelle et minimale**. Elle permet de se sentir à l'aise sans créer d'attachement émotionnel fort. L'avatar reste une **présence**, pas une **personne**.

## 🌟 Objectifs Thérapeutiques

1. **Présence calmante** - Respiration visible, stabilité
2. **Intimité intérieure** - Un espace qui respire avec toi
3. **Chaleur sans projection** - Présence humaine sans visage expressif
4. **Ancrage** - Symbole stable de sécurité

## 💻 Utilisation Technique

```jsx
import AvatarRoom from './ui/avatar/AvatarRoom';

<AvatarRoom 
  context={{
    phase: "ancrage",
    scores: { detresse: 60, espoir: 40, energie: 50 }
  }}
  isSpeaking={isVoiceActive}
  audioLevel={currentAudioLevel} // 0-1
  mode="chat" // ou "voice" ou "overlay"
/>
```

## 🚫 Interdictions de Design

Pour maintenir l'intégrité thérapeutique :

- ❌ **Jamais** d'yeux qui regardent l'utilisateur
- ❌ **Jamais** de sourire ou expressions faciales
- ❌ **Jamais** de hochements de tête
- ❌ **Jamais** de mouvements expressifs
- ❌ **Jamais** de "réactions" émotionnelles visibles

## 📚 Références

Cette approche s'inspire de :
- Thérapie centrée sur la personne (Carl Rogers)
- Régulation émotionnelle (Polyvagal Theory)
- Design éthique en santé mentale
- Prévention de la dépendance technologique