from flask import Flask,render_template,request,jsonify,redirect,url_for,session,abort
from helper import get_game_trailer, get_db_connection, search_and_get_details, insertGameData, insert_game
import sqlite3
from urllib.parse import urlparse
import requests,os
from PIL import Image
import numpy as np
app = Flask(__name__)

app.secret_key = "d1f3a9b2c7e5f4a1d8b6c0e9"
UPLOAD_FOLDER = "static/images"

@app.context_processor
def inject_user_data():
    return {
        'activeUser': session.get('activeUser', ""),
        'balance': session.get('balance', 0.00),
        'cart': session.get('cart', [])
    }
    
@app.route('/')
def home():
    conn = get_db_connection()
    games = conn.execute('SELECT * FROM all_games').fetchall()  # fetch all rows
    conn.close()
    if session.get("activeUser","") == 'admin@game-paradise.com':
            session["activeUser"] = ""
    return render_template("store.html",games=games,q="")


@app.route('/add', methods = ["POST"])
def add():
    if session.get('activeUser',"") != "":
        item = request.json.get('selected')
        if item and item not in session.get('cart',[]):
            session['cart'].append(item)
            session.modified = True
            return ""   
        return "409"
    else:
        return "401"

@app.route('/searchAPI', methods=["POST"])
def searchAPI():
    data = request.get_json()
    game_name = data.get("game", "")
    games = search_and_get_details(game_name)
    return games
    
@app.route('/addToStore', methods = ['POST'])
def addToStore():
    appid = request.get_json().get("appid")
    return insertGameData(appid)
    
@app.route('/search', methods=["POST","GET"])
def search():
    conn = get_db_connection()
    game_name = request.args.get("q", "")
    if urlparse(request.referrer).path == '/':
        games = conn.execute('SELECT * FROM all_games WHERE name LIKE ?', ('%' + game_name + '%',)).fetchall()  # fetch all rows
        conn.close()
        return render_template("store.html",games=games,q=game_name)
    else:
        return render_template('library.html',q=game_name)
        
    

@app.route('/cart', methods=["POST","GET"])
def show_cart():
    if session.get('activeUser',"") != "":
        return render_template("cart.html")
    else:
        return render_template('sign-in.html',link='/cart')

@app.route('/removeFromCart', methods = ['POST'])
def removeFromCart():
    item = request.json.get('selected')
    if item['img_path'] != "all":
        for curr in session.get('cart',[]):
            print(curr['img_path']) 
            if curr['img_path'] == item['img_path']:
                session['cart'].remove(curr)
                session.modified = True
                return ""
    elif item['img_path'] == "all":
        session['cart'].clear() 
        session.modified = True
        return ""
    return jsonify({"error": "No item"}), 400


@app.route('/info')
def info():
    img_path = request.args.get('appid')
    conn = get_db_connection()
    gameInfo = conn.execute('SELECT * FROM all_games WHERE img_path = ?', ('images/'+img_path+'.jpg',)).fetchone()
    screenshots = conn.execute('SELECT * FROM screenshots WHERE game_id = ?', (img_path,)).fetchall()
    screenshots = [dict(row) for row in screenshots]
    img = Image.open('static/images/'+img_path+'.jpg').convert("RGB")
    np_img = np.array(img)
    # Calculate mean color
    average_color = np_img.mean(axis=(0, 1))
    r, g, b = average_color.astype(int)
    hex_color = "#{:02x}{:02x}{:02x}".format(r, g, b)
    
    owned = conn.execute('SELECT count(*) FROM library WHERE appid = ? AND user = ?', (img_path,session.get('activeUser',""))).fetchone()
    conn.close()
    
    return render_template("info.html",
                           game=gameInfo,
                           screenshots=screenshots,
                           bgColor = hex_color, trailer = get_game_trailer(gameInfo['name']), owned = owned['count(*)'])


@app.route('/admin')
def admin():
    if session.get("activeUser") == "admin@game-paradise.com":
        return render_template('admin.html')
    else:
        return abort(403)

@app.route('/login', methods = ['POST','GET'])
def login():
    if request.method == "POST":
        data = request.get_json()
        if data.get("name", "") == "admin@game-paradise.com":
            if data.get("password", "") == "5f57953354e5614695fb3be50860bb5e7be127b90b522b70b599454128a23699":
                session['activeUser'] = "admin@game-paradise.com"
                return "Admin"
            else:
                return "False"
        conn = get_db_connection()
        user = conn.execute('SELECT * FROM users WHERE (name = ? OR email = ?) AND password = ?',(data.get("name", ""),data.get("name", ""),data.get("password", ""))).fetchone()
        conn.close()
        if user and not user['banned']:
            session['activeUser'] = user['name']
            session['balance'] = user['balance']
            session['cart'] = []
            session.modified = True
            return "True"
        elif user['banned']:
            return "banned"
        else:
            return "False"
    if session.get("activeUser","") == 'admin@game-paradise.com':
        session["activeUser"] = ""
    return render_template('sign-in.html',link=request.referrer)

