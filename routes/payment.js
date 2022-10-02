const express = require("express");
const router = express.Router();
const cors = require("cors");

const stripe = require("stripe")(process.env.STRIPE_KEY);
const Offer = require("../models/Offer");

router.post("/payment", async (req, res) => {
  try {
    console.log(req.body.product_id);
    // Réception du token créer via l'API Stripe depuis le Frontend
    const { stripeToken, title, amount, product_id } = req.body;
    // Créer la transaction
    const response = await stripe.charges.create({
      amount: amount,
      currency: "eur",
      description: title,
      // On envoie ici le token
      source: stripeToken,
    });
    console.log(response.status);

    if (response.status === "succeeded") {
      await Offer.findByIdAndDelete(product_id);
    }
    // TODO
    // Sauvegarder la transaction dans une BDD MongoDB

    res.json(response);
  } catch (error) {
    console.log(error.message);
  }
});

module.exports = router;
