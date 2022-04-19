const bigPromise = require('../middleware/bigPromise');
const User = require('../models/users');
const CustomError = require('../utils/customError');
const jwt = require('jsonwebtoken')

exports.isLoggedIn = bigPromise(async(req , res , next)=>{
    
    //extracting token if in browser than from cookies or for mobile we will be using bearer
    const token = req.cookies.token || req.header('Authorization').replace("Bearer " , "");

    if(!token){
        return next(new CustomError('Invalid access please login.'))
    }

    // finding to which user this token has been assigned
    const decoded = jwt.verify(token , process.env.JWT_SECRET);

    //as we have provided id in the token for that we will be finding user with the help of that id only
    req.user = await User.findById(decoded.id);
    //by req.user we are injecting user data into the req.

    next()
})

exports.customRole = (...roles) =>{
    return (req , res , next)=>{
        if(!roles.includes(req.user.role)){ // req.user.role --> this will come from db the user who has been loggedIn
            return next(new CustomError('Unauthorized access' , 402)) //...roles -> this is coming from the admin routes
        }
        next();
    }
}