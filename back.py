from flask import Flask,render_template
import sqlite3
import requests

DATABASE = 'store.db'
app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # allows dict-like access
    return conn

import requests

def search_and_get_details(search_name, cc="us"):
    search_url = f"https://store.steampowered.com/api/storesearch?term={search_name}&cc={cc}"
    search_data = requests.get(search_url).json()

    results = []
    for item in search_data.get("items", []):
        # Skip DLCs
        if item.get("type") == "dlc":
            continue
        
        results.append({
            "id": item.get("id"),
            "name": item.get("name"),
            "price": item.get("price", {}).get("final_formatted", "N/A"),
            "thumbnail": item.get("header_image"),
            "type": item.get("type")
        })

    return results # returns basic results, for rich results (hq images - description):
                   # use appid to search


@app.route('/')
def home():
    conn = get_db_connection()
    games = conn.execute('SELECT * FROM all_games').fetchall()  # fetch all rows
    conn.close()
    return render_template("library.html",games=games)

if __name__ == '__main__':
    app.run(debug=True)
