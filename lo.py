import requests,sqlite3,os

DATABASE = 'store.db'
def search_and_get_details(search_name, cc="us"):
    search_url = f"https://store.steampowered.com/api/storesearch?term={search_name}&cc={cc}"
    search_data = requests.get(search_url).json()

    results = []
    for item in search_data.get("items", []):
        # Skip DLCs
        if item.get("type") == "dlc" or item.get("price") == None:
            continue
        
        results.append({
            "id": item.get("id"),
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

    game_details = {
        "appid": info.get("steam_appid"),
        "name": info.get("name"),
        "type": info.get("type"),
        "languages": info.get("supported_languages"),
        "price": info.get("price_overview", {}).get("final"),
        "header_image": info.get("header_image"),
        "about_the_game": info.get("about_the_game"),
        "trailer": info.get("movies"),
        "min_requirements": info.get("pc_requirements")['minimum'],
        "rec_requirements": (info.get("pc_requirements", {}).get("recommended")
            or info.get("pc_requirements", {}).get("minimum")),
        "genre1": genre_list[0] if len(genre_list) > 0 else None,
        "genre2": genre_list[1] if len(genre_list) > 1 else "Single Player",
        "trademark_text": info.get("legal_notice"),
        "screenshots": [s.get("path_thumbnail") for s in info.get("screenshots", [])[:4]],
        "score": (reviewData['positive'] / (reviewData['positive'] + reviewData['negative'])) * 100
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

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # allows dict-like access
    return conn

games = search_and_get_details(input("game: "))
for g in games:
    print(f"{g['name']} - {g['price']}")
    ans = input("Add to database? ")
    if ans.lower() == "yes":
        details = get_steam_game_details(g['id'])  # get full game info
        if details and all(bool(value) for value in details.values()):
            conn = get_db_connection()
            path = download_steam_image(details['header_image'], str(g['id']) + ".jpg")
            for idx,img in enumerate(details['screenshots']):
                scrPath = download_steam_image(img, str(g['id']) + str(idx) + ".jpg")
                scrPath = scrPath.replace("\\", "/")[7:]
                conn.execute(
                    '''
                    INSERT INTO screenshots (game_id,img_path)
                    VALUES (?,?)
                    ''',
                    (g['id'],scrPath)
                )
            genre2 = details.get("genre2")
            path = path.replace("\\", "/")[7:]

            conn.execute(
                '''
                INSERT INTO all_games (
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
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''',
                (
                    details['name'],
                    details['price'],
                    path,
                    details.get('about_the_game'),
                    details.get('genre1'),
                    genre2,
                    details.get('trademark_text'),
                    details.get('score'),
                    details.get('min_requirements'),
                    details.get('rec_requirements'),
                    details.get('languages')
                )
            )
            conn.commit()
            conn.close()


