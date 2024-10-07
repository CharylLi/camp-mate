// This file defines routes for handling campground-related actions
const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

// Route to list all campgrounds and create a new campground
router
    .route('/')
    .get(catchAsync(campgrounds.index))
    .post(
        isLoggedIn,
        upload.array('image'),
        validateCampground,
        catchAsync(campgrounds.createCampground)
    );

// Route to render the form to create a new campground
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// Route to render the "About" page
router.get('/about', campgrounds.renderAboutPage);

// Route to render the interactive map of campgrounds
router.get('/map', catchAsync(campgrounds.renderMap));

// Route to show, update, or delete a specific campground by ID
router
    .route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(
        isLoggedIn,
        isAuthor,
        upload.array('image'),
        validateCampground,
        catchAsync(campgrounds.updateCampground)
    )
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

// Route to render the form to edit a campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;
