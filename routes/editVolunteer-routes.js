const express    = require('express');
const editVolunteerRoutes = express.Router();

// require bcrypt for signup and athentiation params edition
const bcrypt     = require('bcrypt');
// const bcryptSalt = 10;

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

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    function lowerCaseLetters(string) {
        return string.toLowerCase();
    }

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
    if(!mentor){
        mentor = false;
    }

    // PERSONAL DETAILS
    if(action === 'personalDetails') {
        Volunteer.updateOne({ _id: currentId }, { $set: {
            firstName: capitalizeFirstLetter(firstName),
            lastName: capitalizeFirstLetter(lastName),
            email: lowerCaseLetters(email),
            address: capitalizeFirstLetter(address),
            volPhoneNumber,
            occupation: capitalizeFirstLetter(occupation),
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

    // LOGIN PASSWORD
    if(action === 'password') {
        const salt = bcrypt.genSaltSync(10);
        const hashPass = bcrypt.hashSync(password, salt);

        Volunteer.updateOne({ _id: currentId }, { $set: {
            password: hashPass
        }})
            .then(updatedVolunteer => {
                console.log('Password updated!', updatedVolunteer);

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
                console.log('Error while updating password in DB:', err);
            });
    }

    // DELETE ASSIGNED USERS
    if(action === 'deleteAssignUsers'){
        let deleteSelected = [];

        if(typeof assignedUser === 'string'){
            
            deleteSelected.push(assignedUser);
        } else{
            assignedUser.forEach(element => {
            
            deleteUser.push(element);
            });
        }

        deleteSelected.forEach(objectId => {

            User.updateOne({ _id: objectId }, { $pull: {
                assignedVolunteers: { $in: [ currentId ] }
                }})
                .then(result => {
                    //console.log('USER UPDATE RESULT',result);
                    res.status(200).json(result);

                    Volunteer.updateOne({ _id: uid }, { $pull: {
                    assignedUsers: { $in: [ objectId ] }
                    }})
                    .then(result => {
                        //console.log('VOLUNTEER UPDATE RESULT',result);
                        res.status(200).json(result);

                        User.find({ _id: objectId })
                        .then(user => {
                            //console.log('USER RESULT ON FIND:',user);
                            //console.log('USER ASSIGNED USERS', user[0].assignedVolunteers);
                            //console.log('user[0].assignedVolunteers LENGTH', user[0].assignedVolunteers.length);
                            res.status(200).json(user);

                            const updateVol = () => {
                                Volunteer.find({ _id: uid })
                                .then(volunteer => {
                                //console.log('VOLUNTEER RESULT ON FIND:', volunteer);
                                //console.log('VOLUNTEER ASSIGNED USERS', volunteer[0].assignedUsers);
                                //console.log('volunteer[0].assignedUsers LENGTH', volunteer[0].assignedUsers.length);

                                    if(volunteer[0].assignedUsers.length === 0){
                                        Volunteer.updateOne({ _id: uid }, { $set: { 
                                        isHelping: false
                                        }})
                                        .then(result => {
                                            res.status(200).json(result);
                                        })
                                        .catch(err => {
                                            console.log('Error:', err);
                                            res.status(400).json({ message: 'Error while updating volunteer "isHelping"'});
                                        });
                                    }
                                });
                                return;
                            }

                            if(user[0].assignedVolunteers.length === 0){
                                User.updateOne({ _id: objectId }, { $set: { 
                                    hasHelp: false
                                }})
                                .then(result => {
                                //console.log('USER HAS HELP SET TO FALSE');
                                res.status(200).json(result);
                                
                                // Volunteer.find({ _id: uid })
                                //     .then(volunteer => {
                                //     //console.log('VOLUNTEER RESULT ON FIND:', volunteer);
                                //     //console.log('VOLUNTEER ASSIGNED USERS', volunteer[0].assignedUsers);
                                //     //console.log('volunteer[0].assignedUsers LENGTH', volunteer[0].assignedUsers.length);

                                //         if(volunteer[0].assignedUsers.length === 0){
                                //             Volunteer.updateOne({ _id: uid }, { $set: { 
                                //             isHelping: false
                                //             }})
                                //             .then(result => {
                                //                 res.status(200).json(result);
                                //             })
                                //             .catch(err => {
                                //                 console.log('Error:', err);
                                //                 res.status(400).json({ message: 'Error while updating volunteer "isHelping"'});
                                //             });
                                //         }
                                //     });
                                updateVol();
                                })
                                .catch(err => {
                                    console.log('Error:', err);
                                    res.status(400).json({ message: 'Error! Failed to update assignedVolunteers of the user.'});
                                });
                            } else {
                                // Volunteer.find({ _id: uid })
                                // .then(volunteer => {
                                //     //console.log('VOLUNTEER RESULT ON FIND:', volunteer);
                                //     //console.log('VOLUNTEER ASSIGNED USERS', volunteer[0].assignedUsers);
                                //     //console.log('volunteer[0].assignedUsers LENGTH', volunteer[0].assignedUsers.length);

                                //     if(volunteer[0].assignedUsers.length === 0){
                                //         Volunteer.updateOne({ _id: uid }, { $set: { 
                                //         isHelping: false
                                //         }})
                                //         .then(result => {
                                //             res.status(200).json(result);
                                //         })
                                //         .catch(err => {
                                //             console.log('Error:', err);
                                //             res.status(400).json({ message: 'Error while updating volunteer "isHelping"'});
                                //         });
                                //     }
                                // });
                                updateVol();
                            }
                        });
                    });
                })
            .catch(err => {
                console.log('Error:', err);
                res.status(400).json({ message: 'Error while updating user - pull volunteer ObjectId from assignedVolunteers' });
            })
        });
    }


});

module.exports = editVolunteerRoutes;