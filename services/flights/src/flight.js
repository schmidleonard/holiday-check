const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

const port = process.env.port;
const dbURL = process.env.DBURL;

const flight = express();

flight.use(express.json);
flight.use(cors());


const flightsSchema = mongoose.Schema({
    departure: {type: String, required: true},
    destination: {type: String, required: true},
    aircraft: {type: String},
    airline: {type: String, required: true},
    departure_time: {type: Date}, required: true,
    sheduled_time: {type: Date, required: true},
    price: {type: Number, required: true},
    available_seats: {type: Number}
})

const Flights = mongoose.model("Flights", flightsSchema);

// Routes

flight.get("/flight", async (req, res) => {
    try {
        const allflights = await Flights.find();
        res.status(200).json(allflights);
    } catch (err) {
        res.status(500).json( { message: err });
    }
})


flight.get("/flight/:destination", async (req, res) => {
    try {
        const findDestination = await Flights.find( {destination: req.params.destination});
        res.status(200).json(findDestination);
    } catch (err) {
        res.status(500).json({ message: err });
    }
})

flight.post("/flight", async (req, res) => {
    try {
        const flightData = req.body;
        const newFlight = new Flights(flightData);
        await newFlight.save();
        res.status(201).json(newFlight);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

flight.put("/flight:id", async (req, res) => {
    try {
        const updateFlight = await Flights.findOneAndUpdate(
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

flight.delete("flight/:id", async (req, res) => {
    try {
        const deletedFlight = await Flights.findByIdAndDelete(req.params.id);

        if (!deletedFlight) {
            return res.status(404).json({ message: "flight not found" });
        }
        res.status(200).json(deletedFlight);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

// Server start

main().catch(err => console.log(err));

async function main () {
    await mongoose.connect(dbURL);
    console.log("database connected");

    flight.listen(port, () => {
        console.log("server /'flights/' is running on port " + port);
    })
}
