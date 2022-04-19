const bigPromise = require("../middleware/bigPromise");

exports.home = bigPromise((req , res)=>{
    res.status(200).json({
        success:true,
        greetings:"Hello from home API"
    })
})

// exports.homeDummy = async(req , res)=>{
//     try {
//         res.status(200).json({
//             success:true,
//             greetings:"Hello from home API"
//         })
//     } catch (error) {
//         console.log("error");
//     }
// }