import requests
import re , os
import urllib.parse
import sqlite3

def get_db_connection(DATABASE = 'store.db'):
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # allows dict-like access
    return conn

def search_and_get_details(search_name, cc="us"):
    search_url = f"https://store.steampowered.com/api/storesearch?term={search_name}&cc={cc}"
    search_data = requests.get(search_url).json()

    results = []
    for item in search_data.get("items", []):
        # Skip DLCs
        if item.get("type") == "dlc" or item.get("price") == None:
            continue
        
        results.append({
            "appid": item.get("id"),
            "name": item.get("name"),
            "price": item.get("price", {}).get("final", "N/A"),
            "thumbnail": item.get("tiny_image"),
            "type": item.get("type")
        })

    return results

def get_steam_game_details(appid, country="us", language="en"):
    """
    Fetch game details from Steam by AppID.
    """
    url = f"https://store.steampowered.com/api/appdetails?appids={appid}&cc={country}&l={language}"
    response = requests.get(url)
    data = response.json()

    reviewData = requests.get(f"https://steamspy.com/api.php?request=appdetails&appid={appid}").json()

    if not data[str(appid)]["success"]:
        return None  # appid not found

    info = data[str(appid)]["data"]
    genres = info.get("genres", [])
    genre_list = [g.get("description") for g in genres[:2]]
    pc_req = info.get("pc_requirements", {})
    
    if isinstance(pc_req, dict):
        min_req = pc_req.get("minimum")
        rec_req = pc_req.get("recommended") or pc_req.get("minimum")
    else:
        # it was a list or something else -> treat as None
        min_req = None
        rec_req = None
        
    game_details = {
        "appid": info.get("steam_appid"),
        "name": info.get("name"),
        "type": info.get("type"),
        "langs": info.get("supported_languages"),
        "price": info.get("price_overview", {}).get("final"),
        "header_image": info.get("header_image"),
        "description": info.get("about_the_game"),
        "trailer": info.get("movies"),
        "min_requirements": min_req,
        "rec_requirements": rec_req,
        "genre1": genre_list[0] if len(genre_list) > 0 else None,
        "genre2": genre_list[1] if len(genre_list) > 1 else "Single Player",
        "trademark": info.get("legal_notice"),
        "screenshots": [s.get("path_thumbnail") for s in info.get("screenshots", [])[:4]],
        "rating": (
            (reviewData["positive"] / (reviewData["positive"] + reviewData["negative"]) * 100)
            if (reviewData["positive"] + reviewData["negative"]) != 0
            else None
        )
        
    }

    return game_details


def download_steam_image(url, filename=None):
    save_folder="static\\images"
    """
    Download an image from a URL and save it to a folder.
    """
    if not os.path.exists(save_folder):
        os.makedirs(save_folder)  # create folder if it doesn't exist

    file_path = os.path.join(save_folder, filename)

    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()  # check for errors

        with open(file_path, "wb") as f:
            for chunk in response.iter_content(1024):
                f.write(chunk)

        print(f"Downloaded: {file_path}")
        return file_path
    except requests.RequestException as e:
        print("Error downloading image:", e)
        return None
                   
def get_game_trailer(game_name,type='Gameplay Trailer'):
    query = urllib.parse.quote(f"{game_name} {type}")
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
    
    
def insertGameData(appid):
    details = get_steam_game_details(appid) 
    if not details:
        return ["details_missing"]

    required_fields = [
        "appid",
        "name",
        "price",
        "header_image", 
        "screenshots", 
        "description",
        "genre1",
        "genre2",
        "trademark",
        "rating",
        "min_requirements",
        "rec_requirements",
        "langs"
    ]

    # Collect missing fields

    conn = get_db_connection()
    path = download_steam_image(details['header_image'], appid + ".jpg")

    for idx, img in enumerate(details['screenshots']):
        scrPath = download_steam_image(img, appid + str(idx) + ".jpg")
        scrPath = scrPath.replace("\\", "/")[7:]
        conn.execute(
            '''
            INSERT INTO screenshots (game_id,img_path)
            VALUES (?,?)
            ''',
            (appid, scrPath)
        )

    path = path.replace("\\", "/")[7:]
    genre2 = details.get("genre2")

    try:
        conn.execute(
            '''
            INSERT INTO all_games (
                appid,
                name,
                price,
                img_path,
                description,
                genre1,
                genre2,
                trademark,
                rating,
                min_requirements,
                rec_requirements,
                langs
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''',
            (
                details['appid'],
                details['name'],
                details['price'],
                path,
                details.get('description'),
                details.get('genre1'),
                genre2,
                details.get('trademark'),
                details.get('rating'),
                details.get('min_requirements'),
                details.get('rec_requirements'),
                details.get('langs')
            )
        )

        conn.commit()
        missing = [field for field in required_fields if not details.get(field)]
        if missing:
            return missing
        return []
    except:
        conn.close()
        return ["Exists already!"]
    
    
    
    
def insert_game(game_data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO all_games (
            appid, name, img_path, price, rating, genre1, genre2, 
            description, trademark, min_requirements, rec_requirements, 
            langs, trailer
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        game_data['appid'],
        game_data['name'],
        game_data['img_path'],
        game_data['price'],
        game_data.get('rating'),
        game_data.get('genre1'),
        game_data.get('genre2'),
        game_data.get('description'),
        game_data.get('trademark'),
        game_data.get('min_requirements'),
        game_data.get('rec_requirements'),
        game_data.get('langs')
    ))
    
    screenshots = game_data.get('screenshots', [])
    for screenshot_path in screenshots:
        cursor.execute("""
            INSERT INTO screenshots (game_id, img_path)
            VALUES (?, ?)
        """, (game_data['appid'], screenshot_path))
        
    conn.commit()
    conn.close()