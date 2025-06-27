const express = require('express');
const app = express();
require('dotenv').config();
const cors = require("cors");

const hotelRoutes = require('./routes/hotels');
const carRoutes = require('./routes/cars');
const flightRoutes = require('./routes/flights');
const ratingRoutes = require('./routes/ratings');
const userRoutes = require('./routes/users');

app.use(cors());

app.use((req, res, next) => {
  console.log(`[GATEWAY] ${req.method} ${req.originalUrl}`);
  next();
});
app.use('/api/hotels', hotelRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/users', userRoutes); // Login/Registration

const port = process.env.PORT;
app.listen(port, () => console.log(`Gateway is running on port: ` + port));
