const express = require("express");
const cors = require("cors");
require("dotenv").config();

const mongoose = require('mongoose');


const port = process.env.PORT;
const dburl = process.env.DB_URL;

const app = express();

app.use(express.json());
app.use(cors());


// connection to Database
mongoose.connect(dburl);
const db = mongoose.connection; 
db.on('error', (error) => console.error(error));
db.once('open',() => console.log("Connection to Database " + dburl + " successfull"));


const flightRouter = require('./routes/flightRouter');// Load Router
app.use('/api', flightRouter);




// Start Server
app.listen(port, () => {
    console.log("Flight Service started on port: " + port); 
})

