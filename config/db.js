const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: process.env.PG_PORT || 5432
});

// Handle connection errors
client.on('error', (err) => {
    console.error('Database error:', err);
});

client.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Connected to the PostgreSQL server.');
});

module.exports = client;
