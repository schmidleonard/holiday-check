mongoose = require('mongoose');

const carModelSchema = mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    manufacture_year: { type: Number, required: true },
    hp: { type: Number },
    seats: { type: Number, required: true },
    price: { type: Number, required: true },
    available: { type: Boolean, required: true },
    fuel: {
            type: String,
            enum: ['Benzin', 'Diesel', 'Elektro', 'Hybrid'],
            required: true
            },
    transmission: { 
                    type: String,
                    enum: ['Automatik', 'Schalter']
                    },
    doors: { type: Number, required: true },
    features: { type: [String], required: true },
    location: { type: String, required: true },
    picture: { type: String, required: true }
    }, { timestamps: true});


module.exports = mongoose.model('Car', carModelSchema);