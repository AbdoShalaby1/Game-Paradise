from flask import Flask,render_template
import sqlite3

DATABASE = 'store.db'
app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # allows dict-like access
    return conn

@app.route('/')
def home():
    conn = get_db_connection()
    games = conn.execute('SELECT * FROM all_games').fetchall()  # fetch all rows
    conn.close()
    return render_template("library.html",games=games)

if __name__ == '__main__':
    app.run(debug=True)
