const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsPromises = fs.promises;

const port = process.env.PORT;
const dbURL = process.env.DBURL;

const car = express();

car.use(express.json());
car.use(cors());
// Sharing static files
car.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const carsSchema = mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    manufactor_date: { type: Date, required: true },
    hp: { type: Number },
    seats: { type: Number, required: true },
    price: { type: Number, required: true },
    available: { type: Boolean, required: true },
    fuel: { type: String, required: true },
    location: { type: String, required: true},
    picture: { type: String, required: true }
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

car.get("/car", async (req, res) => {
    try {
        const allCars = await Cars.find();
        res.status(200).json(allCars);
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

car.get("/car/:name", async (req, res) => {
    try {
        const findCar = await Cars.findOne({ name: req.params.name });
        res.status(200).json(findCar);
    } catch (err) {
        res.status(500).json({ message: err });
    }
})

car.post("/car", uploadPhoto, async (req, res) => {
    try {
        const { name, brand, model, manufactor_date, hp, seats, price, available, fuel, location } = req.body;
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
            location,
            picture: file ? path.join("uploads", file.filename) : ""
        }
        const newCar = new Cars(carData);
        await newCar.save();
        res.status(201).json(newCar);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

car.put("/car/:name", async (req, res) => {
    try {
        const updatedCar = await Cars.findOneAndUpdate(
            { name: req.params.name },
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedCar) {
            return res.status(404).json({ message: "Car not found" });
        }
        res.status(200).json(updatedCar);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})


car.delete("/car/:id", async (req, res) => {
    try {
        // delete Car
        const deletedCar = await Cars.findByIdAndDelete(req.params.id);

        if (!deletedCar) {
            return res.status(404).json({ message: "Car not found" });
        }

        // delete picture
        const imageToDelete = path.join(__dirname, "../uploads", deletedCar.picture);

        try {
            await fsPromises.unlink(imageToDelete);
            console.log(`Deleted file: ${imageToDelete}`);
        } catch (err) {
            if (err.code === 'ENOENT') {
                console.log(`File ${imageToDelete} does not exist, skipping deletion`);
            } else {
                throw err;
            }
        }

        return res.status(200).json({
            message: "Hotel and associated images deleted",
            car: deletedCar
        });
    } catch (err) {
        console.error("Error during deletion:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

// Server start
main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(dbURL);
    console.log("database connected");

    car.listen(port, () => {
        console.log("server is running on port " + port);
    })
}