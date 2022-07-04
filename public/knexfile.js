'use strict';
const path = require('path');
module.exports = {
    development: {
        client: 'sqlite3',
        useNullAsDefault: true,
        connection: {
            filename: './test-data/app.db',
        },
        migrations: {
            directory: './migrations'
        }
    },
    production: {
        client: 'sqlite3',
        useNullAsDefault: true,
        connection: {
            filename: './test-data/app.db',
        },
        migrations: {
            directory: './migrations'
        }
    }
};