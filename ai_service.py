# ai_service.py
from helper import get_db_connection
from ai_client import ask_groq   # your Groq client
import sqlite3

# link here with the store database
DB_PATH = 'store.db'

def query_games(search_term=None):
    conn = get_db_connection()
    cur = conn.cursor()
    if search_term:
        cur.execute(
            "SELECT appid, name, price FROM all_games WHERE name LIKE ?",
            (f"%{search_term}%")
        )
    else:
        cur.execute("SELECT appid, name, price FROM all_games")
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def run_ai_query(user_message: str, search_term: str = None):
    if not user_message:
        return {"error": "no message provided"}

    try:
        games = query_games(search_term if search_term else None)
    except Exception as e:
        print("DB read error:", e)
        games = []

    items = []
    if games:
        for g in games:
            price = g.get("price")
            if isinstance(price, (int, float)):
                price_egp = round(price / 300 * 48, 2)
            else:
                price_egp = "N/A"
            items.append(f"{g.get('name')} - Price: {price_egp}")

        db_context = "Available items (sample):\n" + "\n".join(items)
    else:
        db_context = "No items found in database."

    system_prompt = (
        "You are an assistant for an online game store.\n"
        "You will receive a database context with game rows.\n"
        "OUTPUT RULES (MUST FOLLOW):\n"
        "1) If the user query is about the games in the database, OUTPUT ONLY a valid HTML <table> element and NOTHING ELSE.\n"
        "2) The table MUST include a <thead> and <tbody>. The column headers MUST be exactly: Game, EGP.\n"
        "3) Table cells must contain raw values only (do NOT include the currency text like 'EGP' inside cells). Prices are implicitly in EGP.\n"
        "4) If there are no matching items, output a table with the same headers and an empty <tbody> and a <caption> that says 'No results found'.\n"
        "5) Do NOT wrap the table in markdown or code fences, do NOT add extra sentences, examples, or commentary — HTML ONLY.\n"
        "6) If the user input is NOT related to the games database (e.g., general chit-chat, help, or unrelated questions), answer normally in plain text (no HTML table).\n"
    )
    
    
    
    

    reply = ask_groq(system_prompt, db_context, user_message)

    return {
        "reply": reply,
        "items_in_context": len(games),
        "items": items 
    }
