// This schema defines the structure of the User model in the MongoDB database using Mongoose.
// The schema uses 'passportLocalMongoose' to automatically add fields and methods for authentication.
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// Adds username, hash, and salt fields to the schema and includes authentication methods.
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema)