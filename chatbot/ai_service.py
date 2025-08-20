# ai_service.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os

from ai_client import ask_openai

app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5000", "http://127.0.0.1:5000"]}})

# link here with the store database
DB_PATH = os.getenv("STORE_DB", "store.db")

def query_games(search_term=None, limit=20):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    if search_term:
        cur.execute("SELECT appid, name, price FROM all_games WHERE name LIKE ? LIMIT ?", (f"%{search_term}%", limit))
    else:
        cur.execute("SELECT appid, name, price FROM all_games LIMIT ?", (limit,))
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.route("/api/ai_query", methods=["POST"])
def ai_query():
    payload = request.get_json(silent=True) or {}
    user_message = (payload.get("message") or "").strip()
    search_term = (payload.get("search") or "").strip()

    if not user_message:
        return jsonify({"error": "no message provided"}), 400

    try:
        games = query_games(search_term if search_term else None, limit=20)
    except Exception as e:
        print("DB read error:", e)
        games = []

    if games:
        lines = []
        for g in games:
            price = g.get("price") if g.get("price") not in (None, "") else "N/A"
            lines.append(f"{g.get('name')} | id:{g.get('appid')} | price:{price}")
        db_context = "Available items (sample):\n" + "\n".join(lines)
    else:
        db_context = "No items found in database."

    system_prompt = (
        "You are an assistant for an online game store. "
        "Use the database context to answer availability/pricing questions. "
        "Do NOT claim a game is available if it's not listed in the database context. "
        "If the user asks for endpoints or how to add to cart, show the endpoint path and JSON schema clearly. "
        "Keep answers concise."
    )

    reply = ask_openai(system_prompt, db_context, user_message)

    return jsonify({"reply": reply, "items_in_context": len(games)})

if __name__ == "__main__":
    port = int(os.getenv("AI_SERVICE_PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)
