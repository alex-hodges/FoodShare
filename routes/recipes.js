var express = require("express");
var router = express.Router();
var Recipe = require("../models/recipe");
var Review = require("../models/review");
var middleware = require("../middleware/index.js");


// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//INDEX - show all recipes
router.get("/", function(req, res){
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Recipe.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allRecipes) {
            Recipe.count({name: regex}).exec(function (err, count) {
                if (err) {
                    console.log(err);
                    res.redirect("back");
                } else {
                    if(allRecipes.length < 1) {
                        noMatch = "No recipes match that query, please try again.";
                    }
                    res.render("recipes/index", {
                        recipes: allRecipes,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
                        search: req.query.search
                    });
                }
            });
        });
    } else {
        // get all recipes from DB
        Recipe.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allRecipes) {
            Recipe.count().exec(function (err, count) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("recipes/index", {
                        recipes: allRecipes,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
                        search: false
                    });
                }
            });
        });
    }
});
// CREATE ROUTE - add new recipe to DB
router.post("/", middleware.isLoggedIn, function(req, res) {
    // Get data from form and add to recipes array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc  = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newRecipe = {name: name, price: price, image: image, description: desc, author: author}
    
    //CREATE A NEW CAMPGRUOND AND SAVE TO DATABASE
    
    Recipe.create(newRecipe, function(err, newlyCreated){
        if (err) {
            console.log(err);
        }
        
        //IF SUCCESSFUL IT WILL TAKE US TO THE RECIPES PAGE
        else {
            console.log(newlyCreated);
            res.redirect("/recipes");
        }
    });
});

// NEW - This will show the FORM that will SEND the DATA

router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("recipes/new");
});
// SHOW - This will show further information of one recipe
router.get("/:id", function(req, res){
    //find the campgroudn with provided ID
    Recipe.findById(req.params.id).populate("comments").populate({
       path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec (function(err, foundRecipe){
        if (err || !foundRecipe){
            req.flash("error", "Recipe not found");
            res.redirect("back");
        }
        else {
            console.log(foundRecipe);
            res.render("recipes/show", {recipe: foundRecipe});
        }
    });
}); 

//EDIT 

router.get("/:id/edit", middleware.checkRecipeOwnership, function (req, res) {
    //is the user logged in?
         Recipe.findById(req.params.id, function(err, foundRecipe){
               res.render("recipes/edit", {recipe: foundRecipe});    
          });

    Recipe.findById(req.params.id, function (err, foundRecipe){
        if (err) {
            res.redirect("/recipes")
        } 
        else {
            res.render("recipes/edit", {recipe: foundRecipe});
        } 
    });
});

//UPDATE
router.put("/:id", middleware.checkRecipeOwnership ,function(req, res){
    delete req.body.recipe.rating;
   //find and update recipe
Recipe.findByIdAndUpdate(req.params.id, req.body.recipe, function(err, updatedRecipe){
    if (err){
        res.redirect("/recipes");
    }
    else {
        res.redirect("/recipes/" + req.params.id);
    }
});
    
});

//DELETE ROUTE 

router.delete("/:id", middleware.checkRecipeOwnership, function (req, res) {
    Recipe.findById(req.params.id, function (err, recipe) {
        if (err) {
            res.redirect("/recipes");
        } else {
            // deletes all comments associated with the recipe
            Comment.remove({"_id": {$in: recipe.comments}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/recipes");
                }
                // deletes all reviews associated with the recipe
                Review.remove({"_id": {$in: recipe.reviews}}, function (err) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/recipes");
                    }
                    //  delete the recipe
                    recipe.remove();
                    req.flash("success", "Recipe deleted successfully!");
                    res.redirect("/recipes");
                });
            });
        }
    });
});



module.exports = router;