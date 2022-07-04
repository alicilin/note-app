'use strict';
import knex from 'knex';
import path from 'path';
import os from 'os';
export default knex(
    {
        client: 'sqlite3',
        useNullAsDefault: true,
        connection: {
            filename: path.join(os.homedir(), 'Note', 'notes.db')
        }
    }
);