from flask import Flask, render_template
import pymysql

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)


# db = pymysql.connect(host='localhost', user='username', password='password', database='tasks_db')

# @app.route('/tasks')
# def tasks():
#     cursor = db.cursor()
#     cursor.execute('SELECT * FROM tasks')
#     tasks = cursor.fetchall()
#     cursor.close()
#     return render_template('index.html', tasks=tasks)

