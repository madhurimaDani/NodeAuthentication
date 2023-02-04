//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const md5 = require("md5");
// const encrypt = require("mongoose-encryption");
const bcrypt = require("bcrypt");
const saltRounds = 10;


const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

console.log(process.env.API_KEY);
console.log(process.env.SECRET);

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// const secret = "Thisisourlittlesecret.";
// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("home");
});

app.route("/register")

.get(function(req, res){
    res.render("register");
})

.post(function(req, res){

    bcrypt.hash(req.body.password, saltRounds, function(err, hash){
        const newUser = new User({
            email: req.body.username,
            password: hash
        });

        newUser.save(function(err){
            if(!err){
                res.render("secrets");
            }else{
                res.status(500).send("Error while registering /n" + err);
            }
        });
    });
});

app.route("/login")

.get(function(req, res){
    res.render("login");
})

.post(function(req, res){
    const username = req.body.username;
    const password = req.body.password;

    // User.findOne({$and: [{email: req.body.username}, {password: md5(req.body.password)}]}, function (err, foundUser){
    //     if(!err){
    //         res.render("secrets");
    //     }else{
    //         res.status(401).send("Not Authorized!");
    //     }
    // });

    User.findOne({email: username}, function(err, foundUser){
        if(!err){
            if(foundUser){
                bcrypt.compare(password, foundUser.password, function (err, result){
                    if(result === true){
                        res.render("secrets");
                    }else{
                        res.status(401).send("Unauthorized!");
                    }
                });
            }else{
                res.status(401).send("Unauthorized!");
            }
        }else{
            res.status(401).send("Unauthorized!");
        }
    });

});








app.listen(3000, function(){
    console.log("Server started on port 3000....");
})
