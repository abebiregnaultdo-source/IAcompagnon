-- Rêve de Christelle - 30 janvier 2026
-- À exécuter dans Supabase SQL Editor

INSERT INTO dreams (
  user_id,
  dream_date,
  title,
  content,
  therapeutic_context,
  emotional_state,
  self_interpretation,
  ai_interpretation,
  themes,
  tags,
  emotional_intensity,
  lucidity_level,
  is_recurring
) VALUES (
  'fac92d81-7df0-48d9-bc3e-694e8a140f5f',
  '2026-01-30',
  'Chercher ma direction',
  'Je cherchais ma direction. Au début j''étais dans un centre commercial énorme avec mon conjoint. On s''est séparé pour faire les courses mais ensuite on ne s''est pas retrouvé.

Je suis tombée dans une zone où un monsieur était venu déposer son CV pour un job. Cet homme avait l''air désespéré et ça s''arrangeait pas puisque le recruteur lui disait non. J''ai donc décidé d''aller le voir et de prendre ses coordonnées comme si j''allais l''embaucher...

Plus tard dans le rêve je me retrouve très loin, mais avec une très belle voiture que je ne peux pas utiliser pour rentrer chez moi. Ce n''est donc pas une voiture de fonction. Pour rentrer je dois prendre un bus mais je ne suis pas sur le bon trottoir. Mais je ne suis pas seule dans ce cas - il y a un bon nombre de personnes et je me demande si on va tous réussir à monter dans un bus.

On traverse et vient une voiture avec plein de places vides derrière. C''est pas un bus mais tout comme, qui propose de nous avancer. Dans le bus je me retrouve avec des collègues et anciens collègues. Certains décrivent que l''activité est en train de changer, certains travaillent sur des robots industriels.

Le boss est avec nous et à un moment on descend tous du bus. Il faut continuer nos chemins. Je demande ma direction, on me l''indique. Je me rends compte que j''ai perdu mon bas et je cache donc ma partie intime.

On s''arrête à un bar. On me propose de m''associer à un projet... Je ne suis toujours pas sortie de l''auberge car je ne sais pas s''il faut aller à gauche ou à droite pour rentrer chez moi, mais je passe un bon moment... Ai-je envie de rentrer ? Oui...',
  'Après une nuit de méditation de libération transgénérationnelle où j''étais supposée me relaxer et mon subconscient aurait dû continuer de travailler.',
  '{"before_sleep": "méditation libération", "after_wake": "questionnement", "dominant": "recherche de direction"}',
  NULL,
  '{
    "themes_principaux": [
      {
        "theme": "La perte de direction / chercher son chemin",
        "analyse": "C''est le fil rouge du rêve : Où vais-je ? Quel est MON chemin ? Centre commercial → séparation → ne plus se retrouver → ne pas savoir si c''est gauche ou droite."
      },
      {
        "theme": "La belle voiture inutilisable",
        "analyse": "Tu possèdes quelque chose de précieux (tes capacités, ton potentiel) mais tu ne peux pas l''utiliser pour rentrer chez toi (revenir à toi-même, à ta source). Ce n''est pas ton rôle professionnel qui te ramènera à toi."
      },
      {
        "theme": "L''homme désespéré que tu veux embaucher",
        "analyse": "Ta tendance à vouloir sauver, aider, porter les autres. Tu vois quelqu''un en difficulté → tu interviens immédiatement. Lien avec ton pattern : tout porter seule."
      },
      {
        "theme": "La vulnérabilité exposée",
        "analyse": "Tu as perdu ton bas / cacher ta partie intime. Quelque chose de ton intimité n''est plus protégé. Mais tu continues à avancer quand même."
      },
      {
        "theme": "Transformation en cours",
        "analyse": "Les poules et les robots industriels - contraste organique vs mécanique. L''activité est en train de changer. Une transformation est en cours dans ta vie."
      }
    ],
    "liens_transgenerationnels": [
      "Pattern sauveuse que tu portes",
      "Tension entre suivre les autres et trouver TON chemin",
      "Exposition de la vulnérabilité dans un contexte professionnel/relationnel"
    ],
    "message_central": "Tu as les ressources (la belle voiture) mais le chemin de retour vers toi-même passe par autre chose que tes rôles habituels. En chemin, tu rencontres d''anciens patterns (sauver les autres, chercher validation), et ta vulnérabilité est exposée. Tu ne sais pas encore quelle direction prendre, mais tu sais que tu veux rentrer chez toi.",
    "questions_therapeutiques": [
      "Qu''est-ce que rentrer chez toi signifie pour toi en ce moment ?",
      "Quels sont les rôles que tu portes qui ne sont pas ta voiture personnelle ?",
      "Comment te sens-tu quand tu ne sais pas quelle direction prendre ?"
    ]
  }',
  ARRAY['direction', 'chemin de vie', 'transformation', 'vulnérabilité', 'patterns'],
  ARRAY['après méditation', 'transgénérationnel', 'professionnel', 'identité'],
  7,
  2,
  false
);

-- Vérifier l'insertion
SELECT id, title, dream_date, themes FROM dreams
WHERE user_id = 'fac92d81-7df0-48d9-bc3e-694e8a140f5f'
ORDER BY dream_date DESC;
