from flask import Flask,render_template,request,jsonify
from helper import get_game_trailer, get_db_connection, search_and_get_details
import sqlite3
import requests
from PIL import Image
import numpy as np

activeUser = "Abdo Shalaby"
cart = []
app = Flask(__name__)


@app.route('/')
def home():
    conn = get_db_connection()
    games = conn.execute('SELECT * FROM all_games').fetchall()  # fetch all rows
    conn.close()
    return render_template("store.html",games=games,activeUser=activeUser)

@app.route('/add', methods = ["POST"])
def add():
    item = request.json.get('selected')
    if item:
        cart.append(item)
        return ""   
    return jsonify({"error": "No item"}), 400

@app.route('/searchAPI', methods=["POST"])
def searchAPI():
    data = request.get_json()
    game_name = data.get("game", "")
    return jsonify(search_and_get_details(game_name))


@app.route('/search', methods=["POST","GET"])
def search():
    conn = get_db_connection()
    game_name = request.args.get("q", "")
    games = conn.execute('SELECT * FROM all_games WHERE name LIKE ?', ('%' + game_name + '%',)).fetchall()  # fetch all rows
    conn.close()
    return render_template("store.html",games=games,q=game_name,activeUser=activeUser)

@app.route('/cart', methods=["POST","GET"])
def show_cart():
    return render_template("cart.html",activeUser=activeUser,cart=cart)

@app.route('/removeFromCart', methods = ['POST'])
def removeFromCart():
    item = request.json.get('selected')
    if item['img_path'] != "all":
        for curr in cart:
            if curr['img_path'] == item['img_path']:
                cart.remove(curr)
                return ""
    elif item['img_path'] == "all":
        cart.clear()    
        return ""
    return jsonify({"error": "No item"}), 400


@app.route('/info')
def info():
    img_path = request.args.get('appid')
    conn = get_db_connection()
    gameInfo = conn.execute('SELECT * FROM all_games WHERE img_path = ?', ('images/'+img_path+'.jpg',)).fetchone()
    screenshots = conn.execute('SELECT * FROM screenshots WHERE game_id = ?', (img_path,)).fetchall()
    screenshots = [dict(row) for row in screenshots]
    conn.close()
    img = Image.open('static/images/'+img_path+'.jpg').convert("RGB")
    np_img = np.array(img)
    # Calculate mean color
    average_color = np_img.mean(axis=(0, 1))
    r, g, b = average_color.astype(int)
    hex_color = "#{:02x}{:02x}{:02x}".format(r, g, b)
    return render_template("info.html",
                           activeUser=activeUser,
                           game=gameInfo,
                           screenshots=screenshots,
                           bgColor = hex_color, trailer = get_game_trailer(gameInfo['name']))

if __name__ == '__main__':
    app.run(debug=True)
 