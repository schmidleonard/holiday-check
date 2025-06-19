// Router for Hotel Service Endpoints

const express = require('express');
const Hotel = require('../models/hotelModel');
const multer = require("multer");
const path = require("path");
const fs = require('fs');
const fsPromises = fs.promises;

const router = express.Router();

router.use(express.json());

// Sharing static files
router.use("/pictures", express.static(path.join(__dirname, "../pictures")));



// Multer-Configuration
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, "../pictures"); // absolute path
      fs.mkdirSync(uploadDir, { recursive: true }); 
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `photo-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024}, // 5 MB per picture
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("only pictures allowed!"), false);
  }
});

// Accept 4 files in field "photos"
const uploadPhotos = upload.array("photos", 4);


// Routes
router.get("/hotel", async (req, res) => {
  try {
    const allHotels = await Hotel.find();
    res.status(200).json(allHotels);
  } catch(err) {
    res.status(500).json({ message: err });
  }
});

router.get("/hotel/:id", async (req, res) => {
  try {
    const findHotel = await Hotel.findOne({ id: req.params.id });
    res.status(200).json(findHotel);
  } catch(err) {
    res.status(500).json({ message: err });
  }
})


router.post("/hotel/admin", uploadPhotos, async (req, res) => {
  try {
    const { name, 
            type, 
            description, 
            amenities, 
            smokingAllowed, 
            petsAllowed, 
            maxGuests, 
            pricePerNight, 
            isAvailable, 
            city, 
            adress } = req.body;
    const files = req.files || [];
    if (files.length > 4) {
      return res.status(400).json({ message: "maximum of 4 pictures allowed" });
    }

    const hotelData = { 
            name, 
            type, 
            description, 
            amenities, 
            smokingAllowed, 
            petsAllowed, 
            maxGuests, 
            pricePerNight, 
            isAvailable, 
            city, 
            adress,
            pictures: [] };
    files.forEach((file) => {
    hotelData.pictures.push(path.join("pictures", file.filename));
    });

    const newHotel = new Hotel(hotelData);
    await newHotel.save();
    res.status(201).json(newHotel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.put("/hotel/admin/:id", uploadPhotos, async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    // Delete old pictures from Server
    const oldPictures = hotel.pictures || [];
    await Promise.all(oldPictures.map(async (pic) => {
      const fullPath = path.join(__dirname, "../", pic);
      try {
        await fsPromises.unlink(fullPath);
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
      }
    }));

    // New Data
    const {
      name,
      type,
      description,
      amenities,
      smokingAllowed,
      petsAllowed,
      maxGuests,
      pricePerNight,
      isAvailable,
      city,
      adress
    } = req.body;

    const pictures = req.files.map(file => path.join("pictures", file.filename));

    const updatedData = {
      name,
      type,
      description,
      amenities: amenities?.split(",").map(a => a.trim()),
      smokingAllowed: smokingAllowed === 'true',
      petsAllowed: petsAllowed === 'true',
      maxGuests,
      pricePerNight,
      isAvailable: isAvailable === 'true',
      city,
      adress,
      pictures
    };

    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedHotel);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

//Route only for rating service
router.put('/hotel/rating/:id', async (req, res) => {
  try {
    const hotelId = req.params.id;
    const { averageRating, ratingCount } = req.body;

    if (
      typeof averageRating !== 'number' ||
      typeof ratingCount !== 'number' ||
      averageRating < 0 || averageRating > 5 ||
      ratingCount < 0
    ) {
      return res.status(400).json({ message: 'Invalid rating data' });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const updatedHotel = await Hotel.findByIdAndUpdate(
      hotelId,
      { $set: { averageRating, ratingCount } },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedHotel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/hotel/admin/:id", async (req, res) => {
  try {
    // delete Hotel
    const deletedHotel = await Hotel.findByIdAndDelete(req.params.id);
    
    if (!deletedHotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    // delete pictures
    const imagesToDelete = deletedHotel.pictures
    .filter(path => path) // filter empty path
    .map(relativePath => path.join(__dirname, "../pictures", path.basename(relativePath))); 

    await Promise.all(
      imagesToDelete.map(async (path) => {
        try {
          await fsPromises.unlink(path);
          console.log(`Deleted file: ${path}`);
        } catch (err) {
          if (err.code === 'ENOENT') {
            console.log(`File ${path} does not exist, skipping deletion`);
          } else {
            throw err;
          }
        }
      })
    );

    res.status(200).json({
      message: "Hotel and associated images deleted",
      hotel: deletedHotel
    });

  } catch (err) {
    console.error("Error during deletion:", err);
    res.status(500).json({ 
      message: "Deletion failed",
      error: err.message 
    });
  }
});

module.exports = router;