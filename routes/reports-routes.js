const express           = require('express');
const reportsRoutes     = express.Router();

// require user, volunteer and report models
const User = require('../models/user');
const Volunteer = require('../models/volunteer');
const Report = require('../models/report');

/* POST volunteer submit report */
reportsRoutes.post('/volunteer/:id/submitReport', (req, res, next) => {
    const currentId = req.user._id;

    const { subject, report } = req.body;

    const getVolunteerDB = (id) => {
        Volunteer.findById(id)
            .populate('assignedUsers')
            .then(volunteerFromDB => {
                res.status(200).json(volunteerFromDB);
            })
            .catch(err => {
                console.log('Error:', err);
                res.status(400).json({ message: 'An error occurred while finding volunteer from DB', err});
            });
    }

    const userId = subject;

    const newReport = new Report({
        author: currentId,
        subject: userId,
        text: [
            {
                report: report,
                createdAt: new Date()
            }
        ]
    })

    Report.findOne({ $and: [{ 'author': currentId }, { 'subject': userId}] })
        .then(reportFromDB => {
            // console.log('report from DB: ', reportFromDB);
            if(reportFromDB){
                Report.updateOne({ $and: [{ 'author': currentId }, { 'subject': userId}] },
                { $push: { 
                    text: {
                        $each: [
                            {
                                report: report,
                                createdAt: new Date()
                            }
                        ],
                        $position: 0
                    }
                }})
                .then(result => {
                    console.log('Report updated', result);
                    getVolunteerDB(currentId);
                })
                .catch(err => {
                    console.log('Error while pushing report to DB', err);
                    res.status(400).json({ message: 'Error while pushing report do DB' });
                });
            } else {
                newReport.save()
                    .then(report => {
                        // console.log('New Report saved:', report);
                        const reportId = report._id;
                        User.findByIdAndUpdate({ _id: userId }, { $push: { reports: reportId }})
                            .then(result => {
                                console.log('user reports updated! Result:', result);
                                getVolunteerDB(currentId);
                            })
                            .catch(err => {
                                console.log('Error while updating reports in user', err);
                                res.status(400).json({ message: 'Error while updating reports in user' })
                            });
                    })
                    .catch(err => {
                        console.log('Error while saving report to DB', err);
                        res.status(400).json({ message: 'Error while saving report to DB' })
                    });
            }
        })
        .catch(err =>{
            console.log('Error while retrieving report from DB', err);
            res.status(400).json({ message: 'Error while retrieving report from DB' });
        });
});


module.exports = reportsRoutes;