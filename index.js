require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

mongoose.connect(process.env.DATABASE_URI);

const app = express();
app.use(express.json());

const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");

app.use(userRoutes);
app.use(offerRoutes);

app.all("*", () => {
  res.status(404).json({ message: "not found" });
});

app.listen(process.env.PORT, () => {
  console.log("Server has started !");
});
