const LocalStrategy = require('passport-local').Strategy;
const bcrypt        = require('bcrypt');
const passport      = require('passport');
const User          = require('../models/user');
const Volunteer     = require('../models/volunteer');

passport.serializeUser((loggedInUser, cb) => {
  //console.log('serializeUser', loggedInUser._id);
  console.log('SERILIAZE USER');
  cb(null, loggedInUser._id);
});

passport.deserializeUser((userIdFromSession, cb) => {
  User.findById(userIdFromSession)
    .then(user => {
        //console.log('deserialize user:', user);
        console.log('DESERIALIZE USER');
        if(user){
            User.findById(userIdFromSession, (err, userDocument) => {
                console.log('found user in User Collection');
                if (err) {
                  cb(err);
                  return;
                }
                cb(null, userDocument);
              });
        }else{
            Volunteer.findById(userIdFromSession, (err, volunteerDocument) => {
                console.log('found volunteer in Volunteer Collection');
                if (err) {
                  cb(err);
                  return;
                }
                cb(null, volunteerDocument);
              });
        }
    })
});

passport.use('user', new LocalStrategy({ usernameField: 'email' }, (email, password, next) => {
  User.findOne({ email }, (err, foundUser) => {
    if (err) {
      next(err);
      return;
    }
    if (!foundUser) {
      next(null, false, { message: 'Incorrect email.' });
      return;
    }
    if (!bcrypt.compareSync(password, foundUser.password)) {
      next(null, false, { message: 'Incorrect password.' });
      return;
    }
    next(null, foundUser);
  });
}));

passport.use('volunteer', new LocalStrategy({ usernameField: 'email' }, (email, password, next) => {
    Volunteer.findOne({ email }, (err, foundVolunteer) => {
      if (err) {
        next(err);
        return;
      }
      if (!foundVolunteer) {
        next(null, false, { message: 'Incorrect email.' });
        return;
      }
      if (!bcrypt.compareSync(password, foundVolunteer.password)) {
        next(null, false, { message: 'Incorrect password.' });
        return;
      }
      next(null, foundVolunteer);
    });
  }));