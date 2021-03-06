var mongoose = require("mongoose");
//FOR AUTHENTICATION MODEL
//=======================
var passportLocalMongoose = require("passport-local-mongoose");
//=======================
var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: String,
    avatar: String,
    firstName: String,
    lastName: String,
    email: {
        type: String,
        unique: true,
        required: true
    },
    biography: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isAdmin: {
        type: Boolean,
        default: false
    }
});
//====================== 
UserSchema.plugin(passportLocalMongoose);
//=======================
module.exports = mongoose.model("User", UserSchema);
