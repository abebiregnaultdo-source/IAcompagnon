## Quick orientation for AI coding agents

This file gives focused, actionable knowledge to be immediately productive in this repo.

- Big picture
  - Microservice app: FastAPI backend split into three services and a React frontend:
    - `backend/api-gateway` — orchestrator and public API (profiles, onboarding, chat, modules, state). See `app/main.py` and `app/config.py`.
    - `backend/ai-engine` — generation & therapeutic pipeline. Entry: `app/main.py`. LLM wrapper: `app/llm_client.py`.
    - `backend/emotions-service` — emotion scoring service (`app/main.py`).
    - `frontend` — Vite + React UI (`src/ui/*`), entry `src/main.jsx`.

- Data & flow summary (common paths)
  - Frontend -> API Gateway `/api/chat` or `/api/onboarding/next`.
  - API Gateway calls Emotions Service (`settings.EMOTIONS_SERVICE_URL`) to score text, then calls AI Engine (`settings.AI_ENGINE_URL`) at `/generate`.
  - API Gateway persists profiles and history with `EncryptedKV` (see `backend/api-gateway/app/storage.py`) using `CryptoBox` and `MASTER_KEY` from `.env`.
  - AI Engine runs `TherapeuticEngine` pipeline and writes feedback/alerts to JSON/JSONL files under `backend/*`.

- Key files to reference when changing behavior
  - `backend/api-gateway/app/main.py` — request orchestration, how policies are composed and how modules are imported.
  - `backend/api-gateway/app/storage.py` — encrypted storage & JSONL logs (how data at-rest is encoded).
  - `backend/api-gateway/app/modules_loader.py` — dynamic modules registry and loader used by onboarding and module reloading.
  - `backend/ai-engine/app/main.py` — pipeline, provider selection (`AI_PROVIDER`), generate endpoint contract.
  - `backend/ai-engine/app/llm_client.py` — how LLM calls are wrapped; safe fallback when keys/SDK missing.
  - `backend/modules/*` — clinical modules (each module typically contains `onboarding.py`, `rules.json`, `intentions.json` etc.). Adding a module requires updating the modules declaration and calling POST `/api/modules/reload`.

- Environment & integration points (important env vars)
  - `.env` (copy from `.env.sample`) — required for dev. Key vars: `MASTER_KEY`, `AI_ENGINE_URL`, `EMOTIONS_SERVICE_URL`, `OPENAI_API_KEY`, `MODEL_NAME`, `FEEDBACK_ENC_KEY`, `CONSENT_VERSION`, `AI_PROVIDER`.

- Developer workflows (how to run locally — Windows PowerShell examples)
  - API Gateway
    - cd backend/api-gateway
    - python -m venv .venv; .venv\Scripts\pip install -r requirements.txt
    - .venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
  - AI Engine
    - cd backend/ai-engine
    - python -m venv .venv; .venv\Scripts\pip install -r requirements.txt
    - .venv\Scripts\python -m uvicorn app.main:app --reload --port 8001
  - Emotions Service
    - cd backend/emotions-service
    - python -m venv .venv; .venv\Scripts\pip install -r requirements.txt
    - .venv\Scripts\python -m uvicorn app.main:app --reload --port 8002
  - Frontend
    - cd frontend
    - npm i
    - npm run dev

- Project-specific conventions and patterns
  - Storage: small JSON/JSONL files under `data/` (see `EncryptedKV`/`PlainLog`). Code expects JSON or JSONL and tolerates absent files.
  - Clinical modules are dynamically loaded via `modules_loader.registry`; onboarding modules expose a `next_step` API (see `backend/api-gateway/app/main.py` usage).
  - AI policy object: endpoints expect a `policy` that carries `tone`, `phase`, `scores`, `user_id_hash`. Keep keys stable when modifying.
  - Pluggable LLM provider controlled by `AI_PROVIDER` env var; code falls back to safe canned text when keys/SDK missing (so tests can run offline).

- What to edit and examples
  - To change how profiles are encrypted or logged: update `backend/api-gateway/app/storage.py` and `app/security.py` (CryptoBox implementations).
  - To change LLM prompts or provider handling: update `backend/ai-engine/app/llm_client.py` and pipeline code in `backend/ai-engine/app/therapeutic_engine.py`.
  - To add a clinical module: add folder under `backend/modules/<module>` with `onboarding.py` and `rules.json`, then update `backend/modules/modules.json` and call POST `/api/modules/reload`.

- Quick debugging tips
  - If an endpoint returns 500, check corresponding service logs under `backend/*/data/*.jsonl` and `alert_logs.jsonl` / `feedback_logs.jsonl` files.
  - Missing LLM behavior often indicates absent `OPENAI_API_KEY` or SDK; `llm_client` will return a safe fallback string — set `MODEL_NAME` and `OPENAI_API_KEY` to test real calls.

If anything below is unclear or you want me to add short examples (sample request bodies, small unit tests, or a CLI helper), tell me which section to expand and I'll iterate.
