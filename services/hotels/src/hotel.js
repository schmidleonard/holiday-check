const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const { type } = require("os");
const multer = require("multer");
const path = require("path");

const port = process.env.PORT;
const dbURL = process.env.DB_URL;

const hotel = express();

hotel.use(express.json());
hotel.use(cors());
// Sharing static files
hotel.use("/uploads", express.static("uploads"));



const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true},
  short_name: { type: String, required: true},
  rooms: { type: Number, required: true},
  free_rooms: { type: Number, required: true},
  room_price: { type: Number, required: true},
  picture_one: { type: String, required: true},
  picture_two: { type: String},
  picture_three: { type: String},
  picture_four: { type: String}
});

const Hotels = mongoose.model("Hotels", hotelSchema);

// Multer-Configuration
const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `photo-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 * 4 }, // 5 MB per picture × 4
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Nur Bilder erlaubt!"), false);
  }
});

// Accept 4 photos in field "photos"
const uploadPhotos = upload.array("photos", 4);


// Routes
hotel.get("/hotel", async (req, res) => {
  try {
    const allHotels = await Hotels.find();
    res.status(200).json(allHotels);
  } catch(err) {
    res.status(500).json({ message: err });
  }
});

hotel.get("/hotel/:name", async (req, res) => {
  try {
    const findHotel = await Hotels.findOne({ name: req.params.name });
    res.status(200).json(findHotel);
  } catch(err) {
    res.status(500).json({ message: err });
  }
})


hotel.post("/hotel", uploadPhotos, async (req, res) => {
  try {
    const { name, short_name, rooms, free_rooms, room_price } = req.body;
    const files = req.files || [];
    if (files.length > 4) {
      return res.status(400).json({ message: "maximum of 4 pictures allowed" });
    }

    const pictureFields = ["picture_one", "picture_two", "picture_three", "picture_four"];
    const hotelData = { name, short_name, rooms, free_rooms, room_price };
    files.forEach((file, index) => {
      hotelData[pictureFields[index]] = file.path;
    });
    // Fallback for empty fields
    pictureFields.forEach(f => { if (!hotelData[f]) hotelData[f] = ""; });

    const newHotel = new Hotels(hotelData);
    await newHotel.save();
    res.status(201).json(newHotel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



hotel.put("/hotel/:name", async (req, res) => {
  try {
    const updatedHotel = await Hotels.findOneAndUpdate(
      { name: req.params.name },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedHotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    res.status(200).json(updatedHotel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})

hotel.delete("/hotel/:id", async (req, res) => {
  try {
    const deletedHotel = await Hotels.findByIdAndDelete(req.params.id);
    if (!deletedHotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    res.status(200).json({ message: "Hotel deleted", hotel: deletedHotel });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




// Server start
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbURL);
  console.log("database connected")


  hotel.listen(port, () => {
      console.log("server is running on port " + port);
  })
}