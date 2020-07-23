const express    = require('express');
const getAccountInfoRoutes = express.Router();
const User = require('../models/user');
const Volunteer = require('../models/volunteer');
const Report = require('../models/report');
const Review = require('../models/review');

getAccountInfoRoutes.get('/:account/:id', (req, res, next) => {
    const {account, id} = req.params;

    if(account === 'user'){
        User.findById(id)
            .populate('assignedVolunteers')
            .then(userFromDB => {
                Report.find({'subject': userFromDB._id})
                    .populate('author')
                    .then(reportFromDB => {
                        res.status(200).json({ account: userFromDB , reports: reportFromDB});
                    })
                    .catch(err => {
                        res.status(400).json({ message: 'Error while fetching user and report from DB', err });
                    });
            })
            .catch(err => {
                res.status(400).json({ message: 'Error while fetching user from DB', err });
            });
    }
    
    if(account === 'volunteer'){
        Volunteer.findById(id)
            .populate('assignedUsers')
            .then(volunteerFromDB => {
                Review.find({ 'subject': volunteerFromDB._id })
                    .populate('author')
                    .then(reviewFromDB => {
                        res.status(200).json({ account: volunteerFromDB , reviews: reviewFromDB});
                    })
                    .catch(err => {
                        res.status(400).json({ message: 'Error while fetching volunteer and reviews from DB', err });
                    });
            })
            .catch(err => {
                res.status(400).json({ message: 'Error while fetching volunteer from DB', err });
            });
    }
});

module.exports = getAccountInfoRoutes;