const express = require("express");
const postgres = require("@vercel/postgres");
const app = express();

app.get("/", async (request, response) => {
  createNotes();
  //table was created => load data
  const { rows } = await postgres.sql`SELECT * FROM notes`;
  return response.json(rows);
});

// default catch-all handler
app.get("*", (request, response) => {
  response.status(404).json({ message: "route not defined" });
});

module.exports = app;

/*
 * - we want to create a new table called notes
 * - from within our code
 */
async function createNotes() {
  await postgres.sql`CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        content VARCHAR(255)
    )`;
}
