const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");
const cors = require("cors");

const isAuthenticated = require("../middlewares/isAuthenticated");
const Offer = require("../models/Offer");
const User = require("../models/User");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      const newOffer = new Offer({
        product_name: req.body.title,
        product_description: req.body.description,
        product_price: req.body.price,
        product_details: [
          { MARQUE: req.body.brand },
          { TAILLE: req.body.size },
          { ETAT: req.body.condition },
          { COULEUR: req.body.color },
          { EMPLACEMENT: req.body.city },
        ],
        owner: req.user,
      });
      const result = await cloudinary.uploader.upload(
        convertToBase64(req.files.picture),
        {
          folder: "vinted/offers",
          public_id: `${req.body.title} - ${newOffer._id}`,
        }
      );
      newOffer.product_image = result;
      await newOffer.save();
      res.json(newOffer);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

//permettre aux créateurs des annonces de pouvoir les modifier (méthode HTTP PUT) et les supprimer (méthode HTTP DELETE).

// router.put("/offer/update", async (req, res) => {
//   try {
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

router.get("/offers", async (req, res) => {
  try {
    const filtersObj = {};

    if (req.query.title) {
      filtersObj.product_name = new RegExp(req.query.title, "i");
    }

    if (req.query.priceMin) {
      filtersObj.product_price = { $gte: req.query.priceMin };
    }
    if (req.query.priceMax) {
      if (filtersObj.product_price) {
        filtersObj.product_price.$lte = req.query.priceMax;
      } else {
        filtersObj.product_price = { $lte: req.query.priceMax };
      }
    }
    let sortObj = {};
    if (req.query.sort === "price-desc") {
      sortObj.product_price = "desc";
    } else if (req.query.sort === "price-asc") {
      sortObj.product_price = "asc";
    }
    let limit = 3;
    if (req.query.limit) {
      limit = req.query.limit;
    }
    let page = 1;
    if (req.query.page) {
      page = req.query.page;
    }

    const offers = await Offer.find(filtersObj)
      .populate({ path: "owner", select: "account" })
      .sort(sortObj)
      // .select("product_name product_price")
      .limit(limit)
      .skip((page - 1) * limit);
    const count = await Offer.countDocuments(filtersObj);

    res.json({ count: count, offers: offers });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const result = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account.username email",
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
