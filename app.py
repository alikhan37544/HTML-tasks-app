from flask import Flask, render_template, request, jsonify
import pymysql

app = Flask(__name__)

db = pymysql.connect(host='localhost', user='root', password='admin', database='tasks_db')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/tasks', methods=['GET', 'POST'])
def tasks():
    if request.method == 'POST':
        task_text = request.form['task']
        cursor = db.cursor()
        cursor.execute('INSERT INTO tasks (task_text) VALUES (%s)', (task_text,))
        db.commit()
        cursor.close()

    cursor = db.cursor()
    cursor.execute('SELECT * FROM tasks')
    tasks = cursor.fetchall()
    cursor.close()
    
    return render_template('index.html', tasks=tasks)


@app.route('/task_history')
def task_history():
    cursor = db.cursor()
    cursor.execute('SELECT * FROM tasks ORDER BY created_at DESC')
    task_history = cursor.fetchall()
    cursor.close()
    return jsonify(task_history)


if __name__ == '__main__':
    app.run(debug=True)
