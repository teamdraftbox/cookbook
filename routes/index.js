var express = require("express"),
app = express.Router(),
User = require("../models/user"),
passport = require("passport"),
Recipe = require("../models/recipe"),
Comments = require("../models/comment")
User = require("../models/user")
function isLogged(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }else{
        req.flash("error","login to access content")
        res.redirect("/login")
    }
}

function isRecipeOwner(req,res,next){
    if(req.isAuthenticated()){
        Recipe.findById(req.params.id,function(err, recipe) {
            if(err || !recipe){
                 console.log("error")
                req.flash("error","web page not found")
                res.redirect("back")
            }else{
                if(recipe.author.id.equals(req.user._id)){
                    return next()
                }else{
                    console.log("unautherized")
                    req.flash("error","unauthorized action")
                    res.redirect("back")
                }
            }
        })
    }else{
        req.flash("error","login to access content")
        res.redirect("login")
    }
}

function isCommentsOwner (req,res,next){
    if(req.isAuthenticated()){
        Recipe.findById(req.params.id,function(err, found) {
            if(err || !found){
                req.flash("error","web page not found")
                res.redirect("back")
            }else{
                Comments.findById(req.params.comments_id,function(err,comment){
            if(err || !comment){
               req.flash("error","comments not found")
                res.redirect("back")}else{
                if(comment.author.id.equals(req.user._id)){
                    return next()
                }else{
                   req.flash("error","unautherized action")
                    res.redirect("back")
                }
            }
        })
            }
        })
        
    }else{
         req.flash("error","login to access content")
        res.redirect("/login")
    }
}
//=============================Athentication=========================//
app.get("/register",function(req, res) {
    res.render("register")
})

app.post("/register",function(req, res) {
    User.register(new User({username:req.body.username}),req.body.password,function(err){
        if(err){
            console.log("error")
        }else{
            passport.authenticate("local")(req,res,function(){
            req.flash("success","welcome to cook book")
             res.redirect("/recipe")
            })
        }
    })
})

app.get("/login",function(req,res){
    res.render("login")
})

app.post("/login",passport.authenticate("local",{successRedirect:"/recipe",failureRedirect:"/login"}),function(req,res){
  
})

app.get("/logout",function(req,res){
    req.logout()
    req.flash("success","logged out")
    res.redirect("/")
})

module.exports = app
