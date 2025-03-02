from flask import Flask, render_template, request, jsonify
import pymysql

app = Flask(__name__)

db = pymysql.connect(host='localhost', user='tasks_user', password='admin', database='tasks_db')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/tasks', methods=['GET', 'POST'])
def tasks():
    if request.method == 'POST':
        task_text = request.form['task']
        cursor = db.cursor()
        cursor.execute('INSERT INTO tasks (task_text, completed) VALUES (%s, %s)', (task_text, 0))
        db.commit()
        cursor.close()

        cursor = db.cursor()
        cursor.execute('SELECT LAST_INSERT_ID()')
        task_id = cursor.fetchone()[0]
        cursor.close()

        return jsonify(taskId=task_id)

    cursor = db.cursor()
    cursor.execute('SELECT * FROM tasks')
    tasks = cursor.fetchall()
    cursor.close()

    return render_template('index.html', tasks=tasks)


@app.route('/update_task', methods=['POST'])
def update_task():
    task_id = request.form['taskId']
    completed = request.form['completed'].capitalize()
    cursor = db.cursor()
    cursor.execute('UPDATE tasks SET completed = %s WHERE id = %s', (completed, task_id))
    db.commit()
    cursor.close()
    return jsonify(success=True)


@app.route('/task_history')
def task_history():
    cursor = db.cursor()
    cursor.execute('SELECT * FROM tasks ORDER BY created_at DESC')
    task_history = cursor.fetchall()
    cursor.close()
    return jsonify(task_history)

if __name__ == '__main__':
    app.run(debug=True)
