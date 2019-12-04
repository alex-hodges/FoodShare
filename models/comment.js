var mongoose = require("mongoose");

//SCHEMA ALWAYS ADDED AS A VARIABLE FIRST

var commentSchema = mongoose.Schema ({
    text: String,
    createdAt: { type: Date, default: Date.now},
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
    }
});
// FIRST THE NAME OF MODEL ("Comment") then the schema
module.exports = mongoose.model("Comment", commentSchema);