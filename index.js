require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

mongoose.connect(process.env.DATABASE_URI);
// mongoose.connect("mongodb://localhost/vinted-project");

const app = express();
app.use(express.json());
app.use(cors());

const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");

app.use(userRoutes);
app.use(offerRoutes);

app.all("*", (req, res) => {
  res.status(404).json({ message: "not found" });
});

app.listen(process.env.PORT, () => {
  console.log("Server has started !");
});
