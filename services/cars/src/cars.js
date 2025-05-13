const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require('fs');
const { type } = require("os");
const fsPromises = fs.promises;

const port = process.env.PORT;
const dbURL = process.env.DBURL;

const cars = express();

cars.use(express.json());
cars.use(cors());
// Sharing static files
cars.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const carsSchema = mongoose.Schema({
    name: {type: String, required: true},
    brand: {type: String, required: true},
    model: {type: String, required: true},
    manufactor_date: {type: Date, required: true},
    hp: {type: Number},
    seats: {type: Number, required: true},
    price: {type: Number, required: true},
    available: {type: Boolean, required: true},
    fuel: {type: String, required: true},
    picture: {type: String, required: true}
})

const Cars = mongoose.model("Cars", carsSchema);

// Multer Configuration
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = path.join(__dirname, "../uploads");
            fs.mkdirSync(uploadDir, { recursive: true });
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            cb(null, `photo-${uniqueSuffix}${path.extname(file.originalname)}`);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) cb(null, true);
        else cb(new Error("only pictures allowed"), false);
    }
});

// Accept 1 file in field "photo"
const uploadPhoto = upload.single("photo");


// Routes

cars.get("/cars", async (req, res) => {
    try {
        const allCars = await Cars.find();
        res.status(200).json(allCars);
    } catch(err) {
        res.status(500).json({ message: err });
    }
});

cars.get("/cars/:name", async (req, res) => {
    try {
        const findCar = await Cars.findOne({ name: req.params.name });
        res.status(200).json(findCar);
    } catch(err) {
        res.status(500).json({ message: err });
    } 
})

cars.post("/cars", uploadPhoto, async (req, res) => {
    try {
        const { name, brand, model, manufactor_date, hp, seats, price, available, fuel} = req.body;
        const file = req.file;
        const carData = { 
            name,
            brand,
            model,
            manufactor_date,
            hp,
            seats,
            price, 
            available, 
            fuel, 
            picture: file ? path.join("uploads", file.filename) : "" }
        const newCar = new Cars(carData);
        await newCar.save();
        res.status(201).json(newCar);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

// Server start
main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(dbURL);
    console.log("database connected");

    cars.listen(port, () => {
        console.log("server is running on port " + port);
    })
}