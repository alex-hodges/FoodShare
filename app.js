// REQUIRING EXPRESS - WHEN THERE IS A FUNCTION() IT KIND OF MEANS THAT COMES BACK.
var express     = require("express"),
// SETTING VAR APP AS EXPRESS
    app             = express(),
// REQUIRING OTHER JSON PACKAGE DEPENDENCES    
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    flash           = require("connect-flash"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    methodOverride  = require("method-override"),
    Recipe      = require("./models/recipe"),
    Comment         = require("./models/comment"),
    User            = require("./models/user"),
    seedDB          = require("./seeds");


var commentRoutes = require("./routes/comments"),
    reviewRoutes    = require("./routes/reviews"),
    recipeRoutes = require("./routes/recipes"),
    indexRoutes      = require("./routes/index");
 
//Connects to MongoDB
mongoose.connect(process.env.DATABASEURL, {useNewUrlParser: true, useUnifiedTopology: true});

//in order to read HTTP POST data , we have to use "body-parser" node module. body-parser is a piece of express middleware that reads a form's input and stores it as a javascript object accessible through req.body.
app.use(bodyParser.urlencoded({extended: true}));
//Sets ejs as the view engine
app.set("view engine", "ejs");
//To serve static files such as images, CSS files, and JavaScript files, use the express.static built-in middleware function in Express.
app.use(express.static(__dirname + "/public"));
app.use(flash());
// method override for use in forms where we need a PUT or DELETE request
app.use(methodOverride("_method"));
//SeedDB gives us data to work with whilst removing previous data.
//seedDB();


app.locals.moment = require("moment");

 // PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "I am the greatest",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); //User.authenticate comes with passport local mongoose
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    //whatever is in res.locals will be available in our template
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

//THIS DRYs the code. FOR SHORTER ROUTE DECLARATIONS
app.use("/", indexRoutes);
app.use("/recipes", recipeRoutes);
app.use("/recipes/:id/comments", commentRoutes);
app.use("/recipes/:id/reviews", reviewRoutes);

//SERVER 
app.listen(process.env.PORT, process.env.IP,function() {
    console.log("Server started, listening on port " + process.env.PORT);
});
