/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('notes', table => {
        table.increments('id').primary();
        table.string('title').notNullable();
        table.string('notebook').notNullable().index();
        table.text('contents').notNullable();
        table.timestamps(true, true, true);

        table.index([knex.raw('id desc'), 'notebook'], 'notes_composite_index');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('notes');
};