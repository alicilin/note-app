/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.raw(`
        CREATE VIRTUAL TABLE notes_fts USING fts5(
            title,
            notebook,
            contents,
            content='notes',
            content_rowid = 'id'
        );
    `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('notes_fts');
};
