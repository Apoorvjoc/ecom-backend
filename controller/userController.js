const bigPromise = require('../middleware/bigPromise');
const User = require('../models/users');
const cookieToken = require('../utils/cookieToken');
const cloudinary = require("cloudinary");
const CustomError = require('../utils/customError');
const mailHelper = require('../utils/emailHelper');
const crypto = require('crypto')
// const users = require('../models/users');

exports.signup = bigPromise(async(req , res , next)=>{

        //checking for the images
        // console.log("body: "+req.body);

        if(!req.files){
            return next(new CustomError("please provide your image " , 400));
        }

        const {name , email , password , mobile} = req.body;

        console.log(name , email , password , mobile);

        if(!email || !password || !name || !mobile){
            return next(new CustomError("name, email , password , mobile  are required" , 400));
        }
        // console.log("Before upload..");
        
        let file = req.files.photo;
        let result;
        try {
            result =  await cloudinary.v2.uploader.upload(file.tempFilePath , {
                folder:"users",
                width:150,
                crop:"scale"
            })
        } catch (error) {
            console.log("CLOUDINARY ERROR: "+error);
        }

        // console.log("after upload..");
        console.log("result: "+result);

        const user = await User.create({
            name , email , password, mobile,
            photo:{
                id: result.public_id,
                secure_url:result.secure_url
            }
        })

        cookieToken(user , res , "User signup successfull.");

        console.log(user);
})

exports.login = bigPromise(async(req , res , next)=>{
    const {email , password} = req.body;

    //checking for email and password
    if(!email || !password){
        return next(new CustomError('please provide email and password' , 400));
    }

    //finding email in db
    const user = await User.findOne({email}).select("+password") // this select is for hmne phle define kiya hai ki password select none in model so usko lane ke liye

    //if user does not match
    if(!user){
        return next(new CustomError('User not registered'));
    }

    //comparing password
    const validatedPassword = await user.isValidatedPassword(password);

    //if password not matched
    if(!validatedPassword){
        return next(new CustomError('email or password incorrect.'))
    }

    //generating token if all of the above conditions are checked.
    cookieToken(user , res , "user logged in successfully.");
})

exports.logout = bigPromise(async(req , res , next)=>{
    res.cookie("token" , null , {
        expires: new Date(Date.now()),
        httpOnly:true,
    })
    res.status(200).json({
        success:true,
        message:"logout Successfull"
    })
})

