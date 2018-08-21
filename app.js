//=====================SETUP===============================//
var express = require("express"),
mongoose = require("mongoose"),
bodyParser = require("body-parser"),
override = require("method-override"),
Recipe=require("./models/recipe.js"),
Comments = require("./models/comment.js"),
User = require("./models/user"),
seedDB = require("./seed.js"),
passport = require("passport"),
passportlocal = require("passport-local"),
passportlocalmongoose = require("passport-local-mongoose"),
flash = require("connect-flash"),
recipe = require("./routes/recipe"),
comments = require("./routes/comments"),
user = require("./routes/index")


mongoose.connect("mongodb://localhost/tials")
var app = express()
app.use(bodyParser.urlencoded({extended:true}))
app.use(override("_method"))
app.set("view engine","ejs")
//seedDB()
app.use(flash())
app.use(require("express-session")({
    secret:"secret message random",
    resave:false,
    saveUninitialized:false
}))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new passportlocal(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use(function(req,res,next){
    res.locals.currentUser = req.user
    res.locals.error = req.flash("error")
    res.locals.success = req.flash("success")
    return next()
})
//==========================routes=======================//
app.use(recipe)
app.use(comments)
app.use(user)
app.listen(process.env.PORT,process.env.IP,function(){
    console.log("connected to cookbook")
})



