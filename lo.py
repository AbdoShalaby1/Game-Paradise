import requests

# Get all Steam games
applist_url = "https://api.steampowered.com/ISteamApps/GetAppList/v2/"
apps = requests.get(applist_url).json()["applist"]["apps"]

# Pick a game by ID
appid = 570  # Dota 2
game_url = f"https://store.steampowered.com/api/appdetails?appids={appid}"
game_data = requests.get(game_url).json()[str(appid)]["data"]

print(game_data["name"])
print(game_data["release_date"]["date"])
print(game_data["header_image"])