exports.forgotPassword = bigPromise(async(req , res , next)=>{

    const {email} = req.body;

    if(!email){
        return next(new CustomError('Please provide email..' , 400))
    }

    const userExists = await User.findOne({email});

    if(!userExists){
        return next(new CustomError('This User does not exists' , 400))
    }

    const forgotToken = userExists.getForgotPassword();

    await userExists.save({validateBeforeSave:false}) //here we are not providing with all of the fields therefore we will are passing this flag of false.
    
    const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`

    const message = `Please copy paste this link in your browser: \n\n ${myUrl}`

    try {

        let options = {
            email : userExists.email,
            subject:"AJ Store -- password reset email ",
            message,
            myUrl
        }

        await mailHelper(options)

        res.status(200).json({
            success:true,
            message:"email sent sucessfully."
        })
    } catch (error) {
        //if email not send properly
        userExists.forgotPasswordToken = undefined
        userExists.forgotPasswordExpirey = undefined
        await userExists.save({validateBeforeSave:false})

        return next(new CustomError("ERROR IN MAIL SEND IN FORGOT PASSWORD: "+error.message , 500))
    }

})

exports.forgotPasswordReset = bigPromise(async(req , res , next)=>{
    const token = req.params.token;

    const encyToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
    
    const user = await User.findOne({
        encyToken , //finding the encrypted token in the db
        forgotPasswordExpirey:{$gt : Date.now()} // if token is not expired means expire time is more than than curr time.
    })

    if(!user){
        return next(new CustomError("Invalid token or expired." , 400))
    }

    //now at this stage we will be changing the password.
    if(req.body.password !== req.body.confirmPassword){
        return next(new CustomError('Password must me same.' , 400))
    }

    user.password = req.body.password;

    //after chnaging the password these fields should be marked as undefined.
    user.forgotPasswordToken = undefined
    user.forgotPasswordExpirey = undefined

    await user.save()

    user.password = undefined

    res.status(200).json({
        success:true,
        message:"Password updated successfully.",
        user
    })

})

exports.getLoggedInUserDetails = bigPromise(async(req , res , next)=>{
    let user = await User.findById(req.user.id);//extracting this req.body from that middleware which was injecting the values in between(req.body) part in middleware. 

    if(!user){
        return next(new CustomError('You are not loged in..'))
    }

    res.status(200).json({
        success:true , 
        user
    })
})

exports.changePassword = bigPromise(async(req , res , next)=>{

    //if user is loged in then only we will we performing this task 
    const userId = (req.user.id); // this is again coming from the data we have injected in the middleware

    //searching user in db
    const user = await User.findById(userId).select("+password");

    //validating old password
    const isOldPasswordCorrect = await user.isValidatedPassword(req.body.oldPassword);

    if(!isOldPasswordCorrect){
        return next(new CustomError('Entered old password is incorrect..',400))
    }

    //is user entered correct old password then check password and confirm password
    if(req.body.password !== req.body.confirmPassword){
        return next(new CustomError('confirm password and password must be same..',400))
    }

    //if both are same then set the password in db
    user.password = req.body.password

    //SAVE PASSWORD IN DB
    const isSaved = await user.save();

    // console.log("is saved: "+isSaved);

    cookieToken(user , res , "password changed successfully..");

})

exports.updateUserDetails = bigPromise(async(req , res , next)=>{

    if(!req.body.name || !req.body.email || !req.body.mobile){
        return next(new CustomError("All fields are mandatory.." , 400))
    }

    //updating name and email.
    const updatedData = {
        name : req.body.name,
        email:req.body.email,
        mobile:req.body.mobile
    }

    //if user want's to update its photo
    if(req.files){
        //searching for the user.
        const user = await User.findById(req.user.id);

        //now finding photo corresponding to that user.
        const imageId = await user.photo.id;

        //deleting image from the cloudinary
        await cloudinary.v2.uploader.destroy(imageId); // here we are deteting img just by its id no need to give path it will find the path of its own.
        
        //uploading the new photo
        const result = await cloudinary.v2.uploader.upload(req.files.photo.tempFilePath,{
            folder:"users",
            crop:"scale",
            width:150
        })

        //providing the the links of image in the db
        updatedData.photo = {
            id:res.public_id,
            secure_url:result.secure_url,
        }

    }

    const options = {
        new : true,   //it returns modified doucument instead of old document
        runValidators: true, // it runs all the check
        useFindAndModify:false
    }

    const user = await User.findByIdAndUpdate(req.user.id , updatedData , options)

    res.status(200).json({
        success:true,
        message:"User Details updated successfully.."
    })

})

//admin routes..
exports.adminAllUsers = bigPromise(async(req , res , next)=>{
    const users = await User.find();

    res.status(200).json({
        success:true,
        users,
    })
})

//this route is when admin click on the user when placed in the table he can see the details.
exports.adminGetOneUser = bigPromise(async(req , res , next)=>{
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new CustomError('Cannot find user.' , 400));
    }

    res.status(200).json({
        success:true,
        user
    })
})

exports.adminUpdateUser = bigPromise(async(req , res , next)=>{
    let newName , newEmail , newMobile , newRole;

    const oldUserId = req.params.id;
    const oldUser = await User.findById(oldUserId);

    if(!oldUser){
        return next(new CustomError('User does not exists.' , 400))
    }

    if(!req.body.name){
       newName = oldUser.name
    }else{
        newName = req.body.name
    }

    if(!req.body.email){
        newEmail = oldUser.email
    }else{
        newEmail=req.body.email
    }

    if(!req.body.mobile){
        newMobile = oldUser.mobile
    }else{
        newMobile = req.body.mobile
    }

    if(!req.body.role){
        newRole = oldUser.role
    }else{
        newRole = req.body.role
    }

    const newData = {
        name: newName,
        email: newEmail,
        mobile:newMobile,
        role: newRole // provding dropdown will be better idea for this 
    }

    const user = await User.findByIdAndUpdate(req.params.id , newData , {
        new: true,
        runValidators:true,
        useFindAndModify:false,
    })

    res.status(200).json({
        success:true,
        message:"user updated successfully",
        user,
        oldUser
    })
})

exports.adminDeleteUser = bigPromise(async(req , res , next)=>{

    const user = await User.findById(req.params.id);

    if(!user){
        return next(new CustomError("user does not exists.." , 401));
    }

    const imageId = user.photo.id

    await cloudinary.v2.uploader.destroy(imageId);

    await user.remove();

    res.status(200).json({
        success:true,
        message:"user deleted successfully."
    })

})



//misc
exports.salesAllUsers = bigPromise(async(req , res , next)=>{
    const users = await User.find({role:"user"}).select('name , mobile , email')

    res.status(200).json({
        success:true,
        users,
    })

})

