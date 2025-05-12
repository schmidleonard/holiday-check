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
    manufactor_date: {Date},
    hp: {type: Number},
    seats: {type: Number, required: true},
    price: {type: Number, required: true},
    available: {type: Boolean, required: true}
})