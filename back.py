from flask import Flask,render_template,request,jsonify,redirect,url_for,session
from helper import get_game_trailer, get_db_connection, search_and_get_details, getGameData
import sqlite3
import requests
from PIL import Image
import numpy as np
app = Flask(__name__)

app.secret_key = "d1f3a9b2c7e5f4a1d8b6c0e9"

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
    for g in games:
        getGameData(g)
    return ""
    


@app.route('/search', methods=["POST","GET"])
def search():
    conn = get_db_connection()
    game_name = request.args.get("q", "")
    games = conn.execute('SELECT * FROM all_games WHERE name LIKE ?', ('%' + game_name + '%',)).fetchall()  # fetch all rows
    conn.close()
    return render_template("store.html",games=games,q=game_name)

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
        session['cart'] = []  
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
    return render_template('admin.html')

@app.route('/login', methods = ['POST','GET'])
def login():
    if request.method == "POST":
        data = request.get_json()
        conn = get_db_connection()
        user = conn.execute('SELECT * FROM users WHERE (name = ? OR email = ?) AND password = ?',(data.get("name", ""),data.get("name", ""),data.get("password", ""))).fetchone()
        conn.close()
        if user:
            session['activeUser'] = user['name']
            session['balance'] = user['balance']
            session['cart'] = []
            session.modified = True
            return "True"
        else:
            return "False"
    return render_template('sign-in.html',link=request.referrer)

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
        return render_template('library.html', items=rows)
    else:
        return render_template('sign-in.html',link='/library')

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
        
    """, (session.get('activeUser',""),)).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/wishlist',methods = ['GET','POST'])
def wishlist():
    return render_template('wishlist.html')

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
    return get_game_trailer(name,'Full Gameplay')


if __name__ == '__main__':
    app.run(debug=True)
 