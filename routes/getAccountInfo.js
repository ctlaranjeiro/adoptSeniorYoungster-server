const express    = require('express');
const getAccountInfoRoutes = express.Router();
const User = require('../models/user');
const Volunteer = require('../models/volunteer');

getAccountInfoRoutes.get('/:account/:id', (req, res, next) => {
    const {account, id} = req.params;

    if(account === 'user'){
        User.findById(id)
            .populate('assignedVolunteers')
            .then(userFromDB => {
                res.status(200).json(userFromDB);
            })
            .catch(err => {
                res.status(400).json({ message: 'Error while fetching user from DB' });
            });
    }
    
    if(account === 'volunteer'){
        Volunteer.findById(id)
            .populate('assignedUsers')
            .then(volunteerFromDB => {
                res.status(200).json(volunteerFromDB);
            })
            .catch(err => {
                res.status(400).json({ message: 'Error while fetching volunteer from DB' });
            });
    }
});

module.exports = getAccountInfoRoutes;