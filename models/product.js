const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true , "please provide product name."],
        trim:true,
        maxlength:[120 , "product name shold be 120 in length."]
    },
    price:{
        type:Number,
        required:[true , "please provide product price."],
        trim:true,
        maxlength:[10 , "product price shold be 10 in length."]
    },
    description:{
        type:String,
        required:[true , "please provide product description."],
    },
    photos:[
        {
            id:{
                type:String,
                required:[true , "product images are required."]
            },
            secure_url:{
                type:String,
                required:[true , "secure url missing."]
            }
        }
    ],
    category:{
        type:String,
        required:[true , "please select category from short-sleeves , long-sleeves , sweat-shirts , hoodies.."],
        enum:{
            values:[
                "shortsleeves",
                "longsleeves",
                "sweatshirts",
                "hoodies"
            ],
            message:"please select category from short-sleeves , long-sleeves , sweat-shirts , hoodies"
        }
    },
    brand:{
        type:String,
        required:[true , "please add a brand for clothing,"]
    },
    ratings:{
        type:Number,
        default:0,
    },
    numberOfReviews:{
        type:Number,
        default:0,
    },
    reviews:[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref:'User', //-> this name should be same as the User document,
                require:true
            },
            name:{
                type:String,
                required:true
            },
            rating:{
                type:Number,
                required:true
            },
            comment:{
                type:String,
                required:true
            }
        }],
    user:{ // person who has added the product
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }

})

module.exports = mongoose.model("Product" , productSchema);