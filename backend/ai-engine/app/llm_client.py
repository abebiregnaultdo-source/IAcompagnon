from __future__ import annotations
import os

# OpenAI SDK v1 style import
try:
    from openai import OpenAI
except Exception:  # fallback older SDK name if needed
    OpenAI = None  # type: ignore


def call_llm(prompt: str) -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or OpenAI is None:
        # Fallback safe text if SDK/key not present
        return (
            "Je reste avec toi. Observe simplement ce qui est là en ce moment. "
            "Si une sensation apparaît, laisse-la exister quelques instants, sans chercher à changer."
        )
    client = OpenAI(api_key=api_key)
    resp = client.chat.completions.create(
        model=os.getenv("MODEL_NAME", "gpt-4o-mini"),
        messages=[
            {"role": "system", "content": "Tu es une IA thérapeutique empathique, non-directive et sécurisée."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=300,
    )
    try:
        return resp.choices[0].message.content.strip()
    except Exception:
        return "Merci pour ton partage. Restons sur des repères simples, à ton rythme."
