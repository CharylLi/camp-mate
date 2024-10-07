const Campground = require('../models/campground');
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });


module.exports.index = async (req, res) => {
    const { search, sort } = req.query;
    let campgrounds = await Campground.find({});

    // Handle search by title or location
    if (search) {
        campgrounds = await Campground.find({
            $or: [
                { title: new RegExp(search, 'i') },  // Search by title (case-insensitive)
                { location: new RegExp(search, 'i') }  // Search by location (case-insensitive)
            ]
        });
    }

    // Handle sorting
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

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

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

module.exports.createCampground = async (req, res, next) => {
    try {
        // Use the location input from the form
        const location = req.body.campground.location;

        // Make a request to the Mapbox Geocoding API
        const geoData = await geocoder.forwardGeocode({
            query: location,  // Pass the location from the form
            limit: 1  // We only want the first result
        }).send();

        // Check if Mapbox returns valid geometry
        if (!geoData.body.features.length) {
            req.flash('error', 'Invalid location. Please provide a valid location.');
            return res.redirect('back');
        }

        // Log the response from Mapbox to see what is being returned
        console.log('Geocoding data:', geoData.body.features[0].geometry);

        // Create a new campground with the form data and set the geometry field from Mapbox
        const campground = new Campground(req.body.campground);
        campground.geometry = geoData.body.features[0].geometry;

        // Add images and author
        campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
        campground.author = req.user._id;

        // Save the campground to the database
        await campground.save();

        // Redirect and show success message
        req.flash('success', 'Successfully created a new campground!');
        res.redirect(`/campgrounds/${campground._id}`);
    } catch (error) {
        // Handle errors
        console.error('Error creating campground:', error);
        req.flash('error', 'Something went wrong, please try again.');
        res.redirect('back');
    }
};

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

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}