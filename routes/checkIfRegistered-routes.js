const express    = require('express');
const registeredRoutes = express.Router();
const User = require('../models/user');
const Volunteer = require('../models/volunteer');

registeredRoutes.get('/checkIfRegistered', (req, res, next) => {
    const { email } = req.body;

    User.findOne({ email }, (err, foundUser) => {
        if(err){
            res.status(500).json({message: "User email check went bad."});
            return;
        }
        
        if (foundUser) {
            res.status(400).json({ message: 'Email already registered. Try to login' });
            return;
        } else{
            Volunteer.findOne({ email }, (err, foundVolunteer) => {
                if(err){
                    res.status(500).json({message: "Volunteer email check went bad."});
                    return;
                }

                if(foundVolunteer){
                    res.status(400).json({ message: 'Email already registered. Try to login' });
                    return;
                }

                res.status(200).json({});

            });
        }
    });
});

module.exports = registeredRoutes;