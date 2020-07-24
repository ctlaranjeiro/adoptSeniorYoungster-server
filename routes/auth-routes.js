const express    = require('express');
const authRoutes = express.Router();
const passport   = require('passport');
const bcrypt     = require('bcrypt');


// require user, volunteer and institution models
const User = require('../models/user');
const Volunteer = require('../models/volunteer');
const Institution = require('../models/institution');

authRoutes.post('/signup/:accountType', (req, res, next) => {
    const accountType = req.params.accountType;

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    function lowerCaseLetters(string) {
        return string.toLowerCase();
    }

    //age based on birthDate
    function getYears(x) {
        return Math.floor(x / 1000 / 60 / 60 / 24 / 365);
    }

    if(accountType === 'user'){
        const {
            email,
            password,
            firstName,
            lastName,
            gender,
            birthDate,
            address,
            phoneNumber,
            profilePicture,
            //specific needs
            healthCare,
            houseCare,
            displacements,
            grocery,
            pupil,
            emergFirstName,
            emergLastName,
            emergPhoneNumber,
            emergEmail,
            emergAddress
        } = req.body;
         
        
        //below are interchangeable values depending on fullDay (if it is checked, all of the other are set to true)
        let {
            //schedule preferences
            morning,
            afternoon,
            evening,
            night,
            overNight,
            fullDay
        } = req.body;
    
    
        // CHECK IF FIELDS EXIST
        if (!email) {
          res.status(400).json({ message: 'Please, fill in your email.' });
          return;
        }
        if (!password) {
            res.status(400).json({ message: 'Please, create a password.' });
            return;
        }
        // CHECK PASSWORD LENGTH
        if(password.length < 6){
            res.status(400).json({ message: 'Password must be at least 6 characters long.' });
            return;
        }
        if (!firstName) {
            res.status(400).json({ message: 'Please, fill in your first name.' });
            return;
        }
        if (!lastName) {
            res.status(400).json({ message: 'Please, fill in your last name.' });
            return;
        }
        if (!address) {
            res.status(400).json({ message: 'Please, fill in your address.' });
            return;
        }
        if (!phoneNumber) {
            res.status(400).json({ message: 'Please, fill in your phone number.' });
            return;
        }
        // CHECK PHONE NUMBER LENGTH
        if(phoneNumber.length !== 9){
            res.status(400).json({ message: 'Please, insert a valid phone number with 9 digits.' });
            return;
        }
        if (!gender) {
            res.status(400).json({ message: 'Please, select a gender.' });
            return;
        }
        if (!birthDate) {
            res.status(400).json({ message: 'Please, fill in your birth date.' });
            return;
        }
        if (!morning && !afternoon && !evening && !night && !overNight && !fullDay) {
            res.status(400).json({ message: 'Please, select at least one option from Schedule Preferences.' });
            return;
        }
        if (!healthCare && !houseCare && !displacements && !grocery && !pupil) {
            res.status(400).json({ message: 'Please, select at least one option from Needs.' });
            return;
        }
        if (!emergFirstName) {
            res.status(400).json({ message: "Please, fill in Emergency Contact first name." });
            return;
        }
        if (!emergLastName) {
            res.status(400).json({ message: "Please, fill in Emergency Contact last name." });
            return;
        }
        if (!emergEmail) {
            res.status(400).json({ message: "Please, fill in Emergency Contact's email." });
            return;
        }
        if (!emergPhoneNumber) {
            res.status(400).json({ message: "Please, fill in Emergency Contact's phone number." });
            return;
        }
        // CHECK EMERGENCY CONTACT PHONE NUMBER LENGTH
        if(emergPhoneNumber.length !== 9){
            res.status(400).json({ message: "Please, insert a valid Emergency Contact's phone number with 9 digits." });
            return;
        }
        if (!emergAddress) {
            res.status(400).json({ message: "Please, fill in Emergency Contact's address" });
            return;
        }


        // ---- CHECKBOX VALUES 
        // const schedulePreferenceArr = [];

        // if (morning) {
        // schedulePreferenceArr.push(morning);
        // }
        // if (afternoon) {
        // schedulePreferenceArr.push(afternoon);
        // }
        // if (evening) {
        // schedulePreferenceArr.push(evening);
        // }
        // if (night) {
        // schedulePreferenceArr.push(night);
        // }
        // if (overNight) {
        // schedulePreferenceArr.push(overNight);
        // }
        // if (fullDay) {
        // schedulePreferenceArr.push(fullDay);
        // }

        // const specificNeedsArr = [];

        // if (healthCare) {
        // specificNeedsArr.push(healthCare);
        // }
        // if (houseCare) {
        // specificNeedsArr.push(houseCare);
        // }
        // if (displacements) {
        // specificNeedsArr.push(displacements);
        // }
        // if (grocery) {
        // specificNeedsArr.push(grocery);
        // }
        // if (pupil) {
        // specificNeedsArr.push(pupil);
        // }

        // ---- CHECKBOX VALUES 
        if(fullDay){
            morning = true;
            afternoon = true;
            evening = true;
            night = true;
            overNight = true;
            fullDay = true;
        }


        // calculate age based on birthDate
        const n = Date.now();
        const d = new Date(birthDate);
        const ageFromDate = getYears(n - d);

        // ENCRYPT PASSWORD        
        const salt     = bcrypt.genSaltSync(10);
        const hashPass = bcrypt.hashSync(password, salt);

        // NEW USER
        const newUser = new User({
            email: lowerCaseLetters(email),
            password: hashPass,
            firstName: capitalizeFirstLetter(firstName),
            lastName: capitalizeFirstLetter(lastName),
            gender,
            birthDate,
            age: ageFromDate,
            address: capitalizeFirstLetter(address),
            phoneNumber,
            profilePicture,
            emergencyContact: {
                firstName: capitalizeFirstLetter(emergFirstName),
                lastName: capitalizeFirstLetter(emergLastName),
                phoneNumber: emergPhoneNumber,
                email: lowerCaseLetters(emergEmail),
                address: capitalizeFirstLetter(emergAddress)
            },
            schedulePreference: {
                morning: morning,
                afternoon: afternoon,
                evening: evening,
                night: night,
                overNight: overNight,
                fullDay: fullDay
            },
            specificNeeds: {
                healthCare: healthCare,
                houseCare: houseCare,
                displacements: displacements,
                grocery: grocery,
                pupil: pupil
            }
        });
        
        User.findOne({ email }, (err, foundUser) => {
            if(err){
                res.status(500).json({message: "User email check went bad."});
                return;
            }
            
            if (foundUser) {
                res.status(400).json({ message: 'Email already registered. Try to login' });
                return;
            }
            
            newUser.save(err => {
                if (err) {
                    res.status(400).json({ message: 'Saving user to database went wrong.' });
                    console.log('err:', err);
                    return;
                }

                // req.session.currentUser = newUser;
                // res.status(200).json(newUser);
                
                req.login(newUser, (err) => {
                    if (err) {
                        res.status(500).json({ message: 'Login after signup went bad.' });
                        console.log('err:', err);
                        return;
                    }
                    // Send the user's information to the frontend
                    User.findById(newUser._id)
                        .populate('assignedVolunteers')
                        .then(userFromDB => {
                            res.status(200).json(userFromDB);
                        })
                        .catch(err => {
                            res.status(400).json({ message: 'Error fetching user after login' });
                        });
                });
            });
        });
    } /* ----------------------   END OF IF ACCOUNT TYPE 'USER' */

    if(accountType === 'volunteer'){
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
            profilePicture,
            //skills
            healthCare,
            houseCare,
            displacements,
            grocery,
            mentor,
            aboutMe
        } = req.body;

        
        //below are interchangeable values depending on fullDay (if it is checked, all of the other are set to true)
        let {
            //available periods
            morning,
            afternoon,
            evening,
            night,
            overNight,
            fullDay,
        } = req.body;


        // CHECK IF FIELDS EXIST
        if (!email) {
            res.status(400).json({ message: 'Please, fill in your email.' });
            return;
        }
        if (!password) {
            res.status(400).json({ message: 'Please, create a password.' });
            return;
        }
        // CHECK PASSWORD LENGTH
        if(password.length < 6){
            res.status(400).json({ message: 'Password must be at least 6 characters long.' });
            return;
        }
        if (!firstName) {
            res.status(400).json({ message: 'Please, fill in your first name.' });
            return;
        }
        if (!lastName) {
            res.status(400).json({ message: 'Please, fill in your last name.' });
            return;
        }
        if (!address) {
            res.status(400).json({ message: 'Please, fill in your address.' });
            return;
        }
        if (!volPhoneNumber) {
            res.status(400).json({ message: 'Please, fill in your phone number.' });
            return;
        }
        // CHECK PHONE NUMBER LENGTH
        if(volPhoneNumber.length !== 9){
            res.status(400).json({ message: 'Please, insert a valid phone number with 9 digits.' });
            return;
        }
        if (!gender) {
            res.status(400).json({ message: 'Please, select a gender.' });
            return;
        }
        if (!birthDate) {
            res.status(400).json({ message: 'Please, fill in your birth date.' });
            return;
        }
        if (!morning && !afternoon && !evening && !night && !overNight && !fullDay) {
            res.status(400).json({ message: 'Please, select at least one option from Availability Preferences.' });
            return;
        }
        if (!healthCare && !houseCare && !displacements && !grocery && !mentor) {
            res.status(400).json({ message: 'Please, select at least one option from Skills.' });
            return;
        }


        // ---- CHECKBOX VALUES 
        // const availablePeriodsArr = [];

        // if (morning) {
        // availablePeriodsArr.push(morning);
        // }
        // if (afternoon) {
        // availablePeriodsArr.push(afternoon);
        // }
        // if (evening) {
        // availablePeriodsArr.push(evening);
        // }
        // if (night) {
        // availablePeriodsArr.push(night);
        // }
        // if (overNight) {
        // availablePeriodsArr.push(overNight);
        // }
        // if (fullDay) {
        // availablePeriodsArr.push(fullDay);
        // }

        // const skillsArr = [];

        // if (healthCare) {
        // skillsArr.push(healthCare);
        // }
        // if (houseCare) {
        // skillsArr.push(houseCare);
        // }
        // if (displacements) {
        // skillsArr.push(displacements);
        // }
        // if (grocery) {
        // skillsArr.push(grocery);
        // }
        // if (mentor) {
        // skillsArr.push(mentor);
        // }


        // ---- CHECKBOX VALUES 
        if(fullDay){
            morning = true;
            afternoon = true;
            evening = true;
            night = true;
            overNight = true;
            fullDay = true;
        }

        // calculate age based on birthDate
        const n = Date.now();
        const d = new Date(birthDate);
        const ageFromDate = getYears(n - d);

        // ENCRYPT PASSWORD        
        const salt     = bcrypt.genSaltSync(10);
        const hashPass = bcrypt.hashSync(password, salt);


        // NEW VOLUNTEER
        const newVolunteer = new Volunteer({
            email: lowerCaseLetters(email),
            password: hashPass,
            firstName: capitalizeFirstLetter(firstName),
            lastName: capitalizeFirstLetter(lastName),
            gender,
            birthDate,
            age: ageFromDate,
            address: capitalizeFirstLetter(address),
            volPhoneNumber,
            occupation: capitalizeFirstLetter(occupation),
            profilePicture,
            availablePeriods: {
                morning: morning,
                afternoon: afternoon,
                evening: evening,
                night: night,
                overNight: overNight,
                fullDay: fullDay
            },
            skills: {
                healthCare: healthCare,
                houseCare: houseCare,
                displacements: displacements,
                grocery: grocery,
                mentor: mentor
            },
            aboutMe,
          });


          Volunteer.findOne({ email }, (err, foundVolunteer) => {
            if(err){
                res.status(500).json({message: "Volunteer email check went bad."});
                return;
            }
            
            if (foundVolunteer) {
                res.status(400).json({ message: 'Email already registered. Try to login' });
                return;
            }
            
            newVolunteer.save(err => {
                if (err) {
                    res.status(400).json({ message: 'Saving volunteer to database went wrong.' });
                    console.log('err:', err);
                    return;
                }
                
                req.login(newVolunteer, (err) => {
                    if (err) {
                        res.status(500).json({ message: 'Login after signup went bad.' });
                        console.log('err:', err);
                        return;
                    }
                    // Send the volunteers's information to the frontend
                    Volunteer.findById(newVolunteer._id)
                        .populate('assignedUsers')
                        .then(volunteerFromDB => {
                            res.status(200).json(volunteerFromDB);
                        })
                        .catch(err => {
                            res.status(400).json({ message: 'Error fetching volunteer after login' });
                        });
                });
            });
        });
       
    } /* ----------------------   END OF IF ACCOUNT TYPE 'VOLUNTEER' */

});

