const express = require("express"); //default import/export
const postgres = require("@vercel/postgres");
const cors = require("cors");
const index = require("./routes");

const app = express();

app.use("/", index);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

/*
 * - create another route with the method PUT
 * - specific route => "/users/:user/:id"
 * - update note of the incoming id and user
 */
app.put("/users/:user/:id", async (req, res) => {
  await createTables();
  const user = req.params.user; //eric
  const notesId = req.params.id; //5
  const { content } = req.body;

  if (content) {
    /* first check to see if we can find the user */
    const {
      rows: [{ id }],
    } = await postgres.sql`SELECT id FROM users WHERE users.name = ${user}`;

    /* 
    { rowCount: 1, 
        rows: [ { id:1 } ] 
    }
    */

    /* then use that user's id to update the requested note */
    const { rowCount } =
      await postgres.sql`UPDATE notes SET content = ${content} WHERE notes."userId" = ${id} AND notes.id = ${notesId}`;

    if (!rowCount) {
      return res.json({ error: "note not found" });
    }

    return res.json("Successfully edited note");
  } else {
    return res.json("Note NOT created since content is missing.");
  }
});

// default catch-all handler
app.get("*", (request, response) => {
  response.status(404).json({ error: "route not defined" });
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
