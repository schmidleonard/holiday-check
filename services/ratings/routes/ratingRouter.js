const express = require('express');
const Rating = require('../models/ratingModel');
const axio = require('axios');
const { updateAverage } = require('../controllers/ratingController');
const mongoose = require('mongoose');
 
const router = express.Router();

router.use(express.json());


router.get('/rating/admin', async (req, res) => {
    try {
        allRatings = await Rating.find();
        res.status(200).json(allRatings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//get all ratings for one object
router.get('/ratings/:objectId', async (req, res) => {
    try {
    const objectId = new mongoose.Types.ObjectId(req.params.objectId);
    const allRatingsOfObject = await Rating.find({ objectId });
        res.status(200).json(allRatingsOfObject);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/ratings', async (req, res) => {
    try {
        const ratingData = req.body;
        const newRating = new Rating(ratingData);
        await newRating.save();
        res.status(200).json(newRating);

        //update average
        updateAverage(ratingData.objectId, ratingData.objectType); 
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/rating/admin/:id', async (req, res) => {
    try {
        const updatedData = req.body;
        const updatedRating = await Rating.findByIdAndUpdate(
            req.params.id,
            updatedData,
            { new: true, runValidators: true }
        );
        res.status(200).json(updatedRating);

        //update average
        updateAverage(updatedRating.objectId, updatedRating.objectType);
    } catch (err) {
        res.status(200).json({ message: err.message });
    }
});

router.delete('/rating/admin/:id', async (req, res) => {
    try {
        deletedRating = await Rating.findByIdAndDelete(req.params.id);
        res.status(200).json(deletedRating);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})


module.exports = router;