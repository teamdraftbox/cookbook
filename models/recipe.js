

var mongoose = require("mongoose")
var recipeSchema = new mongoose.Schema({
    site:String,
    image:String,
    discription:String,
    date:{type:Date,default:Date.now()},
    comments:[{type:mongoose.Schema.Types.ObjectId,
           ref:"Comments"//comments model name
    }],
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username:String
    }
})

module.exports = mongoose.model("Campsite",recipeSchema)