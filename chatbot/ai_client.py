# ai_client.py
import os
import openai

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY environment variable is not set")
openai.api_key = OPENAI_API_KEY

MODEL = os.getenv("AI_MODEL", "gpt-3.5-turbo")

def ask_openai(system_prompt: str, db_context: str, user_message: str, max_tokens=400, temperature=0.2):
    """
    Return the assistant text (string).
    """
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "system", "content": db_context},
        {"role": "user", "content": user_message}
    ]
    try:
        resp = openai.ChatCompletion.create(
            model=MODEL,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature
        )
        return resp["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print("OpenAI error:", e)
        return "sorry; there is a problem in conection with the AI"
