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
            "price": item.get("price", {}).get("final", "N/A"),
            "thumbnail": item.get("tiny_image"),
            "type": item.get("type")
        })

    return results

# Example usage
games = search_and_get_details("call of duty black ops")
for g in games:
    print(g)
