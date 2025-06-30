const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
require('dotenv').config();

const port = process.env.PORT;
const dburl = process.env.DB_URL;


const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[USER SERVICE] ${req.method} ${req.originalUrl}`);
  next();
});
app.use('/api', require('./routes/userRouter'));

// connection to Database
mongoose.connect(dburl);
const db = mongoose.connection; 
db.on('error', (error) => console.error(error));
db.once('open',() => console.log("Connection to Database " + dburl + " successfull"));

// Start Server
app.listen(port, () => {
    console.log("User Service started on port: " + port); 
})
