from flask import Flask,render_template,request,jsonify,redirect,url_for,session
from helper import get_game_trailer, get_db_connection, search_and_get_details, getGameData
import sqlite3
import requests
from PIL import Image
import numpy as np

cart = []
app = Flask(__name__)
app.secret_key = 'your_secret_key_here'

@app.before_request
def check_session():
    # These routes don't require authentication
    public_routes = [
        'home', 'search', 'login', 'signup', 
        'static', 'info', 'admin'
    ]
    
    # Check if the request endpoint is in public routes
    if request.endpoint in public_routes:
        return
    
    # Check if user is logged in
    if 'user' not in session:
        return redirect(url_for('login'))

@app.context_processor
def inject_user_data():
    return {
        'activeUser': session.get('user', ""),
        'balance': session.get('balance', 0.00)
    }

@app.route('/')
def home():
    conn = get_db_connection()
    games = conn.execute('SELECT * FROM all_games').fetchall()  # fetch all rows
    conn.close()
    return render_template("store.html",games=games)

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
    
@app.route('/add_funds', methods=['POST'])
def add_funds():
    if 'user' not in session:
        return jsonify({'error': 'Not logged in'}), 401
        
    amount = request.json.get('amount')
    if not amount or amount <= 0:
        return jsonify({'error': 'Invalid amount'}), 400
        
    conn = get_db_connection()
    try:
        # Update balance in database
        conn.execute('UPDATE users SET balance = balance + ? WHERE name = ?', 
                    (amount, session['user']))
        conn.commit()
        
        # Get updated balance
        new_balance = conn.execute('SELECT balance FROM users WHERE name = ?', 
                                  (session['user'],)).fetchone()['balance']
        session['balance'] = float(new_balance)
        return jsonify({'new_balance': session['balance']})
    finally:
        conn.close()

@app.route('/checkout', methods=['POST'])
def checkout():
    if 'user' not in session:
        return jsonify({'error': 'Not logged in'}), 401
        
    total = request.json.get('total')
    if not total or total <= 0:
        return jsonify({'error': 'Invalid total amount'}), 400
        
    conn = get_db_connection()
    try:
        # Check balance
        user = conn.execute('SELECT balance FROM users WHERE name = ?', 
                           (session['user'],)).fetchone()
        if user['balance'] < total:
            return jsonify({'error': 'Insufficient funds'}), 400
            
        # Update balance
        new_balance = user['balance'] - total
        conn.execute('UPDATE users SET balance = ? WHERE name = ?', 
                    (new_balance, session['user']))
        conn.commit()
        
        # Add games to library
        for item in cart:
            conn.execute("""INSERT OR IGNORE INTO library(user, appid, name, img_path, price)
                           VALUES(?,?,?,?,?)""", 
                           (session['user'], item.appid, item.name, item.img_path, item.price))
        
        conn.commit()
        session['balance'] = float(new_balance)
        return jsonify({'success': True, 'new_balance': new_balance})
    finally:
        conn.close()

@app.route('/search', methods=["POST","GET"])
def search():
    conn = get_db_connection()
    game_name = request.args.get("q", "")
    games = conn.execute('SELECT * FROM all_games WHERE name LIKE ?', ('%' + game_name + '%',)).fetchall()  # fetch all rows
    conn.close()
    return render_template("store.html",games=games,q=game_name)

@app.route('/cart', methods=["POST","GET"])
def show_cart():
    return render_template("cart.html",cart=cart)

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
                           game=gameInfo,
                           screenshots=screenshots,
                           bgColor = hex_color, trailer = get_game_trailer(gameInfo['name']))


@app.route('/admin')
def admin():
    return render_template('admin.html')

@app.route('/login', methods=['POST', 'GET'])
def login():
    if request.method == "POST":
        data = request.get_json()
        conn = get_db_connection()
        user = conn.execute('SELECT * FROM users WHERE (name = ? OR email = ?) AND password = ?',
                           (data.get("name", ""), data.get("name", ""), data.get("password", ""))).fetchone()
        conn.close()
        if user:
            session['user'] = user['name']
            session['balance'] = float(user.get('balance', 0.00))
            return "True"
        else:
            return "False"
    return render_template('sign-in.html')

@app.route('/logout')
def logout():
    session.pop('user', None)
    session.pop('balance', None)
    return redirect(url_for('home'))

@app.route('/register', methods=['POST','GET'])
def signup():
    if request.method == "POST":
        data = request.get_json()
        conn = get_db_connection()
        try:
            # Add balance to the insert statement
            conn.execute('INSERT INTO users (name,email,password,balance) VALUES (?,?,?,?)',
                        (data['name'], data['email'], data['password'], 0.00))
            conn.commit()
            
            # Get the created user
            user = conn.execute('SELECT * FROM users WHERE name = ?', (data['name'],)).fetchone()
            conn.close()
            
            # Log the user in
            session['user'] = user['name']
            session['balance'] = float(user.get('balance', 0.00))
            return "True"
        except sqlite3.IntegrityError:
            return "False"
    return render_template('sign-up.html')
    
    
    
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
        
    """, (session['user'],)).fetchall()
    conn.close()
    return render_template('library.html', items=rows)

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
        
    """, (session['user'],)).fetchall()
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
                           VALUES(?,?,?,?,?)""", (session['user'], appid, name, img_path, price))
            if cur.rowcount:
                added += cur.rowcount
        except Exception:
            pass
    conn.commit()
    conn.close()
    return jsonify({'ok': True, 'added': added})

@app.route('/add_to_wishlist', methods=['POST'])
def add_to_wishlist():
    if 'user' not in session:
        return jsonify({'error': 'Not logged in'}), 401
        
    item = request.json.get('item')
    if not item:
        return jsonify({'error': 'No item'}), 400
        
    conn = get_db_connection()
    try:
        # Check if already in wishlist
        existing = conn.execute('SELECT * FROM wishlist WHERE user = ? AND appid = ?', 
                              (session['user'], item['appid'])).fetchone()
        if existing:
            return jsonify({'error': 'Already in wishlist'}), 400
            
        conn.execute('INSERT INTO wishlist (user, appid, name, img_path, price) VALUES (?, ?, ?, ?, ?)',
                   (session['user'], item['appid'], item['name'], item['img_path'], item['price']))
        conn.commit()
        return jsonify({'success': True})
    finally:
        conn.close()

@app.route('/remove_from_wishlist', methods=['POST'])
def remove_from_wishlist():
    if 'user' not in session:
        return jsonify({'error': 'Not logged in'}), 401
        
    appid = request.json.get('appid')
    if not appid:
        return jsonify({'error': 'No appid'}), 400
        
    conn = get_db_connection()
    try:
        conn.execute('DELETE FROM wishlist WHERE user = ? AND appid = ?', 
                   (session['user'], appid))
        conn.commit()
        return jsonify({'success': True})
    finally:
        conn.close()

@app.route('/api/wishlist')
def api_wishlist():
    if 'user' not in session:
        return jsonify([]), 401
        
    conn = get_db_connection()
    rows = conn.execute('SELECT * FROM wishlist WHERE user = ?', (session['user'],)).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/wishlist')
def wishlist_page():
    # Session now handles authentication
    return render_template('wishlist.html')

if __name__ == '__main__':
    app.run(debug=True)
 