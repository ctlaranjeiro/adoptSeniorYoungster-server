const express = require('express');
const imageRoutes = express.Router();
const uploadCloud = require('../configs/cloudinary.js');

imageRoutes.post('/upload', uploadCloud.single("profilePicture"), (req, res, next) => {
    res.status(200).json({ message: ('Picture successfully uploaded'), profilePicture: req.file.secure_url });
});

module.exports = imageRoutes;