const mongoose = require('mongoose');

const flightModelSchema = mongoose.Schema({
  flightNumber: { type: String, required: true, unique: true },
  departure: {
    airportCode: { type: String, required: true },
    city: { type: String },
    country: { type: String }
  },
  destination: {
    airportCode: { type: String, required: true },
    city: { type: String },
    country: { type: String }
  },
  aircraft: { type: String },
  airline: { type: String, required: true },
  departure_time: { type: Date, required: true },
  scheduled_time: { type: Date, required: true },
  price: { type: Number, required: true },
  available_seats: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Flight', flightModelSchema);