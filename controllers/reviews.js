const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;

    campground.reviews.push(review);
    await review.save();
    await campground.save();

    // Recalculate the average rating
    const reviews = await Review.find({ _id: { $in: campground.reviews } });
    const averageRating = reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;

    // Update the campground with the new average rating
    campground.averageRating = averageRating;
    await campground.save();

    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;

    // Remove the review from the campground
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // Delete the review from the database
    await Review.findByIdAndDelete(reviewId);

    // Recalculate the average rating
    const campground = await Campground.findById(id).populate('reviews');
    if (campground.reviews.length > 0) {
        const reviews = await Review.find({ _id: { $in: campground.reviews } });
        const averageRating = reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;
        campground.averageRating = averageRating;
    } else {
        // If no reviews remain, set the average rating to 0
        campground.averageRating = 0;
    }

    await campground.save();

    req.flash('success', 'Successfully deleted review');
    res.redirect(`/campgrounds/${id}`);
}