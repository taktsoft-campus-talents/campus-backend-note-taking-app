/* Users route ("/users/:user") */
const { Router } = require("express");
const postgres = require("@vercel/postgres");
const notes = require("./notes.route");

const r = Router({ mergeParams: true }); // enables us to access "user" req.params

r.use("/users/:user/:id", notes);

r.get("/", async (req, res) => {
  createTables();
  /* const  user  = req.params.user; */
  const { user } = req.params;

  /* select all notes from a specific user */
  const { rows } =
    await postgres.sql`SELECT * FROM users LEFT JOIN notes ON notes."userId" = users.id WHERE users.name = ${user}`;

  return res.json(rows);
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
