import requests
import re
import urllib.parse
import sqlite3

DATABASE = 'store.db'
def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # allows dict-like access
    return conn

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
            "price": item.get("price", {}).get("final", "N/A"),
            "type": item.get("type")
        })

    return results # returns basic results, for rich results (hq images - description):
                   # use appid to search
                   
def get_game_trailer(game_name):
    query = urllib.parse.quote(f"{game_name} Gameplay Trailer")
    url = f"https://www.youtube.com/results?search_query={query}"

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Referer": "https://www.gamespot.com/"
    }

    response = requests.get(url, headers=headers)
    html = response.text

    # Find the first /watch?v=VIDEO_ID link using regex
    match = re.search(r'\/watch\?v=[\w-]{11}', html)
    if match:
        video_url = match.group(0)[9:]
        print(video_url)
        return video_url
    else:
        return None