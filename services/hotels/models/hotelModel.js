const mongoose = require('mongoose');

const hotelModelSchema = new mongoose.Schema({
  name: { type: String, required: true},
  type: { type: String, required: true},
  description: { type: String},
  amenities: [String],
  smokingAllowed: {type: Boolean, required: true},
  petsAllowed: {type: Boolean, required: true},
  maxGuests: {type: Number, required: true},
  pricePerNight: { type: Number, required: true},
  isAvailable: {type: Boolean, required: true},
  city: {type: String, required: true},
  adress: {type: String, required: true},
  pictures: [String],
  averageRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  }, { timestamps: true});

module.exports = mongoose.model('hotelModel', hotelModelSchema);