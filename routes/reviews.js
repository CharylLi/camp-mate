// This file defines routes for handling review-related actions.
const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const catchAsync = require('../utils/catchAsync');
const reviews = require('../controllers/reviews');

// Route to create a new review for a campground
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// Route to delete an existing review for a campground
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
