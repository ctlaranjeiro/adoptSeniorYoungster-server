const express    = require('express');
const editUserRoutes = express.Router();

// require user, volunteer and institution models
const User = require('../models/user');
const Volunteer = require('../models/volunteer');
const Institution = require('../models/institution');

editUserRoutes.put('/user/:id/edit/:action', (req, res, next) => {
    const currentUser = req.user;
    const currentId = req.user._id;
    // console.log('currentUser', currentUser);
    // console.log('id', currentUser._id);
    const action = req.params.action;

    const {
        //personal details
        firstName,
        lastName,
        email,
        address,
        phoneNumber,
        userNotes,
        //schedule preferences
        morning,
        afternoon,
        evening,
        night,
        overNight,
        fullDay,
        //needs
        healthCare,
        houseCare,
        displacements,
        grocery,
        pupil,
        //emergency contact
        emergFirstName,
        emergLastName,
        emergPhoneNumber,
        emergEmail,
        emergAddress,
        password,
        assignedVolunteer,
        volunteer
    } = req.body;

    // ---- CHECKBOX VALUES 
    const schedulePreferenceArr = [];

    if (morning) {
        schedulePreferenceArr.push(morning);
    }
    if (afternoon) {
        schedulePreferenceArr.push(afternoon);
    }
    if (evening) {
        schedulePreferenceArr.push(evening);
    }
    if (night) {
        schedulePreferenceArr.push(night);
    }
    if (overNight) {
        schedulePreferenceArr.push(overNight);
    }
    if (fullDay) {
        schedulePreferenceArr.push(fullDay);
    }

    const specificNeedsArr = [];

    if (healthCare) {
        specificNeedsArr.push(healthCare);
    }
    if (houseCare) {
        specificNeedsArr.push(houseCare);
    }
    if (displacements) {
        specificNeedsArr.push(displacements);
    }
    if (grocery) {
        specificNeedsArr.push(grocery);
    }
    if (pupil) {
        specificNeedsArr.push(pupil);
    }


    if(action === 'updatePersonalDetails'){
        User.updateOne({ _id: currentId }, { $set: { 
            firstName,
            lastName,
            email,
            address,
            phoneNumber
        }})
            .then(updatedUser => {
                // console.log('UpdatedUser:', updatedUser);
                // console.log('User personal details updated!');
                // res.status(200).json(updatedUser);
                User.findById(currentId)
                    .then(userFromDB => {
                        res.status(200).json(userFromDB);
                    })
                    .catch(err => {
                        console.log('Error:', err);
                        res.status(400).json({ message: 'Error while finding user from DB'});
                    });
            })
            .catch(err => {
                console.log('Error:', err);
                res.status(400).json({ message: "Error while updating user's personal details"});
            });
    }
});


module.exports = editUserRoutes;