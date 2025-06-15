const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

const port = process.env.PORT;
const dbURL = process.env.DB_URL;

const app = express();
app.use(express.json());
app.use(cors());

// Einheitliches Review-Schema für alle Service-Typen
const reviewSchema = new mongoose.Schema({
  service_type: { 
    type: String, 
    required: true, 
    enum: ['hotel', 'airline', 'car'],
    trim: true 
  },
  entity_id: { type: String, required: true, trim: true },
  reviewer_name: { type: String, required: true, trim: true, maxlength: 100 },
  reviewer_email: { type: String, required: true, trim: true, lowercase: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true, maxlength: 1000 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Index für bessere Performance
reviewSchema.index({ service_type: 1, entity_id: 1 });
reviewSchema.index({ created_at: -1 });

const Reviews = mongoose.model("Reviews", reviewSchema);

// Hilfsfunktion für Validierung
const validateServiceType = (serviceType) => {
  return ['hotel', 'airline', 'car'].includes(serviceType);
};

// Hilfsfunktion für Error Handling
const handleError = (res, error, statusCode = 500) => {
  console.error('Error:', error);
  return res.status(statusCode).json({ 
    success: false, 
    message: error.message || 'Ein Fehler ist aufgetreten' 
  });
};

// 1. Alle Bewertungen für eine Entität abrufen (READ)
app.get("/reviews/:serviceType/:entityId", async (req, res) => {
  try {
    const { serviceType, entityId } = req.params;
    
    if (!validateServiceType(serviceType)) {
      return res.status(400).json({ 
        success: false, 
        message: "Service-Typ muss 'hotel', 'airline' oder 'car' sein" 
      });
    }

    const reviews = await Reviews.find({ 
      service_type: serviceType, 
      entity_id: entityId 
    }).sort({ created_at: -1 });

    res.json({ 
      success: true, 
      data: reviews,
      count: reviews.length 
    });
  } catch (err) {
    handleError(res, err);
  }
});

// 2. Einzelne Bewertung abrufen (READ)
app.get("/reviews/single/:reviewId", async (req, res) => {
  try {
    const review = await Reviews.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: "Bewertung nicht gefunden" 
      });
    }

    res.json({ success: true, data: review });
  } catch (err) {
    handleError(res, err);
  }
});

// 3. Neue Bewertung erstellen (CREATE)
app.post("/reviews", async (req, res) => {
  try {
    const { service_type, entity_id, reviewer_name, reviewer_email, rating, comment } = req.body;
    
    // Validierung
    if (!service_type || !entity_id || !reviewer_name || !reviewer_email || !rating || !comment) {
      return res.status(400).json({ 
        success: false, 
        message: "Alle Felder sind erforderlich: service_type, entity_id, reviewer_name, reviewer_email, rating, comment" 
      });
    }
    
    if (!validateServiceType(service_type)) {
      return res.status(400).json({ 
        success: false, 
        message: "Service-Typ muss 'hotel', 'airline' oder 'car' sein" 
      });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: "Rating muss zwischen 1 und 5 liegen" 
      });
    }

    // Email-Format validieren
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(reviewer_email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Ungültiges E-Mail-Format" 
      });
    }

    const review = new Reviews({ 
      service_type, 
      entity_id, 
      reviewer_name, 
      reviewer_email, 
      rating, 
      comment 
    });
    
    const savedReview = await review.save();
    
    res.status(201).json({ 
      success: true, 
      data: savedReview,
      message: "Bewertung erfolgreich erstellt" 
    });
  } catch (err) {
    handleError(res, err);
  }
});

// 4. Bewertung aktualisieren (UPDATE)
app.put("/reviews/:reviewId", async (req, res) => {
  try {
    const { reviewer_name, reviewer_email, rating, comment } = req.body;
    
    // Validierung
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ 
        success: false, 
        message: "Rating muss zwischen 1 und 5 liegen" 
      });
    }

    if (reviewer_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(reviewer_email)) {
        return res.status(400).json({ 
          success: false, 
          message: "Ungültiges E-Mail-Format" 
        });
      }
    }

    const updateData = { updated_at: new Date() };
    if (reviewer_name) updateData.reviewer_name = reviewer_name;
    if (reviewer_email) updateData.reviewer_email = reviewer_email;
    if (rating) updateData.rating = rating;
    if (comment) updateData.comment = comment;

    const updatedReview = await Reviews.findByIdAndUpdate(
      req.params.reviewId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ 
        success: false, 
        message: "Bewertung nicht gefunden" 
      });
    }

    res.json({ 
      success: true, 
      data: updatedReview,
      message: "Bewertung erfolgreich aktualisiert" 
    });
  } catch (err) {
    handleError(res, err);
  }
});

