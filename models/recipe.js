var mongoose    = require("mongoose");

//SCHEMA SETUP (This is the 'blue print' for the model)

var recipeSchema = new mongoose.Schema ({
      
    name: String,
    price: String,
    image: String,
    description: String,
    createdAt: { type: Date, default: Date.now},
    author: {
        
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref:    "User"
        }, 
        username: String
    },
    
   comments: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }
    ],
    
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    rating: {
        type: Number,
        default: 0
    }
    
    });


//COMPILE THE SCHEMA INTO A MODEL (this includes the methods e.g find())

module.exports = mongoose.model("Recipe", recipeSchema);