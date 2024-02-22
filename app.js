const express = require("express");
const postgres = require("@vercel/postgres");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (request, response) => {
  createTables();
  //table was created => load data
  const { rows } = await postgres.sql`SELECT * FROM notes`;
  return response.json(rows);
});

app.get("/:id", async (request, response) => {
  createTables();
  //table was created => load data
  const { id } = request.params;
  const { rows } = await postgres.sql`SELECT * FROM notes WHERE id = ${id}`;

  if (!rows.length) {
    return response.json({ error: "Note not found." });
  }

  return response.json(rows[0]);
});

app.post("/", async (request, response) => {
  createTables();
  const { content } = request.body;
  if (content) {
    await postgres.sql`INSERT INTO notes (content) VALUES (${content})`;
    response.json({ message: "Successfully created note." });
  } else {
    response.json({ error: "Note NOT created. Content is missing." });
  }
});

/* vegan delete route */
app.delete("/:tofu", async (request, response) => {
  createTables();
  /* const  tofu  = request.params.tofu; */
  const { tofu } = request.params;
  const { rowCount } = await postgres.sql`DELETE FROM notes WHERE id = ${tofu}`;

  if (!rowCount) {
    return response.json({ error: "Note not found." });
  }

  response.json({ message: "Successfully deleted note." });
});

app.put("/:id", async (req, res) => {
  createTables();
  const id = req.params.id;
  const { content } = req.body;

  const { rowCount } =
    await postgres.sql`UPDATE notes SET content = ${content} WHERE id=${id}`;

  if (!rowCount) {
    return res.json({ error: "note not found" });
  }

  return res.json("Successfully edited the note.");
});

app.get("/users/:user", async (req, res) => {
  createTables();
  /* const  user  = req.params.user; */
  const { user } = req.params;

  /* select all notes from a specific user */
  const { rows } =
    await postgres.sql`SELECT * FROM notes RIGHT JOIN users ON notes."userId" = users.id WHERE users.name = ${user}`;

  /* The following query yields the same result */
  /* SELECT * FROM users LEFT JOIN notes ON users.id = notes."userId" WHERE users.name=${user} */

  return res.json(rows);
});

/*
 * - create another route with the method PUT
 * - specific route => "/users/:user/:id"
 * - update note of the incoming id and user
 */

// default catch-all handler
app.get("*", (request, response) => {
  response.status(404).json({ message: "route not defined" });
});

module.exports = app;

/*
 * goal: an app with multiple users with multiple notes
 * - create another table called users
 * - users has to reference the table notes
 *
 * users table:
 * - id
 * - name
 *
 * notes table:
 * - id
 * - content
 * - userId
 */
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
