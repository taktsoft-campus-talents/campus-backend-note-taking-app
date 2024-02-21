const express = require("express");
const port = 3000;
const app = express();

app.get("/", (request, response) => {
  return response.json({ message: "Welcome to our note-taking app" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}.`);
});
