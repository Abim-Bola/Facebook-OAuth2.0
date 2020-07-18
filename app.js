//jshint esversion:6
//require all depencies
const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const md5 = require("md5");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
const passportLocal = require("passport-local");
const passportLocalMongoose= require("passport-local-mongoose");
// const = require("");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session
({ secret: 'keyboard cat', 
    resave: false, 
    saveUninitialized: false }));

app.use(passport.initialize());
app.use(passport.session());


//connect to db
mongoose.connect("mongodb://localhost:27017/customerdb", { useUnifiedTopology: true, useNewUrlParser: true }
);
mongoose.set("useCreateIndex", true);


//create schema 
const customerSchema = new mongoose.Schema ({
username: String,
password: String
}); 

customerSchema.plugin(passportLocalMongoose);




//create collection for db
const User = new mongoose.model("User", customerSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get("/", function(req, res){
    res.render("home");
    });

app.get("/register", function(req, res){
res.render("register");
});

app.get("/secrets", function(req, res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/register");
    }
    });



app.post("/register", function(req, res) {

User.register({username: req.body.username}, req.body.password, function(err, user){

    if(err) {
        console.log(err);
        res.redirect("/register");
    } else {
        passport.authenticate("local")(req, res, function(){
            res.redirect("/secrets");
        });
    }
});

});

app.post("/login", function(req, res){
    const newUser = new User({
     username: req.body.username,
     passsword: req.body.password
    });
     req.login(user, function(err){
        if(err){
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local"), (req,res, function(){
            res.render("/secrets");
            });
        }
     });
});

app.get("/login", function(req, res){
    res.render("login");
    });







app.listen("4000", function(){
console.log("Started Server");
});
