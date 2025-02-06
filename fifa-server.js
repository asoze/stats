const express = require("express");
const fs = require("fs");

const app = express();
const PORT = 3099;

function initializeData() {
  try {
    const data = fs.readFileSync("fc-24.json", "utf8");
    jsonData = JSON.parse(data);
    console.log("JSON data loaded successfully");
  } catch (err) {
    console.error("Error loading JSON file:", err);
  }
}

// Call the function to initialize data on startup
initializeData();

// Route: Get all data
app.get("/data", (req, res) => {
  if (!jsonData) return res.status(500).json({ error: "Data not loaded" });
  res.json(jsonData.slice(0, 10));
});

app.get("/players/:id", (req, res) => {
  if (!jsonData || !jsonData.items) {
    return res.status(500).json({ error: "Data not loaded" });
  }

  const itemId = parseInt(req.params.id, 10); // Ensure ID is treated as a number
  const item = jsonData.items.find((item) => item.id === itemId);

  if (!item) {
    return res.status(404).json({ error: "Item not found" });
  }

  res.json(item);
});

// app.get("/players/:name", (req, res) => {
//   if (!jsonData || !jsonData.items) {
//     return res.status(500).json({ error: "Data not loaded" });
//   }

//   const fname = req.params.fname;
//   const lname = req.params.lname;

//   console.log("fnamelname", fname, lname);

//   const item = jsonData.items.find(
//     (item) => item.firstName === fname && item.lastName === lname,
//   );

//   if (!item) {
//     return res.status(404).json({ error: "Item not found" });
//   }

//   res.json(item);
// });

app.get("/players", (req, res) => {
  if (!jsonData) return res.status(500).json({ error: "Data not loaded" });
  const names = jsonData.items.map((item) => ({
    firstName: item.firstName,
    lastName: item.lastName,
    id: item.id,
  }));

  const limit = names.slice(0, 10);

  res.json(limit);
});

app.get("/statFilter", (req, res) => {
  if (!jsonData || !jsonData.items) {
    return res.status(500).json({ error: "Data not loaded" });
  }

  const { stat, min, max } = req.query;

  if (!stat) {
    return res.status(400).json({ error: "Missing 'stat' query parameter" });
  }

  // Convert min and max to numbers if provided
  const minValue = min ? parseFloat(min) : Number.NEGATIVE_INFINITY;
  const maxValue = max ? parseFloat(max) : Number.POSITIVE_INFINITY;

  // Filter players based on the given stat range
  const filteredPlayers = jsonData.items.filter((player) => {
    if (!player.stats || player.stats[stat] === undefined) {
      return false; // Skip players missing the stat
    }

    const statValue = parseFloat(player.stats[stat].value);
    return statValue >= minValue && statValue <= maxValue;
  });

  const limit = filteredPlayers.slice(0, 10);

  res.json({
    total: limit.length,
    data: limit,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
