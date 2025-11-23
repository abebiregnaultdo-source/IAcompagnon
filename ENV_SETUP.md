# Configuration des Variables d'Environnement

## 📋 Fichier .env à créer

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# ============================================
# Configuration IA Compagnon - Variables d'Environnement
# ============================================

# === SÉCURITÉ & CHIFFREMENT ===
# Clé maître pour chiffrement AES-256-GCM (32 caractères minimum)
# Générez une clé sécurisée avec : python -c "import secrets; print(secrets.token_hex(32))"
MASTER_KEY=dev_master_key_please_change_to_32_chars_minimum

# === OPENAI CONFIGURATION ===
# Clé API OpenAI (commence par sk-...)
# Obtenez-la sur : https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-api-key-here

# Modèle OpenAI à utiliser pour le knowledge model (raisonnement clinique)
# Options : gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo
KNOWLEDGE_MODEL=gpt-4o

# Modèle OpenAI par défaut (fallback)
MODEL_NAME=gpt-4o-mini

# === ANTHROPIC (CLAUDE) CONFIGURATION ===
# Clé API Anthropic (commence par sk-ant-...)
# Obtenez-la sur : https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here

# Modèle Claude à utiliser pour l'empathy model (relation thérapeutique)
# Options : claude-3-5-sonnet-20241022, claude-3-opus-20240229, claude-3-sonnet-20240229
EMPATHY_MODEL=claude-3-5-sonnet-20241022

# === PROVIDER CONFIGURATION ===
# Provider principal à utiliser (openai, anthropic, ou dual)
# 'dual' utilise OpenAI pour knowledge et Claude pour empathy
AI_PROVIDER=dual

# === SERVICES URLS ===
# URLs des services backend (ne pas modifier en développement local)
AI_ENGINE_URL=http://localhost:8001
EMOTIONS_SERVICE_URL=http://localhost:8002

# === CONSENT & RGPD ===
# Version du consentement utilisateur
CONSENT_VERSION=v1.0

# === OPTIONNEL : Chiffrement des feedbacks ===
# Clé optionnelle pour chiffrer les logs de feedback (optionnel)
FEEDBACK_ENC_KEY=

# === ENVIRONNEMENT ===
# Environnement d'exécution (development, staging, production)
ENV=development
```

## 🔐 Sécurité

⚠️ **IMPORTANT** : 
- Ne commitez JAMAIS le fichier `.env` dans git
- Le fichier `.env` est déjà dans `.gitignore`
- Utilisez des clés API différentes pour développement et production
- Régénérez les clés si elles sont exposées

## 📝 Instructions

1. Copiez le contenu ci-dessus dans un fichier `.env` à la racine du projet
2. Remplacez toutes les valeurs `your-*-api-key-here` par vos vraies clés API
3. Générez une clé MASTER_KEY sécurisée avec :
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```
4. Redémarrez les services après modification

## 🔗 Où obtenir les clés API

- **OpenAI** : https://platform.openai.com/api-keys
- **Anthropic (Claude)** : https://console.anthropic.com/settings/keys

## ✅ Vérification

Après configuration, vérifiez que les clés sont bien chargées :
```bash
# Dans le terminal Python
python -c "from dotenv import load_dotenv; import os; load_dotenv(); print('OpenAI:', 'OK' if os.getenv('OPENAI_API_KEY') else 'MANQUANT'); print('Anthropic:', 'OK' if os.getenv('ANTHROPIC_API_KEY') else 'MANQUANT')"
```

