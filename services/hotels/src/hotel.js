const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const { type } = require("os");

const port = process.env.PORT;
const dbURL = process.env.DB_URL;

const hotel = express();

hotel.use(express.json());
hotel.use(cors());


const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  short_name: { type: String, maxLength: 10 },
  rooms: { type: Number, required: true },
  free_rooms: { type: Number, required: true},
  room_price: { type: Number},
  picture_one: { type: String, required: true },
  picture_two: { type: String},
  picture_three: { type: String},
  picture_four: { type: String}
});

const Hotels = mongoose.model("Hotels", hotelSchema);


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


hotel.post("/hotel", async (req, res) => {
  try {
    const newHotel = new Hotels(req.body);
    await newHotel.save();
    res.status(201).json(newHotel);
  } catch(err) {
    res.status(500).json({ message: err });
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