@app.route('/register', methods = ['POST','GET'])
def signup():
    if request.method == "POST":
        data = request.get_json()
        conn = get_db_connection()
        try:
            conn.execute('INSERT INTO users (name,email,password,banned) VALUES (?,?,?,0)',(data['name'],data['email'],data['password']))
            conn.commit()
            conn.close()
            return "True"
        except sqlite3.IntegrityError:
            return "False"
    return render_template('sign-up.html')

@app.route('/logout')
def logout():
    session.clear()
    return ""
    
    
    
@app.route('/library')
def library_page():
    if session.get('activeUser',"") != "":
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
            
        """, (session.get('activeUser',""),)).fetchall()
        conn.close()
        return render_template('library.html', items=rows, q="")
    else:
        return render_template('sign-in.html',link='/library')

@app.route('/api/library')
def api_library():
    conn = get_db_connection()
    q = request.args.get("q","")
    rows = conn.execute("""
        SELECT l.appid,
               COALESCE(g.name, l.name) AS name,
               COALESCE(g.price, l.price) AS price,
               COALESCE(g.img_path, l.img_path) AS img_path
               
        FROM library l
        LEFT JOIN all_games g ON g.appid = l.appid
        WHERE l.user = ? AND COALESCE(g.name, l.name) LIKE ?
        
    """, (session.get('activeUser',""),f"%{q}%",)).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/add_funds', methods=['POST'])
def add_funds():
    if 'activeUser' not in session:
        return jsonify({'error': 'Not logged in'}), 401
        
    amount = request.json.get('amount')
    if not amount or amount <= 0:
        return jsonify({'error': 'Invalid amount'}), 400
        
    conn = get_db_connection()
    try:
        # Update balance in database
        conn.execute('UPDATE users SET balance = balance + ? WHERE name = ?', 
                    (amount, session['activeUser']))
        conn.commit()
        
        # Get updated balance
        new_balance = conn.execute('SELECT balance FROM users WHERE name = ?', 
                                  (session['activeUser'],)).fetchone()['balance']
        session['balance'] = float(new_balance)
        session.modified = True
        return jsonify({'new_balance': session['balance']})
    finally:
        conn.close()

@app.route('/checkout', methods=['POST'])
def checkout():
    if 'activeUser' not in session:
        return jsonify({'error': 'Not logged in'}), 401
        
    total = request.json.get('total')
    payload = request.get_json(silent=True) or {}
    items = payload.get('items') or []
    if not total or total <= 0:
        return jsonify({'error': 'Invalid total amount'}), 400
        
    conn = get_db_connection()
    try:
        # Check balance
        user = conn.execute('SELECT balance FROM users WHERE name = ?', 
                           (session['activeUser'],)).fetchone()
        if user['balance'] < total:
            return jsonify({'error': 'Insufficient funds'}), 400
            
        # Update balance
        new_balance = user['balance'] - total
        conn.execute('UPDATE users SET balance = ? WHERE name = ?', 
                    (new_balance, session['activeUser']))
        conn.commit()
        
        if not isinstance(items, list):
            return jsonify({'error':'items must be a list'}), 400
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
                                VALUES(?,?,?,?,?)""", (session.get('activeUser',""), appid, name, img_path, price))
                if cur.rowcount:
                    added += cur.rowcount
                cur.execute("DELETE FROM wishlist WHERE appid = ? AND user = ?",(appid,session['activeUser'],))
            except Exception:
                pass
        conn.commit()
        session['balance'] = float(new_balance)
        return jsonify({'success': True, 'new_balance': new_balance})
    finally:
        conn.close()

@app.route('/gameplay', methods = ['POST'])
def getGameplay():
    name = request.get_json('name')
    return get_game_trailer(name,'PC Gameplay')


@app.route('/getUsers', methods = ['POST','GET'])
def getUsers():
    conn = get_db_connection()
    users = conn.execute('SELECT email,name,banned FROM users').fetchall()
    conn.close()
    return jsonify([dict(u) for u in users]) # jsonify converts all to json
    
    
@app.route('/ban', methods=['GET','POST'])
def ban():
    data = request.get_json()
    conn = get_db_connection()
    conn.execute('UPDATE users SET banned = ? WHERE name = ?',(data.get("action"),data.get("name"),))
    conn.commit()
    conn.close()
    return ""

@app.route('/transactions', methods = ['POST','GET'])
def trans():
    conn = get_db_connection()
    items = conn.execute('SELECT * FROM library').fetchall()
    conn.close()
    return jsonify([dict(u) for u in items]) # jsonify converts all to json

@app.route('/allGames', methods = ['GET','POST'])
def allGames():
    conn = get_db_connection()
    games = conn.execute('SELECT appid,name,price,img_path FROM all_games').fetchall()  # fetch all rows
    conn.close()
    return ([dict(u) for u in games])
    
    
