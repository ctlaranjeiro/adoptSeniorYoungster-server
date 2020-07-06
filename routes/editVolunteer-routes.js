const express    = require('express');
const editVolunteerRoutes = express.Router();
const mongoose = require('mongoose');

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

    function fetchVolunteerDB(id) {
        Volunteer.findById(id)
            .populate('assignedUsers')
            .then(volunteerFromDB => {
                res.status(200).json(volunteerFromDB);
            })
            .catch(err => {
                console.log('Error:', err);
                res.status(400).json({ message: 'Error while finding volunteer from DB'});
            });
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
        aboutMe,
        assignedUser
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

    // DELETE ASSIGNED USER
    if(action === 'deleteAssignedUsers'){
        let deleteSelected = [];

        if(typeof assignedUser === 'string'){
            
            deleteSelected.push(assignedUser);
        } else {
            assignedUser.forEach(element => {
            
            deleteSelected.push(element);
            });
        }

    
        deleteSelected.forEach(userId => {
            User.updateOne({ _id: userId }, { $pull: { assignedVolunteers: {
                $in: [ currentId ] }
            }})
                .then(result => {
                    console.log('User updated - removed volunteer from assignedVolunteers:', result);
                    Volunteer.updateOne({ _id: currentId }, { $pull: { assignedUsers: {
                        $in: [userId] }
                    }})
                        .then(result => {
                            console.log('Volunteer upadated - removed user from assignedUsers:', result);
                            User.find({ _id: userId })
                                .then(user => {
                                    console.log('user[0].assignedVolunteers:', user[0].assignedVolunteers);

                                    if(user[0].assignedVolunteers.length === 0) {
                                        User.updateOne({ _id: userId }, { $set: {
                                            hasHelp: false
                                        }})
                                            .then(result => {
                                                console.log('Correspondent user "hasHelp" field set to "false".');

                                                Volunteer.find({ _id: currentId })
                                                    .then(volunteer => {
                                                        console.log('volunteer[0].assignedUsers:', volunteer[0].assignedUsers);

                                                        if(volunteer[0].assignedUsers.length === 0) {
                                                            Volunteer.updateOne({ _id: currentId }, { $set: { isHelping: false}})
                                                                .then(result => {
                                                                    console.log('Correspondent volunteer "isHelping" field set to "false".');
                                                                    if(userId === deleteSelected[deleteSelected.length-1]) {
                                                                        fetchVolunteerDB(currentId);
                                                                    }
                                                                })
                                                                .catch(err => {
                                                                    res.status(400).json({ message: 'Error while updating volunteer "isHelping" field'}, err)
                                                                });
                                                        } else {
                                                            if(userId === deleteSelected[deleteSelected.length-1]) {
                                                                fetchVolunteerDB(currentId);
                                                            }
                                                        }
                                                    })
                                                    .catch(err => {
                                                        console.log('Error wile finding volunteer in DB:', err);
                                                    });
                                            })
                                            .catch(err => {
                                                console.log('Error while updating user "hasHelp" field', err)
                                            });
                                    } else {
                                        Volunteer.find({ _id: currentId })
                                            .then(volunteerFromDB => {
                                                if(volunteerFromDB[0].assignedUsers.length === 0) {
                                                    Volunteer.updateOne({ _id: currentId }, { $set: {isHelping: false}})
                                                        .then(result => {
                                                            console.log('Volunteer "isHelping" field set to "false"');
                                                            if(userId === deleteSelected[deleteSelected.length-1]) {
                                                                fetchVolunteerDB(currentId);
                                                            }
                                                        })
                                                        .catch(err => {
                                                            res.status(400).json({ message: 'Error while updating the volunteer "isHelping" status!', err});
                                                        });
                                                } else {
                                                    if(userId === deleteSelected[deleteSelected.length-1]) {
                                                        fetchVolunteerDB(currentId);
                                                    }
                                                }
                                            })
                                            .catch(err => {
                                                console.log('Error while finding volunteer in DB', err);
                                            });
                                    }
                                })
                                .catch(err => {
                                    console.log('Error while finding user in DB', err);
                                });
                        });
                })
                .catch(err => {
                    console.log('Error while updating user - pull userId from assingnedVolunteers', err);
                    res.status(400).json({ message: 'Error while removing volunteerId from user "assignedVolunteers" field'});
                });
        });
    }
});

// DELETE VOLUNTEER ACOUNT

editVolunteerRoutes.delete('/volunteer/:id/edit/deleteAccount', (req, res, next) => {
    const currentId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(currentId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
      }

    req.session.destroy(() => {
        Volunteer.findByIdAndRemove(currentId)
            .then((result) => {
                console.log(`Volunteer ${result.firstName} ${result.lastName} account successfully deleted`);
                res.json({ message: `Volunteer ${result.firstName} ${result.lastName} account successfully deleted`, result});
            })
            .catch(err => {
                console.log(`An error occurred while attempting do delete the volunteer account ${firstName, lastName} from DB!`, err);
                res.status(400).json({ message: `An error occurred while attempting do delete the volunteer account ${firstName, lastName} from DB!` })
            });
    });
});

module.exports = editVolunteerRoutes;