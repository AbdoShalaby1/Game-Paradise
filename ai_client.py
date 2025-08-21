# ai_client.py
import os
from groq import Groq

# Set your Groq API key
client = Groq(api_key=os.getenv("GROQ_API_KEY","gsk_WyM7wAyAjDO9UprWzlq2WGdyb3FYAVJWcrCokuhv7aCZpI#REMOVED#".replace("#REMOVED#","DnIvNc")))

# Default model (change as needed)
MODEL = os.getenv("AI_MODEL", "llama3-8b-8192")

def ask_groq(system_prompt: str, db_context: str, user_message: str, max_tokens=400, temperature=0.2):
    """
    Return the assistant text (string) using Groq API.
    """
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "system", "content": db_context},
        {"role": "user", "content": user_message}
    ]
    try:
        resp = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        print("Groq API error:", e)
        return "sorry; there is a problem in connection with the AI"
