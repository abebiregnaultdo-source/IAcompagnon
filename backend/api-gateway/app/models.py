from __future__ import annotations
from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime

Tone = Literal['lent', 'neutre', 'enveloppant']

class Consent(BaseModel):
    accepted: bool
    version: str
    date: str
    scope: List[str]

class UserProfile(BaseModel):
    id: str
    first_name: str
    tone: Tone
    rhythm: int = Field(ge=1, le=3)
    active_module: str = 'grief'
    consent: Consent
    created_at: str
    updated_at: str

class ChatMessage(BaseModel):
    role: Literal['user', 'assistant', 'system']
    content: str

class ChatRequest(BaseModel):
    user_id: str
    messages: List[ChatMessage]

class AnalyzeRequest(BaseModel):
    text: str

class EmotionScores(BaseModel):
    detresse: int
    espoir: int
    energie: int
    confidence: float = 0.0
    phase: Optional[Literal['ancrage','expression','sens','reconstruction']] = None

class StateRecord(BaseModel):
    user_id: str
    ts: str
    detresse: int
    espoir: int
    energie: int
    tone: Tone
    phase: Literal['ancrage','expression','sens','reconstruction'] = 'ancrage'
    last_active_module: Optional[str] = None

class ModuleConfig(BaseModel):
    name: str
    onboarding: str
    rules: str
    active: bool = False

class ModulesDeclaration(BaseModel):
    modules: Dict[str, ModuleConfig]


class ConsentLog(BaseModel):
    user_id: str
    ts: str
    version: str
    scope: List[str]
    user_agent: Optional[str] = None
    ip: Optional[str] = None

class AccessLog(BaseModel):
    user_id: Optional[str]
    ts: str
    resource: str
    action: str
    purpose: str
    ip: Optional[str] = None

class AlertLog(BaseModel):
    user_id: str
    ts: str
    score_type: Literal['detresse','espoir','energie']
    value: int
    threshold: int = 80
    note: Optional[str] = None

class OnboardingNextRequest(BaseModel):
    user_id: str
    step: str
    payload: Dict[str, Any] = Field(default_factory=dict)
