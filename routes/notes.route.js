/* Notes route ("/users/:user/:id") */
const { Router } = require("express");
const postgres = require("@vercel/postgres");

const r = Router({ mergeParams: true });

r.get("/", async (req, res) => {
  createTables();
  const { user, id } = req.params;

  /* select a single note from a specific user */
  const { rows } =
    await postgres.sql`SELECT * FROM users LEFT JOIN notes ON notes."userId" = users.id WHERE users.name = ${user} AND notes.id = ${id}`;

  if (!rows.length) {
    return res.json({ message: "note not found" });
  }

  return res.json(rows[0]);
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
