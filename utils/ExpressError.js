// This file defines a custom error class (ExpressError) that extends the built-in JavaScript Error class.
// It allows for more specific error messages and status codes in the application.
class ExpressError extends Error {
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;
