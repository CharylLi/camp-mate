// This file defines routes for handling user-related actions.
const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users');

// Route to render the registration form and register a new user.
router.route('/register').get(users.renderRegister).post(catchAsync(users.register));

// Route to render the login form and handle login logic
router
    .route('/login')
    .get(users.renderLogin)
    .post(
        storeReturnTo,
        passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
        users.login
    );

// Route to log the user out
router.get('/logout', users.logout);

module.exports = router;
