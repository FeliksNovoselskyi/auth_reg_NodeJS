// ES-modules import
import sqlite3 from 'sqlite3'

const db = new sqlite3.Database('./database.db')

db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        password TEXT 
    ) 
`)

export function addNewUser(username, password) {
    db.run(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, password]
    )
}

export function getUser(username, callback) {
    db.get('SELECT * FROM users WHERE username = ?', [username], (error, row) => {
        if (error) {
            console.log(error.message)
            callback(null)
        } else {
            callback(row)
        }
    })
}