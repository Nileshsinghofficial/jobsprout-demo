const pgp = require('pg-promise')();
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: process.env.PG_PORT || 5432
};

const db = pgp(dbConfig);

db.connect()
    .then(obj => {
        obj.done();
        console.log('Connected to the PostgreSQL server.');
    })
    .catch(error => {
        console.error('Database connection error:', error.message || error);
    });

module.exports = db;
