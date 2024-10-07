// This module exports controller functions for handling user authentication and account management.
// Includes registration, login, and logout functionality for users.
const User = require('../models/user.js');

// Renders the registration page for new users.
module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

// Registers a new user, handles errors, and logs the user in upon successful registration.
module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash('success', 'Welcome to CampMate!');
            res.redirect('/campgrounds');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
};

// Renders the login page for existing users.
module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};

// Logs in an existing user, redirects to the original destination or campgrounds page.
module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

// Logs out the current user, redirects to the campgrounds page.
module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
};
