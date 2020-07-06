const express           = require('express');
const reviewsRoutes     = express.Router();

// require user, volunteer and institution models
const User = require('../models/user');
const Volunteer = require('../models/volunteer');
const Review = require('../models/review');


/* POST user submit review */
reviewsRoutes.post('/user/:id/submitReview', (req, res, next) => {
    const currentId = req.user._id;

    function average(array){
        const reducer = (accumulator, currentValue) => accumulator + currentValue;
        const sum = array.reduce(reducer);
    
        const avg = sum/array.length;
    
        const roundNumber = Math.round(avg * 10) / 10;
    
        return roundNumber;
    }

    function fetchUserDB(id) {
        User.findById(id)
            .populate('assignedVolunteers')
            .then(userFromDB => {
                res.status(200).json(userFromDB);
            })
            .catch(err => {
                console.log('Error:', err);
                res.status(400).json({ message: 'Error while finding user from DB'});
            });
    }
    
    const {
        subject,
        rate,
        review
    } = req.body;

    const volunteerId = subject;

    const newReview = new Review({
        review:[
            {
            rate: rate,
            text: review,
            createdAt: new Date()
            }
        ],
        author: currentId,
        subject: volunteerId
    });

    Review.findOne({ $and: [{ 'author': currentId }, { 'subject': volunteerId}] })
        .then(reviewFromDB => {
            if(reviewFromDB){
                Review.updateOne({ $and: [{ 'author': currentId }, { 'subject': volunteerId}] },
                    { $push: { 
                        review: {
                            $each: [
                                {
                                    rate: rate,
                                    text: review,
                                    createdAt: new Date()
                                }
                            ],
                            $position: 0
                        }
                }})
                    .then(result => {
                        Volunteer.updateOne({ _id: volunteerId}, { $push: {
                            'evaluation.rates': {
                                $each: [rate],
                                $position: 0
                            }
                        }})
                            .then(result => {
                                console.log('push new rate to volunteer', result);

                                Volunteer.findById(volunteerId)
                                    .then(volunteer => {
                                        console.log('Volunteer in DB after pushing new rate', volunteer);

                                        const rates = volunteer.evaluation.rates;
                                        console.log('Rates in volunteer DB:', rates);
                                        const avgRate = average(rates);
                                        
                                        Volunteer.updateOne({ _id: volunteerId }, { $set: { 
                                            'evaluation.averageRate': avgRate
                                        }})
                                            .then(result =>{
                                                console.log('Average rate of volunteer result after pushing new rate:', result);
                                                fetchUserDB(currentId);
                                            })
                                            .catch(err => {
                                                console.log('Error while updating average rate of volunteer in DB, after pushing new rate', err);
                                                res.status(400).json({ message: 'Error while updating average rate of volunteer in DB, after pushing new rate'});

                                            });
                                    })
                                    .catch(err => {
                                        console.log('Error while finding volunteer in DB', err);
                                        res.status(400).json({ message: 'Error while finding volunteer in DB'});
                                    });
                            })
                            .catch(err =>{
                                console.log('Error while updating push volunteers rate', err);
                                res.status(400).json({ message: 'Error while updating push volunteers rate'});
                            });
                    })
                    .catch(err =>{
                        console.log('Error while updating review on DB', err);
                        res.status(400).json({ message: 'Error while updating review on DB'});
                    });
            } else{
                newReview.save()
                    .then(reviewFromDB => {
                        console.log('New Review saved:', reviewFromDB);

                        const volunteerId = reviewFromDB.subject;
                        const reviewId = reviewFromDB._id;
                        const newRate = reviewFromDB.review[0].rate;
                        console.log('newRate:', newRate);
                        console.log('reviewId:', reviewId);

                        Volunteer.findById(volunteerId)
                            .then(volunteer => {
                                if(!volunteer.evaluation){
                                    Volunteer.updateOne({ _id: volunteerId }, { $set: { 
                                        evaluation: {
                                        rates: newRate,
                                        reviews: reviewId
                                        }
                                    }})
                                        .then(result => {
                                            console.log('volunteer reviews updated! Result:', result);
                            
                                            Volunteer.findById(volunteerId)
                                                .then(volunteer => {
                                                    console.log('Volunteer in DB after rates', volunteer);
                                
                                                    const rates = volunteer.evaluation.rates;
                                                    console.log('Rates in volunteer DB:', rates);
                                                    const avgRate = average(rates);
                                                    
                                                    Volunteer.updateOne({ _id: volunteerId }, { $set: { 
                                                        'evaluation.averageRate': avgRate
                                                    }})
                                                        .then(result =>{
                                                            console.log('Average rate of volunteer result:', result);
                                                            fetchUserDB(currentId);
                                                        })
                                                        .catch(err => {
                                                            console.log('Error while updating average rate of volunteer in DB', err);
                                                            res.status(400).json({ message: 'Error while updating average rate of volunteer in DB'});
                                                        });
                                                })
                                                .catch(err => {
                                                    console.log('Error while finding volunteer in DB', err);
                                                    res.status(400).json({ message: 'Error while finding volunteer in DB'});
                                                });
                                        })
                                        .catch(err => {
                                            console.log('Error while updating reviews in volunteer', err);
                                            res.status(400).json({ message: 'Error while updating reviews in volunteer'});
                                        });
                                }else{
                                    Volunteer.updateOne({ _id: volunteerId }, { $push: { 
                                        'evaluation.rates': newRate,
                                        'evaluation.reviews': reviewId
                                    }})
                                        .then(result => {
                                            console.log('volunteer reviews updated! Result:', result);
                            
                                            Volunteer.findById(volunteerId)
                                                .then(volunteer => {
                                                    console.log('Volunteer in DB after rates', volunteer);
                                
                                                    const rates = volunteer.evaluation.rates;
                                                    console.log('Rates in volunteer DB:', rates);
                                                    const avgRate = average(rates);
                                                    
                                                    Volunteer.updateOne({ _id: volunteerId }, { $set: { 
                                                        'evaluation.averageRate': avgRate
                                                    }})
                                                        .then(result =>{
                                                            console.log('Average rate of volunteer result:', result);
                                                            fetchUserDB(currentId);
                                                        })
                                                        .catch(err => {
                                                            console.log('Error while updating average rate of volunteer in DB', err);
                                                            res.status(400).json({ message: 'Error while updating average rate of volunteer in DB'});
                                                        });
                                                })
                                                .catch(err => {
                                                    console.log('Error while finding volunteer in DB', err);
                                                    res.status(400).json({ message: 'Error while finding volunteer in DB'});
                                                });
                                        })
                                        .catch(err => {
                                            console.log('Error while updating reviews in volunteer', err);
                                            res.status(400).json({ message: 'Error while updating reviews in volunteer'});
                                        });
                                }
                            })
                            .catch(err => {
                                console.log('Error while retrieving volunteer from DB', err);
                                res.status(400).json({ message: 'Error while retrieving volunteer from DB'});
                            });
                    })
                    .catch(err => {
                        console.log('Error while saving review to DB', err);
                        res.status(400).json({ message: 'Error while saving review to DB'});
                    });
            }
        })
        .catch(err => {
            console.log('Error finding review on DB', err);
            res.status(400).json({ message: 'Error finding review on DB'});
        });
});



module.exports = reviewsRoutes;