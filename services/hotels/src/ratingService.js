const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

const port = process.env.RATING_PORT || 3001;
const dbURL = process.env.DB_URL;

const app = express();
app.use(express.json());
app.use(cors());

const reviewSchema = new mongoose.Schema({
  hotel_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotels', required: true },
  reviewer_name: { type: String, required: true, trim: true, maxlength: 100 },
  reviewer_email: { type: String, required: true, trim: true, lowercase: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true, maxlength: 1000 },
  created_at: { type: Date, default: Date.now }
});

const Reviews = mongoose.model("Reviews", reviewSchema);

app.get("/reviews/:hotelId", async (req, res) => {
  try {
    const reviews = await Reviews.find({ hotel_id: req.params.hotelId })
      .sort({ created_at: -1 });
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


app.post("/reviews", async (req, res) => {
  try {
    const { hotel_id, reviewer_name, reviewer_email, rating, comment } = req.body;
    
    if (!hotel_id || !reviewer_name || !reviewer_email || !rating || !comment) {
      return res.status(400).json({ success: false, message: "Alle Felder erforderlich" });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating muss 1-5 sein" });
    }

    const review = new Reviews({ hotel_id, reviewer_name, reviewer_email, rating, comment });
    await review.save();
    
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


app.delete("/reviews/:reviewId", async (req, res) => {
  try {
    const review = await Reviews.findByIdAndDelete(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Bewertung nicht gefunden" });
    }
    res.json({ success: true, message: "Bewertung gelöscht" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


app.get("/reviews/:hotelId/stats", async (req, res) => {
  try {
    const hotelId = req.params.hotelId;
    const reviews = await Reviews.find({ hotel_id: hotelId });
    
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
    console.log("Rating Service: DB connected");
    app.listen(port, () => {
      console.log(`Rating Service running on port ${port}`);
    });
  })
  .catch(err => console.error("DB connection error:", err));

