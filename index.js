require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

mongoose.connect(process.env.DATABAS_URL);

const app = express();
app.use(express.json());

const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");

app.use(userRoutes);
app.use(offerRoutes);

app.listen(process.env.PORT, () => {
  console.log("Server has started !");
});
