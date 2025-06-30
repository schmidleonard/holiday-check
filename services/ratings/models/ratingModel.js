const mongoose = require('mongoose');

const ratingModelSchema = new mongoose.Schema({
  objectId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'objectType'
  },
  objectType: {
    type: String,
    required: true,
    enum: ['Hotel', 'Car', 'Flight']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  userName: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    maxlength: 1000
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ratingModel', ratingModelSchema);
