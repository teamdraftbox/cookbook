var express = require("express"),
app = express.Router({mergeParams:true}),
Recipe= require("../models/recipe"),
Comments = require("../models/comment")

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

//=======================comment routes=================================//
app.get("/recipe/:id/comments/new",isLogged,function(req, res) {
    Recipe.findById(req.params.id,function(err,recipe){
        if(err){console.log("error")}else{
            res.render("commentform",{recipe:recipe})
        }
    })
})

app.post("/recipe/:id/comments",isLogged,function(req,res){
    Recipe.findById(req.params.id,function(err, recipe) {
        if(err){console.log("error at comment add")}else{
           var data = req.body.comments
           data.author = {id:req.user._id,username:req.user.username}
            Comments.create(data,function(err,comments){
                if(err){console.log("error")}else{
                    recipe.comments.push(comments)
                    recipe.save()
                    console.log(recipe)
                    req.flash("success","comment posted successfully")
                    res.redirect("/recipe/"+recipe._id)
                }
            })
        }
    })
})

app.get("/recipe/:id/comments/:comments_id/edit",isCommentsOwner,function(req, res) {
    Comments.findById(req.params.comments_id,function(err,comments){
        if(err || !comments){
            console.log("error")
            req.flash("error","comments not found")
            res.redirect("back")
        }else{
            res.render("editcomments",{comments:comments,id:req.params.id})
        }
    })
})

app.put("/recipe/:id/comments/:comments_id",isCommentsOwner,function(req,res){
   Comments.findByIdAndUpdate(req.params.comments_id,req.body.comments,function(err){
       if(err){console.log("error")}else{
           req.flash("success","successfully edited comments")
           res.redirect("/recipe/"+ req.params.id)
       }
   })
})

app.delete("/recipe/:id/comments/:comments_id",isCommentsOwner,function(req,res){
    Comments.findByIdAndRemove(req.params.comments_id,function(err){
        if(err){console.log("error")}else{
            req.flash("success","deleted comment")
            res.redirect("/recipe/"+ req.params.id)
        }
    })
})

module.exports = app