@app.route('/upload_game', methods=['POST'])
def uploadGame():
    # Validate required fields
    if "cover" not in request.files or "appID" not in request.form or "name" not in request.form or "price" not in request.form:
        return jsonify({"error": "Missing required fields"}), 400

    cover_file = request.files["cover"]
    appID = request.form["appID"]

    if not appID.isdigit():
        return jsonify({"error": "Invalid appID"}), 400

    # Save cover
    cover_filename = f"{appID}.jpg"
    cover_path = os.path.join(UPLOAD_FOLDER, cover_filename)
    cover_file.save(cover_path)

    cover_path = f"images/{cover_filename}"
    # Save screenshots (1 mandatory + 3 optional)
    screenshots_saved = []
    
    for i in range(1, 5):
        key = f"screenshot{i}"
        if key in request.files:
            screenshot_file = request.files[key]
            if screenshot_file and screenshot_file.filename.strip() != "":
                screenshot_filename = f"{appID}{i}.jpg"
    
                # Save to filesystem
                save_path = os.path.join(UPLOAD_FOLDER, screenshot_filename)
                screenshot_file.save(save_path)
    
                # Save relative path for DB
                screenshots_saved.append(f"images/{screenshot_filename}")
            elif i == 1:
                # First screenshot is mandatory
                return jsonify({"error": "screenshot1 is required"}), 400

    # Prepare game data for DB insert
    game_data = {
        'appid': int(appID),
        'name': request.form["name"],
        'img_path': cover_path,
        'price': float(request.form["price"]),
        'rating': float(request.form.get("rating", 0)),
        'genre1': request.form.get("genre1"),
        'genre2': request.form.get("genre2"),
        'description': request.form.get("description"),
        'trademark': request.form.get("trademark"),
        'min_requirements': request.form.get("min_requirements"),
        'rec_requirements': request.form.get("rec_requirements"),
        'langs': request.form.get("langs")
    }
    
    game_data['screenshots'] = screenshots_saved

    # Insert into database
    insert_game(game_data)

    return jsonify({
        "success": True,
        "cover": cover_filename,
        "screenshots": screenshots_saved
    })

@app.route('/fixData', methods = ['GET','POST'])
def fixData():
    conn = get_db_connection()
    data = request.get_json()
    if data.get('mode') == 'fix':
        for key in data.get('data'):
            conn.execute(f'UPDATE all_games SET {key} = ? WHERE appid = ?',(data.get('data').get(key),data.get('appid'),))
    else:
        conn.execute('DELETE FROM all_games WHERE appid = ?',(data.get('appid'),))
        conn.execute('DELETE FROM library WHERE appid = ?',(data.get('appid'),))
        
    conn.commit()
    conn.close()
    return ""
    
    
@app.route('/add_to_wishlist', methods=['POST'])
def add_to_wishlist():
    if 'activeUser' not in session:
        return jsonify({'error': 'Not logged in'}), 401

    item = request.json.get('item')
    if not item:
        return jsonify({'error': 'No item'}), 400

    conn = get_db_connection()
    try:
        # Check if already in wishlist
        existing = conn.execute('SELECT * FROM wishlist WHERE user = ? AND appid = ?', 
                              (session['activeUser'], item['appid'])).fetchone()
        if existing:
            return jsonify({'error': 'Already in wishlist'}), 400

        conn.execute('INSERT INTO wishlist (user, appid, name, img_path, price) VALUES (?, ?, ?, ?, ?)',
                   (session['activeUser'], item['appid'], item['name'], item['img_path'], item['price']))
        conn.commit()
        return jsonify({'success': True})
    finally:
        conn.close()

@app.route('/remove_from_wishlist', methods=['POST'])
def remove_from_wishlist():
    if 'activeUser' not in session:
        return jsonify({'error': 'Not logged in'}), 401

    appid = request.json.get('appid')
    if not appid:
        return jsonify({'error': 'No appid'}), 400

    conn = get_db_connection()
    try:
        conn.execute('DELETE FROM wishlist WHERE user = ? AND appid = ?', 
                   (session['activeUser'], appid,))
        conn.commit()
        return jsonify({'success': True})
    finally:
        conn.close()

@app.route('/api/wishlist')
def api_wishlist():
    if 'activeUser' not in session:
        return jsonify([]), 401

    conn = get_db_connection()
    rows = conn.execute('SELECT * FROM wishlist WHERE user = ?', (session['activeUser'],)).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/wishlist')
def wishlist_page():
    if session.get('activeUser',"") != "":
        return render_template("wishlist.html")
    else:
        return render_template('sign-in.html',link='/wishlist')


@app.route('/addBalance')
def addBalance():
        return ""
    
if __name__ == '__main__':
    app.run(debug=True)
 