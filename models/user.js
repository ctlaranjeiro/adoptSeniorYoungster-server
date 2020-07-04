/* jshint esversion: 9*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const userSchema = new Schema({
  accountType: { type: String, default: 'User'},
  email: { type: String, required: true },
  password: { type: String, required: true, minlength: 6 },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
  // With Cloudinary
  imgName: String,
  imgPath: String,
  birthDate: { type: Date, required: true },
  age: Number,
  address: { type: String, required: true },
  phoneNumber: { type: Number, required: true, minlength: 9, maxlength: 9 },
  emergencyContact: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: Number, required: true, minlength: 9, maxlength: 9 },
    email: { type: String, required: true },
    address: { type: String, required: true }
  },
  schedulePreference: {
    morning: {type: Boolean, default: false},
    afternoon: {type: Boolean, default: false},
    evening: {type: Boolean, default: false},
    night: {type: Boolean, default: false},
    overNight: {type: Boolean, default: false},
    fullDay: {type: Boolean, default: false}
  },
  specificNeeds: {
    healthCare: {type: Boolean, default: false},
    houseCare: {type: Boolean, default: false},
    displacements: {type: Boolean, default: false},
    grocery: {type: Boolean, default: false},
    pupil: {type: Boolean, default: false}
  },
  hasHelp: { type: Boolean, default: false },
  assignedVolunteers: [{ type: Schema.Types.ObjectId, ref: 'Volunteer' }], // Interligar com volunter.js
  reports: [{ type: Schema.Types.ObjectId, ref: 'Report' }], // Interligar com report.js
  notes: String
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;