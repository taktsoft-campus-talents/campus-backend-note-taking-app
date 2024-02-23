/* Hauptpfad ("/") */
const { Router } = require("express");
const postgres = require("@vercel/postgres");
const users = require("./users.route");

const r = Router();

r.use("/users/:user", users);

r.get("/", async (request, response) => {
  createTables();
  //table was created => load data
  const { rows } = await postgres.sql`SELECT * FROM notes`;
  return response.json(rows);
});

module.exports = r;

async function createTables() {
  await postgres.sql`CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE
        )`;
  await postgres.sql`CREATE TABLE IF NOT EXISTS notes (
          id SERIAL PRIMARY KEY,
          content VARCHAR(255),
          "userId" INTEGER REFERENCES users (id)
      )`;
}
