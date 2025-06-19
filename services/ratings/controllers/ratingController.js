
const Rating = require('../models/Rating');
const axios = require('axios');
require("dotenv").config();

const hotel_url = process.env.HOTEL_URL;
const car_url = process.env.CAR_URL;
const flight_url = process.env.FLIGHT_URL;

async function updateAverage(objectId, objectType) {
  try {
    const ratings = await Rating.find({ objectId, objectType });

    if (ratings.length === 0) return;

    const total = ratings.reduce((sum, r) => sum + r.rating, 0);
    const average = total / ratings.length;

    //find target service
    let url;
    switch (objectType) {
      case 'Hotel':
        url = hotel_url + `${objectId}`;
        break;
      case 'Car':
        url = car_url + `${objectId}`;
        break;
      case 'Flight':
        url = flight_url + `${objectId}`;
        break;
      default:
        throw new Error('Unknown object type');
    }

    await axios.put(url, {
      averageRating: average.toFixed(2),
      ratingCount: ratings.length
    });
  } catch (error) {
    console.error('error while updating average rating', error.message);
  }
}

module.exports = { updateAverage };
