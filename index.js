const express = require("express");
const path = require("path");
const app = express();
const port = 3080;

app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.listen(3080, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
