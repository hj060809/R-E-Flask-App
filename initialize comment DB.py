import sqlite3
from tkinter import N

connection = sqlite3.connect("WEB.db")
cursor = connection.cursor()

cursor.execute("UPDATE sqlite_sequence SET seq = 0 WHERE name = 'comments'")
cursor.execute("DELETE FROM comments")
connection.commit()

connection.close()

#UPDATE SQLITE_SEQUENCE SET seq = 0 WHERE name = 'comments';