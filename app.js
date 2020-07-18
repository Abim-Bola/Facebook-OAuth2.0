//jshint esversion:6
//require all depencies
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const md5 = require("md5");
const bodyParser = require("body-parser");
const passport = require("passport");
const findOrCreate = require('mongoose-findorcreate');
const FacebookStrategy = require("passport-facebook").Strategy;
const session = require("express-session");
const passportLocal = require("passport-local");
const passportLocalMongoose= require("passport-local-mongoose");
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
customerSchema.plugin(findOrCreate);




//create collection for db
const User = new mongoose.model("User", customerSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  //implement facebook strategy

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:4000/auth/facebook/secrets",
    profileFields: ['id', 'displayName', 'photos', 'email']

  },
  function(accessToken, refreshToken, profile, cb) {
      console.log(profile);
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));



app.get("/", function(req, res){
    res.render("home");
    });

app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ["profile"]})
);

app.get("/auth/facebook/secrets",
  passport.authenticate('facebook', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/secrets");
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
