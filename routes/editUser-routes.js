const express           = require('express');
const editUserRoutes    = express.Router();
const bcrypt            = require('bcrypt');

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

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    function lowerCaseLetters(string) {
        return string.toLowerCase();
    }

    const {
        //personal details
        firstName,
        lastName,
        email,
        address,
        phoneNumber,
        userNotes,
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

    //interchangeable values
    let {
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
        pupil
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


    //PERSONAL DETAILS
    if(action === 'personalDetails'){
        User.updateOne({ _id: currentId }, { $set: { 
            firstName,
            lastName,
            email,
            address,
            phoneNumber
        }})
            .then(updatedUser => {
                console.log('User personal details updated!', updatedUser);

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

    //NOTES
    if(action === 'userNotes'){
        User.updateOne({ _id: currentId }, { $set: { 
            notes: userNotes
        }})
            .then(updatedUser => {
              console.log('User notes updated!', updatedUser);

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
              console.log('Error while updating user notes in DB:', err);
            });
    }


    //SCHEDULE
    if(action === 'schedulePreferences'){
        User.updateOne({ _id: currentId }, { $set: { 
            schedulePreference: {
                morning: morning,
                afternoon: afternoon,
                evening: evening,
                night: night,
                overNight: overNight,
                fullDay: fullDay
            }
        }})
            .then(updatedUser => {
                console.log('User schedule preferences updated!', updatedUser);
                
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
                console.log('Error while updating user schedule preferences in DB:', err);
            });
    }


    //NEEDS
    if(action === 'specificNeeds'){
        User.updateOne({ _id: currentId }, { $set: { 
            specificNeeds: {
                healthCare: healthCare,
                houseCare: houseCare,
                displacements: displacements,
                grocery: grocery,
                pupil: pupil
            }
        }})
            .then(updatedUser => {
                console.log('User specific needs updated!', updatedUser);
                
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
                console.log('Error while updating user specific needs in DB:', err);
            });
    }


    //EMERGENCY CONTACT
    if(action === 'emergContact'){
        User.updateOne({ _id: currentId }, { $set: { 
            emergencyContact: {
                firstName: emergFirstName,
                lastName: emergLastName,
                phoneNumber: emergPhoneNumber,
                email: emergEmail,
                address: emergAddress
            }
        }})
            .then(updatedUser => {
                console.log('User emergency contact updated!', updatedUser);
                
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
                console.log('Error while updating user emergency contact in DB:', err);
            });
    }


    //PASSWORD
    if(action === 'password'){
        // ENCRYPT PASSWORD 
        const salt = bcrypt.genSaltSync(10);
        const hashPass = bcrypt.hashSync(password, salt);

        User.updateOne({ _id: currentId }, { $set: { 
            password: hashPass
        }})
            .then(updatedUser => {
              console.log('User password updated!', updatedUser);

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
              console.log('Error while updating user password in DB:', err);
            });
    }


});


module.exports = editUserRoutes;