var express = require("express"),
app = express.Router(), // instead of app = express()
Recipe = require("../models/recipe"),
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



//========================recipe routes=====================//

app.get("/",function(req,res){
   res.render("home")
})

app.get("/recipe",function(req,res){
    Recipe.find({},function(err,recipe){
        if(err){console.log("error here")}else{
            res.render("recipe",{recipe:recipe})
        }
    })
})

app.get("/recipe/new",isLogged,function(req,res){
    res.render("recipeform")
})

app.post("/recipe",isLogged,function(req,res){
    var data = req.body.recipe
    data.author= {id:req.user._id,username:req.user.username}
    console.log(data)
    Recipe.create(data,function(err){
        if(err){console.log("error at create recipe")}
        else{
            req.flash("success","created recipe")
            res.redirect("/recipe")
        }
    })
})
app.get("/recipe/:id",isLogged,function(req, res) {
   Recipe.findById(req.params.id).populate("comments").exec(function(err,recipe){
       if(err || !recipe){
           console.log("error")
           req.flash("error","webpage not found")
           res.redirect("back")
       }else{
           console.log(recipe)
           console.log(req.user.username)
           res.render("show",{recipe:recipe})
       }
   })
})


app.get("/recipe/:id/edit",isRecipeOwner,function(req,res){
   Recipe.findById(req.params.id,function(err,recipe){
       if(err){console.log("error")}else{
           res.render("editform",{recipe:recipe})
       }
   })    
})
app.put("/recipe/:id",isRecipeOwner,function(req,res){
    Recipe.findByIdAndUpdate(req.params.id,req.body.recipe,function(err){
        if(err ){
            console.log("error")
            req.flash("error","webpage not found")
        }else{
            req.flash("success","successfully edited recipe")
            res.redirect("/recipe/"+req.params.id)
        }
    })
})

app.delete("/recipe/:id",isRecipeOwner,function(req,res){
    Recipe.findByIdAndRemove(req.params.id,function(err){
    if(err ){
        console.log("error")
        req.flash("error","webpage not found")
        res.redirect("back")
    }else{
        req.flash("success","deleted recipe")
        res.redirect("/recipe")
    }
    })
})


module.exports = app