const express = require('express');
const router = express.Router();
const path = require("path");
const flightModel = require('../models/flightModel');

router.use(express.json());

router.use("/src", express.static(path.join(__dirname, "../src")));


// Routes

router.get("/flight", async (req, res) => {
    try {
        const allflights = await flightModel.find();
        res.status(200).json(allflights);
    } catch (err) {
        res.status(500).json( { message: err });
    }
})


router.get("/flight/:destination", async (req, res) => {
    try {
        const findDestination = await flightModel.find( {destination: req.params.destination});
        res.status(200).json(findDestination);
    } catch (err) {
        res.status(500).json({ message: err });
    }
})

router.post("/flight", async (req, res) => {
    try {
        const flightData = req.body;
        const newFlight = new Flights(flightData);
        await newFlight.save();
        res.status(201).json(newFlight);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

router.put("/flight:id", async (req, res) => {
    try {
        const updateFlight = await flightModel.findOneAndUpdate(
          { id: req.params.id },
          req.body,
          { new: true, runValidators: true }  
        );
        if (!updateFlight) {
            return res.status(404).json({ message: "Flight not found" });
        }
        res.status(200).json(updateFlight);
    } catch (err) {
        res.status(500).json({ message: err.message});
    }
})

router.delete("flight/:id", async (req, res) => {
    try {
        const deletedFlight = await flightModel.findByIdAndDelete(req.params.id);

        if (!deletedFlight) {
            return res.status(404).json({ message: "flight not found" });
        }
        res.status(200).json(deletedFlight);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

module.exports = router;