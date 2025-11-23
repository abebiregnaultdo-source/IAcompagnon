from __future__ import annotations
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os
import base64
import json
from dataclasses import dataclass
from typing import Tuple

NONCE_LEN = 12
KEY_LEN = 32

@dataclass
class CryptoBox:
    key: bytes

    @staticmethod
    def from_master(master_key: str) -> 'CryptoBox':
        # Accept hex or base64
        try:
            if len(master_key) in (64, 32):
                # try hex
                k = bytes.fromhex(master_key)
            else:
                k = base64.b64decode(master_key)
        except Exception:
            # fallback utf-8 pad
            raw = master_key.encode('utf-8')
            k = (raw * (KEY_LEN // len(raw) + 1))[:KEY_LEN]
        if len(k) < KEY_LEN:
            k = (k * (KEY_LEN // len(k) + 1))[:KEY_LEN]
        return CryptoBox(key=k[:KEY_LEN])

    def encrypt(self, data: dict) -> str:
        aes = AESGCM(self.key)
        nonce = os.urandom(NONCE_LEN)
        ct = aes.encrypt(nonce, json.dumps(data).encode('utf-8'), None)
        return base64.b64encode(nonce + ct).decode('utf-8')

    def decrypt(self, blob: str) -> dict:
        raw = base64.b64decode(blob)
        nonce, ct = raw[:NONCE_LEN], raw[NONCE_LEN:]
        aes = AESGCM(self.key)
        pt = aes.decrypt(nonce, ct, None)
        return json.loads(pt.decode('utf-8'))
