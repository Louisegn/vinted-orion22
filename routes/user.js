const express = require("express");
const router = express.Router();
const cors = require("cors");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const User = require("../models/User");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

router.post("/user/signup", fileUpload(), async (req, res) => {
  try {
    console.log(req.files.avatar);
    if ((await User.findOne({ email: req.body.email })) || !req.body.username) {
      res.status(400).json({ message: "noooop" });
    } else {
      const token = uid2(16);
      const salt = uid2(16);
      const hash = SHA256(req.body.password + salt).toString(encBase64);

      const newUser = new User({
        email: req.body.email,
        account: {
          username: req.body.username,
        },
        newsletter: req.body.newsletter,
        token: token,
        hash: hash,
        salt: salt,
      });

      const result = await cloudinary.uploader.upload(
        convertToBase64(req.files.avatar),
        {
          folder: "vinted/avatar",
          public_id: `${req.body.username}`,
        }
      );

      newUser.account.avatar = result;

      await newUser.save();
      res.json({
        _id: newUser._id,
        token: newUser.token,
        account: newUser.account,
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    const newHash = SHA256(req.body.password + user.salt).toString(encBase64);
    if (user.hash === newHash) {
      res.json({
        id: user.id,
        token: user.token,
        accout: {
          username: user.account.username,
        },
      });
    } else {
      res.status(400).json("noooop");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
