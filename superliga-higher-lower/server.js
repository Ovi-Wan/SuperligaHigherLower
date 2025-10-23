import express from "express";
import fs from "fs";

const app = express();
const PORT = 3000;

app.use(express.static("public"));

app.get("/api/players", (req, res) => {
  const data = fs.readFileSync("./data/players.json", "utf-8");
  res.json(JSON.parse(data));
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
