const express    = require('express');
const editVolunteerRoutes = express.Router();

// require bcrypt for signup and athentiation params edition
const bcrypt     = require('bcrypt');
const bcryptSalt = 10;

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
        aboutMe
    } = req.body;

    let { 
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
        mentor
    } = req.body;

    // ---- CHECKBOX VALUES 
    if(fullDay){
        morning = true;
        afternoon = true;
        evening = true;
        night = true;
        overNight = true;
        fullDay = true;
    }

    if(!healthCare){
        healthCare = false;
    }
    if(!houseCare){
        houseCare = false;
    }
    if(!displacements){
        displacements = false;
    }
    if(!grocery){
        grocery = false;
    }
    if(!pupil){
        pupil = false;
    }

    // PERSONAL DETAILS
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

    // SKILLS
    if(action === 'skills') {
        Volunteer.updateOne({ _id: currentId }, { $set: {
            skills: {
                healthCare: healthCare,
                houseCare: houseCare,
                displacements: displacements,
                grocery: grocery,
                mentor: mentor
            }
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
                res.status(400).json({ message: 'Erros while updating the volunteer skills'})
            });
    }

    // AVAILABILITY
    if(action === 'availablePeriods') {
        Volunteer.updateOne({ _id: currentId }, { $set: {
            availablePeriods: {
                morning: morning,
                afternoon: afternoon,
                evening: evening,
                night: night,
                overNight: overNight,
                fullDay: fullDay
            }
        }})
            .then(updatedVolunteer => {
                console.log('Volunteer availability updated!', updatedVolunteer);

                Volunteer.findById(currentId)
                    .then(volunteerFromDB => {
                        res.status(200).json(volunteerFromDB);
                    })
                    .catch(err => {
                        console.log('Error:', err);
                        res.status(400).json({ message: 'Error while finding volunteer from DB'});
                    });
            })
            .catch(err => {
                console.log('Error while updating volunteer availability preferences in DB:', err);
            })
    }
});

module.exports = editVolunteerRoutes;