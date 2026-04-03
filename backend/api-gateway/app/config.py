import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
ENV_PATH = BASE_DIR / '.env'
load_dotenv(ENV_PATH)

class Settings:
    ENV: str = os.getenv('ENV', 'development')
    MASTER_KEY: str = os.getenv('MASTER_KEY', '')

    def __init__(self):
        if not self.MASTER_KEY or self.MASTER_KEY == 'dev_master_key_please_change':
            import logging
            logging.getLogger(__name__).warning(
                "ATTENTION: MASTER_KEY non configurée ou valeur par défaut. "
                "Le chiffrement des données utilisateur n'est PAS sécurisé. "
                "Définissez MASTER_KEY dans .env pour la production."
            )
            if not self.MASTER_KEY:
                self.MASTER_KEY = 'dev_master_key_please_change'
    AI_ENGINE_URL: str = os.getenv('AI_ENGINE_URL', 'http://localhost:8001')
    EMOTIONS_SERVICE_URL: str = os.getenv('EMOTIONS_SERVICE_URL', 'http://localhost:8002')
    VOICE_SERVICE_URL: str = os.getenv('VOICE_SERVICE_URL', 'http://localhost:8003')
    CONSENT_VERSION: str = os.getenv('CONSENT_VERSION', 'v1.0')

settings = Settings()
