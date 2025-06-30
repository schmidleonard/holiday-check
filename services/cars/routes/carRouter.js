const express = require('express');
const router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsPromises = fs.promises;

router.use(express.json());

// Sharing static files
router.use("/pictures", express.static(path.join(__dirname, "../pictures")));


// Multer Configuration
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = path.join(__dirname, "../pictures");
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

const Car = require('../models/carModel');


// Routes

router.get("/car", async (req, res) => {
    try {
        const allCars = await Car.find();
        res.status(200).json(allCars);
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

router.get("/car/:name", async (req, res) => {
    try {
        const findCar = await Car.findOne({ name: req.params.name });
        res.status(200).json(findCar);
    } catch (err) {
        res.status(500).json({ message: err });
    }
})

router.get("/car/:id", async (req, res) => {
    try {
        const findCar = await Car.findOne({ _id: req.params.id });
        res.status(200).json(findCar);
    } catch (err) {
        res.status(500).json({ message: err });
    }
})


router.post("/car/admin", uploadPhoto, async (req, res) => {
    try {
        const {
            name,
            brand,
            model,
            manufactureYear,
            hp,
            seats,
            price,
            available,
            fuel,
            location,
            transmission,
            doors,
            features
        } = req.body;

        const carData = {
            name,
            brand,
            model,
            manufacture_year: manufactureYear,
            hp: parseInt(hp),
            seats: parseInt(seats),
            price: parseFloat(price),
            available: available === "true",
            fuel,
            location,
            transmission,
            doors: parseInt(doors),
            features: features ? features.split(",").map(f => f.trim()) : [],
            picture: req.file ? path.join("pictures", req.file.filename) : ""
        };

        const newCar = new Car(carData);
        await newCar.save();
        res.status(201).json(newCar);
    } catch (err) {
        console.error("POST error:", err);
        res.status(500).json({ message: err.message });
    }
});

router.put("/car/admin/:id", uploadPhoto, async (req, res) => {
    try {
        const {
            name,
            brand,
            model,
            manufactureYear,
            hp,
            seats,
            price,
            available,
            fuel,
            location,
            transmission,
            doors,
            features
        } = req.body;

        const updatedData = {
            name,
            brand,
            model,
            manufactor_year: manufactureYear,
            hp: parseInt(hp),
            seats: parseInt(seats),
            price: parseFloat(price),
            available: available === "true",
            fuel,
            location,
            transmission,
            doors: parseInt(doors),
            features: features ? features.split(",").map(f => f.trim()) : []
        };

        if (req.file) {
            updatedData.picture = path.join("pictures", req.file.filename);
        }

        const updatedCar = await Car.findByIdAndUpdate(req.params.id, updatedData, {
            new: true,
            runValidators: true
        });

        if (!updatedCar) {
            return res.status(404).json({ message: "Car not found" });
        }

        res.status(200).json(updatedCar);
    } catch (err) {
        console.error("PUT error:", err);
        res.status(500).json({ message: err.message });
    }
});


router.delete("/car/admin/:id", async (req, res) => {
    try {
        // delete Car
        const deletedCar = await Car.findByIdAndDelete(req.params.id);

        if (!deletedCar) {
            return res.status(404).json({ message: "Car not found" });
        }

        // delete picture
        const imageToDelete = path.join(__dirname, "../pictures", deletedCar.picture);

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
            message: "Car and associated images deleted",
            car: deletedCar
        });
    } catch (err) {
        console.error("Error during deletion:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


module.exports = router;