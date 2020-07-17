//jshint esversion:6
const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const bodyParser = require("body-parser");
// const passport = require("passport");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/customerdb", { useUnifiedTopology: true, useNewUrlParser: true }
);

const customerSchema = ({
username: String,
password: String
}); 

const User = mongoose.model("User", customerSchema);



app.get("/", function(req, res){
    res.render("home");
    });

app.get("/register", function(req, res){
res.render("register");
});



app.post("/register", function(req, res){
    const username = req.body.username;
    const password = req.body.password;
    
    const user = new User({
    username: username,
    password: password
    });
    
    user.save(function(err){
    if(err){
        console.log(err);
    }else{
        res.render("secrets");
    }
});
});

app.post("/login", function(req, res){
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({password: req.body.password}, function(err, foundUser){
        if(err){
            console.log("wrong password");
        }else{
            if(foundUser){
                if(foundUser.password === password){
                    res.render("secrets");
                }
            }
        }
    });
});

app.get("/login", function(req, res){
    res.render("login");
    });







app.listen("4000", function(){
console.log("Started Server");
});
