const express = require("express");
// Initialize Express
const app = express();
// Create GET request
app.get("/", (req, res) => {
  res.send("Express on Vercel");
});

app.get("/CreateUser", (req,res) => {
  
})

app.get("")

// Initialize server
app.listen(8800, () => {
  console.log("Running on port 8800.");
});