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

const carModel = require('../models/carModel');


// Routes

router.get("/car", async (req, res) => {
    try {
        const allCars = await carModel.find();
        res.status(200).json(allCars);
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

router.get("/car/:name", async (req, res) => {
    try {
        const findCar = await carModel.findOne({ name: req.params.name });
        res.status(200).json(findCar);
    } catch (err) {
        res.status(500).json({ message: err });
    }
})

router.post("/car", uploadPhoto, async (req, res) => {
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
            picture: file ? path.join("pictures", file.filename) : ""
        }
        const newCar = new Cars(carData);
        await newCar.save();
        res.status(201).json(newCar);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

router.put("/car/:name", async (req, res) => {
    try {
        const updatedCar = await carModel.findOneAndUpdate(
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


router.delete("/car/:id", async (req, res) => {
    try {
        // delete Car
        const deletedCar = await carModel.findByIdAndDelete(req.params.id);

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