const express    = require('express');
const authRoutes = express.Router();
const passport   = require('passport');
const bcrypt     = require('bcrypt');

// require user, volunteer and institution models
const User = require('../models/user');
const Volunteer = require('../models/volunteer');
const Institution = require('../models/institution');

authRoutes.post('/signup/:accountType', (req, res, next) => {
    const params = req.params.accountType;

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    function lowerCaseLetters(string) {
        return string.toLowerCase();
    }

    if(params === 'user'){
        const {
            email,
            password,
            firstName,
            lastName,
            gender,
            birthDate,
            address,
            phoneNumber,
            //schedule preferences
            morning,
            afternoon,
            evening,
            night,
            overNight,
            fullDay,
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
    
    
        // CHECK IF FIELDS EXIST
        if (!email) {
          res.status(400).json({ message: 'Provide email' });
          return;
        }
        if (!password) {
            res.status(400).json({ message: 'Provide password' });
            return;
        }
        if (!firstName) {
            res.status(400).json({ message: 'Provide first name' });
            return;
        }
        if (!lastName) {
            res.status(400).json({ message: 'Provide last name' });
            return;
        }
        if (!gender) {
            res.status(400).json({ message: 'Provide gender' });
            return;
        }
        if (!birthDate) {
            res.status(400).json({ message: 'Provide birth date' });
            return;
        }
        if (!address) {
            res.status(400).json({ message: 'Provide address' });
            return;
        }
        if (!phoneNumber) {
            res.status(400).json({ message: 'Provide phone number' });
            return;
        }
        if (!morning || !afternoon || !evening || !night || !overNight || !fullDay) {
            res.status(400).json({ message: 'Provide schedule preferences: morning, afternoon, evening, night, over night or full day' });
            return;
        }
        if (!healthCare || !houseCare || !displacements || !grocery || !pupil) {
            res.status(400).json({ message: 'Provide needs: health care, house care, displacements, grocery or pupil' });
            return;
        }
        if (!emergFirstName) {
            res.status(400).json({ message: "Provide emergency contact's first name" });
            return;
        }
        if (!emergLastName) {
            res.status(400).json({ message: "Provide emergency contact's last name" });
            return;
        }
        if (!emergPhoneNumber) {
            res.status(400).json({ message: "Provide emergency contact's phone number" });
            return;
        }
        if (!emergEmail) {
            res.status(400).json({ message: "Provide emergency contact's email" });
            return;
        }
        if (!emergAddress) {
            res.status(400).json({ message: "Provide emergency contact's address" });
            return;
        }


        // CHECK PASSWORD LENGTH
        if(password.length < 6){
            res.status(400).json({ message: 'Please make your password at least 6 characters long for security purposes.' });
            return;
        }

        // CHECK PHONE NUMBER LENGTH
        if(phoneNumber.length !== 9){
            res.status(400).json({ message: 'Please insert a valid phone number with 9 digits.' });
            return;
        }

        // CHECK EMERGENCY CONTACT PHONE NUMBER LENGTH
        if(emergPhoneNumber.length !== 9){
            res.status(400).json({ message: 'Please insert an Emergency Contact valid phone number with 9 digits.' });
            return;
        }


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


        // calculate age based on birthDate
        function getYears(x) {
            return Math.floor(x / 1000 / 60 / 60 / 24 / 365);
        }
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
            emergencyContact: {
                firstName: capitalizeFirstLetter(emergFirstName),
                lastName: capitalizeFirstLetter(emergLastName),
                phoneNumber: emergPhoneNumber,
                email: lowerCaseLetters(emergEmail),
                address: capitalizeFirstLetter(emergAddress)
            },
            schedulePreference: schedulePreferenceArr,
            specificNeeds: specificNeedsArr,
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

                req.session.currentUser = newUser;
                res.status(200).json(newUser);
                
                // req.login(newUser, (err) => {
                //     if (err) {
                //         res.status(500).json({ message: 'Login after signup went bad.' });
                //         console.log('err:', err);
                //         return;
                //     }
                //     // Send the user's information to the frontend
                //     res.status(200).json(newUser);
                // });
            });
        });
    } /* END OF IF ACCOUNT TYPE 'USER' */
});

authRoutes.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, theUser, failureDetails) => {
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
          res.status(200).json(theUser);
      });
  })(req, res, next);
});

authRoutes.post('/logout', (req, res, next) => {
    //req.logout() is defined by passport
    //req.logout();
    req.session.destroy(() => {
        res.status(200).json({ message: 'Log out success!' });
    });
    
});

authRoutes.get('/loggedin', (req, res, next) => {
  // req.isAuthenticated() is defined by passport
//   if (req.isAuthenticated()) {
//       res.status(200).json(req.user);
//       return;
//   }

    if (req.session.currentUser) {
        res.status(200).json(req.session.currentUser);
        return;
    }

  res.status(200).json({});
});

module.exports = authRoutes;