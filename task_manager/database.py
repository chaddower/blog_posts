import sqlite3
import json

class Database:
    def __init__(self, db_name):
        self.db_name = db_name
        self.conn = sqlite3.connect(db_name)
        self.create_table()

    def create_table(self):
        cursor = self.conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                task_id TEXT PRIMARY KEY,
                description TEXT,
                completed INTEGER,
                created_at TEXT,
                completed_at TEXT
            )
        ''')
        self.conn.commit()

    def add_task(self, task_dict):
        cursor = self.conn.cursor()
        cursor.execute('''
            INSERT INTO tasks (task_id, description, completed, created_at, completed_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            task_dict['task_id'],
            task_dict['description'],
            int(task_dict['completed']),
            task_dict['created_at'],
            task_dict['completed_at']
        ))
        self.conn.commit()

    def get_all_tasks(self):
        cursor = self.conn.cursor()
        cursor.execute('SELECT * FROM tasks')
        rows = cursor.fetchall()
        return [self.row_to_dict(row) for row in rows]

    def get_task(self, task_id):
        cursor = self.conn.cursor()
        cursor.execute('SELECT * FROM tasks WHERE task_id = ?', (task_id,))
        row = cursor.fetchone()
        return self.row_to_dict(row) if row else None

    def update_task(self, task_dict):
        cursor = self.conn.cursor()
        cursor.execute('''
            UPDATE tasks
            SET description = ?, completed = ?, created_at = ?, completed_at = ?
            WHERE task_id = ?
        ''', (
            task_dict['description'],
            int(task_dict['completed']),
            task_dict['created_at'],
            task_dict['completed_at'],
            task_dict['task_id']
        ))
        self.conn.commit()

    def delete_task(self, task_id):
        cursor = self.conn.cursor()
        cursor.execute('DELETE FROM tasks WHERE task_id = ?', (task_id,))
        self.conn.commit()

    def row_to_dict(self, row):
        return {
            "task_id": row[0],
            "description": row[1],
            "completed": bool(row[2]),
            "created_at": row[3],
            "completed_at": row[4]
        }

    def close(self):
        self.conn.close()

    def backup_database(self, backup_file):
        with open(backup_file, 'w') as f:
            for task in self.get_all_tasks():
                f.write(json.dumps(task) + '\n')

    def restore_database(self, backup_file):
        cursor = self.conn.cursor()
        cursor.execute('DELETE FROM tasks')
        with open(backup_file, 'r') as f:
            for line in f:
                task = json.loads(line.strip())
                self.add_task(task)
        self.conn.commit()

    def get_task_count(self):
        cursor = self.conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM tasks')
        return cursor.fetchone()[0]

    def get_completed_task_count(self):
        cursor = self.conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM tasks WHERE completed = 1')
        return cursor.fetchone()[0]

    def get_incomplete_task_count(self):
        cursor = self.conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM tasks WHERE completed = 0')
        return cursor.fetchone()[0]

    def clear_all_tasks(self):
        cursor = self.conn.cursor()
        cursor.execute('DELETE FROM tasks')
        self.conn.commit()