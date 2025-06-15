const mongoose = require('mongoose');

const userModelSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    userPwd: { type: String, required: true, select: false },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true },
    role: { 
        type: String,
        enum: ['user', 'admin'],
        required: true
    },
    favorites: {
        hotels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' }],
        cars: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Car' }],
        flights: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Flight' }]
    },
    ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rating' }],
    isActive: {type: Boolean, default: true}, 
},{timestamps: true});

module.exports = mongoose.model('User', userModelSchema);