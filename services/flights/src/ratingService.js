const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

const port = process.env.AIRLINE_RATING_PORT || 3003;
const dbURL = process.env.DB_URL;

const app = express();
app.use(express.json());
app.use(cors());

const airlineReviewSchema = new mongoose.Schema({
  airline_id: { type: String, required: true, trim: true },
  reviewer_name: { type: String, required: true, trim: true, maxlength: 100 },
  reviewer_email: { type: String, required: true, trim: true, lowercase: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true, maxlength: 1000 },
  created_at: { type: Date, default: Date.now }
});

const AirlineReviews = mongoose.model("AirlineReviews", airlineReviewSchema);

// Alle Bewertungen für eine Fluggesellschaft abrufen
app.get("/reviews/:airlineId", async (req, res) => {
  try {
    const reviews = await AirlineReviews.find({ airline_id: req.params.airlineId })
      .sort({ created_at: -1 });
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Neue Bewertung erstellen
app.post("/reviews", async (req, res) => {
  try {
    const { airline_id, reviewer_name, reviewer_email, rating, comment } = req.body;
    
    if (!airline_id || !reviewer_name || !reviewer_email || !rating || !comment) {
      return res.status(400).json({ success: false, message: "Alle Felder erforderlich" });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating muss zwischen 1-5 sein" });
    }

    const review = new AirlineReviews({ airline_id, reviewer_name, reviewer_email, rating, comment });
    await review.save();
    
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Bewertung löschen
app.delete("/reviews/:reviewId", async (req, res) => {
  try {
    const review = await AirlineReviews.findByIdAndDelete(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Bewertung nicht gefunden" });
    }
    res.json({ success: true, message: "Bewertung erfolgreich gelöscht" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Bewertungsstatistiken für eine Fluggesellschaft
app.get("/reviews/:airlineId/stats", async (req, res) => {
  try {
    const airlineId = req.params.airlineId;
    const reviews = await AirlineReviews.find({ airline_id: airlineId });
    
    if (reviews.length === 0) {
      return res.json({ 
        success: true, 
        data: { averageRating: 0, totalReviews: 0, distribution: {} } 
      });
    }

    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
    
    const distribution = {};
    for (let i = 1; i <= 5; i++) {
      distribution[i] = reviews.filter(r => r.rating === i).length;
    }

    res.json({
      success: true,
      data: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        distribution
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

mongoose.connect(dbURL)
  .then(() => {
    console.log("Airline Rating Service: DB verbunden");
    app.listen(port, () => {
      console.log(`Airline Rating Service läuft auf Port ${port}`);
    });
  })
  .catch(err => console.error("DB Verbindungsfehler:", err));