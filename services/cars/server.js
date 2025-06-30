const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");

const port = process.env.PORT;
const dburl = process.env.DB_URL;

const app = express();

// Sharing static files
app.use("/pictures", express.static(path.join(__dirname, "pictures")));
console.log('Static serving from:', path.join(__dirname, 'pictures'));

app.use(express.json());
app.use(cors());

// connection to Database
mongoose.connect(dburl);
const db = mongoose.connection; 
db.on('error', (error) => console.error(error));
db.once('open',() => console.log("Connection to Database " + dburl + " successfull"));


const carRouter = require('./routes/carRouter');// Load Router
app.use('/api', carRouter);




// Start Server
app.listen(port, () => {
    console.log("Car Service started on port: " + port); 
})

