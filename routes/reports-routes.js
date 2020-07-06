const express           = require('express');
const reportsRoutes     = express.Router();

// require user, volunteer and institution models
const User = require('../models/user');
const Volunteer = require('../models/volunteer');
const Review = require('../models/review');

/* POST volunteer submit report */
reviewsRoutes.post('/user/:id/submitReview', (req, res, next) => {

});


module.exports = reportsRoutes;