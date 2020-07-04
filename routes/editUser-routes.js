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
            firstName: capitalizeFirstLetter(firstName),
            lastName: capitalizeFirstLetter(lastName),
            email: lowerCaseLetters(email),
            address: capitalizeFirstLetter(address),
            phoneNumber
        }})
            .then(result => {
                console.log('User personal details updated!', result);

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
            .then(result => {
              console.log('User notes updated!', result);

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
            .then(result => {
                console.log('User schedule preferences updated!', result);
                
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
            .then(result => {
                console.log('User specific needs updated!', result);
                
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
                firstName: capitalizeFirstLetter(emergFirstName),
                lastName: capitalizeFirstLetter(emergLastName),
                phoneNumber: emergPhoneNumber,
                email: lowerCaseLetters(emergEmail),
                address: capitalizeFirstLetter(emergAddress)
            }
        }})
            .then(result => {
                console.log('User emergency contact updated!', result);
                
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
            .then(result => {
              console.log('User password updated!', result);

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

    //ASSIGN VOLUNTEERS
    if(action === 'assignVolunteers'){
        let selectedVolunteers = [];

        //if only one volunteer is selected, the return will be a string
        //if more than one is selected, it will be an array, therefore the use of forEach.
        if(typeof volunteer === 'string'){
            selectedVolunteers.push(volunteer);
        } else{
            volunteer.forEach(element => {
              selectedVolunteers.push(element);
            });
        }

        //push assigned volunteers to users' assingedVolunteers key
        User.updateOne(
                { _id: currentId }, 
                { $addToSet: { assignedVolunteers: { $each: selectedVolunteers} }}
            )
            .then(result => {
                console.log('User assigned volunteers updated with push', result);
                //set user's hasHelp to true
                User.updateOne({ _id: currentId }, { $set: { 
                    hasHelp: true
                }})
                    .then(result => {
                        console.log('User hasHelp updated!', result);
            
                        //set isHelping to true, on selected volunteers
                        selectedVolunteers.forEach(volunteerId => {
                            Volunteer.updateOne({ _id: volunteerId }, { $set: { 
                                isHelping: true
                            }})
                                .then(result => {
                                    console.log('volunteer ishelping set to true', result);
                
                                    //push user ID to volunteer assigned users
                                    Volunteer.updateOne(
                                        { _id: volunteerId,
                                        'assignedUsers': { $ne: currentId }
                                    }, { $push: {
                                        assignedUsers: currentId
                                    }})
                                        .then(result => {
                                            console.log('volunteer assignedUsers updated with userObjectId', result);

                                            User.findById(currentId)
                                                .populate('assignedVolunteers')
                                                .then(userFromDB => {
                                                    res.status(200).json(userFromDB);
                                                })
                                                .catch(err => {
                                                    console.log('Error:', err);
                                                    res.status(400).json({ message: 'Error while finding user from DB'});
                                                });
                                        })
                                        .catch(err => {
                                            console.log('error while assigning user to volunteer', err);
                                        });
                                    
                                })
                                .catch(err => {
                                    console.log('error while updating isHelping in volunteer DB', err);
                                });
                        });
                    });
            })
            .catch(err => {
                console.log('Error while updating user assigned volunteers in DB:', err);
            });
    }



    //DELETE ASSIGNED VOLUNTEERS
    if(action === 'deleteAssignedVolunteer'){
        let deleteSelected = [];

        if(typeof assignedVolunteer === 'string'){
            deleteSelected.push(assignedVolunteer);
        } else{
            assignedVolunteer.forEach(element => {
                deleteSelected.push(element);
            });
        }

        deleteSelected.forEach(volunteerId => {
            Volunteer.updateOne({ _id: volunteerId }, { $pull: {
              assignedUsers: { $in: [ currentId ] }
            }})
              .then(result => {
                //console.log('VOLUNTEER UPDATE RESULT',result);
      
                User.updateOne({ _id: uid }, { $pull: {
                  assignedVolunteers: { $in: [ objectId ] }
                }})
                  .then(result => {
                    //console.log('USER UPDATE RESULT',result);
      
                    Volunteer.find({ _id: objectId })
                      .then(volunteer => {
                        //console.log('VOLUNTEER RESULT ON FIND:',volunteer);
                        //console.log('VOLUNTEER ASSIGNED USERS', volunteer[0].assignedUsers);
                        //console.log('volunteer[0].assignedUsers LENGTH', volunteer[0].assignedUsers.length)
      
                        if(volunteer[0].assignedUsers.length === 0){
                          Volunteer.updateOne({ _id: objectId }, { $set: { 
                            isHelping: false
                          }})
                            .then(result => {
                              //console.log('VOLUNTEER IS HELPING SET TO FALSE');
                              
                              User.find({ _id: uid })
                                .then(user => {
                                  //console.log('USER RESULT ON FIND:', user);
                                  //console.log('USER ASSIGNED USERS', user[0].assignedVolunteers);
                                  //console.log('user[0].assignedVolunteers LENGTH', user[0].assignedVolunteers.length);
      
                                  if(user[0].assignedVolunteers.length === 0){
                                    User.updateOne({ _id: uid }, { $set: { 
                                      hasHelp: false
                                    }})
                                      .then(result => {
                                        res.redirect(`/user/${uid}/edit`);
                                      })
                                      .catch(err => {
                                        console.log('Error while updating user hasHelp', err);
                                      });
                                  } else{
                                    res.redirect(`/user/${uid}/edit`);
                                  }
                                });
                            });
                        } else{
                          User.find({ _id: uid })
                            .then(user => {
                              //console.log('USER RESULT ON FIND:', user);
                              //console.log('USER ASSIGNED USERS', user[0].assignedVolunteers);
                              //console.log('user[0].assignedVolunteers LENGTH', user[0].assignedVolunteers.length);
      
                              if(user[0].assignedVolunteers.length === 0){
                                User.updateOne({ _id: uid }, { $set: { 
                                  hasHelp: false
                                }})
                                  .then(result => {
                                    res.redirect(`/user/${uid}/edit`);
                                  })
                                  .catch(err => {
                                    console.log('Error while updating user hasHelp', err);
                                  });
                              } else{
                                res.redirect(`/user/${uid}/edit`);
                              }
                            });
                        }
                     });
                  });
              })
              .catch(err => {
                console.log('Error while updating volunteer - pull user ObjectId from assignedUsers', err);
              })
            });


    }



});


module.exports = editUserRoutes;