// 5. Bewertung löschen (DELETE)
app.delete("/reviews/:reviewId", async (req, res) => {
  try {
    const deletedReview = await Reviews.findByIdAndDelete(req.params.reviewId);
    
    if (!deletedReview) {
      return res.status(404).json({ 
        success: false, 
        message: "Bewertung nicht gefunden" 
      });
    }

    res.json({ 
      success: true, 
      message: "Bewertung erfolgreich gelöscht",
      data: deletedReview 
    });
  } catch (err) {
    handleError(res, err);
  }
});

// 6. Bewertungsstatistiken für eine Entität
app.get("/reviews/:serviceType/:entityId/stats", async (req, res) => {
  try {
    const { serviceType, entityId } = req.params;
    
    if (!validateServiceType(serviceType)) {
      return res.status(400).json({ 
        success: false, 
        message: "Service-Typ muss 'hotel', 'airline' oder 'car' sein" 
      });
    }

    const reviews = await Reviews.find({ 
      service_type: serviceType, 
      entity_id: entityId 
    });
    
    if (reviews.length === 0) {
      return res.json({ 
        success: true, 
        data: { 
          averageRating: 0, 
          totalReviews: 0, 
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } 
        } 
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
        distribution,
        serviceType,
        entityId
      }
    });
  } catch (err) {
    handleError(res, err);
  }
});

// 7. Alle Bewertungen abrufen (mit Paginierung und Filterung)
app.get("/reviews", async (req, res) => {
  try {
    const { 
      service_type, 
      page = 1, 
      limit = 10, 
      rating_min, 
      rating_max,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const filters = {};
    if (service_type && validateServiceType(service_type)) {
      filters.service_type = service_type;
    }
    if (rating_min || rating_max) {
      filters.rating = {};
      if (rating_min) filters.rating.$gte = parseInt(rating_min);
      if (rating_max) filters.rating.$lte = parseInt(rating_max);
    }

    const sortOptions = {};
    sortOptions[sort_by] = sort_order === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [reviews, totalCount] = await Promise.all([
      Reviews.find(filters)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Reviews.countDocuments(filters)
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(totalCount / parseInt(limit)),
        total_count: totalCount,
        per_page: parseInt(limit)
      }
    });
  } catch (err) {
    handleError(res, err);
  }
});

// 8. Service-Gesundheitscheck
app.get("/health", async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const reviewCount = await Reviews.countDocuments();
    
    res.json({
      success: true,
      service: "Unified Rating Service",
      status: "healthy",
      database: dbStatus,
      total_reviews: reviewCount,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    handleError(res, err);
  }
});

// MongoDB-Verbindung herstellen
const connectDB = async () => {
  try {
    await mongoose.connect(dbURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Unified Rating Service: MongoDB erfolgreich verbunden");
  } catch (error) {
    console.error("❌ MongoDB Verbindungsfehler:", error);
    process.exit(1);
  }
};

// Server starten
const startServer = async () => {
  await connectDB();
  
  app.listen(port, () => {
    console.log(`🚀 Unified Rating Service läuft auf Port ${port}`);
    console.log(`📊 API Endpoints verfügbar:`);
    console.log(`   GET    /reviews/:serviceType/:entityId - Bewertungen abrufen`);
    console.log(`   GET    /reviews/single/:reviewId - Einzelne Bewertung`);
    console.log(`   POST   /reviews - Neue Bewertung erstellen`);
    console.log(`   PUT    /reviews/:reviewId - Bewertung aktualisieren`);
    console.log(`   DELETE /reviews/:reviewId - Bewertung löschen`);
    console.log(`   GET    /reviews/:serviceType/:entityId/stats - Statistiken`);
    console.log(`   GET    /reviews - Alle Bewertungen (mit Filter/Pagination)`);
    console.log(`   GET    /health - Service-Status`);
  });
};

// Graceful Shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Server wird heruntergefahren...');
  await mongoose.connection.close();
  console.log('✅ MongoDB-Verbindung geschlossen');
  process.exit(0);
});

// Server starten
startServer().catch(console.error);