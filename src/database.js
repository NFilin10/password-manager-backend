const Pool = require('pg').Pool;

const pool = new Pool({
    user: "postgres",
    password: "9112",
    database: "passwordManager",
    host: "localhost",
    port: "5432"
});

const execute = async (...queries) => {
    try {
        const client = await pool.connect();
        try {
            for (const query of queries) {
                await client.query(query);
            }
            return true;
        } catch (error) {
            console.error('Error executing query:', error.stack);
            return false;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error acquiring client:', error.stack);
        return false;
    }
};

const createTablesQuery = `
  
    CREATE TABLE IF NOT EXISTS "passwords" (
        "id" SERIAL PRIMARY KEY,
        "service_name" VARCHAR(255) NOT NULL,
        "link" varchar(255),
        "login" VARCHAR(255) NOT NULL,
        "password" VARCHAR(255) NOT NULL,
        "logo" VARCHAR(255) NOT NULL,
        "score" DECIMAL
    );
    
    CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "username" VARCHAR(100) NOT NULL,
        "email" VARCHAR(255) NOT NULL,
        "password" VARCHAR(255) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "categories" (
         "id" SERIAL PRIMARY KEY,
        "category_name" VARCHAR(100) NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS "user_categories" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INT NOT NULL,
        "category_id" INT NOT NULL,
        FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS "password_categories" (
        "id" SERIAL PRIMARY KEY,
        "password_id" INT NOT NULL,
        "category_id" INT NOT NULL,
        FOREIGN KEY ("password_id") REFERENCES "passwords" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE CASCADE
);
    
    `;




// A function to execute the create tables query
execute(createTablesQuery).then(result => {
    if (result) {
        console.log('Tables created successfully');
    }
});

module.exports = pool;
