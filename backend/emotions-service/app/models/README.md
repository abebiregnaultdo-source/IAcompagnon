# Modèles EmotionBERT Fine-tunés

Ce dossier contient les poids fine-tunés d'EmotionBERT pour le contexte de deuil.

## Fichiers attendus

- `emotionbert_grief_finetuned.pth` - Poids du modèle fine-tuné sur corpus de deuil

## Fine-tuning

Pour fine-tuner le modèle sur vos données :

```python
# Voir scripts/finetune_emotionbert.py
python scripts/finetune_emotionbert.py \
    --data_path data/grief_corpus.jsonl \
    --output_path app/models/emotionbert_grief_finetuned.pth \
    --epochs 10 \
    --batch_size 16
```

## Fallback

Si aucun modèle fine-tuné n'est disponible, le système utilise :
1. Le modèle de base `j-hartmann/emotion-english-distilroberta-base`
2. En cas d'échec, fallback vers l'heuristique legacy

## Format des données de fine-tuning

```jsonl
{"text": "Je n'arrive pas à croire qu'il soit parti...", "valence": -0.8, "arousal": 0.6, "dominance": -0.4, "grief_intensity": 0.9, "phase": "choc_deni"}
{"text": "Je commence à accepter la situation", "valence": 0.3, "arousal": -0.2, "dominance": 0.5, "grief_intensity": 0.3, "phase": "acceptation"}
```

## Métriques de performance

À documenter après fine-tuning :
- MAE (Mean Absolute Error) sur valence/arousal/dominance
- Accuracy de classification de phase
- Corrélation avec annotations cliniques

