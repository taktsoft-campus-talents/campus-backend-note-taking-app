const express = require("express");
const app = express();

app.get("/", (request, response) => {
  return response.json({ message: "Welcome to our note-taking app" });
});

// default catch-all handler
app.get("*", (request, response) => {
  response.status(404).json({ message: "route not defined" });
});

module.exports = app;
