const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");


const port = process.env.PORT;
const dburl = process.env.DB_URL;



app.use(express.json());
app.use(cors());


// connection to Database
mongoose.connect(dburl);
const db = mongoose.connection; 
db.on('error', (error) => console.error(error));
db.once('open',() => console.log("Connection to Database " + dburl + " successfull"));


const hotelRouter = require('./routes/hotelRouter');// Load Router
app.use('/api', hotelRouter);




// Start Server
app.listen(port, () => {
    console.log("Hotel Service started on port: " + port); 
})








