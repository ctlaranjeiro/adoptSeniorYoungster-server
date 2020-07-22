const express    = require('express');
const getAllVolunteers = express.Router();
const Volunteer = require('../models/volunteer');

getAllVolunteers.get('/allVolunteers', (req, res, next) => {
    Volunteer.find()
        .then(allVolunteerFromDB => {
            res.status(200).json(allVolunteerFromDB);
        })
        .catch(err => {
            res.status(400).json({ message: 'Error while fetching all volunteers from DB' });
        });
});

module.exports = getAllVolunteers;