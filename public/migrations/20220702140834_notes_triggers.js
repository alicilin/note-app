/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    let raws = [];
    //-------------------------------------
    raws.push(
        knex.raw(
            `
            CREATE TRIGGER notes_insert AFTER INSERT ON notes
            BEGIN
                INSERT INTO notes_fts (rowid, title, notebook, contents)
                VALUES (new.id, new.title, new.notebook, new.contents);
            END;
            `
        )
    );

    raws.push(
        knex.raw(
            `
            CREATE TRIGGER notes_delete AFTER DELETE ON notes
            BEGIN
                INSERT INTO notes_fts (notes_fts, rowid, title, notebook, contents)
                VALUES ('delete', old.id, old.title, old.notebook, old.contents);
            END;
            `
        )
    );

    raws.push(
        knex.raw(
            `
            CREATE TRIGGER notes_update AFTER UPDATE ON notes
            BEGIN
                INSERT INTO notes_fts (notes_fts, rowid, title, notebook, contents)
                VALUES ('delete', old.id, old.title, old.notebook, old.contents);
                    
                INSERT INTO notes_fts (rowid, title, notebook, contents)
                VALUES (new.id, new.title, new.notebook, new.contents);
            END;
            `
        )
    );

    return Promise.all(raws);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
