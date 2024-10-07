// This file exports a utility function (catchAsync) to handle asynchronous errors in routes.
// It wraps asynchronous route handlers and automatically passes any errors to the next
// middleware (error handler).
module.exports = (func) => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    };
};
