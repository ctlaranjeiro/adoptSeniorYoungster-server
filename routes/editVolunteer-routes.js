const express    = require('express');
const editVolunteerRoutes = express.Router();

// require user, volunteer and institution models
const User = require('../models/user');
const Volunteer = require('../models/volunteer');
const Institution = require('../models/institution');

editVolunteerRoutes.put('/volunteer/:id/edit/:action', (req, res, next) => {
    const currentVolunteer = req.user;
    const currentId = req.user._id;
    // console.log('currentVolunteer', currentVolunteer);
    // console.log('id', currentVolunteer._id);
    const action = req.params.action;

    const {
        email,
        password,
        firstName,
        lastName,
        gender,
        birthDate,
        address,
        volPhoneNumber,
        occupation,
        //available periods
        morning,
        afternoon,
        evening,
        night,
        overNight,
        fullDay,
        //skills
        healthCare,
        houseCare,
        displacements,
        grocery,
        pupil,
        aboutMe
    } = req.body;

    // ---- CHECKBOX VALUES 
    const availablePeriods = [];

    if (morning) {
        availablePeriods.push(morning);
    }
    if (afternoon) {
        availablePeriods.push(afternoon);
    }
    if (evening) {
        availablePeriods.push(evening);
    }
    if (night) {
        availablePeriods.push(night);
    }
    if (overNight) {
        availablePeriods.push(overNight);
    }
    if (fullDay) {
        availablePeriods.push(fullDay);
    }

    const skills = [];

    if (healthCare) {
        skills.push(healthCare);
    }
    if (houseCare) {
        skills.push(houseCare);
    }
    if (displacements) {
        skills.push(displacements);
    }
    if (grocery) {
        skills.push(grocery);
    }
    if (pupil) {
        skills.push(pupil);
    }

    if(action === 'personalDetails') {
        Volunteer.updateOne({ _id: currentId }, { $set: {
            firstName,
            lastName,
            email,
            address,
            volPhoneNumber,
            occupation,
            aboutMe
        }})
            .then(updateVolunteer => {
                Volunteer.findById(currentId)
                    .then(volunteerFromDB => {
                    res.status(200).json(volunteerFromDB);
                })
                    .catch(err => {
                        console.log('Error:', err);
                        res.status(400).json({ message: 'Error while finding volunteer from DB' });
                    });
            })
            .catch(err => {
                console.log('Error:', err);
                res.status(400).json({ message: 'Erros while updating the volunteer personal detais'})
            });
    }
});

module.exports = editVolunteerRoutes;