// This module exports controller functions to handle review creation and deletion for campgrounds.
// It also manages updating and recalculating the average rating of campgrounds when reviews are added or deleted.

const Campground = require('../models/campground');
const Review = require('../models/review');

// Creates a new review for a specific campground.
// The review is linked to the current user and the campground,
// then saved to the database and the campground's average rating is updated.
module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;

    campground.reviews.push(review);
    await review.save();
    await campground.save();
    const reviews = await Review.find({ _id: { $in: campground.reviews } });
    const averageRating =
        reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;
    campground.averageRating = averageRating;
    await campground.save();

    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
};

// Deletes an existing review from both the campground and the database.
// The campground's average rating is recalculated or reset if no reviews remain.
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    const campground = await Campground.findById(id).populate('reviews');
    if (campground.reviews.length > 0) {
        const reviews = await Review.find({ _id: { $in: campground.reviews } });
        const averageRating =
            reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;
        campground.averageRating = averageRating;
    } else {
        campground.averageRating = 0;
    }

    await campground.save();

    req.flash('success', 'Successfully deleted review');
    res.redirect(`/campgrounds/${id}`);
};
