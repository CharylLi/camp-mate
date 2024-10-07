if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const MongoStore = require('connect-mongo');
const dbUrl = process.env.DB_URL;

const usersRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

mongoose.connect(dbUrl);

// MongoDB connection error and success handling
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

const app = express();

// Set EJS as the view engine with ejsMate for layouts and set views directory
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'assets')));

// Middleware to parse form data, use method override for PUT/DELETE, and serve static files
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Configure session settings, including a cookie that lasts for 7 days
const sessionConfig = {
    // name = 'session',
    secret: 'bettersecret',
    resave: false,
    savaUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
};

// Use MongoDB to store sessions, updating them once per day, with additional security
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret',
    },
});

// Use session and flash for session-based messages
app.use(session(sessionConfig));
app.use(flash());

// Initialize Passport for user authentication, using the local strategy with MongoDB
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global middleware to make current user and flash messages available to all templates
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Route setup for users, campgrounds, and reviews
app.use('/', usersRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

// Home route
app.get('/', (req, res) => {
    res.render('home');
});

// Catch-all route for handling 404 errors
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

// Global error handler that renders an error page with the error message and status code
app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err;
    if (!err.message) err.message = 'Oh no, something went wrong';
    res.status(statusCode).render('error', {
        err,
    });
});

app.listen(3000, () => {
    console.log('Serving on port 3000');
});
