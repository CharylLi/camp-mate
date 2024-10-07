// This file contains the controller logic for handling campgrounds, 
// including creating, editing, deleting, and showing campgrounds, 
// as well as handling geocoding, image uploads, sorting, and filtering features.

const Campground = require('../models/campground');
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

// List all campgrounds with optional search and sorting.
module.exports.index = async (req, res) => {
    const { search, sort } = req.query;
    let campgrounds = await Campground.find({});

    if (search) {
        campgrounds = await Campground.find({
            $or: [
                { title: new RegExp(search, 'i') },
                { location: new RegExp(search, 'i') }
            ]
        });
    }

    if (sort === 'alphabetic') {
        campgrounds = campgrounds.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'most-reviews') {
        campgrounds = campgrounds.sort((a, b) => b.reviews.length - a.reviews.length);
    } else if (sort === 'highest-rating') {
        campgrounds = campgrounds.sort((a, b) => b.averageRating - a.averageRating);
    } else if (sort === 'price-low-to-high') {
        campgrounds = campgrounds.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high-to-low') {
        campgrounds = campgrounds.sort((a, b) => b.price - a.price);
    }

    res.render('campgrounds/index', { campgrounds, search, sort });
};

// Render form to create new campground.
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

// Render the map view of all campgrounds.
module.exports.renderMap = async (req, res) => {
    try {
        const campgrounds = await Campground.find({});
        res.render('campgrounds/map', { campgrounds });
    } catch (err) {
        console.error('Error fetching campgrounds for map:', err);
        req.flash('error', 'Something went wrong');
        return res.redirect('/campgrounds');
    }
}
// Create a new campground and save it to the database.
module.exports.createCampground = async (req, res, next) => {
    try {
        // Use the location from the form to fetch geocoding data from Mapbox API.
        const location = req.body.campground.location;
        const geoData = await geocoder.forwardGeocode({
            query: location,
            limit: 1
        }).send();

        // Handle cases where the geocoding returns no valid result.
        if (!geoData.body.features.length) {
            req.flash('error', 'Invalid location. Please provide a valid location.');
            return res.redirect('back');
        }

        // Create a new campground object.
        const campground = new Campground(req.body.campground);
        campground.geometry = geoData.body.features[0].geometry;
        campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
        campground.author = req.user._id;
        campground.website = req.body.campground.website;
        await campground.save();

        req.flash('success', 'Successfully created a new campground!');
        res.redirect(`/campgrounds/${campground._id}`);
    } catch (error) {
        console.error('Error creating campground:', error);
        req.flash('error', 'Something went wrong, please try again.');
        res.redirect('back');
    }
};

// Show details of a single campground.
module.exports.showCampground = async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

// Render the form to edit an existing campground.
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

// Update an existing campground.
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    campground.website = req.body.campground.website;

    await campground.save();

    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }

    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
};

// Delete an existing campground.
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}