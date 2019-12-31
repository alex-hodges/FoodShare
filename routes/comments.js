var express = require("express");
var router = express.Router({
    mergeParams: true
});
var Recipe = require("../models/recipe");
var Comment = require("../models/comment");
var middleware = require("../middleware/index.js");

//=======================
//COMMENTS ROUTES
//======================= 

router.get("/new", middleware.isLoggedIn, function (req, res) {
    Recipe.findById(req.params.id, function (err, recipe) {
        if (err) {
            console.log(err)
        } else {
            res.render("comments/new", {
                recipe: recipe
            });
        }
    });
});
//COMMENT POST ROUTE (CREATE)
router.post("/", middleware.isLoggedIn, function (req, res) {
    Recipe.findById(req.params.id, function (err, recipe) {
        if (err) {
            console.log(err);
            res.redirect("/recipes");
        } else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    req.flash("error", "something went wrong");
                    console.log(err);
                } else {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;

                    //save comment
                    comment.save();
                    recipe.comments.push(comment);
                    recipe.save();
                    console.log(comment);
                    req.flash("success", "Successfully added comment");
                    res.redirect('/recipes/' + recipe._id);
                }
            });
        }
    });
});
//EDIT ROUTE

router.get("/:comment_id/edit", middleware.checkCommentOwnership, function (req, res) {
    Recipe.findById(req.params.id, function (err, foundRecipe) {
        if (err || !foundRecipe) {
            req.flash("error", "Recipe not found");
            return res.redirect("back");
        }

        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err) {
                res.redirect("back");
            } else {
                res.render("comments/edit", {
                    recipe_id: req.params.id,
                    comment: foundComment
                });
            }
        });
    });
});

//UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/recipes/" + req.params.id);
        }
    });
});

//COMMENT DESTROY/DELETE

router.delete("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err) {
            res.redirect("back");
        } else {
            req.flash("success", "You have successfully deleted comment")
            res.redirect("/recipes/" + req.params.id);
        }
    });

});

module.exports = router;
