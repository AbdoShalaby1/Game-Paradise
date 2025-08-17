from flask import Flask,render_template,request,jsonify,redirect,url_for
from helper import get_game_trailer, get_db_connection, search_and_get_details, getGameData
import sqlite3
import requests
from PIL import Image
import numpy as np

activeUser = ""
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
    games = search_and_get_details(game_name)
    for g in games:
        getGameData(g)
    return ""
    


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


@app.route('/admin')
def admin():
    return render_template('admin.html')

@app.route('/login', methods = ['POST','GET'])
def login():
    global activeUser
    if request.method == "POST":
        data = request.get_json()
        conn = get_db_connection()
        user = conn.execute('SELECT * FROM users WHERE (name = ? OR email = ?) AND password = ?',(data.get("name", ""),data.get("name", ""),data.get("password", ""))).fetchone()
        conn.close()
        if user:
            activeUser = user['name']
            return "True"
        else:
            return "False"
    return render_template('sign-in.html',activeUser=activeUser)

@app.route('/register', methods = ['POST','GET'])
def signup():
    if request.method == "POST":
        data = request.get_json()
        conn = get_db_connection()
        try:
            conn.execute('INSERT INTO users (name,email,password) VALUES (?,?,?)',(data['name'],data['email'],data['password']))
            conn.commit()
            conn.close()
            return "True"
        except sqlite3.IntegrityError:
            return "False"
    return render_template('sign-up.html',activeUser=activeUser)

@app.route('/logout')
def logout():
    global activeUser
    activeUser = ""
    return ""
    
    
    
@app.route('/library')
def library_page():
    # Render library page template (Jinja)
    conn = get_db_connection()
    rows = conn.execute("""
        SELECT l.appid,
               COALESCE(g.name, l.name) AS name,
               COALESCE(g.price, l.price) AS price,
               COALESCE(g.img_path, l.img_path) AS img_path
               
        FROM library l
        LEFT JOIN all_games g ON g.appid = l.appid
        WHERE l.user = ?
        
    """, (activeUser,)).fetchall()
    conn.close()
    return render_template('library.html', activeUser=activeUser, items=rows)

@app.route('/api/library')
def api_library():
    conn = get_db_connection()
    rows = conn.execute("""
        SELECT l.appid,
               COALESCE(g.name, l.name) AS name,
               COALESCE(g.price, l.price) AS price,
               COALESCE(g.img_path, l.img_path) AS img_path
               
        FROM library l
        LEFT JOIN all_games g ON g.appid = l.appid
        WHERE l.user = ?
        
    """, (activeUser,)).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/library/bulk', methods=['POST'])
def api_library_bulk():
    payload = request.get_json(silent=True) or {}
    items = payload.get('items') or []
    if not isinstance(items, list):
        return jsonify({'error':'items must be a list'}), 400
    conn = get_db_connection()
    cur = conn.cursor()
    added = 0
    for it in items:
        appid = it.get('appid') or it.get('id') or ''
        name = it.get('name') or it.get('title')
        img_path = it.get('img_path') or it.get('image')
        price = it.get('price')
        if not appid:
            # try to derive appid from filename
            src = (img_path or '')
            if '/' in src:
                appid = src.split('/')[-1].split('.')[0]
        if not appid:
            continue
        try:
            cur.execute("""INSERT OR IGNORE INTO library(user, appid, name, img_path, price)
                           VALUES(?,?,?,?,?)""", (activeUser, appid, name, img_path, price))
            if cur.rowcount:
                added += cur.rowcount
        except Exception:
            pass
    conn.commit()
    conn.close()
    return jsonify({'ok': True, 'added': added})

if __name__ == '__main__':
    app.run(debug=True)
 