authRoutes.post('/login/:accountType', (req, res, next) => {
    const accountType = req.params.accountType;

    if(accountType === 'user'){
        passport.authenticate('user', (err, theUser, failureDetails) => {
            if (err) {
                res.status(500).json({ message: 'Something went wrong authenticating user' });
                return;
            }
            
            if (!theUser) {
                res.status(401).json(failureDetails);
                return;
            }
            
            // save user in session
            req.login(theUser, (err) => {
                if (err) {
                    res.status(500).json({ message: 'Session save went bad.' });
                    return;
                }

                User.findById(theUser._id)
                    .populate('assignedVolunteers')
                    .then(userFromDB => {
                        res.status(200).json(userFromDB);
                    })
                    .catch(err => {
                        res.status(400).json({ message: 'Error fetching user after login' });
                    });
                
            });
        })(req, res, next);
    }

    if(accountType === 'volunteer'){
        passport.authenticate('volunteer', (err, theVolunteer, failureDetails) => {
            if (err) {
                res.status(500).json({ message: 'Something went wrong authenticating user' });
                return;
            }
            
            if (!theVolunteer) {
                res.status(401).json(failureDetails);
                return;
            }
            
            // save user in session
            req.login(theVolunteer, (err) => {
                if (err) {
                    res.status(500).json({ message: 'Session save went bad.' });
                    return;
                }

                Volunteer.findById(theVolunteer._id)
                    .populate('assignedUsers')
                    .then(volunteerFromDB => {
                        res.status(200).json(volunteerFromDB);
                    })
                    .catch(err => {
                        res.status(400).json({ message: 'Error fetching volunteer after login' });
                    });
            });
        })(req, res, next);
    }
    
});

authRoutes.post('/logout', (req, res, next) => {
    //req.logout() is defined by passport
    req.logout();
    res.status(200).json({ message: 'Log out successful.' });
});

authRoutes.get('/loggedin', (req, res, next) => {
    // req.isAuthenticated() is defined by passport
    if (req.isAuthenticated()) {
        res.status(200).json(req.user);
        return;
    }

  res.status(200).json({});
});

module.exports = authRoutes;