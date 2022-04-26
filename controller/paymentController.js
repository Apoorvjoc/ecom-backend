const bigPromise = require("../middleware/bigPromise");

exports.sendStripeKey = bigPromise(async(req , res , next)=>{
    res.status(200).json({
        // stripeKey:process.env.ST 
    })
})